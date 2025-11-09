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
import { ChatWidgetComponent } from '../../features/assistant/chat-widget.component';

import { SearchHeroComponent } from '../../shared/ui/search-hero/search-hero.component';
import { RideRequestModalComponent } from '../../shared/ui/ride-request-modal.component';
import { TestimonialCarouselComponent } from '../../shared/ui/testimonial-carousel.component';
import { HeaderComponent } from '../../shared/ui/header.component';
import { FooterComponent } from '../../shared/ui/footer.component';

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
    ChatWidgetComponent,
    SearchHeroComponent,
    RideRequestModalComponent,
    TestimonialCarouselComponent
  ],
  template: `
    <div class="min-h-screen bg-white text-gray-900">
      <!-- Debug marker to confirm home component renders -->
      <div class="sr-only" data-testid="home-debug">home-component-mounted</div>
      <!-- Hero Section -->
      <section class="section-premium section-gradient animate-fade-in" data-testid="hero-section">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Left Column -->
            <div class="space-y-8 animate-slide-up">
              <div>
                <h1 class="heading-premium mb-6 text-gradient">
                  Find Your Perfect Room
                </h1>
                <p class="subheading-premium max-w-xl">
                  Connect with students and find housing that matches your lifestyle.
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <button
                  (click)="navigateToBrowse()"
                  class="btn-primary"
                  data-testid="hero-search-button"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  Find Rooms
                </button>
                <button
                  (click)="scrollToRides()"
                  class="btn-secondary"
                  data-testid="hero-ride-button"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a4 4 0 004 4h4m-4-4v4m0-4H8m8 0V7a4 4 0 00-4-4H8a4 4 0 00-4 4v8"></path>
                  </svg>
                  Book a Ride
                </button>
              </div>
            </div>

            <!-- Right Column -->
            <div class="animate-scale-in">
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
        </div>
      </section>

      <!-- Featured Rooms Section -->
      <section class="section-premium bg-white" data-testid="featured-rooms-section">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="heading-premium mb-4">Featured Rooms</h2>
            <p class="subheading-premium">Discover amazing spaces shared by students just like you</p>
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
                  <span class="chip bg-white/90 backdrop-blur-sm text-gray-900">
                    $\{{room.price}}/month
                  </span>
                </div>
              </div>

              <div class="p-6">
                <h3 class="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {{ room.title }}
                </h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ room.title }}</p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-semibold">{{ room.hostId.charAt(0) }}</span>
                    </div>
                    <span class="text-sm text-gray-700">{{ room.hostId }}</span>
                  </div>

                  <button
                    (click)="onConnectClick(room, $event)"
                    class="btn-ghost text-blue-600 hover:text-blue-700"
                    [attr.data-testid]="'connect-button-' + room.id"
                  >
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
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Get Around Campus</h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with peers for rides or use Uber for quick trips around your university.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- SetlyRide Card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🚗</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">SetlyRide</h3>
              <p class="text-gray-600">Peer-to-peer rides with students near your university.</p>
            </div>
            <button
              (click)="openRideModal()"
              class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 transition"
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
              <p class="text-gray-600">Quick rides to and from campus with Uber.</p>
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

      <!-- Trust & Proof Section -->
      <section class="bg-gray-50 py-16" data-testid="trust-proof">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Trusted by Students</h2>
            <p class="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of verified students who have found their perfect housing and transportation solutions.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div class="text-gray-600">Students Connected</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div class="text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div class="text-gray-600">Universities Served</div>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section class="container mx-auto px-4 py-16" data-testid="how-it-works">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4" id="how-it-works">How it works</h2>
        </div>

        <div class="grid md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">Create your profile</h3>
            <p class="text-gray-600">Set your preferences for room type, budget, and lifestyle choices.</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">Search & filter by university</h3>
            <p class="text-gray-600">Find rooms near your university with our smart filtering system.</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">Connect & confirm</h3>
            <p class="text-gray-600">Message hosts directly and secure your perfect room.</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">4</span>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">Get around campus</h3>
            <p class="text-gray-600">Use SetlyRide for peer-to-peer rides or Uber for quick trips.</p>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="container mx-auto px-4 py-16" data-testid="testimonials-section">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4" id="what-students-say">What students say</h2>
        </div>
        <app-testimonial-carousel data-testid="testimonials-carousel"></app-testimonial-carousel>
      </section>

      <!-- FAQ Section -->
      <section class="container mx-auto px-4 py-16" data-testid="faq-section">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4" id="faq">Frequently asked questions</h2>
        </div>

        <div class="max-w-3xl mx-auto space-y-4">
          <details class="rounded-2xl bg-white border border-gray-200 shadow-sm">
            <summary class="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition">
              Is Setly only for Indian community?
            </summary>
            <div class="px-6 pb-4 text-gray-700">
              No, Setly is for all students! While we have filters for Indian community preferences, our platform welcomes students from all backgrounds and cultures.
            </div>
          </details>

          <details class="rounded-2xl bg-white border border-gray-200 shadow-sm">
            <summary class="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition">
              Do you handle leases?
            </summary>
            <div class="px-6 pb-4 text-gray-700">
              Not yet. Currently, Setly helps you connect with hosts. Lease agreements are handled directly between you and the host. We're working on lease management features for the future.
            </div>
          </details>

          <details class="rounded-2xl bg-white border border-gray-200 shadow-sm">
            <summary class="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition">
              Are payments safe?
            </summary>
            <div class="px-6 pb-4 text-gray-700">
              We're integrating Stripe for secure payments (coming soon in beta). For now, we recommend using secure payment methods and documenting all agreements.
            </div>
          </details>

          <details class="rounded-2xl bg-white border border-gray-200 shadow-sm">
            <summary class="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition">
              Is my phone number public?
            </summary>
            <div class="px-6 pb-4 text-gray-700">
              No, your contact information remains private until you mutually agree to connect with a host. We only facilitate the initial connection through our messaging system.
            </div>
          </details>
        </div>
      </section>

      <!-- Final CTA Section -->
      <section class="container mx-auto px-4 py-16" data-testid="final-cta">
        <div class="rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-slate-700 p-8 md:p-12 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4" id="ready-for-next-move">Ready for your next move?</h2>
          <p class="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect room near campus.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="navigateToBrowse()"
              class="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 transition"
              aria-label="Setly - Find Your next Room"
              data-testid="cta-search-button">
              Setly - Find Your next Room
            </button>
            <button
              [routerLink]="'/post-room'"
              class="bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-100 font-medium rounded-lg px-6 py-3 transition"
              aria-label="Post a room"
              data-testid="cta-post-button">
              Post a room
            </button>
          </div>
        </div>
      </section>

      <!-- Chat Widget -->
      <app-chat-widget data-testid="chat-widget"></app-chat-widget>

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
