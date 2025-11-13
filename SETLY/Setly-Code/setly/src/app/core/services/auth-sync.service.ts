import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, getIdToken, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
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

  init() {
    if (this.initialized) return;
    this.initialized = true;
    onAuthStateChanged(this.af, async (fbUser: User | null) => {
      if (!fbUser) {
        this.authStore.setLoggedOut();
        this.profileStore.hydrate(null, 0, null); // clear
        return;
      }
      try {
        const idToken = await getIdToken(fbUser, true);
        console.debug('[AuthSync] Firebase user UID:', fbUser.uid, 'Token length:', idToken?.length);
        // Prefer configured API base or relative proxy path
        const base = (environment?.apiBaseUrl || '').replace(/\/$/, '');
        const url = base ? `${base}/auth/sync` : '/api/auth/sync';
        const res = await firstValueFrom(this.http.post<{ user: any; profile: any; completion: number; verifications?: any; isNew?: boolean }>(
          url,
          { idToken },
          { headers: { Authorization: `Bearer ${idToken}` } }
        ));
        this.authStore.setUser({
          userId: res.user.userId,
          email: res.user.email,
          phone: res.user.phone,
          displayName: res.user.displayName || fbUser.displayName || 'New User',
          avatarUrl: res.user.photoUrl || fbUser.photoURL || undefined,
          provider: res.user.provider,
          isNew: !!res.isNew,
        });
  this.profileStore.hydrate(res.profile, res.completion, res.verifications || null);
        // Ensure legacy UserStore is hydrated for header/profile fallbacks
        try { await this.userStore.refresh(); } catch {}
        this.emitToast(res.isNew ? `Welcome to Setly, ${res.user.displayName || 'there'}!` : `Welcome back, ${res.user.displayName || 'there'}!`);
      } catch (e: any) {
        console.error('[AuthSync] sync failed', e);
        // Graceful degrade: hydrate stores from Firebase user so app remains usable
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
          this.profileStore.hydrate(
            {
              userId: fbUser.uid,
              displayName: fbUser.displayName || undefined,
              avatarUrl: fbUser.photoURL || undefined,
              about: '',
              interests: [],
              languages: [],
              socials: {},
              visibility: { publicProfile: true, showCity: true, showSchool: false },
              location: '',
            },
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
      }
    });
  }

  private emitToast(message: string, type: 'success' | 'error' = 'success') {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }));
  }
}
