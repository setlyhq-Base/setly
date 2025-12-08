import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonPost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-person-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  template: `
  <article 
    class="premium-person-card" 
    role="article" 
    [attr.aria-label]="post.name" 
    (mouseenter)="hover.set(true)" 
    (mouseleave)="hover.set(false)"
    (click)="opened.emit()">
    
    <!-- Header with Avatar and Info -->
    <div class="card-header">
      <div class="avatar-section">
        <!-- Large Avatar -->
        <div class="avatar-wrapper">
          <img 
            *ngIf="post.avatarUrl; else init" 
            [src]="post.avatarUrl" 
            alt="{{post.name}} avatar" 
            class="avatar-image"
            loading="lazy">
          <ng-template #init>
            <div class="avatar-initials">{{ post.name[0] || 'S' }}</div>
          </ng-template>
          
          <!-- Online Status -->
          <span 
            *ngIf="post.presence==='online'" 
            class="online-status"
            aria-label="Online"></span>
          
          <!-- Verification Badge Overlay -->
          <div *ngIf="post.verified.university" class="verification-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 12l2 2 4-4M12 2l10 5v6c0 5-4 9-10 11C6 22 2 18 2 13V7l10-5z"/>
            </svg>
          </div>
        </div>

        <!-- Name and University -->
        <div class="person-info">
          <div class="person-name">
            {{post.name}}
            <svg *ngIf="post.verified.photo" width="16" height="16" viewBox="0 0 24 24" fill="none" class="inline ml-1">
              <path d="M9 12l2 2 4-4" stroke="#3E8FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#3E8FFF" stroke-width="2"/>
            </svg>
          </div>
          <div class="person-meta">
            <span *ngIf="post.university">{{post.university}}</span>
            <span *ngIf="post.company" class="meta-separator">•</span>
            <span *ngIf="post.company">{{post.company}}</span>
          </div>
        </div>
      </div>

      <!-- Actions Dropdown -->
      <div class="card-actions">
        <button class="action-menu-btn" (click)="$event.stopPropagation(); toggleMenu()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <div *ngIf="menuOpen()" class="action-menu" (click)="$event.stopPropagation()">
          <button (click)="hide()" class="menu-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 3l18 18M3 12a9 9 0 0118 0" stroke="currentColor" stroke-width="2"/>
            </svg>
            Hide
          </button>
          <button (click)="report()" class="menu-item danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            Report
          </button>
        </div>
      </div>
    </div>

    <!-- Mutual Connections -->
    <div *ngIf="post.mutuals" class="mutuals-section">
      <div class="mutuals-avatars">
          <div class="mutual-avatar" *ngFor="let i of [1,2,3].slice(0, getMutualsCount())"></div>
      </div>
      <span class="mutuals-text">{{post.mutuals}} mutual connection{{post.mutuals > 1 ? 's' : ''}}</span>
    </div>

    <!-- Interests Tags -->
    <div class="interests-section">
      <span *ngFor="let interest of interests()" class="interest-tag">
        {{interest}}
      </span>
    </div>

    <!-- Verification Status -->
    <div class="verification-section">
      <div class="verification-item" [class.verified]="post.verified.email">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M4 9l8 5 8-5" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Email</span>
      </div>
      <div class="verification-item" [class.verified]="post.verified.phone">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M12 18h.01" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Phone</span>
      </div>
      <div class="verification-item" [class.verified]="post.verified.university">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M22 10v6M6 12h.01M2 12l10-8 10 8-10 8-10-8z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>University</span>
      </div>
      <div class="verification-item" [class.verified]="post.verified.photo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Photo</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button 
        *ngIf="!connected()" 
        (click)="$event.stopPropagation(); connect()" 
        class="connect-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 108 0 4 4 0 00-8 0M20 8v6M23 11h-6"/>
        </svg>
        Connect
      </button>
      
      <button 
        *ngIf="connected()" 
        (click)="$event.stopPropagation(); message()" 
        class="message-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        Message
      </button>

      <button 
        class="view-profile-btn"
        (click)="$event.stopPropagation(); opened.emit()">
        View Profile
      </button>
    </div>

    <!-- Connected Status -->
    <div *ngIf="connected()" class="connected-status">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>Connected • {{post.createdAt | timeAgo}}</span>
    </div>
  </article>
  `
  ,
  styles: [`
    .premium-person-card {
      background: white;
      border: 1.5px solid #ECECEC;
      border-radius: 20px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 12px -4px rgba(10, 26, 63, 0.08);
      position: relative;
      overflow: hidden;
    }

    .premium-person-card::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(135deg, #3E8FFF 0%, #60A5FA 100%);
      border-radius: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .premium-person-card:hover {
      transform: translateY(-4px);
      border-color: rgba(62, 143, 255, 0.3);
      box-shadow: 0 12px 32px -8px rgba(62, 143, 255, 0.25),
                  0 8px 20px -4px rgba(10, 26, 63, 0.12);
    }

    .premium-person-card:hover::before {
      opacity: 0.08;
    }

    /* Header */
    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .avatar-section {
      display: flex;
      gap: 16px;
      flex: 1;
      min-width: 0;
    }

    .avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      object-fit: cover;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.15);
    }

    .avatar-initials {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.2);
    }

    .online-status {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .verification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(62, 143, 255, 0.4);
    }

    .person-info {
      flex: 1;
      min-width: 0;
    }

    .person-name {
      font-size: 18px;
      font-weight: 700;
      color: #0A1A3F;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .person-meta {
      font-size: 13px;
      color: #6F7785;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .meta-separator {
      color: #D1D5DB;
    }

    /* Actions Menu */
    .card-actions {
      position: relative;
    }

    .action-menu-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6F7785;
      transition: all 0.2s ease;
    }

    .action-menu-btn:hover {
      background: #F3F4F6;
      color: #0A1A3F;
    }

    .action-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      box-shadow: 0 8px 24px -4px rgba(10, 26, 63, 0.15);
      z-index: 10;
      min-width: 140px;
      overflow: hidden;
    }

    .menu-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #0A1A3F;
      text-align: left;
      transition: background 0.2s ease;
    }

    .menu-item:hover {
      background: #F9FAFB;
    }

    .menu-item.danger {
      color: #DC2626;
    }

    .menu-item.danger:hover {
      background: #FEF2F2;
    }

    /* Mutuals */
    .mutuals-section {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(62, 143, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(62, 143, 255, 0.1);
    }

    .mutuals-avatars {
      display: flex;
      margin-left: 4px;
    }

    .mutual-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3E8FFF 0%, #60A5FA 100%);
      border: 2px solid white;
      margin-left: -8px;
    }

    .mutual-avatar:first-child {
      margin-left: 0;
    }

    .mutuals-text {
      font-size: 13px;
      font-weight: 600;
      color: #3E8FFF;
    }

    /* Interests */
    .interests-section {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .interest-tag {
      padding: 6px 12px;
      background: #F3F4F6;
      color: #374151;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .interest-tag:hover {
      background: #E8F4FF;
      color: #3E8FFF;
    }

    /* Verification */
    .verification-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .verification-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: #F9FAFB;
      border: 1.5px solid #E5E7EB;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      color: #6F7785;
      transition: all 0.2s ease;
    }

    .verification-item.verified {
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      border-color: #10B981;
      color: #059669;
    }

    .verification-item.verified svg {
      color: #10B981;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }

    .connect-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px -2px rgba(62, 143, 255, 0.4);
    }

    .connect-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px -4px rgba(62, 143, 255, 0.5);
    }

    .message-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      background: white;
      color: #3E8FFF;
      border: 2px solid #3E8FFF;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .message-btn:hover {
      background: rgba(62, 143, 255, 0.05);
      transform: translateY(-2px);
    }

    .view-profile-btn {
      flex: 1;
      padding: 14px 20px;
      background: #F9FAFB;
      color: #0A1A3F;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .view-profile-btn:hover {
      background: white;
      border-color: #3E8FFF;
      color: #3E8FFF;
    }

    /* Connected Status */
    .connected-status {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      padding: 10px;
      background: rgba(16, 185, 129, 0.08);
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      color: #059669;
    }

    .connected-status svg {
      color: #10B981;
    }

    @media (max-width: 640px) {
      .premium-person-card {
        padding: 20px;
      }

      .avatar-image,
      .avatar-initials {
        width: 56px;
        height: 56px;
      }

      .avatar-initials {
        font-size: 20px;
      }

      .person-name {
        font-size: 16px;
      }

      .verification-section {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class PostPersonCardComponent implements OnInit {
  private feed = inject(ConnectFeedService);
  private analytics = inject(AnalyticsService);
  private toast = inject(ToastService);

  @Input() post!: PersonPost;
  @Output() opened = new EventEmitter<void>();
  hover = signal(false);
  connected = signal(false);
  interests = signal<string[]>([]);
  menuOpen = signal(false);

  ngOnInit(){
    // Derive mock interests from tags/university
    const base: string[] = [];
    if (this.post.university) base.push(this.post.university.split(' ')[0]);
    if (this.post.company) base.push('Work');
    (this.post as any).tags?.forEach((t: string) => base.push(t));
    if (!base.length) base.push('Community');
    this.interests.set(Array.from(new Set(base)).slice(0,4));
  }

  connect(){
    this.connected.set(true);
    this.toast.success('Connected ✔');
    this.analytics.track('person_connect_clicked', { id: this.post.id });
  }
  message(){ this.toast.info('Opening chat'); this.analytics.track('person_message_clicked', { id: this.post.id }); }
  hide(){ this.menuOpen.set(false); this.feed.hide(this.post.id); this.toast.info('Person hidden'); }
  report(){ this.menuOpen.set(false); this.feed.report(this.post.id); this.toast.warning('Reported'); }
  toggleMenu(){ this.menuOpen.update(v => !v); }

  getMutualsCount(): number {
    return Math.min(this.post.mutuals || 0, 3);
  }
}
