import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MapPerson {
  id: string;
  name: string;
  photo: string;
  university: string;
  distance: string;
  lat: number;
  lng: number;
  verified: boolean;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-view-overlay" (click)="close.emit()">
      <div class="map-view-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="map-header">
          <button (click)="close.emit()" class="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h2>People Nearby</h2>
          <button class="center-btn" (click)="centerMap()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- Map Container -->
        <div class="map-canvas">
          <div class="map-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" stroke-width="2"/>
              <path d="M8 2v16M16 6v16" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>Map integration coming soon</p>
            <small>Google Maps / Mapbox will show nearby students</small>
          </div>

          <!-- Person Pins Overlay -->
          <div class="map-pins">
            <div 
              *ngFor="let person of nearbyPeople()" 
              class="person-pin"
              [style.left.%]="person.lat * 10"
              [style.top.%]="person.lng * 10"
              (click)="selectPerson(person)">
              <img [src]="person.photo" [alt]="person.name">
              <div class="pin-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Bottom Sheet - Selected Person -->
        <div class="person-sheet" *ngIf="selectedPerson()">
          <div class="person-sheet-content">
            <img [src]="selectedPerson()!.photo" [alt]="selectedPerson()!.name" class="person-photo">
            <div class="person-info">
              <h3>
                {{ selectedPerson()!.name }}
                <svg *ngIf="selectedPerson()!.verified" width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </h3>
              <p>{{ selectedPerson()!.university }}</p>
              <span class="distance">{{ selectedPerson()!.distance }}</span>
            </div>
            <button class="connect-btn">Connect</button>
          </div>
        </div>

        <!-- List Toggle -->
        <button class="list-toggle" (click)="showList.set(!showList())">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="4" rx="1" fill="currentColor"/>
            <rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor"/>
            <rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor"/>
          </svg>
          {{ showList() ? 'Map' : 'List' }}
        </button>

        <!-- List View -->
        <div class="people-list" *ngIf="showList()">
          <div class="list-header">
            <h3>{{ nearbyPeople().length }} people nearby</h3>
          </div>
          <div class="list-items">
            <div 
              *ngFor="let person of nearbyPeople()" 
              class="list-item"
              (click)="selectPerson(person)">
              <img [src]="person.photo" [alt]="person.name">
              <div class="item-info">
                <h4>
                  {{ person.name }}
                  <svg *ngIf="person.verified" width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </h4>
                <p>{{ person.university }}</p>
              </div>
              <span class="item-distance">{{ person.distance }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-view-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    .map-view-container {
      position: absolute;
      inset: 0;
      background: white;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .map-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .map-header h2 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .back-btn, .center-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #f3f4f6;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:active, .center-btn:active {
      transform: scale(0.95);
      background: #e5e7eb;
    }

    .map-canvas {
      flex: 1;
      position: relative;
      background: #f9fafb;
      overflow: hidden;
    }

    .map-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      text-align: center;
      padding: 24px;
    }

    .map-placeholder svg {
      margin-bottom: 16px;
      opacity: 0.3;
    }

    .map-placeholder p {
      font-size: 16px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 8px 0;
    }

    .map-placeholder small {
      font-size: 14px;
      color: #9ca3af;
    }

    .map-pins {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .person-pin {
      position: absolute;
      width: 48px;
      height: 48px;
      pointer-events: auto;
      cursor: pointer;
      transform: translate(-50%, -50%);
      animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .person-pin img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      object-fit: cover;
    }

    .pin-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #3b82f6;
      animation: pulse 2s infinite;
    }

    .person-sheet {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-radius: 24px 24px 0 0;
      padding: 24px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      animation: slideUpSheet 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .person-sheet-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .person-photo {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .person-info {
      flex: 1;
    }

    .person-info h3 {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .person-info p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 4px 0;
    }

    .distance {
      display: inline-block;
      font-size: 12px;
      color: #3b82f6;
      font-weight: 600;
    }

    .connect-btn {
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .connect-btn:active {
      transform: scale(0.95);
    }

    .list-toggle {
      position: absolute;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 24px;
      border: none;
      background: white;
      color: #374151;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 20;
    }

    .list-toggle:active {
      transform: scale(0.95);
    }

    .people-list {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 70vh;
      background: white;
      border-radius: 24px 24px 0 0;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      animation: slideUpSheet 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .list-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .list-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .list-items {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .list-item:active {
      background: #f3f4f6;
      transform: scale(0.98);
    }

    .list-item img {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
    }

    .item-info {
      flex: 1;
    }

    .item-info h4 {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .item-info p {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    .item-distance {
      font-size: 12px;
      font-weight: 600;
      color: #3b82f6;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes popIn {
      from { 
        opacity: 0;
        transform: translate(-50%, -50%) scale(0);
      }
      to { 
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes pulse {
      0%, 100% { 
        opacity: 1;
        transform: scale(1);
      }
      50% { 
        opacity: 0.5;
        transform: scale(1.2);
      }
    }
  `]
})
export class MapViewComponent {
  @Output() close = new EventEmitter<void>();

  showList = signal<boolean>(false);
  selectedPerson = signal<MapPerson | null>(null);
  
  // Mock data - replace with real data from service
  nearbyPeople = signal<MapPerson[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      photo: 'https://i.pravatar.cc/150?img=5',
      university: 'Boston University',
      distance: '0.3 mi away',
      lat: 42.3505,
      lng: -71.1054,
      verified: true
    },
    {
      id: '2',
      name: 'Mike Johnson',
      photo: 'https://i.pravatar.cc/150?img=12',
      university: 'BU',
      distance: '0.5 mi away',
      lat: 42.3515,
      lng: -71.1064,
      verified: false
    },
    {
      id: '3',
      name: 'Emma Davis',
      photo: 'https://i.pravatar.cc/150?img=45',
      university: 'Boston University',
      distance: '0.7 mi away',
      lat: 42.3525,
      lng: -71.1044,
      verified: true
    }
  ]);

  selectPerson(person: MapPerson) {
    this.selectedPerson.set(person);
  }

  centerMap() {
    console.log('Center map on user location');
  }
}
