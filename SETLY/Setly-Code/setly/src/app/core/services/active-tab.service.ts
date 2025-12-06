import { Injectable, signal } from '@angular/core';

export type TabType = 'rooms' | 'rides' | 'market';

@Injectable({
  providedIn: 'root'
})
export class ActiveTabService {
  // Global signal for the active tab
  activeTab = signal<TabType>('rooms');

  setActiveTab(tab: TabType) {
    this.activeTab.set(tab);
  }
}
