import { HNDSchool, HNDDepartment, HNDProgramme, HNDCourse, HNDLearningMaterial, HNDProject, HNDAssignment } from '../types/hnd';

export const DEFAULT_HND_SCHOOLS: HNDSchool[] = [
  {
    id: 'school_tech_eng',
    name: 'School of Technology & Engineering',
    nameFr: 'École de Technologie et d\'Ingénierie',
    code: 'STE',
    description: 'Computer systems, software engineering, electronics, telecommunications, civil and mechanical engineering trades.',
    descriptionFr: 'Systèmes informatiques, génie logiciel, électronique, télécoms, génie civil et mécanique.',
    icon: 'Cpu',
    isActive: true,
    order: 1
  },
  {
    id: 'school_business_mgmt',
    name: 'School of Business & Management Sciences',
    nameFr: 'École des Sciences Commerciales et de Gestion',
    code: 'SBMS',
    description: 'Accounting, corporate finance, banking, marketing, human resource management, and international trade.',
    descriptionFr: 'Comptabilité, finance d\'entreprise, banque, marketing, gestion des ressources humaines et commerce international.',
    icon: 'Briefcase',
    isActive: true,
    order: 2
  },
  {
    id: 'school_health_biomed',
    name: 'School of Health & Medical Sciences',
    nameFr: 'École des Sciences de la Santé et Médico-Sanitaires',
    code: 'SHMS',
    description: 'Nursing sciences, medical laboratory sciences, pharmacy technology, and public health.',
    descriptionFr: 'Sciences infirmières, analyses médicales, technologie pharmaceutique et santé publique.',
    icon: 'Activity',
    isActive: true,
    order: 3
  },
  {
    id: 'school_applied_sci',
    name: 'School of Agriculture & Environmental Sciences',
    nameFr: 'École d\'Agriculture et des Sciences Environnementales',
    code: 'SAES',
    description: 'Agro-pastoral production, food technology, environmental management, and sustainability.',
    descriptionFr: 'Production agro-pastorale, technologie alimentaire, gestion de l\'environnement et durabilité.',
    icon: 'Sprout',
    isActive: true,
    order: 4
  }
];

export const DEFAULT_HND_DEPARTMENTS: HNDDepartment[] = [
  // Technology
  {
    id: 'dept_computer_eng',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    name: 'Computer Engineering & Information Technology',
    nameFr: 'Génie Informatique & Technologies de l\'Information',
    code: 'CEIT',
    description: 'Software Engineering, Computer Science, Networks, Systems and Cybersecurity',
    isActive: true,
    order: 1
  },
  {
    id: 'dept_electrical_eng',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    name: 'Electrical, Electronic & Telecom Engineering',
    nameFr: 'Génie Électrique, Électronique et Télécommunications',
    code: 'EETE',
    description: 'Power Systems, Renewable Energy, Electronics and Telecommunication Networks',
    isActive: true,
    order: 2
  },
  {
    id: 'dept_civil_eng',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    name: 'Civil Engineering & Construction',
    nameFr: 'Génie Civil & Bâtiment',
    code: 'CEC',
    description: 'Structural Analysis, Surveying, Highway Engineering and Building Construction',
    isActive: true,
    order: 3
  },
  // Business
  {
    id: 'dept_accounting_finance',
    schoolId: 'school_business_mgmt',
    schoolName: 'School of Business & Management Sciences',
    name: 'Accountancy, Banking & Finance',
    nameFr: 'Comptabilité, Banque et Finance',
    code: 'ABF',
    description: 'Financial Accounting, Auditing, Corporate Finance, Taxation and Banking Operations',
    isActive: true,
    order: 4
  },
  {
    id: 'dept_management_marketing',
    schoolId: 'school_business_mgmt',
    schoolName: 'School of Business & Management Sciences',
    name: 'Management, Logistics & Marketing',
    nameFr: 'Gestion, Logistique et Marketing',
    code: 'MLM',
    description: 'Human Resources, Business Administration, Supply Chain Management and Digital Marketing',
    isActive: true,
    order: 5
  },
  // Health
  {
    id: 'dept_nursing_sciences',
    schoolId: 'school_health_biomed',
    schoolName: 'School of Health & Medical Sciences',
    name: 'Nursing & Clinical Care Sciences',
    nameFr: 'Sciences Infirmières et Soins Cliniques',
    code: 'NCS',
    description: 'General Nursing, Critical Care, Community Health, Pharmacology and Clinical Practice',
    isActive: true,
    order: 6
  },
  {
    id: 'dept_med_lab_sciences',
    schoolId: 'school_health_biomed',
    schoolName: 'School of Health & Medical Sciences',
    name: 'Medical Laboratory Sciences',
    nameFr: 'Sciences de Laboratoire Médical',
    code: 'MLS',
    description: 'Clinical Biochemistry, Microbiology, Hematology, Immunology and Histopathology',
    isActive: true,
    order: 7
  }
];

export const DEFAULT_HND_PROGRAMMES: HNDProgramme[] = [
  // 1. Software Engineering
  {
    id: 'prog_hnd_swe',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    departmentId: 'dept_computer_eng',
    departmentName: 'Computer Engineering & Information Technology',
    name: 'Software Engineering',
    nameFr: 'Génie Logiciel',
    code: 'SWE',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Comprehensive practical training in full-stack software development, web applications, databases, cloud architecture, system analysis, algorithms, and mobile development.',
    descriptionFr: 'Formation pratique complète en développement d\'applications web et mobiles, bases de données, architecture cloud et conception de systèmes.',
    admissionRequirements: 'GCE Advanced Level with at least 2 papers including Mathematics, Computer Science, or Physics; or TVEE / Baccalauréat C, D, TI, F.',
    careerProspects: ['Full-Stack Software Developer', 'Mobile App Engineer', 'DevOps & Cloud Specialist', 'Database Administrator', 'Systems Analyst'],
    isActive: true,
    order: 1
  },
  // 2. Computer Science & Information Systems
  {
    id: 'prog_hnd_cs',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    departmentId: 'dept_computer_eng',
    departmentName: 'Computer Engineering & Information Technology',
    name: 'Computer Science',
    nameFr: 'Informatique Générale',
    code: 'CS',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'In-depth foundation in computer architecture, systems programming, data structures, algorithms, information security, and enterprise database systems.',
    descriptionFr: 'Étude approfondie de l\'architecture des ordinateurs, programmation système, structures de données, algorithmes et sécurité informatique.',
    admissionRequirements: 'GCE Advanced Level in Science subjects (Maths, Physics, Chemistry, Computer Science) or equivalent Baccalauréat.',
    careerProspects: ['Systems Architect', 'Security Analyst', 'IT Infrastructure Specialist', 'Technical Consultant', 'Research Assistant'],
    isActive: true,
    order: 2
  },
  // 3. Networks & Telecommunications
  {
    id: 'prog_hnd_nwt',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    departmentId: 'dept_computer_eng',
    departmentName: 'Computer Engineering & Information Technology',
    name: 'Networks & Telecommunications',
    nameFr: 'Réseaux & Télécommunications',
    code: 'NWT',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Design, configuration, and maintenance of computer networks, routing, switching, wireless systems, cybersecurity, and telecommunication protocols.',
    descriptionFr: 'Conception et maintenance des réseaux informatiques, routage, commutation, systèmes sans fil et protocoles de télécommunication.',
    admissionRequirements: 'GCE A-Level or TVEE / Baccalauréat in Science or Technology.',
    careerProspects: ['Network Administrator', 'Telecom Engineer', 'Network Security Engineer', 'VoIP Specialist', 'Field Systems Support'],
    isActive: true,
    order: 3
  },
  // 4. Electrical Power Systems
  {
    id: 'prog_hnd_eps',
    schoolId: 'school_tech_eng',
    schoolName: 'School of Technology & Engineering',
    departmentId: 'dept_electrical_eng',
    departmentName: 'Electrical, Electronic & Telecom Engineering',
    name: 'Electrical Power Systems',
    nameFr: 'Électrotechnique & Réseaux Électriques',
    code: 'EPS',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Power generation, high and low voltage distribution, electric machines, renewable energy installations, industrial automation, and protection systems.',
    descriptionFr: 'Production et distribution d\'énergie électrique, machines électriques, énergies renouvelables et automatisme industriel.',
    admissionRequirements: 'GCE A-Level (Physics, Mathematics) or TVEE F3/F4 / Bac F3.',
    careerProspects: ['Electrical Power Engineer', 'Substation Technician', 'Renewable Energy Consultant', 'Industrial Automation Engineer'],
    isActive: true,
    order: 4
  },
  // 5. Accountancy
  {
    id: 'prog_hnd_acc',
    schoolId: 'school_business_mgmt',
    schoolName: 'School of Business & Management Sciences',
    departmentId: 'dept_accounting_finance',
    departmentName: 'Accountancy, Banking & Finance',
    name: 'Accountancy',
    nameFr: 'Comptabilité & Gestion des Entreprises',
    code: 'ACC',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Corporate financial accounting, cost and managerial accounting, auditing, OHADA financial reporting, taxation laws, and computerized accounting systems.',
    descriptionFr: 'Comptabilité financière, comptabilité analytique de gestion, audit, droit fiscal et système comptable OHADA.',
    admissionRequirements: 'GCE Advanced Level in Commercial or General Arts/Science subjects including Economics, Accounting or Mathematics, or Bac G2.',
    careerProspects: ['Corporate Accountant', 'Audit Associate', 'Tax Advisor', 'Cost Accountant', 'Financial Controller'],
    isActive: true,
    order: 5
  },
  // 6. Banking & Finance
  {
    id: 'prog_hnd_bnf',
    schoolId: 'school_business_mgmt',
    schoolName: 'School of Business & Management Sciences',
    departmentId: 'dept_accounting_finance',
    departmentName: 'Accountancy, Banking & Finance',
    name: 'Banking & Finance',
    nameFr: 'Banque et Finance',
    code: 'BNF',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Commercial banking operations, credit risk analysis, investment evaluation, microfinance management, money and capital markets, and financial regulations.',
    descriptionFr: 'Opérations bancaires, analyse de crédit, gestion de microfinance, marchés des capitaux et réglementation financière.',
    admissionRequirements: 'GCE Advanced Level with passes in Economics, Commerce, Mathematics or Accounting; or Baccalauréat G2, G3, SES.',
    careerProspects: ['Bank Operations Officer', 'Credit Risk Analyst', 'Microfinance Manager', 'Investment Advisor', 'Treasury Assistant'],
    isActive: true,
    order: 6
  },
  // 7. Marketing & Digital Business
  {
    id: 'prog_hnd_mkt',
    schoolId: 'school_business_mgmt',
    schoolName: 'School of Business & Management Sciences',
    departmentId: 'dept_management_marketing',
    departmentName: 'Management, Logistics & Marketing',
    name: 'Marketing',
    nameFr: 'Commerce International & Marketing',
    code: 'MKT',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Market research, consumer behavior, brand management, digital marketing, sales strategies, advertising, and international trade operations.',
    descriptionFr: 'Études de marché, comportement des consommateurs, marketing digital, stratégies de vente et commerce international.',
    admissionRequirements: 'GCE Advanced Level (2 passes) or Baccalauréat.',
    careerProspects: ['Marketing Executive', 'Brand Strategist', 'Digital Marketing Manager', 'Sales Representative', 'Market Research Analyst'],
    isActive: true,
    order: 7
  },
  // 8. Human Resource Management
  {
    id: 'prog_hnd_hrm',
    schoolId: 'school_business_mgmt',
    schoolName: 'School of Business & Management Sciences',
    departmentId: 'dept_management_marketing',
    departmentName: 'Management, Logistics & Marketing',
    name: 'Human Resource Management',
    nameFr: 'Gestion des Ressources Humaines',
    code: 'HRM',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Talent acquisition, employee relations, labor laws, compensation and benefits, training and development, and organizational behavior.',
    descriptionFr: 'Recrutement, relations avec les employés, droit du travail, rémunération et développement organisationnel.',
    admissionRequirements: 'GCE Advanced Level in any Arts, Science or Commercial subjects.',
    careerProspects: ['HR Officer', 'Recruitment Specialist', 'Training & Development Coordinator', 'Labor Relations Assistant'],
    isActive: true,
    order: 8
  },
  // 9. Nursing Sciences
  {
    id: 'prog_hnd_nrs',
    schoolId: 'school_health_biomed',
    schoolName: 'School of Health & Medical Sciences',
    departmentId: 'dept_nursing_sciences',
    departmentName: 'Nursing & Clinical Care Sciences',
    name: 'Nursing Sciences',
    nameFr: 'Sciences Infirmières',
    code: 'NRS',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Fundamental nursing practice, anatomy and physiology, pharmacology, medical-surgical nursing, maternal and child health, ethics, and clinical internship.',
    descriptionFr: 'Pratique infirmière fondamentale, anatomie, pharmacologie, soins médico-chirurgicaux, santé maternelle et infantile.',
    admissionRequirements: 'GCE Advanced Level with passes in Biology and Chemistry; or Baccalauréat D.',
    careerProspects: ['Staff Nurse', 'Clinical Nurse Specialist', 'Community Health Officer', 'Maternal & Child Health Caregiver'],
    isActive: true,
    order: 9
  },
  // 10. Medical Laboratory Sciences
  {
    id: 'prog_hnd_mls',
    schoolId: 'school_health_biomed',
    schoolName: 'School of Health & Medical Sciences',
    departmentId: 'dept_med_lab_sciences',
    departmentName: 'Medical Laboratory Sciences',
    name: 'Medical Laboratory Sciences',
    nameFr: 'Techniques de Laboratoire Médical',
    code: 'MLS',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: 'Diagnostic laboratory procedures, clinical hematology, medical microbiology, parasitology, clinical biochemistry, and quality control.',
    descriptionFr: 'Analyses biomédicales, hématologie, microbiologie, parasitologie clinique et biochimie médicale.',
    admissionRequirements: 'GCE A-Level in Biology and Chemistry or Baccalauréat D.',
    careerProspects: ['Medical Laboratory Technician', 'Biomedical Diagnostic Technologist', 'Research Lab Assistant', 'Phlebotomist'],
    isActive: true,
    order: 10
  }
];

export const DEFAULT_HND_COURSES: HNDCourse[] = [
  // ==========================================
  // SOFTWARE ENGINEERING - LEVEL 1 - SEMESTER 1
  // ==========================================
  {
    id: 'swe111_prog_c',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Structured Programming in C',
    nameFr: 'Programmation Structurée en C',
    code: 'SWE-111',
    level: 'HND Level 1',
    semester: 'Semester 1',
    creditValue: 4,
    description: 'Fundamental concepts of structured programming, pointers, memory allocation, algorithms, arrays, structures, and file I/O using C.',
    descriptionFr: 'Concepts fondamentaux de la programmation structurée, pointeurs, structures et fichiers en langage C.',
    lecturer: 'Dr. Nkemasong Roland',
    isPractical: true,
    syllabus: [
      'Introduction to C syntax, compilers, and variables',
      'Control flow: loops, conditions, and switch statements',
      'Functions, scope, and recursion',
      'Arrays, strings, and multi-dimensional matrices',
      'Pointers, memory addresses, and dynamic allocation (malloc/free)',
      'Structures, unions, and typedefs',
      'File handling and binary file streams',
      'Algorithmic problem solving and debugging techniques'
    ],
    papers: [
      { id: 'p1_mcq', name: 'Continuous Assessment Test (CAT)', type: 'MCQ', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_theory', name: 'End of Semester Written Exam', type: 'Theory', durationMinutes: 180, totalMarks: 70 },
      { id: 'p3_practical', name: 'Practical Programming Lab Exam', type: 'Practical', durationMinutes: 120, totalMarks: 50 }
    ],
    isActive: true,
    order: 1
  },
  {
    id: 'swe112_discrete_math',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Discrete Mathematics & Logic for Computer Science',
    nameFr: 'Mathématiques Discrètes et Logique',
    code: 'SWE-112',
    level: 'HND Level 1',
    semester: 'Semester 1',
    creditValue: 4,
    description: 'Propositional and predicate logic, set theory, functions, relations, combinatorics, graph theory, and mathematical induction.',
    descriptionFr: 'Logique propositionnelle, théorie des ensembles, combinatoire, théorie des graphes et récurrence.',
    lecturer: 'Prof. Eyong Armstrong',
    isPractical: false,
    syllabus: [
      'Propositional logic, truth tables, and equivalence laws',
      'Predicates and quantifiers',
      'Set operations, Venn diagrams, and power sets',
      'Relations, equivalence relations, and partial orders',
      'Combinatorics, permutations, and combinations',
      'Graph theory: trees, spanning trees, and paths',
      'Boolean algebra and logic gate simplification'
    ],
    papers: [
      { id: 'p1_cat', name: 'CAT 1 (Mid-Term)', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'End of Semester Examination', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 2
  },
  {
    id: 'swe113_web_dev_1',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Web Technologies & Design (HTML5, CSS3, JavaScript)',
    nameFr: 'Technologies et Design Web',
    code: 'SWE-113',
    level: 'HND Level 1',
    semester: 'Semester 1',
    creditValue: 3,
    description: 'Semantic HTML5, CSS Flexbox and Grid, modern JavaScript ES6+, DOM manipulation, responsive design principles, and UI wireframing.',
    descriptionFr: 'HTML5, CSS Flexbox & Grid, JavaScript moderne ES6+, manipulation du DOM et design responsive.',
    lecturer: 'Eng. Vanessa Tabe',
    isPractical: true,
    syllabus: [
      'HTML5 semantic structure and accessibility',
      'CSS3 styling, Flexbox, Grid, and media queries',
      'Modern JavaScript (ES6+), arrow functions, closures',
      'DOM events, manipulation, and local storage',
      'Asynchronous JS, Fetch API, and JSON handling',
      'Responsive web development and mobile layout patterns'
    ],
    papers: [
      { id: 'p1_cat', name: 'Continuous Assessment Project', type: 'Practical', durationMinutes: 90, totalMarks: 40 },
      { id: 'p2_final', name: 'End of Semester Examination', type: 'Theory', durationMinutes: 150, totalMarks: 60 }
    ],
    isActive: true,
    order: 3
  },
  {
    id: 'swe114_comp_arch',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Computer Architecture & Digital Logic',
    nameFr: 'Architecture des Ordinateurs et Logique Numérique',
    code: 'SWE-114',
    level: 'HND Level 1',
    semester: 'Semester 1',
    creditValue: 3,
    description: 'Digital electronics, number systems, arithmetic logic units (ALU), CPU registers, memory hierarchies, cache, and instruction sets.',
    descriptionFr: 'Systèmes de numération, ALU, registres processeur, hiérarchie mémoire et jeu d\'instructions.',
    lecturer: 'Eng. Foncha Brian',
    isPractical: false,
    syllabus: [
      'Binary, Octal, Hexadecimal and two\'s complement arithmetic',
      'Logic gates, Karnaugh maps, and circuit design',
      'Multiplexers, decoders, and flip-flops',
      'CPU architecture: von Neumann and Harvard models',
      'Cache memory, RAM, virtual memory, and bus systems'
    ],
    papers: [
      { id: 'p1_cat', name: 'CAT 1', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'Final Exam', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 4
  },

  // ==========================================
  // SOFTWARE ENGINEERING - LEVEL 1 - SEMESTER 2
  // ==========================================
  {
    id: 'swe121_oop_java',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Object-Oriented Programming with Java',
    nameFr: 'Programmation Orientée Objet avec Java',
    code: 'SWE-121',
    level: 'HND Level 1',
    semester: 'Semester 2',
    creditValue: 4,
    description: 'Classes, objects, inheritance, polymorphism, encapsulation, exception handling, Java Collections framework, and GUI design with Swing/JavaFX.',
    descriptionFr: 'Classes, objets, héritage, polymorphisme, gestion des exceptions et interface graphique Java.',
    lecturer: 'Dr. Nkemasong Roland',
    isPractical: true,
    syllabus: [
      'OOP fundamentals: Class, Object, Constructor',
      'Encapsulation and access modifiers',
      'Inheritance and method overriding',
      'Interfaces and Abstract Classes',
      'Polymorphism and Dynamic Method Dispatch',
      'Exception Handling (try-catch-finally, custom exceptions)',
      'Java Collections Framework (List, Set, Map)',
      'File I/O and serialization in Java'
    ],
    papers: [
      { id: 'p1_cat', name: 'CAT 1 (Theory & Coding)', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'End of Semester Written Exam', type: 'Theory', durationMinutes: 180, totalMarks: 70 },
      { id: 'p3_practical', name: 'Java Programming Practical Exam', type: 'Practical', durationMinutes: 120, totalMarks: 50 }
    ],
    isActive: true,
    order: 5
  },
  {
    id: 'swe122_dbms',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Database Management Systems (SQL & Relational Design)',
    nameFr: 'Systèmes de Gestion de Bases de Données (SGBD)',
    code: 'SWE-122',
    level: 'HND Level 1',
    semester: 'Semester 2',
    creditValue: 4,
    description: 'Relational model, Entity-Relationship (ER) modeling, normalization (1NF-3NF, BCNF), complex SQL queries, triggers, stored procedures, and transactions.',
    descriptionFr: 'Modélisation Entité-Association, normalisation, requêtes SQL complexes, transactions et triggers.',
    lecturer: 'Eng. Vanessa Tabe',
    isPractical: true,
    syllabus: [
      'Database concepts and 3-schema architecture',
      'Entity-Relationship (ER) & Enhanced ER diagrams',
      'Relational algebra and calculus',
      'SQL DDL, DML, DCL, and TCL commands',
      'Complex joins, subqueries, and aggregate functions',
      'Functional dependencies and normalization (1NF, 2NF, 3NF, BCNF)',
      'Indexing, transactions, ACID properties, and locks',
      'Stored procedures, triggers, and views in MySQL/PostgreSQL'
    ],
    papers: [
      { id: 'p1_cat', name: 'Continuous Assessment Test', type: 'MCQ', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'End of Semester Examination', type: 'Theory', durationMinutes: 180, totalMarks: 70 },
      { id: 'p3_lab', name: 'SQL Lab Exam', type: 'Practical', durationMinutes: 90, totalMarks: 40 }
    ],
    isActive: true,
    order: 6
  },
  {
    id: 'swe123_data_structures',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Data Structures & Algorithms',
    nameFr: 'Structures de Données et Algorithmes',
    code: 'SWE-123',
    level: 'HND Level 1',
    semester: 'Semester 2',
    creditValue: 4,
    description: 'Stacks, queues, linked lists, binary search trees, hash tables, sorting algorithms, graph algorithms, and asymptotic complexity (Big-O analysis).',
    descriptionFr: 'Piles, files, listes chaînées, arbres binaires, tables de hachage, tris et complexité algorithmique.',
    lecturer: 'Prof. Eyong Armstrong',
    isPractical: true,
    syllabus: [
      'Big-O, Big-Theta, and Big-Omega asymptotic notation',
      'Singly, doubly, and circular linked lists',
      'Stacks and Queues: array vs linked representations',
      'Recursion and divide-and-conquer algorithms',
      'Sorting: Quicksort, Mergesort, Heapsort, Radix sort',
      'Searching: Binary search and Hash tables with collision resolution',
      'Binary Search Trees (BST), AVL trees, and traversals',
      'Graph algorithms: BFS, DFS, Dijkstra\'s shortest path'
    ],
    papers: [
      { id: 'p1_cat', name: 'Mid-Semester CAT', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'End of Semester Written Exam', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 7
  },

  // ==========================================
  // SOFTWARE ENGINEERING - LEVEL 2 - SEMESTER 1
  // ==========================================
  {
    id: 'swe211_software_arch',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Software Analysis & Design (UML & Design Patterns)',
    nameFr: 'Analyse et Conception Logicielle (UML)',
    code: 'SWE-211',
    level: 'HND Level 2',
    semester: 'Semester 1',
    creditValue: 4,
    description: 'Software Development Life Cycle (SDLC), Agile and Scrum methodologies, UML 2.0 diagrams (Use Case, Class, Sequence, Activity), and GoF Design Patterns.',
    descriptionFr: 'Cycle de vie logiciel, méthodes agiles/Scrum, modélisation UML 2.0 et patrons de conception (Design Patterns).',
    lecturer: 'Dr. Nkemasong Roland',
    isPractical: true,
    syllabus: [
      'SDLC models: Waterfall, Spiral, Agile, Scrum, Kanban',
      'Requirements engineering, functional and non-functional specs',
      'UML Structural diagrams: Class, Object, Component, Deployment',
      'UML Behavioral diagrams: Use Case, Sequence, Activity, State',
      'Creational Design Patterns: Singleton, Factory, Builder',
      'Structural Design Patterns: Adapter, Decorator, Facade',
      'Behavioral Design Patterns: Observer, Strategy, MVC',
      'Software metrics, refactoring, and code smell detection'
    ],
    papers: [
      { id: 'p1_cat', name: 'CAT 1 (UML Case Study)', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'National Examination Paper (Theory)', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 8
  },
  {
    id: 'swe212_mobile_app',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Mobile Application Development (React Native & Android)',
    nameFr: 'Développement d\'Applications Mobiles',
    code: 'SWE-212',
    level: 'HND Level 2',
    semester: 'Semester 1',
    creditValue: 4,
    description: 'Cross-platform mobile development, native components, state management, REST API integration, offline storage, push notifications, and device sensors.',
    descriptionFr: 'Développement mobile multiplateforme, composants natifs, gestion d\'état et intégration d\'API REST.',
    lecturer: 'Eng. Vanessa Tabe',
    isPractical: true,
    syllabus: [
      'Mobile OS ecosystems and mobile UI/UX guidelines',
      'React Native / Flutter architectural overview',
      'Component lifecycle, Hooks, and State Management (Redux/Zustand)',
      'Navigation stacks, tabs, and drawer routers',
      'REST API consumption and async token authentication',
      'Local persistence with SQLite and Async Storage',
      'Hardware integration: Camera, Geolocation, and Push Notifications'
    ],
    papers: [
      { id: 'p1_cat', name: 'Mobile App Project Defense', type: 'Practical', durationMinutes: 90, totalMarks: 40 },
      { id: 'p2_final', name: 'End of Semester Written Exam', type: 'Theory', durationMinutes: 150, totalMarks: 60 }
    ],
    isActive: true,
    order: 9
  },
  {
    id: 'swe213_cloud_devops',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Cloud Computing, DevOps & CI/CD Pipelines',
    nameFr: 'Cloud Computing & DevOps',
    code: 'SWE-213',
    level: 'HND Level 2',
    semester: 'Semester 1',
    creditValue: 3,
    description: 'Docker containerization, Git version control workflows, automated CI/CD pipelines, cloud deployment (AWS/GCP), microservices, and serverless architectures.',
    descriptionFr: 'Conteneurisation Docker, pipelines CI/CD, déploiement cloud et architectures microservices.',
    lecturer: 'Eng. Foncha Brian',
    isPractical: true,
    syllabus: [
      'Cloud service models: IaaS, PaaS, SaaS, and Serverless',
      'Git branching strategies: GitFlow, Trunk-based development',
      'Docker containers, Dockerfiles, and Docker Compose',
      'CI/CD concepts with GitHub Actions and GitLab CI',
      'Cloud storage, SQL/NoSQL databases, and serverless functions',
      'Monitoring, logging, and security best practices in the cloud'
    ],
    papers: [
      { id: 'p1_cat', name: 'DevOps Lab Practical', type: 'Practical', durationMinutes: 90, totalMarks: 40 },
      { id: 'p2_final', name: 'Final Examination', type: 'Theory', durationMinutes: 150, totalMarks: 60 }
    ],
    isActive: true,
    order: 10
  },

  // ==========================================
  // SOFTWARE ENGINEERING - LEVEL 2 - SEMESTER 2
  // ==========================================
  {
    id: 'swe221_cybersecurity',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'Information Systems Security & Ethical Hacking',
    nameFr: 'Sécurité des Systèmes d\'Information',
    code: 'SWE-221',
    level: 'HND Level 2',
    semester: 'Semester 2',
    creditValue: 3,
    description: 'Cryptography, symmetric and asymmetric encryption, OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF), authentication protocols (OAuth 2.0, JWT), and penetration testing.',
    descriptionFr: 'Cryptographie, vulnérabilités OWASP Top 10, protocoles d\'authentification et tests d\'intrusion.',
    lecturer: 'Prof. Eyong Armstrong',
    isPractical: true,
    syllabus: [
      'Information security principles: CIA Triad and threat modeling',
      'Cryptography: RSA, AES, SHA hashing, and digital certificates',
      'Web security: SQL Injection, XSS, CSRF, and CORS policies',
      'Authentication & Authorization: JWT, OAuth 2.0, and RBAC',
      'Network scanning and vulnerability assessment tools (Nmap, Wireshark)',
      'Secure coding standards and penetration testing methodologies'
    ],
    papers: [
      { id: 'p1_cat', name: 'Security Audit CAT', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'National Examination Paper (Theory)', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 11
  },
  {
    id: 'swe222_capstone_project',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    programmeCode: 'SWE',
    name: 'HND Capstone Project & Internship Defense',
    nameFr: 'Projet de Fin d\'Études HND et Rapport de Stage',
    code: 'SWE-222',
    level: 'HND Level 2',
    semester: 'Semester 2',
    creditValue: 6,
    description: 'Full-cycle enterprise software development capstone project, industrial internship reporting, technical dissertation, and oral defense before a jury of examiners.',
    descriptionFr: 'Projet complet d\'ingénierie logicielle, rapport de stage en entreprise et soutenance devant jury.',
    lecturer: 'Academic Supervisory Board',
    isPractical: true,
    syllabus: [
      'Problem definition, market analysis, and project proposal',
      'Architectural blueprint, system design, and database schema',
      'Implementation, automated testing, and deployment to production',
      'Industrial internship experience and workflow integration',
      'Dissertation drafting according to MINESUP HND guidelines',
      'Slide deck preparation and defense presentation rehearsal'
    ],
    papers: [
      { id: 'p1_dissertation', name: 'Project Technical Dissertation (Documentation)', type: 'Essay', durationMinutes: 0, totalMarks: 50 },
      { id: 'p2_defense', name: 'Oral Defense before National Jury', type: 'Practical', durationMinutes: 45, totalMarks: 50 }
    ],
    isActive: true,
    order: 12
  },

  // ==========================================
  // ACCOUNTANCY - LEVEL 1 & 2 HIGHLIGHTS
  // ==========================================
  {
    id: 'acc111_fin_accounting',
    programmeId: 'prog_hnd_acc',
    programmeName: 'Accountancy',
    programmeCode: 'ACC',
    name: 'Financial Accounting I (SYSCOHADA Standards)',
    nameFr: 'Comptabilité Générale I (SYSCOHADA)',
    code: 'ACC-111',
    level: 'HND Level 1',
    semester: 'Semester 1',
    creditValue: 4,
    description: 'Principles of double-entry bookkeeping, journal entries, ledger posting, trial balance, adjustments, and financial statements preparation under SYSCOHADA Revised.',
    descriptionFr: 'Comptabilité en partie double, journal, grand livre, balance et états financiers selon le SYSCOHADA Révisé.',
    lecturer: 'Mr. Bih Richard',
    isPractical: true,
    syllabus: [
      'Introduction to accounting and the SYSCOHADA chart of accounts',
      'Recording sales, purchases, discounts, and VAT entries',
      'Cash and bank reconciliations',
      'Depreciation and amortization calculations and entries',
      'Provisions and impairment of assets',
      'Preparation of Balance Sheet and Income Statement (Compte de Résultat)'
    ],
    papers: [
      { id: 'p1_cat', name: 'CAT 1 (Calculations & Entries)', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'End of Semester Written Exam', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 1
  },
  {
    id: 'acc121_cost_accounting',
    programmeId: 'prog_hnd_acc',
    programmeName: 'Accountancy',
    programmeCode: 'ACC',
    name: 'Cost & Management Accounting',
    nameFr: 'Comptabilité Analytique de Gestion',
    code: 'ACC-121',
    level: 'HND Level 1',
    semester: 'Semester 2',
    creditValue: 4,
    description: 'Cost classification, inventory valuation (FIFO, Weighted Average), job costing, process costing, cost-volume-profit analysis, and budgetary control.',
    descriptionFr: 'Classification des coûts, valorisation des stocks, seuil de rentabilité et contrôle budgétaire.',
    lecturer: 'Mr. Bih Richard',
    isPractical: true,
    syllabus: [
      'Direct and indirect costs classification',
      'Material inventory valuation methods (FIFO, LIFO, Weighted Average)',
      'Labor cost accounting and overtime computations',
      'Overhead cost allocation, apportionment, and absorption',
      'Marginal costing and break-even point analysis',
      'Variance analysis and standard costing systems'
    ],
    papers: [
      { id: 'p1_cat', name: 'Continuous Assessment Test', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'End of Semester Examination', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 2
  },
  {
    id: 'acc211_corporate_tax',
    programmeId: 'prog_hnd_acc',
    programmeName: 'Accountancy',
    programmeCode: 'ACC',
    name: 'Corporate Taxation & Fiscal Law',
    nameFr: 'Fiscalité des Entreprises & Droit Fiscal',
    code: 'ACC-211',
    level: 'HND Level 2',
    semester: 'Semester 1',
    creditValue: 4,
    description: 'Cameroon General Tax Code, Company Income Tax (IS), Personal Income Tax (IRPP), Value Added Tax (TVA), tax returns filing, and fiscal audits.',
    descriptionFr: 'Code Général des Impôts du Cameroun, impôt sur les sociétés, TVA et contentieux fiscal.',
    lecturer: 'Mme. Essomba Claire',
    isPractical: false,
    syllabus: [
      'Overview of the Cameroon tax system and tax regimes (CGI)',
      'Value Added Tax (TVA) assessment, deductions, and declarations',
      'Company Income Tax (Impôt sur les Sociétés - IS) computation',
      'Personal Income Tax (IRPP) and salary withholding taxes',
      'Tax audits, penalties, and dispute resolution mechanisms'
    ],
    papers: [
      { id: 'p1_cat', name: 'Mid-Semester Tax Case Study', type: 'Structured', durationMinutes: 60, totalMarks: 30 },
      { id: 'p2_final', name: 'National HND Examination Paper', type: 'Theory', durationMinutes: 180, totalMarks: 70 }
    ],
    isActive: true,
    order: 3
  }
];

export const DEFAULT_HND_LEARNING_MATERIALS: HNDLearningMaterial[] = [
  {
    id: 'mat_c_prog_guide',
    courseId: 'swe111_prog_c',
    courseName: 'Structured Programming in C',
    courseCode: 'SWE-111',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    level: 'HND Level 1',
    semester: 'Semester 1',
    title: 'Comprehensive C Programming & Memory Pointers Lecture Notes',
    titleFr: 'Guide Complet de Programmation C et Pointeurs Mémoire',
    type: 'Lecture Notes',
    fileUrl: 'https://edulpha.edu/materials/hnd-swe111-complete-guide.pdf',
    fileSize: '4.8 MB',
    fileName: 'HND_SWE111_Lecture_Notes.pdf',
    description: 'Detailed lecture notes covering memory allocation, pointer arithmetic, linked lists in C, and past examination worked examples.',
    authorOrLecturer: 'Dr. Nkemasong Roland',
    academicYear: '2025/2026',
    isPublished: true
  },
  {
    id: 'mat_dbms_sql_cheatsheet',
    courseId: 'swe122_dbms',
    courseName: 'Database Management Systems',
    courseCode: 'SWE-122',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    level: 'HND Level 1',
    semester: 'Semester 2',
    title: 'SQL Normalization & Complex Queries Master Cheatsheet',
    titleFr: 'Fiche Synthèse SQL, Normalisation & Requêtes Complexes',
    type: 'Study Guide',
    fileUrl: 'https://edulpha.edu/materials/hnd-swe122-dbms-sql-guide.pdf',
    fileSize: '3.2 MB',
    fileName: 'HND_DBMS_SQL_MasterGuide.pdf',
    description: 'Step-by-step normalization examples up to BCNF, stored procedures, joins, and indexing benchmarks.',
    authorOrLecturer: 'Eng. Vanessa Tabe',
    academicYear: '2025/2026',
    isPublished: true
  },
  {
    id: 'mat_uml_patterns',
    courseId: 'swe211_software_arch',
    courseName: 'Software Analysis & Design',
    courseCode: 'SWE-211',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    level: 'HND Level 2',
    semester: 'Semester 1',
    title: 'UML 2.0 Design Patterns & Software Architecture Manual',
    titleFr: 'Manuel de Conception UML 2.0 & Patrons de Conception',
    type: 'Slides / PDF',
    fileUrl: 'https://edulpha.edu/materials/hnd-swe211-uml-patterns.pdf',
    fileSize: '6.1 MB',
    fileName: 'HND_SWE211_UML_Architecture.pdf',
    description: 'Case studies for banking and hospital systems with full sequence and class diagram blueprints.',
    authorOrLecturer: 'Dr. Nkemasong Roland',
    academicYear: '2025/2026',
    isPublished: true
  },
  {
    id: 'mat_acc_syscohada',
    courseId: 'acc111_fin_accounting',
    courseName: 'Financial Accounting I',
    courseCode: 'ACC-111',
    programmeId: 'prog_hnd_acc',
    programmeName: 'Accountancy',
    level: 'HND Level 1',
    semester: 'Semester 1',
    title: 'SYSCOHADA Revised Complete Financial Statements Guide',
    titleFr: 'Guide des États Financiers selon le SYSCOHADA Révisé',
    type: 'Revision Sheet',
    fileUrl: 'https://edulpha.edu/materials/hnd-acc111-syscohada.pdf',
    fileSize: '5.4 MB',
    fileName: 'SYSCOHADA_Revised_Financial_Accounting.pdf',
    description: 'Official journal entry conventions, balance sheet formatting, and VAT reconciliation templates.',
    authorOrLecturer: 'Mr. Bih Richard',
    academicYear: '2025/2026',
    isPublished: true
  }
];

export const DEFAULT_HND_PROJECTS: HNDProject[] = [
  {
    id: 'proj_swe_telemedicine',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    level: 'HND Level 2',
    academicYear: '2025/2026',
    title: 'Design and Implementation of an Offline-First Telemedicine & E-Prescription System for Rural Clinics',
    abstract: 'This research project develops a progressive web and mobile application utilizing local SQLite synchronization and WebRTC audio consultations to connect patients in remote sub-divisional health centers with specialized physicians in urban tertiary hospitals.',
    authorName: 'Tanyi Junior Kingsley',
    supervisorName: 'Dr. Nkemasong Roland',
    keywords: ['Telemedicine', 'Offline-First', 'WebRTC', 'React Native', 'Healthcare'],
    status: 'approved',
    methodology: 'Agile Scrum lifecycle with biometric security authentication and HIPAA-compliant data encryption.',
    chapters: [
      { number: 1, title: 'Introduction & Problem Statement', description: 'Background of healthcare access disparities in rural sub-divisions.' },
      { number: 2, title: 'Literature Review & Comparative Analysis', description: 'Survey of telemedicine protocols and offline synchronization algorithms.' },
      { number: 3, title: 'System Analysis & Architectural Design', description: 'UML class diagrams, REST API specs, and database ERD.' },
      { number: 4, title: 'System Implementation & Testing', description: 'Frontend, backend services, unit tests, and usability metrics.' },
      { number: 5, title: 'Conclusion, Limitations & Recommendations', description: 'Deployment roadmap and future scale recommendations.' }
    ]
  },
  {
    id: 'proj_swe_microfinance',
    programmeId: 'prog_hnd_swe',
    programmeName: 'Software Engineering',
    level: 'HND Level 2',
    academicYear: '2025/2026',
    title: 'Automated Loan Credit Scoring & Mobile Money Repayment Engine for Microfinance Institutions',
    abstract: 'Development of an intelligent underwriting engine that integrates MTN MoMo and Orange Money APIs with machine learning risk evaluation to reduce non-performing loans in category 2 microfinance institutions.',
    authorName: 'Mbiydzenyuy Kelly',
    supervisorName: 'Prof. Eyong Armstrong',
    keywords: ['Credit Scoring', 'Mobile Money', 'Fintech', 'Microfinance', 'API'],
    status: 'featured',
    methodology: 'Iterative prototyping with sandbox payment gateway testing and algorithmic risk weighting.'
  },
  {
    id: 'proj_acc_tax_compliance',
    programmeId: 'prog_hnd_acc',
    programmeName: 'Accountancy',
    level: 'HND Level 2',
    academicYear: '2025/2026',
    title: 'The Impact of Digital Tax Filing Systems on SME Compliance in the Littoral Region of Cameroon',
    abstract: 'Empirical assessment of the Directorate General of Taxation (DGI) tele-declaration portal on small and medium enterprises tax yield, reporting errors, and compliance latency.',
    authorName: 'Ndongmo Brenda',
    supervisorName: 'Mme. Essomba Claire',
    keywords: ['Taxation', 'SMEs', 'Tele-declaration', 'Compliance', 'SYSCOHADA'],
    status: 'approved',
    methodology: 'Quantitative survey across 120 registered SMEs in Douala and structured interviews with tax inspectors.'
  }
];
