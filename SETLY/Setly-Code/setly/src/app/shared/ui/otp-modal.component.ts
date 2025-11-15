import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" *ngIf="show">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📱</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Verify Your Phone</h3>
          <p class="text-gray-600 mb-6">We've sent a 6-digit code to {{ phoneNumber }}</p>

          <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <input
                type="text"
                formControlName="code"
                placeholder="Enter 6-digit code"
                class="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxlength="6"
                inputmode="numeric"
                pattern="[0-9]*"
                (input)="onCodeInput($event)">
            </div>

            <div *ngIf="errorMessage" class="text-red-600 text-sm">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              [disabled]="otpForm.invalid || loading">
              {{ loading ? 'Verifying...' : 'Submit' }}
            </button>
          </form>

          <div class="mt-4 text-sm text-gray-500">
            <button
              type="button"
              class="text-indigo-600 hover:text-indigo-800"
              [disabled]="resendDisabled"
              (click)="onResend()">
              {{ resendDisabled ? ('Resend in ' + countdown + 's') : 'Resend code' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OtpModalComponent {
  @Input() show = false;
  @Input() phoneNumber = '';
  @Input() loading = false;
  @Input() errorMessage = '';
  @Output() submit = new EventEmitter<string>();
  @Output() resend = new EventEmitter<void>();

  otpForm: FormGroup;
  resendDisabled = true;
  countdown = 30;

  constructor(private fb: FormBuilder) {
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    this.startCountdown();
  }

  onCodeInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.otpForm.patchValue({ code: value });
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.submit.emit(this.otpForm.value.code);
    }
  }

  onResend() {
    this.resend.emit();
    this.startCountdown();
  }

  private startCountdown() {
    this.resendDisabled = true;
    this.countdown = 30;
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.resendDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }
}
