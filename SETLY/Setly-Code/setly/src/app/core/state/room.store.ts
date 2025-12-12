import { Injectable, signal, computed, inject } from '@angular/core';
import { RoomCard } from '../models/room-card.model';
import { RoomsApiService } from '../services/rooms-api.service';

export interface RoomFilters {
  query: string;
  priceMin: number;
  priceMax: number;
  vegetarian: boolean;
  noSmoking: boolean;
  petsOk: boolean;
  privateRoom: boolean;
  furnished: boolean;
  checkIn?: string;  // ISO date (YYYY-MM-DD or full)
  checkOut?: string; // ISO date
}

@Injectable({
  providedIn: 'root'
})
export class RoomStore {
  private readonly STORAGE_KEY = 'rooms';
  private roomsApi = inject(RoomsApiService);

  private _rooms = signal<RoomCard[]>([]);
  private _filters = signal<RoomFilters>({
    query: '',
    priceMin: 0,
    priceMax: 5000,
    vegetarian: false,
    noSmoking: false,
    petsOk: false,
    privateRoom: false,
    furnished: false,
    checkIn: undefined,
    checkOut: undefined
  });

  filteredRooms = computed(() => {
    const rooms = this._rooms();
    const filters = this._filters();

    return rooms.filter(room => {
      // Query filter: match title or address
      if (filters.query) {
        const q = filters.query.toLowerCase().trim();
        // Build a searchable haystack across multiple fields
        const haystack = [
          room.title,
          room.address,
          room.city,
          room.universityName,
          room.hostName
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Price filter
      if (room.price < filters.priceMin || room.price > filters.priceMax) {
        return false;
      }

      // Feature filters
      if (filters.vegetarian && !room.features.includes('Vegetarian')) return false;
      if (filters.noSmoking && !room.features.includes('No smoking')) return false;
      if (filters.petsOk && !room.features.includes('Pets ok')) return false;
      if (filters.privateRoom && !room.features.includes('Private room')) return false;
      if (filters.furnished && !room.features.includes('Furnished')) return false;

      // Date availability filter (only apply if both provided)
      if (filters.checkIn && filters.checkOut) {
        const ci = new Date(filters.checkIn);
        const co = new Date(filters.checkOut);
        const start = room.availabilityStart ? new Date(room.availabilityStart) : null;
        const end = room.availabilityEnd ? new Date(room.availabilityEnd) : null;
        if (start && ci < start) return false;
        if (end && co > end) return false;
      }

      return true;
    });
  });

  constructor() {
    this.loadRooms();
  }

  get rooms() {
    return this._rooms.asReadonly();
  }

  get filters() {
    return this._filters.asReadonly();
  }

  private loadRooms(): void {
    // Load rooms from backend API
    this.roomsApi.searchRooms().subscribe({
      next: (response) => {
        const rooms = Array.isArray((response as any)?.rooms) ? (response as any).rooms : [];
        const count = typeof (response as any)?.count === 'number' ? (response as any).count : rooms.length;
        console.log(`✅ RoomStore loaded ${count} rooms from backend`);
        const roomCards = rooms.map((r: any) => this.convertToRoomCard(r));
        this._rooms.set(roomCards);
        this.saveRooms(); // Cache in localStorage
      },
      error: (err) => {
        console.error('❌ Failed to load rooms from backend:', err);
        // Try localStorage fallback
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          try {
            const rooms = JSON.parse(stored);
            this._rooms.set(rooms);
            console.log('📦 Loaded rooms from localStorage cache');
          } catch (error) {
            console.error('Error parsing localStorage rooms:', error);
            this._rooms.set([]); // Empty array, no mock fallback
          }
        } else {
          this._rooms.set([]); // Empty array, no mock fallback
        }
      }
    });
  }

  /**
   * Convert backend Room model to RoomCard model
   */
  private convertToRoomCard(room: any): RoomCard {
    return {
      id: room.roomId || room.id,
      title: room.title,
      address: room.address,
      city: room.city,
      universityName: room.universityName || room.university,
      price: room.price,
      isAvailable: room.isAvailable !== false, // Default to true
      image: room.image || room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      photos: room.photos || room.images || [],
      hostName: room.hostName || room.userName || 'Host',
      hostId: room.hostId || room.userId,
      features: room.amenities || [],
      amenities: room.amenities || [],
      rating: room.rating || 4,
      type: room.roomType || room.type || 'private',
      roomType: room.roomType || room.type || 'private',
      propertyType: room.propertyType || 'Apartment',
      createdAt: room.createdAt,
      availabilityStart: room.checkIn || room.availabilityStart,
      availabilityEnd: room.checkOut || room.availabilityEnd,
      distance: room.distance || 0,
      likes: room.likes || 0,
      saved: room.saved || false
    };
  }

  private saveRooms(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._rooms()));
  }

  setRooms(rooms: RoomCard[]): void {
    this._rooms.set(rooms);
    this.saveRooms();
  }

  addRoom(room: RoomCard): void {
    this._rooms.update(rooms => [...rooms, room]);
    this.saveRooms();
  }

  updateFilters(filters: Partial<RoomFilters>): void {
    this._filters.update(f => ({ ...f, ...filters }));
  }

  resetFilters(): void {
    this._filters.set({
      query: '',
      priceMin: 0,
      priceMax: 5000,
      vegetarian: false,
      noSmoking: false,
      petsOk: false,
      privateRoom: false,
      furnished: false,
      checkIn: undefined,
      checkOut: undefined
    });
  }
}
