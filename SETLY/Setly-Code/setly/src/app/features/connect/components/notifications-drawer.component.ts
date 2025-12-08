import { Component, EventEmitter, Output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  type: 'connect' | 'message' | 'ride' | 'room' | 'system';
  title: string;
  message: string;
  time: string;
  photo?: string;
  read: boolean;
  action?: string;
}

@Component({
  selector: 'app-notifications-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-overlay" (click)="close.emit()">
      <div class="notifications-drawer" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="drawer-header">
          <h2>Notifications</h2>
          <button (click)="close.emit()" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button 
            *ngFor="let tab of tabs" 
            [class.active]="activeTab() === tab"
            (click)="activeTab.set(tab)"
            class="tab">
            {{ tab }}
            <span *ngIf="tab === 'All' && unreadCount() > 0" class="badge">{{ unreadCount() }}</span>
          </button>
        </div>

        <!-- Notifications List -->
        <div class="notifications-list">
          <div *ngIf="filteredNotifications().length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>No notifications yet</p>
            <small>You're all caught up!</small>
          </div>

          <div 
            *ngFor="let notification of filteredNotifications()" 
            class="notification-item"
            [class.unread]="!notification.read"
            (click)="markAsRead(notification.id)">
            
            <!-- Icon or Photo -->
            <div class="notification-icon" [ngClass]="'type-' + notification.type">
              <img *ngIf="notification.photo" [src]="notification.photo" [alt]="notification.title">
              <svg *ngIf="!notification.photo && notification.type === 'connect'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM20 8v6M23 11h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg *ngIf="!notification.photo && notification.type === 'message'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg *ngIf="!notification.photo && notification.type === 'ride'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M16 8v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg *ngIf="!notification.photo && notification.type === 'room'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg *ngIf="!notification.photo && notification.type === 'system'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Content -->
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="time">{{ notification.time }}</span>
            </div>

            <!-- Unread Dot -->
            <div *ngIf="!notification.read" class="unread-dot"></div>

            <!-- Action Button -->
            <button *ngIf="notification.action" class="action-btn">
              {{ notification.action }}
            </button>
          </div>
        </div>

        <!-- Mark All as Read -->
        <div class="drawer-footer" *ngIf="unreadCount() > 0">
          <button (click)="markAllAsRead()" class="mark-all-btn">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }

    .notifications-drawer {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      max-width: 420px;
      height: 100%;
      background: white;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @media (max-width: 640px) {
      .notifications-drawer {
        max-width: 100%;
      }
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .drawer-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: #f3f4f6;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:active {
      transform: scale(0.95);
      background: #e5e7eb;
    }

    .tabs {
      display: flex;
      gap: 4px;
      padding: 12px 16px 0;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tabs::-webkit-scrollbar {
      display: none;
    }

    .tab {
      position: relative;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tab.active {
      color: #3b82f6;
      background: #eff6ff;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 700;
    }

    .notifications-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      color: #9ca3af;
    }

    .empty-state svg {
      margin-bottom: 16px;
      opacity: 0.4;
    }

    .empty-state p {
      font-size: 16px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 8px 0;
    }

    .empty-state small {
      font-size: 14px;
      color: #9ca3af;
    }

    .notification-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
    }

    .notification-item:hover {
      background: #f9fafb;
    }

    .notification-item:active {
      transform: scale(0.98);
      background: #f3f4f6;
    }

    .notification-item.unread {
      background: #eff6ff;
    }

    .notification-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #f3f4f6;
      color: #6b7280;
    }

    .notification-icon img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .notification-icon.type-connect {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    .notification-icon.type-message {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .notification-icon.type-ride {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .notification-icon.type-room {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
    }

    .notification-icon.type-system {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-content h4 {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
      line-height: 1.4;
    }

    .notification-content p {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 4px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .time {
      font-size: 12px;
      color: #9ca3af;
      font-weight: 500;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      flex-shrink: 0;
      margin-top: 8px;
    }

    .action-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #3b82f6;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .action-btn:active {
      transform: scale(0.95);
      background: #f3f4f6;
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    .mark-all-btn {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: #f3f4f6;
      color: #374151;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mark-all-btn:active {
      transform: scale(0.98);
      background: #e5e7eb;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class NotificationsDrawerComponent {
  @Output() close = new EventEmitter<void>();

  tabs = ['All', 'Connect', 'Messages', 'Updates'];
  activeTab = signal<string>('All');
  
  // Mock notifications - replace with real data from service
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'connect',
      title: 'New connection request',
      message: 'Sarah Chen wants to connect with you',
      time: '2m ago',
      photo: 'https://i.pravatar.cc/150?img=5',
      read: false,
      action: 'Accept'
    },
    {
      id: '2',
      type: 'message',
      title: 'New message from Mike',
      message: 'Hey! Are you still looking for a roommate?',
      time: '15m ago',
      photo: 'https://i.pravatar.cc/150?img=12',
      read: false,
      action: 'Reply'
    },
    {
      id: '3',
      type: 'ride',
      title: 'Ride request accepted',
      message: 'Emma Davis accepted your ride to Boston',
      time: '1h ago',
      photo: 'https://i.pravatar.cc/150?img=45',
      read: true
    },
    {
      id: '4',
      type: 'room',
      title: 'New room match',
      message: 'Found 3 new rooms matching your preferences',
      time: '3h ago',
      read: true,
      action: 'View'
    },
    {
      id: '5',
      type: 'connect',
      title: 'Alex liked your profile',
      message: 'Alex Thompson is interested in connecting',
      time: '5h ago',
      photo: 'https://i.pravatar.cc/150?img=33',
      read: true
    },
    {
      id: '6',
      type: 'system',
      title: 'Profile verification complete',
      message: 'Your university email has been verified ✓',
      time: '1d ago',
      read: true
    }
  ]);

  filteredNotifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Initialize filtered notifications and count
    this.updateFiltered();
    effect(() => {
      this.activeTab();
      this.updateFiltered();
    });
  }

  updateFiltered() {
    const tab = this.activeTab();
    const all = this.notifications();
    
    if (tab === 'All') {
      this.filteredNotifications.set(all);
    } else if (tab === 'Connect') {
      this.filteredNotifications.set(all.filter(n => n.type === 'connect'));
    } else if (tab === 'Messages') {
      this.filteredNotifications.set(all.filter(n => n.type === 'message'));
    } else if (tab === 'Updates') {
      this.filteredNotifications.set(all.filter(n => ['ride', 'room', 'system'].includes(n.type)));
    }
    
    this.unreadCount.set(all.filter(n => !n.read).length);
  }

  markAsRead(id: string) {
    this.notifications.update(items => 
      items.map(item => item.id === id ? { ...item, read: true } : item)
    );
    this.updateFiltered();
  }

  markAllAsRead() {
    this.notifications.update(items => 
      items.map(item => ({ ...item, read: true }))
    );
    this.updateFiltered();
  }
}
