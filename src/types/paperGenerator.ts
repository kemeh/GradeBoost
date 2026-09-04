export interface PaperSubpart {
  id: string;
  label: string; // '(a)', '(b)', '(c)', '(i)', etc.
  text: string;
  marks: number;
  codeSnippet?: string;
  notes?: string;
}

export interface PaperQuestion {
  id: number;
  title?: string;
  text: string;
  codeSnippet?: string;
  diagramUrl?: string;
  subparts: PaperSubpart[];
}

export type PaperStatus = 'draft' | 'ready' | 'published' | 'archived';

export interface GeneratedPaperData {
  id: string;
  title: string;
  subject: string;
  paperType: string;
  level: string;
  curriculumId: string;
  curriculumName: string;
  year: number;
  timeAllowed: string;
  durationMinutes: number;
  instructions: string[];
  questions: PaperQuestion[];
  targetQuestionsCount: number;
  targetMarksPerQuestion?: number;
  targetTotalMarks?: number;
  totalCalculatedMarks: number;
  status: PaperStatus;
  createdAt: string;
  updatedAt: string;
  lastSavedAt?: string;
  createdBy?: string;
  creatorName?: string;
  creatorEmail?: string;
  pdfUrl?: string;
  docxUrl?: string;
  isGeneratedPaper?: boolean;
}

export interface PaperValidationIssue {
  id: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
  questionId?: number;
  subpartIndex?: number;
}

export interface PaperValidationResult {
  isValid: boolean;
  errors: PaperValidationIssue[];
  warnings: PaperValidationIssue[];
  totalMarks: number;
  totalQuestions: number;
  totalSubparts: number;
}
