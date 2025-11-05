import { Injectable, signal } from '@angular/core';
import { Listing } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingsStore {
  private _listings = signal<Listing[]>([]);
  private _filters = signal({
    query: '',
    budgetMin: 0,
    budgetMax: 5000,
    veg: undefined as boolean | undefined,
    smoke: undefined as boolean | undefined,
    pets: undefined as boolean | undefined,
    roomType: undefined as 'private' | 'shared' | undefined,
    bathType: undefined as 'private' | 'shared' | undefined,
    furnished: undefined as boolean | undefined
  });
  private _selected = signal<Listing | null>(null);

  get listings() {
    return this._listings.asReadonly();
  }

  get filters() {
    return this._filters.asReadonly();
  }

  get selected() {
    return this._selected.asReadonly();
  }

  setListings(listings: Listing[]): void {
    this._listings.set(listings);
  }

  updateFilters(filters: Partial<typeof this._filters>): void {
    this._filters.update(f => ({ ...f, ...filters }));
  }

  setSelected(listing: Listing | null): void {
    this._selected.set(listing);
  }
}
