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
  updatedAt: any;
  updatedBy: string;
}

const SETTINGS_DOC_ID = 'global';

export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
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
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    await setDoc(docRef, {
      geminiApiKey: apiKey,
      challengeStartDate,
      paymentPrice,
      appName,
      logoUrl,
      contactEmail,
      whatsappNumber,
      whatsappGroupLink,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

export const getGeminiApiKey = async (): Promise<string | null> => {
  const settings = await getSystemSettings();
  return settings?.geminiApiKey || null;
};
