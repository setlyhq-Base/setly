import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-card" (click)="cardClick.emit(event)">
      <!-- Top: Event Image + Badge -->
      <div class="event-image-wrapper">
        <img 
          [src]="event.image" 
          [alt]="event.title" 
          class="event-image"
          loading="lazy"
          decoding="async"
          (error)="onImageError($event)">
        
        <!-- Top-left Badge: Free/Paid or Category -->
        <div class="event-badge">
          <span *ngIf="event.isFree" class="badge-free">Free</span>
          <span *ngIf="!event.isFree && categoryLabel" class="badge-category">{{ categoryLabel }}</span>
          <span *ngIf="!event.isFree && !categoryLabel" class="badge-paid">Paid</span>
        </div>
        
        <!-- Bookmark Icon -->
        <button 
          class="bookmark-btn"
          [class.saved]="isSaved()"
          (click)="toggleSave($event)"
          aria-label="Save event">
          <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <!-- Content: Title, Date/Time, Venue+City, Distance, Source -->
      <div class="event-content">
        <!-- Event Title (1-2 lines max) -->
        <h3 class="event-title">{{ event.title }}</h3>
        
        <!-- Date & Time -->
        <div class="event-meta" *ngIf="formattedDateTime">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span>{{ formattedDateTime }}</span>
        </div>
        
        <!-- Venue + City -->
        <div class="event-meta" *ngIf="venueCity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ venueCity }}</span>
        </div>
        
        <!-- Distance (optional, small and subtle) -->
        <div class="event-distance" *ngIf="event.distance">
          {{ event.distance }} away
        </div>
        
        <!-- Source Tag (bottom) -->
        <div class="event-source-tag" *ngIf="eventSource">
          {{ eventSource }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Card Container */
    .event-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      width: 280px;
      min-width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      -webkit-tap-highlight-color: transparent;
    }

    .event-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
    }

    .event-card:active {
      transform: translateY(-2px);
    }

    /* Image Section - 3:2 aspect ratio */
    .event-image-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 66.67%; /* 3:2 aspect ratio (2/3 = 0.6667) */
      flex-shrink: 0;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .event-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Top-left Badge */
    .event-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 2;
    }

    .badge-free,
    .badge-paid,
    .badge-category {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      backdrop-filter: blur(10px);
    }

    .badge-free {
      background: rgba(16, 185, 129, 0.95);
      color: white;
    }

    .badge-paid {
      background: rgba(59, 130, 246, 0.95);
      color: white;
    }

    .badge-category {
      background: rgba(0, 0, 0, 0.75);
      color: white;
    }

    .event-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .event-card:hover .event-image {
      transform: scale(1.08);
    }

    /* Bookmark Button */
    .bookmark-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.2s;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .bookmark-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .bookmark-btn.saved {
      color: #3B82F6;
      background: white;
    }

    /* Content Section */
    .event-content {
      padding: 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
      min-height: 140px;\n    }

    /* Rating */
    .event-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
    }

    .star {
      font-size: 14px;
    }

    .rating-value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }

    /* Event Title */
    .event-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Meta rows (date/time, venue+city) */
    .event-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #6B7280;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .event-meta svg {
      flex-shrink: 0;
      color: #9CA3AF;
    }

    /* Distance (small, subtle, optional) */
    .event-distance {
      font-size: 12px;
      color: #9CA3AF;
      font-weight: 500;
      margin-bottom: 8px;
    }

    /* Source Tag (bottom pill) */
    .event-source-tag {
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #F3F4F6;
      font-size: 10px;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* Meta Items (Date, Distance) */
    .event-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6B7280;
      font-size: 13px;
      font-weight: 500;
    }

    .meta-item svg {
      flex-shrink: 0;
      color: #9CA3AF;
      width: 14px;
      height: 14px;
    }

    /* Footer */
    .event-footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .footer-left {
      flex: 1;
      min-width: 0;
    }

    .organizer-name {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .event-price {
      font-size: 13px;
      font-weight: 700;
      color: #10B981;
      white-space: nowrap;
    }

    .category-tag {
      padding: 4px 8px;
      background: #EFF6FF;
      color: #3B82F6;
      font-size: 11px;
      font-weight: 600;
      border-radius: 12px;
      text-transform: capitalize;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .event-content {
        padding: 12px;
        min-height: 130px;
      }

      .event-title {
        font-size: 15px;
      }

      .event-meta {
        font-size: 12px;
      }

      .event-distance {
        font-size: 11px;
      }

      .event-source-tag {
        font-size: 9px;
      }
    }

    @media (max-width: 480px) {
      .event-card {
        width: 85vw;
        min-width: 85vw;
        max-width: 360px;
      }

      .event-content {
        padding: 12px;
        min-height: 120px;
      }

      .event-title {
        font-size: 14px;
      }
    }
  `]
})
export class EventCardComponent {
  @Input() event: any;
  @Output() cardClick = new EventEmitter<any>();
  
  isSaved = signal(false);
  private readonly FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

  ngOnInit() {
    if (this.event) {
      this.isSaved.set(this.event.saved || false);
    }
  }

  get formattedDateTime(): string {
    if (!this.event.date) return '';
    
    let formatted = this.event.date;
    if (this.event.time) {
      formatted += ` • ${this.event.time}`;
    }
    return formatted;
  }

  get categoryLabel(): string {
    if (!this.event.tag) return '';
    
    // Map common tags to categories
    const tag = this.event.tag.toLowerCase();
    if (tag.includes('music') || tag.includes('concert')) return 'Music';
    if (tag.includes('sport')) return 'Sports';
    if (tag.includes('art') || tag.includes('theater')) return 'Arts';
    if (tag.includes('festival')) return 'Festival';
    if (tag.includes('free')) return '';
    
    return this.event.tag;
  }

  get venueArea(): string {
    if (!this.event.location) return '';
    
    const location = this.event.location;
    
    // Extract venue name or area from location string
    // Handle various formats: "Venue Name, City" or "City, State" or just "Venue Name"
    const parts = location.split(',').map((p: string) => p.trim());
    
    // Return first meaningful part (venue name or city)
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
    
    return location;
  }

  get venueCity(): string {
    if (!this.event.location) return '';
    
    const location = this.event.location;
    
    // Extract venue + city: "TD Garden • Boston" or "Downtown Boston"
    const parts = location.split(',').map((p: string) => p.trim());
    
    if (parts.length >= 2) {
      // Format: "Venue • City" (e.g., "TD Garden • Boston")
      return `${parts[0]} • ${parts[1]}`;
    } else if (parts.length === 1) {
      return parts[0];
    }
    
    return location;
  }

  get eventSource(): string {
    // Return the source of the event (Ticketmaster or Eventbrite)
    if (!this.event.source) return '';
    
    const source = this.event.source.toLowerCase();
    if (source.includes('ticketmaster')) return 'Ticketmaster';
    if (source.includes('eventbrite')) return 'Eventbrite';
    
    // Capitalize first letter if unknown source
    return this.event.source.charAt(0).toUpperCase() + this.event.source.slice(1);
  }

  toggleSave(event: Event) {
    event.stopPropagation();
    this.isSaved.update(saved => !saved);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.FALLBACK_IMAGE) {
      img.src = this.FALLBACK_IMAGE;
    }
  }
}
