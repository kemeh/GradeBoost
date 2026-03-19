import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, CheckCircle2, School, Hash, Phone, Users, BookOpen, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    school: '',
    age: '',
    phoneNumber: '',
    sex: 'Male',
    class: '',
    region: '',
    subject: 'Computer Science'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('AuthPage status:', { authLoading, authUser: !!authUser, currentUser: !!auth.currentUser, isForgotPassword });
    if (!authLoading && authUser && !isForgotPassword) {
      console.log('Redirecting to dashboard from AuthPage');
      navigate('/dashboard');
    }
  }, [authUser, authLoading, navigate, isForgotPassword]);

  // Check if user is authenticated but has no profile document
  useEffect(() => {
    if (!authLoading && !authUser && auth.currentUser && !isForgotPassword && !loading) {
      console.log('User authenticated but no profile found');
      setError('User profile not found. If you just created this account, please try again or contact support.');
    }
  }, [authUser, authLoading, isForgotPassword, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);
    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, formData.email);
        setResetSent(true);
        return;
      }

      if (isLogin) {
        console.log('Attempting login...');
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('Login successful, navigating...');
        navigate('/dashboard');
      } else {
        console.log('Attempting signup...');
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        try {
          console.log('Creating user document...');
          const assignedSubjects = formData.subject === 'Computer Science' 
            ? ["cs_paper1", "cs_paper2", "cs_paper3"]
            : ["ict_paper1", "ict_paper2", "ict_paper3"];

          await setDoc(doc(db, 'users', user.uid), {
            name: formData.name,
            email: formData.email,
            school: formData.school,
            age: parseInt(formData.age) || 0,
            phoneNumber: formData.phoneNumber,
            sex: formData.sex,
            class: formData.class,
            region: formData.region,
            subject: formData.subject,
            assignedSubjects: assignedSubjects,
            isPaid: false,
            currentDay: 0,
            streak: 0,
            lastCompletedAt: null,
            progress: [],
            role: formData.email.toLowerCase() === 'kemehhilary@gmail.com' ? 'admin' : 'student',
            createdAt: new Date().toISOString()
          });
          console.log('User document created');
        } catch (err) {
          console.error('Error creating user document:', err);
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
          // Don't navigate if profile creation failed
          throw new Error('Failed to create user profile. Please try again.');
        }
        
        console.log('Signup successful, navigating...');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError(`Email/Password sign-in is not enabled in the Firebase Console for project "gradeboost-df887". Please enable it in Authentication > Sign-in method.`);
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in or use a different email address.');
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
              {isForgotPassword ? 'Reset password' : isLogin ? 'Welcome back' : 'Start your journey'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isForgotPassword 
                ? 'We will send you a link to reset your password'
                : isLogin 
                  ? 'Continue your 60-day challenge' 
                  : 'Join the next generation of GCE A-Level students'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50/50 p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="wait">
                {!isLogin && !isForgotPassword && (
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
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="Bilingual High School"
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
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
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="number"
                          placeholder="17"
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
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
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="tel"
                          placeholder="6XX XXX XXX"
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
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
                      <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <select
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900 appearance-none"
                          value={formData.sex}
                          onChange={e => setFormData({ ...formData, sex: e.target.value })}
                          required={!isLogin}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                      <div className="relative group">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="Upper Sixth"
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={formData.class}
                          onChange={e => setFormData({ ...formData, class: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                      <div className="relative group">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <select
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900 appearance-none"
                          value={formData.subject}
                          onChange={e => setFormData({ ...formData, subject: e.target.value })}
                          required={!isLogin}
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="ICT">ICT</option>
                        </select>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="Centre"
                          className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={formData.region}
                          onChange={e => setFormData({ ...formData, region: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className={`space-y-2 ${isForgotPassword ? 'md:col-span-2' : ''}`}>
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

              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!isForgotPassword}
                    />
                  </div>
                </div>
              )}
            </div>

            {resetSent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100"
              >
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                Password reset email sent! Please check your inbox.
              </motion.div>
            )}

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
                  {isForgotPassword ? 'Send reset link' : isLogin ? 'Sign in to account' : 'Create my account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center space-y-4">
            <p className="text-slate-500 font-medium text-sm">
              {isForgotPassword 
                ? "Remembered your password?" 
                : isLogin 
                  ? "Don't have an account yet?" 
                  : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsLogin(!isLogin);
                }
                setError('');
                setResetSent(false);
              }}
              className="text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700 transition-colors"
            >
              {isForgotPassword ? 'Back to sign in' : isLogin ? 'Create free account' : 'Sign in to existing'}
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
