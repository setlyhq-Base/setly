import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserStore } from '../../core/state/user.store';

@Component({
  selector: 'app-profile-menu-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sheet-overlay" (click)="close()">
      <div class="sheet-container" (click)="$event.stopPropagation()">
        <!-- Sheet Handle -->
        <div class="sheet-handle"></div>
        
        <!-- User Info Header -->
        <div class="user-header">
          <img 
            [src]="userAvatarUrl()" 
            alt="Profile"
            class="user-avatar"
            (error)="onAvatarError($event)">
          <div class="user-info">
            <h3 class="user-name">{{ userName() }}</h3>
            <p class="user-email">{{ userEmail() }}</p>
          </div>
        </div>

        <!-- Menu Options -->
        <div class="menu-options">
          <button 
            type="button"
            class="menu-item"
            (click)="navigateToProfile()">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="menu-content">
              <div class="menu-label">View Profile</div>
              <div class="menu-sublabel">Your listings and activity</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="menu-chevron">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button 
            type="button"
            class="menu-item featured"
            (click)="openAssistant()">
            <div class="menu-icon ai-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="menu-content">
              <div class="menu-label">Ask Setly Assistant</div>
              <div class="menu-sublabel">Get help with housing, rides & more</div>
            </div>
            <div class="ai-badge">AI</div>
          </button>

          <button 
            type="button"
            class="menu-item"
            (click)="logout()">
            <div class="menu-icon logout-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="menu-content">
              <div class="menu-label">Logout</div>
              <div class="menu-sublabel">Sign out of your account</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Sheet Overlay */
    .sheet-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { 
        opacity: 0; 
      }
      to { 
        opacity: 1; 
      }
    }

    /* Sheet Container */
    .sheet-container {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      background: white;
      border-radius: 24px 24px 0 0;
      padding: 20px 20px 32px;
      padding-bottom: calc(32px + env(safe-area-inset-bottom, 0));
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
      animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform;
      max-height: 80vh;
      overflow-y: auto;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    /* Sheet Handle */
    .sheet-handle {
      width: 40px;
      height: 4px;
      background: #CBD5E1;
      border-radius: 2px;
      margin: 0 auto 24px;
    }

    /* User Header */
    .user-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-radius: 16px;
      margin-bottom: 20px;
      border: 1px solid #E2E8F0;
    }

    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      font-size: 14px;
      color: #64748B;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Menu Options */
    .menu-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 16px;
      background: white;
      border: 2px solid #E2E8F0;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }

    .menu-item:hover {
      background: #F8FAFC;
      border-color: #CBD5E1;
      transform: translateY(-1px);
    }

    .menu-item:active {
      transform: scale(0.98);
    }

    .menu-item.featured {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-color: #93C5FD;
      position: relative;
      overflow: hidden;
    }

    .menu-item.featured::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
      pointer-events: none;
    }

    .menu-item.featured:hover {
      background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
      border-color: #60A5FA;
    }

    .menu-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F8FAFC;
      border-radius: 12px;
      color: #64748B;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .menu-item:hover .menu-icon {
      background: #F1F5F9;
      color: #475569;
    }

    .ai-icon {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .menu-item.featured:hover .ai-icon {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    .logout-icon {
      background: #FEF2F2;
      color: #EF4444;
    }

    .menu-item:hover .logout-icon {
      background: #FEE2E2;
    }

    .menu-content {
      flex: 1;
      min-width: 0;
    }

    .menu-label {
      font-size: 16px;
      font-weight: 600;
      color: #0F172A;
      margin: 0 0 3px 0;
    }

    .menu-sublabel {
      font-size: 13px;
      color: #64748B;
      margin: 0;
      line-height: 1.3;
    }

    .menu-chevron {
      color: #94A3B8;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .menu-item:hover .menu-chevron {
      transform: translateX(2px);
    }

    .ai-badge {
      padding: 4px 10px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    /* Responsive */
    @media (min-width: 768px) {
      .sheet-container {
        border-radius: 24px;
        margin: auto;
        max-height: 70vh;
      }
    }
  `]
})
export class ProfileMenuSheetComponent {
  closed = output<void>();
  assistantRequested = output<void>();
  
  private authService = inject(AuthService);
  private userStore = inject(UserStore);
  private router = inject(Router);
  
  userAvatarUrl = signal<string>('');
  userName = signal<string>('User');
  userEmail = signal<string>('');

  constructor() {
    const user = this.userStore.user();
    if (user) {
      this.userAvatarUrl.set(user.photoUrl || '/default-avatar.svg');
      this.userName.set(user.name || 'User');
      this.userEmail.set(user.primaryEmail || '');
    }
  }

  close() {
    this.closed.emit();
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.close();
  }

  openAssistant() {
    this.assistantRequested.emit();
    this.close();
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/auth/sign-in']);
      this.close();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/default-avatar.svg';
  }
}
