import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface Highlight {
  id: string;
  authorName: string;
  authorAvatar?: string;
  university: string;
  imageUrl: string;
  isVideo?: boolean;
  viewed?: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-campus-highlights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="campus-highlights">
      <!-- Title -->
      <div class="flex items-center justify-between mb-4 px-1">
        <h2 class="text-base font-semibold text-[#0A1A3F]">Campus Highlights</h2>
        <button class="text-xs text-[#3E8FFF] font-medium hover:underline">See All</button>
      </div>

      <!-- Horizontal Scroll -->
      <div class="highlights-scroll">
        <div class="highlights-container">
          <!-- Add Your Story -->
          <button 
            (click)="openCreate()" 
            class="highlight-card add-story"
            aria-label="Add your highlight">
            <div class="highlight-ring">
              <div class="highlight-inner add-inner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="add-icon">
                  <path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <span class="highlight-name">Add Yours</span>
          </button>

          <!-- Story Items -->
          <button 
            *ngFor="let h of highlights()"
            (click)="viewHighlight(h)"
            class="highlight-card"
            [class.viewed]="h.viewed"
            [attr.aria-label]="'View highlight from ' + h.authorName">
            <div class="highlight-ring" [class.ring-viewed]="h.viewed">
              <div class="highlight-inner">
                <img 
                  [src]="h.imageUrl" 
                  [alt]="h.authorName"
                  class="highlight-image"
                  loading="lazy">
                <div *ngIf="h.isVideo" class="video-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            <span class="highlight-name">{{h.authorName}}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .campus-highlights {
      margin-bottom: 24px;
    }

    .highlights-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .highlights-scroll::-webkit-scrollbar {
      display: none;
    }

    .highlights-container {
      display: flex;
      gap: 16px;
      padding: 4px 0 12px;
    }

    .highlight-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .highlight-card:active {
      transform: scale(0.95);
    }

    .highlight-ring {
      position: relative;
      padding: 3px;
      border-radius: 50%;
      background: linear-gradient(45deg, #3E8FFF, #60A5FA, #3B82F6);
      transition: transform 0.3s ease;
    }

    .highlight-card.viewed .ring-viewed {
      background: linear-gradient(45deg, #E5E7EB, #D1D5DB);
    }

    .highlight-ring:hover {
      transform: scale(1.05);
    }

    .highlight-inner {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid white;
      overflow: hidden;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    }

    .add-inner {
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-icon {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .highlight-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-indicator {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .highlight-name {
      font-size: 11px;
      font-weight: 500;
      color: #0A1A3F;
      max-width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }

    .add-story .highlight-name {
      color: #3E8FFF;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .highlight-inner {
        width: 56px;
        height: 56px;
      }
    }
  `]
})
export class CampusHighlightsComponent {
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  highlights = signal<Highlight[]>([
    {
      id: '1',
      authorName: 'Priya K.',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      university: 'Boston University',
      imageUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: '2h ago',
      viewed: false
    },
    {
      id: '2',
      authorName: 'Marcus L.',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      university: 'MIT',
      imageUrl: 'https://i.pravatar.cc/150?img=12',
      isVideo: true,
      timestamp: '5h ago',
      viewed: false
    },
    {
      id: '3',
      authorName: 'Sarah M.',
      university: 'Harvard',
      imageUrl: 'https://i.pravatar.cc/150?img=9',
      timestamp: '1d ago',
      viewed: true
    },
    {
      id: '4',
      authorName: 'Jake P.',
      university: 'Northeastern',
      imageUrl: 'https://i.pravatar.cc/150?img=15',
      timestamp: '2d ago',
      viewed: false
    },
    {
      id: '5',
      authorName: 'Emma R.',
      university: 'Boston College',
      imageUrl: 'https://i.pravatar.cc/150?img=24',
      timestamp: '2d ago',
      viewed: true
    }
  ]);

  viewHighlight(highlight: Highlight) {
    this.analytics.fire('campus_highlight_viewed', { 
      highlightId: highlight.id,
      author: highlight.authorName 
    });
    
    // Mark as viewed
    this.highlights.update(items => 
      items.map(h => h.id === highlight.id ? { ...h, viewed: true } : h)
    );
    
    // Open highlight viewer (modal or full-screen)
    // TODO: Implement highlight viewer component
    console.log('View highlight:', highlight);
  }

  openCreate() {
    this.analytics.fire('campus_highlight_create_clicked');
    // TODO: Open highlight creation modal
    console.log('Create highlight');
  }
}
