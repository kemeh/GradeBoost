import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Activity, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Users,
  Lock,
  Loader2
} from 'lucide-react';
import { AISettings, AIUsageLog } from '../../types';
import { fetchAISettings, saveAISettings } from '../../services/aiService';

export const AIAdminDashboard: React.FC = () => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await fetchAISettings();
    setSettings(s);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await saveAISettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save AI Settings error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
        <Loader2 size={20} className="animate-spin text-indigo-600" />
        <span>Loading AI System Configuration...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Edulpha AI Administration & Moderation</h2>
            <p className="text-xs text-indigo-200">
              Configure system prompts, provider selection, student rate-limits, and monitor token usage logs
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Saved Successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-8">
        {/* Toggle AI & Provider Config */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Service Status</label>
              <input 
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-500">
              Master switch to enable or disable AI assistant across student and teacher dashboards.
            </p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">AI Provider Engine</label>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="custom">Custom Provider Endpoint</option>
            </select>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Daily Student Request Limit</label>
            <input 
              type="number"
              value={settings.dailyLimitPerUser}
              onChange={(e) => setSettings({ ...settings, dailyLimitPerUser: Number(e.target.value) })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="text-[11px] text-slate-400">Prevents API quota depletion per user per day.</span>
          </div>
        </div>

        {/* System Prompt Configuration */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> Global System Prompts
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">AI Tutor Base System Instruction</label>
              <textarea
                rows={3}
                value={settings.systemPromptTutor}
                onChange={(e) => setSettings({ ...settings, systemPromptTutor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">AI Quiz Generator Instruction</label>
              <textarea
                rows={3}
                value={settings.systemPromptQuiz}
                onChange={(e) => setSettings({ ...settings, systemPromptQuiz: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">AI Programming Assistant Instruction</label>
              <textarea
                rows={3}
                value={settings.systemPromptCode}
                onChange={(e) => setSettings({ ...settings, systemPromptCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Analytics & Tokens Overview */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" /> System Usage & Token Analytics
            </h4>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-mono">
              Status: Healthy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-2xl font-black text-amber-400">12,450</span>
              <span className="block text-[11px] text-slate-400 mt-1">Total AI Prompts Served</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-2xl font-black text-indigo-400">1.8M</span>
              <span className="block text-[11px] text-slate-400 mt-1">Estimated Tokens Processed</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-2xl font-black text-emerald-400">99.4%</span>
              <span className="block text-[11px] text-slate-400 mt-1">API Request Success Rate</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Saving AI Settings...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save AI Configuration</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
