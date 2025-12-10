import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="place-card" (click)="cardClick.emit(place)">
      <!-- Top: Image + Bookmark -->
      <div class="place-image-wrapper">
        <img 
          [src]="place.image" 
          [alt]="place.title" 
          class="place-image"
          loading="lazy"
          decoding="async"
          (error)="onImageError($event)">
        
        <!-- Bookmark Icon -->
        <button 
          class="bookmark-btn"
          [class.saved]="isSaved()"
          (click)="toggleSave($event)"
          aria-label="Save place">
          <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <!-- Content: Name, Rating+Reviews, Place Type, Distance -->
      <div class="place-content">
        <!-- Place Name (1-2 lines max) -->
        <h3 class="place-name">{{ place.title }}</h3>
        
        <!-- Rating + Review Count -->
        <div class="place-rating" *ngIf="place.rating && place.rating > 0">
          <span class="star">⭐</span>
          <span class="rating-value">{{ place.rating }}</span>
          <span class="review-count" *ngIf="place.attendees">({{ formatReviewCount(place.attendees) }})</span>
        </div>
        
        <!-- Place Type (Park, Landmark, Museum, etc.) -->
        <div class="place-type" *ngIf="categoryLabel">
          {{ categoryLabel }}
        </div>
        
        <!-- Distance (optional, small and subtle) -->
        <div class="place-distance" *ngIf="place.distance">
          {{ place.distance }} away
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Card Container */
    .place-card {
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

    .place-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
    }

    .place-card:active {
      transform: translateY(-2px);
    }

    /* Image Section - 3:2 aspect ratio */
    .place-image-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 66.67%; /* 3:2 aspect ratio */
      flex-shrink: 0;
      overflow: hidden;
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .place-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .place-card:hover .place-image {
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

    .bookmark-btn.saved {
      color: #3B82F6;
      background: white;
    }

    /* Content Section */
    .place-content {
      padding: 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
      min-height: 140px;
    }

    /* Place Name */
    .place-name {
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
    .place-rating {
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

    /* Place Type */
    .place-type {
      font-size: 13px;
      color: #6B7280;
      font-weight: 500;
      margin-bottom: 6px;
    }

    /* Distance (small, subtle) */
    .place-distance {
      font-size: 12px;
      color: #9CA3AF;
      font-weight: 500;
      margin-top: auto;
    }

    /* Place Name (moved after rating to avoid duplication) */
    .place-name.duplicate-remove {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      line-height: 1.3;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      min-height: 39px;
    }

    /* Distance */
    .place-distance {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6B7280;
      font-size: 13px;
      font-weight: 500;
    }

    .place-distance svg {
      flex-shrink: 0;
      color: #9CA3AF;
    }

    /* Footer (Category + Price) */
    .place-footer {
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

    .price-tag {
      padding: 4px 10px;
      background: #DBEAFE;
      color: #3B82F6;
      font-size: 11px;
      font-weight: 700;
      border-radius: 12px;
      white-space: nowrap;
    }

    .price-tag.free {
      background: #D1FAE5;
      color: #10B981;
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .place-content {
        padding: 12px;
        min-height: 130px;
      }

      .place-name {
        font-size: 14px;
      }

      .place-rating,
      .place-type {
        font-size: 12px;
      }

      .review-count,
      .place-distance {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .place-card {
        width: 85vw;
        min-width: 85vw;
        max-width: 360px;
      }

      .place-content {
        padding: 12px;
        min-height: 120px;
      }

      .place-name {
        font-size: 14px;
      }
    }
  `]
})
export class PlaceCardComponent {
  @Input() place: any;
  @Output() cardClick = new EventEmitter<any>();
  
  isSaved = signal(false);
  private readonly FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

  ngOnInit() {
    if (this.place) {
      this.isSaved.set(this.place.saved || false);
    }
  }

  get categoryLabel(): string {
    if (!this.place.category) return '';
    
    const category = this.place.category.toLowerCase();
    if (category.includes('park')) return 'Park';
    if (category.includes('museum')) return 'Museum';
    if (category.includes('landmark')) return 'Landmark';
    if (category.includes('bar') || category.includes('club')) return 'Nightlife';
    if (category.includes('lounge')) return 'Lounge';
    if (category.includes('gym') || category.includes('fitness')) return 'Fitness';
    if (category.includes('outdoor')) return 'Outdoor';
    
    return this.place.category;
  }

  get priceLabel(): string {
    if (this.place.isFree) return 'Free';
    if (this.place.price > 0) return `$${this.place.price}`;
    return '';
  }

  formatReviewCount(count: number): string {
    if (!count) return '';
    
    // Format large numbers: 1234 → 1.2K, 5678 → 5.7K
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    
    return count.toString();
  }

  toggleSave(event: Event) {
    event.stopPropagation();
    this.isSaved.update(saved => !saved);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const fallbackImages: Record<string, string> = {
      'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
      'museum': 'https://images.unsplash.com/photo-1565301660306-29e08751cc3f?w=600&q=80',
      'nightlife': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80',
      'default': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
    };

    const category = this.place.category?.toLowerCase() || 'default';
    for (const key in fallbackImages) {
      if (category.includes(key)) {
        img.src = fallbackImages[key];
        return;
      }
    }
    img.src = fallbackImages['default'];
  }
}
