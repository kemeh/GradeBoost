import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, Plus, Search, CheckCircle2, XCircle, Trash2, Edit, Eye, 
  ExternalLink, Image, FileText, Check, ShieldCheck, Star, Sparkles, Filter, 
  AlertCircle, RefreshCw, Ban, Download, AlertTriangle, Linkedin, Phone, Mail, 
  GraduationCap, Building, Clock, LayoutDashboard, Bell, ChevronDown, Menu, X, 
  MessageSquare, TrendingUp, Send, Settings, UserCheck, Compass, ArrowRight, Share2
} from 'lucide-react';
import { AlumniProfile, AlumniGalleryItem, AlumniApplication, AlumniStats } from '../../types/alumni';
import { AlumniService } from '../../services/alumniService';
import { logAdminAction } from '../../services/auditLogService';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

export function AdminAlumniManagement() {
  const { user } = useAuth();

  // Navigation State (Sidebar Items)
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'profiles' | 'applications' | 'leaders' | 'gallery' | 'stats' | 'messages' | 'settings'
  >('dashboard');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data States
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

  // Selection & Bulk Actions State for Profiles
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subSystemFilter, setSubSystemFilter] = useState<string>('all');

  // Modals for Profiles
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<AlumniProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<AlumniProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<AlumniProfile | null>(null);

  // Modals for Applications
  const [viewingApp, setViewingApp] = useState<AlumniApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<AlumniApplication | null>(null);
  const [deletingAppLoading, setDeletingAppLoading] = useState(false);

  // Profile Form
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

  // Announcement Message Form State
  const [announcementText, setAnnouncementText] = useState('');

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

  // --- DERIVED METRICS ---
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const activeLeadersCount = profiles.filter(p => (p.level && p.level.toLowerCase().includes('leader')) || p.featured).length;
  const totalAlumniCount = profiles.length;

  // Formatting Greeting & Date
  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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
      toast.error('Please fill in required fields (Name, School, Current Role).');
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
      await loadData();
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
    await loadData();
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
        `Removed alumni profile from database.`,
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
    setDeletingAppLoading(true);
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
      const appToDelete = deletingApp;
      setDeletingApp(null);
      if (viewingApp?.id === appToDelete.id) setViewingApp(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting application:', err);
      toast.error('Failed to delete application from database.');
    } finally {
      setDeletingAppLoading(false);
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

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    toast.success('Community announcement dispatched to alumni members!');
    setAnnouncementText('');
  };

  // Bulk Actions for Profiles
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

  // Filtering Profiles
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

  // Filtering Applications
  const filteredApplications = applications.filter(a => {
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (a.fullName || '').toLowerCase().includes(queryLower) ||
      (a.email || '').toLowerCase().includes(queryLower) ||
      (a.school || '').toLowerCase().includes(queryLower) ||
      (a.companyOrUniversity || '').toLowerCase().includes(queryLower) ||
      (a.currentRole || '').toLowerCase().includes(queryLower);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSub = subSystemFilter === 'all' || a.subSystem === subSystemFilter;
    return matchesSearch && matchesStatus && matchesSub;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR (CAREFLOW STYLE) */}
      {/* ========================================================= */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Edulpha</span>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-400 font-bold">Alumni Program</span>
          </div>
        </div>

        {/* Center Search & Right Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs w-64 focus-within:border-indigo-500 transition">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidates, profiles..."
              className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-slate-500 text-xs"
            />
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">Ctrl+K</span>
          </div>

          <button 
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Database"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-400' : ''} />
          </button>

          <button className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
            <Bell size={15} />
            {pendingAppsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          {/* Admin Avatar & Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-xs text-white border border-indigo-400">
              {user?.displayName ? user.displayName.charAt(0) : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-white leading-tight">{user?.displayName || 'Admin Administrator'}</div>
              <div className="text-[10px] text-slate-400">Super Admin</div>
            </div>
            <ChevronDown size={14} className="text-slate-500 hidden md:block" />
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER (LEFT SIDEBAR + CONTENT) */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR (CAREFLOW STYLE) */}
        <aside className={cn(
          "w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-20 shrink-0",
          "absolute md:relative inset-y-0 left-0",
          mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 space-y-6">
            {/* Logo Brand Header */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="font-black text-sm text-white tracking-wider">EDULPHA</div>
                <div className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Alumni Hub</div>
              </div>
            </div>

            {/* Navigation Category */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                WORKSPACE
              </div>

              {/* Nav Link 1: Dashboard Overview */}
              <button
                onClick={() => { setActiveNav('dashboard'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'dashboard' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={16} className={activeNav === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* Nav Link 2: Alumni Profiles */}
              <button
                onClick={() => { setActiveNav('profiles'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'profiles' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Users size={16} className={activeNav === 'profiles' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Alumni Profiles</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black">
                  {totalAlumniCount}
                </span>
              </button>

              {/* Nav Link 3: Candidate Applications */}
              <button
                onClick={() => { setActiveNav('applications'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'applications' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className={activeNav === 'applications' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Candidate Apps</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black transition",
                  pendingAppsCount > 0 ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"
                )}>
                  {pendingAppsCount}
                </span>
              </button>

              {/* Nav Link 4: Alumni Leaders */}
              <button
                onClick={() => { setActiveNav('leaders'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'leaders' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Award size={16} className={activeNav === 'leaders' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Alumni Leaders</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black">
                  {activeLeadersCount}
                </span>
              </button>

              {/* Nav Link 5: Gallery Assets */}
              <button
                onClick={() => { setActiveNav('gallery'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'gallery' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Image size={16} className={activeNav === 'gallery' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Gallery Assets</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black">
                  {gallery.length}
                </span>
              </button>

              {/* Nav Link 6: Impact Statistics */}
              <button
                onClick={() => { setActiveNav('stats'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'stats' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className={activeNav === 'stats' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Impact Stats</span>
                </div>
              </button>

              {/* Nav Link 7: Messages/Announcements */}
              <button
                onClick={() => { setActiveNav('messages'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'messages' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Mail size={16} className={activeNav === 'messages' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Announcements</span>
                </div>
              </button>

              {/* Nav Link 8: Platform Settings */}
              <button
                onClick={() => { setActiveNav('settings'); setMobileSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition group",
                  activeNav === 'settings' 
                    ? "bg-slate-800 text-white border-l-4 border-indigo-500 shadow-md" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings size={16} className={activeNav === 'settings' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Platform Settings</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sidebar Footer Badge */}
          <div className="p-4 border-t border-slate-800 text-center">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-medium">
              Edulpha Alumni Portal v2.4
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT CONTENT WORKSPACE */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* WELCOME GREETING SECTION (CAREFLOW STYLE) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {greetingText}, {user?.displayName ? user.displayName.split(' ')[0] : 'Admin'}
              </h1>
              <p className="text-xs font-semibold text-indigo-400 mt-0.5">{formattedDate}</p>
              <p className="text-xs text-slate-400 mt-1">
                Manage Edulpha's alumni community, applications, leadership programs and impact.
              </p>
            </div>

            <Button 
              onClick={() => handleOpenProfileModal()} 
              className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shrink-0 self-start sm:self-auto"
            >
              <Plus size={15} className="mr-1.5" /> Add Alumni Leader
            </Button>
          </div>

          {/* ========================================================= */}
          {/* 4 PROMINENT KPI STATISTIC CARDS (CAREFLOW EXACT STYLE) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI Card 1: Total Alumni */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Total Alumni
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Users size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {totalAlumniCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">
                Active alumni profiles
              </div>
            </div>

            {/* KPI Card 2: Pending Candidate Applications */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Pending Applications
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                  <FileText size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {pendingAppsCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">
                Applications awaiting review
              </div>
            </div>

            {/* KPI Card 3: Active Alumni Leaders */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Alumni Leaders
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Award size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {activeLeadersCount}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">
                Active community leaders
              </div>
            </div>

            {/* KPI Card 4: Community Impact */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Students Reached
                </span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {stats.studentsMentored ? `${stats.studentsMentored}+` : '25+'}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">
                Total community impact
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CONDITIONAL RENDER BY ACTIVE NAV VIEW */}
          {/* ========================================================= */}

          {/* VIEW 1: MAIN DASHBOARD OVERVIEW */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              
              {/* TWO COLUMN LAYOUT: RECENT APPLICATIONS (LEFT) + OVERVIEW & ACTIVITY (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: RECENT CANDIDATE APPLICATIONS */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-black text-white">Recent Candidate Applications</h3>
                      <p className="text-xs text-slate-400">Latest submissions awaiting administrative review</p>
                    </div>
                    <button 
                      onClick={() => setActiveNav('applications')}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                    >
                      <span>View All Applications</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Candidate Applications Cards List */}
                  <div className="space-y-3">
                    {applications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2">
                        <FileText size={24} className="mx-auto text-slate-600" />
                        <div className="font-bold text-slate-300 text-xs">No pending applications</div>
                        <p className="text-[11px] text-slate-500">
                          New alumni applications will appear here when submitted.
                        </p>
                      </div>
                    ) : (
                      applications.slice(0, 5).map(app => (
                        <div 
                          key={app.id} 
                          className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={app.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'} 
                              alt={app.fullName} 
                              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30 shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-white text-xs flex items-center gap-2">
                                <span>{app.fullName}</span>
                                <Badge 
                                  variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                                  className="text-[9px] uppercase font-bold"
                                >
                                  {app.status}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {app.companyOrUniversity || app.school || 'Alumni Leadership Program'}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Submitted {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setViewingApp(app)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: ALUMNI COMMUNITY OVERVIEW & RECENT ACTIVITY */}
                <div className="space-y-6">
                  
                  {/* Community Overview Card */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-base font-black text-white pb-3 border-b border-slate-800">
                      Alumni Community
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-2.5 text-slate-300 font-semibold">
                          <Users size={15} className="text-indigo-400" />
                          <span>Total Alumni Members</span>
                        </div>
                        <span className="font-black text-white">{totalAlumniCount}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-2.5 text-slate-300 font-semibold">
                          <Award size={15} className="text-emerald-400" />
                          <span>Active Community Leaders</span>
                        </div>
                        <span className="font-black text-white">{activeLeadersCount}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-2.5 text-slate-300 font-semibold">
                          <FileText size={15} className="text-cyan-400" />
                          <span>Pending Applications</span>
                        </div>
                        <span className="font-black text-white">{pendingAppsCount}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-2.5 text-slate-300 font-semibold">
                          <UserCheck size={15} className="text-purple-400" />
                          <span>Approved Members</span>
                        </div>
                        <span className="font-black text-white">
                          {profiles.filter(p => p.status === 'approved').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Alumni Activity Card */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-base font-black text-white pb-3 border-b border-slate-800">
                      Recent Alumni Activity
                    </h3>

                    <div className="space-y-3">
                      {applications.length > 0 ? (
                        applications.slice(0, 3).map((app, idx) => (
                          <div key={app.id || idx} className="flex gap-3 text-xs">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-200">
                                Application submitted by {app.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {idx === 0 ? '2 hours ago' : idx === 1 ? 'Yesterday' : '3 days ago'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-200">System verified alumni database</div>
                            <div className="text-[10px] text-slate-500">Today</div>
                          </div>
                        </div>
                      )}

                      {profiles.slice(0, 2).map((prof, idx) => (
                        <div key={prof.id || idx} className="flex gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-200">
                              Alumni Leader active: {prof.name}
                            </div>
                            <div className="text-[10px] text-slate-500">Active mentor</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* LOWER SECTION: ALUMNI PROFILES SUMMARY */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-white">Featured Alumni Profiles</h3>
                    <p className="text-xs text-slate-400">Public profile cards displayed on the student portal</p>
                  </div>
                  <button 
                    onClick={() => setActiveNav('profiles')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                  >
                    <span>View All Alumni ({totalAlumniCount})</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profiles.slice(0, 4).map(prof => (
                    <div key={prof.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 group hover:border-indigo-500/50 transition">
                      <div className="flex items-center gap-3">
                        <img src={prof.photoUrl} alt={prof.name} className="w-10 h-10 rounded-xl object-cover border border-indigo-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-white text-xs line-clamp-1">{prof.name}</div>
                          <div className="text-[10px] text-indigo-300">{prof.companyOrUniversity}</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {prof.currentRole} • Class of '{prof.graduationYear}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[9px] font-bold">
                          {prof.level || 'Alumni Leader'}
                        </span>
                        <button
                          onClick={() => setViewingProfile(prof)}
                          className="text-[11px] font-bold text-slate-300 hover:text-white transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: ALUMNI PROFILES MANAGEMENT VIEW */}
          {activeNav === 'profiles' && (
            <div className="space-y-6">
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
                  </select>

                  <select
                    value={subSystemFilter}
                    onChange={e => setSubSystemFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
                  >
                    <option value="all">All Sub-Systems</option>
                    <option value="General Education">General Education</option>
                    <option value="Baccalauréat & French Sub-System">Baccalauréat & French</option>
                    <option value="Technical & TVEE">Technical & TVEE</option>
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
                        <th className="p-3">Role / Field</th>
                        <th className="p-3">School</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProfiles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
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
                              <div className="font-semibold text-slate-200">{prof.school}</div>
                            </td>
                            <td className="p-3">
                              <Badge 
                                variant={prof.status === 'approved' ? 'success' : 'danger'}
                                className="uppercase text-[10px]"
                              >
                                {prof.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  title="View Details"
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
                                  className="p-1.5 rounded-lg bg-amber-950 text-amber-300 hover:bg-amber-900 transition"
                                >
                                  <Ban size={13} />
                                </button>
                                <button
                                  title="Delete Profile"
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

          {/* VIEW 3: CANDIDATE APPLICATIONS MANAGEMENT VIEW */}
          {activeNav === 'applications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, email, school..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
                  >
                    <option value="all">All Application Statuses</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Applications Data Table */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Candidate & Contact</th>
                        <th className="p-3">School & Sub-System</th>
                        <th className="p-3">Role & University/Firm</th>
                        <th className="p-3">Specialization</th>
                        <th className="p-3">Graduation</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                            <div className="max-w-md mx-auto space-y-3">
                              <FileText size={32} className="mx-auto text-slate-600" />
                              <div className="font-bold text-white text-sm">No Candidate Applications Found</div>
                              <p className="text-xs text-slate-400">
                                There are currently no candidate applications matching your search query.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map(app => (
                          <tr key={app.id} className="hover:bg-slate-800/50 transition">
                            <td className="p-3">
                              <div className="font-bold text-white">{app.fullName}</div>
                              <div className="text-[10px] text-slate-400">{app.email}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-200">{app.school}</div>
                              <div className="text-[10px] text-indigo-300">{app.subSystem}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-200">{app.currentRole}</div>
                              <div className="text-[10px] text-slate-400">{app.companyOrUniversity}</div>
                            </td>
                            <td className="p-3 font-semibold text-indigo-300">
                              {app.specialization}
                            </td>
                            <td className="p-3 font-bold text-slate-200">
                              {app.graduationYear}
                            </td>
                            <td className="p-3">
                              <Badge 
                                variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                                className="uppercase text-[10px]"
                              >
                                {app.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  title="View Full Application Details"
                                  onClick={() => setViewingApp(app)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                                >
                                  <Eye size={13} />
                                </button>
                                {app.status !== 'approved' && (
                                  <button
                                    title="Approve & Convert to Public Alumni Profile"
                                    onClick={() => handleApproveApplication(app)}
                                    className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 transition"
                                  >
                                    <CheckCircle2 size={13} />
                                  </button>
                                )}
                                {app.status !== 'rejected' && (
                                  <button
                                    title="Reject Application"
                                    onClick={() => handleRejectApplication(app)}
                                    className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 transition"
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

          {/* VIEW 4: ALUMNI LEADERS VIEW */}
          {activeNav === 'leaders' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Active Community Leaders</h3>
                    <p className="text-xs text-slate-400">Featured mentors and active student recruiters</p>
                  </div>
                  <Button onClick={() => handleOpenProfileModal()} className="bg-indigo-600 text-xs font-bold">
                    <Plus size={14} className="mr-1" /> Add Leader
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profiles.filter(p => (p.level && p.level.toLowerCase().includes('leader')) || p.featured).map(prof => (
                    <div key={prof.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={prof.photoUrl} alt={prof.name} className="w-12 h-12 rounded-xl object-cover border border-indigo-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white text-xs">{prof.name}</div>
                          <div className="text-[10px] text-indigo-300">{prof.companyOrUniversity}</div>
                          <div className="text-[10px] text-slate-400">{prof.currentRole}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                        <span>Mentored: <strong className="text-emerald-400">{prof.studentsRecruited || 12}</strong></span>
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">{prof.level || 'Leader'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: GALLERY ASSETS VIEW */}
          {activeNav === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white">Alumni Gallery Assets</h3>
                  <p className="text-xs text-slate-400">Photo event records displayed on public portal</p>
                </div>
                <Button onClick={() => setShowGalleryModal(true)} className="bg-indigo-600 text-xs font-bold">
                  <Plus size={14} className="mr-1" /> Add Gallery Asset
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 group">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-bold">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Delete Asset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 6: IMPACT STATISTICS VIEW */}
          {activeNav === 'stats' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">Public Impact Metrics</h3>
                <p className="text-xs text-slate-400">Configure public stats displayed on the Alumni landing page.</p>
              </div>

              <form onSubmit={handleSaveStats} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Total Members</label>
                    <input
                      type="number"
                      value={stats.totalMembers}
                      onChange={e => setStats({ ...stats, totalMembers: Number(e.target.value) })}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Partner Universities</label>
                    <input
                      type="number"
                      value={stats.partnerUniversities}
                      onChange={e => setStats({ ...stats, partnerUniversities: Number(e.target.value) })}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Students Mentored</label>
                    <input
                      type="number"
                      value={stats.studentsMentored}
                      onChange={e => setStats({ ...stats, studentsMentored: Number(e.target.value) })}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Impact Rate %</label>
                    <input
                      type="text"
                      value={stats.impactRate}
                      onChange={e => setStats({ ...stats, impactRate: e.target.value })}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-indigo-600 text-xs font-bold px-6 py-2.5">
                  Save Statistics
                </Button>
              </form>
            </div>
          )}

          {/* VIEW 7: MESSAGES & ANNOUNCEMENTS */}
          {activeNav === 'messages' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">Alumni Community Announcements</h3>
                <p className="text-xs text-slate-400">Broadcast news and leadership updates to verified alumni members.</p>
              </div>

              <form onSubmit={handleSendAnnouncement} className="space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-slate-300">Broadcast Message</label>
                  <textarea
                    rows={4}
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    placeholder="Type broadcast message for all alumni leaders..."
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <Button type="submit" className="bg-indigo-600 text-xs font-bold">
                  <Send size={14} className="mr-1.5" /> Dispatch Broadcast
                </Button>
              </form>
            </div>
          )}

          {/* VIEW 8: PLATFORM SETTINGS */}
          {activeNav === 'settings' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">Alumni Program Settings</h3>
                <p className="text-xs text-slate-400">Configure program parameters, candidate validation, and public visibility.</p>
              </div>

              <div className="space-y-4 max-w-xl text-xs text-slate-300">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-bold text-white">Automatic Profile Conversion</div>
                    <div className="text-[11px] text-slate-400">Auto-create public alumni profile upon application approval</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-indigo-500" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-bold text-white">Email Application Confirmations</div>
                    <div className="text-[11px] text-slate-400">Notify applicants when status changes</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-indigo-500" />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: VIEW FULL CANDIDATE APPLICATION DETAILS */}
      {/* ========================================================= */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img 
                  src={viewingApp.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'} 
                  alt={viewingApp.fullName} 
                  className="w-14 h-14 rounded-2xl object-cover border border-indigo-400 shrink-0"
                />
                <div>
                  <h3 className="text-xl font-black text-white">{viewingApp.fullName}</h3>
                  <p className="text-xs text-indigo-300 font-semibold">{viewingApp.email} {viewingApp.phone && `• ${viewingApp.phone}`}</p>
                  <div className="mt-1">
                    <Badge variant={viewingApp.status === 'approved' ? 'success' : viewingApp.status === 'rejected' ? 'danger' : 'warning'} className="uppercase text-[10px]">
                      Status: {viewingApp.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingApp(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">School & Sub-System</div>
                <div className="font-bold text-white">{viewingApp.school}</div>
                <div className="text-indigo-300">{viewingApp.subSystem}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Role & University/Firm</div>
                <div className="font-bold text-white">{viewingApp.currentRole}</div>
                <div className="text-slate-300">{viewingApp.companyOrUniversity}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Specialization & Year</div>
                <div className="font-bold text-white">{viewingApp.specialization}</div>
                <div className="text-slate-300">Class of '{viewingApp.graduationYear}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Consent & LinkedIn</div>
                <div className="font-bold text-emerald-400">{viewingApp.consentGranted ? 'Consent Granted' : 'Pending'}</div>
                {viewingApp.linkedin && (
                  <a href={viewingApp.linkedin} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                    <Linkedin size={12} />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>

            {viewingApp.motivation && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Motivation & Details</div>
                <p className="text-slate-300 leading-relaxed italic">"{viewingApp.motivation}"</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => { setDeletingApp(viewingApp); setViewingApp(null); }}
                className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete Candidate</span>
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve & Create Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE CANDIDATE APPLICATION CONFIRMATION */}
      {/* ========================================================= */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete Candidate Application?</h3>
                <p className="text-xs text-rose-300 font-semibold">This action permanently deletes the application from the database.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate Name:</span>
                <span className="font-bold text-white">{deletingApp.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{deletingApp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application ID:</span>
                <span className="font-mono text-slate-400">{deletingApp.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                disabled={deletingAppLoading}
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                disabled={deletingAppLoading}
                onClick={handleConfirmDeleteApplication}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition flex items-center gap-1.5"
              >
                {deletingAppLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE ALUMNI PROFILE CONFIRMATION */}
      {/* ========================================================= */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Remove Alumni Profile?</h3>
                <p className="text-xs text-rose-300 font-semibold">This will remove the public profile for {deletingProfile.name}.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeletingProfile(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAlumni}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT ALUMNI PROFILE */}
      {/* ========================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingProfile ? 'Edit Alumni Leader Profile' : 'Add New Alumni Leader Profile'}
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300">School / High School *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.school}
                    onChange={e => setProfileForm({ ...profileForm, school: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300">Sub-System *</label>
                  <select
                    value={profileForm.subSystem}
                    onChange={e => setProfileForm({ ...profileForm, subSystem: e.target.value as any })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value="General Education">General Education</option>
                    <option value="Baccalauréat & French Sub-System">Baccalauréat & French</option>
                    <option value="Technical & TVEE">Technical & TVEE</option>
                    <option value="Commercial Education">Commercial Education</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300">Current Role *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.currentRole}
                    onChange={e => setProfileForm({ ...profileForm, currentRole: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300">University / Firm</label>
                  <input
                    type="text"
                    value={profileForm.companyOrUniversity}
                    onChange={e => setProfileForm({ ...profileForm, companyOrUniversity: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300">Specialization / Field</label>
                  <input
                    type="text"
                    value={profileForm.specialization}
                    onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300">Graduation Year</label>
                  <input
                    type="number"
                    value={profileForm.graduationYear}
                    onChange={e => setProfileForm({ ...profileForm, graduationYear: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300">Photo URL</label>
                <input
                  type="text"
                  value={profileForm.photoUrl}
                  onChange={e => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300">Bio & Mentorship Impact</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <Button type="submit" className="bg-indigo-600 text-xs font-bold px-6 py-2">
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW ALUMNI PROFILE DETAILS */}
      {/* ========================================================= */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img src={viewingProfile.photoUrl} alt={viewingProfile.name} className="w-16 h-16 rounded-2xl object-cover border border-indigo-400" />
                <div>
                  <h3 className="text-xl font-black text-white">{viewingProfile.name}</h3>
                  <p className="text-xs text-indigo-300 font-bold">{viewingProfile.companyOrUniversity}</p>
                  <p className="text-[11px] text-slate-400">{viewingProfile.currentRole}</p>
                </div>
              </div>
              <button onClick={() => setViewingProfile(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Academic Origin & Sub-System</div>
                <div className="font-bold text-white">{viewingProfile.school}</div>
                <div className="text-indigo-300">{viewingProfile.subSystem} • Class of '{viewingProfile.graduationYear}</div>
              </div>

              {viewingProfile.bio && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Mentorship Bio</div>
                  <p className="text-slate-300 leading-relaxed italic">"{viewingProfile.bio}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button onClick={() => setViewingProfile(null)} className="bg-slate-800 text-xs font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD GALLERY ITEM */}
      {/* ========================================================= */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Add Alumni Gallery Asset</h3>
              <button onClick={() => setShowGalleryModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Title *</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300">Image URL *</label>
                <input
                  type="text"
                  required
                  value={galleryForm.imageUrl}
                  onChange={e => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                >
                  <option value="Summit">Summit</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Community">Community</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={galleryForm.description}
                  onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <Button type="submit" className="bg-indigo-600 text-xs font-bold px-6 py-2">
                  Save Gallery Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
