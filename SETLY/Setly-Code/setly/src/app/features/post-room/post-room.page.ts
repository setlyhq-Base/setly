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
    <!-- Density Toggle -->
    <div class="flex justify-end items-center gap-2 px-4 pt-3 text-xs">
      <span class="text-gray-500">Density:</span>
      <button type="button" (click)="toggleDensity()" class="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
        [attr.aria-pressed]="isCompact()" data-testid="pr-density-toggle">
        {{ isCompact() ? 'Compact' : 'Comfort' }}
      </button>
    </div>

    <div class="post-room-page" [class.post-room-compact]="isCompact()">
    <!-- Hero Section (reduced vertical spacing) -->
  <section class="bg-white animate-fade-in py-6 lg:py-8">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <h1 class="text-2xl lg:text-3xl font-bold tracking-tight mb-3 text-blue-600">Post Your Room</h1>
          <p class="text-sm lg:text-base max-w-2xl mx-auto text-slate-600">
            Join a trusted community of Setly hosts.
          </p>
        </div>
      </div>
    </section>

  <!-- Main Content (tightened) -->
  <main class="bg-white pt-2 pb-10 lg:pb-14">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Progress Steps -->
          <div class="mb-6" data-testid="pr-stepper">
            <div class="flex items-center justify-center space-x-3 text-xs">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                  [class]="store.currentStep() >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'"
                  [attr.aria-current]="store.currentStep() === 1 ? 'step' : null"
                >
                  1
                </div>
                <span
                  class="ml-2 font-medium"
                  [class]="store.currentStep() >= 1 ? 'text-gray-900' : 'text-gray-500'"
                >
                  Room Details
                </span>
              </div>
              <div
                class="w-12 h-0.5"
                [class]="store.currentStep() >= 2 ? 'bg-blue-500' : 'bg-gray-300'"
              ></div>
              <div class="flex items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                  [class]="store.currentStep() >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'"
                  [attr.aria-current]="store.currentStep() === 2 ? 'step' : null"
                >
                  2
                </div>
                <span
                  class="ml-2 font-medium"
                  [class]="store.currentStep() >= 2 ? 'text-gray-900' : 'text-gray-500'"
                >
                  Photos
                </span>
              </div>
              <div
                class="w-12 h-0.5"
                [class]="store.currentStep() >= 3 ? 'bg-blue-500' : 'bg-gray-300'"
              ></div>
              <div class="flex items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                  [class]="store.currentStep() >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'"
                  [attr.aria-current]="store.currentStep() === 3 ? 'step' : null"
                >
                  3
                </div>
                <span
                  class="ml-2 font-medium"
                  [class]="store.currentStep() >= 3 ? 'text-gray-900' : 'text-gray-500'"
                >
                  Pricing
                </span>
              </div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="card-premium px-4 py-5" style="padding:1.25rem 1.25rem;">
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
    </div>
  `
})
export class PostRoomPage {
  store = inject(PostRoomStore);
  isCompact = signal<boolean>(false);
  ngOnInit() {
    const saved = localStorage.getItem('postRoomDensity');
    if (saved === 'compact') this.isCompact.set(true);
  }
  toggleDensity() {
    this.isCompact.update((v: boolean) => {
      const next = !v;
      localStorage.setItem('postRoomDensity', next ? 'compact' : 'comfort');
      return next;
    });
  }
  private roomsService = inject(RoomsService);
  private analytics = inject(AnalyticsService);
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private roomCardStore = inject(RoomStore);

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
      // Preserve actual image previews (base64) or URLs so listing detail can render them.
      // Previously we only stored the photo.key which made the gallery blank.
      const publishedPhotos = draft.photos
        .filter(p => (p.preview || p.url) && !p.error)
        .map(p => p.preview || p.url || p.key);
      const coverPhoto = draft.photos.find(p => p.isCover);

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
        photos: publishedPhotos,
        image: coverPhoto ? (coverPhoto.preview || coverPhoto.url || coverPhoto.key) : publishedPhotos[0],
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
        this.roomCardStore.addRoom(card);

        this.store.clearDraft();
        this.analytics.trackEvent('postRoom_published', {
          listingId: created.id,
          city: draft.city,
          universityId: draft.nearUniversityId,
          price: draft.price.monthly
        });
        this.toast.success('Your room is live! Redirecting…');
        setTimeout(() => {
          this.router.navigate(['/listing', created.id]);
        }, 900);
        // Emit event for FAB to handle
        window.dispatchEvent(new CustomEvent('roomPosted'));
      } else {
        this.toast.error('Failed to create listing');
      }
    } catch (error) {
      console.error('Failed to publish room:', error);
      this.toast.error('Failed to publish listing. Please try again.');
    }
  }
}
