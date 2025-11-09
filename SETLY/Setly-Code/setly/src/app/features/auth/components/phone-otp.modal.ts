import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-phone-otp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Phone verification modal"
    >
      <div class="absolute inset-0 bg-black/40" (click)="onRequestClose()"></div>
      <div class="relative bg-white w-full max-w-md rounded-2xl shadow-sm p-6" data-testid="auth-card">
        <button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" (click)="onRequestClose()" aria-label="Close">
          ✕
        </button>

        <h2 class="text-xl font-semibold mb-1" [attr.data-testid]="'auth-title'">Verify your phone</h2>
        <p class="text-sm text-gray-600 mb-4">We use your number to verify it’s you.</p>

        <!-- Step 1: Phone input -->
        <div *ngIf="step() === 1" class="space-y-4">
          <label class="block text-sm font-medium text-gray-700">Phone number</label>
          <div class="flex gap-2">
            <input #phoneInput type="tel" [(ngModel)]="phone" class="flex-1 h-12 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Phone number" placeholder="+1 555 000 1234" />
            <button
              class="h-12 px-4 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
              (click)="start()"
              [disabled]="loading() || !phone"
              aria-label="Send verification code"
              data-testid="btn-phone"
            >
              <span *ngIf="!loading(); else sending">Send</span>
              <ng-template #sending>
                <span class="inline-flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending
                </span>
              </ng-template>
            </button>
          </div>
          <!-- Unique container id for this modal to avoid clashes -->
          <div id="recaptcha-phone"></div>
          <p *ngIf="error()" class="text-sm text-red-600">{{ error() }}</p>
        </div>

        <!-- Step 2: Code input -->
        <div *ngIf="step() === 2" class="space-y-4">
          <label class="block text-sm font-medium text-gray-700">Enter the 6‑digit code</label>
          <div class="flex gap-2">
            <input
              #codeBox
              *ngFor="let i of [0,1,2,3,4,5]; index as idx"
              [attr.data-testid]="'otp-input-' + (idx+1)"
              maxlength="1"
              class="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              (input)="onCodeInput($event, idx)"
            />
          </div>
          <div class="flex items-center justify-between text-sm">
            <button class="text-gray-600 hover:text-gray-900" (click)="editPhone()">Edit phone</button>
            <button
              class="text-indigo-600 disabled:text-gray-400"
              [disabled]="resendDisabled()"
              (click)="resend()"
              data-testid="otp-resend"
            >
              Resend {{ resendCountdown() > 0 ? '(' + resendCountdown() + 's)' : '' }}
            </button>
          </div>
          <button
            class="w-full h-12 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
            (click)="confirm()"
            [disabled]="loading() || code.length !== 6"
          >
            <span *ngIf="!loading(); else verifying">Verify</span>
            <ng-template #verifying>
              <span class="inline-flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying
              </span>
            </ng-template>
          </button>
          <p *ngIf="error()" class="text-sm text-red-600">{{ error() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PhoneOtpModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();
  @Output() failure = new EventEmitter<string>();

  @ViewChild('phoneInput') phoneInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('codeBox') firstCodeBoxRef?: ElementRef<HTMLInputElement>;

  step = signal<1 | 2>(1);
  phone = '';
  code = '';
  loading = signal(false);
  error = signal('');
  resendDisabled = signal(true);
  resendCountdown = signal(30);
  private countdownTimer?: any;
  private confirmationResult: any;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // Nothing
  }

  ngOnChanges(): void {
    if (this.open) {
      // Focus phone input on open
      setTimeout(() => this.phoneInputRef?.nativeElement.focus(), 0);
    } else {
      this.reset();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onRequestClose(): void {
    this.closed.emit();
  }

  async start(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      // Minimal E.164 normalization: default to +1 if user omitted country code
      let phoneE164 = (this.phone || '').trim();
      if (phoneE164 && !phoneE164.startsWith('+')) {
        phoneE164 = '+1' + phoneE164.replace(/[^0-9]/g, '');
      }
      await this.auth.initializeRecaptcha('recaptcha-phone');
      await this.auth.signInWithPhone(phoneE164);
      this.step.set(2);
      setTimeout(() => this.focusFirstCodeBox(), 0);
      this.beginResendCountdown();
    } catch (e: any) {
      console.error(e);
      this.error.set(this.humanizeError(e?.code || e?.message));
      this.failure.emit(this.error());
    } finally {
      this.loading.set(false);
    }
  }

  onCodeInput(ev: Event, idx: number): void {
    const input = ev.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(0, 1);
    input.value = val;
    const chars = this.code.split('');
    chars[idx] = val;
    this.code = chars.join('').slice(0, 6);
    if (val && idx < 5) {
      const next = (input.parentElement?.children[idx + 1] as HTMLInputElement) || null;
      next?.focus();
    }
  }

  async resend(): Promise<void> {
    this.beginResendCountdown();
    // For Firebase phone auth, re-triggering signInWithPhoneNumber is necessary. Keep UI only for now.
  }

  editPhone(): void {
    this.step.set(1);
    setTimeout(() => this.phoneInputRef?.nativeElement.focus(), 0);
  }

  async confirm(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.verifyPhoneCode(this.code);
      this.success.emit();
      this.onRequestClose();
    } catch (e: any) {
      console.error(e);
      this.error.set(this.humanizeError(e?.code || e?.message));
      this.failure.emit(this.error());
    } finally {
      this.loading.set(false);
    }
  }

  private focusFirstCodeBox(): void {
    const host = (this.firstCodeBoxRef?.nativeElement?.parentElement) || null;
    const first = host?.querySelector('input') as HTMLInputElement | null;
    first?.focus();
  }

  private beginResendCountdown(): void {
    this.resendDisabled.set(true);
    this.resendCountdown.set(30);
    this.clearTimer();
    this.countdownTimer = setInterval(() => {
      const next = this.resendCountdown() - 1;
      if (next <= 0) {
        this.clearTimer();
        this.resendDisabled.set(false);
        this.resendCountdown.set(0);
      } else {
        this.resendCountdown.set(next);
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  private reset(): void {
    this.step.set(1);
    this.phone = '';
    this.code = '';
    this.loading.set(false);
    this.error.set('');
    this.resendDisabled.set(true);
    this.resendCountdown.set(30);
    this.clearTimer();
  }

  private humanizeError(code: string): string {
    const map: Record<string, string> = {
      'auth/popup-closed-by-user': 'Closed before completing. Try again.',
      'auth/invalid-phone-number': 'Enter a valid phone number.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/configuration-not-found': 'Phone sign-in is not fully configured. Enable Phone provider and authorized domains in Firebase.',
      'default': 'Something went wrong. Please try again.'
    };
    return map[code] || map['default'];
  }
}
