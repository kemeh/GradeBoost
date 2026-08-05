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
  bio: string;
  badges: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  consentGranted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  orderIndex?: number;
  createdAt: string;
}

export interface AlumniGalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'Summit' | 'Mentorship' | 'Workshops' | 'Graduation' | 'Community';
  displayOrder: number;
  createdAt: string;
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface AlumniStats {
  totalMembers: number;
  partnerUniversities: number;
  studentsMentored: number;
  impactRate: string;
}
