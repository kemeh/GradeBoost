import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, deleteUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, BookOpen, ArrowRight, AlertCircle, CheckCircle2, TrendingUp, School, MapPin, Eye, EyeOff, ShieldCheck, Clock } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button, Card, Badge, cn } from '../components/ui';
import { Subject, SubjectModel } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { DEFAULT_GCE_SUBJECTS, getPapersForSubjectName, seedDefaultGceSubjects } from '../data/defaultSubjects';
import { checkAccountLockout, recordFailedAttempt, clearFailedAttempts } from '../services/authSecurityService';
import { logAuditEvent } from '../services/auditService';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [rememberMe, setRememberMeState] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<'cameroon_gce' | 'cameroon_francophone'>('cameroon_gce');
  const [selectedLevel, setSelectedLevel] = useState<string>('Ordinary level');
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, 'subjects'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubjectModel[];
        
        if (data.length === 0) {
          await seedDefaultGceSubjects(db);
          const retrySnap = await getDocs(q);
          data = retrySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubjectModel[];
        }

        if (data.length === 0) {
          data = DEFAULT_GCE_SUBJECTS.map((sub, idx) => ({
            id: `sub-${idx}`,
            ...sub,
            createdAt: new Date()
          })) as SubjectModel[];
        }

        setSubjects(data);
        const filtered = data.filter(s => s.level === selectedLevel);
        if (filtered.length > 0 && !formData.subject) {
          setFormData(prev => ({ ...prev, subject: filtered[0].name }));
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
  const { user, loading: authLoading, isAdmin, isTeacher, setRememberMe: setAuthRememberMe } = useAuth();

  useEffect(() => {
    if (!authLoading && (user || isAdmin)) {
      if (isAdmin) {
        navigate('/admin');
      } else if (isTeacher) {
        navigate('/admin/lms');
      } else if (user?.paymentStatus === 'paid') {
        navigate('/dashboard');
      } else if (user) {
        navigate('/payment');
      }
    }
  }, [user, authLoading, isAdmin, isTeacher, navigate]);

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
        return 'Too many failed attempts. Account temporarily locked for security.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 6;
    if (password.length < minLength) return `Password must be at least ${minLength} characters long.`;
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
        await logAuditEvent({
          userEmail: formData.email,
          action: 'PASSWORD_RESET_REQUEST',
          details: 'User requested password reset link',
        });
        setSuccess('Password reset link sent to your email.');
      } else if (isLogin) {
        // Account lockout check before attempting login
        const lockout = await checkAccountLockout(formData.email);
        if (lockout.isLocked) {
          setError(`Account locked due to 5 failed attempts. Please try again in ${Math.ceil(lockout.remainingSeconds / 60)} minutes.`);
          setLockoutCountdown(lockout.remainingSeconds);
          setLoading(false);
          return;
        }

        await setAuthRememberMe(rememberMe);

        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          await clearFailedAttempts(formData.email);
          await logAuditEvent({
            userId: userCredential.user.uid,
            userEmail: formData.email,
            action: 'LOGIN_SUCCESS',
            details: 'Successful user authentication',
          });
        } catch (loginErr: any) {
          const lockoutResult = await recordFailedAttempt(formData.email);
          if (lockoutResult.isLocked) {
            setError(`Account locked due to 5 consecutive failed attempts. Please try again in 15 minutes.`);
          } else {
            const remaining = 5 - lockoutResult.failedAttempts;
            setError(`${getFriendlyErrorMessage(loginErr)} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
          }
          setLoading(false);
          return;
        }
      } else {
        if (!formData.subject) {
          setError('Please select a subject.');
          setLoading(false);
          return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        await setAuthRememberMe(rememberMe);
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        try {
          await sendEmailVerification(user);
        } catch (err) {
          console.error("Failed to send verification email:", err);
        }

        const isAdminEmail = formData.email.toLowerCase() === 'kemehhilary@gmail.com';
        const assignedRole = isAdminEmail ? 'admin' : selectedRole;
        const path = `users/${user.uid}`;
        const targetSubjectPapers = getPapersForSubjectName(formData.subject, selectedLevel, subjects);
        const assignedPaperIds = targetSubjectPapers.map(p => p.id);

        try {
          const currName = selectedCurriculum === 'cameroon_gce' 
            ? 'English Curriculum (Cameroon GCE)' 
            : 'French Curriculum (Cameroon Francophone)';

          await setDoc(doc(db, 'users', user.uid), {
            name: formData.name,
            email: formData.email,
            subject: formData.subject.trim(),
            curriculumId: selectedCurriculum,
            curriculumName: currName,
            educationLevelId: selectedLevel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            educationLevelName: selectedLevel,
            level: selectedLevel,
            school: formData.school,
            region: formData.region,
            assignedPapers: assignedPaperIds.length > 0 ? assignedPaperIds : ['paper1', 'paper2'],
            targetGrade: 'A',
            role: assignedRole,
            status: 'active',
            hasTakenDiagnostic: false,
            isPaid: (isAdminEmail || assignedRole === 'teacher') ? true : false,
            paymentStatus: (isAdminEmail || assignedRole === 'teacher') ? 'paid' : 'unpaid',
            paymentExpiryDate: (isAdminEmail || assignedRole === 'teacher') ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
            verificationSentAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          });
          
          await logAuditEvent({
            userId: user.uid,
            userEmail: formData.email,
            action: 'REGISTER_SUCCESS',
            details: `Registered new account with role: ${assignedRole}`,
          });
        } catch (error) {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher variant="compact" />
      </div>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={cn(
                        "py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                        selectedRole === 'student'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      <User size={14} /> Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={cn(
                        "py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                        selectedRole === 'teacher'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      <ShieldCheck size={14} /> Teacher / Instructor
                    </button>
                  </div>
                </div>

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

                {/* Curriculum Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Educational Curriculum</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCurriculum('cameroon_gce');
                        setSelectedLevel('Ordinary level');
                        const oSubs = subjects.filter(s => !s.curriculumId || s.curriculumId === 'cameroon_gce');
                        if (oSubs.length > 0) setFormData(prev => ({ ...prev, subject: oSubs[0].name }));
                      }}
                      className={cn(
                        "py-2.5 px-2 rounded-xl font-bold text-xs transition-all text-center",
                        selectedCurriculum === 'cameroon_gce'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      English GCE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCurriculum('cameroon_francophone');
                        setSelectedLevel('Terminale');
                        setFormData(prev => ({ ...prev, subject: 'Mathématiques' }));
                      }}
                      className={cn(
                        "py-2.5 px-2 rounded-xl font-bold text-xs transition-all text-center",
                        selectedCurriculum === 'cameroon_francophone'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Système Francophone
                    </button>
                  </div>
                </div>

                {/* Level Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Education Level</label>
                  {selectedCurriculum === 'cameroon_gce' ? (
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('Ordinary level')}
                        className={cn(
                          "py-2.5 rounded-xl font-bold text-xs transition-all",
                          selectedLevel === 'Ordinary level'
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        O-Level (Ordinary)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('Advance level')}
                        className={cn(
                          "py-2.5 rounded-xl font-bold text-xs transition-all",
                          selectedLevel === 'Advance level'
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        A-Level (Advanced)
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl">
                      {['Troisième (BEPC)', 'Seconde', 'Première', 'Terminale'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={cn(
                            "py-2 rounded-lg font-bold text-[11px] transition-all text-center truncate px-1",
                            selectedLevel === lvl
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-900"
                          )}
                        >
                          {lvl.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Subject</label>
                  {subjects.filter(s => s.level === selectedLevel).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {subjects.filter(s => s.level === selectedLevel).map(sub => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, subject: sub.name })}
                          className={cn(
                            "p-3 rounded-2xl border-2 transition-all text-xs font-bold text-left flex flex-col justify-between gap-1",
                            formData.subject === sub.name 
                              ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm" 
                              : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                          )}
                        >
                          <span className="truncate w-full font-extrabold">{sub.name}</span>
                          <span className="text-[9px] font-medium text-slate-400">
                            {sub.papers?.length || 2} Papers ({sub.category || 'General'})
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-[10px] font-bold">
                      No active {selectedLevel === 'Advance level' ? 'A-Level' : 'O-Level'} subjects available.
                    </div>
                  )}
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

                {isLogin && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMeState(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-600">Remember Me</span>
                    </label>
                  </div>
                )}
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
