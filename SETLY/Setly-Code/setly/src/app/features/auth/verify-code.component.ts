import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-2">Verify Your Phone</h2>
        <p class="text-gray-400">We've sent a 6-digit code to {{ email() }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
          <div class="flex space-x-2">
            @for (i of [0,1,2,3,4,5]; track i) {
              <input
                type="text"
                maxlength="1"
                [formControlName]="'digit' + i"
                (input)="onDigitInput($event, i)"
                (keydown)="onDigitKeydown($event, i)"
                class="w-12 h-12 text-center text-xl font-bold bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
            }
          </div>
        </div>

        <button
          type="submit"
          [disabled]="loading() || form.invalid"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
        >
          @if (loading()) {
            <div class="flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Verifying...
            </div>
          } @else {
            Verify Code
          }
        </button>
      </form>

      <div class="text-center space-y-2">
        <p class="text-sm text-gray-400">
          Didn't receive the code?
          <button
            type="button"
            (click)="resendCode()"
            [disabled]="resendDisabled()"
            class="text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Resend{{ resendCountdown() > 0 ? ' (' + resendCountdown() + 's)' : '' }}
          </button>
        </p>

        <button
          type="button"
          (click)="changePhone()"
          class="text-gray-400 hover:text-gray-300 text-sm"
        >
          Change phone number
        </button>
      </div>
    </div>
  `
})
export class VerifyCodeComponent {
  email = signal('');
  loading = signal(false);
  resendDisabled = signal(false);
  resendCountdown = signal(0);
  form: FormGroup;

  private countdownInterval?: number;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit1: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit2: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit3: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit4: ['', [Validators.required, Validators.pattern(/[0-9]/)]],
      digit5: ['', [Validators.required, Validators.pattern(/[0-9]/)]]
    });

    // Get phone number from current user or verification state
    const currentUser = this.authService.currentUser();
    this.email.set(currentUser?.phoneNumber || '');

    // Start resend countdown
    this.startResendCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onDigitInput(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value && index < 5) {
      // Auto-focus next input
      const nextInput = document.querySelector(`input[formControlName="digit${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number) {
    const target = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !target.value && index > 0) {
      // Focus previous input on backspace
      const prevInput = document.querySelector(`input[formControlName="digit${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const code = Object.values(this.form.value).join('');
    this.loading.set(true);

    try {
      await this.authService.verifyPhoneCode(code);
      // Success - redirect to profile setup for new users
      this.router.navigate(['/auth/profile']);
    } catch (error) {
      console.error('Verification error:', error);
      // Handle error - show message, clear form, etc.
      this.form.reset();
      const firstInput = document.querySelector('input[formControlName="digit0"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    } finally {
      this.loading.set(false);
    }
  }

  async resendCode() {
    if (this.resendDisabled()) return;

    try {
      // For phone verification, we need to re-send the SMS
      // This would typically require storing the phone number and re-initiating
      this.startResendCountdown();
    } catch (error) {
      console.error('Resend error:', error);
    }
  }

  changePhone() {
    // Navigate back to phone input or show modal
    this.router.navigate(['/auth']);
  }

  private startResendCountdown() {
    this.resendDisabled.set(true);
    this.resendCountdown.set(60);

    this.countdownInterval = window.setInterval(() => {
      this.resendCountdown.update(count => {
        if (count <= 1) {
          this.resendDisabled.set(false);
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
          }
          return 0;
        }
        return count - 1;
      });
    }, 1000);
  }
}
