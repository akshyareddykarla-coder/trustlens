import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const PostClaimSchema = z.object({
  title: z.string().min(5).max(200),
  claimText: z.string().min(10).max(5000),
  analysisId: z.string().optional(),
  summary: z.string().optional(),
});

// List community claims
router.get('/claims', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { search, limit = '20', offset = '0' } = req.query;

  let query = `
    SELECT c.*, p.display_name as author_name, p.role as author_role,
      (SELECT COUNT(*) FROM community_comments WHERE claim_id = c.id) as comment_count
    FROM community_claims c
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.status != 'flagged'
  `;
  const params: any[] = [];

  if (search && typeof search === 'string') {
    query += ' AND (c.title LIKE ? OR c.claim_text LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

  const claims = db.prepare(query).all(...params);

  res.json({ claims });
});

// Submit claim to community
router.post('/claims', authMiddleware, createRateLimiter(60 * 1000, 10), (req: Request, res: Response): void => {
  const parseResult = PostClaimSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { title, claimText, analysisId, summary } = parseResult.data;
  const claimId = `com-${Date.now()}`;

  db.prepare(`
    INSERT INTO community_claims (id, user_id, analysis_id, title, claim_text, summary, status, upvotes, downvotes)
    VALUES (?, ?, ?, ?, ?, ?, 'active', 1, 0)
  `).run(claimId, req.user!.id, analysisId || null, title, claimText, summary || null);

  // Auto record author's upvote
  db.prepare(`
    INSERT INTO community_votes (id, claim_id, user_id, vote_type)
    VALUES (?, ?, ?, 'helpful')
  `).run(`vote-${Date.now()}`, claimId, req.user!.id);

  res.status(201).json({
    id: claimId,
    message: 'Claim posted to Community Verification hub successfully.',
  });
});

// Get single community claim with comments
router.get('/claims/:id', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;

  const claimStmt = db.prepare(`
    SELECT c.*, p.display_name as author_name, p.role as author_role
    FROM community_claims c
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.id = ?
  `);
  const claim = claimStmt.get(id) as any;

  if (!claim) {
    res.status(404).json({ error: 'Community claim not found.' });
    return;
  }

  const comments = db.prepare(`
    SELECT cm.*, p.display_name as author_name, p.role as author_role
    FROM community_comments cm
    LEFT JOIN profiles p ON cm.user_id = p.id
    WHERE cm.claim_id = ?
    ORDER BY cm.created_at ASC
  `).all(id);

  let userVote = null;
  if (req.user) {
    const voteStmt = db.prepare('SELECT vote_type FROM community_votes WHERE claim_id = ? AND user_id = ?');
    const vote = voteStmt.get(id, req.user.id) as any;
    if (vote) userVote = vote.vote_type;
  }

  res.json({
    claim,
    comments,
    userVote,
  });
});

// Post comment
router.post('/claims/:id/comments', authMiddleware, createRateLimiter(60 * 1000, 15), (req: Request, res: Response): void => {
  const { id } = req.params;
  const { content, evidenceUrl, parentId } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Comment content cannot be empty.' });
    return;
  }

  const commentId = `cm-${Date.now()}`;
  db.prepare(`
    INSERT INTO community_comments (id, claim_id, user_id, parent_id, content, evidence_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(commentId, id, req.user!.id, parentId || null, content.trim(), evidenceUrl || null);

  res.status(201).json({
    id: commentId,
    message: 'Comment posted successfully.',
  });
});

// Vote helpful/unhelpful
router.post('/claims/:id/vote', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { voteType } = req.body;

  if (voteType !== 'helpful' && voteType !== 'unhelpful') {
    res.status(400).json({ error: 'Vote must be either "helpful" or "unhelpful".' });
    return;
  }

  const existingVote = db.prepare('SELECT id, vote_type FROM community_votes WHERE claim_id = ? AND user_id = ?').get(id, req.user!.id) as any;

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Toggle off
      db.prepare('DELETE FROM community_votes WHERE id = ?').run(existingVote.id);
      if (voteType === 'helpful') {
        db.prepare('UPDATE community_claims SET upvotes = MAX(0, upvotes - 1) WHERE id = ?').run(id);
      } else {
        db.prepare('UPDATE community_claims SET downvotes = MAX(0, downvotes - 1) WHERE id = ?').run(id);
      }
      res.json({ message: 'Vote removed', userVote: null });
      return;
    } else {
      // Switch vote
      db.prepare('UPDATE community_votes SET vote_type = ? WHERE id = ?').run(voteType, existingVote.id);
      if (voteType === 'helpful') {
        db.prepare('UPDATE community_claims SET upvotes = upvotes + 1, downvotes = MAX(0, downvotes - 1) WHERE id = ?').run(id);
      } else {
        db.prepare('UPDATE community_claims SET downvotes = downvotes + 1, upvotes = MAX(0, upvotes - 1) WHERE id = ?').run(id);
      }
      res.json({ message: 'Vote updated', userVote: voteType });
      return;
    }
  }

  // New vote
  db.prepare(`
    INSERT INTO community_votes (id, claim_id, user_id, vote_type)
    VALUES (?, ?, ?, ?)
  `).run(`vote-${Date.now()}`, id, req.user!.id, voteType);

  if (voteType === 'helpful') {
    db.prepare('UPDATE community_claims SET upvotes = upvotes + 1 WHERE id = ?').run(id);
  } else {
    db.prepare('UPDATE community_claims SET downvotes = downvotes + 1 WHERE id = ?').run(id);
  }

  res.json({ message: 'Vote recorded', userVote: voteType });
});

// Report abusive or spam community claim
router.post('/claims/:id/report', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { reason, details } = req.body;

  if (!reason || typeof reason !== 'string') {
    res.status(400).json({ error: 'Please provide a valid reporting reason.' });
    return;
  }

  const reportId = `rep-${Date.now()}`;
  db.prepare(`
    INSERT INTO content_reports (id, reporter_id, reported_item_type, reported_item_id, reason, details)
    VALUES (?, ?, 'community_claim', ?, ?, ?)
  `).run(reportId, req.user!.id, id, reason, details || null);

  res.status(201).json({ message: 'Report submitted to TrustLens moderation team.' });
});

export default router;
