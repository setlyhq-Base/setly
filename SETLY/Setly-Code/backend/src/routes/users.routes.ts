import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';

const router = Router();

type AuthedRequest = Request & { user?: { uid: string; email?: string } };

// GET /api/users/:id (public) – fetch a user profile by auth UID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const user = await UserService.getByAuthUid(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e: any) {
    console.error('[GET /users/:id] Error', e);
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
    res.json(updated);
  } catch (e: any) {
    console.error('[PUT /users/me] Error', e);
    res.status(500).json({ error: e.message || 'Failed to update user' });
  }
});

export default router;
