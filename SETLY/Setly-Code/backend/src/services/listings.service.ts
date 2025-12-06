import prisma from '../db/prisma';
import { randomUUID } from 'crypto';

export interface ListingRecord {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address?: string;
  lat?: number;
  lon?: number;
  city: string;
  state: string;
  price: number;
  deposit?: number;
  roomType: 'private' | 'shared';
  bath: string;
  furnished: boolean;
  rules?: { vegetarian?: boolean; smoking?: boolean; petsOk?: boolean };
  distanceKm?: number;
  photos: string[];
  videos?: string[];
  amenities?: string[];
  universityId?: string;
  createdAt: string;
}

// Fallback in-memory store if DB operations fail (keeps previous behavior during dev issues)
const memoryRooms: ListingRecord[] = [];

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

function ensureMemorySeed(count = 12) {
  if (memoryRooms.length) return;
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random()*arr.length)];
  const streets = ['Commonwealth Ave','Massachusetts Ave','Huntington Ave','Beacon St','Boylston St'];
  const cities = [
    { city: 'Cambridge', state: 'MA' },
    { city: 'Boston', state: 'MA' },
    { city: 'New York', state: 'NY' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Philadelphia', state: 'PA' }
  ];
  const photos = ROOM_IMAGES;
  for (let i=0;i<count;i++) {
    const place = pick(cities);
  const id = randomUUID();
    memoryRooms.push({
      id,
      ownerId: 'host'+(i+1),
      title: `${i%2===0?'Private':'Shared'} room near campus #${i+1}`,
      description: 'Bright room with study desk, high‑speed Wi‑Fi and great sunlight. Utilities included for most stays.',
      address: `${100+i} ${pick(streets)}, ${place.city}, ${place.state}`,
      lat: 42.36 + Math.random()*0.05,
      lon: -71.05 - Math.random()*0.05,
      city: place.city,
      state: place.state,
      price: 900 + i*25,
      deposit: i%3===0 ? 300 : undefined,
      roomType: i%2===0 ? 'private' : 'shared',
      bath: i%3===0 ? 'private' : 'shared',
      furnished: i%2===0,
      rules: { vegetarian: i%3===0, smoking: false, petsOk: i%4===0 },
      distanceKm: Math.round((Math.random()*8+1)*10)/10,
      photos: [
        photos[i % photos.length],
        photos[(i+1) % photos.length],
        photos[(i+2) % photos.length],
        ...(Math.random() > 0.5 ? [photos[(i+3) % photos.length]] : [])
      ],
      videos: ['/assets/placeholder-video.mp4'],
      amenities: ['High-speed Wi‑Fi','Heating','Study lamp','Closet space','In-unit laundry','Smart lock'],
      universityId: 'uni-'+((i%4)+1),
      createdAt: new Date(Date.now()-i*86400_000).toISOString()
    });
  }
}

export class ListingsService {
  static async list(params?: { ownerId?: string }): Promise<ListingRecord[]> {
    const { ownerId } = params || {};
    try {
      const where: any = {};
      if (ownerId) where.ownerId = ownerId;
      const all = await prisma.room.findMany({ where, orderBy: { createdAt: 'desc' }, include: { photos: true, videos: true, amenities: true } });
      return all.map((found: any) => ({
        id: found.id,
        ownerId: found.ownerId,
        title: found.title,
        description: found.description,
        address: (found as any).address || undefined,
        lat: (found as any).lat ?? undefined,
        lon: (found as any).lon ?? undefined,
        city: found.city,
        state: found.state,
        price: found.price,
        deposit: (found as any).deposit ?? undefined,
        roomType: found.roomType as 'private' | 'shared',
        bath: found.bath,
        furnished: found.furnished,
        rules: {
          vegetarian: (found as any).vegetarian ?? undefined,
          smoking: (found as any).smoking ?? undefined,
          petsOk: (found as any).petsOk ?? undefined
        },
        distanceKm: (found as any).distanceKm ?? undefined,
        photos: (found.photos as any[]).map((p: any) => p.url),
        videos: (found.videos as any[]).map((v: any) => v.url),
        amenities: (found.amenities as any[]).map((a: any) => a.name),
        universityId: (found as any).universityId ?? undefined,
        createdAt: (found as any).createdAt.toISOString()
      }));
    } catch {
      ensureMemorySeed();
      const all = [...memoryRooms];
      return ownerId ? all.filter(r => r.ownerId === ownerId) : all;
    }
  }
  static async create(data: Omit<ListingRecord, 'createdAt'> & { id?: string }): Promise<ListingRecord> {
    try {
      const created = await prisma.room.create({
        data: {
          id: data.id || randomUUID(),
          ownerId: data.ownerId,
          title: data.title,
          description: data.description,
          address: (data as any).address || null,
          lat: typeof (data as any).lat === 'number' ? (data as any).lat : null,
          lon: typeof (data as any).lon === 'number' ? (data as any).lon : null,
          city: data.city,
          state: data.state,
          price: data.price,
          deposit: data.deposit ?? null,
          roomType: data.roomType,
          bath: data.bath,
          furnished: data.furnished,
          // TODO(thumbnail-pipeline): video thumbnails generation planned via ffmpeg Lambda trigger after upload finalize.
          vegetarian: data.rules?.vegetarian ?? null,
          smoking: data.rules?.smoking ?? null,
          petsOk: data.rules?.petsOk ?? null,
          distanceKm: data.distanceKm ?? null,
          universityId: data.universityId ?? null,
          photos: { create: data.photos.map(url => ({ url })) },
          videos: { create: (data.videos || []).map(url => ({ url })) },
          amenities: { create: (data.amenities || []).map(name => ({ name })) }
        },
        include: { photos: true, videos: true, amenities: true }
      });
      return {
        id: created.id,
        ownerId: created.ownerId,
        title: created.title,
        description: created.description,
        address: (created as any).address || undefined,
        lat: (created as any).lat ?? undefined,
        lon: (created as any).lon ?? undefined,
        city: created.city,
        state: created.state,
        price: created.price,
        deposit: (created as any).deposit ?? undefined,
        roomType: created.roomType as 'private' | 'shared',
        bath: created.bath,
        furnished: created.furnished,
        rules: {
          vegetarian: (created as any).vegetarian ?? undefined,
          smoking: (created as any).smoking ?? undefined,
          petsOk: (created as any).petsOk ?? undefined
        },
        distanceKm: (created as any).distanceKm ?? undefined,
        photos: created.photos.map((p: any) => p.url),
        videos: (created.videos || []).map((v: any) => v.url),
        amenities: (created.amenities || []).map((a: any) => a.name),
        universityId: (created as any).universityId ?? undefined,
        createdAt: (created as any).createdAt.toISOString()
      };
    } catch (err) {
      // Fallback to memory store
      ensureMemorySeed();
      const rec: ListingRecord = {
        ...data,
        id: data.id || randomUUID(),
        createdAt: new Date().toISOString()
      };
      memoryRooms.push(rec);
      return rec;
    }
  }

  static async getById(id: string): Promise<ListingRecord | undefined> {
    try {
      const found = await prisma.room.findUnique({ where: { id }, include: { photos: true, videos: true, amenities: true } });
      if (!found) return undefined;
      return {
        id: found.id,
        ownerId: found.ownerId,
        title: found.title,
        description: found.description,
        address: (found as any).address || undefined,
        lat: (found as any).lat ?? undefined,
        lon: (found as any).lon ?? undefined,
        city: found.city,
        state: found.state,
        price: found.price,
        deposit: (found as any).deposit ?? undefined,
        roomType: found.roomType as 'private' | 'shared',
        bath: found.bath,
        furnished: found.furnished,
        rules: {
          vegetarian: (found as any).vegetarian ?? undefined,
          smoking: (found as any).smoking ?? undefined,
          petsOk: (found as any).petsOk ?? undefined
        },
        distanceKm: (found as any).distanceKm ?? undefined,
        photos: (found.photos as any[]).map((p: any) => p.url),
        videos: (found.videos as any[]).map((v: any) => v.url),
        amenities: (found.amenities as any[]).map((a: any) => a.name),
        universityId: (found as any).universityId ?? undefined,
        createdAt: (found as any).createdAt.toISOString()
      };
    } catch {
      ensureMemorySeed();
      return memoryRooms.find(r => r.id === id);
    }
  }

  
}
