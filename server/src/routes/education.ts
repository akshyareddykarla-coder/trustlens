import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth.js';

const router = Router();

// List educational lessons with progress for authenticated user
router.get('/lessons', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const userId = req.user ? req.user.id : null;

  const lessons = db.prepare(`
    SELECT id, slug, title, category, reading_time_mins, sort_order
    FROM educational_lessons
    ORDER BY sort_order ASC
  `).all() as any[];

  let completedLessonIds: Set<string> = new Set();
  if (userId) {
    const progressList = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND completed = 1').all(userId) as any[];
    completedLessonIds = new Set(progressList.map((p) => p.lesson_id));
  }

  const enriched = lessons.map((les) => ({
    ...les,
    isCompleted: completedLessonIds.has(les.id),
  }));

  res.json({ lessons: enriched });
});

// Get single lesson details with content and quiz
router.get('/lessons/:slug', optionalAuthMiddleware, (req: Request, res: Response): void => {
  const { slug } = req.params;
  const userId = req.user ? req.user.id : null;

  const lesson = db.prepare('SELECT * FROM educational_lessons WHERE slug = ?').get(slug) as any;
  if (!lesson) {
    res.status(404).json({ error: 'Educational lesson not found.' });
    return;
  }

  let progress = null;
  if (userId) {
    progress = db.prepare('SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lesson.id);
  }

  res.json({
    lesson: {
      ...lesson,
      quiz: lesson.quiz_json ? JSON.parse(lesson.quiz_json) : [],
    },
    userProgress: progress,
  });
});

// Record quiz completion and lesson progress
router.post('/lessons/:id/progress', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { quizScore } = req.body;

  const lesson = db.prepare('SELECT id FROM educational_lessons WHERE id = ?').get(id);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found.' });
    return;
  }

  const progressId = `prog-${Date.now()}`;
  db.prepare(`
    INSERT INTO lesson_progress (id, user_id, lesson_id, completed, quiz_score, completed_at)
    VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      completed = 1,
      quiz_score = excluded.quiz_score,
      completed_at = CURRENT_TIMESTAMP
  `).run(progressId, req.user!.id, id, quizScore || 100);

  res.json({ message: 'Lesson progress and quiz results saved successfully!' });
});

export default router;
