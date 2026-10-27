import { createWorker } from 'tesseract.js';

export interface OcrResult {
  extractedText: string;
  confidence: number | null;
  detectedLanguage: string;
}

/**
 * Client-Side OCR Engine using Tesseract.js in WebAssembly/Web Worker.
 * Enables image text extraction directly in the user's browser without
 * requiring a backend server or encountering 404 errors.
 */
export async function extractTextClientSide(
  fileOrUrl: File | Blob | string,
  language: string = 'eng',
  onProgress?: (percent: number, status: string) => void
): Promise<OcrResult> {
  // Map standard language codes to Tesseract identifiers
  let tesseractLang = 'eng';
  if (language === 'te' || language === 'tel') {
    tesseractLang = 'tel';
  } else if (language === 'hi' || language === 'hin') {
    tesseractLang = 'hin';
  } else if (language === 'auto') {
    tesseractLang = 'eng';
  }

  let worker: any = null;
  try {
    worker = await createWorker(tesseractLang, 1, {
      logger: (m) => {
        if (onProgress && typeof m.progress === 'number') {
          const pct = Math.round(m.progress * 100);
          onProgress(pct, m.status || 'Processing image');
        }
      },
    });

    const ret = await worker.recognize(fileOrUrl);
    const rawText = ret?.data?.text || '';
    const cleanedText = rawText.replace(/\r\n/g, '\n').trim();
    const confidence = ret?.data?.confidence != null ? Math.round(ret.data.confidence) : 85;

    return {
      extractedText: cleanedText,
      confidence,
      detectedLanguage: language,
    };
  } catch (err: any) {
    console.warn('[ClientOCR]: Tesseract WebWorker error or fallback triggered:', err);
    throw new Error(err.message || 'Client-side OCR processing error');
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        // Ignore termination cleanup errors
      }
    }
  }
}
