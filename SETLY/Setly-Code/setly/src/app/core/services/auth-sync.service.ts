import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { AuthStore } from '../state/auth.store';
import { ProfileStore } from '../state/profile.store';
import { firstValueFrom } from 'rxjs';
import { UserStore } from '../state/user.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthSyncService {
  private af = inject(Auth);
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private profileStore = inject(ProfileStore);
  private userStore = inject(UserStore);
  private initialized = false;
  private heartbeatHandle: any;
  private heartbeatFailures = 0;
  private heartbeatIntervalMs = 20_000; // adaptive

  init() {
    if (this.initialized) return;
    this.initialized = true;
    onAuthStateChanged(this.af, async (fbUser: User | null) => {
      if (!fbUser) {
        this.authStore.setLoggedOut();
        this.profileStore.hydrate(null, 0, null); // clear
        this.stopHeartbeat();
        return;
      }
      try {
        const idToken = await fbUser.getIdToken(true);
        console.debug('[AuthSync] Firebase user UID:', fbUser.uid, 'Token length:', idToken?.length);
        // Prefer configured API base or relative proxy path
        const base = (environment?.apiBaseUrl || '').replace(/\/$/, '');
        const url = base ? `${base}/auth/sync` : '/api/auth/sync';
        const res = await firstValueFrom(
          this.http
            .post<{ user: any; profile: any; completion: number; verifications?: any; isNew?: boolean }>(
              url,
              { idToken },
              { headers: { Authorization: `Bearer ${idToken}` } }
            )
            .pipe(timeout(3000))
        );
        this.authStore.setUser({
          userId: res.user.userId,
          email: res.user.email,
          phone: res.user.phone,
          displayName: res.user.displayName || fbUser.displayName || 'New User',
          avatarUrl: res.user.photoUrl || fbUser.photoURL || undefined,
          provider: res.user.provider,
          isNew: !!res.isNew,
        });
        // Merge with any locally saved quick-capture patch and/or durable cache if backend hasn't reflected it yet
        let mergedProfile = res.profile;
        try {
          const uid = res.user.userId || fbUser.uid;
          const lastRaw = localStorage.getItem(`qc.lastPatch.${uid}`);
          const cacheRaw = localStorage.getItem(`profile.cache.${uid}`);
          if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            mergedProfile = { ...mergedProfile, ...cache };
          }
          if (lastRaw) {
            const patch = JSON.parse(lastRaw);
            mergedProfile = { ...mergedProfile, ...patch };
          }
        } catch {}
        this.profileStore.hydrate(mergedProfile, res.completion, res.verifications || null);
        // Ensure legacy UserStore is hydrated for header/profile fallbacks
        try { await this.userStore.refresh(); } catch {}
        this.emitToast(res.isNew ? `Welcome to Setly, ${res.user.displayName || 'there'}!` : `Welcome back, ${res.user.displayName || 'there'}!`);
        // Begin presence heartbeat (immediate + interval)
        this.startHeartbeat();
      } catch (e: any) {
        const errorMsg = e?.status === 500 ? 'Backend temporarily unavailable' : (e?.error?.error || e?.message || 'Connection failed');
        console.warn('[AuthSync] Backend sync failed - using Firebase user data only:', errorMsg);
        // Graceful degrade: hydrate stores from Firebase user so app remains usable even without backend
        try {
          this.authStore.setUser({
            userId: fbUser.uid,
            email: fbUser.email ?? undefined,
            phone: (fbUser as any).phoneNumber ?? undefined,
            displayName: fbUser.displayName || 'New User',
            avatarUrl: fbUser.photoURL || undefined,
            provider: fbUser.providerData?.[0]?.providerId || 'firebase',
            isNew: false,
          });
          // Start with a minimal local profile
          let fallbackProfile: any = {
            userId: fbUser.uid,
            displayName: fbUser.displayName || undefined,
            avatarUrl: fbUser.photoURL || undefined,
            about: '',
            interests: [],
            languages: [],
            socials: {},
            visibility: { publicProfile: true, showCity: true, showSchool: false },
            location: '',
          };
          // Merge in durable cache and last known patch so returning users see their info immediately
          try {
            const cacheRaw = localStorage.getItem(`profile.cache.${fbUser.uid}`);
            if (cacheRaw) fallbackProfile = { ...fallbackProfile, ...JSON.parse(cacheRaw) };
            const lastRaw = localStorage.getItem(`qc.lastPatch.${fbUser.uid}`);
            if (lastRaw) fallbackProfile = { ...fallbackProfile, ...JSON.parse(lastRaw) };
          } catch {}
          this.profileStore.hydrate(
            fallbackProfile,
            0,
            {
              emailVerified: !!fbUser.email,
              phoneVerified: !!(fbUser as any).phoneNumber,
              eduVerified: false,
              idVerified: false,
            }
          );
        } catch {}
        // Show a friendlier, contextual toast
        const backendError = e?.error?.error || e?.error?.message || e?.message || '';
        if (backendError === 'admin-not-configured') {
          this.emitToast('Connected to Google. Local auth sync is not configured.', 'success');
        } else {
          this.emitToast('Signed in with Google. Sync will retry in background.', 'success');
        }
        // Begin presence heartbeat even if sync failed (dev/offline-friendly)
        this.startHeartbeat();
      }
    });
  }

  private emitToast(message: string, type: 'success' | 'error' = 'success') {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }));
  }

  private async sendHeartbeatOnce() {
    try {
      if (environment?.featureFlags?.disablePresenceHeartbeat) return; // disabled via flag
      const fbUser = this.af.currentUser as User | null;
      const base = (environment?.apiBaseUrl || '').replace(/\/$/, '');
      const debugQuery = environment?.featureFlags?.presenceDebug ? '?debug=1' : '';
      const url = base ? `${base}/presence/heartbeat${debugQuery}` : `/api/presence/heartbeat${debugQuery}`;
      let headers: any = {};
      if (fbUser) {
        try {
          const tok = await fbUser.getIdToken(false);
          headers = { Authorization: `Bearer ${tok}` };
        } catch {}
      }
      const res: any = await firstValueFrom(this.http.post(url, {}, { headers }));
      // success resets failures & (if slowed) restore faster cadence
      if (this.heartbeatFailures > 0) {
        this.heartbeatFailures = 0;
        if (this.heartbeatIntervalMs !== 20_000) {
          this.heartbeatIntervalMs = 20_000;
          this.restartHeartbeatInterval();
        }
      }
      // Emit status event with optional meta
      const detail: any = { status: 'ok', intervalMs: this.heartbeatIntervalMs };
      if (res?.meta) detail.meta = res.meta;
      window.dispatchEvent(new CustomEvent('presence-status', { detail }));
    } catch (e: any) {
      this.heartbeatFailures++;
      // Only log on first failure or milestone failures to reduce console spam
      if (this.heartbeatFailures === 1) {
        console.info('[AuthSync] Presence heartbeat failed (backend may not be running) - will retry');
      }
      // escalate interval after a few consecutive failures to reduce backend pressure
      if (this.heartbeatFailures === 3) {
        this.heartbeatIntervalMs = 60_000; // slow down
        this.restartHeartbeatInterval();
        console.warn('[AuthSync] presence heartbeat temporarily slowed (3 consecutive failures)');
        window.dispatchEvent(new CustomEvent('presence-status', { detail: { status: 'degraded', failures: this.heartbeatFailures, intervalMs: this.heartbeatIntervalMs } }));
      } else if (this.heartbeatFailures === 6) {
        this.heartbeatIntervalMs = 120_000; // further slow
        this.restartHeartbeatInterval();
        console.warn('[AuthSync] presence heartbeat further slowed (6 consecutive failures)');
        window.dispatchEvent(new CustomEvent('presence-status', { detail: { status: 'degraded', failures: this.heartbeatFailures, intervalMs: this.heartbeatIntervalMs } }));
      } else if (this.heartbeatFailures >= 10) {
        this.stopHeartbeat();
        console.error('[AuthSync] presence heartbeat stopped after 10 consecutive failures');
        window.dispatchEvent(new CustomEvent('presence-status', { detail: { status: 'stopped', failures: this.heartbeatFailures } }));
        return;
      }
      // swallow error otherwise – best-effort
    }
  }

  private startHeartbeat() {
    if (environment?.featureFlags?.disablePresenceHeartbeat) {
      this.stopHeartbeat();
      console.info('[AuthSync] presence heartbeat disabled via feature flag');
      window.dispatchEvent(new CustomEvent('presence-status', { detail: { status: 'disabled' } }));
      return;
    }
    this.stopHeartbeat();
    // immediate
    this.sendHeartbeatOnce();
    this.heartbeatHandle = setInterval(() => this.sendHeartbeatOnce(), this.heartbeatIntervalMs);
  }

  private stopHeartbeat() {
    try { clearInterval(this.heartbeatHandle); } catch {}
    this.heartbeatHandle = null;
  }

  private restartHeartbeatInterval() {
    if (environment?.featureFlags?.disablePresenceHeartbeat) return;
    try { clearInterval(this.heartbeatHandle); } catch {}
    this.heartbeatHandle = setInterval(() => this.sendHeartbeatOnce(), this.heartbeatIntervalMs);
  }
}
