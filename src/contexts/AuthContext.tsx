import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface User {
  id: string;
  name: string;
  email: string;
  school: string;
  age: number;
  phoneNumber: string;
  sex: string;
  class: string;
  region: string;
  isPaid: boolean;
  currentDay: number;
  streak: number;
  lastCompletedAt?: string;
  role: 'student' | 'admin';
  examHistory?: {
    examId: string;
    examTitle: string;
    score: number;
    completedAt: string;
  }[];
  displayName?: string;
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      if (firebaseUser) {
        // Listen to user document in real-time
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          console.log('User doc snap:', docSnap.exists());
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Snapshot error:', error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() } as User);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}`);
    }
  };

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
