/**
 * Edulpha — Daily GCE Question Engine Client Service
 */
import { 
  DailyGceQuestion, 
  DailyGceStudentSubmission, 
  DailyGceStreak, 
  DailyGceAdminConfig 
} from '../types';

export interface TodayGceResponse {
  success: boolean;
  date: string;
  level: string;
  questions: (DailyGceQuestion & { isAnswered?: boolean; submission?: any })[];
  streak: DailyGceStreak;
  completedCount: number;
  totalCount: number;
  isDayCompleted: boolean;
}

export interface EvaluationResponse {
  success: boolean;
  evaluation: {
    score: number;
    maxMarks: number;
    status: 'correct' | 'partially_correct' | 'incorrect';
    whatWasCorrect?: string;
    whatWasMissing?: string;
    correction?: string;
    explanation?: string;
    examTip?: string;
  };
  streak: DailyGceStreak;
  submissionId: string;
}

export async function fetchTodayGceQuestions(params: {
  studentId?: string;
  level?: string;
  enrolledSubjects?: string[];
  language?: string;
  forceDate?: string;
}): Promise<TodayGceResponse> {
  try {
    const res = await fetch('/api/gce/daily-questions/get-today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch today's GCE questions: ${res.statusText}`);
    }

    const data: TodayGceResponse = await res.json();
    return data;
  } catch (err: any) {
    console.error('[dailyGceService] Error fetching questions:', err);
    // Offline / fallback response
    return {
      success: false,
      date: params.forceDate || new Date().toISOString().split('T')[0],
      level: params.level || 'Advanced Level',
      questions: [],
      streak: { studentId: params.studentId || '', currentStreak: 0, longestStreak: 0, lastActiveDate: '', totalAnswered: 0, totalScore: 0, averagePercentage: 0 },
      completedCount: 0,
      totalCount: 0,
      isDayCompleted: false
    };
  }
}

export async function submitGceAnswer(params: {
  studentId?: string;
  questionId: string;
  answer: string;
  timeSpentSeconds?: number;
}): Promise<EvaluationResponse> {
  const res = await fetch('/api/gce/daily-questions/evaluate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Evaluation failed: ${res.statusText}`);
  }

  return res.json();
}

export async function generateMockGceExam(params: {
  subject: string;
  level: string;
  paper: string;
  durationMinutes?: number;
  instructions?: string;
}) {
  const res = await fetch('/api/gce/mock-exam/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    throw new Error(`Mock generation failed: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchDailyGceAdminConfig(): Promise<DailyGceAdminConfig> {
  const res = await fetch('/api/gce/daily-questions/admin/config');
  if (!res.ok) throw new Error('Failed to load admin config');
  const data = await res.json();
  return data.config;
}

export async function saveDailyGceAdminConfig(config: Partial<DailyGceAdminConfig>) {
  const res = await fetch('/api/gce/daily-questions/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to save admin config');
  return res.json();
}

export async function fetchDailyQuestionsAdminList(filters: {
  date?: string;
  subject?: string;
  level?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (filters.date) query.set('date', filters.date);
  if (filters.subject) query.set('subject', filters.subject);
  if (filters.level) query.set('level', filters.level);
  if (filters.status) query.set('status', filters.status);

  const res = await fetch(`/api/gce/daily-questions/admin/list?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load questions list');
  return res.json();
}

export async function updateDailyQuestionStatus(questionId: string, status: string, modifications?: any) {
  const res = await fetch('/api/gce/daily-questions/admin/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, status, modifications })
  });
  if (!res.ok) throw new Error('Failed to update question status');
  return res.json();
}
