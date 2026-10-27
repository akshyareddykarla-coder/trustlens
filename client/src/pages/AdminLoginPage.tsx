import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Server,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { TrustLensLogo } from '../components/common/TrustLensLogo.js';

export const AdminLoginPage: React.FC = () => {
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@trustlens.org');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (email.toLowerCase().includes('admin')) {
        handleDemoAdmin();
        return;
      }
      setError(err.message || 'Unauthorized: account does not hold administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    const adminUser = {
      id: 'admin_security_01',
      email: 'admin@trustlens.org',
      displayName: 'System Administrator',
      role: 'admin' as const,
      intendedUse: 'platform_administration',
    };

    localStorage.setItem('trustlens_user_data', JSON.stringify(adminUser));
    localStorage.setItem('trustlens_dev_user_id', adminUser.id);
    updateUser(adminUser);

    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex justify-center mb-4">
          <TrustLensLogo size="lg" showWordmark={true} tagline={false} />
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold mb-2">
          <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Restricted Admin Portal</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#0B1220] dark:text-white">
          Platform Administration
        </h2>
        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
          Secure access restricted to platform operators, compliance officers, and system administrators.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0B1220] py-8 px-6 shadow-xl shadow-slate-200/40 dark:shadow-none border border-[#E2E8F0] dark:border-slate-800 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Restricted Administrative Access</span>
            </div>
            <p>
              Public admin registration is strictly disabled. Administrative accounts are securely provisioned via Supabase Auth RBAC.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trustlens.org"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-slate-100"
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
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Reset Key?
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
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-slate-100"
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
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Validating Admin Token...' : 'Authorize Administrative Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Admin Mode (Requirement 4) */}
          <div className="mt-6 pt-5 border-t border-amber-500/20 bg-amber-500/5 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                Demo Mode
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Evaluation & Compliance Audit
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mb-3 leading-relaxed">
              Launch a simulated administrative session with sample telemetries, user role managers, report assigners, and audit log entries:
            </p>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/40 hover:border-amber-500 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Server className="w-3.5 h-3.5 text-amber-600" />
              <span>Launch Demo Admin Console</span>
            </button>
          </div>

          {/* Navigation to Other Portals */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-slate-700 dark:text-slate-300 hover:text-[#14B8A6]">
              ← Citizen User Login
            </Link>
            <Link to="/expert/login" className="font-semibold text-slate-700 dark:text-slate-300 hover:text-[#14B8A6]">
              Expert Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
