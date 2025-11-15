import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium hover-lift group">
      <div class="relative">
        <img [src]="item.image || '/assets/placeholder-room.jpg'" alt="" class="w-full h-44 object-cover rounded-t-2xl">
        <div class="absolute top-3 right-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm" *ngIf="item.price">{{ item.price }}</span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="font-medium text-base text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{{ item.title }}</h3>
        <p class="text-gray-600 text-sm">{{ item.location }}</p>
        <div *ngIf="item.badge" class="inline-block mt-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">{{ item.badge }}</div>
      </div>
    </div>
  `
})
export class MarketResultCardComponent { @Input() item: any; }
