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
  <input type="text" [value]="query()" (input)="onInput($event)" (focus)="onFocus()" (blur)="onBlur()" [placeholder]="placeholder" class="input-premium" role="combobox" aria-expanded="{{open()}}" aria-haspopup="listbox" [attr.aria-activedescendant]="activeId()" autocomplete="off" />
      <div *ngIf="selected()" class="text-xs text-gray-500 mt-1">Selected: {{ selected()?.label }}</div>
      <ul *ngIf="open()" class="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto mt-1 text-sm" role="listbox">
        <li *ngIf="loading()" class="px-3 py-2 text-gray-500">Searching…</li>
        <li *ngFor="let s of results(); let i=index" (mousedown)="choose(s)" [id]="'loc-opt-'+i" role="option" class="px-3 py-2 cursor-pointer flex flex-col gap-1" [class.bg-indigo-50]="i===active()">
          <div class="flex items-center justify-between gap-3">
            <span class="font-medium text-gray-900">{{ s.label }}</span>
            <span *ngIf="badgeFor(s)" class="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">{{ badgeFor(s) }}</span>
          </div>
          <span class="text-[11px] text-gray-500" *ngIf="secondaryLine(s)">{{ secondaryLine(s) }}</span>
        </li>
        <li *ngIf="!loading() && results().length===0" class="px-3 py-2 text-gray-500">Start Typing</li>
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
    clearTimeout(this.debounceHandle);
    if (v.trim().length < 2) { this.results.set([]); this.loading.set(false); return; }
    this.loading.set(true);
    this.debounceHandle = setTimeout(() => {
      this.geo.search(v).subscribe(list => {
        this.results.set(list);
        this.loading.set(false);
      }, () => this.loading.set(false));
    }, 250);
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
