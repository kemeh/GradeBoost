import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Clock,
  Download,
  Bookmark,
  CheckCircle,
  Play,
  Share2,
  Sparkles,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileLessonModalProps {
  lessonTitle: string | null;
  subjectName: string | null;
  onClose: () => void;
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
  onDownload: (title: string) => void;
}

export const MobileLessonModal: React.FC<MobileLessonModalProps> = ({
  lessonTitle,
  subjectName,
  onClose,
  simLang,
  isDarkMode,
  onDownload,
}) => {
  const isEn = simLang === 'en';
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!lessonTitle) return null;

  const handleComplete = () => {
    setIsCompleted(true);
    toast.success(`🎉 Completed lesson "${lessonTitle}"! +50 Study XP added.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md max-h-[90vh] rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'} shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200`}>
        {/* Cover Header */}
        <div className="relative h-36 bg-[#0F2C59] p-4 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex justify-between items-start z-10">
            <span className="px-2.5 py-1 bg-amber-400 text-[#0F2C59] font-black rounded-lg text-[10px] uppercase">
              {subjectName || 'GCE Physics & Math'}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsBookmarked(!isBookmarked);
                  toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition ${isBookmarked ? 'bg-amber-400 text-[#0F2C59]' : 'bg-white/20 text-white'}`}
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="z-10 space-y-1">
            <h3 className="font-extrabold text-base leading-tight text-white">{lessonTitle}</h3>
            <div className="flex items-center gap-3 text-[10px] text-blue-200">
              <span>⏱️ 25 Mins</span>
              <span>• Dr. Nfor Emmanuel</span>
              <span>• 💾 Offline Ready</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-1">
            <h4 className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {isEn ? 'Lesson Key Learning Objectives' : 'Objectifs Pédagogiques'}
            </h4>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
              <li>{isEn ? 'Understand fundamental equations & formulas' : 'Comprendre les équations fondamentales'}</li>
              <li>{isEn ? 'Apply Cameroon GCE & BAC marking schemes' : 'Appliquer les critères de correction GCE & BAC'}</li>
              <li>{isEn ? 'Solve Paper 2 structured numerical problems' : 'Résoudre les problèmes numériques structurés'}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
              {isEn ? '1. Concept Summary & Equations' : '1. Résumé du Cours & Équations'}
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              Electromagnetic induction is the production of an electromotive force (e.m.f.) across an electrical conductor in a changing magnetic field. Faraday's law states that the magnitude of the induced e.m.f. is directly proportional to the rate of change of magnetic flux linkage.
            </p>
            <div className="p-3 bg-slate-950 text-amber-300 rounded-xl font-mono text-[11px] border border-amber-400/20 text-center">
              {"\\mathcal{E} = -N \\frac{d\\Phi}{dt}"}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
              {isEn ? '2. Worked GCE Sample Solution' : '2. Exercice Type Résolu'}
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Question: A coil of 200 turns and area 0.05 m² is placed perpendicular to a magnetic field of 0.4 T. If the field drops to zero in 0.1s, find the induced e.m.f.
              </p>
              <div className="p-2 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-emerald-300 font-mono text-[10px]">
                {"Solution: \\mathcal{E} = 200 * (0.05 * 0.4) / 0.1 = 40 Volts."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => onDownload(lessonTitle)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition flex items-center gap-1"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            {isEn ? 'Save Offline' : 'Sauvegarder'}
          </button>

          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 ${
              isCompleted
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-[#0F2C59] hover:bg-blue-900 text-white active:scale-95'
            }`}
          >
            <CheckCircle className="h-4 w-4 text-amber-400" />
            {isCompleted ? (isEn ? 'Completed (+50 XP)' : 'Terminé (+50 XP)') : (isEn ? 'Complete & Take Drill' : 'Terminer la leçon')}
          </button>
        </div>
      </div>
    </div>
  );
};
