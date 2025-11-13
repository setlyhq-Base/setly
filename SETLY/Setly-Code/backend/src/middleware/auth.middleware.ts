import { Request, Response, NextFunction } from 'express';
import { auth, hasFirebaseCreds } from '../config/firebase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      // Dev bypass: if no Firebase, allow anonymous dev user in non-prod
      if (process.env.NODE_ENV !== 'production') {
        req.user = { uid: process.env.DEV_USER_ID || 'dev-user', email: 'dev@example.com' } as any;
        return next();
      }
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!hasFirebaseCreds || !auth) {
      // Dev bypass: accept any token value and inject a stub user
      if (process.env.NODE_ENV !== 'production') {
        req.user = { uid: process.env.DEV_USER_ID || 'dev-user', email: 'dev@example.com' } as any;
        return next();
      }
      return res.status(503).json({ error: 'Auth verification disabled (server not configured)' });
    }
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (e: any) {
      console.error('[authMiddleware] verifyIdToken failed:', e?.message || e);
      return res.status(401).json({ error: 'Invalid token', message: e?.message });
    }
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error: any) {
    console.error('Auth error (outer):', error?.message || error);
    res.status(401).json({ error: 'Invalid token', message: error?.message });
  }
};