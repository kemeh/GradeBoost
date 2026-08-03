export interface MegaMenuItem {
  id: string;
  titleEn: string;
  titleFr: string;
  descriptionEn?: string;
  descriptionFr?: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface MegaMenuCategory {
  id: string;
  titleEn: string;
  titleFr: string;
  icon?: string;
  items: MegaMenuItem[];
}

export interface NavItem {
  id: string;
  labelEn: string;
  labelFr: string;
  href: string;
  icon?: string;
  badgeEn?: string;
  badgeFr?: string;
  badgeColor?: string;
  megaType?: 'curriculum' | 'subjects' | 'custom' | 'none';
  megaCategories?: MegaMenuCategory[];
  dropdownItems?: { labelEn: string; labelFr: string; href: string; icon?: string }[];
  isExternal?: boolean;
  isVisible: boolean;
  order: number;
  allowedRoles?: ('public' | 'student' | 'teacher' | 'admin')[];
}

export interface NavSearchResult {
  id: string;
  title: string;
  category: 'Subject' | 'Lesson' | 'Teacher' | 'Course' | 'Mock Exam' | 'Question' | 'AI Tutor' | 'Help Article';
  href: string;
  subtitle?: string;
}
