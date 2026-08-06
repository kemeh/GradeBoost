import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Smartphone, ShieldCheck, 
  TrendingUp, CheckCircle2, AlertCircle,
  ArrowRight, Lock, Zap, FileText, Target,
  Play, HelpCircle, ChevronRight, LockKeyhole,
  LogOut, LayoutDashboard, Tag, Sparkles, Download, 
  Clock, Check, RefreshCw
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, collection, query, where, limit, getDocs, orderBy, addDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { auth, db, storage } from '../firebase';
import { Button, Card, Badge, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { QuestionPaper, DailyDrill, SubscriptionPlan, PaymentReceipt } from '../types';
import { getSystemSettings } from '../services/settingsService';
import { 
  DEFAULT_PLANS, DEFAULT_PAYMENT_METHODS, 
  validateCouponCode, createPaymentCheckout, 
  generateReceiptData 
} from '../services/paymentService';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

export default function PaymentPage() {
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const { appName, logoUrl, contactEmail, momoNumber, momoName, omNumber, omName } = useSettings();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState<'plans' | 'checkout' | 'pending' | 'success' | 'failed' | 'rejected'>('plans');

  // Subscription Plans & Methods
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(DEFAULT_PLANS[1]); // Premium Monthly
  const [selectedMethod, setSelectedMethod] = useState<string>('mtn_momo');

  // Checkout Data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // Free Sample State
  const [freeSample, setFreeSample] = useState<QuestionPaper | DailyDrill | null>(null);
  const [loadingSample, setLoadingSample] = useState(true);

  useEffect(() => {
    // Real-time settings sync for pricing
    const docRef = doc(db, 'system_settings', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data();
        if (settings?.paymentPrice) {
          setPlans(prev => prev.map(p => {
            if (p.id === 'premium_monthly') return { ...p, price: settings.paymentPrice };
            return p;
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.paymentStatus === 'pending') {
        setPaymentStep('pending');
      } else if (user.paymentStatus === 'rejected') {
        setPaymentStep('rejected');
      } else if (user.paymentStatus === 'paid' && !isAdmin) {
        const hasExpired = user.paymentExpiryDate && new Date(user.paymentExpiryDate) < new Date();
        if (!hasExpired) {
          setPaymentStep('success');
        }
      }
    }
  }, [user, isAdmin]);

  // Fetch Free Sample for Trial
  useEffect(() => {
    const fetchFreeSample = async () => {
      if (!user || !user.subject) return;
      setLoadingSample(true);
      try {
        const drillQuery = query(
          collection(db, 'dailyDrills'),
          where('subject', '==', user.subject),
          where('isFreeSample', '==', true),
          limit(1)
        );
        let drillSnapshot = await getDocs(drillQuery);
        if (drillSnapshot.empty) {
          const day1Query = query(
            collection(db, 'dailyDrills'),
            where('subject', '==', user.subject),
            where('dayNumber', '==', 1),
            limit(1)
          );
          drillSnapshot = await getDocs(day1Query);
        }

        if (!drillSnapshot.empty) {
          setFreeSample({ id: drillSnapshot.docs[0].id, ...drillSnapshot.docs[0].data() } as DailyDrill);
        } else {
          const q = query(
            collection(db, 'questionPapers'),
            where('subject', '==', user.subject),
            where('paperType', '==', 'Paper 1'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setFreeSample({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as QuestionPaper);
          }
        }
      } catch (err) {
        console.error("Error fetching sample:", err);
      } finally {
        setLoadingSample(false);
      }
    };
    fetchFreeSample();
  }, [user?.subject]);

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setLoading(true);
    const res = await validateCouponCode(couponInput, selectedPlan.id);
    setLoading(false);
    if (res.valid) {
      setDiscountPercent(res.discountAmount);
      setCouponMessage(res.message);
      setCouponApplied(true);
      toast.success(res.message);
    } else {
      setCouponMessage(res.message);
      setCouponApplied(false);
      toast.error(res.message);
    }
  };

  const calculateFinalPrice = () => {
    if (!couponApplied) return selectedPlan.price;
    return Math.max(0, Math.round(selectedPlan.price * (1 - discountPercent / 100)));
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      toast.success(language === 'fr' ? 'Plan gratuit sélectionné' : 'Free plan active');
      navigate('/dashboard');
      return;
    }
    setSelectedPlan(plan);
    setPaymentStep('checkout');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!transactionIdInput || transactionIdInput.trim().length < 4) {
      toast.error(language === 'fr' ? 'Veuillez saisir l\'ID de transaction valide' : 'Please enter a valid transaction ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentObj = await createPaymentCheckout({
        userId: user.uid,
        userName: user.name || 'Student',
        userEmail: user.email,
        plan: { ...selectedPlan, price: calculateFinalPrice() },
        paymentMethod: selectedMethod,
        phoneNumber,
        couponCode: couponApplied ? couponInput : undefined,
        manualTransactionId: transactionIdInput.trim()
      });

      setPaymentStep('pending');
      toast.success(language === 'fr' ? 'Paiement soumis pour vérification !' : 'Payment submitted for verification!');
    } catch (err) {
      console.error(err);
      setError('Failed to process payment request.');
      toast.error('Payment submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = () => {
    if (!user) return;
    const dummyReceipt: PaymentReceipt = {
      receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      transactionId: user.paymentReference || 'TX-VERIFIED',
      studentName: user.name,
      studentEmail: user.email,
      planName: selectedPlan.name,
      amountPaid: selectedPlan.price,
      currency: 'XAF',
      paymentMethod: selectedMethod.toUpperCase(),
      date: new Date().toLocaleDateString(),
      expiryDate: user.paymentExpiryDate ? new Date(user.paymentExpiryDate).toLocaleDateString() : new Date(Date.now() + 30 * 86400000).toLocaleDateString(),
      companyName: appName,
      companyContact: contactEmail
    };
    setActiveReceipt(dummyReceipt);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logoUrl} alt={`${appName} Logo`} className="h-9 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="compact" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="rounded-xl border-slate-200"
          >
            <LayoutDashboard size={18} className="mr-1" /> Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => auth.signOut()} className="rounded-xl">
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-10">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-2xl">
            <Badge className="bg-amber-400 text-amber-950 font-black px-3 py-1">
              <Sparkles size={14} className="mr-1 inline" /> Edulpha Premium Access
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              {language === 'fr' ? 'Abonnez-vous & Réussissez vos Examens' : 'Choose Your Plan & Pass Your Exams'}
            </h1>
            <p className="text-sm md:text-base text-indigo-200 font-medium">
              {language === 'fr' 
                ? 'Accédez aux leçons illimitées, corrigés d\'examens blancs et le tuteur IA Edulpha 24/7.' 
                : 'Unlock unlimited lessons, mock exam solutions, and 24/7 Edulpha AI tutor.'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 z-10 shrink-0">
            {user.paymentStatus === 'paid' && (
              <button
                onClick={handleViewReceipt}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Download size={16} /> Download Official Receipt
              </button>
            )}
          </div>
        </div>

        {/* Plan Comparison Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900">
              {language === 'fr' ? 'Formules d\'Abonnement Adaptées' : 'Transparent Subscription Plans'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'fr' ? 'Aucun engagement. Modifiez ou annulez à tout moment.' : 'No hidden fees. Upgrade or cancel anytime.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isPopular = plan.id === 'premium_monthly';
              const isAnnual = plan.id === 'premium_annual';

              return (
                <Card 
                  key={plan.id}
                  className={cn(
                    "p-8 rounded-3xl relative flex flex-col justify-between transition-all duration-300",
                    isPopular ? "border-2 border-indigo-600 shadow-xl bg-white scale-[1.02]" : "border border-slate-200 bg-white"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                      Most Popular Plan
                    </div>
                  )}

                  {isAnnual && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                      Best Value (2 Months Free)
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{language === 'fr' ? plan.nameFr || plan.name : plan.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 min-h-[36px]">
                        {language === 'fr' ? plan.descriptionFr || plan.description : plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">{plan.price.toLocaleString()}</span>
                      <span className="text-sm font-bold text-slate-500">{plan.currency} / {plan.billingCycle}</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Included Features</span>
                      <ul className="space-y-2 text-xs font-semibold text-slate-700">
                        {(language === 'fr' ? plan.featuresFr || plan.features : plan.features).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      variant={isPopular ? 'primary' : 'outline'}
                      className="w-full rounded-2xl py-3 text-xs font-bold"
                    >
                      {plan.price === 0 ? 'Current Free Plan' : (language === 'fr' ? 'Choisir ce Pass' : 'Select Plan')} <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Checkout & Payment Section */}
        {paymentStep === 'checkout' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {language === 'fr' ? 'Paiement Sécurisé' : 'Checkout & Payment'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Selected: {selectedPlan.name}</p>
              </div>
              <Badge variant="primary" className="text-xs px-3 py-1">
                {calculateFinalPrice().toLocaleString()} XAF
              </Badge>
            </div>

            {/* Payment Provider Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('mtn_momo')}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all flex items-center justify-between",
                    selectedMethod === 'mtn_momo' ? "border-amber-400 bg-amber-50/50 shadow-xs" : "border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs">MTN</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">MTN Mobile Money</div>
                      <div className="text-[10px] text-slate-500">*126# Transfer</div>
                    </div>
                  </div>
                  {selectedMethod === 'mtn_momo' && <CheckCircle2 size={18} className="text-amber-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('orange_money')}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all flex items-center justify-between",
                    selectedMethod === 'orange_money' ? "border-orange-500 bg-orange-50/50 shadow-xs" : "border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs">OM</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Orange Money</div>
                      <div className="text-[10px] text-slate-500">#150# Transfer</div>
                    </div>
                  </div>
                  {selectedMethod === 'orange_money' && <CheckCircle2 size={18} className="text-orange-600" />}
                </button>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">Official Payment Destination</span>
              <div className="flex justify-between items-center text-slate-700">
                <span>Account Number:</span>
                <span className="font-mono font-black text-indigo-700 text-sm">{selectedMethod === 'mtn_momo' ? momoNumber : omNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Account Name:</span>
                <span className="font-bold text-slate-900">{selectedMethod === 'mtn_momo' ? momoName : omName}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Promotional / Scholarship Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. EDULPHABONUS"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase outline-none"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon} className="rounded-xl">
                  Apply Code
                </Button>
              </div>
              {couponMessage && (
                <p className={cn("text-[11px] font-bold", couponApplied ? "text-emerald-600" : "text-red-500")}>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700">Your Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 677123456"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold mt-1 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Transaction ID / Reference Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 293849182"
                  value={transactionIdInput}
                  onChange={e => setTransactionIdInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold mt-1 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Total Due</span>
                  <span className="text-2xl font-black text-indigo-900">{calculateFinalPrice().toLocaleString()} XAF</span>
                </div>
                <Button type="submit" disabled={loading} className="rounded-2xl px-6 py-3 text-xs font-bold">
                  {loading ? 'Submitting...' : 'Confirm & Complete Payment'}
                </Button>
              </div>
            </form>
          </motion.section>
        )}

        {/* Verification Pending Screen */}
        {paymentStep === 'pending' && (
          <Card className="max-w-xl mx-auto p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Clock size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Payment Pending Verification</h3>
              <p className="text-xs text-slate-500 font-medium">
                Your payment reference has been recorded. Our automated system and admin team are verifying your transaction. Access will update automatically.
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="rounded-2xl w-full">
              Go to Dashboard
            </Button>
          </Card>
        )}
      </main>

      {/* Render Receipt Modal */}
      {activeReceipt && (
        <PaymentReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
