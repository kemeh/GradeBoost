import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, Smartphone, Volume2, Vibrate, Globe, Check, Sparkles } from 'lucide-react';
import { NotificationPreference } from '../types';
import { notificationService } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreferences(notificationService.getPreferences());
    }
  }, [isOpen]);

  if (!isOpen || !preferences) return null;

  const handleToggle = (key: keyof NotificationPreference) => {
    if (typeof preferences[key] === 'boolean') {
      const updated = { ...preferences, [key]: !preferences[key] };
      setPreferences(updated);
    }
  };

  const handleSave = () => {
    if (preferences) {
      notificationService.updatePreferences('current-user', preferences);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {language === 'fr' ? 'Préférences de Notifications' : 'Notification Preferences'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'fr'
                  ? 'Personnalisez vos canaux de réception et alertes'
                  : 'Customize delivery channels and active alert topics'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Channels */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {language === 'fr' ? 'Canaux de Réception' : 'Delivery Channels'}
            </h4>
            <div className="space-y-3">
              <div
                onClick={() => handleToggle('inAppEnabled')}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {language === 'fr' ? 'Notifications dans l\'Application' : 'In-App Alerts'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {language === 'fr' ? 'Afficher les badges et bannières' : 'Show badges and banners in web app'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppEnabled}
                  onChange={() => {}}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div
                onClick={() => handleToggle('pushEnabled')}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {language === 'fr' ? 'Notifications Push (FCM)' : 'Push Notifications'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {language === 'fr' ? 'Sur navigateur et application mobile Flutter' : 'Browser and Flutter mobile app push alerts'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.pushEnabled}
                  onChange={() => {}}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div
                onClick={() => handleToggle('emailEnabled')}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {language === 'fr' ? 'Notifications par E-mail' : 'Email Notifications'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {language === 'fr' ? 'Recevoir les annonces officielles et récapitulatifs' : 'Receive official announcements & receipts'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={() => {}}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Alert Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {language === 'fr' ? 'Catégories d\'Alertes' : 'Alert Categories'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'assignmentNotifications', label: 'Assignments & Quizzes', labelFr: 'Devoirs & Quiz' },
                { key: 'aiNotifications', label: 'AI Recommendations', labelFr: 'Recommandations IA' },
                { key: 'reminderNotifications', label: 'Study & Exam Reminders', labelFr: 'Rappels d\'Examens' },
                { key: 'discussionNotifications', label: 'Discussion Forum Replies', labelFr: 'Réponses du Forum' },
                { key: 'achievementNotifications', label: 'Achievements & Badges', labelFr: 'Badges & Récompenses' },
                { key: 'paymentNotifications', label: 'Payment & Subscription', labelFr: 'Paiement & Abonnement' },
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key as keyof NotificationPreference)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-200 cursor-pointer bg-slate-50/40"
                >
                  <span className="text-xs font-medium text-slate-700">
                    {language === 'fr' ? item.labelFr : item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(preferences[item.key as keyof NotificationPreference])}
                    onChange={() => {}}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sound & Haptics & Language */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'fr' ? 'Langue et Effets' : 'Language & Effects'}
            </h4>
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  {language === 'fr' ? 'Langue des Notifications' : 'Notification Language'}
                </span>
              </div>
              <select
                value={preferences.languagePreference}
                onChange={e => setPreferences({ ...preferences, languagePreference: e.target.value as 'en' | 'fr' })}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  {language === 'fr' ? 'Son de notification' : 'Sound Effects'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={() => handleToggle('soundEnabled')}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  {language === 'fr' ? 'Vibration (Application Mobile)' : 'Vibration (Mobile App)'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.vibrationEnabled}
                onChange={() => handleToggle('vibrationEnabled')}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                {language === 'fr' ? 'Enregistré !' : 'Saved!'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {language === 'fr' ? 'Sauvegarder les Préférences' : 'Save Preferences'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
