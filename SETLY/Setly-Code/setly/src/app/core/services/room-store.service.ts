import { Injectable, signal, computed } from '@angular/core';
import { Room } from '../models/room.model';

interface Filters {
  budgetMin: number;
  budgetMax: number;
  vegetarian: boolean;
  smoking: boolean;
  petsOk: boolean;
  furnished: boolean;
  roomType: 'private' | 'shared' | 'Private' | '';
  city: string;
  universityId: string;
  // New Airbnb-like filters
  checkIn?: string; // ISO date string
  checkOut?: string; // ISO date string
  guests?: number;
  studentVerifiedOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoomStoreService {
  private readonly ROOMS_KEY = 'rooms';

  // Signals for state management
  private _rooms = signal<Room[]>([]);
  private _query = signal('');
  private _filters = signal<Filters>({
    budgetMin: 0,
    budgetMax: 10000,
    vegetarian: false,
    smoking: false,
    petsOk: false,
    furnished: false,
    roomType: '',
    city: '',
    universityId: '',
    checkIn: undefined,
    checkOut: undefined,
    guests: undefined,
    studentVerifiedOnly: undefined
  });

  // Public readonly signals
  rooms = this._rooms.asReadonly();
  query = this._query.asReadonly();
  filters = this._filters.asReadonly();

  // Computed filtered rooms
  filteredRooms = computed(() => {
    const rooms = Array.isArray(this._rooms()) ? this._rooms() : [];
    const query = (this._query() || '').toLowerCase().trim();
    const f = this._filters();

    return rooms.filter(room => {
      // Text search
      if (query) {
        const title = (room.title || '').toLowerCase();
        const city = (room.city || '').toLowerCase();
        const state = (room.state || '').toLowerCase();
        const matchesQuery = title.includes(query) || city.includes(query) || state.includes(query);
        if (!matchesQuery) return false;
      }

      // Budget filter
      const price = Number(room.price) || 0;
      if (price < f.budgetMin || price > f.budgetMax) return false;

      // Rules filters
      const rules = room.rules || { vegetarian: false, smoking: false, petsOk: false };
      if (f.vegetarian && !rules.vegetarian) return false;
      if (f.smoking && rules.smoking) return false;
      if (f.petsOk && !rules.petsOk) return false;

      // Furnished filter
      if (f.furnished && !room.furnished) return false;

      // Room type filter
      if (f.roomType && room.roomType !== f.roomType) return false;

      // City filter
      if (f.city && !(room.city || '').toLowerCase().includes(f.city.toLowerCase())) return false;

      // University filter
      if (f.universityId && room.universityId !== f.universityId) return false;

      // Date availability filter
      if (f.checkIn && f.checkOut) {
        const checkIn = new Date(f.checkIn);
        const checkOut = new Date(f.checkOut);
        const roomStart = room.availabilityStart ? new Date(room.availabilityStart) : null;
        const roomEnd = room.availabilityEnd ? new Date(room.availabilityEnd) : null;

        // Check if room is available for the entire stay period
        if (roomStart && roomEnd) {
          if (checkIn < roomStart || checkOut > roomEnd) return false;
        } else if (roomStart) {
          if (checkIn < roomStart) return false;
        } else if (roomEnd) {
          if (checkOut > roomEnd) return false;
        }
      }

      // Guest capacity filter
      if (f.guests && room.maxGuests && f.guests > room.maxGuests) return false;

      // Student verification filter
      if (f.studentVerifiedOnly && !room.studentVerified) return false;

      return true;
    });
  });

  // Safe public list getter
  roomsList(): Room[] {
    return this._rooms() ?? [];
  }

  // Featured rooms computed
  featuredRooms = computed(() => (this._rooms() ?? []).slice(0, 6));

  constructor() {
    this.loadFromStorage();
    this.seedMockData();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.ROOMS_KEY);
    if (stored) {
      try {
        const rooms = JSON.parse(stored);
        this._rooms.set(rooms);
      } catch (error) {
        console.error('Error loading rooms from storage:', error);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.ROOMS_KEY, JSON.stringify(this._rooms()));
  }

  private seedMockData(): void {
    if (this._rooms().length === 0) {
      // Mock data will be loaded from rooms.mock.ts
      const mockRooms: Room[] = [
        {
          id: '1',
          title: 'Cozy Private Room Near Harvard',
          price: 1200,
          city: 'Cambridge',
          state: 'MA',
          coords: { lat: 42.3770, lng: -71.1167 },
          universityId: '1',
          distanceKm: 1.2,
          roomType: 'private',
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: true, smoking: false, petsOk: false },
          photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
          hostId: 'host1',
          createdAt: new Date().toISOString(),
          tags: ['Indian community', 'Vegetarian'],
          availabilityStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          availabilityEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          maxGuests: 2,
          studentVerified: true,
          minStayDays: 30
        },
        {
          id: '2',
          title: 'Shared Room with Great Views',
          price: 800,
          city: 'Stanford',
          state: 'CA',
          coords: { lat: 37.4275, lng: -122.1697 },
          universityId: '2',
          distanceKm: 0.8,
          roomType: 'shared',
          bath: 'shared',
          furnished: false,
          rules: { vegetarian: false, smoking: false, petsOk: true },
          photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
          hostId: 'host2',
          createdAt: new Date().toISOString(),
          tags: ['Pets ok', 'No smoking']
        },
        {
          id: '3',
          title: 'Furnished Private Room',
          price: 1500,
          city: 'Berkeley',
          state: 'CA',
          coords: { lat: 37.8715, lng: -122.2730 },
          universityId: '4',
          distanceKm: 2.1,
          roomType: 'private',
          bath: 'private',
          furnished: true,
          rules: { vegetarian: true, smoking: false, petsOk: false },
          photos: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'],
          hostId: 'host3',
          createdAt: new Date().toISOString(),
          tags: ['Furnished', 'Vegetarian']
        },
        {
          id: '4',
          title: 'Student Housing Near MIT',
          price: 1100,
          city: 'Cambridge',
          state: 'MA',
          coords: { lat: 42.3601, lng: -71.0942 },
          universityId: '3',
          distanceKm: 1.5,
          roomType: 'private',
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: false, smoking: false, petsOk: true },
          photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400'],
          hostId: 'host4',
          createdAt: new Date().toISOString(),
          tags: ['Pets ok', 'Furnished']
        },
        {
          id: '5',
          title: 'Quiet Room for Focused Study',
          price: 950,
          city: 'New Haven',
          state: 'CT',
          coords: { lat: 41.3163, lng: -72.9223 },
          universityId: '5',
          distanceKm: 1.8,
          roomType: 'private',
          bath: 'private',
          furnished: false,
          rules: { vegetarian: true, smoking: false, petsOk: false },
          photos: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400'],
          hostId: 'host5',
          createdAt: new Date().toISOString(),
          tags: ['Vegetarian', 'Quiet area']
        },
        {
          id: '6',
          title: 'Modern Shared Living Space',
          price: 700,
          city: 'Princeton',
          state: 'NJ',
          coords: { lat: 40.3430, lng: -74.6514 },
          universityId: '7',
          distanceKm: 2.3,
          roomType: 'shared',
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: false, smoking: false, petsOk: true },
          photos: ['https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4e1?w=400'],
          hostId: 'host6',
          createdAt: new Date().toISOString(),
          tags: ['Pets ok', 'Modern']
        },
        {
          id: '7',
          title: 'Affordable Room Near Columbia',
          price: 1300,
          city: 'New York',
          state: 'NY',
          coords: { lat: 40.8075, lng: -73.9626 },
          universityId: '8',
          distanceKm: 3.2,
          roomType: 'private',
          bath: 'shared',
          furnished: false,
          rules: { vegetarian: true, smoking: false, petsOk: false },
          photos: ['https://images.unsplash.com/photo-1501183638710-841dd1904471?w=400'],
          hostId: 'host7',
          createdAt: new Date().toISOString(),
          tags: ['Affordable', 'Vegetarian']
        },
        {
          id: '8',
          title: 'Spacious Private Room',
          price: 1400,
          city: 'Chicago',
          state: 'IL',
          coords: { lat: 41.7886, lng: -87.5987 },
          universityId: '9',
          distanceKm: 2.7,
          roomType: 'private',
          bath: 'private',
          furnished: true,
          rules: { vegetarian: false, smoking: false, petsOk: true },
          photos: ['https://images.unsplash.com/photo-1495433324511-bf8e92934d90?w=400'],
          hostId: 'host8',
          createdAt: new Date().toISOString(),
          tags: ['Spacious', 'Pets ok']
        },
        {
          id: '9',
          title: 'Cozy Corner Room',
          price: 1050,
          city: 'Philadelphia',
          state: 'PA',
          coords: { lat: 39.9522, lng: -75.1932 },
          universityId: '10',
          distanceKm: 1.9,
          roomType: 'private',
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: true, smoking: false, petsOk: false },
          photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
          hostId: 'host9',
          createdAt: new Date().toISOString(),
          tags: ['Cozy', 'Vegetarian']
        },
        {
          id: '10',
          title: 'Bright and Airy Space',
          price: 1250,
          city: 'Evanston',
          state: 'IL',
          coords: { lat: 42.0565, lng: -87.6753 },
          universityId: '11',
          distanceKm: 2.4,
          roomType: 'private',
          bath: 'private',
          furnished: false,
          rules: { vegetarian: false, smoking: false, petsOk: true },
          photos: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'],
          hostId: 'host10',
          createdAt: new Date().toISOString(),
          tags: ['Bright', 'Pets ok']
        },
        {
          id: '11',
          title: 'Student-Friendly Environment',
          price: 900,
          city: 'Durham',
          state: 'NC',
          coords: { lat: 36.0014, lng: -78.9382 },
          universityId: '12',
          distanceKm: 1.6,
          roomType: 'shared',
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: true, smoking: false, petsOk: false },
          photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400'],
          hostId: 'host11',
          createdAt: new Date().toISOString(),
          tags: ['Student-friendly', 'Vegetarian']
        },
        {
          id: '12',
          title: 'Peaceful Study Retreat',
          price: 1150,
          city: 'Baltimore',
          state: 'MD',
          coords: { lat: 39.3299, lng: -76.6205 },
          universityId: '13',
          distanceKm: 2.8,
          roomType: 'private',
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: false, smoking: false, petsOk: true },
          photos: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400'],
          hostId: 'host12',
          createdAt: new Date().toISOString(),
          tags: ['Peaceful', 'Pets ok']
        }
      ];

      this._rooms.set(mockRooms);
      this.saveToStorage();
    }
  }

  // Public methods
  setQuery(query: string): void {
    this._query.set(query);
    this.saveToStorage();
  }

  setFilters(filters: Partial<Filters>): void {
    this._filters.update(current => ({ ...current, ...filters }));
    this.saveToStorage();
  }

  addRoom(room: Room): void {
    this._rooms.update(rooms => [...rooms, room]);
    this.saveToStorage();
  }

  updateRoom(roomId: string, updates: Partial<Room>): void {
    this._rooms.update(rooms =>
      rooms.map(room =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
    this.saveToStorage();
  }

  removeRoom(roomId: string): void {
    this._rooms.update(rooms => rooms.filter(room => room.id !== roomId));
    this.saveToStorage();
  }

  getRoomById(id: string): Room | undefined {
    return this._rooms().find(room => room.id === id);
  }

  getRoomsByHost(hostId: string): Room[] {
    return this._rooms().filter(room => room.hostId === hostId);
  }

  saveDraft(draft: Partial<Room>): void {
    localStorage.setItem('room-draft', JSON.stringify(draft));
  }

  loadDraft(): Partial<Room> | null {
    const stored = localStorage.getItem('room-draft');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
    return null;
  }

  clearDraft(): void {
    localStorage.removeItem('room-draft');
  }
}
