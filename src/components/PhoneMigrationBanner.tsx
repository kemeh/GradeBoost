import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, ShieldAlert, ArrowRight, X, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PhoneOtpVerificationModal } from './PhoneOtpVerificationModal';
import { sendPhoneOtp, formatPhoneNumber, detectCarrier } from '../services/phoneAuthService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

export const PhoneMigrationBanner: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [showInputModal, setShowInputModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [initialSimulatedOtp, setInitialSimulatedOtp] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // If user already has a verified phone or dismissed banner, don't show
  if (!user || user.phoneVerified || isDismissed) {
    return null;
  }

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formatted = formatPhoneNumber(phoneInput);
    const carrier = detectCarrier(formatted);

    if (!carrier.isValid) {
      setError('Please enter a valid mobile phone number (e.g. +237 670000000)');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendPhoneOtp(formatted, 'update_phone', user.language as any || 'en');
      if (res.success) {
        setInitialSimulatedOtp(res.simulatedOtp);
        setShowInputModal(false);
        setShowOtpModal(true);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS code');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpSuccess = async () => {
    try {
      const formatted = formatPhoneNumber(phoneInput);
      const carrier = detectCarrier(formatted);

      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          phone: formatted,
          phoneVerified: true,
          phoneProvider: carrier.carrier
        });
        await refreshUserProfile();
        toast.success('Mobile phone number verified and linked to your account!');
        setShowOtpModal(false);
      }
    } catch (err) {
      console.error('Error linking phone:', err);
      toast.error('Failed to link phone to profile');
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 md:p-6 mb-8 shadow-xl border border-indigo-700/50 relative overflow-hidden"
        >
          {/* Background decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 p-1.5 text-indigo-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 text-amber-300 rounded-2xl border border-white/10 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-lg text-white tracking-tight">
                    Add & Verify Mobile Phone Number
                  </h4>
                  <span className="px-2 py-0.5 bg-amber-400 text-indigo-950 font-black text-[10px] rounded-full uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} /> Recommended
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1 max-w-2xl font-medium leading-relaxed">
                  Edulpha now uses mobile phone numbers (MTN / Orange Cameroon) for fast passwordless SMS logins and instant account recovery. Add your phone number now to secure your account.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInputModal(true)}
              className="w-full md:w-auto px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 shrink-0 group"
            >
              <span>Add Phone Number</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Input Phone Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowInputModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Verify Mobile Phone</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your MTN or Orange mobile number to receive a verification SMS code.
              </p>
            </div>

            <form onSubmit={handleStartVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+237 670 00 00 00"
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono text-sm focus:border-indigo-600 focus:bg-white outline-none"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <span className="px-1.5 py-0.5 bg-yellow-400 text-slate-900 font-black text-[9px] rounded">MTN</span>
                    <span className="px-1.5 py-0.5 bg-orange-500 text-white font-black text-[9px] rounded">Orange</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending || !phoneInput.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {isSending ? 'Sending SMS Code...' : 'Send Verification SMS'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <PhoneOtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phone={formatPhoneNumber(phoneInput)}
        onSuccess={handleOtpSuccess}
        reason="update_phone"
        initialSimulatedOtp={initialSimulatedOtp}
      />
    </>
  );
};

export default PhoneMigrationBanner;
