import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import { db } from '../db/index.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { analyzeLinguisticSignals, extractClaims } from '../services/linguisticAnalyzer.js';
import { searchEvidenceForClaims } from '../services/evidenceService.js';
import { validateUrlForSsrf } from '../services/ssrfGuard.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const CreateAnalysisSchema = z.object({
  inputType: z.enum(['text', 'image', 'url']).default('text'),
  content: z.string().min(5, 'Input text must be at least 5 characters').max(15000, 'Input exceeds maximum length'),
  language: z.enum(['en', 'te', 'hi', 'auto']).default('auto'),
  sourceUrl: z.string().optional(),
});

// SSRF-safe URL preview / article text extraction
router.post('/url-preview', authMiddleware, createRateLimiter(60 * 1000, 15), async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Valid URL is required.' });
    return;
  }

  const ssrfCheck = await validateUrlForSsrf(url);
  if (!ssrfCheck.valid) {
    res.status(400).json({ error: ssrfCheck.error });
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TrustLens-Verification-Bot/1.0 (+https://trustlens.org/bot)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      res.status(400).json({ error: 'URL did not return readable HTML or text content.' });
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, and footer tags
    $('script, style, nav, footer, header, aside, .advertisement, #comments').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Extracted Web Article';
    let articleText = $('article').text().trim();
    if (!articleText || articleText.length < 100) {
      articleText = $('main').text().trim() || $('body').text().trim();
    }

    // Clean whitespace
    const cleanedText = articleText.replace(/\s+/g, ' ').slice(0, 6000);

    res.json({
      title,
      url,
      extractedText: cleanedText,
    });
  } catch (err: any) {
    res.status(502).json({
      error: `Failed to retrieve article: ${err.message}. Please copy and paste the article text manually.`,
    });
  }
});

// Create and execute analysis pipeline
router.post('/', optionalAuthMiddleware, createRateLimiter(60 * 1000, 20), async (req: Request, res: Response): Promise<void> => {
  const parseResult = CreateAnalysisSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { inputType, content, language, sourceUrl } = parseResult.data;
  const userId = req.user ? req.user.id : null;

  try {
    // 1. Linguistic Analysis
    const linguisticResult = analyzeLinguisticSignals(content);
    const finalLanguage = language === 'auto' ? linguisticResult.detectedLanguage : language;

    // 2. Claim Extraction
    const claims = linguisticResult.extractedClaims.length > 0 ? linguisticResult.extractedClaims : [content.slice(0, 200)];

    // 3. Evidence Retrieval
    const evidenceResult = await searchEvidenceForClaims(claims, content);

    // 4. Combined Risk Scoring & Qualified Categorization
    let adjustedScore = linguisticResult.riskScore;
    let finalRiskLevel = linguisticResult.riskLevel;
    let uncertainty = linguisticResult.uncertaintyRating;

    // Evaluate evidence influence
    const contradictingSources = evidenceResult.sources.filter((s) => s.stance === 'contradicts');
    const supportingSources = evidenceResult.sources.filter((s) => s.stance === 'supports');

    if (contradictingSources.length > 0) {
      adjustedScore = Math.max(78, adjustedScore + 30);
      finalRiskLevel = 'elevated_risk';
      uncertainty = 'low';
      linguisticResult.indicators.unshift({
        name: 'Direct Contradiction with Credible Fact-Check',
        category: 'Evidence Conflict',
        observedSnippet: contradictingSources[0].title,
        explanation: `Claim directly contradicts verified findings published by ${contradictingSources[0].publisher}.`,
        limitation: 'Fact-checks apply specifically to the tested version of the claim.',
        severity: 'high',
        points: 40,
      });
    } else if (supportingSources.length > 0) {
      adjustedScore = Math.min(22, Math.max(5, adjustedScore - 30));
      finalRiskLevel = 'lower_risk';
      uncertainty = 'low';
      linguisticResult.indicators.unshift({
        name: 'Corroboration from Verified Official / Media Source',
        category: 'Evidence Corroboration',
        observedSnippet: supportingSources[0].title,
        explanation: `Factual events are independently corroborated by official publication from ${supportingSources[0].publisher}.`,
        limitation: 'Ongoing events remain subject to subsequent updates or revisions.',
        severity: 'low',
        points: -30,
      });
    } else {
      // Missing or inconclusive evidence
      linguisticResult.indicators.push({
        name: 'Absence of Verified Independent Corroboration',
        category: 'Verification Status',
        observedSnippet: null,
        explanation: 'No indexed fact-checking debunking or corroborating press releases were located for this specific claim.',
        limitation: 'Absence of evidence is not proof of falsehood. Emerging news or hyper-local matters may not have indexed coverage.',
        severity: 'medium',
        points: 10,
      });
    }

    adjustedScore = Math.min(95, Math.max(5, adjustedScore));

    // Generate comprehensive summary
    let analysisSummary = '';
    if (contradictingSources.length > 0) {
      analysisSummary = `Elevated risk signals detected. Verified fact-checking records from ${contradictingSources[0].publisher} indicate this claim is misleading or inaccurate. Do not amplify or forward this content.`;
    } else if (supportingSources.length > 0) {
      analysisSummary = `Lower risk signals observed. The factual claims are corroborated by reporting from ${supportingSources[0].publisher}. The language demonstrates restrained and specific attribution.`;
    } else if (linguisticResult.indicators.some((i) => i.severity === 'high')) {
      analysisSummary = `Elevated risk indicators observed in message styling (urgent forwarding incentives and sensationalized vocabulary). While no specific registry entry was found, caution is strongly advised until primary sources confirm the facts.`;
    } else {
      analysisSummary = `Analysis completed with moderate uncertainty. No direct contradiction was found, but the claim lacks verifiable source citations. Independent verification is recommended.`;
    }

    const analysisId = `ana-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 5. Database Persistence
    const insertAnalysis = db.prepare(`
      INSERT INTO analyses (
        id, user_id, input_type, original_input, extracted_text,
        detected_language, risk_level, risk_score, uncertainty_rating,
        summary, methodology, status, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 0)
    `);

    const methodologyText = 'Hybrid algorithmic linguistic heuristic model combined with live corroboration against open fact-checking registries and search references.';

    insertAnalysis.run(
      analysisId,
      userId,
      inputType,
      content,
      content,
      finalLanguage,
      finalRiskLevel,
      adjustedScore,
      uncertainty,
      analysisSummary,
      methodologyText
    );

    // Insert Claims
    const insertClaim = db.prepare(`
      INSERT INTO analysis_claims (id, analysis_id, claim_text, position, assessment, verification_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    claims.forEach((claimText, idx) => {
      const claimId = `clm-${Date.now()}-${idx}`;
      let claimAssessment = 'Requires primary verification';
      let claimStatus = 'unverified';
      if (contradictingSources.length > 0) {
        claimAssessment = `Contradicted by ${contradictingSources[0].publisher}`;
        claimStatus = 'contradicted';
      } else if (supportingSources.length > 0) {
        claimAssessment = `Corroborated by ${supportingSources[0].publisher}`;
        claimStatus = 'verified';
      }
      insertClaim.run(claimId, analysisId, claimText, idx + 1, claimAssessment, claimStatus);
    });

    // Insert Indicators
    const insertIndicator = db.prepare(`
      INSERT INTO risk_indicators (id, analysis_id, indicator_name, indicator_category, observed_snippet, explanation, limitation, severity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    linguisticResult.indicators.forEach((ind, idx) => {
      insertIndicator.run(
        `ind-${Date.now()}-${idx}`,
        analysisId,
        ind.name,
        ind.category,
        ind.observedSnippet,
        ind.explanation,
        ind.limitation,
        ind.severity
      );
    });

    // Insert Evidence Sources
    const insertEvidence = db.prepare(`
      INSERT INTO evidence_sources (id, analysis_id, claim_id, title, publisher, url, excerpt, source_type, stance, published_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    evidenceResult.sources.forEach((src, idx) => {
      insertEvidence.run(
        `evi-${Date.now()}-${idx}`,
        analysisId,
        null,
        src.title,
        src.publisher,
        src.url,
        src.excerpt,
        src.sourceType,
        src.stance,
        src.publishedDate || 'Archived'
      );
    });

    // Notify user if authenticated
    if (userId) {
      const insertNotif = db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link_url, notification_type)
        VALUES (?, ?, ?, ?, ?, 'analysis_complete')
      `);
      insertNotif.run(
        `notif-${Date.now()}`,
        userId,
        'Analysis Complete',
        `Verification completed for: "${content.slice(0, 40)}..."`,
        `/analysis/${analysisId}`
      );
    }

    res.status(201).json({
      id: analysisId,
      inputType,
      originalInput: content,
      detectedLanguage: finalLanguage,
      riskLevel: finalRiskLevel,
      riskScore: adjustedScore,
      uncertaintyRating: uncertainty,
      summary: analysisSummary,
      methodology: methodologyText,
      status: 'completed',
      createdAt: new Date().toISOString(),
      claims: claims.map((c, i) => ({
        id: `clm-${i}`,
        claimText: c,
        position: i + 1,
        assessment: contradictingSources.length > 0 ? 'Contradicted' : supportingSources.length > 0 ? 'Corroborated' : 'Unverified',
      })),
      indicators: linguisticResult.indicators,
      evidenceSources: evidenceResult.sources,
      suggestedNextSteps: [
        'Check original publisher or primary government gazette.',
        'Review publication timestamp and geographic jurisdiction.',
        'Avoid forwarding until multi-source confirmation is obtained.',
        'Discuss with community or request certified expert review.',
      ],
    });
  } catch (err: any) {
    console.error('Analysis execution failed:', err);
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

// List user's analysis history
router.get('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const { search, riskLevel, language, limit = '20', offset = '0' } = req.query;

  let query = 'SELECT * FROM analyses WHERE user_id = ?';
  const params: any[] = [userId];

  if (riskLevel && typeof riskLevel === 'string') {
    query += ' AND risk_level = ?';
    params.push(riskLevel);
  }

  if (language && typeof language === 'string') {
    query += ' AND detected_language = ?';
    params.push(language);
  }

  if (search && typeof search === 'string') {
    query += ' AND (original_input LIKE ? OR summary LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

  const items = db.prepare(query).all(...params);

  // Total count
  let countQuery = 'SELECT COUNT(*) as total FROM analyses WHERE user_id = ?';
  const countParams: any[] = [userId];
  if (riskLevel && typeof riskLevel === 'string') {
    countQuery += ' AND risk_level = ?';
    countParams.push(riskLevel);
  }
  if (search && typeof search === 'string') {
    countQuery += ' AND (original_input LIKE ? OR summary LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }
  const totalResult = db.prepare(countQuery).get(...countParams) as { total: number };

  res.json({
    analyses: items,
    total: totalResult ? totalResult.total : items.length,
  });
});

// Get detailed analysis by ID
router.get('/:id', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;

  const analysisStmt = db.prepare('SELECT * FROM analyses WHERE id = ?');
  const analysis = analysisStmt.get(id) as any;

  if (!analysis) {
    res.status(404).json({ error: 'Analysis record not found.' });
    return;
  }

  // If private and not owner
  if (analysis.user_id && req.user && req.user.id !== analysis.user_id && req.user.role !== 'admin' && !analysis.is_public) {
    res.status(403).json({ error: 'Access denied to this private analysis report.' });
    return;
  }

  const claims = db.prepare('SELECT * FROM analysis_claims WHERE analysis_id = ? ORDER BY position ASC').all(id);
  const indicators = db.prepare('SELECT * FROM risk_indicators WHERE analysis_id = ?').all(id);
  const evidenceSources = db.prepare('SELECT * FROM evidence_sources WHERE analysis_id = ?').all(id);
  const feedback = db.prepare('SELECT rating, feedback_text FROM analysis_feedback WHERE analysis_id = ?').all(id);

  res.json({
    analysis,
    claims,
    indicators,
    evidenceSources,
    feedback,
  });
});

// Delete analysis
router.delete('/:id', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const userId = req.user!.id;

  const existing = db.prepare('SELECT user_id FROM analyses WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Analysis record not found.' });
    return;
  }

  if (existing.user_id !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized to delete this analysis report.' });
    return;
  }

  db.prepare('DELETE FROM analyses WHERE id = ?').run(id);
  res.json({ message: 'Analysis and all associated indicators successfully removed.' });
});

// Record analysis feedback
router.post('/:id/feedback', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { rating, feedbackText } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    return;
  }

  const feedbackId = `fb-${Date.now()}`;
  db.prepare(`
    INSERT INTO analysis_feedback (id, analysis_id, user_id, rating, feedback_text)
    VALUES (?, ?, ?, ?, ?)
  `).run(feedbackId, id, userId, rating, feedbackText || null);

  res.json({ message: 'Feedback submitted successfully. Thank you for helping improve TrustLens.' });
});

export default router;
