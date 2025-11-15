import { Component, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unified-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="search-wrap">
      <!-- Tabs -->
      <nav class="tabs" role="tablist" aria-label="Search modes">
        <button role="tab" [attr.aria-selected]="active() === 'rooms'" class="tab" [class.active]="active() === 'rooms'" (click)="setTab('rooms')">Rooms</button>
        <button role="tab" [attr.aria-selected]="active() === 'rides'" class="tab" [class.active]="active() === 'rides'" (click)="setTab('rides')">Rides</button>
        <button role="tab" [attr.aria-selected]="active() === 'market'" class="tab" [class.active]="active() === 'market'" (click)="setTab('market')">Marketplace</button>
      </nav>

      <!-- Card -->
      <div class="card" [attr.data-mode]="active()">
        <!-- Universal search field -->
        <div class="field-row">
          <label class="sr-only">Search</label>
          <input
            type="text"
            class="input main"
            [(ngModel)]="query"
            [placeholder]="placeholder()"
            (keyup.enter)="submit()"
            aria-label="Search"
          />
        </div>

        <!-- Tab-specific fields -->
        <div class="fields">
          <!-- Rooms -->
          <div *ngIf="active() === 'rooms'" class="fade-in grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="label">Check-in</label>
              <input type="date" class="input" [(ngModel)]="rooms.checkIn" />
            </div>
            <div>
              <label class="label">Check-out</label>
              <input type="date" class="input" [(ngModel)]="rooms.checkOut" />
            </div>
            <div>
              <label class="label">Room type</label>
              <div class="toggle">
                <button type="button" class="toggle-btn" [class.on]="rooms.type === 'shared'" (click)="rooms.type = 'shared'">Shared</button>
                <button type="button" class="toggle-btn" [class.on]="rooms.type === 'private'" (click)="rooms.type = 'private'">Private</button>
              </div>
            </div>
            <div class="flex items-end">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="rooms.studentVerified" />
                <span>Student-verified only</span>
              </label>
            </div>
          </div>

          <!-- Rides -->
          <div *ngIf="active() === 'rides'" class="fade-in grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="md:col-span-2">
              <label class="label">From</label>
              <input type="text" class="input" [(ngModel)]="rides.from" placeholder="Pickup location" />
            </div>
            <div class="md:col-span-2">
              <label class="label">To</label>
              <input type="text" class="input" [(ngModel)]="rides.to" placeholder="Destination" />
            </div>
            <div>
              <label class="label">Date</label>
              <input type="date" class="input" [(ngModel)]="rides.date" />
            </div>
            <div>
              <label class="label">Time</label>
              <input type="time" class="input" [(ngModel)]="rides.time" />
            </div>
            <div>
              <label class="label">Seats</label>
              <select class="input" [(ngModel)]="rides.seats">
                <option *ngFor="let s of [1,2,3,4]" [value]="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <!-- Marketplace -->
          <div *ngIf="active() === 'market'" class="fade-in grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="label">Category</label>
              <select class="input" [(ngModel)]="market.category">
                <option value="">All</option>
                <option>Books</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Tutoring</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="label">University/City</label>
              <input type="text" class="input" [(ngModel)]="market.place" placeholder="University or city" />
            </div>
            <div>
              <label class="label">Max price</label>
              <input type="number" class="input" min="0" [(ngModel)]="market.maxPrice" placeholder="USD" />
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-row">
          <button class="btn-cta" (click)="submit()">{{ ctaLabel() }}</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .search-wrap { max-width: 960px; margin: 0 auto; padding: 0 8px; }
    .tabs { display:flex; gap:14px; margin: 0 auto 18px; justify-content: center; }
    .tab { padding: 10px 22px; border-radius: 9999px; background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); color:#64748b; font-weight:600; font-size:14px; border:1px solid rgba(255,255,255,0.6); box-shadow:0 2px 8px rgba(0,0,0,0.04); transition: background .25s, color .25s, box-shadow .25s; }
    .tab:hover { background: rgba(255,255,255,0.85); color:#475569; box-shadow:0 4px 14px rgba(0,0,0,0.06); }
    .tab.active { background: linear-gradient(135deg,#eef2ff,#f5f3ff); color:#1e3a8a; box-shadow:0 4px 18px -3px rgba(0,0,0,0.08), 0 0 0 2px rgba(99,102,241,0.35); }
    .card { background:rgba(255,255,255,0.82); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 8px 40px -10px rgba(0,0,0,0.08); padding:22px 24px 26px; border:1px solid rgba(255,255,255,0.65); transition: box-shadow .3s; }
    .card:hover { box-shadow:0 12px 48px -12px rgba(0,0,0,0.12); }
    .field-row { margin-bottom: 14px; }
    .fields { margin-top: 10px; }
    .label { display:block; font-size: 11px; letter-spacing:.5px; color:#475569; margin-bottom:6px; font-weight:600; text-transform:uppercase; }
    .input { width:100%; border:1px solid #e2e8f0; border-radius:14px; padding:12px 14px; outline: none; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); font-size:14px; transition:border-color .2s, box-shadow .2s; }
    .input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.25); }
    .input.main { padding:16px 20px; border-radius:18px; font-size:15px; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
    .toggle { display:flex; gap:8px; }
    .toggle-btn { padding:8px 14px; border:1px solid #e2e8f0; border-radius:9999px; font-weight:600; color:#475569; background:rgba(255,255,255,0.85); backdrop-filter: blur(6px); font-size:13px; transition: all .25s; }
    .toggle-btn:hover { background:white; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
    .toggle-btn.on { border-color:#6366f1; color:#1e3a8a; background:#eef2ff; box-shadow:0 2px 10px rgba(99,102,241,0.25); }
    .checkbox { display:flex; gap:8px; align-items:center; font-size:13px; color:#475569; }
    .cta-row { margin-top: 18px; display:flex; justify-content:flex-end; }
    .btn-cta { background:#6366f1; color:white; border:none; border-radius:14px; padding:13px 26px; font-weight:600; font-size:15px; letter-spacing:.3px; box-shadow:0 6px 18px -4px rgba(99,102,241,0.45); transition: background .25s, box-shadow .25s; }
    .btn-cta:hover { background:#4f46e5; box-shadow:0 10px 26px -6px rgba(79,70,229,0.55); }
    @media (max-width: 768px) {
      .cta-row { justify-content:stretch; }
      .btn-cta { width:100%; }
    }
    .fade-in { animation: fade 240ms ease-in; }
    @keyframes fade { from { opacity: 0; transform: translateY(8px);} to { opacity:1; transform:none; } }
  `]
})
export class UnifiedSearchComponent {
  private router = inject(Router);

  active = signal<'rooms' | 'rides' | 'market'>('rooms');
  @Output() activeTabChange = new EventEmitter<'rooms' | 'rides' | 'market'>();
  @Output() performedSearch = new EventEmitter<{ mode: string; query?: string; params: any }>();
  query = '';

  rooms = { checkIn: '', checkOut: '', type: '' as 'shared'|'private'|'', studentVerified: false };
  rides = { from: '', to: '', date: '', time: '', seats: 1 };
  market = { category: '', place: '', maxPrice: 0 };

  setTab(t: 'rooms'|'rides'|'market'){ this.active.set(t); this.activeTabChange.emit(t); }
  placeholder = computed(() => this.active() === 'rooms'
    ? 'Search universities or cities…'
    : this.active() === 'rides'
      ? 'Where are you going?'
      : 'Search items, books, furniture…');
  ctaLabel = computed(() => this.active() === 'rooms' ? 'Search' : this.active() === 'rides' ? 'Find Rides' : 'Search Items');

  submit(){
    const mode = this.active();
    if (mode === 'rooms') {
      const params: any = { q: this.query || undefined, ci: this.rooms.checkIn || undefined, co: this.rooms.checkOut || undefined, type: this.rooms.type || undefined, sv: this.rooms.studentVerified ? '1' : undefined };
      this.performedSearch.emit({ mode, query: this.query, params });
    } else if (mode === 'rides') {
      const params: any = { from: this.rides.from, to: this.rides.to, date: this.rides.date, time: this.rides.time, seats: this.rides.seats };
      this.performedSearch.emit({ mode, query: this.query, params });
    } else {
      const params: any = { q: this.query || undefined, cat: this.market.category || undefined, place: this.market.place || undefined, max: this.market.maxPrice || undefined };
      this.performedSearch.emit({ mode, query: this.query, params });
    }
  }
}
