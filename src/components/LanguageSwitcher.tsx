import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'pill', className = '' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            language === 'en' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="English Interface"
        >
          🇬🇧 EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('fr')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            language === 'fr' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Interface Française"
        >
          🇫🇷 FR
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700 text-xs ${className}`}>
      <div className="flex items-center gap-1 px-2 text-slate-400 font-semibold">
        <Globe size={14} className="text-indigo-400" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
          language === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
          language === 'fr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <span>🇫🇷</span>
        <span>Français</span>
      </button>
    </div>
  );
};
