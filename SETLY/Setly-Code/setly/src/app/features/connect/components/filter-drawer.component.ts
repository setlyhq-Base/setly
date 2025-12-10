import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomFiltersComponent } from '../../search/components/room-filters.component';
import { RideFiltersComponent } from '../../search/components/ride-filters.component';
import { MarketFiltersComponent } from '../../search/components/market-filters.component';

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomFiltersComponent, RideFiltersComponent, MarketFiltersComponent],
  template: `
    <!-- Overlay -->
    <div 
      *ngIf="isOpen()"
      class="drawer-overlay"
      (click)="close()">
    </div>

    <!-- Drawer -->
    <div 
      class="filter-drawer"
      [class.open]="isOpen()">
      
      <!-- Handle -->
      <div class="drawer-handle-area" (click)="close()">
        <div class="drawer-handle"></div>
      </div>

      <!-- Header -->
      <div class="drawer-header">
        <h2 class="drawer-title">Filters</h2>
        <button 
          (click)="close()"
          class="close-btn"
          aria-label="Close filters">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Dynamic Filter Content Based on Active Tab -->
      <div class="drawer-content">
        <app-room-filters 
          *ngIf="activeTab === 'rooms'"
          (filtersApplied)="onFiltersApplied($event)"
        />
        
        <app-ride-filters 
          *ngIf="activeTab === 'rides'"
          (filtersApplied)="onFiltersApplied($event)"
        />
        
        <app-market-filters 
          *ngIf="activeTab === 'market'"
          (filtersApplied)="onFiltersApplied($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 26, 63, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .filter-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 85vh;
      background: white;
      border-radius: 24px 24px 0 0;
      z-index: 1000;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 -12px 48px -12px rgba(10, 26, 63, 0.25);
      display: flex;
      flex-direction: column;
    }

    .filter-drawer.open {
      transform: translateY(0);
    }

    .drawer-handle-area {
      padding: 12px 0 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
    }

    .drawer-handle {
      width: 40px;
      height: 5px;
      background: #D1D5DB;
      border-radius: 999px;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px 16px;
      border-bottom: 1px solid #F3F4F6;
    }

    .drawer-title {
      font-size: 20px;
      font-weight: 700;
      color: #0A1A3F;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #F3F4F6;
      color: #6F7785;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #E5E7EB;
      color: #0A1A3F;
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  `]
})
export class FilterDrawerComponent {
  @Input() isOpen = signal(false);
  @Input() activeTab: 'rooms' | 'rides' | 'market' = 'rooms';
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  onFiltersApplied(filters: any) {
    this.filtersChanged.emit(filters);
    this.close();
  }

  close() {
    this.closed.emit();
  }
}
