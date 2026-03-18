import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ShieldCheck, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

export default function PaymentPage() {
  const [method, setMethod] = useState<'mtn' | 'orange' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESSFUL' | 'FAILED'>('IDLE');
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const amount = 10000;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !phoneNumber || !user) return;
    
    setError(null);
    setProcessing(true);
    setStatus('PENDING');

    try {
      const res = await axios.post('/api/payment/initiate', { 
        phoneNumber: phoneNumber.startsWith('237') ? phoneNumber : `237${phoneNumber}`, 
        amount 
      }, {
        headers: {
          'x-user-id': user.uid
        }
      });
      setReference(res.data.reference);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please check your number.');
      setProcessing(false);
      setStatus('IDLE');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'PENDING' && reference) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/payment/status/${reference}`);
          if (res.data.status === 'SUCCESSFUL') {
            setStatus('SUCCESSFUL');
            clearInterval(interval);
            setTimeout(async () => {
              await refreshUser();
              navigate('/dashboard');
            }, 2000);
          } else if (res.data.status === 'FAILED') {
            setStatus('FAILED');
            setError('Payment was declined or failed. Please try again.');
            setProcessing(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [status, reference, navigate, refreshUser]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
        <div className="lg:col-span-7 space-y-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <ShieldCheck size={12} /> Secure Enrollment
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Unlock the Full <br />
              <span className="text-blue-600">GradeBoost 60</span> <br />
              Experience.
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              Get lifetime access to all 60 days of the Cameroon GCE A-Level CS & ICT syllabus. One-time payment, forever access.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "60 Comprehensive Lessons",
              "60 Auto-graded Quizzes",
              "Progress Tracking",
              "Achievement Badges",
              "Mock Exam Materials",
              "Community Support"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Enrollment Fee</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter">10,000</span>
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">FCFA</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-slate-100 sticky top-28">
            <AnimatePresence mode="wait">
              {status === 'PENDING' ? (
                <motion.div 
                  key="pending"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-8 border-blue-50 rounded-[1.5rem]" />
                    <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-[1.5rem] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                      <Smartphone size={28} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Confirm on Phone</h2>
                    <p className="text-slate-500 font-medium leading-relaxed text-sm">
                      We've sent a payment request to <span className="text-slate-900 font-bold">{phoneNumber}</span>. 
                      Please enter your PIN on your phone to complete the transaction.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest animate-pulse">
                    Waiting for confirmation...
                  </div>
                  <button 
                    onClick={() => { setStatus('IDLE'); setProcessing(false); }}
                    className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors"
                  >
                    Cancel and try again
                  </button>
                </motion.div>
              ) : status === 'SUCCESSFUL' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-12"
                >
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto rotate-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Payment Success!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed text-sm">
                      Welcome to GradeBoost 60. Your account is now fully activated. Redirecting to dashboard...
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Secure Checkout</h2>
                    <p className="text-slate-500 font-medium text-sm">Select your mobile money provider.</p>
                  </div>

                  <form onSubmit={handlePayment} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setMethod('mtn')}
                        className={`group p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${method === 'mtn' ? 'border-amber-400 bg-amber-50 shadow-xl shadow-amber-100' : 'border-slate-50 hover:border-amber-200 hover:bg-slate-50'}`}
                      >
                        <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">MTN</div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Mobile Money</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod('orange')}
                        className={`group p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${method === 'orange' ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-100' : 'border-slate-50 hover:border-orange-200 hover:bg-slate-50'}`}
                      >
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">OM</div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Orange Money</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <div className="relative group">
                        <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type="tel"
                          placeholder="6XX XXX XXX"
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-900"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold ml-1">Enter your 9-digit number without country code.</p>
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={processing || !method || phoneNumber.length < 9}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 group active:scale-[0.98]"
                    >
                      {processing ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          Pay 10,000 FCFA <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-3 text-slate-300">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Secured by CamPay</span>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
