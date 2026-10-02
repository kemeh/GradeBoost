import React, { useState } from 'react';
import { 
  Award, Clock, FileText, CheckCircle2, ArrowRight, 
  Sparkles, BookOpen, AlertCircle, Play, Timer, Send, 
  ChevronRight, RefreshCw, X, ShieldAlert, Check
} from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button, Card, CodeEditorTextarea, cn } from '../components/ui';
import { generateMockGceExam } from '../services/dailyGceService';
import { GCE_SUBJECT_STRUCTURES } from '../server/dailyGceEngine';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function MockExamsPage() {
  const [level, setLevel] = useState<'Ordinary Level' | 'Advanced Level'>('Advanced Level');
  const [subject, setSubject] = useState('Computer Science');
  const [paper, setPaper] = useState('Paper 2');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [loading, setLoading] = useState(false);
  const [activeExam, setActiveExam] = useState<any | null>(null);

  // Live Exam State
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(180 * 60);

  const subjectList = Object.keys(GCE_SUBJECT_STRUCTURES);
  const availablePapers = level === 'Advanced Level' 
    ? (GCE_SUBJECT_STRUCTURES[subject]?.advancedLevel?.paper3 ? ['Paper 1', 'Paper 2', 'Paper 3'] : ['Paper 1', 'Paper 2'])
    : ['Paper 1', 'Paper 2'];

  const handleStartMockExam = async () => {
    setLoading(true);
    try {
      const exam = await generateMockGceExam({
        subject,
        level,
        paper,
        durationMinutes
      });

      setActiveExam(exam);
      setStudentAnswers({});
      setSubmitted(false);
      setTimeRemainingSeconds(durationMinutes * 60);
      toast.success(`Generated official-standard GCE Mock for ${subject} ${paper}!`);
    } catch (err: any) {
      console.error('Failed to generate mock exam:', err);
      toast.error('Could not generate mock examination. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishExam = () => {
    setSubmitted(true);
    toast.success('Mock Examination submitted! Inspect model marking scheme below.');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO 
        title="Mock Examinations & Paper Generator | Edulpha" 
        description="Simulate real Cameroon GCE Ordinary and Advanced Level official examinations with strict timing, paper rotation, and full marking keys." 
      />
      <Navbar />

      {!activeExam ? (
        <>
          {/* Hero Section */}
          <section className="pt-28 pb-14 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
            <div className="max-w-4xl mx-auto space-y-4">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
                CAMEROON GCE SIMULATION ENGINE
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                National Mock Examinations
              </h1>
              <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
                Test your examination readiness under official Cameroon GCE Board conditions: Paper 1 (MCQ), Paper 2 (Theory / Problem Solving), and Paper 3 (Practical / Programming / Experiments).
              </p>
            </div>
          </section>

          {/* Mock Exam Generator Configuration Form */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
            <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl space-y-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Configure Your Mock Examination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Exam Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => {
                      const newLvl = e.target.value as any;
                      setLevel(newLvl);
                      if (newLvl === 'Ordinary Level' && paper === 'Paper 3') {
                        setPaper('Paper 2');
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Ordinary Level">Ordinary Level (O/L)</option>
                    <option value="Advanced Level">Advanced Level (A/L)</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjectList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Paper */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Paper
                  </label>
                  <select
                    value={paper}
                    onChange={(e) => {
                      const p = e.target.value;
                      setPaper(p);
                      setDurationMinutes(p === 'Paper 1' ? 90 : 180);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availablePapers.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Duration (Mins)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={90}>90 Minutes (1.5 Hours)</option>
                    <option value={120}>120 Minutes (2.0 Hours)</option>
                    <option value={150}>150 Minutes (2.5 Hours)</option>
                    <option value={180}>180 Minutes (3.0 Hours)</option>
                  </select>
                </div>
              </div>

              {/* Subject Paper Specs Info */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-indigo-600" />
                  GCE Paper Structure Specification:
                </span>
                <p className="leading-relaxed">
                  {paper === 'Paper 1' && "Strict 50 Multiple Choice Questions (MCQ) covering broad syllabus recall and analytical reasoning."}
                  {paper === 'Paper 2' && "Structured Theory & In-depth Problem Solving with lettered subparts (a), (b), (c) carrying defined mark allocations."}
                  {paper === 'Paper 3' && "Applied Practical Paper: Implementation, code algorithms, laboratory observations, or dataset manipulation."}
                </p>
              </div>

              <Button
                onClick={handleStartMockExam}
                disabled={loading}
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 transition active:scale-95"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Compiling Official Examination Paper...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Generate & Start Mock Examination</span>
                  </>
                )}
              </Button>
            </Card>
          </section>

          {/* Quick Explanatory Cards */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs">
                <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
                <h3 className="text-base font-bold">Paper 1 Multiple Choice</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Fast-paced 50-question diagnostic assessments simulating exact test-center constraints and negative scoring options.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs">
                <FileText className="text-purple-600 dark:text-purple-400" size={28} />
                <h3 className="text-base font-bold">Paper 2 Structured Theory</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Rigorous structured essay papers with step-by-step mark allocations and official examiner commentary.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs">
                <BookOpen className="text-emerald-600 dark:text-emerald-400" size={28} />
                <h3 className="text-base font-bold">Paper 3 Practical Lab</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Programming tasks, database queries, spreadsheet models, and laboratory data analysis for Advanced Level candidates.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Live Mock Exam View */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Exam Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase mb-1">
                  OFFICIAL NATIONAL MOCK SIMULATION
                </Badge>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {activeExam.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {activeExam.instructions}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-base font-black font-mono">
                    {formatTimer(timeRemainingSeconds)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setActiveExam(null)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Exit Exam
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Duration: <strong className="text-slate-800 dark:text-slate-200">{activeExam.durationMinutes} Mins</strong></span>
              <span>Total Marks: <strong className="text-slate-800 dark:text-slate-200">{activeExam.totalMarks} Marks</strong></span>
              <span>Subject: <strong className="text-slate-800 dark:text-slate-200">{activeExam.subject}</strong></span>
              <span>Level: <strong className="text-slate-800 dark:text-slate-200">{activeExam.level}</strong></span>
            </div>
          </div>

          {/* Exam Sections and Questions */}
          <div className="space-y-8">
            {activeExam.sections?.map((section: any, sIdx: number) => (
              <div key={sIdx} className="space-y-6">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {section.sectionName}
                  </h2>
                  <span className="text-[11px] text-slate-500 italic font-medium">
                    {section.instructions}
                  </span>
                </div>

                <div className="space-y-6">
                  {section.questions?.map((q: any, qIdx: number) => (
                    <Card key={qIdx} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs px-2.5 py-1 rounded-lg">
                            Question {q.questionNumber || qIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{q.topic}</span>
                        </div>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                          {q.marks} Marks
                        </Badge>
                      </div>

                      <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 font-medium text-sm leading-relaxed">
                        <ReactMarkdown>{q.questionText}</ReactMarkdown>
                      </div>

                      {/* Subparts */}
                      {q.subparts && q.subparts.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {q.subparts.map((sp: any) => (
                            <div key={sp.id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                    {sp.label}
                                  </span>
                                  <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                                    {sp.text}
                                  </span>
                                </div>
                                <Badge className="text-[10px] font-bold shrink-0">
                                  [{sp.marks} mks]
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Input */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Candidate's Working & Answer:
                        </label>
                        <textarea
                          disabled={submitted}
                          value={studentAnswers[q.questionNumber || String(qIdx)] || ''}
                          onChange={(e) => setStudentAnswers({
                            ...studentAnswers,
                            [q.questionNumber || String(qIdx)]: e.target.value
                          })}
                          placeholder="Write your comprehensive solution, derivations, or essay arguments here..."
                          rows={4}
                          className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                        />
                      </div>

                      {/* Model Solution (Visible after submission) */}
                      {submitted && q.modelAnswer && (
                        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 size={13} /> Official Model Solution & Examiner Marking Key:
                          </span>
                          <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                            {q.modelAnswer.expectedAnswer}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action Bar */}
          {!submitted ? (
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleFinishExam}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
              >
                <Send size={16} />
                <span>Submit Mock Examination & View Marking Key</span>
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-slate-900 text-white rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check size={24} />
              </div>
              <h3 className="text-xl font-black">Examination Completed & Verified</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Review your written answers above against the national examiners' official marking schemes.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button onClick={() => setActiveExam(null)} className="bg-indigo-600 text-white font-bold text-xs rounded-xl">
                  Take Another Mock
                </Button>
              </div>
            </div>
          )}
        </main>
      )}

      <DynamicFooter />
    </div>
  );
}
