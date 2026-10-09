import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { extractTextFromImage } from '../services/ocrService.js';
import { config } from '../config.js';
import { db } from '../db/index.js';

const router = Router();

// Ensure upload folder exists
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ocr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PNG, JPG, or WebP images only.'));
    }
  },
});

router.post('/', optionalAuthMiddleware, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded.' });
    return;
  }

  const language = (req.body.language as string) || 'eng';

  try {
    const ocrResult = await extractTextFromImage(req.file.path, language);

    const fileId = `file-${Date.now()}`;
    const userId = req.user ? req.user.id : null;

    db.prepare(`
      INSERT INTO uploaded_files (id, user_id, file_name, file_size, mime_type, storage_path, ocr_extracted_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(fileId, userId, req.file.originalname, req.file.size, req.file.mimetype, req.file.path, ocrResult.text);

    res.json({
      fileId,
      fileName: req.file.originalname,
      extractedText: ocrResult.text,
      confidence: ocrResult.confidence,
      detectedLanguage: ocrResult.detectedLanguage,
      previewNote: 'Please review and edit the extracted text above before submitting for full verification.',
    });
  } catch (err: any) {
    res.status(500).json({ error: `OCR extraction failed: ${err.message}` });
  }
});

export default router;
