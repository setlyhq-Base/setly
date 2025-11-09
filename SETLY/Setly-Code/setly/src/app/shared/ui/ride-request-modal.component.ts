import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RidesService } from '../../core/services/rides.service';
import { AnalyticsService } from '../../core/services/analytics.service';

interface RideRequest {
  pickup: string;
  destination: string;
  audience: { mode: 'all' | 'undergrad' | 'grad' | 'international' };
  when: { mode: 'now' | 'schedule'; date?: string; time?: string };
  seats: number;
  notes: string;
}

@Component({
  selector: 'app-ride-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      [class.hidden]="!isOpen()"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ride-modal-title"
      data-testid="ride-modal"
    >
      <div class="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 id="ride-modal-title" class="text-2xl font-bold text-gray-900">Request SetlyRide</h2>
          <button 
            (click)="close()"
            class="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form (ngSubmit)="submit()" class="space-y-4">
          <!-- Pickup Location -->
          <div>
            <label for="pickup" class="block text-sm font-medium text-gray-700 mb-1">Pickup location</label>
            <input
              id="pickup"
              type="text"
              [(ngModel)]="form.pickup"
              name="pickup"
              placeholder="e.g., Campus entrance"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            >
          </div>

          <!-- Destination -->
          <div>
            <label for="destination" class="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              id="destination"
              type="text"
              [(ngModel)]="form.destination"
              name="destination"
              placeholder="e.g., Airport"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            >
          </div>

          <!-- Audience Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Who can see this request?</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  [(ngModel)]="form.audience.mode"
                  name="audience"
                  value="all"
                  class="mr-2"
                >
                All students
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  [(ngModel)]="form.audience.mode"
                  name="audience"
                  value="undergrad"
                  class="mr-2"
                >
                Undergrads only
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  [(ngModel)]="form.audience.mode"
                  name="audience"
                  value="grad"
                  class="mr-2"
                >
                Grads only
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  [(ngModel)]="form.audience.mode"
                  name="audience"
                  value="international"
                  class="mr-2"
                >
                International students
              </label>
            </div>
          </div>

          <!-- When Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">When?</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  [(ngModel)]="form.when.mode"
                  name="when"
                  value="now"
                  class="mr-2"
                >
                Now
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  [(ngModel)]="form.when.mode"
                  name="when"
                  value="schedule"
                  class="mr-2"
                >
                Schedule for later
              </label>
            </div>
            <div *ngIf="form.when.mode === 'schedule'" class="grid grid-cols-2 gap-2 mt-2">
              <input
                type="date"
                [(ngModel)]="form.when.date"
                name="date"
                class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                [min]="today"
              >
              <input
                type="time"
                [(ngModel)]="form.when.time"
                name="time"
                class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <!-- Seats -->
          <div>
            <label for="seats" class="block text-sm font-medium text-gray-700 mb-1">Seats available</label>
            <select
              id="seats"
              [(ngModel)]="form.seats"
              name="seats"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            >
              <option value="1">1 seat</option>
              <option value="2">2 seats</option>
              <option value="3">3 seats</option>
              <option value="4">4+ seats</option>
            </select>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Additional notes (optional)</label>
            <textarea
              id="notes"
              [(ngModel)]="form.notes"
              name="notes"
              rows="3"
              placeholder="e.g., Need help with luggage, prefer non-smoker driver"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Disclaimer -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-sm text-yellow-800">
              <input type="checkbox" [(ngModel)]="disclaimerAccepted" name="disclaimer" class="mr-2" required>
              I understand SetlyRide is peer-to-peer and Setly is not a carrier. I agree to our 
              <a href="/terms/settlyride" class="underline">terms of service</a>.
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              (click)="close()"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-4 py-2 transition"
              [attr.aria-label]="'Cancel ride request'"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!isValid()"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg px-4 py-2 transition"
              [attr.aria-label]="'Submit ride request'"
            >
              Request Ride
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .hidden {
      display: none;
    }
  `]
})
export class RideRequestModalComponent {
  @Input() isOpen = signal(false);
  @Output() rideSubmitted = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  private ridesService = inject(RidesService);
  private analytics = inject(AnalyticsService);

  form: RideRequest = {
    pickup: '',
    destination: '',
    audience: { mode: 'all' },
    when: { mode: 'now' },
    seats: 1,
    notes: ''
  };

  disclaimerAccepted = false;
  today = new Date().toISOString().split('T')[0];

  submit() {
    if (!this.isValid()) return;

    // Create ISO string for scheduled rides
    if (this.form.when.mode === 'schedule' && this.form.when.date && this.form.when.time) {
      const dateTime = new Date(`${this.form.when.date}T${this.form.when.time}`);
      this.form.when.date = dateTime.toISOString();
    }

    const rideRequest = {
      id: crypto.randomUUID(),
      ...this.form,
      createdAt: new Date().toISOString(),
      status: 'open'
    };

    // Save to local storage (mock backend)
    const requests = JSON.parse(localStorage.getItem('setlyRides') || '[]');
    requests.push(rideRequest);
    localStorage.setItem('setlyRides', JSON.stringify(requests));

    // Emit event
    this.rideSubmitted.emit(rideRequest);

    // Analytics
    this.analytics.trackRideRequest('setly', {
      audience: this.form.audience.mode,
      seats: this.form.seats
    });

    this.close();
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  isValid(): boolean {
    return !!(
      this.form.pickup &&
      this.form.destination &&
      this.disclaimerAccepted &&
      (this.form.when.mode === 'now' || (this.form.when.date && this.form.when.time))
    );
  }
}
