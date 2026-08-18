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

export interface EducationCategory {
  id: string;
  curriculumId: string;
  name: string;
  nameFr?: string;
  code: string;
  description?: string;
  descriptionFr?: string;
  isActive: boolean;
  order?: number;
  createdAt?: any;
}

export interface Curriculum {
  id: string; // e.g., 'cameroon_gce', 'cameroon_gce_tvee', 'cameroon_francophone', 'bac_general', 'bac_technologique'
  name: string; // e.g., 'English Curriculum (Cameroon GCE)', 'French Curriculum (Cameroon Francophone)'
  nameFr?: string;
  code: string; // e.g., 'GCE', 'TVEE', 'BAC-FR'
  country?: string; // e.g., 'Cameroon', 'France', 'International'
  examinationBoard?: string; // e.g., 'Cameroon GCE Board', 'MINESEC', 'Ministry of National Education'
  description?: string;
  descriptionFr?: string;
  language: 'en' | 'fr' | 'bilingual' | string;
  isActive: boolean;
  order?: number;
  createdAt?: any;
}

export interface EducationLevel {
  id: string; // e.g., 'ordinary_level', 'advanced_level', 'troisieme', 'seconde', 'premiere', 'terminale'
  curriculumId: string;
  categoryId?: string;
  name: string; // e.g., 'Ordinary Level', 'Advanced Level', 'Troisième (BEPC)', 'Seconde', 'Première', 'Terminale'
  nameFr?: string;
  code: string;
  description?: string;
  descriptionFr?: string;
  isActive: boolean;
  order?: number;
  createdAt?: any;
}

export interface Department {
  id: string; // e.g., Series, Streams, Sections, Departments
  curriculumId: string;
  levelId?: string;
  categoryId?: string;
  name: string; // e.g., 'Science & Tech', 'Sciences Exactes', 'Série C', 'Série D', 'Série F', 'Industrial'
  nameFr?: string;
  code?: string;
  description?: string;
  descriptionFr?: string;
  isActive: boolean;
  createdAt?: any;
}

export interface PaperConfig {
  id: string;
  name: string;
  nameFr?: string;
  type: 'MCQ' | 'Theory' | 'Practical' | 'Structured' | 'Essay' | 'Oral' | 'Synthese' | string;
  totalMarks?: number;
  durationMinutes?: number;
  passMark?: number;
  weightingCoefficient?: number;
  instructions?: string;
  instructionsFr?: string;
  questionTypes?: string[];
  examYear?: number;
  examSession?: string;
  description?: string;
}

export interface SubjectModel {
  id: string;
  name: string;
  nameFr?: string;
  code?: string;
  description?: string;
  descriptionFr?: string;
  curriculumId?: string;
  curriculumName?: string;
  levelId?: string;
  level?: 'Ordinary level' | 'Advance level' | string;
  educationLevel?: string;
  departmentId?: string;
  category?: string; // e.g., 'Professional Subject', 'Related Subject', 'General Subject', 'Pool Subject', 'Optional Subject'
  isActive?: boolean;
  papers?: PaperConfig[];
  createdAt?: any;
}

export interface SpecialtyModel {
  id: string;
  name: string;
  nameFr?: string;
  code: string;
  frenchCode?: string;
  curriculumId: string;
  levelId?: string;
  level?: 'Intermediate level' | 'Advance level' | string;
  departmentId?: string;
  department?: 'Industrial' | 'Commercial' | string;
  description?: string;
  descriptionFr?: string;
  icon?: string;
  isActive: boolean;
  professionalSubjects: string[];
  relatedSubjects: string[];
  poolSubjects: string[];
  passRequirements?: string;
  passRequirementsFr?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type PaperType = 'Paper 1' | 'Paper 2' | 'Paper 3' | 'Combined' | string;
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | '20/20' | '18/20' | string;

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  phoneProvider?: 'MTN' | 'Orange' | 'Nexttel' | 'Camtel' | 'Other' | string;
  isEmailVerified?: boolean;
  subject: Subject;
  curriculumId?: string; // e.g. 'cameroon_gce' | 'cameroon_francophone'
  curriculumName?: string;
  educationLevelId?: string; // e.g. 'ordinary_level', 'advanced_level', 'troisieme', 'seconde', 'premiere', 'terminale'
  educationLevelName?: string;
  departmentId?: string;
  departmentName?: string;
  level?: 'Ordinary level' | 'Advance level' | 'Intermediate level' | string;
  school: string;
  region: string;
  commercialSpecialtyId?: string;
  commercialSpecialtyName?: string;
  commercialSpecialtyCode?: string;
  selectedSubjects?: string[];
  professionalSubjects?: string[];
  relatedSubjects?: string[];
  poolOrGeneralSubjects?: string[];
  assignedPapers: string[]; // e.g., ["paper1", "paper2", "paper3"]
  targetGrade: Grade;
  createdAt: string;
  role: 'student' | 'teacher' | 'admin';
  status?: 'active' | 'suspended' | 'locked' | 'deleted' | string;
  isLocked?: boolean;
  lockoutUntil?: string | null;
  failedLoginAttempts?: number;
  lastLoginAt?: any;
  lastPasswordChangeAt?: string;
  hasTakenDiagnostic: boolean;
  diagnosticResults?: DiagnosticResult;
  language?: 'en' | 'fr' | string;
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

export interface PhoneAuthConfig {
  phoneAuthRequired: boolean;
  emailAuthRequired: boolean;
  otpLength: number;
  otpExpiryMinutes: number;
  maxResendAttempts: number;
  maxVerificationAttempts: number;
  
  // Verification Channel Controls
  primaryChannel?: 'whatsapp' | 'sms';
  enableWhatsapp?: boolean;
  enableSmsFallback?: boolean;

  // WhatsApp Provider Configuration
  whatsappProvider?: 'simulation' | 'meta_cloud' | 'twilio_whatsapp' | 'ultramsg';
  whatsappApiKey?: string;
  whatsappPhoneNumberId?: string;
  whatsappSenderNumber?: string;
  whatsappTemplateName?: string;

  // SMS Gateway Configuration (Preserved)
  smsProvider: 'simulation' | 'twilio' | 'africastalking' | 'infobip' | 'termii' | 'custom';
  smsApiKey: string;
  smsApiSecret: string;
  smsSenderId: string;
  smsCustomEndpoint: string;
  enablePasswordlessLogin: boolean;
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
  curriculumId?: string;
  curriculumName?: string;
  level?: string;
  session?: string;
  markingSchemeUrl?: string;
  solutionUrl?: string;
  totalMarks?: number;
  durationMinutes?: number;
  instructions?: string;
  paperCode?: string;
  fileSize?: string;
  fileName?: string;
  requiresAnswerKey?: boolean;
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

// LMS Interfaces
export type LMSLessonFormat = 
  | 'text' 
  | 'rich_text' 
  | 'pdf' 
  | 'video' 
  | 'image' 
  | 'practical' 
  | 'programming' 
  | 'interactive' 
  | 'live_class' 
  | 'recorded_class';

export type LMSLessonStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type LMSDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LMSAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'ppt' | 'image' | 'video' | 'zip' | 'code' | 'audio' | 'link';
  url: string;
  size?: string;
}

export interface LMSQuizQuestion {
  id: string;
  type: 'mcq' | 'essay' | 'programming' | 'true_false' | 'matching' | 'fill_in_blanks';
  question: string;
  options?: string[];
  correctAnswer?: string | boolean;
  explanation?: string;
  codeSnippet?: string;
  matchingPairs?: Array<{ left: string; right: string }>;
}

export interface LMSQuiz {
  id: string;
  title: string;
  isTimed: boolean;
  durationMinutes?: number;
  instantFeedback: boolean;
  questions: LMSQuizQuestion[];
}

export interface LMSLesson {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  summary?: string;
  content?: string;
  educationLevel: string; // e.g. Ordinary Level, Advanced Level
  level?: string;
  department?: string; // e.g. Science, Commercial, Arts
  subject: string; // e.g. Computer Science
  paper?: string; // e.g. Paper 1
  topic: string; // e.g. Computer Hardware
  subtopic?: string; // e.g. Input Devices
  format: LMSLessonFormat;
  objectives?: string[];
  estimatedMinutes?: number;
  difficulty: LMSDifficulty;
  teacher?: string;
  thumbnail?: string;
  coverImage?: string;
  lessonContent?: string;
  videoUrl?: string;
  contentUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  externalUrl?: string;
  references?: string[];
  attachments?: LMSAttachment[];
  quizzes?: LMSQuiz[];
  status: LMSLessonStatus;
  scheduledAt?: string;
  orderIndex?: number;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface LMSHierarchyItem {
  id: string;
  type: 'level' | 'department' | 'subject' | 'paper' | 'topic' | 'subtopic';
  name: string;
  code?: string;
  parentId?: string;
  description?: string;
  order?: number;
}

export interface LMSUserProgress {
  id: string;
  userId: string;
  lessonId: string;
  subject?: string;
  topic?: string;
  completed: boolean;
  progressPercent?: number;
  studyTimeSeconds?: number;
  timeSpentSeconds?: number;
  lastAccessedAt?: string;
  quizScores?: Record<string, number>;
  completedAt?: any;
  updatedAt?: any;
  createdAt?: any;
}

export interface LMSBookmark {
  id: string;
  userId: string;
  lessonId: string;
  createdAt: any;
}

export interface LMSNote {
  id: string;
  userId: string;
  lessonId: string;
  title?: string;
  content?: string;
  noteText?: string;
  highlightText?: string;
  createdAt: any;
  updatedAt?: any;
}

// ==================================================
// QUESTION BANK & EXAMINATION ENGINE INTERFACES
// ==================================================

export type QuestionType =
  | 'mcq'
  | 'structured'
  | 'essay'
  | 'programming'
  | 'practical'
  | 'fill_in_blanks'
  | 'true_false'
  | 'matching'
  | 'short_answer';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type QuestionStatus = 'draft' | 'published' | 'archived';
export type AcademicLevel = 'Ordinary Level' | 'Advanced Level';
export type ExamSessionType = 'June' | 'November' | 'Mock' | 'Special';

export interface QuestionMedia {
  id: string;
  type: 'image' | 'diagram' | 'table' | 'audio' | 'video' | 'code' | 'formula' | 'chemical' | 'flowchart';
  url?: string;
  caption?: string;
  content?: string; // Raw LaTeX, CSV/JSON table, code snippet, SVG string
}

export interface QuestionOption {
  id: string;
  label: string; // A, B, C, D...
  text: string;
  isCorrect?: boolean;
  explanation?: string;
  media?: QuestionMedia;
}

export interface MarkingSchemeSubPart {
  label: string; // e.g., (a)(i)
  description: string;
  points: number;
  expectedKeywords?: string[];
}

export interface MarkingScheme {
  totalMarks: number;
  modelAnswer: string;
  marksAllocation: MarkingSchemeSubPart[];
  examinerNotes?: string;
}

export interface QuestionProgramming {
  language: 'python' | 'java' | 'cpp' | 'javascript' | 'pseudocode' | string;
  starterCode: string;
  solutionCode: string;
  inputSample?: string;
  outputSample?: string;
  expectedResult?: string;
  sampleTests: { input: string; output: string; description?: string }[];
  markingGuide?: string;
}

export interface QuestionMatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface QuestionFillBlank {
  index: number;
  acceptedAnswers: string[];
  caseSensitive?: boolean;
}

export interface QuestionEngineItem {
  id: string;
  title: string;
  questionNumber: number | string;
  questionText: string; // supports Markdown & LaTeX
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  marks: number;
  estimatedTimeMinutes: number;
  
  // Hierarchy
  level: AcademicLevel;
  department: string; // Science, Arts, Commercial, Technical, General
  subject: string;
  paper: string; // Paper 1, Paper 2, Paper 3
  topic: string;
  subtopic: string;
  
  examYear: number;
  session: ExamSessionType;
  
  instructions?: string;
  hints?: string[];
  explanation?: string;
  reference?: string;
  status: QuestionStatus;
  
  // Media & Attachments
  mediaList?: QuestionMedia[];
  
  // Type Specific Data
  options?: QuestionOption[]; // MCQs
  markingScheme?: MarkingScheme; // Structured/Essay/Practical/Short Answer
  programmingData?: QuestionProgramming; // Programming Questions
  matchingPairs?: QuestionMatchingPair[]; // Matching Questions
  blanks?: QuestionFillBlank[]; // Fill in blanks
  trueFalseAnswer?: boolean; // True/False
  trueFalseJustificationRequired?: boolean;
  
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ExamAutoRule {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  expertCount?: number;
  subject: string;
  paper?: string;
  topicIds?: string[];
}

export interface ExamQuestionRef {
  questionId: string;
  order: number;
  marks: number;
  overrideTitle?: string;
}

export type ExamQuestionOrder = 'fixed' | 'random';
export type ExamShowAnswersMode = 'immediately' | 'after_submission' | 'never';

export interface EngineExam {
  id: string;
  title: string;
  description: string;
  academicLevel: AcademicLevel;
  department?: string;
  subject: string;
  paper: string;
  examType: 'mock' | 'past_paper' | 'quiz' | 'holiday_test' | 'custom';
  
  durationMinutes: number;
  passingScorePercent: number;
  questionOrder: ExamQuestionOrder;
  shuffleOptions: boolean;
  negativeMarking: boolean;
  negativeMarksPerWrong?: number; // e.g. 0.25
  retakesAllowed: boolean;
  maxRetakes?: number; // -1 for unlimited
  
  showAnswers: ExamShowAnswersMode;
  showExplanations: boolean;
  showResultsImmediately: boolean;
  allowCalculator?: boolean;
  
  questions: ExamQuestionRef[];
  autoRules?: ExamAutoRule;
  
  status: 'draft' | 'published' | 'archived';
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ExamAttemptAnswer {
  questionId: string;
  selectedOptionId?: string; // For MCQ
  selectedOptionIds?: string[]; // For Multi-select
  textAnswer?: string; // Structured / Essay / Short Answer
  codeSubmission?: string; // Programming
  trueFalseValue?: boolean; // True / False
  matchingSelections?: Record<string, string>; // Matching leftId -> rightText
  blankAnswers?: Record<number, string>; // Fill in blanks index -> answer
  
  isFlagged?: boolean;
  timeSpentSeconds?: number;
  isCorrect?: boolean;
  marksEarned?: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  userId: string;
  userName?: string;
  userDisplayName?: string;
  userEmail?: string;
  academicLevel?: string;
  subject?: string;
  
  startedAt?: any;
  submittedAt?: any;
  completedAt?: any;
  durationSeconds?: number;
  timeTakenSeconds?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  
  answers: Record<string, ExamAttemptAnswer>;
  flaggedQuestionIds?: string[];
  
  // Scored Result
  totalScore: number;
  maxScore?: number;
  maxPossibleScore?: number;
  percentage: number;
  letterGrade?: string;
  passed: boolean;
  topicBreakdown?: Record<string, { earned: number; total: number }>;
  topicPerformance?: Record<string, { correct: number; total: number; percentage: number }>;
  feedback?: string;
  aiInsights?: string;
}

export interface QuestionBookmark {
  id: string;
  userId: string;
  questionId: string;
  questionTitle?: string;
  subject?: string;
  topic?: string;
  note?: string;
  createdAt: any;
}

export interface QuestionReport {
  id: string;
  userId: string;
  questionId: string;
  reason: 'typo' | 'incorrect_answer' | 'missing_media' | 'formatting_issue' | 'other';
  comment: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: any;
}

export interface AcademicLevelModel {
  id: string;
  name: string;
  code: string;
  description?: string;
  passPercentage: number;
  defaultPapersCount: number;
  isActive: boolean;
}

export interface AcademicDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  subjectIds?: string[];
  createdAt?: any;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  subject: string;
  level: string;
  weightage?: number;
  estimatedHours?: number;
  description?: string;
  paperType?: string;
  createdAt?: any;
}

export interface StudyPlanModel {
  id: string;
  title: string;
  level: string;
  subject: string;
  durationWeeks: number;
  description: string;
  topicSequence?: string[];
  recommendedDailyDrills?: number;
  isActive: boolean;
  createdAt?: any;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'students' | 'teachers';
  targetSubject?: string;
  sentBy: string;
  createdAt: any;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface TeacherQuiz {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questions: QuizQuestion[];
  createdBy?: string;
  createdAt?: any;
}

export interface TeacherMockExam {
  id: string;
  title: string;
  subject: string;
  paperType: string;
  durationMinutes: number;
  totalMarks: number;
  passPercentage: number;
  instructions?: string;
  examUrl?: string;
  isPublished: boolean;
  createdBy?: string;
  createdAt?: any;
}

export interface MarkingSchemeItem {
  id: string;
  title: string;
  subject: string;
  year: number;
  paperType: string;
  guideText?: string;
  fileUrl?: string;
  createdBy?: string;
  createdAt?: any;
}

export interface DiscussionThread {
  id: string;
  title: string;
  authorName: string;
  authorRole: string;
  authorId: string;
  subject: string;
  content: string;
  status: 'pending' | 'approved' | 'answered' | 'flagged';
  replies?: {
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: any;
  }[];
  createdAt?: any;
}

export interface TeacherVideo {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  videoUrl: string;
  duration?: string;
  description?: string;
  createdBy?: string;
  createdAt?: any;
}

export interface TeacherPDF {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  fileUrl: string;
  fileSize?: string;
  isDownloadable: boolean;
  description?: string;
  createdBy?: string;
  createdAt?: any;
}

// ===============================================================
// Edulpha AI Interfaces
// ===============================================================

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  educationLevel?: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  userId: string;
  sender: 'user' | 'ai';
  text: string;
  source?: 'gemini' | 'fallback' | 'error';
  subjectContext?: string;
  topicContext?: string;
  examTips?: string[];
  commonMistakes?: string[];
  tokensUsed?: number;
  createdAt: any;
}

export interface AIUsage {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  requestsCount: number;
  tokensUsed: number;
  updatedAt: any;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'lesson' | 'video' | 'question' | 'revision_plan' | 'mock_exam';
  title: string;
  description: string;
  subject: string;
  reason: string;
  targetId?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: any;
}

export interface AIStudyPlan {
  id: string;
  userId: string;
  subject: string;
  paper?: string;
  durationDays: number;
  startDate: string;
  targetExamDate?: string;
  dailyTasks: {
    day: number;
    dayName: string;
    topic: string;
    description: string;
    taskType: 'lesson' | 'practice' | 'revision' | 'mock' | 'break';
    estMinutes: number;
    completed: boolean;
  }[];
  createdAt: any;
}

export interface AIQuizQuestion {
  id: string;
  type: 'MCQ' | 'Essay' | 'Programming' | 'Practical' | 'TrueFalse' | 'Matching';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  examTip?: string;
}

export interface AIQuiz {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionType: 'MCQ' | 'Essay' | 'Programming' | 'Practical' | 'TrueFalse' | 'Matching';
  questions: AIQuizQuestion[];
  score?: number;
  totalQuestions: number;
  completedAt?: any;
  createdAt: any;
}

export interface AIFlashcard {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  frontText: string;
  backText: string;
  mastered?: boolean;
  createdAt: any;
}

export interface AISummary {
  id: string;
  userId: string;
  title: string;
  sourceType: 'pdf' | 'text' | 'lesson' | 'video';
  subject: string;
  shortSummary: string;
  detailedSummary: string;
  revisionPoints: string[];
  flashcards?: AIFlashcard[];
  createdAt: any;
}

export interface AISettings {
  id?: string;
  enabled: boolean;
  provider: 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'custom';
  dailyLimitPerUser: number;
  systemPromptTutor: string;
  systemPromptQuiz: string;
  systemPromptCode: string;
  moderateConversations: boolean;
  allowPublicAI: boolean;
  updatedAt?: any;
}

export interface AIUsageLog {
  id: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  endpoint: string;
  tokensEstimate: number;
  promptLength: number;
  status: 'success' | 'rate_limited' | 'error';
  errorMessage?: string;
  createdAt: any;
}

// ===============================================================
// Subscription & Payment Systems Interfaces
// ===============================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameFr?: string;
  description: string;
  descriptionFr?: string;
  price: number;
  currency: string;
  billingCycle: 'free' | 'monthly' | 'quarterly' | 'annual' | 'yearly' | 'lifetime' | 'one-time' | string;
  duration?: string; // e.g., "30 Days", "1 Year"
  maxDevices?: number;
  maxAttempts?: number;
  trialDays?: number;
  isActive: boolean;
  isRecommended?: boolean; // Current active/recommended plan
  isDefault?: boolean;
  badge?: string; // e.g. "Popular", "Best Value", "New", "Premium"
  order?: number; // Display order index
  visibility?: 'public' | 'hidden';
  scheduledDate?: string; // Future activation schedule
  features: string[];
  featuresFr?: string[];
  maxDailyQuizzes?: number;
  maxDailyAIRequests?: number;
  allowsOfflineDownloads: boolean;
  allowsCertificates: boolean;
  allowsPrioritySupport: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface PricingHistoryRecord {
  id: string;
  planId: string;
  planName: string;
  previousPrice: number;
  newPrice: number;
  currency: string;
  changedAt: string;
  changedBy: string;
  changedByEmail?: string;
  reason?: string;
}

export interface UserSubscription {
  id?: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'canceled' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string; // 'mtn_momo' | 'orange_money' | 'card' | 'paypal' | 'flutterwave' | 'stripe' | 'manual'
  transactionId: string;
  referenceNumber: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptNumber: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  phoneNumber?: string;
  screenshotUrl?: string;
  notes?: string;
}

export interface PaymentMethodConfig {
  id: string;
  code: string;
  name: string;
  nameFr?: string;
  provider: 'mtn' | 'orange' | 'stripe' | 'flutterwave' | 'paypal' | 'card';
  isEnabled: boolean;
  accountNumber?: string;
  accountName?: string;
  instructions?: string;
  instructionsFr?: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  transactionId: string;
  studentName: string;
  studentEmail: string;
  planName: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  date: string;
  expiryDate: string;
  companyName: string;
  companyContact: string;
}

export interface CouponCode {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  expiryDate: string;
  isEnabled: boolean;
  eligiblePlans?: string[];
  createdAt?: any;
}

export interface RefundRequest {
  id: string;
  paymentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNotes?: string;
}

// ===============================================================
// Discussion Forum & Community Learning System Interfaces
// ===============================================================

export type ForumCurriculum = 'English' | 'French' | 'Both';

export type ForumDiscussionType =
  | 'question'
  | 'discussion'
  | 'revision_tips'
  | 'assignment_help'
  | 'programming_help'
  | 'exam_prep'
  | 'study_group'
  | 'announcement'
  | 'teacher_post';

export interface ForumAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'doc' | 'code' | 'zip';
  size?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  nameFr?: string;
  slug: string;
  description: string;
  descriptionFr?: string;
  curriculum: ForumCurriculum;
  level?: string; // e.g., 'Advanced Level', 'Terminale', 'O-Level'
  subject?: string; // e.g., 'Computer Science', 'Mathématiques'
  department?: string;
  paper?: string;
  topic?: string;
  icon?: string;
  color?: string;
  orderIndex: number;
  discussionCount?: number;
}

export interface ForumCodeSnippet {
  language: 'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'html' | 'css' | 'sql' | string;
  code: string;
}

export interface ForumDiscussion {
  id: string;
  title: string;
  description?: string;
  content: string; // Rich Text or Markdown
  curriculum: ForumCurriculum;
  educationLevel: string; // e.g. 'Advanced Level', 'Terminale'
  department?: string;
  subject: string;
  paper?: string;
  topic?: string;
  type: ForumDiscussionType;
  tags: string[];
  language: 'en' | 'fr';
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  authorAvatar?: string;
  isTeacherVerified: boolean;
  hasVerifiedAnswer: boolean;
  acceptedReplyId?: string;
  isPinned: boolean;
  isLocked: boolean;
  likeCount: number;
  replyCount: number;
  viewCount: number;
  bookmarkCount: number;
  attachments?: ForumAttachment[];
  codeSnippet?: ForumCodeSnippet;
  mathFormula?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface ForumReply {
  id: string;
  discussionId: string;
  parentId?: string | null; // For nested replies
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  authorAvatar?: string;
  isTeacherVerified: boolean;
  isAcceptedAnswer: boolean;
  isPinned: boolean;
  likeCount: number;
  attachments?: ForumAttachment[];
  codeSnippet?: ForumCodeSnippet;
  mathFormula?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ForumLike {
  id: string;
  userId: string;
  targetType: 'discussion' | 'reply';
  targetId: string;
  createdAt: string;
}

export interface ForumBookmark {
  id: string;
  userId: string;
  discussionId: string;
  createdAt: string;
}

export interface ForumReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'discussion' | 'reply';
  targetId: string;
  targetTitle?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ForumNotification {
  id: string;
  userId: string;
  title: string;
  titleFr?: string;
  message: string;
  messageFr?: string;
  type: 'reply' | 'mention' | 'verified_answer' | 'lock' | 'delete' | 'announcement';
  discussionId: string;
  isRead: boolean;
  createdAt: string;
}

export interface ForumAnalytics {
  totalDiscussions: number;
  totalReplies: number;
  activeStudents: number;
  activeTeachers: number;
  mostDiscussedSubjects: { subject: string; count: number }[];
  topSearchedTopics: string[];
  dailyActivity: { date: string; discussions: number; replies: number }[];
}

export type NotificationType =
  | 'general_announcement'
  | 'assignment_reminder'
  | 'study_plan_reminder'
  | 'lesson_reminder'
  | 'revision_reminder'
  | 'quiz_reminder'
  | 'mock_exam_reminder'
  | 'payment_reminder'
  | 'subscription_expiry'
  | 'subscription_renewal'
  | 'discussion_reply'
  | 'teacher_announcement'
  | 'system_maintenance'
  | 'platform_update'
  | 'ai_recommendation'
  | 'certificate_available'
  | 'achievement_earned'
  | 'leaderboard_update'
  | 'password_change'
  | 'security_alert'
  | 'account_login_alert'
  | 'welcome_message';

export type NotificationCategory =
  | 'academic'
  | 'examinations'
  | 'assignments'
  | 'platform_updates'
  | 'maintenance'
  | 'scholarships'
  | 'events'
  | 'competitions'
  | 'general'
  | 'premium';

export type DeliveryChannel = 'in_app' | 'push' | 'email';

export interface TargetAudience {
  role: 'everyone' | 'students' | 'teachers' | 'administrators' | 'specific_users';
  curriculum?: 'english' | 'french' | 'all';
  educationLevel?: string;
  subject?: string;
  subscriptionPlan?: 'free' | 'premium' | 'all';
  userIds?: string[];
}

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'link';
}

export interface Announcement {
  id: string;
  title: string;
  titleFr?: string;
  subtitle?: string;
  subtitleFr?: string;
  description: string;
  descriptionFr?: string;
  contentMarkdown?: string;
  contentMarkdownFr?: string;
  category: NotificationCategory;
  targetAudience: TargetAudience;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  isPinned: boolean;
  publicationDate: string;
  expiryDate?: string;
  authorName: string;
  authorRole: 'admin' | 'teacher';
  attachments?: AnnouncementAttachment[];
  viewsCount?: number;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  announcementId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  titleFr?: string;
  message: string;
  messageFr?: string;
  link?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  isBookmarked: boolean;
  isArchived: boolean;
  channel: DeliveryChannel;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  userId: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  assignmentNotifications: boolean;
  aiNotifications: boolean;
  paymentNotifications: boolean;
  discussionNotifications: boolean;
  achievementNotifications: boolean;
  reminderNotifications: boolean;
  languagePreference: 'en' | 'fr';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  code: string;
  category: NotificationCategory;
  subjectEn: string;
  subjectFr: string;
  bodyEn: string;
  bodyFr: string;
  variables: string[];
}

export interface DeliveryReport {
  id: string;
  announcementId?: string;
  title: string;
  totalRecipients: number;
  inAppDelivered: number;
  pushDelivered: number;
  pushOpened: number;
  emailSent: number;
  emailOpened: number;
  failed: number;
  timestamp: string;
}

export interface NotificationAnalyticsData {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  avgEmailOpenRate: number;
  avgPushOpenRate: number;
  deliveryByDay: { date: string; sent: number; opened: number }[];
  topAnnouncements: { id: string; title: string; views: number }[];
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  userRole?: 'student' | 'teacher' | 'admin';
  action: string;
  category: 'user' | 'curriculum' | 'exam' | 'content' | 'ai' | 'payment' | 'system';
  metadata?: Record<string, any>;
  timestamp: string;
  language?: 'en' | 'fr';
  curriculum?: string;
  level?: string;
}

export interface PlatformOverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  premiumUsers: number;
  freeUsers: number;
  dau: number;
  wau: number;
  mau: number;
  userRetentionRate: number;
  englishUsersCount: number;
  frenchUsersCount: number;
}

export interface CurriculumAnalyticsItem {
  curriculum: string;
  activeUsers: number;
  completedLessons: number;
  avgScore: number;
  popularSubjects: string[];
}

export interface StudentAnalyticsData {
  userId: string;
  studyTimeMinutes: number;
  lessonsCompleted: number;
  quizAvgScore: number;
  examAvgScore: number;
  strongSubjects: string[];
  weakSubjects: string[];
  learningStreak: number;
  progressPercentage: number;
  achievementsUnlocked: number;
  ranking: number;
  totalStudentsInCohort: number;
  recommendedTopics: string[];
  suggestedPractice: string[];
  performanceHistory: { date: string; score: number; studyMinutes: number }[];
}

export interface TeacherAnalyticsData {
  teacherId: string;
  totalStudentsReached: number;
  totalLessonViews: number;
  lessonCompletionRate: number;
  avgQuizPerformance: number;
  assignmentSubmissions: number;
  topicDifficultyMap: { topic: string; subject: string; avgScore: number; failCount: number }[];
  frequentlyAskedQuestions: { question: string; count: number }[];
}

export interface ContentAnalyticsData {
  totalLessons: number;
  lessonViews: number;
  lessonCompletions: number;
  lessonDownloads: number;
  avgRating: number;
  bookmarksCount: number;
  videoViews: number;
  avgWatchDurationMinutes: number;
  documentDownloads: number;
  topLessons: { id: string; title: string; views: number; rating: number }[];
}

export interface AIAnalyticsData {
  totalConversations: number;
  questionsAsked: number;
  mostRequestedSubjects: { subject: string; count: number }[];
  aiUsageByCurriculum: { curriculum: string; queries: number }[];
  tokenConsumption: number;
  avgResponseRating: number;
  popularFeatures: { feature: string; usageCount: number }[];
}

export interface PaymentAnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  annualRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  popularPlans: { planName: string; count: number; revenue: number }[];
  successfulPaymentsCount: number;
  failedPaymentsCount: number;
  revenueByMonth: { month: string; revenue: number }[];
}

export interface GeneratedReport {
  id: string;
  title: string;
  reportType: 'admin' | 'teacher' | 'student';
  category: 'growth' | 'revenue' | 'subscription' | 'activity' | 'content' | 'ai' | 'exam' | 'performance';
  format: 'pdf' | 'excel' | 'csv';
  generatedAt: string;
  generatedBy: string;
  fileSize: string;
  filters: AnalyticsFilter;
  downloadUrl?: string;
}

export interface AnalyticsFilter {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'all';
  curriculum?: string;
  educationLevel?: string;
  subject?: string;
  language?: 'en' | 'fr' | 'all';
  role?: string;
}

// ===============================================================
// Edulpha Virtual Practical Lab Interfaces
// ===============================================================

export type PracticalType = 'coding' | 'science_simulation' | 'step_by_step' | 'practical_assignment';
export type PracticalSubject = 'Computer Science' | 'ICT' | 'Physics' | 'Chemistry' | 'Biology' | 'Technical Education' | string;
export type PracticalDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Easy' | 'Medium' | 'Hard';
export type PracticalStatus = 'draft' | 'published' | 'archived';
export type CodingLabLanguage = 'c' | 'cpp' | 'python' | 'javascript' | 'html' | 'css' | 'sql';

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  weight?: number;
  description?: string;
}

export interface SQLDatabaseTable {
  tableName: string;
  schema: string;
  dataSql: string;
  description?: string;
}

export interface PracticalCodingConfig {
  language: CodingLabLanguage;
  starterCode: string;
  solutionCode?: string;
  testCases: CodingTestCase[];
  allowedLanguages?: CodingLabLanguage[];
  databaseTables?: SQLDatabaseTable[];
}

export interface PracticalSimulationConfig {
  simulationType: 
    | 'biology_microscope' 
    | 'biology_food_test' 
    | 'biology_quadrat' 
    | 'physics_ohms_law' 
    | 'physics_motion' 
    | 'physics_optics' 
    | 'chemistry_titration' 
    | 'chemistry_ph' 
    | 'chemistry_separation' 
    | 'custom';
  initialParams?: Record<string, any>;
  interactiveGuide?: Array<{ step: number; title: string; instruction: string }>;
}

export interface PracticalAssessmentQuestion {
  id: string;
  type: 'mcq' | 'structured' | 'observation' | 'calculation';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
}

export interface PracticalActivity {
  id: string;
  title: string;
  description: string;
  subject: PracticalSubject;
  level: string; // e.g. Ordinary Level, Advanced Level, BEPC, Baccalauréat
  classLevel?: string;
  topic: string;
  durationMinutes: number;
  difficulty: PracticalDifficulty;
  practicalType: PracticalType;
  instructions: string; // Markdown / rich text
  attachments?: Array<{ id: string; name: string; url: string; type: 'pdf' | 'image' | 'doc' | 'zip' | 'link' }>;
  codingConfig?: PracticalCodingConfig;
  simulationConfig?: PracticalSimulationConfig;
  assessmentQuestions?: PracticalAssessmentQuestion[];
  totalMarks?: number;
  status: PracticalStatus;
  createdBy?: string;
  createdByName?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PracticalReportData {
  aim: string;
  apparatus: string;
  procedure: string;
  observations: string;
  results: string;
  analysis: string;
  conclusion: string;
  attachments?: string[];
}

export interface PracticalAttempt {
  id: string;
  practicalId: string;
  practicalTitle?: string;
  subject?: PracticalSubject;
  practicalType?: PracticalType;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: 'in_progress' | 'submitted' | 'graded';
  startedAt: any;
  submittedAt?: any;
  timeSpentSeconds: number;
  codingSubmissions?: Record<string, {
    code: string;
    language: CodingLabLanguage;
    testResults?: Array<{ testId: string; passed: boolean; actualOutput: string; expectedOutput: string }>;
    passedAll?: boolean;
    scorePercent?: number;
  }>;
  simulationState?: Record<string, any>;
  report?: PracticalReportData;
  questionAnswers?: Record<string, any>;
  score?: number;
  maxScore?: number;
  grade?: string;
  feedback?: string;
  aiFeedback?: string;
  gradedBy?: string;
  gradedAt?: any;
}

export interface PracticalSubmission extends PracticalAttempt {}










