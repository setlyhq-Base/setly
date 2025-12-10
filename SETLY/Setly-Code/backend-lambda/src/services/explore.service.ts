import axios, { AxiosError } from 'axios';
import { secretsService } from './secrets.service';
import { cacheService } from './cache.service';

export interface ExploreItem {
  id: string;
  name: string;
  type: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceLevel?: number;
  address: string;
  distance?: number;
  imageUrl?: string;
  description?: string;
  lat: number;
  lng: number;
  source: string;
}

class ExploreService {
  private googleMapsApiKey: string | null = null;
  private ticketmasterApiKey: string | null = null;
  private eventbriteApiKey: string | null = null;

  async initialize() {
    if (!this.googleMapsApiKey) {
      const keys = await secretsService.getAllApiKeys();
      this.googleMapsApiKey = keys.googleMaps;
      this.ticketmasterApiKey = keys.ticketmaster;
      this.eventbriteApiKey = keys.eventbrite;
    }
  }

  /**
   * Fetch places from Google Places API with quality filters
   */
  private async fetchGooglePlaces(
    lat: number,
    lng: number,
    type: string,
    keyword?: string
  ): Promise<ExploreItem[]> {
    await this.initialize();

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lng}`,
            radius: 5000,
            type,
            keyword,
            key: this.googleMapsApiKey
          },
          timeout: 10000
        }
      );

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.warn('Google Places API warning:', response.data.status);
      }

      const places = response.data.results || [];

      // Apply quality filters
      return places
        .filter((place: any) => {
          // Minimum rating threshold
          if (place.rating && place.rating < 3.5) return false;
          // Minimum review count
          if (place.user_ratings_total && place.user_ratings_total < 10) return false;
          // Must have a name
          if (!place.name) return false;
          return true;
        })
        .map((place: any) => ({
          id: place.place_id,
          name: place.name,
          type: place.types?.[0] || type,
          category: this.mapTypeToCategory(type),
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          priceLevel: place.price_level,
          address: place.vicinity || '',
          imageUrl: place.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.googleMapsApiKey}`
            : undefined,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          source: 'google'
        }))
        .slice(0, 20); // Limit to top 20
    } catch (error) {
      console.error('Error fetching Google Places:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Fetch events from Ticketmaster
   */
  private async fetchTicketmasterEvents(
    lat: number,
    lng: number,
    city: string
  ): Promise<ExploreItem[]> {
    await this.initialize();

    try {
      const response = await axios.get(
        'https://app.ticketmaster.com/discovery/v2/events.json',
        {
          params: {
            apikey: this.ticketmasterApiKey,
            latlong: `${lat},${lng}`,
            radius: 25,
            unit: 'miles',
            size: 20,
            sort: 'date,asc'
          },
          timeout: 10000
        }
      );

      const events = response.data._embedded?.events || [];

      return events.map((event: any) => ({
        id: event.id,
        name: event.name,
        type: 'event',
        category: 'events',
        rating: 0,
        reviewCount: 0,
        address: event._embedded?.venues?.[0]?.address?.line1 || city,
        description: event.info || event.description,
        imageUrl: event.images?.[0]?.url,
        lat: parseFloat(event._embedded?.venues?.[0]?.location?.latitude) || lat,
        lng: parseFloat(event._embedded?.venues?.[0]?.location?.longitude) || lng,
        source: 'ticketmaster'
      }));
    } catch (error) {
      console.error('Error fetching Ticketmaster events:', error);
      return [];
    }
  }

  /**
   * Map Google type to our category
   */
  private mapTypeToCategory(type: string): string {
    const mapping: Record<string, string> = {
      restaurant: 'restaurants',
      cafe: 'restaurants',
      bar: 'nightlife',
      night_club: 'nightlife',
      tourist_attraction: 'places',
      museum: 'places',
      park: 'outdoor',
      amusement_park: 'activities',
      movie_theater: 'activities'
    };
    return mapping[type] || 'places';
  }

  /**
   * Get explore data for a category with caching and fallback
   */
  async getExploreData(
    city: string,
    category: string,
    lat: number,
    lng: number
  ): Promise<ExploreItem[]> {
    // Check cache first
    const cached = cacheService.getCachedExploreResults(city, category, lat, lng);
    if (cached) {
      console.log(`Cache hit for ${city}/${category}`);
      return cached;
    }

    console.log(`Fetching fresh data for ${city}/${category}`);

    let results: ExploreItem[] = [];

    try {
      switch (category) {
        case 'trending':
          // Mix of top-rated places
          const [restaurants, places] = await Promise.all([
            this.fetchGooglePlaces(lat, lng, 'restaurant'),
            this.fetchGooglePlaces(lat, lng, 'tourist_attraction')
          ]);
          results = [...restaurants, ...places]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 20);
          break;

        case 'restaurants':
          results = await this.fetchGooglePlaces(lat, lng, 'restaurant');
          break;

        case 'places':
          results = await this.fetchGooglePlaces(lat, lng, 'tourist_attraction');
          break;

        case 'activities':
          results = await this.fetchGooglePlaces(lat, lng, 'amusement_park', 'activities');
          break;

        case 'nightlife':
          const [bars, clubs] = await Promise.all([
            this.fetchGooglePlaces(lat, lng, 'bar'),
            this.fetchGooglePlaces(lat, lng, 'night_club')
          ]);
          results = [...bars, ...clubs].slice(0, 20);
          break;

        case 'outdoor':
          results = await this.fetchGooglePlaces(lat, lng, 'park');
          break;

        case 'events':
          results = await this.fetchTicketmasterEvents(lat, lng, city);
          break;

        default:
          results = [];
      }

      // Cache the results
      cacheService.cacheExploreResults(city, category, results, lat, lng);

      return results;
    } catch (error) {
      console.error(`Error getting explore data for ${category}:`, error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Search cities using Google Places Autocomplete
   */
  async searchCities(query: string): Promise<any[]> {
    await this.initialize();

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: query,
            types: '(cities)',
            key: this.googleMapsApiKey
          },
          timeout: 5000
        }
      );

      return response.data.predictions || [];
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<any> {
    await this.initialize();

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            fields: 'geometry,formatted_address,name',
            key: this.googleMapsApiKey
          },
          timeout: 5000
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }
}

export const exploreService = new ExploreService();
