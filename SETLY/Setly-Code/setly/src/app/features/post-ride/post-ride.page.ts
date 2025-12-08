import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TripDetailsStepComponent } from './trip-details-step.component';
import { VehiclePreferencesStepComponent } from './vehicle-preferences-step.component';
import { PostRideStore } from './post-ride.store';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';

@Component({
  selector: 'app-post-ride-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    TripDetailsStepComponent,
    VehiclePreferencesStepComponent,
    ToastContainerComponent
  ],
  template: `
    <app-toast-container></app-toast-container>
    
    <!-- Mobile-First Wizard Layout -->
    <div class="post-ride-wizard">
      
      <!-- Mobile Header with Back Button (Premium Style) -->
      <header class="wizard-header-premium">
        <button 
          type="button" 
          class="back-button-premium"
          (click)="handleBack()"
          [attr.aria-label]="store.currentStep() === 1 ? 'Close' : 'Go back'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div class="header-content-premium">
          <h1 class="header-title-premium">Post a Ride</h1>
          <p class="step-indicator-premium">
            <span class="step-badge">Step {{ store.currentStep() }}</span>
            <span class="step-divider">·</span>
            <span class="step-total">2 steps</span>
          </p>
        </div>
        
        <button 
          type="button" 
          class="save-draft-button-premium"
          (click)="saveDraft()"
          aria-label="Save draft">
          <span class="save-text">Save</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </header>

      <!-- Premium Progress Dots (2 steps) -->
      <div class="progress-dots-premium">
        <div class="dot-container">
          <div class="dot-track"></div>
          <div class="dot-progress" [style.width.%]="((store.currentStep() - 1) / 1) * 100"></div>
          <div class="dots-wrapper">
            <div class="dot-item" [class.active]="store.currentStep() >= 1" [class.complete]="store.currentStep() > 1">
              <div class="dot-circle">
                <svg *ngIf="store.currentStep() > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span *ngIf="store.currentStep() === 1" class="dot-number">1</span>
              </div>
              <span class="dot-label">Trip Details</span>
            </div>
            <div class="dot-item" [class.active]="store.currentStep() >= 2">
              <div class="dot-circle">
                <span class="dot-number">2</span>
              </div>
              <span class="dot-label">Vehicle & Prefs</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Step Content -->
      <div class="step-content">
        <!-- Step 1: Trip Details -->
        <div *ngIf="store.currentStep() === 1" class="step-container">
          <app-trip-details-step></app-trip-details-step>
        </div>

        <!-- Step 2: Vehicle & Preferences -->
        <div *ngIf="store.currentStep() === 2" class="step-container">
          <app-vehicle-preferences-step></app-vehicle-preferences-step>
        </div>
      </div>

      <!-- Fixed Bottom Button Bar (Native App Style) -->
      <div class="bottom-button-bar">
        <button
          *ngIf="store.currentStep() > 1"
          type="button"
          (click)="store.previousStep()"
          class="btn-secondary-mobile"
          data-testid="post-ride-prev">
          Back
        </button>
        
        <button
          *ngIf="store.currentStep() < 2"
          type="button"
          (click)="handleNext()"
          class="btn-primary-mobile"
          [class.full-width]="store.currentStep() === 1"
          [disabled]="!canProceedToNext()"
          data-testid="post-ride-next">
          Continue
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button
          *ngIf="store.currentStep() === 2"
          type="button"
          (click)="publishRide()"
          class="btn-publish-mobile"
          [disabled]="isPublishing()"
          data-testid="post-ride-publish">
          <span *ngIf="!isPublishing()">Publish Ride</span>
          <span *ngIf="isPublishing()">Publishing...</span>
        </button>
      </div>
    </div>

    <!-- Discard Draft Confirmation (shown when trying to leave) -->
    <div *ngIf="showDiscardConfirm()" class="discard-overlay" (click)="cancelDiscard()">
      <div class="discard-sheet" (click)="$event.stopPropagation()">
        <div class="sheet-handle"></div>
        <h3>Discard draft?</h3>
        <p>Your ride details will not be saved</p>
        <div class="discard-actions">
          <button type="button" class="btn-cancel" (click)="cancelDiscard()">
            Keep Editing
          </button>
          <button type="button" class="btn-discard" (click)="confirmDiscard()">
            Discard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Mobile-First Wizard Layout */
    .post-ride-wizard {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #F8FAFC;
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    /* Premium Mobile Header */
    .wizard-header-premium {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: white;
      border-bottom: 1px solid #E2E8F0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(10px);
    }

    .back-button-premium {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: #F8FAFC;
      color: #1E293B;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .back-button-premium:hover {
      background: #F1F5F9;
      transform: translateX(-2px);
    }

    .back-button-premium:active {
      transform: scale(0.95) translateX(-2px);
    }

    .header-content-premium {
      flex: 1;
      text-align: center;
      padding: 0 12px;
    }

    .header-title-premium {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 4px 0;
      line-height: 1.2;
      letter-spacing: -0.3px;
    }

    .step-indicator-premium {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      margin: 0;
    }

    .step-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
    }

    .step-divider {
      color: #CBD5E1;
      font-weight: 600;
    }

    .step-total {
      color: #64748B;
      font-weight: 500;
    }

    .save-draft-button-premium {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      border: none;
      background: #F8FAFC;
      color: #3B82F6;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .save-draft-button-premium:hover {
      background: #EFF6FF;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
    }

    .save-draft-button-premium:active {
      transform: scale(0.96);
    }

    .save-text {
      display: none;
    }

    @media (min-width: 375px) {
      .save-text {
        display: inline;
      }
    }

    /* Premium Progress Dots (2 steps) */
    .progress-dots-premium {
      background: white;
      padding: 20px 20px 24px;
      border-bottom: 1px solid #E2E8F0;
    }

    .dot-container {
      position: relative;
      max-width: 300px;
      margin: 0 auto;
    }

    .dot-track {
      position: absolute;
      top: 16px;
      left: 0;
      right: 0;
      height: 3px;
      background: #E2E8F0;
      border-radius: 2px;
    }

    .dot-progress {
      position: absolute;
      top: 16px;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
      border-radius: 2px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dots-wrapper {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .dot-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex: 1;
      max-width: 120px;
    }

    .dot-circle {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 3px solid #E2E8F0;
      border-radius: 50%;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      position: relative;
      z-index: 2;
    }

    .dot-number {
      font-size: 14px;
      font-weight: 700;
      color: #94A3B8;
      transition: color 0.3s;
    }

    .dot-item.active .dot-circle {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      border-color: #3B82F6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
      transform: scale(1.1);
    }

    .dot-item.active .dot-number {
      color: white;
    }

    .dot-item.complete .dot-circle {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      border-color: #10B981;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
    }

    .dot-label {
      font-size: 12px;
      font-weight: 600;
      color: #94A3B8;
      text-align: center;
      transition: color 0.3s;
      white-space: nowrap;
    }

    .dot-item.active .dot-label {
      color: #3B82F6;
    }

    .dot-item.complete .dot-label {
      color: #10B981;
    }

    /* Scrollable Content */
    .step-content {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 100px; /* Space for fixed bottom bar */
    }

    .step-container {
      animation: fadeInStep 0.3s ease;
    }

    @keyframes fadeInStep {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Fixed Bottom Button Bar (Native Style) */
    .bottom-button-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
      background: white;
      border-top: 1px solid #E5E7EB;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
      z-index: 99;
    }

    .btn-secondary-mobile {
      flex: 1;
      height: 48px;
      border-radius: 12px;
      border: 2px solid #E5E7EB;
      background: white;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-secondary-mobile:active {
      transform: scale(0.98);
      background: #F9FAFB;
    }

    .btn-primary-mobile {
      flex: 2;
      height: 48px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-primary-mobile.full-width {
      flex: 1;
    }

    .btn-primary-mobile:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .btn-primary-mobile:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn-primary-mobile:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-publish-mobile {
      flex: 2;
      height: 48px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-publish-mobile:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-publish-mobile:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn-publish-mobile:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Discard Confirmation Sheet */
    .discard-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-end;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .discard-sheet {
      width: 100%;
      background: white;
      border-radius: 24px 24px 0 0;
      padding: 24px 20px 32px;
      animation: slideUp 0.25s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    .sheet-handle {
      width: 40px;
      height: 4px;
      background: #CBD5E1;
      border-radius: 2px;
      margin: 0 auto 20px;
    }

    .discard-sheet h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .discard-sheet p {
      font-size: 15px;
      color: #6B7280;
      margin: 0 0 24px 0;
      text-align: center;
    }

    .discard-actions {
      display: flex;
      gap: 12px;
    }

    .btn-cancel {
      flex: 1;
      height: 48px;
      border-radius: 12px;
      border: 2px solid #E5E7EB;
      background: white;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-discard {
      flex: 1;
      height: 48px;
      border-radius: 12px;
      border: none;
      background: #EF4444;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class PostRidePage {
  store = inject(PostRideStore);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  showDiscardConfirm = signal<boolean>(false);
  isPublishing = signal<boolean>(false);
  private pendingNavigation: string | null = null;

  // Navigation methods
  handleBack() {
    if (this.store.currentStep() === 1) {
      this.attemptNavigation('/explore');
    } else {
      this.store.previousStep();
    }
  }

  handleNext() {
    if (this.canProceedToNext()) {
      this.store.nextStep();
    } else {
      // Show first error
      const errors = this.store.errors();
      const firstError = Object.values(errors).find(e => !!e);
      if (firstError) {
        this.toastService.error(firstError);
      }
    }
  }

  saveDraft() {
    const state = this.store.getState();
    if (state.fromCity || state.toCity) {
      localStorage.setItem('postRideDraft', JSON.stringify(state));
      this.toastService.success('Draft saved');
    }
  }

  attemptNavigation(route: string) {
    const state = this.store.getState();
    // Check if user has entered any data
    if (state.fromCity || state.toCity || state.departureDate) {
      this.pendingNavigation = route;
      this.showDiscardConfirm.set(true);
    } else {
      this.router.navigate([route]);
    }
  }

  confirmDiscard() {
    this.showDiscardConfirm.set(false);
    this.store.reset();
    if (this.pendingNavigation) {
      this.router.navigate([this.pendingNavigation]);
      this.pendingNavigation = null;
    }
  }

  cancelDiscard() {
    this.showDiscardConfirm.set(false);
    this.pendingNavigation = null;
  }

  canProceedToNext(): boolean {
    if (this.store.currentStep() === 1) {
      return this.store.validateStep1();
    }
    return true; // Step 2 has no required fields
  }

  async publishRide(): Promise<void> {
    // Validate Step 1 again before publishing
    if (!this.store.validateStep1()) {
      this.toastService.error('Please complete all required trip details');
      // Reset to step 1 if validation fails
      this.store.previousStep();
      return;
    }

    try {
      this.isPublishing.set(true);
      
      const state = this.store.getState();
      
      // TODO: Call backend API to create ride
      // const rideData = {
      //   fromCity: state.fromCity,
      //   toCity: state.toCity,
      //   departureDate: state.departureDate,
      //   departureTime: state.departureTime,
      //   estimatedArrival: state.estimatedArrival,
      //   pricePerSeat: state.pricePerSeat,
      //   seatsAvailable: state.seatsAvailable,
      //   carModel: state.carModel,
      //   carType: state.carType,
      //   luggageSpace: state.luggageSpace,
      //   smokingAllowed: state.smokingAllowed,
      //   petsAllowed: state.petsAllowed,
      //   musicPreference: state.musicPreference,
      //   notes: state.notes,
      // };
      // const created = await this.ridesService.create(rideData).toPromise();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.toastService.success('🚗 Ride posted successfully!');
      this.store.reset();
      localStorage.removeItem('postRideDraft');
      
      // Navigate to rides list or success page
      setTimeout(() => {
        this.router.navigate(['/explore']);
      }, 800);
      
    } catch (error) {
      console.error('Failed to publish ride:', error);
      this.toastService.error('Failed to publish ride. Please try again.');
    } finally {
      this.isPublishing.set(false);
    }
  }
}
