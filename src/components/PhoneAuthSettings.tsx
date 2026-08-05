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
  Settings2,
  Radio,
  MessageSquare,
  ArrowRightLeft,
  History,
  Activity,
  Filter
} from 'lucide-react';
import { PhoneAuthConfig } from '../types';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { SmsService } from '../services/smsService';
import { formatPhoneNumber } from '../services/phoneAuthService';
import { OtpService } from '../services/otp/otpService';
import { OtpLogRecord } from '../services/otp/types';
import { toast } from 'react-hot-toast';

export const PhoneAuthSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');
  const [config, setConfig] = useState<PhoneAuthConfig>({
    phoneAuthRequired: true,
    emailAuthRequired: false,
    otpLength: 6,
    otpExpiryMinutes: 5,
    maxResendAttempts: 3,
    maxVerificationAttempts: 5,
    
    primaryChannel: 'whatsapp',
    enableWhatsapp: true,
    enableSmsFallback: true,

    whatsappProvider: 'simulation',
    whatsappApiKey: '',
    whatsappPhoneNumberId: '',
    whatsappSenderNumber: '',
    whatsappTemplateName: 'edulpha_otp_verification',

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
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; simulatedOtp?: string; channel?: string } | null>(null);

  // OTP Logs State
  const [logs, setLogs] = useState<OtpLogRecord[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilterChannel, setLogFilterChannel] = useState<'all' | 'whatsapp' | 'sms'>('all');

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

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const fetchedLogs = await OtpService.getRecentLogs(50);
      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Error fetching OTP logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentSettings = await getSystemSettings();
      await updateSystemSettings({
        ...currentSettings,
        phoneAuthConfig: config
      });
      toast.success('WhatsApp & SMS OTP provider settings updated successfully!');
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
          channel: 'sms',
          message: `SMS test successful! Delivered via ${config.smsProvider.toUpperCase()}.`,
          simulatedOtp: res.simulatedOtp
        });
        toast.success(`SMS test sent to ${formatted}`);
      } else {
        setTestResult({
          success: false,
          channel: 'sms',
          message: res.error || 'Failed to dispatch test SMS'
        });
        toast.error('SMS Test Failed');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        channel: 'sms',
        message: err.message || 'Error executing test SMS'
      });
      toast.error('SMS Test Failed');
    } finally {
      setIsTestingSms(false);
    }
  };

  const handleTestWhatsapp = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a test phone number');
      return;
    }

    const formatted = formatPhoneNumber(testPhone);
    setIsTestingWhatsapp(true);
    setTestResult(null);

    try {
      const testOtp = '654321';
      const res = await OtpService.sendOtpWithFallback(formatted, testOtp, config, 'en', 'whatsapp');
      if (res.success) {
        setTestResult({
          success: true,
          channel: res.channel,
          message: res.fallbackTriggered 
            ? `WhatsApp failed; SMS Fallback delivered successfully via ${res.provider.toUpperCase()}!`
            : `WhatsApp OTP test successful! Delivered via ${res.provider.toUpperCase()}.`,
          simulatedOtp: res.simulatedOtp
        });
        toast.success(`WhatsApp OTP test sent to ${formatted}`);
      } else {
        setTestResult({
          success: false,
          channel: 'whatsapp',
          message: res.error || 'WhatsApp OTP Test Failed'
        });
        toast.error('WhatsApp Test Failed');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        channel: 'whatsapp',
        message: err.message || 'Error executing WhatsApp OTP test'
      });
      toast.error('WhatsApp Test Failed');
    } finally {
      setIsTestingWhatsapp(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilterChannel === 'all') return true;
    return l.channel === logFilterChannel;
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading WhatsApp & SMS Configuration...</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Primary Phone Auth & WhatsApp OTP Gateway Settings
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Manage WhatsApp primary verification, SMS fallback channels, gateway tokens, rate limits, and live security audit logs.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 size={14} />
            Gateway Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={14} />
            OTP Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'config' ? (
        <div className="space-y-8">
          {/* Channel Strategy Summary Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-900 to-indigo-950 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-300 uppercase tracking-wider">
                <ArrowRightLeft size={16} />
                WhatsApp Primary + Automatic SMS Fallback Strategy
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                When students register or reset passwords, Edulpha sends an OTP code via WhatsApp first. If WhatsApp fails or recipient is offline, the system automatically falls back to SMS OTP seamlessly.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs rounded-full">
                WhatsApp Active
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold text-xs rounded-full">
                SMS Fallback Ready
              </span>
            </div>
          </div>

          {/* Core Auth & Channel Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Require Phone Verification</h4>
                <p className="text-xs text-slate-500 mt-1">
                  New users must register with a mobile number (MTN / Orange) and verify OTP.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.phoneAuthRequired}
                  onChange={(e) => setConfig({ ...config, phoneAuthRequired: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Enable WhatsApp OTP (Primary)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Deliver OTP codes directly to WhatsApp accounts for higher delivery rate.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.enableWhatsapp !== false}
                  onChange={(e) => setConfig({ ...config, enableWhatsapp: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Enable SMS Fallback</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Automatically switch to SMS if WhatsApp message delivery fails.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.enableSmsFallback !== false}
                  onChange={(e) => setConfig({ ...config, enableSmsFallback: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* OTP Security Parameters */}
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

          {/* WhatsApp Gateway Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Primary WhatsApp Gateway Provider
            </h3>
            <p className="text-xs text-slate-500">
              Select your WhatsApp Cloud provider. For local testing or development previews, select Sandbox Simulation.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'simulation', name: 'Sandbox Simulation', badge: 'Dev & Preview Recommended' },
                { id: 'meta_cloud', name: 'Meta Cloud API', badge: 'Official Meta' },
                { id: 'twilio_whatsapp', name: 'Twilio WhatsApp', badge: 'Twilio Gateway' },
                { id: 'ultramsg', name: 'UltraMsg Gateway', badge: 'Instance API' }
              ].map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setConfig({ ...config, whatsappProvider: provider.id as any })}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    (config.whatsappProvider || 'simulation') === provider.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{provider.name}</span>
                    {(config.whatsappProvider || 'simulation') === provider.id && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {provider.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* WhatsApp Credentials */}
            {(config.whatsappProvider || 'simulation') !== 'simulation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-4"
              >
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  {config.whatsappProvider?.toUpperCase()} Credentials
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      API Access Token / Key
                    </label>
                    <input
                      type="password"
                      value={config.whatsappApiKey || ''}
                      onChange={(e) => setConfig({ ...config, whatsappApiKey: e.target.value })}
                      placeholder="Bearer Token or Key"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-emerald-500 focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number ID / Instance ID
                    </label>
                    <input
                      type="text"
                      value={config.whatsappPhoneNumberId || ''}
                      onChange={(e) => setConfig({ ...config, whatsappPhoneNumberId: e.target.value })}
                      placeholder="e.g. 1045928491849"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-emerald-500 focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender WhatsApp Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={config.whatsappSenderNumber || ''}
                      onChange={(e) => setConfig({ ...config, whatsappSenderNumber: e.target.value })}
                      placeholder="+14155238886"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-emerald-500 focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Template Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={config.whatsappTemplateName || 'edulpha_otp_verification'}
                      onChange={(e) => setConfig({ ...config, whatsappTemplateName: e.target.value })}
                      placeholder="edulpha_otp_verification"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-emerald-500 focus:ring-0"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* SMS Gateway Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600" />
              Fallback SMS Gateway Provider
            </h3>
            <p className="text-xs text-slate-500">
              Select the fallback SMS gateway to dispatch OTP messages when WhatsApp is un-reachable or SMS is explicitly requested.
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
          </div>

          {/* Live Dual Channel Tester */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Test OTP Channels & Gateway Connections
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+237670000000"
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm focus:border-indigo-600 focus:ring-0"
              />

              <button
                type="button"
                onClick={handleTestWhatsapp}
                disabled={isTestingWhatsapp}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {isTestingWhatsapp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Test WhatsApp OTP
              </button>

              <button
                type="button"
                onClick={handleTestSms}
                disabled={isTestingSms}
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {isTestingSms ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Test SMS OTP
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
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save WhatsApp & SMS Configuration
            </button>
          </div>
        </div>
      ) : (
        /* OTP Audit Logs View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">OTP Dispatch & Verification Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Real-time security logs of all OTP delivery attempts, channels used (WhatsApp vs SMS), fallback events, and verification statuses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
                <Filter size={14} className="text-slate-500" />
                <select
                  value={logFilterChannel}
                  onChange={(e) => setLogFilterChannel(e.target.value as any)}
                  className="bg-transparent border-none focus:ring-0 text-slate-800 font-bold"
                >
                  <option value="all">All Channels</option>
                  <option value="whatsapp">WhatsApp Only</option>
                  <option value="sms">SMS Only</option>
                </select>
              </div>

              <button
                type="button"
                onClick={fetchLogs}
                disabled={isLoadingLogs}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
                title="Refresh Logs"
              >
                <RefreshCw size={16} className={isLoadingLogs ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {isLoadingLogs ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading security audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No OTP logs recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Dispatch test OTPs above or attempt registration to populate live audit logs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Channel Used</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Fallback Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-slate-900">
                        {log.phone}
                      </td>
                      <td className="px-4 py-3">
                        {log.channel === 'whatsapp' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[10px]">
                            <MessageSquare size={12} className="text-emerald-600" />
                            WhatsApp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-900 font-bold rounded-full text-[10px]">
                            <Smartphone size={12} className="text-indigo-600" />
                            SMS
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 uppercase text-[11px]">
                        {log.provider}
                      </td>
                      <td className="px-4 py-3">
                        {log.status === 'delivered' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                            Delivered
                          </span>
                        )}
                        {log.status === 'fallback_triggered' && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded border border-amber-200">
                            Fallback Triggered
                          </span>
                        )}
                        {log.status === 'failed' && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded border border-rose-200">
                            Failed
                          </span>
                        )}
                        {log.status === 'sent' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                            Sent
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {log.fallbackTriggered ? (
                          <span className="text-amber-800 font-medium">
                            {log.fallbackReason || 'Switched from WhatsApp to SMS'}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PhoneAuthSettings;
