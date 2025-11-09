import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OverlayModule, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { RoomStoreService } from '../../core/services/room-store.service';
import { UniversityService, University } from '../../core/services/university.service';

@Component({
  selector: 'app-search-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-lg w-full max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold mb-4 text-gray-900">Find rooms near</h2>

      <!-- Search Input with Autocomplete -->
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
          aria-label="Search for universities or cities"
          aria-controls="uni-listbox"
          [attr.aria-expanded]="showSuggestions"
          autocomplete="off"
        >
        <button
          (click)="performSearch()"
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
          <input
            type="text"
            [value]="checkInFormatted()"
            (focus)="openDatePicker('checkIn')"
            readonly
            placeholder="Select date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            aria-label="Select check-in date"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
          <input
            type="text"
            [value]="checkOutFormatted()"
            (focus)="openDatePicker('checkOut')"
            readonly
            placeholder="Select date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            aria-label="Select check-out date"
          >
        </div>
      </div>

      <!-- Room Type Toggle -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Room type</label>
        <div class="flex gap-2">
          <button
            (click)="setRoomType('shared')"
            class="px-4 py-2 rounded-lg border transition"
            [class]="roomType() === 'shared' ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'"
            aria-pressed="roomType() === 'shared'"
          >
            shared
          </button>
          <button
            (click)="setRoomType('private')"
            class="px-4 py-2 rounded-lg border transition"
            [class]="roomType() === 'private' ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'"
            aria-pressed="roomType() === 'private'"
          >
            Private
          </button>
        </div>
      </div>

      <!-- Student Verified Checkbox -->
      <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            [(ngModel)]="studentVerifiedOnly"
            class="mr-2"
            aria-label="Student-verified rooms only"
          >
          <span class="text-sm text-gray-700">Student-verified rooms only</span>
        </label>
        <p class="text-xs text-gray-500 mt-1">All listings are verified by current students</p>
      </div>

      <!-- Search Button -->
      <button
        (click)="performSearch()"
        class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-3 transition"
        aria-label="Search"
      >
        Search
      </button>
    </div>

    <!-- Date Picker Overlay -->
    <div
      *ngIf="showDatePicker"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      (click)="closeDatePicker()"
    >
      <div class="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80" (click)="$event.stopPropagation()">
        <!-- Month/Year Header -->
        <div class="flex items-center justify-between mb-4">
          <button
            (click)="previousMonth()"
            class="p-1 hover:bg-gray-100 rounded"
            type="button"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          <div class="font-semibold text-gray-900">
            {{ currentMonthName() }} {{ currentYear() }}
          </div>

          <button
            (click)="nextMonth()"
            class="p-1 hover:bg-gray-100 rounded"
            type="button"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div *ngFor="let day of weekDays" class="text-center text-sm font-medium text-gray-500 py-1">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
          <div
            *ngFor="let day of calendarDays()"
            [class]="day.isCurrentMonth ? 'text-gray-900 hover:bg-blue-50 cursor-pointer' : 'text-gray-400'"
            [class.bg-blue-600]="day.isSelected"
            [class.text-white]="day.isSelected"
            [class.bg-gray-100]="day.isToday && !day.isSelected"
            class="text-center py-2 text-sm rounded cursor-pointer transition"
            (click)="selectDate(day)"
          >
            {{ day.day }}
          </div>
        </div>

        <!-- Today Button -->
        <div class="mt-4 pt-3 border-t border-gray-200">
          <button
            (click)="selectToday()"
            class="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            type="button"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-dropdown {
      max-width: 320px;
    }
  `]
})
export class SearchHeroComponent {
  private router = inject(Router);
  private roomStore = inject(RoomStoreService);
  private universityService = inject(UniversityService);
  private overlay = inject(Overlay);

  // Signals
  query = signal('');
  showSuggestions = false;
  activeIndex = -1;
  roomType = signal<'shared' | 'private' | ''>('');
  studentVerifiedOnly = signal(false);
  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  currentDate = signal(new Date());
  datePickerType: 'checkIn' | 'checkOut' | null = null;
  showDatePicker = false;

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  filteredSuggestions = computed(() => {
    const q = this.query().trim();
    if (q.length < 2) return [];
    return this.universityService?.search(q) || [];
  });

  checkInFormatted = computed(() => {
    const date = this.checkInDate();
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  });

  checkOutFormatted = computed(() => {
    const date = this.checkOutDate();
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  });

  currentMonthName = computed(() => {
    return this.currentDate().toLocaleDateString('en-US', { month: 'long' });
  });

  currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = this.getSelectedDate() && date.toDateString() === this.getSelectedDate()!.toDateString();

      days.push({
        day: date.getDate(),
        date: new Date(date),
        isCurrentMonth,
        isToday,
        isSelected
      });
    }

    return days;
  });

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
          this.performSearch();
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.activeIndex = -1;
        break;
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      this.activeIndex = -1;
    }, 200);
  }

  selectSuggestion(university: University): void {
    this.query.set(university.name);
    this.showSuggestions = false;
    this.performSearch();
  }

  setRoomType(type: 'shared' | 'private'): void {
    this.roomType.set(type);
  }

  openDatePicker(type: 'checkIn' | 'checkOut'): void {
    this.datePickerType = type;
    this.currentDate.set(this.getSelectedDate() || new Date());
    this.showDatePicker = true;
  }

  selectDate(day: any): void {
    if (!day.isCurrentMonth) return;

    const selectedDate = new Date(day.date);
    if (this.datePickerType === 'checkIn') {
      this.checkInDate.set(selectedDate);
      // Clear check-out if it's before check-in
      const checkOut = this.checkOutDate();
      if (checkOut && checkOut <= selectedDate) {
        this.checkOutDate.set(null);
      }
    } else if (this.datePickerType === 'checkOut') {
      this.checkOutDate.set(selectedDate);
    }

    this.closeDatePicker();
  }

  selectToday(): void {
    const today = new Date();
    if (this.datePickerType === 'checkIn') {
      this.checkInDate.set(today);
    } else if (this.datePickerType === 'checkOut') {
      this.checkOutDate.set(today);
    }
    this.closeDatePicker();
  }

  previousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
  }

  closeDatePicker(): void {
    this.showDatePicker = false;
    this.datePickerType = null;
  }

  getSelectedDate(): Date | null {
    if (this.datePickerType === 'checkIn') {
      return this.checkInDate();
    } else if (this.datePickerType === 'checkOut') {
      return this.checkOutDate();
    }
    return null;
  }

  performSearch(): void {
    const queryParams: any = {};

    const q = this.query().trim();
    if (q) queryParams.q = q;

    const roomType = this.roomType();
    if (roomType) queryParams.type = roomType;

    const checkIn = this.checkInDate();
    const checkOut = this.checkOutDate();
    if (checkIn) queryParams.ci = checkIn.toISOString().split('T')[0];
    if (checkOut) queryParams.co = checkOut.toISOString().split('T')[0];

    if (this.studentVerifiedOnly()) queryParams.sv = 1;

    // Update room store filters
    this.roomStore.setFilters({
      city: q, // Use city for now, will be refined with university matching
      roomType: roomType || '',
      checkIn: checkIn ? checkIn.toISOString() : undefined,
      checkOut: checkOut ? checkOut.toISOString() : undefined,
      studentVerifiedOnly: this.studentVerifiedOnly()
    });

    this.router.navigate(['/browse'], { queryParams });
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

// DatePickerComponent for overlay
@Component({
  selector: 'app-date-picker-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
      <!-- Month/Year Header -->
      <div class="flex items-center justify-between mb-4">
        <button
          (click)="previousMonth()"
          class="p-1 hover:bg-gray-100 rounded"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <div class="font-semibold text-gray-900">
          {{ currentMonthName() }} {{ currentYear() }}
        </div>

        <button
          (click)="nextMonth()"
          class="p-1 hover:bg-gray-100 rounded"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div *ngFor="let day of weekDays" class="text-center text-sm font-medium text-gray-500 py-1">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          *ngFor="let day of calendarDays()"
          [class]="day.isCurrentMonth ? 'text-gray-900 hover:bg-blue-50 cursor-pointer' : 'text-gray-400'"
          [class.bg-blue-600]="day.isSelected"
          [class.text-white]="day.isSelected"
          [class.bg-gray-100]="day.isToday && !day.isSelected"
          class="text-center py-2 text-sm rounded cursor-pointer transition"
          (click)="selectDate(day)"
        >
          {{ day.day }}
        </div>
      </div>

      <!-- Today Button -->
      <div class="mt-4 pt-3 border-t border-gray-200">
        <button
          (click)="selectToday()"
          class="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          type="button"
        >
          Today
        </button>
      </div>
    </div>
  `
})
export class DatePickerComponent {
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  currentMonthName = computed(() => {
    return this.currentDate().toLocaleDateString('en-US', { month: 'long' });
  });

  currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = this.selectedDate() && date.toDateString() === this.selectedDate()!.toDateString();

      days.push({
        day: date.getDate(),
        date: new Date(date),
        isCurrentMonth,
        isToday,
        isSelected
      });
    }

    return days;
  });

  selectDate(day: any): void {
    if (!day.isCurrentMonth) return;
    this.selectedDate.set(new Date(day.date));
  }

  selectToday(): void {
    this.selectedDate.set(new Date());
  }

  previousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
  }

  setDate(date: Date): void {
    this.selectedDate.set(date);
    this.currentDate.set(date);
  }
}
