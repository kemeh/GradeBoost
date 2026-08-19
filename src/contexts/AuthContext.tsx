import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  onAuthStateChanged, User, setPersistence, 
  browserLocalPersistence, browserSessionPersistence, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { logAuditEvent } from '../services/auditService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isEmailVerified: boolean;
  role: 'student' | 'teacher' | 'admin';
  logout: () => Promise<void>;
  setRememberMe: (remember: boolean) => Promise<void>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshSessionToken: () => Promise<string | null>;
  refreshUserProfile?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
  isEmailVerified: false,
  role: 'student',
  logout: async () => {},
  setRememberMe: async () => {},
  resendVerificationEmail: async () => false,
  refreshSessionToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

const AUTH_CACHE_KEY = 'edulpha_auth_user_cache';

const getInitialCachedUser = (): UserProfile | null => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // Ignore parse error
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getInitialCachedUser);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!getInitialCachedUser());
  const lastActivityRef = useRef(Date.now());

  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;
    let hasUpdatedLoginTime = false;

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      hasUpdatedLoginTime = false;
      
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (fUser) {
        const userRef = doc(db, 'users', fUser.uid);
        
        unsubDoc = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const profile = { uid: fUser.uid, ...data } as UserProfile;

            // Handle suspended or deleted account
            if (profile.status === 'suspended' || profile.status === 'deleted' || (profile as any).deleted) {
              toast.error(profile.status === 'deleted' || (profile as any).deleted ? 'Your account has been deleted by an administrator.' : 'Your account has been suspended by an Administrator.');
              void logAuditEvent({
                userId: fUser.uid,
                userEmail: fUser.email || undefined,
                action: 'LOGOUT',
                details: `Forced logout due to account ${profile.status || 'deletion'}.`,
              });
              await auth.signOut();
              try { localStorage.removeItem(AUTH_CACHE_KEY); } catch (e) {}
              setUser(null);
              setLoading(false);
              return;
            }

            try {
              localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(profile));
            } catch (e) {}

            setUser(profile);
            setLoading(false);

            // Update last active date once per session in the background
            if (!hasUpdatedLoginTime) {
              hasUpdatedLoginTime = true;
              void updateDoc(userRef, {
                lastLoginAt: serverTimestamp(),
                lastActiveDate: serverTimestamp(),
              }).catch(() => {});
            }
          } else {
            // Check if user is in deletedUsers collection before auto-creating profile
            let isDeletedAccount = false;
            try {
              const queries = [getDoc(doc(db, 'deletedUsers', fUser.uid))];
              if (fUser.email) {
                queries.push(getDoc(doc(db, 'deletedUsersByEmail', fUser.email.toLowerCase().trim())));
              }
              const results = await Promise.all(queries);
              const delSnap = results[0];
              const delEmailSnap = results[1];
              
              if (delSnap?.exists() || delEmailSnap?.exists()) {
                isDeletedAccount = true;
              }
            } catch (e) {
              console.warn('Error checking deletedUsers collection:', e);
            }

            if (isDeletedAccount) {
              toast.error('Your account has been deleted or disabled by an administrator.');
              void logAuditEvent({
                userId: fUser.uid,
                userEmail: fUser.email || undefined,
                action: 'LOGOUT',
                details: 'Blocked authentication for deleted user account.',
              });
              await auth.signOut();
              try { localStorage.removeItem(AUTH_CACHE_KEY); } catch (e) {}
              setUser(null);
              setLoading(false);
              return;
            }

            // Auto-create profile if it doesn't exist
            const isAdminEmail = fUser.email?.toLowerCase() === 'kemehhilary@gmail.com';
            try {
              const newProfileData = {
                name: fUser.displayName || (isAdminEmail ? 'Admin User' : 'Student User'),
                email: fUser.email,
                subject: '',
                school: 'Online',
                region: isAdminEmail ? 'Admin' : 'Unknown',
                assignedPapers: ['paper1', 'paper2', 'paper3'],
                targetGrade: 'A',
                role: isAdminEmail ? 'admin' : 'student',
                status: 'active',
                hasTakenDiagnostic: isAdminEmail ? true : false,
                isPaid: isAdminEmail ? true : false,
                paymentStatus: isAdminEmail ? 'paid' : 'unpaid',
                paymentExpiryDate: isAdminEmail ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
              };
              await setDoc(userRef, newProfileData);
              console.log("User profile auto-created for UID:", fUser.uid);

              void logAuditEvent({
                userId: fUser.uid,
                userEmail: fUser.email || undefined,
                action: 'REGISTER_SUCCESS',
                details: `Profile auto-created with role: ${isAdminEmail ? 'admin' : 'student'}`,
              });
            } catch (err) {
              console.error("Failed to auto-create user profile:", err);
              setUser(null);
              setLoading(false);
            }
          }
        }, (error) => {
          console.error("AuthContext Firestore Error:", error);
          if ((error as any).code === 'auth/network-request-failed') {
            toast.error('Network connection issue. If this persists, please open the app in a new tab.');
          }
          setLoading(false);
          try {
            handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
          } catch (e) {
            console.error("AuthContext Firestore Error (Handled):", e);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // Inactivity timer
  useEffect(() => {
    const activityHandler = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('click', activityHandler);

    const interval = setInterval(() => {
      if (auth.currentUser && Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        console.log("Auto-logging out due to inactivity");
        logAuditEvent({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || undefined,
          action: 'LOGOUT',
          details: 'Session expired due to 30 minutes inactivity.',
        });
        auth.signOut();
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('click', activityHandler);
      clearInterval(interval);
    };
  }, []);

  const isAdmin = user?.role === 'admin' || firebaseUser?.email?.toLowerCase() === 'kemehhilary@gmail.com';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student' || (!isAdmin && !isTeacher);
  const role: 'student' | 'teacher' | 'admin' = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';
  const isEmailVerified = firebaseUser?.emailVerified || false;

  const setRememberMe = async (remember: boolean) => {
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    } catch (err) {
      console.error("Error setting session persistence:", err);
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent to ' + auth.currentUser.email);
      await logAuditEvent({
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || undefined,
        action: 'PASSWORD_RESET_REQUEST',
        details: 'Sent email verification link',
      });
      return true;
    } catch (err: any) {
      console.error('Failed to resend verification email:', err);
      toast.error(err.message || 'Failed to send verification email');
      return false;
    }
  };

  const refreshSessionToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(true);
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        try {
          return await auth.currentUser.getIdToken(false);
        } catch (cacheErr) {
          console.warn('Failed to retrieve cached ID token:', cacheErr);
        }
      }
      console.error('Failed to refresh session token:', err);
      return null;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } catch (e) {}
    if (auth.currentUser) {
      void logAuditEvent({
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || undefined,
        action: 'LOGOUT',
        details: 'User initiated logout',
      });
    }
    await auth.signOut();
    setUser(null);
  };

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken(true);
      console.log('Refreshed user token:', token ? 'Token updated' : 'No token');
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      isAdmin, 
      isTeacher, 
      isStudent, 
      isEmailVerified, 
      role, 
      logout,
      setRememberMe,
      resendVerificationEmail,
      refreshSessionToken,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
