import { Component, EventEmitter, Output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectFiltersService } from '../../../core/services/connect-filters.service';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-connect-filters-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card-white p-3 space-y-4 shadow-lg hover-lift transition-shadow duration-300 filters-panel" [class.filters-apply]="flash" style="border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.04);">
  <div class="space-y-4">
    <!-- Trending Topics (hover to expand) -->
    <div class="filter-section" (mouseenter)="hoveredSection.set('trending')" (mouseleave)="hoveredSection.set(null)">
      <div class="section-title flex items-center gap-2 cursor-pointer hover-title">
        <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M10 3L7 21M17 3l-3 18M4 9h16M3 15h16" stroke="#727272" stroke-width="1.2" stroke-linecap="round"/></svg>
        Trending Topics
      </div>
      <div *ngIf="hoveredSection() === 'trending'" class="flex flex-wrap gap-2 mt-2 transition-all duration-300">
        <button type="button" class="chip" (click)="applyTopic('Housing')" data-hover="Show Housing options">#Housing</button>
        <button type="button" class="chip" (click)="applyTopic('StudyAbroad')" data-hover="Show StudyAbroad options">#StudyAbroad</button>
        <button type="button" class="chip" (click)="applyTopic('SetlyRide')" data-hover="Show SetlyRide options">#SetlyRide</button>
      </div>
    </div>
  <hr class="divider my-2">
    <!-- Search (hover to expand) -->
    <div class="filter-section" (mouseenter)="hoveredSection.set('search')" (mouseleave)="hoveredSection.set(null)">
      <div class="section-title flex items-center gap-2 cursor-pointer hover-title">
        <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#727272" stroke-width="1.2"/><path d="M21 21l-3.8-3.8" stroke="#727272" stroke-width="1.2" stroke-linecap="round"/></svg>
        Search
      </div>
      <div *ngIf="hoveredSection() === 'search'" class="mt-2 transition-all duration-300">
        <input [(ngModel)]="q" (ngModelChange)="emit()" type="text" class="mt-1 w-full border rounded-md px-2 py-1.5" placeholder="Search posts" aria-label="Search posts">
      </div>
    </div>
    <hr class="divider my-2">
    <!-- Location (hover to expand) -->
    <div class="filter-section" (mouseenter)="hoveredSection.set('location')" (mouseleave)="hoveredSection.set(null)">
      <div class="section-title flex items-center gap-2 cursor-pointer hover-title">
        <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#727272"/></svg>
        Location
      </div>
      <div *ngIf="hoveredSection() === 'location'" class="flex flex-wrap gap-2 mt-2 transition-all duration-300">
          <div class="mt-2">
            <label class="block">
              <span class="text-sm text-gray-700">Search city or area</span>
              <input [(ngModel)]="city" (ngModelChange)="emit()" type="text" list="city-suggest" class="mt-1 w-full border rounded-md px-2 py-1.5" placeholder="Search city, zip, area" aria-label="Search city">
              <datalist id="city-suggest">
                <option *ngFor="let c of citySuggestions" [value]="c"></option>
              </datalist>
            </label>
          </div>
        <button (click)="setCity('Boston')" type="button" class="chip flex items-center gap-1" [class.chip-selected]="city==='Boston'" aria-label="City Boston">
          <svg width="14" height="14" style="color:#727272;" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#727272"/></svg>
          <span>Boston</span>
        </button>
        <button (click)="setCity('NYC')" type="button" class="chip flex items-center gap-1" [class.chip-selected]="city==='NYC'" aria-label="City NYC">
          <svg width="14" height="14" style="color:#727272;" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#727272"/></svg>
          <span>NYC</span>
        </button>
        <button (click)="setCity('Austin')" type="button" class="chip flex items-center gap-1" [class.chip-selected]="city==='Austin'" aria-label="City Austin">
          <svg width="14" height="14" style="color:#727272;" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#727272"/></svg>
          <span>Austin</span>
        </button>
      </div>
    </div>
  <hr class="divider my-2">
    <!-- Social Filters (hover to expand) -->
    <div class="filter-section" (mouseenter)="hoveredSection.set('social')" (mouseleave)="hoveredSection.set(null)">
      <div class="section-title flex items-center gap-2 cursor-pointer hover-title">
        <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M16 14c2.21 0 4 1.79 4 4v2H4v-2c0-2.21 1.79-4 4-4m8 0h-8m8 0a4 4 0 10-8 0m8-6a3 3 0 11-6 0 3 3 0 016 0z" stroke="#727272" stroke-width="1.2"/></svg>
        Social Filters
      </div>
      <div *ngIf="hoveredSection() === 'social'" class="mt-2 transition-all duration-300">
        <div class="flex flex-wrap gap-2 mb-3">
          <button type="button" (click)="toggleType('person')" class="chip" [class.chip-selected]="typeIncluded('person')" data-hover="Show People filters">People</button>
          <button type="button" (click)="toggleType('room')" class="chip" [class.chip-selected]="typeIncluded('room')" data-hover="Show Room filters">Rooms</button>
          <button type="button" (click)="toggleType('ride')" class="chip" [class.chip-selected]="typeIncluded('ride')" data-hover="Show Ride filters">Rides</button>
          <button type="button" (click)="toggleType('thread')" class="chip" [class.chip-selected]="typeIncluded('thread')" data-hover="Show Topics filters">Topics</button>
          <button type="button" (click)="toggleType('update')" class="chip" [class.chip-selected]="typeIncluded('update')" data-hover="Show Updates filters">Updates</button>
        </div>
        <label class="block">
          <span class="text-sm text-gray-700">University</span>
          <input [(ngModel)]="university" (ngModelChange)="emit()" type="text" list="uni-suggest" class="mt-1 w-full border rounded-md px-2 py-1.5" placeholder="University" aria-label="University">
          <datalist id="uni-suggest">
            <option *ngFor="let u of universitySuggestions" [value]="u"></option>
          </datalist>
        </label>
        <div class="text-sm text-gray-700 my-2">Interests</div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let tag of tags" (click)="toggleInterest(tag)" type="button"
                  class="chip"
                  [class.chip-selected]="interests().includes(tag)"
                  aria-pressed="{{interests().includes(tag)}}"
                  [attr.aria-label]="'Interest ' + tag">
            {{tag}}
          </button>
        </div>
        <div class="mt-3">
          <div class="text-sm text-gray-700 mb-1 flex items-center gap-2">
            <svg width="14" height="14" style="color:#727272;" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.2 3.4L16.5 8 13.2 9.2 12 12.5 10.8 9.2 7.5 8l3.3-1.6L12 3z" stroke="#727272" stroke-width="1.2"/></svg>
            AI Suggested Filters
          </div>
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let s of aiSuggestions" type="button" (click)="applySuggestion(s)" class="chip text-xs hover:bg-blue-50 focus-ring" [title]="s.tip">
              {{s.label}}
            </button>
          </div>
        </div>
      </div>
    </div>
  <hr class="divider my-2">
    <!-- Room Filters (hover to expand) -->
    <div class="filter-section" (mouseenter)="hoveredSection.set('room')" (mouseleave)="hoveredSection.set(null)">
      <div class="section-title flex items-center gap-2 cursor-pointer hover-title">
        <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#727272" stroke-width="1.2"/></svg>
        Room Filters
      </div>
      <div *ngIf="hoveredSection() === 'room'" class="mt-2 transition-all duration-300">
        <div class="text-sm text-gray-700 mb-2">Room Type</div>
        <div class="flex gap-2">
          <button (click)="toggleRoomType('shared')" class="chip" [class.chip-selected]="roomType==='shared'" aria-label="Shared room type" data-hover="Show Shared room options">Shared</button>
          <button (click)="toggleRoomType('private')" class="chip" [class.chip-selected]="roomType==='private'" aria-label="Private room type" data-hover="Show Private room options">Private</button>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <label class="block">
            <span class="text-sm text-gray-700" data-hover="Set minimum price">Min Price</span>
            <input [(ngModel)]="minPrice" (ngModelChange)="emit()" type="number" min="0" class="mt-1 w-full border rounded-md px-2 py-1.5" placeholder="0" aria-label="Minimum price" data-hover="Set minimum price">
          </label>
          <label class="block">
            <span class="text-sm text-gray-700" data-hover="Set maximum price">Max Price</span>
            <input [(ngModel)]="maxPrice" (ngModelChange)="emit()" type="number" min="0" class="mt-1 w-full border rounded-md px-2 py-1.5" placeholder="3000" aria-label="Maximum price" data-hover="Set maximum price">
          </label>
        </div>
      </div>
    </div>
    <hr class="divider my-3">

        <div class="flex items-center justify-between mt-1 gap-1">
          <button (click)="applyFilters()" class="apply-btn text-xs px-2 py-1" aria-label="Apply filters">Apply</button>
          <button (click)="close()" class="close-btn text-xs px-2 py-1" aria-label="Close filters">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collapsible-details[open] > div {
      max-height: 1000px;
      opacity: 1;
      transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
    }
    .collapsible-details > div {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
    }
    .filters-panel {
      border-radius: 20px !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.04) !important;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }
    .hover-title:hover {
      color: #635bff;
    }
    .chip {
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0.22rem 0.5rem;
      font-size: 0.85rem;
      background: #fff;
      color: #333;
      transition: box-shadow 0.2s, background 0.2s, transform 0.2s;
    }
    .chip-selected {
      background: #E8F4FF;
      border-color: #BBD9FF;
      color: #0F5FFF;
      box-shadow: 0 2px 8px rgba(62,143,255,0.12);
      transform: translateY(-2px);
    }
    .saved-filters-block {
      background: #F4F8FF;
      border-radius: 16px;
      padding: 16px;
    }
    .saved-chip {
      background: #E8F4FF;
      color: #0F5FFF;
      border-color: #BBD9FF;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .saved-chip:hover {
      background: #D9E8FF;
      color: #0F5FFF;
    }
    .manage-link {
      margin-top: 4px;
      display: inline-block;
    }
    .divider {
      border-top: 1px solid rgba(0,0,0,0.06);
      margin: 8px 0;
    }
    .verified-row {
      background: #f8f8fa;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .verified-toggle {
      min-width: 56px;
      font-weight: 600;
      color: #0F5FFF;
      background: #E8F4FF;
      border-color: #BBD9FF;
      box-shadow: 0 2px 8px rgba(62,143,255,0.12);
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    }
    .apply-btn {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 9999px;
      background: var(--brand-gradient);
      color: #fff;
      box-shadow: 0 4px 16px rgba(15,95,255,0.18);
      border: none;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 36px;
    }
    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(15,95,255,0.24);
    }
    .close-btn {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: 9999px;
      background: #f8f8fa;
      color: #727272;
      border: 1px solid #e5e7eb;
      box-shadow: none;
      transition: background 0.2s, color 0.2s;
      height: 36px;
    }
    .close-btn:hover {
      background: #edeaff;
      color: #635bff;
    }
    .reset-btn {
      padding: 0.25rem 0.75rem;
      font-size: 0.92rem;
      border-radius: 8px;
      background: #f8f8fa;
      color: #727272;
      border: 1px solid #e5e7eb;
      box-shadow: none;
      transition: background 0.2s, color 0.2s;
    }
    .reset-btn:hover {
      background: #edeaff;
      color: #635bff;
    }
  `]
})
export class ConnectFiltersPanelComponent {
  private filtersSvc = inject(ConnectFiltersService);
  private feedSvc = inject(ConnectFeedService);
  private toast = inject(ToastService);

  @Output() filtersChanged = new EventEmitter<any>();
  @Output() closeRequested = new EventEmitter<void>();

  tags = ['Gym', 'Music', 'Coffee', 'Study', 'Tech'];
  citySuggestions = ['Boston','NYC','Austin','Chicago','San Francisco'];
  universitySuggestions = ['Harvard','MIT','Stanford','UCLA','UT Austin'];

  // local model bound to inputs
  q = '';
  city = '';
  university = '';
  verifiedOnly = false;
  interests = signal<string[]>([]);
  roomType: 'shared' | 'private' | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  loading = this.feedSvc.loading;
  count = signal(0);
  includeTypes = signal<Array<'person'|'room'|'ride'|'thread'|'update'>>([]);
  // Also allow 'update' type in includeTypes UI model
  // Note: persisted via filters service as includeTypes: ('person'|'room'|'ride'|'thread'|'event'|'update')[]
  activeCount = signal(0);
  private toastTimer: any;
  flash = false;
  aiSuggestions: { label: string; tip: string; patch: any }[] = [];

  hoveredSection = signal<string | null>(null);

  constructor() {
    // hydrate from service
    effect(() => {
      const f = this.filtersSvc.filters()();
      this.q = f.q || '';
      this.city = f.city || '';
      this.university = f.universityId || '';
      this.verifiedOnly = !!f.verifiedOnly;
      this.roomType = f.roomType;
      this.minPrice = f.minPrice;
      this.maxPrice = f.maxPrice;
      this.interests.set([...(f.interests || [])]);
  this.includeTypes.set([...(f.includeTypes as any || [])]);
      // live count from feed service
  this.count.set(this.feedSvc.feed().posts.length);
      // compute active filters
      let active = 0;
      if (this.q?.trim()) active++;
      if (this.city) active++;
      if (this.university) active++;
      if (this.verifiedOnly) active++;
      if (this.roomType) active++;
      if (typeof this.minPrice === 'number') active++;
      if (typeof this.maxPrice === 'number') active++;
      if (this.interests().length) active++;
      if (this.includeTypes().length) active++;
      this.activeCount.set(active);

      // Build AI suggestions from current context
      const suggestions: { label: string; tip: string; patch: any }[] = [];
      if (this.city && !this.verifiedOnly) {
        suggestions.push({ label: `Verified near ${this.city}`, tip: 'Show verified results near your city', patch: { verifiedOnly: true } });
      }
      if (!this.city && f.universityId) {
        suggestions.push({ label: 'Nearby rooms', tip: 'Rooms near your university', patch: { includeTypes: ['room'] } });
      }
      if (!this.includeTypes().length) {
        suggestions.push({ label: 'People + Rooms', tip: 'Focus on people and rooms', patch: { includeTypes: ['person','room'] } });
      }
      this.aiSuggestions = suggestions;
    });
  }

  toggleInterest(tag: string) {
    const set = new Set(this.interests());
    if (set.has(tag)) set.delete(tag); else set.add(tag);
    this.interests.set([...set]);
    this.emit();
  }

  emit() {
    this.filtersChanged.emit({ q: this.q || undefined, city: this.city || undefined, universityId: this.university || undefined, interests: this.interests(), verifiedOnly: this.verifiedOnly, roomType: this.roomType, minPrice: this.minPrice, maxPrice: this.maxPrice, includeTypes: this.includeTypes() });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.info('Filters updated', 1500), 300);
    this.flash = true; setTimeout(() => this.flash = false, 220);
  }
  onClear() {
    this.q = '';
    this.city = '';
    this.university = '';
    this.verifiedOnly = false;
    this.interests.set([]);
    this.roomType = undefined;
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.emit();
  }
  close(){ this.closeRequested.emit(); }

  setCity(c: string){ this.city = c; this.emit(); }

  toggleRoomType(type: 'shared' | 'private') {
    this.roomType = this.roomType === type ? undefined : type;
    this.emit();
  }
  onReset(){ this.filtersSvc.resetToPrevious(); }

  toggleType(type: 'person'|'room'|'ride'|'thread'|'update'){
    const set = new Set(this.includeTypes());
    if (set.has(type)) set.delete(type); else set.add(type);
    this.includeTypes.set([...set]);
    this.emit();
  }
  typeIncluded(type: 'person'|'room'|'ride'|'thread'|'update'){ return this.includeTypes().includes(type as any); }
  toggleVerified(){ this.verifiedOnly = !this.verifiedOnly; this.emit(); }

  applySuggestion(s: { label: string; tip: string; patch: any }){
    this.filtersChanged.emit({ ...s.patch });
    this.toast.success(`Applied: ${s.label}`);
  }
  applyTopic(topic: string){
    if (topic === 'SetlyRide') { this.toggleType('ride'); return; }
    if (topic === 'Housing') { this.toggleType('room'); return; }
    // StudyAbroad defaults to topics (threads/updates)
    this.toggleType('thread'); this.toggleType('update');
  }
  applyFilters() {
    this.emit();
    this.toast.success('Filters applied!');
  }
}
