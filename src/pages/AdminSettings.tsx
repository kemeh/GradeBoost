import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings, Key, Save, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, Calendar, RotateCcw, CreditCard, Trash2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/dateUtils';
import { DEFAULT_CHALLENGE_START_DATE, getCurrentDayNumber } from '../utils/challenge';
import SubjectManager from '../components/SubjectManager';
import { Badge, Button } from '../components/ui';

import FileUpload from '../components/FileUpload';
import { AIAdminDashboard } from '../components/GradeBoostAI/AIAdminDashboard';
import { AdminCurriculumManager } from '../components/AdminCurriculumManager';
import { AdminTranslationManager } from '../components/AdminTranslationManager';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSettings } = useSettings();
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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const settings = await getSystemSettings();
      if (settings) {
        setApiKey(settings.geminiApiKey);
        if (settings.challengeStartDate) {
          setChallengeStartDate(settings.challengeStartDate);
        }
        if (settings.paymentPrice !== undefined) {
          setPaymentPrice(settings.paymentPrice);
        }
        if (settings.appName) {
          setAppName(settings.appName);
        }
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
        if (settings.contactEmail) {
          setContactEmail(settings.contactEmail);
        }
        if (settings.whatsappNumber) {
          setWhatsappNumber(settings.whatsappNumber);
        }
        if (settings.whatsappGroupLink) {
          setWhatsappGroupLink(settings.whatsappGroupLink);
        }
        if (settings.momoNumber) {
          setMomoNumber(settings.momoNumber);
        }
        if (settings.momoName) {
          setMomoName(settings.momoName);
        }
        if (settings.omNumber) {
          setOmNumber(settings.omNumber);
        }
        if (settings.omName) {
          setOmName(settings.omName);
        }
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('API Key cannot be empty');
      return;
    }

    if (!challengeStartDate) {
      toast.error('Challenge Start Date cannot be empty');
      return;
    }

    if (paymentPrice < 0) {
      toast.error('Payment Price cannot be negative');
      return;
    }

    if (!appName.trim()) {
      toast.error('App Name cannot be empty');
      return;
    }

    if (!logoUrl.trim()) {
      toast.error('Logo URL cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateSystemSettings(
        apiKey.trim(), 
        challengeStartDate, 
        paymentPrice, 
        appName.trim(),
        logoUrl.trim(),
        contactEmail.trim(),
        whatsappNumber.trim(),
        whatsappGroupLink.trim(),
        momoNumber.trim(),
        momoName.trim(),
        omNumber.trim(),
        omName.trim(),
        user?.uid || 'unknown'
      );
      await refreshSettings();
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    setChallengeStartDate(today);
    toast.success('Start date set to today. Remember to save!');
  };

  const handleResetAllSubmissions = async () => {
    if (!window.confirm('CRITICAL: This will delete ALL student submissions for ALL drills. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    setIsSaving(true);
    try {
      const submissionsSnap = await getDocs(collection(db, 'drill_submissions'));
      const batch = writeBatch(db);
      
      submissionsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      toast.success(`Successfully cleared ${submissionsSnap.size} submissions`);
    } catch (error) {
      console.error('Error resetting submissions:', error);
      toast.error('Failed to reset submissions');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const genAI = new GoogleGenAI({ apiKey: apiKey.trim() });
      const model = genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: 'Hello, are you working?',
      });
      const response = await model;
      if (response.text) {
        setTestResult({ success: true, message: 'Connection successful! Gemini is responding.' });
        toast.success('Gemini connection test passed!');
      } else {
        throw new Error('Empty response from Gemini');
      }
    } catch (error: any) {
      console.error('Gemini test error:', error);
      setTestResult({ 
        success: false, 
        message: `Connection failed: ${error.message || 'Unknown error'}` 
      });
      toast.error('Gemini connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleFixData = async () => {
    if (!window.confirm('This will trim all subject and topic fields in daily_drills, exam_questions, and subjects collections. This helps fix display issues. Continue?')) {
      return;
    }

    setIsFixing(true);
    setFixResult(null);
    try {
      let totalFixed = 0;

      // 1. Fix Subjects
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const subjectBatch = writeBatch(db);
      subjectsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name !== data.name.trim()) {
          subjectBatch.update(doc.ref, { name: data.name.trim() });
          totalFixed++;
        }
      });
      await subjectBatch.commit();

      // 2. Fix Daily Drills
      const drillsSnap = await getDocs(collection(db, 'daily_drills'));
      const drillBatch = writeBatch(db);
      drillsSnap.docs.forEach(doc => {
        const data = doc.data();
        const updates: any = {};
        if (data.subject && data.subject !== data.subject.trim()) {
          updates.subject = data.subject.trim();
        }
        if (data.topic && data.topic !== data.topic.trim()) {
          updates.topic = data.topic.trim();
        }
        if (data.day !== undefined && typeof data.day !== 'number') {
          const dayNum = parseInt(data.day);
          if (!isNaN(dayNum)) {
            updates.day = dayNum;
          }
        }
        if (Object.keys(updates).length > 0) {
          drillBatch.update(doc.ref, updates);
          totalFixed++;
        }
      });
      await drillBatch.commit();

      // 3. Fix Exam Questions
      const questionsSnap = await getDocs(collection(db, 'exam_questions'));
      // Firestore batches are limited to 500 operations. For questions, we might need multiple batches.
      let questionBatch = writeBatch(db);
      let count = 0;
      for (const doc of questionsSnap.docs) {
        const data = doc.data();
        const updates: any = {};
        if (data.subject && data.subject !== data.subject.trim()) {
          updates.subject = data.subject.trim();
        }
        if (data.topic && data.topic !== data.topic.trim()) {
          updates.topic = data.topic.trim();
        }
        
        if (Object.keys(updates).length > 0) {
          questionBatch.update(doc.ref, updates);
          totalFixed++;
          count++;
          
          if (count >= 400) {
            await questionBatch.commit();
            questionBatch = writeBatch(db);
            count = 0;
          }
        }
      }
      if (count > 0) {
        await questionBatch.commit();
      }

      // 4. Fix Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const userBatch = writeBatch(db);
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.subject && data.subject !== data.subject.trim()) {
          userBatch.update(doc.ref, { subject: data.subject.trim() });
          totalFixed++;
        }
      });
      await userBatch.commit();

      setFixResult(`Successfully fixed ${totalFixed} records.`);
      toast.success(`Fixed ${totalFixed} records!`);
    } catch (error: any) {
      console.error('Error fixing data:', error);
      toast.error('Failed to fix data');
      setFixResult(`Error: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-4 md:p-8 pt-24 lg:pt-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Go to Dashboard">
                <LayoutDashboard size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <Settings className="w-8 h-8 text-indigo-600" />
                  System Settings
                </h1>
                <p className="text-slate-500 font-medium">Manage global application configuration and API keys.</p>
              </div>
            </div>
          </header>

          <div className="grid gap-8">
            {/* API Configuration Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Key className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Gemini AI Configuration</h2>
                  <p className="text-sm text-slate-500">Configure the API key used for automated question generation and feedback.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API Key"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-mono text-sm"
                    />
                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={testConnection}
                    disabled={isTesting || !apiKey}
                    className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Test Gemini Connection
                  </button>
                </div>

                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl flex items-start gap-3 ${
                      testResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">{testResult.success ? 'Success' : 'Error'}</p>
                      <p className="text-sm opacity-90">{testResult.message}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.section>

            {/* Multi-Curriculum Management System */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 }}
            >
              <AdminCurriculumManager />
            </motion.section>

            {/* Multi-Language & Translation Studio */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.025 }}
            >
              <AdminTranslationManager />
            </motion.section>

            {/* Edulpha AI System Configuration & Moderation */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 }}
            >
              <AIAdminDashboard />
            </motion.section>

            {/* App Branding & Details Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">App Branding & Details</h2>
                  <p className="text-sm text-slate-500">Configure the application name, logo, and contact information.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Edulpha"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    App Logo
                  </label>
                  <div className="mb-4">
                    <FileUpload
                      onUploadComplete={(url) => setLogoUrl(url)}
                      onUploadError={() => toast.error('Failed to upload logo')}
                      onDelete={() => setLogoUrl('')}
                      initialUrl={logoUrl}
                      folder="branding"
                      label="Upload Logo Image"
                      accept="image/*"
                    />
                  </div>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Or enter logo URL (e.g. /logo.svg or https://...)"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  />
                  {logoUrl && (
                    <div className="mt-4 p-4 bg-slate-100 rounded-xl inline-block">
                      <img src={logoUrl} alt="Logo Preview" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. support@example.com"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. +237600000000"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  />
                  <p className="mt-2 text-xs text-slate-400">Include country code (e.g., +237 for Cameroon).</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    WhatsApp Group Link
                  </label>
                  <input
                    type="url"
                    value={whatsappGroupLink}
                    onChange={(e) => setWhatsappGroupLink(e.target.value)}
                    placeholder="e.g. https://chat.whatsapp.com/..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  />
                </div>
              </div>
            </motion.section>

            {/* Challenge Configuration Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Challenge Configuration</h2>
                  <p className="text-sm text-slate-500">Manage the 60-day challenge timeline and start date.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Challenge Start Date
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <input
                        type="date"
                        value={challengeStartDate}
                        onChange={(e) => setChallengeStartDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={resetToToday}
                      className="px-6 py-4 bg-amber-100 text-amber-700 rounded-2xl font-bold uppercase tracking-wider hover:bg-amber-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset to Today
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-indigo-900 uppercase tracking-wider text-xs">Current Challenge Status</span>
                      <Badge variant="primary" className="bg-indigo-600 text-white">Day {getCurrentDayNumber(challengeStartDate)}</Badge>
                    </div>
                    <span className="text-indigo-700 font-medium">
                      Based on this start date, today is <strong>Day {getCurrentDayNumber(challengeStartDate)}</strong>. 
                      Students will only see drills assigned to this specific day number.
                    </span>
                    <br />
                    <span className="text-indigo-400 text-[10px] mt-2 block">
                      Changing this will affect which daily drill is active for all students.
                    </span>
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Subject Management Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <SubjectManager />
            </motion.section>

            {/* Payment Configuration Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Payment Configuration</h2>
                  <p className="text-sm text-slate-500">Manage the price for the premium plan.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Premium Plan Price (FCFA)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={paymentPrice}
                      onChange={(e) => setPaymentPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-bold text-lg"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      FCFA
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    This price will be displayed to all students on the payment page.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      MTN MoMo Details
                    </h3>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">MoMo Number</label>
                      <input
                        type="text"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="e.g. 677 123 456"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Name</label>
                      <input
                        type="text"
                        value={momoName}
                        onChange={(e) => setMomoName(e.target.value)}
                        placeholder="e.g. JOHN DOE"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Orange Money Details
                    </h3>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">OM Number</label>
                      <input
                        type="text"
                        value={omNumber}
                        onChange={(e) => setOmNumber(e.target.value)}
                        placeholder="e.g. 699 123 456"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Name</label>
                      <input
                        type="text"
                        value={omName}
                        onChange={(e) => setOmName(e.target.value)}
                        placeholder="e.g. JOHN DOE"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Danger Zone Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-rose-50 rounded-3xl p-8 border border-rose-200 space-y-6"
            >
              <div className="flex items-center gap-3 text-rose-700">
                <div className="p-3 bg-rose-100 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Danger Zone</h2>
                  <p className="text-sm opacity-80">Highly destructive or maintenance actions. Use with extreme caution.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900">Data Integrity Fix</h3>
                  <p className="text-sm text-slate-500">Trim all subject and topic fields in Firestore. This fixes issues where drills don't show due to trailing spaces.</p>
                  {fixResult && <p className="text-xs font-bold text-emerald-600 mt-2">{fixResult}</p>}
                </div>
                <button
                  onClick={handleFixData}
                  disabled={isFixing}
                  className="px-6 py-4 bg-amber-600 text-white rounded-2xl font-bold uppercase tracking-wider hover:bg-amber-700 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  {isFixing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Fix Data Integrity
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900">Reset All Student Progress</h3>
                  <p className="text-sm text-slate-500">Delete all student submissions for all daily drills. This is usually done at the start of a new 60-day cycle.</p>
                </div>
                <button
                  onClick={handleResetAllSubmissions}
                  disabled={isSaving}
                  className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-wider hover:bg-rose-700 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Reset All Submissions
                </button>
              </div>
            </motion.section>

            {/* Save Button Section */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-indigo-200 text-lg"
              >
                {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Save All Settings
              </button>
            </div>

            {/* Info Section */}
            <section className="bg-slate-100 rounded-3xl p-8 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Important Information
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">•</span>
                  The Gemini API key is required for bulk importing questions from PDFs and generating automated student feedback.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">•</span>
                  Ensure your API key has access to the <strong>gemini-flash-latest</strong> model.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">•</span>
                  If the key is missing or invalid, bulk import features will be disabled for all administrators.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
