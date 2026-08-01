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

export default function LandingPage() {
  const { user, loading, isAdmin } = useAuth();
  const { appName, logoUrl, contactEmail, whatsappNumber, whatsappGroupLink } = useSettings();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // FAQ active accordions state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  // Interactive AI chat preview state
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
    {
      q: 'How do I register for Edulpha?',
      a: 'Registration is simple. Click "Get Started" or "Create Free Account", enter your details, choose your curriculum (English Cameroon GCE or French Curriculum), and start accessing instant revision tools.'
    },
    {
      q: 'What payment methods are supported for Premium access?',
      a: 'We support secure mobile money payments (MTN Mobile Money, Orange Money) as well as bank cards for instant activation of your Edulpha Premium subscription.'
    },
    {
      q: 'How does Edulpha AI Tutor work?',
      a: 'Edulpha AI is trained specifically on Cameroon GCE and French BEPC/Baccalauréat syllabi. It provides 24/7 instant explanations, solves past exam questions, generates custom quizzes, and builds personalized 7-day study sprints.'
    },
    {
      q: 'Can I use Edulpha on my mobile phone?',
      a: 'Yes! Edulpha is fully optimized for mobile browsers, and our official Android & iOS app is available for download with offline mode support for studying anywhere.'
    },
    {
      q: 'Does Edulpha support both English and French systems?',
      a: 'Absolutely. Edulpha is a bilingual learning ecosystem fully supporting the English-subsystem (O/A Levels) and French-subsystem (BEPC, Seconde, Première, Terminale) with seamless language switching.'
    },
    {
      q: 'Are certificates awarded upon completing mock exams?',
      a: 'Yes, students who complete our national mock exams and achieve passing grades receive verified Edulpha Academic Board certificates with unique verification IDs.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* 1. Modern Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"} 
              alt="Edulpha Logo" 
              className="h-10 w-auto rounded-xl object-contain shadow-sm"
              onError={(e) => {
                // Fallback icon if logo fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Edulpha
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#curriculum" className="hover:text-indigo-600 transition-colors">Curriculum</a>
            <a href="#subjects" className="hover:text-indigo-600 transition-colors">Subjects</a>
            <a href="#ai-tutor" className="hover:text-indigo-600 transition-colors">AI Tutor</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#mobile-app" className="hover:text-indigo-600 transition-colors">Mobile App</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="compact" />
            <Link to="/auth" className="hidden sm:inline text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors">Login</Link>
            <Link to="/auth">
              <Button size="sm" className="shadow-lg shadow-indigo-100">Get Started</Button>
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
              <Sparkles size={14} className="mr-1.5 inline text-indigo-600" /> Cameroon GCE & French Curriculum Ecosystem
            </Badge>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] max-w-5xl mx-auto">
              Learn Smarter. <br />
              Achieve More with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edulpha AI</span>.
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            A bilingual AI-powered learning platform helping students prepare for GCE Ordinary & Advanced Level, BEPC, Baccalauréat, and beyond.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group shadow-xl shadow-indigo-200">
                Start Learning Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#subjects" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Courses
              </Button>
            </a>
            <a href="#mobile-app" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-indigo-600 hover:bg-indigo-50">
                <Download size={18} className="mr-2" /> Download Mobile App
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
                    <h3 className="font-bold text-white text-base">GCE A-Level Mathematics</h3>
                    <p className="text-xs text-slate-400">Pure Math P3 • Vector Mechanics & Calculus</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span>Mastery Score: 88%</span>
                      <span className="text-slate-400">Grade A Projected</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="font-bold text-white text-base">Edulpha AI Study Sprint</h3>
                    <p className="text-xs text-slate-400">Personalized 7-day weak topic recovery plan</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-300">
                      <span>Status: In Progress</span>
                      <span>15 min daily</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Award size={22} />
                    </div>
                    <h3 className="font-bold text-white text-base">National Mock Exams</h3>
                    <p className="text-xs text-slate-400">Timed GCE simulation with instant AI marking</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span>Next Exam: Saturday</span>
                      <span>Free Registration</span>
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
              { label: 'Students', value: '50,000+' },
              { label: 'Lessons', value: '12,500+' },
              { label: 'Practice Questions', value: '45,000+' },
              { label: 'Mock Exams', value: '3,500+' },
              { label: 'AI Conversations', value: '2.4M+' },
              { label: 'Teachers', value: '450+' },
              { label: 'Partner Schools', value: '120+' }
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
            <Badge variant="primary">Platform Advantages</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Why Choose Edulpha?</h2>
            <p className="text-slate-500 font-medium text-lg">
              Engineered specifically for Cameroon GCE and French educational standards with state-of-the-art AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: '24/7 AI Tutor',
                desc: 'Get instant, syllabus-aligned answers, step-by-step math solutions, and concept breakdowns in English or French.',
                color: 'bg-indigo-50 text-indigo-600'
              },
              {
                icon: BookOpen,
                title: 'Interactive Lessons',
                desc: 'Comprehensive digital lesson modules with multimedia explanations, diagrams, and summary notes.',
                color: 'bg-purple-50 text-purple-600'
              },
              {
                icon: Target,
                title: 'Past Questions & Drills',
                desc: 'Access decades of official GCE and BEPC past examination papers with instant automated grading.',
                color: 'bg-emerald-50 text-emerald-600'
              },
              {
                icon: TrendingUp,
                title: 'Smart Analytics',
                desc: 'Real-time performance tracking identifies your weak topics and generates targeted practice sprints.',
                color: 'bg-blue-50 text-blue-600'
              },
              {
                icon: GraduationCap,
                title: 'Personalized Learning',
                desc: 'Custom study plans tailored to your target exam date, current grades, and university aspirations.',
                color: 'bg-amber-50 text-amber-600'
              },
              {
                icon: Smartphone,
                title: 'Mobile Learning',
                desc: 'Study seamlessly across smartphone, tablet, and computer with automatic cloud progress syncing.',
                color: 'bg-rose-50 text-rose-600'
              },
              {
                icon: Clock,
                title: 'Offline Access',
                desc: 'Download lessons, study notes, and past questions for offline revision anywhere in Cameroon.',
                color: 'bg-teal-50 text-teal-600'
              },
              {
                icon: Globe,
                title: 'Bilingual Platform',
                desc: 'Fully switch between English and French interfaces and lesson materials with a single click.',
                color: 'bg-indigo-50 text-indigo-700'
              },
              {
                icon: Users,
                title: 'Community Discussions',
                desc: 'Collaborate with top students nationwide, ask questions, and share revision tips in our peer forum.',
                color: 'bg-purple-50 text-purple-700'
              }
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
            <Badge variant="secondary">Bilingual Educational Excellence</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Two Systems. One Ultimate Platform.</h2>
            <p className="text-slate-500 font-medium text-lg">
              Fully customized curriculum coverage for both English-subsystem and French-subsystem students in Cameroon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* English Curriculum Card */}
            <Card className="p-8 sm:p-10 space-y-8 border-2 border-indigo-100 bg-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center font-black text-lg">🇬🇧</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">English Subsystem</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Cameroon GCE Board Syllabus</p>
                  </div>
                </div>
                <Badge variant="primary">O & A Levels</Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" /> Ordinary Level (GCE O-Level)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    Complete preparation for Mathematics, English Language, Physics, Chemistry, Biology, Computer Science, Economics, Commerce, and History.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" /> Advanced Level (GCE A-Level)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    Rigorous modules for Pure Mathematics, Mechanics, Statistics, Physics, Computer Science, ICT, Chemistry, Biology, and Literature.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">10,000+ Past Papers & Solutions</span>
                <Link to="/auth">
                  <Button size="sm">Explore O/A Level</Button>
                </Link>
              </div>
            </Card>

            {/* French Curriculum Card */}
            <Card className="p-8 sm:p-10 space-y-8 border-2 border-purple-100 bg-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center font-black text-lg">🇫🇷</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Système Francophone</h3>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Programme Officiel du MINESEC</p>
                  </div>
                </div>
                <Badge variant="secondary">BEPC & Baccalauréat</Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" /> Cycle Collège (BEPC)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    Préparation complète pour les classes de 6ème en 3ème : Mathématiques, Physique-Chimie, SVT, Français, Anglais et Histoire-Géographie.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" /> Cycle Lycée (Seconde, Première, Terminale)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    Cours approfondis et sujets d'examen corrigés pour les séries scientifiques (C, D, TI) et littéraires (A4, E).
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Sujets du Bac & Probatoire</span>
                <Link to="/auth">
                  <Button size="sm" variant="secondary">Explorer le Lycée</Button>
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
            <Badge variant="primary">Comprehensive Course Catalog</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Explore Our Subjects</h2>
            <p className="text-slate-500 font-medium text-lg">
              Over 40+ subjects equipped with digital lessons, quizzes, past exam papers, and AI tutoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Mathematics', code: 'MATH', count: '1,450 Lessons', icon: '📐', desc: 'Algebra, Calculus, Trigonometry & Probability' },
              { name: 'Computer Science', code: 'COMP', count: '920 Lessons', icon: '💻', desc: 'Algorithms, Data Structures & Python Coding' },
              { name: 'ICT', code: 'ICT', count: '850 Lessons', icon: '🖥️', desc: 'Databases, Networking & Web Technologies' },
              { name: 'Physics', code: 'PHYS', count: '1,100 Lessons', icon: '⚛️', desc: 'Mechanics, Electricity, Optics & Thermodynamics' },
              { name: 'Chemistry', code: 'CHEM', count: '980 Lessons', icon: '🧪', desc: 'Organic, Inorganic & Physical Chemistry' },
              { name: 'Biology', code: 'BIO', count: '1,050 Lessons', icon: '🧬', desc: 'Genetics, Ecology, Human Anatomy & Physiology' },
              { name: 'English Language', code: 'ENG', count: '750 Lessons', icon: '📖', desc: 'Composition, Summary Writing & Grammar' },
              { name: 'French / Langue', code: 'FR', count: '800 Lessons', icon: '🇫🇷', desc: 'Dissertation, Grammaire & Expression Écrite' },
              { name: 'Geography', code: 'GEO', count: '640 Lessons', icon: '🌍', desc: 'Physical, Human & Cameroon Geography' },
              { name: 'History', code: 'HIST', count: '690 Lessons', icon: '🏛️', desc: 'World History, African History & Cameroon' },
              { name: 'Economics', code: 'ECON', count: '820 Lessons', icon: '📈', desc: 'Microeconomics, Macroeconomics & Development' },
              { name: 'Accounting & Commerce', code: 'ACC', count: '710 Lessons', icon: '💼', desc: 'Financial Accounting, Costing & Business Law' }
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
                    Start <ArrowRight size={12} />
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
              <Sparkles size={14} className="mr-1.5 inline" /> Edulpha AI Engine 2.0
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Your Personal 24/7 AI Tutor</h2>
            <p className="text-slate-400 font-medium text-lg">
              Ask any question, solve complex past exam problems, generate custom practice quizzes, and get instant bilingual feedback.
            </p>
          </div>

          {/* Interactive AI Chat Simulator */}
          <div className="max-w-4xl mx-auto bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden">
            <div className="bg-slate-850 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Edulpha AI Assistant</h4>
                  <p className="text-[11px] text-indigo-400">Online • GCE & Baccalauréat Expert</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-mono font-bold">English / Français</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Sample Prompt Pills */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSampleQuery('Explain Quadratic Equations in Cameroon GCE Mathematics', 'In Cameroon GCE Ordinary/Advanced Level Mathematics, quadratic equations take the form ax² + bx + c = 0. To solve them, use factorization, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.')}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-600"
                >
                  📐 Explain Quadratic Equations
                </button>
                <button 
                  onClick={() => handleSampleQuery('How to write a Python script for binary search in Computer Science', 'In A-Level Computer Science, binary search requires a sorted list. We initialize left=0 and right=len(arr)-1. While left <= right, find mid=(left+right)//2. If arr[mid]==target return mid, else adjust left or right.')}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-600"
                >
                  💻 Python Binary Search
                </button>
                <button 
                  onClick={() => handleSampleQuery('Résoudre un système d\'équations différentielles en Terminale C', 'Pour résoudre y\'\' + ay\' + by = 0 en Terminale C, on écrit l\'équation caractéristique r² + ar + b = 0. Selon le discriminant Δ, la solution générale combine exponentielles et fonctions trigonométriques.')}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-600"
                >
                  🇫🇷 Équations Différentielles
                </button>
              </div>

              {/* Chat Conversation Box */}
              <div className="space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">You</div>
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none text-slate-200 text-sm max-w-2xl font-medium">
                    {chatPrompt}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-md">AI</div>
                  <div className="bg-indigo-950/60 border border-indigo-500/30 p-4 rounded-2xl rounded-tl-none text-indigo-100 text-sm max-w-2xl font-medium leading-relaxed">
                    {isChatLoading ? (
                      <div className="flex items-center gap-2 text-indigo-300">
                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <span>Edulpha AI is analyzing syllabus & formulating response...</span>
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
                    Try Full AI Tutor Studio Now <ArrowRight className="ml-2" size={16} />
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
            <Badge variant="primary">Step-by-Step Success</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Your Learning Journey</h2>
            <p className="text-slate-500 font-medium text-lg">
              Follow our proven 7-step roadmap from registration to achieving top grades in your national exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up in seconds with email or Google.' },
              { step: '02', title: 'Choose Curriculum', desc: 'Select GCE O/A Levels or French System.' },
              { step: '03', title: 'Learn with AI', desc: 'Master topics with 24/7 AI tutor guidance.' },
              { step: '04', title: 'Practice Questions', desc: 'Drill past exam papers & instant quizzes.' },
              { step: '05', title: 'Take Mock Exams', desc: 'Simulate real national exam conditions.' },
              { step: '06', title: 'Track Progress', desc: 'Analyze weak spots & grade projections.' },
              { step: '07', title: 'Achieve Success', desc: 'Score A grades and secure admission.' }
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
            <Badge variant="secondary">Mobile Learning Ecosystem</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Study Anywhere, Anytime with Edulpha Mobile
            </h2>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              Never miss a revision session. Download the Edulpha app for Android and iOS to access lessons, flashcards, past questions, and offline mode.
            </p>

            <div className="space-y-4">
              {[
                'Offline mode for studying without internet connection',
                'Push notifications for daily study reminders & quizzes',
                'Instant AI tutor chat right from your smartphone',
                'Cloud syncing of quiz scores, bookmarks & study plans'
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
              <a href="#download" className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl shadow-lg transition-all">
                <Smartphone size={22} />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Download for</div>
                  <div className="text-sm font-black">Android APK & Google Play</div>
                </div>
              </a>
              <a href="#download" className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl shadow-lg transition-all">
                <Laptop size={22} />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-indigo-200">Available on</div>
                  <div className="text-sm font-black">App Store (iOS)</div>
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
                <h3 className="text-2xl font-black">Edulpha Mobile App</h3>
                <p className="text-xs text-slate-400">Scan QR code or click below to install on your mobile device.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                <div className="w-36 h-36 bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold rounded-xl">
                  [ QR CODE ]
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-400">Version 2.4.0 • Updated for 2026 GCE Syllabus</div>
            </Card>
          </div>
        </div>
      </section>

      {/* 10. Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">Flexible Subscriptions</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 font-medium text-lg">
              Choose the plan that fits your academic goals. Unlock unlimited AI tutoring and mock exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 space-y-6 border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <Badge variant="neutral">Starter</Badge>
                <h3 className="text-2xl font-black text-slate-900">Free Access</h3>
                <p className="text-xs text-slate-500">Essential tools to get started with basic revision.</p>
                <div className="text-4xl font-black text-slate-900">0 FCFA <span className="text-xs font-medium text-slate-400">/ forever</span></div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Basic Subject Lessons</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Limited AI Tutor Queries</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Public Discussion Forum</div>
                </div>
              </div>

              <Link to="/auth" className="w-full">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </Card>

            {/* Premium Plan (Recommended) */}
            <Card className="p-8 space-y-6 border-2 border-indigo-600 bg-indigo-950 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                Most Popular
              </div>

              <div className="space-y-4">
                <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">Recommended</Badge>
                <h3 className="text-2xl font-black text-white">Edulpha Premium</h3>
                <p className="text-xs text-indigo-200">Full unlimited access for serious GCE & Baccalauréat candidates.</p>
                <div className="text-4xl font-black text-white">5,000 FCFA <span className="text-xs font-medium text-indigo-300">/ term</span></div>
                
                <div className="space-y-3 pt-4 border-t border-indigo-800/60 text-xs font-bold text-indigo-100">
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Unlimited AI Tutor 24/7</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> All Past Questions & Solutions</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> National Mock Exams & Certificates</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Weakness Analyzer & Study Planner</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Offline App Access</div>
                </div>
              </div>

              <Link to="/auth" className="w-full">
                <Button variant="secondary" className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-xl">Unlock Premium</Button>
              </Link>
            </Card>

            {/* Institution Plan */}
            <Card className="p-8 space-y-6 border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <Badge variant="secondary">Schools & Colleges</Badge>
                <h3 className="text-2xl font-black text-slate-900">Institution License</h3>
                <p className="text-xs text-slate-500">For secondary schools, colleges, and coaching centers.</p>
                <div className="text-4xl font-black text-slate-900">Custom <span className="text-xs font-medium text-slate-400">/ school</span></div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Teacher Administration Dashboard</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Bulk Student Accounts & Analytics</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Custom School Mock Exam Builder</div>
                  <div className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Dedicated Support & Training</div>
                </div>
              </div>

              <Link to="/auth" className="w-full">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 11. Testimonials */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="primary">Success Stories</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Trusted by Students & Teachers</h2>
            <p className="text-slate-500 font-medium text-lg">
              Hear how Edulpha transformed exam preparation across Cameroon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Edulpha's AI tutor helped me jump from a C grade to an A in GCE Advanced Level Computer Science. The past question explanations are unmatched!",
                author: "Tening Emmanuel",
                role: "GCE A-Level Student, Bamenda",
                rating: 5
              },
              {
                quote: "As a Physics teacher, I use Edulpha Teacher Studio to generate quizzes and track my students' weak points. It saves me hours of work every week.",
                author: "Mme. Ngo Balep",
                role: "Physics Teacher, Douala",
                rating: 5
              },
              {
                quote: "The bilingual support and national mock exams gave my daughter the exact confidence she needed to pass her Baccalauréat with distinction.",
                author: "Dr. Achu Paul",
                role: "Parent, Yaoundé",
                rating: 5
              }
            ].map((t, i) => (
              <Card key={i} className="p-8 space-y-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed italic">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{t.author}</h4>
                    <p className="text-xs text-slate-400 font-medium">{t.role}</p>
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
            <Badge variant="secondary">Got Questions?</Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium text-lg">
              Everything you need to know about Edulpha registrations, pricing, and AI features.
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
            Start Learning Today
          </h2>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto font-medium relative z-10">
            Join thousands of Cameroon students achieving academic excellence with Edulpha AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-xl">
                Create Free Account
              </Button>
            </Link>
            <a href="#mobile-app">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Download Mobile App
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
              The premier bilingual AI-powered educational platform for Cameroon GCE and French curricula.
            </p>
            <div className="text-xs font-black text-indigo-400">Built for Academic Excellence</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-widest">Resources</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><a href="#subjects" className="hover:text-white transition-colors">Subject Catalog</a></li>
              <li><a href="#curriculum" className="hover:text-white transition-colors">GCE O & A Levels</a></li>
              <li><a href="#curriculum" className="hover:text-white transition-colors">Système Francophone</a></li>
              <li><a href="#ai-tutor" className="hover:text-white transition-colors">Edulpha AI Tutor</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-widest">Support & Contact</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              {contactEmail && <li><a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a></li>}
              {whatsappNumber && <li><a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a></li>}
              {whatsappGroupLink && <li><a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Join Student Community</a></li>}
              <li><a href="#faq" className="hover:text-white transition-colors">Help Center & FAQs</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-widest">Legal & Security</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><Link to="/auth" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Data Protection</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div>© 2026 Edulpha AI Technologies. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Secure SSL Encryption</span>
            <span className="flex items-center gap-1.5"><Globe size={16} className="text-indigo-400" /> English & Français Bilingual</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
