import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, limit, setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  LMSLesson, LMSHierarchyItem, LMSUserProgress, LMSBookmark, LMSNote 
} from '../types';

// Default initial hierarchy nodes for GradeBoost60
export const DEFAULT_EDUCATION_LEVELS = ['Ordinary Level', 'Advanced Level', 'TVET & Technical'];
export const DEFAULT_DEPARTMENTS = ['Science & Tech', 'Commercial & Management', 'Arts & Humanities', 'Languages'];

// --- LESSON CRUD ---
export const fetchAllLessons = async (): Promise<LMSLesson[]> => {
  const q = query(collection(db, 'lms_lessons'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LMSLesson));
};

export const fetchPublishedLessons = async (): Promise<LMSLesson[]> => {
  const snap = await getDocs(collection(db, 'lms_lessons'));
  const lessons = snap.docs.map(d => ({ id: d.id, ...d.data() } as LMSLesson));
  const nowStr = new Date().toISOString();
  
  return lessons.filter(l => {
    if (l.status === 'published') return true;
    if (l.status === 'scheduled' && l.scheduledAt && l.scheduledAt <= nowStr) return true;
    return false;
  }).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
};

export const getLessonById = async (id: string): Promise<LMSLesson | null> => {
  const ref = doc(db, 'lms_lessons', id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as LMSLesson;
  }
  return null;
};

export const createLesson = async (data: Omit<LMSLesson, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'lms_lessons'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateLesson = async (id: string, data: Partial<LMSLesson>): Promise<void> => {
  const ref = doc(db, 'lms_lessons', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteLesson = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'lms_lessons', id));
};

export const duplicateLesson = async (lesson: LMSLesson): Promise<string> => {
  const { id, ...copyData } = lesson;
  const newLesson = {
    ...copyData,
    title: `${copyData.title} (Copy)`,
    status: 'draft' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(collection(db, 'lms_lessons'), newLesson);
  return docRef.id;
};

// --- HIERARCHY CRUD ---
export const fetchHierarchyItems = async (): Promise<LMSHierarchyItem[]> => {
  const snap = await getDocs(collection(db, 'lms_hierarchy'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LMSHierarchyItem));
};

export const saveHierarchyItem = async (data: Omit<LMSHierarchyItem, 'id'> & { id?: string }): Promise<string> => {
  if (data.id) {
    const ref = doc(db, 'lms_hierarchy', data.id);
    const { id, ...updateData } = data;
    await updateDoc(ref, updateData);
    return id;
  } else {
    const docRef = await addDoc(collection(db, 'lms_hierarchy'), data);
    return docRef.id;
  }
};

export const deleteHierarchyItem = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'lms_hierarchy', id));
};

// --- STUDENT PROGRESS & NOTES ---
export const fetchStudentLMSProgress = async (userId: string): Promise<LMSUserProgress[]> => {
  const q = query(collection(db, 'lms_progress'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LMSUserProgress));
};

export const saveLessonProgress = async (
  userId: string, 
  lessonId: string, 
  subjectOrObj: string | { completed?: boolean; subject?: string; topic?: string; progressPercent?: number; lastAccessedAt?: string }, 
  topic?: string, 
  completed?: boolean, 
  progressPercent?: number,
  additionalStudyTimeSeconds: number = 0,
  quizScores?: Record<string, number>
): Promise<void> => {
  const progressDocId = `${userId}_${lessonId}`;
  const ref = doc(db, 'lms_progress', progressDocId);
  const snap = await getDoc(ref);

  let currentStudyTime = 0;
  let currentQuizScores = {};

  if (snap.exists()) {
    const existing = snap.data();
    currentStudyTime = existing.studyTimeSeconds || 0;
    currentQuizScores = existing.quizScores || {};
  }

  const isObj = typeof subjectOrObj === 'object';
  const finalSubject = isObj ? (subjectOrObj.subject || 'General') : (subjectOrObj as string);
  const finalTopic = isObj ? (subjectOrObj.topic || 'General') : (topic || 'General');
  const finalCompleted = isObj ? Boolean(subjectOrObj.completed) : Boolean(completed);
  const finalPercent = isObj ? (subjectOrObj.progressPercent ?? (finalCompleted ? 100 : 50)) : (progressPercent ?? 0);

  const updatedQuizScores = { ...currentQuizScores, ...(quizScores || {}) };

  await setDoc(ref, {
    userId,
    lessonId,
    subject: finalSubject,
    topic: finalTopic,
    completed: finalCompleted,
    progressPercent: Math.min(100, Math.max(0, finalPercent)),
    studyTimeSeconds: currentStudyTime + additionalStudyTimeSeconds,
    quizScores: updatedQuizScores,
    completedAt: finalCompleted ? serverTimestamp() : null,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

// --- BOOKMARKS & NOTES ---
export const fetchUserBookmarks = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'lms_bookmarks'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().lessonId as string);
};

export const toggleUserBookmark = async (userId: string, lessonId: string): Promise<boolean> => {
  const bookmarkDocId = `${userId}_${lessonId}`;
  const ref = doc(db, 'lms_bookmarks', bookmarkDocId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false; // unbookmarked
  } else {
    await setDoc(ref, {
      userId,
      lessonId,
      createdAt: serverTimestamp()
    });
    return true; // bookmarked
  }
};

export const fetchLessonNotes = async (userId: string, lessonId?: string): Promise<LMSNote[]> => {
  let q;
  if (lessonId) {
    q = query(
      collection(db, 'lms_notes'),
      where('userId', '==', userId),
      where('lessonId', '==', lessonId)
    );
  } else {
    q = query(
      collection(db, 'lms_notes'),
      where('userId', '==', userId)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as object) } as LMSNote));
};

export const saveLessonNote = async (
  userId: string, 
  lessonId: string, 
  noteData: any, 
  highlightText?: string
): Promise<string> => {
  const payload = typeof noteData === 'string' ? {
    userId,
    lessonId,
    noteText: noteData,
    title: 'Lesson Note',
    content: noteData,
    highlightText: highlightText || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  } : {
    userId,
    lessonId,
    title: noteData.title || 'Lesson Note',
    content: noteData.content || noteData.noteText || '',
    noteText: noteData.noteText || noteData.content || '',
    highlightText: noteData.highlightText || highlightText || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'lms_notes'), payload);
  return ref.id;
};

export const deleteLessonNote = async (noteId: string): Promise<void> => {
  await deleteDoc(doc(db, 'lms_notes', noteId));
};
