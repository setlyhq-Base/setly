import { Component, ElementRef, EventEmitter, HostListener, Input, Output, forwardRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { COUNTRY_CODES, CountryCode, flagEmoji } from '../data/country-codes';

@Component({
  selector: 'app-country-code-select',
  standalone: true,
  imports: [CommonModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CountryCodeSelectComponent),
    multi: true,
  }],
  template: `
    <div class="relative" [class.opacity-50]="disabled">
      <button type="button" [ngClass]="appearance==='input' ? 'input flex items-center justify-between gap-2 w-full' : 'cc-bare flex items-center gap-2'" (click)="toggle()" [attr.aria-expanded]="open" [disabled]="disabled" aria-label="Select country">
        <span class="inline-flex items-center gap-2">
          <span class="flag">{{ flag(selected?.code || 'US') }}</span>
          <span class="dial text-gray-900 font-medium">{{ selected?.dial || '+1' }}</span>
        </span>
        <svg class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/></svg>
      </button>

      <div *ngIf="open" class="absolute z-30 w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
           [style.top]="dropUp ? null : 'calc(100% + 8px)'" [style.bottom]="dropUp ? 'calc(100% + 8px)' : null" [style.maxHeight.px]="panelMaxHeight">
        <div class="p-2 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg border border-gray-200">
            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.5 3.5a5 5 0 103.28 8.77l3.73 3.72a.75.75 0 101.06-1.06l-3.72-3.73A5 5 0 008.5 3.5zm-3.5 5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" clip-rule="evenodd"/></svg>
            <input type="text" [value]="query" (input)="onQuery($event)" placeholder="Search for countries" class="w-full text-sm outline-none" />
          </div>
        </div>
        <div class="overflow-auto" [style.maxHeight.px]="listMaxHeight">
          <button type="button" *ngFor="let c of filtered(); let i = index" (click)="pick(c)" class="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-3">
            <span class="text-lg">{{ flag(c.code) }}</span>
            <span class="flex-1">
              <span class="block text-sm text-gray-900">{{ c.name }}</span>
              <span class="block text-xs text-gray-500">{{ c.dial }}</span>
            </span>
            <span *ngIf="c.dial === value" class="text-indigo-600">✓</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .input { @apply rounded-xl border border-gray-300 px-3 py-2 bg-white text-sm; }
    .cc-bare { background:transparent; border:none; padding:0 .5rem; height:100%; }
    .cc-bare .flag { font-size:1rem; line-height:1; display:inline-block; }
    .cc-bare .dial { font-size:.85rem; font-weight:600; }
  `]
})
export class CountryCodeSelectComponent implements ControlValueAccessor {
  @Input() countries: CountryCode[] = COUNTRY_CODES;
  @Input() disabled = false;
  // appearance 'input' renders a bordered control, 'bare' renders inline for embedding in a composite input
  @Input() appearance: 'input' | 'bare' = 'input';

  open = false;
  query = '';
  value: string = '+1';
  selected: CountryCode | null = this.countries[0] || null;
  dropUp = false;
  panelMaxHeight = 180; // px
  listMaxHeight = 120;  // px, calculated on open

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  private host = inject(ElementRef<HTMLElement>);

  writeValue(obj: any): void {
    if (typeof obj === 'string' && obj.startsWith('+')) {
      this.value = obj;
    }
    const found = this.countries.find(c => c.dial === this.value) || null;
    this.selected = found || this.countries[0] || null;
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }

  toggle() {
    if (this.disabled) return;
    this.open = !this.open;
    if (this.open) {
      this.computePlacement();
    }
  }

  private computePlacement() {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const margin = 12; // px gap from edges
    const desired = 180; // desired panel height including search header
    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;
    if (below >= desired) {
      this.dropUp = false; this.panelMaxHeight = desired;
    } else if (above >= desired) {
      this.dropUp = true; this.panelMaxHeight = desired;
    } else {
      // pick side with more space and clamp height; ensure we at least show search + ~2 items
      const chosen = below >= above ? below : above;
      this.dropUp = below < desired && above >= below;
      const minH = 120; // ~search + 2 items visible
      this.panelMaxHeight = Math.max(minH, Math.floor(chosen));
    }
    // list area excludes search header (~56px)
    const header = 56;
    this.listMaxHeight = Math.max(64, this.panelMaxHeight - header);
  }

  onQuery(event: Event) { this.query = (event.target as HTMLInputElement).value; }

  filtered(): CountryCode[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.countries;
    return this.countries.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dial.replace('+','').includes(q.replace('+',''))
    );
  }

  pick(c: CountryCode) {
    this.value = c.dial;
    this.selected = c;
    this.onChange(this.value);
    this.onTouched();
    this.open = false;
  }

  flag(code: string) { return flagEmoji(code); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.open) return;
    const el = this.host.nativeElement;
    if (!el.contains(e.target as Node)) this.open = false;
  }

  @HostListener('window:resize')
  onResize() { if (this.open) this.computePlacement(); }
}
