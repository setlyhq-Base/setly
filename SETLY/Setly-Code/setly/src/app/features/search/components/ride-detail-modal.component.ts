import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-ride-detail-modal',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('modalAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.95)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', animate('200ms ease-out')),
      transition('* => void', animate('150ms ease-in'))
    ]),
    trigger('backdropAnimation', [
      state('void', style({
        opacity: 0
      })),
      state('*', style({
        opacity: 1
      })),
      transition('void => *', animate('200ms ease-out')),
      transition('* => void', animate('150ms ease-in'))
    ])
  ],
  template: `
    <div class="modal-backdrop" 
         @backdropAnimation
         (click)="onBackdropClick()"
         *ngIf="isOpen">
      <div class="modal-container" 
           @modalAnimation
           (click)="$event.stopPropagation()">
        
        <!-- Close Button -->
        <button class="modal-close-btn" (click)="close()" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Header Section -->
        <div class="modal-header">
          <div class="header-badges">
            <div class="badge-large price-badge">
              <span *ngIf="ride.priceNum > 0">\${{ ride.priceNum }}</span>
              <span *ngIf="ride.priceNum === 0">FREE</span>
              <span class="badge-label">/ seat</span>
            </div>
            
            <div class="badge-large seats-badge">
              <svg class="badge-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ ride.seatsAvailable }}/{{ ride.totalSeats }} left</span>
            </div>
            
            <div class="badge-large trust-badge">
              <svg class="badge-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ ride.driver.trustScore }}% Trust</span>
            </div>
          </div>
          
          <button class="favorite-btn-large" aria-label="Add to favorites">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="modal-content">
          
          <!-- Route Section -->
          <div class="detail-section route-section">
            <h3 class="section-title">Route</h3>
            <div class="route-details">
              <div class="location-detail pickup">
                <svg class="location-icon-large" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5"/>
                  <circle cx="12" cy="12" r="5" fill="currentColor"/>
                </svg>
                <div class="location-info">
                  <div class="location-label">PICKUP</div>
                  <div class="location-main">{{ ride.fromLine1 }}</div>
                  <div class="location-sub">{{ ride.fromLine2 }}</div>
                </div>
              </div>
              
              <div class="route-line-vertical"></div>
              
              <div class="location-detail dropoff">
                <svg class="location-icon-large" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="2.5"/>
                  <circle cx="12" cy="9" r="4" fill="currentColor"/>
                </svg>
                <div class="location-info">
                  <div class="location-label">DROPOFF</div>
                  <div class="location-main">{{ ride.toLine1 }}</div>
                  <div class="location-sub">{{ ride.toLine2 }}</div>
                </div>
              </div>
              
              <div class="trip-stats">
                <div class="stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ ride.distance }}</span>
                </div>
                <div class="stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ ride.duration }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Date & Time Section -->
          <div class="detail-section">
            <h3 class="section-title">Date & Time</h3>
            <div class="datetime-details">
              <div class="datetime-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="datetime-info">
                  <div class="datetime-label">Date</div>
                  <div class="datetime-value">{{ ride.departureDate }}</div>
                </div>
              </div>
              <div class="datetime-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="datetime-info">
                  <div class="datetime-label">Time</div>
                  <div class="datetime-value">{{ ride.departureTime }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Driver Section -->
          <div class="detail-section driver-section">
            <h3 class="section-title">Driver</h3>
            <div class="driver-details">
              <img 
                *ngIf="ride.driver.avatar" 
                [src]="ride.driver.avatar" 
                [alt]="ride.driver.name" 
                class="driver-avatar-large"
              />
              <div *ngIf="!ride.driver.avatar" class="driver-avatar-placeholder-large">
                {{ ride.driver.name.charAt(0) }}
              </div>
              
              <div class="driver-info-large">
                <div class="driver-name-large">{{ ride.driver.name }}</div>
                <div class="driver-rating-large">
                  <svg class="star-large" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="rating-value">{{ ride.rating }}</span>
                  <span class="rating-label">({{ ride.tripsCompleted }} trips)</span>
                </div>
                <div class="driver-badges">
                  <div class="badge-inline verified" *ngIf="ride.driver.verified">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Verified Driver</span>
                  </div>
                  <div class="badge-inline student" *ngIf="ride.driver.studentVerified">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Student ID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Car Section -->
          <div class="detail-section car-section">
            <h3 class="section-title">Vehicle</h3>
            <div class="car-details">
              <img 
                *ngIf="ride.car.image" 
                [src]="ride.car.image" 
                [alt]="ride.car.make" 
                class="car-image-large"
              />
              <div class="car-info-large">
                <div class="car-make">{{ ride.car.make }}</div>
                <div class="car-specs">
                  <span class="spec">{{ ride.car.color }}</span>
                  <span class="spec-divider">•</span>
                  <span class="spec">{{ ride.car.year }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Safety Section -->
          <div class="detail-section safety-section">
            <h3 class="section-title">Safety & Trust</h3>
            <div class="safety-items">
              <div class="safety-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>All rides are insured</span>
              </div>
              <div class="safety-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ ride.driver.trustScore }}% trust rating</span>
              </div>
              <div class="safety-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ ride.tripsCompleted }} completed trips</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer CTA -->
        <div class="modal-footer">
          <button class="cta-btn primary">
            <span>Request Seat</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="cta-btn secondary">
            <span>Contact Driver</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --brand-azure: #3E8FFF;
      --brand-azure-dark: #2563EB;
      --brand-midnight: #0A1A3F;
      --brand-slate: #6F7785;
      --success-green: #10B981;
      --warning-gold: #F59E0B;
    }

    /* Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    /* Modal Container */
    .modal-container {
      background: #fff;
      border-radius: 24px;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.2),
        0 8px 24px rgba(0, 0, 0, 0.15);
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Close Button */
    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--brand-slate);
      transition: all 0.2s;
      z-index: 10;
    }

    .modal-close-btn:hover {
      background: #fff;
      color: #EF4444;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Header */
    .modal-header {
      padding: 24px 24px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .header-badges {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      flex: 1;
    }

    .badge-large {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    .price-badge {
      background: linear-gradient(135deg, var(--brand-azure) 0%, var(--brand-azure-dark) 100%);
    }

    .badge-label {
      font-size: 12px;
      font-weight: 600;
      opacity: 0.9;
    }

    .seats-badge {
      background: linear-gradient(135deg, #FCD34D 0%, var(--warning-gold) 100%);
      color: #78350F;
    }

    .trust-badge {
      background: linear-gradient(135deg, #34D399 0%, var(--success-green) 100%);
      color: #065F46;
    }

    .badge-icon {
      flex-shrink: 0;
    }

    .favorite-btn-large {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--brand-slate);
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .favorite-btn-large:hover {
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
      color: #EF4444;
      transform: scale(1.1);
    }

    /* Content */
    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .detail-section {
      margin-bottom: 28px;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--brand-midnight);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
    }

    /* Route Section */
    .route-details {
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 16px;
      padding: 20px;
    }

    .location-detail {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .location-detail:last-of-type {
      margin-bottom: 20px;
    }

    .location-icon-large {
      flex-shrink: 0;
      margin-top: 4px;
    }

    .pickup .location-icon-large {
      color: var(--brand-azure);
    }

    .dropoff .location-icon-large {
      color: var(--success-green);
    }

    .location-info {
      flex: 1;
    }

    .location-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--brand-slate);
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .location-main {
      font-size: 18px;
      font-weight: 700;
      color: var(--brand-midnight);
      line-height: 1.3;
      margin-bottom: 4px;
    }

    .location-sub {
      font-size: 15px;
      font-weight: 500;
      color: var(--brand-slate);
      line-height: 1.4;
    }

    .route-line-vertical {
      width: 3px;
      height: 24px;
      background: linear-gradient(to bottom, var(--brand-azure) 0%, var(--success-green) 100%);
      border-radius: 3px;
      margin: -8px 0 -8px 34px;
    }

    .trip-stats {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: var(--brand-midnight);
    }

    .stat-item svg {
      color: var(--brand-azure);
    }

    /* Date & Time */
    .datetime-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .datetime-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border: 1px solid rgba(59, 130, 246, 0.15);
      border-radius: 12px;
      padding: 16px;
    }

    .datetime-item svg {
      color: var(--brand-azure);
      flex-shrink: 0;
    }

    .datetime-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--brand-slate);
      margin-bottom: 4px;
    }

    .datetime-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--brand-midnight);
    }

    /* Driver Section */
    .driver-details {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 16px;
      padding: 20px;
    }

    .driver-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.1),
        0 8px 24px rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    .driver-avatar-placeholder-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-azure) 0%, var(--brand-azure-dark) 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      border: 3px solid #fff;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.1),
        0 8px 24px rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    .driver-info-large {
      flex: 1;
    }

    .driver-name-large {
      font-size: 20px;
      font-weight: 700;
      color: var(--brand-midnight);
      margin-bottom: 8px;
    }

    .driver-rating-large {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .star-large {
      color: var(--warning-gold);
      fill: var(--warning-gold);
      filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.4));
    }

    .rating-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--brand-midnight);
    }

    .rating-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--brand-slate);
    }

    .driver-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge-inline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .badge-inline.verified {
      background: #DBEAFE;
      color: #1E40AF;
      border: 1px solid #93C5FD;
    }

    .badge-inline.student {
      background: #D1FAE5;
      color: #065F46;
      border: 1px solid #6EE7B7;
    }

    /* Car Section */
    .car-details {
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 16px;
      padding: 20px;
    }

    .car-image-large {
      width: 100%;
      height: auto;
      max-height: 240px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .car-make {
      font-size: 18px;
      font-weight: 700;
      color: var(--brand-midnight);
      margin-bottom: 6px;
    }

    .car-specs {
      font-size: 15px;
      font-weight: 500;
      color: var(--brand-slate);
    }

    .spec-divider {
      margin: 0 8px;
      color: #D1D5DB;
    }

    /* Safety Section */
    .safety-items {
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .safety-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 600;
      color: var(--brand-midnight);
    }

    .safety-item svg {
      color: var(--success-green);
      flex-shrink: 0;
    }

    /* Footer */
    .modal-footer {
      padding: 20px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      background: linear-gradient(135deg, #FAFBFC 0%, #F8FAFC 100%);
      display: flex;
      gap: 12px;
    }

    .cta-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cta-btn.primary {
      background: linear-gradient(135deg, var(--brand-azure) 0%, var(--brand-azure-dark) 100%);
      color: #fff;
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.3);
    }

    .cta-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(62, 143, 255, 0.4);
    }

    .cta-btn.secondary {
      background: #fff;
      color: var(--brand-azure);
      border: 2px solid var(--brand-azure);
    }

    .cta-btn.secondary:hover {
      background: rgba(62, 143, 255, 0.05);
      transform: translateY(-2px);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .modal-backdrop {
        align-items: flex-end;
        padding: 0;
      }

      .modal-container {
        max-width: 100%;
        max-height: 85vh;
        border-radius: 24px 24px 0 0;
        margin-bottom: 0;
      }

      .datetime-details {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        flex-direction: column;
      }

      .header-badges {
        flex-wrap: wrap;
      }
    }
  `]
})
export class RideDetailModalComponent implements OnInit, OnDestroy {
  @Input() ride: any;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  ngOnInit() {
    if (this.isOpen) {
      this.lockScroll();
    }
  }

  ngOnDestroy() {
    this.unlockScroll();
  }

  close() {
    this.unlockScroll();
    this.closeModal.emit();
  }

  onBackdropClick() {
    this.close();
  }

  private lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    document.body.style.overflow = '';
  }
}
