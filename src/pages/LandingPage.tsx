import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, Target, TrendingUp, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, 
  Cpu, Award, Users, Globe, Download, Play, MessageSquare, Check, ChevronDown, 
  HelpCircle, Star, Phone, Mail, MapPin, Smartphone, Laptop, Zap, Clock, BookMarked,
  FileText, GraduationCap, Building2, CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button, Card, Badge, cn } from '../components/ui';
import { LandingPartnersSection } from '../components/LandingPartnersSection';
import { SEO } from '../components/SEO';

export default function LandingPage() {
  const { user, loading, isAdmin } = useAuth();
  const { appName, logoUrl, contactEmail, whatsappNumber, whatsappGroupLink } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatPrompt, setChatPrompt] = useState('Explain Quadratic Equations in Cameroon GCE Mathematics');
  const [chatResponse, setChatResponse] = useState(
    'In Cameroon GCE Ordinary/Advanced Level Mathematics, quadratic equations take the form ax² + bx + c = 0. To solve them, you can use factorization, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a. Would you like a sample past question solved step-by-step?'
  );
  const [isChatLoading, setIsChatLoading] = useState(false);

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

  const handleSampleQuery = (prompt: string, response: string) => {
    setIsChatLoading(true);
    setChatPrompt(prompt);
    setTimeout(() => {
      setChatResponse(response);
      setIsChatLoading(false);
    }, 400);
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
        title="AI-Powered GCE & Baccalauréat Exam Prep Platform"
        description="Master your Ordinary Level, Advanced Level, Probatoire, and Baccalauréat exams with 15,000+ past questions, step-by-step Gemini AI explanations, and verified partner learning hubs."
        keywords="Edulpha, Cameroon GCE, GCE O Level, GCE A Level, Baccalauréat, MINESEC, AI Tutor, Past Papers, Exam Revision"
      />
      
      {/* 1. Modern Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"} 
              alt="Edulpha Logo" 
              className="h-10 w-auto rounded-xl object-contain shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Edulpha
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">{t('nav.features')}</a>
            <a href="#curriculum" className="hover:text-indigo-600 transition-colors">{t('nav.curriculum')}</a>
            <a href="#subjects" className="hover:text-indigo-600 transition-colors">{t('nav.subjects')}</a>
            <a href="#ai-tutor" className="hover:text-indigo-600 transition-colors">{t('nav.aiTutor')}</a>
            <a href="#partners" className="hover:text-indigo-600 transition-colors">{t('nav.partners')}</a>
            <Link to="/docs" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <span>Docs</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">Package</span>
            </Link>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">{t('nav.pricing')}</a>
            <a href="#mobile-app" className="hover:text-indigo-600 transition-colors">{t('nav.mobileApp')}</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">{t('nav.faq')}</a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="compact" />
            <Link to="/auth" className="hidden sm:inline text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors">
              {language === 'fr' ? 'Connexion' : 'Login'}
            </Link>
            <Link to="/auth">
              <Button size="sm" className="shadow-lg shadow-indigo-100">
                {language === 'fr' ? 'Commencer' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="primary" className="mb-6 px-4 py-1.5 text-xs font-black shadow-sm">
              <Sparkles size={14} className="mr-1.5 inline text-indigo-600" /> {t('hero.badge')}
            </Badge>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] max-w-5xl mx-auto">
              {t('hero.title1')} <br />
              {t('hero.title2')} <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edulpha AI</span>.
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group shadow-xl shadow-indigo-200">
                {t('hero.startLearning')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#subjects" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('hero.exploreCourses')}
              </Button>
            </a>
            <a href="#mobile-app" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-indigo-600 hover:bg-indigo-50">
                <Download size={18} className="mr-2" /> {t('hero.downloadApp')}
              </Button>
            </a>
          </motion.div>

          {/* Interactive Preview Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-16 max-w-6xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur-2xl opacity-15" />
              <Card className="relative border border-slate-200 shadow-2xl overflow-hidden bg-slate-900 text-white rounded-[2.5rem]">
                <div className="bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-400 ml-4 font-mono">app.edulpha.cm/dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-300 font-medium">Edulpha AI Active • Bilingual GCE Engine</span>
                  </div>
                </div>

                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <GraduationCap size={22} />
                    </div>
                    <h3 className="font-bold text-white text-base">{t('hero.previewMath')}</h3>
                    <p className="text-xs text-slate-400">{t('hero.previewMathSub')}</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span>{t('hero.masteryScore')}</span>
                      <span className="text-slate-400">{t('hero.gradeProjected')}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="font-bold text-white text-base">{t('hero.previewAiTitle')}</h3>
                    <p className="text-xs text-slate-400">{t('hero.previewAiSub')}</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-300">
                      <span>{t('hero.statusInProgress')}</span>
                      <span>{t('hero.daily15min')}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Award size={22} />
                    </div>
                    <h3 className="font-bold text-white text-base">{t('hero.previewMockTitle')}</h3>
                    <p className="text-xs text-slate-400">{t('hero.previewMockSub')}</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span>{t('hero.nextExam')}</span>
                      <span>{t('hero.freeRegistration')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Trusted Statistics Section */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 text-center">
            {[
              { label: t('stats.students'), value: '50,000+' },
              { label: t('stats.lessons'), value: '12,500+' },
              { label: t('stats.questions'), value: '45,000+' },
              { label: t('stats.mocks'), value: '3,500+' },
              { label: t('stats.aiChats'), value: '2.4M+' },
              { label: t('stats.teachers'), value: '450+' },
              { label: t('stats.schools'), value: '120+' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl lg:text-4xl font-black text-indigo-400 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Edulpha */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">{t('features.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('features.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: t('features.f1Title'), desc: t('features.f1Desc'), color: 'bg-indigo-50 text-indigo-600' },
              { icon: BookOpen, title: t('features.f2Title'), desc: t('features.f2Desc'), color: 'bg-purple-50 text-purple-600' },
              { icon: Target, title: t('features.f3Title'), desc: t('features.f3Desc'), color: 'bg-emerald-50 text-emerald-600' },
              { icon: TrendingUp, title: t('features.f4Title'), desc: t('features.f4Desc'), color: 'bg-blue-50 text-blue-600' },
              { icon: GraduationCap, title: t('features.f5Title'), desc: t('features.f5Desc'), color: 'bg-amber-50 text-amber-600' },
              { icon: Smartphone, title: t('features.f6Title'), desc: t('features.f6Desc'), color: 'bg-rose-50 text-rose-600' },
              { icon: Clock, title: t('features.f7Title'), desc: t('features.f7Desc'), color: 'bg-teal-50 text-teal-600' },
              { icon: Globe, title: t('features.f8Title'), desc: t('features.f8Desc'), color: 'bg-indigo-50 text-indigo-700' },
              { icon: Users, title: t('features.f9Title'), desc: t('features.f9Desc'), color: 'bg-purple-50 text-purple-700' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 space-y-4 hover:shadow-xl transition-all border border-slate-100 hover:border-indigo-100">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Curriculum Section */}
      <section id="curriculum" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="secondary">{t('cur.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('cur.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('cur.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* English Curriculum Card */}
            <Card className="p-8 sm:p-10 space-y-8 border-2 border-indigo-100 bg-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center font-black text-lg">🇬🇧</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{t('cur.engTitle')}</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{t('cur.engSub')}</p>
                  </div>
                </div>
                <Badge variant="primary">{t('cur.engBadge')}</Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" /> {t('cur.oLevelTitle')}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    {t('cur.oLevelDesc')}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" /> {t('cur.aLevelTitle')}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    {t('cur.aLevelDesc')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">10,000+ Past Papers & Solutions</span>
                <Link to="/auth">
                  <Button size="sm">{t('cur.exploreOa')}</Button>
                </Link>
              </div>
            </Card>

            {/* French Curriculum Card */}
            <Card className="p-8 sm:p-10 space-y-8 border-2 border-purple-100 bg-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center font-black text-lg">🇫🇷</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{t('cur.frTitle')}</h3>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">{t('cur.frSub')}</p>
                  </div>
                </div>
                <Badge variant="secondary">{t('cur.frBadge')}</Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" /> {t('cur.collegeTitle')}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    {t('cur.collegeDesc')}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" /> {t('cur.lyceeTitle')}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    {t('cur.lyceeDesc')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Sujets du Bac & Probatoire</span>
                <Link to="/auth">
                  <Button size="sm" variant="secondary">{t('cur.exploreLycee')}</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Subject Showcase */}
      <section id="subjects" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">{t('subjects.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('subjects.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('subjects.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Mathematics', code: 'MATH', count: `1,450 ${t('sub.lessonsCount')}`, icon: '📐', desc: t('sub.math') },
              { name: 'Computer Science', code: 'COMP', count: `920 ${t('sub.lessonsCount')}`, icon: '💻', desc: t('sub.comp') },
              { name: 'ICT', code: 'ICT', count: `850 ${t('sub.lessonsCount')}`, icon: '🖥️', desc: t('sub.ict') },
              { name: 'Physics', code: 'PHYS', count: `1,100 ${t('sub.lessonsCount')}`, icon: '⚛️', desc: t('sub.phys') },
              { name: 'Chemistry', code: 'CHEM', count: `980 ${t('sub.lessonsCount')}`, icon: '🧪', desc: t('sub.chem') },
              { name: 'Biology', code: 'BIO', count: `1,050 ${t('sub.lessonsCount')}`, icon: '🧬', desc: t('sub.bio') },
              { name: 'English Language', code: 'ENG', count: `750 ${t('sub.lessonsCount')}`, icon: '📖', desc: t('sub.eng') },
              { name: 'French / Langue', code: 'FR', count: `800 ${t('sub.lessonsCount')}`, icon: '🇫🇷', desc: t('sub.fr') },
              { name: 'Geography', code: 'GEO', count: `640 ${t('sub.lessonsCount')}`, icon: '🌍', desc: t('sub.geo') },
              { name: 'History', code: 'HIST', count: `690 ${t('sub.lessonsCount')}`, icon: '🏛️', desc: t('sub.hist') },
              { name: 'Economics', code: 'ECON', count: `820 ${t('sub.lessonsCount')}`, icon: '📈', desc: t('sub.econ') },
              { name: 'Accounting & Commerce', code: 'ACC', count: `710 ${t('sub.lessonsCount')}`, icon: '💼', desc: t('sub.acc') }
            ].map((subject, i) => (
              <Card key={i} className="p-6 space-y-4 hover:shadow-xl transition-all border border-slate-100 hover:border-indigo-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">{subject.icon}</span>
                  <Badge variant="neutral">{subject.code}</Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{subject.name}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{subject.desc}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-400 border-t border-slate-100">
                  <span>{subject.count}</span>
                  <Link to="/auth" className="text-indigo-600 hover:underline flex items-center gap-1">
                    {t('sub.start')} <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. AI Tutor Section */}
      <section id="ai-tutor" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
              <Sparkles size={14} className="mr-1.5 inline" /> {t('ai.badge')}
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{t('ai.titleSec')}</h2>
            <p className="text-slate-400 font-medium text-lg">
              {t('ai.subtitleSec')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden">
            <div className="bg-slate-850 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t('ai.assistantTitle')}</h4>
                  <p className="text-[11px] text-indigo-400">{t('ai.assistantSub')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-mono font-bold">{t('ai.langBadge')}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSampleQuery('Explain Quadratic Equations in Cameroon GCE Mathematics', 'In Cameroon GCE Ordinary/Advanced Level Mathematics, quadratic equations take the form ax² + bx + c = 0. To solve them, use factorization, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.')}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-600"
                >
                  {t('ai.btnQuad')}
                </button>
                <button 
                  onClick={() => handleSampleQuery('How to write a Python script for binary search in Computer Science', 'In A-Level Computer Science, binary search requires a sorted list. We initialize left=0 and right=len(arr)-1. While left <= right, find mid=(left+right)//2. If arr[mid]==target return mid, else adjust left or right.')}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-600"
                >
                  {t('ai.btnPython')}
                </button>
                <button 
                  onClick={() => handleSampleQuery('Résoudre un système d\'équations différentielles en Terminale C', 'Pour résoudre y\'\' + ay\' + by = 0 en Terminale C, on écrit l\'équation caractéristique r² + ar + b = 0. Selon le discriminant Δ, la solution générale combine exponentielles et fonctions trigonométriques.')}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-600"
                >
                  {t('ai.btnDiff')}
                </button>
              </div>

              <div className="space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">{t('ai.youLabel')}</div>
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none text-slate-200 text-sm max-w-2xl font-medium">
                    {chatPrompt}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-md">{t('ai.aiLabel')}</div>
                  <div className="bg-indigo-950/60 border border-indigo-500/30 p-4 rounded-2xl rounded-tl-none text-indigo-100 text-sm max-w-2xl font-medium leading-relaxed">
                    {isChatLoading ? (
                      <div className="flex items-center gap-2 text-indigo-300">
                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <span>{t('ai.analyzing')}</span>
                      </div>
                    ) : (
                      chatResponse
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link to="/auth">
                  <Button size="md" className="shadow-lg shadow-indigo-500/20">
                    {t('ai.tryFullBtn')} <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Learning Experience Roadmap */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">{t('roadmap.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('roadmap.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('roadmap.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { step: '01', title: t('roadmap.step1Title'), desc: t('roadmap.step1Desc') },
              { step: '02', title: t('roadmap.step2Title'), desc: t('roadmap.step2Desc') },
              { step: '03', title: t('roadmap.step3Title'), desc: t('roadmap.step3Desc') },
              { step: '04', title: t('roadmap.step4Title'), desc: t('roadmap.step4Desc') },
              { step: '05', title: t('roadmap.step5Title'), desc: t('roadmap.step5Desc') },
              { step: '06', title: t('roadmap.step6Title'), desc: t('roadmap.step6Desc') },
              { step: '07', title: t('roadmap.step7Title'), desc: t('roadmap.step7Desc') }
            ].map((item, i) => (
              <Card key={i} className="p-6 space-y-3 border border-slate-100 hover:border-indigo-200 transition-all text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Mobile App Section */}
      <section id="mobile-app" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="secondary">{t('mobile.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {t('mobile.title')}
            </h2>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              {t('mobile.desc')}
            </p>

            <div className="space-y-4">
              {[
                t('mobile.feat1'),
                t('mobile.feat2'),
                t('mobile.feat3'),
                t('mobile.feat4')
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="/downloads/edulpha-v1.0.4-release.apk" 
                download="edulpha-v1.0.4-release.apk"
                className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-700 group"
              >
                <Smartphone size={22} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <span>{t('mobile.androidLabel')}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[9px]">Direct APK</span>
                  </div>
                  <div className="text-sm font-black">Download Release APK v1.0.4</div>
                </div>
              </a>
              <a 
                href="/docs" 
                className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl shadow-lg transition-all"
              >
                <Laptop size={22} />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-indigo-200">Mobile Specs & Verification</div>
                  <div className="text-sm font-black">View Release Package Docs</div>
                </div>
              </a>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-2xl opacity-20" />
            <Card className="relative p-8 bg-slate-900 text-white max-w-sm rounded-[3rem] border border-slate-800 shadow-2xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-indigo-500/30">
                📱
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">{t('mobile.cardTitle')}</h3>
                <p className="text-xs text-slate-400">{t('mobile.cardDesc')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                <div className="w-36 h-36 bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold rounded-xl">
                  [ QR CODE ]
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-400">{t('mobile.version')}</div>
            </Card>
          </div>
        </div>
      </section>

      {/* 9.5 Partners Section */}
      <LandingPartnersSection />

      {/* 10. Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">{t('pricing.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('pricing.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 space-y-6 border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <Badge variant="neutral">{t('pricing.freeBadge')}</Badge>
                <h3 className="text-2xl font-black text-slate-900">{t('pricing.freeTitle')}</h3>
                <p className="text-xs text-slate-500">{t('pricing.freeDesc')}</p>
                <div className="text-4xl font-black text-slate-900">{t('pricing.freePrice')} <span className="text-xs font-medium text-slate-400">{t('pricing.freeDuration')}</span></div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.freeFeat1')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.freeFeat2')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.freeFeat3')}</div>
                </div>
              </div>

              <Link to="/auth" className="w-full">
                <Button variant="outline" className="w-full">{t('pricing.freeBtn')}</Button>
              </Link>
            </Card>

            {/* Premium Plan (Recommended) */}
            <Card className="p-8 space-y-6 border-2 border-indigo-600 bg-indigo-950 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                {t('pricing.mostPopular')}
              </div>

              <div className="space-y-4">
                <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">{t('pricing.premBadge')}</Badge>
                <h3 className="text-2xl font-black text-white">{t('pricing.premTitle')}</h3>
                <p className="text-xs text-indigo-200">{t('pricing.premDesc')}</p>
                <div className="text-4xl font-black text-white">{t('pricing.premPrice')} <span className="text-xs font-medium text-indigo-300">{t('pricing.premDuration')}</span></div>
                
                <div className="space-y-3 pt-4 border-t border-indigo-800/60 text-xs font-bold text-indigo-100">
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> {t('pricing.premFeat1')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> {t('pricing.premFeat2')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> {t('pricing.premFeat3')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> {t('pricing.premFeat4')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> {t('pricing.premFeat5')}</div>
                </div>
              </div>

              <Link to="/auth" className="w-full">
                <Button variant="secondary" className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-xl">{t('pricing.premBtn')}</Button>
              </Link>
            </Card>

            {/* Institution Plan */}
            <Card className="p-8 space-y-6 border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <Badge variant="secondary">{t('pricing.instBadge')}</Badge>
                <h3 className="text-2xl font-black text-slate-900">{t('pricing.instTitle')}</h3>
                <p className="text-xs text-slate-500">{t('pricing.instDesc')}</p>
                <div className="text-4xl font-black text-slate-900">{t('pricing.instPrice')} <span className="text-xs font-medium text-slate-400">{t('pricing.instDuration')}</span></div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.instFeat1')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.instFeat2')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.instFeat3')}</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> {t('pricing.instFeat4')}</div>
                </div>
              </div>

              <Link to="/auth" className="w-full">
                <Button variant="outline" className="w-full">{t('pricing.instBtn')}</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 11. Testimonials */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">{t('test.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('test.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('test.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: t('test.quote1'), author: t('test.author1'), role: t('test.role1'), rating: 5 },
              { quote: t('test.quote2'), author: t('test.author2'), role: t('test.role2'), rating: 5 },
              { quote: t('test.quote3'), author: t('test.author3'), role: t('test.role3'), rating: 5 }
            ].map((tItem, i) => (
              <Card key={i} className="p-8 space-y-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(tItem.rating)].map((_, idx) => (
                      <Star key={idx} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed italic">"{tItem.quote}"</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                    {tItem.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{tItem.author}</h4>
                    <p className="text-xs text-slate-400 font-medium">{tItem.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="secondary">{t('faq.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('faq.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('faq.subtitle')}
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

      {/* 13. Call-to-Action Banner */}
      <section className="py-20 px-6">
        <Card className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl rounded-[3rem]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight relative z-10">
            {t('cta.title')}
          </h2>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto font-medium relative z-10">
            {t('cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-xl">
                {t('cta.createAccount')}
              </Button>
            </Link>
            <a href="#mobile-app">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t('hero.downloadApp')}
              </Button>
            </a>
          </div>
        </Card>
      </section>

      {/* 14. Professional Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"} 
                alt="Edulpha Logo" 
                className="h-8 w-auto rounded-lg object-contain"
              />
              <span className="text-xl font-black tracking-tight text-white">Edulpha</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="text-xs font-black text-indigo-400">{t('footer.excellence')}</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-widest">{t('footer.resources')}</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><Link to="/docs" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><FileText size={14} /> Pre-Launch Docs Hub</Link></li>
              <li><a href="#subjects" className="hover:text-white transition-colors">{t('footer.catalog')}</a></li>
              <li><a href="#curriculum" className="hover:text-white transition-colors">{t('cur.engBadge')}</a></li>
              <li><a href="#curriculum" className="hover:text-white transition-colors">{t('cur.frBadge')}</a></li>
              <li><a href="#ai-tutor" className="hover:text-white transition-colors">{t('nav.aiTutor')}</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-widest">{t('footer.support')}</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              {contactEmail && <li><a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a></li>}
              {whatsappNumber && <li><a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footer.whatsapp')}</a></li>}
              {whatsappGroupLink && <li><a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footer.community')}</a></li>}
              <li><a href="#faq" className="hover:text-white transition-colors">{t('footer.help')}</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-widest">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><Link to="/auth" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">{t('footer.data')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div>{t('footer.rights')}</div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> {t('footer.secure')}</span>
            <span className="flex items-center gap-1.5"><Globe size={16} className="text-indigo-400" /> {t('footer.bilingual')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
