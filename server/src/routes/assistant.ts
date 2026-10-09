import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { askAssistant } from '../services/geminiService.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/chat', optionalAuthMiddleware, createRateLimiter(60 * 1000, 25), async (req: Request, res: Response): Promise<void> => {
  const { message, analysisId, conversationId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  try {
    let contextData: any = undefined;

    if (analysisId) {
      const analysis = db.prepare('SELECT * FROM analyses WHERE id = ?').get(analysisId) as any;
      if (analysis) {
        const indicators = db.prepare('SELECT indicator_name FROM risk_indicators WHERE analysis_id = ?').all(analysisId) as any[];
        const sources = db.prepare('SELECT title, publisher, excerpt FROM evidence_sources WHERE analysis_id = ?').all(analysisId) as any[];

        contextData = {
          claimText: analysis.original_input,
          riskLevel: analysis.risk_level,
          indicators: indicators.map((i) => i.indicator_name),
          evidence: sources.map((s) => `${s.publisher}: "${s.title}" — ${s.excerpt}`),
          language: analysis.detected_language,
        };
      }
    }

    const result = await askAssistant(message, contextData);

    let activeConvId = conversationId;
    const userId = req.user ? req.user.id : null;

    if (userId) {
      if (!activeConvId) {
        activeConvId = `conv-${Date.now()}`;
        db.prepare(`
          INSERT INTO assistant_conversations (id, user_id, analysis_id, title)
          VALUES (?, ?, ?, ?)
        `).run(activeConvId, userId, analysisId || null, message.slice(0, 50));
      }

      // Store user message
      db.prepare(`
        INSERT INTO assistant_messages (id, conversation_id, role, content)
        VALUES (?, ?, 'user', ?)
      `).run(`msg-${Date.now()}-u`, activeConvId, message);

      // Store assistant reply
      db.prepare(`
        INSERT INTO assistant_messages (id, conversation_id, role, content)
        VALUES (?, ?, 'assistant', ?)
      `).run(`msg-${Date.now()}-a`, activeConvId, result.reply);
    }

    res.json({
      conversationId: activeConvId || 'session-guest',
      reply: result.reply,
      usedModel: result.usedModel,
    });
  } catch (err: any) {
    console.error('Assistant chat failed:', err);
    res.status(500).json({ error: `Assistant failed to process request: ${err.message}` });
  }
});

// Get past conversation messages
router.get('/conversations/:id', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const messages = db.prepare('SELECT * FROM assistant_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(id);
  res.json({ messages });
});

export default router;
