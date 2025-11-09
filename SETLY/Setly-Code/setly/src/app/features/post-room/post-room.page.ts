import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RoomDetailsStepComponent } from './room-details-step.component';
import { PhotosStepComponent } from './photos-step.component';
import { PricingStepComponent } from './pricing-step.component';
import { PostRoomStore } from './post-room.store';
import { RoomsService } from '../../core/services/rooms.service';
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
    <!-- Hero Section -->
    <section class="section-premium section-gradient animate-fade-in">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <h1 class="heading-premium mb-6 text-gradient">Post Your Room</h1>
          <p class="subheading-premium max-w-2xl mx-auto">
            Share your space with students and earn extra income. Join thousands of hosts who trust Setly.
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="section-premium bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Progress Steps -->
          <div class="mb-12" data-testid="pr-stepper">
            <div class="flex items-center justify-center space-x-4">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  [class]="store.currentStep() >= 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300 text-gray-600'"
                  [attr.aria-current]="store.currentStep() === 1 ? 'step' : null"
                >
                  1
                </div>
                <span
                  class="ml-3 text-sm font-medium"
                  [class]="store.currentStep() >= 1 ? 'text-gray-900' : 'text-gray-500'"
                >
                  Room Details
                </span>
              </div>
              <div
                class="w-16 h-0.5"
                [class]="store.currentStep() >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'"
              ></div>
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  [class]="store.currentStep() >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-300 text-gray-600'"
                  [attr.aria-current]="store.currentStep() === 2 ? 'step' : null"
                >
                  2
                </div>
                <span
                  class="ml-3 text-sm font-medium"
                  [class]="store.currentStep() >= 2 ? 'text-gray-900' : 'text-gray-500'"
                >
                  Photos
                </span>
              </div>
              <div
                class="w-16 h-0.5"
                [class]="store.currentStep() >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'"
              ></div>
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  [class]="store.currentStep() >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-300 text-gray-600'"
                  [attr.aria-current]="store.currentStep() === 3 ? 'step' : null"
                >
                  3
                </div>
                <span
                  class="ml-3 text-sm font-medium"
                  [class]="store.currentStep() >= 3 ? 'text-gray-900' : 'text-gray-500'"
                >
                  Pricing
                </span>
              </div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="card-premium">
            <!-- Step 1: Room Details -->
            <app-room-details-step *ngIf="store.currentStep() === 1"></app-room-details-step>

            <!-- Step 2: Photos -->
            <app-photos-step *ngIf="store.currentStep() === 2"></app-photos-step>

            <!-- Step 3: Pricing -->
            <app-pricing-step *ngIf="store.currentStep() === 3"></app-pricing-step>

            <!-- Navigation Buttons -->
            <div class="flex gap-4 pt-6" *ngIf="store.currentStep() < 3">
              <button
                type="button"
                (click)="store.previousStep()"
                class="btn-secondary flex-1"
                [disabled]="store.currentStep() === 1"
                data-testid="pr-prev"
              >
                Previous
              </button>
              <button
                type="button"
                (click)="store.nextStep()"
                class="btn-primary flex-1"
                [disabled]="!canProceedToNext()"
                data-testid="pr-next"
              >
                Next
              </button>
            </div>

            <!-- Publish Button -->
            <div class="flex gap-4 pt-6" *ngIf="store.currentStep() === 3">
              <button
                type="button"
                (click)="store.previousStep()"
                class="btn-secondary flex-1"
                data-testid="pr-prev"
              >
                Previous
              </button>
              <button
                type="button"
                (click)="publishRoom()"
                class="btn-primary flex-1"
                [disabled]="!canPublish()"
                data-testid="pr-publish"
              >
                Publish Listing
              </button>
            </div>
          </div>
          </div>
        </div>
      </main>
  `
})
export class PostRoomPage {
  store = inject(PostRoomStore);
  private roomsService = inject(RoomsService);
  private analytics = inject(AnalyticsService);
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  private toast = inject(ToastService);

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
      this.toast.error('Please complete all required fields');
      return;
    }

    try {
      const currentUser = this.currentUserService.currentUser();
      if (!currentUser) {
        this.toast.error('You must be logged in to publish a listing');
        return;
      }

      const draft = this.store.draft();
      const roomData: any = {
        title: draft.title,
        description: draft.description,
        price: draft.price.monthly,
        city: draft.city,
        state: draft.state,
        universityId: draft.nearUniversityId,
        roomType: draft.roomType,
        bath: draft.bath,
        furnished: draft.furnished,
        rules: draft.rules,
        distanceKm: draft.distanceKm,
        photos: draft.photos.filter(p => p.key && !p.error).map(p => p.key),
        hostId: currentUser.uid,
        createdAt: new Date().toISOString(),
        availabilityStart: draft.availableFrom,
        amenities: draft.price.utilitiesIncluded
      };

      await this.roomsService.create(roomData).toPromise();
      
      this.store.clearDraft();
      this.analytics.trackEvent('postRoom_published', {
        listingId: 'generated-id',
        city: draft.city,
        universityId: draft.nearUniversityId,
        price: draft.price.monthly
      });
      
      this.toast.success('Your room is live!');
      
      // Navigate to listing or browse
      setTimeout(() => {
        this.router.navigate(['/browse']);
      }, 1500);
    } catch (error) {
      console.error('Failed to publish room:', error);
      this.toast.error('Failed to publish listing. Please try again.');
    }
  }
}
