import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoomStore, RoomPhoto } from './post-room.store';
import { ToastService } from '../../core/services/toast.service';
import { UploadsService } from '../../core/services/uploads.service';

@Component({
  selector: 'app-photos-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 photos-step">
      <div class="text-center dropzone" data-testid="pr-photos-dropzone">
        <label class="cursor-pointer">
          <input type="file" multiple accept="image/*,.heic,.heif" (change)="onFileSelect($event)" class="hidden" />
          <div class="text-gray-600">
            <svg class="icon-add mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <p class="text-base font-medium leading-tight">Click to upload photos</p>
            <p class="text-xs mt-1">Minimum 3 photos required (max 12)</p>
          </div>
        </label>
      </div>
      <div *ngIf="store.draft().photos.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 photo-grid">
        <div *ngFor="let photo of store.draft().photos; let i = index" 
             class="relative aspect-square border rounded-md overflow-hidden photo-item"
             [attr.data-testid]="'pr-photo-' + i">
          <img [src]="photo.preview" [alt]="photo.alt || 'Room photo'" class="w-full h-full object-cover" />
          <div *ngIf="photo.isCover" class="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded" data-testid="pr-photo-cover">
            Cover
          </div>
          <div *ngIf="photo.progress && photo.progress < 100" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" data-testid="pr-photo-progress">
            <div class="text-white text-sm">{{ photo.progress }}%</div>
          </div>
          <div *ngIf="photo.error" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-red-200 text-xs font-semibold gap-2" data-testid="pr-photo-error">
            <span>Upload failed</span>
            <button (click)="retryPhoto(i)" class="px-2 py-1 bg-white/90 text-red-600 rounded text-[10px] font-medium shadow" data-testid="pr-photo-retry">Retry</button>
          </div>
          <div class="absolute top-2 right-2 flex gap-1">
            <button *ngIf="!photo.isCover && !photo.error" (click)="setCover(i)" class="bg-white p-1 rounded shadow text-xs">Set Cover</button>
            <button (click)="removePhoto(i)" class="bg-red-600 text-white p-1 rounded shadow">×</button>
          </div>
        </div>
      </div>
      <p *ngIf="store.draft().photos.length < 3" class="text-red-600 text-sm">
        Please upload at least 3 photos ({{store.draft().photos.length}}/3)
      </p>
    </div>
  `
  ,styles:[`
    .photos-step .dropzone { @apply p-6 border border-dashed border-gray-300 rounded-lg; }
    .post-room-compact .photos-step .dropzone { @apply p-4 rounded-md; }
    .photos-step .icon-add { @apply w-12 h-12; }
    .post-room-compact .photos-step .icon-add { @apply w-10 h-10; }
    .photo-grid .photo-item { @apply transition; }
    .post-room-compact .photo-grid { @apply gap-2; }
    .post-room-compact .photo-item { @apply border-gray-200; }
  `]
})
export class PhotosStepComponent {
  store = inject(PostRoomStore);
  private toast = inject(ToastService);
  private uploads = inject(UploadsService);
  private retrying = false;

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    // Lazy import converter to keep bundle small
    const { ensureDisplayableImage } = await import('../../core/utils/heic');

    const files = Array.from(input.files);
    let addedCount = 0;
    let uploadError = false;
    for (const original of files) {
      const isImage = original.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(original.name);
      if (!isImage) continue; // skip unsupported

      const file = await ensureDisplayableImage(original);
      const preview = await this.readAsDataUrl(file);
      const placeholderKey = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const isCover = this.store.draft().photos.length === 0;
      this.store.addPhoto({
        key: placeholderKey,
        preview,
        file,
        isCover,
        progress: 10
      });
      addedCount += 1;

      try {
        const roomId = this.store.draft().roomId;
        const uploaded = await this.uploads.uploadRoomMedia('room-photo', file, roomId);
        this.updatePhotoByKey(placeholderKey, {
          key: uploaded.key,
          url: uploaded.url,
          file: undefined,
          progress: 100,
          error: undefined
        });
      } catch (error) {
        console.error('Room photo upload failed', error);
        uploadError = true;
        this.updatePhotoByKey(placeholderKey, {
          progress: 0,
          error: 'upload-failed'
        });
      }
    }
    if (addedCount) {
      this.toast.success(`Added ${addedCount} photo${addedCount === 1 ? '' : 's'}`);
    }
    if (uploadError) {
      this.toast.error('Some photos failed to upload. Please retry.');
    }
  }

  setCover(index: number): void {
    this.store.setCoverPhoto(index);
  }

  removePhoto(index: number): void {
    this.store.removePhoto(index);
  }

  private updatePhotoByKey(tempKey: string, update: Partial<RoomPhoto>): void {
    const photos = this.store.draft().photos;
    const index = photos.findIndex(p => p.key === tempKey);
    if (index >= 0) {
      this.store.updatePhoto(index, update);
    }
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async retryPhoto(index: number) {
    if (this.retrying) return;
    const photos = this.store.draft().photos;
    const p = photos[index];
    if (!p || !p.error || !p.file) return;
    this.retrying = true;
    this.store.updatePhoto(index, { progress: 5, error: undefined });
    try {
      const roomId = this.store.draft().roomId;
      const uploaded = await this.uploads.uploadRoomMedia('room-photo', p.file, roomId);
      this.store.updatePhoto(index, { key: uploaded.key, url: uploaded.url, file: undefined, progress: 100 });
      this.toast.success('Photo re-uploaded');
    } catch (e) {
      console.error('Retry failed', e);
      this.store.updatePhoto(index, { progress: 0, error: 'upload-failed' });
      this.toast.error('Retry failed. Check connection or try another image.');
    } finally {
      this.retrying = false;
    }
  }
}
