import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastService } from '../../../core/services/toast.service';

interface NearbyPerson {
  id: string;
  name: string;
  avatarUrl?: string;
  university: string;
  year?: string;
  distance?: string;
  interests: string[];
  verified: {
    email?: boolean;
    phone?: boolean;
    university?: boolean;
    photo?: boolean;
  };
  mutuals?: number;
  isOnline?: boolean;
}

@Component({
  selector: 'app-people-near-you',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="people-near-you">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4 px-1">
        <div class="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-[#3E8FFF]">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
            <path d="M6 20c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="19" cy="19" r="3" fill="currentColor"/>
          </svg>
          <h2 class="text-base font-semibold text-[#0A1A3F]">People Near You</h2>
        </div>
        <button 
          (click)="viewAll()"
          class="text-xs text-[#3E8FFF] font-medium hover:underline">
          See All
        </button>
      </div>

      <!-- Horizontal Scroll Cards -->
      <div class="people-scroll">
        <div class="people-container">
          <div 
            *ngFor="let person of nearbyPeople()"
            class="person-card"
            (click)="viewProfile(person)">
            
            <!-- Avatar with Online Status -->
            <div class="person-avatar-wrapper">
              <div class="person-avatar">
                <img 
                  *ngIf="person.avatarUrl; else initials"
                  [src]="person.avatarUrl" 
                  [alt]="person.name"
                  class="avatar-img">
                <ng-template #initials>
                  <div class="avatar-initials">
                    {{person.name[0] || 'S'}}
                  </div>
                </ng-template>
                
                <!-- Online Indicator -->
                <span 
                  *ngIf="person.isOnline" 
                  class="online-indicator"
                  aria-label="Online"></span>
              </div>
              
              <!-- Distance Badge -->
              <div *ngIf="person.distance" class="distance-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.5 2 5.5 4.8 5.5 8.2c0 5.4 6.5 11.8 6.5 11.8s6.5-6.4 6.5-11.8C18.5 4.8 15.5 2 12 2z" fill="currentColor"/>
                  <circle cx="12" cy="8" r="2" fill="white"/>
                </svg>
                <span>{{person.distance}}</span>
              </div>
            </div>

            <!-- Person Info -->
            <div class="person-info">
              <div class="person-name">{{person.name}}</div>
              <div class="person-university">{{person.university}}</div>
              <div *ngIf="person.year" class="person-year">{{person.year}}</div>
            </div>

            <!-- Verification Badges -->
            <div class="verification-row">
              <span 
                *ngIf="person.verified.university" 
                class="verify-badge university"
                title="University Verified">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4M12 2l10 5v6c0 5-4 9-10 11C6 22 2 18 2 13V7l10-5z"/>
                </svg>
              </span>
              <span 
                *ngIf="person.verified.photo" 
                class="verify-badge photo"
                title="Photo Verified">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5L11 16l2.5-3 3.5 4.5H7l1.5-4z"/>
                </svg>
              </span>
            </div>

            <!-- Mutual Connections -->
            <div *ngIf="person.mutuals" class="mutuals-badge">
              {{person.mutuals}} mutual{{person.mutuals > 1 ? 's' : ''}}
            </div>

            <!-- Interest Tags -->
            <div class="interest-tags">
              <span 
                *ngFor="let interest of person.interests.slice(0, 2)"
                class="interest-tag">
                {{interest}}
              </span>
              <span 
                *ngIf="person.interests.length > 2"
                class="interest-more">
                +{{person.interests.length - 2}}
              </span>
            </div>

            <!-- Connect Button -->
            <button 
              (click)="connectWithPerson($event, person)"
              class="connect-btn"
              [attr.aria-label]="'Connect with ' + person.name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 108 0 4 4 0 00-8 0M20 8v6M23 11h-6"/>
              </svg>
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .people-near-you {
      margin-bottom: 32px;
    }

    .people-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .people-scroll::-webkit-scrollbar {
      display: none;
    }

    .people-container {
      display: flex;
      gap: 16px;
      padding: 4px 0 12px;
    }

    .person-card {
      flex-shrink: 0;
      width: 180px;
      background: white;
      border: 1px solid #ECECEC;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      box-shadow: 0 2px 8px -2px rgba(10, 26, 63, 0.06);
    }

    .person-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px -8px rgba(62, 143, 255, 0.25),
                  0 8px 16px -4px rgba(10, 26, 63, 0.12);
      border-color: rgba(62, 143, 255, 0.4);
    }

    .person-card:active {
      transform: translateY(-2px);
    }

    .person-avatar-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
    }

    .person-avatar {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(62, 143, 255, 0.2);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      color: white;
      font-size: 28px;
      font-weight: 600;
    }

    .online-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .distance-badge {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 3px 8px;
      background: rgba(62, 143, 255, 0.95);
      backdrop-filter: blur(8px);
      color: white;
      font-size: 10px;
      font-weight: 600;
      border-radius: 12px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(62, 143, 255, 0.3);
    }

    .person-info {
      text-align: center;
      width: 100%;
    }

    .person-name {
      font-size: 14px;
      font-weight: 600;
      color: #0A1A3F;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .person-university {
      font-size: 11px;
      color: #6F7785;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .person-year {
      font-size: 10px;
      color: #9CA3AF;
      margin-top: 2px;
    }

    .verification-row {
      display: flex;
      gap: 6px;
      justify-content: center;
    }

    .verify-badge {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .verify-badge.university {
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
    }

    .verify-badge.photo {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    }

    .mutuals-badge {
      font-size: 10px;
      color: #3E8FFF;
      background: rgba(62, 143, 255, 0.08);
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 600;
      border: 1px solid rgba(62, 143, 255, 0.2);
    }

    .interest-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      width: 100%;
    }

    .interest-tag {
      font-size: 10px;
      padding: 4px 8px;
      background: #F3F4F6;
      color: #374151;
      border-radius: 8px;
      font-weight: 500;
    }

    .interest-more {
      font-size: 10px;
      padding: 4px 8px;
      background: #E8F4FF;
      color: #3E8FFF;
      border-radius: 8px;
      font-weight: 600;
    }

    .connect-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px -2px rgba(62, 143, 255, 0.4);
    }

    .connect-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px -4px rgba(62, 143, 255, 0.5);
    }

    .connect-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 640px) {
      .person-card {
        width: 160px;
        padding: 14px;
      }

      .person-avatar {
        width: 70px;
        height: 70px;
      }
    }
  `]
})
export class PeopleNearYouComponent {
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private toast = inject(ToastService);

  @Output() personConnected = new EventEmitter<string>();

  nearbyPeople = signal<NearbyPerson[]>([
    {
      id: '1',
      name: 'Sarah Mitchell',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      university: 'Boston University',
      year: 'Junior',
      distance: '0.3 mi',
      interests: ['Housing', 'Study', 'Gym'],
      verified: { email: true, phone: true, university: true, photo: true },
      mutuals: 3,
      isOnline: true
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      university: 'MIT',
      year: 'Sophomore',
      distance: '0.5 mi',
      interests: ['Tech', 'Gaming', 'Food'],
      verified: { email: true, university: true, photo: true },
      mutuals: 5,
      isOnline: false
    },
    {
      id: '3',
      name: 'Priya Kapoor',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      university: 'Harvard',
      year: 'Senior',
      distance: '0.8 mi',
      interests: ['Research', 'Coffee', 'Books'],
      verified: { email: true, phone: true, university: true },
      mutuals: 2,
      isOnline: true
    },
    {
      id: '4',
      name: 'Jake Patterson',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      university: 'Northeastern',
      year: 'Freshman',
      distance: '1.2 mi',
      interests: ['Sports', 'Music', 'Travel'],
      verified: { email: true, university: true },
      isOnline: false
    },
    {
      id: '5',
      name: 'Emma Rodriguez',
      avatarUrl: 'https://i.pravatar.cc/150?img=24',
      university: 'Boston College',
      year: 'Junior',
      distance: '1.5 mi',
      interests: ['Art', 'Dance', 'Photography'],
      verified: { email: true, phone: true, photo: true },
      mutuals: 1,
      isOnline: true
    }
  ]);

  viewProfile(person: NearbyPerson) {
    this.analytics.fire('nearby_person_viewed', { personId: person.id });
    this.router.navigate(['/profile', person.id]);
  }

  connectWithPerson(event: Event, person: NearbyPerson) {
    event.stopPropagation();
    this.analytics.fire('connect_clicked', { 
      personId: person.id,
      source: 'nearby_people_carousel'
    });
    
    this.toast.show('Connection request sent to ' + person.name, 'success');
    this.personConnected.emit(person.id);
  }

  viewAll() {
    this.analytics.fire('nearby_people_view_all_clicked');
    this.router.navigate(['/connect'], { queryParams: { tab: 'People', nearby: true } });
  }
}
