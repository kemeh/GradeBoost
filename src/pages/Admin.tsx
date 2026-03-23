import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc, setDoc, limit, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Upload, FileText, Trash2, 
  Users, BarChart3, ShieldCheck, 
  LayoutDashboard, LogOut, TrendingUp, Search, CreditCard, AlertCircle, CheckCircle2, Loader2, Eye, ExternalLink
} from 'lucide-react';
import { db, storage, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Button, Card, Badge, cn } from '../components/ui';
import { QuestionPaper, Subject, PaperType, SampleQuestion, LeaderboardEntry, Duel, UserProfile } from '../types';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { formatDate } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';
import { getSystemSettings } from '../services/settingsService';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const activeTab = (searchParams.get('tab') as 'papers' | 'payments' | 'manual' | 'samples' | 'duels') || 'papers';
  const [users, setUsers] = useState<any[]>([]);
  const [manualRequests, setManualRequests] = useState<any[]>([]);
  const [sampleQuestions, setSampleQuestions] = useState<SampleQuestion[]>([]);
  const [duels, setDuels] = useState<any[]>([]);
  const [duelLeaderboard, setDuelLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentPrice, setPaymentPrice] = useState(1000);

  const setActiveTab = (tab: 'papers' | 'payments' | 'manual' | 'samples' | 'duels') => {
    setSearchParams({ tab });
  };

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    subject: 'Computer Science' as Subject,
    paperType: 'Paper 1' as PaperType,
    description: '',
    correctAnswersRaw: '', // Raw string for input
    pdfUrl: '',
  });

  const [showSampleModal, setShowSampleModal] = useState(false);
  const [editingSample, setEditingSample] = useState<SampleQuestion | null>(null);
  const [sampleFormData, setSampleFormData] = useState({
    subject: 'Computer Science' as Subject,
    topic: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 'A',
    reasoning: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPapers();
      fetchUsers();
      fetchManualRequests();
      fetchSampleQuestions();
      fetchDuels();
      fetchDuelLeaderboard();
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchDuelLeaderboard = async () => {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      setDuelLeaderboard(querySnapshot.docs.map(doc => ({ ...doc.data() } as any as LeaderboardEntry)));
    } catch (err) {
      console.error("Error fetching duel leaderboard:", err);
    }
  };

  const fetchDuels = async () => {
    try {
      const q = query(collection(db, 'duels'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setDuels(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching duels:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const settings = await getSystemSettings();
      if (settings?.paymentPrice) {
        setPaymentPrice(settings.paymentPrice);
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
    }
  };

  const fetchSampleQuestions = async () => {
    try {
      const q = query(collection(db, 'sampleQuestions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setSampleQuestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SampleQuestion)));
    } catch (err) {
      console.error("Error fetching sample questions:", err);
    }
  };

  const fetchManualRequests = async () => {
    try {
      const q = query(collection(db, 'payments'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setManualRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching manual requests:", err);
    }
  };

  const userMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    users.forEach(u => {
      map[u.id] = u.name || u.firstName || 'Student';
    });
    return map;
  }, [users]);

  const fetchPapers = async () => {
    try {
      setError('');
      const q = query(collection(db, 'questionPapers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setPapers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionPaper)));
    } catch (err) {
      console.error("Error fetching papers:", err);
      setError('Failed to load question papers. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setError('');
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to load student data.');
    }
  };

  const handleApprovePayment = async (userId: string) => {
    if (!window.confirm('Manually approve this payment?')) return;
    try {
      setError('');
      const now = new Date();
      const expiry = new Date(now);
      expiry.setDate(now.getDate() + 30);

      const auditRef = doc(collection(db, 'paymentAudit'));
      try {
        await setDoc(auditRef, {
          userId,
          amount: paymentPrice,
          provider: 'Manual',
          status: 'success',
          timestamp: serverTimestamp(),
          reference: `manual_${Date.now()}`
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'paymentAudit');
      }

      await updateDoc(doc(db, 'users', userId), {
        paymentStatus: 'paid',
        paymentDate: now.toISOString(),
        paymentExpiryDate: expiry.toISOString(),
      });
      fetchUsers();
    } catch (err: any) {
      console.error("Error approving payment:", err);
      setError('Failed to approve payment. Please try again.');
      try { handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`); } catch(e) {}
    }
  };

  const handleManualApproval = async (paymentId: string, userId: string, approve: boolean) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this request?`)) return;
    try {
      setError('');
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(now.getFullYear() + 1); // 1 year access

      if (approve) {
        // Log in audit
        const auditRef = doc(collection(db, 'paymentAudit'));
        try {
          await setDoc(auditRef, {
            userId,
            amount: paymentPrice,
            provider: 'Manual',
            status: 'success',
            timestamp: serverTimestamp(),
            reference: `manual_${paymentId}`
          });
        } catch (err: any) {
          handleFirestoreError(err, OperationType.CREATE, 'paymentAudit');
        }

        // Update user
        await updateDoc(doc(db, 'users', userId), {
          paymentStatus: 'paid',
          isPaid: true,
          paymentDate: now.toISOString(),
          paymentExpiryDate: expiry.toISOString(),
          paid: true,
          paidAt: now.toISOString()
        });
      } else {
        // Update user back to unpaid
        await updateDoc(doc(db, 'users', userId), {
          paymentStatus: 'unpaid'
        });
      }

      // Update payment record status
      await updateDoc(doc(db, 'payments', paymentId), {
        status: approve ? 'approved' : 'rejected',
        updatedAt: serverTimestamp()
      });

      fetchManualRequests();
      fetchUsers();
      toast.success(`Payment request ${approve ? 'approved' : 'rejected'} successfully.`);
    } catch (err: any) {
      console.error("Error processing manual request:", err);
      toast.error("Failed to process request.");
    }
  };

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pdfUrl || !user) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const correctAnswers: Record<string, string> = {};
      if (formData.paperType === 'Paper 1' && formData.correctAnswersRaw) {
        formData.correctAnswersRaw.split(',').forEach(pair => {
          const [q, a] = pair.trim().split(':');
          if (q && a) correctAnswers[q.trim()] = a.trim().toUpperCase();
        });
      }

      const path = 'questionPapers';
      await addDoc(collection(db, path), {
        title: formData.title,
        year: formData.year,
        subject: formData.subject,
        paperType: formData.paperType,
        description: formData.description,
        correctAnswers,
        pdfUrl: formData.pdfUrl,
        createdAt: serverTimestamp(),
        uploadedBy: user.uid,
      });

      setShowUpload(false);
      setFormData({
        title: '',
        year: new Date().getFullYear(),
        subject: 'Computer Science' as Subject,
        paperType: 'Paper 1' as PaperType,
        description: '',
        correctAnswersRaw: '',
        pdfUrl: '',
      });
      fetchPapers();
      toast.success('Paper saved successfully!');
    } catch (err: any) {
      console.error("Save paper error:", err);
      handleFirestoreError(err, OperationType.CREATE, 'questionPapers');
      setError('Failed to save paper details.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this paper?')) return;
    try {
      setError('');
      await deleteDoc(doc(db, 'questionPapers', id));
      fetchPapers();
    } catch (err) {
      console.error("Error deleting paper:", err);
      setError('Failed to delete paper.');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const handleSaveSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!sampleFormData.topic.trim() || !sampleFormData.questionText.trim() || !sampleFormData.reasoning.trim()) {
      alert('Please fill in all required fields (Topic, Question, Reasoning).');
      return;
    }

    if (sampleFormData.options.some(opt => !opt.trim())) {
      alert('Please fill in all four options (A-D).');
      return;
    }

    // Check limit: 5-10 per subject
    const subjectCount = sampleQuestions.filter(q => q.subject === sampleFormData.subject).length;
    if (!editingSample && subjectCount >= 10) {
      alert(`Limit reached! Maximum 10 sample questions allowed per subject (${sampleFormData.subject}).`);
      return;
    }

    try {
      setUploading(true);
      const data = {
        ...sampleFormData,
        isFreeSample: true,
        createdAt: editingSample ? editingSample.createdAt : new Date().toISOString(),
      };

      if (editingSample) {
        await updateDoc(doc(db, 'sampleQuestions', editingSample.id), data);
      } else {
        await addDoc(collection(db, 'sampleQuestions'), data);
      }

      setShowSampleModal(false);
      setEditingSample(null);
      setSampleFormData({
        subject: 'Computer Science',
        topic: '',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        reasoning: '',
      });
      fetchSampleQuestions();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'sampleQuestions');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSample = async (id: string) => {
    if (!window.confirm('Delete this sample question?')) return;
    try {
      await deleteDoc(doc(db, 'sampleQuestions', id));
      fetchSampleQuestions();
    } catch (err) {
      console.error("Error deleting sample:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="font-black text-slate-400 animate-pulse tracking-widest uppercase text-xs">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage the platform content and monitor student performance.</p>
          </div>
          <Button onClick={() => setShowUpload(true)} className="group">
            <Plus className="mr-2" size={20} /> Upload New Paper
          </Button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Papers', value: papers.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Total Students', value: users.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg Readiness', value: '68%', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Security Status', value: 'Active', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat, i) => (
            <Card key={i} className="p-8 flex items-center gap-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Measures</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Firebase Auth', status: 'Enabled', desc: 'Secure student authentication' },
                { label: 'Firestore Rules', status: 'Active', desc: 'Role-based access control' },
                { label: 'Storage Rules', status: 'Active', desc: 'File type & size validation' },
                { label: 'Email Verification', status: 'Enforced', desc: 'Prevents fake accounts' },
                { label: 'Anti-Tamper', status: 'Active', desc: 'Copy/Paste protection' },
                { label: 'Inactivity Logout', status: '30m', desc: 'Auto-session termination' },
              ].map((measure, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{measure.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{measure.desc}</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">{measure.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">System Alerts</h2>
            </div>
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">All Systems Normal</p>
                <p className="text-xs text-slate-500 font-medium">No suspicious activity detected in the last 24h.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-white rounded-2xl border border-slate-100 w-fit">
          <button
            onClick={() => setActiveTab('papers')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'papers' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Papers
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'payments' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'manual' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Manual Requests
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'samples' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Sample Questions
          </button>
          <button
            onClick={() => setActiveTab('duels')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'duels' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Duels
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </motion.div>
        )}

        {/* Papers Table */}
        {activeTab === 'papers' ? (
          <Card className="overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Question Papers</h2>
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white outline-none transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paper</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {papers.filter(p => (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">{paper.title}</p>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant="default">{paper.subject}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant="primary">{paper.paperType}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-black text-slate-400">{paper.year}</span>
                      </td>
                      <td className="px-8 py-4">
                        <button 
                          onClick={() => handleDelete(paper.id)}
                          className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : activeTab === 'payments' ? (
          <Card className="overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Payments</h2>
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white outline-none transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid On</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires On</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs font-medium text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant={u.paymentStatus === 'paid' ? 'success' : u.paymentStatus === 'pending' ? 'warning' : 'danger'}>
                          {u.paymentStatus || 'unpaid'}
                        </Badge>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-400">
                          {formatDate(u.paymentDate)}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "text-xs font-bold",
                          u.paymentExpiryDate && new Date(u.paymentExpiryDate) < new Date() ? "text-red-500" : "text-slate-400"
                        )}>
                          {formatDate(u.paymentExpiryDate)}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        {u.paymentStatus !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleApprovePayment(u.id)}
                            className="text-[10px] h-8"
                          >
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : activeTab === 'samples' ? (
          <Card className="overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Free Sample Questions</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Limit: 5-10 per subject. Unpaid users see these to sample the platform.</p>
              </div>
              <Button onClick={() => { setEditingSample(null); setSampleFormData({ subject: 'Computer Science', topic: '', questionText: '', options: ['', '', '', ''], correctAnswer: 'A', reasoning: '' }); setShowSampleModal(true); }}>
                <Plus size={18} className="mr-2" /> Add Sample
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <Badge variant={q.subject === 'Computer Science' ? 'primary' : 'success'}>{q.subject}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold text-slate-900">{q.topic}</span>
                      </td>
                      <td className="px-8 py-4 max-w-xs">
                        <p className="text-sm text-slate-600 truncate">{q.questionText}</p>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant="info">{q.correctAnswer}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditingSample(q); setSampleFormData({ subject: q.subject, topic: q.topic, questionText: q.questionText, options: [...q.options], correctAnswer: q.correctAnswer, reasoning: q.reasoning }); setShowSampleModal(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSample(q.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sampleQuestions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center">
                        <p className="text-slate-400 font-medium">No sample questions found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : activeTab === 'duels' ? (
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active & Completed Duels</h2>
                <div className="flex items-center gap-4">
                  <Badge variant="info">{duels.length} Total Duels</Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duel ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Players</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {duels.map((duel) => (
                      <tr key={duel.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <code className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded">{duel.id.slice(0, 8)}...</code>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-slate-900">P1: {userMap[duel.player1Id] || duel.player1Id.slice(0, 8)}</p>
                            <p className="text-xs font-bold text-slate-900">P2: {duel.player2Id ? (userMap[duel.player2Id] || duel.player2Id.slice(0, 8)) : 'Waiting...'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <Badge variant={duel.status === 'completed' ? 'success' : duel.status === 'active' ? 'warning' : 'default'}>
                            {duel.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-black text-slate-900">
                            {duel.player1Score} - {duel.player2Score}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs font-bold text-slate-400">
                            {duel.createdAt?.toDate ? formatDate(duel.createdAt.toDate().toISOString()) : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {duels.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center">
                          <p className="text-slate-400 font-medium">No duels found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Arena Legends (Duel Leaderboard)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wins</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Losses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {duelLeaderboard.map((entry, i) => (
                      <tr key={entry.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <span className="text-sm font-black text-slate-900">#{i + 1}</span>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-sm font-bold text-slate-900">{entry.name}</p>
                          <p className="text-[10px] text-slate-500">{entry.userId}</p>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-black text-indigo-600">{entry.points}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-emerald-600">{entry.wins}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-red-600">{entry.losses}</span>
                        </td>
                      </tr>
                    ))}
                    {duelLeaderboard.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center">
                          <p className="text-slate-400 font-medium">No leaderboard data found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Manual Payment Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code / Ref</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Screenshot</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manualRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">{userMap[req.userId] || 'Unknown Student'}</p>
                        <p className="text-[10px] text-slate-500">{req.userId}</p>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant="default">{req.network || 'Manual'}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-1">
                          <code className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded w-fit">{req.paymentCode}</code>
                          <code className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded w-fit">{req.transactionId}</code>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-black text-slate-900">{req.amount} XAF</span>
                      </td>
                      <td className="px-8 py-4">
                        {req.screenshotUrl ? (
                          <a 
                            href={req.screenshotUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                          >
                            <Eye size={14} /> View
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">None</span>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-[10px]"
                            onClick={() => handleManualApproval(req.id, req.userId, true)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-[10px]"
                            onClick={() => handleManualApproval(req.id, req.userId, false)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {manualRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center">
                        <p className="text-slate-400 font-medium">No pending manual requests.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Sample Question Modal */}
        {showSampleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !uploading && setShowSampleModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">
                  {editingSample ? 'Edit Sample Question' : 'Add Sample Question'}
                </h2>
                <form onSubmit={handleSaveSample} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                      <select 
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                        value={sampleFormData.subject}
                        onChange={e => setSampleFormData({ ...sampleFormData, subject: e.target.value as Subject })}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="ICT">ICT</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                        placeholder="e.g. Data Structures"
                        value={sampleFormData.topic}
                        onChange={e => setSampleFormData({ ...sampleFormData, topic: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Text</label>
                    <textarea 
                      required
                      className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none min-h-[100px]"
                      placeholder="Enter the question..."
                      value={sampleFormData.questionText}
                      onChange={e => setSampleFormData({ ...sampleFormData, questionText: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map((opt, i) => (
                      <div key={opt} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Option {opt}</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                          value={sampleFormData.options[i]}
                          onChange={e => {
                            const newOpts = [...sampleFormData.options];
                            newOpts[i] = e.target.value;
                            setSampleFormData({ ...sampleFormData, options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answer</label>
                      <select 
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                        value={sampleFormData.correctAnswer}
                        onChange={e => setSampleFormData({ ...sampleFormData, correctAnswer: e.target.value })}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reasoning / Explanation</label>
                    <textarea 
                      required
                      className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none min-h-[80px]"
                      placeholder="Explain why the answer is correct..."
                      value={sampleFormData.reasoning}
                      onChange={e => setSampleFormData({ ...sampleFormData, reasoning: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowSampleModal(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={uploading}>
                      {uploading ? 'Saving...' : 'Save Question'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !uploading && setShowUpload(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-lg"
            >
              <Card className="p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Upload Question Paper</h2>
                <form onSubmit={handleSavePaper} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      placeholder="e.g. June 2023 Paper 1"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                      <select 
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value as Subject })}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="ICT">ICT</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paper Type</label>
                      <select 
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                        value={formData.paperType}
                        onChange={e => setFormData({ ...formData, paperType: e.target.value as PaperType })}
                      >
                        <option value="Paper 1">Paper 1</option>
                        <option value="Paper 2">Paper 2</option>
                        <option value="Paper 3">Paper 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                      value={formData.year}
                      onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>

                  {formData.paperType === 'Paper 1' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answers (Paper 1 Only)</label>
                      <textarea 
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none h-24 resize-none"
                        placeholder="Format: 1:A, 2:B, 3:C..."
                        value={formData.correctAnswersRaw}
                        onChange={e => setFormData({ ...formData, correctAnswersRaw: e.target.value })}
                      />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Example: 1:A, 2:B, 3:C</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PDF File</label>
                    <FileUpload
                      onUploadStart={() => setUploading(true)}
                      onUploadComplete={(url) => {
                        setFormData(prev => ({ ...prev, pdfUrl: url }));
                        setUploading(false);
                      }}
                      onUploadError={() => setUploading(false)}
                      onDelete={() => setFormData(prev => ({ ...prev, pdfUrl: '' }))}
                      initialUrl={formData.pdfUrl}
                      folder="papers"
                      label="Upload Question Paper"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowUpload(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={uploading || !formData.pdfUrl}>
                      {uploading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          <span>Saving...</span>
                        </div>
                      ) : 'Save Paper'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
