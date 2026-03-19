import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, BookOpen, ArrowRight, AlertCircle, CheckCircle2, TrendingUp, School, MapPin } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, cn } from '../components/ui';
import { Subject } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.paymentStatus === 'paid') {
        navigate('/dashboard');
      } else {
        navigate('/payment');
      }
    }
  }, [user, authLoading, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: 'Computer Science' as Subject,
    school: '',
    region: '',
  });

  const getFriendlyErrorMessage = (error: any) => {
    if (error.message && error.message.startsWith('{')) {
      return 'A database error occurred. Please try again.';
    }

    const code = error.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgot) {
        await sendPasswordResetEmail(auth, formData.email);
        setSuccess('Password reset link sent to your email.');
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Create user profile
        const isAdminEmail = formData.email.toLowerCase() === 'kemehhilary@gmail.com';
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            school: formData.school,
            region: formData.region,
            assignedPapers: ['paper1', 'paper2', 'paper3'],
            targetGrade: 'A',
            role: isAdminEmail ? 'admin' : 'student',
            hasTakenDiagnostic: false,
            paymentStatus: isAdminEmail ? 'paid' : 'unpaid',
            paymentExpiryDate: isAdminEmail ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img 
              src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
              alt="GradeBoost 60 Logo" 
              className="h-12 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">GradeBoost 60</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isForgot 
              ? 'Enter your email to receive a reset link.' 
              : isLogin 
              ? 'Login to continue your journey to an A.' 
              : 'Start your 60-day improvement plan today.'}
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="text-red-600 shrink-0" size={18} />
                  <p className="text-xs font-bold text-red-600 leading-tight">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3"
                >
                  <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                  <p className="text-xs font-bold text-emerald-600 leading-tight">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && !isForgot && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">School</label>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                      placeholder="Your School Name"
                      value={formData.school}
                      onChange={e => setFormData({ ...formData, school: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                      placeholder="e.g. Center, Littoral..."
                      value={formData.region}
                      onChange={e => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            )}

            {!isLogin && !isForgot && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Selection</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['Computer Science', 'ICT'] as Subject[]).map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: sub })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-sm font-bold text-center",
                        formData.subject === sub 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : isForgot ? 'Send Link' : isLogin ? 'Login' : 'Create Account'}
            </Button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgot(!isForgot);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {isForgot ? 'Back to Login' : 'Forgot Password?'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsForgot(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {isLogin ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>
          </form>
        </Card>
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Powered by Vertexon Technologies
        </p>
      </div>
    </div>
  );
}
