/**
 * Edulpha Academic Syllabus & Priority Engine Types
 * Hierarchical relationship:
 * STREAM -> LEVEL -> SUBJECT -> SYLLABUS -> MODULE -> TOPIC -> SUBTOPIC -> LEARNING OBJECTIVES -> GCE PAPER -> TOPIC PRIORITY
 */

export type TopicPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PrioritySource = 'ADMIN' | 'SYSTEM' | 'AI_SUGGESTED';
export type TopicDifficulty = 'Introductory' | 'Standard' | 'Advanced' | 'Challenging';
export type PaperRelevance = 'Paper 1' | 'Paper 2' | 'Paper 3';
export type TopicStatus = 'active' | 'provisional' | 'archived';

export interface AcademicStream {
  id: string; // 'general' | 'technical' | 'commercial'
  name: string;
  nameFr?: string;
  code: string;
  description: string;
  descriptionFr?: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

export interface AcademicLevel {
  id: string; // 'ordinary_level' | 'advanced_level'
  streamId: string;
  name: string;
  nameFr?: string;
  code: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface SyllabusSubject {
  id: string;
  name: string;
  nameFr?: string;
  code: string;
  streamId: string;
  levelId: string;
  language: 'en' | 'fr' | 'bilingual';
  description: string;
  descriptionFr?: string;
  examinationType: 'GCE' | 'TVEE' | 'BACC' | 'PRO';
  availablePapers: PaperRelevance[];
  isActive: boolean;
  order?: number;
}

export interface SyllabusModule {
  id: string;
  subjectId: string;
  streamId: string;
  levelId: string;
  moduleNumber: string; // e.g. "Module 1", "Unit 2.1"
  title: string;
  titleFr?: string;
  description?: string;
  order: number;
  isActive?: boolean;
}

export interface SubtopicItem {
  id: string;
  name: string;
  nameFr?: string;
  description?: string;
  order?: number;
}

export interface LinkedPastGceQuestion {
  id?: string;
  year: number;
  paper: PaperRelevance;
  questionNumber: string;
  subpart?: string;
  marks: number;
  questionSnippet: string;
  questionType?: 'MCQ' | 'Structured' | 'Code' | 'Practical' | 'Essay';
}

export interface TopicPriorityBreakdown {
  curriculumWeight: number; // 0-100
  gceFrequency: number; // 0-100
  gceMarksWeight: number; // 0-100
  paperCoverage: number; // 0-100
  prerequisiteImportance: number; // 0-100
}

export interface SyllabusTopicModel {
  id: string;
  subjectId: string;
  subjectName: string;
  streamId: string;
  levelId: string;
  moduleId: string;
  moduleTitle: string;
  topicName: string;
  topicNameFr?: string;
  code?: string;
  description: string;
  descriptionFr?: string;
  subtopics: SubtopicItem[];
  learningObjectives: string[];
  learningObjectivesFr?: string[];
  importantConcepts: string[];
  paperRelevance: PaperRelevance[];
  priority: TopicPriority;
  priorityScore: number; // 0 - 100
  prioritySource: PrioritySource;
  priorityReason: string;
  priorityBreakdown: TopicPriorityBreakdown;
  difficulty: TopicDifficulty;
  prerequisites: string[]; // IDs or names of prerequisite topics
  estimatedStudyTimeMinutes: number;
  pastQuestionCount: number;
  pastQuestionsList: LinkedPastGceQuestion[];
  questionCount: number;
  order: number;
  lastReviewed?: string;
  status: TopicStatus;
  isOfficialSyllabus: boolean; // false = "Edulpha AI Suggested Topic"
  revisionNotesSummary?: string;
  commonMistakes?: string[];
  examTips?: string[];
}

export interface StudentTopicProgress {
  id: string;
  userId: string;
  topicId: string;
  subjectId: string;
  masteryScore: number; // 0 - 100
  personalPriority: TopicPriority;
  personalPriorityScore: number; // 0 - 100
  personalPriorityReason: string;
  status: 'not_started' | 'in_progress' | 'mastered' | 'requires_revision';
  questionsAttempted: number;
  questionsCorrect: number;
  repeatedMistakesCount: number;
  lastPracticedAt?: string;
  notesRead: boolean;
  studyTimeSpentMinutes: number;
}

export interface StudyRecommendation {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  moduleTitle: string;
  paper: PaperRelevance;
  priority: TopicPriority;
  priorityScore: number;
  reason: string;
  estimatedMinutes: number;
  recommendedAction: 'read_notes' | 'practice_past_questions' | 'daily_drill' | 'topic_quiz';
  masteryScore: number;
  prerequisitesMet: boolean;
}

export interface TopicGapAnalysis {
  topicId: string;
  topicName: string;
  subjectName: string;
  levelName: string;
  streamName: string;
  priority: TopicPriority;
  priorityScore: number;
  questionCount: number;
  pastQuestionCount: number;
  hasRevisionNotes: boolean;
  averageStudentMastery: number;
  studentErrorRate: number;
  missingContentFlags: string[];
}
