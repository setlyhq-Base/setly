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

      <!-- Date & Time -->
      <div class="filter-section">
        <label class="filter-label">Date</label>
        <input 
          type="date" 
          [(ngModel)]="rideDate"
          class="date-input"
        />
      </div>

      <div class="filter-section">
        <label class="filter-label">Time</label>
        <div class="time-slots">
          <button 
            *ngFor="let slot of timeSlots"
            (click)="selectTimeSlot(slot)"
            [class.active]="selectedTimeSlot === slot"
            class="time-slot-btn"
          >
            {{ slot }}
          </button>
        </div>
      </div>

      <!-- Price Range -->
      <div class="filter-section">
        <label class="filter-label">Price Range</label>
        <div class="price-range-container">
          <div class="price-inputs">
            <input 
              type="number" 
              [(ngModel)]="minPrice" 
              placeholder="Min"
              class="price-input"
            />
            <span class="price-separator">-</span>
            <input 
              type="number" 
              [(ngModel)]="maxPrice" 
              placeholder="Max"
              class="price-input"
            />
          </div>
          <div class="range-slider">
            <input 
              type="range" 
              min="0" 
              max="200" 
              [(ngModel)]="minPrice"
              class="slider"
            />
            <input 
              type="range" 
              min="0" 
              max="200" 
              [(ngModel)]="maxPrice"
              class="slider"
            />
          </div>
        </div>
      </div>

      <!-- Seats Available -->
      <div class="filter-section">
        <label class="filter-label">Seats Available</label>
        <div class="seats-selector">
          <button 
            *ngFor="let num of [1, 2, 3, 4]"
            (click)="seatsAvailable = num"
            [class.active]="seatsAvailable === num"
            class="seat-btn"
          >
            {{ num }}
          </button>
        </div>
      </div>

      <!-- Luggage -->
      <div class="filter-section">
        <label class="filter-label">Luggage Space</label>
        <div class="chip-group">
          <button 
            *ngFor="let option of luggageOptions"
            (click)="toggleLuggage(option)"
            [class.active]="selectedLuggage().includes(option)"
            class="filter-chip"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- Ride Type -->
      <div class="filter-section">
        <label class="filter-label">Ride Type</label>
        <div class="chip-group">
          <button 
            *ngFor="let type of rideTypes"
            (click)="toggleRideType(type)"
            [class.active]="selectedRideTypes().includes(type)"
            class="filter-chip"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Pickup Radius -->
      <div class="filter-section">
        <label class="filter-label">Pickup Radius (miles)</label>
        <div class="distance-container">
          <input 
            type="range" 
            min="1" 
            max="30" 
            [(ngModel)]="pickupRadius"
            class="slider"
          />
          <span class="distance-value">{{ pickupRadius }} mi</span>
        </div>
      </div>

      <!-- Toggle Options -->
      <div class="filter-section">
        <label class="toggle-label">
          <input 
            type="checkbox"
            [(ngModel)]="verifiedOnly"
            class="toggle-input"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">Verified Drivers Only</span>
        </label>
      </div>

      <!-- Apply Button -->
      <div class="filter-footer">
        <button (click)="applyFilters()" class="apply-btn">
          Apply Filters
        </button>
      </div>
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
      color: #6366F1;
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

    .date-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.2s;
    }

    .date-input:focus {
      outline: none;
      border-color: #6366F1;
      background: #F9FAFB;
    }

    .time-slots {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .time-slot-btn {
      padding: 12px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      background: white;
      color: #6B7280;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .time-slot-btn:hover {
      border-color: #6366F1;
      background: #F5F3FF;
    }

    .time-slot-btn.active {
      border-color: #6366F1;
      background: #6366F1;
      color: white;
    }

    .price-range-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .price-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.2s;
    }

    .price-input:focus {
      outline: none;
      border-color: #6366F1;
      background: #F9FAFB;
    }

    .price-separator {
      color: #9CA3AF;
      font-weight: 600;
    }

    .range-slider {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(to right, #E5E7EB 0%, #6366F1 100%);
      outline: none;
      -webkit-appearance: none;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #6366F1;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #6366F1;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    .seats-selector {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .seat-btn {
      padding: 14px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      background: white;
      color: #6B7280;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .seat-btn:hover {
      border-color: #6366F1;
      background: #F5F3FF;
    }

    .seat-btn.active {
      border-color: #6366F1;
      background: #6366F1;
      color: white;
    }

    .chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-chip {
      padding: 10px 20px;
      border: 2px solid #E5E7EB;
      border-radius: 24px;
      background: white;
      color: #6B7280;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-chip:hover {
      border-color: #6366F1;
      background: #F5F3FF;
    }

    .filter-chip.active {
      border-color: #6366F1;
      background: #6366F1;
      color: white;
    }

    .distance-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .distance-value {
      min-width: 60px;
      text-align: right;
      font-size: 15px;
      font-weight: 600;
      color: #6366F1;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 12px 0;
    }

    .toggle-input {
      display: none;
    }

    .toggle-slider {
      position: relative;
      width: 48px;
      height: 28px;
      background: #E5E7EB;
      border-radius: 14px;
      transition: background 0.3s;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: white;
      top: 3px;
      left: 3px;
      transition: transform 0.3s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toggle-input:checked + .toggle-slider {
      background: #6366F1;
    }

    .toggle-input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }

    .toggle-text {
      font-size: 15px;
      color: #374151;
      font-weight: 500;
    }

    .filter-footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
    }

    .apply-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
      color: white;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    .apply-btn:active {
      transform: translateY(0);
    }
  `]
})
export class RideFiltersComponent {
  filtersApplied = output<any>();

  rideDate = '';
  selectedTimeSlot = '';
  minPrice = 0;
  maxPrice = 200;
  seatsAvailable = 1;
  pickupRadius = 5;
  verifiedOnly = false;

  timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
  luggageOptions = ['Small', 'Medium', 'Large'];
  selectedLuggage = signal<string[]>([]);

  rideTypes = ['Airport', 'Local', 'Long-distance'];
  selectedRideTypes = signal<string[]>([]);

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot = this.selectedTimeSlot === slot ? '' : slot;
  }

  toggleLuggage(option: string) {
    const current = this.selectedLuggage();
    if (current.includes(option)) {
      this.selectedLuggage.set(current.filter(l => l !== option));
    } else {
      this.selectedLuggage.set([...current, option]);
    }
  }

  toggleRideType(type: string) {
    const current = this.selectedRideTypes();
    if (current.includes(type)) {
      this.selectedRideTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedRideTypes.set([...current, type]);
    }
  }

  resetFilters() {
    this.rideDate = '';
    this.selectedTimeSlot = '';
    this.minPrice = 0;
    this.maxPrice = 200;
    this.seatsAvailable = 1;
    this.pickupRadius = 5;
    this.verifiedOnly = false;
    this.selectedLuggage.set([]);
    this.selectedRideTypes.set([]);
  }

  applyFilters() {
    this.filtersApplied.emit({
      date: this.rideDate,
      timeSlot: this.selectedTimeSlot,
      priceRange: { min: this.minPrice, max: this.maxPrice },
      seatsAvailable: this.seatsAvailable,
      luggage: this.selectedLuggage(),
      rideTypes: this.selectedRideTypes(),
      pickupRadius: this.pickupRadius,
      verifiedOnly: this.verifiedOnly
    });
  }
}
