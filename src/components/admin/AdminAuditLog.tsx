import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Filter, ShieldCheck, User, Calendar, FileText } from 'lucide-react';
import { getAuditLogs, clearAllAuditLogs, AuditLogEntry } from '../../services/auditLogService';
import { Badge } from '../ui';
import { toast } from 'react-hot-toast';

export function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear the admin audit log history?')) return;
    await clearAllAuditLogs();
    toast.success('Audit log history cleared.');
    loadLogs();
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = typeFilter === 'all' || log.recordType === typeFilter;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
            <History size={14} className="text-indigo-400" /> Security & Activity Compliance
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Admin System Audit Log
          </h2>
          <p className="text-slate-300 text-xs md:text-sm font-medium">
            Chronological audit log tracking administrative record deletions, profile status changes, and demo data cleanups.
          </p>
        </div>

        <button 
          onClick={loadLogs}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 shrink-0 border border-slate-700"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search log action, admin name, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
          >
            <option value="all">All Event Types</option>
            <option value="ambassador">Ambassadors</option>
            <option value="alumni">Alumni</option>
            <option value="demo_cleanup">Demo Cleanups</option>
            <option value="user">Users</option>
            <option value="system">System</option>
          </select>

          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition shrink-0"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Admin User</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Record Type</th>
                <th className="p-3">Affected Items</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">No audit logs matching filters.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{log.adminName}</div>
                      <div className="text-[10px] text-slate-400">{log.adminEmail}</div>
                    </td>
                    <td className="p-3 font-extrabold text-amber-300">{log.action}</td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          log.recordType === 'demo_cleanup' 
                            ? 'danger' 
                            : log.recordType === 'ambassador' 
                            ? 'warning' 
                            : 'info'
                        }
                        className="uppercase text-[10px]"
                      >
                        {log.recordType}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {log.affectedCount || 1} record(s)
                    </td>
                    <td className="p-3 text-[11px] text-slate-300 max-w-xs truncate">
                      {log.details || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
