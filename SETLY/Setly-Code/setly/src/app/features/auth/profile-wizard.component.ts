import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UniversityService } from '../../core/services/university.service';

@Component({
  selector: 'app-profile-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
        <p class="text-gray-400">Tell us about yourself to get started</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">I am a</label>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              (click)="setRole('student')"
              [class.active]="form.get('role')?.value === 'student'"
              class="p-4 border border-gray-600 rounded-lg text-left hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div class="font-medium text-white">Student</div>
              <div class="text-sm text-gray-400">University verification required</div>
            </button>
            <button
              type="button"
              (click)="setRole('professional')"
              [class.active]="form.get('role')?.value === 'professional'"
              class="p-4 border border-gray-600 rounded-lg text-left hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div class="font-medium text-white">Professional</div>
              <div class="text-sm text-gray-400">Work email verification required</div>
            </button>
          </div>
        </div>

        @if (form.get('role')?.value === 'student') {
          <!-- Student Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">University</label>
              <input
                type="text"
                formControlName="university"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Search universities..."
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Program/Course</label>
              <input
                type="text"
                formControlName="program"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Computer Science"
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="month"
                  formControlName="startDate"
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="month"
                  formControlName="endDate"
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="graduated"
                type="checkbox"
                formControlName="graduated"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              >
              <label for="graduated" class="ml-2 block text-sm text-gray-300">
                I have graduated
              </label>
            </div>

            @if (form.get('graduated')?.value) {
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Graduation Year</label>
                <input
                  type="number"
                  formControlName="gradYear"
                  min="1900"
                  max="2030"
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="2024"
                >
              </div>
            }
          </div>
        }

        @if (form.get('role')?.value === 'professional') {
          <!-- Professional Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Company</label>
              <input
                type="text"
                formControlName="company"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Company name"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Job Title/Role</label>
              <input
                type="text"
                formControlName="title"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Software Engineer"
              >
            </div>
          </div>
        }

        <button
          type="submit"
          [disabled]="loading() || form.invalid"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
        >
          @if (loading()) {
            <div class="flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving Profile...
            </div>
          } @else {
            Complete Profile
          }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .active {
      @apply border-indigo-500 bg-indigo-500/10;
    }
  `]
})
export class ProfileWizardComponent {
  loading = signal(false);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private universityService: UniversityService
  ) {
    this.form = this.fb.group({
      role: ['', Validators.required],
      university: [''],
      program: [''],
      startDate: [''],
      endDate: [''],
      graduated: [false],
      gradYear: [''],
      company: [''],
      title: ['']
    });

    // Set initial role from current user if available
    const currentUser = this.authService.currentUser();
    if (currentUser?.role) {
      this.setRole(currentUser.role);
    }
  }

  setRole(role: 'student' | 'professional') {
    this.form.patchValue({ role });

    if (role === 'student') {
      this.form.get('university')?.setValidators([Validators.required]);
      this.form.get('program')?.setValidators([Validators.required]);
      this.form.get('startDate')?.setValidators([Validators.required]);
      this.form.get('endDate')?.setValidators([Validators.required]);

      this.form.get('company')?.clearValidators();
      this.form.get('title')?.clearValidators();
    } else {
      this.form.get('company')?.setValidators([Validators.required]);
      this.form.get('title')?.setValidators([Validators.required]);

      this.form.get('university')?.clearValidators();
      this.form.get('program')?.clearValidators();
      this.form.get('startDate')?.clearValidators();
      this.form.get('endDate')?.clearValidators();
    }

    this.form.get('university')?.updateValueAndValidity();
    this.form.get('program')?.updateValueAndValidity();
    this.form.get('startDate')?.updateValueAndValidity();
    this.form.get('endDate')?.updateValueAndValidity();
    this.form.get('company')?.updateValueAndValidity();
    this.form.get('title')?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const profileData = this.form.value;
      const currentUser = this.authService.currentUser();

      // Prepare profile data for Firestore
      const userProfile = {
        ...profileData,
        id: currentUser?.id || '',
        name: currentUser?.name || '',
        primaryEmail: currentUser?.primaryEmail || '',
        emailVerified: currentUser?.emailVerified || false,
        domainVerified: false, // Will be set by verification process
        createdAt: currentUser?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await this.authService.upsertUserProfile(userProfile);

      // If domain verification is needed, redirect to verification
      if (this.needsDomainVerification(userProfile)) {
        this.router.navigate(['/auth/verify']);
      } else {
        // Otherwise, go to dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      // Handle error
    } finally {
      this.loading.set(false);
    }
  }

  private needsDomainVerification(profile: any): boolean {
    // Check if domain is in allowlist or needs verification
    // This would check against Firestore config
    return true; // For now, assume verification needed
  }
}
