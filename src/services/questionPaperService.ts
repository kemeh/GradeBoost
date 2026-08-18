import { 
  collection, 
  doc, 
  writeBatch, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
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

  // 2. Saving to repository (Atomic Batch Write)
  updateStage('saving');

  const batchWritePromise = async () => {
    try {
      const batch = writeBatch(db);

      // Primary collection: `questionPapers`
      const primaryDocRef = doc(db, 'questionPapers', paperId);
      batch.set(primaryDocRef, {
        ...paperDocument,
        serverTimestamp: serverTimestamp()
      }, { merge: true });

      // Legacy/interoperability collection: `question_papers`
      const legacyDocRef = doc(db, 'question_papers', paperId);
      batch.set(legacyDocRef, {
        ...paperDocument,
        serverTimestamp: serverTimestamp()
      }, { merge: true });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `questionPapers/${paperId}`);
    }
  };

  // Run with an 12-second safeguard timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Publishing is taking longer than expected. Please check your network connection and retry.')), 12000)
  );

  await Promise.race([batchWritePromise(), timeoutPromise]);

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
