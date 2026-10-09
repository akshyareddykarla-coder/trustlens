import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Link2,
  Clock,
  Flag,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Misinformation / Harmful Rumor');
  const [reportDetails, setReportDetails] = useState('');
  const [reportDone, setReportDone] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const res = await api.getCommunityClaimById(id);
      setData(res);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleVote = async (type: 'helpful' | 'unhelpful') => {
    if (!id || !user) {
      alert('Please sign in to vote.');
      return;
    }
    try {
      await api.voteClaim(id, type);
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentContent.trim()) return;
    if (!user) {
      alert('Please sign in to post a comment or evidence link.');
      return;
    }

    setSubmittingComment(true);
    try {
      await api.postComment(id, {
        content: commentContent.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
      });
      setCommentContent('');
      setEvidenceUrl('');
      fetchDetail();
    } catch (err: any) {
      alert(`Comment failed: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.reportClaim(id, { reason: reportReason, details: reportDetails });
      setReportDone(true);
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (err: any) {
      alert(`Report failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading discussion...</div>;
  }

  if (!data?.claim) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <div className="text-sm font-bold">Claim discussion not found</div>
        <Link to="/community" className="text-xs text-teal-600 hover:underline">
          Return to Community Feed
        </Link>
      </div>
    );
  }

  const { claim, comments, userVote } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Community Feed</span>
      </Link>

      {/* Claim Detail Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>
            Posted by <strong className="text-slate-700 dark:text-slate-300">{claim.author_name}</strong> on {new Date(claim.created_at).toLocaleDateString()}
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px]"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Content</span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {claim.title}
        </h1>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 font-serif italic text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          “{claim.claim_text}”
        </div>

        {claim.summary && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Context: {claim.summary}
          </p>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => handleVote('helpful')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
              userVote === 'helpful'
                ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{claim.upvotes || 0} Helpful</span>
          </button>

          <button
            type="button"
            onClick={() => handleVote('unhelpful')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
              userVote === 'unhelpful'
                ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{claim.downvotes || 0}</span>
          </button>
        </div>
      </div>

      {/* Discussion & Comments */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <span>Evidence & Deliberation ({comments.length})</span>
        </h2>

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            rows={3}
            required
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Share supporting evidence, rebuttal sources, or contextual observations..."
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-slate-900 dark:text-slate-100"
          />

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Link2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Optional corroborating URL link..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="w-full sm:w-auto px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-2">
          {comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No comments posted yet. Add your evidence above!
            </div>
          ) : (
            comments.map((cm: any) => (
              <div key={cm.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                      {cm.author_name || 'Community Member'}
                    </strong>
                    {cm.author_role && cm.author_role !== 'user' && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        {cm.author_role}
                      </span>
                    )}
                  </div>
                  <span>{new Date(cm.created_at).toLocaleDateString()}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {cm.content}
                </p>

                {cm.evidence_url && (
                  <a
                    href={cm.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <span>Attached Evidence Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Report Content to Moderation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Help keep TrustLens discussions truthful, respectful, and safe.
            </p>

            {reportDone ? (
              <div className="py-6 text-center text-xs font-semibold text-teal-600">
                Thank you. Report received for moderator review.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Misinformation / Harmful Rumor">Misinformation / Harmful Rumor</option>
                    <option value="Hate Speech / Harassment">Hate Speech / Harassment</option>
                    <option value="Spam / Commercial Promotion">Spam / Commercial Promotion</option>
                    <option value="Duplicate Submission">Duplicate Submission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional context for the moderation team..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
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
