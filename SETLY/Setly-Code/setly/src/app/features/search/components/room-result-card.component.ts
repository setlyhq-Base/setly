import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium hover-lift cursor-pointer group" (click)="onClick()">
      <div class="relative">
        <img [src]="item.image || '/assets/placeholder-room.jpg'" [alt]="item.title" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">

        <!-- price badge -->
        <div class="absolute top-3 right-3">
          <span class="price-badge" *ngIf="item.price">{{ item.price }}</span>
        </div>

        <!-- subtle overlay for text -->
        <div class="absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/45 via-black/18 to-transparent text-white">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold leading-tight group-hover:text-indigo-100">{{ item.title }}</h3>
              <div class="flex items-center gap-2 text-xs text-white/85">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/></svg>
                <span class="truncate">{{ item.location }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="host-avatar w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">{{ (item.host || 'S')[0] }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-3 pt-4 bg-white/0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M3 7h18M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7"/></svg>
            <span class="text-sm text-gray-800">{{ item.host || 'Setly Host' }}</span>
          </div>
          <button class="connect-small inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition" (click)="onConnect($event)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8a6 6 0 01-12 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .price-badge { display:inline-flex; align-items:center; justify-content:center; padding:8px 10px; border-radius:9999px; font-weight:700; background:linear-gradient(90deg,#ffffffee,#f8fafcaa); color:#0f172a; box-shadow:0 6px 18px -8px rgba(15,23,42,0.2); font-size:13px; }
    .host-avatar { box-shadow:0 6px 18px -10px rgba(15,23,42,0.2); }
    .connect-small { background:transparent; border-radius:8px; padding:6px; }
    .card-premium img { border-top-left-radius: 12px; border-top-right-radius: 12px; }
    `
  ]
})
export class RoomResultCardComponent {
  @Input() item: any;
  constructor(private router: Router) {}
  onClick() {
    if (this.item?.id) {
      this.router.navigate(['/listing', this.item.id]);
    }
  }
  onConnect(e: Event){ e.stopPropagation(); }
}
