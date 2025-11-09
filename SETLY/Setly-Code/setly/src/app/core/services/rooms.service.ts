import { Injectable, inject } from '@angular/core';
import { RoomStoreService } from './room-store.service';
import { Room } from '../models/room.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private roomStore = inject(RoomStoreService);

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
    return of(this.roomStore.getRoomById(id));
  }

  create(room: Omit<Room, 'id' | 'createdAt'>): Observable<Room> {
    const newRoom: Room = {
      ...room,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString()
    };
    this.roomStore.addRoom(newRoom);
    return of(newRoom);
  }
}
