import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoomCardComponent } from '../../shared/ui/room-card.component';
import { FiltersBarComponent } from '../../shared/ui/filters-bar.component';
import { RoomStore } from '../../core/state/room.store';

@Component({
  selector: 'app-browse-page',
  imports: [CommonModule, RoomCardComponent, FiltersBarComponent],
  template: `
    <main class="min-h-screen bg-gray-50">
      <!-- Filters Bar -->
      <app-filters-bar (filtersChanged)="onFiltersChanged($event)"></app-filters-bar>

      <!-- Listings Grid -->
      <section class="py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              Browse Rooms
            </h1>
            <select class="px-3 py-2 border border-gray-300 rounded-lg">
              <option>Most recent</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Distance</option>
            </select>
          </div>

          <!-- Loading skeleton -->
          <div *ngIf="loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="card animate-pulse">
              <div class="aspect-video bg-gray-300 rounded-t-lg"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                <div class="h-6 bg-gray-300 rounded w-1/2"></div>
                <div class="h-3 bg-gray-300 rounded w-full"></div>
                <div class="flex space-x-2">
                  <div class="h-6 bg-gray-300 rounded w-16"></div>
                  <div class="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Listings -->
          <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <app-room-card
              *ngFor="let room of filteredRooms()"
              [room]="room"
            ></app-room-card>
          </div>

          <!-- Empty state -->
          <div *ngIf="!loading() && filteredRooms().length === 0" class="text-center py-16">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">No rooms found</h2>
            <p class="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        </div>
      </section>
    </main>
  `
})
export class BrowsePage {
  private roomStore = inject(RoomStore);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  filteredRooms = computed(() => this.roomStore.filteredRooms());

  constructor() {
    this.loadRooms();
    this.handleQueryParams();
  }

  private async loadRooms(): Promise<void> {
    this.loading.set(true);
    // Rooms are loaded in RoomStore constructor
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    this.loading.set(false);
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const filters: any = {};

      if (params['q']) filters.city = params['q'];
      if (params['type']) filters.roomType = params['type'];
      if (params['ci']) filters.checkIn = params['ci'];
      if (params['co']) filters.checkOut = params['co'];
      if (params['sv']) filters.studentVerifiedOnly = params['sv'] === '1';

      if (Object.keys(filters).length > 0) {
        this.roomStore.updateFilters(filters);
      }
    });
  }

  onFiltersChanged(filters: any): void {
    // Map filters-bar filters to room store filters
    const roomFilters: any = {};
    if (filters.query !== undefined) roomFilters.query = filters.query;
    if (filters.budgetMin !== undefined) roomFilters.priceMin = filters.budgetMin;
    if (filters.budgetMax !== undefined) roomFilters.priceMax = filters.budgetMax;
    if (filters.veg !== undefined) roomFilters.vegetarian = filters.veg;
    if (filters.smoke !== undefined) roomFilters.noSmoking = !filters.smoke; // Invert since smoke is "no smoking"
    if (filters.pets !== undefined) roomFilters.petsOk = filters.pets;
    if (filters.roomType === 'private') roomFilters.privateRoom = true;
    if (filters.furnished !== undefined) roomFilters.furnished = filters.furnished;

    this.roomStore.updateFilters(roomFilters);
  }
}
