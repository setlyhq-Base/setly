import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      const res: any = await this.http.get('/api/profile/me').toPromise();
      if (res?.profile) {
        this.profileStore.hydrate(res.profile, res.completion, res.verifications);
        return res.profile as ProfileSpec;
      }
      return null;
    } catch (e: any) {
      if (e.status === 404) return null;
      console.warn('[ProfileService] getMe failed', e);
      return null;
    }
  }

  async createFromAuth(identity: AuthIdentity): Promise<ProfileSpec | null> {
    const body = {
      displayName: identity.displayName?.trim() || '',
      email: identity.email,
      photoUrl: identity.photoUrl,
      authProvider: identity.provider
    };
    try {
      const res: any = await this.http.post('/api/profile', body).toPromise();
      if (res?.profile) {
        this.profileStore.hydrate(res.profile, res.completion, res.verifications);
        return res.profile;
      }
      return null;
    } catch (e) {
      console.error('[ProfileService] createFromAuth failed', e);
      return null;
    }
  }

  async patchMe(patch: Partial<ProfileSpec>): Promise<ProfileSpec | null> {
    // Persist to backend when possible. Backend exposes PUT /api/users/me
    try {
      const authUser = this.authStore.user();
      if (authUser?.userId) {
        await this.http.put('/api/users/me', patch).toPromise();
      }
    } catch (e) {
      console.warn('[ProfileService] patchMe backend PUT failed (optimistic continue)', e);
    }
    const current = this.profileStore.profile();
    let next: ProfileSpec | null = null;
    if (current) {
      next = { ...current, ...patch } as ProfileSpec;
    } else {
      // Create a minimal local profile so UI can reflect immediately even if hydration hasn't happened yet
      const auth = this.authStore.user();
      next = {
        userId: auth.userId || 'me',
        displayName: (patch.displayName as string) || auth.displayName || 'New User',
        avatarUrl: (patch as any)?.avatarUrl || auth.avatarUrl,
        languages: [],
        interests: [],
        socials: {},
        visibility: { publicProfile: true },
      } as ProfileSpec;
    }
    this.profileStore.hydrate(next, next.completion, this.profileStore.verifications());
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
