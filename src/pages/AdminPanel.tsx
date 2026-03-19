import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, addDoc, doc, setDoc, deleteDoc, writeBatch, updateDoc, getDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit, Save, X, Database, Sparkles, FileText, Clock, Trophy, CheckCircle2, AlertCircle, Eye, Download } from 'lucide-react';

export default function AdminPanel() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'Grade Boost 60',
    supportEmail: 'support@gradeboost60.com',
    subscriptionFee: 1000,
    acceptPayments: true
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'exams' | 'submissions' | 'students' | 'settings'>('dashboard');
  
  const [newLesson, setNewLesson] = useState({
    day: 1,
    subject: 'Computer Science' as 'Computer Science' | 'ICT',
    title: '',
    content: '',
    quiz: Array(10).fill(null).map(() => ({ 
      id: Math.random().toString(36).substr(2, 9),
      type: 'mcq' as 'mcq' | 'structured' | 'practical',
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0, 
      explanation: '',
      hint: '',
      keywords: [] as string[]
    }))
  });

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    duration: 90,
    totalQuestions: 0,
    difficulty: 'Advanced',
    category: 'Computer Science' as 'Computer Science' | 'ICT',
    paperNumber: 1 as 1 | 2 | 3,
    type: 'MCQ' as 'MCQ' | 'STRUCTURED',
    questions: [] as any[]
  });

  const [newQuestion, setNewQuestion] = useState({
    id: Math.random().toString(36).substr(2, 9),
    type: 'mcq' as 'mcq' | 'structured' | 'practical',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    hint: '',
    keywords: [] as string[],
    marks: 1
  });

  useEffect(() => {
    fetchLessons();
    fetchExams();
    fetchSubmissions();
    fetchStudents();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
      if (settingsDoc.exists()) {
        setPlatformSettings(settingsDoc.data() as any);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    try {
      const q = query(collection(db, 'lessons'), orderBy('day', 'asc'));
      const snapshot = await getDocs(q);
      const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonsData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    try {
      const q = query(collection(db, 'mockExams'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const examsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(examsData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'examSubmissions'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const submissionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(submissionsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedLessons = async () => {
    if (!window.confirm('This will add the first 5 days of lessons to the database. Continue?')) return;
    
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      const seedLessons = [
        {
          day: 1,
          subject: 'Computer Science',
          title: 'Introduction to Computer Systems',
          content: `# Day 1: Introduction to Computer Systems\n\nA computer system is a combination of hardware and software components that work together to process data and perform tasks. \n\n### Hardware Components\n1. **Input Devices**: Keyboard, mouse, scanner.\n2. **Processing Unit**: The CPU (Central Processing Unit).\n3. **Storage**: RAM (Primary) and Hard Drives (Secondary).\n4. **Output Devices**: Monitor, printer.\n\n### Software Components\n1. **System Software**: Operating Systems (Windows, Linux).\n2. **Application Software**: Word processors, browsers.\n\nUnderstanding how these interact is fundamental to Computer Science.`,
          quiz: [
            { question: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Utility"], correctAnswer: 1, explanation: "CPU stands for Central Processing Unit." },
            { question: "Which of these is an input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctAnswer: 2, explanation: "Keyboard is used to input data." },
            { question: "What is RAM?", options: ["Read Access Memory", "Random Access Memory", "Ready Action Memory", "Real Access Memory"], correctAnswer: 1, explanation: "RAM stands for Random Access Memory." },
            { question: "Which is system software?", options: ["Chrome", "Windows 11", "MS Word", "Photoshop"], correctAnswer: 1, explanation: "Windows 11 is an Operating System." },
            { question: "What is the brain of the computer?", options: ["RAM", "Hard Drive", "CPU", "Motherboard"], correctAnswer: 2, explanation: "The CPU processes all instructions." },
            { question: "Which is a secondary storage device?", options: ["RAM", "SSD", "Cache", "Registers"], correctAnswer: 1, explanation: "SSD is non-volatile secondary storage." },
            { question: "What is hardware?", options: ["Programs", "Physical components", "Data", "Internet"], correctAnswer: 1, explanation: "Hardware refers to the physical parts of a computer." },
            { question: "What is software?", options: ["Cables", "Instructions for the computer", "The screen", "The mouse"], correctAnswer: 1, explanation: "Software is a set of instructions." },
            { question: "Paper 2 Style: Explain the fetch-decode-execute cycle.", options: ["It's a loop", "CPU fetches, decodes, and runs instructions", "It's for printing", "It's a storage method"], correctAnswer: 1, explanation: "The FDE cycle is the basic operation of a CPU." },
            { question: "Paper 3 Style: Write a simple algorithm to add two numbers.", options: ["Start -> Input A, B -> Sum = A + B -> Output Sum -> End", "Print 'Hello'", "Loop 10 times", "If A > B then A"], correctAnswer: 0, explanation: "A simple sequence of steps to solve a problem." }
          ]
        },
        {
          day: 1,
          subject: 'ICT',
          title: 'Information Systems in Society',
          content: `# Day 1: Information Systems in Society\n\nICT is the use of technology to manage information. \n\n### Key Concepts\n- **Data vs Information**: Data is raw facts; Information is processed data.\n- **Information Systems**: People, hardware, software, data, and procedures working together.\n- **Impact of ICT**: Digital divide, e-commerce, teleworking.\n\nICT is everywhere, from banking to healthcare.`,
          quiz: [
            { question: "What is ICT?", options: ["Information and Communication Technology", "Internal Computer Tool", "Internet Connection Type", "Interface Control Terminal"], correctAnswer: 0, explanation: "ICT stands for Information and Communication Technology." },
            { question: "Which is an example of an information system?", options: ["A hammer", "A spreadsheet for inventory", "A blank piece of paper", "A rock"], correctAnswer: 1, explanation: "A spreadsheet managing data is an IS." },
            { question: "What is 'Data'?", options: ["Processed facts", "Raw facts and figures", "A computer program", "The internet"], correctAnswer: 1, explanation: "Data is the raw input." },
            { question: "Which is a positive impact of ICT?", options: ["Cyberbullying", "E-commerce", "Digital Divide", "Job loss"], correctAnswer: 1, explanation: "E-commerce allows global trade." },
            { question: "What is the 'Digital Divide'?", options: ["A gap between those with and without access to technology", "A type of computer screen", "A mathematical operation", "A network protocol"], correctAnswer: 0, explanation: "The gap in technology access." },
            { question: "What is teleworking?", options: ["Working from home using ICT", "Repairing televisions", "Working in a telephone exchange", "A type of sports"], correctAnswer: 0, explanation: "Teleworking is remote work." },
            { question: "Which is an output device?", options: ["Keyboard", "Mouse", "Printer", "Scanner"], correctAnswer: 2, explanation: "Printer produces physical output." },
            { question: "What is a 'System'?", options: ["A single part", "A set of interacting components", "A computer mouse", "A cable"], correctAnswer: 1, explanation: "A system is a group of parts working together." },
            { question: "Paper 2 Style: Discuss one ethical issue of ICT.", options: ["Privacy", "Speed", "Color", "Weight"], correctAnswer: 0, explanation: "Privacy is a major ethical concern." },
            { question: "Paper 3 Style: Create a simple database table for students.", options: ["ID, Name, Class", "Print 'Hello'", "Sum = A + B", "If A > B"], correctAnswer: 0, explanation: "Defining fields for a table." }
          ]
        },
        {
          day: 2,
          subject: 'ICT',
          title: 'Hardware & Software Components',
          content: `# Day 2: Hardware & Software\n\nICT systems are built from hardware and software. \n\n### Hardware\n- **Input**: Keyboard, Mouse, Scanner, Microphone.\n- **Output**: Monitor, Printer, Speakers.\n- **Storage**: SSD, HDD, Flash Drives.\n\n### Software\n- **Operating Systems**: Manage hardware.\n- **Applications**: Perform specific tasks (e.g., Excel for accounting).`,
          quiz: [
            { question: "Which is an example of application software?", options: ["Windows", "Linux", "Microsoft Excel", "BIOS"], correctAnswer: 2, explanation: "Excel is an application." },
            { question: "What is the primary function of an OS?", options: ["Play games", "Manage resources", "Browse the web", "Type letters"], correctAnswer: 1, explanation: "OS manages hardware and software." },
            { question: "Which storage is fastest?", options: ["HDD", "SSD", "Cloud", "Floppy"], correctAnswer: 1, explanation: "SSD is faster than HDD." },
            { question: "What is a peripheral?", options: ["A core component", "An external device", "A type of software", "A network"], correctAnswer: 1, explanation: "Peripherals are external devices." },
            { question: "Which is a pointing device?", options: ["Keyboard", "Mouse", "Printer", "Scanner"], correctAnswer: 1, explanation: "Mouse is a pointing device." },
            { question: "What is 'Firmware'?", options: ["Soft software", "Software embedded in hardware", "A type of virus", "A network cable"], correctAnswer: 1, explanation: "Firmware is low-level software." },
            { question: "Which is a multi-user OS?", options: ["MS-DOS", "Linux", "Windows 3.1", "None"], correctAnswer: 1, explanation: "Linux supports multiple users." },
            { question: "What is an 'Interface'?", options: ["A cable", "How a user interacts with a system", "A type of monitor", "A keyboard"], correctAnswer: 1, explanation: "Interface is the interaction point." },
            { question: "Paper 2 Style: Compare CLI and GUI.", options: ["CLI is text-based, GUI is visual", "They are the same", "CLI is for games", "GUI is faster"], correctAnswer: 0, explanation: "CLI uses commands; GUI uses icons." },
            { question: "Paper 3 Style: List 3 input devices for a POS system.", options: ["Scanner, Keyboard, Touchscreen", "Monitor, Printer, Speaker", "CPU, RAM, HDD", "Mouse, Pen, Mic"], correctAnswer: 0, explanation: "Common POS inputs." }
          ]
        },
        {
          day: 3,
          subject: 'Computer Science',
          title: 'Logic Gates & Boolean Algebra',
          content: `# Day 3: Logic Gates\n\nLogic gates are the building blocks of digital circuits. \n\n### Basic Gates\n- **AND**: Output 1 if both inputs are 1.\n- **OR**: Output 1 if at least one input is 1.\n- **NOT**: Inverts the input.\n\n### Boolean Algebra\n- **Commutative Law**: A + B = B + A\n- **Associative Law**: (A + B) + C = A + (B + C)\n- **De Morgan's Laws**: !(A . B) = !A + !B`,
          quiz: [
            { question: "Which gate is an inverter?", options: ["AND", "OR", "NOT", "XOR"], correctAnswer: 2, explanation: "NOT gate inverts input." },
            { question: "A . 1 = ?", options: ["0", "1", "A", "!A"], correctAnswer: 2, explanation: "Identity Law." },
            { question: "A + 1 = ?", options: ["0", "1", "A", "!A"], correctAnswer: 1, explanation: "Null Law." },
            { question: "Which gate returns 1 only if inputs are different?", options: ["OR", "AND", "XOR", "NOR"], correctAnswer: 2, explanation: "XOR (Exclusive OR)." },
            { question: "!(A + B) = ?", options: ["!A + !B", "!A . !B", "A . B", "A + B"], correctAnswer: 1, explanation: "De Morgan's Law." },
            { question: "What is a Truth Table?", options: ["A list of facts", "A table showing all possible inputs and outputs", "A database", "A spreadsheet"], correctAnswer: 1, explanation: "Shows logic gate behavior." },
            { question: "Which gate is a Universal Gate?", options: ["AND", "OR", "NAND", "XOR"], correctAnswer: 2, explanation: "NAND and NOR are universal." },
            { question: "A . 0 = ?", options: ["0", "1", "A", "!A"], correctAnswer: 0, explanation: "Null Law." },
            { question: "Paper 2 Style: Draw the circuit for (A AND B) OR C.", options: ["AND gate then OR gate", "OR gate then AND gate", "Two AND gates", "NOT gate"], correctAnswer: 0, explanation: "Follow the expression." },
            { question: "Paper 3 Style: Write the truth table for a 2-input XOR gate.", options: ["0,1,1,0", "1,0,0,1", "0,0,0,1", "1,1,1,0"], correctAnswer: 0, explanation: "XOR output for 00, 01, 10, 11." }
          ]
        },
        {
          day: 2,
          subject: 'Computer Science',
          title: 'Data Representation: Binary & Hexadecimal',
          content: `# Day 2: Data Representation\n\nComputers use binary (base-2) to represent all data. \n\n### Binary System\n- Uses only 0 and 1.\n- Each digit is a 'bit'.\n- 8 bits = 1 Byte.\n\n### Hexadecimal System\n- Base-16 system.\n- Uses 0-9 and A-F.\n- Used for color codes, MAC addresses, and memory addresses because it's more human-readable than binary.`,
          quiz: [
            { question: "What is the binary for decimal 5?", options: ["100", "101", "110", "111"], correctAnswer: 1, explanation: "4 + 0 + 1 = 101 in binary." },
            { question: "How many bits are in a byte?", options: ["4", "8", "16", "32"], correctAnswer: 1, explanation: "A byte consists of 8 bits." },
            { question: "What does Hexadecimal 'A' represent in decimal?", options: ["10", "11", "12", "13"], correctAnswer: 0, explanation: "A=10, B=11, C=12, D=13, E=14, F=15." },
            { question: "Which base is Hexadecimal?", options: ["2", "8", "10", "16"], correctAnswer: 3, explanation: "Hexadecimal is base-16." },
            { question: "Convert 1111 binary to decimal.", options: ["10", "12", "14", "15"], correctAnswer: 3, explanation: "8+4+2+1 = 15." },
            { question: "What is a nibble?", options: ["2 bits", "4 bits", "8 bits", "1 bit"], correctAnswer: 1, explanation: "A nibble is half a byte (4 bits)." },
            { question: "Which is used for MAC addresses?", options: ["Binary", "Decimal", "Hexadecimal", "Octal"], correctAnswer: 2, explanation: "MAC addresses are written in Hex." },
            { question: "What is base-10 called?", options: ["Binary", "Denary", "Hex", "Octal"], correctAnswer: 1, explanation: "Denary or Decimal is base-10." },
            { question: "Paper 2 Style: Convert 255 to Hex.", options: ["FF", "FE", "AA", "00"], correctAnswer: 0, explanation: "255 is the maximum value for 8 bits, which is FF in Hex." },
            { question: "Paper 3 Style: Represent -5 in 8-bit Two's Complement.", options: ["11111011", "00000101", "10000101", "11111010"], correctAnswer: 0, explanation: "Flip bits of 5 (00000101) -> 11111010, add 1 -> 11111011." }
          ]
        },
        {
          day: 4,
          subject: 'Computer Science',
          title: 'Algorithms & Flowcharts',
          content: `# Day 4: Algorithms\n\nAn algorithm is a step-by-step procedure for solving a problem. \n\n### Representation\n- **Pseudocode**: English-like code.\n- **Flowcharts**: Visual representation using symbols.\n\n### Flowchart Symbols\n- **Oval**: Start/End.\n- **Parallelogram**: Input/Output.\n- **Rectangle**: Process.\n- **Diamond**: Decision.`,
          quiz: [
            { question: "What is a diamond symbol in a flowchart?", options: ["Start", "Process", "Decision", "Output"], correctAnswer: 2, explanation: "Diamond is for decisions (If/Else)." },
            { question: "What is pseudocode?", options: ["Real code", "English-like algorithm", "A type of virus", "A hardware part"], correctAnswer: 1, explanation: "Informal high-level description." },
            { question: "Which is a loop structure?", options: ["If-Then", "For-Next", "Case", "Select"], correctAnswer: 1, explanation: "For-Next is a loop." },
            { question: "What is an 'Infinite Loop'?", options: ["A loop that never ends", "A loop that runs 10 times", "A loop with no body", "A fast loop"], correctAnswer: 0, explanation: "A loop with no exit condition." },
            { question: "Which symbol is for Input/Output?", options: ["Oval", "Rectangle", "Parallelogram", "Diamond"], correctAnswer: 2, explanation: "Parallelogram." },
            { question: "What is 'Dry Running'?", options: ["Running a PC without water", "Manually tracing an algorithm", "Deleting code", "Compiling code"], correctAnswer: 1, explanation: "Testing logic on paper." },
            { question: "Which is a sorting algorithm?", options: ["Binary Search", "Bubble Sort", "Linear Search", "Dijkstra"], correctAnswer: 1, explanation: "Bubble Sort." },
            { question: "What is 'Efficiency' in algorithms?", options: ["How pretty it is", "Time and space complexity", "The number of lines", "The color of the code"], correctAnswer: 1, explanation: "Resources used (Time/Memory)." },
            { question: "Paper 2 Style: Write pseudocode to find the largest of 3 numbers.", options: ["Input A,B,C -> If A>B and A>C then Print A...", "Print 10", "Loop 3 times", "Add A+B+C"], correctAnswer: 0, explanation: "Standard comparison logic." },
            { question: "Paper 3 Style: Draw a flowchart for a login system.", options: ["Start -> Input User/Pass -> If Valid then Dashboard else Error -> End", "Print 'Hi'", "Sum = A+B", "End"], correctAnswer: 0, explanation: "Basic logic flow." }
          ]
        },
        {
          day: 4,
          subject: 'ICT',
          title: 'Database Management Systems (DBMS)',
          content: `# Day 4: Databases\n\nA database is a structured collection of data. \n\n### Key Terms\n- **Table**: Collection of related data.\n- **Record (Row)**: A single entry in a table.\n- **Field (Column)**: A specific attribute of a record.\n- **Primary Key**: A unique identifier for a record.\n\n### Relational Databases\nDatabases that use multiple tables linked by common fields (Foreign Keys).`,
          quiz: [
            { question: "What is a Primary Key?", options: ["A password", "A unique identifier", "The first row", "A type of software"], correctAnswer: 1, explanation: "Uniquely identifies each record." },
            { question: "What is a 'Field'?", options: ["A row", "A column", "A table", "A database"], correctAnswer: 1, explanation: "A specific attribute (e.g., Name)." },
            { question: "Which is a DBMS?", options: ["Windows", "Excel", "Microsoft Access", "Word"], correctAnswer: 2, explanation: "Access is a DBMS." },
            { question: "What is a 'Foreign Key'?", options: ["A key from another country", "A field that links two tables", "A hidden field", "A password"], correctAnswer: 1, explanation: "Links to a primary key in another table." },
            { question: "What is 'Redundancy'?", options: ["Fast data", "Data duplication", "Data security", "Data loss"], correctAnswer: 1, explanation: "Unnecessary repetition of data." },
            { question: "What is 'Normalization'?", options: ["Making data normal", "Reducing redundancy", "Deleting data", "Sorting data"], correctAnswer: 1, explanation: "Organizing data efficiently." },
            { question: "Which is a query language?", options: ["HTML", "CSS", "SQL", "PHP"], correctAnswer: 2, explanation: "Structured Query Language." },
            { question: "What is a 'Record'?", options: ["A column", "A row", "A file", "A folder"], correctAnswer: 1, explanation: "A complete set of fields for one item." },
            { question: "Paper 2 Style: Explain the difference between a flat file and a relational database.", options: ["Flat file is one table, relational is multiple", "They are the same", "Flat file is faster", "Relational is for text only"], correctAnswer: 0, explanation: "Structure difference." },
            { question: "Paper 3 Style: Create a query to find all students in 'Class A'.", options: ["SELECT * FROM Students WHERE Class = 'A'", "PRINT 'A'", "FIND A", "DELETE A"], correctAnswer: 0, explanation: "Basic SQL syntax." }
          ]
        },
        {
          day: 5,
          subject: 'Computer Science',
          title: 'Programming Concepts in C',
          content: `# Day 5: Introduction to C\n\nC is a powerful, low-level programming language. \n\n### Basic Structure\n\`\`\`c\n#include <stdio.h>\nint main() {\n    printf("Hello World");\n    return 0;\n}\n\`\`\`\n\n### Variables & Types\n- \`int\`: Integers.\n- \`float\`: Decimals.\n- \`char\`: Characters.\n\n### Control Structures\n- \`if\`, \`else\`, \`switch\`.\n- \`for\`, \`while\`, \`do-while\`.`,
          quiz: [
            { question: "Which header file is needed for printf()?", options: ["conio.h", "stdlib.h", "stdio.h", "math.h"], correctAnswer: 2, explanation: "Standard Input Output header." },
            { question: "What is the correct way to declare an integer 'x'?", options: ["integer x;", "int x;", "var x;", "x = int;"], correctAnswer: 1, explanation: "int x; is the C syntax." },
            { question: "Which operator is used for comparison?", options: ["=", "==", "===", "!="], correctAnswer: 1, explanation: "== is for equality." },
            { question: "What does 'main()' represent?", options: ["A variable", "The entry point of the program", "A library", "A comment"], correctAnswer: 1, explanation: "Execution starts at main()." },
            { question: "How do you end a statement in C?", options: [":", ".", ";", ","], correctAnswer: 2, explanation: "Semicolon is required." },
            { question: "Which is a loop in C?", options: ["repeat", "while", "until", "loop"], correctAnswer: 1, explanation: "while is a standard loop." },
            { question: "What is the output of 5 / 2 in integer division?", options: ["2.5", "2", "3", "0"], correctAnswer: 1, explanation: "Integer division truncates decimals." },
            { question: "What is a 'Pointer'?", options: ["A mouse cursor", "A variable that stores a memory address", "A type of loop", "A function"], correctAnswer: 1, explanation: "Stores address of another variable." },
            { question: "Paper 2 Style: Explain the purpose of a compiler.", options: ["Translates source code to machine code", "Runs the program", "Deletes errors", "Writes code"], correctAnswer: 0, explanation: "Translation process." },
            { question: "Paper 3 Style: Write a C program to find the square of a number.", options: ["scanf(%d, &n); printf(%d, n*n);", "Print n*n", "n^2", "Square(n)"], correctAnswer: 0, explanation: "Basic I/O and math." }
          ]
        },
        {
          day: 5,
          subject: 'ICT',
          title: 'Web Development: HTML & CSS',
          content: `# Day 5: Web Development\n\nWebsites are built using HTML (Structure) and CSS (Style). \n\n### HTML Tags\n- \`<h1>\`: Heading.\n- \`<p>\`: Paragraph.\n- \`<a>\`: Link.\n- \`<img>\`: Image.\n\n### CSS Basics\n- **Selectors**: Target HTML elements.\n- **Properties**: Color, font-size, margin, padding.`,
          quiz: [
            { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Tool Multi Link", "Home Tool Markup Language"], correctAnswer: 0, explanation: "Hyper Text Markup Language." },
            { question: "Which tag is used for a link?", options: ["<link>", "<a>", "<url>", "<href>"], correctAnswer: 1, explanation: "Anchor tag <a>." },
            { question: "What is CSS used for?", options: ["Structure", "Styling", "Database", "Programming"], correctAnswer: 1, explanation: "Cascading Style Sheets for design." },
            { question: "Which tag is for the largest heading?", options: ["<h6>", "<h1>", "<head>", "<header>"], correctAnswer: 1, explanation: "h1 is the top-level heading." },
            { question: "How do you add a background color in CSS?", options: ["color:", "bg-color:", "background-color:", "fill:"], correctAnswer: 2, explanation: "background-color property." },
            { question: "What is an 'Attribute' in HTML?", options: ["A tag", "Extra information about a tag", "A CSS style", "A JavaScript function"], correctAnswer: 1, explanation: "e.g., src in <img>." },
            { question: "Which tag is for a line break?", options: ["<lb>", "<br>", "<break>", "<next>"], correctAnswer: 1, explanation: "<br> tag." },
            { question: "What is the 'Body' of a webpage?", options: ["The header", "The visible content", "The title", "The footer"], correctAnswer: 1, explanation: "Everything inside <body>." },
            { question: "Paper 2 Style: Discuss the importance of responsive web design.", options: ["Works on all devices", "Looks pretty", "Faster loading", "Better colors"], correctAnswer: 0, explanation: "Adapts to screen sizes." },
            { question: "Paper 3 Style: Create an HTML list of 3 fruits.", options: ["<ul><li>Apple</li><li>Banana</li><li>Orange</li></ul>", "1. Apple 2. Banana", "List: Apple, Banana", "Fruits = [A, B, O]"], correctAnswer: 0, explanation: "Unordered list syntax." }
          ]
        },
        {
          day: 6,
          subject: 'Computer Science',
          title: 'Operating Systems & Resource Management',
          content: `# Day 6: Operating Systems\n\nThe OS is the most important software on a computer. \n\n### Functions of an OS\n1. **Memory Management**: Allocating RAM.\n2. **Processor Management**: Scheduling tasks.\n3. **File Management**: Organizing storage.\n4. **Device Management**: Communicating with peripherals.\n5. **Security**: User accounts and permissions.`,
          quiz: [
            { question: "Which is a function of the OS?", options: ["Word processing", "Memory management", "Web browsing", "Spreadsheet calculation"], correctAnswer: 1, explanation: "Core OS task." },
            { question: "What is 'Paging'?", options: ["Printing a page", "Memory management scheme", "A type of network", "A CPU cycle"], correctAnswer: 1, explanation: "Dividing memory into fixed-size blocks." },
            { question: "What is 'Multitasking'?", options: ["Running one program fast", "Running multiple programs at once", "Having many users", "Using two monitors"], correctAnswer: 1, explanation: "Concurrent execution." },
            { question: "What is a 'Device Driver'?", options: ["A person who fixes PCs", "Software that tells the OS how to use hardware", "A type of cable", "A hardware part"], correctAnswer: 1, explanation: "Interface between OS and hardware." },
            { question: "Which is an open-source OS?", options: ["Windows", "macOS", "Linux", "iOS"], correctAnswer: 2, explanation: "Linux source code is free." },
            { question: "What is the 'Kernel'?", options: ["A type of nut", "The core part of the OS", "The user interface", "A file"], correctAnswer: 1, explanation: "Central part of the OS." },
            { question: "What is 'Virtual Memory'?", options: ["Memory on the internet", "Using hard drive space as RAM", "A type of cache", "Fake memory"], correctAnswer: 1, explanation: "Extends physical RAM." },
            { question: "What is a 'Interrupt'?", options: ["A power cut", "A signal to the CPU to stop and handle a task", "A software bug", "A user error"], correctAnswer: 1, explanation: "Signal for immediate attention." },
            { question: "Paper 2 Style: Explain the difference between Batch and Real-time processing.", options: ["Batch is grouped, Real-time is immediate", "They are the same", "Batch is for games", "Real-time is for printing"], correctAnswer: 0, explanation: "Processing modes." },
            { question: "Paper 3 Style: List 3 OS scheduling algorithms.", options: ["FCFS, Round Robin, SJF", "Add, Sub, Mul", "Loop, If, Case", "Start, Run, End"], correctAnswer: 0, explanation: "Common CPU schedulers." }
          ]
        },
        {
          day: 6,
          subject: 'ICT',
          title: 'Spreadsheets & Data Analysis',
          content: `# Day 6: Spreadsheets\n\nSpreadsheets are used for calculations and data analysis. \n\n### Key Features\n- **Cells**: Intersection of row and column.\n- **Formulas**: Start with \`=\`.\n- **Functions**: Predefined formulas (e.g., \`SUM\`, \`AVERAGE\`, \`IF\`).\n- **Charts**: Visual data representation.`,
          quiz: [
            { question: "How do all formulas start in Excel?", options: ["+", "-", "=", "@"], correctAnswer: 2, explanation: "Equals sign is mandatory." },
            { question: "What is a 'Cell'?", options: ["A row", "A column", "Intersection of row and column", "A sheet"], correctAnswer: 2, explanation: "e.g., A1." },
            { question: "Which function adds a range of numbers?", options: ["ADD()", "TOTAL()", "SUM()", "PLUS()"], correctAnswer: 2, explanation: "SUM function." },
            { question: "What is an 'Absolute Reference'?", options: ["A fixed cell address ($A$1)", "A moving address", "A hidden cell", "A text cell"], correctAnswer: 0, explanation: "Does not change when copied." },
            { question: "Which chart is best for showing trends over time?", options: ["Pie Chart", "Bar Chart", "Line Chart", "Scatter Plot"], correctAnswer: 2, explanation: "Line charts show trends." },
            { question: "What is the 'IF' function used for?", options: ["Adding numbers", "Conditional logic", "Sorting data", "Printing"], correctAnswer: 1, explanation: "Returns value based on condition." },
            { question: "What is 'VLOOKUP'?", options: ["A type of chart", "Vertical lookup in a table", "A formatting tool", "A save option"], correctAnswer: 1, explanation: "Finds data in a column." },
            { question: "What is a 'Pivot Table'?", options: ["A spinning table", "A tool to summarize large data", "A type of border", "A font style"], correctAnswer: 1, explanation: "Data summarization tool." },
            { question: "Paper 2 Style: Discuss the benefits of using spreadsheets for financial modeling.", options: ["Automatic recalculation", "Better colors", "Easier to type", "No errors"], correctAnswer: 0, explanation: "Efficiency and accuracy." },
            { question: "Paper 3 Style: Write a formula to calculate 15% tax on cell B2.", options: ["=B2 * 0.15", "B2 + 15", "Tax(B2)", "15% * B2"], correctAnswer: 0, explanation: "Basic math formula." }
          ]
        }
      ];
      
      for (const lesson of seedLessons) {
        const lessonId = `${lesson.subject.toLowerCase().replace(/\s+/g, '_')}_day_${lesson.day}`;
        const lessonRef = doc(db, 'lessons', lessonId);
        batch.set(lessonRef, lesson);
      }

      await batch.commit();
      fetchLessons();
      alert('6 days of lessons for both CS and ICT seeded successfully!');
    } catch (err) {
      console.error(err);
      alert('Error seeding lessons');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedExams = async () => {
    if (!window.confirm('This will add a comprehensive set of GCE Computer Science and ICT Mock Exams (Papers 1, 2, and 3) to the database. Continue?')) return;
    
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      const seedExams = [
        // COMPUTER SCIENCE PAPERS
        {
          id: 'gce-cs-p1-2025',
          title: 'GCE A-Level CS Paper 1 (2025 Mock)',
          description: '10 Multiple Choice Questions covering the entire syllabus: Architecture, OS, Networking, and Algorithms.',
          duration: 45,
          totalQuestions: 10,
          difficulty: 'Advanced',
          category: 'Computer Science',
          paperNumber: 1,
          type: 'MCQ',
          createdAt: new Date().toISOString(),
          questions: [
            { question: "In the Von Neumann architecture, which component is responsible for fetching and decoding instructions?", options: ["ALU", "CU", "MAR", "PC"], correctAnswer: 1, explanation: "The Control Unit (CU) manages the fetch-decode-execute cycle." },
            { question: "Which sorting algorithm has a worst-case time complexity of O(n²)?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"], correctAnswer: 2, explanation: "Bubble Sort has O(n²) complexity." },
            { question: "What is the primary purpose of a Subnet Mask?", options: ["Identify MAC", "Distinguish network/host portions", "Unique name", "Encrypt packets"], correctAnswer: 1, explanation: "Subnet masks divide IP addresses into network and host parts." },
            { question: "Which data structure is FIFO?", options: ["Stack", "Queue", "Tree", "Hash Table"], correctAnswer: 1, explanation: "Queue is FIFO." },
            { question: "In Boolean Algebra, A + (A . B) = ?", options: ["A", "B", "A.B", "1"], correctAnswer: 0, explanation: "Absorption Law." },
            { question: "What is the main function of an Operating System?", options: ["Word processing", "Resource management", "Web browsing", "Database storage"], correctAnswer: 1, explanation: "OS manages hardware and software resources." },
            { question: "Which layer of the OSI model handles routing?", options: ["Physical", "Data Link", "Network", "Transport"], correctAnswer: 2, explanation: "Network layer handles routing." },
            { question: "What is a 'Primary Key'?", options: ["Password", "Unique identifier", "Most used field", "Encryption key"], correctAnswer: 1, explanation: "Primary key uniquely identifies a record." },
            { question: "Which logic gate returns 1 only if both inputs are 1?", options: ["OR", "AND", "XOR", "NAND"], correctAnswer: 1, explanation: "AND gate." },
            { question: "What is 'Recursion'?", options: ["Looping", "Function calling itself", "Variable assignment", "Error handling"], correctAnswer: 1, explanation: "Recursion is when a function calls itself." }
          ]
        },
        {
          id: 'gce-cs-p2-2025',
          title: 'GCE A-Level CS Paper 2 (Structured)',
          description: '1 Structural question worth 17 marks as on a standard GCE paper.',
          duration: 60,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'Computer Science',
          paperNumber: 2,
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "(a) Define the term 'Normalization' [2 marks]. (b) Explain the requirements for a table to be in 3rd Normal Form (3NF) [6 marks]. (c) Given a flat file of student registrations, decompose it into 3NF relations, identifying primary and foreign keys [9 marks]. Total: 17 Marks.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on data redundancy, primary keys, and transitive dependencies.",
              marks: 17
            }
          ]
        },
        {
          id: 'gce-cs-p3-2025',
          title: 'GCE A-Level CS Paper 3 (Practical)',
          description: '1 Practical question as on a standard GCE paper (C Programming & Databases).',
          duration: 120,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'Computer Science',
          paperNumber: 3,
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "Design and implement a C program that reads a list of 100 integers from a file, sorts them using the Quick Sort algorithm, and stores the sorted list in a new file. Additionally, create a database table to store the execution time of each run.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on file I/O, algorithm implementation, and database connectivity.",
              marks: 25
            }
          ]
        },
        // ICT PAPERS
        {
          id: 'gce-ict-p1-2025',
          title: 'GCE A-Level ICT Paper 1 (MCQ)',
          description: '10 Multiple Choice Questions on Information Systems and E-commerce.',
          duration: 45,
          totalQuestions: 10,
          difficulty: 'Advanced',
          category: 'ICT',
          paperNumber: 1,
          type: 'MCQ',
          createdAt: new Date().toISOString(),
          questions: [
            { question: "Example of MIS?", options: ["Word", "Inventory", "Browser", "OS"], correctAnswer: 1, explanation: "Inventory control is an MIS." },
            { question: "B2C stands for?", options: ["Business to Consumer", "Business to Company", "Buyer to Customer", "Back to Center"], correctAnswer: 0, explanation: "Business to Consumer." },
            { question: "What is 'Cloud Computing'?", options: ["Weather forecasting", "On-demand delivery of IT resources over the internet", "Local storage", "Type of hardware"], correctAnswer: 1, explanation: "On-demand IT resources." },
            { question: "Which is a 'Social Impact' of ICT?", options: ["Faster CPU", "Digital Divide", "More RAM", "New OS"], correctAnswer: 1, explanation: "Digital divide is a social impact." },
            { question: "What is 'Phishing'?", options: ["Fishing", "Fraudulent attempt to get sensitive info", "Virus", "Protocol"], correctAnswer: 1, explanation: "Fraudulent attempt to get info." },
            { question: "Purpose of a 'Firewall'?", options: ["Cooling", "Prevent unauthorized access", "Speed up internet", "Clean disk"], correctAnswer: 1, explanation: "Firewalls prevent unauthorized access." },
            { question: "What is 'Big Data'?", options: ["Large hard drive", "Extremely large data sets analyzed computationally", "A big file", "A giant server"], correctAnswer: 1, explanation: "Extremely large data sets." },
            { question: "Which is an 'Output Device'?", options: ["Keyboard", "Mouse", "Monitor", "Scanner"], correctAnswer: 2, explanation: "Monitor is an output device." },
            { question: "What is 'Encryption'?", options: ["Deleting data", "Converting data into code to prevent unauthorized access", "Compressing data", "Copying data"], correctAnswer: 1, explanation: "Converting data into code." },
            { question: "What is 'SEO'?", options: ["Search Engine Optimization", "System Entry Office", "Secure Email Output", "Server Error Only"], correctAnswer: 0, explanation: "Search Engine Optimization." }
          ]
        },
        {
          id: 'gce-ict-p2-2025',
          title: 'GCE A-Level ICT Paper 2 (Structured)',
          description: '1 Structural question worth 17 marks as on a standard GCE paper.',
          duration: 60,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'ICT',
          paperNumber: 2,
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "(a) Describe the 'Analysis' phase of the SDLC [4 marks]. (b) Compare 'Parallel' and 'Phased' implementation methods [6 marks]. (c) Discuss the social and ethical implications of implementing an AI-driven recruitment system [7 marks]. Total: 17 Marks.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on SDLC phases, implementation strategies, and ethics.",
              marks: 17
            }
          ]
        },
        {
          id: 'gce-ict-p3-2025',
          title: 'GCE A-Level ICT Paper 3 (Practical)',
          description: '1 Practical question as on a standard GCE paper (Spreadsheets & Databases).',
          duration: 120,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'ICT',
          paperNumber: 3,
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "Develop a complex spreadsheet model for a retail business to track sales, calculate commissions using nested IF functions, and generate a pivot table for monthly performance analysis. Additionally, design a database to store customer feedback.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on advanced spreadsheet functions and database design.",
              marks: 25
            }
          ]
        }
      ];

      for (const exam of seedExams) {
        const examRef = doc(db, 'mockExams', exam.id);
        batch.set(examRef, exam);
      }

      await batch.commit();
      fetchExams();
      alert('GCE Mock Exams (Papers 1, 2, and 3) seeded successfully with standard structures!');
    } catch (err) {
      console.error(err);
      alert('Error seeding exams');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveLesson = async () => {
    try {
      const lessonId = `${newLesson.subject.toLowerCase().replace(/\s+/g, '_')}_day_${newLesson.day}`;
      await setDoc(doc(db, 'lessons', lessonId), newLesson);
      fetchLessons();
      setNewLesson({
        day: newLesson.day + 1,
        subject: newLesson.subject,
        title: '',
        content: '',
        quiz: Array(10).fill(null).map(() => ({ 
          id: Math.random().toString(36).substr(2, 9),
          type: 'mcq',
          question: '', 
          options: ['', '', '', ''], 
          correctAnswer: 0, 
          explanation: '',
          hint: '',
          keywords: []
        }))
      });
      alert('Lesson saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving lesson');
    }
  };

  const handleAddQuestionToExam = () => {
    if (!newQuestion.question) return;
    setNewExam({
      ...newExam,
      questions: [...newExam.questions, newQuestion],
      totalQuestions: newExam.questions.length + 1
    });
    setNewQuestion({
      id: Math.random().toString(36).substr(2, 9),
      type: newExam.type === 'MCQ' ? 'mcq' : 'structured',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      hint: '',
      keywords: [],
      marks: 1
    });
  };

  const handleSaveExam = async () => {
    try {
      if (!newExam.title || newExam.questions.length === 0) {
        alert('Please add a title and at least one question.');
        return;
      }
      const examId = `${newExam.category.toLowerCase().replace(/\s+/g, '-')}-p${newExam.paperNumber}-${new Date().getTime()}`;
      await setDoc(doc(db, 'mockExams', examId), {
        ...newExam,
        createdAt: new Date().toISOString()
      });
      fetchExams();
      setNewExam({
        title: '',
        description: '',
        duration: 90,
        totalQuestions: 0,
        difficulty: 'Advanced',
        category: 'Computer Science',
        paperNumber: 1,
        type: 'MCQ',
        questions: []
      });
      alert('Exam saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving exam');
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const subRef = doc(db, 'examSubmissions', submissionId);
      await updateDoc(subRef, {
        grade,
        feedback,
        status: 'GRADED',
        gradedAt: new Date().toISOString()
      });
      fetchSubmissions();
      alert('Submission graded!');
    } catch (err) {
      console.error(err);
      alert('Error grading submission');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'platform'), {
        ...platformSettings,
        updatedAt: new Date().toISOString()
      });
      alert('Platform settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteDoc(doc(db, 'lessons', id));
      fetchLessons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await deleteDoc(doc(db, 'mockExams', id));
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      fetchStudents();
      alert('Student deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Error deleting student.');
    }
  };

  const handleTogglePaidStatus = async (student: any) => {
    try {
      await updateDoc(doc(db, 'users', student.id), {
        isPaid: !student.isPaid
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin Control Center</h1>
          <p className="text-slate-500 font-medium">Manage curriculum, exams, and student performance.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSeedLessons}
            disabled={isSeeding}
            className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSeeding ? <Sparkles className="animate-spin" size={16} /> : <Database size={16} />}
            Seed Lessons
          </button>
          <button
            onClick={handleSeedExams}
            disabled={isSeeding}
            className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSeeding ? <Sparkles className="animate-spin" size={16} /> : <Database size={16} />}
            Seed Mock Exams
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Students</p>
          <p className="text-4xl font-black text-slate-900">{students.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Active (Paid)</p>
          <p className="text-4xl font-black text-slate-900">{students.filter(s => s.isPaid).length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Lessons</p>
          <p className="text-4xl font-black text-slate-900">{lessons.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Pending Grades</p>
          <p className="text-4xl font-black text-slate-900">{submissions.filter(s => s.status === 'PENDING').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 bg-slate-50 p-2 rounded-[2rem] w-fit border border-slate-100">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
          { id: 'lessons', label: 'Lessons', icon: FileText },
          { id: 'exams', label: 'Mock Exams', icon: Trophy },
          { id: 'submissions', label: 'Submissions', icon: CheckCircle2 },
          { id: 'students', label: 'Students', icon: Eye },
          { id: 'settings', label: 'Settings', icon: Save }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
            <div className="space-y-6">
              {submissions.slice(0, 5).map(sub => (
                <div key={sub.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">{sub.studentName} submitted {sub.examTitle}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(sub.submittedAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
          
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('lessons')} className="p-8 bg-blue-50 text-blue-600 rounded-[2rem] border border-blue-100 hover:bg-blue-100 transition-all text-center space-y-2">
                <Plus className="mx-auto" size={24} />
                <p className="font-black uppercase tracking-widest text-[10px]">Add Lesson</p>
              </button>
              <button onClick={() => setActiveTab('exams')} className="p-8 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100 hover:bg-emerald-100 transition-all text-center space-y-2">
                <Trophy className="mx-auto" size={24} />
                <p className="font-black uppercase tracking-widest text-[10px]">Add Exam</p>
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Lesson</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newLesson.subject}
                    onChange={e => setNewLesson({ ...newLesson, subject: e.target.value as any })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Day</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newLesson.day}
                    onChange={e => setNewLesson({ ...newLesson, day: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  value={newLesson.title}
                  onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                />
              </div>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium h-48 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                placeholder="Lesson Content (Markdown supported)..."
                value={newLesson.content}
                onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
              />

              <div className="space-y-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Quiz (10 MCQs)</h3>
                <p className="text-xs text-slate-400 font-bold italic">Include 8 general MCQs, 1 Paper 2 style MCQ, and 1 Paper 3 style MCQ.</p>
                
                <div className="space-y-12 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {newLesson.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Question {qIdx + 1}</span>
                          <select
                            className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-600"
                            value={q.type}
                            onChange={e => {
                              const quiz = [...newLesson.quiz];
                              quiz[qIdx].type = e.target.value as any;
                              setNewLesson({ ...newLesson, quiz });
                            }}
                          >
                            <option value="mcq">MCQ</option>
                            <option value="structured">Structured</option>
                            <option value="practical">Practical</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          {qIdx === 8 && <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Paper 2 Style</span>}
                          {qIdx === 9 && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Paper 3 Style</span>}
                        </div>
                      </div>

                      <textarea
                        placeholder="Question text..."
                        className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600 min-h-[100px]"
                        value={q.question}
                        onChange={e => {
                          const quiz = [...newLesson.quiz];
                          quiz[qIdx].question = e.target.value;
                          setNewLesson({ ...newLesson, quiz });
                        }}
                      />

                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => (
                            <input
                              key={oIdx}
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                              value={opt}
                              onChange={e => {
                                const quiz = [...newLesson.quiz];
                                quiz[qIdx].options[oIdx] = e.target.value;
                                setNewLesson({ ...newLesson, quiz });
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {q.type === 'mcq' ? (
                          <select
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                            value={q.correctAnswer}
                            onChange={e => {
                              const quiz = [...newLesson.quiz];
                              quiz[qIdx].correctAnswer = parseInt(e.target.value);
                              setNewLesson({ ...newLesson, quiz });
                            }}
                          >
                            <option value={0}>Option A is Correct</option>
                            <option value={1}>Option B is Correct</option>
                            <option value={2}>Option C is Correct</option>
                            <option value={3}>Option D is Correct</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Keywords (comma separated)..."
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                            value={q.keywords?.join(', ')}
                            onChange={e => {
                              const quiz = [...newLesson.quiz];
                              quiz[qIdx].keywords = e.target.value.split(',').map(k => k.trim());
                              setNewLesson({ ...newLesson, quiz });
                            }}
                          />
                        )}
                        <input
                          type="text"
                          placeholder="Hint (optional)..."
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                          value={q.hint}
                          onChange={e => {
                            const quiz = [...newLesson.quiz];
                            quiz[qIdx].hint = e.target.value;
                            setNewLesson({ ...newLesson, quiz });
                          }}
                        />
                      </div>

                      <textarea
                        placeholder="Explanation for the correct answer..."
                        className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-600 min-h-[80px]"
                        value={q.explanation}
                        onChange={e => {
                          const quiz = [...newLesson.quiz];
                          quiz[qIdx].explanation = e.target.value;
                          setNewLesson({ ...newLesson, quiz });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveLesson}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                Save Lesson
              </button>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Existing Lessons</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {lessons.map(lesson => (
                <div key={lesson.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{lesson.subject} • Day {lesson.day}</span>
                    <h3 className="font-black text-slate-900 tracking-tight">{lesson.title}</h3>
                  </div>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Mock Exam</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newExam.category}
                    onChange={e => setNewExam({ ...newExam, category: e.target.value as any })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Paper #</label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newExam.paperNumber}
                    onChange={e => setNewExam({ ...newExam, paperNumber: parseInt(e.target.value) as any })}
                  >
                    <option value={1}>Paper 1</option>
                    <option value={2}>Paper 2</option>
                    <option value={3}>Paper 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration (Mins)</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newExam.duration}
                    onChange={e => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Exam Title</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  value={newExam.title}
                  onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Exam Type</label>
                <div className="flex gap-4">
                  {['MCQ', 'STRUCTURED'].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewExam({ ...newExam, type: type as any, questions: [] })}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 transition-all ${
                        newExam.type === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-blue-200'
                      }`}
                    >
                      {type === 'MCQ' ? 'MCQ (Paper 1)' : 'Structured (Paper 2/3)'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Add {newExam.type === 'MCQ' ? 'Question' : 'Structured Task'}</h3>
                  <select
                    className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-600"
                    value={newQuestion.type}
                    onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                  >
                    <option value="mcq">MCQ</option>
                    <option value="structured">Structured</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                
                <textarea
                  className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[100px]"
                  placeholder={newQuestion.type === 'mcq' ? "Question text..." : "Describe the task or question for the student to answer..."}
                  value={newQuestion.question}
                  onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                />
                
                {newQuestion.type === 'mcq' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                          value={opt}
                          onChange={e => {
                            const opts = [...newQuestion.options];
                            opts[i] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: opts });
                          }}
                        />
                      ))}
                    </div>
                    <select
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      value={newQuestion.correctAnswer}
                      onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                    >
                      <option value={0}>Option A is Correct</option>
                      <option value={1}>Option B is Correct</option>
                      <option value={2}>Option C is Correct</option>
                      <option value={3}>Option D is Correct</option>
                    </select>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {newQuestion.type !== 'mcq' && (
                    <input
                      type="text"
                      placeholder="Keywords (comma separated)..."
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      value={newQuestion.keywords?.join(', ')}
                      onChange={e => setNewQuestion({ ...newQuestion, keywords: e.target.value.split(',').map(k => k.trim()) })}
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Hint (optional)..."
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    value={newQuestion.hint}
                    onChange={e => setNewQuestion({ ...newQuestion, hint: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Marks</label>
                    <input
                      type="number"
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      value={newQuestion.marks}
                      onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={handleAddQuestionToExam}
                      className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> Add to Exam
                    </button>
                  </div>
                </div>

                <textarea
                  placeholder="Explanation for the correct answer..."
                  className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-600 min-h-[80px]"
                  value={newQuestion.explanation}
                  onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions Added: {newExam.questions.length}</p>
                <button
                  onClick={handleSaveExam}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  Publish Mock Exam
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Existing Mock Exams</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{exam.category}</span>
                    <h3 className="font-black text-slate-900 tracking-tight">{exam.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {exam.type === 'MCQ' ? 'Paper 1 (MCQ)' : 'Paper 2 (Structured)'} • {exam.questions.length} Questions • {exam.duration} Mins
                    </p>
                  </div>
                  <button onClick={() => handleDeleteExam(exam.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'submissions' && (
        <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Submissions (Paper 2)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map(sub => (
              <div 
                key={sub.id} 
                className={`rounded-[2rem] p-8 border transition-all space-y-6 ${
                  sub.status === 'GRADED' 
                    ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50' 
                    : 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sub.examTitle}</p>
                    <h3 className="font-black text-slate-900 tracking-tight">{sub.studentName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                    sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {sub.status === 'GRADED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {sub.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <FileText className="text-blue-600" size={24} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">Answer_Sheet.pdf</p>
                    <p className="text-[10px] text-slate-400 font-bold">Uploaded {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                    <Download size={18} />
                  </a>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Grade (0-100)</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold"
                      placeholder="Enter score..."
                      defaultValue={sub.grade}
                      onBlur={e => handleGradeSubmission(sub.id, parseInt(e.target.value), sub.feedback || '')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Feedback</label>
                    <textarea
                      className="w-full p-3 bg-white border border-slate-100 rounded-xl font-medium text-xs h-24"
                      placeholder="Add comments for the student..."
                      defaultValue={sub.feedback}
                      onBlur={e => handleGradeSubmission(sub.id, sub.grade || 0, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold">No submissions to grade yet.</p>
              </div>
            )}
          </div>
        </section>
      )}
      {activeTab === 'students' && (
        <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Management</h2>
            <div className="text-xs font-bold text-slate-400">Total: {students.length} Students</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">School</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-4 px-4 text-sm text-slate-500">{student.email}</td>
                    <td className="py-4 px-4 text-sm text-slate-500">{student.school}</td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => handleTogglePaidStatus(student)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          student.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {student.isPaid ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => handleDeleteStudent(student.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <h3 className="font-black text-slate-900">General Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold" 
                    value={platformSettings.platformName} 
                    onChange={e => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Support Email</label>
                  <input 
                    type="email" 
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold" 
                    value={platformSettings.supportEmail} 
                    onChange={e => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <h3 className="font-black text-slate-900">Payment Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subscription Fee (FCFA)</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold" 
                    value={platformSettings.subscriptionFee} 
                    onChange={e => setPlatformSettings({ ...platformSettings, subscriptionFee: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPlatformSettings({ ...platformSettings, acceptPayments: !platformSettings.acceptPayments })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${platformSettings.acceptPayments ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${platformSettings.acceptPayments ? 'right-1' : 'left-1'}`}></div>
                  </button>
                  <span className="text-xs font-bold text-slate-900">Accept Payments</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleSaveSettings}
              className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all"
            >
              Save Changes
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
