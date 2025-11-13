export interface RoomCard {
  id: string;
  title: string;
  price: number;
  image: string;
  address: string;
  distance: string;
  features: string[];
  isAvailable: boolean;
  /** Added for enhanced search */
  city?: string;              // City or locality (parsed / provided)
  universityName?: string;    // Human-readable university name
  hostName?: string;          // Display name of the user who posted the room
  /** Optional availability for date range filtering */
  availabilityStart?: string; // ISO date string
  availabilityEnd?: string;   // ISO date string
}
