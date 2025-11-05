import { Component, signal } from '@angular/core';
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
  selector: 'app-university-search',
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [value]="query()"
        (input)="onInput($event)"
        (focus)="showDropdown.set(true)"
        (blur)="onBlur()"
        placeholder="Search universities..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
        role="combobox"
        aria-expanded="false"
        aria-haspopup="listbox"
      >

      <!-- Dropdown -->
      <ul
        *ngIf="showDropdown()"
        class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1"
        role="listbox"
      >
        <li
          *ngFor="let uni of filteredUniversities()"
          (mousedown)="selectUniversity(uni)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          role="option"
        >
          <div class="font-medium">{{ uni.name }}</div>
          <div class="text-sm text-gray-600">{{ uni.city }}, {{ uni.state }}</div>
        </li>
        <li *ngIf="filteredUniversities().length === 0" class="px-4 py-2 text-gray-500">
          No universities found
        </li>
      </ul>
    </div>
  `
})
export class UniversitySearchComponent {
  query = signal('');
  showDropdown = signal(false);
  universities = signal<University[]>([]);
  filteredUniversities = signal<University[]>([]);

  constructor() {
    this.loadUniversities();
  }

  async loadUniversities(): Promise<void> {
    try {
      const response = await fetch('/assets/mock/universities.json');
      const data = await response.json();
      this.universities.set(data);
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);

    if (value.length > 0) {
      const filtered = this.universities().filter(uni =>
        uni.name.toLowerCase().includes(value.toLowerCase()) ||
        uni.city.toLowerCase().includes(value.toLowerCase())
      );
      this.filteredUniversities.set(filtered.slice(0, 10)); // Limit to 10 results
      this.showDropdown.set(true);
    } else {
      this.filteredUniversities.set([]);
      this.showDropdown.set(false);
    }
  }

  onBlur(): void {
    // Delay hiding to allow for selection
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  selectUniversity(uni: University): void {
    this.query.set(uni.name);
    this.showDropdown.set(false);
    // TODO: Emit selection event
  }
}
