import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Target, Trophy, 
  Settings, LogOut, TrendingUp, Menu, X, ShieldCheck, CreditCard, BookOpen, MessageSquare, Zap, Sparkles, Bell, Smartphone, Shield, FlaskConical, Award, Database, History, Gift
} from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from './ui';
import { FeedbackModal } from './FeedbackModal';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, isAdmin, isTeacher } = useAuth();
  const { appName, logoUrl, contactEmail, whatsappNumber, whatsappGroupLink } = useSettings();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const studentLinks = [
    { icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard'), path: '/dashboard' },
    { icon: Gift, label: `🎁 ${t('sidebar.referralRewards', 'Referrals & Rewards')}`, path: '/dashboard?tab=referrals' },
    { icon: FlaskConical, label: `🔬 ${t('sidebar.practicalLab', 'Virtual Practical Lab')}`, path: '/practicals' },
    { icon: Smartphone, label: `📱 ${t('sidebar.mobileApp', 'Edulpha Mobile App')}`, path: '/mobile-app' },
    { icon: TrendingUp, label: t('sidebar.analytics', 'Learning Analytics'), path: '/analytics' },
    { icon: Bell, label: t('sidebar.notifications', 'Notifications & Alerts'), path: '/notifications' },
    { icon: MessageSquare, label: t('sidebar.forum', 'Discussion Forum'), path: '/forum' },
    { icon: BookOpen, label: t('nav.lms', 'Digital School LMS'), path: '/lms' },
    { icon: FileText, label: t('sidebar.gceExamEngine', 'GCE Exam Engine'), path: '/exams' },
    { icon: Trophy, label: t('nav.challenges', 'Learning Challenges'), path: '/challenges' },
    { icon: Zap, label: t('sidebar.duelBattle', 'Duel Battle'), path: '/duel' },
    { icon: Trophy, label: t('nav.leaderboard', 'Leaderboard'), path: '/leaderboard' },
    { icon: Target, label: t('sidebar.dailyDrills', 'Daily Drills'), path: '/daily-drill' },
    { icon: Sparkles, label: t('sidebar.randomPractice', 'Random Practice'), path: '/random-practice' },
    { icon: FileText, label: t('nav.practice', 'Practice Papers'), path: '/practice' },
    { icon: Target, label: t('sidebar.diagnostic', 'Diagnostic Test'), path: '/diagnostic' },
    { icon: Settings, label: t('nav.profile', 'Profile Settings'), path: '/profile' },
  ];

  const teacherLinks = [
    { icon: LayoutDashboard, label: t('sidebar.teacherDashboard', 'Teacher Dashboard'), path: '/teacher' },
    { icon: FlaskConical, label: `🔬 ${t('sidebar.practicalStudio', 'Practical Studio')}`, path: '/admin/practicals' },
    { icon: Smartphone, label: `📱 ${t('sidebar.mobileApp', 'Edulpha Mobile App')}`, path: '/mobile-app' },
    { icon: TrendingUp, label: t('sidebar.classAnalytics', 'Class Analytics'), path: '/teacher/analytics' },
    { icon: Bell, label: t('sidebar.notifications', 'Notifications & Alerts'), path: '/notifications' },
    { icon: MessageSquare, label: t('sidebar.forum', 'Discussion Forum'), path: '/forum' },
    { icon: BookOpen, label: t('sidebar.lmsStudio', 'LMS Content Studio'), path: '/admin/lms' },
    { icon: FileText, label: t('sidebar.questionBank', 'Master Question Bank'), path: '/admin/questions' },
    { icon: Sparkles, label: t('sidebar.mockExamBuilder', 'Mock Exam Builder'), path: '/admin/exam-builder' },
    { icon: Trophy, label: t('sidebar.studyChallenges', 'Study Challenges'), path: '/admin/challenges' },
    { icon: Target, label: t('sidebar.dailyDrills', 'Daily Drills'), path: '/admin/daily-drill' },
    { icon: BookOpen, label: t('sidebar.resourcesAssignments', 'Resources & Assignments'), path: '/admin/resources' },
    { icon: LayoutDashboard, label: t('sidebar.studentView', 'Student View'), path: '/dashboard' },
  ];

  const adminLinks = [
    { icon: Database, label: `🧹 ${t('sidebar.systemData', 'System Data Management')}`, path: '/admin?tab=system-data' },
    { icon: History, label: `📜 ${t('sidebar.auditLog', 'Admin Audit Log')}`, path: '/admin?tab=audit-log' },
    { icon: Sparkles, label: `🎒 ${t('sidebar.ambassadorAdmin', 'Student Ambassador Admin')}`, path: '/admin?tab=ambassadors' },
    { icon: Gift, label: `🎁 ${t('sidebar.referralAdmin', 'Referral Growth Admin')}`, path: '/admin?tab=referrals' },
    { icon: Award, label: `🎓 ${t('sidebar.alumniAdmin', 'Alumni Management')}`, path: '/admin?tab=alumni' },
    { icon: ShieldCheck, label: t('sidebar.usersSystemAdmin', 'Users & System Admin'), path: '/admin' },
    { icon: FlaskConical, label: `🔬 ${t('sidebar.practicalStudio', 'Practical Studio')}`, path: '/admin/practicals' },
    { icon: Smartphone, label: `📱 ${t('sidebar.mobileApp', 'Edulpha Mobile App')}`, path: '/mobile-app' },
    { icon: Shield, label: `🔒 ${t('sidebar.securityPerformance', 'Security & Performance')}`, path: '/admin/security' },
    { icon: TrendingUp, label: t('sidebar.executiveAnalytics', 'Executive Analytics & Reports'), path: '/admin/analytics' },
    { icon: Bell, label: t('sidebar.notifications', 'Notifications & Hub'), path: '/admin/notifications' },
    { icon: MessageSquare, label: t('sidebar.forum', 'Discussion Forum'), path: '/forum' },
    { icon: LayoutDashboard, label: t('sidebar.teacherDashboard', 'Teacher Dashboard'), path: '/teacher' },
    { icon: BookOpen, label: t('sidebar.lmsStudio', 'LMS Content Studio'), path: '/admin/lms' },
    { icon: FileText, label: t('sidebar.questionBank', 'Master Question Bank'), path: '/admin/questions' },
    { icon: Sparkles, label: t('sidebar.mockExamBuilder', 'Mock Exam Builder'), path: '/admin/exam-builder' },
    { icon: Trophy, label: t('sidebar.studyChallenges', 'Study Challenges'), path: '/admin/challenges' },
    { icon: Zap, label: t('sidebar.duelBattle', 'Duel Battle'), path: '/duel' },
    { icon: CreditCard, label: t('sidebar.payments', 'Payments'), path: '/admin?tab=payments' },
    { icon: FileText, label: t('sidebar.managePapers', 'Manage Papers'), path: '/admin?tab=papers' },
    { icon: FileText, label: t('sidebar.paper2Generator', 'Paper 2 Generator'), path: '/admin/paper-generator' },
    { icon: Target, label: t('sidebar.dailyDrills', 'Daily Drills'), path: '/admin/daily-drill' },
    { icon: BookOpen, label: t('sidebar.resourcesAssignments', 'Resources & Assignments'), path: '/admin/resources' },
    { icon: Settings, label: t('sidebar.systemSettings', 'System Settings'), path: '/admin/settings' },
    { icon: LayoutDashboard, label: t('sidebar.studentView', 'Student View'), path: '/dashboard' },
  ];

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname === path || (path?.includes('?') && location.pathname + location.search === path);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation Menu"
        className="lg:hidden fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2.5 sm:p-3 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all backdrop-blur-md"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col p-5 sm:p-6 z-50 lg:z-30 transition-transform duration-300 ease-in-out w-72 max-w-[85vw] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.25rem+env(safe-area-inset-top,0px))] text-slate-800 dark:text-slate-200",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Branding & Mobile Close */}
        <div className="flex items-center justify-between gap-2 mb-6 shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <img 
              src={logoUrl || '/edulpha-logo.png'} 
              alt={`${appName} Logo`} 
              className="h-8 sm:h-9 w-auto object-contain object-left shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 truncate">
              {appName} Platform
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
          {links.map((item, i) => (
            <Link 
              key={i} 
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                isActive(item.path)
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-left cursor-pointer"
          >
            <MessageSquare size={18} className="shrink-0" />
            <span className="truncate">{t('sidebar.feedback', 'Send Feedback')}</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-4 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          {/* Platform Language Switcher */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              {t('common.language', 'Language')}
            </label>
            <LanguageSwitcher variant="compact" />
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-all w-full text-left cursor-pointer"
          >
            <LogOut size={18} className="shrink-0" />
            <span>{t('nav.logout', 'Logout')}</span>
          </button>
        </div>
      </aside>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
