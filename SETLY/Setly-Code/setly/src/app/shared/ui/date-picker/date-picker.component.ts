import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Overlay, OverlayModule, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { format, isValid, parse } from 'date-fns';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <label [for]="id" class="block text-sm font-medium text-gray-700">{{ label }}</label>
      <input
        [id]="id"
        type="text"
        [value]="formatDate(selected)"
        (input)="onInputChange($event)"
        (focus)="showCalendar()"
        (click)="showCalendar()"
        [placeholder]="placeholder"
        class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        [class.border-red-500]="error"
        [attr.aria-label]="label"
        [attr.aria-invalid]="!!error"
        #trigger
      />
      
      <!-- Use ng-template for cdkConnectedOverlay (structural directive requires TemplateRef) -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayOpen]="isOpen"
        (overlayOutsideClick)="close()"
      >
        <div class="calendar-popup">
          <div class="bg-white rounded-lg shadow-lg p-4 w-64">
            <div class="flex justify-between items-center mb-4">
              <button
                type="button"
                class="p-1 hover:bg-gray-100 rounded"
                (click)="previousMonth()"
                aria-label="Previous month"
              >
                ←
              </button>
                <div class="text-sm font-medium">
                  {{ currentMonth | date:'MMMM yyyy' }}
                </div>
              <button
                type="button"
                class="p-1 hover:bg-gray-100 rounded"
                (click)="nextMonth()"
                aria-label="Next month"
              >
                →
              </button>
            </div>
            
            <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              <div *ngFor="let day of weekDays" class="text-gray-500">
                {{ day }}
              </div>
            </div>
            
            <div class="grid grid-cols-7 gap-1">
              <button
                *ngFor="let date of calendarDays"
                type="button"
                [class]="getDateButtonClass(date)"
                (click)="selectDate(date)"
                [disabled]="isDateDisabled(date)"
                [attr.aria-label]="date | date:'MMMM d, yyyy'"
                [attr.aria-selected]="isSelectedDate(date)"
              >
                {{ date.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </ng-template>
      
      <div *ngIf="error" class="mt-1 text-xs text-red-500" role="alert">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .calendar-popup {
      z-index: 1000;
    }
  `]
})
export class DatePickerComponent {
  @Input() selected: Date | null = null;
  @Input() label = '';
  @Input() placeholder = 'Select date';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() error = '';
  @Output() dateChange = new EventEmitter<Date | null>();

  @ViewChild('trigger') trigger!: ElementRef;

  id: string;
  isOpen = false;
  currentMonth: Date;
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 8
    }
  ];

  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {
    this.id = `date-picker-${Math.random().toString(36).substr(2, 9)}`;
    this.currentMonth = this.selected || new Date();
  }

  get calendarDays(): Date[] {
    const start = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const end = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    // Get the first day of the week for the start date
    const firstDay = start.getDay();
    
    // Create array of dates
    const days: Date[] = [];
    
    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(start);
      date.setDate(start.getDate() - i - 1);
      days.push(date);
    }
    
    // Add current month's days
    for (let i = 1; i <= end.getDate(); i++) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), i);
      days.push(date);
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(end);
      date.setDate(end.getDate() + i);
      days.push(date);
    }
    
    return days;
  }

  showCalendar() {
    if (!this.isOpen) {
      this.isOpen = true;
      if (this.selected) {
        this.currentMonth = new Date(this.selected);
      }
    }
  }

  close() {
    this.isOpen = false;
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
  }

  selectDate(date: Date) {
    this.selected = date;
    this.dateChange.emit(date);
    this.close();
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return format(date, 'MMM d, yyyy');
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value) {
      this.selected = null;
      this.dateChange.emit(null);
      return;
    }

    const parsedDate = parse(value, 'MMM d, yyyy', new Date());
    
    if (isValid(parsedDate)) {
      this.selected = parsedDate;
      this.dateChange.emit(parsedDate);
    }
  }

  isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  isSelectedDate(date: Date): boolean {
    if (!this.selected) return false;
    return format(date, 'yyyy-MM-dd') === format(this.selected, 'yyyy-MM-dd');
  }

  getDateButtonClass(date: Date): string {
    const baseClasses = 'w-8 h-8 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ';
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const isSelected = this.isSelectedDate(date);
    const isCurrentMonth = date.getMonth() === this.currentMonth.getMonth();
    
    if (isSelected) {
      return baseClasses + 'bg-blue-500 text-white hover:bg-blue-600';
    }
    
    if (isToday) {
      return baseClasses + 'border border-blue-500 text-blue-500 hover:bg-blue-50';
    }
    
    if (!isCurrentMonth) {
      return baseClasses + 'text-gray-400 hover:bg-gray-50';
    }
    
    return baseClasses + 'text-gray-700 hover:bg-gray-100';
  }
}