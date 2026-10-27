import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCheck, ShieldAlert, ArrowRight, Sparkles, Briefcase, Scale, Newspaper } from 'lucide-react';

export type DemoPersona = 'user' | 'journalist' | 'lawyer' | 'fact-checker';

interface DemoModeSwitcherProps {
  onPersonaChange?: (persona: DemoPersona) => void;
  className?: string;
}

export const DemoModeSwitcher: React.FC<DemoModeSwitcherProps> = ({ onPersonaChange, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';

  const [activePersona, setActivePersona] = useState<DemoPersona>(() => {
    const stored = localStorage.getItem('trustlens_dev_expert_role');
    if (stored === 'journalist') return 'journalist';
    if (stored === 'lawyer') return 'lawyer';
    if (stored === 'fact-checker') return 'fact-checker';
    return 'user';
  });

  useEffect(() => {
    const stored = localStorage.getItem('trustlens_dev_expert_role');
    if (stored === 'journalist') setActivePersona('journalist');
    else if (stored === 'lawyer') setActivePersona('lawyer');
    else if (stored === 'fact-checker') setActivePersona('fact-checker');
    else setActivePersona('user');
  }, [location.pathname]);

  const handleSelect = (persona: DemoPersona) => {
    setActivePersona(persona);
    if (persona === 'user') {
      localStorage.removeItem('trustlens_dev_expert_role');
      localStorage.setItem('trustlens_dev_user_id', 'demo_user_01');
    } else {
      localStorage.setItem('trustlens_dev_expert_role', persona);
      const roleToId: Record<string, string> = {
        journalist: 'demo-expert-journo',
        lawyer: 'demo-expert-lawyer',
        'fact-checker': 'demo-expert-factchecker',
      };
      localStorage.setItem('trustlens_dev_user_id', roleToId[persona] || 'demo_user_01');
    }

    if (onPersonaChange) {
      onPersonaChange(persona);
    }
  };

  const [demoActive, setDemoActive] = useState<boolean>(() => {
    const stored = localStorage.getItem('trustlens_demo_mode_active');
    return stored !== null ? stored === 'true' : true;
  });

  const toggleDemoMode = (enabled: boolean) => {
    setDemoActive(enabled);
    localStorage.setItem('trustlens_demo_mode_active', String(enabled));
  };

  // If demo mode is switched off, show clean transparency directory badge with option to enable
  if (!demoActive) {
    return (
      <div className={`p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${className}`}>
        <div className="space-y-0.5">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Public Verification & Professional Directory
          </span>
          <p className="text-[11px] text-slate-500">
            Public references are documented solely for transparency. Requests reach accredited enrolled experts.
          </p>
        </div>
        <button
          onClick={() => toggleDemoMode(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors flex-shrink-0"
        >
          Enable Demo Simulator
        </button>
      </div>
    );
  }

  const personas = [
    { id: 'user' as const, label: 'Demo User', role: 'Citizen Requester', icon: Sparkles },
    { id: 'journalist' as const, label: 'Demo Journalist', role: 'News & Media Desk', icon: Newspaper },
    { id: 'lawyer' as const, label: 'Demo Lawyer', role: 'Legal & Rights Desk', icon: Scale },
    { id: 'fact-checker' as const, label: 'Demo Fact-Checker', role: 'Forensics & Fact Desk', icon: Briefcase },
  ];

  return (
    <div className={`p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-slate-950">
              Demo Mode Active
            </span>
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Local Verification Sandbox (Development Mode)
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
            Public reference professionals are documented for transparency and do not accept direct requests. Use the demonstration roles below to test request submission, expert triage, and message replies.
          </p>
        </div>

        {/* Quick Nav shortcut */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {activePersona !== 'user' ? (
            <button
              onClick={() => navigate('/expert')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              <span>Open Expert Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/report-center')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors"
            >
              <span>Report Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Role Switcher Pills */}
      <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-amber-900/70 dark:text-amber-300/70 mr-1">
          Simulate Role:
        </span>
        {personas.map((p) => {
          const Icon = p.icon;
          const isSelected = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-sm font-bold ring-2 ring-amber-400'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-amber-500/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
              <span className={`text-[10px] hidden sm:inline ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                ({p.role})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
