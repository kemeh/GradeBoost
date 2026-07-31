import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, getTranslation } from '../constants/translations';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => getTranslation(key, 'en', fallback),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('gradeboost_lang');
    if (saved === 'en' || saved === 'fr') return saved;
    // Check user preferred language if available
    if (user?.language === 'fr') return 'fr';
    // Fallback to browser language
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('fr')) {
      return 'fr';
    }
    return 'en';
  });

  // Sync with user profile when logged in
  useEffect(() => {
    if (user?.language && (user.language === 'en' || user.language === 'fr')) {
      if (user.language !== language) {
        setLanguageState(user.language as LanguageCode);
        localStorage.setItem('gradeboost_lang', user.language);
      }
    }
  }, [user?.language]);

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    localStorage.setItem('gradeboost_lang', newLang);

    // If user is logged in, update Firestore
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          language: newLang
        });
      } catch (err) {
        console.warn('Failed to persist language choice to user profile:', err);
      }
    }
  };

  const t = (key: string, fallback?: string) => getTranslation(key, language, fallback);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
