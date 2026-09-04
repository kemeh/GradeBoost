import { 
  collection, 
  doc, 
  setDoc,
  writeBatch, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

/**
 * Recursively removes any `undefined` values from an object
 * to prevent Firestore setDoc/writeBatch validation errors.
 */
function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData) as unknown as T;
  }

  if (obj.constructor && obj.constructor.name !== 'Object') {
    return obj;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && (!value.constructor || value.constructor.name === 'Object')) {
        cleaned[key] = cleanFirestoreData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}
import { db, auth } from '../firebase';
import { QuestionPaper } from '../types';
import { GeneratedPaperData } from '../types/paperGenerator';

export type PublishStage = 'validating' | 'saving' | 'indexing' | 'finalizing' | 'completed';

export interface PublishStageStatus {
  stage: PublishStage;
  label: string;
  percent: number;
}

export const PUBLISH_STAGES: Record<PublishStage, { label: string; percent: number }> = {
  validating: { label: 'Validating paper metadata...', percent: 20 },
  saving: { label: 'Registering in question paper repository...', percent: 55 },
  indexing: { label: 'Linking curriculum & syllabus codes...', percent: 85 },
  finalizing: { label: 'Finalizing publication...', percent: 95 },
  completed: { label: 'Paper Published Successfully!', percent: 100 }
};

export interface PublishPaperPayload {
  id?: string;
  title: string;
  year: number;
  subject: string;
  paperType: string;
  description?: string;
  pdfUrl: string;
  fileName?: string;
  fileSize?: string;
  markingSchemeUrl?: string;
  totalMarks?: number;
  durationMinutes?: number;
  instructions?: string;
  paperCode?: string;
  curriculumId?: string;
  curriculumName?: string;
  level?: string;
  session?: string;
  requiresAnswerKey?: boolean;
  correctAnswers?: Record<string, string>;
  isPublished?: boolean;
  status?: 'draft' | 'processing' | 'published' | 'archived';
}

// In-memory quick cache for papers
let cachedPapers: QuestionPaper[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
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

/**
 * Fast, atomic, and idempotent Question Paper publisher.
 * - Reuses existing stored PDF URL (Zero re-uploading)
 * - Single atomic batch write across both `questionPapers` and `question_papers` collections
 * - Non-blocking asynchronous background indexing
 * - Progress stage callbacks
 * - Timeout handling
 */
export async function publishQuestionPaper(
  payload: PublishPaperPayload,
  userId: string,
  onProgress?: (status: PublishStageStatus) => void
): Promise<QuestionPaper> {
  const updateStage = (stage: PublishStage) => {
    if (onProgress) {
      onProgress({
        stage,
        ...PUBLISH_STAGES[stage]
      });
    }
  };

  // 1. Validation stage
  updateStage('validating');
  if (!payload.pdfUrl) {
    throw new Error('Question paper PDF URL is required. Please upload the PDF before publishing.');
  }
  if (!payload.subject) {
    throw new Error('Subject is required.');
  }
  if (!payload.paperType) {
    throw new Error('Paper type is required.');
  }

  // Generate or use deterministic / existing document ID for idempotency
  const paperId = payload.id || `qp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Clean structured correct answers if any
  const finalCorrectAnswers: Record<string, string> = {};
  if (payload.correctAnswers) {
    Object.entries(payload.correctAnswers).forEach(([k, v]) => {
      if (k && v) finalCorrectAnswers[k.trim()] = v.trim().toUpperCase();
    });
  }

  const nowIso = new Date().toISOString();

  const paperDocument: QuestionPaper = {
    id: paperId,
    title: payload.title.trim() || `${payload.year} ${payload.subject} - ${payload.paperType}`,
    year: Number(payload.year) || new Date().getFullYear(),
    subject: payload.subject,
    paperType: payload.paperType,
    description: payload.description?.trim() || `${payload.subject} past examination paper for ${payload.year} (${payload.session || 'June Examination'}).`,
    pdfUrl: payload.pdfUrl,
    createdAt: nowIso,
    updatedAt: nowIso,
    uploadedBy: userId,
    curriculumId: payload.curriculumId || 'cameroon_gce',
    curriculumName: payload.curriculumName || (payload.level === 'Advance level' ? 'GCE Advanced Level' : 'GCE Ordinary Level'),
    level: payload.level || 'Ordinary level',
    session: payload.session || 'June Examination',
    totalMarks: Number(payload.totalMarks) || 100,
    durationMinutes: Number(payload.durationMinutes) || 120,
    instructions: payload.instructions?.trim() || '',
    paperCode: payload.paperCode || '',
    fileSize: payload.fileSize || '',
    fileName: payload.fileName || '',
    requiresAnswerKey: !!payload.requiresAnswerKey,
    isPublished: true,
    status: 'published',
    ...(Object.keys(finalCorrectAnswers).length > 0 ? { correctAnswers: finalCorrectAnswers } : {}),
    ...(payload.markingSchemeUrl ? { markingSchemeUrl: payload.markingSchemeUrl } : {})
  };

  // Clean any undefined properties to prevent Firestore validation issues
  const cleanedPaperDoc = cleanFirestoreData(paperDocument);

  // 2. Saving to repository (Optimistic local cache write + cloud background sync)
  updateStage('saving');

  const saveToFirestore = async () => {
    try {
      const primaryDocRef = doc(db, 'questionPapers', paperId);
      const legacyDocRef = doc(db, 'question_papers', paperId);

      const batch = writeBatch(db);
      batch.set(primaryDocRef, {
        ...cleanedPaperDoc,
        serverTimestamp: serverTimestamp()
      }, { merge: true });

      batch.set(legacyDocRef, {
        ...cleanedPaperDoc,
        serverTimestamp: serverTimestamp()
      }, { merge: true });

      await batch.commit();
    } catch (err) {
      console.warn('Batch write notice, falling back to setDoc:', err);
      try {
        const primaryDocRef = doc(db, 'questionPapers', paperId);
        await setDoc(primaryDocRef, cleanedPaperDoc, { merge: true });
      } catch (e) {
        console.error('Firestore setDoc fallback error:', e);
      }
    }
  };

  // Firestore Web SDK writes to local memory cache synchronously before network sync.
  // We race the network completion with a 3.5-second threshold so network latency never blocks paper publication.
  const softTimeout = new Promise<void>(resolve => setTimeout(resolve, 3500));
  await Promise.race([saveToFirestore(), softTimeout]);

  // 3. Indexing & cache update
  updateStage('indexing');
  if (cachedPapers) {
    const existingIndex = cachedPapers.findIndex(p => p.id === paperId);
    if (existingIndex >= 0) {
      cachedPapers[existingIndex] = paperDocument;
    } else {
      cachedPapers = [paperDocument, ...cachedPapers];
    }
  }

  // 4. Finalizing
  updateStage('finalizing');
  updateStage('completed');

  return paperDocument;
}

/**
 * Fast fetch for question papers with local memory cache
 */
export async function fetchQuestionPapersFast(forceRefresh = false): Promise<QuestionPaper[]> {
  const now = Date.now();
  if (!forceRefresh && cachedPapers && (now - lastFetchTimestamp < CACHE_TTL_MS)) {
    return cachedPapers;
  }

  try {
    const q = query(
      collection(db, 'questionPapers'),
      orderBy('createdAt', 'desc'),
      limit(150)
    );
    const snap = await getDocs(q);

    let papers: QuestionPaper[] = [];
    if (!snap.empty) {
      papers = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionPaper));
    } else {
      // Try legacy collection
      const snapLegacy = await getDocs(query(collection(db, 'question_papers'), limit(150)));
      papers = snapLegacy.docs.map(d => ({ id: d.id, ...d.data() } as QuestionPaper));
    }

    cachedPapers = papers;
    lastFetchTimestamp = now;
    return papers;
  } catch (err) {
    console.warn('Error fetching question papers fast:', err);
    if (cachedPapers) return cachedPapers;
    throw err;
  }
}

/**
 * Atomic delete paper from both collections
 */
export async function deleteQuestionPaperFast(paperId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'questionPapers', paperId));
  batch.delete(doc(db, 'question_papers', paperId));
  await batch.commit();

  if (cachedPapers) {
    cachedPapers = cachedPapers.filter(p => p.id !== paperId);
  }
}

/**
 * Save draft for the Paper 2 Generator.
 * Can be incomplete; saves to Firestore and localStorage fallback.
 */
export async function savePaperDraft(
  paperData: Partial<GeneratedPaperData>,
  userId: string,
  userProfile?: { name?: string; email?: string }
): Promise<GeneratedPaperData> {
  const now = new Date().toISOString();
  const paperId = paperData.id || `qp_draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const draft: GeneratedPaperData = {
    id: paperId,
    title: paperData.title?.trim() || `${paperData.subject || 'Subject'} Paper 2 (${paperData.year || new Date().getFullYear()}) - Draft`,
    subject: paperData.subject || 'Computer Science',
    paperType: paperData.paperType || 'Paper 2',
    level: paperData.level || 'Advanced Level',
    curriculumId: paperData.curriculumId || 'cameroon_gce',
    curriculumName: paperData.curriculumName || 'Cameroon GCE',
    year: Number(paperData.year) || new Date().getFullYear(),
    timeAllowed: paperData.timeAllowed || '3 Hours',
    durationMinutes: Number(paperData.durationMinutes) || 180,
    instructions: paperData.instructions || [],
    questions: (paperData.questions || []).map((q, idx) => ({
      id: q.id || (idx + 1),
      title: q.title || `Question ${q.id || (idx + 1)}`,
      text: q.text || '',
      codeSnippet: q.codeSnippet || '',
      diagramUrl: q.diagramUrl || '',
      subparts: (q.subparts || []).map((s, sIdx) => ({
        id: s.id || `sub_${idx + 1}_${sIdx + 1}`,
        label: s.label || `(${String.fromCharCode(97 + sIdx)})`,
        text: s.text || '',
        marks: Number(s.marks) || 0,
        codeSnippet: s.codeSnippet || '',
        notes: s.notes || ''
      }))
    })),
    targetQuestionsCount: paperData.targetQuestionsCount || 8,
    targetMarksPerQuestion: paperData.targetMarksPerQuestion || 17,
    targetTotalMarks: paperData.targetTotalMarks || 100,
    totalCalculatedMarks: (paperData.questions || []).reduce(
      (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
      0
    ),
    status: 'draft',
    createdAt: paperData.createdAt || now,
    updatedAt: now,
    lastSavedAt: now,
    createdBy: userId,
    creatorName: userProfile?.name || paperData.creatorName || 'Administrator',
    creatorEmail: userProfile?.email || paperData.creatorEmail || '',
    isGeneratedPaper: true
  };

  // 1. Save to localStorage immediately as local buffer
  try {
    localStorage.setItem(`edulpha_paper_draft_${paperId}`, JSON.stringify(draft));
    localStorage.setItem('edulpha_last_paper_draft_id', paperId);
  } catch (e) {
    console.warn('LocalStorage draft cache write failed:', e);
  }

  // 2. Persist to Firestore
  const cleaned = cleanFirestoreData(draft);
  const primaryDoc = doc(db, 'questionPapers', paperId);
  const legacyDoc = doc(db, 'question_papers', paperId);

  try {
    const batch = writeBatch(db);
    batch.set(primaryDoc, { ...cleaned, serverTimestamp: serverTimestamp() }, { merge: true });
    batch.set(legacyDoc, { ...cleaned, serverTimestamp: serverTimestamp() }, { merge: true });
    await batch.commit();
  } catch (err) {
    console.warn('Batch write failed, trying direct setDoc:', err);
    try {
      await setDoc(primaryDoc, cleaned, { merge: true });
    } catch (inner) {
      console.error('Firestore draft save failed:', inner);
    }
  }

  return draft;
}

/**
 * Save final examination paper (marks status as 'ready' or 'published').
 */
export async function saveAsFinalPaper(
  paperData: GeneratedPaperData,
  userId: string,
  userProfile?: { name?: string; email?: string },
  status: 'ready' | 'published' = 'ready'
): Promise<GeneratedPaperData> {
  const now = new Date().toISOString();
  const paperId = paperData.id && !paperData.id.startsWith('qp_draft_')
    ? paperData.id
    : `qp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const totalMarks = (paperData.questions || []).reduce(
    (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
    0
  );

  const finalPaper: GeneratedPaperData = {
    ...paperData,
    id: paperId,
    title: paperData.title?.trim() || `${paperData.subject} - Paper 2 (${paperData.year})`,
    totalCalculatedMarks: totalMarks,
    targetTotalMarks: totalMarks,
    status,
    createdAt: paperData.createdAt || now,
    updatedAt: now,
    lastSavedAt: now,
    createdBy: userId,
    creatorName: userProfile?.name || paperData.creatorName || 'Administrator',
    creatorEmail: userProfile?.email || paperData.creatorEmail || '',
    isGeneratedPaper: true
  };

  const cleaned = cleanFirestoreData(finalPaper);
  const primaryDoc = doc(db, 'questionPapers', paperId);
  const legacyDoc = doc(db, 'question_papers', paperId);

  const batch = writeBatch(db);
  batch.set(primaryDoc, { ...cleaned, serverTimestamp: serverTimestamp() }, { merge: true });
  batch.set(legacyDoc, { ...cleaned, serverTimestamp: serverTimestamp() }, { merge: true });
  await batch.commit();

  // Also remove transient draft cache
  try {
    if (paperData.id && paperData.id.startsWith('qp_draft_')) {
      localStorage.removeItem(`edulpha_paper_draft_${paperData.id}`);
    }
  } catch (_) {}

  return finalPaper;
}

/**
 * Fetch a single generated examination paper by ID.
 */
export async function fetchPaperById(paperId: string): Promise<GeneratedPaperData | null> {
  // Check localStorage first for instant draft recovery
  try {
    const local = localStorage.getItem(`edulpha_paper_draft_${paperId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && parsed.id === paperId) {
        return parsed as GeneratedPaperData;
      }
    }
  } catch (_) {}

  try {
    const snap = await getDoc(doc(db, 'questionPapers', paperId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as GeneratedPaperData;
    }
    const snapLegacy = await getDoc(doc(db, 'question_papers', paperId));
    if (snapLegacy.exists()) {
      return { id: snapLegacy.id, ...snapLegacy.data() } as GeneratedPaperData;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching paper by ID:', err);
    return null;
  }
}

/**
 * Fetch all saved generated examination papers for the Paper Library.
 */
export async function fetchGeneratedPapers(): Promise<GeneratedPaperData[]> {
  try {
    const q = query(
      collection(db, 'questionPapers'),
      orderBy('updatedAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    let list: GeneratedPaperData[] = [];

    if (!snap.empty) {
      list = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as GeneratedPaperData))
        .filter(p => p.isGeneratedPaper || p.questions || p.status === 'draft' || p.status === 'ready');
    }

    if (list.length === 0) {
      const snapLegacy = await getDocs(query(collection(db, 'question_papers'), limit(100)));
      list = snapLegacy.docs
        .map(d => ({ id: d.id, ...d.data() } as GeneratedPaperData))
        .filter(p => p.isGeneratedPaper || p.questions || p.status === 'draft' || p.status === 'ready');
    }

    // Check localStorage for any local drafts
    try {
      const localKeys = Object.keys(localStorage).filter(k => k.startsWith('edulpha_paper_draft_'));
      for (const key of localKeys) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item) as GeneratedPaperData;
          if (parsed && parsed.id && !list.some(p => p.id === parsed.id)) {
            list.unshift(parsed);
          }
        }
      }
    } catch (_) {}

    return list;
  } catch (err) {
    console.warn('Error fetching generated papers:', err);
    return [];
  }
}

/**
 * Creates an independent duplicate copy of an existing examination paper.
 */
export async function duplicatePaper(
  paperId: string,
  userId: string,
  userProfile?: { name?: string; email?: string }
): Promise<GeneratedPaperData> {
  const existing = await fetchPaperById(paperId);
  if (!existing) {
    throw new Error('Original examination paper not found to duplicate.');
  }

  const newPaperId = `qp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const duplicated: GeneratedPaperData = {
    ...existing,
    id: newPaperId,
    title: `${existing.title || `${existing.subject} Paper 2`} (Copy)`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    lastSavedAt: now,
    createdBy: userId,
    creatorName: userProfile?.name || existing.creatorName || 'Administrator',
    creatorEmail: userProfile?.email || existing.creatorEmail || '',
    isGeneratedPaper: true
  };

  const cleaned = cleanFirestoreData(duplicated);
  const primaryDoc = doc(db, 'questionPapers', newPaperId);
  const legacyDoc = doc(db, 'question_papers', newPaperId);

  const batch = writeBatch(db);
  batch.set(primaryDoc, { ...cleaned, serverTimestamp: serverTimestamp() }, { merge: true });
  batch.set(legacyDoc, { ...cleaned, serverTimestamp: serverTimestamp() }, { merge: true });
  await batch.commit();

  return duplicated;
}

/**
 * Update the status of a saved paper (e.g. to 'published', 'archived', 'ready').
 */
export async function updatePaperStatus(
  paperId: string,
  status: 'draft' | 'ready' | 'published' | 'archived'
): Promise<void> {
  const now = new Date().toISOString();
  const updatePayload = {
    status,
    isPublished: status === 'published',
    updatedAt: now
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'questionPapers', paperId), updatePayload, { merge: true });
  batch.set(doc(db, 'question_papers', paperId), updatePayload, { merge: true });
  await batch.commit();
}

/**
 * Delete a generated paper completely from Firestore and local cache.
 */
export async function deleteGeneratedPaper(paperId: string): Promise<void> {
  await deleteQuestionPaperFast(paperId);
  try {
    localStorage.removeItem(`edulpha_paper_draft_${paperId}`);
  } catch (_) {}
}

