import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '../../services/settingsService';
import { Card, Button, Badge } from '../ui';
import { Settings, Key, Save, CheckCircle2, RefreshCw, CreditCard, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';
import FileUpload from '../FileUpload';
import { DEFAULT_CHALLENGE_START_DATE } from '../../utils/challenge';

export default function AdminPlatformSettingsView() {
  const [apiKey, setApiKey] = useState('');
  const [challengeStartDate, setChallengeStartDate] = useState(DEFAULT_CHALLENGE_START_DATE);
  const [paymentPrice, setPaymentPrice] = useState(1000);
  const [appName, setAppName] = useState('Edulpha');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const settings = await getSystemSettings();
    if (settings) {
      setApiKey(settings.geminiApiKey || '');
      setChallengeStartDate(settings.challengeStartDate || DEFAULT_CHALLENGE_START_DATE);
      setPaymentPrice(settings.paymentPrice || 1000);
      setAppName(settings.appName || 'Edulpha');
      setLogoUrl(settings.logoUrl || '/logo.svg');
      setContactEmail(settings.contactEmail || 'support@edulpha.com');
      setWhatsappNumber(settings.whatsappNumber || '');
      setWhatsappGroupLink(settings.whatsappGroupLink || '');
      setMomoNumber(settings.momoNumber || '677 123 456');
      setMomoName(settings.momoName || 'Admin Name');
      setOmNumber(settings.omNumber || '699 123 456');
      setOmName(settings.omName || 'Admin Name');
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSystemSettings({
        geminiApiKey: apiKey,
        challengeStartDate,
        paymentPrice,
        appName,
        logoUrl,
        contactEmail,
        whatsappNumber,
        whatsappGroupLink,
        momoNumber,
        momoName,
        omNumber,
        omName,
      });
      toast.success('Platform system settings saved!');
    } catch (err) {
      toast.error('Failed to save platform settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testGeminiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say Hello in one sentence to verify Edulpha API connection.',
      });
      if (response.text) {
        setTestResult({ success: true, message: `Success! Response: ${response.text}` });
        toast.success('Gemini API Connection Verified!');
      } else {
        setTestResult({ success: false, message: 'No text returned from Gemini.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'API Key verification failed.' });
      toast.error('API Key invalid or rate-limited.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform System Settings</h2>
        <p className="text-sm font-medium text-slate-500">
          Global branding, Gemini AI key configuration, support channels, and payment gateway details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Info */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">Application Identity & Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Application Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none" 
                value={appName} 
                onChange={e => setAppName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Support Email</label>
              <input 
                type="email" 
                required 
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none" 
                value={contactEmail} 
                onChange={e => setContactEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600">WhatsApp Support Contact Number</label>
              <input 
                type="text" 
                placeholder="e.g. +237677123456"
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none" 
                value={whatsappNumber} 
                onChange={e => setWhatsappNumber(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">WhatsApp Group Link</label>
              <input 
                type="text" 
                placeholder="https://chat.whatsapp.com/..."
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none" 
                value={whatsappGroupLink} 
                onChange={e => setWhatsappGroupLink(e.target.value)} 
              />
            </div>
          </div>
        </Card>

        {/* Gemini AI Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Google Gemini AI Credentials</h3>
            <Button type="button" variant="outline" size="sm" onClick={testGeminiKey} loading={isTesting} className="rounded-xl">
              <RefreshCw size={14} className="mr-1" /> Test AI Connection
            </Button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Gemini API Key</label>
            <input 
              type="password" 
              required 
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-mono font-bold mt-1 outline-none" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
            />
          </div>
          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-bold ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
        </Card>

        {/* Challenge Start Date */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">60-Day Challenge Countdown Start Date</h3>
          <div>
            <label className="text-xs font-bold text-slate-600">Challenge Launch Date (YYYY-MM-DD)</label>
            <input 
              type="date" 
              required 
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none" 
              value={challengeStartDate} 
              onChange={e => setChallengeStartDate(e.target.value)} 
            />
          </div>
        </Card>

        <Button type="submit" loading={isSaving} className="w-full rounded-2xl py-3 text-base">
          <Save size={18} className="mr-2" /> Save All System Settings
        </Button>
      </form>
    </div>
  );
}
