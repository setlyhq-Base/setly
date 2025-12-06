import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

interface BackendUserDto {
  id: string;
  authUid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  universityId?: string;
  languages?: string[];
  interests?: string[];
  socials?: { linkedin?: string; instagram?: string; website?: string; whatsapp?: string };
  headline?: string;
  coverImageUrl?: string;
  avatarKey?: string;
  bannerKey?: string;
  // When avatar uploads are made public, backend can optionally return a direct publicUrl.
  publicUrl?: string;
  profileVisibility?: {
    about?: boolean;
    travelHistory?: boolean;
    reviews?: boolean;
    interests?: boolean;
    connections?: boolean;
    verification?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private _user = signal<User | null>(null);
  private _loading = signal(false);

  get user() {
    return this._user.asReadonly();
  }

  get isAuthed() {
    return computed(() => this._user() !== null);
  }

  get loading() {
    return this._loading.asReadonly();
  }

  setUser(user: User): void {
    this._user.set(user);
  }

  clearUser(): void {
    this._user.set(null);
  }

  /** Optimistically patch local user state without hitting backend (used for quick-capture modal until real PATCH endpoint exists). */
  patchLocal(patch: Partial<User>): void {
    const current = this._user();
    if (!current) return; // If user not yet hydrated, we skip; later syncAfterLogin will populate.
    this._user.set({ ...current, ...patch });
  }

  // Map backend DTO to frontend User model used by the app header, etc.
  private mapToUser(dto: BackendUserDto): User {
    return {
      id: dto.id,
      name: dto.displayName || 'User',
      // Prefer explicit publicUrl (new avatar) then stored photoUrl then fallback placeholder
  photoUrl: dto.publicUrl || dto.photoUrl || '/assets/avatar-placeholder.svg',
      coverImageUrl: dto.coverImageUrl,
      headline: dto.headline,
  bio: dto.bio,
      primaryEmail: dto.email,
      emailVerified: false,
      role: 'student',
  city: dto.city,
  state: dto.state,
  languages: dto.languages,
  interests: dto.interests,
      domainVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: dto.phone,
      profileVisibility: {
        about: dto.profileVisibility?.about !== false,
        travelHistory: dto.profileVisibility?.travelHistory !== false,
        reviews: dto.profileVisibility?.reviews !== false,
        interests: dto.profileVisibility?.interests !== false,
        connections: dto.profileVisibility?.connections !== false,
        verification: dto.profileVisibility?.verification !== false,
      },
      socials: dto.socials,
    } as User;
  }

  // POST /api/auth/sync then GET /api/users/me
  async syncAfterLogin(): Promise<void> {
    this._loading.set(true);
    try {
      const idToken = await this.authService.getIdToken();
      const headers = idToken ? { Authorization: `Bearer ${idToken}` } : undefined;
      // Call new unprotected sync endpoint explicitly with idToken duplication (header + body)
      if (idToken) {
        await this.http.post('/api/auth/sync', { idToken }, headers ? { headers } : undefined).toPromise();
      }
      const meDto = await this.http.get<BackendUserDto>('/api/users/me', headers ? { headers } : undefined).toPromise();
      if (meDto && typeof meDto === 'object' && 'id' in meDto) this._user.set(this.mapToUser(meDto as BackendUserDto));
    } finally {
      this._loading.set(false);
    }
  }

  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      const me = await this.http.get<BackendUserDto>('/api/users/me').toPromise();
      if (me) this._user.set(this.mapToUser(me));
    } catch (e) {
      // likely unauthenticated
      this._user.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async update(patch: Partial<BackendUserDto>): Promise<User | null> {
    this._loading.set(true);
    try {
      const updated = await this.http.put<BackendUserDto>('/api/users/me', patch).toPromise();
      if (updated) {
        const mapped = this.mapToUser(updated);
        this._user.set(mapped);
        return mapped;
      }
      return null;
    } finally {
      this._loading.set(false);
    }
  }
}
