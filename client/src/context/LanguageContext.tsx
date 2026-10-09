import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'te' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
  };
}

const TRANSLATIONS: Translations = {
  appName: {
    en: 'TrustLens',
    te: 'ట్రస్ట్‌లెన్స్',
    hi: 'ट्रस्टलेंस',
  },
  tagline: {
    en: 'See Beyond the Headlines',
    te: 'శీర్షికలకు ఆవల చూడండి',
    hi: 'हेडलाइंस से परे देखें',
  },
  heroSubtitle: {
    en: 'Examine suspicious messages, explore available evidence, and understand the signals that may affect a claim’s credibility.',
    te: 'అనుమానాస్పద సందేశాలను పరిశీలించండి, ఆధారాలను విశ్లేషించండి మరియు నిజాయితీ సంకేతాలను అర్థం చేసుకోండి.',
    hi: 'संदिग्ध संदेशों की जांच करें, उपलब्ध साक्ष्यों को समझें और दावों की विश्वसनीयता का निष्पक्ष विश्लेषण करें।',
  },
  analyzeClaim: {
    en: 'Analyze a Claim',
    te: 'సందేశాన్ని పరిశీలించండి',
    hi: 'दावे का विश्लेषण करें',
  },
  howItWorks: {
    en: 'How It Works',
    te: 'ఇది ఎలా పనిచేస్తుంది',
    hi: 'यह कैसे काम करता है',
  },
  home: {
    en: 'Home',
    te: 'హోమ్',
    hi: 'होम',
  },
  verifyNews: {
    en: 'Verify News',
    te: 'వార్తల ధృవీకరణ',
    hi: 'समाचार सत्यापन',
  },
  history: {
    en: 'Analysis History',
    te: 'విశ్లేషణ చరిత్ర',
    hi: 'विश्लेषण इतिहास',
  },
  assistant: {
    en: 'AI Assistant',
    te: 'ఏఐ అసిస్టెంట్',
    hi: 'एआई सहायक',
  },
  community: {
    en: 'Community Verification',
    te: 'కమ్యూనిటీ ధృవీకరణ',
    hi: 'सामुदायिक सत्यापन',
  },
  experts: {
    en: 'Expert Network',
    te: 'నిపుణుల నెట్‌వర్క్',
    hi: 'विशेषज्ञ नेटवर्क',
  },
  reportCenter: {
    en: 'Report Center',
    te: 'రిపోర్ట్ కేంద్రం',
    hi: 'शिकायत केंद्र',
  },
  education: {
    en: 'Educational Hub',
    te: 'విద్యా కేంద్రం',
    hi: 'शिक्षा केंद्र',
  },
  analytics: {
    en: 'Analytics',
    te: 'విశ్లేషణలు',
    hi: 'एनालिटिक्स',
  },
  settings: {
    en: 'Settings',
    te: 'సెట్టింగ్‌లు',
    hi: 'सेटिंग्स',
  },
  admin: {
    en: 'Admin Panel',
    te: 'అడ్మిన్ ప్యానెల్',
    hi: 'व्यवस्थापक पैनल',
  },
  login: {
    en: 'Sign In',
    te: 'లాగిన్',
    hi: 'लॉग इन',
  },
  register: {
    en: 'Get Started',
    te: 'ప్రారంభించండి',
    hi: 'शुरू करें',
  },
  logout: {
    en: 'Log Out',
    te: 'లాగ్ అవుట్',
    hi: 'लॉग आउट',
  },
  lowerRisk: {
    en: 'Lower Risk Signals',
    te: 'తక్కువ ప్రమాద సంకేతాలు',
    hi: 'कम जोखिम संकेत',
  },
  needsVerification: {
    en: 'Needs Verification',
    te: 'ధృవీకరణ అవసరం',
    hi: 'सत्यापन आवश्यक',
  },
  elevatedRisk: {
    en: 'Elevated Risk Signals',
    te: 'ఎక్కువ ప్రమాద సంకేతాలు',
    hi: 'उच्च जोखिम संकेत',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('trustlens_language') as Language;
    return saved === 'te' || saved === 'hi' ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('trustlens_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
