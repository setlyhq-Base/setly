import { Component, signal, inject, OnInit, HostListener, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostRoomPage } from '../../features/post-room/post-room.page';
import { SetlyRideFormComponent } from '../../features/ride/setly-ride-form.component';
import { ToastService } from '../../core/services/toast.service';
import { ActiveTabService } from '../../core/services/active-tab.service';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [CommonModule, FormsModule, PostRoomPage, SetlyRideFormComponent],
  template: `
    <!-- FAB Button -->
    <button
      class="fab-button"
      [class.icon-changing]="iconChanging()"
      (click)="togglePopover()"
      aria-label="Create new post"
      [attr.aria-expanded]="showPopover()"
      data-testid="fab-button"
    >
      <!-- Dynamic icon based on active tab -->
      <svg *ngIf="activeTab() === 'rooms'" class="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <!-- Home icon -->
        <path d="M3 10l9-7 9 7" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 21v-6h4v6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg *ngIf="activeTab() === 'rides'" class="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <!-- Car icon - clear side view -->
        <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7.5" cy="17" r="1.5" fill="#FFFFFF"/>
        <circle cx="16.5" cy="17" r="1.5" fill="#FFFFFF"/>
      </svg>
      <svg *ngIf="activeTab() === 'market'" class="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <!-- Box icon -->
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
        <path d="M12 13V3" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
        <path d="M3 8l9 5 9-5" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Popover -->
    <div *ngIf="showPopover()" class="fab-popover" role="menu" aria-labelledby="fab-menu">
      <div id="fab-menu" class="sr-only">Create options</div>
      <div class="popover-header">Create</div>
      <button class="popover-item" (click)="selectOption('room')" role="menuitem">
        <span class="item-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <!-- Home icon - matching FAB -->
            <path d="M3 10l9-7 9 7" stroke="#6A6A6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="#6A6A6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 21v-6h4v6" stroke="#6A6A6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="item-content">
          <div class="item-title">Create a Room Post</div>
          <div class="item-desc">List a shared or private room near your campus.</div>
        </div>
      </button>
      <button class="popover-item" (click)="selectOption('ride')" role="menuitem">
        <span class="item-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <!-- Car icon - clear side view matching tabs -->
            <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="#6A6A6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7.5" cy="17" r="1.5" fill="#6A6A6A"/>
            <circle cx="16.5" cy="17" r="1.5" fill="#6A6A6A"/>
          </svg>
        </span>
        <div class="item-content">
          <div class="item-title">Post or Request a Ride</div>
          <div class="item-desc">Offer rides or request a seat from other students.</div>
        </div>
      </button>
      <button class="popover-item" (click)="selectOption('market')" role="menuitem">
        <span class="item-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <!-- Box icon - matching FAB -->
            <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="#6A6A6A" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 13V3" stroke="#6A6A6A" stroke-width="2" stroke-linejoin="round"/>
            <path d="M3 8l9 5 9-5" stroke="#6A6A6A" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="item-content">
          <div class="item-title">List an Item in Marketplace</div>
          <div class="item-desc">Sell books, furniture, electronics, and more.</div>
        </div>
      </button>
    </div>

    <!-- Backdrop for popover -->
    <div *ngIf="showPopover()" class="fab-backdrop" (click)="closePopover()"></div>

    <!-- Modals -->
    <div *ngIf="showRoomModal()" class="modal-overlay" (click)="closeRoomModal()">
      <div class="modal-content wide" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Post a Room</h2>
          <button class="close-btn" (click)="closeRoomModal()" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <app-post-room-page (roomPosted)="onRoomPosted()"></app-post-room-page>
        </div>
      </div>
    </div>

    <div *ngIf="showRideModal()" class="modal-overlay" (click)="closeRideModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Post or Request a Ride</h2>
          <button class="close-btn" (click)="closeRideModal()" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <app-setly-ride-form (rideSubmitted)="onRideSubmitted()"></app-setly-ride-form>
        </div>
      </div>
    </div>

    <div *ngIf="showMarketModal()" class="modal-overlay" (click)="closeMarketModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>List an Item in Marketplace</h2>
          <button class="close-btn" (click)="closeMarketModal()" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="onMarketSubmit()" class="market-form">
            <div class="form-group">
              <label for="market-title">Title *</label>
              <input id="market-title" [(ngModel)]="marketForm.title" name="title" required placeholder="e.g., IKEA desk" />
            </div>
            <div class="form-group">
              <label for="market-price">Price (USD) *</label>
              <input id="market-price" type="number" [(ngModel)]="marketForm.price" name="price" required min="0" placeholder="e.g., 50" />
            </div>
            <div class="form-group">
              <label for="market-desc">Description</label>
              <textarea id="market-desc" [(ngModel)]="marketForm.desc" name="desc" rows="3" placeholder="Short details..."></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Post Item</button>
              <button type="button" class="btn-secondary" (click)="closeMarketModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fab-button {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #3E8FFF; /* Electric Azure */
      border: none;
      box-shadow: 0 4px 20px rgba(62, 143, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      z-index: 1000;
    }
    
    /* Mobile: Position FAB above bottom navigation */
    @media (max-width: 767px) {
      .fab-button {
        bottom: 92px;
        right: 20px;
      }
    }
    .fab-button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(62, 143, 255, 0.5);
      background: #5BA0FF; /* Slightly brighter on hover */
    }
    .fab-button:active {
      transform: scale(0.95);
      box-shadow: 0 2px 12px rgba(62, 143, 255, 0.35);
    }
    
    /* Icon change animation */
    .fab-button.icon-changing {
      animation: iconChange 0.3s ease;
    }
    @keyframes iconChange {
      0% {
        transform: scale(1);
        box-shadow: 0 4px 20px rgba(62, 143, 255, 0.4);
      }
      25% {
        transform: scale(0.9);
        box-shadow: 0 2px 12px rgba(62, 143, 255, 0.3);
      }
      50% {
        transform: scale(0.9);
        box-shadow: 0 6px 24px rgba(62, 143, 255, 0.6);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 4px 20px rgba(62, 143, 255, 0.4);
      }
    }
    
    .fab-icon {
      display: block;
      animation: iconFadeIn 0.15s ease;
    }
    @keyframes iconFadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .fab-popover {
      position: fixed;
      bottom: 94px; /* slightly closer to FAB */
      right: 34px;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
      padding: 16px;
      min-width: 240px;
      z-index: 1001;
      animation: slideUp 0.18s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px solid #e2e8f0;
    }
    
    /* Mobile: Position popover above FAB which is above bottom nav */
    @media (max-width: 767px) {
      .fab-popover {
        bottom: 160px;
        right: 20px;
      }
    }
    .fab-popover::after {
      content: '';
      position: absolute;
      bottom: -7px;
      right: 16px;
      width: 11px; height: 11px;
      background: #FFFFFF;
      transform: rotate(45deg);
      box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      border-top: none;
      border-left: none;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .popover-header {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      padding: 0 4px 4px 4px;
    }
    .popover-item {
      display: flex;
      align-items: flex-start;
      width: 100%;
      padding: 10px 10px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.14s ease;
      position: relative;
      line-height: 1.3;
    }
    .popover-item:hover, .popover-item:focus {
      background: #f1f5f9;
      outline: none;
    }
    .popover-item:focus-visible {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }
    .item-icon {
      margin-right: 10px;
      flex-shrink: 0;
    }
    .item-content {
      text-align: left;
    }
    .item-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .item-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.35;
    }

    .fab-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 998;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: 16px;
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .modal-content.wide {
      max-width: 1200px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
    }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .market-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }
    .form-group input,
    .form-group textarea {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--brand-midnight, #0A1A3F) 0%, var(--brand-azure, #3E8FFF) 55%, #E8F4FF 85%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 18px -6px rgba(62,143,255,0.28), 0 2px 6px rgba(10,26,63,0.18);
    }
    .btn-secondary {
      background: white;
      border: 1.5px solid var(--brand-midnight, #0A1A3F);
      color: var(--text, #1A1A1A);
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 640px) {
      .fab-button {
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
      }
      .fab-popover {
        bottom: 86px;
        right: 24px;
        min-width: 220px;
        padding: 14px;
      }
      .modal-overlay {
        padding: 8px;
      }
      .modal-content {
        max-width: 95vw;
        max-height: 95vh;
      }
    }
  `]
})
export class FabComponent implements OnInit {
  private activeTabService = inject(ActiveTabService);
  private router = inject(Router);
  private toast = inject(ToastService);

  showPopover = signal(false);
  showRoomModal = signal(false);
  showRideModal = signal(false);
  showMarketModal = signal(false);
  iconChanging = signal(false);

  // Get active tab from service
  activeTab = this.activeTabService.activeTab;

  marketForm = { title: '', price: 0, desc: '' };

  constructor() {
    // Trigger animation when tab changes
    effect(() => {
      this.activeTab(); // Track the signal
      this.triggerIconChangeAnimation();
    });
  }

  triggerIconChangeAnimation() {
    this.iconChanging.set(true);
    setTimeout(() => this.iconChanging.set(false), 300);
  }

  togglePopover() {
    this.showPopover.update(v => !v);
  }

  closePopover() {
    this.showPopover.set(false);
  }

  selectOption(type: 'room' | 'ride' | 'market') {
    this.closePopover();
    if (type === 'room') {
      this.showRoomModal.set(true);
    } else if (type === 'ride') {
      this.showRideModal.set(true);
    } else if (type === 'market') {
      this.showMarketModal.set(true);
    }
  }

  closeRoomModal() {
    this.showRoomModal.set(false);
  }

  closeRideModal() {
    this.showRideModal.set(false);
  }

  closeMarketModal() {
    this.showMarketModal.set(false);
  }

  onRoomPosted() {
    this.closeRoomModal();
    this.toast.success('Your room is live!');
    // Note: PostRoomPage handles redirect internally
  }

  ngOnInit() {
    // Listen for room posted event from PostRoomPage
    window.addEventListener('roomPosted', () => {
      this.onRoomPosted();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(){
    if (this.showPopover()) this.closePopover();
    if (this.showRoomModal()) this.closeRoomModal();
    if (this.showRideModal()) this.closeRideModal();
    if (this.showMarketModal()) this.closeMarketModal();
  }

  onRideSubmitted() {
    this.closeRideModal();
    this.toast.success('Your ride request has been posted!');
    setTimeout(() => this.router.navigate(['/ride']), 600);
  }

  onMarketSubmit() {
    if (!this.marketForm.title || !this.marketForm.price) return;
    this.closeMarketModal();
    this.toast.success('Your item has been posted!');
    setTimeout(() => this.router.navigate(['/connect/marketplace']), 600);
    this.marketForm = { title: '', price: 0, desc: '' };
  }
}
