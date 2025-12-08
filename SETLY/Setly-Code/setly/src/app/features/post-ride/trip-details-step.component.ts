import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostRideStore } from './post-ride.store';

@Component({
  selector: 'app-trip-details-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Premium Mobile-First Trip Details -->
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
        <h2 class="intro-title">Trip Details</h2>
        <p class="intro-subtitle">Tell passengers about your ride</p>
      </div>

      <!-- Section: Route -->
      <div class="form-section">
        <h3 class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="section-icon">
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 21c4.418 0 8-5.373 8-12S16.418 1 12 1 4 6.627 4 13s3.582 12 8 12z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Trip Route
        </h3>

        <!-- From City -->
        <div class="mobile-field-group">
          <label for="fromCity" class="mobile-label">
            From <span class="required-star">*</span>
          </label>
          <div class="mobile-input-wrapper">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <input 
              id="fromCity"
              type="text"
              class="mobile-input"
              placeholder="e.g., Boston, MA"
              [value]="store.fromCity()"
              (input)="onFromCityChange($any($event.target).value)"
              [class.error]="store.errors().fromCity"
              data-testid="pr-from-city" />
          </div>
          @if (store.errors().fromCity) {
            <div class="field-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ store.errors().fromCity }}
            </div>
          }
        </div>

        <!-- To City -->
        <div class="mobile-field-group">
          <label for="toCity" class="mobile-label">
            To <span class="required-star">*</span>
          </label>
          <div class="mobile-input-wrapper">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <input 
              id="toCity"
              type="text"
              class="mobile-input"
              placeholder="e.g., New York, NY"
              [value]="store.toCity()"
              (input)="onToCityChange($any($event.target).value)"
              [class.error]="store.errors().toCity"
              data-testid="pr-to-city" />
          </div>
          @if (store.errors().toCity) {
            <div class="field-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ store.errors().toCity }}
            </div>
          }
        </div>
      </div>

      <!-- Section: Timing -->
      <div class="form-section">
        <h3 class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="section-icon">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Timing
        </h3>

        <div class="date-fields-grid">
          <!-- Departure Date -->
          <div class="mobile-field-group">
            <label for="departureDate" class="mobile-label">
              Date <span class="required-star">*</span>
            </label>
            <div class="mobile-input-wrapper">
              <div class="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <input 
                id="departureDate"
                type="date"
                class="mobile-input date-input"
                [value]="store.departureDate()"
                (input)="onDepartureDateChange($any($event.target).value)"
                [min]="minDate"
                [class.error]="store.errors().departureDate"
                data-testid="pr-departure-date" />
            </div>
            @if (store.errors().departureDate) {
              <div class="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ store.errors().departureDate }}
              </div>
            }
          </div>

          <!-- Departure Time -->
          <div class="mobile-field-group">
            <label for="departureTime" class="mobile-label">
              Time <span class="required-star">*</span>
            </label>
            <div class="mobile-input-wrapper">
              <div class="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <input 
                id="departureTime"
                type="time"
                class="mobile-input time-input"
                [value]="store.departureTime()"
                (input)="onDepartureTimeChange($any($event.target).value)"
                [class.error]="store.errors().departureTime"
                data-testid="pr-departure-time" />
            </div>
            @if (store.errors().departureTime) {
              <div class="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ store.errors().departureTime }}
              </div>
            }
          </div>
        </div>

        <!-- Estimated Arrival (Optional) -->
        <div class="mobile-field-group">
          <label for="estimatedArrival" class="mobile-label">
            Estimated Arrival <span class="text-gray-400">(Optional)</span>
          </label>
          <div class="mobile-input-wrapper">
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <input 
              id="estimatedArrival"
              type="time"
              class="mobile-input time-input"
              [value]="store.estimatedArrival()"
              (input)="onEstimatedArrivalChange($any($event.target).value)"
              data-testid="pr-estimated-arrival" />
          </div>
          <p class="field-hint">Help passengers plan their schedule</p>
        </div>
      </div>

      <!-- Section: Price & Seats -->
      <div class="form-section">
        <h3 class="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="section-icon">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Price & Seats
        </h3>

        <!-- Price Per Seat -->
        <div class="mobile-field-group">
          <label for="pricePerSeat" class="mobile-label">
            Price Per Seat <span class="required-star">*</span>
          </label>
          <div class="mobile-input-wrapper">
            <div class="input-icon">$</div>
            <input 
              id="pricePerSeat"
              type="number"
              step="1"
              min="0"
              class="mobile-input"
              placeholder="15"
              [value]="store.pricePerSeat() || ''"
              (input)="onPriceChange($any($event.target).value)"
              [class.error]="store.errors().pricePerSeat"
              data-testid="pr-price-per-seat" />
            <div class="input-suffix">per seat</div>
          </div>
          @if (store.errors().pricePerSeat) {
            <div class="field-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ store.errors().pricePerSeat }}
            </div>
          }
          <p class="field-hint">Total passengers will pay: {{ '$' + calculateTotalPrice() }}</p>
        </div>

        <!-- Seats Available -->
        <div class="mobile-field-group">
          <label class="mobile-label">
            Seats Available <span class="required-star">*</span>
          </label>
          <div class="seats-selector">
            <button 
              type="button"
              class="seat-button"
              (click)="decreaseSeats()"
              [disabled]="store.seatsAvailable() <= 1"
              aria-label="Decrease seats">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
            
            <div class="seat-count">
              <span class="seat-number">{{ store.seatsAvailable() }}</span>
              <span class="seat-label">{{ store.seatsAvailable() === 1 ? 'seat' : 'seats' }}</span>
            </div>
            
            <button 
              type="button"
              class="seat-button"
              (click)="increaseSeats()"
              [disabled]="store.seatsAvailable() >= 8"
              aria-label="Increase seats">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          @if (store.errors().seatsAvailable) {
            <div class="field-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ store.errors().seatsAvailable }}
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./post-ride-styles.css']
})
export class TripDetailsStepComponent {
  store = inject(PostRideStore);
  
  minDate = new Date().toISOString().split('T')[0];

  onFromCityChange(value: string) {
    this.store.updateFromCity(value);
  }

  onToCityChange(value: string) {
    this.store.updateToCity(value);
  }

  onDepartureDateChange(value: string) {
    this.store.updateDepartureDate(value);
  }

  onDepartureTimeChange(value: string) {
    this.store.updateDepartureTime(value);
  }

  onEstimatedArrivalChange(value: string) {
    this.store.updateEstimatedArrival(value);
  }

  onPriceChange(value: string) {
    const price = parseFloat(value) || 0;
    this.store.updatePricePerSeat(price);
  }

  increaseSeats() {
    if (this.store.seatsAvailable() < 8) {
      this.store.updateSeatsAvailable(this.store.seatsAvailable() + 1);
    }
  }

  decreaseSeats() {
    if (this.store.seatsAvailable() > 1) {
      this.store.updateSeatsAvailable(this.store.seatsAvailable() - 1);
    }
  }

  calculateTotalPrice(): number {
    return this.store.pricePerSeat() * this.store.seatsAvailable();
  }
}
