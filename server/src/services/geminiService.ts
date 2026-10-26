import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAI: GoogleGenerativeAI | null = null;

export function getGenAI(): GoogleGenerativeAI | null {
  const key = config.gemini.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key === 'your-gemini-api-key-here') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export function isGeminiAvailable(): boolean {
  return getGenAI() !== null;
}

/**
 * Ask AI Assistant a follow-up question in the context of an analysis result or media literacy.
 */
export async function askAssistant(
  question: string,
  context?: {
    claimText?: string;
    riskLevel?: string;
    indicators?: string[];
    evidence?: string[];
    language?: string;
  },
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ reply: string; usedModel: string }> {
  if (!isGeminiAvailable()) {
    // Deterministic transparent fallback
    return {
      reply: generateLocalAssistantResponse(question, context),
      usedModel: 'TrustLens Heuristic Knowledge Engine (Rule-based; GEMINI_API_KEY not configured)',
    };
  }

  const candidateModels = [
    config.gemini.model || 'gemini-3.5-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];
  // Remove duplicates while preserving order
  const modelsToTry = Array.from(new Set(candidateModels));

  let systemPrompt = `You are the TrustLens AI Verification Assistant. Your objective is to help citizens and researchers understand misinformation, linguistic risk indicators, source credibility, and media literacy.
CRITICAL SAFETY & ETHICAL RULES:
1. NEVER claim that AI can definitively prove truth or falsehood for every claim. Explain degrees of credibility and uncertainty.
2. Emphasize that emotional or urgent language does NOT necessarily make a claim false, but serves as a signal to verify carefully.
3. If evidence is missing, state clearly that absence of evidence is not proof of falsehood.
4. Encourage checking primary sources, official government gazettes, and reputable fact-checkers.
5. If answering in Telugu or Hindi, respond fluently in that language when requested or appropriate.`;

  if (context && context.claimText) {
    systemPrompt += `\n\nCURRENT CLAIM UNDER INVESTIGATION:
Claim: "${context.claimText}"
Calculated Risk Level: ${context.riskLevel || 'Needs Verification'}
Observed Risk Indicators: ${(context.indicators || []).join(', ') || 'None flagged'}
Retrieved Evidence Excerpts: ${(context.evidence || []).join(' | ') || 'No external fact-check entries found'}`;
  }

  const prompt = `${systemPrompt}\n\nUser Question: ${question}\n\nPlease provide a clear, neutral, explainable answer with appropriate nuance.`;

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = getGenAI()!.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return {
        reply: text,
        usedModel: `Google Gemini (${modelName})`,
      };
    } catch (err: any) {
      lastError = err;
      // If it's a 404/not found, continue to next candidate model
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('no longer available'))) {
        continue;
      }
      break;
    }
  }

  console.error('Gemini API call failed across candidates:', lastError?.message);
  return {
    reply: `Note: External Gemini API call encountered an issue (${lastError?.message || 'Unknown error'}). Falling back to local reasoning engine:\n\n${generateLocalAssistantResponse(question, context)}`,
    usedModel: 'TrustLens Local Engine (Gemini fallback)',
  };
}

/**
 * High-quality contextual response engine when Gemini API key is absent.
 */
function generateLocalAssistantResponse(
  question: string,
  context?: {
    claimText?: string;
    riskLevel?: string;
    indicators?: string[];
    evidence?: string[];
    language?: string;
  }
): string {
  const q = question.toLowerCase();

  if (q.includes('why') && (q.includes('risk') || q.includes('score') || q.includes('suspicious'))) {
    if (context && context.indicators && context.indicators.length > 0) {
      return `The assessment is based on the following specific signals detected in the text:\n\n` +
        context.indicators.map((ind, i) => `${i + 1}. **${ind}**: Signals intentional framing to trigger immediate reaction or forward without scrutiny.`).join('\n') +
        `\n\n*Important caveat:* Linguistic signals describe *how* a message is written, not whether the underlying real-world event happened. A genuine warning can be written urgently, and a fabricated rumor can be written in a formal tone. Always consult official records.`;
    }
    return `TrustLens calculates risk using structural markers such as manufactured urgency, emotional appeals, excessive capitalization, and lack of named source attribution. A higher score does not mean guaranteed falsehood; it indicates that the claim requires independent verification before being forwarded.`;
  }

  if (q.includes('evidence') || q.includes('source') || q.includes('proof')) {
    if (context && context.evidence && context.evidence.length > 0) {
      return `Here is what our credible source registry found regarding this topic:\n\n` +
        context.evidence.map((e, idx) => `• Source ${idx + 1}: ${e}`).join('\n\n') +
        `\n\nAlways visit the original source links to verify the full date, jurisdiction, and official context.`;
    }
    return `No official rebuttals or direct fact-checks matching this exact claim were found in public fact-checking records. This frequently occurs with newly emerging claims, hyper-local rumors, or genuine uncatalogued events. We recommend searching official department websites or consulting our Expert Review Network.`;
  }

  if (q.includes('whatsapp') || q.includes('forward') || q.includes('spot')) {
    return `To verify viral messages on WhatsApp or Telegram, use the **S.T.O.P. methodology**:\n\n` +
      `1. **S**top: Pause if the message triggers strong fear, anger, or urgency to forward.\n` +
      `2. **T**race the source: Look for the original author or organization, not just "forwarded as received".\n` +
      `3. **O**pen a search engine: Copy the key sentence and search it with the words "fact check".\n` +
      `4. **P**rotect your network: If you cannot find independent confirmation within 2 minutes, do not forward it.`;
  }

  if (q.includes('telugu') || q.includes('తెలుగు')) {
    return `నమస్కారం! ట్రస్ట్‌లెన్స్ (TrustLens) ద్వారా వార్తలు మరియు సోషల్ మీడియా సందేశాల విశ్వసనీయతను పరిశీలించవచ్చు. ఏదైనా సందేశంలో "వెంటనే షేర్ చేయండి", "రహస్య సమాచారం" లేదా భయాందోళనలు కలిగించే పదాలు ఉంటే, అధికారిక ప్రభుత్వ లేదా వార్తా సంస్థల వెబ్‌సైట్లలో ధృవీకరించుకోవాలి.`;
  }

  if (q.includes('hindi') || q.includes('हिंदी')) {
    return `नमस्ते! TrustLens आपको किसी भी वायरल दावे या समाचार की विश्वसनीयता जांचने में मदद करता है। यदि किसी संदेश में अत्यधिक तात्कालिकता (जैसे "तुरंत शेयर करें") या बिना स्रोत के दावे किए गए हैं, तो आधिकारिक स्रोतों से पुष्टि अवश्य करें।`;
  }

  return `Regarding your inquiry: TrustLens analyzes claims by separating linguistic indicators (how the message is framed) from empirical evidence (what verified institutions report). To investigate this further:\n\n1. Check if official authorities (e.g. PIB Fact Check, official ministry gazettes) have issued statements.\n2. Look for multiple independent news outlets reporting the same facts with named bylines.\n3. Consider submitting this claim to our Community Verification feed or Expert Review network.`;
}
