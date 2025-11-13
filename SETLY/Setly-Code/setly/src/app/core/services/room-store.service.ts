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
  // Use a distinct key from the lightweight RoomCard store to avoid collisions and bloat
  private readonly ROOMS_KEY = 'rooms_full_v1';
  private readonly LEGACY_KEY = 'rooms';

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
    // Ensure all rooms carry rich mock meta so the entire app can render consistently
    this.enrichAllRoomsWithMockMeta();
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    // Prefer the new compact key; ignore legacy unless explicitly migrated
    let stored = localStorage.getItem(this.ROOMS_KEY);
    if (!stored) {
      // Opportunistically migrate from legacy only if it looks small enough
      const legacy = localStorage.getItem(this.LEGACY_KEY);
      if (legacy && legacy.length < 250_000) { // ~250 KB bound
        stored = legacy;
        // Do not remove legacy here to avoid impacting other consumers; we'll keep keys separate
      }
    }
    if (!stored) return;
    try {
      const rooms = JSON.parse(stored);
      if (Array.isArray(rooms)) this._rooms.set(rooms);
    } catch (error) {
      console.error('Error loading rooms from storage:', error);
    }
  }

  private saveToStorage(): void {
    const rooms = Array.isArray(this._rooms()) ? this._rooms() : [];
    // Attempt 1: normal compaction (keep up to 60 rooms, 6 photos)
    const attempt = (mode: 'normal'|'tight'|'ultra') => JSON.stringify(this.compactRooms(rooms, mode));
    try {
      localStorage.setItem(this.ROOMS_KEY, attempt('normal'));
      return;
    } catch (e: any) {
      if (this.isQuotaError(e)) {
        try {
          // Attempt 2: tighter compaction (last 30 rooms, 3 photos)
          localStorage.setItem(this.ROOMS_KEY, attempt('tight'));
          return;
        } catch (e2: any) {
          if (this.isQuotaError(e2)) {
            try {
              // Attempt 3: ultra compact (last 10 rooms, 1 photo only)
              localStorage.setItem(this.ROOMS_KEY, attempt('ultra'));
              return;
            } catch (e3) {
              console.warn('[RoomStoreService] Storage quota exceeded; skipping persistence for rooms');
              // As a safety, do not throw; UI can continue without persistence
              return;
            }
          }
        }
      }
      // Non-quota error: surface for visibility
      console.error('[RoomStoreService] Failed saving rooms:', e);
    }
  }

  private isQuotaError(e: any): boolean {
    return !!e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
  }

  private compactRooms(rooms: Room[], mode: 'normal'|'tight'|'ultra'): Partial<Room>[] {
    const limits = {
      normal: { keep: 60, photos: 6 },
      tight: { keep: 30, photos: 3 },
      ultra: { keep: 10, photos: 1 }
    } as const;
    const { keep, photos } = limits[mode];
    // Keep most-recent entries (assume createdAt ascending in list append)
    const slice = rooms.slice(Math.max(0, rooms.length - keep));
    return slice.map(r => ({
      // Essential identification and display fields
      id: r.id,
      title: r.title,
      price: r.price,
      deposit: r.deposit,
      city: r.city,
      state: r.state,
      coords: r.coords,
      universityId: r.universityId,
      distanceKm: r.distanceKm,
      roomType: r.roomType,
      bath: r.bath,
      furnished: r.furnished,
      rules: r.rules,
      // Keep a small subset of photos and a single image cover
      photos: Array.isArray(r.photos) ? r.photos.slice(0, photos) : (r.image ? [r.image] : []),
      image: r.image || (Array.isArray(r.photos) ? r.photos[0] : undefined),
      // Meta
      hostId: r.hostId,
      createdAt: r.createdAt,
      address: r.address,
      amenities: r.amenities,
      features: r.features,
      isAvailable: r.isAvailable,
      availabilityStart: r.availabilityStart,
      availabilityEnd: r.availabilityEnd,
      maxGuests: r.maxGuests,
      studentVerified: r.studentVerified,
      minStayDays: r.minStayDays,
      tags: r.tags,
      distance: r.distance
      // Explicitly drop videos and other large optional arrays
    }));
  }

  private seedMockData(): void {
    if (this._rooms().length === 0) {
      // Use local assets for mock photos; 3–4 images per room
      const ROOM_IMAGES = [
        '/assets/images%20/jon-stebbe-paydk0JcIOQ-unsplash.jpg',
        '/assets/images%20/kam-idris-_HqHX3LBN18-unsplash.jpg',
        '/assets/images%20/kam-idris-kyt0PkBSCNQ-unsplash.jpg',
        '/assets/images%20/kara-eads-L7EwHkq1B2s-unsplash.jpg',
        '/assets/images%20/kenny-eliason-Wp7t4cWN-68-unsplash.jpg',
        '/assets/images%20/lotus-design-n-print-0sDzRgrN_pI-unsplash.jpg',
        '/assets/images%20/lotus-design-n-print-r_y2VBvEOIE-unsplash.jpg',
        '/assets/images%20/alexandra-gorn-JIUjvqe2ZHg-unsplash.jpg',
        '/assets/images%20/andy-vult-zwZpdhoTbU0-unsplash.jpg',
        '/assets/images%20/becca-tapert-dO3qTKxwik0-unsplash.jpg'
      ];
      const pickPhotos = (min = 3, max = 4) => {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...ROOM_IMAGES].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      };
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
          photos: pickPhotos(),
          hostId: 'host1',
          createdAt: new Date().toISOString(),
          tags: ['Indian community', 'Vegetarian'],
          availabilityStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          availabilityEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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
          photos: pickPhotos(),
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

  /**
   * Add comprehensive mock metadata for every room to keep UI functional end-to-end.
   * Safe to call multiple times; it only fills missing fields.
   */
  private enrichAllRoomsWithMockMeta(): void {
    const rooms = (this._rooms() ?? []).map(r => this.enrichRoom(r));
    this._rooms.set(rooms);
  }

  private enrichRoom(r: Room): Room {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = <T>(arr: T[]) => arr[rand(0, arr.length - 1)];
    const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

    const amenityPool = [
      'High-speed Wi‑Fi','In-unit laundry','Heating','Air conditioning','Desk','Closet space',
      'On-site gym','Parking','Dishwasher','Balcony','Study lamp','24/7 security','Utilities included',
      'Elevator','Bike storage','Coffee machine','Microwave','Refrigerator','Smart lock'
    ];
    const featurePool = ['Near campus','Quiet street','Great sunlight','Close to T/Metro','Newly renovated','Pet-friendly'];

    const photos = Array.isArray(r.photos) ? r.photos : (r.image ? [r.image] : []);
    const city = r.city || 'Boston';
    const state = r.state || 'MA';

    const availabilityStart = r.availabilityStart || new Date(Date.now() + rand(3,14)*24*60*60*1000).toISOString();
    const availabilityEnd = r.availabilityEnd || new Date(Date.now() + rand(60,240)*24*60*60*1000).toISOString();

    const enriched: Room = {
      ...r,
      address: r.address || `${rand(10,999)} ${pick(['Commonwealth Ave','Massachusetts Ave','Huntington Ave','Beacon St','Boylston St'])}, ${city}, ${state}`,
      amenities: r.amenities && r.amenities.length ? r.amenities : uniq(Array.from({ length: rand(6, 10) }, () => pick(amenityPool))),
      features: r.features && r.features.length ? r.features : uniq(Array.from({ length: rand(2, 4) }, () => pick(featurePool))),
      isAvailable: typeof r.isAvailable === 'boolean' ? r.isAvailable : true,
      distance: r.distance || (typeof r.distanceKm === 'number' ? `${r.distanceKm} km from campus` : undefined),
      availabilityStart,
      availabilityEnd,
      maxGuests: r.maxGuests || pick([1,2,3]),
      studentVerified: typeof r.studentVerified === 'boolean' ? r.studentVerified : pick([true,false,true]),
      minStayDays: r.minStayDays || pick([30,60,90]),
      photoMeta: r.photoMeta && r.photoMeta.length ? r.photoMeta : photos.map((url, i) => ({ url, caption: i===0 ? 'Main bedroom' : pick(['Study nook','Common area','Kitchen','Bathroom','Neighborhood']) })),
      videos: r.videos && r.videos.length ? r.videos : [{ url: 'https://videos.pexels.com/video-files/56920/56920-hd_1280_720_30fps.mp4', thumbnail: photos[0], durationSec: 12 }]
    };
    // Ensure cover image present
    if (!enriched.image && photos.length) enriched.image = photos[0];
    return enriched;
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
