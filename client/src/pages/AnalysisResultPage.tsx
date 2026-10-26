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
  Bookmark,
  BookmarkCheck,
  Bot,
  Sparkles,
  CheckCircle2,
  Info,
  Shield,
  HelpCircle,
  Star,
  ArrowLeft,
  AlertOctagon,
  FileText,
} from 'lucide-react';
import { api } from '../services/api.js';

export const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadAnalysis() {
      if (!id) return;
      try {
        const res = await api.getAnalysisById(id);
        setData(res);
        setSaved(res?.analysis?.is_public === 1 || res?.analysis?.status === 'completed');
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
    const a = data.analysis;
    const textToCopy = `TrustLens Investigation Report\n===============================\nClaim: "${a.original_input}"\nEvidence Outcome: ${getAssessmentLabel(a.risk_level, a.summary)}\nDate: ${new Date(a.created_at).toLocaleDateString()}\n\nWhat was claimed:\n${a.original_input}\n\nEvidence Summary:\n${a.summary}\n\nVerified via TrustLens Platform — Verify Before You Trust.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveInvestigation = () => {
    setSaved((prev) => !prev);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handlePrepareReport = () => {
    if (!data?.analysis) return;
    navigate(`/dashboard/report-center?claim=${encodeURIComponent(data.analysis.original_input)}`);
  };

  // Four Strict Evidence Assessments
  const getAssessmentLabel = (riskLevel: string, summary?: string) => {
    if (summary && summary.toLowerCase().includes('insufficient evidence')) {
      return 'Insufficient Evidence';
    }
    if (riskLevel === 'lower_risk') {
      return 'Supported by Evidence';
    }
    if (riskLevel === 'elevated_risk') {
      return 'Contradicted by Evidence';
    }
    return 'Mixed or Misleading';
  };

  const getAssessmentStyle = (label: string) => {
    switch (label) {
      case 'Supported by Evidence':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Contradicted by Evidence':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Mixed or Misleading':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Insufficient Evidence':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-xs font-semibold text-slate-500">Retrieving investigation findings...</div>
      </div>
    );
  }

  if (error || !data?.analysis) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Investigation Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This investigation may have been deleted or is not accessible.'}</p>
        <Link
          to="/dashboard/verify"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification Desk</span>
        </Link>
      </div>
    );
  }

  const { analysis, claims, indicators, evidenceSources } = data;
  const outcomeLabel = getAssessmentLabel(analysis.risk_level, analysis.summary);

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:p-0">
      {/* 5 Result Actions Bar: Save, Copy Summary, Export PDF, Ask AI Assistant, Prepare Report */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/dashboard/verify"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#14B8A6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Investigation</span>
        </Link>

        {/* The 5 Required Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: Save Investigation */}
          <button
            type="button"
            onClick={handleSaveInvestigation}
            className="px-3 py-1.5 text-xs font-bold border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0B1220] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : 'Save Investigation'}</span>
          </button>

          {/* Button 2: Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1.5 text-xs font-bold border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0B1220] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          {/* Button 3: Export PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-bold border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0B1220] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          {/* Button 4: Ask AI Assistant */}
          <a
            href={`#ai-assistant`}
            onClick={(e) => {
              e.preventDefault();
              const floatBtn = document.querySelector('button[aria-label="Open TrustLens AI Assistant"]') as HTMLElement;
              if (floatBtn) floatBtn.click();
            }}
            className="px-3 py-1.5 text-xs font-bold bg-[#0B1220] dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Ask AI Assistant</span>
          </a>

          {/* Button 5: Prepare Report */}
          <button
            type="button"
            onClick={handlePrepareReport}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Prepare Report</span>
          </button>
        </div>
      </div>

      {/* Result Header & Outcome Label */}
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(analysis.created_at).toLocaleString()}
              </span>
              <span>•</span>
              <span className="capitalize">{analysis.input_type} Analysis</span>
              <span>•</span>
              <span className="uppercase font-mono font-semibold text-[#14B8A6]">
                {analysis.detected_language}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-slate-100">
              Investigation Report
            </h1>
          </div>

          {/* Evidence Assessment Badge */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <div
              className={`px-4 py-2 rounded-2xl border text-xs font-black tracking-wide uppercase ${getAssessmentStyle(
                outcomeLabel
              )}`}
            >
              {outcomeLabel}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Uncertainty: {analysis.uncertainty_rating || 'Moderate'}
            </span>
          </div>
        </div>

        {/* Original Submitted Claim */}
        <div className="py-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            What was claimed:
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090F1A] border border-[#E2E8F0] dark:border-slate-800/80 font-serif italic text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
            “{analysis.original_input}”
          </div>
        </div>

        {/* Main Assessment Grid: What was claimed, What was examined, What evidence indicates, What remains unknown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#14B8A6]" />
              <span>What was examined:</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Syntactic phrasing, manufactured urgency cues, quantitative metrics, and matching public registry fact-check releases.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
              <span>What available evidence indicates:</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 md:col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#14B8A6]" />
              <span>What remains unknown / Inherent Uncertainty:</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Uncertainty is rated as <strong>{analysis.uncertainty_rating || 'Moderate'}</strong>. Fresh regional developments or local department communications may emerge after this timestamp. Check official department domains before taking action.
            </p>
          </div>
        </div>
      </div>

      {/* Claim-by-Claim Breakdown */}
      {claims && claims.length > 0 && (
        <div className="bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100 mb-1">
            Claim-by-Claim Breakdown
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Individual verifiable factual assertions extracted from the content
          </p>

          <div className="space-y-3">
            {claims.map((claim: any, idx: number) => (
              <div
                key={claim.id || idx}
                className="p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Claim #{claim.position || idx + 1}: {claim.claim_text}
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                    {claim.verification_status || 'Analyzed'}
                  </span>
                </div>
                {claim.assessment && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    <strong>Assessment & Context:</strong> {claim.assessment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Indicators Section */}
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100 mb-1">
          Content Signals & Risk Indicators
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Observable presentation signals (sensational wording, urgency, attribution gaps). These indicators are diagnostic markers, not standalone proof that content is false.
        </p>

        {indicators.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No anomalous manipulative signals detected in this content.
          </div>
        ) : (
          <div className="space-y-3.5">
            {indicators.map((ind: any) => (
              <div
                key={ind.id}
                className="p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {ind.indicator_name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                    {ind.severity}
                  </span>
                </div>

                {ind.observed_snippet && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-800 mb-2">
                    Observed: "{ind.observed_snippet}"
                  </div>
                )}

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Why it matters:</strong> {ind.explanation}
                </p>

                <p className="text-[11px] text-slate-500 mt-1 italic">
                  <strong>Documented Limitation:</strong> {ind.limitation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Sources Section */}
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100 mb-1">
          Evidence Sources
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Direct citations from credible publishers, gazettes, and official fact-checking registries
        </p>

        {evidenceSources.length === 0 ? (
          <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300">
            <div className="font-bold mb-1">Insufficient External Evidence Indexed</div>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">
              No matching fact-check records were found in certified repositories for this specific phrasing. This often occurs with newly fabricated hyper-local claims. Lack of an indexed debunk does not prove authenticity.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidenceSources.map((source: any) => (
              <div
                key={source.id}
                className="p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#14B8A6]">
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

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Source Type: <strong className="capitalize text-slate-600 dark:text-slate-300">{source.source_type}</strong>
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#14B8A6] hover:underline"
                  >
                    <span>Read Original Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
