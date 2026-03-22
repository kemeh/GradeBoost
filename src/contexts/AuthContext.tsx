import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isEmailVerified: false,
  logout: async () => {},
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
        const userRef = doc(db, 'users', fUser.uid);
        
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          // Auto-create profile if it doesn't exist
          const isAdminEmail = fUser.email === 'kemehhilary@gmail.com';
          try {
            await setDoc(userRef, {
              name: fUser.displayName || (isAdminEmail ? 'Admin' : 'Student'),
              email: fUser.email,
              subject: 'Computer Science',
              school: 'Online',
              region: isAdminEmail ? 'Admin' : 'Unknown',
              assignedPapers: ['paper1', 'paper2', 'paper3'],
              targetGrade: 'A',
              role: isAdminEmail ? 'admin' : 'student',
              hasTakenDiagnostic: isAdminEmail ? true : false,
              isPaid: isAdminEmail ? true : false,
              paymentStatus: isAdminEmail ? 'paid' : 'unpaid',
              paymentExpiryDate: isAdminEmail ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
              createdAt: serverTimestamp(),
            });
            console.log("User profile auto-created for UID:", fUser.uid);
          } catch (err) {
            console.error("Failed to auto-create user profile:", err);
          }
        }

        unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: fUser.uid, ...docSnap.data() } as UserProfile);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          // Log error but don't throw to prevent app hang
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

  const isAdmin = user?.role === 'admin' || firebaseUser?.email === 'kemehhilary@gmail.com';
  const isEmailVerified = firebaseUser?.emailVerified || false;

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin, isEmailVerified, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
