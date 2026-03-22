import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Key, Save, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, Calendar, RotateCcw, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/dateUtils';
import { DEFAULT_CHALLENGE_START_DATE, getCurrentDayNumber } from '../utils/challenge';

export default function AdminSettings() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [challengeStartDate, setChallengeStartDate] = useState(DEFAULT_CHALLENGE_START_DATE);
  const [paymentPrice, setPaymentPrice] = useState(1000);
  const [appName, setAppName] = useState('GradeBoost 60');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [contactEmail, setContactEmail] = useState('support@gradeboost60.com');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
        user?.uid || 'unknown'
      );
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setChallengeStartDate(today);
    toast.success('Start date set to today. Remember to save!');
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
        model: 'gemini-3-flash-preview',
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
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <Settings className="w-8 h-8 text-indigo-600" />
                System Settings
              </h1>
              <p className="text-slate-500 font-medium">Manage global application configuration and API keys.</p>
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
                    placeholder="e.g. GradeBoost 60"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="e.g. /logo.svg or https://..."
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
                  <p className="mt-3 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <strong>Current Day:</strong> {getCurrentDayNumber(challengeStartDate)} / 60
                    <br />
                    Changing this will affect which daily drill is active for all students.
                  </p>
                </div>
              </div>
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
                  Ensure your API key has access to the <strong>gemini-3-flash-preview</strong> model.
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
