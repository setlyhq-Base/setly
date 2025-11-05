import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, SignupDraft } from '../../core/services/auth.service';
import { OrgsService, Organization } from '../../core/services/orgs.service';

@Component({
  selector: 'app-signup-step1',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Create Account</h2>
        <p class="text-gray-600 mt-2">Join Setly to find your next room</p>
      </div>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Full Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            data-testid="signup-name-input"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            placeholder="Enter your full name"
          >
          <div *ngIf="signupForm.get('name')?.invalid && signupForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
            Full name is required
          </div>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            I am a *
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="radio"
                formControlName="role"
                value="student"
                data-testid="signup-role-student"
                class="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300"
              >
              <span class="ml-2 text-sm text-gray-700">Student</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                formControlName="role"
                value="professional"
                data-testid="signup-role-professional"
                class="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300"
              >
              <span class="ml-2 text-sm text-gray-700">Working Professional</span>
            </label>
          </div>
          <div *ngIf="signupForm.get('role')?.invalid && signupForm.get('role')?.touched" class="mt-1 text-sm text-red-600">
            Please select your role
          </div>
        </div>

        <!-- Organization Search -->
        <div>
          <label for="orgSearch" class="block text-sm font-medium text-gray-700 mb-2">
            University/Company *
          </label>
          <input
            id="orgSearch"
            type="text"
            [value]="orgSearchQuery()"
            (input)="onOrgSearch($event)"
            data-testid="signup-org-search"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            placeholder="Search for your university or company"
          >
          <div *ngIf="orgSuggestions().length > 0" class="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            <div
              *ngFor="let org of orgSuggestions()"
              (click)="selectOrg(org)"
              class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              data-testid="signup-org-suggestion"
            >
              <div class="font-medium text-gray-900">{{ org.name }}</div>
              <div class="text-sm text-gray-500">{{ org.domain }}</div>
            </div>
          </div>
          <div *ngIf="selectedOrg()" class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="font-medium text-blue-900">{{ selectedOrg()?.name }}</div>
            <div class="text-sm text-blue-700">{{ selectedOrg()?.domain }}</div>
          </div>
          <div *ngIf="signupForm.get('organizationId')?.invalid && signupForm.get('organizationId')?.touched" class="mt-1 text-sm text-red-600">
            Please select a valid organization
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            data-testid="signup-email-input"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            placeholder="your@email.com"
          >
          <div *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
            <div *ngIf="signupForm.get('email')?.errors?.['required']">Email is required</div>
            <div *ngIf="signupForm.get('email')?.errors?.['email']">Please enter a valid email</div>
            <div *ngIf="signupForm.get('email')?.errors?.['domainInvalid']">Email domain is not allowed. Please use your university or company email.</div>
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            data-testid="signup-password-input"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            placeholder="Create a strong password"
          >
          <div *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched" class="mt-1 text-sm text-red-600">
            <div *ngIf="signupForm.get('password')?.errors?.['required']">Password is required</div>
            <div *ngIf="signupForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</div>
          </div>
        </div>

        <!-- Terms -->
        <div>
          <label class="flex items-start">
            <input
              type="checkbox"
              formControlName="termsAccepted"
              data-testid="signup-terms-checkbox"
              class="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded mt-0.5"
            >
            <span class="ml-2 text-sm text-gray-700">
              I agree to the <a href="/terms" class="text-brand-blue hover:underline">Terms of Service</a> and
              <a href="/privacy" class="text-brand-blue hover:underline">Privacy Policy</a>
            </span>
          </label>
          <div *ngIf="signupForm.get('termsAccepted')?.invalid && signupForm.get('termsAccepted')?.touched" class="mt-1 text-sm text-red-600">
            You must accept the terms to continue
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="signupForm.invalid || isSubmitting()"
          data-testid="signup-submit-btn"
          class="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          <span *ngIf="!isSubmitting()">Continue</span>
          <span *ngIf="isSubmitting()">Creating Account...</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Already have an account?
          <a routerLink="/auth/sign-in" class="text-brand-blue hover:text-brand-blue/80 font-medium">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class SignupStep1Component {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private orgsService = inject(OrgsService);
  private router = inject(Router);

  signupForm: FormGroup;
  isSubmitting = signal(false);
  orgSearchQuery = signal('');
  orgSuggestions = signal<Organization[]>([]);
  selectedOrg = signal<Organization | null>(null);

  constructor() {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      role: ['', [Validators.required]],
      organizationId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, this.domainValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  onOrgSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.orgSearchQuery.set(query);
    if (query.length >= 2) {
      this.orgSuggestions.set(this.orgsService.search(query));
    } else {
      this.orgSuggestions.set([]);
    }
  }

  selectOrg(org: Organization) {
    this.selectedOrg.set(org);
    this.signupForm.patchValue({ organizationId: org.id });
    this.orgSearchQuery.set(org.name);
    this.orgSuggestions.set([]);
  }

  domainValidator(control: any) {
    if (!control.value) return null;
    const validation = this.orgsService.validateDomain(control.value);
    return validation.isValid ? null : { domainInvalid: true };
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const formValue = this.signupForm.value;
      const draft: SignupDraft = {
        name: formValue.name,
        role: formValue.role,
        organizationId: formValue.organizationId,
        email: formValue.email,
        password: formValue.password,
        termsAccepted: formValue.termsAccepted
      };

      await this.authService.initiateSignup(draft);
      this.router.navigate(['/signup/step2']);
    } catch (error) {
      console.error('Signup initiation failed:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
