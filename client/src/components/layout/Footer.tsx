import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">TrustLens</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              An explainable misinformation analysis and media literacy platform designed to examine language patterns, source citations, and verified evidence.
            </p>
            <div className="text-[10px] text-slate-400">
              Assisting critical human judgment — not replacing it.
            </div>
          </div>

          {/* Verification Workspaces */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3">
              Workspaces
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/verify" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Analyze Claims & Screenshots
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Verification AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Community Deliberation
                </Link>
              </li>
              <li>
                <Link to="/experts" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Expert Review Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Safety */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3">
              Civic Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/report-center" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Official Citizen Report Portals
                </Link>
              </li>
              <li>
                <Link to="/legal-rights" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Law & Citizen Communication Rights
                </Link>
              </li>
              <li>
                <Link to="/education" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Digital Literacy Modules
                </Link>
              </li>
              <li>
                <a
                  href="https://factcheck.pib.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>PIB Fact Check Registry</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3">
              Methodology & Ethics
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#responsible-use" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Responsible AI Principles
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  How Risk Indicators Work
                </a>
              </li>
              <li>
                <Link to="/settings" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Privacy & Data Retention
                </Link>
              </li>
              <li>
                <span className="text-[10px] text-slate-400">
                  Multilingual: English • తెలుగు • हिन्दी
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} TrustLens Platform. Open verification architecture.</p>
          <p className="text-slate-400 text-center sm:text-right">
            Notice: Automated assessments can be incomplete or uncertain. Always check primary official records.
          </p>
        </div>
      </div>
    </footer>
  );
};
