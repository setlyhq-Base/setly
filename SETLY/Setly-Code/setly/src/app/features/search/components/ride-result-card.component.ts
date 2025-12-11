import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Clean premium ride card matching Room card style - Setly branding
@Component({
  selector: 'app-ride-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="premium-card" 
      [class.selected]="isSelected"
      (click)="onClick()" 
      (keydown.enter)="onClick()"
      (keydown.space)="$event.preventDefault(); onClick()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'View ride from ' + getFromShort() + ' to ' + getToShort()"
    >
      <!-- Route Header -->
      <div class="route-header">
        <h3 class="route-title">{{ getFromShort() }} → {{ getToShort() }}</h3>
        
        <!-- Optional Tag Badge -->
        <div class="tag-badge" *ngIf="getTag()">
          <span>{{ getTag() }}</span>
        </div>
      </div>

      <!-- Timing Section -->
      <div class="timing-section">
        <div class="time-row">
          <svg class="time-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="time-label">Pickup</span>
          <span class="time-dot">•</span>
          <span class="time-value">{{ item.departureTime || '10:00 AM' }}</span>
        </div>

        <div class="time-row">
          <svg class="time-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="time-label">Drop-off</span>
          <span class="time-dot">•</span>
          <span class="time-value">{{ item.arrivalTime || '11:00 AM' }}</span>
        </div>
      </div>

      <!-- Driver Section -->
      <div class="driver-section">
        <div class="driver-avatar">
          <img 
            *ngIf="item.driver?.avatar" 
            [src]="item.driver.avatar" 
            [alt]="item.driver?.name || 'Driver'"
            class="avatar-image"
            loading="lazy"
          />
          <div *ngIf="!item.driver?.avatar" class="avatar-placeholder">
            {{ getDriverInitial() }}
          </div>
          
          <!-- Online/Offline Status Dot -->
          <div class="status-dot" [class.online]="isDriverOnline()"></div>
        </div>
        
        <span class="driver-name">{{ getDriverFirstName() }}</span>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ROOT VARIABLES ========== */
    :host {
      --brand-azure: #3E8FFF;
      --brand-navy: #0A1A3F;
      --text-primary: #1A1A1A;
      --text-secondary: #6B7280;
      --border-color: #E5E7EB;
      --success-green: #10B981;
      --online-blue: #3E8FFF;
      --offline-gray: #9CA3AF;
      --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
      --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(62, 143, 255, 0.15);
    }

    /* ========== PREMIUM CARD CONTAINER ========== */
    .premium-card {
      position: relative;
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      padding: 12px 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .premium-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: rgba(62, 143, 255, 0.2);
    }

    .premium-card.selected {
      border-color: var(--brand-azure);
      box-shadow: 
        0 0 0 3px rgba(62, 143, 255, 0.15),
        0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .premium-card:focus {
      outline: none;
      border-color: var(--brand-azure);
      box-shadow: 
        0 0 0 4px rgba(62, 143, 255, 0.2),
        0 8px 24px rgba(0, 0, 0, 0.12);
    }

    /* ========== ROUTE HEADER ========== */
    .route-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .route-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .tag-badge {
      flex-shrink: 0;
      padding: 4px 8px;
      background: linear-gradient(135deg, var(--brand-azure), #5EA3FF);
      border-radius: 6px;
      font-size: 9px;
      font-weight: 700;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ========== TIMING SECTION ========== */
    .timing-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .time-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .time-icon {
      flex-shrink: 0;
      color: var(--brand-azure);
    }

    .time-label {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .time-dot {
      color: var(--text-secondary);
      font-weight: 700;
    }

    .time-value {
      color: var(--text-primary);
      font-weight: 600;
    }

    /* ========== DRIVER SECTION ========== */
    .driver-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 4px;
      border-top: 1px solid var(--border-color);
    }

    .driver-avatar {
      position: relative;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-azure), #5EA3FF);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--offline-gray);
      border: 2px solid #FFFFFF;
      transition: background 0.3s ease;
    }

    .status-dot.online {
      background: var(--online-blue);
      box-shadow: 0 0 0 2px rgba(62, 143, 255, 0.2);
    }

    .driver-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 640px) {
      .premium-card {
        padding: 10px 12px;
      }

      .route-title {
        font-size: 13px;
      }

      .time-row {
        font-size: 11px;
      }

      .driver-name {
        font-size: 12px;
      }
    }
  `]
})
export class RideResultCardComponent {
  @Input() item: any;
  @Input() isSelected: boolean = false;
  @Output() cardClicked = new EventEmitter<any>();
  @Output() favoriteToggled = new EventEmitter<any>();

  constructor(private router: Router) {}

  onClick() {
    this.cardClicked.emit(this.item);
    // Navigate to ride details page
    this.router.navigate(['/rides', this.item.id || 'detail']);
  }

  getFromShort(): string {
    if (!this.item?.from) return 'Pickup Location';
    
    // Extract city name from full address
    const parts = this.item.from.split(',');
    return parts[0]?.trim() || this.item.from;
  }

  getToShort(): string {
    if (!this.item?.to) return 'Destination';
    
    // Extract city name from full address
    const parts = this.item.to.split(',');
    return parts[0]?.trim() || this.item.to;
  }

  getTag(): string | null {
    // Check if it's today
    const today = new Date().toDateString();
    const rideDate = this.item.departureDate ? new Date(this.item.departureDate).toDateString() : null;
    
    if (rideDate === today) {
      return 'TODAY';
    }

    // Check for airport in destination
    const destination = (this.item.to || '').toLowerCase();
    const isAirport = destination.includes('airport') || 
                      destination.includes('ewr') || 
                      destination.includes('jfk') || 
                      destination.includes('lga') ||
                      destination.includes('bos') ||
                      destination.includes('phl');
    
    if (isAirport) {
      return 'AIRPORT';
    }

    // Check if shared ride (seats available > 1)
    if (this.item.seatsAvailable && this.item.seatsAvailable > 1) {
      return 'QUICK RIDE';
    }

    return null;
  }

  getDriverFirstName(): string {
    if (!this.item?.driver?.name) return 'Driver';
    
    const firstName = this.item.driver.name.split(' ')[0];
    return firstName;
  }

  getDriverInitial(): string {
    if (!this.item?.driver?.name) return 'D';
    
    return this.item.driver.name.charAt(0).toUpperCase();
  }

  isDriverOnline(): boolean {
    // Random online status for demo - in production, check actual status
    return this.item?.driver?.online ?? Math.random() > 0.5;
  }
}

