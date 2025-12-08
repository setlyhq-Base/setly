import { Component, signal, computed, HostListener, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedSearchComponent } from './unified-search.component';
import { FilterPanelComponent } from './components/filter-panel.component';
import { RoomResultCardComponent } from './components/room-result-card.component';
import { RideResultCardComponent } from './components/ride-result-card.component';
import { MarketResultCardComponent } from './components/market-result-card.component';
import { RideDetailModalComponent } from './components/ride-detail-modal.component';
import { RoomStore } from '../../core/state/room.store';
import { ActiveTabService } from '../../core/services/active-tab.service';
import { SharedDataService } from '../../core/services/shared-data.service';

// Search page with Premium Sticky Category Pills
@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, UnifiedSearchComponent, FilterPanelComponent, RoomResultCardComponent, RideResultCardComponent, MarketResultCardComponent, RideDetailModalComponent],
  template: `
  <main class="explore-page min-h-screen relative overflow-x-hidden pb-20 md:pb-8">
      <!-- 🌟 Dynamic Background with Floating Elements -->
      <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FAFBFF] via-white to-[#F8FAFF]"></div>
        <div class="floating-orb orb-1 absolute top-[-8rem] right-[10%] w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-blue-400/10 via-indigo-400/5 to-transparent blur-3xl animate-float"></div>
        <div class="floating-orb orb-2 absolute bottom-[-6rem] left-[15%] w-[25rem] h-[25rem] rounded-full bg-gradient-to-tl from-purple-400/10 via-pink-400/5 to-transparent blur-3xl animate-float-delayed"></div>
        <div class="absolute top-[30%] right-[20%] w-2 h-2 rounded-full bg-blue-400/20 animate-float"></div>
        <div class="absolute top-[50%] left-[10%] w-3 h-3 rounded-full bg-indigo-400/20 animate-float-delayed"></div>
        <div class="absolute bottom-[20%] right-[30%] w-2.5 h-2.5 rounded-full bg-purple-400/20 animate-float"></div>
      </div>

      <!-- 🎯 Premium Hero Banner -->
      <section class="relative isolate pt-6 pb-4 md:pt-12 md:pb-8">
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <!-- Greeting Header -->
          <div class="mb-4 md:mb-8 animate-fade-in-up">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg mb-3 md:mb-4">
              <span class="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-blue-500"></span>
              </span>
              <span class="text-[11px] md:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome to SETLY
              </span>
            </div>
            <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-3 tracking-tight leading-tight">
              Find your <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">next move</span>
            </h1>
            <p class="text-sm md:text-lg text-gray-600 max-w-2xl leading-relaxed">
              Discover trusted rooms, instant rides, and connect with your community — all in one place.
            </p>
          </div>

          <!-- Premium Search Card -->
          <div class="relative group animate-fade-in-up animation-delay-200">
            <!-- Glow effect -->
            <div class="absolute -inset-1 md:-inset-2 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl md:rounded-3xl blur-xl md:blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
            
            <!-- Search Container -->
            <div class="relative rounded-2xl md:rounded-3xl border border-white/60 md:border-2 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl overflow-hidden">
              <!-- Gradient header accent -->
              <div class="h-1 md:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
              
              <div class="p-3 md:p-6">
                <app-unified-search (activeTabChange)="onTabChange($event)" (performedSearch)="onSearch($event)"></app-unified-search>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ✨ Single Sticky Category Tab Bar (Mobile-App Style) -->
      <section 
        #categoryPills
        class="category-tabs-section"
        [class.is-sticky]="isSticky()"
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

            <!-- Swipe Indicator (subtle hint for users) -->
            <div class="swipe-indicator" *ngIf="showSwipeHint()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

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
   `,
   styles: [ `
    /* 🎨 Premium Explore Page Styles */
    :host {
      --sticky-filter-offset: 140px;
      --filter-max-height-offset: 160px;
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

    /* Floating Animations */
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); }
      33% { transform: translateY(-15px) translateX(8px); }
      66% { transform: translateY(8px) translateX(-8px); }
    }

    @keyframes float-delayed {
      0%, 100% { transform: translateY(0) translateX(0); }
      33% { transform: translateY(10px) translateX(-12px); }
      66% { transform: translateY(-8px) translateX(8px); }
    }

    .animate-float {
      animation: float 8s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: float-delayed 10s ease-in-out infinite;
    }

    /* Fade in animations */
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out forwards;
    }

    .animation-delay-200 {
      animation-delay: 200ms;
    }

    /* Scale in animation for cards */
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .animate-scale-in {
      animation: scale-in 0.3s ease-out forwards;
    }

    /* ========== SINGLE STICKY CATEGORY TAB BAR (Mobile-App Style) ========== */
    .category-tabs-section {
      position: relative;
      margin-top: 20px;
      margin-bottom: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 45; /* Above content, below header (50) */
    }

    .category-tabs-section.is-sticky {
      position: sticky;
      top: 64px; /* Below header */
      margin-top: 0;
      margin-bottom: 0;
      background: linear-gradient(180deg, rgba(250, 251, 255, 0.98) 0%, rgba(250, 251, 255, 0.95) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 16px 0;
      box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 768px) {
      .category-tabs-section.is-sticky {
        top: 56px; /* Adjusted for mobile header */
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
      border-radius: 14px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 4px 16px rgba(62, 143, 255, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      z-index: 0;
    }

    .category-pill {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: transparent;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      color: #6F7785;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      z-index: 1;
      min-height: 44px; /* Touch-friendly */
      -webkit-tap-highlight-color: transparent;
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
    }

    .category-pill.active .pill-icon {
      color: white;
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
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 11px;
      font-size: 12px;
      font-weight: 700;
      color: white;
      animation: pill-count-entrance 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

    /* Compact mode for sticky pills */
    .category-pills-wrapper.is-compact .category-pill {
      padding: 10px 16px;
    }

    .category-pills-wrapper.is-compact .pill-label {
      font-size: 14px;
    }

    .category-pills-wrapper.is-compact .pill-icon {
      width: 16px;
      height: 16px;
    }

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

  // Sticky category pills state
  isSticky = signal(false);
  showSwipeHint = signal(true);
  private pillsOriginalTop = 0;
  private scrollThreshold = 200; // Increased threshold for new position

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
      this.selectedRide.set(null);
      this.selectedCardId.set(null);
    }, 200);
  }
  
  // Room card click handler
  onRoomCardClick(room: any) {
    this.selectedCardId.set(room.id);
    // TODO: Implement room detail modal similar to ride modal
    console.log('Room card clicked:', room);
  }
  
  // Market card click handler
  onMarketCardClick(item: any) {
    this.selectedCardId.set(item.id);
    // TODO: Implement market detail modal
    console.log('Market card clicked:', item);
  }

  @HostListener('document:keydown.escape')
  onEscape(){ 
    if (this.mobileFiltersOpen()) this.mobileFiltersOpen.set(false);
    if (this.isRideModalOpen()) this.closeRideModal();
  }
}
