import React from 'react';
import { Scale, ShieldAlert, BookOpen, ExternalLink, Info } from 'lucide-react';

export const LegalRightsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
          <Scale className="w-3.5 h-3.5" />
          <span>Digital Rights & Regulatory Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Law & Citizen Communication Rights
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Educational awareness regarding digital speech protections, rumor circulation, and statutory grievance rights.
        </p>
      </div>

      {/* Prominent Legal Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Educational Notice:</strong> The information provided on this page is for general digital literacy and civic awareness only. It does not constitute formal legal advice or create an attorney-client relationship. Laws and judicial precedents evolve; please consult licensed legal professionals for specific situations.
        </div>
      </div>

      {/* Constitutional Basis */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Constitutional Speech Protections & Scope
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Under <strong>Article 19(1)(a) of the Constitution of India</strong>, all citizens have the fundamental right to freedom of speech and expression. This includes the right to express opinions, share news, and critique public policies.
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          However, this right is governed by reasonable restrictions under <strong>Article 19(2)</strong> relating to the sovereignty and integrity of India, security of the state, public order, decency, morality, or in relation to incitement to an offence.
        </p>
      </div>

      {/* Statutory Provisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Circulation of False Alarms
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Bharatiya Nyaya Sanhita (BNS) 2023 — Section 353(2)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Makes it an offence to make, publish, or circulate any statement, rumor, or report with intent to create or promote enmity, hatred, or ill-will between different religious, racial, or regional communities, or to incite panic disrupting public tranquility.
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            Core test: Demonstrable intent or deliberate circulation of alarmist falsehoods.
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Digital Identity & Fraud
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Information Technology Act 2000 — Section 66D
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Punishes cheating by personation by using computer resources (e.g. creating fake appointment letters with forged ministry letterheads, phishing banking portals, or impersonating public officials on messaging channels).
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            Includes fake government vacancy letters demanding application fees.
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Platform Duties
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Intermediary Guidelines Rules 2021
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Social media intermediaries (WhatsApp, Meta, Telegram, X) are required to appoint a Resident Grievance Officer in India and maintain transparent dispute escalation channels.
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            Platforms must acknowledge user complaints within 24 hours.
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Privacy Rights
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Digital Personal Data Protection (DPDP) Act 2023
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Establishes statutory rights for data principals, including right to access summary of processed personal data, right to correction, and right to complete account erasure.
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            TrustLens fully supports complete data export and deletion in Settings.
          </div>
        </div>
      </div>

      {/* Official Legal Databases */}
      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
            Official Legislative Repository
          </h4>
          <p className="text-[11px] text-slate-500">
            Consult official central and state acts directly at India Code.
          </p>
        </div>
        <a
          href="https://www.indiacode.nic.in"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 flex items-center gap-1.5 shadow-sm"
        >
          <span>India Code Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
