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

export interface DailyDrillQuestion {
  id: string;
  questionText: string;
  options?: string[]; // For Paper 1 (MCQs)
  correctAnswer?: string; // For Paper 1 (MCQs)
  reasoning?: string; // Explanation for the answer
  imageUrl?: string; // Optional reference image
  isFreeSample?: boolean; // Added for free sample feature
}

export interface DailyDrill {
  id: string;
  dayNumber: number; // 1-60
  subject: Subject;
  topic: string;
  paperType: 'Paper 1' | 'Paper 2' | 'Paper 3';
  questions: DailyDrillQuestion[];
  createdAt: string;
  uploadedBy: string;
  gradedStatus?: boolean; // Added for consistency with user request
  isFreeSample?: boolean; // Added for free sample feature
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

export interface DailyDrillSubmission {
  id: string;
  userId: string;
  drillId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  timestamp: string;
  questionId?: string;
  selectedAnswer?: string;
  feedback?: string;
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
