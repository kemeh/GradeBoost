import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Wrench, Briefcase, Layers, Flame, ArrowRight, Sparkles, CheckCircle2,
  Calculator, Atom, FlaskConical, Dna, Languages, Globe, Compass, Landmark,
  LineChart, BookMarked, Monitor, Cpu, Hammer, Zap, Cog, HardHat, Home,
  Droplets, Scissors, Flame as FireIcon, Car, Snowflake, Network, Code,
  Receipt, Building2, Megaphone, Store, PieChart, Landmark as BankIcon,
  FileCheck, Lightbulb, Scale, ShieldCheck, Award, FileText, Check, ChevronRight
} from 'lucide-react';
import { Badge, Button, Card, cn } from './ui';

export function ExploreLearningPaths() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const categories = [
    {
      id: 'general',
      title: 'General Education',
      badge: 'Ordinary & Advanced Level (Grammar)',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gradient: 'from-indigo-600 via-indigo-700 to-blue-800',
      cardBorder: 'hover:border-indigo-500/50',
      accentColor: 'indigo',
      icon: BookOpen,
      iconBg: 'bg-indigo-500/20 text-indigo-300',
      description: 'Prepare for General Education examinations with structured lessons, practice questions, quizzes, mock exams, progress tracking, and AI-assisted learning.',
      subjects: [
        { name: 'Mathematics', icon: Calculator },
        { name: 'Physics', icon: Atom },
        { name: 'Chemistry', icon: FlaskConical },
        { name: 'Biology', icon: Dna },
        { name: 'English Language', icon: Languages },
        { name: 'French', icon: Globe },
        { name: 'History', icon: Landmark },
        { name: 'Geography', icon: Compass },
        { name: 'Economics', icon: LineChart },
        { name: 'Literature', icon: BookMarked },
        { name: 'Computer Science', icon: Monitor },
        { name: 'ICT', icon: Cpu },
      ],
      features: [
        'Complete O & A Level MINESEC Syllabus',
        '15,000+ Past Questions with Verified Keys',
        'Step-by-Step Gemini AI Math & Science Solvers',
        'Timed Mock Exams with Instant Analytics'
      ],
      ctaText: 'Start General Education Prep'
    },
    {
      id: 'technical',
      title: 'Technical Education',
      badge: 'Technical & Industrial Sub-system',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      gradient: 'from-amber-600 via-orange-600 to-red-700',
      cardBorder: 'hover:border-amber-500/50',
      accentColor: 'amber',
      icon: Wrench,
      iconBg: 'bg-amber-500/20 text-amber-300',
      description: 'Master technical and vocational subjects through practical learning resources, exam preparation, and industry-relevant content.',
      subjects: [
        { name: 'Electrical Technology', icon: Zap },
        { name: 'Electronics', icon: Cpu },
        { name: 'Mechanical Engineering', icon: Cog },
        { name: 'Civil Engineering', icon: HardHat },
        { name: 'Building Construction', icon: Home },
        { name: 'Plumbing', icon: Droplets },
        { name: 'Carpentry', icon: Hammer },
        { name: 'Welding & Fabrication', icon: FireIcon },
        { name: 'Automobile Technology', icon: Car },
        { name: 'Refrigeration & AC', icon: Snowflake },
        { name: 'Computer Engineering', icon: Monitor },
        { name: 'Networking', icon: Network },
        { name: 'Software Development', icon: Code },
      ],
      features: [
        'Circuit Schematics & Technical Diagrams',
        'Workshop Safety & Practical Guidelines',
        'Industrial Calculation Step-by-Step Solvers',
        'Real Exam Practical & Theory Mock Drills'
      ],
      ctaText: 'Explore Technical Specialties'
    },
    {
      id: 'commercial',
      title: 'Commercial Education',
      badge: 'Business & Financial Studies',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
      cardBorder: 'hover:border-emerald-500/50',
      accentColor: 'emerald',
      icon: Briefcase,
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      description: 'Develop professional business skills with courses designed for future accountants, managers, entrepreneurs, and office professionals.',
      subjects: [
        { name: 'Accounting', icon: Receipt },
        { name: 'Office Administration', icon: Building2 },
        { name: 'Marketing', icon: Megaphone },
        { name: 'Commerce', icon: Store },
        { name: 'Business Management', icon: PieChart },
        { name: 'Banking & Finance', icon: BankIcon },
        { name: 'Secretarial Studies', icon: FileCheck },
        { name: 'Entrepreneurship', icon: Lightbulb },
        { name: 'Taxation', icon: Receipt },
        { name: 'Business Law', icon: Scale },
      ],
      features: [
        'Double-Entry Accounting & Ledger Solvers',
        'Business Case Studies & Office Protocols',
        'Financial Formula Drills & Mock Tests',
        'AI Guidance on Business Calculations'
      ],
      ctaText: 'Explore Commercial Specialties'
    },
    {
      id: 'tvee-intermediate',
      title: 'TVEE Intermediate Level',
      badge: 'TVEE O-Level Equivalent',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      gradient: 'from-purple-600 via-violet-700 to-indigo-900',
      cardBorder: 'hover:border-purple-500/50',
      accentColor: 'purple',
      icon: Layers,
      iconBg: 'bg-purple-500/20 text-purple-300',
      description: 'All four commercial and technical pathways available at the TVEE Intermediate Level, combining core theory with practical exam mastery.',
      pathways: [
        'Industrial & Electrical Technology',
        'Civil Engineering & Building Trades',
        'Business Administration & Secretarial',
        'Commercial & Financial Studies'
      ],
      resources: [
        { title: 'Structured Notes', desc: 'Syllabus-aligned study guides for every module', icon: FileText },
        { title: 'Practical Exercises', desc: 'Hands-on workshop problems & solved papers', icon: Wrench },
        { title: 'Mock Examinations', desc: 'Timed simulated exams under board conditions', icon: Award },
        { title: 'AI Tutoring', desc: '24/7 Gemini AI assistance for complex topics', icon: Sparkles },
        { title: 'Performance Analytics', desc: 'Deep breakdown of strengths and target areas', icon: ShieldCheck }
      ],
      ctaText: 'Access Intermediate TVEE Prep'
    },
    {
      id: 'tvee-advanced',
      title: 'TVEE Advanced Level',
      badge: 'TVEE A-Level Equivalent',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      gradient: 'from-rose-600 via-pink-700 to-purple-900',
      cardBorder: 'hover:border-rose-500/50',
      accentColor: 'rose',
      icon: Flame,
      iconBg: 'bg-rose-500/20 text-rose-300',
      description: 'Advanced Level technical and commercial specialization with comprehensive syllabus coverage, practical assessment prep, and AI revision.',
      specialties: {
        commercial: ['Accounting', 'Marketing', 'Office Administration', 'Banking & Finance'],
        technical: ['Computer Engineering', 'Electrical Engineering', 'Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Building Construction', 'Network Systems', 'Industrial Maintenance']
      },
      includes: [
        'Complete syllabus coverage for all paper components',
        'Past questions with step-by-step model solutions',
        'Practical assessments & workshop project guides',
        'Instant Gemini AI explanations for formulas & theories',
        'Personalized revision plans targeting top grades'
      ],
      ctaText: 'Access Advanced TVEE Prep'
    }
  ];

  const filteredCategories = selectedFilter === 'all' 
    ? categories 
    : categories.filter(c => c.id === selectedFilter);

  return (
    <section id="curriculum" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-4 py-1">
            <Sparkles size={14} className="inline mr-1 text-amber-400" /> Complete Educational Ecosystem
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            Explore Every <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Learning Path</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Whether you are in General Education, Technical Education, Commercial Studies, or TVEE Intermediate and Advanced levels, Edulpha provides tailored past papers, AI explanations, and practical prep for every student.
          </p>

          {/* Interactive Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Pathways' },
              { id: 'general', label: 'General Education' },
              { id: 'technical', label: 'Technical Education' },
              { id: 'commercial', label: 'Commercial Education' },
              { id: 'tvee-intermediate', label: 'TVEE Intermediate' },
              { id: 'tvee-advanced', label: 'TVEE Advanced' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  selectedFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {filteredCategories.map((cat, idx) => {
                const CategoryIcon = cat.icon;
                const isFullWidth = filteredCategories.length === 1 || cat.id === 'general' || cat.id === 'tvee-advanced';

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className={cn(
                      "group bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700",
                      isFullWidth ? "lg:col-span-12" : "lg:col-span-6"
                    )}
                  >
                    {/* Top Decorative Gradient Accent Bar */}
                    <div className={cn("absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r", cat.gradient)} />

                    {/* Card Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3.5 rounded-2xl border border-slate-700/60 shadow-inner", cat.iconBg)}>
                          <CategoryIcon size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border", cat.badgeColor)}>
                              {cat.badge}
                            </span>
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                            {cat.title}
                          </h3>
                        </div>
                      </div>

                      <Link to="/auth">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5">
                          <span>{cat.ctaText}</span>
                          <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Category Specific Content Breakdown */}

                    {/* 1. General, Technical, Commercial Subject Chips */}
                    {cat.subjects && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-400" />
                          <span>Covered Subjects & Specialties ({cat.subjects.length}):</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.subjects.map((sub, sIdx) => {
                            const SubIcon = sub.icon;
                            return (
                              <div
                                key={sIdx}
                                className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 rounded-xl text-xs font-bold text-slate-200 transition flex items-center gap-2"
                              >
                                <SubIcon size={14} className="text-indigo-400" />
                                <span>{sub.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. TVEE Intermediate Special Content */}
                    {cat.pathways && cat.resources && (
                      <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {cat.pathways.map((path, pIdx) => (
                            <div key={pIdx} className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-xs font-bold text-purple-200 flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                              <span>{path}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                          {cat.resources.map((res, rIdx) => {
                            const ResIcon = res.icon;
                            return (
                              <div key={rIdx} className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-center space-y-1.5 hover:border-purple-500/40 transition">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 mx-auto flex items-center justify-center">
                                  <ResIcon size={16} />
                                </div>
                                <h5 className="font-bold text-xs text-white leading-tight">{res.title}</h5>
                                <p className="text-[10px] text-slate-400 leading-normal">{res.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. TVEE Advanced Special Content */}
                    {cat.specialties && (
                      <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                            <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                              <Briefcase size={14} /> Commercial Specialties:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {cat.specialties.commercial.map((sp, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-xs font-bold rounded-lg">
                                  {sp}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                            <h5 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                              <Wrench size={14} /> Technical Specialties:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {cat.specialties.technical.map((sp, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-amber-950/50 border border-amber-800/40 text-amber-300 text-xs font-bold rounded-lg">
                                  {sp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {cat.includes && (
                          <div className="p-4 bg-rose-950/30 border border-rose-900/40 rounded-2xl space-y-2">
                            <h5 className="text-xs font-black uppercase text-rose-300 tracking-wider">
                              Every TVEE Specialty Includes:
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-semibold text-slate-300">
                              {cat.includes.map((inc, iIdx) => (
                                <div key={iIdx} className="flex items-center gap-2">
                                  <Check size={14} className="text-rose-400 shrink-0" />
                                  <span>{inc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Features Bullet List Footer */}
                    {cat.features && (
                      <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-300">
                        {cat.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>

        {/* Bottom Callout Bar */}
        <div className="p-6 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-800/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xl">
          <div className="space-y-1">
            <h4 className="font-black text-white text-base sm:text-lg">Can't find your specific specialty or subject?</h4>
            <p className="text-xs text-indigo-200 font-medium">
              Edulpha's MINESEC & Cameroon GCE board curriculum database is updated weekly with new past questions and AI models.
            </p>
          </div>
          <Link to="/auth" className="shrink-0">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg">
              Search Full Syllabus Database
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
