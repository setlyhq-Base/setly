import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-card">
      <!-- Header -->
      <div class="filter-header">
        <h2 class="filter-title">Filters</h2>
        <div class="filter-actions">
          <button class="action-btn" (click)="hide.emit()">Hide</button>
          <button *ngIf="showClose" class="action-btn close" (click)="close.emit()">✕</button>
        </div>
      </div>

      <div class="filter-divider"></div>

      <ng-container [ngSwitch]="activeTab">
        <!-- ========== ROOMS FILTERS ========== -->
        <div *ngSwitchCase="'rooms'" class="filter-sections">
          
          <!-- PRICE SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('price')" type="button">
              <h3 class="section-heading">Price</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['price']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['price']">
              <div class="price-slider-wrapper">
                <div class="price-display">
                  <span class="price-label">Up to</span>
                  <span class="price-value">\${{ roomsFilters.price }}</span>
                  <span class="price-period">/mo</span>
                </div>
                <input type="range" min="0" max="5000" step="50" [(ngModel)]="roomsFilters.price" (ngModelChange)="filtersChange.emit()" class="price-slider" />
                <div class="price-range-labels">
                  <span>\$0</span>
                  <span>\$5000</span>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- LOCATION SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('location')" type="button">
              <h3 class="section-heading">Location</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['location']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['location']">
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input type="text" class="filter-input" [(ngModel)]="roomsFilters.place" (ngModelChange)="filtersChange.emit()" placeholder="Search university or city" />
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- ROOM DETAILS SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('roomDetails')" type="button">
              <h3 class="section-heading">Room Details</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['roomDetails']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['roomDetails']">
              <div class="subsection">
                <label class="sub-label">Room type</label>
                <div class="chip-group">
                  <button type="button" class="chip" [class.active]="roomsFilters.type==='shared'" (click)="roomsFilters.type='shared'; filtersChange.emit()">Shared</button>
                  <button type="button" class="chip" [class.active]="roomsFilters.type==='private'" (click)="roomsFilters.type='private'; filtersChange.emit()">Private</button>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- PROPERTY TYPE SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('propertyType')" type="button">
              <h3 class="section-heading">Property Type</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['propertyType']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['propertyType']">
              <div class="select-with-icon">
                <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <select class="filter-select" [(ngModel)]="roomsFilters.property" (ngModelChange)="filtersChange.emit()">
                  <option value="">Any type</option>
                  <option>Dorm</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Shared house</option>
                </select>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- AMENITIES SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('amenities')" type="button">
              <h3 class="section-heading">Amenities</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['amenities']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['amenities']">
              <div class="amenity-chips">
                <button *ngFor="let a of amenities" type="button" class="amenity-chip" [class.active]="roomsFilters.amenities.includes(a)" (click)="toggleAmenity(a)">
                  <svg *ngIf="getAmenityIcon(a)" class="chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path [attr.d]="getAmenityIcon(a)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ a }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- VERIFICATION SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('verification')" type="button">
              <h3 class="section-heading">Verification</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['verification']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['verification']">
              <div class="toggle-wrapper">
                <label class="toggle-label">
                  <span class="toggle-text">Student-Verified Only</span>
                  <button type="button" class="toggle-switch" [class.active]="roomsFilters.studentVerified" (click)="roomsFilters.studentVerified = !roomsFilters.studentVerified; filtersChange.emit()">
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- RATING SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('rating')" type="button">
              <h3 class="section-heading">Rating</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['rating']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['rating']">
              <select class="filter-select" [(ngModel)]="roomsFilters.rating" (ngModelChange)="filtersChange.emit()">
                <option value="">Any rating</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
                <option value="4">⭐⭐⭐⭐ 4+ stars</option>
                <option value="3">⭐⭐⭐ 3+ stars</option>
                <option value="2">⭐⭐ 2+ stars</option>
                <option value="1">⭐ 1+ star</option>
              </select>
            </div>
          </div>

        </div>

        <!-- ========== RIDES FILTERS ========== -->
        <div *ngSwitchCase="'rides'" class="filter-sections">
          
          <!-- ROUTE SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('route')" type="button">
              <h3 class="section-heading">Route</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['route']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['route']">
              <div class="subsection">
                <label class="sub-label">From</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  </svg>
                  <input type="text" class="filter-input" [(ngModel)]="ridesFilters.from" (ngModelChange)="filtersChange.emit()" placeholder="Departure city" />
                </div>
              </div>
              <div class="subsection mt-3">
                <label class="sub-label">To</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input type="text" class="filter-input" [(ngModel)]="ridesFilters.to" (ngModelChange)="filtersChange.emit()" placeholder="Destination city" />
                </div>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- DATE & TIME SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('dateTime')" type="button">
              <h3 class="section-heading">Date & Time</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['dateTime']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['dateTime']">
              <div class="grid grid-cols-2 gap-3">
                <div class="subsection">
                  <label class="sub-label">Date</label>
                  <input type="date" class="filter-input" [(ngModel)]="ridesFilters.date" (ngModelChange)="filtersChange.emit()" />
                </div>
                <div class="subsection">
                  <label class="sub-label">Time</label>
                  <input type="time" class="filter-input" [(ngModel)]="ridesFilters.time" (ngModelChange)="filtersChange.emit()" />
                </div>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- PRICE SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('ridesPrice')" type="button">
              <h3 class="section-heading">Price</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['ridesPrice']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['ridesPrice']">
              <div class="subsection">
                <label class="sub-label">Maximum price</label>
                <input type="number" min="0" class="filter-input" [(ngModel)]="ridesFilters.priceMax" (ngModelChange)="filtersChange.emit()" placeholder="No limit" />
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- SEATS SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('seats')" type="button">
              <h3 class="section-heading">Seats</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['seats']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['seats']">
              <select class="filter-select" [(ngModel)]="ridesFilters.seats" (ngModelChange)="filtersChange.emit()">
                <option *ngFor="let s of [1,2,3,4,5]" [value]="s">{{ s }} {{ s === 1 ? 'seat' : 'seats' }}</option>
              </select>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- RATING SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('driverRating')" type="button">
              <h3 class="section-heading">Driver Rating</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['driverRating']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['driverRating']">
              <select class="filter-select" [(ngModel)]="ridesFilters.rating" (ngModelChange)="filtersChange.emit()">
                <option value="">Any rating</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
                <option value="4">⭐⭐⭐⭐ 4+ stars</option>
                <option value="3">⭐⭐⭐ 3+ stars</option>
              </select>
            </div>
          </div>

        </div>

        <!-- ========== MARKETPLACE FILTERS ========== -->
        <div *ngSwitchCase="'market'" class="filter-sections">
          
          <!-- CATEGORY SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('category')" type="button">
              <h3 class="section-heading">Category</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['category']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['category']">
              <select class="filter-select" [(ngModel)]="marketFilters.category" (ngModelChange)="filtersChange.emit()">
                <option value="">All categories</option>
                <option>Books</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Tutoring</option>
              </select>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- PRICE SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('marketPrice')" type="button">
              <h3 class="section-heading">Price</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['marketPrice']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['marketPrice']">
              <div class="subsection">
                <label class="sub-label">Maximum price</label>
                <input type="number" min="0" class="filter-input" [(ngModel)]="marketFilters.maxPrice" (ngModelChange)="filtersChange.emit()" placeholder="No limit" />
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- CONDITION SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('condition')" type="button">
              <h3 class="section-heading">Condition</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['condition']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['condition']">
              <select class="filter-select" [(ngModel)]="marketFilters.condition" (ngModelChange)="filtersChange.emit()">
                <option value="">Any condition</option>
                <option>New</option>
                <option>Like new</option>
                <option>Used</option>
              </select>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- LOCATION SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('marketLocation')" type="button">
              <h3 class="section-heading">Location</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['marketLocation']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['marketLocation']">
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input type="text" class="filter-input" [(ngModel)]="marketFilters.place" (ngModelChange)="filtersChange.emit()" placeholder="University or city" />
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- SELLER SECTION -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('seller')" type="button">
              <h3 class="section-heading">Seller Type</h3>
              <svg class="section-toggle-icon" [class.open]="sectionStates['seller']" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['seller']">
              <select class="filter-select" [(ngModel)]="marketFilters.seller" (ngModelChange)="filtersChange.emit()">
                <option value="">Any seller</option>
                <option>Student</option>
                <option>Other</option>
              </select>
            </div>
          </div>

        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    /* ========== FILTER CARD ========== */
    .filter-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(226, 228, 232, 0.8);
      border-radius: 24px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }

    /* ========== HEADER ========== */
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
    }

    .filter-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6F7785;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .action-btn {
      font-size: 12px;
      color: #3E8FFF;
      font-weight: 500;
      background: none;
      border: none;
      cursor: pointer;
      transition: color 0.15s ease;
    }

    .action-btn:hover {
      color: #0A1A3F;
    }

    .action-btn.close {
      color: #6F7785;
      font-size: 18px;
      line-height: 1;
    }

    /* ========== DIVIDERS ========== */
    .filter-divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.06);
      margin: 18px 24px;
    }

    /* ========== SECTIONS ========== */
    .filter-sections {
      padding: 0 0 24px;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .filter-sections::-webkit-scrollbar {
      width: 6px;
    }

    .filter-sections::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.02);
    }

    .filter-sections::-webkit-scrollbar-thumb {
      background: rgba(111, 119, 133, 0.2);
      border-radius: 3px;
    }

    .filter-section {
      padding: 0 24px;
    }

    /* ========== COLLAPSIBLE SECTION HEADER ========== */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 24px 0 8px;
      background: none;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }

    .section-header:hover {
      opacity: 0.7;
    }

    .section-heading {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6F7785;
      margin: 0;
      text-align: left;
    }

    .section-toggle-icon {
      flex-shrink: 0;
      color: #6F7785;
      transition: transform 0.2s ease;
    }

    .section-toggle-icon.open {
      transform: rotate(180deg);
    }

    /* ========== COLLAPSIBLE CONTENT ========== */
    .section-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease, opacity 0.15s ease;
      opacity: 0;
    }

    .section-content.open {
      max-height: 1000px;
      opacity: 1;
      padding-bottom: 4px;
    }

    .subsection {
      margin-bottom: 12px;
    }

    .subsection:last-child {
      margin-bottom: 0;
    }

    .sub-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #424A53;
      margin-bottom: 8px;
    }

    /* ========== PRICE SLIDER ========== */
    .price-slider-wrapper {
      width: 100%;
    }

    .price-display {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 16px;
    }

    .price-label {
      font-size: 13px;
      color: #6F7785;
    }

    .price-value {
      font-size: 28px;
      font-weight: 700;
      color: #0A1A3F;
      line-height: 1;
    }

    .price-period {
      font-size: 14px;
      color: #6F7785;
    }

    .price-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, #E8F4FF 0%, #D1E7FF 100%);
      outline: none;
      cursor: pointer;
      margin: 12px 0;
    }

    .price-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3E8FFF;
      box-shadow: 0 2px 12px rgba(62, 143, 255, 0.4);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .price-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(62, 143, 255, 0.5);
    }

    .price-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3E8FFF;
      box-shadow: 0 2px 12px rgba(62, 143, 255, 0.4);
      border: none;
      cursor: pointer;
    }

    .price-range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 4px;
    }

    /* ========== INPUTS ========== */
    .filter-input {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      color: #1B1C1E;
      background: white;
      border: 1px solid #E2E4E8;
      border-radius: 12px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .filter-input:focus {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.08);
    }

    .filter-input::placeholder {
      color: #9CA3AF;
    }

    .input-with-icon {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6F7785;
      pointer-events: none;
    }

    .input-with-icon .filter-input {
      padding-left: 38px;
    }

    /* ========== SELECT ========== */
    .filter-select {
      width: 100%;
      padding: 10px 36px 10px 12px;
      font-size: 14px;
      color: #1B1C1E;
      background: white url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236F7785' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 12px center;
      border: 1px solid #E2E4E8;
      border-radius: 12px;
      outline: none;
      appearance: none;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .filter-select:focus {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.08);
    }

    .select-with-icon {
      position: relative;
    }

    .select-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6F7785;
      pointer-events: none;
      z-index: 1;
    }

    .select-with-icon .filter-select {
      padding-left: 38px;
    }

    /* ========== CHIPS ========== */
    .chip-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #6F7785;
      background: white;
      border: 1px solid #E6E6E6;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;
    }

    .chip:hover {
      border-color: #3E8FFF;
      color: #0A1A3F;
    }

    .chip.active {
      background: #3E8FFF;
      color: white;
      border-color: #3E8FFF;
      box-shadow: 0 2px 8px rgba(62, 143, 255, 0.25);
    }

    /* ========== AMENITY CHIPS ========== */
    .amenity-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .amenity-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #6F7785;
      background: white;
      border: 1px solid #E6E6E6;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;
    }

    .amenity-chip:hover {
      border-color: #3E8FFF;
      color: #0A1A3F;
    }

    .amenity-chip.active {
      background: #3E8FFF;
      color: #FFFFFF;
      border-color: #3E8FFF;
      box-shadow: 0 2px 8px rgba(62, 143, 255, 0.25);
    }
    
    .amenity-chip.active .chip-icon {
      color: #FFFFFF;
    }

    .chip-icon {
      flex-shrink: 0;
    }

    /* ========== TOGGLE SWITCH ========== */
    .toggle-wrapper {
      padding: 2px 0;
    }

    .toggle-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .toggle-text {
      font-size: 14px;
      font-weight: 500;
      color: #424A53;
    }

    .toggle-switch {
      position: relative;
      width: 44px;
      height: 24px;
      background: #E5E7EB;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      transition: background 0.2s ease;
      outline: none;
    }

    .toggle-switch.active {
      background: #3E8FFF;
    }

    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .toggle-switch.active .toggle-slider {
      transform: translateX(20px);
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 767px) {
      .filter-card {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
    }
  `]
})
export class FilterPanelComponent {
  @Input() activeTab: 'rooms'|'rides'|'market' = 'rooms';
  @Input() roomsFilters: any;
  @Input() ridesFilters: any;
  @Input() marketFilters: any;
  @Input() amenities: string[] = [];
  @Input() showClose = false;
  @Output() hide = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() filtersChange = new EventEmitter<void>(); // New event for filter changes

  // Section toggle states - Price open by default
  sectionStates: { [key: string]: boolean } = {
    price: true,
    location: false,
    roomDetails: false,
    propertyType: false,
    amenities: false,
    verification: false,
    rating: false,
    // Rides sections
    route: true,
    dateTime: false,
    ridesPrice: false,
    seats: false,
    driverRating: false,
    // Marketplace sections
    category: true,
    marketPrice: false,
    condition: false,
    marketLocation: false,
    seller: false
  };

  toggleSection(section: string) {
    this.sectionStates[section] = !this.sectionStates[section];
  }

  toggleAmenity(a: string){
    const i = this.roomsFilters.amenities.indexOf(a);
    if (i >= 0) this.roomsFilters.amenities.splice(i,1); else this.roomsFilters.amenities.push(a);
    this.filtersChange.emit(); // Emit change event
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'Wi-Fi': 'M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
      'Laundry': 'M3 6h18M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6M3 6l3-4h12l3 4M9 12h6M9 16h6',
      'Parking': 'M6 6h2v12H6zM10 8h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4V8z',
      'Kitchen': 'M3 2v7c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V2M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M9 2v7M15 2v7',
      'AC': 'M8 6h8M8 10h8M8 14h8M5 6v12M19 6v12'
    };
    return icons[amenity] || '';
  }
}
