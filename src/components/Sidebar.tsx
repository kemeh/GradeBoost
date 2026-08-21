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
        className="lg:hidden fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2.5 sm:p-3 bg-white/95 border border-slate-200 shadow-md rounded-2xl text-slate-700 hover:text-indigo-600 active:scale-95 transition-all backdrop-blur-md"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-slate-100 flex flex-col p-5 sm:p-8 z-50 lg:z-30 transition-transform duration-300 ease-in-out w-72 max-w-[85vw] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.25rem+env(safe-area-inset-top,0px))]",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Branding & Mobile Close */}
        <div className="flex items-center justify-between gap-2 mb-8 sm:mb-10 shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <img 
              src={logoUrl} 
              alt={`${appName} Logo`} 
              className="h-8 sm:h-10 w-auto object-contain object-left shrink-0"
            />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 truncate">by Vertexon Technologies</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {links.map((item, i) => (
            <Link 
              key={i} 
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all",
                isActive(item.path)
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <MessageSquare size={20} />
            {t('sidebar.feedback', 'Send Feedback')}
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
          {/* Platform Language Switcher */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {t('common.language', 'Language')}
            </label>
            <LanguageSwitcher variant="compact" />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              {t('sidebar.devCredit', 'Developed by Vertexon Technologies to empower students with academic excellence.')}
            </p>
            <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-500">
              {contactEmail && <a href={`mailto:${contactEmail}`} className="hover:text-indigo-600 transition-colors">{t('footer.emailSupport', 'Email Support')}</a>}
              {whatsappNumber && <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">{t('footer.whatsappSupport', 'WhatsApp Support')}</a>}
              {whatsappGroupLink && <a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">{t('footer.joinWhatsappGroup', 'Join WhatsApp Group')}</a>}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut size={20} />
            {t('nav.logout', 'Logout')}
          </button>
        </div>
      </aside>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
