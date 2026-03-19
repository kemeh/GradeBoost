import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, limit, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function QuizPage() {
  const { day } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'lessons');
        return;
      }
      
      let lessonData: any = null;
      if (!querySnapshot.empty) {
        lessonData = querySnapshot.docs[0].data();
      } else if (dayNum === 0) {
        lessonData = {
          day: 0,
          title: "Welcome to GradeBoost 60",
          content: "Welcome to the 60-day challenge! This is Day 0, your orientation day. We will cover the syllabus overview and how to make the most of this platform. Get ready to boost your grades!",
          videoUrl: "",
          quiz: []
        };
      }

      if (lessonData) {
        setLesson(lessonData);
        setAnswers(new Array((lessonData.quiz || []).length).fill(-1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const dayNum = parseInt(day!);
      let score = 0;
      lesson.quiz.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correctAnswer) score++;
      });

      const percentage = Math.round((score / lesson.quiz.length) * 100);
      const resultData = { score, total: lesson.quiz.length, percentage };
      setResult(resultData);

      if (auth.currentUser && user) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        // Update progress
        const newProgress = {
          day: dayNum,
          score: percentage,
          completedAt: new Date().toISOString()
        };

        // Streak logic
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        
        let newStreak = user.streak || 0;
        const lastCompleted = user.lastCompletedAt ? new Date(user.lastCompletedAt) : null;
        
        if (!lastCompleted) {
          newStreak = 1;
        } else {
          const lastDate = new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate()).getTime();
          const diff = today - lastDate;
          
          if (diff === oneDay) {
            // Completed yesterday, increment streak
            newStreak += 1;
          } else if (diff > oneDay) {
            // Missed a day, reset streak
            newStreak = 1;
          }
          // If diff === 0, already completed today, streak remains same
        }

        const updates: any = {
          progress: arrayUnion(newProgress),
          lastCompletedAt: now.toISOString(),
          streak: newStreak
        };

        // Unlock next day if passed
        if (percentage >= 60 && user.currentDay === dayNum && dayNum < 60) {
          updates.currentDay = dayNum + 1;
        }

        try {
          await updateDoc(userRef, updates);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold animate-pulse">Loading Quiz...</p>
    </div>
  );

  if (!lesson) return <div className="text-center py-20">Quiz not found.</div>;

  if (!lesson.quiz || lesson.quiz.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
          <RefreshCw size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Quiz Available</h2>
        <p className="text-slate-500 font-medium">There is no quiz for this lesson yet. Please check back later or continue to the next lesson.</p>
        <Link to="/dashboard" className="inline-flex bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (result) {
    const isPassed = result.percentage >= 60;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-100 text-center"
        >
          <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 rotate-6 ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {isPassed ? <Trophy size={40} /> : <XCircle size={40} />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tighter">
            {isPassed ? 'Victory!' : 'Keep Going'}
          </h2>
          <p className="text-slate-500 mb-8 text-base font-medium">
            You scored {result.score} out of {result.total} ({result.percentage}%)
          </p>
          
          <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left space-y-8">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-200 pb-4">Review Results</h3>
            {lesson.quiz.map((q: any, idx: number) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              return (
                <div key={idx} className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-bold text-slate-800 leading-tight">
                      <span className="text-slate-400 mr-2">{idx + 1}.</span>
                      {q.question}
                    </p>
                    {isCorrect ? (
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={20} className="text-red-500 shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 ml-6">
                    {q.options.map((option: string, optIdx: number) => {
                      const isUserChoice = answers[idx] === optIdx;
                      const isCorrectChoice = q.correctAnswer === optIdx;
                      
                      let bgColor = 'bg-white';
                      let borderColor = 'border-slate-100';
                      let textColor = 'text-slate-600';

                      if (isCorrectChoice) {
                        bgColor = 'bg-emerald-50';
                        borderColor = 'border-emerald-200';
                        textColor = 'text-emerald-900';
                      } else if (isUserChoice && !isCorrect) {
                        bgColor = 'bg-red-50';
                        borderColor = 'border-red-200';
                        textColor = 'text-red-900';
                      }

                      return (
                        <div 
                          key={optIdx} 
                          className={`px-4 py-3 rounded-xl border-2 text-xs font-bold flex items-center justify-between ${bgColor} ${borderColor} ${textColor}`}
                        >
                          <span>{option}</span>
                          {isCorrectChoice && <CheckCircle2 size={14} className="text-emerald-600" />}
                          {isUserChoice && !isCorrect && <XCircle size={14} className="text-red-600" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isCorrect && q.explanation && (
                    <div className="ml-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Explanation</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => { setResult(null); setCurrentQuestion(0); setAnswers(new Array(lesson.quiz.length).fill(-1)); }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={20} /> Try Again
            </button>
            {isPassed && parseInt(day!) < 60 ? (
              <Link
                to={`/lessons/${parseInt(day!) + 1}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200"
              >
                Next Lesson <ArrowRight size={20} />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200"
              >
                Dashboard
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const q = lesson.quiz[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      <div className="flex items-center justify-between">
        <Link to={`/lessons/${day}`} className="text-slate-400 hover:text-blue-600 flex items-center gap-2 font-black uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Quit
        </Link>
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Question {currentQuestion + 1} / {lesson.quiz.length}
        </div>
      </div>

      <div className="bg-slate-100 h-3 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / lesson.quiz.length) * 100}%` }}
          className="bg-blue-600 h-full"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-100"
        >
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">{q.question}</h2>
          
          <div className="space-y-3">
            {q.options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`
                  w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group
                  ${answers[currentQuestion] === idx 
                    ? 'border-blue-600 bg-blue-50 text-blue-900' 
                    : 'border-slate-50 hover:border-blue-100 hover:bg-slate-50 text-slate-600'}
                `}
              >
                <span className="font-bold text-base">{option}</span>
                <div className={`
                  w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors
                  ${answers[currentQuestion] === idx ? 'border-blue-600 bg-blue-600' : 'border-slate-200 group-hover:border-blue-300'}
                `}>
                  {answers[currentQuestion] === idx && <CheckCircle2 size={18} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-8">
        <button
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-xs disabled:opacity-30 hover:text-slate-900 transition-colors"
        >
          Previous
        </button>
        
        {currentQuestion === lesson.quiz.length - 1 ? (
          <button
            disabled={answers[currentQuestion] === -1}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 py-5 rounded-2xl transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            disabled={answers[currentQuestion] === -1}
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
