import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-card">
      <!-- Premium Header with Gradient -->
      <div class="filter-header">
        <div class="header-content">
          <div class="icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h2 class="filter-title">Filters</h2>
            <p class="filter-subtitle">Refine your search</p>
          </div>
        </div>
        <div class="filter-actions">
          <button class="action-btn-icon" (click)="hide.emit()" title="Hide filters">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Active Filters Chips Bar -->
      <div class="active-filters-bar" *ngIf="hasActiveFilters()">
        <div class="active-filters-scroll">
          <button 
            *ngFor="let chip of getActiveFilterChips()" 
            class="filter-chip"
            (click)="removeFilter(chip.key, chip.value)"
          >
            <span class="chip-label">{{ chip.label }}</span>
            <svg class="chip-remove" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="clear-all-btn" (click)="clearAllFilters()">
            <span>Clear all</span>
          </button>
        </div>
      </div>

      <div class="filter-divider"></div>

      <ng-container [ngSwitch]="activeTab">
        <!-- ========== ROOMS FILTERS ========== -->
        <div *ngSwitchCase="'rooms'" class="filter-sections">
          
          <!-- PRICE SECTION - Enhanced Dual Range Slider -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('price')" type="button">
              <div class="section-header-left">
                <div class="section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3 class="section-heading">Price Range</h3>
              </div>
              <svg class="section-toggle-icon" [class.open]="sectionStates['price']" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['price']">
              <div class="price-range-container">
                <div class="price-inputs-row">
                  <div class="price-input-group">
                    <label class="price-input-label">Min</label>
                    <div class="price-input-wrapper">
                      <span class="price-currency">\$</span>
                      <input 
                        type="number" 
                        class="price-input" 
                        [(ngModel)]="roomsFilters.priceMin" 
                        (ngModelChange)="filtersChange.emit()"
                        placeholder="0"
                        min="0"
                        [max]="roomsFilters.price"
                      />
                    </div>
                  </div>
                  <div class="price-separator">—</div>
                  <div class="price-input-group">
                    <label class="price-input-label">Max</label>
                    <div class="price-input-wrapper">
                      <span class="price-currency">\$</span>
                      <input 
                        type="number" 
                        class="price-input" 
                        [(ngModel)]="roomsFilters.price" 
                        (ngModelChange)="filtersChange.emit()"
                        placeholder="5000"
                        [min]="roomsFilters.priceMin || 0"
                        max="5000"
                      />
                    </div>
                  </div>
                </div>
                
                <div class="premium-slider-wrapper">
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="50" 
                    [(ngModel)]="roomsFilters.price" 
                    (ngModelChange)="filtersChange.emit()" 
                    class="premium-slider" 
                  />
                  <div class="slider-track-fill" [style.width.%]="(roomsFilters.price / 5000) * 100"></div>
                </div>
                
                <div class="quick-price-chips">
                  <button 
                    type="button" 
                    class="quick-chip"
                    [class.active]="roomsFilters.price === 1000"
                    (click)="roomsFilters.price = 1000; filtersChange.emit()"
                  >Under \$1K</button>
                  <button 
                    type="button" 
                    class="quick-chip"
                    [class.active]="roomsFilters.price === 2000"
                    (click)="roomsFilters.price = 2000; filtersChange.emit()"
                  >\$1K-\$2K</button>
                  <button 
                    type="button" 
                    class="quick-chip"
                    [class.active]="roomsFilters.price === 3000"
                    (click)="roomsFilters.price = 3000; filtersChange.emit()"
                  >\$2K-\$3K</button>
                  <button 
                    type="button" 
                    class="quick-chip"
                    [class.active]="roomsFilters.price === 5000"
                    (click)="roomsFilters.price = 5000; filtersChange.emit()"
                  >\$3K+</button>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- LOCATION SECTION - Enhanced with Recent Searches -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('location')" type="button">
              <div class="section-header-left">
                <div class="section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <h3 class="section-heading">Location</h3>
              </div>
              <svg class="section-toggle-icon" [class.open]="sectionStates['location']" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['location']">
              <div class="premium-input-wrapper">
                <svg class="premium-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input 
                  type="text" 
                  class="premium-input" 
                  [(ngModel)]="roomsFilters.place" 
                  (ngModelChange)="filtersChange.emit()" 
                  placeholder="Search university or city" 
                />
                <button 
                  *ngIf="roomsFilters.place" 
                  class="input-clear-btn"
                  (click)="roomsFilters.place = ''; filtersChange.emit()"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Popular Locations Quick Select -->
              <div class="location-quick-select">
                <p class="quick-select-label">Popular:</p>
                <div class="location-pills">
                  <button 
                    type="button" 
                    class="location-pill"
                    *ngFor="let loc of popularLocations"
                    (click)="roomsFilters.place = loc; filtersChange.emit()"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2.5"/>
                    </svg>
                    {{ loc }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- ROOM DETAILS SECTION - Enhanced with Icons -->
          <div class="filter-section">
            <button class="section-header" (click)="toggleSection('roomDetails')" type="button">
              <div class="section-header-left">
                <div class="section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <h3 class="section-heading">Room Details</h3>
              </div>
              <svg class="section-toggle-icon" [class.open]="sectionStates['roomDetails']" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="section-content" [class.open]="sectionStates['roomDetails']">
              <div class="subsection">
                <label class="premium-label">Room type</label>
                <div class="premium-chip-group">
                  <button 
                    type="button" 
                    class="premium-chip" 
                    [class.active]="roomsFilters.type==='shared'" 
                    (click)="roomsFilters.type='shared'; filtersChange.emit()"
                  >
                    <svg class="chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>Shared</span>
                  </button>
                  <button 
                    type="button" 
                    class="premium-chip" 
                    [class.active]="roomsFilters.type==='private'" 
                    (click)="roomsFilters.type='private'; filtersChange.emit()"
                  >
                    <svg class="chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>Private</span>
                  </button>
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
    /* ========== PREMIUM FILTER CARD ========== */
    .filter-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 251, 255, 0.95) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(62, 143, 255, 0.08);
      border-radius: 28px;
      box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(255, 255, 255, 0.8) inset,
        0 20px 60px rgba(62, 143, 255, 0.06);
      overflow: hidden;
      position: relative;
    }

    .filter-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3E8FFF 0%, #8B5CF6 50%, #EC4899 100%);
      opacity: 0.6;
    }

    /* ========== PREMIUM HEADER ========== */
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.03) 0%, rgba(139, 92, 246, 0.02) 100%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .icon-badge {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      border-radius: 14px;
      color: white;
      box-shadow: 0 4px 16px rgba(62, 143, 255, 0.3);
    }

    .filter-title {
      font-size: 20px;
      font-weight: 700;
      color: #0A1A3F;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .filter-subtitle {
      font-size: 13px;
      color: #6F7785;
      margin: 2px 0 0;
      font-weight: 500;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .action-btn-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      color: #6F7785;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .action-btn-icon:hover {
      background: white;
      color: #3E8FFF;
      border-color: rgba(62, 143, 255, 0.2);
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    /* ========== ACTIVE FILTERS CHIPS BAR ========== */
    .active-filters-bar {
      padding: 16px 28px;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.02) 0%, rgba(139, 92, 246, 0.01) 100%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }

    .active-filters-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 4px;
      scrollbar-width: thin;
      scrollbar-color: rgba(62, 143, 255, 0.2) transparent;
    }

    .active-filters-scroll::-webkit-scrollbar {
      height: 4px;
    }

    .active-filters-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .active-filters-scroll::-webkit-scrollbar-thumb {
      background: rgba(62, 143, 255, 0.2);
      border-radius: 2px;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: white;
      border: 1px solid rgba(62, 143, 255, 0.15);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      color: #3E8FFF;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(62, 143, 255, 0.1);
    }

    .filter-chip:hover {
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      border-color: transparent;
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 16px rgba(62, 143, 255, 0.3);
    }

    .chip-label {
      line-height: 1;
    }

    .chip-remove {
      width: 14px;
      height: 14px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .filter-chip:hover .chip-remove {
      opacity: 1;
    }

    .clear-all-btn {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.06) 100%);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      color: #EF4444;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }

    .clear-all-btn:hover {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      border-color: transparent;
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }

    /* ========== DIVIDERS ========== */
    .filter-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.06) 50%, transparent 100%);
      margin: 0 28px;
    }

    /* ========== SECTIONS ========== */
    .filter-sections {
      padding: 12px 0 28px;
      max-height: calc(100vh - 240px);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .filter-sections::-webkit-scrollbar {
      width: 8px;
    }

    .filter-sections::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      margin: 8px 0;
    }

    .filter-sections::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(62, 143, 255, 0.3) 0%, rgba(62, 143, 255, 0.2) 100%);
      border-radius: 4px;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .filter-sections::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(62, 143, 255, 0.5) 0%, rgba(62, 143, 255, 0.4) 100%);
    }

    .filter-section {
      padding: 0 28px;
      margin-bottom: 8px;
    }

    /* ========== SECTION HEADER - ENHANCED ========== */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 18px 0;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 12px;
    }

    .section-header:hover {
      background: rgba(62, 143, 255, 0.03);
      padding-left: 8px;
      padding-right: 8px;
    }

    .section-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%);
      border-radius: 10px;
      color: #3E8FFF;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .section-header:hover .section-icon {
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      transform: scale(1.05);
    }

    .section-heading {
      font-size: 15px;
      font-weight: 600;
      color: #0A1A3F;
      margin: 0;
      text-align: left;
      letter-spacing: -0.01em;
    }

    .section-toggle-icon {
      flex-shrink: 0;
      color: #6F7785;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .section-toggle-icon.open {
      transform: rotate(180deg);
      color: #3E8FFF;
    }

    /* ========== COLLAPSIBLE CONTENT - SMOOTH ANIMATION ========== */
    .section-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                  opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      padding-top: 0;
    }

    .section-content.open {
      max-height: 2000px;
      opacity: 1;
      padding-top: 8px;
      padding-bottom: 12px;
    }

    .subsection {
      margin-bottom: 20px;
    }

    .subsection:last-child {
      margin-bottom: 0;
    }

    .premium-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #424A53;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }

    /* ========== PREMIUM PRICE RANGE ========== */
    .price-range-container {
      width: 100%;
    }

    .price-inputs-row {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      margin-bottom: 24px;
    }

    .price-input-group {
      flex: 1;
    }

    .price-input-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #6F7785;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .price-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid rgba(226, 228, 232, 0.8);
      border-radius: 14px;
      padding: 12px 14px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .price-input-wrapper:focus-within {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 4px rgba(62, 143, 255, 0.1);
      background: rgba(62, 143, 255, 0.02);
    }

    .price-currency {
      font-size: 16px;
      font-weight: 700;
      color: #6F7785;
      margin-right: 6px;
    }

    .price-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      font-weight: 600;
      color: #0A1A3F;
      background: transparent;
      width: 100%;
    }

    .price-input::placeholder {
      color: #9CA3AF;
      font-weight: 500;
    }

    .price-separator {
      font-size: 18px;
      font-weight: 300;
      color: #9CA3AF;
      padding-bottom: 12px;
    }

    /* ========== PREMIUM SLIDER ========== */
    .premium-slider-wrapper {
      position: relative;
      padding: 20px 0;
      margin-bottom: 16px;
    }

    .premium-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 999px;
      background: linear-gradient(90deg, #E8F4FF 0%, #D1E7FF 100%);
      outline: none;
      cursor: pointer;
      position: relative;
      z-index: 2;
    }

    .premium-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      box-shadow: 
        0 4px 16px rgba(62, 143, 255, 0.4),
        0 0 0 4px rgba(62, 143, 255, 0.15),
        0 0 0 1px white inset;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .premium-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 
        0 6px 24px rgba(62, 143, 255, 0.5),
        0 0 0 6px rgba(62, 143, 255, 0.2),
        0 0 0 1px white inset;
    }

    .premium-slider::-webkit-slider-thumb:active {
      transform: scale(1.05);
    }

    .premium-slider::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      box-shadow: 
        0 4px 16px rgba(62, 143, 255, 0.4),
        0 0 0 4px rgba(62, 143, 255, 0.15);
      border: none;
      cursor: pointer;
    }

    .slider-track-fill {
      position: absolute;
      top: 20px;
      left: 0;
      height: 6px;
      background: linear-gradient(90deg, #3E8FFF 0%, #5EA3FF 100%);
      border-radius: 999px;
      pointer-events: none;
      transition: width 0.15s ease;
    }

    /* ========== QUICK PRICE CHIPS ========== */
    .quick-price-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .quick-chip {
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 600;
      color: #6F7785;
      background: white;
      border: 1.5px solid rgba(226, 228, 232, 0.8);
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .quick-chip:hover {
      border-color: #3E8FFF;
      color: #3E8FFF;
      background: rgba(62, 143, 255, 0.04);
      transform: translateY(-2px);
    }

    .quick-chip.active {
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      border-color: transparent;
      box-shadow: 0 4px 16px rgba(62, 143, 255, 0.3);
    }

    /* ========== PREMIUM INPUT ========== */
    .premium-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .premium-input-icon {
      position: absolute;
      left: 16px;
      color: #6F7785;
      pointer-events: none;
      z-index: 1;
      transition: color 0.2s;
    }

    .premium-input-wrapper:focus-within .premium-input-icon {
      color: #3E8FFF;
    }

    .premium-input {
      width: 100%;
      padding: 14px 48px 14px 48px;
      font-size: 15px;
      font-weight: 500;
      color: #1B1C1E;
      background: white;
      border: 2px solid rgba(226, 228, 232, 0.8);
      border-radius: 16px;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .premium-input:focus {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 4px rgba(62, 143, 255, 0.1);
      background: rgba(62, 143, 255, 0.02);
    }

    .premium-input::placeholder {
      color: #9CA3AF;
      font-weight: 400;
    }

    .input-clear-btn {
      position: absolute;
      right: 12px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 8px;
    }

    .input-clear-btn:hover {
      color: #EF4444;
      background: rgba(239, 68, 68, 0.06);
    }

    /* ========== LOCATION QUICK SELECT ========== */
    .location-quick-select {
      margin-top: 16px;
    }

    .quick-select-label {
      font-size: 12px;
      font-weight: 600;
      color: #6F7785;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .location-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .location-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 500;
      color: #6F7785;
      background: white;
      border: 1.5px solid rgba(226, 228, 232, 0.8);
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .location-pill:hover {
      border-color: #3E8FFF;
      color: #3E8FFF;
      background: rgba(62, 143, 255, 0.04);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.15);
    }

    .location-pill svg {
      width: 12px;
      height: 12px;
    }

    /* ========== PREMIUM CHIP GROUP ========== */
    .premium-chip-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .premium-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      color: #6F7785;
      background: white;
      border: 2px solid rgba(226, 228, 232, 0.8);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .premium-chip:hover {
      border-color: #3E8FFF;
      color: #3E8FFF;
      background: rgba(62, 143, 255, 0.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(62, 143, 255, 0.15);
    }

    .premium-chip.active {
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      border-color: transparent;
      box-shadow: 0 6px 24px rgba(62, 143, 255, 0.35);
      transform: translateY(-2px);
    }

    .premium-chip.active .chip-icon {
      color: white;
    }

    .chip-icon {
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .premium-chip:hover .chip-icon {
      transform: scale(1.1);
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 767px) {
      .filter-card {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
      
      .filter-card::before {
        border-radius: 0;
      }

      .filter-header {
        padding: 20px 20px;
      }

      .filter-section {
        padding: 0 20px;
      }

      .filter-divider {
        margin: 0 20px;
      }

      .active-filters-bar {
        padding: 14px 20px;
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
  @Output() filtersChange = new EventEmitter<void>();

  // Popular locations for quick selection
  popularLocations = ['Boston', 'New York', 'Berkeley', 'Stanford', 'MIT', 'Harvard'];

  // Section toggle states - Price and first section open by default
  sectionStates: { [key: string]: boolean } = {
    price: true,
    location: true,
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
    this.filtersChange.emit();
  }

  // Active filters management
  hasActiveFilters(): boolean {
    if (this.activeTab === 'rooms') {
      return (this.roomsFilters.price && this.roomsFilters.price < 5000) ||
             this.roomsFilters.place ||
             this.roomsFilters.type ||
             this.roomsFilters.property ||
             this.roomsFilters.amenities?.length > 0 ||
             this.roomsFilters.studentVerified ||
             this.roomsFilters.rating;
    } else if (this.activeTab === 'rides') {
      return this.ridesFilters.from ||
             this.ridesFilters.to ||
             this.ridesFilters.date ||
             this.ridesFilters.priceMax ||
             this.ridesFilters.seats ||
             this.ridesFilters.rating;
    } else if (this.activeTab === 'market') {
      return this.marketFilters.category ||
             this.marketFilters.maxPrice ||
             this.marketFilters.condition ||
             this.marketFilters.place ||
             this.marketFilters.seller;
    }
    return false;
  }

  getActiveFilterChips(): Array<{key: string, value: any, label: string}> {
    const chips: Array<{key: string, value: any, label: string}> = [];
    
    if (this.activeTab === 'rooms') {
      if (this.roomsFilters.price && this.roomsFilters.price < 5000) {
        chips.push({ key: 'price', value: 'price', label: `Up to $${this.roomsFilters.price}` });
      }
      if (this.roomsFilters.place) {
        chips.push({ key: 'place', value: 'place', label: this.roomsFilters.place });
      }
      if (this.roomsFilters.type) {
        chips.push({ key: 'type', value: 'type', label: this.roomsFilters.type });
      }
      if (this.roomsFilters.property) {
        chips.push({ key: 'property', value: 'property', label: this.roomsFilters.property });
      }
      if (this.roomsFilters.amenities?.length > 0) {
        this.roomsFilters.amenities.forEach((a: string) => {
          chips.push({ key: 'amenity', value: a, label: a });
        });
      }
      if (this.roomsFilters.studentVerified) {
        chips.push({ key: 'studentVerified', value: 'studentVerified', label: 'Student-Verified' });
      }
      if (this.roomsFilters.rating) {
        chips.push({ key: 'rating', value: 'rating', label: `${this.roomsFilters.rating}+ stars` });
      }
    }
    // Add similar logic for rides and market if needed
    
    return chips;
  }

  removeFilter(key: string, value: any) {
    if (this.activeTab === 'rooms') {
      if (key === 'price') {
        this.roomsFilters.price = 5000;
      } else if (key === 'place') {
        this.roomsFilters.place = '';
      } else if (key === 'type') {
        this.roomsFilters.type = '';
      } else if (key === 'property') {
        this.roomsFilters.property = '';
      } else if (key === 'amenity') {
        const i = this.roomsFilters.amenities.indexOf(value);
        if (i >= 0) this.roomsFilters.amenities.splice(i, 1);
      } else if (key === 'studentVerified') {
        this.roomsFilters.studentVerified = false;
      } else if (key === 'rating') {
        this.roomsFilters.rating = '';
      }
    }
    this.filtersChange.emit();
  }

  clearAllFilters() {
    if (this.activeTab === 'rooms') {
      this.roomsFilters.price = 5000;
      this.roomsFilters.priceMin = 0;
      this.roomsFilters.place = '';
      this.roomsFilters.type = '';
      this.roomsFilters.property = '';
      this.roomsFilters.amenities = [];
      this.roomsFilters.studentVerified = false;
      this.roomsFilters.rating = '';
    } else if (this.activeTab === 'rides') {
      this.ridesFilters.from = '';
      this.ridesFilters.to = '';
      this.ridesFilters.date = '';
      this.ridesFilters.time = '';
      this.ridesFilters.priceMax = null;
      this.ridesFilters.seats = 1;
      this.ridesFilters.rating = '';
    } else if (this.activeTab === 'market') {
      this.marketFilters.category = '';
      this.marketFilters.maxPrice = null;
      this.marketFilters.condition = '';
      this.marketFilters.place = '';
      this.marketFilters.seller = '';
    }
    this.filtersChange.emit();
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
