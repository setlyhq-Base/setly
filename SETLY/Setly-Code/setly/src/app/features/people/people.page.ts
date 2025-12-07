import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, signal, OnDestroy, OnInit, effect, EffectRef, Injector, ViewChildren, QueryList, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PeopleDirectoryService, DirectoryUser } from '../../core/services/people-directory.service';
import { PeopleFilters, PeopleFiltersPanelComponent } from './components/people-filters-panel.component';
import { PresenceService } from '../../core/services/presence.service';
import { AuthStore } from '../../core/state/auth.store';
import { DummyPeopleService, DummyUser } from '../../core/services/dummy-people.service';
import { ProfilePreviewModalComponent } from './components/profile-preview-modal.component';
import { LocationService } from '../../core/services/location.service';

declare const google: any;

interface CarouselItem {
  type: 'room' | 'ride' | 'marketplace' | 'event' | 'person';
  id: string;
  title: string;
  image: string;
  // Room fields
  price?: string;
  distance?: string;
  // Ride fields
  destination?: string;
  time?: string;
  seats?: string;
  // Marketplace fields
  condition?: string;
  // Event fields
  date?: string;
  location?: string;
  // Person fields
  university?: string;
  interests?: string[];
}

interface CarouselCategory {
  id: string;
  title: string;
  icon: string;
  items: CarouselItem[];
  viewAllLink?: string;
}

@Component({
  selector: 'app-people-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PeopleFiltersPanelComponent, ProfilePreviewModalComponent],
  templateUrl: './people.page.html',
  styles: [`
    /* Premium Fade-in Animation */
    .animate-fade-in {
      animation: fadeInUp .5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Compact Carousel Card with Enhanced Hover */
    .carousel-card-compact {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, box-shadow;
    }
    
    .carousel-card-compact:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 8px 24px rgba(78, 123, 253, 0.2) !important;
    }
    
    .carousel-card-compact:active {
      transform: translateY(-1px) scale(1.005);
    }
    
    /* Smooth Scrolling with Native Feel */
    .scroll-smooth {
      scroll-behavior: smooth;
      transition: scroll-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hide Scrollbar but Keep Functionality */
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
      /* Enable momentum scrolling on iOS */
      -webkit-overflow-scrolling: touch;
    }
    
    /* Custom Thin Scrollbar for Filters */
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
      background: transparent;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #D1D5DB;
      border-radius: 10px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: #9CA3AF;
    }
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: #D1D5DB transparent;
    }
    
    /* Prevent text selection during drag */
    .cursor-grab:active,
    .active\\:cursor-grabbing:active {
      cursor: grabbing !important;
      user-select: none;
      -webkit-user-select: none;
    }
    
    /* Premium Hover Effects */
    .hover-lift {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
    
    /* Scale-in Animation for Popovers */
    .animate-scale-in {
      animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    /* 2-line Truncation */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Focus Styles for Accessibility */
    button:focus-visible,
    a:focus-visible {
      outline: 2px solid #4E7BFD;
      outline-offset: 2px;
    }
    
    /* Prevent image dragging */
    img {
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }
    
    /* Smooth transitions for gradient overlays */
    .transition-opacity {
      transition: opacity 0.3s ease-in-out;
    }
    
    /* Subtle bounce animation for map pins */
    @keyframes bounce-subtle {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
    
    .animate-bounce-subtle {
      animation: bounce-subtle 2s ease-in-out infinite;
    }
    
    /* Unified Carousel Card Styles */
    .carousel-card-unified {
      will-change: transform, box-shadow;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .carousel-card-unified:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 32px rgba(78, 123, 253, 0.2);
    }
    
    /* Responsive carousel card sizing - Premium wider cards */
    @media (max-width: 1024px) {
      .carousel-card-unified {
        width: 240px !important;
      }
    }
    @media (max-width: 768px) {
      .carousel-card-unified {
        width: 220px !important;
        height: 170px !important;
      }
    }
    @media (max-width: 640px) {
      .carousel-card-unified {
        width: 85vw !important;
        max-width: 300px !important;
      }
    }
    
    /* Animated pulse for map pins */
    @keyframes pulse-ring {
      0% {
        transform: scale(0.9);
        opacity: 1;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    .animate-pulse-ring {
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    /* Status Cycle Animation - 3 second intervals */
    @keyframes statusCycleTick {
      0%, 45% {
        opacity: 1;
        visibility: visible;
      }
      50%, 100% {
        opacity: 0;
        visibility: hidden;
      }
    }
    @keyframes statusCyclePercent {
      0%, 50% {
        opacity: 0;
        visibility: hidden;
      }
      55%, 95% {
        opacity: 1;
        visibility: visible;
      }
      100% {
        opacity: 0;
        visibility: hidden;
      }
    }
    .status-cycle-animation .status-indicator-tick {
      animation: statusCycleTick 6s ease-in-out infinite;
    }
    .status-cycle-animation .status-indicator-percent {
      animation: statusCyclePercent 6s ease-in-out infinite;
    }
  `]
})
export class PeoplePage implements OnInit, OnDestroy, AfterViewInit {
  private svc = inject(PeopleDirectoryService);
  private presence = inject(PresenceService);
  private authStore = inject(AuthStore);
  private injector = inject(Injector);
  private dummySvc = inject(DummyPeopleService);
  private router = inject(Router);
  private locationSvc = inject(LocationService);
  
  // Use dummy data instead of actual service for demo
  users: Signal<DirectoryUser[]> = computed(() => {
    // DummyUser extends DirectoryUser, so can be used directly
    return this.dummySvc.getAllUsers();
  });
  loading = signal(false);
  nextCursor = signal<string | undefined>(undefined);

  filters = signal<PeopleFilters>({ 
    q: '', 
    roles: { student: false, professional: false, alumni: false }, 
    orgs: [], 
    location: {}, 
    verified: { email: false, phone: false, edu: false }, 
    interests: [], 
    onlineOnly: false,
    sort: 'recent' 
  });
  animate = signal(false);
  mapSearch = '';
  savedUsers = signal<Set<string>>(new Set());
  
  // Profile preview modal
  selectedUser = signal<DummyUser | undefined>(undefined);
  showProfileModal = signal(false);
  
  // Carousel state - now managed per category
  carouselScrollStates = signal<Map<number, {
    canScrollLeft: boolean;
    canScrollRight: boolean;
    isDragging: boolean;
    startX: number;
    scrollLeft: number;
  }>>(new Map());
  
  // Auto-scroll state for unified carousel
  private autoScrollInterval: any;
  private autoScrollRestartTimeout: any;
  private isAutoScrollPaused = signal(false);
  
  hoveredUser = signal<DirectoryUser | null>(null);
  
  // QueryList to access carousel container elements
  @ViewChildren('carouselContainer') carouselContainers!: QueryList<ElementRef<HTMLDivElement>>;
  
  // ViewChild for map container
  @ViewChild('googleMap') mapContainer!: ElementRef<HTMLDivElement>;

  // Google Maps properties - JavaScript API for custom markers
  private sanitizer = inject(DomSanitizer);
  private map: any = null;
  private markers: any[] = [];
  private userLocationMarker: any = null;
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  mapCenter = signal<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 });
  mapZoom = signal(13);
  isLoadingMap = signal(true);
  mapError = signal<string | null>(null);
  searchQuery = signal<string>('');
  filteredPeople = signal<DummyUser[]>([]);

  private presenceInterval: any;
  private authEffect?: EffectRef;

  ngOnInit(): void {
    this.svc.reset();
    this.authEffect = effect(() => {
      const auth = this.authStore.user();
      if (auth.isAuthenticated) {
        this.svc.reset();
        this.svc.list({ includeIncomplete: true, limit: 200 });
        this.startPresencePolling();
      } else {
        this.stopPresencePolling();
        this.svc.reset();
      }
    }, { injector: this.injector });

    // Refresh map markers every 30 seconds for real-time updates
    setInterval(() => {
      if (this.map) {
        this.refreshMarkers();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.stopPresencePolling();
    this.stopAutoScroll();
    if (this.autoScrollRestartTimeout) {
      clearTimeout(this.autoScrollRestartTimeout);
    }
    this.authEffect?.destroy();
  }

  totalCount(): number { return this.users().length; }

  apply(f: PeopleFilters){ this.filters.set(f); this.animate.set(true); setTimeout(() => this.animate.set(false), 150); }
  
  clear(){ 
    this.filters.set({ 
      q:'', 
      roles: {student:false, professional:false, alumni:false}, 
      orgs:[], 
      location:{}, 
      verified:{email:false, phone:false, edu:false}, 
      interests:[], 
      onlineOnly: false,
      sort:'recent' 
    }); 
  }
  
  onSort(ev: Event){ const v = (ev.target as HTMLSelectElement).value as any; this.filters.update(x => ({ ...x, sort: v })); }

  filtered: Signal<DirectoryUser[]> = computed(() => {
    const list = this.users();
    const f = this.filters();
    let out = list.slice();

    // A. Search text (name/university/location contains)
    const q = (f.q||'').trim().toLowerCase();
    if (q) out = out.filter(u => (u.name||'').toLowerCase().includes(q)
      || (u.organization||'').toLowerCase().includes(q)
      || (u.location||'').toLowerCase().includes(q));

    // B. Role chips
    const wantsStudent = !!f.roles.student;
    const wantsProfessional = !!f.roles.professional;
    if (wantsStudent !== wantsProfessional) {
      const target = wantsStudent ? 'student' : 'professional';
      out = out.filter(u => this.roleToken(u) === target);
    } else if (wantsStudent && wantsProfessional) {
      // both checked -> keep all
    }

    // C. Orgs tokens
    if (f.orgs.length) {
      const tokens = f.orgs.map(s => s.toLowerCase());
      out = out.filter(u => tokens.some(t => (u.organization||'').toLowerCase().includes(t)));
    }

    // D. Location fields
    const city = (f.location.city||'').toLowerCase();
    const state = (f.location.state||'').toLowerCase();
    const country = (f.location.country||'').toLowerCase();
    if (city) out = out.filter(u => this.locationContains(u, city));
    if (state) out = out.filter(u => this.locationContains(u, state));
    if (country) out = out.filter(u => this.locationContains(u, country));

    // E. Verification badges
    if (f.verified.email) out = out.filter(u => !!u.badges?.email);
    if (f.verified.phone) out = out.filter(u => !!u.badges?.phone);
    if (f.verified.edu) out = out.filter(u => !!u.badges?.university);

    // G. Sorting
    const collator = new Intl.Collator();
    if (f.sort === 'university') out.sort((a,b) => collator.compare(a.organization||'', b.organization||''));
    else if (f.sort === 'active') out.sort((a,b) => this.activityValue(b) - this.activityValue(a));
    else if (f.sort === 'recent') out.sort((a,b) => this.activityValue(b) - this.activityValue(a));
    else if (f.sort === 'nearby') {
      // TODO: Implement nearby sorting based on user location
    }
    else if (f.sort === 'recommended') {
      // TODO: Implement recommendation algorithm
    }
    else if (f.sort === 'interests') {
      // TODO: Implement interests-based sorting
    }

    // H. Online-only filter
    if (f.onlineOnly) {
      out = out.filter(u => this.isOnline(u));
    }

    return out;
  });

  loadMore(){
    if (!this.authStore.user().isAuthenticated) return;
    this.svc.loadMore();
    this.presence.fetchOnline();
  }
  
  invite(){ 
    try { 
      navigator.share?.({ title: 'Join Setly', url: location.origin }); 
    } catch {} 
  }

  // Discovery carousel computed signals
  recommendedUsers = computed(() => {
    // Get users with shared interests and good trust scores
    const allUsers = this.dummySvc.getAllUsers();
    return allUsers
      .filter(u => u.badges && (u.badges.email && u.badges.phone && u.badges.university))
      .slice(0, 8);
  });

  universityUsers = computed(() => {
    // Get users from popular universities
    return this.dummySvc.getUsersByUniversity('MIT').concat(
      this.dummySvc.getUsersByUniversity('Harvard'),
      this.dummySvc.getUsersByUniversity('Stanford')
    ).slice(0, 8);
  });

  newInCityUsers = computed(() => {
    // Get users from Boston, Cambridge, and San Francisco
    return this.dummySvc.getUsersByCity('Boston')
      .concat(this.dummySvc.getUsersByCity('Cambridge'))
      .concat(this.dummySvc.getUsersByCity('San Francisco'))
      .slice(0, 8);
  });

  mapPinCount = computed(() => {
    return this.dummySvc.getAllUsers().filter(u => u.lat && u.lng).length;
  });

  // Live counters
  totalNearby = computed(() => {
    return this.dummySvc.getAllUsers().length;
  });

  onlineCount = computed(() => {
    return this.dummySvc.getOnlineUsers().length;
  });

  // Unified mixed carousel with Facebook-style content mixing
  mixedCarouselItems = computed(() => {
    const rides = this.getRideItems();
    const marketplace = this.getMarketplaceItems();
    const events = this.getEventItems();
    
    // Mix items in order: ride -> marketplace -> event -> repeat
    const mixed: CarouselItem[] = [];
    const maxLength = Math.max(rides.length, marketplace.length, events.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < rides.length) mixed.push(rides[i]);
      if (i < marketplace.length) mixed.push(marketplace[i]);
      if (i < events.length) mixed.push(events[i]);
    }
    
    return mixed;
  });

  // Carousel categories with mixed content (kept for backward compatibility if needed)
  carouselCategories = computed(() => {
    const users = this.dummySvc.getAllUsers();
    
    const categories: CarouselCategory[] = [
      {
        id: 'rides',
        title: 'Rides Available',
        icon: '🚗',
        viewAllLink: '/rides',
        items: this.getRideItems()
      },
      {
        id: 'marketplace',
        title: 'Trending Marketplace',
        icon: '�',
        viewAllLink: '/marketplace',
        items: this.getMarketplaceItems()
      },
      {
        id: 'events',
        title: 'Upcoming Events',
        icon: '🎉',
        viewAllLink: '/events',
        items: this.getEventItems()
      }
    ];
    
    return categories;
  });

  getRideItems(): CarouselItem[] {
    const users = this.dummySvc.getAllUsers();
    return [
      {
        type: 'ride',
        id: 'ride-1',
        title: users[0]?.name || 'Alex Chen',
        image: users[0]?.avatarUrl || 'https://i.pravatar.cc/150?img=12',
        destination: 'Boston Logan Airport',
        time: 'Tomorrow 3:00 PM',
        seats: '3',
        price: '$15',
        distance: '15.2 mi'
      },
      {
        type: 'ride',
        id: 'ride-2',
        title: users[1]?.name || 'Sarah Kim',
        image: users[1]?.avatarUrl || 'https://i.pravatar.cc/150?img=45',
        destination: 'South Station',
        time: 'Today 5:30 PM',
        seats: '2',
        price: 'Free',
        distance: '3.8 mi'
      },
      {
        type: 'ride',
        id: 'ride-3',
        title: users[2]?.name || 'Mike Johnson',
        image: users[2]?.avatarUrl || 'https://i.pravatar.cc/150?img=33',
        destination: 'Harvard Square',
        time: 'Today 7:00 PM',
        seats: '4',
        price: '$8',
        distance: '2.1 mi'
      },
      {
        type: 'ride',
        id: 'ride-4',
        title: users[3]?.name || 'Emily Davis',
        image: users[3]?.avatarUrl || 'https://i.pravatar.cc/150?img=27',
        destination: 'Cambridge Mall',
        time: 'Tomorrow 2:00 PM',
        seats: '3',
        price: 'Free',
        distance: '4.5 mi'
      },
      {
        type: 'ride',
        id: 'ride-5',
        title: users[4]?.name || 'James Wilson',
        image: users[4]?.avatarUrl || 'https://i.pravatar.cc/150?img=68',
        destination: 'Boston Common',
        time: 'Saturday 10:00 AM',
        seats: '2',
        price: '$10',
        distance: '6.3 mi'
      }
    ];
  }

  getMarketplaceItems(): CarouselItem[] {
    return [
      {
        type: 'marketplace',
        id: 'market-1',
        title: 'MacBook Pro 2021',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        price: '$899',
        distance: '2.1 mi',
        condition: 'Like New'
      },
      {
        type: 'marketplace',
        id: 'market-2',
        title: 'IKEA Desk & Chair Set',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
        price: '$120',
        distance: '0.8 mi',
        condition: 'Good'
      },
      {
        type: 'marketplace',
        id: 'market-3',
        title: 'iPhone 13 Pro',
        image: 'https://images.unsplash.com/photo-1592286927505-697c6c72c7a8?w=400',
        price: '$650',
        distance: '1.5 mi',
        condition: 'Excellent'
      },
      {
        type: 'marketplace',
        id: 'market-4',
        title: 'Gaming Console PS5',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
        price: '$450',
        distance: '3.2 mi',
        condition: 'Like New'
      },
      {
        type: 'marketplace',
        id: 'market-5',
        title: 'Bicycle - Trek Mountain Bike',
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        price: '$280',
        distance: '1.9 mi',
        condition: 'Good'
      },
      {
        type: 'marketplace',
        id: 'market-6',
        title: 'Mini Fridge - Almost New',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400',
        price: '$80',
        distance: '0.5 mi',
        condition: 'Excellent'
      }
    ];
  }

  getEventItems(): CarouselItem[] {
    return [
      {
        type: 'event',
        id: 'event-1',
        title: 'Campus Networking Mixer',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        date: 'Fri, Dec 8 • 7:00 PM',
        location: 'Student Center'
      },
      {
        type: 'event',
        id: 'event-2',
        title: 'Tech Career Fair 2024',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
        date: 'Sat, Dec 9 • 10:00 AM',
        location: 'Main Auditorium'
      },
      {
        type: 'event',
        id: 'event-3',
        title: 'Winter Sports Meetup',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        date: 'Sun, Dec 10 • 2:00 PM',
        location: 'Recreation Center'
      },
      {
        type: 'event',
        id: 'event-4',
        title: 'Coffee & Code Workshop',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
        date: 'Mon, Dec 11 • 4:00 PM',
        location: 'Engineering Building'
      }
    ];
  }

  // New carousel control methods with drag/swipe support
  scrollCarousel(direction: 'left' | 'right') {
    const container = this.carouselContainers.first?.nativeElement;
    if (!container) return;

    // Pause auto-scroll temporarily
    this.stopAutoScrollWithRestart();

    // Scroll by one card width (260px) + gap (24px) = 284px
    const cardWidth = 260;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  canScrollLeft(): boolean {
    const state = this.carouselScrollStates().get(0);
    return state?.canScrollLeft ?? false;
  }

  canScrollRight(): boolean {
    const state = this.carouselScrollStates().get(0);
    return state?.canScrollRight ?? false;
  }

  onCarouselScroll(event: Event) {
    const container = event.target as HTMLDivElement;
    const newStates = new Map(this.carouselScrollStates());
    
    newStates.set(0, {
      ...newStates.get(0)!,
      canScrollLeft: container.scrollLeft > 10,
      canScrollRight: container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    });
    
    this.carouselScrollStates.set(newStates);
  }

  // Drag functionality
  onDragStart(event: MouseEvent) {
    const container = this.carouselContainers.first?.nativeElement;
    if (!container) return;
    
    // Stop auto-scroll temporarily when user starts dragging
    this.stopAutoScrollWithRestart();
    
    const newStates = new Map(this.carouselScrollStates());
    
    newStates.set(0, {
      ...newStates.get(0)!,
      isDragging: true,
      startX: event.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft
    });
    
    this.carouselScrollStates.set(newStates);
    container.style.cursor = 'grabbing';
  }

  onDragMove(event: MouseEvent) {
    const state = this.carouselScrollStates().get(0);
    if (!state?.isDragging) return;

    event.preventDefault();
    const container = this.carouselContainers.first?.nativeElement;
    if (!container) return;

    const x = event.pageX - container.offsetLeft;
    const walk = (x - state.startX) * 2; // Multiply for faster scroll
    container.scrollLeft = state.scrollLeft - walk;
  }

  onDragEnd() {
    const container = this.carouselContainers.first?.nativeElement;
    if (!container) return;

    const newStates = new Map(this.carouselScrollStates());
    const state = newStates.get(0);
    
    if (state) {
      newStates.set(0, {
        ...state,
        isDragging: false
      });
      this.carouselScrollStates.set(newStates);
    }
    
    container.style.cursor = 'grab';
  }

  // Touch support
  onTouchStart(event: TouchEvent) {
    const container = this.carouselContainers.first?.nativeElement;
    if (!container) return;
    
    const touch = event.touches[0];
    const newStates = new Map(this.carouselScrollStates());
    
    newStates.set(0, {
      ...newStates.get(0)!,
      isDragging: true,
      startX: touch.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft
    });
    
    this.carouselScrollStates.set(newStates);
  }

  onTouchMove(event: TouchEvent) {
    const state = this.carouselScrollStates().get(0);
    if (!state?.isDragging) return;

    const container = this.carouselContainers.first?.nativeElement;
    if (!container) return;

    const touch = event.touches[0];
    const x = touch.pageX - container.offsetLeft;
    const walk = (x - state.startX) * 2;
    container.scrollLeft = state.scrollLeft - walk;
  }

  onTouchEnd() {
    const newStates = new Map(this.carouselScrollStates());
    const state = newStates.get(0);
    
    if (state) {
      newStates.set(0, {
        ...state,
        isDragging: false
      });
      this.carouselScrollStates.set(newStates);
    }
  }
  
  // Get category badge info for mixed carousel cards
  getCategoryBadge(type: string): { icon: string; label: string; bgClass: string; textClass: string } {
    switch (type) {
      case 'ride':
        return { icon: '🚗', label: 'Ride', bgClass: 'bg-blue-500', textClass: 'text-white' };
      case 'marketplace':
        return { icon: '🛍️', label: 'Marketplace', bgClass: 'bg-purple-500', textClass: 'text-white' };
      case 'event':
        return { icon: '🎉', label: 'Event', bgClass: 'bg-orange-500', textClass: 'text-white' };
      default:
        return { icon: '📌', label: 'Item', bgClass: 'bg-gray-500', textClass: 'text-white' };
    }
  }
  
  // Get micro-details for cards
  getCardMicroDetails(item: CarouselItem): string {
    switch (item.type) {
      case 'ride':
        return `${item.distance} • ${item.seats} seats left`;
      case 'marketplace':
        return `${item.distance} • ${item.condition}`;
      case 'event':
        return `${item.date?.split('•')[0].trim()} • ${item.location}`;
      default:
        return '';
    }
  }
  
  // Navigate to unified explore feed
  navigateToExploreFeed(): void {
    this.router.navigate(['/explore']);
  }

  private getCarouselContainer(categoryIndex: number): HTMLDivElement | null {
    if (!this.carouselContainers) return null;
    const containers = this.carouselContainers.toArray();
    return containers[categoryIndex]?.nativeElement || null;
  }

  ngAfterViewInit() {
    // Initialize scroll states for all categories
    setTimeout(() => {
      const newStates = new Map<number, any>();
      this.carouselContainers.forEach((container, index) => {
        const el = container.nativeElement;
        newStates.set(index, {
          canScrollLeft: false,
          canScrollRight: el.scrollWidth > el.clientWidth,
          isDragging: false,
          startX: 0,
          scrollLeft: 0
        });
      });
      this.carouselScrollStates.set(newStates);
      
      // Start auto-scroll for unified carousel
      this.startAutoScroll();
      
      // Initialize Google Map with JavaScript API for custom markers
      this.initializeMapWithMarkers();
    }, 100);
  }
  
  // Auto-scroll functionality
  startAutoScroll(): void {
    if (this.autoScrollInterval) return;
    
    const CARD_WIDTH = 260;
    const GAP = 24;
    const SCROLL_INTERVAL = 6000; // 6 seconds between scrolls
    
    this.autoScrollInterval = setInterval(() => {
      if (this.isAutoScrollPaused()) return;
      
      const container = this.carouselContainers.first?.nativeElement;
      if (!container) return;
      
      const scrollAmount = CARD_WIDTH + GAP; // Scroll by exactly one card
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      
      // Check if we're at or near the end
      if (currentScroll >= maxScroll - 10) {
        // Loop back to start
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll to next card
        container.scrollTo({ 
          left: currentScroll + scrollAmount, 
          behavior: 'smooth' 
        });
      }
    }, SCROLL_INTERVAL);
  }
  
  pauseAutoScroll(): void {
    this.isAutoScrollPaused.set(true);
  }
  
  resumeAutoScroll(): void {
    this.isAutoScrollPaused.set(false);
  }
  
  stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }
  
  // Stop auto-scroll and restart after 5 seconds
  stopAutoScrollWithRestart(): void {
    this.stopAutoScroll();
    
    // Clear any existing restart timeout
    if (this.autoScrollRestartTimeout) {
      clearTimeout(this.autoScrollRestartTimeout);
    }
    
    // Restart after 5 seconds
    this.autoScrollRestartTimeout = setTimeout(() => {
      this.startAutoScroll();
    }, 5000);
  }

  navigateToCategory(categoryId: string) {
    console.log('Navigate to:', categoryId);
    // TODO: Implement navigation
  }

  onCarouselCardClick(item: CarouselItem) {
    console.log('Carousel card clicked:', item);
    // TODO: Navigate to appropriate detail page based on item type
  }

  trackByCarouselItem(index: number, item: CarouselItem): string {
    return item.id;
  }

  // Interest pill color classes
  getInterestPillClass(interest: string): string {
    const colors = [
      'bg-blue-50 text-blue-700',
      'bg-purple-50 text-purple-700',
      'bg-green-50 text-green-700',
      'bg-pink-50 text-pink-700',
      'bg-orange-50 text-orange-700',
      'bg-cyan-50 text-cyan-700'
    ];
    // Use a simple hash to consistently assign colors
    const hash = interest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  // Card hover for map highlighting
  onCardHover(user: DirectoryUser) {
    this.hoveredUser.set(user);
    // TODO: Highlight user on map
  }

  onCardLeave() {
    this.hoveredUser.set(null);
    // TODO: Remove map highlight
  }

  // Utility: isActive - user active in last 24 hours
  isActive(user: DummyUser | DirectoryUser): boolean {
    if (!user.lastSeen) return false;
    const lastSeen = Date.parse(user.lastSeen);
    if (Number.isNaN(lastSeen)) return false;
    const diffMs = Date.now() - lastSeen;
    return diffMs <= 24 * 60 * 60 * 1000; // 24 hours
  }

  // Convert DummyUser to DirectoryUser is not needed - DummyUser extends DirectoryUser

  // Role badge methods
  getUserRoles(user: DirectoryUser): string[] {
    const roles: string[] = [];
    // Mock implementation - in production, this would come from user.roles
    if (user.role?.toLowerCase().includes('student')) roles.push('Student');
    // Add more role logic based on user activity/profile
    return roles;
  }

  getRoleBadgeClass(role: string): string {
    const roleClasses: Record<string, string> = {
      'Host': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Driver': 'bg-green-50 text-green-700 border border-green-200',
      'Trader': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Guide': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Senior': 'bg-gray-50 text-gray-700 border border-gray-200',
      'Student': 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    };
    return roleClasses[role] || 'bg-gray-50 text-gray-700 border border-gray-200';
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'Host': '🏠',
      'Driver': '🚗',
      'Trader': '📦',
      'Guide': '🗺️',
      'Senior': '🎓',
      'Student': '📚'
    };
    return icons[role] || '✨';
  }

  getMutualInterests(user: DirectoryUser): string[] {
    // Mock implementation - would come from backend
    return ['Coffee Spots', 'Gaming', 'Photography'].slice(0, 2);
  }

  getTrustScore(user: DirectoryUser): number {
    // Calculate trust score based on verifications
    let score = 0;
    if (user.badges?.email) score += 25;
    if (user.badges?.phone) score += 25;
    if (user.badges?.university) score += 30;
    if (user.badges?.photo) score += 20;
    return score;
  }

  // Action methods
  openProfilePreview(user: DirectoryUser) {
    // Find the full DummyUser (which extends DirectoryUser)
    const dummyUser = this.dummySvc.getAllUsers().find(u => u.id === user.id);
    if (dummyUser) {
      this.selectedUser.set(dummyUser);
      this.showProfileModal.set(true);
    }
  }

  closeProfileModal() {
    this.showProfileModal.set(false);
    this.selectedUser.set(undefined);
  }

  // Modal event handlers (don't need stopPropagation since modal prevents bubbling)
  onModalConnect(user: DummyUser) {
    console.log('Connect with', user.name);
    // TODO: Implement connect logic
  }

  onModalMessage(user: DummyUser) {
    console.log('Message', user.name);
    // TODO: Implement messaging
  }

  onModalSave(user: DummyUser) {
    const saved = new Set(this.savedUsers());
    if (saved.has(user.id)) {
      saved.delete(user.id);
    } else {
      saved.add(user.id);
    }
    this.savedUsers.set(saved);
  }

  connect(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    console.log('Connect with', user.name);
    // TODO: Implement connect logic
  }

  message(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    console.log('Message', user.name);
    // TODO: Implement messaging
  }

  save(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    this.toggleSave(user, event);
  }

  isSaved(user: DirectoryUser): boolean {
    return this.savedUsers().has(user.id);
  }

  toggleSave(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    const saved = new Set(this.savedUsers());
    if (saved.has(user.id)) {
      saved.delete(user.id);
    } else {
      saved.add(user.id);
    }
    this.savedUsers.set(saved);
  }

  wave(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    console.log('Wave to', user.name);
    // TODO: Send wave notification
  }

  appreciate(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    console.log('Appreciate', user.name);
    // TODO: Send appreciation
  }

  askQuestion(user: DirectoryUser, event: Event) {
    event.stopPropagation();
    console.log('Ask question to', user.name);
    // TODO: Open message with pre-filled question
  }

  onMapSearch() {
    console.log('Map search:', this.mapSearch);
    // TODO: Implement map search
  }

  openMapPreferences() {
    console.log('Opening map preferences');
    // TODO: Open preferences modal
  }

  isOnline(user: DirectoryUser): boolean {
    const onlineMap = this.presence.online();
    if (onlineMap.has(user.id)) return true;
    const iso = this.activityIso(user);
    const lastSeen = iso ? Date.parse(iso) : NaN;
    if (Number.isNaN(lastSeen)) return false;
    const diffMs = Date.now() - lastSeen;
    return diffMs <= 5 * 60 * 1000; // 5 minutes window
  }

  statusLabel(user: DirectoryUser): string {
    if (this.isOnline(user)) return 'Online now';
    const iso = this.activityIso(user);
    if (!iso) return '';
    const timestamp = Date.parse(iso);
    if (Number.isNaN(timestamp)) return '';
    const diff = Date.now() - timestamp;
    if (diff < 0) return '';
    if (diff < 60_000) return 'Active just now';
    if (diff < 3_600_000) {
      const mins = Math.floor(diff / 60_000);
      return `Active ${mins} min${mins > 1 ? 's' : ''} ago`;
    }
    if (diff < 86_400_000) return 'Active today';
    const days = Math.floor(diff / 86_400_000);
    if (days === 1) return 'Active 1 day ago';
    if (days < 7) return `Active ${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return 'Active 1 week ago';
    if (weeks < 5) return `Active ${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return 'Active 1 month ago';
    if (months < 12) return `Active ${months} months ago`;
    const years = Math.floor(days / 365);
    return years === 1 ? 'Active 1 year ago' : `Active ${years} years ago`;
  }

  presenceTitle(user: DirectoryUser): string {
    const label = this.statusLabel(user);
    if (!label) return 'No activity yet';
    const detail = this.activityTitle(user);
    return detail ? `${label} • ${detail}` : label;
  }

  private activityIso(user: DirectoryUser): string | undefined {
    return user.lastSeen || user.lastLoginAt || undefined;
  }

  private activityValue(user: DirectoryUser): number {
    const iso = this.activityIso(user);
    if (!iso) return 0;
    const ms = Date.parse(iso);
    return Number.isNaN(ms) ? 0 : ms;
  }

  private roleToken(user: DirectoryUser): 'student' | 'professional' | 'other' {
    const role = (user.role || '').toLowerCase();
    if (role === 'student' || role === 'professional') return role;
    return 'other';
  }

  private locationContains(user: DirectoryUser, token: string): boolean {
    const haystacks = [user.city, user.state, user.country, user.location];
    return haystacks.some(val => typeof val === 'string' && val.toLowerCase().includes(token));
  }

  private activityTitle(user: DirectoryUser): string {
    const iso = this.activityIso(user);
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return '';
    }
  }

  private startPresencePolling(){
    if (this.presenceInterval) return;
    this.presence.fetchOnline();
    this.presenceInterval = setInterval(() => this.presence.fetchOnline(), 15000);
  }

  private stopPresencePolling(){
    if (this.presenceInterval) {
      try { clearInterval(this.presenceInterval); } catch {}
      this.presenceInterval = null;
    }
  }

  // New methods for redesigned template

  // Feature stats for hero section
  newJoinersToday = computed(() => {
    // Calculate users who joined in the last 24 hours
    const allUsers = this.dummySvc.getAllUsers();
    // Mock: Return a realistic number
    return 8;
  });

  universityCount = computed(() => {
    // Count unique universities
    const allUsers = this.dummySvc.getAllUsers();
    const universities = new Set(allUsers.map(u => u.organization).filter(Boolean));
    return universities.size;
  });

  // Pagination for main cards section
  private pageSize = 12;
  currentPage = signal(1);

  paginatedUsers = computed(() => {
    const filtered = this.filtered();
    const page = this.currentPage();
    return filtered.slice(0, page * this.pageSize);
  });

  hasMoreToLoad = computed(() => {
    const filtered = this.filtered();
    const page = this.currentPage();
    return filtered.length > page * this.pageSize;
  });

  loadMoreUsers() {
    this.currentPage.update(p => p + 1);
  }

  // Map pins with dummy positions (DEPRECATED - using real Google Maps now)
  getMapPins(): Array<{ user: DummyUser; x: number; y: number }> {
    const onlineUsers = this.dummySvc.getOnlineUsers().slice(0, 10);
    // Generate random but fixed positions for each user based on their ID
    return onlineUsers.map((user, i) => ({
      user,
      x: 15 + (i * 7) % 70, // Spread horizontally
      y: 20 + (i * 11) % 60  // Spread vertically
    }));
  }

  // ========== GOOGLE MAPS INTEGRATION WITH CUSTOM PEOPLE MARKERS ==========
  
  /**
   * Initialize Google Map with custom people markers
   * ALWAYS centers on user's real GPS location
   */
  async initializeMapWithMarkers(): Promise<void> {
    try {
      this.isLoadingMap.set(true);
      this.mapError.set(null);

      // Wait for Google Maps API to be ready
      await this.waitForGoogleMaps();

      if (!this.mapContainer) {
        throw new Error('Map container not available');
      }

      // CRITICAL: Get user's REAL current location (GPS with browser permission)
      console.log('🗺️ Requesting your real location...');
      const location = await this.locationSvc.getCurrentLocation();
      
      if (!location) {
        throw new Error('Location access is required for People Nearby map. Please enable location permissions in your browser.');
      }

      // Set user location from GPS/IP
      this.userLocation.set({ lat: location.lat, lng: location.lng });
      this.mapCenter.set({ lat: location.lat, lng: location.lng });
      console.log('✅ Map will center on YOUR location:', location);

      // Initialize the map centered on user's REAL location
      const mapOptions = {
        center: this.mapCenter(),
        zoom: 13, // Closer zoom - neighborhood level (shows ~3-5 mile radius)
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: this.getMapStyles(),
        gestureHandling: 'cooperative',
        zoomControl: true
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

      // IMMEDIATELY center and zoom on user's location
      this.map.setCenter(this.mapCenter());
      this.map.setZoom(13);
      console.log('🎯 Map centered on YOUR location:', this.mapCenter());

      // Add user's location marker (blue dot) - ALWAYS show YOUR position
      if (this.userLocation()) {
        this.addUserLocationMarker();
        console.log('📍 Blue dot added at YOUR position:', this.userLocation());
        
        // FORCE center on user after marker is added
        this.map.panTo(this.userLocation()!);
      }

      // Add people markers (only those near YOU) - this happens AFTER centering on you
      console.log('👥 Adding people markers around you...');
      await this.addPeopleMarkers();

      // Adjust zoom to show you + nearby people (but keep you centered)
      if (this.markers.length > 0) {
        this.fitMapBoundsToNearbyPeople();
      }
      // If no markers, stay zoomed on user location (don't zoom out)

      this.isLoadingMap.set(false);
      console.log('✅ Map loaded and centered on YOUR location at zoom 13');
    } catch (error: any) {
      console.error('Error initializing map:', error);
      
      // Check for specific Google Maps errors
      if (error?.message?.includes('ApiNotActivatedMapError')) {
        this.mapError.set('Google Maps API key not activated. Please enable billing in Google Cloud Console.');
      } else if (error?.message?.includes('BillingNotEnabledMapError')) {
        this.mapError.set('Google Maps billing not enabled. Map features require an active billing account.');
      } else if (error?.message?.includes('InvalidKeyMapError')) {
        this.mapError.set('Invalid Google Maps API key. Please check your API key configuration.');
      } else {
        this.mapError.set(error instanceof Error ? error.message : 'Failed to load map. Please try again.');
      }
      
      this.isLoadingMap.set(false);
    }
  }

  /**
   * Wait for Google Maps API to load (with callback check)
   */
  private waitForGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check for authentication errors first
      if ((window as any).googleMapsError) {
        reject(new Error((window as any).googleMapsError));
        return;
      }

      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }

      if ((window as any).googleMapsLoaded) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;
      
      const interval = setInterval(() => {
        attempts++;
        
        // Check for errors during polling
        if ((window as any).googleMapsError) {
          clearInterval(interval);
          reject(new Error((window as any).googleMapsError));
        } else if (typeof google !== 'undefined' && google.maps) {
          clearInterval(interval);
          resolve();
        } else if ((window as any).googleMapsLoaded) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Maps failed to load. Please check your internet connection.'));
        }
      }, 100);
    });
  }

  /**
   * Add user's current location marker (small blue dot with pulsing effect)
   */
  private addUserLocationMarker(): void {
    if (!this.map || !this.userLocation()) return;

    const userLoc = this.userLocation()!;
    
    this.userLocationMarker = new google.maps.Marker({
      position: userLoc,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,  // Smaller to match new marker size
        fillColor: '#4E7BFD',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      title: 'You are here',
      zIndex: 2000,
      animation: google.maps.Animation.DROP,
      optimized: false  // Fixed size at all zoom levels
    });

    const infoWindow = new google.maps.InfoWindow({
      content: '<div style="padding: 8px 12px; font-weight: 600; color: #4E7BFD; font-size: 13px;">📍 You are here</div>'
    });

    this.userLocationMarker.addListener('click', () => {
      infoWindow.open(this.map, this.userLocationMarker);
    });
  }

  /**
   * Add people markers with profile pictures and status colors
   */
  private async addPeopleMarkers(): Promise<void> {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach((marker: any) => marker.setMap(null));
    this.markers = [];

    // Get people with coordinates
    const peopleWithCoords = await this.getPeopleWithCoordinates();
    this.filteredPeople.set(peopleWithCoords);

    // Create markers with profile images (async)
    for (const person of peopleWithCoords) {
      const icon = await this.createPersonMarkerIcon(person);
      
      const marker = new google.maps.Marker({
        position: { lat: person.lat, lng: person.lng },
        map: this.map,
        icon: icon,
        title: person.name,
        optimized: false,
        zIndex: this.isOnline(person) ? 1500 : 1000
      });

      // Add click handler to show info window
      marker.addListener('click', () => {
        this.showPersonInfoWindow(marker, person);
      });

      // Add hover effect
      marker.addListener('mouseover', () => {
        marker.setZIndex(1600);
      });

      marker.addListener('mouseout', () => {
        marker.setZIndex(this.isOnline(person) ? 1500 : 1000);
      });

      this.markers.push(marker);
    }
  }

  /**
   * Create custom marker icon with person's profile picture and status border
   * Small, clean, high-quality design (30-36px)
   */
  private createPersonMarkerIcon(person: any): any {
    const statusColor = this.isOnline(person) ? '#00C853' : // Green = Online
                       this.isActive(person) ? '#2979FF' :   // Blue = Active  
                       '#9E9E9E';                             // Grey = Offline

    // Small, clean marker size (Snapchat/WhatsApp style)
    const size = 34;
    const borderWidth = 2.5;
    
    // Create canvas to draw the marker
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    
    // Draw white background circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 1, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Reset shadow for border
    ctx.shadowColor = 'transparent';
    
    // Draw status border
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - borderWidth/2, 0, 2 * Math.PI);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    
    // Load and draw profile image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Use the avatar URL or fallback
    const avatarUrl = person.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=128&background=4E7BFD&color=fff&bold=true`;
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Clip to circle for profile image
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, (size/2) - borderWidth - 1, 0, 2 * Math.PI);
        ctx.clip();
        
        // Draw image centered and cropped
        const imgSize = size - (borderWidth * 2) - 2;
        ctx.drawImage(img, borderWidth + 1, borderWidth + 1, imgSize, imgSize);
        ctx.restore();
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        resolve({
          url: dataUrl,
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size/2, size/2),
          optimized: false
        });
      };
      
      img.onerror = () => {
        // Fallback: create a colored circle with initials
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, (size/2) - borderWidth - 1, 0, 2 * Math.PI);
        ctx.fillStyle = '#4E7BFD';
        ctx.fill();
        
        // Draw initials
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = person.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        ctx.fillText(initials, size/2, size/2);
        ctx.restore();
        
        const dataUrl = canvas.toDataURL('image/png');
        
        resolve({
          url: dataUrl,
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size/2, size/2),
          optimized: false
        });
      };
      
      img.src = avatarUrl;
    });
  }

  /**
   * Show info window when marker is clicked
   */
  private showPersonInfoWindow(marker: any, person: any): void {
    const distance = this.userLocation() 
      ? this.locationSvc.calculateDistance(
          this.userLocation()!.lat,
          this.userLocation()!.lng,
          person.lat,
          person.lng
        ).toFixed(1)
      : 'N/A';

    const statusText = this.isOnline(person) ? '<span style="color: #00C853;">🟢 Online Now</span>' :
                       this.isActive(person) ? '<span style="color: #2979FF;">🔵 Active Recently</span>' : 
                       '<span style="color: #9E9E9E;">⚪ Active Today</span>';

    const content = `
      <div style="padding: 16px; min-width: 240px; font-family: -apple-system, system-ui, sans-serif;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <img src="${person.avatarUrl || '/assets/default-avatar.svg'}" 
               style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid #4E7BFD; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 16px; color: #1f2937; margin-bottom: 2px;">${person.name}</div>
            <div style="font-size: 13px; color: #6b7280;">${person.organization || person.university || 'University'}</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">📍 ${person.location || person.city || 'Unknown'}</div>
          </div>
        </div>
        
        <div style="padding: 10px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 12px 0;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">${statusText}</div>
          <div style="font-size: 12px; color: #6b7280;">📏 ${distance} km away</div>
        </div>
        
        <button onclick="document.dispatchEvent(new CustomEvent('viewPersonProfile', { detail: '${person.uid}' }))" 
                style="width: 100%; padding: 10px; background: linear-gradient(135deg, #4E7BFD 0%, #3D6AEC 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(78, 123, 253, 0.3); transition: all 0.2s;">
          View Full Profile
        </button>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({ 
      content,
      maxWidth: 280
    });
    
    infoWindow.open(this.map, marker);
  }

  /**
   * Get people with coordinates (geocode if needed)
   * Filters to show only nearby people around USER's location (within ~50 miles)
   */
  private async getPeopleWithCoordinates(): Promise<any[]> {
    const allPeople = this.dummySvc.getOnlineUsers();
    const searchTerm = this.searchQuery().toLowerCase();
    
    // Filter by search query
    const filtered = searchTerm 
      ? allPeople.filter((p: DummyUser) => 
          p.name.toLowerCase().includes(searchTerm) ||
          (p.organization?.toLowerCase().includes(searchTerm)) ||
          (p.location?.toLowerCase().includes(searchTerm))
        )
      : allPeople;

    const peopleWithCoords: any[] = [];
    const userLoc = this.userLocation();
    
    // REQUIRE user location - don't use fallback coordinates
    if (!userLoc) {
      console.warn('⚠️ Cannot show people markers without user location');
      return [];
    }
    
    console.log('📍 Placing people markers around YOUR location:', userLoc);
    
    // Default radius for "nearby" people (in degrees, roughly 50 miles)
    const NEARBY_RADIUS = 0.8; // ~50 miles radius

    for (let i = 0; i < filtered.slice(0, 50).length; i++) { // Limit to 50 markers for performance
      const person = filtered[i];
      let coords = null;

      // Try geocoding first (will fail if API key invalid, but that's okay)
      if (person.location && typeof person.location === 'string') {
        try {
          coords = await this.locationSvc.geocodeAddress(person.location);
        } catch (err) {
          // Geocoding failed, use fallback
          coords = null;
        }
      }

      // Fallback: place markers NEAR user location (not across entire U.S.)
      if (!coords) {
        const angle = (i / filtered.length) * 2 * Math.PI;
        const radius = 0.05 + (Math.random() * NEARBY_RADIUS); // 5-50 mile radius
        coords = {
          lat: userLoc.lat + radius * Math.cos(angle),
          lng: userLoc.lng + radius * Math.sin(angle)
        };
      } else {
        // Add small random offset to avoid exact overlaps
        coords.lat += (Math.random() - 0.5) * 0.015; // ~750m variation
        coords.lng += (Math.random() - 0.5) * 0.015;
      }

      // Calculate distance from user
      const distance = this.locationSvc.calculateDistance(
        userLoc.lat,
        userLoc.lng,
        coords.lat,
        coords.lng
      );

      peopleWithCoords.push({
        ...person,
        lat: coords.lat,
        lng: coords.lng,
        distance: distance
      });
    }

    // Sort by distance (closest first)
    peopleWithCoords.sort((a, b) => a.distance - b.distance);

    return peopleWithCoords;
  }

  /**
   * Fit map bounds to show user + nearby people
   * ALWAYS keeps user centered, just adjusts zoom to include nearby markers
   */
  private fitMapBoundsToNearbyPeople(): void {
    if (!this.map) return;

    const userLoc = this.userLocation();
    if (!userLoc) return;

    // If no markers, stay zoomed on user (don't change anything)
    if (this.markers.length === 0) {
      console.log('📍 No markers to show, keeping map centered on you at zoom 13');
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    
    // ALWAYS include user's location first (priority)
    bounds.extend(userLoc);

    // Include markers (they're already filtered to nearby)
    this.markers.forEach((marker: any) => {
      bounds.extend(marker.getPosition());
    });

    // Fit bounds with generous padding
    this.map.fitBounds(bounds, {
      top: 80,
      bottom: 80,
      left: 80,
      right: 80
    });

    // CRITICAL: Ensure we don't zoom out too much (stay close to user)
    setTimeout(() => {
      const currentZoom = this.map.getZoom();
      if (currentZoom && currentZoom > 14) {
        this.map.setZoom(14); // Max zoom in (close neighborhood)
      } else if (currentZoom && currentZoom < 11) {
        // Don't zoom out past city level - keep user visible
        this.map.setZoom(11);
        console.log('🔍 Adjusted zoom to 11 to keep you visible');
      }
      
      // Re-center on user to ensure they stay in view
      this.map.panTo(userLoc);
      console.log('🎯 Re-centered on YOUR position after adding markers');
    }, 200);
  }

  /**
   * Fit map bounds to show all people markers
   */
  private fitMapBounds(): void {
    if (!this.map || this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    // Include user's location
    if (this.userLocation()) {
      bounds.extend(this.userLocation()!);
    }

    // Include all people markers
    this.markers.forEach((marker: any) => {
      bounds.extend(marker.getPosition());
    });

    this.map.fitBounds(bounds);

    // Set reasonable zoom limits
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      const zoom = this.map.getZoom();
      if (zoom > 15) this.map.setZoom(15);
      if (zoom < 10) this.map.setZoom(10);
    });
  }

  /**
   * Premium map styles (Apple Maps inspired)
   */
  private getMapStyles(): any[] {
    return [
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#E3F2FD' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#FAFAFA' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#EEEEEE' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E8F5E9' }] },
      { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
      { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }
    ];
  }

  /**
   * Search people and update markers
   */
  async searchPeople(query: string): Promise<void> {
    this.searchQuery.set(query);
    await this.addPeopleMarkers();
    
    if (this.markers.length > 0) {
      this.fitMapBounds();
    }
  }

  /**
   * Refresh markers (for real-time updates)
   */
  async refreshMarkers(): Promise<void> {
    await this.addPeopleMarkers();
  }

  /**
   * Center map on specific person
   */
  centerOnPerson(person: any): void {
    if (!this.map) return;
    
    const marker = this.markers.find((m: any) => 
      m.getPosition().lat() === person.lat && 
      m.getPosition().lng() === person.lng
    );
    
    if (marker) {
      this.map.panTo(marker.getPosition());
      this.map.setZoom(14);
      google.maps.event.trigger(marker, 'click');
    }
  }

  /**
   * Recenter map to user location with nearby people
   */
  recenterMap(): void {
    if (!this.map) return;
    
    if (this.userLocation()) {
      // Recenter on user and show nearby people
      this.fitMapBoundsToNearbyPeople();
    } else {
      // Fallback: fit all markers
      this.fitMapBounds();
    }
  }

  expandMap(): void {
    if (this.userLocation()) {
      const url = `https://www.google.com/maps?q=${this.userLocation()!.lat},${this.userLocation()!.lng}&z=13`;
      window.open(url, '_blank');
    } else {
      window.open('https://www.google.com/maps', '_blank');
    }
  }
}
