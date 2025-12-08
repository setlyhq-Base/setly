import { Component, inject, signal, effect } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UniversityLookupService, UniversityLite } from '../../core/services/university-lookup.service';
import { PostRoomStore } from './post-room.store';
import { US_STATES } from '../../shared/constants/us-states';
import { GooglePlaceInputComponent } from '../../shared/ui/google-place-input.component';
import { GeoSuggestion } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-room-details-step',
  standalone: true,
  imports: [FormsModule, CommonModule, GooglePlaceInputComponent],
  templateUrl: './room-details-step.component.html',
  styleUrls: ['./room-details-step.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class RoomDetailsStepComponent {
  private uniLookup = inject(UniversityLookupService);
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
  amenitySuggestions = ['High-speed Wi‑Fi','Heating','Study lamp','Closet space','In-unit laundry','Smart lock'];
  amenitiesError = signal('');
  environment = environment;

  showUniSuggestions = false;
  selectedUniversity = signal<UniversityLite | null>(null);
  universitySuggestions = signal<UniversityLite[]>([]);
  cityQuery = signal('');
  citySuggestions = signal<string[]>([]);
  selectedCity = signal<string>('');
  showCitySuggestions = signal(false);
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

      // University prefill skipped (dynamic list depends on selectedCity)
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

  onAddressPicked(addr: { address: string; lat?: number; lng?: number; components?: any }) {
    this.address = addr.address;
    this.lat = typeof addr.lat === 'number' ? addr.lat : this.lat;
    this.lon = typeof addr.lng === 'number' ? addr.lng : this.lon;
    this.store.updateDraft({ address: this.address, lat: this.lat, lon: this.lon });
    this.addressError.set(this.address && this.address.trim() ? '' : 'Address is required');
    
    // Extract city and state from address_components if available
    if (addr.components && Array.isArray(addr.components)) {
      const cityComp = addr.components.find((c: any) => c.types?.includes('locality'));
      const stateComp = addr.components.find((c: any) => c.types?.includes('administrative_area_level_1'));
      if (cityComp?.long_name) { this.city = cityComp.long_name; this.store.updateDraft({ city: this.city }); }
      if (stateComp?.short_name) { this.state = stateComp.short_name; this.store.updateDraft({ state: this.state }); }
    }
  }

  onUniversitySearch(query: string): void {
    this.universityQuery = query;
    if (query.trim().length < 2) { this.universitySuggestions.set([]); return; }
    const city = this.selectedCity();
    this.uniLookup.fetch(city || null, query.trim()).subscribe(list => {
      this.universitySuggestions.set(list);
      this.showUniSuggestions = true;
    });
  }

  onUniversityBlur(): void {
    setTimeout(() => this.showUniSuggestions = false, 200);
  }

  selectUniversity(uni: UniversityLite): void {
    this.selectedUniversity.set(uni);
    this.universityQuery = uni.name;
    this.showUniSuggestions = false;
    this.validateUniversity();
    this.store.updateDraft({ nearUniversityId: uni.id });
  }

  // City typeahead ---------------------------------------------------------
  onCityType(query: string): void {
    this.cityQuery.set(query);
    this.selectedCity.set('');
    if (query.trim().length < 2) { this.citySuggestions.set([]); return; }
    // Reuse geocoding service via fetch to backend geo endpoint for cities only
    fetch(`/api/geo/search?q=${encodeURIComponent(query.trim())}`).then(r => r.json()).then((data: any) => {
      const items: any[] = Array.isArray(data.items) ? data.items : [];
      const cities: string[] = items
        .filter(x => x && x.kind === 'city' && /US|United States/i.test(String(x.country || '')))
        .map(x => (x.city || x.label || '').trim())
        .filter((v: string) => !!v);
      const dedup: string[] = Array.from(new Set(cities)).slice(0, 8);
      this.citySuggestions.set(dedup);
      this.showCitySuggestions.set(true);
    }).catch(()=>{});
  }

  pickCity(city: string): void {
    this.selectedCity.set(city);
    this.cityQuery.set(city);
    this.showCitySuggestions.set(false);
    // Update draft city (state unknown here; user may still pick address later)
    this.city = city;
    this.store.updateDraft({ city: city });
    // Clear university selection to force re-filter
    this.selectedUniversity.set(null);
    this.store.updateDraft({ nearUniversityId: '' });
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

  hasAmenity(a: string): boolean {
    return this.store.draft().price.utilitiesIncluded.includes(a);
  }

  toggleAmenity(a: string): void {
    const list = [...this.store.draft().price.utilitiesIncluded];
    const idx = list.indexOf(a);
    if (idx >= 0) list.splice(idx,1); else list.push(a);
    this.store.updateDraftDeep('price', { ...this.store.draft().price, utilitiesIncluded: list });
    this.validateAmenities();
  }

  private validateAmenities(): void {
    const list = this.store.draft().price.utilitiesIncluded;
    this.amenitiesError.set(list.length ? '' : 'Please select at least one amenity');
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

  // Input focus/blur animations for premium feel
  onInputFocus(event: Event): void {
    const input = event.target as HTMLElement;
    input.closest('.mobile-input-wrapper')?.classList.add('focused');
  }

  onInputBlur(event: Event): void {
    const input = event.target as HTMLElement;
    input.closest('.mobile-input-wrapper')?.classList.remove('focused');
  }
}
