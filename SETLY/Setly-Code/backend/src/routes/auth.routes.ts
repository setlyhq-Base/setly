import { Router, Request, Response } from 'express';
import { auth } from '../config/firebase';
import { UserService, StoredUser } from '../services/user.service';
import { logger } from '../utils/logger';

const router = Router();

type AuthedRequest = Request & { user?: { uid: string; email?: string } };

function toProfileSpec(u: StoredUser): any {
  return {
    userId: u.id,
    displayName: u.displayName,
    avatarUrl: u.photoUrl,
    about: u.bio || '',
    location: [u.city, u.state].filter(Boolean).join(', '),
    university: u.universityId || undefined,
    languages: u.languages || [],
    interests: u.interests || [],
    socials: u.socials || {},
    visibility: {
      publicProfile: true,
      showCity: u.profileVisibility?.about ?? true,
      showSchool: !!u.universityId,
    }
  };
}

function completionFromProfile(p: any, v: { emailVerified: boolean; phoneVerified: boolean; eduVerified: boolean; idVerified: boolean }): number {
  let score = 0;
  if (p.avatarUrl && p.displayName) score += 20;
  if (p.about && (p.interests?.length ?? 0) >= 3) score += 15;
  if ((p.location && (p.university || p.company))) score += 15;
  if (v.phoneVerified || v.emailVerified) score += 20;
  if (v.eduVerified || v.idVerified) score += 20;
  if (p.visibility && ('showCity' in p.visibility)) score += 10;
  return Math.min(100, score);
}

// POST /api/auth/sync
router.post('/sync', async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { uid, email } = req.user;

    // Determine if user existed prior to upsert
    const existing = await UserService.getByAuthUid(uid);

    let displayName = '';
    let photoUrl = '';
    let provider = 'unknown';
    let emailVerified = false;
    let phoneNumber: string | undefined = undefined;
    try {
      if (auth) {
        const firebaseUser = await auth.getUser(uid);
        displayName = firebaseUser.displayName || '';
        photoUrl = firebaseUser.photoURL || '';
        provider = firebaseUser.providerData?.[0]?.providerId || (firebaseUser.providerData?.length ? 'federated' : 'password');
        emailVerified = !!firebaseUser.emailVerified;
        phoneNumber = firebaseUser.phoneNumber || undefined;
      }
    } catch (e) {
      logger.warn('[AUTH SYNC] Could not fetch Firebase user', (e as any)?.message || e);
    }

    const stored = await UserService.upsertAuthUser(uid, email || '', displayName, photoUrl);
    const profile = toProfileSpec(stored);
    const verifications = {
      emailVerified,
      phoneVerified: !!phoneNumber,
      eduVerified: false,
      idVerified: false,
    };
    const completion = completionFromProfile(profile, verifications);

    const canonicalUser = {
      userId: uid,
      email: email || null,
      phone: phoneNumber || null,
      displayName: displayName || stored.displayName || '',
      photoUrl: photoUrl || stored.photoUrl || null,
      provider,
    };

  res.json({ user: canonicalUser, profile, completion, verifications, isNew: !existing });
  } catch (e: any) {
    logger.error('[AUTH SYNC] Error', e?.message || e);
    res.status(500).json({ error: e.message || 'Failed to sync user' });
  }
});

export default router;
