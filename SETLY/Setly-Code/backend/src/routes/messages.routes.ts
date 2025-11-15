import { Router } from 'express';
import { messagesHub } from '../services/messages.service';
import prisma from '../db/prisma';
import { auth as adminAuth, hasFirebaseCreds } from '../config/firebase';

async function getUid(req: any): Promise<string | null> {
  if (req.user?.uid) return req.user.uid;
  const header = req.headers?.authorization as string | undefined;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ((req.query?.token as string) || (req.query?.idToken as string));
  if (!token) {
    if (process.env.NODE_ENV !== 'production') return process.env.DEV_USER_ID || 'dev-user';
    return null;
  }
  if (!hasFirebaseCreds || !adminAuth) {
    if (process.env.NODE_ENV !== 'production') return process.env.DEV_USER_ID || 'dev-user';
    return null;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

const router = Router();

// Server-Sent Events stream for real-time messages to the current user
router.get('/stream', async (req, res) => {
  const uid = await getUid(req);
  if (!uid) return res.status(401).end();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  // Initial hello
  res.write(`event: hello\n`);
  res.write(`data: ${JSON.stringify({ ok: true, user: uid })}\n\n`);
  messagesHub.addClient(uid, res);
  const keepAlive = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 25_000);
  req.on('close', () => { clearInterval(keepAlive); messagesHub.removeClient(uid, res); });
});

// Send a message to another user
router.post('/send', async (req, res) => {
  const uid = await getUid(req);
  const { to, text, market, name, avatar } = (req.body || {}) as { to?: string; text?: string; market?: string; name?: string; avatar?: string };
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  if (!to || !text || typeof to !== 'string' || typeof text !== 'string') return res.status(400).json({ error: 'invalid_payload' });
  // Persist
  try {
    await (prisma as any).message.create({ data: { fromUserId: uid, toUserId: to, text, market: market || null } });
  } catch {}
  const msg = messagesHub.send(uid, to, text, market, { name, avatar });
  res.json({ ok: true, message: msg });
});

// Fetch simple history for a conversation (dev convenience)
router.get('/history', async (req, res) => {
  const uid = await getUid(req);
  const other = (req.query.with as string) || '';
  const market = (req.query.market as string) || undefined;
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  if (!other) return res.status(400).json({ error: 'missing_with' });
  // Fetch recent history from DB and map to hub format
  try {
  const items = await (prisma as any).message.findMany({
      where: {
        OR: [
          { fromUserId: uid, toUserId: other, market: market || undefined },
          { fromUserId: other, toUserId: uid, market: market || undefined }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: 200
    });
  const mapped = (items as any[]).map((m: any) => ({ id: m.id, from: m.fromUserId, to: m.toUserId, text: m.text, at: (m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt)).toISOString(), market: m.market || undefined, readAt: m.readAt ? ((m.readAt instanceof Date ? m.readAt : new Date(m.readAt)).toISOString()) : undefined }));
    return res.json({ items: mapped });
  } catch {
    const messages = messagesHub.getHistory(uid, other, market);
    return res.json({ items: messages });
  }
});

export default router;
// Mark messages from counterpart as read and broadcast read receipt
router.post('/read', async (req, res) => {
  const uid = await getUid(req);
  const { with: other, market } = (req.body || {}) as { with?: string; market?: string };
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  if (!other) return res.status(400).json({ error: 'missing_with' });
  try {
    await (prisma as any).message.updateMany({
      where: { fromUserId: other, toUserId: uid, readAt: null, market: market || undefined },
      data: { readAt: new Date() }
    });
  } catch {}
  // Notify the counterpart that their outgoing messages were read
  messagesHub.emit(other, { type: 'read', with: uid, market: market || undefined, at: new Date().toISOString() });
  res.json({ ok: true });
});

// Threads API: summarize conversations with last message and unread count
router.get('/threads', async (req, res) => {
  const uid = await getUid(req);
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  try {
    const items = await (prisma as any).message.findMany({
      where: { OR: [ { fromUserId: uid }, { toUserId: uid } ] },
      orderBy: { createdAt: 'desc' },
      take: 500
    });
    const unread = await (prisma as any).message.findMany({
      where: { toUserId: uid, readAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });
    const unreadMap = new Map<string, number>();
    for (const m of unread as any[]) {
      const key = `${m.fromUserId}:${m.market || ''}`;
      unreadMap.set(key, (unreadMap.get(key) || 0) + 1);
    }
    const map = new Map<string, any>();
    for (const m of items as any[]) {
      const other = m.fromUserId === uid ? m.toUserId : m.fromUserId;
      const key = `${other}:${m.market || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          with: other,
          market: m.market || undefined,
          lastText: m.text,
          lastAt: (m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt)).toISOString(),
          lastFrom: m.fromUserId === uid ? 'me' : 'them',
          unread: unreadMap.get(key) || 0
        });
      }
    }
    const list = Array.from(map.values()).sort((a,b) => Date.parse(b.lastAt) - Date.parse(a.lastAt));
    res.json({ threads: list });
  } catch (e) {
    res.json({ threads: [] });
  }
});
