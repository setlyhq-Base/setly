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
          <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.5" d="M3 7h18M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7"/></svg>
          <span>Rooms</span>
        </button>
        <button role="tab" [attr.aria-selected]="active() === 'rides'" class="tab" [class.active]="active() === 'rides'" (click)="setTab('rides')">
          <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M3 13h2l2-4h8l2 4h2"/></svg>
          <span>Rides</span>
        </button>
        <button role="tab" [attr.aria-selected]="active() === 'market'" class="tab" [class.active]="active() === 'market'" (click)="setTab('market')">
          <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M3 6h18v2H3zM6 8v10h12V8"/></svg>
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
    .tab { display:inline-flex; align-items:center; gap:8px; padding: 8px 16px; border-radius: 9999px; background: rgba(255,255,255,0.78); backdrop-filter: blur(6px); color:#64748b; font-weight:700; font-size:13px; border:1px solid rgba(255,255,255,0.65); box-shadow:0 2px 8px rgba(0,0,0,0.04); transition: background .25s, color .25s, transform .18s; }
    .tab:hover { transform: translateY(-2px); background: rgba(255,255,255,0.9); color:#475569; }
    .tab.active { background: linear-gradient(135deg,#eef2ff,#f8f7ff); color:#1e3a8a; box-shadow:0 6px 20px -6px rgba(0,0,0,0.06); }
    .tab-icon { color: #475569; opacity:0.85; }
    .tab.active .tab-icon { color: #4338ca; }
    .tabs::after { content:''; position:absolute; left:50%; transform:translateX(-50%); bottom:-8px; height:3px; width:120px; background: linear-gradient(90deg,#c7d2fe, #eef2ff); border-radius:9999px; opacity:0.4; }
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
