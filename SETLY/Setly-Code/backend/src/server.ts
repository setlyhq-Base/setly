import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import uploadsRouter from './routes/uploads.routes';
import roomsRouter from './routes/rooms.routes';
import healthRouter from './routes/health.routes';
import geoRouter from './routes/geo.routes';
import connectRouter from './routes/connect.routes';
import fs from 'fs';
import { AWS_ENABLED } from './config/aws';
import { authMiddleware } from './middleware/auth.middleware';
import { hasFirebaseCreds, auth as adminAuth } from './config/firebase';  // Initialize Firebase
import assistantRouter from './routes/assistant.routes';
import authRouter from './routes/auth.routes';
import usersRouter from './routes/users.routes';
import path from 'path';
import { UserService, StoredUser } from './services/user.service';

dotenv.config();
export const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // In dev, allow any local origin to simplify ng serve random ports
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
      .split(',')
      .map(o => o.trim());
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('CORS not allowed'));
  },
  credentials: true
}));
app.use(express.json());

// Public user lookup (host profiles) for listing pages
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const user = await UserService.getByAuthUid(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e: any) {
    console.error('[GET /api/users/:id] Error', e);
    res.status(500).json({ error: e.message || 'Failed to fetch user' });
  }
});

// Unprotected auth sync endpoint (does its own token verification) to avoid proxy/middleware issues during login
app.post('/api/auth/sync', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : (req.body?.idToken as string | undefined);
    if (!token && process.env.NODE_ENV !== 'production') {
      // Dev fallback: no token provided
      const demo = await UserService.upsertAuthUser('dev-user', 'dev@example.com', 'Dev User', '');
      const profile = {
        userId: demo.id,
        displayName: demo.displayName,
        avatarUrl: demo.photoUrl,
        about: demo.bio || '',
        location: [demo.city, demo.state].filter(Boolean).join(', '),
        university: demo.universityId || undefined,
        languages: demo.languages || [],
        interests: demo.interests || [],
        socials: demo.socials || {},
        visibility: { publicProfile: true, showCity: demo.profileVisibility?.about ?? true, showSchool: !!demo.universityId }
      };
      const verifications = { emailVerified: true, phoneVerified: false, eduVerified: false, idVerified: false };
      const completion = 60;
      const canonicalUser = { userId: 'dev-user', email: 'dev@example.com', phone: null, displayName: 'Dev User', photoUrl: '', provider: 'dev' };
      return res.json({ user: canonicalUser, profile, completion, verifications, isNew: false });
    }
    if (!token) return res.status(400).json({ error: 'Missing idToken' });
    if (!adminAuth) {
      if (process.env.NODE_ENV !== 'production') {
        const demo = await UserService.upsertAuthUser('dev-user', 'dev@example.com', 'Dev User', '');
        const profile = {
          userId: demo.id,
          displayName: demo.displayName,
          avatarUrl: demo.photoUrl,
          about: demo.bio || '',
          location: [demo.city, demo.state].filter(Boolean).join(', '),
          university: demo.universityId || undefined,
          languages: demo.languages || [],
          interests: demo.interests || [],
          socials: demo.socials || {},
          visibility: { publicProfile: true, showCity: demo.profileVisibility?.about ?? true, showSchool: !!demo.universityId }
        };
        const verifications = { emailVerified: true, phoneVerified: false, eduVerified: false, idVerified: false };
        const completion = 60;
        const canonicalUser = { userId: 'dev-user', email: 'dev@example.com', phone: null, displayName: 'Dev User', photoUrl: '', provider: 'dev' };
        return res.json({ user: canonicalUser, profile, completion, verifications, isNew: false });
      }
      return res.status(503).json({ error: 'Auth verification disabled' });
    }

    let decoded: any;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (err: any) {
      console.error('[auth/sync] verifyIdToken failed:', err?.message || err);
      if (process.env.NODE_ENV !== 'production') {
        const demo = await UserService.upsertAuthUser('dev-user', 'dev@example.com', 'Dev User', '');
        const profile = {
          userId: demo.id,
          displayName: demo.displayName,
          avatarUrl: demo.photoUrl,
          about: demo.bio || '',
          location: [demo.city, demo.state].filter(Boolean).join(', '),
          university: demo.universityId || undefined,
          languages: demo.languages || [],
          interests: demo.interests || [],
          socials: demo.socials || {},
          visibility: { publicProfile: true, showCity: demo.profileVisibility?.about ?? true, showSchool: !!demo.universityId }
        };
        const verifications = { emailVerified: true, phoneVerified: false, eduVerified: false, idVerified: false };
        const completion = 60;
        const canonicalUser = { userId: 'dev-user', email: 'dev@example.com', phone: null, displayName: 'Dev User', photoUrl: '', provider: 'dev' };
        return res.json({ user: canonicalUser, profile, completion, verifications, isNew: false });
      }
      return res.status(401).json({ error: 'invalid-token', message: err?.message });
    }
    const uid = decoded.uid;
    const email = decoded.email || '';

    const existing = await UserService.getByAuthUid(uid);
    let displayName = decoded.name || '';
    let photoUrl = decoded.picture || '';
    let provider = decoded.firebase?.sign_in_provider || 'unknown';
    let emailVerified = !!decoded.email_verified;
    const phoneNumber = decoded.phone_number || undefined;

    try {
      const fu = await adminAuth.getUser(uid);
      displayName = displayName || fu.displayName || '';
      photoUrl = photoUrl || fu.photoURL || '';
      provider = fu.providerData?.[0]?.providerId || provider;
      emailVerified = emailVerified || !!fu.emailVerified;
    } catch {}

    const stored = await UserService.upsertAuthUser(uid, email, displayName, photoUrl);
    const profile = {
      userId: stored.id,
      displayName: stored.displayName,
      avatarUrl: stored.photoUrl,
      about: stored.bio || '',
      location: [stored.city, stored.state].filter(Boolean).join(', '),
      university: stored.universityId || undefined,
      languages: stored.languages || [],
      interests: stored.interests || [],
      socials: stored.socials || {},
      visibility: { publicProfile: true, showCity: stored.profileVisibility?.about ?? true, showSchool: !!stored.universityId }
    };
    const verifications = { emailVerified, phoneVerified: !!phoneNumber, eduVerified: false, idVerified: false };
    const completion = (() => {
      let s = 0;
      if (profile.avatarUrl && profile.displayName) s += 20;
      if (profile.about && (profile.interests?.length ?? 0) >= 3) s += 15;
      if ((profile.location && (profile.university))) s += 15;
      if (verifications.phoneVerified || verifications.emailVerified) s += 20;
      if (verifications.eduVerified || verifications.idVerified) s += 20;
      if (profile.visibility && ('showCity' in profile.visibility)) s += 10;
      return Math.min(100, s);
    })();

    const canonicalUser = { userId: uid, email: email || null, phone: phoneNumber || null, displayName, photoUrl, provider };
    res.json({ user: canonicalUser, profile, completion, verifications, isNew: !existing });
  } catch (e: any) {
    console.error('[POST /api/auth/sync] Error', e);
    res.status(401).json({ error: 'auth/sync-failed', message: e?.message });
  }
});

// Protected Routes (require auth)
app.use('/api/uploads', authMiddleware, uploadsRouter);
app.use('/api/rooms', authMiddleware, roomsRouter);
app.use('/api/geo', geoRouter); // public geocoding search
app.use('/api/connect', connectRouter); // public connect discovery endpoints
app.use('/', healthRouter);
app.use('/api/auth', authMiddleware, authRouter);
app.use('/api/users', authMiddleware, usersRouter);
// Assistant route (no auth required for dev; rely on rate limits server-side if needed)
app.use('/api/assistant', assistantRouter);

// Dev local avatar upload handler (PUT /uploads/local/:uid/avatar.ext)
app.put('/uploads/local/:uid/:filename', async (req, res) => {
  if (AWS_ENABLED) return res.status(400).json({ error: 'Local upload disabled when AWS enabled' });
  const { uid, filename } = req.params;
  if (!uid || !filename) return res.status(400).json({ error: 'Missing uid or filename' });
  const chunks: Buffer[] = [];
  req.on('data', d => chunks.push(d));
  req.on('end', () => {
    try {
      const folder = path.join(process.cwd(), 'local-uploads', uid);
      fs.mkdirSync(folder, { recursive: true });
      const filePath = path.join(folder, filename);
      fs.writeFileSync(filePath, Buffer.concat(chunks));
      return res.json({ ok: true, path: filePath, publicUrl: `/uploads/local/${uid}/${filename}` });
    } catch (e: any) {
      console.error('[local upload] error', e);
      return res.status(500).json({ error: 'Failed to store file' });
    }
  });
});

// Serve local uploaded files statically in dev
app.use('/uploads/local', express.static(path.join(process.cwd(), 'local-uploads')));

// Simple root + health endpoints for easier manual testing
app.get('/', (_req, res) => res.json({ ok: true, service: 'setly-backend', time: new Date().toISOString() }));
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/api/admin/firebase', (_req, res) => res.json({ ok: true, hasFirebaseCreds }));

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

if (!process.env.JEST_WORKER_ID) { // avoid auto listen during test harness if needed
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}