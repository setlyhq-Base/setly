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
  <div class="card-white p-4 space-y-6 shadow-lg hover-lift transition-shadow duration-300 filters-panel" [class.filters-apply]="flash" style="border-radius:20px; box-shadow:0 8px 24px rgba(0,0,0,0.04);">
    <!-- Saved Filters Section -->
    <div class="saved-filters-block mb-1 p-1 rounded-xl" style="background:#f6f4ff;">
      <div class="flex items-center gap-2 mb-0">
        <svg width="16" height="16" style="color:#727272;" viewBox="0 0 24 24" fill="none"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm0 2h14v14H5V5zm7 2a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2V8a1 1 0 0 1 1-1z" fill="currentColor"/></svg>
        <h3 class="section-title text-sm">Saved filters</h3>
      </div>
      <div class="flex flex-wrap gap-1 mb-0">
        <button type="button" class="chip saved-chip text-xs px-2 py-1" *ngFor="let saved of savedFilters.slice(0,2)" (click)="applySavedFilter(saved)">{{saved.name}}</button>
      </div>
      <a href="#" class="view-all-link text-[10px] text-indigo-700 font-medium hover:underline mb-0 inline-block">View all ({{savedFilters.length}})</a>
    </div>
  <div class="flex items-center justify-between mb-0 mt-0 filters-header-row">
    <div class="flex items-center gap-2">
      <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" fill="currentColor"/></svg>
      <h3 class="section-title text-sm">Filters <span *ngIf="activeCount() > 0">({{activeCount()}})</span></h3>
      <button type="button" class="chip verified-pill ml-2 text-xs px-2 py-1" [class.chip-selected]="verifiedOnly" (click)="toggleVerified()" aria-pressed="{{verifiedOnly}}">
        <svg width="12" height="12" style="color:#635bff; margin-right:2px;" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#635bff" stroke-width="2" fill="none"/></svg>
        Verified only
      </button>
    </div>
    <div class="flex items-center gap-1 text-xs text-gray-600">
      <button (click)="onReset()" class="reset-link text-xs px-1" aria-label="Reset to previous filters">Reset</button>
      <span>|</span>
      <button (click)="onClear()" class="reset-link text-xs px-1" aria-label="Clear all filters">Clear</button>
    </div>
  </div>
  <hr class="divider my-1">
  <div class="space-y-6">
        <!-- Collapsible: Trending Topics -->
        <details open class="collapsible-details group">
          <summary class="section-title flex items-center gap-2 cursor-pointer hover-title">
            <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M10 3L7 21M17 3l-3 18M4 9h16M3 15h16" stroke="#727272" stroke-width="1.2" stroke-linecap="round"/></svg>
            Trending Topics
          </summary>
          <div class="flex flex-wrap gap-2 mt-2">
            <button type="button" class="chip" (click)="applyTopic('Housing')">#Housing</button>
            <button type="button" class="chip" (click)="applyTopic('StudyAbroad')">#StudyAbroad</button>
            <button type="button" class="chip" (click)="applyTopic('SetlyRide')">#SetlyRide</button>
          </div>
        </details>
        <hr class="divider my-3">

        <!-- Collapsible: Search -->
        <details class="collapsible-details group">
          <summary class="section-title flex items-center gap-2 cursor-pointer hover-title">
            <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#727272" stroke-width="1.2"/><path d="M21 21l-3.8-3.8" stroke="#727272" stroke-width="1.2" stroke-linecap="round"/></svg>
            Search
          </summary>
          <div class="mt-2">
            <input [(ngModel)]="q" (ngModelChange)="emit()" type="text" class="mt-1 w-full border rounded-md px-3 py-2" placeholder="Search posts" aria-label="Search posts">
          </div>
        </details>
        <hr class="divider my-3">

        <!-- Collapsible: Location -->
        <details class="collapsible-details group">
          <summary class="section-title flex items-center gap-2 cursor-pointer hover-title">
            <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#727272"/></svg>
            Location
          </summary>
          <div class="flex flex-wrap gap-2 mt-2">
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
        </details>
        <hr class="divider my-3">

          <!-- Search & Location Combined -->
          <div class="search-location-block">
            <div class="section-title flex items-center gap-2 mb-1">
              <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#727272" stroke-width="1.2"/><path d="M21 21l-3.8-3.8" stroke="#727272" stroke-width="1.2" stroke-linecap="round"/></svg>
              Search & location
            </div>
            <div class="mb-1">
              <input [(ngModel)]="q" (ngModelChange)="emit()" type="text" class="mt-1 w-full border rounded-md px-3 py-2" placeholder="Search posts" aria-label="Search posts">
            </div>
            <div class="flex flex-wrap gap-2 mt-1">
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
        <!-- Collapsible: Social filters -->
        <details class="collapsible-details group">
          <summary class="section-title flex items-center gap-2 cursor-pointer hover-title">
            <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><path d="M16 14c2.21 0 4 1.79 4 4v2H4v-2c0-2.21 1.79-4 4-4m8 0h-8m8 0a4 4 0 10-8 0m8-6a3 3 0 11-6 0 3 3 0 016 0z" stroke="#727272" stroke-width="1.2"/></svg>
            Social Filters
          </summary>
          <div class="mt-2">
            <div class="flex flex-wrap gap-2 mb-3">
              <button type="button" (click)="toggleType('person')" class="chip" [class.chip-selected]="typeIncluded('person')">People</button>
              <button type="button" (click)="toggleType('room')" class="chip" [class.chip-selected]="typeIncluded('room')">Rooms</button>
              <button type="button" (click)="toggleType('ride')" class="chip" [class.chip-selected]="typeIncluded('ride')">Rides</button>
              <button type="button" (click)="toggleType('thread')" class="chip" [class.chip-selected]="typeIncluded('thread')">Topics</button>
              <button type="button" (click)="toggleType('update')" class="chip" [class.chip-selected]="typeIncluded('update')">Updates</button>
            </div>
            <label class="block">
              <span class="text-sm text-gray-700">University</span>
              <input [(ngModel)]="university" (ngModelChange)="emit()" type="text" list="uni-suggest" class="mt-1 w-full border rounded-md px-3 py-2" placeholder="University" aria-label="University">
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
        </details>
        <hr class="divider my-3">

        <!-- Collapsible: Room filters -->
        <details open class="collapsible-details group">
          <summary class="section-title flex items-center gap-2 cursor-pointer hover-title">
            <svg width="16" height="16" style="color:#727272; margin-right:4px;" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#727272" stroke-width="1.2"/></svg>
            Room Filters
          </summary>
          <div class="mt-2">
            <div class="text-sm text-gray-700 mb-2">Room Type</div>
            <div class="flex gap-2">
              <button (click)="toggleRoomType('shared')" class="chip" [class.chip-selected]="roomType==='shared'" aria-label="Shared room type">Shared</button>
              <button (click)="toggleRoomType('private')" class="chip" [class.chip-selected]="roomType==='private'" aria-label="Private room type">Private</button>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-3">
              <label class="block">
                <span class="text-sm text-gray-700">Min Price</span>
                <input [(ngModel)]="minPrice" (ngModelChange)="emit()" type="number" min="0" class="mt-1 w-full border rounded-md px-3 py-2" placeholder="0" aria-label="Minimum price">
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">Max Price</span>
                <input [(ngModel)]="maxPrice" (ngModelChange)="emit()" type="number" min="0" class="mt-1 w-full border rounded-md px-3 py-2" placeholder="3000" aria-label="Maximum price">
              </label>
            </div>
          </div>
        </details>
        <hr class="divider my-3">

        <div class="flex items-center justify-between mt-1 gap-0">
          <button (click)="applyFilters()" class="apply-btn text-xs px-3 py-1" aria-label="Apply filters">Apply Filters</button>
          <button (click)="close()" class="close-btn text-xs px-3 py-1" aria-label="Close filters">Close</button>
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
      font-size: 1.15rem;
      font-weight: 600;
      color: #111;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }
    .hover-title:hover {
      color: #635bff;
    }
    .chip {
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0.25rem 0.625rem;
      font-size: 0.92rem;
      background: #fff;
      color: #333;
      transition: box-shadow 0.2s, background 0.2s, transform 0.2s;
    }
    .chip-selected {
      background: #EEF2FF;
      border-color: #C7D2FE;
      color: #635bff;
      box-shadow: 0 2px 8px rgba(99,91,255,0.08);
      transform: translateY(-2px);
    }
    .saved-filters-block {
      background: #f6f4ff;
      border-radius: 16px;
      padding: 16px;
    }
    .saved-chip {
      background: #edeaff;
      color: #635bff;
      border-color: #d1cfff;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .saved-chip:hover {
      background: #d1cfff;
      color: #4F46E5;
    }
    .manage-link {
      margin-top: 4px;
      display: inline-block;
    }
    .divider {
      border-top: 1px solid rgba(0,0,0,0.06);
      margin: 12px 0;
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
      color: #635bff;
      background: #eef2ff;
      border-color: #c7d2fe;
      box-shadow: 0 2px 8px rgba(99,91,255,0.08);
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    }
    .apply-btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 9999px;
      background: linear-gradient(90deg,#635bff 0%,#7b73ff 100%);
      color: #fff;
      box-shadow: 0 4px 16px rgba(99,91,255,0.10);
      border: none;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 48px;
    }
    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99,91,255,0.16);
    }
    .close-btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 9999px;
      background: #f8f8fa;
      color: #727272;
      border: 1px solid #e5e7eb;
      box-shadow: none;
      transition: background 0.2s, color 0.2s;
      height: 48px;
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

  savedFilters = [
    { name: 'Verified Boston', filter: { city: 'Boston', verifiedOnly: true } },
    { name: 'Private NYC', filter: { city: 'NYC', roomType: 'private' } },
    { name: 'Shared Austin', filter: { city: 'Austin', roomType: 'shared' } }
  ];

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
  applySavedFilter(saved: any) {
    this.q = saved.filter.q || '';
    this.city = saved.filter.city || '';
    this.university = saved.filter.universityId || '';
    this.verifiedOnly = !!saved.filter.verifiedOnly;
    this.roomType = saved.filter.roomType;
    this.minPrice = saved.filter.minPrice;
    this.maxPrice = saved.filter.maxPrice;
    this.interests.set([...(saved.filter.interests || [])]);
    this.includeTypes.set([...(saved.filter.includeTypes as any || [])]);
    this.emit();
  }
  applyFilters() {
    this.emit();
    this.toast.success('Filters applied!');
  }
}
