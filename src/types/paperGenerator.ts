export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  secondaryText?: string;
  academicYear?: number;
  opacity?: number; // 0.05 - 0.25 (default 0.09)
  rotation?: number; // degrees (default -35)
  size?: 'small' | 'medium' | 'large';
  position?: 'center';
  repeatEveryPage?: boolean;
}

export interface SchoolBrandingSettings {
  schoolName: string;
  motto: string;
  address: string;
  city: string;
  country: string;
  telephone: string;
  email: string;
  website: string;
  schoolLogoUrl: string;
  examinationLogoUrl?: string;
  accreditationSealUrl?: string;
  examinationCentreNumber?: string;
  examinationBoardText?: string;
  securityLabel?: string;
  isConfidential?: boolean;
  footerText?: string;
  watermark?: WatermarkSettings;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SCHOOL_BRANDING: SchoolBrandingSettings = {
  schoolName: 'EDULPHA INTERNATIONAL ACADEMY',
  motto: 'Learn • Build • Lead',
  address: 'P.O. Box 1234, Yaoundé, Cameroon',
  city: 'Yaoundé',
  country: 'Cameroon',
  telephone: '+237 6XX XXX XXX',
  email: 'info@edulpha.academy',
  website: 'www.edulpha.academy',
  schoolLogoUrl: '/edulpha-logo.png',
  examinationLogoUrl: '',
  accreditationSealUrl: '',
  examinationCentreNumber: 'CENTRE NO: 0124',
  examinationBoardText: 'CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD',
  securityLabel: 'CONFIDENTIAL • OFFICIAL EXAMINATION DOCUMENT',
  isConfidential: true,
  footerText: 'EDULPHA INTERNATIONAL ACADEMY • CONFIDENTIAL',
  watermark: {
    enabled: true,
    text: 'OFFICIAL EXAMINATION PAPER',
    secondaryText: 'EDULPHA INTERNATIONAL ACADEMY',
    academicYear: 2026,
    opacity: 0.09,
    rotation: -35,
    size: 'large',
    position: 'center',
    repeatEveryPage: true
  }
};

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
  brandingSnapshot?: SchoolBrandingSettings;
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
