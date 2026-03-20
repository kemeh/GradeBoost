import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Target, Trophy, 
  Settings, LogOut, TrendingUp, Menu, X, ShieldCheck, CreditCard
} from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from './ui';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
    { icon: FileText, label: 'Practice Papers', path: '/practice' },
    { icon: Target, label: 'Diagnostic', path: '/diagnostic' },
    { icon: Trophy, label: 'Achievements', path: '#' },
    { icon: Settings, label: 'Profile Settings', path: '/profile' },
  ];

  const adminLinks = [
    { icon: ShieldCheck, label: 'Admin Panel', path: '/admin' },
    { icon: CreditCard, label: 'Payments', path: '/admin?tab=payments' },
    { icon: FileText, label: 'Manage Papers', path: '/admin?tab=papers' },
    { icon: LayoutDashboard, label: 'Student View', path: '/dashboard' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname === path || (path.includes('?') && location.pathname + location.search === path);
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
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight">GradeBoost 60</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">by Vertexon Technologies</span>
          </div>
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
        </nav>

        {/* Footer */}
        <div className="mt-8 space-y-6 pt-6 border-t border-slate-50">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              Developed by Vertexon Technologies to empower students with academic excellence.
            </p>
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
    </>
  );
}
