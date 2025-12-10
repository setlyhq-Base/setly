import { Component, signal, computed, HostListener, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FilterPanelComponent } from './components/filter-panel.component';
import { RoomResultCardComponent } from './components/room-result-card.component';
import { RideResultCardComponent } from './components/ride-result-card.component';
import { MarketResultCardComponent } from './components/market-result-card.component';
import { RideDetailModalComponent } from './components/ride-detail-modal.component';
import { RoomStore } from '../../core/state/room.store';
import { ActiveTabService } from '../../core/services/active-tab.service';
import { SharedDataService } from '../../core/services/shared-data.service';
import { FilterDrawerComponent } from '../connect/components/filter-drawer.component';
import { NotificationsDrawerComponent } from '../connect/components/notifications-drawer.component';
import { GlobalSearchOverlayComponent } from '../../shared/components/global-search-overlay.component';

// Search page with Premium Sticky Category Pills
@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FilterPanelComponent, RoomResultCardComponent, RideResultCardComponent, MarketResultCardComponent, RideDetailModalComponent, FilterDrawerComponent, NotificationsDrawerComponent, GlobalSearchOverlayComponent],
  template: `
  <main class="explore-page min-h-screen relative pb-20 md:pb-8">
      <!-- 🌟 Clean Minimal Background -->
      <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FAFBFF] via-white to-[#F8FAFF]"></div>
      </div>

      <!-- 🎯 Instagram-Style Sticky Top Bar (Utility Header) -->
      <div class="instagram-top-bar" [class.scrolled]="isScrolled()">
        <div class="top-bar-left">
          <button 
            (click)="toggleFilterDrawer()" 
            class="top-bar-action"
            aria-label="Filters">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          
          <button 
            class="top-bar-action"
            aria-label="Map view">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 2v16M16 6v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="header-logo-wrapper">
          <span class="setly-logo-text">
            <span class="logo-dots">
              <span class="logo-dot logo-dot-1"></span>
              <span class="logo-dot logo-dot-2"></span>
            </span>
            <span class="logo-wordmark">SETLY</span>
          </span>
        </div>
        
        <div class="top-bar-right">
          <button 
            (click)="searchOpen.set(true)" 
            class="top-bar-action"
            aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <button 
            (click)="toggleNotifications()" 
            class="top-bar-action notification-btn"
            aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="notification-badge" *ngIf="hasNotifications()">{{ notificationCount() }}</span>
          </button>
        </div>
      </div>

      <!-- ✨ Sticky Category Tab Bar (Directly Under Header) -->
      <section 
        #categoryPills
        class="category-tabs-section"
        [class.scrolled]="isScrolled()"
      >
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <div class="category-pills-container">
            <!-- Category Pills -->
            <div 
              class="category-pills"
              (touchstart)="onTouchStart($event)"
              (touchmove)="onTouchMove($event)"
              (touchend)="onTouchEnd($event)"
            >
              <!-- Background Slider -->
              <div 
                class="category-pill-slider" 
                [style.transform]="'translateX(' + getSliderPosition() + 'px)'"
                [style.width.px]="getSliderWidth()"
              ></div>

              <!-- Rooms Pill -->
              <button
                #roomsPill
                class="category-pill"
                [class.active]="activeTab() === 'rooms'"
                (click)="switchCategory('rooms')"
                type="button"
              >
                <svg class="pill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="pill-label">Rooms</span>
                <span class="pill-count" *ngIf="activeTab() === 'rooms'">{{ results().length }}</span>
              </button>

              <!-- Rides Pill -->
              <button
                #ridesPill
                class="category-pill"
                [class.active]="activeTab() === 'rides'"
                (click)="switchCategory('rides')"
                type="button"
              >
                <svg class="pill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 17h14M5 17l2-8h10l2 8M5 17H3m16 0h2M8.5 17v2M15.5 17v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="8.5" cy="19.5" r="1.5" fill="currentColor"/>
                  <circle cx="15.5" cy="19.5" r="1.5" fill="currentColor"/>
                </svg>
                <span class="pill-label">Rides</span>
                <span class="pill-count" *ngIf="activeTab() === 'rides'">{{ results().length }}</span>
              </button>

              <!-- Market Pill -->
              <button
                #marketPill
                class="category-pill"
                [class.active]="activeTab() === 'market'"
                (click)="switchCategory('market')"
                type="button"
              >
                <svg class="pill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="pill-label">Market</span>
                <span class="pill-count" *ngIf="activeTab() === 'market'">{{ results().length }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 🌟 Hero Tagline Section - Sticky with Fade -->
      <section class="hero-tagline-section" [class.scrolled]="isScrolled()">
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <div class="hero-content">
            <h1 class="hero-title">Find your next move</h1>
            <p class="hero-subtitle">Discover trusted rooms, instant rides, and connect with your community — all in one place.</p>
          </div>
        </div>
      </section>

      <!-- 🔍 Premium Mobile-First Search Bar (Priceline/Booking Style) -->
      <section class="premium-search-section">
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          
          <!-- Rooms Search Bar -->
          <div *ngIf="activeTab() === 'rooms'" class="premium-search-bar animate-fade-in">
            <!-- Location Field -->
            <button class="search-field" (click)="openLocationSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Around current location</div>
                <div class="field-value">{{ roomsSearchParams.location || 'Tap to select location' }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Date Range Field -->
            <button class="search-field" (click)="openDateRangeSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Check-in → Check-out</div>
                <div class="field-value">{{ getDateRangeText() }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Room Type Field -->
            <button class="search-field" (click)="openRoomTypeSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Room type</div>
                <div class="field-value">{{ getRoomTypeText() }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Search Button -->
            <button class="premium-search-btn" (click)="performSearch()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2.5"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>Search Rooms</span>
            </button>
          </div>

          <!-- Rides Search Bar -->
          <div *ngIf="activeTab() === 'rides'" class="premium-search-bar animate-fade-in">
            <!-- Pickup Field -->
            <button class="search-field" (click)="openPickupSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Pickup location</div>
                <div class="field-value">{{ ridesSearchParams.pickup || 'Where from?' }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Drop-off Field -->
            <button class="search-field" (click)="openDropoffSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Drop-off location</div>
                <div class="field-value">{{ ridesSearchParams.dropoff || 'Where to?' }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Date & Time Field -->
            <button class="search-field" (click)="openRideDateTimeSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Date & Time</div>
                <div class="field-value">{{ getRideDateTimeText() }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Search Button -->
            <button class="premium-search-btn" (click)="performSearch()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2.5"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>Search Rides</span>
            </button>
          </div>

          <!-- Marketplace Search Bar -->
          <div *ngIf="activeTab() === 'market'" class="premium-search-bar animate-fade-in">
            <!-- Category Field -->
            <button class="search-field" (click)="openCategorySheet(); $event.stopPropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Category</div>
                <div class="field-value">{{ getCategoryText() }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Location Field -->
            <button class="search-field" (click)="openLocationSheet(); $event.stopImmediatePropagation()">
              <div class="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="field-content">
                <div class="field-label">Around current location</div>
                <div class="field-value">{{ marketSearchParams.location || 'Tap to select location' }}</div>
              </div>
              <svg class="field-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Search Button -->
            <button class="premium-search-btn" (click)="performSearch()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2.5"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>Search Marketplace</span>
            </button>
          </div>

        </div>
      </section>

      <!-- 🎯 Bottom Sheets -->
      <!-- Location Bottom Sheet -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'location'" (click)="onOverlayClick($event)">
        <div class="bottom-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Select Location</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <button class="location-option current-location" (click)="useCurrentLocation()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Use current location</span>
            </button>
            <div class="location-search">
              <input type="text" placeholder="Search city or university..." class="location-input" [(ngModel)]="locationSearch">
            </div>
            <div class="location-suggestions">
              <button class="location-option" *ngFor="let loc of locationSuggestions" (click)="selectLocation(loc)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ loc }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Range Bottom Sheet -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'dateRange'" (mousedown)="onOverlayClick($event)">
        <div class="bottom-sheet large" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Select Dates</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <div class="date-range-picker">
              <p class="date-info">Select check-in and check-out dates</p>
              <div class="date-inputs">
                <div class="date-input-group">
                  <label>Check-in</label>
                  <input type="date" [(ngModel)]="roomsSearchParams.checkIn" class="date-input">
                </div>
                <div class="date-input-group">
                  <label>Check-out</label>
                  <input type="date" [(ngModel)]="roomsSearchParams.checkOut" class="date-input">
                </div>
              </div>
            </div>
            <button class="sheet-done-btn" (click)="closeBottomSheet()">Done</button>
          </div>
        </div>
      </div>

      <!-- Room Type Bottom Sheet -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'roomType'" (mousedown)="onOverlayClick($event)">
        <div class="bottom-sheet" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Room Type</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <button class="option-btn" [class.selected]="roomsSearchParams.roomType === ''" (click)="selectRoomType('')">Any Room</button>
            <button class="option-btn" [class.selected]="roomsSearchParams.roomType === 'private'" (click)="selectRoomType('private')">Private Room</button>
            <button class="option-btn" [class.selected]="roomsSearchParams.roomType === 'shared'" (click)="selectRoomType('shared')">Shared Room</button>
            <button class="option-btn" [class.selected]="roomsSearchParams.roomType === 'entire'" (click)="selectRoomType('entire')">Entire Place</button>
            <button class="sheet-done-btn" (click)="closeBottomSheet()">Done</button>
          </div>
        </div>
      </div>

      <!-- Category Bottom Sheet (Marketplace) -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'category'" (mousedown)="onOverlayClick($event)">
        <div class="bottom-sheet" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Category</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <button class="option-btn" [class.selected]="marketSearchParams.category === ''" (click)="selectCategory('')">All Categories</button>
            <button class="option-btn" [class.selected]="marketSearchParams.category === 'electronics'" (click)="selectCategory('electronics')">📱 Electronics</button>
            <button class="option-btn" [class.selected]="marketSearchParams.category === 'furniture'" (click)="selectCategory('furniture')">🛋️ Furniture</button>
            <button class="option-btn" [class.selected]="marketSearchParams.category === 'books'" (click)="selectCategory('books')">📚 Books</button>
            <button class="option-btn" [class.selected]="marketSearchParams.category === 'clothing'" (click)="selectCategory('clothing')">👕 Clothing</button>
            <button class="option-btn" [class.selected]="marketSearchParams.category === 'other'" (click)="selectCategory('other')">🔧 Other</button>
            <button class="sheet-done-btn" (click)="closeBottomSheet()">Done</button>
          </div>
        </div>
      </div>

      <!-- Pickup Location Bottom Sheet (Rides) -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'pickup'" (mousedown)="onOverlayClick($event)">
        <div class="bottom-sheet" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Pickup Location</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <button class="location-option current-location" (click)="useCurrentLocationForPickup()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Use current location</span>
            </button>
            <div class="location-search">
              <input type="text" placeholder="Search pickup location..." class="location-input" [(ngModel)]="locationSearch">
            </div>
            <div class="location-suggestions">
              <button class="location-option" *ngFor="let loc of locationSuggestions" (click)="selectPickupLocation(loc)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ loc }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Drop-off Location Bottom Sheet (Rides) -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'dropoff'" (mousedown)="onOverlayClick($event)">
        <div class="bottom-sheet" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Drop-off Location</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <div class="location-search">
              <input type="text" placeholder="Search destination..." class="location-input" [(ngModel)]="locationSearch">
            </div>
            <div class="location-suggestions">
              <button class="location-option" *ngFor="let loc of locationSuggestions" (click)="selectDropoffLocation(loc)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ loc }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ride Date & Time Bottom Sheet -->
      <div class="bottom-sheet-overlay" *ngIf="bottomSheet() === 'rideDateTime'" (mousedown)="onOverlayClick($event)">
        <div class="bottom-sheet large" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Select Date & Time</h3>
            <button class="sheet-close" (click)="closeBottomSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="sheet-content">
            <div class="date-range-picker">
              <p class="date-info">When do you need a ride?</p>
              <div class="date-inputs">
                <div class="date-input-group">
                  <label>Date</label>
                  <input type="date" [(ngModel)]="ridesSearchParams.date" class="date-input">
                </div>
                <div class="date-input-group">
                  <label>Time</label>
                  <input type="time" [(ngModel)]="ridesSearchParams.time" class="date-input">
                </div>
              </div>
            </div>
            <button class="sheet-done-btn" (click)="closeBottomSheet()">Done</button>
          </div>
        </div>
      </div>

      <!-- 📊 Results Section with Premium Layout -->
      <section class="relative max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-24">
        <div class="layout-container" [class.filters-visible]="!filtersHidden()" [class.mobile-filters-open]="mobileFiltersOpen()">
          
          <!-- 🎨 Left Sidebar - Premium Filter Panel (Desktop) -->
          <aside 
            id="filtersPanel" 
            class="filter-sidebar" 
            [class.visible]="!filtersHidden()" 
            [class.mobile-panel]="mobileFiltersOpen()" 
            aria-label="Filters" 
            [attr.role]="mobileFiltersOpen() ? 'dialog' : null" 
            [attr.aria-modal]="mobileFiltersOpen() ? 'true' : null" 
            tabindex="-1">
            <app-filter-panel
              [activeTab]="activeTab()"
              [roomsFilters]="roomsFilters()"
              [ridesFilters]="ridesFilters()"
              [marketFilters]="marketFilters()"
              [amenities]="amenities"
              [showClose]="mobileFiltersOpen()"
              (hide)="toggleFilters()"
              (close)="closeMobileFilters()"
              (filtersChange)="onFiltersChange()"
            />
          </aside>

          <!-- 📱 Right Content - Premium Results Grid -->
          <div class="results-container">

            <!-- Control Bar -->
            <div class="control-bar">
              <!-- Filter Buttons -->
              <div class="flex items-center gap-3">
                <button 
                  *ngIf="filtersHidden()" 
                  class="filter-button" 
                  (click)="toggleFilters()" 
                  aria-controls="filtersPanel" 
                  [attr.aria-expanded]="!filtersHidden()">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                  </svg>
                  <span class="hidden sm:inline">Show Filters</span>
                  <span class="sm:hidden">Filters</span>
                </button>
                <button 
                  *ngIf="!filtersHidden()" 
                  class="filter-button md:hidden" 
                  (click)="openMobileFilters()" 
                  aria-controls="filtersPanel" 
                  [attr.aria-expanded]="mobileFiltersOpen()">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                  </svg>
                  Filters
                </button>
              </div>

              <!-- Results Count & Sort -->
              <div class="control-bar-right">
                <div class="results-count">
                  <span class="font-bold text-gray-900">{{ results().length }}</span> 
                  <span class="hidden sm:inline">results</span>
                </div>
                <select class="sort-dropdown">
                  <option>Most relevant</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>

            <!-- Premium Results Grid with Animation -->
            <div *ngIf="!loading() && results().length > 0" class="results-grid animate-fade-in-up" [class.filters-visible]="!filtersHidden()" [class.loading]="loading()">
              <ng-container [ngSwitch]="activeTab()">
                <ng-container *ngSwitchCase="'rooms'">
                  <app-room-result-card 
                    *ngFor="let item of results(); trackBy: trackById" 
                    [item]="item"
                    [isSelected]="selectedCardId() === item.id"
                    (cardClick)="onRoomCardClick(item)"
                    class="animate-scale-in">
                  </app-room-result-card>
                </ng-container>
                <ng-container *ngSwitchCase="'rides'">
                  <app-ride-result-card 
                    *ngFor="let item of results(); trackBy: trackById" 
                    [item]="item"
                    [isSelected]="selectedCardId() === item.id"
                    (cardClick)="openRideModal(item)"
                    class="animate-scale-in">
                  </app-ride-result-card>
                </ng-container>
                <ng-container *ngSwitchCase="'market'">
                  <app-market-result-card 
                    *ngFor="let item of results(); trackBy: trackById" 
                    [item]="item"
                    [isSelected]="selectedCardId() === item.id"
                    (cardClick)="onMarketCardClick(item)"
                    class="animate-scale-in">
                  </app-market-result-card>
                </ng-container>
              </ng-container>
            </div>

            <!-- Premium Loading Skeletons -->
            <div *ngIf="loading()" class="results-grid" [class.filters-visible]="!filtersHidden()">
              <div *ngFor="let i of skeleton" class="group">
                <div class="rounded-3xl border-2 border-gray-100 bg-white shadow-lg overflow-hidden">
                  <div class="loading-shimmer w-full h-56 md:h-64 bg-gray-200"></div>
                  <div class="p-6 space-y-4">
                    <div class="loading-shimmer h-6 w-3/4 rounded-lg bg-gray-200"></div>
                    <div class="loading-shimmer h-4 w-full rounded bg-gray-200"></div>
                    <div class="loading-shimmer h-4 w-5/6 rounded bg-gray-200"></div>
                    <div class="flex justify-between items-center pt-2">
                      <div class="loading-shimmer h-10 w-10 rounded-full bg-gray-200"></div>
                      <div class="loading-shimmer h-9 w-24 rounded-xl bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Premium Empty State -->
            <div *ngIf="!loading() && results().length === 0" class="text-center py-32">
              <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">No {{ activeTab() }} found</h3>
              <p class="text-base text-gray-600 max-w-md mx-auto mb-6">
                Try adjusting your search or filters to discover more options.
              </p>
              <button 
                (click)="clearAllFilters()" 
                class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg">
                Clear all filters
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Ride Detail Modal -->
      <app-ride-detail-modal
        [ride]="selectedRide()"
        [isOpen]="isRideModalOpen()"
        (closeModal)="closeRideModal()">
      </app-ride-detail-modal>
      
      <!-- Filter Drawer (Bottom Sheet) -->
      <app-filter-drawer
        [isOpen]="filterDrawerOpen"
        (closed)="closeFilterDrawer()">
      </app-filter-drawer>
      
      <!-- Notifications Drawer -->
      <app-notifications-drawer
        *ngIf="notificationsOpen()"
        (close)="closeNotifications()">
      </app-notifications-drawer>
      
      <!-- Global Search Overlay -->
      <app-global-search-overlay
        *ngIf="searchOpen()"
        (close)="searchOpen.set(false)">
      </app-global-search-overlay>
   </main>`,
   styles: [ `
    /* 🎨 Premium Explore Page Styles */
    :host {
      --sticky-filter-offset: 140px;
      --filter-max-height-offset: 160px;
      --header-height: 56px;
    }

    * {
      scroll-behavior: smooth;
    }

    /* Premium Background */
    .explore-page { 
      background: linear-gradient(to bottom, #FAFBFF, #FFFFFF, #F8FAFF);
      position: relative;
      min-height: 100vh;
    }
    
    /* ========== INSTAGRAM-STYLE TOP BAR ========== */
    .instagram-top-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 2px 12px -4px rgba(0, 0, 0, 0.08);
      transition: box-shadow 0.3s ease, border-bottom-color 0.3s ease;
      will-change: transform;
    }

    .instagram-top-bar.scrolled {
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.12);
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .top-bar-left,
    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .page-title {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.5px;
      flex: 1;
      text-align: center;
    }
    
    .header-logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-width: 0;
    }

    .setly-logo-text{display:flex;align-items:center;gap:6px;font-weight:400;font-size:22px;letter-spacing:.05em;color:#111827}
    .logo-dots{display:inline-flex;position:relative;width:14px;height:18px;flex-shrink:0}
    .logo-dot{position:absolute;width:6px;height:6px;border-radius:50%;background-color:#4E7BFD}
    .logo-dot-1{top:0;right:0}
    .logo-dot-2{bottom:0;left:0}
    .logo-wordmark{font-weight:400;letter-spacing:.15em;color:#111827}
    @media (max-width:640px){.setly-logo-text{font-size:20px;gap:5px}.logo-dots{width:13px;height:16px}.logo-dot{width:5px;height:5px}}
    
    .top-bar-action {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .top-bar-action:active {
      transform: scale(0.9);
      background: #f3f4f6;
    }
    
    .top-bar-action svg {
      transition: all 0.2s;
    }
    
    .top-bar-action:hover svg {
      color: #3b82f6;
    }
    
    .notification-btn {
      position: relative;
    }
    
    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9px;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      border: 2px solid white;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes float{0%,100%{transform:translateY(0) translateX(0)}33%{transform:translateY(-15px) translateX(8px)}66%{transform:translateY(8px) translateX(-8px)}}
    @keyframes float-delayed{0%,100%{transform:translateY(0) translateX(0)}33%{transform:translateY(10px) translateX(-12px)}66%{transform:translateY(-8px) translateX(8px)}}
    .animate-float{animation:float 8s ease-in-out infinite}
    .animate-float-delayed{animation:float-delayed 10s ease-in-out infinite}
    @keyframes fade-in-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .animate-fade-in-up{animation:fade-in-up .6s ease-out forwards}
    .animation-delay-200{animation-delay:200ms}
    @keyframes scale-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    .animate-scale-in{animation:scale-in .3s ease-out forwards}

    /* ========== HERO TAGLINE SECTION - STICKY WITH FADE ========== */
    .hero-tagline-section {
      position: relative;
      z-index: auto;
      padding: 24px 0 20px;
      margin-top: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
      transition: opacity 0.3s ease, padding 0.3s ease, border-bottom-color 0.3s ease;
      opacity: 1;
    }

    .hero-tagline-section.scrolled {
      opacity: 0.75;
      padding: 18px 0 16px;
      border-bottom-color: rgba(0, 0, 0, 0.06);
    }

    .hero-content {
      text-align: center;
      max-width: 720px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 32px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 16px;
      font-weight: 400;
      color: #6B7280;
      margin: 0;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .hero-tagline-section {
        padding: 20px 0 16px;
      }

      .hero-tagline-section.scrolled {
        padding: 16px 0 14px;
        opacity: 0.7;
      }

      .hero-title {
        font-size: 26px;
        margin-bottom: 10px;
      }

      .hero-subtitle {
        font-size: 15px;
      }
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 24px;
      }

      .hero-subtitle {
        font-size: 14px;
      }
    }

    /* ========== SINGLE STICKY CATEGORY TAB BAR (Mobile-App Style) ========== */
    .category-tabs-section {
      position: sticky;
      top: 56px; /* Directly under header on mobile */
      left: 0;
      right: 0;
      z-index: 45; /* Above content, below header (50) */
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      padding: 12px 0;
      margin-bottom: 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 2px 12px -4px rgba(0, 0, 0, 0.08);
      transition: box-shadow 0.3s ease, border-bottom-color 0.3s ease;
      will-change: transform;
    }

    .category-tabs-section.scrolled {
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.12);
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }

    @media (min-width: 768px) {
      .category-tabs-section {
        top: 64px; /* Adjusted for desktop header */
      }
    }

    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .category-pills-container {
      position: relative;
      max-width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-pills {
      position: relative;
      display: flex;
      gap: 10px;
      padding: 8px;
      background: white;
      border-radius: 20px;
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      flex: 1;
      touch-action: pan-x;
    }

    .category-pills::-webkit-scrollbar {
      display: none;
    }

    /* Animated Slider Background */
    .category-pill-slider {
      position: absolute;
      height: calc(100% - 16px);
      top: 8px;
      left: 8px;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      border-radius: 16px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 6px 20px rgba(62, 143, 255, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.25) inset;
      z-index: 0;
    }

    .category-pill {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 13px 22px;
      background: transparent;
      border: none;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 600;
      color: #6F7785;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      z-index: 1;
      min-height: 46px; /* Touch-friendly */
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      letter-spacing: -0.01em;
    }

    .category-pill:active {
      transform: scale(0.97);
    }

    .category-pill:hover {
      color: #3E8FFF;
      transform: translateY(-1px);
    }

    .category-pill:active {
      transform: scale(0.95);
    }

    .category-pill.active {
      color: white;
      transform: scale(1.02);
    }

    .category-pill.active .pill-icon {
      color: white;
      transform: scale(1.05);
    }

    .pill-icon {
      flex-shrink: 0;
      color: currentColor;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pill-label {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .pill-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      color: white;
      animation: pill-count-entrance 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    @keyframes pill-count-entrance {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Swipe Indicator */
    .swipe-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%);
      border-radius: 50%;
      color: #3E8FFF;
      animation: pulse-swipe 2s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes pulse-swipe {
      0%, 100% {
        opacity: 0.6;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    /* ========== PREMIUM MOBILE-FIRST SEARCH BAR (Priceline/Booking Style) ========== */
    .premium-search-section {
      padding: 0 0 24px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
    }

    .premium-search-bar {
      background: white;
      border-radius: 24px;
      padding: 12px;
      box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      animation: fade-in 0.3s ease-out;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Search Field (Tappable) */
    .search-field {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border: 1.5px solid rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      user-select: none;
    }

    .search-field:last-of-type {
      margin-bottom: 12px;
    }

    .search-field:hover {
      border-color: rgba(0, 0, 0, 0.12);
      background: rgba(0, 0, 0, 0.01);
    }

    .search-field:active {
      transform: scale(0.99);
      background: rgba(0, 0, 0, 0.02);
    }

    .field-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.1) 0%, rgba(94, 163, 255, 0.05) 100%);
      border-radius: 12px;
      color: #3E8FFF;
      flex-shrink: 0;
    }

    .field-content {
      flex: 1;
      min-width: 0;
    }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      margin-bottom: 2px;
      letter-spacing: -0.01em;
    }

    .field-value {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .field-arrow {
      color: #9CA3AF;
      flex-shrink: 0;
    }

    /* Premium Search Button */
    .premium-search-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 16px rgba(62, 143, 255, 0.3);
    }

    .premium-search-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(62, 143, 255, 0.4);
    }

    .premium-search-btn:active {
      transform: translateY(0) scale(0.98);
    }

    /* ========== BOTTOM SHEETS ========== */
    .bottom-sheet-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
      animation: overlay-fade-in 0.3s ease-out;
    }

    @keyframes overlay-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .bottom-sheet {
      width: 100%;
      max-height: 75vh;
      background: white;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
      animation: sheet-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    .bottom-sheet.large {
      max-height: 85vh;
    }

    @keyframes sheet-slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .sheet-title {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .sheet-close {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      border-radius: 50%;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sheet-close:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #111827;
    }

    .sheet-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
    }

    /* Location Options */
    .current-location {
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.1) 0%, rgba(94, 163, 255, 0.05) 100%);
      border: 2px dashed #3E8FFF;
      margin-bottom: 16px;
    }

    .location-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border: 1.5px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      font-size: 15px;
      font-weight: 500;
      color: #111827;
    }

    .location-option:hover {
      border-color: #3E8FFF;
      background: rgba(62, 143, 255, 0.02);
    }

    .location-option svg { color: #6B7280; flex-shrink: 0; }
    .current-location svg { color: #3E8FFF; }
    .location-search { margin: 16px 0; }

    .location-input {
      width: 100%;
      padding: 14px 16px;
      border: 1.5px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      outline: none;
      transition: all 0.2s;
    }

    .location-input:focus {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.1);
    }

    .location-suggestions { margin-top: 16px; }

    /* Option Buttons (Room Type, Category) */
    .option-btn {
      width: 100%;
      padding: 16px 20px;
      background: white;
      border: 2px solid rgba(0, 0, 0, 0.08);
      border-radius: 14px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      text-align: left;
    }

    .option-btn:hover {
      border-color: #3E8FFF;
      background: rgba(62, 143, 255, 0.02);
    }

    .option-btn.selected {
      border-color: #3E8FFF;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.1) 0%, rgba(94, 163, 255, 0.05) 100%);
      color: #3E8FFF;
    }

    .option-btn:active { transform: scale(0.98); }

    /* Date Range Picker */
    .date-range-picker { padding: 20px 0; }
    .date-info { font-size: 14px; color: #6B7280; margin-bottom: 20px; text-align: center; }

    .date-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .date-input-group { display: flex; flex-direction: column; gap: 8px; }
    .date-input-group label { font-size: 13px; font-weight: 600; color: #374151; }

    .date-input {
      width: 100%;
      padding: 12px;
      border: 1.5px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      outline: none;
      transition: all 0.2s;
    }

    .date-input:focus {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.1);
    }

    /* Done Button */
    .sheet-done-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 12px;
      box-shadow: 0 4px 16px rgba(62, 143, 255, 0.3);
    }

    .sheet-done-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(62, 143, 255, 0.4); }
    .sheet-done-btn:active { transform: scale(0.98); }

    /* Compact mode for sticky pills */
    .category-pills-wrapper.is-compact .category-pill { padding: 10px 16px; }
    .category-pills-wrapper.is-compact .pill-label { font-size: 14px; }
    .category-pills-wrapper.is-compact .pill-icon { width: 16px; height: 16px; }

    /* ========== CONTROL BAR ========== */
    .control-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      margin-top: 16px;
      gap: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .control-bar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .filter-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      font-weight: 600;
      font-size: 14px;
      border: none;
      box-shadow: 
        0 4px 16px rgba(62, 143, 255, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 44px;
    }

    .filter-button:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 6px 24px rgba(62, 143, 255, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    }

    .filter-button:active {
      transform: translateY(0) scale(0.98);
    }

    .results-count {
      font-size: 14px;
      color: #6F7785;
      font-weight: 500;
    }

    .sort-dropdown {
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      color: #0A1A3F;
      background: white;
      border: 2px solid rgba(226, 228, 232, 0.8);
      border-radius: 14px;
      outline: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236F7785' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }

    .sort-dropdown:hover {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.1);
    }

    .sort-dropdown:focus {
      border-color: #3E8FFF;
      box-shadow: 0 0 0 4px rgba(62, 143, 255, 0.15);
    }

    /* Premium Layout Container */
    .layout-container {
      display: flex;
      gap: 32px;
      position: relative;
      align-items: flex-start;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Filter Sidebar - Sticky Premium Panel */
    .filter-sidebar {
      width: 0;
      flex-shrink: 0;
      overflow: hidden;
      opacity: 0;
      transform: translateX(-20px);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                  opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                  transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .filter-sidebar.visible {
      width: 300px;
      opacity: 1;
      transform: translateX(0);
      position: sticky;
      top: var(--sticky-filter-offset);
      align-self: flex-start;
      max-height: calc(100vh - var(--filter-max-height-offset));
      overflow-y: auto;
      will-change: transform;
      z-index: 10;
      scrollbar-width: thin;
      scrollbar-color: rgba(62, 143, 255, 0.3) transparent;
      display: flex;
      flex-direction: column;
    }

    .filter-sidebar.visible > * {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    /* Premium scrollbar */
    .filter-sidebar.visible::-webkit-scrollbar {
      width: 6px;
    }

    .filter-sidebar.visible::-webkit-scrollbar-track {
      background: transparent;
    }

    .filter-sidebar.visible::-webkit-scrollbar-thumb {
      background: rgba(62, 143, 255, 0.3);
      border-radius: 3px;
    }

    .filter-sidebar.visible::-webkit-scrollbar-thumb:hover {
      background: rgba(62, 143, 255, 0.5);
    }

    /* Results Container */
    .results-container {
      flex: 1;
      min-width: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Premium Results Grid - Mobile First */
    .results-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                  gap 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.2s ease-in-out;
      opacity: 1;
    }

    .results-grid.loading {
      opacity: 0.5;
    }

    /* Small screens (sm: 640px+) */
    @media (min-width: 640px) {
      .results-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }
    }

    /* Medium screens (md: 768px+) */
    @media (min-width: 768px) {
      .results-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 28px;
      }
      
      .results-grid.filters-visible {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    /* Large screens (lg: 1024px+) */
    @media (min-width: 1024px) {
      .results-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 28px;
      }
      
      .results-grid.filters-visible {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    /* Extra large screens (xl: 1280px+) */
    @media (min-width: 1280px) {
      .results-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 32px;
      }
      
      .results-grid.filters-visible {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 28px;
      }
    }

    /* Mobile Filters Overlay */
    .mobile-filters-open .mobile-panel { 
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 50;
      width: 300px;
      background: white;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow-y: auto;
      padding: 24px 20px 40px;
      border-right: 1px solid #E5E7EB;
      opacity: 1;
      transform: translateX(0);
    }
    
    .mobile-filters-open::before { 
      content: '';
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 40;
      display: none;
    }

    @media (max-width: 767px) {
      .filter-sidebar.visible {
        position: relative;
        width: 0;
        opacity: 0;
        transform: translateX(-20px);
        top: auto;
        max-height: none;
        z-index: auto;
      }

      .mobile-filters-open::before {
        display: block;
      }

      .results-grid {
        gap: 16px;
      }
    }

    /* Tablet adjustments */
    @media (min-width: 768px) and (max-width: 1023px) {
      :host {
        --sticky-filter-offset: 120px;
        --filter-max-height-offset: 140px;
      }
    }

    /* Loading shimmer effect */
    .loading-shimmer {
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        90deg,
        #f0f0f0 0%,
        #f8f8f8 50%,
        #f0f0f0 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Touch-friendly mobile adjustments */
    @media (max-width: 640px) {
      .layout-container {
        gap: 20px;
      }

      button {
        min-height: 44px; /* iOS touch target */
      }
    }

    /* High contrast focus states for accessibility */
    button:focus-visible {
      outline: 2px solid #3E8FFF;
      outline-offset: 2px;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Print styles */
    @media print {
      .filter-sidebar,
      button {
        display: none;
      }

      .results-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
    }
  ` ]
})
export class SearchPage implements AfterViewInit {
  private roomStore = inject(RoomStore);
  private activeTabService = inject(ActiveTabService);
  private sharedData = inject(SharedDataService);
  private router = inject(Router);
  
  // ViewChild references for category pills
  @ViewChild('categoryPills') categoryPillsElement!: ElementRef<HTMLDivElement>;
  @ViewChild('roomsPill') roomsPillElement!: ElementRef<HTMLButtonElement>;
  @ViewChild('ridesPill') ridesPillElement!: ElementRef<HTMLButtonElement>;
  @ViewChild('marketPill') marketPillElement!: ElementRef<HTMLButtonElement>;
  
  activeTab = signal<'rooms'|'rides'|'market'>('rooms');
  filtersHidden = signal(false);
  loading = signal(false);
  mobileFiltersOpen = signal(false);
  skeleton = Array.from({ length: 8 }, (_, i) => i);
  
  // Drawer states
  filterDrawerOpen = signal(false);
  notificationsOpen = signal(false);
  hasNotifications = signal(false);
  notificationCount = signal(0);
  searchOpen = signal(false);

  // Bottom sheet state
  bottomSheet = signal<'location' | 'dateRange' | 'roomType' | 'category' | 'pickup' | 'dropoff' | 'rideDateTime' | null>(null);
  private sheetJustOpened = false;
  
  locationSearch = '';
  locationSuggestions = [
    'Boston, MA',
    'New York, NY',
    'San Francisco, CA',
    'Los Angeles, CA',
    'Chicago, IL',
    'Austin, TX',
    'Seattle, WA',
    'Miami, FL'
  ];

  // Search params for minimal forms
  roomsSearchParams = {
    location: '',
    checkIn: '',
    checkOut: '',
    roomType: ''
  };
  
  ridesSearchParams = {
    pickup: '',
    dropoff: '',
    date: '',
    time: ''
  };
  
  marketSearchParams = {
    category: '',
    location: ''
  };

  // Sticky category pills state
  isSticky = signal(false);
  isScrolled = signal(false);
  showSwipeHint = signal(true);
  private pillsOriginalTop = 0;
  private scrollThreshold = 60; // Adjusted for new sticky header position

  // Swipe gesture state
  private touchStartX = 0;
  private touchStartY = 0;
  private swipeThreshold = 50;

  // Ride modal state
  isRideModalOpen = signal(false);
  selectedRide = signal<any>(null);
  
  // Selected card state for visual highlighting
  selectedCardId = signal<string | null>(null);

  // Convert filters to signals for reactive updates
  roomsFilters = signal({ price: 5000, priceMin: 0, place: '', type: '', property: '', amenities: [] as string[], studentVerified: false, rating: '' });
  ridesFilters = signal({ from: '', to: '', date: '', time: '', priceMax: 0, seats: 1, radius: 0, rating: '' });
  marketFilters = signal({ category: '', maxPrice: 0, condition: '', place: '', seller: '' });
  amenities = ['Wi-Fi','Laundry','Parking','Kitchen','AC'];

  // Use shared data service instead of local dummy data
  browseRoomItems = this.sharedData.rooms;
  rideResults = this.sharedData.rides;
  marketResults = this.sharedData.marketplace;

  ngAfterViewInit() {
    // Store original position of category pills
    if (this.categoryPillsElement) {
      setTimeout(() => {
        const rect = this.categoryPillsElement.nativeElement.getBoundingClientRect();
        this.pillsOriginalTop = rect.top + window.scrollY;
      }, 100);
    }

    // Hide swipe hint after 3 seconds
    setTimeout(() => {
      this.showSwipeHint.set(false);
    }, 3000);
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (!this.categoryPillsElement) return;

    const scrollPosition = window.scrollY;
    const shouldBeSticky = scrollPosition > this.scrollThreshold;
    
    // Set scrolled state for enhanced shadows (triggers at 20px)
    this.isScrolled.set(scrollPosition > 20);
    
    if (shouldBeSticky !== this.isSticky()) {
      this.isSticky.set(shouldBeSticky);
    }
  }

  // Get slider position based on active tab
  getSliderPosition(): number {
    if (!this.roomsPillElement || !this.ridesPillElement || !this.marketPillElement) {
      return 0;
    }

    const activeTab = this.activeTab();
    let element: HTMLButtonElement;

    switch (activeTab) {
      case 'rooms':
        element = this.roomsPillElement.nativeElement;
        break;
      case 'rides':
        element = this.ridesPillElement.nativeElement;
        break;
      case 'market':
        element = this.marketPillElement.nativeElement;
        break;
      default:
        return 0;
    }

    return element.offsetLeft;
  }

  // Get slider width based on active tab
  getSliderWidth(): number {
    if (!this.roomsPillElement || !this.ridesPillElement || !this.marketPillElement) {
      return 0;
    }

    const activeTab = this.activeTab();
    let element: HTMLButtonElement;

    switch (activeTab) {
      case 'rooms':
        element = this.roomsPillElement.nativeElement;
        break;
      case 'rides':
        element = this.ridesPillElement.nativeElement;
        break;
      case 'market':
        element = this.marketPillElement.nativeElement;
        break;
      default:
        return 100;
    }

    return element.offsetWidth;
  }

  // Switch category with smooth animation
  switchCategory(tab: 'rooms' | 'rides' | 'market') {
    if (this.activeTab() === tab) return;

    // Add fade-out effect
    this.loading.set(true);
    
    // Switch tab after brief delay for visual feedback
    setTimeout(() => {
      this.activeTab.set(tab);
      this.activeTabService.setActiveTab(tab);
      
      // Fade back in
      setTimeout(() => {
        this.loading.set(false);
      }, 150);
    }, 100);
  }

  // Touch event handlers for swipe gestures
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    // Prevent default to avoid scrolling while swiping
    const deltaX = Math.abs(event.touches[0].clientX - this.touchStartX);
    const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY);
    
    // Only prevent if horizontal swipe is more significant than vertical
    if (deltaX > deltaY && deltaX > 10) {
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = Math.abs(touchEndY - this.touchStartY);
    
    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > this.swipeThreshold && deltaY < 50) {
      const currentTab = this.activeTab();
      
      if (deltaX > 0) {
        // Swipe right - go to previous category
        if (currentTab === 'rides') {
          this.switchCategory('rooms');
        } else if (currentTab === 'market') {
          this.switchCategory('rides');
        }
      } else {
        // Swipe left - go to next category
        if (currentTab === 'rooms') {
          this.switchCategory('rides');
        } else if (currentTab === 'rides') {
          this.switchCategory('market');
        }
      }
    }
  }

  results = computed(() => {
    if (this.activeTab() === 'rooms') {
      const f = this.roomsFilters(); // Access signal value
      return this.browseRoomItems().filter(r => {
        // Price filter
        if (r.priceNum > (f.price || 99999)) return false;
        
        // Location filter
        if (f.place && !(r.location || '').toLowerCase().includes(f.place.toLowerCase()) &&
            !(r.city || '').toLowerCase().includes(f.place.toLowerCase()) &&
            !(r.university || '').toLowerCase().includes(f.place.toLowerCase())) {
          return false;
        }
        
        // Room type filter (shared/private)
        if (f.type && r.roomType !== f.type) return false;
        
        // Property type filter (Apartment/House/Dorm/Studio)
        if (f.property && r.propertyType !== f.property) return false;
        
        // Amenities filter - all selected amenities must be present
        if (f.amenities && f.amenities.length > 0) {
          const hasAllAmenities = f.amenities.every((a: string) => 
            (r.amenities || []).includes(a)
          );
          if (!hasAllAmenities) return false;
        }
        
        // Verification filter
        if (f.studentVerified && !r.verified) return false;
        
        // Rating filter
        if (f.rating && r.rating < parseInt(f.rating)) return false;
        
        return true;
      });
    }
    
    if (this.activeTab() === 'rides') {
      const f = this.ridesFilters(); // Access signal value
      return this.rideResults().filter(r => {
        // Route filters
        if (f.from && !(r.from || '').toLowerCase().includes(f.from.toLowerCase())) {
          return false;
        }
        if (f.to && !(r.to || '').toLowerCase().includes(f.to.toLowerCase())) {
          return false;
        }
        
        // Price filter
        if (f.priceMax && f.priceMax > 0 && r.priceNum > f.priceMax) {
          return false;
        }
        
        // Seats filter - check available seats
        if (f.seats && r.seatsAvailable < f.seats) return false;
        
        // Rating filter
        if (f.rating && r.rating < parseInt(f.rating)) return false;
        
        return true;
      });
    }
    
    // Marketplace filters
    const f = this.marketFilters(); // Access signal value
    return this.marketResults().filter(m => {
      // Category filter
      if (f.category && m.category !== f.category) return false;
      
      // Price filter
      if (f.maxPrice && f.maxPrice > 0 && m.priceNum > f.maxPrice) {
        return false;
      }
      
      // Condition filter
      if (f.condition && m.condition !== f.condition) return false;
      
      // Location filter
      if (f.place && !(m.place || m.location || '').toLowerCase().includes(f.place.toLowerCase())) {
        return false;
      }
      
      // Seller filter
      if (f.seller && !(m.seller || '').toLowerCase().includes(f.seller.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  });

  onTabChange(tab: 'rooms'|'rides'|'market'){ 
    this.activeTab.set(tab); 
    this.activeTabService.setActiveTab(tab); // Update global service
    this.loading.set(true); 
    setTimeout(()=> this.loading.set(false), 150); 
  }
  
  performSearch() {
    // Trigger search with current minimal form params
    const tab = this.activeTab();
    let payload: any = {};
    
    if (tab === 'rooms') {
      payload = { ...this.roomsSearchParams };
    } else if (tab === 'rides') {
      payload = { ...this.ridesSearchParams };
    } else if (tab === 'market') {
      payload = { ...this.marketSearchParams };
    }
    
    this.onSearch({ tab, mode: 'search', payload });
  }
  
  onSearch(ev: { tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }){
    this.activeTab.set(ev.tab);
    this.activeTabService.setActiveTab(ev.tab); // Update global service
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 600);
  }
  toggleFilters(){ this.filtersHidden.set(!this.filtersHidden()); }
  
  onFiltersChange() {
    // Trigger signal updates by creating new object references
    this.roomsFilters.set({ ...this.roomsFilters() });
    this.ridesFilters.set({ ...this.ridesFilters() });
    this.marketFilters.set({ ...this.marketFilters() });
  }
  
  toggleAmenity(a: string){ 
    const current = this.roomsFilters();
    const idx = current.amenities.indexOf(a);
    if (idx >= 0) {
      current.amenities.splice(idx, 1);
    } else {
      current.amenities.push(a);
    }
    // Trigger signal update
    this.roomsFilters.set({ ...current });
  }
  
  openMobileFilters(){ this.mobileFiltersOpen.set(true); }
  closeMobileFilters(){ this.mobileFiltersOpen.set(false); }

  // Clear all filters
  clearAllFilters() {
    this.roomsFilters.set({ 
      price: 5000,
      priceMin: 0,
      place: '', 
      type: '', 
      property: '', 
      amenities: [], 
      studentVerified: false, 
      rating: '' 
    });
    this.ridesFilters.set({ 
      from: '', 
      to: '', 
      date: '', 
      time: '', 
      priceMax: 0, 
      seats: 1, 
      radius: 0, 
      rating: '' 
    });
    this.marketFilters.set({ 
      category: '', 
      maxPrice: 0, 
      condition: '', 
      place: '', 
      seller: '' 
    });
  }

  // Track by function for performance
  trackById(index: number, item: any): string {
    return item.id || index;
  }

  // Ride modal methods
  openRideModal(ride: any) {
    this.selectedCardId.set(ride.id);
    this.selectedRide.set(ride);
    this.isRideModalOpen.set(true);
  }

  closeRideModal() {
    this.isRideModalOpen.set(false);
    // Clear selected card after animation completes
    setTimeout(() => {
      this.selectedCardId.set(null);
      this.selectedRide.set(null);
    }, 300);
  }
  
  // Filter drawer methods
  toggleFilterDrawer() {
    this.filterDrawerOpen.set(!this.filterDrawerOpen());
  }
  
  closeFilterDrawer() {
    this.filterDrawerOpen.set(false);
  }
  
  // Notifications methods
  toggleNotifications() {
    this.notificationsOpen.set(!this.notificationsOpen());
  }
  
  closeNotifications() {
    this.notificationsOpen.set(false);
  }
  
  // Room card click handler
  onRoomCardClick(room: any) {
    this.selectedCardId.set(room.id);
    console.log('Room card clicked:', room);
    // Navigate to room detail page
    this.router.navigate(['/listing', room.id]);
  }
  
  // Market card click handler
  onMarketCardClick(item: any) {
    this.selectedCardId.set(item.id);
    console.log('Market card clicked:', item);
    // Navigate to marketplace item detail page
    this.router.navigate(['/listing', item.id]);
  }

  // Bottom Sheet Methods
  openLocationSheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('location');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  openDateRangeSheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('dateRange');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  openRoomTypeSheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('roomType');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  openCategorySheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('category');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  openPickupSheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('pickup');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  openDropoffSheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('dropoff');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  openRideDateTimeSheet() {
    this.sheetJustOpened = true;
    this.bottomSheet.set('rideDateTime');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.sheetJustOpened = false, 300);
  }

  closeBottomSheet() {
    // Prevent closing if sheet just opened
    if (this.sheetJustOpened) {
      return;
    }
    
    this.bottomSheet.set(null);
    // Re-enable body scroll with slight delay to ensure cleanup
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }, 50);
  }

  onOverlayClick(event: MouseEvent | TouchEvent) {
    // Prevent closing if sheet just opened (prevents immediate close on touch devices)
    if (this.sheetJustOpened) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    // Only close if clicking directly on the overlay, not on child elements
    const target = event.target as HTMLElement;
    if (target.classList.contains('bottom-sheet-overlay')) {
      event.preventDefault();
      event.stopPropagation();
      this.closeBottomSheet();
    }
  }

  // Location Methods
  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In production, use reverse geocoding API to get city name
          const location = 'Current Location';
          if (this.activeTab() === 'rooms' || this.bottomSheet() === 'location') {
            this.roomsSearchParams.location = location;
          } else if (this.activeTab() === 'market') {
            this.marketSearchParams.location = location;
          }
          this.closeBottomSheet();
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    }
  }

  selectLocation(location: string) {
    if (this.activeTab() === 'rooms') {
      this.roomsSearchParams.location = location;
    } else if (this.activeTab() === 'market') {
      this.marketSearchParams.location = location;
    } else if (this.bottomSheet() === 'pickup') {
      this.ridesSearchParams.pickup = location;
    } else if (this.bottomSheet() === 'dropoff') {
      this.ridesSearchParams.dropoff = location;
    }
    this.closeBottomSheet();
  }

  selectPickupLocation(location: string) {
    this.ridesSearchParams.pickup = location;
    this.closeBottomSheet();
  }

  selectDropoffLocation(location: string) {
    this.ridesSearchParams.dropoff = location;
    this.closeBottomSheet();
  }

  useCurrentLocationForPickup() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
          this.ridesSearchParams.pickup = location;
          this.closeBottomSheet();
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    }
  }

  selectRoomType(type: string) {
    this.roomsSearchParams.roomType = type;
  }

  selectCategory(category: string) {
    this.marketSearchParams.category = category;
  }

  // Display Text Methods
  getDateRangeText(): string {
    const { checkIn, checkOut } = this.roomsSearchParams;
    if (checkIn && checkOut) {
      return `${checkIn} → ${checkOut}`;
    } else if (checkIn) {
      return `${checkIn} → Select check-out`;
    }
    return 'Select dates';
  }

  getRoomTypeText(): string {
    const types: any = {
      '': 'Any Room',
      'private': 'Private Room',
      'shared': 'Shared Room',
      'entire': 'Entire Place'
    };
    return types[this.roomsSearchParams.roomType] || 'Any Room';
  }

  getCategoryText(): string {
    const categories: any = {
      '': 'All Categories',
      'electronics': '📱 Electronics',
      'furniture': '🛋️ Furniture',
      'books': '📚 Books',
      'clothing': '👕 Clothing',
      'other': '🔧 Other'
    };
    return categories[this.marketSearchParams.category] || 'All Categories';
  }

  getRideDateTimeText(): string {
    const { date, time } = this.ridesSearchParams;
    if (date && time) {
      return `${date} at ${time}`;
    } else if (date) {
      return `${date} - Select time`;
    }
    return 'Select date & time';
  }

  @HostListener('document:keydown.escape')
  onEscape() { 
    if (this.mobileFiltersOpen()) this.mobileFiltersOpen.set(false);
    if (this.isRideModalOpen()) this.closeRideModal();
    if (this.bottomSheet()) this.closeBottomSheet();
  }
}
