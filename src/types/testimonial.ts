export interface Testimonial {
  id: string;
  authorName: string;
  roleEn: string;
  roleFr: string;
  schoolOrOrg: string;
  quoteEn: string;
  quoteFr: string;
  rating: number;
  avatarUrl: string;
  displayStatus: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
}
