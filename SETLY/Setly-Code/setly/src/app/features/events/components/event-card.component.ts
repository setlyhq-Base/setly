import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-card" (click)="cardClick.emit(event)">
      <div class="event-image-wrapper">
        <img 
          [src]="event.image" 
          [alt]="event.title" 
          class="event-image"
          loading="lazy"
          decoding="async">
        
        <!-- Save Button -->
        <button 
          class="save-btn"
          [class.saved]="isSaved()"
          [class.animating]="isAnimating()"
          (click)="toggleSave($event)"
          aria-label="Save event">
          <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- Event Tag (Free, Paid, 18+, 21+, College Only) -->
        <div class="event-tag" [ngClass]="getTagClass()">{{ event.tag }}</div>
      </div>
      
      <div class="event-content">
        <h3 class="event-title">{{ event.title }}</h3>
        
        <div class="event-meta">
          <div class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>{{ event.date }}</span>
          </div>
          
          <div class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>{{ event.distance }}</span>
          </div>
        </div>
        
        <!-- Attendees & Spots Left -->
        <div class="event-stats">
          <span class="attendees">{{ event.attendees }} going</span>
          <span class="spots" [class.limited]="event.spotsLeft !== 'Unlimited'">
            {{ event.spotsLeft }}
          </span>
        </div>
        
        <div class="event-footer">
          <div class="organizer">
            <img [src]="event.organizer.avatar" [alt]="event.organizer.name" class="organizer-avatar" loading="lazy" decoding="async">
            <span class="organizer-name">{{ event.organizer.name }}</span>
          </div>
          <div class="event-price">
            <span *ngIf="event.isFree" class="price-free">Free</span>
            <span *ngIf="!event.isFree" class="price-paid">\${{ event.price }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .event-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .event-image-wrapper {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .event-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .event-card:hover .event-image {
      transform: scale(1.05);
    }

    .save-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
      z-index: 2;
    }

    .save-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .save-btn.saved {
      color: #3B82F6;
      animation: bookmarkPulse 0.4s ease-out;
    }

    .save-btn.animating {
      animation: bookmarkBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes bookmarkPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.3);
      }
    }

    @keyframes bookmarkBounce {
      0%, 100% {
        transform: scale(1);
      }
      30% {
        transform: scale(1.4) rotate(-5deg);
      }
      60% {
        transform: scale(0.9) rotate(5deg);
      }
    }

    .event-tag {
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 6px 12px;
      color: white;
      font-size: 12px;
      font-weight: 700;
      border-radius: 20px;
      z-index: 1;
    }

    .event-tag.tag-free {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }

    .event-tag.tag-paid {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }

    .event-tag.tag-age {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }

    .event-tag.tag-college {
      background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
    }

    .event-content {
      padding: 16px;
    }

    .event-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .event-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6B7280;
      font-size: 14px;
    }

    .meta-item svg {
      flex-shrink: 0;
      color: #9CA3AF;
      width: 14px;
      height: 14px;
    }

    .event-stats {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      font-size: 13px;
      color: #6B7280;
      border-top: 1px solid #F3F4F6;
      margin-top: 12px;
    }

    .attendees {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .spots {
      font-weight: 500;
      color: #10B981;
    }

    .spots.limited {
      color: #F59E0B;
      font-weight: 600;
    }

    .event-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid #F3F4F6;
    }

    .organizer {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .organizer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #F3F4F6;
    }

    .organizer-name {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .event-price {
      font-size: 15px;
      font-weight: 700;
    }

    .price-free {
      color: #10B981;
    }

    .price-paid {
      color: #3B82F6;
    }

    @media (max-width: 768px) {
      .event-image-wrapper {
        height: 180px;
      }

      .event-title {
        font-size: 16px;
      }

      .meta-item {
        font-size: 13px;
      }
    }
  `]
})
export class EventCardComponent {
  @Input() event: any;
  @Output() cardClick = new EventEmitter<any>();
  
  isSaved = signal(false);
  isAnimating = signal(false);

  ngOnInit() {
    if (this.event) {
      this.isSaved.set(this.event.saved || false);
    }
  }

  getTagClass(): string {
    if (this.event.tag === 'Free') return 'tag-free';
    if (this.event.tag === 'Paid') return 'tag-paid';
    if (this.event.tag === '18+' || this.event.tag === '21+') return 'tag-age';
    return 'tag-college';
  }

  toggleSave(event: Event) {
    event.stopPropagation();
    this.isSaved.update(saved => !saved);
    
    // Trigger bookmark animation
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 600);
  }

  onCardClick() {
    this.cardClick.emit(this.event);
  }
}
