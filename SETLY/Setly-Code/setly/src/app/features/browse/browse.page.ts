import { Component, signal, computed, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoomCardComponent } from '../../shared/ui/room-card.component';
import { FiltersBarComponent } from '../../shared/ui/filters-bar.component';
import { RoomStore } from '../../core/state/room.store';

@Component({
  selector: 'app-browse-page',
  imports: [CommonModule, RoomCardComponent, FiltersBarComponent],
  template: `
    <main class="min-h-screen bg-gray-50">
      <!-- Page Header -->
      <section class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <h1 class="text-2xl font-bold text-gray-900">Browse</h1>
          <!-- Category Tabs -->
          <nav #tabsNav class="mt-4 flex items-center gap-4 text-sm font-medium relative" aria-label="Browse categories">
            <div class="tab-indicator" aria-hidden="true"></div>
            <a routerLink="/browse" routerLinkActive="active-tab" class="tab-link">Rooms</a>
            <a routerLink="/ride" routerLinkActive="active-tab" class="tab-link">Rides</a>
            <a routerLink="/connect/marketplace" routerLinkActive="active-tab" class="tab-link">Marketplace</a>
          </nav>
        </div>
      </section>

      <!-- Filters Bar below tabs with Post button on right -->
      <div class="bg-white">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-start gap-4 py-3">
            <div class="flex-1 min-w-0">
              <app-filters-bar (filtersChanged)="onFiltersChanged($event)"></app-filters-bar>
            </div>
            <div class="pt-1">
              <a routerLink="/open-room" class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 focus-ring" aria-label="Post a room">+</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Listings Grid -->
      <section class="py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between items-center mb-6">
            <div></div>
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
      <!-- Floating Action Button (mobile) -->
      <a routerLink="/open-room" aria-label="Post a room" class="md:hidden fixed bottom-5 right-5 w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-indigo-400">
        <span class="text-3xl leading-none">+</span>
      </a>
    </main>
  `
})
export class BrowsePage {
  private roomStore = inject(RoomStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private routerSub?: Subscription;
  private resizeUnlisten: (() => void) | null = null;

  @ViewChild('tabsNav', { static: true }) tabsNav!: ElementRef<HTMLElement>;

  loading = signal(true);
  filteredRooms = computed(() => this.roomStore.filteredRooms());

  // Indicator state handled at runtime (positions computed)

  constructor() {
    this.loadRooms();
    this.handleQueryParams();
  }

  ngAfterViewInit(): void {
    // Compute indicator initially and on navigation/resize
    setTimeout(() => this.updateIndicator(), 0);
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        // Delay so routerLinkActive classes update
        setTimeout(() => this.updateIndicator(), 30);
      }
    });

    this.resizeUnlisten = this.renderer.listen('window', 'resize', () => {
      this.updateIndicator();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.resizeUnlisten) this.resizeUnlisten();
  }

  private updateIndicator(): void {
    try {
      const navEl = this.tabsNav?.nativeElement as HTMLElement;
      if (!navEl) return;
      const indicator = navEl.querySelector('.tab-indicator') as HTMLElement | null;
      if (!indicator) return;

      const active = navEl.querySelector('.active-tab') as HTMLElement | null;
      if (!active) {
        // hide
        indicator.style.opacity = '0';
        indicator.style.width = '0px';
        return;
      }

      const left = active.offsetLeft;
      const width = active.offsetWidth;
      // position indicator (use left/width for pixel-perfect movement)
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
      indicator.style.opacity = '1';
    } catch (err) {
      // safe guard -- if DOM not ready or SSR, ignore
      // console.debug('tab indicator update failed', err);
    }
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

      // Map ?q= to enhanced multi-field query instead of unused city filter
      if (params['q']) filters.query = params['q'];
      if (params['ci']) filters.checkIn = params['ci'];
      if (params['co']) filters.checkOut = params['co'];
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
