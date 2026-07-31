import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, PlayCircle, FileText, Download, CheckCircle, 
  Clock, Bookmark, ArrowLeft, Award, Sparkles, Code, Video, Music, 
  HelpCircle, ChevronRight, CheckCircle2, Save, Star, RotateCcw, 
  Layers, FolderTree, BookCheck, ShieldCheck, FileCheck, Share2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { 
  LMSLesson, LMSUserProgress, LMSLessonFormat, LMSNote 
} from '../types';
import { 
  fetchPublishedLessons, getLessonById, fetchStudentLMSProgress, 
  saveLessonProgress, fetchUserBookmarks, toggleUserBookmark, 
  fetchLessonNotes, saveLessonNote, deleteLessonNote 
} from '../services/lmsService';
import { toast } from 'react-hot-toast';

export default function StudentLMSPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lessons & Progress State
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [userProgress, setUserProgress] = useState<LMSUserProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Lesson (if viewing a lesson)
  const [activeLesson, setActiveLesson] = useState<LMSLesson | null>(null);

  // Search & Filter filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Ordinary Level');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // Active Lesson Tabs: 'lesson' | 'quiz' | 'notes' | 'attachments'
  const [activeLessonTab, setActiveLessonTab] = useState<'lesson' | 'quiz' | 'notes' | 'attachments'>('lesson');

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Student Notes state
  const [notesList, setNotesList] = useState<LMSNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Objectives checked state
  const [checkedObjectives, setCheckedObjectives] = useState<Record<number, boolean>>({});

  // Study timer
  const [studyStartTime] = useState<number>(Date.now());

  useEffect(() => {
    loadPortalData();
  }, [user]);

  useEffect(() => {
    const lessonIdParam = searchParams.get('lessonId');
    if (lessonIdParam && lessons.length > 0) {
      const found = lessons.find(l => l.id === lessonIdParam);
      if (found) {
        handleSelectLesson(found);
      }
    }
  }, [searchParams, lessons]);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const lData = await fetchPublishedLessons();
      setLessons(lData);

      if (user?.uid) {
        const [pData, bData] = await Promise.all([
          fetchStudentLMSProgress(user.uid),
          fetchUserBookmarks(user.uid)
        ]);
        setUserProgress(pData);
        setBookmarks(bData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load learning resources.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = async (lesson: LMSLesson) => {
    setActiveLesson(lesson);
    setSearchParams({ lessonId: lesson.id });
    setActiveLessonTab('lesson');
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setCheckedObjectives({});

    if (user?.uid) {
      const nData = await fetchLessonNotes(user.uid, lesson.id);
      setNotesList(nData);
    }
  };

  const handleToggleBookmark = async (lessonId: string) => {
    if (!user?.uid) return;
    try {
      const isBookmarked = await toggleUserBookmark(user.uid, lessonId);
      if (isBookmarked) {
        setBookmarks(prev => [...prev, lessonId]);
        toast.success("Lesson bookmarked!");
      } else {
        setBookmarks(prev => prev.filter(b => b !== lessonId));
        toast.success("Bookmark removed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson || !user?.uid) return;
    const additionalTime = Math.round((Date.now() - studyStartTime) / 1000);

    try {
      await saveLessonProgress(
        user.uid,
        activeLesson.id,
        activeLesson.subject,
        activeLesson.topic,
        true,
        100,
        additionalTime,
        quizScore !== null ? { [activeLesson.id]: quizScore } : undefined
      );

      toast.success("Lesson marked as complete! +50 XP");
      loadPortalData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to record completion.");
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !activeLesson || !user?.uid) return;
    try {
      const noteId = await saveLessonNote(user.uid, activeLesson.id, newNoteText.trim());
      setNotesList(prev => [
        { id: noteId, userId: user.uid, lessonId: activeLesson.id, noteText: newNoteText.trim(), createdAt: new Date() },
        ...prev
      ]);
      setNewNoteText('');
      toast.success("Note saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save note.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteLessonNote(noteId);
      setNotesList(prev => prev.filter(n => n.id !== noteId));
      toast.success("Note deleted.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQuiz = () => {
    if (!activeLesson?.quizzes?.[0]) return;
    const questions = activeLesson.quizzes[0].questions;
    let correctCount = 0;

    questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (q.type === 'mcq' && ans === q.correctAnswer) {
        correctCount++;
      } else if (q.type === 'true_false' && ans === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);
    toast.success(`Quiz Complete! Score: ${scorePct}%`);

    if (user?.uid) {
      saveLessonProgress(
        user.uid,
        activeLesson.id,
        activeLesson.subject,
        activeLesson.topic,
        scorePct >= 70,
        scorePct,
        0,
        { [qIdKey(activeLesson.id)]: scorePct }
      );
    }
  };

  const qIdKey = (id: string) => `quiz_${id}`;

  const handleDownloadCertificate = () => {
    if (!activeLesson || !user) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Certificate Background & Decorative border
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 297, 210, 'F');

    doc.setDrawColor(79, 70, 229); // Indigo border
    doc.setLineWidth(4);
    doc.rect(10, 10, 277, 190);

    doc.setDrawColor(224, 231, 255);
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);

    // Title & Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(30, 27, 75);
    doc.text('CERTIFICATE OF ACHIEVEMENT', 148.5, 45, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 102, 241);
    doc.text('GradeBoost60 Digital Learning Management System', 148.5, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('This is proudly presented to', 148.5, 75, { align: 'center' });

    // Student Name
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(user.displayName || 'GradeBoost60 Scholar', 148.5, 92, { align: 'center' });

    // Achievement Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`For successfully mastering the educational topic:`, 148.5, 110, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`"${activeLesson.title}" (${activeLesson.subject})`, 148.5, 122, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Level: ${activeLesson.educationLevel} • Instructor: ${activeLesson.teacher || 'GradeBoost60 Faculty'}`, 148.5, 132, { align: 'center' });

    // Footer signatures & Seals
    doc.setDrawColor(203, 213, 225);
    doc.line(40, 170, 100, 170);
    doc.text('Academic Director', 70, 177, { align: 'center' });

    doc.line(197, 170, 257, 170);
    doc.text('GradeBoost60 Admin', 227, 177, { align: 'center' });

    doc.save(`GradeBoost60_Certificate_${activeLesson.title.replace(/\s+/g, '_')}.pdf`);
    toast.success("Certificate downloaded!");
  };

  // Extract subjects & topics
  const availableLevels = Array.from(new Set(['Ordinary Level', 'Advanced Level', ...lessons.map(l => l.educationLevel)]));
  const availableSubjects = Array.from(new Set(['All', ...lessons.map(l => l.subject)]));
  const availableTopics = Array.from(new Set(['All', ...lessons.filter(l => selectedSubject === 'All' || l.subject === selectedSubject).map(l => l.topic)]));

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    const matchesLevel = l.educationLevel === selectedLevel;
    const matchesSubject = selectedSubject === 'All' || l.subject === selectedSubject;
    const matchesTopic = selectedTopic === 'All' || l.topic === selectedTopic;
    const matchesFormat = selectedFormat === 'All' || l.format === selectedFormat;
    const matchesQuery = searchQuery === '' || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesSubject && matchesTopic && matchesFormat && matchesQuery;
  });

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(p => p.lessonId === lessonId && p.completed);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 lg:ml-72 pt-24 lg:pt-12 p-6 lg:p-12 space-y-8">
        {/* IF VIEWING AN ACTIVE LESSON */}
        {activeLesson ? (
          <div className="space-y-6">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setActiveLesson(null); setSearchParams({}); }}
                className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to LMS Portal
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleBookmark(activeLesson.id)}
                  className={cn(
                    "rounded-xl text-xs font-bold flex items-center gap-1.5",
                    bookmarks.includes(activeLesson.id) ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Bookmark size={14} className={bookmarks.includes(activeLesson.id) ? "fill-amber-500 text-amber-500" : ""} />
                  {bookmarks.includes(activeLesson.id) ? 'Bookmarked' : 'Bookmark'}
                </Button>

                {isLessonCompleted(activeLesson.id) ? (
                  <Button size="sm" onClick={handleDownloadCertificate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                    <Award size={14} /> Certificate
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleCompleteLesson} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                    <CheckCircle size={14} /> Mark Complete
                  </Button>
                )}
              </div>
            </div>

            {/* Lesson Header Banner */}
            <Card className="p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold uppercase text-[10px]">
                  {activeLesson.educationLevel}
                </Badge>
                <Badge className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold uppercase text-[10px]">
                  {activeLesson.subject} • {activeLesson.paper}
                </Badge>
                <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase text-[10px]">
                  {activeLesson.format}
                </Badge>
              </div>

              <h1 className="text-3xl font-black tracking-tight">{activeLesson.title}</h1>
              <p className="text-slate-300 text-sm font-medium line-clamp-2">{activeLesson.description || activeLesson.subtitle}</p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <FolderTree size={14} className="text-indigo-400" />
                  Topic: <span className="text-white">{activeLesson.topic}</span>
                </div>
                {activeLesson.subtopic && (
                  <div className="flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-slate-500" />
                    Subtopic: <span className="text-white">{activeLesson.subtopic}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-400" />
                  Duration: <span className="text-white">{activeLesson.estimatedMinutes} Mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  Teacher: <span className="text-white">{activeLesson.teacher || 'GCE Faculty'}</span>
                </div>
              </div>
            </Card>

            {/* Content Tabs (Lesson Content, Interactive Quiz, Student Notes, Download Attachments) */}
            <div className="flex border-b border-slate-200 gap-6">
              <button
                onClick={() => setActiveLessonTab('lesson')}
                className={cn(
                  "pb-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5",
                  activeLessonTab === 'lesson' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <BookOpen size={16} /> Lesson Notes & Media
              </button>

              {activeLesson.quizzes && activeLesson.quizzes.length > 0 && (
                <button
                  onClick={() => setActiveLessonTab('quiz')}
                  className={cn(
                    "pb-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5",
                    activeLessonTab === 'quiz' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Sparkles size={16} /> Practice Quiz ({activeLesson.quizzes[0].questions?.length || 0})
                </button>
              )}

              <button
                onClick={() => setActiveLessonTab('notes')}
                className={cn(
                  "pb-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5",
                  activeLessonTab === 'notes' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <FileText size={16} /> My Notebook ({notesList.length})
              </button>

              {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                <button
                  onClick={() => setActiveLessonTab('attachments')}
                  className={cn(
                    "pb-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5",
                    activeLessonTab === 'attachments' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Download size={16} /> Downloads ({activeLesson.attachments.length})
                </button>
              )}
            </div>

            {/* TAB 1: LESSON NOTES & MEDIA */}
            {activeLessonTab === 'lesson' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Video Stream Embed */}
                  {activeLesson.videoUrl && (
                    <Card className="p-4 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                        {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                          <iframe 
                            src={activeLesson.videoUrl.replace('watch?v=', 'embed/')} 
                            title="Video Lesson"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <video src={activeLesson.videoUrl} controls className="w-full h-full object-contain" />
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Audio Lesson Bar */}
                  {activeLesson.audioUrl && (
                    <Card className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
                      <Music size={24} className="text-indigo-600 shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-800">Audio Lecture Stream</span>
                        <audio src={activeLesson.audioUrl} controls className="w-full mt-1 h-8" />
                      </div>
                    </Card>
                  )}

                  {/* PDF Document Embedded */}
                  {activeLesson.pdfUrl && (
                    <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-rose-600" />
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Official PDF Lesson Guide</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Download or view the official syllabus handout</p>
                        </div>
                      </div>
                      <a 
                        href={activeLesson.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-rose-700"
                      >
                        <Download size={14} /> Open PDF
                      </a>
                    </Card>
                  )}

                  {/* Main Markdown Body */}
                  <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
                    <div className="prose prose-slate max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>{activeLesson.lessonContent || '*No notes available for this lesson.*'}</ReactMarkdown>
                    </div>
                  </Card>
                </div>

                {/* Sidebar: Learning Objectives & Quick Actions */}
                <div className="space-y-6">
                  {activeLesson.objectives && activeLesson.objectives.length > 0 && (
                    <Card className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-indigo-600" />
                        Learning Targets Checklist
                      </h3>

                      <div className="space-y-3">
                        {activeLesson.objectives.map((obj, i) => (
                          <div 
                            key={i} 
                            onClick={() => setCheckedObjectives(prev => ({ ...prev, [i]: !prev[i] }))}
                            className={cn(
                              "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                              checkedObjectives[i] ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                            )}
                          >
                            <input 
                              type="checkbox" 
                              checked={!!checkedObjectives[i]} 
                              onChange={() => {}}
                              className="mt-0.5 rounded text-indigo-600"
                            />
                            <span className="text-xs font-bold leading-snug">{obj}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* References */}
                  {activeLesson.references && activeLesson.references.length > 0 && (
                    <Card className="p-6 bg-slate-900 text-white rounded-3xl space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                        Syllabus References
                      </h3>
                      <ul className="space-y-1.5 text-xs font-medium text-slate-300">
                        {activeLesson.references.map((ref, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-indigo-400">•</span> {ref}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE PRACTICE QUIZ */}
            {activeLessonTab === 'quiz' && activeLesson.quizzes?.[0] && (
              <Card className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{activeLesson.quizzes[0].title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Test your understanding with instant feedback explanation.</p>
                  </div>

                  {quizSubmitted && quizScore !== null && (
                    <Badge className={cn("text-sm font-black px-4 py-1.5 rounded-xl border-none", quizScore >= 70 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>
                      Score: {quizScore}%
                    </Badge>
                  )}
                </div>

                <div className="space-y-6">
                  {activeLesson.quizzes[0].questions.map((q, idx) => (
                    <div key={q.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <span className="text-xs font-black uppercase text-indigo-600">Question {idx + 1}</span>
                      <h4 className="text-sm font-bold text-slate-900">{q.question}</h4>

                      {/* MCQ Options */}
                      {q.type === 'mcq' && q.options && (
                        <div className="space-y-2 pt-2">
                          {q.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className={cn(
                                "w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between",
                                userAnswers[q.id] === opt ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
                                quizSubmitted && opt === q.correctAnswer && "bg-emerald-600 text-white border-emerald-600"
                              )}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && opt === q.correctAnswer && <CheckCircle2 size={16} />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* True/False Options */}
                      {q.type === 'true_false' && (
                        <div className="flex gap-4 pt-2">
                          {[true, false].map((val) => (
                            <button
                              key={String(val)}
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: val }))}
                              className={cn(
                                "flex-1 p-3 rounded-xl border text-xs font-bold transition-all text-center",
                                userAnswers[q.id] === val ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
                                quizSubmitted && val === q.correctAnswer && "bg-emerald-600 text-white border-emerald-600"
                              )}
                            >
                              {val ? 'TRUE' : 'FALSE'}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Instant Explanation Feedback */}
                      {quizSubmitted && q.explanation && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <Button onClick={handleSubmitQuiz} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl">
                    Submit Answers & Get Score
                  </Button>
                ) : (
                  <Button onClick={() => { setQuizSubmitted(false); setUserAnswers({}); }} variant="outline" className="w-full font-bold py-3 rounded-2xl">
                    <RotateCcw size={16} className="mr-2" /> Retake Practice Quiz
                  </Button>
                )}
              </Card>
            )}

            {/* TAB 3: STUDENT NOTES */}
            {activeLessonTab === 'notes' && (
              <Card className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6 max-w-3xl mx-auto">
                <h3 className="text-lg font-black text-slate-900">Personal Lesson Notebook</h3>

                <div className="space-y-3">
                  <textarea 
                    rows={4}
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Type personal summary notes, questions to ask teacher, or key revision key points..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  <Button onClick={handleSaveNote} className="bg-indigo-600 text-white font-bold text-xs rounded-xl">
                    <Save size={14} className="mr-1" /> Save Note to Profile
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {notesList.map((note) => (
                    <div key={note.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between">
                      <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap">{note.noteText}</p>
                      <button onClick={() => handleDeleteNote(note.id)} className="text-slate-400 hover:text-rose-600 ml-4">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB 4: ATTACHMENTS */}
            {activeLessonTab === 'attachments' && activeLesson.attachments && (
              <Card className="p-8 bg-white border border-slate-200 rounded-3xl space-y-4 max-w-3xl mx-auto">
                <h3 className="text-lg font-black text-slate-900">Downloadable Resources</h3>

                <div className="space-y-3">
                  {activeLesson.attachments.map((att) => (
                    <div key={att.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck size={20} className="text-indigo-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{att.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{att.type} • {att.size}</span>
                        </div>
                      </div>
                      <a href={att.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                        <Download size={14} /> Download File
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* MAIN LMS BROWSER VIEW */
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 lg:p-12 shadow-xl space-y-4 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-3">
                <Badge className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-bold uppercase text-[10px] tracking-widest">
                  Digital School LMS Portal
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                  Cameroon GCE & TVET Digital Learning Hub
                </h1>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                  Browse video lectures, interactive notes, practice drills, and downloadable past paper revision guides organized by Education Level, Department, Subject, and Topic.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                  <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search lessons by title, topic, or subject..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <select
                    value={selectedLevel}
                    onChange={e => { setSelectedLevel(e.target.value); setSelectedSubject('All'); setSelectedTopic('All'); }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    {availableLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedSubject}
                    onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic('All'); }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Subjects</option>
                    {availableSubjects.map(sub => sub !== 'All' && <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedFormat}
                    onChange={e => setSelectedFormat(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Lesson Formats</option>
                    <option value="text">Text Notes</option>
                    <option value="video">Video Lectures</option>
                    <option value="pdf">PDF Documents</option>
                    <option value="practical">Practical Labs</option>
                    <option value="interactive">Interactive Drills</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Lessons Catalog Grid */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-bold">Loading digital curriculum...</div>
            ) : filteredLessons.length === 0 ? (
              <Card className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                <BookOpen size={40} className="mx-auto text-indigo-400" />
                <h3 className="text-xl font-black text-slate-900">No Lessons Found</h3>
                <p className="text-slate-500 text-xs">Try selecting a different level or clearing your search filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => {
                  const completed = isLessonCompleted(lesson.id);

                  return (
                    <Card 
                      key={lesson.id} 
                      onClick={() => handleSelectLesson(lesson)}
                      className="p-6 bg-white border border-slate-200 rounded-3xl hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-bold border-none text-[10px]">
                            {lesson.educationLevel}
                          </Badge>

                          {completed && (
                            <Badge className="bg-emerald-100 text-emerald-800 font-bold border-none text-[10px] flex items-center gap-1">
                              <CheckCircle size={12} /> Completed
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase">
                            {lesson.format}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {lesson.estimatedMinutes} Mins
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                          {lesson.title}
                        </h3>

                        <p className="text-slate-500 text-xs line-clamp-2 mb-4">
                          {lesson.description || lesson.subtitle}
                        </p>

                        <div className="text-[11px] font-bold text-slate-500 mb-4">
                          Subject: <span className="text-slate-900">{lesson.subject}</span> • Topic: <span className="text-slate-900">{lesson.topic}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Start Lesson <ChevronRight size={16} />
                        </span>

                        <span className="text-[10px] font-bold text-slate-400">
                          {lesson.teacher || 'Faculty'}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
