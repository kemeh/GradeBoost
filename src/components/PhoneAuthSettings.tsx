import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  ShieldCheck, 
  Send, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Globe, 
  Settings2,
  Radio
} from 'lucide-react';
import { PhoneAuthConfig } from '../types';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { SmsService } from '../services/smsService';
import { formatPhoneNumber } from '../services/phoneAuthService';
import { toast } from 'react-hot-toast';

export const PhoneAuthSettings: React.FC = () => {
  const [config, setConfig] = useState<PhoneAuthConfig>({
    phoneAuthRequired: true,
    emailAuthRequired: false,
    otpLength: 6,
    otpExpiryMinutes: 5,
    maxResendAttempts: 3,
    maxVerificationAttempts: 5,
    smsProvider: 'simulation',
    smsApiKey: '',
    smsApiSecret: '',
    smsSenderId: 'Edulpha',
    smsCustomEndpoint: '',
    enablePasswordlessLogin: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('+237670000000');
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; simulatedOtp?: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      const settings = await getSystemSettings();
      if (settings && settings.phoneAuthConfig) {
        setConfig((prev) => ({ ...prev, ...settings.phoneAuthConfig }));
      }
      setIsLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentSettings = await getSystemSettings();
      await updateSystemSettings({
        ...currentSettings,
        phoneAuthConfig: config
      });
      toast.success('Phone authentication & SMS provider settings updated!');
    } catch (err: any) {
      toast.error('Failed to save phone authentication settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a test phone number');
      return;
    }

    const formatted = formatPhoneNumber(testPhone);
    setIsTestingSms(true);
    setTestResult(null);

    try {
      const testOtp = '123456';
      const res = await SmsService.sendOtp(formatted, testOtp, config, 'en');
      if (res.success) {
        setTestResult({
          success: true,
          message: `SMS test successful! Delivered via ${config.smsProvider.toUpperCase()}.`,
          simulatedOtp: res.simulatedOtp
        });
        toast.success(`SMS test sent to ${formatted}`);
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Failed to dispatch test SMS'
        });
        toast.error('SMS Test Failed');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error executing test SMS'
      });
      toast.error('SMS Test Failed');
    } finally {
      setIsTestingSms(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading SMS & Auth Configuration...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Primary Phone Authentication & SMS Gateway Settings
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Configure phone verification requirements, OTP expiration limits, and SMS gateways (Twilio, Africa's Talking, Infobip, Termii, Sandbox).
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Core Auth Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Require Phone Verification for Registration</h4>
              <p className="text-xs text-slate-500 mt-1">
                New users must register with a valid mobile phone (e.g., MTN or Orange Cameroon) and verify via SMS OTP.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.phoneAuthRequired}
                onChange={(e) => setConfig({ ...config, phoneAuthRequired: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Enable Passwordless OTP Login</h4>
              <p className="text-xs text-slate-500 mt-1">
                Allows students to sign in using their phone number and a one-time SMS code without entering a password.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.enablePasswordlessLogin}
                onChange={(e) => setConfig({ ...config, enablePasswordlessLogin: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* OTP Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              OTP Code Length
            </label>
            <select
              value={config.otpLength}
              onChange={(e) => setConfig({ ...config, otpLength: parseInt(e.target.value) || 6 })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-500 focus:ring-0"
            >
              <option value={4}>4 Digits</option>
              <option value={6}>6 Digits (Standard)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              OTP Expiry (Minutes)
            </label>
            <input
              type="number"
              value={config.otpExpiryMinutes}
              onChange={(e) => setConfig({ ...config, otpExpiryMinutes: parseInt(e.target.value) || 5 })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-500 focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Max Resend Attempts / Hr
            </label>
            <input
              type="number"
              value={config.maxResendAttempts}
              onChange={(e) => setConfig({ ...config, maxResendAttempts: parseInt(e.target.value) || 3 })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-500 focus:ring-0"
            />
          </div>
        </div>

        {/* SMS Gateway Selection */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600" />
            Active SMS Gateway Provider
          </h3>
          <p className="text-xs text-slate-500">
            Select the SMS gateway to dispatch OTP messages. For development and web previews, use Sandbox / Simulation Mode.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'simulation', name: 'Sandbox / Simulation Mode', badge: 'Dev & Preview Recommended' },
              { id: 'africastalking', name: "Africa's Talking", badge: 'Cameroon & Africa' },
              { id: 'twilio', name: 'Twilio', badge: 'Global API' },
              { id: 'termii', name: 'Termii', badge: 'West Africa' },
              { id: 'infobip', name: 'Infobip', badge: 'Enterprise' },
              { id: 'custom', name: 'Custom HTTP Gateway', badge: 'REST Webhook' }
            ].map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => setConfig({ ...config, smsProvider: provider.id as any })}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  config.smsProvider === provider.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{provider.name}</span>
                  {config.smsProvider === provider.id && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  )}
                </div>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {provider.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Credential Fields */}
        {config.smsProvider !== 'simulation' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
          >
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              {config.smsProvider.toUpperCase()} Gateway Credentials
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  API Key / Account SID
                </label>
                <input
                  type="password"
                  value={config.smsApiKey}
                  onChange={(e) => setConfig({ ...config, smsApiKey: e.target.value })}
                  placeholder="Enter API Key or SID"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-indigo-500 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  API Secret / Auth Token
                </label>
                <input
                  type="password"
                  value={config.smsApiSecret}
                  onChange={(e) => setConfig({ ...config, smsApiSecret: e.target.value })}
                  placeholder="Enter API Secret"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-indigo-500 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender ID (Alphanumeric or Number)
                </label>
                <input
                  type="text"
                  value={config.smsSenderId}
                  onChange={(e) => setConfig({ ...config, smsSenderId: e.target.value })}
                  placeholder="e.g. Edulpha"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:border-indigo-500 focus:ring-0"
                />
              </div>

              {config.smsProvider === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Webhook Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={config.smsCustomEndpoint}
                    onChange={(e) => setConfig({ ...config, smsCustomEndpoint: e.target.value })}
                    placeholder="https://your-api.com/sms/send"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-indigo-500 focus:ring-0"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Live SMS Tester */}
        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
          <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Test SMS Gateway Connection
          </h4>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+237670000000"
              className="flex-1 px-4 py-3 bg-white border border-indigo-200 rounded-xl font-mono text-sm focus:border-indigo-600 focus:ring-0"
            />
            <button
              type="button"
              onClick={handleTestSms}
              disabled={isTestingSms}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {isTestingSms ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Test SMS
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div>
                <p>{testResult.message}</p>
                {testResult.simulatedOtp && (
                  <p className="mt-1 font-mono font-bold text-slate-700">Simulated Test OTP Code: {testResult.simulatedOtp}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save SMS & Phone Auth Configuration
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneAuthSettings;
