import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'analyst' | 'expert' | 'admin';
  displayName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Development bypass header if token not provided
  const devUserId = req.headers['x-dev-user-id'] as string;
  if (devUserId) {
    const userStmt = db.prepare('SELECT id, email, role, display_name FROM profiles WHERE id = ?');
    const user = userStmt.get(devUserId) as any;
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        displayName: user.display_name,
      };
      return next();
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const userStmt = db.prepare('SELECT id, email, role, display_name FROM profiles WHERE id = ?');
    const user = userStmt.get(decoded.id) as any;

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      displayName: user.display_name,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
    return;
  }
}

/**
 * Optional authentication: populates req.user if a valid token exists, but doesn't block unauthenticated requests.
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-dev-user-id'] as string;

  if (devUserId) {
    const userStmt = db.prepare('SELECT id, email, role, display_name FROM profiles WHERE id = ?');
    const user = userStmt.get(devUserId) as any;
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        displayName: user.display_name,
      };
      return next();
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const userStmt = db.prepare('SELECT id, email, role, display_name FROM profiles WHERE id = ?');
    const user = userStmt.get(decoded.id) as any;
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        displayName: user.display_name,
      };
    }
  } catch {
    // Ignore invalid token on optional routes
  }
  next();
}
