import React from 'react';
import { 
  Award, CheckCircle2, AlertCircle, Sparkles, X, RotateCcw, Send 
} from 'lucide-react';
import { Button } from '../../ui';
import { LabSubject } from './types';

interface ExperimentScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: () => void;
  subject: LabSubject;
  scoreBreakdown: {
    apparatusSelection: number; // max 25
    workbenchAssembly: number; // max 25
    proceduralPrecision: number; // max 25
    notebookAccuracy: number; // max 25
  };
  lang: 'en' | 'fr';
}

export const ExperimentScoringModal: React.FC<ExperimentScoringModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  subject,
  scoreBreakdown,
  lang
}) => {
  if (!isOpen) return null;

  const totalScore = 
    scoreBreakdown.apparatusSelection + 
    scoreBreakdown.workbenchAssembly + 
    scoreBreakdown.proceduralPrecision + 
    scoreBreakdown.notebookAccuracy;

  let gceGrade = 'A*';
  if (totalScore < 50) gceGrade = 'F';
  else if (totalScore < 60) gceGrade = 'D';
  else if (totalScore < 70) gceGrade = 'C';
  else if (totalScore < 80) gceGrade = 'B';
  else if (totalScore < 90) gceGrade = 'A';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
          <X className="w-4 h-4" />
        </button>

        {/* Top Grade Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300">
            <Award className="w-10 h-10 text-amber-400" />
          </div>

          <h3 className="text-2xl font-black text-white tracking-tight">
            {lang === 'fr' ? 'Évaluation Pratique GCE' : 'GCE Practical Assessment Report'}
          </h3>
          <p className="text-xs text-slate-400">Automated Scientific Evaluation & Grade</p>
        </div>

        {/* Total Score Display */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Score</span>
            <div className="text-3xl font-black font-mono text-white">
              {totalScore} <span className="text-sm font-bold text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">GCE Grade</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              Grade {gceGrade}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2 text-xs font-semibold">
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
            <span>Apparatus Selection & Setup</span>
            <span className="font-mono text-indigo-400">{scoreBreakdown.apparatusSelection} / 25</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
            <span>3D Workbench Assembly & Clamping</span>
            <span className="font-mono text-indigo-400">{scoreBreakdown.workbenchAssembly} / 25</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
            <span>Procedural Execution & Safety</span>
            <span className="font-mono text-indigo-400">{scoreBreakdown.proceduralPrecision} / 25</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
            <span>Notebook Journal & Conclusion</span>
            <span className="font-mono text-indigo-400">{scoreBreakdown.notebookAccuracy} / 25</span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 border-slate-700">
            {lang === 'fr' ? 'Revoir l\'Expérience' : 'Review Experiment'}
          </Button>

          <Button onClick={onSubmitReport} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Send className="w-4 h-4 mr-1.5" />
            <span>{lang === 'fr' ? 'Soumettre au Professeur' : 'Submit Final Report'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
