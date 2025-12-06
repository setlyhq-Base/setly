import { Component, EventEmitter, Output, Input, signal, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeocodingService, GeoSuggestion } from '../../core/services/geocoding.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative" (keydown)="onKey($event)">
      <input type="text" [value]="query()" (input)="onInput($event)" (focus)="onFocus()" (blur)="onBlur()" 
             [placeholder]="placeholder" class="input-premium" role="combobox" aria-expanded="{{open()}}" 
             aria-haspopup="listbox" [attr.aria-activedescendant]="activeId()" autocomplete="off" 
             [class.ring-blue-500]="open() && results().length > 0"
             [class.border-blue-300]="open() && results().length > 0" />
      
      <!-- Enhanced selection feedback -->
      <div *ngIf="selected() && !open()" class="text-xs text-green-600 mt-1 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Selected: {{ selected()?.label }}
      </div>
      
      <!-- Enhanced search results with better formatting -->
      <ul *ngIf="open()" class="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto mt-1 text-sm" role="listbox">
        <!-- Loading state with spinner -->
        <li *ngIf="loading()" class="px-3 py-3 text-gray-500 flex items-center gap-2">
          <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          Searching cities...
        </li>
        
        <!-- Enhanced search results -->
        <li *ngFor="let s of results(); let i=index" 
            (mousedown)="choose(s)" 
            [id]="'loc-opt-'+i" 
            role="option" 
            class="px-3 py-2 cursor-pointer flex flex-col gap-1 transition-colors duration-150" 
            [class.bg-blue-50]="i===active()"
            [class.border-l-2]="i===active()"
            [class.border-blue-500]="i===active()">
          <div class="flex items-center justify-between gap-3">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-medium text-gray-900 truncate" 
                    [innerHTML]="highlightMatch(s.label, query())"></span>
              <span class="text-xs text-gray-500 truncate" 
                    *ngIf="secondaryLine(s)" 
                    [innerHTML]="highlightMatch(secondaryLine(s), query())"></span>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span *ngIf="badgeFor(s)" 
                    class="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {{ badgeFor(s) }}
              </span>
              <!-- Show match quality indicator -->
              <div *ngIf="getMatchQuality(s, query()) > 0" 
                   class="flex items-center gap-1 text-xs text-gray-400">
                <div class="flex gap-0.5">
                  <div *ngFor="let dot of getMatchDots(s, query())" 
                       class="w-1.5 h-1.5 rounded-full"
                       [class.bg-green-400]="dot"
                       [class.bg-gray-200]="!dot"></div>
                </div>
              </div>
            </div>
          </div>
        </li>
        
        <!-- Empty state with suggestions -->
        <li *ngIf="!loading() && results().length===0" class="px-3 py-3 text-gray-500">
          <div class="text-center">
            <div class="text-sm">No cities found</div>
            <div class="text-xs mt-1 text-gray-400">
              Try: "Los Angeles", "New York", or check your spelling
            </div>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class LocationAutocompleteComponent implements OnInit, OnChanges {
  @Input() initialCity?: string;
  @Input() initialState?: string;
  @Input() placeholder = 'City or university';
  @Output() picked = new EventEmitter<GeoSuggestion>();
  private geo = inject(GeocodingService);
  query = signal('');
  open = signal(false);
  results = signal<GeoSuggestion[]>([]);
  loading = signal(false);
  selected = signal<GeoSuggestion | null>(null);
  active = signal(-1);
  private debounceHandle: any;

  ngOnInit() {
    if (this.initialCity || this.initialState) {
      const label = this.composeLabel(this.initialCity, this.initialState);
      this.query.set(label);
      this.selected.set({
        id: 'manual',
        label,
        city: this.initialCity || undefined,
        state: this.initialState || undefined,
        country: undefined,
        kind: 'city',
        source: 'open_meteo'
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // When parent updates initialCity/initialState (e.g., after picking an address), reflect it here
    if ((changes['initialCity'] && changes['initialCity'].currentValue !== undefined) ||
        (changes['initialState'] && changes['initialState'].currentValue !== undefined)) {
      const c = this.initialCity || '';
      const s = this.initialState || '';
      const label = this.composeLabel(c, s);
      if (label && this.query() !== label) this.query.set(label);
      if (c || s) {
        this.selected.set({
          id: 'manual',
          label,
          city: c || undefined,
          state: s || undefined,
          country: undefined,
          kind: 'city',
          source: 'open_meteo'
        });
      }
    }
  }

  onInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.query.set(v);
    this.open.set(true);
    this.active.set(-1);
    this.selected.set(null); // Clear selection when typing
    clearTimeout(this.debounceHandle);
    if (v.trim().length < 2) { 
      this.results.set([]); 
      this.loading.set(false); 
      return; 
    }
    this.loading.set(true);
    this.debounceHandle = setTimeout(() => {
      this.geo.search(v).subscribe({
        next: (list) => {
          // Sort results by relevance
          const sorted = this.sortByRelevance(list, v);
          this.results.set(sorted);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }, 250);
  }

  private sortByRelevance(results: GeoSuggestion[], query: string): GeoSuggestion[] {
    const queryLower = query.toLowerCase();
    return results.sort((a, b) => {
      const aScore = this.getMatchQuality(a, query);
      const bScore = this.getMatchQuality(b, query);
      return bScore - aScore;
    });
  }

  getMatchQuality(suggestion: GeoSuggestion, query: string): number {
    if (!query || !suggestion.label) return 0;
    
    const queryLower = query.toLowerCase();
    const labelLower = suggestion.label.toLowerCase();
    const cityLower = (suggestion.city || '').toLowerCase();
    
    let score = 0;
    
    // Exact matches get highest score
    if (labelLower === queryLower || cityLower === queryLower) score += 100;
    // Starts with gets high score
    else if (labelLower.startsWith(queryLower) || cityLower.startsWith(queryLower)) score += 80;
    // Contains gets medium score
    else if (labelLower.includes(queryLower) || cityLower.includes(queryLower)) score += 60;
    
    // Bonus for university matches if query looks academic
    if (suggestion.kind === 'university' && this.looksLikeUniversityQuery(query)) score += 20;
    
    // Bonus for exact word matches
    const words = queryLower.split(/\s+/);
    const labelWords = labelLower.split(/\s+/);
    const exactWordMatches = words.filter(w => labelWords.includes(w)).length;
    score += exactWordMatches * 10;
    
    return score;
  }

  getMatchDots(suggestion: GeoSuggestion, query: string): boolean[] {
    const quality = this.getMatchQuality(suggestion, query);
    const dots = [false, false, false];
    if (quality >= 60) dots[0] = true;
    if (quality >= 80) dots[1] = true;
    if (quality >= 100) dots[2] = true;
    return dots;
  }

  highlightMatch(text: string | null, query: string): string {
    if (!text || !query) return text || '';
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<strong class="text-blue-600 bg-blue-50 px-0.5 rounded">$1</strong>');
  }

  private looksLikeUniversityQuery(input: string): boolean {
    const q = input.toLowerCase();
    return /univ|college|school|institute|academy|polytech|campus/.test(q);
  }
  onFocus() { if (this.query().length >= 2) { this.open.set(true); this.onInput({ target: { value: this.query() } } as any); } else { this.open.set(true); } }
  onBlur() { setTimeout(()=> this.open.set(false), 150); }
  choose(s: GeoSuggestion) {
    this.selected.set(s);
    this.query.set(s.label);
    this.open.set(false);
    this.picked.emit(s);
  }
  activeId(): string | null { return this.active() >=0 ? 'loc-opt-'+this.active() : null; }
  onKey(ev: KeyboardEvent) {
    if (!this.open()) return;
    const list = this.results();
    if (ev.key==='ArrowDown') { ev.preventDefault(); this.active.set(Math.min(this.active()+1, list.length-1)); }
    else if (ev.key==='ArrowUp') { ev.preventDefault(); this.active.set(Math.max(this.active()-1,0)); }
    else if (ev.key==='Enter') { if (this.active()>=0 && this.active()<list.length) { ev.preventDefault(); this.choose(list[this.active()]); } }
    else if (ev.key==='Escape') { this.open.set(false); }
  }

  badgeFor(s: GeoSuggestion): string | null {
    if (s.kind === 'university') return 'University';
    return null;
  }

  secondaryLine(s: GeoSuggestion): string | null {
    if (s.description) return s.description;
    const parts = [s.city, s.state, s.country].filter(Boolean).join(', ');
    return parts || null;
  }

  private composeLabel(city?: string, state?: string): string {
    return [city, state].filter(Boolean).join(', ');
  }
}
