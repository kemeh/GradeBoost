import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, Plus, Search, CheckCircle2, XCircle, Trash2, Edit, Eye, 
  ExternalLink, Image, FileText, Check, ShieldCheck, Star, Sparkles, Filter, AlertCircle, RefreshCw, Ban, Download, AlertTriangle
} from 'lucide-react';
import { AlumniProfile, AlumniGalleryItem, AlumniApplication, AlumniStats } from '../../types/alumni';
import { AlumniService } from '../../services/alumniService';
import { logAdminAction } from '../../services/auditLogService';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

export function AdminAlumniManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profiles' | 'gallery' | 'applications' | 'stats'>('profiles');
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [gallery, setGallery] = useState<AlumniGalleryItem[]>([]);
  const [applications, setApplications] = useState<AlumniApplication[]>([]);
  const [stats, setStats] = useState<AlumniStats>({
    totalMembers: 75,
    partnerUniversities: 18,
    studentsMentored: 1250,
    impactRate: '98.5%'
  });
  const [loading, setLoading] = useState(true);

  // Selection & Bulk Actions State
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subSystemFilter, setSubSystemFilter] = useState<string>('all');

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<AlumniProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<AlumniProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<AlumniProfile | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
    graduationYear: 2022,
    school: '',
    subSystem: 'General Education' as AlumniProfile['subSystem'],
    currentRole: '',
    companyOrUniversity: '',
    specialization: '',
    location: '',
    level: 'Gold Alumni Leader',
    studentsRecruited: 12,
    bio: '',
    badgesRaw: 'Alumni Leader, Mentor',
    linkedin: '',
    consentGranted: true,
    status: 'approved' as AlumniProfile['status'],
    featured: false
  });

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Summit' as AlumniGalleryItem['category'],
    displayOrder: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, gData, aData, sData] = await Promise.all([
        AlumniService.getAllAlumniProfiles(),
        AlumniService.getAlumniGallery(),
        AlumniService.getApplications(),
        AlumniService.getAlumniStats()
      ]);
      setProfiles(pData.filter(p => !p.deleted_at));
      setGallery(gData.filter(g => !g.deleted_at));
      setApplications(aData.filter(a => !a.deleted_at));
      setStats(sData);
    } catch (err) {
      console.error('Error loading alumni admin data:', err);
      toast.error('Could not load data from server.');
    } finally {
      setLoading(false);
    }
  };

  // --- PROFILE HANDLERS ---
  const handleOpenProfileModal = (prof?: AlumniProfile) => {
    if (prof) {
      setEditingProfile(prof);
      setProfileForm({
        name: prof.name,
        email: prof.email || '',
        phone: prof.phone || '',
        photoUrl: prof.photoUrl,
        graduationYear: typeof prof.graduationYear === 'number' ? prof.graduationYear : parseInt(prof.graduationYear) || 2022,
        school: prof.school,
        subSystem: prof.subSystem,
        currentRole: prof.currentRole,
        companyOrUniversity: prof.companyOrUniversity,
        specialization: prof.specialization,
        location: prof.location || 'Douala, Cameroon',
        level: prof.level || 'Gold Alumni Leader',
        studentsRecruited: prof.studentsRecruited || 12,
        bio: prof.bio,
        badgesRaw: prof.badges ? prof.badges.join(', ') : 'Alumni Leader',
        linkedin: prof.socialLinks?.linkedin || '',
        consentGranted: prof.consentGranted,
        status: prof.status,
        featured: prof.featured
      });
    } else {
      setEditingProfile(null);
      setProfileForm({
        name: '',
        email: '',
        phone: '',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        graduationYear: 2022,
        school: 'Bilingual Grammar School Molyko',
        subSystem: 'General Education',
        currentRole: 'Senior Software Engineer',
        companyOrUniversity: 'University of Buea / Tech Firm',
        specialization: 'Computer Engineering',
        location: 'Yaoundé, Cameroon',
        level: 'Gold Alumni Leader',
        studentsRecruited: 15,
        bio: 'Passionate about mentoring high school GCE candidates.',
        badgesRaw: 'Alumni Leader, Mentor',
        linkedin: '',
        consentGranted: true,
        status: 'approved',
        featured: false
      });
    }
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.school || !profileForm.currentRole) {
      toast.error('Please fill in required profile fields (Name, School, Role).');
      return;
    }

    const badges = profileForm.badgesRaw.split(',').map(b => b.trim()).filter(Boolean);
    const profilePayload: Omit<AlumniProfile, 'id' | 'createdAt'> = {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      photoUrl: profileForm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      graduationYear: profileForm.graduationYear,
      school: profileForm.school,
      subSystem: profileForm.subSystem,
      currentRole: profileForm.currentRole,
      companyOrUniversity: profileForm.companyOrUniversity,
      specialization: profileForm.specialization,
      location: profileForm.location,
      level: profileForm.level,
      studentsRecruited: profileForm.studentsRecruited,
      bio: profileForm.bio,
      badges,
      socialLinks: profileForm.linkedin ? { linkedin: profileForm.linkedin } : {},
      consentGranted: profileForm.consentGranted,
      status: profileForm.status,
      featured: profileForm.featured
    };

    try {
      if (editingProfile) {
        await AlumniService.updateAlumniProfile(editingProfile.id, profilePayload);
        await logAdminAction(
          user?.email || 'admin@edulpha.cm',
          user?.displayName || 'Admin',
          `Updated Alumni Profile: ${profileForm.name}`,
          'alumni',
          `Updated details for alumni member ${profileForm.name}`,
          editingProfile.id,
          profileForm.name
        );
        toast.success('Alumni profile updated!');
      } else {
        const newId = await AlumniService.createAlumniProfile(profilePayload);
        await logAdminAction(
          user?.email || 'admin@edulpha.cm',
          user?.displayName || 'Admin',
          `Created Alumni Profile: ${profileForm.name}`,
          'alumni',
          `Added new alumni profile with ID ${newId}`,
          newId,
          profileForm.name
        );
        toast.success('New alumni profile created!');
      }
      setShowProfileModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving alumni profile:', err);
      toast.error('Failed to save profile.');
    }
  };

  const handleToggleSuspend = async (prof: AlumniProfile) => {
    const newStatus: AlumniProfile['status'] = prof.status === 'suspended' ? 'approved' : 'suspended';
    await AlumniService.updateAlumniProfile(prof.id, { status: newStatus });

    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `${newStatus === 'suspended' ? 'Suspended' : 'Approved'} Alumni Profile: ${prof.name}`,
      'alumni',
      `Changed status of alumni member ${prof.name} to ${newStatus}`,
      prof.id,
      prof.name
    );

    toast.success(`Alumni member ${prof.name} is now ${newStatus}.`);
    loadData();
  };

  const handleConfirmDeleteAlumni = async () => {
    if (!deletingProfile) return;
    try {
      await AlumniService.deleteAlumniProfile(deletingProfile.id);

      await logAdminAction(
        user?.email || 'admin@edulpha.cm',
        user?.displayName || 'Admin',
        `Admin removed alumni member: ${deletingProfile.name}`,
        'alumni',
        `Removed alumni profile, application, referral records, achievements, and gallery connections. Main user account preserved.`,
        deletingProfile.id,
        deletingProfile.name
      );

      toast.success(`Alumni profile for ${deletingProfile.name} removed successfully.`);
      setDeletingProfile(null);
      setSelectedProfileIds(prev => prev.filter(id => id !== deletingProfile.id));
      loadData();
    } catch (err) {
      console.error('Error deleting alumni:', err);
      toast.error('Failed to delete alumni profile.');
    }
  };

  const handleToggleFeatured = async (prof: AlumniProfile) => {
    try {
      await AlumniService.updateAlumniProfile(prof.id, { featured: !prof.featured });
      toast.success(prof.featured ? 'Removed from featured list.' : 'Set as featured alumni leader!');
      loadData();
    } catch (err) {
      toast.error('Failed to update featured status.');
    }
  };

  // --- BULK ACTIONS ---
  const handleSelectAllProfiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProfileIds(filteredProfiles.map(p => p.id));
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
      await AlumniService.updateAlumniProfile(id, { status: 'suspended' });
    }
    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `Bulk Suspended ${selectedProfileIds.length} Alumni Members`,
      'alumni',
      `Suspended profile IDs: ${selectedProfileIds.join(', ')}`,
      undefined,
      'Multiple Alumni',
      selectedProfileIds.length
    );
    toast.success(`Suspended ${selectedProfileIds.length} alumni members.`);
    setSelectedProfileIds([]);
    loadData();
  };

  const handleBulkDelete = async () => {
    if (selectedProfileIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProfileIds.length} selected alumni profiles?`)) return;

    for (const id of selectedProfileIds) {
      await AlumniService.deleteAlumniProfile(id);
    }

    await logAdminAction(
      user?.email || 'admin@edulpha.cm',
      user?.displayName || 'Admin',
      `Bulk Deleted ${selectedProfileIds.length} Alumni Records`,
      'alumni',
      `Deleted alumni IDs: ${selectedProfileIds.join(', ')}`,
      undefined,
      'Multiple Alumni',
      selectedProfileIds.length
    );

    toast.success(`Deleted ${selectedProfileIds.length} alumni profiles.`);
    setSelectedProfileIds([]);
    loadData();
  };

  const handleExportCSV = () => {
    const list = selectedProfileIds.length > 0
      ? profiles.filter(p => selectedProfileIds.includes(p.id))
      : profiles;

    const headers = ['ID', 'Name', 'University / Company', 'Specialization', 'School', 'SubSystem', 'Role', 'Status', 'Created At'];
    const rows = list.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.companyOrUniversity}"`,
      `"${p.specialization}"`,
      `"${p.school}"`,
      `"${p.subSystem}"`,
      `"${p.currentRole}"`,
      p.status,
      p.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edulpha_alumni_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${list.length} alumni records to CSV.`);
  };

  // Filtered Profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.companyOrUniversity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSub = subSystemFilter === 'all' || p.subSystem === subSystemFilter;
    return matchesSearch && matchesStatus && matchesSub;
  });

  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Award size={16} />
            Edulpha Community & Leadership
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Alumni Program Administration</h2>
          <p className="text-xs text-slate-300 font-medium">
            Manage public alumni profiles, review applications, inspect mentorship stats, and execute bulk operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button onClick={() => handleOpenProfileModal()} className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs">
            <Plus size={16} className="mr-1.5" /> Add Alumni Leader
          </Button>
        </div>
      </div>

      {/* Admin Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profiles')}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2",
            activeTab === 'profiles'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <Users size={15} />
          <span>Alumni Profiles</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">{profiles.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 relative",
            activeTab === 'applications'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <FileText size={15} />
          <span>Candidate Applications</span>
          {pendingAppsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
              {pendingAppsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2",
            activeTab === 'gallery'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <Image size={15} />
          <span>Gallery Assets</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2",
            activeTab === 'stats'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <Sparkles size={15} />
          <span>Impact Statistics</span>
        </button>
      </div>

      {/* --- TAB 1: PROFILES TABLE WITH ALL REQUIRED FIELDS & BULK ACTIONS --- */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search alumni name, university, role..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedProfileIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-950 border border-indigo-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500 text-white font-black">
                  {selectedProfileIds.length}
                </span>
                <span>Alumni Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkSuspend}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Ban size={14} />
                  <span>Suspend Selected</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
          )}

          {/* Profiles Data Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={filteredProfiles.length > 0 && selectedProfileIds.length === filteredProfiles.length}
                        onChange={handleSelectAllProfiles}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-400 focus:ring-0"
                      />
                    </th>
                    <th className="p-3">Photo & Name</th>
                    <th className="p-3">University / Organization</th>
                    <th className="p-3">Field of Study / Role</th>
                    <th className="p-3">Location & School</th>
                    <th className="p-3">Level / Badges</th>
                    <th className="p-3">Students Mentored</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500">
                        No alumni profiles found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map(prof => (
                      <tr key={prof.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedProfileIds.includes(prof.id)}
                            onChange={() => handleToggleSelectProfile(prof.id)}
                            className="rounded bg-slate-800 border-slate-700 text-indigo-400 focus:ring-0"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={prof.photoUrl} alt={prof.name} className="w-10 h-10 rounded-xl object-cover border border-indigo-400" />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{prof.name}</span>
                                {prof.featured && <Star size={12} className="fill-amber-400 text-amber-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400">{prof.email || prof.subSystem}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{prof.companyOrUniversity}</div>
                          <div className="text-[10px] text-indigo-300">Class of '{prof.graduationYear}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-indigo-300">{prof.specialization}</div>
                          <div className="text-[10px] text-slate-400">{prof.currentRole}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{prof.location || 'Cameroon'}</div>
                          <div className="text-[10px] text-slate-400">{prof.school}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold text-[10px]">
                            {prof.level || prof.badges[0] || 'Alumni Leader'}
                          </span>
                        </td>
                        <td className="p-3 font-black text-emerald-400 text-sm">
                          {prof.studentsRecruited || 12}
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={prof.status === 'approved' ? 'success' : prof.status === 'suspended' ? 'danger' : 'warning'}
                            className="uppercase text-[10px]"
                          >
                            {prof.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              title="View Profile Details"
                              onClick={() => setViewingProfile(prof)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            >
                              <Eye size={13} />
                            </button>

                            <button
                              title="Edit Profile"
                              onClick={() => handleOpenProfileModal(prof)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition"
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              title={prof.status === 'suspended' ? 'Approve' : 'Suspend'}
                              onClick={() => handleToggleSuspend(prof)}
                              className={`p-1.5 rounded-lg transition ${
                                prof.status === 'suspended' ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900' : 'bg-amber-950 text-amber-300 hover:bg-amber-900'
                              }`}
                            >
                              <Ban size={13} />
                            </button>

                            <button
                              title="Remove Alumni Member"
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

      {/* --- DELETE ALUMNI CONFIRMATION MODAL --- */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Remove Alumni Member</h3>
                <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">Confirm Alumni Deletion</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <p className="font-extrabold text-rose-200 text-sm">
                Are you sure you want to remove this alumni member?
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-white font-bold">{deletingProfile.name}</div>
                <div className="text-slate-400">{deletingProfile.companyOrUniversity} • {deletingProfile.specialization}</div>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                <div className="font-bold text-slate-300">This action will remove:</div>
                <div>• Alumni public profile</div>
                <div>• Alumni candidate application</div>
                <div>• Referral & mentorship records</div>
                <div>• Alumni achievements & badges</div>
                <div>• Alumni gallery connection</div>
              </div>
              <p className="text-[11px] text-amber-300/90 italic pt-1 border-t border-slate-800">
                 Note: The person's main Edulpha student/user account will NOT be deleted unless explicitly selected.
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
                onClick={handleConfirmDeleteAlumni}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
              >
                Remove Alumni Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ALUMNI PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <button onClick={() => setViewingProfile(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400">✕</button>

            <div className="flex items-center gap-4">
              <img src={viewingProfile.photoUrl} alt={viewingProfile.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400" />
              <div>
                <h3 className="text-xl font-black text-white">{viewingProfile.name}</h3>
                <div className="text-xs font-bold text-indigo-300">{viewingProfile.companyOrUniversity}</div>
                <div className="text-[11px] text-slate-400">{viewingProfile.specialization} • Class of '{viewingProfile.graduationYear}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div><span className="text-slate-400">Location:</span> <span className="font-bold text-white">{viewingProfile.location || 'Douala, Cameroon'}</span></div>
              <div><span className="text-slate-400">Role / Title:</span> <span className="font-bold text-indigo-300">{viewingProfile.currentRole}</span></div>
              <div><span className="text-slate-400">Level Tier:</span> <span className="font-bold text-white">{viewingProfile.level || 'Gold Alumni Leader'}</span></div>
              <div><span className="text-slate-400">Students Mentored:</span> <span className="font-bold text-emerald-400">{viewingProfile.studentsRecruited || 12}</span></div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Bio / Overview</div>
              <p className="p-3 rounded-xl bg-slate-950 text-slate-300 text-xs leading-relaxed">{viewingProfile.bio}</p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setViewingProfile(null)} className="px-5 py-2 bg-slate-800 rounded-xl text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl my-8">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400">✕</button>

            <h3 className="text-xl font-black text-white">{editingProfile ? 'Edit Alumni Leader Profile' : 'Add New Alumni Leader'}</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">University / Organization</label>
                  <input
                    type="text"
                    required
                    value={profileForm.companyOrUniversity}
                    onChange={e => setProfileForm({ ...profileForm, companyOrUniversity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Field of Study / Specialization</label>
                  <input
                    type="text"
                    required
                    value={profileForm.specialization}
                    onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Current Role / Title</label>
                  <input
                    type="text"
                    required
                    value={profileForm.currentRole}
                    onChange={e => setProfileForm({ ...profileForm, currentRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Bio / Mentorship Overview</label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 font-black text-white rounded-xl">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
