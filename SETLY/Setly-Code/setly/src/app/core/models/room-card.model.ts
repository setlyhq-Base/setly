export interface RoomCard {
  id: string;
  title: string;
  price: number;
  image: string;
  address: string;
  distance: string | number;
  features: string[];
  isAvailable: boolean;
  /** Added for enhanced search */
  city?: string;              // City or locality (parsed / provided)
  universityName?: string;    // Human-readable university name
  hostName?: string;          // Display name of the user who posted the room
  hostId?: string;            // User ID of the host
  /** Optional availability for date range filtering */
  availabilityStart?: string; // ISO date string
  availabilityEnd?: string;   // ISO date string
  /** Additional fields from backend */
  photos?: string[];          // Array of image URLs
  amenities?: string[];       // Same as features, for compatibility
  rating?: number;            // Host rating
  type?: string;              // Room type (private/shared)
  roomType?: string;          // Same as type, for compatibility
  propertyType?: string;      // Apartment/House/etc
  createdAt?: Date | string;  // When posted
  likes?: number;             // Number of likes
  saved?: boolean;            // Whether user saved it
}
