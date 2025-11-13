import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStore } from '../../core/state/user.store';
import { computeCompletion, ProfileSpec, VerificationsSpec } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile-nudge-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show()" class="w-full border rounded-xl p-4 md:p-5 bg-white flex items-center justify-between gap-3" role="region" aria-label="Complete your profile">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] text-white flex items-center justify-center font-semibold">{{ pct() }}</div>
        <div>
          <div class="font-medium text-gray-900">Finish your profile to post a room or message hosts ({{ pct() }}%)</div>
          <div class="text-sm text-gray-600">Complete a few quick steps to unlock trusted actions.</div>
        </div>
      </div>
  <button (click)="go()" class="btn-primary rounded-lg px-4 py-2">Complete profile</button>
    </div>
  `
})
export class ProfileNudgeBannerComponent {
  private userStore = inject(UserStore);
  private router = inject(Router);

  pct = computed(() => {
    const u = this.userStore.user();
    if (!u) return 0;
    const p: ProfileSpec = {
      userId: u.id,
      displayName: u.name,
      avatarUrl: u.photoUrl,
      visibility: { publicProfile: true, showCity: true }
    };
    const v: VerificationsSpec = {
      emailVerified: !!u.emailVerified,
      phoneVerified: !!u.phone,
      eduVerified: !!u.domainVerified,
      idVerified: false
    };
    return computeCompletion(p, v);
  });

  show = computed(() => this.pct() < 100);

  go() {
    const returnUrl = encodeURIComponent(this.router.url || '/');
    this.router.navigate(['/profile/wizard'], { queryParams: { returnUrl } });
  }
}
