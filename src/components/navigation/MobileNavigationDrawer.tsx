import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, ChevronDown, ChevronRight, Home, Compass, Layers, Sparkles, Award, 
  Tag, Download, Info, User, LogOut, Settings, HelpCircle, LayoutDashboard,
  Sun, Moon, Globe, Shield, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Button, Badge, cn } from '../ui';
import { NavItem } from '../../types/navigation';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentTheme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

export default function MobileNavigationDrawer({
  isOpen,
  onClose,
  navItems,
  currentTheme,
  onToggleTheme,
  onOpenSearch
}: MobileNavigationDrawerProps) {
  const { user, isAdmin, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [expandedCurriculum, setExpandedCurriculum] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState(false);

  if (!isOpen) return null;

  const handleItemClick = (href: string) => {
    onClose();
    if (href.startsWith('#')) {
      const el = document.getElementById(href.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250 overflow-y-auto">
        
        {/* Drawer Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Edulpha<span className="text-emerald-600">.</span>
              </span>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-black uppercase">
                Mobile
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Action Search Trigger */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="w-full py-2.5 px-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs font-medium text-slate-500 shadow-2xs hover:border-indigo-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe size={14} className="text-indigo-600" />
                {language === 'fr' ? 'Rechercher sur Edulpha...' : 'Search subjects, exams, AI...'}
              </span>
              <kbd className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
                Search
              </kbd>
            </button>
          </div>

          {/* Nav List */}
          <div className="p-4 space-y-1">
            {navItems.filter(i => i.isVisible).map((item) => {
              if (item.megaType === 'curriculum') {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => setExpandedCurriculum(!expandedCurriculum)}
                      className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Compass size={16} className="text-indigo-600" />
                        <span>{language === 'fr' ? item.labelFr : item.labelEn}</span>
                      </span>
                      <ChevronDown size={16} className={cn("text-slate-400 transition-transform", expandedCurriculum && "rotate-180")} />
                    </button>

                    {expandedCurriculum && (
                      <div className="pl-9 pr-2 py-2 space-y-2 bg-slate-50/70 rounded-2xl border border-slate-100">
                        <button
                          onClick={() => handleItemClick('/lms?curriculum=english')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>English Curriculum (GCE O/A Level)</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleItemClick('/lms?curriculum=french')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>French Curriculum (BEPC, Bac)</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleItemClick('/lms?subsystem=technical')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>Technical & TVEE Specialties</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleItemClick('/lms?subsystem=commercial')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>Commercial & Accounting</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.megaType === 'subjects') {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => setExpandedSubjects(!expandedSubjects)}
                      className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Layers size={16} className="text-emerald-600" />
                        <span>{language === 'fr' ? item.labelFr : item.labelEn}</span>
                      </span>
                      <ChevronDown size={16} className={cn("text-slate-400 transition-transform", expandedSubjects && "rotate-180")} />
                    </button>

                    {expandedSubjects && (
                      <div className="pl-9 pr-2 py-2 space-y-2 bg-slate-50/70 rounded-2xl border border-slate-100">
                        <button
                          onClick={() => handleItemClick('/practice?subject=Mathematics')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>Mathematics & Physics</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleItemClick('/practice?subject=Electrical')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>Technical & Electrical</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleItemClick('/practice?subject=Accounting')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>Financial Accounting</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleItemClick('/practice?subject=French')}
                          className="w-full text-left py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                        >
                          <span>Littérature & Languages</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.href)}
                  className="w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    {item.id === 'nav-ai-tutor' && <Sparkles size={16} className="text-amber-500" />}
                    {item.id === 'nav-download-app' && <Download size={16} className="text-emerald-600" />}
                    {item.id === 'nav-exams' && <Award size={16} className="text-sky-600" />}
                    <span>{language === 'fr' ? item.labelFr : item.labelEn}</span>
                  </span>

                  {item.badgeEn && (
                    <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase border", item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200')}>
                      {language === 'fr' ? item.badgeFr : item.badgeEn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Bottom Controls */}
        <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/70">
          {/* Controls bar: Language & Theme */}
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher />

            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              {currentTheme === 'dark' ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-500" />}
              <span className="capitalize">{currentTheme} Mode</span>
            </button>
          </div>

          {/* Account action section */}
          {user ? (
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate flex-1">
                  <div className="text-xs font-black text-slate-900 truncate">{user.displayName || user.email}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{user.role || 'Student'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleItemClick(isAdmin ? '/admin' : '/dashboard')}
                  className="w-full text-xs font-bold rounded-xl"
                >
                  <LayoutDashboard size={14} className="mr-1.5" /> Dashboard
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleItemClick('/profile')}
                  className="w-full text-xs font-bold rounded-xl"
                >
                  <User size={14} className="mr-1.5" /> Profile
                </Button>
              </div>

              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <LogOut size={14} className="mr-1.5" /> Log Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/auth" onClick={onClose} className="block w-full">
                <Button variant="outline" className="w-full font-bold text-xs py-2.5 rounded-xl">
                  {language === 'fr' ? 'Se Connecter' : 'Log In'}
                </Button>
              </Link>
              <Link to="/auth" onClick={onClose} className="block w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md">
                  {language === 'fr' ? 'Créer un Compte Gratuit' : 'Get Started Free'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
