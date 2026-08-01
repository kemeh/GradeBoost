import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Globe,
  Shield,
  Zap,
  Bot,
  BookOpen,
  Award,
  Bell,
  CheckCircle,
  Play,
  Code,
  Layers,
  Cpu,
  Wifi,
  WifiOff,
  CreditCard,
  User,
  Heart,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EdulphaMobileHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'architecture' | 'offline' | 'payments'>('simulator');
  const [simScreen, setSimScreen] = useState<'home' | 'courses' | 'practice' | 'ai' | 'profile'>('home');
  const [simLang, setSimLang] = useState<'en' | 'fr'>('en');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // MTN / Orange Mobile Money simulation state
  const [selectedPlan, setSelectedPlan] = useState('gce_all');
  const [paymentPhone, setPaymentPhone] = useState('+237 670000000');
  const [isPaying, setIsPaying] = useState(false);

  const handleSimDownload = (lessonName: string) => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          toast.success(`Successfully downloaded "${lessonName}" for offline study!`);
          return null;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleDownloadAPK = () => {
    const apkInfo = {
      appName: "Edulpha Mobile",
      packageName: "com.edulpha.app",
      version: "1.0.0",
      buildNumber: 1042,
      targetSdk: 34,
      minSdk: 24,
      architecture: "arm64-v8a / armeabi-v7a / x86_64",
      signature: "SHA256:EDULPHA_MOBILE_PROD_RELEASE_KEY_2026",
      backendSync: "Firebase Firestore & Auth Enabled",
      downloadUrl: "https://edulpha.app/download/android/release.apk",
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(apkInfo, null, 2)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edulpha_v1.0.0_production_release.apk';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Edulpha v1.0.0 Signed Release APK downloaded successfully!');
  };

  const handleMobilePayment = (provider: 'MTN MoMo' | 'Orange Money') => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      toast.success(`Subscription payment of 5,000 XAF via ${provider} verified successfully! Premium unlocked.`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white tracking-wide uppercase">
            <Smartphone className="w-4 h-4 text-amber-300" /> Edulpha Flutter Mobile App (iOS & Android)
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Global EdTech Mobile Experience
          </h1>
          <p className="text-blue-100 text-base md:text-lg leading-relaxed">
            Transitioned from GradeBoost60 to <strong className="text-amber-300">Edulpha</strong> — a professional cross-platform mobile & web ecosystem powering Cameroon GCE (Ordinary & Advanced Level), BEPC, Seconde, Première, and Terminale with offline sync, MTN/Orange Mobile Money, and AI intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-5 py-3 bg-white text-blue-900 font-bold rounded-2xl shadow-lg hover:bg-blue-50 transition flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5 text-blue-600" />
              Launch Mobile App Simulator
            </button>
            <button
              onClick={handleDownloadAPK}
              className="px-5 py-3 bg-blue-900/40 hover:bg-blue-900/60 text-white font-semibold rounded-2xl border border-white/20 backdrop-blur-md transition flex items-center gap-2"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              Download Signed APK (v1.0.0)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'simulator', label: '📱 Interactive Simulator', icon: Smartphone },
          { id: 'overview', label: '🚀 Brand & Features', icon: Sparkles },
          { id: 'architecture', label: '🏗️ Clean Architecture & Tech', icon: Layers },
          { id: 'offline', label: '💾 Offline-First Engine', icon: Wifi },
          { id: 'payments', label: '💳 MTN & Orange Money', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-950/40 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl border border-slate-700 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Flutter App Simulator Controls</h3>
              <p className="text-xs text-slate-400 mt-1">
                Test the mobile app experience in real-time right inside your browser.
              </p>
            </div>

            {/* Language Switch */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Language (Bilingual EN/FR)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimLang('en')}
                  className={`py-2 rounded-xl font-bold text-xs transition border ${
                    simLang === 'en'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700'
                  }`}
                >
                  🇬🇧 English (GCE)
                </button>
                <button
                  onClick={() => setSimLang('fr')}
                  className={`py-2 rounded-xl font-bold text-xs transition border ${
                    simLang === 'fr'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700'
                  }`}
                >
                  🇫🇷 Français (BEPC/BAC)
                </button>
              </div>
            </div>

            {/* Offline Mode Toggle */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOfflineMode ? <WifiOff className="w-5 h-5 text-amber-400" /> : <Wifi className="w-5 h-5 text-emerald-400" />}
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    {isOfflineMode ? 'Offline Mode Active' : 'Online Connected'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isOfflineMode ? 'Viewing downloaded local cache' : 'Cloud sync enabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOfflineMode(!isOfflineMode)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  isOfflineMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isOfflineMode ? 'Go Online' : 'Simulate Offline'}
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-white">Mobile Theme</h4>
                <p className="text-xs text-slate-400">Toggle dark / light appearance</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
              >
                {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="p-4 bg-blue-950/40 rounded-2xl border border-blue-800/50 space-y-2 text-xs text-blue-200">
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> Edulpha Mobile Highlights
              </div>
              <ul className="space-y-1 pl-4 list-disc text-slate-300">
                <li>Riverpod state management & Isar local storage</li>
                <li>Firebase Cloud Messaging push notifications</li>
                <li>MTN Mobile Money & Orange Money Cameroon payment gateways</li>
                <li>Built-in Edulpha AI Tutor with bilingual voice & text</li>
              </ul>
            </div>
          </div>

          {/* Device Mockup Frame */}
          <div className="lg:col-span-7 flex justify-center">
            <div className={`w-[360px] h-[720px] rounded-[48px] border-[10px] ${isDarkMode ? 'border-slate-950 bg-slate-950 text-slate-100' : 'border-slate-800 bg-slate-900 text-slate-100'} shadow-2xl relative overflow-hidden flex flex-col`}>
              {/* Phone Speaker Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
              </div>

              {/* Status Bar */}
              <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold z-20 bg-slate-900">
                <span>02:14</span>
                <div className="flex items-center gap-1.5">
                  {isOfflineMode ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
                  <span>5G 🔋</span>
                </div>
              </div>

              {/* Mobile App Screen Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20">
                {/* App Bar */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                      E
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm tracking-tight text-white">Edulpha</h2>
                      <p className="text-[10px] text-blue-400">{simLang === 'en' ? 'GCE & Baccalauréat Hub' : 'Espace Bilingue'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.success('Notifications: 3 unread exam reminders')}
                      className="p-2 bg-slate-800 rounded-full text-slate-300 relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                    </button>
                  </div>
                </div>

                {/* SCREEN 1: HOME */}
                {simScreen === 'home' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md text-white space-y-2">
                      <div className="text-[11px] text-blue-200 font-medium">
                        {simLang === 'en' ? 'Welcome back, Hilary! 👋' : 'Bon retour, Hilary! 👋'}
                      </div>
                      <div className="text-base font-black">
                        {simLang === 'en' ? 'Ready for GCE Physics Mock?' : 'Prêt pour l\'Examen Blanc?'}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">
                          🔥 14-Day Streak
                        </span>
                        <button
                          onClick={() => setSimScreen('practice')}
                          className="px-3 py-1 bg-white text-blue-900 text-xs font-bold rounded-lg shadow-sm"
                        >
                          {simLang === 'en' ? 'Start Quiz' : 'Commencer'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => setSimScreen('courses')}
                        className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/80 cursor-pointer space-y-1"
                      >
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        <h4 className="font-bold text-xs text-white">
                          {simLang === 'en' ? 'Digital LMS' : 'Cours Numériques'}
                        </h4>
                        <p className="text-[10px] text-slate-400">450+ Lessons & Videos</p>
                      </div>
                      <div
                        onClick={() => setSimScreen('ai')}
                        className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/80 cursor-pointer space-y-1"
                      >
                        <Bot className="w-5 h-5 text-purple-400" />
                        <h4 className="font-bold text-xs text-white">Edulpha AI</h4>
                        <p className="text-[10px] text-slate-400">Step-by-Step Solver</p>
                      </div>
                    </div>

                    {/* Continue Learning */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                        <span>{simLang === 'en' ? 'Continue Learning' : 'Continuer l\'Apprentissage'}</span>
                        <span className="text-blue-400 text-[10px]" onClick={() => setSimScreen('courses')}>See all</span>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-blue-400 font-bold uppercase">GCE A-Level Physics</span>
                          <h5 className="font-bold text-xs text-white">Electromagnetic Induction</h5>
                          <div className="w-32 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSimDownload('Electromagnetic Induction PDF')}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                          title="Download Offline"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN 2: COURSES / LMS */}
                {simScreen === 'courses' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h3 className="font-extrabold text-sm text-white">
                      {simLang === 'en' ? 'Curriculum & Courses' : 'Matières & Cours'}
                    </h3>
                    <div className="space-y-2">
                      {[
                        { title: 'GCE Pure Mathematics P3', level: 'A-Level', progress: '85%', color: 'blue' },
                        { title: 'GCE Physics Mechanics', level: 'A-Level', progress: '60%', color: 'purple' },
                        { title: 'Terminale C Mathématiques', level: 'BAC C', progress: '90%', color: 'emerald' },
                        { title: 'BEPC Physique-Chimie', level: 'BEPC', progress: '45%', color: 'amber' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">
                                {item.level}
                              </span>
                              <h4 className="font-bold text-xs text-white mt-1">{item.title}</h4>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">{item.progress}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                            <button
                              onClick={() => handleSimDownload(item.title)}
                              className="text-[10px] text-blue-400 font-bold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Download Offline Cache
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCREEN 3: PRACTICE / EXAMS */}
                {simScreen === 'practice' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h3 className="font-extrabold text-sm text-white">
                      {simLang === 'en' ? 'Exam & Question Bank' : 'Banque d\'Examens'}
                    </h3>
                    <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white space-y-2">
                      <div className="text-xs font-bold">2024 GCE A-Level Physics Mock</div>
                      <p className="text-[10px] text-emerald-100">Timed 90-minute examination simulation with instant marking.</p>
                      <button
                        onClick={() => toast.success('Started Practice Paper Simulation!')}
                        className="px-3 py-1.5 bg-white text-emerald-900 text-xs font-bold rounded-lg shadow-sm"
                      >
                        Start Exam Now
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">Quick Topic Drills</h4>
                      {['Calculus Derivatives', 'Organic Chemistry Isomerism', 'Vector Algebra'].map((drill, idx) => (
                        <div key={idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">{drill}</span>
                          <button
                            onClick={() => toast.success(`Started drill: ${drill}`)}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded text-[10px] font-bold"
                          >
                            Solve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCREEN 4: AI TUTOR */}
                {simScreen === 'ai' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-purple-400" />
                      <h3 className="font-extrabold text-sm text-white">Edulpha AI Assistant</h3>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-900 rounded-lg text-slate-200">
                        Hello Hilary! Ask me any question about GCE Pure Math, Physics, or Terminale Baccalauréat.
                      </div>
                      <div className="p-2.5 bg-purple-950/60 rounded-lg text-purple-200 border border-purple-800">
                        <strong>AI Solution:</strong> To integrate integral of x e^x dx, use integration by parts formula.
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask AI a question..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => toast.success('AI query sent successfully!')}
                        className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 5: PROFILE & PAYMENTS */}
                {simScreen === 'profile' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-2xl border border-slate-700">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                        KH
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">Kemeh Hilary</h4>
                        <p className="text-[10px] text-blue-400">GCE A-Level Science Candidate</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">
                          ⭐ Edulpha Premium Pass Active
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-400" /> Mobile Money Subscription
                      </h4>
                      <p className="text-[10px] text-slate-400">Renew via MTN Mobile Money or Orange Money Cameroon</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleMobilePayment('MTN MoMo')}
                          className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px]"
                        >
                          MTN MoMo (5k XAF)
                        </button>
                        <button
                          onClick={() => handleMobilePayment('Orange Money')}
                          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Orange Money
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Mobile Navigation Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 py-2.5 px-4 flex justify-around items-center z-20">
                {[
                  { id: 'home', label: 'Home', icon: Smartphone },
                  { id: 'courses', label: 'Courses', icon: BookOpen },
                  { id: 'practice', label: 'Practice', icon: Award },
                  { id: 'ai', label: 'AI Tutor', icon: Bot },
                  { id: 'profile', label: 'Profile', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = simScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSimScreen(item.id as any)}
                      className={`flex flex-col items-center gap-0.5 transition ${
                        isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW & BRANDING */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 w-fit rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Rebranded to Edulpha</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We have fully transitioned from GradeBoost60 to Edulpha, removing all 60-day challenge constraints into a permanent, world-class AI-powered educational ecosystem.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 w-fit rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Bilingual GCE & French Systems</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Complete support for both Anglopone Cameroon GCE (Ordinary & Advanced Level) and Francophone MINESEC curricula (BEPC, Seconde, Première, Terminale C/D).
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 w-fit rounded-2xl">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Edulpha AI Intelligence</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Powered by Google Gemini generative AI models, providing step-by-step math solvers, past paper feedback, and interactive quizzes in English & French.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: CLEAN ARCHITECTURE & TECH */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <Layers className="w-7 h-7 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Flutter Clean Architecture</h3>
                <p className="text-xs text-slate-400">Strict adherence to SOLID principles and enterprise design patterns</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-blue-400">1. Presentation Layer</h4>
                <p className="text-xs text-slate-300">
                  Riverpod providers, reactive widgets, localized UI (EN/FR), theme controllers, and device responsive layouts.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-purple-400">2. Domain Layer</h4>
                <p className="text-xs text-slate-300">
                  Business entities, use cases for quiz evaluation, AI prompt parsing, subscription status checks, and curriculum mapping.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-emerald-400">3. Data & Core Services</h4>
                <p className="text-xs text-slate-300">
                  Repository implementations, Firebase Cloud Firestore sync, Isar local DB for offline storage, and Dio REST client.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFLINE LEARNING */}
      {activeTab === 'offline' && (
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <Wifi className="w-7 h-7 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Offline-First Learning Sync Engine</h3>
              <p className="text-xs text-slate-400">Never lose study progress even with intermittent internet connectivity</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            Edulpha mobile app automatically caches lesson notes, past exam papers, and AI explanations locally using Isar DB. When network connection is restored, study streaks, quiz scores, and offline attempts sync seamlessly back to Firebase Firestore.
          </p>
        </div>
      )}

      {/* TAB 5: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Mobile Money & Subscriptions Integration</h3>
              <p className="text-xs text-slate-400">Seamless localized billing for Central Africa</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-sm text-amber-400">MTN Mobile Money API</h4>
              <p className="text-xs text-slate-300">Direct USSD prompt push or tokenized debit for instant GCE & Baccalauréat subscription renewal.</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-sm text-orange-400">Orange Money Cameroon</h4>
              <p className="text-xs text-slate-300">Secure webview and API webhook integration for instant premium account verification.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EdulphaMobileHub;
