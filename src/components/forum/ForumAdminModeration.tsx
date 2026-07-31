import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Flag, BarChart3, FolderPlus, Settings, CheckCircle, 
  Trash2, XCircle, AlertTriangle, Plus, Eye, MessageSquare, Award, Users
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { ForumReport, ForumCategory, ForumAnalytics } from '../../types';
import { 
  fetchForumReports, updateReportStatus, fetchForumCategories, 
  createForumCategory, fetchForumAnalytics 
} from '../../services/forumService';
import toast from 'react-hot-toast';

export default function ForumAdminModeration() {
  const { user, isAdmin, isTeacher } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'categories' | 'settings'>('analytics');
  
  // Data States
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [analytics, setAnalytics] = useState<ForumAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameFr, setNewCatNameFr] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatDescFr, setNewCatDescFr] = useState('');
  const [newCatSubject, setNewCatSubject] = useState('Computer Science');
  const [newCatLevel, setNewCatLevel] = useState('Advanced Level');

  // Blocked Words State
  const [blockedWords, setBlockedWords] = useState<string[]>(['spam', 'scam', 'cheat', 'fraud', 'illegal']);
  const [wordInput, setWordInput] = useState('');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      const [reps, cats, stats] = await Promise.all([
        fetchForumReports(),
        fetchForumCategories(),
        fetchForumAnalytics()
      ]);
      setReports(reps);
      setCategories(cats);
      setAnalytics(stats);
    } catch (err) {
      console.error('Error loading moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    try {
      await updateReportStatus(reportId, status, user?.name || user?.email || 'Admin');
      toast.success(status === 'reviewed' ? (isFr ? 'Signalement traité' : 'Report resolved') : (isFr ? 'Signalement ignoré' : 'Report dismissed'));
      loadModerationData();
    } catch (err) {
      toast.error('Failed to update report status');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatNameFr.trim()) {
      toast.error('Category names in EN and FR are required');
      return;
    }

    try {
      await createForumCategory({
        name: newCatName.trim(),
        nameFr: newCatNameFr.trim(),
        slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
        description: newCatDesc.trim() || 'Academic subject discussion category.',
        descriptionFr: newCatDescFr.trim() || 'Catégorie de discussion académique.',
        curriculum: 'Both',
        level: newCatLevel,
        subject: newCatSubject,
        icon: 'BookOpen',
        color: 'bg-emerald-600',
        orderIndex: categories.length + 1,
        discussionCount: 0
      });

      toast.success(isFr ? 'Catégorie créée!' : 'Category created!');
      setShowCatModal(false);
      setNewCatName('');
      setNewCatNameFr('');
      loadModerationData();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleAddBlockedWord = () => {
    if (!wordInput.trim()) return;
    const word = wordInput.trim().toLowerCase();
    if (!blockedWords.includes(word)) {
      setBlockedWords([...blockedWords, word]);
      setWordInput('');
      toast.success(`Added "${word}" to blocked keywords`);
    }
  };

  if (!isAdmin && !isTeacher) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 space-y-2">
        <ShieldAlert size={36} className="mx-auto text-rose-600" />
        <h3 className="text-base font-bold">{isFr ? 'Accès Restreint' : 'Access Restricted'}</h3>
        <p className="text-xs">{isFr ? 'Seuls les enseignants et administrateurs peuvent accéder au panneau de modération.' : 'Only teachers and administrators can access the moderation panel.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Moderation Header & Navigation Tabs */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isFr ? 'Panneau de Modération & Analytiques Forum' : 'Forum Moderation & Analytics Hub'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {isFr ? 'Supervision de la communauté, statistiques, signalements et gestion des catégories.' : 'Community oversight, engagement analytics, content moderation & category controls.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCatModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <FolderPlus size={16} />
              {isFr ? 'Nouvelle Catégorie' : 'Add Category'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart3 size={15} />
            {isFr ? 'Statistiques Forum' : 'Analytics & Insights'}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flag size={15} />
            {isFr ? 'Signalements' : 'Reported Content'}
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'categories' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FolderPlus size={15} />
            {isFr ? 'Gestion des Catégories' : 'Category Management'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings size={15} />
            {isFr ? 'Paramètres & Anti-Spam' : 'Moderation Rules'}
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics & Insights */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Discussions</span>
              <div className="text-2xl font-black text-slate-900">{analytics.totalDiscussions}</div>
              <span className="text-xs font-semibold text-emerald-600">Active Academic Threads</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Replies</span>
              <div className="text-2xl font-black text-slate-900">{analytics.totalReplies}</div>
              <span className="text-xs font-semibold text-indigo-600">Peer & Teacher Answers</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
              <div className="text-2xl font-black text-slate-900">{analytics.activeStudents}</div>
              <span className="text-xs font-semibold text-amber-600">Enrolled Learners</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Teachers</span>
              <div className="text-2xl font-black text-slate-900">{analytics.activeTeachers}</div>
              <span className="text-xs font-semibold text-purple-600">Subject Experts</span>
            </div>
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Discussed Subjects */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-600" />
                {isFr ? 'Matières les Plus Discussées' : 'Most Discussed Subjects'}
              </h3>
              <div className="space-y-3">
                {analytics.mostDiscussedSubjects.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{item.subject}</span>
                      <span className="text-emerald-700 font-extrabold">{item.count} threads</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (item.count / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Searched Topics */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                {isFr ? 'Sujets et Mots-Clés Recherchés' : 'Top Searched Exam Topics'}
              </h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {analytics.topSearchedTopics.map((topic, idx) => (
                  <span key={idx} className="px-3.5 py-2 bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-xl text-xs font-bold shadow-xs">
                    🔍 {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reported Content Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
            <span>{isFr ? 'File d\'attente des signalements' : 'Reported Content Queue'}</span>
            <span className="text-xs font-bold text-slate-400">Total: {reports.length}</span>
          </h3>

          {reports.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 font-semibold text-xs space-y-1">
              <CheckCircle size={32} className="mx-auto text-emerald-500" />
              <p>{isFr ? 'Aucun contenu signalé pour le moment.' : 'No reported content found. Forum community is clean!'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded uppercase">
                        {rep.targetType}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{rep.targetTitle || rep.targetId}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      <strong>Reason:</strong> {rep.reason}
                    </p>
                    <span className="text-[10px] text-slate-400">Reported by {rep.reporterName} on {new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'reviewed')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                        >
                          Resolve / Delete
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismissed')}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                        {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Category Management */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">
              {isFr ? 'Catégories du Forum' : 'Active Forum Categories'}
            </h3>
            <button
              onClick={() => setShowCatModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{isFr ? cat.nameFr : cat.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{isFr ? cat.descriptionFr : cat.description}</p>
                  <span className="text-[10px] font-bold text-emerald-700 mt-1 block">{cat.discussionCount} discussions</span>
                </div>
                <div className={`w-10 h-10 rounded-xl ${cat.color} text-white font-bold text-xs flex items-center justify-center shadow-sm`}>
                  {cat.name.charAt(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Settings & Anti-Spam */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-black text-slate-900">
            {isFr ? 'Modération Automatique & Mots Bloqués' : 'Auto-Moderation & Blocked Word List'}
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isFr ? 'Ajouter un mot-clé interdit' : 'Add Blocked Keyword'}
            </label>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="e.g. spamword"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
              <button
                onClick={handleAddBlockedWord}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {blockedWords.map((word, idx) => (
                <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  🚫 {word}
                  <button onClick={() => setBlockedWords(blockedWords.filter(w => w !== word))} className="hover:text-rose-900">
                    <XCircle size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900">Create New Forum Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name (EN) *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name (FR) *</label>
                <input
                  type="text"
                  required
                  value={newCatNameFr}
                  onChange={(e) => setNewCatNameFr(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newCatSubject}
                  onChange={(e) => setNewCatSubject(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
