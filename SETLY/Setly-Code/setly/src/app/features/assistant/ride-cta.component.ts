import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-ride-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-gray-200 bg-white shadow-sm p-3">
      <div class="font-medium text-gray-900 mb-1">Need a ride?</div>
      <div class="text-sm text-gray-600 mb-3">Pickup: {{displayPickup}} → Dropoff: {{displayDropoff}}</div>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" (click)="requestSetly()">Request SetlyRide</button>
        <a class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200" [href]="uberLink()" target="_blank" rel="noopener">Open Uber</a>
      </div>
    </div>
  `,
  styles: []
})
export class RideCtaComponent {
  @Input() ride?: any; // Accept ride object for assistant modal
  @Input() pickup!: string; @Input() dropoff!: string;
  
  constructor(private analytics: AnalyticsService) {}
  
  // Computed getters for ride object or individual props
  get displayPickup() { return this.ride?.pickup || this.pickup; }
  get displayDropoff() { return this.ride?.dropoff || this.dropoff; }
  
  requestSetly(){ this.analytics.fire('assistant_card_interaction', { type:'ride_request', pickup:this.displayPickup, dropoff:this.displayDropoff }); }
  uberLink(){
    // Minimal deep link
    return `https://m.uber.com/`;
  }
}
