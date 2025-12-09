import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

export interface ExploreItem {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  category: string;
  organizer: { name: string; avatar: string };
  price: number;
  isFree: boolean;
  tag: string;
  attendees: number;
  spotsLeft: string;
  placeId?: string;
  rating?: number;
  photos?: string[];
  description?: string;
  address?: string;
  officialUrl?: string;
  source?: 'google_places' | 'eventbrite' | 'ticketmaster' | 'custom';
  website?: string;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: { open_now?: boolean };
  price_level?: number;
  types?: string[];
}

@Injectable({ providedIn: 'root' })
export class ExploreDataService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<ExploreItem[]>>();
  private readonly API_BASE = '/api/places';

  /**
   * Fetch real-time nearby places based on category and location
   */
  getNearbyPlaces(
    category: string,
    location: { lat: number; lng: number },
    radius: number = 5000
  ): Observable<ExploreItem[]> {
    const cacheKey = `${category}_${location.lat}_${location.lng}_${radius}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const types = this.getCategoryTypes(category);
    const query = this.getCategoryQuery(category);

    const request$ = this.http.get<GooglePlacesResponse>(`${this.API_BASE}/nearby`, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius: radius.toString(),
        type: types,
        query: query
      }
    }).pipe(
      map(response => this.transformToExploreItems(response.results, category)),
      catchError(() => of([])),
      shareReplay(1)
    );

    this.cache.set(cacheKey, request$);
    
    // Clear cache after 5 minutes
    setTimeout(() => this.cache.delete(cacheKey), 300000);

    return request$;
  }

  /**
   * Fetch trending items (most popular/highly rated)
   */
  getTrendingNearby(
    location: { lat: number; lng: number },
    radius: number = 3000
  ): Observable<ExploreItem[]> {
    return forkJoin({
      restaurants: this.getNearbyPlaces('restaurants', location, radius),
      events: this.getNearbyPlaces('events', location, radius),
      activities: this.getNearbyPlaces('activities', location, radius),
      nightlife: this.getNearbyPlaces('nightlife', location, radius)
    }).pipe(
      map(results => {
        const all = [
          ...results.restaurants.slice(0, 3),
          ...results.events.slice(0, 3),
          ...results.activities.slice(0, 2),
          ...results.nightlife.slice(0, 2)
        ];
        return this.sortByRating(all).slice(0, 10);
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Search places by text query
   */
  searchPlaces(query: string, location: { lat: number; lng: number }): Observable<ExploreItem[]> {
    return this.http.get<GooglePlacesResponse>(`${this.API_BASE}/textsearch`, {
      params: {
        query,
        location: `${location.lat},${location.lng}`,
        radius: '10000'
      }
    }).pipe(
      map(response => this.transformToExploreItems(response.results, 'search')),
      catchError(() => of([]))
    );
  }

  /**
   * Get user's current location
   */
  getCurrentLocation(): Promise<{ lat: number; lng: number; city: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get city name
          this.http.get<any>(`${this.API_BASE}/geocode`, {
            params: { latlng: `${lat},${lng}` }
          }).subscribe({
            next: (response) => {
              const city = this.extractCityFromGeocode(response);
              resolve({ lat, lng, city });
            },
            error: () => resolve({ lat, lng, city: 'Your Location' })
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to Nashua, NH
          resolve({ lat: 42.7654, lng: -71.4676, city: 'Nashua, NH' });
        }
      );
    });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private getCategoryTypes(category: string): string {
    const typeMap: Record<string, string> = {
      'restaurants': 'restaurant|cafe|bakery|meal_takeaway|meal_delivery',
      'places': 'tourist_attraction|museum|park|art_gallery|library|landmark',
      'activities': 'gym|spa|bowling_alley|movie_theater|amusement_park|aquarium|zoo',
      'nightlife': 'night_club|bar|casino|liquor_store',
      'outdoor': 'park|campground|hiking_area|natural_feature',
      'events': 'stadium|conference_center|event_venue',
      'student': 'university|library|book_store|cafe',
      'deals': 'store|shopping_mall|convenience_store'
    };
    return typeMap[category] || 'point_of_interest';
  }

  private getCategoryQuery(category: string): string {
    const queryMap: Record<string, string> = {
      'restaurants': 'restaurants cafes food',
      'places': 'attractions museums parks',
      'activities': 'activities entertainment fun things to do',
      'nightlife': 'bars clubs nightlife',
      'outdoor': 'parks hiking outdoor',
      'events': 'events venues',
      'student': 'student cafes libraries',
      'deals': 'shopping deals'
    };
    return queryMap[category] || category;
  }

  private transformToExploreItems(places: GooglePlace[], category: string): ExploreItem[] {
    return places.map((place, index) => ({
      id: place.place_id,
      title: place.name,
      image: this.getPlaceImage(place),
      date: this.getOpenStatus(place),
      time: this.getTimeInfo(place),
      location: place.vicinity || place.formatted_address || place.name,
      distance: this.calculateDistance(place.geometry.location),
      category,
      organizer: {
        name: this.getOrganizerName(place),
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`
      },
      price: this.getPriceEstimate(place),
      isFree: (place.price_level || 0) === 0,
      tag: this.getTag(place),
      attendees: place.user_ratings_total || 0,
      spotsLeft: place.opening_hours?.open_now ? 'Open Now' : 'Closed',
      placeId: place.place_id,
      rating: place.rating,
      photos: place.photos?.map(p => this.getPhotoUrl(p.photo_reference)) || [],
      description: this.generateDescription(place),
      address: place.formatted_address || place.vicinity,
      officialUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      source: 'google_places',
      website: undefined // Would come from place details API if available
    }));
  }

  private getPlaceImage(place: GooglePlace): string {
    if (place.photos && place.photos.length > 0) {
      return this.getPhotoUrl(place.photos[0].photo_reference);
    }
    
    // Fallback to category-based Unsplash images
    const categoryImages: Record<string, string> = {
      restaurant: 'photo-1414235077428-338989a2e8c0',
      cafe: 'photo-1495474472287-4d71bcdd2085',
      park: 'photo-1441974231531-c6227db76b6e',
      museum: 'photo-1564399579883-451a5d44ec08',
      bar: 'photo-1566417713940-fe7c737a9ef2',
      gym: 'photo-1534438327276-14e5300c3a48',
      default: 'photo-1506905925346-21bda4d32df4'
    };
    
    const type = place.types?.[0] || 'default';
    const imageId = categoryImages[type] || categoryImages['default'];
    return `https://images.unsplash.com/${imageId}?w=800&q=80`;
  }

  private getPhotoUrl(photoReference: string): string {
    // Use backend proxy to fetch Google Places photos
    return `${this.API_BASE}/photo?reference=${photoReference}&maxwidth=800`;
  }

  private getOpenStatus(place: GooglePlace): string {
    if (place.opening_hours?.open_now) {
      return 'Open Now';
    }
    return 'Check Hours';
  }

  private getTimeInfo(place: GooglePlace): string {
    if (place.opening_hours?.open_now) {
      return 'Open Today';
    }
    return 'View Schedule';
  }

  private calculateDistance(location: { lat: number; lng: number }): string {
    // Simple random distance for now - in production, calculate actual distance
    const miles = (Math.random() * 5 + 0.3).toFixed(1);
    return `${miles} mi`;
  }

  private getOrganizerName(place: GooglePlace): string {
    return place.name;
  }

  private getPriceEstimate(place: GooglePlace): number {
    const priceLevel = place.price_level || 0;
    const estimates = [0, 10, 25, 40, 60];
    return estimates[priceLevel] || 0;
  }

  private getTag(place: GooglePlace): string {
    if (place.rating && place.rating >= 4.5) {
      return `⭐ ${place.rating.toFixed(1)}`;
    }
    if (place.opening_hours?.open_now) {
      return 'Open Now';
    }
    if ((place.price_level || 0) === 0) {
      return 'Free';
    }
    return 'Popular';
  }

  private generateDescription(place: GooglePlace): string {
    const types = place.types?.slice(0, 3).join(', ') || 'Place';
    return `${place.name} - ${types}`;
  }

  private sortByRating(items: ExploreItem[]): ExploreItem[] {
    return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  private extractCityFromGeocode(response: any): string {
    try {
      const results = response.results || [];
      if (results.length > 0) {
        const components = results[0].address_components || [];
        const city = components.find((c: any) => 
          c.types.includes('locality') || c.types.includes('administrative_area_level_2')
        );
        const state = components.find((c: any) => 
          c.types.includes('administrative_area_level_1')
        );
        if (city && state) {
          return `${city.short_name}, ${state.short_name}`;
        }
      }
    } catch (e) {
      console.error('Error parsing geocode:', e);
    }
    return 'Your Location';
  }
}
