import { SubjectModel, PaperConfig } from '../types';
import { collection, getDocs, doc, setDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';

export const DEFAULT_GCE_SUBJECTS: Omit<SubjectModel, 'id' | 'createdAt'>[] = [
  // ==========================================
  // ORDINARY LEVEL (O-LEVEL) - SCIENCE & TECH
  // ==========================================
  {
    name: 'Computer Science',
    code: '0595',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Cameroon GCE O-Level Computer Science syllabus covering programming, hardware, networks and logic.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Theory, Problem Solving & Algorithms' },
      { id: 'paper3', name: 'Paper 3 (Practical Programming)', type: 'Practical', totalMarks: 50, durationMinutes: 90, description: 'Hands-on Programming & Practical' },
    ]
  },
  {
    name: 'Mathematics',
    code: '0570',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'General Mathematics covering Algebra, Geometry, Trigonometry, and Statistics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Structured & Essay)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Section A & Section B Structured Questions' },
    ]
  },
  {
    name: 'Additional Mathematics',
    code: '0575',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Advanced O-Level Mathematics including Calculus, Vectors, and Matrices.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Pure & Applied Math)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Calculus, Vectors, Dynamics & Statics' },
    ]
  },
  {
    name: 'Physics',
    code: '0580',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Mechanics, Heat, Waves, Electricity, Magnetism and Atomic Physics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Short-answer and structured questions' },
      { id: 'paper3', name: 'Paper 3 (Practical Physics)', type: 'Practical', totalMarks: 50, durationMinutes: 90, description: 'Laboratory experiment & measurements' },
    ]
  },
  {
    name: 'Chemistry',
    code: '0515',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Atomic structure, Stoichiometry, Organic & Inorganic chemistry.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Structured and essay questions' },
      { id: 'paper3', name: 'Paper 3 (Practical Chemistry)', type: 'Practical', totalMarks: 50, durationMinutes: 90, description: 'Qualitative and quantitative lab analysis' },
    ]
  },
  {
    name: 'Biology',
    code: '0510',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Cell biology, Plant & Human Physiology, Genetics and Ecology.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Structured and biological essay questions' },
      { id: 'paper3', name: 'Paper 3 (Practical Specimen Analysis)', type: 'Practical', totalMarks: 50, durationMinutes: 90, description: 'Specimen identification and biological drawings' },
    ]
  },
  {
    name: 'Integrated Science',
    code: '0555',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Combined foundational concepts of Physics, Chemistry, and Biology.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Integrated science problem solving' },
    ]
  },
  {
    name: 'Technical Drawing',
    code: '0590',
    level: 'Ordinary level',
    category: 'Science & Technology',
    description: 'Geometric construction, Orthographic projections, and Isometric drawings.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ & Engineering Design)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Drawing & Drafting Practical)', type: 'Practical', totalMarks: 100, durationMinutes: 180, description: 'Drafting board geometry & projections' },
    ]
  },

  // ==========================================
  // ORDINARY LEVEL (O-LEVEL) - ARTS & HUMANITIES
  // ==========================================
  {
    name: 'English Language',
    code: '0530',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Grammar, Comprehension, Summary Writing, and Essay Writing.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ & Comprehension)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Grammar & Vocab' },
      { id: 'paper2', name: 'Paper 2 (Essay & Directed Writing)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Composition, Directed Writing & Summary' },
    ]
  },
  {
    name: 'English Literature',
    code: '0535',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Analysis of prescribed Drama, Prose, and Poetry texts.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Drama & Poetry)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Prescribed plays and poetic analysis' },
      { id: 'paper2', name: 'Paper 2 (Prose & Unseen Texts)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Novel studies and unseen literary critique' },
    ]
  },
  {
    name: 'French',
    code: '0545',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'French grammar, comprehension, composition, and translation.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ & Grammar)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Grammaire, vocabulaire et comprehension' },
      { id: 'paper2', name: 'Paper 2 (Written Production & Translation)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Expression ecrite et traduction' },
    ]
  },
  {
    name: 'French Literature',
    code: '0546',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Explication de textes, etude d’œuvres au programme (Roman, Theatre, Poesie).',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Litterature & Theatre)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Etudes d’œuvres dramatiques et litteraires' },
      { id: 'paper2', name: 'Paper 2 (Roman & Poesie)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Analyse romanesque et poétique' },
    ]
  },
  {
    name: 'History',
    code: '0560',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Cameroon History since 1800, World History, and International Organizations.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Cameroon & World History Essay)', type: 'Essay', totalMarks: 100, durationMinutes: 150, description: 'Essay questions on Cameroon and World Events' },
    ]
  },
  {
    name: 'Geography',
    code: '0550',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Mapwork, Physical Geography, and Human/Economic Geography.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Map Work & Physical/Human Geography)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Topographical map reading and physical geography' },
    ]
  },
  {
    name: 'Religious Studies',
    code: '0585',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Christian Religious Knowledge / Islamic Studies and Moral Ethics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Old & New Testament / Ethics)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Scriptural studies and contemporary ethical themes' },
    ]
  },
  {
    name: 'Citizenship Education',
    code: '0525',
    level: 'Ordinary level',
    category: 'Arts & Humanities',
    description: 'Human rights, Governance, Democracy, Environment, and Civic duties in Cameroon.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Governance & Human Rights)', type: 'Essay', totalMarks: 100, durationMinutes: 120, description: 'Civic responsibilities and state institutions' },
    ]
  },

  // ==========================================
  // ORDINARY LEVEL (O-LEVEL) - BUSINESS & COMMERCIAL
  // ==========================================
  {
    name: 'Economics',
    code: '0520',
    level: 'Ordinary level',
    category: 'Business & Commercial',
    description: 'Microeconomics, Macroeconomics, Money & Banking, and Trade.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Micro & Macro Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Economic principles, supply, demand & national income' },
    ]
  },
  {
    name: 'Commerce',
    code: '0522',
    level: 'Ordinary level',
    category: 'Business & Commercial',
    description: 'Home & International Trade, Insurance, Warehousing, and Transport.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Trade & Business Operations)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Commercial documents and business transactions' },
    ]
  },
  {
    name: 'Principles of Accounts',
    code: '0505',
    level: 'Ordinary level',
    category: 'Business & Commercial',
    description: 'Double-entry bookkeeping, Financial statements, and Ledger accounts.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Financial Statements & Bookkeeping)', type: 'Practical', totalMarks: 100, durationMinutes: 150, description: 'Balance sheets, Income statements & Trial balances' },
    ]
  },

  // ==========================================
  // ORDINARY LEVEL (O-LEVEL) - HOME ECONOMICS
  // ==========================================
  {
    name: 'Food and Nutrition',
    code: '0540',
    level: 'Ordinary level',
    category: 'Home Economics',
    description: 'Nutritional science, Diet planning, Food hygiene, and Culinary arts.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Dietetics & Culinary Science)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Nutrition and food preparation principles' },
      { id: 'paper3', name: 'Paper 3 (Practical Cooking Assessment)', type: 'Practical', totalMarks: 50, durationMinutes: 150, description: 'Practical cooking exam' },
    ]
  },
  {
    name: 'Home Management',
    code: '0565',
    level: 'Ordinary level',
    category: 'Home Economics',
    description: 'Family welfare, Home budgeting, Consumer education, and Interior design.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Family Resource Management)', type: 'Theory', totalMarks: 100, durationMinutes: 120, description: 'Household resource allocation and care' },
    ]
  },

  // ==========================================
  // ADVANCED LEVEL (A-LEVEL) - SCIENCE
  // ==========================================
  {
    name: 'Computer Science',
    code: '0795',
    level: 'Advance level',
    category: 'Science',
    description: 'Advanced Data Structures, Software Engineering, Systems Architecture & DBs.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Advanced Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory & Algorithms)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: '8 Questions on Algorithms, Data Structures & Logic' },
      { id: 'paper3', name: 'Paper 3 (Practical Software & Database Project)', type: 'Practical', totalMarks: 100, durationMinutes: 180, description: 'Software Development & SQL Database Implementation' },
    ]
  },
  {
    name: 'ICT',
    code: '0796',
    level: 'Advance level',
    category: 'Science',
    description: 'Applied Information & Communication Technology, Networks, & Web Systems.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Applied ICT Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Information Systems, Security & Network Architecture' },
      { id: 'paper3', name: 'Paper 3 (Practical Systems & Software)', type: 'Practical', totalMarks: 100, durationMinutes: 180, description: 'Web development, Spreadsheet modeling & Database design' },
    ]
  },
  {
    name: 'Mathematics',
    code: '0770',
    level: 'Advance level',
    category: 'Science',
    description: 'Advanced Pure Mathematics, Mechanics, Probability & Statistics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Pure Mathematics)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Advanced Calculus, Algebra, Complex Numbers & Vectors' },
      { id: 'paper2', name: 'Paper 2 (Applied Mathematics)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Mechanics, Kinematics, Dynamics & Probability' },
    ]
  },
  {
    name: 'Further Mathematics',
    code: '0775',
    level: 'Advance level',
    category: 'Science',
    description: 'Rigorous Pure Math, Differential Equations, Matrix Transformations & Numerical Methods.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Advanced Pure Math)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Group theory, Polar coordinates, Differential equations' },
      { id: 'paper2', name: 'Paper 2 (Mechanics & Statistics)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Rigid body dynamics and statistical distributions' },
    ]
  },
  {
    name: 'Physics',
    code: '0780',
    level: 'Advance level',
    category: 'Science',
    description: 'Classical Mechanics, Electromagnetism, Quantum Mechanics, Thermo & Nuclear Physics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Theory & Problem Solving)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Structured problems and theoretical derivations' },
      { id: 'paper3', name: 'Paper 3 (Practical Laboratory Examination)', type: 'Practical', totalMarks: 50, durationMinutes: 150, description: 'Advanced physics lab experiments' },
    ]
  },
  {
    name: 'Chemistry',
    code: '0715',
    level: 'Advance level',
    category: 'Science',
    description: 'Physical Chemistry, Inorganic Chemistry, and Organic Reactions & Mechanisms.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Organic, Physical & Inorganic Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Reaction mechanisms, thermodynamics & equilibrium' },
      { id: 'paper3', name: 'Paper 3 (Practical Qualitative & Quantitative Analysis)', type: 'Practical', totalMarks: 50, durationMinutes: 150, description: 'Titrations, qualitative salt analysis & kinetics' },
    ]
  },
  {
    name: 'Biology',
    code: '0710',
    level: 'Advance level',
    category: 'Science',
    description: 'Biochemistry, Molecular Biology, Genetics, Plant & Animal Physiology & Ecology.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Cellular, Genetic & Ecological Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Comprehensive biological theory and essays' },
      { id: 'paper3', name: 'Paper 3 (Practical Biological Investigation)', type: 'Practical', totalMarks: 50, durationMinutes: 150, description: 'Microscopy, enzyme experiments & dissections' },
    ]
  },

  // ==========================================
  // ADVANCED LEVEL (A-LEVEL) - ARTS & HUMANITIES
  // ==========================================
  {
    name: 'History',
    code: '0760',
    level: 'Advance level',
    category: 'Arts',
    description: 'Cameroon History since 1800, Modern World History, Revolutions & International Relations.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Cameroon History Since 1800)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'Colonial period, independence & reunification' },
      { id: 'paper2', name: 'Paper 2 (World & African History)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'African nationalism, World Wars & Cold War' },
      { id: 'paper3', name: 'Paper 3 (International Relations & Revolutions)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'UN, Commonwealth, AU & Global Revolutions' },
    ]
  },
  {
    name: 'Geography',
    code: '0750',
    level: 'Advance level',
    category: 'Arts',
    description: 'Advanced Geomorphology, Climatology, Human Geography & Regional Geography of Cameroon.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Physical Geography)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Geomorphology, Hydrology & Climatology' },
      { id: 'paper2', name: 'Paper 2 (Human Geography)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Population, Settlement & Economic Geography' },
      { id: 'paper3', name: 'Paper 3 (Regional Geography of Cameroon & Practical)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Cameroon spatial development & map analysis' },
    ]
  },
  {
    name: 'Economics',
    code: '0720',
    level: 'Advance level',
    category: 'Arts',
    description: 'Advanced Microeconomics, Macroeconomic Policy, International Finance & Development.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Micro & Macro Analysis)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Price mechanism, market structures & fiscal policy' },
      { id: 'paper3', name: 'Paper 3 (Economic Issues & Applied Policy)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Data response and policy evaluation' },
    ]
  },
  {
    name: 'English Literature',
    code: '0735',
    level: 'Advance level',
    category: 'Arts',
    description: 'Literary Criticism, Shakespeare, Modern Drama, World Poetry & Prose Fiction.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Drama & Shakespeare)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'Shakespearean plays and contemporary drama' },
      { id: 'paper2', name: 'Paper 2 (Poetry & Literary Theory)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'Prescribed poetry & critical analysis' },
      { id: 'paper3', name: 'Paper 3 (Prose Fiction & World Literature)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'African & International novels' },
    ]
  },
  {
    name: 'French',
    code: '0745',
    level: 'Advance level',
    category: 'Arts',
    description: 'Etude approfondie de la langue francaise, stylistique, litterature et civilisation.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Composition & Translation)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'Dissertation et traduction' },
      { id: 'paper2', name: 'Paper 2 (Literary Appreciation & Analysis)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'Analyse d’œuvres au programme' },
      { id: 'paper3', name: 'Paper 3 (Oral & Civilisation)', type: 'Practical', totalMarks: 50, durationMinutes: 120, description: 'Epreuve orale et culture generale' },
    ]
  },
  {
    name: 'Philosophy',
    code: '0785',
    level: 'Advance level',
    category: 'Arts',
    description: 'Western & African Philosophy, Symbolic Logic, Epistemology, and Ethics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (Western & African Philosophy)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'History of philosophical thought' },
      { id: 'paper2', name: 'Paper 2 (Logic & Epistemology)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Formal logic, truth tables & theory of knowledge' },
      { id: 'paper3', name: 'Paper 3 (Ethics & Political Philosophy)', type: 'Essay', totalMarks: 100, durationMinutes: 180, description: 'Moral philosophy, justice & political theory' },
    ]
  }
];

export async function seedDefaultGceSubjects(db: any): Promise<number> {
  try {
    const subjectsRef = collection(db, 'subjects');
    const existingSnap = await getDocs(subjectsRef);
    const existingNames = new Set(existingSnap.docs.map(doc => `${doc.data().name}_${doc.data().level}`));

    let addedCount = 0;
    const batch = writeBatch(db);

    for (const subjectData of DEFAULT_GCE_SUBJECTS) {
      const key = `${subjectData.name}_${subjectData.level}`;
      if (!existingNames.has(key)) {
        const docId = subjectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + (subjectData.level === 'Advance level' ? 'al' : 'ol');
        const docRef = doc(db, 'subjects', docId);
        batch.set(docRef, {
          ...subjectData,
          createdAt: serverTimestamp()
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await batch.commit();
    }

    return addedCount;
  } catch (error) {
    console.error('Error seeding GCE subjects:', error);
    throw error;
  }
}

export function getPapersForSubjectName(subjectName: string, level?: string, allSubjects: SubjectModel[] = []): PaperConfig[] {
  if (!subjectName) return [
    { id: 'paper1', name: 'Paper 1', type: 'MCQ' },
    { id: 'paper2', name: 'Paper 2', type: 'Theory' }
  ];

  // Look up in database subjects list
  const match = allSubjects.find(s => 
    s.name.toLowerCase().trim() === subjectName.toLowerCase().trim() &&
    (!level || s.level === level)
  );

  if (match && match.papers && match.papers.length > 0) {
    return match.papers;
  }

  // Fallback to default array matching
  const defaultMatch = DEFAULT_GCE_SUBJECTS.find(s => 
    s.name.toLowerCase().trim() === subjectName.toLowerCase().trim() &&
    (!level || s.level === level)
  );

  if (defaultMatch && defaultMatch.papers && defaultMatch.papers.length > 0) {
    return defaultMatch.papers;
  }

  // General fallback
  return [
    { id: 'paper1', name: 'Paper 1', type: 'MCQ' },
    { id: 'paper2', name: 'Paper 2', type: 'Theory' }
  ];
}
