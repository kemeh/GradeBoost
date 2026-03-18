import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trophy, Clock, FileText, ChevronRight, Sparkles, ShieldCheck, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { downloadExamPDF } from '../utils/pdfGenerator';

export default function MockExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const q = query(collection(db, 'mockExams'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const examsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If no exams exist, provide some defaults for demonstration
      if (examsData.length === 0) {
        setExams([
          {
            id: 'gce-2025-paper-1',
            title: 'GCE 2025 Mock - Paper 1',
            description: 'Full syllabus coverage. 50 Multiple Choice Questions.',
            duration: 90, // minutes
            totalQuestions: 50,
            difficulty: 'Advanced',
            category: 'Computer Science'
          },
          {
            id: 'gce-2025-paper-2',
            title: 'GCE 2025 Mock - Paper 2',
            description: 'Structured and Problem Solving questions.',
            duration: 120,
            totalQuestions: 10,
            difficulty: 'Advanced',
            category: 'Computer Science'
          }
        ]);
      } else {
        setExams(examsData);
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
      <p className="text-slate-500 font-bold animate-pulse">Loading Mock Exams...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <ShieldCheck size={12} /> Exam Simulation
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
          Mock GCE <br />
          <span className="text-blue-600">Exam Center</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
          Simulate the real GCE environment with timed sessions, structured scoring, and full syllabus coverage.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div className="flex gap-2">
                <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {exam.category}
                </span>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {exam.difficulty}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{exam.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                {exam.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold">{exam.duration} Minutes</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Trophy size={14} />
                <span className="text-[10px] font-bold">
                  {exam.type === 'STRUCTURED' ? `${exam.questions.length} Tasks` : `${exam.questions.length} Questions`}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                exam.type === 'STRUCTURED' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {exam.type === 'STRUCTURED' ? (exam.title.includes('Paper 3') ? 'Paper 3 (Practical)' : 'Paper 2 (Structured)') : 'Paper 1 (MCQ)'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/exams/${exam.id}`}
                className="flex-1 bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-blue-600 shadow-xl text-sm"
              >
                Start Simulation <ChevronRight size={18} />
              </Link>
              <button
                onClick={() => downloadExamPDF(exam)}
                className="bg-slate-100 text-slate-600 font-black p-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                title="Download PDF"
              >
                <Download size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-blue-600 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-none">
              Why take mock exams?
            </h2>
            <ul className="space-y-3">
              {[
                "Practice time management under pressure",
                "Identify weak areas in your knowledge",
                "Get familiar with GCE question formats",
                "Build confidence for the actual exam"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-blue-100 text-sm">
                  <Sparkles size={14} className="text-blue-200" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/10">
            <p className="text-base font-medium leading-relaxed italic">
              "The mock exams on GradeBoost 60 were the turning point for me. I learned how to pace myself and what to expect on the big day."
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-400" />
              <div>
                <p className="text-xs font-black">Awa Marie</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">2024 GCE Candidate</p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </section>
    </div>
  );
}
