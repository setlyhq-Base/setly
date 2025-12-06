import express from 'express';
import { db } from '../config/firebase';
import { messagesHub } from '../services/messages.service';
import { firestore } from 'firebase-admin';
import { logger } from '../utils/logger';

const router = express.Router();
const FORCE_MEMORY = process.env.PRESENCE_FORCE_MEMORY === '1' || process.env.FIREBASE_DISABLE === '1';

const TTL_MS = 60_000; // 60 seconds considered online
const memoryPresence = new Map<string, number>();

// POST /api/presence/heartbeat
router.post('/heartbeat', async (req: any, res) => {
  try {
    const user = req.user as { uid: string } | undefined;
    if (!user?.uid) return res.status(401).json({ error: 'not-authenticated' });
    const now = Date.now();
    const debugRequested = process.env.PRESENCE_DEBUG === '1' || req.query.debug === '1' || req.headers['x-presence-debug'] === '1';
    let firestoreStatus: 'ok' | 'fallback' | 'error' | 'disabled' = 'disabled';
  if (db && !FORCE_MEMORY) {
      try {
        await db.collection('presence').doc(user.uid).set({ lastSeen: firestore.Timestamp.fromMillis(now) }, { merge: true });
        // Also mirror in memory to enable TTL-based offline broadcast
        memoryPresence.set(user.uid, now);
        firestoreStatus = 'ok';
      } catch (e) {
        logger.warnRate('presence_heartbeat_firestore_fail', 30_000, '[presence/heartbeat] firestore failed, using memory fallback:', (e as any)?.message || e);
        memoryPresence.set(user.uid, now);
        firestoreStatus = 'fallback';
      }
    } else {
      memoryPresence.set(user.uid, now);
      firestoreStatus = db ? 'disabled' : 'disabled';
    }
    // Broadcast presence update (online true)
    try { messagesHub.broadcast({ type: 'presence', userId: user.uid, online: true, lastSeen: now }); } catch {}
    const payload: any = { ok: true, lastSeen: now };
    if (debugRequested) {
      payload.meta = {
        forceMemory: FORCE_MEMORY,
        firestore: firestoreStatus,
        serverTime: now,
        ttlMs: TTL_MS,
        uid: user.uid
      };
    }
    return res.json(payload);
  } catch (e: any) {
    logger.error('[presence/heartbeat] error', e?.message || e);
    return res.status(500).json({ error: 'heartbeat-failed' });
  }
});

// GET /api/presence/online -> { online: string[], map?: { [uid]: number } }
router.get('/online', async (_req, res) => {
  try {
    const cutoff = Date.now() - TTL_MS;
    let online: string[] = [];
    const map: Record<string, number> = {};
  if (db && !FORCE_MEMORY) {
      try {
        const snap = await db.collection('presence')
          .where('lastSeen', '>=', firestore.Timestamp.fromMillis(cutoff))
          .get();
        online = snap.docs.map(d => d.id);
        for (const d of snap.docs) {
          try { const ts = (d.get('lastSeen') as firestore.Timestamp).toMillis(); map[d.id] = ts; } catch {}
        }
      } catch (e) {
        logger.warnRate('presence_online_firestore_fail', 30_000, '[presence/online] firestore failed, using memory fallback:', (e as any)?.message || e);
        for (const [uid, ts] of memoryPresence.entries()) {
          if (ts >= cutoff) online.push(uid);
          map[uid] = ts;
        }
      }
    } else {
      for (const [uid, ts] of memoryPresence.entries()) {
        if (ts >= cutoff) online.push(uid);
        map[uid] = ts;
      }
    }
    return res.json({ online, ttlMs: TTL_MS, map });
  } catch (e: any) {
    logger.error('[presence/online] error', e?.message || e);
    return res.status(500).json({ error: 'presence-failed' });
  }
});

export default router;

// Background sweeper to broadcast offline when TTL expires (memory-based)
try {
  setInterval(() => {
    const now = Date.now();
    const cutoff = now - TTL_MS;
    for (const [uid, ts] of Array.from(memoryPresence.entries())) {
      if (ts < cutoff) {
        try { messagesHub.broadcast({ type: 'presence', userId: uid, online: false, lastSeen: ts }); } catch {}
        memoryPresence.delete(uid);
      }
    }
  }, 10_000);
} catch {}
