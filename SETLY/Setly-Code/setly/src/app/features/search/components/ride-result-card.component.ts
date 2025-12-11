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
      <!-- Role Chip (Top Left) -->
      <div class="role-chip" [class.driver]="isDriver()" [class.seeker]="!isDriver()">
        <span *ngIf="isDriver()">🚗 Driver Ride</span>
        <span *ngIf="!isDriver()">🙋‍♂️ Ride Needed</span>
      </div>

      <!-- Countdown Timer Chip (Top Right - Driver Only) -->
      <div class="countdown-chip" *ngIf="isDriver() && getCountdownText()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
        </svg>
        <span>{{ getCountdownText() }}</span>
      </div>

      <!-- Route Header -->
      <div class="route-header">
        <h3 class="route-title">{{ getFromShort() }} → {{ getToShort() }}</h3>
        
        <!-- Optional Tag Badge -->
        <div class="tag-badge" *ngIf="getTag()">
          <span>{{ getTag() }}</span>
        </div>
      </div>

      <!-- Timing Section - Different for Driver vs Seeker -->
      <div class="timing-section">
        <!-- Driver Post: Show Pickup + Drop-off Times -->
        <div *ngIf="isDriver()" class="driver-times">
          <div class="time-row compact">
            <svg class="time-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="time-label">Pickup</span>
            <span class="time-dot">•</span>
            <span class="time-value">{{ item.departureTime || '10:00 AM' }}</span>
            <span class="time-separator">|</span>
            <span class="time-label">Drop-off</span>
            <span class="time-dot">•</span>
            <span class="time-value">{{ item.arrivalTime || '11:00 AM' }}</span>
          </div>
        </div>

        <!-- Seeker Post: Show Flexible Timing or Specific Time -->
        <div *ngIf="!isDriver()" class="seeker-timing">
          <div class="time-row">
            <svg class="time-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="timing-text">{{ getSeekerTiming() }}</span>
          </div>
        </div>
      </div>

      <!-- User Section - Different for Driver vs Seeker -->
      <div class="user-section">
        <div class="user-avatar">
          <img 
            *ngIf="getUserAvatar()" 
            [src]="getUserAvatar()" 
            [alt]="getUserName()"
            class="avatar-image"
            loading="lazy"
          />
          <div *ngIf="!getUserAvatar()" class="avatar-placeholder">
            {{ getUserInitial() }}
          </div>
          
          <!-- Online/Offline Status Dot (Driver Only) -->
          <div class="status-dot" *ngIf="isDriver()" [class.online]="isDriverOnline()"></div>
        </div>
        
        <span class="user-name">{{ getUserFirstName() }}</span>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ROOT VARIABLES ========== */
    :host {
      --brand-azure: #3E8FFF;
      --brand-navy: #0A1A3F;
      --driver-blue: #3E8FFF;
      --seeker-purple: #8B5CF6;
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
      padding: 32px 14px 12px 14px;
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

    /* ========== ROLE CHIP (Top Left) ========== */
    .role-chip {
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 2;
    }

    .role-chip.driver {
      background: linear-gradient(135deg, var(--driver-blue), #5EA3FF);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(62, 143, 255, 0.25);
    }

    .role-chip.seeker {
      background: linear-gradient(135deg, var(--seeker-purple), #A78BFA);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
    }

    /* ========== COUNTDOWN CHIP (Top Right - Driver Only) ========== */
    .countdown-chip {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      font-size: 10px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      z-index: 2;
    }

    .countdown-chip svg {
      color: var(--driver-blue);
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

    .driver-times .time-row.compact {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      flex-wrap: wrap;
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

    .time-separator {
      color: var(--border-color);
      font-weight: 600;
      margin: 0 4px;
    }

    /* Seeker Timing */
    .seeker-timing .time-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .timing-text {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 12px;
    }

    /* ========== USER SECTION ========== */
    .user-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 4px;
      border-top: 1px solid var(--border-color);
    }

    .user-avatar {
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
        padding: 28px 12px 10px 12px;
      }

      .route-title {
        font-size: 13px;
      }

      .time-row {
        font-size: 11px;
      }

      .user-name {
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

  isDriver(): boolean {
    // Check if post type is 'driver'
    return this.item?.type === 'driver' || this.item?.postType === 'driver';
  }

  getCountdownText(): string | null {
    if (!this.isDriver() || !this.item.departureDate || !this.item.departureTime) {
      return null;
    }

    try {
      const now = new Date();
      const departureDateTime = new Date(`${this.item.departureDate} ${this.item.departureTime}`);
      const diffMs = departureDateTime.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 0) return 'Departed';
      if (diffHours < 1) return 'Leaving soon';
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d`;
    } catch {
      return null;
    }
  }

  getSeekerTiming(): string {
    // For seeker posts, show flexible timing or specific need
    if (this.item.departureTime) {
      return `Needs ride at ${this.item.departureTime}`;
    }
    return 'Flexible timing';
  }

  getUserAvatar(): string | null {
    if (this.isDriver()) {
      return this.item?.driver?.avatar || null;
    } else {
      // For seeker, use the post author's avatar
      return this.item?.user?.avatar || this.item?.author?.avatar || null;
    }
  }

  getUserName(): string {
    if (this.isDriver()) {
      return this.item?.driver?.name || 'Driver';
    } else {
      return this.item?.user?.name || this.item?.author?.name || 'User';
    }
  }

  getUserFirstName(): string {
    const fullName = this.getUserName();
    const firstName = fullName.split(' ')[0];
    return firstName;
  }

  getUserInitial(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
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

  isDriverOnline(): boolean {
    // Random online status for demo - in production, check actual status
    if (this.isDriver()) {
      return this.item?.driver?.online ?? Math.random() > 0.5;
    }
    return false;
  }
}
