import { SubjectModel, PaperConfig } from '../types';

export type HNDAcademicLevel = 'HND Level 1' | 'HND Level 2';
export type HNDSemester = 'Semester 1' | 'Semester 2';
export type HNDPaperType = 
  | 'End of Semester Examination'
  | 'Continuous Assessment Test (CAT)'
  | 'Practical Examination'
  | 'Resit / Supplementary Examination'
  | 'Case Study & Project'
  | 'National HND Exam'
  | 'Paper 1 (MCQ)'
  | 'Paper 2 (Theory)'
  | string;

export interface HNDSchool {
  id: string;
  name: string;
  nameFr?: string;
  code: string;
  description?: string;
  descriptionFr?: string;
  icon?: string;
  isActive: boolean;
  order?: number;
  createdAt?: any;
}

export interface HNDDepartment {
  id: string;
  schoolId: string;
  schoolName?: string;
  name: string;
  nameFr?: string;
  code: string;
  description?: string;
  descriptionFr?: string;
  isActive: boolean;
  order?: number;
  createdAt?: any;
}

export interface HNDProgramme {
  id: string;
  schoolId: string;
  schoolName?: string;
  departmentId: string;
  departmentName?: string;
  name: string;
  nameFr?: string;
  code: string; // e.g. 'SWE', 'CS', 'ACC', 'NWT'
  durationYears: number; // e.g. 2
  levels: HNDAcademicLevel[]; // ['HND Level 1', 'HND Level 2']
  semesters: HNDSemester[]; // ['Semester 1', 'Semester 2']
  description?: string;
  descriptionFr?: string;
  admissionRequirements?: string;
  admissionRequirementsFr?: string;
  careerProspects?: string[];
  isActive: boolean;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface HNDCourse {
  id: string;
  programmeId: string;
  programmeName?: string;
  programmeCode?: string;
  schoolId?: string;
  departmentId?: string;
  name: string;
  nameFr?: string;
  code: string; // e.g. 'HND-CS-203', 'SWE-101'
  level: HNDAcademicLevel; // 'HND Level 1' | 'HND Level 2'
  semester: HNDSemester; // 'Semester 1' | 'Semester 2'
  creditValue: number; // e.g. 3, 4, 6
  description?: string;
  descriptionFr?: string;
  lecturer?: string;
  isPractical?: boolean;
  syllabus?: string[];
  prerequisites?: string[];
  papers?: PaperConfig[];
  learningOutcomes?: string[];
  recommendedBooks?: string[];
  isActive: boolean;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface HNDLearningMaterial {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  programmeId: string;
  programmeName?: string;
  level: HNDAcademicLevel;
  semester: HNDSemester;
  title: string;
  titleFr?: string;
  type: 'Lecture Notes' | 'Slides / PDF' | 'Study Guide' | 'Revision Sheet' | 'Practical Manual' | 'Tutorial & Lab' | 'Past Solution' | 'Syllabus' | 'Past Exams' | 'Assignment' | 'Reference Book' | 'Other';
  fileUrl: string;
  fileSize?: string;
  fileName?: string;
  description?: string;
  authorOrLecturer?: string;
  academicYear?: string;
  isPublished: boolean;
  createdAt?: any;
}

export interface HNDProject {
  id: string;
  programmeId: string;
  programmeName: string;
  level: HNDAcademicLevel;
  academicYear: string;
  title: string;
  abstract: string;
  authorName: string;
  supervisorName?: string;
  keywords?: string[];
  fileUrl?: string;
  fileSize?: string;
  status: 'approved' | 'in_review' | 'archived' | 'featured';
  methodology?: string;
  chapters?: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  createdAt?: any;
}

export interface HNDAssignment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  programmeId: string;
  level: HNDAcademicLevel;
  semester: HNDSemester;
  title: string;
  description: string;
  dueDate: any;
  totalMarks: number;
  attachmentUrl?: string;
  attachmentName?: string;
  active: boolean;
  submissionsCount?: number;
  createdAt?: any;
}

export interface HNDAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  fileUrl: string;
  fileName: string;
  notes?: string;
  submittedAt: any;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'resubmit';
}

export interface HNDEnrollmentPayload {
  schoolId: string;
  schoolName: string;
  departmentId: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  level: HNDAcademicLevel;
  semester: HNDSemester;
  enrolledCourseIds: string[];
  enrolledCourseCodes?: string[];
  enrolledCourseNames?: string[];
  academicYear?: string;
}

export interface HNDEnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  schoolId: string;
  schoolName: string;
  departmentId: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  level: HNDAcademicLevel;
  semester: HNDSemester;
  enrolledCourseIds: string[];
  enrolledCourseCodes?: string[];
  enrolledCourseNames?: string[];
  totalCredits: number;
  academicYear?: string;
  status: 'active' | 'completed' | 'withdrawn' | 'transferred';
  enrolledAt: any;
  updatedAt?: any;
}

