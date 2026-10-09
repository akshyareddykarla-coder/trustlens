import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// List verified expert profiles
router.get('/', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const experts = db.prepare(`
    SELECT id, user_id, full_name, expertise_area, bio, organization, verification_status, languages_spoken, avatar_url, created_at
    FROM experts
    WHERE verification_status = 'verified'
    ORDER BY created_at ASC
  `).all() as any[];

  const parsed = experts.map((e) => ({
    ...e,
    languages_spoken: JSON.parse(e.languages_spoken || '["en"]'),
  }));

  res.json({ experts: parsed });
});

// Submit a claim for expert review
router.post('/reviews', authMiddleware, (req: Request, res: Response): void => {
  const { claimText, justification, expertId, analysisId, claimId } = req.body;

  if (!claimText || typeof claimText !== 'string' || claimText.trim().length < 10) {
    res.status(400).json({ error: 'Please describe the claim clearly (minimum 10 characters).' });
    return;
  }

  if (!justification || typeof justification !== 'string') {
    res.status(400).json({ error: 'Please provide justification for requiring professional expert review.' });
    return;
  }

  const requestId = `rev-${Date.now()}`;
  db.prepare(`
    INSERT INTO expert_review_requests (id, user_id, claim_id, analysis_id, expert_id, claim_text, justification, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
  `).run(requestId, req.user!.id, claimId || null, analysisId || null, expertId || null, claimText, justification);

  res.status(201).json({
    id: requestId,
    message: 'Review request submitted to expert verification panel.',
  });
});

// Get user's review requests or expert's assigned requests
router.get('/reviews', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const isExpert = req.user!.role === 'expert' || req.user!.role === 'admin';

  let requests;
  if (isExpert) {
    requests = db.prepare(`
      SELECT r.*, p.display_name as requester_name
      FROM expert_review_requests r
      LEFT JOIN profiles p ON r.user_id = p.id
      ORDER BY r.created_at DESC
    `).all();
  } else {
    requests = db.prepare(`
      SELECT r.*, e.full_name as expert_name
      FROM expert_review_requests r
      LEFT JOIN experts e ON r.expert_id = e.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);
  }

  res.json({ reviewRequests: requests });
});

// Expert updates review
router.patch('/reviews/:id', authMiddleware, requireRole(['expert', 'admin']), (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, expertNotes, verdict } = req.body;

  const validStatuses = ['submitted', 'assigned', 'in_review', 'completed', 'declined'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const existing = db.prepare('SELECT * FROM expert_review_requests WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Review request not found.' });
    return;
  }

  db.prepare(`
    UPDATE expert_review_requests
    SET status = COALESCE(?, status),
        expert_notes = COALESCE(?, expert_notes),
        verdict = COALESCE(?, verdict),
        completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
    WHERE id = ?
  `).run(status || null, expertNotes || null, verdict || null, status || null, id);

  // Notify requester
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link_url, notification_type)
    VALUES (?, ?, ?, ?, ?, 'expert_review_update')
  `).run(
    `notif-${Date.now()}`,
    existing.user_id,
    'Expert Review Update',
    `Your verification review status has updated to: ${status || 'updated'}`,
    '/experts'
  );

  res.json({ message: 'Expert review record updated successfully.' });
});

export default router;
