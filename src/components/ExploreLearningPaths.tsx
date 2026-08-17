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
import { useLanguage } from '../contexts/LanguageContext';

export function ExploreLearningPaths() {
  const { language } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const isFr = language === 'fr';

  const categories = [
    {
      id: 'general',
      title: isFr ? 'Enseignement Général' : 'General Education',
      badge: isFr ? 'Ordinary & Advanced Level (Grammaire)' : 'Ordinary & Advanced Level (Grammar)',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gradient: 'from-indigo-600 via-indigo-700 to-blue-800',
      cardBorder: 'hover:border-indigo-500/50',
      accentColor: 'indigo',
      icon: BookOpen,
      iconBg: 'bg-indigo-500/20 text-indigo-300',
      description: isFr
        ? 'Préparez les examens d’enseignement général avec des cours structurés, des exercices pratiques, des quiz, des examens blancs et un accompagnement par IA.'
        : 'Prepare for General Education examinations with structured lessons, practice questions, quizzes, mock exams, progress tracking, and AI-assisted learning.',
      subjects: [
        { name: isFr ? 'Mathématiques' : 'Mathematics', icon: Calculator },
        { name: isFr ? 'Physique' : 'Physics', icon: Atom },
        { name: isFr ? 'Chimie' : 'Chemistry', icon: FlaskConical },
        { name: isFr ? 'Biologie / SVTEEHB' : 'Biology', icon: Dna },
        { name: isFr ? 'Langue Anglaise' : 'English Language', icon: Languages },
        { name: isFr ? 'Français' : 'French', icon: Globe },
        { name: isFr ? 'Histoire' : 'History', icon: Landmark },
        { name: isFr ? 'Géographie' : 'Geography', icon: Compass },
        { name: isFr ? 'Économie' : 'Economics', icon: LineChart },
        { name: isFr ? 'Littérature' : 'Literature', icon: BookMarked },
        { name: isFr ? 'Informatique' : 'Computer Science', icon: Monitor },
        { name: isFr ? 'TIC' : 'ICT', icon: Cpu },
      ],
      features: isFr ? [
        'Programme Officiel MINESEC O & A Level / BEPC & Bac',
        'Plus de 15 000 Épreuves avec Corrigés Détaillés',
        'Résolveur IA Étape par Étape pour Maths & Sciences',
        'Examens Blancs Chronométrés avec Analyses'
      ] : [
        'Complete O & A Level MINESEC Syllabus',
        '15,000+ Past Questions with Verified Keys',
        'Step-by-Step Gemini AI Math & Science Solvers',
        'Timed Mock Exams with Instant Analytics'
      ],
      ctaText: isFr ? 'Prépa Enseignement Général' : 'Start General Education Prep'
    },
    {
      id: 'technical',
      title: isFr ? 'Enseignement Technique' : 'Technical Education',
      badge: isFr ? 'Sous-système Technique & Industriel' : 'Technical & Industrial Sub-system',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      gradient: 'from-amber-600 via-orange-600 to-red-700',
      cardBorder: 'hover:border-amber-500/50',
      accentColor: 'amber',
      icon: Wrench,
      iconBg: 'bg-amber-500/20 text-amber-300',
      description: isFr
        ? 'Maîtrisez les matières techniques et professionnelles grâce à des ressources d’apprentissage pratiques et la préparation aux épreuves professionnelles.'
        : 'Master technical and vocational subjects through practical learning resources, exam preparation, and industry-relevant content.',
      subjects: [
        { name: isFr ? 'Électrotechnique' : 'Electrical Technology', icon: Zap },
        { name: isFr ? 'Électronique' : 'Electronics', icon: Cpu },
        { name: isFr ? 'Génie Mécanique' : 'Mechanical Engineering', icon: Cog },
        { name: isFr ? 'Génie Civil' : 'Civil Engineering', icon: HardHat },
        { name: isFr ? 'Bâtiment & Construction' : 'Building Construction', icon: Home },
        { name: isFr ? 'Plomberie' : 'Plumbing', icon: Droplets },
        { name: isFr ? 'Menuiserie' : 'Carpentry', icon: Hammer },
        { name: isFr ? 'Chaudronnerie & Soudure' : 'Welding & Fabrication', icon: FireIcon },
        { name: isFr ? 'Mécanique Automobile' : 'Automobile Technology', icon: Car },
        { name: isFr ? 'Froid & Climatisation' : 'Refrigeration & AC', icon: Snowflake },
        { name: isFr ? 'Maintenance Informatique' : 'Computer Engineering', icon: Monitor },
        { name: isFr ? 'Réseaux Informatiques' : 'Networking', icon: Network },
        { name: isFr ? 'Génie Logiciel' : 'Software Development', icon: Code },
      ],
      features: isFr ? [
        'Schémas Électriques & Schémas Techniques',
        'Consignes de Sécurité & Travaux Pratiques',
        'Calculs Industriels Étape par Étape via IA',
        'Épreuves Pratiques & Théoriques d’Examens'
      ] : [
        'Circuit Schematics & Technical Diagrams',
        'Workshop Safety & Practical Guidelines',
        'Industrial Calculation Step-by-Step Solvers',
        'Real Exam Practical & Theory Mock Drills'
      ],
      ctaText: isFr ? 'Explorer la Filière Technique' : 'Explore Technical Specialties'
    },
    {
      id: 'commercial',
      title: isFr ? 'Enseignement Commercial' : 'Commercial Education',
      badge: isFr ? 'Gestion, Commerce & Finances' : 'Business & Financial Studies',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
      cardBorder: 'hover:border-emerald-500/50',
      accentColor: 'emerald',
      icon: Briefcase,
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      description: isFr
        ? 'Développez des compétences professionnelles en gestion et comptabilité avec des cours conçus pour les futurs comptables, managers et secrétaires.'
        : 'Develop professional business skills with courses designed for future accountants, managers, entrepreneurs, and office professionals.',
      subjects: [
        { name: isFr ? 'Comptabilité' : 'Accounting', icon: Receipt },
        { name: isFr ? 'Bureautique & Secrétariat' : 'Office Administration', icon: Building2 },
        { name: isFr ? 'Marketing' : 'Marketing', icon: Megaphone },
        { name: isFr ? 'Commerce & Vente' : 'Commerce', icon: Store },
        { name: isFr ? 'Gestion des Entreprises' : 'Business Management', icon: PieChart },
        { name: isFr ? 'Banque & Finance' : 'Banking & Finance', icon: BankIcon },
        { name: isFr ? 'Bureautique' : 'Secretarial Studies', icon: FileCheck },
        { name: isFr ? 'Entrepreneuriat' : 'Entrepreneurship', icon: Lightbulb },
        { name: isFr ? 'Fiscalité' : 'Taxation', icon: Receipt },
        { name: isFr ? 'Droit des Affaires' : 'Business Law', icon: Scale },
      ],
      features: isFr ? [
        'Comptabilité en Partie Double & Journaux',
        'Études de Cas d’Entreprise & Protocoles',
        'Formules Financières & Examens Blancs',
        'Résolution Automatique de Problèmes Comptables'
      ] : [
        'Double-Entry Accounting & Ledger Solvers',
        'Business Case Studies & Office Protocols',
        'Financial Formula Drills & Mock Tests',
        'AI Guidance on Business Calculations'
      ],
      ctaText: isFr ? 'Explorer la Filière Commerciale' : 'Explore Commercial Specialties'
    },
    {
      id: 'tvee-intermediate',
      title: isFr ? 'Niveau TVEE Intermédiaire' : 'TVEE Intermediate Level',
      badge: isFr ? 'Équivalent O-Level TVEE' : 'TVEE O-Level Equivalent',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      gradient: 'from-purple-600 via-violet-700 to-indigo-900',
      cardBorder: 'hover:border-purple-500/50',
      accentColor: 'purple',
      icon: Layers,
      iconBg: 'bg-purple-500/20 text-purple-300',
      description: isFr
        ? 'Toutes les filières commerciales et techniques au niveau intermédiaire TVEE, combinant théorie et maîtrise des épreuves pratiques.'
        : 'All four commercial and technical pathways available at the TVEE Intermediate Level, combining core theory with practical exam mastery.',
      pathways: isFr ? [
        'Technologie Industrielle & Électrique',
        'Génie Civil & Métiers du Bâtiment',
        'Administration & Secrétariat',
        'Études Commerciales & Financières'
      ] : [
        'Industrial & Electrical Technology',
        'Civil Engineering & Building Trades',
        'Business Administration & Secretarial',
        'Commercial & Financial Studies'
      ],
      resources: isFr ? [
        { title: 'Notes Structurées', desc: 'Fiches de cours conformes au programme', icon: FileText },
        { title: 'Travaux Pratiques', desc: 'Problèmes d’ateliers & épreuves corrigées', icon: Wrench },
        { title: 'Examens Blancs', desc: 'Simulations d’examens en temps réel', icon: Award },
        { title: 'Tuteur IA 24/7', desc: 'Assistance IA Gemini sur sujets complexes', icon: Sparkles },
        { title: 'Analyses de Notes', desc: 'Suivi des progrès et axes d’amélioration', icon: ShieldCheck }
      ] : [
        { title: 'Structured Notes', desc: 'Syllabus-aligned study guides for every module', icon: FileText },
        { title: 'Practical Exercises', desc: 'Hands-on workshop problems & solved papers', icon: Wrench },
        { title: 'Mock Examinations', desc: 'Timed simulated exams under board conditions', icon: Award },
        { title: 'AI Tutoring', desc: '24/7 Gemini AI assistance for complex topics', icon: Sparkles },
        { title: 'Performance Analytics', desc: 'Deep breakdown of strengths and target areas', icon: ShieldCheck }
      ],
      ctaText: isFr ? 'Accéder au Niveau Intermédiaire' : 'Access Intermediate TVEE Prep'
    },
    {
      id: 'tvee-advanced',
      title: isFr ? 'Niveau TVEE Avancé' : 'TVEE Advanced Level',
      badge: isFr ? 'Équivalent A-Level TVEE' : 'TVEE A-Level Equivalent',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      gradient: 'from-rose-600 via-pink-700 to-purple-900',
      cardBorder: 'hover:border-rose-500/50',
      accentColor: 'rose',
      icon: Flame,
      iconBg: 'bg-rose-500/20 text-rose-300',
      description: isFr
        ? 'Spécialisations techniques et commerciales de niveau avancé avec couverture complète du programme, entraînement aux épreuves pratiques et révisions assistées par IA.'
        : 'Advanced Level technical and commercial specialization with comprehensive syllabus coverage, practical assessment prep, and AI revision.',
      specialties: {
        commercial: isFr 
          ? ['Comptabilité', 'Marketing', 'Bureautique & Secrétariat', 'Banque & Finance']
          : ['Accounting', 'Marketing', 'Office Administration', 'Banking & Finance'],
        technical: isFr
          ? ['Génie Informatique', 'Génie Électrique', 'Électronique', 'Génie Mécanique', 'Génie Civil', 'Bâtiment', 'Réseaux Informatiques', 'Maintenance Industrielle']
          : ['Computer Engineering', 'Electrical Engineering', 'Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Building Construction', 'Network Systems', 'Industrial Maintenance']
      },
      includes: isFr ? [
        'Couverture complète de toutes les composantes d’épreuve',
        'Sujets d’examen avec corrections détaillées',
        'Évaluations pratiques & guides de projets d’atelier',
        'Explications IA instantanées pour théories et formules',
        'Plans de révision personnalisés pour viser les mentions'
      ] : [
        'Complete syllabus coverage for all paper components',
        'Past questions with step-by-step model solutions',
        'Practical assessments & workshop project guides',
        'Instant Gemini AI explanations for formulas & theories',
        'Personalized revision plans targeting top grades'
      ],
      ctaText: isFr ? 'Accéder au Niveau Avancé' : 'Access Advanced TVEE Prep'
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
            <Sparkles size={14} className="inline mr-1 text-amber-400" />
            {isFr ? 'Écosystème Éducatif Complet' : 'Complete Educational Ecosystem'}
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            {isFr ? (
              <>
                Explorez Tous Nos <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Parcours d’Apprentissage</span>
              </>
            ) : (
              <>
                Explore Every <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Learning Path</span>
              </>
            )}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            {isFr
              ? 'Que vous soyez dans l’enseignement général, technique, commercial ou dans les filières TVEE, Edulpha vous propose des sujets d’examens adaptés, des explications IA et une préparation sur mesure.'
              : 'Whether you are in General Education, Technical Education, Commercial Studies, or TVEE Intermediate and Advanced levels, Edulpha provides tailored past papers, AI explanations, and practical prep for every student.'}
          </p>

          {/* Interactive Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: isFr ? 'Tous les Parcours' : 'All Pathways' },
              { id: 'general', label: isFr ? 'Enseignement Général' : 'General Education' },
              { id: 'technical', label: isFr ? 'Enseignement Technique' : 'Technical Education' },
              { id: 'commercial', label: isFr ? 'Enseignement Commercial' : 'Commercial Education' },
              { id: 'tvee-intermediate', label: isFr ? 'TVEE Intermédiaire' : 'TVEE Intermediate' },
              { id: 'tvee-advanced', label: isFr ? 'TVEE Avancé' : 'TVEE Advanced' },
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
                          <span>{isFr ? 'Matières & Spécialités Couvertes' : 'Covered Subjects & Specialties'} ({cat.subjects.length}):</span>
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
                              <Briefcase size={14} /> {isFr ? 'Spécialités Commerciales :' : 'Commercial Specialties:'}
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
                              <Wrench size={14} /> {isFr ? 'Spécialités Techniques :' : 'Technical Specialties:'}
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
                              {isFr ? 'Chaque Spécialité TVEE Comprend :' : 'Every TVEE Specialty Includes:'}
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
            <h4 className="font-black text-white text-base sm:text-lg">
              {isFr ? 'Vous ne trouvez pas votre spécialité ou matière ?' : 'Can\'t find your specific specialty or subject?'}
            </h4>
            <p className="text-xs text-indigo-200 font-medium">
              {isFr
                ? 'La banque de données des programmes MINESEC & GCE Board d\'Edulpha est mise à jour chaque semaine avec de nouvelles épreuves et modèles IA.'
                : 'Edulpha\'s MINESEC & Cameroon GCE board curriculum database is updated weekly with new past questions and AI models.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
            <Link to="/curriculum">
              <Button variant="outline" className="border-indigo-700 text-indigo-200 hover:bg-indigo-900/50 font-bold text-xs px-5 py-3 rounded-xl">
                {isFr ? 'En savoir plus sur le programme' : 'Learn More Syllabus'}
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg">
                {isFr ? 'Rechercher dans la base complète' : 'Search Full Syllabus Database'}
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
