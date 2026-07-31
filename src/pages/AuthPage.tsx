import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button, Card } from '../components/ui';
import { checkAccountLockout, recordFailedAttempt, clearFailedAttempts } from '../services/authSecurityService';
import { logAuditEvent } from '../services/auditService';
import { EnhancedRegistrationModal } from '../components/EnhancedRegistrationModal';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [rememberMe, setRememberMeState] = useState(true);
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { appName, logoUrl, contactEmail } = useSettings();
  const { user, loading: authLoading, isAdmin, isTeacher, setRememberMe: setAuthRememberMe } = useAuth();
  const { language } = useLanguage();

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
    email: '',
    password: '',
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
      <div className={`${!isLogin && !isForgot ? 'max-w-2xl' : 'max-w-md'} w-full space-y-8 transition-all`}>
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img 
              src={logoUrl} 
              alt={`${appName} Logo`} 
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Edulpha Account'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isForgot 
              ? 'Enter your email to receive a reset link.' 
              : isLogin 
              ? 'Login to continue your journey to an A.' 
              : 'Join Edulpha: Cameroon English & French Learning Ecosystem'}
          </p>
        </div>

        {!isLogin && !isForgot ? (
          <EnhancedRegistrationModal 
            onSuccess={() => navigate('/dashboard')}
            onSwitchToLogin={() => setIsLogin(true)}
            lang={language as 'en' | 'fr'}
          />
        ) : (
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
                {loading ? 'Processing...' : isForgot ? 'Send Link' : 'Login'}
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
                    setIsLogin(false);
                    setIsForgot(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Need an account? Register
                </button>
              </div>
            </form>
          </Card>
        )}

        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Powered by Vertexon Technologies & Edulpha Ecosystem
        </p>
      </div>
    </div>
  );
}
