import { Component, signal, computed, HostListener, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventCardComponent } from './components/event-card.component';
import { FilterDrawerComponent } from '../connect/components/filter-drawer.component';
import { NotificationsDrawerComponent } from '../connect/components/notifications-drawer.component';
import { GlobalSearchOverlayComponent } from '../../shared/components/global-search-overlay.component';
import { LocationBottomSheetComponent } from './components/location-bottom-sheet.component';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    EventCardComponent,
    FilterDrawerComponent,
    NotificationsDrawerComponent,
    GlobalSearchOverlayComponent,
    LocationBottomSheetComponent
  ],
  template: `
  <main class="events-page min-h-screen relative pb-20 md:pb-8">
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
            (click)="openLocationSheet()"
            class="top-bar-action"
            aria-label="Location">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <h1 class="page-title">Events</h1>
        
        <div class="top-bar-right">
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
          
          <button 
            (click)="searchOpen.set(true)" 
            class="top-bar-action"
            aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Hero Section with Location & Categories -->
      <section class="hero-section" [class.scrolled]="isScrolled()">
        <div class="hero-content">
          <h1 class="hero-title">Find your world nearby.</h1>
          <p class="hero-subtitle">Discover events, meet your community, and explore what's happening around you in real-time.</p>
          
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
            (click)="selectCategory(cat.id)">
            <span class="category-emoji">{{ cat.emoji }}</span>
            <span class="category-label">{{ cat.label }}</span>
          </button>
        </div>
      </section>

      <!-- Main Content - Netflix Style Rows -->
      <section class="events-feed">
        
        <!-- Trending Near You -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">🎆 Trending Near You</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of trendingEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Career & Tech Events -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">💼 Career & Tech Events</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of careerEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Parties & Nightlife -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">🎉 Parties & Nightlife</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of partyEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Live Music & Concerts -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">🎵 Live Music & Concerts</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of musicEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Workshops & Study Events -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">📚 Workshops & Study Events</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of workshopEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Campus Events Near You -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">📍 Campus Events Near You</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of campusEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Wellness & Fitness -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">🧘 Wellness & Fitness</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of wellnessEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

        <!-- Sports & Tournaments -->
        <div class="feed-row">
          <div class="row-header">
            <h2 class="row-title">🏀 Sports & Tournaments</h2>
            <button class="see-all-btn">See all →</button>
          </div>
          <div class="row-scroll">
            <app-event-card
              *ngFor="let event of sportsEvents()"
              [event]="event"
              (cardClick)="openEventDetail(event.id)">
            </app-event-card>
          </div>
        </div>

      </section>

      <!-- Location Bottom Sheet -->
      <app-location-bottom-sheet
        *ngIf="locationSheetOpen()"
        [selectedLocation]="selectedLocation()"
        (locationSelected)="onLocationSelected($event)"
        (closed)="closeLocationSheet()">
      </app-location-bottom-sheet>

      <!-- Filter Drawer -->
      <app-filter-drawer
        *ngIf="filterDrawerOpen()"
        (closed)="closeFilterDrawer()">
      </app-filter-drawer>

      <!-- Notifications Drawer -->
      <app-notifications-drawer
        *ngIf="notificationsOpen()"
        (closed)="closeNotifications()">
      </app-notifications-drawer>

      <!-- Global Search Overlay -->
      <app-global-search-overlay
        *ngIf="searchOpen()"
        (closed)="searchOpen.set(false)">
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
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 2px 12px -4px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .instagram-top-bar.scrolled {
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.12);
    }

    .top-bar-left,
    .top-bar-right {
      display: flex;
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
      padding: 32px 20px 24px;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(250, 251, 255, 0.95));
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }

    .hero-section.scrolled {
      padding: 24px 20px 20px;
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
    }

    .category-chip:hover {
      border-color: #3B82F6;
      background: #EFF6FF;
    }

    .category-chip.active {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      border-color: #3B82F6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
      transition: all 0.2s;
    }

    .see-all-btn:hover {
      background: rgba(59, 130, 246, 0.1);
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
  `]
})
export class EventsPage implements AfterViewInit {
  private router = inject(Router);
  @ViewChild('categoryScroll') categoryScroll?: ElementRef;
  
  // UI State
  isScrolled = signal(false);
  filterDrawerOpen = signal(false);
  notificationsOpen = signal(false);
  searchOpen = signal(false);
  locationSheetOpen = signal(false);
  selectedLocation = signal('Nashua, NH');
  selectedCategory = signal('all');
  
  // Categories
  categories = signal([
    { id: 'all', emoji: '🌟', label: 'All' },
    { id: 'parties', emoji: '🎉', label: 'Parties' },
    { id: 'concerts', emoji: '🎵', label: 'Concerts' },
    { id: 'career', emoji: '💼', label: 'Career Fairs' },
    { id: 'meetups', emoji: '🎤', label: 'Meetups' },
    { id: 'gaming', emoji: '🎮', label: 'Gaming' },
    { id: 'education', emoji: '📚', label: 'Education' },
    { id: 'sports', emoji: '🏀', label: 'Sports' },
    { id: 'movies', emoji: '🎬', label: 'Movies' },
    { id: 'food', emoji: '🍔', label: 'Social / Food' },
    { id: 'wellness', emoji: '🧘', label: 'Wellness' },
    { id: 'community', emoji: '🌎', label: 'Community' }
  ]);
  
  // Trending Events (Hero Cards)
  trendingEvents = signal([
    {
      id: 1,
      title: 'Winter Wonderland Festival',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      date: 'Sat, Dec 15',
      time: '7:00 PM',
      location: 'Downtown Park',
      distance: '0.5 mi',
      category: 'concerts',
      organizer: { name: 'City Events', avatar: 'https://i.pravatar.cc/150?img=10' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 234,
      spotsLeft: 'Unlimited'
    },
    {
      id: 2,
      title: 'Tech Career Fair 2025',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      date: 'Thu, Dec 12',
      time: '10:00 AM',
      location: 'Convention Center',
      distance: '1.2 mi',
      category: 'career',
      organizer: { name: 'Tech Hub', avatar: 'https://i.pravatar.cc/150?img=11' },
      price: 15,
      isFree: false,
      tag: 'Paid',
      attendees: 450,
      spotsLeft: '50 left'
    },
    {
      id: 3,
      title: 'Indie Band Night',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      date: 'Fri, Dec 13',
      time: '8:00 PM',
      location: 'The Venue',
      distance: '2.3 mi',
      category: 'concerts',
      organizer: { name: 'Live Music Co', avatar: 'https://i.pravatar.cc/150?img=12' },
      price: 20,
      isFree: false,
      tag: '21+',
      attendees: 180,
      spotsLeft: '20 left'
    }
  ]);

  // Career & Tech Events
  careerEvents = signal([
    {
      id: 10,
      title: 'Startup Pitch Night',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      date: 'Wed, Dec 18',
      time: '6:00 PM',
      location: 'Innovation Hub',
      distance: '1.5 mi',
      category: 'career',
      organizer: { name: 'Startup Network', avatar: 'https://i.pravatar.cc/150?img=13' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 120,
      spotsLeft: 'Unlimited'
    },
    {
      id: 11,
      title: 'AI & Machine Learning Workshop',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      date: 'Mon, Dec 16',
      time: '2:00 PM',
      location: 'Tech Campus',
      distance: '0.8 mi',
      category: 'education',
      organizer: { name: 'Code Academy', avatar: 'https://i.pravatar.cc/150?img=14' },
      price: 25,
      isFree: false,
      tag: 'Paid',
      attendees: 85,
      spotsLeft: '15 left'
    }
  ]);

  // Parties & Nightlife
  partyEvents = signal([
    {
      id: 20,
      title: 'College Bash 2025',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      date: 'Sat, Dec 14',
      time: '10:00 PM',
      location: 'Club Downtown',
      distance: '1.8 mi',
      category: 'parties',
      organizer: { name: 'Night Events', avatar: 'https://i.pravatar.cc/150?img=15' },
      price: 10,
      isFree: false,
      tag: '18+',
      attendees: 320,
      spotsLeft: '80 left'
    },
    {
      id: 21,
      title: 'Rooftop Mixer',
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
      date: 'Fri, Dec 20',
      time: '9:00 PM',
      location: 'Sky Lounge',
      distance: '2.5 mi',
      category: 'parties',
      organizer: { name: 'Social Club', avatar: 'https://i.pravatar.cc/150?img=16' },
      price: 15,
      isFree: false,
      tag: '21+',
      attendees: 150,
      spotsLeft: '30 left'
    }
  ]);

  // Music Events
  musicEvents = signal([
    {
      id: 30,
      title: 'EDM Night: DJ Pulse',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      date: 'Sat, Dec 21',
      time: '11:00 PM',
      location: 'Warehouse District',
      distance: '3.2 mi',
      category: 'concerts',
      organizer: { name: 'Bass Events', avatar: 'https://i.pravatar.cc/150?img=17' },
      price: 30,
      isFree: false,
      tag: '21+',
      attendees: 500,
      spotsLeft: 'Sold Out'
    },
    {
      id: 31,
      title: 'Jazz Under Stars',
      image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
      date: 'Sun, Dec 22',
      time: '7:00 PM',
      location: 'City Gardens',
      distance: '1.1 mi',
      category: 'concerts',
      organizer: { name: 'Jazz Society', avatar: 'https://i.pravatar.cc/150?img=18' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 200,
      spotsLeft: 'Unlimited'
    }
  ]);

  // Workshop Events
  workshopEvents = signal([
    {
      id: 40,
      title: 'Photography Basics',
      image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
      date: 'Tue, Dec 17',
      time: '3:00 PM',
      location: 'Art Studio',
      distance: '0.9 mi',
      category: 'education',
      organizer: { name: 'Creative Hub', avatar: 'https://i.pravatar.cc/150?img=19' },
      price: 35,
      isFree: false,
      tag: 'Paid',
      attendees: 25,
      spotsLeft: '5 left'
    },
    {
      id: 41,
      title: 'Study Group: Finals Prep',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      date: 'Mon, Dec 16',
      time: '6:00 PM',
      location: 'Library',
      distance: '0.3 mi',
      category: 'education',
      organizer: { name: 'Study Squad', avatar: 'https://i.pravatar.cc/150?img=20' },
      price: 0,
      isFree: true,
      tag: 'College Only',
      attendees: 45,
      spotsLeft: 'Unlimited'
    }
  ]);

  // Campus Events
  campusEvents = signal([
    {
      id: 50,
      title: 'Student Art Exhibition',
      image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
      date: 'Wed, Dec 18',
      time: '2:00 PM',
      location: 'Campus Gallery',
      distance: '0.2 mi',
      category: 'community',
      organizer: { name: 'Art Department', avatar: 'https://i.pravatar.cc/150?img=21' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 80,
      spotsLeft: 'Unlimited'
    },
    {
      id: 51,
      title: 'Club Fair 2025',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
      date: 'Thu, Dec 19',
      time: '11:00 AM',
      location: 'Student Union',
      distance: '0.1 mi',
      category: 'community',
      organizer: { name: 'Student Affairs', avatar: 'https://i.pravatar.cc/150?img=22' },
      price: 0,
      isFree: true,
      tag: 'College Only',
      attendees: 300,
      spotsLeft: 'Unlimited'
    }
  ]);

  // Wellness Events
  wellnessEvents = signal([
    {
      id: 60,
      title: 'Yoga in the Park',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      date: 'Sun, Dec 15',
      time: '8:00 AM',
      location: 'Central Park',
      distance: '0.7 mi',
      category: 'wellness',
      organizer: { name: 'Zen Studio', avatar: 'https://i.pravatar.cc/150?img=23' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 50,
      spotsLeft: 'Unlimited'
    },
    {
      id: 61,
      title: 'Mental Health Workshop',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      date: 'Tue, Dec 17',
      time: '5:00 PM',
      location: 'Wellness Center',
      distance: '0.4 mi',
      category: 'wellness',
      organizer: { name: 'Health Services', avatar: 'https://i.pravatar.cc/150?img=24' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 35,
      spotsLeft: '15 left'
    }
  ]);

  // Sports Events
  sportsEvents = signal([
    {
      id: 70,
      title: 'Basketball Tournament',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      date: 'Sat, Dec 21',
      time: '1:00 PM',
      location: 'Sports Complex',
      distance: '1.3 mi',
      category: 'sports',
      organizer: { name: 'Athletics Dept', avatar: 'https://i.pravatar.cc/150?img=25' },
      price: 5,
      isFree: false,
      tag: 'Paid',
      attendees: 150,
      spotsLeft: 'Unlimited'
    },
    {
      id: 71,
      title: 'Running Club Meetup',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
      date: 'Sun, Dec 22',
      time: '7:00 AM',
      location: 'Trail Start',
      distance: '2.0 mi',
      category: 'sports',
      organizer: { name: 'Run Club', avatar: 'https://i.pravatar.cc/150?img=26' },
      price: 0,
      isFree: true,
      tag: 'Free',
      attendees: 40,
      spotsLeft: 'Unlimited'
    }
  ]);

  ngAfterViewInit() {
    // Initialize category scroll
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
    // Filter events based on category
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

  hasNotifications(): boolean {
    return true;
  }

  notificationCount(): number {
    return 5;
  }

  openLocationSheet() {
    this.locationSheetOpen.set(true);
  }

  closeLocationSheet() {
    this.locationSheetOpen.set(false);
  }

  onLocationSelected(location: string) {
    this.selectedLocation.set(location);
    this.closeLocationSheet();
  }

  openEventDetail(eventId: number) {
    this.router.navigate(['/events', eventId]);
  }
}
