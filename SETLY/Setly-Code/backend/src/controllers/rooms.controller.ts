import { Request, Response } from 'express';
import { ListingsService } from '../services/listings.service';

type AuthedRequest = Request & { user?: { uid: string } };

export class RoomsController {
  static async list(req: AuthedRequest, res: Response) {
    const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
    const items = await ListingsService.list({ ownerId });
    res.json({ items });
  }
  static async get(req: AuthedRequest, res: Response) {
    const { id } = req.params;
    const found = await ListingsService.getById(id);
    if (!found) return res.status(404).json({ error: 'not-found' });
    res.json(found);
  }
  static async create(req: AuthedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    const payload = req.body || {};
    const title = (payload.title || '').trim();
    if (!title) return res.status(400).json({ error: 'title-required' });
    const photos: string[] = Array.isArray(payload.photos) ? (payload.photos as any[]).filter((p: any) => typeof p === 'string' && p.length) : [];
    if (photos.length < 3) return res.status(400).json({ error: 'min-photos' });
    const rec = await ListingsService.create({
      ownerId: req.user.uid,
      title,
      description: payload.description || '',
      address: payload.address || undefined,
      lat: typeof payload.lat === 'number' ? payload.lat : undefined,
      lon: typeof payload.lon === 'number' ? payload.lon : undefined,
      city: payload.city || '',
      state: payload.state || '',
      price: Number(payload.price) || 0,
      deposit: Number(payload.deposit) || undefined,
      roomType: (payload.roomType === 'shared' ? 'shared' : 'private'),
      bath: payload.bath || 'shared',
      furnished: !!payload.furnished,
      rules: payload.rules || {},
      distanceKm: typeof payload.distanceKm === 'number' ? payload.distanceKm : undefined,
      photos,
      videos: Array.isArray(payload.videos) ? payload.videos.filter((v: any) => typeof v === 'string' && v.length) : undefined,
      amenities: Array.isArray(payload.amenities) ? payload.amenities.filter((a: any) => typeof a === 'string' && a.length) : undefined,
      universityId: payload.universityId || undefined
    });
    res.status(201).json(rec);
  }
}
