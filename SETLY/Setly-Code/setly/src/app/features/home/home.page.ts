import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { RoomStoreService } from '../../core/services/room-store.service';
import { UniversityService, University } from '../../core/services/university.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/messaging.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { RidesService } from '../../core/services/rides.service';
import { Room } from '../../core/models/room.model';
import { CurrencyCompactPipe } from '../../shared/pipes/currency-compact.pipe';
import { SkeletonCardComponent } from '../../shared/ui/skeleton-card.component';

import { SearchHeroComponent } from '../../shared/ui/search-hero/search-hero.component';
import { RideRequestModalComponent } from '../../shared/ui/ride-request-modal.component';
import { HeaderComponent } from '../../shared/ui/header.component';
import { ProfileNudgeBannerComponent } from '../../shared/ui/profile-nudge-banner.component';

interface SearchParams {
  query?: string;
  city?: string;
  roomType?: 'shared' | 'Private';
  checkIn?: string;
  checkOut?: string;
  studentVerifiedOnly?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SearchHeroComponent,
    RideRequestModalComponent,
    ProfileNudgeBannerComponent
  ],
  template: `
    <div class="min-h-screen bg-white text-gray-900">
      <!-- Debug marker to confirm home component renders -->
      <div class="sr-only" data-testid="home-debug">home-component-mounted</div>
      <!-- Profile completion nudge banner -->
      <section class="container mx-auto px-4 pt-4">
        <app-profile-nudge-banner></app-profile-nudge-banner>
      </section>
      <!-- Premium Hero Section -->
      <section class="relative isolate overflow-hidden" data-testid="hero-section">
        <!-- Ambient gradient background and decorative orbs -->
  <div class="absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#E8F4FF] to-white"></div>
  <div class="absolute top-[-6rem] left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-gradient-to-tr from-[#BBD9FF]/50 via-[#E8F4FF]/10 to-transparent blur-3xl"></div>
  <div class="absolute bottom-[-4rem] right-[-2rem] w-[40rem] h-[40rem] rounded-full bg-gradient-to-tl from-[#BBD9FF]/40 via-[#E8F4FF]/10 to-transparent blur-3xl"></div>
        <div class="container mx-auto px-4 pt-24 pb-32">
          <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <!-- Left Column -->
            <div class="flex-1 w-full space-y-10">
              <div class="space-y-6">
                <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-black/5 text-xs font-medium text-gray-700 shadow-sm">
                  <span class="w-2 h-2 rounded-full animate-pulse" style="background: var(--brand-gradient)"></span>
                  Trusted student housing & rides
                </span>
                <h1 class="text-[2.75rem] md:text-[3.75rem] leading-[1.05] font-semibold tracking-tight text-gray-900">
                  Your next move.
                </h1>
                <p class="text-lg md:text-xl text-gray-600 max-w-xl font-medium">
                  Find trusted homes and rides near your university — connect, live, and move with confidence.
                </p>
              </div>
              <div class="flex flex-col sm:flex-row gap-4">
                <button (click)="navigateToBrowse()" class="group relative inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-semibold text-white overflow-hidden" data-testid="hero-search-button">
                  <span class="absolute inset-0 transition-transform group-hover:scale-105" style="background: var(--brand-gradient)"></span>
                  <span class="relative flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore Rooms
                  </span>
                </button>
                <button (click)="scrollToRides()" class="inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:shadow-md backdrop-blur-sm hover:bg-gray-50 transition" data-testid="hero-ride-button">
                  <svg class="w-5 h-5 mr-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="6" rx="2"/>
                    <path d="M7 10l2-3h6l2 3" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8" cy="17" r="2"/>
                    <circle cx="16" cy="17" r="2"/>
                  </svg>
                  Book a Ride
                </button>
              </div>
              <!-- Metrics row -->
              <div class="grid grid-cols-3 gap-6 pt-4">
                <div class="space-y-1">
                  <div class="text-xl font-semibold text-gray-900">10k+</div>
                  <div class="text-xs text-gray-500">Students</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xl font-semibold text-gray-900">500+</div>
                  <div class="text-xs text-gray-500">Universities</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xl font-semibold text-gray-900">95%</div>
                  <div class="text-xs text-gray-500">Satisfaction</div>
                </div>
              </div>
            </div>
            <!-- Right Column (Search) -->
            <div class="flex-1 w-full max-w-xl mx-auto">
              <div class="relative group">
                <div class="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition"></div>
                <div class="relative rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-lg transition overflow-hidden">
                  <app-search-hero
                    [initialQuery]="searchParams().query || ''"
                    [initialCity]="searchParams().city || ''"
                    [initialRoomType]="searchParams().roomType || ''"
                    [initialCheckIn]="searchParams().checkIn || null"
                    [initialCheckOut]="searchParams().checkOut || null"
                    [initialStudentVerifiedOnly]="searchParams().studentVerifiedOnly || false"
                    (searchChange)="onSearchChange($event)"
                    data-testid="search-hero"
                  ></app-search-hero>
                </div>
              </div>
              <!-- Sub‑note -->
              <p class="mt-6 text-sm text-gray-500 text-center">Verified profiles • Fast messaging • Secure platform</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Rooms Section (Refined) -->
      <section class="py-24 bg-white" data-testid="featured-rooms-section">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div class="space-y-4">
              <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">Featured Rooms</h2>
              <p class="text-gray-600 max-w-md">Curated spaces with quality, comfort and the right vibe – refreshed daily.</p>
            </div>
            <div>
              <button (click)="navigateToBrowse()" class="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl bg-gray-900 text-white hover:bg-black transition">
                Browse all
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </button>
            </div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="!loadingFeatured()">
            <div
              *ngFor="let room of featuredRooms(); trackBy: trackById"
              class="card-premium hover-lift cursor-pointer group"
              (click)="onRoomClick(room)"
              [attr.data-testid]="'room-card-' + room.id"
            >
              <div class="relative">
                <img
                  [src]="room.photos[0] || '/assets/placeholder-room.jpg'"
                  [alt]="room.title"
                  class="w-full h-48 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width="400"
                  height="192"
                >
                <div class="absolute top-4 right-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                    $\{{room.price}}/month
                  </span>
                </div>
              </div>

              <div class="p-6">
                <h3 class="font-medium text-lg text-gray-900 mb-2 group-hover:text-brand-azure transition-colors">
                  {{ room.title }}
                </h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ room.title }}</p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: var(--brand-gradient)">
                      <span class="text-white text-xs font-semibold">{{ room.hostId.charAt(0) }}</span>
                    </div>
                    <span class="text-sm text-gray-700">{{ room.hostId }}</span>
                  </div>

                  <button (click)="onConnectClick(room, $event)" class="inline-flex items-center gap-1 text-sm font-medium text-brand-azure hover:text-brand-midnight transition" [attr.data-testid]="'connect-button-' + room.id">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8a6 6 0 01-12 0"/></svg>
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="loadingFeatured()">
            <div *ngFor="let item of skeletonArray" class="card-premium">
              <div class="loading-shimmer w-full h-48 rounded-t-2xl"></div>
              <div class="p-6 space-y-3">
                <div class="loading-shimmer h-6 w-3/4 rounded"></div>
                <div class="loading-shimmer h-4 w-full rounded"></div>
                <div class="loading-shimmer h-4 w-2/3 rounded"></div>
                <div class="flex justify-between items-center">
                  <div class="loading-shimmer h-8 w-8 rounded-full"></div>
                  <div class="loading-shimmer h-8 w-20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SetlyRide & Uber Cards -->
      <section class="container mx-auto px-4 py-16" data-testid="ride-services">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">SetlyRide</h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Trusted Setly rides near you.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- SetlyRide Card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-white border border-gray-200 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="6" rx="2"/>
                  <path d="M7 10l2-3h6l2 3" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8" cy="17" r="2"/>
                  <circle cx="16" cy="17" r="2"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">SetlyRide</h3>
              <p class="text-gray-600">Carpool with a Setly near you.</p>
            </div>
            <button
              (click)="openRideModal()"
              class="w-full text-white font-medium rounded-lg px-6 py-3 transition btn-brand"
              data-testid="setlyride-button"
            >
              Request SetlyRide
            </button>
          </div>

          <!-- Uber Card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-xl font-bold">U</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Uber</h3>
              <p class="text-gray-600">Quick ride with Uber.</p>
            </div>
            <button
              (click)="openUber()"
              class="w-full bg-black hover:bg-gray-800 text-white font-medium rounded-lg px-6 py-3 transition"
              data-testid="uber-button"
            >
              Open Uber
            </button>
          </div>
        </div>
      </section>
      <!-- Ride Request Modal -->
      <app-ride-request-modal
        [isOpen]="rideModalOpen"
        (rideSubmitted)="onRideSubmitted($event)"
        (closed)="rideModalOpen.set(false)"
        data-testid="ride-modal">
      </app-ride-request-modal>
    </div>
  `,
  styles: [`
    details summary::marker {
      display: none;
    }
    details summary {
      list-style: none;
    }
    details summary::-webkit-details-marker {
      display: none;
    }
  `]
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private universityService = inject(UniversityService);
  private roomStore = inject(RoomStoreService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private analytics = inject(AnalyticsService);
  private ridesService = inject(RidesService);

  // Signals
  loadingFeatured = signal(true);
  searchParams = signal<SearchParams>({
    query: '',
    city: '',
    roomType: undefined,
    checkIn: undefined,
    checkOut: undefined,
    studentVerifiedOnly: false
  });
  rideModalOpen = signal(false);

  // Computed
  featuredRooms = computed(() => {
    return this.roomStore.featuredRooms() ?? [];
  });

  searchActive = computed(() => {
    const params = this.searchParams();
    return !!(params.query || params.city || params.roomType || 
             params.checkIn || params.checkOut || params.studentVerifiedOnly);
  });

  skeletonArray = Array(6).fill(0);

  ngOnInit(): void {
    // Set page title and meta
    this.title.setTitle('Setly - Find Your next Room');
    this.meta.updateTag({ name: 'description', content: 'Find rooms near your university with filters that match your life.' });

    // Load featured rooms
    setTimeout(() => {
      this.loadingFeatured.set(false);
    }, 1000);

    // Subscribe to route query params
    this.route.queryParams.subscribe(params => {
      this.searchParams.set({
        query: params['q'] || '',
        city: params['city'] || '',
        roomType: params['roomType'] as 'shared' | 'Private' || undefined,
        checkIn: params['checkIn'] || undefined,
        checkOut: params['checkOut'] || undefined,
        studentVerifiedOnly: params['studentVerified'] === 'true'
      });
    });

    // Analytics
    this.analytics.trackPageView('homepage');
  }

  onSearchChange(params: SearchParams): void {
    this.searchParams.set(params);
  }

  openRideModal(): void {
    this.rideModalOpen.set(true);
    this.analytics.trackEvent('open_ride_modal', { source: 'homepage' });
  }

  openUber(): void {
    // Fallback destination - the app can supply more context in the future
    const destination = this.searchParams().city || 'campus';
    const link = this.ridesService.getUberDeepLink(destination);
    window.open(link, '_blank');
    this.analytics.trackRideRequest('uber', { destination });
  }

  onRideSubmitted(payload: any): void {
    // Quick analytics and UX hook
    this.analytics.trackRideRequest('setly', { pickup: payload.pickup, drop: payload.drop });
    // Close modal
    this.rideModalOpen.set(false);
  }

  navigateToBrowse(): void {
    const params = this.searchParams();
    const queryParams: Params = {};

    if (params.query) queryParams['q'] = params.query;
    if (params.city) queryParams['city'] = params.city;
    if (params.roomType) queryParams['roomType'] = params.roomType;
    if (params.checkIn) queryParams['checkIn'] = params.checkIn;
    if (params.checkOut) queryParams['checkOut'] = params.checkOut;
    if (params.studentVerifiedOnly) queryParams['studentVerified'] = true;

    // Analytics
    this.analytics.trackSearch(params.query || '', params);

    this.router.navigate(['/browse'], { queryParams });
  }

  onRoomClick(room: Room): void {
    this.analytics.trackRoomClick(room.id);
    this.router.navigate(['/browse'], { queryParams: { highlight: room.id } });
  }

  onConnectClick(room: Room, event: Event): void {
    event.stopPropagation();
    this.analytics.trackEvent('connect_clicked', { room_id: room.id });

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/messages' } });
      return;
    }

    // Create or get thread for this room
    const thread = this.messageService.getThreadByRoomAndUser(room.id, currentUser.id);
    if (thread) {
      this.router.navigate(['/messages'], { queryParams: { threadId: thread.id } });
    } else {
      const newThread = this.messageService.createThread(room.id, [currentUser.id, room.hostId]);
      this.router.navigate(['/messages'], { queryParams: { threadId: newThread.id } });
    }
  }

  scrollToRides(): void {
    const element = document.querySelector('[data-testid="ride-services"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}
