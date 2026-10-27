import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Archive,
  Search,
  ExternalLink,
  Paperclip,
  Send,
  User,
  Filter,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { DemoModeSwitcher } from '../components/experts/DemoModeSwitcher.js';
import { getStoredRequests, updateStoredRequest } from '../services/expertRequestStorage.js';

export const ExpertPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [requests, setRequests] = useState<any[]>(() => getStoredRequests());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reply Modal State
  const [replyModalRequest, setReplyModalRequest] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Decline Modal State
  const [declineModalRequest, setDeclineModalRequest] = useState<any | null>(null);
  const [declineReason, setDeclineReason] = useState('Out of statutory review jurisdiction.');
  const [declineSubmitting, setDeclineSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    const storedRole = localStorage.getItem('trustlens_dev_expert_role') || 'all';
    const local = getStoredRequests(storedRole);
    try {
      const params = new URLSearchParams();
      params.append('portal', 'true');
      if (activeStatus !== 'all') {
        params.append('status', activeStatus);
      }
      const data = await api.getExpertRequests(`?${params.toString()}`);
      const apiReqs = data?.requests || [];
      const combined = [...apiReqs];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id)) {
          combined.push(loc);
        }
      }
      const finalReqs = combined.length > 0 ? combined : local;
      setRequests(activeStatus === 'all' ? finalReqs : finalReqs.filter((r) => r.status === activeStatus));
    } catch {
      setRequests(activeStatus === 'all' ? local : local.filter((r) => r.status === activeStatus));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: string, extraBody: any = {}) => {
    updateStoredRequest(requestId, { action, ...extraBody });
    try {
      await api.updateExpertRequest(requestId, { action, ...extraBody });
    } catch {}
    setActionSuccess(`Request ${requestId} status updated (${action}).`);
    setTimeout(() => setActionSuccess(null), 4000);
    fetchRequests();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalRequest || !replyText.trim()) return;

    setReplySubmitting(true);
    updateStoredRequest(replyModalRequest.id, {
      action: 'reply',
      responseText: replyText.trim(),
    });

    try {
      await api.updateExpertRequest(replyModalRequest.id, {
        action: 'reply',
        responseText: replyText.trim(),
      });
    } catch {}

    setActionSuccess(`Official response sent to ${replyModalRequest.user_name} for case ${replyModalRequest.id}.`);
    setTimeout(() => setActionSuccess(null), 4000);
    setReplyModalRequest(null);
    setReplyText('');
    setReplySubmitting(false);
    fetchRequests();
  };

  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineModalRequest) return;

    setDeclineSubmitting(true);
    updateStoredRequest(declineModalRequest.id, {
      action: 'decline',
      reason: declineReason.trim(),
    });

    try {
      await api.updateExpertRequest(declineModalRequest.id, {
        action: 'decline',
        declineReason: declineReason.trim(),
      });
    } catch {}

    setActionSuccess(`Request ${declineModalRequest.id} has been declined.`);
    setTimeout(() => setActionSuccess(null), 4000);
    setDeclineModalRequest(null);
    setDeclineSubmitting(false);
    fetchRequests();
  };

  const filtered = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q) ||
      r.user_name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Incoming (Pending)</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Accepted</span>;
      case 'in_review':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">In Review</span>;
      case 'responded':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">Responded</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Closed</span>;
      case 'declined':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-500/10 text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#14B8A6]" />
            <span>Expert Verification Portal</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Incoming citizen requests, forensic evidence evaluation, and official findings dispatch.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Demonstration Sandbox Notice & Switcher */}
      <DemoModeSwitcher onPersonaChange={() => fetchRequests()} />

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Status Filter Tabs & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: 'Incoming Requests' },
              { id: 'accepted', label: 'Accepted Requests' },
              { id: 'in_review', label: 'Requests In Review' },
              { id: 'responded', label: 'Responded Requests' },
              { id: 'closed', label: 'Closed Requests' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeStatus === tab.id
                    ? 'bg-[#14B8A6] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, subject, or requester..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>Active Queue Count: {filtered.length} requests</span>
          <span>Role Authorization: Verified Specialist / Demonstration Desk</span>
        </div>
      </div>

      {/* Requests Queue */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
          <span>Loading queue requests...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white dark:bg-[#0B1220] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-sm text-slate-700 dark:text-slate-200">
            No requests in this queue
          </div>
          <p className="max-w-md mx-auto text-slate-500">
            Citizen requests submitted through Report Center → Expert Connect will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm space-y-4 hover:border-[#14B8A6]/40 transition-colors"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#14B8A6] px-2 py-0.5 bg-[#14B8A6]/10 rounded-lg">
                    {req.id}
                  </span>
                  {getStatusBadge(req.status)}
                  <span className="text-xs text-slate-400">
                    • Submitted: {new Date(req.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Desk: {req.expert_name || 'General Desk'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                    {req.preferred_language?.toUpperCase() || 'EN'}
                  </span>
                </div>
              </div>

              {/* Subject & User Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Requester: <strong className="text-slate-700 dark:text-slate-300">{req.user_name}</strong></span>
                  {req.user_email && <span className="text-slate-400">({req.user_email})</span>}
                  <span className="text-slate-400">• Category: <strong className="text-slate-600 dark:text-slate-400">{req.category}</strong></span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {req.subject}
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {req.description}
                </div>

                {/* Permitted Attachments */}
                {req.attachment_url && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-[#14B8A6]">
                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                    <a
                      href={req.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Permitted Attachment: {req.attachment_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Official Response History if available */}
              {req.response_text && (
                <div className="p-4 rounded-2xl bg-[#14B8A6]/5 border border-[#14B8A6]/30 text-xs text-slate-800 dark:text-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#14B8A6]">
                    <span>Expert Findings Sent to Citizen</span>
                    {req.responded_at && (
                      <span className="text-slate-400 font-normal">
                        {new Date(req.responded_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {req.response_text}
                  </p>
                </div>
              )}

              {/* Decline Reason if applicable */}
              {req.status === 'declined' && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  <strong>Declined:</strong> {req.expert_notes || 'No decline reason specified.'}
                </div>
              )}

              {/* Expert Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  Current Case Status: <strong className="uppercase text-slate-600 dark:text-slate-300">{req.status}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Action 1: Accept */}
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(req.id, 'accept')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => setDeclineModalRequest(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {/* Action 2: Review */}
                  {(req.status === 'accepted' || req.status === 'pending') && (
                    <button
                      onClick={() => handleAction(req.id, 'review')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  )}

                  {/* Action 3: Reply */}
                  {req.status !== 'declined' && req.status !== 'closed' && (
                    <button
                      onClick={() => {
                        setReplyModalRequest(req);
                        setReplyText(req.response_text || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{req.response_text ? 'Edit / Update Reply' : 'Reply'}</span>
                    </button>
                  )}

                  {/* Action 4: Close */}
                  {req.status !== 'closed' && (
                    <button
                      onClick={() => handleAction(req.id, 'close')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1220] rounded-3xl max-w-xl w-full p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs text-[#14B8A6] font-bold">
                  {replyModalRequest.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Dispatch Expert Findings to {replyModalRequest.user_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Subject: {replyModalRequest.subject}
                </p>
              </div>
              <button
                onClick={() => setReplyModalRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSendReply} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Expert Assessment & Verification Findings <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Detail your forensic findings, verification confirmation, source cross-references, or statutory advice..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-800 dark:text-teal-200 text-[11px] leading-relaxed">
                Submitting this reply will mark the request as <strong>Responded</strong> and deliver an in-app notification to the citizen.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplyModalRequest(null)}
                  disabled={replySubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {replySubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Reply...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1220] rounded-3xl max-w-md w-full p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Decline Verification Request
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Case {declineModalRequest.id} • {declineModalRequest.subject}
            </p>

            <form onSubmit={handleConfirmDecline} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Declining
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="Out of statutory review jurisdiction.">Out of statutory review jurisdiction</option>
                  <option value="Insufficient forensic context or unreadable evidence.">Insufficient forensic context or unreadable evidence</option>
                  <option value="Exceeds current casework capacity.">Exceeds current casework capacity</option>
                  <option value="Duplicate or previously debunked query.">Duplicate or previously debunked query</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeclineModalRequest(null)}
                  disabled={declineSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={declineSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                >
                  {declineSubmitting ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
