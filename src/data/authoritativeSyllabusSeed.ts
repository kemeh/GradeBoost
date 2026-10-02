/**
 * Edulpha Authoritative Cameroon GCE, TVEE & Commercial Syllabus Knowledge Base
 * Pre-seeded curriculum for General, Technical, and Commercial streams.
 */

import { AcademicStream, AcademicLevel, SyllabusSubject, SyllabusModule, SyllabusTopicModel } from '../types/academicSyllabus';

export const SEEDED_ACADEMIC_STREAMS: AcademicStream[] = [
  {
    id: 'general',
    name: 'General Education',
    nameFr: 'Enseignement Général',
    code: 'GEN',
    description: 'Cameroon GCE Board Ordinary and Advanced Level Science, Arts, and Humanities streams.',
    descriptionFr: 'Enseignement secondaire général menant au BEPC, GCE O-Level, Probatoire et Baccalauréat / GCE A-Level.',
    icon: 'GraduationCap',
    isActive: true,
    order: 1
  },
  {
    id: 'technical',
    name: 'Technical Education (TVEE Industrial)',
    nameFr: 'Enseignement Technique & Industriel',
    code: 'TECH',
    description: 'Industrial specialties: Electrical Power Systems, Telecommunications, Software & Maintenance, Civil & Mechanical trades.',
    descriptionFr: 'Filières industrielles et technologiques du GCE TVEE et de l\'enseignement technique MINESEC.',
    icon: 'Cpu',
    isActive: true,
    order: 2
  },
  {
    id: 'commercial',
    name: 'Commercial Education (TVEE Commercial)',
    nameFr: 'Enseignement Commercial & Gestion',
    code: 'COMM',
    description: 'Business, Accounting (ACC), Marketing (MKT), Secretarial (SAC), and Home Economics (HEC).',
    descriptionFr: 'Séries tertiaires, comptabilité, gestion commerciale et administration des organisations.',
    icon: 'Briefcase',
    isActive: true,
    order: 3
  }
];

export const SEEDED_ACADEMIC_LEVELS: AcademicLevel[] = [
  {
    id: 'ordinary_level',
    streamId: 'general',
    name: 'Ordinary Level',
    nameFr: 'Premier Cycle (Form 1 - Form 5 / BEPC)',
    code: 'O-Level',
    description: 'Cameroon GCE Ordinary Level examination standard (Paper 1 & Paper 2).',
    order: 1,
    isActive: true
  },
  {
    id: 'advanced_level',
    streamId: 'general',
    name: 'Advanced Level',
    nameFr: 'Second Cycle (Lower & Upper Sixth / Baccalauréat)',
    code: 'A-Level',
    description: 'Cameroon GCE Advanced Level examination standard (Paper 1, Paper 2 & Paper 3 where applicable).',
    order: 2,
    isActive: true
  },
  {
    id: 'intermediate_tvee',
    streamId: 'technical',
    name: 'Intermediate Level (TVEE)',
    nameFr: 'Niveau Intermédiaire Technique',
    code: 'TVEE-IL',
    description: 'Cameroon GCE TVEE Intermediate vocational & trade certification.',
    order: 3,
    isActive: true
  },
  {
    id: 'advanced_tvee',
    streamId: 'technical',
    name: 'Advanced Level (TVEE)',
    nameFr: 'Niveau Avancé Technique (TVEE-AL)',
    code: 'TVEE-AL',
    description: 'Cameroon GCE Board TVEE Advanced Level technical and industrial qualifications.',
    order: 4,
    isActive: true
  },
  {
    id: 'acc',
    streamId: 'commercial',
    name: 'Accounting (ACC)',
    nameFr: 'Comptabilité (ACC)',
    code: 'ACC',
    description: 'Financial accounting, cost accounting, double-entry systems, and financial statements.',
    order: 5,
    isActive: true
  },
  {
    id: 'hec',
    streamId: 'commercial',
    name: 'Home Economics (HEC)',
    nameFr: 'Économie Sociale et Familiale (HEC)',
    code: 'HEC',
    description: 'Food & Nutrition, clothing & textiles, and home management.',
    order: 6,
    isActive: true
  },
  {
    id: 'mkt',
    streamId: 'commercial',
    name: 'Marketing (MKT)',
    nameFr: 'Action Commerciale & Marketing (MKT)',
    code: 'MKT',
    description: 'Commercial action, sales, advertising, market studies, and consumer behavior.',
    order: 7,
    isActive: true
  },
  {
    id: 'sac',
    streamId: 'commercial',
    name: 'Secretarial Administration (SAC)',
    nameFr: 'Sécrétariat et Bureautique (SAC)',
    code: 'SAC',
    description: 'Information processing, office systems, communications, and secretarial practice.',
    order: 8,
    isActive: true
  },
  {
    id: 'tims',
    streamId: 'commercial',
    name: 'Travel, Industry & Tourism (TIMS)',
    nameFr: 'Tourisme et Gestion Hôtelière (TIMS)',
    code: 'TIMS',
    description: 'Tourism industry, ticketing, hospitality, travel planning, and transport.',
    order: 9,
    isActive: true
  }
];

export const SEEDED_SYLLABUS_SUBJECTS: SyllabusSubject[] = [
  // General Advanced Level
  {
    id: 'gen_al_cs',
    name: 'Computer Science',
    nameFr: 'Informatique (A-Level)',
    code: '795',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'Computer systems, architecture, algorithms, object-oriented programming, database systems, data structures, and networks.',
    descriptionFr: 'Architecture des ordinateurs, algorithmique, programmation, bases de données et réseaux.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 1
  },
  {
    id: 'gen_al_maths',
    name: 'Mathematics with Pure & Applied',
    nameFr: 'Mathématiques Générales (A-Level)',
    code: '775',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'Pure Mathematics (Calculus, Algebra, Coordinate Geometry), Mechanics, and Probability & Statistics.',
    descriptionFr: 'Analyse, algèbre, mécanique rationnelle, probabilités et statistique.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 2
  },
  {
    id: 'gen_al_physics',
    name: 'Physics',
    nameFr: 'Physique (A-Level)',
    code: '780',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'Mechanics, Gravitation, Oscillations & Waves, Thermal Physics, Electricity & Magnetism, and Nuclear Physics.',
    descriptionFr: 'Mécanique, ondes, thermodynamique, électromagnétisme et physique atomique.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 3
  },
  {
    id: 'gen_al_chem',
    name: 'Chemistry',
    nameFr: 'Chimie (A-Level)',
    code: '715',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'Physical Chemistry (Equilibria, Kinetics, Energetics), Inorganic Chemistry (Periodicity), and Organic Reaction Mechanisms.',
    descriptionFr: 'Chimie physique, chimie inorganique descriptive et mécanismes réactionnels organiques.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 4
  },
  {
    id: 'gen_al_bio',
    name: 'Biology',
    nameFr: 'Biologie (A-Level)',
    code: '710',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'Cell biology, biochemistry, genetics, evolution, mammalian physiology, plant physiology, and ecology.',
    descriptionFr: 'Biologie cellulaire, biochimie, génétique, physiologie et écologie.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 5
  },
  {
    id: 'gen_al_ict',
    name: 'Information & Communication Technology (ICT)',
    nameFr: 'TIC (A-Level)',
    code: '796',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'ICT in society, information systems development, multimedia, database applications, and practical computing.',
    descriptionFr: 'Systèmes d\'information, outils multimédias, bases de données et impact sociétal des TIC.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 6
  },
  {
    id: 'gen_al_econ',
    name: 'Economics',
    nameFr: 'Économie (A-Level)',
    code: '725',
    streamId: 'general',
    levelId: 'advanced_level',
    language: 'en',
    description: 'Microeconomics (Price theory, Market structures) and Macroeconomics (National income, Monetary policy, International trade).',
    descriptionFr: 'Microéconomie, marchés, macroéconomie, politique monétaire et commerce international.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 7
  },

  // General Ordinary Level
  {
    id: 'gen_ol_cs',
    name: 'Computer Science (O-Level)',
    nameFr: 'Informatique (O-Level)',
    code: '595',
    streamId: 'general',
    levelId: 'ordinary_level',
    language: 'en',
    description: 'Computer fundamentals, binary representation, algorithms, flowcharts, basic programming, databases, and digital ethics.',
    descriptionFr: 'Fondamentaux de l\'informatique, codage binaire, algorithmes simples et sécurité numérique.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 8
  },
  {
    id: 'gen_ol_maths',
    name: 'Mathematics (O-Level)',
    nameFr: 'Mathématiques (O-Level)',
    code: '570',
    streamId: 'general',
    levelId: 'ordinary_level',
    language: 'en',
    description: 'Number theory, algebraic manipulation, quadratic equations, Euclidean geometry, trigonometry, and basic statistics.',
    descriptionFr: 'Arithmétique, calcul algébrique, géométrie plane, trigonométrie et statistiques.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 9
  },
  {
    id: 'gen_ol_physics',
    name: 'Physics (O-Level)',
    nameFr: 'Physique (O-Level)',
    code: '580',
    streamId: 'general',
    levelId: 'ordinary_level',
    language: 'en',
    description: 'Measurements, forces, energy, thermal physics, light & sound waves, direct current circuits, and radioactivity.',
    descriptionFr: 'Mesures, mécanique, optique, circuits électriques et radioactivité.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 10
  },
  {
    id: 'gen_ol_chem',
    name: 'Chemistry (O-Level)',
    nameFr: 'Chimie (O-Level)',
    code: '515',
    streamId: 'general',
    levelId: 'ordinary_level',
    language: 'en',
    description: 'States of matter, atomic structure, bonding, stoichiometry, acids & bases, rates of reaction, and organic chemistry intro.',
    descriptionFr: 'Structure atomique, liaisons chimiques, stœchiométrie, acides-bases et chimie organique élémentaire.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 11
  },
  {
    id: 'gen_ol_bio',
    name: 'Biology (O-Level)',
    nameFr: 'Biologie (O-Level)',
    code: '510',
    streamId: 'general',
    levelId: 'ordinary_level',
    language: 'en',
    description: 'Classification of living organisms, nutrition, respiration, transport in plants & humans, reproduction, and ecology.',
    descriptionFr: 'Organisation du vivant, nutrition, respiration, circulation, génétique et écologie.',
    examinationType: 'GCE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 12
  },

  // Technical Education (Industrial TVEE)
  {
    id: 'tech_al_eps',
    name: 'Electrical Power Systems (EPS)',
    nameFr: 'Systèmes Électrotechniques & Énergie',
    code: 'EPS-701',
    streamId: 'technical',
    levelId: 'advanced_tvee',
    language: 'en',
    description: 'AC circuit analysis, transformers, three-phase power systems, electric machine drives, and power distribution.',
    descriptionFr: 'Réseaux électriques, transformateurs, machines tournantes et commande industrielle.',
    examinationType: 'TVEE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 13
  },
  {
    id: 'tech_al_telecom',
    name: 'Telecommunications & Networks',
    nameFr: 'Télécommunications et Réseaux Informatiques',
    code: 'TEL-702',
    streamId: 'technical',
    levelId: 'advanced_tvee',
    language: 'en',
    description: 'Signal propagation, analog & digital modulation, fiber optic transmission, routing protocols, and antenna theory.',
    descriptionFr: 'Transmission de signaux, modulation numérique, fibre optique et protocoles de routage.',
    examinationType: 'TVEE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 14
  },
  {
    id: 'tech_al_csm',
    name: 'Computer Software & Maintenance (CSM)',
    nameFr: 'Logiciel & Maintenance des Systèmes',
    code: 'CSM-703',
    streamId: 'technical',
    levelId: 'advanced_tvee',
    language: 'en',
    description: 'Embedded microcontrollers, C & Python system programming, hardware diagnostics, and network configuration.',
    descriptionFr: 'Programmation bas niveau, diagnostic matériel et dépannage des systèmes informatiques.',
    examinationType: 'TVEE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 15
  },

  // Commercial Education (TVEE Commercial)
  {
    id: 'comm_al_acc',
    name: 'Financial Accounting (ACC)',
    nameFr: 'Comptabilité Financière (ACC)',
    code: 'ACC-701',
    streamId: 'commercial',
    levelId: 'acc',
    language: 'en',
    description: 'Double-entry bookkeeping, trial balance, final accounts, depreciation, bank reconciliation, and cash flow statements.',
    descriptionFr: 'Système OHADA, écritures comptables, balance générale, bilan et compte de résultat.',
    examinationType: 'TVEE',
    availablePapers: ['Paper 1', 'Paper 2', 'Paper 3'],
    isActive: true,
    order: 16
  },
  {
    id: 'comm_al_mkt',
    name: 'Marketing & Commercial Action (MKT)',
    nameFr: 'Action Commerciale & Marketing (MKT)',
    code: 'MKT-702',
    streamId: 'commercial',
    levelId: 'mkt',
    language: 'en',
    description: 'Market research, consumer behavior, product strategy, pricing models, distribution channels, and promotional campaigns.',
    descriptionFr: 'Études de marché, comportement du consommateur, mix marketing et techniques de négociation.',
    examinationType: 'TVEE',
    availablePapers: ['Paper 1', 'Paper 2'],
    isActive: true,
    order: 17
  }
];

export const SEEDED_SYLLABUS_MODULES: SyllabusModule[] = [
  // Computer Science A-Level Modules
  {
    id: 'mod_cs_arch',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 1',
    title: 'Computer Organization & Architecture',
    titleFr: 'Organisation et Architecture des Ordinateurs',
    description: 'Processor structure, instruction cycles, buses, memory hierarchy, interrupt processing, and low-level arithmetic.',
    order: 1
  },
  {
    id: 'mod_cs_data_rep',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 2',
    title: 'Data Representation & Digital Logic',
    titleFr: 'Représentation des Données & Circuits Logiques',
    description: 'Two\'s complement, IEEE 754 floating-point, Boolean algebra, logic gates, Karnaugh maps, and combinational circuits.',
    order: 2
  },
  {
    id: 'mod_cs_algo',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 3',
    title: 'Algorithms & Problem Solving',
    titleFr: 'Algorithmique et Résolution de Problèmes',
    description: 'Pseudocode design, tracing, asymptotic complexity (Big-O), search algorithms, and sorting algorithms.',
    order: 3
  },
  {
    id: 'mod_cs_prog',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 4',
    title: 'Programming & Software Construction',
    titleFr: 'Programmation et Conception Logicielle',
    description: 'Structured programming, functions, recursion, Object-Oriented Programming (classes, inheritance, polymorphism), and testing.',
    order: 4
  },
  {
    id: 'mod_cs_structures',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 5',
    title: 'Data Structures',
    titleFr: 'Structures de Données',
    description: 'Abstract Data Types: Arrays, Stacks, Queues, Singly and Doubly Linked Lists, Binary Trees, and Graphs.',
    order: 5
  },
  {
    id: 'mod_cs_db',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 6',
    title: 'Database Systems & SQL',
    titleFr: 'Systèmes de Bases de Données & SQL',
    description: 'Entity-Relationship modeling, relational model, normalization (1NF, 2NF, 3NF, BCNF), and SQL querying.',
    order: 6
  },
  {
    id: 'mod_cs_networks',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 7',
    title: 'Computer Networks & Data Communication',
    titleFr: 'Réseaux Informatiques & Communication',
    description: 'OSI and TCP/IP models, transmission media, IP addressing and subnetting, network topologies, and network security.',
    order: 7
  },
  {
    id: 'mod_cs_os',
    subjectId: 'gen_al_cs',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 8',
    title: 'Operating Systems & System Software',
    titleFr: 'Systèmes d\'Exploitation & Logiciels Systèmes',
    description: 'Process scheduling, deadlocks, memory management (paging/segmentation), virtual memory, and file systems.',
    order: 8
  },

  // Mathematics A-Level Modules
  {
    id: 'mod_math_pure_calc',
    subjectId: 'gen_al_maths',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 1',
    title: 'Pure Mathematics: Calculus (Differential & Integral)',
    titleFr: 'Mathématiques Pures: Calcul Différentiel et Intégral',
    description: 'Derivatives of composite, inverse, and trigonometric functions; integration techniques, differential equations.',
    order: 1
  },
  {
    id: 'mod_math_algebra',
    subjectId: 'gen_al_maths',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 2',
    title: 'Pure Mathematics: Algebra & Complex Numbers',
    titleFr: 'Algèbre, Séries et Nombres Complexes',
    description: 'Partial fractions, binomial expansion, sequences & series, mathematical induction, complex numbers (Argand diagram, de Moivre).',
    order: 2
  },
  {
    id: 'mod_math_mech',
    subjectId: 'gen_al_maths',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 3',
    title: 'Applied Mathematics: Mechanics',
    titleFr: 'Mathématiques Appliquées: Mécanique',
    description: 'Kinematics in 1D and 2D, projectile motion, Newton\'s laws of motion, friction, momentum and collisions, equilibrium of rigid bodies.',
    order: 3
  },
  {
    id: 'mod_math_stats',
    subjectId: 'gen_al_maths',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 4',
    title: 'Applied Mathematics: Probability & Statistics',
    titleFr: 'Statistiques & Probabilités',
    description: 'Discrete random variables, Binomial & Poisson distributions, Normal distribution, hypothesis testing, linear regression.',
    order: 4
  },

  // Physics A-Level Modules
  {
    id: 'mod_phys_mech',
    subjectId: 'gen_al_physics',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 1',
    title: 'Mechanics & Gravitational Fields',
    titleFr: 'Mécanique & Champs Gravitationnels',
    description: 'Vectors, circular motion, simple harmonic motion, gravitational potential, orbital dynamics, Kepler\'s laws.',
    order: 1
  },
  {
    id: 'mod_phys_em',
    subjectId: 'gen_al_physics',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 2',
    title: 'Electromagnetism & AC Theory',
    titleFr: 'Électromagnétisme & Courant Alternatif',
    description: 'Electric fields, capacitors, magnetic flux, electromagnetic induction, Faraday and Lenz laws, AC circuits, transformers.',
    order: 2
  },

  // Chemistry A-Level Modules
  {
    id: 'mod_chem_physical',
    subjectId: 'gen_al_chem',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 1',
    title: 'Physical Chemistry: Chemical Energetics & Kinetics',
    titleFr: 'Chimie Physique: Thermodynamique et Cinétique',
    description: 'Born-Haber cycles, Hess\'s Law, Gibbs free energy, rate equations, activation energy, catalysis, chemical equilibria (Kc, Kp).',
    order: 1
  },
  {
    id: 'mod_chem_organic',
    subjectId: 'gen_al_chem',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleNumber: 'Module 2',
    title: 'Organic Chemistry: Reaction Mechanisms',
    titleFr: 'Chimie Organique: Mécanismes Réactionnels',
    description: 'Nucleophilic substitution (SN1, SN2), electrophilic addition, carbonyl compounds, aromatic chemistry (benzene substitution).',
    order: 2
  },

  // Ordinary Level Computer Science Modules
  {
    id: 'mod_ol_cs_basics',
    subjectId: 'gen_ol_cs',
    streamId: 'general',
    levelId: 'ordinary_level',
    moduleNumber: 'Module 1',
    title: 'Fundamentals of Computing & Hardware',
    titleFr: 'Fondamentaux de l\'Informatique & Matériel',
    description: 'Input, output, storage devices, central processing unit, software categories, computer maintenance and ergonomics.',
    order: 1
  },
  {
    id: 'mod_ol_cs_logic',
    subjectId: 'gen_ol_cs',
    streamId: 'general',
    levelId: 'ordinary_level',
    moduleNumber: 'Module 2',
    title: 'Number Bases & Logic Gates',
    titleFr: 'Bases Numériques & Portes Logiques',
    description: 'Binary, octal, hexadecimal conversions, AND, OR, NOT, NAND, NOR logic gates, truth tables and basic circuit diagrams.',
    order: 2
  },
  {
    id: 'mod_ol_cs_algo',
    subjectId: 'gen_ol_cs',
    streamId: 'general',
    levelId: 'ordinary_level',
    moduleNumber: 'Module 3',
    title: 'Algorithms & Flowcharting',
    titleFr: 'Algorithmes & Organigrammes',
    description: 'Step-by-step problem formulation, standard flowchart symbols, decision-making branches, and simple counting loops.',
    order: 3
  },

  // Commercial Education Accounting Modules
  {
    id: 'mod_acc_double_entry',
    subjectId: 'comm_al_acc',
    streamId: 'commercial',
    levelId: 'commercial_advanced',
    moduleNumber: 'Module 1',
    title: 'Double-Entry Accounting & Financial Statements',
    titleFr: 'Comptabilité en Partie Double & États Financiers',
    description: 'General journal entries, ledger posting, trial balance adjustments, income statement, balance sheet according to OHADA standards.',
    order: 1
  },
  {
    id: 'mod_acc_costing',
    subjectId: 'comm_al_acc',
    streamId: 'commercial',
    levelId: 'commercial_advanced',
    moduleNumber: 'Module 2',
    title: 'Cost & Management Accounting',
    titleFr: 'Comptabilité Analytique de Gestion',
    description: 'Classification of costs, break-even analysis, marginal costing, variance analysis, and cash budget preparation.',
    order: 2
  }
];

export const SEEDED_SYLLABUS_TOPICS: SyllabusTopicModel[] = [
  // -------------------------------------------------------------
  // COMPUTER SCIENCE ADVANCED LEVEL TOPICS
  // -------------------------------------------------------------
  {
    id: 'top_cs_db_norm',
    subjectId: 'gen_al_cs',
    subjectName: 'Computer Science',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleId: 'mod_cs_db',
    moduleTitle: 'Database Systems & SQL',
    topicName: 'Database Normalization',
    topicNameFr: 'Normalisation des Bases de Données',
    code: 'CS-795-T6.1',
    description: 'Functional dependencies, anomaly prevention (insertion, deletion, update), and step-by-step transformation from unnormalized forms (UNF) through First (1NF), Second (2NF), Third (3NF), and Boyce-Codd Normal Form (BCNF).',
    descriptionFr: 'Dépendances fonctionnelles, suppression des anomalies et passage méthodique de la forme non normalisée (UNF) à la 1NF, 2NF, 3NF et BCNF.',
    subtopics: [
      { id: 'sub_cs_db_anomalies', name: 'Relational Anomalies (Insert, Delete, Update)', nameFr: 'Anomalies Relationnelles' },
      { id: 'sub_cs_db_fd', name: 'Functional Dependencies and Determinants', nameFr: 'Dépendances Fonctionnelles' },
      { id: 'sub_cs_db_1nf', name: 'First Normal Form (1NF) & Atomic Values', nameFr: 'Première Forme Normale (1NF)' },
      { id: 'sub_cs_db_2nf', name: 'Second Normal Form (2NF) & Partial Dependencies', nameFr: 'Deuxième Forme Normale (2NF)' },
      { id: 'sub_cs_db_3nf', name: 'Third Normal Form (3NF) & Transitive Dependencies', nameFr: 'Troisième Forme Normale (3NF)' },
      { id: 'sub_cs_db_bcnf', name: 'Boyce-Codd Normal Form (BCNF)', nameFr: 'Forme Normale de Boyce-Codd (BCNF)' }
    ],
    learningObjectives: [
      'Define functional dependency, determinant, and candidate keys.',
      'Explain the negative consequences of update, insertion, and deletion anomalies in denormalized tables.',
      'Decompose an unnormalized relation into 1NF by ensuring atomic attributes and removing repeating groups.',
      'Convert a 1NF relation into 2NF by eliminating partial functional dependencies on composite keys.',
      'Transform a 2NF relation into 3NF by identifying and removing transitive dependencies.',
      'Evaluate relations for BCNF where every determinant must be a candidate key.'
    ],
    importantConcepts: [
      'Atomic Attributes',
      'Repeating Groups',
      'Composite Primary Key',
      'Partial Dependency',
      'Transitive Dependency',
      'Lossless Decomposition',
      'Dependency Preservation'
    ],
    paperRelevance: ['Paper 1', 'Paper 2'],
    priority: 'CRITICAL',
    priorityScore: 94,
    prioritySource: 'SYSTEM',
    priorityReason: 'Core examination pillar appearing in over 85% of verified Cameroon GCE A-Level Paper 2 sessions with heavy marks weighting.',
    priorityBreakdown: {
      curriculumWeight: 95,
      gceFrequency: 96,
      gceMarksWeight: 92,
      paperCoverage: 95,
      prerequisiteImportance: 90
    },
    difficulty: 'Advanced',
    prerequisites: ['Database Concepts', 'Relational Model', 'Primary & Foreign Keys'],
    estimatedStudyTimeMinutes: 180,
    pastQuestionCount: 9,
    pastQuestionsList: [
      {
        year: 2024,
        paper: 'Paper 2',
        questionNumber: 'Q4(b)',
        marks: 8,
        questionSnippet: 'Given the relation R(StudentID, CourseCode, CourseTitle, LecturerID, RoomNo, Grade), identify functional dependencies and normalize to 3NF.'
      },
      {
        year: 2022,
        paper: 'Paper 2',
        questionNumber: 'Q5(a)',
        marks: 10,
        questionSnippet: 'Explain why normalization is necessary in database design. Differentiate with clear examples between partial and transitive dependency.'
      },
      {
        year: 2021,
        paper: 'Paper 2',
        questionNumber: 'Q4',
        marks: 7,
        questionSnippet: 'A school keeps exam records in a spreadsheet. Normalize this schema from UNF up to 3NF, showing primary and foreign keys.'
      },
      {
        year: 2019,
        paper: 'Paper 2',
        questionNumber: 'Q6(c)',
        marks: 6,
        questionSnippet: 'State the conditions required for a relation to be in BCNF. Provide a relational example in 3NF that fails BCNF.'
      },
      {
        year: 2018,
        paper: 'Paper 1',
        questionNumber: 'Q28',
        marks: 1,
        questionSnippet: 'A relation in which every non-prime attribute is non-transitively dependent on every candidate key is in: (A) 1NF (B) 2NF (C) 3NF (D) BCNF'
      }
    ],
    questionCount: 48,
    order: 1,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Confusing partial dependency (dependent on part of a composite key) with transitive dependency (dependent on a non-key attribute).',
      'Forgetting to underline primary keys in resulting decomposed relations.',
      'Failing to retain foreign keys required to re-link relations losslessly.'
    ],
    examTips: [
      'Always write out the functional dependencies explicitly before decomposing tables.',
      'Show intermediate relations clearly when moving from UNF to 1NF, then 2NF, then 3NF.'
    ]
  },

  {
    id: 'top_cs_algorithms',
    subjectId: 'gen_al_cs',
    subjectName: 'Computer Science',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleId: 'mod_cs_algo',
    moduleTitle: 'Algorithms & Problem Solving',
    topicName: 'Algorithm Design & Complexity Analysis',
    topicNameFr: 'Conception d\'Algorithmes & Analyse de Complexité',
    code: 'CS-795-T3.1',
    description: 'Systematic algorithm formulation using structured pseudocode, trace tables, recursive algorithms, divide-and-conquer, sorting algorithms (Bubble, Insertion, Merge, Quick), searching algorithms (Linear, Binary), and Big-O asymptotic analysis.',
    descriptionFr: 'Conception d\'algorithmes structurés en pseudocode, tables de traçage, récursivité, algorithmes de tri et de recherche, et complexité asymptotique (Grand O).',
    subtopics: [
      { id: 'sub_cs_pseudo', name: 'Pseudocode Standards & Flow of Control', nameFr: 'Normes de Pseudocode' },
      { id: 'sub_cs_trace', name: 'Trace Tables & Dry Running', nameFr: 'Tables de Traçage (Dry Run)' },
      { id: 'sub_cs_big_o', name: 'Asymptotic Complexity: Time and Space (Big-O)', nameFr: 'Complexité Asymptotique (Grand O)' },
      { id: 'sub_cs_sort', name: 'Sorting: Bubble, Insertion, Selection, Merge Sort', nameFr: 'Algorithmes de Tri' },
      { id: 'sub_cs_search', name: 'Searching: Linear Search vs Binary Search', nameFr: 'Algorithmes de Recherche' },
      { id: 'sub_cs_recur', name: 'Recursion: Base Cases and Call Stacks', nameFr: 'Récursivité et Pile d\'Exécution' }
    ],
    learningObjectives: [
      'Write structured pseudocode conforming to GCE standards using clear indentation, variables, and control structures.',
      'Execute dry runs on algorithmic fragments using comprehensive trace tables.',
      'Compare time and space complexity of sorting and searching algorithms in best, average, and worst cases.',
      'Formulate recursive algorithms specifying base cases and recursive steps.',
      'Prove correctness and state termination conditions of iterative and recursive algorithms.'
    ],
    importantConcepts: [
      'Big-O Notation (O(1), O(log n), O(n), O(n log n), O(n²))',
      'Trace Table Verification',
      'Base Case and Inductive Step in Recursion',
      'Divide and Conquer Paradigm',
      'Stable vs Unstable Sorting'
    ],
    paperRelevance: ['Paper 1', 'Paper 2', 'Paper 3'],
    priority: 'CRITICAL',
    priorityScore: 92,
    prioritySource: 'SYSTEM',
    priorityReason: 'Essential algorithmic foundation tested across all three examination papers (MCQ, Theory & Practical Programming).',
    priorityBreakdown: {
      curriculumWeight: 95,
      gceFrequency: 94,
      gceMarksWeight: 90,
      paperCoverage: 95,
      prerequisiteImportance: 85
    },
    difficulty: 'Advanced',
    prerequisites: ['Basic Logic & Arithmetic', 'Control Structures'],
    estimatedStudyTimeMinutes: 200,
    pastQuestionCount: 12,
    pastQuestionsList: [
      {
        year: 2024,
        paper: 'Paper 2',
        questionNumber: 'Q1',
        marks: 12,
        questionSnippet: 'Write an algorithm in pseudocode to find the median of an unsorted array of n integers. Compute its time complexity.'
      },
      {
        year: 2023,
        paper: 'Paper 2',
        questionNumber: 'Q2(b)',
        marks: 8,
        questionSnippet: 'Construct a trace table for the given recursive Fibonacci algorithm for input n = 4. State the maximum depth of the call stack.'
      },
      {
        year: 2022,
        paper: 'Paper 3',
        questionNumber: 'Q1',
        marks: 25,
        questionSnippet: 'Implement the Merge Sort algorithm in C/Python to arrange student scores in ascending order.'
      }
    ],
    questionCount: 65,
    order: 2,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Forgetting the base case in recursive functions, causing infinite recursion.',
      'Assuming binary search works on unsorted lists.',
      'Misidentifying worst-case complexity for Quick Sort when pivot selection is poor.'
    ],
    examTips: [
      'Always draw out a clear trace table with columns for every variable, loop counter, and condition result.',
      'State Big-O time complexity with explicit justifications based on loop nesting.'
    ]
  },

  {
    id: 'top_cs_data_structures',
    subjectId: 'gen_al_cs',
    subjectName: 'Computer Science',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleId: 'mod_cs_structures',
    moduleTitle: 'Data Structures',
    topicName: 'Abstract Data Types: Stacks, Queues, Linked Lists & Trees',
    topicNameFr: 'Types Abstraits de Données: Piles, Files, Listes & Arbres',
    code: 'CS-795-T5.1',
    description: 'Implementation and operations on linear and non-linear data structures: Stack (LIFO, push/pop), Queue (FIFO, circular, priority), Singly and Doubly Linked Lists (node allocation, pointer manipulation), Binary Search Trees (insertion, traversal: pre-order, in-order, post-order).',
    descriptionFr: 'Piles (LIFO), files (FIFO), listes chaînées simples et doubles, arbres binaires de recherche et parcours préfixe, infixe, postfixe.',
    subtopics: [
      { id: 'sub_cs_stack', name: 'Stack Operations (Push, Pop, Peek, Overflow/Underflow)', nameFr: 'Piles (LIFO)' },
      { id: 'sub_cs_queue', name: 'Queues (Linear, Circular, Priority, Deque)', nameFr: 'Files d\'Attente (FIFO)' },
      { id: 'sub_cs_ll', name: 'Linked Lists (Nodes, Pointers, Insertion, Deletion)', nameFr: 'Listes Chaînées' },
      { id: 'sub_cs_bst', name: 'Binary Search Trees (BST Properties, Tree Traversals)', nameFr: 'Arbres Binaires de Recherche' }
    ],
    learningObjectives: [
      'Implement stack and queue operations using both static arrays and dynamic pointers.',
      'Trace pointer reassignments during insertion and deletion at head, middle, and tail of linked lists.',
      'Perform recursive pre-order, in-order, and post-order traversals on binary search trees.',
      'Determine conditions for stack overflow, stack underflow, and circular queue boundary conditions.'
    ],
    importantConcepts: [
      'LIFO vs FIFO',
      'Dynamic Memory Allocation (Pointers/References)',
      'Sentinel Nodes & Null Pointers',
      'Tree Height and In-order Ascending Property in BST'
    ],
    paperRelevance: ['Paper 1', 'Paper 2', 'Paper 3'],
    priority: 'HIGH',
    priorityScore: 88,
    prioritySource: 'SYSTEM',
    priorityReason: 'High examination recurrence in Paper 2 structured theory and Paper 3 practical code implementation.',
    priorityBreakdown: {
      curriculumWeight: 90,
      gceFrequency: 88,
      gceMarksWeight: 86,
      paperCoverage: 90,
      prerequisiteImportance: 85
    },
    difficulty: 'Advanced',
    prerequisites: ['Algorithm Design & Complexity Analysis', 'Pointers & Dynamic Memory'],
    estimatedStudyTimeMinutes: 160,
    pastQuestionCount: 8,
    pastQuestionsList: [
      {
        year: 2024,
        paper: 'Paper 2',
        questionNumber: 'Q3',
        marks: 10,
        questionSnippet: 'Write algorithm in pseudocode to delete a node from a singly linked list given its value. Handle all boundary cases.'
      },
      {
        year: 2022,
        paper: 'Paper 2',
        questionNumber: 'Q4',
        marks: 8,
        questionSnippet: 'Insert numbers 45, 12, 67, 34, 89, 23 into an initially empty Binary Search Tree. State the resulting in-order traversal sequence.'
      }
    ],
    questionCount: 42,
    order: 3,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Breaking the linked list chain by overwriting the `next` pointer before saving the downstream reference.',
      'Forgetting that tree in-order traversal of a BST yields elements in sorted order.'
    ],
    examTips: [
      'Draw box-and-pointer memory diagrams showing exact link reassignments step by step.'
    ]
  },

  {
    id: 'top_cs_boolean_logic',
    subjectId: 'gen_al_cs',
    subjectName: 'Computer Science',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleId: 'mod_cs_data_rep',
    moduleTitle: 'Data Representation & Digital Logic',
    topicName: 'Boolean Algebra, Logic Gates & Karnaugh Maps',
    topicNameFr: 'Algèbre de Boole, Portes Logiques et Tableaux de Karnaugh',
    code: 'CS-795-T2.1',
    description: 'Postulates and theorems of Boolean algebra, De Morgan\'s laws, canonical Sum of Products (SOP) and Product of Sums (POS), Karnaugh maps (2, 3, and 4 variables), minimization, and combinational logic circuits (Half Adder, Full Adder, Multiplexer).',
    descriptionFr: 'Théorèmes de Boole, lois de De Morgan, formes canoniques, simplification par tableaux de Karnaugh (jusqu\'à 4 variables) et circuits combinatoires.',
    subtopics: [
      { id: 'sub_cs_bool_laws', name: 'Boolean Laws, Duality & De Morgan\'s Theorems', nameFr: 'Lois de Boole & De Morgan' },
      { id: 'sub_cs_sop_pos', name: 'Minterms, Maxterms, Canonical SOP & POS', nameFr: 'Mintermes, Maxtermes et Formes Canoniques' },
      { id: 'sub_cs_kmap', name: 'Karnaugh Maps (Grouping, Don\'t-care conditions)', nameFr: 'Tableaux de Karnaugh' },
      { id: 'sub_cs_adders', name: 'Arithmetic Circuits: Half Adder & Full Adder', nameFr: 'Additionneurs Demi et Complets' }
    ],
    learningObjectives: [
      'Simplify complex Boolean expressions using algebraic identities and De Morgan\'s laws.',
      'Construct and simplify Boolean functions using 3-variable and 4-variable Karnaugh maps.',
      'Design combinational digital circuits using universal NAND and NOR gates only.',
      'Explain the logic truth table, Boolean expressions, and circuit diagram of a 1-bit Full Adder.'
    ],
    importantConcepts: [
      'Universal Gates (NAND, NOR)',
      'Gray Code Ordering in K-Maps',
      'Overlapping Groups of Powers of 2',
      'Propagation Delay in Digital Gates'
    ],
    paperRelevance: ['Paper 1', 'Paper 2'],
    priority: 'HIGH',
    priorityScore: 86,
    prioritySource: 'SYSTEM',
    priorityReason: 'Reliable scoring area with high historical representation in both Paper 1 multiple-choice and Paper 2 circuit design questions.',
    priorityBreakdown: {
      curriculumWeight: 88,
      gceFrequency: 89,
      gceMarksWeight: 84,
      paperCoverage: 85,
      prerequisiteImportance: 82
    },
    difficulty: 'Standard',
    prerequisites: ['Basic Logic Gates (AND, OR, NOT)'],
    estimatedStudyTimeMinutes: 140,
    pastQuestionCount: 11,
    pastQuestionsList: [
      {
        year: 2023,
        paper: 'Paper 2',
        questionNumber: 'Q3(a)',
        marks: 8,
        questionSnippet: 'Simplify the function F(A,B,C,D) = Σm(0, 2, 5, 7, 8, 10, 13, 15) using a 4-variable Karnaugh map and draw the minimal NAND-gate circuit.'
      },
      {
        year: 2021,
        paper: 'Paper 2',
        questionNumber: 'Q2',
        marks: 6,
        questionSnippet: 'State De Morgan\'s first and second laws. Use truth tables to prove that (A + B)\' = A\' · B\'.'
      }
    ],
    questionCount: 52,
    order: 4,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Labeling K-map columns with binary sequence (00, 01, 10, 11) instead of Gray code (00, 01, 11, 10).',
      'Grouping 3 or 5 cells instead of powers of 2 (1, 2, 4, 8, 16).'
    ],
    examTips: [
      'Always look for wrap-around groups (corners and opposing edges) to achieve maximal simplification.'
    ]
  },

  {
    id: 'top_cs_networks',
    subjectId: 'gen_al_cs',
    subjectName: 'Computer Science',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleId: 'mod_cs_networks',
    moduleTitle: 'Computer Networks & Data Communication',
    topicName: 'Network Architectures, OSI Model & IP Subnetting',
    topicNameFr: 'Modèle OSI, Protocoles Réseau et Adressage IP',
    code: 'CS-795-T7.1',
    description: '7-layer OSI reference model vs 4-layer TCP/IP stack, transmission media (UTP, STP, Coaxial, Fiber Optic, Wireless), IPv4 addressing classes, subnet masking, CIDR notation, and network hardware (Switches, Routers, Gateways).',
    descriptionFr: 'Modèle OSI 7 couches, pile TCP/IP, supports de transmission, adressage IPv4, masques de sous-réseau, CIDR et équipements d\'interconnexion.',
    subtopics: [
      { id: 'sub_cs_osi', name: 'OSI Reference Model & Encapsulation', nameFr: 'Modèle OSI et Encapsulation' },
      { id: 'sub_cs_tcp', name: 'TCP/IP Protocol Suite (IP, TCP, UDP, DNS, HTTP)', nameFr: 'Suite Protocolique TCP/IP' },
      { id: 'sub_cs_ip_subnet', name: 'IPv4 Addressing, Subnet Masks & CIDR Calculations', nameFr: 'Adressage IPv4 & Calculs de Sous-réseaux' },
      { id: 'sub_cs_devices', name: 'Networking Hardware: Hubs, Switches, Routers, Gateways', nameFr: 'Équipements Réseau' }
    ],
    learningObjectives: [
      'Describe the precise function and protocol data units (PDU) of each layer in the 7-layer OSI model.',
      'Calculate network address, broadcast address, and valid host range for given CIDR prefixes.',
      'Differentiate between connection-oriented (TCP) and connectionless (UDP) transport protocols.',
      'Compare bandwidth, attenuation, and noise immunity of copper twisted pair vs fiber optic cabling.'
    ],
    importantConcepts: [
      'PDU (Bits, Frames, Packets, Segments, Data)',
      'Subnet Masking & Host/Network Bit Splitting',
      'CSMA/CD in Ethernet vs CSMA/CA in Wi-Fi',
      'Router (Layer 3) vs Switch (Layer 2)'
    ],
    paperRelevance: ['Paper 1', 'Paper 2'],
    priority: 'MEDIUM',
    priorityScore: 74,
    prioritySource: 'SYSTEM',
    priorityReason: 'Consistent contributor to Paper 1 MCQ and frequent section question in Paper 2 theory.',
    priorityBreakdown: {
      curriculumWeight: 78,
      gceFrequency: 75,
      gceMarksWeight: 72,
      paperCoverage: 76,
      prerequisiteImportance: 70
    },
    difficulty: 'Standard',
    prerequisites: ['Data Communication Fundamentals'],
    estimatedStudyTimeMinutes: 120,
    pastQuestionCount: 7,
    pastQuestionsList: [
      {
        year: 2023,
        paper: 'Paper 2',
        questionNumber: 'Q6',
        marks: 8,
        questionSnippet: 'An institution is assigned network 192.168.10.0/24. Subnet this network into 4 equal subnets. State subnet mask, first usable IP, and broadcast IP for subnet 2.'
      }
    ],
    questionCount: 38,
    order: 5,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Assigning network ID or broadcast address as usable host addresses.',
      'Confusing MAC address (Layer 2) with IP address (Layer 3).'
    ],
    examTips: [
      'Remember formula for usable hosts per subnet is 2^h - 2, where h is the number of remaining host bits.'
    ]
  },

  // -------------------------------------------------------------
  // MATHEMATICS ADVANCED LEVEL TOPICS
  // -------------------------------------------------------------
  {
    id: 'top_math_calc_diff',
    subjectId: 'gen_al_maths',
    subjectName: 'Mathematics with Pure & Applied',
    streamId: 'general',
    levelId: 'advanced_level',
    moduleId: 'mod_math_pure_calc',
    moduleTitle: 'Pure Mathematics: Calculus (Differential & Integral)',
    topicName: 'Differentiation Techniques & Applications',
    topicNameFr: 'Techniques de Dérivation et Applications',
    code: 'MATH-775-T1.1',
    description: 'First principles, product rule, quotient rule, chain rule, implicit differentiation, parametric differentiation, tangents & normals, stationary points (maxima, minima, points of inflexion), and rates of change.',
    descriptionFr: 'Dérivation par la définition, dérivées de fonctions composées, dérivation implicite et paramétrique, extremums locaux et taux de variation.',
    subtopics: [
      { id: 'sub_math_rules', name: 'Product, Quotient, and Chain Rules', nameFr: 'Règles de Dérivation Usuelles' },
      { id: 'sub_math_implicit', name: 'Implicit and Parametric Differentiation', nameFr: 'Dérivation Implicite & Paramétrique' },
      { id: 'sub_math_tangents', name: 'Tangents, Normals & Rate of Change', nameFr: 'Tangentes, Normales & Taux de Variation' },
      { id: 'sub_math_extrema', name: 'Stationary Points & Nature Determination', nameFr: 'Points Critiques & Convexité' }
    ],
    learningObjectives: [
      'Differentiate composite functions including exponential, logarithmic, and inverse trigonometric expressions.',
      'Find equations of tangents and normals to curves defined implicitly and parametrically.',
      'Locate and classify stationary points using first and second derivative tests.',
      'Model physical optimization problems (volume, area, cost) using differential calculus.'
    ],
    importantConcepts: [
      'Derivative as Limit of Difference Quotient',
      'Sign Change Test vs Second Derivative Test',
      'Point of Inflexion Conditions (f\'\'(x) = 0 with concavity change)'
    ],
    paperRelevance: ['Paper 1', 'Paper 2'],
    priority: 'CRITICAL',
    priorityScore: 95,
    prioritySource: 'SYSTEM',
    priorityReason: 'Carries high mark totals in Cameroon GCE A-Level Pure Mathematics Paper 2 Section A, serving as an indispensable topic.',
    priorityBreakdown: {
      curriculumWeight: 96,
      gceFrequency: 97,
      gceMarksWeight: 95,
      paperCoverage: 96,
      prerequisiteImportance: 92
    },
    difficulty: 'Advanced',
    prerequisites: ['Functions, Coordinate Geometry, Trigonometry'],
    estimatedStudyTimeMinutes: 180,
    pastQuestionCount: 14,
    pastQuestionsList: [
      {
        year: 2024,
        paper: 'Paper 2',
        questionNumber: 'Q4',
        marks: 11,
        questionSnippet: 'A curve is given parametrically by x = 2t + sin t, y = 1 - cos t. Find the equation of the normal to the curve at t = π/3.'
      },
      {
        year: 2022,
        paper: 'Paper 2',
        questionNumber: 'Q3',
        marks: 13,
        questionSnippet: 'Show that the curve y = (x² - 4)/(x² + 4) has exactly one turning point and find the asymptotes.'
      }
    ],
    questionCount: 74,
    order: 1,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Applying product rule as (u * v)\' = u\' * v\' instead of u\'v + uv\'.',
      'Failing to chain through dy/dx when differentiating terms involving y implicitly.'
    ],
    examTips: [
      'Always test concavity to distinguish true points of inflexion from simple stationary points.'
    ]
  },

  // -------------------------------------------------------------
  // ORDINARY LEVEL COMPUTER SCIENCE TOPICS
  // -------------------------------------------------------------
  {
    id: 'top_ol_cs_logic_gates',
    subjectId: 'gen_ol_cs',
    subjectName: 'Computer Science (O-Level)',
    streamId: 'general',
    levelId: 'ordinary_level',
    moduleId: 'mod_ol_cs_logic',
    moduleTitle: 'Number Bases & Logic Gates',
    topicName: 'Logic Gates & Truth Tables',
    topicNameFr: 'Portes Logiques et Tables de Vérité',
    code: 'CS-595-T2.1',
    description: 'Standard logic gates (AND, OR, NOT, NAND, NOR, XOR), symbols, Boolean truth tables up to 3 inputs, gate combinations, and output signal evaluation.',
    descriptionFr: 'Portes logiques de base, symboles graphiques, tables de vérité jusqu\'à 3 entrées et circuits logiques combinés.',
    subtopics: [
      { id: 'sub_ol_basic_gates', name: 'Primary Gates: AND, OR, NOT', nameFr: 'Portes Primaires: ET, OU, NON' },
      { id: 'sub_ol_derived_gates', name: 'Derived Gates: NAND, NOR, XOR', nameFr: 'Portes Dérivées: NON-ET, NON-OU, OU-Exclusif' },
      { id: 'sub_ol_truth_tables', name: 'Generating Multi-Gate Truth Tables', nameFr: 'Tables de Vérité Multi-Portes' }
    ],
    learningObjectives: [
      'Identify standard British/ANSI symbols for all basic logic gates.',
      'Complete truth tables for combined circuits with 2 and 3 inputs.',
      'Determine the output state of a digital logic circuit given specific binary input values.'
    ],
    importantConcepts: [
      'High/Low Logic (1 and 0)',
      'Inversion Bubble',
      'Truth Table Row Counting (2^n)'
    ],
    paperRelevance: ['Paper 1', 'Paper 2'],
    priority: 'HIGH',
    priorityScore: 85,
    prioritySource: 'SYSTEM',
    priorityReason: 'Standard Cameroon GCE O-Level Computer Science topic appearing yearly with predictable question patterns.',
    priorityBreakdown: {
      curriculumWeight: 88,
      gceFrequency: 86,
      gceMarksWeight: 84,
      paperCoverage: 85,
      prerequisiteImportance: 80
    },
    difficulty: 'Standard',
    prerequisites: ['Binary Digits'],
    estimatedStudyTimeMinutes: 90,
    pastQuestionCount: 8,
    pastQuestionsList: [
      {
        year: 2023,
        paper: 'Paper 2',
        questionNumber: 'Q2',
        marks: 7,
        questionSnippet: 'Draw the logic circuit diagram corresponding to the Boolean expression: X = (A AND B) OR (NOT C). Construct its complete truth table.'
      }
    ],
    questionCount: 36,
    order: 1,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Swapping the output of NAND and NOR gates.',
      'Drawing OR gates without curved input tails, making them look like AND gates.'
    ],
    examTips: [
      'Number rows systematically from 000 up to 111 so no input combination is missed.'
    ]
  },

  // -------------------------------------------------------------
  // COMMERCIAL EDUCATION (TVEE) ACCOUNTING TOPICS
  // -------------------------------------------------------------
  {
    id: 'top_comm_financial_statements',
    subjectId: 'comm_al_acc',
    subjectName: 'Financial Accounting (ACC)',
    streamId: 'commercial',
    levelId: 'commercial_advanced',
    moduleId: 'mod_acc_double_entry',
    moduleTitle: 'Double-Entry Accounting & Financial Statements',
    topicName: 'Preparation of Final Accounts (Income Statement & Balance Sheet)',
    topicNameFr: 'Établissement des Comptes Annuels (Bilan et Compte de Résultat)',
    code: 'ACC-701-T1.1',
    description: 'Preparation of trading and profit & loss accounts (income statement) and statement of financial position (balance sheet), incorporating year-end adjustments: accruals, prepayments, bad debts, provision for doubtful debts, and depreciation methods (straight-line, reducing balance).',
    descriptionFr: 'Présentation des états financiers annuels selon les normes OHADA avec écritures de régularisation d\'inventaire.',
    subtopics: [
      { id: 'sub_acc_trial_bal', name: 'Trial Balance & Pre-Adjustment Verification', nameFr: 'Balance Avant Inventaire' },
      { id: 'sub_acc_adjustments', name: 'Year-End Adjustments (Accruals, Prepayments, Depreciation)', nameFr: 'Régularisations d\'Inventaire' },
      { id: 'sub_acc_income_stmt', name: 'Income Statement (Trading and Profit & Loss Account)', nameFr: 'Compte de Résultat' },
      { id: 'sub_acc_balance_sheet', name: 'Statement of Financial Position (Balance Sheet Assets & Equity)', nameFr: 'Bilan de Fin d\'Exercice' }
    ],
    learningObjectives: [
      'Record year-end adjustment entries in the journal with precise debit and credit postings.',
      'Calculate depreciation expense using straight-line and reducing-balance methods.',
      'Prepare a structured Income Statement showing Gross Profit, Operating Profit, and Net Profit.',
      'Draft a balanced Statement of Financial Position classifying non-current assets, current assets, non-current liabilities, and current liabilities.'
    ],
    importantConcepts: [
      'Accounting Equation: Assets = Liabilities + Capital',
      'Matching Principle (Accruals Concept)',
      'Prudence / Conservatism Principle'
    ],
    paperRelevance: ['Paper 1', 'Paper 2', 'Paper 3'],
    priority: 'CRITICAL',
    priorityScore: 93,
    prioritySource: 'SYSTEM',
    priorityReason: 'Core accounting competency responsible for over 35% of marks in GCE TVEE Commercial Paper 2 & Paper 3 practical examinations.',
    priorityBreakdown: {
      curriculumWeight: 96,
      gceFrequency: 95,
      gceMarksWeight: 94,
      paperCoverage: 95,
      prerequisiteImportance: 90
    },
    difficulty: 'Advanced',
    prerequisites: ['Ledger Accounts', 'Trial Balance'],
    estimatedStudyTimeMinutes: 200,
    pastQuestionCount: 10,
    pastQuestionsList: [
      {
        year: 2024,
        paper: 'Paper 2',
        questionNumber: 'Q1',
        marks: 25,
        questionSnippet: 'From the given adjusted trial balance of Kribi Traders Ltd as at 31 December 2023, prepare the Income Statement and the Statement of Financial Position.'
      }
    ],
    questionCount: 45,
    order: 1,
    status: 'active',
    isOfficialSyllabus: true,
    commonMistakes: [
      'Subtracting accrued expenses instead of adding them to the respective expense account.',
      'Treating provision for depreciation as an addition to asset cost instead of a contra-asset deduction.'
    ],
    examTips: [
      'Check that the final balance sheet balances exactly before moving on to the next question.'
    ]
  }
];
