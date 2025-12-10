"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const uploads_routes_1 = __importDefault(require("./routes/uploads.routes"));
const rooms_routes_1 = __importDefault(require("./routes/rooms.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const geo_routes_1 = __importDefault(require("./routes/geo.routes"));
const places_routes_1 = __importDefault(require("./routes/places.routes"));
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const connect_routes_1 = __importDefault(require("./routes/connect.routes"));
const fs_1 = __importDefault(require("fs"));
const aws_1 = require("./config/aws");
const auth_middleware_1 = require("./middleware/auth.middleware");
const firebase_1 = require("./config/firebase"); // Initialize Firebase
const assistant_routes_1 = __importDefault(require("./routes/assistant.routes"));
const universities_routes_1 = __importDefault(require("./routes/universities.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const presence_routes_1 = __importDefault(require("./routes/presence.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const messages_routes_1 = __importDefault(require("./routes/messages.routes"));
const messages_service_1 = require("./services/messages.service");
const path_1 = __importDefault(require("path"));
const user_service_1 = require("./services/user.service");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const DEFAULT_PORT = Number(process.env.PORT || 3000);
// Middleware
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // In dev, allow any local origin to simplify ng serve random ports
        if (process.env.NODE_ENV !== 'production')
            return callback(null, true);
        const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
            .split(',')
            .map(o => o.trim());
        if (!origin || allowed.includes(origin))
            return callback(null, true);
        callback(new Error('CORS not allowed'));
    },
    credentials: true
}));
exports.app.use(express_1.default.json());
// NOTE: /api/users/:id is defined in users.routes.ts (mounted below). Avoid duplicating here to prevent conflicts.
// Unprotected auth sync endpoint (does its own token verification) to avoid proxy/middleware issues during login
exports.app.post('/api/auth/sync', async (req, res) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : req.body?.idToken;
        if (!token && process.env.NODE_ENV !== 'production') {
            // Dev fallback: no token provided
            const demo = await user_service_1.UserService.upsertAuthUser('dev-user', 'dev@example.com', 'Dev User', '');
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
        if (!token)
            return res.status(400).json({ error: 'Missing idToken' });
        if (!firebase_1.auth) {
            if (process.env.NODE_ENV !== 'production') {
                const demo = await user_service_1.UserService.upsertAuthUser('dev-user', 'dev@example.com', 'Dev User', '');
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
        let decoded;
        try {
            decoded = await firebase_1.auth.verifyIdToken(token);
        }
        catch (err) {
            logger_1.logger.warnRate('auth_sync_verify_fail', 30000, '[auth/sync] verifyIdToken failed:', err?.message || err);
            if (process.env.NODE_ENV !== 'production') {
                const demo = await user_service_1.UserService.upsertAuthUser('dev-user', 'dev@example.com', 'Dev User', '');
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
        let existing = null;
        try {
            existing = await user_service_1.UserService.getByAuthUid(uid);
        }
        catch (e) {
            console.warn('[auth/sync] getByAuthUid failed, proceeding without existing profile:', e?.message || e);
        }
        let displayName = decoded.name || '';
        let photoUrl = decoded.picture || '';
        let provider = decoded.firebase?.sign_in_provider || 'unknown';
        let emailVerified = !!decoded.email_verified;
        const phoneNumber = decoded.phone_number || undefined;
        try {
            const fu = await firebase_1.auth.getUser(uid);
            displayName = displayName || fu.displayName || '';
            photoUrl = photoUrl || fu.photoURL || '';
            provider = fu.providerData?.[0]?.providerId || provider;
            emailVerified = emailVerified || !!fu.emailVerified;
        }
        catch { }
        const stored = await user_service_1.UserService.upsertAuthUser(uid, email, displayName, photoUrl);
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
            if (profile.avatarUrl && profile.displayName)
                s += 20;
            if (profile.about && (profile.interests?.length ?? 0) >= 3)
                s += 15;
            if ((profile.location && (profile.university)))
                s += 15;
            if (verifications.phoneVerified || verifications.emailVerified)
                s += 20;
            if (verifications.eduVerified || verifications.idVerified)
                s += 20;
            if (profile.visibility && ('showCity' in profile.visibility))
                s += 10;
            return Math.min(100, s);
        })();
        const canonicalUser = { userId: uid, email: email || null, phone: phoneNumber || null, displayName, photoUrl, provider };
        res.json({ user: canonicalUser, profile, completion, verifications, isNew: !existing });
    }
    catch (e) {
        logger_1.logger.error('[POST /api/auth/sync] Error', e?.message || e);
        res.status(401).json({ error: 'auth/sync-failed', message: e?.message });
    }
});
// Protected Routes (require auth)
exports.app.use('/api/uploads', auth_middleware_1.authMiddleware, uploads_routes_1.default);
exports.app.use('/api/rooms', auth_middleware_1.authMiddleware, rooms_routes_1.default);
exports.app.use('/api/geo', geo_routes_1.default); // public geocoding search
exports.app.use('/api/places', places_routes_1.default); // Google Places proxy endpoints (autocomplete/details/textsearch)
exports.app.use('/api/events', events_routes_1.default); // Events from Ticketmaster and Eventbrite
exports.app.use('/api/connect', connect_routes_1.default); // public connect discovery endpoints
exports.app.use('/', health_routes_1.default);
exports.app.use('/api/auth', auth_middleware_1.authMiddleware, auth_routes_1.default);
exports.app.use('/api/users', auth_middleware_1.authMiddleware, users_routes_1.default);
exports.app.use('/api/presence', auth_middleware_1.authMiddleware, presence_routes_1.default);
exports.app.use('/api/messages', messages_routes_1.default);
exports.app.use('/api/admin', auth_middleware_1.authMiddleware, admin_routes_1.default);
// Public universities dataset routes (front-end can fetch from here or directly from S3)
exports.app.use('/api/universities', universities_routes_1.default);
// Assistant route (no auth required for dev; rely on rate limits server-side if needed)
exports.app.use('/api/assistant', assistant_routes_1.default);
// Dev local avatar upload handler (PUT /uploads/local/:uid/avatar.ext)
exports.app.put('/uploads/local/:uid/:filename', async (req, res) => {
    // Allow local uploads when AWS is disabled OR when explicitly forced for local dev
    const forceLocal = process.env.UPLOADS_FORCE_LOCAL === 'true' || req.headers['x-local-upload'] === 'true';
    if (aws_1.AWS_ENABLED && !forceLocal) {
        return res.status(400).json({ error: 'Local upload disabled when AWS enabled' });
    }
    const { uid, filename } = req.params;
    if (!uid || !filename)
        return res.status(400).json({ error: 'Missing uid or filename' });
    const chunks = [];
    req.on('data', d => chunks.push(d));
    req.on('end', () => {
        try {
            const folder = path_1.default.join(process.cwd(), 'local-uploads', uid);
            fs_1.default.mkdirSync(folder, { recursive: true });
            const filePath = path_1.default.join(folder, filename);
            fs_1.default.writeFileSync(filePath, Buffer.concat(chunks));
            return res.json({ ok: true, path: filePath, publicUrl: `/uploads/local/${uid}/${filename}` });
        }
        catch (e) {
            console.error('[local upload] error', e);
            return res.status(500).json({ error: 'Failed to store file' });
        }
    });
});
// Serve local uploaded files statically in dev
exports.app.use('/uploads/local', express_1.default.static(path_1.default.join(process.cwd(), 'local-uploads')));
// Simple root + health endpoints for easier manual testing
exports.app.get('/', (_req, res) => res.json({ ok: true, service: 'setly-backend', time: new Date().toISOString() }));
exports.app.get('/healthz', (_req, res) => res.json({ ok: true }));
exports.app.get('/api/admin/firebase', (_req, res) => res.json({ ok: true, hasFirebaseCreds: firebase_1.hasFirebaseCreds }));
// Error handler
exports.app.use((err, req, res, next) => {
    logger_1.logger.error(err.stack || err.message || String(err));
    res.status(500).json({ error: 'Something broke!' });
});
// Start server with simple auto-fallback when the port is already in use (dev convenience)
async function startServer(basePort, maxAttempts = 5) {
    let attempt = 0;
    function tryListen(p) {
        return new Promise((resolve, reject) => {
            const server = http_1.default.createServer(exports.app);
            // Optional WebSocket server using 'ws' if available
            try {
                // Dynamically require to avoid hard dependency
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const WebSocket = require('ws');
                const wss = new WebSocket.Server({ server, path: '/api/messages/ws' });
                wss.on('connection', async (ws, req) => {
                    try {
                        const url = new URL(req.url, `http://${req.headers.host}`);
                        const token = url.searchParams.get('token');
                        let uid = null;
                        if (!token) {
                            if (process.env.NODE_ENV !== 'production')
                                uid = process.env.DEV_USER_ID || 'dev-user';
                        }
                        else if (!firebase_1.hasFirebaseCreds || !firebase_1.auth) {
                            if (process.env.NODE_ENV !== 'production')
                                uid = process.env.DEV_USER_ID || 'dev-user';
                        }
                        else {
                            try {
                                const decoded = await firebase_1.auth.verifyIdToken(token);
                                uid = decoded.uid || null;
                            }
                            catch {
                                uid = null;
                            }
                        }
                        if (!uid) {
                            try {
                                ws.close();
                            }
                            catch { }
                            return;
                        }
                        messages_service_1.messagesHub.addWsClient(uid, ws);
                        ws.on('message', (data) => {
                            try {
                                const msg = JSON.parse(String(data || 'null'));
                                if (!msg || typeof msg !== 'object')
                                    return;
                                if (msg.type === 'typing') {
                                    const to = String(msg.to || '');
                                    const market = msg.market ? String(msg.market) : undefined;
                                    const isTyping = !!msg.isTyping;
                                    if (to)
                                        messages_service_1.messagesHub.emit(to, { type: 'typing', with: uid, market, isTyping });
                                }
                            }
                            catch { }
                        });
                        const onSocketEnd = () => {
                            try {
                                messages_service_1.messagesHub.removeWsClient(uid, ws);
                            }
                            catch { }
                            // Broadcast instant offline presence on WS disconnect
                            try {
                                messages_service_1.messagesHub.broadcast({ type: 'presence', userId: uid, online: false, lastSeen: Date.now() });
                            }
                            catch { }
                        };
                        ws.on('close', onSocketEnd);
                        ws.on('error', onSocketEnd);
                    }
                    catch {
                        try {
                            ws.close();
                        }
                        catch { }
                    }
                });
            }
            catch { }
            server
                .listen(p, () => {
                console.log(`Server is running on port ${p}`);
                resolve(p);
            })
                .on('error', (err) => {
                if (err?.code === 'EADDRINUSE')
                    return reject(err);
                logger_1.logger.error('[server] listen error:', err?.message || err);
                return reject(err);
            });
        });
    }
    while (attempt < maxAttempts) {
        const port = basePort + attempt;
        try {
            await tryListen(port);
            return; // success
        }
        catch (err) {
            if (err?.code === 'EADDRINUSE') {
                console.warn(`[server] Port ${port} in use. Trying ${port + 1}...`);
                attempt++;
                continue;
            }
            // Non-port errors: rethrow
            throw err;
        }
    }
    logger_1.logger.error(`[server] Failed to start after trying ports ${basePort}..${basePort + maxAttempts - 1}`);
}
if (!process.env.JEST_WORKER_ID) {
    // avoid auto listen during test harness if needed
    startServer(DEFAULT_PORT).catch((e) => {
        logger_1.logger.error('[server] Fatal start error:', e?.message || e);
        process.exitCode = 1;
    });
}
