import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreFormCardComponent } from '../explore/explore-form-card.component';

@Component({
  selector: 'app-unified-search',
  standalone: true,
  imports: [CommonModule, ExploreFormCardComponent],
  template: `
    <section class="search-wrap">
      <!-- Tabs -->
      <nav class="tabs" role="tablist" aria-label="Search modes">
        <button role="tab" [attr.aria-selected]="active() === 'rooms'" class="tab" [class.active]="active() === 'rooms'" (click)="setTab('rooms')">
          <!-- Home icon -->
          <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 10l9-7 9 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 21v-6h4v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Rooms</span>
        </button>
        <button role="tab" [attr.aria-selected]="active() === 'rides'" class="tab" [class.active]="active() === 'rides'" (click)="setTab('rides')">
          <!-- Car icon - clear side view -->
          <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7.5" cy="17" r="1.5" fill="currentColor"/>
            <circle cx="16.5" cy="17" r="1.5" fill="currentColor"/>
          </svg>
          <span>Rides</span>
        </button>
        <button role="tab" [attr.aria-selected]="active() === 'market'" class="tab" [class.active]="active() === 'market'" (click)="setTab('market')">
          <!-- Box icon -->
          <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 13V3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M3 8l9 5 9-5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span>Marketplace</span>
        </button>
      </nav>

      <app-explore-form-card
        [tab]="active()"
        (action)="handleAction($event)"></app-explore-form-card>
    </section>
  `,
  styles: [
    `
  .search-wrap { width: 100%; max-width: 1040px; margin: 0 auto; padding: 0 24px; }
    .tabs { display:flex; gap:12px; margin: 0 auto 14px; justify-content: center; align-items:center; position:relative; }
    .tab { 
      display:inline-flex; 
      align-items:center; 
      gap:8px; 
      padding: 8px 16px; 
      border-radius: 9999px; 
      background: #ffffff; 
      backdrop-filter: blur(6px); 
      color: #6F7785; 
      font-weight:600; 
      font-size:13px; 
      border:1px solid #ECECEC; 
      box-shadow:0 2px 8px rgba(10,26,63,0.04); 
      transition: all 0.15s ease, color 0.12s ease, border-color 0.12s ease; 
      cursor: pointer;
    }
    .tab:hover { 
      transform: translateY(-2px); 
      background: #ffffff; 
      color: #0A1A3F; 
      border-color: #3E8FFF;
      box-shadow:0 4px 12px rgba(62,143,255,0.12);
    }
    .tab.active { 
      background: #ffffff; 
      color: #0A1A3F; 
      border: 2px solid #3E8FFF;
      box-shadow:0 4px 16px rgba(62,143,255,0.16); 
      font-weight: 700;
    }
    .tab-icon { 
      color: #6F7785; 
      transition: color 0.12s ease, opacity 0.12s ease;
      flex-shrink: 0;
    }
    .tab:hover .tab-icon {
      color: #0A1A3F;
    }
    .tab.active .tab-icon { 
      color: #3E8FFF;
    }
    .tabs::after { 
      content:''; 
      position:absolute; 
      left:50%; 
      transform:translateX(-50%); 
      bottom:-8px; 
      height:2px; 
      width:120px; 
      background: linear-gradient(90deg, rgba(62,143,255,0.3), rgba(62,143,255,0.1)); 
      border-radius:9999px; 
    }
    @media (max-width: 768px) {
      .tabs { gap:8px; }
      .tab { padding:8px 12px; }
    }
    `
    ]
})
export class UnifiedSearchComponent {
  active = signal<'rooms' | 'rides' | 'market'>('rooms');
  @Output() activeTabChange = new EventEmitter<'rooms' | 'rides' | 'market'>();
  @Output() performedSearch = new EventEmitter<{ tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }>();

  setTab(t: 'rooms' | 'rides' | 'market') {
    if (this.active() === t) {
      return;
    }
    this.active.set(t);
    this.activeTabChange.emit(t);
  }

  handleAction(event: { tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }) {
    this.performedSearch.emit(event);
  }
}
