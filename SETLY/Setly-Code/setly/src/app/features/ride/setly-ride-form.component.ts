import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RideStoreService } from '../../core/services/ride-store.service';
import { RideFeedStore } from '../../core/state/ride-feed.store';
import { UserStore } from '../../core/state/user.store';
import { RideRequest } from '../../core/models/ride.model';

@Component({
  selector: 'app-setly-ride-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form data-testid="tab-setlyride" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Pickup Location -->
      <div>
        <label for="pickup" class="block text-sm font-medium text-gray-700 mb-1">
          Pickup location *
        </label>
        <input
          data-testid="setly-pickup"
          id="pickup"
          type="text"
          [(ngModel)]="form.pickup"
          name="pickup"
          required
          placeholder="Enter pickup address"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Drop Location -->
      <div>
        <label for="drop" class="block text-sm font-medium text-gray-700 mb-1">
          Drop location *
        </label>
        <input
          data-testid="setly-drop"
          id="drop"
          type="text"
          [(ngModel)]="form.drop"
          name="drop"
          required
          placeholder="Enter destination"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- When -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">When *</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              data-testid="setly-when-now"
              type="radio"
              name="whenMode"
              value="now"
              [(ngModel)]="form.when.mode"
              class="text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm">Now</span>
          </label>
          <label class="flex items-center">
            <input
              data-testid="setly-when-schedule"
              type="radio"
              name="whenMode"
              value="schedule"
              [(ngModel)]="form.when.mode"
              class="text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm">Schedule</span>
          </label>
        </div>

        <div *ngIf="form.when.mode === 'schedule'" class="mt-3 space-y-3">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              data-testid="setly-date"
              id="date"
              type="date"
              [(ngModel)]="scheduledDate"
              name="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label for="time" class="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              data-testid="setly-time"
              id="time"
              type="time"
              [(ngModel)]="scheduledTime"
              name="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Seats -->
      <div>
        <label for="seats" class="block text-sm font-medium text-gray-700 mb-1">
          Seats needed (1-4) *
        </label>
        <select
          data-testid="setly-seats"
          id="seats"
          [(ngModel)]="form.seats"
          name="seats"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option [value]="1">1</option>
          <option [value]="2">2</option>
          <option [value]="3">3</option>
          <option [value]="4">4</option>
        </select>
      </div>

      <!-- Luggage -->
      <div>
        <label class="flex items-center">
          <input
            data-testid="setly-luggage"
            type="checkbox"
            [(ngModel)]="form.luggage"
            name="luggage"
            class="text-indigo-600 focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">Luggage</span>
        </label>
      </div>

      <!-- Notes -->
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          data-testid="setly-notes"
          id="notes"
          [(ngModel)]="form.notes"
          name="notes"
          rows="3"
          placeholder="Any additional details..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>

      <!-- Contact Preference -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Contact preference *
        </label>
        <select
          data-testid="setly-contact"
          [(ngModel)]="form.contact.via"
          name="contactVia"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="inapp">In-app messages</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>
        <input
          *ngIf="form.contact.via !== 'inapp'"
          type="text"
          [(ngModel)]="form.contact.value"
          name="contactValue"
          [placeholder]="form.contact.via === 'phone' ? 'Enter phone number' : 'Enter email'"
          required
          class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Audience -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Send request to *
        </label>
        <select
          data-testid="setly-audience"
          [(ngModel)]="form.audience.mode"
          name="audienceMode"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="contacts">My Contacts</option>
          <option value="university">My University</option>
          <option value="peer">Specific peer</option>
        </select>

        <input
          *ngIf="form.audience.mode === 'peer'"
          data-testid="setly-peer-search"
          type="text"
          [(ngModel)]="form.audience.peerId"
          name="peerId"
          placeholder="Search for a peer..."
          required
          class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Consent -->
      <div>
        <label class="flex items-start">
          <input
            data-testid="setly-consent"
            type="checkbox"
            [(ngModel)]="consent"
            name="consent"
            required
            class="mt-1 text-indigo-600 focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">
            I understand SettlyRide is peer-to-peer and Setly is not a carrier.
          </span>
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-3">
        <button
          data-testid="setly-submit"
          type="submit"
          class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          [disabled]="!isFormValid()"
        >
          Request SetlyRide
        </button>
        <button
          type="button"
          (click)="saveDraft()"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Save Draft
        </button>
      </div>
    </form>
  `
})
export class SetlyRideFormComponent {
  private rideStore = inject(RideStoreService);
  private rideFeedStore = inject(RideFeedStore);
  private userStore = inject(UserStore);

  @Output() rideSubmitted = new EventEmitter<RideRequest>();

  form: RideRequest = {
    id: '',
    type: 'peer',
    pickup: '',
    drop: '',
    when: { mode: 'now' },
    seats: 1,
    luggage: false,
    contact: { via: 'inapp' },
    audience: { mode: 'contacts' },
    status: 'pending',
    requesterId: '',
    createdAt: ''
  };

  consent = false;
  scheduledDate = '';
  scheduledTime = '';

  isFormValid(): boolean {
    return !!(
      this.form.pickup &&
      this.form.drop &&
      this.form.when?.mode &&
      this.form.seats &&
      this.consent &&
      (this.form.contact?.via === 'inapp' || this.form.contact?.value) &&
      this.form.audience?.mode &&
      (this.form.audience.mode !== 'peer' || this.form.audience.peerId)
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const user = this.userStore.user();
    if (!user) return;

    // Build ISO string for scheduled rides
    if (this.form.when?.mode === 'schedule' && this.scheduledDate && this.scheduledTime) {
      this.form.when.iso = new Date(`${this.scheduledDate}T${this.scheduledTime}`).toISOString();
    }

    const rideRequest: RideRequest = {
      id: crypto.randomUUID(),
      type: 'peer',
      pickup: this.form.pickup!,
      drop: this.form.drop!,
      when: this.form.when!,
      seats: this.form.seats!,
      luggage: this.form.luggage!,
      notes: this.form.notes,
      contact: this.form.contact!,
      audience: this.form.audience!,
      status: 'pending',
      requesterId: user.id,
      createdAt: new Date().toISOString()
    };

    this.rideStore.addRide(rideRequest);

    // Handle audience-specific logic
    if (this.form.audience!.mode === 'peer' && this.form.audience!.peerId) {
      // Create inbox thread (mock - would integrate with messages store)
      console.log('Creating inbox thread for peer:', this.form.audience!.peerId);
    } else if (this.form.audience!.mode === 'university') {
      // Create feed post
      this.rideFeedStore.addPost({
        id: crypto.randomUUID(),
        rideRequestId: rideRequest.id,
        universityId: 'mock-university-id', // Would get from user profile
        createdAt: new Date().toISOString()
      });
    }

    // Analytics
    console.log('ride_submitted', { audience: this.form.audience!.mode, seats: this.form.seats });
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'setlyride_submitted',
        audience: this.form.audience!.mode,
        seats: this.form.seats
      });
    }

    // Show success toast (mock)
    alert('Ride request sent. You\'ll be notified when a peer responds.');

    // Reset form
    this.resetForm();

    // Emit ride request for matching
    this.rideSubmitted.emit(rideRequest);
  }

  saveDraft(): void {
    // Mock save draft - would persist to localStorage with draft status
    console.log('Draft saved');
  }

  private resetForm(): void {
    this.form = {
      id: '',
      type: 'peer',
      pickup: '',
      drop: '',
      when: { mode: 'now' },
      seats: 1,
      luggage: false,
      contact: { via: 'inapp' },
      audience: { mode: 'contacts' },
      status: 'pending',
      requesterId: '',
      createdAt: ''
    };
    this.consent = false;
    this.scheduledDate = '';
    this.scheduledTime = '';
  }
}
