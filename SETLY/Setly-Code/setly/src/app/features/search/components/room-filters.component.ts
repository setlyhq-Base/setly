import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-content">
      <!-- Header -->
      <div class="filter-header">
        <h3>Room Filters</h3>
        <button (click)="resetFilters()" class="reset-btn">Reset</button>
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
              max="5000" 
              [(ngModel)]="minPrice"
              class="slider"
            />
            <input 
              type="range" 
              min="0" 
              max="5000" 
              [(ngModel)]="maxPrice"
              class="slider"
            />
          </div>
        </div>
      </div>

      <!-- Room Type -->
      <div class="filter-section">
        <label class="filter-label">Room Type</label>
        <div class="chip-group">
          <button 
            *ngFor="let type of roomTypes"
            (click)="toggleRoomType(type)"
            [class.active]="selectedRoomTypes().includes(type)"
            class="filter-chip"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Move-in Date -->
      <div class="filter-section">
        <label class="filter-label">Move-in Date</label>
        <input 
          type="date" 
          [(ngModel)]="moveInDate"
          class="date-input"
        />
      </div>

      <!-- Amenities -->
      <div class="filter-section">
        <label class="filter-label">Amenities</label>
        <div class="checkbox-group">
          <label 
            *ngFor="let amenity of amenities"
            class="checkbox-label"
          >
            <input 
              type="checkbox"
              [checked]="selectedAmenities().includes(amenity)"
              (change)="toggleAmenity(amenity)"
              class="checkbox-input"
            />
            <span class="checkbox-text">{{ amenity }}</span>
          </label>
        </div>
      </div>

      <!-- Distance -->
      <div class="filter-section">
        <label class="filter-label">Maximum Distance (miles)</label>
        <div class="distance-container">
          <input 
            type="range" 
            min="1" 
            max="50" 
            [(ngModel)]="maxDistance"
            class="slider"
          />
          <span class="distance-value">{{ maxDistance }} mi</span>
        </div>
      </div>

      <!-- Toggle Options -->
      <div class="filter-section">
        <label class="toggle-label">
          <input 
            type="checkbox"
            [(ngModel)]="furnished"
            class="toggle-input"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">Furnished</span>
        </label>

        <label class="toggle-label">
          <input 
            type="checkbox"
            [(ngModel)]="petsAllowed"
            class="toggle-input"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">Pets Allowed</span>
        </label>

        <label class="toggle-label">
          <input 
            type="checkbox"
            [(ngModel)]="verifiedOnly"
            class="toggle-input"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">Verified Only</span>
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

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .checkbox-input {
      width: 20px;
      height: 20px;
      border: 2px solid #E5E7EB;
      border-radius: 6px;
      cursor: pointer;
      accent-color: #6366F1;
    }

    .checkbox-text {
      font-size: 15px;
      color: #374151;
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
      border-bottom: 1px solid #F3F4F6;
    }

    .toggle-label:last-child {
      border-bottom: none;
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
export class RoomFiltersComponent {
  filtersApplied = output<any>();

  minPrice = 0;
  maxPrice = 5000;
  moveInDate = '';
  maxDistance = 10;
  furnished = false;
  petsAllowed = false;
  verifiedOnly = false;

  roomTypes = ['Single', 'Shared', 'Studio', 'Apartment'];
  selectedRoomTypes = signal<string[]>([]);

  amenities = ['WiFi', 'Parking', 'Laundry', 'Kitchen', 'AC', 'Heating'];
  selectedAmenities = signal<string[]>([]);

  toggleRoomType(type: string) {
    const current = this.selectedRoomTypes();
    if (current.includes(type)) {
      this.selectedRoomTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedRoomTypes.set([...current, type]);
    }
  }

  toggleAmenity(amenity: string) {
    const current = this.selectedAmenities();
    if (current.includes(amenity)) {
      this.selectedAmenities.set(current.filter(a => a !== amenity));
    } else {
      this.selectedAmenities.set([...current, amenity]);
    }
  }

  resetFilters() {
    this.minPrice = 0;
    this.maxPrice = 5000;
    this.moveInDate = '';
    this.maxDistance = 10;
    this.furnished = false;
    this.petsAllowed = false;
    this.verifiedOnly = false;
    this.selectedRoomTypes.set([]);
    this.selectedAmenities.set([]);
  }

  applyFilters() {
    this.filtersApplied.emit({
      priceRange: { min: this.minPrice, max: this.maxPrice },
      roomTypes: this.selectedRoomTypes(),
      moveInDate: this.moveInDate,
      amenities: this.selectedAmenities(),
      maxDistance: this.maxDistance,
      furnished: this.furnished,
      petsAllowed: this.petsAllowed,
      verifiedOnly: this.verifiedOnly
    });
  }
}
