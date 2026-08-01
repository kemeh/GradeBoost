import { SubjectModel, PaperConfig } from '../types';
import { collection, getDocs, doc, setDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { generateAllCommercialSubjectsSeed } from '../constants/commercialCurriculum';

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
  },
  // ==========================================
  // TECHNICAL EDUCATION SUBJECTS
  // ==========================================
  {
    name: 'Building Construction',
    code: '0810',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Foundation, masonry, concrete technology, structural framing, and construction safety.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Construction Theory & Details)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Building services, materials & structural principles' },
      { id: 'paper3', name: 'Paper 3 (Practical Building Drawing & Estimation)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Architectural details & quantity surveying' },
    ]
  },
  {
    name: 'Electrical Technology',
    code: '0820',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Circuit theory, electrical wiring, machines, transformers, and power distribution.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Electrical Principles & Machines)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'AC/DC circuits, motors & generators' },
      { id: 'paper3', name: 'Paper 3 (Electrical Practical & Wiring)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Domestic installation & diagnostic testing' },
    ]
  },
  {
    name: 'Electronics',
    code: '0825',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Semiconductor devices, amplifiers, digital logic circuits, and microcontrollers.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Analog & Digital Electronics)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Transistors, op-amps & logic gates' },
      { id: 'paper3', name: 'Paper 3 (Electronic Practical & Troubleshooting)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Breadboarding, circuit analysis & oscilloscope testing' },
    ]
  },
  {
    name: 'Mechanical Technology',
    code: '0830',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Applied mechanics, thermodynamics, machine elements, and workshop safety.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Mechanics & Machine Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Kinematics, fluid mechanics & thermodynamics' },
      { id: 'paper3', name: 'Paper 3 (Mechanical Workshop Practical)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Lathe operations, fitting & machining' },
    ]
  },
  {
    name: 'Metal Work',
    code: '0835',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Welding, casting, sheet metal work, forging, and metallurgy.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Metallurgy & Welding Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Metal properties, heat treatment & joining' },
      { id: 'paper3', name: 'Paper 3 (Practical Fabrication & Welding)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Arc/Gas welding & sheet metal fabrication' },
    ]
  },
  {
    name: 'Wood Work',
    code: '0840',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Carpentry, joinery, timber technology, furniture design, and woodworking machinery.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Timber & Joinery Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Wood science, joints & construction' },
      { id: 'paper3', name: 'Paper 3 (Carpentry & Woodwork Practical)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Joint cutting & furniture assembly' },
    ]
  },
  {
    name: 'Auto Mechanics',
    code: '0845',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Internal combustion engines, transmission systems, braking systems, and automotive electricity.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Automotive Theory & Systems)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Engine cycles, fuel injection & suspension' },
      { id: 'paper3', name: 'Paper 3 (Automotive Diagnostic Practical)', type: 'Practical', totalMarks: 50, durationMinutes: 180, description: 'Engine overhaul, tuning & fault diagnosis' },
    ]
  },
  {
    name: 'Applied Mathematics',
    code: '0850',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Calculus, vectors, differential equations, and numerical methods applied to engineering.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Applied Mathematical Analysis)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Engineering mathematics & statistics' },
    ]
  },
  {
    name: 'Technical Mathematics',
    code: '0855',
    level: 'Ordinary level',
    category: 'Technical Education',
    description: 'Practical algebra, trigonometry, and geometry for technical trades.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Technical Calculation & Problem Solving)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Shop floor math & construction geometry' },
    ]
  },

  // ==========================================
  // COMMERCIAL EDUCATION SUBJECTS
  // ==========================================
  {
    name: 'Accounting',
    code: '0910',
    level: 'Ordinary level',
    category: 'Commercial Education',
    description: 'Financial accounting, partnership accounts, company accounts, and cost accounting.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Financial & Cost Accounting)', type: 'Practical', totalMarks: 100, durationMinutes: 180, description: 'Ledgers, financial statements & cost sheets' },
    ]
  },
  {
    name: 'Office Practice',
    code: '0920',
    level: 'Ordinary level',
    category: 'Commercial Education',
    description: 'Secretarial duties, office equipment, communication, filing, and business administration.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Secretarial & Office Administration)', type: 'Theory', totalMarks: 100, durationMinutes: 150, description: 'Business correspondence & office management' },
    ]
  },
  {
    name: 'Business Mathematics',
    code: '0930',
    level: 'Ordinary level',
    category: 'Commercial Education',
    description: 'Percentages, interest, annuities, depreciation, payroll, and business statistics.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Commercial Arithmetic & Statistics)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Financial calculations and data analysis' },
    ]
  },
  {
    name: 'Entrepreneurship',
    code: '0940',
    level: 'Ordinary level',
    category: 'Commercial Education',
    description: 'Business plan development, venture creation, risk management, and SME leadership.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Venture Planning & Case Studies)', type: 'Essay', totalMarks: 100, durationMinutes: 150, description: 'Business plan creation and entrepreneurial analysis' },
    ]
  },
  {
    name: 'Marketing',
    code: '0950',
    level: 'Ordinary level',
    category: 'Commercial Education',
    description: 'Market research, consumer behavior, advertising, distribution channels, and sales management.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Marketing Strategy & Cases)', type: 'Essay', totalMarks: 100, durationMinutes: 150, description: 'Marketing mix, promotions & consumer analytics' },
    ]
  },
  {
    name: 'Financial Accounting',
    code: '0960',
    level: 'Advance level',
    category: 'Commercial Education',
    description: 'Advanced corporate accounting, auditing, taxation, and financial statement analysis.',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions' },
      { id: 'paper2', name: 'Paper 2 (Advanced Corporate Accounting)', type: 'Practical', totalMarks: 100, durationMinutes: 180, description: 'Company consolidation, ratio analysis & auditing' },
      { id: 'paper3', name: 'Paper 3 (Case Studies & Financial Analysis)', type: 'Structured', totalMarks: 100, durationMinutes: 150, description: 'Complex financial reporting scenarios' },
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

    const allCommercialSeed = generateAllCommercialSubjectsSeed();
    const combinedSubjects = [...DEFAULT_GCE_SUBJECTS, ...allCommercialSeed];

    for (const subjectData of combinedSubjects) {
      const key = `${subjectData.name}_${subjectData.level}`;
      if (!existingNames.has(key)) {
        const docId = subjectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + (subjectData.level === 'Advance level' ? 'al' : subjectData.level === 'Intermediate level' ? 'il' : 'ol');
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
