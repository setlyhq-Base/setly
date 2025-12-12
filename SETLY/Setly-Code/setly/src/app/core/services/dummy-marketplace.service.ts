import { Injectable, inject } from '@angular/core';
import type { MarketplaceFilters, MarketplaceItem, MarketplaceResponse } from './marketplace-api.service';
import { DummyPeopleService } from './dummy-people.service';

@Injectable({ providedIn: 'root' })
export class DummyMarketplaceService {
  private readonly STORAGE_KEY = 'setly_dummy_marketplace_v1';
  private dummyPeople = inject(DummyPeopleService);

  private items: MarketplaceItem[] = [];

  constructor() {
    this.loadFromStorage();
    this.ensureMinimumItems(20);
    this.saveToStorage();
  }

  getAll(): MarketplaceItem[] {
    return this.items;
  }

  search(filters?: MarketplaceFilters): MarketplaceResponse {
    const list = this.applyFilters(this.items, filters);
    return { count: list.length, items: list };
  }

  getById(itemId: string): MarketplaceItem | undefined {
    return this.items.find(i => (i.itemId || '') === itemId);
  }

  add(item: MarketplaceItem): MarketplaceItem {
    this.items = [item, ...this.items];
    this.saveToStorage();
    return item;
  }

  update(itemId: string, updates: Partial<MarketplaceItem>): MarketplaceItem | undefined {
    let updated: MarketplaceItem | undefined;
    this.items = this.items.map(i => {
      const id = i.itemId || '';
      if (id !== itemId) return i;
      updated = { ...i, ...updates, updatedAt: new Date() } as MarketplaceItem;
      return updated;
    });
    this.saveToStorage();
    return updated;
  }

  remove(itemId: string): void {
    this.items = this.items.filter(i => (i.itemId || '') !== itemId);
    this.saveToStorage();
  }

  reseed(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.items = [];
    this.ensureMinimumItems(20);
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) this.items = parsed;
    } catch {
      this.items = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // ignore
    }
  }

  private ensureMinimumItems(min: number): void {
    if (this.items.length >= min) return;

    const users = this.dummyPeople.getAllUsers();
    const base = new Date('2025-01-10T12:00:00.000Z');

    const categories = ['Electronics', 'Furniture', 'Kitchen', 'Books', 'Bedding', 'Decor', 'Bikes', 'Misc'];
    const conditions: Array<MarketplaceItem['condition']> = ['new', 'like-new', 'good', 'fair'];

    const templates = [
      { title: 'Desk Lamp', category: 'Decor', price: 18, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80' },
      { title: 'Study Desk', category: 'Furniture', price: 75, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80' },
      { title: 'Air Fryer', category: 'Kitchen', price: 35, image: 'https://images.unsplash.com/photo-1546817372-4a757f3f6a1e?w=1200&q=80' },
      { title: 'Rice Cooker', category: 'Kitchen', price: 25, image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=1200&q=80' },
      { title: 'Noise-Cancelling Headphones', category: 'Electronics', price: 60, image: 'https://images.unsplash.com/photo-1518441313635-5b384f4d2e0a?w=1200&q=80' },
      { title: 'Twin Mattress Topper', category: 'Bedding', price: 22, image: 'https://images.unsplash.com/photo-1582582621959-48d27397dcf7?w=1200&q=80' },
      { title: 'Textbook Bundle', category: 'Books', price: 30, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80' },
      { title: 'Bike Lock', category: 'Bikes', price: 12, image: 'https://images.unsplash.com/photo-1517949908119-72058f79f0b3?w=1200&q=80' },
    ];

    const existingIds = new Set(this.items.map(i => i.itemId).filter(Boolean) as string[]);
    const nextId = () => {
      for (let i = 1; ; i++) {
        const id = `item-${i}`;
        if (!existingIds.has(id)) return id;
      }
    };

    while (this.items.length < min) {
      const id = nextId();
      existingIds.add(id);
      const i = Number(id.split('-')[1]) || (this.items.length + 1);

      const user = users[i % users.length];
      const t = templates[i % templates.length];

      const category = categories[i % categories.length] || t.category;
      const condition = conditions[i % conditions.length];
      const price = Math.max(5, t.price + ((i % 7) - 3) * 3);

      const location = user?.location || `${user?.city || 'Boston'}, ${user?.state || 'MA'}`;
      const createdAt = new Date(base.getTime() - (i % 45) * 24 * 60 * 60 * 1000);

      this.items.push({
        itemId: id,
        userId: user?.id || `user-${i}`,
        category: t.category || category,
        title: t.title,
        description: `Gently used. Pickup in ${location}.`,
        price,
        condition,
        images: [t.image],
        location,
        tags: [category, condition],
        status: 'available',
        createdAt,
        updatedAt: createdAt,
        userName: user?.name,
        userEmail: undefined,
        userPhoto: user?.avatarUrl,
        userVerified: !!user?.badges?.university,
      });
    }
  }

  private applyFilters(items: MarketplaceItem[], filters?: MarketplaceFilters): MarketplaceItem[] {
    if (!filters) return items;

    const category = (filters.category || '').toLowerCase().trim();
    const searchTerm = (filters.searchTerm || '').toLowerCase().trim();
    const condition = (filters.condition || '').toLowerCase().trim();
    const location = (filters.location || '').toLowerCase().trim();
    const minPrice = filters.minPrice ?? undefined;
    const maxPrice = filters.maxPrice ?? undefined;

    return items.filter(i => {
      if (category && String(i.category || '').toLowerCase() !== category) return false;
      if (condition && String(i.condition || '').toLowerCase() !== condition) return false;
      if (location && !String(i.location || '').toLowerCase().includes(location)) return false;
      if (minPrice !== undefined && (Number(i.price) || 0) < minPrice) return false;
      if (maxPrice !== undefined && (Number(i.price) || 0) > maxPrice) return false;

      if (searchTerm) {
        const haystack = [i.title, i.description, i.category, ...(i.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }

      return true;
    });
  }
}
