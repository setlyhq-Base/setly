import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileHeaderCardComponent } from './components/profile-header-card.component';
import { VerificationStatusComponent } from './components/verification-status.component';
import { ConnectionsListComponent } from './components/connections-list.component';
import { ProfileEditFormComponent } from './components/profile-edit-form.component';
import { MyListingsComponent, ListingCardItem } from './components/my-listings.component';
import {
  UserProfile,
  TravelHistoryEntry,
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
import { RoomsApiService } from '../../core/services/rooms-api.service';
import { RidesApiService } from '../../core/services/rides-api.service';
import { MarketplaceApiService } from '../../core/services/marketplace-api.service';
import { UsersApiService } from '../../core/services/users-api.service';
import { Router } from '@angular/router';

// Profile section types
export type ProfileSection = 'overview' | 'my-rooms' | 'past-rides' | 'marketplace' | 'saved' | 'connections' | 'verification' | 'preferences' | 'settings' | 'data';

@Component({
  selector: 'app-profile-v2',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileHeaderCardComponent, MyListingsComponent, VerificationStatusComponent, ConnectionsListComponent, ProfileEditFormComponent],
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
              <!-- About Section -->
              <div class="profile-card">
                <div class="section-header">
                  <h3 class="section-title">
                    <span class="section-title-icon">ℹ️</span>
                    About
                  </h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <div class="section-divider"></div>
                <p class="empty-text" *ngIf="!user().about">Tell people about yourself...</p>
                <p *ngIf="user().about" class="content-text about-text">{{ user().about }}</p>
              </div>

              <div class="profile-card">
                <div class="section-header">
                  <h3 class="section-title">
                    <span class="section-title-icon">💼</span>
                    Profession / Field of Study
                  </h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <div class="section-divider"></div>
                <p class="empty-text" *ngIf="!user().profession">Not set</p>
                <p *ngIf="user().profession" class="content-text">{{ user().profession }}</p>
              </div>

              <div class="profile-card">
                <div class="section-header">
                  <h3 class="section-title">
                    <span class="section-title-icon">🌍</span>
                    Languages
                  </h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <div class="section-divider"></div>
                <p class="empty-text languages-helper" *ngIf="!user().languages?.length">Add the languages you speak to help others connect with you.</p>
                <div class="tags-wrap" *ngIf="user().languages?.length">
                  <span class="tag" *ngFor="let l of user().languages">{{ l }}</span>
                </div>
              </div>

              <div class="profile-card">
                <div class="section-header">
                  <h3 class="section-title">
                    <span class="section-title-icon">✨</span>
                    Interests
                  </h3>
                  <button class="edit-btn" (click)="openEdit()">Edit</button>
                </div>
                <div class="section-divider"></div>
                <p class="empty-text" *ngIf="!selectedInterests?.length">Not set</p>
                <div class="interests-grid" *ngIf="selectedInterests?.length">
                  <span class="interest-chip" *ngFor="let key of selectedInterests">
                    {{ getInterestLabel(key) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Column: Connections, Verification -->
            <div class="right-column">
              <!-- Connections Section - Instagram Style Grid -->
              <div class="profile-card connections-card">
                <div class="section-header">
                  <h3 class="section-title">
                    <span class="section-title-icon">👥</span>
                    Connections <span class="count-badge">{{ connections.length }}</span>
                  </h3>
                </div>
                <div class="section-divider"></div>
                
                <!-- Instagram-style 3-column grid -->
                <div class="connections-instagram-grid">
                  <div *ngFor="let c of topSixConnections" class="connection-item">
                    <img *ngIf="c.avatarUrl" [src]="c.avatarUrl" [alt]="c.name" class="connection-avatar-circle" />
                    <div *ngIf="!c.avatarUrl" class="connection-avatar-circle-placeholder">
                      {{ c.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="connection-name-ig">{{ c.name }}</div>
                    <div class="connection-university-ig">{{ c.university }}</div>
                    <span class="connection-badge-single">Verified Student</span>
                  </div>
                </div>

                <button class="view-all-btn-primary" (click)="section.set('connections')">
                  View All {{ connections.length }} Connections
                </button>
              </div>

              <!-- Verification Section -->
              <div class="profile-card">
                <div class="section-header">
                  <h3 class="section-title">
                    <span class="section-title-icon">🛡️</span>
                    Verification
                  </h3>
                </div>
                <div class="section-divider"></div>
                <div class="verification-details">
                  <div class="verification-header">
                    <div class="progress-circle">
                      <svg width="60" height="60">
                        <circle cx="30" cy="30" r="26" fill="none" stroke="#e5e7eb" stroke-width="4"/>
                        <circle cx="30" cy="30" r="26" fill="none" stroke="#0F5FFF" stroke-width="4" 
                          [attr.stroke-dasharray]="163.36" 
                          [attr.stroke-dashoffset]="163.36 * (1 - verificationPercent() / 100)"
                          style="transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 0.5s ease;"/>
                      </svg>
                      <span class="progress-score">{{ verificationPercent() }}%</span>
                    </div>
                    <div class="progress-info">
                      <p class="progress-title">Trust Score</p>
                      <p class="progress-hint">Complete steps to build trust</p>
                    </div>
                  </div>
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
          </div>

          <!-- Section: My Rooms (Use Explore card grid) -->
          <div *ngIf="section() === 'my-rooms'" class="section-content">
            <app-my-listings [items]="roomListings()"></app-my-listings>
          </div>

          <!-- Section: Past Rides -->
          <div *ngIf="section() === 'past-rides'" class="section-content">
            <app-my-listings [items]="rideListings()"></app-my-listings>
          </div>
          
          <!-- Section: Marketplace -->
          <div *ngIf="section() === 'marketplace'" class="section-content">
            <app-my-listings [items]="marketplaceListings()"></app-my-listings>
          </div>

          <!-- Section: Saved Items -->
          <div *ngIf="section() === 'saved'" class="section-content">
            <div class="profile-card">
              <h3 class="section-title mb-6">
                <span class="section-title-icon">❤️</span>
                Saved Items
              </h3>
              
              <div *ngIf="loadingSaved()" class="text-center py-8">
                <div class="loading-spinner"></div>
                <p class="text-gray-600 mt-2">Loading saved items...</p>
              </div>
              
              <div *ngIf="!loadingSaved()" class="space-y-8">
                <!-- Saved Rooms -->
                <div *ngIf="_savedItems().rooms.length > 0">
                  <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    🏠 Saved Rooms <span class="text-sm text-gray-500">({{ _savedItems().rooms.length }})</span>
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div *ngFor="let roomId of _savedItems().rooms" 
                         class="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                         (click)="router.navigate(['/listing', roomId])">
                      <p class="text-sm text-gray-600">Room ID: {{ roomId }}</p>
                      <button class="text-red-500 text-sm mt-2 hover:underline" 
                              (click)="unsaveRoom(roomId); $event.stopPropagation()">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Saved Rides -->
                <div *ngIf="_savedItems().rides.length > 0">
                  <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    🚗 Saved Rides <span class="text-sm text-gray-500">({{ _savedItems().rides.length }})</span>
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div *ngFor="let rideId of _savedItems().rides" 
                         class="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                         (click)="router.navigate(['/listing', rideId])">
                      <p class="text-sm text-gray-600">Ride ID: {{ rideId }}</p>
                      <button class="text-red-500 text-sm mt-2 hover:underline" 
                              (click)="unsaveRide(rideId); $event.stopPropagation()">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Saved Marketplace -->
                <div *ngIf="_savedItems().marketplace.length > 0">
                  <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    🛍️ Saved Marketplace <span class="text-sm text-gray-500">({{ _savedItems().marketplace.length }})</span>
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div *ngFor="let itemId of _savedItems().marketplace" 
                         class="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                         (click)="router.navigate(['/listing', itemId])">
                      <p class="text-sm text-gray-600">Item ID: {{ itemId }}</p>
                      <button class="text-red-500 text-sm mt-2 hover:underline" 
                              (click)="unsaveMarketplace(itemId); $event.stopPropagation()">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="_savedItems().rooms.length === 0 && _savedItems().rides.length === 0 && _savedItems().marketplace.length === 0" 
                     class="text-center py-12">
                  <div class="text-6xl mb-4">❤️</div>
                  <h4 class="text-xl font-semibold text-gray-700 mb-2">No saved items yet</h4>
                  <p class="text-gray-600">Save rooms, rides, and marketplace items to see them here</p>
                </div>
              </div>
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
    /* Global focus states for accessibility */
    *:focus-visible {
      outline: 2px solid #0F5FFF;
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Modern Profile Page Layout - Premium style */
    .profile-page-modern {
      min-height: 100vh;
      background: #F3F6FC; /* Darker background for card contrast */
    }
    
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 24px 48px;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 12px 16px 32px;
      }
    }

    /* Content wrapper - consistent spacing from tabs */
    .content-wrapper {
      margin-top: 24px;
    }

    /* Section content containers */
    .section-content {
      width: 100%;
    }

    /* Sticky tabs bar with subtle shadow */
    .tabs-container {
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgba(255, 255, 255, 0.98);
      border-bottom: 1px solid #e5e7eb;
      margin: 0 -1rem;
      padding: 0 1rem;
      margin-top: 0;
      padding-top: 12px; /* Reduced height */
      padding-bottom: 12px;
      backdrop-filter: blur(16px);
      box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.06);
    }

    .tabs-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .tabs-bar::-webkit-scrollbar {
      display: none;
    }

    /* Redesigned tabs - Blue active, white inactive with border */
    .tab-pill {
      flex-shrink: 0;
      padding: 8px 16px; /* Reduced height */
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease-out;
      background: white;
      color: #64748b;
      border: 1px solid #cbd5e1;
      cursor: pointer;
      white-space: nowrap;
    }

    .tab-pill:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    /* Blue active tab */
    .tab-pill.active {
      background: #0F5FFF;
      color: white;
      border-color: #0F5FFF;
      box-shadow: 0 2px 8px rgba(15, 95, 255, 0.25);
    }

    .tab-badge {
      display: inline-block;
      margin-left: 6px;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .tab-pill.active .tab-badge {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Two-column layout - Better balance: 60/40 instead of 65/35 */
    .two-column-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: start;
      margin-top: 0;
    }

    @media (min-width: 1024px) {
      .two-column-layout {
        grid-template-columns: 60fr 40fr; /* Better balance */
        gap: 32px;
      }
    }

    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 20px; /* Consistent tight spacing */
      align-items: stretch;
    }

    /* Premium profile cards - Consistent single elevation */
    .profile-card {
      background: #FFFFFF;
      border-radius: 16px; /* Consistent radius */
      border: 1px solid #e5e7eb;
      padding: 20px; /* Reduced from 32px to 20-24px */
      box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.05);
      transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
    }

    .profile-card:hover {
      box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.1), 0 8px 20px -4px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    /* Premium section headers with better hierarchy */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 16px; /* Slightly larger for hierarchy */
      font-weight: 600;
      color: #0A1A3F;
      margin: 0;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px; /* Small gap for icon */
    }

    .section-title-icon {
      font-size: 18px;
      opacity: 0.7;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(to right, #e5e7eb 0%, #f1f5f9 100%);
      margin-bottom: 16px;
      border-radius: 1px;
    }

    .count-badge {
      display: inline-block;
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      color: #0369a1;
      font-size: 13px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 14px; /* More rounding */
      margin-left: 8px;
      box-shadow: 0 2px 4px rgba(3, 105, 161, 0.15);
    }

    .edit-btn {
      background: transparent;
      border: none;
      color: #0F5FFF;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.15s ease-out;
    }

    .edit-btn:hover {
      background: #f0f7ff;
      transform: translateY(-1px);
    }

    .edit-btn:focus-visible {
      outline: 2px solid #0F5FFF;
      outline-offset: 2px;
    }

    .content-text {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin: 0;
    }

    /* About text with quote feel */
    .about-text {
      line-height: 1.8;
      color: #64748b;
      position: relative;
      padding-left: 16px;
      border-left: 3px solid #e0f2fe;
    }

    /* Profession text styling */
    .profession-text {
      font-weight: 500;
    }

    .empty-text {
      font-size: 15px;
      color: #94a3b8;
      font-style: italic;
      margin: 0;
    }

    /* Languages helper text */
    .languages-helper {
      font-size: 14px;
      color: #94a3b8;
      font-style: normal;
      line-height: 1.5;
    }

    .tags-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 4px;
    }

    /* Interests grid with more spacing */
    .interests-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 14px; /* More spacing */
      margin-top: 6px;
    }

    /* Interest chips with hover effect */
    .interest-chip {
      display: inline-block;
      padding: 10px 16px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid #bfdbfe;
      transition: all 0.15s ease-out;
      cursor: default;
    }

    .interest-chip:hover {
      background: #3b82f6;
      color: white;
      border-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }

    /* Premium tag chips with better colors and rounding */
    .tag {
      display: inline-block;
      padding: 8px 18px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #475569;
      border-radius: 16px; /* More rounding */
      font-size: 14px;
      font-weight: 600; /* Bolder */
      border: 1px solid #e2e8f0;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    .tag:hover {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-color: #0369a1;
      color: #0369a1;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(3, 105, 161, 0.15);
    }

    .interest-tag {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1e40af;
      border-color: #93c5fd;
      font-weight: 600;
    }

    .interest-tag:hover {
      background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
      color: #1e3a8a;
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    /* ========================================
       INSTAGRAM-STYLE CONNECTIONS GRID
       ======================================== */
    
    /* Extra padding for connections card */
    .connections-card {
      padding: 24px;
    }

    /* 3-column Instagram-style grid */
    .connections-instagram-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px 16px;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .connections-instagram-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px 12px;
      }
    }

    @media (max-width: 480px) {
      .connections-instagram-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px 8px;
      }
    }

    /* Individual connection item - centered layout */
    .connection-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: transform 0.15s ease-out;
    }

    .connection-item:hover {
      transform: scale(1.02) translateY(-2px);
    }

    /* Circular avatar - 56px */
    .connection-avatar-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.15s ease-out;
    }

    .connection-item:hover .connection-avatar-circle {
      border-color: #0F5FFF;
      box-shadow: 0 4px 12px rgba(15, 95, 255, 0.2);
    }

    .connection-avatar-circle-placeholder {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.15s ease-out;
    }

    .connection-item:hover .connection-avatar-circle-placeholder {
      border-color: #0F5FFF;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    /* Name - semi-bold */
    .connection-name-ig {
      font-size: 14px;
      font-weight: 600;
      color: #0A1A3F;
      margin-bottom: 2px;
      line-height: 1.3;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* University - smaller, lighter */
    .connection-university-ig {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
      line-height: 1.3;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Single badge - "Verified Student" */
    .connection-badge-single {
      display: inline-block;
      padding: 3px 8px;
      background: #f0f9ff;
      color: #0369a1;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      border: 1px solid #e0f2fe;
    }

    /* Primary View All button - full Setly blue */
    .view-all-btn-primary {
      width: 100%;
      padding: 14px 20px;
      background: #0F5FFF;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease-out;
      box-shadow: 0 2px 8px rgba(15, 95, 255, 0.25);
      margin-top: 8px;
    }

    .view-all-btn-primary:hover {
      background: #0A4FD9;
      box-shadow: 0 4px 16px rgba(15, 95, 255, 0.35);
      transform: translateY(-2px);
    }

    .view-all-btn-primary:active {
      transform: translateY(0);
    }

    /* Verification Circle Progress - more prominent trust score */
    .verification-header {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .progress-circle {
      position: relative;
      flex-shrink: 0;
    }

    .progress-circle .progress-score {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px; /* Larger for more prominence */
      font-weight: 700;
      color: #0F5FFF;
      margin: 0;
    }

    .progress-info {
      flex: 1;
    }

    .progress-title {
      font-size: 17px; /* Slightly larger */
      font-weight: 700;
      color: #0A1A3F;
      margin: 0 0 4px 0;
    }

    .progress-hint {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .verification-details {
      width: 100%;
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

    /* Verification steps styling with hover */
    .verification-steps {
      list-style: none;
      padding: 0;
      margin: 12px 0 0 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .verification-steps li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #64748b;
      padding: 10px 12px;
      border-radius: 8px;
      transition: background 0.15s ease-out;
    }

    .verification-steps li:hover {
      background: #f8fafc;
    }

    .verification-steps li.verified {
      color: #10b981;
      font-weight: 500;
    }

    .step-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .verify-link {
      margin-left: auto; /* Align to right */
      background: transparent;
      border: 1px solid #e5e7eb;
      color: #0F5FFF;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.15s ease-out;
    }

    .verify-link:hover {
      background: #0F5FFF;
      color: white;
      border-color: #0F5FFF;
    }

    .progress-hint {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 8px 0;
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
export class ProfileV2Page implements OnInit {
  section = signal<ProfileSection>('overview');
  private editDirty = false;
  private userStore = inject(UserStore);
  private profileStore = inject(ProfileStore);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private roomsApi = inject(RoomsApiService);
  private ridesApi = inject(RidesApiService);
  private marketplaceApi = inject(MarketplaceApiService);
  private usersApi = inject(UsersApiService);
  router = inject(Router);

  showEdit = signal(false);
  
  // API-loaded data signals
  _myRooms = signal<any[]>([]);
  _myRides = signal<any[]>([]);
  _myMarketplace = signal<any[]>([]);
  _savedItems = signal<{rooms: string[], rides: string[], marketplace: string[]}>({rooms: [], rides: [], marketplace: []});
  loadingRooms = signal(false);
  loadingRides = signal(false);
  loadingMarketplace = signal(false);
  loadingSaved = signal(false);

  // Derived profile from authenticated user; falls back to realistic dummy data
  user = computed<UserProfile>(() => {
    const basic = this.userStore.user();
    const prof = this.profileStore.profile();
    const ver = this.profileStore.verifications();
  const displayName = prof?.displayName || basic?.name || basic?.id || 'Kiran Revally';
    const parts = displayName.trim().split(/\s+/);
  const firstName = prof?.firstName || parts[0] || prof?.displayName || 'Kiran';
    const lastName = prof?.lastName || parts.slice(1).join(' ') || 'Revally';
    return {
      id: basic?.id || prof?.userId || 'kiran-revally-123',
      firstName,
      lastName,
  avatarUrl: prof?.avatarUrl || basic?.photoUrl || 'https://i.pravatar.cc/400?img=12',
      coverImageUrl: basic?.coverImageUrl,
      headline: prof?.headline || basic?.headline || 'MS Computer Science @ University of New Haven',
      location: prof?.location || 'New Haven, CT',
      about: prof?.about || 'Graduate student pursuing MS in Computer Science. Passionate about tech, travel, and meeting new people. Always up for exploring new coffee spots and trying out new restaurants!',
      profession: prof?.program || prof?.title || 'Software Engineering – University of New Haven',
      languages: prof?.languages || ['English', 'Telugu', 'Hindi'],
      interests: prof?.interests || ['Cooking', 'Fitness', 'Photography', 'Coffee Spots', 'Road Trips', 'Gaming'],
      socials: prof?.socials || basic?.socials || {},
      stats: { 
        roomsPosted: 4, 
        ridesShared: 7, 
        connectionsCount: 48,
        marketplaceItems: 6
      },
      verifications: {
        identity: ver?.idVerified ?? true,
        university: ver?.eduVerified ?? basic?.domainVerified ?? true,
        phone: ver?.phoneVerified ?? (basic?.phone ? true : false),
        email: ver?.emailVerified ?? (basic?.emailVerified ? true : true),
      },
      completionPercent: prof?.completion ?? 85,
    };
  });

  private _publicView = signal(false);
  publicView = computed(() => this._publicView());

  travelHistory: TravelHistoryEntry[] = [
    { id: 'th1', city: 'Boston', state: 'MA', university: 'Northeastern Univ.', startDate: '2025-01-01', endDate: '2025-04-01', coverImage: '/assets/boston.jpg' },
  ];

  interestChips: InterestChip[] = [
    { key: 'cooking', label: 'Cooking', icon: '�' },
    { key: 'fitness', label: 'Fitness', icon: '💪' },
    { key: 'photography', label: 'Photography', icon: '📸' },
    { key: 'coffee', label: 'Coffee Spots', icon: '☕' },
    { key: 'interior', label: 'Interior Design', icon: '🏡' },
    { key: 'roadtrips', label: 'Road Trips', icon: '🚗' },
    { key: 'gaming', label: 'Gaming', icon: '🎮' },
    { key: 'music', label: 'Live Music', icon: '🎵' },
    { key: 'adventure', label: 'Adventure', icon: '🧗' },
    { key: 'wellness', label: 'Wellness', icon: '🧘' },
  ];

  selectedInterests: string[] = ['cooking', 'fitness', 'photography', 'coffee', 'roadtrips', 'gaming'];

  connections: Connection[] = [
    { 
      id: 'c1', 
      name: 'Priya Reddy', 
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      university: 'University of Texas Dallas',
      location: 'Dallas, TX',
      tags: ['Student', 'Verified'],
      mutualUniversities: 0, 
      sharedTrips: 2 
    },
    { 
      id: 'c2', 
      name: 'Arjun Patel', 
      avatarUrl: 'https://i.pravatar.cc/150?img=51',
      university: 'New Jersey Institute of Technology',
      location: 'Newark, NJ',
      tags: ['Student', 'Verified'],
      mutualUniversities: 1, 
      sharedTrips: 1 
    },
    { 
      id: 'c3', 
      name: 'Sneha Sharma', 
      avatarUrl: 'https://i.pravatar.cc/150?img=45',
      university: 'Boston University',
      location: 'Boston, MA',
      tags: ['Student'],
      mutualUniversities: 0, 
      sharedTrips: 3 
    },
    { 
      id: 'c4', 
      name: 'Rahul Mehta', 
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
      university: 'Northeastern University',
      location: 'Boston, MA',
      tags: ['Student', 'Verified'],
      mutualUniversities: 2, 
      sharedTrips: 0 
    },
    { 
      id: 'c5', 
      name: 'Aisha Khan', 
      avatarUrl: 'https://i.pravatar.cc/150?img=44',
      university: 'Columbia University',
      location: 'New York, NY',
      tags: ['Student', 'Verified'],
      mutualUniversities: 0, 
      sharedTrips: 1 
    },
    { 
      id: 'c6', 
      name: 'Vikram Singh', 
      avatarUrl: 'https://i.pravatar.cc/150?img=52',
      university: 'University of New Haven',
      location: 'New Haven, CT',
      tags: ['Student'],
      mutualUniversities: 1, 
      sharedTrips: 4 
    },
    { 
      id: 'c7', 
      name: 'Ananya Desai', 
      avatarUrl: 'https://i.pravatar.cc/150?img=48',
      university: 'Stevens Institute of Technology',
      location: 'Hoboken, NJ',
      tags: ['Student', 'Verified'],
      mutualUniversities: 0, 
      sharedTrips: 1 
    },
    { 
      id: 'c8', 
      name: 'Rohan Malhotra', 
      avatarUrl: 'https://i.pravatar.cc/150?img=54',
      university: 'Yale University',
      location: 'New Haven, CT',
      tags: ['Student', 'Verified'],
      mutualUniversities: 1, 
      sharedTrips: 2 
    },
  ];

  // Show only top 4 connections
  get topConnections(): Connection[] {
    return this.connections.slice(0, 4);
  }

  // Show top 6 for Instagram-style grid
  get topSixConnections(): Connection[] {
    return this.connections.slice(0, 6);
  }

  listings: ListingCardItem[] = [
    // ROOMS
    { 
      id: 'room-1', 
      type: 'room', 
      title: 'Sunny Room near University of New Haven', 
      city: 'New Haven', 
      state: 'CT', 
      price: 850,
      coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 
      description: 'Furnished room with private bathroom, fast Wi‑Fi, close to campus.',
      postedDate: '2024-11-20'
    },
    { 
      id: 'room-2', 
      type: 'room', 
      title: 'Cozy Studio Downtown New Haven', 
      city: 'New Haven', 
      state: 'CT', 
      price: 950,
      coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', 
      description: 'Modern studio apartment with kitchen, gym access, parking included.',
      postedDate: '2024-10-15'
    },
    { 
      id: 'room-3', 
      type: 'room', 
      title: 'Spacious Room in Shared Apartment', 
      city: 'New Haven', 
      state: 'CT', 
      price: 750,
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop', 
      description: 'Large room in 3BR apartment, friendly roommates, all utilities included.',
      postedDate: '2024-09-08'
    },
    { 
      id: 'room-4', 
      type: 'room', 
      title: 'Private Room Near Yale Campus', 
      city: 'New Haven', 
      state: 'CT', 
      price: 900,
      coverImage: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop', 
      description: 'Quiet neighborhood, walking distance to Yale, pet-friendly.',
      postedDate: '2024-08-22'
    },
    
    // RIDES
    { 
      id: 'ride-1', 
      type: 'ride', 
      title: 'New Haven → New York City', 
      city: 'New Haven', 
      state: 'CT',
      destination: 'New York, NY',
      price: 25,
      seatsAvailable: 2,
      coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop', 
      description: 'Weekend trip to NYC, leaving Friday 6 PM, returning Sunday evening.',
      rideDate: '2024-12-13'
    },
    { 
      id: 'ride-2', 
      type: 'ride', 
      title: 'New Haven → Boston', 
      city: 'New Haven', 
      state: 'CT',
      destination: 'Boston, MA',
      price: 30,
      seatsAvailable: 3,
      coverImage: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800&h=600&fit=crop', 
      description: 'Regular weekend trips to Boston, comfortable SUV, music allowed.',
      rideDate: '2024-12-07'
    },
    { 
      id: 'ride-3', 
      type: 'ride', 
      title: 'New Haven → Philadelphia', 
      city: 'New Haven', 
      state: 'CT',
      destination: 'Philadelphia, PA',
      price: 35,
      seatsAvailable: 1,
      coverImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop', 
      description: 'One-way trip to Philly, leaving Saturday morning.',
      rideDate: '2024-12-15'
    },
    
    // MARKETPLACE
    { 
      id: 'market-1', 
      type: 'marketplace', 
      title: 'MacBook Pro 13" 2021 M1', 
      city: 'New Haven', 
      state: 'CT',
      price: 950,
      condition: 'Excellent',
      coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop', 
      description: '8GB RAM, 256GB SSD, original charger included. Barely used.',
      postedDate: '2024-11-28'
    },
    { 
      id: 'market-2', 
      type: 'marketplace', 
      title: 'IKEA Study Desk & Chair Set', 
      city: 'New Haven', 
      state: 'CT',
      price: 120,
      condition: 'Good',
      coverImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop', 
      description: 'White desk with drawer, ergonomic chair. Pick up only.',
      postedDate: '2024-11-15'
    },
    { 
      id: 'market-3', 
      type: 'marketplace', 
      title: 'Computer Science Textbooks Bundle', 
      city: 'New Haven', 
      state: 'CT',
      price: 80,
      condition: 'Like New',
      coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop', 
      description: 'Algorithms, Data Structures, AI books. Great condition.',
      postedDate: '2024-10-30'
    },
    { 
      id: 'market-4', 
      type: 'marketplace', 
      title: 'Mountain Bike - Trek 2022', 
      city: 'New Haven', 
      state: 'CT',
      price: 450,
      condition: 'Good',
      coverImage: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&h=600&fit=crop', 
      description: '21-speed, well-maintained, helmet included.',
      postedDate: '2024-10-12'
    },
    { 
      id: 'market-5', 
      type: 'marketplace', 
      title: 'Kitchen Essentials Bundle', 
      city: 'New Haven', 
      state: 'CT',
      price: 60,
      condition: 'Excellent',
      coverImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop', 
      description: 'Pots, pans, utensils, plates. Everything you need to start cooking.',
      postedDate: '2024-09-25'
    },
    { 
      id: 'market-6', 
      type: 'marketplace', 
      title: 'Sony WH-1000XM4 Headphones', 
      city: 'New Haven', 
      state: 'CT',
      price: 220,
      condition: 'Excellent',
      coverImage: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=600&fit=crop', 
      description: 'Noise-cancelling, original box and case. Barely used.',
      postedDate: '2024-09-10'
    },
  ];

  // Premium nav config
  navSections: { id: ProfileSection; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'my-rooms', label: 'My Rooms', icon: '🏠' },
    { id: 'past-rides', label: 'My Rides', icon: '🚗' },
    { id: 'marketplace', label: 'My Marketplace', icon: '🛍️' },
    { id: 'saved', label: 'Saved', icon: '❤️' },
    { id: 'connections', label: 'Connections', icon: '🌍' },
    { id: 'verification', label: 'Verification', icon: '✅' },
    { id: 'preferences', label: 'Preferences', icon: '🛠️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'data', label: 'Your Data', icon: '📦' }
  ];

  // Computed metrics using API data
  metrics = computed(() => [
    { label: 'Rooms', value: this._myRooms().length || this.listings.filter(l=>l.type==='room').length },
    { label: 'Rides', value: this._myRides().length || this.listings.filter(l=>l.type==='ride').length },
    { label: 'Marketplace', value: this._myMarketplace().length || this.listings.filter(l=>l.type==='marketplace').length },
    { label: 'Connections', value: this.connections.length },
  ]);

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

  getInterestLabel(key: string): string {
    return this.interestChips.find(c => c.key === key)?.label || key;
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
    
    // Load user's listings and saved items from backend
    this.loadUserListings();
    this.loadSavedItems();
  }
  
  /**
   * Load all user listings from backend APIs
   */
  private loadUserListings() {
    const userId = this.user().id;
    
    // Load rooms
    this.loadingRooms.set(true);
    this.roomsApi.getRoomsByUser(userId).subscribe({
      next: (rooms) => {
        this._myRooms.set(rooms);
        this.loadingRooms.set(false);
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.loadingRooms.set(false);
        // Keep mock data for now if backend fails
      }
    });
    
    // Load rides
    this.loadingRides.set(true);
    this.ridesApi.getRidesByUser(userId).subscribe({
      next: (rides) => {
        this._myRides.set(rides);
        this.loadingRides.set(false);
      },
      error: (err) => {
        console.error('Failed to load rides:', err);
        this.loadingRides.set(false);
      }
    });
    
    // Load marketplace items
    this.loadingMarketplace.set(true);
    this.marketplaceApi.getItemsByUser(userId).subscribe({
      next: (items) => {
        this._myMarketplace.set(items);
        this.loadingMarketplace.set(false);
      },
      error: (err) => {
        console.error('Failed to load marketplace items:', err);
        this.loadingMarketplace.set(false);
      }
    });
  }
  
  /**
   * Load saved items from backend
   */
  private loadSavedItems() {
    this.loadingSaved.set(true);
    this.usersApi.getSavedItems().subscribe({
      next: (saved) => {
        this._savedItems.set(saved);
        this.loadingSaved.set(false);
      },
      error: (err) => {
        console.error('Failed to load saved items:', err);
        this.loadingSaved.set(false);
      }
    });
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

  // ----- Listing filter methods (convert API data to ListingCardItem format) -----
  roomListings = (): ListingCardItem[] => {
    const apiRooms = this._myRooms();
    if (apiRooms.length > 0) {
      return apiRooms.map(room => ({
        id: room.id || room.roomId,
        type: 'room' as const,
        title: room.title,
        city: room.city,
        state: room.state,
        price: room.price,
        coverImage: room.images?.[0] || room.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        description: room.description || room.notes,
        postedDate: room.createdAt
      }));
    }
    // Fallback to mock data
    return this.listings.filter(l => l.type === 'room');
  };
  
  rideListings = (): ListingCardItem[] => {
    const apiRides = this._myRides();
    if (apiRides.length > 0) {
      return apiRides.map(ride => ({
        id: ride.id || ride.rideId,
        type: 'ride' as const,
        title: `${ride.pickupAddress} → ${ride.dropoffAddress}`,
        city: ride.pickupAddress?.split(',')[0] || 'Unknown',
        state: '',
        destination: ride.dropoffAddress,
        price: ride.pricePerSeat || 0,
        seatsAvailable: ride.seatsAvailable,
        coverImage: ride.images?.[0] || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop',
        description: ride.notes,
        rideDate: ride.rideDate
      }));
    }
    // Fallback to mock data
    return this.listings.filter(l => l.type === 'ride');
  };
  
  marketplaceListings = (): ListingCardItem[] => {
    const apiItems = this._myMarketplace();
    if (apiItems.length > 0) {
      return apiItems.map(item => ({
        id: item.id || item.itemId,
        type: 'marketplace' as const,
        title: item.title,
        city: item.location,
        state: '',
        price: item.price,
        coverImage: item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
        description: item.description,
        condition: item.condition,
        category: item.category
      }));
    }
    // Fallback to mock data
    return this.listings.filter(l => l.type === 'marketplace');
  };

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
  
  /**
   * Unsave a room
   */
  unsaveRoom(roomId: string) {
    this.usersApi.unsaveRoom(roomId).subscribe({
      next: () => {
        const current = this._savedItems();
        this._savedItems.set({
          ...current,
          rooms: current.rooms.filter(id => id !== roomId)
        });
        this.toast.success('Room removed from saved items');
      },
      error: (err) => {
        console.error('Failed to unsave room:', err);
        this.toast.error('Failed to remove room');
      }
    });
  }
  
  /**
   * Unsave a ride
   */
  unsaveRide(rideId: string) {
    this.usersApi.unsaveRide(rideId).subscribe({
      next: () => {
        const current = this._savedItems();
        this._savedItems.set({
          ...current,
          rides: current.rides.filter(id => id !== rideId)
        });
        this.toast.success('Ride removed from saved items');
      },
      error: (err) => {
        console.error('Failed to unsave ride:', err);
        this.toast.error('Failed to remove ride');
      }
    });
  }
  
  /**
   * Unsave a marketplace item
   */
  unsaveMarketplace(itemId: string) {
    this.usersApi.unsaveMarketplaceItem(itemId).subscribe({
      next: () => {
        const current = this._savedItems();
        this._savedItems.set({
          ...current,
          marketplace: current.marketplace.filter(id => id !== itemId)
        });
        this.toast.success('Item removed from saved items');
      },
      error: (err) => {
        console.error('Failed to unsave item:', err);
        this.toast.error('Failed to remove item');
      }
    });
  }
}
