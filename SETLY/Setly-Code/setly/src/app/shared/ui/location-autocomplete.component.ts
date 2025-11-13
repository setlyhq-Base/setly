import { Component, EventEmitter, Output, Input, signal, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeocodingService, GeoSuggestion } from '../../core/services/geocoding.service';
import { FormsModule } from '@angular/forms';
import { debounce } from 'rxjs';

@Component({
  selector: 'app-location-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative" (keydown)="onKey($event)">
      <input type="text" [value]="query()" (input)="onInput($event)" (focus)="onFocus()" (blur)="onBlur()" placeholder="City" class="input-premium" role="combobox" aria-expanded="{{open()}}" aria-haspopup="listbox" [attr.aria-activedescendant]="activeId()" autocomplete="off" />
      <div *ngIf="selected()" class="text-xs text-gray-500 mt-1">Selected: {{ selected()?.city }}, {{ selected()?.state }}</div>
      <ul *ngIf="open()" class="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto mt-1 text-sm" role="listbox">
        <li *ngIf="loading()" class="px-3 py-2 text-gray-500">Searching…</li>
        <li *ngFor="let s of results(); let i=index" (mousedown)="choose(s)" [id]="'loc-opt-'+i" role="option" class="px-3 py-2 cursor-pointer flex flex-col" [class.bg-indigo-50]="i===active()">
          <span class="font-medium">{{ s.city }}, {{ s.state }} <span class="text-gray-400">{{ s.country }}</span></span>
          <span class="text-[11px] text-gray-500">Lat {{ s.lat }}, Lon {{ s.lon }}</span>
        </li>
        <li *ngIf="!loading() && results().length===0" class="px-3 py-2 text-gray-500">No matches</li>
      </ul>
    </div>
  `
})
export class LocationAutocompleteComponent implements OnInit, OnChanges {
  @Input() initialCity?: string;
  @Input() initialState?: string;
  @Output() picked = new EventEmitter<{ city: string; state: string; country?: string; lat?: number; lon?: number }>();
  private geo = inject(GeocodingService);
  query = signal('');
  open = signal(false);
  results = signal<GeoSuggestion[]>([]);
  loading = signal(false);
  selected = signal<GeoSuggestion | null>(null);
  active = signal(-1);
  private debounceHandle: any;

  ngOnInit() {
    if (this.initialCity) this.query.set(this.initialCity);
  }

  ngOnChanges(changes: SimpleChanges) {
    // When parent updates initialCity/initialState (e.g., after picking an address), reflect it here
    if ((changes['initialCity'] && changes['initialCity'].currentValue !== undefined) ||
        (changes['initialState'] && changes['initialState'].currentValue !== undefined)) {
      const c = this.initialCity || '';
      const s = this.initialState || '';
      // Update input box text
      if (c && this.query() !== c) this.query.set(c);
      // Mark as selected so "Selected:" hint appears
      if (c || s) {
        this.selected.set({ id: 'manual', city: c, state: s, country: '', lat: 0, lon: 0, name: c } as any);
      }
    }
  }

  onInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.query.set(v);
    this.open.set(true);
    this.active.set(-1);
    clearTimeout(this.debounceHandle);
    if (v.trim().length < 2) { this.results.set([]); return; }
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
    this.query.set(`${s.city}`);
    this.open.set(false);
    this.picked.emit({ city: s.city, state: s.state, country: s.country, lat: s.lat, lon: s.lon });
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
}
