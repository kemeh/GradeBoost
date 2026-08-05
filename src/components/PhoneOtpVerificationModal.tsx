import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Smartphone, 
  MessageSquare, 
  Sparkles,
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';
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
  initialChannel?: 'whatsapp' | 'sms';
}

export const PhoneOtpVerificationModal: React.FC<PhoneOtpVerificationModalProps> = ({
  isOpen,
  onClose,
  phone,
  onSuccess,
  reason = 'registration',
  lang = 'en',
  initialSimulatedOtp,
  initialChannel = 'whatsapp'
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms'>(initialChannel);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
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

  // Listen for custom simulated SMS / WhatsApp events in dev/sandbox mode
  useEffect(() => {
    const handleSimulatedEvent = (e: any) => {
      if (e.detail && e.detail.otpCode) {
        setSimulatedCode(e.detail.otpCode);
      }
    };
    window.addEventListener('edulpha:simulated-sms', handleSimulatedEvent);
    window.addEventListener('edulpha:simulated-whatsapp', handleSimulatedEvent);
    return () => {
      window.removeEventListener('edulpha:simulated-sms', handleSimulatedEvent);
      window.removeEventListener('edulpha:simulated-whatsapp', handleSimulatedEvent);
    };
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

  const handleResend = async (targetChannel?: 'whatsapp' | 'sms') => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    setFallbackNotice(null);

    const channelToUse = targetChannel || activeChannel;

    try {
      const res = await sendPhoneOtp(phone, reason, lang, channelToUse);
      if (res.success) {
        toast.success(res.message);
        if (res.channelUsed) {
          setActiveChannel(res.channelUsed);
        }
        if (res.fallbackTriggered) {
          setFallbackNotice(
            lang === 'fr'
              ? 'WhatsApp indisponible. Un SMS de secours vous a été envoyé.'
              : 'WhatsApp verification unavailable. Sent via SMS fallback.'
          );
        }
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
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border shadow-sm transition-colors ${
              activeChannel === 'whatsapp' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              {activeChannel === 'whatsapp' ? (
                <MessageSquare size={32} />
              ) : (
                <Smartphone size={32} />
              )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'fr' ? 'Vérification du Téléphone' : 'Phone Verification'}
            </h3>

            {/* Active Channel Indicator */}
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              {activeChannel === 'whatsapp' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  WhatsApp OTP (Primary)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-900 font-bold text-xs rounded-full border border-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  SMS OTP (Fallback)
                </span>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-mono font-bold text-slate-800">
                {carrierInfo.formatted}
                {carrierInfo.carrier === 'MTN' && (
                  <span className="px-1.5 py-0.5 bg-yellow-400 text-slate-900 font-black text-[9px] rounded uppercase">MTN</span>
                )}
                {carrierInfo.carrier === 'Orange' && (
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white font-black text-[9px] rounded uppercase">Orange</span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              {activeChannel === 'whatsapp' ? (
                lang === 'fr'
                  ? 'Nous avons envoyé un code de vérification à 6 chiffres via WhatsApp au'
                  : 'We sent a 6-digit WhatsApp verification code to'
              ) : (
                lang === 'fr'
                  ? 'Nous avons envoyé un code de vérification à 6 chiffres par SMS au'
                  : 'We sent a 6-digit SMS verification code to'
              )}
            </p>
          </div>

          {/* Automatic Fallback Notice Banner */}
          {fallbackNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-amber-900 text-xs font-semibold"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fallbackNotice}</span>
            </motion.div>
          )}

          {/* Sandbox Simulation Mode Banner */}
          {simulatedCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-emerald-950 flex flex-col items-center justify-center text-center gap-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-600" />
                {lang === 'fr' ? 'Mode Simulation Sandbox OTP' : 'Sandbox / Test Mode OTP'}
              </div>
              <p className="text-xs text-emerald-800">
                {lang === 'fr' ? 'Votre code de test est:' : 'Your test verification code is:'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-black font-mono tracking-widest text-emerald-950 bg-emerald-100 px-4 py-1 rounded-xl border border-emerald-300">
                  {simulatedCode}
                </span>
                <button
                  type="button"
                  onClick={autofillSimulated}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
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
              className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                activeChannel === 'whatsapp'
                  ? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-indigo-200'
              }`}
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

          {/* Dual Channel Resend & Fallback Controls */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              {lang === 'fr' ? "Vous n'avez pas reçu le code ?" : "Didn't receive your verification code?"}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleResend('whatsapp')}
                disabled={cooldown > 0 || isResending}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={14} className="text-emerald-600" />
                {cooldown > 0 ? (
                  <span>WhatsApp ({cooldown}s)</span>
                ) : (
                  <span>{lang === 'fr' ? 'Renvoyer sur WhatsApp' : 'Resend via WhatsApp'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleResend('sms')}
                disabled={cooldown > 0 || isResending}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone size={14} className="text-slate-500" />
                {cooldown > 0 ? (
                  <span>SMS ({cooldown}s)</span>
                ) : (
                  <span>{lang === 'fr' ? 'Renvoyer par SMS' : 'Fallback to SMS'}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PhoneOtpVerificationModal;
