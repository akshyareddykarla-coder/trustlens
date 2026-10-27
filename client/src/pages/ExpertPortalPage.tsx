import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
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
  Newspaper,
  Scale,
  Briefcase,
  Award,
  Layers,
  UploadCloud,
  Check,
  ChevronRight,
  Info,
  Calendar,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { DemoModeSwitcher } from '../components/experts/DemoModeSwitcher.js';
import {
  getStoredRequests,
  updateStoredRequest,
  saveStoredRequest,
  StoredExpertRequest,
} from '../services/expertRequestStorage.js';
import { DEFAULT_EXPERTS } from '../data/defaultExperts.js';

type ExpertTab = 'overview' | 'assigned' | 'review' | 'evidence' | 'responses' | 'profile';
export type ExpertSpecialty = 'journalist' | 'lawyer' | 'fact-checker' | 'researcher';

export const ExpertPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ExpertTab>('overview');

  // Active Expert Persona (Journalist, Lawyer, Fact-Checker, Researcher)
  const [expertRole, setExpertRole] = useState<ExpertSpecialty>(() => {
    const stored = localStorage.getItem('trustlens_dev_expert_role');
    if (stored === 'lawyer' || stored === 'fact-checker' || stored === 'researcher') {
      return stored;
    }
    return 'journalist';
  });

  const [requests, setRequests] = useState<StoredExpertRequest[]>(() => getStoredRequests(expertRole));
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Evidence Submission Form State
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidencePublisher, setEvidencePublisher] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceStance, setEvidenceStance] = useState<'contradicts' | 'supports' | 'unresolved'>('contradicts');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceSubmitting, setEvidenceSubmitting] = useState(false);

  // User Response State
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Sync persona and requests
  useEffect(() => {
    fetchRequests();
  }, [activeStatus, expertRole]);

  const fetchRequests = async () => {
    const local = getStoredRequests(expertRole);
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
      if (!selectedCaseId && finalReqs.length > 0) {
        setSelectedCaseId(finalReqs[0].id);
      }
    } catch {
      setRequests(activeStatus === 'all' ? local : local.filter((r) => r.status === activeStatus));
      if (!selectedCaseId && local.length > 0) {
        setSelectedCaseId(local[0].id);
      }
    }
  };

  const handleRoleSwitch = (newRole: ExpertSpecialty) => {
    setExpertRole(newRole);
    localStorage.setItem('trustlens_dev_expert_role', newRole);
    const roleToId: Record<string, string> = {
      journalist: 'demo-expert-journo',
      lawyer: 'demo-expert-lawyer',
      'fact-checker': 'demo-expert-factchecker',
      researcher: 'demo-expert-researcher',
    };
    localStorage.setItem('trustlens_dev_user_id', roleToId[newRole] || 'demo-expert-journo');
    setActionSuccess(`Switched active desk to ${newRole.toUpperCase()} verification workspace.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAction = async (requestId: string, action: string, extraBody: any = {}) => {
    updateStoredRequest(requestId, { action, ...extraBody });
    try {
      await api.updateExpertRequest(requestId, { action, ...extraBody });
    } catch {}
    setActionSuccess(`Case ${requestId} status updated: ${action.toUpperCase()}`);
    setTimeout(() => setActionSuccess(null), 3500);
    fetchRequests();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !replyText.trim()) return;

    setReplySubmitting(true);
    updateStoredRequest(selectedCaseId, {
      action: 'reply',
      responseText: replyText.trim(),
    });

    try {
      await api.updateExpertRequest(selectedCaseId, {
        action: 'reply',
        responseText: replyText.trim(),
      });
    } catch {}

    setActionSuccess(`Official response submitted to user for Case ${selectedCaseId}.`);
    setTimeout(() => setActionSuccess(null), 4000);
    setReplyText('');
    setReplySubmitting(false);
    fetchRequests();
  };

  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !evidenceTitle.trim() || !evidenceUrl.trim()) return;

    setEvidenceSubmitting(true);
    const existing = requests.find((r) => r.id === selectedCaseId);
    if (existing) {
      const updatedMessages = [
        ...(existing.messages || []),
        {
          id: `evi-${Date.now()}`,
          sender_type: 'expert' as const,
          sender_name: `${expertRole.toUpperCase()} Desk Analyst`,
          message_text: `[FORENSIC EVIDENCE ATTACHED]\nSource: ${evidenceTitle} (${evidencePublisher})\nURL: ${evidenceUrl}\nStance: ${evidenceStance.toUpperCase()}\nNotes: ${evidenceNotes}`,
          created_at: new Date().toISOString(),
        },
      ];
      updateStoredRequest(selectedCaseId, {
        messages: updatedMessages,
        status: 'in_review',
      });
    }

    setActionSuccess(`Evidence source "${evidenceTitle}" filed and linked to Case ${selectedCaseId}.`);
    setTimeout(() => setActionSuccess(null), 4000);
    setEvidenceTitle('');
    setEvidencePublisher('');
    setEvidenceUrl('');
    setEvidenceNotes('');
    setEvidenceSubmitting(false);
    fetchRequests();
  };

  const selectedCase = requests.find((r) => r.id === selectedCaseId) || requests[0];

  const expertDetails: Record<ExpertSpecialty, { title: string; org: string; icon: any; bio: string; desk: string }> = {
    journalist: {
      title: 'Senior Investigative Journalist',
      org: 'TrustLens Demonstration Verification Desk',
      icon: Newspaper,
      desk: 'News & Media Verification Desk',
      bio: 'Investigative reporting and media attribution triage, specialized in breaking news verification and synthesized editorial article detection.',
    },
    lawyer: {
      title: 'Senior Legal Guidance Specialist',
      org: 'TrustLens Cyber Law & Citizen Rights Advisory',
      icon: Scale,
      desk: 'Legal & Constitutional Rights Desk',
      bio: 'Constitutional law and cybercrime complaint filing (NCRP 1930), evidence preservation protocols, and intermediary liability compliance (IT Act 2021).',
    },
    'fact-checker': {
      title: 'Principal Verification Analyst',
      org: 'TrustLens Open Verification Network',
      icon: Briefcase,
      desk: 'Digital Forensics & Fact Desk',
      bio: 'Open-source claim cross-referencing against primary government archives, satellite telemetry, and visual metadata indices.',
    },
    researcher: {
      title: 'Disinformation Forensics Researcher',
      org: 'TrustLens Computational Forensics Lab',
      icon: Search,
      desk: 'OSINT & Disinformation Dynamics Desk',
      bio: 'Network analysis tracking coordinated viral inauthentic behavior, generative deepfakes, and algorithmic manipulation across message channels.',
    },
  };

  const currentExpertInfo = expertDetails[expertRole];
  const ActiveIcon = currentExpertInfo.icon;

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.subject?.toLowerCase().includes(q) ||
      r.user_name?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accredited Expert Workspace</span>
            </span>
            <span className="text-xs text-slate-400 capitalize">
              Role: <strong>{expertRole.replace('-', ' ')}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 flex items-center gap-2.5">
            <ActiveIcon className="w-7 h-7 text-[#14B8A6]" />
            <span>Expert Portal: {currentExpertInfo.desk}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            Triage citizen claims, examine digital forensic materials, submit evidence sources, and issue statutory responses.
          </p>
        </div>

        {/* Role Quick Switcher Pills for Demo Evaluation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl self-start md:self-auto overflow-x-auto">
          {(['journalist', 'lawyer', 'fact-checker', 'researcher'] as ExpertSpecialty[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                expertRole === r
                  ? 'bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 shadow-sm font-bold border border-teal-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {r.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Mandated Navigation Tabs (6 Mandatory Tabs) */}
      <div className="flex border-b border-[#E2E8F0] dark:border-slate-800 overflow-x-auto gap-1">
        {[
          { id: 'overview' as const, label: 'Overview', icon: Layers },
          { id: 'assigned' as const, label: 'Assigned Reports', icon: FileText, count: requests.filter((r) => r.status !== 'completed').length },
          { id: 'review' as const, label: 'Case Review', icon: Search },
          { id: 'evidence' as const, label: 'Evidence Submission', icon: UploadCloud },
          { id: 'responses' as const, label: 'Responses to Users', icon: MessageSquare },
          { id: 'profile' as const, label: 'Profile & Verification Status', icon: Award },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 px-3.5 sm:px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#14B8A6] text-[#14B8A6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#14B8A6] text-white">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Reports</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{requests.length}</div>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 block">Active queue cases</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Review</span>
              <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
                {requests.filter((r) => r.status === 'in_review').length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Forensic triage ongoing</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Resolved & Responded</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {requests.filter((r) => r.status === 'completed').length}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">Findings delivered to users</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Turnaround</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">&lt; 3.5 hrs</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Statutory standard SLA</span>
            </div>
          </div>

          {/* Active Desk Summary Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center flex-shrink-0 border border-[#14B8A6]/30">
                <ActiveIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {currentExpertInfo.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
                    Accredited
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{currentExpertInfo.org}</p>
                <p className="text-[11px] text-slate-500 mt-2 max-w-2xl leading-relaxed">{currentExpertInfo.bio}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('assigned')}
                className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Triage Assigned Queue
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED REPORTS */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case subject or user..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {['all', 'pending', 'in_review', 'completed', 'declined'].map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    activeStatus === st
                      ? 'bg-[#14B8A6] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-sm">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No reports found under the "{activeStatus}" filter.
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : req.status === 'in_review'
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          : req.status === 'declined'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {req.status?.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {req.subject}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Requester: <strong className="text-slate-600 dark:text-slate-300">{req.user_name}</strong></span>
                      <span>Category: <strong>{req.category}</strong></span>
                      <span>Lang: <strong className="uppercase">{req.preferred_language}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <button
                      onClick={() => {
                        setSelectedCaseId(req.id);
                        setActiveTab('review');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                    >
                      Examine Case
                    </button>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleAction(req.id, 'accept')}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                      >
                        Accept Case
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCaseId(req.id);
                        setActiveTab('responses');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CASE REVIEW */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Case Selector */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Case File ({requests.length})
            </h3>
            <div className="space-y-2 max-h-[550px] overflow-y-auto">
              {requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedCaseId(r.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                    selectedCaseId === r.id
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5 font-bold shadow-sm'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono">{r.id}</span>
                    <span className="capitalize">{r.status?.replace('_', ' ')}</span>
                  </div>
                  <div className="truncate text-slate-900 dark:text-slate-100">{r.subject}</div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">{r.user_name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Detailed Inspection Workspace */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm space-y-5">
            {selectedCase ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-mono text-xs text-slate-400 block font-bold">{selectedCase.id}</span>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedCase.subject}
                    </h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedCase.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {selectedCase.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Citizen Submission Text:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedCase.description}
                  </p>
                </div>

                {selectedCase.attachment_url && (
                  <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/20 space-y-2">
                    <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Forensic Media Attachment:</span>
                    </span>
                    <a
                      href={selectedCase.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-teal-600 hover:underline inline-flex items-center gap-1 font-mono break-all"
                    >
                      <span>{selectedCase.attachment_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Forensic Verification Checklist */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Analytical Checklist ({currentExpertInfo.title})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                      <span>Primary Source Cross-Verification</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                      <span>Media OCR & Header Timestamp Check</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                      <span>Reverse Search Imagery Corroboration</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                      <span>Statutory Advisory & Redressal Form</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Attach Evidence Source
                  </button>
                  <button
                    onClick={() => setActiveTab('responses')}
                    className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Draft Official Response
                  </button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">No case file selected.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EVIDENCE SUBMISSION */}
      {activeTab === 'evidence' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#14B8A6]" />
              <span>Submit Corroborating Forensic Evidence</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Link external verified sources, government gazette notifications, or OSINT archives to substantiate the case findings.
            </p>
          </div>

          <form onSubmit={handleEvidenceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Linked Case File *
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.subject.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Evidence Title / Gazette Notification Number *
              </label>
              <input
                type="text"
                required
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                placeholder="e.g. Election Commission Notification No. 464/INST/2024"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Publisher / Authority *
                </label>
                <input
                  type="text"
                  required
                  value={evidencePublisher}
                  onChange={(e) => setEvidencePublisher(e.target.value)}
                  placeholder="e.g. PIB Fact Check / Supreme Court"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Analytical Stance *
                </label>
                <select
                  value={evidenceStance}
                  onChange={(e: any) => setEvidenceStance(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="contradicts">Contradicts (Debunks Claim)</option>
                  <option value="supports">Supports (Corroborates Claim)</option>
                  <option value="unresolved">Unresolved (Contextual Background)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Direct Source Reference URL *
              </label>
              <input
                type="url"
                required
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://official-agency.gov.in/release/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Forensic Analysis & Verification Notes
              </label>
              <textarea
                rows={3}
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="Detail technical artifacts, reverse lookup matches, or statutory clauses verified..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={evidenceSubmitting}
              className="w-full py-2.5 px-4 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{evidenceSubmitting ? 'Filing Evidence...' : 'Submit Evidence File'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: RESPONSES TO USERS */}
      {activeTab === 'responses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Selection Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Inquiries ({requests.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedCaseId(r.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                    selectedCaseId === r.id
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5 font-bold shadow-sm'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{r.subject}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">User: {r.user_name}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] ${
                    r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Thread & Response Form */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedCase.subject}</h3>
                    <p className="text-[11px] text-slate-500">Replying to {selectedCase.user_name} ({selectedCase.user_email})</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{selectedCase.id}</span>
                </div>

                {/* Message Log Thread */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {(selectedCase.messages || []).map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs ${
                        m.sender_type === 'expert'
                          ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-500/20 text-teal-950 dark:text-teal-100 ml-4'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] text-slate-400 mb-1">
                        <span>{m.sender_name}</span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.message_text}</p>
                    </div>
                  ))}
                </div>

                {/* Response Drafting Input */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Issue Official Verification Assessment:
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setReplyText(
                            `[OFFICIAL FORENSIC ASSESSMENT - ${currentExpertInfo.org.toUpperCase()}]\n\nWe completed verification cross-referencing primary gazette indices and official databases.\nFINDING: The circulated item is confirmed as unsubstantiated/manipulated.\nRECOMMENDATION: File a complaint memo via National Cyber Crime Reporting Portal (1930) or intermediary grievance desk.`
                          )
                        }
                        className="text-[10px] font-semibold text-teal-600 hover:underline"
                      >
                        Insert Assessment Template
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Provide formal debunking assessment, technical evidence citations, or statutory guidance..."
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="submit"
                      disabled={replySubmitting}
                      className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>{replySubmitting ? 'Transmitting Response...' : 'Deliver Official Response'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">Select an active inquiry to respond.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: PROFILE AND VERIFICATION STATUS */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center font-bold text-xl border border-[#14B8A6]/20">
                <ActiveIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {user?.displayName || currentExpertInfo.title}
                </h3>
                <p className="text-xs text-slate-500">{currentExpertInfo.org}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Accreditation Active & Verified</span>
                </span>
              </div>
            </div>

            <span className="text-xs text-slate-400 capitalize font-mono">
              ID: {user?.id || 'exp-accredited-01'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Accredited Specialty Role:
              </span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 capitalize">
                {expertRole.replace('-', ' ')} ({currentExpertInfo.desk})
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Verified Credentials & Institutional Scope:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {currentExpertInfo.bio}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Supported Working Languages:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {['English (en)', 'Hindi (hi)', 'Telugu (te)', 'Bengali (bn)', 'Tamil (ta)'].map((l) => (
                  <span key={l} className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium text-[11px]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
