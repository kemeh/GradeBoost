import { 
  ProgressionSheet, 
  AITeacherAssignment, 
  StudentLearningProgress, 
  AILessonSession,
  AIContentFlag 
} from '../types';

export interface GenerateLessonParams {
  studentId: string;
  studentName?: string;
  subject: string;
  classLevel: string;
  weekNumber: number;
  learningPace?: 'REMEDIAL' | 'STANDARD' | 'ACCELERATED';
  preferredLanguage?: 'en' | 'fr';
}

export interface SocraticChatParams {
  sessionId: string;
  studentId: string;
  userMessage: string;
  preferredLanguage?: 'en' | 'fr';
}

export interface RecordQuizProgressParams {
  studentId: string;
  subject: string;
  classLevel: string;
  weekNumber: number;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  scoreDelta: number;
}

export interface ContentFlagParams {
  sessionId?: string;
  progressionSheetId?: string;
  subject: string;
  classLevel: string;
  weekNumber?: number;
  topicTitle?: string;
  flagReason: 'INCORRECT_INFORMATION' | 'CURRICULUM_MISMATCH' | 'INAPPROPRIATE_DIFFICULTY' | 'SAFETY_CONCERN' | 'OTHER';
  userFeedback: string;
  reportedBy: string;
  reporterRole: string;
}

export const fetchProgressionSheets = async (filters?: {
  subject?: string;
  level?: string;
  status?: string;
}): Promise<ProgressionSheet[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.subject && filters.subject !== 'All') params.append('subject', filters.subject);
    if (filters?.level && filters.level !== 'All') params.append('level', filters.level);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);

    const res = await fetch(`/api/ai-teacher/progression-sheets?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch progression sheets');
    const data = await res.json();
    return data.progressionSheets || [];
  } catch (err) {
    console.error('fetchProgressionSheets error:', err);
    return [];
  }
};

export const seedCuratedProgressionSheets = async (createdBy: string = 'system_admin'): Promise<ProgressionSheet[]> => {
  try {
    const res = await fetch('/api/ai-teacher/progression-sheets/curated-seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdBy })
    });
    if (!res.ok) throw new Error('Failed to seed curated progression sheets');
    const data = await res.json();
    return data.sheets || [];
  } catch (err) {
    console.error('seedCuratedProgressionSheets error:', err);
    return [];
  }
};

export const uploadProgressionSheet = async (payload: {
  subject: string;
  classLevel: string;
  academicYear?: string;
  term?: string;
  fileBase64: string;
  fileName: string;
  mimeType: string;
  createdBy: string;
}): Promise<ProgressionSheet> => {
  const res = await fetch('/api/ai-teacher/progression-sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to upload and normalize progression sheet');
  }
  const data = await res.json();
  return data.progressionSheet;
};

export const importProgressionSheetFromUrl = async (payload: {
  subject: string;
  classLevel: string;
  academicYear?: string;
  term?: string;
  sourceUrl: string;
  createdBy: string;
}): Promise<ProgressionSheet> => {
  const res = await fetch('/api/ai-teacher/progression-sheets/import-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to import progression sheet from URL');
  }
  const data = await res.json();
  return data.progressionSheet;
};

export const approveProgressionSheet = async (id: string, reviewerId: string, reviewerName: string = 'Curriculum Reviewer'): Promise<void> => {
  const res = await fetch(`/api/ai-teacher/progression-sheets/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewerId, reviewerName })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to approve progression sheet');
  }
};

export const updateProgressionSheet = async (id: string, updates: Partial<ProgressionSheet>): Promise<void> => {
  const res = await fetch(`/api/ai-teacher/progression-sheets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update progression sheet');
  }
};

export const fetchAITeacherAssignments = async (subject?: string, classLevel?: string): Promise<{
  assignments: AITeacherAssignment[];
  humanTeacherCoverage: Record<string, { hasHumanTeacher: boolean; teachers: string[] }>;
}> => {
  try {
    const params = new URLSearchParams();
    if (subject && subject !== 'All') params.append('subject', subject);
    if (classLevel && classLevel !== 'All') params.append('classLevel', classLevel);

    const res = await fetch(`/api/ai-teacher/assignments?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch AI teacher assignments');
    const data = await res.json();
    return {
      assignments: data.assignments || [],
      humanTeacherCoverage: data.humanTeacherCoverage || {}
    };
  } catch (err) {
    console.error('fetchAITeacherAssignments error:', err);
    return { assignments: [], humanTeacherCoverage: {} };
  }
};

export const saveAITeacherAssignment = async (payload: Partial<AITeacherAssignment>): Promise<AITeacherAssignment> => {
  const res = await fetch('/api/ai-teacher/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to save AI teacher assignment');
  }
  const data = await res.json();
  return data.assignment;
};

export const generateAILesson = async (params: GenerateLessonParams): Promise<{
  session: AILessonSession;
  progressionSheet: ProgressionSheet | null;
  assignment: AITeacherAssignment | null;
  studentProgress: StudentLearningProgress | null;
  isCurriculumFallback: boolean;
}> => {
  const res = await fetch('/api/ai-teacher/lesson/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to generate AI lesson');
  }
  return await res.json();
};

export const sendSocraticMessage = async (params: SocraticChatParams): Promise<{
  reply: string;
  messages: Array<{ role: 'teacher' | 'student'; text: string; timestamp: string }>;
}> => {
  const res = await fetch('/api/ai-teacher/lesson/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send message to AI Teacher');
  }
  return await res.json();
};

export const recordQuizProgress = async (params: RecordQuizProgressParams): Promise<{
  progress: StudentLearningProgress;
  isMastered: boolean;
}> => {
  const res = await fetch('/api/ai-teacher/progress/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to record quiz progress');
  }
  return await res.json();
};

export const fetchStudentProgress = async (studentId: string, subject: string, classLevel: string): Promise<StudentLearningProgress | null> => {
  try {
    const params = new URLSearchParams({ studentId, subject, classLevel });
    const res = await fetch(`/api/ai-teacher/progress?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.progress || null;
  } catch (err) {
    console.error('fetchStudentProgress error:', err);
    return null;
  }
};

export const submitContentFlag = async (params: ContentFlagParams): Promise<void> => {
  const res = await fetch('/api/ai-teacher/flag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to submit content flag');
  }
};

export const fetchAITeacherAnalytics = async (): Promise<any> => {
  try {
    const res = await fetch('/api/ai-teacher/analytics');
    if (!res.ok) throw new Error('Failed to fetch AI Teacher analytics');
    return await res.json();
  } catch (err) {
    console.error('fetchAITeacherAnalytics error:', err);
    return null;
  }
};
