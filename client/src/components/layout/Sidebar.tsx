import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  History,
  Users,
  AlertOctagon,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { TrustLensLogo } from '../common/TrustLensLogo.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isVisible?: boolean;
  onHide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  isVisible = true,
  onHide,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Exactly five main navigation items as strictly mandated
  const mainNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/verify', label: 'Verify Content', icon: FileCheck2 },
    { to: '/dashboard/history', label: 'History', icon: History },
    { to: '/dashboard/community', label: 'Community', icon: Users },
    { to: '/dashboard/report-center', label: 'Report Center', icon: AlertOctagon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Primary Sidebar Shell - Fixed viewport height, never drags or stretches */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen bg-white dark:bg-[#0B1220] border-r border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:h-screen lg:sticky lg:top-0 flex-shrink-0 select-none ${
          // Mobile state
          isOpen
            ? 'translate-x-0 w-60'
            : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop visibility & width states
          !isVisible
            ? 'lg:w-0 lg:p-0 lg:border-r-0 lg:opacity-0 lg:pointer-events-none'
            : isCollapsed
            ? 'lg:w-16 lg:opacity-100'
            : 'lg:w-60 lg:opacity-100'
        }`}
      >
        {/* Top: Brand Header & Exactly 5 Nav Items */}
        <div className="flex flex-col min-w-0">
          {/* Logo Bar */}
          <div
            className={`flex items-center h-16 border-b border-[#E2E8F0] dark:border-slate-800/80 transition-all ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
            }`}
          >
            <Link
              to="/dashboard"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="inline-flex items-center overflow-hidden"
              title="TrustLens Dashboard"
            >
              {isCollapsed ? (
                <TrustLensLogo size="sm" variant="emblemOnly" />
              ) : (
                <TrustLensLogo size="sm" showWordmark={true} />
              )}
            </Link>

            {/* Collapse toggle on desktop */}
            {onToggleCollapse && !isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick expand button when collapsed */}
          {isCollapsed && onToggleCollapse && (
            <div className="hidden lg:flex justify-center py-2 border-b border-slate-100 dark:border-slate-800/50">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 text-slate-400 hover:text-[#14B8A6] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main 5 Navigation Items */}
          <nav className="p-2 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-xs font-semibold transition-all group ${
                      isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-[#14B8A6]/10 dark:bg-[#14B8A6]/15 text-[#14B8A6] font-bold border border-[#14B8A6]/30 dark:border-[#14B8A6]/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Bar: Settings and Logout ONLY */}
        <div className="p-2 border-t border-[#E2E8F0] dark:border-slate-800 space-y-1 min-w-0">
          <NavLink
            to="/dashboard/settings"
            end
            title={isCollapsed ? 'Settings' : undefined}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-xs font-semibold transition-all ${
                isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-[#14B8A6]/10 dark:bg-[#14B8A6]/15 text-[#14B8A6] font-bold border border-[#14B8A6]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Settings</span>}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-left ${
              isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
