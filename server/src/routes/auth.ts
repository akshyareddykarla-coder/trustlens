import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/index.js';
import { config } from '../config.js';
import { authMiddleware } from '../middleware/auth.js';
import { getSupabase, isSupabaseAvailable } from '../services/supabaseService.js';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  preferredLanguage: z.enum(['en', 'te', 'hi']).default('en'),
  intendedUse: z.string().optional().default('personal_verification'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parseResult = RegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { email, password, displayName, preferredLanguage, intendedUse } = parseResult.data;

  // Check existing user in local DB
  const checkStmt = db.prepare('SELECT id FROM profiles WHERE email = ?');
  const existing = checkStmt.get(email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  let assignedUserId: string | null = null;

  // Attempt sync with Supabase GoTrue Auth if connected
  if (isSupabaseAvailable()) {
    try {
      const { data: supaData, error: supaError } = await getSupabase()!.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName,
            preferred_language: preferredLanguage,
            intended_use: intendedUse,
          },
        },
      });

      if (supaData?.user?.id) {
        assignedUserId = supaData.user.id;
      }
    } catch (err: any) {
      console.warn('Supabase Auth signup notice:', err.message);
    }
  }

  const userId = assignedUserId || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, email, password_hash, display_name, role, preferred_language, intended_use)
    VALUES (?, ?, ?, ?, 'user', ?, ?)
  `);
  insertProfile.run(userId, email.toLowerCase(), passwordHash, displayName, preferredLanguage, intendedUse);

  const insertPref = db.prepare(`
    INSERT INTO user_preferences (user_id, theme, email_notifications, in_app_notifications)
    VALUES (?, 'light', 1, 1)
  `);
  insertPref.run(userId);

  // Initial welcome notification
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link_url, notification_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertNotif.run(
    `notif-${Date.now()}`,
    userId,
    'Welcome to TrustLens',
    'Start by analyzing suspicious messages or explore our educational media literacy modules.',
    '/verify',
    'system'
  );

  const token = jwt.sign({ id: userId, email: email.toLowerCase() }, config.jwtSecret, { expiresIn: '7d' });

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: userId,
      email: email.toLowerCase(),
      displayName,
      role: 'user',
      preferredLanguage,
      intendedUse,
    },
  });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid email or password format.' });
    return;
  }

  const { email, password } = parseResult.data;

  const stmt = db.prepare('SELECT * FROM profiles WHERE email = ?');
  let user = stmt.get(email.toLowerCase()) as any;

  let authenticated = false;

  if (user && user.password_hash) {
    authenticated = bcrypt.compareSync(password, user.password_hash);
  }

  // If local password check didn't pass or user wasn't in local DB, attempt Supabase Auth
  if (!authenticated && isSupabaseAvailable()) {
    try {
      const { data: supaData, error: supaError } = await getSupabase()!.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (!supaError && supaData?.user) {
        authenticated = true;
        // If user wasn't in local DB yet, auto-provision profile
        if (!user) {
          const newUserId = supaData.user.id || `usr-${Date.now()}`;
          const newHash = bcrypt.hashSync(password, 10);
          const metaName = (supaData.user.user_metadata as any)?.display_name || email.split('@')[0];
          
          db.prepare(`
            INSERT INTO profiles (id, email, password_hash, display_name, role)
            VALUES (?, ?, ?, ?, 'user')
          `).run(newUserId, email.toLowerCase(), newHash, metaName);

          db.prepare(`
            INSERT INTO user_preferences (user_id, theme)
            VALUES (?, 'light')
          `).run(newUserId);

          user = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email.toLowerCase()) as any;
        } else {
          // Update password hash locally so subsequent logins are fast
          const updatedHash = bcrypt.hashSync(password, 10);
          db.prepare('UPDATE profiles SET password_hash = ? WHERE id = ?').run(updatedHash, user.id);
        }
      }
    } catch (err: any) {
      console.warn('Supabase Auth login attempt notice:', err.message);
    }
  }

  if (!authenticated || !user) {
    res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

  // Get preferences
  const prefStmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
  const prefs = (prefStmt.get(user.id) as any) || { theme: 'light' };

  res.json({
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      preferredLanguage: user.preferred_language,
      intendedUse: user.intended_use,
      theme: prefs.theme,
    },
  });
});

router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  const userStmt = db.prepare('SELECT id, email, display_name, role, preferred_language, intended_use, avatar_url, created_at FROM profiles WHERE id = ?');
  const user = userStmt.get(req.user!.id) as any;

  if (!user) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  const prefStmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
  const prefs = prefStmt.get(req.user!.id) as any;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      preferredLanguage: user.preferred_language,
      intendedUse: user.intended_use,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    },
    preferences: prefs || { theme: 'light', email_notifications: 1, in_app_notifications: 1 },
  });
});

router.post('/onboarding', authMiddleware, (req: Request, res: Response): void => {
  const { displayName, preferredLanguage, intendedUse } = req.body;

  const updateStmt = db.prepare(`
    UPDATE profiles
    SET display_name = COALESCE(?, display_name),
        preferred_language = COALESCE(?, preferred_language),
        intended_use = COALESCE(?, intended_use),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  updateStmt.run(displayName || null, preferredLanguage || null, intendedUse || null, req.user!.id);

  res.json({ message: 'Onboarding preferences updated successfully.' });
});

export default router;
