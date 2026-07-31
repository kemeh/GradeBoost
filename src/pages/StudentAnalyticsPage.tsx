import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Award,
  BookOpen,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import { StudentAnalyticsData } from '../types';
import toast from 'react-hot-toast';

export const StudentAnalyticsPage: React.FC = () => {
  const [studentMetrics] = useState<StudentAnalyticsData>(
    AnalyticsService.getStudentAnalytics('std_demo')
  );

  const handleStartPractice = (topic: string) => {
    toast.success(`Launching revision session for "${topic}"`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/20">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            {studentMetrics.learningStreak}-Day Active Study Streak!
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Personal Learning Intelligence
          </h1>
          <p className="text-sm text-blue-100">
            Real-time score tracking, syllabus completion radar, and targeted exam revision suggestions.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Study Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {Math.floor(studentMetrics.studyTimeMinutes / 60)}h {studentMetrics.studyTimeMinutes % 60}m
          </div>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4.2h this week
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Quiz Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {studentMetrics.quizAvgScore}%
          </div>
          <p className="text-xs text-slate-500">Above cohort average (74%)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Syllabus Progress</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {studentMetrics.progressPercentage}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-purple-600 h-full rounded-full"
              style={{ width: `${studentMetrics.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Cohort Rank</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            #{studentMetrics.ranking} <span className="text-xs text-slate-400 font-normal">/ {studentMetrics.totalStudentsInCohort}</span>
          </div>
          <p className="text-xs text-amber-600 font-semibold">Top 5% Learner Badge</p>
        </div>
      </div>

      {/* Main Charts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Weekly Quiz Performance & Daily Study Hours</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentMetrics.performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} name="Quiz Score %" />
                <Line type="monotone" dataKey="studyMinutes" stroke="#10B981" strokeWidth={2} name="Study Minutes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Revision Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-lg">Recommended Revision</h3>
          </div>
          <p className="text-xs text-slate-500">Based on recent incorrect quiz answers</p>

          <div className="space-y-3">
            {studentMetrics.recommendedTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3 bg-purple-50/60 hover:bg-purple-100/60 rounded-xl border border-purple-100 flex items-center justify-between transition cursor-pointer"
                onClick={() => handleStartPractice(topic)}
              >
                <div>
                  <h4 className="text-xs font-bold text-purple-900">{topic}</h4>
                  <span className="text-[10px] text-purple-600 font-medium">Estimated 15 mins practice</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strong & Weak Topic Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
            <CheckCircle className="w-5 h-5" />
            Strong Subjects & Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {studentMetrics.strongSubjects.map((sub, idx) => (
              <span key={idx} className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-2xs">
                {sub} • 90%+ Accuracy
              </span>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/40 p-6 rounded-2xl border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
            <HelpCircle className="w-5 h-5" />
            Topics Requiring Revision
          </div>
          <div className="flex flex-wrap gap-2">
            {studentMetrics.weakSubjects.map((sub, idx) => (
              <span key={idx} className="px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-bold shadow-2xs">
                {sub} • Needs Practice
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsPage;
