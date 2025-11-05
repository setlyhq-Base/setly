import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiderStoreService } from '../../core/services/rider-store.service';
import { RideInfoPopoverComponent } from '../../shared/ui/ride-info-popover.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RideInfoPopoverComponent],
  template: `
    <div data-testid="settings-page" class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <!-- Setly Rider Card -->
        <div data-testid="rider-card" class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div class="flex items-center gap-2 mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Setly Rider</h2>
            <app-ride-info-popover></app-ride-info-popover>
          </div>

          <p class="text-gray-600 mb-6">
            When on, peers at your university can request help: rides, grocery pickup, courier.
          </p>

          <!-- Main Toggle -->
          <div class="mb-6">
            <label class="flex items-center">
              <input
                data-testid="rider-toggle"
                type="checkbox"
                [checked]="riderStore.enabled()" (change)="onToggleEnabled($event)"
                (change)="onToggleEnabled($event)"
                class="text-indigo-600 focus:ring-indigo-500"
              />
              <span class="ml-2 text-sm font-medium text-gray-700">Let peers request help from me</span>
            </label>
          </div>

          <!-- Availability Controls (shown when enabled) -->
          <div *ngIf="riderStore.enabled()" class="space-y-6">
            <!-- Available Now -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Availability</h3>
              <label class="flex items-center">
                <input
                  data-testid="rider-available"
                  type="checkbox"
                  [checked]="riderStore.availableNow()" (change)="onToggleAvailableNow($event)"
                  (change)="onToggleAvailableNow($event)"
                  class="text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Available now</span>
              </label>
            </div>

            <!-- Schedule (Optional) -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
              <div class="space-y-3">
                <div *ngFor="let schedule of riderStore.schedule(); let i = index" class="flex items-center gap-3">
                  <select [(ngModel)]="schedule.dow" name="dow{{i}}" class="px-3 py-2 border border-gray-300 rounded-md">
                    <option [value]="0">Sunday</option>
                    <option [value]="1">Monday</option>
                    <option [value]="2">Tuesday</option>
                    <option [value]="3">Wednesday</option>
                    <option [value]="4">Thursday</option>
                    <option [value]="5">Friday</option>
                    <option [value]="6">Saturday</option>
                  </select>
                  <input
                    type="time"
                    [(ngModel)]="schedule.start"
                    name="start{{i}}"
                    class="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <span class="text-gray-500">to</span>
                  <input
                    type="time"
                    [(ngModel)]="schedule.end"
                    name="end{{i}}"
                    class="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    (click)="removeSchedule(i)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <button
                  data-testid="rider-schedule-add"
                  type="button"
                  (click)="addSchedule()"
                  class="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  + Add schedule
                </button>
              </div>
            </div>

            <!-- Service Radius -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Service radius</h3>
              <div class="flex items-center gap-4">
                <input
                  data-testid="rider-radius"
                  type="range"
                  min="1"
                  max="30"
                  [value]="riderStore.radiusKm()" (input)="onRadiusChange($event)"
                  (input)="onRadiusChange($event)"
                  class="flex-1"
                />
                <span class="text-sm text-gray-700">{{ riderStore.radiusKm() }} km</span>
              </div>
            </div>

            <!-- Accepted Tasks -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Accepted tasks</h3>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    data-testid="rider-task-ride"
                    type="checkbox"
                    [(ngModel)]="riderStore.accepted().ride"
                    (change)="onAcceptedChange('ride', $event)"
                    class="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Ride</span>
                </label>
                <label class="flex items-center">
                  <input
                    data-testid="rider-task-groceries"
                    type="checkbox"
                    [(ngModel)]="riderStore.accepted().groceries"
                    (change)="onAcceptedChange('groceries', $event)"
                    class="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Groceries</span>
                </label>
                <label class="flex items-center">
                  <input
                    data-testid="rider-task-courier"
                    type="checkbox"
                    [(ngModel)]="riderStore.accepted().courier"
                    (change)="onAcceptedChange('courier', $event)"
                    class="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Courier</span>
                </label>
              </div>
            </div>

            <!-- Contact Preference -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Contact</h3>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    data-testid="rider-contact-inapp"
                    type="radio"
                    name="contact"
                    value="inapp"
                    [(ngModel)]="riderStore.contact().via"
                    (change)="onContactChange('inapp')"
                    class="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">In-app messages</span>
                </label>
                <label class="flex items-center">
                  <input
                    data-testid="rider-contact-phone"
                    type="radio"
                    name="contact"
                    value="phone"
                    [(ngModel)]="riderStore.contact().via"
                    (change)="onContactChange('phone')"
                    class="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Phone</span>
                </label>
                <label class="flex items-center">
                  <input
                    data-testid="rider-contact-email"
                    type="radio"
                    name="contact"
                    value="email"
                    [(ngModel)]="riderStore.contact().via"
                    (change)="onContactChange('email')"
                    class="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <input
                  *ngIf="riderStore.contact().via !== 'inapp'"
                  type="text"
                  [(ngModel)]="riderStore.contact().value"
                  [placeholder]="riderStore.contact().via === 'phone' ? 'Enter phone number' : 'Enter email'"
                  class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- Vehicle (Optional) -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Vehicle (optional)</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="vehicle-type" class="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle type
                  </label>
                  <input
                    data-testid="rider-vehicle-type"
                    id="vehicle-type"
                    type="text"
                    [value]="riderStore.vehicle()?.type || ''" (input)="onVehicleChange($event, 'type')"
                    name="vehicleType"
                    placeholder="e.g., Sedan, SUV"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label for="vehicle-seats" class="block text-sm font-medium text-gray-700 mb-1">
                    Seats available
                  </label>
                  <select
                    data-testid="rider-vehicle-seats"
                    id="vehicle-seats"
                    [value]="riderStore.vehicle()?.seats || 1" (input)="onVehicleChange($event, 'seats')"
                    name="vehicleSeats"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option [value]="1">1</option>
                    <option [value]="2">2</option>
                    <option [value]="3">3</option>
                    <option [value]="4">4</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Safety Note -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">
                Setly is not a transportation provider. All arrangements are peer-to-peer. Follow local laws and campus rules.
              </p>
            </div>
          </div>

          <!-- Save Button -->
          <div class="mt-6">
            <button
              data-testid="rider-save"
              type="button"
              (click)="onSave()"
              class="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsPage {
  riderStore = inject(RiderStoreService);

  onToggleEnabled(event: Event): void {
    const target = event.target as HTMLInputElement;
    const enabled = target.checked;
    this.riderStore.setEnabled(enabled);
    console.log('rider_toggle_changed', { enabled });
  }

  onToggleAvailableNow(event: Event): void {
    const target = event.target as HTMLInputElement;
    const availableNow = target.checked;
    this.riderStore.setAvailableNow(availableNow);
  }

  addSchedule(): void {
    const currentSchedule = this.riderStore.schedule();
    this.riderStore.setSchedule([...currentSchedule, { dow: 1, start: '09:00', end: '17:00' }]);
  }

  removeSchedule(index: number): void {
    const currentSchedule = this.riderStore.schedule();
    this.riderStore.setSchedule(currentSchedule.filter((_, i) => i !== index));
  }

  onRadiusChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const radius = +target.value;
    this.riderStore.setRadiusKm(radius);
  }

  onAcceptedChange(task: 'ride' | 'groceries' | 'courier', event: Event): void {
    const target = event.target as HTMLInputElement;
    const accepted = target.checked;
    const currentAccepted = this.riderStore.accepted();
    this.riderStore.setAccepted({ ...currentAccepted, [task]: accepted });
  }

  onContactChange(via: 'inapp' | 'phone' | 'email'): void {
    const currentContact = this.riderStore.contact();
    this.riderStore.setContact({ ...currentContact, via });
  }

  onVehicleChange(event: Event, field: 'type' | 'seats'): void {
    const target = event.target as HTMLInputElement;
    const value = field === 'seats' ? +target.value : target.value;
    const currentVehicle = this.riderStore.vehicle() || {};
    this.riderStore.setVehicle({ ...currentVehicle, [field]: value });
  }

  onSave(): void {
    // Analytics
    console.log('rider_settings_saved', {
      radiusKm: this.riderStore.radiusKm(),
      accepted: this.riderStore.accepted()
    });

    // Show success toast (mock)
    alert('Settings saved successfully!');
  }
}
