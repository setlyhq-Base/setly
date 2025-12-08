import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RoomDetailsStepComponent } from './room-details-step.component';
import { PhotosStepComponent } from './photos-step.component';
import { PricingStepComponent } from './pricing-step.component';
import { PostRoomStore } from './post-room.store';
import { RoomsService } from '../../core/services/rooms.service';
import { RoomStore } from '../../core/state/room.store';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CurrentUserService } from '../../core/user/current-user.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';

@Component({
  selector: 'app-post-room-page',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    RoomDetailsStepComponent,
    PhotosStepComponent,
    PricingStepComponent,
    ToastContainerComponent
  ],
  template: `
    <app-toast-container></app-toast-container>
    
    <!-- Mobile-First Wizard Layout -->
    <div class="post-room-wizard">
      
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
          <h1 class="header-title-premium">Post Your Room</h1>
          <p class="step-indicator-premium">
            <span class="step-badge">Step {{ store.currentStep() }}</span>
            <span class="step-divider">·</span>
            <span class="step-total">3 steps</span>
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

      <!-- Premium Progress Dots (Airbnb Style) -->
      <div class="progress-dots-premium">
        <div class="dot-container">
          <div class="dot-track"></div>
          <div class="dot-progress" [style.width.%]="((store.currentStep() - 1) / 2) * 100"></div>
          <div class="dots-wrapper">
            <div class="dot-item" [class.active]="store.currentStep() >= 1" [class.complete]="store.currentStep() > 1">
              <div class="dot-circle">
                <svg *ngIf="store.currentStep() > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span *ngIf="store.currentStep() === 1" class="dot-number">1</span>
              </div>
              <span class="dot-label">Details</span>
            </div>
            <div class="dot-item" [class.active]="store.currentStep() >= 2" [class.complete]="store.currentStep() > 2">
              <div class="dot-circle">
                <svg *ngIf="store.currentStep() > 2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span *ngIf="store.currentStep() <= 2" class="dot-number">2</span>
              </div>
              <span class="dot-label">Photos</span>
            </div>
            <div class="dot-item" [class.active]="store.currentStep() >= 3">
              <div class="dot-circle">
                <span class="dot-number">3</span>
              </div>
              <span class="dot-label">Pricing</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Step Content -->
      <div class="step-content">
        <!-- Step 1: Room Details -->
        <div *ngIf="store.currentStep() === 1" class="step-container">
          <app-room-details-step></app-room-details-step>
        </div>

        <!-- Step 2: Photos -->
        <div *ngIf="store.currentStep() === 2" class="step-container">
          <app-photos-step></app-photos-step>
        </div>

        <!-- Step 3: Pricing -->
        <div *ngIf="store.currentStep() === 3" class="step-container">
          <app-pricing-step></app-pricing-step>
        </div>
      </div>

      <!-- Fixed Bottom Button Bar (Native App Style) -->
      <div class="bottom-button-bar">
        <button
          *ngIf="store.currentStep() > 1 && store.currentStep() < 3"
          type="button"
          (click)="store.previousStep()"
          class="btn-secondary-mobile"
          data-testid="pr-prev">
          Back
        </button>
        
        <button
          *ngIf="store.currentStep() < 3"
          type="button"
          (click)="handleNext()"
          class="btn-primary-mobile"
          [class.full-width]="store.currentStep() === 1"
          [disabled]="!canProceedToNext()"
          data-testid="pr-next">
          Continue
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button
          *ngIf="store.currentStep() === 3"
          type="button"
          (click)="store.previousStep()"
          class="btn-secondary-mobile"
          data-testid="pr-prev-final">
          Back
        </button>
        
        <button
          *ngIf="store.currentStep() === 3"
          type="button"
          (click)="publishRoom()"
          class="btn-publish-mobile"
          [disabled]="!canPublish() || isPublishing()"
          data-testid="pr-publish">
          <span *ngIf="!isPublishing()">Publish Listing</span>
          <span *ngIf="isPublishing()">Publishing...</span>
        </button>
      </div>
    </div>

    <!-- Discard Draft Confirmation (shown when trying to leave) -->
    <div *ngIf="showDiscardConfirm()" class="discard-overlay" (click)="cancelDiscard()">
      <div class="discard-sheet" (click)="$event.stopPropagation()">
        <div class="sheet-handle"></div>
        <h3>Discard draft?</h3>
        <p>Your changes will not be saved</p>
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
    .post-room-wizard {
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

    /* Premium Progress Dots (Airbnb Style) */
    .progress-dots-premium {
      background: white;
      padding: 20px 20px 24px;
      border-bottom: 1px solid #E2E8F0;
    }

    .dot-container {
      position: relative;
      max-width: 400px;
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
      max-width: 80px;
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
      padding: 0 16px 24px;
    }

    .step-header {
      padding: 24px 0 20px;
    }

    .step-header h2 {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .step-header p {
      font-size: 15px;
      color: #6B7280;
      margin: 0;
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

    .btn-primary-mobile:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }

    .btn-primary-mobile:disabled {
      background: #D1D5DB;
      box-shadow: none;
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

    .btn-publish-mobile:active {
      transform: scale(0.98);
    }

    .btn-publish-mobile:disabled {
      background: #D1D5DB;
      box-shadow: none;
      cursor: not-allowed;
    }

    /* Discard Confirmation Sheet */
    .discard-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .discard-sheet {
      width: 100%;
      background: white;
      border-radius: 20px 20px 0 0;
      padding: 24px 20px;
      padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-handle {
      width: 36px;
      height: 4px;
      background: #D1D5DB;
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

    .btn-cancel, .btn-discard {
      flex: 1;
      height: 48px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-cancel {
      background: #F3F4F6;
      border: none;
      color: #374151;
    }

    .btn-cancel:active {
      background: #E5E7EB;
    }

    .btn-discard {
      background: #EF4444;
      border: none;
      color: white;
    }

    .btn-discard:active {
      background: #DC2626;
    }

    /* Desktop Adjustments (keep mobile-first on desktop too) */
    @media (min-width: 768px) {
      .post-room-wizard {
        max-width: 600px;
        margin: 0 auto;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
      }
    }

    /* Hide on desktop header */
    @media (min-width: 768px) {
      .wizard-header {
        display: none;
      }
      
      .step-content {
        padding-top: 40px;
      }
    }
  `]
})
export class PostRoomPage {
  store = inject(PostRoomStore);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private roomsService = inject(RoomsService);
  private roomStore = inject(RoomStore);
  private analyticsService = inject(AnalyticsService);
  private currentUserService = inject(CurrentUserService);
  
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
    }
  }

  saveDraft() {
    const draft = this.store.draft();
    if (draft.title || draft.description) {
      localStorage.setItem('postRoomDraft', JSON.stringify(draft));
      this.toastService.success('Draft saved');
    }
  }

  attemptNavigation(route: string) {
    const draft = this.store.draft();
    if (draft.title || draft.description || draft.photos.length > 0) {
      this.pendingNavigation = route;
      this.showDiscardConfirm.set(true);
    } else {
      this.router.navigate([route]);
    }
  }

  confirmDiscard() {
    this.showDiscardConfirm.set(false);
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
    const step = this.store.currentStep();
    if (step === 1) return this.store.step1Valid();
    if (step === 2) return this.store.step2Valid();
    if (step === 3) return this.store.step3Valid();
    return false;
  }

  canPublish(): boolean {
    return this.store.allStepsValid();
  }

  async publishRoom(): Promise<void> {
    if (!this.store.allStepsValid()) {
      this.toastService.error('Please complete all required fields');
      return;
    }

    try {
      (this as any)._posting = true;
      const btnEl = document.querySelector('[data-testid="pr-publish"]');
      if (btnEl) btnEl.setAttribute('disabled','true');
      const currentUser = this.currentUserService.currentUser();
      if (!currentUser) {
        this.toastService.error('You must be logged in to publish a listing');
        return;
      }

      const draft = this.store.draft();
      const uploadedPhotos = draft.photos
        .filter(p => !!p.url && !p.error)
        .map(p => p.url as string);
      if (uploadedPhotos.length < 3) {
        this.toastService.error('Please upload at least 3 photos before publishing');
        return;
      }
      const coverPhoto = draft.photos.find(p => p.isCover && p.url);

      const roomData: any = {
        title: draft.title,
        description: draft.description,
        address: (draft as any).address,
        lat: typeof (draft as any).lat === 'number' ? (draft as any).lat : undefined,
        lon: typeof (draft as any).lon === 'number' ? (draft as any).lon : undefined,
        price: draft.price.monthly,
        city: draft.city,
        state: draft.state,
        universityId: draft.nearUniversityId,
        roomType: draft.roomType,
        bath: draft.bath,
        furnished: draft.furnished,
        rules: draft.rules,
        distanceKm: (draft as any).distanceMiles ? Math.round(((draft as any).distanceMiles * 1.60934) * 10) / 10 : undefined,
  photos: uploadedPhotos,
  image: coverPhoto?.url || uploadedPhotos[0],
        hostId: currentUser.uid,
        createdAt: new Date().toISOString(),
        availabilityStart: draft.availableFrom,
        availabilityEnd: (draft as any).availableTo,
        amenities: draft.price.utilitiesIncluded
      };

  const created = await this.roomsService.create(roomData).toPromise();
      if (created) {
        // Map to RoomCard for Browse visibility
        const features: string[] = [];
        if (created.roomType === 'private') features.push('Private room');
        if (created.furnished) features.push('Furnished');
        if (created.rules?.petsOk) features.push('Pets ok');
        if (!created.rules?.smoking) features.push('No smoking');
        if (created.rules?.vegetarian) features.push('Vegetarian');
        const card = {
          id: created.id,
          title: created.title,
          price: created.price,
          image: created.image || created.photos?.[0] || '/assets/placeholder-room.jpg',
          address: [created.city, created.state].filter(Boolean).join(', '),
          distance: created.distanceKm ? `${created.distanceKm} km` : '',
          features,
          isAvailable: true,
        };
        this.roomStore.addRoom(card);

        this.store.clearDraft();
        this.analyticsService.trackEvent('postRoom_published', {
          listingId: created.id,
          city: draft.city,
          universityId: draft.nearUniversityId,
          price: draft.price.monthly
        });
  this.toastService.success('Room posted. It’s now visible in Explore → Rooms. Redirecting…');
        setTimeout(() => {
          this.router.navigate(['/listing', created.id]);
        }, 900);
        // Emit event for FAB to handle
        window.dispatchEvent(new CustomEvent('roomPosted'));
      } else {
        this.toastService.error('Failed to create listing');
      }
    } catch (error) {
      console.error('Failed to publish room:', error);
      const code = (error as any)?.error?.error || (error as any)?.error || '';
      if (code === 'min-photos') this.toastService.error('Please add at least 3 photos.');
      else if (code === 'title-required') this.toastService.error('Please fill out all required fields.');
      else this.toastService.error('Something went wrong while posting your room. Please try again.');
    }
    finally {
      (this as any)._posting = false;
      const btnEl = document.querySelector('[data-testid="pr-publish"]');
      if (btnEl) btnEl.removeAttribute('disabled');
    }
  }
}
