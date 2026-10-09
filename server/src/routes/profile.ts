import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get profile & statistics
router.get('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;

  const profile = db.prepare('SELECT id, email, display_name, role, preferred_language, intended_use, avatar_url, created_at FROM profiles WHERE id = ?').get(userId);
  const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId);

  // Real calculated activity metrics
  const analysisCount = (db.prepare('SELECT COUNT(*) as c FROM analyses WHERE user_id = ?').get(userId) as any)?.c || 0;
  const communityPostsCount = (db.prepare('SELECT COUNT(*) as c FROM community_claims WHERE user_id = ?').get(userId) as any)?.c || 0;
  const lessonsCompletedCount = (db.prepare('SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND completed = 1').get(userId) as any)?.c || 0;
  const reviewRequestsCount = (db.prepare('SELECT COUNT(*) as c FROM expert_review_requests WHERE user_id = ?').get(userId) as any)?.c || 0;

  res.json({
    profile,
    preferences,
    stats: {
      totalAnalyses: analysisCount,
      communitySubmissions: communityPostsCount,
      completedLessons: lessonsCompletedCount,
      expertRequests: reviewRequestsCount,
    },
  });
});

// Update profile and preferences
router.patch('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const { displayName, preferredLanguage, intendedUse, theme, emailNotifications, inAppNotifications, allowDataAnalytics, dataRetentionDays } = req.body;

  if (displayName || preferredLanguage || intendedUse) {
    db.prepare(`
      UPDATE profiles
      SET display_name = COALESCE(?, display_name),
          preferred_language = COALESCE(?, preferred_language),
          intended_use = COALESCE(?, intended_use),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(displayName || null, preferredLanguage || null, intendedUse || null, userId);
  }

  db.prepare(`
    INSERT INTO user_preferences (user_id, theme, email_notifications, in_app_notifications, allow_data_analytics, data_retention_days)
    VALUES (?, COALESCE(?, 'light'), COALESCE(?, 1), COALESCE(?, 1), COALESCE(?, 0), COALESCE(?, 90))
    ON CONFLICT(user_id) DO UPDATE SET
      theme = COALESCE(excluded.theme, user_preferences.theme),
      email_notifications = COALESCE(excluded.email_notifications, user_preferences.email_notifications),
      in_app_notifications = COALESCE(excluded.in_app_notifications, user_preferences.in_app_notifications),
      allow_data_analytics = COALESCE(excluded.allow_data_analytics, user_preferences.allow_data_analytics),
      data_retention_days = COALESCE(excluded.data_retention_days, user_preferences.data_retention_days),
      updated_at = CURRENT_TIMESTAMP
  `).run(
    userId,
    theme || null,
    emailNotifications !== undefined ? (emailNotifications ? 1 : 0) : null,
    inAppNotifications !== undefined ? (inAppNotifications ? 1 : 0) : null,
    allowDataAnalytics !== undefined ? (allowDataAnalytics ? 1 : 0) : null,
    dataRetentionDays || null
  );

  res.json({ message: 'Profile and privacy preferences updated successfully.' });
});

// Privacy compliance: complete data export
router.get('/export', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;

  const profile = db.prepare('SELECT id, email, display_name, role, preferred_language, intended_use, created_at FROM profiles WHERE id = ?').get(userId);
  const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId);
  const analyses = db.prepare('SELECT * FROM analyses WHERE user_id = ?').all(userId);
  const communityPosts = db.prepare('SELECT * FROM community_claims WHERE user_id = ?').all(userId);
  const comments = db.prepare('SELECT * FROM community_comments WHERE user_id = ?').all(userId);
  const lessonProgress = db.prepare('SELECT * FROM lesson_progress WHERE user_id = ?').all(userId);

  const exportPayload = {
    exportDate: new Date().toISOString(),
    account: profile,
    preferences,
    analyses,
    communityPosts,
    comments,
    lessonProgress,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="trustlens-data-export-${userId}.json"`);
  res.json(exportPayload);
});

// Account deletion
router.delete('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;

  // Delete all cascades
  db.prepare('DELETE FROM analyses WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM user_preferences WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM profiles WHERE id = ?').run(userId);

  res.json({ message: 'Account and all associated private records deleted permanently.' });
});

export default router;
