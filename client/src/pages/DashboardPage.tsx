import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Users,
  Award,
  GraduationCap,
  Sparkles,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { RiskBadge } from '../components/common/RiskBadge.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    lowerRisk: 0,
    needsVerification: 0,
    elevatedRisk: 0,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const data = await api.getAnalyses('?limit=8');
        const list = data.analyses || [];
        setAnalyses(list);

        const lower = list.filter((a: any) => a.risk_level === 'lower_risk').length;
        const needs = list.filter((a: any) => a.risk_level === 'needs_verification').length;
        const elevated = list.filter((a: any) => a.risk_level === 'elevated_risk').length;

        setStats({
          total: data.total || list.length,
          lowerRisk: lower,
          needsVerification: needs,
          elevatedRisk: elevated,
        });
      } catch (err) {
        console.warn('Dashboard fetch notice:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold mb-3 border border-teal-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Verification Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {user?.displayName || 'Analyst'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Examine claim credibility using linguistic indicators, verified fact-checking records, and expert peer review.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/verify"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Verify New Claim</span>
            </Link>
            <Link
              to="/assistant"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/15 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Analyses</span>
            <FileCheck2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Calculated from saved scans</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Lower Risk Signals</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {stats.lowerRisk}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Corroborated by verified sources</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>Needs Verification</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.needsVerification}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Unresolved or moderate signals</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>Elevated Risk Signals</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
            {stats.elevatedRisk}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Contradicted or viral markers</div>
        </div>
      </div>

      {/* Main Grid: Recent Analyses + Verification Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Analyses */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Verification Reports
              </h2>
              <p className="text-xs text-slate-500">Structured claim assessments with source citations</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading analysis reports...</div>
          ) : analyses.length === 0 ? (
            <div className="py-12 text-center">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">No analyses performed yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Paste a suspicious text message, upload a screenshot, or enter an article URL to start.
              </p>
              <Link
                to="/verify"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700"
              >
                <span>Verify Your First Claim</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {analyses.map((a) => (
                <Link
                  key={a.id}
                  to={`/analysis/${a.id}`}
                  className="block py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {a.original_input}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{a.summary}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                        <span className="capitalize">
                          {a.input_type} • {a.detected_language}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <RiskBadge level={a.risk_level} size="sm" />
                      <span className="text-[11px] font-mono text-slate-400">
                        Score: {a.risk_score}/100
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Quick Navigation & Hubs */}
        <div className="space-y-6">
          {/* Official Help / Reporting Portal */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Citizen Report Center
                </h3>
                <span className="text-[10px] text-slate-400">Official reporting channels</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Found malicious cyber fraud, electoral misinformation, or harmful viral rumors? Access verified statutory reporting portals.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-teal-600 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>National Cyber Crime (1930)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://factcheck.pib.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-teal-600 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>PIB Fact Check Desk</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
            <Link
              to="/report-center"
              className="mt-3 block text-center py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Browse all official channels →
            </Link>
          </div>

          {/* Educational Lesson Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Media Literacy Spotlight
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Anatomy of a viral forward: learn why manufactured urgency is the #1 signal of social engineering.
            </p>
            <Link
              to="/education"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              <span>Take quick interactive quiz</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
