import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface SystemSettings {
  geminiApiKey: string;
  challengeStartDate: string;
  paymentPrice: number;
  appName?: string;
  logoUrl?: string;
  platformLogoUrl?: string;
  landingLogoUrl?: string;
  footerLogoUrl?: string;
  partnerLogoUrl?: string;
  institutionLogoUrl?: string;
  sponsorLogoUrl?: string;
  aiLogoUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  whatsappGroupLink?: string;
  momoNumber?: string;
  momoName?: string;
  omNumber?: string;
  omName?: string;
  phoneAuthConfig?: any;
  updatedAt: any;
  updatedBy: string;
}

const SETTINGS_DOC_ID = 'global';
const SECRETS_DOC_ID = 'secrets';
const LOCAL_SETTINGS_KEY = 'edulpha_system_settings';

const DEFAULT_SETTINGS: SystemSettings = {
  geminiApiKey: '',
  challengeStartDate: new Date().toISOString().split('T')[0],
  paymentPrice: 1000,
  appName: 'Edulpha',
  logoUrl: '/edulpha-logo.png',
  contactEmail: 'support@edulpha.com',
  whatsappNumber: '',
  whatsappGroupLink: '',
  momoNumber: '677 123 456',
  momoName: 'Admin Name',
  omNumber: '699 123 456',
  omName: 'Admin Name',
  updatedAt: null,
  updatedBy: 'system'
};

const getLocalSettings = (): SystemSettings | null => {
  try {
    const cached = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('Failed to parse local system settings cache:', err);
  }
  return null;
};

const saveLocalSettings = (settings: Partial<SystemSettings>) => {
  try {
    const existing = getLocalSettings() || DEFAULT_SETTINGS;
    const merged = { ...existing, ...settings };
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
};

export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  const localCache = getLocalSettings();

  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SystemSettings;
      
      // Try fetching API key from secrets doc (admin view)
      try {
        const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);
        const secretsSnap = await getDoc(secretsRef);
        if (secretsSnap.exists()) {
          data.geminiApiKey = secretsSnap.data().geminiApiKey || data.geminiApiKey || '';
        }
      } catch (e) {
        // Ignore secret permission error for non-admin viewers
      }

      const merged = {
        ...DEFAULT_SETTINGS,
        ...(localCache || {}),
        ...data,
      };

      saveLocalSettings(merged);
      return merged;
    }
  } catch (error) {
    console.warn('Using cached system settings due to network/Firestore state:', error);
  }

  return localCache ? { ...DEFAULT_SETTINGS, ...localCache } : DEFAULT_SETTINGS;
};

export const updateSystemSettings = async (
  apiKeyOrSettings: string | Partial<SystemSettings>, 
  challengeStartDate?: string, 
  paymentPrice?: number, 
  appName?: string,
  logoUrl?: string,
  contactEmail?: string,
  whatsappNumber?: string,
  whatsappGroupLink?: string,
  momoNumber?: string,
  momoName?: string,
  omNumber?: string,
  omName?: string,
  userId?: string
): Promise<void> => {
  let settingsObj: Partial<SystemSettings> = {};
  let keyToSave = '';

  if (typeof apiKeyOrSettings === 'object' && apiKeyOrSettings !== null) {
    settingsObj = apiKeyOrSettings;
    keyToSave = apiKeyOrSettings.geminiApiKey || '';
  } else {
    keyToSave = apiKeyOrSettings as string;
    settingsObj = {
      geminiApiKey: keyToSave,
      challengeStartDate,
      paymentPrice,
      appName,
      logoUrl,
      contactEmail,
      whatsappNumber,
      whatsappGroupLink,
      momoNumber,
      momoName,
      omNumber,
      omName,
    };
  }

  // 1. Immediately update local storage so UI and offline sessions persist
  saveLocalSettings(settingsObj);

  // 2. Persist to Firestore
  try {
    const globalRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);

    await setDoc(globalRef, {
      ...settingsObj,
      updatedAt: serverTimestamp(),
      updatedBy: userId || settingsObj.updatedBy || 'admin',
    }, { merge: true });

    if (keyToSave) {
      await setDoc(secretsRef, {
        geminiApiKey: keyToSave,
        updatedAt: serverTimestamp(),
        updatedBy: userId || 'admin',
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore update warning (settings saved locally):', error);
  }
};

export const getGeminiApiKey = async (): Promise<string | null> => {
  try {
    const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);
    const secretsSnap = await getDoc(secretsRef);
    if (secretsSnap.exists() && secretsSnap.data().geminiApiKey) {
      return secretsSnap.data().geminiApiKey;
    }
    const globalRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const globalSnap = await getDoc(globalRef);
    if (globalSnap.exists() && globalSnap.data().geminiApiKey) {
      return globalSnap.data().geminiApiKey;
    }
  } catch (error) {
    console.warn('Error fetching Gemini API Key from Firestore:', error);
  }

  const local = getLocalSettings();
  return local?.geminiApiKey || null;
};
