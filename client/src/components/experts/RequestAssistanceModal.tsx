import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Paperclip, Shield, CheckSquare, Square } from 'lucide-react';
import { api } from '../../services/api.js';

interface ExpertProfile {
  id: string;
  full_name: string;
  title: string;
  organization: string;
  category: string;
  expertise_area: string;
  is_demo_expert?: boolean;
}

interface RequestAssistanceModalProps {
  expert: ExpertProfile;
  initialClaim?: string;
  onClose: () => void;
  onSuccess: (request: any) => void;
}

export const RequestAssistanceModal: React.FC<RequestAssistanceModalProps> = ({
  expert,
  initialClaim = '',
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState('Misinformation Verification');
  const [subject, setSubject] = useState(
    initialClaim ? `Forensic Review: ${initialClaim.slice(0, 50)}...` : ''
  );
  const [description, setDescription] = useState(initialClaim || '');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('Please provide a subject line for your request.');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please provide at least 10 characters describing the incident or claim.');
      return;
    }

    if (!consentGiven) {
      setError('You must accept the verification consent checkbox before submitting.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createExpertRequest({
        expertId: expert.id,
        category,
        subject: subject.trim(),
        description: description.trim(),
        preferredLanguage,
        attachmentUrl: attachmentUrl.trim() || null,
      });

      onSuccess(response.request || response.data || response);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिंदी)' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
    { code: 'mr', label: 'Marathi (मराठी)' },
    { code: 'bn', label: 'Bengali (বাংলা)' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', label: 'Malayalam (മലയാളം)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1220] rounded-3xl max-w-xl w-full p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/30">
                Assistance Request
              </span>
              {expert.is_demo_expert && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Demo Expert Desk
                </span>
              )}
            </div>
            <h2 className="mt-1.5 text-base font-bold text-slate-900 dark:text-slate-100">
              Request Assistance from {expert.full_name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {expert.title} • {expert.organization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Selected Expert Summary Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Assigned Desk
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {expert.full_name}
              </div>
              <div className="text-[11px] text-[#14B8A6] font-medium">
                {expert.expertise_area}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {expert.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Category & Preferred Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Request Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
              >
                <option value="Misinformation Verification">Misinformation Verification</option>
                <option value="Online Claim & Evidence Review">Online Claim & Evidence Review</option>
                <option value="Legal Guidance & Reporting Procedures">Legal Guidance & Reporting Procedures</option>
                <option value="Digital Identity / Impersonation">Digital Identity / Impersonation</option>
                <option value="General Inquiry">General Verification Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Verify circulating viral claim regarding regulatory policy"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Claim Context <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact quotes, context, dates, source platforms, and specific questions for the specialist..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 10 characters</span>
              <span>{description.length} characters</span>
            </div>
          </div>

          {/* Optional Attachment Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Optional Evidence Attachment / Source URL
            </label>
            <div className="relative">
              <Paperclip className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://example.com/evidence-screenshot.png or cloud drive link"
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#14B8A6]"
              />
            </div>
          </div>

          {/* User Consent Checkbox */}
          <div
            onClick={() => setConsentGiven(!consentGiven)}
            className="flex items-start gap-2.5 p-3 rounded-2xl bg-teal-500/5 border border-teal-500/20 cursor-pointer select-none"
          >
            <button
              type="button"
              className="mt-0.5 text-[#14B8A6] flex-shrink-0"
            >
              {consentGiven ? (
                <CheckSquare className="w-4 h-4 fill-[#14B8A6] text-white" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              I understand this request is for verification and guidance purposes. I confirm that this submission is made in good faith and does not contain prohibited content.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
