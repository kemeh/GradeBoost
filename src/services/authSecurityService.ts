import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { logAuditEvent } from './auditService';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface LockoutState {
  isLocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
}

function getSanitizedEmailKey(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export async function checkAccountLockout(email: string): Promise<LockoutState> {
  if (!email) return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  
  try {
    const key = getSanitizedEmailKey(email);
    const lockRef = doc(db, 'auth_security', key);
    const lockSnap = await getDoc(lockRef);

    if (!lockSnap.exists()) {
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    const data = lockSnap.data();
    const failedAttempts = data.failedAttempts || 0;
    const lockedUntil = data.lockedUntil ? new Date(data.lockedUntil).getTime() : 0;
    const now = Date.now();

    if (lockedUntil > now) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, failedAttempts };
    }

    // Lockout expired, reset if needed
    if (failedAttempts >= MAX_FAILED_ATTEMPTS && lockedUntil <= now) {
      await deleteDoc(lockRef);
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, failedAttempts };
  } catch (error) {
    // If client is offline or network unavailable, degrade gracefully without blocking user login
    return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  }
}

export async function recordFailedAttempt(email: string): Promise<LockoutState> {
  if (!email) return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  
  try {
    const key = getSanitizedEmailKey(email);
    const lockRef = doc(db, 'auth_security', key);
    const lockSnap = await getDoc(lockRef);

    let attempts = 1;
    let lockedUntil: number | null = null;

    if (lockSnap.exists()) {
      const data = lockSnap.data();
      attempts = (data.failedAttempts || 0) + 1;
    }

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      await logAuditEvent({
        userEmail: email,
        action: 'ACCOUNT_LOCKED',
        details: `Account locked for 15 minutes after ${attempts} failed attempts.`,
      });
    }

    await setDoc(lockRef, {
      email: email.toLowerCase(),
      failedAttempts: attempts,
      lastFailedAt: new Date().toISOString(),
      lockedUntil: lockedUntil ? new Date(lockedUntil).toISOString() : null,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await logAuditEvent({
      userEmail: email,
      action: 'LOGIN_FAILED',
      details: `Failed attempt ${attempts}/${MAX_FAILED_ATTEMPTS}`,
    });

    const isLocked = attempts >= MAX_FAILED_ATTEMPTS;
    const remainingSeconds = isLocked && lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

    return { isLocked, remainingSeconds, failedAttempts: attempts };
  } catch (error) {
    return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  }
}

export async function clearFailedAttempts(email: string): Promise<void> {
  if (!email) return;
  try {
    const key = getSanitizedEmailKey(email);
    const lockRef = doc(db, 'auth_security', key);
    await deleteDoc(lockRef);
  } catch (error) {
    // Graceful offline fallback
  }
}

export async function adminUnlockAccount(email: string, userId?: string): Promise<void> {
  if (!email) return;
  try {
    const key = getSanitizedEmailKey(email);
    const lockRef = doc(db, 'auth_security', key);
    await deleteDoc(lockRef);

    if (userId) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'active',
        isLocked: false,
        lockoutUntil: null,
        failedLoginAttempts: 0,
      });
    }

    await logAuditEvent({
      userId,
      userEmail: email,
      action: 'ACCOUNT_UNLOCKED',
      details: 'Account manually unlocked by Administrator.',
    });
  } catch (error) {
    // Graceful offline fallback
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
