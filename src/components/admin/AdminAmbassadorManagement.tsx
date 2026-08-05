import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Trophy, ShieldCheck, CheckCircle2, XCircle, 
  Search, Plus, Trash2, Edit3, Eye, Sparkles, Filter, 
  TrendingUp, School, MapPin, RefreshCw, Layers, Check, Image as ImageIcon, ExternalLink, MessageSquare, ChevronRight
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
import { 
  AmbassadorProfile, 
  AmbassadorApplication, 
  AmbassadorGalleryItem, 
  AmbassadorLevel, 
  AmbassadorClassLevel,
  AmbassadorApplicationStatus
} from '../../types/ambassador';

export function AdminAmbassadorManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'applications' | 'profiles' | 'gallery'>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [applications, setApplications] = useState<AmbassadorApplication[]>([]);
  const [profiles, setProfiles] = useState<AmbassadorProfile[]>([]);
  const [gallery, setGallery] = useState<AmbassadorGalleryItem[]>([]);

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
    setApplications(apps);
    setProfiles(profs);
    setGallery(gal);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Stats calculation
  const totalRecruitedStudents = profiles.reduce((acc, p) => acc + (p.recruitedCount || 0), 0);
  const activeAmbassadorsCount = profiles.filter(p => p.status === 'active').length;
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const distinctSchoolsCount = new Set(profiles.map(p => p.school.toLowerCase())).size;

  // Application Actions
  const handleUpdateAppStatus = async (appId: string, status: 'approved' | 'rejected' | 'active' | 'suspended') => {
    await updateApplicationStatus(appId, status, reviewNotes, assignLevel);
    setSelectedApp(null);
    setReviewNotes('');
    loadAll();
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    await saveAmbassadorProfile(editingProfile);
    setShowProfileModal(false);
    setEditingProfile(null);
    loadAll();
  };

  // Profile Delete
  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ambassador profile?')) return;
    await deleteAmbassadorProfile(id);
    loadAll();
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
    loadAll();
  };

  // Gallery Delete
  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Delete gallery item?')) return;
    await deleteAmbassadorGalleryItem(id);
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
            Student Leader & Referral Dashboard
          </h2>
          <p className="text-slate-300 text-xs md:text-sm font-medium">
            Manage secondary school student ambassador applications, referral codes, performance tiers, and school activity galleries.
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
          { id: 'overview', label: '📊 Statistics & Leaderboard', badge: null },
          { id: 'applications', label: '📝 Applications', badge: pendingAppsCount },
          { id: 'profiles', label: '🎓 Ambassador Profiles', badge: profiles.length },
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

      {/* TAB 1: OVERVIEW & LEADERBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Recruited Students</span>
                <Users size={20} className="text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{totalRecruitedStudents}</div>
              <p className="text-[11px] text-slate-400">Total student registrations tracked via ambassador referral codes</p>
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

          {/* Leaderboard Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">🏆 Top Ambassador Leaderboard</h3>
                <p className="text-slate-400 text-xs">Ranked by total students recruited and active engagement</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Ambassador</th>
                    <th className="p-3">School & Region</th>
                    <th className="p-3">Tier Level</th>
                    <th className="p-3">Referral Code</th>
                    <th className="p-3">Recruited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {profiles
                    .sort((a, b) => b.recruitedCount - a.recruitedCount)
                    .map((prof, idx) => (
                      <tr key={prof.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3 font-black text-amber-400">#{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={prof.photo} alt={prof.name} className="w-8 h-8 rounded-full object-cover border border-amber-400" />
                            <div>
                              <div className="font-bold text-white">{prof.name}</div>
                              <div className="text-[10px] text-slate-400">{prof.classLevel}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          <div>{prof.school}</div>
                          <div className="text-[10px] text-slate-400">{prof.region}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant={prof.level === 'gold' ? 'warning' : prof.level === 'silver' ? 'neutral' : 'info'} className="uppercase text-[10px]">
                            {prof.level}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-amber-300 font-bold">{prof.referralCode}</td>
                        <td className="p-3 font-black text-emerald-400 text-sm">{prof.recruitedCount} students</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: APPLICATIONS */}
      {activeSubTab === 'applications' && (
        <div className="space-y-6">
          
          {/* Controls */}
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

            <div className="flex items-center gap-3 w-full sm:w-auto">
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
          </div>

          {/* Applications Table */}
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
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">No applications found.</td>
                    </tr>
                  ) : (
                    filteredApps.map(app => (
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
                            variant={
                              app.status === 'approved' || app.status === 'active' 
                                ? 'success' 
                                : app.status === 'pending' 
                                ? 'warning' 
                                : 'danger'
                            }
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PROFILES MANAGEMENT */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-6">
          
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
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shrink-0"
            >
              <Plus size={16} />
              <span>Add Ambassador Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfs.map(prof => (
              <div key={prof.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-white flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <img src={prof.photo} alt={prof.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400" />
                    <div className="text-right">
                      <Badge variant={prof.level === 'gold' ? 'warning' : 'info'} className="uppercase text-[10px]">
                        {prof.level} Tier
                      </Badge>
                      <div className="text-[10px] text-emerald-400 font-bold mt-1">{prof.recruitedCount} recruited</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-white">{prof.name}</h3>
                    <div className="text-xs font-bold text-amber-300">{prof.school} • {prof.classLevel}</div>
                    <div className="text-[11px] text-slate-400">{prof.region}</div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">"{prof.bio}"</p>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400 flex items-center justify-between">
                    <span>Code:</span>
                    <span>{prof.referralCode}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => { setEditingProfile(prof); setShowProfileModal(true); }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(prof.id)}
                    className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
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
                setShowGalleryModal(true);
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

      {/* REVIEW APPLICATION DRAWER MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl my-8">
            <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
              ✕
            </button>

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

              <div>
                <div className="font-bold text-indigo-400 mb-1">Ideas for school:</div>
                <p className="p-3 rounded-xl bg-slate-950 text-slate-300 leading-relaxed">{selectedApp.motivationIdeas}</p>
              </div>
            </div>

            {/* Approval Controls */}
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

      {/* PROFILE EDIT / CREATE MODAL */}
      {showProfileModal && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl my-8">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400">
              ✕
            </button>

            <h3 className="text-xl font-black text-white">Edit Ambassador Profile</h3>

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

      {/* GALLERY NEW MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
            <button onClick={() => setShowGalleryModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <h3 className="text-lg font-black">Add Gallery Event Photo</h3>

            <form onSubmit={handleSaveGallery} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newGalleryItem.title}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newGalleryItem.imageUrl}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">School</label>
                <input
                  type="text"
                  value={newGalleryItem.school}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, school: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-950 font-black rounded-xl">Save Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
