import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-room-preview-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden" data-testid="assistant-room-card">
      <img [src]="displayPhoto || '/assets/placeholder-room.jpg'" [alt]="displayTitle" class="w-full h-28 object-cover">
      <div class="p-3">
        <div class="font-medium text-gray-900">{{displayTitle}}</div>
  <div class="text-sm text-gray-600">&dollar;{{ displayPrice }}/mo • {{ displayDistance }} km</div>
        <div class="flex gap-2 mt-3">
          <button class="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" (click)="onView()">View</button>
          <button class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200" (click)="onSave()">Save</button>
          <button class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200" (click)="onMessage()">Message host</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RoomPreviewCardComponent {
  @Input() room?: any; // Accept room object for assistant modal
  @Input() title!: string; @Input() price!: number; @Input() distanceKm!: number; @Input() photoUrl?: string; @Input() listingId!: string;
  
  constructor(private analytics: AnalyticsService) {}
  
  // Computed getters for room object or individual props
  get displayTitle() { return this.room?.title || this.title; }
  get displayPrice() { return this.room?.price || this.price; }
  get displayDistance() { return this.room?.distanceKm || this.distanceKm; }
  get displayPhoto() { return this.room?.photoUrl || this.photoUrl; }
  get displayId() { return this.room?.listingId || this.listingId; }
  
  onView(){ this.analytics.fire('assistant_card_interaction', { type:'room_view', id:this.displayId }); }
  onSave(){ this.analytics.fire('assistant_card_interaction', { type:'room_save', id:this.displayId }); }
  onMessage(){ this.analytics.fire('assistant_card_interaction', { type:'room_message', id:this.displayId }); }
}
