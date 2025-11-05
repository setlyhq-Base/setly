import { Component, EventEmitter, Output, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface University {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

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
        (focus)="showSuggestions = true"
        (blur)="hideSuggestions()"
              placeholder="Search for rooms near USA universities..."
        class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        aria-label="Search for rooms"
        autocomplete="off"
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
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <div
          *ngFor="let university of filteredSuggestions()"
          (mousedown)="selectUniversity(university)"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
export class SearchBarComponent {
  @Output() submitQuery = new EventEmitter<string>();

  query = '';
  showSuggestions = false;
  universities = signal<University[]>([]);

  filteredSuggestions = computed(() => {
    if (!this.query.trim() || this.query.length < 2) return [];

    const query = this.query.toLowerCase();
    return this.universities().filter(university =>
      university.name.toLowerCase().includes(query) ||
      university.city.toLowerCase().includes(query) ||
      university.state.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 suggestions
  });

  constructor(private router: Router) {
    this.loadUniversities();
  }

  private async loadUniversities(): Promise<void> {
    try {
      const response = await fetch('/assets/mock/universities.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.universities.set(data);
    } catch (error) {
      console.error('Error loading universities:', error);
      // Fallback to empty array to prevent crashes
      this.universities.set([]);
    }
  }

  onInputChange(): void {
    this.showSuggestions = true;
  }

  hideSuggestions(): void {
    // Delay hiding to allow click events on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectUniversity(university: University): void {
    this.query = university.name;
    this.showSuggestions = false;
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.query.trim()) {
      this.submitQuery.emit(this.query.trim());
      this.showSuggestions = false;
      // Navigate to browse page with query params
      this.router.navigate(['/browse'], {
        queryParams: { q: this.query.trim(), studentVerified: true }
      });
    }
  }
}
