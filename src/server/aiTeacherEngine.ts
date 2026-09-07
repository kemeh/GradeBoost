import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import { 
  AITeacherAssignment, 
  ProgressionSheet, 
  ProgressionWeekLesson, 
  StudentLearningProgress,
  AILessonSession,
  AILessonExercise,
  MasteryDifficulty
} from '../types';

// ===============================================================
// SSRF & Security Validation for Progression Sheet URL Import
// ===============================================================

export function validateSafeUrl(rawUrl: string): { isValid: boolean; error?: string; parsedUrl?: URL } {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    
    // Check localhost and loopbacks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local')
    ) {
      return { isValid: false, error: 'Access to loopback/local addresses is forbidden.' };
    }

    // Check Cloud Metadata addresses
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { isValid: false, error: 'Access to cloud metadata services is blocked.' };
    }

    // Check IPv4 private ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const b1 = parseInt(match[1], 10);
      const b2 = parseInt(match[2], 10);
      if (b1 === 10) return { isValid: false, error: 'Private IP addresses (10.0.0.0/8) are forbidden.' };
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return { isValid: false, error: 'Private IP addresses (172.16.0.0/12) are forbidden.' };
      if (b1 === 192 && b2 === 168) return { isValid: false, error: 'Private IP addresses (192.168.0.0/16) are forbidden.' };
      if (b1 === 127) return { isValid: false, error: 'Loopback IP addresses are forbidden.' };
      if (b1 === 169 && b2 === 254) return { isValid: false, error: 'Link-local IP addresses are forbidden.' };
    }

    return { isValid: true, parsedUrl: parsed };
  } catch (err: any) {
    return { isValid: false, error: 'Invalid URL format provided.' };
  }
}

// Helper to safely fetch text or document from validated URL
export async function fetchSafeDocumentFromUrl(url: string): Promise<{ text: string; title: string; domain: string }> {
  const check = validateSafeUrl(url);
  if (!check.isValid || !check.parsedUrl) {
    throw new Error(check.error || 'Invalid or forbidden URL');
  }

  const response = await axios.get(url, {
    timeout: 12000,
    maxContentLength: 10 * 1024 * 1024, // 10MB max limit
    headers: {
      'User-Agent': 'EdulphaCurriculumBot/1.0 (Curriculum Import Verification; contact@edulpha.com)'
    },
    responseType: 'text'
  });

  const domain = check.parsedUrl.hostname;
  let text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  
  // Basic HTML strip if it was a web page
  if (text.includes('<html') || text.includes('<body')) {
    text = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extract a rough title
  const titleMatch = (response.data as string).match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : `${domain} Curriculum Document`;

  return {
    text: text.slice(0, 50000), // Cap at 50,000 chars for LLM ingestion
    title,
    domain
  };
}

// ===============================================================
// Curated Progression Sheet Templates for Instant Import
// ===============================================================

export const CURATED_PROGRESSION_TEMPLATES: Record<string, Omit<ProgressionSheet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>> = {
  'gce_al_cs_term1': {
    title: 'Cameroon GCE A-Level Computer Science (Term 1)',
    subject: 'Computer Science',
    subjectId: 'cs_alevel',
    level: 'Advanced Level',
    levelId: 'advanced_level',
    specialty: 'Science & Technical',
    academicYear: '2025/2026',
    term: 1,
    version: 1,
    status: 'APPROVED',
    sourceType: 'manual',
    sourceTitle: 'Official Cameroon GCE Board Syllabuses & MINESEC Pedagogic Scheme of Work',
    sourceDomain: 'cameroongceboard.org',
    weeks: [
      {
        id: 'w1',
        week: 1,
        topic: 'Foundations of Algorithms and Problem Solving',
        subtopics: ['Definition of algorithm', 'Properties of effective algorithms', 'Pseudocode vs Flowcharts', 'Standard GCE Pseudocode conventions'],
        learningObjectives: [
          'Define an algorithm and list its primary characteristics (finiteness, definiteness, inputs, outputs, effectiveness).',
          'Translate simple real-life processes into flowcharts and standardized pseudocode.',
          'Identify common pseudocode syntax constructs (INPUT, OUTPUT, IF-THEN-ELSE, WHILE, FOR).'
        ],
        competencies: ['Algorithmic Thinking', 'Problem Decomposition'],
        activities: ['Tracing daily morning routine as a flowchart', 'Writing pseudocode for calculating average of three numbers'],
        practicalWork: 'Hands-on pseudocode trace tables in Edulpha IDE',
        assessment: 'Paper 2 Section A Algorithmic Construction drill (20 Marks)',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w2',
        week: 2,
        topic: 'Control Structures & Trace Tables',
        subtopics: ['Sequence, Selection, and Iteration', 'Count-controlled loops (FOR)', 'Condition-controlled loops (WHILE, REPEAT-UNTIL)', 'Trace Tables with dry running'],
        learningObjectives: [
          'Distinguish between pre-tested (WHILE) and post-tested (REPEAT-UNTIL) loops.',
          'Accurately construct trace tables to monitor variable state changes through iterative cycles.',
          'Identify infinite loops and off-by-one errors in GCE exam scenarios.'
        ],
        competencies: ['Analytical Debugging', 'Step-by-step Trace Execution'],
        activities: ['Constructing trace tables for prime number test', 'Translating nested IF constructs into CASE statements'],
        practicalWork: 'Dry-running pseudocode loops with multiple test cases',
        assessment: '10 MCQ diagnostic questions + 1 structured trace table question',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w3',
        week: 3,
        topic: 'Data Types, Arrays & Linear Data Structures',
        subtopics: ['Primitive Data Types (INTEGER, REAL, BOOLEAN, CHAR, STRING)', 'One-Dimensional Arrays', 'Two-Dimensional Arrays', 'Array Traversal, Insertion, and Deletion'],
        learningObjectives: [
          'Declare and index 1D and 2D arrays using 0-based and 1-based conventions.',
          'Write pseudocode to find maximum, minimum, and average in an array of size N.',
          'Perform linear array search and analyze worst-case time complexity.'
        ],
        competencies: ['Memory Representation', 'Array Manipulation'],
        activities: ['Pseudocode for grade recording in a class of 50 students', 'Matrix representation for a 3x3 tic-tac-toe grid'],
        practicalWork: 'Array manipulation exercises with step-by-step memory pointer explanation',
        assessment: 'GCE Paper 2 Section A array manipulation exercise',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w4',
        week: 4,
        topic: 'Modular Programming: Procedures and Functions',
        subtopics: ['Subroutines (Procedures vs Functions)', 'Parameters (By Value vs By Reference)', 'Local vs Global Scope', 'Standard built-in math and string functions'],
        learningObjectives: [
          'Differentiate between procedures (no return value) and functions (returns single value).',
          'Analyze side effects of passing arguments by reference versus passing by value.',
          'Modularize a monolithic program into reusable, single-responsibility subroutines.'
        ],
        competencies: ['Code Modularity', 'Scope Resolution'],
        activities: ['Writing a function to check leap years', 'Designing a modular student management system blueprint'],
        practicalWork: 'Implementing helper functions for string reversal and mathematical exponentiation',
        assessment: 'Subroutine specification and parameter tracking problem set',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w5',
        week: 5,
        topic: 'Searching and Sorting Algorithms',
        subtopics: ['Linear Search', 'Binary Search', 'Bubble Sort', 'Insertion Sort', 'Time and Space Complexity overview (Big O Notation)'],
        learningObjectives: [
          'Implement and dry-run Linear and Binary Search algorithms.',
          'Explain why Binary Search requires sorted datasets and has O(log n) efficiency.',
          'Trace Bubble Sort passes and count swap operations for a given list of numbers.'
        ],
        competencies: ['Algorithm Optimization', 'Complexity Analysis'],
        activities: ['Tracing Bubble Sort passes on [64, 34, 25, 12, 22, 11, 90]', 'Visual binary search partition tree'],
        practicalWork: 'Step-by-step animated sorting trace tool in Edulpha CS Assistant',
        assessment: 'Comparative essay on Binary vs Linear search with GCE Paper 2 past questions',
        recommendedDuration: '5 hours'
      },
      {
        id: 'w6',
        week: 6,
        topic: 'Data Representation: Number Systems & Conversions',
        subtopics: ['Binary, Octal, Decimal, and Hexadecimal systems', 'Base conversions', 'Binary Addition, Subtraction, and Multiplication', 'Two’s Complement representation of negative integers'],
        learningObjectives: [
          'Convert integers between base 2, base 8, base 10, and base 16 seamlessly.',
          'Represent signed integers using Sign and Magnitude and Two’s Complement.',
          'Detect and explain arithmetic overflow conditions in fixed-width registers (8-bit, 16-bit).'
        ],
        competencies: ['Binary Arithmetic', 'Low-level Numerical Encoding'],
        activities: ['Converting negative numbers to 8-bit two’s complement', 'Hexadecimal color code decoding'],
        practicalWork: 'Binary register arithmetic exercises with overflow flags',
        assessment: 'Timed arithmetic calculation quiz (15 minutes)',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w7',
        week: 7,
        topic: 'Floating-Point Representation & Normalization',
        subtopics: ['Real Numbers in Binary', 'Mantissa and Exponent representation', 'Normalization of floating-point numbers', 'Underflow, Overflow, and Rounding Errors'],
        learningObjectives: [
          'Explain why real numbers cannot always be represented with 100% precision in binary.',
          'Convert a normalized floating-point binary value into its decimal equivalent.',
          'Normalize un-normalized mantissa/exponent representations to maximize accuracy.'
        ],
        competencies: ['Precision Analysis', 'Scientific Number Representation'],
        activities: ['Normalizing positive and negative floating point binary words', 'Calculating precision limits of an 8-bit mantissa'],
        practicalWork: 'Interactive floating-point visualizer tool',
        assessment: 'GCE Paper 2 floating-point normalization problem set',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w8',
        week: 8,
        topic: 'Character Encoding & Data Compression',
        subtopics: ['ASCII and Extended ASCII', 'Unicode (UTF-8, UTF-16, UTF-32)', 'Lossless vs Lossy Compression', 'Run-Length Encoding (RLE) and Huffman Coding'],
        learningObjectives: [
          'Explain why Unicode was developed to supersede 7-bit ASCII for global multilingual support.',
          'Calculate compression ratios achieved by Run-Length Encoding on bitmap strings.',
          'Construct Huffman frequency trees and generate optimal prefix codes.'
        ],
        competencies: ['Encoding Standards', 'Information Compression'],
        activities: ['Building a Huffman tree for the word "ABRACADABRA"', 'Calculating storage requirements for text documents'],
        practicalWork: 'Huffman code generation practice in Edulpha CS Studio',
        assessment: 'Structured exam questions on Run-Length Encoding and Huffman trees',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w9',
        week: 9,
        topic: 'Boolean Algebra & Logic Gates',
        subtopics: ['Basic Gates (AND, OR, NOT)', 'Derived Gates (NAND, NOR, XOR, XNOR)', 'Truth Tables for composite logic circuits', 'De Morgan’s Laws and Boolean simplification'],
        learningObjectives: [
          'Write down truth tables for composite logic circuits with up to 3 inputs.',
          'State and apply De Morgan’s Laws to simplify Boolean algebraic expressions.',
          'Explain why NAND and NOR are known as universal logic gates.'
        ],
        competencies: ['Circuit Design', 'Algebraic Minimization'],
        activities: ['Proving NAND universality by constructing AND, OR, and NOT gates', 'Simplifying Boolean expressions using identities'],
        practicalWork: 'Virtual Lab logic gate circuit simulator',
        assessment: 'GCE Paper 2 Boolean simplification and circuit drawing questions',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w10',
        week: 10,
        topic: 'Computer Architecture: The CPU & Von Neumann Model',
        subtopics: ['Von Neumann Architecture vs Harvard Architecture', 'CPU Components: ALU, CU, Registers (PC, MAR, MDR, CIR, ACC)', 'Buses: Data, Address, Control Bus', 'The Fetch-Decode-Execute (FDE) Cycle'],
        learningObjectives: [
          'Diagram the Von Neumann architecture and label all internal registers and system buses.',
          'Describe the step-by-step register transfer operations of the Fetch-Decode-Execute cycle.',
          'Explain the factors affecting CPU performance (Clock speed, Cache size, Number of Cores, Bus width).'
        ],
        competencies: ['Hardware Architecture Understanding', 'Register-Level Tracing'],
        activities: ['Writing the register transfer notation (RTN) for the fetch phase', 'Comparing 32-bit vs 64-bit architecture data throughput'],
        practicalWork: 'Virtual CPU Simulator running assembly instructions step-by-step',
        assessment: 'Comprehensive essay on the FDE cycle with register state diagrams',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w11',
        week: 11,
        topic: 'Memory Hierarchy: Cache, RAM, ROM & Secondary Storage',
        subtopics: ['Memory Hierarchy (Registers, L1/L2/L3 Cache, Main Memory, Secondary Storage)', 'Volatile vs Non-Volatile Memory', 'SRAM vs DRAM', 'Secondary Storage Technologies: Magnetic, Optical, Solid-State (Flash)'],
        learningObjectives: [
          'Compare the speed, capacity, and cost-per-byte across the memory hierarchy pyramid.',
          'Explain the operating principles, advantages, and limitations of Solid-State Drives (SSDs) versus Magnetic Hard Disk Drives (HDDs).',
          'Describe the role of virtual memory and explain page swapping and thrashing.'
        ],
        competencies: ['Hardware Selection', 'Memory Management Evaluation'],
        activities: ['Calculating disk storage capacity and transfer times for multimedia files', 'Case study on SSD wear leveling and flash longevity'],
        practicalWork: 'Interactive storage comparison matrix and access time calculations',
        assessment: '15 MCQ questions + 1 GCE Paper 2 comparative hardware question',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w12',
        week: 12,
        topic: 'Term 1 Synthesis, Exam Review & Full Mock Assessment',
        subtopics: ['Holistic review of Weeks 1-11', 'GCE Paper 1 MCQ Exam Technique', 'GCE Paper 2 Structured Question Methodologies', 'Remedial focus on student identified weak areas'],
        learningObjectives: [
          'Synthesize concepts across algorithmic design, low-level data representation, and processor architecture.',
          'Apply GCE marking guide strategies to maximize marks in structured theory questions.',
          'Demonstrate mastery in a full-length 50-question mock assessment.'
        ],
        competencies: ['Exam Readiness', 'Knowledge Integration'],
        activities: ['Reviewing past GCE Chief Examiner reports and recurring student pitfalls', 'Peer review of pseudocode answers'],
        practicalWork: 'Full Term 1 Mock Exam under timed conditions in Edulpha Exam Portal',
        assessment: 'Full 50 MCQ Paper 1 + 4 Structured Questions Paper 2 (100 Marks)',
        recommendedDuration: '5 hours'
      }
    ]
  },
  'gce_ol_ict_term1': {
    title: 'Cameroon GCE O-Level ICT (Term 1)',
    subject: 'ICT',
    subjectId: 'ict_olevel',
    level: 'Ordinary Level',
    levelId: 'ordinary_level',
    specialty: 'General Studies',
    academicYear: '2025/2026',
    term: 1,
    version: 1,
    status: 'APPROVED',
    sourceType: 'manual',
    sourceTitle: 'Official Cameroon GCE Board O-Level ICT Syllabus',
    sourceDomain: 'cameroongceboard.org',
    weeks: [
      {
        id: 'w1',
        week: 1,
        topic: 'Introduction to Information and Communication Technology (ICT)',
        subtopics: ['Data vs Information', 'Components of an ICT System (Hardware, Software, People, Procedures, Data)', 'Role of ICT in modern society (Education, Banking, Healthcare, Commerce)'],
        learningObjectives: [
          'Differentiate between raw data and meaningful information with everyday examples.',
          'Identify and describe the 5 main components of any complete ICT system.',
          'List advantages and disadvantages of ICT adoption in Cameroonian schools and hospitals.'
        ],
        competencies: ['Digital Literacy', 'Concept Differentiation'],
        activities: ['Categorizing items as data or information', 'Group discussion on mobile money impacts in Cameroon'],
        practicalWork: 'ICT components classification chart in Edulpha',
        assessment: '10 MCQ diagnostic questions on foundational ICT concepts',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w2',
        week: 2,
        topic: 'Hardware: Input Devices',
        subtopics: ['Manual Input Devices (Keyboard, Mouse, Touchpad, Joystick)', 'Automated / Direct Data Entry Devices (Barcode reader, RFID, OMR, OCR, MICR, Biometric scanner)', 'Selecting appropriate input devices for specific scenarios'],
        learningObjectives: [
          'Describe the operation of common manual and automated input devices.',
          'Compare manual data entry vs direct data entry (speed, accuracy, cost).',
          'Recommend suitable input devices for supermarket POS and national examination marking.'
        ],
        competencies: ['Hardware Identification', 'Device Selection'],
        activities: ['Matching scenarios with optimal input devices', 'Barcode vs QR code comparison'],
        practicalWork: 'Interactive input device simulator',
        assessment: 'Structured exam questions from past GCE O-Level papers',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w3',
        week: 3,
        topic: 'Hardware: Output Devices',
        subtopics: ['Visual Output (Monitors: LCD, LED, OLED; Projectors)', 'Hardcopy Output (Printers: Inkjet, Laser, Dot Matrix; Plotters)', 'Audio Output (Speakers, Headphones)', 'Actuators and Control Devices'],
        learningObjectives: [
          'Differentiate between laser and inkjet printers regarding initial cost, running cost, and quality.',
          'Explain why plotters are used in architectural engineering instead of standard printers.',
          'Describe the role of actuators in automated temperature control and irrigation systems.'
        ],
        competencies: ['Output Evaluation', 'Specification Matching'],
        activities: ['Cost-benefit analysis of printers for a school printing office', 'Investigating actuator uses in smart agriculture'],
        practicalWork: 'Virtual printer specification matching exercise',
        assessment: 'Paper 1 MCQ drill on output technologies',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w4',
        week: 4,
        topic: 'Storage Devices & Media',
        subtopics: ['Primary Memory (RAM vs ROM)', 'Secondary Storage Categories (Magnetic, Optical, Solid State)', 'Capacity Units (Bit, Byte, KB, MB, GB, TB, PB)', 'Storage media selection criteria'],
        learningObjectives: [
          'State key differences between RAM (volatile, read/write) and ROM (non-volatile, read-only).',
          'Convert storage capacities across Byte, Kilobyte, Megabyte, and Gigabyte.',
          'Select the most appropriate secondary storage medium for backup, distribution, and portable use.'
        ],
        competencies: ['Memory Calculation', 'Storage Management'],
        activities: ['Calculating how many songs or photos fit on a 64GB USB drive', 'RAM vs ROM comparison table'],
        practicalWork: 'Storage capacity calculation practice module',
        assessment: 'GCE O-Level Paper 2 question on storage device selection',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w5',
        week: 5,
        topic: 'Software: System Software & Operating Systems',
        subtopics: ['Application Software vs System Software', 'Functions of an Operating System (Processor, Memory, Device, File, Security management)', 'User Interfaces (CLI, GUI, Touch-based)', 'Utility Programs (Antivirus, Disk Defragmenter, Backup, Compression)'],
        learningObjectives: [
          'List and explain at least five primary responsibilities of an operating system.',
          'Compare Command Line Interfaces (CLI) with Graphical User Interfaces (GUI).',
          'Describe the necessity of regular disk defragmentation and automated data backup.'
        ],
        competencies: ['Software Categorization', 'OS Navigation'],
        activities: ['Comparing Windows, macOS, Linux, and Android interfaces', 'Investigating utility program functions'],
        practicalWork: 'Exploring operating system settings and task management virtually',
        assessment: 'Structured exam questions on OS functions and utility tools',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w6',
        week: 6,
        topic: 'Application Software: Word Processing & Document Design',
        subtopics: ['Key features of Word Processors (Formatting, Styles, Tables, Mail Merge, Spell Check)', 'Header, Footer, Footnotes, Table of Contents', 'Document design principles for professional publications'],
        learningObjectives: [
          'Explain how the Mail Merge feature functions and its benefits for mass communication.',
          'Describe formatting tools that improve document hierarchy and readability.',
          'Identify common word processing errors and how proofing tools assist the user.'
        ],
        competencies: ['Document Production', 'Efficiency in Word Processing'],
        activities: ['Designing a formal school invitation letter using mail merge concepts', 'Creating formatted academic tables'],
        practicalWork: 'Interactive word processing practical tasks in Edulpha LMS',
        assessment: 'Paper 3 Practical Simulation on document formatting',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w7',
        week: 7,
        topic: 'Spreadsheets: Data Analysis & Formulas',
        subtopics: ['Spreadsheet Concepts (Workbooks, Worksheets, Cells, Rows, Columns, Ranges)', 'Formulas and Operators (+, -, *, /, ^)', 'Basic Functions (SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, IF)', 'Absolute ($A$1) vs Relative (A1) Cell Referencing'],
        learningObjectives: [
          'Write correct spreadsheet formulas using mathematical operators and standard functions.',
          'Explain the behavioral difference between relative and absolute cell references when replicating formulas.',
          'Construct simple single-level IF statements to assign Pass/Fail grades.'
        ],
        competencies: ['Quantitative Analysis', 'Formula Logic'],
        activities: ['Creating a termly student grade report sheet with SUM and AVERAGE', 'Applying absolute references for VAT tax calculation'],
        practicalWork: 'Spreadsheet formula builder in Edulpha Practical Lab',
        assessment: 'GCE O-Level Paper 3 spreadsheet exercise (20 Marks)',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w8',
        week: 8,
        topic: 'Spreadsheets: Data Visualization & Filtering',
        subtopics: ['Chart Types (Column, Bar, Line, Pie) and when to use each', 'Sorting data (Ascending / Descending, Multi-level)', 'Filtering data using criteria', 'Conditional Formatting for visual insights'],
        learningObjectives: [
          'Select the most suitable chart type to display percentages (Pie) versus trends over time (Line).',
          'Sort and filter data records without compromising data integrity across adjacent columns.',
          'Apply conditional formatting rules to highlight scores below pass mark.'
        ],
        competencies: ['Data Visualization', 'Information Filtering'],
        activities: ['Generating sales trend charts', 'Applying multi-level sort on student records (Class, then Surname)'],
        practicalWork: 'Interactive chart creation and filter laboratory',
        assessment: 'Structured exam questions on chart interpretation',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w9',
        week: 9,
        topic: 'Computer Networks: Fundamentals & Topologies',
        subtopics: ['Definition and benefits of networking', 'Network Types: LAN, WAN, MAN, PAN, WLAN', 'Network Topologies: Star, Bus, Ring, Mesh', 'Network Hardware: NIC, Switch, Router, Modem, Cables (UTP, Fiber Optic)'],
        learningObjectives: [
          'Differentiate between LAN (Local Area Network) and WAN (Wide Area Network).',
          'Draw and describe the advantages and disadvantages of Star vs Bus network topologies.',
          'Explain the role of a router in directing packets between different networks.'
        ],
        competencies: ['Network Architecture', 'Topology Comparison'],
        activities: ['Designing a school computer lab star network diagram', 'Comparing fiber optic vs copper twisted-pair cabling'],
        practicalWork: 'Network topology builder in Edulpha Virtual Lab',
        assessment: 'GCE O-Level Paper 2 network diagram question',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w10',
        week: 10,
        topic: 'The Internet, World Wide Web & Digital Communication',
        subtopics: ['Internet vs World Wide Web', 'Web Browsers vs Search Engines', 'URL structure (Protocol, Domain, Path)', 'Digital communication tools: Email, Instant Messaging, Video Conferencing, Cloud Storage'],
        learningObjectives: [
          'Explain that the Internet is the global network infrastructure while the Web is a service on top of it.',
          'Break down a complete URL into its constituent components.',
          'Describe the structure of an email address and explain the functions of To, Cc, Bcc, and Subject lines.'
        ],
        competencies: ['Internet Navigation', 'Communication Etiquette'],
        activities: ['Deconstructing URLs from top academic institutions', 'Comparing Bcc vs Cc privacy implications in email'],
        practicalWork: 'Search query optimization and domain identification drill',
        assessment: '15 MCQ questions on Internet protocols and services',
        recommendedDuration: '3 hours'
      },
      {
        id: 'w11',
        week: 11,
        topic: 'Cybersecurity, Privacy & Computer Ethics',
        subtopics: ['Cyber Threats (Malware: Viruses, Worms, Trojans, Spyware, Ransomware; Phishing)', 'Protection Measures (Firewalls, Antivirus, Strong Passwords, Two-Factor Authentication)', 'Data Protection, Copyright, Plagiarism, and Software Piracy', 'Health and Safety (Ergonomics, Repetitive Strain Injury, Eye Strain)'],
        learningObjectives: [
          'Define common forms of malware and explain how social engineering (phishing) operates.',
          'Explain why two-factor authentication (2FA) significantly improves account security.',
          'Identify ergonomic hazards in a computer workplace and prescribe corrective posture and furniture adjustments.'
        ],
        competencies: ['Security Awareness', 'Ethical Conduct', 'Ergonomic Health'],
        activities: ['Analyzing sample phishing emails to spot red flags', 'Ergonomic workstation audit checklist'],
        practicalWork: 'Cyber threat mitigation scenario walkthrough',
        assessment: 'Structured case study question on organizational data breach',
        recommendedDuration: '4 hours'
      },
      {
        id: 'w12',
        week: 12,
        topic: 'Term 1 Comprehensive Review & O-Level Mock Examination',
        subtopics: ['Comprehensive review of Hardware, Software, Spreadsheets, Networks, and Security', 'GCE O-Level Paper 1 MCQ techniques (managing 50 questions in 90 minutes)', 'Paper 2 structured question answer formatting', 'Student weakness remediation'],
        learningObjectives: [
          'Review key terminology and definitions required by the Cameroon GCE marking guide.',
          'Eliminate common misconceptions across hardware components and software types.',
          'Complete a timed full-length diagnostic assessment to establish baseline grade.'
        ],
        competencies: ['Exam Competence', 'Knowledge Consolidation'],
        activities: ['Past GCE paper speed drill', 'Common pitfalls discussion based on Chief Examiner reports'],
        practicalWork: 'Complete Paper 1 (50 MCQs) + Paper 2 (Theory) mock exam session',
        assessment: 'Full Term 1 GCE O-Level ICT Mock Examination (100 Marks)',
        recommendedDuration: '4 hours'
      }
    ]
  },
  'fr_term_math_trim1': {
    title: 'Programme MINESEC Terminale C - Mathématiques (Trimestre 1)',
    subject: 'Mathématiques',
    subjectId: 'math_terminale_c',
    level: 'Terminale',
    levelId: 'terminale',
    specialty: 'Série C (Sciences Exactes)',
    academicYear: '2025/2026',
    term: 1,
    version: 1,
    status: 'APPROVED',
    sourceType: 'manual',
    sourceTitle: 'Programme Officiel MINESEC / Inspection de Pédagogie des Sciences Mathématiques',
    sourceDomain: 'minesec.gov.cm',
    weeks: [
      {
        id: 'w1',
        week: 1,
        topic: 'Limites et Continuité des Fonctions Numériques',
        subtopics: ['Définition rigoureuse de la limite', 'Opérations sur les limites et formes indéterminées', 'Théorèmes de comparaison (Théorème des Gendarmes)', 'Continuité en un point et sur un intervalle', 'Théorème des Valeurs Intermédiaires (TVI)'],
        learningObjectives: [
          'Lever les formes indéterminées classiques (0/0, inf/inf, 0*inf, inf-inf) par factorisation, quantité conjuguée et taux d’accroissement.',
          'Démontrer qu’une équation f(x) = 0 admet au moins une solution réelle en utilisant le TVI.',
          'Appliquer le corollaire du TVI pour établir l’existence et l’unicité d’une solution lorsque f est strictement monotone.'
        ],
        competencies: ['Raisonnement Analytique', 'Démonstration Rigoureuse'],
        activities: ['Exercices de levée d’indéterminée avec expressions trigonométriques', 'Encadrement de solutions par dichotomie'],
        practicalWork: 'Visualisation graphique de la continuité sur Edulpha Lab',
        assessment: 'Devoir surveillé de 1h sur les limites et l’application du TVI',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w2',
        week: 2,
        topic: 'Dérivabilité et Étude des Fonctions',
        subtopics: ['Nombre dérivé et interprétation géométrique (Tangente)', 'Dérivabilité sur un intervalle et fonctions dérivées usuelles', 'Dérivée d’une fonction composée (g o f)', 'Sens de variation et extremums', 'Théorème des Accroissements Finis (TAF) et Inégalité des Accroissements Finis (IAF)'],
        learningObjectives: [
          'Calculer la dérivée de fonctions composées de type f(ax+b), (u)^n, sqrt(u).',
          'Dresser un tableau de variations complet avec limites aux bornes et extremums.',
          'Exploiter l’Inégalité des Accroissements Finis pour établir des encadrements et des convergences de suites.'
        ],
        competencies: ['Calcul Différentiel', 'Étude Complète de Fonctions'],
        activities: ['Étude complète d’une fonction rationnelle avec asymptote oblique', 'Application du TAF pour encadrer sin(x)'],
        practicalWork: 'Tracé de courbes représentatives et de leurs tangentes',
        assessment: 'Problème type Baccalauréat C sur l’étude d’une fonction auxiliaire',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w3',
        week: 3,
        topic: 'Fonctions Primitives et Équations Différentielles Simples',
        subtopics: ['Notion de primitive d’une fonction continue', 'Primitives des fonctions usuelles et opérations', 'Primitives avec conditions initiales', 'Équations différentielles linéaires du 1er ordre: y’ = ay et y’ = ay + b'],
        learningObjectives: [
          'Déterminer les primitives d’une fonction en reconnaissant les formes u’*u^n, u’/u, u’*e^u.',
          'Résoudre les équations différentielles linéaires du premier ordre avec condition initiale.',
          'Modéliser des phénomènes physiques (décroissance radioactive, vitesse limite) par des équations différentielles.'
        ],
        competencies: ['Calcul Intégral Préparatoire', 'Modélisation Différentielle'],
        activities: ['Recherche de primitives avec changement d’écriture algébrique', 'Résolution de problèmes physiques issus des annales du Bac'],
        practicalWork: 'Exercices d’automatisation des calculs de primitives',
        assessment: 'Interrogation écrite de 30 minutes sur les formules de primitives',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w4',
        week: 4,
        topic: 'Fonction Logarithme Népérien',
        subtopics: ['Définition comme primitive de 1/x s’annulant en 1', 'Propriétés algébriques fondamentales', 'Limites usuelles et croissances comparées', 'Étude de la fonction ln(x) et fonctions associées ln(u(x))', 'Logarithme décimal et applications'],
        learningObjectives: [
          'Simplifier des expressions algébriques à l’aide des propriétés du logarithme népérien.',
          'Résoudre des équations et inéquations comportant des logarithmes.',
          'Démontrer et utiliser les limites fondamentales de croissances comparées (ex: lim x*ln(x) en 0).'
        ],
        competencies: ['Maîtrise des Fonctions Transcendantes', 'Résolution Algébrique'],
        activities: ['Résolution d’équations logarithmiques avec recherche rigoureuse du domaine de validité', 'Étude de la fonction f(x) = ln(x)/x'],
        practicalWork: 'Tracé de la fonction ln et de ses asymptotes',
        assessment: 'Épreuve type Baccalauréat C (Partie A & B)',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w5',
        week: 5,
        topic: 'Fonction Exponentielle Népérienne',
        subtopics: ['Définition comme bijection réciproque de la fonction ln', 'Propriétés algébriques et variations', 'Limites usuelles et croissances comparées', 'Fonctions puissances et exponentielles de base a', 'Étude complète de fonctions comportant l’exponentielle'],
        learningObjectives: [
          'Exploiter la relation fondamentale e^(ln x) = x et ln(e^x) = x.',
          'Calculer les dérivées et limites de fonctions de la forme exp(u(x)).',
          'Résoudre des équations différentielles du type y’ - ay = 0.'
        ],
        competencies: ['Analyse Réelle Avancée', 'Calcul Algébrique Exponentiel'],
        activities: ['Étude de la fonction f(x) = (x-1)e^x + 1', 'Résolution de systèmes non linéaires à inconnues exponentielles'],
        practicalWork: 'Tracé comparatif des courbes de ln(x), exp(x) et de la droite y = x',
        assessment: 'Devoir surveillé de 2 heures sur ln et exponentielle',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w6',
        week: 6,
        topic: 'Suites Numériques: Convergence et Récurrence',
        subtopics: ['Principe du raisonnement par récurrence', 'Suites arithmétiques et géométriques (rappels et approfondissements)', 'Majoration, minoration et monotonie', 'Théorème de convergence monotone', 'Suites adjacentes et suites récurrentes un+1 = f(un)'],
        learningObjectives: [
          'Rédiger une démonstration par récurrence rigoureuse (Initialisation, Hérédité, Conclusion).',
          'Démontrer qu’une suite croissante et majorée converge vers une limite finie.',
          'Étudier le comportement asymptotique d’une suite récurrente un+1 = f(un) à l’aide du point fixe.'
        ],
        competencies: ['Raisonnement par Récurrence', 'Étude Asymptotique'],
        activities: ['Démonstration de l’inégalité de Bernoulli par récurrence', 'Étude de suites arithmético-géométriques'],
        practicalWork: 'Simulation de convergence de suites sur tableur virtuel Edulpha',
        assessment: 'Exercice complet de suite extrait d’un sujet officiel du Baccalauréat C',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w7',
        week: 7,
        topic: 'Arithmétique dans l’ensemble des Entiers Relatifs Z',
        subtopics: ['Divisibilité dans Z et division euclidienne', 'PGCD et algorithme d’Euclide', 'Théorème de Bézout et identité de Bézout (au + bv = d)', 'Théorème de Gauss et conséquences', 'Nombres premiers, décomposition en facteurs premiers', 'Congruences modulo n'],
        learningObjectives: [
          'Déterminer le PGCD de deux entiers et trouver une solution particulière de l’équation ax + by = c par l’algorithme d’Euclide étendu.',
          'Résoudre des équations diophantiennes dans Z x Z.',
          'Utiliser les congruences pour étudier la divisibilité et résoudre des systèmes d’équations modulaires.'
        ],
        competencies: ['Raisonnement Arithmétique', 'Résolution Diophantienne'],
        activities: ['Application du Petit Théorème de Fermat', 'Résolution de l’équation 17x - 11y = 3 dans Z²'],
        practicalWork: 'Algorithme d’Euclide pas à pas dans Edulpha Math Studio',
        assessment: 'Problème d’arithmétique de niveau Concours / Baccalauréat C (20 points)',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w8',
        week: 8,
        topic: 'Nombres Complexes: Forme Algébrique et Trigonométrique',
        subtopics: ['Définition de l’ensemble C et écriture algébrique z = a + ib', 'Conjugaison, module et propriétés', 'Forme trigonométrique et exponentielle z = r*e^(i*theta)', 'Formule de Moivre et formules d’Euler', 'Linéarisation d’expressions trigonométriques'],
        learningObjectives: [
          'Effectuer les opérations algébriques dans C (addition, multiplication, quotient).',
          'Passer avec aisance de la forme algébrique à la forme trigonométrique et exponentielle.',
          'Linéariser des puissances de cosinus et sinus pour la recherche future de primitives.'
        ],
        competencies: ['Calcul dans C', 'Maîtrise de la Géométrie Complexe'],
        activities: ['Linéarisation de cos^4(x)', 'Calcul des puissances z^n par la formule de Moivre'],
        practicalWork: 'Représentation vectorielle des nombres complexes dans le plan d’Argand',
        assessment: 'Devoir de synthèse sur les nombres complexes (1h30)',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w9',
        week: 9,
        topic: 'Nombres Complexes et Géométrie du Plan',
        subtopics: ['Affixe d’un point et d’un vecteur', 'Interprétation géométrique du module et de l’argument', 'Alignement, orthogonalité et cocyclicité', 'Transformations géométriques planes (Translation, Homothétie, Rotation)', 'Formes complexes des similitudes directes'],
        learningObjectives: [
          'Traduire géométriquement les égalités de modules et d’arguments (médiatrices, cercles, angles orientés).',
          'Caractériser une transformation du plan à partir de son écriture complexe z’ = az + b.',
          'Déterminer les éléments caractéristiques d’une similitude directe (centre, rapport, angle).'
        ],
        competencies: ['Synthèse Géométrique et Algébrique', 'Transformation du Plan'],
        activities: ['Détermination du lieu géométrique de points M(z) vérifiant |z-2i| = |z+1|', 'Caractérisation d’une rotation par son écriture complexe'],
        practicalWork: 'Simulateur géométrique de transformations planes',
        assessment: 'Exercice géométrique du Baccalauréat C avec similitudes',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w10',
        week: 10,
        topic: 'Espaces Vectoriels et Applications Linéaires',
        subtopics: ['Définition de la structure d’espace vectoriel sur R', 'Sous-espaces vectoriels et caractérisation', 'Familles libres, génératrices et bases', 'Dimension d’un espace vectoriel de dimension finie', 'Applications linéaires, noyau (Ker) et image (Im)', 'Théorème du rang'],
        learningObjectives: [
          'Démontrer qu’un sous-ensemble non vide est un sous-espace vectoriel.',
          'Vérifier si une famille de vecteurs est libre ou génératrice.',
          'Déterminer une base et la dimension du noyau et de l’image d’une application linéaire.'
        ],
        competencies: ['Algèbre Linéaire Fondamentale', 'Raisonnement Structurel'],
        activities: ['Vérification de la liberté d’une famille de trois vecteurs de R³', 'Application du théorème du rang pour prouver l’injectivité'],
        practicalWork: 'Calcul matriciel et échelonnement de Gauss sur Edulpha Lab',
        assessment: 'Problème d’algèbre linéaire de niveau Première Année Universitaire / Bac C',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w11',
        week: 11,
        topic: 'Calcul Intégral et Valeur Moyenne',
        subtopics: ['Intégrale d’une fonction continue par morceaux', 'Propriétés de l’intégrale (Linéarité, Relation de Chasles, Positivité)', 'Intégration par parties (IPP)', 'Calcul d’aires planes et valeur moyenne d’une fonction', 'Encadrements d’intégrales'],
        learningObjectives: [
          'Calculer des intégrales définies en utilisant des primitives directes ou l’intégration par parties.',
          'Calculer l’aire d’un domaine délimité par deux courbes sur un intervalle donné.',
          'Établir des inégalités intégrales à partir de la positivité.'
        ],
        competencies: ['Intégration Avancée', 'Calcul d’Aires'],
        activities: ['Calcul de l’intégrale de x*e^(-x) par IPP', 'Calcul de l’aire d’une boucle fermée'],
        practicalWork: 'Visualisation géométrique de l’aire sous la courbe par la méthode des rectangles',
        assessment: 'Devoir sur table de 2 heures sur l’intégration et les fonctions',
        recommendedDuration: '6 heures'
      },
      {
        id: 'w12',
        week: 12,
        topic: 'Synthèse du 1er Trimestre et Épreuve Blanche Type Baccalauréat C',
        subtopics: ['Révision intégrale des 11 premières semaines', 'Méthodologie de rédaction des épreuves de Mathématiques du Baccalauréat C', 'Gestion du temps (4 heures)', 'Correction détaillée et remédiation personnalisée'],
        learningObjectives: [
          'Mobiliser simultanément l’analyse (fonctions, suites), l’arithmétique et les nombres complexes sur une épreuve longue.',
          'Respecter les exigences de rigueur et de justification du jury de l’OBC.',
          'Identifier ses points de fragilité pour le plan de travail des congés de fin de trimestre.'
        ],
        competencies: ['Endurance Intellectuelle', 'Maîtrise de l’Examen National'],
        activities: ['Épreuve blanche complète en temps réel', 'Auto-évaluation guidée avec le barème officiel de correction'],
        practicalWork: 'Analyse statistique des erreurs récurrentes sur le tableau de bord élève',
        assessment: 'Épreuve Complète de Mathématiques Série C (4 heures, 20 points)',
        recommendedDuration: '6 heures'
      }
    ]
  }
};

// ===============================================================
// Progression Document Normalizer using Gemini
// ===============================================================

export async function normalizeProgressionDocument(
  rawText: string,
  metadata: {
    subject?: string;
    level?: string;
    specialty?: string;
    sourceTitle?: string;
    sourceUrl?: string;
    sourceDomain?: string;
    apiKey?: string;
  }
): Promise<Omit<ProgressionSheet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>> {
  const apiKey = metadata.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required to normalize progression document.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const prompt = `You are the Chief Pedagogic Inspector and Curriculum Normalizer for the Edulpha Educational Platform.
Analyze the following curriculum/progression sheet text and normalize it into a structured, week-by-week academic progression roadmap.

Context:
Target Subject: ${metadata.subject || 'Infer from text'}
Target Education Level: ${metadata.level || 'Infer from text (e.g. Ordinary Level, Advanced Level, Terminale)'}
Specialty: ${metadata.specialty || 'General / Science / Arts'}

The normalized progression MUST break down into 10 to 14 weeks of sequential teaching lessons.
For EVERY week, provide:
- "week": number (1, 2, 3, ...)
- "topic": concise, high-level topic title
- "subtopics": array of 3-5 specific subtopics
- "learningObjectives": array of 2-4 measurable, actionable learning objectives starting with verbs (e.g. "Identify...", "Explain...", "Calculate...")
- "competencies": array of 1-3 core competencies developed
- "activities": array of 1-3 learning activities
- "practicalWork": optional practical laboratory or simulation activity
- "assessment": suggested assessment or evaluation method
- "recommendedDuration": e.g. "4 hours"

Return ONLY a valid, parseable JSON object matching this schema exactly (no conversational text, no markdown backticks):
{
  "title": "Clear descriptive title of the progression sheet",
  "subject": "${metadata.subject || 'Detected Subject'}",
  "level": "${metadata.level || 'Detected Level'}",
  "specialty": "${metadata.specialty || 'General'}",
  "academicYear": "2025/2026",
  "term": 1,
  "version": 1,
  "weeks": [
    {
      "id": "w1",
      "week": 1,
      "topic": "Topic Title",
      "subtopics": ["Subtopic 1", "Subtopic 2"],
      "learningObjectives": ["Objective 1", "Objective 2"],
      "competencies": ["Competency 1"],
      "activities": ["Activity 1"],
      "practicalWork": "Practical work description",
      "assessment": "Assessment description",
      "recommendedDuration": "4 hours"
    }
  ]
}

Document Content to normalize:
${rawText.slice(0, 30000)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt
  });

  const rawJson = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse JSON from Gemini normalization:', rawJson);
    throw new Error('Gemini returned an invalid format. Please verify document contents.');
  }

  const weeks: ProgressionWeekLesson[] = Array.isArray(parsed.weeks) ? parsed.weeks.map((w: any, idx: number) => ({
    id: w.id || `w${w.week || idx + 1}`,
    week: Number(w.week || idx + 1),
    topic: String(w.topic || `Week ${idx + 1} Topic`),
    subtopics: Array.isArray(w.subtopics) ? w.subtopics.map(String) : [],
    learningObjectives: Array.isArray(w.learningObjectives) ? w.learningObjectives.map(String) : [],
    competencies: Array.isArray(w.competencies) ? w.competencies.map(String) : [],
    activities: Array.isArray(w.activities) ? w.activities.map(String) : [],
    practicalWork: w.practicalWork || '',
    assessment: w.assessment || '',
    recommendedDuration: w.recommendedDuration || '4 hours'
  })) : [];

  return {
    title: parsed.title || `${metadata.subject || 'Curriculum'} Progression Sheet`,
    subject: parsed.subject || metadata.subject || 'General',
    level: parsed.level || metadata.level || 'Ordinary Level',
    specialty: parsed.specialty || metadata.specialty || 'General',
    academicYear: parsed.academicYear || '2025/2026',
    term: Number(parsed.term || 1),
    version: 1,
    status: 'REVIEW_REQUIRED',
    sourceType: metadata.sourceUrl ? 'internet' : 'upload',
    sourceUrl: metadata.sourceUrl,
    sourceDomain: metadata.sourceDomain,
    sourceTitle: metadata.sourceTitle,
    weeks
  };
}

// ===============================================================
// Socratic AI Teaching Engine Prompts & Handlers
// ===============================================================

export interface LessonGenerationParams {
  subject: string;
  level: string;
  topic: string;
  subtopics: string[];
  learningObjectives: string[];
  week: number;
  difficulty?: MasteryDifficulty;
  language?: string;
  apiKey?: string;
}

export async function generateSocraticLesson(params: LessonGenerationParams): Promise<Partial<AILessonSession>> {
  const apiKey = params.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is required for lesson generation.');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const isFrench = params.language === 'fr' || 
    ['troisieme', 'seconde', 'premiere', 'terminale'].some(l => params.level.toLowerCase().includes(l));

  const prompt = isFrench ? `
Vous êtes le Professeur Numérique Edulpha AI pour le système éducatif officiel (MINESEC / Baccalauréat / BEPC).
Vous devez concevoir une LEÇON STRUCTURÉE, PÉDAGOGIQUE ET SOCRATIQUE pour un élève débutant ou intermédiaire.

Contexte Pédagogique:
- Matière: ${params.subject}
- Niveau: ${params.level}
- Semaine du Programme: Semaine ${params.week}
- Thème / Leçon du jour: ${params.topic}
- Sous-thèmes: ${params.subtopics.join(', ') || 'Concepts clés'}
- Objectifs Pédagogiques: ${params.learningObjectives.join('; ') || 'Comprendre et appliquer le cours'}
- Niveau de Difficulté Cible: ${params.difficulty || 'BEGINNER'}

Règles Pédagogiques Impératives:
1. Pédagogie bienveillante, progressive et structurée (Méthode Socratique).
2. Démarrez par une analogie concrète tirée du quotidien en Afrique / Cameroun (marché, cuisine, football, transport, vie de famille) pour rendre le concept immédiatement intuitif.
3. Décomposez l'explication étape par étape avec des définitions claires et du vocabulaire académique rigoureux.
4. Fournissez des exemples résolus pas à pas.
5. Intégrez une question d'entraînement guidé et 3 exercices d'application indépendante gradués (avec 4 niveaux d'indices progressifs).
6. Fournissez un mini-quiz de 3 questions avec explications complètes.
7. Si la matière est l'Informatique, intégrez un algorithme / pseudo-code commenté.
8. Si la matière est la Physique ou la Chimie, mentionnez le lien avec les travaux pratiques ou le laboratoire virtuel Edulpha (ex: dosage, circuits).

Renvoyez UNIQUEMENT un objet JSON valide suivant ce format exact (sans texte additionnel):
{
  "lessonTitle": "Titre captivant de la leçon",
  "objectives": ["Objectif 1", "Objectif 2"],
  "prerequisites": ["Prérequis 1", "Prérequis 2"],
  "introduction": "Introduction motivante et mise en contexte",
  "realWorldAnalogy": "Analogie concrète et imagée du quotidien",
  "explanation": "Corps complet et détaillé de la leçon en plusieurs sous-parties claires avec puces",
  "examples": ["Exemple 1 résolu pas à pas", "Exemple 2 appliqué"],
  "guidedPracticeQuestion": "Question où le professeur commence la résolution et guide l'élève",
  "independentExercises": [
    {
      "id": "ex1",
      "question": "Énoncé de l'exercice",
      "type": "ShortAnswer",
      "difficulty": "BEGINNER",
      "hints": [
        "Indice 1 (Piste conceptuelle)",
        "Indice 2 (Direction vers la formule)",
        "Indice 3 (Début du calcul)",
        "Indice 4 (Résolution guidée complète)"
      ],
      "correctAnswer": "Réponse attendue",
      "solutionExplanation": "Explication détaillée de la correction"
    }
  ],
  "miniQuiz": [
    {
      "question": "Question QCM",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Pourquoi cette réponse est correcte selon le programme"
    }
  ],
  "summary": "Résumé des 3 points essentiels à retenir absolument",
  "homework": "Petit travail d'application pour consolider la leçon",
  "masteryCheck": "Question bilan pour vérifier si l'élève est prêt pour la leçon suivante"
}
` : `
You are the Edulpha AI Digital Teacher for the Cameroon GCE (Ordinary/Advanced Level) and official syllabus.
You are designing a structured, patient, curriculum-aware lesson for a student following their assigned progression sheet.

Pedagogical Context:
- Subject: ${params.subject}
- Level: ${params.level}
- Progression Week: Week ${params.week}
- Lesson Topic: ${params.topic}
- Subtopics: ${params.subtopics.join(', ') || 'Core concepts'}
- Learning Objectives: ${params.learningObjectives.join('; ') || 'Understand and apply core concepts'}
- Target Difficulty: ${params.difficulty || 'BEGINNER'}

Pedagogical Directives:
1. Patient, Socratic, beginner-first approach. Never assume prior knowledge without gentle bridging.
2. Begin with a relatable real-world analogy grounded in everyday life (e.g. market trading, telephone networks, cooking recipes, vehicle mechanics) to make the abstract concept tangible.
3. Detailed step-by-step explanation with clear headers and bullet points.
4. Concrete worked examples with all intermediate steps shown clearly.
5. Provide a guided practice question and 3 independent practice exercises featuring a 4-tier progressive hint ladder:
   - Hint 1: Conceptual clue
   - Hint 2: Specific formula or direction
   - Hint 3: Partial mathematical or code step
   - Hint 4: Detailed walkthrough
6. 3 Mini-quiz questions with comprehensive marking scheme explanations.
7. For Computer Science, include structured pseudocode or algorithm trace tables.
8. For Sciences (Physics/Chemistry/Biology), include a link/reference to hands-on practicals or Edulpha Virtual Labs.

Return ONLY a valid JSON object matching this schema (no extra text, no markdown wrappers):
{
  "lessonTitle": "Engaging lesson title",
  "objectives": ["Objective 1", "Objective 2"],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "introduction": "Engaging introduction to hook the student's curiosity",
  "realWorldAnalogy": "Everyday real-world analogy explaining the core idea",
  "explanation": "Comprehensive structured explanation with sections and clear breakdown",
  "examples": ["Step-by-step worked example 1", "Real examination context example 2"],
  "guidedPracticeQuestion": "A guided problem where the AI teacher scaffolds the solution",
  "independentExercises": [
    {
      "id": "ex1",
      "question": "Practice exercise question",
      "type": "ProblemSolving",
      "difficulty": "BEGINNER",
      "hints": [
        "Hint 1 (Conceptual Clue): Think about...",
        "Hint 2 (Specific Direction): Recall the formula...",
        "Hint 3 (Partial Step): Substitute the values...",
        "Hint 4 (Detailed Guidance): Final calculation step..."
      ],
      "correctAnswer": "Exact numerical or theoretical answer",
      "solutionExplanation": "Full step-by-step marking guide"
    }
  ],
  "miniQuiz": [
    {
      "question": "Multiple choice question",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Why this option is correct based on the GCE marking guide"
    }
  ],
  "summary": "Key take-away summary points and GCE exam alert",
  "homework": "Recommended homework exercise to cement mastery",
  "masteryCheck": "Mastery check question to verify if the student is ready to advance"
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt
  });

  const rawJson = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(rawJson);

  return {
    lessonTitle: parsed.lessonTitle || params.topic,
    objectives: parsed.objectives || params.learningObjectives,
    prerequisites: parsed.prerequisites || [],
    introduction: parsed.introduction || '',
    explanation: parsed.explanation || '',
    realWorldAnalogy: parsed.realWorldAnalogy || '',
    examples: parsed.examples || [],
    guidedPracticeQuestion: parsed.guidedPracticeQuestion || '',
    independentExercises: parsed.independentExercises || [],
    miniQuiz: parsed.miniQuiz || [],
    summary: parsed.summary || '',
    homework: parsed.homework || '',
    masteryCheck: parsed.masteryCheck || ''
  };
}

// ===============================================================
// Interactive Socratic Dialogue Handler
// ===============================================================

export interface SocraticChatParams {
  studentMessage: string;
  intent?: 'TEACH_ME' | 'I_DONT_UNDERSTAND' | 'GIVE_HINT' | 'EXPLAIN_AGAIN' | 'SHOW_EXAMPLE' | 'REVIEW_PREVIOUS' | 'WHAT_NEXT' | 'GENERAL_QUESTION';
  hintLevel?: number; // 1, 2, 3, 4
  currentWeek: number;
  currentTopic: string;
  currentSubtopic?: string;
  subject: string;
  level: string;
  masteryLevel: MasteryDifficulty;
  history: { sender: 'student' | 'teacher'; text: string }[];
  language?: string;
  apiKey?: string;
}

export async function processSocraticTeacherChat(params: SocraticChatParams): Promise<{
  reply: string;
  actionTaken: string;
  hintProvided?: string;
  suggestedAction?: string;
  virtualLabSuggested?: string;
}> {
  const apiKey = params.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is required for AI Teacher chat.');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const isFrench = params.language === 'fr';

  const historyFormatted = params.history.slice(-6).map(h => `${h.sender === 'student' ? 'Student' : 'AI Teacher'}: ${h.text}`).join('\n');

  const systemInstruction = isFrench ? `
Vous êtes le Professeur Numérique Edulpha AI, un enseignant patient, méthodique, encourageant et rigoureux du système éducatif camerounais (MINESEC/OBC).
Vous enseignez selon la FEUILLE DE PROGRESSION OFFICIELLE.

Situation Actuelle:
- Matière: ${params.subject}
- Niveau: ${params.level}
- Semaine Actuelle: Semaine ${params.currentWeek}
- Thème de la Semaine: ${params.currentTopic}
- Sous-thème: ${params.currentSubtopic || 'Général'}
- Niveau de Maîtrise de l'Élève: ${params.masteryLevel}
- Intention Détectée: ${params.intent || 'GENERAL_QUESTION'}

Règles Strictes de l'Enseignant AI:
1. Ne vous comportez JAMAIS comme un simple chatbot ou un moteur de recherche. Vous êtes un véritable PROFESSEUR EN CLASSE.
2. Si l'élève dit "JE NE COMPRENDS PAS":
   - Ne répétez SURTOUT PAS la même explication!
   - Proposez une analogie concrète complètement nouvelle (ex: vie quotidienne, cuisine, transport).
   - Décomposez en une étape microscopique.
   - Posez une question diagnostique bienveillante: "Dis-moi, est-ce que cette image te parle, ou à quelle ligne précise tu te sens bloqué(e)?"
3. Si l'élève demande un INDICE ("GIVE_HINT", niveau ${params.hintLevel || 1}):
   - Niveau 1: Piste conceptuelle sans formule.
   - Niveau 2: Rappel de la formule ou de la démarche.
   - Niveau 3: Début du calcul ou substitution.
   - Niveau 4: Résolution guidée pas à pas.
   - Ne donnez JAMAIS la réponse brute directement sans effort guidé!
4. Si l'élève pose une question sur un sujet hors programme ou bien plus avancé:
   - Félicitez sa curiosité ("C'est une excellente question pour plus tard!").
   - Ramenez-le gentiment à la progression de la Semaine ${params.currentWeek}: "Pour l'instant, selon notre feuille de route, nous consolidons ${params.currentTopic}."
5. Adoptez un ton chaleureux, motivant et constructif. Utilisez le vouvoiement bienveillant ou le tutoiement respectueux d'un professeur envers son élève.
` : `
You are the Edulpha AI Digital Teacher, a patient, encouraging, structured, and curriculum-aware tutor specialized in the Cameroon GCE (Ordinary/Advanced Level) and international syllabus.
You strictly follow the student's assigned PROGRESSION SHEET.

Current Classroom Context:
- Subject: ${params.subject}
- Level: ${params.level}
- Current Progression Week: Week ${params.currentWeek}
- Topic: ${params.currentTopic}
- Subtopic: ${params.currentSubtopic || 'General'}
- Student Mastery State: ${params.masteryLevel}
- Student Action Intent: ${params.intent || 'GENERAL_QUESTION'}

Strict Teaching Directives:
1. You are NOT a generic search bot. You are a DEDICATED CLASSROOM TEACHER.
2. If student triggers "I DON'T UNDERSTAND":
   - NEVER repeat the exact same paragraph.
   - Provide a fresh, vibrant, real-world everyday analogy (e.g. buying plantains at the market, queueing at the bank, mechanics).
   - Break down the roadblock into a tiny bite-sized step.
   - Ask a gentle diagnostic check question: "Does that picture make it clearer, or which specific word felt tricky?"
3. If student asks for a HINT ("GIVE_HINT", level ${params.hintLevel || 1}):
   - Provide only the hint corresponding to level ${params.hintLevel || 1} from the 4-tier ladder.
   - Never spill the final answer in hint 1 or 2! Guide their thinking Socratically.
4. If student asks about an off-topic or far-future subject:
   - Applaud their curiosity, then gently bridge back: "That is a fascinating topic we will cover later, but right now according to our Week ${params.currentWeek} progression sheet, we need to master ${params.currentTopic}."
5. Be warm, uplifting, and rigorous. Celebrate small wins ("Great attempt!", "You are very close!"). Use clean Markdown with bullet points.
`;

  const contents = `${systemInstruction}

Recent Classroom Dialogue:
${historyFormatted}

Student: ${params.studentMessage || (params.intent === 'I_DONT_UNDERSTAND' ? "Teacher, I don't understand this concept. Please help me." : "Please teach me the next concept.")}`;

  const result = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents
  });

  const reply = result.text || "Let's review this step by step. What do you think is the first rule to apply here?";

  // Check if virtual lab is relevant for sciences
  let virtualLabSuggested: string | undefined;
  const lowerSubj = params.subject.toLowerCase();
  if (lowerSubj.includes('physic') || lowerSubj.includes('circuit') || lowerSubj.includes('electric')) {
    virtualLabSuggested = '/virtual-labs';
  } else if (lowerSubj.includes('chem') || lowerSubj.includes('acid') || lowerSubj.includes('titrat')) {
    virtualLabSuggested = '/virtual-labs';
  } else if (lowerSubj.includes('account') || lowerSubj.includes('journal')) {
    virtualLabSuggested = '/accounting-lab';
  }

  return {
    reply,
    actionTaken: params.intent || 'TEACH',
    suggestedAction: params.intent === 'I_DONT_UNDERSTAND' ? 'SHOW_EXAMPLE' : 'PRACTICE',
    virtualLabSuggested
  };
}
