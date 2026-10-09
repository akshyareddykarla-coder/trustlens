export interface IndicatorResult {
  name: string;
  category: string;
  observedSnippet: string | null;
  explanation: string;
  limitation: string;
  severity: 'low' | 'medium' | 'high';
  points: number;
}

export interface LinguisticAnalysisResult {
  detectedLanguage: 'en' | 'te' | 'hi' | 'other';
  indicators: IndicatorResult[];
  riskScore: number;
  riskLevel: 'lower_risk' | 'needs_verification' | 'elevated_risk';
  uncertaintyRating: 'low' | 'moderate' | 'high';
  summary: string;
  extractedClaims: string[];
}

function getPatterns() {
  return {
    urgency: {
      en: /\b(forward\s+(to|immediately|now|everyone)|share\s+(before|immediately|now|with\s+all)|delete[d]?\s+before|urgent\s+alert|spread\s+the\s+word|viral\s+now|breaking\s+alert|midnight\s+deadline|immediately)\b/gi,
      te: /(వెంటనే\s*(ఫార్వర్డ్|షేర్|పంపండి)|డిలీట్\s*కాకముందే|తప్పక\s*చూడండి|ప్రతి\s*గ్రూపుకు|వైరల్\s*అవుతోంది|అందరికీ\s*తెలియజేయండి)/gu,
      hi: /(तुरंत\s*(शेयर|फॉरवर्ड|भेजें)|डिलीट\s*होने\s*से\s*पहले|जरूर\s*देखें|सभी\s*ग्रुप\s*में|वायरल\s*हो\s*रहा|सबको\s*बताएं)/gu,
    },
    sensationalism: {
      en: /\b(shocking|bombshell|unbelievable|mind-blowing|exposed|miracle\s+cure|hidden\s+truth|they\s+don't\s+want\s+you\s+to\s+know|mainstream\s+media\s+is\s+silent|conspiracy|secret\s+plan)\b/gi,
      te: /(సంచలనం|షాకింగ్|నిజం\s*బట్టబయలు|ఎవ్వరికీ\s*తెలియని|రహస్యం|అద్భుత\s*నివారణ|మీడియా\s*దాస్తోంది|కుట్ర)/gu,
      hi: /(चौंकाने\s*वाला|सनसनीखेज|बड़ा\s*खुलासा|चमत्कारी\s*इलाज|छुपा\s*सच|मीडिया\s*नहीं\s*दिखाएगा|तहलका|षड्यंत्र)/gu,
    },
    fearOrEmotional: {
      en: /\b(deadly|poisonous|toxic|ruined|destroy(ed|s)?|catastrophic|huge\s+danger|danger(ous)?|fatal\s+effect|massive\s+threat|warning\s*:\s*death)\b/gi,
      te: /(భయంకరమైన|విషపూరితం|ప్రాణాంతకం|పెను\s*ప్రమాదం|మరణాలు|తీవ్ర\s*నష్టం|హెచ్చరిక)/gu,
      hi: /(घातक|जहरीला|मौत\s*का\s*तांडव|खतरा|विनाशकारी|भयानक|सावधान|बर्बाद)/gu,
    },
    vagueAttribution: {
      en: /\b(scientists\s+say|doctors\s+warn|sources\s+reveal|unnamed\s+official|nasa\s+declared|who\s+confirmed|insider\s+leaked)\b/gi,
      te: /(శాస్త్రవేత్తలు\s*చెప్పారు|డాక్టర్ల\s*హెచ్చరిక|వర్గాల\s*సమాచారం|నాసా\s*ధృవీకరించింది|అధికారులు\s*చెప్పారు)/gu,
      hi: /(वैज्ञानिकों\s*का\s*कहना|डॉक्टरों\s*की\s*चेतावनी|सूत्रों\s*के\s*मुताबिक|नासा\s*ने\s*कहा|अधिकारियों\s*ने\s*बताया)/gu,
    },
  };
}

/**
 * Detect language based on unicode script presence
 */
export function detectLanguage(text: string): 'en' | 'te' | 'hi' | 'other' {
  const teluguMatch = text.match(/[\u0C00-\u0C7F]/g);
  const hindiMatch = text.match(/[\u0900-\u097F]/g);

  const teluguCount = teluguMatch ? teluguMatch.length : 0;
  const hindiCount = hindiMatch ? hindiMatch.length : 0;

  if (teluguCount > 5 && teluguCount >= hindiCount) return 'te';
  if (hindiCount > 5 && hindiCount >= teluguCount) return 'hi';
  return 'en';
}

/**
 * Extracts principal factual claims from the input text
 */
export function extractClaims(text: string): string[] {
  const lines = text
    .split(/(?:\r?\n)+|[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (lines.length === 0) {
    return [text.trim()];
  }
  return lines.slice(0, 3);
}

/**
 * Runs rule-based linguistic and statistical indicator analysis
 */
export function analyzeLinguisticSignals(text: string): LinguisticAnalysisResult {
  const patterns = getPatterns();
  const detectedLanguage = detectLanguage(text);
  const indicators: IndicatorResult[] = [];
  let scorePoints = 15; // baseline moderate neutral starting point

  // 1. Urgency & Forwarding Pressure
  const urgencyMatches = [
    ...(text.match(patterns.urgency.en) || []),
    ...(text.match(patterns.urgency.te) || []),
    ...(text.match(patterns.urgency.hi) || []),
  ];

  if (urgencyMatches.length > 0) {
    const snippet = urgencyMatches.slice(0, 2).join(', ');
    indicators.push({
      name: 'Urgency & Forwarding Pressure',
      category: 'Behavioral Manipulation',
      observedSnippet: snippet,
      explanation:
        'The content employs artificial urgency or prompts rapid sharing. Misinformation frequently leverages social sharing incentives to circulate before verification can occur.',
      limitation:
        'Legitimate civil defense or emergency weather announcements also request urgent dissemination; urgency alone does not disprove facts.',
      severity: urgencyMatches.length > 1 ? 'high' : 'medium',
      points: urgencyMatches.length > 1 ? 25 : 15,
    });
    scorePoints += urgencyMatches.length > 1 ? 25 : 15;
  }

  // 2. Sensationalism & Hyperbolic Framing
  const sensationalMatches = [
    ...(text.match(patterns.sensationalism.en) || []),
    ...(text.match(patterns.sensationalism.te) || []),
    ...(text.match(patterns.sensationalism.hi) || []),
  ];

  if (sensationalMatches.length > 0) {
    const snippet = sensationalMatches.slice(0, 2).join(', ');
    indicators.push({
      name: 'Sensational / Hyperbolic Vocabulary',
      category: 'Editorial Tone',
      observedSnippet: snippet,
      explanation:
        'Sensational phrasing is designed to trigger emotional surprise or confirmation bias, often characteristic of clickbait or unsubstantiated rumors.',
      limitation:
        'Passionate editorial writing and legitimate investigative exposés may also use strong vocabulary.',
      severity: sensationalMatches.length > 1 ? 'high' : 'medium',
      points: sensationalMatches.length > 1 ? 22 : 14,
    });
    scorePoints += sensationalMatches.length > 1 ? 22 : 14;
  }

  // 3. Fear-Inducing or Alarmist Language
  const fearMatches = [
    ...(text.match(patterns.fearOrEmotional.en) || []),
    ...(text.match(patterns.fearOrEmotional.te) || []),
    ...(text.match(patterns.fearOrEmotional.hi) || []),
  ];

  if (fearMatches.length > 0) {
    const snippet = fearMatches.slice(0, 2).join(', ');
    indicators.push({
      name: 'Alarmist / Fear-Inducing Terms',
      category: 'Emotional Framing',
      observedSnippet: snippet,
      explanation:
        'The content uses catastrophic or health-scare terminology that can induce panic without presenting corroborating data.',
      limitation:
        'Genuine disease outbreaks and safety advisories naturally use stern warnings.',
      severity: 'medium',
      points: 15,
    });
    scorePoints += 15;
  }

  // 4. Excessive Capitalization or Punctuation Bursts
  const uppercaseLetters = (text.match(/[A-Z]/g) || []).length;
  const totalLetters = (text.match(/[a-zA-Z]/g) || []).length;
  const punctuationBursts = (text.match(/[!?]{2,}/g) || []).length;

  const capsRatio = totalLetters > 20 ? uppercaseLetters / totalLetters : 0;
  if (capsRatio > 0.45 || punctuationBursts >= 2) {
    indicators.push({
      name: 'Typographic Emphasis & Punctuation Clustering',
      category: 'Stylistic Formatting',
      observedSnippet: punctuationBursts > 0 ? `Repeated punctuation (!!/??) / ${Math.round(capsRatio * 100)}% Caps` : `${Math.round(capsRatio * 100)}% Uppercase letters`,
      explanation:
        'Heavy use of capitalization and stacked punctuation marks indicates informal, emotionally heated forwarding rather than standard journalistic standards.',
      limitation:
        'Acronyms and casual user messages naturally vary in punctuation styling.',
      severity: 'low',
      points: 12,
    });
    scorePoints += 12;
  }

  // 5. Vague Attribution / Unverifiable Sources
  const attributionMatches = [
    ...(text.match(patterns.vagueAttribution.en) || []),
    ...(text.match(patterns.vagueAttribution.te) || []),
    ...(text.match(patterns.vagueAttribution.hi) || []),
  ];

  if (attributionMatches.length > 0) {
    const snippet = attributionMatches.slice(0, 2).join(', ');
    indicators.push({
      name: 'Unverifiable Institutional Attribution',
      category: 'Source Credibility',
      observedSnippet: snippet,
      explanation:
        'Claims cite broad entities (e.g. "NASA announced", "doctors warned") without citing official press releases, identifiable spokespersons, or official study links.',
      limitation:
        'Brief news summaries frequently compress formal citations for brevity.',
      severity: 'medium',
      points: 15,
    });
    scorePoints += 15;
  }

  // 6. Balanced / Neutral Reporting Signals (Mitigating Indicator)
  const officialContextTerms = /\b(according\s+to\s+the\s+official|press\s+release|gazette|peer-reviewed|spokesperson|statement\s+issued|filing|court\s+order)\b/i;
  if (officialContextTerms.test(text)) {
    indicators.push({
      name: 'Formal Attribution Context',
      category: 'Contextual Sourcing',
      observedSnippet: 'Formal official attribution cited',
      explanation:
        'The content specifies official statements or documented filings, which assists with direct verification.',
      limitation:
        'Statements must still be checked against the issuing body to ensure they were not fabricated or taken out of context.',
      severity: 'low',
      points: -18,
    });
    scorePoints = Math.max(5, scorePoints - 18);
  }

  // Final score clamping
  const riskScore = Math.min(95, Math.max(5, scorePoints));

  // Determine Risk Category
  let riskLevel: 'lower_risk' | 'needs_verification' | 'elevated_risk';
  if (riskScore <= 28) {
    riskLevel = 'lower_risk';
  } else if (riskScore <= 60) {
    riskLevel = 'needs_verification';
  } else {
    riskLevel = 'elevated_risk';
  }

  // Uncertainty Rating
  const uncertaintyRating = text.length < 50 ? 'high' : indicators.length === 0 ? 'moderate' : 'low';

  const extractedClaims = extractClaims(text);

  // Generate summary
  let summary = '';
  if (riskLevel === 'elevated_risk') {
    summary = `Multiple risk indicators detected (${indicators.map((i) => i.name).join(', ')}). The message displays linguistic patterns typical of viral forwarding and requires independent cross-referencing against primary sources before being accepted or shared.`;
  } else if (riskLevel === 'needs_verification') {
    summary = `Contains factual claims with limited attribution or moderate linguistic signals. While not demonstrating overt fabrication, corroborating evidence from authoritative news agencies or official registries is required.`;
  } else {
    summary = `Demonstrates lower linguistic risk with restrained tone and attribution markers. Standard verification against primary documents is still recommended, as linguistic tone alone does not guarantee empirical truth.`;
  }

  return {
    detectedLanguage,
    indicators,
    riskScore,
    riskLevel,
    uncertaintyRating,
    summary,
    extractedClaims,
  };
}
