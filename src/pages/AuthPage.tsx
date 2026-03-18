import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    school: '',
    age: '',
    phoneNumber: '',
    sex: 'Male',
    class: '',
    region: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: formData.name,
            email: formData.email,
            school: formData.school,
            age: parseInt(formData.age) || 0,
            phoneNumber: formData.phoneNumber,
            sex: formData.sex,
            class: formData.class,
            region: formData.region,
            isPaid: false,
            currentDay: 0,
            progress: [],
            role: 'student',
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
        }
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-2xl space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link to="/">
            <Logo className="scale-125" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
              {isLogin ? 'Welcome back' : 'Start your journey'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isLogin 
                ? 'Continue your 60-day challenge' 
                : 'Join the next generation of GCE A-Level students'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50/50 p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">School / Institution</label>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="Bilingual High School"
                          className="w-full px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={formData.school}
                          onChange={e => setFormData({ ...formData, school: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                      <div className="relative group">
                        <input
                          type="number"
                          placeholder="17"
                          className="w-full px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={formData.age}
                          onChange={e => setFormData({ ...formData, age: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative group">
                        <input
                          type="tel"
                          placeholder="6XX XXX XXX"
                          className="w-full px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={formData.phoneNumber}
                          onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sex</label>
                      <select
                        className="w-full px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900 appearance-none"
                        value={formData.sex}
                        onChange={e => setFormData({ ...formData, sex: e.target.value })}
                        required={!isLogin}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                      <input
                        type="text"
                        placeholder="Upper Sixth"
                        className="w-full px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                        value={formData.class}
                        onChange={e => setFormData({ ...formData, class: e.target.value })}
                        required={!isLogin}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                      <input
                        type="text"
                        placeholder="Centre"
                        className="w-full px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        required={!isLogin}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign in to account' : 'Create my account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center space-y-4">
            <p className="text-slate-500 font-medium text-sm">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700 transition-colors"
            >
              {isLogin ? 'Create free account' : 'Sign in to existing'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-slate-300">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
            <CheckCircle2 size={12} /> Secure SSL
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
            <CheckCircle2 size={12} /> Vertexon Cloud
          </div>
        </div>
      </div>
    </div>
  );
}
