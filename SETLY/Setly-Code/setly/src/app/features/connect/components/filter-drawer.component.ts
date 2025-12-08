import { Component, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Overlay -->
    <div 
      *ngIf="isOpen()"
      class="drawer-overlay"
      (click)="close()"
      [@fadeIn]></div>

    <!-- Drawer -->
    <div 
      class="filter-drawer"
      [class.open]="isOpen()"
      [@slideUp]>
      
      <!-- Handle -->
      <div class="drawer-handle-area" (click)="close()">
        <div class="drawer-handle"></div>
      </div>

      <!-- Header -->
      <div class="drawer-header">
        <h2 class="drawer-title">Filters</h2>
        <div class="flex items-center gap-3">
          <button 
            (click)="clearAll()"
            class="text-sm text-[#6F7785] font-medium hover:text-[#3E8FFF]">
            Clear All
          </button>
          <button 
            (click)="close()"
            class="close-btn"
            aria-label="Close filters">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="drawer-content">
        
        <!-- Location -->
        <div class="filter-section">
          <div class="filter-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="section-icon">
              <path d="M12 2C8.5 2 5.5 4.8 5.5 8.2c0 5.4 6.5 11.8 6.5 11.8s6.5-6.4 6.5-11.8C18.5 4.8 15.5 2 12 2z" fill="currentColor"/>
              <circle cx="12" cy="8" r="2" fill="white"/>
            </svg>
            <h3 class="filter-section-title">Location</h3>
          </div>
          <div class="filter-input-group">
            <input 
              type="text"
              [(ngModel)]="filters.city"
              placeholder="Enter city or university"
              class="filter-input"
              (change)="emitChange()">
            <button *ngIf="filters.city" (click)="filters.city = ''; emitChange()" class="clear-input-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Post Type -->
        <div class="filter-section">
          <div class="filter-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="section-icon">
              <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3 class="filter-section-title">Post Type</h3>
          </div>
          <div class="filter-chips">
            <button 
              *ngFor="let type of postTypes"
              (click)="togglePostType(type.value)"
              class="filter-chip"
              [class.active]="isPostTypeSelected(type.value)">
              <div [innerHTML]="type.icon"></div>
              <span>{{type.label}}</span>
            </button>
          </div>
        </div>

        <!-- Price Range (for rooms) -->
        <div class="filter-section">
          <div class="filter-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="section-icon">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h3 class="filter-section-title">Price Range</h3>
          </div>
          <div class="price-range-inputs">
            <div class="price-input-wrapper">
              <span class="price-prefix">$</span>
              <input 
                type="number"
                [(ngModel)]="filters.minPrice"
                placeholder="Min"
                class="price-input"
                (change)="emitChange()">
            </div>
            <div class="price-divider">—</div>
            <div class="price-input-wrapper">
              <span class="price-prefix">$</span>
              <input 
                type="number"
                [(ngModel)]="filters.maxPrice"
                placeholder="Max"
                class="price-input"
                (change)="emitChange()">
            </div>
          </div>
          <div class="price-suggestions">
            <button 
              *ngFor="let range of priceRanges"
              (click)="applyPriceRange(range)"
              class="price-suggestion-chip">
              {{range.label}}
            </button>
          </div>
        </div>

        <!-- Room Type -->
        <div class="filter-section">
          <div class="filter-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="section-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3 class="filter-section-title">Room Type</h3>
          </div>
          <div class="filter-chips">
            <button 
              *ngFor="let type of roomTypes"
              (click)="selectRoomType(type.value)"
              class="filter-chip"
              [class.active]="filters.roomType === type.value">
              {{type.label}}
            </button>
          </div>
        </div>

        <!-- Interests -->
        <div class="filter-section">
          <div class="filter-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="section-icon">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3 class="filter-section-title">Interests</h3>
          </div>
          <div class="filter-chips">
            <button 
              *ngFor="let interest of interests"
              (click)="toggleInterest(interest)"
              class="filter-chip"
              [class.active]="isInterestSelected(interest)">
              {{interest}}
            </button>
          </div>
        </div>

        <!-- Verification -->
        <div class="filter-section">
          <div class="filter-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="section-icon">
              <path d="M9 12l2 2 4-4M12 2l10 5v6c0 5-4 9-10 11C6 22 2 18 2 13V7l10-5z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <h3 class="filter-section-title">Verification</h3>
          </div>
          <label class="toggle-option">
            <input 
              type="checkbox"
              [(ngModel)]="filters.verifiedOnly"
              (change)="emitChange()"
              class="toggle-checkbox">
            <div class="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-label">Verified users only</span>
          </label>
        </div>

      </div>

      <!-- Footer -->
      <div class="drawer-footer">
        <div class="results-count">
          <span class="count-number">{{resultsCount}}</span>
          <span class="count-label">results found</span>
        </div>
        <button 
          (click)="applyFilters()"
          class="apply-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 26, 63, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .filter-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 85vh;
      background: white;
      border-radius: 24px 24px 0 0;
      z-index: 1000;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 -12px 48px -12px rgba(10, 26, 63, 0.25);
      display: flex;
      flex-direction: column;
    }

    .filter-drawer.open {
      transform: translateY(0);
    }

    .drawer-handle-area {
      padding: 12px 0 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
    }

    .drawer-handle {
      width: 40px;
      height: 5px;
      background: #D1D5DB;
      border-radius: 999px;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px 16px;
      border-bottom: 1px solid #F3F4F6;
    }

    .drawer-title {
      font-size: 20px;
      font-weight: 700;
      color: #0A1A3F;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #F3F4F6;
      color: #6F7785;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #E5E7EB;
      color: #0A1A3F;
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      -webkit-overflow-scrolling: touch;
    }

    .filter-section {
      margin-bottom: 32px;
    }

    .filter-section:last-child {
      margin-bottom: 0;
    }

    .filter-section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .section-icon {
      color: #3E8FFF;
    }

    .filter-section-title {
      font-size: 15px;
      font-weight: 600;
      color: #0A1A3F;
    }

    .filter-input-group {
      position: relative;
    }

    .filter-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 15px;
      color: #0A1A3F;
      transition: all 0.2s ease;
    }

    .filter-input:focus {
      outline: none;
      border-color: #3E8FFF;
      box-shadow: 0 0 0 4px rgba(62, 143, 255, 0.1);
    }

    .filter-input::placeholder {
      color: #9CA3AF;
    }

    .clear-input-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6F7785;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      background: #F9FAFB;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #0A1A3F;
      transition: all 0.2s ease;
    }

    .filter-chip:hover {
      border-color: #3E8FFF;
      background: rgba(62, 143, 255, 0.05);
    }

    .filter-chip.active {
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      border-color: #3E8FFF;
      color: white;
      box-shadow: 0 4px 12px -2px rgba(62, 143, 255, 0.4);
    }

    .filter-chip :global(svg) {
      width: 16px;
      height: 16px;
    }

    .price-range-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .price-input-wrapper {
      flex: 1;
      position: relative;
    }

    .price-prefix {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 15px;
      font-weight: 600;
      color: #6F7785;
    }

    .price-input {
      width: 100%;
      padding: 14px 16px 14px 32px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #0A1A3F;
      transition: all 0.2s ease;
    }

    .price-input:focus {
      outline: none;
      border-color: #3E8FFF;
      box-shadow: 0 0 0 4px rgba(62, 143, 255, 0.1);
    }

    .price-divider {
      color: #9CA3AF;
      font-weight: 600;
    }

    .price-suggestions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .price-suggestion-chip {
      padding: 6px 12px;
      background: white;
      border: 1.5px solid #E5E7EB;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #6F7785;
      transition: all 0.2s ease;
    }

    .price-suggestion-chip:hover {
      border-color: #3E8FFF;
      color: #3E8FFF;
    }

    .toggle-option {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .toggle-checkbox {
      display: none;
    }

    .toggle-track {
      width: 52px;
      height: 28px;
      background: #E5E7EB;
      border-radius: 999px;
      position: relative;
      transition: background 0.3s ease;
    }

    .toggle-thumb {
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggle-checkbox:checked + .toggle-track {
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
    }

    .toggle-checkbox:checked + .toggle-track .toggle-thumb {
      transform: translateX(24px);
    }

    .toggle-label {
      font-size: 15px;
      font-weight: 500;
      color: #0A1A3F;
    }

    .drawer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-top: 1px solid #F3F4F6;
      background: white;
      box-shadow: 0 -4px 12px -4px rgba(10, 26, 63, 0.08);
    }

    .results-count {
      display: flex;
      flex-direction: column;
    }

    .count-number {
      font-size: 24px;
      font-weight: 700;
      color: #3E8FFF;
      line-height: 1;
    }

    .count-label {
      font-size: 12px;
      color: #6F7785;
      font-weight: 500;
    }

    .apply-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 6px 20px -4px rgba(62, 143, 255, 0.5);
      transition: all 0.2s ease;
    }

    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(62, 143, 255, 0.6);
    }

    .apply-btn:active {
      transform: translateY(0);
    }
  `]
})
export class FilterDrawerComponent {
  @Input() isOpen = signal(false);
  @Input() resultsCount = 0;
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  filters: any = {
    city: '',
    postTypes: [],
    minPrice: null,
    maxPrice: null,
    roomType: '',
    interests: [],
    verifiedOnly: false
  };

  postTypes = [
    { value: 'room', label: 'Rooms', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="2"/></svg>' },
    { value: 'ride', label: 'Rides', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5h11L19 11M7 16h10" stroke="currentColor" stroke-width="2"/></svg>' },
    { value: 'person', label: 'People', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M6 20c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" stroke="currentColor" stroke-width="2"/></svg>' },
    { value: 'market', label: 'Marketplace', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" stroke-width="2"/></svg>' }
  ];

  roomTypes = [
    { value: 'shared', label: 'Shared' },
    { value: 'private', label: 'Private' },
    { value: 'studio', label: 'Studio' }
  ];

  priceRanges = [
    { label: 'Under $500', min: 0, max: 500 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: '$1000+', min: 1000, max: null }
  ];

  interests = ['Housing', 'Study Groups', 'Rides', 'Events', 'Sports', 'Music', 'Food', 'Tech'];

  togglePostType(type: string) {
    const index = this.filters.postTypes.indexOf(type);
    if (index > -1) {
      this.filters.postTypes.splice(index, 1);
    } else {
      this.filters.postTypes.push(type);
    }
  }

  isPostTypeSelected(type: string): boolean {
    return this.filters.postTypes.includes(type);
  }

  selectRoomType(type: string) {
    this.filters.roomType = this.filters.roomType === type ? '' : type;
  }

  toggleInterest(interest: string) {
    const index = this.filters.interests.indexOf(interest);
    if (index > -1) {
      this.filters.interests.splice(index, 1);
    } else {
      this.filters.interests.push(interest);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.filters.interests.includes(interest);
  }

  applyPriceRange(range: any) {
    this.filters.minPrice = range.min;
    this.filters.maxPrice = range.max;
    this.emitChange();
  }

  clearAll() {
    this.filters = {
      city: '',
      postTypes: [],
      minPrice: null,
      maxPrice: null,
      roomType: '',
      interests: [],
      verifiedOnly: false
    };
    this.emitChange();
  }

  emitChange() {
    this.filtersChanged.emit(this.filters);
  }

  applyFilters() {
    this.emitChange();
    this.close();
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
