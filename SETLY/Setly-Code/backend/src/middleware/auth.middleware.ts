import { Request, Response, NextFunction } from 'express';
import { auth, hasFirebaseCreds } from '../config/firebase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!hasFirebaseCreds || !auth) {
      return res.status(503).json({ error: 'Auth verification disabled (server not configured)' });
    }
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};