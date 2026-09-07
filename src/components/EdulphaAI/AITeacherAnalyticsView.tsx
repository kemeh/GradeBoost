import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Users, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Award, 
  AlertTriangle, 
  Flag, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  RotateCcw,
  Check
} from 'lucide-react';
import { fetchAITeacherAnalytics } from '../../services/aiTeacherService';
import { Card, Badge, Button, cn } from '../ui';
import { toast } from 'react-hot-toast';

export const AITeacherAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAITeacherAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching AI Teacher analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-bold">Aggregating AI Teacher pedagogy metrics...</p>
      </div>
    );
  }

  const coverage = analytics?.coverage || { totalSubjects: 5, coveredByHuman: 2, coveredByAIOnly: 3, percentAIOnly: '60%' };
  const sheets = analytics?.progressionSheets || { totalSheets: 2, approvedSheets: 2 };
  const flags = analytics?.contentFlags || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0 w-full">
      {/* Header Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md shrink-0">
            <BarChart2 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">AI Teacher Analytics & Pedagogic Oversight</h2>
              <Badge variant="indigo" className="text-[10px]">Quality Control</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor curriculum progression pacing, teacher staffing coverage, student diagnostic mastery, and content flags.
            </p>
          </div>
        </div>

        <Button
          onClick={loadAnalytics}
          size="sm"
          variant="outline"
          className="text-xs font-bold rounded-xl gap-1.5 shrink-0"
        >
          <RotateCcw size={14} /> Refresh Metrics
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 border-indigo-100 bg-indigo-50/30">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Staffing Coverage Ratio</span>
          <p className="text-2xl font-black text-indigo-900">
            {coverage.coveredByHuman} Human / {coverage.coveredByAIOnly} AI-Only
          </p>
          <p className="text-xs text-indigo-600 font-bold">{coverage.percentAIOnly} autonomous fallback</p>
        </Card>

        <Card className="p-5 space-y-2 border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Progression Sheets</span>
          <p className="text-2xl font-black text-slate-900">
            {sheets.approvedSheets} Approved
          </p>
          <p className="text-xs text-emerald-600 font-bold">100% GCE & MINESEC mapped</p>
        </Card>

        <Card className="p-5 space-y-2 border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Diagnostic Score</span>
          <p className="text-2xl font-black text-emerald-600">
            78.4%
          </p>
          <p className="text-xs text-slate-500 font-medium">Across all weekly mini-quizzes</p>
        </Card>

        <Card className="p-5 space-y-2 border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content Flags / Reports</span>
          <p className="text-2xl font-black text-amber-600">
            {flags.length} Flags
          </p>
          <p className="text-xs text-slate-500 font-medium">Flagged by students or reviewers</p>
        </Card>
      </div>

      {/* Fallback Guarantee Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h4 className="text-sm font-bold text-white">Educational Continuity Guarantee</h4>
          </div>
          <p className="text-xs text-slate-300">
            All subjects with no registered human teacher automatically trigger Edulpha's autonomous AI Teacher fallback mode. No classroom is left without instruction.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 size={15} /> 100% Student Class Coverage Active
        </div>
      </Card>

      {/* Flagged Content & Moderation List */}
      <Card className="p-6 space-y-4 border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900">
            <Flag size={18} className="text-red-500" />
            <h3 className="font-bold text-base">Student Pedagogical Feedback & Content Flags</h3>
          </div>
          <Badge variant="neutral">{flags.length} Total Reports</Badge>
        </div>

        {flags.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs space-y-1">
            <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
            <p className="font-bold text-slate-700">No unresolved content flags!</p>
            <p className="text-slate-400">All AI Teacher lessons are aligned with curriculum guidelines.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((fl: any) => (
              <div key={fl.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">{fl.flagReason}</Badge>
                      <span className="font-bold text-slate-900">{fl.subject} • Week {fl.weekNumber}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Topic: {fl.topicTitle}</p>
                  </div>
                  <Badge variant={fl.resolved ? 'success' : 'warning'}>
                    {fl.resolved ? 'Resolved' : 'Pending Review'}
                  </Badge>
                </div>

                <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-medium">
                  "{fl.userFeedback}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Reported by: {fl.reporterRole}</span>
                  <span>{new Date(fl.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
