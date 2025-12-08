import { Component, EventEmitter, Output, inject, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LocationService } from '../../../core/services/location.service';
import { DummyPeopleService, DummyUser } from '../../../core/services/dummy-people.service';
import { PresenceService } from '../../../core/services/presence.service';

declare const google: any;

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
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('400ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ],
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
          <button class="dark-mode-toggle" (click)="toggleDarkMode()" title="Toggle dark mode">
            <svg *ngIf="!isDarkMode()" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg *ngIf="isDarkMode()" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Map Container -->
        <div class="map-canvas">
          <!-- Google Map -->
          <div #googleMap class="google-map" [class.dark-mode]="isDarkMode()"></div>

          <!-- Loading state with animation -->
          <div *ngIf="isLoadingMap()" class="map-loading">
            <div class="loading-spinner"></div>
            <p>Finding people near you...</p>
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>

          <!-- Error state -->
          <div *ngIf="mapError()" class="map-error">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>{{ mapError() }}</p>
            <button (click)="initializeMap()" class="retry-btn">Retry</button>
          </div>

          <!-- Floating Action Stack (Right Side) -->
          <div class="floating-actions" *ngIf="!isLoadingMap() && !mapError()">
            <button class="action-btn" (click)="recenterMap()" title="Recenter on my location">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </button>
            <button class="action-btn" (click)="openFilters()" title="Filter people">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="action-btn" (click)="refreshMap()" title="Refresh map" [class.spinning]="isRefreshing()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Search This Area Button (appears when map is dragged) -->
          <button 
            *ngIf="showSearchAreaBtn() && !isLoadingMap()" 
            class="search-area-btn"
            (click)="searchThisArea()">
            🔍 Search this area
          </button>

          <!-- Bottom Hint -->
          <div class="bottom-hint" *ngIf="!isLoadingMap() && !mapError() && !selectedPerson()">
            <p>Tap any pin to see profile · Swipe up for details</p>
          </div>
        </div>

        <!-- Bottom Sheet - Selected Person Preview -->
        <div class="person-preview-sheet" *ngIf="selectedPerson()" [@slideUp]>
          <div class="sheet-handle"></div>
          <div class="preview-content" (click)="openFullProfile(selectedPerson()!)">
            <div class="preview-left">
              <div class="preview-avatar">
                <img [src]="selectedPerson()!.avatarUrl || '/assets/default-avatar.svg'" [alt]="selectedPerson()!.name">
                <div class="status-ring" [class.online]="isOnline(selectedPerson()!)" [class.active]="isActive(selectedPerson()!)"></div>
              </div>
              <div class="preview-info">
                <h3>
                  {{ selectedPerson()!.name }}
                  <svg *ngIf="selectedPerson()!.badges?.university" width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </h3>
                <p class="university">{{ selectedPerson()!.organization || 'Student' }}</p>
                <p class="distance">📍 {{ calculateDistance(selectedPerson()!) }} km away</p>
                <div class="mutuals" *ngIf="getMutualCount(selectedPerson()!) > 0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ getMutualCount(selectedPerson()!) }} mutual connections
                </div>
                <div class="interests-preview" *ngIf="selectedPerson()!.interests?.length">
                  <span *ngFor="let interest of selectedPerson()!.interests?.slice(0, 3)" class="interest-tag">
                    {{ interest }}
                  </span>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="connect-btn-mini" (click)="connectWithPerson($event, selectedPerson()!)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7.5a4 4 0 11-8 0 4 4 0 018 0zM20 8v6M23 11h-6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button class="arrow-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div class="people-list" *ngIf="showList()">
          <div class="list-header">
            <h3>{{ filteredPeople().length }} people nearby</h3>
            <button class="close-list-btn" (click)="showList.set(false)">×</button>
          </div>
          <div class="list-items">
            <div 
              *ngFor="let person of filteredPeople()" 
              class="list-item"
              (click)="selectPersonFromList(person)">
              <div class="list-item-avatar">
                <img [src]="person.avatarUrl || '/assets/default-avatar.svg'" [alt]="person.name">
                <div class="status-dot" [class.online]="isOnline(person)" [class.active]="isActive(person)"></div>
              </div>
              <div class="item-info">
                <h4>
                  {{ person.name }}
                  <svg *ngIf="person.badges?.university" width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </h4>
                <p>{{ person.organization || 'Student' }}</p>
              </div>
              <span class="item-distance">{{ calculateDistance(person) }} km</span>
            </div>
          </div>
        </div>

        <!-- List Toggle FAB -->
        <button class="list-toggle-fab" (click)="showList.set(!showList())" *ngIf="!isLoadingMap() && !mapError() && !selectedPerson()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="4" rx="1" fill="currentColor"/>
            <rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor"/>
            <rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor"/>
          </svg>
          <span>{{ showList() ? 'Map' : 'List' }}</span>
        </button>
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

    .google-map {
      width: 100%;
      height: 100%;
    }

    .map-loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      z-index: 50;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }

    .map-loading p {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
    }

    .map-error {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      text-align: center;
      padding: 24px;
      background: white;
      z-index: 50;
    }

    .map-error svg {
      margin-bottom: 16px;
      color: #ef4444;
    }

    .map-error p {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 16px 0;
      max-width: 320px;
    }

    .retry-btn {
      padding: 10px 24px;
      border-radius: 10px;
      border: none;
      background: #3b82f6;
      color: white;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-btn:active {
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @ViewChild('googleMap') mapContainer!: ElementRef<HTMLDivElement>;

  private locationSvc = inject(LocationService);
  private dummySvc = inject(DummyPeopleService);
  private presenceSvc = inject(PresenceService);

  // UI State
  showList = signal<boolean>(false);
  isLoadingMap = signal<boolean>(true);
  mapError = signal<string | null>(null);
  filteredPeople = signal<DummyUser[]>([]);
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  selectedPerson = signal<DummyUser | null>(null);
  isDarkMode = signal<boolean>(false);
  isRefreshing = signal<boolean>(false);
  showSearchAreaBtn = signal<boolean>(false);

  // Map instances
  private map: any = null;
  private markers: any[] = [];
  private userLocationMarker: any = null;
  private markerClusterer: any = null;
  private lastMapCenter: { lat: number; lng: number } | null = null;
  private animationFrame: number | null = null;

  ngAfterViewInit(): void {
    // Animate map entrance with staggered pin drops
    setTimeout(() => this.initializeMap(), 100);
  }

  ngOnDestroy(): void {
    // Cleanup
    this.markers.forEach((marker: any) => marker.setMap(null));
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  async initializeMap(): Promise<void> {
    try {
      this.isLoadingMap.set(true);
      this.mapError.set(null);

      // Wait for Google Maps API
      await this.waitForGoogleMaps();

      if (!this.mapContainer) {
        throw new Error('Map container not available');
      }

      // Get user's current location
      console.log('🗺️ Requesting your real location...');
      const location = await this.locationSvc.getCurrentLocation();
      
      if (!location) {
        throw new Error('Location access required. Please enable location permissions.');
      }

      this.userLocation.set({ lat: location.lat, lng: location.lng });
      this.lastMapCenter = { lat: location.lat, lng: location.lng };
      console.log('✅ Map will center on YOUR location:', location);

      // Initialize map with smooth fade-in
      const mapOptions = {
        center: { lat: location.lat, lng: location.lng },
        zoom: 13, // Perfect zoom for neighborhood-level view
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: this.isDarkMode() ? this.getDarkMapStyles() : this.getMapStyles(),
        gestureHandling: 'greedy',
        zoomControl: true
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

      // Add map drag listener for "Search this area" feature
      this.map.addListener('dragend', () => {
        const center = this.map.getCenter();
        const newCenter = { lat: center.lat(), lng: center.lng() };
        const distance = this.locationSvc.calculateDistance(
          this.lastMapCenter!.lat,
          this.lastMapCenter!.lng,
          newCenter.lat,
          newCenter.lng
        );
        
        // Show "Search this area" if dragged more than 1 km
        if (distance > 1) {
          this.showSearchAreaBtn.set(true);
        }
      });

      // Add pulsing user location marker
      this.addUserLocationMarkerWithPulse();
      
      // Add people markers with staggered animation
      await this.addPeopleMarkersAnimated();

      this.isLoadingMap.set(false);
      console.log('✅ Map loaded successfully with animations');
    } catch (error: any) {
      console.error('Error initializing map:', error);
      this.mapError.set(error instanceof Error ? error.message : 'Failed to load map');
      this.isLoadingMap.set(false);
    }
  }

  private waitForGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).googleMapsError) {
        reject(new Error((window as any).googleMapsError));
        return;
      }

      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }

      if ((window as any).googleMapsLoaded) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;
      
      const interval = setInterval(() => {
        attempts++;
        
        if ((window as any).googleMapsError) {
          clearInterval(interval);
          reject(new Error((window as any).googleMapsError));
        } else if (typeof google !== 'undefined' && google.maps) {
          clearInterval(interval);
          resolve();
        } else if ((window as any).googleMapsLoaded) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Maps failed to load'));
        }
      }, 100);
    });
  }

  private addUserLocationMarker(): void {
    if (!this.map || !this.userLocation()) return;

    const userLoc = this.userLocation()!;
    
    this.userLocationMarker = new google.maps.Marker({
      position: userLoc,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4E7BFD',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      title: 'You are here',
      zIndex: 2000,
      optimized: false
    });
  }

  private async addPeopleMarkers(): Promise<void> {
    if (!this.map) return;

    const peopleWithCoords = await this.getPeopleWithCoordinates();
    this.filteredPeople.set(peopleWithCoords);

    for (const person of peopleWithCoords) {
      const icon = await this.createPersonMarkerIcon(person);
      
      const marker = new google.maps.Marker({
        position: { lat: person.lat, lng: person.lng },
        map: this.map,
        icon: icon,
        title: person.name,
        optimized: false,
        zIndex: this.isOnline(person) ? 1500 : 1000
      });

      marker.addListener('click', () => {
        this.showPersonInfoWindow(marker, person);
      });

      this.markers.push(marker);
    }
  }

  private async getPeopleWithCoordinates(): Promise<any[]> {
    const allPeople = this.dummySvc.getOnlineUsers();
    const userLoc = this.userLocation();
    
    if (!userLoc) return [];

    const peopleWithCoords: any[] = [];

    for (const person of allPeople.slice(0, 20)) {
      try {
        // Generate random coordinates near user (within ~5 km radius)
        const randomLat = userLoc.lat + (Math.random() - 0.5) * 0.05;
        const randomLng = userLoc.lng + (Math.random() - 0.5) * 0.05;

        peopleWithCoords.push({
          ...person,
          lat: randomLat,
          lng: randomLng
        });
      } catch (error) {
        console.error('Error adding person to map:', error);
      }
    }

    return peopleWithCoords;
  }

  private createPersonMarkerIcon(person: any): any {
    const statusColor = this.isOnline(person) ? '#00C853' : '#9E9E9E';
    const size = 34;
    const borderWidth = 2.5;
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    
    // White background
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 1, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // Status border
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - borderWidth/2, 0, 2 * Math.PI);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const avatarUrl = person.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=128&background=4E7BFD&color=fff&bold=true`;
    
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, (size/2) - borderWidth - 1, 0, 2 * Math.PI);
        ctx.clip();
        
        const imgSize = size - (borderWidth * 2) - 2;
        ctx.drawImage(img, borderWidth + 1, borderWidth + 1, imgSize, imgSize);
        ctx.restore();
        
        resolve({
          url: canvas.toDataURL('image/png'),
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size/2, size/2),
          optimized: false
        });
      };
      
      img.onerror = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, (size/2) - borderWidth - 1, 0, 2 * Math.PI);
        ctx.fillStyle = '#4E7BFD';
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = person.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        ctx.fillText(initials, size/2, size/2);
        ctx.restore();
        
        resolve({
          url: canvas.toDataURL('image/png'),
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size/2, size/2),
          optimized: false
        });
      };
      
      img.src = avatarUrl;
    });
  }

  private showPersonInfoWindow(marker: any, person: any): void {
    const distance = this.calculateDistance(person);
    const statusText = this.isOnline(person) ? '<span style="color: #00C853;">🟢 Online Now</span>' : '<span style="color: #9E9E9E;">⚪ Offline</span>';

    const content = `
      <div style="padding: 16px; min-width: 240px; font-family: -apple-system, system-ui, sans-serif;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <img src="${person.avatarUrl || '/assets/default-avatar.svg'}" 
               style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid #4E7BFD;">
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 16px; color: #1f2937; margin-bottom: 2px;">${person.name}</div>
            <div style="font-size: 13px; color: #6b7280;">${person.organization || 'Student'}</div>
          </div>
        </div>
        
        <div style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">${statusText}</div>
          <div style="font-size: 12px; color: #6b7280;">📏 ${distance} km away</div>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({ content, maxWidth: 280 });
    infoWindow.open(this.map, marker);
  }

  private isOnline(person: any): boolean {
    return this.presenceSvc.online().has(person.uid);
  }

  private getMapStyles(): any[] {
    return [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ];
  }

  recenterMap(): void {
    if (this.map && this.userLocation()) {
      this.map.panTo(this.userLocation()!);
      this.map.setZoom(13);
    }
  }

  focusOnPerson(person: any): void {
    this.showList.set(false);
    if (this.map && person.lat && person.lng) {
      this.map.panTo({ lat: person.lat, lng: person.lng });
      this.map.setZoom(15);
    }
  }

  calculateDistance(person: any): string {
    if (!this.userLocation() || !person.lat || !person.lng) return 'N/A';
    
    const distance = this.locationSvc.calculateDistance(
      this.userLocation()!.lat,
      this.userLocation()!.lng,
      person.lat,
      person.lng
    );
    
    return distance.toFixed(1);
  }

  // ========== PREMIUM MAP FEATURES ==========

  toggleDarkMode(): void {
    this.isDarkMode.update(val => !val);
    if (this.map) {
      this.map.setOptions({
        styles: this.isDarkMode() ? this.getDarkMapStyles() : []
      });
    }
  }

  getDarkMapStyles(): any[] {
    return [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#757575" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#757575" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#181818" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }],
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#2c2c2c" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#8a8a8a" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#373737" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#3c3c3c" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#000000" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#3d3d3d" }],
      },
    ];
  }

  async refreshMap(): Promise<void> {
    this.isRefreshing.set(true);
    
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    
    // Reload people
    const people = this.dummySvc.getAllUsers();
    this.filteredPeople.set(people);
    
    // Re-add markers with animation
    await this.addPeopleMarkersAnimated();
    
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 1000);
  }

  searchThisArea(): void {
    if (!this.map) return;
    
    const center = this.map.getCenter();
    if (!center) return;

    // Update last center
    this.lastMapCenter = { lat: center.lat(), lng: center.lng() };
    
    // Fetch people in this new area (mock implementation)
    // In real app, call API with new center coordinates
    const allPeople = this.dummySvc.getAllUsers();
    const filteredPeople = allPeople.filter((person: DummyUser) => {
      if (!person.lat || !person.lng) return false;
      const distance = this.locationSvc.calculateDistance(
        center.lat(),
        center.lng(),
        person.lat,
        person.lng
      );
      return distance < 10; // Within 10km of new center
    });
    
    this.filteredPeople.set(filteredPeople);
    
    // Clear and re-add markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    this.addPeopleMarkersAnimated();
    
    // Hide the button
    this.showSearchAreaBtn.set(false);
  }

  openFilters(): void {
    // Emit event to parent component to open filter drawer
    // In real implementation, use @Output or service to communicate with parent
    console.log('Open filters drawer');
  }

  connectWithPerson(event: Event, person: any): void {
    event.stopPropagation();
    console.log('Connecting with:', person);
    // In real app, trigger connection request via service
  }

  openFullProfile(person: any): void {
    console.log('Opening full profile:', person);
    // Close map view and navigate to profile page
    // In real app, use Router: this.router.navigate(['/profile', person.id]);
  }

  selectPersonFromList(person: any): void {
    this.selectedPerson.set(person);
    this.showList.set(false);
    
    // Pan to person's location
    if (this.map && person.lat && person.lng) {
      this.map.panTo({ lat: person.lat, lng: person.lng });
      this.map.setZoom(15);
    }
  }

  getMutualCount(person: any): number {
    return person.mutualInterests?.length || 0;
  }

  isActive(person: any): boolean {
    if (!person.lastSeen) return false;
    
    const now = new Date();
    const lastSeen = new Date(person.lastSeen);
    const hoursSince = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
    
    return hoursSince < 24; // Active within last 24 hours
  }

  private async addUserLocationMarkerWithPulse(): Promise<void> {
    if (!this.map) return;
    const loc = this.userLocation();
    if (!loc) return;

    // Create pulsing dot for user location
    const pulseIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
      scale: 10,
    };

    const userMarker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map: this.map,
      icon: pulseIcon,
      zIndex: 1000,
    });

    this.markers.push(userMarker);

    // Add pulse animation using CSS (create custom overlay)
    const pulseDiv = document.createElement('div');
    pulseDiv.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(66, 133, 244, 0.3);
      position: absolute;
      animation: pulse 2s infinite;
    `;

    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.5);
          opacity: 0.3;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private async addPeopleMarkersAnimated(): Promise<void> {
    if (!this.map) return;
    
    const people = this.filteredPeople();
    const animationDelay = 50; // ms between each marker drop

    for (let i = 0; i < people.length; i++) {
      await new Promise(resolve => setTimeout(resolve, animationDelay));
      
      const person = people[i];
      if (!person.lat || !person.lng) continue;

      const isOnline = this.presenceSvc.online().has(person.id);
      const isActive = this.isActive(person);
      const status = isOnline ? 'online' : (isActive ? 'active' : 'offline');
      
      const markerIcon = this.createPersonMarkerIconWithStatus(person, status);
      
      const marker = new google.maps.Marker({
        position: { lat: person.lat, lng: person.lng },
        map: this.map,
        icon: markerIcon,
        title: person.name,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        this.selectedPerson.set(person);
      });

      this.markers.push(marker);
    }
  }

  private createPersonMarkerIconWithStatus(person: any, status: 'online' | 'active' | 'offline'): any {
    const statusColors = {
      online: '#10b981',   // green
      active: '#3b82f6',   // blue
      offline: '#9ca3af'   // gray
    };
    
    const ringColor = statusColors[status];
    
    // Create SVG with colored ring
    const svg = `
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="circleClip">
            <circle cx="24" cy="24" r="16"/>
          </clipPath>
        </defs>
        <circle cx="24" cy="24" r="20" fill="${ringColor}" opacity="0.3"/>
        <circle cx="24" cy="24" r="18" fill="white" stroke="${ringColor}" stroke-width="3"/>
        <circle cx="24" cy="24" r="16" fill="url(#img)" clip-path="url(#circleClip)"/>
        <defs>
          <pattern id="img" patternUnits="userSpaceOnUse" width="32" height="32">
            <image href="${person.avatar}" x="0" y="0" width="32" height="32"/>
          </pattern>
        </defs>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(48, 48),
      anchor: new google.maps.Point(24, 24),
    };
  }
}
