import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Calendar,
  Languages,
  AlertCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
  Share2,
  Bot,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Info,
  Shield,
  HelpCircle,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api.js';
import { RiskBadge } from '../components/common/RiskBadge.js';

export const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    async function loadAnalysis() {
      if (!id) return;
      try {
        const res = await api.getAnalysisById(id);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve analysis report.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [id]);

  const handleCopySummary = () => {
    if (!data?.analysis) return;
    const textToCopy = `TrustLens Verification Summary:\n\nClaim: "${data.analysis.original_input}"\nRisk Assessment: ${data.analysis.risk_level.replace('_', ' ').toUpperCase()} (Score: ${data.analysis.risk_score}/100)\n\nSummary: ${data.analysis.summary}\n\nVerified via TrustLens Platform`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.submitFeedback(id, { rating: feedbackRating, feedbackText });
      setFeedbackSubmitted(true);
      setTimeout(() => setShowFeedbackModal(false), 1500);
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-xs font-semibold text-slate-500">Retrieving verification report...</div>
      </div>
    );
  }

  if (error || !data?.analysis) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Analysis Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This report may have been deleted or is set to private.'}</p>
        <Link
          to="/verify"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification Desk</span>
        </Link>
      </div>
    );
  }

  const { analysis, claims, indicators, evidenceSources } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:p-0">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Rate Result</span>
          </button>

          <Link
            to={`/assistant?analysisId=${analysis.id}`}
            className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Main Analysis Summary Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(analysis.created_at).toLocaleString()}
              </span>
              <span>•</span>
              <span className="capitalize">{analysis.input_type} Input</span>
              <span>•</span>
              <span className="uppercase font-mono">{analysis.detected_language}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Claim Verification Assessment
            </h1>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2">
            <RiskBadge level={analysis.risk_level} size="lg" />
            <div className="text-xs font-mono text-slate-500">
              Composite Risk Score: <strong>{analysis.risk_score}</strong>/100
            </div>
          </div>
        </div>

        {/* Original Claim Text Quote */}
        <div className="py-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Original Submitted Content
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 font-serif italic text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
            “{analysis.original_input}”
          </div>
        </div>

        {/* Explainable Summary & Uncertainty */}
        <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2">
          <div className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Assessment Synthesis</span>
          </div>
          <p className="leading-relaxed">{analysis.summary}</p>
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>
              Uncertainty Rating: <strong className="capitalize text-slate-700 dark:text-slate-300">{analysis.uncertainty_rating || 'Moderate'}</strong> — Subject to updates as official agencies release subsequent corroborating findings.
            </span>
          </div>
        </div>
      </div>

      {/* Claim Breakdown */}
      {claims && claims.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Factual Claim Breakdown
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Individual verifiable assertions identified within the message
          </p>

          <div className="space-y-3">
            {claims.map((claim: any, idx: number) => (
              <div
                key={claim.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Claim #{claim.position || idx + 1}: {claim.claim_text}
                  </div>
                  {claim.assessment && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Status: {claim.assessment}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize self-start sm:self-auto">
                  {claim.verification_status || 'unverified'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Implemented Risk Indicators Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Linguistic & Statistical Risk Indicators
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Each indicator presents the observed textual pattern, why it matters, and documented limitations.
        </p>

        {indicators.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No anomalous linguistic or manipulative patterns detected in this content.
          </div>
        ) : (
          <div className="space-y-4">
            {indicators.map((ind: any) => (
              <div
                key={ind.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{ind.indicator_name}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {ind.indicator_category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      ind.severity === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : ind.severity === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {ind.severity} Severity
                  </span>
                </div>

                {ind.observed_snippet && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mb-2">
                    Observed: "{ind.observed_snippet}"
                  </div>
                )}

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Why it matters:</strong> {ind.explanation}
                </p>

                <p className="text-[11px] text-slate-500 mt-1 italic">
                  <strong>Limitation:</strong> {ind.limitation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Evidence Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Evidence & Credible Sources
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Real fact-checking archives, government gazettes, and reputable investigative outlets.
        </p>

        {evidenceSources.length === 0 ? (
          <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            <div className="font-semibold mb-1">No conclusive external fact-checks indexed</div>
            <p className="text-slate-600 dark:text-slate-400">
              No matching records were located in public fact-check feeds. This frequently happens with newly circulating local claims. Absence of indexed reporting does not prove falsehood. Consult our Expert Network or primary department portals.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidenceSources.map((source: any) => (
              <div
                key={source.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                      {source.publisher}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {source.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full self-start sm:self-auto ${
                      source.stance === 'supports'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : source.stance === 'contradicts'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Stance: {source.stance}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  "{source.excerpt}"
                </p>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Source Type: <strong className="capitalize text-slate-600 dark:text-slate-300">{source.source_type}</strong>
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <span>Read Full Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Next Steps */}
      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
          Recommended Verification Steps
        </h3>
        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Open the primary official source link to inspect date, jurisdiction, and official letterhead.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Avoid forwarding or amplifying this message across WhatsApp or social channels until independently confirmed.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>If financial fraud or fake recruitment deposits are demanded, report immediately to the National Cyber Crime Portal (1930).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Submit to our Community Discussion or request review from our accredited Expert Network.</span>
          </li>
        </ul>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Rate this Verification Report
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback helps refine linguistic heuristics and evidence weighting.
            </p>

            {feedbackSubmitted ? (
              <div className="py-6 text-center text-xs font-semibold text-teal-600">
                Thank you! Your feedback has been recorded.
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFeedbackRating(num)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border transition-colors ${
                          feedbackRating >= num
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ★ {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Comments or Additional Context (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide any feedback or evidence suggestions..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
