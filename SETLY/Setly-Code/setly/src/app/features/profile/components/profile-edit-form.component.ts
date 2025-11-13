import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserStore } from '../../../core/state/user.store';
import { ToastService } from '../../../core/services/toast.service';
import { UploadsService } from '../../../core/services/uploads.service';

@Component({
  selector: 'app-profile-edit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6" novalidate>
      <!-- Banner Upload -->
      <div>
        <label class="label">Banner</label>
        <div class="relative h-28 w-full rounded-xl overflow-hidden border bg-gray-50">
          <img *ngIf="bannerPreviewUrl || userStore.user()?.coverImageUrl" [src]="bannerPreviewUrl || userStore.user()?.coverImageUrl" class="w-full h-full object-cover" alt="banner preview"/>
          <div *ngIf="!(bannerPreviewUrl || userStore.user()?.coverImageUrl)" class="w-full h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-70"></div>
        </div>
        <div class="mt-2">
          <input type="file" accept="image/png,image/jpeg,image/webp" (change)="onBannerChange($event)"/>
        </div>
        <p class="text-xs text-gray-500 mt-1">Recommended 1200x300. PNG/JPG/WebP up to 8MB</p>
      </div>
      <!-- Avatar Upload -->
      <div>
        <label class="label">Avatar</label>
        <div class="flex items-center gap-4">
          <img [src]="previewUrl || userStore.user()?.photoUrl || '/assets/avatar-placeholder.png'" class="w-16 h-16 rounded-full object-cover border" alt="avatar preview"/>
          <input type="file" accept="image/png,image/jpeg,image/webp" (change)="onFileChange($event)"/>
        </div>
        <p class="text-xs text-gray-500 mt-1">PNG/JPG/WebP up to 8MB</p>
      </div>
      <!-- Section Visibility Toggles -->
      <div class="card space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Show About Me</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" [checked]="isVisible('about')" (change)="toggleVisibility('about', $event)" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Show Travel History</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" [checked]="isVisible('travelHistory')" (change)="toggleVisibility('travelHistory', $event)" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Show Reviews</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" [checked]="isVisible('reviews')" (change)="toggleVisibility('reviews', $event)" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Show Interests</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" [checked]="isVisible('interests')" (change)="toggleVisibility('interests', $event)" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Show Connections</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" [checked]="isVisible('connections')" (change)="toggleVisibility('connections', $event)" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Show Verification</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" [checked]="isVisible('verification')" (change)="toggleVisibility('verification', $event)" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
          </label>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="label">Display Name</label>
          <input formControlName="displayName" class="input" placeholder="Your name"/>
          <p class="error" *ngIf="form.get('displayName')?.invalid && form.get('displayName')?.touched">2-40 characters required</p>
        </div>
        <div>
          <label class="label">Phone</label>
          <input formControlName="phone" class="input" placeholder="+1..."/>
        </div>
        <div class="md:col-span-2">
          <label class="label">Headline</label>
          <input formControlName="headline" class="input" placeholder="CS student | Traveler | Coffee lover"/>
          <div class="text-xs text-gray-500 text-right">{{ form.value.headline?.length || 0 }}/80</div>
        </div>
        <div>
          <label class="label">City</label>
          <input formControlName="city" class="input" placeholder="City"/>
        </div>
        <div>
          <label class="label">State</label>
          <input formControlName="state" class="input" placeholder="State"/>
        </div>
      </div>

      <div>
        <label class="label">Bio</label>
        <textarea formControlName="bio" rows="4" class="input resize-none" placeholder="Tell the community about yourself"></textarea>
        <div class="text-xs text-gray-500 text-right">{{ form.value.bio?.length || 0 }}/280</div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="label">Languages (comma separated)</label>
          <input formControlName="languages" class="input" placeholder="English, Spanish"/>
        </div>
        <div>
          <label class="label">Interests (comma separated)</label>
          <input formControlName="interests" class="input" placeholder="Gaming, Coffee"/>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="label">LinkedIn URL</label>
          <input formControlName="linkedin" class="input" placeholder="https://linkedin.com/in/..."/>
        </div>
        <div>
          <label class="label">Instagram URL</label>
          <input formControlName="instagram" class="input" placeholder="https://instagram.com/..."/>
        </div>
        <div>
          <label class="label">Website</label>
          <input formControlName="website" class="input" placeholder="https://yourdomain.com"/>
        </div>
        <div>
          <label class="label">WhatsApp</label>
          <input formControlName="whatsapp" class="input" placeholder="15551234567"/>
        </div>
      </div>

      <div class="flex gap-3">
        <button type="submit" class="btn-primary" [disabled]="form.invalid || form.pristine || saving">Save</button>
        <button type="button" class="btn-secondary" (click)="reset()" [disabled]="form.pristine || saving">Reset</button>
      </div>
    </form>
  `,
  styles: [`
    .label { @apply block text-sm font-medium text-gray-700 mb-1; }
    .input { @apply w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white; }
    .error { @apply text-xs text-red-600 mt-1; }
  /* Match global flat blue primary button (no gradient) */
  .btn-primary { @apply px-5 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50; background:#2563EB; }
    .btn-secondary { @apply px-5 py-2.5 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium; }
  `]
})
export class ProfileEditFormComponent {
  private fb = inject(FormBuilder);
  userStore = inject(UserStore);
  private uploads = inject(UploadsService);
  private toast = inject(ToastService);

  @Output() saved = new EventEmitter<void>();
  @Output() dirtyChange = new EventEmitter<boolean>();

  saving = false;
  previewUrl: string | null = null;
  bannerPreviewUrl: string | null = null;

  form: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    bio: ['', [Validators.maxLength(280)]],
    phone: [''],
    city: [''],
    state: [''],
    headline: ['', [Validators.maxLength(80)]],
    languages: [''],
    interests: [''],
    linkedin: [''],
    instagram: [''],
    website: [''],
    whatsapp: [''],
    avatarFile: [null]
    , bannerFile: [null]
  });

  ngOnInit() {
    const u = this.userStore.user();
    if (u) {
      this.form.patchValue({
        displayName: u.name,
        phone: u.phone || '',
        headline: u.headline || ''
      });
    }
    this.form.valueChanges.subscribe(() => {
      this.dirtyChange.emit(this.form.dirty);
    });

    // Autosave: headline
    const headlineCtrl = this.form.get('headline');
    let headlineTimer: any;
    let lastSavedHeadline: string | null = null;
    headlineCtrl?.valueChanges.subscribe((val) => {
      if (typeof val !== 'string') return;
      if (val === lastSavedHeadline) return;
      if (headlineTimer) clearTimeout(headlineTimer);
      headlineTimer = setTimeout(async () => {
        try {
          await this.userStore.update({ headline: val });
          lastSavedHeadline = val;
          this.toast.success('Headline saved');
        } catch (e) {
          console.error('Autosave headline failed', e);
          this.toast.error('Failed to save headline');
        }
      }, 1000);
    });
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      this.form.patchValue({ avatarFile: file });
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const patch = {
      displayName: v.displayName,
      bio: v.bio,
      phone: v.phone,
      city: v.city,
      state: v.state,
      headline: v.headline,
      languages: v.languages ? v.languages.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      interests: v.interests ? v.interests.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      socials: { linkedin: v.linkedin || undefined, instagram: v.instagram || undefined, website: v.website || undefined, whatsapp: v.whatsapp || undefined }
    };
    try {
      // Avatar upload if provided
      const file: File | null = v.avatarFile;
      if (file) {
        const presign = await this.uploads.presignAvatar(file);
        await this.uploads.uploadToS3(presign, file);
        (patch as any).avatarKey = presign.key;
        // Update header immediately if public URL provided
        if (presign.publicUrl) {
          const u = this.userStore.user();
          if (u) {
            this.userStore.setUser({ ...u, photoUrl: presign.publicUrl });
          }
        }
      }
      // Banner upload if provided
      const banner: File | null = v.bannerFile;
      if (banner) {
        const presign = await this.uploads.presignBanner(banner);
        await this.uploads.uploadToS3(presign, banner);
        (patch as any).bannerKey = presign.key;
        if (presign.publicUrl) {
          const u = this.userStore.user();
          if (u) {
            this.userStore.setUser({ ...u, coverImageUrl: presign.publicUrl });
          }
        }
      }
      await this.userStore.update(patch);
      this.form.markAsPristine();
      this.saved.emit();
    } catch (e) {
      console.error('[ProfileEdit] save failed', e);
    } finally {
      this.saving = false;
    }
  }

  reset() {
    this.form.reset({ displayName: this.userStore.user()?.name || '' });
    this.dirtyChange.emit(this.form.dirty);
  }

  isDirty(): boolean { return this.form.dirty; }

  // Visibility helpers
  isVisible(key: 'about'|'travelHistory'|'reviews'|'interests'|'connections'|'verification') {
    const vis = this.userStore.user()?.profileVisibility;
    if (!vis) return true;
    return (vis as any)[key] !== false;
  }

  async toggleVisibility(key: 'about'|'travelHistory'|'reviews'|'interests'|'connections'|'verification', e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const current = this.userStore.user();
    if (!current) return;
    const next = {
      profileVisibility: { 
        about: current.profileVisibility?.about !== false,
        travelHistory: current.profileVisibility?.travelHistory !== false,
        reviews: current.profileVisibility?.reviews !== false,
        interests: current.profileVisibility?.interests !== false,
        connections: current.profileVisibility?.connections !== false,
        verification: current.profileVisibility?.verification !== false,
      }
    } as any;
    next.profileVisibility[key] = checked;
    try {
      await this.userStore.update(next);
    } catch (err) {
      console.error('Failed updating visibility', err);
    }
  }
  onBannerChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      this.form.patchValue({ bannerFile: file });
      const reader = new FileReader();
      reader.onload = () => (this.bannerPreviewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }
}
