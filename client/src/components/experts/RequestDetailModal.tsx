import React, { useEffect, useState } from 'react';
import { X, Calendar, MessageSquare, Clock, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Paperclip } from 'lucide-react';
import { api } from '../../services/api.js';
import { getStoredRequests } from '../../services/expertRequestStorage.js';

interface RequestDetailModalProps {
  requestId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  requestId,
  onClose,
  onRefresh,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [requestId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getExpertRequestById(requestId);
      setData(res);
    } catch (err: any) {
      const local = getStoredRequests().find((r) => r.id === requestId);
      if (local) {
        setData({ request: local, messages: local.messages || [] });
      } else {
        setError(err.message || 'Failed to load request details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Pending Review</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Accepted</span>;
      case 'in_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">In Forensic Review</span>;
      case 'responded':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">Responded</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Closed</span>;
      case 'declined':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Declined</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl max-w-2xl w-full p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl my-8">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                {data?.request?.id || requestId}
              </span>
              {data?.request?.status && getStatusBadge(data.request.status)}
            </div>
            <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
              {data?.request?.subject || 'Request Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
            <span>Loading request case thread...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-red-500">
            {error}
          </div>
        ) : data?.request ? (
          <div className="mt-4 space-y-5">
            {/* Metadata Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Expert</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.request.expert_name || 'Expert Desk'}</span>
                <span className="text-[11px] text-slate-500 block truncate">{data.request.expert_organization}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{data.request.category}</span>
                <span className="text-[11px] text-slate-400 block">Lang: {data.request.preferred_language?.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Submitted</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {new Date(data.request.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Original Request Details */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Initial Inquiry:
              </span>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {data.request.description}
              </div>
              {data.request.attachment_url && (
                <div className="flex items-center gap-2 pt-1 text-xs text-[#14B8A6]">
                  <Paperclip className="w-3.5 h-3.5" />
                  <a
                    href={data.request.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>View Permitted Attachment</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Expert Official Response */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#14B8A6] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Expert Assessment & Findings:</span>
              </span>

              {data.request.response_text ? (
                <div className="p-4 rounded-2xl bg-[#14B8A6]/5 border border-[#14B8A6]/30 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#14B8A6] font-semibold pb-2 border-b border-[#14B8A6]/20">
                    <span>Verified Response from {data.request.expert_name || 'Desk Specialist'}</span>
                    {data.request.responded_at && (
                      <span className="text-slate-400 font-normal">
                        {new Date(data.request.responded_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {data.request.response_text}
                  </div>
                </div>
              ) : data.request.status === 'declined' ? (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  <div className="font-bold mb-1">Request Declined</div>
                  <p>{data.request.expert_notes || 'This request could not be fulfilled at this time due to jurisdiction or workload limits.'}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center py-6">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-slate-500">
                    Your request is currently {data.request.status === 'in_review' ? 'under forensic review' : 'awaiting specialist triage'}.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Once the specialist reviews your submission, their findings will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Message Thread History if multiple messages */}
            {data.messages && data.messages.length > 1 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Thread Activity ({data.messages.length} messages)
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {data.messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl text-xs ${
                        m.sender_role === 'expert'
                          ? 'bg-[#14B8A6]/10 border border-[#14B8A6]/20 ml-4'
                          : 'bg-slate-100 dark:bg-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {m.sender_name} ({m.sender_role})
                        </span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
