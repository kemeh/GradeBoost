import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User, Mail, School, MapPin, 
  ChevronRight, Save,
  TrendingUp, CheckCircle2, AlertCircle
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { Button, Card, Badge, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import Sidebar from '../components/Sidebar';

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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 pt-24 lg:pt-12 p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <TrendingUp size={20} />
                <span className="text-sm font-black uppercase tracking-widest">Profile Settings</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Your <span className="text-indigo-600 italic">Account</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-md">
                Manage your personal information and track your progress across the platform.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 leading-tight">{user.name}</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8 lg:p-12">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} /> Full Name
                      </label>
                      <input 
                        type="text"
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3 opacity-60">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} /> Email Address
                      </label>
                      <input 
                        type="email"
                        disabled
                        className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                        value={user.email}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <School size={12} /> School Name
                      </label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.school}
                        onChange={e => setFormData({ ...formData, school: e.target.value })}
                        placeholder="Enter your school"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> Region
                      </label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        placeholder="Enter your region"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      {success && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-emerald-600"
                        >
                          <CheckCircle2 size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Saved Successfully</span>
                        </motion.div>
                      )}
                    </div>
                    <Button type="submit" loading={loading} className="px-8">
                      <Save className="mr-2" size={18} /> Save Changes
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Security Section */}
              <Card className="p-8 lg:p-12 border-red-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Security & Privacy</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900">Account Security</h3>
                      <p className="text-sm text-slate-500 font-medium">Manage your password and authentication methods.</p>
                    </div>
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                      Change Password
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              <Card className="p-8 space-y-6 bg-slate-900 text-white border-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Status</span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">{user.paymentStatus === 'paid' ? 'Premium Plan' : 'Free Plan'}</h3>
                    <Badge variant={user.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                      {user.paymentStatus === 'paid' ? 'Active' : 'Limited'}
                    </Badge>
                  </div>
                </div>
                
                {user.paymentStatus !== 'paid' && (
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => navigate('/payment')}>
                    Upgrade Now
                  </Button>
                )}

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Member Since</span>
                    <span className="font-bold">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Diagnostic Status</span>
                    <span className="font-bold text-emerald-400">Completed</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8 space-y-6">
                <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'View Progress', icon: TrendingUp, path: '/dashboard' },
                    { label: 'Practice History', icon: ChevronRight, path: '/practice' },
                  ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => navigate(action.path)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon size={18} className="text-slate-400 group-hover:text-indigo-600" />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">{action.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
