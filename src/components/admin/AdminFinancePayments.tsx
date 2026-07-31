import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, serverTimestamp, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, Button, Badge, cn } from '../ui';
import { 
  CreditCard, CheckCircle2, XCircle, Search, RefreshCw, Key, 
  ShieldCheck, DollarSign, TrendingUp, Users, Tag, AlertCircle, 
  Download, FileText, Settings, Smartphone, Check, HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';
import { getSystemSettings, updateSystemSettings } from '../../services/settingsService';
import { DEFAULT_PLANS, DEFAULT_PAYMENT_METHODS } from '../../services/paymentService';
import { PaymentReceiptModal } from '../PaymentReceiptModal';
import { PaymentReceipt } from '../../types';

export default function AdminFinancePayments() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'approvals' | 'coupons' | 'plans' | 'methods' | 'refunds'>('overview');
  const [manualRequests, setManualRequests] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [pricing, setPricing] = useState({ 
    paymentPrice: 1000, 
    annualPrice: 10000,
    momoNumber: '677 123 456', 
    omNumber: '699 123 456' 
  });

  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // Code Gen State
  const [generatedCode, setGeneratedCode] = useState('');

  // Coupon Creation Form
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 20,
    maxUses: 100,
    expiryDate: '2026-12-31'
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Manual Requests
      const reqSnap = await getDocs(query(collection(db, 'manual_approvals'), orderBy('createdAt', 'desc')));
      setManualRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Paid Users
      const uSnap = await getDocs(collection(db, 'users'));
      setUsersList(uSnap.docs.map(d => ({ uid: d.id, ...d.data() })));

      // Coupons
      const couponSnap = await getDocs(collection(db, 'coupons'));
      if (!couponSnap.empty) {
        setCoupons(couponSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setCoupons([
          { id: 'gb60bonus', code: 'GB60BONUS', discountType: 'percent', discountValue: 20, maxUses: 500, currentUses: 14, isEnabled: true, expiryDate: '2026-12-31' },
          { id: 'student50', code: 'STUDENT50', discountType: 'percent', discountValue: 50, maxUses: 100, currentUses: 42, isEnabled: true, expiryDate: '2026-12-31' }
        ]);
      }

      // Settings
      const sys = await getSystemSettings();
      if (sys) {
        setPricing({
          paymentPrice: sys.paymentPrice || 1000,
          annualPrice: (sys as any).annualPrice || 10000,
          momoNumber: sys.momoNumber || '677 123 456',
          omNumber: sys.omNumber || '699 123 456',
        });
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (req: any) => {
    try {
      // 1. Update request doc
      await updateDoc(doc(db, 'manual_approvals', req.id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });

      // 2. Grant user paid status
      if (req.userId) {
        const isAnnual = (req.planId || '').includes('annual');
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (isAnnual ? 365 : 30));

        await updateDoc(doc(db, 'users', req.userId), {
          isPaid: true,
          paymentStatus: 'paid',
          paidAt: new Date().toISOString(),
          paymentExpiryDate: expiry.toISOString(),
          paymentReference: req.transactionId || 'Manual Approval',
        });
      }

      toast.success(`Payment approved for ${req.userEmail || 'user'}`);
      fetchFinanceData();
    } catch (err) {
      toast.error('Failed to approve payment request');
    }
  };

  const handleRejectRequest = async (req: any) => {
    try {
      await updateDoc(doc(db, 'manual_approvals', req.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      });
      toast.success('Payment request rejected');
      fetchFinanceData();
    } catch (err) {
      toast.error('Failed to reject payment request');
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemSettings({
        paymentPrice: Number(pricing.paymentPrice),
        momoNumber: pricing.momoNumber,
        omNumber: pricing.omNumber,
      });
      toast.success('Subscription pricing and Mobile Money accounts updated!');
    } catch (err) {
      toast.error('Failed to update pricing settings');
    }
  };

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m));
    toast.success('Payment method status updated!');
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    const cleanCode = newCoupon.code.trim().toUpperCase();

    try {
      const couponObj = {
        code: cleanCode,
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        maxUses: Number(newCoupon.maxUses),
        currentUses: 0,
        expiryDate: newCoupon.expiryDate,
        isEnabled: true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'coupons'), couponObj);
      toast.success(`Coupon code ${cleanCode} created successfully!`);
      setNewCoupon({ code: '', discountType: 'percent', discountValue: 20, maxUses: 100, expiryDate: '2026-12-31' });
      fetchFinanceData();
    } catch (err) {
      toast.error('Failed to create coupon code');
    }
  };

  const handleGenerateActivationCode = () => {
    const code = 'GB60-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    toast.success(`Generated VIP Access Voucher Code: ${code}`);
  };

  // Financial Metrics Calculations
  const approvedRequests = manualRequests.filter(r => r.status === 'approved');
  const paidUsersCount = usersList.filter(u => u.isPaid || u.paymentStatus === 'paid').length;
  const totalRevenueXAF = approvedRequests.reduce((sum, r) => sum + (r.amount || 1000), 0) + (paidUsersCount * 1000);

  const viewReceiptForRequest = (req: any) => {
    const receipt: PaymentReceipt = {
      receiptNumber: req.receiptNumber || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      transactionId: req.transactionId || 'TX-VERIFIED',
      studentName: req.userName || req.userEmail?.split('@')[0] || 'Student',
      studentEmail: req.userEmail || 'student@gradeboost.com',
      planName: req.planName || 'Premium Monthly Plan',
      amountPaid: req.amount || 1000,
      currency: 'XAF',
      paymentMethod: req.method || req.paymentMethod || 'MTN MoMo',
      date: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      expiryDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString(),
      companyName: 'GradeBoost 60',
      companyContact: 'support@gradeboost.com'
    };
    setSelectedReceipt(receipt);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial & Subscription Control Center</h2>
          <p className="text-sm font-medium text-slate-500">
            Real-time revenue metrics, Mobile Money approvals, discount coupons, and payment gateway controls.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${activeSubTab === 'overview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${activeSubTab === 'approvals' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
          >
            Approvals <Badge variant="warning" className="text-[10px] px-1.5 py-0">{manualRequests.filter(r => r.status === 'pending').length}</Badge>
          </button>
          <button
            onClick={() => setActiveSubTab('coupons')}
            className={`px-3 py-1.5 rounded-xl transition-all ${activeSubTab === 'coupons' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
          >
            Promo Coupons
          </button>
          <button
            onClick={() => setActiveSubTab('methods')}
            className={`px-3 py-1.5 rounded-xl transition-all ${activeSubTab === 'methods' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
          >
            Gateways & Methods
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Estimated Revenue</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalRevenueXAF.toLocaleString()} XAF</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <TrendingUp size={12} /> +18.4% this month
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Subscribers</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{paidUsersCount} Students</span>
            <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-0.5">
              <Users size={12} /> Premium Accounts
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={24} />
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Verification</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{manualRequests.filter(r => r.status === 'pending').length} Requests</span>
            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
              <RefreshCw size={12} /> Mobile Money Verification
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Smartphone size={24} />
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-500 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Coupons</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{coupons.filter(c => c.isEnabled).length} Codes</span>
            <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1 mt-0.5">
              <Tag size={12} /> Promo Campaigns
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Tag size={24} />
          </div>
        </Card>
      </div>

      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Config */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <DollarSign size={20} />
              <h3 className="text-base font-black text-slate-900">Subscription Plans & Mobile Money Accounts</h3>
            </div>
            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Monthly Price (XAF)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={pricing.paymentPrice}
                    onChange={e => setPricing({...pricing, paymentPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Annual Price (XAF)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={pricing.annualPrice}
                    onChange={e => setPricing({...pricing, annualPrice: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">MTN MoMo Number</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={pricing.momoNumber}
                    onChange={e => setPricing({...pricing, momoNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Orange Money Number</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={pricing.omNumber}
                    onChange={e => setPricing({...pricing, omNumber: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Financial Settings</Button>
            </form>
          </Card>

          {/* Access Voucher Code Generator */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Key size={20} />
              <h3 className="text-base font-black text-slate-900">VIP Voucher & Access Code Generator</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Generate instant bypass voucher codes for scholarship students or physical cash payments.
            </p>
            <Button onClick={handleGenerateActivationCode} variant="outline" className="w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Generate VIP Voucher Code
            </Button>
            {generatedCode && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active Voucher Code</span>
                <p className="text-2xl font-black font-mono text-emerald-900 select-all">{generatedCode}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeSubTab === 'approvals' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Manual Payment Verification Queue</h3>
              <p className="text-xs font-medium text-slate-500">Student Mobile Money transaction proofs requiring admin verification</p>
            </div>
            <Badge variant="warning">{manualRequests.filter(r => r.status === 'pending').length} Pending</Badge>
          </div>

          {manualRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">No manual payment requests submitted.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <th className="p-4 pl-6">Student Email</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Transaction Ref ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {manualRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-bold text-slate-900">{req.userEmail || req.email}</td>
                      <td className="p-4 font-bold text-indigo-600 uppercase">{req.paymentMethod || req.method || 'MoMo'}</td>
                      <td className="p-4 font-mono font-black text-slate-700">{req.transactionId || 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-900">{(req.amount || 1000).toLocaleString()} XAF</td>
                      <td className="p-4">
                        <Badge 
                          variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}
                          className="rounded-xl"
                        >
                          {req.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        {req.status === 'approved' && (
                          <button
                            onClick={() => viewReceiptForRequest(req)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 inline-flex items-center gap-1"
                          >
                            <FileText size={12} /> Receipt
                          </button>
                        )}
                        {req.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproveRequest(req)}
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-xl"
                            >
                              <CheckCircle2 size={14} className="mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRejectRequest(req)}
                              className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                            >
                              <XCircle size={14} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeSubTab === 'coupons' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-indigo-600" /> Create New Promotional Coupon / Discount Code
            </h3>
            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. BACK2SCHOOL"
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Discount Type</label>
                <select
                  value={newCoupon.discountType}
                  onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (XAF)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Discount Value</label>
                <input
                  type="number"
                  required
                  value={newCoupon.discountValue}
                  onChange={e => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Max Usage Limit</label>
                <input
                  type="number"
                  required
                  value={newCoupon.maxUses}
                  onChange={e => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full rounded-xl">Create Coupon</Button>
              </div>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Active Promo Codes & Scholarships</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <th className="p-4 pl-6">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Usage Count</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td className="p-4 pl-6 font-mono font-black text-indigo-700">{c.code}</td>
                      <td className="p-4 font-bold text-slate-900">
                        {c.discountType === 'percent' ? `${c.discountValue}% Off` : `${c.discountValue} XAF Off`}
                      </td>
                      <td className="p-4 text-slate-600">{c.currentUses || 0} / {c.maxUses} used</td>
                      <td className="p-4 text-slate-500">{c.expiryDate}</td>
                      <td className="p-4">
                        <Badge variant={c.isEnabled ? 'success' : 'neutral'}>
                          {c.isEnabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'methods' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings size={20} className="text-indigo-600" /> Payment Gateways & Methods Management
          </h3>
          <p className="text-xs text-slate-500">
            Enable or disable checkout methods for students in both English & French regions.
          </p>

          <div className="space-y-3 pt-2">
            {paymentMethods.map(method => (
              <div key={method.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{method.name}</h4>
                  <p className="text-xs text-slate-500">{method.instructions}</p>
                </div>
                <button
                  onClick={() => handleTogglePaymentMethod(method.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    method.isEnabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {method.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Render Receipt Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
