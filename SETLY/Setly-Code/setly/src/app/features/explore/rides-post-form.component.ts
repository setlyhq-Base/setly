import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddressAutocompleteComponent } from '../../shared/ui/address-autocomplete.component';

@Component({
  selector: 'app-rides-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddressAutocompleteComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label">Pickup location</label>
          <app-address-autocomplete
            [initialAddress]="form.controls['pickup']?.value || ''"
            (picked)="setControl('pickup', $event.address)"
            [placeholder]="'Enter pickup location'"
          ></app-address-autocomplete>
          <p *ngIf="showError('pickup')" class="field-error">Pickup location is required.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Destination</label>
          <app-address-autocomplete
            [initialAddress]="form.controls['destination']?.value || ''"
            (picked)="setControl('destination', $event.address)"
            [placeholder]="'Enter destination'"
          ></app-address-autocomplete>
          <p *ngIf="showError('destination')" class="field-error">Destination is required.</p>
        </div>
      </div>
      <div class="form-row three-cols">
        <div class="field-block">
          <label class="field-label">Date &amp; time</label>
          <input type="datetime-local" class="input-premium w-full" formControlName="departure" />
          <p *ngIf="showError('departure')" class="field-error">Choose a departure date and time.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Seats available</label>
          <input type="number" class="input-premium w-full" formControlName="seatsAvailable" min="1" max="4" />
          <p *ngIf="showError('seatsAvailable')" class="field-error">Between 1 and 4 seats.</p>
        </div>
        <div class="field-block luggage-block">
          <label class="field-label">&nbsp;</label>
          <label class="checkbox">
            <input type="checkbox" formControlName="luggage" />
            <span>Luggage allowed</span>
          </label>
        </div>
      </div>
      <div class="form-row single">
        <div class="field-block">
          <label class="field-label">Notes</label>
          <textarea class="input-premium w-full" rows="3" formControlName="notes" placeholder="Add helpful details"></textarea>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout { display:flex; flex-direction:column; gap:20px; }
    .form-row { display:grid; gap:20px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.two-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.three-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); align-items:end; }
    .field-block { display:flex; flex-direction:column; gap:6px; }
    .checkbox { display:flex; align-items:center; gap:10px; font-size:0.9rem; color:#4b5563; padding:10px 12px; border-radius:16px; border:1px dashed rgba(148,163,184,0.35); transition:border-color .18s, background .18s; }
    .checkbox:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.06); }
    .luggage-block .field-label { display:none; }
    .field-label { font-size:0.7rem; text-transform:uppercase; font-weight:600; color:#475569; letter-spacing:0.08em; line-height:1.2; }
    .field-error { font-size:0.75rem; color:#e11d48; margin-top:4px; }
    textarea { min-height:120px; resize:vertical; }
    @media (min-width: 768px) {
      .form-layout { gap:24px; }
      .form-row { gap:24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form-row.three-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .checkbox { padding:12px 16px; }
    }
    @media (min-width: 1200px) {
      .form-layout { gap:28px; }
      .form-row { gap:28px; }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `]
})
export class RidesPostFormComponent {
  @Input() form!: FormGroup;

  setControl(control: 'pickup' | 'destination', value: string) {
    this.form.controls[control]?.setValue(value);
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }
}