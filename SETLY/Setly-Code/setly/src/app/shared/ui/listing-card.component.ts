import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Listing } from '../../core/models/listing.model';
import { CurrencyCompactPipe } from '../pipes/currency-compact.pipe';

@Component({
  selector: 'app-listing-card',
  imports: [CommonModule, RouterLink, CurrencyCompactPipe],
  template: `
    <article class="card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <!-- Photo -->
      <div class="aspect-video bg-gray-200 relative">
        <img
          *ngIf="listing.photos[0]"
          [src]="listing.photos[0]"
          [alt]="listing.title"
          class="w-full h-full object-cover"
        >
        <div *ngIf="!listing.photos[0]" class="w-full h-full bg-gray-300 flex items-center justify-center">
          <span class="text-gray-500">No photo</span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <h3 class="font-semibold text-lg text-gray-900 mb-1">{{ listing.title }}</h3>
  <p class="text-brand-primary font-bold text-xl mb-2">{{ listing.price | currencyCompact }}</p>
        <p class="text-gray-600 text-sm mb-3">{{ listing.address }}</p>

        <!-- Rules chips -->
        <div class="flex flex-wrap gap-2 mb-3">
          <span *ngIf="listing.rules.veg" class="chip bg-green-100 text-green-800">Vegetarian</span>
          <span *ngIf="!listing.rules.smoke" class="chip bg-blue-100 text-blue-800">No smoking</span>
          <span *ngIf="listing.rules.pets" class="chip bg-blue-50 text-blue-700 border border-blue-200">Pets ok</span>
          <span *ngIf="listing.roomType === 'private'" class="chip bg-gray-100 text-gray-800">Private room</span>
        </div>

        <!-- Distance placeholder -->
        <p class="text-gray-500 text-sm mb-4">• 0.8 mi to campus</p>

  <a [routerLink]="['/listing', listing.id]" class="text-brand-primary hover:text-brand-primary/80 font-medium">
          View Details →
        </a>
      </div>
    </article>
  `
})
export class ListingCardComponent {
  @Input({ required: true }) listing!: Listing;
}
