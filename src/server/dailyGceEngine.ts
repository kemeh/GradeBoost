/**
 * Edulpha — Daily GCE Question Engine
 * Past Papers + Mock Examinations + Daily Practice
 * 
 * Complies with official Cameroon General Certificate of Education (GCE) standards:
 * - Ordinary Level (Paper 1 MCQ, Paper 2 Structured/Theory)
 * - Advanced Level (Paper 1 MCQ, Paper 2 Structured/Theory, Paper 3 Practical/Application)
 * - Strict source attribution (PAST_GCE, AI_GENERATED_GCE_STYLE, EDULPHA_CURRICULUM, REVISION)
 * - Auto-marking & AI-assisted evaluation with educational feedback
 */

export interface SubjectGceStructure {
  name: string;
  ordinaryLevel: {
    paper1: { type: 'mcq'; defaultMarks: number; durationMinutes: number; description: string };
    paper2: { type: 'structured'; defaultMarks: number; durationMinutes: number; description: string };
  };
  advancedLevel: {
    paper1: { type: 'mcq'; defaultMarks: number; durationMinutes: number; description: string };
    paper2: { type: 'structured'; defaultMarks: number; durationMinutes: number; description: string };
    paper3?: { type: 'practical'; defaultMarks: number; durationMinutes: number; description: string; tasks: string[] };
  };
}

export const GCE_SUBJECT_STRUCTURES: Record<string, SubjectGceStructure> = {
  'Computer Science': {
    name: 'Computer Science',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions covering core IT concepts, computer fundamentals, and arithmetic.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Structured problems on Hardware, Software, Networks, Basic Algorithms, and Logic.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 High-level Multiple Choice Questions covering Architecture, Networks, OS, and Data Structures.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'In-depth Problem-Solving: Data Structures, Algorithms, Systems Architecture, and Database Design.' },
      paper3: { 
        type: 'practical', 
        defaultMarks: 100, 
        durationMinutes: 180, 
        description: 'Applied Practical Paper: Programming (C, Python, Java), Database Implementation (SQL), and Algorithm Trace.',
        tasks: ['Programming Code Implementation', 'Relational Database & SQL', 'Algorithm Flow & Data Processing', 'Troubleshooting & Trace Tables']
      },
    },
  },
  'Mathematics': {
    name: 'Mathematics',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Objective Multiple Choice Questions on Algebra, Geometry, Statistics, and Trigonometry.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 150, description: 'Structured questions with step-by-step working: Equations, Geometry, Calculus basics, Graphs.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Rigorous Multiple Choice Questions across Pure Maths, Mechanics, and Probability.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Pure Mathematics: Complex Numbers, Differential Equations, Vectors, Matrices, and Series.' },
      paper3: { 
        type: 'practical', 
        defaultMarks: 100, 
        durationMinutes: 180, 
        description: 'Applied Mathematics: Mechanics, Numerical Methods, and Probability Distributions.',
        tasks: ['Kinematics & Dynamics Calculations', 'Numerical Iteration & Interpolation', 'Probability Models & Hypothesis Testing']
      },
    },
  },
  'Physics': {
    name: 'Physics',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions across Mechanics, Thermal Physics, Waves, and Electricity.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Theory and calculations: Motion, Energy, Optics, Circuits, and Radioactivity.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Advanced Multiple Choice Questions test deep physical intuition and dimensional analysis.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Comprehensive Theory: Gravitation, Thermodynamics, Electromagnetic Induction, Quantum Physics.' },
      paper3: { 
        type: 'practical', 
        defaultMarks: 50, 
        durationMinutes: 150, 
        description: 'Experimental Interpretation, Graphical Analysis, Error Estimation, and Apparatus Design.',
        tasks: ['Apparatus & Circuit Design', 'Graph Interpretation & Gradient Analysis', 'Uncertainty & Error Analysis']
      },
    },
  },
  'Chemistry': {
    name: 'Chemistry',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on General, Inorganic, and Basic Organic Chemistry.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Structured Chemical Reactions, Stoichiometry, Bonding, and Industrial Extraction.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions across Physical, Inorganic, and Organic Chemistry.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Physical & Organic Mechanisms: Reaction Kinetics, Thermodynamics, Arenes, Carbonyls, Equilibria.' },
      paper3: { 
        type: 'practical', 
        defaultMarks: 50, 
        durationMinutes: 150, 
        description: 'Quantitative Analysis (Volumetric Titration) & Qualitative Inorganic/Organic Identification.',
        tasks: ['Volumetric Titration Calculations', 'Cation & Anion Tests', 'Organic Functional Group Identification']
      },
    },
  },
  'Biology': {
    name: 'Biology',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Plant/Animal Physiology, Ecology, and Cell Biology.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Structured Biological Questions, Anatomical Diagrams, Genetics, and Human Systems.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Molecular Biology, Biochemistry, Evolution, and Physiology.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Structured Essays: Cellular Respiration, Photosynthesis, Genetics, Immunology, and Homeostasis.' },
      paper3: { 
        type: 'practical', 
        defaultMarks: 50, 
        durationMinutes: 150, 
        description: 'Practical Examination: Biological drawings, Food tests, Enzyme kinetics, and Microscopic specimens.',
        tasks: ['High-Power Biological Drawing', 'Biochemical Food Tests', 'Enzyme Rate Experiment Analysis']
      },
    },
  },
  'ICT': {
    name: 'ICT',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Office Tools, Networks, Security, and Computer Systems.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Written Theory on Data Processing, Information Systems, and Societal Impact.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Enterprise Systems, Telecommunications, and Multimedia.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Information Systems, System Development Life Cycle (SDLC), Project Management, and Security.' },
      paper3: { 
        type: 'practical', 
        defaultMarks: 100, 
        durationMinutes: 180, 
        description: 'Practical ICT Application: Database Design (Access/SQL), Spreadsheet Modeling (Excel), and Web Publishing.',
        tasks: ['Relational Database Queries & Forms', 'Spreadsheet Financial/Statistical Modeling', 'Web Page HTML/CSS Development']
      },
    },
  },
  'Economics': {
    name: 'Economics',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Price Theory, Production, Banking, and International Trade.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Structured Data Response and Essay questions on Economic Systems and Fiscal Policy.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions covering Microeconomics and Macroeconomics.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Data Response and Essays: Market Failure, National Income, Monetary Policy, and Development Economics.' },
    },
  },
  'Geography': {
    name: 'Geography',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Physical, Human, and Regional Geography.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Map Reading, Geomorphology, Climatology, Population, and Economic Activities.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Global Climates, Biomes, Settlement, and Trade.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Physical & Human Geography: Hydrology, Plate Tectonics, Migration, and Urban Dynamics.' },
      paper3: {
        type: 'practical',
        defaultMarks: 80,
        durationMinutes: 150,
        description: 'Map Analysis, Cartographic Techniques, Statistical Fieldwork Analysis.',
        tasks: ['Topographic Map Cross-Section & Gradient', 'Fieldwork Data Interpretation', 'Climatic Graph Analysis']
      }
    },
  },
  'History': {
    name: 'History',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Cameroon History, Africa, and World Revolutions.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Essays on Cameroon Colonial Administration, Reunification, and International Conflicts.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions covering 19th and 20th Century Cameroon and World History.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Cameroon History since 1884: Protectorate, Mandate, Trusteeship, Independence, and Reunification.' },
      paper3: {
        type: 'practical',
        defaultMarks: 100,
        durationMinutes: 180,
        description: 'World History since 1870: Alliances, World Wars, League of Nations, Cold War, and Decolonization.',
        tasks: ['Historical Document Critique', 'Comparative Treaty Analysis', 'Diplomatic Crisis Evaluation']
      }
    },
  },
  'English Language': {
    name: 'English Language',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Lexis, Structure, Grammar, and Reading Comprehension.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Continuous Writing (Composition), Summary Writing, and Reading Comprehension.' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions evaluating Advanced Reading, Idioms, Phonetics, and Register.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Reading Comprehension, Summary, Prescribed Essay Writing, and Usage.' },
    },
  },
  'French': {
    name: 'French',
    ordinaryLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on French Grammar, Conjugation, Vocabulary, and Comprehension.' },
      paper2: { type: 'structured', defaultMarks: 80, durationMinutes: 120, description: 'Production Écrite, Compréhension de Texte, and Translation (Thème & Version).' },
    },
    advancedLevel: {
      paper1: { type: 'mcq', defaultMarks: 50, durationMinutes: 90, description: '50 Multiple Choice Questions on Advanced Syntax, Idiomatic Expressions, and Literature excerpts.' },
      paper2: { type: 'structured', defaultMarks: 100, durationMinutes: 180, description: 'Essai Argumentatif, Résumé de Texte, and Traduction Avancée.' },
    },
  }
};

/**
 * Paper rotation schedule for the week.
 * Ensures balanced preparation across Paper 1, Paper 2, and Paper 3.
 */
export function getScheduledPaperForDay(
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  subject: string,
  level: 'Ordinary Level' | 'Advanced Level'
): 'Paper 1' | 'Paper 2' | 'Paper 3' {
  const struct = GCE_SUBJECT_STRUCTURES[subject];
  const hasPaper3 = level === 'Advanced Level' && !!struct?.advancedLevel?.paper3;

  switch (dayOfWeek) {
    case 1: // Monday: Paper 1 (MCQ Foundation)
      return 'Paper 1';
    case 2: // Tuesday: Paper 2 (Deep Structured / Calculation)
      return 'Paper 2';
    case 3: // Wednesday: Paper 3 if available, otherwise Paper 1
      return hasPaper3 ? 'Paper 3' : 'Paper 1';
    case 4: // Thursday: Paper 1 (Timed speed & syllabus recall)
      return 'Paper 1';
    case 5: // Friday: Paper 2 (Theory / Essay / Problem Solving)
      return 'Paper 2';
    case 6: // Saturday: Paper 3 if available, otherwise Paper 2
      return hasPaper3 ? 'Paper 3' : 'Paper 2';
    case 0: // Sunday: Paper 2 or Paper 1 revision
    default:
      return 'Paper 1';
  }
}

/**
 * Curated Cameroon GCE questions bank fallback
 * Ensures instant, 100% accurate GCE syllabus questions even when offline or AI rate-limited.
 */
export const CURATED_GCE_QUESTIONS: Record<string, any[]> = {
  'Computer Science_Advanced Level_Paper 2': [
    {
      questionText: 'A school records examination scores using an un-normalized flat file with fields: (StudentID, StudentName, Class, SubjectCode, SubjectName, TeacherID, TeacherName, Score).',
      topic: 'Database & Normalization',
      subtopic: 'Relational Database Design',
      marks: 17,
      difficulty: 'GCE Standard',
      subparts: [
        {
          id: 'sp_1',
          label: '(a)',
          text: 'Explain why data redundancy is problematic in the current flat-file design, giving two concrete examples of anomalies that may occur.',
          marks: 4
        },
        {
          id: 'sp_2',
          label: '(b)',
          text: 'State the formal definition of Third Normal Form (3NF).',
          marks: 3
        },
        {
          id: 'sp_3',
          label: '(c)',
          text: 'Decompose the flat file into a set of 3NF relational tables. For each table, clearly underline the Primary Key and indicate any Foreign Keys with an asterisk (*).',
          marks: 6
        },
        {
          id: 'sp_4',
          label: '(d)',
          text: 'Write an SQL statement to retrieve the StudentName and Score for all students taking "Computer Science" who scored greater than 70 marks, ordered alphabetically by StudentName.',
          marks: 4,
          codeSnippet: '-- Write ANSI SQL statement here'
        }
      ],
      modelAnswer: {
        expectedAnswer: 'Detailed 3NF decomposition separating STUDENTS, SUBJECTS, TEACHERS, and ENROLLMENTS.',
        markingPoints: [
          { point: 'Explaining Insertion and Deletion anomalies clearly', marks: 4 },
          { point: 'Definition of 3NF (in 2NF and has no transitive dependencies)', marks: 3 },
          { point: 'STUDENT(StudentID, StudentName, Class), SUBJECT(SubjectCode, SubjectName, TeacherID*), TEACHER(TeacherID, TeacherName), EXAM_RESULT(StudentID*, SubjectCode*, Score)', marks: 6 },
          { point: 'SELECT s.StudentName, r.Score FROM STUDENT s JOIN EXAM_RESULT r ON s.StudentID = r.StudentID JOIN SUBJECT sub ON r.SubjectCode = sub.SubjectCode WHERE sub.SubjectName = "Computer Science" AND r.Score > 70 ORDER BY s.StudentName ASC;', marks: 4 }
        ],
        explanation: 'Relational database normalization is a cornerstone of Cameroon GCE Computer Science Paper 2.',
        examTip: 'Always underline primary keys and identify foreign keys explicitly when presenting normalized relational schemas.'
      }
    },
    {
      questionText: 'Consider the following Binary Search Tree (BST) operations and algorithm design principles.',
      topic: 'Data Structures and Algorithms',
      subtopic: 'Trees and Recursion',
      marks: 17,
      subparts: [
        {
          id: 'sp_1',
          label: '(a)',
          text: 'Define a Binary Search Tree and distinguish between a complete binary tree and a balanced binary tree.',
          marks: 4
        },
        {
          id: 'sp_2',
          label: '(b)',
          text: 'Given the sequence of numbers [45, 12, 67, 34, 89, 23, 56, 78], draw the resulting Binary Search Tree after inserting all elements in the given order.',
          marks: 5
        },
        {
          id: 'sp_3',
          label: '(c)',
          text: 'Write down the In-Order, Pre-Order, and Post-Order traversals of the tree constructed in (b).',
          marks: 4
        },
        {
          id: 'sp_4',
          label: '(d)',
          text: 'State the average and worst-case time complexity of searching for an item in a BST, and explain how an AVL tree prevents worst-case degeneration.',
          marks: 4
        }
      ],
      modelAnswer: {
        expectedAnswer: 'A BST is a binary tree where left child < parent <= right child. Traversals and time complexity O(log n) vs O(n).',
        markingPoints: [
          { point: 'BST Definition & distinction (complete vs balanced)', marks: 4 },
          { point: 'Accurate BST diagram showing root 45', marks: 5 },
          { point: 'In-order traversal yielding sorted order: 12, 23, 34, 45, 56, 67, 78, 89', marks: 4 },
          { point: 'Average O(log n), worst O(n) when degenerates to linked list. AVL uses rotations.', marks: 4 }
        ],
        explanation: 'Trees represent non-linear hierarchical data structures widely tested in Section B of Paper 2.',
        examTip: 'Remember that an In-Order traversal of any valid BST must always yield the keys in ascending sorted order.'
      }
    }
  ],
  'Computer Science_Advanced Level_Paper 3': [
    {
      questionText: 'PRACTICAL TASK: You are required to implement a robust student records management module using Python, C, or Java.',
      topic: 'Programming & Data Structures',
      subtopic: 'Practical Coding Implementation',
      marks: 25,
      difficulty: 'GCE Standard',
      programmingData: {
        language: 'python',
        starterCode: `# Cameroon GCE A-Level Computer Science Paper 3 Practical
# Task: Complete the StudentGradeTracker class

class StudentGradeTracker:
    def __init__(self):
        self.students = {}  # { student_id: [scores] }

    def add_score(self, student_id: str, score: float):
        # TODO: Implement score validation (0 to 100) and storage
        pass

    def compute_average(self, student_id: str) -> float:
        # TODO: Return average score or 0.0 if not found
        pass

    def get_letter_grade(self, average: float) -> str:
        # GCE Scale: >= 80: 'A', >= 70: 'B', >= 60: 'C', >= 50: 'D', >= 40: 'E', else 'F'
        pass
`
      },
      subparts: [
        {
          id: 'sp_1',
          label: 'Task 1',
          text: 'Implement input validation in add_score ensuring score is between 0.0 and 100.0, handling invalid inputs with appropriate error handling.',
          marks: 7
        },
        {
          id: 'sp_2',
          label: 'Task 2',
          text: 'Implement compute_average returning the arithmetic mean rounded to 2 decimal places.',
          marks: 8
        },
        {
          id: 'sp_3',
          label: 'Task 3',
          text: 'Implement get_letter_grade following the official Cameroon GCE A-Level grading scale (A, B, C, D, E, F).',
          marks: 10
        }
      ],
      modelAnswer: {
        codeSolution: `class StudentGradeTracker:
    def __init__(self):
        self.students = {}

    def add_score(self, student_id: str, score: float):
        if not (0.0 <= score <= 100.0):
            raise ValueError("Score must be between 0 and 100")
        if student_id not in self.students:
            self.students[student_id] = []
        self.students[student_id].append(score)

    def compute_average(self, student_id: str) -> float:
        if student_id not in self.students or not self.students[student_id]:
            return 0.0
        scores = self.students[student_id]
        return round(sum(scores) / len(scores), 2)

    def get_letter_grade(self, average: float) -> str:
        if average >= 80.0:
            return 'A'
        elif average >= 70.0:
            return 'B'
        elif average >= 60.0:
            return 'C'
        elif average >= 50.0:
            return 'D'
        elif average >= 40.0:
            return 'E'
        else:
            return 'F'`,
        explanation: 'Tests object-oriented programming, data validation, and aggregation operations required for Paper 3.',
        examTip: 'Always handle edge cases such as empty lists or missing keys to avoid runtime exceptions.'
      }
    }
  ],
  'Mathematics_Advanced Level_Paper 2': [
    {
      questionText: 'Solve the following Pure Mathematics calculus and differential equation problems with clear, systematic working.',
      topic: 'Calculus & Differential Equations',
      subtopic: 'First Order Ordinary Differential Equations',
      marks: 15,
      difficulty: 'GCE Standard',
      subparts: [
        {
          id: 'sp_1',
          label: '(a)',
          text: 'Find the general solution of the differential equation: (x + 1) dy/dx + 2y = (x + 1)^3, for x > -1.',
          marks: 8
        },
        {
          id: 'sp_2',
          label: '(b)',
          text: 'Given the initial boundary condition y(0) = 1, determine the exact particular solution.',
          marks: 4
        },
        {
          id: 'sp_3',
          label: '(c)',
          text: 'Evaluate the value of y when x = 1.',
          marks: 3
        }
      ],
      modelAnswer: {
        formula: 'dy/dx + P(x)y = Q(x) with Integrating Factor I(x) = e^(int P(x) dx)',
        working: `1. Standard form: dy/dx + (2/(x+1))y = (x+1)^2
2. Integrating factor: I(x) = e^(int 2/(x+1) dx) = e^(2 ln(x+1)) = (x+1)^2
3. Multiply throughout: (x+1)^2 dy/dx + 2(x+1)y = (x+1)^4
4. Integrate: d/dx [y(x+1)^2] = (x+1)^4 => y(x+1)^2 = (x+1)^5 / 5 + C
5. General solution: y = (x+1)^3 / 5 + C / (x+1)^2
6. Apply y(0) = 1: 1 = (1)/5 + C => C = 4/5
7. Particular solution: y = (x+1)^3 / 5 + 4 / (5(x+1)^2)
8. At x = 1: y = (2)^3 / 5 + 4 / (5 * 4) = 8/5 + 1/5 = 9/5 = 1.8`,
        finalAnswer: 'y = (x+1)^3 / 5 + 4 / (5(x+1)^2); at x = 1, y = 1.8',
        markingPoints: [
          { point: 'Deriving correct Integrating Factor (x+1)^2', marks: 3 },
          { point: 'Integrating (x+1)^4 to get (x+1)^5 / 5 + C', marks: 3 },
          { point: 'Stating correct general solution', marks: 2 },
          { point: 'Calculating integration constant C = 4/5', marks: 4 },
          { point: 'Substituting x = 1 to find y = 9/5', marks: 3 }
        ],
        explanation: 'Linear first-order differential equations are standard compulsory questions in Cameroon GCE A-Level Mathematics Paper 2.',
        examTip: 'Never forget the constant of integration C when evaluating indefinite integrals with an integrating factor.'
      }
    }
  ],
  'Physics_Advanced Level_Paper 2': [
    {
      questionText: 'A parallel plate capacitor consists of two circular plates each of radius 10 cm separated by a dielectric sheet of relative permittivity 4.5 and thickness 0.8 mm.',
      topic: 'Electricity & Capacitance',
      subtopic: 'Capacitors and Energy Storage',
      marks: 14,
      difficulty: 'GCE Standard',
      subparts: [
        {
          id: 'sp_1',
          label: '(a)',
          text: 'Define the capacitance of a capacitor and state its SI unit.',
          marks: 2
        },
        {
          id: 'sp_2',
          label: '(b)',
          text: 'Calculate the area of the circular plates and determine the capacitance of the capacitor. (Take epsilon_0 = 8.85 x 10^-12 F/m).',
          marks: 5
        },
        {
          id: 'sp_3',
          label: '(c)',
          text: 'If the capacitor is connected across a 120 V direct current power supply, calculate: (i) the charge stored on the plates, (ii) the electrostatic energy stored in the electric field.',
          marks: 4
        },
        {
          id: 'sp_4',
          label: '(d)',
          text: 'Explain what happens to the stored energy if the dielectric is carefully removed while the capacitor remains connected to the 120 V supply.',
          marks: 3
        }
      ],
      modelAnswer: {
        formula: 'C = (epsilon_r * epsilon_0 * A) / d; Q = C * V; U = 0.5 * C * V^2',
        working: `1. Area A = pi * r^2 = pi * (0.10 m)^2 = 0.03142 m^2
2. Capacitance C = (4.5 * 8.85e-12 * 0.03142) / (0.8e-3) = 1.564 x 10^-9 F = 1.56 nF
3. Charge Q = C * V = 1.564e-9 * 120 = 1.88 x 10^-7 C
4. Energy U = 0.5 * C * V^2 = 0.5 * 1.564e-9 * 14400 = 1.13 x 10^-5 J
5. Removing dielectric decreases capacitance by factor of 4.5. Since V is constant, U = 0.5 * C * V^2 decreases by a factor of 4.5.`,
        finalAnswer: 'C = 1.56 nF; Q = 1.88 x 10^-7 C; U = 1.13 x 10^-5 J',
        markingPoints: [
          { point: 'Definition: Ratio of charge Q to potential difference V (Farad)', marks: 2 },
          { point: 'Area calculation (0.0314 m^2) and C = 1.56 nF', marks: 5 },
          { point: 'Q = 1.88 x 10^-7 C and U = 1.13 x 10^-5 J with units', marks: 4 },
          { point: 'Energy decreases because C decreases while V remains constant', marks: 3 }
        ],
        explanation: 'Tests electrostatic relations, dielectric effects, and energy storage formulas in A-Level Physics.',
        examTip: 'Note whether the power supply is disconnected (Q remains constant) or connected (V remains constant) before analyzing dielectric changes.'
      }
    }
  ]
};

/**
 * Standard prompt builder for generating Cameroon GCE style questions with Gemini
 */
export function buildGceQuestionPrompt(params: {
  subject: string;
  level: 'Ordinary Level' | 'Advanced Level';
  paper: 'Paper 1' | 'Paper 2' | 'Paper 3';
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  language?: 'en' | 'fr';
  questionType?: string;
}) {
  const isFrench = params.language === 'fr';
  const levelText = params.level === 'Ordinary Level' ? 'Cameroon GCE Ordinary Level' : 'Cameroon GCE Advanced Level';

  return `You are a Senior Chief Examiner for the Cameroon General Certificate of Education (GCE) Board.
Generate ONE pristine, curriculum-standard examination question for:
- Examination: ${levelText}
- Subject: ${params.subject}
- Paper: ${params.paper}
${params.topic ? `- Topic: ${params.topic}` : ''}
${params.subtopic ? `- Subtopic: ${params.subtopic}` : ''}
- Target Difficulty: ${params.difficulty || 'GCE Standard'}
- Language: ${isFrench ? 'French' : 'English'}

CRITICAL EXAMINATION RULES:
1. Conform STRICTLY to the actual Cameroon GCE paper specification:
   - Paper 1: Multiple Choice Question (MCQ). Must have exactly 4 choices (A, B, C, D) and exactly 1 unambiguously correct option.
   - Paper 2: Structured question with lettered subparts (a), (b), (c), etc., with explicit marks per subpart.
   - Paper 3 (if applicable): Practical, applied problem solving, code snippet, experimental analysis, or data task.
2. Marks:
   - For Paper 1: exactly 1 mark.
   - For Paper 2 / Paper 3: total marks must equal the sum of subparts (typically 12 to 20 marks total).
3. Do NOT claim this question is from a specific past year (e.g. "2024 GCE"). Label internal source as "AI_GENERATED_GCE_STYLE".
4. Provide a full, separate Model Answer and Marking Scheme.

OUTPUT JSON FORMAT (Respond ONLY with valid JSON):
{
  "questionText": "Main introductory prompt or question context",
  "questionType": "${params.paper === 'Paper 1' ? 'mcq' : (params.paper === 'Paper 3' && params.subject.includes('Computer') ? 'programming' : 'structured')}",
  "topic": "${params.topic || 'Core Syllabus'}",
  "subtopic": "${params.subtopic || 'General'}",
  "difficulty": "${params.difficulty || 'GCE Standard'}",
  "marks": ${params.paper === 'Paper 1' ? 1 : 15},
  "options": {
    "A": "Option A",
    "B": "Option B",
    "C": "Option C",
    "D": "Option D"
  },
  "subparts": [
    {
      "id": "sp_1",
      "label": "(a)",
      "text": "Sub-question prompt",
      "marks": 5,
      "codeSnippet": "// optional code snippet if relevant"
    }
  ],
  "programmingData": {
    "language": "python",
    "starterCode": "# optional starter code if Paper 3 programming"
  },
  "modelAnswer": {
    "correctOption": "A",
    "expectedAnswer": "Comprehensive model answer",
    "markingPoints": [
      { "point": "Criteria for award of marks", "marks": 2 }
    ],
    "formula": "Key formulas applied",
    "working": "Step by step working",
    "finalAnswer": "Final answer with units",
    "codeSolution": "Complete code solution if programming",
    "explanation": "Pedagogical explanation of why this answer is correct",
    "examTip": "Official GCE examiner advice for candidates"
  }
}`;
}

/**
 * Standard prompt for evaluating student answer with AI assistance
 */
export function buildAnswerEvaluationPrompt(params: {
  subject: string;
  level: string;
  paper: string;
  questionText: string;
  studentAnswer: string;
  maxMarks: number;
  modelAnswer: any;
  subparts?: any[];
}) {
  return `You are a Senior Cameroon GCE Board Assistant Examiner marking a candidate's answer.
Subject: ${params.subject}
Level: ${params.level}
Paper: ${params.paper}

QUESTION:
${params.questionText}

EXPECTED MODEL ANSWER & MARKING POINTS:
${JSON.stringify(params.modelAnswer, null, 2)}
${params.subparts ? `SUBPARTS:\n${JSON.stringify(params.subparts, null, 2)}` : ''}

CANDIDATE'S SUBMISSION:
${params.studentAnswer}

MAXIMUM MARKS AVAILABLE: ${params.maxMarks}

TASK:
Evaluate the candidate's answer with fairness, rigor, and pedagogical encouragement.
- Award marks strictly based on the marking points achieved.
- Score cannot exceed ${params.maxMarks} or be less than 0.
- If score == ${params.maxMarks}, status = "correct".
- If score > 0 but < ${params.maxMarks}, status = "partially_correct".
- If score == 0, status = "incorrect".

Respond ONLY in valid JSON format:
{
  "score": 0,
  "maxMarks": ${params.maxMarks},
  "status": "correct|partially_correct|incorrect",
  "whatWasCorrect": "Specific concepts, formulas, or working the student executed well",
  "whatWasMissing": "Key marking points, steps, units, or explanations omitted",
  "correction": "Model corrections and proper terminology",
  "explanation": "Clear educational explanation of the topic",
  "examTip": "GCE examiner tip to score full marks in the national exam"
}`;
}
