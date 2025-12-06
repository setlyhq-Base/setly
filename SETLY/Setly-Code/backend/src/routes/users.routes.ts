import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AWS_ENABLED, AWS_CONFIG, s3Client } from '../config/aws';
import { db } from '../config/firebase';
import { firestore } from 'firebase-admin';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger';

const router = Router();

type AuthedRequest = Request & { user?: { uid: string; email?: string } };

// GET /api/users (auth) – list users for global directory
router.get('/', async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { limit, cursor, includeIncomplete } = req.query as any;
    const lim = limit ? parseInt(String(limit), 10) : undefined;
    const completeOnly = includeIncomplete ? false : true;
    const { users, nextCursor } = await UserService.listUsers({ limit: lim, cursor: cursor as string | undefined, completeOnly });
    // Fetch presence timestamps (lastSeen) for returned users
  const lastSeenMap = new Map<string, string>();
  const skipPresence = process.env.PRESENCE_FORCE_MEMORY === '1' || process.env.FIREBASE_DISABLE === '1';
  if (!skipPresence && db && users.length) {
      try {
        // Firestore 'in' operator supports up to 10 items per query
        const ids = users.map(u => u.id);
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
        for (const batch of chunks) {
          const snap = await db.collection('presence')
            .where(firestore.FieldPath.documentId(), 'in', batch)
            .get();
          snap.docs.forEach(doc => {
            const ls = (doc.data() as any)?.lastSeen;
            const iso = typeof ls?.toDate === 'function' ? ls.toDate().toISOString() : (typeof ls === 'number' ? new Date(ls).toISOString() : undefined);
            if (iso) lastSeenMap.set(doc.id, iso);
          });
        }
      } catch (e) {
        logger.warnRate('users_presence_lookup_fail', 30_000, '[GET /users] presence lookup failed:', (e as any)?.message || e);
      }
    }
    // Map to lightweight public directory shape
    const mapped = users.map(u => {
      const locationParts = [u.city, u.state, u.country]
        .map(part => typeof part === 'string' ? part.trim() : '')
        .filter(Boolean);
      const location = locationParts.join(', ');
      const lastLoginIso = u.lastLoginAt?.toDate?.().toISOString?.() || u.updatedAt?.toDate?.().toISOString?.();
      const presenceIso = lastSeenMap.get(u.id);
      const rawCompany = (u.company || '').trim();
      const rawOrg = (u.organization || '').trim();
      const rawUniversity = (u.universityId || '').trim();
      const roleToken = ((u.role || '').trim() || (rawUniversity ? 'student' : '')).toLowerCase();
      const role = roleToken ? roleToken[0].toUpperCase() + roleToken.slice(1) : undefined;
      const organization = (roleToken === 'professional'
        ? (rawCompany || rawOrg || rawUniversity)
        : (rawOrg || rawUniversity || rawCompany)) || undefined;
      const universityId = rawUniversity || undefined;
      const company = rawCompany || undefined;
      const profileComplete = typeof u.isProfileComplete === 'boolean' ? u.isProfileComplete : UserService.isProfileComplete(u);
      return {
        id: u.id,
        name: u.displayName,
        avatarUrl: u.photoUrl || undefined,
        role,
        organization,
        company,
        universityId,
        city: u.city || undefined,
        state: u.state || undefined,
        country: u.country || undefined,
        location,
        lastLoginAt: lastLoginIso,
        lastSeen: presenceIso || lastLoginIso,
        profileComplete,
        badges: {
          email: !!u.email,
          phone: !!u.phone,
          university: !!universityId,
          photo: !!u.photoUrl
        }
      };
    });
    res.json({ users: mapped, nextCursor });
  } catch (e: any) {
    logger.error('[GET /users] Error', e?.message || e);
    res.status(500).json({ error: e.message || 'Failed to list users' });
  }
});

// GET /api/users/:id (public) – fetch a user profile by auth UID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      const user = await UserService.getByAuthUid(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    } catch (innerErr: any) {
      logger.warnRate('users_id_primary_lookup_fail', 30_000, '[GET /users/:id] primary lookup failed, attempting fallback:', innerErr?.message || innerErr);
      // Minimal fallback shape without importing admin here (keeps this router slim)
      return res.status(503).json({ error: 'User lookup unavailable' });
    }
  } catch (e: any) {
    logger.error('[GET /users/:id] Error', e?.message || e);
    res.status(500).json({ error: e.message || 'Failed to fetch user' });
  }
});

// GET /api/users/me
router.get('/me', async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const user = await UserService.getByAuthUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e: any) {
    console.error('[GET /users/me] Error', e);
    res.status(500).json({ error: e.message || 'Failed to fetch user' });
  }
});

// PUT /api/users/me
router.put('/me', async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const patch = req.body || {};
    // Guard immutable fields
    delete patch.email;
    delete patch.authUid;
    delete patch.id;
    // Basic sanitization for profileVisibility booleans if present
    if (patch.profileVisibility && typeof patch.profileVisibility === 'object') {
      const pv = patch.profileVisibility as any;
      const allowedKeys = ['about','travelHistory','reviews','interests','connections','verification'];
      for (const k of Object.keys(pv)) {
        if (!allowedKeys.includes(k)) delete pv[k];
        else pv[k] = !!pv[k];
      }
    }

    const updated = await UserService.updateProfile(req.user.uid, patch);

    // Also persist a JSON snapshot to S3 for external/profile consumption if AWS is enabled.
    if (AWS_ENABLED && s3Client) {
      try {
        const key = `profiles/${req.user.uid}.json`;
        const body = JSON.stringify(updated);
        await s3Client.send(new PutObjectCommand({
          Bucket: AWS_CONFIG.bucketName,
          Key: key,
          Body: body,
          ContentType: 'application/json',
          ACL: process.env.S3_PUBLIC_READ === '1' ? 'public-read' : undefined
        }));
        // Optionally include S3 key reference (non-breaking extra property) for clients wanting direct URL.
        (updated as any).s3Key = key;
      } catch (err) {
        console.warn('[PUT /users/me] S3 profile snapshot failed', (err as any)?.message || err);
      }
    }

    res.json(updated);
  } catch (e: any) {
    logger.error('[PUT /users/me] Error', e?.message || e);
    res.status(500).json({ error: e.message || 'Failed to update user' });
  }
});

export default router;
