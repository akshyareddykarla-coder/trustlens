import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// List user notifications
router.get('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).all(userId);

  const unreadCountStmt = db.prepare('SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0');
  const unreadResult = unreadCountStmt.get(userId) as { unread: number };

  res.json({
    notifications,
    unreadCount: unreadResult ? unreadResult.unread : 0,
  });
});

// Mark single notification as read
router.patch('/:id', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const userId = req.user!.id;

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Notification marked as read.' });
});

// Mark all notifications as read
router.post('/mark-all-read', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  res.json({ message: 'All notifications marked as read.' });
});

export default router;
