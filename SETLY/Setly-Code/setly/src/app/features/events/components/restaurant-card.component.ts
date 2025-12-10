import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="restaurant-card" (click)="cardClick.emit(restaurant)">
      <!-- Top: Image + Bookmark -->
      <div class="restaurant-image-wrapper">
        <img 
          [src]="restaurant.image" 
          [alt]="restaurant.title" 
          class="restaurant-image"
          loading="lazy"
          decoding="async"
          (error)="onImageError($event)">
        
        <!-- Bookmark Icon -->
        <button 
          class="bookmark-btn"
          (click)="$event.stopPropagation()"
          aria-label="Save restaurant">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <!-- Content: Name, Rating+Reviews, Cuisine, Open Status+Distance -->
      <div class="restaurant-content">
        <!-- Restaurant Name (1-2 lines max) -->
        <h3 class="restaurant-name">{{ restaurant.title }}</h3>
        
        <!-- Rating + Review Count -->
        <div class="restaurant-rating" *ngIf="restaurant.rating && restaurant.rating > 0">
          <span class="star">⭐</span>
          <span class="rating-value">{{ restaurant.rating }}</span>
          <span class="review-count" *ngIf="restaurant.attendees">({{ formatReviewCount(restaurant.attendees) }})</span>
        </div>
        
        <!-- Cuisine / Type -->
        <div class="restaurant-cuisine" *ngIf="categoryName">
          {{ categoryName }}
        </div>
        
        <!-- Open Status + Distance -->
        <div class="restaurant-meta">
          <span class="status" [class.open]="isOpen === true" [class.closed]="isOpen === false" *ngIf="isOpen !== null">
            {{ isOpen ? 'Open now' : 'Closed' }}
          </span>
          <span class="separator" *ngIf="isOpen !== null && restaurant.distance">•</span>
          <span class="distance" *ngIf="restaurant.distance">{{ restaurant.distance }} away</span>
        </div>
        
        <!-- Source tag (small at bottom) -->
        <div class="restaurant-source" *ngIf="restaurant.source">
          {{ restaurant.source === 'google' ? 'GOOGLE PLACES' : restaurant.source.toUpperCase() }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Card Container */
    .restaurant-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      width: 280px;
      min-width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      -webkit-tap-highlight-color: transparent;
    }

    .restaurant-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
    }

    .restaurant-card:active {
      transform: translateY(-2px);
    }

    /* Image Section - 3:2 aspect ratio */
    .restaurant-image-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 66.67%; /* 3:2 aspect ratio */
      flex-shrink: 0;
      overflow: hidden;
      background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
    }

    .restaurant-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .restaurant-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .restaurant-card:hover .restaurant-image {
      transform: scale(1.08);
    }

    /* Bookmark Button */
    .bookmark-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.2s;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .bookmark-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    /* Content Section */
    .restaurant-content {
      padding: 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
      min-height: 140px;
    }

    /* Restaurant Name */
    .restaurant-name {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      line-height: 1.3;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Rating */
    .restaurant-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
    }

    .star {
      font-size: 14px;
    }

    .rating-value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }

    .review-count {
      font-size: 12px;
      color: #9CA3AF;
      font-weight: 500;
    }

    /* Cuisine Type */
    .restaurant-cuisine {
      font-size: 13px;
      color: #6B7280;
      font-weight: 500;
      margin-bottom: 6px;
    }

    /* Meta (Open/Closed + Distance) */
    .restaurant-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .status {
      font-weight: 600;
    }

    .status.open {
      color: #10B981;
    }

    .status.closed {
      color: #9CA3AF;
    }

    .separator {
      color: #D1D5DB;
    }

    .distance {
      color: #9CA3AF;
    }

    /* Source tag */
    .restaurant-source {
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #F3F4F6;
      font-size: 10px;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* Footer (Category + Price) */
    .restaurant-footer {
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .category {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      text-transform: capitalize;
    }

    .price-level {
      color: #10B981;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 1px;
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .restaurant-content {
        padding: 12px;
        min-height: 130px;
      }

      .restaurant-name {
        font-size: 14px;
      }

      .restaurant-rating,
      .restaurant-meta,
      .restaurant-cuisine {
        font-size: 12px;
      }

      .review-count {
        font-size: 11px;
      }

      .restaurant-source {
        font-size: 9px;
      }
    }

    @media (max-width: 480px) {
      .restaurant-card {
        width: 85vw;
        min-width: 85vw;
        max-width: 360px;
      }

      .restaurant-content {
        padding: 12px;
        min-height: 120px;
      }

      .restaurant-name {
        font-size: 14px;
      }
    }
  `]
})
export class RestaurantCardComponent {
  @Input() restaurant: any;
  @Output() cardClick = new EventEmitter<any>();

  get isOpen(): boolean | null {
    // Check if restaurant is currently open
    if (!this.restaurant.spotsLeft) return null;
    return this.restaurant.spotsLeft === 'Open Now' || 
           this.restaurant.spotsLeft?.toLowerCase().includes('open');
  }

  get categoryName(): string {
    if (!this.restaurant.category) return '';
    
    // Clean up category name
    const category = this.restaurant.category.toLowerCase();
    if (category.includes('indian')) return 'Indian';
    if (category.includes('italian')) return 'Italian';
    if (category.includes('chinese')) return 'Chinese';
    if (category.includes('mexican')) return 'Mexican';
    if (category.includes('cafe') || category.includes('coffee')) return 'Café';
    if (category.includes('fast')) return 'Fast Food';
    
    return this.restaurant.category;
  }

  get priceLevel(): string {
    if (!this.restaurant.price && this.restaurant.price !== 0) return '';
    
    const price = this.restaurant.price;
    if (price === 0) return '$';
    if (price <= 15) return '$';
    if (price <= 30) return '$$';
    if (price <= 60) return '$$$';
    return '$$$$';
  }

  formatReviewCount(count: number): string {
    if (!count) return '';
    
    // Format large numbers: 1234 → 1.2K, 5678 → 5.7K
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    
    return count.toString();
  }

  onImageError(event: any) {
    const fallbackImages: Record<string, string> = {
      'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      'default': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80'
    };

    const category = this.restaurant.category || 'default';
    event.target.src = fallbackImages[category] || fallbackImages['default'];
  }
}
