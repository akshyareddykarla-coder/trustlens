import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { RiskBadge } from '../components/common/RiskBadge.js';

export const AnalysisHistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (riskFilter) params.append('riskLevel', riskFilter);
      if (languageFilter) params.append('language', languageFilter);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const data = await api.getAnalyses(queryStr);
      setAnalyses(data.analyses || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [riskFilter, languageFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis report permanently?')) {
      return;
    }

    try {
      await api.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600" />
            <span>Analysis History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and manage your past verification scans and saved reports ({total} total).
          </p>
        </div>

        <Link
          to="/verify"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims or summaries..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-slate-800 dark:text-slate-100"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="">All Risk Levels</option>
            <option value="lower_risk">Lower Risk Signals</option>
            <option value="needs_verification">Needs Verification</option>
            <option value="elevated_risk">Elevated Risk Signals</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      {/* Analyses List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading history records...</div>
        ) : analyses.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">No records found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or analyze a new claim.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {analyses.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="uppercase font-mono">{item.detected_language}</span>
                    <span>•</span>
                    <span className="capitalize">{item.input_type}</span>
                  </div>

                  <Link to={`/analysis/${item.id}`} className="group">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {item.original_input}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.summary}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                  <RiskBadge level={item.risk_level} size="sm" />

                  <Link
                    to={`/analysis/${item.id}`}
                    className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="View report"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
