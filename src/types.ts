export type Subject = 'Computer Science' | 'ICT';
export type PaperType = 'Paper 1' | 'Paper 2' | 'Paper 3';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface UserProfile {
  uid: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject: Subject;
  school: string;
  region: string;
  assignedPapers: string[]; // e.g., ["paper1", "paper2", "paper3"]
  targetGrade: Grade;
  createdAt: string;
  role: 'student' | 'admin';
  hasTakenDiagnostic: boolean;
  diagnosticResults?: DiagnosticResult;
  isPaid?: boolean;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  paymentDate?: string;
  paymentExpiryDate?: string;
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
  score: number;
  feedback: string;
  grade: Grade;
  timestamp: string;
}

export interface ExamQuestion {
  id: string;
  questionText: string;
  options: Record<string, string>; // { A: '...', B: '...', C: '...', D: '...' }
  correctAnswer: string;
  explanation: string;
  paper: PaperType;
  section: 'A' | 'B' | 'C';
  topic: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  year: number;
  isDailyDrill: boolean;
  imageUrl?: string;
  createdAt: any;
}

export interface DailyDrill {
  id: string;
  day: number; // 1-60
  questionId: string;
  paper: PaperType;
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
  totalScore: number;
  position: number;
  weekNumber: number;
  year: number;
  updatedAt: any;
}
