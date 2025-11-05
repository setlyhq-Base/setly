import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filters-bar',
  imports: [CommonModule],
  template: `
    <div class="bg-white border-b border-gray-200 px-4 py-4">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Budget Range -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Budget:</label>
            <input
              type="number"
              placeholder="Min"
              class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              (input)="updateFilters()"
              #minBudget
            >
            <span class="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              (input)="updateFilters()"
              #maxBudget
            >
          </div>

          <!-- Toggles -->
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="rounded" (change)="updateFilters()" #veg>
              <span class="text-sm text-gray-700">Vegetarian</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="rounded" (change)="updateFilters()" #noSmoke>
              <span class="text-sm text-gray-700">No smoking</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="rounded" (change)="updateFilters()" #pets>
              <span class="text-sm text-gray-700">Pets ok</span>
            </label>
          </div>

          <!-- Room/Bath selects -->
          <select class="px-3 py-1 border border-gray-300 rounded text-sm" (change)="updateFilters()" #roomType>
            <option value="">Room type</option>
            <option value="private">Private</option>
            <option value="shared">Shared</option>
          </select>

          <select class="px-3 py-1 border border-gray-300 rounded text-sm" (change)="updateFilters()" #bathType>
            <option value="">Bath type</option>
            <option value="private">Private bath</option>
            <option value="shared">Shared bath</option>
          </select>

          <!-- More filters button -->
          <button class="btn btn-secondary" (click)="toggleMoreFilters()">
            More filters
          </button>
        </div>

        <!-- More filters panel (stub) -->
        <div *ngIf="showMoreFilters" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <p class="text-gray-600">More filters coming soon...</p>
        </div>
      </div>
    </div>
  `
})
export class FiltersBarComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  showMoreFilters = false;

  minBudget: any;
  maxBudget: any;
  veg: any;
  noSmoke: any;
  pets: any;
  roomType: any;

  updateFilters(): void {
    const filters = {
      query: "",
      budgetMin: this.minBudget?.value || "",
      budgetMax: this.maxBudget?.value || "",
      veg: this.veg?.checked || false,
      smoke: this.noSmoke?.checked || false,
      pets: this.pets?.checked || false,
      roomType: this.roomType?.value || "",
      furnished: false
    };
    this.filtersChanged.emit(filters);
  }

  toggleMoreFilters(): void {
    this.showMoreFilters = !this.showMoreFilters;
  }
}
