import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { TrustLensLogo } from '../common/TrustLensLogo.js';

export const PublicHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: TrustLens Logo and Name */}
        <Link to="/" className="flex items-center gap-2">
          <TrustLensLogo size="md" showWordmark={true} />
        </Link>

        {/* Center: Home, How It Works, Features, Community, About */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#14B8A6] transition-colors"
          >
            Home
          </a>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#14B8A6] transition-colors font-semibold"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-[#14B8A6] transition-colors font-semibold"
          >
            Features
          </button>
          <Link
            to="/community"
            className="hover:text-[#14B8A6] transition-colors font-semibold"
          >
            Community
          </Link>
          <button
            type="button"
            onClick={() => scrollToSection('about')}
            className="hover:text-[#14B8A6] transition-colors font-semibold"
          >
            About
          </button>
        </nav>

        {/* Right: Theme Toggle, Sign In, Get Started */}
        <div className="hidden md:flex items-center gap-3">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl shadow-sm transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 md:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] dark:border-slate-800 px-4 pt-2 pb-5 space-y-3 bg-white dark:bg-[#0B1220]">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="block w-full text-left py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Features
          </button>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Community
          </Link>
          <button
            onClick={() => scrollToSection('about')}
            className="block w-full text-left py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            About
          </button>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold bg-[#14B8A6] text-white rounded-xl"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold bg-[#14B8A6] text-white rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
