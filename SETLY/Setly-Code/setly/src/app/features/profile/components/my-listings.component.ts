import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserStore } from '../../../core/state/user.store';
import { RoomResultCardComponent } from '../../search/components/room-result-card.component';
import { RideResultCardComponent } from '../../search/components/ride-result-card.component';

export interface ListingCardItem {
  id: string;
  title: string;
  city: string;
  state?: string;
  coverImage?: string;
  description?: string;
  createdAt?: string; // ISO
  type: 'room' | 'ride' | 'marketplace';
  // Additional fields to match Explore card requirements
  image?: string;
  location?: string;
  price?: string | number;
  priceNum?: number;
  rating?: number;
  verified?: boolean;
  // Ride-specific
  fromLine1?: string;
  toLine1?: string;
  departureDate?: string;
  departureTime?: string;
  seatsAvailable?: number;
  driver?: { name: string; avatar?: string; verified?: boolean };
  destination?: string;
  rideDate?: string;
  // Room-specific
  postedDate?: string;
  // Marketplace-specific
  condition?: string;
}

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, RoomResultCardComponent, RideResultCardComponent],
  template: `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">My Listings</h2>
  <a routerLink="/open-room" class="add-btn ripple">+ Add Listing</a>
      </div>
      <!-- Use Explore-style grid and cards -->
      <div class="results-grid" *ngIf="items?.length; else empty">
        <ng-container *ngFor="let it of items">
          <app-room-result-card 
            *ngIf="it.type === 'room'" 
            [item]="normalizeRoomItem(it)"
            [isSelected]="false"
            (cardClick)="onCardClick(it)">
          </app-room-result-card>
          <app-ride-result-card 
            *ngIf="it.type === 'ride'" 
            [item]="normalizeRideItem(it)"
            [isSelected]="false"
            (cardClick)="onCardClick(it)">
          </app-ride-result-card>
          
          <!-- Marketplace Item Card -->
          <div *ngIf="it.type === 'marketplace'" class="marketplace-card" (click)="onCardClick(it)">
            <div class="marketplace-image" [style.backgroundImage]="'url(' + (it.coverImage || '/assets/placeholder.jpg') + ')'">
              <span class="condition-badge">{{ it.condition || 'Used' }}</span>
            </div>
            <div class="marketplace-info">
              <h3 class="marketplace-title">{{ it.title }}</h3>
              <p class="marketplace-location">📍 {{ it.city }}, {{ it.state }}</p>
              <div class="marketplace-footer">
                <span class="marketplace-price">\${{ it.price }}</span>
                <span class="marketplace-date">{{ it.postedDate | date:'MMM d' }}</span>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
      <ng-template #empty>
        <div class="empty-state">
          <div class="illus" aria-hidden="true">📦</div>
          <p class="msg">You haven’t posted any listings yet.</p>
          <a routerLink="/open-room" class="empty-cta ripple">Create your first</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .card-header { @apply flex items-center justify-between mb-4; }
    .card-title { @apply text-lg font-semibold; }
    .add-btn { @apply text-sm px-3 py-1.5 rounded-full text-white shadow hover:opacity-90; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); }
    /* Explore-style grid matching search page */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }
    @media (max-width: 768px) {
      .results-grid {
        grid-template-columns: 1fr;
      }
    }
    .empty-state { text-align:center; padding:3.5rem 1.5rem; display:flex; flex-direction:column; gap:1rem; color:#64748b; }
    .empty-state .illus { font-size:2.75rem; filter:drop-shadow(0 6px 16px rgba(0,0,0,.12)); }
    .empty-state .msg { font-size:.9rem; font-weight:500; }
    .empty-cta { display:inline-block; align-self:center; font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.65rem 1.1rem; border-radius:.85rem; color:#fff; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); box-shadow:0 10px 24px -12px rgba(90,79,243,.55); }
    
    /* Marketplace Card Styles */
    .marketplace-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .marketplace-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .marketplace-image {
      width: 100%;
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .condition-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.95);
      color: #0A1A3F;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .marketplace-info {
      padding: 16px;
    }
    .marketplace-title {
      font-size: 16px;
      font-weight: 600;
      color: #0A1A3F;
      margin: 0 0 8px 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .marketplace-location {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 12px 0;
    }
    .marketplace-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .marketplace-price {
      font-size: 20px;
      font-weight: 700;
      color: #0F5FFF;
    }
    .marketplace-date {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }
  `]
})
export class MyListingsComponent {
  @Input() items: ListingCardItem[] = [];
  public userStore = inject(UserStore);

  normalizeRoomItem(item: ListingCardItem): any {
    return {
      id: item.id,
      title: item.title,
      location: item.city + (item.state ? ', ' + item.state : ''),
      image: item.coverImage || '/assets/placeholder-room.jpg',
      price: item.price || '$0/month',
      rating: item.rating || 0,
      verified: item.verified || false
    };
  }

  normalizeRideItem(item: ListingCardItem): any {
    const user = this.userStore.user();
    return {
      id: item.id,
      fromLine1: item.fromLine1 || item.city,
      toLine1: item.toLine1 || 'Destination',
      departureDate: item.departureDate || new Date().toLocaleDateString(),
      departureTime: item.departureTime || '10:00 AM',
      priceNum: item.priceNum || 0,
      seatsAvailable: item.seatsAvailable || 1,
      rating: item.rating || 0,
      driver: item.driver || {
        name: user?.name || 'You',
        avatar: user?.photoUrl,
        verified: user?.emailVerified || false
      }
    };
  }

  onCardClick(item: ListingCardItem) {
    // Navigate to detail page or open edit modal
    console.log('Card clicked:', item);
  }
}
