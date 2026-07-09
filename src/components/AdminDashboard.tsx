/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Shield, Users, Calendar, FileText, Database, TrendingUp, DollarSign, Activity, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_auth_token');
      
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      const logsRes = await fetch('/api/admin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const logsData = await logsRes.json();
      setAuditLogs(logsData);
    } catch (e) {
      console.error('Error fetching admin workspace data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-dashboard" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Visual Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">System Compliance & Administration</h1>
            <p className="text-slate-300 text-sm">
              Complete platform ledger oversight, cryptographically recorded audit logs, and compliance analytics.
            </p>
          </div>
          <button 
            onClick={fetchAdminData}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono tracking-wider text-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> REFRESH LEDGER
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats overview cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* KPI: Platform volume */}
            <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Venture Capital Volume</p>
                <p className="text-lg font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
                  ${(stats?.totalInvestmentVolume || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* KPI: Active directory size */}
            <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Registered Directory</p>
                <p className="text-lg font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
                  {stats?.totalUsers || 0} Accounts
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {stats?.totalInvestors} Investors • {stats?.totalEntrepreneurs} Founders
                </p>
              </div>
            </div>

            {/* KPI: Scheduled meetings */}
            <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
              <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Scheduled Briefings</p>
                <p className="text-lg font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
                  {stats?.totalMeetings || 0} Meetings
                </p>
              </div>
            </div>

            {/* KPI: Documents uploaded */}
            <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 flex items-center gap-4">
              <div className="p-3.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Document Chamber</p>
                <p className="text-lg font-display font-semibold mt-0.5 text-slate-800 dark:text-white">
                  {stats?.totalDocuments || 0} Files
                </p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-6">
            
            {/* Audit Log Panel */}
            <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
                <Activity className="w-4.5 h-4.5 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Cryptographic Audit Logs</h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-200/40 dark:border-slate-800/40">
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Operational Details</th>
                      <th className="py-3 px-4">Client IP</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">No audit logs recorded</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-300 transition-all font-sans">
                          <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {log.action}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {log.userEmail}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate">
                            {log.details}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">
                            {log.ip}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
