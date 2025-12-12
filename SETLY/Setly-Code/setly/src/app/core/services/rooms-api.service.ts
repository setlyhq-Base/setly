import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room } from '../models/room.model';
import { RoomStoreService } from './room-store.service';

export interface RoomFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: 'private' | 'shared';
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export interface RoomResponse {
  count: number;
  rooms: Room[];
}

/**
 * Rooms Backend API Service
 * Connects to AWS Lambda /api/rooms endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class RoomsApiService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private apiUrl = `${environment.apiUrl || '/api'}/rooms`;

  private isDummyMode(): boolean {
    return !!(environment as any)?.featureFlags?.useDummyData;
  }

  /**
   * Search rooms with filters
   */
  searchRooms(filters?: RoomFilters): Observable<RoomResponse> {
    if (this.isDummyMode()) {
      const store = this.injector.get(RoomStoreService);
      const list = this.applyDummyFilters(store.roomsList(), filters);
      return of({ count: list.length, rooms: list });
    }

    let params = new HttpParams();

    if (filters) {
      if (filters.city) params = params.set('city', filters.city);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.roomType) params = params.set('roomType', filters.roomType);
      if (filters.checkIn) params = params.set('checkIn', filters.checkIn);
      if (filters.checkOut) params = params.set('checkOut', filters.checkOut);
      if (filters.guests) params = params.set('guests', filters.guests.toString());
    }

    return this.http.get<RoomResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get room by ID
   */
  getRoomById(roomId: string): Observable<Room> {
    if (this.isDummyMode()) {
      const store = this.injector.get(RoomStoreService);
      const found = store.roomsList().find(r => r.id === roomId);
      if (found) return of(found);
      return throwError(() => new Error('Room not found'));
    }
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new room listing
   */
  createRoom(room: Partial<Room>): Observable<Room> {
    if (this.isDummyMode()) {
      const store = this.injector.get(RoomStoreService);
      const rooms = store.roomsList();
      const existing = new Set(rooms.map(r => r.id));
      const nextId = () => {
        // Prefer numeric ids to match existing mock rooms
        let max = 0;
        for (const id of existing) {
          const n = Number(id);
          if (!Number.isNaN(n)) max = Math.max(max, n);
        }
        return String(max + 1);
      };

      const nowIso = new Date().toISOString();
      const created: Room = {
        id: room.id || nextId(),
        title: room.title || 'New Room',
        description: room.description,
        price: Number(room.price) || 900,
        deposit: room.deposit,
        city: room.city || 'Boston',
        state: room.state,
        coords: room.coords,
        universityId: room.universityId,
        distanceKm: room.distanceKm,
        roomType: (room.roomType as any) || 'private',
        bath: (room.bath as any) || 'shared',
        furnished: room.furnished ?? true,
        rules: room.rules || { vegetarian: false, smoking: false, petsOk: false },
        photos: Array.isArray(room.photos) && room.photos.length ? room.photos : (room.image ? [room.image] : []),
        hostId: room.hostId || 'host1',
        createdAt: room.createdAt || nowIso,
        tags: room.tags,
        image: room.image,
        isAvailable: room.isAvailable ?? true,
        address: room.address,
        amenities: room.amenities,
        features: room.features,
        distance: room.distance,
        availabilityStart: room.availabilityStart,
        availabilityEnd: room.availabilityEnd,
        maxGuests: room.maxGuests,
        studentVerified: room.studentVerified,
        minStayDays: room.minStayDays,
        roommateIds: room.roommateIds,
        memories: room.memories,
        photoMeta: room.photoMeta,
        videos: room.videos,
      };

      store.addRoom(created);
      return of(created);
    }
    return this.http.post<Room>(this.apiUrl, room).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing room
   */
  updateRoom(roomId: string, updates: Partial<Room>): Observable<Room> {
    if (this.isDummyMode()) {
      const store = this.injector.get(RoomStoreService);
      const existing = store.roomsList().find(r => r.id === roomId);
      if (!existing) return throwError(() => new Error('Room not found'));
      const merged = { ...existing, ...updates } as Room;
      store.updateRoom(roomId, updates);
      return of(merged);
    }
    return this.http.put<Room>(`${this.apiUrl}/${roomId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete room
   */
  deleteRoom(roomId: string): Observable<void> {
    if (this.isDummyMode()) {
      // RoomStoreService doesn't expose delete; implement as update for now by marking unavailable.
      const store = this.injector.get(RoomStoreService);
      store.updateRoom(roomId, { isAvailable: false });
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get rooms by user ID
   */
  getRoomsByUser(userId: string): Observable<Room[]> {
    if (this.isDummyMode()) {
      const store = this.injector.get(RoomStoreService);
      const rooms = store.roomsList().filter(r => r.hostId === userId);
      return of(rooms);
    }
    const params = new HttpParams().set('userId', userId);
    return this.http.get<RoomResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map(response => response.rooms)
    );
  }

  private applyDummyFilters(rooms: Room[], filters?: RoomFilters): Room[] {
    if (!filters) return rooms;

    const city = (filters.city || '').toLowerCase().trim();
    const minPrice = filters.minPrice ?? undefined;
    const maxPrice = filters.maxPrice ?? undefined;
    const roomType = filters.roomType;

    return rooms.filter(r => {
      if (city && !String(r.city || '').toLowerCase().includes(city)) return false;
      if (minPrice !== undefined && (Number(r.price) || 0) < minPrice) return false;
      if (maxPrice !== undefined && (Number(r.price) || 0) > maxPrice) return false;
      if (roomType && r.roomType !== roomType) return false;
      return true;
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Rooms API Error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred with rooms API';
    return throwError(() => new Error(errorMessage));
  }
}
