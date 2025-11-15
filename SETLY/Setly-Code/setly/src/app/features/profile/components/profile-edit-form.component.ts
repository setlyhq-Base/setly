import { COUNTRY_CODES, CountryCode, matchDialCode } from '../../../shared/data/country-codes';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserStore } from '../../../core/state/user.store';
import { ToastService } from '../../../core/services/toast.service';
import { UploadsService } from '../../../core/services/uploads.service';
import { PhoneService } from '../../../core/services/phone.service';
import { PhoneConfirmationModalComponent } from '../../../shared/ui/phone-confirmation-modal.component';
import { OtpModalComponent } from '../../../shared/ui/otp-modal.component';
import { CountryCodeSelectComponent } from '../../../shared/ui/country-code-select.component';

@Component({
  selector: 'app-profile-edit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhoneConfirmationModalComponent, OtpModalComponent, CountryCodeSelectComponent],
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
          <label class="label flex items-center gap-2">
            <span>Phone</span>
            <span *ngIf="phoneVerified && (form.get('phoneLocal')?.value || form.get('phoneCountry')?.value)" class="inline-flex items-center gap-1 text-green-700 text-xs font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✅ Verified</span>
          </label>
          <div class="relative">
            <div class="flex gap-2 items-start">
              <div class="w-36">
                <app-country-code-select formControlName="phoneCountry" (ngModelChange)="onPhoneChanged()"></app-country-code-select>
              </div>
              <div class="relative flex-1">
                <input formControlName="phoneLocal" class="input pr-28" placeholder="1234567890"
                       inputmode="numeric" pattern="[0-9]*"
                       (blur)="onPhoneBlur()" (keydown.enter)="onPhoneEnter($event)" />
                <button type="button" *ngIf="hasAnyPhone() && !phoneVerified"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        (click)="startPhoneConfirm()">Verify</button>
              </div>
            </div>
            <p class="text-xs text-red-600 mt-1" *ngIf="phoneError">{{ phoneError }}</p>
          </div>
          <p class="text-xs text-red-600 mt-1" *ngIf="phoneError">{{ phoneError }}</p>
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
        <button type="submit" class="btn-primary" [disabled]="form.invalid || form.pristine || saving || phoneSaveBlocked()">Save</button>
        <button type="button" class="btn-secondary" (click)="reset()" [disabled]="form.pristine || saving">Reset</button>
      </div>
    </form>

    <!-- Phone Confirmation Modal -->
    <app-phone-confirmation-modal
      [show]="showConfirm"
      [phoneNumber]="pendingPhone"
      (confirm)="confirmPhone()"
      (edit)="cancelPhoneConfirm()"
    ></app-phone-confirmation-modal>

    <!-- OTP Modal -->
    <app-otp-modal
      [show]="showOtp"
      [phoneNumber]="pendingPhone"
      [loading]="otpLoading"
      [errorMessage]="otpError"
      (submit)="onOtpSubmit($event)"
      (resend)="onOtpResend()"
    ></app-otp-modal>
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
  private phoneService = inject(PhoneService);
  countryCodes: CountryCode[] = COUNTRY_CODES;

  @Output() saved = new EventEmitter<void>();
  @Output() dirtyChange = new EventEmitter<boolean>();

  saving = false;
  previewUrl: string | null = null;
  bannerPreviewUrl: string | null = null;

  // Phone verify flow state
  phoneVerified = false;
  verifiedPhone: string | null = null; // lock verified number for this edit session
  phoneError: string | null = null;
  showConfirm = false;
  showOtp = false;
  pendingPhone = '';
  otpLoading = false;
  otpError = '';

  form: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    bio: ['', [Validators.maxLength(280)]],
  phoneCountry: ['+1'],
  phoneLocal: [''],
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
      this.form.patchValue({ displayName: u.name, headline: u.headline || '' });
      if (u.phone && u.phone.startsWith('+')) {
        const match = matchDialCode(u.phone);
        if (match) {
          const local = u.phone.slice(match.dial.length);
          this.form.patchValue({ phoneCountry: match.dial, phoneLocal: local });
        } else {
          this.form.patchValue({ phoneLocal: u.phone.replace(/[^\d]/g, '') });
        }
        // Treat stored phone as verified until edited
        this.phoneVerified = true;
        this.verifiedPhone = u.phone;
      }
    }
    this.form.valueChanges.subscribe(() => {
      this.dirtyChange.emit(this.form.dirty);
    });

    // Reset verification if phone number is changed after verification
    const phoneCountryCtrl = this.form.get('phoneCountry');
    const phoneLocalCtrl = this.form.get('phoneLocal');
    const resetIfEdited = () => {
      this.phoneError = null;
      if (this.phoneVerified && this.verifiedPhone !== null) {
        const combined = this.combinePhone();
        if (combined && combined !== this.verifiedPhone) this.phoneVerified = false;
      }
    };
    phoneCountryCtrl?.valueChanges.subscribe(resetIfEdited);
    phoneLocalCtrl?.valueChanges.subscribe(resetIfEdited);

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

  // Basic E.164 validation: must start with + and contain 10-15 digits total
  private isPhoneValid(e164: string): boolean {
    if (!e164) return false;
    const digits = e164.replace(/\D/g, '');
    return e164.startsWith('+') && digits.length >= 10 && digits.length <= 15;
  }

  private combinePhone(): string {
    const dial = (this.form.get('phoneCountry')?.value || '').toString();
    const localRaw = (this.form.get('phoneLocal')?.value || '').toString();
    const local = localRaw.replace(/\D/g, '');
    if (!dial || !local) return '';
    return dial + local;
  }

  onPhoneEnter(e: Event) {
    e.preventDefault();
    this.onPhoneBlur();
  }

  onPhoneChanged() {
    // Keep error cleared and reset verification if number effectively changed
    this.phoneError = null;
    if (this.phoneVerified && this.verifiedPhone) {
      const combined = this.combinePhone();
      if (combined && combined !== this.verifiedPhone) this.phoneVerified = false;
    }
  }

  onPhoneBlur() {
    const combined = this.combinePhone();
    if (!combined) return; // ignore empty
    if (!this.isPhoneValid(combined)) {
      this.phoneError = 'Enter a valid phone number (with country code).';
      return;
    }
    this.phoneError = null;
    this.pendingPhone = combined;
    // If already verified for this exact phone, skip
    if (this.phoneVerified && this.verifiedPhone === combined) return;
    this.startPhoneConfirm();
  }

  startPhoneConfirm() {
    const combined = this.combinePhone();
    if (!this.isPhoneValid(combined)) {
      this.phoneError = 'Enter a valid phone number (with country code).';
      return;
    }
    this.pendingPhone = combined;
    this.showConfirm = true;
  }

  cancelPhoneConfirm() {
    this.showConfirm = false;
  }

  async confirmPhone() {
    this.showConfirm = false;
    this.showOtp = true;
    // Fire initial OTP
    try {
      await this.phoneService.sendOtp(this.pendingPhone).toPromise();
      this.toast.info('OTP sent');
      this.otpError = '';
    } catch (e) {
      console.error('sendOtp failed', e);
      this.otpError = 'Failed to send code. Please try again.';
    }
  }

  async onOtpSubmit(code: string) {
    if (!code || code.length !== 6) {
      this.otpError = 'Enter the 6-digit code.';
      return;
    }
    this.otpLoading = true;
    this.otpError = '';
    try {
      await this.phoneService.verifyOtp(this.pendingPhone, code).toPromise();
      this.phoneVerified = true;
      this.verifiedPhone = this.pendingPhone;
      this.showOtp = false;
      this.toast.success('Phone verified');
    } catch (e) {
      console.error('verifyOtp failed', e);
      this.otpError = 'Incorrect code, please try again.';
    } finally {
      this.otpLoading = false;
    }
  }

  async onOtpResend() {
    try {
      await this.phoneService.sendOtp(this.pendingPhone).toPromise();
      this.toast.info('Code resent');
      this.otpError = '';
    } catch (e) {
      console.error('resend failed', e);
      this.otpError = 'Failed to resend code. Please try later.';
    }
  }

  phoneSaveBlocked(): boolean {
    // If phone present, require verification
    return this.hasAnyPhone() && !this.phoneVerified;
  }

  hasAnyPhone(): boolean {
    const dial = (this.form.get('phoneCountry')?.value || '').toString();
    const local = (this.form.get('phoneLocal')?.value || '').toString().replace(/\D/g, '');
    return !!dial && !!local;
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
    if (this.phoneSaveBlocked()) {
      this.toast.error('Please verify your phone before saving.');
      return;
    }
    this.saving = true;
  const v = this.form.value as any;
  const phoneE164 = this.combinePhone();
    const patch = {
      displayName: v.displayName,
      bio: v.bio,
  phone: phoneE164 || undefined,
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
        // optimistic local patch for phoneVerified UI elsewhere if needed
        const u2 = this.userStore.user();
        if (u2) {
          this.userStore.setUser({ ...u2, phone: v.phone });
        }
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
