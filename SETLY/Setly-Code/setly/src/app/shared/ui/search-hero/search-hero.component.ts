import { Component, DestroyRef, Input, OnInit, Output, EventEmitter, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { UniversityService } from '../../../core/services/university.service';
import { RoomStoreService } from '../../../core/services/room-store.service';
import { DatePickerComponent } from '../date-picker/date-picker.component';

interface SearchParams {
  query?: string;
  city?: string;
  roomType?: 'shared' | 'Private';
  checkIn?: string;
  checkOut?: string;
  studentVerifiedOnly?: boolean;
}

@Component({
  selector: 'app-search-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule, DatePickerComponent],
  template: `
    <section class="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-xl bg-white shadow-lg p-6 sm:p-8">
          <div class="space-y-4">
            <!-- Search Input with Autocomplete -->
            <div class="relative">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchInput($event)"
                placeholder="Search universities or cities..."
                class="w-full rounded-xl border-gray-300 py-3 pl-4 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                [attr.aria-label]="'Search universities or cities'"
                [attr.aria-expanded]="showSuggestions()"
                [attr.aria-activedescendant]="activeSuggestionId()"
                (keydown)="onSearchKeydown($event)"
                role="combobox"
              />
              <!-- Autocomplete Dropdown -->
              <div
                *ngIf="showSuggestions() && suggestions().length > 0"
                class="absolute left-0 right-0 top-full mt-1 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                role="listbox"
              >
                <div
                  *ngFor="let suggestion of suggestions(); let i = index"
                  [class]="'px-4 py-2 cursor-pointer hover:bg-gray-100 ' + (i === activeSuggestionIndex() ? 'bg-gray-100' : '')"
                  role="option"
                  [id]="'suggestion-' + i"
                  [attr.aria-selected]="i === activeSuggestionIndex()"
                  (click)="selectSuggestion(suggestion)"
                >
                  {{ suggestion.name }}
                </div>
              </div>
            </div>

            <!-- Date Range Picker -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="relative">
                <app-date-picker
                  [selected]="checkInDate()"
                  (dateChange)="onCheckInChange($event)"
                  placeholder="Select date"
                  label="Check-in"
                  [minDate]="today"
                  [maxDate]="checkOutDate() || undefined"
                  [error]="checkInError()"
                ></app-date-picker>
              </div>
              <div class="relative">
                <app-date-picker
                  [selected]="checkOutDate()"
                  (dateChange)="onCheckOutChange($event)"
                  placeholder="Select date"
                  label="Check-out"
                  [minDate]="checkInDate() || today"
                  [error]="checkOutError()"
                ></app-date-picker>
              </div>
            </div>

            <!-- Room Type Toggle -->
            <div class="flex gap-2">
              <button
                type="button"
                (click)="setRoomType('shared')"
                [class]="'px-4 py-2 rounded-xl border ' + (roomType() === 'shared' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:border-blue-500')"
                [attr.aria-pressed]="roomType() === 'shared'"
              >
                shared
              </button>
              <button
                type="button"
                (click)="setRoomType('Private')"
                [class]="'px-4 py-2 rounded-xl border ' + (roomType() === 'Private' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:border-blue-500')"
                [attr.aria-pressed]="roomType() === 'Private'"
              >
                Private
              </button>
            </div>

            <!-- Student Verification Checkbox -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="student-verified"
                  [ngModel]="studentVerifiedOnly()"
                  (ngModelChange)="setStudentVerifiedOnly($event)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label for="student-verified" class="text-sm font-medium text-gray-700">
                  Student-verified rooms only
                </label>
              </div>
              <p class="text-xs text-gray-500">All listings are verified by current students</p>
            </div>

            <!-- Search Button -->
            <button
              type="button"
              (click)="onSearch()"
              class="w-full rounded-xl bg-blue-500 px-4 py-3 text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Search for rooms"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class SearchHeroComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private universityService = inject(UniversityService);
  private roomStore = inject(RoomStoreService);
  private destroyRef = inject(DestroyRef);
  private overlay = inject(Overlay);

  // Initial values from URL parameters
  @Input() initialQuery: string = '';
  @Input() initialCity: string = '';
  @Input() initialRoomType: 'shared' | 'Private' | '' = '';
  @Input() initialCheckIn: string | null = null;
  @Input() initialCheckOut: string | null = null;
  @Input() initialStudentVerifiedOnly: boolean = false;

  @Output() searchChange = new EventEmitter<SearchParams>();

  ngOnInit() {
    // Initialize state from inputs
    this.searchQuery.set(this.initialQuery);
    this.city.set(this.initialCity);
    if (this.initialRoomType) {
      this.roomType.set(this.initialRoomType);
    }
    if (this.initialCheckIn) {
      this.checkInDate.set(new Date(this.initialCheckIn));
    }
    if (this.initialCheckOut) {
      this.checkOutDate.set(new Date(this.initialCheckOut));
    }
    this.studentVerifiedOnly.set(this.initialStudentVerifiedOnly);

    // Set initial filters in store
    this.roomStore.setFilters({
      city: this.initialCity,
      roomType: this.initialRoomType,
      checkIn: this.initialCheckIn || undefined,
      checkOut: this.initialCheckOut || undefined,
      studentVerifiedOnly: this.initialStudentVerifiedOnly
    });
  }

  // Search state
  searchQuery = signal('');
  suggestions = signal<Array<{id: string; name: string; type: 'university' | 'city'}>>([]);
  showSuggestions = signal(false);
  activeSuggestionIndex = signal(-1);
  activeSuggestionId = signal('');

  // Date state
  today = new Date();
  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  checkInError = signal('');
  checkOutError = signal('');

  // Filters
  roomType = signal<'shared' | 'Private'>('shared');
  studentVerifiedOnly = signal(false);
  city = signal('');

  constructor() {
    // Setup search debounce
    this.setupSearchDebounce();
  }

  private setupSearchDebounce() {
    effect(() => {
      const query = this.searchQuery();
      if (query.length >= 2) {
        this.loadSuggestions(query);
      } else {
        this.suggestions.set([]);
        this.showSuggestions.set(false);
      }
    });
  }

  private async loadSuggestions(query: string) {
    if (query.length < 2) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }

    try {
      const results = await this.universityService.search(query);
      const suggestions = results.map(result => ({
        id: result.id,
        name: result.name,
        type: 'university' as const
      }));
      this.suggestions.set(suggestions);
      this.showSuggestions.set(true);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    }
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.activeSuggestionIndex.set(-1);
  }

  onSearchKeydown(event: KeyboardEvent) {
    const suggestions = this.suggestions();
    const currentIndex = this.activeSuggestionIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeSuggestionIndex.set(
          currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0
        );
        this.updateActiveSuggestionId();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.activeSuggestionIndex.set(
          currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1
        );
        this.updateActiveSuggestionId();
        break;

      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0) {
          this.selectSuggestion(suggestions[currentIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.showSuggestions.set(false);
        break;
    }
  }

  private updateActiveSuggestionId() {
    const index = this.activeSuggestionIndex();
    this.activeSuggestionId.set(index >= 0 ? `suggestion-${index}` : '');
  }

  selectSuggestion(suggestion: { id: string; name: string; type: 'university' | 'city' }) {
    this.searchQuery.set(suggestion.name);
    this.showSuggestions.set(false);
    // No longer setting per-store filters here; unified text search used on browse page.
  }

  setRoomType(type: 'shared' | 'Private') {
    this.roomType.set(type);
  }

  setStudentVerifiedOnly(value: boolean) {
    this.studentVerifiedOnly.set(value);
  }

  onCheckInChange(date: Date | null) {
    this.checkInDate.set(date);
    this.validateDates();
  }

  onCheckOutChange(date: Date | null) {
    this.checkOutDate.set(date);
    this.validateDates();
  }

  private validateDates() {
    const checkIn = this.checkInDate();
    const checkOut = this.checkOutDate();

    this.checkInError.set('');
    this.checkOutError.set('');

    if (checkIn && checkIn < this.today) {
      this.checkInError.set('Check-in date must be today or later');
    }

    if (checkIn && checkOut && checkOut < checkIn) {
      this.checkOutError.set('Check-out must be after check-in');
    }
  }

  onSearch() {
    const query = this.searchQuery();
    const checkIn = this.checkInDate();
    const checkOut = this.checkOutDate();
    const roomType = this.roomType();
    const studentVerifiedOnly = this.studentVerifiedOnly();

    // Update store filters
    this.roomStore.setFilters({
      roomType,
      studentVerifiedOnly,
      checkIn: checkIn?.toISOString(),
      checkOut: checkOut?.toISOString()
    });

    // Update URL query params
    const queryParams = {
      q: query || undefined,
      type: roomType,
      sv: studentVerifiedOnly ? '1' : undefined,
      ci: checkIn?.toISOString().split('T')[0],
      co: checkOut?.toISOString().split('T')[0]
    };

    // Navigate with query params
    // Navigate directly to browse page with unified query params for filtering
    this.router.navigate(['/browse'], { queryParams });
  }
}