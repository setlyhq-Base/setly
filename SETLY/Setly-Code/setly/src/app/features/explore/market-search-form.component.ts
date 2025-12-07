import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceInputComponent } from '../../shared/ui/google-place-input.component';

@Component({
  selector: 'app-market-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GooglePlaceInputComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <!-- Search Term & Location Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium required">What Are You Looking For?</label>
          <span class="field-hint">Item name or keywords</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              class="input-premium w-full" 
              formControlName="term" 
              placeholder="Furniture, textbooks, electronics..."
              style="padding-left: 48px;"
            />
          </div>
          <p *ngIf="showError('term')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Search term required
          </p>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium">Location</label>
          <span class="field-hint">City or university</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            <app-google-place-input
              [initialAddress]="form.controls['location']?.value || ''"
              (picked)="setLocation($event)"
              placeholder="Search nearby"
            ></app-google-place-input>
          </div>
        </div>
      </div>

      <!-- Category & Price Range Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium">Category</label>
          <span class="field-hint">Filter by type</span>
          <div class="input-icon-wrapper icon-right">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M12 13V3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <input 
              type="text" 
              class="input-premium w-full" 
              formControlName="category" 
              placeholder="Books, electronics, furniture..."
              style="padding-left: 48px;"
            />
          </div>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium">Price Range</label>
          <span class="field-hint">Optional filter</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M10.5 8.5h4M10.5 15.5h4M12 8.5v7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              class="input-premium w-full" 
              formControlName="priceRange" 
              placeholder="$10 - $100"
              style="padding-left: 48px;"
            />
          </div>
          <div class="field-helper">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            E.g., $10 - $50 or under $100
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
export class MarketSearchFormComponent {
  @Input() form!: FormGroup;

  setLocation(event: { address: string; lat?: number; lng?: number; components?: any }) {
    this.form.controls['location']?.setValue(event.address);
    this.form.controls['location']?.markAsTouched();
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }
}