import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium hover-lift cursor-pointer group" (click)="onClick()">
      <div class="relative">
        <img [src]="item.image || '/assets/placeholder-room.jpg'" [alt]="item.title" class="w-full h-44 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300" loading="lazy">
        <div class="absolute top-3 right-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm" *ngIf="item.price">{{ item.price }}</span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="font-medium text-base text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{{ item.title }}</h3>
        <p class="text-gray-600 text-sm mb-3">{{ item.location }}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-semibold">{{ (item.host || 'S')[0] }}</span>
            </div>
            <span class="text-sm text-gray-700">{{ item.host || 'Setly Host' }}</span>
          </div>
          <button class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition" (click)="onConnect($event)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8a6 6 0 01-12 0"/></svg>
            Connect
          </button>
        </div>
      </div>
    </div>
  `
})
export class RoomResultCardComponent {
  @Input() item: any;
  onClick() {}
  onConnect(e: Event){ e.stopPropagation(); }
}
