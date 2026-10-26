import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { getSupabase, isSupabaseAvailable } from '../services/supabaseService.js';

const router = Router();

// 1. List expert profiles (Directory with search & category filtering)
router.get('/', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { category, search } = req.query;

  let query = 'SELECT * FROM expert_profiles WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const term = `%${search.trim().toLowerCase()}%`;
    query += ' AND (LOWER(full_name) LIKE ? OR LOWER(organization) LIKE ? OR LOWER(expertise_area) LIKE ?)';
    params.push(term, term, term);
  }

  query += ' ORDER BY is_demo_expert DESC, created_at ASC';

  const rows = db.prepare(query).all(...params) as any[];

  const experts = rows.map((e) => ({
    ...e,
    is_public_reference: Boolean(e.is_public_reference),
    is_demo_expert: Boolean(e.is_demo_expert),
    can_receive_requests: Boolean(e.can_receive_requests),
    languages_spoken: typeof e.languages_spoken === 'string' ? JSON.parse(e.languages_spoken || '["en"]') : e.languages_spoken,
  }));

  res.json({ experts });
});

// 2. Submit Assistance Request to a participating/demo expert
router.post('/requests', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const {
    expertId,
    category,
    subject,
    description,
    preferredLanguage = 'en',
    attachmentUrl = null,
  } = req.body;

  if (!expertId || !subject || !description) {
    res.status(400).json({ error: 'Expert, subject, and description are required.' });
    return;
  }

  if (description.trim().length < 10) {
    res.status(400).json({ error: 'Description must be at least 10 characters long.' });
    return;
  }

  // Verify that the target expert is eligible to receive requests
  const expert = db.prepare('SELECT * FROM expert_profiles WHERE id = ?').get(expertId) as any;
  if (!expert) {
    res.status(404).json({ error: 'Expert profile not found.' });
    return;
  }

  if (!expert.can_receive_requests && !expert.is_demo_expert) {
    res.status(400).json({
      error: 'Public reference profiles are documented for transparency. Requests can only be submitted to participating and demo expert verification desks.',
    });
    return;
  }

  const requestId = `REQ-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const userId = req.user!.id;
  const userName = req.user!.displayName || req.user!.email?.split('@')[0] || 'Citizen Requester';
  const userEmail = req.user!.email;

  // Save to SQLite
  db.prepare(`
    INSERT INTO expert_requests (
      id, user_id, user_name, user_email, expert_id, category, subject, description, preferred_language, attachment_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    requestId,
    userId,
    userName,
    userEmail,
    expertId,
    category || expert.expertise_area || 'Misinformation Verification',
    subject.trim(),
    description.trim(),
    preferredLanguage,
    attachmentUrl
  );

  // Initial user message in request thread
  db.prepare(`
    INSERT INTO expert_messages (id, request_id, sender_id, sender_name, sender_role, content)
    VALUES (?, ?, ?, ?, 'user', ?)
  `).run(`msg-${Date.now()}`, requestId, userId, userName, description.trim());

  // In-app notification for the requester
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link_url, notification_type)
    VALUES (?, ?, ?, ?, ?, 'expert_request')
  `).run(
    `notif-${Date.now()}`,
    userId,
    'Expert Assistance Request Submitted',
    `Your request "${subject.trim().slice(0, 40)}" (${requestId}) was queued for ${expert.full_name}.`,
    '/dashboard/report-center?tab=experts&subtab=my-requests'
  );

  // Sync to Supabase if available
  if (isSupabaseAvailable()) {
    try {
      await getSupabase()!.from('expert_requests').upsert({
        id: requestId,
        user_id: userId.includes('-') && userId.length === 36 ? userId : null,
        user_name: userName,
        user_email: userEmail,
        expert_id: expertId,
        category: category || expert.expertise_area || 'Misinformation Verification',
        subject: subject.trim(),
        description: description.trim(),
        preferred_language: preferredLanguage,
        attachment_url: attachmentUrl,
        status: 'pending',
      });
    } catch (supaErr: any) {
      console.warn('Supabase request sync note:', supaErr.message);
    }
  }

  const createdRequest = db.prepare(`
    SELECT r.*, e.full_name as expert_name, e.title as expert_title, e.organization as expert_organization
    FROM expert_requests r
    LEFT JOIN expert_profiles e ON r.expert_id = e.id
    WHERE r.id = ?
  `).get(requestId);

  res.status(201).json({
    message: 'Expert assistance request submitted successfully.',
    request: createdRequest,
  });
});

// 3. Get Requests (For regular user: My Requests; For expert portal: Assigned/All Demo Requests)
router.get('/requests', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const isExpertRole = req.user!.role === 'expert' || req.user!.role === 'admin';
  const { expertId, status, portal } = req.query;

  let query = `
    SELECT r.*, e.full_name as expert_name, e.title as expert_title, e.organization as expert_organization
    FROM expert_requests r
    LEFT JOIN expert_profiles e ON r.expert_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  // If in expert portal mode or expert role
  if (portal === 'true' || isExpertRole || expertId) {
    if (expertId && expertId !== 'all') {
      query += ' AND r.expert_id = ?';
      params.push(expertId);
    }
  } else {
    // Regular user view: strictly view own requests
    query += ' AND r.user_id = ?';
    params.push(userId);
  }

  if (status && status !== 'all') {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.created_at DESC';

  const requests = db.prepare(query).all(...params) as any[];

  res.json({ requests });
});

// 4. Get Single Request Details with Message Thread
router.get('/requests/:id', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;

  const request = db.prepare(`
    SELECT r.*, e.full_name as expert_name, e.title as expert_title, e.organization as expert_organization
    FROM expert_requests r
    LEFT JOIN expert_profiles e ON r.expert_id = e.id
    WHERE r.id = ?
  `).get(id) as any;

  if (!request) {
    res.status(404).json({ error: 'Expert request not found.' });
    return;
  }

  const messages = db.prepare(`
    SELECT * FROM expert_messages
    WHERE request_id = ?
    ORDER BY created_at ASC
  `).all(id) as any[];

  res.json({ request, messages });
});

// 5. Update Request Status & Actions (Accept, Decline, Review, Reply, Close)
router.patch('/requests/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action, status, responseText, expertNotes, declineReason } = req.body;

  const existing = db.prepare('SELECT * FROM expert_requests WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Expert request not found.' });
    return;
  }

  let nextStatus = existing.status;
  let notes = existing.expert_notes;
  let reply = existing.response_text;
  let respondedAt = existing.responded_at;
  let closedAt = existing.closed_at;

  const senderName = req.user!.displayName || 'Expert Desk';

  if (action === 'accept') {
    nextStatus = 'accepted';
  } else if (action === 'decline') {
    nextStatus = 'declined';
    notes = declineReason || expertNotes || 'Request could not be accommodated at this time.';
  } else if (action === 'review') {
    nextStatus = 'in_review';
  } else if (action === 'reply') {
    if (!responseText || responseText.trim().length === 0) {
      res.status(400).json({ error: 'Response text cannot be empty.' });
      return;
    }
    nextStatus = 'responded';
    reply = responseText.trim();
    respondedAt = new Date().toISOString();

    // Insert into message thread
    db.prepare(`
      INSERT INTO expert_messages (id, request_id, sender_id, sender_name, sender_role, content)
      VALUES (?, ?, ?, ?, 'expert', ?)
    `).run(`msg-${Date.now()}`, id, req.user!.id, senderName, responseText.trim());

    // Create notification for user
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link_url, notification_type)
      VALUES (?, ?, ?, ?, ?, 'expert_reply')
    `).run(
      `notif-${Date.now()}`,
      existing.user_id,
      'Expert Response Received',
      `An expert has responded to your verification request: "${existing.subject.slice(0, 35)}..."`,
      '/dashboard/report-center?tab=experts&subtab=my-requests'
    );
  } else if (action === 'close') {
    nextStatus = 'closed';
    closedAt = new Date().toISOString();
  } else if (status) {
    nextStatus = status;
  }

  db.prepare(`
    UPDATE expert_requests
    SET status = ?,
        expert_notes = ?,
        response_text = ?,
        responded_at = ?,
        closed_at = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(nextStatus, notes, reply, respondedAt, closedAt, id);

  // Sync to Supabase if available
  if (isSupabaseAvailable()) {
    try {
      await getSupabase()!.from('expert_requests').update({
        status: nextStatus,
        expert_notes: notes,
        response_text: reply,
        responded_at: respondedAt,
        closed_at: closedAt,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    } catch (e: any) {
      console.warn('Supabase update sync note:', e.message);
    }
  }

  const updated = db.prepare(`
    SELECT r.*, e.full_name as expert_name, e.title as expert_title, e.organization as expert_organization
    FROM expert_requests r
    LEFT JOIN expert_profiles e ON r.expert_id = e.id
    WHERE r.id = ?
  `).get(id);

  res.json({
    message: `Request status updated to ${nextStatus}.`,
    request: updated,
  });
});

export default router;
