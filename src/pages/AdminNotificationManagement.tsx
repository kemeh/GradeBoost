import React, { useState, useEffect } from 'react';
import {
  Bell, Plus, Send, Calendar, Users, Filter, Search, Pin, Trash2, Edit3,
  BarChart2, FileText, CheckCircle2, Clock, AlertTriangle, Sparkles, Globe,
  ShieldCheck, Eye, RefreshCw, Mail, Smartphone, Layers, Check, X, ArrowUpRight
} from 'lucide-react';
import { Announcement, NotificationTemplate, DeliveryReport, NotificationAnalyticsData, TargetAudience, NotificationCategory } from '../types';
import { notificationService } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';

export default function AdminNotificationManagement() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'announcements' | 'dispatcher' | 'templates' | 'reports' | 'settings'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [reports, setReports] = useState<DeliveryReport[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalyticsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State for New Announcement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleFr, setNewTitleFr] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newSubtitleFr, setNewSubtitleFr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDescFr, setNewDescFr] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NotificationCategory>('academic');
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [targetRole, setTargetRole] = useState<'everyone' | 'students' | 'teachers' | 'administrators'>('everyone');
  const [targetCurriculum, setTargetCurriculum] = useState<'all' | 'english' | 'french'>('all');
  const [targetSubject, setTargetSubject] = useState<string>('All Subjects');
  const [targetPlan, setTargetPlan] = useState<'all' | 'free' | 'premium'>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Dispatcher State
  const [dispatchTitle, setDispatchTitle] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchChannel, setDispatchChannel] = useState<'in_app' | 'push' | 'email'>('in_app');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAnnouncements(notificationService.getAnnouncements());
    setTemplates(notificationService.getTemplates());
    setReports(notificationService.getDeliveryReports());
    setAnalytics(notificationService.getAnalytics());
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const targetAudience: TargetAudience = {
      role: targetRole,
      curriculum: targetCurriculum,
      subject: targetSubject === 'All Subjects' ? undefined : targetSubject,
      subscriptionPlan: targetPlan
    };

    const isScheduled = Boolean(scheduleDate && new Date(scheduleDate) > new Date());

    notificationService.createAnnouncement({
      title: newTitle,
      titleFr: newTitleFr || newTitle,
      subtitle: newSubtitle,
      subtitleFr: newSubtitleFr || newSubtitle,
      description: newDesc,
      descriptionFr: newDescFr || newDesc,
      contentMarkdown: newContent,
      category: newCategory,
      targetAudience,
      priority: newPriority,
      status: isScheduled ? 'scheduled' : 'published',
      isPinned,
      publicationDate: isScheduled ? scheduleDate : new Date().toISOString(),
      authorName: 'System Administrator',
      authorRole: 'admin',
      attachments: attachmentName ? [{ id: 'att-new', name: attachmentName, url: attachmentUrl || '#', type: 'link' }] : []
    });

    setIsModalOpen(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewTitleFr('');
    setNewSubtitle('');
    setNewSubtitleFr('');
    setNewDesc('');
    setNewDescFr('');
    setNewContent('');
    setNewCategory('academic');
    setNewPriority('normal');
    setTargetRole('everyone');
    setTargetCurriculum('all');
    setTargetSubject('All Subjects');
    setTargetPlan('all');
    setIsPinned(false);
    setScheduleDate('');
    setAttachmentName('');
    setAttachmentUrl('');
  };

  const handleDeleteAnnouncement = (id: string) => {
    notificationService.deleteAnnouncement(id);
    loadData();
  };

  const handleTogglePin = (id: string) => {
    notificationService.togglePinAnnouncement(id);
    loadData();
  };

  const handleDispatchNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTitle || !dispatchMessage) return;

    notificationService.sendNotification({
      userId: 'current-user',
      type: 'general_announcement',
      category: 'general',
      title: dispatchTitle,
      message: dispatchMessage,
      priority: 'high',
      channel: dispatchChannel
    });

    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setDispatchTitle('');
      setDispatchMessage('');
    }, 2000);
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchSearch = (a.title + a.description).toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-900/20">
              <Bell className="w-7 h-7 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {language === 'fr' ? 'Gestion des Notifications & Annonces' : 'Notification & Announcement Hub'}
                </h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                  Admin Studio
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {language === 'fr'
                  ? 'Planifiez, ciblez et diffusez des annonces sur le Web et l\'application mobile Flutter'
                  : 'Schedule, target and broadcast announcements across web and Flutter mobile apps'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {language === 'fr' ? 'Nouvelle Annonce' : 'Create Announcement'}
          </button>
        </div>

        {/* Analytics Summary Bar */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  {language === 'fr' ? 'Envoyées' : 'Total Sent'}
                </div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{analytics.totalSent.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  {language === 'fr' ? 'Ouvertures Push' : 'Push Open Rate'}
                </div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{analytics.avgPushOpenRate}%</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  {language === 'fr' ? 'Ouvertures E-mail' : 'Email Open Rate'}
                </div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{analytics.avgEmailOpenRate}%</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  {language === 'fr' ? 'Livrées' : 'Delivered'}
                </div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{analytics.totalDelivered.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'announcements', label: language === 'fr' ? 'Gestion des Annonces' : 'Announcements Manager' },
            { id: 'dispatcher', label: language === 'fr' ? 'Envoi Ciblé' : 'Targeted Dispatcher' },
            { id: 'templates', label: language === 'fr' ? 'Modèles & Alertes' : 'Templates' },
            { id: 'reports', label: language === 'fr' ? 'Rapports & Analytics' : 'Reports & Analytics' },
            { id: 'settings', label: language === 'fr' ? 'Configuration' : 'System Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 font-semibold text-xs rounded-2xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ANNOUNCEMENTS MANAGER */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'Rechercher les annonces...' : 'Search announcements...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="examinations">Examinations</option>
                  <option value="assignments">Assignments</option>
                  <option value="platform_updates">Platform Updates</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.isPinned && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-indigo-700" /> Pinned
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {ann.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ann.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        ann.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ann.priority}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(ann.publicationDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{ann.description}</p>

                    {/* Target Audience Badges */}
                    <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700">Target:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{ann.targetAudience.role}</span>
                      {ann.targetAudience.curriculum && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg">Curriculum: {ann.targetAudience.curriculum}</span>
                      )}
                      {ann.targetAudience.subject && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{ann.targetAudience.subject}</span>
                      )}
                      <span className="text-slate-400 ml-auto flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {ann.viewsCount || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleTogglePin(ann.id)}
                      title="Toggle Pin"
                      className={`p-2.5 rounded-2xl border transition-colors ${
                        ann.isPinned
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'border-slate-100 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      title="Delete"
                      className="p-2.5 rounded-2xl border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TARGETED DISPATCHER */}
        {activeTab === 'dispatcher' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                {language === 'fr' ? 'Diffusion de Notifications Ciblées' : 'Targeted Push & Email Broadcast'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'fr'
                  ? 'Envoyez des alertes instantanées sur les téléphones et navigateurs de groupes cibles'
                  : 'Send real-time instant alerts directly to mobile push and in-app feeds'}
              </p>
            </div>

            <form onSubmit={handleDispatchNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Titre de la notification' : 'Notification Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., GCE Chemistry Practical Exam Alert"
                  value={dispatchTitle}
                  onChange={e => setDispatchTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Message' : 'Notification Message'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write clear and concise message..."
                  value={dispatchMessage}
                  onChange={e => setDispatchMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Canal de livraison' : 'Delivery Channel'}
                  </label>
                  <select
                    value={dispatchChannel}
                    onChange={e => setDispatchChannel(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="in_app">In-App Notification</option>
                    <option value="push">Push Notification (FCM)</option>
                    <option value="email">Email Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Audience Cible' : 'Target Audience'}
                  </label>
                  <select className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="everyone">All Active Users</option>
                    <option value="olevel">All O-Level Students</option>
                    <option value="alevel">All A-Level Students</option>
                    <option value="french">French Curriculum Students</option>
                    <option value="premium">Premium Subscribers Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {dispatchSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    {language === 'fr' ? 'Diffusé avec Succès !' : 'Broadcasted Successfully!'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {language === 'fr' ? 'Diffuser Instantanément' : 'Broadcast Instantly'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {tmpl.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium uppercase">{tmpl.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{tmpl.name}</h3>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="font-semibold text-slate-700">EN: {tmpl.subjectEn}</div>
                    <div className="text-slate-500">FR: {tmpl.subjectFr}</div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    <span className="text-[11px] font-semibold text-slate-500">Variables:</span>
                    {tmpl.variables.map(v => (
                      <span key={v} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-mono">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Recent Delivery Reports</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="py-3 px-4">Announcement Title</th>
                      <th className="py-3 px-4">Recipients</th>
                      <th className="py-3 px-4">In-App</th>
                      <th className="py-3 px-4">Push Opened</th>
                      <th className="py-3 px-4">Email Opened</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map(rep => (
                      <tr key={rep.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-800">{rep.title}</td>
                        <td className="py-3 px-4 text-slate-600">{rep.totalRecipients.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600">{rep.inAppDelivered.toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-600 font-medium">{rep.pushOpened.toLocaleString()}</td>
                        <td className="py-3 px-4 text-blue-600 font-medium">{rep.emailOpened.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(rep.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-w-2xl space-y-4 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 text-base">Global Gateway Settings</h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <div className="font-bold">Firebase Cloud Messaging (FCM)</div>
                  <div className="text-[11px] text-emerald-700">Active and synchronized for Web & Flutter Push Alerts</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 font-bold rounded-lg text-[10px]">CONNECTED</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-bold">Transactional Email Gateway</div>
                  <div className="text-[11px] text-blue-700">Multilingual HTML Templates configured for EN & FR</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-200 text-blue-900 font-bold rounded-lg text-[10px]">READY</span>
            </div>
          </div>
        )}
      </main>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {language === 'fr' ? 'Créer une Nouvelle Annonce' : 'Create New Announcement'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'fr' ? 'Remplissez les détails en Anglais et Français' : 'Provide titles & content in English & French'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="2026 GCE Mock Exam Alert"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre (Français)</label>
                  <input
                    type="text"
                    placeholder="Alerte Examen Blanc GCE 2026"
                    value={newTitleFr}
                    onChange={e => setNewTitleFr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Short summary for notifications..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Français)</label>
                  <textarea
                    rows={2}
                    placeholder="Bref résumé pour les notifications..."
                    value={newDescFr}
                    onChange={e => setNewDescFr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Content (Markdown Supported)</label>
                <textarea
                  rows={4}
                  placeholder="### Detailed Instructions..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Category, Priority, Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="academic">Academic</option>
                    <option value="examinations">Examinations</option>
                    <option value="assignments">Assignments</option>
                    <option value="platform_updates">Platform Updates</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Targeting Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Target Audience Targeting</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role Target</label>
                    <select
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="students">Students Only</option>
                      <option value="teachers">Teachers Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Curriculum</label>
                    <select
                      value={targetCurriculum}
                      onChange={e => setTargetCurriculum(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="all">All Sub-systems</option>
                      <option value="english">Anglophone (GCE)</option>
                      <option value="french">Francophone (BAC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Plan Target</label>
                    <select
                      value={targetPlan}
                      onChange={e => setTargetPlan(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="all">All Members</option>
                      <option value="free">Free Subscribers</option>
                      <option value="premium">Premium Pro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Attachment Name (e.g. Timetable.pdf)"
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Attachment Link URL"
                  value={attachmentUrl}
                  onChange={e => setAttachmentUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700">
                  Pin this announcement to top of notification feeds
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
