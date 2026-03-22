import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Plus, Trash2, CheckCircle2, Clock, 
  FileText, HelpCircle, ChevronRight, 
  Search, AlertCircle, Save, X, Edit3,
  Check, MessageSquare, User, Calendar,
  Image as ImageIcon, Upload, FileUp, Loader2, Download,
  Zap, Trophy, RefreshCw
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Button, Card, Badge, cn } from '../components/ui';
import { downloadQuestionAsPDF } from '../utils/pdfGenerator';
import { ExamQuestion, DailyDrill, DrillSubmission, Subject, PaperType, Grade, WeeklyLeaderboard } from '../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentDayNumber, getDaysRemaining } from '../utils/challenge';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { formatDate, getWeekNumber } from '../utils/dateUtils';
import { calculateWeeklyLeaderboard } from '../utils/leaderboard';
import { toast } from 'react-hot-toast';
import { SUBJECT_TOPICS, getGroupedTopicsForSubject, SubjectName } from '../constants/topics';
import { getGeminiApiKey } from '../services/settingsService';
import { GoogleGenAI, Type } from '@google/genai';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

export default function AdminDailyDrill() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [drills, setDrills] = useState<DailyDrill[]>([]);
  const [questionsBank, setQuestionsBank] = useState<ExamQuestion[]>([]);
  const [submissions, setSubmissions] = useState<DrillSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<DrillSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bank' | 'drills' | 'grading' | 'leaderboard'>('bank');
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboard[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    day: '',
    subject: '',
    paper: '',
    status: '',
    userId: '',
    topic: ''
  });

  // Question Form State
  const [questionForm, setQuestionForm] = useState<Partial<ExamQuestion>>({
    questionText: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: '',
    subject: 'Computer Science',
    paper: 'Paper 1',
    section: 'A',
    topic: '',
    marks: 1,
    difficulty: 'Medium',
    year: new Date().getFullYear(),
    isDailyDrill: true
  });

  // Drill Form State
  const [drillForm, setDrillForm] = useState<Partial<DailyDrill>>({
    day: 1,
    questionIds: [],
    subject: 'Computer Science',
    topic: '',
    isFree: false
  });
  const [autoAssignForm, setAutoAssignForm] = useState({
    day: 1,
    subject: 'Computer Science' as Subject,
    topic: '',
    mcqCount: 10,
    p2Count: 1,
    p3Count: 1
  });
  const [drillSubjectFilter, setDrillSubjectFilter] = useState<string>('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchQuestionsBank(),
        fetchDailyDrills(),
        fetchSubmissions()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchQuestionsBank();
    }
  }, [isAdmin, filters.subject, filters.paper, filters.topic]);

  const fetchQuestionsBank = async () => {
    let q = query(collection(db, 'exam_questions'), orderBy('createdAt', 'desc'));
    
    // Apply filters if they exist
    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.paper) {
      q = query(q, where('paper', '==', filters.paper));
    }
    if (filters.topic) {
      q = query(q, where('topic', '==', filters.topic));
    }

    const snapshot = await getDocs(q);
    setQuestionsBank(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamQuestion)));
  };

  const fetchDailyDrills = async () => {
    const q = query(collection(db, 'daily_drills'), orderBy('day', 'asc'));
    const snapshot = await getDocs(q);
    setDrills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyDrill)));
  };

  const fetchSubmissions = async () => {
    const q = query(collection(db, 'drill_submissions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrillSubmission));
    setSubmissions(subs);
    setFilteredSubmissions(subs);
  };

  const fetchLeaderboard = async () => {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();
    const q = query(
      collection(db, 'weekly_leaderboard'),
      where('weekNumber', '==', weekNumber),
      where('year', '==', year),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    setLeaderboard(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyLeaderboard)));
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLeaderboard();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    let filtered = [...submissions];
    if (filters.day) filtered = filtered.filter(s => s.day === parseInt(filters.day));
    if (filters.paper) filtered = filtered.filter(s => s.paper === filters.paper);
    if (filters.status) filtered = filtered.filter(s => s.status === filters.status);
    if (filters.userId) filtered = filtered.filter(s => s.userId.toLowerCase().includes(filters.userId.toLowerCase()));
    setFilteredSubmissions(filtered);
  }, [filters, submissions]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data = {
        ...questionForm,
        createdAt: serverTimestamp()
      };
      if (isEditing && editingId) {
        try {
          await updateDoc(doc(db, 'exam_questions', editingId), data);
          setSuccess('Question updated!');
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `exam_questions/${editingId}`);
        }
      } else {
        try {
          await addDoc(collection(db, 'exam_questions'), data);
          setSuccess('Question added to bank!');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'exam_questions');
        }
      }
      setShowQuestionModal(false);
      fetchQuestionsBank();
    } catch (err) {
      setError('Failed to save question.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // 1. Find questions
      const mcqs = questionsBank
        .filter(q => q.subject === autoAssignForm.subject && q.topic === autoAssignForm.topic && q.paper === 'Paper 1')
        .sort(() => 0.5 - Math.random())
        .slice(0, autoAssignForm.mcqCount);

      const p2s = questionsBank
        .filter(q => q.subject === autoAssignForm.subject && q.topic === autoAssignForm.topic && q.paper === 'Paper 2')
        .sort(() => 0.5 - Math.random())
        .slice(0, autoAssignForm.p2Count);

      const p3s = questionsBank
        .filter(q => q.subject === autoAssignForm.subject && q.topic === autoAssignForm.topic && q.paper === 'Paper 3')
        .sort(() => 0.5 - Math.random())
        .slice(0, autoAssignForm.p3Count);

      const questionIds = [...mcqs, ...p2s, ...p3s].map(q => q.id);

      if (questionIds.length === 0) {
        throw new Error('No questions found for the selected topic and subject.');
      }

      // 2. Check if day exists
      const q = query(collection(db, 'daily_drills'), where('day', '==', autoAssignForm.day));
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error(`Day ${autoAssignForm.day} already has an assigned drill.`);
      }

      // 3. Create drill
      const data = {
        day: autoAssignForm.day,
        subject: autoAssignForm.subject,
        topic: autoAssignForm.topic,
        questionIds,
        isFree: autoAssignForm.day === 1,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'daily_drills'), data);
      setSuccess(`Day ${autoAssignForm.day} drill generated with ${questionIds.length} questions!`);
      setShowAutoAssignModal(false);
      fetchDailyDrills();
    } catch (err: any) {
      setError(err.message || 'Failed to auto-assign drill.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDrill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data = {
        ...drillForm,
        createdAt: serverTimestamp()
      };
      if (isEditing && editingId) {
        try {
          await updateDoc(doc(db, 'daily_drills', editingId), data);
          setSuccess('Drill updated!');
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `daily_drills/${editingId}`);
        }
      } else {
        // Check if day already exists
        const q = query(collection(db, 'daily_drills'), where('day', '==', drillForm.day));
        const snap = await getDocs(q);
        if (!snap.empty) {
          throw new Error(`Day ${drillForm.day} already has an assigned drill.`);
        }
        try {
          await addDoc(collection(db, 'daily_drills'), data);
          setSuccess('Questions assigned to day!');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'daily_drills');
        }
      }
      setShowDrillModal(false);
      fetchDailyDrills();
    } catch (err: any) {
      setError(err.message || 'Failed to save drill.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Delete this question from bank?')) return;
    try {
      await deleteDoc(doc(db, 'exam_questions', id));
      fetchQuestionsBank();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `exam_questions/${id}`);
      setError('Failed to delete question.');
    }
  };

  const handleDeleteDrill = async (id: string) => {
    if (!window.confirm('Remove this question from daily drills?')) return;
    try {
      await deleteDoc(doc(db, 'daily_drills', id));
      fetchDailyDrills();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `daily_drills/${id}`);
      setError('Failed to delete drill.');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'drill_submissions', gradingSubmission.id), {
        score: gradingSubmission.tempScore || 0,
        status: 'graded',
        feedback: gradingSubmission.feedback || ''
      });
      setGradingSubmission(null);
      fetchSubmissions();
      setSuccess('Graded!');
    } catch (err) {
      setError('Failed to grade.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateLeaderboard = async () => {
    setIsCalculating(true);
    try {
      await calculateWeeklyLeaderboard();
      toast.success('Leaderboard recalculated successfully!');
      fetchLeaderboard();
    } catch (error) {
      toast.error('Failed to recalculate leaderboard');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Drill Management</h1>
              <p className="text-gray-500">Manage question bank and assign daily drills</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => {
                setIsEditing(false);
                setQuestionForm({
                  questionText: '',
                  options: { A: '', B: '', C: '', D: '' },
                  correctAnswer: 'A',
                  explanation: '',
                  subject: 'Computer Science',
                  paper: 'Paper 1',
                  section: 'A',
                  topic: '',
                  marks: 1,
                  difficulty: 'Medium',
                  year: new Date().getFullYear(),
                  isDailyDrill: true
                });
                setShowQuestionModal(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button variant="outline" onClick={() => {
                setAutoAssignForm({
                  day: drills.length + 1,
                  subject: 'Computer Science',
                  topic: '',
                  mcqCount: 10,
                  p2Count: 1,
                  p3Count: 1
                });
                setShowAutoAssignModal(true);
              }}>
                <Zap className="w-4 h-4 mr-2" />
                Auto-Assign Drill
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setDrillForm({
                  day: drills.length + 1,
                  questionIds: [],
                  subject: 'Computer Science',
                  topic: '',
                  isFree: false
                });
                setShowDrillModal(true);
              }}>
                <Calendar className="w-4 h-4 mr-2" />
                Manual Assign
              </Button>
              <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                <FileUp className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          <Tabs defaultValue="bank" value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="mb-8">
              <TabsTrigger value="bank">Question Bank</TabsTrigger>
              <TabsTrigger value="drills">Daily Drills</TabsTrigger>
              <TabsTrigger value="grading">Grading</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="bank">
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value, topic: '' })}
                >
                  <option value="">All Subjects</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="ICT">ICT</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filters.paper}
                  onChange={(e) => setFilters({ ...filters, paper: e.target.value })}
                >
                  <option value="">All Papers</option>
                  <option value="Paper 1">Paper 1</option>
                  <option value="Paper 2">Paper 2</option>
                  <option value="Paper 3">Paper 3</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filters.topic}
                  onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                >
                  <option value="">All Topics</option>
                  {filters.subject && Object.values(SUBJECT_TOPICS[filters.subject as SubjectName]).flat().map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    onChange={(e) => {
                      // Simple client-side search for now
                      const term = e.target.value.toLowerCase();
                      if (!term) {
                        fetchQuestionsBank();
                        return;
                      }
                      setQuestionsBank(prev => prev.filter(q => 
                        q.questionText.toLowerCase().includes(term) || 
                        q.topic.toLowerCase().includes(term)
                      ));
                    }}
                  />
                </div>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-bottom">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {questionsBank.map((q) => (
                        <tr key={q.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {q.imageUrl && (
                                <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0 bg-gray-50">
                                  <img src={q.imageUrl} alt="Diagram" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="text-sm text-gray-900 line-clamp-1">{q.questionText}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-400">{q.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{q.paper}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{q.topic}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={q.difficulty === 'Hard' ? 'danger' : q.difficulty === 'Medium' ? 'warning' : 'success'}>
                              {q.difficulty}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => downloadQuestionAsPDF(q as any)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(true);
                                  setEditingId(q.id!);
                                  setQuestionForm(q);
                                  setShowQuestionModal(true);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id!)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="drills">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-bottom">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {drills.map((d) => (
                        <tr key={d.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Day {d.day}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{d.subject}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{d.topic}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {d.isFree ? (
                              <Badge variant="success">Free Sample</Badge>
                            ) : (
                              <Badge variant="secondary">Premium</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setEditingId(d.id!);
                                setDrillForm(d);
                                setShowDrillModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDrill(d.id!)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="grading">
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search User ID..."
                    className="w-full px-4 py-2 border rounded-lg"
                    value={filters.userId}
                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  />
                </div>
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filters.paper}
                  onChange={(e) => setFilters({ ...filters, paper: e.target.value })}
                >
                  <option value="">All Papers</option>
                  <option value="Paper 1">Paper 1</option>
                  <option value="Paper 2">Paper 2</option>
                  <option value="Paper 3">Paper 3</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="graded">Graded</option>
                </select>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-bottom">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredSubmissions.map((s) => (
                        <tr key={s.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{s.userId.substring(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">Day {s.day}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{s.paper}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{s.score}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {s.status === 'graded' ? (
                              <Badge variant="success">Graded</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGradingSubmission({ ...s, tempScore: s.score })}
                            >
                              Grade
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Weekly Leaderboard</h2>
                    <p className="text-slate-500 font-medium">Manage and view student rankings for the current week.</p>
                  </div>
                  <Button 
                    onClick={handleCalculateLeaderboard} 
                    disabled={isCalculating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 rounded-2xl flex items-center gap-2"
                  >
                    <RefreshCw size={18} className={cn(isCalculating && "animate-spin")} />
                    {isCalculating ? 'Calculating...' : 'Recalculate Now'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-indigo-600 text-white">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Top Performer</p>
                    <p className="text-2xl font-black truncate">{leaderboard[0]?.userName || 'N/A'}</p>
                    <p className="text-indigo-200 text-sm mt-1">{leaderboard[0]?.totalScore || 0} Points</p>
                  </Card>
                  <Card className="p-6 bg-slate-900 text-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Participants</p>
                    <p className="text-2xl font-black">{leaderboard.length}</p>
                    <p className="text-slate-400 text-sm mt-1">Active this week</p>
                  </Card>
                  <Card className="p-6 bg-emerald-600 text-white">
                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Avg. Weekly Score</p>
                    <p className="text-2xl font-black">
                      {leaderboard.length > 0 
                        ? Math.round(leaderboard.reduce((acc, curr) => acc + curr.totalScore, 0) / leaderboard.length)
                        : 0}
                    </p>
                    <p className="text-emerald-200 text-sm mt-1">Points per student</p>
                  </Card>
                </div>

                <Card className="overflow-hidden border-slate-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Points</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaderboard.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
                                entry.position === 1 ? "bg-amber-100 text-amber-600" :
                                entry.position === 2 ? "bg-slate-100 text-slate-400" :
                                entry.position === 3 ? "bg-orange-100 text-orange-600" :
                                "bg-slate-50 text-slate-400"
                              )}>
                                {entry.position}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{entry.userName}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {entry.userId.slice(0, 8)}...</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-lg font-black text-slate-900">{entry.totalScore}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-xs text-slate-500 font-medium">{formatDate(entry.updatedAt)}</p>
                            </td>
                          </tr>
                        ))}
                        {leaderboard.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Trophy size={48} className="text-slate-200" />
                                <p className="text-slate-400 font-bold">No leaderboard data found for this week.</p>
                                <Button variant="outline" onClick={handleCalculateLeaderboard} className="mt-4">
                                  Generate Initial Leaderboard
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Question Modal */}
        <AnimatePresence>
          {showQuestionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
                  <button onClick={() => setShowQuestionModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                    <textarea
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      value={questionForm.questionText}
                      onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagram / Image (Optional)</label>
                    <FileUpload
                      onUploadStart={() => setIsUploading(true)}
                      onUploadComplete={(url) => {
                        setQuestionForm(prev => ({ ...prev, imageUrl: url }));
                        setIsUploading(false);
                      }}
                      onUploadError={() => setIsUploading(false)}
                      onDelete={() => setQuestionForm(prev => ({ ...prev, imageUrl: undefined }))}
                      initialUrl={questionForm.imageUrl}
                      folder="exam_questions"
                      accept="image/*"
                      label={questionForm.imageUrl ? 'Change Image' : 'Upload Image'}
                    />
                    <p className="text-[10px] text-gray-500">Supported formats: JPG, PNG, WEBP. Max size: 2MB.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={questionForm.subject}
                        onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value as Subject, topic: '' })}
                      >
                        <option value="Computer Science">Computer Science (0795)</option>
                        <option value="ICT">ICT (0796)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paper</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={questionForm.paper}
                        onChange={(e) => setQuestionForm({ ...questionForm, paper: e.target.value as PaperType })}
                      >
                        <option value="Paper 1">Paper 1 (MCQ)</option>
                        <option value="Paper 2">Paper 2 (Structured)</option>
                        <option value="Paper 3">Paper 3 (Practical/Case Study)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={questionForm.section}
                        onChange={(e) => setQuestionForm({ ...questionForm, section: e.target.value as any })}
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value as any })}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {questionForm.paper === 'Paper 1' && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Options</p>
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="font-bold text-gray-500 w-4">{opt}</span>
                          <input
                            type="text"
                            required
                            className="flex-1 px-3 py-1 border rounded-md"
                            value={questionForm.options?.[opt as keyof typeof questionForm.options] || ''}
                            onChange={(e) => setQuestionForm({
                              ...questionForm,
                              options: { ...questionForm.options!, [opt]: e.target.value }
                            })}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                        <select
                          className="w-full px-4 py-2 border rounded-lg"
                          value={questionForm.correctAnswer}
                          onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {questionForm.paper !== 'Paper 1' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer / Marking Scheme</label>
                      <textarea
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={2}
                        value={questionForm.correctAnswer}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                    <textarea
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={2}
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                      <select
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                        value={questionForm.topic}
                        onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                      >
                        <option value="">Select Topic</option>
                        {Object.entries(getGroupedTopicsForSubject(questionForm.subject as SubjectName)).map(([module, topics]) => (
                          <optgroup key={module} label={module}>
                            {topics.map(topic => (
                              <option key={topic} value={topic}>{topic}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                        value={questionForm.marks}
                        onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowQuestionModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Question'}</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Auto-Assign Modal */}
        <AnimatePresence>
          {showAutoAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Auto-Assign Daily Drill</h2>
                  <button onClick={() => setShowAutoAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAutoAssign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day (1-60)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                        value={autoAssignForm.day}
                        onChange={(e) => setAutoAssignForm({ ...autoAssignForm, day: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={autoAssignForm.subject}
                        onChange={(e) => setAutoAssignForm({ ...autoAssignForm, subject: e.target.value as Subject, topic: '' })}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="ICT">ICT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <select
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      value={autoAssignForm.topic}
                      onChange={(e) => setAutoAssignForm({ ...autoAssignForm, topic: e.target.value })}
                    >
                      <option value="">Select Topic</option>
                      {Object.entries(getGroupedTopicsForSubject(autoAssignForm.subject)).map(([module, topics]) => (
                        <optgroup key={module} label={module}>
                          {topics.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">MCQs</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={autoAssignForm.mcqCount}
                        onChange={(e) => setAutoAssignForm({ ...autoAssignForm, mcqCount: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Paper 2</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={autoAssignForm.p2Count}
                        onChange={(e) => setAutoAssignForm({ ...autoAssignForm, p2Count: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Paper 3</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={autoAssignForm.p3Count}
                        onChange={(e) => setAutoAssignForm({ ...autoAssignForm, p3Count: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAutoAssignModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Drill'}</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDrillModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{isEditing ? 'Edit Assignment' : 'Assign Question to Day'}</h2>
                  <button onClick={() => setShowDrillModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveDrill} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Day (1-60)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      value={drillForm.day}
                      onChange={(e) => setDrillForm({ ...drillForm, day: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Questions from Bank (Hold Ctrl/Cmd to select multiple)</label>
                    <select
                      required
                      multiple
                      className="w-full px-4 py-2 border rounded-lg h-48"
                      value={drillForm.questionIds || []}
                      onChange={(e) => {
                        const options = e.target.options;
                        const values = [];
                        for (let i = 0; i < options.length; i++) {
                          if (options[i].selected) {
                            values.push(options[i].value);
                          }
                        }
                        setDrillForm({ ...drillForm, questionIds: values });
                      }}
                    >
                      {questionsBank
                        .filter(q => !drillSubjectFilter || q.subject === drillSubjectFilter)
                        .map(q => (
                          <option key={q.id} value={q.id}>
                            [{q.subject}] [{q.paper}] {q.questionText.substring(0, 50)}...
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Selected: {drillForm.questionIds?.length || 0} questions</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={drillForm.isFree}
                      onChange={(e) => setDrillForm({ ...drillForm, isFree: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <label htmlFor="isFree" className="text-sm text-gray-700">Mark as Free Sample</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowDrillModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign to Day'}</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Grading Modal */}
        <AnimatePresence>
          {gradingSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Grade Submission</h2>
                  <button onClick={() => setGradingSubmission(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 mb-1 text-xs uppercase font-bold">Student Answer</p>
                      <p className="font-medium text-gray-900 whitespace-pre-wrap">{gradingSubmission.selectedAnswer}</p>
                    </div>
                    {gradingSubmission.fileUrl && (
                      <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-blue-500 mb-1 text-xs uppercase font-bold">Attachment</p>
                          <p className="text-sm font-medium text-blue-900">Student uploaded a file</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(gradingSubmission.fileUrl, '_blank')}
                        >
                          View File
                        </Button>
                      </div>
                    )}
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-indigo-500 mb-1 text-xs uppercase font-bold">Correct Answer / Marking Scheme</p>
                      <p className="font-medium text-indigo-900">{gradingSubmission.correctAnswer}</p>
                    </div>
                  </div>

                  <form onSubmit={handleGradeSubmission} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={gradingSubmission.tempScore || 0}
                          onChange={(e) => setGradingSubmission({ ...gradingSubmission, tempScore: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                      <textarea
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                        placeholder="Provide feedback to the student..."
                        value={gradingSubmission.feedback || ''}
                        onChange={(e) => setGradingSubmission({ ...gradingSubmission, feedback: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Submit Grade'}</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Bulk Import Modal */}
        <AnimatePresence>
          {showImportModal && (
            <BulkImportModal 
              onClose={() => setShowImportModal(false)} 
              onImported={() => {
                fetchQuestionsBank();
                setShowImportModal(false);
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface BulkImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

function BulkImportModal({ onClose, onImported }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<Partial<ExamQuestion>[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>('Computer Science');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      const apiKey = await getApiKey();
      setIsApiKeyMissing(!apiKey);
    };
    checkApiKey();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const getApiKey = async () => {
    // 1. Check platform-injected process.env
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.API_KEY) return process.env.API_KEY;
        if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      }
    } catch (e) {}

    // 2. Check Vite-specific import.meta.env
    const metaEnv = (import.meta as any).env;
    if (metaEnv?.VITE_GEMINI_API_KEY) return metaEnv.VITE_GEMINI_API_KEY as string;

    // 3. Check window-level globals
    if ((window as any).GEMINI_API_KEY) return (window as any).GEMINI_API_KEY;
    if ((window as any).process?.env?.API_KEY) return (window as any).process.env.API_KEY;
    if ((window as any).process?.env?.GEMINI_API_KEY) return (window as any).process.env.GEMINI_API_KEY;

    // 4. Check Firestore System Settings
    const firestoreKey = await getGeminiApiKey();
    if (firestoreKey) return firestoreKey;

    return null;
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessingStatus('Reading file...');
    setError('');
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        setProcessingStatus('Parsing PDF pages...');
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = pdfWorker;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          setProcessingStatus(`Parsing PDF page ${i} of ${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        text = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setProcessingStatus('Converting Word document...');
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result.value;
        text = tempDiv.innerText;
      } else if (file.type === 'application/json') {
        setProcessingStatus('Parsing JSON data...');
        const content = await file.text();
        const rawQuestions = JSON.parse(content);
        const questions = (Array.isArray(rawQuestions) ? rawQuestions : [rawQuestions]).map(q => ({
          ...q,
          subject: q.subject || selectedSubject
        }));
        setPreviewQuestions(questions);
        setIsProcessing(false);
        setProcessingStatus('');
        return;
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setProcessingStatus('Reading CSV data...');
        text = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, Word, CSV, or JSON document.');
      }

      setProcessingStatus('Analyzing with AI (this may take a moment)...');
      
      // Check for API key using platform API
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setProcessingStatus('Please select an API key to continue...');
        await window.aistudio.openSelectKey();
        // After opening the dialog, we assume the user will select a key.
        // However, we should stop here and let them try again once the key is selected
        // as process.env.API_KEY might not be immediately updated in this context.
        setIsProcessing(false);
        setProcessingStatus('');
        toast(
          'Please select an API key in the dialog and then try processing the file again.',
          { icon: 'ℹ️' }
        );
        return;
      }

      // Use Gemini to parse the text into questions
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        // If still missing, try to open the dialog again or show a helpful message
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          setIsProcessing(false);
          setProcessingStatus('');
          toast.error('Gemini API Key is missing. Please select a key in the dialog and try again.');
          return;
        }
        throw new Error('Gemini API Key is missing. Please add API key in Settings or ensure you have selected an API key in the platform settings.');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const validTopics = Object.values(SUBJECT_TOPICS[selectedSubject]).flat().join(', ');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract exam questions for the subject "${selectedSubject}" from the following text/data. 
        Return an array of objects with these fields: 
        - questionText: The full text of the question.
        - options: For Paper 1 (MCQ), provide an object with A, B, C, D keys. For Paper 2/3, this should be null or empty.
        - correctAnswer: For Paper 1, this MUST be exactly 'A', 'B', 'C', or 'D'. For Paper 2 or Paper 3, this should be the full marking scheme or expected answer text.
        - explanation: A brief explanation of the answer.
        - paper: MUST be exactly 'Paper 1', 'Paper 2', or 'Paper 3'.
        - topic: MUST be the most relevant topic from this list: ${validTopics}. If no exact match, pick the closest one.
        - marks: The number of marks awarded for the question.
        - difficulty: 'Easy', 'Medium', or 'Hard'.
        - imageUrl: (optional) any URL found in the text associated with the question.
        
        Data:
        ${text.substring(0, 15000)}`, // Increased limit slightly
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                options: { 
                  type: Type.OBJECT,
                  nullable: true,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING }
                  }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                paper: { type: Type.STRING },
                topic: { type: Type.STRING },
                marks: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                imageUrl: { type: Type.STRING }
              },
              required: ['questionText', 'correctAnswer', 'paper', 'topic']
            }
          }
        }
      });

      const aiResponseText = response.text;
      if (!aiResponseText) {
        throw new Error('AI failed to extract questions from the PDF. Please try again or use a different file.');
      }

      console.log('AI Response:', aiResponseText);
      const questions = JSON.parse(aiResponseText).map((q: any) => ({
        ...q,
        subject: selectedSubject
      }));
      
      if (questions.length === 0) {
        throw new Error('No questions were found in the PDF.');
      }

      setPreviewQuestions(questions);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to process file.');
      toast.error(err.message || 'Failed to process file.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleImport = async () => {
    if (previewQuestions.length === 0) return;
    setIsProcessing(true);
    setProcessingStatus('Importing to database...');
    try {
      const batch = previewQuestions.map(async (q) => {
        try {
          await addDoc(collection(db, 'exam_questions'), {
            ...q,
            isDailyDrill: true,
            year: new Date().getFullYear(),
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'exam_questions');
        }
      });
      await Promise.all(batch);
      toast.success(`Successfully imported ${previewQuestions.length} questions!`);
      onImported();
    } catch (err: any) {
      console.error('Import error:', err);
      toast.error(err.message || 'Failed to import questions to database.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setPreviewQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Partial<ExamQuestion>) => {
    setPreviewQuestions(prev => {
      const next = [...prev];
      next[index] = updatedQuestion;
      return next;
    });
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Bulk Import Questions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!previewQuestions.length ? (
          <div className="space-y-6">
            {isApiKeyMissing && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-900">Gemini API Key is missing</p>
                  <p className="text-xs text-amber-700 mt-1">
                    AI-powered bulk upload requires a Gemini API key. Please add one in the <Link to="/admin/settings" className="font-bold underline">System Settings</Link> page.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Subject</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as SubjectName)}
                >
                  <option value="Computer Science">Computer Science (0795)</option>
                  <option value="ICT">ICT (0796)</option>
                </select>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
              <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload a PDF, Word, CSV, or JSON document containing exam questions.</p>
              <div className="flex flex-col items-center gap-2 mb-4">
                <p className="text-xs text-slate-400">CSV/JSON should include: questionText, options, correctAnswer, paper, topic, imageUrl (optional)</p>
              </div>
              <input 
                type="file" 
                accept=".pdf,.docx,.csv,.json" 
                onChange={handleFileChange}
                className="hidden" 
                id="bulk-file"
              />
              <label 
                htmlFor="bulk-file"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition-colors"
              >
                {file ? file.name : 'Select File'}
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={processFile} 
                disabled={!file || isProcessing}
                className="bg-indigo-600 text-white"
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{processingStatus || 'Processing...'}</span>
                    </div>
                    <div className="w-full h-1 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 animate-pulse" style={{ width: '100%' }} />
                    </div>
                  </div>
                ) : 'Process File'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-700">Preview: {previewQuestions.length} Questions Found</p>
              <Button variant="outline" onClick={() => setPreviewQuestions([])}>Reset</Button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto p-4 bg-gray-50 rounded-xl border">
              {previewQuestions.map((q, i) => (
                <div key={i} className="p-4 bg-white rounded-lg border shadow-sm">
                  {editingIndex === i ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">Edit Question #{i + 1}</h4>
                        <button onClick={() => setEditingIndex(null)} className="text-gray-400 hover:text-gray-600">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Text</label>
                        <textarea 
                          className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                          value={q.questionText}
                          onChange={e => {
                            const next = [...previewQuestions];
                            next[i] = { ...next[i], questionText: e.target.value };
                            setPreviewQuestions(next);
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paper</label>
                          <select 
                            className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                            value={q.paper}
                            onChange={e => {
                              const next = [...previewQuestions];
                              const newPaper = e.target.value as PaperType;
                              const options = newPaper === 'Paper 1' ? (next[i].options || { A: '', B: '', C: '', D: '' }) : null;
                              next[i] = { ...next[i], paper: newPaper, options };
                              setPreviewQuestions(next);
                            }}
                          >
                            <option value="Paper 1">Paper 1</option>
                            <option value="Paper 2">Paper 2</option>
                            <option value="Paper 3">Paper 3</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic</label>
                          <select 
                            className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                            value={q.topic}
                            onChange={e => {
                              const next = [...previewQuestions];
                              next[i] = { ...next[i], topic: e.target.value };
                              setPreviewQuestions(next);
                            }}
                          >
                            {Object.values(SUBJECT_TOPICS[selectedSubject]).flat().map(topic => (
                              <option key={topic} value={topic}>{topic}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {q.paper === 'Paper 1' && q.options && (
                        <div className="grid grid-cols-2 gap-4">
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Option {opt}</label>
                              <input 
                                type="text"
                                className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                                value={q.options?.[opt as keyof typeof q.options] || ''}
                                onChange={e => {
                                  const next = [...previewQuestions];
                                  const options = { ...next[i].options, [opt]: e.target.value };
                                  next[i] = { ...next[i], options };
                                  setPreviewQuestions(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Answer</label>
                          {q.paper === 'Paper 1' ? (
                            <select 
                              className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                              value={q.correctAnswer}
                              onChange={e => {
                                const next = [...previewQuestions];
                                next[i] = { ...next[i], correctAnswer: e.target.value };
                                setPreviewQuestions(next);
                              }}
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          ) : (
                            <textarea 
                              className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                              value={q.correctAnswer}
                              onChange={e => {
                                const next = [...previewQuestions];
                                next[i] = { ...next[i], correctAnswer: e.target.value };
                                setPreviewQuestions(next);
                              }}
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks</label>
                          <input 
                            type="number"
                            className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm"
                            value={q.marks}
                            onChange={e => {
                              const next = [...previewQuestions];
                              next[i] = { ...next[i], marks: parseInt(e.target.value) };
                              setPreviewQuestions(next);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>Done</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{q.paper}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{q.topic}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingIndex(i)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleRemoveQuestion(i)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                          <span className="text-xs font-bold text-gray-400 ml-2">#{i + 1}</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {q.imageUrl && (
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border">
                            <img src={q.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-2">{q.questionText}</p>
                          
                          {q.paper === 'Paper 1' && q.options && (
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {Object.entries(q.options).map(([key, val]) => (
                                <div key={key} className={`text-xs p-1 rounded ${q.correctAnswer === key ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                                  <span className="font-bold mr-1">{key}:</span> {val}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.paper !== 'Paper 1' && (
                            <div className="mb-2 p-2 bg-indigo-50 rounded border border-indigo-100">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Marking Scheme</p>
                              <p className="text-xs text-indigo-900">{q.correctAnswer}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Marks: {q.marks}</span>
                            <span>Difficulty: {q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleImport} 
                disabled={isProcessing}
                className="bg-indigo-600 text-white"
              >
                {isProcessing ? 'Importing...' : 'Import to Bank'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
