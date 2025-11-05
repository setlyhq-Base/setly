import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, VerificationState } from '../../core/services/auth.service';
import { CodeTimerService } from '../../core/services/code-timer.service';

@Component({
  selector: 'app-signup-step2',
  imports: [CommonModule],
  template: `
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p class="text-gray-600 mt-2">
          We've sent a 6-digit code to {{ verificationState()?.email }}
        </p>
      </div>

      <div class="space-y-6">
        <!-- Code Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
            Enter Verification Code
          </label>
          <div class="flex justify-center space-x-2">
            <input
              *ngFor="let i of [0,1,2,3,4,5]"
              type="text"
              maxlength="1"
              [value]="codeDigits()[i] || ''"
              (input)="onDigitInput($event, i)"
              (keydown)="onDigitKeydown($event, i)"
              (paste)="onPaste($event)"
              [attr.data-testid]="'signup-code-input-' + i"
              class="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              [class.border-red-500]="hasError()"
            >
          </div>
          <div *ngIf="hasError()" class="mt-2 text-sm text-red-600 text-center">
            {{ errorMessage() }}
          </div>
        </div>

        <!-- Resend Code -->
        <div class="text-center">
          <button
            type="button"
            (click)="resendCode()"
            [disabled]="codeTimer.isActive()"
            data-testid="signup-resend-btn"
            class="text-brand-blue hover:text-brand-blue/80 disabled:text-gray-400 font-medium"
          >
            <span *ngIf="!codeTimer.isActive()">Resend Code</span>
            <span *ngIf="codeTimer.isActive()">Resend in {{ codeTimer.remainingTime() }}s</span>
          </button>
        </div>

        <!-- Verify Button -->
        <button
          type="button"
          (click)="verifyCode()"
          [disabled]="isVerifying() || codeDigits().join('').length !== 6"
          data-testid="signup-verify-btn"
          class="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          <span *ngIf="!isVerifying()">Verify Email</span>
          <span *ngIf="isVerifying()">Verifying...</span>
        </button>

        <!-- Back Button -->
        <button
          type="button"
          (click)="goBack()"
          data-testid="signup-back-btn"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
        >
          Back
        </button>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class SignupStep2Component implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  public codeTimer = inject(CodeTimerService);

  verificationState = this.authService.verificationState;
  codeDigits = signal<string[]>(['', '', '', '', '', '']);
  isVerifying = signal(false);
  hasError = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    if (!this.verificationState()) {
      this.router.navigate(['/signup/step1']);
      return;
    }
    this.codeTimer.startTimer(60);
  }

  ngOnDestroy() {
    this.codeTimer.stopTimer();
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Only allow digits

    if (value) {
      const newDigits = [...this.codeDigits()];
      newDigits[index] = value;
      this.codeDigits.set(newDigits);

      // Auto-advance to next input
      if (index < 5 && value) {
        const nextInput = document.querySelector(`[data-testid="signup-code-input-${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }

    this.hasError.set(false);
    this.errorMessage.set('');
  }

  onDigitKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.codeDigits()[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.querySelector(`[data-testid="signup-code-input-${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        const newDigits = [...this.codeDigits()];
        newDigits[index - 1] = '';
        this.codeDigits.set(newDigits);
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const digits = paste.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length === 6) {
      this.codeDigits.set(digits);
      // Focus last input
      const lastInput = document.querySelector(`[data-testid="signup-code-input-5"]`) as HTMLInputElement;
      if (lastInput) lastInput.focus();
    }
  }

  async verifyCode() {
    const code = this.codeDigits().join('');
    if (code.length !== 6) return;

    this.isVerifying.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    try {
      const result = await this.authService.verifyCode(code);
      if (result.success) {
        this.router.navigate(['/signup/step3']);
      } else {
        this.hasError.set(true);
        this.errorMessage.set(result.message || 'Verification failed');
      }
    } catch (error: any) {
      this.hasError.set(true);
      this.errorMessage.set(error.message || 'Verification failed');
    } finally {
      this.isVerifying.set(false);
    }
  }

  async resendCode() {
    try {
      const result = await this.authService.resendCode();
      if (result.success) {
        this.codeTimer.startTimer(60);
        this.hasError.set(false);
        this.errorMessage.set('');
      } else {
        this.hasError.set(true);
        this.errorMessage.set(result.message || 'Failed to resend code');
      }
    } catch (error: any) {
      this.hasError.set(true);
      this.errorMessage.set(error.message || 'Failed to resend code');
    }
  }

  goBack() {
    this.router.navigate(['/signup/step1']);
  }
}
