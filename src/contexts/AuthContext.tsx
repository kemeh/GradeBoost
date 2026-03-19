import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      // Clean up previous document listener if it exists
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (fUser) {
        setLoading(true);
        const userRef = doc(db, 'users', fUser.uid);
        
        // Check if document exists, if not and it's the admin email, create it
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists() && fUser.email === 'kemehhilary@gmail.com') {
          try {
            await setDoc(userRef, {
              name: 'Admin',
              email: fUser.email,
              subject: 'Computer Science',
              school: 'GradeBoost 60',
              region: 'Admin',
              assignedPapers: ['paper1', 'paper2', 'paper3'],
              targetGrade: 'A',
              role: 'admin',
              hasTakenDiagnostic: true,
              paymentStatus: 'paid',
              paymentExpiryDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: serverTimestamp(),
            });
          } catch (err) {
            console.error("Failed to auto-create admin profile:", err);
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
          console.error("AuthContext Firestore Error:", error);
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

  const isAdmin = user?.role === 'admin' || firebaseUser?.email === 'kemehhilary@gmail.com';

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
