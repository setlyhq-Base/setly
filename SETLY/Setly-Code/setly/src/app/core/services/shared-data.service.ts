import { Injectable, signal, computed, effect } from '@angular/core';
import { RoomStore } from '../state/room.store';
import { inject } from '@angular/core';
import { RidesApiService, type Ride } from './rides-api.service';
import { MarketplaceApiService, type MarketplaceItem } from './marketplace-api.service';
import { environment } from '../../../environments/environment';

/**
 * Shared data service that provides the same data to both Explore and Connect pages.
 * This ensures data consistency across the application - when something is posted in Explore,
 * it automatically appears in Connect.
 * 
 * DATA FLOW (Production):
 * - Rooms: RoomStore → filteredRooms() → API
 * - Rides: RidesApiService → searchRides() → API
 * - Marketplace: MarketplaceApiService → searchItems() → API
 *
 * DATA FLOW (Dev default):
 * - When environment.featureFlags.useDummyData=true, API services serve local deterministic dummy data.
 */
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private roomStore = inject(RoomStore);
  private ridesApi = inject(RidesApiService);
  private marketplaceApi = inject(MarketplaceApiService);

  // ===== REAL DATA FROM BACKEND APIs =====
  // All data now comes from production database (50 dummy users + their posts)
  
  // Rides data (loaded from API)
  private ridesData = signal<Ride[]>([]);
  
  // Marketplace data (loaded from API)
  private marketplaceData = signal<MarketplaceItem[]>([]);

  constructor() {
    // Load rides from backend on initialization
    this.loadRides();
    
    // Load marketplace items from backend on initialization
    this.loadMarketplace();
  }

  /**
   * Load all rides from backend API
   */
  private loadRides() {
    this.ridesApi.searchRides().subscribe({
      next: (response) => {
        const mode = (environment as any)?.featureFlags?.useDummyData ? 'dummy' : 'backend';
        console.log(`✅ Loaded ${response.count} rides (${mode})`);
        if (response.rides && response.rides.length > 0) {
          this.ridesData.set(response.rides);
        } else {
          console.warn('⚠️ Returned 0 rides.');
          this.ridesData.set([]);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load rides:', err);
        this.ridesData.set([]);
      }
    });
  }

  /**
   * Load all marketplace items from backend API
   */
  private loadMarketplace() {
    this.marketplaceApi.searchItems().subscribe({
      next: (response) => {
        const mode = (environment as any)?.featureFlags?.useDummyData ? 'dummy' : 'backend';
        console.log(`✅ Loaded ${response.count} marketplace items (${mode})`);
        if (response.items && response.items.length > 0) {
          this.marketplaceData.set(response.items);
        } else {
          console.warn('⚠️ Returned 0 marketplace items.');
          this.marketplaceData.set([]);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load marketplace:', err);
        this.marketplaceData.set([]);
      }
    });
  }

  // REMOVED: All hardcoded dummy room data (now uses RoomStore from API)
  // REMOVED: private dummyRooms = signal<any[]>([...

  // ===== ROOMS DATA (from RoomStore → API) =====
  // Maps RoomStore data to format expected by UI components
  rooms = computed(() => {
    const storeRooms = this.roomStore.filteredRooms().map((r: any) => ({
      id: r.id,
      title: r.title,
      location: r.city || r.universityName || r.address,
      city: r.city,
      university: r.universityName,
      price: `$${r.price}/mo`,
      priceNum: r.price,
      roomType: r.type || r.roomType || 'private',
      propertyType: r.propertyType || 'Apartment',
      amenities: r.amenities || [],
      verified: r.verified || false,
      rating: r.rating || 4,
      image: r.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      host: r.hostName || 'Host',
      hostId: r.hostId || 'unknown',
      authorId: r.hostName || 'Host',
      condition: 'Good',
      seller: 'Landlord',
      createdAt: r.createdAt || new Date(),
      photos: r.photos || [r.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
      distanceKm: r.distance || 0,
      roomId: r.id,
      verifiedHost: r.verified || false,
      likes: r.likes || 0,
      saved: r.saved || false
    }));
    return storeRooms; // Only API data, no dummy data
  });

  // ===== RIDES DATA (from RidesApiService → API) =====
  // Maps backend ride data to format expected by UI components
  rides = computed(() => {
    return this.ridesData().map((ride: any) => ({
      id: ride.rideId || ride.id,
      type: 'ride',
      title: `${ride.pickupAddress} → ${ride.dropoffAddress}`,
      from: ride.pickupAddress,
      fromLine1: ride.pickupAddress,
      fromLine2: '',
      to: ride.dropoffAddress,
      toLine1: ride.dropoffAddress,
      toLine2: '',
      departureDate: new Date(ride.rideDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      departureTime: ride.rideTime,
      when: new Date(ride.rideDate),
      timeLeftPercent: 75,
      distance: 'TBD', // Calculate from lat/lng if needed
      duration: 'TBD', // Calculate from lat/lng if needed
      price: ride.pricePerSeat ? `$${ride.pricePerSeat}` : 'Free',
      priceNum: ride.pricePerSeat || 0,
      seatsAvailable: ride.seatsAvailable,
      seats: ride.seatsAvailable,
      totalSeats: ride.seatsAvailable + 1,
      driver: ride.userName || 'Driver',
      driverId: ride.userId,
      driverPhoto: ride.userPhoto || '',
      verified: ride.userVerified || false,
      rating: 4.5, // TODO: Add rating to backend
      image: ride.images?.[0] || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
      photos: ride.images || [],
      createdAt: ride.createdAt || new Date(),
      status: ride.status || 'active',
      notes: ride.notes || '',
      likes: 0, // TODO: Add to backend
      saved: false
    }));
  });

  // ===== MARKETPLACE DATA (from MarketplaceApiService → API) =====
  // Maps backend marketplace data to format expected by UI components  
  marketplace = computed(() => {
    return this.marketplaceData().map((item: any) => ({
      id: item.itemId || item.id,
      type: 'market',
      title: item.title,
      category: item.category,
      location: item.location,
      place: item.location,
      state: '', // TODO: Parse from location if needed
      price: `$${item.price}`,
      priceNum: item.price,
      condition: item.condition,
      seller: item.userName || 'Seller',
      sellerName: item.userName || 'Seller',
      authorId: item.userName || 'Seller',
      hostId: item.userId,
      image: item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      badge: item.category,
      description: item.description,
      createdAt: item.createdAt || new Date(),
      photos: item.images || [],
      tags: item.tags || [],
      status: item.status || 'available',
      verified: item.userVerified || false,
      likes: 0, // TODO: Add to backend
      saved: false
    }));
  });

  // REMOVED: All hardcoded dummy ride data (now uses RidesApiService)
  // REMOVED: All hardcoded dummy marketplace data (now uses MarketplaceApiService)

  // ===== HELPER METHODS =====

  // Get all data combined for Connect feed
  getAllPosts() {
    const roomPosts = this.rooms().map(r => ({ ...r, type: 'room' }));
    const ridePosts = this.rides();
    const marketPosts = this.marketplace();
    
    // Combine and sort by createdAt (newest first)
    return [...roomPosts, ...ridePosts, ...marketPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get filtered posts by type
  getPostsByType(type: string) {
    if (type === 'room' || type === 'rooms') return this.rooms().map(r => ({ ...r, type: 'room' }));
    if (type === 'ride' || type === 'rides') return this.rides();
    if (type === 'market' || type === 'marketplace') return this.marketplace();
    return this.getAllPosts();
  }
}
