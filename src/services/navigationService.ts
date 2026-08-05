import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { NavItem } from '../types/navigation';

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-home',
    labelEn: 'Home',
    labelFr: 'Accueil',
    href: '/',
    megaType: 'none',
    isVisible: true,
    order: 1,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-curriculum',
    labelEn: 'Curriculum',
    labelFr: 'Programmes',
    href: '#curriculum',
    megaType: 'curriculum',
    isVisible: true,
    order: 2,
    badgeEn: 'Sub-systems',
    badgeFr: 'Sous-systèmes',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-subjects',
    labelEn: 'Subjects',
    labelFr: 'Matières',
    href: '#subjects',
    megaType: 'subjects',
    isVisible: true,
    order: 3,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-ai-tutor',
    labelEn: 'AI Tutor',
    labelFr: 'Tuteur IA',
    href: '#ai-tutor',
    megaType: 'none',
    icon: 'Sparkles',
    badgeEn: '24/7 AI',
    badgeFr: 'IA 24/7',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    isVisible: true,
    order: 4,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-exams',
    labelEn: 'Mock Exams',
    labelFr: 'Examens Blancs',
    href: '/exams',
    megaType: 'none',
    icon: 'Award',
    isVisible: true,
    order: 5,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-student-ambassador',
    labelEn: 'Student Ambassadors',
    labelFr: 'Ambassadeurs Élèves',
    href: '/student-ambassadors',
    megaType: 'none',
    icon: 'Sparkles',
    badgeEn: 'Leaders',
    badgeFr: 'Leaders',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    isVisible: true,
    order: 6.4,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-alumni',
    labelEn: 'Become an Alumni',
    labelFr: 'Devenir Alumni',
    href: '/alumni',
    megaType: 'none',
    icon: 'Award',
    badgeEn: 'Join',
    badgeFr: 'Rejoindre',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    isVisible: true,
    order: 6.5,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-pricing',
    labelEn: 'Pricing',
    labelFr: 'Tarifs',
    href: '#pricing',
    megaType: 'none',
    isVisible: true,
    order: 6,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-download-app',
    labelEn: 'Download App',
    labelFr: 'Application',
    href: '/mobile-app',
    megaType: 'none',
    icon: 'Smartphone',
    badgeEn: 'Offline',
    badgeFr: 'Hors-Ligne',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    isVisible: true,
    order: 7,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-about',
    labelEn: 'About',
    labelFr: 'À propos',
    href: '#africa-focus',
    megaType: 'none',
    isVisible: true,
    order: 8,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  },
  {
    id: 'nav-more',
    labelEn: 'More',
    labelFr: 'Plus',
    href: '#',
    megaType: 'custom',
    dropdownItems: [
      { labelEn: 'Discussion Forum', labelFr: 'Forum de Discussion', href: '/forum', icon: 'MessageSquare' },
      { labelEn: 'Documentation Hub', labelFr: 'Centre de Documentation', href: '/docs', icon: 'BookOpen' },
      { labelEn: 'Leaderboard & Duels', labelFr: 'Classement & Duels', href: '/leaderboard', icon: 'Trophy' },
      { labelEn: 'Daily Drill Challenge', labelFr: 'Défis Quotidiens', href: '/daily-drill-new', icon: 'Zap' },
      { labelEn: 'Partners & Alliances', labelFr: 'Partenaires & Alliances', href: '#partners', icon: 'Building2' }
    ],
    isVisible: true,
    order: 9,
    allowedRoles: ['public', 'student', 'teacher', 'admin']
  }
];

const NAV_CONFIG_DOC = 'navigation_settings';

export const getNavConfig = async (): Promise<NavItem[]> => {
  try {
    const docRef = doc(db, 'system_settings', NAV_CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().items) {
      const items = docSnap.data().items as NavItem[];
      return items.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.warn('Falling back to default nav items due to offline status:', error);
  }
  return DEFAULT_NAV_ITEMS;
};

export const saveNavConfig = async (items: NavItem[]): Promise<void> => {
  try {
    const docRef = doc(db, 'system_settings', NAV_CONFIG_DOC);
    await setDoc(docRef, {
      items,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save nav config:', error);
    throw error;
  }
};
