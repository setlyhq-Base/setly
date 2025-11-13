import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-activity-page',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="space-y-4"><h2 class="text-lg font-semibold">Activity</h2><p class="text-sm text-gray-600">Your recent listings, rides, and reviews will show here.</p></div>`
})
export class ProfileActivityPage {}
