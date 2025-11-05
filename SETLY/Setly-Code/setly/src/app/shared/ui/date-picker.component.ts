import { Component, EventEmitter, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [value]="formattedDate()"
        (focus)="showCalendar = true"
        (blur)="onBlur()"
        readonly
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        placeholder="Select date"
      >

      <!-- Calendar Dropdown -->
      <div
        *ngIf="showCalendar"
        class="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80"
      >
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
        <div class="mt-4 pt-4 border-t border-gray-200">
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
export class DatePickerComponent {
  @Output() dateSelected = new EventEmitter<Date>();

  showCalendar = false;
  selectedDate = signal<Date | null>(null);
  currentDate = signal(new Date());

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  formattedDate = computed(() => {
    const date = this.selectedDate();
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

  selectDate(day: any) {
    if (!day.isCurrentMonth) return;

    this.selectedDate.set(new Date(day.date));
    this.showCalendar = false;
    this.dateSelected.emit(new Date(day.date));
  }

  selectToday() {
    const today = new Date();
    this.selectedDate.set(today);
    this.currentDate.set(today);
    this.showCalendar = false;
    this.dateSelected.emit(today);
  }

  previousMonth() {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
  }

  nextMonth() {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
  }

  onBlur() {
    // Delay hiding to allow click events
    setTimeout(() => {
      this.showCalendar = false;
    }, 200);
  }

  setDate(date: Date) {
    this.selectedDate.set(date);
    this.currentDate.set(date);
  }

  getSelectedDate(): Date | null {
    return this.selectedDate();
  }
}
