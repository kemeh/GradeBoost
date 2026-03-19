import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Smartphone, ShieldCheck, 
  TrendingUp, CheckCircle2, AlertCircle,
  ArrowRight, Lock, Zap, FileText, Target
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { Button, Card, Badge, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [reference, setReference] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    network: 'MTN' as 'MTN' | 'Orange',
  });

  const checkStatus = async (ref: string) => {
    try {
      const response = await fetch(`/api/payment/status/${ref}`);
      const data = await response.json();
      
      if (data.status === 'SUCCESSFUL') {
        const path = `users/${user?.uid}`;
        await updateDoc(doc(db, 'users', user?.uid as string), {
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        });
        setPaymentStep('success');
        setSuccess(true);
        return true;
      } else if (data.status === 'FAILED') {
        setPaymentStep('failed');
        setError('Payment failed. Please try again.');
        return true;
      }
      return false;
    } catch (err) {
      console.error("Status check error:", err);
      return false;
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setPaymentStep('processing');

    try {
      const response = await fetch('/api/payment/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          amount: 1000,
          description: `GradeBoost 60 - ${user.name}`,
          external_reference: `gb60_${user.uid}_${Date.now()}`
        })
      });

      const data = await response.json();
      if (data.reference) {
        setReference(data.reference);
        
        // Start polling for status
        const pollInterval = setInterval(async () => {
          const finished = await checkStatus(data.reference);
          if (finished) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 5000);

        // Stop polling after 5 minutes (timeout)
        setTimeout(() => {
          clearInterval(pollInterval);
          if (paymentStep === 'processing') {
            setPaymentStep('form');
            setError('Payment timed out. Please check your phone and try again.');
            setLoading(false);
          }
        }, 300000);
      } else {
        throw new Error(data.error || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setPaymentStep('form');
      setError(err.message || 'Payment failed to initiate. Please check your connection.');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Benefits & Trust */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <img 
                src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
                alt="GradeBoost 60 Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-black text-slate-900 tracking-tight">GradeBoost 60</span>
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Unlock Your Full Potential for an <span className="text-indigo-600">A Grade</span>.
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              To access full exam practice and improve your grades, a one-time fee of <span className="font-black text-slate-900">1000 FCFA</span> is required.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: FileText, title: 'Access Real Exam Papers', desc: 'Practice with authentic GCE A-Level papers from previous years.' },
              { icon: Target, title: 'Diagnostic Analysis', desc: 'Get a custom learning path based on your strengths and weaknesses.' },
              { icon: Zap, title: 'Smart Insights', desc: 'AI-powered feedback to help you focus on what matters most.' },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <benefit.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{benefit.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <ShieldCheck className="text-emerald-600" size={20} />
            <p className="text-xs font-bold text-emerald-700">
              Secure payment powered by trusted mobile money services.
            </p>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <Card className="p-8 lg:p-12 shadow-2xl border-slate-200 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {paymentStep === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <Badge variant="primary">One-time Payment</Badge>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Details</h2>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                      value={user.name}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Network</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['MTN', 'Orange'].map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setFormData({ ...formData, network: net as any })}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            formData.network === net 
                              ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                              : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          <Smartphone size={24} />
                          <span className="text-xs font-black uppercase tracking-widest">{net} Money</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="tel"
                        required
                        placeholder="6xx xxx xxx"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <span className="text-xl font-black text-white">1000 FCFA</span>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Pay 1000 FCFA <ArrowRight className="ml-2" />
                  </Button>
                </form>
              </motion.div>
            )}

            {paymentStep === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="py-20 flex flex-col items-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <Smartphone className="absolute inset-0 m-auto text-indigo-600" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Processing Payment</h3>
                  <p className="text-sm text-slate-500 font-medium">Please check your phone for the USSD prompt to authorize the transaction.</p>
                </div>
              </motion.div>
            )}

            {paymentStep === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-8"
              >
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                  <AlertCircle size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Payment Failed</h3>
                  <p className="text-slate-500 font-medium">{error || 'Something went wrong with your transaction.'}</p>
                </div>
                <Button size="lg" className="w-full" onClick={() => setPaymentStep('form')}>
                  Try Again <ArrowRight className="ml-2" />
                </Button>
              </motion.div>
            )}

            {paymentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-8"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h3>
                  <p className="text-slate-500 font-medium">Welcome to the full GradeBoost 60 experience. Your account is now unlocked.</p>
                </div>
                <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                  Get Started <ArrowRight className="ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
