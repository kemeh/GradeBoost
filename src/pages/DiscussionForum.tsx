import React, { useState, useEffect } from 'react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { 
  MessageSquare, Search, Plus, Filter, Sparkles, BookOpen, 
  Bookmark, Award, Pin, Lock, CheckCircle2, Heart, Eye, 
  Tag, ShieldAlert, Bell, Globe, ArrowUpDown, Code, Check, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ForumDiscussion, ForumCategory, ForumCurriculum, 
  ForumDiscussionType, ForumNotification 
} from '../types';
import { 
  fetchForumDiscussions, fetchForumCategories, 
  fetchUserNotifications, markNotificationAsRead, 
  toggleLikeDiscussion, toggleBookmarkDiscussion, getUserInteractions 
} from '../services/forumService';
import CreateDiscussionModal from '../components/forum/CreateDiscussionModal';
import DiscussionDetailModal from '../components/forum/DiscussionDetailModal';
import ForumAdminModeration from '../components/forum/ForumAdminModeration';
import toast from 'react-hot-toast';

export default function DiscussionForum() {
  const { user, isTeacher, isAdmin } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'categories' | 'bookmarks' | 'my_posts' | 'moderation'>('feed');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<ForumCurriculum | 'All'>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<ForumDiscussionType | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');

  // Data State
  const [discussions, setDiscussions] = useState<ForumDiscussion[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  // User Interaction Sets
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<ForumDiscussion | null>(null);

  useEffect(() => {
    loadForumData();
  }, [selectedCurriculum, selectedSubject, selectedLevel, selectedType, selectedTag, searchQuery, activeTab]);

  useEffect(() => {
    if (user) {
      const { likedDiscussionIds, bookmarkedDiscussionIds } = getUserInteractions(user.uid);
      setLikedIds(likedDiscussionIds);
      setBookmarkedIds(bookmarkedDiscussionIds);
      loadNotifications();
    }
  }, [user]);

  const loadForumData = async () => {
    setLoading(true);
    try {
      const cats = await fetchForumCategories();
      setCategories(cats);

      const filterPayload: any = {
        searchQuery,
        curriculum: selectedCurriculum,
        subject: selectedSubject,
        type: selectedType,
        tag: selectedTag
      };

      if (activeTab === 'bookmarks' && user) {
        filterPayload.bookmarkedOnly = true;
        filterPayload.userId = user.uid;
      } else if (activeTab === 'my_posts' && user) {
        filterPayload.authorId = user.uid;
      }

      let data = await fetchForumDiscussions(filterPayload);

      // Sorting
      if (sortBy === 'popular') {
        data.sort((a, b) => (b.likeCount || 0) + (b.replyCount || 0) * 2 - ((a.likeCount || 0) + (a.replyCount || 0) * 2));
      } else if (sortBy === 'unanswered') {
        data = data.filter(d => (d.replyCount || 0) === 0);
      }

      setDiscussions(data);
    } catch (err) {
      console.error('Error loading forum discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    const notifs = await fetchUserNotifications(user.uid);
    setNotifications(notifs);
  };

  const handleLikeCard = async (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour aimer.' : 'Log in to like posts.');
      return;
    }
    const likedNow = await toggleLikeDiscussion(user.uid, discId);
    setLikedIds(prev => {
      const copy = new Set(prev);
      likedNow ? copy.add(discId) : copy.delete(discId);
      return copy;
    });
    setDiscussions(prev => prev.map(d => {
      if (d.id === discId) {
        const currentCount = d.likeCount || 0;
        return { ...d, likeCount: likedNow ? currentCount + 1 : Math.max(0, currentCount - 1) };
      }
      return d;
    }));
  };

  const handleBookmarkCard = async (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour sauvegarder.' : 'Log in to bookmark.');
      return;
    }
    const bookmarkedNow = await toggleBookmarkDiscussion(user.uid, discId);
    setBookmarkedIds(prev => {
      const copy = new Set(prev);
      bookmarkedNow ? copy.add(discId) : copy.delete(discId);
      return copy;
    });
    toast.success(bookmarkedNow ? (isFr ? 'Sauvegardé!' : 'Bookmarked!') : (isFr ? 'Retiré des signets' : 'Removed from bookmarks'));
  };

  const handleNotificationClick = async (notif: ForumNotification) => {
    await markNotificationAsRead(notif.id);
    setShowNotifMenu(false);
    loadNotifications();
    if (notif.discussionId) {
      const disc = discussions.find(d => d.id === notif.discussionId);
      if (disc) setSelectedDiscussion(disc);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const userRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

  return (
    <ModernDashboardLayout role={userRole} activeTab="forum">
      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {isFr ? 'Forum Académique & Communauté' : 'Academic Discussion Forum'}
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full tracking-wider border border-emerald-200">
                  Bilingual
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {isFr ? 'Entraide entre élèves et enseignants • Cameroun GCE & Baccalauréat' : 'Peer learning, teacher guidance & exam collaboration • Cameroon GCE & BAC'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
                    <span>{isFr ? 'Notifications Forum' : 'Forum Notifications'}</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold">{unreadCount} unread</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">{isFr ? 'Aucune notification.' : 'No notifications yet.'}</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                            n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                          }`}
                        >
                          <p className="font-bold">{isFr ? n.titleFr : n.title}</p>
                          <p className="text-[11px] text-slate-500 font-normal mt-0.5">{isFr ? n.messageFr : n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Create Discussion CTA Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span>{isFr ? 'Nouvelle Discussion' : 'Ask / Post Topic'}</span>
            </button>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFr ? "Rechercher une question, un sujet, un code ou une formule (ex: Binary Search, Équations)..." : "Search discussions, exam topics, code snippets, or formulas..."}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Curriculum Selector */}
              <select
                value={selectedCurriculum}
                onChange={(e) => setSelectedCurriculum(e.target.value as any)}
                className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="All">🌐 {isFr ? 'Tous Subsystems' : 'All Curricula'}</option>
                <option value="English">🇨🇲 English Subsystem (GCE)</option>
                <option value="French">🇨🇲 Sous-système Francophone (BAC)</option>
              </select>

              {/* Subject Selector */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="All">📚 {isFr ? 'Toutes les matières' : 'All Subjects'}</option>
                <option value="Computer Science">Computer Science</option>
                <option value="ICT">ICT & Networking</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physics">Physics / Physique</option>
                <option value="Chemistry">Chemistry / Chimie</option>
                <option value="Economics">Economics</option>
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="All">🏷️ {isFr ? 'Tous les types' : 'All Post Types'}</option>
                <option value="question">❓ Academic Question</option>
                <option value="revision_tips">💡 Revision Tips</option>
                <option value="programming_help">💻 Code / Programming</option>
                <option value="teacher_post">⭐ Teacher Guides</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none ml-auto"
              >
                <option value="newest">🔥 {isFr ? 'Plus récents' : 'Newest First'}</option>
                <option value="popular">⚡ {isFr ? 'Plus populaires' : 'Most Popular'}</option>
                <option value="unanswered">⏳ {isFr ? 'Sans réponse' : 'Unanswered'}</option>
              </select>
            </div>
          </div>

          {/* Forum Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'feed' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MessageSquare size={15} />
              {isFr ? 'Toutes les Discussions' : 'All Discussions'}
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full">
                {discussions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'categories' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen size={15} />
              {isFr ? 'Catégories D\'Études' : 'Study Categories'}
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'bookmarks' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Bookmark size={15} />
              {isFr ? 'Mes Signets' : 'Bookmarked'}
            </button>

            <button
              onClick={() => setActiveTab('my_posts')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'my_posts' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Tag size={15} />
              {isFr ? 'Mes Publications' : 'My Posts'}
            </button>

            {(isTeacher || isAdmin) && (
              <button
                onClick={() => setActiveTab('moderation')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ml-auto ${
                  activeTab === 'moderation' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <ShieldAlert size={15} />
                {isFr ? 'Modération & Admin' : 'Teacher Moderation'}
              </button>
            )}
          </div>

          {/* TAB CONTENT: Feed, Categories, Bookmarks, My Posts, Moderation */}

          {activeTab === 'moderation' ? (
            <ForumAdminModeration />
          ) : activeTab === 'categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedSubject(cat.subject);
                    setActiveTab('feed');
                  }}
                  className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${cat.color} text-white font-black text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-all`}>
                      {cat.name.charAt(0)}
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                      {cat.discussionCount} threads
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-all">
                      {isFr ? cat.nameFr : cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {isFr ? cat.descriptionFr : cat.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <span>{cat.subject}</span>
                    <span>•</span>
                    <span>{cat.level}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold text-xs space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p>{isFr ? 'Chargement des discussions...' : 'Fetching academic discussions...'}</p>
            </div>
          ) : discussions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <MessageSquare size={40} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">
                {isFr ? 'Aucune discussion trouvée' : 'No discussions match your filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isFr ? 'Soyez le premier élève ou enseignant à poser une question !' : 'Be the first student or teacher to start a thread on this topic.'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isFr ? 'Poser une Question' : 'Post Question'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((disc) => {
                const isLiked = likedIds.has(disc.id);
                const isBookmarked = bookmarkedIds.has(disc.id);

                return (
                  <div
                    key={disc.id}
                    onClick={() => setSelectedDiscussion(disc)}
                    className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer hover:shadow-md space-y-4 ${
                      disc.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/90'
                    }`}
                  >
                    {/* Discussion Card Top Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center overflow-hidden shadow-xs">
                          {disc.authorAvatar ? (
                            <img src={disc.authorAvatar} alt={disc.authorName} className="w-full h-full object-cover" />
                          ) : (
                            disc.authorName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{disc.authorName}</span>
                            {disc.authorRole === 'teacher' && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded flex items-center gap-0.5">
                                <Award size={10} /> Verified Teacher
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(disc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {disc.isPinned && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full flex items-center gap-1">
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        {disc.hasVerifiedAnswer && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} /> Verified Answer
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase">
                          {disc.curriculum === 'French' ? '🇫🇷 BAC' : '🇬🇧 GCE'}
                        </span>
                      </div>
                    </div>

                    {/* Title & Preview Body */}
                    <div>
                      <h2 className="text-base font-black text-slate-900 group-hover:text-emerald-700 tracking-tight leading-snug mb-1">
                        {disc.title}
                      </h2>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {disc.content}
                      </p>
                    </div>

                    {/* Code or Math Badges if attached */}
                    <div className="flex flex-wrap items-center gap-2">
                      {disc.codeSnippet && (
                        <span className="px-2 py-0.5 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded font-bold flex items-center gap-1">
                          <Code size={10} /> {disc.codeSnippet.language.toUpperCase()} Code
                        </span>
                      )}
                      {disc.mathFormula && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-mono rounded font-bold flex items-center gap-1">
                          <Sparkles size={10} /> LaTeX Formula
                        </span>
                      )}
                      {disc.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleLikeCard(e, disc.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition-all ${
                            isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Heart size={15} className={isLiked ? 'fill-rose-600' : ''} />
                          <span>{disc.likeCount || 0}</span>
                        </button>

                        <button
                          onClick={(e) => handleBookmarkCard(e, disc.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition-all ${
                            isBookmarked ? 'text-amber-600' : 'text-slate-400 hover:text-amber-600'
                          }`}
                        >
                          <Bookmark size={15} className={isBookmarked ? 'fill-amber-600' : ''} />
                        </button>

                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <MessageSquare size={14} /> {disc.replyCount || 0}
                        </span>

                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <Eye size={14} /> {disc.viewCount || 1}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        View Thread →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadForumData()}
      />

      {/* Discussion Detail Modal */}
      <DiscussionDetailModal
        isOpen={!!selectedDiscussion}
        onClose={() => setSelectedDiscussion(null)}
        discussion={selectedDiscussion}
        onRefreshDiscussion={() => loadForumData()}
      />
      </div>
    </ModernDashboardLayout>
  );
}
