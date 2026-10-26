import React from 'react';
import { Link } from 'react-router-dom';
import { TrustLensLogo } from '../common/TrustLensLogo.js';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#0B1220] border-t border-[#E2E8F0] dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <TrustLensLogo size="md" showWordmark={true} tagline={false} />
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] mt-2">
              TrustLens is an AI-powered misinformation analysis, fact-checking, and community verification platform helping citizens investigate suspicious claims and understand supporting evidence.
            </p>
            <div className="text-[10px] text-slate-400 font-medium">
              Verify Before You Trust.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/verify" className="hover:text-[#14B8A6] transition-colors">
                  Verify Content
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#14B8A6] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-[#14B8A6] transition-colors">
                  Community Deliberation
                </Link>
              </li>
              <li>
                <Link to="/report-center" className="hover:text-[#14B8A6] transition-colors">
                  Report Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/settings" className="hover:text-[#14B8A6] transition-colors">
                  Privacy Policy & Data Rights
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-[#14B8A6] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/report-center" className="hover:text-[#14B8A6] transition-colors">
                  Official Statutory Channels
                </Link>
              </li>
              <li>
                <a
                  href="mailto:inquiries@trustlens.org"
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Contact: inquiries@trustlens.org
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Languages & Scope */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-3">
              Platform Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-500 dark:text-slate-400">
                Linguistic Detection: English • తెలుగు • हिन्दी
              </li>
              <li className="text-slate-500 dark:text-slate-400">
                SSRF-Guarded Web Content Retrieval
              </li>
              <li className="text-slate-500 dark:text-slate-400">
                Deterministic Limitations & Uncertainty Ratings
              </li>
              <li className="text-slate-500 dark:text-slate-400">
                DPDP & GDPR Compliant Data Control
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} TrustLens. All rights reserved.</p>
          <p className="text-slate-400 text-center sm:text-right">
            Notice: Automated assessments assist human verification and do not substitute official confirmation.
          </p>
        </div>
      </div>
    </footer>
  );
};
