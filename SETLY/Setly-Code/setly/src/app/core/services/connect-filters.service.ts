import { Injectable, Signal, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { ConnectFilterParams } from '../../features/connect/models/connect.models';

@Injectable({ providedIn: 'root' })
export class ConnectFiltersService {
  private readonly _filters = signal<ConnectFilterParams>({
    city: undefined,
    universityId: undefined,
    interests: [],
    verifiedOnly: false,
    q: undefined,
    sort: 'trending',
    roomType: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    includeTypes: []
  });
  private _previous: ConnectFilterParams | null = null;
  private lastQueryParamsString = '';
  private lastAnalyticsTs = 0;

  constructor(private router: Router, private route: ActivatedRoute, private analytics: AnalyticsService) {
    // Initialize and react to URL query params
    this.route.queryParamMap
      .pipe(
        map(params => {
          const interests = params.get('interests')?.split(',').filter(Boolean) ?? [];
          const verifiedOnly = params.get('verifiedOnly') === '1';
          const sort = (params.get('sort') as 'trending' | 'new' | 'near') || 'trending';
          const next: ConnectFilterParams = {
            city: params.get('city') || undefined,
            universityId: params.get('university') || undefined,
            interests,
            verifiedOnly,
            q: params.get('q') || undefined,
            sort,
            roomType: (params.get('roomType') as 'shared' | 'private') || undefined,
            minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
            maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
            includeTypes: params.get('types') ? (params.get('types')!.split(',') as any) : []
          };
          return next;
        })
      )
      .subscribe(next => this._filters.set(next));
  }

  filters(): Signal<ConnectFilterParams> {
    return this._filters.asReadonly();
  }

  setFilters(partial: Partial<ConnectFilterParams>): void {
    // Save previous snapshot for Reset
    this._previous = this._filters();
    const current = this._filters();
    const next: ConnectFilterParams = { ...current, ...partial } as any;
    // Normalize includeTypes: undefined or [] treated same
    if (!next.includeTypes || (Array.isArray(next.includeTypes) && !next.includeTypes.length)) {
      next.includeTypes = [];
    }
    // Shallow equality check to avoid loops (arrays compared by JSON)
    const changed = !this.shallowEqual(current, next);
    if (!changed) { return; }
    this._filters.set(next);
    // Sync to URL query params (merge)
    const queryParams: Record<string, any> = {
      city: next.city || undefined,
      university: next.universityId || undefined,
      interests: next.interests && next.interests.length ? next.interests.join(',') : undefined,
      verifiedOnly: next.verifiedOnly ? '1' : undefined,
      q: next.q || undefined,
      sort: next.sort || undefined,
      roomType: next.roomType || undefined,
      minPrice: typeof next.minPrice === 'number' ? String(next.minPrice) : undefined,
      maxPrice: typeof next.maxPrice === 'number' ? String(next.maxPrice) : undefined,
      types: next.includeTypes && next.includeTypes.length ? next.includeTypes.join(',') : undefined
    };
    const qpString = JSON.stringify(queryParams);
    if (qpString !== this.lastQueryParamsString) {
      this.lastQueryParamsString = qpString;
      this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
    }
    // Throttle analytics to 1 event / 300ms
    const now = Date.now();
    if (now - this.lastAnalyticsTs > 300) {
      this.lastAnalyticsTs = now;
      this.analytics.track('filter_changed', { ...queryParams });
    }
  }

  clearAll(): void {
    this._previous = this._filters();
    this.setFilters({ city: undefined, universityId: undefined, interests: [], verifiedOnly: false, q: undefined, roomType: undefined, minPrice: undefined, maxPrice: undefined });
  }

  resetToPrevious(): void {
    if (this._previous) {
      this._filters.set(this._previous);
      // Write URL
      this.setFilters({}); // triggers URL merge & analytics
    }
  }

  private shallowEqual(a: ConnectFilterParams, b: ConnectFilterParams): boolean {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const av: any = (a as any)[k];
      const bv: any = (b as any)[k];
      if (Array.isArray(av) || Array.isArray(bv)) {
        if (JSON.stringify(av||[]) !== JSON.stringify(bv||[])) return false;
      } else if (av !== bv) return false;
    }
    return true;
  }
}
