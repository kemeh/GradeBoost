import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Zap, Trophy, TrendingUp, RefreshCw, 
  CheckCircle, Search, Edit3, Save, ShieldAlert, Sparkles, Filter 
} from 'lucide-react';
import { 
  getAdminReferralMetrics, 
  getReferralCampaign, 
  updateReferralCampaign, 
  backfillExistingUsersReferralCodes 
} from '../../services/referralService';
import { AdminReferralMetrics, ReferralCampaign } from '../../types/referral';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

export const AdminReferralManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminReferralMetrics | null>(null);
  const [campaign, setCampaign] = useState<ReferralCampaign | null>(null);
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState<Partial<ReferralCampaign>>({});
  const [backfilling, setBackfilling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        getAdminReferralMetrics(),
        getReferralCampaign('50k_challenge')
      ]);
      setMetrics(m);
      setCampaign(c);
      setCampaignForm(c);

      // Fetch all referrals
      const snap = await getDocs(collection(db, 'referrals'));
      setAllReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading admin referral management:", err);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCampaign = async () => {
    if (!campaign) return;
    try {
      const success = await updateReferralCampaign({
        id: campaign.id,
        ...campaignForm
      });
      if (success) {
        toast.success("Campaign updated successfully!");
        setIsEditingCampaign(false);
        loadData();
      } else {
        toast.error("Failed to update campaign");
      }
    } catch (err) {
      toast.error("Error saving campaign");
    }
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      const count = await backfillExistingUsersReferralCodes();
      toast.success(`Generated referral codes for ${count} users!`);
      loadData();
    } catch (err) {
      toast.error("Failed to backfill referral codes");
    } finally {
      setBackfilling(false);
    }
  };

  const handleForceQualify = async (referralId: string) => {
    try {
      await updateDoc(doc(db, 'referrals', referralId), {
        status: 'qualified',
        qualifiedAt: new Date().toISOString(),
        qualificationActivity: 'Admin Manual Qualification'
      });
      toast.success("Referral force qualified!");
      loadData();
    } catch (err) {
      toast.error("Failed to force qualify");
    }
  };

  const filteredReferrals = allReferrals.filter(r => {
    const matchesSearch = 
      (r.referrerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.referredUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.referrerCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Referral System Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Referral & Student Growth System</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor peer invitations, 50k student challenge campaign, and referral qualifications
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${backfilling ? 'animate-spin' : ''}`} />
            <span>{backfilling ? 'Backfilling...' : 'Generate Codes for Legacy Users'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Invited</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.totalReferrals || 0}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Qualified Referrals</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {metrics?.qualifiedReferrals || 0}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Conversion Rate</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {metrics?.conversionRate || 0}%
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Points Rewarded</span>
          <span className="text-2xl font-extrabold text-amber-500">
            {(metrics?.totalPointsRewarded || 0).toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Top Referrer</span>
          <span className="text-base font-bold text-slate-900 dark:text-white truncate block">
            {metrics?.topReferrerName || 'N/A'}
          </span>
          <span className="text-[10px] text-emerald-500 font-semibold">
            {metrics?.topReferrerCount || 0} qualified
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">50K Target</span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {metrics?.campaignTargetProgress || 0}%
          </span>
        </div>
      </div>

      {/* Campaign Settings Card */}
      {campaign && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                National Growth Challenge Campaign Manager
              </h3>
            </div>
            <button
              onClick={() => setIsEditingCampaign(!isEditingCampaign)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isEditingCampaign ? 'Cancel' : 'Edit Campaign Details'}
            </button>
          </div>

          {!isEditingCampaign ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Title (EN / FR):</span>
                <span className="font-bold text-slate-900 dark:text-white">{campaign.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current vs Target:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {campaign.currentStudents.toLocaleString()} / {campaign.targetStudents.toLocaleString()} Students
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Campaign Status:</span>
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold uppercase">
                  {campaign.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 md:space-y-0">
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Title (English)</label>
                <input
                  type="text"
                  value={campaignForm.title || ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />

                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Title (French)</label>
                <input
                  type="text"
                  value={campaignForm.titleFr || ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, titleFr: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Current Students</label>
                    <input
                      type="number"
                      value={campaignForm.currentStudents || 0}
                      onChange={(e) => setCampaignForm({ ...campaignForm, currentStudents: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Target Students</label>
                    <input
                      type="number"
                      value={campaignForm.targetStudents || 50000}
                      onChange={(e) => setCampaignForm({ ...campaignForm, targetStudents: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveCampaign}
                  className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-500 transition-all flex items-center justify-center space-x-1 mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Campaign Updates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Referrals Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Referrals Records Audit ({filteredReferrals.length})
          </h3>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search referrer, friend, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered (Pending)</option>
              <option value="qualified">Qualified</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-3 px-3">Referrer</th>
                <th className="py-3 px-3">Code Used</th>
                <th className="py-3 px-3">Referred Student</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Qualification Activity</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No referral records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {ref.referrerName || 'Student'}
                    </td>
                    <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {ref.referrerCode}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {ref.referredUserName || 'New Student'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(ref.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      {ref.status === 'qualified' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          QUALIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {ref.qualificationActivity || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ref.status === 'registered' && (
                        <button
                          onClick={() => handleForceQualify(ref.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] transition-all"
                        >
                          Force Qualify
                        </button>
                      )}
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
};
