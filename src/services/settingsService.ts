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

export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SystemSettings;
      // Also try to get the API key if possible (for admins)
      try {
        const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);
        const secretsSnap = await getDoc(secretsRef);
        if (secretsSnap.exists()) {
          data.geminiApiKey = secretsSnap.data().geminiApiKey;
        }
      } catch (e) {
        // Ignore permission errors for non-admins
      }
      return data;
    }
    return {
      geminiApiKey: '',
      challengeStartDate: new Date().toISOString(),
      paymentPrice: 1000,
      appName: 'Edulpha',
      logoUrl: '/edulpha-logo.png',
      contactEmail: 'support@edulpha.com',
      updatedAt: null,
      updatedBy: 'system'
    };
  } catch (error) {
    console.warn('Using default system settings due to offline/network status:', error);
    return {
      geminiApiKey: '',
      challengeStartDate: new Date().toISOString(),
      paymentPrice: 1000,
      appName: 'Edulpha',
      logoUrl: '/edulpha-logo.png',
      contactEmail: 'support@edulpha.com',
      updatedAt: null,
      updatedBy: 'system'
    };
  }
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
  try {
    const globalRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);

    let settingsObj: Partial<SystemSettings> = {};
    let keyToSave = '';

    if (typeof apiKeyOrSettings === 'object' && apiKeyOrSettings !== null) {
      settingsObj = apiKeyOrSettings;
      keyToSave = apiKeyOrSettings.geminiApiKey || '';
    } else {
      keyToSave = apiKeyOrSettings as string;
      settingsObj = {
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
    
    // Update global settings (public)
    await setDoc(globalRef, {
      ...settingsObj,
      updatedAt: serverTimestamp(),
      updatedBy: userId || settingsObj.updatedBy || 'admin',
    }, { merge: true });

    // Update secrets (admin only)
    if (keyToSave) {
      await setDoc(secretsRef, {
        geminiApiKey: keyToSave,
        updatedAt: serverTimestamp(),
        updatedBy: userId || 'admin',
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};


export const getGeminiApiKey = async (): Promise<string | null> => {
  try {
    const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);
    const secretsSnap = await getDoc(secretsRef);
    if (secretsSnap.exists()) {
      return secretsSnap.data().geminiApiKey;
    }
    // Fallback to global if it was stored there previously
    const globalRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const globalSnap = await getDoc(globalRef);
    if (globalSnap.exists()) {
      return globalSnap.data().geminiApiKey || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Gemini API Key:', error);
    return null;
  }
};
