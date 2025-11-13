"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const uploads_routes_1 = __importDefault(require("./routes/uploads.routes"));
const rooms_routes_1 = __importDefault(require("./routes/rooms.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const geo_routes_1 = __importDefault(require("./routes/geo.routes"));
const connect_routes_1 = __importDefault(require("./routes/connect.routes"));
const fs_1 = __importDefault(require("fs"));
const aws_1 = require("./config/aws");
const auth_middleware_1 = require("./middleware/auth.middleware");
const firebase_1 = require("./config/firebase"); // Initialize Firebase
const assistant_routes_1 = __importDefault(require("./routes/assistant.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const path_1 = __importDefault(require("path"));
const user_service_1 = require("./services/user.service");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const port = process.env.PORT || 3000;
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
// Public user lookup (host profiles) for listing pages
exports.app.get('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: 'Missing id' });
        const user = await user_service_1.UserService.getByAuthUid(id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (e) {
        console.error('[GET /api/users/:id] Error', e);
        res.status(500).json({ error: e.message || 'Failed to fetch user' });
    }
});
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
            console.error('[auth/sync] verifyIdToken failed:', err?.message || err);
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
        const existing = await user_service_1.UserService.getByAuthUid(uid);
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
        console.error('[POST /api/auth/sync] Error', e);
        res.status(401).json({ error: 'auth/sync-failed', message: e?.message });
    }
});
// Protected Routes (require auth)
exports.app.use('/api/uploads', auth_middleware_1.authMiddleware, uploads_routes_1.default);
exports.app.use('/api/rooms', auth_middleware_1.authMiddleware, rooms_routes_1.default);
exports.app.use('/api/geo', geo_routes_1.default); // public geocoding search
exports.app.use('/api/connect', connect_routes_1.default); // public connect discovery endpoints
exports.app.use('/', health_routes_1.default);
exports.app.use('/api/auth', auth_middleware_1.authMiddleware, auth_routes_1.default);
exports.app.use('/api/users', auth_middleware_1.authMiddleware, users_routes_1.default);
// Assistant route (no auth required for dev; rely on rate limits server-side if needed)
exports.app.use('/api/assistant', assistant_routes_1.default);
// Dev local avatar upload handler (PUT /uploads/local/:uid/avatar.ext)
exports.app.put('/uploads/local/:uid/:filename', async (req, res) => {
    if (aws_1.AWS_ENABLED)
        return res.status(400).json({ error: 'Local upload disabled when AWS enabled' });
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
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
if (!process.env.JEST_WORKER_ID) { // avoid auto listen during test harness if needed
    exports.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
