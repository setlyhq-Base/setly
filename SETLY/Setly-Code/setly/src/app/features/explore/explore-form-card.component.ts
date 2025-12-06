import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { UploadsService } from '../../core/services/uploads.service';
import { RoomsService } from '../../core/services/rooms.service';
import { CurrentUserService } from '../../core/user/current-user.service';
import { ToastService } from '../../core/services/toast.service';
import { RoomStore } from '../../core/state/room.store';
import { RoomsSearchFormComponent } from './rooms-search-form.component';
import { RoomsPostFormComponent } from './rooms-post-form.component';
import { RidesSearchFormComponent } from './rides-search-form.component';
import { RidesPostFormComponent } from './rides-post-form.component';
import { MarketSearchFormComponent } from './market-search-form.component';
import { MarketPostFormComponent } from './market-post-form.component';

const minArrayLength = (min: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const length = Array.isArray(value) ? value.length : 0;
    return length >= min ? null : { minArrayLength: { requiredLength: min, actualLength: length } };
  };
};

@Component({
  selector: 'app-explore-form-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RoomsSearchFormComponent, RoomsPostFormComponent, RidesSearchFormComponent, RidesPostFormComponent, MarketSearchFormComponent, MarketPostFormComponent],
  template: `
    <div class="card-shell" [ngClass]="'tab-' + tab">
      <div class="card-inner">
        <div class="mode-toggle">
          <div class="toggle-pill">
            <button type="button" class="toggle-btn" [class.active]="mode() === 'search'" (click)="setMode('search')">Search</button>
            <button type="button" class="toggle-btn" [class.active]="mode() === 'post'" (click)="setMode('post')">Post</button>
          </div>
        </div>
        <div class="form-body fade-switch" [attr.data-mode]="mode()">
        <ng-container *ngIf="tab === 'rooms' && mode() === 'search'">
          <app-rooms-search-form [form]="roomsSearchForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'rooms' && mode() === 'post'">
          <app-rooms-post-form [form]="roomsPostForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'rides' && mode() === 'search'">
          <app-rides-search-form [form]="ridesSearchForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'rides' && mode() === 'post'">
          <app-rides-post-form [form]="ridesPostForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'market' && mode() === 'search'">
          <app-market-search-form [form]="marketSearchForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'market' && mode() === 'post'">
          <app-market-post-form [form]="marketPostForm" />
        </ng-container>
        </div>
        <div *ngIf="uploadProgress().length > 0" class="upload-progress-section">
          <h4 class="upload-progress-title">Upload Progress</h4>
          <div class="upload-progress-list">
            <div *ngFor="let upload of uploadProgress()" class="upload-progress-item">
              <div class="upload-file-info">
                <span class="upload-filename">{{ upload.filename }}</span>
                <span class="upload-status" [class]="'status-' + upload.status">{{ upload.status }}</span>
              </div>
              <div *ngIf="upload.status === 'uploading'" class="upload-progress-bar">
                <div class="progress-fill" [style.width.%]="upload.progress || 0"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="cta-row">
          <button class="form-main-btn" [disabled]="loading()" (click)="submit()">
            <span *ngIf="!loading()">{{ mainButtonLabel() }}</span>
            <span *ngIf="loading()" class="loading-dots">{{ mainButtonLabel() }}</span>
          </button>
        </div>
        <p *ngIf="error()" class="error-text">{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .card-shell {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      position: relative;
      background: #FFFFFF;
      border-radius: 28px;
      border: 1px solid #ECECEC;
      box-shadow: 0 4px 20px -8px rgba(10, 26, 63, 0.1);
      padding: clamp(26px, 3vw, 32px);
      overflow: hidden;
      transition: box-shadow 0.3s ease;
      /* Background image defaults - will be overridden per tab */
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .card-shell:hover {
      box-shadow: 0 8px 32px -8px rgba(10, 26, 63, 0.15);
    }
    
    /* Dynamic background images per tab - restore original images */
    .card-shell.tab-rooms {
      background-image: url('/assets/images/backgrounds/bg-rooms.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .card-shell.tab-rides {
      background-image: url('/assets/images/backgrounds/bg-rides.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .card-shell.tab-market {
      background-image: url('/assets/images/backgrounds/bg-marketplace.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    /* Overlay to ensure form contents remain visible on images */
    .card-shell::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.75); /* 75% opacity for readability */
      backdrop-filter: blur(3px); /* Subtle blur for depth */
      border-radius: 28px;
      pointer-events: none;
      z-index: 1;
    }
    
    .card-inner {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: relative;
      z-index: 2;
    }
    .mode-toggle { display: flex; justify-content: center; }
    .toggle-pill {
      display: inline-flex;
      padding: 4px;
      border-radius: 999px;
      background: rgba(10,26,63,0.04);
      border: 1px solid #ECECEC;
      gap: 6px;
    }
    .toggle-btn {
      min-width: 110px;
      padding: 9px 18px;
      border-radius: 999px;
      border: 1px solid #3E8FFF;
      background: #FFFFFF;
      color: #3E8FFF;
      font-weight: 600;
      font-size: 0.95rem;
      transition: background .2s, color .2s, box-shadow .2s;
      cursor: pointer;
    }
    .toggle-btn.active {
      background: #3E8FFF;
      color: #FFFFFF;
      box-shadow: 0 4px 12px -8px rgba(62, 143, 255, 0.4);
      border: 1px solid #3E8FFF;
    }
    .toggle-btn:hover:not(.active) {
      background: rgba(62, 143, 255, 0.05);
    }
    .toggle-btn:focus-visible {
      outline: 2px solid rgba(62, 143, 255, 0.4);
      outline-offset: 2px;
    }
    .form-body { display: flex; flex-direction: column; gap: 24px; }
    .fade-switch { transition: opacity .22s; }
  .cta-row { display:flex; justify-content:center; margin-top: 12px; }
    .form-main-btn {
      border-radius: 999px;
      background: #3E8FFF;
      color: #fff;
      border: none;
      box-shadow: 0 8px 24px -12px rgba(62, 143, 255, 0.4);
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.01em;
      padding: 14px 36px;
      min-width: 220px;
      transition: transform .2s, box-shadow .2s, background .2s;
    }
    .form-main-btn:hover { 
      transform: translateY(-1px); 
      box-shadow: 0 12px 32px -14px rgba(62, 143, 255, 0.5);
      background: #5BA0FF;
    }
    .form-main-btn:active { transform: translateY(0); }
    .form-main-btn[disabled] { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:0 8px 24px -16px rgba(62, 143, 255, 0.3); }
    .error-text { text-align:center; font-size:0.85rem; color:#e11d48; }
    @media (max-width: 900px) {
      .card-shell { padding: 24px; border-radius: 24px; }
      .card-inner { gap: 22px; }
      .toggle-btn { min-width: 100px; font-size: 0.9rem; }
    }
    @media (max-width: 640px) {
      .card-shell { padding: 22px 18px; border-radius: 22px; }
      .card-inner { gap: 20px; }
      .form-body { gap: 20px; }
      .form-main-btn { width: 100%; min-width: 0; }
    }
    
    /* Upload Progress Styles */
    .upload-progress-section {
      margin: 16px 0;
      padding: 16px;
      background: rgba(249, 250, 251, 0.8);
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.6);
    }
    .upload-progress-title {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    .upload-progress-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .upload-progress-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .upload-file-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .upload-filename {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }
    .upload-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .status-pending {
      background: rgba(156, 163, 175, 0.2);
      color: #6b7280;
    }
    .status-uploading {
      background: rgba(59, 130, 246, 0.2);
      color: #2563eb;
    }
    .status-success {
      background: rgba(34, 197, 94, 0.2);
      color: #16a34a;
    }
    .status-failed {
      background: rgba(239, 68, 68, 0.2);
      color: #dc2626;
    }
    .upload-progress-bar {
      height: 4px;
      background: rgba(226, 232, 240, 0.8);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  `]
})
export class ExploreFormCardComponent implements OnInit, OnChanges {
  @Input() tab: 'rooms' | 'rides' | 'market' = 'rooms';
  @Output() action = new EventEmitter<{ tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }>();
  mode = signal<'search' | 'post'>('search');
  loading = signal(false);
  error = signal('');
  uploadProgress = signal<{ filename: string; status: 'pending' | 'uploading' | 'success' | 'failed'; progress?: number }[]>([]);
  private lastMode: Record<string, 'search' | 'post'> = { rooms: 'search', rides: 'search', market: 'search' };

  ngOnInit() {
    console.log('ExploreFormCard initialized with tab:', this.tab);
  }

  roomsSearchForm: FormGroup;
  roomsPostForm: FormGroup;
  ridesSearchForm: FormGroup;
  ridesPostForm: FormGroup;
  marketSearchForm: FormGroup;
  marketPostForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.roomsSearchForm = this.fb.group({
      location: ['', Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      roomType: ['shared', Validators.required]
    });
    this.roomsPostForm = this.fb.group({
      city: ['', Validators.required],
      state: [''],
      cityLat: [null],
      cityLon: [null],
      address: ['', Validators.required],
      addressLat: [null],
      addressLon: [null],
      roomType: ['shared', Validators.required],
      price: [null, [Validators.required, Validators.min(50)]],
      amenities: [[], [minArrayLength(1)]],
      description: [''],
      photos: [[], [minArrayLength(3)]]
    });
    this.ridesSearchForm = this.fb.group({
      pickup: ['', Validators.required],
      destination: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      seats: [1, [Validators.required, Validators.min(1), Validators.max(4)]]
    });
    this.ridesPostForm = this.fb.group({
      pickup: ['', Validators.required],
      destination: ['', Validators.required],
      departure: ['', Validators.required],
      seatsAvailable: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      luggage: [false],
      notes: ['']
    });
    this.marketSearchForm = this.fb.group({
      term: ['', Validators.required],
      category: [''],
      priceRange: [''],
      location: ['']
    });
    this.marketPostForm = this.fb.group({
      title: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
  photos: [[], Validators.required],
      condition: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  setMode(m: 'search' | 'post') {
    this.mode.set(m);
    this.lastMode[this.tab] = m;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tab']) {
      console.log('Tab changed to:', this.tab);
    }
    this.mode.set(this.lastMode[this.tab] || 'search');
  }
  mainButtonLabel = computed(() => {
    if (this.mode() === 'search') {
      if (this.tab === 'rooms') return 'Search Rooms';
      if (this.tab === 'rides') return 'Search Rides';
      return 'Search Items';
    }
    if (this.tab === 'rooms') return 'Post Room';
    if (this.tab === 'rides') return 'Post Ride';
    return 'Post Item';
  });

  private currentForm(): FormGroup {
    if (this.tab === 'rooms') return this.mode() === 'search' ? this.roomsSearchForm : this.roomsPostForm;
    if (this.tab === 'rides') return this.mode() === 'search' ? this.ridesSearchForm : this.ridesPostForm;
    return this.mode() === 'search' ? this.marketSearchForm : this.marketPostForm;
  }

  submit() {
    const form = this.currentForm();
    if (!form) return;
    this.error.set('');
    if (form.invalid) {
      form.markAllAsTouched();
      this.error.set('Please complete the highlighted fields.');
      return;
    }
    if (this.tab === 'rooms' && this.mode() === 'post') {
      this.postRoom();
      return;
    }
    // Non-room flows emit event directly
    this.loading.set(true);
    const payload = form.getRawValue();
    this.action.emit({ tab: this.tab, mode: this.mode(), payload });
    this.loading.set(false);
  }

  // --- Room posting logic (S3 upload + create listing) ---
  private uploads = inject(UploadsService);
  private roomsService = inject(RoomsService);
  private currentUser = inject(CurrentUserService);
  private toast = inject(ToastService);
  private roomStore = inject(RoomStore);

  private updateUploadProgress(index: number, updates: Partial<{ status: 'pending' | 'uploading' | 'success' | 'failed'; progress?: number }>) {
    const current = this.uploadProgress();
    if (index >= 0 && index < current.length) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.uploadProgress.set(updated);
    }
  }

  private async postRoom(): Promise<void> {
    const raw = this.roomsPostForm.getRawValue();
    const files: File[] = Array.isArray(raw.photos) ? raw.photos.filter((f: any) => f instanceof File) : [];
    if (files.length < 3) {
      this.error.set('Please add at least 3 photos.');
      this.roomsPostForm.get('photos')?.markAsTouched();
      return;
    }
    const user = this.currentUser.currentUser();
    if (!user) {
      this.error.set('Sign in required to post a room.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    
    // Initialize progress tracking
    const progressItems = files.map((f: File) => ({
      filename: f.name,
      status: 'pending' as const,
      progress: 0
    }));
    this.uploadProgress.set(progressItems);
    
    try {
      // Convert HEIC/HEIF to JPEG for better compatibility
      const { ensureDisplayableImage } = await import('../../core/utils/heic');
      const preparedFiles: File[] = [];
      const fileMetas: { ext?: string; contentType?: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        // Update progress: processing
        this.updateUploadProgress(i, { status: 'uploading', progress: 10 });
        
        let out = f;
        try { out = await ensureDisplayableImage(f); } catch {}
        preparedFiles.push(out);
        const type = out.type || '';
        const extFromType = type.split('/')[1]?.split(';')[0];
        const extFromName = (out.name?.split('.').pop() || '').toLowerCase();
        const ext = (extFromType || extFromName || 'jpg').replace(/^jpg$/,'jpeg');
        fileMetas.push({ ext, contentType: type || (ext ? `image/${ext}` : undefined) });
        
        // Update progress: processed
        this.updateUploadProgress(i, { status: 'uploading', progress: 20 });
      }

      // Step 1: init on backend to get S3 presigns
      const initPayload: any = {
        city: raw.city, state: raw.state, address: raw.address,
        roomType: raw.roomType, price: Number(raw.price) || 0,
        amenities: raw.amenities, description: raw.description,
        files: fileMetas
      };
      const initResp = await this.roomsService.initUpload(initPayload).toPromise();
      if (!initResp || !initResp.uploads?.length) {
        this.error.set('Failed to prepare uploads.');
        this.loading.set(false); return;
      }
      const { roomId, uploads } = initResp as any;
      if (uploads.length !== preparedFiles.length) {
        this.error.set('Upload preparation mismatch.');
        this.loading.set(false); return;
      }

      // Step 2: upload each file with provided presign
      const uploadResults = await Promise.allSettled(uploads.map(async (p: any, idx: number) => {
        try {
          // Update progress: starting upload
          this.updateUploadProgress(idx, { status: 'uploading', progress: 30 });
          const result = await this.uploads.uploadToS3(p, preparedFiles[idx]);
          // Update progress: upload complete
          this.updateUploadProgress(idx, { status: 'success', progress: 100 });
          return result;
        } catch (error) {
          // Update progress: upload failed
          this.updateUploadProgress(idx, { status: 'failed', progress: 0 });
          throw error;
        }
      }));
      const succeeded = uploads.filter((p: any, i: number) => uploadResults[i]?.status === 'fulfilled');
      const uploadedUrls: string[] = succeeded.map((p: any) => p.publicUrl).filter(Boolean);
      const failedCount = uploadResults.filter((r: any) => r.status === 'rejected').length;
      if (failedCount > 0) this.toast.warning(`${failedCount} photo${failedCount === 1 ? '' : 's'} failed to upload.`);
      if (uploadedUrls.length < 3) { this.error.set('Minimum 3 successful photo uploads required.'); this.loading.set(false); return; }

      const listingPayload: any = {
        title: `${raw.roomType || 'Room'} in ${raw.city}`.trim(),
        description: raw.description || 'No description yet',
        address: raw.address || undefined,
        lat: typeof raw.addressLat === 'number' ? raw.addressLat : undefined,
        lon: typeof raw.addressLon === 'number' ? raw.addressLon : undefined,
        city: raw.city || '',
        state: raw.state || '',
        price: Number(raw.price) || 0,
        roomType: (raw.roomType === 'private' ? 'private' : 'shared'),
        bath: 'shared',
        furnished: Array.isArray(raw.amenities) ? raw.amenities.includes('furnished') : false,
        rules: { 
          vegetarian: false, 
          smoking: false, 
          petsOk: false 
        },
        distanceKm: undefined,
        photos: uploadedUrls,
        image: uploadedUrls[0],
        amenities: Array.isArray(raw.amenities) ? raw.amenities.filter((a: string) => a !== 'furnished') : [],
        universityId: undefined
      };
      // Step 3: publish created listing using uploaded photo URLs
      const created = await this.roomsService.publish(roomId, listingPayload).toPromise();
      if (!created) {
        this.error.set('Failed to create listing.');
        this.loading.set(false);
        return;
      }
      // Add to RoomStore for immediate visibility
      const features: string[] = [];
      if (created.roomType === 'private') features.push('Private room');
      if (created.furnished) features.push('Furnished');
      if (!created.rules?.smoking) features.push('No smoking');
      if (created.rules?.petsOk) features.push('Pets ok');
      const card = {
        id: created.id,
        title: created.title,
        price: created.price,
        image: created.image || created.photos?.[0] || '/assets/placeholder-room.jpg',
        address: [created.city, created.state].filter(Boolean).join(', '),
        distance: created.distanceKm ? `${created.distanceKm} km` : '',
        features,
        isAvailable: true,
        availabilityStart: created.availabilityStart,
        availabilityEnd: created.availabilityEnd,
        city: created.city,
        hostName: user.displayName || 'Host'
      } as any; // RoomCard structure
      this.roomStore.addRoom(card);
      this.toast.success('Room posted successfully');
      // Reset form minimal fields (retain city for convenience)
      this.roomsPostForm.patchValue({ description: '', price: null, photos: [] });
      this.roomsPostForm.get('photos')?.setValue([]);
      this.roomsPostForm.markAsPristine();
      this.action.emit({ tab: 'rooms', mode: 'post', payload: listingPayload });
      // Clear upload progress after success
      setTimeout(() => this.uploadProgress.set([]), 2000);
    } catch (e: any) {
      console.error(e);
      this.error.set('Unexpected error posting room.');
    } finally {
      this.loading.set(false);
      // Clear upload progress on error after a delay
      if (this.uploadProgress().length > 0) {
        setTimeout(() => this.uploadProgress.set([]), 3000);
      }
    }
  }
}
