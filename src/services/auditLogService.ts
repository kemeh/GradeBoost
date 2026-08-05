import { collection, getDocs, addDoc, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  adminName: string;
  action: string;
  recordType: 'ambassador' | 'alumni' | 'demo_cleanup' | 'user' | 'system';
  recordId?: string;
  recordName?: string;
  details?: string;
  affectedCount?: number;
  timestamp: string;
}

const AUDIT_LOGS_COLLECTION = 'adminAuditLogs';
const LOCAL_STORAGE_KEY = 'edulpha_audit_logs';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    adminEmail: 'admin@edulpha.cm',
    adminName: 'Super Admin',
    action: 'System Initialization',
    recordType: 'system',
    details: 'Edulpha administrative audit logging engine initialized',
    affectedCount: 1,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export async function logAdminAction(
  adminEmail: string,
  adminName: string,
  action: string,
  recordType: AuditLogEntry['recordType'],
  details?: string,
  recordId?: string,
  recordName?: string,
  affectedCount: number = 1
): Promise<string> {
  const newEntry: AuditLogEntry = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    adminEmail,
    adminName,
    action,
    recordType,
    recordId,
    recordName,
    details,
    affectedCount,
    timestamp: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), newEntry);
  } catch (err) {
    console.warn('Saving audit log to local fallback:', err);
  }

  // Always update localStorage fallback as well
  const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  existing.unshift(newEntry);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.slice(0, 200)));

  return newEntry.id;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    const logs: AuditLogEntry[] = [];
    snap.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as AuditLogEntry);
    });

    const localLogs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const combined = [...logs];
    localLogs.forEach((ll: AuditLogEntry) => {
      if (!combined.some(item => item.id === ll.id)) {
        combined.push(ll);
      }
    });

    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return combined.length > 0 ? combined : INITIAL_AUDIT_LOGS;
  } catch (err) {
    console.warn('Loading audit logs from local storage fallback:', err);
    const localLogs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return localLogs.length > 0 ? localLogs : INITIAL_AUDIT_LOGS;
  }
}

export async function clearAllAuditLogs(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  try {
    const snap = await getDocs(collection(db, AUDIT_LOGS_COLLECTION));
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Error clearing audit logs from Firestore:', err);
  }
}
