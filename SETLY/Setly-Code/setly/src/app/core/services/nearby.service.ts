import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface NearbyChip {
  emoji: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class NearbyService {
  getChips(params: { city?: string; state?: string; lat?: number; lng?: number }): Observable<NearbyChip[]> {
    // Lightweight heuristic; replace with real Places API when available
    const { city, state } = params;
    const base: NearbyChip[] = [
      { emoji: '🏫', label: 'University' },
      { emoji: '☕', label: 'Café' },
      { emoji: '🏋️', label: 'Gym' },
      { emoji: '🚌', label: 'Transit Stop' }
    ];
    // Small flavor tweaks by city/state
    const flavored = [...base];
    if ((city || '').toLowerCase().includes('plano')) flavored.splice(1, 0, { emoji: '🛒', label: 'Whole Foods' });
    if ((state || '').toUpperCase() === 'MA') flavored.push({ emoji: '📚', label: 'Library' });
    return of(flavored.slice(0, 6));
  }
}
