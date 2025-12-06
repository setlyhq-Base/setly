import { Component, EventEmitter, Output, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeocodingService, AddressSuggestion } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative" (keydown)="onKey($event)">
      <input type="text" [value]="query()" (input)="onInput($event)" (focus)="onFocus()" (blur)="onBlur()"
             [placeholder]="placeholder" class="input-premium" [disabled]="disabled" aria-disabled="{{disabled}}"
             role="combobox" aria-expanded="{{open()}}" aria-haspopup="listbox" [attr.aria-activedescendant]="activeId()" autocomplete="off" 
             [class.ring-blue-500]="open() && results().length > 0"
             [class.border-blue-300]="open() && results().length > 0" />
      
      <!-- City context indicator -->
      <div *ngIf="biasCity && biasState && !query()" class="text-xs text-blue-600 mt-1 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Searching in {{ biasCity }}, {{ biasState }}
      </div>
      
      <!-- Enhanced search results -->
      <ul *ngIf="open()" class="absolute z-40 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto mt-1 text-sm" role="listbox">
        <!-- Loading state with spinner -->
        <li *ngIf="loading()" class="px-3 py-3 text-gray-500 flex items-center gap-2">
          <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          Finding addresses...
        </li>
        
        <!-- Enhanced address results -->
        <li *ngFor="let s of results(); let i=index" 
            (mousedown)="choose(s)" 
            [id]="'addr-opt-'+i" 
            role="option" 
            class="px-3 py-2 cursor-pointer flex items-start gap-3 transition-colors duration-150 hover:bg-gray-50" 
            [class.bg-blue-50]="i===active()"
            [class.border-l-2]="i===active()"
            [class.border-blue-500]="i===active()">
          <!-- Address icon -->
          <div class="flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium text-gray-900 truncate text-sm" 
                    [title]="s.label" 
                    [innerHTML]="highlightMatch(s.label, query())"></span>
              <span *ngIf="badgeFor(s)" 
                    class="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {{ badgeFor(s) }}
              </span>
            </div>
            <div *ngIf="secondaryLine(s)" 
                 class="text-xs text-gray-500 truncate mt-0.5" 
                 [title]="secondaryLine(s)"
                 [innerHTML]="highlightMatch(secondaryLine(s), query())">
            </div>
            <!-- Distance indicator if coordinates available -->
            <div *ngIf="showDistance(s)" class="text-xs text-blue-600 mt-1">
              📍 {{ getDistanceText(s) }}
            </div>
          </div>
        </li>
        
        <!-- Enhanced empty state -->
        <li *ngIf="!loading() && results().length === 0" class="px-3 py-4 text-gray-500">
          <div class="text-center">
            <div class="text-sm">No addresses found</div>
            <div class="text-xs mt-1 text-gray-400">
              Try: "123 Main St" or enter a more complete address
            </div>
            <div *ngIf="biasCity" class="text-xs mt-1 text-blue-500">
              Searching in {{ biasCity }}{{biasState ? ', ' + biasState : ''}}
            </div>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class AddressAutocompleteComponent {
  @Input() initialAddress?: string;
  // Optional bias to improve relevance
  @Input() biasCity?: string;
  @Input() biasState?: string;
  @Input() biasLat?: number;
  @Input() biasLon?: number;
  // UX controls
  @Input() disabled = false;
  @Input() placeholder = 'Street address';
  @Output() picked = new EventEmitter<AddressSuggestion>();
  private geo = inject(GeocodingService);
  query = signal('');
  open = signal(false);
  results = signal<AddressSuggestion[]>([]);
  loading = signal(false);
  active = signal(-1);
  private debounceHandle: any;

  ngOnInit() { if (this.initialAddress) this.query.set(this.initialAddress); }

  onInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.query.set(v);
    this.open.set(true);
    this.active.set(-1);
    clearTimeout(this.debounceHandle);
    if (v.trim().length < 3) { 
      this.results.set([]); 
      this.loading.set(false); 
      return; 
    }
    this.loading.set(true);
    this.debounceHandle = setTimeout(() => {
      const opts = {
        city: this.biasCity,
        state: this.biasState,
        lat: this.biasLat,
        lon: this.biasLon
      };
      this.geo.addressLookup(v, opts).subscribe({
        next: (list) => {
          // Sort results by relevance
          const sorted = this.sortByRelevance(list, v);
          this.results.set(sorted);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }, 300);
  }

  private sortByRelevance(results: AddressSuggestion[], query: string): AddressSuggestion[] {
    const queryLower = query.toLowerCase();
    return results.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      
      // Exact matches get highest score
      if (a.label.toLowerCase().startsWith(queryLower)) aScore += 100;
      if (b.label.toLowerCase().startsWith(queryLower)) bScore += 100;
      
      // Contains query gets medium score
      if (a.label.toLowerCase().includes(queryLower)) aScore += 60;
      if (b.label.toLowerCase().includes(queryLower)) bScore += 60;
      
      // Prefer addresses with street numbers
      if (a.label.match(/^\d+\s/)) aScore += 50;
      if (b.label.match(/^\d+\s/)) bScore += 50;
      
      // Prefer Google Places results over Nominatim
      if (a.source === 'google_places') aScore += 30;
      if (b.source === 'google_places') bScore += 30;
      
      // City context bonus
      if (this.biasCity) {
        if (a.city.toLowerCase().includes(this.biasCity.toLowerCase())) aScore += 20;
        if (b.city.toLowerCase().includes(this.biasCity.toLowerCase())) bScore += 20;
      }
      
      return bScore - aScore;
    });
  }

  highlightMatch(text: string | null, query: string): string {
    if (!text || !query) return text || '';
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<strong class="text-blue-600 bg-blue-50 px-0.5 rounded">$1</strong>');
  }

  showDistance(s: AddressSuggestion): boolean {
    return !!(s.lat && s.lon && this.biasLat && this.biasLon);
  }

  getDistanceText(s: AddressSuggestion): string {
    if (!s.lat || !s.lon || !this.biasLat || !this.biasLon) return '';
    
    const distance = this.calculateDistance(this.biasLat, this.biasLon, s.lat, s.lon);
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${distance.toFixed(1)}km away`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
  onFocus() { this.open.set(true); if (this.query().trim().length >= 3) this.onInput({ target: { value: this.query() } } as any); }
  onBlur() { setTimeout(()=> this.open.set(false), 160); }
  choose(s: AddressSuggestion) {
    const display = s.address || s.label;
    this.query.set(display);
    this.open.set(false);
    this.picked.emit(s);
  }
  activeId(): string | null { return this.active()>=0 ? 'addr-opt-'+this.active() : null; }
  onKey(ev: KeyboardEvent) {
    if (!this.open()) return;
    const list = this.results();
    if (ev.key==='ArrowDown') { ev.preventDefault(); this.active.set(Math.min(this.active()+1, list.length-1)); }
    else if (ev.key==='ArrowUp') { ev.preventDefault(); this.active.set(Math.max(this.active()-1,0)); }
    else if (ev.key==='Enter') { if (this.active()>=0 && this.active()<list.length) { ev.preventDefault(); this.choose(list[this.active()]); } }
    else if (ev.key==='Escape') { this.open.set(false); }
  }

  badgeFor(s: AddressSuggestion): string | null {
    if (s.source === 'google_places') return 'Google';
    if (s.source === 'nominatim') return 'OpenStreetMap';
    return null;
  }

  secondaryLine(s: AddressSuggestion): string | null {
    if (s.description) return s.description;
    const parts = [s.city, s.state, s.postcode, s.country].filter(Boolean).join(', ');
    return parts || null;
  }
}
