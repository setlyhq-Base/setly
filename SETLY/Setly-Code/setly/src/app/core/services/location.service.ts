import { Injectable, signal } from '@angular/core';

/// <reference types="@types/google.maps" />

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
}

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocation = signal<UserLocation | null>(null);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  /**
   * Get user's current location using browser geolocation API
   * Prioritizes GPS, falls back to IP only if denied
   */
  async getCurrentLocation(): Promise<UserLocation | null> {
    this.isLoading.set(true);
    this.error.set(null);

    // ALWAYS try browser geolocation first
    if ('geolocation' in navigator) {
      console.log('📍 Requesting browser location permission...');
      
      try {
        const position = await this.getBrowserLocation();
        if (position) {
          console.log('✅ GPS location obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy + 'm'
          });
          
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Reverse geocode to get city/state (non-blocking)
          this.reverseGeocode(location).catch(() => {});
          
          this.currentLocation.set(location);
          this.isLoading.set(false);
          return location;
        }
      } catch (err: any) {
        console.warn('⚠️ Browser geolocation failed:', err.message);
      }
    }

    // Only use IP fallback if GPS completely failed or was denied
    console.log('🌐 Falling back to IP-based location...');
    try {
      const ipLocation = await this.getIPBasedLocation();
      console.log('✅ IP location obtained:', ipLocation);
      this.currentLocation.set(ipLocation);
      this.isLoading.set(false);
      return ipLocation;
    } catch (err) {
      console.error('❌ All location methods failed:', err);
      this.error.set('Unable to determine location. Please enable location access.');
      this.isLoading.set(false);
      return null; // Return null instead of hardcoded fallback
    }
  }

  /**
   * Get location from browser geolocation API with better error handling
   */
  private getBrowserLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Browser provided position:', position);
          resolve(position);
        },
        (error) => {
          let errorMsg = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out';
              break;
          }
          console.warn('⚠️ Geolocation error:', errorMsg);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased to 15 seconds
          maximumAge: 0 // Always get fresh location, no cache
        }
      );
    });
  }

  /**
   * Get location based on IP address (fallback)
   */
  private async getIPBasedLocation(): Promise<UserLocation> {
    try {
      // Using ipapi.co for IP-based location (free tier)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        state: data.region,
        country: data.country_name
      };
    } catch (err) {
      console.error('IP location error:', err);
      // Return San Francisco as ultimate fallback
      return {
        lat: 37.7749,
        lng: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'USA'
      };
    }
  }

  /**
   * Reverse geocode coordinates to get city/state/country
   */
  private async reverseGeocode(location: UserLocation): Promise<void> {
    if (typeof google === 'undefined' || !google.maps) {
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat: location.lat, lng: location.lng }
      });

      if (result.results && result.results[0]) {
        const addressComponents = result.results[0].address_components;
        
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            location.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            location.state = component.short_name;
          }
          if (component.types.includes('country')) {
            location.country = component.long_name;
          }
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  }

  /**
   * Geocode a city/state to get coordinates
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (typeof google === 'undefined' || !google.maps) {
      return null;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });

      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    if (typeof google !== 'undefined' && google.maps && google.maps.geometry) {
      const point1 = new google.maps.LatLng(lat1, lng1);
      const point2 = new google.maps.LatLng(lat2, lng2);
      return google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000; // Convert to km
    }

    // Haversine formula fallback
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Getters for reactive state
  getLocation = () => this.currentLocation();
  getIsLoading = () => this.isLoading();
  getError = () => this.error();
}
