import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoomStore } from './post-room.store';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-photos-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg" data-testid="pr-photos-dropzone">
        <label class="cursor-pointer">
          <input type="file" multiple accept="image/*" (change)="onFileSelect($event)" class="hidden" />
          <div class="text-gray-600">
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <p class="text-lg font-medium">Click to upload photos</p>
            <p class="text-sm mt-2">Minimum 3 photos required, max 12</p>
          </div>
        </label>
      </div>
      <div *ngIf="store.draft().photos.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div *ngFor="let photo of store.draft().photos; let i = index" 
             class="relative aspect-square border rounded-lg overflow-hidden"
             [attr.data-testid]="'pr-photo-' + i">
          <img [src]="photo.preview" [alt]="photo.alt || 'Room photo'" class="w-full h-full object-cover" />
          <div *ngIf="photo.isCover" class="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded" data-testid="pr-photo-cover">
            Cover
          </div>
          <div *ngIf="photo.progress && photo.progress < 100" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" data-testid="pr-photo-progress">
            <div class="text-white text-sm">{{ photo.progress }}%</div>
          </div>
          <div class="absolute top-2 right-2 flex gap-1">
            <button *ngIf="!photo.isCover" (click)="setCover(i)" class="bg-white p-1 rounded shadow text-xs">Set Cover</button>
            <button (click)="removePhoto(i)" class="bg-red-600 text-white p-1 rounded shadow">×</button>
          </div>
        </div>
      </div>
      <p *ngIf="store.draft().photos.length < 3" class="text-red-600 text-sm">
        Please upload at least 3 photos ({{store.draft().photos.length}}/3)
      </p>
    </div>
  `
})
export class PhotosStepComponent {
  store = inject(PostRoomStore);
  private toast = inject(ToastService);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.store.addPhoto({
          key: `temp-${Date.now()}`,
          preview: e.target?.result as string,
          file,
          isCover: this.store.draft().photos.length === 0,
          progress: 100
        });
      };
      reader.readAsDataURL(file);
    });

    this.toast.success('Photos added');
  }

  setCover(index: number): void {
    this.store.setCoverPhoto(index);
  }

  removePhoto(index: number): void {
    this.store.removePhoto(index);
  }
}
