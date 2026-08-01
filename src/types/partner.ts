export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
}

export interface PartnerCategory {
  id: string;
  nameEn: string;
  nameFr: string;
  slug: string;
  description?: string;
  displayOrder: number;
  icon?: string;
}

export type PartnershipType = 'Educational' | 'Technology' | 'Government' | 'Corporate' | 'Training' | 'Sponsorship' | 'Community';
export type DisplayStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface Partner {
  id: string;
  nameEn: string;
  nameFr: string;
  logoUrl: string;
  coverImageUrl?: string;
  shortDescEn: string;
  shortDescFr: string;
  fullDescEn?: string;
  fullDescFr?: string;
  categoryId: string;
  partnershipType: PartnershipType;
  startDate?: string;
  endDate?: string;
  displayStatus: DisplayStatus;
  featured: boolean;
  displayOrder: number;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}
