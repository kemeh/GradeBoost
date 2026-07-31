import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, User, setPersistence, 
  browserLocalPersistence, browserSessionPersistence, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (fUser) {
        setLoading(true);
        // Refresh token in the background
        fUser.getIdToken(true).catch(console.error);
        
        const userRef = doc(db, 'users', fUser.uid);
        
        unsubDoc = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const profile = { uid: fUser.uid, ...data } as UserProfile;

            // Handle suspended account
            if (profile.status === 'suspended') {
              toast.error('Your account has been suspended by an Administrator.');
              await logAuditEvent({
                userId: fUser.uid,
                userEmail: fUser.email || undefined,
                action: 'LOGOUT',
                details: 'Forced logout due to account suspension.',
              });
              await auth.signOut();
              setUser(null);
              setLoading(false);
              return;
            }

            setUser(profile);
            setLoading(false);

            // Update last active date periodically
            try {
              await updateDoc(userRef, {
                lastLoginAt: serverTimestamp(),
                lastActiveDate: serverTimestamp(),
              });
            } catch (err) {
              // Non-critical background update ignore
            }
          } else {
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

              await logAuditEvent({
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
    const activityHandler = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('click', activityHandler);

    const interval = setInterval(() => {
      if (auth.currentUser && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
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
  }, [lastActivity]);

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
    } catch (err) {
      console.error('Failed to refresh session token:', err);
      return null;
    }
  };

  const logout = async () => {
    if (auth.currentUser) {
      await logAuditEvent({
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || undefined,
        action: 'LOGOUT',
        details: 'User initiated logout',
      });
    }
    await auth.signOut();
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
      refreshSessionToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
