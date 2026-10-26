import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { getSupabase, isSupabaseAvailable } from '../services/supabaseService.js';

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

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  // 1. Try local JWT verification
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
      return next();
    }
  } catch (err: any) {
    // Continue to Supabase verification below
  }

  // 2. Try Supabase Auth token verification
  if (isSupabaseAvailable()) {
    try {
      const { data: supaUser, error: supaErr } = await getSupabase()!.auth.getUser(token);
      if (!supaErr && supaUser?.user) {
        const u = supaUser.user;
        let localUser = db.prepare('SELECT id, email, role, display_name FROM profiles WHERE id = ?').get(u.id) as any;
        if (!localUser) {
          const meta = u.user_metadata || {};
          const dName = meta.display_name || u.email?.split('@')[0] || 'User';
          db.prepare(`
            INSERT OR IGNORE INTO profiles (id, email, display_name, role)
            VALUES (?, ?, ?, 'user')
          `).run(u.id, u.email || '', dName);
          localUser = { id: u.id, email: u.email, role: 'user', display_name: dName };
        }

        req.user = {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role || 'user',
          displayName: localUser.display_name,
        };
        return next();
      }
    } catch (e) {
      // Failed Supabase verification
    }
  }

  res.status(401).json({ error: 'Invalid or expired authentication token.' });
}

/**
 * Optional authentication: populates req.user if a valid token exists, but doesn't block unauthenticated requests.
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      return next();
    }
  } catch {
    // Continue to Supabase
  }

  if (isSupabaseAvailable()) {
    try {
      const { data: supaUser, error: supaErr } = await getSupabase()!.auth.getUser(token);
      if (!supaErr && supaUser?.user) {
        const u = supaUser.user;
        const meta = u.user_metadata || {};
        req.user = {
          id: u.id,
          email: u.email || '',
          role: (meta.role as any) || 'user',
          displayName: (meta.display_name as string) || u.email?.split('@')[0] || 'User',
        };
      }
    } catch {}
  }

  next();
}
