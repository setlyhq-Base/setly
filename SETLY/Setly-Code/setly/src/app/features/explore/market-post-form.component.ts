import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';
import { GeoSuggestion } from '../../core/services/geocoding.service';
import { ImageUploaderComponent } from '../../shared/ui/image-uploader.component';

@Component({
  selector: 'app-market-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocationAutocompleteComponent, ImageUploaderComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <!-- Title & Price Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium required">Item Title</label>
          <span class="field-hint">What are you selling?</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M12 13V3M3 8l9 5 9-5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <input 
              type="text" 
              class="input-premium w-full" 
              formControlName="title"
              placeholder="E.g., Calculus textbook, desk lamp..."
              style="padding-left: 48px;"
            />
          </div>
          <p *ngIf="showError('title')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Title is required
          </p>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium required">Price</label>
          <span class="field-hint">In USD</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M10.5 8.5h4M10.5 15.5h4M12 8.5v7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="number" 
              class="input-premium w-full no-spinner" 
              formControlName="price" 
              min="0"
              placeholder="50"
              style="padding-left: 48px;"
            />
          </div>
          <p *ngIf="showError('price')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Valid price required
          </p>
        </div>
      </div>

      <!-- Condition & Category Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium required">Condition</label>
          <span class="field-hint">Item state</span>
          <div class="input-icon-wrapper icon-right">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <select class="select-premium w-full" formControlName="condition" style="padding-left: 48px;">
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <p *ngIf="showError('condition')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Condition required
          </p>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium required">Category</label>
          <span class="field-hint">Type of item</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input 
              type="text" 
              class="input-premium w-full" 
              formControlName="category" 
              placeholder="Books, furniture, electronics..."
              style="padding-left: 48px;"
            />
          </div>
          <p *ngIf="showError('category')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Category required
          </p>
        </div>
      </div>

      <!-- Location & Photos Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium required">Location</label>
          <span class="field-hint">Where is the item?</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            <app-location-autocomplete
              [initialCity]="form.controls['location']?.value || ''"
              (picked)="setLocation($event)"
              placeholder="Search city"
            ></app-location-autocomplete>
          </div>
          <p *ngIf="showError('location')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Location required
          </p>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium required">Upload Photos</label>
          <span class="field-hint">Add clear images</span>
          <app-image-uploader 
            formControlName="photos" 
            [maxImages]="10"
            [variant]="'circle'"
            [helperPrimary]="'Add at least 1 photo'"
            [helperSecondary]="'Max 10 • JPG, PNG, WebP'"
          ></app-image-uploader>
          <p *ngIf="showError('photos')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            At least 1 photo required
          </p>
        </div>
      </div>

      <!-- Description -->
      <div class="form-row single">
        <div class="field-block">
          <label class="field-label-premium">Description</label>
          <span class="field-hint">Provide details about the item</span>
          <textarea 
            class="textarea-premium w-full" 
            rows="4" 
            formControlName="description" 
            placeholder="Describe the item's features, condition, dimensions, or any other relevant details..."
          ></textarea>
          <p *ngIf="showError('description')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Description required
          </p>
          <div class="field-helper">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Detailed descriptions help sell faster
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout { 
      display: flex; 
      flex-direction: column; 
      gap: 24px; 
    }
    
    .form-row { 
      display: grid; 
      gap: 20px; 
      grid-template-columns: repeat(1, minmax(0, 1fr)); 
    }
    
    .form-row.two-cols { 
      grid-template-columns: repeat(1, minmax(0, 1fr)); 
    }
    
    .form-row.single {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .field-block { 
      display: flex; 
      flex-direction: column; 
      gap: 6px; 
    }
    
    @media (min-width: 768px) {
      .form-layout { gap: 28px; }
      .form-row { gap: 24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1200px) {
      .form-layout { gap: 32px; }
      .form-row { gap: 28px; }
    }
  `]
})
export class MarketPostFormComponent {
  @Input() form!: FormGroup;

  setLocation(event: GeoSuggestion) {
    const value = this.formatValue(event);
    this.form.controls['location']?.setValue(value);
    this.form.controls['location']?.markAsTouched();
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