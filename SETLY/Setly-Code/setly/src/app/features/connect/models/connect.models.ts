export interface ConnectPostBase {
  id: string;
  type: 'person' | 'room' | 'ride' | 'event' | 'thread' | 'update' | 'market';
  authorId: string;
  createdAt: string;
  likes?: number;
  comments?: number;
  saved?: boolean;
  visibility: 'public' | 'verified';
  tags?: string[];
  universityId?: string;
  city?: string;
  pinned?: boolean;
}

export interface PersonPost extends ConnectPostBase {
  type: 'person';
  name: string;
  avatarUrl?: string;
  university?: string;
  company?: string;
  verified: { email?: boolean; phone?: boolean; university?: boolean; photo?: boolean };
  mutuals?: number;
  presence?: 'online' | 'offline' | 'recent';
}

export interface RoomPost extends ConnectPostBase {
  type: 'room';
  roomId: string;
  title: string;
  price: number;
  photos: string[];
  verifiedHost?: boolean;
  distanceKm?: number;
  hostId?: string;
}

export interface RidePost extends ConnectPostBase {
  type: 'ride';
  from: string;
  to: string;
  when: string;
  seats?: number;
  isSetlyRide?: boolean;
  hostId?: string;
  driverVerified?: boolean;
  presence?: 'online' | 'recent' | 'offline';
  mutualsJoined?: number;
}

export interface EventPost extends ConnectPostBase {
  type: 'event';
  name: string;
  when: string;
  where: string;
  cover?: string;
  rsvps?: number;
}

export interface ThreadPost extends ConnectPostBase {
  type: 'thread';
  title: string;
  excerpt: string;
  replies?: number;
  topic: 'visa' | 'banking' | 'neighborhoods' | 'misc';
}

export interface UpdatePost extends ConnectPostBase {
  type: 'update';
  headline: string;
  body?: string;
}

export interface MarketPost extends ConnectPostBase {
  type: 'market';
  title: string;
  price: number;
  images: string[];
  sellerId: string;
  verifiedSeller?: boolean;
  location?: string;
}

export type AnyConnectPost = PersonPost | RoomPost | RidePost | EventPost | ThreadPost | UpdatePost | MarketPost;

export interface ConnectFeedResponse {
  posts: AnyConnectPost[];
  nextCursor?: string;
}

export interface ConnectFilterParams {
  city?: string;
  universityId?: string;
  interests?: string[];
  verifiedOnly?: boolean;
  cursor?: string;
  q?: string;
  sort?: 'trending' | 'new' | 'near';
  roomType?: 'shared' | 'private';
  minPrice?: number;
  maxPrice?: number;
  includeTypes?: Array<'person'|'room'|'ride'|'thread'|'event'|'update'|'market'>;
}

// Social / discovery sidecar types
export interface SuggestionPerson {
  id: string;
  name: string;
  initial: string;
  mutualUniversity?: string;
  activeNow?: boolean;
  connected?: boolean;
  verified?: { university?: boolean; email?: boolean; phone?: boolean; photo?: boolean };
  bio?: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  active: boolean;
  updatedAt: string;
  _pulse?: boolean; // UI animation flag
}

export interface PulseHighlight {
  id: string;
  title: string;
  metric: string;
  icon: string; // inline SVG markup
}
