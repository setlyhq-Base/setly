import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id: string;
  name: string;
  type: 'university' | 'city';
  state?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private cache = new Map<string, { results: SearchResult[]; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 60 seconds

  private searchSubject = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // Check cache
    const cached = this.cache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.results);
    }

    // Mock search - in real app, call API
    const mockResults: SearchResult[] = [
      { id: '1', name: 'Harvard University', type: 'university' as const, state: 'MA' },
      { id: '2', name: 'Stanford University', type: 'university' as const, state: 'CA' },
      { id: '3', name: 'Cambridge', type: 'city' as const, state: 'MA' },
      { id: '4', name: 'Palo Alto', type: 'city' as const, state: 'CA' },
    ].filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    // Cache results
    this.cache.set(query, { results: mockResults, timestamp: Date.now() });

    return of(mockResults).pipe(
      catchError(() => of([]))
    );
  }

  debouncedSearch(): Observable<SearchResult[]> {
    return this.searchSubject.pipe(
      debounceTime(250),
      switchMap(query => this.search(query))
    );
  }

  updateSearchQuery(query: string): void {
    this.searchSubject.next(query);
  }
}
