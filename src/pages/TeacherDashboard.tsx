import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Video, FileText, CheckSquare, HelpCircle, Award, 
  FileCheck, MessageSquare, BarChart2, Plus, Search, Trash2, 
  Eye, Edit2, Upload, Calendar, Clock, CheckCircle2, AlertCircle, 
  UserCheck, Shield, ChevronRight, X, Sparkles, Filter, Download
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, serverTimestamp, getDocs, where 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Button, Card, Badge, cn } from '../components/ui';
import { 
  LMSLesson, Assignment, TeacherQuiz, TeacherMockExam, 
  MarkingSchemeItem, DiscussionThread, TeacherVideo, TeacherPDF,
  SubjectModel 
} from '../types';
import { toast } from 'react-hot-toast';
import { AITeacherTools } from '../components/EdulphaAI/AITeacherTools';

export default function TeacherDashboard() {
  const { user, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<
    'performance' | 'lessons' | 'videos' | 'pdfs' | 'assignments' | 'quizzes' | 'mock_exams' | 'marking_schemes' | 'discussions' | 'ai_studio'
  >('performance');

  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [videos, setVideos] = useState<TeacherVideo[]>([]);
  const [pdfs, setPdfs] = useState<TeacherPDF[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [mockExams, setMockExams] = useState<TeacherMockExam[]>([]);
  const [markingSchemes, setMarkingSchemes] = useState<MarkingSchemeItem[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form States
  const [lessonForm, setLessonForm] = useState({
    title: '',
    subject: 'Computer Science',
    topic: '',
    level: 'Ordinary Level',
    summary: '',
    videoUrl: '',
    contentUrl: '',
    estimatedMinutes: 30,
    content: ''
  });

  const [videoForm, setVideoForm] = useState({
    title: '',
    subject: 'Computer Science',
    topic: '',
    videoUrl: '',
    duration: '15 mins',
    description: ''
  });

  const [pdfForm, setPdfForm] = useState({
    title: '',
    subject: 'Computer Science',
    topic: '',
    fileUrl: '',
    fileSize: '2.4 MB',
    isDownloadable: true,
    description: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: 'Computer Science',
    dueDate: '',
    paper: 'Paper 1',
    link: '',
    instructions: '',
    totalPoints: 50
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    subject: 'Computer Science',
    topic: '',
    timeLimitMinutes: 20,
    passingScorePercent: 60,
    questions: [
      { id: '1', questionText: '', options: ['', '', '', ''], correctAnswer: 'A', explanation: '' }
    ]
  });

  const [mockExamForm, setMockExamForm] = useState({
    title: '',
    subject: 'Computer Science',
    paperType: 'Paper 1',
    durationMinutes: 90,
    totalMarks: 100,
    passPercentage: 50,
    instructions: '',
    examUrl: '',
    isPublished: true
  });

  const [markingSchemeForm, setMarkingSchemeForm] = useState({
    title: '',
    subject: 'Computer Science',
    year: new Date().getFullYear(),
    paperType: 'Paper 1',
    guideText: '',
    fileUrl: ''
  });

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user || (!isTeacher && !isAdmin)) {
      navigate('/dashboard');
      return;
    }

    fetchInitialData();
  }, [user, isTeacher, isAdmin]);

  const fetchInitialData = async () => {
    setLoading(true);

    // Fetch Subjects
    try {
      const subSnap = await getDocs(collection(db, 'subjects'));
      if (!subSnap.empty) {
        setSubjects(subSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SubjectModel[]);
      } else {
        setSubjects([
          { id: 'cs', name: 'Computer Science', code: 'CS', educationLevel: 'Ordinary Level' },
          { id: 'ict', name: 'ICT', code: 'ICT', educationLevel: 'Ordinary Level' },
          { id: 'math', name: 'Mathematics', code: 'MATH', educationLevel: 'Advanced Level' },
          { id: 'phy', name: 'Physics', code: 'PHY', educationLevel: 'Advanced Level' }
        ]);
      }
    } catch (e) {
      console.warn('Error fetching subjects:', e);
    }

    // Subscribe to Lessons
    const unsubLessons = onSnapshot(collection(db, 'lms_lessons'), (snap) => {
      if (!snap.empty) {
        setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })) as LMSLesson[]);
      } else {
        setLessons([
          {
            id: 'l1',
            title: 'Introduction to Data Structures & Algorithms',
            subject: 'Computer Science',
            topic: 'Data Structures',
            level: 'Advanced Level',
            educationLevel: 'Advanced Level',
            format: 'video',
            difficulty: 'Intermediate',
            status: 'published',
            summary: 'Fundamentals of Arrays, Linked Lists, Stacks and Queues.',
            estimatedMinutes: 45,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            createdAt: new Date().toISOString()
          },
          {
            id: 'l2',
            title: 'Computer Networks & OSI Layer Architecture',
            subject: 'ICT',
            topic: 'Networking',
            level: 'Ordinary Level',
            educationLevel: 'Ordinary Level',
            format: 'text',
            difficulty: 'Beginner',
            status: 'published',
            summary: 'Comprehensive breakdown of 7 OSI layers and TCP/IP protocol suite.',
            estimatedMinutes: 30,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    });

    // Subscribe to Videos
    const unsubVideos = onSnapshot(collection(db, 'lms_videos'), (snap) => {
      if (!snap.empty) {
        setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeacherVideo[]);
      } else {
        setVideos([
          {
            id: 'v1',
            title: 'Object Oriented Programming Principles in C++',
            subject: 'Computer Science',
            topic: 'OOP Concepts',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '25 mins',
            description: 'Encapsulation, Inheritance, Polymorphism with code examples.'
          }
        ]);
      }
    });

    // Subscribe to PDFs
    const unsubPdfs = onSnapshot(collection(db, 'lms_pdfs'), (snap) => {
      if (!snap.empty) {
        setPdfs(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeacherPDF[]);
      } else {
        setPdfs([
          {
            id: 'p1',
            title: 'GCE Advanced Level CS Revision Syllabus Guide 2026',
            subject: 'Computer Science',
            topic: 'Syllabus Breakdown',
            fileUrl: '#',
            fileSize: '3.2 MB',
            isDownloadable: true,
            description: 'Official topics breakdown and target marking criteria.'
          }
        ]);
      }
    });

    // Subscribe to Assignments
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snap) => {
      if (!snap.empty) {
        setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Assignment[]);
      } else {
        setAssignments([
          {
            id: 'a1',
            title: 'Paper 2 Algorithm Design & Flowchart Exercise',
            subject: 'Computer Science',
            paper: 'Paper 2',
            dueDate: '2026-08-15',
            link: '#',
            active: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    });

    // Subscribe to Quizzes
    const unsubQuizzes = onSnapshot(collection(db, 'quizzes'), (snap) => {
      if (!snap.empty) {
        setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeacherQuiz[]);
      } else {
        setQuizzes([
          {
            id: 'q1',
            title: 'Boolean Algebra & Logic Gates Quick Drill',
            subject: 'Computer Science',
            topic: 'Logic Gates',
            timeLimitMinutes: 15,
            passingScorePercent: 70,
            questions: [
              { id: '1', questionText: 'Which logic gate outputs 1 only when all inputs are 1?', options: ['OR Gate', 'AND Gate', 'NAND Gate', 'XOR Gate'], correctAnswer: 'B', explanation: 'An AND gate requires all binary inputs to be High (1).' }
            ]
          }
        ]);
      }
    });

    // Subscribe to Mock Exams
    const unsubMockExams = onSnapshot(collection(db, 'mock_exams'), (snap) => {
      if (!snap.empty) {
        setMockExams(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeacherMockExam[]);
      } else {
        setMockExams([
          {
            id: 'me1',
            title: 'Full GCE Ordinary Level ICT Mock Exam 2026',
            subject: 'ICT',
            paperType: 'Paper 1',
            durationMinutes: 90,
            totalMarks: 50,
            passPercentage: 50,
            isPublished: true,
            instructions: 'Strictly timed exam under examination hall conditions.'
          }
        ]);
      }
    });

    // Subscribe to Marking Schemes
    const unsubMarkingSchemes = onSnapshot(collection(db, 'marking_schemes'), (snap) => {
      if (!snap.empty) {
        setMarkingSchemes(snap.docs.map(d => ({ id: d.id, ...d.data() })) as MarkingSchemeItem[]);
      } else {
        setMarkingSchemes([
          {
            id: 'ms1',
            title: '2025 GCE A-Level Computer Science Paper 2 Marking Guide',
            subject: 'Computer Science',
            year: 2025,
            paperType: 'Paper 2',
            guideText: 'Full marking distribution for Algorithm design and pseudocode steps.',
            fileUrl: '#'
          }
        ]);
      }
    });

    // Subscribe to Discussions
    const unsubDiscussions = onSnapshot(collection(db, 'discussions'), (snap) => {
      if (!snap.empty) {
        setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() })) as DiscussionThread[]);
      } else {
        setDiscussions([
          {
            id: 'd1',
            title: 'Question regarding Time Complexity of QuickSort',
            authorName: 'Jean-Paul Ngu',
            authorRole: 'student',
            authorId: 's1',
            subject: 'Computer Science',
            content: 'Sir, why is worst case O(n^2) when the pivot is already sorted?',
            status: 'pending',
            replies: []
          }
        ]);
      }
    });

    // Fetch Student Attempts and Students for Analytics
    try {
      const attemptsSnap = await getDocs(collection(db, 'exam_attempts'));
      setStudentAttempts(attemptsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.warn('Attempts fetch warning:', e);
    }

    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      setStudents(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.warn('Students fetch warning:', e);
    }

    setLoading(false);

    return () => {
      unsubLessons();
      unsubVideos();
      unsubPdfs();
      unsubAssignments();
      unsubQuizzes();
      unsubMockExams();
      unsubMarkingSchemes();
      unsubDiscussions();
    };
  };

  // Handler functions for creating items
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      toast.error('Please enter a lesson title.');
      return;
    }
    try {
      await addDoc(collection(db, 'lms_lessons'), {
        ...lessonForm,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Lesson created successfully!');
      setActiveModal(null);
      setLessonForm({
        title: '', subject: 'Computer Science', topic: '', level: 'Ordinary Level',
        summary: '', videoUrl: '', contentUrl: '', estimatedMinutes: 30, content: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lesson.');
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.videoUrl.trim()) {
      toast.error('Please fill in title and video URL.');
      return;
    }
    try {
      await addDoc(collection(db, 'lms_videos'), {
        ...videoForm,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Video uploaded successfully!');
      setActiveModal(null);
      setVideoForm({ title: '', subject: 'Computer Science', topic: '', videoUrl: '', duration: '15 mins', description: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add video.');
    }
  };

  const handleCreatePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfForm.title.trim() || !pdfForm.fileUrl.trim()) {
      toast.error('Please fill in title and file URL or upload a PDF.');
      return;
    }
    try {
      await addDoc(collection(db, 'lms_pdfs'), {
        ...pdfForm,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('PDF document uploaded successfully!');
      setActiveModal(null);
      setPdfForm({ title: '', subject: 'Computer Science', topic: '', fileUrl: '', fileSize: '2.4 MB', isDownloadable: true, description: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload PDF.');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.title.trim()) {
      toast.error('Please enter assignment title.');
      return;
    }
    try {
      await addDoc(collection(db, 'assignments'), {
        ...assignmentForm,
        active: true,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Assignment created!');
      setActiveModal(null);
      setAssignmentForm({ title: '', subject: 'Computer Science', dueDate: '', paper: 'Paper 1', link: '', instructions: '', totalPoints: 50 });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create assignment.');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim()) {
      toast.error('Please enter quiz title.');
      return;
    }
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...quizForm,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Quiz created successfully!');
      setActiveModal(null);
      setQuizForm({
        title: '', subject: 'Computer Science', topic: '', timeLimitMinutes: 20, passingScorePercent: 60,
        questions: [{ id: '1', questionText: '', options: ['', '', '', ''], correctAnswer: 'A', explanation: '' }]
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create quiz.');
    }
  };

  const handleCreateMockExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockExamForm.title.trim()) {
      toast.error('Please enter exam title.');
      return;
    }
    try {
      await addDoc(collection(db, 'mock_exams'), {
        ...mockExamForm,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Mock Exam created!');
      setActiveModal(null);
      setMockExamForm({
        title: '', subject: 'Computer Science', paperType: 'Paper 1', durationMinutes: 90, totalMarks: 100, passPercentage: 50, instructions: '', examUrl: '', isPublished: true
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create mock exam.');
    }
  };

  const handleCreateMarkingScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markingSchemeForm.title.trim()) {
      toast.error('Please enter scheme title.');
      return;
    }
    try {
      await addDoc(collection(db, 'marking_schemes'), {
        ...markingSchemeForm,
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Marking scheme uploaded!');
      setActiveModal(null);
      setMarkingSchemeForm({ title: '', subject: 'Computer Science', year: new Date().getFullYear(), paperType: 'Paper 1', guideText: '', fileUrl: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload marking scheme.');
    }
  };

  const handleReplyDiscussion = async (threadId: string) => {
    const text = replyText[threadId];
    if (!text || !text.trim()) return;

    try {
      const thread = discussions.find(d => d.id === threadId);
      const existingReplies = thread?.replies || [];
      const newReply = {
        id: Date.now().toString(),
        authorName: user?.name || 'Teacher',
        authorRole: 'teacher',
        content: text.trim(),
        createdAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'discussions', threadId), {
        replies: [...existingReplies, newReply],
        status: 'answered'
      });

      toast.success('Reply submitted!');
      setReplyText(prev => ({ ...prev, [threadId]: '' }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit reply.');
    }
  };

  const handleDeleteItem = async (colName: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, colName, id));
      toast.success('Item deleted.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  // Filtering helper
  const filterBySubjectAndSearch = <T extends { subject?: string; title?: string }>(items: T[]) => {
    return items.filter(item => {
      const matchSub = selectedSubject === 'All' || item.subject === selectedSubject;
      const matchSearch = !searchTerm || (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSub && matchSearch;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={14} /> Teacher Portal
                </span>
                <span className="text-xs text-indigo-300 font-medium">Academic Management Console</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Teacher Command Center
              </h1>
              <p className="text-indigo-200 text-sm max-w-xl">
                Create & deliver lessons, manage videos, assignments, quizzes, mock exams, marking schemes, and monitor student academic growth.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setActiveModal('lesson')}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-black shadow-lg rounded-2xl flex items-center gap-2"
              >
                <Plus size={18} /> Create Lesson
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar">
          {[
            { id: 'performance', label: 'Student Performance', icon: BarChart2 },
            { id: 'ai_studio', label: 'AI Teacher Studio', icon: Sparkles },
            { id: 'lessons', label: 'Lessons', icon: BookOpen },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'pdfs', label: 'PDFs & Docs', icon: FileText },
            { id: 'assignments', label: 'Assignments', icon: CheckSquare },
            { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
            { id: 'mock_exams', label: 'Mock Exams', icon: Award },
            { id: 'marking_schemes', label: 'Marking Schemes', icon: FileCheck },
            { id: 'discussions', label: 'Discussions & Q&A', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search resources, topics, or titles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
              >
                <option value="All">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'lessons' && (
              <Button onClick={() => setActiveModal('lesson')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <Plus size={16} /> Add Lesson
              </Button>
            )}
            {activeTab === 'videos' && (
              <Button onClick={() => setActiveModal('video')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <Video size={16} /> Upload Video
              </Button>
            )}
            {activeTab === 'pdfs' && (
              <Button onClick={() => setActiveModal('pdf')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <FileText size={16} /> Upload PDF
              </Button>
            )}
            {activeTab === 'assignments' && (
              <Button onClick={() => setActiveModal('assignment')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <CheckSquare size={16} /> Create Assignment
              </Button>
            )}
            {activeTab === 'quizzes' && (
              <Button onClick={() => setActiveModal('quiz')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <HelpCircle size={16} /> Create Quiz
              </Button>
            )}
            {activeTab === 'mock_exams' && (
              <Button onClick={() => setActiveModal('mock_exam')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <Award size={16} /> Build Mock Exam
              </Button>
            )}
            {activeTab === 'marking_schemes' && (
              <Button onClick={() => setActiveModal('marking_scheme')} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <FileCheck size={16} /> Add Marking Scheme
              </Button>
            )}
          </div>
        </div>

        {/* TAB 0: AI Teacher Studio */}
        {activeTab === 'ai_studio' && (
          <div className="space-y-6">
            <AITeacherTools />
          </div>
        )}

        {/* TAB 1: Student Performance */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 space-y-2 border-indigo-100 bg-indigo-50/30">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Students</span>
                <p className="text-3xl font-black text-indigo-900">{students.length || 14}</p>
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active across registered subjects
                </p>
              </Card>

              <Card className="p-6 space-y-2 border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exams Attempted</span>
                <p className="text-3xl font-black text-slate-900">{studentAttempts.length || 42}</p>
                <p className="text-[11px] text-slate-500 font-medium">Completed by students</p>
              </Card>

              <Card className="p-6 space-y-2 border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Pass Rate</span>
                <p className="text-3xl font-black text-emerald-600">76%</p>
                <p className="text-[11px] text-emerald-600 font-bold">Above national target</p>
              </Card>

              <Card className="p-6 space-y-2 border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments Submitted</span>
                <p className="text-3xl font-black text-slate-900">28</p>
                <p className="text-[11px] text-slate-500 font-medium">Pending teacher review</p>
              </Card>
            </div>

            {/* Performance Roster */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="text-indigo-600" size= {20} /> Student Academic Records
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Enrolled Subject</th>
                      <th className="p-3">Exam Attempts</th>
                      <th className="p-3">Avg Score</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(students.length > 0 ? students : [
                      { id: '1', name: 'Alain Nkwain', email: 'alain@example.com', targetSubject: 'Computer Science', attempts: 5, avg: '84%', status: 'Exceeding' },
                      { id: '2', name: 'Brenda Fon', email: 'brenda@example.com', targetSubject: 'ICT', attempts: 3, avg: '72%', status: 'On Track' },
                      { id: '3', name: 'Christian Tabi', email: 'christian@example.com', targetSubject: 'Mathematics', attempts: 4, avg: '65%', status: 'Needs Review' }
                    ]).map((std, idx) => (
                      <tr key={std.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{std.name || std.displayName || 'Student'}</td>
                        <td className="p-3 text-slate-500">{std.email}</td>
                        <td className="p-3 font-semibold text-indigo-600">{std.targetSubject || std.subject || 'Computer Science'}</td>
                        <td className="p-3">{std.attempts || 4}</td>
                        <td className="p-3 font-bold text-emerald-600">{std.avg || '78%'}</td>
                        <td className="p-3">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: Lessons */}
        {activeTab === 'lessons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterBySubjectAndSearch(lessons).map(lesson => (
              <Card key={lesson.id} className="p-6 space-y-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{lesson.subject}</Badge>
                      {lesson.level && <Badge variant="secondary">{lesson.level}</Badge>}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{lesson.title}</h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteItem('lms_lessons', lesson.id)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{lesson.summary}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Clock size={14} /> {lesson.estimatedMinutes || 30} mins
                  </span>
                  {lesson.videoUrl && (
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                      <Video size={14} /> Video Attached
                    </a>
                  )}
                </div>
              </Card>
            ))}

            {filterBySubjectAndSearch(lessons).length === 0 && (
              <div className="col-span-full py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                <BookOpen className="mx-auto text-slate-300" size={40} />
                <p className="text-sm font-bold text-slate-600">No lessons created yet.</p>
                <Button onClick={() => setActiveModal('lesson')} size="sm" className="bg-indigo-600 text-white">
                  Create First Lesson
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Videos */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBySubjectAndSearch(videos).map(vid => (
              <Card key={vid.id} className="p-5 space-y-3">
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center text-white">
                  <Video size={36} className="text-indigo-400 opacity-80" />
                  <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold">
                    {vid.duration || '15 mins'}
                  </span>
                </div>

                <div className="space-y-1">
                  <Badge variant="indigo">{vid.subject}</Badge>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{vid.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{vid.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <a href={vid.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">
                    Watch Video →
                  </a>
                  <button onClick={() => handleDeleteItem('lms_videos', vid.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 4: PDFs */}
        {activeTab === 'pdfs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBySubjectAndSearch(pdfs).map(pdf => (
              <Card key={pdf.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <button onClick={() => handleDeleteItem('lms_pdfs', pdf.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <Badge variant="neutral">{pdf.subject}</Badge>
                  <h4 className="text-sm font-bold text-slate-900">{pdf.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{pdf.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">{pdf.fileSize || 'PDF'}</span>
                  {pdf.fileUrl && (
                    <a href={pdf.fileUrl} target="_blank" rel="noreferrer" className="font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                      <Download size={14} /> Open Document
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 5: Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {filterBySubjectAndSearch(assignments).map(asg => (
              <Card key={asg.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{asg.subject}</Badge>
                    <Badge variant="secondary">{asg.paper || 'Paper 1'}</Badge>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{asg.title}</h4>
                  {asg.dueDate && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={14} /> Due Date: {asg.dueDate}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {asg.link && (
                    <a href={asg.link} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">
                      View Resource
                    </a>
                  )}
                  <button onClick={() => handleDeleteItem('assignments', asg.id)} className="p-2 text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 6: Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterBySubjectAndSearch(quizzes).map(quiz => (
              <Card key={quiz.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="indigo">{quiz.subject}</Badge>
                    <h4 className="text-base font-bold text-slate-900">{quiz.title}</h4>
                  </div>
                  <button onClick={() => handleDeleteItem('quizzes', quiz.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Clock size={14} /> {quiz.timeLimitMinutes} mins</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Pass: {quiz.passingScorePercent}%</span>
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 7: Mock Exams */}
        {activeTab === 'mock_exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterBySubjectAndSearch(mockExams).map(exam => (
              <Card key={exam.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{exam.subject}</Badge>
                      <Badge variant="secondary">{exam.paperType}</Badge>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{exam.title}</h4>
                  </div>
                  <button onClick={() => handleDeleteItem('mock_exams', exam.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-600">{exam.instructions || 'Standard GCE examination rules apply.'}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">{exam.durationMinutes} mins | {exam.totalMarks} Marks</span>
                  <Badge variant={exam.isPublished ? 'success' : 'warning'}>
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 8: Marking Schemes */}
        {activeTab === 'marking_schemes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterBySubjectAndSearch(markingSchemes).map(scheme => (
              <Card key={scheme.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{scheme.subject}</Badge>
                      <Badge variant="secondary">{scheme.year} - {scheme.paperType}</Badge>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{scheme.title}</h4>
                  </div>
                  <button onClick={() => handleDeleteItem('marking_schemes', scheme.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>

                {scheme.guideText && <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{scheme.guideText}</p>}

                {scheme.fileUrl && (
                  <a href={scheme.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <Download size={14} /> Download Solution PDF
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* TAB 9: Discussions */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            {filterBySubjectAndSearch(discussions).map(thread => (
              <Card key={thread.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{thread.subject}</Badge>
                      <Badge variant={thread.status === 'answered' ? 'success' : 'warning'}>
                        {thread.status.toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{thread.title}</h4>
                    <p className="text-xs text-slate-400">Asked by {thread.authorName}</p>
                  </div>
                  <button onClick={() => handleDeleteItem('discussions', thread.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{thread.content}</p>

                {/* Replies */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
                    {thread.replies.map((r, i) => (
                      <div key={i} className="bg-indigo-50/50 p-3 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-indigo-900">{r.authorName} ({r.authorRole}):</span>
                        <p className="text-slate-700">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type teacher response..."
                    value={replyText[thread.id] || ''}
                    onChange={e => setReplyText({ ...replyText, [thread.id]: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                  <Button onClick={() => handleReplyDiscussion(thread.id)} size="sm" className="bg-indigo-600 text-white">
                    Reply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MODAL BUILDERS */}
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
                  {activeModal.replace('_', ' ')}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {/* Lesson Modal */}
              {activeModal === 'lesson' && (
                <form onSubmit={handleCreateLesson} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Lesson Title</label>
                    <input
                      type="text"
                      required
                      value={lessonForm.title}
                      onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      placeholder="e.g. Memory Management & Paging"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label>Subject</label>
                      <select
                        value={lessonForm.subject}
                        onChange={e => setLessonForm({ ...lessonForm, subject: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label>Academic Level</label>
                      <select
                        value={lessonForm.level}
                        onChange={e => setLessonForm({ ...lessonForm, level: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <option value="Ordinary Level">Ordinary Level</option>
                        <option value="Advanced Level">Advanced Level</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label>Summary</label>
                    <textarea
                      rows={2}
                      value={lessonForm.summary}
                      onChange={e => setLessonForm({ ...lessonForm, summary: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      placeholder="Brief lesson overview..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Video URL (Optional)</label>
                    <input
                      type="text"
                      value={lessonForm.videoUrl}
                      onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Save Lesson</Button>
                </form>
              )}

              {/* Video Modal */}
              {activeModal === 'video' && (
                <form onSubmit={handleCreateVideo} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Video Title</label>
                    <input
                      type="text"
                      required
                      value={videoForm.title}
                      onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Subject</label>
                    <select
                      value={videoForm.subject}
                      onChange={e => setVideoForm({ ...videoForm, subject: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label>Video URL / Embed Link</label>
                    <input
                      type="text"
                      required
                      value={videoForm.videoUrl}
                      onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      placeholder="https://..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Upload Video</Button>
                </form>
              )}

              {/* PDF Modal */}
              {activeModal === 'pdf' && (
                <form onSubmit={handleCreatePdf} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Document Title</label>
                    <input
                      type="text"
                      required
                      value={pdfForm.title}
                      onChange={e => setPdfForm({ ...pdfForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Upload Document File</label>
                    <FileUpload
                      folder="teacher_pdfs"
                      onUploadComplete={(url, name, size) => {
                        setPdfForm(prev => ({ ...prev, fileUrl: url, title: prev.title || name, fileSize: size }));
                        toast.success('File uploaded!');
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Or Direct File URL</label>
                    <input
                      type="text"
                      value={pdfForm.fileUrl}
                      onChange={e => setPdfForm({ ...pdfForm, fileUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Save PDF</Button>
                </form>
              )}

              {/* Assignment Modal */}
              {activeModal === 'assignment' && (
                <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Assignment Title</label>
                    <input
                      type="text"
                      required
                      value={assignmentForm.title}
                      onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label>Subject</label>
                      <select
                        value={assignmentForm.subject}
                        onChange={e => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={assignmentForm.dueDate}
                        onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Publish Assignment</Button>
                </form>
              )}

              {/* Quiz Modal */}
              {activeModal === 'quiz' && (
                <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Quiz Title</label>
                    <input
                      type="text"
                      required
                      value={quizForm.title}
                      onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label>Time Limit (mins)</label>
                      <input
                        type="number"
                        value={quizForm.timeLimitMinutes}
                        onChange={e => setQuizForm({ ...quizForm, timeLimitMinutes: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label>Pass Score (%)</label>
                      <input
                        type="number"
                        value={quizForm.passingScorePercent}
                        onChange={e => setQuizForm({ ...quizForm, passingScorePercent: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Create Quiz</Button>
                </form>
              )}

              {/* Mock Exam Modal */}
              {activeModal === 'mock_exam' && (
                <form onSubmit={handleCreateMockExam} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Exam Title</label>
                    <input
                      type="text"
                      required
                      value={mockExamForm.title}
                      onChange={e => setMockExamForm({ ...mockExamForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label>Paper Type</label>
                      <select
                        value={mockExamForm.paperType}
                        onChange={e => setMockExamForm({ ...mockExamForm, paperType: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <option value="Paper 1">Paper 1</option>
                        <option value="Paper 2">Paper 2</option>
                        <option value="Paper 3">Paper 3</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label>Duration (mins)</label>
                      <input
                        type="number"
                        value={mockExamForm.durationMinutes}
                        onChange={e => setMockExamForm({ ...mockExamForm, durationMinutes: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Create Mock Exam</Button>
                </form>
              )}

              {/* Marking Scheme Modal */}
              {activeModal === 'marking_scheme' && (
                <form onSubmit={handleCreateMarkingScheme} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label>Scheme Title</label>
                    <input
                      type="text"
                      required
                      value={markingSchemeForm.title}
                      onChange={e => setMarkingSchemeForm({ ...markingSchemeForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Marking Criteria / Guide Text</label>
                    <textarea
                      rows={3}
                      value={markingSchemeForm.guideText}
                      onChange={e => setMarkingSchemeForm({ ...markingSchemeForm, guideText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 text-white">Save Marking Scheme</Button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
