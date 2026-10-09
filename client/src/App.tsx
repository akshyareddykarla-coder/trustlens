import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { LanguageProvider } from './context/LanguageContext.js';

import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { VerifyNewsPage } from './pages/VerifyNewsPage.js';
import { AnalysisResultPage } from './pages/AnalysisResultPage.js';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage.js';
import { AssistantPage } from './pages/AssistantPage.js';
import { CommunityPage } from './pages/CommunityPage.js';
import { CommunityDetailPage } from './pages/CommunityDetailPage.js';
import { ExpertNetworkPage } from './pages/ExpertNetworkPage.js';
import { ReportCenterPage } from './pages/ReportCenterPage.js';
import { LegalRightsPage } from './pages/LegalRightsPage.js';
import { EducationalHubPage } from './pages/EducationalHubPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AdminPanelPage } from './pages/AdminPanelPage.js';

// Authenticated Application Shell
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Route Guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
              {/* Public Landing & Auth Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Public/Direct accessible core verification desk with workspace shell */}
              <Route
                path="/verify"
                element={
                  <AppLayout>
                    <VerifyNewsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/analysis/:id"
                element={
                  <AppLayout>
                    <AnalysisResultPage />
                  </AppLayout>
                }
              />
              <Route
                path="/education"
                element={
                  <AppLayout>
                    <EducationalHubPage />
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
                path="/legal-rights"
                element={
                  <AppLayout>
                    <LegalRightsPage />
                  </AppLayout>
                }
              />

              {/* Authenticated Workspace Pages */}
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
              <Route
                path="/assistant"
                element={
                  <AppLayout>
                    <AssistantPage />
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
              <Route
                path="/experts"
                element={
                  <AppLayout>
                    <ExpertNetworkPage />
                  </AppLayout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <AnalyticsPage />
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
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <AdminPanelPage />
                    </AppLayout>
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
