import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, CheckCircle2, Clock, 
  FileText, HelpCircle, ChevronRight, 
  Search, AlertCircle, Save, X, Edit3,
  Check, MessageSquare, User, Calendar
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { DailyDrill, DailyDrillQuestion, Subject, Grade } from '../types';
import { useNavigate } from 'react-router-dom';
import { getCurrentDayNumber, getDaysRemaining } from '../utils/challenge';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { formatDate } from '../utils/dateUtils';

export default function AdminDailyDrill() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [drills, setDrills] = useState<DailyDrill[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'drills' | 'grading'>('drills');
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    day: '',
    subject: '',
    paperType: '',
    status: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    dayNumber: 1,
    subject: 'Computer Science' as Subject,
    topic: '',
    paperType: 'Paper 1' as 'Paper 1' | 'Paper 2' | 'Paper 3',
    isFreeSample: false,
  });
  const [questions, setQuestions] = useState<Partial<DailyDrillQuestion>[]>([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 'A', reasoning: '', isFreeSample: false }
  ]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDrills();
      fetchSubmissions();
    }
  }, [isAdmin]);

  useEffect(() => {
    let filtered = [...submissions];
    if (filters.day) filtered = filtered.filter(s => s.dayNumber === parseInt(filters.day));
    if (filters.subject) filtered = filtered.filter(s => s.subject === filters.subject);
    if (filters.paperType) filtered = filtered.filter(s => s.paperType === filters.paperType);
    if (filters.status) {
      const isGraded = filters.status === 'Graded';
      filtered = filtered.filter(s => s.gradedStatus === isGraded);
    }
    setFilteredSubmissions(filtered);
  }, [filters, submissions]);

  const fetchDrills = async () => {
    try {
      const q = query(collection(db, 'dailyDrills'), orderBy('dayNumber', 'asc'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setDrills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyDrill)));
    } catch (err) {
      console.error("Error fetching drills:", err);
      setError('Failed to load daily drills.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'dailyDrillSubmissions'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(subs);
      setFilteredSubmissions(subs);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleAddQuestion = () => {
    if (formData.paperType === 'Paper 1') {
      setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 'A', reasoning: '', isFreeSample: false }]);
    } else {
      setQuestions([...questions, { questionText: '', reasoning: '', isFreeSample: false }]);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...(newQuestions[qIndex].options || [])];
    newOptions[oIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  const handleSubmitDrill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    try {
      // Check for duplicates
      const q = query(
        collection(db, 'dailyDrills'),
        where('dayNumber', '==', formData.dayNumber),
        where('subject', '==', formData.subject),
        where('paperType', '==', formData.paperType),
        where('topic', '==', formData.topic)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error('A drill for this day, subject, paper type, and topic already exists.');
      }

      await addDoc(collection(db, 'dailyDrills'), {
        ...formData,
        questions: questions.map((q, i) => ({ ...q, id: `q${i + 1}` })),
        createdAt: serverTimestamp(),
        uploadedBy: user.uid,
        gradedStatus: false,
      });

      setSuccess('Daily Drill added successfully!');
      setShowAddModal(false);
      setFormData({ dayNumber: 1, subject: 'Computer Science', topic: '', paperType: 'Paper 1', isFreeSample: false });
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 'A', reasoning: '', isFreeSample: false }]);
      fetchDrills();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'dailyDrills');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrill = async (id: string) => {
    if (!window.confirm('Delete this drill?')) return;
    try {
      await deleteDoc(doc(db, 'dailyDrills', id));
      fetchDrills();
    } catch (err) {
      setError('Failed to delete drill.');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'dailyDrillSubmissions', gradingSubmission.id), {
        grade: gradingSubmission.tempGrade,
        feedback: gradingSubmission.tempFeedback,
        score: gradingSubmission.tempScore || 0,
        gradedStatus: true,
      });
      setGradingSubmission(null);
      fetchSubmissions();
      setSuccess('Submission graded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to grade submission.');
    } finally {
      setLoading(false);
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

      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Daily Drill Manager</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-500 font-medium">Manage the 60-day challenge content and grade submissions.</p>
              <Badge variant="primary" className="bg-indigo-600">Day {getCurrentDayNumber()} / 60</Badge>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getDaysRemaining()} Days Left</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button 
              variant={activeTab === 'drills' ? 'primary' : 'outline'} 
              onClick={() => setActiveTab('drills')}
            >
              Questions
            </Button>
            <Button 
              variant={activeTab === 'grading' ? 'primary' : 'outline'} 
              onClick={() => setActiveTab('grading')}
            >
              Grading
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="group">
              <Plus className="mr-2" size={20} /> Add Daily Drill
            </Button>
          </div>
        </header>

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600"
          >
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold">{success}</p>
          </motion.div>
        )}

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

        {activeTab === 'grading' && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day</label>
              <input 
                type="number" 
                placeholder="All Days" 
                className="w-full px-4 py-2 rounded-xl border border-slate-100 outline-none font-bold text-sm bg-white"
                value={filters.day}
                onChange={e => setFilters({ ...filters, day: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-100 outline-none font-bold text-sm bg-white"
                value={filters.subject}
                onChange={e => setFilters({ ...filters, subject: e.target.value })}
              >
                <option value="">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="ICT">ICT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paper</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-100 outline-none font-bold text-sm bg-white"
                value={filters.paperType}
                onChange={e => setFilters({ ...filters, paperType: e.target.value })}
              >
                <option value="">All Papers</option>
                <option value="Paper 1">Paper 1</option>
                <option value="Paper 2">Paper 2</option>
                <option value="Paper 3">Paper 3</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-100 outline-none font-bold text-sm bg-white"
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Graded">Graded</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'drills' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {drills.map((drill) => (
              <Card key={drill.id} className="p-6 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="primary">Day {drill.dayNumber}</Badge>
                  <button 
                    onClick={() => handleDeleteDrill(drill.id)}
                    className="p-2 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{drill.topic}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-[10px]">{drill.subject}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{drill.paperType}</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <HelpCircle size={14} />
                    {drill.questions.length} Questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(drill.createdAt)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Drill</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-[10px]">
                            {sub.userId.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-bold text-slate-900">Student {sub.userId.substring(0, 5)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">Day {sub.dayNumber}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">{sub.subject}</p>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant="secondary">{sub.paperType}</Badge>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant={sub.gradedStatus ? 'success' : 'warning'}>
                          {sub.gradedStatus ? 'Graded' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-8 py-4">
                        {sub.grade ? (
                          <span className="text-lg font-black text-indigo-600">{sub.grade}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setGradingSubmission({
                            ...sub,
                            tempGrade: sub.grade || 'A',
                            tempFeedback: sub.feedback || '',
                            tempScore: sub.score || 0
                          })}
                        >
                          {sub.gradedStatus ? 'Edit Grade' : 'Grade'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Add Drill Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <Card className="p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Daily Drill</h2>
                    <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitDrill} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day (1-60)</label>
                        <input 
                          type="number" 
                          min="1" max="60"
                          required
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                          value={formData.dayNumber}
                          onChange={e => setFormData({ ...formData, dayNumber: parseInt(e.target.value) })}
                        />
                      </div>
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
                          onChange={e => {
                            const newType = e.target.value as 'Paper 1' | 'Paper 2' | 'Paper 3';
                            setFormData({ ...formData, paperType: newType });
                            // Reset questions structure based on type
                            if (newType === 'Paper 1') {
                              setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 'A', reasoning: '' }]);
                            } else {
                              setQuestions([{ questionText: '', reasoning: '' }]);
                            }
                          }}
                        >
                          <option value="Paper 1">Paper 1 (MCQs)</option>
                          <option value="Paper 2">Paper 2 (Structured)</option>
                          <option value="Paper 3">Paper 3 (Practical)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                          placeholder="e.g. Data Structures"
                          value={formData.topic}
                          onChange={e => setFormData({ ...formData, topic: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-8">
                        <input 
                          type="checkbox"
                          id="isFreeSample"
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={formData.isFreeSample}
                          onChange={e => setFormData({ ...formData, isFreeSample: e.target.checked })}
                        />
                        <label htmlFor="isFreeSample" className="text-sm font-bold text-slate-700">Mark as Free Sample</label>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-900">Questions</h3>
                        <Button type="button" size="sm" variant="outline" onClick={handleAddQuestion}>
                          <Plus size={16} className="mr-2" /> Add Question
                        </Button>
                      </div>

                      {questions.map((q, qIndex) => (
                        <Card key={qIndex} className="p-6 bg-slate-50/50 border-slate-100 relative">
                          <button 
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question {qIndex + 1}</label>
                              <textarea 
                                required
                                className="w-full px-6 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none h-24 resize-none"
                                value={q.questionText}
                                onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                              />
                            </div>

                            {formData.paperType === 'Paper 1' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['A', 'B', 'C', 'D'].map((opt, oIndex) => (
                                  <div key={opt} className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">{opt}</span>
                                    <input 
                                      type="text" 
                                      required
                                      className="flex-1 px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-slate-900 outline-none text-sm"
                                      value={q.options?.[oIndex] || ''}
                                      onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    />
                                  </div>
                                ))}
                                <div className="md:col-span-2 space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answer</label>
                                  <select 
                                    className="w-full px-6 py-2 bg-white border border-slate-100 rounded-xl font-bold text-slate-900 outline-none"
                                    value={q.correctAnswer}
                                    onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                  >
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reasoning / Explanation</label>
                              <textarea 
                                className="w-full px-6 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none h-24 resize-none"
                                placeholder="Explain why this answer is correct..."
                                value={q.reasoning || ''}
                                onChange={e => handleQuestionChange(qIndex, 'reasoning', e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                id={`q-${qIndex}-free`}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                checked={q.isFreeSample || false}
                                onChange={e => handleQuestionChange(qIndex, 'isFreeSample', e.target.checked)}
                              />
                              <label htmlFor={`q-${qIndex}-free`} className="text-xs font-bold text-slate-600">Free Sample Question</label>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setShowAddModal(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Daily Drill'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Grading Modal */}
        <AnimatePresence>
          {gradingSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setGradingSubmission(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl"
              >
                <Card className="p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Grade Submission</h2>
                    <button onClick={() => setGradingSubmission(null)} className="p-2 text-slate-400 hover:text-slate-900">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Answer</p>
                      {gradingSubmission.paperType === 'Paper 1' ? (
                        <div className="space-y-2">
                          {Object.entries(gradingSubmission.answers).map(([qId, ans]: any) => (
                            <div key={qId} className="flex items-center justify-between text-sm font-bold">
                              <span>Question {qId.replace('q', '')}</span>
                              <Badge variant="secondary">{ans}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-slate-700">{gradingSubmission.answers.text}</p>
                          {gradingSubmission.answers.fileUrl && (
                            <a 
                              href={gradingSubmission.answers.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs hover:underline"
                            >
                              <FileText size={14} /> View Attached File
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleGradeSubmission} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                          <select 
                            className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                            value={gradingSubmission.tempGrade}
                            onChange={e => setGradingSubmission({ ...gradingSubmission, tempGrade: e.target.value as Grade })}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Score (%)</label>
                          <input 
                            type="number" 
                            min="0" max="100"
                            className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                            value={gradingSubmission.tempScore}
                            onChange={e => setGradingSubmission({ ...gradingSubmission, tempScore: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feedback</label>
                        <textarea 
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none h-32 resize-none"
                          placeholder="Provide constructive feedback..."
                          value={gradingSubmission.tempFeedback}
                          onChange={e => setGradingSubmission({ ...gradingSubmission, tempFeedback: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => setGradingSubmission(null)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Grade'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
