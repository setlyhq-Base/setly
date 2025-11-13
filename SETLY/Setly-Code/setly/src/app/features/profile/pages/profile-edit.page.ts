import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileEditFormComponent } from '../components/profile-edit-form.component';

@Component({
  selector: 'app-profile-edit-page',
  standalone: true,
  imports: [CommonModule, ProfileEditFormComponent],
  template: `<div class="card"><h2 class="text-lg font-semibold mb-4">Edit Profile</h2><app-profile-edit-form></app-profile-edit-form></div>`
})
export class ProfileEditPage {}
