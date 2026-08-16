import React, { useState, useEffect } from 'react';
import {
  Bell, Search, Filter, CheckCheck, Bookmark, Archive, Trash2, Pin,
  Calendar, User, ArrowRight, ExternalLink, Sparkles, BookOpen, AlertTriangle,
  CheckCircle2, Info, Award, Settings, FileText, ChevronRight, Share2, Volume2
} from 'lucide-react';
import { UserNotification, Announcement } from '../types';
import { notificationService } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationPreferencesModal } from '../components/NotificationPreferencesModal';
import Sidebar from '../components/Sidebar';

export default function NotificationCenterPage() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'announcements' | 'ai' | 'reminders' | 'bookmarks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [langOverride, setLangOverride] = useState<'en' | 'fr'>(language as 'en' | 'fr');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const notifs = notificationService.getUserNotifications('current-user');
    const anns = notificationService.getAnnouncements();
    setNotifications(notifs);
    setAnnouncements(anns);
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead('current-user');
    loadData();
  };

  const handleMarkRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationService.markAsRead(id);
    loadData();
  };

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationService.toggleBookmark(id);
    loadData();
  };

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationService.archiveNotification(id);
    loadData();
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationService.deleteNotification(id);
    loadData();
  };

  const openAnnouncementDetail = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    notificationService.incrementAnnouncementViews(ann.id);
  };

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    if (n.isArchived) return false;

    // Search query
    const textToMatch = `${n.title} ${n.message} ${n.titleFr || ''} ${n.messageFr || ''}`.toLowerCase();
    if (searchQuery && !textToMatch.includes(searchQuery.toLowerCase())) return false;

    // Category filter
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;

    // Tab filter
    if (selectedTab === 'unread') return !n.isRead;
    if (selectedTab === 'announcements') return n.type === 'general_announcement' || n.type === 'teacher_announcement';
    if (selectedTab === 'ai') return n.type === 'ai_recommendation';
    if (selectedTab === 'reminders') return n.type.includes('reminder');
    if (selectedTab === 'bookmarks') return n.isBookmarked;

    return true;
  });

  const pinnedAnnouncements = announcements.filter(a => a.isPinned && a.status === 'published');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_recommendation':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'assignment_reminder':
      case 'quiz_reminder':
      case 'mock_exam_reminder':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'general_announcement':
      case 'teacher_announcement':
        return <Bell className="w-5 h-5 text-indigo-600" />;
      case 'achievement_earned':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'security_alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">High</span>;
      case 'normal':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 uppercase">Normal</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold relative shadow-inner">
              <Bell className="w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white font-bold text-xs rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {language === 'fr' ? 'Centre de Notifications' : 'Notification Center'}
                </h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {notifications.length} {language === 'fr' ? 'au total' : 'total'}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {language === 'fr'
                  ? 'Annonces officielles, rappels de cours, alertes d\'examen et conseils IA'
                  : 'Official announcements, course reminders, exam alerts & AI guidance'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                {language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
              </button>
            )}
            <button
              onClick={() => setIsPrefOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {language === 'fr' ? 'Préférences' : 'Settings'}
            </button>
          </div>
        </div>

        {/* Pinned Announcements Section */}
        {pinnedAnnouncements.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm tracking-wide">
                <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>{language === 'fr' ? 'Annonces Épinglées' : 'Pinned Announcements'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  onClick={() => openAnnouncementDetail(ann)}
                  className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer relative overflow-hidden group border border-indigo-700/40"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Bell className="w-32 h-32" />
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-indigo-200 backdrop-blur-md uppercase tracking-wider">
                      {ann.category}
                    </span>
                    {getPriorityBadge(ann.priority)}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                    {langOverride === 'fr' && ann.titleFr ? ann.titleFr : ann.title}
                  </h3>
                  <p className="text-slate-300 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {langOverride === 'fr' && ann.subtitleFr ? ann.subtitleFr : ann.subtitle || ann.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      {ann.authorName}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-300 font-medium">
                      {language === 'fr' ? 'Voir l\'annonce' : 'Read announcement'}
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher les notifications...' : 'Search notifications...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{language === 'fr' ? 'Toutes les catégories' : 'All Categories'}</option>
                <option value="academic">{language === 'fr' ? 'Académique' : 'Academic'}</option>
                <option value="examinations">{language === 'fr' ? 'Examens & GCE' : 'Examinations'}</option>
                <option value="assignments">{language === 'fr' ? 'Devoirs & Quiz' : 'Assignments'}</option>
                <option value="platform_updates">{language === 'fr' ? 'Mises à jour' : 'Platform Updates'}</option>
                <option value="maintenance">{language === 'fr' ? 'Maintenance' : 'Maintenance'}</option>
                <option value="general">{language === 'fr' ? 'Général' : 'General'}</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
            {[
              { id: 'all', label: language === 'fr' ? 'Toutes' : 'All Notifications' },
              { id: 'unread', label: `${language === 'fr' ? 'Non lues' : 'Unread'} (${unreadCount})` },
              { id: 'announcements', label: language === 'fr' ? 'Annonces' : 'Announcements' },
              { id: 'ai', label: language === 'fr' ? 'Alertes IA' : 'AI Alerts' },
              { id: 'reminders', label: language === 'fr' ? 'Rappels' : 'Reminders' },
              { id: 'bookmarks', label: language === 'fr' ? 'Favoris' : 'Bookmarks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {language === 'fr' ? 'Aucune notification trouvée' : 'No notifications found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {language === 'fr'
                  ? 'Vous êtes à jour ! Aucune alerte ne correspond à vos filtres actuels.'
                  : 'You are all caught up! No notifications match your selected filter.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  handleMarkRead(notif.id);
                  if (notif.announcementId) {
                    const ann = announcements.find(a => a.id === notif.announcementId);
                    if (ann) setSelectedAnnouncement(ann);
                  }
                }}
                className={`group bg-white rounded-3xl p-5 border transition-all cursor-pointer relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.isRead
                    ? 'border-indigo-200 bg-indigo-50/20 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-5 left-2 w-2 h-2 rounded-full bg-indigo-600" />
                )}

                <div className="flex items-start gap-4 pl-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    !notif.isRead ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {language === 'fr' && notif.titleFr ? notif.titleFr : notif.title}
                      </span>
                      {getPriorityBadge(notif.priority)}
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {language === 'fr' && notif.messageFr ? notif.messageFr : notif.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:self-center self-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={(e) => handleToggleBookmark(notif.id, e)}
                    title={language === 'fr' ? 'Favori' : 'Bookmark'}
                    className={`p-2 rounded-xl text-xs transition-colors ${
                      notif.isBookmarked
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${notif.isBookmarked ? 'fill-amber-500' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleArchive(notif.id, e)}
                    title={language === 'fr' ? 'Archiver' : 'Archive'}
                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(notif.id, e)}
                    title={language === 'fr' ? 'Supprimer' : 'Delete'}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 text-indigo-200 uppercase tracking-wider">
                  {selectedAnnouncement.category}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLangOverride(langOverride === 'en' ? 'fr' : 'en')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    🌐 {langOverride.toUpperCase()}
                  </button>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white">
                {langOverride === 'fr' && selectedAnnouncement.titleFr ? selectedAnnouncement.titleFr : selectedAnnouncement.title}
              </h2>
              {selectedAnnouncement.subtitle && (
                <p className="text-xs text-indigo-200 mt-1">
                  {langOverride === 'fr' && selectedAnnouncement.subtitleFr ? selectedAnnouncement.subtitleFr : selectedAnnouncement.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-400 border-t border-white/10 pt-3">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  {selectedAnnouncement.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {new Date(selectedAnnouncement.publicationDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-slate-700 text-xs leading-relaxed">
              <p className="text-sm font-medium text-slate-800">
                {langOverride === 'fr' && selectedAnnouncement.descriptionFr ? selectedAnnouncement.descriptionFr : selectedAnnouncement.description}
              </p>

              {(selectedAnnouncement.contentMarkdown || selectedAnnouncement.contentMarkdownFr) && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-sans space-y-2 whitespace-pre-line text-slate-700">
                  {langOverride === 'fr' && selectedAnnouncement.contentMarkdownFr
                    ? selectedAnnouncement.contentMarkdownFr
                    : selectedAnnouncement.contentMarkdown}
                </div>
              )}

              {/* Attachments */}
              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">
                    {language === 'fr' ? 'Pièces jointes' : 'Attachments & Resources'}
                  </h4>
                  <div className="space-y-2">
                    {selectedAnnouncement.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors text-indigo-700 font-medium text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>{att.name}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefOpen}
        onClose={() => setIsPrefOpen(false)}
      />
    </div>
  );
}

function X(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
    </svg>
  );
}
