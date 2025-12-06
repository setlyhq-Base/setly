import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileStats, UserProfile, computeProfileCompletion } from '../../../core/models/profile.model';

@Component({
  selector: 'app-profile-header-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <!-- Compact Instagram/Twitter/LinkedIn-style horizontal header -->
  <div class="profile-header-compact">
    <!-- Main horizontal layout: Avatar + Info + Buttons -->
    <div class="header-main">
      <!-- Left: Profile Photo (80-100px) -->
      <div class="avatar-container">
        <img [src]="resolvedAvatar" alt="Profile avatar" class="profile-photo" />
      </div>

      <!-- Center: Name, Location, Badges, Stats -->
      <div class="info-section">
        <!-- Name + Location (single line) -->
        <div class="name-location-row">
          <h1 class="profile-name">{{ fullName }}</h1>
          <span *ngIf="profile?.location" class="location-text">{{ profile?.location }}</span>
        </div>

        <!-- Verification badges row -->
        <div class="badges-row">
          <span class="badge" [class.verified]="profile?.verifications?.email">
            <svg class="badge-icon" viewBox="0 0 16 16" *ngIf="profile?.verifications?.email">
              <circle cx="8" cy="8" r="7" fill="currentColor"/>
              <path d="M5 8l2 2 4-4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
            Email
          </span>
          <span class="badge" [class.verified]="profile?.verifications?.phone">
            <svg class="badge-icon" viewBox="0 0 16 16" *ngIf="profile?.verifications?.phone">
              <circle cx="8" cy="8" r="7" fill="currentColor"/>
              <path d="M5 8l2 2 4-4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
            Phone
          </span>
          <span class="badge" [class.verified]="profile?.verifications?.university">
            <svg class="badge-icon" viewBox="0 0 16 16" *ngIf="profile?.verifications?.university">
              <circle cx="8" cy="8" r="7" fill="currentColor"/>
              <path d="M5 8l2 2 4-4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
            University
          </span>
        </div>

        <!-- Stats row (Instagram style) -->
        <div class="stats-row">
          <div class="stat">
            <div class="stat-number">{{ stats.roomsPosted }}</div>
            <div class="stat-label">Rooms</div>
          </div>
          <div class="stat">
            <div class="stat-number">{{ stats.ridesShared }}</div>
            <div class="stat-label">Rides</div>
          </div>
          <div class="stat">
            <div class="stat-number">{{ marketplaceCount }}</div>
            <div class="stat-label">Marketplace</div>
          </div>
          <div class="stat">
            <div class="stat-number">{{ stats.connectionsCount }}</div>
            <div class="stat-label">Connections</div>
          </div>
        </div>
      </div>

      <!-- Right: Action Buttons (top-right corner) -->
      <div class="actions-section">
        <ng-content select="[header-actions]"></ng-content>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: block; }
    
    /* Compact Header Container - reduced height */
    .profile-header-compact {
      background: white;
      padding: 20px 0 14px; /* Reduced from 24px/16px */
      border-bottom: 1px solid #E0E5F0; /* Light gray divider */
    }

    /* Main horizontal layout - vertically centered */
    .header-main {
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
    }

    /* Left: Profile Photo */
    .avatar-container {
      flex-shrink: 0;
    }

    .profile-photo {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e5e7eb;
    }

    /* Center: Info Section */
    .info-section {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Name + Location Row */
    .name-location-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .profile-name {
      font-size: 24px;
      font-weight: 700;
      color: #0A1A3F;
      margin: 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .location-text {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    .location-text::before {
      content: '📍 ';
      opacity: 0.7;
    }

    /* Verification Badges Row - smaller, consistent */
    .badges-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      background: #f1f5f9;
      color: #94a3b8;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .badge.verified {
      background: linear-gradient(135deg, #10b981 0%, #22c55e 100%);
      color: white;
      border-color: transparent;
      box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
    }

    .badge-icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }

    /* Stats Row - bold numbers on top, labels below */
    .stats-row {
      display: flex;
      align-items: center;
      gap: 36px; /* More spacing between stats */
      margin-top: 8px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      cursor: pointer;
      transition: transform 0.15s ease-out;
    }

    .stat:hover {
      transform: translateY(-1px);
    }

    .stat-number {
      font-size: 20px; /* Bigger for better hierarchy */
      font-weight: 600; /* Semi-bold */
      color: #0A1A3F;
      line-height: 1;
    }

    .stat-label {
      font-size: 13px; /* Slightly bigger */
      color: #64748b;
      font-weight: 500;
    }

    /* Right: Action Buttons - vertically centered with avatar */
    .actions-section {
      flex-shrink: 0;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* Match Explore page button styles */
    .actions-section ::ng-deep .btn-primary {
      background: linear-gradient(135deg, #0A1A3F 0%, #0F5FFF 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(15, 95, 255, 0.2);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .actions-section ::ng-deep .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(15, 95, 255, 0.3);
    }

    .actions-section ::ng-deep .btn-secondary {
      background: white;
      color: #0A1A3F;
      border: 1px solid #e5e7eb;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .actions-section ::ng-deep .btn-secondary:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .header-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .profile-photo {
        width: 80px;
        height: 80px;
      }

      .profile-name {
        font-size: 20px;
      }

      .stats-row {
        gap: 16px;
      }

      .stat-number {
        font-size: 18px;
      }

      .actions-section {
        width: 100%;
      }

      .actions-section ::ng-deep button {
        flex: 1;
      }
    }

    @media (max-width: 640px) {
      .name-location-row {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }

      .stats-row {
        gap: 12px;
        flex-wrap: wrap;
      }

      .profile-header-compact {
        padding: 16px 0 12px;
      }
    }
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

  // Placeholder marketplace count until wired to real data
  get marketplaceCount(): number {
    // Could be derived from profile.stats in future; default to 0
    const any = (this.profile as any);
    return (any?.stats?.marketplaceCount as number) || 0;
  }
}
