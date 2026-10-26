import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  FileCheck2,
  Search,
  Languages,
  Users,
  AlertOctagon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader.js';
import { Footer } from '../components/layout/Footer.js';
import { useAuth } from '../context/AuthContext.js';
import { TrustLensLogo } from '../components/common/TrustLensLogo.js';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does TrustLens verify information?',
      a: 'TrustLens parses submitted content to extract specific verifiable claims, evaluates observable linguistic patterns (such as urgency cues and missing attribution), queries live verified fact-checking records and credible reporting archives, and synthesizes an explainable investigation summary with cited evidence sources.',
    },
    {
      q: 'Can TrustLens detect every fake news story?',
      a: 'No automated tool can detect every piece of misinformation. TrustLens is designed to assist critical human judgment, not replace it. When primary source evidence is absent or disputed, TrustLens explicitly indicates an "Insufficient Evidence" state rather than guessing or fabricating certainty.',
    },
    {
      q: 'What happens when there is insufficient evidence?',
      a: 'When available credible records do not directly substantiate or refute a claim, the system marks the investigation as "Insufficient Evidence" or "Unresolved". It explains what was searched, highlights what remains unverified, and suggests steps for contacting official domain registries or accredited fact-checking networks.',
    },
    {
      q: 'Can I analyze screenshots?',
      a: 'Yes. You can upload PNG, JPG, or WebP images of message forwards or social media posts. TrustLens extracts the text using Optical Character Recognition (OCR), presents the extracted text for your verification and correction, and then conducts claim analysis on the confirmed text.',
    },
    {
      q: 'Is my investigation history private?',
      a: 'Yes. Your verified analyses and history are private to your authenticated account protected by Row Level Security. You choose whether to share a specific finding or keep it confidential. You can export or permanently delete your investigations at any time in Settings.',
    },
    {
      q: 'Which languages are supported?',
      a: 'TrustLens natively supports English, Telugu (తెలుగు), and Hindi (हिन्दी). The platform automatically detects the input language and provides explainable analysis and AI guidance in the selected language.',
    },
  ];

  const handleStartVerifying = () => {
    if (user) {
      navigate('/dashboard/verify');
    } else {
      navigate('/login');
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090F1A] text-[#0F172A] dark:text-slate-100 selection:bg-[#14B8A6]/20 selection:text-[#0D9488]">
      <PublicHeader />

      {/* Main Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Very Large Heading: TRUSTLENS */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#0B1220] dark:text-white leading-[1.05]">
            TRUSTLENS
          </h1>

          {/* Underneath Subheading */}
          <p className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Think Critically. Verify Confidently.
          </p>

          {/* Description */}
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[#64748B] dark:text-slate-400 leading-relaxed">
            Analyze suspicious claims, examine supporting evidence, and understand the information behind the headlines with TrustLens.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleStartVerifying}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#14B8A6]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Start Verifying</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-[#0B1220] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl border border-[#E2E8F0] dark:border-slate-800 transition-all"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section: 4 Steps */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-[#0B1220] border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] mb-2">
              Step-by-Step Workflow
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50">
              How It Works
            </p>
            <p className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
              A transparent verification process that prioritizes evidence and explainability over guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80 relative">
              <div className="text-2xl font-black text-[#14B8A6] tracking-tight mb-3">
                01
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
                Submit Content
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Paste a message, provide a news URL, or upload a screenshot.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80 relative">
              <div className="text-2xl font-black text-[#14B8A6] tracking-tight mb-3">
                02
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
                Analyze Claims
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                TrustLens identifies factual claims and suspicious presentation patterns.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80 relative">
              <div className="text-2xl font-black text-[#14B8A6] tracking-tight mb-3">
                03
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
                Find Evidence
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Search for relevant information and compare the claims with available sources.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80 relative">
              <div className="text-2xl font-black text-[#14B8A6] tracking-tight mb-3">
                04
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
                Understand Results
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Review explanations, evidence links, and areas of uncertainty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features: Compact Grid */}
      <section id="features" className="py-16 md:py-24 bg-[#F8FAFC] dark:bg-[#090F1A] border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] mb-2">
              Platform Capabilities
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50">
              Core Features
            </p>
            <p className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
              Essential verification and investigation tools engineered for accuracy and clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                AI-Assisted Verification
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Evaluates textual framing, urgency cues, and emotional manipulation patterns using explainable heuristics without speculative conclusions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mb-4">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Screenshot Text Extraction
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Upload image screenshots from chat or social media to extract text with client-side OCR for user review and subsequent claim analysis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Evidence-Based Analysis
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Connects claims directly to verifiable fact-check registries and official publisher reporting. Never invents citations or claims.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Community Fact-Checking
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Enables collaborative discussion, community context contributions, and source sharing with clear separation between opinion and evidence.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mb-4">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Reporting Assistance
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Draft structured complaint memos for impersonation or cyber fraud and access verified statutory portals like the Cyber Crime Portal (1930).
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mb-4">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Multilingual Support
              </h3>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Automatic script detection and investigations in English, Telugu (తెలుగు), and Hindi (हिन्दी) to address regional rumor cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why TrustLens? Section */}
      <section id="about" className="py-16 md:py-24 bg-white dark:bg-[#0B1220] border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] mb-2">
              Our Perspective
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50">
              Why TrustLens?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100 mb-2">
                Misinformation spreads quickly.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Viral claims, forward chains, and sensational headlines circulate faster than factual corrections, capitalizing on emotional triggers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100 mb-2">
                Visual appearance does not guarantee credibility.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Authentic-looking letterheads, fake news banners, and manipulated graphics can mislead even cautious readers without primary source verification.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100 mb-2">
                Context and supporting evidence matter.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                A statement may contain factual elements while omitting crucial context or presenting misleading framing. Transparent evidence reveals the difference.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100 mb-2">
                Responsible sharing begins with verification.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Pausing to examine sources before forwarding protects your friends, family, and online community from fraud and rumors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-[#F8FAFC] dark:bg-[#090F1A] border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50">
              Questions & Answers
            </p>
            <p className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
              Realistic information about TrustLens capabilities and limitations.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-100">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
