import { Component, EventEmitter, Output, inject, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
          <button class="center-btn" (click)="recenterMap()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- Map Container -->
        <div class="map-canvas">
          <!-- Google Map -->
          <div #googleMap class="google-map"></div>

          <!-- Loading state -->
          <div *ngIf="isLoadingMap()" class="map-loading">
            <div class="loading-spinner"></div>
            <p>Loading map...</p>
          </div>

          <!-- Error state -->
          <div *ngIf="mapError()" class="map-error">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>{{ mapError() }}</p>
            <button (click)="initializeMap()" class="retry-btn">Retry</button>
          </div>
        </div>

        <!-- List Toggle -->
        <button class="list-toggle" (click)="showList.set(!showList())" *ngIf="!isLoadingMap() && !mapError()">
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
            <h3>{{ filteredPeople().length }} people nearby</h3>
          </div>
          <div class="list-items">
            <div 
              *ngFor="let person of filteredPeople()" 
              class="list-item"
              (click)="focusOnPerson(person)">
              <img [src]="person.avatarUrl || '/assets/default-avatar.svg'" [alt]="person.name">
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

  showList = signal<boolean>(false);
  isLoadingMap = signal<boolean>(true);
  mapError = signal<string | null>(null);
  filteredPeople = signal<DummyUser[]>([]);
  userLocation = signal<{ lat: number; lng: number } | null>(null);

  private map: any = null;
  private markers: any[] = [];
  private userLocationMarker: any = null;

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    setTimeout(() => this.initializeMap(), 100);
  }

  ngOnDestroy(): void {
    // Cleanup markers
    this.markers.forEach((marker: any) => marker.setMap(null));
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
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
      console.log('✅ Map will center on YOUR location:', location);

      // Initialize map
      const mapOptions = {
        center: { lat: location.lat, lng: location.lng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: this.getMapStyles(),
        gestureHandling: 'greedy',
        zoomControl: true
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
      this.map.setCenter({ lat: location.lat, lng: location.lng });

      // Add user's location marker
      this.addUserLocationMarker();
      
      // Add people markers
      await this.addPeopleMarkers();

      this.isLoadingMap.set(false);
      console.log('✅ Map loaded successfully');
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
}
