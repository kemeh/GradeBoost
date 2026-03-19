import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, ArrowRight, CheckCircle2, 
  AlertCircle, Sparkles, BookOpen, 
  Zap, Trophy, ChevronRight
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Progress, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

const QUESTIONS = [
  {
    id: 'p1_1',
    paper: 'Paper 1',
    text: 'Which of the following is a characteristic of a Von Neumann architecture?',
    options: [
      'Separate memory for data and instructions',
      'Shared memory for data and instructions',
      'No CPU',
      'Only used for supercomputers'
    ],
    correct: 1
  },
  {
    id: 'p1_2',
    paper: 'Paper 1',
    text: 'What is the primary purpose of an Operating System?',
    options: [
      'To create documents',
      'To manage hardware and software resources',
      'To browse the internet',
      'To play games'
    ],
    correct: 1
  },
  {
    id: 'p1_3',
    paper: 'Paper 1',
    text: 'In networking, what does DNS stand for?',
    options: [
      'Data Network System',
      'Domain Name System',
      'Digital Network Service',
      'Direct Network Serial'
    ],
    correct: 1
  },
  {
    id: 'p2_1',
    paper: 'Paper 2',
    text: 'Explain the difference between RAM and ROM in terms of volatility and purpose.',
    type: 'text'
  },
  {
    id: 'p3_1',
    paper: 'Paper 3',
    text: 'Write a pseudocode algorithm to find the largest number in an array of integers.',
    type: 'text'
  }
];

export default function Diagnostic() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishDiagnostic();
    }
  };

  const finishDiagnostic = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const path = `users/${user.uid}`;
    try {
      // ... existing logic ...
      const p1Questions = QUESTIONS.filter(q => q.paper === 'Paper 1');
      let p1Correct = 0;
      p1Questions.forEach(q => {
        if (answers[q.id] === q.correct) p1Correct++;
      });
      const p1Score = Math.round((p1Correct / p1Questions.length) * 100);

      const p2Score = answers['p2_1']?.length > 50 ? 65 : 30;
      const p3Score = answers['p3_1']?.length > 50 ? 70 : 40;

      const avgScore = Math.round((p1Score + p2Score + p3Score) / 3);

      const results = {
        scores: {
          paper1: p1Score,
          paper2: p2Score,
          paper3: p3Score
        },
        avgScore,
        weakAreas: p2Score < 50 ? ['Structured Answers', 'Paper 2 Theory'] : [],
        recommendedPath: p2Score < 50 
          ? 'Focus on Paper 2 structured questions and foundational programming concepts.'
          : 'Maintain current progress and focus on Paper 3 advanced logic.',
        timestamp: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', user.uid), {
        hasTakenDiagnostic: true,
        diagnosticResults: results,
        updatedAt: serverTimestamp()
      });

      setIsFinished(true);
    } catch (err: any) {
      console.error("Diagnostic Error:", err);
      setError('Failed to save your results. Please check your connection and try again.');
      // Still call the utility for logging/debugging
      try { handleFirestoreError(err, OperationType.UPDATE, path); } catch(e) {}
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
              <Trophy size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Diagnostic Complete!</h1>
              <p className="text-slate-500 font-medium">We've analyzed your performance and created a custom path for you.</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Paper 1', score: user.diagnosticResults?.scores?.paper1 || 0 },
                { label: 'Paper 2', score: user.diagnosticResults?.scores?.paper2 || 0 },
                { label: 'Paper 3', score: user.diagnosticResults?.scores?.paper3 || 0 },
                { label: 'Overall', score: user.diagnosticResults?.avgScore || 0, highlight: true },
              ].map((s, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl border space-y-2",
                  s.highlight ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                )}>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    s.highlight ? "text-indigo-100" : "text-slate-400"
                  )}>{s.label}</p>
                  <p className="text-2xl font-black">{s.score}%</p>
                </div>
              ))}
            </div>

            <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 text-left space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={20} />
                <span className="text-sm font-black uppercase tracking-widest">Recommended Path</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {user.diagnosticResults?.recommendedPath}
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight className="ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[step];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <img 
            src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
            alt="GradeBoost 60 Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Target className="text-white" size={20} />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">Diagnostic Test</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-48">
            <Progress value={((step + 1) / QUESTIONS.length) * 100} />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {step + 1} of {QUESTIONS.length}</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="text-red-600 shrink-0" size={18} />
                <p className="text-xs font-bold text-red-600 leading-tight">{error}</p>
              </motion.div>
            )}

            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="p-12 space-y-8">
                <div className="space-y-4">
                  <Badge variant="primary">{currentQuestion.paper}</Badge>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentQuestion.text}
                  </h2>
                </div>

                {currentQuestion.type === 'text' ? (
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none min-h-[200px] transition-all"
                    placeholder="Type your explanation here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={e => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setAnswers({ ...answers, [currentQuestion.id]: i })}
                        className={cn(
                          "p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                          answers[currentQuestion.id] === i 
                            ? "border-indigo-600 bg-indigo-50" 
                            : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-bold",
                          answers[currentQuestion.id] === i ? "text-indigo-600" : "text-slate-600"
                        )}>{opt}</span>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          answers[currentQuestion.id] === i 
                            ? "border-indigo-600 bg-indigo-600" 
                            : "border-slate-200 group-hover:border-slate-300"
                        )}>
                          {answers[currentQuestion.id] === i && <CheckCircle2 className="text-white" size={14} />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button size="lg" onClick={handleNext} disabled={answers[currentQuestion.id] === undefined && !currentQuestion.type}>
                    {step === QUESTIONS.length - 1 ? 'Finish Test' : 'Next Question'} <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
