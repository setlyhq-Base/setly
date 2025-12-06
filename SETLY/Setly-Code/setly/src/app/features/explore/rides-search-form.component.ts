import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddressAutocompleteComponent } from '../../shared/ui/address-autocomplete.component';

@Component({
  selector: 'app-rides-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddressAutocompleteComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label">Pickup location</label>
          <app-address-autocomplete
            [initialAddress]="form.controls['pickup']?.value || ''"
            (picked)="setAddress('pickup', $event.address)"
            [placeholder]="'Enter pickup location'"
          ></app-address-autocomplete>
          <p *ngIf="showError('pickup')" class="field-error">Pickup location is required.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Destination</label>
          <app-address-autocomplete
            [initialAddress]="form.controls['destination']?.value || ''"
            (picked)="setAddress('destination', $event.address)"
            [placeholder]="'Enter destination'"
          ></app-address-autocomplete>
          <p *ngIf="showError('destination')" class="field-error">Destination is required.</p>
        </div>
      </div>
      <div class="form-row three-cols">
        <div class="field-block">
          <label class="field-label">Date</label>
          <input type="date" class="input-premium w-full" formControlName="date" />
          <p *ngIf="showError('date')" class="field-error">Select a date.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Time</label>
          <input type="time" class="input-premium w-full" formControlName="time" />
          <p *ngIf="showError('time')" class="field-error">Select a time.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Seats needed</label>
          <input type="number" class="input-premium w-full" formControlName="seats" min="1" max="4" />
          <p *ngIf="showError('seats')" class="field-error">Between 1 and 4 seats.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout { display:flex; flex-direction:column; gap:20px; }
    .form-row { display:grid; gap:20px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.two-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.three-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .field-block { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:0.7rem; text-transform:uppercase; font-weight:600; color:#475569; letter-spacing:0.08em; line-height:1.2; }
    .field-error { font-size:0.75rem; color:#e11d48; margin-top:4px; }
    @media (min-width: 768px) {
      .form-layout { gap:24px; }
      .form-row { gap:24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form-row.three-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (min-width: 1200px) {
      .form-layout { gap:28px; }
      .form-row { gap:28px; }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `]
})
export class RidesSearchFormComponent {
  @Input() form!: FormGroup;

  setAddress(control: 'pickup' | 'destination', value: string) {
    this.form.controls[control]?.setValue(value);
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }
}