import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private gaId = environment.analytics?.gaMeasurementId || '';

  fire(eventName: string, payload: Record<string, any> = {}): void {
    try {
      if (this.gaId && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, payload);
      } else {
        // Fallback to console for dev/demo
        console.log('[analytics]', eventName, payload);
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
}
