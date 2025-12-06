import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: { main_text: string; secondary_text?: string };
}

export interface PlaceDetailsResult {
  formatted_address: string;
  geometry?: { location?: { lat: number; lng: number } };
  address_components?: Array<{ long_name: string; short_name: string; types: string[] }>; 
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private sessionToken: string | null = null;
  // Simple in-memory caches (session scoped) to avoid re-fetching identical queries user quickly revisits.
  private autocompleteCache = new Map<string, PlacePrediction[]>();
  private textSearchCache = new Map<string, PlaceDetailsResult[]>();
  private maxCacheEntries = 50;
  private currentAutocompleteSub: Subscription | null = null;
  private currentTextSearchSub: Subscription | null = null;
  constructor(private http: HttpClient) {}

  private ensureSession() {
    if (!this.sessionToken) {
      // Simple random token; backend passes through to Google to improve suggestions grouping
      this.sessionToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    return this.sessionToken;
  }

  resetSession() { this.sessionToken = null; }

  /** Abort any in-flight requests (used before issuing a new query). */
  abortInFlight() {
    if (this.currentAutocompleteSub) { this.currentAutocompleteSub.unsubscribe(); this.currentAutocompleteSub = null; }
    if (this.currentTextSearchSub) { this.currentTextSearchSub.unsubscribe(); this.currentTextSearchSub = null; }
  }

  /** Clear caches (called when session resets after a selection). */
  clearCaches() {
    this.autocompleteCache.clear();
    this.textSearchCache.clear();
  }

  private touchCacheEntry<T>(map: Map<string,T>, key: string) {
    // Maintain simple LRU by reinserting key; trim if size exceeds max
    const val = map.get(key);
    if (val !== undefined) {
      map.delete(key);
      map.set(key, val);
    }
    if (map.size > this.maxCacheEntries) {
      // delete oldest (first inserted) - keys().next().value is defined because size > maxCacheEntries >= 1
      const firstKey = map.keys().next().value as string;
      if (firstKey !== undefined) map.delete(firstKey);
    }
  }

  private storeAutocomplete(query: string, results: PlacePrediction[]) {
    this.autocompleteCache.set(query, results);
    this.touchCacheEntry(this.autocompleteCache, query);
  }
  private storeTextSearch(query: string, results: PlaceDetailsResult[]) {
    this.textSearchCache.set(query, results);
    this.touchCacheEntry(this.textSearchCache, query);
  }

  /** Abortable + cached autocomplete; invokes callback with results. */
  autocompleteAbortable(input: string, cb: (results: PlacePrediction[]) => void) {
    const session = this.ensureSession();
    const query = input.trim();
    if (!query) { cb([]); return; }
    // Serve from cache immediately if present.
    const cached = this.autocompleteCache.get(query);
    if (cached) { cb(cached); return; }
    this.abortInFlight();
    this.currentAutocompleteSub = this.http.get<{ predictions: PlacePrediction[] }>(`/api/places/autocomplete`, {
      params: { input: query, session }
    }).pipe(
      map(r => r.predictions || []),
      catchError(() => of([]))
    ).subscribe(list => {
      this.storeAutocomplete(query, list);
      cb(list);
    });
  }

  // Legacy observable method retained for backwards compatibility (no caching/abort).
  autocomplete(input: string): Observable<PlacePrediction[]> {
    const session = this.ensureSession();
    const query = input.trim();
    if (!query) return of([]);
    return this.http.get<{ predictions: PlacePrediction[] }>(`/api/places/autocomplete`, { params: { input: query, session } }).pipe(
      map(r => r.predictions || []),
      catchError(() => of([]))
    );
  }

  details(placeId: string): Observable<PlaceDetailsResult | null> {
    const session = this.ensureSession();
    return this.http.get<{ result: PlaceDetailsResult }>(`/api/places/details`, {
      params: { placeId, session }
    }).pipe(
      map(r => r.result || null),
      catchError(() => of(null))
    );
  }

  /** Abortable + cached text search fallback. */
  textSearchAbortable(query: string, cb: (results: PlaceDetailsResult[]) => void) {
    const q = query.trim();
    if (!q) { cb([]); return; }
    const cached = this.textSearchCache.get(q);
    if (cached) { cb(cached); return; }
    this.abortInFlight();
    this.currentTextSearchSub = this.http.get<{ results: any[] }>(`/api/places/textsearch`, { params: { query: q } }).pipe(
      map(r => (r.results || []).map(x => ({
        formatted_address: x.formatted_address || x.name,
        geometry: x.geometry,
        name: x.name
      })) as PlaceDetailsResult[]),
      catchError(() => of([]))
    ).subscribe(results => {
      this.storeTextSearch(q, results);
      cb(results);
    });
  }

  // Legacy observable fallback.
  textSearch(query: string): Observable<PlaceDetailsResult[]> {
    const q = query.trim();
    if (!q) return of([]);
    return this.http.get<{ results: any[] }>(`/api/places/textsearch`, { params: { query: q } }).pipe(
      map(r => (r.results || []).map(x => ({
        formatted_address: x.formatted_address || x.name,
        geometry: x.geometry,
        name: x.name
      })) as PlaceDetailsResult[]),
      catchError(() => of([]))
    );
  }
}