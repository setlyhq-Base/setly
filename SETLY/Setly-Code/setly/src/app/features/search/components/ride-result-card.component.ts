import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ride-result-card',
  standalone: true,
  template: `
    <div class="card-premium ride-card-minimal cursor-pointer group" (click)="onClick()" tabindex="0" (keydown.enter)="onClick()" (keydown.space)="$event.preventDefault(); onClick()">
      <div class="relative p-5 pb-4">
        <!-- Driver avatar floating top-right -->
        <div class="absolute top-4 right-4 z-10">
          <img *ngIf="item.driver.avatar" [src]="item.driver.avatar" alt="{{item.driver.name}} avatar" class="w-12 h-12 rounded-full object-cover shadow" />
          <div *ngIf="!item.driver.avatar" class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold shadow">{{ item.driver.name[0] }}</div>
        </div>
        <!-- FROM block -->
        <div class="mb-3">
          <div class="flex items-center gap-1 mb-1">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/></svg>
            <span class="label-minimal">FROM</span>
          </div>
          <div class="address-minimal">{{ item.fromLine1 }}</div>
          <div class="address-minimal">{{ item.fromLine2 }}</div>
        </div>
        <!-- TO block -->
        <div class="mb-3">
          <div class="flex items-center gap-1 mb-1">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/></svg>
            <span class="label-minimal">TO</span>
          </div>
          <div class="address-minimal">{{ item.toLine1 }}</div>
          <div class="address-minimal">{{ item.toLine2 }}</div>
        </div>
        <!-- DATE & TIME -->
        <div class="mb-3">
          <div class="flex items-center gap-1 mb-1">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10"/></svg>
            <span class="label-minimal">DATE & TIME</span>
          </div>
          <div class="date-minimal">{{ item.departureDate }} · {{ item.departureTime }}</div>
        </div>
        <!-- DRIVER -->
        <div class="flex items-center gap-2 mt-2">
          <span class="label-minimal">DRIVER</span>
          <span class="driver-minimal">{{ item.driver.name }}</span>
          <span *ngIf="item.driver.verified" class="verified-badge-minimal">Verified</span>
          <span class="trust-minimal">Trust {{ item.driver.trustScore }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ride-card-minimal { border-radius: 18px; background: #fff; box-shadow: 0 6px 24px -8px rgba(17,24,39,0.08); border: 1px solid #f3f4f6; transition: box-shadow .22s, border-color .22s; }
    .ride-card-minimal:hover { box-shadow: 0 12px 32px -10px rgba(58,122,254,0.12); border-color: #3A7AFE; }
    .label-minimal { font-size: 0.72rem; text-transform: uppercase; font-weight: 600; color: #6B7280; letter-spacing: 0.04em; }
    .address-minimal { font-size: 1rem; color: #222; font-weight: 500; line-height: 1.3; }
    .date-minimal { font-size: 1rem; color: #222; font-weight: 500; }
    .driver-minimal { font-size: 1rem; color: #222; font-weight: 500; }
    .verified-badge-minimal { font-size: 0.75rem; color: #3A7AFE; background: #e0e7ff; border-radius: 8px; padding: 2px 8px; margin-left: 4px; font-weight: 600; }
    .trust-minimal { font-size: 0.75rem; color: #16A34A; background: #dcfce7; border-radius: 8px; padding: 2px 8px; margin-left: 4px; font-weight: 600; }
  `]
})
export class RideResultCardComponent {
  @Input() item: any;
  constructor(private router: Router) {}
  onClick() {
    if (this.item?.id) {
      this.router.navigate(['/listing', this.item.id]);
    }
  }
}
