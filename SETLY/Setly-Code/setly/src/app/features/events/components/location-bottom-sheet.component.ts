import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bottom-sheet-overlay" (mousedown)="onOverlayClick($event)">
      <div class="bottom-sheet" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()">
        <div class="sheet-header">
          <h3 class="sheet-title">Select Location</h3>
          <button class="sheet-close" (click)="closed.emit()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="sheet-content">
          <!-- Current Location -->
          <button 
            class="location-option current-location"
            (click)="selectLocation('Current Location')">
            <div class="location-icon current">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="location-info">
              <span class="location-name">Use Current Location</span>
              <span class="location-detail">Enable location services</span>
            </div>
            <svg class="check-icon" *ngIf="selectedLocation === 'Current Location'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="divider">
            <span>Nearby Cities</span>
          </div>

          <!-- Nearby Cities -->
          <button 
            *ngFor="let city of nearbyCities()"
            class="location-option"
            [class.selected]="selectedLocation === city.name"
            (click)="selectLocation(city.name)">
            <div class="location-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="location-info">
              <span class="location-name">{{ city.name }}</span>
              <span class="location-detail">{{ city.distance }} away</span>
            </div>
            <svg class="check-icon" *ngIf="selectedLocation === city.name" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bottom-sheet-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: flex-end;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .bottom-sheet {
      width: 100%;
      max-height: 70vh;
      background: white;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #F3F4F6;
    }

    .sheet-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .sheet-close {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
      border: none;
      border-radius: 50%;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sheet-close:hover {
      background: #E5E7EB;
      color: #374151;
    }

    .sheet-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0 20px;
    }

    .location-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: white;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      text-align: left;
    }

    .location-option:hover {
      background: #F9FAFB;
    }

    .location-option.selected {
      background: #EFF6FF;
    }

    .location-option.current-location {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      margin: 8px 12px;
      border-radius: 12px;
    }

    .location-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      color: #3B82F6;
      flex-shrink: 0;
    }

    .location-icon.current {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
    }

    .location-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .location-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .location-detail {
      font-size: 13px;
      color: #6B7280;
    }

    .check-icon {
      color: #3B82F6;
      flex-shrink: 0;
    }

    .divider {
      padding: 16px 20px 8px;
      font-size: 13px;
      font-weight: 600;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})
export class LocationBottomSheetComponent {
  @Input() selectedLocation: string = 'Current Location';
  @Output() locationSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  nearbyCities = signal([
    { name: 'San Francisco', distance: '5 mi' },
    { name: 'Oakland', distance: '12 mi' },
    { name: 'Berkeley', distance: '8 mi' },
    { name: 'San Jose', distance: '45 mi' },
    { name: 'Palo Alto', distance: '28 mi' },
    { name: 'Santa Cruz', distance: '65 mi' }
  ]);

  selectLocation(location: string) {
    this.locationSelected.emit(location);
  }

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('bottom-sheet-overlay')) {
      event.preventDefault();
      event.stopPropagation();
      this.closed.emit();
    }
  }
}
