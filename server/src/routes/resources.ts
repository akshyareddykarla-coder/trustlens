import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = Router();

// Get list of official citizen reporting resources
router.get('/', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { category, search } = req.query;

  let query = 'SELECT * FROM reporting_resources WHERE is_active = 1';
  const params: any[] = [];

  if (category && typeof category === 'string' && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search && typeof search === 'string') {
    query += ' AND (title LIKE ? OR description LIKE ? OR jurisdiction LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY title ASC';

  const resources = db.prepare(query).all(...params);
  res.json({ resources });
});

// Report a broken official link
router.post('/report-broken', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { resourceId, notes } = req.body;
  const reporterId = req.user ? req.user.id : null;

  if (!resourceId) {
    res.status(400).json({ error: 'Resource ID is required.' });
    return;
  }

  const reportId = `rep-res-${Date.now()}`;
  db.prepare(`
    INSERT INTO content_reports (id, reporter_id, reported_item_type, reported_item_id, reason, details)
    VALUES (?, ?, 'reporting_resource_broken_link', ?, 'Broken or outdated link', ?)
  `).run(reportId, reporterId, resourceId, notes || 'User reported broken official link.');

  res.status(201).json({ message: 'Thank you. The official link will be checked and verified by our editorial maintainers.' });
});

export default router;
