import { SubjectModel } from '../types';

export interface TVEEIndustrialSpecialtyDefinition {
  id: string;
  code: string;
  frenchCode?: string;
  name: string;
  level: 'Advance level';
  department: 'Industrial';
  description: string;
  professionalSubjects: string[];
  relatedSubjects: string[];
  poolSubjects: string[];
}

export const REUSABLE_RELATED_PROFESSIONAL_SUBJECTS: string[] = [
  'Automation',
  'Engineering Science',
  'Mathematics',
  'Building Construction Surveying and Soil Mechanics',
  'Entrepreneurship',
  'Electrical/Electronics Applied Mechanics',
  'Food Processing and Preservation',
  'Wood Cabinet Applied Mechanics',
  'Maintenance and Machine Control'
];

export const SHARED_POOL_SUBJECTS: string[] = [
  'Information and Communication Technology (ICT)',
  'Entrepreneurship',
  'Philosophy',
  'Professional English (Language and Organisational Communication)',
  'Law',
  'Religious Studies'
];

export const ADVANCED_LEVEL_TVEE_INDUSTRIAL_SPECIALTIES: TVEEIndustrialSpecialtyDefinition[] = [
  {
    id: 'ah-hd',
    code: 'AH-HD',
    frenchCode: 'MAPL',
    name: 'Automobile Construction – Heavy Duty Vehicle Maintenance',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Heavy Duty Vehicle Maintenance & Heavy Construction Equipment Mechanics.',
    professionalSubjects: [
      'Heavy Duty Diesel Engine Technology',
      'Automotive Heavy Duty Transmission & Hydraulic Drive Systems',
      'Heavy Vehicle Electrical & Electronic Diagnostics'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'am-lv',
    code: 'AM-LV',
    frenchCode: 'MAVT',
    name: 'Automobile Construction – Light Vehicle Maintenance',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Light Vehicle Repair, Engine Tuning & Motor Mechanics.',
    professionalSubjects: [
      'Light Vehicle Internal Combustion Engine Technology',
      'Automotive Chassis, Steering & Braking Systems',
      'Automotive Diagnostics & Engine Management'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'ce-ad',
    code: 'CE-AD',
    frenchCode: 'F4BE',
    name: 'Civil Engineering – Architectural Draftsmanship',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Architectural Design, CAD Drawing & Structural Detailing.',
    professionalSubjects: [
      'Architectural Technical Drawing & CAD Modeling',
      'Building Construction Technology & Materials',
      'Structural Engineering & Detailing'
    ],
    relatedSubjects: [
      'Mathematics',
      'Building Construction Surveying and Soil Mechanics',
      'Engineering Science',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'ce-bc',
    code: 'CE-BC',
    frenchCode: 'F4BA',
    name: 'Civil Engineering – Building Construction',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Reinforced Concrete Works, Masonry & Building Site Management.',
    professionalSubjects: [
      'Building Construction Technology & Reinforced Concrete',
      'Construction Site Management & Quantity Surveying',
      'Building Mechanics & Structural Calculations'
    ],
    relatedSubjects: [
      'Mathematics',
      'Building Construction Surveying and Soil Mechanics',
      'Engineering Science',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'ce-pw',
    code: 'CE-PW',
    frenchCode: 'F4TP',
    name: 'Civil Engineering – Public Works',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Road Design, Bridges, Hydraulics & Earthworks.',
    professionalSubjects: [
      'Road Construction & Pavement Design',
      'Public Works Materials & Geotechnics',
      'Hydraulic Infrastructure & Drainage Engineering'
    ],
    relatedSubjects: [
      'Mathematics',
      'Building Construction Surveying and Soil Mechanics',
      'Engineering Science',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'clin',
    code: 'CLIN',
    frenchCode: 'IH',
    name: 'Clothing Industry',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Garment Pattern Making, Textile Engineering & Fashion Production.',
    professionalSubjects: [
      'Garment Pattern Drafting & Industrial Grading',
      'Clothing Technology & Textile Science',
      'Industrial Apparel Manufacturing & Quality Assurance'
    ],
    relatedSubjects: [
      'Mathematics',
      'Engineering Science',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'coph',
    code: 'COPH',
    frenchCode: 'COPH',
    name: 'Cosmetics and Pharmacology',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Cosmetic Science, Pharmaceutical Chemistry & Quality Control.',
    professionalSubjects: [
      'Cosmetic Formulation & Galenic Technology',
      'Pharmacology & Pharmaceutical Chemistry',
      'Quality Control & Laboratory Safety Systems'
    ],
    relatedSubjects: [
      'Mathematics',
      'Engineering Science',
      'Food Processing and Preservation',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'eps',
    code: 'EPS',
    frenchCode: 'F3',
    name: 'Electrical Power Systems',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in High Voltage Transmission, Electric Machines & Power Distribution.',
    professionalSubjects: [
      'Electrical Power Generation, Transmission & Grid Distribution',
      'Electrical Machines & Drives Technology',
      'Power Electronics & Industrial Motor Drives'
    ],
    relatedSubjects: [
      'Automation',
      'Mathematics',
      'Engineering Science',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'eln',
    code: 'ELN',
    frenchCode: 'F2',
    name: 'Electronics',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Analog & Digital Microelectronics, Signal Processing & Embedded Hardware.',
    professionalSubjects: [
      'Analog & Digital Electronic Circuit Design',
      'Microcontrollers & Embedded Signal Processing',
      'Telecommunication & High-Frequency Circuitry'
    ],
    relatedSubjects: [
      'Automation',
      'Mathematics',
      'Engineering Science',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'fmt',
    code: 'FMT',
    frenchCode: 'EF',
    name: 'Forestry Management and Techniques',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Timber Harvesting, Forest Conservation & Wood Resource Operations.',
    professionalSubjects: [
      'Forest Inventory & Sustainable Resource Operations',
      'Timber Harvesting Machinery & Chainsaw Operations',
      'Silviculture & Environmental Impact Assessment'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Wood Cabinet Applied Mechanics',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'hvac',
    code: 'HVAC',
    frenchCode: 'F5',
    name: 'Heating, Ventilation and Air Conditioning',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Refrigeration Cycles, Thermal Energy Systems & Climate Control.',
    professionalSubjects: [
      'Refrigeration Thermodynamic Principles & Heat Exchangers',
      'Air Conditioning Systems Installation & Air Balance',
      'HVAC Control Systems & Gas Heating Technology'
    ],
    relatedSubjects: [
      'Automation',
      'Mathematics',
      'Engineering Science',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'hbma',
    code: 'HBMA',
    frenchCode: 'MHB',
    name: 'Hospital and Biomedical Maintenance',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Medical Device Calibration, Clinical Imaging Equipment & Biomedical Instrumentation.',
    professionalSubjects: [
      'Biomedical Instrumentation & Clinical Device Calibration',
      'Medical Imaging & Diagnostic Systems Maintenance',
      'Hospital Sterilization & Gas Supply System Mechanics'
    ],
    relatedSubjects: [
      'Automation',
      'Mathematics',
      'Engineering Science',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'imes',
    code: 'IMES',
    frenchCode: 'MISE',
    name: 'Installation and Maintenance of Electronic Systems',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Industrial Electronic Automation, Audio-Visual Equipment & PCB Troubleshooting.',
    professionalSubjects: [
      'Industrial Electronic Control & Programmable Logic Systems',
      'Consumer Electronics & Audio-Visual Systems Maintenance',
      'Electronic System Diagnostics & Surface-Mount Repair'
    ],
    relatedSubjects: [
      'Automation',
      'Mathematics',
      'Engineering Science',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'meme',
    code: 'MEME',
    frenchCode: 'MEM',
    name: 'Maintenance of Electro-Mechanical Equipment',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Pneumatics, Hydraulics, Electric Motors & Industrial Automation.',
    professionalSubjects: [
      'Electro-Mechanical Systems Diagnostics & Preventive Repair',
      'Industrial Hydraulics, Pneumatics & Fluid Power',
      'PLC Automation & Motor Control Systems'
    ],
    relatedSubjects: [
      'Automation',
      'Engineering Science',
      'Mathematics',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'mame',
    code: 'MAME',
    frenchCode: 'F1',
    name: 'Manufacturing Mechanics',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Precision Machining, Lathe Milling & Mechanical CAD/CAM.',
    professionalSubjects: [
      'Precision Machining & Machine Tool Operations (Lathe, Milling)',
      'Mechanical CAD/CAM Manufacturing & Metrology',
      'Mechanical Design & Production Engineering'
    ],
    relatedSubjects: [
      'Automation',
      'Engineering Science',
      'Mathematics',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'mwip',
    code: 'MWIP',
    frenchCode: 'MFCM',
    name: 'Metal Works and Industrial Piping',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Arc/TIG Welding, Structural Steel Fabrications & Piping Networks.',
    professionalSubjects: [
      'Structural Steel Fabrication & Welding Technology (TIG/MIG/SMAW)',
      'Industrial Piping Network Design & Pressure Vessels',
      'Metal Construction Detailing & Non-Destructive Testing'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Electrical/Electronics Applied Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'minp',
    code: 'MINP',
    frenchCode: 'MIPE',
    name: 'Mining and Petroleum',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Drilling Operations, Petroleum Geology & Refinery Systems.',
    professionalSubjects: [
      'Petroleum Reservoir Engineering & Drilling Operations',
      'Mineral Extraction & Rock Mechanics',
      'Oil & Gas Well Production & Refinery Processing'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Building Construction Surveying and Soil Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'pcbp',
    code: 'PCBP',
    frenchCode: 'BIPE',
    name: 'Petrochemistry and Bioproducts',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Chemical Plant Operations, Biofuels & Polymer Synthesis.',
    professionalSubjects: [
      'Petrochemical Processes & Polymer Synthesis',
      'Bioproduct Manufacturing & Biofuel Refining',
      'Chemical Process Plant Safety & Reaction Kinetics'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Food Processing and Preservation',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'phis',
    code: 'PHIS',
    frenchCode: 'ISRH',
    name: 'Plumbing and Hydraulic Installation Systems',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Domestic & Industrial Water Supply, Sanitary Engineering & Solar Plumbing.',
    professionalSubjects: [
      'Sanitary Plumbing & High-Pressure Water Distribution Networks',
      'Solar Water Heating & Domestic Boiler Installations',
      'Wastewater Treatment Systems & Hydraulic Piping Design'
    ],
    relatedSubjects: [
      'Engineering Science',
      'Mathematics',
      'Building Construction Surveying and Soil Mechanics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'surv',
    code: 'SURV',
    frenchCode: 'GTTO',
    name: 'Surveying',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Topography, GPS Geodesy, Photogrammetry & Land Mapping.',
    professionalSubjects: [
      'Topographic Surveying & Total Station Fieldwork',
      'GIS Mapping & Satellite Positioning (GNSS/GPS)',
      'Photogrammetry & Cadastral Mapping Regulations'
    ],
    relatedSubjects: [
      'Mathematics',
      'Building Construction Surveying and Soil Mechanics',
      'Engineering Science',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'wcm',
    code: 'WCM',
    frenchCode: 'MEB',
    name: 'Wood Cabinet-Making',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Fine Furniture Construction, Cabinetry Design & Wood Marquetry.',
    professionalSubjects: [
      'Fine Cabinetry Construction & Furniture Joinery',
      'Furniture CAD Design & Decorative Wood Marquetry',
      'Wood Surface Finishing, Spraying & Veneering'
    ],
    relatedSubjects: [
      'Wood Cabinet Applied Mechanics',
      'Engineering Science',
      'Mathematics',
      'Entrepreneurship'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  },
  {
    id: 'wpr',
    code: 'WPR',
    frenchCode: 'IB',
    name: 'Wood Processing',
    level: 'Advance level',
    department: 'Industrial',
    description: 'Cameroon GCE TVEE Specialty in Industrial Sawmilling, Wood Drying & Engineered Timber Manufacturing.',
    professionalSubjects: [
      'Industrial Sawmilling & Timber Drying Technology',
      'Engineered Wood Products (Plywood, MDF, Glulam)',
      'Wood Machine Tool Maintenance & Cutter Sharpening'
    ],
    relatedSubjects: [
      'Wood Cabinet Applied Mechanics',
      'Engineering Science',
      'Mathematics',
      'Maintenance and Machine Control'
    ],
    poolSubjects: SHARED_POOL_SUBJECTS
  }
];

export function generateAllTVEEIndustrialSubjectsSeed(): SubjectModel[] {
  const subjectsMap = new Map<string, SubjectModel>();

  ADVANCED_LEVEL_TVEE_INDUSTRIAL_SPECIALTIES.forEach(spec => {
    // Professional Subjects (each has Paper 1 MCQ, Paper 2 Structured/Problem Solving, Paper 3 Practical)
    spec.professionalSubjects.forEach(subName => {
      const id = `tvee-al-${spec.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-prof`;
      if (!subjectsMap.has(id)) {
        subjectsMap.set(id, {
          id,
          name: subName,
          code: `TVEE-${spec.code}-P`,
          level: 'Advance level',
          educationLevel: 'Advanced Level',
          departmentId: 'tve-industrial',
          category: 'Professional Subject',
          description: `Official TVEE Professional Subject for ${spec.name} (${spec.code}).`,
          isActive: true,
          papers: [
            { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Multiple Choice Questions (Official Exam Format)' },
            { id: 'paper2', name: 'Paper 2 (Structured / Problem Solving)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Structured Questions & Engineering Problem Solving' },
            { id: 'paper3', name: 'Paper 3 (Practical Examination)', type: 'Practical', totalMarks: 100, durationMinutes: 240, description: 'Hands-on Workshop/Laboratory Practical Assessment' }
          ]
        });
      }
    });

    // Related Professional Subjects
    spec.relatedSubjects.forEach(subName => {
      const id = `tvee-al-rel-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!subjectsMap.has(id)) {
        subjectsMap.set(id, {
          id,
          name: subName,
          code: `TVEE-REL`,
          level: 'Advance level',
          educationLevel: 'Advanced Level',
          departmentId: 'tve-industrial',
          category: 'Related Professional Subject',
          description: `Reusable Related Professional Subject for TVEE Industrial Specialties.`,
          isActive: true,
          papers: [
            { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Multiple Choice Questions' },
            { id: 'paper2', name: 'Paper 2 (Structured / Calculations)', type: 'Structured', totalMarks: 100, durationMinutes: 180, description: 'Theory, Calculations & Principles' }
          ]
        });
      }
    });

    // Shared Pool Subjects
    spec.poolSubjects.forEach(subName => {
      const id = `tvee-al-pool-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!subjectsMap.has(id)) {
        subjectsMap.set(id, {
          id,
          name: subName,
          code: `TVEE-POOL`,
          level: 'Advance level',
          educationLevel: 'Advanced Level',
          departmentId: 'tve-industrial',
          category: 'Pool Subject',
          description: `Independent shared Pool Subject for Cameroon GCE TVEE Candidates.`,
          isActive: true,
          papers: [
            { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90, description: 'Multiple Choice Questions' },
            { id: 'paper2', name: 'Paper 2 (Theory / Essay)', type: 'Theory', totalMarks: 100, durationMinutes: 180, description: 'Essay & Comprehensive Written Exam' }
          ]
        });
      }
    });
  });

  return Array.from(subjectsMap.values());
}
