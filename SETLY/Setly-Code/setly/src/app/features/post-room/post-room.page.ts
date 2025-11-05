import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-room-page',
  imports: [FormsModule, CommonModule],
  template: `
    <main class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-2xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8">Post Your Room</h1>

        <!-- Room posting form -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <form class="space-y-6">
            <!-- Room Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Room Title</label>
              <input
                type="text"
                placeholder="e.g. Cozy Room Near Campus"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="roomData.title"
                name="title"
              >
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Describe your room, amenities, and what makes it special..."
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="roomData.description"
                name="description"
              ></textarea>
            </div>

            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Rent ($)</label>
              <input
                type="number"
                placeholder="1200"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="roomData.price"
                name="price"
              >
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="City, State"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="roomData.location"
                name="location"
              >
            </div>

            <!-- University Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">University</label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="roomData.university"
                name="university"
              >
                <option value="">Select a university</option>
                <option value="harvard">Harvard University</option>
                <option value="stanford">Stanford University</option>
                <option value="mit">MIT</option>
                <option value="berkeley">UC Berkeley</option>
              </select>
            </div>

            <!-- Room Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    type="radio"
                    name="roomType"
                    value="private"
                    [(ngModel)]="roomData.roomType"
                    class="mr-2"
                  >
                  <span class="text-sm">Private Room</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    name="roomType"
                    value="shared"
                    [(ngModel)]="roomData.roomType"
                    class="mr-2"
                  >
                  <span class="text-sm">Shared Room</span>
                </label>
              </div>
            </div>

            <!-- Amenities -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="roomData.amenities.wifi"
                    name="wifi"
                    class="mr-2"
                  >
                  <span class="text-sm">WiFi</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="roomData.amenities.laundry"
                    name="laundry"
                    class="mr-2"
                  >
                  <span class="text-sm">Laundry</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="roomData.amenities.parking"
                    name="parking"
                    class="mr-2"
                  >
                  <span class="text-sm">Parking</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="roomData.amenities.kitchen"
                    name="kitchen"
                    class="mr-2"
                  >
                  <span class="text-sm">Kitchen Access</span>
                </label>
              </div>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Room Photos</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div class="space-y-2">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                  <div class="text-sm text-gray-600">
                    <label for="file-upload" class="cursor-pointer">
                      <span class="font-medium text-blue-600 hover:text-blue-500">Upload photos</span>
                      <span class="pl-1">or drag and drop</span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      class="sr-only"
                      (change)="onFileSelected($event)"
                    >
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
              <!-- Preview Images -->
              <div class="mt-4 grid grid-cols-3 gap-4" *ngIf="selectedFiles.length > 0">
                <div *ngFor="let file of selectedFiles; let i = index" class="relative">
                  <img [src]="file.preview" [alt]="file.name" class="w-full h-24 object-cover rounded-lg">
                  <button
                    type="button"
                    (click)="removeFile(i)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Post Room
            </button>
          </form>
        </div>
      </div>
    </main>
  `
})
export class PostRoomPage {
  roomData = {
    title: '',
    description: '',
    price: null as number | null,
    location: '',
    university: '',
    roomType: '',
    amenities: {
      wifi: false,
      laundry: false,
      parking: false,
      kitchen: false
    }
  };

  selectedFiles: { file: File; preview: string; name: string }[] = [];

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedFiles.push({
            file,
            preview: e.target?.result as string,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }
}
