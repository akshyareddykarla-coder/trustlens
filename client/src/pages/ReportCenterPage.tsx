import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  FileText,
  Building,
  Building2,
  Award,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Calendar,
  Send,
  Flag,
  Languages,
  CheckCircle2,
  Scale,
  Newspaper,
  Briefcase,
  Clock,
  MessageSquare,
  Info,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { DemoModeSwitcher } from '../components/experts/DemoModeSwitcher.js';
import { RequestAssistanceModal } from '../components/experts/RequestAssistanceModal.js';
import { RequestDetailModal } from '../components/experts/RequestDetailModal.js';
import { DEFAULT_EXPERTS, DEFAULT_OFFICIAL_RESOURCES, ExpertProfile } from '../data/defaultExperts.js';
import { getStoredRequests } from '../services/expertRequestStorage.js';

export const ReportCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // 3 Mandated Tabs - initialized from searchParams or localStorage for refresh persistence
  const [activeTab, setActiveTab] = useState<'prepare' | 'official' | 'experts'>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'experts' || tabParam === 'official' || tabParam === 'prepare') {
      return tabParam;
    }
    const stored = localStorage.getItem('trustlens_report_tab');
    if (stored === 'experts' || stored === 'official' || stored === 'prepare') {
      return stored;
    }
    return 'prepare';
  });

  const handleTabChange = (tab: 'prepare' | 'official' | 'experts') => {
    setActiveTab(tab);
    localStorage.setItem('trustlens_report_tab', tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Pre-fill claim from searchParams if navigated from Analysis page
  const initialClaim = searchParams.get('claim') || '';

  // Tab 1: Prepare Report Form State
  const [category, setCategory] = useState('Online Impersonation');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialClaim);
  const [supportingLinks, setSupportingLinks] = useState('');
  const [jurisdiction, setJurisdiction] = useState('India (National / NCRP)');
  const [attachmentName, setAttachmentName] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Tab 2: Official Resources State
  const [resources, setResources] = useState<any[]>(() => DEFAULT_OFFICIAL_RESOURCES);
  const [resLoading, setResLoading] = useState(false);
  const [resCategory, setResCategory] = useState('all');
  const [resSearch, setResSearch] = useState('');

  // Tab 3: Expert Connect State - initialized with DEFAULT_EXPERTS for immediate rendering
  const [expertSubTab, setExpertSubTab] = useState<'directory' | 'my-requests'>('directory');
  const [expertCategory, setExpertCategory] = useState<string>('all');
  const [experts, setExperts] = useState<any[]>(() => DEFAULT_EXPERTS);
  const [expertLoading, setExpertLoading] = useState(false);
  const [expertSearch, setExpertSearch] = useState('');

  // Modals & User Requests
  const [requestModalExpert, setRequestModalExpert] = useState<any | null>(null);
  const [myRequests, setMyRequests] = useState<any[]>(() => getStoredRequests());
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [detailRequestId, setDetailRequestId] = useState<string | null>(null);
  const [requestSuccessBanner, setRequestSuccessBanner] = useState<string | null>(null);

  // Sync with searchParams (e.g. ?tab=experts&subtab=my-requests)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'experts' || tabParam === 'official' || tabParam === 'prepare') {
      setActiveTab(tabParam);
    }
    const subtabParam = searchParams.get('subtab');
    if (subtabParam === 'my-requests') {
      setExpertSubTab('my-requests');
    }
  }, [searchParams]);

  // Load Resources when Tab 2 active
  useEffect(() => {
    if (activeTab === 'official') {
      fetchResources();
    }
  }, [activeTab, resCategory]);

  // Load Experts when Tab 3 active
  useEffect(() => {
    if (activeTab === 'experts') {
      fetchExperts();
      fetchMyRequests();
    }
  }, [activeTab, expertCategory, expertSearch]);

  const getFallbackResources = () => {
    let fallback = [...DEFAULT_OFFICIAL_RESOURCES];
    if (resCategory !== 'all') {
      fallback = fallback.filter((r) => r.category === resCategory);
    }
    if (resSearch.trim()) {
      const q = resSearch.trim().toLowerCase();
      fallback = fallback.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.jurisdiction.toLowerCase().includes(q)
      );
    }
    return fallback;
  };

  const fetchResources = async () => {
    setResLoading(true);
    try {
      const params = new URLSearchParams();
      if (resCategory !== 'all') params.append('category', resCategory);
      if (resSearch.trim()) params.append('search', resSearch.trim());
      const data = await api.getResources(params.toString() ? `?${params.toString()}` : '');
      if (data?.resources && Array.isArray(data.resources) && data.resources.length > 0) {
        setResources(data.resources);
      } else {
        setResources(getFallbackResources());
      }
    } catch {
      setResources(getFallbackResources());
    } finally {
      setResLoading(false);
    }
  };

  const getFallbackExperts = () => {
    let list = [...DEFAULT_EXPERTS];
    if (expertCategory !== 'all') {
      list = list.filter((e) => e.category === expertCategory);
    }
    if (expertSearch.trim()) {
      const q = expertSearch.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.organization.toLowerCase().includes(q) ||
          e.expertise_area.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const fetchExperts = async () => {
    setExpertLoading(true);
    try {
      const params = new URLSearchParams();
      if (expertCategory !== 'all') params.append('category', expertCategory);
      if (expertSearch.trim()) params.append('search', expertSearch.trim());
      const data = await api.getExperts(params.toString() ? `?${params.toString()}` : '');
      if (data?.experts && Array.isArray(data.experts) && data.experts.length > 0) {
        setExperts(data.experts);
      } else {
        setExperts(getFallbackExperts());
      }
    } catch {
      setExperts(getFallbackExperts());
    } finally {
      setExpertLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    const local = getStoredRequests();
    try {
      const data = await api.getExpertRequests();
      const apiReqs = data?.requests || [];
      const combined = [...apiReqs];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id)) {
          combined.push(loc);
        }
      }
      setMyRequests(combined.length > 0 ? combined : local);
    } catch {
      setMyRequests(local);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Generate Formal Complaint Draft Text
  const generateDraftText = () => {
    return `FORMAL INCIDENT COMPLAINT MEMO
======================================================
Category: ${category}
Jurisdiction: ${jurisdiction}
Date of Incident: ${incidentDate}
Reporting Party: ${user?.displayName || 'Citizen Investigator'} (${user?.email || 'Authenticated User'})
Generated via: TrustLens Verification & Reporting Desk
Date Generated: ${new Date().toLocaleString()}

1. SUMMARY OF INCIDENT & MALICIOUS CONTENT:
${description || '[No description provided]'}

2. EVIDENCE & SUPPORTING URLS:
${supportingLinks || '[None specified]'}

3. ATTACHED DIGITAL FORENSIC MATERIALS:
${attachmentName ? `Attachment: ${attachmentName} (Extracted and hashed via TrustLens OCR)` : '[No direct media attachment attached]'}

4. APPLICABLE STATUTORY CITATIONS:
- BNS (Bharatiya Nyaya Sanhita) 2023 Section 353(2) / IT Act Section 66D (Cheating by personation using computer resource).
- Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021.

5. REQUESTED REMEDY / ACTION:
- Formal verification and investigative recording by relevant statutory cyber cell / intermediary grievance desk.
- Takedown or debunking notice of fraudulent representation to safeguard the general public.

DECLARATION:
The information submitted in this draft has been compiled in good faith for statutory redressal.
======================================================`;
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generateDraftText());
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleDownloadDraft = () => {
    const text = generateDraftText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TrustLens-Report-${incidentDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredExperts = experts.filter((exp) => {
    if (!expertSearch.trim()) return true;
    const q = expertSearch.toLowerCase();
    return (
      exp.full_name?.toLowerCase().includes(q) ||
      exp.expertise_area?.toLowerCase().includes(q) ||
      exp.organization?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Mission */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 flex items-center gap-2.5">
          <AlertOctagon className="w-7 h-7 text-[#14B8A6]" />
          <span>Report Center</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Combine complaint drafting, official cybercrime channel verification, and expert investigative review in one centralized hub.
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[#E2E8F0] dark:border-slate-800 gap-2">
        <button
          onClick={() => handleTabChange('prepare')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'prepare'
              ? 'border-[#14B8A6] text-[#14B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Prepare a Report</span>
        </button>

        <button
          onClick={() => handleTabChange('official')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'official'
              ? 'border-[#14B8A6] text-[#14B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>2. Official Resources</span>
        </button>

        <button
          onClick={() => handleTabChange('experts')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'experts'
              ? 'border-[#14B8A6] text-[#14B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>3. Expert Connect</span>
        </button>
      </div>

      {/* TAB 1: PREPARE A REPORT */}
      {activeTab === 'prepare' && (
        <div className="space-y-6">
          {/* Statutory Advice Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Official Disclaimer:</strong> TrustLens provides structured complaint drafting and verification assistance. TrustLens is not a statutory government law enforcement authority. You can export this formal draft to file complaints directly through verified portals (such as the National Cyber Crime Reporting Portal 1930).
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100 pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
                Incident & Complaint Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Report Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option>Online Impersonation</option>
                    <option>Scam Messages & Financial Fraud</option>
                    <option>Fraudulent Job / Vacancy Scheme</option>
                    <option>Harmful Misleading Content & Deepfakes</option>
                    <option>Cybercrime-Related Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Relevant Jurisdiction *
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option>India (National / NCRP Portal)</option>
                  <option>India (State Cyber Police)</option>
                  <option>Platform Grievance Officer (IT Rules 2021)</option>
                  <option>Financial Ombudsman (RBI / SEBI)</option>
                  <option>International / Cross-Border</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Description & Claim Text *
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident, exact wording of the fraudulent claim or impersonation, how it was received, and parties involved..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Links & Source References
                </label>
                <input
                  type="text"
                  value={supportingLinks}
                  onChange={(e) => setSupportingLinks(e.target.value)}
                  placeholder="Paste URLs to the fraudulent page, tweet, or WhatsApp web link..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Evidence Attachment (File Name or Reference)
                </label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. screenshot-fake-admit-card.png"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Choose Next Action: 3 Options from Flowchart */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Choose Next Action:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadDraft}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#14B8A6] text-left transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Download PDF</div>
                      <div className="text-[10px] text-slate-400">Save report memo file</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('official')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#14B8A6] text-left transition-colors flex items-center gap-2"
                  >
                    <Building className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Official Portals</div>
                      <div className="text-[10px] text-slate-400">NCRP 1930 / PIB desk</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('experts')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#14B8A6] text-left transition-colors flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Find Expert Guidance</div>
                      <div className="text-[10px] text-slate-400">Consult forensics network</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Review Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied to Clipboard' : 'Copy Draft'}</span>
                </button>
              </div>
            </div>

            {/* Live Draft Preview Panel */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0B1220] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Draft Preview
                  </h3>
                  <span className="text-[10px] font-semibold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full">
                    Auto-Formatted Memo
                  </span>
                </div>

                <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generateDraftText()}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Tip: Copy this structured memo when registering a complaint on cybercrime.gov.in or emailing the platform grievance officer.
              </div>
            </div>
          </div>

          {/* Review Draft Modal */}
          {showReviewModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0B1220] rounded-3xl max-w-2xl w-full p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Formal Complaint Review
                  </h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="flex-1 my-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto whitespace-pre-wrap">
                  {generateDraftText()}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleCopyDraft}
                    className="px-4 py-2 bg-[#14B8A6] text-white rounded-xl text-xs font-bold hover:bg-[#0D9488]"
                  >
                    Copy Memo
                  </button>
                  <button
                    onClick={handleDownloadDraft}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Download .txt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OFFICIAL RESOURCES */}
      {activeTab === 'official' && (
        <div className="space-y-6">
          {/* Statutory Links Safety Reminder */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 flex items-center gap-3">
            <Scale className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <strong>Verified Statutory Portals:</strong> These links navigate directly to accredited government and regulatory channels. Always verify domain extensions (.gov.in, .nic.in).
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchResources();
              }}
              className="w-full sm:w-80 relative"
            >
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
                placeholder="Search agency, toll-free number..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </form>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'All Portals' },
                { id: 'cybercrime', label: 'Cyber Fraud & NCRP' },
                { id: 'government', label: 'Government & Elections' },
                { id: 'social_media', label: 'Platform Grievances' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setResCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    resCategory === c.id
                      ? 'bg-[#14B8A6] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resLoading ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">Loading statutory resources...</div>
            ) : resources.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">No resources found matching filter.</div>
            ) : (
              resources.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-[#14B8A6]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-bold uppercase text-[#14B8A6] tracking-wider">
                        {res.category.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-mono">{res.jurisdiction}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {res.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {res.description}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Handling Process:</strong> {res.handling_process}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Verified: {res.verified_date}
                    </span>
                    <a
                      href={res.official_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 text-[#14B8A6] font-bold text-xs transition-colors"
                    >
                      <span>Open Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXPERT CONNECT */}
      {activeTab === 'experts' && (
        <div className="space-y-6">
          {/* Demonstration Mode Notice & Role Switcher */}
          <DemoModeSwitcher onPersonaChange={() => { fetchMyRequests(); }} />

          {/* Subnavigation: Directory vs My Requests */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
              <button
                onClick={() => setExpertSubTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  expertSubTab === 'directory'
                    ? 'bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Expert Directory</span>
              </button>

              <button
                onClick={() => {
                  setExpertSubTab('my-requests');
                  fetchMyRequests();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  expertSubTab === 'my-requests'
                    ? 'bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>My Requests</span>
                {myRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#14B8A6] text-white">
                    {myRequests.length}
                  </span>
                )}
              </button>
            </div>

            {requestSuccessBanner && (
              <div className="text-xs px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{requestSuccessBanner}</span>
              </div>
            )}
          </div>

          {/* SUBTAB 1: DIRECTORY */}
          {expertSubTab === 'directory' && (
            <div className="space-y-6">
              {/* Category Filter Pills & Search Bar */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {[
                      { id: 'all', label: 'All Experts' },
                      { id: 'journalists', label: 'Journalists' },
                      { id: 'fact_checkers', label: 'Fact-Checkers' },
                      { id: 'legal_professionals', label: 'Legal Professionals' },
                      { id: 'organizations', label: 'Organizations' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setExpertCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          expertCategory === cat.id
                            ? 'bg-[#14B8A6] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="w-full md:w-80 relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={expertSearch}
                      onChange={(e) => setExpertSearch(e.target.value)}
                      placeholder="Search by name, organization, or specialty..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    Showing {filteredExperts.length} accredited investigative & legal profiles
                  </span>
                  <span>
                    Official verified public sources & demonstration desks
                  </span>
                </div>
              </div>

              {/* Expert Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expertLoading ? (
                  <div className="col-span-3 py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <div className="w-7 h-7 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
                    <span>Loading directory profiles...</span>
                  </div>
                ) : filteredExperts.length === 0 ? (
                  <div className="col-span-3 py-16 text-center text-xs text-slate-400 bg-white dark:bg-[#0B1220] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No experts found</p>
                    <p className="mt-1">Try selecting "All Experts" or adjusting your search terms.</p>
                  </div>
                ) : (
                  filteredExperts.map((exp) => {
                    // Determine category icon
                    let CategoryIcon = UserCheck;
                    if (exp.category === 'journalists') CategoryIcon = Newspaper;
                    else if (exp.category === 'fact_checkers') CategoryIcon = ShieldCheck;
                    else if (exp.category === 'legal_professionals') CategoryIcon = Scale;
                    else if (exp.category === 'organizations') CategoryIcon = Building2;

                    const officialLink = exp.official_reference_url || exp.reference_url || '#';

                    return (
                      <div
                        key={exp.id}
                        className="p-6 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-[#14B8A6]/40 transition-all"
                      >
                        <div>
                          {/* Card Top: Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            {exp.is_public_reference ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                PUBLIC REFERENCE
                              </span>
                            ) : exp.is_demo_expert ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                DEMO EXPERT
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                PARTICIPATING EXPERT
                              </span>
                            )}

                            <span className="text-[10px] font-semibold text-slate-400 capitalize">
                              {exp.category?.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Profile Header */}
                          <div className="flex items-start gap-3.5 mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#14B8A6] flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                              <CategoryIcon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {exp.full_name}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
                                {exp.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-500 truncate">
                                {exp.organization}
                              </p>
                            </div>
                          </div>

                          {/* Specialization tag */}
                          <div className="mb-3">
                            <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#14B8A6]/10 text-[#14B8A6]">
                              {exp.expertise_area}
                            </span>
                          </div>

                          {/* Bio */}
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {exp.bio}
                          </p>

                          {/* Transparency notice for public references */}
                          {exp.is_public_reference && (
                            <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic">
                              Documented public profile. Not a TrustLens partner.
                            </p>
                          )}
                        </div>

                        {/* Card Action */}
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                          {exp.is_public_reference || !exp.can_receive_requests ? (
                            <a
                              href={officialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                            >
                              <span>View Official Profile</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </a>
                          ) : (
                            <button
                              onClick={() => setRequestModalExpert(exp)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-sm transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Request Assistance</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 2: MY REQUESTS */}
          {expertSubTab === 'my-requests' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    My Verification Requests
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track submitted inquiries, review statuses, and read expert findings.
                  </p>
                </div>
                <button
                  onClick={fetchMyRequests}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Refresh
                </button>
              </div>

              {requestsLoading ? (
                <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-7 h-7 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
                  <span>Loading your submitted requests...</span>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-[#0B1220] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      No requests submitted yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      You can request assistance from any of our participating demo desks (Journalist, Fact-Checker, or Lawyer) in the Expert Directory.
                    </p>
                  </div>
                  <button
                    onClick={() => setExpertSubTab('directory')}
                    className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Open Expert Directory
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                      accepted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                      in_review: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                      responded: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
                      closed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                      declined: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                    };

                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#14B8A6]/40 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#14B8A6]">
                              {req.id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                statusColors[req.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {req.status?.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              • Submitted on {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {req.subject}
                          </h4>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>Assigned Desk: <strong className="text-slate-700 dark:text-slate-300">{req.expert_name || 'Desk Specialist'}</strong></span>
                            {req.expert_organization && <span>({req.expert_organization})</span>}
                          </div>

                          {/* Response snippet */}
                          {req.response_text ? (
                            <div className="mt-2 p-2.5 rounded-xl bg-[#14B8A6]/5 border border-[#14B8A6]/20 text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-[#14B8A6] mr-1.5">Expert Response:</span>
                              <span className="line-clamp-2">{req.response_text}</span>
                            </div>
                          ) : req.status === 'declined' ? (
                            <div className="mt-2 p-2 rounded-xl bg-red-500/5 text-xs text-red-600 dark:text-red-400">
                              Declined: {req.expert_notes || 'Request could not be accommodated.'}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">
                              Awaiting review by specialist desk.
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                          <button
                            onClick={() => setDetailRequestId(req.id)}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                          >
                            View Case Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Request Assistance Modal */}
          {requestModalExpert && (
            <RequestAssistanceModal
              expert={requestModalExpert}
              initialClaim={description}
              onClose={() => setRequestModalExpert(null)}
              onSuccess={(created) => {
                setRequestModalExpert(null);
                setRequestSuccessBanner(`Assistance request ${created?.id || ''} submitted successfully!`);
                setExpertSubTab('my-requests');
                fetchMyRequests();
              }}
            />
          )}

          {/* Request Detail / Case Thread Modal */}
          {detailRequestId && (
            <RequestDetailModal
              requestId={detailRequestId}
              onClose={() => setDetailRequestId(null)}
              onRefresh={fetchMyRequests}
            />
          )}
        </div>
      )}
    </div>
  );
};
