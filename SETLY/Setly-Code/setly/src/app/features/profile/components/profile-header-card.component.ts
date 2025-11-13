import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileStats, UserProfile, computeProfileCompletion } from '../../../core/models/profile.model';
import { AvatarUploaderComponent } from '../../../shared/ui/avatar-uploader.component';
import { ParallaxDirective } from '../../../shared/directives/parallax.directive';

@Component({
  selector: 'app-profile-header-card',
  standalone: true,
  imports: [CommonModule, AvatarUploaderComponent, ParallaxDirective],
  template: `
  <section class="bg-white rounded-2xl shadow-sm border border-gray-200">
    <!-- Banner -->
  <div class="banner-cinematic relative h-40 md:h-56 w-full group" [appParallax]="0.25">
    <img *ngIf="profile?.coverImageUrl; else bannerPlaceholder" [src]="profile?.coverImageUrl" class="banner-media transition-transform duration-700 ease-out group-hover:scale-[1.03] will-change-transform" alt="profile banner" />
        <ng-template #bannerPlaceholder>
          <div class="w-full h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-80 flex items-center justify-center banner-anim">
            <div class="text-white/80 text-sm tracking-wide">Add a banner to personalize your space</div>
          </div>
        </ng-template>
        <div class="banner-tint"></div>
        <div class="banner-glow"></div>
        <!-- Projected header actions (Edit/Public/Share) -->
        <div class="absolute top-2 right-2 flex items-center gap-4">
          <ng-content select="[header-actions]"></ng-content>
          <button *ngIf="canEdit" (click)="edit.emit()" class="hidden">
            <!-- Fallback hidden (we provide actions from parent) -->
          </button>
        </div>
      </div>

  <div class="p-6 md:p-8 relative z-10">
        <!-- Centered avatar overlapping banner -->
        <div class="-mt-16 flex justify-center">
          <div class="relative">
            <div class="avatar-shell w-32 h-32">
              <div class="avatar-ring" [class.pulse]="avatarPulse" [style.--p]="completion">
                <img [src]="resolvedAvatar" alt="Profile avatar" class="avatar-img" />
              </div>
            </div>
            <div *ngIf="completion < 100 && missing.length" class="completion-tip" role="tooltip">
              <h4>{{ completion }}% complete</h4>
              <ul>
                <li *ngFor="let tip of missing">⏺ {{ tip }}</li>
              </ul>
            </div>
            <div class="mt-2 flex justify-center">
              <app-avatar-uploader (updated)="onAvatar($event)"></app-avatar-uploader>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="mt-4 flex flex-col items-center text-center">
          <div class="flex flex-wrap items-center gap-3 justify-center">
            <h1 class="name-title">{{ fullName }}</h1>
            <span class="text-gray-500" *ngIf="profile?.location">•</span>
            <div class="flex items-center gap-2 text-gray-600" *ngIf="profile?.location">
              <span>📍</span>
              <span>{{ profile?.location }}</span>
            </div>
          </div>
          <div class="mt-2 text-gray-700 font-medium" *ngIf="profile?.headline; else noHeadline">
            {{ profile?.headline }}
          </div>
          <ng-template #noHeadline>
            <div class="mt-2 text-gray-400 italic">Add a short headline to introduce yourself</div>
          </ng-template>

          <!-- Stats Row -->
          <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat-chip">🏠 {{ stats.roomsPosted }} Rooms</div>
            <div class="stat-chip">🚗 {{ stats.ridesShared }} Rides</div>
            <div class="stat-chip">💬 {{ stats.reviewsCount }} Reviews</div>
            <div class="stat-chip">🌍 {{ stats.connectionsCount }} Connections</div>
          </div>

          <!-- Badges -->
          <div class="mt-4 flex flex-wrap gap-2 justify-center">
            <span class="verify-badge" [class.badge-on]="profile?.verifications?.identity">✅ Identity</span>
            <span class="verify-badge" [class.badge-on]="profile?.verifications?.university">🎓 University</span>
            <span class="verify-badge" [class.badge-on]="profile?.verifications?.phone">📞 Phone</span>
            <span class="verify-badge" [class.badge-on]="profile?.verifications?.email">✉️ Email</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .banner-cinematic { box-shadow: 0 8px 24px -12px rgba(17,24,39,0.18); }
    .stat-chip { @apply bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-xl border border-gray-200 font-medium; }
    .verify-badge { @apply text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 font-medium; }
    .badge-on { @apply bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-transparent; }
  .avatar-shell { position:relative; }
  .avatar-ring { position:relative; width:100%; height:100%; border-radius:50%; padding:4px; background:conic-gradient(var(--gradient-start) calc(var(--p)*1%), #e5e7eb 0); box-shadow:0 10px 28px -12px rgba(90,79,243,.35), 0 4px 12px -4px rgba(90,79,243,.25); transition:transform .4s cubic-bezier(.16,.8,.3,1), box-shadow .4s; }
  .avatar-ring::after { content:""; position:absolute; inset:8px; background:#fff; border-radius:50%; }
  .avatar-ring .avatar-img { position:relative; z-index:2; }
  .avatar-ring.pulse { animation: avatarPop .5s cubic-bezier(.2,.8,.2,1); }
  @keyframes avatarPop { 0% { transform: scale(.92); } 60% { transform: scale(1.04); } 100% { transform: scale(1); } }
  .completion-tip { position:absolute; top:0; left:100%; transform:translate(12px, 12px); background:#111827; color:#fff; font-size:.65rem; padding:.45rem .6rem; border-radius:.6rem; display:flex; flex-direction:column; gap:.25rem; box-shadow:0 10px 24px -8px rgba(0,0,0,.45); width:160px; }
  .completion-tip h4 { font-size:.6rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; opacity:.8; }
  .completion-tip ul { list-style:none; display:flex; flex-direction:column; gap:.25rem; }
  .completion-tip li { display:flex; align-items:center; gap:.35rem; font-size:.6rem; }
  @media (max-width:800px){ .completion-tip { display:none; } }
  .avatar-ring:hover { transform:translateY(-2px); box-shadow:0 14px 34px -10px rgba(90,79,243,.6), 0 6px 16px -6px rgba(90,79,243,.4); }
    .avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; background:#fff; box-shadow:0 0 0 4px #fff; }
    @media (max-width:640px){ .avatar-shell { width:104px; height:104px; } }
    .name-title { font-size:22px; line-height:1.2; font-weight:600; color:#111827; }
  `]
})
export class ProfileHeaderCardComponent implements OnChanges {
  @Input() profile?: UserProfile;
  @Input() canEdit = true;
  @Input() missingTips: string[] = [];
  @Output() edit = new EventEmitter<void>();

  // Track a stable avatar URL to prevent flicker when profile input re-computes
  displayedAvatar = '/assets/avatar-placeholder.svg';
  // Trigger a pulse animation when avatar changes
  avatarPulse = false;

  get resolvedAvatar(): string {
    return this.displayedAvatar;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile']) {
      const url = this.profile?.avatarUrl;
      this.displayedAvatar = url && url.trim().length > 0 ? url : '/assets/avatar-placeholder.svg';
    }
  }

  get stats(): ProfileStats {
    return (
      this.profile?.stats || {
        roomsPosted: 0,
        ridesShared: 0,
        reviewsCount: 0,
        connectionsCount: 0,
      }
    );
  }

  get fullName(): string {
    const f = this.profile?.firstName || 'First';
    const l = this.profile?.lastName || 'Last';
    return `${f} ${l}`;
  }

  get completion(): number {
    if (typeof this.profile?.completionPercent === 'number') return this.profile!.completionPercent;
    return computeProfileCompletion(this.profile!);
  }

  get missing(): string[] { return this.missingTips.slice(0,6); }

  onAvatar(url: string) {
    // Update only the displayed avatar; parent will handle persistence
    this.displayedAvatar = url || '/assets/avatar-placeholder.svg';
    this.avatarPulse = true;
    setTimeout(()=> this.avatarPulse = false, 650);
  }
}
