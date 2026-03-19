import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, limit, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCw, 
  ArrowRight, 
  Brain, 
  Code, 
  FileText,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Progress } from '../components/ui';

type QuestionType = 'mcq' | 'structured' | 'practical';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  hint?: string;
  keywords?: string[];
}

export default function QuizPage() {
  const { day } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLesson();
  }, [day]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const dayNum = parseInt(day!);
      const lessonsRef = collection(db, 'lessons');
      const q = query(lessonsRef, where('day', '==', dayNum), limit(1));
      const querySnapshot = await getDocs(q);
      
      let lessonData: any = null;
      if (!querySnapshot.empty) {
        lessonData = querySnapshot.docs[0].data();
      }

      if (lessonData) {
        setLesson(lessonData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (val: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: val }));
  };

  const calculateScore = () => {
    let score = 0;
    const feedback: any[] = [];

    lesson.quiz.forEach((q: Question, idx: number) => {
      const userAnswer = answers[idx];
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) score++;
      } else if (q.type === 'structured' || q.type === 'practical') {
        // Simple keyword matching for structured/practical
        if (q.keywords && userAnswer) {
          const matched = q.keywords.filter(kw => 
            userAnswer.toLowerCase().includes(kw.toLowerCase())
          );
          isCorrect = matched.length >= Math.ceil(q.keywords.length / 2);
          if (isCorrect) score++;
        } else {
          // If no keywords, assume it needs manual review but give partial credit for effort
          isCorrect = (userAnswer?.length || 0) > 20;
          if (isCorrect) score += 0.5;
        }
      }

      feedback.push({
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        type: q.type
      });
    });

    return { score, total: lesson.quiz.length, feedback };
  };

  const handleSubmit = async () => {
    try {
      const { score, total, feedback } = calculateScore();
      const percentage = Math.round((score / total) * 100);
      
      // Generate improvement suggestions
      const suggestions = [];
      if (percentage < 60) {
        suggestions.push("Review the core concepts of this lesson before moving on.");
        suggestions.push("Try the practical exercises again to build muscle memory.");
      } else if (percentage < 85) {
        suggestions.push("Great job! You've mastered the basics. Focus on the edge cases now.");
      } else {
        suggestions.push("Excellent mastery! You're ready for the next challenge.");
      }

      const resultData = { score, total, percentage, feedback, suggestions };
      setResult(resultData);

      if (auth.currentUser && user) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const dayNum = parseInt(day!);
        
        const newProgress = {
          day: dayNum,
          score: percentage,
          completedAt: new Date().toISOString()
        };

        const updates: any = {
          progress: arrayUnion(newProgress),
          lastCompletedAt: new Date().toISOString(),
          examHistory: arrayUnion({
            examTitle: `Day ${dayNum} Quiz: ${lesson.title}`,
            score: percentage,
            completedAt: new Date().toISOString()
          })
        };

        if (percentage >= 60 && user.currentDay === dayNum && dayNum < 60) {
          updates.currentDay = dayNum + 1;
        }

        await updateDoc(userRef, updates);
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Analyzing Syllabus...</p>
    </div>
  );

  if (!lesson || !lesson.quiz || lesson.quiz.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8">
        <Card className="p-12 space-y-6">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto">
            <FileText size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">No Quiz Found</h2>
          <p className="text-slate-500 font-medium">This lesson doesn't have a quiz yet. Keep exploring other topics!</p>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (result) {
    const isPassed = result.percentage >= 60;
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 space-y-10">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${isPassed ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' : 'bg-red-50 text-red-600 shadow-red-100'}`}>
            {isPassed ? <Trophy size={48} /> : <XCircle size={48} />}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {isPassed ? 'Outstanding Work!' : 'Room for Improvement'}
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              You scored <span className="text-indigo-600 font-black">{result.score}</span> out of <span className="font-bold">{result.total}</span> ({result.percentage}%)
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Brain size={20} className="text-indigo-600" /> Improvement Suggestions
            </h3>
            <div className="space-y-4">
              {result.suggestions.map((s: string, i: number) => (
                <div key={i} className="flex gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <Lightbulb size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-900 font-medium leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance Breakdown</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Accuracy</span>
                  <span>{result.percentage}%</span>
                </div>
                <Progress value={result.percentage} color={isPassed ? "success" : "danger"} />
              </div>
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p>
                  <p className="text-2xl font-black text-emerald-600">{result.score}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incorrect</p>
                  <p className="text-2xl font-black text-red-600">{result.total - Math.floor(result.score)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 space-y-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-6">Detailed Review</h3>
          <div className="space-y-10">
            {result.feedback.map((f: any, i: number) => (
              <div key={i} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Question {i + 1}</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{f.question}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {f.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Answer</p>
                    <p className="text-sm font-bold text-slate-700">
                      {f.type === 'mcq' ? lesson.quiz[i].options[f.userAnswer] || 'No answer' : f.userAnswer || 'No answer'}
                    </p>
                  </div>
                  {!f.isCorrect && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Explanation</p>
                      <p className="text-sm text-slate-600 italic leading-relaxed">{f.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={() => { setResult(null); setCurrentQuestionIdx(0); setAnswers({}); }}
          >
            <RefreshCw size={20} className="mr-2" /> Retake Quiz
          </Button>
          <Link to="/dashboard" className="flex-1">
            <Button size="lg" className="w-full">
              Back to Dashboard <ChevronRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const q = lesson.quiz[currentQuestionIdx] as Question;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <Link to={`/lessons/${day}`}>
          <Button variant="ghost" size="sm" className="text-slate-400">
            <ArrowLeft size={18} className="mr-2" /> Quit Quiz
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="text-[10px]">
            {q.type.toUpperCase()}
          </Badge>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Question {currentQuestionIdx + 1} / {lesson.quiz.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={((currentQuestionIdx + 1) / lesson.quiz.length) * 100} color="primary" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIdx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-10"
        >
          <Card className="p-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">
                {q.question}
              </h2>
              {q.hint && (
                <div className="pt-2">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-700"
                  >
                    <Lightbulb size={12} /> {showHint ? "Hide Hint" : "Show Hint"}
                  </button>
                  {showHint && (
                    <motion.p 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="text-sm text-slate-500 italic mt-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                    >
                      {q.hint}
                    </motion.p>
                  )}
                </div>
              )}
            </div>

            {q.type === 'mcq' && (
              <div className="grid gap-4">
                {q.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`
                      w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group
                      ${answers[currentQuestionIdx] === idx 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'}
                    `}
                  >
                    <span className="font-bold text-lg">{option}</span>
                    <div className={`
                      w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors
                      ${answers[currentQuestionIdx] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'}
                    `}>
                      {answers[currentQuestionIdx] === idx && <CheckCircle2 size={18} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {q.type === 'structured' && (
              <div className="space-y-4">
                <textarea
                  value={answers[currentQuestionIdx] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-48 p-6 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 focus:ring-0 transition-all text-lg font-medium resize-none"
                />
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Structured Response</span>
                </div>
              </div>
            )}

            {q.type === 'practical' && (
              <div className="space-y-4">
                <textarea
                  value={answers[currentQuestionIdx] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="// Write your code or logic steps here..."
                  className="w-full h-64 p-6 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 focus:ring-0 transition-all text-lg font-mono bg-slate-900 text-indigo-400 resize-none"
                />
                <div className="flex items-center gap-2 text-slate-400">
                  <Code size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Practical Implementation</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          disabled={currentQuestionIdx === 0}
          onClick={() => { setCurrentQuestionIdx(prev => prev - 1); setShowHint(false); }}
        >
          <ChevronLeft size={20} className="mr-2" /> Previous
        </Button>
        
        {currentQuestionIdx === lesson.quiz.length - 1 ? (
          <Button
            size="lg"
            disabled={answers[currentQuestionIdx] === undefined || answers[currentQuestionIdx] === ''}
            onClick={handleSubmit}
            className="px-12"
          >
            Submit Quiz <Send size={20} className="ml-2" />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={answers[currentQuestionIdx] === undefined || answers[currentQuestionIdx] === ''}
            onClick={() => { setCurrentQuestionIdx(prev => prev + 1); setShowHint(false); }}
            className="px-12"
          >
            Next Question <ChevronRight size={20} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
