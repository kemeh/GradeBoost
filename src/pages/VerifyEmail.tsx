import React, { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, cn } from '../components/ui';
import { Mail, RefreshCw, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const VerifyEmail: React.FC = () => {
  const { firebaseUser, user, logout, isEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isEmailVerified) {
      navigate('/dashboard');
    }
  }, [isEmailVerified, navigate]);

  useEffect(() => {
    if (user?.verificationSentAt) {
      const sentAt = user.verificationSentAt.toDate ? user.verificationSentAt.toDate() : new Date(user.verificationSentAt);
      const now = new Date();
      const diff = now.getTime() - sentAt.getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (diff > thirtyMinutes) {
        setIsExpired(true);
        setError("Your verification link has expired (valid for 30 minutes). Please resend a new link.");
      } else {
        setIsExpired(false);
      }
    }
  }, [user]);

  const handleCheckVerification = async () => {
    if (!firebaseUser) return;
    setChecking(true);
    setError(null);
    try {
      await firebaseUser.reload();
      if (firebaseUser.emailVerified) {
        navigate('/dashboard');
      } else {
        setError("Email not verified yet. Please check your inbox and click the link.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check verification status.");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification(firebaseUser);
      // Update verificationSentAt in Firestore
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        verificationSentAt: serverTimestamp()
      });
      setSent(true);
      setIsExpired(false);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isEmailVerified ? "Email Verified!" : "Verify your email"}
        </h1>
        <p className="text-slate-600 mb-8">
          {isEmailVerified 
            ? "Your account is now fully verified. You can now access your dashboard and start your 60-day plan."
            : <>We've sent a verification email to <span className="font-semibold text-slate-900">{firebaseUser?.email}</span>. Please check your inbox and click the link to verify your account.</>
          }
        </p>

        {sent && !isEmailVerified && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>Verification email resent successfully!</p>
          </div>
        )}

        {error && (
          <div className={cn(
            "p-4 rounded-xl mb-6 text-sm flex items-start gap-3",
            isExpired ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {isExpired ? <AlertCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {isEmailVerified ? (
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleCheckVerification} 
                disabled={checking}
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest"
              >
                {checking ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  "I've verified my email"
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleResend} 
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  "Resend verification email"
                )}
              </Button>
            </>
          )}

          <button 
            onClick={logout}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto mt-4"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Can't find the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
