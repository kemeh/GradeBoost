import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Bell, Sparkles, ChevronDown, Menu, X, 
  User, LayoutDashboard, LogOut, Sun, Moon, HelpCircle, BookOpen, MessageSquare, Trophy, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Button, Badge, cn } from '../ui';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { logoUrl, appName } = useSettings();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(e.target as Node)) {
        setIsResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  // Active navigation checker (not hardcoded)
  const isTabActive = (href: string) => {
    const current = location.pathname;
    if (href === '/hnd-bts') {
      return current === '/hnd-bts' || current === '/hnd' || current === '/bts';
    }
    if (href === '/curriculum') {
      return current === '/curriculum' || current === '/gce';
    }
    if (href === '/subjects') {
      return current === '/subjects' || current === '/courses';
    }
    return current === href;
  };

  // Defined top-level nav elements
  const primaryNavItems = [
    { labelEn: 'Home', labelFr: 'Accueil', href: '/' },
    { labelEn: 'Courses', labelFr: 'Matières', href: '/subjects' },
    { labelEn: 'GCE', labelFr: 'GCE', href: '/curriculum' },
    { labelEn: 'HND / BTS', labelFr: 'HND / BTS', href: '/hnd-bts' },
    { labelEn: 'University', labelFr: 'Université', href: '/lms' },
  ];

  const resourceDropdownItems = [
    { labelEn: 'Discussion Forum', labelFr: 'Forum de Discussion', href: '/forum', icon: MessageSquare },
    { labelEn: 'Documentation Hub', labelFr: 'Centre de Documentation', href: '/docs', icon: BookOpen },
    { labelEn: 'Leaderboard & Duels', labelFr: 'Classement & Duels', href: '/leaderboard', icon: Trophy },
    { labelEn: 'Daily Challenge', labelFr: 'Défis Quotidiens', href: '/daily-drill-new', icon: Zap },
  ];

  return (
    <>
      <nav
        id="main-nav-bar"
        className={cn(
          "fixed top-0 w-full z-40 transition-all duration-300 border-b",
          isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/95 dark:border-slate-800 shadow-md py-2"
            : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/70 dark:border-slate-800 py-3"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Logo Brand Area */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1">
              <img 
                src={logoUrl || "/edulpha-logo.png"} 
                alt="Edulpha" 
                className="h-8 sm:h-9 w-auto rounded-xl object-contain group-hover:scale-105 transition-transform"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {appName || 'Edulpha'}<span className="text-indigo-600">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Central Navigation Menu Items */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-3 py-2 rounded-xl transition-all font-bold outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500",
                  isTabActive(item.href)
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold"
                    : "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                {language === 'fr' ? item.labelFr : item.labelEn}
              </Link>
            ))}

            {/* Resources Dropdown Trigger */}
            <div className="relative" ref={resourcesMenuRef}>
              <button
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className={cn(
                  "px-3 py-2 rounded-xl transition-all font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500",
                  isResourcesOpen && "bg-slate-100 dark:bg-slate-800"
                )}
                aria-expanded={isResourcesOpen}
                aria-haspopup="true"
              >
                <span>{language === 'fr' ? 'Ressources' : 'Resources'}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200 opacity-60", isResourcesOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isResourcesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl z-50 flex flex-col gap-0.5"
                  >
                    {resourceDropdownItems.map((res) => (
                      <Link
                        key={res.href}
                        to={res.href}
                        onClick={() => setIsResourcesOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-colors"
                      >
                        <res.icon size={15} className="text-indigo-500" />
                        <span>{language === 'fr' ? res.labelFr : res.labelEn}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Tab */}
            <Link
              to="/about"
              className={cn(
                "px-3 py-2 rounded-xl transition-all font-bold outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500",
                isTabActive('/about')
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              {language === 'fr' ? 'À propos' : 'About'}
            </Link>
          </div>

          {/* Right Action Tools Bar */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Global search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Search"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {/* Theme switcher */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Theme Toggle"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
            </button>

            {/* Language switcher */}
            <div className="hidden sm:block shrink-0">
              <LanguageSwitcher />
            </div>

            {/* Notification triggers */}
            {user && (
              <Link 
                to="/notifications" 
                className="relative p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/90 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </Link>
            )}

            {/* Account authentication states or quick control dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-700 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs uppercase">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 z-50"
                    >
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5 truncate">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {user.displayName || 'Learner User'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-semibold">{user.email}</p>
                      </div>

                      <div className="space-y-0.5 flex flex-col">
                        <Link
                          to={isAdmin ? '/admin' : '/dashboard'}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <LayoutDashboard size={14} className="text-indigo-600" />
                          <span>{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <User size={14} className="text-emerald-600" />
                          <span>Profile & Settings</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-black text-rose-600 flex items-center gap-2 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>{language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/auth">
                  <Button size="sm" variant="ghost" className="font-bold text-xs text-slate-750 dark:text-slate-300 hover:text-indigo-600">
                    {language === 'fr' ? 'Connexion' : 'Login'}
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs">
                    {language === 'fr' ? "S'enregistrer" : 'Register'}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/50 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-md absolute top-full left-0 w-full shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              <div className="p-4 space-y-1.5">
                {/* Standard items */}
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block p-3 rounded-xl text-xs font-black uppercase transition-all",
                      isTabActive(item.href)
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {language === 'fr' ? item.labelFr : item.labelEn}
                  </Link>
                ))}

                {/* Sub-resource lists inside mobile menu */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                    {language === 'fr' ? 'Ressources' : 'Resources'}
                  </p>
                  {resourceDropdownItems.map((res) => (
                    <Link
                      key={res.href}
                      to={res.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-3 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 rounded-xl"
                    >
                      <res.icon size={14} className="text-indigo-500 shrink-0" />
                      <span>{language === 'fr' ? res.labelFr : res.labelEn}</span>
                    </Link>
                  ))}
                </div>

                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  {language === 'fr' ? 'À propos' : 'About'}
                </Link>

                {/* Authentication states */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {user ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs uppercase shrink-0">
                          {user.displayName ? user.displayName.charAt(0) : 'U'}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.displayName || user.email}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role || 'Student'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link 
                          to={isAdmin ? '/admin' : '/dashboard'} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <Button size="sm" variant="outline" className="w-full text-xs font-bold py-2.5 rounded-xl">
                            Dashboard
                          </Button>
                        </Link>
                        <Link 
                          to="/profile" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full"
                        >
                          <Button size="sm" variant="outline" className="w-full text-xs font-bold py-2.5 rounded-xl">
                            Profile
                          </Button>
                        </Link>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full p-3 rounded-xl hover:bg-rose-50 text-xs font-black text-rose-600 flex items-center justify-center gap-2 border border-rose-100"
                      >
                        <LogOut size={14} />
                        <span>{language === 'fr' ? 'Se déconnecter' : 'Logout'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full font-bold text-xs py-2.5 rounded-xl">
                          {language === 'fr' ? 'Se Connecter' : 'Login'}
                        </Button>
                      </Link>
                      <Link to="/auth?mode=register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl">
                          {language === 'fr' ? "S'enregistrer" : 'Register'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Global Search Overlay Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
