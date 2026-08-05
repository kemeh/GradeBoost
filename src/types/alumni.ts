export interface AlumniProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl: string;
  graduationYear: number | string;
  school: string;
  subSystem: 'General Education' | 'Technical & TVEE' | 'Commercial Education' | 'Baccalauréat & French Sub-System';
  currentRole: string;
  companyOrUniversity: string;
  specialization: string;
  location?: string;
  bio: string;
  badges: string[];
  level?: string;
  studentsRecruited?: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  consentGranted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  featured: boolean;
  orderIndex?: number;
  createdAt: string;
  is_demo?: boolean;
  deleted_at?: string | null;
}

export interface AlumniGalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'Summit' | 'Mentorship' | 'Workshops' | 'Graduation' | 'Community';
  displayOrder: number;
  createdAt: string;
  is_demo?: boolean;
  deleted_at?: string | null;
}

export interface AlumniApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  graduationYear: number | string;
  subSystem: string;
  school: string;
  currentRole: string;
  companyOrUniversity: string;
  specialization: string;
  motivation: string;
  linkedin?: string;
  photoUrl?: string;
  consentGranted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  reviewedAt?: string;
  is_demo?: boolean;
  deleted_at?: string | null;
}

export interface AlumniStats {
  totalMembers: number;
  partnerUniversities: number;
  studentsMentored: number;
  impactRate: string;
}
