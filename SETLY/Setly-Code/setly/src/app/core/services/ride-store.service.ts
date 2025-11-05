import { Injectable, signal, computed } from '@angular/core';
import { RideRequest } from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideStoreService {
  private readonly STORAGE_KEY = 'setly-rides';
  private _rides = signal<RideRequest[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get rides() {
    return this._rides.asReadonly();
  }

  get pendingRides() {
    return computed(() => this._rides().filter(ride => ride.status === 'pending'));
  }

  getById(id: string): RideRequest | undefined {
    return this._rides().find(ride => ride.id === id);
  }

  addRide(ride: RideRequest): void {
    this._rides.update(rides => [...rides, ride]);
    this.saveToStorage();
  }

  updateRide(id: string, updates: Partial<RideRequest>): void {
    this._rides.update(rides =>
      rides.map(ride =>
        ride.id === id ? { ...ride, ...updates, updatedAt: new Date().toISOString() } : ride
      )
    );
    this.saveToStorage();
  }

  removeRide(id: string): void {
    this._rides.update(rides => rides.filter(ride => ride.id !== id));
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const rides = JSON.parse(stored);
        this._rides.set(Array.isArray(rides) ? rides : []);
      }
    } catch (error) {
      console.warn('Failed to load rides from localStorage:', error);
      this._rides.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._rides()));
    } catch (error) {
      console.warn('Failed to save rides to localStorage:', error);
    }
  }
}
