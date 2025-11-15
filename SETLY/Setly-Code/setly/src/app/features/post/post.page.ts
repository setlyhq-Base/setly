import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SetlyRideFormComponent } from '../ride/setly-ride-form.component';
import { PostRoomPage } from '../post-room/post-room.page';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';

@Component({
  selector: 'app-post-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SetlyRideFormComponent, ToastContainerComponent, PostRoomPage],
  template: `
    <app-toast-container></app-toast-container>
    <main class="min-h-screen bg-gray-50">
      <section class="bg-white border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-4 py-10">
          <h1 class="text-3xl font-bold text-gray-900">Create a new post</h1>
          <p class="mt-2 text-gray-600">What would you like to share on Setly?</p>

          <!-- Tiles -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <button (click)="open('room')" class="tile" aria-label="Post a Room">
              <div class="icon">🛏️</div>
              <div class="title">Post a Room</div>
              <div class="sub">List a room, apartment, or shared space.</div>
            </button>
            <button (click)="open('ride')" class="tile" aria-label="Post a Ride">
              <div class="icon">🚗</div>
              <div class="title">Post a Ride</div>
              <div class="sub">Offer a ride or request a carpool.</div>
            </button>
            <button (click)="open('market')" class="tile" aria-label="Post to Marketplace">
              <div class="icon">📦</div>
              <div class="title">Post to Marketplace</div>
              <div class="sub">Sell books, furniture, electronics, or more.</div>
            </button>
          </div>
        </div>
      </section>

      <!-- Modal Overlay -->
      <div *ngIf="selected()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" (click)="onBackdrop($event)">
        <div class="modal" [class.wide]="selected() === 'room'" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between border-b border-gray-200 px-5 py-3">
            <h2 class="text-lg font-semibold text-gray-900">{{ modalTitle() }}</h2>
            <button class="text-gray-500 hover:text-gray-700" aria-label="Close" (click)="close()">✕</button>
          </div>

          <div class="p-5 overflow-y-auto max-h-[70vh]">
            <!-- Room -->
            <ng-container *ngIf="selected() === 'room'">
              <!-- Reuse existing post-room page inside modal -->
              <app-post-room-page class="modal-room-embed"></app-post-room-page>
              <p class="sr-only">Room posting appears inline.</p>
            </ng-container>

            <!-- Ride -->
            <ng-container *ngIf="selected() === 'ride'">
              <app-setly-ride-form (rideSubmitted)="rideDone()"></app-setly-ride-form>
            </ng-container>

            <!-- Marketplace (MVP) -->
            <ng-container *ngIf="selected() === 'market'">
              <form (ngSubmit)="marketSubmit()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input [(ngModel)]="market.title" name="title" required class="w-full px-3 py-2 border rounded-md" placeholder="e.g., IKEA desk" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                  <input [(ngModel)]="market.price" name="price" type="number" min="0" required class="w-full px-3 py-2 border rounded-md" placeholder="e.g., 50" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea [(ngModel)]="market.desc" name="desc" rows="3" class="w-full px-3 py-2 border rounded-md" placeholder="Short details..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                  <button type="submit" class="btn-primary flex-1">Post Item</button>
                  <button type="button" class="btn-secondary" (click)="close()">Cancel</button>
                </div>
              </form>
            </ng-container>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .tile { @apply p-6 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow transition text-left; }
    .tile .icon { @apply text-3xl mb-3; }
    .tile .title { @apply text-lg font-semibold text-gray-900; }
    .tile .sub { @apply text-sm text-gray-600 mt-1; }
    .modal { @apply bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl; }
    .modal.wide { @apply max-w-5xl; }
    .modal-room-embed .section-premium:first-child { display: none; }
  `]
})
export class PostLandingPage {
  private router = inject(Router);
  private toast = inject(ToastService);

  selected = signal<null | 'room' | 'ride' | 'market'>(null);
  market = { title: '', price: 0, desc: '' };

  open(type: 'room' | 'ride' | 'market') { this.selected.set(type); }
  close() { this.selected.set(null); }
  onBackdrop(ev: MouseEvent) { this.close(); }

  modalTitle() {
    const t = this.selected();
    if (t === 'room') return 'Post a Room';
    if (t === 'ride') return 'Post a Ride';
    if (t === 'market') return 'Post a Marketplace Item';
    return '';
  }

  rideDone() {
    this.toast.success('Your ride request has been posted. Redirecting…');
    this.close();
    setTimeout(() => this.router.navigate(['/ride']), 600);
  }

  marketSubmit() {
    if (!this.market.title || !this.market.price) return;
    this.toast.success('Your item has been posted. Redirecting…');
    this.close();
    setTimeout(() => this.router.navigate(['/connect/marketplace']), 600);
  }
}
