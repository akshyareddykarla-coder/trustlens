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

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analyses', analysesRoutes);
app.use('/api/v1/ocr', ocrRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/experts', expertsRoutes);
app.use('/api/v1/reporting-resources', resourcesRoutes);
app.use('/api/v1/education', educationRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/admin', adminRoutes);

// Base health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'TrustLens API', version: '1.0.0', timestamp: new Date().toISOString() });
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
