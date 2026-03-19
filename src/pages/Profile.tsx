import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User, Mail, School, MapPin, 
  ChevronRight, ArrowLeft, Save,
  TrendingUp, LayoutDashboard, FileText,
  Target, Trophy, Settings, LogOut
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { Button, Card, Badge, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    school: user?.school || '',
    region: user?.region || '',
  });

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    const path = `users/${user.uid}`;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col p-8 fixed h-full z-20">
        <div className="flex items-center gap-2 mb-12">
          <img 
            src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
            alt="GradeBoost 60 Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight">GradeBoost 60</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">by Vertexon Technologies</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: FileText, label: 'Practice Papers', path: '/practice' },
            { icon: Target, label: 'Diagnostic', path: '/diagnostic' },
            { icon: Trophy, label: 'Achievements', path: '#' },
            { icon: Settings, label: 'Profile Settings', path: '/profile', active: true },
          ].map((item, i) => (
            <Link 
              key={i} 
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all",
                item.active 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              This platform is developed by Vertexon Technologies to help students improve and achieve academic excellence.
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-8 md:p-12">
        <header className="flex items-center gap-4 mb-12">
          <Link to="/dashboard" className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 font-medium">Manage your personal information and academic details.</p>
          </div>
        </header>

        <div className="max-w-3xl">
          <Card className="p-12">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="text"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2 opacity-60">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="email"
                      readOnly
                      className="w-full pl-14 pr-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 cursor-not-allowed outline-none"
                      value={user.email}
                    />
                  </div>
                </div>

                {/* School */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">School Name</label>
                  <div className="relative group">
                    <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="text"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      value={formData.school}
                      onChange={e => setFormData({ ...formData, school: e.target.value })}
                    />
                  </div>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="text"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      value={formData.region}
                      onChange={e => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                    >
                      <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Save size={12} />
                      </div>
                      Profile updated successfully!
                    </motion.div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={loading}
                  className="min-w-[200px]"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                  {!loading && <Save className="ml-2" size={20} />}
                </Button>
              </div>
            </form>
          </Card>

          {/* Academic Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="p-8 bg-indigo-600 text-white border-none">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Subject</p>
              <p className="text-2xl font-black">{user.subject}</p>
            </Card>
            <Card className="p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-2xl font-black text-slate-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </Card>
            <Card className="p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <Badge variant="success" className="mt-1">Active Student</Badge>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
