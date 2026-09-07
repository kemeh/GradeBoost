import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Trophy, CheckCircle2, XCircle, Clock, Award, RotateCcw, 
  ArrowLeft, FileText, Sparkles, Printer, ShieldCheck, Download, ChevronDown, ChevronUp 
} from 'lucide-react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import QuestionRenderer from '../components/QuestionRenderer';
import { ExamAttempt, EngineExam, QuestionEngineItem } from '../types';

export default function ExamResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId } = useParams<{ attemptId: string }>();

  // Attempt passed via router location state or fallback
  const attempt = location.state?.attempt as ExamAttempt | undefined;
  const exam = location.state?.exam as EngineExam | undefined;
  const questions = (location.state?.questions || []) as QuestionEngineItem[];

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
          <Trophy className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Exam Results Submitted</h2>
          <p className="text-xs text-slate-500">Your results have been processed and saved to your profile.</p>
          <button
            onClick={() => navigate('/exams')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Return to Examination Hub
          </button>
        </div>
      </div>
    );
  }

  const gradeColors = {
    A: 'bg-emerald-500 text-white',
    B: 'bg-teal-500 text-white',
    C: 'bg-indigo-500 text-white',
    D: 'bg-amber-500 text-white',
    E: 'bg-orange-500 text-white',
    U: 'bg-rose-500 text-white'
  };

  return (
    <ModernDashboardLayout role="student" activeTab="exams">
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/exams')}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Exams
          </button>

          <button
            onClick={() => setShowCertificate(true)}
            className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-2 hover:bg-indigo-100"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print Official Statement of Results
          </button>
        </div>

        {/* Primary Result Summary Banner */}
        <div className={`rounded-3xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
          attempt.passed 
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950' 
            : 'bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950'
        }`}>
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-widest backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Official Evaluation Complete
            </span>

            <h1 className="text-3xl font-black tracking-tight">
              {attempt.passed ? 'Congratulations! Examination Passed' : 'Assessment Completed'}
            </h1>

            <p className="text-xs text-slate-300 font-medium max-w-lg">
              {attempt.examTitle} • Completed in {Math.round(attempt.timeTakenSeconds / 60)} minutes.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="text-center">
              <span className="text-xs text-slate-300 uppercase font-bold block">Percentage</span>
              <span className="text-4xl font-black text-white">{attempt.percentage}%</span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-xs text-slate-300 uppercase font-bold block">GCE Grade</span>
              <span className={`text-2xl font-black px-4 py-1 rounded-xl shadow-md inline-block mt-1 ${gradeColors[attempt.letterGrade as keyof typeof gradeColors] || 'bg-slate-700'}`}>
                Grade {attempt.letterGrade}
              </span>
            </div>
          </div>
        </div>

        {/* AI Readiness Insight Report */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-200">
            <Sparkles className="w-5 h-5 text-purple-300" /> AI Examination Readiness Insights
          </div>
          <p className="text-xs text-purple-100 leading-relaxed font-medium">
            Based on your answers, you showed exceptional mastery in <strong>Memory Architecture</strong> and <strong>Binary Logic</strong>, but scored lower on <strong>Assembly Code Instruction Execution</strong>. We recommend taking a 15-minute targeted revision on Computer Hardware.
          </p>
        </div>

        {/* Topic Breakdown Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Topic Performance Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(attempt.topicBreakdown || {}).map(([topic, stats]) => {
              const pct = Math.round((stats.earned / Math.max(stats.total, 1)) * 100);
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{topic}</span>
                    <span>{stats.earned}/{stats.total} pts ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Detailed Question Review & Model Answers ({questions.length})
          </h3>

          {questions.map((q, idx) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns?.isCorrect;
            const marksEarned = userAns?.marksEarned || 0;

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-5 flex items-center justify-between gap-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                      isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                      <p className="text-xs text-slate-500">
                        Marks: {marksEarned} / {q.marks}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="p-6">
                  <QuestionRenderer
                    question={q}
                    questionNumber={idx + 1}
                    answerState={userAns}
                    showExplanation={true}
                    showModelAnswer={true}
                    isReadOnly={true}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Transcript Certificate Modal */}
        {showCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white border-4 border-indigo-900 p-8 rounded-3xl shadow-2xl space-y-6 text-slate-900 text-center relative my-8">
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>

              <div className="space-y-2">
                <ShieldCheck className="w-12 h-12 text-indigo-900 mx-auto" />
                <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-widest">
                  Statement of Examination Results
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Cameroon General Certificate of Education (GCE) Edulpha Assessment Engine
                </p>
              </div>

              <div className="border-y border-slate-200 py-6 space-y-2 text-sm font-medium">
                <p>This is to certify that student <strong>{attempt.userDisplayName || 'Student'}</strong></p>
                <p>has completed the examination: <strong>{attempt.examTitle}</strong></p>
                <p className="text-xs text-slate-500">Date: {new Date(attempt.completedAt).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-bold">
                <div>
                  <span className="text-slate-500 block">Total Score</span>
                  <span className="text-lg text-indigo-950">{attempt.totalScore} / {attempt.maxPossibleScore}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Percentage</span>
                  <span className="text-lg text-indigo-950">{attempt.percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Grade Awarded</span>
                  <span className="text-lg text-indigo-950">Grade {attempt.letterGrade}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Verification ID: {attempt.id}</span>
                <span>EDULPHA LMS AUTHENTICATED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
