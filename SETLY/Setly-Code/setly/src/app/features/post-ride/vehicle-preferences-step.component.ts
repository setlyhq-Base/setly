import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostRideStore } from './post-ride.store';

@Component({
  selector: 'app-vehicle-preferences-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Premium Mobile-First Vehicle & Preferences -->
    <div class="mobile-wizard-content">
      
      <!-- Intro Card -->
      <div class="section-intro-card">
        <div class="intro-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7.5" cy="17" r="1.5" fill="currentColor"/>
            <circle cx="16.5" cy="17" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <h2 class="intro-title">Vehicle & Preferences</h2>
        <p class="intro-subtitle">Tell passengers about your car and ride style</p>
      </div>

      <!-- Section: Vehicle Info -->
      <div class="form-section">
        <h3 class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="section-icon">
            <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="currentColor" stroke-width="2"/>
          </svg>
          Your Vehicle
        </h3>

        <!-- Car Model -->
        <div class="mobile-field-group">
          <label for="carModel" class="mobile-label">
            Car Model <span class="text-gray-400">(Optional)</span>
          </label>
          <div class="mobile-input-wrapper">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4l2.5-4h7l2.5 4v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <input 
              id="carModel"
              type="text"
              class="mobile-input"
              placeholder="e.g., Honda Civic, Toyota Camry"
              [value]="store.carModel()"
              (input)="onCarModelChange($any($event.target).value)"
              data-testid="pr-car-model" />
          </div>
          <p class="field-hint">Helps passengers identify your car</p>
        </div>

        <!-- Car Type -->
        <div class="mobile-field-group">
          <label class="mobile-label">Car Type</label>
          <div class="car-type-grid">
            <button 
              type="button"
              class="car-type-card"
              [class.selected]="store.carType() === 'sedan'"
              (click)="onCarTypeChange('sedan')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4l2.5-4h7l2.5 4v4c0 1.1-.9 2-2 2" stroke="currentColor" stroke-width="2"/>
                <circle cx="7" cy="17" r="1" fill="currentColor"/>
                <circle cx="17" cy="17" r="1" fill="currentColor"/>
              </svg>
              <span>Sedan</span>
            </button>
            <button 
              type="button"
              class="car-type-card"
              [class.selected]="store.carType() === 'suv'"
              (click)="onCarTypeChange('suv')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-5l2.5-3h7l2.5 3v5c0 1.1-.9 2-2 2" stroke="currentColor" stroke-width="2"/>
                <rect x="7" y="8" width="10" height="3" stroke="currentColor" stroke-width="2"/>
                <circle cx="7" cy="17" r="1" fill="currentColor"/>
                <circle cx="17" cy="17" r="1" fill="currentColor"/>
              </svg>
              <span>SUV</span>
            </button>
            <button 
              type="button"
              class="car-type-card"
              [class.selected]="store.carType() === 'van'"
              (click)="onCarTypeChange('van')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="8" width="16" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
                <path d="M4 12h16M8 8v9M12 8v9M16 8v9" stroke="currentColor" stroke-width="2"/>
                <circle cx="7" cy="17" r="1" fill="currentColor"/>
                <circle cx="17" cy="17" r="1" fill="currentColor"/>
              </svg>
              <span>Van</span>
            </button>
            <button 
              type="button"
              class="car-type-card"
              [class.selected]="store.carType() === 'hatchback'"
              (click)="onCarTypeChange('hatchback')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 17h12M5 17c-1.1 0-2-.9-2-2v-4l2-3h6l2 3v4c0 1.1-.9 2-2 2" stroke="currentColor" stroke-width="2"/>
                <path d="M17 8l-2 2-2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="7" cy="17" r="1" fill="currentColor"/>
                <circle cx="15" cy="17" r="1" fill="currentColor"/>
              </svg>
              <span>Hatchback</span>
            </button>
          </div>
        </div>

        <!-- Luggage Space -->
        <div class="mobile-field-group">
          <label class="mobile-label">Luggage Space</label>
          <div class="segmented-control">
            <button 
              type="button"
              class="segment"
              [class.active]="store.luggageSpace() === 'small'"
              (click)="onLuggageSpaceChange('small')">
              <div class="segment-content">
                <div class="segment-title">Small</div>
                <div class="segment-subtitle">Backpack</div>
              </div>
            </button>
            <button 
              type="button"
              class="segment"
              [class.active]="store.luggageSpace() === 'medium'"
              (click)="onLuggageSpaceChange('medium')">
              <div class="segment-content">
                <div class="segment-title">Medium</div>
                <div class="segment-subtitle">1-2 bags</div>
              </div>
            </button>
            <button 
              type="button"
              class="segment"
              [class.active]="store.luggageSpace() === 'large'"
              (click)="onLuggageSpaceChange('large')">
              <div class="segment-content">
                <div class="segment-title">Large</div>
                <div class="segment-subtitle">3+ bags</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Section: Ride Preferences -->
      <div class="form-section">
        <h3 class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="section-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          Preferences
        </h3>

        <!-- Smoking Allowed -->
        <div class="mobile-field-group">
          <div class="toggle-row">
            <div class="toggle-label-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="toggle-icon">
                <path d="M2 12h20M7 7l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <div>
                <div class="toggle-label">Smoking Allowed</div>
                <div class="toggle-sublabel">Can passengers smoke in vehicle?</div>
              </div>
            </div>
            <label class="ios-toggle">
              <input 
                type="checkbox"
                class="ios-toggle-input"
                [checked]="store.smokingAllowed()"
                (change)="onSmokingAllowedChange($any($event.target).checked)" />
              <span class="ios-toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Pets Allowed -->
        <div class="mobile-field-group">
          <div class="toggle-row">
            <div class="toggle-label-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="toggle-icon">
                <path d="M12 10a3 3 0 100-6 3 3 0 000 6zM12 12a8 8 0 00-8 8h16a8 8 0 00-8-8z" fill="currentColor"/>
              </svg>
              <div>
                <div class="toggle-label">Pets Allowed</div>
                <div class="toggle-sublabel">OK with small pets?</div>
              </div>
            </div>
            <label class="ios-toggle">
              <input 
                type="checkbox"
                class="ios-toggle-input"
                [checked]="store.petsAllowed()"
                (change)="onPetsAllowedChange($any($event.target).checked)" />
              <span class="ios-toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Music Preference -->
        <div class="mobile-field-group">
          <label class="mobile-label">Music Preference</label>
          <div class="segmented-control">
            <button 
              type="button"
              class="segment"
              [class.active]="store.musicPreference() === 'quiet'"
              (click)="onMusicPreferenceChange('quiet')">
              <div class="segment-content">
                <div class="segment-title">Quiet</div>
                <div class="segment-subtitle">🤫</div>
              </div>
            </button>
            <button 
              type="button"
              class="segment"
              [class.active]="store.musicPreference() === 'moderate'"
              (click)="onMusicPreferenceChange('moderate')">
              <div class="segment-content">
                <div class="segment-title">Moderate</div>
                <div class="segment-subtitle">🎵</div>
              </div>
            </button>
            <button 
              type="button"
              class="segment"
              [class.active]="store.musicPreference() === 'lively'"
              (click)="onMusicPreferenceChange('lively')">
              <div class="segment-content">
                <div class="segment-title">Lively</div>
                <div class="segment-subtitle">🎉</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Section: Additional Notes -->
      <div class="form-section">
        <h3 class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="section-icon">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Notes for Passengers
        </h3>

        <div class="mobile-field-group">
          <label for="notes" class="mobile-label">
            Additional Information <span class="text-gray-400">(Optional)</span>
          </label>
          <div class="mobile-textarea-wrapper">
            <textarea 
              id="notes"
              rows="4"
              class="mobile-textarea"
              placeholder="Any additional details passengers should know? Meeting point, stops, etc."
              [value]="store.notes()"
              (input)="onNotesChange($any($event.target).value)"
              maxlength="500"
              data-testid="pr-notes"></textarea>
            <div class="char-count-textarea">{{ store.notes().length }}/500</div>
          </div>
          <p class="field-hint">Example: "Will stop for gas once", "Meeting at parking lot B"</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./post-ride-styles.css']
})
export class VehiclePreferencesStepComponent {
  store = inject(PostRideStore);

  onCarModelChange(value: string) {
    this.store.updateCarModel(value);
  }

  onCarTypeChange(type: 'sedan' | 'suv' | 'van' | 'hatchback') {
    this.store.updateCarType(type);
  }

  onLuggageSpaceChange(space: 'small' | 'medium' | 'large') {
    this.store.updateLuggageSpace(space);
  }

  onSmokingAllowedChange(allowed: boolean) {
    this.store.updateSmokingAllowed(allowed);
  }

  onPetsAllowedChange(allowed: boolean) {
    this.store.updatePetsAllowed(allowed);
  }

  onMusicPreferenceChange(pref: 'quiet' | 'moderate' | 'lively') {
    this.store.updateMusicPreference(pref);
  }

  onNotesChange(value: string) {
    this.store.updateNotes(value);
  }
}
