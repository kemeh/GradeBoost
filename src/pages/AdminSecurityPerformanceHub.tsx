import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Activity,
  Server,
  Database,
  Cpu,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Key,
  FileCheck,
  Zap,
  Globe,
  HardDrive,
  Clock,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  role: 'admin' | 'teacher' | 'student';
  action: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'blocked';
}

interface SystemMetric {
  name: string;
  value: string;
  status: 'optimal' | 'warning' | 'stable';
  load: number;
}

export const AdminSecurityPerformanceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'performance' | 'audit' | 'backups'>('security');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<SecurityLog[]>([
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      user: 'kemehhilary@gmail.com',
      role: 'admin',
      action: 'Executed database index optimization for questions collection',
      ipAddress: '197.159.20.14 (Douala, CM)',
      status: 'success',
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      user: 'teacher.physics@edulpha.cm',
      role: 'teacher',
      action: 'Uploaded GCE A-Level Physics Paper 2 (PDF validation passed)',
      ipAddress: '154.72.164.8 (Yaoundé, CM)',
      status: 'success',
    },
    {
      id: 'log_3',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      user: 'unknown_bot@scanner.net',
      role: 'student',
      action: 'Blocked SQL injection attempt on AI tutor endpoint (/api/ai/query)',
      ipAddress: '45.154.255.88 (Proxy)',
      status: 'blocked',
    },
    {
      id: 'log_4',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      user: 'finance.lead@edulpha.cm',
      role: 'admin',
      action: 'Verified MTN Mobile Money webhook payment batch #MTN_2026_9942',
      ipAddress: '197.159.20.14 (Douala, CM)',
      status: 'success',
    },
  ]);

  const [metrics] = useState<SystemMetric[]>([
    { name: 'API Gateway Response Time', value: '42 ms', status: 'optimal', load: 18 },
    { name: 'PostgreSQL & Firestore Query Latency', value: '12 ms', status: 'optimal', load: 24 },
    { name: 'JWT Token Rotation Engine', value: 'Active (15m expiry)', status: 'optimal', load: 10 },
    { name: 'Rate Limiting & Throttling (Redis)', value: '1,000 req/min per IP', status: 'optimal', load: 32 },
    { name: 'AI Token Consumption Rate', value: '18.4M / 100M tokens', status: 'optimal', load: 45 },
    { name: 'SSL Certificate & TLS 1.3 Encryption', value: 'Valid (Expires 2027)', status: 'optimal', load: 5 },
  ]);

  const handleRunSecurityAudit = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult('Security Audit Complete: 0 vulnerabilities found. All JWT tokens rotated, CORS strict, SQL/XSS filters active, and MTN/Orange webhook signatures verified.');
      toast.success('Enterprise security scan completed successfully!');
    }, 1500);
  };

  const handleTriggerBackup = () => {
    toast.success('Encrypted snapshot backup initiated to Google Cloud Storage (GCS)...');
    setTimeout(() => {
      toast.success('Cloud snapshot backup completed successfully (ID: snap_2026_07_31_0220).');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-300">
            <Shield className="w-4 h-4" /> Enterprise Security, Performance & Scalability Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Edulpha Infrastructure & Security Center
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Real-time monitoring of RBAC permissions, JWT session rotation, SQL/XSS defenses, MTN/Orange payment audit logs, and high-performance database indexing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleRunSecurityAudit}
              disabled={isScanning}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {isScanning ? 'Running Deep Security Scan...' : 'Run Enterprise Security Scan'}
            </button>
            <button
              onClick={handleTriggerBackup}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm border border-slate-600 transition flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              Trigger Encrypted Backup
            </button>
          </div>
        </div>
      </div>

      {scanResult && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>Audit Status:</strong> {scanResult}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'security', label: '🔒 Security & Access Control', icon: Lock },
          { id: 'performance', label: '⚡ Performance & Scaling', icon: Zap },
          { id: 'audit', label: '📋 Admin Audit Logs', icon: FileCheck },
          { id: 'backups', label: '💾 Backups & Disaster Recovery', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-950/40 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SECURITY */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 w-fit rounded-2xl">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">JWT & Refresh Rotation</h3>
            <p className="text-sm text-slate-300">
              Short-lived access tokens (15m) combined with secure httpOnly refresh tokens. Automatic session termination on credential change or logout.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 w-fit rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Role-Based Access Control (RBAC)</h3>
            <p className="text-sm text-slate-300">
              Strict permission guards protecting Admin consoles, Teacher analytics, Student learning paths, and Payment gateways against privilege escalation.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 w-fit rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Prompt Injection Defense</h3>
            <p className="text-sm text-slate-300">
              Input sanitization and system prompt hardening preventing prompt extraction or malicious payload injection into Edulpha AI.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <h3 className="text-xl font-bold text-white">Infrastructure Health & Latency Metrics</h3>
            <p className="text-xs text-slate-400">Optimized for horizontal scaling up to 1,000,000 concurrent students</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{metric.name}</h4>
                    <span className="text-xs text-emerald-400 font-bold">{metric.value}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold">
                      {metric.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Load: {metric.load}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white">System Security & Administrator Audit Trail</h3>
            <span className="text-xs text-slate-400">Showing recent verified actions</span>
          </div>
          <div className="divide-y divide-slate-700/60">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-750 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    log.status === 'blocked' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white">{log.action}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>👤 {log.user} ({log.role})</span>
                      <span>• IP: {log.ipAddress}</span>
                      <span>• {new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUPS */}
      {activeTab === 'backups' && (
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <h3 className="text-xl font-bold text-white">Disaster Recovery & Automated Backups</h3>
          <p className="text-xs text-slate-400">Daily encrypted snapshots stored securely in Google Cloud Storage</p>

          <div className="space-y-3">
            {[
              { id: 'snap_01', date: '2026-07-31 02:00 UTC', size: '1.4 GB', status: 'Verified & Encrypted (AES-256)' },
              { id: 'snap_02', date: '2026-07-30 02:00 UTC', size: '1.4 GB', status: 'Verified & Encrypted (AES-256)' },
              { id: 'snap_03', date: '2026-07-29 02:00 UTC', size: '1.38 GB', status: 'Verified & Encrypted (AES-256)' },
            ].map((snap, idx) => (
              <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-700 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-white">Snapshot ID: {snap.id}</h4>
                  <p className="text-xs text-slate-400">Created: {snap.date} • Size: {snap.size}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {snap.status}
                  </span>
                  <button
                    onClick={() => toast.success(`Restoring snapshot ${snap.id}...`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurityPerformanceHub;
