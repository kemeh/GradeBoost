import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BookOpen, Target, CheckCircle2, Flame, Award, RefreshCw } from 'lucide-react';
import { Card, Button, Badge, cn } from '../ui';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface AIStudyTodayWidgetProps {
  studentId: string;
  defaultSubject?: string;
  defaultLevel?: string;
}

export const AIStudyTodayWidget: React.FC<AIStudyTodayWidgetProps> = ({
  studentId,
  defaultSubject = 'Computer Science',
  defaultLevel = 'Upper Sixth'
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    loadStudySequence();
  }, [studentId, defaultSubject, defaultLevel]);

  const loadStudySequence = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/study-today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subject: defaultSubject,
          classLevel: defaultLevel
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error('Error fetching study sequence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl animate-pulse">
        <div className="h-4 bg-indigo-800/50 rounded w-1/3 mb-2" />
        <div className="h-6 bg-indigo-800/50 rounded w-2/3" />
      </Card>
    );
  }

  if (!recommendation) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30 shrink-0">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">What Should I Study Today?</h2>
              <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">AI Personal Coach</Badge>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Targeting weak area: <strong className="text-white">{recommendation.primaryFocusTopic}</strong> ({recommendation.subject})
            </p>
          </div>
        </div>

        <button
          onClick={loadStudySequence}
          className="p-2 text-indigo-300 hover:text-white rounded-xl hover:bg-white/10 transition text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Plan
        </button>
      </div>

      {/* Study Steps Sequence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recommendation.studySequence?.map((step: any, idx: number) => (
          <div 
            key={idx}
            className="p-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl transition space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Step {step.step} • {step.durationMinutes} mins
                </span>
                <span className="p-1 bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-bold uppercase">
                  {step.type}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white line-clamp-2">{step.title}</h3>
              <p className="text-[11px] text-indigo-200 line-clamp-2 leading-snug">{step.description}</p>
            </div>

            <Button
              onClick={() => {
                if (step.type === 'lesson') navigate('/ai-tutor');
                else if (step.type === 'revision_note') navigate('/revision-notes');
                else navigate('/practice');
              }}
              size="sm"
              className="mt-2 w-full bg-white text-indigo-950 hover:bg-indigo-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <span>Start {step.type === 'lesson' ? 'Lesson' : step.type === 'revision_note' ? 'Note' : 'Drill'}</span>
              <ArrowRight size={13} />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
