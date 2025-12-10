import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl || '/api'}/rides`;

  /**
   * Search rides with filters
   */
  searchRides(filters?: RideFilters): Observable<RideResponse> {
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
    return this.http.get<Ride>(`${this.apiUrl}/${rideId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new ride listing
   */
  createRide(ride: Partial<Ride>): Observable<Ride> {
    return this.http.post<Ride>(this.apiUrl, ride).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing ride
   */
  updateRide(rideId: string, updates: Partial<Ride>): Observable<Ride> {
    return this.http.put<Ride>(`${this.apiUrl}/${rideId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete ride
   */
  deleteRide(rideId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${rideId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get rides by user ID
   */
  getRidesByUser(userId: string): Observable<Ride[]> {
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
