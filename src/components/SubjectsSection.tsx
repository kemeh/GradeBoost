import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Monitor, Atom, FlaskConical, Dna, LineChart, Receipt, Megaphone,
  Building2, Zap, Home, Code, Network, Globe, Languages, Compass, Landmark,
  BookOpen, Sparkles, CheckCircle2, Search, ArrowRight, Award, Layers, Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface SubjectItem {
  id: string;
  name: string;
  category: 'general-en' | 'general-fr' | 'technical' | 'commercial';
  icon: any;
  level: string;
  lessonsCount: number;
  questionsCount: number;
  hasMockExams: boolean;
  difficulty: 'O-Level / BEPC' | 'A-Level / Bac' | 'TVEE Intermediate' | 'TVEE Advanced';
  description: string;
  bgGradient: string;
  textColor: string;
  badgeBg: string;
}

const ALL_SUBJECTS: SubjectItem[] = [
  {
    id: 'math',
    name: 'Mathematics',
    category: 'general-en',
    icon: Calculator,
    level: 'O-Level & A-Level',
    lessonsCount: 64,
    questionsCount: 2400,
    hasMockExams: true,
    difficulty: 'O-Level / BEPC',
    description: 'Algebra, Geometry, Calculus, Statistics, and Mechanics aligned with GCE Board syllabus.',
    bgGradient: 'from-blue-600 to-indigo-700',
    textColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'comp-sci',
    name: 'Computer Science',
    category: 'general-en',
    icon: Monitor,
    level: 'O-Level & A-Level',
    lessonsCount: 48,
    questionsCount: 1800,
    hasMockExams: true,
    difficulty: 'A-Level / Bac',
    description: 'Algorithms, Data Structures, Python Programming, System Analysis, and Database Management.',
    bgGradient: 'from-indigo-600 to-purple-700',
    textColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'physics',
    name: 'Physics',
    category: 'general-en',
    icon: Atom,
    level: 'O-Level & A-Level',
    lessonsCount: 52,
    questionsCount: 1950,
    hasMockExams: true,
    difficulty: 'A-Level / Bac',
    description: 'Mechanics, Electricity, Quantum Physics, Waves, Thermal Physics, and Practical Physics.',
    bgGradient: 'from-violet-600 to-purple-800',
    textColor: 'text-violet-600',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'general-en',
    icon: FlaskConical,
    level: 'O-Level & A-Level',
    lessonsCount: 50,
    questionsCount: 1700,
    hasMockExams: true,
    difficulty: 'A-Level / Bac',
    description: 'Physical, Organic, and Inorganic Chemistry with step-by-step chemical reaction solvers.',
    bgGradient: 'from-emerald-600 to-teal-700',
    textColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'general-en',
    icon: Dna,
    level: 'O-Level & A-Level',
    lessonsCount: 56,
    questionsCount: 1600,
    hasMockExams: true,
    difficulty: 'O-Level / BEPC',
    description: 'Cellular Biology, Genetics, Ecology, Human Anatomy, Physiology, and Plant Systems.',
    bgGradient: 'from-teal-600 to-emerald-800',
    textColor: 'text-teal-600',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'economics',
    name: 'Economics',
    category: 'general-en',
    icon: LineChart,
    level: 'O-Level & A-Level',
    lessonsCount: 42,
    questionsCount: 1400,
    hasMockExams: true,
    difficulty: 'A-Level / Bac',
    description: 'Microeconomics, Macroeconomics, International Trade, Monetary Policy, and Development Economics.',
    bgGradient: 'from-amber-600 to-orange-700',
    textColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'accounting',
    name: 'Financial Accounting',
    category: 'commercial',
    icon: Receipt,
    level: 'Intermediate & Advanced',
    lessonsCount: 45,
    questionsCount: 1550,
    hasMockExams: true,
    difficulty: 'TVEE Advanced',
    description: 'Double-entry bookkeeping, Balance Sheets, Ledger postings, Trial balances, and Auditing.',
    bgGradient: 'from-emerald-700 to-cyan-800',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    category: 'commercial',
    icon: Megaphone,
    level: 'Intermediate & Advanced',
    lessonsCount: 38,
    questionsCount: 1100,
    hasMockExams: true,
    difficulty: 'TVEE Intermediate',
    description: 'Market research, Consumer behavior, Brand management, Digital marketing, and Distribution channels.',
    bgGradient: 'from-orange-600 to-red-600',
    textColor: 'text-orange-600',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'office-admin',
    name: 'Office Administration',
    category: 'commercial',
    icon: Building2,
    level: 'Intermediate Level',
    lessonsCount: 36,
    questionsCount: 950,
    hasMockExams: true,
    difficulty: 'TVEE Intermediate',
    description: 'Executive secretarial procedures, Records management, Business correspondence, and Office ethics.',
    bgGradient: 'from-blue-700 to-slate-800',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'elec-tech',
    name: 'Electrical Technology',
    category: 'technical',
    icon: Zap,
    level: 'TVEE Intermediate & Advanced',
    lessonsCount: 58,
    questionsCount: 2100,
    hasMockExams: true,
    difficulty: 'TVEE Advanced',
    description: 'Electrical circuits, AC/DC motors, Transformers, Wiring schematics, and Industrial Automation.',
    bgGradient: 'from-yellow-600 to-amber-700',
    textColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'building-const',
    name: 'Building Construction',
    category: 'technical',
    icon: Home,
    level: 'TVEE Intermediate & Advanced',
    lessonsCount: 44,
    questionsCount: 1350,
    hasMockExams: true,
    difficulty: 'TVEE Intermediate',
    description: 'Civil engineering drawings, Masonry, Structural design, Concrete technology, and Site surveying.',
    bgGradient: 'from-stone-600 to-amber-800',
    textColor: 'text-stone-600',
    badgeBg: 'bg-stone-100 text-stone-800 border-stone-200',
  },
  {
    id: 'soft-dev',
    name: 'Software Development',
    category: 'technical',
    icon: Code,
    level: 'TVEE Advanced Level',
    lessonsCount: 60,
    questionsCount: 2200,
    hasMockExams: true,
    difficulty: 'TVEE Advanced',
    description: 'Web development (HTML/CSS/JS/React), Mobile app logic, REST APIs, and Software engineering concepts.',
    bgGradient: 'from-indigo-700 to-blue-900',
    textColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    id: 'networking',
    name: 'Computer Networking',
    category: 'technical',
    icon: Network,
    level: 'TVEE Advanced Level',
    lessonsCount: 40,
    questionsCount: 1250,
    hasMockExams: true,
    difficulty: 'TVEE Advanced',
    description: 'TCP/IP, Routing & Switching, Network Security, Subnetting, and Hardware maintenance.',
    bgGradient: 'from-cyan-600 to-blue-700',
    textColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'french-fr',
    name: 'Langue Française & Littérature',
    category: 'general-fr',
    icon: Globe,
    level: 'BEPC, Probatoire & Baccalauréat',
    lessonsCount: 48,
    questionsCount: 1650,
    hasMockExams: true,
    difficulty: 'A-Level / Bac',
    description: 'Explication de texte, Dissertation littéraire, Grammaire, Conjugaison, et Analyse stylistique.',
    bgGradient: 'from-rose-600 to-red-700',
    textColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'english-lang',
    name: 'English Language & Literature',
    category: 'general-en',
    icon: Languages,
    level: 'O-Level & A-Level',
    lessonsCount: 50,
    questionsCount: 1750,
    hasMockExams: true,
    difficulty: 'O-Level / BEPC',
    description: 'Grammar mechanics, Reading comprehension, Essay writing techniques, and Literary analysis.',
    bgGradient: 'from-blue-600 to-indigo-800',
    textColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'history',
    name: 'History & Citizenship',
    category: 'general-en',
    icon: Landmark,
    level: 'O-Level & A-Level',
    lessonsCount: 42,
    questionsCount: 1300,
    hasMockExams: true,
    difficulty: 'O-Level / BEPC',
    description: 'Cameroon History, Pan-African Movements, World Wars, United Nations, and Civic Duty.',
    bgGradient: 'from-purple-600 to-indigo-700',
    textColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'geography',
    name: 'Geography & Environment',
    category: 'general-en',
    icon: Compass,
    level: 'O-Level & A-Level',
    lessonsCount: 40,
    questionsCount: 1200,
    hasMockExams: true,
    difficulty: 'O-Level / BEPC',
    description: 'Physical Geography, Map Work, Geomorphology, Economic Geography, and Climate Science.',
    bgGradient: 'from-emerald-600 to-green-700',
    textColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export const SubjectsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'general-en' | 'general-fr' | 'technical' | 'commercial'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredSubjects = ALL_SUBJECTS.filter((subj) => {
    const matchesTab = activeTab === 'all' || subj.category === activeTab;
    const matchesSearch = subj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          subj.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <section id="subjects" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen size={14} />
            Comprehensive Subject Directory
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Explore 45+ Subjects Across General, Technical & TVEE Fields
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium">
            Every subject includes structured topic breakdowns, 15,000+ official MINESEC & GCE past questions, instant step-by-step Edulpha AI guidance, and timed mock exam simulators.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-950/80 p-3 sm:p-4 rounded-3xl border border-slate-800 backdrop-blur-md">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full lg:w-auto">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'general-en', label: 'General (Anglophone GCE)' },
              { id: 'general-fr', label: 'Général (Francophone BEPC/BAC)' },
              { id: 'technical', label: 'Technical & Industrial' },
              { id: 'commercial', label: 'Commercial & Business' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject or keyword..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubjects.map((subj) => {
              const IconComponent = subj.icon;
              return (
                <motion.div
                  key={subj.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-950/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Header Icon + Level Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${subj.bgGradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent size={24} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${subj.badgeBg}`}>
                        {subj.difficulty}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                        {subj.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-2 leading-relaxed">
                        {subj.description}
                      </p>
                    </div>

                    {/* Stats List */}
                    <div className="pt-3 border-t border-slate-900 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/60 p-2 rounded-xl text-center">
                        <span className="block text-slate-400 text-[10px] font-bold uppercase">Lessons</span>
                        <span className="font-black text-white">{subj.lessonsCount}+ Modules</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl text-center">
                        <span className="block text-slate-400 text-[10px] font-bold uppercase">Questions</span>
                        <span className="font-black text-emerald-400">{subj.questionsCount}+ Qs</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="pt-5 mt-4 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-400" /> Mock Exams Ready
                    </span>
                    <button
                      onClick={() => navigate('/auth')}
                      className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 rounded-xl text-xs font-black transition-all flex items-center gap-1 group-hover:px-4"
                    >
                      <span>Explore</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1">
            <h4 className="text-lg font-black text-white">Can't find your specific technical or vocational specialty?</h4>
            <p className="text-xs text-slate-300">
              Edulpha covers over 45+ official MINESEC technical specialties including Auto Mechanics, Refrigeration, Secretarial, and Carpentry.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
            <button
              onClick={() => navigate('/subjects')}
              className="px-5 py-3 border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 font-bold text-xs rounded-2xl tracking-wider transition-all"
            >
              Learn More Subjects
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-2xl uppercase tracking-wider shadow-lg shadow-emerald-400/20 transition-all"
            >
              View Complete Syllabus Catalog
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
