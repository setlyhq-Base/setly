import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceInputComponent } from '../../shared/ui/google-place-input.component';
import { UploadsService } from '../../core/services/uploads.service';
import { environment } from '../../../environments/environment';
import { ImageUploaderComponent } from '../../shared/ui/image-uploader.component';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';
import { GeoSuggestion } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-rooms-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocationAutocompleteComponent, GooglePlaceInputComponent, ImageUploaderComponent],
  template: `
    <div [formGroup]="form" class="form-layout">
      <!-- City and Address Row -->
      <div class="form-row two-cols">
        <div class="field-block">
          <label class="field-label-premium required">City</label>
          <span class="field-hint">Select your US city</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <app-location-autocomplete
              [initialCity]="form.controls['city']?.value || ''"
              [initialState]="form.controls['state']?.value || ''"
              [placeholder]="'Search city'"
              (picked)="onCityPicked($event)"
            ></app-location-autocomplete>
          </div>
          <p *ngIf="showError('city')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            City is required
          </p>
        </div>
        <div class="field-block">
          <label class="field-label-premium required">Street Address</label>
          <span class="field-hint">Full room address</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            <app-google-place-input
              [initialAddress]="form.controls['address']?.value || ''"
              (picked)="onAddressPicked($event)"
              placeholder="Enter address"
            ></app-google-place-input>
          </div>
          <p *ngIf="showError('address')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Address is required
          </p>
        </div>
      </div>

      <!-- Room Type, Price & Amenities Row -->
      <div class="form-row three-cols">
        <!-- Room Type -->
        <div class="field-block">
          <label class="field-label-premium required">Room Type</label>
          <span class="field-hint">Select category</span>
          <div class="input-icon-wrapper icon-right">
            <svg class="input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11h10M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <select class="select-premium w-full" formControlName="roomType" style="padding-left: 48px;">
              <option value="">Select type</option>
              <option value="shared">Shared Room</option>
              <option value="private">Private Room</option>
              <option value="studio">Studio</option>
              <option value="1br">1 Bedroom</option>
              <option value="2br">2 Bedroom</option>
            </select>
          </div>
          <p *ngIf="showError('roomType')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Room type required
          </p>
        </div>

        <!-- Price -->
        <div class="field-block">
          <label class="field-label-premium required">Monthly Rent</label>
          <span class="field-hint">Price in USD</span>
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
              placeholder="1200"
              inputmode="numeric" 
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

        <!-- Amenities -->
        <div class="field-block amenities-field">
          <label class="field-label-premium required">Amenities</label>
          <span class="field-hint">Select features</span>
          <button type="button" class="amenities-trigger input-premium w-full" [class.error]="showError('amenities')" (click)="toggleAmenitiesDropdown()" #amenitiesTrigger>
            <span class="amenities-summary">{{ amenitiesSummary }}</span>
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.47 6.22a.75.75 0 0 1 1.06 0L8 8.69l2.47-2.47a.75.75 0 1 1 1.06 1.06L8.53 10.78a.75.75 0 0 1-1.06 0L4.47 7.28a.75.75 0 0 1 0-1.06Z" fill="currentColor"/>
            </svg>
          </button>
          <div class="amenities-menu-premium" *ngIf="amenitiesDropdownOpen" #amenitiesMenu>
            <label class="checkbox-premium-wrapper" *ngFor="let option of amenityOptions">
              <input 
                type="checkbox" 
                class="checkbox-premium"
                [checked]="isAmenitySelected(option.value)" 
                (change)="toggleAmenity(option.value)" 
              />
              <span class="checkbox-premium-label">{{ option.label }}</span>
            </label>
          </div>
          <p *ngIf="showError('amenities')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Select at least one
          </p>
        </div>
      </div>

      <!-- Description & Photos Row -->
      <div class="form-row description-row">
        <div class="field-block">
          <label class="field-label-premium">Description</label>
          <span class="field-hint">Share details about your room</span>
          <textarea 
            class="textarea-premium w-full" 
            rows="5" 
            formControlName="description" 
            placeholder="Describe the room, lease terms, roommate preferences, and any special features..."
          ></textarea>
          <div class="field-helper">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Include details that help renters make a decision
          </div>
        </div>
        
        <div class="field-block uploader-block">
          <label class="field-label-premium required">Photos</label>
          <span class="field-hint">Add images of the room</span>
          <app-image-uploader
            formControlName="photos"
            [maxImages]="10"
            [variant]="'circle'"
            [helperPrimary]="'Add at least 3 photos'"
            [helperSecondary]="'Max 10 • JPG, PNG, WebP'"
          ></app-image-uploader>
          <p *ngIf="showError('photos')" class="field-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-1 0zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
            </svg>
            Add at least 3 photos
          </p>
          
          <!-- Optional Video Upload -->
          <div *ngIf="featureVideo" class="mt-4 space-y-2">
            <label class="field-label-premium">Room Video (Optional)</label>
            <input #videoInput type="file" accept="video/*" (change)="onVideoSelected($event)" class="input-premium" />
            <div class="flex flex-wrap gap-3" *ngIf="videos.length">
              <div class="relative" *ngFor="let v of videos; let i = index">
                <video [src]="v.url" class="w-32 h-20 object-cover rounded-lg" muted playsinline></video>
                <button type="button" class="absolute top-1 right-1 bg-black/50 text-white text-xs rounded px-1" (click)="removeVideo(i)">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Form Layout */
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
    
    .description-row { 
      grid-template-columns: repeat(1, minmax(0, 1fr)); 
    }
    
    .field-block { 
      display: flex; 
      flex-direction: column; 
      gap: 6px; 
    }
    
    /* Amenities Dropdown - Premium Style */
    .amenities-field { 
      position: relative; 
    }
    
    .amenities-trigger { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      gap: 12px; 
      cursor: pointer; 
      text-align: left;
    }
    
    .amenities-trigger svg { 
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }
    
    .amenities-trigger:hover svg {
      transform: translateY(2px);
    }
    
    .amenities-summary { 
      font-size: 0.9375rem; 
      color: #1f2937; 
      font-weight: 500;
    }
    
    .amenities-menu-premium {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1.5px solid #e5e7eb;
      border-radius: 14px;
      box-shadow: 
        0 12px 32px -8px rgba(0, 0, 0, 0.12),
        0 4px 12px rgba(0, 0, 0, 0.06);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 50;
      animation: dropdownSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes dropdownSlideIn {
      0% {
        opacity: 0;
        transform: translateY(-8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .uploader-block { 
      display: flex; 
      flex-direction: column; 
      gap: 10px; 
      align-items: flex-start; 
    }

    /* Responsive Grid */
    @media (min-width: 768px) {
      .form-layout { gap: 28px; }
      .form-row { gap: 24px; }
      .form-row.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form-row.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .description-row { 
        grid-template-columns: 1.8fr 1fr; 
        align-items: start; 
      }
    }
    
    @media (min-width: 1200px) {
      .form-layout { gap: 32px; }
      .form-row { gap: 28px; }
      .form-row.three-cols { grid-template-columns: 1fr 1fr 1fr; }
    }
    
    /* Mobile Adjustments */
    @media (max-width: 767px) {
      .amenities-field { position: static; }
      
      .amenities-menu-premium {
        position: static;
        margin-top: 8px;
        width: 100%;
        max-height: 280px;
        overflow-y: auto;
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

  featureVideo = (environment as any)?.featureFlags?.enableRoomVideo === true;
  private uploads = inject(UploadsService);
  videos: { url: string }[] = [];

  onVideoSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
  this.uploads.uploadRoomMedia('room-video', file, this.form.controls['roomId']?.value).then((up: { url: string }) => {
      this.videos.push({ url: up.url });
      // Store in form if control exists
      const ctrl = this.form.controls['videos'];
      if (ctrl) {
        const current = Array.isArray(ctrl.value) ? [...ctrl.value] : [];
        current.push(up.url);
        ctrl.setValue(current);
        ctrl.markAsDirty();
      }
  }).catch((err: any) => {
      console.warn('[rooms-post-form] video upload failed', err);
    });
  }

  removeVideo(i: number) {
    this.videos.splice(i,1);
    const ctrl = this.form.controls['videos'];
    if (ctrl) {
      const current = Array.isArray(ctrl.value) ? [...ctrl.value] : [];
      current.splice(i,1);
      ctrl.setValue(current);
      ctrl.markAsDirty();
    }
  }
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

  onAddressPicked(event: { address: string; lat?: number; lng?: number; components?: any }) {
    if (!this.form) return;
    const addressControl = this.form.controls['address'];
    if (addressControl) {
      addressControl.setValue(event.address);
      addressControl.markAsDirty();
      addressControl.markAsTouched();
    }
    const latControl = this.form.controls['addressLat'];
    if (latControl) latControl.setValue(event.lat ?? null);
    const lonControl = this.form.controls['addressLon'];
    if (lonControl) lonControl.setValue(event.lng ?? null);
    
    // Auto-populate city and state from address components if not already set
    if (!this.form.controls['city']?.value && event.components) {
      const cityComponent = event.components.find((c: any) => 
        c.types?.includes('locality') || c.types?.includes('postal_town')
      );
      const stateComponent = event.components.find((c: any) => 
        c.types?.includes('administrative_area_level_1')
      );
      
      if (cityComponent) {
        this.form.patchValue({
          city: cityComponent.long_name,
          state: stateComponent?.short_name || ''
        });
      }
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