import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileHeaderCardComponent } from './components/profile-header-card.component';
import { AboutMeComponent } from './components/about-me.component';
import { ReviewsListComponent } from './components/reviews-list.component';
import { InterestsGridComponent } from './components/interests-grid.component';
import { VerificationStatusComponent } from './components/verification-status.component';
import { ConnectionsListComponent } from './components/connections-list.component';
import { ProfileEditFormComponent } from './components/profile-edit-form.component';
import { MyListingsComponent, ListingCardItem } from './components/my-listings.component';
import {
  UserProfile,
  TravelHistoryEntry,
  Review,
  InterestChip,
  Connection,
  VerificationState,
} from '../../core/models/profile.model';
import { UserStore } from '../../core/state/user.store';
import { ProfileStore } from '../../core/state/profile.store';
import { ActivatedRoute } from '@angular/router';
import { InViewDirective } from '../../shared/directives/in-view.directive';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { ToastService } from '../../core/services/toast.service';

// Profile section types
export type ProfileSection = 'overview' | 'my-rooms' | 'past-rides' | 'connections' | 'verification' | 'preferences' | 'settings' | 'data';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileHeaderCardComponent, MyListingsComponent, AboutMeComponent, ReviewsListComponent, InterestsGridComponent, VerificationStatusComponent, ConnectionsListComponent, ProfileEditFormComponent],
  template: `
    <main class="profile-page-modern">
      <div class="profile-container">
        <!-- Instagram/LinkedIn-style header (NO white box) -->
        <app-profile-header-card [profile]="user()" [missingTips]="missingTips()" (edit)="openEdit()" [canEdit]="false">
          <div header-actions>
            <button class="btn-primary" (click)="openEdit()" *ngIf="!publicView()">Edit Profile</button>
            <button class="btn-secondary" (click)="togglePublicView()">{{ publicView() ? 'Exit Public View' : 'Public View' }}</button>
          </div>
        </app-profile-header-card>

        <!-- Explore-style pill tabs (sticky, centered, blue active) -->
        <div class="tabs-container">
          <div class="tabs-bar">
            <button 
              *ngFor="let nav of navSections" 
              type="button"
              class="tab-pill" 
              [class.active]="section() === nav.id"
              (click)="section.set(nav.id); scrollToContent()">
              {{ nav.label }}
              <span *ngIf="nav.id==='verification'" class="tab-badge">{{ verificationPercent() }}%</span>
            </button>
          </div>
        </div>

        <!-- Content sections -->
        <div class="content-wrapper">
          <!-- Section: Overview (Two-column layout like LinkedIn) -->
          <div *ngIf="section() === 'overview'" class="two-column-layout">
            <!-- Left Column: About, Profession, Languages, Interests -->
            <div class="left-column">
              <app-about-me *ngIf="isVisible('about')" [profile]="user()" (edit)="openEdit()"></app-about-me>

              <div class="profile-card">
                <div class="card-header-row">
                  <h3 class="card-title">Profession / Field of Study</h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <p class="empty-text" *ngIf="!user().profession">Not set</p>
                <p *ngIf="user().profession" class="content-text">{{ user().profession }}</p>
              </div>

              <div class="profile-card">
                <div class="card-header-row">
                  <h3 class="card-title">Languages</h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <p class="empty-text" *ngIf="!user().languages?.length">Not set</p>
                <div class="tags-wrap" *ngIf="user().languages?.length">
                  <span class="tag" *ngFor="let l of user().languages">{{ l }}</span>
                </div>
              </div>

              <div class="profile-card">
                <div class="card-header-row">
                  <h3 class="card-title">Interests</h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <app-interests-grid *ngIf="isVisible('interests')" [chips]="interestChips" [(selected)]="selectedInterests"></app-interests-grid>
              </div>
            </div>

            <!-- Right Column: Connections, Verification, Reviews -->
            <div class="right-column">
              <div class="profile-card" *ngIf="isVisible('connections')">
                <div class="card-header-row">
                  <h3 class="card-title">Connections</h3>
                  <a routerLink="/browse" class="link-btn">Find more</a>
                </div>
                <app-connections-list [connections]="connections"></app-connections-list>
              </div>

              <div class="profile-card" *ngIf="isVisible('verification')">
                <div class="card-header-row">
                  <h3 class="card-title">Verification</h3>
                </div>
                <div class="verification-progress">
                  <div class="progress-ring" [style.--progress]="verificationPercent()"></div>
                  <div class="verification-details">
                    <p class="progress-score">{{ verificationPercent() }}%</p>
                    <p class="progress-hint">Complete steps to build trust</p>
                    <ul class="verification-steps">
                      <li *ngFor="let step of verificationSteps" [class.verified]="step.done">
                        <span class="step-icon">{{ step.done ? '✓' : '○' }}</span>
                        {{ step.label }}
                        <button *ngIf="!step.done" class="verify-link" (click)="onVerify(step.key)">Verify</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <app-reviews-list *ngIf="isVisible('reviews')" [reviews]="reviews" [canWriteReview]="!publicView()" (write)="openReviewModal()"></app-reviews-list>
            </div>
          </div>

          <!-- Section: My Rooms (Use Explore card grid) -->
          <div *ngIf="section() === 'my-rooms'" class="section-content">
            <app-my-listings [items]="listings"></app-my-listings>
          </div>

          <!-- Section: Past Rides -->
          <div *ngIf="section() === 'past-rides'" class="section-content">
            <div class="empty-state-card">
              <p>No rides yet. Try <a routerLink="/ride" class="text-link">booking a ride</a>.</p>
            </div>
          </div>

          <!-- Section: Connections (dedicated) -->
          <div *ngIf="section() === 'connections'" class="section-content">
            <div class="profile-card">
              <h3 class="card-title">My Connections</h3>
              <app-connections-list [connections]="connections"></app-connections-list>
            </div>
          </div>

          <!-- Section: Verification (dedicated) -->
          <div *ngIf="section() === 'verification'" class="section-content">
            <app-verification-status [state]="user().verifications" (action)="onVerify($event)"></app-verification-status>
          </div>

          <!-- Section: Preferences -->
          <div *ngIf="section() === 'preferences'" class="section-content">
            <div class="profile-card">
              <h2 class="section-title">Edit Profile</h2>
              <p class="section-subtitle">Update how you appear across Setly</p>
              <app-profile-edit-form (saved)="onProfileSaved()" (dirtyChange)="onDirty($event)"></app-profile-edit-form>
            </div>
          </div>

          <!-- Section: Settings -->
          <div *ngIf="section() === 'settings'" class="section-content">
            <div class="profile-card">
              <h2 class="section-title">Settings</h2>
              <div class="settings-grid">
                <div>
                  <h3 class="settings-group-title">Account</h3>
                  <div class="settings-inputs">
                    <label class="input-group">
                      <span class="input-label">Email</span>
                      <input type="email" class="modern-input" placeholder="you@example.com" [(ngModel)]="settings.email" name="settingsEmail" />
                    </label>
                    <label class="input-group">
                      <span class="input-label">Phone</span>
                      <input type="tel" class="modern-input" placeholder="(555) 555-5555" [(ngModel)]="settings.phone" name="settingsPhone" />
                    </label>
                  </div>
                </div>
                <div>
                  <h3 class="settings-group-title">Notifications</h3>
                  <div class="settings-toggles">
                    <label class="toggle-row">
                      <span class="toggle-label">Room booking updates</span>
                      <input type="checkbox" class="toggle-input" [(ngModel)]="settings.notifyBooking" name="notifyBooking" />
                    </label>
                    <label class="toggle-row">
                      <span class="toggle-label">Product announcements</span>
                      <input type="checkbox" class="toggle-input" [(ngModel)]="settings.notifyProduct" name="notifyProduct" />
                    </label>
                  </div>
                </div>
              </div>
              <div class="settings-actions">
                <button class="btn-primary" (click)="saveSettings()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save Settings' }}</button>
              </div>
            </div>
          </div>

          <!-- Section: Your Data -->
          <div *ngIf="section() === 'data'" class="section-content">
            <div class="profile-card">
              <div class="card-header-row">
                <h2 class="section-title">Your Saved Data</h2>
                <div class="button-group">
                  <button class="btn-secondary" (click)="copyAll()">Copy JSON</button>
                  <button class="btn-secondary" (click)="refreshData()">Refresh</button>
                </div>
              </div>
              <p class="section-subtitle">This view shows the data currently stored in your profile stores.</p>
              <div class="data-grid">
                <div>
                  <h3 class="data-label">ProfileSpec (ProfileStore)</h3>
                  <pre class="data-code">{{ profileJson() }}</pre>
                </div>
                <div>
                  <h3 class="data-label">User (UserStore)</h3>
                  <pre class="data-code">{{ userJson() }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div *ngIf="showEdit()" class="modal-overlay" (click)="closeEdit()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Edit Profile</h3>
            <button class="modal-close" (click)="closeEdit()">✕</button>
          </div>
          <app-profile-edit-form (saved)="onProfileSaved(); closeEdit()" (dirtyChange)="onDirty($event)"></app-profile-edit-form>
        </div>
      </div>

      <!-- Review Modal -->
      <div *ngIf="showReview()" class="modal-overlay" (click)="closeReview()">
        <div class="modal-panel modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Write a Review</h3>
            <button class="modal-close" (click)="closeReview()">✕</button>
          </div>
          <form class="review-form" (submit)="submitReview($event)">
            <div class="form-group">
              <label class="form-label">Rating</label>
              <select class="form-select" [(ngModel)]="newReview.rating" name="rating">
                <option [ngValue]="5">5 - Excellent</option>
                <option [ngValue]="4">4 - Good</option>
                <option [ngValue]="3">3 - Okay</option>
                <option [ngValue]="2">2 - Poor</option>
                <option [ngValue]="1">1 - Terrible</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Comment</label>
              <textarea class="form-textarea" rows="4" [(ngModel)]="newReview.comment" name="comment" placeholder="Share your experience..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeReview()">Cancel</button>
              <button type="submit" class="btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <footer class="profile-footer">
        <nav class="footer-links">
          <a href="#">About</a>
          <a href="#">Help</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Feedback</a>
        </nav>
        <div class="footer-copy">© 2025 Setly</div>
      </footer>
    </main>
  `,
  styles: [`
    /* Modern Profile Page Layout - Instagram/LinkedIn style */
    .profile-page-modern {
      @apply min-h-screen bg-gray-50;
    }
    
    .profile-container {
      @apply max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
    }

    /* Sticky tabs bar */
    .tabs-container {
      @apply sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8;
    }

    .tabs-bar {
      @apply flex gap-2 overflow-x-auto py-4;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
    }

    .tabs-bar::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .tab-pill {
      @apply flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all;
      @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
    }

    .tab-pill.active {
      @apply bg-brand-azure text-white shadow-md;
    }

    /* Two-column layout for Overview section */
    .two-column-layout {
      @apply grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8;
    }

    .left-column, .right-column {
      @apply flex flex-col gap-6;
    }

    /* Profile cards matching Explore style */
    .profile-card {
      @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: box-shadow .25s ease;
    }

    .profile-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .profile-card-header {
      @apply flex items-center justify-between mb-4;
    }

    .profile-card-title {
      @apply text-lg font-semibold text-gray-900;
    }

    .profile-card-action {
      @apply text-sm font-medium text-brand-azure hover:text-brand-midnight cursor-pointer;
    }

    /* Edit and Review modals */
    .modal-overlay {
      @apply fixed inset-0 z-50 flex items-center justify-center;
    }

    .modal-backdrop {
      @apply absolute inset-0 bg-black/40;
    }

    .modal-content {
      @apply relative bg-white w-[92vw] max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-auto p-6;
      animation: fadeIn .35s ease;
    }

    .modal-header {
      @apply flex items-center justify-between mb-4;
    }

    .modal-title {
      @apply text-lg font-semibold;
    }

    .modal-close {
      @apply text-gray-500 hover:text-gray-700 text-xl leading-none;
    }

    /* Footer */
    .profile-footer {
      @apply mt-16 py-8 border-t border-gray-200;
    }

    .footer-links {
      @apply flex flex-wrap gap-4 justify-center mb-2 text-sm;
    }

    .footer-links a {
      @apply text-gray-600 hover:text-gray-900;
    }

    .footer-copy {
      @apply text-center text-sm text-gray-500;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn .35s ease;
    }

    /* Premium elements from old design */
    .card {
      @apply profile-card;
    }

    /* Toggle switch */
    .toggle {
      @apply flex items-center gap-3;
    }

    .toggle input {
      @apply sr-only;
    }

    .toggle .track {
      @apply relative w-11 h-6 bg-gray-200 rounded-full transition-colors;
    }

    .toggle .thumb {
      @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform;
    }

    .toggle input:checked + .track {
      @apply bg-brand-azure;
    }

    .toggle input:checked + .track .thumb {
      @apply translate-x-5;
    }

    .toggle .lbl {
      @apply text-sm text-gray-700;
    }

    /* Danger button */
    .danger-btn {
      @apply px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-shadow;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .profile-container {
        @apply px-3 py-4;
      }
      
      .tabs-container {
        @apply -mx-3 px-3;
      }
      
      .profile-card {
        @apply p-4;
      }
    }
  `]
})
export class ProfilePage {
  section = signal<ProfileSection>('overview');
  private editDirty = false;
  private userStore = inject(UserStore);
  private profileStore = inject(ProfileStore);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  showEdit = signal(false);
  showReview = signal(false);

  // Derived profile from authenticated user; falls back to sensible defaults
  user = computed<UserProfile>(() => {
    const basic = this.userStore.user();
    const prof = this.profileStore.profile();
    const ver = this.profileStore.verifications();
  const displayName = prof?.displayName || basic?.name || basic?.id || 'New User';
    const parts = displayName.trim().split(/\s+/);
  const firstName = prof?.firstName || parts[0] || prof?.displayName || 'New';
    const lastName = prof?.lastName || parts.slice(1).join(' ') || '';
    return {
      id: basic?.id || prof?.userId || 'unknown',
      firstName,
      lastName,
  avatarUrl: prof?.avatarUrl || basic?.photoUrl || '/assets/avatar-placeholder.svg',
      coverImageUrl: basic?.coverImageUrl,
      headline: prof?.headline || basic?.headline,
      location: prof?.location,
      about: prof?.about,
      profession: prof?.program || prof?.title,
      languages: prof?.languages || [],
      interests: prof?.interests || [],
      socials: prof?.socials || basic?.socials || {},
      stats: { roomsPosted: 0, ridesShared: 0, reviewsCount: 0, connectionsCount: 0 },
      verifications: {
        identity: ver?.idVerified || false,
        university: ver?.eduVerified || basic?.domainVerified || false,
        phone: ver?.phoneVerified || !!basic?.phone || false,
        email: ver?.emailVerified || !!basic?.emailVerified || false,
      },
      completionPercent: prof?.completion,
    };
  });

  private _publicView = signal(false);
  publicView = computed(() => this._publicView());

  travelHistory: TravelHistoryEntry[] = [
    { id: 'th1', city: 'Boston', state: 'MA', university: 'Northeastern Univ.', startDate: '2025-01-01', endDate: '2025-04-01', coverImage: '/assets/boston.jpg' },
  ];

  reviews: Review[] = [
    { id: 'r1', fromUserId: 'Alice', toUserId: 'u1', city: 'Boston', createdAt: '2025-05-01', rating: 5, comment: 'Great guest, very clean and communicative.', type: 'received' },
    { id: 'r2', fromUserId: 'u1', toUserId: 'Bob', city: 'Cambridge', createdAt: '2025-06-10', rating: 5, comment: 'Pleasant host with a nice room.', type: 'given' },
    { id: 'r3', fromUserId: 'Eve', toUserId: 'u1', city: 'Boston', createdAt: '2025-07-15', comment: 'Pending your review...', type: 'pending' },
  ];

  interestChips: InterestChip[] = [
    { key: 'gaming', label: 'Gaming', icon: '🎮' },
    { key: 'coffee', label: 'Coffee Spots', icon: '☕' },
    { key: 'adventure', label: 'Adventure', icon: '🧗' },
    { key: 'interior', label: 'Interior Design', icon: '🏡' },
    { key: 'photo', label: 'Photography', icon: '📸' },
    { key: 'music', label: 'Live Music', icon: '🎵' },
    { key: 'wellness', label: 'Wellness', icon: '🧘' },
  ];

  selectedInterests: string[] = ['gaming', 'coffee'];

  connections: Connection[] = [
    { id: 'c1', name: 'Priya', mutualUniversities: 1, sharedTrips: 2 },
    { id: 'c2', name: 'Marco', mutualUniversities: 0, sharedTrips: 1 },
  ];

  listings: ListingCardItem[] = [
    { id: 'l1', type: 'room', title: 'Sunny Room near Northeastern', city: 'Boston', state: 'MA', coverImage: '/assets/room-1.jpg', description: 'Cozy furnished room with fast Wi‑Fi.' },
    { id: 'l2', type: 'ride', title: 'Weekend Ride to NYC', city: 'Boston', state: 'MA', coverImage: '/assets/ride-1.jpg', description: 'Leaving Friday evening, 2 seats.' },
  ];

  // Premium nav config
  navSections: { id: ProfileSection; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'my-rooms', label: 'My Rooms', icon: '🏠' },
    { id: 'past-rides', label: 'Past Rides', icon: '🚗' },
    { id: 'connections', label: 'Connections', icon: '🌍' },
    { id: 'verification', label: 'Verification', icon: '✅' },
    { id: 'preferences', label: 'Preferences', icon: '🛠️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'data', label: 'Your Data', icon: '📦' }
  ];

  metrics = [
    { label: 'Rooms', value: 0 },
    { label: 'Rides', value: 0 },
    { label: 'Reviews', value: this.reviews.filter(r=>r.type==='received').length },
    { label: 'Connections', value: this.connections.length },
  ];

  activityFeed: { id: string; text: string; at: string; icon: string }[] = [];
  shareCooldown = false;

  missingTips = () => {
    const u = this.user();
    const tips: string[] = [];
    if (!u.headline) tips.push('Add a headline');
    if (!u.location) tips.push('Add your location');
    if (!u.about) tips.push('Write your bio');
    if (!u.avatarUrl) tips.push('Add a profile photo');
    const v = u.verifications || ({} as any);
    if (!v.identity) tips.push('Verify identity');
    if (!v.university) tips.push('Verify university');
    if (!v.phone) tips.push('Verify phone');
    if (!v.email) tips.push('Verify email');
    return tips;
  }

  interfaceVerificationSteps!: never; // placeholder to avoid top-level interface definitions in patch
  verificationSteps: { key: keyof VerificationState; label: string; done: boolean }[] = [];

  private updateVerificationSteps() {
    const v = this.user().verifications;
    this.verificationSteps = [
      { key: 'identity', label: 'Identity Verification', done: v.identity },
      { key: 'university', label: 'University Email (.edu)', done: v.university },
      { key: 'phone', label: 'Phone Verification', done: v.phone },
      { key: 'email', label: 'Email Verification', done: v.email },
    ];
  }

  verificationPercent = () => {
    const done = this.verificationSteps.filter(s=>s.done).length;
    return this.verificationSteps.length ? Math.round((done/this.verificationSteps.length)*100) : 0;
  };

  // Pre-generate small array for confetti spans
  confettiSpan = Array.from({ length: 5 });

  scrollToContent() {
    const el = document.getElementById('profile-content-root');
    if (el) {
      setTimeout(()=> el.scrollIntoView({ behavior: 'smooth', block: 'start'}), 10);
    }
  }

  // Settings state (local persistence for now; future: sync to backend user preferences)
  settings = { email: '', phone: '', notifyBooking: true, notifyProduct: false };
  saving = false;
  savedFlash = false;

  ngOnInit() {
    // Rely on AuthSyncService to hydrate stores; avoid unauthenticated /api calls on first paint
    // If needed later, we can trigger a background refresh after auth sync succeeds.

    // Hydrate settings from localStorage (prefill with user basic info if empty)
    try {
      const raw = localStorage.getItem('setly.settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = { ...this.settings, ...parsed };
      } else {
        const basic = this.userStore.user();
        if ((basic as any)?.email) (this.settings as any).email = (basic as any).email;
        if ((basic as any)?.phone) (this.settings as any).phone = (basic as any).phone;
      }
    } catch (e) {
      console.warn('Failed to parse settings from storage', e);
    }
    this.updateVerificationSteps();
    // initialize public view from route if needed
    const seg = this.route.snapshot.url[0]?.path;
    if (seg === 'u') this._publicView.set(true);
  }

  onVerify(key: keyof VerificationState) {
    // TODO: Wire to real verification flows
    console.log('Verify action:', key);
  }

  onProfileSaved() {
    // Simple toast substitute for now
    console.log('Profile updated');
    this.editDirty = false;
    this.updateVerificationSteps();
  }

  onDirty(d: boolean) {
    this.editDirty = d;
  }

  canDeactivate(): boolean {
    return !this.editDirty;
  }

  isVisible(key: 'about'|'travelHistory'|'reviews'|'interests'|'connections'|'verification'): boolean {
    const vis = this.userStore.user()?.profileVisibility;
    if (!vis) return true;
    return (vis as any)[key] !== false;
  }

  openEdit() { if (!this.publicView()) this.showEdit.set(true); }
  closeEdit() { this.showEdit.set(false); }

  togglePublicView() {
    this._publicView.update(v => !v);
    this.toast.info(this.publicView() ? 'Public view enabled' : 'Returned to owner view');
  }

  shareProfile() {
    if (this.shareCooldown) return;
    const url = window.location.origin + '/u/' + this.user().id;
    try {
      navigator.clipboard.writeText(url);
      this.toast.success('Profile link copied');
      this.shareCooldown = true;
      setTimeout(()=> this.shareCooldown = false, 1800);
    } catch (e) {
      console.warn('Clipboard failed', e);
      this.toast.error('Could not copy link');
    }
  }

  seedActivity() {
    this.activityFeed = [
      { id: 'a1', text: 'You updated your headline', at: new Date().toISOString(), icon: '📝' },
      { id: 'a2', text: 'You added your first room listing', at: new Date(Date.now()-3600_000).toISOString(), icon: '🏠' },
      { id: 'a3', text: 'You connected with Priya', at: new Date(Date.now()-7200_000).toISOString(), icon: '🤝' },
    ];
  }

  refreshActivity() {
    this.toast.info('Activity refreshed');
  }

  openReviewModal() { this.showReview.set(true); }
  closeReview() { this.showReview.set(false); }

  newReview: { rating: number; comment: string } = { rating: 5, comment: '' };
  submitReview(e: Event) {
    e.preventDefault();
    // TODO: wire to backend; for now push into list as 'given'
    const now = new Date().toISOString();
    this.reviews = [
      { id: 'new', fromUserId: this.user().firstName, toUserId: 'target', createdAt: now, rating: this.newReview.rating, comment: this.newReview.comment, type: 'given' },
      ...this.reviews
    ];
    this.closeReview();
    this.newReview = { rating: 5, comment: '' };
  }

  saveSettings() {
    this.saving = true;
    // Simulate async (placeholder for future HTTP call)
    setTimeout(() => {
      try {
        localStorage.setItem('setly.settings', JSON.stringify(this.settings));
        console.log('Settings saved');
        this.savedFlash = true;
        setTimeout(() => this.savedFlash = false, 2000);
      } catch (e) {
        console.error('Failed to save settings', e);
      } finally {
        this.saving = false;
      }
    }, 300);
  }

  // ----- Data section helpers -----
  profileJson(): string {
    try {
      return JSON.stringify(this.profileStore.profile(), null, 2);
    } catch { return '{}'; }
  }
  userJson(): string {
    try {
      return JSON.stringify(this.userStore.user(), null, 2);
    } catch { return '{}'; }
  }
  async refreshData() {
    try {
      await this.profileStore.loadMe();
      await this.userStore.refresh();
      this.toast.success('Data refreshed');
    } catch {
      this.toast.error('Failed to refresh');
    }
  }
  async copyAll() {
    const data = { profile: this.profileStore.profile(), user: this.userStore.user() };
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      this.toast.success('Copied');
    } catch {
      this.toast.error('Copy failed');
    }
  }
}
