import { Component, signal, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { University, UniversityDirectoryService } from '../../core/services/university-directory.service';

@Component({
  selector: 'app-university-search',
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [value]="query()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder || 'Search universities…'"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        role="combobox"
        aria-expanded="{{ showDropdown() }}"
        aria-haspopup="listbox"
        aria-controls="uni-listbox"
        [attr.aria-activedescendant]="activeOptionId()"
        autocomplete="off"
      >
      <div *ngIf="selectedLabel()" class="mt-1 text-xs text-gray-600">Selected: {{ selectedLabel() }}</div>
      <ul
        *ngIf="showDropdown()"
        id="uni-listbox"
        class="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto mt-1 text-sm"
        role="listbox"
      >
        <li *ngIf="loading()" class="px-4 py-2 text-gray-500 flex items-center gap-2">
          <span class="inline-block h-4 w-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></span>
          Warming suggestions…
        </li>
        <li
          *ngFor="let uni of filteredUniversities(); let i = index"
          (mousedown)="selectUniversity(uni)"
          [id]="'uni-opt-' + i"
          class="px-4 py-2 cursor-pointer flex flex-col"
          [class.bg-indigo-50]="i === activeIndex()"
          [class.hover\:bg-indigo-50]="true"
          role="option"
        >
          <span class="font-medium leading-tight">{{ uni.name }}</span>
          <span class="text-[11px] text-gray-500">{{ formatSubline(uni) }}</span>
        </li>
        <li *ngIf="!loading() && filteredUniversities().length === 0" class="px-4 py-2 text-gray-500">
          Start Typing.
        </li>
      </ul>
    </div>
  `
})
export class UniversitySearchComponent implements OnInit {
  @Input() placeholder?: string;
  @Output() picked = new EventEmitter<{ id: string; name: string; city?: string; state?: string }>();
  query = signal('');
  showDropdown = signal(false);
  filteredUniversities = signal<University[]>([]);
  loading = signal(false);
  selectedLabel = signal<string | null>(null);
  activeIndex = signal<number>(-1);
  private svc = inject(UniversityDirectoryService);
  private debounceTimer: any = null;

  constructor() { }

  async ngOnInit(): Promise<void> {
    // Warm cache but don't block UI
    this.loading.set(true);
    this.svc.getAll()
      .then(() => this.loading.set(false))
      .catch(() => this.loading.set(false));
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.showDropdown.set(true);
    this.activeIndex.set(-1);
    // Debounce 150ms, require min 1 char for snappier feel
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      const q = this.query();
      if (q.trim().length < 1) {
        this.filteredUniversities.set([]);
        return;
      }
      const res = await this.svc.search(q);
      this.filteredUniversities.set(res);
    }, 150);
  }

  onFocus(): void {
    this.showDropdown.set(true);
    // If user focuses with existing query, trigger search (debounced already)
    if (this.query().trim().length >= 2) {
      this.onInput({ target: { value: this.query() } } as any as Event);
    }
  }

  onBlur(): void {
    // Delay hiding to allow for selection
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  selectUniversity(uni: University): void {
    this.query.set(uni.name);
    this.selectedLabel.set(uni.name);
    this.showDropdown.set(false);
    this.picked.emit({ id: uni.id, name: uni.name, city: uni.city, state: uni.state });
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.showDropdown()) return;
    const list = this.filteredUniversities();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.min(this.activeIndex() + 1, list.length - 1);
      this.activeIndex.set(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = Math.max(this.activeIndex() - 1, 0);
      this.activeIndex.set(prev);
    } else if (event.key === 'Enter') {
      if (this.activeIndex() >= 0 && this.activeIndex() < list.length) {
        event.preventDefault();
        this.selectUniversity(list[this.activeIndex()]);
      }
    } else if (event.key === 'Escape') {
      this.showDropdown.set(false);
    }
  }

  activeOptionId(): string | null {
    const idx = this.activeIndex();
    return idx >= 0 ? `uni-opt-${idx}` : null;
  }

  formatSubline(uni: University): string {
    const parts = [] as string[];
    if (uni.city) parts.push(uni.city);
    if (uni.state) parts.push(uni.state);
    if (!parts.length && (uni as any).country) parts.push((uni as any).country);
    return parts.join(', ');
  }
}
