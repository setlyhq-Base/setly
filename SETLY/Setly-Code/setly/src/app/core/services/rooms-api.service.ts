import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room } from '../models/room.model';

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
  private apiUrl = `${environment.apiUrl || '/api'}/rooms`;

  /**
   * Search rooms with filters
   */
  searchRooms(filters?: RoomFilters): Observable<RoomResponse> {
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
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new room listing
   */
  createRoom(room: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing room
   */
  updateRoom(roomId: string, updates: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${roomId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete room
   */
  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get rooms by user ID
   */
  getRoomsByUser(userId: string): Observable<Room[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<RoomResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map(response => response.rooms)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Rooms API Error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred with rooms API';
    return throwError(() => new Error(errorMessage));
  }
}
