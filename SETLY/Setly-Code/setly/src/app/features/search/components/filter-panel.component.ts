import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 bg-white/80 backdrop-blur-sm border border-white/60 shadow-[0_4px_18px_-2px_rgba(0,0,0,0.05)] rounded-2xl p-5">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h2>
        <div class="flex items-center gap-2">
          <button class="text-xs text-indigo-600 hover:underline" (click)="hide.emit()">Hide</button>
          <button *ngIf="showClose" class="text-xs text-gray-500 hover:text-gray-700" (click)="close.emit()">Close</button>
        </div>
      </div>

      <ng-container [ngSwitch]="activeTab">
        <!-- Rooms Filters -->
        <div *ngSwitchCase="'rooms'" class="space-y-6">
          <div>
            <label class="filter-label"><svg class="inline w-3 h-3 mr-2 align-middle text-indigo-500" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M12 3v18M5 7h14"/></svg>Price range</label>
            <input type="range" min="300" max="3000" [(ngModel)]="roomsFilters.price" class="w-full range-modern" />
            <div class="text-xs text-gray-500 mt-1">Up to \${{ roomsFilters.price }}/mo</div>
          </div>
          <div>
            <label class="filter-label"><svg class="inline w-3 h-3 mr-2 align-middle text-indigo-500" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/></svg>University / City</label>
            <input type="text" class="filter-input" [(ngModel)]="roomsFilters.place" placeholder="Boston University" />
          </div>
          <div>
            <label class="filter-label">Room type</label>
            <div class="flex gap-2 mt-1">
              <button type="button" class="pill" [class.on]="roomsFilters.type==='shared'" (click)="roomsFilters.type='shared'">Shared</button>
              <button type="button" class="pill" [class.on]="roomsFilters.type==='private'" (click)="roomsFilters.type='private'">Private</button>
            </div>
          </div>
          <div>
            <label class="filter-label">Property type</label>
            <select class="filter-input" [(ngModel)]="roomsFilters.property">
              <option value="">Any</option>
              <option>Dorm</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Shared house</option>
            </select>
          </div>
          <div>
            <label class="filter-label"><svg class="inline w-3 h-3 mr-2 align-middle text-indigo-500" viewBox="0 0 24 24" fill="none" aria-hidden><path stroke="currentColor" stroke-width="1.6" d="M5 12h14M12 5v14"/></svg>Amenities</label>
            <div class="flex flex-wrap gap-2 mt-1">
              <button *ngFor="let a of amenities" type="button" class="pill" [class.on]="roomsFilters.amenities.includes(a)" (click)="toggleAmenity(a)">{{ a }}</button>
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [(ngModel)]="roomsFilters.studentVerified" /> Student-verified only
          </label>
          <div>
            <label class="filter-label">Rating</label>
            <select class="filter-input" [(ngModel)]="roomsFilters.rating">
              <option value="">Any</option>
              <option>4★ & up</option>
              <option>3★ & up</option>
            </select>
          </div>
        </div>

        <!-- Rides Filters -->
        <div *ngSwitchCase="'rides'" class="space-y-6">
          <div>
            <label class="filter-label">From</label>
            <input type="text" class="filter-input" [(ngModel)]="ridesFilters.from" placeholder="Boston, MA" />
          </div>
          <div>
            <label class="filter-label">To</label>
            <input type="text" class="filter-input" [(ngModel)]="ridesFilters.to" placeholder="New York, NY" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="filter-label">Date</label>
              <input type="date" class="filter-input" [(ngModel)]="ridesFilters.date" />
            </div>
            <div>
              <label class="filter-label">Time</label>
              <input type="time" class="filter-input" [(ngModel)]="ridesFilters.time" />
            </div>
          </div>
          <div>
            <label class="filter-label">Price max</label>
            <input type="number" min="0" class="filter-input" [(ngModel)]="ridesFilters.priceMax" />
          </div>
          <div>
            <label class="filter-label">Seats needed</label>
            <select class="filter-input" [(ngModel)]="ridesFilters.seats">
              <option *ngFor="let s of [1,2,3,4,5]" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="filter-label">Driver rating</label>
            <select class="filter-input" [(ngModel)]="ridesFilters.rating">
              <option value="">Any</option>
              <option>4★ & up</option>
              <option>3★ & up</option>
            </select>
          </div>
        </div>

        <!-- Marketplace Filters -->
        <div *ngSwitchCase="'market'" class="space-y-6">
          <div>
            <label class="filter-label">Category</label>
            <select class="filter-input" [(ngModel)]="marketFilters.category">
              <option value="">All</option>
              <option>Books</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Tutoring</option>
            </select>
          </div>
          <div>
            <label class="filter-label">Max price</label>
            <input type="number" min="0" class="filter-input" [(ngModel)]="marketFilters.maxPrice" />
          </div>
          <div>
            <label class="filter-label">Condition</label>
            <select class="filter-input" [(ngModel)]="marketFilters.condition">
              <option value="">Any</option>
              <option>New</option>
              <option>Like new</option>
              <option>Used</option>
            </select>
          </div>
          <div>
            <label class="filter-label">Location / University</label>
            <input type="text" class="filter-input" [(ngModel)]="marketFilters.place" />
          </div>
          <div>
            <label class="filter-label">Seller type</label>
            <select class="filter-input" [(ngModel)]="marketFilters.seller">
              <option value="">Any</option>
              <option>Student</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .filter-label { @apply block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1; }
    .filter-input { @apply w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition; }
    .pill { @apply px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-white/90 backdrop-blur text-gray-700 shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition; }
    .pill.on { @apply border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_2px_10px_rgba(99,102,241,0.25)]; }
    .range-modern { -webkit-appearance:none; height:8px; border-radius:999px; background:linear-gradient(90deg,#eef2ff,#f3f4ff); outline:none; }
    .range-modern::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:999px; background:linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow:0 4px 12px rgba(99,102,241,0.28); margin-top:-5px; }
    .range-modern:focus { box-shadow:0 0 0 6px rgba(99,102,241,0.08); }
  `]
})
export class FilterPanelComponent {
  @Input() activeTab: 'rooms'|'rides'|'market' = 'rooms';
  @Input() roomsFilters: any;
  @Input() ridesFilters: any;
  @Input() marketFilters: any;
  @Input() amenities: string[] = [];
  @Input() showClose = false;
  @Output() hide = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  toggleAmenity(a: string){
    const i = this.roomsFilters.amenities.indexOf(a);
    if (i >= 0) this.roomsFilters.amenities.splice(i,1); else this.roomsFilters.amenities.push(a);
  }
}
