import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  GraduationCap,
  FlaskConical,
  MessageSquare,
  CreditCard,
  BarChart3,
  Layers,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  HelpCircle,
  UserCheck,
  Award,
  ExternalLink,
  RefreshCw,
  Sliders,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { cn } from '../ui';
import GlobalSearchModal from '../navigation/GlobalSearchModal';
import { FeedbackModal } from '../FeedbackModal';

export interface NavSubItem {
  id: string;
  label: string;
  labelFr?: string;
  tab?: string;
  path?: string;
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  labelFr?: string;
  icon: React.ElementType;
  tab?: string;
  path?: string;
  subItems?: NavSubItem[];
}

interface ModernDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  pageTitle?: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
  role?: 'admin' | 'teacher' | 'student';
  customGroups?: NavGroup[];
}

export default function ModernDashboardLayout({
  children,
  activeTab = 'overview',
  onSelectTab,
  pageTitle,
  pageSubtitle,
  actions,
  role: propRole,
  customGroups,
}: ModernDashboardLayoutProps) {
  const { user, isAdmin, isTeacher, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { appName, platformLogoUrl, contactEmail, whatsappNumber } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  // Effective Role Determination
  const effectiveRole: 'admin' | 'teacher' | 'student' = propRole || (isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student');

  // Sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    learning: true,
    examinations: true,
    students: false,
    teachers: false,
    labs: false,
    community: false,
    finance: false,
    content: false,
    settings: false,
  });

  // Modals & Popovers state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Mocked/Real notifications for header
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      category: 'System',
      title: 'Real-time telemetry online',
      time: '5m ago',
      read: false,
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      id: 'n2',
      category: 'Examinations',
      title: '2025 MINESEC General Mock uploaded',
      time: '30m ago',
      read: false,
      icon: FileText,
      color: 'text-indigo-500',
    },
    {
      id: 'n3',
      category: 'Students',
      title: '14 new student subscriptions confirmed',
      time: '2h ago',
      read: false,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      id: 'n4',
      category: 'Security',
      title: 'Weekly automated security audit complete',
      time: '1d ago',
      read: true,
      icon: Shield,
      color: 'text-slate-400',
    },
  ]);

  // Handle keyboard shortcut for Global Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme toggle handler
  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleTabClick = (tab?: string, path?: string) => {
    setIsMobileOpen(false);
    if (onSelectTab && tab) {
      onSelectTab(tab);
    } else if (path) {
      navigate(path);
    } else if (tab) {
      navigate(`/admin?tab=${tab}`);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Admin Navigation Groups definition
  const adminNavigationGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelFr: 'Tableau de bord',
      icon: LayoutDashboard,
      tab: 'overview',
    },
    {
      id: 'learning',
      label: 'Learning & LMS',
      labelFr: 'Apprentissage & LMS',
      icon: BookOpen,
      subItems: [
        { id: 'curriculum', label: 'Courses & Programs', labelFr: 'Cours & Programmes', tab: 'curriculum' },
        { id: 'subjects', label: 'Subjects & Streams', labelFr: 'Matières & Séries', tab: 'subjects' },
        { id: 'lms', label: 'Lessons & Content', labelFr: 'Leçons & Contenu', tab: 'lms' },
        { id: 'academic-hierarchy', label: 'Academic Hierarchy', labelFr: 'Hiérarchie Académique', tab: 'academic-hierarchy' },
        { id: 'hnd', label: 'HND & BTS Specialties', labelFr: 'Spécialités HND & BTS', tab: 'hnd' },
      ],
    },
    {
      id: 'examinations',
      label: 'Examinations',
      labelFr: 'Examens & Épreuves',
      icon: FileText,
      subItems: [
        { id: 'assessments', label: 'Assessment Engine', labelFr: 'Moteur d’Évaluation', tab: 'assessments' },
        { id: 'questions', label: 'Question Bank', labelFr: 'Banque de Questions', tab: 'questions' },
        { id: 'paper-generator', label: 'Paper Generator (GCE)', labelFr: 'Générateur d’Épreuves', path: '/admin/paper-generator', badge: 'AI' },
        { id: 'papers', label: 'Question Papers Archive', labelFr: 'Archives des Épreuves', tab: 'papers' },
        { id: 'samples', label: 'Free Sample Questions', labelFr: 'Questions Échantillons', tab: 'samples' },
      ],
    },
    {
      id: 'students',
      label: 'Students',
      labelFr: 'Élèves & Étudiants',
      icon: Users,
      subItems: [
        { id: 'users', label: 'Student Directory', labelFr: 'Répertoire Élèves', tab: 'users' },
        { id: 'reports', label: 'Student Performance', labelFr: 'Performances Élèves', tab: 'reports' },
        { id: 'ambassadors', label: 'Student Ambassadors', labelFr: 'Ambassadeurs Élèves', tab: 'ambassadors' },
        { id: 'referrals', label: 'Referral Rewards', labelFr: 'Système de Parrainage', tab: 'referrals' },
        { id: 'duels', label: 'Duel Arena Battles', labelFr: 'Arène de Duels', tab: 'duels' },
      ],
    },
    {
      id: 'teachers',
      label: 'Teachers',
      labelFr: 'Enseignants',
      icon: GraduationCap,
      subItems: [
        { id: 'teachers-list', label: 'Teacher Roster', labelFr: 'Liste Enseignants', tab: 'users' },
        { id: 'teacher-studio', label: 'Teacher Studio', labelFr: 'Studio Enseignant', path: '/teacher-dashboard' },
        { id: 'teacher-progression', label: 'Progression Sheets & AI', labelFr: 'Cahiers de Texte & IA', path: '/teacher-dashboard?tab=ai_studio' },
      ],
    },
    {
      id: 'labs',
      label: 'Virtual Labs',
      labelFr: 'Laboratoires Virtuels',
      icon: FlaskConical,
      subItems: [
        { id: 'lab-chem', label: 'Chemistry Lab', labelFr: 'Laboratoire Chimie', path: '/practicals/chemistry', badge: '3D' },
        { id: 'lab-bio', label: 'Biology Lab', labelFr: 'Laboratoire Biologie', path: '/practicals/biology', badge: 'Sim' },
        { id: 'lab-phys', label: 'Physics Lab', labelFr: 'Laboratoire Physique', path: '/practicals/physics', badge: 'Lab' },
        { id: 'lab-all', label: 'All Practical Labs', labelFr: 'Tous les Travaux Pratiques', path: '/practicals' },
      ],
    },
    {
      id: 'community',
      label: 'Community',
      labelFr: 'Communauté',
      icon: MessageSquare,
      subItems: [
        { id: 'notifications', label: 'Announcements & Push', labelFr: 'Annonces & Notifications', tab: 'notifications' },
        { id: 'testimonials', label: 'Student Testimonials', labelFr: 'Témoignages Élèves', tab: 'testimonials' },
        { id: 'forum', label: 'Discussion Forum', labelFr: 'Forum de Discussion', path: '/forum' },
        { id: 'alumni', label: 'Alumni Network', labelFr: 'Réseau des Anciens', tab: 'alumni' },
      ],
    },
    {
      id: 'finance',
      label: 'Finance & Payments',
      labelFr: 'Finance & Paiements',
      icon: CreditCard,
      subItems: [
        { id: 'payments', label: 'Payment Transactions', labelFr: 'Transactions & Paiements', tab: 'payments' },
        { id: 'manual', label: 'Manual Approvals (Momo/OM)', labelFr: 'Validations Manuelles', tab: 'manual', badge: 'Pending' },
        { id: 'plans', label: 'Subscription Plans', labelFr: 'Formules d’Abonnement', tab: 'plans' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      labelFr: 'Analytiques & Rapports',
      icon: BarChart3,
      path: '/admin/analytics',
      tab: 'reports',
    },
    {
      id: 'content',
      label: 'Content & System',
      labelFr: 'Contenu & Système',
      icon: Layers,
      subItems: [
        { id: 'documents', label: 'Document Repository', labelFr: 'Dépôt de Documents', tab: 'documents' },
        { id: 'partners', label: 'Partners & Institutions', labelFr: 'Partenaires & Écoles', tab: 'partners' },
        { id: 'footer', label: 'Footer Management', labelFr: 'Gestion Pied de Page', tab: 'footer' },
        { id: 'audit-log', label: 'Audit & Security Logs', labelFr: 'Journal de Sécurité', tab: 'audit-log' },
        { id: 'system-data', label: 'System Backup & Export', labelFr: 'Sauvegarde & Données', tab: 'system-data' },
      ],
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      labelFr: 'Paramètres Plateforme',
      icon: Settings,
      subItems: [
        { id: 'settings-general', label: 'General Configuration', labelFr: 'Configuration Générale', tab: 'settings' },
        { id: 'branding', label: 'Branding & Identity', labelFr: 'Image de Marque & Logos', tab: 'branding' },
        { id: 'translations', label: 'Languages & Translation', labelFr: 'Langues & Traductions', tab: 'translations' },
        { id: 'navigation', label: 'Navigation Menu Links', labelFr: 'Liens de Navigation', tab: 'navigation' },
      ],
    },
  ];

  // Teacher Navigation Groups
  const teacherNavigationGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Teacher Hub',
      labelFr: 'Espace Enseignant',
      icon: LayoutDashboard,
      tab: 'performance',
    },
    {
      id: 'classroom',
      label: 'Classroom & Lessons',
      labelFr: 'Classes & Leçons',
      icon: BookOpen,
      subItems: [
        { id: 't-lessons', label: 'My Lessons & Notes', labelFr: 'Mes Leçons & Notes', tab: 'lessons' },
        { id: 't-videos', label: 'Video Lectures', labelFr: 'Vidéos de Cours', tab: 'videos' },
        { id: 't-pdfs', label: 'Study Guides & PDFs', labelFr: 'Guides & Polycopies', tab: 'pdfs' },
        { id: 't-progression', label: 'Progression Sheets & AI', labelFr: 'Cahiers de Texte & IA', tab: 'ai_studio', badge: 'AI' },
      ],
    },
    {
      id: 'assessments',
      label: 'Assessments & Exams',
      labelFr: 'Évaluations & Examens',
      icon: FileText,
      subItems: [
        { id: 't-mocks', label: 'Mock Exam Builder', labelFr: 'Conception d’Examens', tab: 'mock_exams' },
        { id: 't-quizzes', label: 'Quizzes & Assignments', labelFr: 'Quiz & Devoirs', tab: 'quizzes' },
        { id: 't-generator', label: 'GCE Paper Generator', labelFr: 'Générateur GCE', path: '/admin/paper-generator', badge: 'AI' },
        { id: 't-marking', label: 'Marking Schemes', labelFr: 'Barèmes & Corrigés', tab: 'marking_schemes' },
      ],
    },
    {
      id: 'labs',
      label: 'Virtual Labs',
      labelFr: 'Laboratoires Virtuels',
      icon: FlaskConical,
      path: '/practicals',
    },
    {
      id: 'community',
      label: 'Community & Students',
      labelFr: 'Communauté & Élèves',
      icon: MessageSquare,
      subItems: [
        { id: 't-forum', label: 'Discussion Forum', labelFr: 'Forum d’Échange', path: '/forum' },
        { id: 't-discussions', label: 'Student Questions', labelFr: 'Questions d’Élèves', tab: 'discussions' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings & Profile',
      labelFr: 'Paramètres & Profil',
      icon: Settings,
      subItems: [
        { id: 't-profile', label: 'Teacher Profile', labelFr: 'Profil Enseignant', path: '/profile' },
        { id: 't-settings', label: 'Preferences', labelFr: 'Préférences', tab: 'settings' },
      ],
    },
  ];

  // Student Navigation Groups
  const studentNavigationGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Study Hub',
      labelFr: 'Espace d’Étude',
      icon: LayoutDashboard,
      tab: 'overview',
      path: '/dashboard',
    },
    {
      id: 'learning',
      label: 'Courses & LMS',
      labelFr: 'Cours & Formations',
      icon: BookOpen,
      subItems: [
        { id: 's-courses', label: 'My Enrolled Courses', labelFr: 'Mes Cours Inscrits', path: '/courses', tab: 'my_courses' },
        { id: 's-lessons', label: 'Lessons Library', labelFr: 'Bibliothèque de Leçons', path: '/lessons', tab: 'lessons' },
        { id: 's-study-plans', label: 'Study Timetables', labelFr: 'Plannings d’Étude', path: '/study-plans', tab: 'study_plans' },
        { id: 's-notes', label: 'Study Notes & Summaries', labelFr: 'Fiches de Synthèse', path: '/notes', tab: 'notes' },
        { id: 's-downloads', label: 'Offline Downloads', labelFr: 'Téléchargements Hors-ligne', path: '/downloads', tab: 'downloads' },
        { id: 's-digital-school', label: 'Digital School', labelFr: 'École Numérique', path: '/digital-school' },
      ],
    },
    {
      id: 'examinations',
      label: 'Exams & Practice',
      labelFr: 'Examens & Exercices',
      icon: FileText,
      subItems: [
        { id: 's-practice', label: 'Practice Mode', labelFr: 'Mode Entraînement', path: '/practice', tab: 'practice' },
        { id: 's-past-questions', label: 'Past Exam Papers', labelFr: 'Anciennes Épreuves', path: '/past-questions', tab: 'past_questions' },
        { id: 's-mock-exams', label: 'National Mock Exams', labelFr: 'Examens Blancs', path: '/exams', tab: 'mock_exams' },
        { id: 's-daily-drill', label: 'Daily Knowledge Drill', labelFr: 'Défi Quotidien', path: '/daily-drill' },
        { id: 's-challenges', label: 'Arena & Duels', labelFr: 'Arène & Duels', path: '/challenges' },
        { id: 's-leaderboard', label: 'National Leaderboard', labelFr: 'Classement National', path: '/leaderboard' },
      ],
    },
    {
      id: 'labs',
      label: 'Virtual Labs',
      labelFr: 'Laboratoires Virtuels',
      icon: FlaskConical,
      subItems: [
        { id: 's-chem', label: 'Chemistry Lab', labelFr: 'Laboratoire Chimie', path: '/practicals/chemistry', badge: '3D' },
        { id: 's-bio', label: 'Biology Lab', labelFr: 'Laboratoire Biologie', path: '/practicals/biology', badge: 'Sim' },
        { id: 's-phys', label: 'Physics Lab', labelFr: 'Laboratoire Physique', path: '/practicals/physics', badge: 'Lab' },
        { id: 's-all-labs', label: 'All Practical Experiments', labelFr: 'Tous les Travaux Pratiques', path: '/practicals' },
      ],
    },
    {
      id: 'community',
      label: 'AI & Community',
      labelFr: 'IA & Communauté',
      icon: MessageSquare,
      subItems: [
        { id: 's-ai-tutor', label: 'Edulpha AI 24/7 Tutor', labelFr: 'Tuteur IA Edulpha', path: '/ai-tutor', tab: 'ai_tutor', badge: 'AI' },
        { id: 's-forum', label: 'Discussion Forum', labelFr: 'Forum d’Entraide', path: '/forum', tab: 'forum' },
        { id: 's-referrals', label: 'Refer & Earn Credits', labelFr: 'Parrainage & Crédits', tab: 'referrals' },
      ],
    },
    {
      id: 'settings',
      label: 'Account & Plan',
      labelFr: 'Compte & Forfait',
      icon: Settings,
      subItems: [
        { id: 's-profile', label: 'Student Profile', labelFr: 'Profil Étudiant', path: '/profile' },
        { id: 's-pricing', label: 'Upgrade Subscription', labelFr: 'Passer au Forfait Pro', path: '/pricing' },
        { id: 's-mobile', label: 'Mobile App Download', labelFr: 'Application Mobile', path: '/mobile-app' },
      ],
    },
  ];

  // Active navigation groups list
  const navigationGroups: NavGroup[] =
    customGroups ||
    (effectiveRole === 'student'
      ? studentNavigationGroups
      : effectiveRole === 'teacher'
      ? teacherNavigationGroups
      : adminNavigationGroups);

  // Helper to check if a group or subitem is active
  const isTabActive = (itemTab?: string, itemPath?: string) => {
    if (itemTab && activeTab === itemTab) return true;
    if (itemPath && (location.pathname === itemPath || location.pathname + location.search === itemPath)) return true;
    return false;
  };

  const isGroupActive = (group: NavGroup) => {
    if (group.tab && activeTab === group.tab) return true;
    if (group.path && location.pathname === group.path) return true;
    if (group.subItems) {
      return group.subItems.some((sub) => isTabActive(sub.tab, sub.path));
    }
    return false;
  };

  // Determine current breadcrumbs based on activeTab
  const getBreadcrumbs = () => {
    let currentGroupName = 'Dashboard';
    let currentItemName = 'Overview';

    for (const group of navigationGroups) {
      if (group.tab === activeTab) {
        currentGroupName = language === 'fr' && group.labelFr ? group.labelFr : group.label;
        currentItemName = '';
        break;
      }
      if (group.subItems) {
        const found = group.subItems.find((s) => s.tab === activeTab);
        if (found) {
          currentGroupName = language === 'fr' && group.labelFr ? group.labelFr : group.label;
          currentItemName = language === 'fr' && found.labelFr ? found.labelFr : found.label;
          break;
        }
      }
    }

    return {
      group: currentGroupName,
      item: currentItemName || (pageTitle || 'Overview'),
    };
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP BAR (STICKY HEADER)                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4 max-w-[1600px] mx-auto w-full">
          {/* Left: Mobile Toggle, Brand & Breadcrumbs */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Navigation Drawer"
            >
              <Menu size={20} />
            </button>

            {/* Desktop Brand Icon (when collapsed or header branding) */}
            <Link 
              to={effectiveRole === 'admin' ? '/admin' : effectiveRole === 'teacher' ? '/teacher' : '/dashboard'} 
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <img
                src={platformLogoUrl || '/edulpha-logo.png'}
                alt={`${appName} Logo`}
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="hidden sm:inline-block font-black text-lg tracking-tight text-slate-900 dark:text-white">
                {appName.toUpperCase()}
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-md">
                {effectiveRole === 'admin' ? 'Admin' : effectiveRole === 'teacher' ? 'Teacher' : 'Student'}
              </span>
            </Link>

            {/* Breadcrumb Path Divider */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{breadcrumbs.group}</span>
              {breadcrumbs.item && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[200px]">
                    {breadcrumbs.item}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Center/Right: Global Search, Quick Actions, Theme, Language, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Bar (with ⌘K shortcut trigger) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-medium transition-all group shadow-sm w-36 sm:w-56 md:w-72 justify-between"
              aria-label="Search platform (Ctrl+K)"
            >
              <div className="flex items-center gap-2 truncate">
                <Search size={15} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                <span className="truncate">{t('nav.search', 'Search platform...')}</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Quick Action Button */}
            <div className="relative">
              <button
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-indigo-500/20 active:scale-95"
              >
                <Plus size={15} />
                <span>{t('admin.quickAction', 'Action')}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200", isQuickActionOpen && "rotate-180")} />
              </button>

              {/* Quick Action Dropdown */}
              <AnimatePresence>
                {isQuickActionOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsQuickActionOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 space-y-1"
                    >
                      <button
                        onClick={() => {
                          setIsQuickActionOpen(false);
                          navigate('/admin/paper-generator');
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors text-left"
                      >
                        <Sparkles size={16} className="text-indigo-600" />
                        <span>Generate Exam Paper</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsQuickActionOpen(false);
                          handleTabClick('questions');
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors text-left"
                      >
                        <FileText size={16} className="text-emerald-600" />
                        <span>Add Question to Bank</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsQuickActionOpen(false);
                          handleTabClick('lms');
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors text-left"
                      >
                        <BookOpen size={16} className="text-amber-600" />
                        <span>Create LMS Lesson</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsQuickActionOpen(false);
                          handleTabClick('users');
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors text-left"
                      >
                        <Users size={16} className="text-purple-600" />
                        <span>Manage Students</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                aria-label="Select Language"
              >
                <span className="text-sm">{language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                <span className="hidden sm:inline-block uppercase">{language}</span>
                <ChevronDown size={12} className="hidden sm:inline-block text-slate-400" />
              </button>

              <AnimatePresence>
                {isLanguageMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLanguageMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 space-y-1"
                    >
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setIsLanguageMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-xs font-bold rounded-xl transition-colors text-left",
                          language === 'en'
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>🇬🇧</span> English
                        </span>
                        {language === 'en' && <CheckCircle2 size={14} />}
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('fr');
                          setIsLanguageMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-xs font-bold rounded-xl transition-colors text-left",
                          language === 'fr'
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>🇫🇷</span> Français
                        </span>
                        {language === 'fr' && <CheckCircle2 size={14} />}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
              aria-label="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
                aria-label="View Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                            {t('nav.notifications', 'Notifications')}
                          </h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "p-3 rounded-2xl border transition-colors flex items-start gap-3",
                              n.read
                                ? "bg-slate-50/50 dark:bg-slate-800/30 border-transparent text-slate-500"
                                : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100/60 dark:border-indigo-900/40 text-slate-900 dark:text-slate-100"
                            )}
                          >
                            <div className={cn("mt-0.5", n.color)}>
                              <n.icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  {n.category}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">{n.time}</span>
                              </div>
                              <p className="text-xs font-bold leading-snug mt-0.5">{n.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            handleTabClick('notifications');
                          }}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Manage notification preferences →
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative pl-1">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[110px]">
                    {user?.displayName || 'Administrator'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {isAdmin ? 'Super Admin' : isTeacher ? 'Teacher' : 'Student'}
                  </span>
                </div>
                <ChevronDown size={14} className="hidden xl:inline-block text-slate-400" />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-3 z-50 space-y-2"
                    >
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          {user?.displayName || 'Administrator'}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                          {user?.email || 'admin@edulpha.com'}
                        </p>
                        <div className="pt-1">
                          <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                            {isAdmin ? 'Verified Administrator' : 'Account Active'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <UserCheck size={16} className="text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleTabClick('settings');
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                        >
                          <Settings size={16} className="text-slate-400" />
                          <span>Platform Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsFeedbackOpen(true);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                        >
                          <MessageSquare size={16} className="text-slate-400" />
                          <span>Send Feedback</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors text-left"
                        >
                          <LogOut size={16} />
                          <span>{t('nav.logout', 'Sign Out')}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT BODY (SIDEBAR + CONTENT)                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* ======================================================================= */}
        {/* SIDEBAR NAVIGATION                                                      */}
        {/* ======================================================================= */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 sm:top-18 z-40 lg:z-30 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0",
            isSidebarCollapsed ? "w-20" : "w-72",
            isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Sidebar Top: Collapse Toggle & Quick Status */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className={cn("flex items-center gap-2 overflow-hidden", isSidebarCollapsed && "hidden")}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                Edulpha Portal
              </span>
            </div>

            {/* Collapse toggle (Desktop) */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Sliders size={15} />
            </button>

            {/* Close toggle (Mobile) */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav List with Scrollbar */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
            {navigationGroups.map((group) => {
              const active = isGroupActive(group);
              const isOpen = openGroups[group.id] ?? false;
              const hasSub = group.subItems && group.subItems.length > 0;
              const groupLabel = language === 'fr' && group.labelFr ? group.labelFr : group.label;

              return (
                <div key={group.id} className="space-y-0.5">
                  {/* Group Main Button */}
                  <button
                    onClick={() => {
                      if (hasSub) {
                        if (isSidebarCollapsed) {
                          setIsSidebarCollapsed(false);
                          setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
                        } else {
                          toggleGroup(group.id);
                        }
                      } else {
                        handleTabClick(group.tab, group.path);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all group text-left",
                      active
                        ? "bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-extrabold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200",
                      isSidebarCollapsed && "justify-center px-0"
                    )}
                    title={isSidebarCollapsed ? groupLabel : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <group.icon
                        size={18}
                        className={cn(
                          "shrink-0 transition-colors",
                          active
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}
                      />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{groupLabel}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && hasSub && (
                      <ChevronRight
                        size={14}
                        className={cn(
                          "text-slate-400 shrink-0 transition-transform duration-200",
                          isOpen && "rotate-90 text-indigo-500"
                        )}
                      />
                    )}
                  </button>

                  {/* Sub items list */}
                  {!isSidebarCollapsed && hasSub && isOpen && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                      {group.subItems!.map((sub) => {
                        const isSubActive = isTabActive(sub.tab, sub.path);
                        const subLabel = language === 'fr' && sub.labelFr ? sub.labelFr : sub.label;

                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleTabClick(sub.tab, sub.path)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left group",
                              isSubActive
                                ? "bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                            )}
                          >
                            <span className="truncate">{subLabel}</span>
                            {sub.badge && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded">
                                {sub.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Bottom Footer: Support & Credits */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 font-bold">
                  <span>Edulpha Engine</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">v3.2</span>
                </div>
                <div className="flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate">
                      ✉️ {contactEmail}
                    </a>
                  )}
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      💬 Support Desk
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ======================================================================= */}
        {/* 3. MAIN DASHBOARD CONTENT AREA                                         */}
        {/* ======================================================================= */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header Action Bar / Custom Header if provided */}
          {(pageTitle || actions) && (
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                {pageTitle && (
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {pageTitle}
                  </h1>
                )}
                {pageSubtitle && (
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {pageSubtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
            </div>
          )}

          {/* Children View Content */}
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
