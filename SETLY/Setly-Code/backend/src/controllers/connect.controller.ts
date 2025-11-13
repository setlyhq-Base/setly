import { Request, Response } from 'express';

type AnyConnectPostType = 'person' | 'room' | 'ride' | 'event' | 'thread' | 'update' | 'market';

interface ConnectPostBase {
  id: string;
  type: AnyConnectPostType;
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
interface PersonPost extends ConnectPostBase {
  type: 'person';
  name: string;
  avatarUrl?: string;
  university?: string;
  company?: string;
  verified: { email?: boolean; phone?: boolean; university?: boolean; photo?: boolean };
  mutuals?: number;
  presence?: 'online' | 'offline' | 'recent';
}
interface RoomPost extends ConnectPostBase {
  type: 'room';
  roomId: string;
  title: string;
  price: number;
  photos: string[];
  verifiedHost?: boolean;
  distanceKm?: number;
  hostId?: string;
}
interface RidePost extends ConnectPostBase {
  type: 'ride';
  from: string;
  to: string;
  when: string;
  seats?: number;
  isSetlyRide?: boolean;
  hostId?: string;
  driverVerified?: boolean;
  presence?: 'online' | 'recent' | 'offline';
}
interface EventPost extends ConnectPostBase {
  type: 'event';
  name: string;
  when: string;
  where: string;
  cover?: string;
  rsvps?: number;
}
interface ThreadPost extends ConnectPostBase {
  type: 'thread';
  title: string;
  excerpt: string;
  replies?: number;
  topic: 'visa' | 'banking' | 'neighborhoods' | 'misc';
}
interface UpdatePost extends ConnectPostBase {
  type: 'update';
  headline: string;
  body?: string;
}
interface MarketPost extends ConnectPostBase {
  type: 'market';
  title: string;
  price: number;
  images: string[];
  sellerId: string;
  verifiedSeller?: boolean;
  location?: string;
}
export type AnyConnectPost = PersonPost | RoomPost | RidePost | EventPost | ThreadPost | UpdatePost | MarketPost;

// Local room images
const ROOM_IMAGES = [
  '/assets/images%20/jon-stebbe-paydk0JcIOQ-unsplash.jpg',
  '/assets/images%20/kam-idris-_HqHX3LBN18-unsplash.jpg',
  '/assets/images%20/kam-idris-kyt0PkBSCNQ-unsplash.jpg',
  '/assets/images%20/kara-eads-L7EwHkq1B2s-unsplash.jpg',
  '/assets/images%20/kenny-eliason-Wp7t4cWN-68-unsplash.jpg',
  '/assets/images%20/lotus-design-n-print-0sDzRgrN_pI-unsplash.jpg',
  '/assets/images%20/lotus-design-n-print-r_y2VBvEOIE-unsplash.jpg'
];

const savedSearchesStore: { id: string; label: string; active: boolean; updatedAt: string }[] = [
  { id: 'sv1', label: 'Boston rooms < $1200', active: true, updatedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { id: 'sv2', label: 'SetlyRide to Airport', active: false, updatedAt: new Date(Date.now() - 6*24*60*60*1000).toISOString() }
];

function randomId(prefix = 'p'): string {
  return prefix + Math.random().toString(36).slice(2, 8) + '-' + Date.now().toString(36);
}

export async function getFeed(req: Request, res: Response) {
  try {
    const { cursor, city, universityId, verifiedOnly, roomType, minPrice, maxPrice, includeTypes } = req.query as any;
    // Normalize includeTypes: accept comma-separated string or repeated params
    let include: AnyConnectPostType[] | undefined;
    if (includeTypes) {
      if (Array.isArray(includeTypes)) {
        include = includeTypes as AnyConnectPostType[];
      } else if (typeof includeTypes === 'string') {
        include = includeTypes.split(',').map(s => s.trim()).filter(Boolean) as AnyConnectPostType[];
      }
    }
    const count = 12;
    const posts: AnyConnectPost[] = [];
  const types: AnyConnectPost['type'][] = ['person','room','ride','market','event','thread','update'];
    for (let i = 0; i < count; i++) {
      const base: ConnectPostBase = {
        id: randomId('feed-'),
        type: types[i % types.length],
        authorId: 'user' + ((i % 5) + 1),
        createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
        likes: Math.random() > 0.5 ? Math.floor(Math.random() * 25) : 0,
        comments: Math.random() > 0.6 ? Math.floor(Math.random() * 12) : 0,
        saved: false,
        visibility: Math.random() > 0.75 ? 'verified' : 'public',
        tags: ['Gym', 'Music', 'Coffee'].filter(() => Math.random() > 0.5),
        universityId: universityId || 'uni-' + ((i % 3) + 1),
        city: city || ['Boston', 'NYC', 'Austin'][i % 3],
        pinned: i === 0 && Math.random() > 0.7
      };
      if (base.type === 'person') {
        posts.push({
          ...(base as any),
          type: 'person',
          name: 'Student ' + (i + 1),
          // Use existing public avatars served by Angular/Vite
          avatarUrl: ['/assets/avatars/mike.svg','/assets/avatars/priya.svg','/assets/avatars/sarah.svg','/assets/avatar-placeholder.svg'][i % 4],
          university: ['Northeastern','MIT','Harvard'][i % 3],
          company: Math.random() > 0.6 ? 'Part-time at Cafe' : undefined,
          verified: { email: true, phone: Math.random() > 0.5, university: Math.random() > 0.5, photo: true },
          mutuals: Math.floor(Math.random()*5),
          presence: Math.random() > 0.5 ? 'online' : 'recent'
        });
      } else if (base.type === 'room') {
        const price = 800 + i * 25;
        const rType = i % 2 === 0 ? 'shared' : 'private';
        if (roomType && roomType !== rType) continue;
        const min = typeof minPrice === 'string' ? parseInt(minPrice, 10) : minPrice;
        const max = typeof maxPrice === 'string' ? parseInt(maxPrice, 10) : maxPrice;
        if (typeof min === 'number' && price < min) continue;
        if (typeof max === 'number' && price > max) continue;
        posts.push({
          ...(base as any),
          type: 'room',
          roomId: 'room-' + i,
          title: `${rType === 'shared' ? 'Shared' : 'Private'} room near campus #${i}`,
          price,
          // Use local images as room photos (3-4 per post)
          photos: [
            ROOM_IMAGES[i % ROOM_IMAGES.length],
            ROOM_IMAGES[(i+1) % ROOM_IMAGES.length],
            ROOM_IMAGES[(i+2) % ROOM_IMAGES.length],
            ...(Math.random() > 0.5 ? [ROOM_IMAGES[(i+3) % ROOM_IMAGES.length]] : [])
          ],
          verifiedHost: Math.random() > 0.5,
          distanceKm: Math.round(Math.random() * 8) + 1,
          hostId: 'host' + i
        });
      } else if (base.type === 'ride') {
        posts.push({
          ...(base as any),
          type: 'ride',
          from: base.city || 'Campus',
          to: ['Airport', 'Downtown', 'Mall'][i % 3],
          when: new Date(Date.now() + i * 7200_000).toISOString(),
          seats: 1 + (i % 3),
          isSetlyRide: Math.random() > 0.6,
          hostId: 'driver' + i,
          driverVerified: Math.random() > 0.5,
          presence: Math.random() > 0.5 ? 'online' : 'recent',
          // social proof for rides
          ...(Math.random() > 0.6 ? { mutualsJoined: Math.floor(Math.random() * 4) + 1 } : {})
        });
      } else if (base.type === 'event') {
        posts.push({
          ...(base as any),
          type: 'event',
          name: 'Campus Meetup #' + i,
          when: new Date(Date.now() + i * 86400_000).toISOString(),
          where: (base.city || 'City') + ' Hub',
          cover: ['/assets/boston.jpg','/assets/boston.jpg'][i % 2],
          rsvps: Math.floor(Math.random() * 50)
        });
      } else if (base.type === 'thread') {
        posts.push({
          ...(base as any),
          type: 'thread',
          title: 'How to open a bank account? #' + i,
          excerpt: 'Anyone recently opened an account and can share docs required?',
          replies: Math.floor(Math.random() * 40),
          topic: ['visa', 'banking', 'neighborhoods', 'misc'][i % 4] as any
        });
      } else if (base.type === 'update') {
        posts.push({
          ...(base as any),
          type: 'update',
          headline: 'Setly feature rollout #' + i,
          body: 'We just launched a new improvement to help with onboarding.'
        });
      } else if ((base as any).type === 'market') {
        posts.push({
          ...(base as any),
          type: 'market',
          title: ['Desk','Bike','Laptop','Books'][i % 4] + ' for sale',
          price: Math.floor(Math.random() * 500) + 50,
          images: ['/assets/boston.jpg','/assets/boston.jpg','/assets/boston.jpg'].slice(0, 1 + (i % 3)),
          sellerId: 'seller' + i,
          verifiedSeller: Math.random() > 0.5,
          location: base.city
        } as any);
      }
    }
    let filtered = verifiedOnly ? posts.filter(p => p.visibility === 'verified' || (p.type === 'room' && (p as any).verifiedHost)) : posts;
    if (include && include.length) {
      filtered = filtered.filter(p => include!.includes(p.type));
    }
    const nextCursor = filtered.length ? 'cursor-' + Date.now() : undefined;
    return res.json({ posts: filtered, nextCursor });
  } catch (e: any) {
    console.error('[connect/feed] error', e);
    return res.status(500).json({ error: 'failed' });
  }
}

export async function getSuggestions(_req: Request, res: Response) {
  const list = Array.from({ length: 4 }).map((_, i) => ({
    id: 'sugg-' + i,
    name: 'Student ' + (i + 1),
    initial: ('S' + (i + 1)).slice(0, 2),
    mutualUniversity: i % 2 === 0 ? 'Northeastern' : 'Harvard',
    activeNow: Math.random() > 0.5,
    connected: false
  }));
  return res.json(list);
}

export async function getSavedSearches(_req: Request, res: Response) {
  return res.json(savedSearchesStore);
}

export async function patchSavedSearch(req: Request, res: Response) {
  const id = req.params.id;
  const patch = req.body as Partial<{ label: string; active: boolean }>;
  const idx = savedSearchesStore.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not-found' });
  savedSearchesStore[idx] = {
    ...savedSearchesStore[idx],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  return res.json(savedSearchesStore[idx]);
}

export async function getPulse(_req: Request, res: Response) {
  const highlights = [
    { id: 'p1', title: 'Top verified hosts this week', metric: '5', icon: iconMedal() },
    { id: 'p2', title: 'New Boston listings', metric: '12', icon: iconPin() },
    { id: 'p3', title: 'Popular ride routes', metric: '3', icon: iconCar() }
  ];
  return res.json(highlights);
}

export async function connectUser(_req: Request, res: Response) {
  // In a real system, establish a connection and notify both parties.
  return res.json({ ok: true });
}

export async function savePost(req: Request, res: Response) {
  const id = req.params.id;
  // Optionally honor a 'saved' boolean in the body; otherwise just ack
  const saved = typeof req.body?.saved === 'boolean' ? !!req.body.saved : undefined;
  return res.json({ ok: true, id, saved });
}

export async function reportPost(req: Request, res: Response) {
  const id = req.params.id;
  const reason = req.body?.reason || 'unspecified';
  // In a real system, enqueue moderation task
  return res.json({ ok: true, id, reason });
}

// Inline SVG icon generators
function iconMedal(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#5A4FF3" stroke-width="1.5"/><path d="M8 12l-2 8 6-3 6 3-2-8" stroke="#5A4FF3" stroke-width="1.5" stroke-linejoin="round"/></svg>'; }
function iconPin(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#5A4FF3" stroke-width="1.5"/><circle cx="12" cy="9" r="2" fill="#5A4FF3"/></svg>'; }
function iconCar(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-5h14l2 5v5H3v-5z" stroke="#5A4FF3" stroke-width="1.5"/><circle cx="7.5" cy="17" r="1.5" fill="#5A4FF3"/><circle cx="16.5" cy="17" r="1.5" fill="#5A4FF3"/></svg>'; }
