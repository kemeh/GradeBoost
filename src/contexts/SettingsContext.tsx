import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSystemSettings, SystemSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  appName: string;
  logoUrl: string;
  contactEmail: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSystemSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
    appName: settings?.appName || 'GradeBoost 60',
    logoUrl: settings?.logoUrl || '/logo.svg',
    contactEmail: settings?.contactEmail || 'support@gradeboost60.com'
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
