import React, { useState } from 'react';
import { 
  Award, CheckCircle2, AlertCircle, Sparkles, 
  X, FileText, ShieldCheck, HelpCircle, ArrowRight 
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

interface AIAnswerEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText?: string;
  maxMarks?: number;
  subject?: string;
  level?: string;
}

export const AIAnswerEvaluatorModal: React.FC<AIAnswerEvaluatorModalProps> = ({
  isOpen,
  onClose,
  questionText: initialQuestion = '',
  maxMarks: initialMarks = 10,
  subject = 'Computer Science',
  level = 'Advanced Level'
}) => {
  const [questionText, setQuestionText] = useState(initialQuestion);
  const [markingScheme, setMarkingScheme] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [maxMarks, setMaxMarks] = useState(initialMarks);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      toast.error('Please enter student answer');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: questionText.trim() || 'Structured Examination Question',
          markingScheme: markingScheme.trim(),
          studentAnswer: studentAnswer.trim(),
          maxMarks: Number(maxMarks),
          subject,
          level
        })
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
        toast.success('Answer evaluated against MINESEC criteria!');
      } else {
        toast.error('Failed to evaluate answer');
      }
    } catch (err) {
      toast.error('Connection error evaluating answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <Card className="w-full max-w-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                AI Answer Marker & Rubric Evaluator
                <Badge className="bg-indigo-600 text-white text-[10px] font-black uppercase">MINESEC / GCE</Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provides instant score breakdowns, identifies missing keywords, and gives GCE improvement guidance.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        {evaluationResult ? (
          /* Evaluation Results View */
          <div className="space-y-4 text-xs">
            {/* Score Banner */}
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl border border-indigo-500/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Assessed Marks</span>
                <span className="text-2xl font-black text-white">{evaluationResult.score} / {evaluationResult.maxMarks} Marks</span>
              </div>
              <Badge className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1">
                {Math.round((evaluationResult.score / evaluationResult.maxMarks) * 100)}% Performance
              </Badge>
            </div>

            {/* What Was Correct & Missing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-1.5">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase">
                  <CheckCircle2 size={15} className="text-emerald-600" /> What Was Correct
                </span>
                <ul className="space-y-1 text-emerald-800 dark:text-emerald-300">
                  {evaluationResult.whatWasCorrect?.map((pt: string, idx: number) => (
                    <li key={idx}>✓ {pt}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-1.5">
                <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 text-[11px] uppercase">
                  <AlertCircle size={15} className="text-rose-600" /> Missing Points / Keywords
                </span>
                <ul className="space-y-1 text-rose-800 dark:text-rose-300">
                  {evaluationResult.whatWasMissing?.map((pt: string, idx: number) => (
                    <li key={idx}>• {pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Model Answer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px] block">Model Answer Criteria</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{evaluationResult.correctAnswerModel}</p>
            </div>

            {/* Examiner Disclaimer */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-900 dark:text-amber-300 rounded-xl text-[11px] font-medium flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600 shrink-0" />
              <span>{evaluationResult.feedbackDisclaimer || 'Edulpha AI Evaluated Feedback — Review model answer for GCE criteria.'}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={() => setEvaluationResult(null)} variant="outline" className="text-xs font-bold rounded-xl">
                Evaluate Another Response
              </Button>
              <Button onClick={onClose} className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Evaluation Form */
          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Prompt</label>
              <input
                type="text"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="e.g. Explain 3 differences between 1NF and 2NF in relational databases."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Answer Response</label>
              <textarea
                value={studentAnswer}
                onChange={e => setStudentAnswer(e.target.value)}
                rows={4}
                placeholder="Paste or type the student's answer here..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Marking Scheme Keywords (Optional)</label>
                <input
                  type="text"
                  value={markingScheme}
                  onChange={e => setMarkingScheme(e.target.value)}
                  placeholder="e.g. Atomic values, Partial dependencies"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Marks</label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={e => setMaxMarks(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" onClick={onClose} variant="outline" className="text-xs font-bold rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isEvaluating} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                <Sparkles size={14} /> {isEvaluating ? 'Evaluating Answer...' : 'Evaluate Answer'}
              </Button>
            </div>
          </form>
        )}

      </Card>
    </div>
  );
};
