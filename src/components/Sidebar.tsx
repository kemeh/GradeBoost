import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Target, Trophy, 
  Settings, LogOut, TrendingUp, Menu, X, ShieldCheck, CreditCard, BookOpen, MessageSquare, Zap, Sparkles
} from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { cn } from './ui';
import { FeedbackModal } from './FeedbackModal';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, isAdmin } = useAuth();
  const { appName, logoUrl, contactEmail, whatsappNumber, whatsappGroupLink } = useSettings();
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Trophy, label: 'Learning Challenges', path: '/challenges' },
    { icon: Zap, label: 'Duel Battle', path: '/duel' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Target, label: 'Daily Drills', path: '/daily-drill' },
    { icon: Sparkles, label: 'Random Practice', path: '/random-practice' },
    { icon: FileText, label: 'Practice Papers', path: '/practice' },
    { icon: Target, label: 'Diagnostic', path: '/diagnostic' },
    { icon: Settings, label: 'Profile Settings', path: '/profile' },
  ];

  const adminLinks = [
    { icon: ShieldCheck, label: 'Admin Panel', path: '/admin' },
    { icon: Trophy, label: 'Study Challenges', path: '/admin/challenges' },
    { icon: Zap, label: 'Duel Battle', path: '/duel' },
    { icon: CreditCard, label: 'Payments', path: '/admin?tab=payments' },
    { icon: FileText, label: 'Manage Papers', path: '/admin?tab=papers' },
    { icon: FileText, label: 'Paper 2 Generator', path: '/admin/paper-generator' },
    { icon: Target, label: 'Daily Drills', path: '/admin/daily-drill' },
    { icon: BookOpen, label: 'Resources & Assignments', path: '/admin/resources' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
    { icon: LayoutDashboard, label: 'Student View', path: '/dashboard' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname === path || (path?.includes('?') && location.pathname + location.search === path);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-white rounded-2xl border border-slate-100 shadow-lg text-slate-600 active:scale-95 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-slate-100 flex flex-col p-8 z-40 transition-all duration-300 ease-in-out",
        "w-72",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Branding */}
        <div className="flex flex-col gap-1 mb-12">
          <img 
            src={logoUrl} 
            alt={`${appName} Logo`} 
            className="h-10 w-auto object-contain object-left"
          />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">by Vertexon Technologies</span>
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
            Send Feedback
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-8 space-y-6 pt-6 border-t border-slate-50">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              Developed by Vertexon Technologies to empower students with academic excellence.
            </p>
            <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-500">
              {contactEmail && <a href={`mailto:${contactEmail}`} className="hover:text-indigo-600 transition-colors">Email Support</a>}
              {whatsappNumber && <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">WhatsApp Support</a>}
              {whatsappGroupLink && <a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">Join WhatsApp Group</a>}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
