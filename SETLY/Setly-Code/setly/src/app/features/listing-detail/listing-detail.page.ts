import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomStore } from '../../core/state/room.store';
import { RoomCard } from '../../core/models/room-card.model';
import { Room } from '../../core/models/room.model';

@Component({
  selector: 'app-listing-detail-page',
  imports: [CommonModule],
  template: `
    <main class="min-h-screen bg-gray-50">
      <div *ngIf="room(); else loading" class="max-w-4xl mx-auto px-4 py-8">
        <!-- Gallery -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div class="aspect-video bg-gray-200 relative">
            <img
              [src]="room()!.photos[mainImageIndex()] || '/assets/placeholder-room.jpg'"
              [alt]="room()!.title"
              class="w-full h-full object-cover"
            >
            <div class="absolute top-3 right-3">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                [class]="room()!.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'"
              >
                {{ room()!.isAvailable ? 'Available' : 'Unavailable' }}
              </span>
            </div>
          </div>
          <!-- Image Thumbnails -->
          <div class="flex gap-2 p-4 overflow-x-auto" *ngIf="room()!.photos.length > 1">
            <img
              *ngFor="let photo of room()!.photos; let i = index"
              [src]="photo"
              [alt]="room()!.title + ' ' + (i + 1)"
              class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 hover:border-blue-500"
              [class.border-blue-500]="i === mainImageIndex()"
              (click)="setMainImage(i)"
            >
          </div>
        </div>

        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ room()!.title }}</h1>
              <p class="text-gray-600 text-lg">{{ room()!.city }}, {{ room()!.state }}</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-brand-blue">$ {{ room()?.price }}/month</p>
            </div>
          </div>

          <!-- Features chips -->
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let tag of room()!.tags"
              class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Description -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Description</h2>
              <p class="text-gray-700">
                This is a great room located near campus. Perfect for students looking for a comfortable living space.
              </p>
            </div>

            <!-- Amenities -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Amenities</h2>
              <div class="grid grid-cols-2 gap-2">
                <div *ngFor="let tag of room()!.tags" class="flex items-center">
                  <span class="text-gray-700">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Map placeholder -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Location</h2>
              <div class="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Map coming soon...</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Back Navigation -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <button
                (click)="goBack()"
                class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to browse
              </button>
            </div>

            <!-- Contact -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold mb-4">Landlord</h3>
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <p class="font-medium">John Doe</p>
                  <p class="text-sm text-gray-600">Verified landlord</p>
                </div>
              </div>
              <button class="btn w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-3 rounded-lg font-semibold">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div class="animate-pulse space-y-8">
            <div class="aspect-video bg-gray-300 rounded-lg"></div>
            <div class="bg-white rounded-lg p-6 space-y-4">
              <div class="h-8 bg-gray-300 rounded w-3/4"></div>
              <div class="h-6 bg-gray-300 rounded w-1/2"></div>
              <div class="flex space-x-2">
                <div class="h-6 bg-gray-300 rounded w-20"></div>
                <div class="h-6 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </main>
  `
})
export class ListingDetailPage {
  private roomStore = inject(RoomStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  room = signal<Room | null>(null);
  mainImageIndex = signal(0);

  constructor() {
    const id = this.route.snapshot.params['id'];
    this.loadRoom(id);
  }

  private loadRoom(id: string): void {
    // For now, use mock data since RoomStore might not have full Room objects
    const mockRoom: Room = {
      id,
      title: 'Beautiful Room Near Campus',
      city: 'College Town',
      state: 'ST',
      price: 800,
      roomType: 'private',
      bath: 'shared',
      furnished: true,
      photos: ['/assets/placeholder-room.jpg', '/assets/placeholder-room.jpg', '/assets/placeholder-room.jpg'],
      rules: {
        vegetarian: true,
        smoking: false,
        petsOk: true
      },
      hostId: 'host1',
      createdAt: new Date().toISOString(),
      tags: ['WiFi', 'Laundry', 'Parking'],
      image: '/assets/placeholder-room.jpg',
      isAvailable: true,
      address: '123 University Ave, College Town, ST 12345',
      amenities: ['WiFi', 'Laundry', 'Parking'],
      features: ['WiFi', 'Laundry', 'Parking'],
      distance: '0.5 km from campus'
    };
    this.room.set(mockRoom);
  }

  goBack(): void {
    this.router.navigate(['/browse']);
  }

  setMainImage(index: number): void {
    this.mainImageIndex.set(index);
  }
}
