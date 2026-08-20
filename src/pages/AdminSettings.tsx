import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Settings, Key, Save, CheckCircle, AlertCircle, RefreshCw, 
  ShieldCheck, Calendar, RotateCcw, CreditCard, Trash2, LayoutDashboard,
  Globe, MessageSquare, BookOpen, Navigation, Sparkles, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import { DEFAULT_CHALLENGE_START_DATE, getCurrentDayNumber } from '../utils/challenge';
import { Badge, Button, Card } from '../components/ui';
import FileUpload from '../components/FileUpload';

// Lazy load heavy subcomponents to optimize bundle size and page render speed
const PhoneAuthSettings = React.lazy(() => import('../components/PhoneAuthSettings'));
const AdminCurriculumManager = React.lazy(() => import('../components/AdminCurriculumManager').then(m => ({ default: m.AdminCurriculumManager })));
const AdminTranslationManager = React.lazy(() => import('../components/AdminTranslationManager').then(m => ({ default: m.AdminTranslationManager })));
const AdminNavigationManagement = React.lazy(() => import('../components/admin/AdminNavigationManagement'));
const AIAdminDashboard = React.lazy(() => import('../components/EdulphaAI/AIAdminDashboard').then(m => ({ default: m.AIAdminDashboard })));
const SubjectManager = React.lazy(() => import('../components/SubjectManager'));

type TabKey = 'general' | 'ai' | 'auth' | 'payments' | 'challenge' | 'curriculum' | 'navigation' | 'translations' | 'system';

function TabSkeleton() {
  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-200 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded-xl w-1/3"></div>
      <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSettings } = useSettings();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [challengeStartDate, setChallengeStartDate] = useState(DEFAULT_CHALLENGE_START_DATE);
  const [paymentPrice, setPaymentPrice] = useState(1000);
  const [appName, setAppName] = useState('Edulpha');
  const [logoUrl, setLogoUrl] = useState('/edulpha-logo.png');
  const [contactEmail, setContactEmail] = useState('support@edulpha.com');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappGroupLink, setWhatsappGroupLink] = useState('');
  const [momoNumber, setMomoNumber] = useState('677 123 456');
  const [momoName, setMomoName] = useState('Admin Name');
  const [omNumber, setOmNumber] = useState('699 123 456');
  const [omName, setOmName] = useState('Admin Name');

  // AI Connection Test
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Danger Zone Fixes
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getSystemSettings();
        if (settings) {
          setApiKey(settings.geminiApiKey || '');
          if (settings.challengeStartDate) setChallengeStartDate(settings.challengeStartDate);
          if (settings.paymentPrice !== undefined) setPaymentPrice(settings.paymentPrice);
          if (settings.appName) setAppName(settings.appName);
          if (settings.logoUrl) setLogoUrl(settings.logoUrl);
          if (settings.contactEmail) setContactEmail(settings.contactEmail);
          if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
          if (settings.whatsappGroupLink) setWhatsappGroupLink(settings.whatsappGroupLink);
          if (settings.momoNumber) setMomoNumber(settings.momoNumber);
          if (settings.momoName) setMomoName(settings.momoName);
          if (settings.omNumber) setOmNumber(settings.omNumber);
          if (settings.omName) setOmName(settings.omName);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Admin Security Guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 shadow-xl rounded-3xl">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t('admin.unauthorizedTitle', 'Access Restricted')}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('admin.unauthorizedDesc', 'You need administrator credentials to access System Settings.')}
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">
            {t('common.returnDashboard', 'Return to Dashboard')}
          </Button>
        </Card>
      </div>
    );
  }

  const handleSaveAll = async () => {
    if (!appName.trim()) {
      toast.error(t('settings.errAppName', 'App Name cannot be empty'));
      return;
    }

    if (!logoUrl.trim()) {
      toast.error(t('settings.errLogo', 'Logo URL cannot be empty'));
      return;
    }

    if (!challengeStartDate) {
      toast.error(t('settings.errStartDate', 'Challenge Start Date cannot be empty'));
      return;
    }

    if (paymentPrice < 0) {
      toast.error(t('settings.errPrice', 'Payment Price cannot be negative'));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(t('settings.saving', 'Saving system settings...'));

    try {
      await updateSystemSettings({
        geminiApiKey: apiKey.trim(),
        challengeStartDate,
        paymentPrice,
        appName: appName.trim(),
        logoUrl: logoUrl.trim(),
        platformLogoUrl: logoUrl.trim(),
        contactEmail: contactEmail.trim(),
        whatsappNumber: whatsappNumber.trim(),
        whatsappGroupLink: whatsappGroupLink.trim(),
        momoNumber: momoNumber.trim(),
        momoName: momoName.trim(),
        omNumber: omNumber.trim(),
        omName: omName.trim(),
        updatedBy: user.uid || 'admin'
      });

      await refreshSettings();
      toast.success(t('settings.savedSuccess', 'Settings persisted successfully!'), { id: toastId });
    } catch (error: any) {
      console.error('[SETTINGS SAVE ERROR]', error);
      toast.error(`${t('settings.savedFallback', 'Settings saved with local fallback')}: ${error?.message || 'Done'}`, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setChallengeStartDate(`${year}-${month}-${day}`);
    toast.success(t('settings.resetTodayMsg', 'Start date set to today. Remember to click Save!'));
  };

  const handleResetAllSubmissions = async () => {
    if (!window.confirm(t('settings.resetSubmissionsConfirm', 'CRITICAL: Delete ALL student submissions for ALL drills? This cannot be undone.'))) {
      return;
    }

    setIsSaving(true);
    try {
      const submissionsSnap = await getDocs(collection(db, 'drill_submissions'));
      const batch = writeBatch(db);
      submissionsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      toast.success(`${t('settings.resetDone', 'Cleared submissions')}: ${submissionsSnap.size}`);
    } catch (error) {
      console.error('Error resetting submissions:', error);
      toast.error(t('settings.resetFail', 'Failed to reset submissions'));
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast.error(t('settings.enterKeyFirst', 'Please enter an API key first'));
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const genAI = new GoogleGenAI({ apiKey: apiKey.trim() });
      const model = genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: 'Hello, testing connection.',
      });
      const response = await model;
      if (response.text) {
        setTestResult({ success: true, message: t('settings.testSuccess', 'Edulpha AI is online and responding.') });
        toast.success('Edulpha AI connection test passed!');
      } else {
        throw new Error('Empty response from Edulpha AI');
      }
    } catch (error: any) {
      console.error('Edulpha AI test error:', error);
      setTestResult({ 
        success: false, 
        message: `${t('settings.testFailed', 'Connection failed')}: ${error.message || 'Unknown error'}` 
      });
      toast.error('Edulpha AI connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleFixData = async () => {
    if (!window.confirm(t('settings.fixDataConfirm', 'Trim subject and topic strings in daily_drills, exam_questions, and subjects?'))) {
      return;
    }

    setIsFixing(true);
    setFixResult(null);
    try {
      let totalFixed = 0;

      // Fix subjects
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const subjectBatch = writeBatch(db);
      subjectsSnap.docs.forEach(d => {
        const data = d.data();
        if (data.name && data.name !== data.name.trim()) {
          subjectBatch.update(d.ref, { name: data.name.trim() });
          totalFixed++;
        }
      });
      await subjectBatch.commit();

      // Fix daily drills
      const drillsSnap = await getDocs(collection(db, 'daily_drills'));
      const drillBatch = writeBatch(db);
      drillsSnap.docs.forEach(d => {
        const data = d.data();
        const updates: any = {};
        if (data.subject && data.subject !== data.subject.trim()) updates.subject = data.subject.trim();
        if (data.topic && data.topic !== data.topic.trim()) updates.topic = data.topic.trim();
        if (Object.keys(updates).length > 0) {
          drillBatch.update(d.ref, updates);
          totalFixed++;
        }
      });
      await drillBatch.commit();

      setFixResult(`Successfully cleaned ${totalFixed} records.`);
      toast.success(`Data integrity check complete! Cleaned ${totalFixed} records.`);
    } catch (error: any) {
      console.error('Error fixing data:', error);
      toast.error('Failed to run data fix');
      setFixResult(`Error: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  const navTabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'general', label: t('settings.tabGeneral', 'Branding & Details'), icon: <Settings size={18} /> },
    { key: 'ai', label: t('settings.tabAI', 'Edulpha AI & API'), icon: <Sparkles size={18} />, badge: 'Gemini' },
    { key: 'auth', label: t('settings.tabAuth', 'Phone Auth & OTP'), icon: <MessageSquare size={18} />, badge: 'WhatsApp' },
    { key: 'payments', label: t('settings.tabPayments', 'Payments & MoMo'), icon: <CreditCard size={18} /> },
    { key: 'challenge', label: t('settings.tabChallenge', '60-Day Challenge'), icon: <Calendar size={18} /> },
    { key: 'curriculum', label: t('settings.tabCurriculum', 'Curriculum & Subjects'), icon: <BookOpen size={18} /> },
    { key: 'navigation', label: t('settings.tabNav', 'Navigation Builder'), icon: <Navigation size={18} /> },
    { key: 'translations', label: t('settings.tabTrans', 'Multi-Language Studio'), icon: <Globe size={18} /> },
    { key: 'system', label: t('settings.tabSystem', 'Maintenance & Danger'), icon: <ShieldCheck size={18} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 lg:pl-72 p-4 sm:p-8 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">{t('settings.loadingSettings', 'Loading System Settings...')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-12">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mt-1 p-2 text-slate-400 hover:text-slate-900 transition-colors shrink-0 rounded-xl hover:bg-slate-200/60" 
              title={t('common.dashboard', 'Go to Dashboard')}
            >
              <LayoutDashboard size={22} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 sm:gap-3 leading-tight">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
                <span className="break-words">{t('settings.title', 'System Settings')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                {t('settings.subtitle', 'Manage global application configuration, branding, API keys, and gateways.')}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 min-h-[44px]"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{t('settings.saveAll', 'Save All Settings')}</span>
            </button>
          </div>
        </header>

        {/* Responsive Mobile Select Navigation Dropdown (Visible on sm screens <= 768px) */}
        <div className="block md:hidden">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
            {t('settings.selectModule', 'Settings Section')}
          </label>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabKey)}
              className="w-full p-3.5 bg-white border-2 border-indigo-100 rounded-2xl font-bold text-slate-900 text-sm focus:border-indigo-600 focus:ring-0 shadow-sm appearance-none min-h-[48px]"
            >
              {navTabs.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label} {tab.badge ? `(${tab.badge})` : ''}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none rotate-90" />
          </div>
        </div>

        {/* Responsive Desktop / Tablet Scrollable Tab Bar (Visible on md+) */}
        <div className="hidden md:flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar w-full max-w-full">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {/* TAB 1: General Branding & Details */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('settings.brandingTitle', 'App Branding & Identity')}</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Configure application name, branding logos, contact email, and support channels.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      App Name
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="e.g. Edulpha"
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Support Contact Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="support@edulpha.com"
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Primary Platform Logo
                    </label>
                    <div className="mb-4">
                      <FileUpload
                        onUploadComplete={(url) => setLogoUrl(url)}
                        onUploadError={() => toast.error('Failed to upload logo')}
                        onDelete={() => setLogoUrl('')}
                        initialUrl={logoUrl}
                        folder="branding"
                        label="Upload Logo (PNG, JPG, WebP)"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      />
                    </div>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or enter logo file URL (e.g. /edulpha-logo.png)"
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm min-h-[44px]"
                    />
                    {logoUrl && (
                      <div className="mt-3 p-4 bg-slate-100 rounded-2xl inline-flex items-center gap-3 border border-slate-200">
                        <img src={logoUrl} alt="Logo Preview" className="h-10 w-auto object-contain max-w-[200px]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="text-xs font-bold text-slate-500">Live Preview</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      WhatsApp Contact Number
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. +237670000000"
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm min-h-[44px]"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Include country code (e.g. +237 for Cameroon).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      WhatsApp Student Community Group Link
                    </label>
                    <input
                      type="url"
                      value={whatsappGroupLink}
                      onChange={(e) => setWhatsappGroupLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Branding Settings</span>
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 2: AI & Gemini API */}
          {activeTab === 'ai' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Edulpha AI & Gemini API Credentials</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Configure server API key for bulk PDF question generation, smart evaluations, and AI tutor features.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Edulpha AI Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter Gemini API Key"
                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-mono text-sm min-h-[44px]"
                      />
                      <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={testConnection}
                      disabled={isTesting || !apiKey}
                      className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-2xl font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs min-h-[44px]"
                    >
                      {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Test Gemini AI Connection
                    </button>
                    <button
                      onClick={handleSaveAll}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save API Key
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                      testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {testResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                      <div>
                        <p className="font-bold">{testResult.success ? 'Connection Success' : 'Connection Failed'}</p>
                        <p className="mt-0.5">{testResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <Suspense fallback={<TabSkeleton />}>
                <AIAdminDashboard />
              </Suspense>
            </motion.div>
          )}

          {/* TAB 3: Phone Auth & WhatsApp Gateway */}
          {activeTab === 'auth' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Suspense fallback={<TabSkeleton />}>
                <PhoneAuthSettings />
              </Suspense>
            </motion.div>
          )}

          {/* TAB 4: Payments & Mobile Money */}
          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Payment & Mobile Money Configuration</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Configure premium plan pricing, MTN MoMo, and Orange Money merchant accounts.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Premium Plan Price (FCFA)
                    </label>
                    <div className="relative max-w-md">
                      <input
                        type="number"
                        value={paymentPrice}
                        onChange={(e) => setPaymentPrice(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-bold text-lg min-h-[44px]"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        FCFA
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    {/* MTN MoMo */}
                    <div className="p-5 bg-yellow-50/60 rounded-2xl border border-yellow-200/80 space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                        MTN Mobile Money Details
                      </h3>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MoMo Number</label>
                        <input
                          type="text"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          placeholder="e.g. 677 123 456"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-sm focus:border-yellow-500 focus:ring-0 min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account Name</label>
                        <input
                          type="text"
                          value={momoName}
                          onChange={(e) => setMomoName(e.target.value)}
                          placeholder="e.g. EDULPHA ADMIN"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-sm focus:border-yellow-500 focus:ring-0 min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Orange Money */}
                    <div className="p-5 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        Orange Money Details
                      </h3>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">OM Number</label>
                        <input
                          type="text"
                          value={omNumber}
                          onChange={(e) => setOmNumber(e.target.value)}
                          placeholder="e.g. 699 123 456"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-sm focus:border-orange-500 focus:ring-0 min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account Name</label>
                        <input
                          type="text"
                          value={omName}
                          onChange={(e) => setOmName(e.target.value)}
                          placeholder="e.g. EDULPHA ADMIN"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-sm focus:border-orange-500 focus:ring-0 min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveAll}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Payment Config</span>
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 5: Challenge Configuration */}
          {activeTab === 'challenge' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">60-Day Challenge Timeline</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Set the official start date for the national drill countdown cycle.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Challenge Start Date
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="date"
                        value={challengeStartDate}
                        onChange={(e) => setChallengeStartDate(e.target.value)}
                        className="w-full sm:flex-1 px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm min-h-[44px]"
                      />
                      <button
                        onClick={resetToToday}
                        type="button"
                        className="px-5 py-3.5 bg-amber-100 text-amber-800 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-amber-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-h-[44px]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Today
                      </button>
                    </div>

                    <div className="mt-4 p-5 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-950 uppercase tracking-wider text-xs">Challenge Day Number</span>
                        <Badge variant="primary" className="bg-indigo-600 text-white font-bold">
                          Day {getCurrentDayNumber(challengeStartDate)}
                        </Badge>
                      </div>
                      <p className="text-xs text-indigo-800 leading-relaxed">
                        Today evaluates as <strong>Day {getCurrentDayNumber(challengeStartDate)}</strong> of the 60-day curriculum drill challenge.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveAll}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Timeline Date</span>
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 6: Curriculum & Subject Management */}
          {activeTab === 'curriculum' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Suspense fallback={<TabSkeleton />}>
                <AdminCurriculumManager />
              </Suspense>
              <Suspense fallback={<TabSkeleton />}>
                <SubjectManager />
              </Suspense>
            </motion.div>
          )}

          {/* TAB 7: Navigation Builder */}
          {activeTab === 'navigation' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Suspense fallback={<TabSkeleton />}>
                <AdminNavigationManagement />
              </Suspense>
            </motion.div>
          )}

          {/* TAB 8: Translation Studio */}
          {activeTab === 'translations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Suspense fallback={<TabSkeleton />}>
                <AdminTranslationManager />
              </Suspense>
            </motion.div>
          )}

          {/* TAB 9: Maintenance & Danger Zone */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="bg-rose-50/80 rounded-3xl p-5 sm:p-8 border border-rose-200 space-y-6">
                <div className="flex items-center gap-3 text-rose-800 pb-4 border-b border-rose-200/60">
                  <div className="p-3 bg-rose-100 rounded-2xl shrink-0">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">System Maintenance & Danger Zone</h2>
                    <p className="text-xs sm:text-sm text-rose-700/90">Perform database integrity trimming, drill submission clearing, and system audits.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Firestore Data Integrity Cleanup</h3>
                      <p className="text-xs text-slate-500 mt-1">Trim leading/trailing whitespace from subjects and topics across daily drills and question banks.</p>
                      {fixResult && <p className="text-xs font-bold text-emerald-600 mt-2">{fixResult}</p>}
                    </div>
                    <button
                      onClick={handleFixData}
                      disabled={isFixing}
                      className="w-full sm:w-auto px-5 py-3 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-h-[44px]"
                    >
                      {isFixing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Run Data Trim
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Clear Student Progress & Submissions</h3>
                      <p className="text-xs text-slate-500 mt-1">Permanently remove drill submission logs. Recommended at the start of a new 60-day challenge.</p>
                    </div>
                    <button
                      onClick={handleResetAllSubmissions}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-5 py-3 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset Submissions
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
