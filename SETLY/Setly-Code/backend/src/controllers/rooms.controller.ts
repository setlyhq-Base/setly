import { Request, Response } from 'express';
import { ListingsService } from '../services/listings.service';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Client, AWS_CONFIG, AWS_ENABLED } from '../config/aws';
import { randomUUID } from 'crypto';

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
    const city = (payload.city || '').trim();
    const address = (payload.address || '').trim();
    const roomType = (payload.roomType || '').trim();
    const price = Number(payload.price);
    const amenities: string[] = Array.isArray(payload.amenities) ? payload.amenities.filter((a: any) => typeof a === 'string' && a.trim().length) : [];
  const photos: string[] = Array.isArray(payload.photos) ? (payload.photos as any[]).filter((p: any) => typeof p === 'string' && p.length) : [];
  const videos: string[] = Array.isArray(payload.videos) ? (payload.videos as any[]).filter((v: any) => typeof v === 'string' && v.length) : [];
    // Validation with friendly, granular codes
    if (!title) return res.status(400).json({ error: 'title-required', message: 'Title is required' });
    if (!address) return res.status(400).json({ error: 'address-required', message: 'Address is required' });
    if (!city) return res.status(400).json({ error: 'city-required', message: 'City is required' });
    if (!roomType) return res.status(400).json({ error: 'roomType-required', message: 'Room type is required' });
    if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ error: 'price-invalid', message: 'Price per month must be a positive number' });
    if (photos.length < 3) return res.status(400).json({ error: 'min-photos', message: 'At least 3 photos required' });
    if (!amenities.length) return res.status(400).json({ error: 'amenities-required', message: 'Please include at least one amenity' });
    // Server-side video validation (limits + simple extension/type checks)
    if (videos.length > 0) {
      const MAX_VIDEOS = 3;
      if (videos.length > MAX_VIDEOS) return res.status(400).json({ error: 'too-many-videos', message: `Maximum ${MAX_VIDEOS} videos allowed` });
      if (videos.some(v => !/\.(mp4|webm)(?:\?.*)?$/i.test(v))) return res.status(400).json({ error: 'invalid-video-type', message: 'Videos must be MP4 or WebM' });
    }
    const rec = await ListingsService.create({
      // Allow client-provided id to become canonical (optional)
      id: typeof (payload as any).id === 'string' && (payload as any).id.length >= 8 ? (payload as any).id : undefined,
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
  videos: videos.length ? videos : undefined,
      amenities,
      universityId: payload.universityId || undefined
    });
    res.status(201).json(rec);
  }

  // POST /api/rooms/init
  static async init(req: AuthedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const forceLocal = Boolean((req.body || {}).local) || process.env.UPLOADS_FORCE_LOCAL === 'true';
  const useLocal = process.env.NODE_ENV !== 'production' || !AWS_ENABLED || forceLocal;

      const body = req.body || {};
      // Expect files metadata with extensions; convert to normalized content types
      const files: Array<{ ext?: string; contentType?: string }> = Array.isArray(body.files) ? body.files : [];
      if (files.length < 3) return res.status(400).json({ error: 'min-photos' });

      const roomId = randomUUID();
      const uploads: any[] = [];
      for (const f of files) {
        const extRaw = String(f.ext || '').toLowerCase();
        const ext = extRaw === 'jpg' ? 'jpeg' : (extRaw || ((f.contentType || '').split('/')[1] || 'jpeg'));
        const isImage = ['jpeg','png','webp','heic','heif'].includes(ext);
        const isVideo = ['mp4','webm'].includes(ext);
        const contentType = isImage ? `image/${ext}` : (isVideo ? `video/${ext}` : 'application/octet-stream');
        if (!(AWS_CONFIG.allowedContentTypes as readonly string[]).includes(contentType as any)) {
          return res.status(400).json({ error: 'invalid-content-type' });
        }
        const key = `rooms/${roomId}/${randomUUID()}.${ext}`;

        // Dev/local fallback when AWS is not configured: let client PUT directly to /uploads/local
        if (useLocal) {
          const fileName = key.split('/').pop()!;
          const publicUrl = `/uploads/local/${req.user.uid}/${fileName}`;
          uploads.push({
            key,
            url: publicUrl,
            fields: {},
            contentType,
            publicUrl,
            local: true
          });
          continue;
        }

        const presignedPost = await createPresignedPost(s3Client!, {
          Bucket: AWS_CONFIG.bucketName,
          Key: key,
          Conditions: [
            ['content-length-range', 0, AWS_CONFIG.maxFileSize],
            ['eq', '$Content-Type', contentType],
            ['eq', '$x-amz-acl', 'public-read']
          ],
          Fields: {
            'Content-Type': contentType,
            'x-amz-acl': 'public-read'
          },
          Expires: 60
        });
        const publicUrl = `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`;
        uploads.push({ key, url: presignedPost.url, fields: presignedPost.fields, contentType, publicUrl });
      }
      return res.json({ roomId, uploads });
    } catch (e) {
      console.error('[rooms.init] error', e);
      return res.status(500).json({ error: 'init-failed' });
    }
  }

  // POST /api/rooms/:id/publish
  static async publish(req: AuthedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      const { id } = req.params;
      const body = req.body || {};
  const uploaded: string[] = Array.isArray(body.photos) ? body.photos : [];
  const videos: string[] = Array.isArray(body.videos) ? body.videos.filter((v: any) => typeof v === 'string' && v.length) : [];
      if (uploaded.length < 3) return res.status(400).json({ error: 'min-photos' });

      // Build record payload and create listing
      // Video validation on publish as well
      if (videos.length > 0) {
        const MAX_VIDEOS = 3;
        if (videos.length > MAX_VIDEOS) return res.status(400).json({ error: 'too-many-videos', message: `Maximum ${MAX_VIDEOS} videos allowed` });
        if (videos.some(v => !/\.(mp4|webm)(?:\?.*)?$/i.test(v))) return res.status(400).json({ error: 'invalid-video-type', message: 'Videos must be MP4 or WebM' });
      }
      const rec = await ListingsService.create({
        id, // reuse init roomId as canonical listing id
        ownerId: req.user.uid,
        title: (body.title || '').trim() || `${body.roomType || 'Room'} in ${body.city || ''}`.trim(),
        description: body.description || '',
        address: body.address || undefined,
        lat: typeof body.lat === 'number' ? body.lat : undefined,
        lon: typeof body.lon === 'number' ? body.lon : undefined,
        city: body.city || '',
        state: body.state || '',
        price: Number(body.price) || 0,
        deposit: typeof body.deposit === 'number' ? body.deposit : undefined,
        roomType: (body.roomType === 'shared' ? 'shared' : 'private'),
        bath: body.bath || 'shared',
        furnished: !!body.furnished,
        rules: body.rules || {},
        distanceKm: typeof body.distanceKm === 'number' ? body.distanceKm : undefined,
        photos: uploaded,
  videos: videos.length ? videos : undefined,
        amenities: Array.isArray(body.amenities) ? body.amenities : undefined,
        universityId: body.universityId || undefined
      });
      return res.status(201).json(rec);
    } catch (e) {
      console.error('[rooms.publish] error', e);
      return res.status(500).json({ error: 'publish-failed' });
    }
  }
}
