"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const firebase_1 = require("../config/firebase");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            // Dev bypass: if no Firebase, allow anonymous dev user in non-prod
            if (process.env.NODE_ENV !== 'production') {
                req.user = { uid: process.env.DEV_USER_ID || 'dev-user', email: 'dev@example.com' };
                return next();
            }
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split('Bearer ')[1];
        if (!firebase_1.hasFirebaseCreds || !firebase_1.auth) {
            // Dev bypass: accept any token value and inject a stub user
            if (process.env.NODE_ENV !== 'production') {
                req.user = { uid: process.env.DEV_USER_ID || 'dev-user', email: 'dev@example.com' };
                return next();
            }
            return res.status(503).json({ error: 'Auth verification disabled (server not configured)' });
        }
        let decodedToken;
        try {
            decodedToken = await firebase_1.auth.verifyIdToken(token);
        }
        catch (e) {
            console.error('[authMiddleware] verifyIdToken failed:', e?.message || e);
            return res.status(401).json({ error: 'Invalid token', message: e?.message });
        }
        // Add user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    }
    catch (error) {
        console.error('Auth error (outer):', error?.message || error);
        res.status(401).json({ error: 'Invalid token', message: error?.message });
    }
};
exports.authMiddleware = authMiddleware;
