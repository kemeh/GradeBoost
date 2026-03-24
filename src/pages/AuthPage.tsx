import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, deleteUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, BookOpen, ArrowRight, AlertCircle, CheckCircle2, TrendingUp, School, MapPin, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button, Card, Badge, cn } from '../components/ui';
import { Subject, SubjectModel } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, 'subjects'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubjectModel[];
        setSubjects(data);
        if (data.length > 0 && !formData.subject) {
          setFormData(prev => ({ ...prev, subject: data[0].name }));
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { appName, logoUrl, contactEmail } = useSettings();
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (user || isAdmin)) {
      if (isAdmin) {
        navigate('/admin');
      } else if (user?.paymentStatus === 'paid') {
        navigate('/dashboard');
      } else if (user) {
        navigate('/payment');
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '' as Subject,
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
        return `This account has been disabled. Please contact ${contactEmail}.`;
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

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    if (password.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonalphas) {
      return "Password must contain uppercase, lowercase, numbers, and special characters.";
    }
    return null;
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
        // Strong password validation
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Send verification email
        try {
          await sendEmailVerification(user);
        } catch (err) {
          console.error("Failed to send verification email:", err);
        }

        // Create user profile
        const isAdminEmail = formData.email.toLowerCase() === 'kemehhilary@gmail.com';
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: formData.name,
            email: formData.email,
            subject: formData.subject.trim(),
            school: formData.school,
            region: formData.region,
            assignedPapers: ['paper1', 'paper2', 'paper3'],
            targetGrade: 'A',
            role: isAdminEmail ? 'admin' : 'student',
            hasTakenDiagnostic: false,
            isPaid: isAdminEmail ? true : false,
            paymentStatus: isAdminEmail ? 'paid' : 'unpaid',
            paymentExpiryDate: isAdminEmail ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
            createdAt: serverTimestamp(),
          });
          console.log("User profile created for UID:", user.uid);
        } catch (error) {
          // If Firestore document creation fails, delete the Auth user
          console.error("Firestore profile creation failed, deleting Auth user:", error);
          try {
            await deleteUser(user);
          } catch (deleteErr) {
            console.error("Failed to delete Auth user after Firestore failure:", deleteErr);
          }
          handleFirestoreError(error, OperationType.CREATE, path);
          return;
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
              src={logoUrl} 
              alt={`${appName} Logo`} 
              className="h-12 w-auto"
            />
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && !isForgot && subjects.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Selection</label>
                <div className="grid grid-cols-2 gap-4">
                  {subjects.map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: sub.name })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-sm font-bold text-center flex flex-col items-center justify-center gap-1",
                        formData.subject === sub.name 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <span>{sub.name}</span>
                      {sub.level && (
                        <span className={cn(
                          "text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                          formData.subject === sub.name ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
                        )}>
                          {sub.level}
                        </span>
                      )}
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
