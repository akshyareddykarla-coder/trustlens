import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

export const OnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [intendedUse, setIntendedUse] = useState(user?.intendedUse || 'personal_verification');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'personal_verification', title: 'Personal Verification', desc: 'Verify viral forwards and online news for daily awareness.' },
    { id: 'journalism', title: 'Investigative Journalism', desc: 'Trace source attribution and cross-reference fact-checking archives.' },
    { id: 'academic_research', title: 'Academic Research', desc: 'Study linguistic patterns and regional misinformation propagation.' },
    { id: 'community_moderation', title: 'Community Moderation', desc: 'Help evaluate disputed claims and maintain community integrity.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.onboarding({
        displayName,
        preferredLanguage,
        intendedUse,
      });
      updateUser({ displayName, preferredLanguage, intendedUse });
      setLanguage(preferredLanguage as any);
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Welcome to TrustLens
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Personalize your verification experience
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          We only collect preferences to tailor your language and analysis tools.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Primary Language for Verification
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { code: 'en', label: 'English', sub: 'Default' },
                { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
                { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setPreferredLanguage(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preferredLanguage === lang.code
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-600/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm">{lang.label}</div>
                  <div className="text-[10px] text-slate-500">{lang.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              How do you plan to use TrustLens?
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setIntendedUse(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    intendedUse === r.id
                      ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 ring-1 ring-teal-600/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{r.title}</div>
                    <div className="text-[11px] text-slate-500">{r.desc}</div>
                  </div>
                  {intendedUse === r.id && <Check className="w-4 h-4 text-teal-600 flex-shrink-0 ml-2" />}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Saving...' : 'Continue to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
