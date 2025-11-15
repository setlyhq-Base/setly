import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversitySearchComponent } from './university-search.component';
import { CompanySearchComponent } from './company-search.component';
import { LocationAutocompleteComponent } from './location-autocomplete.component';
import { ProfileService } from '../../core/services/profile.service';
import { AuthStore } from '../../core/state/auth.store';
import { ProfileStore } from '../../core/state/profile.store';
import { COUNTRY_CODES, CountryCode, matchDialCode, flagEmoji } from '../data/country-codes';
import { IntlPhoneInputComponent } from './intl-phone-input.component';

@Component({
  selector: 'app-profile-quick-capture-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, UniversitySearchComponent, CompanySearchComponent, IntlPhoneInputComponent, LocationAutocompleteComponent],
  template: `
    <div class="backdrop" (click)="onCancel()" aria-hidden="true"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="profileCaptureTitle" (keydown.escape)="onCancel()">
      <h2 id="profileCaptureTitle" class="title gradient-text">Complete Your Profile</h2>
      <p class="subtitle">Just a couple details so Setly Community know who you are.</p>
      <form (submit)="onSubmit($event)" class="form" #formRef="ngForm">
        <label class="field">
          <span class="label">Full Name *</span>
          <input name="displayName" [(ngModel)]="displayName" required minlength="2" maxlength="60" (input)="validate()" [class.invalid]="nameError" placeholder="Jane Doe" />
          <div class="error" *ngIf="nameError">{{ nameError }}</div>
        </label>
        <div class="field">
          <span class="label">Role *</span>
          <div class="flex gap-3">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="role" [(ngModel)]="role" value="student" (change)="validate()" /> Student
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="role" [(ngModel)]="role" value="professional" (change)="validate()" /> Working professional
            </label>
          </div>
        </div>
        <div class="field" *ngIf="role==='student'">
          <span class="label">University *</span>
          <app-university-search (picked)="onUniversityPicked($event)" [placeholder]="'Search your university…'"></app-university-search>
          <div class="error" *ngIf="schoolError">{{ schoolError }}</div>
        </div>
        <div class="field" *ngIf="role==='professional'">
          <span class="label">Company *</span>
          <app-company-search (picked)="onCompanyPicked($event)" [placeholder]="'Search your company…'"></app-company-search>
          <div class="error" *ngIf="companyError">{{ companyError }}</div>
        </div>
        <label class="field">
          <span class="label">Location</span>
          <app-location-autocomplete (picked)="onLocationPicked($event)" [initialCity]="location"></app-location-autocomplete>
        </label>
        <div class="field">
          <span class="label">Mobile *</span>
          <app-intl-phone-input name="phone" [(ngModel)]="phone" (ngModelChange)="onPhoneChanged()" [placeholder]="'Phone number*'"></app-intl-phone-input>
          <div class="error" *ngIf="phoneRequiredError">Phone number is required</div>
          <div class="error" *ngIf="phoneError">{{ phoneError }}</div>
        </div>
        <label class="field">
          <span class="label">Email</span>
          <input name="email" [value]="email || ''" disabled placeholder="you@example.com" />
        </label>
        <div class="actions">
          <button type="button" class="secondary" (click)="onCancel()">Cancel</button>
          <!-- Show Save button only when all required fields are valid -->
          <button *ngIf="canShowSave()" type="submit" class="primary" [disabled]="saving" [attr.aria-disabled]="saving ? 'true' : 'false'">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:60; padding:5vh 0; box-sizing:border-box; }
    .backdrop { position:absolute; inset:0; background:rgba(11,11,15,0.55); backdrop-filter:blur(6px); }
  .modal { position:relative; width:95vw; max-width:480px; max-height:90vh; background:#fff; border:1px solid #e5e7eb; border-radius:1.25rem; padding:1.25rem 1.5rem 1.5rem; box-shadow:0 28px 60px -18px rgba(0,0,0,.25); animation:fadeScale .45s cubic-bezier(.16,.8,.3,1); display:flex; flex-direction:column; overflow:auto; }
    @keyframes fadeScale { from { opacity:0; transform:translateY(20px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  .title { font-size:1.15rem; font-weight:700; letter-spacing:-0.01em; margin-bottom:.1rem; }
  .subtitle { font-size:.8rem; color:#6b7280; margin-bottom:1rem; }
  .form { display:flex; flex-direction:column; gap:.8rem; }
  .field { display:flex; flex-direction:column; gap:.3rem; }
    .label { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; }
  input { background:#fff; border:1px solid #d1d5db; border-radius:.8rem; padding:.6rem .85rem; font-size:.85rem; font-weight:500; color:#111827; transition:border-color .25s, box-shadow .25s; }
    input:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.35); }
    input.invalid { border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,.25); }
    .error { font-size:.65rem; color:#dc2626; font-weight:600; letter-spacing:.03em; }
  .actions { display:flex; justify-content:flex-end; gap:.6rem; margin-top:.25rem; }
  .preview img { width:60px; height:60px; object-fit:cover; border-radius:0.85rem; border:2px solid var(--gradient-start); box-shadow:0 4px 10px -4px rgba(0,0,0,.25); }
    .primary { background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); color:#fff; border:none; padding:.65rem 1.15rem; font-size:.75rem; font-weight:700; letter-spacing:.05em; border-radius:.85rem; box-shadow:0 10px 24px -10px rgba(90,79,243,.65); transition:filter .25s, transform .25s; }
    .primary:hover:not([disabled]) { filter:brightness(1.08); transform:translateY(-2px); }
    .primary[disabled] { opacity:.55; cursor:not-allowed; }
    .secondary { background:#fff; border:1px solid #e5e7eb; color:#374151; font-weight:600; border-radius:.85rem; padding:.65rem 1.1rem; font-size:.75rem; }
    .secondary:hover { background:#f9fafb; }
  @media (max-width:640px){ :host { padding:4vh 0; } .modal { padding:1rem 1rem 1.25rem; border-radius:1.1rem; max-height:92vh; } }
  `]
})
export class ProfileQuickCaptureModalComponent {
  @Input() email: string | undefined;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  displayName = '';
  // combined e164 phone through the intl input
  phone: string = '';
  // Removed avatar upload per requirement
  university = '';
  universityId: string | null = null;
  universityCity: string | null = null;
  universityState: string | null = null;
  company = '';
  companyId: string | null = null;
  role: 'student' | 'professional' = 'student';
  location = '';
  nameError: string | null = null;
  phoneError: string | null = null;
  phoneRequiredError = false;
  schoolError: string | null = null;
  companyError: string | null = null;
  saving = false;

  private profileService = inject(ProfileService);
  private authStore = inject(AuthStore);
  private profileStore = inject(ProfileStore);

  countryCodes: CountryCode[] = COUNTRY_CODES;

  ngOnInit() {
    // Prefill fields from any available sources for a smoother UX
    const prof = this.profileStore.profile();
    const auth = this.authStore.user();
    if ((!this.displayName || !this.displayName.trim()) && (prof?.displayName || auth.displayName)) {
      this.displayName = (prof?.displayName || auth.displayName || '').trim();
    }
    if ((!this.university || !this.university.trim()) && (prof?.university)) {
      this.university = prof?.university || '';
    }
    if ((!this.location || !this.location.trim()) && (prof?.location)) {
      this.location = prof?.location || '';
    }
    // Prefill phone from authStore if present
    const rawPhone = (auth.phone as any) || '';
    if (rawPhone && typeof rawPhone === 'string' && rawPhone.startsWith('+')) {
      this.phone = rawPhone;
    }
    // Email is passed as Input and shown disabled; leave as-is.
    this.validate();
    this.validatePhone();
  }

  validate() {
    const value = this.displayName.trim();
    if (!value) this.nameError = 'Name is required';
    else if (value.length < 2) this.nameError = 'Too short';
    else if (value.length > 60) this.nameError = 'Too long';
    else this.nameError = null;
    // role requirements
    this.schoolError = null; this.companyError = null;
    if (this.role === 'student' && !this.universityId) this.schoolError = 'Please select your university';
    if (this.role === 'professional' && !this.companyId) this.companyError = 'Please select your company';
  }

  onPhoneChanged() {
    this.validatePhone();
  }

  validatePhone() {
    const v = (this.phone || '').toString();
    if (!v) { this.phoneError = null; this.phoneRequiredError = true; return; }
    const digits = v.replace(/\D/g, '');
    if (!(v.startsWith('+') && digits.length >= 10 && digits.length <= 15)) { this.phoneError = 'Invalid format'; this.phoneRequiredError = false; } else { this.phoneError = null; this.phoneRequiredError = false; }
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.validate();
    if (this.nameError || this.phoneError || this.phoneRequiredError || this.schoolError || this.companyError) return;
    this.saving = true;
    try {
  const phone = (this.phone || '').toString();
  const patch: any = { displayName: this.displayName.trim(), phone };
      if (this.role === 'student' && this.universityId) { patch.university = this.university; patch.universityId = this.universityId; }
      if (this.role === 'professional' && this.companyId) { patch.company = this.company; patch.companyId = this.companyId; }
      if (this.location.trim()) patch.location = this.location.trim();
      const updated = await this.profileService.patchMe(patch);
      if (updated) {
        // Immediate local reflection already handled in service; ensure auth displayName & phone if missing
        if (patch.displayName || patch.phone) {
          const existing = this.authStore.user();
          this.authStore.setUser({
            displayName: patch.displayName || existing.displayName,
            phone: (patch as any).phone || existing.phone
          });
        }
        // Mark quick-capture completed recently to avoid showing the modal again too soon
        try {
          const uid = this.authStore.user().userId || 'me';
          localStorage.setItem(`qc.completed.${uid}`, Date.now().toString());
          // Persist the last patch for resilience (applied on next hydration if backend lags)
          localStorage.setItem(`qc.lastPatch.${uid}`, JSON.stringify(patch));
          // Also persist a durable cache of the merged profile so it reloads on next sign-in
          const prof = this.profileStore.profile();
          if (prof) localStorage.setItem(`profile.cache.${uid}`, JSON.stringify(prof));
        } catch {}
      }
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Profile updated.' } }));
      this.saved.emit();
    } catch (err) {
      console.error('[QuickCapture] save failed', err);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: "Couldn't save profile. Try again." } }));
    } finally {
      this.saving = false;
    }
  }

  onCancel() { this.cancelled.emit(); }

  onUniversityPicked(e: { id: string; name: string; city?: string; state?: string }) {
    this.universityId = e.id; this.university = e.name; this.universityCity = e.city || null; this.universityState = e.state || null;
    this.validate();
  }
  onCompanyPicked(e: { id: string; name: string }) {
    this.companyId = e.id; this.company = e.name; this.validate();
  }

  onLocationPicked(loc: { city: string; state: string; country?: string; lat?: number; lon?: number }) {
    const parts = [loc.city, loc.state].filter(Boolean);
    // Optionally append country if non-US to disambiguate
    if (loc.country && loc.country !== 'United States') parts.push(loc.country);
    this.location = parts.join(', ');
  }

  // expose flag util for template
  flag(code: string) { return flagEmoji(code); }

  // Save button gating logic – only show when all required fields are satisfied & valid
  canShowSave(): boolean {
    if (this.saving) return false;
    const hasName = !!this.displayName.trim() && !this.nameError;
    const phoneOk = !!this.phone && !this.phoneError && !this.phoneRequiredError;
    const roleOk = (this.role === 'student') ? !!this.universityId && !this.schoolError : !!this.companyId && !this.companyError;
    return hasName && phoneOk && roleOk;
  }
}
