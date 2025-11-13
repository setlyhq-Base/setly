import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelHistoryEntry } from '../../../core/models/profile.model';

@Component({
  selector: 'app-travel-history-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">Where I've Been</h2>
      </div>
      <div class="flex gap-4 overflow-x-auto no-scrollbar py-2">
        <div *ngFor="let item of history" class="min-w-[240px] bg-white border rounded-xl shadow-sm overflow-hidden">
          <div class="relative h-28 bg-gray-100">
            <img *ngIf="item.coverImage" [src]="item.coverImage" class="w-full h-full object-cover" />
            <div class="absolute top-2 left-2 chip bg-white/90">📍 {{ item.city }}, {{ item.state }}</div>
          </div>
          <div class="p-4 space-y-1">
            <div class="text-sm text-gray-600">🏫 {{ item.university || 'Nearby University' }}</div>
            <div class="text-sm text-gray-500">Stayed {{ item.startDate | date:'MMM y' }} – {{ item.endDate | date:'MMM y' }}</div>
          </div>
        </div>
        <div *ngIf="!history?.length" class="text-gray-500 px-2">No travel history yet.</div>
      </div>
    </section>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; }
    .card-header { @apply flex items-center justify-between mb-4; }
    .card-title { @apply text-lg font-semibold; }
    .chip { @apply px-2 py-1 rounded-full text-xs border; }
  `]
})
export class TravelHistoryCarouselComponent {
  @Input() history: TravelHistoryEntry[] = [];
}
