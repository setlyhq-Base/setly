import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileHeaderCardComponent } from '../components/profile-header-card.component';
import { AboutMeComponent } from '../components/about-me.component';
import { InterestsGridComponent } from '../components/interests-grid.component';

@Component({
  selector: 'app-profile-overview-page',
  standalone: true,
  imports: [CommonModule, ProfileHeaderCardComponent, AboutMeComponent, InterestsGridComponent],
  template: `<div class="space-y-6">Overview placeholder</div>`
})
export class ProfileOverviewPage {}
