import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'compact' | 'minimal';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'dropdown', className = '' }) => {
  const { language, languageMeta, supportedLanguages, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangs = supportedLanguages.filter(l => l.enabled && (l.code === 'en' || l.code === 'fr'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 ${className}`}>
        {activeLangs.map(l => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              language === l.code ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`${l.name} (${l.nativeName})`}
          >
            <span>{l.flag}</span>
            <span className="uppercase">{l.code}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/90 text-white hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 shadow-xs transition-all outline-none"
      >
        <Globe size={15} className="text-indigo-400" />
        <span className="flex items-center gap-1.5">
          <span>{languageMeta.flag}</span>
          <span>{languageMeta.name}</span>
          {languageMeta.direction === 'rtl' && (
            <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-mono px-1 rounded uppercase">RTL</span>
          )}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 py-2 text-xs">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>Select Platform Language</span>
            <span className="text-indigo-400">{activeLangs.length} Available</span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {activeLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                  language === lang.code ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <span className="font-semibold">{lang.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-normal">({lang.nativeName})</span>
                  </div>
                </div>

                {language === lang.code && <Check size={14} className="text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
