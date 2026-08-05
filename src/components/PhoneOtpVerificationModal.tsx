import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ShieldCheck, RefreshCw, AlertCircle, X, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { verifyPhoneOtp, sendPhoneOtp, detectCarrier } from '../services/phoneAuthService';
import { toast } from 'react-hot-toast';

interface PhoneOtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onSuccess: () => void;
  reason?: 'registration' | 'login' | 'reset_password' | 'update_phone';
  lang?: 'en' | 'fr';
  initialSimulatedOtp?: string;
}

export const PhoneOtpVerificationModal: React.FC<PhoneOtpVerificationModalProps> = ({
  isOpen,
  onClose,
  phone,
  onSuccess,
  reason = 'registration',
  lang = 'en',
  initialSimulatedOtp
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(60);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(initialSimulatedOtp || null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const carrierInfo = detectCarrier(phone);

  useEffect(() => {
    if (initialSimulatedOtp) {
      setSimulatedCode(initialSimulatedOtp);
    }
  }, [initialSimulatedOtp]);

  // Listen for custom simulated SMS events in dev/sandbox mode
  useEffect(() => {
    const handleSimulatedSms = (e: any) => {
      if (e.detail && e.detail.otpCode) {
        setSimulatedCode(e.detail.otpCode);
      }
    };
    window.addEventListener('edulpha:simulated-sms', handleSimulatedSms);
    return () => window.removeEventListener('edulpha:simulated-sms', handleSimulatedSms);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (!isOpen) return;
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Auto focus first input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, '');
    
    // Handle paste of full 6 digit code
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, idx) => {
        newDigits[idx] = d;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setError(lang === 'fr' ? 'Veuillez entrer le code à 6 chiffres' : 'Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await verifyPhoneOtp(phone, fullCode, reason, lang);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await sendPhoneOtp(phone, reason, lang);
      if (res.success) {
        toast.success(res.message);
        if (res.simulatedOtp) {
          setSimulatedCode(res.simulatedOtp);
        }
        setCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const autofillSimulated = () => {
    if (simulatedCode && simulatedCode.length === 6) {
      setOtpDigits(simulatedCode.split(''));
      toast.success(lang === 'fr' ? 'Code Rempli!' : 'Test Code Filled!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
              <Smartphone size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'fr' ? 'Vérification du Téléphone' : 'Phone Verification'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'fr' 
                ? 'Nous avons envoyé un code SMS au'
                : 'We sent a 6-digit SMS verification code to'}
            </p>
            
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <span className="font-bold text-slate-900 font-mono text-sm">{carrierInfo.formatted}</span>
              {carrierInfo.carrier === 'MTN' && (
                <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 font-black text-[10px] rounded-md uppercase">MTN</span>
              )}
              {carrierInfo.carrier === 'Orange' && (
                <span className="px-2 py-0.5 bg-orange-500 text-white font-black text-[10px] rounded-md uppercase">Orange</span>
              )}
            </div>
          </div>

          {/* Simulation mode banner */}
          {simulatedCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-amber-900 flex flex-col items-center justify-center text-center gap-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-600" />
                {lang === 'fr' ? 'Mode Sandbox / Test OTP' : 'Sandbox / Test Mode OTP'}
              </div>
              <p className="text-xs text-amber-700">
                {lang === 'fr' ? 'Votre code de test est:' : 'Your test verification code is:'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-black font-mono tracking-widest text-amber-950 bg-amber-100 px-4 py-1 rounded-xl border border-amber-300">
                  {simulatedCode}
                </span>
                <button
                  type="button"
                  onClick={autofillSimulated}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
                >
                  {lang === 'fr' ? 'Remplir' : 'Auto-fill'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
                {lang === 'fr' ? 'Entrez le code à 6 chiffres' : 'Enter 6-Digit Code'}
              </label>
              
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 md:w-12 md:h-14 text-center text-xl font-black font-mono bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  />
                ))}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || otpDigits.join('').length < 6}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{lang === 'fr' ? 'Vérification...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>{lang === 'fr' ? 'Vérifier le Code' : 'Verify & Continue'}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Resend */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {lang === 'fr' ? "Vous n'avez pas reçu le SMS ?" : "Didn't receive the SMS code?"}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:no-underline transition-colors underline flex items-center justify-center gap-1.5 mx-auto"
            >
              {isResending ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Phone size={14} />
              )}
              {cooldown > 0 ? (
                <span>
                  {lang === 'fr'
                    ? `Renvoyer le SMS (${cooldown}s)`
                    : `Resend SMS Code (${cooldown}s)`}
                </span>
              ) : (
                <span>{lang === 'fr' ? 'Renvoyer le code SMS' : 'Resend SMS Code Now'}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PhoneOtpVerificationModal;
