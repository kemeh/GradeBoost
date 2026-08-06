export interface Testimonial {
  id: string;
  authorName: string;
  roleEn: string;
  roleFr: string;
  schoolOrOrg: string;
  subsystem?: string; // 'General' | 'Technical' | 'Commercial' | 'TVEE'
  level?: string; // 'Ordinary Level' | 'Advanced Level' | 'Probatoire' | 'Baccalauréat'
  country?: string; // 'Cameroon' | 'Nigeria' | 'Ghana' | 'Ivory Coast' | 'Kenya'
  region?: string; // e.g. 'Centre', 'Littoral', 'North West', 'South West'
  subject?: string;
  quoteEn: string;
  quoteFr: string;
  rating: number; // 1 to 5
  avatarUrl?: string;
  videoUrl?: string; // YouTube, Vimeo or MP4
  approvalStatus: 'approved' | 'pending' | 'rejected';
  isFeatured?: boolean;
  displayStatus?: 'active' | 'inactive';
  displayOrder: number;
  authorEmail?: string;
  createdAt: string;
}

