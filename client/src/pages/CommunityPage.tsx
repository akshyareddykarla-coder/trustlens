import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'latest' | 'popular' | 'unresolved' | 'with_evidence'>('latest');

  // New claim modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [claimText, setClaimText] = useState('');
  const [summary, setSummary] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await api.getCommunityClaims(q);
      let list = data.claims || [];

      // Apply Filter Tabs
      if (activeFilter === 'popular') {
        list = [...list].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      } else if (activeFilter === 'unresolved') {
        list = list.filter((c: any) => c.status !== 'resolved');
      } else if (activeFilter === 'with_evidence') {
        list = list.filter((c: any) => (c.comment_count || 0) > 0 || c.summary?.includes('http'));
      } else {
        // latest (default)
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setClaims(list);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClaims();
  };

  const handleVote = async (id: string, type: 'helpful' | 'unhelpful', e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to vote on community claims.');
      return;
    }
    try {
      await api.voteClaim(id, type);
      fetchClaims();
    } catch (err: any) {
      alert(err.message || 'Voting failed');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    setSubmitting(true);
    try {
      const fullSummary = evidenceUrl.trim()
        ? `${summary ? summary + '\n' : ''}Evidence Link: ${evidenceUrl.trim()}`
        : summary;

      await api.createCommunityClaim({
        title: title.trim() || 'Community Verification Query',
        claimText: claimText.trim(),
        summary: fullSummary,
      });

      setShowModal(false);
      setTitle('');
      setClaimText('');
      setSummary('');
      setEvidenceUrl('');
      fetchClaims();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Search & Create Post */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#14B8A6]" />
            <span>Community Verification</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            Collaborative fact-checking feed and public evidence deliberating suspicious claims.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              alert('Please sign in to submit a claim for community deliberation.');
              return;
            }
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Community Ethics Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#14B8A6]/10 dark:bg-[#14B8A6]/15 border border-[#14B8A6]/20 text-xs text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
        <span>
          <strong>Community Guidelines:</strong> Votes and comments represent crowd discovery and peer corroboration. Factual ground truth requires verified primary evidence.
        </span>
      </div>

      {/* Search & Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions & claims..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
          />
        </form>

        {/* 4 Required Filters: Latest, Popular, Unresolved, With Evidence */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'latest', label: 'Latest' },
            { id: 'popular', label: 'Popular' },
            { id: 'unresolved', label: 'Unresolved' },
            { id: 'with_evidence', label: 'With Evidence' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discussion Feed */}
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading community deliberations...</div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No community posts found. Be the first to start a verification discussion!
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {claim.author_name || 'Community Member'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                    <span className="ml-auto sm:ml-2 uppercase font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {claim.status || 'Active'}
                    </span>
                  </div>

                  <Link to={`/community/${claim.id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#14B8A6] transition-colors">
                      {claim.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    "{claim.claim_text}"
                  </p>

                  {claim.summary && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                      {claim.summary}
                    </p>
                  )}

                  {/* Actions & Metrics */}
                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={(e) => handleVote(claim.id, 'helpful', e)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-[#14B8A6] font-semibold transition-colors"
                      title="Mark as helpful evidence"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{claim.upvotes || 0} Helpful</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleVote(claim.id, 'unhelpful', e)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold transition-colors"
                      title="Mark as unhelpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{claim.downvotes || 0}</span>
                    </button>

                    <Link
                      to={`/community/${claim.id}`}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-[#14B8A6] font-semibold transition-colors ml-auto sm:ml-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{claim.comment_count || 0} Comments & Evidence</span>
                    </Link>
                  </div>
                </div>

                <Link
                  to={`/community/${claim.id}`}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#14B8A6] hover:text-white text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold self-start sm:self-center flex items-center gap-1.5 transition-colors"
                >
                  <span>Participate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Creating Community Post */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1220] rounded-3xl p-6 max-w-lg w-full border border-[#E2E8F0] dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create Community Verification Post
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit a suspicious claim or viral message for peer review, source discovery, and community notes.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Claim Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Viral claim about new railway recruitment examination"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Claim Statement *
                </label>
                <textarea
                  rows={4}
                  required
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="Paste the message, viral quote, or forwarded claim here..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Evidence Reference URL (Optional)
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Context Note (Optional)
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Where was this observed? (e.g. Received via WhatsApp group in Hyderabad)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold shadow transition-colors"
                >
                  {submitting ? 'Publishing...' : 'Publish to Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
