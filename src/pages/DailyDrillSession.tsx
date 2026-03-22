import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, Send, 
  FileText, Upload, Target, Zap, 
  ArrowLeft, Lock, Sparkles, Trophy, MessageSquare, X, Download
} from 'lucide-react';
import { db, storage, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { DailyDrill, DrillSubmission, ExamQuestion, Grade } from '../types';
import { Button, Card, Badge, cn } from '../components/ui';
import { downloadQuestionAsPDF } from '../utils/pdfGenerator';
import FileUpload from '../components/FileUpload';

import { getCurrentDayNumber, isDrillAccessible } from '../utils/challenge';
import { getSystemSettings } from '../services/settingsService';
import { useSettings } from '../contexts/SettingsContext';
import { updatePoints, checkAchievements } from '../services/gamificationService';

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
      const settings = await getSystemSettings();
      const startDate = settings?.challengeStartDate;
      
      const currentDay = getCurrentDayNumber(startDate);
      const dayToFetch = requestedDay ? parseInt(requestedDay) : currentDay;

      // Security check: if not paid, only allow Day 1 or drills marked as free sample
      const q = query(
        collection(db, 'daily_drills'), 
        where('day', '==', dayToFetch),
        where('subject', '==', user.subject)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const currentDrill = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DailyDrill;
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
        } else if (currentDrill.day < currentDay) {
          setError('This drill was missed and is no longer available.');
          setLoading(false);
          return;
        }
      } else {
        setDrill(null);
      }
    } catch (err) {
      console.error("Error fetching drill:", err);
      setError('Failed to load today\'s drill.');
    } finally {
      setLoading(false);
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
      const batch = writeBatch(db);
      
      for (const q of questions) {
        const subRef = doc(collection(db, 'drill_submissions'));
        const isPaper1 = q.paper === 'Paper 1';
        const selectedAnswer = answers[q.id] || '';
        const isCorrect = isPaper1 ? selectedAnswer === q.correctAnswer : false;
        const score = isCorrect ? (q.marks || 1) : 0;

        batch.set(subRef, {
          userId: user.uid,
          userEmail: user.email,
          drillId: drill.id,
          questionId: q.id,
          day: drill.day,
          selectedAnswer: selectedAnswer,
          fileUrl: fileUrls[q.id] || '',
          correctAnswer: q.correctAnswer || 'N/A',
          score: score,
          status: isPaper1 ? 'graded' : 'pending',
          paper: q.paper || 'Paper 1',
          topic: q.topic || 'General',
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      // Award points for completing the drill
      await updatePoints(user.uid, 20, 'Daily Drill Completion');
      // Check for achievements
      await checkAchievements(user.uid);

      setHasSubmitted(true);
      setShowResults(true);
      setSuccess(true);

      // Refresh submissions
      const subQ = query(
        collection(db, 'drill_submissions'),
        where('userId', '==', user.uid),
        where('drillId', '==', drill.id)
      );
      const subSnap = await getDocs(subQ);
      const allSubs = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrillSubmission));
      setSubmissions(allSubs);

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error("Error submitting drill:", err);
      setError(`Failed to submit your answers. Please check your connection or contact ${contactEmail}.`);
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

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              Submission Successful!
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              Great job completing today's drill! Your answers have been submitted and will be graded by our team shortly.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
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
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="primary" className="text-[10px]">Day {drill.day}</Badge>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Daily Drill</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic: {drill.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Timer size={16} className="text-indigo-600" />
            <span className="text-xs font-black text-slate-600">60-Day Challenge</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadQuestionAsPDF(currentQuestion, drill.day)}
            className="hidden md:flex items-center gap-2"
            disabled={!currentQuestion}
          >
            <Download size={16} />
            Download Daily Drill
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting || hasSubmitted}>
            {submitting ? 'Submitting...' : hasSubmitted ? 'Submitted' : 'Submit Drill'}
          </Button>
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
                  <p className="text-xl font-bold text-slate-800 leading-relaxed mb-12">
                    {currentQuestion.questionText}
                  </p>

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
                    <Button onClick={() => navigate('/dashboard')}>
                      Finish Review
                    </Button>
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
