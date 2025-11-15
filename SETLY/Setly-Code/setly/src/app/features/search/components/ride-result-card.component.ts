import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ride-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium hover-lift group">
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ item.title }}</h3>
          <span class="text-sm font-medium text-indigo-600" *ngIf="item.price">{{ item.price }}</span>
        </div>
        <p class="text-sm text-gray-600 mb-3">{{ item.location }}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">{{ (item.driver || 'D')[0] }}</div>
            <div class="text-sm text-gray-700">{{ item.driver || 'Driver' }}</div>
          </div>
          <div *ngIf="item.badge" class="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-medium">{{ item.badge }}</div>
        </div>
      </div>
    </div>
  `
})
export class RideResultCardComponent { @Input() item: any; }
