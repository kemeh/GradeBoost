import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Target, TrendingUp, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, 
  Cpu, Award, Users, Globe, Download, Play, MessageSquare, Check, ChevronDown, 
  HelpCircle, Star, Phone, Mail, MapPin, Smartphone, Laptop, Zap, Clock, BookMarked,
  FileText, GraduationCap, Building2, CheckCircle, QrCode, Share2, Layers, ExternalLink,
  Shield, Lock, FileCode, Compass, Search, Wrench, Briefcase, Flame, Calculator,
  Atom, FlaskConical, Dna, LineChart, Heart, RefreshCw, Send, CheckCircle as CheckIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button, Card, Badge, cn } from '../components/ui';
import { LandingPartnersSection } from '../components/LandingPartnersSection';
import { ExploreLearningPaths } from '../components/ExploreLearningPaths';
import { WhyStudentsLoveEdulpha } from '../components/WhyStudentsLoveEdulpha';
import { SubjectsSection } from '../components/SubjectsSection';
import { EdulphaAISection } from '../components/EdulphaAISection';
import { AfricaFocusSection } from '../components/AfricaFocusSection';
import { DownloadAppSection } from '../components/DownloadAppSection';
import LandingPricingSection from '../components/landing/LandingPricingSection';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { StatsService, PlatformStats } from '../services/statsService';
import { TestimonialService } from '../services/testimonialService';
import { Testimonial } from '../types/testimonial';
import Navbar from '../components/navigation/Navbar';

export default function LandingPage() {
  const { user, loading, isAdmin } = useAuth();
  const { logoUrl } = useSettings();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroSearch, setHeroSearch] = useState('');
  const [filteredHeroSuggestions, setFilteredHeroSuggestions] = useState<string[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function loadDynamicContent() {
      try {
        const [st, ts] = await Promise.all([
          StatsService.getRealPlatformStats(),
          TestimonialService.getTestimonials(true)
        ]);
        setStats(st);
        setTestimonials(ts);
      } catch (err) {
        console.warn('Error loading dynamic landing content:', err);
      }
    }
    loadDynamicContent();
  }, []);

  const SEARCH_SUGGESTIONS = [
    'Mathematics (GCE O/A Level)',
    'Physics & Quantum Mechanics',
    'Electrical Technology & AC Circuits',
    'Financial Accounting & Ledgers',
    'Computer Science & Python',
    'French Literature & Dissertation',
    'Building Construction & Masonry',
    'Biology & Human Anatomy',
    'Economics & Trade Policy'
  ];

  useEffect(() => {
    if (!loading && (user || isAdmin)) {
      if (isAdmin) {
        navigate('/admin');
      } else if (user?.paymentStatus === 'paid') {
        navigate('/dashboard');
      } else if (user) {
        navigate('/payment');
      }
    }
  }, [user, loading, isAdmin, navigate]);

  const handleHeroSearchChange = (val: string) => {
    setHeroSearch(val);
    if (val.trim()) {
      setFilteredHeroSuggestions(
        SEARCH_SUGGESTIONS.filter(item => item.toLowerCase().includes(val.toLowerCase()))
      );
    } else {
      setFilteredHeroSuggestions([]);
    }
  };

  const handleExecuteSearch = (query: string) => {
    const el = document.getElementById('subjects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <SEO 
        title="Edulpha | Africa's Premier AI Learning & Exam Preparation Platform"
        description="Master Ordinary Level, Advanced Level, Probatoire, Baccalauréat, and TVEE Technical specialties with official past questions, Edulpha AI step-by-step solutions, and offline mobile app."
        keywords="Edulpha, Coursera Africa, Cameroon GCE, GCE O Level, GCE A Level, Baccalauréat, MINESEC, TVEE Technical, AI Tutor, Past Papers, Exam Revision, Cameroon Education"
      />
      
      {/* 1. Coursera & Duolingo-Inspired Redesigned Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section (Coursera-Inspired Full-Width & Search Driven) */}
      <section className="pt-8 sm:pt-16 pb-12 sm:pb-24 px-3 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white w-full max-w-full box-border">
        
        {/* Animated Background Lights */}
        <div className="absolute top-0 left-1/4 w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[220px] sm:w-[500px] h-[220px] sm:h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16 relative z-10 w-full max-w-full box-border">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full max-w-full">
            
            {/* Left Main Hero Copy */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-8 text-center lg:text-left w-full max-w-full box-border">
              
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider max-w-full"
              >
                <Sparkles size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">
                  {language === 'fr' ? 'Premier Écosystème d\'Apprentissage en Afrique' : 'Africa\'s Premier Learning Platform'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[clamp(1.75rem,7vw,4.5rem)] font-black tracking-tight leading-[1.08] break-words"
              >
                {language === 'fr' ? (
                  <>
                    Apprenez. Pratiquez. <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                      Réussissez.
                    </span>
                  </>
                ) : (
                  <>
                    Learn. Practice. <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                      Succeed.
                    </span>
                  </>
                )}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-[clamp(0.875rem,3.5vw,1.25rem)] font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed break-words"
              >
                {language === 'fr'
                  ? 'Maîtrisez l\'enseignement général, les spécialités techniques, commerciales et les niveaux TVEE avec les épreuves officielles MINESEC & GCE Board, les résolveurs IA Edulpha et l\'accès mobile hors-ligne.'
                  : 'Master General Education, Technical Specialties, Commercial Studies, and TVEE Intermediate & Advanced levels with official MINESEC & GCE Board past papers, step-by-step Edulpha AI solvers, and offline mobile access.'}
              </motion.p>

              {/* Coursera-Inspired Interactive Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 relative max-w-[650px] mx-auto lg:mx-0 w-full box-border"
              >
                <div className="relative bg-white p-1.5 sm:p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-2 border-slate-200 focus-within:border-emerald-500 transition-colors w-full box-border">
                  <div className="flex items-center flex-1 px-2 min-w-0">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => handleHeroSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(heroSearch)}
                      placeholder={language === 'fr' ? 'Qu’aimeriez-vous apprendre aujourd’hui ?' : 'What do you want to learn today?'}
                      className="w-full px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none bg-transparent min-w-0"
                    />
                  </div>
                  <button
                    onClick={() => handleExecuteSearch(heroSearch)}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shrink-0 transition shadow-md flex items-center justify-center gap-1.5 min-w-0"
                  >
                    <span>{language === 'fr' ? 'Rechercher' : 'Search'}</span>
                    <ArrowRight size={14} className="shrink-0" />
                  </button>
                </div>

                {/* Dropdown Suggestions */}
                <AnimatePresence>
                  {filteredHeroSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-30 space-y-1 max-w-full"
                    >
                      {filteredHeroSuggestions.map((sug, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setHeroSearch(sug);
                            setFilteredHeroSuggestions([]);
                            handleExecuteSearch(sug);
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-200 cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate">{sug}</span>
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                            {language === 'fr' ? 'Explorer →' : 'Explore →'}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-slate-400 max-w-full">
                  <span className="text-slate-500 shrink-0">{language === 'fr' ? 'Populaires :' : 'Popular:'}</span>
                  {(language === 'fr' 
                    ? ['Mathématiques', 'Physique', 'Électrotechnique', 'Comptabilité', 'Informatique', 'Français']
                    : ['Mathematics', 'Physics', 'Electrical Tech', 'Accounting', 'Computer Science', 'French']
                  ).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleExecuteSearch(tag)}
                      className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition text-[10px] sm:text-[11px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2 w-full max-w-full"
              >
                <Link to="/auth" className="w-full sm:w-auto min-w-0 max-w-full">
                  <Button size="lg" className="w-full sm:w-auto max-w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 text-xs sm:text-sm font-black px-5 sm:px-8 py-3.5 sm:py-5 rounded-2xl flex items-center justify-center gap-2">
                    <span className="truncate">{language === 'fr' ? 'Commencer Gratuitement' : 'Start Learning Free'}</span>
                    <ArrowRight size={18} className="shrink-0" />
                  </Button>
                </Link>

                <a href="#mobile-app" className="w-full sm:w-auto min-w-0 max-w-full">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto max-w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs sm:text-sm font-bold px-5 sm:px-8 py-3.5 sm:py-5 rounded-2xl flex items-center justify-center gap-2">
                    <Download size={18} className="shrink-0" />
                    <span className="truncate">{language === 'fr' ? 'Télécharger l\'App Mobile (APK)' : 'Download Mobile App (APK)'}</span>
                  </Button>
                </a>
              </motion.div>

              {/* Trust Badges */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-[11px] sm:text-xs font-bold text-slate-400 max-w-full">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400 shrink-0" /> {language === 'fr' ? 'Programme Officiel MINESEC' : 'Official MINESEC Syllabus'}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-indigo-400 shrink-0" /> {language === 'fr' ? 'Bilingue Anglais & Français' : 'Bilingual EN & FR'}</span>
                <span className="flex items-center gap-1.5"><Smartphone size={15} className="text-amber-400 shrink-0" /> {language === 'fr' ? '100% Fonctionnel Hors-Ligne' : '100% Offline Capability'}</span>
              </div>

            </div>

            {/* Right Student Visual Card / Hero Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 relative w-full max-w-full flex justify-center"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 relative overflow-hidden w-full max-w-[320px] xs:max-w-[380px] sm:max-w-[440px] lg:max-w-none mx-auto group hover:border-emerald-500/40 transition-all box-border">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                      alt="Student Avatar"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-emerald-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">Amina Nguema</h4>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase truncate">GBHS Douala • GCE A-Level</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] sm:text-[10px] font-black uppercase shrink-0">
                    Grade A Target
                  </span>
                </div>

                {/* Simulated Practice Session */}
                <div className="space-y-2.5 sm:space-y-3 bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-400 gap-2">
                    <span className="truncate">Physics Paper 2 • 2025 Mock</span>
                    <span className="text-amber-400 flex items-center gap-1 shrink-0"><Clock size={12} /> 12m</span>
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-white leading-relaxed">
                    Q3: Determine the electric field strength E at a distance of 0.5m from a point charge of 4μC in vacuum.
                  </p>

                  <div className="p-2.5 sm:p-3 bg-slate-900 rounded-xl text-[10px] sm:text-xs text-slate-300 font-mono space-y-1 border border-slate-800 overflow-x-auto">
                    <span className="text-indigo-400 font-bold">▶ Edulpha AI Resolution:</span>
                    <div>E = k · |q| / r²</div>
                    <div>E = (8.99 × 10⁹ N·m²/C²) × (4 × 10⁻⁶ C) / (0.5m)²</div>
                    <div className="text-emerald-400 font-bold pt-0.5">Result: E = 1.44 × 10⁵ N/C</div>
                  </div>
                </div>

                {/* Live Stats Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-base sm:text-lg font-black text-emerald-400">98%</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-base sm:text-lg font-black text-indigo-400">14 Days</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Streak</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-base sm:text-lg font-black text-amber-400">1,450+</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Questions</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>

          {/* Statistics Counter Bar (Real Database Metrics) */}
          <div className="pt-8 border-t border-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: stats ? stats.studentsCount.toLocaleString() : '0', label: language === 'fr' ? 'Élèves Inscris Actifs' : 'Active Registered Students' },
                { value: stats ? (stats.subjectsCount > 0 ? `${stats.subjectsCount}+` : '0') : '0', label: language === 'fr' ? 'Matières & Spécialités' : 'Subjects & Specialties' },
                { value: stats ? (stats.questionsCount > 0 ? `${stats.questionsCount.toLocaleString()}+` : '0') : '0', label: language === 'fr' ? 'Sujets & Épreuves Corrigées' : 'Past Questions & Drills' },
                { value: stats ? (stats.partnersCount > 0 ? `${stats.partnersCount}` : '0') : '0', label: language === 'fr' ? 'Établissements Partenaires' : 'Verified Partner Institutions' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Featured Learning Pathways (Coursera-Inspired Categories) */}
      <section id="curriculum">
        <ExploreLearningPaths />
      </section>

      {/* 4. Interactive Subjects Explorer Section */}
      <SubjectsSection />

      {/* 5. Edulpha AI Intelligent Companion Section */}
      <EdulphaAISection />

      {/* 6. Why Choose Edulpha Section */}
      <section id="why-edulpha">
        <WhyStudentsLoveEdulpha />
      </section>

      {/* 7. Cameroon & Africa Focus Mission Section */}
      <AfricaFocusSection />

      {/* 8. Partner Institutions Carousel & Showcase */}
      <LandingPartnersSection />

      {/* 9. Dynamic Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              {language === 'fr' ? 'Témoignages Vérifiés' : 'Verified Success Stories'}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {language === 'fr' 
                ? 'Adopté par les Élèves, Enseignants & Chefs d\'Établissement au Cameroun' 
                : 'Loved by Students, Teachers & School Leaders Across Cameroon'}
            </h2>
            <p className="text-slate-500 font-medium text-base sm:text-lg">
              {language === 'fr'
                ? 'Découvrez comment Edulpha améliore le taux de réussite aux examens du GCE, BEPC, Probatoire, Baccalauréat et TVEE.'
                : 'See how Edulpha is raising national exam pass rates in GCE Ordinary & Advanced Level, BEPC, Probatoire, and TVEE Technical certifications.'}
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 max-w-2xl mx-auto shadow-sm">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">
                {language === 'fr' ? 'Aucun Témoignage Publié' : 'No Testimonials Published Yet'}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {language === 'fr' 
                  ? 'Aucun témoignage publié pour le moment. Les avis d\'étudiants et les histoires de réussite réelles apparaîtront ici.'
                  : 'No testimonials published yet. Real student reviews and success stories from Cameroon and Africa will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((item) => (
                <Card key={item.id} className="p-8 space-y-6 bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, idx) => (
                        <Star key={idx} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed italic">
                      "{language === 'fr' ? (item.quoteFr || item.quoteEn) : item.quoteEn}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <img 
                      src={item.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                      alt={item.authorName} 
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{item.authorName}</h4>
                      <p className="text-xs text-slate-500 font-bold">{item.schoolOrOrg || (language === 'fr' ? item.roleFr : item.roleEn)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 9.5 Dynamic Pricing Section (DB Driven) */}
      <LandingPricingSection />

      {/* 10. Download Mobile App Section */}
      <DownloadAppSection />

      {/* 11. FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} />
              {language === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {language === 'fr' ? 'Tout Ce Que Vous Devez Savoir' : 'Everything You Need to Know'}
            </h2>
            <p className="text-slate-500 font-medium text-base sm:text-lg">
              {language === 'fr' 
                ? 'Des questions sur Edulpha, les épreuves ou l\'accès Android hors-ligne ? Nous avons les réponses.'
                : 'Got questions about Edulpha, GCE past papers, or offline Android access? We\'ve got answers.'}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left font-black text-slate-900 text-base flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className={cn("text-slate-400 transition-transform duration-300", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 text-sm font-medium leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final Call-to-Action Conversion Banner */}
      <section className="py-20 px-6 bg-slate-50">
        <Card className="max-w-7xl mx-auto bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white p-10 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl rounded-[3rem] border border-indigo-900/40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider relative z-10">
            <Sparkles size={14} />
            {language === 'fr' ? 'Commencez Votre Parcours Dès Aujourd\'hui' : 'Start Your Journey Today'}
          </div>

          <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-tight relative z-10">
            {language === 'fr' ? (
              <>
                Transformez Votre Carrière Académique <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Avec le Premier Pôle d'Apprentissage d'Afrique
                </span>
              </>
            ) : (
              <>
                Transform Your Academic Career <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  With Africa's Premier Learning Hub
                </span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-base md:text-xl max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
            {language === 'fr'
              ? 'Rejoignez plus de 50 000 élèves et enseignants qui maîtrisent le GCE, le BEPC, le Baccalauréat et les spécialités techniques.'
              : 'Join over 50,000 students and educators mastering GCE O/A Levels, BEPC, Baccalauréat, and TVEE Technical specialties.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-emerald-400/20 transition-all">
                {language === 'fr' ? 'Créer un Compte Gratuit' : 'Create Free Account'}
              </Button>
            </Link>
            
            <a href="#mobile-app">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800 text-sm font-bold px-8 py-6 rounded-2xl flex items-center justify-center gap-2">
                <Download size={18} />
                <span>{language === 'fr' ? 'Obtenir l\'App Mobile' : 'Get Mobile App'}</span>
              </Button>
            </a>
          </div>
        </Card>
      </section>

      {/* 13. Dynamic Professional Footer (Managed via Admin Dashboard) */}
      <DynamicFooter />
    </div>
  );
}
