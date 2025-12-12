import { Injectable, inject } from '@angular/core';
import type { Ride, RideFilters, RideResponse } from './rides-api.service';
import { DummyPeopleService } from './dummy-people.service';

@Injectable({ providedIn: 'root' })
export class DummyRidesService {
  private readonly STORAGE_KEY = 'setly_dummy_rides_v1';
  private dummyPeople = inject(DummyPeopleService);

  private rides: Ride[] = [];

  constructor() {
    this.loadFromStorage();
    this.ensureMinimumRides(30);
    this.saveToStorage();
  }

  getAll(): Ride[] {
    return this.rides;
  }

  search(filters?: RideFilters): RideResponse {
    const list = this.applyFilters(this.rides, filters);
    return { count: list.length, rides: list };
  }

  getById(rideId: string): Ride | undefined {
    return this.rides.find(r => (r.rideId || '') === rideId);
  }

  add(ride: Ride): Ride {
    this.rides = [ride, ...this.rides];
    this.saveToStorage();
    return ride;
  }

  update(rideId: string, updates: Partial<Ride>): Ride | undefined {
    let updated: Ride | undefined;
    this.rides = this.rides.map(r => {
      const id = r.rideId || '';
      if (id !== rideId) return r;
      updated = { ...r, ...updates, updatedAt: new Date() };
      return updated;
    });
    this.saveToStorage();
    return updated;
  }

  remove(rideId: string): void {
    this.rides = this.rides.filter(r => (r.rideId || '') !== rideId);
    this.saveToStorage();
  }

  reseed(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.rides = [];
    this.ensureMinimumRides(30);
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) this.rides = parsed;
    } catch {
      this.rides = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.rides));
    } catch {
      // ignore
    }
  }

  private ensureMinimumRides(min: number): void {
    if (this.rides.length >= min) return;

    const users = this.dummyPeople.getAllUsers();
    const cities = [
      { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
      { city: 'Cambridge', state: 'MA', lat: 42.3736, lng: -71.1097 },
      { city: 'New Haven', state: 'CT', lat: 41.3083, lng: -72.9279 },
      { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
      { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
      { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
      { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
    ];

    const pickupTemplates = [
      (c: any) => `${c.city} Downtown`,
      (c: any) => `${c.city} Campus`,
      (c: any) => `${c.city} Station`,
      (c: any) => `${c.city} Airport`,
      (c: any) => `${c.city} Main Library`,
    ];

    const dropoffTemplates = [
      (c: any) => `${c.city} Airport`,
      (c: any) => `${c.city} Campus`,
      (c: any) => `${c.city} Downtown`,
      (c: any) => `${c.city} Union Station`,
      (c: any) => `${c.city} City Center`,
    ];

    const base = new Date('2025-01-10T12:00:00.000Z');
    const times = ['07:30', '09:00', '11:15', '14:00', '16:30', '18:00'];
    const images = [
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80',
    ];

    const existingIds = new Set(this.rides.map(r => r.rideId).filter(Boolean) as string[]);
    const nextId = () => {
      for (let i = 1; ; i++) {
        const id = `ride-${i}`;
        if (!existingIds.has(id)) return id;
      }
    };

    while (this.rides.length < min) {
      const id = nextId();
      existingIds.add(id);
      const i = Number(id.split('-')[1]) || (this.rides.length + 1);

      const user = users[i % users.length];
      const pickupCity = cities[(i * 3) % cities.length];
      const dropoffCity = cities[(i * 5 + 2) % cities.length];

      const pickupAddress = pickupTemplates[i % pickupTemplates.length](pickupCity);
      const dropoffAddress = dropoffTemplates[(i * 2) % dropoffTemplates.length](dropoffCity);

      const rideDate = new Date(base.getTime() + (i % 21) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const rideTime = times[i % times.length];

      const seatsAvailable = 1 + (i % 4);
      const pricePerSeat = [0, 5, 10, 15, 20][i % 5];

      this.rides.push({
        rideId: id,
        userId: user?.id || `user-${i}`,
        pickupAddress,
        pickupLat: pickupCity.lat + ((i % 7) - 3) * 0.005,
        pickupLng: pickupCity.lng + ((i % 7) - 3) * 0.005,
        dropoffAddress,
        dropoffLat: dropoffCity.lat + ((i % 7) - 3) * 0.005,
        dropoffLng: dropoffCity.lng + ((i % 7) - 3) * 0.005,
        rideDate,
        rideTime,
        seatsAvailable,
        pricePerSeat,
        images: [images[i % images.length]],
        notes: i % 3 === 0 ? 'Can help with luggage.' : undefined,
        status: 'active',
        createdAt: new Date(base.getTime() - (i % 30) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(base.getTime() - (i % 10) * 24 * 60 * 60 * 1000),
        userName: user?.name,
        userEmail: undefined,
        userPhoto: user?.avatarUrl,
        userVerified: !!user?.badges?.university,
      });
    }
  }

  private applyFilters(rides: Ride[], filters?: RideFilters): Ride[] {
    if (!filters) return rides;

    const pickupCity = (filters.pickupCity || '').toLowerCase().trim();
    const dropoffCity = (filters.dropoffCity || '').toLowerCase().trim();
    const rideDate = (filters.rideDate || '').trim();
    const minSeats = filters.minSeats ?? 0;

    return rides.filter(r => {
      if (pickupCity && !String(r.pickupAddress || '').toLowerCase().includes(pickupCity)) return false;
      if (dropoffCity && !String(r.dropoffAddress || '').toLowerCase().includes(dropoffCity)) return false;
      if (rideDate && String(r.rideDate || '').slice(0, 10) !== rideDate.slice(0, 10)) return false;
      if (minSeats && (Number(r.seatsAvailable) || 0) < minSeats) return false;
      return true;
    });
  }
}
