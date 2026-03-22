import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Smartphone, ShieldCheck, 
  TrendingUp, CheckCircle2, AlertCircle,
  ArrowRight, Lock, Zap, FileText, Target,
  Play, HelpCircle, ChevronRight, LockKeyhole,
  LogOut
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, collection, query, where, limit, getDocs, orderBy, addDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { Button, Card, Badge, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { QuestionPaper, DailyDrill } from '../types';
import { getSystemSettings } from '../services/settingsService';
import { useSettings } from '../contexts/SettingsContext';

export default function PaymentPage() {
  const { user } = useAuth();
  const { appName, logoUrl, contactEmail } = useSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'failed' | 'manual'>('form');
  const [reference, setReference] = useState('');
  const [paymentPrice, setPaymentPrice] = useState(1000);
  const [manualData, setManualData] = useState({
    transactionId: '',
    method: 'MTN Mobile Money' as string,
    amount: 1000
  });
  const [freeSample, setFreeSample] = useState<QuestionPaper | DailyDrill | null>(null);
  const [loadingSample, setLoadingSample] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Real-time listener for system settings
    const docRef = doc(db, 'system_settings', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data();
        if (settings?.paymentPrice) {
          setPaymentPrice(settings.paymentPrice);
          setManualData(prev => ({ ...prev, amount: settings.paymentPrice }));
        }
      }
    }, (err) => {
      console.error("Error listening to system settings:", err);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If user is already paid and not an admin, redirect to dashboard
    if (user && user.paymentStatus === 'paid' && !isAdmin) {
      const hasExpired = user.paymentExpiryDate && new Date(user.paymentExpiryDate) < new Date();
      if (!hasExpired) {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, navigate]);

  const [formData, setFormData] = useState({
    phone: '',
    network: 'MTN' as 'MTN' | 'Orange',
  });

  useEffect(() => {
    const fetchFreeSample = async () => {
      if (!user) return;
      
      const userSubject = user.subject;
      if (!userSubject) {
        console.log("PaymentPage: No user subject found", user);
        return;
      }

      setLoadingSample(true);
      try {
        console.log(`PaymentPage: Fetching free sample for ${userSubject}`);
        
        // Try to fetch Daily Drill marked as free sample first
        const drillQuery = query(
          collection(db, 'dailyDrills'),
          where('subject', '==', userSubject),
          where('isFreeSample', '==', true),
          limit(1)
        );
        
        let drillSnapshot = await getDocs(drillQuery);
        
        // Fallback to Day 1 if no explicit free sample is found
        if (drillSnapshot.empty) {
          console.log("PaymentPage: No explicit free sample drill found, trying Day 1");
          const day1Query = query(
            collection(db, 'dailyDrills'),
            where('subject', '==', userSubject),
            where('dayNumber', '==', 1),
            limit(1)
          );
          drillSnapshot = await getDocs(day1Query);
        }
        
        if (!drillSnapshot.empty) {
          const drill = { id: drillSnapshot.docs[0].id, ...drillSnapshot.docs[0].data() } as DailyDrill;
          console.log("PaymentPage: Found Daily Drill as free sample", drill);
          setFreeSample(drill);
        } else {
          // Fallback to Paper 1 Question Paper
          console.log("PaymentPage: Day 1 Drill not found, falling back to Paper 1");
          const q = query(
            collection(db, 'questionPapers'),
            where('subject', '==', userSubject),
            where('paperType', '==', 'Paper 1'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const sample = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as QuestionPaper;
            console.log("PaymentPage: Found Paper 1 free sample", sample);
            setFreeSample(sample);
          } else {
            console.log(`PaymentPage: No free sample found for ${userSubject}`);
            setFreeSample(null);
          }
        }
      } catch (err) {
        console.error("Error fetching free sample:", err);
        setFreeSample(null);
      } finally {
        setLoadingSample(false);
      }
    };
    fetchFreeSample();
  }, [user?.subject]);

  const handleStartSample = () => {
    if (!freeSample) return;
    
    // Check if it's a Daily Drill or a Question Paper
    if ('dayNumber' in freeSample) {
      navigate(`/daily-drill?day=1`);
    } else {
      navigate(`/practice/${freeSample.id}`);
    }
  };

  const checkStatus = async (ref: string) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, userId: user?.uid })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Verification response not OK:", response.status, errorText);
        return false;
      }

      const data = await response.json();
      
      if (data.status === 'SUCCESSFUL') {
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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const requestRef = doc(collection(db, 'manualPaymentRequests'));
      await setDoc(requestRef, {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        amount: manualData.amount,
        method: manualData.method,
        reference: manualData.transactionId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        paymentStatus: 'pending'
      });

      setPaymentStep('success');
      setSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'manualPaymentRequests');
      setError('Failed to submit manual payment request.');
    } finally {
      setLoading(false);
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
          amount: paymentPrice,
          description: `${appName} - ${user.name}`,
          external_reference: `gb60_${user.uid}_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to initiate payment';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error JSON:", errorText);
          if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
            errorMessage = `Server error (HTML returned). Please contact ${contactEmail}.`;
          }
        }
        throw new Error(errorMessage);
      }

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

  const userSubject = user.subject || 'your subject';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl} 
            alt={`${appName} Logo`} 
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => auth.signOut()}>
            Log Out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12">
        {/* Welcome Header */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="primary">Unpaid Dashboard</Badge>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome, {user.name.split(' ')[0]}! 
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">
                Unlock full access to all Advanced Level <span className="text-indigo-600 font-black">{user.subject}</span> practice materials.
                Start your journey to an A grade — just {paymentPrice} FCFA to unlock everything.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-w-[240px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Access</span>
                <span className="text-xs font-black text-indigo-600">0/100%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-indigo-600 rounded-full transition-all duration-1000" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Payment Required</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Free Sample & Teasers */}
          <div className="lg:col-span-2 space-y-12">
            {/* Free Sample Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                  <Play size={18} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Free Sample</h2>
              </div>
              
              <Card className="p-8 border-emerald-100 bg-emerald-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <Badge variant="success">Free Access</Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                    <FileText size={40} />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {loadingSample ? 'Loading Sample...' : (freeSample ? (('day' in freeSample) ? `Daily Drill: Day ${freeSample.day}` : (freeSample as any).title) : 'No Free Samples Available')}
                      </h3>
                      <p className="text-slate-500 font-medium">
                        {freeSample 
                          ? (('day' in freeSample) ? `Try our Day 1 Daily Drill to see how ${appName} keeps you sharp every day.` : `Try a full Paper 1 MCQ quiz to see how ${appName} helps you improve.`)
                          : isAdmin 
                            ? `You haven't uploaded any samples for ${userSubject} yet. Go to the Admin dashboard to upload one.`
                            : `No free samples available yet. Check back soon.`}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <Button 
                        onClick={handleStartSample}
                        disabled={!freeSample || loadingSample}
                        className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-xl font-black uppercase tracking-widest transition-all"
                      >
                        {loadingSample ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <>Try Free Sample <Play className="ml-2" size={16} /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Locked Feature Teasers */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center">
                  <LockKeyhole size={18} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Locked Features</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: FileText, title: 'Full Quiz Library', desc: 'Access 50+ real exam papers and custom quizzes.' },
                  { icon: Target, title: 'Smart Insights', desc: 'Detailed analysis of your performance across all topics.' },
                  { icon: TrendingUp, title: 'Grade Prediction', desc: 'See your projected GCE grade based on current progress.' },
                  { icon: Zap, title: 'PDF Past Papers', desc: 'Download original exam PDFs for offline study.' },
                ].map((feature, i) => (
                  <div key={i} className="group relative p-6 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-100 transition-opacity">
                      <div className="flex flex-col items-center gap-2">
                        <Lock className="text-slate-400" size={24} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locked</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                        <feature.icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-900">{feature.title}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Payment Section */}
          <div className="space-y-8">
            <Card className="p-8 shadow-2xl border-indigo-100 relative overflow-hidden ring-4 ring-indigo-50">
              <div className="absolute top-0 right-0 p-4">
                <Zap className="text-indigo-600 animate-pulse" size={24} />
              </div>
              
              <AnimatePresence mode="wait">
                {(paymentStep === 'form' || paymentStep === 'manual') && (
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('form')}
                      className={cn(
                        "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        paymentStep === 'form' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Automatic
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStep('manual')}
                      className={cn(
                        "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        paymentStep === 'manual' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Manual
                    </button>
                  </div>
                )}

                {paymentStep === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Unlock Full Platform</h2>
                      <p className="text-sm text-slate-500 font-medium">
                        Get access to all Paper 1, 2, and 3 quizzes, real exam PDFs, smart insights, and grade predictions.
                      </p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
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
                              <span className="text-[10px] font-black uppercase tracking-widest">{net}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (MTN/Orange)</label>
                        <div className="relative">
                          <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input 
                            type="tel"
                            required
                            placeholder="e.g. 677 123 456"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\s/g, '') })}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium ml-1">Enter your 9-digit mobile money number.</p>
                      </div>

                      <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                        <span className="text-xl font-black text-white">{paymentPrice} FCFA</span>
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        Pay Now & Unlock <ArrowRight className="ml-2" />
                      </Button>
                      
                      {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                          <AlertCircle size={16} />
                          {error}
                        </div>
                      )}
                    </form>
                  </motion.div>
                )}

                {paymentStep === 'manual' && (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Payment</h2>
                      <p className="text-sm text-slate-500 font-medium">
                        Paid via Mobile Money or Bank Transfer? Enter your transaction details below for manual approval.
                      </p>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                        <select
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                          value={manualData.method}
                          onChange={e => setManualData({ ...manualData, method: e.target.value })}
                        >
                          <option value="MTN Mobile Money">MTN Mobile Money</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction ID / Reference</label>
                        <input 
                          type="text"
                          required
                          placeholder="Enter the transaction ID"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                          value={manualData.transactionId}
                          onChange={e => setManualData({ ...manualData, transactionId: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Paid (XAF)</label>
                        <input 
                          type="number"
                          required
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                          value={manualData.amount}
                          onChange={e => setManualData({ ...manualData, amount: parseInt(e.target.value) })}
                        />
                      </div>

                      <Button type="submit" className="w-full py-8 text-lg" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit for Approval'}
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
                    className="py-12 flex flex-col items-center text-center space-y-6"
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
                    className="py-8 flex flex-col items-center text-center space-y-8"
                  >
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                      <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payment Failed</h3>
                      <p className="text-sm text-slate-500 font-medium">{error || 'Something went wrong.'}</p>
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
                    className="py-8 flex flex-col items-center text-center space-y-8"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Success!</h3>
                      <p className="text-sm text-slate-500 font-medium">Your account is now unlocked.</p>
                    </div>
                    <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                      Go to Dashboard <ArrowRight className="ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* FAQ / Trust Panel */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">Common Questions</h3>
              <div className="space-y-3">
                {[
                  { q: 'Is payment safe?', a: 'Yes, we use secure MTN & Orange Money APIs.' },
                  { q: 'What do I get?', a: 'Full access to all quizzes, PDFs, and grade insights.' },
                  { q: 'Can I try before paying?', a: 'Yes, try the free sample quiz above!' },
                ].map((faq, i) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-900 mb-1">{faq.q}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img 
              src={logoUrl} 
              alt={`${appName} Logo`} 
              className="h-8 w-auto"
            />
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              © 2026 Vertexon Technologies. All rights reserved.
            </p>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">
              Powered by Vertexon Technologies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
