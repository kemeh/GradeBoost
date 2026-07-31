import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, PlayCircle, FileText, Download, CheckCircle, 
  Clock, Bookmark, Award, Sparkles, Video, HelpCircle, 
  ChevronRight, CheckCircle2, Star, Layers, MessageSquare, 
  BarChart2, Search, Filter, Plus, Trash2, Edit3, Send, 
  Bot, GraduationCap, Calendar, Zap, Shield, FileCheck, 
  ArrowRight, RefreshCw, Trophy, Target, BookCheck, Eye, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, query, where, getDocs, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { LMSLesson, LMSUserProgress, LMSNote, DiscussionThread, TeacherVideo, TeacherPDF, TeacherQuiz, TeacherMockExam, MarkingSchemeItem } from '../types';
import { fetchPublishedLessons, fetchStudentLMSProgress, saveLessonProgress, fetchLessonNotes, saveLessonNote, deleteLessonNote } from '../services/lmsService';
import { toast } from 'react-hot-toast';

import { AIChatWindow } from '../components/GradeBoostAI/AIChatWindow';
import { AIQuizGenerator } from '../components/GradeBoostAI/AIQuizGenerator';
import { AIStudyPlanner } from '../components/GradeBoostAI/AIStudyPlanner';
import { AIProgrammingAssistant } from '../components/GradeBoostAI/AIProgrammingAssistant';
import { AILessonSummarizer } from '../components/GradeBoostAI/AILessonSummarizer';
import { AIWeaknessAnalyzer } from '../components/GradeBoostAI/AIWeaknessAnalyzer';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Main Section / Navigation Tab
  const [activeTab, setActiveTab] = useState<
    | 'overview' 
    | 'my_courses' 
    | 'continue_learning' 
    | 'study_plans' 
    | 'lessons' 
    | 'videos' 
    | 'notes' 
    | 'downloads' 
    | 'practice' 
    | 'mock_exams' 
    | 'past_questions' 
    | 'progress' 
    | 'achievements' 
    | 'certificates' 
    | 'forum' 
    | 'ai_tutor'
  >('overview');

  // Edulpha AI Studio Sub-Tab
  const [aiSubTab, setAiSubTab] = useState<'chat' | 'quiz' | 'planner' | 'code' | 'summarizer' | 'weakness'>('chat');

  // Loading & Search
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Data States
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [userProgress, setUserProgress] = useState<LMSUserProgress[]>([]);
  const [videos, setVideos] = useState<TeacherVideo[]>([]);
  const [pdfs, setPdfs] = useState<TeacherPDF[]>([]);
  const [personalNotes, setPersonalNotes] = useState<LMSNote[]>([]);
  const [mockExams, setMockExams] = useState<TeacherMockExam[]>([]);
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [markingSchemes, setMarkingSchemes] = useState<MarkingSchemeItem[]>([]);

  // Selected Lesson for Reader Modal
  const [selectedLesson, setSelectedLesson] = useState<LMSLesson | null>(null);

  // Video Player Modal
  const [activeVideo, setActiveVideo] = useState<TeacherVideo | null>(null);

  // New Note Modal
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // New Forum Post Modal
  const [showForumModal, setShowForumModal] = useState(false);
  const [forumTitle, setForumTitle] = useState('');
  const [forumSubject, setForumSubject] = useState('Computer Science');
  const [forumContent, setForumContent] = useState('');
  const [forumReplyText, setForumReplyText] = useState<{ [key: string]: string }>({});

  // AI Tutor State
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Hello! I am your 24/7 GCE AI Tutor. Ask me any question about Computer Science, ICT, Math, Physics, or GCE exam techniques!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Practice Questions Interactive State
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);

  // Sample Practice Questions
  const samplePracticeQuestions = [
    {
      id: 'q1',
      subject: 'Computer Science',
      questionText: 'What is the primary function of the Operating System CPU Scheduler?',
      options: [
        'A. To allocate CPU time slices to active processes efficiently',
        'B. To permanently store binary files on the hard disk',
        'C. To compile high-level source code into object code',
        'D. To route IP packets across local subnet gateways'
      ],
      correct: 'A',
      explanation: 'The CPU Scheduler determines which process runs when the CPU becomes available according to scheduling algorithms (e.g. Round Robin, FCFS).'
    },
    {
      id: 'q2',
      subject: 'Computer Science',
      questionText: 'Which data structure follows the Last-In, First-Out (LIFO) policy?',
      options: ['A. Queue', 'B. Stack', 'C. Binary Search Tree', 'D. Hash Table'],
      correct: 'B',
      explanation: 'A Stack operates on a LIFO principle where elements are pushed and popped from the top of the stack.'
    },
    {
      id: 'q3',
      subject: 'ICT',
      questionText: 'In computer networking, what does the acronym DHCP stand for?',
      options: [
        'A. Dynamic Host Configuration Protocol',
        'B. Direct Hardware Connection Provider',
        'C. Digital High-speed Control Protocol',
        'D. Domain Hosting Center Program'
      ],
      correct: 'A',
      explanation: 'DHCP dynamically assigns IP addresses and network configuration parameters to client devices on a TCP/IP network.'
    }
  ];

  // Study Plans Data
  const [studyPlanTasks, setStudyPlanTasks] = useState([
    { id: 't1', day: 'Monday', subject: 'Computer Science', topic: 'Data Structures & OOP', completed: true, estTime: '45 mins' },
    { id: 't2', day: 'Tuesday', subject: 'ICT', topic: 'OSI Model Layers 1-4', completed: true, estTime: '30 mins' },
    { id: 't3', day: 'Wednesday', subject: 'Mathematics', topic: 'Calculus & Integration', completed: false, estTime: '60 mins' },
    { id: 't4', day: 'Thursday', subject: 'Physics', topic: 'Electromagnetism', completed: false, estTime: '45 mins' },
    { id: 't5', day: 'Friday', subject: 'Computer Science', topic: 'Paper 2 Algorithm Design', completed: false, estTime: '60 mins' }
  ]);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  // Handle URL search params tab switching if provided
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && [
      'overview', 'my_courses', 'continue_learning', 'study_plans', 'lessons', 
      'videos', 'notes', 'downloads', 'practice', 'mock_exams', 'past_questions', 
      'progress', 'achievements', 'certificates', 'forum', 'ai_tutor'
    ].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const loadStudentData = async () => {
    setLoading(true);

    // Fetch published LMS lessons
    try {
      const lessonData = await fetchPublishedLessons();
      if (lessonData.length > 0) {
        setLessons(lessonData);
      } else {
        // Mock fallback lessons
        setLessons([
          {
            id: 'l1',
            title: 'Introduction to Data Structures & Algorithms',
            subject: 'Computer Science',
            topic: 'Data Structures',
            educationLevel: 'Advanced Level',
            format: 'video',
            difficulty: 'Intermediate',
            status: 'published',
            summary: 'Comprehensive breakdown of Arrays, Linked Lists, Stacks, Queues, and Trees.',
            content: 'Data structures store and organize data efficiently. A **Stack** uses LIFO, whereas a **Queue** uses FIFO.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            estimatedMinutes: 45
          },
          {
            id: 'l2',
            title: 'Computer Networks & The 7 OSI Model Layers',
            subject: 'ICT',
            topic: 'Networking',
            educationLevel: 'Ordinary Level',
            format: 'text',
            difficulty: 'Beginner',
            status: 'published',
            summary: 'Understand Physical, Data Link, Network, Transport, Session, Presentation, and Application layers.',
            content: 'The OSI model standardizes communication functions of a telecommunication system without regard to its underlying internal structure.',
            estimatedMinutes: 30
          },
          {
            id: 'l3',
            title: 'Boolean Algebra & Logic Gate Circuit Design',
            subject: 'Computer Science',
            topic: 'Digital Logic',
            educationLevel: 'Ordinary Level',
            format: 'text',
            difficulty: 'Intermediate',
            status: 'published',
            summary: 'Simplifying boolean expressions using Karnaugh Maps (K-Maps) and De Morgan Laws.',
            content: 'De Morgans laws state that NOT (A AND B) equals (NOT A) OR (NOT B).',
            estimatedMinutes: 40
          }
        ]);
      }
    } catch (e) {
      console.warn('Lessons fetch error:', e);
    }

    // Fetch user progress
    if (user?.uid) {
      try {
        const prog = await fetchStudentLMSProgress(user.uid);
        setUserProgress(prog);

        const notes = await fetchLessonNotes(user.uid);
        setPersonalNotes(notes);
      } catch (e) {
        console.warn('Progress fetch error:', e);
      }
    }

    // Subscribe to Videos
    const unsubVideos = onSnapshot(collection(db, 'lms_videos'), (snap) => {
      if (!snap.empty) {
        setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeacherVideo[]);
      } else {
        setVideos([
          {
            id: 'v1',
            title: 'Object-Oriented Programming Principles in C++',
            subject: 'Computer Science',
            topic: 'OOP Concepts',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '25 mins',
            description: 'Encapsulation, Polymorphism, Inheritance, and Abstraction explained with source code.'
          },
          {
            id: 'v2',
            title: 'SQL Database Design & Entity Relationship Diagrams',
            subject: 'ICT',
            topic: 'Databases',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '35 mins',
            description: 'Normalizing tables to 3NF and constructing ERDs for GCE ICT Paper 2.'
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
            title: 'GCE A-Level Computer Science 2026 Revision Guide',
            subject: 'Computer Science',
            topic: 'Revision Summary',
            fileUrl: '#',
            fileSize: '4.1 MB',
            isDownloadable: true,
            description: 'Complete high-yield revision formulas, pseudocode rules, and marking criteria.'
          },
          {
            id: 'p2',
            title: 'GCE O-Level ICT Key Definitions & Glossary',
            subject: 'ICT',
            topic: 'Definitions',
            fileUrl: '#',
            fileSize: '1.8 MB',
            isDownloadable: true,
            description: 'Master list of 150+ standard GCE ICT examination terms and definitions.'
          }
        ]);
      }
    });

    // Subscribe to Mock Exams
    const unsubExams = onSnapshot(collection(db, 'mock_exams'), (snap) => {
      if (!snap.empty) {
        setMockExams(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeacherMockExam[]);
      } else {
        setMockExams([
          {
            id: 'me1',
            title: '2026 GCE Ordinary Level Computer Science Paper 1 Mock',
            subject: 'Computer Science',
            paperType: 'Paper 1',
            durationMinutes: 90,
            totalMarks: 50,
            passPercentage: 50,
            isPublished: true,
            instructions: 'Contains 50 multiple choice questions under strict examination hall timing.'
          },
          {
            id: 'me2',
            title: '2026 GCE Advanced Level ICT Paper 2 Mock',
            subject: 'ICT',
            paperType: 'Paper 2',
            durationMinutes: 120,
            totalMarks: 100,
            passPercentage: 50,
            isPublished: true,
            instructions: 'Structural essay and problem-solving questions.'
          }
        ]);
      }
    });

    // Subscribe to Past Question Papers
    const unsubPast = onSnapshot(collection(db, 'question_papers'), (snap) => {
      if (!snap.empty) {
        setPastPapers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setPastPapers([
          { id: 'pp1', title: '2025 GCE A-Level Computer Science Paper 1', year: 2025, subject: 'Computer Science', paperType: 'Paper 1' },
          { id: 'pp2', title: '2024 GCE A-Level Computer Science Paper 2', year: 2024, subject: 'Computer Science', paperType: 'Paper 2' },
          { id: 'pp3', title: '2025 GCE O-Level ICT Paper 1', year: 2025, subject: 'ICT', paperType: 'Paper 1' }
        ]);
      }
    });

    // Subscribe to Forum Discussions
    const unsubDiscussions = onSnapshot(collection(db, 'discussions'), (snap) => {
      if (!snap.empty) {
        setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() })) as DiscussionThread[]);
      } else {
        setDiscussions([
          {
            id: 'd1',
            title: 'How do you convert hexadecimal fractional numbers to binary?',
            authorName: 'Jean-Paul Ngu',
            authorRole: 'student',
            authorId: 's1',
            subject: 'Computer Science',
            content: 'Can someone explain step by step how to convert 0.A4 16 into binary?',
            status: 'answered',
            replies: [
              {
                id: 'r1',
                authorName: 'Mr. Tabi (Teacher)',
                authorRole: 'teacher',
                content: 'Each hex digit converts directly to 4 binary bits: A = 1010, 4 = 0100. So 0.A4_16 = 0.10100100_2.',
                createdAt: new Date().toISOString()
              }
            ]
          }
        ]);
      }
    });

    setLoading(false);

    return () => {
      unsubVideos();
      unsubPdfs();
      unsubExams();
      unsubPast();
      unsubDiscussions();
    };
  };

  // Lesson completion handler
  const handleToggleLessonComplete = async (lessonId: string) => {
    if (!user?.uid) {
      toast.error('Please log in to save your learning progress.');
      return;
    }
    const currentProg = userProgress.find(p => p.lessonId === lessonId);
    const newStatus = !currentProg?.completed;

    try {
      await saveLessonProgress(user.uid, lessonId, {
        completed: newStatus,
        lastAccessedAt: new Date().toISOString()
      });
      toast.success(newStatus ? 'Lesson marked as completed! +25 XP' : 'Lesson status updated.');
      
      setUserProgress(prev => {
        const existingIdx = prev.findIndex(p => p.lessonId === lessonId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], completed: newStatus };
          return updated;
        } else {
          return [...prev, { id: Date.now().toString(), userId: user.uid, lessonId, completed: newStatus, timeSpentSeconds: 300, createdAt: new Date().toISOString(), lastAccessedAt: new Date().toISOString() }];
        }
      });
    } catch (e: any) {
      toast.error('Could not save progress.');
    }
  };

  // Personal Note Handlers
  const handleSavePersonalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast.error('Please enter a note title and content.');
      return;
    }
    if (!user?.uid) return;

    try {
      const noteId = await saveLessonNote(user.uid, selectedLesson?.id || 'general', {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim()
      });
      toast.success('Note saved successfully!');
      setShowNoteModal(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      
      setPersonalNotes(prev => [
        { id: noteId, userId: user.uid, lessonId: selectedLesson?.id || 'general', title: newNoteTitle.trim(), content: newNoteContent.trim(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...prev
      ]);
    } catch (e: any) {
      toast.error('Failed to save note.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteLessonNote(noteId);
      setPersonalNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Note deleted.');
    } catch (e: any) {
      toast.error('Failed to delete note.');
    }
  };

  const handleDownloadNotePDF = (note: LMSNote) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`Edulpha Student Note: ${note.title}`, 14, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 14, 28);
    doc.text(`Student: ${user?.name || user?.email || 'Edulpha Scholar'}`, 14, 34);
    
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(11);
    const splitContent = doc.splitTextToSize(note.content, 180);
    doc.text(splitContent, 14, 46);

    doc.save(`${note.title.toLowerCase().replace(/\s+/g, '_')}_note.pdf`);
    toast.success('Downloaded note PDF!');
  };

  // AI Tutor Send Handler
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userText = aiInput.trim();
    setAiInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAiMessages(prev => [...prev, { sender: 'user', text: userText, time: timeStr }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          subject: user?.subject || selectedSubject,
          topic: selectedLesson?.topic || 'GCE Revision'
        })
      });

      const data = await res.json();
      const replyText = data.reply || "I am ready to help you revise!";
      setAiMessages(prev => [
        ...prev,
        { sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I am having a brief offline moment. Remember to break your GCE topics into key definitions, past paper drills, and checking marking schemes!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Forum Creation
  const handleCreateForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumTitle.trim() || !forumContent.trim()) {
      toast.error('Please enter a title and content.');
      return;
    }
    try {
      await addDoc(collection(db, 'discussions'), {
        title: forumTitle.trim(),
        subject: forumSubject,
        content: forumContent.trim(),
        authorName: user?.name || user?.email?.split('@')[0] || 'Student',
        authorRole: 'student',
        authorId: user?.uid || 'anon',
        status: 'pending',
        replies: [],
        createdAt: serverTimestamp()
      });
      toast.success('Question posted to forum!');
      setShowForumModal(false);
      setForumTitle('');
      setForumContent('');
    } catch (e: any) {
      toast.error('Failed to post question.');
    }
  };

  // Forum Reply
  const handleForumReply = async (threadId: string) => {
    const text = forumReplyText[threadId];
    if (!text || !text.trim()) return;

    try {
      const thread = discussions.find(d => d.id === threadId);
      const existingReplies = thread?.replies || [];
      const newReply = {
        id: Date.now().toString(),
        authorName: user?.name || 'Student',
        authorRole: 'student',
        content: text.trim(),
        createdAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'discussions', threadId), {
        replies: [...existingReplies, newReply]
      });

      toast.success('Reply added!');
      setForumReplyText(prev => ({ ...prev, [threadId]: '' }));
    } catch (e: any) {
      toast.error('Failed to add reply.');
    }
  };

  // Certificate PDF Generator
  const handleDownloadCertificate = (subjectName: string) => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    
    // Border design
    doc.setDrawColor(79, 70, 229); // Indigo
    doc.setLineWidth(4);
    doc.rect(10, 10, 277, 190);
    
    doc.setDrawColor(224, 231, 255);
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(28);
    doc.text('EDULPHA ACADEMIC CERTIFICATE', 148, 45, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('OFFICIAL GCE ADVANCED PREPARATION PROGRAM', 148, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.text('This is to certify that', 148, 80, { align: 'center' });

    // Student Name
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text((user?.name || user?.email || 'Edulpha Scholar').toUpperCase(), 148, 96, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`has successfully satisfied all learning modules, mock examinations, and practice criteria in:`, 148, 112, { align: 'center' });

    // Subject Name
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text(subjectName.toUpperCase(), 148, 128, { align: 'center' });

    // Footer signatures & date
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Issued Date: ${today}`, 40, 165);
    doc.text(`Verification ID: EDU-${Math.floor(100000 + Math.random() * 900000)}`, 40, 172);

    doc.text(`Edulpha Academic Board`, 220, 165, { align: 'center' });
    doc.line(180, 160, 260, 160);

    doc.save(`Edulpha_Certificate_${subjectName.replace(/\s+/g, '_')}.pdf`);
    toast.success(`Downloaded ${subjectName} Certificate!`);
  };

  // Helper filter
  const filterBySubject = <T extends { subject?: string; title?: string }>(items: T[]) => {
    return items.filter(item => {
      const matchSub = selectedSubject === 'All' || item.subject === selectedSubject;
      const matchQuery = !searchQuery || (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSub && matchQuery;
    });
  };

  const completedLessonsCount = userProgress.filter(p => p.completed).length;
  const totalLessonsCount = lessons.length || 1;
  const overallProgressPercent = Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100));

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* TOP HERO HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} /> Student Dashboard
                </span>
                <span className="text-xs text-indigo-300 font-medium">GCE Target 2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'Scholar'} 👋
              </h1>
              <p className="text-indigo-200 text-xs md:text-sm max-w-xl">
                Master your GCE subjects with lessons, past papers, mock exams, personal notes, study plans, and your 24/7 AI tutor.
              </p>
            </div>

            {/* Overall Progress Widget */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 min-w-[220px]">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.2)" strokeWidth="5" fill="none" />
                  <circle 
                    cx="28" cy="28" r="22" 
                    stroke="#818cf8" strokeWidth="5" fill="none"
                    strokeDasharray={138}
                    strokeDashoffset={138 - (138 * overallProgressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{overallProgressPercent}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Overall Mastery</span>
                <p className="text-sm font-extrabold text-white">{completedLessonsCount} / {lessons.length} Lessons</p>
                <p className="text-[10px] text-indigo-300">Keep up the momentum!</p>
              </div>
            </div>
          </div>
        </div>

        {/* 15 NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGridIcon },
            { id: 'my_courses', label: 'My Courses', icon: BookOpen },
            { id: 'continue_learning', label: 'Continue Learning', icon: PlayCircle },
            { id: 'study_plans', label: 'Study Plans', icon: Calendar },
            { id: 'lessons', label: 'Lessons', icon: Layers },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'notes', label: 'My Notes', icon: Edit3 },
            { id: 'downloads', label: 'Downloads', icon: Download },
            { id: 'practice', label: 'Practice Questions', icon: CheckCircle2 },
            { id: 'mock_exams', label: 'Mock Exams', icon: Award },
            { id: 'past_questions', label: 'Past Questions', icon: FileText },
            { id: 'progress', label: 'Analytics & Progress', icon: BarChart2 },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'certificates', label: 'Certificates', icon: FileCheck },
            { id: 'forum', label: 'Discussion Forum', icon: MessageSquare },
            { id: 'ai_tutor', label: '24/7 AI Tutor', icon: Bot }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* GLOBAL SEARCH & SUBJECT FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search topics, lessons, past papers, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none w-full sm:w-auto"
            >
              <option value="All">All Subjects</option>
              <option value="Computer Science">Computer Science</option>
              <option value="ICT">ICT</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </select>
          </div>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 space-y-2 border-indigo-100 bg-indigo-50/30">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lessons Done</span>
                <p className="text-2xl font-black text-indigo-900">{completedLessonsCount} / {lessons.length}</p>
                <p className="text-[10px] text-indigo-600 font-bold">{overallProgressPercent}% Complete</p>
              </Card>

              <Card className="p-5 space-y-2 border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Practice Drills</span>
                <p className="text-2xl font-black text-slate-900">{practiceScore} Completed</p>
                <p className="text-[10px] text-emerald-600 font-bold">+150 XP Earned</p>
              </Card>

              <Card className="p-5 space-y-2 border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daily Streak</span>
                <p className="text-2xl font-black text-amber-600 flex items-center gap-1.5">
                  <Zap size={20} fill="currentColor" /> 7 Days
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Active learner streak</p>
              </Card>

              <Card className="p-5 space-y-2 border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saved Notes</span>
                <p className="text-2xl font-black text-slate-900">{personalNotes.length}</p>
                <p className="text-[10px] text-slate-500 font-medium">Personal revision notes</p>
              </Card>
            </div>

            {/* Continue Learning Widget */}
            {lessons.length > 0 && (
              <Card className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <PlayCircle size={14} /> Resume Next Module
                  </span>
                  <span className="text-xs text-indigo-300 font-medium">{lessons[0].estimatedMinutes || 30} mins remaining</span>
                </div>

                <div className="space-y-1">
                  <Badge variant="indigo">{lessons[0].subject}</Badge>
                  <h3 className="text-xl font-bold">{lessons[0].title}</h3>
                  <p className="text-xs text-indigo-200 line-clamp-2">{lessons[0].summary}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button 
                    onClick={() => {
                      setSelectedLesson(lessons[0]);
                      setActiveTab('lessons');
                    }} 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs gap-2 rounded-xl"
                  >
                    Start Reading Lesson <ArrowRight size={14} />
                  </Button>
                  <Button onClick={() => setActiveTab('ai_tutor')} variant="ghost" className="text-indigo-300 text-xs gap-1.5 hover:text-white">
                    <Bot size={15} /> Ask AI Tutor about this
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card onClick={() => setActiveTab('study_plans')} className="p-5 cursor-pointer hover:border-indigo-400 transition-all space-y-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-xl">
                  <Calendar size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Weekly Study Plan</h4>
                <p className="text-xs text-slate-500">Track scheduled revision topics and daily study goals.</p>
              </Card>

              <Card onClick={() => setActiveTab('practice')} className="p-5 cursor-pointer hover:border-indigo-400 transition-all space-y-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-xl">
                  <CheckCircle2 size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Practice Drills</h4>
                <p className="text-xs text-slate-500">Solve topic-wise standard GCE multiple choice questions.</p>
              </Card>

              <Card onClick={() => setActiveTab('ai_tutor')} className="p-5 cursor-pointer hover:border-indigo-400 transition-all space-y-3">
                <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-xl">
                  <Bot size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">24/7 AI Tutor</h4>
                <p className="text-xs text-slate-500">Get step-by-step explanations for complex GCE questions.</p>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: MY COURSES */}
        {activeTab === 'my_courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'cs', title: 'Computer Science (795)', level: 'Advanced Level', teacher: 'Mr. Tabi', progress: 65, topicsCount: 18, color: 'from-indigo-600 to-slate-900' },
              { id: 'ict', title: 'Information & Communication Tech (595)', level: 'Ordinary Level', teacher: 'Mrs. Fon', progress: 80, topicsCount: 14, color: 'from-blue-600 to-indigo-900' },
              { id: 'math', title: 'Further Mathematics (775)', level: 'Advanced Level', teacher: 'Dr. Ngu', progress: 40, topicsCount: 22, color: 'from-purple-600 to-slate-900' },
              { id: 'phy', title: 'Physics (780)', level: 'Advanced Level', teacher: 'Eng. Nkwa', progress: 50, topicsCount: 16, color: 'from-slate-800 to-slate-900' }
            ].map(course => (
              <Card key={course.id} className="p-6 space-y-5 border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="indigo">{course.level}</Badge>
                    <h3 className="text-lg font-black text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Lead Tutor: {course.teacher}</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                    {course.topicsCount} Topics
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Course Completion</span>
                    <span className="text-indigo-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button 
                    onClick={() => {
                      setSelectedSubject(course.title.includes('Computer') ? 'Computer Science' : 'ICT');
                      setActiveTab('lessons');
                    }} 
                    size="sm" 
                    className="bg-indigo-600 text-white font-bold gap-1 rounded-xl"
                  >
                    Open Course Lessons <ChevronRight size={14} />
                  </Button>
                  <Button onClick={() => handleDownloadCertificate(course.title)} variant="ghost" size="sm" className="text-xs text-slate-600 gap-1">
                    <FileCheck size={14} /> Certificate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: CONTINUE LEARNING */}
        {activeTab === 'continue_learning' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle className="text-indigo-600" size={18} /> Resume Your In-Progress Study Modules
            </h3>

            {lessons.map(lesson => {
              const prog = userProgress.find(p => p.lessonId === lesson.id);
              return (
                <Card key={lesson.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{lesson.subject}</Badge>
                      {prog?.completed ? <Badge variant="success">Completed</Badge> : <Badge variant="warning">In Progress</Badge>}
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{lesson.title}</h4>
                    <p className="text-xs text-slate-500">{lesson.summary}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setActiveTab('lessons');
                      }} 
                      size="sm" 
                      className="bg-indigo-600 text-white font-bold gap-1.5 rounded-xl"
                    >
                      <PlayCircle size={14} /> {prog?.completed ? 'Revisit Lesson' : 'Resume Lesson'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 4: STUDY PLANS */}
        {activeTab === 'study_plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={20} /> Weekly Revision Schedule
                </h3>
                <p className="text-xs text-slate-500">Structured daily study schedule for effective GCE preparation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPlanTasks.map((task, idx) => (
                <Card key={task.id} className="p-5 flex items-center justify-between border-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setStudyPlanTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                        toast.success(task.completed ? 'Task uncompleted' : 'Study task completed! +10 XP');
                      }}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                        task.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 hover:border-indigo-400"
                      )}
                    >
                      {task.completed && <CheckCircle size={14} />}
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{task.day} • {task.subject}</span>
                      <h4 className={cn("text-sm font-bold text-slate-900", task.completed && "line-through text-slate-400")}>
                        {task.topic}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{task.estTime}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LESSONS */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {selectedLesson ? (
              <Card className="p-6 md:p-8 space-y-6">
                <button 
                  onClick={() => setSelectedLesson(null)} 
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  ← Back to Lessons List
                </button>

                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{selectedLesson.subject}</Badge>
                    <Badge variant="secondary">{selectedLesson.topic}</Badge>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedLesson.title}</h2>
                  <p className="text-xs text-slate-500">Estimated reading time: {selectedLesson.estimatedMinutes || 30} mins</p>
                </div>

                <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4">
                  <p className="font-semibold text-slate-700">{selectedLesson.summary}</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 font-normal">
                    {selectedLesson.content || 'Lesson study content text goes here.'}
                  </div>
                </div>

                {selectedLesson.videoUrl && (
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                      <Video size={16} /> Embedded Video Tutorial Available
                    </span>
                    <a href={selectedLesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">
                      Watch Video →
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => handleToggleLessonComplete(selectedLesson.id)} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 rounded-xl"
                  >
                    <CheckCircle2 size={16} /> Mark Lesson as Complete
                  </Button>

                  <Button onClick={() => setShowNoteModal(true)} variant="outline" className="text-xs gap-1.5 rounded-xl">
                    <Edit3 size={15} /> Take Personal Note
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterBySubject(lessons).map(lesson => {
                  const prog = userProgress.find(p => p.lessonId === lesson.id);
                  return (
                    <Card key={lesson.id} className="p-6 space-y-4 hover:border-indigo-300 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Badge variant="indigo">{lesson.subject}</Badge>
                          <h4 className="text-base font-bold text-slate-900">{lesson.title}</h4>
                        </div>
                        {prog?.completed && <CheckCircle className="text-emerald-500" size={20} />}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{lesson.summary}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <span>{lesson.estimatedMinutes || 30} mins</span>
                        <Button 
                          onClick={() => setSelectedLesson(lesson)} 
                          size="sm" 
                          className="bg-indigo-600 text-white font-bold rounded-xl"
                        >
                          Read Lesson
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBySubject(videos).map(vid => (
              <Card key={vid.id} className="p-5 space-y-3">
                <div 
                  onClick={() => setActiveVideo(vid)} 
                  className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center text-white cursor-pointer group"
                >
                  <PlayCircle size={44} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold">
                    {vid.duration || '20 mins'}
                  </span>
                </div>

                <div className="space-y-1">
                  <Badge variant="indigo">{vid.subject}</Badge>
                  <h4 className="text-sm font-bold text-slate-900">{vid.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{vid.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 7: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="text-indigo-600" size={20} /> Personal Revision Notes
              </h3>
              <Button onClick={() => setShowNoteModal(true)} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <Plus size={16} /> Create Note
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalNotes.map(note => (
                <Card key={note.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-base font-bold text-slate-900">{note.title}</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDownloadNotePDF(note)} className="text-indigo-600 hover:text-indigo-800" title="Download PDF">
                        <Download size={16} />
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{note.content}</p>

                  <span className="text-[10px] text-slate-400 block text-right">
                    Saved {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </Card>
              ))}

              {personalNotes.length === 0 && (
                <div className="col-span-full py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                  <Edit3 className="mx-auto text-slate-300" size={40} />
                  <p className="text-sm font-bold text-slate-600">No notes saved yet.</p>
                  <Button onClick={() => setShowNoteModal(true)} size="sm" className="bg-indigo-600 text-white">
                    Create First Note
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBySubject(pdfs).map(pdf => (
              <Card key={pdf.id} className="p-5 space-y-3">
                <div className="p-3 bg-red-50 text-red-600 w-fit rounded-xl">
                  <FileText size={24} />
                </div>
                <div className="space-y-1">
                  <Badge variant="neutral">{pdf.subject}</Badge>
                  <h4 className="text-sm font-bold text-slate-900">{pdf.title}</h4>
                  <p className="text-xs text-slate-500">{pdf.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{pdf.fileSize || 'PDF'}</span>
                  <a href={pdf.fileUrl || '#'} download target="_blank" rel="noreferrer" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                    <Download size={14} /> Download File
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 9: PRACTICE QUESTIONS */}
        {activeTab === 'practice' && (
          <Card className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Practice Question {practiceIdx + 1} of {samplePracticeQuestions.length}
              </span>
              <Badge variant="indigo">{samplePracticeQuestions[practiceIdx].subject}</Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {samplePracticeQuestions[practiceIdx].questionText}
            </h3>

            <div className="space-y-2.5">
              {samplePracticeQuestions[practiceIdx].options.map((opt, i) => {
                const letter = ['A', 'B', 'C', 'D'][i];
                const isSelected = selectedOpt === letter;
                const isCorrectOpt = samplePracticeQuestions[practiceIdx].correct === letter;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isAnswered) return;
                      setSelectedOpt(letter);
                      setIsAnswered(true);
                      if (isCorrectOpt) setPracticeScore(s => s + 1);
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between",
                      !isAnswered && "hover:border-indigo-400 bg-slate-50 border-slate-200",
                      isAnswered && isCorrectOpt && "bg-emerald-50 border-emerald-500 text-emerald-900",
                      isAnswered && isSelected && !isCorrectOpt && "bg-red-50 border-red-500 text-red-900"
                    )}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrectOpt && <CheckCircle className="text-emerald-600" size={16} />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs space-y-1">
                <span className="font-bold text-indigo-900">Explanation:</span>
                <p className="text-slate-700">{samplePracticeQuestions[practiceIdx].explanation}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button 
                onClick={() => {
                  setPracticeIdx((practiceIdx + 1) % samplePracticeQuestions.length);
                  setSelectedOpt(null);
                  setIsAnswered(false);
                }} 
                className="bg-indigo-600 text-white font-bold text-xs gap-1 rounded-xl"
              >
                Next Question →
              </Button>
            </div>
          </Card>
        )}

        {/* TAB 10: MOCK EXAMS */}
        {activeTab === 'mock_exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterBySubject(mockExams).map(exam => (
              <Card key={exam.id} className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{exam.subject}</Badge>
                    <Badge variant="secondary">{exam.paperType}</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{exam.title}</h4>
                  <p className="text-xs text-slate-500">{exam.instructions}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                  <span>Duration: {exam.durationMinutes} mins</span>
                  <span>Total Marks: {exam.totalMarks}</span>
                </div>

                <Button onClick={() => navigate('/exams')} className="w-full bg-indigo-600 text-white font-bold rounded-xl">
                  Take Mock Exam Now
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 11: PAST QUESTIONS */}
        {activeTab === 'past_questions' && (
          <div className="space-y-4">
            {filterBySubject(pastPapers).map(paper => (
              <Card key={paper.id} className="p-5 flex items-center justify-between border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{paper.subject}</Badge>
                    <Badge variant="secondary">{paper.year}</Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{paper.title}</h4>
                </div>
                <Button onClick={() => navigate('/practice')} size="sm" className="bg-indigo-600 text-white font-bold rounded-xl">
                  Open Paper
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 12: PROGRESS & ANALYTICS */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 space-y-2 border-indigo-100 bg-indigo-50/20">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Accuracy</span>
                <p className="text-3xl font-black text-indigo-900">78%</p>
                <p className="text-xs text-emerald-600 font-bold">Top 10% in Edulpha</p>
              </Card>

              <Card className="p-6 space-y-2 border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Drills</span>
                <p className="text-3xl font-black text-slate-900">24 Sessions</p>
                <p className="text-xs text-slate-500">12 hours total study time</p>
              </Card>

              <Card className="p-6 space-y-2 border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Readiness</span>
                <p className="text-3xl font-black text-emerald-600">High (GCE Ready)</p>
                <p className="text-xs text-emerald-600 font-bold">Predicted Grade: A</p>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 13: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: '7-Day Streak Master', desc: 'Studied 7 days in a row without missing.', icon: Zap, unlocked: true },
              { title: 'Quiz Whiz', desc: 'Achieved 100% score on 5 consecutive drills.', icon: Trophy, unlocked: true },
              { title: 'GCE Scholar', desc: 'Completed 20 full GCE mock exam papers.', icon: GraduationCap, unlocked: false }
            ].map((ach, i) => (
              <Card key={i} className={cn("p-6 space-y-3", !ach.unlocked && "opacity-50")}>
                <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-xl">
                  <ach.icon size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900">{ach.title}</h4>
                <p className="text-xs text-slate-500">{ach.desc}</p>
                <Badge variant={ach.unlocked ? 'success' : 'neutral'}>{ach.unlocked ? 'Unlocked' : 'Locked'}</Badge>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 14: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Computer Science (795)', 'Information & Communication Tech (595)'].map((subject, idx) => (
              <Card key={idx} className="p-6 space-y-4 border-indigo-100">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileCheck size={28} />
                  </div>
                  <Badge variant="success">Verified Certificate</Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">{subject}</h4>
                  <p className="text-xs text-slate-500">Mastery Certificate for GCE Preparation</p>
                </div>

                <Button onClick={() => handleDownloadCertificate(subject)} className="w-full bg-indigo-600 text-white font-bold rounded-xl gap-2">
                  <Download size={16} /> Download PDF Certificate
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 15: DISCUSSION FORUM */}
        {activeTab === 'forum' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="text-indigo-600" size={20} /> Community Q&A Board
              </h3>
              <Button onClick={() => setShowForumModal(true)} size="sm" className="bg-indigo-600 text-white gap-1.5 rounded-xl">
                <Plus size={16} /> Ask Question
              </Button>
            </div>

            <div className="space-y-4">
              {filterBySubject(discussions).map(thread => (
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
                      <span className="text-xs text-slate-400 block">Asked by {thread.authorName}</span>
                    </div>
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

                  {/* Reply form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write your answer..."
                      value={forumReplyText[thread.id] || ''}
                      onChange={e => setForumReplyText({ ...forumReplyText, [thread.id]: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                    />
                    <Button onClick={() => handleForumReply(thread.id)} size="sm" className="bg-indigo-600 text-white">
                      Reply
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 16: EDULPHA AI STUDIO */}
        {activeTab === 'ai_tutor' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* AI Studio Navigation Sub-Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edulpha AI Studio</h3>
                  <p className="text-[11px] text-slate-500">Cameroon GCE Personalized Intelligent Learning Assistant</p>
                </div>
              </div>

              {/* Sub-Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setAiSubTab('chat')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${aiSubTab === 'chat' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Bot size={15} /> 24/7 AI Tutor
                </button>
                <button
                  onClick={() => setAiSubTab('quiz')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${aiSubTab === 'quiz' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <BookOpen size={15} /> AI Quiz Generator
                </button>
                <button
                  onClick={() => setAiSubTab('planner')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${aiSubTab === 'planner' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Calendar size={15} /> AI Study Planner
                </button>
                <button
                  onClick={() => setAiSubTab('code')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${aiSubTab === 'code' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Zap size={15} /> Programming Assistant
                </button>
                <button
                  onClick={() => setAiSubTab('summarizer')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${aiSubTab === 'summarizer' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <FileText size={15} /> Lesson Summarizer
                </button>
                <button
                  onClick={() => setAiSubTab('weakness')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${aiSubTab === 'weakness' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Target size={15} /> Weakness & Insights
                </button>
              </div>
            </div>

            {/* Sub-Tab Component Displays */}
            {aiSubTab === 'chat' && (
              <AIChatWindow 
                userId={user?.uid || 'anon'} 
                defaultSubject={selectedSubject !== 'All' ? selectedSubject : 'Computer Science'}
                educationLevel="Ordinary Level"
                onSelectAction={(act) => {
                  if (act === 'quiz') setAiSubTab('quiz');
                  if (act === 'planner') setAiSubTab('planner');
                  if (act === 'summarizer') setAiSubTab('summarizer');
                }}
              />
            )}

            {aiSubTab === 'quiz' && (
              <AIQuizGenerator 
                userId={user?.uid || 'anon'}
                defaultSubject={selectedSubject !== 'All' ? selectedSubject : 'Computer Science'}
              />
            )}

            {aiSubTab === 'planner' && (
              <AIStudyPlanner 
                userId={user?.uid || 'anon'}
                defaultSubject={selectedSubject !== 'All' ? selectedSubject : 'Computer Science'}
              />
            )}

            {aiSubTab === 'code' && (
              <AIProgrammingAssistant />
            )}

            {aiSubTab === 'summarizer' && (
              <AILessonSummarizer 
                userId={user?.uid || 'anon'}
                defaultSubject={selectedSubject !== 'All' ? selectedSubject : 'Computer Science'}
              />
            )}

            {aiSubTab === 'weakness' && (
              <AIWeaknessAnalyzer 
                userId={user?.uid || 'anon'}
                defaultSubject={selectedSubject !== 'All' ? selectedSubject : 'Computer Science'}
                onLaunchTask={(type) => {
                  if (type === 'quiz') setAiSubTab('quiz');
                  if (type === 'lesson') setAiSubTab('summarizer');
                }}
              />
            )}
          </div>
        )}

        {/* MODAL: PERSONAL NOTE */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Create Personal Revision Note</h3>
                <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePersonalNote} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label>Note Title</label>
                  <input
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={e => setNewNoteTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="e.g. Quick Summary of CPU Scheduling Algorithms"
                  />
                </div>

                <div className="space-y-1">
                  <label>Note Content</label>
                  <textarea
                    rows={5}
                    required
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Write key definitions, equations, or pseudocode..."
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 text-white font-bold rounded-xl">Save Note</Button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FORUM QUESTION */}
        {showForumModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Ask Community Forum Question</h3>
                <button onClick={() => setShowForumModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateForumPost} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label>Subject</label>
                  <select
                    value={forumSubject}
                    onChange={e => setForumSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Question Title</label>
                  <input
                    type="text"
                    required
                    value={forumTitle}
                    onChange={e => setForumTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="e.g. What is the difference between synchronous and asynchronous transfer?"
                  />
                </div>

                <div className="space-y-1">
                  <label>Explanation & Details</label>
                  <textarea
                    rows={4}
                    required
                    value={forumContent}
                    onChange={e => setForumContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Describe what you are trying to understand..."
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 text-white font-bold rounded-xl">Post Question</Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LayoutGridIcon(props: any) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
