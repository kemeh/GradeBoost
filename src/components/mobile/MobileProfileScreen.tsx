import React from 'react';
import {
  User,
  Award,
  CreditCard,
  Settings,
  LogOut,
  Flame,
  Globe,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  FileText,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileProfileScreenProps {
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
  onSetLang: (lang: 'en' | 'fr') => void;
  onOpenSettings: () => void;
  onTriggerPayment: (provider: 'MTN MoMo' | 'Orange Money') => void;
}

export const MobileProfileScreen: React.FC<MobileProfileScreenProps> = ({
  simLang,
  isDarkMode,
  onSetLang,
  onOpenSettings,
  onTriggerPayment,
}) => {
  const isEn = simLang === 'en';

  const achievements = [
    { title: isEn ? '14-Day Streak' : 'Série 14 Jours', icon: '🔥', desc: isEn ? 'Consistent daily study' : 'Étude quotidienne' },
    { title: isEn ? 'Quiz Master' : 'Maître des Quiz', icon: '🏆', desc: isEn ? 'Scored 100% on 10 mocks' : '100% à 10 examens' },
    { title: isEn ? 'AI Scholar' : 'Expert IA', icon: '🤖', desc: isEn ? 'Asked 50+ AI questions' : '50+ questions IA' },
    { title: isEn ? 'Math Wizard' : 'Génie des Maths', icon: '🎯', desc: isEn ? 'Solved 500 calculus problems' : '500 problèmes résolus' }
  ];

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. Profile Header Card */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-amber-400 p-0.5 shadow-md">
                <div className="h-full w-full rounded-full bg-[#0F2C59] flex items-center justify-center font-black text-amber-300 text-base">
                  KH
                </div>
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Kemeh Hilary</h3>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                {isEn ? 'GCE Advanced Level Science' : 'Baccalauréat Série C MINESEC'}
              </p>
              <p className="text-[9px] text-slate-400">kemehhilary@gmail.com</p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Subscription Status Badge */}
        <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-200">
              {isEn ? 'SUBSCRIPTION STATUS' : 'STATUT DU COMPTE'}
            </span>
            <h5 className="font-extrabold text-xs flex items-center gap-1 text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              {isEn ? 'Edulpha Premium Pass Active' : 'Pass Premium Actif'}
            </h5>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg font-bold">
            285 {isEn ? 'Days Left' : 'Jours Restants'}
          </span>
        </div>
      </div>

      {/* 2. Study Statistics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-1`}>
          <span className="text-[10px] text-slate-400 font-semibold">{isEn ? 'Hours Studied' : 'Heures d\'Étude'}</span>
          <h4 className="font-black text-base text-blue-600 dark:text-blue-400">142.5 hrs</h4>
          <span className="text-[9px] text-emerald-500 font-bold">↑ +12.4% this week</span>
        </div>

        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-1`}>
          <span className="text-[10px] text-slate-400 font-semibold">{isEn ? 'Questions Solved' : 'Exercices Traités'}</span>
          <h4 className="font-black text-base text-purple-600 dark:text-purple-400">1,850</h4>
          <span className="text-[9px] text-emerald-500 font-bold">89.2% Accuracy</span>
        </div>
      </div>

      {/* 3. MTN MoMo / Orange Money Renewal */}
      <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-2`}>
        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-amber-500" />
          {isEn ? 'Mobile Money Renewal' : 'Renouvellement Mobile Money'}
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {isEn ? 'Renew your GCE & BAC subscription using MTN MoMo or Orange Money Cameroon.' : 'Rechargez votre pass via MTN MoMo ou Orange Money.'}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onTriggerPayment('MTN MoMo')}
            className="py-2 bg-amber-500 hover:bg-amber-600 text-[#0F2C59] font-black rounded-xl text-xs transition active:scale-95 shadow-sm"
          >
            MTN MoMo (5,000 XAF)
          </button>
          <button
            onClick={() => onTriggerPayment('Orange Money')}
            className="py-2 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs transition active:scale-95 shadow-sm"
          >
            Orange Money
          </button>
        </div>
      </div>

      {/* 4. Language Selector Switcher */}
      <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <div>
            <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{isEn ? 'App Language' : 'Langue de l\'App'}</h5>
            <p className="text-[10px] text-slate-400">{isEn ? 'English (GCE) / Français (BAC)' : 'Anglais / Français'}</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onSetLang('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              simLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => onSetLang('fr')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              simLang === 'fr' ? 'bg-blue-600 text-white' : 'text-slate-500'
            }`}
          >
            🇫🇷 FR
          </button>
        </div>
      </div>

      {/* 5. Achievements Grid */}
      <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-2`}>
        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
          <Award className="h-4 w-4 text-amber-500" />
          {isEn ? 'ACHIEVEMENTS & BADGES' : 'SUCCÈS & BADGES'}
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {achievements.map((ach, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-base">{ach.icon}</span>
              <h5 className="font-extrabold text-slate-900 dark:text-white text-[11px]">{ach.title}</h5>
              <p className="text-[9px] text-slate-400">{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Settings & Logout Actions */}
      <div className="space-y-2">
        <button
          onClick={onOpenSettings}
          className={`w-full p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800'} text-xs font-bold flex items-center justify-between hover:border-blue-500 transition shadow-sm`}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <span>{isEn ? 'Application Settings' : 'Paramètres de l\'Application'}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        <button
          onClick={() => toast.success('Logged out safely from Edulpha mobile session.')}
          className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>{isEn ? 'Log Out of Mobile App' : 'Déconnexion'}</span>
        </button>
      </div>
    </div>
  );
};
