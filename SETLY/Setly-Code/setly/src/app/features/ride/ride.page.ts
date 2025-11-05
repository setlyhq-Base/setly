import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetlyRideFormComponent } from './setly-ride-form.component';
import { UberRideFormComponent } from './uber-ride-form.component';
import { RideInfoPopoverComponent } from '../../shared/ui/ride-info-popover.component';
import { MatchingService } from '../../core/services/matching.service';
import { RiderMatch } from '../../core/models/rider.model';

@Component({
  selector: 'app-ride-page',
  standalone: true,
  imports: [CommonModule, SetlyRideFormComponent, UberRideFormComponent, RideInfoPopoverComponent],
  template: `
    <div data-testid="ride-page" class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            SettlyRide
            <app-ride-info-popover></app-ride-info-popover>
          </h1>
        </div>

        <!-- Cards Container -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- SetlyRide Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Request SetlyRide (peer-to-peer)
            </h2>
            <app-setly-ride-form (rideSubmitted)="onRideSubmitted($event)"></app-setly-ride-form>
          </div>

          <!-- UberRide Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Request UberRide (opens Uber)
            </h2>
            <app-uber-ride-form></app-uber-ride-form>
          </div>
        </div>

        <!-- Rider Matches (shown after ride submission) -->
        <div *ngIf="riderMatches().length > 0" data-testid="rider-matches" class="mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Available Riders</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              *ngFor="let match of riderMatches()"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">Rider {{ match.userId }}</span>
                <span class="text-sm text-gray-600">
                  {{ match.distanceKm ? '~' + match.distanceKm.toFixed(1) + ' mi' : 'Distance unknown' }}
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mb-3">
                <span
                  *ngIf="match.acceptedTask === 'ride'"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  Ride
                </span>
                <span
                  *ngIf="match.acceptedTask === 'groceries'"
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                >
                  Groceries
                </span>
                <span
                  *ngIf="match.acceptedTask === 'courier'"
                  class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                >
                  Courier
                </span>
              </div>
              <button
                [attr.data-testid]="'rider-request-' + match.userId"
                (click)="requestRider(match)"
                class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Request
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="showEmptyState" class="mt-8 text-center">
          <p class="text-gray-600 mb-4">No available peers right now.</p>
          <button
            (click)="postToFeed()"
            class="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Post to University Feed
          </button>
        </div>
      </div>
    </div>
  `
})
export class RidePage implements OnInit {
  private matchingService = inject(MatchingService);
  riderMatches = signal<RiderMatch[]>([]);
  showEmptyState = false;

  ngOnInit(): void {
    // Analytics
    console.log('ride_page_viewed');
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'ride_page_viewed' });
    }
  }

  onRideSubmitted(rideRequest: any): void {
    // Find available riders
    const matches = this.matchingService.findAvailableRiders({
      universityId: 'mock-university-id', // Would get from user profile
      task: 'ride', // For now, assume ride requests
      pickupCoords: undefined, // Mock - would get from geocoding
      when: rideRequest.when?.mode === 'now' ? 'now' : rideRequest.when?.iso
    });

    this.riderMatches.set(matches);

    if (matches.length === 0) {
      this.showEmptyState = true;
    } else {
      this.showEmptyState = false;
      // Analytics
      console.log('rider_matches_viewed', { count: matches.length });
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'rider_matches_viewed',
          count: matches.length
        });
      }
    }
  }

  requestRider(match: RiderMatch): void {
    // Mock: Create message thread and mark ride as sent_to_peer
    console.log('Requesting rider:', match.userId);

    // Analytics
    console.log('rider_request_sent', { task: match.acceptedTask, toUserId: match.userId });
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'rider_request_sent',
        task: match.acceptedTask,
        toUserId: match.userId
      });
    }

    alert(`Request sent to Rider ${match.userId}!`);
  }

  postToFeed(): void {
    // Mock: Post to university feed
    console.log('Posting to university feed');
    alert('Posted to university feed!');
  }
}
