import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RoomsService } from '../../core/services/rooms.service';
import { ToastService } from '../../core/services/toast.service';
import { UniversitySearchComponent } from '../../shared/ui/university-search.component';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';
import { AddressAutocompleteComponent } from '../../shared/ui/address-autocomplete.component';
import { UploadsService } from '../../core/services/uploads.service';
import { NgFor } from '@angular/common';
import { AuthStore } from '../../core/state/auth.store';

@Component({
  selector: 'app-open-room-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UniversitySearchComponent, LocationAutocompleteComponent, AddressAutocompleteComponent],
  template: `
    <section class="bg-gradient-to-b from-white to-gray-50">
      <div class="container mx-auto px-4 max-w-5xl py-8">
        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-2">List your room</h1>
        <p class="text-gray-600 mb-8">Make it irresistible to students. You can always edit later.</p>

        <form class="space-y-8" (ngSubmit)="publish()" aria-label="Create room listing">
          <!-- Essentials Card -->
          <fieldset class="rounded-2xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm overflow-hidden" aria-describedby="essentials-help">
            <legend class="px-6 pt-5 text-lg font-medium text-gray-900">Essentials</legend>
            <div class="px-6 -mt-1 mb-4 text-sm text-gray-500" id="essentials-help">Title, description, location and pricing</div>
            <div class="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="label-premium">Title</label>
                <input [(ngModel)]="model.title" name="title" type="text" class="input-premium" placeholder="Cozy private room near campus" aria-describedby="title-help" />
                <p id="title-help" class="help-text">Keep it short and descriptive.</p>
              </div>

              <div class="md:col-span-2">
                <label class="label-premium">Description</label>
                <textarea [(ngModel)]="model.description" name="description" rows="5" class="input-premium" placeholder="Tell students about your place (optional)"></textarea>
              </div>

              <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="label-premium">City / State</label>
                  <app-location-autocomplete (picked)="onLocationPicked($event)" [initialCity]="model.city" [initialState]="model.state"></app-location-autocomplete>
                  <p class="help-text">Select your city and state first.</p>
                </div>
                <div>
                  <label class="label-premium">Address</label>
                  <app-address-autocomplete (picked)="onAddressPicked($event)"
                    [biasCity]="model.city" [biasState]="model.state" [biasLat]="model.lat" [biasLon]="model.lon"
                    [disabled]="!(model.city && model.state)"
                    [placeholder]="(model.city && model.state) ? 'Street address' : 'Select city & state first'"
                  ></app-address-autocomplete>
                  <p class="help-text">Type your street address (no apartment #). Suggestions are prioritized for your city/state.</p>
                </div>
              </div>

              <div>
                <label class="label-premium">Monthly Price ($)</label>
                <input [(ngModel)]="model.price" name="price" type="number" min="0" class="input-premium" placeholder="900" />
              </div>
              <div>
                <label class="label-premium">Security Deposit ($)</label>
                <input [(ngModel)]="model.deposit" name="deposit" type="number" min="0" class="input-premium" placeholder="500" />
              </div>
            </div>
          </fieldset>

          <!-- Proximity Card -->
          <fieldset class="rounded-2xl border border-gray-200 bg-white/80 shadow-sm overflow-hidden" aria-describedby="proximity-help">
            <legend class="px-6 pt-5 text-lg font-medium text-gray-900">Near a university?</legend>
            <div class="px-6 -mt-1 mb-4 text-sm text-gray-500" id="proximity-help">Help students find you faster</div>
            <div class="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="label-premium">Select university (optional)</label>
                <app-university-search (picked)="onUniversityPicked($event)"></app-university-search>
              </div>
              <div>
                <label class="label-premium">Distance to campus (miles)</label>
                <input [(ngModel)]="model.distanceMiles" name="distanceMiles" type="number" min="0" step="0.1" class="input-premium" placeholder="0.8" />
                <p class="help-text">If unknown, estimate or leave blank.</p>
              </div>
            </div>
          </fieldset>

          <!-- Amenities Card -->
          <fieldset class="rounded-2xl border border-gray-200 bg-white/80 shadow-sm overflow-hidden" aria-describedby="amenities-help">
            <legend class="px-6 pt-5 text-lg font-medium text-gray-900">Amenities</legend>
            <div class="px-6 -mt-1 mb-4 text-sm text-gray-500" id="amenities-help">What’s included for a comfortable stay</div>
            <div class="px-6 pb-6">
              <div class="flex flex-wrap gap-2" role="group" aria-label="Select included amenities">
                <button type="button" *ngFor="let a of amenityPresets" (click)="toggleAmenity(a)"
                        class="px-3 py-2 rounded-full text-sm border transition"
                        [class.bg-gray-900]="hasAmenity(a)" [class.text-white]="hasAmenity(a)" [class.border-gray-900]="hasAmenity(a)"
                        [class.bg-white]="!hasAmenity(a)" [class.text-gray-700]="!hasAmenity(a)" [class.border-gray-300]="!hasAmenity(a)"
                        aria-pressed="{{hasAmenity(a)}}">
                  {{ a }}
                </button>
              </div>
            </div>
          </fieldset>

          <!-- Media Card -->
          <fieldset class="rounded-2xl border border-gray-200 bg-white/80 shadow-sm overflow-hidden" aria-describedby="media-help">
            <legend class="px-6 pt-5 text-lg font-medium text-gray-900">Photos & videos</legend>
            <div class="px-6 -mt-1 mb-4 text-sm text-gray-500" id="media-help">Add 3–12 photos. You can also include short videos.</div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <div class="media-counter" aria-live="polite">{{ model.photos.length }} photo(s){{ model.videos.length ? ', '+model.videos.length+' video(s)' : '' }} • Min 3, Max 12 photos</div>
                <div class="flex items-center gap-3">
                  <label class="btn-primary px-4 cursor-pointer" for="photoInput">Add photos</label>
                  <label class="btn-primary px-4 cursor-pointer bg-gray-800 hover:bg-gray-900" for="videoInput">Add video</label>
                </div>
              </div>

              <input id="photoInput" type="file" multiple accept="image/*,.heic,.heif" (change)="onPhotos($event)" class="sr-only" aria-label="Add photos" />
              <input id="videoInput" type="file" accept="video/*" (change)="onVideo($event)" class="sr-only" aria-label="Add video" />

              <div class="media-grid" *ngIf="model.photos.length || model.videos.length" aria-label="Selected media" role="list">
                <div class="media-tile group" *ngFor="let p of model.photos; let i = index" role="listitem">
                  <img [src]="p" alt="Room photo {{i+1}}" />
                  <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-1">
                    <div class="flex justify-end gap-1">
                      <button type="button" class="media-btn" aria-label="Move photo left" (click)="movePhoto(i,-1)" [disabled]="i===0">←</button>
                      <button type="button" class="media-btn" aria-label="Move photo right" (click)="movePhoto(i,1)" [disabled]="i===model.photos.length-1">→</button>
                      <button type="button" class="media-btn text-red-300" aria-label="Remove photo" (click)="removePhoto(i)">✕</button>
                    </div>
                  </div>
                </div>
                <div class="media-tile group" *ngFor="let v of model.videos; let vi = index" role="listitem">
                  <video [src]="v.url" muted playsinline aria-label="Room video {{vi+1}}"></video>
                  <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-1">
                    <div class="flex justify-end gap-1">
                      <button type="button" class="media-btn" aria-label="Remove video" (click)="removeVideo(vi)">✕</button>
                    </div>
                  </div>
                </div>
                <label class="media-tile media-add" for="photoInput" *ngIf="model.photos.length < 12">
                  <div class="plus" aria-hidden="true">+</div>
                </label>
              </div>

              <p class="help-text">Uploads are simulated now; we preview images/videos locally.</p>
            </div>
          </fieldset>

          <div class="pt-2">
            <button type="submit" class="btn-primary w-full md:w-auto px-6">Publish listing</button>
          </div>
        </form>
      </div>
    </section>
  `
})
export class OpenRoomPage {
  private rooms = inject(RoomsService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private uploads = inject(UploadsService);
  private auth = inject(AuthStore);

  model: any = {
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    lat: undefined as number | undefined,
    lon: undefined as number | undefined,
    price: 0,
    deposit: 0,
    universityId: undefined as string | undefined,
    distanceMiles: undefined as number | undefined,
    amenities: [] as string[],
    photos: [] as string[],
    videos: [] as { url: string; thumb?: string }[],
    uploading: false,
    loading: true,
  };

  amenityPresets = ['Wi‑Fi', 'Air Conditioning', 'Heating', 'Laundry', 'Parking', 'Kitchen', 'Gym', 'Study Area', 'Furnished', 'Private Bath'];

  ngOnInit() {
    // Simulate brief loading for skeleton
    setTimeout(() => this.model.loading = false, 350);
  }

  onUniversityPicked(u: { id: string; name: string; city?: string; state?: string }) {
    this.model.universityId = u?.id;
  }

  onLocationPicked(loc: { city: string; state: string; country?: string; lat?: number; lon?: number }) {
    this.model.city = loc.city;
    this.model.state = loc.state;
    this.model.lat = loc.lat;
    this.model.lon = loc.lon;
  }

  onAddressPicked(addr: { address: string; city?: string; state?: string; postcode?: string; lat?: number; lon?: number }) {
    this.model.address = addr.address;
    // If city/state came with address, set them too for convenience
    if (addr.city) this.model.city = addr.city;
    if (addr.state) this.model.state = addr.state;
    if (addr.lat) this.model.lat = addr.lat;
    if (addr.lon) this.model.lon = addr.lon;
    if (addr.postcode) this.model.postcode = addr.postcode;
  }

  hasAmenity(a: string) { return this.model.amenities.includes(a); }
  toggleAmenity(a: string) {
    const i = this.model.amenities.indexOf(a);
    if (i >= 0) this.model.amenities.splice(i, 1);
    else this.model.amenities.push(a);
  }

  onPhotos(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    // Client-side validation: only images and <= 8MB
    const valid = files.filter(f => {
      const typeOk = f.type ? f.type.startsWith('image/') : /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name);
      return typeOk && f.size <= 8 * 1024 * 1024;
    });
    const rejected = files.filter(f => !valid.includes(f));
    if (rejected.length) {
      this.toast.error(`Removed ${rejected.length} invalid file(s). Use images up to 8MB.`);
    }
    // Enforce min/max: we allow adding up to 12 photos total
    const remaining = 12 - this.model.photos.length;
  const selected = valid.slice(0, Math.max(0, remaining));
  // Convert HEIC/HEIF to JPEG before upload so images display in all browsers
  this.convertAndUpload(selected);
    // Accessibility announcement when count is below min
    if (this.model.photos.length < 3) {
      setTimeout(() => {
        const msg = `You have ${this.model.photos.length} photo${this.model.photos.length===1?'':'s'}. Add at least ${3 - this.model.photos.length} more.`;
        (document.getElementById('photoInput') as HTMLInputElement)?.setAttribute('aria-describedby', 'photo-help');
        const ann = document.getElementById('photo-help');
        if (ann) ann.textContent = msg;
      });
    }
  }

  private async convertAndUpload(files: File[]) {
    if (!files.length) return;
    const { ensureDisplayableImage } = await import('../../core/utils/heic');
    const converted: File[] = [];
    for (const f of files) {
      converted.push(await ensureDisplayableImage(f));
    }
    await this.uploadBatch(converted, 'room-photo');
  }

  onVideo(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files) return;
    const f = input.files[0];
    if (!f) return;
    if (!(f.type.startsWith('video/')) || f.size > 50 * 1024 * 1024) {
      this.toast.error('Video must be MP4/WebM up to 50MB');
      return;
    }
    this.uploadVideo(f);
  }

  async uploadBatch(files: File[], type: 'room-photo') {
    if (!files.length) return;
    this.model.uploading = true;
    try {
      for (const file of files) {
        const url = await this.uploads.uploadRoomMedia(type, file);
        this.model.photos.push(url);
      }
    } catch (e:any) {
      console.error(e);
      this.toast.error('Photo upload failed');
    } finally {
      this.model.uploading = false;
    }
  }

  async uploadVideo(file: File) {
    this.model.uploading = true;
    try {
      const url = await this.uploads.uploadRoomMedia('room-video', file);
      // Simple thumbnail: create object URL for first frame fallback (could be server-side later)
      const thumbUrl = URL.createObjectURL(file);
      this.model.videos.push({ url, thumb: thumbUrl });
    } catch (e:any) {
      console.error(e);
      this.toast.error('Video upload failed');
    } finally {
      this.model.uploading = false;
    }
  }

  movePhoto(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= this.model.photos.length) return;
    const arr = this.model.photos;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  removePhoto(i: number) {
    this.model.photos.splice(i,1);
  }
  removeVideo(i: number) {
    this.model.videos.splice(i,1);
  }

  async publish() {
    try {
      // Require address
      if (!this.model.address || !String(this.model.address).trim()) {
        this.toast.error('Please select your street address');
        return;
      }
      const room: any = {
        title: this.model.title || 'Untitled Room',
        description: this.model.description || 'No description yet',
        address: this.model.address || undefined,
        lat: typeof this.model.lat === 'number' ? this.model.lat : undefined,
        lon: typeof this.model.lon === 'number' ? this.model.lon : undefined,
        city: this.model.city || 'Unknown',
        state: this.model.state || '',
        price: this.model.price || 0,
        deposit: this.model.deposit || 0,
        roomType: 'private',
        bath: 'shared',
        furnished: this.model.amenities.includes('Furnished'),
        rules: { vegetarian: false, smoking: false, petsOk: false },
        distanceKm: this.model.distanceMiles ? Math.round(this.model.distanceMiles * 1.60934 * 10) / 10 : undefined,
        photos: this.model.photos,
  videos: this.model.videos.map((v: { url: string; thumb?: string }) => v.url),
  hostId: (this.auth.user()?.userId) || 'dev-user',
        amenities: this.model.amenities,
        universityId: this.model.universityId,
      };
      // Enforce 3-12 photos before submit
      if ((room.photos?.length || 0) < 3) {
        this.toast.error('Please add at least 3 photos');
        return;
      }
      if (room.photos.length > 12) {
        this.toast.error('Max 12 photos');
        return;
      }
      await this.rooms.create(room).toPromise();
      this.toast.success('Room published');
      this.router.navigate(['/browse']);
    } catch (e) {
      console.error(e);
      this.toast.error('Failed to publish');
    }
  }
}
