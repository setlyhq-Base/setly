import { Component, signal, computed, HostListener, inject, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventCardComponent } from './components/event-card.component';
import { RestaurantCardComponent } from './components/restaurant-card.component';
import { PlaceCardComponent } from './components/place-card.component';
import { FilterDrawerComponent } from '../connect/components/filter-drawer.component';
import { NotificationsDrawerComponent } from '../connect/components/notifications-drawer.component';
import { GlobalSearchOverlayComponent } from '../../shared/components/global-search-overlay.component';
import { MapViewComponent } from '../connect/components/map-view.component';
import { ExploreDataService, ExploreItem } from '../../core/services/explore-data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    EventCardComponent,
    RestaurantCardComponent,
    PlaceCardComponent,
    FilterDrawerComponent,
    NotificationsDrawerComponent,
    GlobalSearchOverlayComponent,
    MapViewComponent
  ],
  template: `
  <main class="explore-page min-h-screen relative pb-20 md:pb-8">
      <!-- Clean Minimal Background -->
      <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FAFBFF] via-white to-[#F8FAFF]"></div>
      </div>

      <!-- Sticky Top Bar (Header) -->
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
            (click)="openMapView()"
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
          
          <a 
            routerLink="/messages"
            class="top-bar-action"
            aria-label="Messages">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Hero Section with Location & Categories -->
      <section class="hero-section" [class.scrolled]="isScrolled()">
        <div class="hero-content">
          <h1 class="hero-title">{{ heroTitle() }}</h1>
          <p class="hero-subtitle">{{ heroSubtitle() }}</p>
          
          <!-- Location Pill -->
          <button class="location-pill" (click)="openLocationSheet()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Near {{ selectedLocation() }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="chevron">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- Category Selector Bar (Sticky) -->
      <section class="category-bar" [class.scrolled]="isScrolled()">
        <div class="category-scroll" #categoryScroll>
          <button 
            *ngFor="let cat of categories()"
            class="category-chip"
            [class.active]="selectedCategory() === cat.id"
            (click)="selectCategory(cat.id)"
            [attr.data-category]="cat.id">
            <span class="category-emoji">{{ cat.emoji }}</span>
            <span class="category-label">{{ cat.label }}</span>
          </button>
        </div>
      </section>

      <!-- Main Content - Dynamic Netflix Style Rows -->
      <section class="events-feed">
        
        <!-- Dynamic Rows Based on Selected Category -->
        <div *ngFor="let row of currentCategoryRows()" class="feed-row">
          <div class="row-header">
            <h2 class="row-title">{{ row.emoji }} {{ row.title }}</h2>
            <button class="see-all-btn" (click)="openCategoryPage(row.id)">See all →</button>
          </div>
          <div class="row-scroll" data-scroll-snap="true">
            
            <!-- Restaurant Cards -->
            <ng-container *ngIf="selectedCategory() === 'restaurants'">
              <app-restaurant-card
                *ngFor="let item of row.events"
                [restaurant]="item"
                (cardClick)="openExploreDetail(item)">
              </app-restaurant-card>
            </ng-container>
            
            <!-- Event Cards (for events, trending events, music, etc.) -->
            <ng-container *ngIf="isEventCategory(selectedCategory())">
              <app-event-card
                *ngFor="let item of row.events"
                [event]="item"
                (cardClick)="openExploreDetail(item)">
              </app-event-card>
            </ng-container>
            
            <!-- Place Cards (for places, activities, nightlife, outdoor) -->
            <ng-container *ngIf="isPlaceCategory(selectedCategory())">
              <app-place-card
                *ngFor="let item of row.events"
                [place]="item"
                (cardClick)="openExploreDetail(item)">
              </app-place-card>
            </ng-container>
            
            <!-- Mixed Content (for 'all' category - use appropriate card per item) -->
            <ng-container *ngIf="selectedCategory() === 'all'">
              <app-event-card
                *ngFor="let item of row.events"
                [event]="item"
                (cardClick)="openExploreDetail(item)">
              </app-event-card>
            </ng-container>
            
          </div>
        </div>

      </section>

      <!-- Location Bottom Sheet -->
      <div *ngIf="locationSheetOpen()" class="location-bottom-sheet" (click)="closeLocationSheet()">
        <div class="location-sheet-content" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3>Choose Location</h3>
            <button class="close-btn" (click)="closeLocationSheet()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <!-- Search Input -->
          <div class="location-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="search-icon">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search for a city..." 
              [(ngModel)]="locationSearchQuery"
              (input)="onLocationSearchChange()"
              class="search-input">
            <button *ngIf="locationSearchQuery()" class="clear-search" (click)="clearLocationSearch()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="location-options">
            <!-- Current Location -->
            <button class="location-option current" (click)="useCurrentLocation()" [disabled]="isLoadingLocation()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
              <span>{{ isLoadingLocation() ? 'Getting location...' : 'Use Current Location' }}</span>
            </button>

            <!-- Search Results -->
            <div *ngIf="locationSearchQuery() && locationSearchResults().length > 0">
              <div class="section-title">Search Results</div>
              <button 
                *ngFor="let result of locationSearchResults()" 
                class="location-option"
                (click)="selectSearchResult(result)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="result-text">
                  <span class="result-main">{{ result.structured_formatting?.main_text || result.description.split(',')[0] }}</span>
                  <span class="result-secondary" *ngIf="result.structured_formatting?.secondary_text">
                    {{ result.structured_formatting.secondary_text }}
                  </span>
                </span>
              </button>
            </div>

            <!-- No Results State -->
            <div *ngIf="locationSearchQuery() && !isSearching() && locationSearchResults().length === 0" class="no-results-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="no-results-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p class="no-results-text">No cities found</p>
              <p class="no-results-hint">Try a different city name</p>
            </div>

            <!-- Searching State -->
            <div *ngIf="locationSearchQuery() && isSearching()" class="searching-state">
              <div class="spinner"></div>
              <span>Searching cities...</span>
            </div>

            <!-- Default Cities (shown when no search) -->
            <div *ngIf="!locationSearchQuery()">
              <div class="section-title">Nearby Cities</div>
              <button class="location-option" (click)="selectCity('Nashua, NH', 42.7654, -71.4676)">Nashua, NH</button>
              <button class="location-option" (click)="selectCity('Boston, MA', 42.3601, -71.0589)">Boston, MA</button>
              <button class="location-option" (click)="selectCity('Manchester, NH', 42.9956, -71.4548)">Manchester, NH</button>
              <button class="location-option" (click)="selectCity('Lowell, MA', 42.6334, -71.3162)">Lowell, MA</button>
              <div class="section-title">Popular Cities</div>
              <button class="location-option" (click)="selectCity('Cambridge, MA', 42.3736, -71.1097)">Cambridge, MA</button>
              <button class="location-option" (click)="selectCity('Portsmouth, NH', 43.0718, -70.7626)">Portsmouth, NH</button>
              <button class="location-option" (click)="selectCity('Salem, MA', 42.5195, -70.8967)">Salem, MA</button>
              <button class="location-option" (click)="selectCity('Providence, RI', 41.8240, -71.4128)">Providence, RI</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Drawer -->
      <app-filter-drawer
        [isOpen]="filterDrawerOpen"
        (closed)="closeFilterDrawer()">
      </app-filter-drawer>

      <!-- Map View -->
      <app-map-view
        *ngIf="mapViewOpen()"
        (close)="closeMapView()">
      </app-map-view>

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
    </main>
  `,
  styles: [`
    /* Page Layout */
    .events-page {
      min-height: 100vh;
      background: #FAFBFF;
    }

    /* Header - Sticky Top Bar */
    .instagram-top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
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
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .instagram-top-bar.scrolled {
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.12);
    }

    .top-bar-left,
    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-width: 0;
    }

    .setly-logo-text {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 400;
      font-size: 22px;
      letter-spacing: 0.05em;
      color: #111827;
    }

    .logo-dots {
      display: inline-flex;
      position: relative;
      width: 14px;
      height: 18px;
      flex-shrink: 0;
    }

    .logo-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #4E7BFD;
    }

    .logo-dot-1 {
      top: 0;
      right: 0;
    }

    .logo-dot-2 {
      bottom: 0;
      left: 0;
    }

    .logo-wordmark {
      font-weight: 400;
      letter-spacing: 0.15em;
      color: #111827;
    }
    
    @media (max-width: 640px) {
      .setly-logo-text {
        font-size: 20px;
        gap: 5px;
      }
      
      .logo-dots {
        width: 13px;
        height: 16px;
      }

      .logo-dot {
        width: 5px;
        height: 5px;
      }
    }

    .top-bar-action {
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
      transition: all 0.2s;
      position: relative;
    }

    .top-bar-action:active {
      transform: scale(0.9);
      background: #f3f4f6;
    }

    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9px;
      border: 2px solid white;
    }

    /* Hero Section */
    .hero-section {
      padding: 40px 20px 28px;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(250, 251, 255, 0.95));
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      margin-top: 0;
    }

    .hero-section.scrolled {
      padding: 28px 20px 24px;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .hero-title {
      font-size: 36px;
      font-weight: 900;
      color: #111827;
      margin: 0 0 12px 0;
      letter-spacing: -0.03em;
      line-height: 1.1;
      animation: fadeIn 0.3s ease-out;
    }

    .hero-subtitle {
      font-size: 17px;
      font-weight: 400;
      color: #6B7280;
      margin: 0 0 20px 0;
      line-height: 1.5;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
      animation: fadeIn 0.3s ease-out 0.1s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .location-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 50px;
      color: #374151;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .location-pill:hover {
      border-color: #3B82F6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      transform: translateY(-1px);
    }

    .location-pill .chevron {
      opacity: 0.5;
    }

    /* Category Bar - Sticky */
    .category-bar {
      position: sticky;
      top: 64px;
      z-index: 90;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      padding: 12px 0;
      overflow: hidden;
    }

    .category-bar.scrolled {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .category-scroll {
      display: flex;
      gap: 8px;
      padding: 0 20px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      scroll-behavior: smooth;
      scroll-snap-type: x proximity;
      -webkit-overflow-scrolling: touch;
    }

    .category-scroll::-webkit-scrollbar {
      display: none;
    }

    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 50px;
      color: #374151;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
      scroll-snap-align: start;
      -webkit-tap-highlight-color: transparent;
    }

    .category-chip:hover {
      border-color: #3B82F6;
      background: #EFF6FF;
      transform: translateY(-2px);
    }

    .category-chip:active {
      transform: scale(0.96);
    }

    .category-chip.active {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      border-color: #3B82F6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transform: scale(1.05);
    }

    .category-emoji {
      font-size: 16px;
    }

    /* Netflix-Style Feed Rows */
    .events-feed {
      padding: 24px 0 60px;
      margin-top: 0;
    }

    .feed-row {
      margin-bottom: 40px;
      animation: fadeInUp 0.4s ease-out;
    }

    .feed-row:last-child {
      margin-bottom: 24px;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .row-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px 12px 16px;
    }

    .row-title {
      font-size: 24px;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .see-all-btn {
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: #3B82F6;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      -webkit-tap-highlight-color: transparent;
    }

    .see-all-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      transform: translateX(2px);
    }

    .see-all-btn:active {
      transform: translateX(0) scale(0.95);
    }

    .row-scroll {
      display: flex;
      gap: 12px;
      padding: 0 16px 24px 16px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
      scroll-padding-left: 16px;
      scroll-padding-right: 16px;
    }

    .row-scroll::-webkit-scrollbar {
      display: none;
    }

    /* Card Sizing - Desktop */
    .row-scroll app-event-card,
    .row-scroll app-restaurant-card,
    .row-scroll app-place-card {
      flex: 0 0 280px;
      max-width: 280px;
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 28px;
      }

      .hero-subtitle {
        font-size: 15px;
      }

      .row-title {
        font-size: 20px;
      }

      .row-header {
        padding: 0 16px 10px 16px;
      }

      .row-scroll {
        gap: 10px;
        padding: 0 16px 20px 16px;
        scroll-padding-left: 16px;
      }

      .row-scroll app-event-card,
      .row-scroll app-restaurant-card,
      .row-scroll app-place-card {
        flex: 0 0 260px;
        max-width: 260px;
      }
    }

    /* Mobile - iPhone 14 Pro / Pixel 7 */
    @media (max-width: 480px) {
      .hero-section {
        padding: 24px 16px 20px;
      }

      .hero-title {
        font-size: 24px;
      }

      .hero-subtitle {
        font-size: 14px;
      }

      .category-bar {
        top: 60px;
      }

      .category-scroll {
        padding: 0 12px;
        gap: 6px;
      }

      .category-chip {
        padding: 8px 14px;
        font-size: 13px;
      }

      .row-header {
        padding: 0 12px 8px 12px;
      }

      .row-title {
        font-size: 18px;
      }

      .see-all-btn {
        font-size: 14px;
        padding: 6px 12px;
      }

      /* Mobile Card Sizing: 85% viewport width */
      .row-scroll {
        gap: 8px;
        padding: 0 12px 20px 12px;
        scroll-padding-left: 12px;
        scroll-padding-right: 12px;
      }

      .row-scroll app-event-card,
      .row-scroll app-restaurant-card,
      .row-scroll app-place-card {
        flex: 0 0 85vw;
        max-width: 360px;
      }
    }

    /* Extra small screens */
    @media (max-width: 380px) {
      .row-scroll app-event-card,
      .row-scroll app-restaurant-card,
      .row-scroll app-place-card {
        flex: 0 0 90vw;
        max-width: 300px;
      }
    }

    /* Location Bottom Sheet */
    .location-bottom-sheet{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.4);display:flex;align-items:flex-end;animation:fadeIn 0.2s ease;-webkit-tap-highlight-color:transparent}
    .location-sheet-content{width:100%;max-height:70vh;background:white;border-radius:24px 24px 0 0;padding:24px;animation:slideUp 0.3s ease;overflow-y:auto;touch-action:pan-y}
    .sheet-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
    .sheet-header h3{font-size:20px;font-weight:700;color:#111827;margin:0}
    .close-btn{background:none;border:none;color:#6B7280;cursor:pointer;padding:8px;border-radius:50%;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
    .close-btn:hover,.close-btn:active{background:#F3F4F6;color:#111827}
    .location-search{position:relative;margin-bottom:20px}
    .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#9CA3AF;pointer-events:none}
    .search-input{width:100%;padding:12px 40px 12px 44px;border:1.5px solid #E5E7EB;border-radius:12px;font-size:15px;font-weight:500;color:#111827;background:white;transition:all 0.2s}
    .search-input:focus{outline:none;border-color:#4E7BFD;background:#F8FAFF}
    .search-input::placeholder{color:#9CA3AF}
    .clear-search{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#9CA3AF;cursor:pointer;padding:4px;border-radius:50%;transition:all 0.2s}
    .clear-search:hover{background:#F3F4F6;color:#111827}
    .location-options{display:flex;flex-direction:column;gap:8px}
    .location-option{display:flex;align-items:center;gap:12px;padding:14px 16px;background:white;border:1.5px solid #E5E7EB;border-radius:12px;color:#374151;font-size:15px;font-weight:500;text-align:left;cursor:pointer;transition:all 0.2s;width:100%;-webkit-tap-highlight-color:transparent}
    .location-option:hover,.location-option:active{border-color:#4E7BFD;background:#F8FAFF;color:#4E7BFD}
    .location-option:disabled{opacity:0.6;cursor:not-allowed}
    .location-option.current{background:linear-gradient(135deg,#4E7BFD 0%,#6B8FFF 100%);border-color:#4E7BFD;color:white}
    .result-text{display:flex;flex-direction:column;gap:2px;flex:1}
    .result-main{font-size:15px;font-weight:600;color:#111827}
    .result-secondary{font-size:13px;font-weight:400;color:#6B7280}
    .no-results-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center}
    .no-results-icon{color:#D1D5DB;margin-bottom:16px}
    .no-results-text{font-size:16px;font-weight:600;color:#374151;margin:0 0 8px 0}
    .no-results-hint{font-size:14px;color:#9CA3AF;margin:0}
    .section-title{font-size:13px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin:16px 0 8px;padding:0 4px}
    .searching-state{display:flex;align-items:center;justify-content:center;gap:12px;padding:20px;color:#6B7280;font-size:14px}
    .spinner{width:20px;height:20px;border:2px solid #E5E7EB;border-top-color:#4E7BFD;border-radius:50%;animation:spin 0.8s linear infinite}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
  `]
})
export class ExplorePageComponent implements AfterViewInit, OnInit, OnDestroy {
  private router = inject(Router);
  private exploreDataService = inject(ExploreDataService);
  private destroy$ = new Subject<void>();
  @ViewChild('categoryScroll') categoryScroll?: ElementRef;
  
  // UI State
  isScrolled = signal(false);
  filterDrawerOpen = signal(false);
  notificationsOpen = signal(false);
  searchOpen = signal(false);
  locationSheetOpen = signal(false);
  mapViewOpen = signal(false);
  selectedLocation = signal('Nashua, NH');
  locationSearchQuery = signal('');
  locationSearchResults = signal<any[]>([]);
  isSearching = signal(false);
  isLoadingLocation = signal(false);
  selectedCategory = signal('all');
  isLoading = signal(false);
  userLocation = signal<{ lat: number; lng: number }>({ lat: 42.7654, lng: -71.4676 });
  
  // Dynamic Hero Content based on Category
  heroTitle = computed(() => {
    const category = this.selectedCategory();
    const location = this.selectedLocation();
    
    switch (category) {
      case 'all':
        return `Discover what's around ${location}`;
      case 'events':
        return `Events Near ${location}`;
      case 'restaurants':
        return `Restaurants Near ${location}`;
      case 'places':
        return `Places Near ${location}`;
      case 'activities':
        return `Activities Near ${location}`;
      case 'nightlife':
        return `Nightlife Near ${location}`;
      case 'trending':
        return `Trending Near ${location}`;
      case 'student':
        return `Student Picks Near ${location}`;
      case 'deals':
        return `Deals Near ${location}`;
      case 'outdoor':
        return `Outdoor Near ${location}`;
      default:
        return `Discover ${location}`;
    }
  });

  heroSubtitle = computed(() => {
    const category = this.selectedCategory();
    const location = this.selectedLocation();
    switch (category) {
      case 'all':
        return 'Top-rated events, restaurants, and activities. Only the best, most popular spots.';
      case 'events':
        return 'Verified events from Ticketmaster & Eventbrite. Live concerts, festivals, and entertainment.';
      case 'restaurants':
        return `Top-rated restaurants (4.2+ stars) near ${location}. Only popular, verified spots with great reviews.`;
      case 'places':
        return 'Highest-rated attractions, museums, and landmarks. Curated for quality and popularity.';
      case 'activities':
        return 'Top-rated fitness, gaming, and entertainment. Only the most popular activities near you.';
      case 'nightlife':
        return 'Best clubs, bars, and music venues. Premium nightlife spots with great reviews.';
      case 'trending':
        return 'What\'s hot right now. The most popular events, restaurants, and activities.';
      case 'student':
        return 'Student-friendly picks: top-rated hangouts, events, and budget spots with great reviews.';
      case 'deals':
        return 'Best value: free events, student discounts, and highly-rated budget options.';
      case 'outdoor':
        return 'Top-rated parks, trails, and outdoor activities. Only the best nature spots.';
      default:
        return 'Premium, verified experiences. Only the best places with great ratings & reviews.';
    }
  });
  
  // Categories
  categories = signal([
    { id: 'all', emoji: '✨', label: 'All' },
    { id: 'events', emoji: '🎉', label: 'Events' },
    { id: 'restaurants', emoji: '🍽️', label: 'Restaurants' },
    { id: 'places', emoji: '📍', label: 'Places' },
    { id: 'activities', emoji: '🎯', label: 'Activities' },
    { id: 'nightlife', emoji: '🌙', label: 'Nightlife' },
    { id: 'trending', emoji: '🔥', label: 'Trending' },
    { id: 'student', emoji: '🎓', label: 'Student Picks' },
    { id: 'deals', emoji: '💰', label: 'Deals' },
    { id: 'outdoor', emoji: '🌲', label: 'Outdoor' }
  ]);
  
  // Real-Time Data Signals (initialized as empty, populated via API)
  trendingEvents = signal<ExploreItem[]>([]);
  careerEvents = signal<ExploreItem[]>([]);
  partyEvents = signal<ExploreItem[]>([]);
  musicEvents = signal<ExploreItem[]>([]);
  workshopEvents = signal<ExploreItem[]>([]);
  campusEvents = signal<ExploreItem[]>([]);
  wellnessEvents = signal<ExploreItem[]>([]);
  sportsEvents = signal<ExploreItem[]>([]);
  activityEvents = signal<ExploreItem[]>([]);
  outdoorEvents = signal<ExploreItem[]>([]);
  dealEvents = signal<ExploreItem[]>([]);
  studentPickEvents = signal<ExploreItem[]>([]);
  
  // Restaurant Data
  restaurantsTrending = signal<ExploreItem[]>([]);
  restaurantsMustTry = signal<ExploreItem[]>([]);
  restaurantsBudget = signal<ExploreItem[]>([]);
  restaurantsDesserts = signal<ExploreItem[]>([]);
  indianRestaurants = signal<ExploreItem[]>([]);
  topRatedRestaurants = signal<ExploreItem[]>([]);
  openNowRestaurants = signal<ExploreItem[]>([]);
  
  // Places Data
  placesPopular = signal<ExploreItem[]>([]);
  placesScenic = signal<ExploreItem[]>([]);
  placesLandmarks = signal<ExploreItem[]>([]);
  placesHiddenGems = signal<ExploreItem[]>([]);
  
  // Activities Data  
  activitiesFitness = signal<ExploreItem[]>([]);
  activitiesGaming = signal<ExploreItem[]>([]);
  activitiesCreative = signal<ExploreItem[]>([]);
  
  // Nightlife Data
  nightlifeTrending = signal<ExploreItem[]>([]);
  nightlifeBars = signal<ExploreItem[]>([]);
  nightlifeLiveMusic = signal<ExploreItem[]>([]);

  // ============================================
  // COMPUTED: Dynamic Category Rows
  // ============================================

  // Minimum number of items required to show a row
  // SECTION 1.4 & SECTION 10 - Hide sections with insufficient results
  private readonly MIN_ROW_ITEMS = 3; // Per user requirement: if section has < 3 results, don't show it

  /**
   * Filter rows to only show those with sufficient high-quality content
   * Never show empty or weak rows to maintain trust and polish
   */
  private filterRowsByQuality(rows: Array<{ id: string; emoji: string; title: string; events: ExploreItem[] }>): Array<{ id: string; emoji: string; title: string; events: ExploreItem[] }> {
    return rows.filter(row => row.events.length >= this.MIN_ROW_ITEMS);
  }

  currentCategoryRows = computed(() => {
    const category = this.selectedCategory();
    const location = this.selectedLocation();

    switch (category) {
      case 'all':
        const allRows = [
          { id: 'trending', emoji: '🎆', title: `Trending Near ${location}`, events: this.trendingEvents() },
          { id: 'career', emoji: '💼', title: `Career & Tech Events Near ${location}`, events: this.careerEvents() },
          { id: 'nightlife', emoji: '🎉', title: `Parties & Nightlife Near ${location}`, events: this.partyEvents() },
          { id: 'music', emoji: '🎵', title: `Live Music & Concerts Near ${location}`, events: this.musicEvents() },
          { id: 'workshops', emoji: '📚', title: `Workshops & Study Events Near ${location}`, events: this.workshopEvents() },
          { id: 'campus', emoji: '📍', title: `Campus Events Near ${location}`, events: this.campusEvents() },
          { id: 'wellness', emoji: '🧘', title: `Wellness & Fitness Near ${location}`, events: this.wellnessEvents() },
          { id: 'sports', emoji: '🏀', title: `Sports & Tournaments Near ${location}`, events: this.sportsEvents() },
          { id: 'activities', emoji: '🎯', title: `Activities & Adventures Near ${location}`, events: this.activityEvents() },
          { id: 'outdoor', emoji: '🌲', title: `Outdoor & Nature Near ${location}`, events: this.outdoorEvents() },
          { id: 'deals', emoji: '💰', title: `Deals & Free Events Near ${location}`, events: this.dealEvents() },
          { id: 'student', emoji: '🎓', title: `Student Picks Near ${location}`, events: this.studentPickEvents() }
        ];
        return this.filterRowsByQuality(allRows);

      case 'events':
        const eventRows = [
          { id: 'trending-events', emoji: '🔥', title: `Trending Events Near ${location}`, events: this.trendingEvents() },
          { id: 'career', emoji: '💼', title: `Career & Tech Events Near ${location}`, events: this.careerEvents() },
          { id: 'nightlife', emoji: '🎉', title: `Parties & Nightlife Events Near ${location}`, events: this.partyEvents() },
          { id: 'music', emoji: '🎵', title: `Live Concerts Near ${location}`, events: this.musicEvents() },
          { id: 'workshops', emoji: '📚', title: `Workshops & Meetups Near ${location}`, events: this.workshopEvents() },
          { id: 'campus', emoji: '📍', title: `Student Events Near ${location}`, events: this.campusEvents() },
          { id: 'sports', emoji: '🏀', title: `Sports Events Near ${location}`, events: this.sportsEvents() }
        ];
        return this.filterRowsByQuality(eventRows);

      case 'restaurants':
        const restaurantRows = [
          { id: 'restaurants-trending', emoji: '🔥', title: `Trending Restaurants Near ${location}`, events: this.restaurantsTrending() },
          { id: 'indian', emoji: '🍛', title: `Top-Rated Indian Restaurants Near ${location}`, events: this.indianRestaurants() },
          { id: 'top-rated', emoji: '⭐', title: `Highest Rated Near ${location}`, events: this.topRatedRestaurants() },
          { id: 'open-now', emoji: '✅', title: `Open Now • Popular Near ${location}`, events: this.openNowRestaurants() },
          { id: 'budget-eats', emoji: '💵', title: `Best Budget-Friendly Spots Near ${location}`, events: this.restaurantsBudget() },
          { id: 'desserts', emoji: '🧁', title: `Best Desserts & Cafes Near ${location}`, events: this.restaurantsDesserts() }
        ];
        return this.filterRowsByQuality(restaurantRows);

      case 'places':
        const placesRows = [
          { id: 'places-popular', emoji: '📍', title: `Most Popular Places Near ${location}`, events: this.placesPopular() },
          { id: 'scenic', emoji: '🏞️', title: `Beautiful Scenic Spots Near ${location}`, events: this.placesScenic() },
          { id: 'outdoor-places', emoji: '🌲', title: `Outdoor Adventures Near ${location}`, events: this.outdoorEvents() },
          { id: 'landmarks', emoji: '🏛️', title: `Top Landmarks & Museums Near ${location}`, events: this.placesLandmarks() },
          { id: 'student-favorites', emoji: '🎓', title: `Student Favorites Near ${location}`, events: this.studentPickEvents() },
          { id: 'weekend', emoji: '🗓️', title: `Must-Visit This Weekend Near ${location}`, events: this.placesPopular() },
          { id: 'hidden-gems', emoji: '💎', title: `Hidden Gems Near ${location}`, events: this.placesHiddenGems() }
        ];
        return this.filterRowsByQuality(placesRows);

      case 'activities':
        const activityRows = [
          { id: 'activities-fun', emoji: '🎯', title: `Most Popular Activities Near ${location}`, events: this.activityEvents() },
          { id: 'fitness', emoji: '💪', title: `Top Fitness & Wellness Near ${location}`, events: this.activitiesFitness() },
          { id: 'adventure', emoji: '🧗', title: `Adventure Sports Near ${location}`, events: this.outdoorEvents() },
          { id: 'gaming', emoji: '🎮', title: `Gaming & Arcades Near ${location}`, events: this.activitiesGaming() },
          { id: 'theaters', emoji: '🎬', title: `Movie Theaters & Shows Near ${location}`, events: this.musicEvents() },
          { id: 'group', emoji: '👥', title: `Best Group Activities Near ${location}`, events: this.activityEvents() },
          { id: 'creative', emoji: '🎨', title: `Creative Workshops Near ${location}`, events: this.activitiesCreative() }
        ];
        return this.filterRowsByQuality(activityRows);

      case 'nightlife':
        const nightlifeRows = [
          { id: 'nightlife-trending', emoji: '🔥', title: `Hottest Nightlife Near ${location}`, events: this.nightlifeTrending() },
          { id: 'clubs', emoji: '💃', title: `Top Clubs & Dancing Near ${location}`, events: this.nightlifeTrending() },
          { id: 'bars', emoji: '🍻', title: `Best Bars & Pubs Near ${location}`, events: this.nightlifeBars() },
          { id: 'live-music-night', emoji: '🎸', title: `Live Music Venues Near ${location}`, events: this.nightlifeLiveMusic() },
          { id: 'parties', emoji: '🎉', title: `Parties & Events Near ${location}`, events: this.partyEvents() },
          { id: 'lounges', emoji: '🍸', title: `Premium Cocktail Lounges Near ${location}`, events: this.nightlifeTrending() }
        ];
        return this.filterRowsByQuality(nightlifeRows);

      case 'trending':
        const trendingRows = [
          { id: 'trending-all', emoji: '🔥', title: `Trending Near ${location}`, events: this.trendingEvents() },
          { id: 'trending-events', emoji: '🎉', title: 'Trending Events', events: this.partyEvents() },
          { id: 'trending-food', emoji: '🍽️', title: 'Trending Restaurants', events: this.restaurantsTrending() },
          { id: 'trending-nightlife', emoji: '🌙', title: 'Trending Nightlife', events: this.nightlifeTrending() },
          { id: 'trending-activities', emoji: '🎯', title: 'Trending Activities', events: this.activityEvents() }
        ];
        return this.filterRowsByQuality(trendingRows);

      case 'student':
        const studentRows = [
          { id: 'student-picks', emoji: '🎓', title: `Student Picks Near ${location}`, events: this.studentPickEvents() },
          { id: 'campus-events', emoji: '📍', title: 'Campus Events', events: this.campusEvents() },
          { id: 'budget-student', emoji: '💵', title: 'Budget-Friendly', events: this.restaurantsBudget() },
          { id: 'study-events', emoji: '📚', title: 'Study & Workshops', events: this.workshopEvents() },
          { id: 'social-student', emoji: '🎮', title: 'Social & Gaming', events: this.activityEvents() }
        ];
        return this.filterRowsByQuality(studentRows);

      case 'deals':
        const dealsRows = [
          { id: 'deals-free', emoji: '💰', title: `Deals & Free Near ${location}`, events: this.dealEvents() },
          { id: 'free-events', emoji: '🎁', title: 'Free Events', events: this.dealEvents() },
          { id: 'student-discounts', emoji: '🎓', title: 'Student Discounts', events: this.restaurantsBudget() },
          { id: 'happy-hours', emoji: '🍻', title: 'Happy Hours', events: this.nightlifeBars() }
        ];
        return this.filterRowsByQuality(dealsRows);

      case 'outdoor':
        const outdoorRows = [
          { id: 'outdoor-trending', emoji: '🌲', title: `Outdoor Near ${location}`, events: this.outdoorEvents() },
          { id: 'hiking', emoji: '🥾', title: 'Hiking & Trails', events: this.outdoorEvents() },
          { id: 'parks', emoji: '🌳', title: 'Parks & Gardens', events: this.placesScenic() },
          { id: 'water-sports', emoji: '🚣', title: 'Water Activities', events: this.outdoorEvents() },
          { id: 'nature', emoji: '🦋', title: 'Nature & Wildlife', events: this.placesScenic() }
        ];
        return this.filterRowsByQuality(outdoorRows);

      default:
        return [
          { id: 'trending', emoji: '🎆', title: `Trending Near ${location}`, events: this.trendingEvents() }
        ];
    }
  });

  ngOnInit() {
    // Initialize user location and load data
    this.initializeLocation();
  }

  ngAfterViewInit() {
    // Initialize category scroll
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeLocation() {
    try {
      const location = await this.exploreDataService.getCurrentLocation();
      this.userLocation.set({ lat: location.lat, lng: location.lng });
      this.selectedLocation.set(location.city);
      this.loadAllData();
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default location
      this.loadAllData();
    }
  }

  private loadAllData() {
    this.isLoading.set(true);
    
    // Clear deduplication cache for fresh data load
    this.exploreDataService.clearDeduplication();
    
    const location = this.userLocation();

    // Load trending (mixed content)
    this.exploreDataService.getTrendingNearby(location)
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => this.trendingEvents.set(items));

    // Load all categories in parallel
    this.loadCategoryData('restaurants', location);
    this.loadCategoryData('places', location);
    this.loadCategoryData('activities', location);
    this.loadCategoryData('nightlife', location);
    this.loadCategoryData('outdoor', location);
    this.loadCategoryData('events', location);

    setTimeout(() => this.isLoading.set(false), 1000);
  }

  private loadCategoryData(category: string, location: { lat: number; lng: number }) {
    // Use dedicated events API for events category
    if (category === 'events') {
      this.exploreDataService.getEvents(location)
        .pipe(takeUntil(this.destroy$))
        .subscribe(items => {
          this.careerEvents.set(items.filter(i => i.tag.toLowerCase().includes('career') || i.title.toLowerCase().includes('career')).slice(0, 10));
          this.musicEvents.set(items.filter(i => i.tag.toLowerCase().includes('music') || i.title.toLowerCase().includes('concert')).slice(0, 10));
          this.workshopEvents.set(items.filter(i => i.tag.toLowerCase().includes('workshop') || i.title.toLowerCase().includes('workshop')).slice(0, 10));
          this.campusEvents.set(items.filter(i => i.tag.toLowerCase().includes('campus') || i.location.toLowerCase().includes('university')).slice(0, 10));
          this.wellnessEvents.set(items.filter(i => i.tag.toLowerCase().includes('wellness') || i.title.toLowerCase().includes('yoga')).slice(0, 10));
          this.sportsEvents.set(items.filter(i => i.tag.toLowerCase().includes('sports') || i.title.toLowerCase().includes('game')).slice(0, 10));
          this.dealEvents.set(items.filter(i => i.isFree || i.price < 10).slice(0, 10));
          this.studentPickEvents.set(items.slice(0, 10));
        });
      return;
    }

    // Use Google Places for other categories
    this.exploreDataService.getNearbyPlaces(category, location)
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        switch (category) {
          case 'restaurants':
            this.restaurantsTrending.set(items.slice(0, 10));
            this.restaurantsMustTry.set(items.filter(i => i.rating && i.rating >= 4.5).slice(0, 10));
            this.restaurantsBudget.set(items.filter(i => i.price <= 15).slice(0, 10));
            this.restaurantsDesserts.set(items.filter(i => 
              i.title.toLowerCase().includes('dessert') ||
              i.title.toLowerCase().includes('bakery') ||
              i.title.toLowerCase().includes('ice cream')
            ).slice(0, 10));
            
            // Load Indian restaurants separately
            this.exploreDataService.getIndianRestaurants(location)
              .pipe(takeUntil(this.destroy$))
              .subscribe(indianItems => this.indianRestaurants.set(indianItems.slice(0, 10)));
            
            // Load top rated restaurants
            this.exploreDataService.getTopRatedRestaurants(location)
              .pipe(takeUntil(this.destroy$))
              .subscribe(topItems => this.topRatedRestaurants.set(topItems.slice(0, 10)));
            
            // Load open now restaurants
            this.exploreDataService.getOpenNowRestaurants(location)
              .pipe(takeUntil(this.destroy$))
              .subscribe(openItems => this.openNowRestaurants.set(openItems.slice(0, 10)));
            break;
          case 'places':
            this.placesPopular.set(items.slice(0, 10));
            this.placesScenic.set(items.filter(i =>
              i.title.toLowerCase().includes('park') ||
              i.title.toLowerCase().includes('garden') ||
              i.title.toLowerCase().includes('view')
            ).slice(0, 10));
            this.placesLandmarks.set(items.filter(i =>
              i.title.toLowerCase().includes('museum') ||
              i.title.toLowerCase().includes('landmark')
            ).slice(0, 10));
            this.placesHiddenGems.set(items.slice(7, 15));
            break;
          case 'activities':
            this.activityEvents.set(items.slice(0, 10));
            this.activitiesFitness.set(items.filter(i =>
              i.title.toLowerCase().includes('gym') ||
              i.title.toLowerCase().includes('fitness') ||
              i.title.toLowerCase().includes('yoga')
            ).slice(0, 10));
            this.activitiesGaming.set(items.filter(i => 
              i.title.toLowerCase().includes('arcade') ||
              i.title.toLowerCase().includes('game')
            ).slice(0, 10));
            this.activitiesCreative.set(items.slice(5, 10));
            break;
          case 'nightlife':
            this.nightlifeTrending.set(items.slice(0, 10));
            this.nightlifeBars.set(items.filter(i => 
              i.title.toLowerCase().includes('bar') ||
              i.title.toLowerCase().includes('pub')
            ).slice(0, 10));
            this.nightlifeLiveMusic.set(items.slice(3, 8));
            this.partyEvents.set(items.slice(0, 10));
            break;
          case 'outdoor':
            this.outdoorEvents.set(items.slice(0, 10));
            break;
          case 'events':
            this.careerEvents.set(items.slice(0, 5));
            this.musicEvents.set(items.slice(0, 10));
            this.workshopEvents.set(items.slice(0, 10));
            this.campusEvents.set(items.slice(0, 10));
            this.wellnessEvents.set(items.slice(0, 10));
            this.sportsEvents.set(items.slice(0, 10));
            this.dealEvents.set(items.filter(i => i.isFree || i.price < 10).slice(0, 10));
            this.studentPickEvents.set(items.slice(0, 10));
            break;
        }
      });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
    
    // Reload data if category changed and needs fresh data
    if (categoryId !== 'all') {
      const location = this.userLocation();
      this.loadCategoryData(categoryId, location);
    }
    
    // Smooth scroll to first row, accounting for sticky header height
    setTimeout(() => {
      const firstRow = document.querySelector('.feed-row');
      if (firstRow) {
        const stickyHeaderHeight = 64; // top bar height
        const categoryBarHeight = 52; // category bar height
        const totalStickyHeight = stickyHeaderHeight + categoryBarHeight + 16; // +16px padding
        
        const elementPosition = firstRow.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - totalStickyHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  }

  toggleFilterDrawer() {
    this.filterDrawerOpen.set(!this.filterDrawerOpen());
  }

  closeFilterDrawer() {
    this.filterDrawerOpen.set(false);
  }

  toggleNotifications() {
    this.notificationsOpen.set(!this.notificationsOpen());
  }

  closeNotifications() {
    this.notificationsOpen.set(false);
  }

  hasNotifications() {
    return false; // TODO: Connect to actual notification service
  }

  notificationCount() {
    return 0; // TODO: Connect to actual notification service
  }

  openLocationSheet() {
    this.locationSheetOpen.set(true);
  }

  closeLocationSheet() {
    this.locationSheetOpen.set(false);
  }

  selectCity(cityName: string, lat: number, lng: number) {
    console.log('[Explore] Selected city:', cityName, { lat, lng });
    this.selectedLocation.set(cityName);
    this.userLocation.set({ lat, lng });
    this.locationSheetOpen.set(false);
    this.locationSearchQuery.set('');
    this.locationSearchResults.set([]);
    
    // Clear cache and reload all data
    this.exploreDataService.clearDeduplication();
    this.exploreDataService.clearCache();
    this.isLoading.set(true);
    this.loadAllData();
  }

  async useCurrentLocation() {
    this.isLoadingLocation.set(true);
    try {
      const location = await this.exploreDataService.getCurrentLocation();
      console.log('[Explore] Current location:', location);
      this.selectedLocation.set(location.city);
      this.userLocation.set({ lat: location.lat, lng: location.lng });
      this.locationSheetOpen.set(false);
      
      // Clear cache and reload all data
      this.exploreDataService.clearDeduplication();
      this.exploreDataService.clearCache();
      this.isLoading.set(true);
      this.loadAllData();
    } catch (error) {
      console.error('[Explore] Error getting current location:', error);
      alert('Could not get your location. Please select a city from the list.');
    } finally {
      this.isLoadingLocation.set(false);
    }
  }

  private searchTimeout: any;

  onLocationSearchChange() {
    const query = this.locationSearchQuery();
    console.log('[Explore] 🔤 Search input changed:', query);
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      console.log('[Explore] ⏱️ Cleared previous timeout');
    }
    
    if (!query || query.trim().length < 2) {
      console.log('[Explore] ❌ Query too short, clearing results');
      this.locationSearchResults.set([]);
      this.isSearching.set(false);
      return;
    }

    console.log('[Explore] ⏳ Setting isSearching = true');
    this.isSearching.set(true);
    
    // Debounced search with proper cleanup (300ms for snappy feel)
    this.searchTimeout = setTimeout(() => {
      console.log('[Explore] 🚀 Executing search for:', query);
      this.exploreDataService.searchCities(query)
        .subscribe({
          next: (results) => {
            console.log('[Explore] ✅ Received results:', results.length);
            console.log('[Explore] 📋 Results data:', results);
            this.locationSearchResults.set(results);
            console.log('[Explore] 📊 Signal updated, current value:', this.locationSearchResults());
            this.isSearching.set(false);
          },
          error: (err) => {
            console.error('[Explore] ❌ Search error:', err);
            this.locationSearchResults.set([]);
            this.isSearching.set(false);
          }
        });
    }, 300);
  }

  clearLocationSearch() {
    this.locationSearchQuery.set('');
    this.locationSearchResults.set([]);
  }

  selectSearchResult(result: any) {
    console.log('[Explore] Selected search result:', result);
    this.isLoadingLocation.set(true);
    this.isSearching.set(false);
    
    // Get place details to get coordinates
    this.exploreDataService.getPlaceDetails(result.place_id)
      .subscribe({
        next: (details) => {
          if (details?.geometry?.location) {
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            const cityName = result.structured_formatting?.main_text || result.description;
            
            console.log('[Explore] Geocoded coordinates:', { cityName, lat, lng });
            this.selectCity(cityName, lat, lng);
          } else {
            console.error('[Explore] Invalid geometry in place details');
            alert('Could not get coordinates for this location. Please try another city.');
          }
          this.isLoadingLocation.set(false);
        },
        error: (err) => {
          console.error('[Explore] Error getting place details:', err);
          alert('Error loading location details. Please try again.');
          this.isLoadingLocation.set(false);
        }
      });
  }

  openMapView() {
    this.mapViewOpen.set(true);
  }

  closeMapView() {
    this.mapViewOpen.set(false);
  }

  openExploreDetail(item: ExploreItem) {
    console.log('[Explore] Opening item:', item.title, 'isExternal:', item.isExternal);
    
    // If item has external URL (Ticketmaster, Eventbrite, Google Maps), open externally
    if (item.isExternal && (item.externalUrl || item.officialUrl)) {
      const url = item.externalUrl || item.officialUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Otherwise navigate to internal detail page with item data in state
    this.router.navigate(['/explore', item.id], { 
      state: { item } 
    });
  }

  openEventDetail(eventId: number) {
    // Legacy method for backwards compatibility
    this.router.navigate(['/events', eventId]);
  }

  openCategoryPage(category: string) {
    // Navigate to full category page with filtering
    console.log('Opening category page:', category);
    // TODO: Implement full category pages
    // this.router.navigate(['/explore', category]);
  }

  /**
   * Determine if category should use event cards
   */
  isEventCategory(category: string): boolean {
    return ['events', 'trending', 'student', 'deals'].includes(category);
  }

  /**
   * Determine if category should use place cards
   */
  isPlaceCategory(category: string): boolean {
    return ['places', 'activities', 'nightlife', 'outdoor'].includes(category);
  }
}
