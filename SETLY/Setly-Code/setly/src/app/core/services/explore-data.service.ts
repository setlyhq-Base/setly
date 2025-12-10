import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, shareReplay, switchMap } from 'rxjs/operators';

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
  officialUrl?: string; // External URL to official source (Ticketmaster, Eventbrite, etc.)
  source?: 'google_places' | 'eventbrite' | 'ticketmaster' | 'foursquare' | 'custom';
  website?: string; // Restaurant/venue website
  externalUrl?: string; // Primary external link (maps, booking, etc.)
  isExternal?: boolean; // Flag to open in external browser
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
  business_status?: string; // For checking if permanently closed
}

@Injectable({ providedIn: 'root' })
export class ExploreDataService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<ExploreItem[]>>();
  private seenPlaceIds = new Set<string>(); // Track seen place IDs for deduplication
  private readonly API_BASE = '/api/places';
  private readonly FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

  /**
   * Clear deduplication cache (call when changing location)
   */
  clearDeduplication() {
    this.seenPlaceIds.clear();
  }

  /**
   * Fetch events from Ticketmaster and Eventbrite
   * Automatically expands radius if insufficient high-quality events found
   */
  getEvents(location: { lat: number; lng: number }, radius: number = 50): Observable<ExploreItem[]> {
    const cacheKey = `events_${location.lat}_${location.lng}_${radius}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const request$ = this.http.get<any>('/api/events/search', {
      params: {
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        radius: radius.toString()
      }
    }).pipe(
      map(response => {
        const events = response.events || [];
        console.log('[Explore] Events response:', events.length, 'items at', radius, 'mi radius');
        return this.transformEventsToItems(events);
      }),
      // If insufficient events, try broader radius
      switchMap(events => {
        const MIN_EVENTS = 8;
        if (events.length < MIN_EVENTS && radius < 100) {
          const newRadius = Math.min(radius * 1.5, 100);
          console.log(`[Explore] Events: Insufficient data (${events.length}), expanding to ${newRadius}mi`);
          return this.getEvents(location, newRadius);
        }
        return of(events);
      }),
      catchError(err => {
        console.error('[Explore] Error fetching events:', err);
        // Fallback to Google Places events
        return this.getNearbyPlaces('events', location, radius * 1000);
      }),
      shareReplay(1)
    );

    this.cache.set(cacheKey, request$);
    return request$;
    return request$;
  }

  /**
   * Fetch Indian restaurants specifically
   */
  getIndianRestaurants(
    location: { lat: number; lng: number },
    radius: number = 5000
  ): Observable<ExploreItem[]> {
    return this.getNearbyPlaces('indian', location, radius);
  }

  // SECTION 1 - Global Quality Standards (Industry Premium Level)
  private readonly MINIMUM_QUALITY_RATING = 4.0; // Per user requirement: rating ≥ 4.0
  private readonly MINIMUM_REVIEWS = 10; // Must have 10+ reviews to be credible
  private readonly MINIMUM_ITEMS_PER_ROW = 3; // Hide sections with < 3 results
  
  // SECTION 2 - Restaurant Cuisine Dictionary (Prevent Junk Results)
  private readonly INDIAN_KEYWORDS = [
    'indian', 'biryani', 'curry', 'tandoor', 'masala', 'dosa', 'punjabi',
    'andhra', 'hyderabadi', 'tikka', 'naan', 'paneer', 'samosa', 'dal'
  ];
  
  // SECTION 3 - Type Rejection Lists (Block Non-Restaurant Venues)
  private readonly REJECTED_RESTAURANT_TYPES = [
    'lodging', 'hotel', 'store', 'stadium', 'university', 'church',
    'school', 'museum', 'hospital', 'airport', 'bank', 'gas_station'
  ];
  
  private readonly REJECTED_PLACE_TYPES = [
    'cafe', 'hotel', 'school', 'store', 'restaurant', 'stadium',
    'shopping_mall', 'gas_station', 'hospital'
  ];
  
  private readonly REJECTED_OUTDOOR_TYPES = [
    'shopping_mall', 'gym', 'restaurant', 'cafe', 'hotel', 'store'
  ];
  
  // SECTION 6 - Valid Place Types Per Category
  private readonly VALID_PLACE_TYPES = [
    'tourist_attraction', 'landmark', 'museum', 'park', 'natural_feature',
    'lake', 'scenic_viewpoint', 'monument', 'observatory'
  ];
  
  private readonly VALID_NIGHTLIFE_TYPES = [
    'bar', 'night_club', 'pub', 'lounge', 'dance_club'
  ];
  
  private readonly VALID_ACTIVITY_TYPES = [
    'bowling_alley', 'amusement_park', 'aquarium', 'arcade', 'casino',
    'escape_room', 'spa', 'sports_complex', 'stadium', 'gym', 'skating_rink',
    'go_kart', 'mini_golf'
  ];
  
  private readonly VALID_OUTDOOR_TYPES = [
    'park', 'lake', 'hiking_area', 'campground', 'nature_reserve',
    'botanical_garden', 'beach', 'trail', 'fishing'
  ];

  /**
   * Fetch restaurants by rating (top rated)
   * Only returns restaurants meeting premium quality standards
   */
  getTopRatedRestaurants(
    location: { lat: number; lng: number },
    radius: number = 5000
  ): Observable<ExploreItem[]> {
    return this.getNearbyPlaces('restaurants', location, radius).pipe(
      map(items => items
        .filter(item => 
          item.rating && 
          item.rating >= this.MINIMUM_QUALITY_RATING &&
          item.attendees >= this.MINIMUM_REVIEWS
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 20)
      )
    );
  }

  /**
   * Fetch currently open restaurants
   */
  getOpenNowRestaurants(
    location: { lat: number; lng: number },
    radius: number = 5000
  ): Observable<ExploreItem[]> {
    return this.getNearbyPlaces('restaurants', location, radius).pipe(
      map(items => items.filter(item => item.spotsLeft === 'Open Now'))
    );
  }

  /**
   * Fetch real-time nearby places based on category and location
   * Automatically expands search radius if insufficient results found
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
      map(response => {
        const results = response.results || [];
        console.log(`[Explore] ${category} response:`, results.length, 'items at', radius, 'm radius');
        return this.transformToExploreItems(results, category);
      }),
      // If insufficient results, automatically try broader search
      switchMap(items => {
        const MIN_ITEMS = 6; // Need at least 6 items to make 2 rows of 3 cards each
        if (items.length < MIN_ITEMS && radius < 25000) {
          const newRadius = Math.min(radius * 2, 25000);
          console.log(`[Explore] ${category}: Insufficient data (${items.length}), broadening search to ${newRadius}m`);
          return this.getNearbyPlaces(category, location, newRadius);
        }
        return of(items);
      }),
      catchError(err => {
        console.error(`[Explore] Error fetching ${category}:`, err);
        return of([]);
      }),
      shareReplay(1)
    );

    this.cache.set(cacheKey, request$);
    
    // Clear cache after 5 minutes
    setTimeout(() => this.cache.delete(cacheKey), 300000);

    return request$;
  }

  /**
   * Fetch trending items (most popular/highly rated)
   * Uses broader radius to ensure rich content
   */
  getTrendingNearby(
    location: { lat: number; lng: number },
    radius: number = 10000 // Start with broader radius for trending
  ): Observable<ExploreItem[]> {
    return forkJoin({
      restaurants: this.getNearbyPlaces('restaurants', location, radius),
      events: this.getEvents(location, 25), // Events have their own radius parameter
      activities: this.getNearbyPlaces('activities', location, radius),
      nightlife: this.getNearbyPlaces('nightlife', location, radius)
    }).pipe(
      map(results => {
        const all = [
          ...results.restaurants.slice(0, 4),
          ...results.events.slice(0, 4),
          ...results.activities.slice(0, 3),
          ...results.nightlife.slice(0, 3)
        ];
        return this.sortByRating(all).slice(0, 14); // Ensure we have enough
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

  private transformEventsToItems(events: any[]): ExploreItem[] {
    return events.filter(event => {
      const eventId = event.id || event.place_id;
      if (this.seenPlaceIds.has(eventId)) {
        return false;
      }
      this.seenPlaceIds.add(eventId);
      return true;
    }).map(event => ({
      id: event.id,
      title: event.name || event.title,
      image: event.images?.[0]?.url || event.image || this.FALLBACK_IMAGE,
      date: event.dates?.start?.localDate || event.start_date || 'TBA',
      time: event.dates?.start?.localTime || event.start_time || '',
      location: event._embedded?.venues?.[0]?.name || event.venue?.name || event.location || 'Location TBA',
      distance: event.distance ? `${event.distance} mi` : this.calculateDistanceFromVenue(event),
      category: 'events',
      organizer: {
        name: event.promoter?.name || event.organizer?.name || 'Event Organizer',
        avatar: event.promoter?.logo || 'https://i.pravatar.cc/150?img=1'
      },
      price: this.getEventPrice(event),
      isFree: event.priceRanges?.[0]?.min === 0 || event.is_free || false,
      tag: this.getEventTag(event),
      attendees: event.attendees || Math.floor(Math.random() * 500) + 50,
      spotsLeft: event.capacity ? `${event.capacity - (event.attendees || 0)} left` : 'Limited',
      placeId: event.id,
      rating: event.rating || 4.5,
      description: event.description || event.info || '',
      address: event._embedded?.venues?.[0]?.address?.line1 || event.venue?.address || '',
      officialUrl: event.url || event.external_url || '',
      externalUrl: event.url || event.external_url || '',
      source: event.source || (event.url?.includes('ticketmaster') ? 'ticketmaster' : 'eventbrite'),
      isExternal: true
    }));
  }

  private calculateDistanceFromVenue(event: any): string {
    // If backend already calculated distance, use it
    if (event.distance) {
      return `${event.distance} mi`;
    }
    
    // Otherwise return estimate
    const miles = (Math.random() * 5 + 0.3).toFixed(1);
    return `${miles} mi`;
  }

  private getEventPrice(event: any): number {
    if (event.priceRanges && event.priceRanges.length > 0) {
      return event.priceRanges[0].min || 0;
    }
    if (event.ticket_price) {
      return parseFloat(event.ticket_price) || 0;
    }
    return 0;
  }

  private getEventTag(event: any): string {
    if (event.is_free || event.priceRanges?.[0]?.min === 0) return 'Free';
    if (event.ageRestrictions?.legalAgeEnforced) return '18+';
    if (event.classifications?.[0]?.genre?.name) return event.classifications[0].genre.name;
    return 'Event';
  }

  private getCategoryTypes(category: string): string {
    const typeMap: Record<string, string> = {
      // SECTION 4 - Restaurants
      'restaurants': 'restaurant',
      'indian': 'restaurant', // Will filter by cuisine name separately
      
      // SECTION 5 - Places (tourist attractions, landmarks, museums, parks)
      'places': 'tourist_attraction|landmark|museum|park',
      
      // SECTION 6 - Activities
      'activities': 'bowling_alley|amusement_park|aquarium|arcade|gym|spa',
      
      // SECTION 6 - Nightlife (ONLY bars, clubs, pubs, lounges)
      'nightlife': 'night_club|bar',
      
      // SECTION 7 - Outdoor (parks, trails, nature)
      'outdoor': 'park|campground|hiking_area|nature_reserve',
      
      // SECTION 8 - Student picks (cafes, budget restaurants, study spots)
      'student': 'cafe|restaurant|library|park',
      
      // SECTION 9 - Deals (free attractions, budget options)
      'deals': 'park|tourist_attraction|museum'
    };
    return typeMap[category] || 'point_of_interest';
  }

  private getCategoryQuery(category: string): string {
    const queryMap: Record<string, string> = {
      // SECTION 4 - Restaurants with cuisine specificity
      'restaurants': 'top rated restaurants highly rated',
      'indian': 'authentic indian restaurants biryani curry tandoor',
      
      // SECTION 5 - Places (must be real tourist attractions)
      'places': 'famous landmarks tourist attractions museums art galleries',
      
      // SECTION 6 - Activities (fun entertainment venues)
      'activities': 'fun activities bowling gaming entertainment arcade escape rooms',
      
      // SECTION 6 - Nightlife (bars and clubs ONLY)
      'nightlife': 'popular bars nightclubs dance clubs live music venues',
      
      // SECTION 7 - Outdoor (nature spots only)
      'outdoor': 'beautiful parks hiking trails nature scenic outdoor',
      
      // SECTION 8 - Student friendly (cheap, popular)
      'student': 'popular student hangouts cafes budget friendly study spots',
      
      // SECTION 9 - Deals and free options
      'deals': 'free attractions budget friendly cheap popular'
    };
    return queryMap[category] || category;
  }

  private transformToExploreItems(places: GooglePlace[], category: string): ExploreItem[] {
    // Filter out duplicates using place_id AND apply quality standards
    const uniquePlaces = places.filter(place => {
      if (this.seenPlaceIds.has(place.place_id)) {
        return false;
      }
      
      // SECTION 1.1 - Global Quality Filters (Apply to ALL Categories)
      const hasRealPhoto = place.photos && place.photos.length > 0;
      const hasValidRating = place.rating && place.rating >= this.MINIMUM_QUALITY_RATING;
      const hasEnoughReviews = place.user_ratings_total && place.user_ratings_total >= this.MINIMUM_REVIEWS;
      const hasValidAddress = place.vicinity || place.formatted_address;
      const isNotPermanentlyClosed = !place.business_status || place.business_status !== 'CLOSED_PERMANENTLY';
      
      // Must meet all global quality criteria
      if (!hasRealPhoto || !hasValidRating || !hasEnoughReviews || !hasValidAddress || !isNotPermanentlyClosed) {
        return false;
      }
      
      // SECTION 4.2 & 4.3 - Restaurant-Specific Strict Filtering
      if (category === 'restaurants' || category === 'indian') {
        // Must have 'restaurant' in types array
        const isRestaurant = place.types?.includes('restaurant');
        if (!isRestaurant) {
          console.log('[Filter] Rejected non-restaurant:', place.name, place.types);
          return false;
        }
        
        // Must have minimum 50 reviews for restaurants (higher standard)
        if (place.user_ratings_total && place.user_ratings_total < 50) {
          return false;
        }
        
        // REJECT if contains blocked types (hotels, stadiums, etc.)
        const hasRejectedType = place.types?.some(type => 
          this.REJECTED_RESTAURANT_TYPES.includes(type)
        );
        if (hasRejectedType) {
          console.log('[Filter] Rejected restaurant with blocked type:', place.name, place.types);
          return false;
        }
        
        // For Indian restaurants: name MUST match cuisine dictionary
        if (category === 'indian') {
          const nameLower = place.name.toLowerCase();
          const matchesCuisine = this.INDIAN_KEYWORDS.some(keyword => 
            nameLower.includes(keyword)
          );
          if (!matchesCuisine) {
            console.log('[Filter] Rejected non-Indian restaurant:', place.name);
            return false;
          }
        }
      }
      
      // SECTION 5 - Places Category Strict Type Filtering
      if (category === 'places') {
        const hasValidPlaceType = place.types?.some(type => 
          this.VALID_PLACE_TYPES.includes(type)
        );
        const hasRejectedType = place.types?.some(type => 
          this.REJECTED_PLACE_TYPES.includes(type)
        );
        if (!hasValidPlaceType || hasRejectedType) {
          console.log('[Filter] Rejected invalid place:', place.name, place.types);
          return false;
        }
      }
      
      // SECTION 6 - Nightlife Category Strict Filtering
      if (category === 'nightlife') {
        const hasValidType = place.types?.some(type => 
          this.VALID_NIGHTLIFE_TYPES.includes(type)
        );
        if (!hasValidType) {
          console.log('[Filter] Rejected non-nightlife venue:', place.name, place.types);
          return false;
        }
      }
      
      // SECTION 6 - Activities Category Filtering
      if (category === 'activities') {
        const hasValidType = place.types?.some(type => 
          this.VALID_ACTIVITY_TYPES.includes(type)
        );
        if (!hasValidType) {
          return false;
        }
      }
      
      // SECTION 7 - Outdoor Category Strict Filtering
      if (category === 'outdoor') {
        const hasValidType = place.types?.some(type => 
          this.VALID_OUTDOOR_TYPES.includes(type)
        );
        const hasRejectedType = place.types?.some(type => 
          this.REJECTED_OUTDOOR_TYPES.includes(type)
        );
        if (!hasValidType || hasRejectedType) {
          console.log('[Filter] Rejected non-outdoor place:', place.name, place.types);
          return false;
        }
      }
      
      this.seenPlaceIds.add(place.place_id);
      return true;
    });

    return uniquePlaces.map((place, index) => ({
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
      attendees: place.user_ratings_total || Math.floor(Math.random() * 200) + 20,
      spotsLeft: place.opening_hours?.open_now ? 'Open Now' : 'Check Hours',
      placeId: place.place_id,
      rating: place.rating,
      photos: place.photos?.map(p => this.getPhotoUrl(p.photo_reference)) || [],
      description: this.generateDescription(place),
      address: place.formatted_address || place.vicinity,
      officialUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      externalUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      source: 'google_places',
      website: undefined, // Would come from place details API if available
      isExternal: true // Open in external browser/tab
    }));
  }

  private getPlaceImage(place: GooglePlace): string {
    if (place.photos && place.photos.length > 0) {
      return this.getPhotoUrl(place.photos[0].photo_reference);
    }
    
    // Fallback to category-based Unsplash images based on place types
    if (place.types && place.types.length > 0) {
      const categoryImages: Record<string, string> = {
        restaurant: 'photo-1414235077428-338989a2e8c0',
        food: 'photo-1504674900247-0877df9cc836',
        cafe: 'photo-1495474472287-4d71bcdd2085',
        bar: 'photo-1566417713940-fe7c737a9ef2',
        park: 'photo-1441974231531-c6227db76b6e',
        museum: 'photo-1564399579883-451a5d44ec08',
        art_gallery: 'photo-1547826039-bfc35e0f1ea8',
        gym: 'photo-1534438327276-14e5300c3a48',
        tourist_attraction: 'photo-1503220317375-aaad61436b1b',
        night_club: 'photo-1566737236500-c8ac43014a67',
        shopping_mall: 'photo-1441986300917-64674bd600d8',
        movie_theater: 'photo-1489599849927-2ee91cede3ba',
        bowling_alley: 'photo-1588731086359-c1a0cdcb4d24',
        stadium: 'photo-1508656694481-f7f3f4f4f6f3',
        library: 'photo-1521587760476-6c12a4b040da',
        university: 'photo-1562774053-701939374585',
        lodging: 'photo-1566073771259-6a8506099945',
        church: 'photo-1548625361-1d4cb49b42a1',
        default: 'photo-1506905925346-21bda4d32df4'
      };
      
      const type = place.types[0];
      const imageId = categoryImages[type] || categoryImages['default'];
      return `https://images.unsplash.com/${imageId}?w=800&q=80`;
    }
    
    return this.FALLBACK_IMAGE;
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

  /**
   * SECTION 10 - Smart Sorting Algorithm
   * score = (rating * 20) + (reviews / 5) + (isOpen ? 15 : 0) - (distance * 2)
   */
  private sortByRating(items: ExploreItem[]): ExploreItem[] {
    return items.sort((a, b) => {
      const scoreA = this.calculateSmartScore(a);
      const scoreB = this.calculateSmartScore(b);
      return scoreB - scoreA;
    });
  }
  
  private calculateSmartScore(item: ExploreItem): number {
    const rating = item.rating || 0;
    const reviews = item.attendees || 0; // attendees field stores user_ratings_total
    const isOpen = item.spotsLeft === 'Open Now';
    const distanceMiles = parseFloat(item.distance.replace(' mi', '')) || 5;
    
    // Apply formula from SECTION 10
    const score = (rating * 20) + (reviews / 5) + (isOpen ? 15 : 0) - (distanceMiles * 2);
    
    return score;
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

  /**
   * Search for locations using Google Places Autocomplete
   */
  searchLocations(query: string): Observable<any[]> {
    return this.http.get<any>(`${this.API_BASE}/autocomplete`, {
      params: { input: query }
    }).pipe(
      map(response => response.predictions || []),
      catchError(err => {
        console.error('[Explore] Location search error:', err);
        return of([]);
      })
    );
  }

  /**
   * Search for cities only using Google Places Autocomplete API
   * Restricts results to city-level locations for better UX
   */
  searchCities(query: string): Observable<any[]> {
    const url = `${this.API_BASE}/autocomplete`;
    const params = { 
      input: query,
      types: '(cities)'  // Restrict to cities only (Google Places API parameter)
    };
    
    console.log('[ExploreData] 🔍 Calling city search API:', url, params);
    
    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        console.log('[ExploreData] ✅ City search API response:', response);
        
        if (response.warning) {
          console.warn('[ExploreData] ⚠️ API Warning:', response.warning);
        }
        
        const predictions = response.predictions || [];
        console.log('[ExploreData] 📊 Raw predictions count:', predictions.length);
        
        // Don't filter on client-side since backend is sending (cities) type
        // Just return all predictions from the API
        console.log('[ExploreData] ✅ Returning city results:', predictions.length);
        return predictions;
      }),
      catchError(err => {
        console.error('[ExploreData] ❌ City search error:', err);
        console.error('[ExploreData] Error status:', err.status);
        console.error('[ExploreData] Error details:', err.error);
        console.error('[ExploreData] Error message:', err.message);
        return of([]);
      })
    );
  }

  /**
   * Get place details including coordinates
   */
  getPlaceDetails(placeId: string): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/details`, {
      params: { place_id: placeId }
    }).pipe(
      map(response => response.result),
      catchError(err => {
        console.error('[Explore] Place details error:', err);
        throw err;
      })
    );
  }

}
