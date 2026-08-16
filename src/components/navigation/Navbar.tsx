import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Bell, Sparkles, Download, Award, ChevronDown, Menu, X, 
  User, LayoutDashboard, Settings, LogOut, HelpCircle, Sun, Moon,
  MessageSquare, Trophy, Zap, Building2, Globe, Shield, BookOpen, Compass
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Button, Badge, cn } from '../ui';
import { getNavConfig } from '../../services/navigationService';
import { NavItem } from '../../types/navigation';
import CurriculumMegaMenu from './CurriculumMegaMenu';
import SubjectsMegaMenu from './SubjectsMegaMenu';
import GlobalSearchModal from './GlobalSearchModal';
import MobileNavigationDrawer from './MobileNavigationDrawer';
import MobileBottomTabBar from './MobileBottomTabBar';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { logoUrl, appName } = useSettings();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'curriculum' | 'subjects' | 'custom' | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load Nav Items
  useEffect(() => {
    async function loadNav() {
      const items = await getNavConfig();
      setNavItems(items);
    }
    loadNav();
  }, []);

  // Handle Scroll to toggle sticky styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLinkNavigate = (href: string) => {
    setActiveMegaMenu(null);
    if (href.startsWith('#')) {
      const el = document.getElementById(href.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (location.pathname !== '/') {
        navigate('/' + href);
      }
    } else {
      navigate(href);
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Announcement Banner (Responsive across mobile, tablet, desktop) */}
      <div className="bg-slate-900 text-slate-200 px-3 py-2 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase shadow-2xs shrink-0">
              CAMEROON & AFRICA #1
            </span>
            <span className="text-slate-300 font-medium text-[11px] sm:text-xs leading-tight">
              Empowering Students across General, Technical, Commercial & TVEE Sub-systems
            </span>
          </div>
          <button 
            onClick={() => handleLinkNavigate('/subjects')}
            className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors group text-xs shrink-0"
          >
            <span>Explore Subjects</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* 1. Main Navigation Header Bar */}
      <nav
        className={cn(
          "sticky top-0 w-full z-40 transition-all duration-300 border-b",
          isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/90 dark:border-slate-800 shadow-md py-2"
            : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/60 dark:border-slate-800 py-2.5 sm:py-3.5"
        )}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Section: Logo & Platform Title (Mobile: Hamburger + Logo) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors shrink-0"
              aria-label="Open Menu"
            >
              <Menu size={18} />
            </button>

            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 group"
              onClick={() => handleLinkNavigate('/')}
            >
              <img 
                src={logoUrl || "/edulpha-logo.png"} 
                alt={appName || "Edulpha"} 
                className="h-7 sm:h-10 w-auto rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {appName || 'Edulpha'}<span className="text-emerald-600">.</span>
                </span>
                <span className="hidden sm:inline-block text-[8px] sm:text-[9px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase -mt-0.5">
                  Learn. Practice. Succeed.
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop 1200px+ & Tablet 768px-1199px) */}
          <div className="hidden md:flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 relative" ref={megaMenuRef}>
            {navItems.filter(i => i.isVisible).map((item) => {
              const hasMega = item.megaType === 'curriculum' || item.megaType === 'subjects' || item.megaType === 'custom';
              const isCurrentMegaOpen = activeMegaMenu === item.megaType;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (hasMega) {
                        setActiveMegaMenu(isCurrentMegaOpen ? null : (item.megaType as any));
                      } else {
                        handleLinkNavigate(item.href);
                      }
                    }}
                    onMouseEnter={() => {
                      if (hasMega) setActiveMegaMenu(item.megaType as any);
                    }}
                    className={cn(
                      "px-2.5 py-2 rounded-xl transition-all flex items-center gap-1 font-bold hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400",
                      isCurrentMegaOpen && "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    )}
                  >
                    {item.id === 'nav-ai-tutor' && <Sparkles size={14} className="text-amber-500" />}
                    {item.id === 'nav-download-app' && <Download size={14} className="text-emerald-600" />}
                    {item.id === 'nav-exams' && <Award size={14} className="text-sky-600" />}
                    
                    <span className="truncate max-w-[90px] lg:max-w-none">{language === 'fr' ? item.labelFr : item.labelEn}</span>

                    {item.badgeEn && (
                      <span className={cn("hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md border", item.badgeColor || 'bg-indigo-50 text-indigo-700 border-indigo-200')}>
                        {language === 'fr' ? item.badgeFr : item.badgeEn}
                      </span>
                    )}

                    {hasMega && (
                      <ChevronDown size={14} className={cn("transition-transform duration-200 opacity-60", isCurrentMegaOpen && "rotate-180")} />
                    )}
                  </button>

                  {/* Dropdown for "More" custom menu */}
                  {item.megaType === 'custom' && activeMegaMenu === 'custom' && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {item.dropdownItems?.map((drop, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLinkNavigate(drop.href)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-between transition-colors"
                        >
                          <span>{language === 'fr' ? drop.labelFr : drop.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render Mega Menus */}
            <AnimatePresence>
              {activeMegaMenu === 'curriculum' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50">
                  <CurriculumMegaMenu onClose={() => setActiveMegaMenu(null)} />
                </div>
              )}
              {activeMegaMenu === 'subjects' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50">
                  <SubjectsMegaMenu onClose={() => setActiveMegaMenu(null)} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section: Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700 shadow-2xs"
              title="Global Search"
            >
              <Search size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xl:inline text-slate-500">
                {language === 'fr' ? 'Rechercher...' : 'Search...'}
              </span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-black bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-md">
                ⌘K
              </kbd>
            </button>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
            </button>

            {/* User Notifications Bell (Logged in) */}
            {user && (
              <Link to="/notifications" className="relative p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </Link>
            )}

            {/* Logged Out / Logged In Accounts State */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-2xs">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {/* User Avatar Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user.displayName || 'Student User'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase border border-indigo-200">
                        {user.role || 'Student'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <Link
                        to={isAdmin ? '/admin' : '/dashboard'}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                      >
                        <LayoutDashboard size={14} className="text-indigo-600" />
                        <span>{isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                      >
                        <User size={14} className="text-emerald-600" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/docs"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                      >
                        <HelpCircle size={14} className="text-sky-600" />
                        <span>Help & Documentation</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link to="/auth" className="hidden sm:inline-block">
                  <Button size="sm" variant="ghost" className="font-bold text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600">
                    {t('nav.login')}
                  </Button>
                </Link>

                <Link to="/auth" className="shrink-0 max-w-[130px] sm:max-w-none">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-black text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl whitespace-nowrap truncate min-w-0 w-full">
                    {language === 'fr' ? 'Démarrer' : 'Get Started Free'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Global Search Overlay Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 3. Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        navItems={navItems}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 4. Mobile Bottom Action Bar */}
      <MobileBottomTabBar
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
}
