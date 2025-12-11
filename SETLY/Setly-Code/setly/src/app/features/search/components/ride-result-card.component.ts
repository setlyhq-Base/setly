import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Time-aware premium ride card with dynamic countdowns and color-coded urgency
@Component({
  selector: 'app-ride-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ride-card" 
         [class.selected]="isSelected"
         [class.expanded]="isExpanded()"
         [class.urgent]="getUrgencyLevel() === 'urgent'"
         [class.soon]="getUrgencyLevel() === 'soon'"
         [class.today]="getUrgencyLevel() === 'today'"
         [class.later]="getUrgencyLevel() === 'later'"
         [class.future]="getUrgencyLevel() === 'future'"
         [attr.data-urgency]="getUrgencyLevel()"
         tabindex="0" 
         (click)="onCardClick()"
         (keydown.enter)="onCardClick()" 
         (keydown.space)="$event.preventDefault(); onCardClick()">
      
      <!-- Live Timer Badge (Top Center) -->
      <div class="live-timer-badge" [class]="'urgency-' + getUrgencyLevel()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
        </svg>
        <span class="timer-text">{{ getCountdownText() }}</span>
      </div>

      <!-- Urgency Status Badge (Top Left) -->
      <div class="urgency-badge" [class]="'status-' + getUrgencyLevel()">
        <span>{{ getUrgencyLabel() }}</span>
      </div>

      <!-- Quick Widgets Row (Top Right) -->
      <div class="quick-widgets">
        <!-- Filling Fast -->
        <div class="mini-badge filling" *ngIf="isFillingSoon()">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
          </svg>
          <div class="pulse-dot"></div>
        </div>
        
        <!-- Ride Type -->
        <div class="mini-badge ride-type" *ngIf="getRideType()">
          <span>{{ getRideType() }}</span>
        </div>

        <!-- Trust Score -->
        <div class="mini-badge verified" *ngIf="item.driver?.verificationScore >= 85">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="card-grid">
        
        <!-- LEFT SIDE: Route Information -->
        <div class="route-info">
          
          <!-- Route Line Visualization -->
          <div class="route-visual">
            <div class="route-line-container">
              <!-- Start Point -->
              <div class="route-point start-point">
                <div class="point-marker">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="8"/>
                  </svg>
                  <div class="marker-pulse"></div>
                </div>
                <div class="point-info">
                  <span class="location-name">{{ item.fromLine1 }}</span>
                  <span class="location-detail" *ngIf="item.fromLine2">{{ item.fromLine2 }}</span>
                </div>
              </div>

              <!-- Connecting Line -->
              <div class="route-connector">
                <div class="connector-line">
                  <div class="flow-animation"></div>
                </div>
                <div class="route-meta">
                  <span class="distance" *ngIf="item.distance">{{ item.distance }}</span>
                  <span class="duration" *ngIf="item.duration">{{ item.duration }}</span>
                </div>
              </div>

              <!-- End Point -->
              <div class="route-point end-point">
                <div class="point-marker">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div class="marker-pulse"></div>
                </div>
                <div class="point-info">
                  <span class="location-name">{{ item.toLine1 }}</span>
                  <span class="location-detail" *ngIf="item.toLine2">{{ item.toLine2 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Timing Details -->
          <div class="timing-details">
            <div class="time-row departure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="time-info">
                <span class="time-label">Pickup</span>
                <span class="time-value">{{ item.departureTime }}</span>
              </div>
            </div>

            <div class="time-row arrival">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="time-info">
                <span class="time-label">Dropoff</span>
                <span class="time-value">{{ item.arrivalTime || 'Est.' }}</span>
              </div>
            </div>
          </div>

          <!-- Date Display -->
          <div class="date-display" *ngIf="item.departureDate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{{ item.departureDate }}</span>
          </div>
        </div>

        <!-- RIGHT SIDE: Price & Driver Info -->
        <div class="card-right">
          
          <!-- Price Section -->
          <div class="price-section">
            <div class="price-badge">
              <span class="price-amount">\${{ item.priceNum || 0 }}</span>
              <span class="price-label">per seat</span>
            </div>

            <!-- Value Badge -->
            <div class="value-badge" *ngIf="isGoodValue()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>Great Deal</span>
            </div>
          </div>

          <!-- Favorite Button -->
          <button class="favorite-btn" 
                  [class.active]="isFavorite()"
                  (click)="onFavorite($event)" 
                  aria-label="Favorite">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <div class="heart-burst" *ngIf="isFavorite()"></div>
          </button>

          <!-- Driver Row -->
          <div class="driver-row">
            <div class="driver-avatar">
              <img *ngIf="item.driver.avatar" 
                   [src]="item.driver.avatar" 
                   [alt]="item.driver.name"/>
              <div *ngIf="!item.driver.avatar" class="avatar-placeholder">
                {{ item.driver.name.charAt(0) }}
              </div>
              
              <!-- Verified Badge -->
              <div class="verified-badge" *ngIf="item.driver.verified">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            
            <div class="driver-info">
              <span class="driver-name">{{ item.driver.name }}</span>
              <div class="driver-meta">
                <div class="rating" *ngIf="item.rating">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{{ item.rating }}</span>
                </div>
                <span class="trips" *ngIf="item.driver.completedTrips">
                  {{ item.driver.completedTrips }} trips
                </span>
              </div>
            </div>
          </div>

          <!-- Seats Display -->
          <div class="seats-display" *ngIf="item.seatsAvailable">
            <div class="seat-icons">
              <svg *ngFor="let seat of getSeatsArray(item.seatsTotal || 4); let i = index" 
                   width="14" height="14" viewBox="0 0 24 24" 
                   [class.filled]="i >= item.seatsTotal - item.seatsAvailable"
                   [class.available]="i < item.seatsTotal - item.seatsAvailable">
                <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3v9h18v-9h-2V7z" 
                      fill="currentColor"/>
              </svg>
            </div>
            <span class="seats-count">{{ item.seatsAvailable }} left</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Panel -->
      <div class="quick-actions-panel" *ngIf="isExpanded()">
        <button class="action-btn primary" (click)="onViewDetails($event)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span>View Details</span>
        </button>
        <button class="action-btn secondary" (click)="onQuickBook($event)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Book Now</span>
        </button>
      </div>

      <!-- Mobile Expand Hint -->
      <div class="expand-hint" *ngIf="!isExpanded()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    /* ===============================================
       TIME-AWARE RIDE CARD - URGENCY SYSTEM
       =============================================== */

    :host {
      --color-midnight: #0A1A3F;
      --color-azure: #3E8FFF;
      --color-slate: #6F7785;
      --color-light-bg: #F8F9FB;
      --color-white: #FFFFFF;
      --color-border: #E5E7EB;
      --color-success: #10B981;
      --color-warning: #F59E0B;
      --color-danger: #EF4444;
      
      /* Urgency Colors */
      --color-urgent: #EF4444;
      --color-urgent-bg: #FEE2E2;
      --color-urgent-light: #FECACA;
      --color-soon: #F97316;
      --color-soon-bg: #FED7AA;
      --color-soon-light: #FDBA74;
      --color-today: #F59E0B;
      --color-today-bg: #FEF3C7;
      --color-today-light: #FDE68A;
      --color-later: #10B981;
      --color-later-bg: #D1FAE5;
      --color-later-light: #A7F3D0;
      --color-future: #3B82F6;
      --color-future-bg: #DBEAFE;
      --color-future-light: #BFDBFE;
      
      --gradient-primary: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      --gradient-price: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      --gradient-soft: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
      
      --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04);
      --shadow-hover: 0 8px 30px rgba(62, 143, 255, 0.15), 0 4px 12px rgba(62, 143, 255, 0.1);
      --shadow-selected: 0 0 0 3px rgba(62, 143, 255, 0.12);
      --shadow-price: 0 4px 16px rgba(30, 64, 175, 0.2);
      
      --spacing-xs: 6px;
      --spacing-sm: 10px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;
      --radius-full: 100px;
    }

    /* ===============================================
       CARD CONTAINER - Urgency Color Coded
       =============================================== */

    .ride-card {
      position: relative;
      background: var(--color-white);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 12px 14px;
      margin-bottom: var(--spacing-md);
      box-shadow: var(--shadow-card);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: visible;
    }

    /* Urgency-based backgrounds */
    .ride-card.urgent {
      background: linear-gradient(135deg, var(--color-urgent-bg), var(--color-urgent-light));
      border-color: var(--color-urgent);
      animation: urgentPulse 2s ease-in-out infinite;
    }

    .ride-card.soon {
      background: linear-gradient(135deg, var(--color-soon-bg), var(--color-soon-light));
      border-color: var(--color-soon);
    }

    .ride-card.today {
      background: linear-gradient(135deg, var(--color-today-bg), var(--color-today-light));
      border-color: var(--color-today);
    }

    .ride-card.later {
      background: linear-gradient(135deg, var(--color-later-bg), var(--color-later-light));
      border-color: var(--color-later);
    }

    .ride-card.future {
      background: linear-gradient(135deg, var(--color-future-bg), var(--color-future-light));
      border-color: var(--color-future);
    }

    @keyframes urgentPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      50% { transform: scale(1.01); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
    }

    .ride-card:hover {
      border-color: rgba(62, 143, 255, 0.4);
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
    }

    .ride-card.selected {
      border-color: var(--color-azure);
      box-shadow: var(--shadow-selected), var(--shadow-hover);
    }

    /* ===============================================
       LIVE TIMER BADGE - Top Center
       =============================================== */

    .live-timer-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--color-white);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-full);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      font-size: 12px;
      font-weight: 600;
      color: var(--color-midnight);
      z-index: 10;
      animation: timerFade 0.5s ease-in;
    }

    @keyframes timerFade {
      from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .live-timer-badge.urgency-urgent {
      border-color: var(--color-urgent);
      color: var(--color-urgent);
      animation: timerPulse 1.5s ease-in-out infinite;
    }

    .live-timer-badge.urgency-soon {
      border-color: var(--color-soon);
      color: var(--color-soon);
    }

    .live-timer-badge.urgency-today {
      border-color: var(--color-today);
      color: var(--color-today);
    }

    .live-timer-badge.urgency-later {
      border-color: var(--color-later);
      color: var(--color-later);
    }

    .live-timer-badge.urgency-future {
      border-color: var(--color-future);
      color: var(--color-future);
    }

    @keyframes timerPulse {
      0%, 100% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.05); }
    }

    .live-timer-badge svg {
      width: 14px;
      height: 14px;
      stroke-width: 2.5;
    }

    .timer-text {
      white-space: nowrap;
    }

    /* ===============================================
       URGENCY STATUS BADGE - Top Left
       =============================================== */

    .urgency-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 5;
    }

    .urgency-badge.status-urgent {
      background: var(--color-urgent);
      color: white;
    }

    .urgency-badge.status-soon {
      background: var(--color-soon);
      color: white;
    }

    .urgency-badge.status-today {
      background: var(--color-today);
      color: var(--color-midnight);
    }

    .urgency-badge.status-later {
      background: var(--color-later);
      color: white;
    }

    .urgency-badge.status-future {
      background: var(--color-future);
      color: white;
    }

    /* ===============================================
       QUICK WIDGETS - Top Right Mini Badges
       =============================================== */

    .quick-widgets {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 6px;
      z-index: 5;
    }

    .mini-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 9px;
      font-weight: 600;
      color: var(--color-slate);
      backdrop-filter: blur(10px);
    }

    .mini-badge.filling {
      border-color: var(--color-danger);
      color: var(--color-danger);
    }

    .mini-badge svg {
      width: 10px;
      height: 10px;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background: var(--color-danger);
      border-radius: 50%;
      animation: pulseDot 2s infinite;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* ===============================================
       CARD GRID LAYOUT - Two Column
       =============================================== */

    .card-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: var(--spacing-lg);
      margin-top: 28px;
    }

    /* ===============================================
       ROUTE INFO - Left Column
       =============================================== */

    .route-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .route-visual {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .route-point {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .point-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .start-point .point-marker {
      background: linear-gradient(135deg, #3B82F6, #60A5FA);
      color: white;
    }

    .end-point .point-marker {
      background: linear-gradient(135deg, #10B981, #34D399);
      color: white;
    }

    .point-marker svg {
      width: 16px;
      height: 16px;
      stroke-width: 2.5;
    }

    .point-info {
      flex: 1;
      padding-top: 4px;
    }

    .point-location {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-midnight);
      line-height: 1.3;
    }

    .point-details {
      font-size: 12px;
      color: var(--color-slate);
      margin-top: 2px;
    }

    .route-connector {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      margin-left: 16px;
    }

    .connector-line {
      width: 2px;
      height: 40px;
      background: linear-gradient(to bottom, #3B82F6, #10B981);
      border-radius: 2px;
      position: relative;
    }

    .connector-line::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background: var(--color-azure);
      border-radius: 50%;
      animation: travel 2s ease-in-out infinite;
    }

    @keyframes travel {
      0% { top: 0%; }
      100% { top: 100%; }
    }

    .route-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--color-slate);
    }

    .meta-item svg {
      width: 12px;
      height: 12px;
      stroke-width: 2;
    }

    .timing-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: var(--radius-md);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .time-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .time-row svg {
      width: 16px;
      height: 16px;
      color: var(--color-azure);
      flex-shrink: 0;
    }

    .time-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-slate);
      font-weight: 600;
      width: 60px;
    }

    .time-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-midnight);
    }

    .date-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--color-light-bg);
      border-radius: var(--radius-sm);
      font-size: 12px;
      color: var(--color-slate);
    }

    .date-display svg {
      width: 14px;
      height: 14px;
      stroke-width: 2;
    }

    /* ===============================================
       CARD RIGHT - Price & Driver Column
       =============================================== */

    .card-right {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-end;
    }

    .price-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .price-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 20px;
      background: var(--gradient-price);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-price);
      color: white;
    }

    .price-amount {
      font-size: 24px;
      font-weight: 800;
      line-height: 1;
    }

    .price-label {
      font-size: 10px;
      opacity: 0.9;
      margin-top: 4px;
    }

    .value-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: var(--color-success);
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 600;
      color: white;
    }

    .value-badge svg {
      width: 12px;
      height: 12px;
    }

    .favorite-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      background: var(--color-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .favorite-btn:hover {
      border-color: var(--color-danger);
      transform: scale(1.1);
    }

    .favorite-btn.active {
      background: var(--color-danger);
      border-color: var(--color-danger);
    }

    .favorite-btn svg {
      width: 20px;
      height: 20px;
      stroke-width: 2;
      transition: all 0.3s ease;
    }

    .favorite-btn.active svg {
      fill: white;
      stroke: white;
    }

    .heart-burst {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.3), transparent);
      animation: burst 0.6s ease-out;
      pointer-events: none;
    }

    @keyframes burst {
      from { transform: scale(0); opacity: 1; }
      to { transform: scale(2); opacity: 0; }
    }

    .driver-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .driver-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--color-border);
    }

    .driver-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-primary);
      color: white;
      font-weight: 700;
      font-size: 16px;
    }

    .verified-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-success);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-white);
    }

    .verified-badge svg {
      width: 10px;
      height: 10px;
      fill: white;
    }

    .driver-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .driver-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-midnight);
    }

    .driver-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      color: var(--color-slate);
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rating svg {
      width: 10px;
      height: 10px;
      fill: var(--color-warning);
    }

    .trips {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .seats-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }

    .seat-icons {
      display: flex;
      gap: 4px;
    }

    .seat-icons svg {
      width: 14px;
      height: 14px;
    }

    .seat-icons svg.available {
      fill: var(--color-slate);
      opacity: 0.3;
    }

    .seat-icons svg.filled {
      fill: var(--color-azure);
    }

    .seats-count {
      font-size: 10px;
      font-weight: 600;
      color: var(--color-slate);
    }

    /* ===============================================
       QUICK ACTIONS PANEL
       =============================================== */

    .quick-actions-panel {
      display: flex;
      gap: 10px;
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }

    .action-btn.primary {
      background: var(--gradient-primary);
      color: white;
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(62, 143, 255, 0.3);
    }

    .action-btn.secondary {
      background: var(--color-white);
      border: 2px solid var(--color-azure);
      color: var(--color-azure);
    }

    .action-btn.secondary:hover {
      background: var(--color-azure);
      color: white;
    }

    .action-btn svg {
      width: 18px;
      height: 18px;
      stroke-width: 2;
    }

    /* ===============================================
       EXPAND HINT
       =============================================== */

    .expand-hint {
      display: flex;
      justify-content: center;
      margin-top: var(--spacing-sm);
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    .expand-hint:hover {
      opacity: 1;
    }

    .expand-hint svg {
      width: 16px;
      height: 16px;
      stroke-width: 2.5;
      color: var(--color-slate);
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(4px); }
    }

    /* ===============================================
       MOBILE RESPONSIVE
       =============================================== */

    @media (max-width: 640px) {
      .ride-card {
        padding: var(--spacing-md);
      }

      .card-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .card-right {
        align-items: flex-start;
        flex-direction: row;
        justify-content: space-between;
      }

      .live-timer-badge {
        font-size: 10px;
        padding: 5px 10px;
      }

      .urgency-badge {
        font-size: 9px;
        padding: 3px 8px;
      }

      .point-location {
        font-size: 13px;
      }

      .point-details {
        font-size: 11px;
      }

      .price-amount {
        font-size: 20px;
      }

      .timing-details {
        padding: 10px;
      }

      .time-value {
        font-size: 13px;
      }

      .action-btn {
        font-size: 12px;
        padding: 8px 12px;
      }

      .driver-row {
        flex-wrap: wrap;
      }

      .seats-display {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `]
})
export class RideResultCardComponent implements OnInit, OnDestroy {
  @Input() item: any;
  @Input() isSelected: boolean = false;
  @Output() cardClick = new EventEmitter<any>();
  
  isFavorite = signal(false);
  isExpanded = signal(false);
  currentTime = signal(new Date());
  
  private timerInterval: any;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Update time every second for live countdown
    this.timerInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }
  
  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  
  // Calculate urgency level based on time until departure
  getUrgencyLevel(): 'urgent' | 'soon' | 'today' | 'later' | 'future' {
    if (!this.item.departureDateTime) return 'later';
    
    const now = this.currentTime();
    const departure = new Date(this.item.departureDateTime);
    const minutesUntil = (departure.getTime() - now.getTime()) / 60000;
    
    if (minutesUntil <= 30) return 'urgent';      // 0-30 min: RED
    if (minutesUntil <= 60) return 'soon';        // 30-60 min: ORANGE
    if (minutesUntil <= 180) return 'today';      // 1-3 hours: YELLOW
    if (minutesUntil <= 1440) return 'later';     // 3-24 hours: GREEN
    return 'future';                              // 24+ hours: BLUE
  }
  
  // Format countdown text for display
  getCountdownText(): string {
    if (!this.item.departureDateTime) return 'View Details';
    
    const now = this.currentTime();
    const departure = new Date(this.item.departureDateTime);
    const minutesUntil = Math.floor((departure.getTime() - now.getTime()) / 60000);
    
    if (minutesUntil < 0) return 'Departed';
    if (minutesUntil < 1) return 'Leaving Now!';
    if (minutesUntil < 60) return `${minutesUntil} min left`;
    
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
    }
    
    const days = Math.floor(hours / 24);
    if (days === 1) return `Tomorrow at ${this.item.departureTime || ''}`;
    return `${days} days`;
  }
  
  // Get urgency status label
  getUrgencyLabel(): string {
    const level = this.getUrgencyLevel();
    const labels = {
      'urgent': 'Leaving Soon',
      'soon': 'Starting Soon',
      'today': 'Later Today',
      'later': 'Today',
      'future': 'Tomorrow'
    };
    return labels[level] || 'Scheduled';
  }
  
  // Helper method to extract time period (AM/PM)
  getTimePeriod(time: string): string {
    if (!time) return '';
    const match = time.match(/(AM|PM)/i);
    return match ? match[1].toUpperCase() : '';
  }

  // Check if filling soon (low seats)
  isFillingSoon(): boolean {
    return this.item.seatsAvailable && this.item.seatsAvailable <= 2;
  }

  // Get ride type based on distance/duration
  getRideType(): string {
    if (!this.item.distance) return '';
    
    const distance = parseInt(this.item.distance);
    if (distance > 200) return 'Long Drive';
    if (distance < 30) return 'Quick Ride';
    if (this.item.rideType) return this.item.rideType;
    return '';
  }

  // Create array for seats visualization
  getSeatsArray(total: number): number[] {
    return Array(Math.min(total, 4)).fill(0);
  }

  // Calculate progress dash array for SVG circle
  getProgressDashArray(percentage: number): string {
    const circumference = 2 * Math.PI * 28; // radius = 28
    const progress = (percentage / 100) * circumference;
    return `${progress} ${circumference}`;
  }

  // Check if price is good value
  isGoodValue(): boolean {
    const price = this.item.priceNum || 0;
    const distance = parseInt(this.item.distance) || 0;
    
    if (distance === 0) return false;
    
    // Good value if less than $0.15 per mile
    const pricePerMile = price / distance;
    return pricePerMile < 0.15;
  }
  
  onCardClick() {
    // Toggle expand on mobile, emit on desktop
    if (window.innerWidth <= 768) {
      this.isExpanded.set(!this.isExpanded());
    } else {
      this.cardClick.emit(this.item);
    }
  }

  onFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite.set(!this.isFavorite());
    console.log('Favorite toggled for ride:', this.item.id);
  }

  onViewDetails(event: Event) {
    event.stopPropagation();
    this.cardClick.emit(this.item);
  }

  onQuickBook(event: Event) {
    event.stopPropagation();
    console.log('Quick book triggered for ride:', this.item.id);
    // Handle quick booking flow
  }
}

