import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MarketplaceItem {
  itemId?: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  images: string[];
  location: string;
  tags?: string[];
  status?: 'available' | 'sold' | 'reserved';
  createdAt?: Date;
  updatedAt?: Date;
  
  // User profile data (populated from backend)
  userName?: string;
  userEmail?: string;
  userPhoto?: string;
  userVerified?: boolean;
}

export interface MarketplaceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  condition?: string;
  location?: string;
}

export interface MarketplaceResponse {
  count: number;
  items: MarketplaceItem[];
}

/**
 * Marketplace Backend API Service
 * Connects to AWS Lambda /api/marketplace endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class MarketplaceApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl || '/api'}/marketplace`;

  /**
   * Search marketplace items with filters
   */
  searchItems(filters?: MarketplaceFilters): Observable<MarketplaceResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
      if (filters.condition) params = params.set('condition', filters.condition);
      if (filters.location) params = params.set('location', filters.location);
    }

    return this.http.get<MarketplaceResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get item by ID
   */
  getItemById(itemId: string): Observable<MarketplaceItem> {
    return this.http.get<MarketplaceItem>(`${this.apiUrl}/${itemId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new marketplace listing
   */
  createItem(item: Partial<MarketplaceItem>): Observable<MarketplaceItem> {
    return this.http.post<MarketplaceItem>(this.apiUrl, item).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing item
   */
  updateItem(itemId: string, updates: Partial<MarketplaceItem>): Observable<MarketplaceItem> {
    return this.http.put<MarketplaceItem>(`${this.apiUrl}/${itemId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete item
   */
  deleteItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get items by user ID
   */
  getItemsByUser(userId: string): Observable<MarketplaceItem[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<MarketplaceResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map(response => response.items)
    );
  }

  /**
   * Mark item as sold
   */
  markAsSold(itemId: string): Observable<MarketplaceItem> {
    return this.updateItem(itemId, { status: 'sold' });
  }

  /**
   * Mark item as reserved
   */
  markAsReserved(itemId: string): Observable<MarketplaceItem> {
    return this.updateItem(itemId, { status: 'reserved' });
  }

  private handleError(error: any): Observable<never> {
    console.error('Marketplace API Error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred with marketplace API';
    return throwError(() => new Error(errorMessage));
  }
}
