import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Trophy, Calendar as CalendarIcon, CheckCircle2, Circle, ArrowRight, 
  BookOpen, Sparkles, Lock, Zap, ArrowLeft, FileText, Check, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { Challenge, ChallengeDay, ChallengeEnrollment, ExamQuestion } from '../types';
import { 
  fetchPublishedChallenges, fetchStudentEnrollments, enrollInChallenge, 
  fetchChallengeDays, toggleDayCompletion 
} from '../services/challengeService';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

export default function LearningChallenges() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [publishedChallenges, setPublishedChallenges] = useState<Challenge[]>([]);
  const [enrollments, setEnrollments] = useState<ChallengeEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Challenge Workspace state
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [activeEnrollment, setActiveEnrollment] = useState<ChallengeEnrollment | null>(null);
  const [challengeDays, setChallengeDays] = useState<ChallengeDay[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [dayQuestions, setDayQuestions] = useState<ExamQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user?.uid) return;
    loadChallengesAndEnrollments();
  }, [user?.uid]);

  const loadChallengesAndEnrollments = async () => {
    setLoading(true);
    try {
      const [pub, enr] = await Promise.all([
        fetchPublishedChallenges(),
        fetchStudentEnrollments(user!.uid)
      ]);
      setPublishedChallenges(pub);
      setEnrollments(enr);

      // Auto select first enrolled challenge if any
      if (enr.length > 0) {
        const firstChallenge = pub.find(c => c.id === enr[0].challengeId);
        if (firstChallenge) {
          openChallengeWorkspace(firstChallenge, enr[0]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load study challenges.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challenge: Challenge) => {
    if (!user?.uid) return;
    try {
      const newEnrollment = await enrollInChallenge(user.uid, challenge.id);
      toast.success(`Enrolled in "${challenge.title}"!`);
      const updatedEnrollments = await fetchStudentEnrollments(user.uid);
      setEnrollments(updatedEnrollments);
      openChallengeWorkspace(challenge, newEnrollment);
    } catch (err) {
      console.error(err);
      toast.error("Failed to join challenge.");
    }
  };

  const openChallengeWorkspace = async (challenge: Challenge, enrollment: ChallengeEnrollment) => {
    setActiveChallenge(challenge);
    setActiveEnrollment(enrollment);
    setLoading(true);
    try {
      const days = await fetchChallengeDays(challenge.id);
      setChallengeDays(days);
      
      // Determine default active day (first uncompleted or day 1)
      const completed = enrollment.completedDays || [];
      const nextDay = Array.from({ length: challenge.duration }, (_, i) => i + 1).find(d => !completed.includes(d)) || 1;
      setSelectedDayNumber(nextDay);
      loadQuestionsForDay(days.find(d => d.dayNumber === nextDay));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load challenge workspace.");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForDay = async (dayObj?: ChallengeDay) => {
    setSelectedAnswers({});
    setCheckedAnswers({});
    if (!dayObj?.questionIds || dayObj.questionIds.length === 0) {
      setDayQuestions([]);
      return;
    }

    try {
      // Chunk query by 10
      const qIds = dayObj.questionIds.slice(0, 10);
      const q = query(collection(db, 'exam_questions'), where(documentId(), 'in', qIds));
      const snap = await getDocs(q);
      setDayQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamQuestion)));
    } catch (err) {
      console.error("Error loading day questions:", err);
      setDayQuestions([]);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    setSelectedDayNumber(dayNum);
    const dayObj = challengeDays.find(d => d.dayNumber === dayNum);
    loadQuestionsForDay(dayObj);
  };

  const handleToggleCompleteDay = async () => {
    if (!activeChallenge || !activeEnrollment || !user?.uid) return;
    try {
      const { completedDays, progress } = await toggleDayCompletion(
        activeEnrollment.id,
        user.uid,
        activeChallenge.id,
        selectedDayNumber,
        activeChallenge.duration
      );

      setActiveEnrollment(prev => prev ? { ...prev, completedDays, progress } : null);
      setEnrollments(prev => prev.map(e => e.id === activeEnrollment.id ? { ...e, completedDays, progress } : e));
      toast.success(completedDays.includes(selectedDayNumber) ? `Day ${selectedDayNumber} marked as Complete!` : `Day ${selectedDayNumber} status updated.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update day completion.");
    }
  };

  const currentDayData = challengeDays.find(d => d.dayNumber === selectedDayNumber);
  const isSelectedDayCompleted = activeEnrollment?.completedDays?.includes(selectedDayNumber);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shrink-0"
              title="Go to Dashboard"
            >
              <LayoutDashboard size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Trophy className="text-indigo-600" />
                Learning Challenges
              </h1>
              <p className="text-slate-500 font-medium text-sm">Join custom structured study programs to boost your exam readiness.</p>
            </div>
          </div>

          {activeChallenge && (
            <Button 
              onClick={() => setActiveChallenge(null)} 
              variant="outline"
              className="border-slate-200 text-slate-700 font-bold"
            >
              <ArrowLeft size={16} className="mr-2" />
              Explore Other Challenges
            </Button>
          )}
        </div>

        {/* WORKSPACE VIEW: IF A CHALLENGE IS SELECTED */}
        {activeChallenge && activeEnrollment ? (
          <div className="space-y-8">
            {/* Active Challenge Banner */}
            <Card className="p-8 bg-indigo-950 text-white rounded-3xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-amber-400 text-amber-950 font-black">{activeChallenge.level}</Badge>
                    <Badge className="bg-white/20 text-white border-none">{activeChallenge.duration} Days</Badge>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">{activeChallenge.title}</h2>
                  <p className="text-indigo-200 text-sm font-medium mt-1 max-w-2xl">{activeChallenge.description}</p>
                </div>

                <div className="w-full md:w-64 bg-white/10 p-4 rounded-2xl border border-white/10 shrink-0">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-200 mb-2">
                    <span>Overall Progress</span>
                    <span className="text-amber-300 font-black">{activeEnrollment.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${activeEnrollment.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/70 font-medium text-right mt-1.5">
                    {activeEnrollment.completedDays?.length || 0} of {activeChallenge.duration} Days Completed
                  </p>
                </div>
              </div>
            </Card>

            {/* Dynamic Day Roadmap Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-indigo-600" />
                  Challenge Roadmap
                </h3>
                <span className="text-xs font-bold text-slate-400">Select a day to view lessons and practice</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
                {Array.from({ length: activeChallenge.duration }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isCompleted = activeEnrollment.completedDays?.includes(dayNum);
                  const isSelected = selectedDayNumber === dayNum;

                  return (
                    <motion.button
                      key={dayNum}
                      whileHover={{ y: -2 }}
                      onClick={() => handleSelectDay(dayNum)}
                      className={cn(
                        "p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                          : isCompleted 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200"
                      )}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Day</span>
                      <span className="text-lg font-black">{dayNum}</span>
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className={isSelected ? "text-white" : "text-emerald-500"} />
                        ) : isSelected ? (
                          <Zap size={16} className="text-amber-300 animate-pulse" />
                        ) : (
                          <Circle size={14} className="opacity-30" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* DAY WORKSPACE PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Lesson & Material */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Day {selectedDayNumber} Activity</span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        {currentDayData?.title || `Day ${selectedDayNumber} Study Topic`}
                      </h2>
                    </div>

                    <Button
                      onClick={handleToggleCompleteDay}
                      variant={isSelectedDayCompleted ? "outline" : "primary"}
                      className={cn(
                        "font-bold px-6 py-3 rounded-2xl transition-all",
                        isSelectedDayCompleted 
                          ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      )}
                    >
                      {isSelectedDayCompleted ? (
                        <>
                          <CheckCircle2 size={18} className="mr-2 text-emerald-600" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Check size={18} className="mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>

                  {currentDayData?.description && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm font-medium">
                      {currentDayData.description}
                    </div>
                  )}

                  {/* Lesson Markdown Content */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen size={18} className="text-indigo-600" />
                      Lesson Notes & Concepts
                    </h3>
                    <div className="prose prose-slate max-w-none bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-slate-800 text-sm leading-relaxed">
                      {currentDayData?.lessonContent ? (
                        <ReactMarkdown>{currentDayData.lessonContent}</ReactMarkdown>
                      ) : (
                        <p className="italic text-slate-400">Lesson notes for Day {selectedDayNumber} will be posted by the course admin.</p>
                      )}
                    </div>
                  </div>

                  {/* SYSCOHADA Practical Lab Integration Link */}
                  {activeChallenge?.id === 'challenge_syscohada_30' && (
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-2xl">
                          <LayoutDashboard size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-indigo-950">SYSCOHADA Interactive Accounting Lab</h4>
                          <p className="text-xs text-indigo-700 font-medium">Launch the real-time double-entry practice simulator with automatic general ledger postings.</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate('/accounting-lab')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-100 w-full sm:w-auto justify-center"
                      >
                        Launch Lab <ArrowRight size={14} />
                      </Button>
                    </div>
                  )}

                  {/* Revision Link */}
                  {currentDayData?.revisionMaterial && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-emerald-600" />
                        <div>
                          <h4 className="text-sm font-bold text-emerald-950">Revision & Reading Resource</h4>
                          <p className="text-xs text-emerald-700">Access supplementary study materials for today.</p>
                        </div>
                      </div>
                      <a 
                        href={currentDayData.revisionMaterial} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        Open Resource
                      </a>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: Practice Questions */}
              <div className="space-y-6">
                <Card className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    Day {selectedDayNumber} Practice Questions
                  </h3>

                  {dayQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold text-xs">
                      No interactive MCQs assigned for Day {selectedDayNumber}. Read the lesson notes and mark complete when ready!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {dayQuestions.map((q, idx) => {
                        const isChecked = checkedAnswers[q.id];
                        const selectedOpt = selectedAnswers[q.id];
                        const isCorrect = selectedOpt === q.correctAnswer;

                        return (
                          <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question {idx + 1}</span>
                            <p className="text-sm font-bold text-slate-900">{q.questionText}</p>

                            <div className="space-y-2">
                              {Object.entries(q.options || {}).map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => !isChecked && setSelectedAnswers({ ...selectedAnswers, [q.id]: key })}
                                  className={cn(
                                    "w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between",
                                    selectedOpt === key 
                                      ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold" 
                                      : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                                  )}
                                >
                                  <span><strong className="mr-1.5">{key}:</strong> {val}</span>
                                </button>
                              ))}
                            </div>

                            {!isChecked ? (
                              <Button
                                size="sm"
                                disabled={!selectedOpt}
                                onClick={() => setCheckedAnswers({ ...checkedAnswers, [q.id]: true })}
                                className="w-full bg-slate-900 text-white font-bold text-xs py-2 rounded-xl mt-2"
                              >
                                Check Answer
                              </Button>
                            ) : (
                              <div className={cn(
                                "p-3 rounded-xl text-xs font-bold border",
                                isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                              )}>
                                {isCorrect ? "Correct! Well done." : `Incorrect. Correct Answer: ${q.correctAnswer}`}
                                {q.explanation && (
                                  <p className="text-[11px] font-medium text-slate-600 mt-1 italic">
                                    {q.explanation}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* LIST OF ALL AVAILABLE & ENROLLED CHALLENGES */
          <div className="space-y-8">
            {/* My Joined Challenges Section */}
            {enrollments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">My Active Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enr) => {
                    const ch = publishedChallenges.find(c => c.id === enr.challengeId);
                    if (!ch) return null;

                    return (
                      <Card key={enr.id} className="p-6 bg-white border border-indigo-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold">{ch.level}</Badge>
                            <span className="text-xs font-black text-indigo-600">{enr.progress}% Done</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-2">{ch.title}</h3>
                          <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-4">{ch.description}</p>
                          
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${enr.progress}%` }} />
                          </div>
                        </div>

                        <Button 
                          onClick={() => openChallengeWorkspace(ch, enr)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                        >
                          Continue Learning
                          <ArrowRight size={18} />
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explore Available Challenges */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore Available Study Challenges</h2>
              {loading ? (
                <div className="py-12 text-center text-slate-400 font-bold">Loading available challenges...</div>
              ) : publishedChallenges.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                  <Trophy size={36} className="text-slate-300 mx-auto" />
                  <h3 className="text-lg font-black text-slate-800">No Challenges Available Yet</h3>
                  <p className="text-slate-500 text-xs font-medium max-w-md mx-auto">
                    Check back soon! Our academic admins are preparing structured 7, 14, 30, and 60-day study programs for you.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedChallenges.map((ch) => {
                    const isEnrolled = enrollments.some(e => e.challengeId === ch.id);

                    return (
                      <Card key={ch.id} className="p-6 bg-white border border-slate-200 rounded-3xl hover:shadow-lg transition-all flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold">{ch.level}</Badge>
                            <Badge className="bg-amber-100 text-amber-800 border-none font-bold">{ch.duration} Days</Badge>
                          </div>

                          {ch.image && (
                            <img src={ch.image} alt={ch.title} className="w-full h-36 object-cover rounded-2xl mb-4 border border-slate-100" />
                          )}

                          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{ch.title}</h3>
                          <p className="text-slate-500 text-xs font-medium line-clamp-3 mb-4">{ch.description}</p>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {ch.subjects.map((sub, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        {isEnrolled ? (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              const enr = enrollments.find(e => e.challengeId === ch.id);
                              if (enr) openChallengeWorkspace(ch, enr);
                            }}
                            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold py-3 rounded-2xl"
                          >
                            Go to Challenge
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleJoinChallenge(ch)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                          >
                            Join Challenge
                            <ArrowRight size={18} />
                          </Button>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
