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
             role="combobox" aria-expanded="{{open()}}" aria-haspopup="listbox" [attr.aria-activedescendant]="activeId()" autocomplete="off" />
      <ul *ngIf="open()" class="absolute z-40 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto mt-1 text-sm" role="listbox">
        <li *ngIf="loading()" class="px-3 py-2 text-gray-500">Searching…</li>
        <li *ngFor="let s of results(); let i=index" (mousedown)="choose(s)" [id]="'addr-opt-'+i" role="option" class="px-3 py-2 cursor-pointer" [class.bg-indigo-50]="i===active()">
          <span class="block font-medium truncate" [title]="s.label">{{ s.label }}</span>
          <span class="block text-[11px] text-gray-500">{{ s.city }}, {{ s.state }} {{ s.postcode }}</span>
        </li>
        <li *ngIf="!loading() && results().length===0" class="px-3 py-2 text-gray-500">Start Typing</li>
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
    if (v.trim().length < 3) { this.results.set([]); return; }
    this.loading.set(true);
    this.debounceHandle = setTimeout(() => {
      this.geo.addressLookup(v, { city: this.biasCity, state: this.biasState, lat: this.biasLat, lon: this.biasLon })
        .subscribe(list => { this.results.set(list); this.loading.set(false); }, () => this.loading.set(false));
    }, 300);
  }
  onFocus() { this.open.set(true); if (this.query().trim().length >= 3) this.onInput({ target: { value: this.query() } } as any); }
  onBlur() { setTimeout(()=> this.open.set(false), 160); }
  choose(s: AddressSuggestion) { this.query.set(s.address); this.open.set(false); this.picked.emit(s); }
  activeId(): string | null { return this.active()>=0 ? 'addr-opt-'+this.active() : null; }
  onKey(ev: KeyboardEvent) {
    if (!this.open()) return;
    const list = this.results();
    if (ev.key==='ArrowDown') { ev.preventDefault(); this.active.set(Math.min(this.active()+1, list.length-1)); }
    else if (ev.key==='ArrowUp') { ev.preventDefault(); this.active.set(Math.max(this.active()-1,0)); }
    else if (ev.key==='Enter') { if (this.active()>=0 && this.active()<list.length) { ev.preventDefault(); this.choose(list[this.active()]); } }
    else if (ev.key==='Escape') { this.open.set(false); }
  }
}
