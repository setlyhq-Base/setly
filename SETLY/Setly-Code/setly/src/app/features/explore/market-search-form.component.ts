import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';
import { GeoSuggestion } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-market-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocationAutocompleteComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label">Item name / search term</label>
          <input type="text" class="input-premium w-full" formControlName="term" placeholder="What are you looking for?" />
          <p *ngIf="showError('term')" class="field-error">Add a search term.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Location</label>
          <app-location-autocomplete
            [initialCity]="form.controls['location']?.value || ''"
            (picked)="setLocation($event)"
          ></app-location-autocomplete>
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label">Category</label>
          <input type="text" class="input-premium w-full" formControlName="category" placeholder="Books, Electronics, Furniture…" />
        </div>
        <div class="field-block">
          <label class="field-label">Price range</label>
          <input type="text" class="input-premium w-full" formControlName="priceRange" placeholder="$10 - $50" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout { display:flex; flex-direction:column; gap:20px; }
    .form-row { display:grid; gap:20px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.two-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .field-block { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:0.7rem; text-transform:uppercase; font-weight:600; color:#475569; letter-spacing:0.08em; line-height:1.2; }
    .field-error { font-size:0.75rem; color:#e11d48; margin-top:4px; }
    @media (min-width: 768px) {
      .form-layout { gap:24px; }
      .form-row { gap:24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (min-width: 1200px) {
      .form-layout { gap:28px; }
      .form-row { gap:28px; }
    }
  `]
})
export class MarketSearchFormComponent {
  @Input() form!: FormGroup;

  setLocation(event: GeoSuggestion) {
    const value = this.formatValue(event);
    this.form.controls['location']?.setValue(value);
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }

  private formatValue(s: GeoSuggestion): string {
    if (!s) return '';
    if (s.kind === 'university') {
      return [s.label, s.country].filter(Boolean).join(', ') || s.label;
    }
    if (s.source === 'google_places') {
      return s.label;
    }
    const parts = [s.city || s.label, s.state, s.country].filter(Boolean);
    return parts.length ? parts.join(', ') : s.label;
  }
}