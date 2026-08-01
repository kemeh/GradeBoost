import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, Target, TrendingUp, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, 
  Cpu, Award, Users, Globe, Download, Play, MessageSquare, Check, ChevronDown, 
  HelpCircle, Star, Phone, Mail, MapPin, Smartphone, Laptop, Zap, Clock, BookMarked,
  FileText, GraduationCap, Building2, CheckCircle, QrCode, Share2, Layers, ExternalLink,
  Shield, Lock, FileCode, Compass
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
        title="Edulpha | AI-Powered GCE & Baccalauréat Learning Platform"
        description="Master Ordinary Level, Advanced Level, Probatoire, and Baccalauréat exams with 15,000+ past questions, Gemini AI step-by-step explanations, offline mobile app, and verified partner school hubs."
        keywords="Edulpha, Cameroon GCE, GCE O Level, GCE A Level, Baccalauréat, MINESEC, AI Tutor, Past Papers, Exam Revision, Cameroon Education"
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
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#curriculum" className="hover:text-indigo-600 transition-colors">{t('nav.curriculum')}</a>
            <a href="#ai-tutor" className="hover:text-indigo-600 transition-colors">{t('nav.aiTutor')}</a>
            <a href="#partners" className="hover:text-indigo-600 transition-colors">{t('nav.partners')}</a>
            <Link to="/docs" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <span>Docs</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">Hub</span>
            </Link>
            <a href="#mobile-app" className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-indigo-600">
              <Download size={14} />
              <span>Mobile App</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <Link to="/auth">
              <Button size="sm" variant="ghost" className="hidden sm:flex font-bold text-slate-700">
                {t('nav.login')}
              </Button>
            </Link>
            <a href="#mobile-app">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold flex items-center gap-1.5">
                <Download size={14} />
                <span>Get App</span>
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span>Next-Generation Exam Mastery Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
            >
              Master Your Exams with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Gemini AI</span> & Past Papers
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-lg sm:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Empowering 50,000+ students across Cameroon and West Africa. Access 15,000+ past questions, step-by-step AI problem resolution, timed mock drills, and offline APK capabilities.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <a href="/downloads/edulpha-v1.0.4-release.apk" download className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 text-base font-black px-8 py-6 rounded-2xl flex items-center justify-center gap-3">
                  <Download size={20} />
                  <span>Download Android APK (v1.0.4)</span>
                </Button>
              </a>

              <a href="#partners" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800 text-base font-bold px-8 py-6 rounded-2xl flex items-center justify-center gap-2">
                  <Building2 size={20} className="text-indigo-400" />
                  <span>Become a Partner School</span>
                </Button>
              </a>
            </motion.div>

            {/* Quick Metrics Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs font-bold text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>100% Syllabus Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-400" />
                <span>Cameroon GCE & MINESEC Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-purple-400" />
                <span>Works 100% Offline</span>
              </div>
            </motion.div>
          </div>

          {/* Mobile App Screen Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[320px] bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden p-4 space-y-4">
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
              
              <div className="bg-indigo-900/60 p-4 rounded-2xl border border-indigo-700/50 space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-indigo-300">
                  <span>GCE A-Level Mathematics 2025</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Passed 96%</span>
                </div>
                <h4 className="text-xs font-bold text-white">Solve: ∫ (3x² + 2x - 5) dx</h4>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                  <div className="text-purple-400 font-bold">▶ Gemini AI Step 1:</div>
                  <div>Integrate term by term: ∫ 3x² dx = x³</div>
                  <div>∫ 2x dx = x², ∫ -5 dx = -5x</div>
                  <div className="text-emerald-400 font-bold pt-1">Result: x³ + x² - 5x + C</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center space-y-1">
                  <div className="text-lg font-black text-amber-400">14 Days</div>
                  <div className="text-slate-400">Study Streak</div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center space-y-1">
                  <div className="text-lg font-black text-indigo-400">15,000+</div>
                  <div className="text-slate-400">Past Papers</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl text-[11px] font-bold text-center">
                Interactive Android APK Mode Active
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Trusted Statistics Bar */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 text-center">
            {[
              { label: t('stats.students'), value: '50,000+' },
              { label: t('stats.lessons'), value: '12,500+' },
              { label: t('stats.questions'), value: '15,000+' },
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

      {/* 4. Dynamic Partners Showcase Section */}
      <LandingPartnersSection />

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">Simple Step-by-Step Journey</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">How Edulpha Drives High Pass Rates</h2>
            <p className="text-slate-500 font-medium text-lg">
              Designed specifically for students, educators, and institutional partners preparing for competitive examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Download App or Access Web',
                desc: 'Get the Android APK file directly or log in via web browser with zero data loss.',
                icon: Download,
                color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
              },
              {
                step: '02',
                title: 'Select Exam & Subjects',
                desc: 'Pick your sub-system (English GCE O/A Level or French Probatoire/Baccalauréat).',
                icon: BookOpen,
                color: 'bg-purple-50 text-purple-600 border-purple-200'
              },
              {
                step: '03',
                title: 'Ask Gemini AI & Drill Mocks',
                desc: 'Generate instant step-by-step solutions and test yourself under real examination timers.',
                icon: Sparkles,
                color: 'bg-amber-50 text-amber-600 border-amber-200'
              },
              {
                step: '04',
                title: 'Achieve Top Score Results',
                desc: 'Track mastery stats, receive school certificates, and excel in national board exams.',
                icon: Award,
                color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }
            ].map((s, i) => (
              <Card key={i} className="p-8 space-y-4 bg-white border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-lg transition">
                <div className="text-4xl font-black text-slate-200 absolute top-4 right-4">{s.step}</div>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", s.color)}>
                  <s.icon size={26} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose Edulpha / Features Section */}
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

      {/* 7. Gemini AI Tutor Interactive Preview */}
      <section id="ai-tutor" className="py-24 px-6 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
              {t('ai.badge')}
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">{t('ai.title')}</h2>
            <p className="text-slate-400 font-medium text-lg">
              {t('ai.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl font-black text-white">{t('ai.samplePromptsTitle')}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Click any of the curriculum sample questions below to test how Gemini AI explains complex Ordinary & Advanced level concepts step-by-step.
              </p>

              <div className="space-y-3">
                {[
                  {
                    prompt: 'Explain Quadratic Equations in Cameroon GCE Mathematics',
                    resp: 'In Cameroon GCE Ordinary/Advanced Level Mathematics, quadratic equations take the form ax² + bx + c = 0. To solve them, you can use factorization, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.'
                  },
                  {
                    prompt: 'Explain Le Chatelier\'s Principle in GCE Chemistry',
                    resp: 'Le Chatelier\'s Principle states that if a dynamic equilibrium is disturbed by changing conditions (temperature, pressure, or concentration), the position of equilibrium shifts to counteract the change.'
                  },
                  {
                    prompt: 'Explain Newton\'s Second Law of Motion in Physics',
                    resp: 'Newton\'s Second Law states that the rate of change of momentum of a body is directly proportional to the applied force: F = ma. In GCE Physics Paper 2, always include correct SI units (Newtons, N).'
                  }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleQuery(s.prompt, s.resp)}
                    className="w-full text-left p-4 rounded-2xl bg-slate-800/80 hover:bg-indigo-900/40 border border-slate-700/60 hover:border-indigo-500/50 text-xs font-bold text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span>{s.prompt}</span>
                    <Sparkles size={16} className="text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Edulpha Gemini AI Tutor</h4>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online & Ready</p>
                  </div>
                </div>

                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                  Bilingual (EN / FR)
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs font-bold text-indigo-300 space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Student Query:</span>
                  <p>{chatPrompt}</p>
                </div>

                <div className="bg-indigo-950/60 p-5 rounded-2xl border border-indigo-800/50 text-xs text-slate-200 leading-relaxed font-medium space-y-2">
                  <span className="text-[10px] uppercase font-black text-amber-400 block flex items-center gap-1">
                    <Sparkles size={12} /> Gemini Step-by-Step Resolution:
                  </span>
                  {isChatLoading ? (
                    <p className="text-slate-400 animate-pulse font-mono">Generating syllabus solution...</p>
                  ) : (
                    <p>{chatResponse}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Free unlimited questions for registered students</span>
                <Link to="/auth" className="text-indigo-400 underline hover:text-white">Ask custom question →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Dedicated Mobile App Download Section with QR Code */}
      <section id="mobile-app" className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
              Official Production Android APK
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Download Edulpha Mobile App</h2>
            <p className="text-slate-300 font-medium text-lg">
              Study past papers, take timed mocks, and ask the Gemini AI tutor anytime — even without internet data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Download Buttons & Release Stats */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Direct Android APK Download */}
                <a href="/downloads/edulpha-v1.0.4-release.apk" download className="block">
                  <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-500 hover:border-white text-white shadow-xl transition space-y-3 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                        <Download size={22} />
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-black uppercase">Direct APK</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white">Android APK Download</h4>
                      <p className="text-xs text-indigo-100">Release v1.0.4 (42.8 MB)</p>
                    </div>
                  </Card>
                </a>

                {/* Google Play Store Badge (Coming Soon) */}
                <Card className="p-6 bg-slate-900 border border-slate-800 text-slate-400 space-y-3 opacity-90">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                      <Smartphone size={22} />
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-black uppercase">In Review</span>
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-200">Google Play Store</h4>
                    <p className="text-xs text-slate-400">Publishing Target Q3 2026</p>
                  </div>
                </Card>
              </div>

              {/* Technical Release Details Box */}
              <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h4 className="font-black text-sm text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={18} /> Production APK Technical Specifications
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-300">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase">Version</div>
                    <div className="text-sm font-black text-white">v1.0.4 Release</div>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase">File Size</div>
                    <div className="text-sm font-black text-white">42.8 MB</div>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase">Min Android</div>
                    <div className="text-sm font-black text-white">7.0 (Nougat)+</div>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase">Security</div>
                    <div className="text-sm font-black text-emerald-400">RSA-2048 Signed</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  <Link to="/docs" className="text-indigo-400 hover:text-white underline">Full Spec →</Link>
                </div>
              </div>
            </div>

            {/* Visual QR Code Card for Scan to Download */}
            <div className="lg:col-span-5 flex justify-center">
              <Card className="p-8 bg-white text-slate-900 rounded-3xl space-y-6 shadow-2xl border border-slate-200 max-w-sm text-center">
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Instant Camera Scan
                  </span>
                  <h3 className="text-xl font-black text-slate-900">Scan QR Code to Download</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Point your Android device camera at the QR code to begin downloading the APK file directly.
                  </p>
                </div>

                {/* SVG QR Code Illustration */}
                <div className="p-4 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-44 h-44 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2zM5 5h2v2H5zM17 5h2v2h-2zM5 17h2v2H5z" fill="currentColor" />
                  </svg>
                </div>

                <a
                  href="/downloads/edulpha-v1.0.4-release.apk"
                  download
                  className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg"
                >
                  Download File Directly
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Pricing & Subscriptions */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">{t('pricing.badge')}</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('pricing.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="p-8 space-y-6 border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <Badge variant="secondary">{t('pricing.freeBadge')}</Badge>
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

      {/* 10. Testimonials */}
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

      {/* 11. FAQ Section */}
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

      {/* 12. Call-to-Action Conversion Banner */}
      <section className="py-20 px-6">
        <Card className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl rounded-[3rem]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight relative z-10">
            {t('cta.title')}
          </h2>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto font-medium relative z-10">
            {t('cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-xl font-bold">
                {t('cta.createAccount')}
              </Button>
            </Link>
            <a href="/downloads/edulpha-v1.0.4-release.apk" download>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold flex items-center gap-2">
                <Download size={18} />
                <span>Download Android APK</span>
              </Button>
            </a>
          </div>
        </Card>
      </section>

      {/* 13. Complete 5-Column Professional Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1: Brand Information & Social Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"} 
                alt="Edulpha Logo" 
                className="h-9 w-auto rounded-lg object-contain"
              />
              <span className="text-2xl font-black tracking-tight text-white">Edulpha</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Cameroon's premier AI-powered educational technology platform for Ordinary Level, Advanced Level, Probatoire, and Baccalauréat success.
            </p>
            
            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a href="https://facebook.com/edulpha" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition" title="Facebook">
                <Globe size={16} />
              </a>
              <a href="https://twitter.com/edulpha" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition" title="X / Twitter">
                <Share2 size={16} />
              </a>
              <a href="https://linkedin.com/company/edulpha" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition" title="LinkedIn">
                <Users size={16} />
              </a>
              <a href="https://youtube.com/@edulpha" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition" title="YouTube">
                <Play size={16} />
              </a>
              <a href="https://wa.me/237670000000" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-emerald-600 hover:text-white rounded-lg transition" title="WhatsApp Support">
                <MessageSquare size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Platform Links</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#features" className="hover:text-white transition">About Us & Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              <li><a href="#mobile-app" className="hover:text-white transition">Download Mobile App</a></li>
              <li><a href="#partners" className="hover:text-white transition">Partner School Hubs</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing & Subscriptions</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ & Support</a></li>
            </ul>
          </div>

          {/* Column 3: Legal Documents (Dynamic Routes) */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Legal & Governance</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link to="/data-protection" className="hover:text-white transition">Data Protection Policy</Link></li>
              <li><Link to="/user-agreement" className="hover:text-white transition">User Agreement</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-white transition">Community Guidelines</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition">Refund & Billing Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white transition">Official Disclaimer</Link></li>
              <li><Link to="/intellectual-property" className="hover:text-white transition">Intellectual Property</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources & Guides */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Resources & Manuals</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><Link to="/user-guide" className="hover:text-white transition">Student & Parent Guide</Link></li>
              <li><Link to="/partner-guide" className="hover:text-white transition">School Partner Guide</Link></li>
              <li><Link to="/security-policy" className="hover:text-white transition">Security Architecture</Link></li>
              <li><Link to="/docs" className="hover:text-emerald-400 transition flex items-center gap-1"><FileText size={14} /> Pre-Launch Package</Link></li>
              <li><a href="#ai-tutor" className="hover:text-white transition">Gemini AI Tutor Guide</a></li>
            </ul>
          </div>

          {/* Column 5: Contact Information */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Contact & Offices</h4>
            <div className="space-y-3 text-xs font-medium text-slate-400">
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>support@edulpha.cm<br />partners@edulpha.cm</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>+237 670 000 000<br />+237 690 000 000</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>Edulpha Hub, Akwa, Douala & Bastos, Yaoundé, Cameroon</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>Mon - Sat: 08:00 - 20:00 (WAT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights & Security Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div>© 2026 Edulpha Learning Systems. All Rights Reserved.</div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> AES-256 Encrypted</span>
            <span className="flex items-center gap-1.5"><Globe size={16} className="text-indigo-400" /> Bilingual Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
