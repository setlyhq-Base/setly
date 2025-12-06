import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UniversityService, University } from '../../core/services/university.service';
import { PostRoomStore } from './post-room.store';
import { US_STATES } from '../../shared/constants/us-states';
import { AddressAutocompleteComponent } from '../../shared/ui/address-autocomplete.component';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';
import { GeoSuggestion } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-room-details-step',
  standalone: true,
  imports: [FormsModule, CommonModule, AddressAutocompleteComponent, LocationAutocompleteComponent],
  templateUrl: './room-details-step.component.html',
  styleUrls: ['./room-details-step.component.css']
})
export class RoomDetailsStepComponent {
  private universityService = inject(UniversityService);
  store = inject(PostRoomStore);

  title = '';
  description = '';
  address = '';
  city = '';
  state = '';
  universityQuery = '';
  roomType: 'private' | 'shared' | '' = '';
  bath: 'private' | 'shared' | '' = '';
  furnished = false;
  rules = { vegetarian: false, smoking: false, petsOk: false };
  distanceKm = 0;
  distanceMiles = 0;
  availableFrom = '';
  availableTo = '';
  lat: number | undefined;
  lon: number | undefined;
  showRules = signal<boolean>(false);

  showUniSuggestions = false;
  selectedUniversity = signal<University | null>(null);
  universitySuggestions = signal<University[]>([]);
  minDate = new Date().toISOString().split('T')[0];

  titleError = signal('');
  descriptionError = signal('');
  cityError = signal('');
  stateError = signal('');
  universityError = signal('');
  roomTypeError = signal('');
  bathError = signal('');
  availableFromError = signal('');
  addressError = signal('');

  usStates = US_STATES;

  constructor() {
    effect(() => {
      const draft = this.store.draft();
      this.title = draft.title;
      this.description = draft.description;
      this.city = draft.city;
      this.state = draft.state;
  this.address = (draft as any).address || '';
      this.roomType = draft.roomType;
      this.bath = draft.bath;
      this.furnished = draft.furnished;
      this.rules = { ...draft.rules };
      const d: any = draft as any;
      // Prefer stored miles; if legacy distanceKm exists use it to derive miles
      const legacyKm = (d.distanceKm !== undefined ? d.distanceKm : undefined);
      this.distanceMiles = typeof d.distanceMiles === 'number'
        ? d.distanceMiles
        : (typeof legacyKm === 'number' ? Math.round((legacyKm / 1.60934) * 10) / 10 : 0);
  this.availableFrom = draft.availableFrom;
  this.availableTo = (draft as any).availableTo || '';
  this.lat = typeof (d.lat) === 'number' ? d.lat : undefined;
  this.lon = typeof (d.lon) === 'number' ? d.lon : undefined;
  // Keep address error in sync if user clears it elsewhere
  this.addressError.set(this.address && this.address.trim() ? '' : 'Address is required');

      if (draft.nearUniversityId) {
        const uni = this.universityService.getById(draft.nearUniversityId);
        if (uni) {
          this.selectedUniversity.set(uni);
          this.universityQuery = uni.name;
        }
      }
    }, { allowSignalWrites: true });
  }

  toggleRules() { this.showRules.update(v => !v); }
  selectedRulesCount(): number { return Object.values(this.rules).filter(Boolean).length; }

  onTitleChange(value: string): void {
    this.validateTitle();
    this.store.updateDraft({ title: value });
  }

  onDescriptionChange(value: string): void {
    // Avoid huge base64 strings exploding localStorage quota in autosave
    // Keep the string as-is in memory, but the store will serialize more conservatively.
    this.validateDescription();
    this.store.updateDraft({ description: value });
  }

  onCityChange(value: string): void {
    this.validateCity();
    this.store.updateDraft({ city: value });
  }

  onStateChange(value: string): void {
    this.validateState();
    this.store.updateDraft({ state: value });
  }

  // If user later picks a city via dedicated autocomplete component (future), attach lat/lon too
  onLocationPicked(loc: GeoSuggestion) {
    const city = loc.kind === 'university' ? loc.label : (loc.city || loc.label);
    const state = loc.kind === 'university' ? (loc.country || '') : (loc.state || '');
    this.city = city;
    this.state = state;
    this.store.updateDraft({ city: this.city, state: this.state, lat: loc.lat, lon: loc.lon });
  }

  onAddressPicked(addr: { address: string; city?: string; state?: string; postcode?: string; lat?: number; lon?: number }) {
    this.address = addr.address;
    this.lat = typeof addr.lat === 'number' ? addr.lat : this.lat;
    this.lon = typeof addr.lon === 'number' ? addr.lon : this.lon;
    this.store.updateDraft({ address: this.address, lat: this.lat, lon: this.lon });
    this.addressError.set(this.address && this.address.trim() ? '' : 'Address is required');
    if (addr.city) { this.city = addr.city; this.store.updateDraft({ city: this.city }); }
    if (addr.state) { this.state = addr.state; this.store.updateDraft({ state: this.state }); }
  }

  onUniversitySearch(query: string): void {
    if (query.length >= 2) {
      const results = this.universityService.search(query);
      this.universitySuggestions.set(results);
      this.showUniSuggestions = true;
    } else {
      this.universitySuggestions.set([]);
    }
  }

  onUniversityBlur(): void {
    setTimeout(() => this.showUniSuggestions = false, 200);
  }

  selectUniversity(uni: University): void {
    this.selectedUniversity.set(uni);
    this.universityQuery = uni.name;
    this.showUniSuggestions = false;
    this.validateUniversity();
    this.store.updateDraft({ nearUniversityId: uni.id });
  }

  onRoomTypeChange(value: 'private' | 'shared'): void {
    this.validateRoomType();
    this.store.updateDraft({ roomType: value });
  }

  onBathChange(value: 'private' | 'shared'): void {
    this.validateBath();
    this.store.updateDraft({ bath: value });
  }

  onFurnishedChange(value: boolean): void {
    this.store.updateDraft({ furnished: value });
  }

  onRulesChange(): void {
    this.store.updateDraft({ rules: { ...this.rules } });
  }

  onDistanceChange(value: number): void {
    // Deprecated; keep for safety if template calls it
    this.distanceMiles = value / 1.60934;
    this.store.updateDraft({ distanceMiles: this.distanceMiles } as any);
  }

  onDistanceMilesChange(value: number): void {
    this.distanceMiles = value;
    this.store.updateDraft({ distanceMiles: value } as any);
  }

  onAvailableFromChange(value: string): void {
    this.validateAvailableFrom();
    this.store.updateDraft({ availableFrom: value });
  }

  onAvailableToChange(value: string): void {
    this.availableTo = value;
    this.store.updateDraft({ availableTo: value } as any);
  }

  private validateTitle(): void {
    if (!this.title) {
      this.titleError.set('Title is required');
    } else if (this.title.length < 10) {
      this.titleError.set('Title must be at least 10 characters');
    } else {
      this.titleError.set('');
    }
  }

  private validateDescription(): void {
    if (!this.description) {
      this.descriptionError.set('Description is required');
    } else if (this.description.length < 30) {
      this.descriptionError.set('Description must be at least 30 characters');
    } else if (this.description.length > 1200) {
      this.descriptionError.set('Description must not exceed 1200 characters');
    } else {
      this.descriptionError.set('');
    }
  }

  private validateCity(): void {
    this.cityError.set(this.city ? '' : 'City is required');
  }

  private validateState(): void {
    this.stateError.set(this.state ? '' : 'State is required');
  }

  private validateUniversity(): void {
    this.universityError.set(this.selectedUniversity() ? '' : 'University is required');
  }

  private validateRoomType(): void {
    this.roomTypeError.set(this.roomType ? '' : 'Room type is required');
  }

  private validateBath(): void {
    this.bathError.set(this.bath ? '' : 'Bathroom type is required');
  }

  private validateAvailableFrom(): void {
    if (!this.availableFrom) {
      this.availableFromError.set('Available date is required');
    } else if (new Date(this.availableFrom) < new Date(this.minDate)) {
      this.availableFromError.set('Date must be today or later');
    } else {
      this.availableFromError.set('');
    }
  }

  // Optional explicit validator if needed later
  private validateAddress(): void {
    this.addressError.set(this.address && this.address.trim() ? '' : 'Address is required');
  }
}
