import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, Plus, Search, CheckCircle2, XCircle, Trash2, Edit, Eye, 
  ExternalLink, Image, FileText, Check, ShieldCheck, Star, Sparkles, Filter, AlertCircle, RefreshCw, Ban, Download, AlertTriangle, Linkedin, Phone, Mail, GraduationCap, Building, Clock
} from 'lucide-react';
import { AlumniProfile, AlumniGalleryItem, AlumniApplication, AlumniStats } from '../../types/alumni';
import { AlumniService } from '../../services/alumniService';
import { logAdminAction } from '../../services/auditLogService';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

export function AdminAlumniManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profiles' | 'applications' | 'gallery' | 'stats'>('profiles');
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

  // Search and Filter states for Profiles
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subSystemFilter, setSubSystemFilter] = useState<string>('all');

  // Search and Filter states for Applications
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appSubSystemFilter, setAppSubSystemFilter] = useState<string>('all');

  // Modals for Profiles
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<AlumniProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<AlumniProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<AlumniProfile | null>(null);

  // Modals for Applications
  const [viewingApp, setViewingApp] = useState<AlumniApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<AlumniApplication | null>(null);

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

  // Gallery Form State
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
        `Removed alumni profile from database. Main user account preserved.`,
        deletingProfile.id,
        deletingProfile.name
      );

      toast.success(`Alumni profile for ${deletingProfile.name} removed successfully.`);
      setDeletingProfile(null);
      setSelectedProfileIds(prev => prev.filter(id => id !== deletingProfile.id));
      await loadData();
    } catch (err) {
      console.error('Error deleting alumni:', err);
      toast.error('Failed to delete alumni profile.');
    }
  };

  // --- APPLICATION HANDLERS ---
  const handleApproveApplication = async (app: AlumniApplication) => {
    try {
      await AlumniService.convertApplicationToProfile(app);
      await logAdminAction(
        user?.email || 'admin@edulpha.cm',
        user?.displayName || 'Admin',
        `Approved Alumni Candidate Application: ${app.fullName}`,
        'alumni',
        `Approved application and generated public alumni profile for ${app.fullName}`,
        app.id,
        app.fullName
      );
      toast.success(`Application for ${app.fullName} approved and converted to Alumni Profile!`);
      if (viewingApp?.id === app.id) setViewingApp(null);
      await loadData();
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('Failed to approve application.');
    }
  };

  const handleRejectApplication = async (app: AlumniApplication) => {
    try {
      await AlumniService.updateApplicationStatus(app.id, 'rejected');
      await logAdminAction(
        user?.email || 'admin@edulpha.cm',
        user?.displayName || 'Admin',
        `Rejected Alumni Candidate Application: ${app.fullName}`,
        'alumni',
        `Set candidate application status to rejected for ${app.fullName}`,
        app.id,
        app.fullName
      );
      toast.success(`Application for ${app.fullName} rejected.`);
      if (viewingApp?.id === app.id) setViewingApp(null);
      await loadData();
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('Failed to reject application.');
    }
  };

  const handleConfirmDeleteApplication = async () => {
    if (!deletingApp) return;
    try {
      await AlumniService.deleteApplication(deletingApp.id);
      await logAdminAction(
        user?.email || 'admin@edulpha.cm',
        user?.displayName || 'Admin',
        `Deleted Alumni Candidate Application: ${deletingApp.fullName}`,
        'alumni',
        `Permanently removed candidate application record for ${deletingApp.fullName} (ID: ${deletingApp.id})`,
        deletingApp.id,
        deletingApp.fullName
      );
      toast.success(`Candidate application for ${deletingApp.fullName} permanently deleted.`);
      setDeletingApp(null);
      if (viewingApp?.id === deletingApp.id) setViewingApp(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting application:', err);
      toast.error('Failed to delete application from database.');
    }
  };

  // --- GALLERY & STATS HANDLERS ---
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.imageUrl) {
      toast.error('Title and Image URL are required.');
      return;
    }
    try {
      await AlumniService.addGalleryItem({
        title: galleryForm.title,
        description: galleryForm.description,
        imageUrl: galleryForm.imageUrl,
        category: galleryForm.category,
        displayOrder: Number(galleryForm.displayOrder) || 1
      });
      toast.success('Gallery item added!');
      setShowGalleryModal(false);
      setGalleryForm({ title: '', description: '', imageUrl: '', category: 'Summit', displayOrder: 1 });
      await loadData();
    } catch (err) {
      toast.error('Failed to add gallery item.');
    }
  };

  const handleDeleteGalleryItem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete gallery asset "${title}"?`)) return;
    try {
      await AlumniService.deleteGalleryItem(id);
      toast.success('Gallery asset removed.');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete gallery item.');
    }
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AlumniService.saveAlumniStats(stats);
      toast.success('Alumni impact statistics updated successfully!');
      await loadData();
    } catch (err) {
      toast.error('Failed to save statistics.');
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
    await loadData();
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
    await loadData();
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
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(queryLower) ||
      (p.school || '').toLowerCase().includes(queryLower) ||
      (p.currentRole || '').toLowerCase().includes(queryLower) ||
      (p.companyOrUniversity || '').toLowerCase().includes(queryLower);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSub = subSystemFilter === 'all' || p.subSystem === subSystemFilter;
    return matchesSearch && matchesStatus && matchesSub;
  });

  // Filtered Applications
  const filteredApplications = applications.filter(a => {
    const queryLower = appSearchQuery.toLowerCase();
    const matchesSearch = 
      (a.fullName || '').toLowerCase().includes(queryLower) ||
      (a.email || '').toLowerCase().includes(queryLower) ||
      (a.school || '').toLowerCase().includes(queryLower) ||
      (a.companyOrUniversity || '').toLowerCase().includes(queryLower) ||
      (a.currentRole || '').toLowerCase().includes(queryLower);
    const matchesStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
    const matchesSub = appSubSystemFilter === 'all' || a.subSystem === appSubSystemFilter;
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
            Manage public alumni profiles, review candidate applications, manage gallery assets, and inspect mentorship stats.
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
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-black",
            pendingAppsCount > 0 ? "bg-amber-500 text-white animate-pulse" : "bg-slate-700 text-slate-300"
          )}>
            {applications.length}
          </span>
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
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">{gallery.length}</span>
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

      {/* ========================================================= */}
      {/* TAB 1: ALUMNI PROFILES TABLE */}
      {/* ========================================================= */}
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
                      <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
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
                            <img src={prof.photoUrl} alt={prof.name} className="w-10 h-10 rounded-xl object-cover border border-indigo-400 shrink-0" />
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

      {/* ========================================================= */}
      {/* TAB 2: CANDIDATE APPLICATIONS MANAGEMENT VIEW */}
      {/* ========================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Header Controls for Applications */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={appSearchQuery}
                onChange={e => setAppSearchQuery(e.target.value)}
                placeholder="Search candidate name, email, school..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={appStatusFilter}
                onChange={e => setAppStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                <option value="all">All Application Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={appSubSystemFilter}
                onChange={e => setAppSubSystemFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                <option value="all">All Sub-Systems</option>
                <option value="General Education">General Education</option>
                <option value="Baccalauréat & French Sub-System">Baccalauréat & French Sub-System</option>
                <option value="Technical & TVEE">Technical & TVEE</option>
                <option value="Commercial Education">Commercial Education</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Candidate & Contact</th>
                    <th className="p-3">School & Sub-System</th>
                    <th className="p-3">Role & Company/Uni</th>
                    <th className="p-3">Specialization</th>
                    <th className="p-3">Graduation</th>
                    <th className="p-3">Consent</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-500 font-medium">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                            <FileText size={24} />
                          </div>
                          <div className="font-bold text-white text-sm">No Candidate Applications Found</div>
                          <p className="text-xs text-slate-400">
                            Candidate applications submitted by alumni leaders from the public portal or student dashboard will appear here. No applications currently match your filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{app.fullName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{app.email}</span>
                            {app.phone && <span>• {app.phone}</span>}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{app.school}</div>
                          <div className="text-[10px] text-indigo-300">{app.subSystem}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{app.currentRole}</div>
                          <div className="text-[10px] text-slate-400">{app.companyOrUniversity}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-indigo-300">{app.specialization}</div>
                        </td>

                        <td className="p-3 font-bold text-slate-200">
                          {app.graduationYear}
                        </td>

                        <td className="p-3">
                          {app.consentGranted ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              Granted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <Badge 
                            variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                            className="uppercase text-[10px]"
                          >
                            {app.status}
                          </Badge>
                        </td>

                        <td className="p-3 text-[10px] text-slate-400 font-mono">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              title="View Application Details"
                              onClick={() => setViewingApp(app)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            >
                              <Eye size={13} />
                            </button>

                            {app.status !== 'approved' && (
                              <button
                                title="Approve & Convert to Public Alumni Profile"
                                onClick={() => handleApproveApplication(app)}
                                className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 transition"
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            )}

                            {app.status !== 'rejected' && (
                              <button
                                title="Reject Application"
                                onClick={() => handleRejectApplication(app)}
                                className="p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 transition"
                              >
                                <Ban size={13} />
                              </button>
                            )}

                            <button
                              title="Delete Candidate Application"
                              onClick={() => setDeletingApp(app)}
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

      {/* ========================================================= */}
      {/* TAB 3: GALLERY ASSETS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-base font-black text-white">Alumni Gallery Assets</h3>
              <p className="text-xs text-slate-400">Photo event records displayed in the public alumni portal.</p>
            </div>
            <Button onClick={() => setShowGalleryModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold">
              <Plus size={14} className="mr-1" /> Add Gallery Asset
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
                No gallery assets found.
              </div>
            ) : (
              gallery.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 group hover:border-indigo-500/50 transition">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">Order: {item.displayOrder}</span>
                    <button
                      onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-rose-950/50 text-rose-300 hover:bg-rose-900 transition text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: IMPACT STATISTICS */}
      {/* ========================================================= */}
      {activeTab === 'stats' && (
        <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 text-white space-y-6">
          <div>
            <h3 className="text-lg font-black text-white">Public Alumni Impact Metrics</h3>
            <p className="text-xs text-slate-400">Configure global statistics displayed on the public Alumni Program homepage.</p>
          </div>

          <form onSubmit={handleSaveStats} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Total Alumni Members</label>
                <input
                  type="number"
                  value={stats.totalMembers}
                  onChange={e => setStats({ ...stats, totalMembers: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Partner Universities / Firms</label>
                <input
                  type="number"
                  value={stats.partnerUniversities}
                  onChange={e => setStats({ ...stats, partnerUniversities: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Students Mentored Annually</label>
                <input
                  type="number"
                  value={stats.studentsMentored}
                  onChange={e => setStats({ ...stats, studentsMentored: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Impact Rate %</label>
                <input
                  type="text"
                  value={stats.impactRate}
                  onChange={e => setStats({ ...stats, impactRate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm"
                />
              </div>
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-black text-xs px-6 py-3">
              Save Impact Metrics
            </Button>
          </form>
        </Card>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE CANDIDATE APPLICATION */}
      {/* ========================================================= */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Delete Candidate Application</h3>
                <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">Confirm Candidate Removal</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <p className="font-extrabold text-rose-200 text-sm">
                Are you sure you want to permanently delete this candidate application from the database?
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-white font-bold">{deletingApp.fullName}</div>
                <div className="text-slate-400">{deletingApp.school} • {deletingApp.currentRole}</div>
                <div className="text-indigo-300 text-[11px]">{deletingApp.email}</div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                This operation sends a real deletion request to Firestore. Once removed, the application count and candidate view will update immediately across all sessions.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteApplication}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
              >
                Confirm Delete Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW CANDIDATE APPLICATION DETAILS */}
      {/* ========================================================= */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl my-8">
            <button onClick={() => setViewingApp(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition">✕</button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-black uppercase tracking-wider">
                <FileText size={14} /> Candidate Application Details
              </div>
              <h3 className="text-2xl font-black text-white">{viewingApp.fullName}</h3>
              <p className="text-slate-400 text-xs">{viewingApp.currentRole} at {viewingApp.companyOrUniversity}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div><span className="text-slate-400 block">Email Address:</span> <span className="font-bold text-white">{viewingApp.email}</span></div>
              <div><span className="text-slate-400 block">Phone / WhatsApp:</span> <span className="font-bold text-white">{viewingApp.phone || 'N/A'}</span></div>
              <div><span className="text-slate-400 block">School / Lycée:</span> <span className="font-bold text-indigo-300">{viewingApp.school}</span></div>
              <div><span className="text-slate-400 block">Sub-System:</span> <span className="font-bold text-indigo-300">{viewingApp.subSystem}</span></div>
              <div><span className="text-slate-400 block">Graduation Year:</span> <span className="font-bold text-white">{viewingApp.graduationYear}</span></div>
              <div><span className="text-slate-400 block">Specialization:</span> <span className="font-bold text-white">{viewingApp.specialization}</span></div>
              <div><span className="text-slate-400 block">Consent Granted:</span> <span className="font-bold text-emerald-400">{viewingApp.consentGranted ? 'Yes' : 'No'}</span></div>
              <div><span className="text-slate-400 block">Status:</span> <Badge variant={viewingApp.status === 'approved' ? 'success' : viewingApp.status === 'rejected' ? 'danger' : 'warning'} className="uppercase text-[10px] mt-0.5">{viewingApp.status}</Badge></div>
            </div>

            {viewingApp.linkedin && (
              <a
                href={viewingApp.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-indigo-300 text-xs font-bold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Linkedin size={16} />
                  <span>LinkedIn Profile: {viewingApp.linkedin}</span>
                </span>
                <ExternalLink size={14} />
              </a>
            )}

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Motivation Statement</div>
              <p className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs leading-relaxed font-medium">
                "{viewingApp.motivation}"
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => { setDeletingApp(viewingApp); }}
                className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete Application
              </button>

              <div className="flex items-center gap-2">
                {viewingApp.status !== 'rejected' && (
                  <button
                    onClick={() => handleRejectApplication(viewingApp)}
                    className="px-4 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-bold transition"
                  >
                    Reject
                  </button>
                )}

                {viewingApp.status !== 'approved' && (
                  <button
                    onClick={() => handleApproveApplication(viewingApp)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                  >
                    <CheckCircle2 size={14} /> Approve & Convert to Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE ALUMNI PROFILE */}
      {/* ========================================================= */}
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
                Are you sure you want to remove this alumni profile from the database?
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-white font-bold">{deletingProfile.name}</div>
                <div className="text-slate-400">{deletingProfile.companyOrUniversity} • {deletingProfile.specialization}</div>
              </div>
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

      {/* ========================================================= */}
      {/* MODAL: VIEW ALUMNI PROFILE DETAILS */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL: EDIT / CREATE ALUMNI PROFILE */}
      {/* ========================================================= */}
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Field of Study / Specialization</label>
                  <input
                    type="text"
                    required
                    value={profileForm.specialization}
                    onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
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
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 font-black text-white rounded-xl">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD GALLERY ITEM */}
      {/* ========================================================= */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl">
            <button onClick={() => setShowGalleryModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400">✕</button>

            <h3 className="text-xl font-black text-white">Add Alumni Gallery Asset</h3>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Edulpha Alumni Leadership Summit 2025"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={galleryForm.imageUrl}
                  onChange={e => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={galleryForm.category}
                    onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="Summit">Summit</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Mentorship">Mentorship</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={galleryForm.displayOrder}
                    onChange={e => setGalleryForm({ ...galleryForm, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={galleryForm.description}
                  onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 font-black text-white rounded-xl">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
