import { Component, EventEmitter, Output, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UniversityService, University } from '../../core/services/university.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule, CommonModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [(ngModel)]="query"
        (input)="onInputChange()"
        (keyup.enter)="onSubmit()"
        (keydown)="onKeyDown($event)"
        (focus)="showSuggestions = true"
        (blur)="hideSuggestions()"
        placeholder="Search for rooms near USA universities..."
        class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        aria-label="Search for rooms"
        autocomplete="off"
        data-testid="search-input"
      >
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <button
        (click)="onSubmit()"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        aria-label="Submit search"
      >
        <svg class="h-5 w-5 text-brand-blue hover:text-brand-blue/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      <!-- Suggestions Dropdown -->
      <div
        *ngIf="showSuggestions && filteredSuggestions().length > 0"
        class="absolute left-0 right-0 top-full z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <div
          *ngFor="let university of filteredSuggestions(); let i = index"
          (mousedown)="selectUniversity(university)"
          [class.bg-blue-50]="i === activeIndex"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          data-testid="search-suggestion"
        >
          <div class="font-medium text-gray-900">{{ university.name }}</div>
          <div class="text-sm text-gray-600">{{ university.city }}, {{ university.state }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .suggestions-dropdown {
      max-height: 240px;
      overflow-y: auto;
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() submitQuery = new EventEmitter<string>();

  query = '';
  showSuggestions = false;
  activeIndex = -1;
  private destroy$ = new Subject<void>();
  private inputSubject = new Subject<string>();

  universityService = inject(UniversityService);

  filteredSuggestions = computed(() => {
    if (!this.query.trim() || this.query.length < 2) return [];

    const query = this.query.toLowerCase();
    return this.universityService.search(query);
  });

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.inputSubject.pipe(
      debounceTime(150),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.activeIndex = -1;
    });

    // Close suggestions on route change
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.showSuggestions = false;
      this.activeIndex = -1;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(): void {
    this.showSuggestions = true;
    this.inputSubject.next(this.query);
  }

  onKeyDown(event: KeyboardEvent): void {
    const suggestions = this.filteredSuggestions();
    if (!this.showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0 && this.activeIndex < suggestions.length) {
          this.selectUniversity(suggestions[this.activeIndex]);
        } else {
          this.onSubmit();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.showSuggestions = false;
        this.activeIndex = -1;
        break;
    }
  }

  hideSuggestions(): void {
    // Delay hiding to allow click events on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
      this.activeIndex = -1;
    }, 200);
  }

  selectUniversity(university: University): void {
    this.query = university.name;
    this.showSuggestions = false;
    this.activeIndex = -1;
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.query.trim()) {
      this.submitQuery.emit(this.query.trim());
      this.showSuggestions = false;
      this.activeIndex = -1;
      // Navigate to browse page with query params
      this.router.navigate(['/browse'], {
        queryParams: { q: this.query.trim(), studentVerified: true }
      });
    }
  }
}
