import React, { useState } from 'react';
import {
  X,
  Settings,
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  Download,
  HelpCircle,
  Info,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSetLang: (lang: 'en' | 'fr') => void;
}

export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = ({
  isOpen,
  onClose,
  simLang,
  isDarkMode,
  onToggleDarkMode,
  onSetLang,
}) => {
  const isEn = simLang === 'en';
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoDownloadOffline, setAutoDownloadOffline] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md max-h-[90vh] rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'} shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-sm">{isEn ? 'Mobile App Settings' : 'Paramètres de l\'App'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Section 1: Appearance */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">
              {isEn ? 'APPEARANCE' : 'APPARENCE'}
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                <div>
                  <h5 className="font-bold">{isEn ? 'Dark Mode Appearance' : 'Mode Sombre'}</h5>
                  <p className="text-[10px] text-slate-400">{isEn ? 'High contrast theme' : 'Thème sombre adapté'}</p>
                </div>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition ${
                  isDarkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {isDarkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>

          {/* Section 2: Notifications */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">
              {isEn ? 'NOTIFICATIONS' : 'NOTIFICATIONS'}
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-rose-500" />
                <div>
                  <h5 className="font-bold">{isEn ? 'Push Exam Reminders' : 'Rappels d\'Examens'}</h5>
                  <p className="text-[10px] text-slate-400">{isEn ? 'Daily study streak alerts' : 'Alertes quotidiennes'}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => {
                  setPushNotifications(e.target.checked);
                  toast.success(e.target.checked ? 'Notifications enabled!' : 'Notifications disabled');
                }}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Language */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">
              {isEn ? 'LANGUAGE & CURRICULUM' : 'LANGUE & PROGRAMME'}
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-blue-500" />
                <div>
                  <h5 className="font-bold">{isEn ? 'Select Language' : 'Choisir la Langue'}</h5>
                  <p className="text-[10px] text-slate-400">English (GCE) / Français (MINESEC)</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onSetLang('en')}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${simLang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => onSetLang('fr')}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${simLang === 'fr' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  FR
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Downloads & Storage */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">
              {isEn ? 'DOWNLOADS & OFFLINE' : 'STOCKAGE HORS-LIGNE'}
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Download className="h-4 w-4 text-emerald-500" />
                  <div>
                    <h5 className="font-bold">{isEn ? 'Auto-Download Notes' : 'Téléchargement Auto'}</h5>
                    <p className="text-[10px] text-slate-400">Cache PDFs on Wi-Fi</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDownloadOffline}
                  onChange={(e) => setAutoDownloadOffline(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px]">
                <span className="text-slate-400">142 MB Cached locally</span>
                <button
                  onClick={() => toast.success('Offline cache cleared successfully!')}
                  className="text-rose-500 font-bold flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="h-3 w-3" /> {isEn ? 'Clear Cache' : 'Vider le cache'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: About & Support */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">
              {isEn ? 'HELP & ABOUT' : 'AIDE & À PROPOS'}
            </h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Edulpha Mobile Version</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">v1.0.0 (Build 1042)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Architecture</span>
                <span className="text-slate-400 font-mono">Flutter / Riverpod / Isar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0F2C59] text-white rounded-xl font-bold text-xs shadow-sm hover:bg-blue-900 transition"
          >
            {isEn ? 'Done' : 'Terminer'}
          </button>
        </div>
      </div>
    </div>
  );
};
