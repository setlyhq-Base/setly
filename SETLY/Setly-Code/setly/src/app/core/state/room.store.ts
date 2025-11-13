import { Injectable, signal, computed } from '@angular/core';
import { RoomCard } from '../models/room-card.model';
import { ROOMS_MOCK } from '../../../assets/mock/rooms.mock';

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
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const rooms = JSON.parse(stored);
        this._rooms.set(rooms);
      } catch (error) {
        console.error('Error loading rooms from localStorage:', error);
        this._rooms.set(ROOMS_MOCK);
      }
    } else {
      this._rooms.set(ROOMS_MOCK);
    }
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
