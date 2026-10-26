import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDatabase } from './db/index.js';

import authRoutes from './routes/auth.js';
import analysesRoutes from './routes/analyses.js';
import ocrRoutes from './routes/ocr.js';
import assistantRoutes from './routes/assistant.js';
import communityRoutes from './routes/community.js';
import expertsRoutes from './routes/experts.js';
import resourcesRoutes from './routes/resources.js';
import educationRoutes from './routes/education.js';
import notificationsRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import { isGeminiAvailable } from './services/geminiService.js';
import { isSupabaseAvailable } from './services/supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize DB schema & seed data
initDatabase();

// Standard middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(config.uploadsDir));

// API Routes (mounted on both /api/v1 and /api for backwards compatibility and resilience)
const routes = [
  { path: '/auth', router: authRoutes },
  { path: '/analyses', router: analysesRoutes },
  { path: '/ocr', router: ocrRoutes },
  { path: '/assistant', router: assistantRoutes },
  { path: '/community', router: communityRoutes },
  { path: '/experts', router: expertsRoutes },
  { path: '/reporting-resources', router: resourcesRoutes },
  { path: '/education', router: educationRoutes },
  { path: '/notifications', router: notificationsRoutes },
  { path: '/profile', router: profileRoutes },
  { path: '/admin', router: adminRoutes },
];

for (const { path: routePath, router } of routes) {
  app.use(`/api/v1${routePath}`, router);
  app.use(`/api${routePath}`, router);
}

// Base health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'TrustLens API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected (SQLite node:sqlite)',
      supabase: isSupabaseAvailable() ? 'connected' : 'not_configured',
      geminiAi: isGeminiAvailable() ? 'operational' : 'offline_fallback_active',
    },
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.method} ${req.originalUrl} not found.` });
});

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`  TrustLens API Server running at http://localhost:${config.port}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
}

export default app;
