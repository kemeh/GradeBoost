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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/90 backdrop-blur-md px-3 py-1.5 shadow-xl flex items-center justify-around">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={tab.action}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all text-[10px] font-bold gap-1",
              tab.isActive ? "text-indigo-600 font-black" : "text-slate-500 hover:text-slate-900",
              tab.highlight && !tab.isActive && "text-amber-600"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-transform",
              tab.highlight && "bg-amber-50 text-amber-600 ring-1 ring-amber-300/40",
              tab.isActive && !tab.highlight && "bg-indigo-50 text-indigo-600"
            )}>
              <Icon size={18} />
            </div>
            <span>{language === 'fr' ? tab.labelFr : tab.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
}
