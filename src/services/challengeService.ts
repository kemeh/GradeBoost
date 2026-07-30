import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Challenge, ChallengeDay, ChallengeEnrollment, ChallengeProgress } from '../types';

export const fetchAllChallenges = async (): Promise<Challenge[]> => {
  const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
};

export const fetchPublishedChallenges = async (): Promise<Challenge[]> => {
  const q = query(
    collection(db, 'challenges'), 
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const challenges = snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
  // Sort client side by createdAt
  return challenges.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

export const createChallenge = async (data: Omit<Challenge, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'challenges'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateChallenge = async (id: string, data: Partial<Challenge>): Promise<void> => {
  const ref = doc(db, 'challenges', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteChallenge = async (id: string): Promise<void> => {
  // Delete challenge doc
  await deleteDoc(doc(db, 'challenges', id));

  // Delete associated challengeDays
  const daysQ = query(collection(db, 'challengeDays'), where('challengeId', '==', id));
  const daysSnap = await getDocs(daysQ);
  const batch = writeBatch(db);
  daysSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

export const fetchChallengeDays = async (challengeId: string): Promise<ChallengeDay[]> => {
  const q = query(
    collection(db, 'challengeDays'),
    where('challengeId', '==', challengeId)
  );
  const snap = await getDocs(q);
  const days = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeDay));
  return days.sort((a, b) => a.dayNumber - b.dayNumber);
};

export const saveChallengeDay = async (data: Partial<ChallengeDay> & { challengeId: string; dayNumber: number }): Promise<string> => {
  if (data.id) {
    const ref = doc(db, 'challengeDays', data.id);
    const { id, ...updateData } = data;
    await updateDoc(ref, updateData);
    return id;
  } else {
    // Check if day exists
    const q = query(
      collection(db, 'challengeDays'),
      where('challengeId', '==', data.challengeId),
      where('dayNumber', '==', data.dayNumber)
    );
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      await updateDoc(existingDoc.ref, data);
      return existingDoc.id;
    } else {
      const docRef = await addDoc(collection(db, 'challengeDays'), {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  }
};

export const deleteChallengeDay = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'challengeDays', id));
};

export const fetchStudentEnrollments = async (studentId: string): Promise<ChallengeEnrollment[]> => {
  const q = query(collection(db, 'challengeEnrollments'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeEnrollment));
};

export const enrollInChallenge = async (studentId: string, challengeId: string): Promise<ChallengeEnrollment> => {
  // Check if already enrolled
  const q = query(
    collection(db, 'challengeEnrollments'),
    where('studentId', '==', studentId),
    where('challengeId', '==', challengeId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ChallengeEnrollment;
  }

  const newEnrollment = {
    studentId,
    challengeId,
    progress: 0,
    completedDays: [],
    joinedDate: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'challengeEnrollments'), newEnrollment);
  return { id: ref.id, ...newEnrollment };
};

export const toggleDayCompletion = async (
  enrollmentId: string, 
  studentId: string, 
  challengeId: string, 
  dayNumber: number,
  totalDays: number
): Promise<{ completedDays: number[]; progress: number }> => {
  const enrollmentRef = doc(db, 'challengeEnrollments', enrollmentId);
  const snap = await getDoc(enrollmentRef);
  
  let completedDays: number[] = [];
  if (snap.exists()) {
    completedDays = snap.data().completedDays || [];
  }

  if (completedDays.includes(dayNumber)) {
    completedDays = completedDays.filter(d => d !== dayNumber);
  } else {
    completedDays.push(dayNumber);
  }

  const progress = Math.round((completedDays.length / Math.max(1, totalDays)) * 100);

  await updateDoc(enrollmentRef, {
    completedDays,
    progress,
    updatedAt: serverTimestamp()
  });

  return { completedDays, progress };
};
