import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  userId?: string;
  email: string;
  name: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  verified?: boolean;
  verificationBadge?: 'student' | 'alumni' | 'verified';
  createdAt?: Date;
  updatedAt?: Date;
  
  // Preferences
  preferredCities?: string[];
  savedRooms?: string[];
  savedRides?: string[];
  savedMarketplace?: string[];
  
  // Stats
  listingsCount?: number;
  completedTransactions?: number;
  rating?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  preferredCities?: string[];
}

/**
 * Users & Profile Backend API Service
 * Connects to AWS Lambda /api/users endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl || '/api'}/users`;

  /**
   * Get current user's profile
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user profile by ID
   */
  getUserById(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update current user's profile
   */
  updateProfile(updates: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload profile photo
   * Returns CloudFront URL
   */
  updateProfilePhoto(photoUrl: string): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me/photo`, { photoUrl }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Save room to user's saved list
   */
  saveRoom(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/saved/rooms`, { roomId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Unsave room from user's saved list
   */
  unsaveRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/saved/rooms/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Save ride to user's saved list
   */
  saveRide(rideId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/saved/rides`, { rideId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Unsave ride from user's saved list
   */
  unsaveRide(rideId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/saved/rides/${rideId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Save marketplace item to user's saved list
   */
  saveMarketplaceItem(itemId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/saved/marketplace`, { itemId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Unsave marketplace item from user's saved list
   */
  unsaveMarketplaceItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/saved/marketplace/${itemId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user's saved items of all types
   */
  getSavedItems(): Observable<{
    rooms: string[];
    rides: string[];
    marketplace: string[];
  }> {
    return this.http.get<{
      rooms: string[];
      rides: string[];
      marketplace: string[];
    }>(`${this.apiUrl}/me/saved`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Users API Error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred with users API';
    return throwError(() => new Error(errorMessage));
  }
}
