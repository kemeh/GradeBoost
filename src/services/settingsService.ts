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

  let serverData: Partial<SystemSettings> | null = null;

  // 1. Try fetching from Firestore Client SDK
  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      serverData = docSnap.data() as SystemSettings;
      
      // Try fetching API key from secrets doc (admin view)
      try {
        const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);
        const secretsSnap = await getDoc(secretsRef);
        if (secretsSnap.exists()) {
          serverData.geminiApiKey = secretsSnap.data().geminiApiKey || serverData.geminiApiKey || '';
        }
      } catch (e) {
        // Ignore secret permission error for non-admin viewers
      }
    }
  } catch (error) {
    console.warn('Firestore client getDoc warning:', error);
  }

  // 2. Fallback to Server API /api/settings if Firestore client didn't return data
  if (!serverData) {
    try {
      const resp = await fetch('/api/settings');
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.settings) {
          serverData = json.settings;
        }
      }
    } catch (apiErr) {
      console.warn('Server API /api/settings fetch warning:', apiErr);
    }
  }

  if (serverData) {
    const primaryLogo = serverData.logoUrl || serverData.platformLogoUrl || localCache?.logoUrl || DEFAULT_SETTINGS.logoUrl;
    const merged: SystemSettings = {
      ...DEFAULT_SETTINGS,
      ...(localCache || {}),
      ...serverData,
      // Ensure server values strictly override default placeholders
      logoUrl: primaryLogo,
      platformLogoUrl: serverData.platformLogoUrl || primaryLogo,
      landingLogoUrl: serverData.landingLogoUrl || primaryLogo,
      footerLogoUrl: serverData.footerLogoUrl || primaryLogo,
      partnerLogoUrl: serverData.partnerLogoUrl !== undefined ? serverData.partnerLogoUrl : (localCache?.partnerLogoUrl || ''),
      institutionLogoUrl: serverData.institutionLogoUrl !== undefined ? serverData.institutionLogoUrl : (localCache?.institutionLogoUrl || ''),
      sponsorLogoUrl: serverData.sponsorLogoUrl !== undefined ? serverData.sponsorLogoUrl : (localCache?.sponsorLogoUrl || ''),
      aiLogoUrl: serverData.aiLogoUrl !== undefined ? serverData.aiLogoUrl : (localCache?.aiLogoUrl || DEFAULT_SETTINGS.aiLogoUrl || '/ai-logo.png'),
      faviconUrl: serverData.faviconUrl !== undefined ? serverData.faviconUrl : (localCache?.faviconUrl || '/favicon.ico'),
      appIconUrl: serverData.appIconUrl !== undefined ? serverData.appIconUrl : (localCache?.appIconUrl || '/icon.png'),
    };

    saveLocalSettings(merged);
    return merged;
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
    settingsObj = { ...apiKeyOrSettings };
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

  // Ensure primary logo fields are kept in sync
  const activeLogo = settingsObj.logoUrl || settingsObj.platformLogoUrl;
  if (activeLogo) {
    if (!settingsObj.logoUrl) settingsObj.logoUrl = activeLogo;
    if (!settingsObj.platformLogoUrl) settingsObj.platformLogoUrl = activeLogo;
  }

  // 1. Immediately update local storage so UI and offline sessions update
  saveLocalSettings(settingsObj);

  // Broadcast settings update event across the browser application
  try {
    window.dispatchEvent(new CustomEvent('edulpha_settings_updated', { detail: settingsObj }));
  } catch (e) {
    // Ignore event dispatch failure
  }

  let firestoreSuccess = false;
  let serverApiSuccess = false;

  // 2. Persist via Server API /api/settings first as authoritative backend endpoint
  try {
    const resp = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...settingsObj,
        geminiApiKey: keyToSave,
        updatedBy: userId || settingsObj.updatedBy || 'admin',
      })
    });
    if (resp.ok) {
      const json = await resp.json();
      if (json.success && json.settings) {
        saveLocalSettings(json.settings);
        serverApiSuccess = true;
      }
    }
  } catch (serverErr) {
    console.warn('Server settings API notice:', serverErr);
  }

  // 3. Persist to Firestore Client SDK
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
    firestoreSuccess = true;
  } catch (error) {
    console.warn('Firestore client update notice:', error);
  }

  if (!serverApiSuccess && !firestoreSuccess) {
    console.warn('Both backend persistence channels returned warnings, relying on local storage cache.');
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
