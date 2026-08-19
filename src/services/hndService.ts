import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, setDoc, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './authSecurityService';
import { 
  HNDSchool, HNDDepartment, HNDProgramme, HNDCourse, 
  HNDLearningMaterial, HNDProject, HNDAssignment, HNDAssignmentSubmission,
  HNDAcademicLevel, HNDSemester, HNDEnrollmentPayload, HNDEnrollmentRecord
} from '../types/hnd';
import { 
  DEFAULT_HND_SCHOOLS, DEFAULT_HND_DEPARTMENTS, DEFAULT_HND_PROGRAMMES, 
  DEFAULT_HND_COURSES, DEFAULT_HND_LEARNING_MATERIALS, DEFAULT_HND_PROJECTS 
} from '../constants/hndCurriculum';

// In-Memory cache for lightning-fast performance
let cachedSchools: HNDSchool[] | null = null;
let cachedDepartments: HNDDepartment[] | null = null;
let cachedProgrammes: HNDProgramme[] | null = null;
let cachedCourses: HNDCourse[] | null = null;
let cachedMaterials: HNDLearningMaterial[] | null = null;
let cachedProjects: HNDProject[] | null = null;

// ==========================================
// 1. HND SCHOOLS / FACULTIES CRUD
// ==========================================
export async function getHNDSchools(forceRefresh = false): Promise<HNDSchool[]> {
  if (!forceRefresh && cachedSchools && cachedSchools.length > 0) {
    return cachedSchools;
  }
  try {
    const snap = await getDocs(query(collection(db, 'hnd_schools'), orderBy('order', 'asc')));
    if (snap.empty) {
      // Seed default schools in background
      await seedHNDDefaults();
      cachedSchools = [...DEFAULT_HND_SCHOOLS];
      return cachedSchools;
    }
    cachedSchools = snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDSchool));
    return cachedSchools;
  } catch (err) {
    console.warn('[HND Service] Error fetching schools, using default fallback:', err);
    cachedSchools = [...DEFAULT_HND_SCHOOLS];
    return cachedSchools;
  }
}

export async function saveHNDSchool(school: Partial<HNDSchool>): Promise<string> {
  cachedSchools = null;
  try {
    if (school.id && !school.id.startsWith('new_')) {
      const docRef = doc(db, 'hnd_schools', school.id);
      await updateDoc(docRef, { ...school, updatedAt: serverTimestamp() });
      return school.id;
    } else {
      const id = school.code ? `school_${school.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : doc(collection(db, 'hnd_schools')).id;
      const docRef = doc(db, 'hnd_schools', id);
      await setDoc(docRef, {
        ...school,
        id,
        isActive: school.isActive ?? true,
        order: school.order ?? 99,
        createdAt: serverTimestamp()
      });
      return id;
    }
  } catch (err) {
    return handleFirestoreError(err, OperationType.WRITE, 'hnd_schools');
  }
}

export async function deleteHNDSchool(id: string): Promise<void> {
  cachedSchools = null;
  await deleteDoc(doc(db, 'hnd_schools', id));
}

// ==========================================
// 2. HND DEPARTMENTS CRUD
// ==========================================
export async function getHNDDepartments(schoolId?: string, forceRefresh = false): Promise<HNDDepartment[]> {
  if (!forceRefresh && cachedDepartments && cachedDepartments.length > 0) {
    return schoolId ? cachedDepartments.filter(d => d.schoolId === schoolId) : cachedDepartments;
  }
  try {
    const snap = await getDocs(query(collection(db, 'hnd_departments'), orderBy('order', 'asc')));
    if (snap.empty) {
      cachedDepartments = [...DEFAULT_HND_DEPARTMENTS];
      return schoolId ? cachedDepartments.filter(d => d.schoolId === schoolId) : cachedDepartments;
    }
    cachedDepartments = snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDDepartment));
    return schoolId ? cachedDepartments.filter(d => d.schoolId === schoolId) : cachedDepartments;
  } catch (err) {
    console.warn('[HND Service] Error fetching departments, fallback:', err);
    cachedDepartments = [...DEFAULT_HND_DEPARTMENTS];
    return schoolId ? cachedDepartments.filter(d => d.schoolId === schoolId) : cachedDepartments;
  }
}

export async function saveHNDDepartment(dept: Partial<HNDDepartment>): Promise<string> {
  cachedDepartments = null;
  if (dept.id && !dept.id.startsWith('new_')) {
    const docRef = doc(db, 'hnd_departments', dept.id);
    await updateDoc(docRef, { ...dept, updatedAt: serverTimestamp() });
    return dept.id;
  } else {
    const id = dept.code ? `dept_${dept.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : doc(collection(db, 'hnd_departments')).id;
    const docRef = doc(db, 'hnd_departments', id);
    await setDoc(docRef, {
      ...dept,
      id,
      isActive: dept.isActive ?? true,
      order: dept.order ?? 99,
      createdAt: serverTimestamp()
    });
    return id;
  }
}

export async function deleteHNDDepartment(id: string): Promise<void> {
  cachedDepartments = null;
  await deleteDoc(doc(db, 'hnd_departments', id));
}

// ==========================================
// 3. HND PROGRAMMES CRUD
// ==========================================
export async function getHNDProgrammes(departmentId?: string, forceRefresh = false): Promise<HNDProgramme[]> {
  if (!forceRefresh && cachedProgrammes && cachedProgrammes.length > 0) {
    return departmentId ? cachedProgrammes.filter(p => p.departmentId === departmentId) : cachedProgrammes;
  }
  try {
    const snap = await getDocs(query(collection(db, 'hnd_programmes'), orderBy('order', 'asc')));
    if (snap.empty) {
      cachedProgrammes = [...DEFAULT_HND_PROGRAMMES];
      return departmentId ? cachedProgrammes.filter(p => p.departmentId === departmentId) : cachedProgrammes;
    }
    cachedProgrammes = snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDProgramme));
    return departmentId ? cachedProgrammes.filter(p => p.departmentId === departmentId) : cachedProgrammes;
  } catch (err) {
    console.warn('[HND Service] Error fetching programmes, fallback:', err);
    cachedProgrammes = [...DEFAULT_HND_PROGRAMMES];
    return departmentId ? cachedProgrammes.filter(p => p.departmentId === departmentId) : cachedProgrammes;
  }
}

export async function getHNDProgrammeById(id: string): Promise<HNDProgramme | null> {
  const programmes = await getHNDProgrammes();
  return programmes.find(p => p.id === id) || null;
}

export async function saveHNDProgramme(programme: Partial<HNDProgramme>): Promise<string> {
  cachedProgrammes = null;
  if (programme.id && !programme.id.startsWith('new_')) {
    const docRef = doc(db, 'hnd_programmes', programme.id);
    await updateDoc(docRef, { ...programme, updatedAt: serverTimestamp() });
    return programme.id;
  } else {
    const id = programme.code ? `prog_hnd_${programme.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : doc(collection(db, 'hnd_programmes')).id;
    const docRef = doc(db, 'hnd_programmes', id);
    await setDoc(docRef, {
      ...programme,
      id,
      durationYears: programme.durationYears || 2,
      levels: programme.levels || ['HND Level 1', 'HND Level 2'],
      semesters: programme.semesters || ['Semester 1', 'Semester 2'],
      isActive: programme.isActive ?? true,
      order: programme.order ?? 99,
      createdAt: serverTimestamp()
    });
    return id;
  }
}

export async function deleteHNDProgramme(id: string): Promise<void> {
  cachedProgrammes = null;
  await deleteDoc(doc(db, 'hnd_programmes', id));
}

// ==========================================
// 4. HND COURSES CRUD
// ==========================================
export async function getHNDCourses(filters?: {
  programmeId?: string;
  level?: HNDAcademicLevel | string;
  semester?: HNDSemester | string;
}, forceRefresh = false): Promise<HNDCourse[]> {
  if (!forceRefresh && cachedCourses && cachedCourses.length > 0) {
    return filterCourses(cachedCourses, filters);
  }
  try {
    const snap = await getDocs(query(collection(db, 'hnd_courses'), orderBy('order', 'asc')));
    if (snap.empty) {
      cachedCourses = [...DEFAULT_HND_COURSES];
      return filterCourses(cachedCourses, filters);
    }
    cachedCourses = snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDCourse));
    return filterCourses(cachedCourses, filters);
  } catch (err) {
    console.warn('[HND Service] Error fetching courses, fallback:', err);
    cachedCourses = [...DEFAULT_HND_COURSES];
    return filterCourses(cachedCourses, filters);
  }
}

function filterCourses(courses: HNDCourse[], filters?: {
  programmeId?: string;
  level?: HNDAcademicLevel | string;
  semester?: HNDSemester | string;
}): HNDCourse[] {
  if (!filters) return courses;
  return courses.filter(c => {
    if (filters.programmeId && c.programmeId !== filters.programmeId) return false;
    if (filters.level && c.level !== filters.level) return false;
    if (filters.semester && c.semester !== filters.semester) return false;
    return true;
  });
}

export async function saveHNDCourse(course: Partial<HNDCourse>): Promise<string> {
  cachedCourses = null;
  if (course.id && !course.id.startsWith('new_')) {
    const docRef = doc(db, 'hnd_courses', course.id);
    await updateDoc(docRef, { ...course, updatedAt: serverTimestamp() });
    return course.id;
  } else {
    const id = course.code ? `course_${course.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : doc(collection(db, 'hnd_courses')).id;
    const docRef = doc(db, 'hnd_courses', id);
    await setDoc(docRef, {
      ...course,
      id,
      creditValue: course.creditValue || 3,
      level: course.level || 'HND Level 1',
      semester: course.semester || 'Semester 1',
      isActive: course.isActive ?? true,
      order: course.order ?? 99,
      createdAt: serverTimestamp()
    });
    return id;
  }
}

export async function deleteHNDCourse(id: string): Promise<void> {
  cachedCourses = null;
  await deleteDoc(doc(db, 'hnd_courses', id));
}

// ==========================================
// 5. HND LEARNING MATERIALS & NOTES CRUD
// ==========================================
export async function getHNDMaterials(filters?: {
  courseId?: string;
  programmeId?: string;
  level?: HNDAcademicLevel | string;
  semester?: HNDSemester | string;
}): Promise<HNDLearningMaterial[]> {
  if (cachedMaterials && cachedMaterials.length > 0) {
    return filterMaterials(cachedMaterials, filters);
  }
  try {
    const snap = await getDocs(collection(db, 'hnd_materials'));
    if (snap.empty) {
      cachedMaterials = [...DEFAULT_HND_LEARNING_MATERIALS];
      return filterMaterials(cachedMaterials, filters);
    }
    cachedMaterials = snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDLearningMaterial));
    return filterMaterials(cachedMaterials, filters);
  } catch (err) {
    cachedMaterials = [...DEFAULT_HND_LEARNING_MATERIALS];
    return filterMaterials(cachedMaterials, filters);
  }
}

function filterMaterials(mats: HNDLearningMaterial[], filters?: {
  courseId?: string;
  programmeId?: string;
  level?: HNDAcademicLevel | string;
  semester?: HNDSemester | string;
}): HNDLearningMaterial[] {
  if (!filters) return mats;
  return mats.filter(m => {
    if (filters.courseId && m.courseId !== filters.courseId) return false;
    if (filters.programmeId && m.programmeId !== filters.programmeId) return false;
    if (filters.level && m.level !== filters.level) return false;
    if (filters.semester && m.semester !== filters.semester) return false;
    return true;
  });
}

export async function saveHNDMaterial(mat: Partial<HNDLearningMaterial>): Promise<string> {
  cachedMaterials = null;
  try {
    const docRef = mat.id ? doc(db, 'hnd_materials', mat.id) : doc(collection(db, 'hnd_materials'));
    const id = docRef.id;
    await setDoc(docRef, {
      ...mat,
      id,
      isPublished: mat.isPublished ?? true,
      createdAt: serverTimestamp()
    }, { merge: true });
    return id;
  } catch (err) {
    return handleFirestoreError(err, OperationType.WRITE, 'hnd_materials');
  }
}

export async function deleteHNDMaterial(id: string): Promise<void> {
  cachedMaterials = null;
  await deleteDoc(doc(db, 'hnd_materials', id));
}

// ==========================================
// 6. HND PROJECTS & RESEARCH REPOSITORY
// ==========================================
export async function getHNDProjects(filters?: {
  programmeId?: string;
  level?: string;
  status?: string;
}): Promise<HNDProject[]> {
  if (cachedProjects && cachedProjects.length > 0) {
    return filterProjects(cachedProjects, filters);
  }
  try {
    const snap = await getDocs(collection(db, 'hnd_projects'));
    if (snap.empty) {
      cachedProjects = [...DEFAULT_HND_PROJECTS];
      return filterProjects(cachedProjects, filters);
    }
    cachedProjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDProject));
    return filterProjects(cachedProjects, filters);
  } catch (err) {
    cachedProjects = [...DEFAULT_HND_PROJECTS];
    return filterProjects(cachedProjects, filters);
  }
}

function filterProjects(projects: HNDProject[], filters?: {
  programmeId?: string;
  level?: string;
  status?: string;
}): HNDProject[] {
  if (!filters) return projects;
  return projects.filter(p => {
    if (filters.programmeId && p.programmeId !== filters.programmeId) return false;
    if (filters.level && p.level !== filters.level) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });
}

export async function saveHNDProject(proj: Partial<HNDProject>): Promise<string> {
  cachedProjects = null;
  const docRef = proj.id ? doc(db, 'hnd_projects', proj.id) : doc(collection(db, 'hnd_projects'));
  const id = docRef.id;
  await setDoc(docRef, {
    ...proj,
    id,
    status: proj.status || 'approved',
    createdAt: serverTimestamp()
  }, { merge: true });
  return id;
}

// ==========================================
// 7. HND ASSIGNMENTS & SUBMISSIONS
// ==========================================
export async function getHNDAssignments(filters?: {
  courseId?: string;
  programmeId?: string;
  level?: string;
  semester?: string;
  activeOnly?: boolean;
}): Promise<HNDAssignment[]> {
  try {
    let q = query(collection(db, 'hnd_assignments'), orderBy('createdAt', 'desc'));
    
    if (filters?.courseId) q = query(q, where('courseId', '==', filters.courseId));
    if (filters?.programmeId) q = query(q, where('programmeId', '==', filters.programmeId));
    if (filters?.level) q = query(q, where('level', '==', filters.level));
    if (filters?.semester) q = query(q, where('semester', '==', filters.semester));
    if (filters?.activeOnly) q = query(q, where('active', '==', true));

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDAssignment));
  } catch (err) {
    console.warn('[HND Service] Error fetching assignments:', err);
    return [];
  }
}

export async function saveHNDAssignment(assignment: Partial<HNDAssignment>): Promise<string> {
  try {
    const docRef = assignment.id ? doc(db, 'hnd_assignments', assignment.id) : doc(collection(db, 'hnd_assignments'));
    const id = docRef.id;
    await setDoc(docRef, {
      ...assignment,
      id,
      active: assignment.active ?? true,
      createdAt: serverTimestamp()
    }, { merge: true });
    return id;
  } catch (err) {
    return handleFirestoreError(err, OperationType.WRITE, 'hnd_assignments');
  }
}

// ==========================================
// 8. SEED ALL DEFAULTS
// ==========================================
export async function seedHNDDefaults(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Schools
    for (const school of DEFAULT_HND_SCHOOLS) {
      const docRef = doc(db, 'hnd_schools', school.id);
      batch.set(docRef, { ...school, createdAt: serverTimestamp() }, { merge: true });
    }

    // Departments
    for (const dept of DEFAULT_HND_DEPARTMENTS) {
      const docRef = doc(db, 'hnd_departments', dept.id);
      batch.set(docRef, { ...dept, createdAt: serverTimestamp() }, { merge: true });
    }

    // Programmes
    for (const prog of DEFAULT_HND_PROGRAMMES) {
      const docRef = doc(db, 'hnd_programmes', prog.id);
      batch.set(docRef, { ...prog, createdAt: serverTimestamp() }, { merge: true });
    }

    // Courses
    for (const course of DEFAULT_HND_COURSES) {
      const docRef = doc(db, 'hnd_courses', course.id);
      batch.set(docRef, { ...course, createdAt: serverTimestamp() }, { merge: true });
    }

    // Materials
    for (const mat of DEFAULT_HND_LEARNING_MATERIALS) {
      const docRef = doc(db, 'hnd_materials', mat.id);
      batch.set(docRef, { ...mat, createdAt: serverTimestamp() }, { merge: true });
    }

    // Projects
    for (const proj of DEFAULT_HND_PROJECTS) {
      const docRef = doc(db, 'hnd_projects', proj.id);
      batch.set(docRef, { ...proj, createdAt: serverTimestamp() }, { merge: true });
    }

    await batch.commit();
    console.log('[HND Service] Successfully seeded all default HND data!');
  } catch (err) {
    console.error('[HND Service] Error seeding HND defaults:', err);
  }
}

// ==========================================
// 8. STUDENT HND ENROLLMENT & PROFILE PERSISTENCE
// ==========================================

/**
 * Enrolls a student in an HND Programme, Academic Level, and Semester,
 * persisting selections in the User Profile and in the hnd_enrollments collection.
 */
export async function enrollStudentInHND(
  userId: string, 
  payload: HNDEnrollmentPayload,
  userMetadata?: { name?: string; email?: string }
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  // Calculate total credits
  const allCourses = await getHNDCourses({
    programmeId: payload.programmeId,
    level: payload.level,
    semester: payload.semester
  });
  
  const enrolledCourses = allCourses.filter(c => payload.enrolledCourseIds.includes(c.id));
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.creditValue || 3), 0);
  const courseCodes = payload.enrolledCourseCodes && payload.enrolledCourseCodes.length > 0 
    ? payload.enrolledCourseCodes 
    : enrolledCourses.map(c => c.code);
  const courseNames = payload.enrolledCourseNames && payload.enrolledCourseNames.length > 0
    ? payload.enrolledCourseNames
    : enrolledCourses.map(c => c.name);

  const primarySubject = courseNames.length > 0 ? courseNames[0] : payload.programmeName;

  // 1. Update user profile document
  const userUpdateData: Record<string, any> = {
    curriculumId: 'hnd',
    curriculumName: 'Higher National Diploma (HND)',
    academicLevel: 'Higher National Diploma',
    educationLevel: payload.level,
    level: payload.level,
    hndSchoolId: payload.schoolId,
    hndSchoolName: payload.schoolName,
    hndDepartmentId: payload.departmentId,
    hndDepartmentName: payload.departmentName,
    hndProgrammeId: payload.programmeId,
    hndProgrammeName: payload.programmeName,
    hndProgrammeCode: payload.programmeCode,
    hndLevel: payload.level,
    hndSemester: payload.semester,
    hndEnrolledCourseIds: payload.enrolledCourseIds,
    hndEnrolledCourseCodes: courseCodes,
    selectedSubjects: courseNames,
    subject: primarySubject,
    department: payload.programmeName,
    targetExam: `HND National Exam (${payload.programmeName})`,
    assignedPapers: ['End of Semester Examination', 'Continuous Assessment Test (CAT)', 'Case Study & Project'],
    updatedAt: serverTimestamp(),
  };

  await updateDoc(userRef, userUpdateData);

  // 2. Persist in hnd_enrollments tracking collection for historical records
  try {
    const cleanLevel = payload.level.replace(/\s+/g, '_');
    const cleanSemester = payload.semester.replace(/\s+/g, '_');
    const enrollmentRecordId = `${userId}_${payload.programmeId}_${cleanLevel}_${cleanSemester}`;
    const enrollmentRef = doc(db, 'hnd_enrollments', enrollmentRecordId);
    
    const enrollmentRecord: Partial<HNDEnrollmentRecord> = {
      id: enrollmentRecordId,
      studentId: userId,
      studentName: userMetadata?.name || '',
      studentEmail: userMetadata?.email || '',
      schoolId: payload.schoolId,
      schoolName: payload.schoolName,
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      programmeId: payload.programmeId,
      programmeName: payload.programmeName,
      programmeCode: payload.programmeCode,
      level: payload.level,
      semester: payload.semester,
      enrolledCourseIds: payload.enrolledCourseIds,
      enrolledCourseCodes: courseCodes,
      enrolledCourseNames: courseNames,
      totalCredits,
      academicYear: payload.academicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      status: 'active',
      enrolledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(enrollmentRef, enrollmentRecord, { merge: true });
  } catch (err) {
    console.warn('[HND Service] Failed to save enrollment record to hnd_enrollments collection:', err);
    // Non-blocking as profile is already updated
  }
}

/**
 * Updates only the student's active HND semester and course modules
 */
export async function updateStudentHNDSemester(
  userId: string,
  programmeId: string,
  level: HNDAcademicLevel,
  semester: HNDSemester,
  courseIds?: string[],
  courseNames?: string[]
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  // If no courseIds passed, auto-select all courses for this programme+level+semester
  let activeCourseIds = courseIds;
  let activeCourseNames = courseNames;
  let activeCourseCodes: string[] = [];

  if (!activeCourseIds || activeCourseIds.length === 0) {
    const semesterCourses = await getHNDCourses({
      programmeId,
      level,
      semester
    });
    activeCourseIds = semesterCourses.map(c => c.id);
    activeCourseNames = semesterCourses.map(c => c.name);
    activeCourseCodes = semesterCourses.map(c => c.code);
  }

  const updates: Record<string, any> = {
    hndLevel: level,
    hndSemester: semester,
    educationLevel: level,
    level: level,
    hndEnrolledCourseIds: activeCourseIds,
    hndEnrolledCourseCodes: activeCourseCodes,
    updatedAt: serverTimestamp()
  };

  if (activeCourseNames && activeCourseNames.length > 0) {
    updates.selectedSubjects = activeCourseNames;
    updates.subject = activeCourseNames[0];
  }

  await updateDoc(userRef, updates);
}

/**
 * Fetches all past and current HND enrollments for a given student
 */
export async function getStudentHNDEnrollments(userId: string): Promise<HNDEnrollmentRecord[]> {
  try {
    const q = query(collection(db, 'hnd_enrollments'), where('studentId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as HNDEnrollmentRecord));
  } catch (err) {
    console.warn('[HND Service] Error fetching student enrollments:', err);
    return [];
  }
}

