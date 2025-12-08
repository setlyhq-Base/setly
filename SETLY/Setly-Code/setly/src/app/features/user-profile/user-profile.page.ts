import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfileService, ListingCardVM } from '../../core/services/user-profile.service';
import { RoommatePreferences, PublicUserDetail, LocationHistoryItem } from '../../core/services/users.service';

interface VerificationBadge {
  label: string;
  active: boolean;
}

interface VerificationChecklistItem {
  label: string;
  verified: boolean;
  comingSoon?: boolean;
}

interface PreferenceItem {
  label: string;
  value: string;
  icon: string;
}

interface TimelineItem {
  title: string;
  subtitle?: string;
  range?: string;
}

interface ReviewTab {
  key: string;
  label: string;
}

interface ConnectionPreview {
  initial: string;
}

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./user-profile.page.scss'],
  template: `
    <!-- Mobile-First Premium Profile -->
    <div class="profile-container">
      <!-- Mobile App Header -->
      <header class="profile-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="header-title">Profile</h1>
        <button class="more-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </header>

      <ng-container *ngIf="!loading(); else loadingState">
        <ng-container *ngIf="!loadError() && detail(); else notFound">
          <!-- Profile Content -->
          <div class="profile-content">
            <!-- Hero Section -->
            <section class="profile-hero">
              <!-- Large Profile Photo -->
              <div class="profile-photo-wrapper">
                <div class="profile-photo-ring">
                  <img
                    [src]="detail()?.avatarUrl || '/assets/avatar-placeholder.svg'"
                    alt="Profile photo"
                    class="profile-photo"
                  />
                  <div class="status-indicator" [class.online]="isOnline()"></div>
                </div>
              </div>

              <!-- User Info -->
              <div class="user-info">
                <div class="name-verified">
                  <h2 class="user-name">{{ detail()?.name }}</h2>
                  <svg *ngIf="isVerified()" class="verified-badge" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#dbeafe"/>
                  </svg>
                </div>
                <p class="user-title" *ngIf="detail()?.organization">
                  {{ detail()?.role }} at {{ detail()?.organization }}
                </p>
                <p class="user-location" *ngIf="detail()?.location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                  </svg>
                  {{ detail()?.location }}
                </p>
              </div>

              <!-- Trust Score -->
              <div class="trust-section">
                <div class="trust-ring" [style.--progress]="trustScore()">
                  <span class="trust-value">{{ trustScore() }}%</span>
                </div>
                <span class="trust-label">Trust Score</span>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button class="btn-primary" (click)="onConnect()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Connect
                </button>
                <button class="btn-secondary" (click)="onMessage()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Message
                </button>
                <button class="btn-icon" (click)="onFollow()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>

              <!-- Stats Bar -->
              <div class="stats-bar">
                <div class="stat-item">
                  <span class="stat-value">{{ roomsCount() }}</span>
                  <span class="stat-label">Rooms</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ connectionsCount() }}</span>
                  <span class="stat-label">Connections</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Reviews</span>
                </div>
              </div>
            </section>

            <!-- About Section -->
            <section class="content-card" *ngIf="detail()?.bio">
              <div class="card-header">
                <h3 class="card-title">About</h3>
              </div>
              <p class="about-text">{{ detail()?.bio }}</p>
            </section>

            <!-- Verification Section -->
            <section class="content-card">
              <div class="card-header">
                <h3 class="card-title">Verification</h3>
                <svg class="shield-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              </div>
              <div class="verification-grid">
                <div *ngFor="let item of verificationChecklist()" class="verification-item" [class.verified]="item.verified">
                  <div class="verification-icon">
                    <svg *ngIf="item.verified" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg *ngIf="!item.verified" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <span class="verification-label">{{ item.label }}</span>
                  <span *ngIf="item.comingSoon" class="coming-soon-badge">Soon</span>
                </div>
              </div>
            </section>

            <!-- Interests Section -->
            <section class="content-card" *ngIf="interestTags().length">
              <div class="card-header">
                <h3 class="card-title">Interests</h3>
                <span class="count-badge">{{ interestTags().length }}</span>
              </div>
              <div class="interests-grid">
                <span *ngFor="let tag of interestTags()" class="interest-tag">{{ tag }}</span>
              </div>
            </section>

            <!-- Roommate Preferences -->
            <section class="content-card" *ngIf="preferenceItems().length">
              <div class="card-header">
                <h3 class="card-title">Roommate Preferences</h3>
              </div>
              <div class="preferences-list">
                <div *ngFor="let pref of preferenceItems()" class="preference-item">
                  <span class="pref-icon">{{ pref.icon }}</span>
                  <div class="pref-content">
                    <span class="pref-label">{{ pref.label }}</span>
                    <span class="pref-value">{{ pref.value }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Active Rooms -->
            <section class="content-card" *ngIf="roomsCount() > 0">
              <div class="card-header">
                <h3 class="card-title">Active Rooms</h3>
                <span class="count-badge">{{ roomsCount() }}</span>
              </div>
              <div class="listings-scroll" *ngIf="!roomsLoading()">
                <a *ngFor="let room of roomsPreview()" [routerLink]="['/listing', room.id]" class="listing-card">
                  <img *ngIf="room.photo" [src]="room.photo" alt="Room" class="listing-image" />
                  <div class="listing-info">
                    <h4 class="listing-title">{{ room.title }}</h4>
                    <p class="listing-price" *ngIf="room.price">{{ formatPrice(room.price) }}/mo</p>
                    <p class="listing-location" *ngIf="room.city || room.state">{{ formatCityState(room.city, room.state) }}</p>
                  </div>
                </a>
              </div>
              <button *ngIf="roomsCount() > 3" class="view-all-btn">View all {{ roomsCount() }} rooms →</button>
            </section>

            <!-- Connections -->
            <section class="content-card" *ngIf="connectionsCount() > 0">
              <div class="card-header">
                <h3 class="card-title">Connections</h3>
                <span class="count-badge">{{ connectionsCount() }}</span>
              </div>
              <div class="connections-preview">
                <div class="avatar-stack">
                  <span *ngFor="let conn of connectionsPreview(); let i = index" class="connection-avatar" [style.z-index]="10 - i">{{ conn.initial }}</span>
                </div>
                <span class="connections-text">Mutual connections</span>
              </div>
              <button class="view-all-btn" (click)="viewConnections()">See all connections →</button>
            </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Where They’ve Been</h2>
                  </header>
                  <ng-container *ngIf="travelTimeline().length; else noHistory">
                    <ul class="relative">
                      <li
                        *ngFor="let item of travelTimeline(); let last = last"
                        class="relative pl-6 border-l border-slate-200 pb-6"
                        [class.border-transparent]="last"
                      >
                        <span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full shadow" style="background: var(--brand-gradient)"></span>
                        <p class="text-sm font-semibold text-slate-800">{{ item.title }}</p>
                        <p *ngIf="item.subtitle" class="text-xs text-brand-azure font-medium">{{ item.subtitle }}</p>
                        <p *ngIf="item.range" class="text-xs uppercase tracking-wide text-slate-500 mt-1">{{ item.range }}</p>
                      </li>
                    </ul>
                  </ng-container>
                  <ng-template #noHistory>
                    <p class="text-sm text-slate-400">No location history shared yet.</p>
                  </ng-template>
                </section>

            <!-- Member Since -->
            <section class="content-card" *ngIf="joinedLabel()">
              <div class="member-since">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#94a3b8" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div class="member-text">
                  <span class="member-label">Member Since</span>
                  <span class="member-date">{{ joinedLabel() }}</span>
                </div>
              </div>
              <div *ngIf="lastActiveLabel()" class="last-active">Last active {{ lastActiveLabel() }}</div>
            </section>

            <!-- Safety Actions -->
            <section class="content-card safety-card">
              <button class="safety-btn" (click)="onReport()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Report User
              </button>
            </section>
          </div>
        </ng-container>
      </ng-container>

      <!-- Loading State -->
      <ng-template #loadingState>
        <div class="mt-20 flex flex-col items-center gap-3 text-slate-500">
          <span class="loader"></span>
          <p class="text-sm font-medium">Loading profile…</p>
        </div>
      </ng-template>

      <!-- Not Found State -->
      <ng-template #notFound>
        <div class="error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#cbd5e1" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3 class="error-title">Profile Not Found</h3>
          <p class="error-message">This profile is not available right now.</p>
          <button class="btn-primary" (click)="goBack()">Go Back</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    :host { display: block; }
    .gradient-border {
      background: var(--brand-gradient);
      border-radius: 9999px;
      padding: 3px;
      display: inline-flex;
    }
    .gradient-border img {
      border-radius: 9999px;
      display: block;
    }
    .trust-ring {
      --progress: 0;
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 9999px;
      background: conic-gradient(var(--brand-azure) calc(var(--progress) * 3.6deg), #E8F4FF 0deg);
      display: grid;
      place-items: center;
    }
    .trust-ring__inner {
      width: 52px;
      height: 52px;
      border-radius: 9999px;
      background: #fff;
      display: grid;
      place-items: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: #1f2937;
    }
    .verify-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border-radius: 9999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid #d1d5db;
      color: #4b5563;
      background: #f8fafc;
    }
    .verify-pill--active {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #047857;
    }
    .review-tab {
      border-bottom: 2px solid transparent;
      padding: 0.75rem 0;
      font-weight: 600;
      font-size: 0.875rem;
      color: #475569;
      white-space: nowrap;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    .review-tab--active {
      color: #1f2937;
      border-color: var(--brand-azure);
    }
    .loader {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      border: 3px solid #E8F4FF;
      border-top-color: var(--brand-azure);
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
})
export class UserProfilePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(UserProfileService);
  private destroyRef = inject(DestroyRef);

  private detailState = signal<PublicUserDetail | null>(null);
  private roomsState = signal<ListingCardVM[]>([]);
  private loadingState = signal(true);
  private roomsLoadingState = signal(true);
  private loadErrorState = signal(false);
  private activeReviewTab = signal<string>('reviews-about');

  detail = this.detailState.asReadonly();
  loading = this.loadingState.asReadonly();
  loadError = this.loadErrorState.asReadonly();
  rooms = this.roomsState.asReadonly();
  roomsLoading = this.roomsLoadingState.asReadonly();
  selectedReviewTab = this.activeReviewTab.asReadonly();

  reviewTabs: ReviewTab[] = [
    { key: 'reviews-about', label: 'Reviews about this user' },
    { key: 'reviews-roommate', label: 'Roommate reviews' },
    { key: 'reviews-ride', label: 'Ride partner reviews' },
    { key: 'reviews-marketplace', label: 'Marketplace reviews' },
    { key: 'reviews-given', label: 'Reviews given by this user' },
  ];

  trustScore = computed(() => this.detailState()?.trustScore ?? 0);
  verificationBadges = computed<VerificationBadge[]>(() => {
    const badges = this.detailState()?.badges;
    return [
      { label: 'Email Verified', active: !!badges?.email },
      { label: 'Phone Verified', active: !!badges?.phone },
      { label: 'University Verified', active: !!badges?.university },
      { label: 'Photo Verified', active: !!badges?.photo },
    ];
  });

  verificationChecklist = computed<VerificationChecklistItem[]>(() => {
    const badges = this.detailState()?.badges;
    return [
      { label: 'Email Verified', verified: !!badges?.email },
      { label: 'Phone Verified', verified: !!badges?.phone },
      { label: 'University Email Verified', verified: !!badges?.university },
      { label: 'Photo Verified', verified: !!badges?.photo },
      { label: 'Government ID Verified', verified: false, comingSoon: true },
    ];
  });

  interestTags = computed(() => this.detailState()?.interests ?? []);
  roomsPreview = computed(() => this.roomsState().slice(0, 3));
  roomsFirst = computed(() => this.roomsState()[0] || null);
  roomsCount = computed(() => this.roomsState().length);
  connectionsCount = computed(() => this.detailState()?.connectionsCount ?? 0);

  connectionsPreview = computed<ConnectionPreview[]>(() => {
    const count = this.connectionsCount();
    if (count <= 0) return [];
    const baseInitial = (this.detailState()?.name || 'Friend').charAt(0).toUpperCase() || 'S';
    const placeholders: ConnectionPreview[] = [];
    for (let i = 0; i < Math.min(3, count); i += 1) {
      const code = ((baseInitial.charCodeAt(0) - 65 + i) % 26) + 65;
      placeholders.push({ initial: String.fromCharCode(code) });
    }
    return placeholders;
  });

  preferenceItems = computed<PreferenceItem[]>(() => {
    const prefs = this.detailState()?.preferences as RoommatePreferences | undefined;
    if (!prefs) return [];
    const items: PreferenceItem[] = [];
    const add = (label: string, value: string | undefined, icon: string) => {
      if (!value) return;
      items.push({ label, value, icon });
    };
    add('Wake-up time', prefs.wakeSchedule, '🌅');
    add('Cleanliness level', prefs.cleanliness, '🧼');
    add('Noise tolerance', prefs.noiseTolerance, '🔉');
    add('Pets', prefs.pets, '🐾');
    add('Overnight guests allowed', prefs.overnightGuests, '🌙');
    add('Cooking habits', prefs.cookingHabits, '🍳');
    if (prefs.budgetMin !== undefined || prefs.budgetMax !== undefined) {
      const min = prefs.budgetMin !== undefined ? this.formatPrice(prefs.budgetMin) : undefined;
      const max = prefs.budgetMax !== undefined ? this.formatPrice(prefs.budgetMax) : undefined;
      const label = min && max ? `${min} – ${max}` : min || max;
      if (label) add('Budget preference', label, '💸');
    }
    add('Preferred roommate gender', prefs.preferredRoommateGender, '🧑');
    if (prefs.moveInDate) {
      const formatted = this.formatExactDate(prefs.moveInDate);
      add('Move-in date', formatted, '📅');
    }
    return items;
  });

  travelTimeline = computed<TimelineItem[]>(() => {
    const history: LocationHistoryItem[] = this.detailState()?.travelHistory ?? [];
    const items: TimelineItem[] = [];
    for (const entry of history) {
      const titleParts = [entry.city, entry.state]
        .filter((part): part is string => !!part && part.trim().length > 0);
      const title = titleParts.join(', ') || entry.label || undefined;
      if (!title) continue;
      const subtitle = entry.university || undefined;
      const range = this.formatRange(entry.startDate, entry.endDate);
      items.push({ title, subtitle, range });
    }
    return items;
  });

  joinedLabel = computed(() => {
    const iso = this.detailState()?.joinedAt;
    if (!iso) return undefined;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return undefined;
    return `Joined Setly on ${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
  });

  lastActiveLabel = computed(() => this.formatRelativeTime(this.detailState()?.lastActiveAt));

  shortName = computed(() => {
    const name = this.detailState()?.name || 'this user';
    const parts = name.trim().split(/\s+/);
    return parts[0] || name;
  });

  isOnline = computed(() => false); // TODO: Integrate with presence service
  isVerified = computed(() => {
    const badges = this.detailState()?.badges;
    return !!(badges?.email && badges?.university);
  });

  basicInfo = computed(() => {
    const detail = this.detailState();
    const rows = [
      { label: 'Name', value: detail?.name, placeholder: 'Not shared' },
      { label: 'University', value: detail?.universityId || detail?.organization, placeholder: 'Not shared' },
      { label: 'Major', value: '', placeholder: 'Not shared' },
      { label: 'Graduation year', value: '', placeholder: 'Not shared' },
      { label: 'Age', value: '', placeholder: 'Not shared' },
      { label: 'Gender', value: '', placeholder: 'Not shared' },
    ];
    return rows;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (!id) {
      this.loadErrorState.set(true);
      this.loadingState.set(false);
      return;
    }

    this.profileService
      .getPublicProfile(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          if (!detail) {
            this.loadErrorState.set(true);
          } else {
            this.detailState.set(detail);
          }
          this.loadingState.set(false);
        },
        error: () => {
          this.loadErrorState.set(true);
          this.loadingState.set(false);
        }
      });

    this.profileService
      .getRoomsByOwner(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rooms) => {
          this.roomsState.set(rooms);
          this.roomsLoadingState.set(false);
        },
        error: () => {
          this.roomsState.set([]);
          this.roomsLoadingState.set(false);
        }
      });
  }

  selectReviewTab(key: string): void {
    this.activeReviewTab.set(key);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.router.navigateByUrl('/connect/people').catch(() => {});
    } else {
      this.router.navigate(['/connect/people']);
    }
  }

  onConnect(): void {
    // Integration placeholder
  }

  onMessage(): void {
    const profile = this.detailState();
    if (!profile) return;
    this.router.navigate(['/messages'], {
      queryParams: { with: profile.id, name: profile.name, avatar: profile.avatarUrl || undefined }
    });
  }

  onFollow(): void {
    // Integration placeholder
  }

  onReport(): void {
    // Integration placeholder
  }

  viewConnections(): void {
    this.router.navigate(['/connect/people']);
  }

  formatCityState(city?: string, state?: string): string {
    return [city, state]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(', ');
  }

  formatPrice(value: number | undefined): string {
    if (value === undefined || Number.isNaN(value)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatExactDate(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  private formatRange(start?: string, end?: string): string | undefined {
    const startLabel = this.formatMonthYear(start);
    const endLabel = this.formatMonthYear(end);
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
    if (startLabel) return `Since ${startLabel}`;
    if (endLabel) return `Until ${endLabel}`;
    return undefined;
  }

  private formatMonthYear(value?: string): string | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }

  private formatRelativeTime(value?: string): string | undefined {
    if (!value) return undefined;
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return undefined;
    const diff = target.getTime() - Date.now();
    const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
      { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
      { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
      { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
      { unit: 'day', ms: 1000 * 60 * 60 * 24 },
      { unit: 'hour', ms: 1000 * 60 * 60 },
      { unit: 'minute', ms: 1000 * 60 },
      { unit: 'second', ms: 1000 }
    ];
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    for (const { unit, ms } of units) {
      const valueMs = diff / ms;
      if (Math.abs(valueMs) >= 1 || unit === 'second') {
        return rtf.format(Math.round(valueMs), unit);
      }
    }
    return undefined;
  }
}
