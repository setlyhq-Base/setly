import express from 'express';
import { auth } from '../config/firebase';

const router = express.Router();

function isAdminEmail(email?: string | null): boolean {
  const allow = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!allow.length) return process.env.NODE_ENV !== 'production'; // allow in dev if unset
  return !!(email && allow.includes(email.toLowerCase()));
}

// GET /api/admin/users?domain=gmail.com&provider=google.com&lastSignInMin=ISO&lastSignInMax=ISO&limit=200
router.get('/users', async (req: any, res) => {
  try {
    if (!req.user?.uid) return res.status(401).json({ error: 'not-authenticated' });
    const requesterEmail = req.user.email as string | undefined;
    if (!isAdminEmail(requesterEmail)) return res.status(403).json({ error: 'forbidden' });
    if (!auth) return res.status(503).json({ error: 'admin-disabled' });

    const { domain, provider, lastSignInMin, lastSignInMax } = req.query as any;
    const limit = Math.max(1, Math.min(1000, parseInt(String(req.query.limit || '200'), 10)));

    let pageToken: string | undefined = undefined;
    const out: any[] = [];
    do {
      const r = await auth.listUsers(1000, pageToken);
      for (const u of r.users) {
        // Filters
        if (domain && u.email && !u.email.toLowerCase().endsWith('@' + String(domain).toLowerCase())) continue;
        if (provider && !u.providerData.some(p => p.providerId === provider)) continue;
        const lastSignIn = u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime).getTime() : undefined;
        if (lastSignInMin && lastSignIn && lastSignIn < new Date(String(lastSignInMin)).getTime()) continue;
        if (lastSignInMax && lastSignIn && lastSignIn > new Date(String(lastSignInMax)).getTime()) continue;
        out.push({
          uid: u.uid,
          email: u.email || null,
          displayName: u.displayName || null,
          phoneNumber: u.phoneNumber || null,
          providerIds: u.providerData.map(p => p.providerId),
          disabled: !!u.disabled,
          creationTime: u.metadata.creationTime,
          lastSignInTime: u.metadata.lastSignInTime
        });
        if (out.length >= limit) break;
      }
      pageToken = r.pageToken || undefined;
      if (out.length >= limit) break;
    } while (pageToken);

    // Sort by lastSignInTime desc
    out.sort((a, b) => {
      const ta = a.lastSignInTime ? new Date(a.lastSignInTime).getTime() : 0;
      const tb = b.lastSignInTime ? new Date(b.lastSignInTime).getTime() : 0;
      return tb - ta;
    });

    return res.json({ total: out.length, users: out });
  } catch (e: any) {
    console.error('[admin/users] error', e);
    return res.status(500).json({ error: e?.message || 'admin-users-failed' });
  }
});

export default router;
