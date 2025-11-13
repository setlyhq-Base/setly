import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-preferences-page',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h2 class="text-lg font-semibold">Preferences</h2><p class="text-sm text-gray-600">Notification and content preferences placeholder.</p></div>`
})
export class ProfilePreferencesPage {}
