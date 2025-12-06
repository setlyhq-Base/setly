import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface UniversityLite {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

@Injectable({ providedIn: 'root' })
export class UniversityLookupService {
  private http = inject(HttpClient);

  fetch(city: string | null, query: string): Observable<UniversityLite[]> {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (query) params.set('query', query);
    const url = `/api/universities?${params.toString()}`;
    return this.http.get<{ list: UniversityLite[] }>(url).pipe(map(r => r.list || []));
  }
}