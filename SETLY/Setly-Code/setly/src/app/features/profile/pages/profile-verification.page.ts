import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerificationStatusComponent } from '../components/verification-status.component';

@Component({
  selector: 'app-profile-verification-page',
  standalone: true,
  imports: [CommonModule, VerificationStatusComponent],
  template: `<div class="space-y-6"><h2 class="text-lg font-semibold">Verification</h2><app-verification-status></app-verification-status></div>`
})
export class ProfileVerificationPage {}
