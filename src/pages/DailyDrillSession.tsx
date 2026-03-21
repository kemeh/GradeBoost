import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, Send, 
  FileText, Upload, Target, Zap, 
  ArrowLeft, Lock, Sparkles, Trophy, MessageSquare, X
} from 'lucide-react';
import { db, storage, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { DailyDrill, DailyDrillSubmission, Grade } from '../types';
import { Button, Card, Badge, cn } from '../components/ui';

import { getCurrentDayNumber, isDrillAccessible } from '../utils/challenge';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submission, setSubmission] = useState<DailyDrillSubmission | null>(null);
  const [submissions, setSubmissions] = useState<DailyDrillSubmission[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [structuredAnswer, setStructuredAnswer] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTodayDrill();
  }, [user]);

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
    try {
      const currentDay = getCurrentDayNumber();
      const dayToFetch = requestedDay ? parseInt(requestedDay) : currentDay;

      // Security check: if not paid, only allow Day 1 or drills marked as free sample
      const q = query(
        collection(db, 'dailyDrills'), 
        where('dayNumber', '==', dayToFetch),
        where('subject', '==', user.subject)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const currentDrill = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DailyDrill;
        
        // Check access
        const isFree = currentDrill.dayNumber === 1 || currentDrill.isFreeSample;
        if (user.paymentStatus !== 'paid' && !isFree) {
          navigate('/payment');
          return;
        }

        setDrill(currentDrill);

        // Check if already submitted
        const subQ = query(
          collection(db, 'drill_submissions'),
          where('userId', '==', user.uid),
          where('drillId', '==', currentDrill.id)
        );
        const subSnapshot = await getDocs(subQ);
        if (!subSnapshot.empty) {
          setHasSubmitted(true);
          const allSubs = subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyDrillSubmission));
          setSubmissions(allSubs);
          
          // Reconstruct answers if it's Paper 1
          if (currentDrill.paperType === 'Paper 1') {
            const reconstructedAnswers: Record<string, string> = {};
            allSubs.forEach(sub => {
              if (sub.questionId) {
                reconstructedAnswers[sub.questionId] = sub.selectedAnswer;
              }
            });
            setAnswers(reconstructedAnswers);
            setShowResults(true);
          } else {
            // For Paper 2/3, just take the first one
            const firstSub = allSubs[0];
            setStructuredAnswer(firstSub.selectedAnswer || '');
            setSubmission(firstSub);
          }
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

  const handleSubmit = async () => {
    if (!user || !drill) return;

    // Prevent submission if no option is selected for Paper 1
    if (drill.paperType === 'Paper 1') {
      const unanswered = drill.questions.some(q => !answers[q.id]);
      if (unanswered) {
        setError('Please select an answer for all questions before submitting.');
        return;
      }
    } else {
      // For Paper 2/3, ensure at least some answer is provided
      if (!structuredAnswer.trim() && !file) {
        setError('Please provide an answer or upload a file before submitting.');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      const batch = writeBatch(db);
      
      if (drill.paperType === 'Paper 1') {
        // Save each question as a separate document in drill_submissions
        for (const question of drill.questions) {
          const selectedAnswer = answers[question.id];
          const isCorrect = selectedAnswer === question.correctAnswer;
          const score = isCorrect ? 1 : 0;

          const subRef = doc(collection(db, 'drill_submissions'));
          batch.set(subRef, {
            userId: user.uid,
            drillId: drill.id,
            day: drill.dayNumber,
            questionId: question.id,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.correctAnswer || '',
            score: score,
            createdAt: serverTimestamp(),
            // Extra fields for context
            subject: drill.subject,
            paperType: drill.paperType,
            gradedStatus: true
          });
        }
      } else {
        // For Paper 2/3, save as a single document
        let fileUrl = '';
        if (file) {
          const storageRef = ref(storage, `submissions/${user.uid}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          fileUrl = await getDownloadURL(snapshot.ref);
        }

        const subRef = doc(collection(db, 'drill_submissions'));
        batch.set(subRef, {
          userId: user.uid,
          drillId: drill.id,
          day: drill.dayNumber,
          questionId: 'structured_response',
          selectedAnswer: structuredAnswer,
          fileUrl: fileUrl,
          correctAnswer: 'N/A',
          score: 0,
          createdAt: serverTimestamp(),
          subject: drill.subject,
          paperType: drill.paperType,
          gradedStatus: false
        });
      }

      await batch.commit();
      
      setSuccess(true);
      if (drill.paperType === 'Paper 1') {
        setShowResults(true);
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error("Error submitting drill:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'drill_submissions');
      } catch (finalErr: any) {
        // The error is already logged to console as JSON
        setError('Failed to submit your answers. Please check your connection or contact support.');
      }
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

  if ((success || hasSubmitted) && (drill?.paperType !== 'Paper 1' || !showResults)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              {hasSubmitted ? 'Already Completed' : 'Submission Successful!'}
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              {hasSubmitted 
                ? "You've already completed today's drill. Great job staying consistent! Check back tomorrow for the next challenge."
                : "Great job completing today's drill! Your answers have been submitted and will be graded by our team shortly."}
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!drill) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">No Drill Found</h2>
          <p className="text-slate-500 font-medium mb-8">
            There are no drills available for your subject today. Please check back later or contact support.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = drill.questions[currentQuestionIndex];

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
              <Badge variant="primary" className="text-[10px]">Day {drill.dayNumber}</Badge>
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
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Drill'}
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {drill.paperType === 'Paper 1' ? 'Multiple Choice Questions' : 'Structured Question'}
            </h2>
            {drill.paperType === 'Paper 1' && (
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Question {currentQuestionIndex + 1} of {drill.questions.length}
              </span>
            )}
          </div>
          
          {drill.paperType === 'Paper 1' && (
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / drill.questions.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {drill.paperType === 'Paper 1' ? (
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <Card className="p-8 md:p-12">
                  <p className="text-xl font-bold text-slate-800 leading-relaxed mb-12">
                    {currentQuestion.questionText}
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options?.map((option, i) => {
                      const letter = ['A', 'B', 'C', 'D'][i];
                      const isSelected = answers[currentQuestion.id] === letter;
                      const isCorrect = currentQuestion.correctAnswer === letter;
                      
                      return (
                        <button
                          key={letter}
                          disabled={showResults}
                          onClick={() => handleAnswerSelect(currentQuestion.id, letter)}
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
                            {letter}
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
                              {option}
                            </span>
                          </div>
                          {showResults && isCorrect && <CheckCircle2 className="text-emerald-600" size={24} />}
                          {showResults && isSelected && !isCorrect && <AlertCircle className="text-red-600" size={24} />}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && currentQuestion.reasoning && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 p-8 bg-indigo-50 rounded-3xl border border-indigo-100"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="text-indigo-600" size={20} />
                        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Reasoning / Explanation</h4>
                      </div>
                      <p className="text-indigo-900/80 font-medium leading-relaxed">
                        {currentQuestion.reasoning}
                      </p>
                    </motion.div>
                  )}

                  {showResults && drill.paperType === 'Paper 1' && submissions.find(s => s.questionId === currentQuestion.id)?.feedback && (
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

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2" size={20} /> Previous
              </Button>
              
              {showResults ? (
                currentQuestionIndex === drill.questions.length - 1 ? (
                  <Button onClick={() => navigate('/dashboard')}>
                    Finish Review
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                    Next Question <ChevronRight className="ml-2" size={20} />
                  </Button>
                )
              ) : (
                currentQuestionIndex === drill.questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Finish & Submit'}
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                    Next Question <ChevronRight className="ml-2" size={20} />
                  </Button>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="p-8 md:p-12">
              <div className="prose prose-slate max-w-none mb-12">
                <p className="text-xl font-bold text-slate-800 leading-relaxed">
                  {drill.questions[0].questionText}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Answer</label>
                  <textarea 
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 outline-none h-64 resize-none focus:bg-white focus:border-indigo-600 transition-all"
                    placeholder="Type your structured answer here..."
                    value={structuredAnswer}
                    onChange={e => setStructuredAnswer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attach File (Optional - PDF/DOC/Photo)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full p-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:border-indigo-600 transition-colors">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                          {file ? file.name : 'Click to upload or drag & drop'}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">PDF, DOC, or Photos accepted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Daily Drill'}
              </Button>
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
    </div>
  );
}
