import { Component, Signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';
import { ConnectFeedService } from '../../core/services/connect-feed.service';
import { ConnectFiltersService } from '../../core/services/connect-filters.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-connect-map',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-white">
      <div class="h-[60vh] bg-gray-100 border-b border-gray-200 flex items-center justify-center text-gray-500">Map placeholder</div>
      <div class="max-w-3xl mx-auto px-4 py-4">
        <h2 class="font-medium mb-2">Nearby posts</h2>
        <ul class="divide-y">
          <li *ngFor="let p of (feed().posts)" class="py-3 text-sm flex items-center justify-between">
            <span>{{p.type}} • {{p.city}} • {{p.createdAt | date:'short'}}</span>
            <a [routerLink]="['/connect']" class="text-blue-600 hover:underline">Open</a>
          </li>
        </ul>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class ConnectMapPage {
  private feedSvc = inject(ConnectFeedService);
  private filtersSvc = inject(ConnectFiltersService);
  private analytics = inject(AnalyticsService);
  feed: Signal<any> = this.feedSvc.feed;

  constructor(){
    effect(() => {
      const filters = this.filtersSvc.filters()();
      this.feedSvc.fetchFeed({ ...filters });
    });
    this.analytics.mapViewOpened();
  }
}
