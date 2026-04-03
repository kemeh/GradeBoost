export const SUBJECT_TOPICS = {
  'Computer Science': {
    'Module 2.1: Computer Applications': [
      'Use of a Computer System',
      'Share Digital Resources',
      'Use General Purpose and Computing Applications'
    ],
    'Module 2.2: Socio-economic Implications': [
      'Social and Cultural Influence',
      'Legislation and Ethical Issues',
      'Economic Values',
      'Economic Aspects Related to Use of Computers'
    ],
    'Module 2.3: Software': [
      'Make Decisions on Suitable Software',
      'Exploring System Software',
      'Operating System and Functions',
      'Process Management',
      'Memory Management',
      'Device Management',
      'File Management',
      'OS Maintenance'
    ],
    'Module 2.4: Computer Organization and Architecture': [
      'Computer Environment',
      'Hardware',
      'Computer Architecture',
      'Parallel Processing and Machine Instruction Cycle',
      'Polling and Interrupts',
      'Low-Level Programming',
      'Binary Arithmetic',
      'Boolean Arithmetic and Logic Gates',
      'Basic Digital Circuits'
    ],
    'Module 2.5: Computer Networks and Data Communication': [
      'Exploration of Computer Network Platform',
      'Identification of Different Equipment and Components',
      'Data Communication',
      'Data Protection',
      'Use of Standards and Protocol',
      'Use of Internet'
    ],
    'Module 2.6: Information System': [
      'Information System Environments',
      'Information System Design',
      'Web Applications and Database Implementation'
    ],
    'Module 2.7: Data Structures and Algorithms': ['Data Structures and Algorithms'],
    'Module 2.8: Programming': ['Programming'],
    'Module 2.9: Software Development': ['Software Development'],
    'Module 2.10: Computer Science Project': ['Computer Science Project']
  },
  'ICT': {
    'Module 1: Computing Environment and Components': [
      'Exploring Generations and Types of Computers',
      'Describing Computer Architectures',
      'Functioning of the Processor',
      'Classification of Software',
      'Configuring Operating Systems',
      'Using Language Translators',
      'Configuring User Environment and Managing Files',
      'Troubleshooting and Maintaining Hardware and Software',
      'Setting Up the Working Environment',
      'Choosing Category of Computers Based on Quality'
    ],
    'Module 2: Impacting Society with Digital Technology': [
      'Describing a System',
      'Using Information Systems in an Organization',
      'Proposing Digital Solutions',
      'Creating Awareness of Social, Legal, Ethical, and Economic Implications',
      'Preventing Malware and Their Impacts',
      'Exploring and Working with Artificial Intelligence',
      'Using Simulation and Multimedia Authoring Tools',
      'Discovering Multimodal Systems',
      'Using Virtual Reality and Augmented Reality'
    ],
    'Module 3: Building ICT Systems': [
      'Building Information Systems Using Standard Models',
      'Modeling Data in an IS',
      'Testing a Developed Information System',
      'Choosing Storage Devices Based on Capacity',
      'Choosing Processors Based on Speed',
      'Working with Digital Arithmetic',
      'Exploring Digital Circuits',
      'Representing and Organizing Information',
      'Designing Software',
      'Programming Paradigms',
      'Selecting and Working with Programming Paradigms',
      'Implementing Programming Language Components',
      'Working with Written Programs'
    ],
    'Module 4: Communication and Resource Sharing in IT': ['Communication and Resource Sharing in IT'],
    'Module 5: Practical Problem Solving in the Digital World': ['Practical Problem Solving in the Digital World']
  }
} as const;

export type SubjectName = string;

export const getAllTopicsForSubject = (subject: string) => {
  if (!subject) return [];
  const normalizedSubject = subject.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = Object.keys(SUBJECT_TOPICS).find(k => k.toLowerCase() === normalizedSubject);
  if (exactMatch) {
    const modules = (SUBJECT_TOPICS as any)[exactMatch];
    return Object.values(modules).flat() as string[];
  }

  // Try partial match (e.g. "Computer Science (A-Level)" should match "Computer Science")
  const partialMatch = Object.keys(SUBJECT_TOPICS).find(k => 
    normalizedSubject.includes(k.toLowerCase()) || k.toLowerCase().includes(normalizedSubject)
  );
  
  if (partialMatch) {
    const modules = (SUBJECT_TOPICS as any)[partialMatch];
    return Object.values(modules).flat() as string[];
  }

  return [];
};

export const getGroupedTopicsForSubject = (subject: string): Record<string, readonly string[]> => {
  if (!subject) return {};
  const normalizedSubject = subject.toLowerCase().trim();

  // Try exact match first
  const exactMatch = Object.keys(SUBJECT_TOPICS).find(k => k.toLowerCase() === normalizedSubject);
  if (exactMatch) {
    return (SUBJECT_TOPICS as any)[exactMatch];
  }

  // Try partial match
  const partialMatch = Object.keys(SUBJECT_TOPICS).find(k => 
    normalizedSubject.includes(k.toLowerCase()) || k.toLowerCase().includes(normalizedSubject)
  );

  if (partialMatch) {
    return (SUBJECT_TOPICS as any)[partialMatch];
  }

  return {};
};
