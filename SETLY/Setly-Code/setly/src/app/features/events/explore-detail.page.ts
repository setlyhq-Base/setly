import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExploreDataService, ExploreItem } from '../../core/services/explore-data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-explore-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="explore-detail-page">
      <!-- Header with Back Button -->
      <header class="detail-header">
        <button (click)="goBack()" class="back-btn" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7m-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-actions">
          <button class="icon-btn" (click)="shareItem()" aria-label="Share">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn" (click)="toggleSave()" [class.saved]="isSaved()" aria-label="Save">
            <svg width="22" height="22" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-container">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#EF4444" stroke-width="2"/>
          <path d="M12 8v4m0 4h.01" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h3>Unable to load details</h3>
        <p>{{ error() }}</p>
        <button (click)="goBack()" class="primary-btn">Go Back</button>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading() && !error() && item()" class="detail-content">
        <!-- Hero Image Gallery -->
        <div class="image-gallery">
          <div class="main-image">
            <img [src]="item()?.image" [alt]="item()?.title" loading="eager">
            <div class="image-overlay">
              <span class="image-count" *ngIf="item()?.photos && item()!.photos!.length > 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ item()!.photos!.length + 1 }} photos
              </span>
            </div>
          </div>
        </div>

        <!-- Main Info -->
        <div class="info-section">
          <!-- Category Badge -->
          <div class="category-badge">
            <span class="category-emoji">{{ getCategoryEmoji() }}</span>
            <span class="category-text">{{ formatCategory(item()?.category) }}</span>
          </div>

          <!-- Title & Rating -->
          <h1 class="item-title">{{ item()?.title }}</h1>
          
          <div class="meta-row">
            <div class="rating" *ngIf="item()?.rating">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#FCD34D">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="rating-value">{{ item()!.rating!.toFixed(1) }}</span>
              <span class="rating-count">({{ item()?.attendees || 0 }} reviews)</span>
            </div>
            <div class="distance">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ item()?.distance }}</span>
            </div>
          </div>

          <!-- Tags -->
          <div class="tags-row" *ngIf="item()?.tag">
            <span class="tag">{{ item()?.tag }}</span>
            <span class="tag" *ngIf="item()?.isFree">Free</span>
            <span class="tag" *ngIf="!item()?.isFree && item()?.price">
              {{ getPriceLevel() }}
            </span>
            <span class="tag" *ngIf="item()?.spotsLeft !== 'Closed'">{{ item()?.spotsLeft }}</span>
          </div>
        </div>

        <!-- Quick Info Cards -->
        <div class="quick-info-grid">
          <div class="info-card" *ngIf="item()?.time">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="info-text">
              <span class="info-label">Hours</span>
              <span class="info-value">{{ item()?.time }}</span>
            </div>
          </div>

          <div class="info-card" *ngIf="item()?.date">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="info-text">
              <span class="info-label">Date</span>
              <span class="info-value">{{ item()?.date }}</span>
            </div>
          </div>

          <div class="info-card" *ngIf="!item()?.isFree && item()?.price">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="info-text">
              <span class="info-label">Price</span>
              <span class="info-value">\${{ item()?.price }}</span>
            </div>
          </div>

          <div class="info-card" *ngIf="item()?.isFree">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#10B981" stroke-width="2"/>
              <path d="M9 12l2 2 4-4" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="info-text">
              <span class="info-label">Pricing</span>
              <span class="info-value" style="color: #10B981;">Free Entry</span>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="section" *ngIf="item()?.location || item()?.address">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Location
          </h3>
          <p class="location-text">{{ item()?.address || item()?.location }}</p>
          <button class="secondary-btn" (click)="openInMaps()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 2v16M16 6v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            View on Map
          </button>
        </div>

        <!-- Description -->
        <div class="section" *ngIf="item()?.description">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            About
          </h3>
          <p class="description-text">{{ item()?.description }}</p>
        </div>

        <!-- Organizer/Provider -->
        <div class="section" *ngIf="item()?.organizer">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Provided by
          </h3>
          <div class="organizer-card">
            <img [src]="item()!.organizer!.avatar" [alt]="item()!.organizer!.name" class="organizer-avatar">
            <div class="organizer-info">
              <span class="organizer-name">{{ item()?.organizer?.name }}</span>
              <span class="organizer-type">{{ getProviderType() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div *ngIf="!isLoading() && !error() && item()" class="bottom-cta">
        <div class="cta-content">
          <div class="cta-info">
            <p class="cta-label">Ready to explore?</p>
            <p class="cta-source">{{ getSourceName() }}</p>
          </div>
          <button (click)="openOfficialSource()" class="cta-button">
            <span>{{ getCtaText() }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .explore-detail-page {
      min-height: 100vh;
      background: linear-gradient(to bottom, #FAFBFF 0%, #FFFFFF 100%);
      padding-bottom: 100px;
    }

    /* Header */
    .detail-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #E5E7EB;
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #F3F4F6;
      color: #111827;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: #E5E7EB;
      transform: scale(1.05);
    }

    .back-btn:active {
      transform: scale(0.95);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #F3F4F6;
      color: #111827;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: #E5E7EB;
    }

    .icon-btn.saved {
      background: #3B82F6;
      color: white;
    }

    /* Loading & Error States */
    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
      padding: 40px 20px;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #E5E7EB;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-container h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .error-container p {
      font-size: 15px;
      color: #6B7280;
      margin: 0;
    }

    /* Content */
    .detail-content {
      max-width: 800px;
      margin: 0 auto;
    }

    /* Image Gallery */
    .image-gallery {
      width: 100%;
      margin-bottom: 24px;
    }

    .main-image {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      bottom: 16px;
      right: 16px;
    }

    .image-count {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      color: white;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
    }

    /* Info Section */
    .info-section {
      padding: 24px 20px;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border: 1.5px solid #3B82F6;
      border-radius: 24px;
      margin-bottom: 16px;
    }

    .category-emoji {
      font-size: 16px;
    }

    .category-text {
      font-size: 14px;
      font-weight: 700;
      color: #3B82F6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .item-title {
      font-size: 32px;
      font-weight: 900;
      color: #111827;
      margin: 0 0 16px 0;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 16px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rating-value {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
    }

    .rating-count {
      font-size: 14px;
      color: #6B7280;
    }

    .distance {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #6B7280;
      font-weight: 500;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      padding: 6px 14px;
      background: #F3F4F6;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    /* Quick Info Grid */
    .quick-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      padding: 0 20px 24px;
    }

    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: white;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      transition: all 0.2s;
    }

    .info-card:hover {
      border-color: #3B82F6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    .info-card svg {
      flex-shrink: 0;
      color: #3B82F6;
      margin-top: 2px;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
    }

    /* Sections */
    .section {
      padding: 24px 20px;
      border-top: 1px solid #E5E7EB;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .section-title svg {
      color: #3B82F6;
    }

    .location-text,
    .description-text {
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
      margin: 0 0 16px 0;
    }

    .secondary-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #F3F4F6;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      color: #111827;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .secondary-btn:hover {
      background: #E5E7EB;
      border-color: #3B82F6;
    }

    .organizer-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
    }

    .organizer-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #E5E7EB;
    }

    .organizer-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .organizer-name {
      font-size: 17px;
      font-weight: 700;
      color: #111827;
    }

    .organizer-type {
      font-size: 14px;
      color: #6B7280;
    }

    /* Bottom CTA */
    .bottom-cta {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #E5E7EB;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }

    .cta-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .cta-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cta-label {
      font-size: 13px;
      font-weight: 600;
      color: #6B7280;
      margin: 0;
    }

    .cta-source {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .cta-button {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      border: none;
      border-radius: 14px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .cta-button:active {
      transform: translateY(0);
    }

    .primary-btn {
      padding: 12px 32px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-image {
        height: 300px;
      }

      .item-title {
        font-size: 28px;
      }

      .cta-content {
        flex-direction: column;
        gap: 12px;
      }

      .cta-button {
        width: 100%;
        justify-content: center;
      }

      .quick-info-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class ExploreDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exploreDataService = inject(ExploreDataService);
  private destroy$ = new Subject<void>();

  item = signal<ExploreItem | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  isSaved = signal(false);

  ngOnInit() {
    const itemId = this.route.snapshot.paramMap.get('id');
    if (!itemId) {
      this.error.set('Invalid item ID');
      this.isLoading.set(false);
      return;
    }

    // In production, fetch from API using place ID
    // For now, get from route state
    const navigationState = history.state as { item?: ExploreItem };
    if (navigationState?.item) {
      this.item.set(navigationState.item);
      this.isLoading.set(false);
    } else {
      // Fallback: Try to fetch from API if available
      this.fetchItemDetails(itemId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchItemDetails(placeId: string) {
    // TODO: Implement API call to fetch details by place ID
    // For now, show error
    this.error.set('Item not found. Please go back and try again.');
    this.isLoading.set(false);
  }

  goBack() {
    this.router.navigate(['/explore']);
  }

  toggleSave() {
    this.isSaved.set(!this.isSaved());
    // TODO: Implement save functionality
  }

  shareItem() {
    const currentItem = this.item();
    if (!currentItem) return;

    if (navigator.share) {
      navigator.share({
        title: currentItem.title,
        text: `Check out ${currentItem.title} on Setly!`,
        url: window.location.href
      }).catch(() => {
        // Fallback: Copy to clipboard
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard() {
    navigator.clipboard.writeText(window.location.href);
    // TODO: Show toast notification
    alert('Link copied to clipboard!');
  }

  openInMaps() {
    const currentItem = this.item();
    if (!currentItem) return;

    const address = encodeURIComponent(currentItem.address || currentItem.location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
  }

  openOfficialSource() {
    const currentItem = this.item();
    if (!currentItem) return;

    // Use official URL if available, otherwise construct appropriate URL
    if (currentItem.officialUrl) {
      window.open(currentItem.officialUrl, '_blank');
      return;
    }

    // Use website if available
    if (currentItem.website) {
      window.open(currentItem.website, '_blank');
      return;
    }

    // Determine source based on category and data source
    let url = '';
    
    switch (currentItem.source) {
      case 'eventbrite':
        url = `https://www.eventbrite.com/d/${encodeURIComponent(currentItem.location)}/${encodeURIComponent(currentItem.title)}`;
        break;
      case 'ticketmaster':
        url = `https://www.ticketmaster.com/search?q=${encodeURIComponent(currentItem.title)}`;
        break;
      case 'google_places':
        if (currentItem.placeId) {
          url = `https://www.google.com/maps/place/?q=place_id:${currentItem.placeId}`;
        }
        break;
      default:
        // Fallback: Intelligent search based on category
        if (currentItem.category === 'events' || currentItem.category === 'concerts') {
          url = `https://www.google.com/search?q=${encodeURIComponent(currentItem.title + ' ' + currentItem.location + ' tickets')}`;
        } else if (currentItem.placeId) {
          url = `https://www.google.com/maps/place/?q=place_id:${currentItem.placeId}`;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(currentItem.title + ' ' + currentItem.location)}`;
        }
    }

    if (url) {
      window.open(url, '_blank');
    }
  }

  getCategoryEmoji(): string {
    const category = this.item()?.category || '';
    const emojiMap: Record<string, string> = {
      'restaurants': '🍽️',
      'places': '📍',
      'activities': '🎯',
      'nightlife': '🌙',
      'outdoor': '🌲',
      'events': '🎉',
      'concerts': '🎵',
      'sports': '🏀',
      'wellness': '🧘',
      'student': '🎓'
    };
    return emojiMap[category] || '✨';
  }

  formatCategory(category?: string): string {
    if (!category) return 'Experience';
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  getPriceLevel(): string {
    const price = this.item()?.price || 0;
    if (price === 0) return 'Free';
    if (price < 15) return '$';
    if (price < 30) return '$$';
    if (price < 50) return '$$$';
    return '$$$$';
  }

  getProviderType(): string {
    const category = this.item()?.category || '';
    const typeMap: Record<string, string> = {
      'restaurants': 'Restaurant',
      'places': 'Location',
      'activities': 'Activity Provider',
      'nightlife': 'Venue',
      'outdoor': 'Outdoor Experience',
      'events': 'Event Organizer',
      'concerts': 'Event Venue',
      'sports': 'Sports Facility',
      'wellness': 'Wellness Center',
      'student': 'Campus Organization'
    };
    return typeMap[category] || 'Provider';
  }

  getSourceName(): string {
    const currentItem = this.item();
    if (!currentItem) return 'Official Source';

    // Check source type
    switch (currentItem.source) {
      case 'eventbrite':
        return 'Eventbrite';
      case 'ticketmaster':
        return 'Ticketmaster';
      case 'google_places':
        return 'Google Maps';
      default:
        if (currentItem.category === 'events' || currentItem.category === 'concerts') {
          return 'Event Provider';
        }
        return 'Official Source';
    }
  }

  getCtaText(): string {
    const currentItem = this.item();
    if (!currentItem) return 'View Details';

    // Check source type for specific CTA
    switch (currentItem.source) {
      case 'eventbrite':
        return 'View on Eventbrite';
      case 'ticketmaster':
        return 'View on Ticketmaster';
      case 'google_places':
        if (currentItem.category === 'restaurants') {
          return 'Open in Google Maps';
        } else if (currentItem.category === 'places') {
          return 'View Location';
        }
        return 'View on Google Maps';
      default:
        if (currentItem.category === 'events' || currentItem.category === 'concerts') {
          return 'Find Tickets';
        }
        return 'Visit Official Page';
    }
  }
}
