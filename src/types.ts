export type Subject = 'Computer Science' | 'ICT';
export type PaperType = 'Paper 1' | 'Paper 2' | 'Paper 3';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  subject: Subject;
  school: string;
  region: string;
  assignedPapers: string[]; // e.g., ["paper1", "paper2", "paper3"]
  targetGrade: Grade;
  createdAt: string;
  role: 'student' | 'admin';
  hasTakenDiagnostic: boolean;
  diagnosticResults?: DiagnosticResult;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  paymentDate?: string;
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
