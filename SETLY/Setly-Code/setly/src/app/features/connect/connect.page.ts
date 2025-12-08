import { Component, OnDestroy, Signal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ConnectFeedService } from '../../core/services/connect-feed.service';
import { ConnectFiltersService } from '../../core/services/connect-filters.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AnyConnectPost, ConnectFeedResponse } from './models/connect.models';
import { ConnectFiltersPanelComponent } from './components/connect-filters-panel.component';
import { ConnectFeedComponent } from './components/connect-feed.component';
import { PeopleDirectoryComponent } from './components/people-directory.component';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';
import { CampusHighlightsComponent } from './components/campus-highlights.component';
import { PeopleNearYouComponent } from './components/people-near-you.component';
import { TrendingTopicsComponent } from './components/trending-topics.component';
import { FilterDrawerComponent } from './components/filter-drawer.component';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ConnectFiltersPanelComponent, 
    ConnectFeedComponent, 
    PeopleDirectoryComponent, 
    ToastContainerComponent,
    CampusHighlightsComponent,
    PeopleNearYouComponent,
    TrendingTopicsComponent,
    FilterDrawerComponent
  ],
  templateUrl: './connect.page.html',
  styleUrls: ['./connect.page.scss']
})
export class ConnectPage implements OnDestroy {
  // Services
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private feedService = inject(ConnectFeedService);
  private filtersService = inject(ConnectFiltersService);
  analytics = inject(AnalyticsService);

  // UI state
  tabs = ['All', 'People', 'Rooms', 'Rides', 'Marketplace', 'Topics'];
  activeTab = signal<string>('All');
  sort = signal<'trending' | 'new' | 'near'>('trending');
  showMobileFilters = signal<boolean>(false);
  showSkeleton = signal<boolean>(false);
  createOpen = signal<boolean>(false);
  filterDrawerOpen = signal<boolean>(false);

  // Feed state
  feed: Signal<ConnectFeedResponse> = this.feedService.feed;
  loading = this.feedService.loading;
  filters = computed(() => this.filtersService.filters()());
  filteredPosts = computed(() => {
    const posts = this.feed().posts || [];
    const tab = this.activeTab();
    if (tab === 'People') return posts.filter(p => p.type === 'person');
    if (tab === 'Rooms') return posts.filter(p => p.type === 'room');
    if (tab === 'Rides') return posts.filter(p => p.type === 'ride');
    if (tab === 'Marketplace') return posts.filter(p => (p as any).type === 'market');
    if (tab === 'Topics') return posts.filter(p => p.type === 'thread');
    return posts; // All
  });

  // New content polling
  newAvailable = signal<boolean>(false);
  newCount = signal<number>(0);
  newestTopId = signal<string | undefined>(undefined);
  private pollHandle: any;
  private visHandler?: () => void;
  private navSub: any;

  constructor() {
    // Restore last tab and sync with current URL
    try {
      const last = localStorage.getItem('connect:lastTab');
      if (last && this.tabs.includes(last)) this.activeTab.set(last);
    } catch {}
    this.syncTabWithUrl(this.router.url || '');
    this.navSub = this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) this.syncTabWithUrl(ev.urlAfterRedirects || ev.url || '');
    });

    // When activeTab changes, push includeTypes into filters
    effect(() => {
      const tab = this.activeTab();
      const include = this.includeTypesForTab(tab);
      this.filtersService.setFilters({ includeTypes: include });
    });

    // Fetch feed only when filters actually change (deep equality check)
    let lastFilters: any = undefined;
    effect(() => {
      const f = this.filters();
      const fStr = JSON.stringify(f);
      if (fStr !== lastFilters) {
        lastFilters = fStr;
        this.feedService.fetchFeed({ ...f });
      }
    });

    // Track current top post id and reset new flag after refreshes
    effect(() => {
      const top = this.feed().posts?.[0]?.id as string | undefined;
      if (top) this.newestTopId.set(top);
      this.newAvailable.set(false);
    });

    // Hide skeleton once loading completes
    effect(() => {
      if (!this.loading() && this.showSkeleton()) {
        setTimeout(() => this.showSkeleton.set(false), 100);
      }
    });

    // Poll for new posts every 30s and show a banner if newer content exists
    this.pollHandle = setInterval(() => {
      if (typeof document !== 'undefined' && (document as any).hidden) return; // pause when tab hidden
      const filters = this.filtersService.filters()();
      this.feedService.peekLatest({ ...filters }).subscribe(({ topId, count }) => {
        if (topId && topId !== this.newestTopId()) {
          this.newAvailable.set(true);
          this.newCount.set(count || 0);
        }
      });
    }, 30000);

    // One-time peek when tab becomes visible again
    const onVisible = () => {
      if (typeof document !== 'undefined' && !(document as any).hidden) {
        const filters = this.filtersService.filters()();
        this.feedService.peekLatest({ ...filters }).subscribe(({ topId, count }) => {
          if (topId && topId !== this.newestTopId()) {
            this.newAvailable.set(true);
            this.newCount.set(count || 0);
          }
        });
      }
    };
    if (typeof document !== 'undefined') {
      (document as any).addEventListener('visibilitychange', onVisible);
      this.visHandler = () => (document as any).removeEventListener('visibilitychange', onVisible);
    }
  }

  // Community sidebars data (placeholder demo data for premium layout widgets)
  suggestedPeople: Array<{ name: string; university: string; mutual?: number }> = [
    { name: 'Alice Johnson', university: 'Boston University', mutual: 3 },
    { name: 'Dev Patel', university: 'Northeastern', mutual: 1 },
    { name: 'Maria Gomez', university: 'Harvard', mutual: 2 }
  ];
  savedItems: Array<{ title: string; type: string }> = [
    { title: 'Sunny Shared Apartment', type: 'room' },
    { title: 'Boston → NYC Friday Ride', type: 'ride' }
  ];
  weeklyDigest: Array<{ title: string; meta: string }> = [
    { title: 'Top 5 verified hosts near BU', meta: 'Rooms · 2 min read' },
    { title: 'Study group forming for CS50', meta: 'Topics · trending' }
  ];
  trustScore = 82; // demo metric

  // Helpers
  private includeTypesForTab(tab: string): Array<'person'|'room'|'ride'|'thread'|'event'|'update'|'market'> | [] {
    switch (tab) {
      case 'People': return ['person'];
      case 'Rooms': return ['room'];
      case 'Rides': return ['ride'];
      case 'Marketplace': return ['market'];
      case 'Topics': return ['thread'];
      default: return [];
    }
  }

  toggleFilters(): void { this.showMobileFilters.update(v => !v); }
  onSortSelect(ev: Event) {
    const target = ev.target as HTMLSelectElement | null;
    const val = (target?.value as 'trending' | 'new' | 'near') || 'trending';
    this.onSortChange(val);
  }

  // Map current URL to tab name
  private syncTabWithUrl(url: string) {
    if (!url) return;
    if (url.includes('/connect/rooms')) {
      this.activeTab.set('Rooms');
    } else if (url.includes('/connect/people')) {
      this.activeTab.set('People');
    } else if (url.includes('/connect/rides')) {
      this.activeTab.set('Rides');
    } else if (url.includes('/connect/marketplace')) {
      this.activeTab.set('Marketplace');
    } else if (url.includes('/connect/topics')) {
      this.activeTab.set('Topics');
    } else if (url.includes('/connect')) {
      const current = this.activeTab();
      const baseTabs = ['All','People','Topics'];
      if (!baseTabs.includes(current)) this.activeTab.set('All');
    }
  }

  onTabClick(tab: string) {
    this.activeTab.set(tab);
    this.showSkeleton.set(true);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    try { localStorage.setItem('connect:lastTab', tab); } catch {}
    if (tab === 'Rooms') this.router.navigate(['/connect/rooms']);
    else if (tab === 'People') this.router.navigate(['/connect/people']);
    else if (tab === 'Rides') this.router.navigate(['/connect/rides']);
    else if (tab === 'Marketplace') this.router.navigate(['/connect/marketplace']);
    else if (tab === 'Topics') this.router.navigate(['/connect/topics']);
    else this.router.navigate(['/connect']);
  }

  onSortChange(val: string) {
    if (val === 'trending' || val === 'new' || val === 'near') {
      this.sort.set(val);
      this.filtersService.setFilters({ sort: val });
      this.analytics.track('sort_changed', { sort: val });
    }
  }

  onFiltersPanelChange(partial: any) { this.filtersService.setFilters(partial); }

  loadMore() {
    const current = this.filtersService.filters()();
    if (this.feed().nextCursor) {
      this.feedService.fetchFeed({ ...current, cursor: this.feed().nextCursor });
    }
  }

  onPostOpened(post: AnyConnectPost) { this.analytics.postOpened(post.id, post.type); }

  viewMode(mode: 'map' | 'feed') {
    if (mode === 'map') {
      this.analytics.track('view_changed', { view: 'map' });
      this.router.navigate(['/connect/map']);
    } else {
      this.analytics.track('view_changed', { view: 'feed' });
    }
  }

  openCreate(){ this.analytics.track('new_post_clicked', {}); this.createOpen.set(true); }
  closeCreate(){ this.createOpen.set(false); }
  createRoom(){ this.analytics.track('create_room_clicked', {}); this.createOpen.set(false); this.router.navigate(['/open-room']); }
  createRide(){ this.analytics.track('create_ride_clicked', {}); this.createOpen.set(false); this.router.navigate(['/ride']); }
  createUpdate(){ this.analytics.track('create_update_clicked', {}); this.createOpen.set(false); }
  createGroup(){ this.analytics.track('create_group_clicked', {}); this.createOpen.set(false); this.router.navigate(['/groups/start']); }

  removeChip(chip: { key: string; label: string }) {
    const f = this.filters();
    if (chip.key === 'city') this.filtersService.setFilters({ city: undefined });
    else if (chip.key === 'roomType') this.filtersService.setFilters({ roomType: undefined });
    else if (chip.key === 'maxPrice') this.filtersService.setFilters({ maxPrice: undefined });
    else if (chip.key === 'verifiedOnly') this.filtersService.setFilters({ verifiedOnly: false });
    else if (chip.key.startsWith('interest:')) {
      const tag = chip.key.split(':')[1];
      const interests = (f.interests||[]).filter(t => t !== tag);
      this.filtersService.setFilters({ interests });
    }
  }

  smartActive = computed(() => {
    const f = this.filters();
    return !!(f.city || f.roomType || f.maxPrice || f.verifiedOnly || (f.interests && f.interests.length));
  });

  clearSmart(){
    this.filtersService.setFilters({
      city: undefined,
      roomType: undefined,
      maxPrice: undefined,
      verifiedOnly: false,
      interests: []
    });
    this.analytics.track('smart_suggestions_cleared', {});
  }

  applyQuick(partial: any) {
    if (typeof partial.verifiedOnly === 'boolean') {
      const current = !!this.filters().verifiedOnly;
      this.filtersService.setFilters({ verifiedOnly: !current });
      this.analytics.track('quick_chip_toggled', { key: 'verifiedOnly', value: !current });
      return;
    }
    if (partial.roomType) {
      const next = this.filters().roomType === partial.roomType ? undefined : partial.roomType;
      this.filtersService.setFilters({ roomType: next });
      this.analytics.track('quick_chip_set', { key: 'roomType', value: next });
      return;
    }
    if (partial.city) {
      const next = this.filters().city === partial.city ? undefined : partial.city;
      this.filtersService.setFilters({ city: next });
      this.analytics.track('quick_chip_set', { key: 'city', value: next });
      return;
    }
    this.filtersService.setFilters(partial);
  }

  onTabsKeydown(ev: KeyboardEvent) {
    const key = ev.key;
    const idx = this.tabs.indexOf(this.activeTab());
    if (key === 'ArrowRight') {
      const next = (idx + 1) % this.tabs.length;
      this.onTabClick(this.tabs[next]);
      ev.preventDefault();
    } else if (key === 'ArrowLeft') {
      const prev = (idx - 1 + this.tabs.length) % this.tabs.length;
      this.onTabClick(this.tabs[prev]);
      ev.preventDefault();
    } else if (key === 'Home') {
      this.onTabClick(this.tabs[0]);
      ev.preventDefault();
    } else if (key === 'End') {
      this.onTabClick(this.tabs[this.tabs.length - 1]);
      ev.preventDefault();
    }
  }

  showNew(){
    const current = this.filtersService.filters()();
    this.feedService.fetchFeed({ ...current });
    this.newAvailable.set(false);
  }

  refreshCurrent(){
    const current = this.filtersService.filters()();
    this.newestTopId.set(undefined);
    this.showSkeleton.set(true);
    this.feedService.fetchFeed({ ...current });
    this.analytics.track('feed_manual_refresh', { tab: this.activeTab() });
  }

  onTopicSelected(topic: any) {
    // Apply topic filter
    this.analytics.track('trending_topic_selected', { topic: topic.name });
    this.filtersService.setFilters({ interests: [topic.name] });
  }

  onQuickFilterApplied(filterData: any) {
    // Apply quick filter from trending topics component
    this.analytics.track('quick_filter_applied', { filter: filterData.filter });
    if (filterData.filter === 'verified') {
      this.filtersService.setFilters({ verifiedOnly: filterData.active });
    } else if (filterData.filter === 'nearby') {
      this.sort.set('near');
    } else if (filterData.filter === 'new') {
      this.sort.set('new');
    }
  }

  onFilterDrawerChange(filters: any) {
    // Apply filters from mobile drawer
    this.filtersService.setFilters(filters);
  }

  ngOnDestroy(): void {
    try { clearInterval(this.pollHandle); } catch {}
    try { this.navSub?.unsubscribe?.(); } catch {}
    try { this.visHandler?.(); } catch {}
  }
}
