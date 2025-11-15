import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { ProfileStore } from '../state/profile.store';
import { ProfileSpec } from '../models/profile.model';
import { UserStore } from '../state/user.store';

export interface AuthIdentity {
  uid: string; email?: string; displayName?: string; photoUrl?: string; provider: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private profileStore = inject(ProfileStore);
  private userStore = inject(UserStore);

  async getMe(): Promise<ProfileSpec | null> {
    try {
      // Updated to use existing /api/users/me endpoint (backend no longer exposes /api/profile/me)
      const me: any = await this.http.get('/api/users/me').toPromise();
      if (!me) return null;
      // Map minimal backend user shape -> ProfileSpec
      const mapped: ProfileSpec = {
        userId: me.id || me.userId,
        displayName: me.displayName,
        avatarUrl: me.photoUrl || me.publicUrl,
        about: me.bio,
        languages: me.languages || [],
        interests: me.interests || [],
        socials: me.socials || {},
        visibility: me.profileVisibility || { publicProfile: true }
      } as ProfileSpec;
      // Derive location from city/state if not explicitly present
      if (!mapped.location) {
        const loc = [me.city, me.state].filter(Boolean).join(me.city && me.state ? ', ' : '');
        if (loc) mapped.location = loc;
      }
      // Hydrate (verifications not supplied by /api/users/me; keep existing or defaults)
      const existingVerifications = this.profileStore.verifications();
      this.profileStore.hydrate(mapped, mapped.completion, existingVerifications || { emailVerified: false, phoneVerified: false, eduVerified: false, idVerified: false });
      return mapped;
    } catch (e: any) {
      if (e.status === 404) return null;
      console.warn('[ProfileService] getMe failed', e);
      return null;
    }
  }

  async createFromAuth(identity: AuthIdentity): Promise<ProfileSpec | null> {
    // Backend creation now handled implicitly by /api/auth/sync; attempt sync then call getMe
    try {
      // Fire auth sync (will return profile shape if token present; dev fallback if not)
      const sync: any = await this.http.post('/api/auth/sync', {}).toPromise().catch(() => null);
      if (sync?.profile) {
        this.profileStore.hydrate(sync.profile, sync.completion, sync.verifications);
        return sync.profile as ProfileSpec;
      }
      // Fallback: construct a local profile from identity
      const local: ProfileSpec = {
        userId: identity.uid || 'me',
        displayName: identity.displayName?.trim() || identity.email?.split('@')[0] || 'New User',
        avatarUrl: identity.photoUrl,
        languages: [],
        interests: [],
        socials: {},
        visibility: { publicProfile: true }
      };
      this.profileStore.hydrate(local, local.completion, { emailVerified: !!identity.email, phoneVerified: false, eduVerified: false, idVerified: false });
      return local;
    } catch (e) {
      console.error('[ProfileService] createFromAuth failed', e);
      return null;
    }
  }

  async patchMe(patch: Partial<ProfileSpec>): Promise<ProfileSpec | null> {
    // Persist to backend when possible. Send in background with a short timeout for snappy UX.
    try {
      const authUser = this.authStore.user();
      if (authUser?.userId) {
        this.http
          .put('/api/users/me', patch)
          .pipe(
            timeout(1200),
            catchError((e) => {
              console.warn('[ProfileService] patchMe backend PUT failed (optimistic continue)', e);
              return of(null);
            })
          )
          .subscribe({ next: () => {}, error: () => {} }); // fire-and-forget
      }
    } catch (e) {
      console.warn('[ProfileService] patchMe enqueue failed (optimistic continue)', e);
    }
    const current = this.profileStore.profile();
    let next: ProfileSpec | null = null;
    if (current) {
      next = { ...current, ...patch } as ProfileSpec;
    } else {
      // Create an immediate local profile with the provided patch merged so the UI reflects promptly
      const auth = this.authStore.user();
      next = {
        userId: auth.userId || 'me',
        displayName: (patch.displayName as string) ?? auth.displayName ?? 'New User',
        avatarUrl: (patch as any)?.avatarUrl ?? auth.avatarUrl,
        ...patch,
        languages: (patch.languages as any) ?? [],
        interests: (patch.interests as any) ?? [],
        socials: patch.socials ?? {},
        visibility: patch.visibility ?? { publicProfile: true },
      } as ProfileSpec;
    }
    this.profileStore.hydrate(next, next.completion, this.profileStore.verifications());
    // Persist a durable local cache so the profile survives sign-out/in even if backend is slow/minimal
    try {
      const uid = (this.authStore.user()?.userId) || (next as any)?.userId || 'me';
      localStorage.setItem(`profile.cache.${uid}`, JSON.stringify(next));
      // Keep the quick-capture style lastPatch up to date as a secondary safety net
      localStorage.setItem(`qc.lastPatch.${uid}`, JSON.stringify(patch));
    } catch {}
    // Mirror into auth store if displayName or avatar changed
    const authUser = this.authStore.user();
    if (patch.displayName || patch.avatarUrl) {
      this.authStore.setUser({ displayName: patch.displayName || authUser.displayName, avatarUrl: patch.avatarUrl || authUser.avatarUrl });
    }
    // Also optimistically update the basic UserStore used across the app (name/phone shown in UI)
    if (patch.displayName) this.userStore.patchLocal({ name: patch.displayName });
    if ((patch as any).phone) this.userStore.patchLocal({ phone: (patch as any).phone });
    if ((patch as any).avatarUrl) this.userStore.patchLocal({ photoUrl: (patch as any).avatarUrl });
    return next;
  }

  async ensureFromAuth(identity: AuthIdentity): Promise<ProfileSpec | null> {
    let existing = await this.getMe();
    if (!existing) {
      existing = await this.createFromAuth(identity) || existing;
      if (existing) {
        // Fire first-time confetti toast
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: `Welcome to Setly!`, type: 'success' } }));
      }
    } else {
      // Patch missing fields
      const patch: any = {};
      if (!existing.displayName && identity.displayName) patch.displayName = identity.displayName;
  // ProfileSpec currently omits email/phone; only patch displayName & avatarUrl for now.
      if (!existing.avatarUrl && identity.photoUrl) patch.avatarUrl = identity.photoUrl;
      if (patch.avatarUrl || patch.displayName) {
        this.authStore.setUser({ displayName: patch.displayName || existing.displayName, avatarUrl: patch.avatarUrl || existing.avatarUrl });
      }
      if (Object.keys(patch).length) existing = await this.patchMe(patch) || existing;
    }
    return existing;
  }
}
