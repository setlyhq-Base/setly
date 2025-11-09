import { Request as ExpressRequest } from 'express';

export interface User {
  uid: string;
  email: string | undefined;
}

// Extend Express Request to include our custom properties
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}