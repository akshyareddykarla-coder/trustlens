import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

interface RiskBadgeProps {
  level: 'lower_risk' | 'needs_verification' | 'elevated_risk' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const { t } = useLanguage();

  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    lower_risk: {
      label: t('lowerRisk'),
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck,
    },
    needs_verification: {
      label: t('needsVerification'),
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: AlertCircle,
    },
    elevated_risk: {
      label: t('elevatedRisk'),
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: AlertTriangle,
    },
  };

  const current = configs[level] || configs.needs_verification;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm font-medium',
    lg: 'px-3.5 py-1.5 text-base font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      <span>{current.label}</span>
    </span>
  );
};
