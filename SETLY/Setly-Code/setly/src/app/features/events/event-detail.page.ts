import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventCardComponent } from './components/event-card.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  template: `
    <div class="event-detail-page">
      <!-- Header -->
      <div class="detail-header">
        <button class="back-button" (click)="goBack()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-actions">
          <button class="action-button" (click)="toggleSaved()">
            <svg width="24" height="24" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button class="action-button" (click)="shareEvent()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Hero Image -->
      <div class="hero-image">
        <img [src]="event().image" [alt]="event().title">
        <div class="image-gradient"></div>
        @if (event().isFree) {
          <div class="free-badge">Free</div>
        }
      </div>

      <!-- Event Info -->
      <div class="event-content">
        <!-- Title & Price -->
        <div class="event-title-section">
          <h1 class="event-title">{{ event().title }}</h1>
          @if (!event().isFree) {
            <div class="event-price">\${{ event().price }}</div>
          }
        </div>

        <!-- Quick Info Cards -->
        <div class="info-cards">
          <!-- Date & Time -->
          <div class="info-card">
            <div class="info-icon date">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Date & Time</span>
              <span class="info-value">{{ event().date }}</span>
              <span class="info-detail">{{ event().time }}</span>
            </div>
          </div>

          <!-- Location -->
          <div class="info-card">
            <div class="info-icon location">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Location</span>
              <span class="info-value">{{ event().location }}</span>
              <span class="info-detail">{{ event().distance }} away</span>
            </div>
          </div>
        </div>

        <!-- Organizer -->
        <div class="organizer-section">
          <div class="organizer-header">
            <span class="section-label">Hosted By</span>
          </div>
          <div class="organizer-card">
            <img [src]="event().organizer.avatar" [alt]="event().organizer.name" class="organizer-avatar">
            <div class="organizer-info">
              <span class="organizer-name">{{ event().organizer.name }}</span>
              <span class="organizer-followers">{{ event().organizer.followers }} followers</span>
            </div>
            <button class="follow-button" [class.following]="isFollowing()" (click)="toggleFollow()">
              {{ isFollowing() ? 'Following' : 'Follow' }}
            </button>
          </div>
        </div>

        <!-- Attendees -->
        <div class="attendees-section">
          <div class="attendees-header">
            <span class="section-label">{{ event().attendees }} people going</span>
          </div>
          <div class="attendees-avatars">
            <div class="avatar-stack">
              <img src="https://i.pravatar.cc/150?img=1" alt="Attendee" class="attendee-avatar">
              <img src="https://i.pravatar.cc/150?img=2" alt="Attendee" class="attendee-avatar">
              <img src="https://i.pravatar.cc/150?img=3" alt="Attendee" class="attendee-avatar">
              <img src="https://i.pravatar.cc/150?img=4" alt="Attendee" class="attendee-avatar">
              <div class="attendee-avatar more">+{{ event().attendees - 4 }}</div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="description-section">
          <h3 class="section-title">About This Event</h3>
          <p class="description-text">{{ event().description }}</p>
        </div>

        <!-- Similar Events -->
        <div class="similar-events-section">
          <h3 class="section-title">Similar Events</h3>
          <div class="similar-events-grid">
            <app-event-card 
              *ngFor="let similarEvent of similarEvents()"
              [event]="similarEvent"
              (cardClick)="openEventDetail(similarEvent.id)" />
          </div>
        </div>
      </div>

      <!-- Fixed Bottom CTA -->
      <div class="bottom-cta">
        <button class="attend-button" [class.attending]="isAttending()" (click)="toggleAttending()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            @if (isAttending()) {
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            } @else {
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            }
          </svg>
          @if (isAttending()) {
            You're Going!
          } @else {
            I'm Going
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .event-detail-page {
      min-height: 100vh;
      background: #FAFAFA;
      padding-bottom: 90px;
    }

    /* Header */
    .detail-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      z-index: 50;
    }

    .back-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 50%;
      color: #111827;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-button:hover {
      background: #F9FAFB;
      transform: scale(1.05);
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .action-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 50%;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-button:hover {
      background: #F9FAFB;
      color: #111827;
      transform: scale(1.05);
    }

    /* Hero Image */
    .hero-image {
      position: relative;
      width: 100%;
      height: 400px;
      margin-top: 56px;
      overflow: hidden;
    }

    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    }

    .free-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      padding: 8px 16px;
      background: #10B981;
      color: white;
      font-size: 14px;
      font-weight: 700;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    /* Event Content */
    .event-content {
      padding: 20px;
    }

    .event-title-section {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

    .event-title {
      flex: 1;
      font-size: 28px;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
      margin: 0;
    }

    .event-price {
      font-size: 28px;
      font-weight: 800;
      color: #3B82F6;
      flex-shrink: 0;
    }

    /* Info Cards */
    .info-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .info-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .info-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .info-icon.date {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      color: #3B82F6;
    }

    .info-icon.location {
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
      color: #F59E0B;
    }

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-value {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
    }

    .info-detail {
      font-size: 14px;
      color: #6B7280;
    }

    /* Section Label */
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Organizer Section */
    .organizer-section {
      margin-bottom: 24px;
    }

    .organizer-header {
      margin-bottom: 12px;
    }

    .organizer-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .organizer-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #E5E7EB;
    }

    .organizer-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .organizer-name {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
    }

    .organizer-followers {
      font-size: 13px;
      color: #6B7280;
    }

    .follow-button {
      padding: 10px 24px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      font-size: 14px;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    .follow-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .follow-button.following {
      background: white;
      color: #3B82F6;
      border: 2px solid #3B82F6;
      box-shadow: none;
    }

    /* Attendees Section */
    .attendees-section {
      margin-bottom: 24px;
    }

    .attendees-header {
      margin-bottom: 12px;
    }

    .attendees-avatars {
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .avatar-stack {
      display: flex;
      align-items: center;
    }

    .attendee-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      margin-left: -12px;
      object-fit: cover;
    }

    .attendee-avatar:first-child {
      margin-left: 0;
    }

    .attendee-avatar.more {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      font-size: 12px;
      font-weight: 700;
    }

    /* Description Section */
    .description-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px 0;
    }

    .description-text {
      font-size: 15px;
      line-height: 1.6;
      color: #4B5563;
      margin: 0;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    /* Similar Events */
    .similar-events-section {
      margin-bottom: 24px;
    }

    .similar-events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin-top: 12px;
    }

    /* Bottom CTA */
    .bottom-cta {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      z-index: 50;
    }

    .attend-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
    }

    .attend-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }

    .attend-button.attending {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
    }

    .attend-button.attending:hover {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }

    @media (min-width: 768px) {
      .event-detail-page {
        max-width: 800px;
        margin: 0 auto;
      }

      .info-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class EventDetailPage implements OnInit {
  private router = Router;
  private route = ActivatedRoute;

  isSaved = signal(false);
  isFollowing = signal(false);
  isAttending = signal(false);

  event = signal({
    id: 1,
    title: 'Summer Music Festival 2024',
    date: 'Sat, Jun 15',
    time: '6:00 PM - 11:00 PM',
    location: 'Golden Gate Park',
    distance: '2.3 mi',
    price: 45,
    isFree: false,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    organizer: {
      name: 'Bay Area Events Co.',
      avatar: 'https://i.pravatar.cc/150?img=20',
      followers: '12.4K'
    },
    attendees: 342,
    description: 'Join us for an unforgettable evening of live music under the stars! Featuring performances from top local artists, food trucks, and a vibrant atmosphere. Bring your friends and dancing shoes for a night you won\'t forget. Gates open at 5:30 PM with first performance starting at 6:00 PM sharp.'
  });

  similarEvents = signal([
    {
      id: 2,
      title: 'Indie Rock Night',
      date: 'Fri, Jun 21',
      time: '8:00 PM',
      location: 'The Fillmore',
      distance: '1.8 mi',
      price: 25,
      isFree: false,
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
      organizer: { name: 'Live Music Collective', avatar: 'https://i.pravatar.cc/150?img=21' }
    },
    {
      id: 3,
      title: 'Jazz Under Stars',
      date: 'Sat, Jun 22',
      time: '7:00 PM',
      location: 'Yerba Buena Gardens',
      distance: '3.1 mi',
      price: 0,
      isFree: true,
      image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop',
      organizer: { name: 'SF Jazz Society', avatar: 'https://i.pravatar.cc/150?img=22' }
    }
  ]);

  ngOnInit() {
    // In real app, load event based on route param
    // const eventId = this.route.snapshot.params['id'];
  }

  goBack() {
    window.history.back();
  }

  toggleSaved() {
    this.isSaved.update(v => !v);
  }

  toggleFollow() {
    this.isFollowing.update(v => !v);
  }

  toggleAttending() {
    this.isAttending.update(v => !v);
  }

  shareEvent() {
    if (navigator.share) {
      navigator.share({
        title: this.event().title,
        text: `Check out this event: ${this.event().title}`,
        url: window.location.href
      });
    } else {
      alert('Shareable link copied to clipboard!');
    }
  }

  openEventDetail(eventId: number) {
    // Navigate to event detail
    // this.router.navigate(['/events', eventId]);
  }
}
