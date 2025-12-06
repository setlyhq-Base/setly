import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Airbnb-style market card with selection highlighting
@Component({
  selector: 'app-market-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="airbnb-card" 
         [class.selected]="isSelected"
         (click)="onClick()"
         (keydown.enter)="onClick()"
         (keydown.space)="$event.preventDefault(); onClick()"
         tabindex="0"
         role="button"
         [attr.aria-label]="'View details for ' + item.title">
      
      <!-- Image Container with Zoom Effect -->
      <div class="image-container">
        <img 
          [src]="item.image || '/assets/placeholder-room.jpg'" 
          [alt]="item.title" 
          class="market-image" 
          loading="lazy">
        
        <!-- Condition Tag -->
        <div *ngIf="item.badge" class="top-tag">
          {{ item.badge }}
        </div>
        
        <!-- Price Badge -->
        <div class="price-badge">{{ item.price }}</div>
        
        <!-- Favorite Button -->
        <button class="favorite-btn" (click)="onFavorite($event)" aria-label="Add to favorites">
          <svg class="heart-icon" [class.filled]="isFavorite" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="card-content">
        <!-- Title -->
        <h3 class="card-title">{{ item.title }}</h3>
        
        <!-- Location -->
        <p class="card-location">
          <svg class="location-icon" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-width="2" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ item.location }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      --brand-azure: #3E8FFF;
      --text-primary: #0A1A3F;
      --text-secondary: #6F7785;
      --border-light: #ECECEC;
    }
    
    /* Airbnb-Style Card Container */
    .airbnb-card {
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;
    }
    
    .airbnb-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .airbnb-card:active {
      transform: translateY(-2px) scale(1.005);
    }
    
    /* Selected State - Airbnb Blue Highlight */
    .airbnb-card.selected {
      border-color: var(--brand-azure);
      box-shadow: 0 0 0 2px var(--brand-azure), 0 8px 24px rgba(62, 143, 255, 0.25);
      transform: translateY(-4px) scale(1.02);
    }
    
    /* Image Container with Zoom Effect */
    .image-container {
      position: relative;
      width: 100%;
      padding-top: 66.67%; /* 3:2 aspect ratio */
      overflow: hidden;
      background: #F7F8FA;
    }
    
    .market-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 250ms ease-out;
    }
    
    .airbnb-card:hover .market-image {
      transform: scale(1.05);
    }
    
    /* Top Tag (Condition) */
    .top-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 2;
    }
    
    /* Price Badge */
    .price-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 2;
    }
    
    /* Favorite Button - Always Visible */
    .favorite-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 150ms ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 2;
    }
    
    .favorite-btn:hover {
      transform: scale(1.1);
      background: #FFFFFF;
    }
    
    .favorite-btn:active {
      transform: scale(0.95);
    }
    
    .heart-icon {
      stroke: var(--text-primary);
      transition: all 150ms ease;
    }
    
    .heart-icon.filled {
      fill: #FF385C;
      stroke: #FF385C;
    }
    
    .favorite-btn:hover .heart-icon {
      stroke: #FF385C;
      transform: scale(1.1);
    }
    
    /* Card Content */
    .card-content {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .card-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }
    
    .location-icon {
      flex-shrink: 0;
      opacity: 0.7;
    }
    
    /* Focus Styles */
    .airbnb-card:focus {
      outline: none;
      border-color: var(--brand-azure);
      box-shadow: 0 0 0 3px rgba(62, 143, 255, 0.2);
    }
    
    /* Animation for selection */
    @keyframes pulse-select {
      0%, 100% { transform: scale(1.02); }
      50% { transform: scale(1.03); }
    }
    
    .airbnb-card.selected {
      animation: pulse-select 300ms ease-out;
    }
    `
  ]
})
export class MarketResultCardComponent {
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
    console.log('Favorite toggled for market item:', this.item.id);
  }
}
