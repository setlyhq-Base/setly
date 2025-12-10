import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-market-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-content">
      <!-- Header -->
      <div class="filter-header">
        <h3>Marketplace Filters</h3>
        <button (click)="resetFilters()" class="reset-btn">Reset</button>
      </div>

      <!-- Category -->
      <div class="filter-section">
        <label class="filter-label">Category</label>
        <div class="chip-group">
          <button 
            *ngFor="let cat of categories"
            (click)="toggleCategory(cat)"
            [class.active]="selectedCategories().includes(cat)"
            class="filter-chip"
          >
            {{ cat }}
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
              max="2000" 
              [(ngModel)]="minPrice"
              class="slider"
            />
            <input 
              type="range" 
              min="0" 
              max="2000" 
              [(ngModel)]="maxPrice"
              class="slider"
            />
          </div>
        </div>
      </div>

      <!-- Condition -->
      <div class="filter-section">
        <label class="filter-label">Condition</label>
        <div class="condition-grid">
          <button 
            *ngFor="let cond of conditions"
            (click)="selectCondition(cond)"
            [class.active]="selectedCondition === cond"
            class="condition-btn"
          >
            <div class="condition-icon">{{ getConditionIcon(cond) }}</div>
            <span class="condition-text">{{ cond }}</span>
          </button>
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
            [(ngModel)]="verifiedOnly"
            class="toggle-input"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">Verified Sellers Only</span>
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

    .condition-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .condition-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .condition-btn:hover {
      border-color: #6366F1;
      background: #F5F3FF;
    }

    .condition-btn.active {
      border-color: #6366F1;
      background: #6366F1;
      color: white;
    }

    .condition-icon {
      font-size: 32px;
    }

    .condition-text {
      font-size: 14px;
      font-weight: 500;
      color: #6B7280;
    }

    .condition-btn.active .condition-text {
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
export class MarketFiltersComponent {
  filtersApplied = output<any>();

  minPrice = 0;
  maxPrice = 2000;
  selectedCondition = '';
  maxDistance = 10;
  verifiedOnly = false;

  categories = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Sports', 'Other'];
  selectedCategories = signal<string[]>([]);

  conditions = ['New', 'Like New', 'Good', 'Fair'];

  toggleCategory(cat: string) {
    const current = this.selectedCategories();
    if (current.includes(cat)) {
      this.selectedCategories.set(current.filter(c => c !== cat));
    } else {
      this.selectedCategories.set([...current, cat]);
    }
  }

  selectCondition(cond: string) {
    this.selectedCondition = this.selectedCondition === cond ? '' : cond;
  }

  getConditionIcon(condition: string): string {
    const icons: Record<string, string> = {
      'New': '✨',
      'Like New': '⭐',
      'Good': '👍',
      'Fair': '👌'
    };
    return icons[condition] || '📦';
  }

  resetFilters() {
    this.minPrice = 0;
    this.maxPrice = 2000;
    this.selectedCondition = '';
    this.maxDistance = 10;
    this.verifiedOnly = false;
    this.selectedCategories.set([]);
  }

  applyFilters() {
    this.filtersApplied.emit({
      categories: this.selectedCategories(),
      priceRange: { min: this.minPrice, max: this.maxPrice },
      condition: this.selectedCondition,
      maxDistance: this.maxDistance,
      verifiedOnly: this.verifiedOnly
    });
  }
}
