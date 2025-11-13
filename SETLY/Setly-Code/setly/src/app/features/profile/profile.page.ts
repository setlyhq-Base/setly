import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileSidebarComponent, ProfileSection } from './components/sidebar.component';
import { ProfileHeaderCardComponent } from './components/profile-header-card.component';
import { AboutMeComponent } from './components/about-me.component';
// Removed carousel import (replaced by inline timeline rendering)
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

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, InViewDirective, CountUpDirective, ProfileSidebarComponent, ProfileHeaderCardComponent, AboutMeComponent, ReviewsListComponent, InterestsGridComponent, VerificationStatusComponent, ConnectionsListComponent, ProfileEditFormComponent, MyListingsComponent],
  template: `
    <main class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <!-- Hero / Overview Header -->
        <div class="mb-8 space-y-4" inView>
          <div class="relative will-fade-up">
            <app-profile-header-card [profile]="user()" [missingTips]="missingTips()" (edit)="openEdit()" [canEdit]="false">
              <div header-actions class="flex items-center gap-4">
                <button class="btn-primary text-xs" (click)="openEdit()" *ngIf="!publicView()">✏️ <span class="hidden sm:inline ml-1">Edit</span></button>
                <button class="btn-secondary text-xs" (click)="togglePublicView()">{{ publicView() ? 'Exit Public View' : 'View as Public' }}</button>
                <button class="btn-primary text-xs" (click)="shareProfile()" [disabled]="shareCooldown">{{ shareCooldown ? 'Copied!' : 'Share Profile' }}</button>
              </div>
            </app-profile-header-card>
          </div>
          <!-- Premium Quick Nav -->
          <div class="premium-nav-wrapper will-fade-up" role="navigation" aria-label="Profile sections">
            <ul class="premium-nav" [attr.data-active]="section()">
              <li *ngFor="let nav of navSections; let i = index" >
                <button type="button"
                  class="nav-chip" [class.active]="section() === nav.id"
                  (click)="section.set(nav.id); scrollToContent()" [attr.aria-current]="section()===nav.id? 'page': null">
                  <span class="icon" aria-hidden="true">{{ nav.icon }}</span>
                  <span class="label">{{ nav.label }}</span>
                  <span *ngIf="nav.id==='verification'" class="badge" [class.complete]="verificationPercent()===100">{{ verificationPercent() }}%</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

  <div class="flex gap-6 items-start">
          <!-- Desktop sidebar -->
          <app-profile-sidebar class="hidden xl:block shrink-0" [active]="section()" (sectionChange)="section.set($event)"></app-profile-sidebar>

          <div class="flex-1 space-y-8" id="profile-content-root">
            <!-- Section: Overview -->
            <div *ngIf="section() === 'overview'" class="space-y-10 animate-fade-in">
              <!-- At-a-glance metrics + actions -->
              <div class="panel-grid mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm" aria-label="Profile overview metrics">
                <div class="metric-card hover-premium" *ngFor="let m of metrics">
                  <div class="metric-value text-gray-900"><span [countUp]="m.value" [duration]="900"></span></div>
                  <div class="metric-label">{{ m.label }}</div>
                </div>
                <div class="metric-card focusable" (click)="openEdit()" role="button" tabindex="0">
                  <div class="metric-value text-indigo-600">✏️</div>
                  <div class="metric-label">Edit Profile</div>
                </div>
              </div>

              <!-- About / Bio -->
              <div class="grid gap-8 md:grid-cols-3 auto-rows-fr">
                <div class="md:col-span-2 flex flex-col gap-8">
                  <app-about-me *ngIf="isVisible('about')" [profile]="user()" (edit)="openEdit()"></app-about-me>

                  <!-- Profession / Field / Languages / Interests -->
                  <div class="card-stack">
                    <div class="stack-card">
                      <header><h3>Profession / Field of Study</h3><button class="mini-btn" (click)="openEdit()">Edit</button></header>
                      <p class="placeholder" *ngIf="!user().profession">Not set</p>
                      <p *ngIf="user().profession" class="body-text">{{ user().profession }}</p>
                    </div>
                    <div class="stack-card">
                      <header><h3>Languages</h3><button class="mini-btn" (click)="openEdit()">Edit</button></header>
                      <p class="placeholder" *ngIf="!user().languages?.length">Not set</p>
                      <ul class="tag-row" *ngIf="user().languages?.length">
                        <li *ngFor="let l of user().languages">{{ l }}</li>
                      </ul>
                    </div>
                    <div class="stack-card">
                      <header><h3>Interests</h3><button class="mini-btn" (click)="openEdit()">Edit</button></header>
                      <app-interests-grid *ngIf="isVisible('interests')" [chips]="interestChips" [(selected)]="selectedInterests"></app-interests-grid>
                    </div>
                  </div>

                  <!-- Activity Feed -->
                  <div class="card" *ngIf="activityFeed.length" aria-label="Recent profile activity">
                    <header class="section-head"><h3>Activity</h3><button class="mini-btn" (click)="refreshActivity()">Refresh</button></header>
                    <ul class="flex flex-col gap-2 mt-2">
                      <li *ngFor="let act of activityFeed" class="flex items-start gap-3 text-[13px]">
                        <span class="text-indigo-600">{{ act.icon }}</span>
                        <div>
                          <p class="font-medium text-slate-700">{{ act.text }}</p>
                          <p class="text-[11px] uppercase tracking-wide text-slate-400">{{ act.at | date:'short' }}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="card text-center text-slate-500 py-10" *ngIf="!activityFeed.length">
                    <p class="text-sm mb-3">No activity yet. Interactions you make will appear here.</p>
                    <button class="px-3 py-1.5 text-xs rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200" (click)="seedActivity()">Seed Sample Activity</button>
                  </div>

                  <!-- Reviews -->
                  <app-reviews-list *ngIf="isVisible('reviews')" [reviews]="reviews" [canWriteReview]="!publicView()" (write)="openReviewModal()"></app-reviews-list>
                </div>
                <!-- Right column -->
                <div class="flex flex-col gap-8"> 
                  <!-- Where I've Been -->
                  <div class="card">
                    <header class="section-head">
                      <h3>Where I've Been</h3>
                      <button class="mini-btn" (click)="openEdit()">Add stay</button>
                    </header>
                    <ul class="timeline">
                      <li *ngFor="let h of travelHistory" class="time-item">
                        <div class="dot"></div>
                        <div class="content">
                          <p class="title">{{ h.city }}, {{ h.state }}</p>
                          <p class="sub">🏫 {{ h.university }}</p>
                          <p class="range">Stayed {{ h.startDate | date:'MMM yyyy' }} – {{ h.endDate | date:'MMM yyyy' }}</p>
                          <div class="map-ph" aria-hidden="true"></div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Connections -->
                  <div class="card flow-vertical" *ngIf="isVisible('connections')">
                    <header class="section-head"><h3>Connections</h3><a routerLink="/browse" class="mini-link">Find more</a></header>
                    <app-connections-list [connections]="connections"></app-connections-list>
                  </div>

                  <!-- Verification Progress -->
                  <div class="card flow-vertical tight" *ngIf="isVisible('verification')">
                    <header class="section-head"><h3>Verification</h3></header>
                    <div class="verif-progress">
                      <div class="verification-ring" [style.--p]="verificationPercent()"></div>
                      <div class="details">
                        <p class="score">{{ verificationPercent() }}%</p>
                        <p class="hint">Complete steps to build trust.</p>
                        <ul class="steps">
                          <li *ngFor="let step of verificationSteps" [class.done]="step.done">
                            <span class="chk">{{ step.done ? '✅' : '⏺' }}</span>{{ step.label }}
                            <button *ngIf="!step.done" class="mini-link" (click)="onVerify(step.key)">Verify</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div *ngIf="verificationPercent() === 100" class="confetti" aria-hidden="true">
                      <span *ngFor="let i of confettiSpan" class="c"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: My Rooms & Listings -->
            <div *ngIf="section() === 'my-rooms'" class="animate-fade-in">
              <app-my-listings [items]="listings"></app-my-listings>
            </div>

            <!-- Section: Past Rides -->
            <div *ngIf="section() === 'past-rides'" class="card text-center py-16 text-gray-600">
              No rides yet. Try <a routerLink="/ride" class="text-blue-600 hover:text-blue-800 font-medium">booking a ride</a>.
            </div>

            <!-- Section: Connections (dedicated) -->
            <div *ngIf="section() === 'connections'" class="animate-fade-in">
              <app-connections-list [connections]="connections"></app-connections-list>
            </div>

            <!-- Section: Verification (dedicated) -->
            <div *ngIf="section() === 'verification'" class="animate-fade-in">
              <app-verification-status [state]="user().verifications" (action)="onVerify($event)"></app-verification-status>
            </div>

            <!-- Section: Preferences -->
            <div *ngIf="section() === 'preferences'" class="card space-y-6">
              <div>
                <h2 class="text-lg font-semibold mb-2">Edit Profile</h2>
              <!-- Edit Modal -->
              <div *ngIf="showEdit()" class="fixed inset-0 z-50 flex items-center justify-center">
                <div class="absolute inset-0 bg-black/40" (click)="closeEdit()"></div>
                <div class="relative bg-white w-[92vw] max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-auto p-6 animate-fade-in">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Edit Profile</h3>
                    <button class="text-gray-500 hover:text-gray-700" (click)="closeEdit()">✕</button>
                  </div>
                  <app-profile-edit-form (saved)="onProfileSaved(); closeEdit()" (dirtyChange)="onDirty($event)"></app-profile-edit-form>
                </div>
              </div>

              <!-- Write Review Modal (stub) -->
              <div *ngIf="showReview()" class="fixed inset-0 z-50 flex items-center justify-center">
                <div class="absolute inset-0 bg-black/40" (click)="closeReview()"></div>
                <div class="relative bg-white w-[92vw] max-w-lg rounded-2xl shadow-xl overflow-auto p-6 animate-fade-in">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Write a Review</h3>
                    <button class="text-gray-500 hover:text-gray-700" (click)="closeReview()">✕</button>
                  </div>
                  <form class="space-y-4" (submit)="submitReview($event)">
                    <div>
                      <label class="block text-sm font-medium mb-1">Rating</label>
                      <select class="w-full border rounded-lg px-3 py-2" [(ngModel)]="newReview.rating" name="rating">
                        <option [ngValue]="5">5 - Excellent</option>
                        <option [ngValue]="4">4 - Good</option>
                        <option [ngValue]="3">3 - Okay</option>
                        <option [ngValue]="2">2 - Poor</option>
                        <option [ngValue]="1">1 - Terrible</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-1">Comment</label>
                      <textarea class="w-full border rounded-lg px-3 py-2" rows="4" [(ngModel)]="newReview.comment" name="comment" placeholder="Share your experience..."></textarea>
                    </div>
                    <div class="flex justify-end gap-2">
                      <button type="button" class="px-4 py-2 rounded-lg bg-gray-100" (click)="closeReview()">Cancel</button>
                      <button type="submit" class="px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600">Submit</button>
                    </div>
                  </form>
                </div>
              </div>
                <p class="text-gray-600 text-sm">Update how you appear across Setly. More fields coming soon.</p>
              </div>
              <app-profile-edit-form (saved)="onProfileSaved()" (dirtyChange)="onDirty($event)"></app-profile-edit-form>
            </div>

            <!-- Section: Settings -->
            <div *ngIf="section() === 'settings'" class="card space-y-6 animate-fade-in">
              <h2 class="text-lg font-semibold">Settings</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="font-medium mb-3">Account</h3>
                  <div class="space-y-3">
                    <label class="block">
                      <span class="text-sm text-gray-700">Email</span>
                      <input type="email" class="input-premium mt-1" placeholder="you@example.com" [(ngModel)]="settings.email" name="settingsEmail" />
                    </label>
                    <label class="block">
                      <span class="text-sm text-gray-700">Phone</span>
                      <input type="tel" class="input-premium mt-1" placeholder="(555) 555‑5555" [(ngModel)]="settings.phone" name="settingsPhone" />
                    </label>
                  </div>
                  <div class="privacy mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700">
                    We use your email and phone for account recovery and security notifications. You control who can see your contact info in the Privacy section.
                  </div>
                </div>
                <div>
                  <h3 class="font-medium mb-3">Notifications</h3>
                  <div class="space-y-3">
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="settings.notifyBooking" name="notifyBooking" />
                      <span class="track"><span class="thumb"></span></span>
                      <span class="lbl">Room booking updates</span>
                    </label>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="settings.notifyProduct" name="notifyProduct" />
                      <span class="track"><span class="thumb"></span></span>
                      <span class="lbl">Product announcements</span>
                    </label>
                  </div>
                  <div class="danger mt-6">
                    <button class="danger-btn ripple" type="button">Delete Account</button>
                  </div>
                </div>
              </div>
              <div class="flex justify-end items-center gap-4">
                <p *ngIf="savedFlash" class="text-sm text-green-600">Saved ✓</p>
                <button class="btn" (click)="saveSettings()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save Settings' }}</button>
              </div>
            </div>
          </div>
        </div>

  <!-- Sticky FAB on mobile -->
  <button class="fixed lg:hidden bottom-5 right-5 z-40 btn-primary" (click)="openEdit()">Edit Profile</button>

  <!-- Mobile bottom nav -->
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200">
    <ul class="flex justify-around items-center py-2 text-xs">
      <li *ngFor="let nav of navSections">
        <button class="flex flex-col items-center gap-0.5 px-2 py-1" [class.text-indigo-600]="section()===nav.id" (click)="section.set(nav.id); scrollToContent()">
          <span class="text-base">{{ nav.icon }}</span>
          <span>{{ nav.label.split(' ')[0] }}</span>
        </button>
      </li>
    </ul>
  </nav>

  <!-- Footer -->
        <footer class="mt-12 text-center text-sm text-gray-500">
          <nav class="flex flex-wrap gap-4 justify-center mb-2">
            <a class="hover:text-gray-700" href="#">About</a>
            <a class="hover:text-gray-700" href="#">Help</a>
            <a class="hover:text-gray-700" href="#">Terms</a>
            <a class="hover:text-gray-700" href="#">Privacy</a>
            <a class="hover:text-gray-700" href="#">Feedback</a>
          </nav>
          <div>© 2025 Setly</div>
        </footer>
      </div>
    </main>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; }
    .glass { backdrop-filter: blur(12px) saturate(1.25); background:linear-gradient(145deg,rgba(255,255,255,0.85),rgba(255,255,255,0.55)); }
    .subtle-border { border:1px solid rgba(0,0,0,0.06); box-shadow:0 4px 14px -6px rgba(0,0,0,0.08),0 2px 4px -2px rgba(0,0,0,0.04); }
    .animate-fade-in { animation: fadeIn .35s ease; }
    .will-fade-up { animation: fadeUp .55s cubic-bezier(.16,.8,.3,1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeUp { from { opacity:0; transform: translateY(22px) scale(.98); } to { opacity:1; transform: translateY(0) scale(1); } }
    .premium-nav-wrapper { position:relative; }
  .premium-nav { display:flex; gap:16px; overflow-x:auto; padding:.35rem .25rem .5rem; scrollbar-width:none; }
    .premium-nav::-webkit-scrollbar{ display:none; }
    .nav-chip { display:flex; align-items:center; gap:.5rem; background:linear-gradient(120deg,#f8f9fb,#f1f5f9); border:1px solid #e5e7eb; padding:.55rem .9rem .55rem .7rem; border-radius:1rem; font-size:.7rem; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:#475569; position:relative; transition: all .35s cubic-bezier(.4,.7,.2,1); }
    .nav-chip .icon { font-size:1rem; filter:grayscale(.15); }
  .nav-chip.active { background:#5A4FF3; color:#fff; border-color:transparent; box-shadow:0 6px 16px -6px rgba(90,79,243,.35); }
    .nav-chip.active .icon { filter:none; }
    .nav-chip .badge { background:#fff; color:#6366f1; font-size:.55rem; padding:.15rem .4rem; border-radius:.65rem; font-weight:700; box-shadow:0 2px 6px rgba(0,0,0,.12); }
    .nav-chip .badge.complete { background:linear-gradient(90deg,#10b981,#34d399); color:#fff; }
  .panel-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:16px; padding:12px 16px; border:1px solid rgba(0,0,0,0.05); border-radius:1.35rem; box-shadow:0 8px 26px -12px rgba(0,0,0,.12); }
  .metric { display:flex; flex-direction:column; gap:12px; padding:12px; border-radius:12px; position:relative; background:linear-gradient(160deg,#ffffff 0%,#f5f7fa 100%); border:1px solid rgba(0,0,0,0.04); }
  .metric-value { font-size:1.35rem; font-weight:600; letter-spacing:-0.02em; }
    .metric-label { font-size:.6rem; font-weight:600; text-transform:uppercase; letter-spacing:.09em; color:#64748b; }
    .metric.focusable { cursor:pointer; transition:.3s; }
    .metric.focusable:hover { background:linear-gradient(160deg,#f5f7ff,#eef2ff); }
    .card-stack { display:flex; flex-direction:column; gap:1rem; }
    .stack-card { background:#fff; border:1px solid #e2e8f0; border-radius:1.25rem; padding:1.1rem 1.25rem 1.2rem; box-shadow:0 4px 18px -8px rgba(0,0,0,.08); display:flex; flex-direction:column; gap:.75rem; }
    .stack-card header { display:flex; align-items:center; justify-content:space-between; }
  .stack-card h3 { font-size:22px; font-weight:600; color:#111827; letter-spacing:.02em; }
    .mini-btn { font-size:.65rem; font-weight:600; letter-spacing:.08em; background:#f1f5f9; border:1px solid #e2e8f0; padding:.4rem .6rem; border-radius:.6rem; text-transform:uppercase; color:#475569; transition:.25s; }
    .mini-btn:hover { background:#e2e8f0; }
    .mini-link { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#6366f1; }
    .mini-link:hover { text-decoration:underline; }
  .placeholder { font-size:15px; font-weight:500; color:#94a3b8; }
  .body-text { font-size:15px; line-height:1.6; color:#334155; }
    .tag-row { display:flex; flex-wrap:wrap; gap:.5rem; }
    .tag-row li { background:linear-gradient(90deg,#6366f1,#818cf8); font-size:.6rem; font-weight:600; letter-spacing:.08em; padding:.35rem .55rem; border-radius:.55rem; color:#fff; box-shadow:0 4px 10px -5px rgba(99,102,241,.55); }
    .timeline { position:relative; display:flex; flex-direction:column; gap:1.35rem; margin-top:.5rem; }
    .time-item { display:flex; gap:.9rem; position:relative; }
    .time-item .dot { width:.9rem; height:.9rem; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); border-radius:50%; box-shadow:0 0 0 4px #fff,0 4px 14px -6px rgba(90,79,243,.7); flex-shrink:0; margin-top:.25rem; }
    .time-item .content { flex:1; }
    .time-item .title { font-size:.8rem; font-weight:600; }
    .time-item .sub { font-size:.7rem; color:#6366f1; font-weight:500; margin-top:.15rem; }
  .time-item .range { font-size:.6rem; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; margin-top:.35rem; }
  .map-ph { margin-top:.5rem; height:72px; border-radius:.75rem; background:linear-gradient(135deg,#eef2ff,#f8fafc); border:1px solid #e2e8f0; box-shadow:inset 0 1px 0 rgba(255,255,255,.7); transition:transform .35s ease, box-shadow .35s ease; }
  .time-item:hover .map-ph { transform:scale(1.02); box-shadow:0 10px 26px -12px rgba(15,23,42,.35), inset 0 1px 0 rgba(255,255,255,.7); }
    .section-head { display:flex; align-items:center; justify-content:space-between; }
  .section-head h3 { font-size:22px; font-weight:600; color:#111827; letter-spacing:.02em; }
  .verif-progress { display:flex; gap:1.1rem; align-items:flex-start; }
    /* ring styles moved to global .verification-ring utility */
    .verif-progress .details { flex:1; display:flex; flex-direction:column; gap:.4rem; }
    .verif-progress .score { font-size:1.05rem; font-weight:600; }
    .verif-progress .hint { font-size:.65rem; text-transform:uppercase; letter-spacing:.08em; font-weight:600; color:#64748b; }
    .verif-progress .steps { list-style:none; display:flex; flex-direction:column; gap:.35rem; margin-top:.2rem; }
    .verif-progress .steps li { font-size:.65rem; display:flex; align-items:center; gap:.45rem; font-weight:600; letter-spacing:.04em; color:#475569; }
    .verif-progress .steps li.done { color:#10b981; }
    .verif-progress .steps .chk { width:1rem; text-align:center; }
  .primary-fab { display:none; }
  .toggle { display:flex; align-items:center; gap:.6rem; }
  .toggle input { position:absolute; opacity:0; width:1px; height:1px; }
  .toggle .track { position:relative; width:44px; height:24px; background:#e5e7eb; border-radius:999px; transition:background .25s; box-shadow:inset 0 1px 0 rgba(255,255,255,.5); }
  .toggle .thumb { position:absolute; top:3px; left:3px; width:18px; height:18px; background:#fff; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,.15); transition:left .25s; }
  .toggle input:checked + .track { background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); }
  .toggle input:checked + .track .thumb { left:23px; }
  .toggle .lbl { font-size:.9rem; color:#0f172a; }
  .danger-btn { padding:.55rem 1rem; border-radius:.7rem; background:linear-gradient(90deg,#f43f5e,#ef4444); color:#fff; font-weight:700; letter-spacing:.05em; box-shadow:0 10px 24px -12px rgba(239,68,68,.6); }
  .confetti { position:relative; height:0; }
  .confetti .c { position:absolute; width:6px; height:10px; background:linear-gradient(180deg,#f59e0b,#f43f5e); top:-10px; left:50%; transform:translateX(-50%); animation: fall 1.2s ease forwards; border-radius:2px; }
  .confetti .c:nth-child(2){ left:40%; animation-delay:.05s; background:linear-gradient(180deg,#10b981,#22d3ee); }
  .confetti .c:nth-child(3){ left:60%; animation-delay:.1s; background:linear-gradient(180deg,#6366f1,#8b5cf6); }
  .confetti .c:nth-child(4){ left:30%; animation-delay:.15s; background:linear-gradient(180deg,#ef4444,#f97316); }
  .confetti .c:nth-child(5){ left:70%; animation-delay:.2s; background:linear-gradient(180deg,#06b6d4,#14b8a6); }
  @keyframes fall { from { opacity:0; transform:translate(-50%,-10px) rotate(0); } to { opacity:1; transform:translate(-50%,36px) rotate(240deg); } }
    @media (max-width: 860px){
      .panel-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
    }
    @media (max-width:640px){
      .stack-card { padding:1rem .95rem 1.05rem; }
      .premium-nav { padding-right:.5rem; }
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
      avatarUrl: prof?.avatarUrl || basic?.photoUrl || '/assets/avatar-placeholder.png',
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
    { id: 'settings', label: 'Settings', icon: '⚙️' }
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
}
