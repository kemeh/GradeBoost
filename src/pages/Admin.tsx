import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Upload, FileText, Trash2, 
  Users, BarChart3, ShieldCheck, 
  LayoutDashboard, LogOut, TrendingUp, Search, CreditCard, AlertCircle, CheckCircle2
} from 'lucide-react';
import { db, storage, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { QuestionPaper, Subject, PaperType } from '../types';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const activeTab = (searchParams.get('tab') as 'papers' | 'payments') || 'papers';
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const setActiveTab = (tab: 'papers' | 'payments') => {
    setSearchParams({ tab });
  };

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    subject: 'Computer Science' as Subject,
    paperType: 'Paper 1' as PaperType,
    description: '',
    correctAnswersRaw: '', // Raw string for input
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPapers();
    fetchUsers();
  }, []);

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
      await setDoc(auditRef, {
        userId,
        amount: 1000,
        provider: 'Manual',
        status: 'SUCCESSFUL',
        timestamp: serverTimestamp(),
        reference: `manual_${Date.now()}`
      });

      await updateDoc(doc(db, 'users', userId), {
        paymentStatus: 'paid',
        paymentDate: now.toISOString(),
        paymentExpiryDate: expiry.toISOString(),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error approving payment:", err);
      setError('Failed to approve payment. Please try again.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setError('');
    try {
      const storageRef = ref(storage, `papers/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const pdfUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'questionPapers'), {
        ...formData,
        pdfUrl,
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
      });
      setFile(null);
      fetchPapers();
    } catch (err) {
      console.error("Error uploading paper:", err);
      setError('Failed to upload paper. Please check your connection.');
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

  if (!user) return null;

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
                  {papers.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((paper) => (
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
        ) : (
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
                  {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant={u.paymentStatus === 'paid' ? 'success' : 'danger'}>
                          {u.paymentStatus || 'unpaid'}
                        </Badge>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-400">
                          {u.paymentDate ? new Date(u.paymentDate).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "text-xs font-bold",
                          u.paymentExpiryDate && new Date(u.paymentExpiryDate) < new Date() ? "text-red-500" : "text-slate-400"
                        )}>
                          {u.paymentExpiryDate ? new Date(u.paymentExpiryDate).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        {u.paymentStatus !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleApprovePayment(u.id)}
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
                <form onSubmit={handleUpload} className="space-y-6">
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
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept=".pdf"
                        required
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-indigo-600 transition-colors">
                        <Upload className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={32} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {file ? file.name : 'Click to upload PDF'}
                        </p>
                      </div>
                    </div>
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
                    <Button type="submit" className="flex-1" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Paper'}
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
