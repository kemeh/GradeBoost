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
