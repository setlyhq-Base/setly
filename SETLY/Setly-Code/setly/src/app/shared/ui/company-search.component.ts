import { Component, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Company { id: string; name: string; city?: string; state?: string; country?: string; }

@Component({
  selector: 'app-company-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [value]="query()"
        (input)="onInput($event)"
        (focus)="showDropdown.set(true)"
        (blur)="onBlur()"
        [placeholder]="placeholder || 'Search companies…'"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        role="combobox"
        aria-expanded="false"
        aria-haspopup="listbox"
        autocomplete="off"
      >
      <div *ngIf="selectedLabel()" class="mt-1 text-xs text-gray-600">Selected: {{ selectedLabel() }}</div>
      <ul
        *ngIf="showDropdown()"
        class="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto mt-1 text-sm"
        role="listbox"
      >
        <li *ngIf="loading()" class="px-4 py-2 text-gray-500">Loading…</li>
        <li
          *ngFor="let c of filtered()"
          (mousedown)="selectCompany(c)"
          class="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex flex-col"
          role="option"
        >
          <span class="font-medium leading-tight">{{ c.name }}</span>
          <span class="text-[11px] text-gray-500" *ngIf="c.city || c.country">{{ c.city || '' }}<ng-container *ngIf="c.city && c.country">, </ng-container>{{ c.country || '' }}</span>
        </li>
        <li *ngIf="!loading() && filtered().length === 0" class="px-4 py-2 text-gray-500">No matches</li>
      </ul>
    </div>
  `
})
export class CompanySearchComponent {
  @Input() placeholder?: string;
  @Output() picked = new EventEmitter<{ id: string; name: string }>();
  query = signal('');
  showDropdown = signal(false);
  loading = signal(false);
  selectedLabel = signal<string | null>(null);
  companies = signal<Company[]>([]);
  filtered = signal<Company[]>([]);

  constructor(){ this.loadCompanies(); }

  async loadCompanies(): Promise<void> {
    this.loading.set(true);
    try {
  const response = await fetch('assets/mock/companies.json');
      const data = await response.json();
      this.companies.set(data);
    } catch (e) {
      console.error('Failed to load companies:', e);
    } finally {
      this.loading.set(false);
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    if (value.length) {
      const q = value.toLowerCase();
      const filtered = this.companies().filter(c => c.name.toLowerCase().includes(q));
      this.filtered.set(filtered.slice(0, 10));
      this.showDropdown.set(true);
    } else {
      this.filtered.set([]);
      this.showDropdown.set(false);
    }
  }

  onBlur(): void { setTimeout(() => this.showDropdown.set(false), 200); }

  selectCompany(c: Company): void {
    this.query.set(c.name);
    this.selectedLabel.set(c.name);
    this.showDropdown.set(false);
    this.picked.emit({ id: c.id, name: c.name });
  }
}
