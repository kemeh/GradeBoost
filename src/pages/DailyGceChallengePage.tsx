import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Flame, Sparkles, CheckCircle2, AlertCircle, 
  HelpCircle, ChevronRight, ChevronLeft, Send, Trophy, 
  FileText, Code, Check, X, BookOpen, Clock, RefreshCw, Award, Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { Button, Card, Badge, CodeEditorTextarea, cn } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  fetchTodayGceQuestions, 
  submitGceAnswer, 
  TodayGceResponse 
} from '../services/dailyGceService';
import { 
  downloadDailyGceQuestionPDF, 
  downloadAllSubjectsDailyGcePDF 
} from '../utils/dailyGcePdfGenerator';
import { DailyGceQuestion } from '../types';
import toast from 'react-hot-toast';

export default function DailyGceChallengePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userLevel = (user?.academicLevel?.toLowerCase().includes('ordinary') || user?.level?.toLowerCase().includes('ordinary'))
    ? 'Ordinary Level'
    : 'Advanced Level';

  const [data, setData] = useState<TodayGceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answer state per question
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showMarkingScheme, setShowMarkingScheme] = useState(false);
  const [celebrateComplete, setCelebrateComplete] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [user?.uid, userLevel, user?.subject, language]);

  async function loadChallenge() {
    setLoading(true);
    try {
      const res = await fetchTodayGceQuestions({
        studentId: user?.uid,
        level: userLevel,
        enrolledSubjects: user?.subject ? [user.subject] : undefined,
        language: language === 'fr' ? 'fr' : 'en'
      });
      setData(res);

      // Pre-fill answers from previous submissions if any
      const existingAnswers: Record<string, string> = {};
      res.questions.forEach((q) => {
        if (q.submission?.answer) {
          existingAnswers[q.questionId] = q.submission.answer;
        }
      });
      setAnswers(existingAnswers);
    } catch (err) {
      console.error('Failed to load daily GCE challenge:', err);
      toast.error('Could not load today\'s GCE challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const questions = data?.questions || [];
  const currentQ: (DailyGceQuestion & { isAnswered?: boolean; submission?: any }) | undefined = questions[currentIndex];

  const handleSelectAnswer = (ans: string) => {
    if (!currentQ || currentQ.isAnswered) return;
    setAnswers(prev => ({ ...prev, [currentQ.questionId]: ans }));
  };

  const handleSubmitCurrentAnswer = async () => {
    if (!currentQ) return;
    const currentAnswer = answers[currentQ.questionId];

    if (!currentAnswer || !currentAnswer.trim()) {
      toast.error('Please enter or select an answer before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const evalRes = await submitGceAnswer({
        studentId: user?.uid,
        questionId: currentQ.questionId,
        answer: currentAnswer.trim(),
        timeSpentSeconds: 60
      });

      toast.success(
        evalRes.evaluation.status === 'correct' 
          ? 'Full marks awarded! Excellent work.' 
          : (evalRes.evaluation.status === 'partially_correct' ? 'Partially correct. See examiner feedback.' : 'Reviewed. Inspect model correction.')
      );

      // Update local question state
      setData(prev => {
        if (!prev) return prev;
        const updated = prev.questions.map((q, idx) => {
          if (idx === currentIndex) {
            return {
              ...q,
              isAnswered: true,
              submission: {
                answer: currentAnswer,
                score: evalRes.evaluation.score,
                maxMarks: evalRes.evaluation.maxMarks,
                status: evalRes.evaluation.status,
                evaluationFeedback: evalRes.evaluation
              }
            };
          }
          return q;
        });

        const newCompleted = updated.filter(q => q.isAnswered).length;
        if (newCompleted === updated.length && updated.length > 0) {
          setCelebrateComplete(true);
        }

        return {
          ...prev,
          questions: updated,
          streak: evalRes.streak,
          completedCount: newCompleted,
          isDayCompleted: newCompleted === updated.length
        };
      });
    } catch (err: any) {
      console.error('Answer submission error:', err);
      toast.error(err.message || 'Failed to evaluate answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ModernDashboardLayout role="student" activeTab="daily_challenge">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">Preparing today's Cameroon GCE questions...</p>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <ModernDashboardLayout role="student" activeTab="daily_challenge">
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
            <BookOpen size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Today's Questions are Being Prepared</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Our GCE examination engine is compiling today's questions for your registered subjects. Please check back shortly.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout role="student" activeTab="daily_challenge">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              title="Return to Dashboard"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Daily GCE Challenge
                </h1>
                <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                  {userLevel}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Continuous practice under Cameroon GCE examination standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-xs">
              <Flame size={15} className="fill-amber-500 text-amber-500" />
              <span>{data?.streak?.currentStreak || 0}-Day Streak</span>
            </Badge>

            <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
              <Trophy size={14} className="text-emerald-500" />
              <span>{data?.completedCount || 0} / {questions.length} Done</span>
            </Badge>
          </div>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {questions.map((q, idx) => (
            <button
              key={q.questionId}
              onClick={() => {
                setCurrentIndex(idx);
                setShowMarkingScheme(false);
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2",
                currentIndex === idx
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none"
                  : q.isAnswered
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              {q.isAnswered && <CheckCircle2 size={13} className="text-emerald-500" />}
              <span>{q.subject}</span>
              <span className="text-[10px] opacity-80">({q.paper})</span>
            </button>
          ))}
        </div>

        {/* Main Question Container */}
        {currentQ && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Question Header & Strict Source Attribution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Source Attribution Badge */}
                  {currentQ.sourceType === 'PAST_GCE' && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Award size={13} className="text-emerald-600" />
                      <span>Verified Past GCE Question ({currentQ.year || 2024})</span>
                    </Badge>
                  )}

                  {currentQ.sourceType === 'AI_GENERATED_GCE_STYLE' && (
                    <Badge className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>AI-Generated GCE-Style Question</span>
                    </Badge>
                  )}

                  {(currentQ.sourceType === 'EDULPHA_CURRICULUM' || !currentQ.sourceType) && (
                    <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <BookOpen size={13} className="text-blue-600" />
                      <span>Edulpha Practice Question</span>
                    </Badge>
                  )}

                  <Badge variant="neutral" className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {currentQ.paper}
                  </Badge>

                  <Badge variant="neutral" className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {currentQ.difficulty || 'GCE Standard'}
                  </Badge>
                </div>

                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  Total: {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                </div>
              </div>

              {/* Topic & Subtopic */}
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Syllabus Topic: <span className="text-slate-800 dark:text-slate-200 font-bold">{currentQ.topic}</span>
                {currentQ.subtopic && <span> • {currentQ.subtopic}</span>}
              </div>

              {/* Main Question Text */}
              <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base leading-relaxed">
                <ReactMarkdown>{currentQ.questionText}</ReactMarkdown>
              </div>

              {/* Sub-parts breakdown if present */}
              {currentQ.subparts && currentQ.subparts.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sub-Questions & Marks Breakdown:
                  </h3>
                  <div className="space-y-3">
                    {currentQ.subparts.map((sp) => (
                      <div 
                        key={sp.id}
                        className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs shrink-0 pt-0.5">
                              {sp.label}
                            </span>
                            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                              <ReactMarkdown>{sp.text}</ReactMarkdown>
                            </div>
                          </div>
                          <Badge className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-[10px] font-bold shrink-0">
                            [{sp.marks} {sp.marks === 1 ? 'mark' : 'marks'}]
                          </Badge>
                        </div>

                        {sp.codeSnippet && (
                          <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed overflow-x-auto">
                            <pre>{sp.codeSnippet}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Input Section (Adapts to question type) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Solution / Answer:
                </h3>

                {/* 1. Multiple Choice Questions (MCQ) */}
                {currentQ.questionType === 'mcq' && currentQ.options && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                      const isSelected = answers[currentQ.questionId] === optKey;
                      const isSubmitted = currentQ.isAnswered;
                      const isCorrect = currentQ.modelAnswer?.correctOption === optKey;

                      return (
                        <button
                          key={optKey}
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(optKey)}
                          className={cn(
                            "w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all text-xs sm:text-sm font-medium",
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            isSubmitted && isCorrect && "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold",
                            isSubmitted && isSelected && !isCorrect && "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200"
                          )}
                        >
                          <span className={cn(
                            "w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border",
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                          )}>
                            {optKey}
                          </span>
                          <span className="flex-1 pt-0.5">{String(optVal)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Programming / Practical Coding Questions */}
                {currentQ.questionType === 'programming' && (
                  <div className="space-y-2">
                    <CodeEditorTextarea
                      language={currentQ.programmingData?.language || 'python'}
                      value={answers[currentQ.questionId] !== undefined ? answers[currentQ.questionId] : (currentQ.programmingData?.starterCode || '')}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      disabled={currentQ.isAnswered}
                      rows={12}
                      placeholder="// Type your algorithm or program solution here..."
                    />
                  </div>
                )}

                {/* 3. Structured / Essay / Short Answer / Practical */}
                {currentQ.questionType !== 'mcq' && currentQ.questionType !== 'programming' && (
                  <div className="space-y-2">
                    <textarea
                      disabled={currentQ.isAnswered}
                      value={answers[currentQ.questionId] || ''}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="Type your structured solution, bullet points, derivations, or explanations here..."
                      rows={6}
                      className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Supports formatted text and mathematical steps</span>
                      <span>{(answers[currentQ.questionId] || '').length} characters</span>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                {!currentQ.isAnswered && (
                  <div className="pt-2">
                    <Button
                      onClick={handleSubmitCurrentAnswer}
                      disabled={submitting || !answers[currentQ.questionId]?.trim()}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                    >
                      <Send size={15} />
                      <span>{submitting ? 'Submitting & Evaluating...' : 'Submit Answer for GCE Evaluation'}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Instant Educational Feedback & Assessment Report */}
              {currentQ.isAnswered && currentQ.submission && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                        currentQ.submission.status === 'correct' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" :
                        currentQ.submission.status === 'partially_correct' ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      )}>
                        {currentQ.submission.status === 'correct' ? <Check size={20} /> : currentQ.submission.status === 'partially_correct' ? '½' : <X size={20} />}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-slate-500">Assessment Result</div>
                        <div className="text-base font-black text-slate-900 dark:text-slate-100">
                          Score: {currentQ.submission.score} / {currentQ.submission.maxMarks} Marks
                        </div>
                      </div>
                    </div>

                    <Badge className={cn(
                      "text-xs font-bold px-3 py-1",
                      currentQ.submission.status === 'correct' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      currentQ.submission.status === 'partially_correct' ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                      "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    )}>
                      {currentQ.submission.status === 'correct' ? 'Full Marks' : currentQ.submission.status === 'partially_correct' ? 'Partially Correct' : 'Needs Improvement'}
                    </Badge>
                  </div>

                  {/* Feedback breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.submission.evaluationFeedback?.whatWasCorrect && (
                      <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                        <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase">
                          <CheckCircle2 size={14} /> What You Got Right
                        </div>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                          {currentQ.submission.evaluationFeedback.whatWasCorrect}
                        </p>
                      </div>
                    )}

                    {currentQ.submission.evaluationFeedback?.whatWasMissing && (
                      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
                        <div className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase">
                          <AlertCircle size={14} /> What You Need to Improve
                        </div>
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                          {currentQ.submission.evaluationFeedback.whatWasMissing}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Examiner Tip */}
                  {currentQ.submission.evaluationFeedback?.examTip && (
                    <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 text-xs font-medium space-y-1">
                      <div className="font-black uppercase flex items-center gap-1.5 text-purple-800 dark:text-purple-300 text-[11px]">
                        <Sparkles size={13} className="text-purple-600" /> Cameroon GCE Examiner Tip
                      </div>
                      <p>{currentQ.submission.evaluationFeedback.examTip}</p>
                    </div>
                  )}

                  {/* Toggle Model Answer & Marking Guide */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <FileText size={14} />
                      <span>{showMarkingScheme ? 'Hide Model Solution & Marking Scheme' : 'View Model Solution & Marking Scheme'}</span>
                    </button>

                    {showMarkingScheme && currentQ.modelAnswer && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider">
                          Official Model Solution & Marking Guide:
                        </div>
                        {currentQ.modelAnswer.expectedAnswer && (
                          <div className="prose dark:prose-invert max-w-none text-xs">
                            <ReactMarkdown>{currentQ.modelAnswer.expectedAnswer}</ReactMarkdown>
                          </div>
                        )}
                        {currentQ.modelAnswer.codeSolution && (
                          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 overflow-x-auto">
                            <pre>{currentQ.modelAnswer.codeSolution}</pre>
                          </div>
                        )}
                        {currentQ.modelAnswer.markingPoints && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase">Marking Criteria:</span>
                            {currentQ.modelAnswer.markingPoints.map((mp, i) => (
                              <div key={i} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
                                <span>• {mp.point}</span>
                                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-bold">
                                  {mp.marks} {mp.marks === 1 ? 'mk' : 'mks'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Bottom Navigation Toolbar */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                  setShowMarkingScheme(false);
                }}
                className="text-xs font-bold flex items-center gap-1.5 rounded-xl border-slate-300 dark:border-slate-700"
              >
                <ChevronLeft size={16} /> Previous Question
              </Button>

              <span className="text-xs font-bold text-slate-500">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <Button
                variant={currentIndex === questions.length - 1 ? 'primary' : 'outline'}
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setShowMarkingScheme(false);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className={cn(
                  "text-xs font-bold flex items-center gap-1.5 rounded-xl",
                  currentIndex === questions.length - 1 
                    ? "bg-indigo-600 text-white" 
                    : "border-slate-300 dark:border-slate-700"
                )}
              >
                <span>{currentIndex === questions.length - 1 ? 'Return to Dashboard' : 'Next Question'}</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Celebration Modal when all questions completed */}
        {celebrateComplete && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <Trophy size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Challenge Complete!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                You have finished today's Cameroon GCE questions! Your streak has increased to <span className="font-bold text-amber-500">🔥 {data?.streak?.currentStreak || 1} days</span>.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  onClick={() => setCelebrateComplete(false)} 
                  className="w-full bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Review My Answers
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')} 
                  className="w-full rounded-xl"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
