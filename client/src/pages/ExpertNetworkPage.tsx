import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  Languages,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const ExpertNetworkPage: React.FC = () => {
  const { user } = useAuth();
  const [experts, setExperts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit request modal
  const [showModal, setShowModal] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [claimText, setClaimText] = useState('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const expRes = await api.getExperts();
      setExperts(expRes.experts || []);

      if (user) {
        const reqRes = await api.getExpertReviews();
        setRequests(reqRes.reviewRequests || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to request an expert verification review.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitExpertReview({
        claimText,
        justification,
        expertId: selectedExpertId || undefined,
      });
      setShowModal(false);
      setClaimText('');
      setJustification('');
      fetchData();
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
            <Award className="w-6 h-6 text-teal-600" />
            <span>Expert Verification Network</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with accredited digital forensics researchers, journalists, and vernacular linguists.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              alert('Please sign in to request an expert review.');
              return;
            }
            setShowModal(true);
          }}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Expert Review</span>
        </button>
      </div>

      {/* Directory Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Verified Specialists Directory
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading expert profiles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experts.map((exp) => (
              <div
                key={exp.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={exp.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={exp.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Reviewer</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {exp.full_name}
                  </h3>
                  <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                    {exp.expertise_area}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {exp.organization}
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {exp.bio}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Languages className="w-3.5 h-3.5 text-slate-400" />
                    <span>{(exp.languages_spoken || ['en']).join(', ').toUpperCase()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExpertId(exp.id);
                      setShowModal(true);
                    }}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Select for Review →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Requests Tracker */}
      {user && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Verification Review Queue ({requests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Tracking assigned specialist casework and conclusions
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active review cases lodged. Submit an inquiry using the button above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {requests.map((r) => (
                <div key={r.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Case #{r.id.slice(-6)} • {r.expert_name ? `Assigned: ${r.expert_name}` : 'Open Queue'}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                        r.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.status === 'in_review'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif italic">
                    "{r.claim_text}"
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Justification: {r.justification}
                  </p>

                  {r.verdict && (
                    <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200">
                      <strong>Expert Conclusion:</strong> {r.verdict}
                      {r.expert_notes && <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">{r.expert_notes}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal to Submit Review */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Submit Claim for Specialist Review
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Qualified reviewers assess factual evidence, technical details, and regional dialect context.
            </p>

            <form onSubmit={handleSubmitRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Specialist (Optional)
                </label>
                <select
                  value={selectedExpertId}
                  onChange={(e) => setSelectedExpertId(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Any Available Specialist</option>
                  {experts.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.expertise_area})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Claim Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="Paste the claim statement or news summary..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Justification / Context
                </label>
                <input
                  type="text"
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Viral in regional Telegram groups with conflicting dates"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
