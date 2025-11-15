import express from 'express';
import http from 'http';
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
import universitiesRouter from './routes/universities.routes';
import authRouter from './routes/auth.routes';
import usersRouter from './routes/users.routes';
import presenceRouter from './routes/presence.routes';
import adminRouter from './routes/admin.routes';
import messagesRouter from './routes/messages.routes';
import { messagesHub } from './services/messages.service';
import path from 'path';
import { UserService, StoredUser } from './services/user.service';
import { logger } from './utils/logger';

dotenv.config();
export const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);

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

// NOTE: /api/users/:id is defined in users.routes.ts (mounted below). Avoid duplicating here to prevent conflicts.

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
  logger.warnRate('auth_sync_verify_fail', 30_000, '[auth/sync] verifyIdToken failed:', err?.message || err);
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

    let existing: StoredUser | null = null;
    try {
      existing = await UserService.getByAuthUid(uid);
    } catch (e) {
      console.warn('[auth/sync] getByAuthUid failed, proceeding without existing profile:', (e as any)?.message || e);
    }
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
    logger.error('[POST /api/auth/sync] Error', e?.message || e);
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
app.use('/api/presence', authMiddleware, presenceRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/admin', authMiddleware, adminRouter);
// Public universities dataset routes (front-end can fetch from here or directly from S3)
app.use('/api/universities', universitiesRouter);
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
  logger.error(err.stack || err.message || String(err));
  res.status(500).json({ error: 'Something broke!' });
});

// Start server with simple auto-fallback when the port is already in use (dev convenience)
async function startServer(basePort: number, maxAttempts = 5) {
  let attempt = 0;
  function tryListen(p: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      // Optional WebSocket server using 'ws' if available
      try {
        // Dynamically require to avoid hard dependency
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const WebSocket = require('ws');
        const wss = new WebSocket.Server({ server, path: '/api/messages/ws' });
  wss.on('connection', async (ws: any, req: any) => {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token');
            let uid: string | null = null;
            if (!token) {
              if (process.env.NODE_ENV !== 'production') uid = process.env.DEV_USER_ID || 'dev-user';
            } else if (!hasFirebaseCreds || !adminAuth) {
              if (process.env.NODE_ENV !== 'production') uid = process.env.DEV_USER_ID || 'dev-user';
            } else {
              try { const decoded = await adminAuth!.verifyIdToken(token); uid = decoded.uid || null; } catch { uid = null; }
            }
            if (!uid) { try { ws.close(); } catch {} return; }
            messagesHub.addWsClient(uid, ws);
            ws.on('message', (data: any) => {
              try {
                const msg = JSON.parse(String(data || 'null'));
                if (!msg || typeof msg !== 'object') return;
                if (msg.type === 'typing') {
                  const to = String(msg.to || '');
                  const market = msg.market ? String(msg.market) : undefined;
                  const isTyping = !!msg.isTyping;
                  if (to) messagesHub.emit(to, { type: 'typing', with: uid, market, isTyping });
                }
              } catch {}
            });
            const onSocketEnd = () => {
              try { messagesHub.removeWsClient(uid!, ws); } catch {}
              // Broadcast instant offline presence on WS disconnect
              try { messagesHub.broadcast({ type: 'presence', userId: uid!, online: false, lastSeen: Date.now() }); } catch {}
            };
            ws.on('close', onSocketEnd);
            ws.on('error', onSocketEnd);
          } catch {
            try { ws.close(); } catch {}
          }
        });
      } catch {}
      server
        .listen(p, () => {
          console.log(`Server is running on port ${p}`);
          resolve(p);
        })
        .on('error', (err: any) => {
          if (err?.code === 'EADDRINUSE') return reject(err);
          logger.error('[server] listen error:', err?.message || err);
          return reject(err);
        });
    });
  }

  while (attempt < maxAttempts) {
    const port = basePort + attempt;
    try {
      await tryListen(port);
      return; // success
    } catch (err: any) {
      if (err?.code === 'EADDRINUSE') {
        console.warn(`[server] Port ${port} in use. Trying ${port + 1}...`);
        attempt++;
        continue;
      }
      // Non-port errors: rethrow
      throw err;
    }
  }
  logger.error(`[server] Failed to start after trying ports ${basePort}..${basePort + maxAttempts - 1}`);
}

if (!process.env.JEST_WORKER_ID) {
  // avoid auto listen during test harness if needed
  startServer(DEFAULT_PORT).catch((e) => {
    logger.error('[server] Fatal start error:', e?.message || e);
    process.exitCode = 1;
  });
}