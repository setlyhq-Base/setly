import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoomCard } from '../../core/models/room-card.model';
import { CurrencyCompactPipe } from '../pipes/currency-compact.pipe';

@Component({
  selector: 'app-room-card',
  imports: [CommonModule, CurrencyCompactPipe],
  template: `
    <article data-testid="room-card"
      class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
      (click)="navigateToDetail()"
      role="button"
      tabindex="0"
      (keydown.enter)="navigateToDetail()"
      (keydown.space)="$event.preventDefault(); navigateToDetail()"
      [attr.aria-label]="'View details for ' + room.title"
    >
      <!-- Image -->
      <div class="relative aspect-[4/3] overflow-hidden">
        <img
          [src]="room.image"
          [alt]="room.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" decoding="async" fetchpriority="low"
          (load)="onImgLoad()"
          [class.img-loading]="imgLoading"
        >
        <div class="absolute top-3 right-3">
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            [class]="room.isAvailable
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'"
          >
            {{ room.isAvailable ? 'Available' : 'Unavailable' }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg text-gray-900 group-hover:text-brand-blue transition-colors line-clamp-2">
            {{ room.title }}
          </h3>
          <span class="text-brand-blue font-bold text-lg ml-2 flex-shrink-0">
            {{ room.price | currencyCompact }}
          </span>
        </div>

        <p class="text-gray-600 text-sm mb-2">{{ room.address }}</p>
        <p class="text-gray-500 text-sm mb-3">{{ room.distance }}</p>

        <!-- Features -->
        <div class="flex flex-wrap gap-1 mb-3">
          <span
            *ngFor="let feature of room.features"
            class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
          >
            {{ feature }}
          </span>
        </div>

        <!-- CTA -->
        <div class="flex items-center justify-between">
          <span class="text-brand-blue font-medium text-sm group-hover:underline">
            View Details →
          </span>
          <svg class="w-4 h-4 text-brand-blue group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class RoomCardComponent {
  @Input({ required: true }) room!: RoomCard;
  imgLoading = true;

  constructor(private router: Router) {}

  navigateToDetail(): void {
    this.router.navigate(['/listing', this.room.id]);
  }

  onImgLoad(): void {
    this.imgLoading = false;
  }
}
