import { processAccurateAIResponse, AIResponsePayload } from './aiAccuracyEngine';

export interface TestCase {
  id: string;
  category: 
    | 'Mathematics' 
    | 'Computer Science' 
    | 'ICT' 
    | 'Physics' 
    | 'Chemistry' 
    | 'Biology' 
    | 'English & French' 
    | 'GCE-Style Exam Questions' 
    | 'Ambiguous Questions' 
    | 'Deliberately Misleading Questions';
  question: string;
  subject?: string;
  level?: string;
  expectedConcepts: string[];
  mustContainPatterns?: string[];
  mustNotContainPatterns?: string[];
  shouldRequestClarification?: boolean;
}

export const MASTER_AI_TEST_SUITE: TestCase[] = [
  // ==========================================
  // 1. MATHEMATICS (20 Questions)
  // ==========================================
  {
    id: 'math_01',
    category: 'Mathematics',
    question: 'What is 2 + 2?',
    subject: 'Mathematics',
    level: 'Form 1',
    expectedConcepts: ['4', 'addition'],
    mustContainPatterns: ['4']
  },
  {
    id: 'math_02',
    category: 'Mathematics',
    question: 'Simplify the algebraic expression: 3(2x - 4) + 5x.',
    subject: 'Mathematics',
    level: 'Form 3',
    expectedConcepts: ['11x - 12', 'distributive property'],
    mustContainPatterns: ['11x', '12']
  },
  {
    id: 'math_03',
    category: 'Mathematics',
    question: 'Solve the quadratic equation x^2 - 5x + 6 = 0.',
    subject: 'Mathematics',
    level: 'Form 5 / O-Level',
    expectedConcepts: ['x = 2', 'x = 3', 'factorization'],
    mustContainPatterns: ['2', '3']
  },
  {
    id: 'math_04',
    category: 'Mathematics',
    question: 'What is the derivative of f(x) = 3x^4 - 5x^2 + 7 with respect to x?',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['12x^3 - 10x', 'power rule'],
    mustContainPatterns: ['12x', '10x']
  },
  {
    id: 'math_05',
    category: 'Mathematics',
    question: 'Evaluate the integral of (4x^3 + 2x) dx.',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['x^4 + x^2 + C', 'constant of integration'],
    mustContainPatterns: ['x^4', 'x^2', 'C']
  },
  {
    id: 'math_06',
    category: 'Mathematics',
    question: 'What is the sum of interior angles of a hexagon?',
    subject: 'Mathematics',
    level: 'Form 2',
    expectedConcepts: ['720 degrees', '(n - 2) * 180'],
    mustContainPatterns: ['720']
  },
  {
    id: 'math_07',
    category: 'Mathematics',
    question: 'In a right-angled triangle, if opposite = 3 and adjacent = 4, what is the hypotenuse?',
    subject: 'Mathematics',
    level: 'Form 3',
    expectedConcepts: ['5', 'Pythagoras theorem', '3^2 + 4^2 = 25'],
    mustContainPatterns: ['5']
  },
  {
    id: 'math_08',
    category: 'Mathematics',
    question: 'Simplify the Boolean algebra expression A + AB.',
    subject: 'Mathematics / Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['A', 'Absorption law', 'A(1 + B) = A'],
    mustContainPatterns: ['A'],
    mustNotContainPatterns: ['A + B']
  },
  {
    id: 'math_09',
    category: 'Mathematics',
    question: 'Simplify the Boolean expression A + A\'B.',
    subject: 'Mathematics / Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['A + B', 'Redundancy law', '(A + A\')(A + B) = A + B'],
    mustContainPatterns: ['A + B']
  },
  {
    id: 'math_10',
    category: 'Mathematics',
    question: 'What are De Morgan’s laws in Boolean Algebra?',
    subject: 'Mathematics / Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['(A . B)\' = A\' + B\'', '(A + B)\' = A\' . B\''],
    mustContainPatterns: ['De Morgan']
  },
  {
    id: 'math_11',
    category: 'Mathematics',
    question: 'Find the mean and median of the numbers: 4, 8, 6, 10, 12.',
    subject: 'Mathematics',
    level: 'Form 4',
    expectedConcepts: ['Mean = 8', 'Median = 8'],
    mustContainPatterns: ['8']
  },
  {
    id: 'math_12',
    category: 'Mathematics',
    question: 'If log10(x) = 3, what is the value of x?',
    subject: 'Mathematics',
    level: 'Ordinary Level',
    expectedConcepts: ['1000', '10^3'],
    mustContainPatterns: ['1000', '10^3']
  },
  {
    id: 'math_13',
    category: 'Mathematics',
    question: 'What is the formula for the nth term of an Arithmetic Progression (AP)?',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['a + (n - 1)d', 'first term', 'common difference'],
    mustContainPatterns: ['a + (n - 1)d']
  },
  {
    id: 'math_14',
    category: 'Mathematics',
    question: 'What is the sum to infinity of a Geometric Progression with a = 6 and r = 1/2?',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['12', 'S = a / (1 - r)', '6 / 0.5 = 12'],
    mustContainPatterns: ['12']
  },
  {
    id: 'math_15',
    category: 'Mathematics',
    question: 'Calculate the determinant of a 2x2 matrix [[3, 2], [1, 4]].',
    subject: 'Mathematics',
    level: 'Form 5 / O-Level',
    expectedConcepts: ['(3*4) - (2*1) = 10', 'ad - bc'],
    mustContainPatterns: ['10']
  },
  {
    id: 'math_16',
    category: 'Mathematics',
    question: 'State the exact value of sin(30 degrees) and cos(60 degrees).',
    subject: 'Mathematics',
    level: 'Form 4',
    expectedConcepts: ['1/2 or 0.5', 'both are equal to 0.5'],
    mustContainPatterns: ['0.5', '1/2']
  },
  {
    id: 'math_17',
    category: 'Mathematics',
    question: 'If two fair 6-sided dice are rolled, what is the probability of getting a sum of 7?',
    subject: 'Mathematics',
    level: 'Form 5',
    expectedConcepts: ['6/36 or 1/6', '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)'],
    mustContainPatterns: ['1/6', '6/36']
  },
  {
    id: 'math_18',
    category: 'Mathematics',
    question: 'Differentiate y = sin(2x) with respect to x.',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['2cos(2x)', 'chain rule'],
    mustContainPatterns: ['2cos(2x)']
  },
  {
    id: 'math_19',
    category: 'Mathematics',
    question: 'Solve for x: 2^(x + 1) = 16.',
    subject: 'Mathematics',
    level: 'Form 4',
    expectedConcepts: ['x = 3', '16 = 2^4', 'x + 1 = 4'],
    mustContainPatterns: ['3']
  },
  {
    id: 'math_20',
    category: 'Mathematics',
    question: 'What is the gradient of the line perpendicular to y = 2x + 5?',
    subject: 'Mathematics',
    level: 'Ordinary Level',
    expectedConcepts: ['-1/2 or -0.5', 'm1 * m2 = -1'],
    mustContainPatterns: ['-1/2', '-0.5']
  },

  // ==========================================
  // 2. COMPUTER SCIENCE (20 Questions)
  // ==========================================
  {
    id: 'cs_01',
    category: 'Computer Science',
    question: 'What is database normalization and why is it important in relational database design?',
    subject: 'Computer Science',
    level: 'Upper Sixth / A-Level',
    expectedConcepts: ['reduce data redundancy', 'prevent anomalies', '1NF, 2NF, 3NF', 'data integrity'],
    mustContainPatterns: ['redundancy', 'integrity', 'anomalies']
  },
  {
    id: 'cs_02',
    category: 'Computer Science',
    question: 'What is the difference between a Primary Key and a Foreign Key?',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['Primary key uniquely identifies a record', 'Foreign key references primary key in another table to establish relation'],
    mustContainPatterns: ['uniquely', 'references']
  },
  {
    id: 'cs_03',
    category: 'Computer Science',
    question: 'Explain the 3 fundamental control structures in programming: Sequence, Selection, and Iteration.',
    subject: 'Computer Science',
    level: 'Form 3',
    expectedConcepts: ['Sequence (step by step)', 'Selection (IF/ELSE decision)', 'Iteration (loops/repetition)'],
    mustContainPatterns: ['Sequence', 'Selection', 'Iteration']
  },
  {
    id: 'cs_04',
    category: 'Computer Science',
    question: 'What is the difference between a pre-tested loop (WHILE) and a post-tested loop (REPEAT-UNTIL / DO-WHILE)?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['pre-tested checks condition before execution (may run 0 times)', 'post-tested executes at least once before checking'],
    mustContainPatterns: ['at least once', 'before']
  },
  {
    id: 'cs_05',
    category: 'Computer Science',
    question: 'Write a standard C++ program to input three numbers and print their average.',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['#include <iostream>', 'cin >> a >> b >> c', 'average = (a+b+c)/3.0', 'cout'],
    mustContainPatterns: ['#include <iostream>', 'cin', 'cout']
  },
  {
    id: 'cs_06',
    category: 'Computer Science',
    question: 'What is a Trace Table (Dry Run) in algorithm testing?',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['technique to track variable values step by step without a computer', 'detects logic errors and infinite loops'],
    mustContainPatterns: ['variable', 'step']
  },
  {
    id: 'cs_07',
    category: 'Computer Science',
    question: 'What is the time complexity (Big-O notation) of Linear Search vs Binary Search?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Linear Search: O(n)', 'Binary Search: O(log n)', 'Binary Search requires sorted array'],
    mustContainPatterns: ['O(n)', 'O(log n)', 'sorted']
  },
  {
    id: 'cs_08',
    category: 'Computer Science',
    question: 'How do you convert the decimal number 25 into 8-bit binary?',
    subject: 'Computer Science',
    level: 'Form 3',
    expectedConcepts: ['00011001', '16 + 8 + 1 = 25'],
    mustContainPatterns: ['00011001']
  },
  {
    id: 'cs_09',
    category: 'Computer Science',
    question: 'What is Two’s Complement and how do you represent -5 in 8-bit Two’s complement?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Invert bits of +5 (00000101 -> 11111010) and add 1', '11111011'],
    mustContainPatterns: ['11111011']
  },
  {
    id: 'cs_10',
    category: 'Computer Science',
    question: 'What are the 4 fundamental pillars of Object-Oriented Programming (OOP)?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'],
    mustContainPatterns: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism']
  },
  {
    id: 'cs_11',
    category: 'Computer Science',
    question: 'Explain the difference between a Compiler and an Interpreter.',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['Compiler translates entire code into machine code at once', 'Interpreter translates line by line at runtime'],
    mustContainPatterns: ['entire', 'line by line']
  },
  {
    id: 'cs_12',
    category: 'Computer Science',
    question: 'What is the primary role of the Operating System CPU Scheduler?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['allocates CPU time slices to active processes', 'scheduling algorithms (Round Robin, FCFS, Priority)'],
    mustContainPatterns: ['process', 'CPU']
  },
  {
    id: 'cs_13',
    category: 'Computer Science',
    question: 'What is the difference between a Stack and a Queue data structure?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Stack: LIFO (Last In First Out)', 'Queue: FIFO (First In First Out)', 'push/pop vs enqueue/dequeue'],
    mustContainPatterns: ['LIFO', 'FIFO']
  },
  {
    id: 'cs_14',
    category: 'Computer Science',
    question: 'What are logic gates NAND and NOR called universal gates?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['any standard logic function (AND, OR, NOT) can be constructed using only NAND or only NOR gates'],
    mustContainPatterns: ['universal', 'any']
  },
  {
    id: 'cs_15',
    category: 'Computer Science',
    question: 'Explain the Von Neumann Architecture and the Fetch-Decode-Execute cycle.',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['CPU (ALU, CU, Registers), Memory, Buses', 'Fetch instruction from RAM -> Decode in CU -> Execute in ALU'],
    mustContainPatterns: ['Fetch', 'Decode', 'Execute']
  },
  {
    id: 'cs_16',
    category: 'Computer Science',
    question: 'What is a Foreign Key constraint in SQL and what does ON DELETE CASCADE do?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['maintains referential integrity', 'deletes corresponding child records when parent record is deleted'],
    mustContainPatterns: ['referential integrity', 'cascade']
  },
  {
    id: 'cs_17',
    category: 'Computer Science',
    question: 'How does Bubble Sort work and what is its worst-case time complexity?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['repeatedly swaps adjacent elements if out of order', 'Worst-case: O(n^2)'],
    mustContainPatterns: ['O(n^2)', 'adjacent']
  },
  {
    id: 'cs_18',
    category: 'Computer Science',
    question: 'What is the difference between Synchronous and Asynchronous transmission in data communication?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Synchronous uses shared clock signal with block transmission', 'Asynchronous uses start/stop bits for individual characters'],
    mustContainPatterns: ['clock', 'start', 'stop']
  },
  {
    id: 'cs_19',
    category: 'Computer Science',
    question: 'What is the purpose of an Entity Relationship Diagram (ERD) in database design?',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['visual modeling of database entities, attributes, and relationships (1:1, 1:N, M:N)'],
    mustContainPatterns: ['entities', 'attributes', 'relationships']
  },
  {
    id: 'cs_20',
    category: 'Computer Science',
    question: 'What is the difference between Call by Value and Call by Reference in function arguments?',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Call by value passes a copy (original unchanged)', 'Call by reference passes memory address (original modified)'],
    mustContainPatterns: ['copy', 'address']
  },

  // ==========================================
  // 3. ICT (20 Questions)
  // ==========================================
  {
    id: 'ict_01',
    category: 'ICT',
    question: 'What is the difference between RAM and ROM?',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['RAM is volatile (temporary)', 'ROM is non-volatile (permanent BIOS)'],
    mustContainPatterns: ['volatile', 'non-volatile']
  },
  {
    id: 'ict_02',
    category: 'ICT',
    question: 'What are the 7 layers of the OSI Network Model from Layer 1 to Layer 7?',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['Physical', 'Data Link', 'Network', 'Transport', 'Session', 'Presentation', 'Application'],
    mustContainPatterns: ['Physical', 'Network', 'Transport', 'Application']
  },
  {
    id: 'ict_03',
    category: 'ICT',
    question: 'What does DHCP stand for and what is its primary function in a network?',
    subject: 'ICT',
    level: 'Form 5',
    expectedConcepts: ['Dynamic Host Configuration Protocol', 'automatically assigns IP addresses to client devices'],
    mustContainPatterns: ['Dynamic Host Configuration Protocol', 'IP address']
  },
  {
    id: 'ict_04',
    category: 'ICT',
    question: 'Explain the difference between a Local Area Network (LAN) and a Wide Area Network (WAN).',
    subject: 'ICT',
    level: 'Form 3',
    expectedConcepts: ['LAN covers small geographical area (school/office)', 'WAN spans cities/countries (e.g. Internet)'],
    mustContainPatterns: ['geographical', 'Internet']
  },
  {
    id: 'ict_05',
    category: 'ICT',
    question: 'What is Cloud Computing and what are its 3 main service models (IaaS, PaaS, SaaS)?',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['Infrastructure as a Service', 'Platform as a Service', 'Software as a Service', 'on-demand internet computing'],
    mustContainPatterns: ['IaaS', 'PaaS', 'SaaS']
  },
  {
    id: 'ict_06',
    category: 'ICT',
    question: 'What is Phishing and how can computer users protect themselves from it?',
    subject: 'ICT',
    level: 'Form 4',
    expectedConcepts: ['fraudulent attempt to steal sensitive data (passwords, banking) via fake emails/sites', 'verify sender, 2FA, don’t click unknown links'],
    mustContainPatterns: ['fraudulent', 'password']
  },
  {
    id: 'ict_07',
    category: 'ICT',
    question: 'What is the purpose of an IP Address and a MAC Address?',
    subject: 'ICT',
    level: 'Form 5',
    expectedConcepts: ['IP address: logical network address (routable)', 'MAC address: physical hardware address burned into NIC'],
    mustContainPatterns: ['logical', 'physical', 'NIC']
  },
  {
    id: 'ict_08',
    category: 'ICT',
    question: 'What is the difference between System Software and Application Software?',
    subject: 'ICT',
    level: 'Form 2',
    expectedConcepts: ['System software manages hardware (OS, drivers)', 'Application software allows users to perform specific tasks (Word, browser)'],
    mustContainPatterns: ['hardware', 'tasks']
  },
  {
    id: 'ict_09',
    category: 'ICT',
    question: 'What is the role of a Router versus a Switch in computer networks?',
    subject: 'ICT',
    level: 'Form 5',
    expectedConcepts: ['Router connects different networks (Layer 3 - IP routing)', 'Switch connects devices within the same local network (Layer 2 - MAC)'],
    mustContainPatterns: ['different networks', 'local network']
  },
  {
    id: 'ict_10',
    category: 'ICT',
    question: 'What is Data Encryption and what is the difference between Symmetric and Asymmetric encryption?',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['Symmetric uses same key for encryption/decryption', 'Asymmetric uses public and private key pair'],
    mustContainPatterns: ['public key', 'private key', 'same key']
  },
  {
    id: 'ict_11',
    category: 'ICT',
    question: 'Explain the difference between Optical storage (CD/DVD), Magnetic storage (HDD), and Solid State (SSD).',
    subject: 'ICT',
    level: 'Form 4',
    expectedConcepts: ['Optical uses lasers (pits and lands)', 'Magnetic uses magnetized platters', 'SSD uses flash memory with no moving parts'],
    mustContainPatterns: ['laser', 'flash', 'moving parts']
  },
  {
    id: 'ict_12',
    category: 'ICT',
    question: 'What is a Firewall and how does it protect a computer network?',
    subject: 'ICT',
    level: 'Form 4',
    expectedConcepts: ['security barrier that monitors and filters incoming and outgoing network traffic based on security rules'],
    mustContainPatterns: ['filters', 'traffic']
  },
  {
    id: 'ict_13',
    category: 'ICT',
    question: 'What is the purpose of Domain Name System (DNS)?',
    subject: 'ICT',
    level: 'Form 4',
    expectedConcepts: ['translates human-friendly domain names (edulpha.com) into machine-readable IP addresses'],
    mustContainPatterns: ['translates', 'domain', 'IP address']
  },
  {
    id: 'ict_14',
    category: 'ICT',
    question: 'What is the difference between Lossy and Lossless file compression?',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['Lossy removes unnoticeable data permanently (JPEG, MP3)', 'Lossless restores exact original data (ZIP, PNG)'],
    mustContainPatterns: ['Lossy', 'Lossless']
  },
  {
    id: 'ict_15',
    category: 'ICT',
    question: 'What is a Star Network Topology and what is its main advantage and disadvantage?',
    subject: 'ICT',
    level: 'Form 3',
    expectedConcepts: ['all nodes connect to central hub/switch', 'Advantage: single node failure does not affect others', 'Disadvantage: central hub failure crashes entire network'],
    mustContainPatterns: ['central', 'hub']
  },
  {
    id: 'ict_16',
    category: 'ICT',
    question: 'What is the Digital Divide and how does it affect education in developing countries like Cameroon?',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['gap between demographics with access to modern digital technologies and those without', 'affects rural access, electricity, internet costs'],
    mustContainPatterns: ['gap', 'access']
  },
  {
    id: 'ict_17',
    category: 'ICT',
    question: 'What are the main components of a standard URL (e.g., https://www.edulpha.com/courses)?',
    subject: 'ICT',
    level: 'Form 3',
    expectedConcepts: ['Protocol (https)', 'Domain name / Host (www.edulpha.com)', 'Path / Resource (/courses)'],
    mustContainPatterns: ['protocol', 'domain', 'path']
  },
  {
    id: 'ict_18',
    category: 'ICT',
    question: 'What is ergonomics in computer workstation design?',
    subject: 'ICT',
    level: 'Form 2',
    expectedConcepts: ['designing workplace equipment to maximize comfort, productivity, and reduce repetitive strain injuries (RSI)'],
    mustContainPatterns: ['comfort', 'RSI']
  },
  {
    id: 'ict_19',
    category: 'ICT',
    question: 'What is open-source software compared to proprietary (commercial) software?',
    subject: 'ICT',
    level: 'Form 4',
    expectedConcepts: ['Open source: source code freely accessible to view, modify, distribute (Linux)', 'Proprietary: source code closed, owned by company (Windows)'],
    mustContainPatterns: ['source code', 'modify']
  },
  {
    id: 'ict_20',
    category: 'ICT',
    question: 'What is bandwidth vs latency in network speed measurement?',
    subject: 'ICT',
    level: 'Form 5',
    expectedConcepts: ['Bandwidth: maximum data transfer capacity per second (Mbps)', 'Latency: time delay taken for packet to travel from source to destination (ms)'],
    mustContainPatterns: ['capacity', 'delay']
  },

  // ==========================================
  // 4. PHYSICS (10 Questions)
  // ==========================================
  {
    id: 'phys_01',
    category: 'Physics',
    question: 'State Ohm’s Law and give its mathematical equation.',
    subject: 'Physics',
    level: 'Form 4',
    expectedConcepts: ['current through conductor is directly proportional to potential difference across it provided temperature remains constant', 'V = IR'],
    mustContainPatterns: ['V = IR', 'temperature constant']
  },
  {
    id: 'phys_02',
    category: 'Physics',
    question: 'A 5 kg block is accelerated at 3 m/s^2. Calculate the net force applied.',
    subject: 'Physics',
    level: 'Form 3',
    expectedConcepts: ['F = ma', '5 * 3 = 15 N (Newtons)'],
    mustContainPatterns: ['15 N', '15']
  },
  {
    id: 'phys_03',
    category: 'Physics',
    question: 'What is Newton’s Third Law of Motion?',
    subject: 'Physics',
    level: 'Form 3',
    expectedConcepts: ['For every action, there is an equal and opposite reaction.'],
    mustContainPatterns: ['equal and opposite']
  },
  {
    id: 'phys_04',
    category: 'Physics',
    question: 'Calculate the total resistance of two resistors of 6 ohms and 3 ohms connected in parallel.',
    subject: 'Physics',
    level: 'Form 4',
    expectedConcepts: ['1/R = 1/6 + 1/3 = 3/6 = 1/2', 'R = 2 ohms'],
    mustContainPatterns: ['2 ohms', '2 Ω', '2']
  },
  {
    id: 'phys_05',
    category: 'Physics',
    question: 'What is the law of conservation of energy?',
    subject: 'Physics',
    level: 'Form 3',
    expectedConcepts: ['energy cannot be created or destroyed, only transformed from one form to another'],
    mustContainPatterns: ['created', 'destroyed', 'transformed']
  },
  {
    id: 'phys_06',
    category: 'Physics',
    question: 'What is Archimedes’ Principle?',
    subject: 'Physics',
    level: 'Form 4',
    expectedConcepts: ['body immersed in fluid experiences upthrust equal to weight of fluid displaced'],
    mustContainPatterns: ['upthrust', 'displaced']
  },
  {
    id: 'phys_07',
    category: 'Physics',
    question: 'Define the refractive index of a medium according to Snell’s Law.',
    subject: 'Physics',
    level: 'Form 5',
    expectedConcepts: ['n = sin(i) / sin(r)', 'ratio of speed of light in vacuum to speed in medium'],
    mustContainPatterns: ['sin(i)', 'sin(r)']
  },
  {
    id: 'phys_08',
    category: 'Physics',
    question: 'What is electromagnetic induction according to Faraday’s Law?',
    subject: 'Physics',
    level: 'Advanced Level',
    expectedConcepts: ['induced EMF is directly proportional to rate of change of magnetic flux linkage'],
    mustContainPatterns: ['rate of change', 'magnetic flux']
  },
  {
    id: 'phys_09',
    category: 'Physics',
    question: 'What is half-life in radioactive decay?',
    subject: 'Physics',
    level: 'Form 5',
    expectedConcepts: ['time taken for half the radioactive nuclei in a sample to decay'],
    mustContainPatterns: ['half', 'decay']
  },
  {
    id: 'phys_10',
    category: 'Physics',
    question: 'What is the difference between scalar and vector quantities?',
    subject: 'Physics',
    level: 'Form 3',
    expectedConcepts: ['Scalar has magnitude only (mass, speed)', 'Vector has magnitude and direction (velocity, force)'],
    mustContainPatterns: ['magnitude', 'direction']
  },

  // ==========================================
  // 5. CHEMISTRY (10 Questions)
  // ==========================================
  {
    id: 'chem_01',
    category: 'Chemistry',
    question: 'What is the difference between an acid and a base according to Arrhenius and Bronsted-Lowry theories?',
    subject: 'Chemistry',
    level: 'Form 4',
    expectedConcepts: ['Arrhenius: Acid produces H+, Base produces OH-', 'Bronsted-Lowry: Acid is proton donor, Base is proton acceptor'],
    mustContainPatterns: ['donor', 'acceptor', 'H+']
  },
  {
    id: 'chem_02',
    category: 'Chemistry',
    question: 'What is an exothermic reaction versus an endothermic reaction?',
    subject: 'Chemistry',
    level: 'Form 3',
    expectedConcepts: ['Exothermic releases heat (Delta H negative)', 'Endothermic absorbs heat (Delta H positive)'],
    mustContainPatterns: ['releases', 'absorbs', 'heat']
  },
  {
    id: 'chem_03',
    category: 'Chemistry',
    question: 'What is the mole concept and what is Avogadro’s constant?',
    subject: 'Chemistry',
    level: 'Form 4',
    expectedConcepts: ['amount of substance containing same number of particles as 12g of Carbon-12', '6.022 x 10^23'],
    mustContainPatterns: ['6.02', '10^23']
  },
  {
    id: 'chem_04',
    category: 'Chemistry',
    question: 'What is Le Chatelier’s Principle in chemical equilibrium?',
    subject: 'Chemistry',
    level: 'Advanced Level',
    expectedConcepts: ['if a system at equilibrium is subjected to change in temperature/pressure/concentration, the system shifts to counteract the change'],
    mustContainPatterns: ['counteract', 'shift', 'equilibrium']
  },
  {
    id: 'chem_05',
    category: 'Chemistry',
    question: 'What is the difference between an Alkane and an Alkene in organic chemistry?',
    subject: 'Chemistry',
    level: 'Form 5',
    expectedConcepts: ['Alkane: saturated hydrocarbon with single C-C bonds (CnH2n+2)', 'Alkene: unsaturated with at least one C=C double bond (CnH2n)'],
    mustContainPatterns: ['single bond', 'double bond', 'saturated', 'unsaturated']
  },
  {
    id: 'chem_06',
    category: 'Chemistry',
    question: 'What is the pH scale and what does a pH of 7, 2, and 12 indicate?',
    subject: 'Chemistry',
    level: 'Form 2',
    expectedConcepts: ['pH 7 is neutral', 'pH 2 is strongly acidic', 'pH 12 is strongly basic/alkaline'],
    mustContainPatterns: ['neutral', 'acidic', 'basic']
  },
  {
    id: 'chem_07',
    category: 'Chemistry',
    question: 'What is oxidation and reduction in terms of electrons (OIL RIG)?',
    subject: 'Chemistry',
    level: 'Form 4',
    expectedConcepts: ['Oxidation Is Loss of electrons', 'Reduction Is Gain of electrons'],
    mustContainPatterns: ['Loss', 'Gain']
  },
  {
    id: 'chem_08',
    category: 'Chemistry',
    question: 'Explain ionic bonding vs covalent bonding.',
    subject: 'Chemistry',
    level: 'Form 3',
    expectedConcepts: ['Ionic: transfer of electrons from metal to non-metal', 'Covalent: sharing of electron pairs between non-metals'],
    mustContainPatterns: ['transfer', 'sharing']
  },
  {
    id: 'chem_09',
    category: 'Chemistry',
    question: 'What is a catalyst and how does it speed up a chemical reaction?',
    subject: 'Chemistry',
    level: 'Form 4',
    expectedConcepts: ['substance that increases reaction rate without being consumed', 'lowers activation energy'],
    mustContainPatterns: ['activation energy', 'consumed']
  },
  {
    id: 'chem_10',
    category: 'Chemistry',
    question: 'In acid-base titration, what is the role of an indicator such as phenolphthalein?',
    subject: 'Chemistry',
    level: 'Form 5',
    expectedConcepts: ['signals end-point of titration by distinct color change (colorless in acid to pink in base)'],
    mustContainPatterns: ['end-point', 'color change', 'pink']
  },

  // ==========================================
  // 6. BIOLOGY (10 Questions)
  // ==========================================
  {
    id: 'bio_01',
    category: 'Biology',
    question: 'What is the word equation and chemical equation for Photosynthesis?',
    subject: 'Biology',
    level: 'Form 3',
    expectedConcepts: ['Carbon dioxide + Water -> Glucose + Oxygen (in presence of sunlight and chlorophyll)', '6CO2 + 6H2O -> C6H12O6 + 6O2'],
    mustContainPatterns: ['Carbon dioxide', 'Water', 'Glucose', 'Oxygen']
  },
  {
    id: 'bio_02',
    category: 'Biology',
    question: 'What is the difference between aerobic and anaerobic respiration?',
    subject: 'Biology',
    level: 'Form 4',
    expectedConcepts: ['Aerobic uses oxygen and produces CO2 + H2O + large energy (38 ATP)', 'Anaerobic occurs without oxygen, produces lactic acid or ethanol + small energy (2 ATP)'],
    mustContainPatterns: ['oxygen', 'lactic acid']
  },
  {
    id: 'bio_03',
    category: 'Biology',
    question: 'What are the main differences between a plant cell and an animal cell?',
    subject: 'Biology',
    level: 'Form 2',
    expectedConcepts: ['Plant cell has cell wall, chloroplasts, and large central vacuole', 'Animal cell lacks cell wall and chloroplasts'],
    mustContainPatterns: ['cell wall', 'chloroplast']
  },
  {
    id: 'bio_04',
    category: 'Biology',
    question: 'What is Osmosis versus Diffusion?',
    subject: 'Biology',
    level: 'Form 3',
    expectedConcepts: ['Diffusion: movement of particles from high to low concentration', 'Osmosis: movement of water molecules across semi-permeable membrane from high water potential to lower'],
    mustContainPatterns: ['water', 'semi-permeable', 'concentration']
  },
  {
    id: 'bio_05',
    category: 'Biology',
    question: 'What are the 4 chambers of the human heart and what is double circulation?',
    subject: 'Biology',
    level: 'Form 4',
    expectedConcepts: ['Right Atrium, Right Ventricle, Left Atrium, Left Ventricle', 'Pulmonary circulation (heart to lungs) and Systemic circulation (heart to body)'],
    mustContainPatterns: ['Atrium', 'Ventricle', 'Pulmonary', 'Systemic']
  },
  {
    id: 'bio_06',
    category: 'Biology',
    question: 'What is Mitosis versus Meiosis?',
    subject: 'Biology',
    level: 'Form 5 / A-Level',
    expectedConcepts: ['Mitosis: produces 2 genetically identical diploid daughter cells (growth/repair)', 'Meiosis: produces 4 genetically varied haploid gametes (reproduction)'],
    mustContainPatterns: ['diploid', 'haploid', 'gametes']
  },
  {
    id: 'bio_07',
    category: 'Biology',
    question: 'What is an enzyme and what is the Lock and Key hypothesis?',
    subject: 'Biology',
    level: 'Form 3',
    expectedConcepts: ['biological catalyst', 'substrate (key) fits specifically into enzyme active site (lock)'],
    mustContainPatterns: ['active site', 'substrate', 'catalyst']
  },
  {
    id: 'bio_08',
    category: 'Biology',
    question: 'What is the difference between Xylem and Phloem vessels in plants?',
    subject: 'Biology',
    level: 'Form 3',
    expectedConcepts: ['Xylem transports water and minerals upwards from roots', 'Phloem translocates manufactured sugars/sucrose in both directions'],
    mustContainPatterns: ['water', 'sugars', 'translocation']
  },
  {
    id: 'bio_09',
    category: 'Biology',
    question: 'What is homozygous vs heterozygous in genetics?',
    subject: 'Biology',
    level: 'Form 5',
    expectedConcepts: ['Homozygous: having identical alleles (e.g. BB or bb)', 'Heterozygous: having two different alleles (e.g. Bb)'],
    mustContainPatterns: ['identical alleles', 'different alleles']
  },
  {
    id: 'bio_10',
    category: 'Biology',
    question: 'What is homeostasis and how does the human body regulate body temperature?',
    subject: 'Biology',
    level: 'Form 5',
    expectedConcepts: ['maintenance of constant internal environment', 'sweating/vasodilation when hot, shivering/vasoconstriction when cold'],
    mustContainPatterns: ['internal environment', 'sweating', 'shivering']
  },

  // ==========================================
  // 7. ENGLISH & FRENCH (10 Questions)
  // ==========================================
  {
    id: 'lang_01',
    category: 'English & French',
    question: 'What is the difference between active voice and passive voice in English grammar?',
    subject: 'English',
    level: 'Form 3',
    expectedConcepts: ['Active: subject performs action (The teacher marked the test)', 'Passive: subject receives action (The test was marked by the teacher)'],
    mustContainPatterns: ['subject', 'performs', 'receives']
  },
  {
    id: 'lang_02',
    category: 'English & French',
    question: 'Explain what a metaphor is and how it differs from a simile.',
    subject: 'English Literature',
    level: 'Form 3',
    expectedConcepts: ['Simile compares using "like" or "as"', 'Metaphor states that one thing is another without using "like" or "as"'],
    mustContainPatterns: ['like', 'as']
  },
  {
    id: 'lang_03',
    category: 'English & French',
    question: 'Quelle est la règle d\'accord du participe passé avec l\'auxiliaire "avoir" en français ?',
    subject: 'French',
    level: 'Form 4 / 3ème',
    expectedConcepts: ['le participe passé s\'accorde en genre et en nombre avec le COD s\'il est placé avant le verbe', 'invariable si le COD est placé après'],
    mustContainPatterns: ['COD', 'avant']
  },
  {
    id: 'lang_04',
    category: 'English & French',
    question: 'What are homophones? Give 3 common examples in English.',
    subject: 'English',
    level: 'Form 2',
    expectedConcepts: ['words having same pronunciation but different spelling and meaning', 'e.g. their/there/they\'re, hear/here, to/two/too'],
    mustContainPatterns: ['pronunciation', 'spelling']
  },
  {
    id: 'lang_05',
    category: 'English & French',
    question: 'Comment conjuguer le verbe "être" au subjonctif présent pour toutes les personnes ?',
    subject: 'French',
    level: 'Form 4',
    expectedConcepts: ['que je sois, que tu sois, qu\'il soit, que nous soyons, que vous soyez, qu\'ils soient'],
    mustContainPatterns: ['sois', 'soit', 'soyons', 'soyez']
  },
  {
    id: 'lang_06',
    category: 'English & French',
    question: 'What is an oxymoron in literary devices? Give two examples.',
    subject: 'English Literature',
    level: 'Form 4',
    expectedConcepts: ['figure of speech combining contradictory terms', 'e.g. deafening silence, bittersweet'],
    mustContainPatterns: ['contradictory', 'silence']
  },
  {
    id: 'lang_07',
    category: 'English & French',
    question: 'Translate accurately into French: "Education is the most powerful weapon which you can use to change the world."',
    subject: 'French / English Translation',
    level: 'Form 5',
    expectedConcepts: ['L\'éducation est l\'arme la plus puissante que vous puissiez utiliser pour changer le monde.'],
    mustContainPatterns: ['L\'éducation', 'arme', 'puissante']
  },
  {
    id: 'lang_08',
    category: 'English & French',
    question: 'What is the difference between a clause and a phrase in English sentence structure?',
    subject: 'English',
    level: 'Form 4',
    expectedConcepts: ['Clause contains both subject and predicate verb', 'Phrase lacks a subject-verb pairing'],
    mustContainPatterns: ['subject', 'verb']
  },
  {
    id: 'lang_09',
    category: 'English & French',
    question: 'Quelle est la différence entre "a" (verbe avoir) et "à" (préposition) en français ?',
    subject: 'French',
    level: 'Form 1 / 6ème',
    expectedConcepts: ['"a" sans accent peut être remplacé par "avait"', '"à" avec accent est une préposition invariable'],
    mustContainPatterns: ['avait', 'préposition']
  },
  {
    id: 'lang_10',
    category: 'English & French',
    question: 'What are the main components of a formal letter according to standard examination formats?',
    subject: 'English',
    level: 'Form 4',
    expectedConcepts: ['Sender address, Date, Recipient address, Salutation, Subject heading, Body paragraphs, Sign-off/Valediction'],
    mustContainPatterns: ['address', 'Salutation', 'Subject']
  },

  // ==========================================
  // 8. GCE-STYLE MULTI-PART QUESTIONS (20 Questions)
  // ==========================================
  {
    id: 'gce_01',
    category: 'GCE-Style Exam Questions',
    question: 'Cameroon GCE A-Level CS Paper 2 (10 Marks): (a) Define 1NF, 2NF, and 3NF. (b) Explain the difference between partial and transitive dependency.',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['1NF: atomic values', '2NF: 1NF + no partial dependency', '3NF: 2NF + no transitive dependency'],
    mustContainPatterns: ['1NF', '2NF', '3NF', 'partial', 'transitive']
  },
  {
    id: 'gce_02',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level Computer Science (595): Write the truth table and Boolean expression for an XOR gate with inputs A and B.',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['A XOR B = A\'B + AB\'', 'Output is 1 when inputs differ (0,1 or 1,0)'],
    mustContainPatterns: ['XOR', '0', '1']
  },
  {
    id: 'gce_03',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Mathematics: Find the stationary points of y = 2x^3 - 9x^2 + 12x + 1 and determine their nature using the second derivative test.',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['dy/dx = 6x^2 - 18x + 12 = 0', 'x = 1 (Max), x = 2 (Min)'],
    mustContainPatterns: ['dy/dx', 'Maximum', 'Minimum']
  },
  {
    id: 'gce_04',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level Physics: A car accelerates uniformly from rest to 20 m/s in 5 seconds. Calculate (a) acceleration, (b) distance travelled.',
    subject: 'Physics',
    level: 'Ordinary Level',
    expectedConcepts: ['(a) a = (v - u)/t = (20 - 0)/5 = 4 m/s^2', '(b) s = ut + 0.5at^2 = 0 + 0.5*4*25 = 50 m'],
    mustContainPatterns: ['4 m/s^2', '50 m']
  },
  {
    id: 'gce_05',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level ICT: Explain 4 security measures used to protect school data from unauthorized access.',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['Strong passwords', 'Firewalls', 'Data encryption', 'Role-based user permissions/Access control'],
    mustContainPatterns: ['password', 'encryption', 'firewall']
  },
  {
    id: 'gce_06',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Economics: Explain the concept of Price Elasticity of Demand (PED) and distinguish between elastic, inelastic, and unitary elastic demand.',
    subject: 'Economics',
    level: 'Advanced Level',
    expectedConcepts: ['% change in quantity demanded / % change in price', 'PED > 1 (elastic), PED < 1 (inelastic), PED = 1 (unitary)'],
    mustContainPatterns: ['% change', 'elastic', 'inelastic']
  },
  {
    id: 'gce_07',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Chemistry: Calculate the pH of a 0.05 M solution of Hydrochloric Acid (HCl).',
    subject: 'Chemistry',
    level: 'Advanced Level',
    expectedConcepts: ['pH = -log10[H+]', 'pH = -log10(0.05) = 1.30'],
    mustContainPatterns: ['1.3', 'pH']
  },
  {
    id: 'gce_08',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level CS: In C++, write a recursive function to compute the factorial of an integer n.',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Base case: if (n <= 1) return 1;', 'Recursive step: return n * factorial(n - 1);'],
    mustContainPatterns: ['factorial', 'return']
  },
  {
    id: 'gce_09',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level Biology: Describe the pathway of air into the human lungs from the nose to the alveoli.',
    subject: 'Biology',
    level: 'Ordinary Level',
    expectedConcepts: ['Nasal cavity -> Pharynx -> Larynx -> Trachea -> Bronchi -> Bronchioles -> Alveoli'],
    mustContainPatterns: ['Trachea', 'Bronchi', 'Alveoli']
  },
  {
    id: 'gce_10',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Accounting: State the accounting equation and distinguish between Capital Expenditure and Revenue Expenditure.',
    subject: 'Accounting',
    level: 'Advanced Level',
    expectedConcepts: ['Assets = Liabilities + Owner\'s Equity', 'Capital expenditure purchases long-term fixed assets; Revenue expenditure covers day-to-day operating expenses'],
    mustContainPatterns: ['Assets = Liabilities', 'Capital', 'Revenue']
  },
  {
    id: 'gce_11',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level CS: Convert the hexadecimal number 3F to (a) 8-bit binary, (b) decimal.',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['3 = 0011, F = 1111 -> 00111111', 'Decimal = 3*16 + 15 = 63'],
    mustContainPatterns: ['00111111', '63']
  },
  {
    id: 'gce_12',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level CS: Explain the 3 states of a process in an Operating System: Ready, Running, and Blocked/Waiting.',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['Ready: waiting for CPU', 'Running: currently executing on CPU', 'Blocked: waiting for I/O event'],
    mustContainPatterns: ['Ready', 'Running', 'Blocked']
  },
  {
    id: 'gce_13',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Mathematics: Evaluate the limit as x approaches 0 of sin(x) / x.',
    subject: 'Mathematics',
    level: 'Advanced Level',
    expectedConcepts: ['Limit is equal to 1', 'Standard trigonometric limit or L’Hôpital’s rule'],
    mustContainPatterns: ['1']
  },
  {
    id: 'gce_14',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level Physics: Calculate the gravitational potential energy of a 2 kg object raised to a height of 10 m (take g = 10 m/s^2 or 9.8 m/s^2).',
    subject: 'Physics',
    level: 'Ordinary Level',
    expectedConcepts: ['PE = mgh', '2 * 10 * 10 = 200 J (or 196 J with g=9.8)'],
    mustContainPatterns: ['200 J', '196 J', '200', '196']
  },
  {
    id: 'gce_15',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level ICT: Explain what an IP address is and contrast IPv4 with IPv6.',
    subject: 'ICT',
    level: 'Ordinary Level',
    expectedConcepts: ['IPv4 uses 32 bits (4 bytes in decimal)', 'IPv6 uses 128 bits (hexadecimal) to solve address exhaustion'],
    mustContainPatterns: ['32 bits', '128 bits']
  },
  {
    id: 'gce_16',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Chemistry: Write the balanced chemical equation for the reaction of Sodium with Water, including state symbols.',
    subject: 'Chemistry',
    level: 'Advanced Level',
    expectedConcepts: ['2Na(s) + 2H2O(l) -> 2NaOH(aq) + H2(g)'],
    mustContainPatterns: ['2Na', '2H2O', '2NaOH', 'H2']
  },
  {
    id: 'gce_17',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level CS: In SQL, write a query to select student_name and score from a table named "students" where score is greater than or equal to 70 ordered by score descending.',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['SELECT student_name, score FROM students WHERE score >= 70 ORDER BY score DESC;'],
    mustContainPatterns: ['SELECT', 'FROM students', 'WHERE score >= 70', 'ORDER BY score DESC']
  },
  {
    id: 'gce_18',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level Physics: State the formula for kinetic energy and momentum and show their relationship: KE = p^2 / (2m).',
    subject: 'Physics',
    level: 'Advanced Level',
    expectedConcepts: ['KE = 0.5mv^2', 'p = mv', 'p^2/(2m) = (m^2 v^2)/(2m) = 0.5mv^2'],
    mustContainPatterns: ['p^2', '2m']
  },
  {
    id: 'gce_19',
    category: 'GCE-Style Exam Questions',
    question: 'GCE O-Level Mathematics: Factorize completely: 4x^2 - 9y^2.',
    subject: 'Mathematics',
    level: 'Ordinary Level',
    expectedConcepts: ['(2x - 3y)(2x + 3y)', 'difference of two squares'],
    mustContainPatterns: ['(2x - 3y)', '(2x + 3y)']
  },
  {
    id: 'gce_20',
    category: 'GCE-Style Exam Questions',
    question: 'GCE A-Level CS: Construct an algorithm in pseudocode to find the largest number in an array of N integers.',
    subject: 'Computer Science',
    level: 'Advanced Level',
    expectedConcepts: ['SET max = arr[0]', 'FOR i = 1 TO N - 1', 'IF arr[i] > max THEN max = arr[i]', 'OUTPUT max'],
    mustContainPatterns: ['max', 'FOR', 'IF']
  },

  // ==========================================
  // 9. AMBIGUOUS QUESTIONS (10 Questions - Must clarify, NEVER guess!)
  // ==========================================
  {
    id: 'amb_01',
    category: 'Ambiguous Questions',
    question: 'Explain P3.',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'specify subject', 'Computer Science Paper 3 or Math P3'],
    shouldRequestClarification: true,
    mustContainPatterns: ['clarif', 'subject', 'specify', 'Computer Science', 'Paper 3']
  },
  {
    id: 'amb_02',
    category: 'Ambiguous Questions',
    question: 'What is P1?',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'Paper 1 multiple choice in which subject'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_03',
    category: 'Ambiguous Questions',
    question: 'Explain the paper.',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'which subject or exam paper'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_04',
    category: 'Ambiguous Questions',
    question: 'Give me the answer.',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'what specific question'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_05',
    category: 'Ambiguous Questions',
    question: 'What is the formula?',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'formula for which concept'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_06',
    category: 'Ambiguous Questions',
    question: 'Solve it.',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_07',
    category: 'Ambiguous Questions',
    question: 'Is it correct?',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_08',
    category: 'Ambiguous Questions',
    question: 'What is the syllabus for term 2?',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'which subject and class level'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_09',
    category: 'Ambiguous Questions',
    question: 'Tell me about section B.',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'section B of which examination'],
    shouldRequestClarification: true
  },
  {
    id: 'amb_10',
    category: 'Ambiguous Questions',
    question: 'How many marks is question 1?',
    subject: 'Ambiguous Query',
    level: 'General',
    expectedConcepts: ['clarification request', 'which subject or year'],
    shouldRequestClarification: true
  },

  // ==========================================
  // 10. DELIBERATELY MISLEADING QUESTIONS (10 Questions - Must correct misconceptions)
  // ==========================================
  {
    id: 'mis_01',
    category: 'Deliberately Misleading Questions',
    question: 'Is RAM permanent storage that saves files when the computer is turned off?',
    subject: 'ICT / CS',
    level: 'Ordinary Level',
    expectedConcepts: ['No, RAM is volatile memory', 'ROM or Secondary storage (HDD/SSD) is permanent'],
    mustContainPatterns: ['No', 'volatile', 'temporary']
  },
  {
    id: 'mis_02',
    category: 'Deliberately Misleading Questions',
    question: 'In Boolean algebra, does A + A\' equal 0?',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['No, A + A\' = 1 (Complementarity / Inverse Law)', 'A . A\' = 0'],
    mustContainPatterns: ['1', 'No']
  },
  {
    id: 'mis_03',
    category: 'Deliberately Misleading Questions',
    question: 'Is Python a compiled-only language that does not use an interpreter?',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['No, Python is primarily an interpreted language.'],
    mustContainPatterns: ['interpreted', 'No']
  },
  {
    id: 'mis_04',
    category: 'Deliberately Misleading Questions',
    question: 'Does mass change when an object is taken from Earth to the Moon?',
    subject: 'Physics',
    level: 'Form 3',
    expectedConcepts: ['No, mass remains constant', 'weight changes because gravity is lower on the Moon'],
    mustContainPatterns: ['constant', 'weight']
  },
  {
    id: 'mis_05',
    category: 'Deliberately Misleading Questions',
    question: 'Is pure water with pH 7 considered strongly acidic?',
    subject: 'Chemistry',
    level: 'Form 2',
    expectedConcepts: ['No, pH 7 is neutral.'],
    mustContainPatterns: ['neutral', 'No']
  },
  {
    id: 'mis_06',
    category: 'Deliberately Misleading Questions',
    question: 'Do plant cells perform respiration only during the night and never during the day?',
    subject: 'Biology',
    level: 'Form 4',
    expectedConcepts: ['No, plant cells respire continuously 24 hours a day (day and night).'],
    mustContainPatterns: ['continuously', 'day and night', 'No']
  },
  {
    id: 'mis_07',
    category: 'Deliberately Misleading Questions',
    question: 'Can an algorithm have an infinite number of steps and still be valid?',
    subject: 'Computer Science',
    level: 'Ordinary Level',
    expectedConcepts: ['No, an algorithm must terminate after a finite number of steps (Finiteness property).'],
    mustContainPatterns: ['finite', 'No']
  },
  {
    id: 'mis_08',
    category: 'Deliberately Misleading Questions',
    question: 'Does an IP address identify the physical manufacturer of a network card?',
    subject: 'ICT',
    level: 'Form 4',
    expectedConcepts: ['No, MAC address identifies hardware manufacturer; IP address is logical.'],
    mustContainPatterns: ['MAC address', 'No']
  },
  {
    id: 'mis_09',
    category: 'Deliberately Misleading Questions',
    question: 'Is 1 a prime number?',
    subject: 'Mathematics',
    level: 'Form 1',
    expectedConcepts: ['No, 1 is not a prime number (prime numbers have exactly two distinct positive factors).'],
    mustContainPatterns: ['not a prime', 'No']
  },
  {
    id: 'mis_10',
    category: 'Deliberately Misleading Questions',
    question: 'In C++, does array index indexing start at 1 instead of 0?',
    subject: 'Computer Science',
    level: 'Form 4',
    expectedConcepts: ['No, C++ array indexing is zero-based (starts at index 0).'],
    mustContainPatterns: ['0', 'zero-based', 'No']
  }
];

export async function runAIAccuracyTestSuite(): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  passPercentage: number;
  categoryBreakdown: Record<string, { total: number; passed: number; failed: number }>;
  results: Array<{
    id: string;
    category: string;
    question: string;
    status: 'PASS' | 'FAIL';
    reply: string;
    reason?: string;
  }>;
}> {
  let passedCount = 0;
  let failedCount = 0;
  const breakdown: Record<string, { total: number; passed: number; failed: number }> = {};
  const detailedResults: Array<{
    id: string;
    category: string;
    question: string;
    status: 'PASS' | 'FAIL';
    reply: string;
    reason?: string;
  }> = [];

  for (const test of MASTER_AI_TEST_SUITE) {
    if (!breakdown[test.category]) {
      breakdown[test.category] = { total: 0, passed: 0, failed: 0 };
    }
    breakdown[test.category].total += 1;

    try {
      const payload: AIResponsePayload = {
        prompt: test.question,
        subject: test.subject,
        educationLevel: test.level
      };

      const res = await processAccurateAIResponse(payload);
      const replyText = res.reply.toLowerCase();

      let isPassed = true;
      let failReason: string | undefined;

      // Ambiguity check
      if (test.shouldRequestClarification) {
        if (!res.classification.isAmbiguous && res.source !== 'clarification_required') {
          isPassed = false;
          failReason = 'Expected ambiguity clarification request, but AI guessed an answer.';
        }
      }

      // Pattern checks
      if (test.mustContainPatterns && isPassed) {
        for (const pat of test.mustContainPatterns) {
          if (!replyText.includes(pat.toLowerCase())) {
            isPassed = false;
            failReason = `Missing required concept or pattern: "${pat}"`;
            break;
          }
        }
      }

      if (test.mustNotContainPatterns && isPassed) {
        for (const pat of test.mustNotContainPatterns) {
          if (replyText.includes(pat.toLowerCase())) {
            isPassed = false;
            failReason = `Contains prohibited erroneous pattern: "${pat}"`;
            break;
          }
        }
      }

      if (isPassed) {
        passedCount++;
        breakdown[test.category].passed += 1;
        detailedResults.push({
          id: test.id,
          category: test.category,
          question: test.question,
          status: 'PASS',
          reply: res.reply.slice(0, 180) + '...'
        });
      } else {
        failedCount++;
        breakdown[test.category].failed += 1;
        detailedResults.push({
          id: test.id,
          category: test.category,
          question: test.question,
          status: 'FAIL',
          reply: res.reply.slice(0, 180) + '...',
          reason: failReason
        });
      }
    } catch (err: any) {
      failedCount++;
      breakdown[test.category].failed += 1;
      detailedResults.push({
        id: test.id,
        category: test.category,
        question: test.question,
        status: 'FAIL',
        reply: 'Execution error',
        reason: err.message
      });
    }
  }

  const passPercentage = Math.round((passedCount / MASTER_AI_TEST_SUITE.length) * 100);

  return {
    totalTests: MASTER_AI_TEST_SUITE.length,
    passed: passedCount,
    failed: failedCount,
    passPercentage,
    categoryBreakdown: breakdown,
    results: detailedResults
  };
}
