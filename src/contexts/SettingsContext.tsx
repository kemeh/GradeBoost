import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSystemSettings, SystemSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  appName: string;
  logoUrl: string;
  contactEmail: string;
  whatsappNumber: string;
  whatsappGroupLink: string;
  momoNumber: string;
  momoName: string;
  omNumber: string;
  omName: string;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
    appName: settings?.appName || 'Edulpha',
    logoUrl: settings?.logoUrl || '/edulpha-logo.png',
    contactEmail: settings?.contactEmail || 'support@edulpha.com',
    whatsappNumber: settings?.whatsappNumber || '',
    whatsappGroupLink: settings?.whatsappGroupLink || '',
    momoNumber: settings?.momoNumber || '677 123 456',
    momoName: settings?.momoName || 'Admin Name',
    omNumber: settings?.omNumber || '699 123 456',
    omName: settings?.omName || 'Admin Name',
    refreshSettings: fetchSettings
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
