import Tesseract from 'tesseract.js';
import fs from 'fs';

export async function extractTextFromImage(
  imagePathOrBuffer: string | Buffer,
  language: string = 'eng'
): Promise<{ text: string; confidence: number; detectedLanguage: string }> {
  try {
    let tesseractLang = 'eng';
    if (language === 'te' || language === 'tel') {
      tesseractLang = 'tel+eng';
    } else if (language === 'hi' || language === 'hin') {
      tesseractLang = 'hin+eng';
    }

    const { data } = await Tesseract.recognize(imagePathOrBuffer, tesseractLang, {
      logger: (m) => {
        // Suppress verbose logs in production
        if (process.env.DEBUG_OCR) {
          console.log(`[OCR]: ${m.status} - ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });

    const cleanedText = data.text.trim();
    return {
      text: cleanedText,
      confidence: Math.round(data.confidence || 0),
      detectedLanguage: language,
    };
  } catch (error: any) {
    console.error('OCR processing error:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}
