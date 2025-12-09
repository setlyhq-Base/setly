import { Component, signal, computed, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface SearchResult {
  id: string;
  type: 'person' | 'room' | 'ride' | 'market' | 'topic';
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
  metadata?: string;
}

interface SearchCategory {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

@Component({
  selector: 'app-global-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-overlay" 
         [@fadeIn]
         (click)="close.emit()"
         *ngIf="isOpen">
      <div class="search-container" (click)="$event.stopPropagation()">
        <!-- Search Header -->
        <div class="search-header">
          <button (click)="close.emit()" class="back-btn" aria-label="Close search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              #searchInput
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              placeholder="Search people, rooms, rides, items..."
              class="search-input"
              autocomplete="off"
              autofocus>
            <button 
              *ngIf="searchQuery()" 
              (click)="clearSearch()" 
              class="clear-btn"
              aria-label="Clear search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Category Filters -->
        <div class="category-chips" *ngIf="!searchQuery()">
          <button 
            *ngFor="let cat of categories"
            (click)="selectCategory(cat)"
            class="category-chip"
            [class.active]="selectedCategory()?.id === cat.id">
            <span [innerHTML]="cat.icon"></span>
            <span>{{ cat.label }}</span>
            <span class="count" *ngIf="cat.count">{{ cat.count }}</span>
          </button>
        </div>

        <!-- Search Results / Suggestions -->
        <div class="search-results">
          <!-- Loading State -->
          <div *ngIf="isSearching()" class="loading-state">
            <div class="spinner"></div>
            <p>Searching...</p>
          </div>

          <!-- No Query - Show Suggestions -->
          <div *ngIf="!searchQuery() && !isSearching()" class="suggestions-section">
            <div class="section-header">
              <h3>Trending Searches</h3>
            </div>
            <div class="trending-chips">
              <button 
                *ngFor="let trend of trendingSearches"
                (click)="searchQuery.set(trend); onSearchInput()"
                class="trending-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ trend }}
              </button>
            </div>

            <div class="section-header mt-6">
              <h3>Popular Right Now</h3>
            </div>
            <div class="results-grid">
              <div 
                *ngFor="let item of popularItems"
                (click)="selectResult(item)"
                class="result-card">
                <div class="result-image" [style.background-image]="'url(' + item.image + ')'">
                  <span class="result-badge" *ngIf="item.badge">{{ item.badge }}</span>
                </div>
                <div class="result-info">
                  <h4>{{ item.title }}</h4>
                  <p *ngIf="item.subtitle">{{ item.subtitle }}</p>
                  <span class="result-meta" *ngIf="item.metadata">{{ item.metadata }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Results -->
          <div *ngIf="searchQuery() && !isSearching()" class="search-results-list">
            <!-- No Results -->
            <div *ngIf="filteredResults().length === 0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3>No results found</h3>
              <p>Try searching for rooms, rides, people, or marketplace items</p>
            </div>

            <!-- Results by Category -->
            <div *ngIf="filteredResults().length > 0">
              <div class="results-count">
                Found <strong>{{ filteredResults().length }}</strong> results
              </div>

              <!-- People Results -->
              <div *ngIf="getResultsByType('person').length > 0" class="results-section">
                <h3 class="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  People
                </h3>
                <div class="result-item" *ngFor="let result of getResultsByType('person')" (click)="selectResult(result)">
                  <div class="result-avatar" [style.background-image]="'url(' + result.image + ')'"></div>
                  <div class="result-content">
                    <h4>{{ result.title }}</h4>
                    <p>{{ result.subtitle }}</p>
                  </div>
                  <svg class="result-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              <!-- Rooms Results -->
              <div *ngIf="getResultsByType('room').length > 0" class="results-section">
                <h3 class="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 10l9-7 9 7M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Rooms
                </h3>
                <div class="result-item" *ngFor="let result of getResultsByType('room')" (click)="selectResult(result)">
                  <div class="result-thumbnail" [style.background-image]="'url(' + result.image + ')'"></div>
                  <div class="result-content">
                    <h4>{{ result.title }}</h4>
                    <p>{{ result.subtitle }}</p>
                    <span class="result-price" *ngIf="result.metadata">{{ result.metadata }}</span>
                  </div>
                  <svg class="result-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              <!-- Rides Results -->
              <div *ngIf="getResultsByType('ride').length > 0" class="results-section">
                <h3 class="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 17h14M2 12l3 5h14l3-5M4 5l2 6M20 5l-2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Rides
                </h3>
                <div class="result-item" *ngFor="let result of getResultsByType('ride')" (click)="selectResult(result)">
                  <div class="result-icon ride-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 17h14M2 12l3 5h14l3-5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="result-content">
                    <h4>{{ result.title }}</h4>
                    <p>{{ result.subtitle }}</p>
                    <span class="result-date" *ngIf="result.metadata">{{ result.metadata }}</span>
                  </div>
                  <svg class="result-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              <!-- Marketplace Results -->
              <div *ngIf="getResultsByType('market').length > 0" class="results-section">
                <h3 class="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Marketplace
                </h3>
                <div class="result-item" *ngFor="let result of getResultsByType('market')" (click)="selectResult(result)">
                  <div class="result-thumbnail" [style.background-image]="'url(' + result.image + ')'"></div>
                  <div class="result-content">
                    <h4>{{ result.title }}</h4>
                    <p>{{ result.subtitle }}</p>
                    <span class="result-price" *ngIf="result.metadata">{{ result.metadata }}</span>
                  </div>
                  <svg class="result-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .search-container {
      position: absolute;
      inset: 0;
      background: white;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    /* Header */
    .search-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: white;
      border-bottom: 1px solid #E5E7EB;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .back-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      color: #111827;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: #F3F4F6;
    }

    .search-input-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      color: #6B7280;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 12px 44px 12px 44px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      color: #111827;
      background: #F9FAFB;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3B82F6;
      background: white;
    }

    .clear-btn {
      position: absolute;
      right: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: #E5E7EB;
      color: #6B7280;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #D1D5DB;
    }

    /* Category Chips */
    .category-chips {
      display: flex;
      gap: 8px;
      padding: 16px;
      overflow-x: auto;
      scrollbar-width: none;
      border-bottom: 1px solid #F3F4F6;
    }

    .category-chips::-webkit-scrollbar {
      display: none;
    }

    .category-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-chip:hover {
      border-color: #3B82F6;
      background: #EFF6FF;
    }

    .category-chip.active {
      background: #3B82F6;
      border-color: #3B82F6;
      color: white;
    }

    .category-chip .count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      font-size: 12px;
    }

    /* Search Results */
    .search-results {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6B7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #E5E7EB;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Suggestions */
    .suggestions-section {
      animation: fadeIn 0.3s ease-out;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .section-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }

    .mt-6 {
      margin-top: 24px;
    }

    .trending-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .trending-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }

    .trending-chip:hover {
      background: white;
      border-color: #3B82F6;
      color: #3B82F6;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    @media (min-width: 768px) {
      .results-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .result-card {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }

    .result-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .result-image {
      width: 100%;
      aspect-ratio: 1;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .result-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      backdrop-filter: blur(8px);
    }

    .result-info {
      padding: 12px;
    }

    .result-info h4 {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-info p {
      font-size: 13px;
      color: #6B7280;
      margin: 0 0 6px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-meta {
      font-size: 12px;
      font-weight: 600;
      color: #3B82F6;
    }

    /* Results List */
    .search-results-list {
      animation: fadeIn 0.3s ease-out;
    }

    .results-count {
      padding: 12px 0;
      font-size: 14px;
      color: #6B7280;
      border-bottom: 1px solid #F3F4F6;
    }

    .results-section {
      margin-top: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .result-item:hover {
      background: #F9FAFB;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .result-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }

    .result-thumbnail {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }

    .result-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #EFF6FF;
      color: #3B82F6;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .result-icon.ride-icon {
      background: #F0FDF4;
      color: #10B981;
    }

    .result-content {
      flex: 1;
      min-width: 0;
    }

    .result-content h4 {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-content p {
      font-size: 13px;
      color: #6B7280;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-price,
    .result-date {
      display: inline-block;
      margin-top: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #3B82F6;
    }

    .result-arrow {
      color: #9CA3AF;
      flex-shrink: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-state svg {
      color: #D1D5DB;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
    }
  `]
})
export class GlobalSearchOverlayComponent {
  @Output() close = new EventEmitter<void>();
  
  private router = inject(Router);
  
  searchQuery = signal<string>('');
  isSearching = signal<boolean>(false);
  selectedCategory = signal<SearchCategory | null>(null);
  isOpen = true;

  categories: SearchCategory[] = [
    { id: 'all', label: 'All', icon: '🔍' },
    { id: 'people', label: 'People', icon: '👤' },
    { id: 'rooms', label: 'Rooms', icon: '🏠' },
    { id: 'rides', label: 'Rides', icon: '🚗' },
    { id: 'market', label: 'Market', icon: '🛍️' }
  ];

  trendingSearches = [
    'Boston University',
    'Northeastern',
    'Studio Apartment',
    'Furniture',
    'Weekend Rides',
    'Kitchen Items',
    'Roommate'
  ];

  // Mock popular items (replace with real API data)
  popularItems: SearchResult[] = [
    {
      id: '1',
      type: 'room',
      title: 'Cozy Studio in Fenway',
      subtitle: 'Boston, MA',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      metadata: '$1,200/mo',
      badge: 'Verified'
    },
    {
      id: '2',
      type: 'person',
      title: 'Sarah Chen',
      subtitle: 'Boston University',
      image: 'https://i.pravatar.cc/150?img=5',
      metadata: 'Computer Science'
    },
    {
      id: '3',
      type: 'ride',
      title: 'Boston → NYC',
      subtitle: 'Friday, Dec 15',
      metadata: '$30 per seat'
    },
    {
      id: '4',
      type: 'market',
      title: 'IKEA Desk Set',
      subtitle: 'Like New',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
      metadata: '$150'
    }
  ];

  // Mock all results (in production, this would come from API)
  allResults: SearchResult[] = [
    ...this.popularItems,
    {
      id: '5',
      type: 'person',
      title: 'Michael Johnson',
      subtitle: 'Northeastern University',
      image: 'https://i.pravatar.cc/150?img=12',
      metadata: 'Engineering'
    },
    {
      id: '6',
      type: 'room',
      title: 'Shared 2BR in Allston',
      subtitle: 'Near BU',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      metadata: '$800/mo'
    }
  ];

  filteredResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];

    const category = this.selectedCategory();
    let results = this.allResults;

    // Filter by category if selected
    if (category && category.id !== 'all') {
      results = results.filter(r => r.type === category.id);
    }

    // Filter by search query
    return results.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.subtitle?.toLowerCase().includes(query) ||
      r.metadata?.toLowerCase().includes(query)
    );
  });

  onSearchInput() {
    this.isSearching.set(true);
    
    // Simulate API call delay
    setTimeout(() => {
      this.isSearching.set(false);
    }, 300);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }

  selectCategory(category: SearchCategory) {
    if (this.selectedCategory()?.id === category.id) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(category);
    }
  }

  getResultsByType(type: string): SearchResult[] {
    return this.filteredResults().filter(r => r.type === type);
  }

  selectResult(result: SearchResult) {
    // Navigate based on result type
    switch (result.type) {
      case 'person':
        this.router.navigate(['/user-profile', result.id]);
        break;
      case 'room':
        this.router.navigate(['/listing', result.id]);
        break;
      case 'ride':
        // Open ride details (implement ride detail page route)
        console.log('Navigate to ride:', result.id);
        break;
      case 'market':
        // Open market item details
        console.log('Navigate to market item:', result.id);
        break;
    }
    
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.close.emit();
  }
}
