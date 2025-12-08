import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface TrendingTopic {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: string;
  category: 'housing' | 'ride' | 'social' | 'academic' | 'marketplace';
}

@Component({
  selector: 'app-trending-topics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trending-topics">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4 px-1">
        <div class="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-[#3E8FFF]">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor"/>
          </svg>
          <h2 class="text-base font-semibold text-[#0A1A3F]">Trending Now</h2>
        </div>
        <button 
          (click)="exploreAll()"
          class="text-xs text-[#3E8FFF] font-medium hover:underline">
          Explore
        </button>
      </div>

      <!-- Topics Grid -->
      <div class="topics-scroll">
        <div class="topics-container">
          <button 
            *ngFor="let topic of trendingTopics()"
            (click)="selectTopic(topic)"
            class="topic-chip"
            [style.background]="topic.gradient"
            [attr.aria-label]="'Filter by ' + topic.name">
            
            <!-- Icon -->
            <div class="topic-icon" [innerHTML]="getIcon(topic.icon)"></div>
            
            <!-- Content -->
            <div class="topic-content">
              <span class="topic-name">{{topic.name}}</span>
              <span class="topic-count">{{formatCount(topic.count)}} posts</span>
            </div>

            <!-- Arrow -->
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="topic-arrow">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Filter Pills -->
      <div class="quick-filters">
        <button 
          *ngFor="let filter of quickFilters"
          (click)="applyQuickFilter(filter)"
          class="quick-filter-pill"
          [class.active]="filter.active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" [innerHTML]="filter.icon"></svg>
          <span>{{filter.label}}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .trending-topics {
      margin-bottom: 32px;
    }

    .topics-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      margin-bottom: 16px;
    }

    .topics-scroll::-webkit-scrollbar {
      display: none;
    }

    .topics-container {
      display: flex;
      gap: 12px;
      padding: 4px 0 12px;
    }

    .topic-chip {
      flex-shrink: 0;
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
    }

    .topic-chip::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .topic-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.25);
    }

    .topic-chip:hover::before {
      opacity: 1;
    }

    .topic-chip:active {
      transform: translateY(0);
    }

    .topic-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .topic-icon :global(svg) {
      width: 22px;
      height: 22px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .topic-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      min-width: 0;
    }

    .topic-name {
      font-size: 14px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .topic-count {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }

    .topic-arrow {
      color: rgba(255, 255, 255, 0.8);
      flex-shrink: 0;
    }

    .quick-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .quick-filter-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: white;
      border: 1.5px solid #ECECEC;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #0A1A3F;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-filter-pill:hover {
      border-color: #3E8FFF;
      background: rgba(62, 143, 255, 0.04);
      transform: translateY(-1px);
    }

    .quick-filter-pill.active {
      background: linear-gradient(135deg, #3E8FFF 0%, #2563EB 100%);
      border-color: #3E8FFF;
      color: white;
      box-shadow: 0 4px 12px -2px rgba(62, 143, 255, 0.4);
    }

    .quick-filter-pill :global(svg) {
      color: #3E8FFF;
    }

    .quick-filter-pill.active :global(svg) {
      color: white;
    }

    @media (max-width: 640px) {
      .topic-chip {
        min-width: 180px;
      }

      .topic-icon {
        width: 36px;
        height: 36px;
      }

      .topic-icon :global(svg) {
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class TrendingTopicsComponent {
  private analytics = inject(AnalyticsService);

  @Output() topicSelected = new EventEmitter<TrendingTopic>();
  @Output() quickFilterApplied = new EventEmitter<any>();

  trendingTopics = signal<TrendingTopic[]>([
    {
      id: 'housing',
      name: 'Housing & Sublets',
      icon: 'home',
      count: 234,
      gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      category: 'housing'
    },
    {
      id: 'campus-rides',
      name: 'Campus Rides',
      icon: 'car',
      count: 156,
      gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
      category: 'ride'
    },
    {
      id: 'study-groups',
      name: 'Study Groups',
      icon: 'book',
      count: 189,
      gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
      category: 'academic'
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      icon: 'shopping',
      count: 312,
      gradient: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
      category: 'marketplace'
    },
    {
      id: 'events',
      name: 'Campus Events',
      icon: 'calendar',
      count: 98,
      gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
      category: 'social'
    }
  ]);

  quickFilters = [
    { 
      id: 'verified', 
      label: 'Verified Only', 
      icon: '<path d="M9 12l2 2 4-4M12 2l10 5v6c0 5-4 9-10 11C6 22 2 18 2 13V7l10-5z" stroke="currentColor" stroke-width="1.8" fill="none"/>',
      active: false 
    },
    { 
      id: 'nearby', 
      label: 'Nearby', 
      icon: '<path d="M12 2C8.5 2 5.5 4.8 5.5 8.2c0 5.4 6.5 11.8 6.5 11.8s6.5-6.4 6.5-11.8C18.5 4.8 15.5 2 12 2z" fill="currentColor"/><circle cx="12" cy="8" r="2" fill="white"/>',
      active: false 
    },
    { 
      id: 'new', 
      label: 'New Today', 
      icon: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      active: false 
    }
  ];

  getIcon(iconName: string): string {
    const icons: Record<string, string> = {
      home: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      car: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5h11L19 11M2 16h20M6 16v5M18 16v5M7 16h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="11" r="1.5" fill="currentColor"/><circle cx="17" cy="11" r="1.5" fill="currentColor"/></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      shopping: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      calendar: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
    return icons[iconName] || icons.home;
  }

  formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  selectTopic(topic: TrendingTopic) {
    this.analytics.fire('trending_topic_selected', { 
      topicId: topic.id, 
      topicName: topic.name 
    });
    this.topicSelected.emit(topic);
  }

  applyQuickFilter(filter: any) {
    this.analytics.fire('quick_filter_applied', { filterId: filter.id });
    filter.active = !filter.active;
    this.quickFilterApplied.emit({ 
      filter: filter.id, 
      active: filter.active 
    });
  }

  exploreAll() {
    this.analytics.fire('trending_explore_all_clicked');
  }
}
