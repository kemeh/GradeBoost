import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../ui';

interface MobileBottomTabBarProps {
  onOpenSearch: () => void;
}

export default function MobileBottomTabBar({ onOpenSearch }: MobileBottomTabBarProps) {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    if (path.startsWith('#')) {
      const el = document.getElementById(path.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  const dashboardTarget = isAdmin ? '/admin' : '/dashboard';
  const profileTarget = user ? '/profile' : '/auth';

  const TABS = [
    {
      id: 'home',
      labelEn: 'Home',
      labelFr: 'Accueil',
      icon: Home,
      action: () => handleNavigate('/'),
      isActive: location.pathname === '/'
    },
    {
      id: 'search',
      labelEn: 'Search',
      labelFr: 'Recherche',
      icon: Search,
      action: onOpenSearch,
      isActive: false
    },
    {
      id: 'ai-tutor',
      labelEn: 'AI Tutor',
      labelFr: 'Tuteur IA',
      icon: Sparkles,
      action: () => handleNavigate(user ? '/diagnostic' : '#ai-tutor'),
      isActive: location.pathname === '/diagnostic' || location.hash === '#ai-tutor',
      highlight: true
    },
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelFr: 'Tableau',
      icon: LayoutDashboard,
      action: () => handleNavigate(dashboardTarget),
      isActive: location.pathname === '/dashboard' || location.pathname === '/admin'
    },
    {
      id: 'profile',
      labelEn: 'Profile',
      labelFr: 'Profil',
      icon: User,
      action: () => handleNavigate(profileTarget),
      isActive: location.pathname === '/profile' || location.pathname === '/auth'
    }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/90 dark:border-slate-800 backdrop-blur-md px-1 py-1.5 shadow-2xl grid grid-cols-5 items-center pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] box-border">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={tab.action}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all text-[10px] leading-none font-bold gap-1 min-w-0 w-full truncate border-none outline-none",
              tab.isActive ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              tab.highlight && !tab.isActive && "text-amber-600 dark:text-amber-400"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-transform shrink-0 flex items-center justify-center",
              tab.highlight && "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-1 ring-amber-300/40",
              tab.isActive && !tab.highlight && "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
            )}>
              <Icon size={18} />
            </div>
            <span className="truncate w-full text-center tracking-tight text-[9px] sm:text-[10px]">
              {language === 'fr' ? tab.labelFr : tab.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
