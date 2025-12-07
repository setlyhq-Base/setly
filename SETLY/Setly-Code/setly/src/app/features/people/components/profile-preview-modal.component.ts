import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DummyUser } from '../../../core/services/dummy-people.service';

@Component({
  selector: 'app-profile-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
         *ngIf="user"
         (click)="onClose()">
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-premium-lg animate-scale-in"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="relative h-32 bg-gradient-to-r from-brand-midnight via-brand-azure to-brand-aqua">
          <button (click)="onClose()"
                  class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Profile Content -->
        <div class="px-6 pb-6 -mt-16">
          <!-- Avatar -->
          <div class="relative inline-block mb-4">
            <img [src]="user.avatarUrl || '/assets/default-avatar.svg'" 
                 class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"/>
            <span *ngIf="user.lastSeen"
                  class="absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white"
                  [class.bg-green-500]="isOnline"
                  [class.shadow-[0_0_12px_rgba(34,197,94,0.8)]]="isOnline"
                  [class.bg-blue-500]="!isOnline && isActive"
                  [class.bg-gray-400]="!isOnline && !isActive"></span>
          </div>

          <!-- Name & Tagline -->
          <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ user.name }}</h2>
          <p class="text-brand-azure font-medium mb-2" *ngIf="user.tagline">{{ user.tagline }}</p>
          <p class="text-gray-600 mb-4">
            <span *ngIf="user.organization">{{ user.organization }}</span>
            <span *ngIf="user.organization && user.location"> • </span>
            <span *ngIf="user.location">📍 {{ user.location }}</span>
          </p>

          <!-- Role Badges -->
          <div class="flex flex-wrap gap-2 mb-4" *ngIf="getUserRoles().length > 0">
            <span *ngFor="let role of getUserRoles()" 
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                  [ngClass]="getRoleBadgeClass(role)">
              <span [innerHTML]="getRoleIcon(role)"></span>
              {{ role }}
            </span>
          </div>

          <!-- Trust Score -->
          <div class="mb-6 p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center justify-between text-sm text-gray-700 mb-2">
              <span class="font-semibold">Trust Score</span>
              <span class="text-lg font-bold text-brand-azure">{{ trustScore }}%</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-brand-azure to-brand-aqua rounded-full transition-all duration-500"
                   [style.width.%]="trustScore"></div>
            </div>
          </div>

          <!-- About -->
          <div class="mb-6" *ngIf="user.about">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">About</h3>
            <p class="text-gray-600">{{ user.about }}</p>
          </div>

          <!-- Interests -->
          <div class="mb-6" *ngIf="user.interests && user.interests.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let interest of user.interests"
                    class="px-3 py-1.5 rounded-full text-sm bg-brand-gold/10 text-brand-midnight border border-brand-gold/20">
                {{ interest }}
              </span>
            </div>
          </div>

          <!-- Mutual Interests -->
          <div class="mb-6" *ngIf="user.mutualInterests && user.mutualInterests.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💫</span> Shared Interests
            </h3>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let interest of user.mutualInterests"
                    class="px-3 py-1.5 rounded-full text-sm bg-green-50 text-green-700 border border-green-200 font-medium">
                {{ interest }}
              </span>
            </div>
          </div>

          <!-- Verifications -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Verifications</h3>
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border"
                    [class.bg-green-50]="user.badges.email"
                    [class.border-green-200]="user.badges.email"
                    [class.text-green-700]="user.badges.email"
                    [class.bg-gray-50]="!user.badges.email"
                    [class.border-gray-200]="!user.badges.email"
                    [class.text-gray-500]="!user.badges.email">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="user.badges.email">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Email Verified
              </span>
              <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border"
                    [class.bg-green-50]="user.badges.phone"
                    [class.border-green-200]="user.badges.phone"
                    [class.text-green-700]="user.badges.phone"
                    [class.bg-gray-50]="!user.badges.phone"
                    [class.border-gray-200]="!user.badges.phone"
                    [class.text-gray-500]="!user.badges.phone">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="user.badges.phone">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Phone Verified
              </span>
              <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border"
                    [class.bg-green-50]="user.badges.university"
                    [class.border-green-200]="user.badges.university"
                    [class.text-green-700]="user.badges.university"
                    [class.bg-gray-50]="!user.badges.university"
                    [class.border-gray-200]="!user.badges.university"
                    [class.text-gray-500]="!user.badges.university">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="user.badges.university">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                University Email
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button (click)="onConnect()" class="flex-1 btn-primary py-3">
              Connect
            </button>
            <button (click)="onMessage()" class="flex-1 btn-secondary py-3">
              Message
            </button>
            <button (click)="onSave()" 
                    class="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    [class.border-brand-gold]="isSaved"
                    [class.bg-brand-gold/10]="isSaved">
              <svg class="w-6 h-6" [class.text-brand-gold]="isSaved" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ProfilePreviewModalComponent {
  @Input() user: DummyUser | null = null;
  @Input() isSaved: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() connect = new EventEmitter<DummyUser>();
  @Output() message = new EventEmitter<DummyUser>();
  @Output() save = new EventEmitter<DummyUser>();

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    this.onClose();
  }

  get isOnline(): boolean {
    if (!this.user?.lastSeen) return false;
    const lastSeenTime = new Date(this.user.lastSeen).getTime();
    const diffMinutes = (Date.now() - lastSeenTime) / (1000 * 60);
    return diffMinutes <= 5;
  }

  get isActive(): boolean {
    if (!this.user?.lastSeen) return false;
    const lastSeenTime = new Date(this.user.lastSeen).getTime();
    const diffMinutes = (Date.now() - lastSeenTime) / (1000 * 60);
    return diffMinutes <= 60;
  }

  get trustScore(): number {
    if (!this.user) return 0;
    let score = 0;
    if (this.user.badges?.email) score += 25;
    if (this.user.badges?.phone) score += 25;
    if (this.user.badges?.university) score += 30;
    if (this.user.badges?.photo) score += 20;
    return score;
  }

  getUserRoles(): string[] {
    if (!this.user) return [];
    const roles: string[] = [];
    if (this.user.hasRoom) roles.push('Host');
    if (this.user.offersRides) roles.push('Driver');
    if (this.user.isTrader) roles.push('Trader');
    if (this.user.isGuide) roles.push('Guide');
    if (this.user.isSenior) roles.push('Senior');
    if (this.user.role === 'Student') roles.push('Student');
    return roles;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'Host': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Driver': 'bg-green-50 text-green-700 border border-green-200',
      'Trader': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Guide': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Senior': 'bg-gray-50 text-gray-700 border border-gray-200',
      'Student': 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    };
    return classes[role] || 'bg-gray-50 text-gray-700 border border-gray-200';
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'Host': '🏠',
      'Driver': '🚗',
      'Trader': '📦',
      'Guide': '🗺️',
      'Senior': '🎓',
      'Student': '📚'
    };
    return icons[role] || '✨';
  }

  onClose() {
    this.close.emit();
  }

  onConnect() {
    if (this.user) {
      this.connect.emit(this.user);
    }
  }

  onMessage() {
    if (this.user) {
      this.message.emit(this.user);
    }
  }

  onSave() {
    if (this.user) {
      this.save.emit(this.user);
    }
  }
}
