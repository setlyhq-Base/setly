import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DummyRidesService } from './dummy-rides.service';

export interface Ride {
  rideId?: string;
  userId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  rideDate: string | Date;
  rideTime: string;
  seatsAvailable: number;
  pricePerSeat?: number;
  images?: string[];
  notes?: string;
  status?: 'active' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
  
  // User profile data (populated from backend)
  userName?: string;
  userEmail?: string;
  userPhoto?: string;
  userVerified?: boolean;
}

export interface RideFilters {
  pickupCity?: string;
  dropoffCity?: string;
  rideDate?: string;
  minSeats?: number;
}

export interface RideResponse {
  count: number;
  rides: Ride[];
}

/**
 * Rides Backend API Service
 * Connects to AWS Lambda /api/rides endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class RidesApiService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private apiUrl = `${environment.apiUrl || '/api'}/rides`;

  private isDummyMode(): boolean {
    return !!(environment as any)?.featureFlags?.useDummyData;
  }

  /**
   * Search rides with filters
   */
  searchRides(filters?: RideFilters): Observable<RideResponse> {
    if (this.isDummyMode()) {
      const dummy = this.injector.get(DummyRidesService);
      return of(dummy.search(filters));
    }

    let params = new HttpParams();

    if (filters) {
      if (filters.pickupCity) params = params.set('pickupCity', filters.pickupCity);
      if (filters.dropoffCity) params = params.set('dropoffCity', filters.dropoffCity);
      if (filters.rideDate) params = params.set('rideDate', filters.rideDate);
      if (filters.minSeats) params = params.set('minSeats', filters.minSeats.toString());
    }

    return this.http.get<RideResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get ride by ID
   */
  getRideById(rideId: string): Observable<Ride> {
    if (this.isDummyMode()) {
      const dummy = this.injector.get(DummyRidesService);
      const found = dummy.getById(rideId);
      if (found) return of(found);
      return throwError(() => new Error('Ride not found'));
    }
    return this.http.get<Ride>(`${this.apiUrl}/${rideId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new ride listing
   */
  createRide(ride: Partial<Ride>): Observable<Ride> {
    if (this.isDummyMode()) {
      const dummy = this.injector.get(DummyRidesService);
      const id = ride.rideId || `ride-${Date.now()}`;
      const created: Ride = {
        rideId: id,
        userId: ride.userId || 'user-1',
        pickupAddress: ride.pickupAddress || 'Boston Downtown',
        pickupLat: ride.pickupLat ?? 42.3601,
        pickupLng: ride.pickupLng ?? -71.0589,
        dropoffAddress: ride.dropoffAddress || 'Boston Airport',
        dropoffLat: ride.dropoffLat ?? 42.3656,
        dropoffLng: ride.dropoffLng ?? -71.0096,
        rideDate: (ride.rideDate as any) || new Date().toISOString().slice(0, 10),
        rideTime: ride.rideTime || '09:00',
        seatsAvailable: ride.seatsAvailable ?? 2,
        pricePerSeat: ride.pricePerSeat,
        images: ride.images,
        notes: ride.notes,
        status: ride.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: ride.userName,
        userEmail: ride.userEmail,
        userPhoto: ride.userPhoto,
        userVerified: ride.userVerified,
      };
      return of(dummy.add(created));
    }
    return this.http.post<Ride>(this.apiUrl, ride).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing ride
   */
  updateRide(rideId: string, updates: Partial<Ride>): Observable<Ride> {
    if (this.isDummyMode()) {
      const dummy = this.injector.get(DummyRidesService);
      const updated = dummy.update(rideId, updates);
      if (updated) return of(updated);
      return throwError(() => new Error('Ride not found'));
    }
    return this.http.put<Ride>(`${this.apiUrl}/${rideId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete ride
   */
  deleteRide(rideId: string): Observable<void> {
    if (this.isDummyMode()) {
      const dummy = this.injector.get(DummyRidesService);
      dummy.remove(rideId);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${rideId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get rides by user ID
   */
  getRidesByUser(userId: string): Observable<Ride[]> {
    if (this.isDummyMode()) {
      const dummy = this.injector.get(DummyRidesService);
      const rides = dummy.getAll().filter(r => r.userId === userId);
      return of(rides);
    }
    const params = new HttpParams().set('userId', userId);
    return this.http.get<RideResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map(response => response.rides)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Rides API Error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred with rides API';
    return throwError(() => new Error(errorMessage));
  }
}
