import { Component, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnifiedSearchComponent } from './unified-search.component';
import { FilterPanelComponent } from './components/filter-panel.component';
import { RoomResultCardComponent } from './components/room-result-card.component';
import { RideResultCardComponent } from './components/ride-result-card.component';
import { MarketResultCardComponent } from './components/market-result-card.component';
import { RoomStore } from '../../core/state/room.store';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UnifiedSearchComponent, FilterPanelComponent, RoomResultCardComponent, RideResultCardComponent, MarketResultCardComponent],
  template: `
  <main class="explore-page min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_55%,#f6f8ff_100%)]">
      <section class="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 text-center mb-4">Explore Setly</h1>
        <p class="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-10">Rooms, rides, and marketplace — all in one calm, unified experience.</p>
        <app-unified-search (activeTabChange)="onTabChange($event)" (performedSearch)="onSearch($event)"></app-unified-search>
      </section>

      <!-- Results / Filters layout -->
      <section class="max-w-7xl mx-auto px-6 pb-24">
  <div class="flex gap-10" [class.filters-hidden]="filtersHidden()" [class.mobile-filters-open]="mobileFiltersOpen()">
          <!-- Sidebar -->
          <aside id="filtersPanel" class="w-72 shrink-0 md:sticky md:top-28" *ngIf="!filtersHidden()" aria-label="Filters" [class.mobile-panel]="mobileFiltersOpen()" [attr.role]="mobileFiltersOpen() ? 'dialog' : null" [attr.aria-modal]="mobileFiltersOpen() ? 'true' : null" tabindex="-1">
            <app-filter-panel
              [activeTab]="activeTab()"
              [roomsFilters]="roomsFilters"
              [ridesFilters]="ridesFilters"
              [marketFilters]="marketFilters"
              [amenities]="amenities"
              [showClose]="mobileFiltersOpen()"
              (hide)="toggleFilters()"
              (close)="closeMobileFilters()"
            />
          </aside>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div class="flex items-center gap-3">
                <button *ngIf="filtersHidden()" class="text-sm px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition" (click)="toggleFilters()" aria-controls="filtersPanel" [attr.aria-expanded]="!filtersHidden()">Show Filters</button>
                <button *ngIf="!filtersHidden()" class="md:hidden text-sm px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition" (click)="openMobileFilters()" aria-controls="filtersPanel" [attr.aria-expanded]="mobileFiltersOpen()">Filters</button>
              </div>
              <div class="text-sm text-gray-500">Showing <span class="font-medium text-gray-700">{{ results().length }}</span> {{ activeTab() }}</div>
              <div class="flex items-center gap-2">
                <select class="text-sm rounded-full px-3 py-2 bg-white/80 backdrop-blur border border-white/60 shadow-[0_2px_6px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option>Most relevant</option>
                  <option>Newest</option>
                  <option>Price low-high</option>
                </select>
              </div>
            </div>

            <!-- Grid -->
            <div *ngIf="!loading() && results().length > 0" class="grid gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-200" [style.opacity]="loading() ? 0.35 : 1">
              <ng-container [ngSwitch]="activeTab()">
                <ng-container *ngSwitchCase="'rooms'">
                  <app-room-result-card *ngFor="let item of results()" [item]="item"></app-room-result-card>
                </ng-container>
                <ng-container *ngSwitchCase="'rides'">
                  <app-ride-result-card *ngFor="let item of results()" [item]="item"></app-ride-result-card>
                </ng-container>
                <ng-container *ngSwitchCase="'market'">
                  <app-market-result-card *ngFor="let item of results()" [item]="item"></app-market-result-card>
                </ng-container>
              </ng-container>
            </div>

            <!-- Loading skeleton -->
            <div *ngIf="loading()" class="grid gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div *ngFor="let i of skeleton" class="card-result animate-pulse">
                <div class="thumb bg-gray-200"></div>
                <div class="p-3 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div class="h-4 bg-gray-200 rounded w-2/5"></div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div *ngIf="!loading() && results().length === 0" class="text-center py-24">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">No {{ activeTab() }} found</h3>
              <p class="text-sm text-gray-600 max-w-sm mx-auto">Try adjusting your search or filters for a broader match.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .filters-hidden aside { display: none; }
    .filter-label { @apply block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1; }
  .filter-input { @apply w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400; }
  .pill { @apply px-3 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300; }
    .pill.on { @apply border-indigo-500 bg-indigo-50 text-indigo-700; }
    /* Mobile filters overlay */
    .mobile-filters-open .mobile-panel { @apply fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-xl overflow-y-auto px-4 pt-5 pb-8; }
    .mobile-filters-open::before { content:''; @apply fixed inset-0 bg-black/30 z-30 md:hidden; }
    /* Explore scoped premium adjustments */
    .explore-page .card-premium { @apply bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-5 transition; }
    .explore-page .card-premium:hover { @apply shadow-[0_8px_32px_-4px_rgba(0,0,0,0.07)]; }
    .explore-page .hover-lift:hover { transform:translateY(-3px); }
  `]
})
export class SearchPage {
  private roomStore = inject(RoomStore);
  activeTab = signal<'rooms'|'rides'|'market'>('rooms');
  filtersHidden = signal(false);
  loading = signal(false);
  mobileFiltersOpen = signal(false);
  skeleton = Array.from({ length: 8 }, (_, i) => i);

  roomsFilters = { price: 1500, place: '', type: '', property: '', amenities: [] as string[], studentVerified: false, rating: '' };
  ridesFilters = { from: '', to: '', date: '', time: '', priceMax: 0, seats: 1, radius: 0, rating: '' };
  marketFilters = { category: '', maxPrice: 0, condition: '', place: '', seller: '' };
  amenities = ['Wi-Fi','Laundry','Parking','Kitchen','AC'];

  // Adapt /browse RoomStore data for Explore -> Rooms cards
  browseRoomItems = computed(() =>
    this.roomStore.filteredRooms().map(r => ({
      title: r.title,
      location: r.city || r.universityName || r.address,
      price: `$${r.price}/mo`,
      priceNum: r.price,
      image: r.image || '/assets/placeholder-room.jpg',
      host: r.hostName || 'Host'
    }))
  );
  rideResults = signal<any[]>([
    { title: 'Boston → NYC', from: 'Boston', to: 'New York', location: 'Leaves Fri 6 PM', price: '$35/seat', priceNum: 35, seats: 3, rating: 4.6, image: '/assets/placeholder-room.jpg', badge: '3 seats left', driver: 'Eve' },
    { title: 'Campus → Airport', from: 'Boston University', to: 'Logan Airport', location: 'Tomorrow 9 AM', price: '$15/seat', priceNum: 15, seats: 1, rating: 4.1, image: '/assets/placeholder-room.jpg', driver: 'Frank' }
  ]);
  marketResults = signal<any[]>([
    { title: 'IKEA Desk - Like New', category: 'Furniture', location: 'Boston University', price: '$50', priceNum: 50, condition: 'Like new', place: 'Boston', seller: 'Student', image: '/assets/placeholder-room.jpg', badge: 'Furniture' },
    { title: 'Physics Textbook', category: 'Books', location: 'Harvard', price: '$25', priceNum: 25, condition: 'Used', place: 'Cambridge', seller: 'Student', image: '/assets/placeholder-room.jpg', badge: 'Books' }
  ]);

  results = computed(() => {
    if (this.activeTab() === 'rooms') {
      const f = this.roomsFilters;
      return this.browseRoomItems().filter(r =>
        r.priceNum <= (f.price || 99999) &&
        (!f.place || (r.location || '').toLowerCase().includes(f.place.toLowerCase()))
      );
    }
    if (this.activeTab() === 'rides') {
      const f = this.ridesFilters;
      return this.rideResults().filter(r =>
        (!f.from || (r.from || '').toLowerCase().includes(f.from.toLowerCase())) &&
        (!f.to || (r.to || '').toLowerCase().includes(f.to.toLowerCase())) &&
        (!f.priceMax || r.priceNum <= f.priceMax) &&
        (!f.seats || r.seats >= f.seats) &&
        (!f.rating || r.rating >= (+f.rating[0] || 0))
      );
    }
    const f = this.marketFilters;
    return this.marketResults().filter(m =>
      (!f.category || m.category === f.category) &&
      (!f.maxPrice || m.priceNum <= f.maxPrice) &&
      (!f.condition || m.condition === f.condition) &&
      (!f.place || (m.place || m.location || '').toLowerCase().includes(f.place.toLowerCase())) &&
      (!f.seller || (m.seller || '').toLowerCase().includes(f.seller.toLowerCase()))
    );
  });

  onTabChange(tab: 'rooms'|'rides'|'market'){ this.activeTab.set(tab); this.loading.set(true); setTimeout(()=> this.loading.set(false), 150); }
  onSearch(ev: any){ this.loading.set(true); setTimeout(() => { this.loading.set(false); }, 600); }
  toggleFilters(){ this.filtersHidden.set(!this.filtersHidden()); }
  toggleAmenity(a: string){ const idx = this.roomsFilters.amenities.indexOf(a); if (idx>=0) this.roomsFilters.amenities.splice(idx,1); else this.roomsFilters.amenities.push(a); }
  openMobileFilters(){ this.mobileFiltersOpen.set(true); }
  closeMobileFilters(){ this.mobileFiltersOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscape(){ if (this.mobileFiltersOpen()) this.mobileFiltersOpen.set(false); }
}
