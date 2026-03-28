import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, Send, 
  FileText, Target, Zap, 
  ArrowLeft, Lock, Sparkles, Trophy, MessageSquare, X, Download, LayoutDashboard
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';
import { Button, Card, Badge, cn, RadioGroup, RadioGroupItem, Label, Progress } from '../components/ui';
import { ExamQuestion } from '../types';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { fetchDailyDrill } from '../services/dailyDrillService';

export default function RandomPractice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!user?.subject) return;
      
      try {
        setLoading(true);
        // Fetch 10 random questions for the user's subject
        const data = await fetchDailyDrill(user.subject, "Paper 1");
        if (data.length > 0) {
          setQuestions(data as ExamQuestion[]);
        } else {
          toast.error("No questions found for your subject.");
        }
      } catch (error) {
        console.error("Error loading random questions:", error);
        toast.error("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user?.subject]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) {
        return;
      }
    }

    setSubmitting(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    
    try {
      // Save results to a generic practice_results collection
      await addDoc(collection(db, 'practice_results'), {
        userId: user?.uid,
        userName: user?.name,
        subject: user?.subject,
        score: finalScore,
        totalQuestions: questions.length,
        answers,
        type: 'random_practice',
        timestamp: serverTimestamp()
      });

      setShowResults(true);
      toast.success("Practice session completed!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'practice_results');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center animate-bounce mb-8">
          <Sparkles className="text-indigo-600" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Generating Your Practice Session...</h2>
        <p className="text-slate-500 font-medium">We're picking 10 random questions to test your knowledge.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8">
          <AlertCircle className="text-rose-600" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Questions Found</h2>
        <p className="text-slate-500 font-medium mb-8">We couldn't find any questions for {user?.subject}.</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <LayoutDashboard size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Practice Results</h1>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
          <Card className="p-12 text-center mb-12 bg-white border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px]">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 mb-8">
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Great Effort!</h2>
            <p className="text-slate-500 font-medium mb-12">You've completed your random practice session.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Score</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{score} / {questions.length}</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{Math.round(percentage)}%</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Spent</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) % 60000) / 1000)}s
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-7 rounded-2xl text-lg shadow-lg shadow-indigo-100"
              >
                Try Another Set
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="font-black px-12 py-7 rounded-2xl text-lg border-slate-200"
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>

          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight px-4">Question Review</h3>
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className={cn(
                  "p-8 rounded-[32px] border-2 transition-all",
                  isCorrect ? "border-emerald-100 bg-white" : "border-rose-100 bg-white"
                )}>
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                        isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}>
                        {idx + 1}
                      </div>
                      <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 uppercase tracking-widest text-[10px]">
                        {q.topic}
                      </Badge>
                    </div>
                    {isCorrect ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest">
                        <CheckCircle2 size={20} /> Correct
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-600 font-black text-sm uppercase tracking-widest">
                        <AlertCircle size={20} /> Incorrect
                      </div>
                    )}
                  </div>

                  <p className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {Object.entries(q.options || {}).map(([key, value]) => (
                      <div 
                        key={key}
                        className={cn(
                          "p-5 rounded-2xl border-2 font-bold transition-all flex items-center gap-4",
                          key === q.correctAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-900" :
                          key === userAnswer ? "border-rose-500 bg-rose-50 text-rose-900" :
                          "border-slate-50 bg-slate-50 text-slate-400"
                        )}
                      >
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black",
                          key === q.correctAnswer ? "bg-emerald-500 text-white" :
                          key === userAnswer ? "bg-rose-500 text-white" :
                          "bg-slate-200 text-slate-500"
                        )}>
                          {key}
                        </span>
                        {value}
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Explanation</p>
                    <p className="text-slate-600 font-medium leading-relaxed">{q.explanation}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <LayoutDashboard size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Random Practice</h1>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none text-[10px] font-black uppercase tracking-widest">
                {user?.subject}
              </Badge>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Progress</span>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-slate-200 font-black"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Finish Session'}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Question {currentIndex + 1}
                      </span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {currentQuestion.topic}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                      {currentQuestion.questionText}
                    </h2>
                  </div>

                  <RadioGroup 
                    value={answers[currentQuestion.id] || ''} 
                    onValueChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                    className="grid grid-cols-1 gap-4"
                  >
                    {Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                      <div key={key}>
                        <RadioGroupItem
                          value={key}
                          id={`option-${key}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`option-${key}`}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all hover:bg-slate-50 active:scale-[0.98]",
                            answers[currentQuestion.id] === key 
                              ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100/50" 
                              : "border-slate-100 bg-white"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors",
                              answers[currentQuestion.id] === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                              {key}
                            </div>
                            <span className="text-lg font-bold text-slate-700">{value}</span>
                          </div>
                          {answers[currentQuestion.id] === key && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                              <CheckCircle2 className="text-white" size={14} />
                            </div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="w-full lg:w-96 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 p-8 flex flex-col">
          <div className="flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Question Map</h3>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-full aspect-square rounded-xl font-black text-sm transition-all flex items-center justify-center relative",
                    currentIndex === i ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" :
                    answers[q.id] ? "bg-white border-2 border-indigo-100 text-indigo-600" :
                    "bg-white border-2 border-slate-100 text-slate-300 hover:border-slate-200"
                  )}
                >
                  {i + 1}
                  {answers[q.id] && currentIndex !== i && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 py-6 rounded-2xl border-slate-200 font-black"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-2" size={20} /> Previous
              </Button>
              <Button 
                className="flex-1 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black"
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-2" size={20} />
              </Button>
            </div>
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {Object.keys(answers).length} of {questions.length} Answered
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
