import {
  Announcement,
  UserNotification,
  NotificationPreference,
  NotificationTemplate,
  DeliveryReport,
  NotificationAnalyticsData,
  TargetAudience,
  NotificationCategory,
  NotificationType,
  DeliveryChannel
} from '../types';

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '2026 Cameroon GCE National Mock Examination Timetable',
    titleFr: 'Emploi du temps de l\'Examen Blanc National du GCE 2026',
    subtitle: 'Official timetable published for General & Technical Education',
    subtitleFr: 'Emploi du temps officiel publié pour le sous-système Anglophone et Francophone',
    description: 'The National Inspectorate of Education has released the official timetable for the upcoming GCE O-Level and A-Level Mock Examinations starting next month.',
    descriptionFr: 'L\'Inspection Nationale de l\'Éducation a publié l\'emploi du temps officiel des examens blancs du GCE O-Level et A-Level.',
    contentMarkdown: `### Key Highlights:
- **O-Level Exams Start:** Monday, May 11, 2026
- **A-Level Science Practical:** Wednesday, May 13, 2026
- **General Rules:** All candidates must arrive 30 minutes before time with their registered candidate cards.
- **Edulpha Prep:** Use our GCE Exam Engine to access past questions with instant marking schemes!`,
    contentMarkdownFr: `### Points Clés:
- **Début du O-Level:** Lundi 11 Mai 2026
- **Travaux Pratiques A-Level:** Mercredi 13 Mai 2026
- **Instructions:** Présentez-vous 30 minutes à l'avance avec votre carte de candidat.`,
    category: 'examinations',
    targetAudience: { role: 'everyone', curriculum: 'all' },
    priority: 'urgent',
    status: 'published',
    isPinned: true,
    publicationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'National Admin Team',
    authorRole: 'admin',
    viewsCount: 1420,
    attachments: [
      { id: 'att-1', name: 'GCE_2026_Mock_Timetable.pdf', url: '#', type: 'pdf' },
      { id: 'att-2', name: 'Exam Instructions Guide', url: '#', type: 'link' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann-2',
    title: 'Edulpha AI 2.0 Engine Upgrade Live',
    titleFr: 'Mise à niveau de l\'Intelligence Artificielle Edulpha 2.0',
    subtitle: 'Enhanced weak-topic detection and custom study plans in English & French',
    subtitleFr: 'Détection améliorée des sujets faibles et plans d\'études personnalisés en Anglais et Français',
    description: 'We have updated our AI diagnostic algorithms to generate personalized 7-day study sprints tailored specifically for Cameroon GCE and Baccalauréat syllabi.',
    descriptionFr: 'Nous avons mis à jour nos algorithmes IA pour générer des sprints d\'étude de 7 jours personnalisés.',
    contentMarkdown: `### What's New in AI 2.0?
- Real-time step-by-step guidance for Physics & Chemistry calculations.
- Instant French-to-English translation of technical terms.
- Automated progress tracking synchronized with mobile app push alerts.`,
    category: 'platform_updates',
    targetAudience: { role: 'students', subscriptionPlan: 'all' },
    priority: 'high',
    status: 'published',
    isPinned: true,
    publicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'Edulpha Tech Team',
    authorRole: 'admin',
    viewsCount: 980,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ann-3',
    title: 'Live Mathematics Revision Webinar with Lead Examiner',
    titleFr: 'Webinaire de Révision en Mathématiques avec un Examinateur Principal',
    subtitle: 'Mastering Pure Maths Paper 2 Complex Numbers & Calculus',
    subtitleFr: 'Maîtriser les Nombres Complexes et le Calcul Intégral',
    description: 'Join Mr. Nkwenti for an interactive live streaming session breaking down the most frequent GCE A-Level exam questions.',
    descriptionFr: 'Rejoignez M. Nkwenti pour une session en direct expliquant les problèmes classiques du GCE A-Level.',
    category: 'academic',
    targetAudience: { role: 'students', subject: 'Mathematics' },
    priority: 'normal',
    status: 'published',
    isPinned: false,
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: 'Mr. Nkwenti (Senior Math Teacher)',
    authorRole: 'teacher',
    viewsCount: 560,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_USER_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif-1',
    userId: 'current-user',
    announcementId: 'ann-1',
    type: 'general_announcement',
    category: 'examinations',
    title: '2026 GCE National Mock Exam Timetable Released',
    titleFr: 'Emploi du temps de l\'Examen Blanc GCE 2026 Publié',
    message: 'The official GCE mock examination schedule is now available. Click to review key exam dates.',
    messageFr: 'L\'emploi du temps officiel des examens blancs est disponible. Cliquez pour consulter les dates.',
    link: '/exams',
    priority: 'urgent',
    isRead: false,
    isBookmarked: true,
    isArchived: false,
    channel: 'in_app',
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    userId: 'current-user',
    type: 'ai_recommendation',
    category: 'academic',
    title: 'Edulpha AI: Revision Recommended',
    titleFr: 'IA Edulpha : Révision Recommandée',
    message: 'We noticed a 45% score on Quadratic Equations in your last quiz. Take a quick 10-minute micro-lesson.',
    messageFr: 'Nous avons décelé des lacunes sur les Équations du Second Degré. Suivez une micro-leçon de 10 min.',
    link: '/lms',
    priority: 'high',
    isRead: false,
    isBookmarked: false,
    isArchived: false,
    channel: 'in_app',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'current-user',
    type: 'assignment_reminder',
    category: 'assignments',
    title: 'Assignment Due Tomorrow',
    titleFr: 'Devoir à Remettre Demain',
    message: 'Pure Maths Paper 2 Calculus Worksheet submission closes on Saturday at 11:59 PM.',
    messageFr: 'La remise du devoir de Mathématiques Pures se termine samedi à 23h59.',
    link: '/lms',
    priority: 'high',
    isRead: true,
    isBookmarked: false,
    isArchived: false,
    channel: 'in_app',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    readAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-4',
    userId: 'current-user',
    type: 'achievement_earned',
    category: 'general',
    title: 'Badge Unlocked: Master Scholar!',
    titleFr: 'Badge Débloqué : Érudit d\'Élite !',
    message: 'Congratulations! You completed 50 GCE exam practice questions with an accuracy above 80%.',
    messageFr: 'Félicitations ! Vous avez complété 50 questions d\'examen GCE avec une précision supérieure à 80%.',
    link: '/challenges',
    priority: 'normal',
    isRead: true,
    isBookmarked: true,
    isArchived: false,
    channel: 'in_app',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    readAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-5',
    userId: 'current-user',
    type: 'discussion_reply',
    category: 'general',
    title: 'New Reply in Physics Discussion Forum',
    titleFr: 'Nouvelle Réponse sur le Forum de Physique',
    message: 'Mr. Nkwenti answered your question regarding Newton\'s Second Law in circular motion.',
    messageFr: 'M. Nkwenti a répondu à votre question sur la Deuxième Loi de Newton.',
    link: '/forum',
    priority: 'normal',
    isRead: false,
    isBookmarked: false,
    isArchived: false,
    channel: 'in_app',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_PREFERENCES: NotificationPreference = {
  userId: 'current-user',
  inAppEnabled: true,
  pushEnabled: true,
  emailEnabled: true,
  assignmentNotifications: true,
  aiNotifications: true,
  paymentNotifications: true,
  discussionNotifications: true,
  achievementNotifications: true,
  reminderNotifications: true,
  languagePreference: 'en',
  soundEnabled: true,
  vibrationEnabled: true
};

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Assignment Submission Reminder',
    code: 'ASSIGNMENT_REMINDER',
    category: 'assignments',
    subjectEn: 'Reminder: Assignment "{{assignmentName}}" is due soon!',
    subjectFr: 'Rappel : Le devoir "{{assignmentName}}" est à rendre bientôt !',
    bodyEn: 'Hello {{studentName}}, your assignment for {{subject}} is due on {{dueDate}}. Please submit on time.',
    bodyFr: 'Bonjour {{studentName}}, votre devoir de {{subject}} est dû le {{dueDate}}. Veuillez le soumettre à temps.',
    variables: ['studentName', 'assignmentName', 'subject', 'dueDate']
  },
  {
    id: 'tmpl-2',
    name: 'GCE Mock Examination Alert',
    code: 'MOCK_EXAM_ALERT',
    category: 'examinations',
    subjectEn: 'Upcoming GCE Mock Exam: {{examTitle}}',
    subjectFr: 'Examen Blanc GCE Imminent : {{examTitle}}',
    bodyEn: 'Dear {{studentName}}, your {{subject}} exam is scheduled for {{examDate}} at {{examTime}}.',
    bodyFr: 'Cher(e) {{studentName}}, votre examen de {{subject}} est prévu le {{examDate}} à {{examTime}}.',
    variables: ['studentName', 'examTitle', 'subject', 'examDate', 'examTime']
  },
  {
    id: 'tmpl-3',
    name: 'AI Weak Topic Study Plan',
    code: 'AI_STUDY_PLAN',
    category: 'academic',
    subjectEn: 'Edulpha AI: Specialized Study Sprint for {{topic}}',
    subjectFr: 'IA Edulpha : Sprint d\'Étude Personnalisé pour {{topic}}',
    bodyEn: 'Hi {{studentName}}, our AI analyzed your recent scores and created a 15-minute practice session on {{topic}}.',
    bodyFr: 'Salut {{studentName}}, notre IA a analysé vos résultats récents et a conçu une session de 15 min sur {{topic}}.',
    variables: ['studentName', 'topic']
  }
];

const INITIAL_DELIVERY_REPORTS: DeliveryReport[] = [
  {
    id: 'rep-1',
    announcementId: 'ann-1',
    title: '2026 Cameroon GCE National Mock Examination Timetable',
    totalRecipients: 4850,
    inAppDelivered: 4850,
    pushDelivered: 4620,
    pushOpened: 3120,
    emailSent: 4850,
    emailOpened: 2980,
    failed: 12,
    timestamp: new Date().toISOString()
  },
  {
    id: 'rep-2',
    announcementId: 'ann-2',
    title: 'Edulpha AI 2.0 Engine Upgrade Live',
    totalRecipients: 3400,
    inAppDelivered: 3400,
    pushDelivered: 3250,
    pushOpened: 1890,
    emailSent: 3400,
    emailOpened: 1720,
    failed: 5,
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

class NotificationService {
  private announcementsKey = 'gb60_announcements';
  private notificationsKey = 'gb60_user_notifications';
  private preferencesKey = 'gb60_user_preferences';
  private templatesKey = 'gb60_notification_templates';

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (!localStorage.getItem(this.announcementsKey)) {
      localStorage.setItem(this.announcementsKey, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    }
    if (!localStorage.getItem(this.notificationsKey)) {
      localStorage.setItem(this.notificationsKey, JSON.stringify(INITIAL_USER_NOTIFICATIONS));
    }
    if (!localStorage.getItem(this.preferencesKey)) {
      localStorage.setItem(this.preferencesKey, JSON.stringify(DEFAULT_PREFERENCES));
    }
    if (!localStorage.getItem(this.templatesKey)) {
      localStorage.setItem(this.templatesKey, JSON.stringify(INITIAL_TEMPLATES));
    }
  }

  // ANNOUNCEMENTS API
  getAnnouncements(): Announcement[] {
    const raw = localStorage.getItem(this.announcementsKey);
    return raw ? JSON.parse(raw) : INITIAL_ANNOUNCEMENTS;
  }

  getAnnouncementById(id: string): Announcement | undefined {
    return this.getAnnouncements().find(a => a.id === id);
  }

  createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'viewsCount'>): Announcement {
    const announcements = this.getAnnouncements();
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      viewsCount: 0,
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    localStorage.setItem(this.announcementsKey, JSON.stringify(announcements));

    // Also trigger automated notifications for targeted audience
    this.triggerTargetedNotificationsForAnnouncement(newAnn);

    return newAnn;
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const announcements = this.getAnnouncements();
    const idx = announcements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    announcements[idx] = { ...announcements[idx], ...updates };
    localStorage.setItem(this.announcementsKey, JSON.stringify(announcements));
    return announcements[idx];
  }

  deleteAnnouncement(id: string): boolean {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    localStorage.setItem(this.announcementsKey, JSON.stringify(filtered));
    return true;
  }

  togglePinAnnouncement(id: string): Announcement | null {
    const ann = this.getAnnouncementById(id);
    if (!ann) return null;
    return this.updateAnnouncement(id, { isPinned: !ann.isPinned });
  }

  incrementAnnouncementViews(id: string) {
    const ann = this.getAnnouncementById(id);
    if (ann) {
      this.updateAnnouncement(id, { viewsCount: (ann.viewsCount || 0) + 1 });
    }
  }

  // USER NOTIFICATIONS API
  getUserNotifications(userId: string = 'current-user'): UserNotification[] {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    return list.filter(n => n.userId === userId || n.userId === 'current-user');
  }

  markAsRead(id: string): boolean {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    const item = list.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      item.readAt = new Date().toISOString();
      localStorage.setItem(this.notificationsKey, JSON.stringify(list));
      return true;
    }
    return false;
  }

  markAllAsRead(userId: string = 'current-user'): boolean {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    list.forEach(n => {
      if (n.userId === userId || n.userId === 'current-user') {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      }
    });
    localStorage.setItem(this.notificationsKey, JSON.stringify(list));
    return true;
  }

  toggleBookmark(id: string): boolean {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    const item = list.find(n => n.id === id);
    if (item) {
      item.isBookmarked = !item.isBookmarked;
      localStorage.setItem(this.notificationsKey, JSON.stringify(list));
      return true;
    }
    return false;
  }

  archiveNotification(id: string): boolean {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    const item = list.find(n => n.id === id);
    if (item) {
      item.isArchived = true;
      localStorage.setItem(this.notificationsKey, JSON.stringify(list));
      return true;
    }
    return false;
  }

  deleteNotification(id: string): boolean {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    const filtered = list.filter(n => n.id !== id);
    localStorage.setItem(this.notificationsKey, JSON.stringify(filtered));
    return true;
  }

  sendNotification(notification: Omit<UserNotification, 'id' | 'createdAt' | 'isRead' | 'isBookmarked' | 'isArchived'>): UserNotification {
    const raw = localStorage.getItem(this.notificationsKey);
    const list: UserNotification[] = raw ? JSON.parse(raw) : INITIAL_USER_NOTIFICATIONS;
    const newNotif: UserNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      isBookmarked: false,
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    localStorage.setItem(this.notificationsKey, JSON.stringify(list));
    return newNotif;
  }

  private triggerTargetedNotificationsForAnnouncement(ann: Announcement) {
    // Generate an in-app notification entry for the active user session
    this.sendNotification({
      userId: 'current-user',
      announcementId: ann.id,
      type: 'general_announcement',
      category: ann.category,
      title: ann.title,
      titleFr: ann.titleFr,
      message: ann.subtitle || ann.description,
      messageFr: ann.subtitleFr || ann.descriptionFr,
      priority: ann.priority,
      channel: 'in_app'
    });
  }

  // PREFERENCES API
  getPreferences(userId: string = 'current-user'): NotificationPreference {
    const raw = localStorage.getItem(this.preferencesKey);
    return raw ? JSON.parse(raw) : DEFAULT_PREFERENCES;
  }

  updatePreferences(userId: string = 'current-user', updates: Partial<NotificationPreference>): NotificationPreference {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...updates };
    localStorage.setItem(this.preferencesKey, JSON.stringify(updated));
    return updated;
  }

  // TEMPLATES API
  getTemplates(): NotificationTemplate[] {
    const raw = localStorage.getItem(this.templatesKey);
    return raw ? JSON.parse(raw) : INITIAL_TEMPLATES;
  }

  saveTemplate(tmpl: Omit<NotificationTemplate, 'id'> & { id?: string }): NotificationTemplate {
    const templates = this.getTemplates();
    if (tmpl.id) {
      const idx = templates.findIndex(t => t.id === tmpl.id);
      if (idx !== -1) {
        templates[idx] = tmpl as NotificationTemplate;
      }
    } else {
      const newTmpl: NotificationTemplate = {
        ...(tmpl as any),
        id: `tmpl-${Date.now()}`
      };
      templates.push(newTmpl);
    }
    localStorage.setItem(this.templatesKey, JSON.stringify(templates));
    return tmpl as NotificationTemplate;
  }

  // DELIVERY REPORTS & ANALYTICS
  getDeliveryReports(): DeliveryReport[] {
    return INITIAL_DELIVERY_REPORTS;
  }

  getAnalytics(): NotificationAnalyticsData {
    return {
      totalSent: 18450,
      totalDelivered: 18120,
      totalOpened: 12480,
      avgEmailOpenRate: 64.5,
      avgPushOpenRate: 67.8,
      deliveryByDay: [
        { date: 'Mon', sent: 2400, opened: 1650 },
        { date: 'Tue', sent: 3100, opened: 2150 },
        { date: 'Wed', sent: 2800, opened: 1980 },
        { date: 'Thu', sent: 4200, opened: 2900 },
        { date: 'Fri', sent: 3900, opened: 2650 },
        { date: 'Sat', sent: 1250, opened: 820 },
        { date: 'Sun', sent: 800, opened: 530 }
      ],
      topAnnouncements: [
        { id: 'ann-1', title: '2026 GCE National Mock Exam Timetable', views: 1420 },
        { id: 'ann-2', title: 'Edulpha AI 2.0 Engine Upgrade Live', views: 980 },
        { id: 'ann-3', title: 'Live Mathematics Revision Webinar', views: 560 }
      ]
    };
  }
}

export const notificationService = new NotificationService();
