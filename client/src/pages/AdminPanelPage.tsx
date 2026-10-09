import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Flag,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const AdminPanelPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'reports' | 'logs'>('health');

  const [healthData, setHealthData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'health') {
        const h = await api.getAdminHealth();
        setHealthData(h);
      } else if (activeTab === 'users') {
        const u = await api.getAdminUsers();
        setUsersList(u.users || []);
      } else if (activeTab === 'reports') {
        const r = await api.getAdminReports();
        setReportsList(r.reports || []);
      } else if (activeTab === 'logs') {
        const l = await api.getAdminAuditLogs();
        setLogsList(l.logs || []);
      }
    } catch (err: any) {
      console.warn('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabContent();
  }, [activeTab]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchTabContent();
    } catch (err: any) {
      alert(`Role update failed: ${err.message}`);
    }
  };

  const handleModerateReport = async (reportId: string, status: string, actionTaken?: string) => {
    try {
      await api.moderateReport(reportId, { status, actionTaken });
      fetchTabContent();
    } catch (err: any) {
      alert(`Moderation failed: ${err.message}`);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-3">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Administrative Access Required</h2>
        <p className="text-xs text-slate-500">
          This portal is restricted to users with the 'admin' role. Use the test accounts pill on the login page to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <span>Platform Administration & Health</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System status monitoring, user role management, moderation triage, and audit records.
          </p>
        </div>

        <button
          onClick={fetchTabContent}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'health'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Integration Health</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Content Moderation Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading administrative telemetry...</div>
      ) : activeTab === 'health' && healthData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600" />
                <span>Primary Storage Engine</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {healthData.database?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Engine: <strong>{healthData.database?.engine}</strong>
            </p>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div>Total User Profiles: <strong>{healthData.database?.totalUsers}</strong></div>
              <div>Stored Verification Analyses: <strong>{healthData.database?.totalAnalyses}</strong></div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>AI & OCR Subsystems</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                Operational
              </span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div>
                Gemini Model: <strong>{healthData.integrations?.geminiAi?.status}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                {healthData.integrations?.geminiAi?.note}
              </div>
              <div className="pt-2">
                OCR Tesseract: <strong>{healthData.integrations?.ocrTesseract?.status}</strong> ({healthData.integrations?.ocrTesseract?.supportedLanguages?.join(', ')})
              </div>
              <div>
                SSRF Security Guard: <strong>{healthData.integrations?.ssrfSecurityGuard?.status}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            Registered User Accounts ({usersList.length})
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {usersList.map((u) => (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{u.display_name}</div>
                  <div className="text-slate-500 text-[11px]">{u.email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Scans completed: {u.analysis_count}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Role:</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="expert">Expert</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            Abuse & Content Reports Queue ({reportsList.length})
          </div>
          {reportsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Moderation queue is clean.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportsList.map((rep) => (
                <div key={rep.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-600">{rep.reason}</span>
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Item Type: {rep.reported_item_type} (ID: {rep.reported_item_id})
                  </p>
                  {rep.details && <p className="text-slate-500 italic">"{rep.details}"</p>}

                  {rep.status === 'pending' && (
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleModerateReport(rep.id, 'action_taken', 'delete_item')}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-semibold"
                      >
                        Enforce Action & Remove
                      </button>
                      <button
                        onClick={() => handleModerateReport(rep.id, 'dismissed')}
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            Administrative Audit Log Records
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {logsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No privileged operations logged yet.</div>
            ) : (
              logsList.map((log) => (
                <div key={log.id} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-slate-500 ml-2">by {log.admin_name || 'System Admin'}</span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.details}</div>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
