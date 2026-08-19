import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, cn } from '../components/ui';
import { Smartphone, RefreshCw, LogOut, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sendPhoneOtp } from '../services/phoneAuthService';

const VerifyPhone: React.FC = () => {
  const { user, logout, isAccountVerified } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isAccountVerified) {
      navigate('/dashboard');
    }
  }, [isAccountVerified, navigate]);

  const handleResend = async () => {
    if (!user?.phone) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sendPhoneOtp(user.phone, 'registration', 'en');
      if (res.success) {
        setSimulatedOtp(res.simulatedOtp || null);
        setSent(true);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification SMS.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user || !otp) return;
    setLoading(true);
    setError(null);

    // In a real app, you'd verify the OTP via a backend call.
    // For Edulpha simulation:
    const isValid = simulatedOtp ? otp === simulatedOtp : otp === '123456';

    if (isValid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          phoneVerified: true,
          phoneVerifiedAt: serverTimestamp(),
          status: 'active'
        });
        navigate('/dashboard');
      } catch (err: any) {
        setError("Failed to update verification status.");
      }
    } else {
      setError("Invalid verification code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div 
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Verify your phone
        </h1>
        <p className="text-slate-600 mb-8 text-sm font-medium">
          We've sent a 6-digit verification code to <span className="font-bold text-slate-900">{user?.phone}</span>. Please enter it below to activate your account.
        </p>

        {sent && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 mb-6 text-xs font-bold">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>Verification code resent successfully!</p>
          </div>
        )}

        {simulatedOtp && (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-xl flex items-center gap-3 mb-6 text-xs font-bold">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <p>Simulation Mode: Your code is <span className="text-lg tracking-widest">{simulatedOtp}</span></p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-xs font-bold flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="0 0 0 0 0 0"
            className="w-full h-14 text-center text-3xl font-black tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all"
          />

          <Button 
            onClick={handleVerify} 
            disabled={loading || otp.length !== 6}
            className="w-full h-12 text-sm bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleResend} 
            disabled={loading}
            className="w-full h-12 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-2xl"
          >
            Didn't receive the code? Resend
          </Button>

          <button 
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center justify-center gap-2 mx-auto mt-6 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out and try another method
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
