import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PublicUserProfile {
  id: string;
  displayName: string;
  photoUrl?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
  city?: string;
  state?: string;
  universityId?: string;
  phone?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  getUserById(id: string): Observable<{ name: string; avatarUrl?: string; joinedYear?: number } | null> {
    return this.http.get<PublicUserProfile>(`/api/users/${id}`).pipe(
      map((dto: any) => {
        if (!dto || !dto.id) return null;
        let joinedYear: number | undefined;
        const created = dto.createdAt as any;
        if (created) {
          if (typeof created === 'string') {
            const d = new Date(created);
            if (!isNaN(d.getTime())) joinedYear = d.getFullYear();
          } else if (typeof created === 'object' && typeof created.seconds === 'number') {
            const d = new Date(created.seconds * 1000);
            joinedYear = d.getFullYear();
          } else if (created instanceof Date) {
            const d = created as Date;
            if (!isNaN(d.getTime())) joinedYear = d.getFullYear();
          }
        }
        return {
          name: dto.displayName || 'Host',
          avatarUrl: dto.photoUrl,
          joinedYear,
        };
      })
    );
  }

  // Richer profile info for public profile page
  getUserDetail(id: string): Observable<{
    id: string;
    name: string;
    avatarUrl?: string;
    location?: string;
    universityId?: string;
    badges: { email: boolean; phone: boolean; university: boolean; photo: boolean };
    joinedAt?: string;
  } | null> {
    return this.http.get<PublicUserProfile>(`/api/users/${id}`).pipe(
      map((dto: any) => {
        if (!dto || !dto.id) return null;
        const location = [dto.city, dto.state].filter(Boolean).join(', ');
        let joinedAt: string | undefined;
        const created = dto.createdAt as any;
        if (created) {
          if (typeof created === 'string') {
            const d = new Date(created);
            if (!isNaN(d.getTime())) joinedAt = d.toISOString();
          } else if (typeof created === 'object' && typeof created.seconds === 'number') {
            joinedAt = new Date(created.seconds * 1000).toISOString();
          } else if (created instanceof Date) {
            const d = created as Date;
            if (!isNaN(d.getTime())) joinedAt = d.toISOString();
          }
        }
        return {
          id: dto.id,
          name: dto.displayName || 'User',
          avatarUrl: dto.photoUrl,
          location: location || undefined,
          universityId: dto.universityId || undefined,
          badges: {
            email: !!dto.email,
            phone: !!dto.phone,
            university: !!dto.universityId,
            photo: !!dto.photoUrl
          },
          joinedAt
        };
      })
    );
  }
}
