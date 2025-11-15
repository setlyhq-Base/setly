import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileSpec, VerificationsSpec, computeCompletion } from '../models/profile.model';

interface ProfileMeResponse {
  profile: ProfileSpec;
  verifications: VerificationsSpec;
  completion?: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private http = inject(HttpClient);
  private _profile = signal<ProfileSpec | null>(null);
  private _verifications = signal<VerificationsSpec | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  profile = this._profile.asReadonly();
  verifications = this._verifications.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  completion = computed(() => {
    const p = this._profile();
    const v = this._verifications();
    if (!p || !v) return 0;
    return computeCompletion(p, v);
  });

  canPerformTrustedAction = computed(() => {
    const v = this._verifications();
    const pct = this.completion();
    if (!v) return false;
    return pct >= 60 && (v.phoneVerified || v.emailVerified);
  });

  async loadMe(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Backend currently exposes /api/users/me; map minimal fields to ProfileSpec
      const me = await this.http.get<any>('/api/users/me').toPromise();
      if (me) {
        // Map backend fields; preserve any locally-present fields (e.g., quick-capture patch like location/university/company)
        const existing = this._profile();
        const mapped: ProfileSpec = {
          userId: me.id,
          displayName: me.displayName,
          avatarUrl: me.publicUrl || me.photoUrl,
          about: me.bio,
          languages: me.languages || [],
          interests: me.interests || [],
          socials: me.socials || {},
          visibility: me.profileVisibility || { publicProfile: true },
        } as ProfileSpec;
        // Derive a friendly location from city/state if backend does not supply `location`
        const derivedLoc = [me.city, me.state].filter(Boolean).join(me.city && me.state ? ', ' : '');
        if (derivedLoc && !mapped.location) mapped.location = derivedLoc;
        // Merge durable cache from previous sessions if present
        try {
          const cacheRaw = localStorage.getItem(`profile.cache.${me.id}`);
          if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            Object.assign(mapped, cache);
          }
        } catch {}
        // Merge with any existing local fields so we don't drop quick-capture details
        const merged = existing ? ({ ...existing, ...mapped } as ProfileSpec) : mapped;
        this._profile.set(merged);
        // Derive verifications (emailVerified not provided by /users/me; keep last known or defaults)
        if (!this._verifications()) {
          this._verifications.set({ emailVerified: false, phoneVerified: false, eduVerified: false, idVerified: false });
        }
      }
    } catch (e: any) {
      if (e?.status === 401) {
        // Unauthorized: do not set an error toast; rely on auth sync to hydrate later
        console.debug('[ProfileStore] loadMe unauthorized (401) – awaiting auth hydration');
      } else {
        console.warn('[ProfileStore] loadMe failed', e);
        this._error.set(e?.message || 'Failed loading profile');
      }
    } finally {
      this._loading.set(false);
    }
  }

  async patch(patch: Partial<ProfileSpec>): Promise<void> {
    if (!this._profile()) return;
    try {
      const updated = await this.http.patch<ProfileMeResponse>('/api/profile', patch).toPromise();
      if (updated?.profile) this._profile.set(updated.profile);
      if (updated?.verifications) this._verifications.set(updated.verifications);
    } catch (e) {
      console.error('[ProfileStore] patch failed', e);
    }
  }

  // Hydrate from auth sync response
  hydrate(profile: ProfileSpec | null, completion?: number, verifications?: VerificationsSpec | null) {
    this._profile.set(profile);
    if (profile && completion !== undefined) {
      this._profile.update(p => p ? { ...p, completion } : p);
    }
    if (verifications !== undefined) {
      this._verifications.set(verifications || null);
    }
  }
}
