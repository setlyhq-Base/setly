import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, SignupDraft } from '../../core/services/auth.service';
import { OrgsService } from '../../core/services/orgs.service';

@Component({
  selector: 'app-signup-step3',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p class="text-gray-600 mt-2">Tell us a bit more about yourself</p>
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Role-specific fields -->
        <div *ngIf="userRole() === 'student'">
          <label for="graduationYear" class="block text-sm font-medium text-gray-700 mb-2">
            Expected Graduation Year *
          </label>
          <select
            id="graduationYear"
            formControlName="graduationYear"
            data-testid="signup-graduation-year"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          >
            <option value="">Select year</option>
            <option *ngFor="let year of graduationYears" [value]="year">{{ year }}</option>
          </select>
          <div *ngIf="profileForm.get('graduationYear')?.invalid && profileForm.get('graduationYear')?.touched" class="mt-1 text-sm text-red-600">
            Please select your graduation year
          </div>
        </div>

        <div *ngIf="userRole() === 'professional'">
          <div class="space-y-4">
            <div>
              <label for="jobTitle" class="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                id="jobTitle"
                type="text"
                formControlName="jobTitle"
                data-testid="signup-job-title"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="e.g. Software Engineer"
              >
              <div *ngIf="profileForm.get('jobTitle')?.invalid && profileForm.get('jobTitle')?.touched" class="mt-1 text-sm text-red-600">
                Job title is required
              </div>
            </div>

            <div>
              <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                id="company"
                type="text"
                formControlName="company"
                data-testid="signup-company"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="e.g. Google"
              >
              <div *ngIf="profileForm.get('company')?.invalid && profileForm.get('company')?.touched" class="mt-1 text-sm text-red-600">
                Company is required
              </div>
            </div>
          </div>
        </div>

        <!-- Optional: Phone -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            formControlName="phone"
            data-testid="signup-phone"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            placeholder="(555) 123-4567"
          >
        </div>

        <!-- Preferences -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Housing Preferences</h3>

          <div class="space-y-4">
            <div>
              <label for="budgetMin" class="block text-sm font-medium text-gray-700 mb-2">
                Minimum Budget ($)
              </label>
              <input
                id="budgetMin"
                type="number"
                formControlName="budgetMin"
                data-testid="signup-budget-min"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="500"
              >
            </div>

            <div>
              <label for="budgetMax" class="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget ($)
              </label>
              <input
                id="budgetMax"
                type="number"
                formControlName="budgetMax"
                data-testid="signup-budget-max"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="1500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    type="radio"
                    formControlName="roomType"
                    value="private"
                    data-testid="signup-room-private"
                    class="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                  >
                  <span class="ml-2 text-sm text-gray-700">Private Room</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    formControlName="roomType"
                    value="shared"
                    data-testid="signup-room-shared"
                    class="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                  >
                  <span class="ml-2 text-sm text-gray-700">Shared Room</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="profileForm.invalid || isSubmitting()"
          data-testid="signup-complete-btn"
          class="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          <span *ngIf="!isSubmitting()">Complete Profile</span>
          <span *ngIf="isSubmitting()">Creating Account...</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          type="button"
          (click)="goBack()"
          data-testid="signup-back-step3-btn"
          class="text-brand-blue hover:text-brand-blue/80 font-medium"
        >
          Back
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class SignupStep3Component implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private orgsService = inject(OrgsService);
  private router = inject(Router);

  profileForm!: FormGroup;
  isSubmitting = signal(false);
  userRole = signal<'student' | 'professional'>('student');
  graduationYears: number[] = [];

  ngOnInit() {
    const draft = this.authService.signupDraft();
    if (!draft) {
      this.router.navigate(['/signup/step1']);
      return;
    }

    this.userRole.set(draft.role);

    // Generate graduation years (current year + 4)
    const currentYear = new Date().getFullYear();
    this.graduationYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

    this.initializeForm();
  }

  private initializeForm() {
    const role = this.userRole();

    if (role === 'student') {
      this.profileForm = this.fb.group({
        graduationYear: ['', [Validators.required]],
        phone: [''],
        budgetMin: [500],
        budgetMax: [1500],
        roomType: ['private']
      });
    } else {
      this.profileForm = this.fb.group({
        jobTitle: ['', [Validators.required]],
        company: ['', [Validators.required]],
        phone: [''],
        budgetMin: [500],
        budgetMax: [1500],
        roomType: ['private']
      });
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const formValue = this.profileForm.value;
      const draft = this.authService.signupDraft();

      if (!draft) {
        throw new Error('No signup draft found');
      }

      // Get organization details
      const organization = this.orgsService.getById(draft.organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const profileData: Partial<any> = {
        organization,
        phone: formValue.phone,
        preferences: {
          budgetMin: formValue.budgetMin,
          budgetMax: formValue.budgetMax,
          roomType: formValue.roomType
        }
      };

      if (this.userRole() === 'student') {
        profileData['graduationYear'] = formValue.graduationYear;
        // Calculate alumni cohort if graduated
        const currentYear = new Date().getFullYear();
        if (formValue.graduationYear < currentYear) {
          profileData['role'] = 'alumni';
        }
      } else {
        profileData['jobTitle'] = formValue.jobTitle;
        profileData['company'] = formValue.company;
      }

      await this.authService.completeProfile(profileData);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Profile completion failed:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/signup/step2']);
  }
}
