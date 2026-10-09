import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  History,
  Bot,
  Users,
  Award,
  AlertOctagon,
  Scale,
  GraduationCap,
  BarChart3,
  Settings,
  ShieldCheck,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', label: t('home'), icon: LayoutDashboard },
    { to: '/verify', label: t('verifyNews'), icon: FileCheck2 },
    { to: '/history', label: t('history'), icon: History },
    { to: '/assistant', label: t('assistant'), icon: Bot },
    { to: '/community', label: t('community'), icon: Users },
    { to: '/experts', label: t('experts'), icon: Award },
    { to: '/report-center', label: t('reportCenter'), icon: AlertOctagon },
    { to: '/legal-rights', label: 'Law & Rights', icon: Scale },
    { to: '/education', label: t('education'), icon: GraduationCap },
    { to: '/analytics', label: t('analytics'), icon: BarChart3 },
    { to: '/settings', label: t('settings'), icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: t('admin'), icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span>TrustLens</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  Core
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">News Verification Platform</div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Security & Registry Status footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">SSRF Guard & OCR Ready</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Human-in-the-loop verification
          </div>
        </div>
      </aside>
    </>
  );
};
