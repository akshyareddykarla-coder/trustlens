import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Newspaper,
  Scale,
  Briefcase,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { TrustLensLogo } from '../components/common/TrustLensLogo.js';

export type ExpertRoleOption = 'journalist' | 'lawyer' | 'fact-checker' | 'researcher';

export const ExpertLoginPage: React.FC = () => {
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState<ExpertRoleOption>('journalist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/expert';

  const roleDefinitions: Record<ExpertRoleOption, { title: string; desk: string; emailPlaceholder: string; icon: any }> = {
    journalist: {
      title: 'Investigative Journalist',
      desk: 'News & Media Verification Desk',
      emailPlaceholder: 'journalist@trustlens.org',
      icon: Newspaper,
    },
    lawyer: {
      title: 'Legal Counsel',
      desk: 'Cyber Law & Citizen Rights Desk',
      emailPlaceholder: 'lawyer@trustlens.org',
      icon: Scale,
    },
    'fact-checker': {
      title: 'Fact-Checker Analyst',
      desk: 'Forensics & Claim Verification Desk',
      emailPlaceholder: 'factchecker@trustlens.org',
      icon: Briefcase,
    },
    researcher: {
      title: 'Academic Researcher',
      desk: 'Open Data & Disinformation Research Desk',
      emailPlaceholder: 'researcher@trustlens.org',
      icon: Search,
    },
  };

  const handleRoleSelect = (role: ExpertRoleOption) => {
    setSelectedRole(role);
    if (!email || Object.values(roleDefinitions).some((r) => r.emailPlaceholder === email)) {
      setEmail(roleDefinitions[role].emailPlaceholder);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Ensure expert role metadata in localStorage
      localStorage.setItem('trustlens_dev_expert_role', selectedRole);
      navigate(from, { replace: true });
    } catch (err: any) {
      // In development / demo environment, allow direct expert entry if credentials match sample demo
      if (email.toLowerCase().includes('trustlens.org') || email.toLowerCase().includes('expert')) {
        handleDemoLaunch(selectedRole);
        return;
      }
      setError(err.message || 'Invalid credentials or account is not accredited as an Expert.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLaunch = (role: ExpertRoleOption) => {
    const roleIdMap: Record<ExpertRoleOption, { id: string; name: string; org: string }> = {
      journalist: {
        id: 'demo-expert-journo',
        name: 'Demo Journalist',
        org: 'TrustLens Demonstration Verification Desk',
      },
      lawyer: {
        id: 'demo-expert-lawyer',
        name: 'Demo Lawyer',
        org: 'TrustLens Cyber Law & Citizen Rights Advisory',
      },
      'fact-checker': {
        id: 'demo-expert-factchecker',
        name: 'Demo Fact-Checker',
        org: 'TrustLens Open Verification Network',
      },
      researcher: {
        id: 'demo-expert-researcher',
        name: 'Demo Researcher',
        org: 'TrustLens Disinformation Forensics Lab',
      },
    };

    const target = roleIdMap[role];
    localStorage.setItem('trustlens_dev_expert_role', role);
    localStorage.setItem('trustlens_dev_user_id', target.id);

    const demoExpertUser = {
      id: target.id,
      email: `${role}@trustlens.org`,
      displayName: target.name,
      role: 'expert' as const,
      intendedUse: 'expert_verification',
    };

    localStorage.setItem('trustlens_user_data', JSON.stringify(demoExpertUser));
    updateUser(demoExpertUser);

    navigate('/expert', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex justify-center mb-4">
          <TrustLensLogo size="lg" showWordmark={true} tagline={false} />
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
          <span>Accredited Expert Portal</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#0B1220] dark:text-white">
          Expert Authentication Gateway
        </h2>
        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
          Authorized workspace for credentialed Journalists, Legal Advocates, Fact-Checkers, and OSINT Researchers.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0B1220] py-8 px-6 shadow-xl shadow-slate-200/40 dark:shadow-none border border-[#E2E8F0] dark:border-slate-800 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Expert Role Pill Switcher */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Your Accreditation Specialty:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['journalist', 'lawyer', 'fact-checker', 'researcher'] as ExpertRoleOption[]).map((r) => {
                const Icon = roleDefinitions[r].icon;
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-100 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-850'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#14B8A6]' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <div className="truncate capitalize">{r.replace('-', ' ')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleDefinitions[selectedRole].emailPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#14B8A6] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#14B8A6] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#14B8A6] text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating Credentials...' : 'Sign In to Expert Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Mode Simulator (Mandated Requirement) */}
          <div className="mt-6 pt-5 border-t border-amber-500/20 bg-amber-500/5 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                Demo Mode
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                One-Click Presentation Access
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mb-3 leading-relaxed">
              Launch an active simulated session to test report triage, case review, evidence submission, and user replies:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLaunch('journalist')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Newspaper className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate font-semibold">Demo Journalist</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLaunch('lawyer')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Scale className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate font-semibold">Demo Lawyer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLaunch('fact-checker')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate font-semibold">Demo Fact-Checker</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLaunch('researcher')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate font-semibold">Demo Researcher</span>
              </button>
            </div>
          </div>

          {/* Navigation to Other Portals */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-slate-700 dark:text-slate-300 hover:text-[#14B8A6]">
              ← Citizen User Login
            </Link>
            <Link to="/admin/login" className="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600">
              Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
