import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddressAutocompleteComponent } from '../../shared/ui/address-autocomplete.component';
import { ImageUploaderComponent } from '../../shared/ui/image-uploader.component';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';
import { AddressSuggestion, GeoSuggestion } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-rooms-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocationAutocompleteComponent, AddressAutocompleteComponent, ImageUploaderComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label">City</label>
          <app-location-autocomplete
            [initialCity]="form.controls['city']?.value || ''"
            [initialState]="form.controls['state']?.value || ''"
            [placeholder]="'Search US city'"
            (picked)="onCityPicked($event)"
          ></app-location-autocomplete>
          <p *ngIf="showError('city')" class="field-error">Please select a city.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Room address</label>
          <app-address-autocomplete
            [initialAddress]="form.controls['address']?.value || ''"
            [placeholder]="'Enter full address'"
            [biasCity]="form.controls['city']?.value || ''"
            [biasState]="form.controls['state']?.value || ''"
            [biasLat]="form.controls['cityLat']?.value"
            [biasLon]="form.controls['cityLon']?.value"
            (picked)="onAddressPicked($event)"
          ></app-address-autocomplete>
          <p *ngIf="showError('address')" class="field-error">Please enter the full address.</p>
        </div>
      </div>

      <div class="form-row three-cols">
        <div class="field-block">
          <label class="field-label">Room type</label>
          <select class="input-premium w-full" formControlName="roomType">
            <option value="shared">Shared</option>
            <option value="private">Private</option>
            <option value="studio">Studio</option>
            <option value="1br">1 Bedroom</option>
            <option value="2br">2 Bedroom</option>
          </select>
          <p *ngIf="showError('roomType')" class="field-error">Please select a room type.</p>
        </div>
        <div class="field-block">
          <label class="field-label">Price per month</label>
          <input type="number" class="input-premium w-full" formControlName="price" min="0" inputmode="numeric" />
          <p *ngIf="showError('price')" class="field-error">Enter a valid monthly price.</p>
        </div>
        <div class="field-block amenities-field">
          <label class="field-label">Amenities</label>
          <button type="button" class="amenities-trigger input-premium w-full" [class.invalid]="showError('amenities')" (click)="toggleAmenitiesDropdown()" #amenitiesTrigger>
            <span class="amenities-summary">{{ amenitiesSummary }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.47 6.22a.75.75 0 0 1 1.06 0L8 8.69l2.47-2.47a.75.75 0 1 1 1.06 1.06L8.53 10.78a.75.75 0 0 1-1.06 0L4.47 7.28a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>
          </button>
          <div class="amenities-menu" *ngIf="amenitiesDropdownOpen" #amenitiesMenu>
            <label class="amenity-option" *ngFor="let option of amenityOptions">
              <input type="checkbox" [checked]="isAmenitySelected(option.value)" (change)="toggleAmenity(option.value)" />
              <span>{{ option.label }}</span>
            </label>
          </div>
          <p *ngIf="showError('amenities')" class="field-error">Select at least one amenity.</p>
        </div>
      </div>

      <div class="form-row description-row">
        <div class="field-block">
          <label class="field-label">Description</label>
          <textarea class="input-premium w-full" rows="4" formControlName="description" placeholder="Share details about the room, lease terms, roommates..."></textarea>
        </div>
        <div class="field-block uploader-block">
          <label class="field-label">Upload photos</label>
          <app-image-uploader
            formControlName="photos"
            [maxImages]="10"
            [variant]="'circle'"
            [helperPrimary]="'Add at least 3 photos'"
            [helperSecondary]="'Max 10 • JPG, PNG, WebP'"
          ></app-image-uploader>
          <p *ngIf="showError('photos')" class="field-error">Please add at least 3 photos.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-layout { display:flex; flex-direction:column; gap:20px; }
    .form-row { display:grid; gap:20px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.two-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .form-row.three-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .description-row { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .field-block { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:0.7rem; text-transform:uppercase; font-weight:600; color:#475569; letter-spacing:0.08em; line-height:1.2; }
  .field-error { font-size:0.75rem; color:#e11d48; margin-top:4px; }
  textarea { min-height:132px; resize:vertical; }
    .amenities-field { position:relative; }
  .amenities-trigger { display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer; }
    .amenities-trigger svg { flex-shrink:0; }
    .amenities-summary { font-size:0.95rem; color:#1f2937; }
  .amenities-trigger.invalid { border-color:#f97373; box-shadow:0 0 0 1px rgba(248,113,113,0.25); }
    .amenities-menu {
      position:absolute;
      top:calc(100% + 8px);
      right:0;
      min-width:240px;
      background:#fff;
      border:1px solid rgba(148,163,184,0.4);
      border-radius:14px;
      box-shadow:0 18px 40px -26px rgba(15,23,42,0.4);
      padding:12px;
      display:flex;
      flex-direction:column;
      gap:8px;
      z-index:50;
    }
    .amenity-option { display:flex; align-items:center; gap:10px; font-size:0.92rem; color:#334155; cursor:pointer; }
    .amenity-option input { width:16px; height:16px; }
    .uploader-block { display:flex; flex-direction:column; gap:10px; align-items:flex-start; }

    @media (min-width: 768px) {
      .form-layout { gap:24px; }
      .form-row { gap:24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .description-row { grid-template-columns: 2fr 1fr; align-items:start; }
    }
    @media (min-width: 1200px) {
      .form-layout { gap:28px; }
      .form-row { gap:28px; }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 767px) {
      .amenities-field { position:static; }
      .amenities-menu {
        position:static;
        margin-top:8px;
        width:100%;
        max-height:240px;
        overflow-y:auto;
      }
    }
  `]
})
export class RoomsPostFormComponent {
  @Input() form!: FormGroup;
  @ViewChild('amenitiesMenu') private amenitiesMenu?: ElementRef<HTMLDivElement>;
  @ViewChild('amenitiesTrigger') private amenitiesTrigger?: ElementRef<HTMLButtonElement>;

  amenityOptions = [
    { value: 'wifi', label: 'Wi-Fi' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'climate', label: 'Heating / AC' },
    { value: 'parking', label: 'Parking' },
    { value: 'furnished', label: 'Furnished' },
    { value: 'utilities', label: 'Utilities included' }
  ];
  amenitiesDropdownOpen = false;

  onCityPicked(event: GeoSuggestion) {
    if (!this.form) return;
  const cityLabel = event?.city || event?.label || '';
    const cityControl = this.form.controls['city'];
    if (cityControl) {
      cityControl.setValue(cityLabel);
      cityControl.markAsDirty();
      cityControl.markAsTouched();
    }
    const stateControl = this.form.controls['state'];
    if (stateControl) stateControl.setValue(event?.state || '');
    const latControl = this.form.controls['cityLat'];
    if (latControl) latControl.setValue(event?.lat ?? null);
    const lonControl = this.form.controls['cityLon'];
    if (lonControl) lonControl.setValue(event?.lon ?? null);

    const addressControl = this.form.controls['address'];
    if (addressControl) {
      addressControl.setValue('');
      addressControl.markAsPristine();
      addressControl.markAsUntouched();
    }
    const addressLatControl = this.form.controls['addressLat'];
    if (addressLatControl) addressLatControl.setValue(null);
    const addressLonControl = this.form.controls['addressLon'];
    if (addressLonControl) addressLonControl.setValue(null);
  }

  onAddressPicked(event: AddressSuggestion) {
    if (!this.form) return;
    const addressLabel = event?.address || event?.label;
    const addressControl = this.form.controls['address'];
    if (addressLabel !== undefined && addressControl) {
      addressControl.setValue(addressLabel);
      addressControl.markAsDirty();
      addressControl.markAsTouched();
    }
    const latControl = this.form.controls['addressLat'];
    if (latControl) latControl.setValue(event?.lat ?? null);
    const lonControl = this.form.controls['addressLon'];
    if (lonControl) lonControl.setValue(event?.lon ?? null);
    if (!this.form.controls['city']?.value && event?.city) {
      this.form.patchValue({
        city: event.city,
        state: event?.state || ''
      });
    }
  }

  showError(control: string) {
    const c = this.form?.controls?.[control];
    return c && c.invalid && (c.dirty || c.touched);
  }

  toggleAmenitiesDropdown() {
    this.amenitiesDropdownOpen = !this.amenitiesDropdownOpen;
  }

  isAmenitySelected(value: string): boolean {
    const selected = this.form?.controls?.['amenities']?.value;
    return Array.isArray(selected) ? selected.includes(value) : false;
  }

  toggleAmenity(value: string) {
    const control = this.form?.controls?.['amenities'];
    if (!control) return;
    const current = Array.isArray(control.value) ? [...control.value] : [];
    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    control.setValue(current);
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity({ emitEvent: false });
  }

  get amenitiesSummary(): string {
    const control = this.form?.controls?.['amenities'];
    const raw = control?.value;
    const selected = Array.isArray(raw) ? raw as string[] : [];
    if (!selected.length) return 'Select amenities';
    const labels = this.amenityOptions
      .filter(option => selected.includes(option.value))
      .map(option => option.label);
    if (labels.length <= 2) return labels.join(', ');
    return `${labels.length} selected`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.amenitiesDropdownOpen) return;
    const target = event.target as Node;
    if (this.amenitiesMenu?.nativeElement.contains(target) || this.amenitiesTrigger?.nativeElement.contains(target)) {
      return;
    }
    this.amenitiesDropdownOpen = false;
  }
}