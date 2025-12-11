import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ride-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-content">
      <!-- Header -->
      <div class="filter-header">
        <h3>Ride Filters</h3>
        <button (click)="resetFilters()" class="reset-btn">Reset</button>
      </div>

      <!-- Pickup Location -->
      <div class="filter-section">
        <label class="filter-label">Pickup Location</label>
        <input 
          type="text" 
          [(ngModel)]="pickupLocation"
          placeholder="Enter pickup location"
          class="location-input"
        />
      </div>

      <!-- Drop-off Location -->
      <div class="filter-section">
        <label class="filter-label">Drop-off Location</label>
        <input 
          type="text" 
          [(ngModel)]="dropoffLocation"
          placeholder="Enter drop-off location"
          class="location-input"
        />
      </div>

      <!-- Date -->
      <div class="filter-section">
        <label class="filter-label">Date</label>
        <input 
          type="date" 
          [(ngModel)]="rideDate"
          class="date-input"
        />
      </div>

      <!-- Time Range -->
      <div class="filter-section">
        <label class="filter-label">Time Range</label>
        <div class="time-range">
          <input 
            type="time" 
            [(ngModel)]="startTime"
            class="time-input"
          />
          <span class="time-separator">to</span>
          <input 
            type="time" 
            [(ngModel)]="endTime"
            class="time-input"
          />
        </div>
      </div>

      <!-- Ride Type -->
      <div class="filter-section">
        <label class="filter-label">Ride Type</label>
        <div class="ride-type-selector">
          <button 
            (click)="rideType = 'shared'"
            [class.active]="rideType === 'shared'"
            class="type-btn"
          >
            Shared
          </button>
          <button 
            (click)="rideType = 'solo'"
            [class.active]="rideType === 'solo'"
            class="type-btn"
          >
            Solo
          </button>
          <button 
            (click)="rideType = null"
            [class.active]="rideType === null"
            class="type-btn"
          >
            Any
          </button>
        </div>
      </div>

      <!-- Airport Only Toggle -->
      <div class="filter-section">
        <label class="toggle-row">
          <input 
            type="checkbox" 
            [(ngModel)]="airportOnly"
            class="toggle-input"
          />
          <span class="toggle-label">Airport rides only</span>
        </label>
      </div>

      <!-- Driver Online Now Toggle -->
      <div class="filter-section">
        <label class="toggle-row">
          <input 
            type="checkbox" 
            [(ngModel)]="onlineDriversOnly"
            class="toggle-input"
          />
          <span class="toggle-label">Driver online now</span>
        </label>
      </div>

      <!-- Apply Button -->
      <button (click)="applyFilters()" class="apply-btn">
        Apply Filters
      </button>
    </div>
  `,
  styles: [`
    .filter-content {
      padding: 20px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E5E7EB;
    }

    .filter-header h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .reset-btn {
      color: #3E8FFF;
      font-size: 14px;
      font-weight: 600;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .reset-btn:hover {
      background: #F3F4F6;
    }

    .filter-section {
      margin-bottom: 24px;
    }

    .filter-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
    }

    .location-input,
    .date-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.2s;
    }

    .location-input:focus,
    .date-input:focus {
      outline: none;
      border-color: #3E8FFF;
      background: #F9FAFB;
    }

    .time-range {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .time-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.2s;
    }

    .time-input:focus {
      outline: none;
      border-color: #3E8FFF;
      background: #F9FAFB;
    }

    .time-separator {
      font-size: 14px;
      color: #6B7280;
      font-weight: 500;
    }

    .ride-type-selector {
      display: flex;
      gap: 12px;
    }

    .type-btn {
      flex: 1;
      padding: 12px 20px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      background: white;
      font-size: 15px;
      font-weight: 600;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-btn:hover {
      border-color: #3E8FFF;
      color: #3E8FFF;
    }

    .type-btn.active {
      border-color: #3E8FFF;
      background: #3E8FFF;
      color: white;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 12px 0;
    }

    .toggle-input {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #3E8FFF;
    }

    .toggle-label {
      font-size: 15px;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
    }

    .apply-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #3E8FFF 0%, #5EA3FF 100%);
      color: white;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.3);
      margin-top: 16px;
    }

    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(62, 143, 255, 0.4);
    }

    .apply-btn:active {
      transform: translateY(0);
    }
  `]
})
export class RideFiltersComponent {
  filtersApplied = output<any>();

  // Filter state
  pickupLocation = '';
  dropoffLocation = '';
  rideDate = '';
  startTime = '';
  endTime = '';
  rideType: 'shared' | 'solo' | null = null;
  airportOnly = false;
  onlineDriversOnly = false;

  applyFilters() {
    this.filtersApplied.emit({
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      rideDate: this.rideDate,
      startTime: this.startTime,
      endTime: this.endTime,
      rideType: this.rideType,
      airportOnly: this.airportOnly,
      onlineDriversOnly: this.onlineDriversOnly
    });
  }

  resetFilters() {
    this.pickupLocation = '';
    this.dropoffLocation = '';
    this.rideDate = '';
    this.startTime = '';
    this.endTime = '';
    this.rideType = null;
    this.airportOnly = false;
    this.onlineDriversOnly = false;
  }
}
