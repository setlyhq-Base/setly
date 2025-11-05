import { Injectable, signal, computed } from '@angular/core';
import { RiderProfile } from '../models/rider.model';

@Injectable({
  providedIn: 'root'
})
export class RiderStoreService {
  private readonly STORAGE_KEY = 'rider_profile_v1';
  private _riderProfile = signal<RiderProfile | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  get riderProfile() {
    return this._riderProfile.asReadonly();
  }

  get enabled() {
    return computed(() => this._riderProfile()?.enabled ?? false);
  }

  get availableNow() {
    return computed(() => this._riderProfile()?.availableNow ?? false);
  }

  get schedule() {
    return computed(() => this._riderProfile()?.schedule ?? []);
  }

  get radiusKm() {
    return computed(() => this._riderProfile()?.radiusKm ?? 16);
  }

  get accepted() {
    return computed(() => this._riderProfile()?.accepted ?? { ride: true, groceries: true, courier: true });
  }

  get contact() {
    return computed(() => this._riderProfile()?.contact ?? { via: 'inapp' as const });
  }

  get vehicle() {
    return computed(() => this._riderProfile()?.vehicle);
  }

  setEnabled(enabled: boolean): void {
    this.updateProfile({ enabled });
  }

  setAvailableNow(availableNow: boolean): void {
    this.updateProfile({ availableNow });
  }

  setSchedule(schedule: RiderProfile['schedule']): void {
    this.updateProfile({ schedule });
  }

  setRadiusKm(radiusKm: number): void {
    this.updateProfile({ radiusKm });
  }

  setAccepted(accepted: RiderProfile['accepted']): void {
    this.updateProfile({ accepted });
  }

  setContact(contact: RiderProfile['contact']): void {
    this.updateProfile({ contact });
  }

  setVehicle(vehicle: RiderProfile['vehicle']): void {
    this.updateProfile({ vehicle });
  }

  private updateProfile(updates: Partial<RiderProfile>): void {
    const current = this._riderProfile();
    if (!current) {
      // Create default profile if none exists
      const defaultProfile: RiderProfile = {
        userId: 'mock-user-id', // Would get from UserStore
        enabled: false,
        availableNow: false,
        radiusKm: 16,
        accepted: { ride: true, groceries: true, courier: true },
        contact: { via: 'inapp' },
        updatedAt: new Date().toISOString(),
        ...updates
      };
      this._riderProfile.set(defaultProfile);
    } else {
      this._riderProfile.set({
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        this._riderProfile.set(profile);
      }
    } catch (error) {
      console.warn('Failed to load rider profile from localStorage:', error);
      this._riderProfile.set(null);
    }
  }

  private saveToStorage(): void {
    try {
      const profile = this._riderProfile();
      if (profile) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (error) {
      console.warn('Failed to save rider profile to localStorage:', error);
    }
  }
}
