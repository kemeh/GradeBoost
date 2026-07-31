import { QuestionEngineItem, EngineExam } from '../types';

export const SEED_QUESTIONS: QuestionEngineItem[] = [
  // 1. MCQ - Computer Science O Level
  {
    id: 'q-cs-ol-001',
    title: 'Von Neumann Architecture Components',
    questionNumber: 1,
    questionText: 'Which unit of the CPU is responsible for performing arithmetic operations such as addition, subtraction, and logical operations like AND, OR, NOT?',
    questionType: 'mcq',
    difficulty: 'Easy',
    marks: 1,
    estimatedTimeMinutes: 1,
    level: 'Ordinary Level',
    department: 'Science',
    subject: 'Computer Science',
    paper: 'Paper 1',
    topic: 'Computer Architecture',
    subtopic: 'Central Processing Unit (CPU)',
    examYear: 2024,
    session: 'June',
    instructions: 'Select the one best answer choice.',
    hints: ['Think of the unit specifically designed for Math and Logic.'],
    explanation: 'The Arithmetic Logic Unit (ALU) performs all mathematical calculations and decision-making logic operations inside the CPU.',
    reference: 'Cameroon GCE O-Level Computer Science 2024 P1 Q1',
    status: 'published',
    options: [
      { id: 'opt-a', label: 'A', text: 'Control Unit (CU)', isCorrect: false, explanation: 'CU manages and coordinates all CPU operations.' },
      { id: 'opt-b', label: 'B', text: 'Arithmetic Logic Unit (ALU)', isCorrect: true, explanation: 'Correct! The ALU performs arithmetic and logical comparisons.' },
      { id: 'opt-c', label: 'C', text: 'Memory Buffer Register (MBR)', isCorrect: false, explanation: 'MBR holds data read from or written to memory.' },
      { id: 'opt-d', label: 'D', text: 'Program Counter (PC)', isCorrect: false, explanation: 'PC holds the address of the next instruction to execute.' }
    ],
    createdAt: new Date().toISOString()
  },

  // 2. MCQ with Code Snippet - Computer Science A Level
  {
    id: 'q-cs-al-002',
    title: 'Python Array Manipulation Output',
    questionNumber: 2,
    questionText: 'Analyze the following Python snippet:\n```python\nnumbers = [5, 12, 19, 24, 30]\nresult = [x * 2 for x in numbers if x % 2 != 0]\nprint(result)\n```\nWhat will be printed to stdout when this code runs?',
    questionType: 'mcq',
    difficulty: 'Medium',
    marks: 2,
    estimatedTimeMinutes: 2,
    level: 'Advanced Level',
    department: 'Science',
    subject: 'Computer Science',
    paper: 'Paper 1',
    topic: 'Algorithms and Programming',
    subtopic: 'Python List Comprehensions',
    examYear: 2023,
    session: 'June',
    instructions: 'Examine the list comprehension carefully.',
    hints: ['Filter for odd numbers first, then multiply them by 2.'],
    explanation: 'The list comprehension filters odd numbers (5, 19), and multiplies each by 2 resulting in [10, 38].',
    reference: 'Cameroon GCE A-Level CS 2023 P1 Q14',
    status: 'published',
    mediaList: [
      {
        id: 'm-code-1',
        type: 'code',
        caption: 'Python Source Code',
        content: 'numbers = [5, 12, 19, 24, 30]\nresult = [x * 2 for x in numbers if x % 2 != 0]\nprint(result)'
      }
    ],
    options: [
      { id: 'opt-a', label: 'A', text: '[10, 24, 38, 48, 60]', isCorrect: false },
      { id: 'opt-b', label: 'B', text: '[10, 38]', isCorrect: true, explanation: 'Correct! 5 * 2 = 10, 19 * 2 = 38.' },
      { id: 'opt-c', label: 'C', text: '[24, 48, 60]', isCorrect: false },
      { id: 'opt-d', label: 'D', text: '[5, 19]', isCorrect: false }
    ],
    createdAt: new Date().toISOString()
  },

  // 3. Structured Question - Mathematics O Level
  {
    id: 'q-math-ol-003',
    title: 'Quadratic Equation & Roots',
    questionNumber: 1,
    questionText: 'Given the quadratic equation: $$2x^2 - 7x + 3 = 0$$\n\n(a) Calculate the discriminant of the quadratic equation.\n(b) Factorize the quadratic expression and solve for $x$.\n(c) State whether the roots are real, equal, or complex.',
    questionType: 'structured',
    difficulty: 'Medium',
    marks: 6,
    estimatedTimeMinutes: 6,
    level: 'Ordinary Level',
    department: 'Science',
    subject: 'Mathematics',
    paper: 'Paper 2',
    topic: 'Algebra',
    subtopic: 'Quadratic Equations',
    examYear: 2023,
    session: 'June',
    instructions: 'Show clear mathematical working for all sub-parts.',
    explanation: 'Discriminant = b^2 - 4ac = (-7)^2 - 4(2)(3) = 49 - 24 = 25. Factorization: (2x - 1)(x - 3) = 0 => x = 1/2 or x = 3.',
    reference: 'Cameroon GCE O-Level Math 2023 P2 Q1',
    status: 'published',
    markingScheme: {
      totalMarks: 6,
      modelAnswer: '(a) b^2 - 4ac = (-7)^2 - 4(2)(3) = 49 - 24 = 25.\n(b) (2x - 1)(x - 3) = 0 => x = 0.5 or x = 3.\n(c) Since Discriminant > 0, the roots are real and distinct.',
      marksAllocation: [
        { label: '(a)', description: 'Correct evaluation of discriminant (b^2 - 4ac = 25)', points: 2 },
        { label: '(b)', description: 'Correct factorization (2x - 1)(x - 3) and values x = 0.5, x = 3', points: 3 },
        { label: '(c)', description: 'Correct conclusion that roots are real and distinct', points: 1 }
      ],
      examinerNotes: 'Award full marks if correct method is shown even with minor arithmetic carry-through.'
    },
    createdAt: new Date().toISOString()
  },

  // 4. Programming Question - Computer Science A Level
  {
    id: 'q-cs-al-004',
    title: 'Binary Search Algorithm Implementation',
    questionNumber: 3,
    questionText: 'Write a function `binary_search(arr, target)` in Python that accepts a sorted array of integers `arr` and a `target` integer value. The function should return the 0-based index of `target` if present, or `-1` if not found.',
    questionType: 'programming',
    difficulty: 'Hard',
    marks: 10,
    estimatedTimeMinutes: 12,
    level: 'Advanced Level',
    department: 'Science',
    subject: 'Computer Science',
    paper: 'Paper 3',
    topic: 'Algorithms and Data Structures',
    subtopic: 'Searching Algorithms',
    examYear: 2024,
    session: 'June',
    instructions: 'Ensure logarithmic time complexity O(log N). Use a loop or recursion.',
    hints: ['Maintain low and high pointers.', 'mid = (low + high) // 2'],
    explanation: 'Binary search continuously halves the search interval until target is matched or boundaries cross.',
    reference: 'Cameroon GCE A-Level CS Practical 2024 P3',
    status: 'published',
    programmingData: {
      language: 'python',
      starterCode: 'def binary_search(arr, target):\n    # Write your solution here\n    low = 0\n    high = len(arr) - 1\n    pass\n',
      solutionCode: 'def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n',
      inputSample: 'arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23',
      outputSample: '5',
      expectedResult: 'Index 5',
      sampleTests: [
        { input: '[2, 5, 8, 12, 16, 23, 38], 23', output: '5', description: 'Element in middle' },
        { input: '[1, 3, 5, 7, 9], 1', output: '0', description: 'Element at start' },
        { input: '[10, 20, 30], 40', output: '-1', description: 'Element not present' }
      ],
      markingGuide: 'Award 3 marks for pointers setup, 4 marks for while condition and mid calculation, 3 marks for boundary shifts and return values.'
    },
    createdAt: new Date().toISOString()
  },

  // 5. Fill in the Blanks - Chemistry O Level
  {
    id: 'q-chem-ol-005',
    title: 'Periodic Table & Atomic Structure',
    questionNumber: 4,
    questionText: 'Complete the following statements about atomic structure:\n\n1. The subatomic particle with a positive charge located in the nucleus is the [[1]].\n2. Isotopes are atoms of the same element having the same number of [[2]] but a different number of [[3]].',
    questionType: 'fill_in_blanks',
    difficulty: 'Easy',
    marks: 3,
    estimatedTimeMinutes: 3,
    level: 'Ordinary Level',
    department: 'Science',
    subject: 'Chemistry',
    paper: 'Paper 1',
    topic: 'Atomic Structure',
    subtopic: 'Subatomic Particles',
    examYear: 2022,
    session: 'June',
    instructions: 'Fill in the precise chemical terms in each blank.',
    explanation: 'Protons have +1 charge in the nucleus. Isotopes share proton count (atomic number) but differ in neutron count.',
    reference: 'Cameroon GCE O-Level Chemistry 2022',
    status: 'published',
    blanks: [
      { index: 1, acceptedAnswers: ['proton', 'protons'], caseSensitive: false },
      { index: 2, acceptedAnswers: ['proton', 'protons'], caseSensitive: false },
      { index: 3, acceptedAnswers: ['neutron', 'neutrons'], caseSensitive: false }
    ],
    createdAt: new Date().toISOString()
  },

  // 6. Matching Question - Economics A Level
  {
    id: 'q-econ-al-006',
    title: 'Market Structures and Features',
    questionNumber: 5,
    questionText: 'Match each Market Structure on the left with its defining characteristic on the right.',
    questionType: 'matching',
    difficulty: 'Medium',
    marks: 4,
    estimatedTimeMinutes: 4,
    level: 'Advanced Level',
    department: 'Commercial',
    subject: 'Economics',
    paper: 'Paper 1',
    topic: 'Market Structures',
    subtopic: 'Monopoly & Perfect Competition',
    examYear: 2023,
    session: 'June',
    instructions: 'Pair each left item to the corresponding right item.',
    explanation: 'Perfect competition has homogenous products, monopoly has a single seller, oligopoly is dominated by a few large firms, and monopolistic competition features product differentiation.',
    reference: 'Cameroon GCE A-Level Economics 2023',
    status: 'published',
    matchingPairs: [
      { id: 'm-1', left: 'Perfect Competition', right: 'Large number of buyers and sellers with identical/homogenous products' },
      { id: 'm-2', left: 'Monopoly', right: 'Single seller controlling price with high entry barriers' },
      { id: 'm-3', left: 'Oligopoly', right: 'Market dominated by a few interdependent large firms' },
      { id: 'm-4', left: 'Monopolistic Competition', right: 'Many sellers producing differentiated products with free entry' }
    ],
    createdAt: new Date().toISOString()
  },

  // 7. True/False - Physics A Level
  {
    id: 'q-phys-al-007',
    title: 'Newtonian Physics & Momentum Conservation',
    questionNumber: 6,
    questionText: 'Statement: "In an inelastic collision between two isolated objects, total linear momentum is conserved, but total kinetic energy is NOT conserved."',
    questionType: 'true_false',
    difficulty: 'Medium',
    marks: 2,
    estimatedTimeMinutes: 2,
    level: 'Advanced Level',
    department: 'Science',
    subject: 'Physics',
    paper: 'Paper 1',
    topic: 'Mechanics',
    subtopic: 'Collisions and Momentum',
    examYear: 2024,
    session: 'June',
    instructions: 'Indicate whether the statement is True or False.',
    explanation: 'True! In any isolated system, linear momentum is conserved during collisions. However, in inelastic collisions, kinetic energy is partially converted into heat, sound, or deformation energy.',
    reference: 'Cameroon GCE A-Level Physics 2024 P1',
    status: 'published',
    trueFalseAnswer: true,
    trueFalseJustificationRequired: false,
    createdAt: new Date().toISOString()
  },

  // 8. Essay Question - History O Level
  {
    id: 'q-hist-ol-008',
    title: 'Causes of World War I in Cameroon Context',
    questionNumber: 7,
    questionText: 'Examine five major factors that led to the outbreak of the First World War in 1914, and discuss the immediate impact of the war on Kamerun under German rule.',
    questionType: 'essay',
    difficulty: 'Hard',
    marks: 20,
    estimatedTimeMinutes: 25,
    level: 'Ordinary Level',
    department: 'Arts',
    subject: 'History',
    paper: 'Paper 2',
    topic: 'World History and Cameroon Colonial History',
    subtopic: 'First World War in Kamerun',
    examYear: 2023,
    session: 'June',
    instructions: 'Write a detailed essay structured with introduction, main paragraphs, and conclusion.',
    explanation: 'Key factors include Militarism, Alliances, Imperialism, Nationalism (MAIN), and the Assassination of Archduke Franz Ferdinand. In Kamerun, the Anglo-French campaign ousted German colonial administration by 1916.',
    reference: 'Cameroon GCE O-Level History Paper 2 2023',
    status: 'published',
    markingScheme: {
      totalMarks: 20,
      modelAnswer: 'Introduction: Define WWI timeline (1914-1918) and German Kamerun background.\nBody 1: Militarism & Arms Race (naval competition between Britain and Germany).\nBody 2: Alliance System (Triple Entente vs Triple Alliance).\nBody 3: Imperial rivalry over African territories.\nBody 4: Nationalism in Balkan region.\nBody 5: Spark - Assassination in Sarajevo.\nImpact on Kamerun: 1914-1916 Allied invasion, displacement of native Cameroonians, fall of Yaounde, and 1916 Anglo-French partition.',
      marksAllocation: [
        { label: 'Introduction', description: 'Clear thesis statement and context setting', points: 2 },
        { label: 'Causes of WWI', description: 'Detailed analysis of 5 MAIN causes (2 marks each)', points: 10 },
        { label: 'Impact on Kamerun', description: 'Detailed discussion of Allied campaign & German defeat', points: 6 },
        { label: 'Conclusion', description: 'Summary synthesis of historical significance', points: 2 }
      ],
      examinerNotes: 'Reward original historical dates and names of military commanders (e.g. Gen. Dobell, Carl Zimmermann).'
    },
    createdAt: new Date().toISOString()
  }
];

export const SEED_EXAMS: EngineExam[] = [
  {
    id: 'exam-cs-ol-mock-1',
    title: 'O Level Computer Science Paper 1 Full Mock 2024',
    description: 'Comprehensive 50-question practice mock exam covering Computer Systems, Logic Gates, Hardware, Networks, and Software according to Cameroon GCE Syllabus.',
    academicLevel: 'Ordinary Level',
    department: 'Science',
    subject: 'Computer Science',
    paper: 'Paper 1',
    examType: 'mock',
    durationMinutes: 90,
    passingScorePercent: 60,
    questionOrder: 'random',
    shuffleOptions: true,
    negativeMarking: false,
    retakesAllowed: true,
    maxRetakes: -1,
    showAnswers: 'after_submission',
    showExplanations: true,
    showResultsImmediately: true,
    allowCalculator: false,
    questions: [
      { questionId: 'q-cs-ol-001', order: 1, marks: 1 },
      { questionId: 'q-cs-al-002', order: 2, marks: 2 },
      { questionId: 'q-chem-ol-005', order: 3, marks: 3 },
      { questionId: 'q-phys-al-007', order: 4, marks: 2 }
    ],
    status: 'published',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exam-cs-al-paper3-practical',
    title: 'A Level Computer Science Paper 3 Programming Practical',
    description: 'Practical programming examination assessing algorithm design, pseudo-code analysis, Python data structure implementations, and code optimization.',
    academicLevel: 'Advanced Level',
    department: 'Science',
    subject: 'Computer Science',
    paper: 'Paper 3',
    examType: 'past_paper',
    durationMinutes: 120,
    passingScorePercent: 50,
    questionOrder: 'fixed',
    shuffleOptions: false,
    negativeMarking: false,
    retakesAllowed: true,
    maxRetakes: 5,
    showAnswers: 'after_submission',
    showExplanations: true,
    showResultsImmediately: true,
    allowCalculator: true,
    questions: [
      { questionId: 'q-cs-al-004', order: 1, marks: 10 }
    ],
    status: 'published',
    createdAt: new Date().toISOString()
  }
];
