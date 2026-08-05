import React, { useState, useEffect } from 'react';
import { 
  Database, Trash2, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Layers, FileText, Users, Award, Shield
} from 'lucide-react';
import { getDemoDataCounts, clearAllDemoData, DemoDataCounts } from '../../services/systemDataService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function AdminSystemDataManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [counts, setCounts] = useState<DemoDataCounts>({
    ambassadorProfiles: 0,
    alumniProfiles: 0,
    ambassadorApplications: 0,
    alumniApplications: 0,
    ambassadorGallery: 0,
    alumniGallery: 0,
    testimonials: 0,
    referralRecords: 0,
    totalDemoRecords: 0
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadCounts = async () => {
    setLoading(true);
    const data = await getDemoDataCounts();
    setCounts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleConfirmClear = async () => {
    setClearing(true);
    try {
      const result = await clearAllDemoData(
        user?.email || 'admin@edulpha.cm',
        user?.displayName || 'System Admin'
      );
      toast.success(`Demo data cleared successfully! (${result.clearedCount} records removed)`);
      setShowConfirmModal(false);
      await loadCounts();
    } catch (err) {
      console.error('Failed to clear demo data:', err);
      toast.error('Failed to clear demo data. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-900/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider">
            <Database size={14} className="text-rose-400" /> System Data Management
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Demo Data Cleanup & Data Integrity
          </h2>
          <p className="text-slate-300 text-xs md:text-sm font-medium">
            Purge sample demo records, test student profiles, and mock referral stats safely without affecting real registered users.
          </p>
        </div>

        <button 
          onClick={loadCounts}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 shrink-0 border border-slate-700"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Scan</span>
        </button>
      </div>

      {/* Main Action Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Layers size={20} className="text-amber-400" />
              <span>Demo Data Reset Center</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Identify and permanently wipe pre-seeded mock records prior to production rollout or system audits.
            </p>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={counts.totalDemoRecords === 0}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xl ${
              counts.totalDemoRecords === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
            }`}
          >
            <Trash2 size={16} />
            <span>Clear Demo Data</span>
          </button>
        </div>

        {/* Demo Data Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Demo Ambassadors</span>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{counts.ambassadorProfiles}</div>
            <p className="text-[10px] text-slate-400">Pre-seeded student leader profiles</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Demo Alumni</span>
              <Award size={16} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-400">{counts.alumniProfiles}</div>
            <p className="text-[10px] text-slate-400">Pre-seeded alumni profiles</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Demo Applications</span>
              <FileText size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {counts.ambassadorApplications + counts.alumniApplications}
            </div>
            <p className="text-[10px] text-slate-400">Sample pending applications</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Demo Gallery & Stats</span>
              <Layers size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {counts.ambassadorGallery + counts.alumniGallery + counts.referralRecords}
            </div>
            <p className="text-[10px] text-slate-400">Sample photo events & referral metrics</p>
          </div>
        </div>

        {/* Real User Protection Safeguard Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-white text-sm">Real User Account Safeguard Guarantee</div>
            <p className="text-emerald-300/80 leading-relaxed">
              Edulpha's data engine strictly isolates real registered student, teacher, and administrator user accounts from demo data cleanup routines. Only records created with the <code>is_demo: true</code> flag or initial demo seed IDs will be removed.
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">System Data Removal</h3>
                <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">Confirm Clear Demo Data</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-3">
              <p className="font-extrabold text-rose-200 text-sm">
                Are you sure you want to remove all demo data? This action cannot be undone.
              </p>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div>• {counts.ambassadorProfiles} Student Ambassador Profiles</div>
                <div>• {counts.alumniProfiles} Alumni Profiles</div>
                <div>• {counts.ambassadorApplications + counts.alumniApplications} Ambassador & Alumni Applications</div>
                <div>• {counts.ambassadorGallery + counts.alumniGallery} Gallery & Event Photos</div>
                <div>• Sample Testimonials & Mock Referral Analytics</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={clearing}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={clearing}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2"
              >
                {clearing && <RefreshCw size={14} className="animate-spin" />}
                <span>Yes, Clear All Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
