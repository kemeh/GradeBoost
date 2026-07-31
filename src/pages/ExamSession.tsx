import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Flag, Calculator as CalcIcon, ChevronLeft, ChevronRight, 
  Send, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle2, Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QuestionRenderer from '../components/QuestionRenderer';
import ScientificCalculator from '../components/ScientificCalculator';
import { 
  fetchExamById, 
  fetchQuestions, 
  gradeExamSubmission 
} from '../services/questionEngineService';
import { 
  EngineExam, 
  QuestionEngineItem, 
  ExamAttemptAnswer 
} from '../types';
import toast from 'react-hot-toast';

export default function ExamSession() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState<EngineExam | null>(null);
  const [questions, setQuestions] = useState<QuestionEngineItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamAttemptAnswer>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function initSession() {
      if (!examId) return;
      setLoading(true);

      const examData = await fetchExamById(examId);
      if (!examData) {
        toast.error('Exam not found');
        navigate('/exams');
        return;
      }

      setExam(examData);
      setTimeLeftSeconds((examData.durationMinutes || 60) * 60);

      // Load specific questions for this exam
      const allQ = await fetchQuestions({ subject: examData.subject, paper: examData.paper });
      const examQIds = new Set(examData.questions.map(q => q.questionId));
      let selectedQs = allQ.filter(q => examQIds.has(q.id));

      if (selectedQs.length === 0) {
        // Fallback to taking first available subject questions if specific refs match seed
        selectedQs = allQ.slice(0, 10);
      }

      if (examData.questionOrder === 'random') {
        selectedQs = [...selectedQs].sort(() => Math.random() - 0.5);
      }

      setQuestions(selectedQs);
      setLoading(false);
    }

    initSession();
  }, [examId]);

  // Countdown Timer Hook
  useEffect(() => {
    if (loading || timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, timeLeftSeconds]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (updated: Partial<ExamAttemptAnswer>) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || { questionId: currentQuestion.id }),
        ...updated
      }
    }));
  };

  const toggleFlagCurrent = () => {
    if (!currentQuestion) return;
    const currentFlag = answers[currentQuestion.id]?.isFlagged || false;
    handleAnswerChange({ isFlagged: !currentFlag });
    toast.success(!currentFlag ? 'Question flagged for review' : 'Flag removed');
  };

  const handleFinalSubmit = async (isTimeout = false) => {
    if (!exam || !user) return;
    setIsSubmitting(true);

    if (isTimeout) {
      toast.error('Time expired! Auto-submitting exam...', { duration: 4000 });
    }

    try {
      const attempt = await gradeExamSubmission(exam, questions, answers, {
        uid: user.uid,
        displayName: user.displayName || user.name || 'Student',
        email: user.email
      });

      setIsSubmitting(false);
      navigate(`/exams/result/${attempt.id}`, { state: { attempt, exam, questions } });
    } catch (err) {
      console.error('Submit error:', err);
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !exam || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black text-sm uppercase tracking-widest">
        Initializing Examination Engine...
      </div>
    );
  }

  const answeredCount = Object.keys(answers).filter(k => 
    answers[k]?.selectedOptionId || answers[k]?.textAnswer || answers[k]?.codeSubmission || answers[k]?.trueFalseValue !== undefined
  ).length;

  const isLowTime = timeLeftSeconds < 600; // < 10 mins
  const isCriticalTime = timeLeftSeconds < 180; // < 3 mins

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Examination Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-xs">
            GCE
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
              {exam.title}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {exam.subject} ({exam.paper}) • Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Scientific Calculator Toggle */}
          {exam.allowCalculator && (
            <button
              onClick={() => setShowCalculator(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition-all"
            >
              <CalcIcon className="w-4 h-4 text-indigo-400" /> Calculator
            </button>
          )}

          {/* Countdown Timer */}
          <div className={`px-4 py-1.5 rounded-xl font-mono font-bold text-sm flex items-center gap-2 border shadow-inner ${
            isCriticalTime 
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse' 
              : isLowTime 
              ? 'bg-amber-950/80 border-amber-600 text-amber-300' 
              : 'bg-slate-900 border-slate-700 text-emerald-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Finish & Submit
          </button>
        </div>
      </header>

      {/* Main Examination Work Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Question Render Panel */}
        <div className="flex-1 space-y-4">
          <QuestionRenderer
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            answerState={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
          />

          {/* Bottom Action Control Bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 font-bold text-xs disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={toggleFlagCurrent}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                answers[currentQuestion.id]?.isFlagged
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flag className="w-4 h-4" /> {answers[currentQuestion.id]?.isFlagged ? 'Flagged' : 'Flag Question'}
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              >
                Submit Exam <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator Side Panel */}
        <div className="w-full md:w-72 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0 space-y-6 self-start">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-3">
            <span>Question Navigator</span>
            <span className="text-emerald-400">{answeredCount}/{questions.length} Answered</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isCurrent = idx === currentIndex;
              const isAnswered = ans?.selectedOptionId || ans?.textAnswer || ans?.codeSubmission || ans?.trueFalseValue !== undefined;
              const isFlagged = ans?.isFlagged;

              let btnStyle = 'bg-slate-900 border-slate-800 text-slate-400';
              if (isAnswered) btnStyle = 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold';
              if (isFlagged) btnStyle = 'bg-amber-950 border-amber-500 text-amber-300 font-bold';
              if (isCurrent) btnStyle += ' ring-2 ring-indigo-500 text-white';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl border flex items-center justify-center font-bold text-xs relative transition-all ${btnStyle}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Flagged for Review
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-800 inline-block" /> Unanswered
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <ScientificCalculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Confirmation Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-100">Submit Examination?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span className="text-rose-400 block mt-1">Warning: {questions.length - answeredCount} questions are still unanswered.</span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-800"
              >
                Continue Exam
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleFinalSubmit(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md"
              >
                Confirm & Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
