import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RoomStoreService } from './room-store.service';
import { Room } from '../models/room.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private roomStore = inject(RoomStoreService);
  private http = inject(HttpClient);

  getFeaturedRooms(): Observable<Room[]> {
    return of(this.roomStore.featuredRooms());
  }

  getRoomsBySearch(params: {
    query?: string;
    city?: string;
    roomType?: 'shared' | 'Private';
    checkIn?: string;
    checkOut?: string;
    studentVerifiedOnly?: boolean;
  }): Observable<Room[]> {
    // Mock filtering - in real app, call API
    let rooms = this.roomStore.roomsList();

    if (params.query) {
      rooms = rooms.filter((room: Room) =>
        room.title.toLowerCase().includes(params.query!.toLowerCase()) ||
        room.city.toLowerCase().includes(params.query!.toLowerCase())
      );
    }

    if (params.city) {
      rooms = rooms.filter((room: Room) =>
        room.city.toLowerCase().includes(params.city!.toLowerCase())
      );
    }

    if (params.roomType) {
      rooms = rooms.filter((room: Room) =>
        room.roomType === params.roomType!.toLowerCase()
      );
    }

    if (params.studentVerifiedOnly) {
      rooms = rooms.filter((room: Room) => room.studentVerified);
    }

    return of(rooms);
  }

  getRoomById(id: string): Observable<Room | undefined> {
    // Try backend first
    return this.http.get<any>(`/api/rooms/${id}`).pipe(
      map(dto => this.mapToRoom(dto)),
      catchError(() => of(this.roomStore.getRoomById(id)))
    );
  }

  create(room: Omit<Room, 'id' | 'createdAt'>): Observable<Room> {
    return this.http.post<any>('/api/rooms', room).pipe(
      map(created => this.mapToRoom(created)),
      map((mapped: Room) => { this.roomStore.addRoom(mapped); return mapped; }),
      catchError((err) => {
        // Fallback to local creation if backend not available
        const newRoom: Room = { ...room, id: Date.now().toString(), createdAt: new Date().toISOString() } as Room;
        this.roomStore.addRoom(newRoom);
        return of(newRoom) as unknown as Observable<Room>;
      })
    );
  }

  // New two-step posting flow
  initUpload(payload: { files: { ext?: string; contentType?: string }[]; [k: string]: any }): Observable<{ roomId: string; uploads: Array<{ key: string; url: string; fields: any; contentType: string; publicUrl: string }> }> {
    return this.http.post<any>('/api/rooms/init', payload);
  }

  publish(roomId: string, payload: any): Observable<Room> {
    return this.http.post<any>(`/api/rooms/${roomId}/publish`, payload).pipe(
      map(dto => this.mapToRoom(dto)),
      map((mapped: Room) => { this.roomStore.addRoom(mapped); return mapped; })
    );
  }

  private mapToRoom(dto: any): Room {
    if (!dto) return dto;
    return {
      id: dto.id,
      title: dto.title,
      price: Number(dto.price) || 0,
      deposit: dto.deposit,
      city: dto.city,
      state: dto.state,
      coords: typeof dto.lat === 'number' && typeof dto.lon === 'number' ? { lat: dto.lat, lng: dto.lon } : dto.coords,
      universityId: dto.universityId,
      distanceKm: dto.distanceKm,
      roomType: dto.roomType,
      bath: dto.bath || 'shared',
      furnished: !!dto.furnished,
      rules: dto.rules || { vegetarian: false, smoking: false, petsOk: false },
      photos: Array.isArray(dto.photos) ? dto.photos : [],
      hostId: dto.ownerId || dto.hostId || 'unknown',
      createdAt: dto.createdAt || new Date().toISOString(),
      image: Array.isArray(dto.photos) && dto.photos.length ? dto.photos[0] : dto.image,
      amenities: dto.amenities,
      videos: Array.isArray(dto.videos) ? dto.videos.map((u: string) => ({ url: u })) : undefined
    } as Room;
  }
}
