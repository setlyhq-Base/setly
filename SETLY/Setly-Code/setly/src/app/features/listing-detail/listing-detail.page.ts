import { Component, signal, inject, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Room } from '../../core/models/room.model';
import { ToastService } from '../../core/services/toast.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { RoomsService } from '../../core/services/rooms.service';
import { NearbyService, NearbyChip } from '../../core/services/nearby.service';
import { UsersService } from '../../core/services/users.service';
import { DummyPeopleService, DummyUser } from '../../core/services/dummy-people.service';
import { AuthStore } from '../../core/state/auth.store';
import { RoomStore } from '../../core/state/room.store';

@Component({
  selector: 'app-listing-detail-page',
  imports: [CommonModule],
  template: `
  <main class="min-h-screen bg-white">
    <!-- Not Found State -->
    <section *ngIf="!room()" class="py-24 text-center">
      <div class="max-w-md mx-auto px-4">
        <div class="text-5xl mb-4">🔎</div>
        <h1 class="text-2xl font-semibold mb-2">Listing not found</h1>
        <p class="text-gray-600 mb-6">The listing may have been removed or the link is incorrect.</p>
        <button class="btn-secondary mr-2" (click)="goBack()">Back to Browse</button>
        <a routerLink="/browse" class="btn-primary px-4 py-2 rounded-lg">Browse Listings</a>
      </div>
    </section>

    <!-- Anchor Nav (Sticky) -->
    <nav *ngIf="room()" class="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/80 hidden md:block shadow-sm">
      <ul class="max-w-7xl mx-auto px-6 flex gap-8 text-sm font-medium">
        <li><button (click)="scrollTo('photos')" class="py-4 -mb-px border-b-2 border-transparent hover:border-gray-300 transition"
            [class.border-blue-500]="activeAnchor()==='photos'" [class.text-blue-600]="activeAnchor()==='photos'" [class.font-semibold]="activeAnchor()==='photos'">Photos</button></li>
        <li><button (click)="scrollTo('overview')" class="py-4 -mb-px border-b-2 border-transparent hover:border-gray-300 transition"
            [class.border-blue-500]="activeAnchor()==='overview'" [class.text-blue-600]="activeAnchor()==='overview'" [class.font-semibold]="activeAnchor()==='overview'">Overview</button></li>
        <li><button (click)="scrollTo('amenities')" class="py-4 -mb-px border-b-2 border-transparent hover:border-gray-300 transition"
            [class.border-blue-500]="activeAnchor()==='amenities'" [class.text-blue-600]="activeAnchor()==='amenities'" [class.font-semibold]="activeAnchor()==='amenities'">Amenities</button></li>
        <li><button (click)="scrollTo('location')" class="py-4 -mb-px border-b-2 border-transparent hover:border-gray-300 transition"
            [class.border-blue-500]="activeAnchor()==='location'" [class.text-blue-600]="activeAnchor()==='location'" [class.font-semibold]="activeAnchor()==='location'">Location</button></li>
        <li><button (click)="scrollTo('host')" class="py-4 -mb-px border-b-2 border-transparent hover:border-gray-300 transition"
            [class.border-blue-500]="activeAnchor()==='host'" [class.text-blue-600]="activeAnchor()==='host'" [class.font-semibold]="activeAnchor()==='host'">Host</button></li>
        <li><button (click)="scrollTo('things')" class="py-4 -mb-px border-b-2 border-transparent hover:border-gray-300 transition"
            [class.border-blue-500]="activeAnchor()==='things'" [class.text-blue-600]="activeAnchor()==='things'" [class.font-semibold]="activeAnchor()==='things'">Things to know</button></li>
      </ul>
    </nav>

    <!-- Top Carousel -->
    <section *ngIf="room()" id="photos" class="max-w-7xl mx-auto px-4 md:px-6 pt-6">
      <div class="relative rounded-2xl overflow-hidden border bg-gray-50">
        <div class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth" (scroll)="onCarouselScroll($event)">
          <button
            *ngFor="let p of room()?.photos; let i=index"
            class="relative shrink-0 w-full snap-center focus:outline-none"
            (click)="openGalleryAt(i)"
            [attr.aria-label]="'Open photo ' + (i+1)"
          >
            <img
              [src]="p"
              class="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover transition-transform duration-300"
              [alt]="room()?.title || 'Listing photo'"
              loading="lazy"
            />
          </button>
        </div>

        <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent pointer-events-none"></div>
        <button
          *ngIf="(room()?.photos?.length || 0) > 1"
          class="absolute bottom-4 right-4 text-xs px-3 py-2 rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/70"
          (click)="openGallery()"
          aria-label="Show all photos"
        >
          🖼️ Show all photos
        </button>
        <div *ngIf="(room()?.photos?.length || 0) > 1" class="absolute bottom-4 left-4 flex items-center gap-1.5" aria-label="Photo position">
          <span
            *ngFor="let p of room()?.photos; let i=index"
            class="w-1.5 h-1.5 rounded-full"
            [class.bg-white]="i === mainImageIndex()"
            [class.bg-white/40]="i !== mainImageIndex()"
          ></span>
        </div>
      </div>
    </section>

    <!-- Main Body Grid -->
    <section *ngIf="room()" class="max-w-7xl mx-auto px-4 md:px-6 mt-10 mb-16" id="overview">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Left column -->
        <div class="lg:col-span-7 space-y-10">
          <!-- Title / Meta -->
          <div class="space-y-2">
            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight">{{ displayTitle() }}</h1>
            <p class="text-gray-600 text-sm">
              <ng-container *ngIf="room()?.address; else cityState">{{ room()?.address }}</ng-container>
              <ng-template #cityState>{{ room()?.city }}, {{ room()?.state }}</ng-template>
            </p>
            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span *ngIf="room()?.availabilityStart || room()?.availabilityEnd" class="inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-white/70">
                <span aria-hidden="true">📅</span>
                <span>
                  <ng-container *ngIf="room()?.availabilityStart">From {{ room()?.availabilityStart | date:'MMM d, y' }}</ng-container>
                  <ng-container *ngIf="room()?.availabilityEnd"> · Until {{ room()?.availabilityEnd | date:'MMM d, y' }}</ng-container>
                </span>
              </span>
              <span *ngIf="room()?.distanceKm" class="inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-white/70">
                <span aria-hidden="true">🏫</span>
                <span>{{ campusMinutesLabel() }}</span>
              </span>
              <button class="btn-secondary px-3 py-1.5" (click)="share()">Share</button>
              <button class="btn-secondary px-3 py-1.5" (click)="toggleSave()">{{ saved() ? 'Saved' : 'Save' }}</button>
            </div>
          </div>

          <!-- Roommates -->
          <div *ngIf="roommates().length" id="roommates" class="space-y-3">
            <h2 class="text-xl font-semibold">Roommates</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div *ngFor="let u of roommates()" class="rounded-xl border bg-white/70 p-4 flex items-center gap-3">
                <img [src]="u.avatarUrl" class="w-11 h-11 rounded-full object-cover border" [alt]="u.name" loading="lazy" />
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <div class="font-semibold text-sm truncate">{{ u.name }}</div>
                    <span *ngIf="isOnline(u.lastSeen)" class="inline-flex items-center gap-1 text-xs text-emerald-700">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Online
                    </span>
                  </div>
                  <div class="text-xs text-gray-600 truncate">{{ u.tagline || u.organization || u.location }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Memories -->
          <div *ngIf="memories().length" class="space-y-3">
            <h2 class="text-xl font-semibold">Memories</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div *ngFor="let m of memories()" class="rounded-2xl border overflow-hidden bg-white/70">
                <div class="h-36 bg-gray-100">
                  <img [src]="m.photo" class="w-full h-full object-cover" [alt]="m.title" loading="lazy" />
                </div>
                <div class="p-4 space-y-1">
                  <div class="font-semibold text-sm">{{ m.title }}</div>
                  <div class="text-xs text-gray-600">{{ m.story }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- About -->
          <div *ngIf="aboutText().length" class="space-y-2">
            <h2 class="text-xl font-semibold">About this space</h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ aboutExpanded() ? aboutText() : (aboutText().length > 220 ? (aboutText() | slice:0:220) + '…' : aboutText()) }}</p>
            <button *ngIf="aboutText().length > 220" class="text-sm font-medium underline" (click)="toggleExpandAbout()">{{ aboutExpanded() ? 'Show less' : 'Show more' }}</button>
          </div>

          <!-- Amenities (chips + sheet) -->
          <div id="amenities" *ngIf="roomAmenities().length" class="space-y-3">
            <h2 class="text-xl font-semibold">Amenities</h2>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let a of roomAmenities() | slice:0:5" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70 text-xs text-gray-800">
                <span class="w-4 text-center" aria-hidden="true">{{ iconFor(a) || '•' }}</span>
                <span>{{ a }}</span>
              </span>
              <button *ngIf="roomAmenities().length > 5" class="btn-secondary text-xs px-3 py-1.5" (click)="showAllAmenities.set(true)">
                Show all amenities
              </button>
            </div>
          </div>

          <!-- Reviews section removed -->

          <!-- Location -->
          <div id="location" class="space-y-3">
            <h2 class="text-xl font-semibold">Location</h2>
            <div class="rounded-2xl overflow-hidden border bg-gray-100 h-52">
              <ng-container *ngIf="mapUrl; else mapFallback">
                <iframe [src]="mapUrl" width="100%" height="100%" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" aria-label="Google map showing listing location"></iframe>
              </ng-container>
              <ng-template #mapFallback>
                <div class="h-full w-full flex items-center justify-center text-gray-500">Map unavailable</div>
              </ng-template>
            </div>

            <div class="flex flex-wrap gap-2 text-xs min-h-[34px]">
              <ng-container *ngIf="!loadingNearby(); else nearbyLoading">
                <span *ngFor="let chip of locationChips()" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70" [attr.aria-label]="chip.label">
                  <span>{{ chip.emoji }}</span><span>{{ chip.label }}</span>
                </span>
              </ng-container>
              <ng-template #nearbyLoading>
                <span *ngFor="let i of [1,2,3,4]" class="inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-white/50 animate-pulse">
                  <span class="w-4 h-3 bg-gray-200 rounded"></span>
                  <span class="w-16 h-3 bg-gray-200 rounded"></span>
                </span>
              </ng-template>
            </div>
          </div>

          <!-- Host -->
          <div id="host" class="border rounded-2xl p-6 space-y-4">
            <ng-container *ngIf="!loadingHost(); else hostLoading">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-4 min-w-0">
                  <div class="relative">
                    <img [src]="hostAvatar()" class="w-16 h-16 rounded-full object-cover border" alt="Host avatar" />
                    <span *ngIf="isOnline(hostLastSeen())" class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" aria-label="Host online"></span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="text-lg font-semibold truncate">{{ hostName() }}</h3>
                      <span *ngIf="hostIsSuperhost()" class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white/70">
                        <span aria-hidden="true">⭐</span>
                        Superhost
                      </span>
                      <span *ngIf="hostVerifiedCount()" class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white/70">
                        <span aria-hidden="true">✅</span>
                        Verified
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">
                      <span *ngIf="hostJoinedYear()">Joined {{ hostJoinedYear() }}</span>
                      <span *ngIf="hostJoinedYear() && hostOrganization()"> · </span>
                      <span *ngIf="hostOrganization()">{{ hostOrganization() }}</span>
                    </p>
                    <p class="text-xs text-gray-500" *ngIf="hostLanguages().length">Languages: {{ hostLanguages().join(', ') }}</p>
                  </div>
                </div>
                <button class="btn-secondary shrink-0" (click)="openChat()">Message Host</button>
              </div>

              <div *ngIf="hostBadges().length" class="flex flex-wrap gap-2 text-xs text-gray-700">
                <span *ngFor="let b of hostBadges()" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
                  <span aria-hidden="true">{{ b.emoji }}</span>
                  <span>{{ b.label }}</span>
                </span>
              </div>
            </ng-container>
            <ng-template #hostLoading>
              <div class="flex items-center gap-4 animate-pulse">
                <div class="w-16 h-16 rounded-full bg-gray-200"></div>
                <div class="space-y-2">
                  <div class="h-4 w-40 bg-gray-200 rounded"></div>
                  <div class="h-3 w-56 bg-gray-200 rounded"></div>
                </div>
              </div>
            </ng-template>
          </div>

          <!-- Things to know (accordion) -->
          <div id="things" class="space-y-4">
            <h2 class="text-xl font-semibold">Things to know</h2>

            <div class="rounded-2xl border overflow-hidden">
              <button class="w-full px-5 py-4 flex items-center justify-between text-left" (click)="toggleAccordion('rules')">
                <span class="flex items-center gap-2 font-semibold"><span aria-hidden="true">🏠</span>House rules</span>
                <span class="text-gray-500">{{ accordionOpen()==='rules' ? '−' : '+' }}</span>
              </button>
              <div *ngIf="accordionOpen()==='rules'" class="px-5 pb-5 text-sm text-gray-700">
                <ul class="space-y-2">
                  <li *ngFor="let r of houseRules()">{{ r }}</li>
                </ul>
              </div>
            </div>

            <div class="rounded-2xl border overflow-hidden">
              <button class="w-full px-5 py-4 flex items-center justify-between text-left" (click)="toggleAccordion('safety')">
                <span class="flex items-center gap-2 font-semibold"><span aria-hidden="true">🛡️</span>Safety & property</span>
                <span class="text-gray-500">{{ accordionOpen()==='safety' ? '−' : '+' }}</span>
              </button>
              <div *ngIf="accordionOpen()==='safety'" class="px-5 pb-5 text-sm text-gray-700">
                <ul class="space-y-2">
                  <li *ngFor="let s of safetyItems()">{{ s }}</li>
                </ul>
              </div>
            </div>

            <div class="rounded-2xl border overflow-hidden">
              <button class="w-full px-5 py-4 flex items-center justify-between text-left" (click)="toggleAccordion('cancel')">
                <span class="flex items-center gap-2 font-semibold"><span aria-hidden="true">📌</span>Cancellation</span>
                <span class="text-gray-500">{{ accordionOpen()==='cancel' ? '−' : '+' }}</span>
              </button>
              <div *ngIf="accordionOpen()==='cancel'" class="px-5 pb-5 text-sm text-gray-700">
                <ul class="space-y-2">
                  <li *ngFor="let c of cancellationItems()">{{ c }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column pricing panel -->
        <div class="lg:col-span-5 relative">
          <div class="sticky top-24">
            <div class="border rounded-2xl shadow-sm p-6 space-y-4">
              <div class="space-y-1">
                <div class="text-2xl font-semibold">&#36;{{ room()?.price }}<span class="text-sm font-normal text-gray-600"> / month</span></div>
                <div class="text-sm text-gray-600" *ngIf="room()?.deposit">Refundable deposit: &#36;{{ room()?.deposit }}</div>
              </div>

              <div class="rounded-xl border bg-white/60 p-4 text-sm text-gray-700 space-y-2" *ngIf="pricingDetails().length">
                <div *ngFor="let d of pricingDetails()" class="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{{ d }}</span>
                </div>
              </div>

              <button class="btn-primary w-full py-3 rounded-lg" (click)="openChat()">Message Host to Apply</button>
              <div class="text-xs text-gray-500 text-center">Communicate and pay through Setly</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Full Gallery Modal / Carousel -->
    <div *ngIf="showGallery()" class="fixed inset-0 bg-black/90 z-50">
      <div class="absolute inset-0 flex flex-col">
        <div class="flex items-center justify-between px-4 sm:px-6 py-4">
          <h2 class="text-white text-sm sm:text-base">Photo {{ (mainImageIndex()+1) }} / {{ room()?.photos?.length || 0 }}</h2>
          <button (click)="closeGallery()" class="text-white/80 hover:text-white text-2xl leading-none" aria-label="Close gallery">×</button>
        </div>
        <div class="flex-1 relative select-none">
          <!-- Prev arrow -->
          <button *ngIf="(room()?.photos?.length || 0) > 1" (click)="prev()" aria-label="Previous photo" class="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center bg-white/10 hover:bg-white/20 text-white">‹</button>
          <!-- Next arrow -->
          <button *ngIf="(room()?.photos?.length || 0) > 1" (click)="next()" aria-label="Next photo" class="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center bg-white/10 hover:bg-white/20 text-white">›</button>

          <!-- Main image area -->
          <div class="h-full w-full flex items-center justify-center px-3 sm:px-6">
            <img
              [src]="currentPhoto()"
              class="max-h-[70vh] sm:max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
              [alt]="room()?.title || 'Listing photo'"
              (pointerdown)="startDrag($event)"
              (pointermove)="onDrag($event)"
              (pointerup)="endDrag()"
              (click)="maybeNextFromClick()"
            />
          </div>
        </div>

        <!-- Thumb rail -->
        <div *ngIf="(room()?.photos?.length || 0) > 1" class="px-3 sm:px-6 pb-4">
          <div class="flex gap-2 overflow-x-auto scrollbar-thin">
            <button *ngFor="let p of room()?.photos; let i=index"
              (click)="setMainImage(i)"
              class="relative shrink-0 rounded-lg overflow-hidden border"
              [class.border-white]="i===mainImageIndex()" [class.border-transparent]="i!==mainImageIndex()">
              <img [src]="p" [alt]="'Thumbnail ' + (i+1)" class="h-16 w-24 object-cover" loading="lazy" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Expanded Amenities Sheet -->
    <div *ngIf="showAllAmenities()" class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" (click)="showAllAmenities.set(false)">
      <div class="bg-white rounded-t-2xl w-full max-w-2xl max-h-[80vh] overflow-auto p-6 space-y-4" (click)="$event.stopPropagation()">
        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto -mt-2"></div>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">All amenities</h3>
          <button (click)="showAllAmenities.set(false)" class="text-gray-500 hover:text-gray-700" aria-label="Close">✕</button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div *ngFor="let a of roomAmenities()" class="flex items-center gap-2 text-gray-700">
            <span class="w-5 text-center" aria-hidden="true">{{ iconFor(a) || '•' }}</span>
            <span>{{ a }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Removed legacy hero and duplicate sections to avoid duplication with new Airbnb-like layout -->

  </main>
  `
})
export class ListingDetailPage {
  private roomCards = inject(RoomStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private analytics = inject(AnalyticsService);
  private roomsService = inject(RoomsService);
  private sanitizer = inject(DomSanitizer);
  private usersService = inject(UsersService);
  private authStore = inject(AuthStore);
  private nearbyService = inject(NearbyService);
  private dummyPeople = inject(DummyPeopleService);

  room = signal<Room | null>(null);
  mainImageIndex = signal(0);
  parallaxY = signal(0);
  fading = signal(false);
  private dragging = false;
  private startX = 0;
  // New UI state signals
  saved = signal(false);
  aboutExpanded = signal(false);
  showAllAmenities = signal(false);
  showGallery = signal(false);
  activeAnchor = signal('photos');
  mapUrl: SafeResourceUrl | null = null;
  hostInfo = signal<{
    id?: string;
    name: string;
    avatarUrl?: string;
    joinedYear?: number;
    lastSeen?: string;
    badges?: { email: boolean; phone: boolean; university: boolean; photo: boolean };
    languages?: string[];
    organization?: string;
    isSuperhost?: boolean;
  } | null>(null);
  loadingHost = signal(true);
  nearbyChips = signal<NearbyChip[]>([]);
  loadingNearby = signal(true);
  accordionOpen = signal<'rules' | 'safety' | 'cancel' | null>(null);

  constructor() {
    const id = this.route.snapshot.params['id'];
    this.loadRoom(id);
    setTimeout(() => this.analytics.trackEvent('room_viewed', { id }), 0);
  }

  private loadRoom(id: string): void {
    // 1) Try to load from RoomsService (full Room objects persisted by create())
    const maybe = this.roomsService.getRoomById(id);
    maybe.subscribe(found => {
      if (found) {
        // Ensure photos array is present for gallery
        const withPhotos: Room = {
          ...found,
          coords: found.coords || ((found as any).lat && (found as any).lon ? { lat: (found as any).lat, lng: (found as any).lon } : undefined),
          photos: found.photos && found.photos.length ? found.photos : (found.image ? [found.image] : ['/assets/placeholder-room.jpg'])
        };
  this.room.set(withPhotos);
  this.mapUrl = this.buildMapUrl(withPhotos);
  this.loadHost(withPhotos.hostId);
  this.loadNearby(withPhotos);
        return;
      }

      // 2) Fallback: map from RoomCard in RoomStore (Browse) if present
      const cards = this.roomCards.rooms();
      const card = cards.find(c => c.id === id);
      if (card) {
        const inferredRoomType = this.inferRoomTypeFromFeatures(card.features);
        const hostId = this.inferHostIdFromCard(card);
        const mapped: Room = {
          id: card.id,
          title: card.title,
          description: undefined,
          price: card.price,
          city: card.address.split(',')[1]?.trim() || '—',
          state: card.address.split(',')[2]?.trim() || '',
          roomType: inferredRoomType,
          bath: 'shared',
          furnished: true,
          rules: { vegetarian: false, smoking: false, petsOk: false },
          photos: card.image ? [card.image] : ['/assets/placeholder-room.jpg'],
          hostId,
          createdAt: new Date().toISOString(),
          image: card.image,
          isAvailable: card.isAvailable,
          address: card.address,
          features: card.features,
          amenities: Array.isArray(card.features) ? card.features : undefined,
          distance: card.distance
        };
  this.room.set(mapped);
  this.mapUrl = this.buildMapUrl(mapped);
  this.loadHost(mapped.hostId);
  this.loadNearby(mapped);
        return;
      }

      // 3) Not found — show a lightweight message and provide a back option
      this.toast.error('Listing not found');
      this.room.set(null);
    });
  }

  private buildMapUrl(r: Room): SafeResourceUrl | null {
    try {
      if (r?.coords?.lat && r?.coords?.lng) {
        const q = `${r.coords.lat},${r.coords.lng}`;
        const url = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
      const label = r?.address || [r?.city, r?.state].filter(Boolean).join(', ');
      if (!label) return null;
      const url = `https://www.google.com/maps?q=${encodeURIComponent(label)}&z=14&output=embed`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } catch {
      return null;
    }
  }

  goBack(): void {
    this.router.navigate(['/browse']);
  }

  setMainImage(index: number): void {
    this.fading.set(true);
    window.setTimeout(() => {
      this.mainImageIndex.set(index);
      // Preload next image
      const r = this.room();
      const nextIdx = r?.photos?.length ? (index + 1) % r.photos.length : -1;
      if (nextIdx >= 0) { const img = new Image(); img.src = r!.photos[nextIdx]; }
      window.setTimeout(() => this.fading.set(false), 180);
    }, 120);
  }

  currentPhoto(): string {
    const r = this.room();
    return r?.photos?.[this.mainImageIndex()] || r?.image || '/assets/placeholder-room.jpg';
  }

  prev() { const r = this.room(); if (!r?.photos?.length) return; const i = this.mainImageIndex(); this.setMainImage((i - 1 + r.photos.length) % r.photos.length); this.analytics.trackEvent('gallery_interacted', { action: 'prev' }); }
  next() { const r = this.room(); if (!r?.photos?.length) return; const i = this.mainImageIndex(); this.setMainImage((i + 1) % r.photos.length); this.analytics.trackEvent('gallery_interacted', { action: 'next' }); }

  private loadHost(hostId: string | undefined) {
    if (!hostId) { this.hostInfo.set(null); return; }
    this.loadingHost.set(true);

    // Prefer dummy user data when available (used for roommates/memories consistency in local demos)
    const dummy = this.dummyPeople.getAllUsers().find(u => u.id === hostId);
    if (dummy) {
      this.hostInfo.set(this.mapDummyToHostInfo(dummy));
      this.loadingHost.set(false);
      return;
    }

    // Fallback to backend host profile (real host)
    this.usersService.getUserById(hostId).subscribe({
      next: (profile) => {
        if (profile) this.hostInfo.set({ id: hostId, ...profile });
        else this.hostInfo.set({ id: hostId, name: 'Host', avatarUrl: '/assets/placeholder-avatar.jpg' });
        this.loadingHost.set(false);
      },
      error: () => {
        const fallback = this.inferFallbackHostFromRoom();
        this.hostInfo.set(fallback || { id: hostId, name: 'Host', avatarUrl: '/assets/placeholder-avatar.jpg' });
        this.loadingHost.set(false);
      }
    });
  }
  private loadNearby(r: Room) {
    this.loadingNearby.set(true);
    this.nearbyService.getChips({ city: r.city, state: r.state, lat: r.coords?.lat, lng: r.coords?.lng }).subscribe({
      next: chips => { this.nearbyChips.set(chips); this.loadingNearby.set(false); },
      error: () => { this.nearbyChips.set([]); this.loadingNearby.set(false); }
    });
  }
  hostName() { return this.hostInfo()?.name || 'Host'; }
  hostAvatar() { return this.hostInfo()?.avatarUrl || '/assets/placeholder-avatar.jpg'; }
  hostJoinedYear() { return this.hostInfo()?.joinedYear; }
  hostLastSeen() { return this.hostInfo()?.lastSeen; }
  hostOrganization() { return this.hostInfo()?.organization; }
  hostLanguages() { return Array.isArray(this.hostInfo()?.languages) ? (this.hostInfo()?.languages as string[]) : []; }
  hostIsSuperhost() { return !!this.hostInfo()?.isSuperhost; }
  hostVerifiedCount(): number {
    const b = this.hostInfo()?.badges;
    if (!b) return 0;
    return Object.values(b).filter(Boolean).length;
  }
  hostBadges(): Array<{ emoji: string; label: string }> {
    const b = this.hostInfo()?.badges;
    if (!b) return [];
    const out: Array<{ emoji: string; label: string }> = [];
    if (b.email) out.push({ emoji: '📧', label: 'Email verified' });
    if (b.phone) out.push({ emoji: '📱', label: 'Phone verified' });
    if (b.university) out.push({ emoji: '🎓', label: 'University verified' });
    if (b.photo) out.push({ emoji: '🖼️', label: 'Photo verified' });
    return out;
  }

  openChat() {
    const r = this.room();
    if (!r) return;
    const hostId = this.hostInfo()?.id || r.hostId;
    if (!hostId) return;

    const hostFirst = (this.hostName() || 'Host').split(' ')[0];
    const prefill = `Hi ${hostFirst}! I'm interested in your ${this.displayTitle().toLowerCase()}. Is it still available?`;

    this.analytics.trackEvent('host_contact_clicked', { listingId: r.id, hostId });
    this.router.navigate(['/messages'], {
      queryParams: {
        with: hostId,
        market: r.id,
        name: this.hostName(),
        avatar: this.hostAvatar(),
        text: prefill,
      }
    });
  }
  share() { try { const url = window.location.href; navigator?.clipboard?.writeText(url); this.toast.success('Link copied'); } catch { this.toast.error('Share not supported'); } }
  toggleSave() { this.saved.set(!this.saved()); }
  roomAmenities(): string[] {
    const r = this.room();
    if (!r) return [];
    if (Array.isArray(r.amenities) && r.amenities.length) return r.amenities;
    // Fallback derivation
    const derived: string[] = [];
    if (r.furnished) derived.push('Furnished');
    if (r.rules?.smoking === false) derived.push('No Smoking');
    if (r.rules?.petsOk) derived.push('Pets Allowed');
    if (r.roomType === 'private') derived.push('Private Room');
    if (r.roomType === 'shared') derived.push('Shared Room');
    if (r.roomType === 'entire') derived.push('Entire Apartment');
    return derived;
  }
  private amenityIconMap: Record<string,string> = {
    // Cleaner icon set
    'Electricity':'⚡', 'Power':'⚡',
    'Wi‑Fi':'🌐','Wi-Fi':'🌐','Wifi':'🌐','WiFi':'🌐',
    'Water':'💧',
    'Laundry':'🧺',
    'Study Desk':'🪑','Study Room':'📚',
    'Parking':'🅿️',
    'Air Conditioning':'❄️','AC':'❄️','Cooling':'❄️',
    'Heating':'🔥',
    'Bed':'🛏️',
    'Gym':'🏋️',
    'Common Lounge':'🛋️',
    // Existing
    'Kitchen':'🍳','Furnished':'🛋️','Private Bath':'🚿','Pets Allowed':'🐾','No Smoking':'🚭','Private Room':'🔒'
  };
  iconFor(a: string): string | undefined { return this.amenityIconMap[a] || this.amenityIconMap[a.trim()] || undefined; }
  toggleExpandAbout() { this.aboutExpanded.set(!this.aboutExpanded()); }
  openGallery() { this.showGallery.set(true); }
  closeGallery() { this.showGallery.set(false); }
  openGalleryAt(index: number) { this.setMainImage(index); this.openGallery(); }

  aboutText(): string {
    return (this.room()?.description || '').trim();
  }

  displayTitle(): string {
    const r = this.room();
    if (!r) return '';
    const prefix = r.roomType === 'private'
      ? 'Private Room'
      : r.roomType === 'shared'
        ? 'Shared Room'
        : 'Entire Apartment';
    const uni = this.universityLabel();
    const city = (r.city || '').trim();
    const suffix = uni ? `Near ${uni}` : (city ? `in ${city}` : '');
    return [prefix, suffix].filter(Boolean).join(' ');
  }

  campusMinutesLabel(): string {
    const r = this.room();
    const km = typeof r?.distanceKm === 'number' ? r!.distanceKm : undefined;
    if (!km || km <= 0) return 'Near campus';
    const mins = Math.max(3, Math.round((km / 5) * 60)); // 5 km/h walking heuristic
    return `${mins} mins to campus`;
  }

  locationChips(): NearbyChip[] {
    const r = this.room();
    const chips: NearbyChip[] = [];
    if (r?.distanceKm) chips.push({ emoji: '🏫', label: this.campusMinutesLabel() });
    const base = this.nearbyChips().slice(0, 6);
    for (const c of base) {
      if (chips.length >= 6) break;
      if (chips.some(x => x.label === c.label)) continue;
      chips.push(c);
    }
    return chips.slice(0, 6);
  }

  roommates(): DummyUser[] {
    const r = this.room();
    if (!r) return [];

    const all = this.dummyPeople.getAllUsers();
    const byId = new Map(all.map(u => [u.id, u] as const));

    const fromIds = Array.isArray(r.roommateIds) ? r.roommateIds : [];
    const resolvedFromIds = fromIds.map(id => byId.get(id)).filter(Boolean) as DummyUser[];
    if (resolvedFromIds.length) return resolvedFromIds.slice(0, 4);

    const source = r.universityId
      ? this.dummyPeople.getUsersByUniversity(r.universityId)
      : (r.city ? this.dummyPeople.getUsersByCity(r.city) : all);
    return source.filter(u => u.id !== r.hostId).slice(0, 4);
  }

  memories(): Array<{ photo: string; title: string; story: string }> {
    const r = this.room();
    if (!r) return [];

    // Prefer persisted per-room memories (from RoomStoreService enrichment)
    if (Array.isArray(r.memories) && r.memories.length) {
      const photos = Array.isArray(r.photos) && r.photos.length ? r.photos : [r.image || '/assets/placeholder-room.jpg'];
      return r.memories
        .slice(0, 4)
        .map((m, idx) => ({
          photo: m.photoUrl || photos[idx % photos.length],
          title: m.title,
          story: m.story,
        }))
        .filter(Boolean);
    }

    const roomies = this.roommates();
    const photos = Array.isArray(r.photos) && r.photos.length ? r.photos : [r.image || '/assets/placeholder-room.jpg'];

    // Always return at least 3 memory cards by cycling roommates when needed.
    const base = roomies.length ? roomies : (this.hostInfo()?.id ? [({ id: this.hostInfo()!.id!, name: this.hostName(), avatarUrl: this.hostAvatar(), interests: [], badges: { email: true, phone: false, university: false, photo: true } } as any as DummyUser)] : []);
    const pool = base.length ? base : this.dummyPeople.getAllUsers().slice(0, 1);

    const cards: Array<{ photo: string; title: string; story: string }> = [];
    for (let i = 0; i < 3; i++) {
      const u = pool[i % pool.length];
      const interest = (u.interests || []).find(Boolean) || (u.mutualInterests || []).find(Boolean) || 'Campus life';
      const firstName = (u.name || 'Someone').split(' ')[0];
      const city = (r.city || '').trim();
      const title = city ? `${interest} in ${city}` : `${interest} nearby`;
      const story = `${firstName} shared a highlight around ${String(interest).toLowerCase()} near this neighborhood.`;
      cards.push({ photo: photos[i % photos.length], title, story });
    }
    return cards;
  }

  houseRules(): string[] {
    const r = this.room();
    if (!r) return [];
    const rules: string[] = [];
    rules.push(r.rules?.smoking ? 'Smoking allowed' : 'No smoking');
    rules.push(r.rules?.petsOk ? 'Pets allowed' : 'No pets');
    if (r.rules?.vegetarian) rules.push('Vegetarian-friendly');
    return rules;
  }

  safetyItems(): string[] {
    const out: string[] = [];
    const b = this.hostInfo()?.badges;
    if (b?.email) out.push('Email verified');
    if (b?.phone) out.push('Phone verified');
    if (b?.university) out.push('University verified');
    if (b?.photo) out.push('Profile photo verified');
    if (this.room()?.studentVerified) out.push('Student verified');
    return out;
  }

  cancellationItems(): string[] {
    const r = this.room();
    if (!r) return [];
    const out: string[] = [];
    if (r.minStayDays) out.push(`Minimum stay: ${r.minStayDays} day${r.minStayDays === 1 ? '' : 's'}`);
    if (r.availabilityStart) out.push(`Available from: ${new Date(r.availabilityStart).toLocaleDateString()}`);
    if (r.availabilityEnd) out.push(`Available until: ${new Date(r.availabilityEnd).toLocaleDateString()}`);
    return out;
  }

  pricingDetails(): string[] {
    const r = this.room();
    if (!r) return [];
    const out: string[] = [];
    if (r.roomType) out.push(r.roomType === 'entire' ? 'Entire apartment' : (r.roomType === 'private' ? 'Private room' : 'Shared room'));
    if (r.bath) out.push(r.bath === 'private' ? 'Private bath' : 'Shared bath');
    if (r.furnished) out.push('Furnished');
    const topAmenities = this.roomAmenities().slice(0, 4);
    if (topAmenities.length) out.push(`Includes: ${topAmenities.join(', ')}`);
    return out;
  }

  toggleAccordion(key: 'rules' | 'safety' | 'cancel') {
    this.accordionOpen.set(this.accordionOpen() === key ? null : key);
  }

  isOnline(lastSeen?: string): boolean {
    if (!lastSeen) return false;
    const last = new Date(lastSeen).getTime();
    if (isNaN(last)) return false;
    return (Date.now() - last) / (1000 * 60) <= 5;
  }

  private universityLabel(): string {
    const r = this.room();
    const id = (r?.universityId || '').trim();
    if (!id) return '';
    const match = this.dummyPeople.getUsersByUniversity(id)[0];
    if (match?.organization) return match.organization;
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
  }

  private mapDummyToHostInfo(u: DummyUser) {
    return {
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      joinedYear: this.deriveJoinedYear(u.id),
      lastSeen: u.lastSeen,
      badges: this.normalizeBadges(u.badges),
      languages: Array.isArray(u.languages) && u.languages.length ? u.languages : ['English'],
      organization: u.organization,
      isSuperhost: !!u.isGuide || !!u.isSenior,
    };
  }

  private normalizeBadges(badges: any): { email: boolean; phone: boolean; university: boolean; photo: boolean } {
    return {
      email: !!badges?.email,
      phone: !!badges?.phone,
      university: !!badges?.university,
      photo: !!badges?.photo,
    };
  }

  private deriveJoinedYear(id: string): number {
    const digits = Number(String(id).replace(/\D/g, ''));
    const base = 2018;
    const span = Math.max(1, new Date().getFullYear() - base);
    return base + (isNaN(digits) ? 0 : (digits % span));
  }

  private inferFallbackHostFromRoom() {
    const r = this.room();
    if (!r) return null;
    const pool = r.universityId
      ? this.dummyPeople.getUsersByUniversity(r.universityId)
      : (r.city ? this.dummyPeople.getUsersByCity(r.city) : this.dummyPeople.getAllUsers());
    const pick = pool[0];
    return pick ? this.mapDummyToHostInfo(pick) : null;
  }

  maybeNextFromClick() {
    const r = this.room();
    if (!r?.photos || r.photos.length <= 1) return;
    this.next();
  }

  private inferRoomTypeFromFeatures(features: unknown): Room['roomType'] {
    const f = Array.isArray(features) ? features.map(x => String(x).toLowerCase()) : [];
    if (f.some(x => x.includes('entire'))) return 'entire';
    if (f.some(x => x.includes('shared'))) return 'shared';
    return 'private';
  }

  private inferHostIdFromCard(card: any): string {
    const rCity = typeof card?.address === 'string' ? card.address.split(',')[1]?.trim() : '';
    const pool = rCity ? this.dummyPeople.getUsersByCity(rCity) : this.dummyPeople.getAllUsers();
    return pool[0]?.id || 'unknown';
  }

  scrollTo(id: string) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  @HostListener('window:scroll', [])
  onScroll() {
    const y = window.scrollY || 0;
    this.parallaxY.set(Math.min(30, y * 0.06));
    // Active anchor detection
    const sections = ['photos','overview','amenities','location','host','things'];
    let current = 'photos';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.offsetTop;
      if (y + 140 >= top) { // 140 accounts for sticky nav height & margin
        current = id;
      }
    }
    if (this.activeAnchor() !== current) this.activeAnchor.set(current);
  }

  @HostListener('document:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (this.showGallery()) this.showGallery.set(false);
      if (this.showAllAmenities()) this.showAllAmenities.set(false);
    } else if (this.showGallery() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
      e.preventDefault();
    }
  }

  startDrag(ev: PointerEvent) { this.dragging = true; this.startX = ev.clientX; }
  onDrag(ev: PointerEvent) { if (!this.dragging) return; const dx = ev.clientX - this.startX; if (Math.abs(dx) > 36) { this.dragging = false; dx > 0 ? this.prev() : this.next(); } }
  endDrag() { this.dragging = false; }


  onCarouselScroll(ev: Event) {
    const el = ev.target as HTMLElement | null;
    if (!el) return;
    const width = (el as any).clientWidth || 0;
    if (!width) return;
    const idx = Math.round(((el as any).scrollLeft || 0) / width);
    const r = this.room();
    if (!r?.photos?.length) return;
    const bounded = Math.max(0, Math.min(r.photos.length - 1, idx));
    if (this.mainImageIndex() !== bounded) this.mainImageIndex.set(bounded);
  }
}
