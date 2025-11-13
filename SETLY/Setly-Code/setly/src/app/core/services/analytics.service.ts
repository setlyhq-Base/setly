import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private gaId = environment.analytics?.gaMeasurementId || '';

  // Generic event tracker (per spec)
  track(eventName: string, payload: Record<string, any> = {}): void {
    this.fire(eventName, payload);
  }

  fire(eventName: string, payload: Record<string, any> = {}): void {
    try {
      if (this.gaId && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, payload);
      } else {
        // Fallback to console for dev/demo (silence repetitive noise)
        if (eventName !== 'filter_changed') {
          console.log('[analytics]', eventName, payload);
        }
      }
    } catch (e) {
      // Non-blocking
      console.debug('analytics error:', e);
    }
  }

  // Backward compatible helpers used across existing pages
  trackEvent(name: string, parameters: Record<string, any> = {}): void {
    this.fire(name, parameters);
  }

  trackPageView(pageName: string): void {
    this.fire('page_view', { page_title: pageName });
  }

  trackRideRequest(type: 'uber' | 'setly', details: Record<string, any>): void {
    this.fire('ride_request', { ride_type: type, ...details });
  }

  trackSearch(query: string, filters: Record<string, any>): void {
    this.fire('search', { search_term: query, ...filters });
  }

  trackRoomClick(roomId: string): void {
    this.fire('room_click', { room_id: roomId });
  }

  // Connect-specific helpers (optional usage)
  feedViewed(context: Record<string, any> = {}): void { this.track('feed_viewed', context); }
  filterChanged(filters: Record<string, any>): void { this.track('filter_changed', filters); }
  postOpened(id: string, type: string): void { this.track('post_opened', { id, type }); }
  likeClicked(id: string): void { this.track('like_clicked', { id }); }
  saveClicked(id: string): void { this.track('save_clicked', { id }); }
  reportClicked(id: string): void { this.track('report_clicked', { id }); }
  mapViewOpened(): void { this.track('map_view_opened', {}); }
}
