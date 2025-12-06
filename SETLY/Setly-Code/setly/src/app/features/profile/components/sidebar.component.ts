import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProfileSection =
  | 'overview'
  | 'my-rooms'
  | 'past-rides'
  | 'connections'
  | 'verification'
  | 'verification'
  | 'preferences'
  | 'settings'
  | 'data';

interface NavItem {
  key: ProfileSection;
  label: string;
  icon: string; // emoji placeholder; can be replaced with lucide icons later
}

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
      <nav class="rounded-2xl bg-[#0B0B0F] border border-gray-800 shadow-sm">
        <button
          *ngFor="let item of items; let i = index"
          (click)="select(item.key)"
          class="relative w-full flex items-center gap-3 px-5 py-3 text-left transition text-gray-300 hover:bg-[#131318] overflow-hidden sidebar-btn"
          [class.active]="active === item.key"
        >
          <span *ngIf="active === item.key" class="active-bar" aria-hidden="true"></span>
          <span class="text-lg leading-[1.2]">{{ item.icon }}</span>
          <span class="font-medium leading-[1.2]">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Mobile drawer placeholder -->
    <div class="lg:hidden -mx-4 mb-4">
      <div class="flex overflow-x-auto no-scrollbar gap-2 px-1">
        <button
          *ngFor="let item of items"
          (click)="select(item.key)"
          class="px-3 py-2 rounded-full text-sm border bg-[#0B0B0F] text-gray-300 border-gray-800"
          [class.bg-[#1a1b21]]="active === item.key"
          [class.text-white]="active === item.key"
          [class.border-transparent]="active === item.key"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
  .active-bar { position:absolute; left:6px; top:50%; transform:translateY(-50%); width:4px; height:24px; border-radius:4px; background: var(--brand-gold); box-shadow:0 0 18px rgba(245,199,93,.45); }
  .sidebar-btn { border-bottom:1px solid rgba(255,255,255,0.08); }
  .sidebar-btn:last-child { border-bottom:none; }
  .sidebar-btn.active { background:#1a1b21; color:#fff; }
  .sidebar-btn.active .text-lg { filter:none; }
  `]
})
export class ProfileSidebarComponent {
  @Input() active: ProfileSection = 'overview';
  @Output() sectionChange = new EventEmitter<ProfileSection>();

  items: NavItem[] = [
    { key: 'overview', label: 'Profile Overview', icon: '👤' },
    { key: 'my-rooms', label: 'My Rooms & Listings', icon: '🏠' },
    { key: 'past-rides', label: 'Past Rides', icon: '🚗' },
    { key: 'connections', label: 'Connections', icon: '🌍' },
    { key: 'verification', label: 'Verification', icon: '✅' },
    { key: 'preferences', label: 'Preferences', icon: '🛠️' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    { key: 'data', label: 'Your Data', icon: '📦' },
  ];

  select(key: ProfileSection) {
    this.sectionChange.emit(key);
  }
}
