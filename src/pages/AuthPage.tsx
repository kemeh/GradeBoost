import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, 
  Send, KeyRound, Sparkles, RefreshCw, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button, Card } from '../components/ui';
import { checkAccountLockout, recordFailedAttempt, clearFailedAttempts } from '../services/authSecurityService';
import { logAuditEvent } from '../services/auditService';
import { EnhancedRegistrationModal } from '../components/EnhancedRegistrationModal';
import { PhoneOtpVerificationModal } from '../components/PhoneOtpVerificationModal';
import { sendPhoneOtp, formatPhoneNumber, detectCarrier, phoneToVirtualEmail } from '../services/phoneAuthService';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'phone_password' | 'phone_otp' | 'email_password'>('phone_password');
  const [isForgot, setIsForgot] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<'phone' | 'email'>('phone');
  
  const [rememberMe, setRememberMeState] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Inputs
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpReason, setOtpReason] = useState<'login' | 'reset_password'>('login');
  const [initialSimulatedOtp, setInitialSimulatedOtp] = useState<string | undefined>();
  const [resetModalStep, setResetModalStep] = useState<1 | 2>(1);

  const navigate = useNavigate();
  const { appName, logoUrl, contactEmail } = useSettings();
  const { user, loading: authLoading, isAdmin, isTeacher, setRememberMe: setAuthRememberMe } = useAuth();
  const { language, t } = useLanguage();

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

  const getFriendlyErrorMessage = (error: any) => {
    if (error.message && error.message.startsWith('{')) {
      return t('auth.login.error.general');
    }

    const code = error.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return t('auth.register.emailInUse', 'This account is already registered. Please login instead.');
      case 'auth/invalid-email':
        return t('auth.login.error.invalidEmail', 'Please enter a valid phone number or email.');
      case 'auth/user-disabled':
        return `${t('auth.login.error.disabled', 'This account has been disabled. Please contact')} ${contactEmail}.`;
      case 'auth/user-not-found':
        return t('auth.login.error.noAccount', 'No account found with these credentials. Please sign up.');
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return t('auth.login.error.invalidCredentials', 'Incorrect password or phone number. Please try again.');
      case 'auth/weak-password':
        return t('auth.register.weakPassword', 'Password should be at least 6 characters.');
      case 'auth/network-request-failed':
        return t('common.error.network', 'Network error. Please check your internet connection.');
      case 'auth/too-many-requests':
        return t('auth.login.error.tooManyAttempts');
      default:
        return error.message || t('auth.login.error.general');
    }
  };

  // Resolve target email for Firebase Auth based on phone or email input
  const resolveTargetEmail = async (phoneOrEmail: string): Promise<string> => {
    if (phoneOrEmail.includes('@')) {
      return phoneOrEmail.trim();
    }

    const formatted = formatPhoneNumber(phoneOrEmail);
    // Search Firestore users collection by phone number
    const q = query(collection(db, 'users'), where('phone', '==', formatted));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const userData = snap.docs[0].data();
      return userData.email || phoneToVirtualEmail(formatted);
    }

    // Default synthetic fallback
    return phoneToVirtualEmail(formatted);
  };

  // Handle Login via Phone + Password or Email + Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const inputIdentifier = loginMethod === 'email_password' ? emailInput : phoneInput;

    if (!inputIdentifier.trim()) {
      setError(loginMethod === 'email_password' ? t('auth.login.error.emptyEmail') : t('auth.login.error.emptyPhone'));
      setLoading(false);
      return;
    }

    try {
      const targetEmail = await resolveTargetEmail(inputIdentifier);

      const lockout = await checkAccountLockout(targetEmail);
      if (lockout.isLocked) {
        setError(t('auth.login.error.accountLocked').replace('{minutes}', Math.ceil(lockout.remainingSeconds / 60).toString()));
        setLoading(false);
        return;
      }

      try {
        const [userCredential] = await Promise.all([
          signInWithEmailAndPassword(auth, targetEmail, passwordInput),
          setAuthRememberMe(rememberMe)
        ]);

        // Run non-blocking audit & security cleanup in the background
        void clearFailedAttempts(targetEmail);
        void logAuditEvent({
          userId: userCredential.user.uid,
          userEmail: targetEmail,
          action: 'LOGIN_SUCCESS',
          details: `User authenticated via ${loginMethod}`,
        });
      } catch (loginErr: any) {
        const lockoutResult = await recordFailedAttempt(targetEmail);
        if (lockoutResult.isLocked) {
          setError(`Account locked due to 5 consecutive failed attempts. Please try again in 15 minutes.`);
        } else {
          const remaining = 5 - lockoutResult.failedAttempts;
          setError(`${getFriendlyErrorMessage(loginErr)} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
        }
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Dispatching OTP for Passwordless Login
  const handleStartPasswordlessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const formatted = formatPhoneNumber(phoneInput);
    const carrier = detectCarrier(formatted);

    if (!carrier.isValid) {
      setError(t('auth.login.error.invalidPhone'));
      return;
    }

    setLoading(true);

    try {
      // Check if user exists
      const targetEmail = await resolveTargetEmail(formatted);
      const q = query(collection(db, 'users'), where('phone', '==', formatted));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError(t('auth.login.error.noAccount'));
        setLoading(false);
        return;
      }

      const res = await sendPhoneOtp(formatted, 'login', language as any || 'en');
      if (res.success) {
        setInitialSimulatedOtp(res.simulatedOtp);
        setOtpReason('login');
        setShowOtpModal(true);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS code');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verified for Passwordless Login
  const handleOtpLoginVerified = async (otpCode?: string) => {
    setShowOtpModal(false);
    setLoading(true);
    setError('');

    try {
      const formatted = formatPhoneNumber(phoneInput);
      
      // Call server to verify OTP and get custom token for passwordless sign-in
      const { default: axios } = await import('axios');
      const response = await axios.post('/api/auth/otp-login', {
        phone: formatted,
        otpCode: otpCode,
        reason: 'login'
      });

      if (response.data.success && response.data.token) {
        // Sign in with Custom Token
        const { signInWithCustomToken } = await import('firebase/auth');
        await signInWithCustomToken(auth, response.data.token);
        
        toast.success(t('auth.login.success.otpVerified', 'Login successful!'));
        navigate('/dashboard');
      } else {
        setError(response.data.error || t('auth.login.error.otpFailed', 'Failed to verify OTP'));
      }
    } catch (err: any) {
      console.error("OTP Login Error:", err);
      const msg = err.response?.data?.error || err.message || t('auth.login.error.otpFailed', "Failed to finalize login after OTP");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Recovery (SMS OTP or Email)
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (recoveryMethod === 'email') {
        if (!emailInput.trim()) {
          setError(t('auth.login.error.emptyEmail'));
          setLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, emailInput);
        await logAuditEvent({
          userEmail: emailInput,
          action: 'PASSWORD_RESET_REQUEST',
          details: 'User requested password reset link via email',
        });
        setSuccess(t('auth.login.success.resetSent'));
      } else {
        // Phone Recovery via SMS OTP
        const formatted = formatPhoneNumber(phoneInput);
        const carrier = detectCarrier(formatted);

        if (!carrier.isValid) {
          setError(t('auth.login.error.invalidPhone'));
          setLoading(false);
          return;
        }

        const res = await sendPhoneOtp(formatted, 'reset_password', language as any || 'en');
        if (res.success) {
          setInitialSimulatedOtp(res.simulatedOtp);
          setOtpReason('reset_password');
          setShowOtpModal(true);
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-x-hidden box-border">
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto space-y-4 sm:space-y-6 my-auto py-6 px-1 sm:px-0 box-border">
        {/* Top Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <img 
              src={logoUrl} 
              alt={`${appName} Logo`} 
              className="h-9 sm:h-12 w-auto max-w-full object-contain"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug px-2">
            {isForgot 
              ? t('auth.login.resetTitle') 
              : isLogin 
              ? t('auth.login.title') 
              : t('auth.login.createAccountTitle')}
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-sm mx-auto px-2">
            {isForgot 
              ? t('auth.login.resetSubtitle') 
              : isLogin 
              ? t('auth.login.subtitle') 
              : t('auth.login.createAccountSubtitle')}
          </p>
        </div>

        {/* REGISTRATION MODAL OR LOGIN CARD */}
        {!isLogin && !isForgot ? (
          <EnhancedRegistrationModal 
            onSuccess={() => navigate('/dashboard')}
            onSwitchToLogin={() => setIsLogin(true)}
            lang={language as 'en' | 'fr'}
          />
        ) : (
          <Card className="p-4 sm:p-6 md:p-8 shadow-xl border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-full box-border overflow-hidden">
            {/* Method Tabs for Login */}
            {isLogin && !isForgot && (
              <div className="mb-5 p-1 bg-slate-100/80 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold w-full box-border">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone_password'); setError(''); }}
                  className={`min-h-[48px] sm:min-h-[52px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold ${
                    loginMethod.startsWith('phone')
                      ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={18} className="text-indigo-600 shrink-0" />
                  <span className="truncate">{t('auth.login.phoneTab')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setLoginMethod('email_password'); setError(''); }}
                  className={`min-h-[48px] sm:min-h-[52px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold ${
                    loginMethod === 'email_password'
                      ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <span className="truncate">{t('auth.login.emailTab')}</span>
                </button>
              </div>
            )}

            {/* Sub-toggle for Phone Login (Password vs SMS OTP) */}
            {isLogin && !isForgot && loginMethod.startsWith('phone') && (
              <div className="space-y-1.5 mb-5 w-full">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 ml-0.5">
                  <span>{t('auth.login.loginMode')}</span>
                  <div className="inline-flex items-center text-slate-400 hover:text-slate-600" title={language === 'fr' ? 'Choisissez le mot de passe ou la vérification par SMS OTP' : "Choose password or SMS OTP verification"}>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-[9px] flex items-center justify-center font-serif italic">i</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/60 rounded-2xl border border-slate-200/60 w-full box-border">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone_password')}
                    className={`min-h-[48px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold text-left leading-tight ${
                      loginMethod === 'phone_password' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50'
                    }`}
                  >
                    <Lock size={16} className={`shrink-0 ${loginMethod === 'phone_password' ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-[11px] sm:text-xs">{t('auth.login.phonePassword')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone_otp')}
                    className={`min-h-[48px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold text-left leading-tight ${
                      loginMethod === 'phone_otp' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50'
                    }`}
                  >
                    <ShieldCheck size={16} className={`shrink-0 ${loginMethod === 'phone_otp' ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-[11px] sm:text-xs">{t('auth.login.passwordlessOtp')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recovery Method Tabs */}
            {isForgot && (
              <div className="mb-4 sm:mb-6 p-1 bg-slate-100 rounded-xl sm:rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold w-full box-border">
                <button
                  type="button"
                  onClick={() => { setRecoveryMethod('phone'); setError(''); }}
                  className={`min-h-[48px] sm:min-h-[52px] py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold ${
                    recoveryMethod === 'phone'
                      ? 'bg-white text-indigo-950 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={16} className="text-indigo-600 shrink-0" />
                  <span className="truncate">{t('auth.login.smsOtpCode')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setRecoveryMethod('email'); setError(''); }}
                  className={`min-h-[48px] sm:min-h-[52px] py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold ${
                    recoveryMethod === 'email'
                      ? 'bg-white text-indigo-950 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{t('auth.login.emailLink')}</span>
                </button>
              </div>
            )}

            <form onSubmit={isForgot ? handleRecovery : loginMethod === 'phone_otp' ? handleStartPasswordlessLogin : handlePasswordLogin} className="space-y-4 sm:space-y-5 w-full box-border">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-200 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-start gap-2.5 sm:gap-3"
                  >
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-bold text-rose-700 leading-tight break-words">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 border border-emerald-200 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-start gap-2.5 sm:gap-3"
                  >
                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-bold text-emerald-700 leading-tight break-words">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PHONE INPUT FIELD */}
              {((isLogin && loginMethod.startsWith('phone')) || (isForgot && recoveryMethod === 'phone')) && (
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between ml-0.5">
                    <span>{t('auth.login.mobilePhone')}</span>
                    {phoneInput && (() => {
                      const carrier = detectCarrier(phoneInput);
                      return carrier.isValid ? (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                          {carrier.carrier}
                        </span>
                      ) : null;
                    })()}
                  </label>
                  <div className="relative w-full">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                      type="tel"
                      required
                      className="w-full pl-11 pr-3 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-mono font-bold text-slate-900 text-base sm:text-sm box-border"
                      placeholder={t('auth.login.phonePlaceholder')}
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* EMAIL INPUT FIELD */}
              {((isLogin && loginMethod === 'email_password') || (isForgot && recoveryMethod === 'email')) && (
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider ml-0.5">{t('auth.email')}</label>
                  <div className="relative w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-3 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900 text-base sm:text-sm box-border"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD FIELD (Only when not OTP login and not forgot password) */}
              {isLogin && !isForgot && loginMethod !== 'phone_otp' && (
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider ml-0.5">{t('auth.password')}</label>
                  <div className="relative w-full">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-11 pr-11 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900 text-base sm:text-sm box-border"
                      placeholder={t('auth.login.passwordPlaceholder')}
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg"
                      aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMeState(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-600">{t('auth.login.rememberMe')}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[54px] sm:min-h-[56px] py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 box-border active:scale-[0.99]"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : isForgot ? (
                  recoveryMethod === 'phone' ? t('auth.login.sendSmsOtp') : t('auth.login.sendEmailLink')
                ) : loginMethod === 'phone_otp' ? (
                  t('auth.login.sendPasswordlessOtp')
                ) : (
                  t('auth.login.signInBtn')
                )}
              </button>

              {/* BOTTOM FOOTER LINKS */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(!isForgot);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 py-1"
                >
                  {isForgot ? <ArrowLeft size={14} /> : null}
                  <span>{isForgot ? t('auth.login.backToLogin') : t('auth.login.forgotPassword')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setIsForgot(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors py-1"
                >
                  {t('auth.login.needAccount')} {t('auth.login.registerLink')}
                </button>
              </div>
            </form>
          </Card>
        )}

        <p className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
          Powered by Vertexon Technologies & Edulpha Ecosystem
        </p>
      </div>

      {/* OTP Modal for Passwordless Login & Reset */}
        <PhoneOtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phone={formatPhoneNumber(phoneInput)}
        onSuccess={otpReason === 'login' ? handleOtpLoginVerified : () => {
          setShowOtpModal(false);
          toast.success(t('auth.login.success.otpVerified', 'SMS OTP Verified! Please set your new password.'));
        }}
        reason={otpReason}
        initialSimulatedOtp={initialSimulatedOtp}
        lang={language as 'en' | 'fr'}
      />
    </div>
  );
}
