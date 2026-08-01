import { SubjectModel } from '../types';

export interface CommercialSpecialtyDefinition {
  id: string;
  code: string;
  name: string;
  level: 'Intermediate level' | 'Advance level';
  description: string;
  professionalSubjects: string[];
  relatedSubjects: string[]; // For Advanced: relatedSubjects; For Intermediate: relatedProfessionalSubjects
  generalOrPoolSubjects: string[]; // For Advanced: poolSubjects; For Intermediate: generalCoreSubjects
  complementarySubjects?: string[]; // Specifically for Intermediate Level TVE IL
}

export const INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES: CommercialSpecialtyDefinition[] = [
  {
    id: 'il-acc',
    code: 'ACC',
    name: 'Accounting',
    level: 'Intermediate level',
    description: 'Cameroon GCE TVE Intermediate Level (IL) Specialty in Accounting.',
    professionalSubjects: [
      'Financial Accounting',
      'Cost Accounting',
      'Computerized Accounting'
    ],
    relatedSubjects: [
      'Business Mathematics',
      'Business Economics',
      'Commerce & Office Practice'
    ],
    generalOrPoolSubjects: [
      'English Language',
      'French Language',
      'ICT & Computer Literacy',
      'Civic Education'
    ],
    complementarySubjects: [
      'Entrepreneurship Basics',
      'Business Communication'
    ]
  },
  {
    id: 'il-hec',
    code: 'HEC',
    name: 'Home Economics',
    level: 'Intermediate level',
    description: 'Cameroon GCE TVE Intermediate Level (IL) Specialty in Home Economics.',
    professionalSubjects: [
      'Catering & Food Science',
      'Clothing & Textiles',
      'Home Management & Child Care'
    ],
    relatedSubjects: [
      'Applied Biology & Chemistry',
      'Nutrition & Dietetics',
      'Consumer Education'
    ],
    generalOrPoolSubjects: [
      'English Language',
      'French Language',
      'ICT & Computer Literacy',
      'Civic Education'
    ],
    complementarySubjects: [
      'Entrepreneurship Basics',
      'Interior Decoration'
    ]
  },
  {
    id: 'il-mkt',
    code: 'MKT',
    name: 'Marketing',
    level: 'Intermediate level',
    description: 'Cameroon GCE TVE Intermediate Level (IL) Specialty in Marketing.',
    professionalSubjects: [
      'Principles of Marketing',
      'Salesmanship & Merchandising',
      'Retail Operations'
    ],
    relatedSubjects: [
      'Business Mathematics',
      'Business Economics',
      'Commercial Correspondence'
    ],
    generalOrPoolSubjects: [
      'English Language',
      'French Language',
      'ICT & Computer Literacy',
      'Civic Education'
    ],
    complementarySubjects: [
      'Entrepreneurship Basics',
      'Customer Service'
    ]
  },
  {
    id: 'il-sac',
    code: 'SAC',
    name: 'Secretarial Administration and Communication',
    level: 'Intermediate level',
    description: 'Cameroon GCE TVE Intermediate Level (IL) Specialty in Secretarial Administration and Communication.',
    professionalSubjects: [
      'Shorthand / Speedwriting',
      'Typewriting / Keyboard Skills',
      'Office Practice & Administration'
    ],
    relatedSubjects: [
      'Business Communication',
      'Information Processing & ICT',
      'Business Law Basics'
    ],
    generalOrPoolSubjects: [
      'English Language',
      'French Language',
      'Civic Education'
    ],
    complementarySubjects: [
      'Entrepreneurship Basics',
      'Secretarial Ethics'
    ]
  }
];

export const ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES: CommercialSpecialtyDefinition[] = [
  {
    id: 'al-acc-cg',
    code: 'ACC/CG',
    name: 'Accounting',
    level: 'Advance level',
    description: 'Cameroon GCE Board Advanced Level TVEE Commercial Specialty in Accounting and Corporate Finance.',
    professionalSubjects: [
      'Financial Accounting / Computer Aided Accounting',
      'Cost & Management Accounting',
      'Corporate Accounting'
    ],
    relatedSubjects: [
      'Economics',
      'Business Mathematics',
      'Business Management',
      'Commerce and Finance'
    ],
    generalOrPoolSubjects: [
      'Pure Mathematics with Statistics',
      'Religious Studies',
      'Computer Science',
      'ICT',
      'Entrepreneurship',
      'Philosophy',
      'Professional English',
      'Law'
    ]
  },
  {
    id: 'al-hec-esf',
    code: 'HEC/ESF',
    name: 'Home Economics',
    level: 'Advance level',
    description: 'Cameroon GCE Board Advanced Level TVEE Commercial Specialty in Home Economics and Social Life Studies.',
    professionalSubjects: [
      'Catering Management & Dietetics',
      'Resource Management in Home Studies & Social Life',
      'Family Life Education & Gerontology'
    ],
    relatedSubjects: [
      'Natural Science',
      'Entrepreneurship',
      'Professional English'
    ],
    generalOrPoolSubjects: [
      'Economics',
      'Pure Mathematics with Statistics',
      'Religious Studies',
      'Computer Science',
      'ICT',
      'Commerce & Finance',
      'Philosophy',
      'Law'
    ]
  },
  {
    id: 'al-mkt-acc',
    code: 'MKT/ACC',
    name: 'Marketing',
    level: 'Advance level',
    description: 'Cameroon GCE Board Advanced Level TVEE Commercial Specialty in Marketing Practice and Digital Commerce.',
    professionalSubjects: [
      'Professional Marketing Practice',
      'Marketing Skills',
      'Digital Marketing Practice'
    ],
    relatedSubjects: [
      'Economics',
      'Business Mathematics',
      'Business Management',
      'Commerce and Finance'
    ],
    generalOrPoolSubjects: [
      'Pure Mathematics with Statistics',
      'Religious Studies',
      'Computer Science',
      'ICT',
      'Entrepreneurship',
      'Philosophy',
      'Professional English',
      'Law'
    ]
  },
  {
    id: 'al-sac-aca',
    code: 'SAC/ACA',
    name: 'Secretarial Administration and Communication',
    level: 'Advance level',
    description: 'Cameroon GCE Board Advanced Level TVEE Commercial Specialty in Administrative Works and Professional Communication.',
    professionalSubjects: [
      'Organisation of Administrative Works & Technology',
      'Professional Communication Skills',
      'Information Processing'
    ],
    relatedSubjects: [
      'ICT',
      'Professional English',
      'Law'
    ],
    generalOrPoolSubjects: [
      'Economics',
      'Pure Mathematics with Statistics',
      'Religious Studies',
      'Computer Science',
      'Commerce & Finance',
      'Entrepreneurship',
      'Philosophy'
    ]
  },
  {
    id: 'al-tims-fig',
    code: 'TIMS/FIG',
    name: 'Taxation and Information Management Systems',
    level: 'Advance level',
    description: 'Cameroon GCE Board Advanced Level TVEE Commercial Specialty in Taxation Practice and Information Management Systems for Business.',
    professionalSubjects: [
      'Financial Accounting / Computer Aided Accounting',
      'Principles & Practice of Taxation',
      'Information Management Systems for Business'
    ],
    relatedSubjects: [
      'Economics',
      'Business Mathematics',
      'Business Management',
      'Commerce & Finance',
      'Entrepreneurship'
    ],
    generalOrPoolSubjects: [
      'Pure Mathematics with Statistics',
      'Religious Studies',
      'Computer Science',
      'ICT',
      'Entrepreneurship',
      'Philosophy',
      'Professional English',
      'Law'
    ]
  }
];

export function generateAllCommercialSubjectsSeed(): SubjectModel[] {
  const subjectsMap = new Map<string, SubjectModel>();

  const allSpecs = [...INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES, ...ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES];

  allSpecs.forEach(spec => {
    // Professional
    spec.professionalSubjects.forEach(subName => {
      const id = `${spec.level === 'Intermediate level' ? 'il' : 'al'}-${spec.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-prof`;
      if (!subjectsMap.has(id)) {
        subjectsMap.set(id, {
          id,
          name: subName,
          code: `COMM-${spec.code}-P`,
          level: spec.level,
          departmentId: 'commercial-education',
          category: 'Professional Subject',
          description: `Professional subject for ${spec.name} (${spec.code}) ${spec.level}.`,
          isActive: true,
          papers: [
            { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Multiple Choice Questions' },
            { id: 'paper2', name: 'Paper 2 (Structured / Problem Solving)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Structured and problem-solving exam' },
            { id: 'paper3', name: 'Paper 3 (Practical Examination)', type: 'Practical', totalMarks: 50, durationMinutes: 150, description: 'Practical computer or professional application exam' }
          ]
        });
      }
    });

    // Related
    spec.relatedSubjects.forEach(subName => {
      const id = `${spec.level === 'Intermediate level' ? 'il' : 'al'}-${spec.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-rel`;
      if (!subjectsMap.has(id)) {
        subjectsMap.set(id, {
          id,
          name: subName,
          code: `COMM-${spec.code}-R`,
          level: spec.level,
          departmentId: 'commercial-education',
          category: spec.level === 'Intermediate level' ? 'Related Professional Subject' : 'Related Subject',
          description: `Related supporting subject for ${spec.name} ${spec.level}.`,
          isActive: true,
          papers: [
            { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Multiple Choice Questions' },
            { id: 'paper2', name: 'Paper 2 (Essay & Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Theoretical and essay questions' }
          ]
        });
      }
    });

    // General / Pool
    spec.generalOrPoolSubjects.forEach(subName => {
      const id = `${spec.level === 'Intermediate level' ? 'il' : 'al'}-pool-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!subjectsMap.has(id)) {
        subjectsMap.set(id, {
          id,
          name: subName,
          code: `COMM-POOL`,
          level: spec.level,
          departmentId: 'commercial-education',
          category: spec.level === 'Intermediate level' ? 'General/Core Subject' : 'Pool Subject',
          description: `Elective or core subject available for ${spec.name} ${spec.level} students.`,
          isActive: true,
          papers: [
            { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Multiple Choice Questions' },
            { id: 'paper2', name: 'Paper 2 (Essay & Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Theoretical exam' }
          ]
        });
      }
    });

    // Complementary (if any)
    if (spec.complementarySubjects) {
      spec.complementarySubjects.forEach(subName => {
        const id = `il-comp-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        if (!subjectsMap.has(id)) {
          subjectsMap.set(id, {
            id,
            name: subName,
            code: `COMM-IL-COMP`,
            level: 'Intermediate level',
            departmentId: 'commercial-education',
            category: 'Complementary Education',
            description: `Complementary education subject for Intermediate Level TVE IL.`,
            isActive: true,
            papers: [
              { id: 'paper1', name: 'Paper 1 (MCQ & Practice)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Practical and MCQ assessment' }
            ]
          });
        }
      });
    }
  });

  return Array.from(subjectsMap.values());
}
