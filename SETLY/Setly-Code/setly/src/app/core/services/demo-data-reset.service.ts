import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DummyPeopleService } from './dummy-people.service';
import { DummyRidesService } from './dummy-rides.service';
import { DummyMarketplaceService } from './dummy-marketplace.service';
import { RoomStoreService } from './room-store.service';
import { RoomStore } from '../state/room.store';

export type DemoResetResult = {
  ok: boolean;
  mode: 'skipped' | 'reset';
  counts?: {
    users: number;
    rooms: number;
    rides: number;
    marketplace: number;
  };
};

@Injectable({ providedIn: 'root' })
export class DemoDataResetService {
  private people = inject(DummyPeopleService);
  private rides = inject(DummyRidesService);
  private marketplace = inject(DummyMarketplaceService);
  private rooms = inject(RoomStoreService);
  private roomCards = inject(RoomStore);

  private isAllowed(): boolean {
    return !environment.production && !!(environment as any)?.featureFlags?.useDummyData;
  }

  /**
   * Clears dummy data and reseeds the full local dataset.
   * By default reloads the page to ensure every store rehydrates cleanly.
   */
  async resetDemoData(opts?: { reload?: boolean }): Promise<DemoResetResult> {
    if (!this.isAllowed()) {
      return { ok: false, mode: 'skipped' };
    }

    // Clear dummy datasets
    this.people.reseed();
    this.rooms.resetDemoData();
    this.rides.reseed();
    this.marketplace.reseed();

    // Clear lightweight RoomCard cache/store so it repulls from RoomsApiService (dummy) on next load.
    try {
      localStorage.removeItem('rooms');
    } catch {
      // ignore
    }
    this.roomCards.setRooms([]);

    const result: DemoResetResult = {
      ok: true,
      mode: 'reset',
      counts: {
        users: this.people.getAllUsers().length,
        rooms: this.rooms.roomsList().length,
        rides: this.rides.getAll().length,
        marketplace: this.marketplace.getAll().length,
      },
    };

    const shouldReload = opts?.reload !== false;
    if (shouldReload) {
      // Give the UI a moment to paint a success state before reload.
      setTimeout(() => window.location.reload(), 50);
    }

    return result;
  }

  /**
   * Registers `window.setlyResetDummyData()` (dev/E2E only).
   */
  registerGlobalHelper(): void {
    if (!this.isAllowed()) return;

    const w = window as any;
    if (typeof w.setlyResetDummyData === 'function') return;

    w.setlyResetDummyData = (options?: { reload?: boolean }) => this.resetDemoData(options);
  }
}
