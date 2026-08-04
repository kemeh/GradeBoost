import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Bookmark,
  Play,
  FileText,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileExploreScreenProps {
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
  onStartLesson: (title: string, subject: string) => void;
  onDownloadItem: (title: string) => void;
}

export const MobileExploreScreen: React.FC<MobileExploreScreenProps> = ({
  simLang,
  isDarkMode,
  onStartLesson,
  onDownloadItem,
}) => {
  const isEn = simLang === 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gce' | 'bac' | 'videos' | 'notes'>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['rec-1']);

  const toggleBookmark = (id: string, name: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        toast.success(`Removed "${name}" from bookmarks`);
        return prev.filter((i) => i !== id);
      } else {
        toast.success(`Saved "${name}" to bookmarks!`);
        return [...prev, id];
      }
    });
  };

  const subjects = [
    {
      id: 'sub-math',
      title: isEn ? 'GCE Pure Mathematics P1 & P3' : 'Mathématiques Spéciales BAC C/D',
      level: isEn ? 'A-Level' : 'BAC C/D',
      lessonsCount: 120,
      completedCount: 95,
      progress: 80,
      difficulty: isEn ? 'Advanced' : 'Avancé',
      icon: '📐',
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-500/20 text-blue-400'
    },
    {
      id: 'sub-phys',
      title: isEn ? 'GCE Physics Mechanics & Fields' : 'Physique: Mécanique & Champs',
      level: isEn ? 'A-Level' : 'BAC C',
      lessonsCount: 95,
      completedCount: 57,
      progress: 60,
      difficulty: isEn ? 'Hard' : 'Difficile',
      icon: '⚡',
      color: 'from-purple-600 to-indigo-800',
      badgeColor: 'bg-purple-500/20 text-purple-400'
    },
    {
      id: 'sub-chem',
      title: isEn ? 'GCE Organic & Physical Chemistry' : 'Chimie Organique & Minérale',
      level: isEn ? 'A-Level' : 'BAC D',
      lessonsCount: 85,
      completedCount: 61,
      progress: 72,
      difficulty: isEn ? 'Medium' : 'Moyen',
      icon: '🧪',
      color: 'from-emerald-600 to-teal-800',
      badgeColor: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      id: 'sub-bepc',
      title: isEn ? 'BEPC Physical Sciences & Chemistry' : 'BEPC Sciences Physiques',
      level: 'BEPC MINESEC',
      lessonsCount: 65,
      completedCount: 30,
      progress: 46,
      difficulty: isEn ? 'Foundational' : 'Fondamental',
      icon: '🔬',
      color: 'from-amber-600 to-orange-700',
      badgeColor: 'bg-amber-500/20 text-amber-400'
    }
  ];

  const featuredLessons = [
    {
      id: 'les-1',
      title: isEn ? 'Calculus: Integration by Parts & Trigonometric Substitution' : 'Calcul: Intégration par parties & Substitution',
      subject: isEn ? 'Pure Mathematics P3' : 'Mathématiques Terminale C',
      teacher: 'Prof. Fon Tanyi (20+ Yrs GCE Examiner)',
      duration: '45 mins',
      difficulty: 'Advanced',
      type: 'video',
      offlineAvailable: true,
      progress: 75,
      coverImg: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'les-2',
      title: isEn ? 'Organic Chemistry: Reaction Mechanisms & Synthesis' : 'Chimie Organique: Mécanismes de Réaction',
      subject: isEn ? 'GCE A-Level Chemistry' : 'Terminale D Chimie',
      teacher: 'Dr. Nfor Emmanuel',
      duration: '35 mins',
      difficulty: 'High Priority',
      type: 'notes',
      offlineAvailable: true,
      progress: 30,
      coverImg: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'les-3',
      title: isEn ? 'Electromagnetic Induction & Lenz\'s Law Experiments' : 'Induction Électromagnétique & Loi de Lenz',
      subject: isEn ? 'Physics Paper 2' : 'BAC Physique-Chimie',
      teacher: 'Mme. Biya Madeleine',
      duration: '30 mins',
      difficulty: 'Medium',
      type: 'video',
      offlineAvailable: false,
      progress: 0,
      coverImg: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {isEn ? 'Explore Curriculum & Subjects' : 'Explorer les Matières & Cours'}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {isEn ? 'Bilingual Cameroon GCE O/A Level & MINESEC BEPC/BAC' : 'Programme Officiel Camerounais GCE & MINESEC'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isEn ? 'Search math formulas, physics notes, past papers...' : 'Rechercher cours, résumés, formules...'}
          className={`w-full pl-10 pr-4 py-2 rounded-2xl text-xs border ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold">
        {[
          { id: 'all', label: isEn ? 'All Subjects' : 'Toutes les matières' },
          { id: 'gce', label: '🇬🇧 GCE O/A Level' },
          { id: 'bac', label: '🇫🇷 BEPC / BAC' },
          { id: 'videos', label: '📹 Video Lessons' },
          { id: 'notes', label: '📓 Study Notes' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap border transition ${
              selectedFilter === f.id
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Section 1: Subject Cards Grid */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white px-1">
          {isEn ? 'FEATURED SUBJECTS' : 'MATIÈRES PRINCIPALES'}
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-3 relative overflow-hidden`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${sub.color} flex items-center justify-center text-xl shadow-md`}>
                    {sub.icon}
                  </div>
                  <div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${sub.badgeColor}`}>
                      {sub.level}
                    </span>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">
                      {sub.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {sub.lessonsCount} {isEn ? 'Lessons' : 'Leçons'} • {sub.completedCount} {isEn ? 'Completed' : 'Terminées'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {sub.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${sub.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                <span className="text-slate-400 font-semibold">
                  Difficulty: <strong className="text-slate-700 dark:text-slate-200">{sub.difficulty}</strong>
                </span>
                <button
                  onClick={() => onStartLesson(`${sub.title} Overview`, sub.title)}
                  className="px-3 py-1.5 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Play className="h-3 w-3 text-amber-400 fill-amber-400" />
                  {isEn ? 'Quick Start' : 'Démarrer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Recommended Lessons with Cover Images */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white px-1">
          {isEn ? 'POPULAR LESSON MODULES' : 'MODULES DE COURS PRISÉS'}
        </h4>

        <div className="space-y-3">
          {featuredLessons.map((les) => {
            const isBookmarked = bookmarkedIds.includes(les.id);
            return (
              <div
                key={les.id}
                className={`rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm overflow-hidden space-y-3`}
              >
                {/* Cover Image Banner */}
                <div className="relative h-28 w-full bg-slate-800">
                  <img
                    src={les.coverImg}
                    alt={les.title}
                    className="w-full h-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>

                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-600/90 text-white text-[9px] font-black rounded backdrop-blur-md">
                      {les.subject}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-400/90 text-slate-950 text-[9px] font-black rounded backdrop-blur-md">
                      {les.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(les.id, les.title)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/60 backdrop-blur-md rounded-full text-white hover:text-amber-400 transition"
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end text-white text-[10px]">
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-300" /> {les.duration}
                    </span>
                    <span className="bg-emerald-500/80 px-2 py-0.5 rounded text-[9px] font-bold">
                      {les.offlineAvailable ? '💾 Offline Ready' : '🌐 Online Only'}
                    </span>
                  </div>
                </div>

                {/* Lesson Details Content */}
                <div className="p-3 pt-0 space-y-2">
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                    {les.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Instructor: <strong className="text-slate-700 dark:text-slate-200">{les.teacher}</strong>
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onDownloadItem(les.title)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" /> {isEn ? 'Save Offline' : 'Télécharger'}
                    </button>

                    <button
                      onClick={() => onStartLesson(les.title, les.subject)}
                      className="px-3.5 py-1.5 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      {isEn ? 'Open Lesson' : 'Ouvrir'} <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
