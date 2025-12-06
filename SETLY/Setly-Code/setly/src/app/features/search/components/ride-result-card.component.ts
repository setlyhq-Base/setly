import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Airbnb-style ride card with selection highlighting
@Component({
  selector: 'app-ride-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="airbnb-ride-card" 
         [class.selected]="isSelected"
         tabindex="0" 
         (click)="onClick()"
         (keydown.enter)="onClick()" 
         (keydown.space)="$event.preventDefault(); onClick()">
      
      <!-- Top: Badges -->
      <div class="badges-row">
        <span class="badge price-badge">\${{ item.priceNum || 0 }}</span>
        <span class="badge seats-badge">{{ item.seatsAvailable }} seats</span>
        <span class="badge rating-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ item.rating }}
        </span>
        <button class="favorite-btn" (click)="onFavorite($event)" aria-label="Favorite">
          <svg class="heart-icon" [class.filled]="isFavorite" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>

      <!-- Middle: Route + Driver -->
      <div class="main-content">
        <!-- Left: Route -->
        <div class="route">
          <div class="city">{{ item.fromLine1 }}</div>
          <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div class="city">{{ item.toLine1 }}</div>
          <div class="datetime">{{ item.departureDate }} • {{ item.departureTime }}</div>
        </div>

        <!-- Right: Driver -->
        <div class="driver">
          <img 
            *ngIf="item.driver.avatar" 
            [src]="item.driver.avatar" 
            [alt]="item.driver.name" 
            class="avatar"
          />
          <div *ngIf="!item.driver.avatar" class="avatar-placeholder">
            {{ item.driver.name.charAt(0) }}
          </div>
          <div class="driver-info">
            <div class="driver-name">{{ item.driver.name }}</div>
            <div class="verified" *ngIf="item.driver.verified">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Verified
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: View Details -->
      <button class="view-link" (click)="onViewDetails($event)">
        View details
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      --brand-midnight: #0A1A3F;
      --brand-azure: #3E8FFF;
      --brand-slate: #6F7785;
      --border-light: #ECECEC;
    }

    /* AIRBNB-STYLE RIDE CARD */
    .airbnb-ride-card {
      background: #FFFFFF;
      border-radius: 14px;
      border: 2px solid transparent;
      padding: 14px 16px;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .airbnb-ride-card:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      border-color: rgba(62, 143, 255, 0.2);
    }

    /* Selected State - Airbnb Blue Highlight */
    .airbnb-ride-card.selected {
      border-color: var(--brand-azure);
      box-shadow: 0 0 0 2px var(--brand-azure), 0 8px 24px rgba(62, 143, 255, 0.25);
      transform: translateY(-3px) scale(1.02);
    }

    .airbnb-ride-card:focus {
      outline: none;
      border-color: var(--brand-azure);
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.2);
    }

    /* TOP BADGES ROW */
    .badges-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(62, 143, 255, 0.2);
      background: rgba(62, 143, 255, 0.04);
      font-size: 12px;
      font-weight: 600;
      color: var(--brand-midnight);
    }

    .badge svg {
      color: var(--brand-azure);
      fill: var(--brand-azure);
    }

    .favorite-btn {
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 150ms ease;
      padding: 0;
    }

    .favorite-btn:hover {
      transform: scale(1.1);
      background: #FFFFFF;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .heart-icon {
      stroke: var(--brand-midnight);
      transition: all 150ms ease;
    }
    
    .heart-icon.filled {
      fill: #FF385C;
      stroke: #FF385C;
    }
    
    .favorite-btn:hover .heart-icon {
      stroke: #FF385C;
      transform: scale(1.05);
    }

    /* MAIN CONTENT - ROUTE + DRIVER */
    .main-content {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: start;
    }

    /* ROUTE */
    .route {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .city {
      font-size: 15px;
      font-weight: 600;
      color: var(--brand-midnight);
      line-height: 1.2;
    }

    .arrow {
      color: var(--brand-slate);
      flex-shrink: 0;
      margin: 0 2px;
    }

    .datetime {
      font-size: 12px;
      font-weight: 500;
      color: var(--brand-slate);
      width: 100%;
      margin-top: 2px;
    }

    /* DRIVER */
    .driver {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--border-light);
      flex-shrink: 0;
    }

    .avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-azure), #2563EB);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      border: 1px solid var(--border-light);
      flex-shrink: 0;
    }

    .driver-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .driver-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--brand-midnight);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .verified {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 600;
      color: var(--brand-azure);
    }

    .verified svg {
      fill: var(--brand-azure);
    }

    /* VIEW DETAILS LINK */
    .view-link {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--brand-azure);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
      width: 100%;
      text-align: right;
    }

    .view-link:hover {
      color: #2563EB;
      gap: 6px;
    }

    .view-link svg {
      transition: transform 0.2s;
    }

    .view-link:hover svg {
      transform: translateX(2px);
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .route {
        flex-wrap: wrap;
      }

      .driver {
        justify-content: flex-start;
      }

      .badge {
        font-size: 11px;
        padding: 3px 8px;
      }
    }
  `]
})
export class RideResultCardComponent {
  @Input() item: any;
  @Input() isSelected: boolean = false;
  @Output() cardClick = new EventEmitter<any>();
  
  isFavorite = false;
  
  constructor(private router: Router) {}
  
  onClick() {
    this.cardClick.emit(this.item);
  }

  onFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
    console.log('Favorite toggled for ride:', this.item.id);
  }

  onViewDetails(event: Event) {
    event.stopPropagation();
    this.cardClick.emit(this.item);
  }
}
