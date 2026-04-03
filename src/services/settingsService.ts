import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface SystemSettings {
  geminiApiKey: string;
  challengeStartDate: string;
  paymentPrice: number;
  appName?: string;
  logoUrl?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  whatsappGroupLink?: string;
  momoNumber?: string;
  momoName?: string;
  omNumber?: string;
  omName?: string;
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
    return null;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return null;
  }
};

export const updateSystemSettings = async (
  apiKey: string, 
  challengeStartDate: string, 
  paymentPrice: number, 
  appName: string,
  logoUrl: string,
  contactEmail: string,
  whatsappNumber: string,
  whatsappGroupLink: string,
  momoNumber: string,
  momoName: string,
  omNumber: string,
  omName: string,
  userId: string
): Promise<void> => {
  try {
    const globalRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const secretsRef = doc(db, 'system_settings', SECRETS_DOC_ID);
    
    // Update global settings (public)
    await setDoc(globalRef, {
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
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    // Update secrets (admin only)
    if (apiKey) {
      await setDoc(secretsRef, {
        geminiApiKey: apiKey,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
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
