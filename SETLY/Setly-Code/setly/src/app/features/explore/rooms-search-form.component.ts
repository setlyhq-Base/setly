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
      <div class="form-row single">
        <div class="field-block">
          <label class="field-label">Location</label>
          <span class="field-hint">City or university</span>
          <app-google-place-input
            [initialAddress]="form.controls['location']?.value || ''"
            (picked)="onLocationPicked($event)"
            placeholder="Search city or university"
          ></app-google-place-input>
          <p *ngIf="showError('location')" class="field-error">Location is required.</p>
        </div>
      </div>
      <div class="form-row three-cols">
        <div class="field-block">
          <label class="field-label">Check-in date</label>
          <span class="field-hint">mm/dd/yyyy</span>
          <input type="date" class="input-premium w-full" formControlName="checkIn" />
          <p *ngIf="showError('checkIn')" class="field-error">Select a check-in date.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Check-out date</label>
          <span class="field-hint">mm/dd/yyyy</span>
          <input type="date" class="input-premium w-full" formControlName="checkOut" />
          <p *ngIf="showError('checkOut')" class="field-error">Select a check-out date.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Room type</label>
          <select class="input-premium w-full" formControlName="roomType">
            <option value="shared">Shared</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout { display:flex; flex-direction:column; gap:20px; }
    .form-row { display:grid; gap:20px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.single { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.two-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.three-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .field-block { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:0.7rem; text-transform:uppercase; font-weight:600; color:#475569; letter-spacing:0.08em; line-height:1.2; }
  .field-hint { font-size:0.65rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-top:-2px; }
    .field-error { font-size:0.75rem; color:#e11d48; margin-top:4px; }
    @media (min-width: 768px) {
      .form-layout { gap:24px; }
      .form-row { gap:24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1200px) {
      .form-layout { gap:28px; }
      .form-row { gap:28px; }
      .form-row.three-cols { grid-template-columns: 1.05fr 1.05fr 0.9fr; }
    }
  `]
})
export class RoomsSearchFormComponent {
  @Input() form!: FormGroup;

  onLocationPicked(event: { address: string; lat?: number; lng?: number; components?: any }) {
    if (!this.form) return;
    this.form.controls['location']?.setValue(event.address);
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }
}