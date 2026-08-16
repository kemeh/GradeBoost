import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, PlayCircle, Clock, Trophy, 
  Sparkles, Award, ArrowRight, Bookmark, RotateCcw, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { fetchExams, fetchQuestions, fetchUserAttempts, fetchUserBookmarks } from '../services/questionEngineService';
import { EngineExam, QuestionEngineItem, ExamAttempt, QuestionBookmark } from '../types';

export default function StudentExamPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exams, setExams] = useState<EngineExam[]>([]);
  const [questions, setQuestions] = useState<QuestionEngineItem[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<QuestionBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLevel, setSelectedLevel] = useState<string>('Ordinary Level');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPaper, setSelectedPaper] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadPortalData = async () => {
    setLoading(true);
    const [eList, qList, aList, bList] = await Promise.all([
      fetchExams({ level: selectedLevel, subject: selectedSubject }),
      fetchQuestions({ level: selectedLevel, subject: selectedSubject, paper: selectedPaper }),
      user ? fetchUserAttempts(user.uid) : Promise.resolve([]),
      user ? fetchUserBookmarks(user.uid) : Promise.resolve([])
    ]);

    setExams(eList);
    setQuestions(qList);
    setAttempts(aList);
    setBookmarks(bList);
    setLoading(false);
  };

  useEffect(() => {
    loadPortalData();
  }, [selectedLevel, selectedSubject, selectedPaper]);

  const filteredExams = exams.filter(e => 
    !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-purple-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-bold text-xs uppercase tracking-widest backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /> Official Cameroon GCE Exam Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              GCE Examination & Practice Hub
            </h1>
            <p className="text-indigo-200 font-medium text-sm leading-relaxed">
              Prepare with authentic Ordinary Level & Advanced Level mock examinations, past paper question banks, and AI revision quizzes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/exam-analytics')}
                className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4 text-amber-500" /> My Performance Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Level Selector Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setSelectedLevel('Ordinary Level')}
                className={`flex-1 sm:flex-none py-2 px-5 font-bold text-xs rounded-lg transition-all ${
                  selectedLevel === 'Ordinary Level' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ordinary Level (O Level)
              </button>
              <button
                onClick={() => setSelectedLevel('Advanced Level')}
                className={`flex-1 sm:flex-none py-2 px-5 font-bold text-xs rounded-lg transition-all ${
                  selectedLevel === 'Advanced Level' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Advanced Level (A Level)
              </button>
            </div>

            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mock exams or subjects..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Main Section: Available Examinations */}
        <section className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Available Mock Examinations
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredExams.length} Available
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Loading Exam Registry...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-xs font-bold text-slate-500">No mock examinations found for selected level.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => {
                const userAttempt = attempts.find(a => a.examId === exam.id);
                return (
                  <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                          {exam.subject} ({exam.paper})
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} mins
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {exam.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {exam.description || `Cameroon GCE assessment for ${exam.subject}.`}
                      </p>

                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                        <span>{exam.questions.length} Questions</span>
                        <span>Pass: {exam.passingScorePercent}%</span>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                      {userAttempt ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                            userAttempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            Score: {userAttempt.percentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Not attempted</span>
                      )}

                      <button
                        onClick={() => navigate(`/exams/${exam.id}/take`)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Exam
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
