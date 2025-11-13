import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GeoSuggestion {
  id: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  name: string; // alias
}

export interface AddressSuggestion {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);
  search(query: string): Observable<GeoSuggestion[]> {
    if (!query || query.trim().length < 2) return new Observable(sub => { sub.next([]); sub.complete(); });
    return this.http.get<{ items: any[] }>(`/api/geo/search?q=${encodeURIComponent(query.trim())}`).pipe(
      map(res => (res.items || []).map(r => ({
        id: r.id,
        city: r.city,
        state: r.state,
        country: r.country,
        lat: r.lat,
        lon: r.lon,
        name: r.name
      }) as GeoSuggestion))
    );
  }

  addressLookup(query: string, opts?: { city?: string; state?: string; lat?: number; lon?: number }): Observable<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) return new Observable(sub => { sub.next([]); sub.complete(); });
    const params = new URLSearchParams({ q: query.trim() });
    if (opts?.city) params.set('city', opts.city);
    if (opts?.state) params.set('state', opts.state);
    if (typeof opts?.lat === 'number') params.set('lat', String(opts.lat));
    if (typeof opts?.lon === 'number') params.set('lon', String(opts.lon));
    return this.http.get<{ items: any[] }>(`/api/geo/address?${params.toString()}`).pipe(
      map(res => (res.items || []).map(r => ({
        id: r.id,
        label: r.label,
        address: r.address,
        city: r.city,
        state: r.state,
        postcode: r.postcode,
        country: r.country,
        lat: r.lat,
        lon: r.lon
      }) as AddressSuggestion))
    );
  }
}
