import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Activity, Sparkles, ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../services/api.js';

export const AnalyticsPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getAnalyses('?limit=100');
        setAnalyses(data.analyses || []);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const total = analyses.length;
  const lowerRiskCount = analyses.filter((a) => a.risk_level === 'lower_risk').length;
  const needsVerifCount = analyses.filter((a) => a.risk_level === 'needs_verification').length;
  const elevatedRiskCount = analyses.filter((a) => a.risk_level === 'elevated_risk').length;

  const enCount = analyses.filter((a) => a.detected_language === 'en').length;
  const teCount = analyses.filter((a) => a.detected_language === 'te').length;
  const hiCount = analyses.filter((a) => a.detected_language === 'hi').length;

  const textCount = analyses.filter((a) => a.input_type === 'text').length;
  const imgCount = analyses.filter((a) => a.input_type === 'image').length;
  const urlCount = analyses.filter((a) => a.input_type === 'url').length;

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Real Verification Metrics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Personal Analytics & Risk Breakdown
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Calculated exclusively from active stored database records.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading analytics...</div>
      ) : (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Scans Recorded</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{total}</div>
              <div className="text-[11px] text-slate-400 mt-1">In your personal history</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-emerald-600 font-medium">Corroborated News</div>
              <div className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {total > 0 ? Math.round((lowerRiskCount / total) * 100) : 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{lowerRiskCount} claims supported</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-rose-600 font-medium">Elevated Risk Rate</div>
              <div className="mt-2 text-3xl font-extrabold text-rose-700 dark:text-rose-300">
                {total > 0 ? Math.round((elevatedRiskCount / total) * 100) : 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{elevatedRiskCount} viral or contradicted</div>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Risk Level Categorization</span>
              </h2>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">Lower Risk Signals</span>
                    <span className="font-mono text-slate-500">{lowerRiskCount} ({total > 0 ? Math.round((lowerRiskCount / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${total > 0 ? (lowerRiskCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-amber-700 dark:text-amber-300">Needs Verification</span>
                    <span className="font-mono text-slate-500">{needsVerifCount} ({total > 0 ? Math.round((needsVerifCount / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${total > 0 ? (needsVerifCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-rose-700 dark:text-rose-300">Elevated Risk Signals</span>
                    <span className="font-mono text-slate-500">{elevatedRiskCount} ({total > 0 ? Math.round((elevatedRiskCount / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${total > 0 ? (elevatedRiskCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Language Distribution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                <span>Multilingual Linguistic Diversity</span>
              </h2>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">English</span>
                    <span className="font-mono text-slate-500">{enCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${total > 0 ? (enCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">తెలుగు (Telugu)</span>
                    <span className="font-mono text-slate-500">{teCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full"
                      style={{ width: `${total > 0 ? (teCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">हिन्दी (Hindi)</span>
                    <span className="font-mono text-slate-500">{hiCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${total > 0 ? (hiCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
