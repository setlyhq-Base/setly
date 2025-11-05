import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
        type="button"
      >
        <span class="text-gray-700">
          {{ guestSummary() }}
        </span>
        <svg
          [class.rotate-180]="showDropdown"
          class="w-5 h-5 text-gray-400 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        *ngIf="showDropdown"
        class="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-full min-w-64"
      >
        <!-- Adults -->
        <div class="flex items-center justify-between py-2">
          <div>
            <div class="font-medium text-gray-900">Adults</div>
            <div class="text-sm text-gray-500">Ages 13 or above</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              (click)="updateGuests('adults', -1)"
              [disabled]="guests().adults <= 1"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            <span class="w-6 text-center font-medium">{{ guests().adults }}</span>
            <button
              (click)="updateGuests('adults', 1)"
              [disabled]="totalGuests() >= 16"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Children -->
        <div class="flex items-center justify-between py-2 border-t border-gray-200">
          <div>
            <div class="font-medium text-gray-900">Children</div>
            <div class="text-sm text-gray-500">Ages 0-12</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              (click)="updateGuests('children', -1)"
              [disabled]="guests().children <= 0"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            <span class="w-6 text-center font-medium">{{ guests().children }}</span>
            <button
              (click)="updateGuests('children', 1)"
              [disabled]="totalGuests() >= 16"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Total Info -->
        <div class="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600">
          {{ totalGuests() }} guest{{ totalGuests() !== 1 ? 's' : '' }} maximum
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class GuestSelectorComponent {
  @Output() guestsChanged = new EventEmitter<{ adults: number; children: number }>();

  showDropdown = false;
  guests = signal({ adults: 1, children: 0 });

  totalGuests = computed(() => this.guests().adults + this.guests().children);

  guestSummary = computed(() => {
    const { adults, children } = this.guests();
    const total = adults + children;

    if (total === 1) return '1 guest';
    if (children === 0) return `${adults} adults`;
    if (adults === 1 && children === 1) return '1 adult, 1 child';
    if (adults === 1) return `1 adult, ${children} children`;
    if (children === 1) return `${adults} adults, 1 child`;
    return `${adults} adults, ${children} children`;
  });

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  updateGuests(type: 'adults' | 'children', change: number) {
    this.guests.update(current => {
      const newValue = Math.max(0, current[type] + change);
      const newGuests = { ...current, [type]: newValue };

      // Ensure adults minimum is 1
      if (type === 'adults' && newValue < 1) {
        newGuests.adults = 1;
      }

      // Emit change
      this.guestsChanged.emit(newGuests);

      return newGuests;
    });
  }

  setGuests(adults: number, children: number) {
    this.guests.set({ adults: Math.max(1, adults), children: Math.max(0, children) });
  }

  getGuests() {
    return this.guests();
  }

  // Close dropdown when clicking outside
  closeDropdown() {
    this.showDropdown = false;
  }
}
