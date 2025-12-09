import { Component, signal, computed, HostListener, inject, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventCardComponent } from './components/event-card.component';
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
            <app-event-card
              *ngFor="let event of row.events"
              [event]="event"
              (cardClick)="openExploreDetail(event)">
            </app-event-card>
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
          <div class="location-options">
            <button class="location-option current" (click)="onLocationSelected('Current Location')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
              <span>Use Current Location</span>
            </button>
            <div class="section-title">Nearby Cities</div>
            <button class="location-option" (click)="onLocationSelected('Nashua')">Nashua, NH</button>
            <button class="location-option" (click)="onLocationSelected('Boston')">Boston, MA</button>
            <button class="location-option" (click)="onLocationSelected('Manchester')">Manchester, NH</button>
            <button class="location-option" (click)="onLocationSelected('Lowell')">Lowell, MA</button>
            <div class="section-title">Trending Locations</div>
            <button class="location-option" (click)="onLocationSelected('Cambridge')">Cambridge, MA</button>
            <button class="location-option" (click)="onLocationSelected('Portsmouth')">Portsmouth, NH</button>
            <button class="location-option" (click)="onLocationSelected('Salem')">Salem, MA</button>
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
      padding: 32px 0 60px;
    }

    .feed-row {
      margin-bottom: 48px;
      animation: fadeInUp 0.4s ease-out;
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
      padding: 0 20px 16px;
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
      gap: 20px;
      padding: 0 20px;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: #CBD5E1 transparent;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x proximity;
      scroll-padding-left: 20px;
    }

    .row-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .row-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .row-scroll::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 3px;
    }

    .row-scroll::-webkit-scrollbar-thumb:hover {
      background: #94A3B8;
    }

    .row-scroll app-event-card {
      flex: 0 0 280px;
      max-width: 280px;
      scroll-snap-align: start;
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

      .row-scroll app-event-card {
        flex: 0 0 240px;
        max-width: 240px;
      }
    }

    @media (max-width: 640px) {
      .hero-section {
        padding: 24px 16px 20px;
      }

      .hero-title {
        font-size: 24px;
      }

      .hero-subtitle {
        font-size: 14px;
      }

      .category-chip {
        padding: 8px 14px;
        font-size: 13px;
      }

      .row-scroll {
        padding: 0 16px;
      }

      .row-scroll app-event-card {
        flex: 0 0 220px;
        max-width: 220px;
      }
    }

    /* Location Bottom Sheet */
    .location-bottom-sheet{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.4);display:flex;align-items:flex-end;animation:fadeIn 0.2s ease;-webkit-tap-highlight-color:transparent}
    .location-sheet-content{width:100%;max-height:70vh;background:white;border-radius:24px 24px 0 0;padding:24px;animation:slideUp 0.3s ease;overflow-y:auto;touch-action:pan-y}
    .sheet-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
    .sheet-header h3{font-size:20px;font-weight:700;color:#111827;margin:0}
    .close-btn{background:none;border:none;color:#6B7280;cursor:pointer;padding:8px;border-radius:50%;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
    .close-btn:hover,.close-btn:active{background:#F3F4F6;color:#111827}
    .location-options{display:flex;flex-direction:column;gap:8px}
    .location-option{display:flex;align-items:center;gap:12px;padding:14px 16px;background:white;border:1.5px solid #E5E7EB;border-radius:12px;color:#374151;font-size:15px;font-weight:500;text-align:left;cursor:pointer;transition:all 0.2s;width:100%;-webkit-tap-highlight-color:transparent}
    .location-option:hover,.location-option:active{border-color:#4E7BFD;background:#F8FAFF;color:#4E7BFD}
    .location-option.current{background:linear-gradient(135deg,#4E7BFD 0%,#6B8FFF 100%);border-color:#4E7BFD;color:white}
    .section-title{font-size:13px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin:16px 0 8px;padding:0 4px}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
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
  selectedCategory = signal('all');
  isLoading = signal(false);
  userLocation = signal<{ lat: number; lng: number }>({ lat: 42.7654, lng: -71.4676 });
  
  // Dynamic Hero Content based on Category
  heroTitle = computed(() => {
    const category = this.selectedCategory();
    switch (category) {
      case 'all':
        return 'Discover what\'s around you';
      case 'events':
        return 'Discover Amazing Events';
      case 'restaurants':
        return 'Discover Great Food';
      case 'places':
        return 'Discover Incredible Places';
      case 'activities':
        return 'Discover Fun Activities';
      case 'nightlife':
        return 'Discover Nightlife';
      case 'trending':
        return 'Trending Near You';
      case 'student':
        return 'Student Favorites';
      case 'deals':
        return 'Best Deals & Free Events';
      case 'outdoor':
        return 'Outdoor Adventures';
      default:
        return 'Discover what\'s around you';
    }
  });

  heroSubtitle = computed(() => {
    const category = this.selectedCategory();
    switch (category) {
      case 'all':
        return 'Events, places, food, and experiences – all in one place.';
      case 'events':
        return 'Concerts, festivals, parties, and more happening near you.';
      case 'restaurants':
        return 'Top-rated restaurants, cafés, and hidden food gems.';
      case 'places':
        return 'Parks, museums, landmarks, and must-visit spots.';
      case 'activities':
        return 'Gaming, fitness, workshops, and adventures to try.';
      case 'nightlife':
        return 'Clubs, bars, live music, and late-night entertainment.';
      case 'trending':
        return 'The hottest spots and events everyone\'s talking about.';
      case 'student':
        return 'Events, deals, and hangouts picked by students.';
      case 'deals':
        return 'Free events, discounts, and budget-friendly options.';
      case 'outdoor':
        return 'Hiking, parks, nature tours, and outdoor experiences.';
      default:
        return 'Events, places, food, and experiences – all in one place.';
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

  currentCategoryRows = computed(() => {
    const category = this.selectedCategory();
    const location = this.selectedLocation();

    switch (category) {
      case 'all':
        return [
          { id: 'trending', emoji: '🎆', title: `Trending Near ${location}`, events: this.trendingEvents() },
          { id: 'career', emoji: '💼', title: 'Career & Tech Events', events: this.careerEvents() },
          { id: 'nightlife', emoji: '🎉', title: 'Parties & Nightlife', events: this.partyEvents() },
          { id: 'music', emoji: '🎵', title: 'Live Music & Concerts', events: this.musicEvents() },
          { id: 'workshops', emoji: '📚', title: 'Workshops & Study Events', events: this.workshopEvents() },
          { id: 'campus', emoji: '📍', title: 'Campus Events Near You', events: this.campusEvents() },
          { id: 'wellness', emoji: '🧘', title: 'Wellness & Fitness', events: this.wellnessEvents() },
          { id: 'sports', emoji: '🏀', title: 'Sports & Tournaments', events: this.sportsEvents() },
          { id: 'activities', emoji: '🎯', title: 'Activities & Adventures', events: this.activityEvents() },
          { id: 'outdoor', emoji: '🌲', title: 'Outdoor & Nature', events: this.outdoorEvents() },
          { id: 'deals', emoji: '💰', title: 'Deals & Free Events', events: this.dealEvents() },
          { id: 'student', emoji: '🎓', title: 'Student Picks', events: this.studentPickEvents() }
        ];

      case 'events':
        return [
          { id: 'trending-events', emoji: '🔥', title: `Trending Events Near ${location}`, events: this.trendingEvents() },
          { id: 'career', emoji: '💼', title: 'Career & Tech Events', events: this.careerEvents() },
          { id: 'nightlife', emoji: '🎉', title: 'Parties & Nightlife', events: this.partyEvents() },
          { id: 'music', emoji: '🎵', title: 'Live Music & Concerts', events: this.musicEvents() },
          { id: 'workshops', emoji: '📚', title: 'Workshops & Meetups', events: this.workshopEvents() },
          { id: 'campus', emoji: '📍', title: 'Student Events', events: this.campusEvents() },
          { id: 'sports', emoji: '🏀', title: 'Sports & Tournaments', events: this.sportsEvents() }
        ];

      case 'restaurants':
        return [
          { id: 'restaurants-trending', emoji: '🔥', title: `Trending Restaurants Near ${location}`, events: this.restaurantsTrending() },
          { id: 'must-try', emoji: '⭐', title: 'Must-Try This Week', events: this.restaurantsMustTry() },
          { id: 'trending-food', emoji: '🍜', title: 'Trending Food Spots', events: this.restaurantsTrending() },
          { id: 'budget-eats', emoji: '💵', title: 'Student Budget-Friendly Eats', events: this.restaurantsBudget() },
          { id: 'desserts', emoji: '🧁', title: 'Best Desserts Near You', events: this.restaurantsDesserts() },
          { id: 'late-night', emoji: '🌙', title: 'Open Late (Night Eats)', events: this.restaurantsBudget() }
        ];

      case 'places':
        return [
          { id: 'places-popular', emoji: '📍', title: `Popular Places Near ${location}`, events: this.placesPopular() },
          { id: 'scenic', emoji: '🏞️', title: 'Scenic Spots', events: this.placesScenic() },
          { id: 'outdoor-places', emoji: '🌲', title: 'Outdoor Adventures', events: this.outdoorEvents() },
          { id: 'landmarks', emoji: '🏛️', title: 'Landmarks & Museums', events: this.placesLandmarks() },
          { id: 'student-favorites', emoji: '🎓', title: 'Student Favorites', events: this.studentPickEvents() },
          { id: 'weekend', emoji: '🗓️', title: 'Must-Visit This Weekend', events: this.placesPopular() },
          { id: 'hidden-gems', emoji: '💎', title: 'Hidden Gems Nearby', events: this.placesHiddenGems() }
        ];

      case 'activities':
        return [
          { id: 'activities-fun', emoji: '🎯', title: `Fun Activities Near ${location}`, events: this.activityEvents() },
          { id: 'fitness', emoji: '💪', title: 'Fitness & Wellness', events: this.activitiesFitness() },
          { id: 'adventure', emoji: '🧗', title: 'Adventure Sports', events: this.outdoorEvents() },
          { id: 'gaming', emoji: '🎮', title: 'Gaming & Arcades', events: this.activitiesGaming() },
          { id: 'theaters', emoji: '🎬', title: 'Movie Theaters & Shows', events: this.musicEvents() },
          { id: 'group', emoji: '👥', title: 'Group Activities', events: this.activityEvents() },
          { id: 'creative', emoji: '🎨', title: 'Creative Workshops', events: this.activitiesCreative() }
        ];

      case 'nightlife':
        return [
          { id: 'nightlife-trending', emoji: '🔥', title: `Trending Nightlife Near ${location}`, events: this.nightlifeTrending() },
          { id: 'clubs', emoji: '💃', title: 'Top Clubs & Dancing', events: this.nightlifeTrending() },
          { id: 'bars', emoji: '🍻', title: 'Best Bars & Pubs', events: this.nightlifeBars() },
          { id: 'live-music-night', emoji: '🎸', title: 'Live Music Venues', events: this.nightlifeLiveMusic() },
          { id: 'parties', emoji: '🎉', title: 'Parties & Events', events: this.partyEvents() },
          { id: 'lounges', emoji: '🍸', title: 'Cocktail Lounges', events: this.nightlifeTrending() }
        ];

      case 'trending':
        return [
          { id: 'trending-all', emoji: '🔥', title: `Trending Near ${location}`, events: this.trendingEvents() },
          { id: 'trending-events', emoji: '🎉', title: 'Trending Events', events: this.partyEvents() },
          { id: 'trending-food', emoji: '🍽️', title: 'Trending Restaurants', events: this.restaurantsTrending() },
          { id: 'trending-nightlife', emoji: '🌙', title: 'Trending Nightlife', events: this.nightlifeTrending() },
          { id: 'trending-activities', emoji: '🎯', title: 'Trending Activities', events: this.activityEvents() }
        ];

      case 'student':
        return [
          { id: 'student-picks', emoji: '🎓', title: `Student Picks Near ${location}`, events: this.studentPickEvents() },
          { id: 'campus-events', emoji: '📍', title: 'Campus Events', events: this.campusEvents() },
          { id: 'budget-student', emoji: '💵', title: 'Budget-Friendly', events: this.restaurantsBudget() },
          { id: 'study-events', emoji: '📚', title: 'Study & Workshops', events: this.workshopEvents() },
          { id: 'social-student', emoji: '🎮', title: 'Social & Gaming', events: this.activityEvents() }
        ];

      case 'deals':
        return [
          { id: 'deals-free', emoji: '💰', title: `Deals & Free Near ${location}`, events: this.dealEvents() },
          { id: 'free-events', emoji: '🎁', title: 'Free Events', events: this.dealEvents() },
          { id: 'student-discounts', emoji: '🎓', title: 'Student Discounts', events: this.restaurantsBudget() },
          { id: 'happy-hours', emoji: '🍻', title: 'Happy Hours', events: this.nightlifeBars() }
        ];

      case 'outdoor':
        return [
          { id: 'outdoor-trending', emoji: '🌲', title: `Outdoor Near ${location}`, events: this.outdoorEvents() },
          { id: 'hiking', emoji: '🥾', title: 'Hiking & Trails', events: this.outdoorEvents() },
          { id: 'parks', emoji: '🌳', title: 'Parks & Gardens', events: this.placesScenic() },
          { id: 'water-sports', emoji: '🚣', title: 'Water Activities', events: this.outdoorEvents() },
          { id: 'nature', emoji: '🦋', title: 'Nature & Wildlife', events: this.placesScenic() }
        ];

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
    this.exploreDataService.getNearbyPlaces(category, location)
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        switch (category) {
          case 'restaurants':
            this.restaurantsTrending.set(items.slice(0, 10));
            this.restaurantsMustTry.set(items.slice(3, 8));
            this.restaurantsBudget.set(items.filter(i => i.price <= 15).slice(0, 10));
            this.restaurantsDesserts.set(items.filter(i => 
              i.title.toLowerCase().includes('dessert') ||
              i.title.toLowerCase().includes('bakery') ||
              i.title.toLowerCase().includes('ice cream')
            ).slice(0, 10));
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
    
    // Smooth scroll to feed section when switching categories
    setTimeout(() => {
      const feedElement = document.querySelector('.events-feed');
      if (feedElement) {
        feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

  onLocationSelected(location: string) {
    this.selectedLocation.set(location);
    this.locationSheetOpen.set(false);
    // Optionally reload data for new location
  }

  openMapView() {
    this.mapViewOpen.set(true);
  }

  closeMapView() {
    this.mapViewOpen.set(false);
  }

  openExploreDetail(item: ExploreItem) {
    // Navigate to detail page with item data in state
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
}
