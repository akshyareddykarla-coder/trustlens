import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, ArrowRight } from 'lucide-react';
import { TrustLensLogo } from '../components/common/TrustLensLogo.js';

export const EmailVerificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex justify-center mb-4">
          <TrustLensLogo size="lg" showWordmark={true} tagline={false} />
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-[#0B1220] dark:text-white">
          Verify Your Email
        </h2>
        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
          We have sent an authentication verification link to your registered email address.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0B1220] py-8 px-6 shadow-xl shadow-slate-200/40 dark:shadow-none border border-[#E2E8F0] dark:border-slate-800 rounded-3xl sm:px-10 text-center space-y-4">
          <MailCheck className="w-14 h-14 text-[#14B8A6] mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Check Your Inbox
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the link in the verification email to activate your account. You can also sign in directly using your password or instant test accounts.
          </p>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
