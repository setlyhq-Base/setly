import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type GeoSuggestionKind = 'city' | 'university' | 'fallback';

export interface GeoSuggestion {
  id: string;
  label: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  description?: string;
  kind: GeoSuggestionKind;
  source: 'google_places' | 'universities' | 'open_meteo';
  name?: string;
  meta?: Record<string, unknown>;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  lat?: number;
  lon?: number;
  description?: string;
  source: 'google_places' | 'nominatim';
  meta?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);
  search(query: string): Observable<GeoSuggestion[]> {
    if (!query || query.trim().length < 2) return new Observable(sub => { sub.next([]); sub.complete(); });
    return this.http.get<{ items: any[] }>(`/api/geo/search?q=${encodeURIComponent(query.trim())}`).pipe(
      map(res => (res.items || []).map(r => normalizeSuggestion(r)))
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
      map(res => (res.items || []).map(r => normalizeAddressSuggestion(r)))
    );
  }
}

function normalizeSuggestion(raw: any): GeoSuggestion {
  const labelParts = [raw?.label, raw?.name, [raw?.city, raw?.state, raw?.country].filter(Boolean).join(', '), raw?.city, raw?.state, raw?.country]
    .map((v: any) => typeof v === 'string' ? v.trim() : '')
    .filter(Boolean);
  const label = labelParts[0] || 'Unknown location';
  const kind: GeoSuggestionKind = raw?.kind && ['city', 'university', 'fallback'].includes(raw.kind)
    ? raw.kind
    : 'city';
  const source = (raw?.source === 'google_places' || raw?.source === 'universities' || raw?.source === 'open_meteo')
    ? raw.source
    : 'open_meteo';
  const toNumber = (value: any): number | undefined => (typeof value === 'number' ? value : undefined);
  return {
    id: String(raw?.id ?? `suggestion:${label}:${Math.random().toString(36).slice(2)}`),
    label,
    city: raw?.city || undefined,
    state: raw?.state || undefined,
    country: raw?.country || undefined,
    lat: toNumber(raw?.lat),
    lon: toNumber(raw?.lon),
    description: raw?.description || undefined,
    kind,
    source,
    name: raw?.name || label,
    meta: raw?.meta && typeof raw.meta === 'object' ? raw.meta : undefined
  };
}

function normalizeAddressSuggestion(raw: any): AddressSuggestion {
  const label = typeof raw?.label === 'string' && raw.label.trim()
    ? raw.label.trim()
    : (typeof raw?.address === 'string' ? raw.address.trim() : 'Unknown address');
  const source = raw?.source === 'google_places' ? 'google_places' : 'nominatim';
  const toNumber = (value: any): number | undefined => (typeof value === 'number' ? value : undefined);
  return {
    id: String(raw?.id ?? `addr:${label}:${Math.random().toString(36).slice(2)}`),
    label,
    address: typeof raw?.address === 'string' ? raw.address : label,
    city: typeof raw?.city === 'string' ? raw.city : '',
    state: typeof raw?.state === 'string' ? raw.state : '',
    postcode: typeof raw?.postcode === 'string' ? raw.postcode : undefined,
    country: typeof raw?.country === 'string' ? raw.country : '',
    lat: toNumber(raw?.lat),
    lon: toNumber(raw?.lon),
    description: typeof raw?.description === 'string' ? raw.description : undefined,
    source,
    meta: raw?.meta && typeof raw.meta === 'object' ? raw.meta : undefined
  };
}
