import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UsersService, PublicUserDetail } from './users.service';

export interface ListingCardVM {
  id: string;
  title: string;
  price?: number;
  city?: string;
  state?: string;
  photo?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private http = inject(HttpClient);
  private users = inject(UsersService);

  getPublicProfile(id: string): Observable<PublicUserDetail | null> {
    return this.users.getUserDetail(id);
  }

  getRoomsByOwner(id: string): Observable<ListingCardVM[]> {
    return this.http.get<any>('/api/rooms', { params: { ownerId: id } }).pipe(
      map((res: any) => {
        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        const owned = items.filter((r: any) => (r?.ownerId || r?.owner_id) === id || !id);
        return owned.slice(0, 6).map((r: any) => ({
          id: r.id,
          title: r.title,
          price: r.price,
          city: r.city,
          state: r.state,
          photo: Array.isArray(r.photos) ? r.photos[0] : undefined
        }));
      })
    );
  }
}