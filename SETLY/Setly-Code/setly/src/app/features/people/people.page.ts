import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, signal, OnDestroy, OnInit, effect, EffectRef, Injector, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeopleDirectoryService, DirectoryUser } from '../../core/services/people-directory.service';
import { PeopleFilters, PeopleFiltersPanelComponent } from './components/people-filters-panel.component';
import { PresenceService } from '../../core/services/presence.service';
import { AuthStore } from '../../core/state/auth.store';
import { DummyPeopleService, DummyUser } from '../../core/services/dummy-people.service';
import { ProfilePreviewModalComponent } from './components/profile-preview-modal.component';

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
  `]
})
export class PeoplePage implements OnInit, OnDestroy, AfterViewInit {
  private svc = inject(PeopleDirectoryService);
  private presence = inject(PresenceService);
  private authStore = inject(AuthStore);
  private injector = inject(Injector);
  private dummySvc = inject(DummyPeopleService);
  
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
  
  hoveredUser = signal<DirectoryUser | null>(null);
  
  // QueryList to access carousel container elements
  @ViewChildren('carouselContainer') carouselContainers!: QueryList<ElementRef<HTMLDivElement>>;

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
  }

  ngOnDestroy(): void {
    this.stopPresencePolling();
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

  // Carousel categories with mixed content
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
  scrollCarousel(categoryIndex: number, direction: 'left' | 'right') {
    const container = this.getCarouselContainer(categoryIndex);
    if (!container) return;

    const scrollAmount = 320; // Card width (300px) + gap (20px)
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  canScrollLeft(categoryIndex: number): boolean {
    const state = this.carouselScrollStates().get(categoryIndex);
    return state?.canScrollLeft ?? false;
  }

  canScrollRight(categoryIndex: number): boolean {
    const state = this.carouselScrollStates().get(categoryIndex);
    return state?.canScrollRight ?? false;
  }

  onCarouselScroll(categoryIndex: number, event: Event) {
    const container = event.target as HTMLDivElement;
    const newStates = new Map(this.carouselScrollStates());
    
    newStates.set(categoryIndex, {
      ...newStates.get(categoryIndex)!,
      canScrollLeft: container.scrollLeft > 10,
      canScrollRight: container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    });
    
    this.carouselScrollStates.set(newStates);
  }

  // Drag functionality
  onDragStart(event: MouseEvent, categoryIndex: number) {
    const container = event.target as HTMLDivElement;
    const newStates = new Map(this.carouselScrollStates());
    
    newStates.set(categoryIndex, {
      ...newStates.get(categoryIndex)!,
      isDragging: true,
      startX: event.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft
    });
    
    this.carouselScrollStates.set(newStates);
    container.style.cursor = 'grabbing';
  }

  onDragMove(event: MouseEvent, categoryIndex: number) {
    const state = this.carouselScrollStates().get(categoryIndex);
    if (!state?.isDragging) return;

    event.preventDefault();
    const container = this.getCarouselContainer(categoryIndex);
    if (!container) return;

    const x = event.pageX - container.offsetLeft;
    const walk = (x - state.startX) * 2; // Multiply for faster scroll
    container.scrollLeft = state.scrollLeft - walk;
  }

  onDragEnd(categoryIndex: number) {
    const container = this.getCarouselContainer(categoryIndex);
    if (!container) return;

    const newStates = new Map(this.carouselScrollStates());
    const state = newStates.get(categoryIndex);
    
    if (state) {
      newStates.set(categoryIndex, {
        ...state,
        isDragging: false
      });
      this.carouselScrollStates.set(newStates);
    }
    
    container.style.cursor = 'grab';
  }

  // Touch support
  onTouchStart(event: TouchEvent, categoryIndex: number) {
    const container = event.target as HTMLDivElement;
    const touch = event.touches[0];
    const newStates = new Map(this.carouselScrollStates());
    
    newStates.set(categoryIndex, {
      ...newStates.get(categoryIndex)!,
      isDragging: true,
      startX: touch.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft
    });
    
    this.carouselScrollStates.set(newStates);
  }

  onTouchMove(event: TouchEvent, categoryIndex: number) {
    const state = this.carouselScrollStates().get(categoryIndex);
    if (!state?.isDragging) return;

    const container = this.getCarouselContainer(categoryIndex);
    if (!container) return;

    const touch = event.touches[0];
    const x = touch.pageX - container.offsetLeft;
    const walk = (x - state.startX) * 2;
    container.scrollLeft = state.scrollLeft - walk;
  }

  onTouchEnd(categoryIndex: number) {
    const newStates = new Map(this.carouselScrollStates());
    const state = newStates.get(categoryIndex);
    
    if (state) {
      newStates.set(categoryIndex, {
        ...state,
        isDragging: false
      });
      this.carouselScrollStates.set(newStates);
    }
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
    }, 100);
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

  // Map pins with dummy positions
  getMapPins(): Array<{ user: DummyUser; x: number; y: number }> {
    const onlineUsers = this.dummySvc.getOnlineUsers().slice(0, 10);
    // Generate random but fixed positions for each user based on their ID
    return onlineUsers.map((user, i) => ({
      user,
      x: 15 + (i * 7) % 70, // Spread horizontally
      y: 20 + (i * 11) % 60  // Spread vertically
    }));
  }
}
