import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export interface AuditLogEntry {
  id?: string;
  userId?: string;
  userEmail?: string;
  action: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILED' 
    | 'ACCOUNT_LOCKED' 
    | 'ACCOUNT_UNLOCKED'
    | 'REGISTER_SUCCESS' 
    | 'PASSWORD_RESET_REQUEST'
    | 'ROLE_CHANGED' 
    | 'USER_SUSPENDED'
    | 'USER_ACTIVATED'
    | 'PROFILE_UPDATED'
    | 'LOGOUT';
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: any;
}

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...entry,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to write audit log entry:', error);
  }
}

export async function fetchAuditLogs(limitCount = 50, userEmail?: string): Promise<AuditLogEntry[]> {
  try {
    let q;
    if (userEmail) {
      q = query(
        collection(db, 'audit_logs'),
        where('userEmail', '==', userEmail),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as object)
    })) as AuditLogEntry[];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}
