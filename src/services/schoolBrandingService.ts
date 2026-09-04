import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  SchoolBrandingSettings, 
  DEFAULT_SCHOOL_BRANDING, 
  GeneratedPaperData 
} from '../types/paperGenerator';

const BRANDING_DOC_ID = 'examination_branding';
const LOCAL_BRANDING_KEY = 'edulpha_school_branding';

export const getCachedSchoolBranding = (): SchoolBrandingSettings => {
  try {
    const cached = localStorage.getItem(LOCAL_BRANDING_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...DEFAULT_SCHOOL_BRANDING,
        ...parsed,
        watermark: {
          ...DEFAULT_SCHOOL_BRANDING.watermark,
          ...(parsed.watermark || {})
        }
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached school branding:', err);
  }
  return { ...DEFAULT_SCHOOL_BRANDING };
};

const saveCachedSchoolBranding = (branding: SchoolBrandingSettings): void => {
  try {
    localStorage.setItem(LOCAL_BRANDING_KEY, JSON.stringify(branding));
  } catch (err) {
    console.warn('Failed to save school branding to localStorage:', err);
  }
};

export const getSchoolBranding = async (): Promise<SchoolBrandingSettings> => {
  const localCache = getCachedSchoolBranding();
  let serverData: Partial<SchoolBrandingSettings> | null = null;

  // 1. Fetch from Firestore Client SDK
  try {
    const docRef = doc(db, 'system_settings', BRANDING_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      serverData = docSnap.data() as Partial<SchoolBrandingSettings>;
    }
  } catch (error) {
    console.warn('Firestore examination_branding getDoc warning:', error);
  }

  // 2. Fetch from Server API fallback
  if (!serverData) {
    try {
      const resp = await fetch('/api/examination-branding');
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.branding) {
          serverData = json.branding;
        }
      }
    } catch (apiErr) {
      // Offline or network error
    }
  }

  if (serverData) {
    const merged: SchoolBrandingSettings = {
      ...DEFAULT_SCHOOL_BRANDING,
      ...localCache,
      ...serverData,
      watermark: {
        ...DEFAULT_SCHOOL_BRANDING.watermark,
        ...(localCache.watermark || {}),
        ...(serverData.watermark || {})
      }
    };
    saveCachedSchoolBranding(merged);
    return merged;
  }

  return localCache;
};

export const updateSchoolBranding = async (
  updates: Partial<SchoolBrandingSettings>,
  userId?: string
): Promise<SchoolBrandingSettings> => {
  const current = getCachedSchoolBranding();
  const now = new Date().toISOString();

  const merged: SchoolBrandingSettings = {
    ...current,
    ...updates,
    watermark: {
      ...current.watermark,
      ...(updates.watermark || {})
    },
    updatedAt: now,
    updatedBy: userId || 'admin'
  };

  // 1. Immediately save locally and broadcast
  saveCachedSchoolBranding(merged);
  try {
    window.dispatchEvent(new CustomEvent('edulpha_school_branding_updated', { detail: merged }));
  } catch (_) {}

  // 2. Persist to Server API
  try {
    await fetch('/api/examination-branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    });
  } catch (err) {
    console.warn('Server API examination-branding POST notice:', err);
  }

  // 3. Persist to Firestore
  try {
    const docRef = doc(db, 'system_settings', BRANDING_DOC_ID);
    await setDoc(docRef, {
      ...merged,
      serverTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore examination_branding setDoc notice:', err);
  }

  return merged;
};

export const resetSchoolBrandingToDefault = async (userId?: string): Promise<SchoolBrandingSettings> => {
  return await updateSchoolBranding({ ...DEFAULT_SCHOOL_BRANDING }, userId);
};

/**
 * Returns either the paper's saved branding snapshot (if present)
 * or the active/current school branding.
 */
export const getEffectivePaperBranding = (
  paper?: Partial<GeneratedPaperData> | null,
  activeBranding?: SchoolBrandingSettings
): SchoolBrandingSettings => {
  if (paper?.brandingSnapshot && paper.brandingSnapshot.schoolName) {
    return {
      ...DEFAULT_SCHOOL_BRANDING,
      ...paper.brandingSnapshot,
      watermark: {
        ...DEFAULT_SCHOOL_BRANDING.watermark,
        ...(paper.brandingSnapshot.watermark || {})
      }
    };
  }

  return activeBranding || getCachedSchoolBranding();
};
