import { Injectable, signal } from '@angular/core';
import { Listing } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private _listings = signal<Listing[]>([]);

  get listings() {
    return this._listings.asReadonly();
  }

  constructor() {
    this.loadListings();
  }

  async loadListings(): Promise<void> {
    // TODO: Load from API
    try {
      const response = await fetch('/assets/mock/listings.json');
      const data = await response.json();
      this._listings.set(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  }

  async getListing(id: string): Promise<Listing | null> {
    // TODO: Call API
    const listings = this._listings();
    return listings.find(l => l.id === id) || null;
  }

  async createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing> {
    // TODO: Call API
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this._listings.update(list => [...list, newListing]);
    return newListing;
  }

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    // TODO: Call API
    this._listings.update(list =>
      list.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l)
    );
    return this.getListing(id);
  }

  filterListings(query: string, filters: any): Listing[] {
    // TODO: Implement server-side filtering
    let filtered = this._listings();

    if (query) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.address.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.veg !== undefined) {
      filtered = filtered.filter(l => l.rules.veg === filters.veg);
    }

    if (filters.smoke !== undefined) {
      filtered = filtered.filter(l => l.rules.smoke === filters.smoke);
    }

    if (filters.pets !== undefined) {
      filtered = filtered.filter(l => l.rules.pets === filters.pets);
    }

    if (filters.budgetMin) {
      filtered = filtered.filter(l => l.price >= filters.budgetMin);
    }

    if (filters.budgetMax) {
      filtered = filtered.filter(l => l.price <= filters.budgetMax);
    }

    return filtered;
  }
}
