import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, Plus, Search, CheckCircle2, XCircle, Trash2, Edit, Eye, 
  ExternalLink, Image, FileText, Check, ShieldCheck, Star, Sparkles, Filter, AlertCircle, RefreshCw
} from 'lucide-react';
import { AlumniProfile, AlumniGalleryItem, AlumniApplication, AlumniStats } from '../../types/alumni';
import { AlumniService, DEFAULT_ALUMNI_PROFILES, DEFAULT_ALUMNI_GALLERY } from '../../services/alumniService';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

export function AdminAlumniManagement() {
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

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subSystemFilter, setSubSystemFilter] = useState<string>('all');

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AlumniProfile | null>(null);
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
      setProfiles(pData);
      setGallery(gData);
      setApplications(aData);
      setStats(sData);
    } catch (err) {
      console.error('Error loading alumni admin data:', err);
      toast.error('Could not load data from server. Loaded local defaults.');
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
        bio: prof.bio,
        badgesRaw: prof.badges.join(', '),
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
        photoUrl: '',
        graduationYear: new Date().getFullYear(),
        school: '',
        subSystem: 'General Education',
        currentRole: '',
        companyOrUniversity: '',
        specialization: '',
        bio: '',
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
        toast.success('Alumni profile updated!');
      } else {
        await AlumniService.createAlumniProfile(profilePayload);
        toast.success('New alumni profile created!');
      }
      setShowProfileModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving alumni profile:', err);
      toast.error('Failed to save profile.');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alumni profile?')) return;
    try {
      await AlumniService.deleteAlumniProfile(id);
      toast.success('Profile deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete profile.');
    }
  };

  const handleToggleFeatured = async (prof: AlumniProfile) => {
    try {
      await AlumniService.updateAlumniProfile(prof.id, { featured: !prof.featured });
      toast.success(`Profile ${!prof.featured ? 'featured' : 'unfeatured'}!`);
      loadData();
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  // --- GALLERY HANDLERS ---
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.imageUrl) {
      toast.error('Please provide a title and image URL.');
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
      setGalleryForm({
        title: '',
        description: '',
        imageUrl: '',
        category: 'Summit',
        displayOrder: 1
      });
      loadData();
    } catch (err) {
      toast.error('Failed to add gallery item.');
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    try {
      await AlumniService.deleteGalleryItem(id);
      toast.success('Gallery item deleted.');
      loadData();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  // --- APPLICATION HANDLERS ---
  const handleApproveApplication = async (app: AlumniApplication) => {
    try {
      await AlumniService.convertApplicationToProfile(app);
      toast.success(`Application approved! ${app.fullName} is now a public Alumni Leader.`);
      loadData();
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('Could not approve application.');
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      await AlumniService.updateApplicationStatus(id, 'rejected');
      toast.success('Application marked as rejected.');
      loadData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Delete application record?')) return;
    try {
      await AlumniService.deleteApplication(id);
      toast.success('Application deleted.');
      loadData();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  // --- STATS HANDLER ---
  const handleSaveStats = async () => {
    try {
      await AlumniService.saveAlumniStats(stats);
      toast.success('Alumni impact stats updated successfully!');
    } catch (err) {
      toast.error('Failed to update stats.');
    }
  };

  // Filtered Profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.currentRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSub = subSystemFilter === 'all' || p.subSystem === subSystemFilter;
    return matchesSearch && matchesStatus && matchesSub;
  });

  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Award size={16} />
            Edulpha Community & Leadership
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Alumni Program Management</h2>
          <p className="text-xs text-slate-400 font-medium">
            Manage public alumni profiles, review candidate applications, manage gallery assets, and update impact stats.
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
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
            activeTab === 'profiles'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <Users size={15} />
          <span>Alumni Profiles</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">{profiles.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 relative",
            activeTab === 'applications'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <FileText size={15} />
          <span>Candidate Applications</span>
          {pendingAppsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
              {pendingAppsCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
            activeTab === 'gallery'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <Image size={15} />
          <span>Alumni Gallery</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">{gallery.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
            activeTab === 'stats'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          )}
        >
          <Sparkles size={15} />
          <span>Impact Statistics</span>
        </button>
      </div>

      {/* --- TAB 1: PROFILES --- */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, school, role..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={subSystemFilter}
                onChange={(e) => setSubSystemFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
              >
                <option value="all">All Sub-systems</option>
                <option value="General Education">General Education</option>
                <option value="Technical & TVEE">Technical & TVEE</option>
                <option value="Commercial Education">Commercial Education</option>
                <option value="Baccalauréat & French Sub-System">Baccalauréat</option>
              </select>
            </div>
          </div>

          {/* Profiles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((prof) => (
              <Card key={prof.id} className="p-6 relative flex flex-col justify-between space-y-4 hover:shadow-md transition">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prof.photoUrl}
                        alt={prof.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      />
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                          {prof.name}
                        </h3>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">
                          {prof.currentRole}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {prof.companyOrUniversity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFeatured(prof)}
                      className={cn(
                        "p-1.5 rounded-lg transition",
                        prof.featured ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400 hover:text-amber-500"
                      )}
                      title={prof.featured ? "Featured on Hero" : "Set as Featured"}
                    >
                      <Star size={16} fill={prof.featured ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Sub-system:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{prof.subSystem}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">School / Year:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{prof.school} ('{prof.graduationYear})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Consent Status:</span>
                      {prof.consentGranted ? (
                        <Badge variant="success" className="text-[10px]">Consent Granted</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">Consent Missing</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 italic">
                    "{prof.bio}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Badge 
                    variant={prof.status === 'approved' ? 'success' : prof.status === 'pending' ? 'warning' : 'danger'}
                    className="text-[10px] uppercase font-black"
                  >
                    {prof.status}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProfileModal(prof)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(prof.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: APPLICATIONS --- */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Candidate Applications Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Applications submitted by alumni via the public alumni landing page will appear here for review and one-click conversion to public profiles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-black text-lg flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                        {app.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 dark:text-white text-base">{app.fullName}</h3>
                          {app.consentGranted ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                              <ShieldCheck size={12} /> Consent Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-black uppercase">
                              Consent Missing
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {app.email} • {app.phone} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleApproveApplication(app)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                          >
                            <CheckCircle2 size={16} /> Approve & Publish Profile
                          </Button>
                          <Button
                            onClick={() => handleRejectApplication(app.id)}
                            variant="outline"
                            className="border-rose-200 text-rose-600 font-bold text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {app.status === 'approved' && (
                        <Badge variant="success" className="px-3 py-1 text-xs">Approved & Published</Badge>
                      )}

                      {app.status === 'rejected' && (
                        <Badge variant="danger" className="px-3 py-1 text-xs">Rejected</Badge>
                      )}

                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Academic Details</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{app.school} ('{app.graduationYear})</p>
                      <p className="text-indigo-600 font-medium">{app.subSystem} • {app.specialization}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Current Professional Role</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{app.currentRole}</p>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{app.companyOrUniversity}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Social / LinkedIn</span>
                      {app.linkedin ? (
                        <a href={app.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 truncate">
                          {app.linkedin} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <p className="text-slate-400 italic">No link provided</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">
                      Motivation Statement & Expected Contribution
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      "{app.motivation}"
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: GALLERY --- */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Alumni Event & Summit Photos ({gallery.length})
            </h3>
            <Button onClick={() => setShowGalleryModal(true)} className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs">
              <Plus size={16} className="mr-1.5" /> Add Gallery Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <Card key={item.id} className="overflow-hidden space-y-3 group">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg border border-white/20">
                    {item.category}
                  </span>
                </div>
                <div className="p-5 pt-1 space-y-2">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                  
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Order: #{item.displayOrder}</span>
                    <button
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-bold p-1"
                    >
                      Delete Photo
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: STATS --- */}
      {activeTab === 'stats' && (
        <Card className="p-8 space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Alumni Program Impact Statistics</h3>
            <p className="text-xs text-slate-500 font-medium">
              These stats are highlighted on the Alumni Leader public landing page and hero section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Verified Alumni Members</label>
              <input
                type="number"
                value={stats.totalMembers}
                onChange={(e) => setStats({ ...stats, totalMembers: Number(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Partner Universities & Hubs</label>
              <input
                type="number"
                value={stats.partnerUniversities}
                onChange={(e) => setStats({ ...stats, partnerUniversities: Number(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Students Mentored Annually</label>
              <input
                type="number"
                value={stats.studentsMentored}
                onChange={(e) => setStats({ ...stats, studentsMentored: Number(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mentorship Satisfaction Rate</label>
              <input
                type="text"
                value={stats.impactRate}
                onChange={(e) => setStats({ ...stats, impactRate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button onClick={handleSaveStats} className="bg-indigo-600 hover:bg-indigo-500 font-black text-xs px-6">
              Save Statistics
            </Button>
          </div>
        </Card>
      )}

      {/* --- ADD/EDIT PROFILE MODAL --- */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingProfile ? 'Edit Alumni Leader Profile' : 'Add New Alumni Leader'}
                </h3>
                <button onClick={() => setShowProfileModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Dr. Vanessa Mbella"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Current Role / Title *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.currentRole}
                      onChange={(e) => setProfileForm({ ...profileForm, currentRole: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Company / University *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.companyOrUniversity}
                      onChange={(e) => setProfileForm({ ...profileForm, companyOrUniversity: e.target.value })}
                      placeholder="e.g. Google Cloud / CMU Africa"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">School / High School Attended *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.school}
                      onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
                      placeholder="e.g. CCAST Bambili"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Sub-System *</label>
                    <select
                      value={profileForm.subSystem}
                      onChange={(e) => setProfileForm({ ...profileForm, subSystem: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    >
                      <option value="General Education">General Education</option>
                      <option value="Technical & TVEE">Technical & TVEE</option>
                      <option value="Commercial Education">Commercial Education</option>
                      <option value="Baccalauréat & French Sub-System">Baccalauréat & French Sub-System</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Year of Graduation / Exam *</label>
                    <input
                      type="number"
                      required
                      value={profileForm.graduationYear}
                      onChange={(e) => setProfileForm({ ...profileForm, graduationYear: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Specialization / Field</label>
                    <input
                      type="text"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      placeholder="e.g. Artificial Intelligence"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Photo Image URL</label>
                    <input
                      type="url"
                      value={profileForm.photoUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Short Bio / Achievements</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Brief description of learning journey and current mentorship role..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Badges (comma-separated)</label>
                    <input
                      type="text"
                      value={profileForm.badgesRaw}
                      onChange={(e) => setProfileForm({ ...profileForm, badgesRaw: e.target.value })}
                      placeholder="GCE Valedictorian, TVEE Leader"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profileForm.linkedin}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.consentGranted}
                      onChange={(e) => setProfileForm({ ...profileForm, consentGranted: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Consent Granted for Public Display</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.featured}
                      onChange={(e) => setProfileForm({ ...profileForm, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Star size={14} fill="currentColor" /> Feature on Hero Banner
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowProfileModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-black px-6">
                    Save Profile
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD GALLERY ITEM MODAL --- */}
      <AnimatePresence>
        {showGalleryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Alumni Event Photo</h3>
                <button onClick={() => setShowGalleryModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveGalleryItem} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Photo Title *</label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    placeholder="e.g. Alumni Leadership Summit 2025"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={galleryForm.imageUrl}
                    onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    >
                      <option value="Summit">Summit</option>
                      <option value="Mentorship">Mentorship</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Display Order</label>
                    <input
                      type="number"
                      value={galleryForm.displayOrder}
                      onChange={(e) => setGalleryForm({ ...galleryForm, displayOrder: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    placeholder="Brief description of event, location, and impact..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowGalleryModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-black px-6">
                    Add Photo
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
