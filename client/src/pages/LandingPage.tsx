import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  FileCheck2,
  Search,
  Sparkles,
  Languages,
  Users,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader.js';
import { Footer } from '../components/layout/Footer.js';
import { RiskBadge } from '../components/common/RiskBadge.js';
import { useLanguage } from '../context/LanguageContext.js';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [quickInput, setQuickInput] = useState('');

  const faqs = [
    {
      q: 'How does TrustLens analyze online claims?',
      a: 'TrustLens uses a multi-layered verification pipeline. First, it identifies the core factual claims. Second, it calculates statistical and linguistic indicators (such as urgency, sensationalism, and lack of attribution). Third, it searches verified fact-checking registries and credible reporting for direct corroboration or debunking. Finally, it compiles an explainable report highlighting uncertainty and suggested next steps.',
    },
    {
      q: 'Does TrustLens guarantee whether a claim is 100% true or false?',
      a: 'No. TrustLens is founded on the core principle that automated AI cannot definitively prove real-world truth in every situation. Instead, it surfaces observable linguistic signals, connects you to verified primary sources, and highlights uncertainties so you can make informed decisions.',
    },
    {
      q: 'What languages and media formats are supported?',
      a: 'TrustLens natively supports English, Telugu (తెలుగు), and Hindi (हिन्दी). You can submit raw text from messaging apps, upload image screenshots (processed with on-board OCR), or submit public article URLs with SSRF-safe retrieval.',
    },
    {
      q: 'How are risk indicators calculated?',
      a: 'Indicators are calculated through deterministic linguistic rule engines combined with evidence matching. Each indicator clearly states the observed text snippet, why it matters, and its inherent limitations. We never generate arbitrary random scores.',
    },
    {
      q: 'How is user data and uploaded content handled?',
      a: 'TrustLens prioritizes user privacy. Uploaded screenshots are processed strictly for OCR text extraction. Users have complete control over data retention and can export or permanently delete their history anytime in Settings.',
    },
    {
      q: 'How do I escalate suspicious or harmful content to official authorities?',
      a: 'Visit our Citizen Report Center. We provide verified, direct contact channels for official agencies such as the National Cyber Crime Portal (1930), PIB Fact Check WhatsApp Helpline, and statutory intermediary grievance officers.',
    },
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      navigate(`/verify?q=${encodeURIComponent(quickInput.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-teal-100 selection:text-teal-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Misinformation & Source Verification</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.15]">
            See Beyond the Headlines.
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Examine suspicious messages, explore available evidence, and understand the signals that may affect a claim’s credibility.
          </p>

          {/* Interactive Analysis Input Preview */}
          <form
            onSubmit={handleHeroSubmit}
            className="mt-8 max-w-2xl mx-auto p-2 sm:p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Paste a viral forward or news headline to analyze..."
              className="flex-1 px-4 py-3 text-sm bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Analyze Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Or try sample:</span>
            <button
              type="button"
              onClick={() => setQuickInput('PIB warns against fake railway vacancy letter requesting Rs 5000 deposit fee.')}
              className="px-2.5 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Railway Job Notice Forward
            </button>
            <button
              type="button"
              onClick={() => setQuickInput('ISRO completes autonomous landing mission of reusable launch vehicle RLV-LEX-02 in Chitradurga.')}
              className="px-2.5 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              ISRO Mission Test
            </button>
          </div>

          {/* Demonstration Preview Card */}
          <div className="mt-12 max-w-3xl mx-auto bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-left shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Live System Demonstration
                </span>
              </div>
              <RiskBadge level="elevated_risk" size="sm" />
            </div>

            <div className="py-4">
              <div className="text-xs font-medium text-slate-400">Sample Forwarded Message:</div>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                “SHOCKING BOMBSHELL: Ministry issuing direct railway appointments for Rs 5000 fee! Send to all WhatsApp groups before midnight deadline!”
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Observed Linguistic Signals</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  Manufactured urgency detected ("before midnight", "send to all"). Sensational framing without named authority.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
                <div className="font-semibold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verified Fact-Check Match</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  Direct match in PIB Fact Check registry: Ministry of Railways confirmed fee notice is fraudulent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Six Pillars of Rigorous Verification
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Engineered with transparent evidence retrieval, statistical linguistic indicators, and community deliberation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Multimodal Claim Analysis
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit raw message text, upload screenshot images processed with built-in OCR, or enter article URLs with SSRF protection.
              </p>
              <Link to="/verify" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Open analyzer <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Evidence & Source Exploration
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Traceable links to real fact-check databases, official gazettes, and reputable reporting. Never fabricated links or hallucinations.
              </p>
              <Link to="/history" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Explore archive <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Explainable Risk Indicators
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear explanations for each detected signal: urgency pressure, hyperbolic tone, caps ratios, and missing attribution, along with explicit limitations.
              </p>
              <a href="#how-it-works" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                View methodology <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Multilingual Support
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full interface and linguistic detection for English, Telugu (తెలుగు), and Hindi (हिन्दी), tackling regional vernacular rumor cycles.
              </p>
              <span className="inline-block mt-4 text-xs font-semibold text-slate-500">
                English • తెలుగు • हिन्दी
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Community Verification
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Collaborative claim discussions, peer source citations, and helpfulness voting. Clearly distinguished from certified evidence.
              </p>
              <Link to="/community" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Join discussions <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Digital Literacy Curriculum
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practical lessons on reverse image searches, identifying cheapfakes, evaluating sources, and interactive knowledge quizzes.
              </p>
              <Link to="/education" className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Start learning <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              How TrustLens Works in 3 Steps
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              A transparent verification process that prioritizes evidence and explainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Submit Input
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste forwarded chat text, upload an image screenshot for OCR extraction, or enter a public article URL. Review and refine the extracted claim.
              </p>
            </div>

            <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Examine Signals & Search Evidence
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Algorithmic engines scan for emotional triggers and urgency markers while cross-referencing indexed fact-checking archives and live news sources.
              </p>
            </div>

            <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Review Qualified Explanation
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inspect the qualified risk signals, read source citations, examine uncertainties, download reports, or chat with the AI verification assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Use Section */}
      <section id="responsible-use" className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 rounded-3xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
            <div className="flex items-center gap-2.5 text-teal-800 dark:text-teal-300 font-bold text-sm mb-3">
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Responsible AI & Critical Verification Principles</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              AI Assists Your Judgment — It Does Not Replace It
            </h3>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                • <strong>AI assessments can be imperfect:</strong> Automated models evaluate linguistic framing and known databases, but cannot infallibly determine ground truth for uncatalogued events.
              </p>
              <p>
                • <strong>Urgency does not equal falsehood:</strong> A genuine public safety emergency message may use urgent language. Stylistic framing serves as a prompt to verify, not proof of deception.
              </p>
              <p>
                • <strong>Absence of evidence is not proof of falsehood:</strong> Emerging local events may simply not yet have indexed coverage in formal fact-checking databases.
              </p>
              <p>
                • <strong>Check primary sources:</strong> Always verify claims with primary government portals, authorized spokespersons, or established journalistic outlets before making critical decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Transparent answers regarding our algorithms, data privacy, and limitations.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-white dark:bg-slate-900 text-center border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Start Verifying Information with Confidence
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Join citizens, researchers, and journalists examining online claims with transparent signals and verified evidence.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/verify"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              Analyze a Claim Now
            </Link>
            <Link
              to="/education"
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs rounded-xl transition-colors"
            >
              Explore Media Literacy Lessons
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
