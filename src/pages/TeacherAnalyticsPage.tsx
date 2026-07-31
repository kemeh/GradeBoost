import React, { useState } from 'react';
import {
  Users,
  Eye,
  CheckCircle,
  Award,
  AlertTriangle,
  HelpCircle,
  FileText,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import { TeacherAnalyticsData } from '../types';
import toast from 'react-hot-toast';

export const TeacherAnalyticsPage: React.FC = () => {
  const [teacherMetrics] = useState<TeacherAnalyticsData>(
    AnalyticsService.getTeacherAnalytics('tch_demo')
  );

  const handleExportTeacherReport = () => {
    const report = AnalyticsService.generateReport(
      'Teacher Class Performance & Weak Topics Summary',
      'teacher',
      'performance',
      'pdf',
      'Lead Educator',
      { dateRange: '30d' }
    );
    AnalyticsService.downloadReportFile(report);
    toast.success('Teacher class report downloaded successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Teaching Analytics & Classroom Insights</h1>
              <p className="text-sm text-slate-500">
                Track lesson views, quiz scores, student weak points, and topic difficulty across your courses.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportTeacherReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Class Report (PDF)
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students Reached</div>
          <div className="text-2xl font-black text-slate-900">{teacherMetrics.totalStudentsReached.toLocaleString()}</div>
          <p className="text-xs text-emerald-600 font-medium">Across GCE A-Level & Terminale</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lesson Views</div>
          <div className="text-2xl font-black text-slate-900">{teacherMetrics.totalLessonViews.toLocaleString()}</div>
          <p className="text-xs text-slate-500">Total views recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</div>
          <div className="text-2xl font-black text-slate-900">{teacherMetrics.lessonCompletionRate}%</div>
          <p className="text-xs text-emerald-600 font-medium">High student completion</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Quiz Score</div>
          <div className="text-2xl font-black text-slate-900">{teacherMetrics.avgQuizPerformance}%</div>
          <p className="text-xs text-slate-500">Across 412 submissions</p>
        </div>
      </div>

      {/* Topic Difficulty Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <AlertTriangle className="w-5 h-5" />
            Topic Difficulty Heatmap & Weak Areas
          </div>
          <span className="text-xs text-slate-500">Automatically highlighted from student quiz attempts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="py-3 px-4">Topic Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-4">Failed Attempts</th>
                <th className="py-3 px-4">Suggested Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherMetrics.topicDifficultyMap.map((topic, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{topic.topic}</td>
                  <td className="py-3 px-4 text-slate-600">{topic.subject}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        topic.avgScore < 60
                          ? 'bg-rose-100 text-rose-700'
                          : topic.avgScore < 75
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {topic.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{topic.failCount} students</td>
                  <td className="py-3 px-4 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
                    Schedule Live Revision Session
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Student Questions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <HelpCircle className="w-5 h-5" />
          Top Student Questions (AI Tutor & Discussions)
        </div>
        <div className="space-y-3">
          {teacherMetrics.frequentlyAskedQuestions.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{faq.question}</h4>
                <p className="text-xs text-slate-500">Asked by {faq.count} students this month</p>
              </div>
              <button
                onClick={() => toast.success('Added explanation video to course material')}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition"
              >
                Create Video Answer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsPage;
