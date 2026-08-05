import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  enabled: boolean;
  order: number;
}

export interface SocialMediaLink {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'X (Twitter)' | 'LinkedIn' | 'TikTok' | 'YouTube' | 'WhatsApp' | 'Telegram';
  url: string;
  enabled: boolean;
  iconName: string;
  order: number;
}

export interface ContactInfoConfig {
  email: string;
  secondaryEmail?: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  businessHours: string;
  mapsUrl?: string;
}

export interface NewsletterConfig {
  enabled: boolean;
  heading: string;
  description: string;
  buttonText: string;
  placeholderText: string;
  emailService: string;
}

export interface BrandConfig {
  logoUrl: string;
  name: string;
  description: string;
  copyright: string;
  slogan: string;
  showEncryptedBadge: boolean;
  showBilingualBadge: boolean;
}

export interface FooterConfig {
  brand: BrandConfig;
  quickLinks: FooterLink[];
  legalDocuments: FooterLink[];
  resources: FooterLink[];
  socialLinks: SocialMediaLink[];
  contactInfo: ContactInfoConfig;
  newsletter: NewsletterConfig;
  version: number;
  updatedAt?: string;
  published: boolean;
}

export interface FooterVersionHistory {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  config: FooterConfig;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brand: {
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    name: "Edulpha",
    description: "Cameroon's premier AI-powered educational platform for General Education, Technical, Commercial, and TVEE Intermediate & Advanced Levels success.",
    copyright: "© 2026 Edulpha Learning Systems. All Rights Reserved.",
    slogan: "Empowering Next-Generation Academic & Technical Mastery Across Africa",
    showEncryptedBadge: true,
    showBilingualBadge: true,
  },
  quickLinks: [
    { id: 'ql-1', label: 'Home', url: '#', enabled: true, order: 1 },
    { id: 'ql-ambassador', label: 'Become a Student Ambassador', url: '/student-ambassadors', enabled: true, order: 2 },
    { id: 'ql-alumni', label: 'Become an Alumni', url: '/alumni', enabled: true, order: 3 },
    { id: 'ql-2', label: 'About Us & Features', url: '#features', enabled: true, order: 3 },
    { id: 'ql-3', label: 'Learning Ecosystems', url: '#learning-paths', enabled: true, order: 3 },
    { id: 'ql-4', label: 'How It Works', url: '#how-it-works', enabled: true, order: 4 },
    { id: 'ql-5', label: 'Download Mobile App', url: '#mobile-app', enabled: true, order: 5 },
    { id: 'ql-6', label: 'Partner School Hubs', url: '#partners', enabled: true, order: 6 },
    { id: 'ql-7', label: 'Pricing & Subscriptions', url: '#pricing', enabled: true, order: 7 },
    { id: 'ql-8', label: 'FAQ & Support', url: '#faq', enabled: true, order: 8 },
  ],
  legalDocuments: [
    { id: 'ld-1', label: 'Privacy Policy', url: '/privacy-policy', enabled: true, order: 1 },
    { id: 'ld-2', label: 'Terms & Conditions', url: '/terms-and-conditions', enabled: true, order: 2 },
    { id: 'ld-3', label: 'Cookie Policy', url: '/cookie-policy', enabled: true, order: 3 },
    { id: 'ld-4', label: 'Data Protection Policy', url: '/data-protection', enabled: true, order: 4 },
    { id: 'ld-5', label: 'Community Guidelines', url: '/community-guidelines', enabled: true, order: 5 },
    { id: 'ld-6', label: 'User Agreement', url: '/user-agreement', enabled: true, order: 6 },
    { id: 'ld-7', label: 'Official Disclaimer', url: '/disclaimer', enabled: true, order: 7 },
    { id: 'ld-8', label: 'Refund & Billing Policy', url: '/refund-policy', enabled: true, order: 8 },
    { id: 'ld-9', label: 'Accessibility Statement', url: '/accessibility-statement', enabled: true, order: 9 },
    { id: 'ld-10', label: 'Copyright Notice', url: '/copyright-notice', enabled: true, order: 10 },
  ],
  resources: [
    { id: 'res-1', label: 'Student & Parent Guide', url: '/user-guide', enabled: true, order: 1 },
    { id: 'res-2', label: 'Teacher Studio Guide', url: '/teacher-guide', enabled: true, order: 2 },
    { id: 'res-3', label: 'Institution & Partner Guide', url: '/partner-guide', enabled: true, order: 3 },
    { id: 'res-4', label: 'TVEE & Technical Guide', url: '/tvee-guide', enabled: true, order: 4 },
    { id: 'res-5', label: 'Pre-Launch Package Docs', url: '/docs', enabled: true, order: 5 },
    { id: 'res-6', label: 'Edulpha AI Tutor Guide', url: '#ai-tutor', enabled: true, order: 6 },
    { id: 'res-7', label: 'Help Center & Knowledge Base', url: '#faq', enabled: true, order: 7 },
    { id: 'res-8', label: 'Android APK Downloads', url: '#mobile-app', enabled: true, order: 8 },
  ],
  socialLinks: [
    { id: 'soc-1', platform: 'Facebook', url: 'https://facebook.com/edulpha', enabled: true, iconName: 'Globe', order: 1 },
    { id: 'soc-2', platform: 'Instagram', url: 'https://instagram.com/edulpha', enabled: true, iconName: 'Instagram', order: 2 },
    { id: 'soc-3', platform: 'X (Twitter)', url: 'https://twitter.com/edulpha', enabled: true, iconName: 'Share2', order: 3 },
    { id: 'soc-4', platform: 'LinkedIn', url: 'https://linkedin.com/company/edulpha', enabled: true, iconName: 'Users', order: 4 },
    { id: 'soc-5', platform: 'TikTok', url: 'https://tiktok.com/@edulpha', enabled: true, iconName: 'Video', order: 5 },
    { id: 'soc-6', platform: 'YouTube', url: 'https://youtube.com/@edulpha', enabled: true, iconName: 'Play', order: 6 },
    { id: 'soc-7', platform: 'WhatsApp', url: 'https://wa.me/237670000000', enabled: true, iconName: 'MessageSquare', order: 7 },
    { id: 'soc-8', platform: 'Telegram', url: 'https://t.me/edulpha', enabled: true, iconName: 'Send', order: 8 },
  ],
  contactInfo: {
    email: 'support@edulpha.cm',
    secondaryEmail: 'partners@edulpha.cm',
    phone: '+237 670 000 000',
    secondaryPhone: '+237 690 000 000',
    address: 'Edulpha Hub, Akwa, Douala & Bastos, Yaoundé, Cameroon',
    businessHours: 'Mon - Sat: 08:00 - 20:00 (WAT)',
    mapsUrl: 'https://maps.google.com/?q=Douala+Cameroon',
  },
  newsletter: {
    enabled: true,
    heading: 'Subscribe for Weekly Exam Revision & Curriculum Updates',
    description: 'Get key study tips, mock test announcements, and official MINESEC & GCE Board updates directly in your inbox.',
    buttonText: 'Subscribe Now',
    placeholderText: 'Enter your email address...',
    emailService: 'Local Firestore & Admin Mailer Gateway',
  },
  version: 1,
  published: true,
  updatedAt: new Date().toISOString(),
};

const LOCAL_STORAGE_KEY = 'edulpha_footer_config';
const LOCAL_VERSIONS_KEY = 'edulpha_footer_versions';
const FOOTER_DOC_ID = 'footer_config';

export const getFooterConfig = async (): Promise<FooterConfig> => {
  try {
    const docRef = doc(db, 'system_settings', FOOTER_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as FooterConfig;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Using local fallback for footer config:', err);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // fallback
    }
  }

  return DEFAULT_FOOTER_CONFIG;
};

export const saveFooterConfig = async (config: FooterConfig, userId?: string, isPublishing: boolean = true): Promise<void> => {
  const nextVersion = config.version + (isPublishing ? 1 : 0);
  const updatedConfig: FooterConfig = {
    ...config,
    version: nextVersion,
    published: isPublishing,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfig));

  try {
    const docRef = doc(db, 'system_settings', FOOTER_DOC_ID);
    await setDoc(docRef, updatedConfig, { merge: true });

    // Save version history entry
    const historyRef = doc(db, 'footer_versions', `v_${nextVersion}_${Date.now()}`);
    await setDoc(historyRef, {
      version: nextVersion,
      createdAt: new Date().toISOString(),
      createdBy: userId || 'admin',
      config: updatedConfig,
    });
  } catch (err) {
    console.warn('Could not persist footer config to Firestore, cached locally:', err);
  }

  // Also maintain local version history
  try {
    const historyCached = localStorage.getItem(LOCAL_VERSIONS_KEY);
    const history: FooterVersionHistory[] = historyCached ? JSON.parse(historyCached) : [];
    history.unshift({
      id: `v_${nextVersion}_${Date.now()}`,
      version: nextVersion,
      createdAt: new Date().toISOString(),
      createdBy: userId || 'admin',
      config: updatedConfig,
    });
    localStorage.setItem(LOCAL_VERSIONS_KEY, JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.error('Error storing local version history:', e);
  }
};

export const getFooterVersionHistory = async (): Promise<FooterVersionHistory[]> => {
  try {
    const q = query(collection(db, 'footer_versions'), orderBy('version', 'desc'), limit(15));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as FooterVersionHistory);
    }
  } catch (e) {
    // fallback to local
  }

  const historyCached = localStorage.getItem(LOCAL_VERSIONS_KEY);
  if (historyCached) {
    try {
      return JSON.parse(historyCached);
    } catch (err) {}
  }

  return [
    {
      id: 'v_1_initial',
      version: 1,
      createdAt: new Date().toISOString(),
      createdBy: 'System Default',
      config: DEFAULT_FOOTER_CONFIG,
    }
  ];
};
