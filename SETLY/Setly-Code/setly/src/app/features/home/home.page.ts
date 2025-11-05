import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { RoomStoreService } from '../../core/services/room-store.service';
import { UniversityService, University } from '../../core/services/university.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/messaging.service';
import { Room } from '../../core/models/room.model';
import { CurrencyCompactPipe } from '../../shared/pipes/currency-compact.pipe';
import { SkeletonCardComponent } from '../../shared/ui/skeleton-card.component';
import { ChatWidgetComponent } from '../../features/assistant/chat-widget.component';
import { DatePickerComponent } from '../../shared/ui/date-picker.component';
import { GuestSelectorComponent } from '../../shared/ui/guest-selector.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyCompactPipe,
    SkeletonCardComponent,
    ChatWidgetComponent,
    DatePickerComponent,
    GuestSelectorComponent
  ],
  template: `
    <div class="min-h-[calc(100vh-theme(space.24))] bg-white text-gray-900">
      <!-- Hero Section -->
      <section class="container mx-auto px-4 py-16 md:py-24">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Column -->
          <div class="space-y-8">
            <div>
              <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                Find Your Perfect Room
              </h1>
            <p class="text-gray-600 text-lg md:text-xl max-w-xl">
              Connect with students and find housing.
            </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <button
                (click)="navigateToBrowse()"
                class="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-5 py-2.5 transition"
                aria-label="Find your next room">
                Find your next room
              </button>
              <button
                [routerLink]="'/post-room'"
                class="bg-white border border-gray-300 hover:border-gray-400 text-gray-900 font-medium rounded-lg px-5 py-2.5 transition"
                aria-label="Post a room">
                Post a room
              </button>
            </div>
          </div>

          <!-- Right Column - Search Card -->
          <div class="rounded-2xl bg-white border border-gray-200 p-5 md:p-6 w-full max-w-xl shadow-lg">
            <h2 class="text-xl font-semibold mb-4 text-gray-900">Find rooms near</h2>

            <!-- University Search -->
            <div class="relative mb-4">
              <input
                type="text"
                [(ngModel)]="query"
                (input)="onType($event)"
                (keydown)="onKeyDown($event)"
                (focus)="showSuggestions = true"
                (blur)="onBlur()"
                placeholder="Search universities or cities..."
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search for universities"
                aria-controls="uni-listbox"
                [attr.aria-expanded]="showSuggestions"
                autocomplete="off"
              >
              <button
                (click)="navigateToBrowse()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label="Search">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>

              <!-- Suggestions Dropdown -->
              <div
                *ngIf="showSuggestions && filteredSuggestions().length > 0"
                id="uni-listbox"
                role="listbox"
                class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div
                  *ngFor="let university of filteredSuggestions(); trackBy: trackById; let i = index"
                  (mousedown)="selectSuggestion(university)"
                  (mouseenter)="activeIndex = i"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                  [attr.aria-selected]="activeIndex === i"
                  role="option"
                >
                  <div class="font-medium text-gray-900">{{ university.name }}</div>
                  <div class="text-sm text-gray-600">{{ university.city }}, {{ university.state }}</div>
                </div>
              </div>
            </div>

            <!-- Date Pickers -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <app-date-picker
                  (dateSelected)="onCheckInSelected($event)"
                  class="w-full">
                </app-date-picker>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                <app-date-picker
                  (dateSelected)="onCheckOutSelected($event)"
                  class="w-full">
                </app-date-picker>
              </div>
            </div>

            <!-- Guest Selector -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Guests</label>
              <app-guest-selector
                (guestsChanged)="onGuestsChanged($event)"
                class="w-full">
              </app-guest-selector>
            </div>

            <!-- Student Verification Badge -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium text-blue-900">Student-verified rooms only</span>
              </div>
              <p class="text-xs text-blue-700 mt-1">All listings are verified by current students</p>
            </div>

            <!-- Filter Chips -->
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let chip of chipKeys()"
                (click)="toggleChip(chip.key)"
                class="px-3 py-1.5 rounded-full text-sm border transition"
                [class]="chip.active ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'"
                [attr.aria-pressed]="chip.active"
                [attr.aria-label]="chip.label">
                {{ chip.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Rooms Section -->
      <section class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Featured Rooms</h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing rooms near universities that match your lifestyle.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ng-container *ngIf="loadingFeatured(); else roomsTemplate">
            <app-skeleton-card
              *ngFor="let i of skeletonArray">
            </app-skeleton-card>
          </ng-container>

          <ng-template #roomsTemplate>
            <div
              *ngFor="let room of featuredRooms(); trackBy: trackById"
              (click)="onRoomClick(room)"
              class="rounded-2xl bg-white border border-gray-200 p-5 cursor-pointer hover:border-gray-300 hover:shadow-lg transition group"
            >
              <div class="aspect-video rounded-lg overflow-hidden mb-4">
                <img
                  [src]="room.photos[0] || '/assets/placeholder-room.jpg'"
                  [alt]="room.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                >
              </div>

              <div class="space-y-3">
                <div>
                  <h3 class="font-semibold text-lg text-gray-900">{{ room.title }}</h3>
                  <p class="text-gray-600">{{ room.city }}, {{ room.state }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-2xl font-bold text-blue-600">{{ room.price | currencyCompact }}</span>
                  <span class="text-gray-600">/month</span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                    *ngIf="room.rules.vegetarian"
                    class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Vegetarian
                  </span>
                  <span
                    *ngIf="!room.rules.smoking"
                    class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    No smoking
                  </span>
                  <span
                    *ngIf="room.rules.petsOk"
                    class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    Pets ok
                  </span>
                  <span
                    *ngIf="room.furnished"
                    class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                    Furnished
                  </span>
                  <span
                    *ngIf="room.roomType === 'private'"
                    class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    Private room
                  </span>
                </div>

                <button
                  (click)="onConnectClick(room, $event)"
                  class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 transition"
                  aria-label="Request to connect">
                  Request to connect
                </button>
              </div>
            </div>
          </ng-template>
        </div>
      </section>

      <!-- How it Works Section -->
      <section class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
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
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">What students say</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">A</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Alex Chen</div>
                <div class="text-gray-600 text-sm">Harvard University</div>
              </div>
            </div>
            <p class="text-gray-700 italic">"Found my perfect room within days of arriving in Cambridge. The filters made it so easy to find vegetarian-friendly housing!"</p>
          </div>

          <div class="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">S</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Sarah Johnson</div>
                <div class="text-gray-600 text-sm">Stanford University</div>
              </div>
            </div>
            <p class="text-gray-700 italic">"Setly helped me find pet-friendly housing near campus. My cat and I are both very happy!"</p>
          </div>

          <div class="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span class="text-white font-semibold">M</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Miguel Rodriguez</div>
                <div class="text-gray-600 text-sm">UC Berkeley</div>
              </div>
            </div>
            <p class="text-gray-700 italic">"The furnished rooms option saved me so much time and hassle. Highly recommend for international students!"</p>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
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
      <section class="container mx-auto px-4 py-16">
        <div class="rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-slate-700 p-8 md:p-12 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready for your next move?</h2>
          <p class="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect room near campus.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="navigateToBrowse()"
              class="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 transition"
              aria-label="Find your next room">
              Find your next room
            </button>
            <button
              [routerLink]="'/post-room'"
              class="bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-100 font-medium rounded-lg px-6 py-3 transition"
              aria-label="Post a room">
              Post a room
            </button>
          </div>
        </div>
      </section>

      <!-- Chat Widget -->
      <app-chat-widget></app-chat-widget>
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

  // Signals
  query = signal('');
  showSuggestions = false;
  activeIndex = -1;
  loadingFeatured = signal(true);

  // New search signals
  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  guests = signal({ adults: 1, children: 0 });

  // Chips state
  chips = signal({
    indian: false,
    vegetarian: false,
    noSmoking: false,
    petsOk: false,
    private: false,
    furnished: false
  });

  // Computed
  chipKeys = computed(() => [
    { key: 'indian', label: 'Indian community', active: this.chips().indian },
    { key: 'vegetarian', label: 'Vegetarian', active: this.chips().vegetarian },
    { key: 'noSmoking', label: 'No smoking', active: this.chips().noSmoking },
    { key: 'petsOk', label: 'Pets ok', active: this.chips().petsOk },
    { key: 'private', label: 'Private room', active: this.chips().private },
    { key: 'furnished', label: 'Furnished', active: this.chips().furnished }
  ]);

  filteredSuggestions = computed(() => {
    const q = this.query().trim();
    if (q.length < 2) return [];
    return this.universityService?.search(q) || [];
  });

  featuredRooms = computed(() => {
    return this.roomStore.featuredRooms();
  });

  skeletonArray = Array(6).fill(0);

  ngOnInit(): void {
    // Set page title and meta
    this.title.setTitle('Setly - Find your next room');
    this.meta.updateTag({ name: 'description', content: 'Find rooms near your university with filters that match your life.' });

    // Simulate loading featured rooms
    setTimeout(() => {
      this.loadingFeatured.set(false);
    }, 1000);
  }

  onType(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
    this.showSuggestions = true;
    this.activeIndex = -1;
  }

  onKeyDown(event: KeyboardEvent): void {
    const suggestions = this.filteredSuggestions();
    if (suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectSuggestion(suggestions[this.activeIndex]);
        } else {
          this.navigateToBrowse();
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.activeIndex = -1;
        break;
    }
  }

  onBlur(): void {
    // Delay hiding to allow click events
    setTimeout(() => {
      this.showSuggestions = false;
      this.activeIndex = -1;
    }, 200);
  }

  selectSuggestion(university: University): void {
    this.query.set(university.name);
    this.showSuggestions = false;
    this.navigateToBrowse();
  }

  toggleChip(key: string): void {
    this.chips.update(chips => ({
      ...chips,
      [key]: !chips[key as keyof typeof chips]
    }));
  }

  navigateToBrowse(): void {
    const queryParams: any = {};

    const q = this.query().trim();
    if (q) queryParams.q = q;

    // Date parameters
    const checkIn = this.checkInDate();
    const checkOut = this.checkOutDate();
    if (checkIn) queryParams.checkIn = checkIn.toISOString();
    if (checkOut) queryParams.checkOut = checkOut.toISOString();

    // Guest parameters
    const guestCount = this.guests().adults + this.guests().children;
    if (guestCount > 1) queryParams.guests = guestCount;

    // Student verification (always true for now)
    queryParams.studentVerified = true;

    const activeChips = this.chips();
    if (activeChips.vegetarian) queryParams.vegetarian = true;
    if (activeChips.noSmoking) queryParams.noSmoking = true;
    if (activeChips.petsOk) queryParams.petsOk = true;
    if (activeChips.private) queryParams.roomType = 'private';
    if (activeChips.furnished) queryParams.furnished = true;

    // Analytics stub
    console.log('Hero search:', queryParams);

    this.router.navigate(['/browse'], { queryParams });
  }

  onRoomClick(room: Room): void {
    this.router.navigate(['/browse'], { queryParams: { highlight: room.id } });
  }

  onConnectClick(room: Room, event: Event): void {
    event.stopPropagation();

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

  onCheckInSelected(date: Date): void {
    this.checkInDate.set(date);
    // Clear check-out if it's before check-in
    const checkOut = this.checkOutDate();
    if (checkOut && checkOut <= date) {
      this.checkOutDate.set(null);
    }
  }

  onCheckOutSelected(date: Date): void {
    this.checkOutDate.set(date);
  }

  onGuestsChanged(guests: { adults: number; children: number }): void {
    this.guests.set(guests);
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showSuggestions = false;
      this.activeIndex = -1;
    }
  }
}
