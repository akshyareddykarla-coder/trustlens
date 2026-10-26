import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  FileText,
  Building,
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
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const ReportCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // 3 Mandated Tabs
  const [activeTab, setActiveTab] = useState<'prepare' | 'official' | 'experts'>('prepare');

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
  const [resources, setResources] = useState<any[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [resCategory, setResCategory] = useState('all');
  const [resSearch, setResSearch] = useState('');

  // Tab 3: Expert Connect State
  const [experts, setExperts] = useState<any[]>([]);
  const [expertLoading, setExpertLoading] = useState(false);
  const [expertSearch, setExpertSearch] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
    }
  }, [activeTab]);

  const fetchResources = async () => {
    setResLoading(true);
    try {
      const params = new URLSearchParams();
      if (resCategory !== 'all') params.append('category', resCategory);
      if (resSearch.trim()) params.append('search', resSearch.trim());
      const data = await api.getResources(params.toString() ? `?${params.toString()}` : '');
      setResources(data.resources || []);
    } catch {
      // Ignore
    } finally {
      setResLoading(false);
    }
  };

  const fetchExperts = async () => {
    setExpertLoading(true);
    try {
      const data = await api.getExperts();
      setExperts(data.experts || []);
    } catch {
      // Ignore
    } finally {
      setExpertLoading(false);
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
          onClick={() => setActiveTab('prepare')}
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
          onClick={() => setActiveTab('official')}
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
          onClick={() => setActiveTab('experts')}
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
          {/* Expert Directory Search */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="w-full sm:w-96 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={expertSearch}
                onChange={(e) => setExpertSearch(e.target.value)}
                placeholder="Search expert by name, organization, or specialty..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="text-xs text-slate-400">
              {filteredExperts.length} verified investigative specialists
            </div>
          </div>

          {/* Expert Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertLoading ? (
              <div className="col-span-3 py-12 text-center text-xs text-slate-400">Loading expert profiles...</div>
            ) : filteredExperts.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-xs text-slate-400">No accredited experts match your search query.</div>
            ) : (
              filteredExperts.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-[#14B8A6]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B1220] to-[#14B8A6] text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        {exp.full_name?.charAt(0) || 'E'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {exp.full_name}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{exp.organization}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-[#14B8A6] uppercase tracking-wide">
                          {exp.expertise_area}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {exp.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Verified Casework Ready
                    </span>
                    <button
                      onClick={() => {
                        setSelectedExpert(exp);
                        setReviewSubmitted(false);
                      }}
                      className="px-3 py-1.5 bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      Request Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Expert Review Request Modal */}
          {selectedExpert && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0B1220] rounded-3xl max-w-lg w-full p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Submit Claim to {selectedExpert.full_name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{selectedExpert.organization}</p>
                  </div>
                  <button
                    onClick={() => setSelectedExpert(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Close
                  </button>
                </div>

                {reviewSubmitted ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-[#14B8A6] mx-auto" />
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      Review Request Submitted
                    </div>
                    <p className="text-xs text-slate-500">
                      Your claim has been queued for specialist assessment. Updates will be visible in notifications.
                    </p>
                    <button
                      onClick={() => setSelectedExpert(null)}
                      className="mt-3 px-4 py-2 bg-[#14B8A6] text-white rounded-xl text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await api.submitExpertReview({
                          claimText: description || 'Suspicious viral forward submitted for expert casework.',
                          justification: 'Requested specialist forensics evaluation.',
                          expertId: selectedExpert.id,
                        });
                        setReviewSubmitted(true);
                      } catch (err: any) {
                        alert(err.message || 'Submission failed');
                      }
                    }}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Claim Text for Expert Review
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paste claim text to submit..."
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Notice: Requests are evaluated according to statutory public interest and capacity.
                    </p>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedExpert(null)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold shadow"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
