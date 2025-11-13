import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PublicUserProfile {
  id: string;
  displayName: string;
  photoUrl?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
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
}
