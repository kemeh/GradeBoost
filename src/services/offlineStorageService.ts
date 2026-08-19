// IndexedDB and Service Worker Offline Storage Service for Practice and Daily Drill modules
import { QuestionPaper, ExamQuestion, DailyDrill, DrillSubmission } from '../types';
import { sendSWMessage } from '../serviceWorkerRegistration';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const DB_NAME = 'edulpha_offline_study_db';
const DB_VERSION = 1;

export interface DownloadedPracticePaper extends QuestionPaper {
  downloadedAt: number;
  fileSizeBytes: number;
  isOfflineAvailable: boolean;
  offlineQuestions?: any[];
  cachedPdfBlobUrl?: string;
}

export interface DownloadedDailyDrill extends DailyDrill {
  downloadedAt: number;
  fileSizeBytes: number;
  isOfflineAvailable: boolean;
  cachedQuestions: ExamQuestion[];
}

export interface OfflineQueuedSubmission {
  id: string;
  type: 'practice' | 'drill';
  userId: string;
  targetId: string;
  subject: string;
  payload: any;
  createdAt: number;
  synced: boolean;
}

export interface StorageMetrics {
  practiceCount: number;
  drillCount: number;
  pendingSubmissionsCount: number;
  totalSizeBytes: number;
  formattedSize: string;
}

/**
 * Open or upgrade the Edulpha Offline IndexedDB database
 */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Practice Papers store
      if (!db.objectStoreNames.contains('practice_papers')) {
        const paperStore = db.createObjectStore('practice_papers', { keyPath: 'id' });
        paperStore.createIndex('subject', 'subject', { unique: false });
        paperStore.createIndex('paperType', 'paperType', { unique: false });
        paperStore.createIndex('year', 'year', { unique: false });
        paperStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }

      // 2. Daily Drills store
      if (!db.objectStoreNames.contains('daily_drills')) {
        const drillStore = db.createObjectStore('daily_drills', { keyPath: 'id' });
        drillStore.createIndex('subject', 'subject', { unique: false });
        drillStore.createIndex('day', 'day', { unique: false });
        drillStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }

      // 3. Exam Questions general cache
      if (!db.objectStoreNames.contains('exam_questions')) {
        const qStore = db.createObjectStore('exam_questions', { keyPath: 'id' });
        qStore.createIndex('subject', 'subject', { unique: false });
        qStore.createIndex('paper', 'paper', { unique: false });
        qStore.createIndex('topic', 'topic', { unique: false });
      }

      // 4. Offline Queued Submissions (for when taking exams while offline)
      if (!db.objectStoreNames.contains('offline_submissions')) {
        const subStore = db.createObjectStore('offline_submissions', { keyPath: 'id' });
        subStore.createIndex('userId', 'userId', { unique: false });
        subStore.createIndex('type', 'type', { unique: false });
        subStore.createIndex('synced', 'synced', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ----------------------------------------------------
// NETWORK & CONNECTIVITY HELPERS
// ----------------------------------------------------

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function onNetworkStatusChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ----------------------------------------------------
// PRACTICE PAPERS CACHING & DOWNLOAD
// ----------------------------------------------------

/**
 * Downloads and caches a complete Practice Paper for offline study
 */
export async function downloadPracticePaper(
  paper: QuestionPaper,
  questions: any[] = []
): Promise<DownloadedPracticePaper> {
  const db = await openOfflineDB();

  // Estimate size in bytes
  const serialized = JSON.stringify({ paper, questions });
  const fileSizeBytes = new Blob([serialized]).size + (paper.pdfUrl ? 150000 : 25000);

  const downloadedRecord: DownloadedPracticePaper = {
    ...paper,
    downloadedAt: Date.now(),
    fileSizeBytes,
    isOfflineAvailable: true,
    offlineQuestions: questions.length > 0 ? questions : ((paper as any).questions || []),
  };

  // If there's a PDF URL, inform the service worker to cache the PDF file
  if (paper.pdfUrl && paper.pdfUrl.startsWith('http')) {
    sendSWMessage({
      type: 'CACHE_PRACTICE_URLS',
      urls: [paper.pdfUrl]
    }).catch(e => console.warn('SW caching PDF:', e));
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction('practice_papers', 'readwrite');
    const store = tx.objectStore('practice_papers');
    const request = store.put(downloadedRecord);

    request.onsuccess = () => {
      console.log(`[Offline Storage] Cached Practice Paper ${paper.id} (${paper.title})`);
      resolve(downloadedRecord);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all cached Practice Papers from offline storage, optionally filtered by subject
 */
export async function getOfflinePracticePapers(subject?: string): Promise<DownloadedPracticePaper[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('practice_papers', 'readonly');
      const store = tx.objectStore('practice_papers');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = (request.result || []) as DownloadedPracticePaper[];
        if (subject) {
          const subLower = subject.trim().toLowerCase();
          results = results.filter(p => p.subject?.toLowerCase() === subLower);
        }
        // Sort descending by downloadedAt
        results.sort((a, b) => b.downloadedAt - a.downloadedAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Offline Storage] Failed to get offline practice papers:', err);
    return [];
  }
}

/**
 * Get a specific offline practice paper by ID
 */
export async function getOfflinePracticePaperById(id: string): Promise<DownloadedPracticePaper | null> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('practice_papers', 'readonly');
      const store = tx.objectStore('practice_papers');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Offline Storage] Error getting paper by id:', err);
    return null;
  }
}

/**
 * Remove a cached Practice Paper from offline storage
 */
export async function removeOfflinePracticePaper(id: string): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('practice_papers', 'readwrite');
      const store = tx.objectStore('practice_papers');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Offline Storage] Error deleting practice paper:', err);
    return false;
  }
}

// ----------------------------------------------------
// DAILY DRILL CACHING & DOWNLOAD
// ----------------------------------------------------

/**
 * Downloads and caches a Daily Drill along with all its exam questions for offline practice
 */
export async function downloadDailyDrill(
  drill: DailyDrill,
  questions: ExamQuestion[]
): Promise<DownloadedDailyDrill> {
  const db = await openOfflineDB();

  const serialized = JSON.stringify({ drill, questions });
  const fileSizeBytes = new Blob([serialized]).size + 15000;

  const downloadedRecord: DownloadedDailyDrill = {
    ...drill,
    downloadedAt: Date.now(),
    fileSizeBytes,
    isOfflineAvailable: true,
    cachedQuestions: questions,
  };

  // Pre-cache individual questions into exam_questions store too
  const tx = db.transaction(['daily_drills', 'exam_questions'], 'readwrite');
  const drillStore = tx.objectStore('daily_drills');
  const qStore = tx.objectStore('exam_questions');

  drillStore.put(downloadedRecord);

  questions.forEach(q => {
    if (q.id) {
      qStore.put(q);
    }
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      console.log(`[Offline Storage] Cached Daily Drill Day ${drill.day} (${drill.subject}) with ${questions.length} questions.`);
      resolve(downloadedRecord);
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all cached Daily Drills from offline storage
 */
export async function getOfflineDailyDrills(subject?: string): Promise<DownloadedDailyDrill[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_drills', 'readonly');
      const store = tx.objectStore('daily_drills');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = (request.result || []) as DownloadedDailyDrill[];
        if (subject) {
          const subLower = subject.trim().toLowerCase();
          results = results.filter(d => d.subject?.toLowerCase() === subLower);
        }
        results.sort((a, b) => a.day - b.day);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Offline Storage] Failed to get offline daily drills:', err);
    return [];
  }
}

/**
 * Get a specific offline Daily Drill by day number and subject
 */
export async function getOfflineDailyDrillByDay(
  day: number,
  subject?: string
): Promise<DownloadedDailyDrill | null> {
  try {
    const drills = await getOfflineDailyDrills(subject);
    const matched = drills.find(d => Number(d.day) === Number(day));
    return matched || null;
  } catch (err) {
    console.error('[Offline Storage] Error getting daily drill by day:', err);
    return null;
  }
}

/**
 * Remove a cached Daily Drill from offline storage
 */
export async function removeOfflineDailyDrill(id: string): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_drills', 'readwrite');
      const store = tx.objectStore('daily_drills');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Offline Storage] Error removing daily drill:', err);
    return false;
  }
}

// ----------------------------------------------------
// OFFLINE SUBMISSIONS QUEUE & SYNC
// ----------------------------------------------------

/**
 * Queues a practice or drill submission when offline
 */
export async function queueOfflineSubmission(
  submission: Omit<OfflineQueuedSubmission, 'id' | 'createdAt' | 'synced'>
): Promise<string> {
  const db = await openOfflineDB();
  const id = `offline_sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const record: OfflineQueuedSubmission = {
    ...submission,
    id,
    createdAt: Date.now(),
    synced: false
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_submissions', 'readwrite');
    const store = tx.objectStore('offline_submissions');
    const request = store.put(record);

    request.onsuccess = () => {
      console.log(`[Offline Storage] Queued offline submission (${submission.type}) for target ${submission.targetId}`);
      resolve(id);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all unsynced submissions
 */
export async function getPendingOfflineSubmissions(): Promise<OfflineQueuedSubmission[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_submissions', 'readonly');
      const store = tx.objectStore('offline_submissions');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = ((request.result || []) as OfflineQueuedSubmission[])
          .filter(item => !item.synced);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Offline Storage] Failed to get pending submissions:', err);
    return [];
  }
}

/**
 * Synchronize all pending offline submissions to Firestore when network is restored
 */
export async function syncOfflineSubmissionsToFirestore(): Promise<{ syncedCount: number; errors: any[] }> {
  if (!isOnline()) {
    return { syncedCount: 0, errors: ['Network is currently offline'] };
  }

  const pending = await getPendingOfflineSubmissions();
  if (pending.length === 0) {
    return { syncedCount: 0, errors: [] };
  }

  console.log(`[Offline Storage] Syncing ${pending.length} offline study submissions to Firestore...`);
  const db_instance = await openOfflineDB();
  let syncedCount = 0;
  const errors: any[] = [];

  for (const item of pending) {
    try {
      if (item.type === 'practice') {
        await addDoc(collection(db, 'results'), {
          ...item.payload,
          isOfflineSubmitted: true,
          offlineSubmittedAt: item.createdAt,
          syncedAt: serverTimestamp(),
        });
      } else if (item.type === 'drill') {
        await addDoc(collection(db, 'drill_submissions'), {
          ...item.payload,
          isOfflineSubmitted: true,
          offlineSubmittedAt: item.createdAt,
          syncedAt: serverTimestamp(),
        });
      }

      // Mark as synced in local DB
      await new Promise<void>((resolve, reject) => {
        const tx = db_instance.transaction('offline_submissions', 'readwrite');
        const store = tx.objectStore('offline_submissions');
        item.synced = true;
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      syncedCount++;
    } catch (err) {
      console.error(`[Offline Storage] Failed to sync item ${item.id}:`, err);
      errors.push(err);
    }
  }

  return { syncedCount, errors };
}

// ----------------------------------------------------
// METRICS & STORAGE MANAGEMENT
// ----------------------------------------------------

export async function getOfflineStorageMetrics(): Promise<StorageMetrics> {
  try {
    const papers = await getOfflinePracticePapers();
    const drills = await getOfflineDailyDrills();
    const pending = await getPendingOfflineSubmissions();

    let totalSizeBytes = 0;
    papers.forEach(p => totalSizeBytes += (p.fileSizeBytes || 25000));
    drills.forEach(d => totalSizeBytes += (d.fileSizeBytes || 15000));

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 KB';
      const k = 1024;
      const dm = 1;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return {
      practiceCount: papers.length,
      drillCount: drills.length,
      pendingSubmissionsCount: pending.length,
      totalSizeBytes,
      formattedSize: formatBytes(totalSizeBytes)
    };
  } catch (err) {
    return {
      practiceCount: 0,
      drillCount: 0,
      pendingSubmissionsCount: 0,
      totalSizeBytes: 0,
      formattedSize: '0 KB'
    };
  }
}

/**
 * Clear all downloaded study materials and cached data
 */
export async function clearAllOfflineStudyData(): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(['practice_papers', 'daily_drills', 'exam_questions'], 'readwrite');
    tx.objectStore('practice_papers').clear();
    tx.objectStore('daily_drills').clear();
    tx.objectStore('exam_questions').clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Also clear Service Worker cache
    await sendSWMessage({ type: 'CLEAR_OFFLINE_STUDY_CACHE' });
    return true;
  } catch (err) {
    console.error('[Offline Storage] Failed to clear data:', err);
    return false;
  }
}
