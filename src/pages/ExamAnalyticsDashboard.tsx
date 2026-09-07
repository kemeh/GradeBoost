import React, { useState, useEffect } from 'react';
import { 
  Trophy, TrendingUp, Target, Award, Clock, ArrowLeft, 
  BookOpen, CheckCircle2, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserAttempts } from '../services/questionEngineService';
import { ExamAttempt } from '../types';

export default function ExamAnalyticsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      setLoading(true);
      const userAtt = await fetchUserAttempts(user.uid);
      setAttempts(userAtt);
      setLoading(false);
    }
    loadStats();
  }, [user]);

  const totalExams = attempts.length;
  const passedExams = attempts.filter(a => a.passed).length;
  const avgPercentage = totalExams > 0 
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalExams) 
    : 0;

  const readinessScore = Math.min(100, Math.round(avgPercentage * 1.1));

  return (
    <ModernDashboardLayout role="student" activeTab="exams">
      <div className="space-y-6 max-w-6xl mx-auto w-full min-w-0">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4" /> Cameroon GCE Intelligence Engine
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Exam Performance & Readiness Analytics
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Track mock exam attempt records, readiness score %, and topic strengths.
            </p>
          </div>

          <button
            onClick={() => navigate('/exams')}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Exams
          </button>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Exams Taken</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{totalExams}</span>
              <BookOpen className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Score</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{avgPercentage}%</span>
              <TrendingUp className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Passed Mock Exams</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{passedExams}</span>
              <CheckCircle2 className="w-8 h-8 text-teal-500 bg-teal-50 p-1.5 rounded-xl" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-2xl text-white shadow-md space-y-2">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">GCE Readiness Index</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-white">{readinessScore}%</span>
              <Target className="w-8 h-8 text-purple-300 bg-white/10 p-1.5 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Recent Attempts History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Recent Exam Attempts</h3>

          {attempts.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-8">No exam attempts recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {attempts.map((att) => (
                <div key={att.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase">
                      {att.academicLevel} • {att.subject}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{att.examTitle}</h4>
                    <p className="text-xs text-slate-500">
                      Date: {new Date(att.completedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {att.percentage}% (Grade {att.letterGrade})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  );
}
