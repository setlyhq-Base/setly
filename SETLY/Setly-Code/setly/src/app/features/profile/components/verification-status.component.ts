import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerificationState } from '../../../core/models/profile.model';

@Component({
  selector: 'app-verification-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">Verification</h2>
        <div class="trust-wrapper">
          <div class="progress-ring trust-ring" [style.--p]="progress + '%'">
            <span>{{ progress | number:'1.0-0' }}%</span>
          </div>
          <div class="trust-label" [class.complete]="progress >= 100">{{ progress >= 100 ? 'Trusted ✔' : 'Build Trust' }}</div>
        </div>
      </div>

      <div class="space-y-3">
        <!-- Identity -->
        <div class="verify-row" [class.on]="state.identity">
          <button class="left" (click)="toggle('identity')"><span class="i">🪪</span><span class="lbl">Identity Verification</span></button>
          <button class="cta ripple" (click)="onAction('identity')" *ngIf="!state.identity">Verify</button>
          <span *ngIf="state.identity" class="done-chip">Verified</span>
        </div>
        <div class="panel" *ngIf="open.identity">
          <p class="text-sm text-gray-600">Upload your government ID or a selfie for verification. We only store verification status.</p>
        </div>

        <!-- University -->
        <div class="verify-row" [class.on]="state.university">
          <button class="left" (click)="toggle('university')"><span class="i">🎓</span><span class="lbl">University Email (.edu)</span></button>
          <button class="cta ripple" (click)="onAction('university')" *ngIf="!state.university">Verify</button>
          <span *ngIf="state.university" class="done-chip">Verified</span>
        </div>
        <div class="panel" *ngIf="open.university">
          <p class="text-sm text-gray-600">Verify your .edu email. We'll send a one-time code to confirm.</p>
        </div>

        <!-- Phone -->
        <div class="verify-row" [class.on]="state.phone">
          <button class="left" (click)="toggle('phone')"><span class="i">📞</span><span class="lbl">Phone Verification</span></button>
          <button class="cta ripple" (click)="onAction('phone')" *ngIf="!state.phone">Verify</button>
          <span *ngIf="state.phone" class="done-chip">Verified</span>
        </div>
        <div class="panel" *ngIf="open.phone">
          <p class="text-sm text-gray-600">We'll text you a code to verify your number.</p>
        </div>

        <!-- Email -->
        <div class="verify-row" [class.on]="state.email">
          <button class="left" (click)="toggle('email')"><span class="i">✉️</span><span class="lbl">Email Verification</span></button>
          <button class="cta ripple" (click)="onAction('email')" *ngIf="!state.email">Verify</button>
          <span *ngIf="state.email" class="done-chip">Verified</span>
        </div>
        <div class="panel" *ngIf="open.email">
          <p class="text-sm text-gray-600">Verify your email with a quick confirmation link.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; }
    .card-header { @apply flex items-center justify-between mb-4; }
    .card-title { @apply text-lg font-semibold; }
    .trust-wrapper { @apply flex flex-col items-center gap-2; }
    .trust-ring { position:relative; }
    .progress-ring { width:52px; height:52px; border-radius:50%; background:conic-gradient(var(--gradient-start) var(--p), #e5e7eb 0); display:grid; place-items:center; font-size:11px; font-weight:600; color:#111827; box-shadow:0 6px 18px -8px rgba(90,79,243,.4); }
    .progress-ring span { @apply bg-white rounded-full px-2 py-1 shadow text-xs; }
    .trust-label { font-size:0.6rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#64748b; }
    .trust-label.complete { color:#10b981; }
    .verify-row { display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1rem; border:1px solid #e2e8f0; border-radius:1rem; background:#fff; position:relative; transition:background .35s, border-color .35s; }
    .verify-row.on { background:#f0fdf4; border-color:#bbf7d0; }
    .left { display:flex; align-items:center; gap:.6rem; font-size:.75rem; font-weight:600; color:#0f172a; letter-spacing:.02em; }
    .left .i { font-size:1rem; }
    .lbl { display:inline-flex; }
    .cta { font-size:.65rem; font-weight:700; letter-spacing:.07em; padding:.55rem .85rem; border-radius:.7rem; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); color:#fff; box-shadow:0 4px 12px -6px rgba(90,79,243,.55); text-transform:uppercase; }
    .cta:hover { filter:brightness(1.05); }
    .done-chip { font-size:.6rem; font-weight:700; letter-spacing:.08em; background:#10b981; color:#fff; padding:.4rem .6rem; border-radius:.6rem; box-shadow:0 2px 6px rgba(16,185,129,.4); }
    .panel { margin:-0.35rem 0 0.65rem; padding:0 .25rem .2rem 2.1rem; font-size:.65rem; color:#475569; line-height:1.4; }
  `]
})
export class VerificationStatusComponent {
  @Input() state: VerificationState = { identity: false, university: false, phone: false, email: false };
  @Output() action = new EventEmitter<keyof VerificationState>();
  open: Record<keyof VerificationState, boolean> = { identity: false, university: false, phone: false, email: false };

  get progress(): number {
    const done = Object.values(this.state).filter(Boolean).length;
    return (done / 4) * 100;
  }

  onAction(key: keyof VerificationState) {
    this.action.emit(key);
  }

  toggle(key: keyof VerificationState) {
    this.open[key] = !this.open[key];
  }
}
