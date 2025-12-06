import { Component, EventEmitter, Input, Output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GooglePlacesService, PlacePrediction, PlaceDetailsResult } from '../../core/services/google-places.service';
import { UniversityLookupService, UniversityLite } from '../../core/services/university-lookup.service';
// Local lightweight debounce to avoid path resolution issues
function debounce<T extends (...args:any[])=>void>(fn: T, wait = 300) {
  let t: any; return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

@Component({
  selector: 'app-google-place-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="relative" (keydown)="onKey($event)">
    <input type="text" class="input-premium w-full" [placeholder]="placeholder" [disabled]="disabled"
      role="combobox" aria-autocomplete="list" aria-expanded="{{open()}}" 
      [attr.aria-controls]="open() ? listboxId : null" 
      [attr.aria-activedescendant]="active()>=0 ? optionId(active()) : null"
      [(ngModel)]="queryInput" (ngModelChange)="onQueryChange($event)" (focus)="onFocus()" (blur)="onBlur()" />
    <div class="sr-only" aria-live="polite">{{statusMessage()}}</div>
    <ul *ngIf="open()" class="dropdown" [id]="listboxId" role="listbox">
      <li *ngIf="loading()" class="loading" role="status">Searching…</li>
      <li *ngFor="let p of predictions(); let i=index" (mousedown)="choose(p)" [class.active]="i===active()" class="item"
          role="option" [id]="optionId(i)" [attr.aria-selected]="i===active()">
        <div class="flex gap-2">
          <span class="pin" aria-hidden="true">📍</span>
          <div class="flex flex-col">
            <span class="main" [innerHTML]="highlightMain(p)"></span>
            <span class="secondary" [innerHTML]="highlightSecondary(p)"></span>
          </div>
        </div>
      </li>
      <li *ngIf="!loading() && predictions().length===0" class="empty" role="alert">No matches. Trying broader search…</li>
    </ul>
  </div>
  `,
  styles: [`
    .dropdown { position:absolute; z-index:40; inset-inline:0; top:100%; margin-top:4px; background:#fff; border:1px solid #e2e8f0; border-radius:14px; box-shadow:0 12px 28px -10px rgba(30,41,59,.25); max-height:260px; overflow-y:auto; padding:4px; }
    .item { padding:10px 12px; cursor:pointer; border-radius:10px; font-size:.8rem; line-height:1.2; }
    .item.active, .item:hover { background:#eef2ff; }
    .pin { font-size:.9rem; }
    .main { font-weight:600; font-size:.75rem; }
    .secondary { font-size:.65rem; color:#64748b; }
    .loading, .empty { padding:12px; font-size:.7rem; color:#64748b; }
  `]
})
export class GooglePlaceInputComponent implements OnInit {
  @Input() placeholder = 'Search address';
  @Input() initialAddress = '';
  @Input() disabled = false; // allow parent form to gate readiness
  // When true, will merge university matches into suggestions (for room search context)
  @Input() includeUniversities = true;
  @Output() picked = new EventEmitter<{ address: string; lat?: number; lng?: number; components?: any }>();
  private places = inject(GooglePlacesService);
  private uniLookup = inject(UniversityLookupService);
  
  queryInput = ''; // ngModel binding
  query = signal('');
  open = signal(false);
  predictions = signal<PlacePrediction[]>([]);
  loading = signal(false);
  active = signal(-1);
  private lastNoResultsQuery = '';
  private debouncedSearch = debounce((val: string) => this.search(val), 325);
  // Accessibility state
  listboxId = 'gp-listbox-' + Math.random().toString(36).slice(2);
  statusMessage = signal('');

  ngOnInit() { 
    if (this.initialAddress) { 
      this.queryInput = this.initialAddress;
      this.query.set(this.initialAddress); 
    } 
  }

  // Bound via (ngModelChange) as onQueryChange; (input) would also work but we keep model sync.
  // NOTE: Template currently calls (ngModelChange)="onQueryChange($event)"; previously this method
  // was missing which prevented search + predictions from ever firing.
  onQueryChange(val: string) {
    this.query.set(val);
    // Open dropdown as user types
    this.open.set(true);
    // Reset active selection
    this.active.set(-1);
    // Show loading state while we debounce
    this.loading.set(true);
    this.debouncedSearch(val);
  }

  private search(value: string) {
    const v = value.trim();
    if (v.length < 2) { this.predictions.set([]); this.loading.set(false); this.updateStatus(); return; }
    this.places.autocompleteAbortable(v, list => {
      const finalize = (base: PlacePrediction[]) => {
        // Optionally enrich with universities if enabled and we have room (<8 suggestions)
        if (this.includeUniversities && v.length >= 2) {
          this.uniLookup.fetch(null, v).subscribe(unis => {
            const uniPreds: PlacePrediction[] = unis.slice(0,5).map(u => ({
              description: `${u.name}${u.city ? ', ' + u.city : ''}${u.state ? ', ' + u.state : ''}`,
              place_id: 'uni:' + u.id,
              structured_formatting: { main_text: u.name, secondary_text: [u.city, u.state].filter(Boolean).join(', ') }
            }));
            // Merge while avoiding duplicate description strings
            const seen = new Set(base.map(b => b.description));
            const merged = [...base];
            for (const up of uniPreds) { if (!seen.has(up.description)) { merged.push(up); } }
            this.predictions.set(merged.slice(0, 10));
            this.loading.set(false); this.updateStatus();
          }, () => { this.predictions.set(base); this.loading.set(false); this.updateStatus(); });
        } else {
          this.predictions.set(base); this.loading.set(false); this.updateStatus();
        }
      };
      if (list.length === 0 && v !== this.lastNoResultsQuery) {
        this.lastNoResultsQuery = v;
        this.places.textSearchAbortable(v, res => {
          const preds: PlacePrediction[] = res.map(r => ({ description: r.formatted_address, place_id: 'fallback:' + r.formatted_address }));
          finalize(preds.slice(0,5));
        });
      } else {
        finalize(list);
      }
    });
  }

  onFocus() { if (this.query().length >=2) { this.open.set(true); this.search(this.query()); } else { this.open.set(true); } }
  onBlur() { setTimeout(()=> this.open.set(false),150); }

  choose(p: PlacePrediction) {
    this.queryInput = p.description;
    this.query.set(p.description); this.open.set(false);
    if (p.place_id && !p.place_id.startsWith('fallback:') && !p.place_id.startsWith('dev:') && !p.place_id.startsWith('uni:')) {
      this.loading.set(true);
      this.places.details(p.place_id).subscribe(det => {
        this.loading.set(false);
        if (det) { const loc = det.geometry?.location; this.picked.emit({ address: det.formatted_address || p.description, lat: loc?.lat, lng: loc?.lng, components: det.address_components }); }
        else { this.picked.emit({ address: p.description }); }
        this.places.resetSession(); this.places.clearCaches();
      });
    } else {
      this.picked.emit({ address: p.description }); this.places.resetSession(); this.places.clearCaches();
    }
  }

  onKey(ev: KeyboardEvent) {
    if (!this.open()) return; const list = this.predictions();
    if (ev.key==='ArrowDown') { ev.preventDefault(); this.active.set(Math.min(this.active()+1, list.length-1)); }
    else if (ev.key==='ArrowUp') { ev.preventDefault(); this.active.set(Math.max(this.active()-1,0)); }
    else if (ev.key==='Enter') { if (this.active()>=0 && this.active()<list.length) { ev.preventDefault(); this.choose(list[this.active()]); } }
    else if (ev.key==='Escape') { this.open.set(false); }
  }

  highlightMain(p: PlacePrediction) { const main = p.structured_formatting?.main_text || p.description.split(',')[0]; return this.markQuery(main); }
  highlightSecondary(p: PlacePrediction) { const sec = p.structured_formatting?.secondary_text || p.description.split(',').slice(1).join(', '); return this.markQuery(sec); }
  private markQuery(text: string) {
    const q = this.query().trim(); if (!q) return text; try { const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'); return text.replace(re,'<strong class="text-indigo-600">$1</strong>'); } catch { return text; }
  }
  updateStatus() { if (this.loading()) { this.statusMessage.set('Searching'); return; } const count = this.predictions().length; this.statusMessage.set(!count ? 'No suggestions' : `${count} suggestion${count>1?'s':''} available`); }
  optionId(i: number) { return `${this.listboxId}-opt-${i}`; }
}