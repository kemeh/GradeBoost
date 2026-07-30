declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly [key: string]: any;
  }
}

export type Subject = string;

export interface PaperConfig {
  id: string;
  name: string;
  type: 'MCQ' | 'Theory' | 'Practical' | 'Structured' | 'Essay';
  totalMarks?: number;
  durationMinutes?: number;
  description?: string;
}

export interface SubjectModel {
  id: string;
  name: string;
  code?: string;
  description?: string;
  level?: 'Ordinary level' | 'Advance level';
  category?: string;
  isActive: boolean;
  papers?: PaperConfig[];
  createdAt: any;
}

export type PaperType = 'Paper 1' | 'Paper 2' | 'Paper 3' | 'Combined';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface UserProfile {
  uid: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject: Subject;
  level?: 'Ordinary level' | 'Advance level';
  school: string;
  region: string;
  assignedPapers: string[]; // e.g., ["paper1", "paper2", "paper3"]
  targetGrade: Grade;
  createdAt: string;
  role: 'student' | 'admin';
  hasTakenDiagnostic: boolean;
  diagnosticResults?: DiagnosticResult;
  isPaid?: boolean;
  paymentStatus?: 'unpaid' | 'paid' | 'pending' | 'rejected';
  paymentDate?: string;
  paymentExpiryDate?: string;
  verificationSentAt?: any; // Timestamp
  paid?: boolean;
  paidAt?: string;
  paymentReference?: string;
  photoURL?: string;
  points: number;
  streak: number;
  lastActiveDate?: any; // Timestamp
  badges: string[]; // Array of badge IDs
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  criteria: string;
  points?: number;
}

export interface DiagnosticResult {
  scores: {
    paper1: number;
    paper2: number;
    paper3: number;
  };
  avgScore: number;
  weakAreas: string[];
  recommendedPath: string;
  timestamp: string;
}

export interface QuestionPaper {
  id: string;
  title: string;
  year: number;
  subject: Subject;
  paperType: PaperType;
  description: string;
  pdfUrl: string;
  createdAt: string;
  uploadedBy: string;
  correctAnswers?: Record<string, string>; // e.g., { "1": "A", "2": "B" }
}

export interface ExamResult {
  id: string;
  userId: string;
  paperId: string;
  subject: Subject;
  paperType: PaperType;
  answers: any;
  fileUrls?: Record<string, string>;
  score: number;
  feedback: string;
  grade: Grade;
  timestamp: string;
}

export interface ExamQuestion {
  id: string;
  questionText: string;
  options?: Record<string, string>; // { A: '...', B: '...', C: '...', D: '...' }
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation: string;
  subject: Subject;
  paper: PaperType;
  section?: string;
  topic: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  year: number;
  session?: string;
  isDailyDrill: boolean;
  imageUrl?: string;
  subParts?: { label: string; text: string; marks: number }[];
  createdAt: any;
}

export interface DailyDrill {
  id: string;
  day: number; // 1-60
  questionIds: string[]; // Array of question IDs
  subject: Subject;
  paper?: PaperType;
  topic: string;
  isFree: boolean;
  createdAt: any;
}

export interface DrillSubmission {
  id: string;
  userId: string;
  questionId: string;
  day: number;
  selectedAnswer: string;
  correctAnswer: string;
  score: number;
  paper: PaperType;
  topic: string;
  status?: 'pending' | 'graded';
  feedback?: string;
  fileUrl?: string;
  createdAt: any;
}

export interface SampleQuestion {
  id: string;
  subject: Subject;
  topic: string;
  questionText: string;
  options: string[]; // Options A-D
  correctAnswer: string; // A, B, C, or D
  reasoning: string;
  isFreeSample: true;
  createdAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  topic: string;
  subject: Subject;
  link: string;
  createdAt: any;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Link';
  subject: Subject;
  fileUrl: string;
  fileSize: string;
  visible: boolean;
  createdAt: any;
}

export interface Assignment {
  id: string;
  title: string;
  paper: string;
  subject: Subject;
  dueDate: any; // Timestamp
  link: string;
  active: boolean;
  createdAt: any;
}

export interface WeeklyLeaderboard {
  id: string;
  userId: string;
  userName: string;
  photoURL?: string;
  totalScore: number;
  position: number;
  weekNumber: number;
  year: number;
  updatedAt: any;
}

export interface Duel {
  id: string;
  player1Id: string;
  player2Id: string;
  questions: string[]; // Array of question IDs
  player1Score: number;
  player2Score: number;
  player1Time: number; // Seconds
  player2Time: number; // Seconds
  winnerId?: string;
  status: 'waiting' | 'active' | 'completed';
  createdAt: any;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  photoURL?: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  rank: number;
}

export interface PointsHistory {
  id: string;
  userId: string;
  points: number;
  reason: 'duel_win' | 'duel_loss' | 'duel_draw' | 'daily_drill';
  date: any;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  image?: string;
  level: 'Ordinary Level' | 'Advanced Level' | 'All Levels';
  subjects: string[];
  duration: number; // Duration in days (e.g., 7, 14, 30, 60, 90, custom)
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'published' | 'archived';
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ChallengeDay {
  id: string;
  challengeId: string;
  dayNumber: number;
  title: string;
  description?: string;
  lessonContent?: string;
  revisionMaterial?: string;
  questionIds?: string[];
  assignmentId?: string;
  createdAt?: any;
}

export interface ChallengeEnrollment {
  id: string;
  studentId: string;
  challengeId: string;
  progress: number; // percentage (0 - 100)
  completedDays: number[]; // array of day numbers, e.g. [1, 2, 3]
  joinedDate: any;
  updatedAt?: any;
}

export interface ChallengeProgress {
  id: string;
  studentId: string;
  challengeId: string;
  challengeDayId: string;
  dayNumber: number;
  completed: boolean;
  completedAt: any;
}

