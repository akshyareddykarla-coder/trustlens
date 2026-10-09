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
  Flag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New claim modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [claimText, setClaimText] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await api.getCommunityClaims(q);
      setClaims(data.claims || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

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
      alert(err.message);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCommunityClaim({ title, claimText, summary });
      setShowModal(false);
      setTitle('');
      setClaimText('');
      setSummary('');
      fetchClaims();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>Community Verification Feed</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Collaboratively deliberate disputed claims and share independent evidence links.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              alert('Please sign in to submit a claim to the community.');
              return;
            }
            setShowModal(true);
          }}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Claim to Community</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <span>
          <strong>Ethical Community Notice:</strong> Community deliberation reflects public feedback and crowd discovery. It is not infallible proof of factual truth.
        </span>
      </div>

      {/* Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading community deliberations...</div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No community claims submitted yet. Be the first to share a claim for verification!
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {claim.author_name || 'Community Member'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Link to={`/community/${claim.id}`}>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 transition-colors">
                      {claim.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-serif italic">
                    "{claim.claim_text}"
                  </p>

                  {claim.summary && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      Note: {claim.summary}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={(e) => handleVote(claim.id, 'helpful', e)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-teal-600 font-medium"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{claim.upvotes || 0} Helpful</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleVote(claim.id, 'unhelpful', e)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{claim.downvotes || 0}</span>
                    </button>

                    <Link
                      to={`/community/${claim.id}`}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-teal-600 font-medium ml-auto sm:ml-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{claim.comment_count || 0} Comments</span>
                    </Link>
                  </div>
                </div>

                <Link
                  to={`/community/${claim.id}`}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold self-start sm:self-center flex items-center gap-1"
                >
                  <span>Discuss</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for creating community claim */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Submit Claim for Community Deliberation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Share a suspicious statement or forwarded claim with the community for collective evidence gathering.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Claim Topic / Headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Viral claim about banking transaction curfew"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Claim Statement
                </label>
                <textarea
                  rows={4}
                  required
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="Paste the message or viral forward text here..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Context (Optional)
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Where was this observed (e.g. WhatsApp forward, X post)?"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Post to Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
