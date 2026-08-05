export type AmbassadorLevel = 'bronze' | 'silver' | 'gold';

export type AmbassadorApplicationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';

export type AmbassadorClassLevel = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Form 5' | 'Lower Sixth' | 'Upper Sixth';

export interface AmbassadorProfile {
  id: string;
  name: string;
  photo: string;
  school: string;
  schoolLocation: string;
  region: string;
  classLevel: AmbassadorClassLevel;
  level: AmbassadorLevel;
  bio: string;
  referralCode: string;
  recruitedCount: number;
  status: AmbassadorApplicationStatus;
  featured: boolean;
  subjects: string[];
  createdAt: string;
  is_demo?: boolean;
  deleted_at?: string | null;
}

export interface AmbassadorApplication {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  phone: string;
  whatsapp: string;
  email?: string;
  location: string;
  schoolName: string;
  schoolLocation: string;
  region: string;
  classLevel: AmbassadorClassLevel;
  subjects: string[];
  motivationWhy: string;
  motivationIdeas: string;
  skills: string[];
  weeklyHours: '1-2 hours' | '3-5 hours' | 'More than 5 hours';
  agreedToTerms: boolean;
  status: AmbassadorApplicationStatus;
  assignedLevel?: AmbassadorLevel;
  notes?: string;
  submittedAt: string;
  is_demo?: boolean;
  deleted_at?: string | null;
}

export interface AmbassadorGalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'school_activity' | 'presentation' | 'study_session' | 'ambassador_event';
  school?: string;
  date: string;
  is_demo?: boolean;
  deleted_at?: string | null;
}

export interface AmbassadorStats {
  totalRecruitedStudents: number;
  activeAmbassadorsCount: number;
  schoolsCoveredCount: number;
  regionsCount: number;
}
