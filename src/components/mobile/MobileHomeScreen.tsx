import React from 'react';
import {
  Flame,
  Target,
  Award,
  BookOpen,
  Bot,
  FileText,
  Clock,
  Download,
  Bookmark,
  Sparkles,
  TrendingUp,
  Video,
  CheckCircle2,
  Calendar,
  Zap,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileHomeScreenProps {
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
  isOfflineMode: boolean;
  onNavigateTab: (tab: 'home' | 'explore' | 'ai' | 'exams' | 'profile') => void;
  onStartLesson: (title: string, subject: string) => void;
  onDownloadItem: (title: string) => void;
}

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  simLang,
  isDarkMode,
  isOfflineMode,
  onNavigateTab,
  onStartLesson,
  onDownloadItem,
}) => {
  const isEn = simLang === 'en';

  const quickActions = [
    { id: 'lessons', title: isEn ? 'Lessons' : 'Leçons', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', tab: 'explore' },
    { id: 'ai', title: isEn ? 'AI Tutor' : 'Tuteur IA', icon: Bot, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50', tab: 'ai' },
    { id: 'qbank', title: isEn ? 'Question Bank' : 'Banque Questions', icon: FileText, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', tab: 'exams' },
    { id: 'exams', title: isEn ? 'Mock Exams' : 'Examens Blancs', icon: Award, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', tab: 'exams' },
    { id: 'notes', title: isEn ? 'Study Notes' : 'Fiches Révision', icon: FileText, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50', tab: 'explore' },
    { id: 'videos', title: isEn ? 'Video Lessons' : 'Vidéos de Cours', icon: Video, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50', tab: 'explore' },
    { id: 'progress', title: isEn ? 'Progress' : 'Progrès', icon: TrendingUp, color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50', tab: 'profile' },
    { id: 'downloads', title: isEn ? 'Downloads' : 'Téléchargements', icon: Download, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/50', tab: 'profile' },
    { id: 'bookmarks', title: isEn ? 'Bookmarks' : 'Favoris', icon: Bookmark, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50', tab: 'explore' },
    { id: 'community', title: isEn ? 'Community' : 'Communauté', icon: MessageSquare, color: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/50', tab: 'profile' },
  ];

  const recommendedLessons = [
    {
      id: 'rec-1',
      title: isEn ? 'Organic Chemistry Reactions' : 'Chimie Organique: Réactions',
      subject: isEn ? 'GCE A-Level Chemistry' : 'Terminale C Chimie',
      duration: '35 mins',
      difficulty: isEn ? 'Advanced' : 'Avancé',
      author: 'Dr. Nfor Emmanuel',
      progress: 0,
      badge: 'POPULAR'
    },
    {
      id: 'rec-2',
      title: isEn ? 'Calculus: Integration by Parts' : 'Calcul: Intégration par parties',
      subject: isEn ? 'GCE A-Level Pure Math' : 'Terminale C Math',
      duration: '40 mins',
      difficulty: isEn ? 'High Priority' : 'Priorité',
      author: 'Prof. Fon Tanyi',
      progress: 20,
      badge: 'RECOMMENDED'
    },
    {
      id: 'rec-3',
      title: isEn ? 'Electromagnetic Induction & Faraday' : 'Induction Électromagnétique',
      subject: isEn ? 'GCE Physics Paper 2' : 'BAC Physique',
      duration: '25 mins',
      difficulty: isEn ? 'Medium' : 'Moyen',
      author: 'Mme. Biya Madeleine',
      progress: 60,
      badge: 'DRILL READY'
    }
  ];

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. Student Welcome Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#1E3A8A] to-[#1D4ED8] p-4 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-amber-400 p-0.5 shadow-md">
                <div className="h-full w-full rounded-full bg-[#0F2C59] flex items-center justify-center font-extrabold text-amber-300 text-sm">
                  KH
                </div>
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0F2C59]"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm tracking-tight text-white">Kemeh Hilary</h3>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/40">
                  {isEn ? 'GCE A-Level' : 'BAC C'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {isEn ? 'Physics, Pure Math, Chemistry' : 'Physique, Mathématiques, Chimie'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="h-3 w-3" />
              {isEn ? 'Premium Active' : 'Pass Premium'}
            </span>
            <span className="text-[9px] text-blue-300">
              {isOfflineMode ? (isEn ? '⚡ Offline Cache' : '⚡ Cache Hors-ligne') : (isEn ? '🌐 Sync Active' : '🌐 Synchronisé')}
            </span>
          </div>
        </div>

        {/* Learning Streak & Daily Goal Summary Bar inside Header */}
        <div className="mt-3.5 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl">
            <div className="p-1.5 bg-amber-400 text-[#0F2C59] rounded-lg">
              <Flame className="h-4 w-4 fill-amber-400" />
            </div>
            <div>
              <span className="block text-[10px] text-blue-200 font-semibold">{isEn ? 'Learning Streak' : 'Série d\'Étude'}</span>
              <span className="font-black text-white text-xs">🔥 14 {isEn ? 'Days' : 'Jours'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl">
            <div className="p-1.5 bg-emerald-400 text-[#0F2C59] rounded-lg">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] text-blue-200 font-semibold">{isEn ? 'Daily Target' : 'Objectif Jour'}</span>
              <span className="font-black text-white text-xs">45 / 60 {isEn ? 'Mins' : 'Min'} (75%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Daily Goal & Overall Progress Meter */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'} shadow-sm space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs">{isEn ? 'Exam Readiness Meter' : 'Indice de Préparation'}</h4>
              <p className="text-[10px] text-slate-400">{isEn ? 'Target: Grade A (5/5 Distinction)' : 'Cible: Mention Très Bien'}</p>
            </div>
          </div>
          <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl">
            88%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-400 rounded-full w-[88%] transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-medium pt-0.5">
            <span>{isEn ? 'Mock Exams Passed: 14/16' : 'Examens Blancs: 14/16'}</span>
            <span>{isEn ? '120 Drill Questions Solved' : '120 Exercices Résolus'}</span>
          </div>
        </div>
      </div>

      {/* 3. Continue Learning Card */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
            <Clock className="h-3 w-3" /> {isEn ? 'CONTINUE LEARNING' : 'REPRENDRE LE COURS'}
          </span>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5"
          >
            {isEn ? 'All Courses' : 'Voir tout'} <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md">
                {isEn ? 'GCE A-Level Physics' : 'BAC C Physique'}
              </span>
              <h5 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">
                {isEn ? 'Electromagnetic Induction & Faraday\'s Law' : 'Induction Électromagnétique & Loi de Faraday'}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? 'Chapter 4 • Dr. Nfor Emmanuel • 15 mins left' : 'Chapitre 4 • Dr. Nfor Emmanuel • 15 min restantes'}
              </p>
            </div>
            <button
              onClick={() => onDownloadItem('Electromagnetic Induction PDF')}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
              title="Save for offline study"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span>{isEn ? '78% Completed' : '78% Terminé'}</span>
              <span>{isEn ? 'Next: Self Assessment' : 'Suivant: Auto-évaluation'}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[78%]"></div>
            </div>
          </div>

          <button
            onClick={() => onStartLesson('Electromagnetic Induction & Faraday\'s Law', 'Physics')}
            className="w-full py-2 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            {isEn ? 'Resume Lesson Now' : 'Continuer la leçon'}
          </button>
        </div>
      </div>

      {/* 4. Edulpha AI Tutor Callout Card */}
      <div 
        onClick={() => onNavigateTab('ai')}
        className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-[#0F2C59] text-white shadow-md relative overflow-hidden group border border-purple-500/30"
      >
        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-purple-500/20 blur-xl group-hover:scale-125 transition"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-400 text-[#0F2C59] rounded-lg font-black">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-xs text-white">Edulpha AI Tutor</span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded-full border border-purple-400/30">
              {isEn ? '24/7 Instant Solver' : 'Résolveur Instantané'}
            </span>
          </div>

          <p className="text-[11px] text-purple-100 leading-snug">
            {isEn 
              ? 'Stuck on a GCE or BAC question? Get step-by-step LaTeX math solutions & AI feedback in EN/FR.'
              : 'Bloqué sur un exercice? Obtenez des solutions détaillées et explications étape par étape.'}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {isEn ? 'Tap to Ask AI a Question' : 'Appuyez pour poser une question'}
            </span>
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Actions Grid (10 Large Touch Targets) */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white px-1">
          {isEn ? 'QUICK ACTIONS' : 'ACCÈS RAPIDE'}
        </h4>

        <div className="grid grid-cols-5 gap-2">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  if (act.tab) onNavigateTab(act.tab as any);
                  else toast.success(`Opened ${act.title}`);
                }}
                className="flex flex-col items-center gap-1.5 p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition active:scale-95 text-center group"
              >
                <div className={`p-2.5 rounded-xl border ${act.color} transition group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1 leading-tight">
                  {act.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Recommended Lessons Carousel / List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
            {isEn ? 'RECOMMENDED LESSONS' : 'LEÇONS RECOMMANDÉES'}
          </h4>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isEn ? 'Explore All' : 'Tout explorer'}
          </button>
        </div>

        <div className="space-y-2">
          {recommendedLessons.map((rec) => (
            <div
              key={rec.id}
              className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center justify-between gap-3 hover:border-blue-500/50 transition`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black px-2 py-0.5 bg-amber-400/20 text-amber-700 dark:text-amber-300 rounded-md">
                    {rec.badge}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{rec.subject}</span>
                </div>
                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {rec.title}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>⏱️ {rec.duration}</span>
                  <span>• {rec.author}</span>
                </p>
              </div>

              <button
                onClick={() => onStartLesson(rec.title, rec.subject)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 shadow-sm"
              >
                {isEn ? 'Start' : 'Ouvrir'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Upcoming Exams & Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Upcoming Exams */}
        <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-2`}>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Calendar className="h-4 w-4" />
            <h4 className="font-extrabold text-xs">{isEn ? 'Upcoming Exams' : 'Examens à Venir'}</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50 flex justify-between items-center">
              <div>
                <h6 className="font-extrabold text-slate-900 dark:text-white text-[11px]">
                  {isEn ? 'GCE Physics Paper 2 Mock' : 'Examen Blanc Physique P2'}
                </h6>
                <p className="text-[9px] text-rose-700 dark:text-rose-300">{isEn ? 'June 12 • 2:00 PM (In 2 Days)' : '12 Juin • 14h00 (Dans 2j)'}</p>
              </div>
              <button
                onClick={() => onNavigateTab('exams')}
                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
              >
                {isEn ? 'Prepare' : 'Réviser'}
              </button>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-2`}>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <CheckCircle2 className="h-4 w-4" />
            <h4 className="font-extrabold text-xs">{isEn ? 'Today\'s Study Schedule' : 'Programme du Jour'}</h4>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="font-semibold text-slate-800 dark:text-slate-200">09:00 AM • Live Math Drill</span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">DONE</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="font-semibold text-slate-800 dark:text-slate-200">02:00 PM • Physics 10-Q Quiz</span>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">UPNEXT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Achievements Badges & Offline Status Banner */}
      <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-2.5`}>
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" />
            {isEn ? 'MY ACHIEVEMENTS' : 'MES SUCÈS'}
          </h4>
          <span className="text-[10px] font-bold text-amber-500">4 / 12 Unlocked</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-extrabold">
          <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-300/40">
            <div className="text-base mb-0.5">🔥</div>
            <span>14-Day Streak</span>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-300/40">
            <div className="text-base mb-0.5">🏆</div>
            <span>Quiz Master</span>
          </div>
          <div className="p-2 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-300/40">
            <div className="text-base mb-0.5">🤖</div>
            <span>AI Explorer</span>
          </div>
          <div className="p-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-300/40">
            <div className="text-base mb-0.5">🎯</div>
            <span>Math Wizard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
