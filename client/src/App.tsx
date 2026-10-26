import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { LanguageProvider } from './context/LanguageContext.js';

import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { FloatingAssistant } from './components/layout/FloatingAssistant.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { EmailVerificationPage } from './pages/EmailVerificationPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { VerifyNewsPage } from './pages/VerifyNewsPage.js';
import { AnalysisResultPage } from './pages/AnalysisResultPage.js';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage.js';
import { CommunityPage } from './pages/CommunityPage.js';
import { CommunityDetailPage } from './pages/CommunityDetailPage.js';
import { ReportCenterPage } from './pages/ReportCenterPage.js';
import { EducationalHubPage } from './pages/EducationalHubPage.js';
import { LegalRightsPage } from './pages/LegalRightsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AdminPanelPage } from './pages/AdminPanelPage.js';
import { ExpertPortalPage } from './pages/ExpertPortalPage.js';

// Authenticated Application Shell (Sidebar + Header + Main + Floating AI Assistant)
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('trustlens_sidebar_visible');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('trustlens_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarVisibility = () => {
    setSidebarVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trustlens_sidebar_visible', String(next));
      } catch {}
      return next;
    });
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trustlens_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1A] text-[#0F172A] dark:text-slate-100">
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isVisible={sidebarVisible}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onHide={toggleSidebarVisibility}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant (Not in sidebar, floating button at bottom-right) */}
      <FloatingAssistant />
    </div>
  );
};

// Route Guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090F1A]">
        <div className="w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin Guard
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090F1A]">
        <div className="w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Authentication Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* 1. Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />

              {/* 2. Verify Content (with /dashboard/verify and /verify aliases) */}
              <Route
                path="/dashboard/verify"
                element={
                  <AppLayout>
                    <VerifyNewsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/verify"
                element={
                  <AppLayout>
                    <VerifyNewsPage />
                  </AppLayout>
                }
              />

              {/* Investigation Result Page */}
              <Route
                path="/analysis/:id"
                element={
                  <AppLayout>
                    <AnalysisResultPage />
                  </AppLayout>
                }
              />

              {/* 3. History (with /dashboard/history and /history aliases) */}
              <Route
                path="/dashboard/history"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <AnalysisHistoryPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/history"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <AnalysisHistoryPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />

              {/* 4. Community (with /dashboard/community and /community aliases) */}
              <Route
                path="/dashboard/community"
                element={
                  <AppLayout>
                    <CommunityPage />
                  </AppLayout>
                }
              />
              <Route
                path="/community"
                element={
                  <AppLayout>
                    <CommunityPage />
                  </AppLayout>
                }
              />
              <Route
                path="/community/:id"
                element={
                  <AppLayout>
                    <CommunityDetailPage />
                  </AppLayout>
                }
              />

              {/* 5. Report Center (with /dashboard/report-center and /report-center aliases) */}
              <Route
                path="/dashboard/report-center"
                element={
                  <AppLayout>
                    <ReportCenterPage />
                  </AppLayout>
                }
              />
              <Route
                path="/report-center"
                element={
                  <AppLayout>
                    <ReportCenterPage />
                  </AppLayout>
                }
              />
              <Route
                path="/expert"
                element={
                  <AppLayout>
                    <ExpertPortalPage />
                  </AppLayout>
                }
              />
              <Route
                path="/experts"
                element={<Navigate to="/dashboard/report-center" replace />}
              />
              <Route
                path="/legal-rights"
                element={
                  <AppLayout>
                    <LegalRightsPage />
                  </AppLayout>
                }
              />

              {/* Settings */}
              <Route
                path="/dashboard/settings"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  </RequireAuth>
                }
              />

              {/* Educational Hub / Real-World Cases (Accessible via dashboard cards) */}
              <Route
                path="/education"
                element={
                  <AppLayout>
                    <EducationalHubPage />
                  </AppLayout>
                }
              />

              {/* Admin Panel (Accessible via Profile dropdown for authorized admins) */}
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <RequireAdmin>
                      <AppLayout>
                        <AdminPanelPage />
                      </AppLayout>
                    </RequireAdmin>
                  </RequireAuth>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
