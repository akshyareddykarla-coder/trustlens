import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  BookmarkCheck,
  AlertCircle,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<any[]>([]);
  const [communityClaims, setCommunityClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickClaim, setQuickClaim] = useState('');

  // Real statistics from DB
  const [stats, setStats] = useState({
    totalVerifications: 0,
    savedInvestigations: 0,
    unresolvedClaims: 0,
    communityContributions: 0,
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [analysesData, communityData] = await Promise.all([
          api.getAnalyses('?limit=5'),
          api.getCommunityClaims('?limit=3'),
        ]);

        const list = analysesData.analyses || [];
        setAnalyses(list);

        const communityList = communityData.claims || [];
        setCommunityClaims(communityList);

        // Calculate real metrics without arbitrary fake numbers
        const total = analysesData.total || list.length;
        const saved = list.filter((a: any) => a.is_public || a.status === 'completed').length;
        const unresolved = list.filter(
          (a: any) =>
            a.risk_level === 'needs_verification' ||
            a.uncertainty_rating === 'high' ||
            a.summary?.toLowerCase().includes('insufficient')
        ).length;

        // User's own contributions in community
        const myContributions = communityList.filter((c: any) => c.user_id === user?.id).length;

        setStats({
          totalVerifications: total,
          savedInvestigations: saved,
          unresolvedClaims: unresolved,
          communityContributions: myContributions,
        });
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [user]);

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickClaim.trim()) {
      navigate(`/dashboard/verify?q=${encodeURIComponent(quickClaim.trim())}`);
    } else {
      navigate('/dashboard/verify');
    }
  };

  const getEvidenceBadge = (riskLevel: string, summary?: string) => {
    if (summary && summary.toLowerCase().includes('insufficient evidence')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Insufficient Evidence
        </span>
      );
    }
    if (riskLevel === 'lower_risk') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
          Supported by Evidence
        </span>
      );
    }
    if (riskLevel === 'elevated_risk') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
          Contradicted by Evidence
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
        Mixed or Misleading
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50">
          Welcome back, {user?.displayName || 'Investigator'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Your workspace for investigating information and reviewing evidence.
        </p>
      </div>

      {/* Main Dashboard Cards (Real Data from Supabase / DB) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Verifications */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Verifications</span>
            <FileCheck2 className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#0B1220] dark:text-white">
            {stats.totalVerifications}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Processed claims</div>
        </div>

        {/* Card 2: Saved Investigations */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Saved Investigations</span>
            <BookmarkCheck className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#0B1220] dark:text-white">
            {stats.savedInvestigations}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Stored in private archive</div>
        </div>

        {/* Card 3: Unresolved Claims */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Unresolved Claims</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.unresolvedClaims}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Require additional evidence</div>
        </div>

        {/* Card 4: Community Contributions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Community Contributions</span>
            <Users className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#0B1220] dark:text-white">
            {stats.communityContributions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Deliberation posts & notes</div>
        </div>
      </div>

      {/* Prominent Quick Verification Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
            Verify a Claim
          </h2>
        </div>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
          Submit suspicious claims or viral forwards directly to the verification pipeline for claim extraction and live evidence matching.
        </p>

        <form onSubmit={handleQuickAnalyze} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={quickClaim}
            onChange={(e) => setQuickClaim(e.target.value)}
            placeholder="Paste a suspicious claim or message here..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Analyze Claim</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
              Recent Activity
            </h2>
            <p className="text-xs text-slate-500">Your latest verification investigations and assessments</p>
          </div>
          <Link
            to="/dashboard/history"
            className="text-xs font-bold text-[#14B8A6] hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading recent investigations...</div>
        ) : analyses.length === 0 ? (
          <div className="py-12 text-center">
            <FileCheck2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No investigations yet. Verify your first claim to get started.
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Submit text, a screenshot, or an article URL to see verified evidence and risk breakdowns.
            </p>
            <Link
              to="/dashboard/verify"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] text-white rounded-xl text-xs font-bold hover:bg-[#0D9488] transition-colors"
            >
              <span>Verify Content</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {analyses.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl px-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {item.original_input}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {item.summary}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{item.input_type}</span>
                    <span className="uppercase font-mono">{item.detected_language}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center flex-shrink-0">
                  {getEvidenceBadge(item.risk_level, item.summary)}
                  <Link
                    to={`/analysis/${item.id}`}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:border-[#14B8A6] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#14B8A6] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Compact Sections: Community Activity & Learn to Verify */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Community Activity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#14B8A6]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Community Activity
              </h3>
            </div>
            <Link
              to="/dashboard/community"
              className="text-[11px] font-bold text-[#14B8A6] hover:underline"
            >
              Browse Feed →
            </Link>
          </div>

          {communityClaims.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No recent community discussions. Share a suspicious forward for peer review.
            </div>
          ) : (
            <div className="space-y-3">
              {communityClaims.map((c) => (
                <Link
                  key={c.id}
                  to={`/community/${c.id}`}
                  className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {c.title}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    "{c.claim_text}"
                  </p>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {c.upvotes || 0} found helpful • {c.comment_count || 0} evidence comments
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Learn to Verify */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#14B8A6]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                Learn to Verify
              </h3>
            </div>
            <Link
              to="/education"
              className="text-[11px] font-bold text-[#14B8A6] hover:underline"
            >
              All Modules →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Spotting Manufactured Urgency
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Messages instructing you to "forward immediately before midnight" exploit fear rather than factual reporting. Always corroborate with primary gazettes.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Evaluating Screenshot Credibility
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Visual headers can be fabricated with basic editing tools. Compare quoted statements against verified government fact-check desks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
