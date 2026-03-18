import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { Link } from 'react-router-dom';
import { CheckCircle2, Play, Trophy, ArrowRight, BookOpen, BrainCircuit, CreditCard, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [nextLesson, setNextLesson] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setProgress(Math.round((user.currentDay / 60) * 100));
      fetchNextLesson();
    }
  }, [user]);

  const fetchNextLesson = async () => {
    try {
      const lessonsRef = collection(db, 'lessons');
      const q = query(lessonsRef, where('day', '==', user?.currentDay || 0), limit(1));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'lessons');
        return;
      }
      
      if (!querySnapshot.empty) {
        setNextLesson(querySnapshot.docs[0].data());
      } else if (user?.currentDay === 0) {
        setNextLesson({
          day: 0,
          title: "Welcome to GradeBoost 60",
          content: "Welcome to the 60-day challenge! This is Day 0, your orientation day. We will cover the syllabus overview and how to make the most of this platform. Get ready to boost your grades!",
          videoUrl: "",
          quiz: []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user?.isPaid) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center"
        >
          <div className="bg-red-50 text-red-600 w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
            <CreditCard size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Unlock the Challenge</h2>
          <p className="text-slate-600 mb-10 text-base md:text-lg leading-relaxed">
            You're just one step away from mastering the Cameroon GCE A-Level syllabus. 
            Join 500+ students in the 60-day GradeBoost program.
          </p>
          <Link
            to="/payment"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 md:px-10 md:py-5 rounded-2xl transition-all shadow-xl shadow-blue-200 text-base md:text-lg w-full md:w-auto justify-center"
          >
            Unlock All 60 Days <ArrowRight size={24} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-20 px-4 md:px-0">
      {/* Hero Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">Welcome back, {user.name.split(' ')[0]}!</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
            <p className="text-xl md:text-2xl font-black text-blue-600">{progress}%</p>
          </div>
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-600 md:bg-blue-50 flex items-center justify-center text-white md:text-blue-600 border border-blue-100 shadow-lg shadow-blue-100 md:shadow-none">
            <Trophy size={20} className="md:w-7 md:h-7" />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Current Day */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-1.5 h-6 md:w-2 md:h-8 bg-blue-600 rounded-full" />
                Current Challenge
              </h2>
            </div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="relative z-10">
                <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-bold mb-4 md:mb-6">
                  Day {user.currentDay} of 60
                </span>
                
                {nextLesson ? (
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{nextLesson.title}</h3>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl">
                      {nextLesson.content.substring(0, 150)}...
                    </p>
                    <div className="pt-4 md:pt-6">
                      <Link
                        to={`/lessons/${user.currentDay}`}
                        className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white font-bold px-6 py-3.5 md:px-8 md:py-4 rounded-xl transition-all shadow-xl shadow-slate-200 w-full md:w-auto justify-center"
                      >
                        Start Today's Lesson <ArrowRight size={20} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 md:h-10 bg-slate-100 rounded-lg w-3/4" />
                    <div className="h-16 md:h-20 bg-slate-100 rounded-lg" />
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* Roadmap Grid */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-1.5 h-6 md:w-2 md:h-8 bg-slate-200 rounded-full" />
                Roadmap
              </h2>
              <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done</div>
                <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Current</div>
                <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-slate-100" /> Locked</div>
              </div>
            </div>

            <div className="day-grid">
              {/* Day 0 to 60 */}
              {Array.from({ length: 61 }).map((_, i) => {
                const day = i;
                const isCompleted = day < user.currentDay;
                const isCurrent = day === user.currentDay;
                const isLocked = day > user.currentDay;

                return (
                  <Link
                    key={day}
                    to={isLocked ? '#' : `/lessons/${day}`}
                    className={`
                      aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-bold transition-all relative group
                      ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100' : ''}
                      ${isCurrent ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110 z-10 ring-4 ring-blue-50' : ''}
                      ${isLocked ? 'bg-slate-50 text-slate-300 border-2 border-slate-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isCompleted ? <CheckCircle2 size={20} className="md:w-6 md:h-6" /> : isLocked ? <Lock size={14} className="opacity-40" /> : day}
                    
                    {/* Tooltip on hover */}
                    {!isLocked && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        Day {day}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Stats & Tips */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <section className="bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-base md:text-lg font-bold mb-6 flex items-center gap-2">
              <BrainCircuit className="text-blue-400 md:w-5 md:h-5" size={18} />
              Quick Stats
            </h2>
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs md:text-sm font-medium">Lessons Done</span>
                <span className="text-lg md:text-xl font-bold">{user.currentDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs md:text-sm font-medium">Days Left</span>
                <span className="text-lg md:text-xl font-bold text-blue-400">{60 - user.currentDay}</span>
              </div>
              <div className="pt-4 md:pt-6 border-t border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Recent Achievement</p>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <p className="text-xs font-bold">Early Bird</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-6">Study Tip</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs leading-relaxed italic">
                "Focus on understanding the 'why' behind the logic. In Computer Science, concepts are interconnected."
              </div>
              <p className="text-[10px] text-slate-400 text-center font-black uppercase tracking-widest">— Vertexon Mentors</p>
            </div>
          </section>

          {user.examHistory && user.examHistory.length > 0 && (
            <section className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-6">Mock Exam History</h2>
              <div className="space-y-4">
                {user.examHistory.slice(-3).reverse().map((exam: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{exam.examTitle}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(exam.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-black ${exam.score >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {exam.score}%
                    </div>
                  </div>
                ))}
                {user.examHistory.length > 3 && (
                  <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest pt-2">
                    + {user.examHistory.length - 3} more attempts
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
