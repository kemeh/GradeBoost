import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Trophy, ShieldCheck, CheckCircle2, XCircle, 
  Search, Plus, Trash2, Edit3, Eye, Sparkles, Filter, 
  TrendingUp, School, MapPin, RefreshCw, Layers, Check, Download, AlertTriangle, Shield, Ban
} from 'lucide-react';
import { Badge } from '../ui';
import { 
  getAmbassadorProfiles, 
  getAmbassadorApplications, 
  getAmbassadorGallery,
  updateApplicationStatus, 
  saveAmbassadorProfile, 
  deleteAmbassadorProfile,
  saveAmbassadorGalleryItem,
  deleteAmbassadorGalleryItem
} from '../../services/ambassadorService';
import { logAdminAction } from '../../services/auditLogService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AmbassadorProfile, 
  AmbassadorApplication, 
  AmbassadorGalleryItem, 
  AmbassadorLevel, 
  AmbassadorClassLevel,
  AmbassadorApplicationStatus
} from '../../types/ambassador';
import { toast } from 'react-hot-toast';

export function AdminAmbassadorManagement() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'profiles' | 'applications' | 'gallery'>('profiles');
  const [loading, setLoading] = useState(true);

  // Data
  const [applications, setApplications] = useState<AmbassadorApplication[]>([]);
  const [profiles, setProfiles] = useState<AmbassadorProfile[]>([]);
  const [gallery, setGallery] = useState<AmbassadorGalleryItem[]>([]);

  // Selection & Bulk Actions State
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);

  // Filters & Search
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [profSearch, setProfSearch] = useState('');

  // Selected Application Drawer/Modal
  const [selectedApp, setSelectedApp] = useState<AmbassadorApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignLevel, setAssignLevel] = useState<AmbassadorLevel>('bronze');

  // Edit/New Profile Modal
  const [editingProfile, setEditingProfile] = useState<AmbassadorProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // View Profile Modal
  const [viewingProfile, setViewingProfile] = useState<AmbassadorProfile | null>(null);

  // Delete Ambassador Confirmation Modal
  const [deletingProfile, setDeletingProfile] = useState<AmbassadorProfile | null>(null);

  // New Gallery Modal
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState<AmbassadorGalleryItem>({
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    category: 'school_activity',
    school: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadAll = async () => {
    setLoading(true);
    const apps = await getAmbassadorApplications();
    const profs = await getAmbassadorProfiles();
    const gal = await getAmbassadorGallery();
    
    // Filter out soft deleted profiles
    setApplications(apps.filter(a => !a.deleted_at));
    setProfiles(profs.filter(p => !p.deleted_at));
    setGallery(gal.filter(g => !g.deleted_at));
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Stats calculation
  const totalRecruitedStudents = profiles.reduce((acc, p) => acc + (p.recruitedCount || 0), 0);
  const activeAmbassadorsCount = profiles.filter(p => p.status === 'active' || p.status === 'approved').length;
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const distinctSchoolsCount = new Set(profiles.map(p => p.school.toLowerCase())).size;

  // Application Actions
  const handleUpdateAppStatus = async (appId: string, status: 'approved' | 'rejected' | 'active' | 'suspended') => {
    await updateApplicationStatus(appId, status, reviewNotes, assignLevel);
    
    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `Updated Ambassador Application status to ${status}`,
      'ambassador',
      `Application ID ${appId} assigned tier ${assignLevel}`,
      appId,
      selectedApp?.fullName || 'Applicant'
    );

    setSelectedApp(null);
    setReviewNotes('');
    toast.success(`Application updated to ${status}`);
    loadAll();
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    await saveAmbassadorProfile(editingProfile);

    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      'Saved Ambassador Profile',
      'ambassador',
      `Ambassador: ${editingProfile.name}, School: ${editingProfile.school}`,
      editingProfile.id,
      editingProfile.name
    );

    setShowProfileModal(false);
    setEditingProfile(null);
    toast.success('Ambassador profile saved successfully');
    loadAll();
  };

  // Toggle Suspend Status
  const handleToggleSuspend = async (prof: AmbassadorProfile) => {
    const newStatus: AmbassadorApplicationStatus = prof.status === 'suspended' ? 'active' : 'suspended';
    const updated = { ...prof, status: newStatus };
    await saveAmbassadorProfile(updated);

    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `${newStatus === 'suspended' ? 'Suspended' : 'Reactivated'} Ambassador: ${prof.name}`,
      'ambassador',
      `Ambassador status changed to ${newStatus}`,
      prof.id,
      prof.name
    );

    toast.success(`Ambassador ${prof.name} is now ${newStatus}`);
    loadAll();
  };

  // Delete Ambassador Execution
  const handleConfirmDeleteAmbassador = async () => {
    if (!deletingProfile) return;
    
    await deleteAmbassadorProfile(deletingProfile.id);

    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `Admin deleted Student Ambassador: ${deletingProfile.name}`,
      'ambassador',
      `Removed profile, referral code (${deletingProfile.referralCode}), stats, and activities. Student account remains safe.`,
      deletingProfile.id,
      deletingProfile.name
    );

    toast.success(`Student ambassador ${deletingProfile.name} deleted.`);
    setDeletingProfile(null);
    setSelectedProfileIds(prev => prev.filter(id => id !== deletingProfile.id));
    loadAll();
  };

  // Bulk Actions
  const handleSelectAllProfiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProfileIds(filteredProfs.map(p => p.id));
    } else {
      setSelectedProfileIds([]);
    }
  };

  const handleToggleSelectProfile = (id: string) => {
    setSelectedProfileIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkSuspend = async () => {
    if (selectedProfileIds.length === 0) return;
    for (const id of selectedProfileIds) {
      const prof = profiles.find(p => p.id === id);
      if (prof) {
        await saveAmbassadorProfile({ ...prof, status: 'suspended' });
      }
    }
    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `Bulk Suspended ${selectedProfileIds.length} Student Ambassadors`,
      'ambassador',
      `Suspended profile IDs: ${selectedProfileIds.join(', ')}`,
      undefined,
      'Multiple Ambassadors',
      selectedProfileIds.length
    );
    toast.success(`Suspended ${selectedProfileIds.length} ambassadors`);
    setSelectedProfileIds([]);
    loadAll();
  };

  const handleBulkDeleteDemo = async () => {
    const demoToDel = profiles.filter(p => selectedProfileIds.includes(p.id) && (p.is_demo || p.id.startsWith('amb-')));
    if (demoToDel.length === 0) {
      toast.error('No selected items are demo records.');
      return;
    }
    for (const p of demoToDel) {
      await deleteAmbassadorProfile(p.id);
    }
    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `Bulk Deleted ${demoToDel.length} Demo Ambassador Records`,
      'ambassador',
      `Deleted demo profile IDs: ${demoToDel.map(d => d.id).join(', ')}`,
      undefined,
      'Demo Ambassadors',
      demoToDel.length
    );
    toast.success(`Deleted ${demoToDel.length} demo ambassador records.`);
    setSelectedProfileIds([]);
    loadAll();
  };

  const handleExportData = () => {
    const exportList = selectedProfileIds.length > 0 
      ? profiles.filter(p => selectedProfileIds.includes(p.id))
      : profiles;

    const headers = ['ID', 'Name', 'School', 'Region', 'Class', 'Level', 'Referral Code', 'Recruited Students', 'Status', 'Created At'];
    const rows = exportList.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.school}"`,
      `"${p.region}"`,
      `"${p.classLevel}"`,
      p.level,
      p.referralCode,
      p.recruitedCount,
      p.status,
      p.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edulpha_ambassadors_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${exportList.length} ambassador records to CSV.`);
  };

  // Gallery Save
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = {
      ...newGalleryItem,
      id: newGalleryItem.id || 'gal-' + Date.now()
    };
    await saveAmbassadorGalleryItem(itemToSave);
    setShowGalleryModal(false);
    toast.success('Gallery item saved.');
    loadAll();
  };

  // Gallery Delete
  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Delete gallery item?')) return;
    await deleteAmbassadorGalleryItem(id);
    toast.success('Gallery item deleted.');
    loadAll();
  };

  // Filtered Applications
  const filteredApps = applications.filter(a => {
    const matchesStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
    const matchesSearch = a.fullName.toLowerCase().includes(appSearch.toLowerCase()) || 
                          a.schoolName.toLowerCase().includes(appSearch.toLowerCase()) ||
                          a.phone.includes(appSearch);
    return matchesStatus && matchesSearch;
  });

  // Filtered Profiles
  const filteredProfs = profiles.filter(p => {
    return p.name.toLowerCase().includes(profSearch.toLowerCase()) ||
           p.school.toLowerCase().includes(profSearch.toLowerCase()) ||
           p.referralCode.toLowerCase().includes(profSearch.toLowerCase());
  });

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="fill-slate-950" /> Student Ambassador Program
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Student Leader & Referral Management
          </h2>
          <p className="text-slate-300 text-xs md:text-sm font-medium">
            Manage secondary school student ambassador profiles, referral performance, bulk administrative actions, and applications.
          </p>
        </div>

        <button 
          onClick={loadAll}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 shrink-0 border border-slate-700"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'profiles', label: '🎓 Ambassador Profiles', badge: profiles.length },
          { id: 'applications', label: '📝 Applications', badge: pendingAppsCount },
          { id: 'overview', label: '📊 Stats & Leaderboard', badge: null },
          { id: 'gallery', label: '🖼️ Gallery Items', badge: gallery.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shrink-0 ${
              activeSubTab === tab.id 
                ? 'bg-amber-400 text-slate-950 shadow-md' 
                : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILES MANAGEMENT WITH TABLE & BULK ACTIONS */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, school, referral code..."
                value={profSearch}
                onChange={e => setProfSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setEditingProfile({
                    id: 'amb-' + Date.now(),
                    name: '',
                    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                    school: '',
                    schoolLocation: '',
                    region: 'South West Region',
                    classLevel: 'Lower Sixth',
                    level: 'bronze',
                    bio: '',
                    referralCode: 'EDU-AMB-' + Math.floor(100 + Math.random() * 899),
                    recruitedCount: 0,
                    status: 'active',
                    featured: false,
                    subjects: ['Mathematics'],
                    createdAt: new Date().toISOString()
                  });
                  setShowProfileModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shrink-0 shadow-lg"
              >
                <Plus size={16} />
                <span>Add Ambassador</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions Toolbar Banner */}
          {selectedProfileIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-950 border border-indigo-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black">
                  {selectedProfileIds.length}
                </span>
                <span>Ambassador(s) Selected</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkSuspend}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Ban size={14} />
                  <span>Suspend Selected</span>
                </button>

                <button
                  onClick={handleBulkDeleteDemo}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete Selected Demo Records</span>
                </button>
              </div>
            </div>
          )}

          {/* Student Ambassadors Data Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={filteredProfs.length > 0 && selectedProfileIds.length === filteredProfs.length}
                        onChange={handleSelectAllProfiles}
                        className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0"
                      />
                    </th>
                    <th className="p-3">Profile & Name</th>
                    <th className="p-3">School & Location</th>
                    <th className="p-3">Region & Class</th>
                    <th className="p-3">Level Tier</th>
                    <th className="p-3">Referral Code</th>
                    <th className="p-3">Recruited</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProfs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500">
                        No student ambassador profiles found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredProfs.map(prof => (
                      <tr key={prof.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedProfileIds.includes(prof.id)}
                            onChange={() => handleToggleSelectProfile(prof.id)}
                            className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={prof.photo} alt={prof.name} className="w-10 h-10 rounded-xl object-cover border border-amber-400" />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{prof.name}</span>
                                {prof.is_demo && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-amber-400 font-mono">DEMO</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">{prof.subjects.slice(0, 2).join(', ')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{prof.school}</div>
                          <div className="text-[10px] text-slate-400">{prof.schoolLocation}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-amber-300">{prof.classLevel}</div>
                          <div className="text-[10px] text-slate-400">{prof.region}</div>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={prof.level === 'gold' ? 'warning' : prof.level === 'silver' ? 'neutral' : 'info'}
                            className="uppercase text-[10px]"
                          >
                            {prof.level}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">{prof.referralCode}</td>
                        <td className="p-3 font-black text-emerald-400 text-sm">{prof.recruitedCount}</td>
                        <td className="p-3">
                          <Badge 
                            variant={prof.status === 'active' || prof.status === 'approved' ? 'success' : prof.status === 'suspended' ? 'danger' : 'warning'}
                            className="uppercase text-[10px]"
                          >
                            {prof.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              title="View Profile"
                              onClick={() => setViewingProfile(prof)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            >
                              <Eye size={13} />
                            </button>

                            <button
                              title="Edit Profile"
                              onClick={() => { setEditingProfile(prof); setShowProfileModal(true); }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition"
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              title={prof.status === 'suspended' ? 'Re-activate' : 'Suspend'}
                              onClick={() => handleToggleSuspend(prof)}
                              className={`p-1.5 rounded-lg transition ${
                                prof.status === 'suspended' ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900' : 'bg-amber-950 text-amber-300 hover:bg-amber-900'
                              }`}
                            >
                              <Ban size={13} />
                            </button>

                            <button
                              title="Delete Student Ambassador"
                              onClick={() => setDeletingProfile(prof)}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: APPLICATIONS */}
      {activeSubTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search applicant name, school, phone..."
                value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={appStatusFilter}
              onChange={e => setAppStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Applicant</th>
                    <th className="p-3">School & Class</th>
                    <th className="p-3">Contacts</th>
                    <th className="p-3">Weekly Commitment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredApps.map(app => (
                    <tr key={app.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{app.fullName}</div>
                        <div className="text-[10px] text-slate-400">{app.gender} • {app.location}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{app.schoolName}</div>
                        <div className="text-[10px] text-amber-300">{app.classLevel} • {app.region}</div>
                      </td>
                      <td className="p-3 text-[11px]">
                        <div>📞 {app.phone}</div>
                        <div className="text-emerald-400">💬 {app.whatsapp}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{app.weeklyHours}</td>
                      <td className="p-3">
                        <Badge 
                          variant={app.status === 'approved' || app.status === 'active' ? 'success' : app.status === 'pending' ? 'warning' : 'danger'}
                          className="uppercase text-[10px]"
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => { setSelectedApp(app); setAssignLevel('bronze'); setReviewNotes(''); }}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & LEADERBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Recruited Students</span>
                <Users size={20} className="text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{totalRecruitedStudents}</div>
              <p className="text-[11px] text-slate-400">Total student registrations tracked via referral codes</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Ambassadors</span>
                <Trophy size={20} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">{activeAmbassadorsCount}</div>
              <p className="text-[11px] text-slate-400">Student leaders currently active in schools</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Applications</span>
                <Sparkles size={20} className="text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-indigo-400">{pendingAppsCount}</div>
              <p className="text-[11px] text-slate-400">Applications waiting for admin approval</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">School Coverage</span>
                <School size={20} className="text-rose-400" />
              </div>
              <div className="text-3xl font-black text-rose-400">{distinctSchoolsCount}</div>
              <p className="text-[11px] text-slate-400">Distinct high schools represented across regions</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GALLERY MANAGEMENT */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setNewGalleryItem({
                  id: 'gal-' + Date.now(),
                  title: '',
                  description: '',
                  imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
                  category: 'school_activity',
                  school: '',
                  date: new Date().toISOString().split('T')[0]
                });
                setShowGalleryModal(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add Event Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map(item => (
              <div key={item.id} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-white">
                <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-2xl" />
                <div>
                  <Badge variant="neutral" className="uppercase text-[10px] mb-1">{item.category}</Badge>
                  <h4 className="font-black text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>{item.school}</span>
                  <button onClick={() => handleDeleteGallery(item.id)} className="text-rose-400 hover:text-rose-300 font-bold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELETE STUDENT AMBASSADOR CONFIRMATION MODAL */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Delete Student Ambassador</h3>
                <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">Confirm Permanent Deletion</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <p className="font-extrabold text-rose-200 text-sm">
                Are you sure you want to permanently delete this student ambassador?
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-white font-bold">{deletingProfile.name}</div>
                <div className="text-slate-400">{deletingProfile.school} • {deletingProfile.classLevel}</div>
                <div className="text-amber-400 font-mono">Code: {deletingProfile.referralCode}</div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                This will delete the ambassador profile, application, referral code, statistics, and activities. Unrelated student accounts will remain completely safe.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProfile(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAmbassador}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
              >
                Permanently Delete Ambassador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <button onClick={() => setViewingProfile(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400">✕</button>

            <div className="flex items-center gap-4">
              <img src={viewingProfile.photo} alt={viewingProfile.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400" />
              <div>
                <h3 className="text-xl font-black text-white">{viewingProfile.name}</h3>
                <div className="text-xs font-bold text-amber-300">{viewingProfile.school} • {viewingProfile.classLevel}</div>
                <div className="text-[11px] text-slate-400">{viewingProfile.region}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div><span className="text-slate-400">Referral Code:</span> <span className="font-mono font-bold text-amber-400">{viewingProfile.referralCode}</span></div>
              <div><span className="text-slate-400">Recruited Students:</span> <span className="font-bold text-emerald-400">{viewingProfile.recruitedCount}</span></div>
              <div><span className="text-slate-400">Level Tier:</span> <span className="font-bold text-white uppercase">{viewingProfile.level}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className="font-bold text-white uppercase">{viewingProfile.status}</span></div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Bio / Motivation</div>
              <p className="p-3 rounded-xl bg-slate-950 text-slate-300 text-xs leading-relaxed">{viewingProfile.bio}</p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setViewingProfile(null)} className="px-5 py-2 bg-slate-800 rounded-xl text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD AMBASSADOR PROFILE MODAL */}
      {showProfileModal && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl my-8">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400">✕</button>

            <h3 className="text-xl font-black text-white">Save Student Ambassador Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingProfile.name}
                  onChange={e => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">School</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.school}
                    onChange={e => setEditingProfile({ ...editingProfile, school: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Class Level</label>
                  <select
                    value={editingProfile.classLevel}
                    onChange={e => setEditingProfile({ ...editingProfile, classLevel: e.target.value as AmbassadorClassLevel })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                    <option value="Form 5">Form 5</option>
                    <option value="Lower Sixth">Lower Sixth</option>
                    <option value="Upper Sixth">Upper Sixth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Region</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.region}
                    onChange={e => setEditingProfile({ ...editingProfile, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tier Level</label>
                  <select
                    value={editingProfile.level}
                    onChange={e => setEditingProfile({ ...editingProfile, level: e.target.value as AmbassadorLevel })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Referral Code</label>
                <input
                  type="text"
                  required
                  value={editingProfile.referralCode}
                  onChange={e => setEditingProfile({ ...editingProfile, referralCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Bio / Introduction</label>
                <textarea
                  rows={2}
                  value={editingProfile.bio}
                  onChange={e => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-400 text-slate-950 font-black rounded-xl">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW APPLICATION DRAWER MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl my-8">
            <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">✕</button>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Review Application</div>
              <h3 className="text-2xl font-black text-white">{selectedApp.fullName}</h3>
              <p className="text-xs text-slate-400">{selectedApp.schoolName} • {selectedApp.classLevel} • {selectedApp.region}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div><span className="text-slate-400">Phone:</span> <span className="font-bold text-white">{selectedApp.phone}</span></div>
              <div><span className="text-slate-400">WhatsApp:</span> <span className="font-bold text-emerald-400">{selectedApp.whatsapp}</span></div>
              <div><span className="text-slate-400">Gender & DOB:</span> <span className="font-bold text-white">{selectedApp.gender} ({selectedApp.dob})</span></div>
              <div><span className="text-slate-400">Weekly Hours:</span> <span className="font-bold text-amber-300">{selectedApp.weeklyHours}</span></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="font-bold text-amber-400 mb-1">Why apply:</div>
                <p className="p-3 rounded-xl bg-slate-950 text-slate-300 leading-relaxed">{selectedApp.motivationWhy}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assign Level Tier:</label>
                  <select
                    value={assignLevel}
                    onChange={e => setAssignLevel(e.target.value as AmbassadorLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="bronze">Bronze Ambassador</option>
                    <option value="silver">Silver Ambassador</option>
                    <option value="gold">Gold Ambassador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Review Notes:</label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="e.g. Approved after phone interview"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'rejected')}
                  className="px-5 py-2.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'approved')}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg"
                >
                  Approve & Generate Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
