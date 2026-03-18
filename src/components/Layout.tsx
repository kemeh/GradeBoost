import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, BookOpen, User, Settings, Trophy } from 'lucide-react';
import { Logo } from './Logo';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/lessons', icon: BookOpen, label: 'Lessons' },
    { path: '/exams', icon: Trophy, label: 'Mock Exams' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <nav className="h-20 md:h-24 border-b border-slate-50 flex items-center sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex justify-between items-center">
          <Link to="/dashboard" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Logo className="scale-75 sm:scale-100" />
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-10">
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-6 py-2.5 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 md:gap-6 md:pl-6 md:border-l md:border-slate-100">
              <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-black text-slate-900 leading-none">{user?.name?.split(' ')[0] || 'User'}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5">{user?.role === 'admin' ? 'Admin' : 'Student'}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border-2 border-slate-100 group-hover:border-blue-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <User size={20} className="md:w-[22px] md:h-[22px]" />
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border-2 border-slate-100 hover:border-red-600 hover:bg-red-50 hover:text-red-600 transition-all"
                title="Logout"
              >
                <LogOut size={20} className="md:w-[22px] md:h-[22px]" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-12">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-6 py-4 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname.startsWith(item.path) ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </div>
      
      <footer className="py-12 md:py-20 border-t border-slate-50 bg-slate-50/30 pb-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo className="scale-75 origin-left" />
            <p className="text-slate-400 text-sm font-bold max-w-xs text-center md:text-left leading-relaxed">
              Empowering the next generation of Cameroon GCE A-Level students with Vertexon Technologies.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-10">
              <a href="https://vertexontechhub.com" className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">About</a>
              <a href="https://vertexontechhub.com" className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">Contact</a>
              <a href="https://vertexontechhub.com" className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">Privacy Policy</a>
            </div>
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Vertexon Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
