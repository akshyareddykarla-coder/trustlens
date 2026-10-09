import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Building,
  Flag,
} from 'lucide-react';
import { api } from '../services/api.js';

export const ReportCenterPage: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Broken link modal
  const [showBrokenModal, setShowBrokenModal] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [reported, setReported] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());

      const data = await api.getResources(params.toString() ? `?${params.toString()}` : '');
      setResources(data.resources || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleReportBroken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.reportBrokenResource({ resourceId: selectedResourceId, notes });
      setReported(true);
      setTimeout(() => setShowBrokenModal(false), 1500);
    } catch (err: any) {
      alert(`Report failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-600" />
            <span>Citizen Report Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified official portals for reporting cybercrime, financial impersonation, and harmful disinformation.
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Always Verify Official URLs:</strong> Ensure the domain ends in official extensions (.gov.in, .nic.in) before submitting personal identification numbers or bank details.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agencies, keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'cybercrime', label: 'Cyber Financial Fraud' },
            { id: 'government', label: 'Government Fact-Checking' },
            { id: 'social_media', label: 'Platform Grievances' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading statutory resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider text-[10px]">
                    {item.jurisdiction}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified {item.verified_date}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="block text-slate-900 dark:text-slate-100 mb-0.5 text-[11px]">
                    Procedure & What They Handle:
                  </strong>
                  {item.handling_process}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResourceId(item.id);
                    setShowBrokenModal(true);
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report link issue</span>
                </button>

                <a
                  href={item.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Open Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broken link modal */}
      {showBrokenModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Report Broken or Outdated Link
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Help maintain link integrity across statutory portals.
            </p>

            {reported ? (
              <div className="py-6 text-center text-xs font-semibold text-teal-600">
                Thank you! Our editorial team will review this URL.
              </div>
            ) : (
              <form onSubmit={handleReportBroken} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Describe the issue
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Portal moved to new address, SSL certificate expired..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBrokenModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Submit Report
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
