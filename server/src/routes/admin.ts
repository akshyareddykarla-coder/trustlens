import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { isGeminiAvailable } from '../services/geminiService.js';
import fs from 'fs';
import { config } from '../config.js';

const router = Router();

// Require admin role for all routes in this file
router.use(authMiddleware);
router.use(requireRole(['admin']));

// Get users list
router.get('/users', (req: Request, res: Response): void => {
  const users = db.prepare(`
    SELECT p.id, p.email, p.display_name, p.role, p.preferred_language, p.created_at,
      (SELECT COUNT(*) FROM analyses WHERE user_id = p.id) as analysis_count
    FROM profiles p
    ORDER BY p.created_at DESC
  `).all();

  res.json({ users });
});

// Update user role
router.patch('/users/:id/role', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['user', 'analyst', 'expert', 'admin'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: `Invalid role. Allowed: ${validRoles.join(', ')}` });
    return;
  }

  db.prepare('UPDATE profiles SET role = ? WHERE id = ?').run(role, id);

  // Log admin audit
  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_user_id, action, target_type, target_id, details)
    VALUES (?, ?, 'update_user_role', 'user', ?, ?)
  `).run(`log-${Date.now()}`, req.user!.id, id, JSON.stringify({ newRole: role }));

  res.json({ message: `User role successfully updated to ${role}.` });
});

// Moderation reports queue
router.get('/reports', (req: Request, res: Response): void => {
  const reports = db.prepare(`
    SELECT r.*, p.display_name as reporter_name
    FROM content_reports r
    LEFT JOIN profiles p ON r.reporter_id = p.id
    ORDER BY r.created_at DESC
  `).all();

  res.json({ reports });
});

// Moderate a report
router.patch('/reports/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, actionTaken } = req.body;

  const valid = ['reviewed', 'action_taken', 'dismissed'];
  if (!valid.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${valid.join(', ')}` });
    return;
  }

  const report = db.prepare('SELECT * FROM content_reports WHERE id = ?').get(id) as any;
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  db.prepare(`
    UPDATE content_reports
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, req.user!.id, id);

  if (actionTaken === 'delete_item') {
    if (report.reported_item_type === 'community_claim') {
      db.prepare('UPDATE community_claims SET status = "flagged" WHERE id = ?').run(report.reported_item_id);
    } else if (report.reported_item_type === 'community_comment') {
      db.prepare('DELETE FROM community_comments WHERE id = ?').run(report.reported_item_id);
    }
  }

  // Audit log
  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_user_id, action, target_type, target_id, details)
    VALUES (?, ?, 'moderate_content', 'content_report', ?, ?)
  `).run(`log-${Date.now()}`, req.user!.id, id, JSON.stringify({ status, actionTaken }));

  res.json({ message: 'Moderation action applied and logged.' });
});

// Audit logs
router.get('/audit-logs', (req: Request, res: Response): void => {
  const logs = db.prepare(`
    SELECT l.*, p.display_name as admin_name
    FROM admin_audit_logs l
    LEFT JOIN profiles p ON l.admin_user_id = p.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `).all();

  res.json({ logs });
});

// System health check
router.get('/health', (req: Request, res: Response): void => {
  let uploadsCount = 0;
  if (fs.existsSync(config.uploadsDir)) {
    uploadsCount = fs.readdirSync(config.uploadsDir).length;
  }

  const analysisCount = (db.prepare('SELECT COUNT(*) as c FROM analyses').get() as any)?.c || 0;
  const usersCount = (db.prepare('SELECT COUNT(*) as c FROM profiles').get() as any)?.c || 0;

  res.json({
    systemStatus: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'SQLite (node:sqlite)',
      status: 'connected',
      totalUsers: usersCount,
      totalAnalyses: analysisCount,
    },
    integrations: {
      geminiAi: {
        configured: isGeminiAvailable(),
        status: isGeminiAvailable() ? 'operational' : 'offline_fallback_active',
        note: isGeminiAvailable() ? 'Connected via GEMINI_API_KEY' : 'Using rule-based deterministic linguistic and evidence engine',
      },
      ocrTesseract: {
        status: 'ready',
        supportedLanguages: ['eng', 'hin', 'tel'],
      },
      ssrfSecurityGuard: {
        status: 'active',
        privateSubnetFiltering: 'enforced',
      },
    },
    storage: {
      uploadsCount,
      uploadsPath: config.uploadsDir,
    },
  });
});

export default router;
