import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LessonPage() {
  const { day } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const dayNum = day ? parseInt(day) : user?.currentDay || 0;

  useEffect(() => {
    if (user) {
      fetchLesson();
    }
  }, [day, user]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const lessonsRef = collection(db, 'lessons');
      const q = query(
        lessonsRef, 
        where('day', '==', dayNum), 
        where('subject', '==', user?.subject || 'Computer Science'),
        limit(1)
      );
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'lessons');
        return;
      }
      
      if (!querySnapshot.empty) {
        setLesson(querySnapshot.docs[0].data());
      } else if (dayNum === 0) {
        setLesson({
          day: 0,
          title: "Welcome to GradeBoost 60",
          content: "Welcome to the 60-day challenge! This is Day 0, your orientation day. We will cover the syllabus overview and how to make the most of this platform. Get ready to boost your grades!",
          videoUrl: "",
          quiz: []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold animate-pulse">Loading Day {dayNum}...</p>
    </div>
  );

  if (!lesson) return (
    <div className="max-w-2xl mx-auto text-center py-32">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Lesson Locked</h2>
      <p className="text-slate-500 mb-8 text-lg">You haven't reached this day yet. Complete previous challenges to unlock this content.</p>
      <Link to="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold inline-flex">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-colors uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Clock size={14} /> 15 min read
          </div>
        </div>
      </div>

      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter">Day {dayNum}</span>
          <div className="h-px bg-slate-100 flex-1" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
          {lesson.title}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {lesson.videoUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center group cursor-pointer relative border-8 border-slate-50"
            >
              <PlayCircle className="text-white opacity-40 group-hover:opacity-100 transition-all scale-100 group-hover:scale-110" size={100} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-8 left-8 text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                Watch Video Lesson
              </div>
            </motion.div>
          )}

          <article className="prose prose-slate max-w-none">
            <div className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
              {lesson.content}
            </div>
          </article>
        </div>

        <div className="lg:col-span-4">
          <aside className="sticky top-28 space-y-8">
            <section className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-xl font-bold mb-3">Ready to test?</h3>
              <p className="text-slate-400 mb-6 text-xs leading-relaxed">
                Complete today's quiz to verify your learning and unlock the next challenge in the roadmap.
              </p>
              <Link
                to={`/lessons/${dayNum}/quiz`}
                className="w-full bg-white text-slate-900 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                Take Daily Quiz <ArrowRight size={20} />
              </Link>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Learning Goals</h4>
              <ul className="space-y-4">
                {[
                  "Master core theoretical concepts",
                  "Understand practical applications",
                  "Prepare for GCE structured questions"
                ].map((goal, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <div className="mt-1 bg-blue-50 rounded-full p-1"><ChevronRight size={12} className="text-blue-600" /></div>
                    {goal}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
