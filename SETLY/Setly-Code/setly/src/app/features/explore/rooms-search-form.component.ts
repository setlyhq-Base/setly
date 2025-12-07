import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceInputComponent } from '../../shared/ui/google-place-input.component';

@Component({
  selector: 'app-rooms-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GooglePlaceInputComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <!-- Location Field with Icon -->
      <div class="form-row single">
        <div class="field-block">
          <label class="field-label-premium required">Location</label>
          <span class="field-hint">Search by city or university</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            <app-google-place-input
              [initialAddress]="form.controls['location']?.value || ''"
              (picked)="onLocationPicked($event)"
              placeholder="Enter city or university"
            ></app-google-place-input>
          </div>
          <p *ngIf="showError('location')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Location is required
          </p>
        </div>
      </div>

      <!-- Date Range + Room Type Row -->
      <div class="form-row three-cols">
        <!-- Check-in Date -->
        <div class="field-block">
          <label class="field-label-premium required">Check-In</label>
          <span class="field-hint">Move-in date</span>
          <div class="input-icon-wrapper icon-right">
            <input 
              type="date" 
              class="input-premium w-full" 
              formControlName="checkIn"
              [min]="today"
            />
            <svg class="input-icon-right" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p *ngIf="showError('checkIn')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Check-in date required
          </p>
        </div>

        <!-- Check-out Date -->
        <div class="field-block">
          <label class="field-label-premium required">Check-Out</label>
          <span class="field-hint">Move-out date</span>
          <div class="input-icon-wrapper icon-right">
            <input 
              type="date" 
              class="input-premium w-full" 
              formControlName="checkOut"
              [min]="form.controls['checkIn']?.value || today"
            />
            <svg class="input-icon-right" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p *ngIf="showError('checkOut')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Check-out date required
          </p>
        </div>

        <!-- Room Type -->
        <div class="field-block">
          <label class="field-label-premium">Room Type</label>
          <span class="field-hint">Select preference</span>
          <div class="input-icon-wrapper icon-right">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10l9-7 9 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <select class="select-premium w-full" formControlName="roomType" style="padding-left: 48px;">
              <option value="">Any type</option>
              <option value="shared">Shared Room</option>
              <option value="private">Private Room</option>
              <option value="studio">Studio</option>
              <option value="1br">1 Bedroom</option>
              <option value="2br">2 Bedroom</option>
            </select>
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
    
    .form-row.single { 
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
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1200px) {
      .form-layout { gap: 32px; }
      .form-row { gap: 28px; }
      .form-row.three-cols { grid-template-columns: 1fr 1fr 0.9fr; }
    }
  `]
})
export class RoomsSearchFormComponent {
  @Input() form!: FormGroup;

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  onLocationPicked(event: { address: string; lat?: number; lng?: number; components?: any }) {
    if (!this.form) return;
    this.form.controls['location']?.setValue(event.address);
    this.form.controls['location']?.markAsTouched();
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }
}