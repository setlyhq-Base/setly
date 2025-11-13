import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-security-page',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h2 class="text-lg font-semibold">Security & Privacy</h2><p class="text-sm text-gray-600">Controls for visibility, sessions, and safety preferences will appear here.</p></div>`
})
export class ProfileSecurityPage {}
