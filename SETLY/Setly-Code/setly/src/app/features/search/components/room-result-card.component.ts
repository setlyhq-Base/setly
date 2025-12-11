import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Premium Redesigned Room Card with Advanced Features
@Component({
  selector: 'app-room-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="premium-card" 
      [class.selected]="isSelected"
      [class.is-hovered]="isHovered"
      (click)="onClick()" 
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
      (keydown.enter)="onClick()"
      (keydown.space)="$event.preventDefault(); onClick()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'View details for ' + item.title"
    >
      <!-- Image Container with Premium Effects -->
      <div class="image-container">
        <div class="image-wrapper">
          <img 
            [src]="item.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'" 
            [alt]="item.title"
            class="room-image"
            loading="lazy"
            decoding="async"
            width="800"
            height="600"
          />
          
          <!-- Gradient Overlay -->
          <div class="image-overlay"></div>
        </div>
        
        <!-- Premium Verified Badge -->
        <div class="verified-badge" *ngIf="item.verified">
          <svg class="verified-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1"/>
          </svg>
          <span>Verified</span>
        </div>
        
        <!-- Premium Price Badge with Gradient -->
        <div class="price-badge">
          <div class="price-amount">\${{ item.price }}</div>
          <div class="price-period">/mo</div>
        </div>
        
        <!-- Enhanced Favorite Button -->
        <button 
          class="favorite-btn" 
          [class.active]="isFavorite"
          (click)="onFavorite($event)"
          aria-label="Add to favorites"
        >
          <svg class="heart-icon" [class.filled]="isFavorite" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Quick View Overlay (appears on hover) -->
        <div class="quick-view-overlay" *ngIf="isHovered">
          <button class="quick-view-btn" (click)="onQuickView($event)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Quick View</span>
          </button>
        </div>
      </div>

      <!-- Card Content with Premium Typography -->
      <div class="card-content">
        <!-- Title with Fade Effect -->
        <h3 class="card-title">{{ item.title || 'Modern Student Room' }}</h3>
        
        <!-- Location with Enhanced Icon -->
        <div class="card-location">
          <svg class="location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="location-text">{{ item.location || 'Downtown Boston' }}</span>
        </div>
        
        <!-- Bottom Row: Rating + Amenities Icons -->
        <div class="card-footer">
          <div class="card-rating" *ngIf="item.rating">
            <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="rating-value">{{ item.rating }}</span>
            <span class="rating-count" *ngIf="item.reviews">({{ item.reviews }})</span>
          </div>
          
          <!-- Quick Amenities Icons -->
          <div class="amenities-quick">
            <div class="amenity-icon-wrapper" *ngIf="item.wifi" title="Wi-Fi">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="amenity-icon-wrapper" *ngIf="item.parking" title="Parking">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M9 8h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9V8z" fill="currentColor"/>
              </svg>
            </div>
            <div class="amenity-icon-wrapper" *ngIf="item.ac" title="AC">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 6h8M8 10h8M8 14h8M5 6v12M19 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Selection Glow Effect -->
      <div class="selection-glow" *ngIf="isSelected"></div>
    </div>
  `,
  styles: [`
    :host {
      --brand-azure: #3E8FFF;
      --brand-purple: #8B5CF6;
      --text-primary: #0A1A3F;
      --text-secondary: #6F7785;
      --success-green: #10B981;
      --favorite-red: #FF385C;
    }
    
    /* ========== PREMIUM CARD CONTAINER ========== */
    .premium-card {
      position: relative;
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.04);
    }

    .premium-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.12),
        0 8px 24px rgba(62, 143, 255, 0.15),
        0 0 0 1px rgba(62, 143, 255, 0.1);
      border-color: rgba(62, 143, 255, 0.2);
    }

    .premium-card.selected {
      border-color: var(--brand-azure);
      transform: translateY(-6px) scale(1.02);
      box-shadow: 
        0 12px 48px rgba(62, 143, 255, 0.25),
        0 8px 24px rgba(62, 143, 255, 0.2),
        0 0 0 3px rgba(62, 143, 255, 0.15);
    }

    .premium-card:focus {
      outline: none;
      border-color: var(--brand-azure);
      box-shadow: 
        0 0 0 4px rgba(62, 143, 255, 0.2),
        0 8px 24px rgba(0, 0, 0, 0.12);
    }

    /* ========== IMAGE CONTAINER ========== */
    .image-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
    }

    .image-wrapper {
      position: relative;
      padding-top: 56.25%; /* 16:9 aspect ratio - more compact */
      overflow: hidden;
    }

    .room-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .premium-card:hover .room-image {
      transform: scale(1.08);
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.25) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .premium-card:hover .image-overlay {
      opacity: 1;
    }

    /* ========== PREMIUM VERIFIED BADGE ========== */
    .verified-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
      backdrop-filter: blur(12px);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      color: var(--success-green);
      box-shadow: 
        0 4px 16px rgba(16, 185, 129, 0.2),
        0 0 0 1px rgba(16, 185, 129, 0.1);
      z-index: 3;
      animation: badge-entrance 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
    }

    @keyframes badge-entrance {
      from {
        opacity: 0;
        transform: translateX(-12px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .verified-icon {
      color: var(--success-green);
    }

    /* ========== PREMIUM PRICE BADGE ========== */
    .price-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: baseline;
      gap: 2px;
      padding: 7px 12px;
      background: linear-gradient(135deg, rgba(10, 26, 63, 0.95) 0%, rgba(10, 26, 63, 0.9) 100%);
      backdrop-filter: blur(12px);
      border-radius: 12px;
      box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      z-index: 3;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .premium-card:hover .price-badge {
      background: linear-gradient(135deg, var(--brand-azure) 0%, #5EA3FF 100%);
      transform: scale(1.05);
      box-shadow: 
        0 6px 24px rgba(62, 143, 255, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    }

    .price-amount {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .price-period {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
    }

    /* ========== ENHANCED FAVORITE BUTTON ========== */
    .favorite-btn {
      position: absolute;
      bottom: 14px;
      right: 14px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      z-index: 3;
    }

    .favorite-btn:hover {
      transform: scale(1.15);
      background: #FFFFFF;
      box-shadow: 
        0 6px 20px rgba(255, 56, 92, 0.25),
        0 0 0 2px rgba(255, 56, 92, 0.2);
    }

    .favorite-btn:active {
      transform: scale(1.05);
    }

    .favorite-btn.active {
      background: linear-gradient(135deg, var(--favorite-red) 0%, #FF5A7D 100%);
      box-shadow: 
        0 6px 24px rgba(255, 56, 92, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    }

    .heart-icon {
      stroke: var(--text-primary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .favorite-btn:hover .heart-icon {
      stroke: var(--favorite-red);
      transform: scale(1.1);
    }

    .heart-icon.filled {
      fill: #FFFFFF;
      stroke: #FFFFFF;
      animation: heart-beat 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes heart-beat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.3); }
      50% { transform: scale(1.1); }
    }

    /* ========== QUICK VIEW OVERLAY ========== */
    .quick-view-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2;
      pointer-events: none;
    }

    .premium-card:hover .quick-view-overlay {
      opacity: 1;
      pointer-events: all;
    }

    .quick-view-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
      backdrop-filter: blur(16px);
      border: none;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.3) inset;
      transform: translateY(8px);
    }

    .premium-card:hover .quick-view-btn {
      transform: translateY(0);
    }

    .quick-view-btn:hover {
      background: linear-gradient(135deg, var(--brand-azure) 0%, #5EA3FF 100%);
      color: white;
      transform: scale(1.05);
      box-shadow: 
        0 12px 40px rgba(62, 143, 255, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    }

    /* ========== CARD CONTENT ========== */
    .card-content {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      letter-spacing: -0.01em;
      transition: color 0.2s;
    }

    .premium-card:hover .card-title {
      color: var(--brand-azure);
    }

    .card-location {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 500;
    }

    .location-icon {
      flex-shrink: 0;
      color: var(--brand-azure);
      opacity: 0.7;
    }

    .location-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ========== CARD FOOTER ========== */
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .card-rating {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .star-icon {
      color: #FFB400;
      filter: drop-shadow(0 1px 2px rgba(255, 180, 0, 0.3));
    }

    .rating-value {
      color: var(--text-primary);
    }

    .rating-count {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    /* ========== AMENITIES ICONS ========== */
    .amenities-quick {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .amenity-icon-wrapper {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(62, 143, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%);
      border-radius: 8px;
      color: var(--brand-azure);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .amenity-icon-wrapper:hover {
      background: linear-gradient(135deg, var(--brand-azure) 0%, #5EA3FF 100%);
      color: white;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.3);
    }

    /* ========== SELECTION GLOW ========== */
    .selection-glow {
      position: absolute;
      inset: -4px;
      border-radius: 22px;
      background: linear-gradient(135deg, var(--brand-azure) 0%, var(--brand-purple) 100%);
      opacity: 0.15;
      z-index: -1;
      filter: blur(12px);
      animation: glow-pulse 2s ease-in-out infinite;
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.15; transform: scale(0.98); }
      50% { opacity: 0.25; transform: scale(1.02); }
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 640px) {
      .premium-card {
        border-radius: 16px;
      }

      .card-content {
        padding: 14px 16px;
      }

      .card-title {
        font-size: 15px;
      }

      .card-location {
        font-size: 13px;
      }

      .price-amount {
        font-size: 16px;
      }

      .quick-view-btn {
        padding: 12px 24px;
        font-size: 14px;
      }
    }
  `]
})
export class RoomResultCardComponent {
  @Input() item: any;
  @Input() isSelected: boolean = false;
  @Output() cardClick = new EventEmitter<any>();
  
  isFavorite = false;
  isHovered = false;
  
  constructor(private router: Router) {}
  
  onClick() {
    this.cardClick.emit(this.item);
  }
  
  onFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
    console.log('Favorite toggled for room:', this.item.id);
  }
  
  onQuickView(event: Event) {
    event.stopPropagation();
    console.log('Quick view for room:', this.item.id);
    // TODO: Open quick view modal with room details
  }
}
