import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceInputComponent } from '../../shared/ui/google-place-input.component';

@Component({
  selector: 'app-rides-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GooglePlaceInputComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <!-- Pickup & Destination Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium required">Pickup Location</label>
          <span class="field-hint">Where you'll be picked up</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="2 3"/>
            </svg>
            <app-google-place-input
              [initialAddress]="form.controls['pickup']?.value || ''"
              (picked)="setAddress('pickup', $event.address)"
              placeholder="Enter pickup location"
            ></app-google-place-input>
          </div>
          <p *ngIf="showError('pickup')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Pickup location is required
          </p>
        </div>
        <div class="field-block">
          <label class="field-label-premium required">Destination</label>
          <span class="field-hint">Where you're going</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            <app-google-place-input
              [initialAddress]="form.controls['destination']?.value || ''"
              (picked)="setAddress('destination', $event.address)"
              placeholder="Enter destination"
            ></app-google-place-input>
          </div>
          <p *ngIf="showError('destination')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Destination is required
          </p>
        </div>
      </div>

      <!-- Date, Time & Seats Row -->
      <div class="form-row three-cols">
        <div class="field-block">
          <label class="field-label-premium required">Ride Date</label>
          <span class="field-hint">When you need the ride</span>
          <div class="input-icon-wrapper icon-right">
            <input 
              type="date" 
              class="input-premium w-full" 
              formControlName="date"
              [min]="today"
            />
            <svg class="input-icon-right" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p *ngIf="showError('date')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Date is required
          </p>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium required">Time</label>
          <span class="field-hint">Preferred departure time</span>
          <div class="input-icon-wrapper icon-right">
            <input 
              type="time" 
              class="input-premium w-full" 
              formControlName="time"
            />
            <svg class="input-icon-right" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p *ngIf="showError('time')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Time is required
          </p>
        </div>
        
        <div class="field-block">
          <label class="field-label-premium required">Seats Needed</label>
          <span class="field-hint">Number of passengers</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              type="number" 
              class="input-premium w-full no-spinner" 
              formControlName="seats" 
              min="1" 
              max="4"
              placeholder="1-4"
              style="padding-left: 48px;"
            />
          </div>
          <p *ngIf="showError('seats')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Enter 1-4 seats
          </p>
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
    
    .form-row.three-cols { 
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
      .form-row.three-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1200px) {
      .form-layout { gap: 32px; }
      .form-row { gap: 28px; }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `]
})
export class RidesSearchFormComponent {
  @Input() form!: FormGroup;

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  setAddress(control: 'pickup' | 'destination', value: string) {
    this.form.controls[control]?.setValue(value);
    this.form.controls[control]?.markAsTouched();
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }
}