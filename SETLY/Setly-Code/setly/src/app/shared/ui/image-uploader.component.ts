import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type UploadImage = {
  id: string;
  file?: File;
  url?: string;
  preview: string;
};

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent),
      multi: true
    }
  ],
  template: `
    <div class="uploader" [class.disabled]="disabled">
      <input
        type="file"
        #fileInput
        class="hidden-input"
        [attr.multiple]="allowMulti ? '' : null"
        [attr.accept]="accept"
        (change)="onFileSelected($event)"
        [disabled]="disabled"
      />

      <ng-container [ngSwitch]="variant">
        <div *ngSwitchCase="'circle'" class="circle-layout">
          <button
            type="button"
            class="circle-button"
            (click)="openFilePicker()"
            [disabled]="disabled || (allowMulti && images.length >= maxImages)"
            aria-label="Add photos"
          >
            <span aria-hidden="true">+</span>
          </button>
          <div class="circle-helper">
            <p class="helper-primary">{{ helperPrimary || defaultHelperPrimary }}</p>
            <p class="helper-secondary">{{ helperSecondary || defaultHelperSecondary }}</p>
            <p class="helper-counter" *ngIf="images.length">{{ images.length }} / {{ maxImages }} photos</p>
          </div>
          <div
            class="circle-thumbs"
            *ngIf="images.length"
            cdkDropList
            cdkDropListOrientation="horizontal"
            (cdkDropListDropped)="onReorder($event)"
          >
            <div
              class="thumb"
              *ngFor="let image of images; index as idx"
              cdkDrag
              (click)="openViewer(idx)"
            >
              <img [src]="image.preview" alt="Uploaded image {{ idx + 1 }}" />
              <button type="button" class="delete-btn" (click)="removeImage(idx); $event.stopPropagation()" aria-label="Remove image">
                ×
              </button>
            </div>
            <button
              type="button"
              class="thumb add-more"
              *ngIf="allowMulti && images.length < maxImages"
              (click)="openFilePicker()"
              aria-label="Add another photo"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>

        <div *ngSwitchDefault>
          <div
            class="dropzone"
            [class.drag-over]="dragOver"
            (click)="openFilePicker()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            role="button"
            tabindex="0"
            (keyup.enter)="openFilePicker()"
            (keyup.space)="openFilePicker()"
            aria-label="Upload photos"
          >
            <div class="dropzone-content">
              <div class="dropzone-icon">+</div>
              <div class="dropzone-text">
                <p class="title">Drag &amp; drop photos here</p>
                <p class="subtitle">or click to browse from your device</p>
                <p class="hint">Maximum {{ maxImages }} photos • JPG, PNG, WebP</p>
              </div>
            </div>
          </div>

          <ng-container *ngIf="images.length > 0">
            <div
              class="image-grid"
              cdkDropList
              cdkDropListOrientation="horizontal"
              (cdkDropListDropped)="onReorder($event)"
            >
              <div
                class="image-tile"
                *ngFor="let image of images; index as idx"
                cdkDrag
                (click)="openViewer(idx)"
              >
                <img [src]="image.preview" alt="Uploaded image {{ idx + 1 }}" />
                <button type="button" class="delete-btn" (click)="removeImage(idx); $event.stopPropagation()" aria-label="Remove image">
                  ×
                </button>
              </div>
              <button
                type="button"
                class="image-tile add-more"
                *ngIf="allowMulti && images.length < maxImages"
                (click)="openFilePicker()"
              >
                <div class="add-more-icon">+</div>
                <span>Add more photos</span>
              </button>
            </div>
          </ng-container>
        </div>
      </ng-container>
    </div>

    <div class="viewer-backdrop" *ngIf="viewerOpen" (click)="closeViewer()">
      <div
        class="viewer-content"
        (click)="$event.stopPropagation()"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)"
      >
        <button type="button" class="viewer-close" (click)="closeViewer()" aria-label="Close viewer">×</button>
        <button
          type="button"
          class="nav-btn prev"
          *ngIf="images.length > 1"
          (click)="prevImage($event)"
          aria-label="Previous image"
        >
          ‹
        </button>
        <img [src]="images[viewerIndex]?.preview" alt="Preview image" />
        <button
          type="button"
          class="nav-btn next"
          *ngIf="images.length > 1"
          (click)="nextImage($event)"
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .uploader { display:flex; flex-direction:column; gap:18px; }
    .uploader.disabled { opacity:0.6; pointer-events:none; }
    .circle-layout { display:flex; flex-direction:column; gap:12px; align-items:flex-start; }
    .circle-button {
      width:72px;
      height:72px;
      border-radius:50%;
      border:none;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:32px;
      font-weight:700;
      color:#fff;
      background:linear-gradient(135deg,#3A7AFE,#8B5CF6);
      box-shadow:0 14px 32px -18px rgba(58,122,254,0.55);
      transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      cursor:pointer;
    }
    .circle-button:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 18px 40px -22px rgba(99,102,241,0.7); }
    .circle-button:active:not(:disabled) { transform:translateY(1px); }
    .circle-button:disabled { opacity:0.45; cursor:not-allowed; box-shadow:0 0 0 rgba(0,0,0,0); }
  .circle-helper { display:flex; flex-direction:column; gap:4px; font-size:0.85rem; color:#1f2937; text-align:left; }
    .helper-primary { font-weight:600; }
    .helper-secondary { color:#64748b; font-size:0.78rem; }
    .helper-counter { color:#475569; font-size:0.75rem; }
  .circle-thumbs { display:flex; flex-wrap:wrap; gap:10px; margin-top:6px; }
    .thumb {
      position:relative;
      width:90px;
      height:90px;
      border-radius:14px;
      overflow:hidden;
      background:#f1f5f9;
      cursor:pointer;
      box-shadow:0 6px 18px -16px rgba(15,23,42,0.4);
      transition:transform .16s ease, box-shadow .16s ease;
    }
    .thumb:hover { transform:translateY(-1px); box-shadow:0 14px 30px -18px rgba(99,102,241,0.35); }
    .thumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .thumb.add-more { display:flex; align-items:center; justify-content:center; border:2px dashed #cbd5f5; background:transparent; color:#475569; font-size:28px; font-weight:600; }
    .thumb.add-more:hover { border-color:#6366f1; color:#4338ca; }
    .thumb.add-more span { line-height:1; }
    .thumb .delete-btn { width:24px; height:24px; font-size:14px; }
    .dropzone {
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      height:160px;
      border:2px dashed #d1d5db;
      border-radius:16px;
      background:#f9fafb;
      cursor:pointer;
      transition:border-color .2s ease, box-shadow .2s ease, background .2s ease;
    }
    .dropzone.drag-over { border-color:#6366f1; background:#eef2ff; box-shadow:0 14px 32px -18px rgba(99,102,241,0.45); }
    .dropzone:hover { border-color:#6366f1; box-shadow:0 10px 30px -20px rgba(99,102,241,0.4); }
    .dropzone:focus-visible { outline:none; border-color:#4338ca; box-shadow:0 0 0 4px rgba(99,102,241,0.2); }
    .hidden-input { display:none; }
    .dropzone-content { display:flex; align-items:center; gap:16px; }
    .dropzone-icon { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:700; box-shadow:0 10px 24px -14px rgba(99,102,241,0.8); }
    .dropzone-text { display:flex; flex-direction:column; gap:4px; text-align:left; }
    .dropzone-text .title { font-weight:600; color:#1f2937; }
    .dropzone-text .subtitle { font-size:0.9rem; color:#4b5563; }
    .dropzone-text .hint { font-size:0.8rem; color:#6b7280; }

    .image-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:12px; }
    .image-tile { position:relative; width:100%; padding-top:100%; border-radius:12px; overflow:hidden; background:#f3f4f6; cursor:pointer; box-shadow:0 6px 16px -14px rgba(15,23,42,0.5); transition:transform .18s ease, box-shadow .18s ease; }
    .image-tile:hover { transform:translateY(-2px); box-shadow:0 14px 30px -18px rgba(99,102,241,0.35); }
    .image-tile img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .image-tile.add-more { display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px dashed #cbd5f5; background:#f8fafc; color:#475569; font-weight:600; }
    .image-tile.add-more .add-more-icon { font-size:34px; margin-bottom:6px; }
    .delete-btn { position:absolute; top:6px; right:6px; width:28px; height:28px; border:none; border-radius:50%; background:rgba(15,23,42,0.68); color:#fff; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .16s ease; }
    .delete-btn:hover { background:rgba(239,68,68,0.9); }

    .viewer-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fadeIn .2s ease; }
    .viewer-content { position:relative; max-width:90vw; max-height:90vh; display:flex; align-items:center; justify-content:center; }
    .viewer-content img { max-width:90vw; max-height:90vh; border-radius:16px; box-shadow:0 24px 60px -24px rgba(15,23,42,0.9); }
    .viewer-close { position:absolute; top:-44px; right:0; border:none; background:transparent; color:#fff; font-size:36px; cursor:pointer; }
    .nav-btn { position:absolute; top:50%; transform:translateY(-50%); border:none; background:rgba(15,23,42,0.6); color:#fff; width:48px; height:48px; border-radius:50%; font-size:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s ease; }
    .nav-btn:hover { background:rgba(99,102,241,0.8); }
    .nav-btn.prev { left:-64px; }
    .nav-btn.next { right:-64px; }

    @media (max-width: 900px) {
      .nav-btn.prev { left:-44px; }
      .nav-btn.next { right:-44px; }
      .dropzone { padding:0 16px; }
      .dropzone-content { flex-direction:column; text-align:center; }
    }
    @media (max-width: 640px) {
      .image-grid { grid-template-columns:repeat(2, minmax(120px, 1fr)); }
      .viewer-close { top:12px; right:12px; }
      .nav-btn.prev { left:12px; }
      .nav-btn.next { right:12px; }
      .nav-btn { background:rgba(15,23,42,0.4); }
    }
    @media (min-width: 641px) and (max-width: 1023px) {
      .image-grid { grid-template-columns:repeat(3, minmax(120px, 1fr)); }
    }
    @media (min-width: 1024px) {
      .image-grid { grid-template-columns:repeat(4, minmax(120px, 1fr)); }
    }

    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  `]
})
export class ImageUploaderComponent implements ControlValueAccessor, OnChanges, OnDestroy {
  @Input() maxImages = 10;
  @Input() aspectRatio?: number;
  @Input() existingImages: string[] = [];
  @Input() allowMulti = true;
  @Input() variant: 'dropzone' | 'circle' = 'dropzone';
  @Input() helperPrimary?: string;
  @Input() helperSecondary?: string;
  // Accept HEIC/HEIF explicitly in addition to image/* for iOS Safari
  @Input() accept: string = 'image/*,.heic,.heif';

  readonly defaultHelperPrimary = 'Add at least 3 photos';
  readonly defaultHelperSecondary = 'Max 10 • JPG, PNG, WebP';

  @Output() uploadedImages = new EventEmitter<File[]>();
  @Output() deletedImages = new EventEmitter<(UploadImage & { index: number })[]>();
  @Output() reorderedImages = new EventEmitter<UploadImage[]>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  images: UploadImage[] = [];
  private deleted: (UploadImage & { index: number })[] = [];
  private objectUrls = new Set<string>();

  disabled = false;
  dragOver = false;

  viewerOpen = false;
  viewerIndex = 0;
  private touchStartX = 0;

  private onChange: (value: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImages'] && this.existingImages?.length && this.images.length === 0) {
      this.setExistingImages(this.existingImages);
    }
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls.clear();
    document.body.style.overflow = '';
  }

  writeValue(value: (File | string | UploadImage)[] | null): void {
    this.deleted = [];
    if (!value) {
      this.images = [];
      this.emitAll();
      return;
    }
    this.images = [];
    value.forEach(item => {
      if (item instanceof File) {
        this.pushFile(item);
      } else if (typeof item === 'string') {
        this.images.push({ id: this.generateId(), url: item, preview: item });
      } else if (item && typeof item === 'object') {
        const source = item as UploadImage;
        if (source.file) {
          this.pushFile(source.file);
        } else if (source.url) {
          this.images.push({ id: this.generateId(), url: source.url, preview: source.preview || source.url });
        }
      }
    });
    this.emitAll();
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openFilePicker(): void {
    if (this.disabled || (this.images.length >= this.maxImages && this.allowMulti)) return;
    this.fileInput?.nativeElement.click();
    this.onTouched();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;
    this.addFiles(input.files);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    this.addFiles(files);
  }

  removeImage(index: number): void {
    const [removed] = this.images.splice(index, 1);
    if (!removed) return;
    if (removed.file && removed.preview.startsWith('blob:')) {
      URL.revokeObjectURL(removed.preview);
      this.objectUrls.delete(removed.preview);
    }
    if (!removed.file && removed.url) {
      this.deleted.push({ ...removed, index });
    }
    this.onTouched();
    this.emitAll();
  }

  onReorder(event: CdkDragDrop<UploadImage[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
    this.emitAll({ emitDeleted: false });
  }

  openViewer(index: number): void {
    this.viewerIndex = index;
    this.viewerOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeViewer(): void {
    this.viewerOpen = false;
    document.body.style.overflow = '';
  }

  nextImage(event?: Event): void {
    event?.stopPropagation();
    if (!this.images.length) return;
    this.viewerIndex = (this.viewerIndex + 1) % this.images.length;
  }

  prevImage(event?: Event): void {
    event?.stopPropagation();
    if (!this.images.length) return;
    this.viewerIndex = (this.viewerIndex - 1 + this.images.length) % this.images.length;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? 0;
  }

  onTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - this.touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) {
      this.prevImage();
    } else {
      this.nextImage();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.viewerOpen) return;
    if (event.key === 'Escape') {
      this.closeViewer();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevImage();
    }
  }

  private addFiles(files: FileList | File[]): void {
    const items = Array.from(files);
    const availableSlots = this.maxImages - this.images.length;
    if (availableSlots <= 0) return;

    const accepted = items.filter(f => f.type.startsWith('image/')).slice(0, availableSlots);
    if (!accepted.length) return;

    accepted.forEach(file => this.pushFile(file));
    this.onTouched();
    this.emitAll();
  }

  private pushFile(file: File): void {
    const preview = URL.createObjectURL(file);
    this.objectUrls.add(preview);
    const image: UploadImage = { id: this.generateId(), file, preview };
    if (!this.allowMulti) {
      this.images = [image];
    } else {
      this.images.push(image);
    }
  }

  private setExistingImages(images: string[]): void {
    this.deleted = [];
    this.images = images.map(url => ({ id: this.generateId(), url, preview: url }));
    this.emitAll({ emitDeleted: false });
  }

  private emitAll(options: { emitDeleted?: boolean } = {}): void {
    const files = this.images.filter(img => !!img.file).map(img => img.file!);
    this.onChange(files);
    this.uploadedImages.emit(files);
    if (options.emitDeleted !== false) {
      this.deletedImages.emit([...this.deleted]);
    }
    this.reorderedImages.emit([...this.images]);
  }

  private generateId(): string {
    return 'img-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
