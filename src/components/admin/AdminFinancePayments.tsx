import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, Button, Badge, cn } from '../ui';
import { CreditCard, CheckCircle2, XCircle, Search, RefreshCw, Key, ShieldCheck, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';
import { getSystemSettings, updateSystemSettings } from '../../services/settingsService';

export default function AdminFinancePayments() {
  const [manualRequests, setManualRequests] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState({ paymentPrice: 1000, momoNumber: '677 123 456', omNumber: '699 123 456' });

  // Code Gen State
  const [generatedCode, setGeneratedCode] = useState('');

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

      // Settings
      const sys = await getSystemSettings();
      if (sys) {
        setPricing({
          paymentPrice: sys.paymentPrice || 1000,
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
        await updateDoc(doc(db, 'users', req.userId), {
          isPaid: true,
          paymentStatus: 'paid',
          paidAt: new Date().toISOString(),
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
      toast.success('Payment configuration updated!');
    } catch (err) {
      toast.error('Failed to update pricing settings');
    }
  };

  const handleGenerateActivationCode = () => {
    const code = 'GB60-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    toast.success(`Generated VIP Access Code: ${code}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Finance, Subscriptions & Approvals</h2>
          <p className="text-sm font-medium text-slate-500">
            Manage MTN Mobile Money & Orange Money transaction verification, subscription pricing, and access code generation.
          </p>
        </div>
      </div>

      {/* Top Pricing Config & VIP Access Code Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <DollarSign size={20} />
            <h3 className="text-base font-black text-slate-900">Subscription Pricing & Accounts</h3>
          </div>
          <form onSubmit={handleSavePricing} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Subscription Price (XAF)</label>
              <input 
                type="number" 
                required
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                value={pricing.paymentPrice}
                onChange={e => setPricing({...pricing, paymentPrice: Number(e.target.value)})}
              />
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

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Key size={20} />
            <h3 className="text-base font-black text-slate-900">VIP Access Code Generator</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Generate one-time bypass voucher codes for sponsored students or manual cash payments.
          </p>
          <Button onClick={handleGenerateActivationCode} variant="outline" className="w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            Generate VIP Activation Code
          </Button>
          {generatedCode && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active Voucher Code</span>
              <p className="text-2xl font-black font-mono text-emerald-900 select-all">{generatedCode}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Manual Approvals Queue */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Manual Payment Verification Queue</h3>
            <p className="text-xs font-medium text-slate-500">Student Mobile Money transaction proofs requiring admin approval</p>
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
                  <th className="p-4">Transaction Reference ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-bold text-slate-900 text-sm">{req.userEmail || req.email}</td>
                    <td className="p-4 text-xs font-bold text-indigo-600 uppercase">{req.paymentMethod || 'MoMo'}</td>
                    <td className="p-4 font-mono font-black text-slate-700 text-xs">{req.transactionId || 'N/A'}</td>
                    <td className="p-4 text-xs text-slate-400 font-medium">
                      {req.createdAt ? formatDate(req.createdAt) : 'Recently'}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}
                        className="rounded-xl"
                      >
                        {req.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
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
    </div>
  );
}
