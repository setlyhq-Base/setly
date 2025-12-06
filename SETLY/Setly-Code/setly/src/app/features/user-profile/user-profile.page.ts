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
  template: `
    <div class="min-h-screen bg-slate-50">
      <div class="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <button
          type="button"
          class="mb-6 flex items-center gap-1 text-sm font-medium text-brand-azure hover:text-brand-midnight"
          (click)="goBack()"
        >
          ← Back to People
        </button>

        <ng-container *ngIf="!loading(); else loadingState">
          <ng-container *ngIf="!loadError(); else notFound">
            <ng-container *ngIf="detail(); else notFound">
              <section class="bg-white rounded-[28px] shadow-lg border border-slate-200 p-6 md:p-8">
                <div class="flex flex-col md:flex-row md:items-start gap-6">
                  <div class="gradient-border w-28 h-28 shrink-0">
                    <img
                      [src]="detail()?.avatarUrl || '/assets/avatar-placeholder.svg'"
                      alt="Profile photo"
                      class="w-full h-full object-cover border-4 border-white"
                    />
                  </div>
                  <div class="flex-1 min-w-0 space-y-3">
                    <div class="flex flex-wrap items-center gap-3">
                      <h1 class="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                        {{ detail()?.name }}
                      </h1>
                      <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border" style="background:#E8F4FF;color:#0F5FFF;border-color:#BBD9FF">
                        {{ detail()?.role }}
                      </span>
                    </div>
                    <div class="text-sm text-slate-600 flex flex-wrap items-center gap-2">
                      <span *ngIf="detail()?.organization" class="font-medium text-slate-700">
                        {{ detail()?.organization }}
                      </span>
                      <span *ngIf="detail()?.location">
                        • {{ detail()?.location }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <div class="flex items-center gap-3 pr-5 border-r border-slate-200">
                        <span class="trust-ring" [style.--progress]="trustScore()">
                          <span class="trust-ring__inner">{{ trustScore() }}%</span>
                        </span>
                        <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">Trust score</span>
                      </div>
                      <span
                        *ngFor="let badge of verificationBadges()"
                        class="verify-pill"
                        [class.verify-pill--active]="badge.active"
                      >
                        {{ badge.label }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-slate-500 font-semibold">
                      <span *ngIf="joinedLabel()">{{ joinedLabel() }}</span>
                      <span *ngIf="lastActiveLabel()">Last active {{ lastActiveLabel() }}</span>
                    </div>
                  </div>
                  <div class="flex flex-wrap md:flex-col gap-2 md:gap-3 w-full md:w-auto">
                    <button
                      type="button"
                      class="rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition md:w-[180px]"
                      style="background: var(--brand-gradient)"
                      (click)="onConnect()"
                    >
                      Connect
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-4 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-300 transition md:w-[180px]"
                      (click)="onMessage()"
                    >
                      Message
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-4 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-300 transition md:w-[180px]"
                      (click)="onFollow()"
                    >
                      Follow
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-4 py-2.5 text-sm font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition md:w-[180px]"
                      (click)="onReport()"
                    >
                      Report
                    </button>
                  </div>
                </div>
              </section>

              <div class="mt-8 space-y-10">
                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-3">
                    <h2 class="text-xl font-semibold text-slate-900">About</h2>
                  </header>
                  <p class="text-sm text-slate-700 leading-6" *ngIf="detail()?.bio; else aboutEmpty">
                    {{ detail()?.bio }}
                  </p>
                  <ng-template #aboutEmpty>
                    <p class="text-sm text-slate-400">Short bio coming soon.</p>
                  </ng-template>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Interests & Lifestyle</h2>
                  </header>
                  <div *ngIf="interestTags().length; else interestsEmpty" class="flex flex-wrap gap-2">
                    <span
                      *ngFor="let tag of interestTags()"
                      class="px-3 py-1 rounded-full text-xs font-semibold border"
                      style="color:#0F5FFF;background:#E8F4FF;border-color:#BBD9FF"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <ng-template #interestsEmpty>
                    <p class="text-sm text-slate-400">No interests added yet.</p>
                  </ng-template>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Activity Overview</h2>
                  </header>
                  <div class="grid gap-4 md:grid-cols-3">
                    <div class="rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
                      <div>
                        <h3 class="text-sm font-semibold text-slate-800">Rooms by {{ shortName() }}</h3>
                      </div>
                      <ng-container *ngIf="!roomsLoading(); else roomsBusy">
                        <ng-container *ngIf="roomsFirst() as first; else noRooms">
                          <a
                            [routerLink]="['/listing', first.id]"
                            class="flex gap-3 items-center group"
                          >
                            <img
                              *ngIf="first.photo"
                              [src]="first.photo"
                              alt="Room preview"
                              class="w-20 h-16 rounded-xl object-cover border border-slate-200"
                            />
                            <div class="min-w-0">
                              <p class="text-sm font-semibold text-slate-900 group-hover:text-brand-azure transition truncate">
                                {{ first.title }}
                              </p>
                              <p class="text-xs text-slate-500 truncate">
                                <span *ngIf="first.price">{{ formatPrice(first.price) }}</span>
                                <span *ngIf="first.city || first.state">
                                  • {{ formatCityState(first.city, first.state) }}
                                </span>
                              </p>
                            </div>
                          </a>
                          <div class="text-xs text-slate-500">
                            {{ roomsCount() }} active {{ roomsCount() === 1 ? 'listing' : 'listings' }}
                          </div>
                        </ng-container>
                      </ng-container>
                      <ng-template #roomsBusy>
                        <div class="text-sm text-slate-400">Loading rooms…</div>
                      </ng-template>
                      <ng-template #noRooms>
                        <div class="text-sm text-slate-400">No active rooms found.</div>
                      </ng-template>
                    </div>
                    <div class="rounded-2xl border border-slate-200 p-4">
                      <h3 class="text-sm font-semibold text-slate-800 mb-2">Rides by {{ shortName() }}</h3>
                      <p class="text-sm text-slate-400">No active rides found.</p>
                    </div>
                    <div class="rounded-2xl border border-slate-200 p-4">
                      <h3 class="text-sm font-semibold text-slate-800 mb-2">Marketplace by {{ shortName() }}</h3>
                      <p class="text-sm text-slate-400">No items listed.</p>
                    </div>
                  </div>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Roommate Preferences</h2>
                  </header>
                  <div *ngIf="preferenceItems().length; else preferencesEmpty" class="grid gap-4 sm:grid-cols-2">
                    <div
                      *ngFor="let pref of preferenceItems()"
                      class="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 hover:border-[#BBD9FF] transition"
                    >
                      <div class="text-2xl">{{ pref.icon }}</div>
                      <div>
                        <p class="text-sm font-semibold text-slate-800">{{ pref.label }}</p>
                        <p class="text-sm text-slate-600">{{ pref.value }}</p>
                      </div>
                    </div>
                  </div>
                  <ng-template #preferencesEmpty>
                    <p class="text-sm text-slate-400">Roommate preferences not added yet.</p>
                  </ng-template>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Verification & Safety</h2>
                  </header>
                  <ul class="space-y-3">
                    <li *ngFor="let item of verificationChecklist()" class="flex items-center gap-3">
                      <span
                        class="grid place-items-center w-7 h-7 rounded-full border"
                        [class.bg-emerald-500]="item.verified"
                        [class.border-emerald-500]="item.verified"
                        [class.text-white]="item.verified"
                        [class.border-slate-200]="!item.verified"
                        [class.text-slate-500]="!item.verified"
                      >
                        {{ item.verified ? '✓' : '•' }}
                      </span>
                      <div>
                        <p class="text-sm font-semibold text-slate-800">{{ item.label }}</p>
                        <p *ngIf="item.comingSoon" class="text-xs text-slate-400">Coming soon</p>
                      </div>
                    </li>
                  </ul>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Connections</h2>
                    <span class="text-sm text-slate-500">{{ connectionsCount() }} connections</span>
                  </header>
                  <div *ngIf="connectionsPreview().length; else noConnections" class="flex items-center gap-3">
                    <div class="flex -space-x-3">
                      <span
                        *ngFor="let conn of connectionsPreview(); let i = index"
                        class="w-10 h-10 grid place-items-center rounded-full border-2 border-white text-white text-sm font-semibold shadow"
                        style="background: var(--brand-gradient)"
                      >
                        {{ conn.initial }}
                      </span>
                    </div>
                    <span class="text-sm text-slate-500">Mutual connections</span>
                  </div>
                  <ng-template #noConnections>
                    <p class="text-sm text-slate-400">No mutual connections yet.</p>
                  </ng-template>
                  <button
                    type="button"
                    class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-azure hover:text-brand-midnight"
                    (click)="viewConnections()"
                  >
                    See all connections →
                  </button>
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

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Reviews</h2>
                  </header>
                  <nav class="flex gap-4 overflow-x-auto border-b border-slate-200">
                    <button
                      *ngFor="let tab of reviewTabs"
                      type="button"
                      class="review-tab"
                      [class.review-tab--active]="selectedReviewTab() === tab.key"
                      (click)="selectReviewTab(tab.key)"
                    >
                      {{ tab.label }}
                    </button>
                  </nav>
                  <div class="py-6 text-sm text-slate-400">No reviews yet.</div>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Listings Preview</h2>
                    <span class="text-sm text-slate-500" *ngIf="roomsCount() > 0">{{ roomsCount() }} rooms</span>
                  </header>
                  <ng-container *ngIf="roomsPreview().length; else noListings">
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <a
                        *ngFor="let room of roomsPreview()"
                        [routerLink]="['/listing', room.id]"
                        class="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow transition"
                      >
                        <img
                          *ngIf="room.photo"
                          [src]="room.photo"
                          alt="Listing preview"
                          class="h-40 w-full object-cover"
                        />
                        <div class="p-4 space-y-2">
                          <h3 class="text-sm font-semibold text-slate-900 group-hover:text-brand-azure transition truncate">
                            {{ room.title }}
                          </h3>
                          <p class="text-xs text-slate-500 truncate">
                            <span *ngIf="room.price">{{ formatPrice(room.price) }}</span>
                            <span *ngIf="room.city || room.state">
                              • {{ formatCityState(room.city, room.state) }}
                            </span>
                          </p>
                          <span class="text-xs font-semibold uppercase tracking-wide text-brand-azure">View listing</span>
                        </div>
                      </a>
                    </div>
                  </ng-container>
                  <ng-template #noListings>
                    <p class="text-sm text-slate-400">No listings to show yet.</p>
                  </ng-template>
                </section>

                <section class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <header class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-900">Basic Info</h2>
                  </header>
                  <dl class="grid gap-3 text-sm text-slate-700">
                    <div *ngFor="let row of basicInfo()" class="flex items-start justify-between gap-6">
                      <dt class="font-semibold text-slate-800">{{ row.label }}</dt>
                      <dd class="text-right" [class.text-slate-400]="row.placeholder">
                        {{ row.value || row.placeholder }}
                      </dd>
                    </div>
                  </dl>
                  <p class="text-xs text-slate-400 mt-4">Sensitive contact details are hidden.</p>
                </section>
              </div>
            </ng-container>
          </ng-container>
        </ng-container>

        <ng-template #loadingState>
          <div class="mt-20 flex flex-col items-center gap-3 text-slate-500">
            <span class="loader"></span>
            <p class="text-sm font-medium">Loading profile…</p>
          </div>
        </ng-template>

        <ng-template #notFound>
          <div class="mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center text-slate-600">
            <p class="text-sm">This profile is not available right now.</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold btn-brand"
              (click)="goBack()"
            >
              Return to directory
            </button>
          </div>
        </ng-template>
      </div>
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
