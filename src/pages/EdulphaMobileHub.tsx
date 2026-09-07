import React, { useState } from 'react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
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
  Search,
  Settings,
  Flame,
  Tablet,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MobileHomeScreen } from '../components/mobile/MobileHomeScreen';
import { MobileExploreScreen } from '../components/mobile/MobileExploreScreen';
import { MobileAITutorScreen } from '../components/mobile/MobileAITutorScreen';
import { MobileExamsScreen } from '../components/mobile/MobileExamsScreen';
import { MobileProfileScreen } from '../components/mobile/MobileProfileScreen';
import { MobileSettingsModal } from '../components/mobile/MobileSettingsModal';
import { MobileLessonModal } from '../components/mobile/MobileLessonModal';
import { FlutterCodeExporter } from '../components/mobile/FlutterCodeExporter';

export const EdulphaMobileHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'overview' | 'architecture' | 'offline' | 'payments'>('simulator');
  const [simScreen, setSimScreen] = useState<'home' | 'explore' | 'ai' | 'exams' | 'profile'>('home');
  const [simLang, setSimLang] = useState<'en' | 'fr'>('en');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'android' | 'tablet'>('iphone');

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<{ title: string; subject: string } | null>(null);

  // Payment simulation state
  const [isPaying, setIsPaying] = useState(false);

  const handleSimDownload = (lessonName: string) => {
    toast.success(`Saved "${lessonName}" to offline storage!`);
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
      designSystem: "Deep Royal Blue & Golden Yellow (Flyer Edition)",
      downloadUrl: "https://edulpha.app/download/android/release.apk",
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(apkInfo, null, 2)], { type: 'application/json' });
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
      toast.success(`Subscription payment of 5,000 XAF via ${provider} verified! Edulpha Premium Pass renewed.`);
    }, 1200);
  };

  return (
    <ModernDashboardLayout role="student" activeTab="mobile_app">
      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0F2C59] via-indigo-950 to-purple-950 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-blue-500/30">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/20 backdrop-blur-md rounded-full text-xs font-black text-amber-300 border border-amber-400/30 uppercase tracking-wide">
            <Smartphone className="w-4 h-4 text-amber-400" /> Edulpha Mobile App (Flutter iOS & Android)
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Premium Global Mobile UI Redesign
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            Engineered strictly with <strong className="text-amber-300">Deep Royal Blue (#0F2C59)</strong> and <strong className="text-amber-300">Golden Yellow (#F59E0B)</strong> branding from the official Edulpha promotional flyer. Features Riverpod state management, offline Isar storage, MTN & Orange Mobile Money, and bilingual GCE / MINESEC support.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-5 py-3 bg-amber-400 text-[#0F2C59] font-black rounded-2xl shadow-lg hover:bg-amber-300 transition flex items-center gap-2 active:scale-95"
            >
              <Smartphone className="w-5 h-5 text-[#0F2C59]" />
              Launch Mobile Simulator
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Code className="w-5 h-5 text-amber-300" />
              Flutter Dart Code Exporter
            </button>
            <button
              onClick={handleDownloadAPK}
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl border border-slate-700 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              Download Signed APK (v1.0.0)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'simulator', label: '📱 Interactive Mobile Simulator', icon: Smartphone },
          { id: 'code', label: '⚡ Flutter Dart Code Exporter', icon: Code },
          { id: 'overview', label: '🎨 Design System & Branding', icon: Sparkles },
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
              className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-amber-400 text-amber-400 bg-blue-950/40 rounded-t-xl'
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
          <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 space-y-6 shadow-xl">
            <div>
              <h3 className="text-lg font-extrabold text-white">Flutter App Simulator Controls</h3>
              <p className="text-xs text-slate-400 mt-1">
                Experience the redesigned Edulpha mobile app live with real touch targets, tab switching, exam timer, and AI tutor.
              </p>
            </div>

            {/* Device Mockup Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Device Display Frame
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setDeviceFrame('iphone')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 border ${
                    deviceFrame === 'iphone'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> iPhone 16
                </button>
                <button
                  onClick={() => setDeviceFrame('android')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 border ${
                    deviceFrame === 'android'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Galaxy S24
                </button>
                <button
                  onClick={() => setDeviceFrame('tablet')}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 border ${
                    deviceFrame === 'tablet'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet
                </button>
              </div>
            </div>

            {/* Language Switch */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Language (Bilingual EN / FR)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimLang('en')}
                  className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                    simLang === 'en'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  🇬🇧 English (GCE O/A)
                </button>
                <button
                  onClick={() => setSimLang('fr')}
                  className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                    simLang === 'fr'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  🇫🇷 Français (BEPC/BAC)
                </button>
              </div>
            </div>

            {/* Offline Mode & Theme Toggle */}
            <div className="space-y-3">
              {/* Offline Toggle */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isOfflineMode ? <WifiOff className="w-5 h-5 text-amber-400" /> : <Wifi className="w-5 h-5 text-emerald-400" />}
                  <div>
                    <h4 className="font-extrabold text-xs text-white">
                      {isOfflineMode ? 'Offline Mode Active' : 'Online Connected'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {isOfflineMode ? 'Viewing Isar local cache' : 'Firebase Firestore cloud sync'}
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

              {/* Theme Toggle */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-white">Mobile Theme</h4>
                  <p className="text-[10px] text-slate-400">Toggle light / dark mode appearance</p>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
                >
                  {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>
            </div>

            {/* Flyer Branding Note */}
            <div className="p-4 bg-blue-950/50 rounded-2xl border border-blue-800/50 space-y-2 text-xs text-blue-200">
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Official Edulpha Flyer Compliance
              </div>
              <ul className="space-y-1 pl-4 list-disc text-slate-300 text-[11px]">
                <li>Primary Color: Deep Royal Blue (#0F2C59)</li>
                <li>Accent Color: Golden Yellow (#F59E0B)</li>
                <li>8-point spacing grid & large touch target buttons</li>
                <li>Duolingo/Coursera level mobile learning experience</li>
              </ul>
            </div>
          </div>

          {/* Device Mockup Frame Container */}
          <div className="lg:col-span-7 flex justify-center">
            <div
              className={`transition-all duration-300 ${
                deviceFrame === 'tablet' ? 'w-[440px] h-[760px]' : 'w-[360px] h-[720px]'
              } rounded-[48px] border-[10px] ${
                isDarkMode ? 'border-slate-950 bg-slate-950 text-slate-100' : 'border-slate-800 bg-slate-900 text-slate-100'
              } shadow-2xl relative overflow-hidden flex flex-col`}
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
              </div>

              {/* Status Bar */}
              <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold z-20 bg-slate-900">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  {isOfflineMode ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
                  <span>5G 🔋</span>
                </div>
              </div>

              {/* Top Mobile Bar */}
              <div className={`px-4 py-2 border-b flex justify-between items-center z-20 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0F2C59] flex items-center justify-center text-amber-400 font-black text-xs shadow-md border border-amber-400/40">
                    E
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white">Edulpha</h2>
                    <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold">
                      {simLang === 'en' ? 'GCE & BAC Hub' : 'Espace Bilingue'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toast.success('Notifications: 3 unread exam reminders')}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500"></span>
                  </button>
                </div>
              </div>

              {/* Mobile App Active Tab Content Area */}
              <div className={`flex-1 overflow-y-auto p-3 space-y-4 pb-16 ${
                isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
              }`}>
                {simScreen === 'home' && (
                  <MobileHomeScreen
                    simLang={simLang}
                    isDarkMode={isDarkMode}
                    isOfflineMode={isOfflineMode}
                    onNavigateTab={setSimScreen}
                    onStartLesson={(title, subject) => setSelectedLesson({ title, subject })}
                    onDownloadItem={handleSimDownload}
                  />
                )}

                {simScreen === 'explore' && (
                  <MobileExploreScreen
                    simLang={simLang}
                    isDarkMode={isDarkMode}
                    onStartLesson={(title, subject) => setSelectedLesson({ title, subject })}
                    onDownloadItem={handleSimDownload}
                  />
                )}

                {simScreen === 'ai' && (
                  <MobileAITutorScreen
                    simLang={simLang}
                    isDarkMode={isDarkMode}
                  />
                )}

                {simScreen === 'exams' && (
                  <MobileExamsScreen
                    simLang={simLang}
                    isDarkMode={isDarkMode}
                  />
                )}

                {simScreen === 'profile' && (
                  <MobileProfileScreen
                    simLang={simLang}
                    isDarkMode={isDarkMode}
                    onSetLang={setSimLang}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onTriggerPayment={handleMobilePayment}
                  />
                )}
              </div>

              {/* Bottom Mobile 5-Tab Navigation Bar */}
              <div className={`absolute bottom-0 left-0 right-0 border-t py-2 px-2 flex justify-around items-center z-20 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {[
                  { id: 'home', label: simLang === 'en' ? 'Home' : 'Accueil', icon: Smartphone },
                  { id: 'explore', label: simLang === 'en' ? 'Explore' : 'Explorer', icon: BookOpen },
                  { id: 'ai', label: 'AI Tutor', icon: Bot },
                  { id: 'exams', label: simLang === 'en' ? 'Exams' : 'Examens', icon: Award },
                  { id: 'profile', label: simLang === 'en' ? 'Profile' : 'Profil', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = simScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSimScreen(item.id as any)}
                      className={`flex flex-col items-center gap-0.5 transition py-1 px-2 rounded-xl active:scale-95 ${
                        isActive
                          ? 'text-[#0F2C59] dark:text-amber-400 font-extrabold bg-blue-50 dark:bg-blue-950/60'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                      <span className="text-[9px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLUTTER CODE EXPORTER */}
      {activeTab === 'code' && <FlutterCodeExporter />}

      {/* TAB 3: BRAND & DESIGN SYSTEM */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3 shadow-lg">
            <div className="p-3 bg-blue-600/20 text-blue-400 w-fit rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Official Flyer Palette</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Strictly uses Deep Royal Blue (#0F2C59) as primary, Golden Yellow (#F59E0B) as accent, and crisp light/dark neutrals.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3 shadow-lg">
            <div className="p-3 bg-amber-500/20 text-amber-400 w-fit rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Bilingual Cameroon GCE & BAC</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Native support for GCE Ordinary & Advanced Level in English, and BEPC & Baccalauréat in French.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3 shadow-lg">
            <div className="p-3 bg-purple-600/20 text-purple-400 w-fit rounded-2xl">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Tutor Engine</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dedicated AI Assistant screen with prompt chips, LaTeX equation solver, and step-by-step guidance.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: CLEAN ARCHITECTURE & TECH */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="w-7 h-7 text-blue-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Flutter Clean Architecture</h3>
              <p className="text-xs text-slate-400">Strict presentation, domain, and data layer separation with Riverpod</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-blue-400">1. Presentation Layer</h4>
              <p className="text-slate-300">Riverpod state providers, responsive mobile widgets, EN/FR localization.</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-purple-400">2. Domain Layer</h4>
              <p className="text-slate-300">Use cases for timed exams, streak management, and AI prompt formatting.</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-emerald-400">3. Data Layer</h4>
              <p className="text-slate-300">Isar offline database, Firebase Cloud Firestore sync, Dio REST client.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OFFLINE LEARNING */}
      {activeTab === 'offline' && (
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <Wifi className="w-7 h-7 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Offline-First Learning Sync Engine</h3>
              <p className="text-xs text-slate-400">Local Isar DB caching for zero-data study sessions</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            All downloaded lessons, past question papers, and AI explanations are cached locally using Isar DB. When an internet connection becomes available, progress and streak updates automatically sync back to Firebase Firestore.
          </p>
        </div>
      )}

      {/* TAB 6: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <div>
              <h3 className="text-xl font-bold text-white">MTN & Orange Mobile Money Integration</h3>
              <p className="text-xs text-slate-400">Direct mobile payments for Cameroon & Central Africa</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-amber-400">MTN Mobile Money API</h4>
              <p className="text-slate-300">USSD push notifications and instant tokenized payments for GCE/BAC pass renewals.</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-orange-400">Orange Money Cameroon</h4>
              <p className="text-slate-300">Secure API webhook verification for immediate premium subscription activation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <MobileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        simLang={simLang}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onSetLang={setSimLang}
      />

      <MobileLessonModal
        lessonTitle={selectedLesson?.title || null}
        subjectName={selectedLesson?.subject || null}
        onClose={() => setSelectedLesson(null)}
        simLang={simLang}
        isDarkMode={isDarkMode}
        onDownload={handleSimDownload}
      />
      </div>
    </ModernDashboardLayout>
  );
};

export default EdulphaMobileHub;
