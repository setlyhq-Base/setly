import { Component, signal, computed, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoomCardComponent } from '../../shared/ui/room-card.component';
import { FiltersBarComponent } from '../../shared/ui/filters-bar.component';
import { BottomSheetComponent } from '../../shared/ui/bottom-sheet.component';
import { RoomStore } from '../../core/state/room.store';

@Component({
  selector: 'app-browse-page',
  imports: [CommonModule, RoomCardComponent, FiltersBarComponent, BottomSheetComponent, RouterLink, RouterLinkActive],
  template: `
    <main class="min-h-screen bg-gradient-to-b from-gray-50 to-white page-transition">
      <!-- Mobile-Optimized Header -->
      <section class="bg-white border-b border-gray-100 sticky top-0 z-40 md:static">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6">
          <div class="flex items-center justify-between mb-3 md:mb-0">
            <h1 class="text-xl md:text-2xl font-bold text-gray-900">Browse Rooms</h1>
            <!-- Mobile Filter Button -->
            <button 
              (click)="showMobileFilters.set(true)"
              class="md:hidden px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors"
              aria-label="Open filters">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filters
              @if (hasActiveFilters()) {
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              }
            </button>
          </div>
          
          <!-- Desktop Tabs -->
          <nav #tabsNav class="hidden md:flex mt-4 items-center gap-4 text-sm font-medium relative" aria-label="Browse categories">
            <div class="tab-indicator" aria-hidden="true"></div>
            <a routerLink="/browse" [routerLinkActive]="'active-tab'" class="tab-link">Rooms</a>
            <a routerLink="/ride" [routerLinkActive]="'active-tab'" class="tab-link">Rides</a>
            <a routerLink="/connect/marketplace" [routerLinkActive]="'active-tab'" class="tab-link">Marketplace</a>
          </nav>
        </div>
      </section>

      <!-- Desktop Filters Bar -->
      <div class="hidden md:block bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="flex items-start gap-4 py-3">
            <div class="flex-1 min-w-0">
              <app-filters-bar (filtersChanged)="onFiltersChanged($event)"></app-filters-bar>
            </div>
            <div class="pt-1">
              <a routerLink="/open-room" class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 focus-ring transition-all hover:scale-110" aria-label="Post a room">
                <span class="text-xl leading-none">+</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Listings Section -->
      <section class="py-6 md:py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <!-- Results header -->
          <div class="flex justify-between items-center mb-4 md:mb-6">
            <p class="text-sm text-gray-600">
              <span class="font-semibold text-gray-900">{{ filteredRooms().length }}</span> rooms available
            </p>
            <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
              <option>Most recent</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Distance</option>
            </select>
          </div>

          <!-- Loading skeleton -->
          <div *ngIf="loading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="card animate-pulse">
              <div class="aspect-[4/3] bg-gray-200 rounded-t-xl"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
                <div class="flex gap-2">
                  <div class="h-6 bg-gray-200 rounded w-16"></div>
                  <div class="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Listings Grid - Responsive -->
          <div *ngIf="!loading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <app-room-card
              *ngFor="let room of filteredRooms(); trackBy: trackByRoomId"
              [room]="room"
              class="hover-lift"
            ></app-room-card>
          </div>

          <!-- Empty state -->
          <div *ngIf="!loading() && filteredRooms().length === 0" class="text-center py-16 md:py-24">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">No rooms found</h2>
            <p class="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button 
              (click)="clearFilters()"
              class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <!-- Mobile FAB -->
      <a 
        routerLink="/open-room" 
        aria-label="Post a room" 
        class="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:shadow-2xl active:scale-95 transition-all z-30 ripple">
        <span class="text-2xl leading-none font-light">+</span>
      </a>
    </main>

    <!-- Mobile Filters Bottom Sheet -->
    <app-bottom-sheet 
      [isOpen]="showMobileFilters()"
      [title]="'Filters'"
      [showFooter]="true"
      (closed)="showMobileFilters.set(false)">
      
      <app-filters-bar (filtersChanged)="onFiltersChanged($event)"></app-filters-bar>
      
      <div footer class="flex gap-3">
        <button 
          (click)="clearFilters(); showMobileFilters.set(false)"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Clear All
        </button>
        <button 
          (click)="showMobileFilters.set(false)"
          class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Show {{ filteredRooms().length }} Results
        </button>
      </div>
    </app-bottom-sheet>
  `
})
export class BrowsePage {
  private roomStore = inject(RoomStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private routerSub?: Subscription;
  private resizeUnlisten: (() => void) | null = null;

  @ViewChild('tabsNav') tabsNav?: ElementRef<HTMLElement>;

  loading = signal(true);
  filteredRooms = computed(() => this.roomStore.filteredRooms());
  showMobileFilters = signal(false);
  hasActiveFilters = computed(() => {
    const filters = this.roomStore.filters() as Record<string, any>;
    return Object.keys(filters).some(key => filters[key] !== undefined && filters[key] !== null && filters[key] !== '');
  });

  constructor() {
    this.loadRooms();
    this.handleQueryParams();
  }

  ngAfterViewInit(): void {
    // Compute indicator initially and on navigation/resize
    setTimeout(() => this.updateIndicator(), 0);
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
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

  trackByRoomId(index: number, room: any): string {
    return room.id || index.toString();
  }

  clearFilters(): void {
    this.roomStore.updateFilters({});
  }

  private updateIndicator(): void {
    try {
      const navEl = this.tabsNav?.nativeElement as HTMLElement;
      if (!navEl) return;
      const indicator = navEl.querySelector('.tab-indicator') as HTMLElement | null;
      if (!indicator) return;

      const active = navEl.querySelector('.active-tab') as HTMLElement | null;
      if (!active) {
        indicator.style.opacity = '0';
        indicator.style.width = '0px';
        return;
      }

      const left = active.offsetLeft;
      const width = active.offsetWidth;
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
      indicator.style.opacity = '1';
    } catch (err) {
      // Safe guard for SSR or DOM not ready
    }
  }

  private async loadRooms(): Promise<void> {
    this.loading.set(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.loading.set(false);
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const filters: any = {};

      if (params['q']) filters.query = params['q'];
      if (params['ci']) filters.checkIn = params['ci'];
      if (params['co']) filters.checkOut = params['co'];
      if (params['type']) filters.roomType = params['type'];
      if (params['sv']) filters.studentVerifiedOnly = params['sv'] === '1';

      if (Object.keys(filters).length > 0) {
        this.roomStore.updateFilters(filters);
      }
    });
  }

  onFiltersChanged(filters: any): void {
    const roomFilters: any = {};
    if (filters.query !== undefined) roomFilters.query = filters.query;
    if (filters.budgetMin !== undefined) roomFilters.priceMin = filters.budgetMin;
    if (filters.budgetMax !== undefined) roomFilters.priceMax = filters.budgetMax;
    if (filters.veg !== undefined) roomFilters.vegetarian = filters.veg;
    if (filters.smoke !== undefined) roomFilters.noSmoking = !filters.smoke;
    if (filters.pets !== undefined) roomFilters.petsOk = filters.pets;
    if (filters.roomType === 'private') roomFilters.privateRoom = true;
    if (filters.furnished !== undefined) roomFilters.furnished = filters.furnished;

    this.roomStore.updateFilters(roomFilters);
  }
}
