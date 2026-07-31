import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Curriculum, EducationLevel, Department, SubjectModel, PaperConfig } from '../types';

// ===============================================================
// Initial Default Curricula & Levels Seed Data
// ===============================================================

export const INITIAL_CURRICULA: Curriculum[] = [
  {
    id: 'cameroon_gce',
    name: 'English Curriculum (Cameroon GCE)',
    code: 'GCE',
    description: 'Cameroon General Certificate of Education Examination Board (GCE Board)',
    language: 'en',
    isActive: true,
    order: 1
  },
  {
    id: 'cameroon_francophone',
    name: 'French Curriculum (Cameroon Francophone System)',
    code: 'FRANCOPHONE',
    description: 'Système Éducatif Francophone du Cameroun (OBC / MINESEC)',
    language: 'fr',
    isActive: true,
    order: 2
  }
];

export const INITIAL_EDUCATION_LEVELS: EducationLevel[] = [
  // GCE English Curriculum Levels
  {
    id: 'gce_o_level',
    curriculumId: 'cameroon_gce',
    name: 'Ordinary Level',
    code: 'O-Level',
    description: 'Cameroon GCE Ordinary Level (Form 1 - Form 5)',
    isActive: true,
    order: 1
  },
  {
    id: 'gce_a_level',
    curriculumId: 'cameroon_gce',
    name: 'Advanced Level',
    code: 'A-Level',
    description: 'Cameroon GCE Advanced Level (Lower & Upper Sixth)',
    isActive: true,
    order: 2
  },
  // Francophone French Curriculum Levels
  {
    id: 'fr_troisieme',
    curriculumId: 'cameroon_francophone',
    name: 'Troisième (BEPC)',
    code: '3ème',
    description: 'Classe de Troisième - Brevet d\'Études du Premier Cycle (BEPC)',
    isActive: true,
    order: 1
  },
  {
    id: 'fr_seconde',
    curriculumId: 'cameroon_francophone',
    name: 'Seconde',
    code: '2nde',
    description: 'Classe de Seconde - Secondaire Général et Technique',
    isActive: true,
    order: 2
  },
  {
    id: 'fr_premiere',
    curriculumId: 'cameroon_francophone',
    name: 'Première',
    code: '1ère',
    description: 'Classe de Première - Épreuves Anticipées du Baccalauréat',
    isActive: true,
    order: 3
  },
  {
    id: 'fr_terminale',
    curriculumId: 'cameroon_francophone',
    name: 'Terminale',
    code: 'Tle',
    description: 'Classe de Terminale - Examen du Baccalauréat',
    isActive: true,
    order: 4
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  // English Curriculum
  { id: 'dept_gce_sci', curriculumId: 'cameroon_gce', name: 'Science & Technology', code: 'SCI', isActive: true },
  { id: 'dept_gce_arts', curriculumId: 'cameroon_gce', name: 'Arts & Humanities', code: 'ARTS', isActive: true },
  { id: 'dept_gce_comm', curriculumId: 'cameroon_gce', name: 'Commercial & Social Sciences', code: 'COMM', isActive: true },
  
  // French Curriculum
  { id: 'dept_fr_exactes', curriculumId: 'cameroon_francophone', name: 'Sciences Exactes & Appliquées', code: 'C/D/TI', isActive: true },
  { id: 'dept_fr_lettres', curriculumId: 'cameroon_francophone', name: 'Lettres, Langues & Arts', code: 'A4/ABI', isActive: true },
  { id: 'dept_fr_econo', curriculumId: 'cameroon_francophone', name: 'Sciences Économiques & Gestion', code: 'SES', isActive: true }
];

export const INITIAL_FRENCH_SUBJECTS: Omit<SubjectModel, 'id'>[] = [
  {
    name: 'Mathématiques',
    code: 'MATH-FR',
    curriculumId: 'cameroon_francophone',
    description: 'Algèbre, Géométrie, Analyse, Probabilités et Statistiques',
    isActive: true,
    papers: [
      { id: 'p1_math', name: 'Épreuve Écrite de Mathématiques', type: 'Theory', durationMinutes: 180, totalMarks: 20 }
    ]
  },
  {
    name: 'Langue Française',
    code: 'FRAN',
    curriculumId: 'cameroon_francophone',
    description: 'Contraction de texte, Discussion, Composition française et Grammaire',
    isActive: true,
    papers: [
      { id: 'p1_fran', name: 'Épreuve de Langue Française', type: 'Essay', durationMinutes: 180, totalMarks: 20 }
    ]
  },
  {
    name: 'English Language',
    code: 'ANGL',
    curriculumId: 'cameroon_francophone',
    description: 'Reading Comprehension, Essay Writing, Grammar & Vocabulary',
    isActive: true,
    papers: [
      { id: 'p1_angl', name: 'Épreuve d\'Anglais', type: 'Structured', durationMinutes: 120, totalMarks: 20 }
    ]
  },
  {
    name: 'Histoire',
    code: 'HIST-FR',
    curriculumId: 'cameroon_francophone',
    description: 'Histoire du Cameroun, de l\'Afrique et Histoire Contemporaine',
    isActive: true,
    papers: [
      { id: 'p1_hist', name: 'Épreuve d\'Histoire', type: 'Theory', durationMinutes: 120, totalMarks: 20 }
    ]
  },
  {
    name: 'Géographie',
    code: 'GEO-FR',
    curriculumId: 'cameroon_francophone',
    description: 'Géographie Physique, Humaine, Économique et Cartographie',
    isActive: true,
    papers: [
      { id: 'p1_geo', name: 'Épreuve de Géographie', type: 'Theory', durationMinutes: 120, totalMarks: 20 }
    ]
  },
  {
    name: 'Économie',
    code: 'ECON-FR',
    curriculumId: 'cameroon_francophone',
    description: 'Microéconomie, Macroéconomie et Problèmes Économiques Contemporains',
    isActive: true,
    papers: [
      { id: 'p1_econ', name: 'Épreuve de Sciences Économiques', type: 'Theory', durationMinutes: 180, totalMarks: 20 }
    ]
  },
  {
    name: 'Philosophie',
    code: 'PHIL',
    curriculumId: 'cameroon_francophone',
    description: 'Dissertation Philosophique et Explication de Texte',
    isActive: true,
    papers: [
      { id: 'p1_phil', name: 'Épreuve de Philosophie', type: 'Essay', durationMinutes: 240, totalMarks: 20 }
    ]
  },
  {
    name: 'Physique',
    code: 'PHYS-FR',
    curriculumId: 'cameroon_francophone',
    description: 'Mécanique, Électricité, Électromagnétisme et Optique',
    isActive: true,
    papers: [
      { id: 'p1_phys', name: 'Épreuve Théorique de Physique', type: 'Theory', durationMinutes: 180, totalMarks: 20 },
      { id: 'p2_phys', name: 'Épreuve Pratique de Physique', type: 'Practical', durationMinutes: 120, totalMarks: 20 }
    ]
  },
  {
    name: 'Chimie',
    code: 'CHIM',
    curriculumId: 'cameroon_francophone',
    description: 'Chimie Générale, Chimie Organique et Solutions Aquatiques',
    isActive: true,
    papers: [
      { id: 'p1_chim', name: 'Épreuve Théorique de Chimie', type: 'Theory', durationMinutes: 180, totalMarks: 20 }
    ]
  },
  {
    name: 'Sciences de la Vie et de la Terre (SVT)',
    code: 'SVT',
    curriculumId: 'cameroon_francophone',
    description: 'Biologie Humaine, Immunologie, Génétique et Géologie',
    isActive: true,
    papers: [
      { id: 'p1_svt', name: 'Épreuve Théorique de SVT', type: 'Theory', durationMinutes: 180, totalMarks: 20 }
    ]
  },
  {
    name: 'Informatique',
    code: 'INFO-FR',
    curriculumId: 'cameroon_francophone',
    description: 'Algorithmique, Programmation, Réseaux et Systèmes d\'Information',
    isActive: true,
    papers: [
      { id: 'p1_info', name: 'Épreuve Théorique d\'Informatique', type: 'Theory', durationMinutes: 120, totalMarks: 20 },
      { id: 'p2_info', name: 'Épreuve Pratique d\'Informatique', type: 'Practical', durationMinutes: 120, totalMarks: 20 }
    ]
  },
  {
    name: 'Éducation à la Citoyenneté',
    code: 'ECM',
    curriculumId: 'cameroon_francophone',
    description: 'Institutions de la République, Droits et Devoirs des Citoyens',
    isActive: true,
    papers: [
      { id: 'p1_ecm', name: 'Épreuve d\'ECM', type: 'Structured', durationMinutes: 90, totalMarks: 20 }
    ]
  }
];

// ===============================================================
// CURRICULUM CRUD OPERATIONS
// ===============================================================

export const fetchCurricula = async (): Promise<Curriculum[]> => {
  try {
    const snap = await getDocs(collection(db, 'curricula'));
    if (snap.empty) {
      return INITIAL_CURRICULA;
    }
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Curriculum));
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.warn("Using initial curricula due to network/db state:", err);
    return INITIAL_CURRICULA;
  }
};

export const saveCurriculum = async (curriculum: Curriculum): Promise<void> => {
  const ref = doc(db, 'curricula', curriculum.id);
  await setDoc(ref, {
    ...curriculum,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const deleteCurriculum = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'curricula', id));
};

// ===============================================================
// EDUCATION LEVELS CRUD OPERATIONS
// ===============================================================

export const fetchEducationLevels = async (curriculumId?: string): Promise<EducationLevel[]> => {
  try {
    let q = query(collection(db, 'education_levels'));
    if (curriculumId) {
      q = query(collection(db, 'education_levels'), where('curriculumId', '==', curriculumId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      if (curriculumId) {
        return INITIAL_EDUCATION_LEVELS.filter(l => l.curriculumId === curriculumId);
      }
      return INITIAL_EDUCATION_LEVELS;
    }
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as EducationLevel));
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    if (curriculumId) {
      return INITIAL_EDUCATION_LEVELS.filter(l => l.curriculumId === curriculumId);
    }
    return INITIAL_EDUCATION_LEVELS;
  }
};

export const saveEducationLevel = async (level: EducationLevel): Promise<void> => {
  const ref = doc(db, 'education_levels', level.id);
  await setDoc(ref, {
    ...level,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const deleteEducationLevel = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'education_levels', id));
};

// ===============================================================
// DEPARTMENTS CRUD OPERATIONS
// ===============================================================

export const fetchDepartments = async (curriculumId?: string): Promise<Department[]> => {
  try {
    let q = query(collection(db, 'departments'));
    if (curriculumId) {
      q = query(collection(db, 'departments'), where('curriculumId', '==', curriculumId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      if (curriculumId) {
        return INITIAL_DEPARTMENTS.filter(d => d.curriculumId === curriculumId);
      }
      return INITIAL_DEPARTMENTS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Department));
  } catch (err) {
    if (curriculumId) {
      return INITIAL_DEPARTMENTS.filter(d => d.curriculumId === curriculumId);
    }
    return INITIAL_DEPARTMENTS;
  }
};

export const saveDepartment = async (dept: Department): Promise<void> => {
  const ref = doc(db, 'departments', dept.id);
  await setDoc(ref, {
    ...dept,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'departments', id));
};

// ===============================================================
// SUBJECTS & PAPERS BY CURRICULUM CRUD OPERATIONS
// ===============================================================

export const fetchSubjectsByCurriculum = async (curriculumId?: string, levelId?: string): Promise<SubjectModel[]> => {
  try {
    let q = query(collection(db, 'subjects'));
    if (curriculumId) {
      q = query(collection(db, 'subjects'), where('curriculumId', '==', curriculumId));
    }
    const snap = await getDocs(q);
    const dbSubjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as SubjectModel));

    if (dbSubjects.length === 0 && curriculumId === 'cameroon_francophone') {
      return INITIAL_FRENCH_SUBJECTS.map((s, idx) => ({ id: `fr_subj_${idx}`, ...s }));
    }

    return dbSubjects;
  } catch (err) {
    console.warn("Error fetching subjects by curriculum:", err);
    if (curriculumId === 'cameroon_francophone') {
      return INITIAL_FRENCH_SUBJECTS.map((s, idx) => ({ id: `fr_subj_${idx}`, ...s }));
    }
    return [];
  }
};

export const saveCurriculumSubject = async (subject: SubjectModel): Promise<string> => {
  if (subject.id) {
    const ref = doc(db, 'subjects', subject.id);
    const { id, ...updateData } = subject;
    await setDoc(ref, {
      ...updateData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return id;
  } else {
    const docRef = await addDoc(collection(db, 'subjects'), {
      ...subject,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
};

export const deleteCurriculumSubject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'subjects', id));
};

// ===============================================================
// USER PROFILE CURRICULUM UPDATER
// ===============================================================

export const updateUserCurriculum = async (
  userId: string, 
  curriculumId: string, 
  curriculumName: string, 
  educationLevelId: string, 
  educationLevelName: string,
  departmentId?: string,
  departmentName?: string
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    curriculumId,
    curriculumName,
    educationLevelId,
    educationLevelName,
    departmentId: departmentId || '',
    departmentName: departmentName || '',
    level: educationLevelName,
    updatedAt: serverTimestamp()
  });
};
