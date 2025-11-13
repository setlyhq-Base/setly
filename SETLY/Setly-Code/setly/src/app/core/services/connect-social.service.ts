import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { PulseHighlight, SavedSearch, SuggestionPerson } from '../../features/connect/models/connect.models';

@Injectable({ providedIn: 'root' })
export class ConnectSocialService {
  private http = inject(HttpClient);

  getSuggestions(): Observable<SuggestionPerson[]> {
    return this.http.get<SuggestionPerson[]>('/api/connect/suggestions').pipe(
      catchError(() => of(this.mockSuggestions()))
    );
  }

  getSavedSearches(): Observable<SavedSearch[]> {
    return this.http.get<SavedSearch[]>('/api/connect/saved-searches').pipe(
      catchError(() => of(this.mockSavedSearches()))
    );
  }

  patchSavedSearch(id: string, patch: Partial<Pick<SavedSearch, 'label' | 'active'>>): Observable<SavedSearch> {
    return this.http.patch<SavedSearch>(`/api/connect/saved-searches/${id}`, patch).pipe(
      catchError(() => of({ id, label: patch.label || 'Updated', active: !!patch.active, updatedAt: new Date().toISOString() }))
    );
  }

  getPulse(): Observable<PulseHighlight[]> {
    return this.http.get<PulseHighlight[]>('/api/connect/pulse').pipe(
      catchError(() => of(this.mockPulse()))
    );
  }

  connect(userId: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`/api/connect/connect/${userId}`, {}).pipe(
      map(() => ({ ok: true })),
      catchError(() => of({ ok: true }))
    );
  }

  // ---- Mocks ----
  private mockSuggestions(): SuggestionPerson[] {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: 'sugg-' + i,
      name: 'Student ' + (i + 1),
      initial: ('S' + (i + 1)).slice(0, 2),
      mutualUniversity: i % 2 === 0 ? 'Northeastern' : 'Harvard',
      activeNow: Math.random() > 0.5,
      connected: false,
      verified: { university: Math.random() > 0.5, email: true, photo: true }
    }));
  }

  private mockSavedSearches(): SavedSearch[] {
    return [
      { id: 'sv1', label: 'Boston rooms < $1200', active: true, updatedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
      { id: 'sv2', label: 'SetlyRide to Airport', active: false, updatedAt: new Date(Date.now() - 6*24*60*60*1000).toISOString() }
    ];
  }

  private mockPulse(): PulseHighlight[] {
    return [
      { id: 'p1', title: 'Top verified hosts this week', metric: '5', icon: this.iconMedal() },
      { id: 'p2', title: 'New Boston listings', metric: '12', icon: this.iconPin() },
      { id: 'p3', title: 'Popular ride routes', metric: '3', icon: this.iconCar() }
    ];
  }

  // Inline icon helpers
  private iconMedal(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#5A4FF3" stroke-width="1.5"/><path d="M8 12l-2 8 6-3 6 3-2-8" stroke="#5A4FF3" stroke-width="1.5" stroke-linejoin="round"/></svg>'; }
  private iconPin(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#5A4FF3" stroke-width="1.5"/><circle cx="12" cy="9" r="2" fill="#5A4FF3"/></svg>'; }
  private iconCar(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-5h14l2 5v5H3v-5z" stroke="#5A4FF3" stroke-width="1.5"/><circle cx="7.5" cy="17" r="1.5" fill="#5A4FF3"/><circle cx="16.5" cy="17" r="1.5" fill="#5A4FF3"/></svg>'; }
}
