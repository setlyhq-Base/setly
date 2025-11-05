import { Injectable } from '@angular/core';
import { RiderProfile, RiderMatch } from '../models/rider.model';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  // Mock rider data - in real app this would come from backend
  private mockRiders: RiderProfile[] = [
    {
      userId: 'rider-1',
      enabled: true,
      availableNow: true,
      radiusKm: 20,
      accepted: { ride: true, groceries: false, courier: true },
      contact: { via: 'inapp' },
      universityId: 'mock-university-id',
      updatedAt: new Date().toISOString()
    },
    {
      userId: 'rider-2',
      enabled: true,
      availableNow: false,
      schedule: [{ dow: 1, start: '08:00', end: '18:00' }],
      radiusKm: 15,
      accepted: { ride: true, groceries: true, courier: false },
      contact: { via: 'phone', value: '555-0123' },
      universityId: 'mock-university-id',
      updatedAt: new Date().toISOString()
    }
  ];

  findAvailableRiders(params: {
    universityId: string;
    task: 'ride' | 'groceries' | 'courier';
    pickupCoords?: { lat: number; lng: number };
    when: 'now' | string;
  }): RiderMatch[] {
    const { universityId, task, pickupCoords, when } = params;

    return this.mockRiders
      .filter(rider => {
        // Must be enabled and at same university
        if (!rider.enabled || rider.universityId !== universityId) {
          return false;
        }

        // Must accept the requested task
        if (!rider.accepted[task]) {
          return false;
        }

        // Check availability
        if (when === 'now') {
          // Available now OR within current schedule
          if (!rider.availableNow && !this.isWithinSchedule(rider.schedule)) {
            return false;
          }
        } else {
          // For scheduled rides, check if within schedule (simplified)
          if (!rider.availableNow && !this.isWithinSchedule(rider.schedule)) {
            return false;
          }
        }

        // Check radius if coordinates provided
        if (pickupCoords && rider.radiusKm) {
          // Mock distance calculation - in real app use haversine formula
          const mockDistance = Math.random() * 25; // Random distance 0-25km
          if (mockDistance > rider.radiusKm) {
            return false;
          }
        }

        return true;
      })
      .map(rider => ({
        userId: rider.userId,
        distanceKm: pickupCoords ? Math.random() * rider.radiusKm : undefined,
        acceptedTask: task
      }))
      .slice(0, 5); // Return top 5 matches
  }

  private isWithinSchedule(schedule?: RiderProfile['schedule']): boolean {
    if (!schedule || schedule.length === 0) {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    return schedule.some(slot => {
      if (slot.dow !== currentDay) return false;

      // Simple string comparison for time (works for HH:MM format)
      return currentTime >= slot.start && currentTime <= slot.end;
    });
  }
}
