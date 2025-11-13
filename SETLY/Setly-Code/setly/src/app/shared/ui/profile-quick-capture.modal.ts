import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversitySearchComponent } from './university-search.component';
import { CompanySearchComponent } from './company-search.component';
import { ProfileService } from '../../core/services/profile.service';
import { AuthStore } from '../../core/state/auth.store';
import { ProfileStore } from '../../core/state/profile.store';

@Component({
  selector: 'app-profile-quick-capture-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, UniversitySearchComponent, CompanySearchComponent],
  template: `
    <div class="backdrop" (click)="onCancel()" aria-hidden="true"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="profileCaptureTitle" (keydown.escape)="onCancel()">
      <h2 id="profileCaptureTitle" class="title gradient-text">Complete Your Profile</h2>
      <p class="subtitle">Just a couple details so hosts know who you are.</p>
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
          <input name="location" [(ngModel)]="location" placeholder="Boston, MA" />
        </label>
        <label class="field">
          <span class="label">Mobile *</span>
          <input name="phone" [(ngModel)]="phone" (input)="validatePhone()" placeholder="+1 555 555 5555" [class.invalid]="phoneError || phoneRequiredError" />
          <div class="error" *ngIf="phoneRequiredError">Phone number is required</div>
          <div class="error" *ngIf="phoneError">{{ phoneError }}</div>
        </label>
        <label class="field">
          <span class="label">Email</span>
          <input name="email" [value]="email || ''" disabled placeholder="you@example.com" />
        </label>
        <div class="actions">
          <button type="button" class="secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="primary" [disabled]="saving || !!nameError">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:60; }
    .backdrop { position:absolute; inset:0; background:rgba(11,11,15,0.55); backdrop-filter:blur(6px); }
    .modal { position:relative; width:95vw; max-width:480px; background:#fff; border:1px solid #e5e7eb; border-radius:1.5rem; padding:2rem 2.25rem 2.25rem; box-shadow:0 28px 60px -18px rgba(0,0,0,.25); animation:fadeScale .45s cubic-bezier(.16,.8,.3,1); }
    @keyframes fadeScale { from { opacity:0; transform:translateY(20px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
    .title { font-size:1.25rem; font-weight:700; letter-spacing:-0.01em; margin-bottom:.25rem; }
    .subtitle { font-size:.85rem; color:#6b7280; margin-bottom:1.5rem; }
    .form { display:flex; flex-direction:column; gap:1.1rem; }
    .field { display:flex; flex-direction:column; gap:.4rem; }
    .label { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; }
    input { background:#fff; border:1px solid #d1d5db; border-radius:.85rem; padding:.7rem .9rem; font-size:.85rem; font-weight:500; color:#111827; transition:border-color .25s, box-shadow .25s; }
    input:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.35); }
    input.invalid { border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,.25); }
    .error { font-size:.65rem; color:#dc2626; font-weight:600; letter-spacing:.03em; }
    .actions { display:flex; justify-content:flex-end; gap:.75rem; margin-top:.5rem; }
  .preview img { width:60px; height:60px; object-fit:cover; border-radius:0.85rem; border:2px solid var(--gradient-start); box-shadow:0 4px 10px -4px rgba(0,0,0,.25); }
    .primary { background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); color:#fff; border:none; padding:.65rem 1.15rem; font-size:.75rem; font-weight:700; letter-spacing:.05em; border-radius:.85rem; box-shadow:0 10px 24px -10px rgba(90,79,243,.65); transition:filter .25s, transform .25s; }
    .primary:hover:not([disabled]) { filter:brightness(1.08); transform:translateY(-2px); }
    .primary[disabled] { opacity:.55; cursor:not-allowed; }
    .secondary { background:#fff; border:1px solid #e5e7eb; color:#374151; font-weight:600; border-radius:.85rem; padding:.65rem 1.1rem; font-size:.75rem; }
    .secondary:hover { background:#f9fafb; }
    @media (max-width:640px){ .modal { padding:1.5rem 1.5rem 1.75rem; border-radius:1.25rem; } }
  `]
})
export class ProfileQuickCaptureModalComponent {
  @Input() email: string | undefined;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  displayName = '';
  phone = '';
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
    if ((!this.phone || !this.phone.trim()) && (auth.phone as any)) {
      this.phone = (auth.phone as any) || '';
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

  validatePhone() {
    const v = this.phone.trim();
    if (!v) { this.phoneError = null; this.phoneRequiredError = true; return; }
    // Simple E.164 pattern + optional spaces/hyphens removal
    const normalized = v.replace(/[\s-]/g, '');
    if (!/^\+?[1-9]\d{7,14}$/.test(normalized)) { this.phoneError = 'Invalid format'; this.phoneRequiredError = false; } else { this.phoneError = null; this.phoneRequiredError = false; }
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.validate();
    if (this.nameError || this.phoneError || this.phoneRequiredError || this.schoolError || this.companyError) return;
    this.saving = true;
    try {
      const patch: any = { displayName: this.displayName.trim(), phone: this.phone.trim() };
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
}
