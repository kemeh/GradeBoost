import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, 
  BookOpen, Users, Layers, ShieldCheck, X, FileText, Download, Play 
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

interface AICoverageCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICoverageCheckerModal: React.FC<AICoverageCheckerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [coverage, setCoverage] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      checkCoverage();
    }
  }, [isOpen]);

  const checkCoverage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/coverage/check', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCoverage(data.coverage);
      } else {
        toast.error('Failed to run curriculum coverage analysis');
      }
    } catch (err) {
      console.error('Error checking coverage:', err);
      toast.error('Connection error running coverage scan');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMissing = async () => {
    setIsGeneratingBatch(true);
    toast.loading('AI generating missing curriculum packages in background...', { id: 'genMissing' });
    try {
      const res = await fetch('/api/ai/revision-note/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Computer Science',
          classLevel: 'Upper Sixth',
          topicTitle: 'Machine Learning & AI Ethics',
          depthLevel: 'EXAM'
        })
      });
      const data = await res.json();
      toast.dismiss('genMissing');
      if (data.success) {
        toast.success('Generated missing learning packages!');
        checkCoverage();
      } else {
        toast.error('Batch generation failed');
      }
    } catch (e) {
      toast.dismiss('genMissing');
      toast.error('Error running batch generation');
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <Card className="w-full max-w-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Edulpha Curriculum AI Coverage Inspector
                <Badge className="bg-indigo-600 text-white text-[10px] uppercase font-black">SYSTEM SCAN</Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identifies subjects with no human teachers and generates missing lessons, notes, and quizzes automatically.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Scanning Edulpha curriculum data & teacher coverage...</p>
          </div>
        ) : coverage ? (
          <div className="space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Subjects</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{coverage.totalSubjects}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Covered Subjects</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{coverage.aiCoveredSubjectsCount}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Revision Notes</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{coverage.revisionNotesCount}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Missing Topics</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">{coverage.missingTopicsCount}</span>
              </div>
            </div>

            {/* Content Progress Breakdown */}
            <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl space-y-3 text-xs">
              <h3 className="font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Curriculum Content Deliverables</span>
                <Badge variant="indigo">{coverage.lessonsCount} / {coverage.totalTopics} Lessons Ready</Badge>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-medium">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="text-[10px] text-slate-400 block font-bold">Interactive Lessons</span>
                  <span className="font-bold text-slate-900 dark:text-white">✓ {coverage.lessonsCount}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="text-[10px] text-slate-400 block font-bold">17-Part Revision Notes</span>
                  <span className="font-bold text-slate-900 dark:text-white">✓ {coverage.revisionNotesCount}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="text-[10px] text-slate-400 block font-bold">Verification Quizzes</span>
                  <span className="font-bold text-slate-900 dark:text-white">✓ {coverage.quizzesCount}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="text-[10px] text-slate-400 block font-bold">Practice Exercises</span>
                  <span className="font-bold text-slate-900 dark:text-white">✓ {coverage.practiceExercisesCount}</span>
                </div>
              </div>
            </div>

            {/* Subjects Without Human Teachers */}
            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs space-y-2">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">
                Subjects Functioning on Autonomous AI Teacher Fallback ({coverage.subjectsWithoutTeachersCount})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {coverage.subjectsWithoutHumanTeachers?.map((s: string, idx: number) => (
                  <Badge key={idx} className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30 text-[10px]">
                    🤖 {s} (AI Teacher Active)
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={checkCoverage} variant="outline" className="text-xs font-bold rounded-xl flex items-center gap-1.5">
                <RefreshCw size={14} /> Re-Scan
              </Button>

              <div className="flex items-center gap-2">
                <Button onClick={onClose} variant="outline" className="text-xs font-bold rounded-xl">
                  Close
                </Button>
                <Button 
                  onClick={handleGenerateMissing} 
                  disabled={isGeneratingBatch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  {isGeneratingBatch ? 'Generating Missing Content...' : 'Generate Missing Content'}
                </Button>
              </div>
            </div>

          </div>
        ) : null}

      </Card>
    </div>
  );
};
