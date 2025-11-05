import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="rounded-2xl bg-gray-100 border border-gray-200 p-5 animate-pulse">
      <div class="aspect-video bg-gray-200 rounded-lg mb-4"></div>
      <div class="space-y-3">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="flex gap-2">
          <div class="h-6 bg-gray-200 rounded-full w-16"></div>
          <div class="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div class="h-8 bg-gray-200 rounded-lg w-full mt-4"></div>
      </div>
    </div>
  `,
  styles: []
})
export class SkeletonCardComponent {}
