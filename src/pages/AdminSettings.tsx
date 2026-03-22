import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Key, Save, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

export default function AdminSettings() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
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

    setIsSaving(true);
    try {
      await updateSystemSettings(apiKey.trim(), user?.uid || 'unknown');
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
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
                <p className="mt-2 text-xs text-slate-400">
                  This key is stored securely in Firestore and is only accessible by administrators.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Settings
                </button>

                <button
                  onClick={testConnection}
                  disabled={isTesting || !apiKey}
                  className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isTesting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
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
    </div>
  );
}
