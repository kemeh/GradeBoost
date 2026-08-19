import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, Send, 
  FileText, Upload, Target, Zap, 
  ArrowLeft, Lock, Sparkles, Trophy, MessageSquare, X, Download, LayoutDashboard
} from 'lucide-react';
import { db, storage, auth } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { DailyDrill, DrillSubmission, ExamQuestion, Grade } from '../types';
import { Button, Card, Badge, cn } from '../components/ui';
import { downloadQuestionAsPDF } from '../utils/pdfGenerator';
import FileUpload from '../components/FileUpload';
import { generateContentWithRetry } from '../utils/apiUtils';
import { GoogleGenAI } from "@google/genai";

import { getCurrentDayNumber, isDrillAccessible } from '../utils/challenge';
import { getSystemSettings } from '../services/settingsService';
import { useSettings } from '../contexts/SettingsContext';
import { updatePoints, checkAchievements } from '../services/gamificationService';
import { 
  downloadDailyDrill, 
  getOfflineDailyDrillByDay, 
  queueOfflineSubmission, 
  isOnline 
} from '../services/offlineStorageService';
import { WifiOff, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

interface PerformanceReport {
  paper1: {
    score: number;
    total: number;
    percentage: number;
  };
  paper2: {
    answered: number;
    total: number;
  };
  paper3: {
    answered: number;
    total: number;
  };
  advice: string;
}

export default function DailyDrillSession() {
  const { user } = useAuth();
  const { contactEmail } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedDay = searchParams.get('day');

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
  
  const [drill, setDrill] = useState<DailyDrill | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [generatingAdvice, setGeneratingAdvice] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submission, setSubmission] = useState<DrillSubmission | null>(null);
  const [submissions, setSubmissions] = useState<DrillSubmission[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [structuredAnswer, setStructuredAnswer] = useState('');
  const currentQuestion = questions[currentQuestionIndex];

  const [isOfflineSession, setIsOfflineSession] = useState<boolean>(!isOnline());
  const [isDrillCached, setIsDrillCached] = useState<boolean>(false);
  const [downloadingDrill, setDownloadingDrill] = useState<boolean>(false);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveDrillOffline = async () => {
    if (!drill || questions.length === 0) return;
    try {
      setDownloadingDrill(true);
      await downloadDailyDrill(drill, questions);
      setIsDrillCached(true);
      toast.success(`Day ${drill.day} Daily Drill downloaded for offline practice!`);
    } catch (err) {
      console.error("Failed to download drill:", err);
      toast.error("Failed to save drill for offline use.");
    } finally {
      setDownloadingDrill(false);
    }
  };

  useEffect(() => {
    fetchTodayDrill();
  }, [user, requestedDay]);

  // Anti-tamper measures
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+U, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 's')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', preventDefault);
    window.addEventListener('copy', preventDefault);
    window.addEventListener('paste', preventDefault);
    window.addEventListener('keydown', preventKeys);

    return () => {
      window.removeEventListener('contextmenu', preventDefault);
      window.removeEventListener('copy', preventDefault);
      window.removeEventListener('paste', preventDefault);
      window.removeEventListener('keydown', preventKeys);
    };
  }, []);

  const fetchTodayDrill = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setHasSubmitted(false);
    setShowResults(false);
    setAnswers({});
    setFileUrls({});
    setCurrentQuestionIndex(0);
    setSubmissions([]);
    setDrill(null);
    setQuestions([]);
    
    try {
      const settings = await getSystemSettings().catch(() => null);
      const startDate = settings?.challengeStartDate;
      
      const currentDay = getCurrentDayNumber(startDate);
      const dayToFetch = requestedDay ? parseInt(requestedDay) : currentDay;

      // Check offline storage first if offline
      const cachedDrill = await getOfflineDailyDrillByDay(dayToFetch, user.subject);
      if (cachedDrill) {
        setIsDrillCached(true);
      }

      if (!isOnline() && cachedDrill) {
        setIsOfflineSession(true);
        setDrill(cachedDrill);
        setQuestions(cachedDrill.cachedQuestions || []);
        setLoading(false);
        return;
      }

      // Fetch drill with more resilience
      const q = query(
        collection(db, 'daily_drills'), 
        where('day', '==', dayToFetch)
      );
      
      console.log("Session: Querying drill for:", { day: dayToFetch, subject: user.subject.trim() });
      
      const snapshot = await getDocs(q);
      const userSub = user.subject?.trim().toLowerCase();
      
      // Filter in memory for case-insensitive match
      const matchingDrillDoc = snapshot.docs.find(doc => {
        const d = doc.data();
        return d.subject?.trim().toLowerCase() === userSub;
      });
      
      if (matchingDrillDoc) {
        const currentDrill = { id: matchingDrillDoc.id, ...matchingDrillDoc.data() } as DailyDrill;
        console.log("Session: Found matching drill:", currentDrill);
        setDrill(currentDrill);
        
        // Check access
        const isFree = currentDrill.day === 1 || currentDrill.isFree;
        if (user.paymentStatus !== 'paid' && !isFree) {
          navigate('/payment');
          return;
        }

        // Fetch all questions
        const questionIds = currentDrill.questionIds || [];
        if (questionIds.length === 0) {
          setError('No questions assigned to this drill.');
          setLoading(false);
          return;
        }
        const questionPromises = questionIds.map(id => getDoc(doc(db, 'exam_questions', id)));
        const questionSnaps = await Promise.all(questionPromises);
        
        const fetchedQuestions = questionSnaps
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() } as ExamQuestion));
        
        setQuestions(fetchedQuestions);

        // Check if already submitted
        const subQ = query(
          collection(db, 'drill_submissions'),
          where('userId', '==', user.uid),
          where('drillId', '==', currentDrill.id)
        );
        const subSnapshot = await getDocs(subQ);
        
        if (!subSnapshot.empty) {
          setHasSubmitted(true);
          const allSubs = subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrillSubmission));
          setSubmissions(allSubs);
          
          const reconstructedAnswers: Record<string, string> = {};
          allSubs.forEach(sub => {
            if (sub.questionId) {
              reconstructedAnswers[sub.questionId] = sub.selectedAnswer;
            }
          });
          setAnswers(reconstructedAnswers);
          setShowResults(true);
          
          // Calculate performance for existing submission
          const report = calculatePerformance(fetchedQuestions, allSubs);
          setPerformanceReport(report);
          
          // Generate advice if not already there
          const advice = await generateAdvice(report);
          setPerformanceReport(prev => prev ? { ...prev, advice } : null);
        } else if (currentDrill.day < currentDay) {
          setError('This drill was missed and is no longer available.');
          setLoading(false);
          return;
        }
      } else if (cachedDrill) {
        setIsOfflineSession(true);
        setDrill(cachedDrill);
        setQuestions(cachedDrill.cachedQuestions || []);
      } else {
        setDrill(null);
      }
    } catch (err) {
      console.error("Error fetching drill:", err);
      // Try offline fallback
      const dayToFetch = requestedDay ? parseInt(requestedDay) : 1;
      const cachedDrill = await getOfflineDailyDrillByDay(dayToFetch, user?.subject);
      if (cachedDrill) {
        setIsOfflineSession(true);
        setDrill(cachedDrill);
        setQuestions(cachedDrill.cachedQuestions || []);
      } else {
        setError('Failed to load today\'s drill. Please check connection or download for offline access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformance = (questionsList: ExamQuestion[], submissionsList: DrillSubmission[]) => {
    const p1 = questionsList.filter(q => q.paper === 'Paper 1');
    const p2 = questionsList.filter(q => q.paper === 'Paper 2');
    const p3 = questionsList.filter(q => q.paper === 'Paper 3');

    const p1Score = p1.reduce((acc, q) => {
      const sub = submissionsList.find(s => s.questionId === q.id);
      const isCorrect = sub?.selectedAnswer === q.correctAnswer;
      return acc + (isCorrect ? (q.marks || 1) : 0);
    }, 0);
    const p1Total = p1.reduce((acc, q) => acc + (q.marks || 1), 0);

    const p2Answered = p2.filter(q => {
      const sub = submissionsList.find(s => s.questionId === q.id);
      return sub?.selectedAnswer || sub?.fileUrl;
    }).length;
    
    const p3Answered = p3.filter(q => {
      const sub = submissionsList.find(s => s.questionId === q.id);
      return sub?.selectedAnswer || sub?.fileUrl;
    }).length;

    return {
      paper1: {
        score: p1Score,
        total: p1Total,
        percentage: p1Total > 0 ? Math.round((p1Score / p1Total) * 100) : 0
      },
      paper2: {
        answered: p2Answered,
        total: p2.length
      },
      paper3: {
        answered: p3Answered,
        total: p3.length
      },
      advice: ''
    };
  };

  const generateAdvice = async (report: PerformanceReport) => {
    if (!user) return "Great job completing the drill!";
    setGeneratingAdvice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `As an expert tutor, provide a brief (2-3 sentences) encouraging advice to a student who just finished a daily drill for ${user.subject}. 
      Performance:
      - Paper 1 (MCQs): ${report.paper1.score}/${report.paper1.total} (${report.paper1.percentage}%)
      - Paper 2 (Structured): ${report.paper2.answered}/${report.paper2.total} answered
      - Paper 3 (Practical): ${report.paper3.answered}/${report.paper3.total} answered
      
      Focus on where they can improve based on these numbers. If they did well in P1 but missed P2, suggest focusing on structured answers. If P1 is low, suggest reviewing core concepts. Be specific to the subject ${user.subject} if possible.`;
      
      const result = await generateContentWithRetry(ai, {
        model: "gemini-flash-latest",
        contents: [{ parts: [{ text: prompt }] }]
      });
      return result.text || "Great job completing the drill! Keep practicing to improve your speed and accuracy across all paper types.";
    } catch (err) {
      console.error("Advice generation error:", err);
      return "Great job completing the drill! Keep practicing to improve your speed and accuracy across all paper types.";
    } finally {
      setGeneratingAdvice(false);
    }
  };

  const handleAnswerSelect = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleInitialSubmit = () => {
    if (!user || !drill || questions.length === 0) return;
    const count = questions.filter(q => !answers[q.id]).length;
    if (count > 0) {
      setUnansweredCount(count);
      setShowConfirmModal(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user || !drill || questions.length === 0) return;
    setShowConfirmModal(false);
    setSubmitting(true);
    setError('');
    try {
      const generatedSubs: DrillSubmission[] = questions.map(q => {
        const isPaper1 = q.paper === 'Paper 1';
        const selectedAnswer = answers[q.id] || '';
        const isCorrect = isPaper1 ? selectedAnswer === q.correctAnswer : false;
        const score = isCorrect ? (q.marks || 1) : 0;
        return {
          id: `local_${q.id}`,
          userId: user.uid,
          userEmail: user.email || '',
          drillId: drill.id,
          questionId: q.id,
          day: drill.day,
          selectedAnswer,
          fileUrl: fileUrls[q.id] || '',
          correctAnswer: q.correctAnswer || 'N/A',
          score,
          status: isPaper1 ? 'graded' : 'pending',
          paper: q.paper || 'Paper 1',
          topic: q.topic || 'General',
          createdAt: new Date().toISOString()
        } as DrillSubmission;
      });

      if (!isOnline()) {
        // Queue all submissions locally in IndexedDB
        for (const sub of generatedSubs) {
          await queueOfflineSubmission({
            type: 'drill',
            userId: user.uid,
            targetId: drill.id,
            subject: user.subject || 'General',
            payload: sub
          });
        }
        setSubmissions(generatedSubs);
        const report = calculatePerformance(questions, generatedSubs);
        setPerformanceReport(report);
        setHasSubmitted(true);
        setSuccess(true);
        toast.success("Drill completed & saved offline! Will sync when connection is restored.");
        return;
      }

      // Online path: Firestore batch write
      const batch = writeBatch(db);
      for (const sub of generatedSubs) {
        const subRef = doc(collection(db, 'drill_submissions'));
        batch.set(subRef, {
          ...sub,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      // Award points for completing the drill
      await updatePoints(user.uid, 20, 'Daily Drill Completion');
      // Check for achievements
      await checkAchievements(user.uid);

      // Refresh submissions to calculate performance
      const subQ = query(
        collection(db, 'drill_submissions'),
        where('userId', '==', user.uid),
        where('drillId', '==', drill.id)
      );
      const subSnap = await getDocs(subQ);
      const allSubs = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrillSubmission));
      setSubmissions(allSubs.length > 0 ? allSubs : generatedSubs);

      const report = calculatePerformance(questions, allSubs.length > 0 ? allSubs : generatedSubs);
      setPerformanceReport(report);
      
      setHasSubmitted(true);
      setSuccess(true);

      // Generate advice
      const advice = await generateAdvice(report);
      setPerformanceReport(prev => prev ? { ...prev, advice } : null);

    } catch (err) {
      console.error("Error submitting drill:", err);
      // If error occurs, fallback to local queueing
      try {
        const generatedSubs: DrillSubmission[] = questions.map(q => ({
          id: `local_${q.id}`,
          userId: user.uid,
          userEmail: user.email || '',
          drillId: drill.id,
          questionId: q.id,
          day: drill.day,
          selectedAnswer: answers[q.id] || '',
          fileUrl: fileUrls[q.id] || '',
          correctAnswer: q.correctAnswer || 'N/A',
          score: (q.paper === 'Paper 1' && answers[q.id] === q.correctAnswer) ? (q.marks || 1) : 0,
          status: q.paper === 'Paper 1' ? 'graded' : 'pending',
          paper: q.paper || 'Paper 1',
          topic: q.topic || 'General',
          createdAt: new Date().toISOString()
        } as DrillSubmission));

        for (const sub of generatedSubs) {
          await queueOfflineSubmission({
            type: 'drill',
            userId: user.uid,
            targetId: drill.id,
            subject: user.subject || 'General',
            payload: sub
          });
        }
        setSubmissions(generatedSubs);
        const report = calculatePerformance(questions, generatedSubs);
        setPerformanceReport(report);
        setHasSubmitted(true);
        setSuccess(true);
        toast.success("Saved to offline cache! Will sync when connection is back.");
      } catch (localErr) {
        setError(`Failed to submit answers. Please check connection.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = async () => {
    if (!user || !drill) return;
    setSubmitting(true);
    try {
      const batch = writeBatch(db);
      submissions.forEach(sub => {
        if (sub.id) {
          batch.delete(doc(db, 'drill_submissions', sub.id));
        }
      });
      await batch.commit();
      
      setHasSubmitted(false);
      setShowResults(false);
      setAnswers({});
      setFileUrls({});
      setCurrentQuestionIndex(0);
      setSubmissions([]);
      setSuccess(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'drill_submissions');
      setError('Failed to retake drill.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Preparing Drill...</p>
        </div>
      </div>
    );
  }

  if (success && performanceReport) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
          <Card className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Drill Completed!
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              Your answers have been submitted successfully. Here is your performance report:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-white border rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paper 1 (MCQ)</p>
                <p className="text-2xl font-black text-indigo-600">{performanceReport.paper1.score}/{performanceReport.paper1.total}</p>
                <p className="text-[10px] font-bold text-slate-500">{performanceReport.paper1.percentage}% Accuracy</p>
              </div>
              <div className="p-4 bg-white border rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paper 2 (Structured)</p>
                <p className="text-2xl font-black text-indigo-600">{performanceReport.paper2.answered}/{performanceReport.paper2.total}</p>
                <p className="text-[10px] font-bold text-slate-500">Questions Answered</p>
              </div>
              <div className="p-4 bg-white border rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paper 3 (Practical)</p>
                <p className="text-2xl font-black text-indigo-600">{performanceReport.paper3.answered}/{performanceReport.paper3.total}</p>
                <p className="text-[10px] font-bold text-slate-500">Questions Answered</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
              {generatingAdvice && (
                <div className="absolute inset-0 bg-indigo-50/50 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Generating Advice...</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Tutor's Advice</h3>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic">
                {performanceReport.advice ? `"${performanceReport.advice}"` : "Great job completing the drill! Keep practicing to improve your speed and accuracy across all paper types."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/dashboard')} className="flex-1">
                Back to Dashboard
              </Button>
              <Button onClick={() => {
                setSuccess(false);
                setShowResults(true);
              }} variant="outline" className="flex-1">
                Review Answers
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!drill || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">No Drill Found</h2>
          <p className="text-slate-500 font-medium mb-8">
            There are no drills available for your subject today. Please check back later or contact {contactEmail}.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Go to Dashboard">
            <LayoutDashboard size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="primary" className="text-[10px]">Day {drill.day}</Badge>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Daily Drill</h1>
              {isOfflineSession && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <WifiOff size={10} /> Offline Mode
                </span>
              )}
              {isDrillCached && !isOfflineSession && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Offline Ready
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic: {drill.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Offline Save Button */}
          {!isDrillCached && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDrillOffline}
              loading={downloadingDrill}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-bold"
              title="Download for offline study"
            >
              <HardDrive size={14} className="mr-1.5" />
              Save Offline
            </Button>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <Timer size={14} className="text-indigo-600" />
            <span className="text-xs font-black text-slate-600">60-Day Challenge</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadQuestionAsPDF(currentQuestion, drill.day)}
            className="hidden md:flex items-center gap-2 text-xs"
            disabled={!currentQuestion}
          >
            <Download size={14} />
            PDF
          </Button>
          {hasSubmitted ? (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => setSuccess(true)} 
                variant="outline" 
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
              >
                <Trophy size={16} className="mr-2" />
                View Report
              </Button>
              <Button size="sm" onClick={handleRetake} disabled={submitting} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                {submitting ? 'Resetting...' : 'Retake Drill'}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Drill'}
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {currentQuestion?.paper} {currentQuestion?.section && (currentQuestion.section.startsWith('Section') || currentQuestion.section.startsWith('Task') ? `- ${currentQuestion.section}` : `- Section ${currentQuestion.section}`)} - {drill.topic}
            </span>
          </div>
          
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600 transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {!currentQuestion ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No questions found for this drill.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <Card className="p-8 md:p-12">
                  {currentQuestion.imageUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 bg-white">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Question Diagram" 
                        className="w-full h-auto max-h-[400px] object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="space-y-6 mb-12">
                    <div className="prose prose-slate max-w-none">
                      <div className="text-xl font-bold text-slate-800 leading-relaxed">
                        <ReactMarkdown>
                          {currentQuestion.questionText}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {currentQuestion.subParts && currentQuestion.subParts.length > 0 && (
                      <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                        {currentQuestion.subParts.map((sub, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="font-black text-slate-900 min-w-[30px]">{sub.label}</span>
                              <div className="prose prose-slate max-w-none flex-1">
                                <div className="text-slate-700 font-medium">
                                  <ReactMarkdown>
                                    {sub.text}
                                  </ReactMarkdown>
                                </div>
                              </div>
                              {sub.marks > 0 && (
                                <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded ml-auto">
                                  {sub.marks} {sub.marks === 1 ? 'mark' : 'marks'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {currentQuestion.paper === 'Paper 1' ? (
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                        const isSelected = answers[currentQuestion.id] === key;
                        const isCorrect = currentQuestion.correctAnswer === key;
                        
                        return (
                          <button
                            key={key}
                            disabled={showResults}
                            onClick={() => handleAnswerSelect(currentQuestion.id, key)}
                            className={cn(
                              "group flex items-center gap-6 p-6 rounded-2xl border-2 text-left transition-all",
                              isSelected 
                                ? (showResults 
                                    ? (isCorrect ? "bg-emerald-50 border-emerald-600" : "bg-red-50 border-red-600")
                                    : "bg-indigo-50 border-indigo-600")
                                : (showResults && isCorrect ? "bg-emerald-50 border-emerald-600" : "bg-white border-slate-100 hover:border-slate-200")
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all",
                              isSelected 
                                ? (showResults 
                                    ? (isCorrect ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
                                    : "bg-indigo-600 text-white")
                                : (showResults && isCorrect ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100")
                            )}>
                              {key}
                            </div>
                            <div className="flex-1">
                              <span className={cn(
                                "text-lg font-bold transition-all",
                                isSelected 
                                  ? (showResults 
                                      ? (isCorrect ? "text-emerald-900" : "text-red-900")
                                      : "text-indigo-900")
                                  : (showResults && isCorrect ? "text-emerald-900" : "text-slate-600")
                              )}>
                                {value}
                              </span>
                            </div>
                            {showResults && isCorrect && <CheckCircle2 className="text-emerald-600" size={24} />}
                            {showResults && isSelected && !isCorrect && <AlertCircle className="text-red-600" size={24} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Answer</label>
                        <textarea 
                          className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 outline-none h-64 resize-none focus:bg-white focus:border-indigo-600 transition-all disabled:opacity-70"
                          placeholder="Type your structured answer here..."
                          value={answers[currentQuestion.id] || ''}
                          onChange={e => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                          disabled={hasSubmitted}
                        />
                      </div>

                      {!hasSubmitted && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Or Upload a Photo of Your Answer</label>
                          <FileUpload 
                            onUploadComplete={(url) => {
                              setFileUrls(prev => ({ ...prev, [currentQuestion.id]: url }));
                            }}
                            onDelete={() => {
                              setFileUrls(prev => {
                                const next = { ...prev };
                                delete next[currentQuestion.id];
                                return next;
                              });
                            }}
                            initialUrl={fileUrls[currentQuestion.id]}
                            folder={`submissions/${user.uid}/drills`}
                            label="Upload Photo"
                            accept="image/*,application/pdf"
                          />
                        </div>
                      )}

                      {hasSubmitted && fileUrls[currentQuestion.id] && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="text-indigo-600" size={20} />
                            <span className="text-sm font-bold text-slate-900">Uploaded Answer</span>
                          </div>
                          <a 
                            href={fileUrls[currentQuestion.id]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                          >
                            View File
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {showResults && currentQuestion.explanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 p-8 bg-indigo-50 rounded-3xl border border-indigo-100"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="text-indigo-600" size={20} />
                        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest text-xs">Explanation</h4>
                      </div>
                      <p className="text-indigo-900/80 font-medium leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}

                  {showResults && submissions.find(s => s.questionId === currentQuestion.id)?.feedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-8 bg-emerald-50 rounded-3xl border border-emerald-100"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="text-emerald-600" size={20} />
                        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Tutor Feedback</h4>
                      </div>
                      <p className="text-emerald-900/80 font-medium leading-relaxed">
                        {submissions.find(s => s.questionId === currentQuestion.id)?.feedback}
                      </p>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center pt-8">
              <Button 
                variant="outline" 
                onClick={handlePrev} 
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Previous
              </Button>
              
              <div className="flex gap-4">
                {currentQuestionIndex === questions.length - 1 ? (
                  showResults ? (
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleRetake} disabled={submitting} className="text-red-600 border-red-200 hover:bg-red-50">
                        {submitting ? 'Resetting...' : 'Retake Drill'}
                      </Button>
                      <Button onClick={() => navigate('/dashboard')}>
                        Finish Review
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleInitialSubmit} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Finish & Submit'}
                    </Button>
                  )
                ) : (
                  <Button onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <ChevronRight size={20} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8"
          >
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tight">Unanswered Questions</h2>
            <p className="text-slate-500 text-center mb-8 font-medium leading-relaxed">
              You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to submit anyway?
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 py-6 rounded-2xl font-bold"
                onClick={() => setShowConfirmModal(false)}
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 py-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Anyway'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
