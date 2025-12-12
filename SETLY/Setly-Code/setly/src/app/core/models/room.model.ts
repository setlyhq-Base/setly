export interface Room {
  id: string;
  title: string;
  description?: string;
  price: number;            // monthly USD
  deposit?: number;         // refundable security deposit USD
  city: string;
  state?: string;
  coords?: { lat: number; lng: number };
  universityId?: string;
  distanceKm?: number;
  roomType: 'private' | 'shared' | 'entire';
  bath: 'private' | 'shared';
  furnished: boolean;
  rules: { vegetarian: boolean; smoking: boolean; petsOk: boolean };
  photos: string[];
  hostId: string;
  createdAt: string; // ISO
  tags?: string[];   // e.g., 'Indian community', 'No smoking'
  image?: string;
  isAvailable?: boolean;
  address?: string;
  amenities?: string[];
  features?: string[];
  distance?: string | number;
  // New Airbnb-like fields
  availabilityStart?: string; // ISO date string
  availabilityEnd?: string;   // ISO date string
  maxGuests?: number;
  studentVerified?: boolean;
  minStayDays?: number;
  // Optional mock/demo enhancement: attach roommates by user id
  roommateIds?: string[];
  // Optional mock/demo enhancement: per-room memories
  memories?: Array<{
    id: string;
    authorId: string;
    createdAt: string; // ISO
    title: string;
    story: string;
    photoUrl?: string;
  }>;
  // Photos with optional caption (future enhancement)
  photoMeta?: { url: string; caption?: string }[];
  videos?: { url: string; thumbnail?: string; durationSec?: number }[];
}
