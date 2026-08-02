import { Partner, PartnerCategory } from '../types/partner';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';

const STORAGE_KEY_PARTNERS = 'edulpha_partners_data_v1';
const STORAGE_KEY_CATEGORIES = 'edulpha_partner_categories_v1';

export const DEFAULT_CATEGORIES: PartnerCategory[] = [
  {
    id: 'cat-gov',
    nameEn: 'Government & Ministries',
    nameFr: 'Gouvernement & Ministères',
    slug: 'government',
    description: 'National ministries of secondary education and public exam boards.',
    displayOrder: 1,
    icon: 'Building2'
  },
  {
    id: 'cat-edu',
    nameEn: 'Educational Boards & Universities',
    nameFr: 'Conseils Éducatifs & Universités',
    slug: 'educational',
    description: 'Exam boards, universities, and academic institutions.',
    displayOrder: 2,
    icon: 'GraduationCap'
  },
  {
    id: 'cat-tech',
    nameEn: 'Technology & EdTech Alliances',
    nameFr: 'Alliances Technologiques & EdTech',
    slug: 'technology',
    description: 'AI, cloud, software, and digital learning infrastructure partners.',
    displayOrder: 3,
    icon: 'Cpu'
  },
  {
    id: 'cat-corp',
    nameEn: 'Corporate & Telecom Partners',
    nameFr: 'Partenaires Entreprises & Télécoms',
    slug: 'corporate',
    description: 'Telecom providers, Mobile Money gateways, and corporate sponsors.',
    displayOrder: 4,
    icon: 'Smartphone'
  },
  {
    id: 'cat-comm',
    nameEn: 'Community & Non-Profit',
    nameFr: 'Communautés & ONG',
    slug: 'community',
    description: 'Youth empowerment organizations and STEM initiative funds.',
    displayOrder: 5,
    icon: 'Users'
  }
];

export const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'p-minesec',
    nameEn: 'Ministry of Secondary Education (MINESEC Cameroon)',
    nameFr: 'Ministère de l\'Enseignement Secondaire (MINESEC Cameroun)',
    logoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    shortDescEn: 'Official collaboration on curriculum alignment for Cameroon GCE & Francophone Baccalauréat.',
    shortDescFr: 'Collaboration officielle sur l\'alignement des programmes du GCE et du Baccalauréat Camerounais.',
    fullDescEn: 'Edulpha works closely with educational inspectorates to ensure 100% official syllabus coverage across Ordinary Level, Advanced Level, BEPC, Seconde, Première, and Terminale.',
    fullDescFr: 'Edulpha travaille en étroite collaboration avec les inspections pédagogiques pour garantir une couverture à 100% des programmes officiels.',
    categoryId: 'cat-gov',
    partnershipType: 'Government',
    startDate: '2024-01-15',
    displayStatus: 'active',
    featured: true,
    displayOrder: 1,
    contactEmail: 'partnerships@minesec.gov.cm',
    socialLinks: {
      website: 'https://minesec.gov.cm',
      facebook: 'https://facebook.com/minesec.cm'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-gceboard',
    nameEn: 'Cameroon GCE Board (Buea)',
    nameFr: 'Office du GCE Cameroun (Buea)',
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    shortDescEn: 'Strategic partner for past examination paper digitization and structured marking guides.',
    shortDescFr: 'Partenaire stratégique pour la numérisation des épreuves et corrections type du GCE.',
    fullDescEn: 'Empowering over 250,000 candidates annually with authentic past questions, paper structures (Paper 1 MCQs, Paper 2 structured, Paper 3 practicals), and examiners breakdown.',
    fullDescFr: 'Accompagnement de plus de 250 000 candidats chaque année avec des épreuves officielles et des corrigés détaillés.',
    categoryId: 'cat-edu',
    partnershipType: 'Educational',
    startDate: '2024-03-01',
    displayStatus: 'active',
    featured: true,
    displayOrder: 2,
    contactEmail: 'info@cameroongceboard.org',
    socialLinks: {
      website: 'https://cameroongceboard.org'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-orange',
    nameEn: 'Orange Digital Center & Mobile Money Cameroon',
    nameFr: 'Orange Digital Center & Mobile Money Cameroun',
    logoUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80',
    shortDescEn: 'Seamless zero-fee Mobile Money payment integration and youth digital skills sponsorship.',
    shortDescFr: 'Intégration fluide du paiement Orange Money sans frais et parrainage des compétences numériques.',
    fullDescEn: 'Providing Instant micro-subscriptions for students across Cameroon via Orange Money and sponsoring free access for underprivileged rural schools.',
    fullDescFr: 'Offre d\'abonnements instantanés pour les étudiants au Cameroun via Orange Money et soutien aux écoles rurales.',
    categoryId: 'cat-corp',
    partnershipType: 'Corporate',
    startDate: '2024-05-10',
    displayStatus: 'active',
    featured: true,
    displayOrder: 3,
    contactEmail: 'digital.center@orange.cm',
    socialLinks: {
      website: 'https://orange.cm',
      linkedin: 'https://linkedin.com/company/orange-cm'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-mtn',
    nameEn: 'MTN Foundation Cameroon',
    nameFr: 'Fondation MTN Cameroun',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    shortDescEn: 'Sponsoring data-free zero-rating access for Edulpha practice drills across Cameroon.',
    shortDescFr: 'Sponsor d\'accès gratuit sans consommation de données mobile pour les révisions Edulpha.',
    fullDescEn: 'MTN MoMo Cameroon powers automated subscription processing and sponsors zero-rated network bandwidth for mobile exam prep in remote regions.',
    fullDescFr: 'MTN MoMo Cameroun facilite le traitement automatique des abonnements et prend en charge la bande passante.',
    categoryId: 'cat-corp',
    partnershipType: 'Corporate',
    startDate: '2024-06-01',
    displayStatus: 'active',
    featured: true,
    displayOrder: 4,
    contactEmail: 'foundation@mtn.cm',
    socialLinks: {
      website: 'https://mtn.cm'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-unesco',
    nameEn: 'UNESCO Regional Bureau for Central Africa',
    nameFr: 'Bureau Régional de l\'UNESCO pour l\'Afrique Centrale',
    logoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    shortDescEn: 'Global advocacy partner supporting bilingual inclusive education and STEM equity for girls.',
    shortDescFr: 'Partenaire mondial pour l\'éducation bilingue inclusive et la promotion des filles en STEM.',
    fullDescEn: 'Co-developing AI-powered adaptive tutoring models to reduce student dropout rates and improve pass rates in STEM subjects across CEMAC countries.',
    fullDescFr: 'Développement conjoint de tuteurs IA adaptés pour réduire les taux d\'abandon et améliorer le taux de réussite.',
    categoryId: 'cat-comm',
    partnershipType: 'Sponsorship',
    startDate: '2024-08-20',
    displayStatus: 'active',
    featured: true,
    displayOrder: 5,
    contactEmail: 'yaounde@unesco.org',
    socialLinks: {
      website: 'https://unesco.org',
      twitter: 'https://twitter.com/unesco'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-googlecloud',
    nameEn: 'Google for Startups & Cloud AI Alliance',
    nameFr: 'Google pour Startups & Alliance Cloud IA',
    logoUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    shortDescEn: 'Powering Edulpha\'s Edulpha AI grading engine and scalable cloud infrastructure.',
    shortDescFr: 'Alimente le moteur de correction Edulpha AI et l\'infrastructure cloud d\'Edulpha.',
    fullDescEn: 'Leveraging cutting-edge Edulpha AI models for instant step-by-step problem solving in Mathematics, Physics, Chemistry, and French Essay evaluation.',
    fullDescFr: 'Utilisation des modèles Edulpha AI de pointe pour la résolution instantanée de problèmes pas à pas.',
    categoryId: 'cat-tech',
    partnershipType: 'Technology',
    startDate: '2024-02-01',
    displayStatus: 'active',
    featured: true,
    displayOrder: 6,
    contactEmail: 'cloud-support@google.com',
    socialLinks: {
      website: 'https://cloud.google.com'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper for safe localStorage writes
function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`localStorage.setItem failed for key "${key}" (Quota exceeded or restricted):`, err);
  }
}

// Helper to load/save partners
export class PartnerService {
  private static partnersCache: Partner[] | null = null;
  private static categoriesCache: PartnerCategory[] | null = null;

  // Get categories
  static async getCategories(): Promise<PartnerCategory[]> {
    if (this.categoriesCache) return this.categoriesCache;

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'partner_categories'));
        if (!snap.empty) {
          const categories: PartnerCategory[] = [];
          snap.forEach(d => categories.push(d.data() as PartnerCategory));
          categories.sort((a, b) => a.displayOrder - b.displayOrder);
          this.categoriesCache = categories;
          return categories;
        }
      }
    } catch (e) {
      console.warn('Firestore categories read error, using local fallback:', e);
    }

    const localStr = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (localStr) {
      try {
        const parsed = JSON.parse(localStr);
        this.categoriesCache = parsed;
        return parsed;
      } catch (err) {
        console.error('Error parsing local categories:', err);
      }
    }

    // Default
    safeSetLocalStorage(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    this.categoriesCache = DEFAULT_CATEGORIES;
    return DEFAULT_CATEGORIES;
  }

  // Save/Update Category
  static async saveCategory(category: PartnerCategory): Promise<PartnerCategory> {
    const categories = await this.getCategories();
    const idx = categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      categories[idx] = category;
    } else {
      categories.push(category);
    }

    categories.sort((a, b) => a.displayOrder - b.displayOrder);
    safeSetLocalStorage(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    this.categoriesCache = categories;

    if (db) {
      try {
        await setDoc(doc(db, 'partner_categories', category.id), category);
      } catch (e) {
        console.warn('Firestore save category error:', e);
      }
    }

    return category;
  }

  // Delete Category
  static async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const updated = categories.filter(c => c.id !== id);
    safeSetLocalStorage(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    this.categoriesCache = updated;

    if (db) {
      try {
        await deleteDoc(doc(db, 'partner_categories', id));
      } catch (e) {
        console.warn('Firestore delete category error:', e);
      }
    }
  }

  // Get Partners (Filtered by status or active only for landing page)
  static async getPartners(activeOnly: boolean = false): Promise<Partner[]> {
    let list: Partner[] = [];

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'partners'));
        if (!snap.empty) {
          const items: Partner[] = [];
          snap.forEach(d => items.push(d.data() as Partner));
          items.sort((a, b) => a.displayOrder - b.displayOrder);
          list = items;
        }
      }
    } catch (e) {
      console.warn('Firestore partners read error, using local fallback:', e);
    }

    if (list.length === 0) {
      const localStr = localStorage.getItem(STORAGE_KEY_PARTNERS);
      if (localStr) {
        try {
          list = JSON.parse(localStr);
        } catch (err) {
          console.error('Error parsing local partners:', err);
        }
      }
    }

    if (list.length === 0) {
      list = DEFAULT_PARTNERS;
      safeSetLocalStorage(STORAGE_KEY_PARTNERS, JSON.stringify(DEFAULT_PARTNERS));
    }

    this.partnersCache = list;

    if (activeOnly) {
      return list.filter(p => p.displayStatus === 'active').sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // Save or Update Partner
  static async savePartner(partner: Partner): Promise<Partner> {
    const list = await this.getPartners(false);
    partner.updatedAt = new Date().toISOString();
    
    const idx = list.findIndex(p => p.id === partner.id);
    if (idx >= 0) {
      list[idx] = partner;
    } else {
      partner.createdAt = partner.createdAt || new Date().toISOString();
      list.push(partner);
    }

    list.sort((a, b) => a.displayOrder - b.displayOrder);
    safeSetLocalStorage(STORAGE_KEY_PARTNERS, JSON.stringify(list));
    this.partnersCache = list;

    if (db) {
      try {
        await setDoc(doc(db, 'partners', partner.id), partner);
      } catch (e) {
        console.warn('Firestore save partner error:', e);
      }
    }

    return partner;
  }

  // Delete Partner
  static async deletePartner(id: string): Promise<void> {
    const list = await this.getPartners(false);
    const updated = list.filter(p => p.id !== id);
    safeSetLocalStorage(STORAGE_KEY_PARTNERS, JSON.stringify(updated));
    this.partnersCache = updated;

    if (db) {
      try {
        await deleteDoc(doc(db, 'partners', id));
      } catch (e) {
        console.warn('Firestore delete partner error:', e);
      }
    }
  }

  // Toggle status
  static async togglePartnerStatus(id: string): Promise<Partner | null> {
    const list = await this.getPartners(false);
    const partner = list.find(p => p.id === id);
    if (!partner) return null;

    partner.displayStatus = partner.displayStatus === 'active' ? 'inactive' : 'active';
    return await this.savePartner(partner);
  }

  // Toggle featured
  static async togglePartnerFeatured(id: string): Promise<Partner | null> {
    const list = await this.getPartners(false);
    const partner = list.find(p => p.id === id);
    if (!partner) return null;

    partner.featured = !partner.featured;
    return await this.savePartner(partner);
  }

  // Reorder Partners
  static async reorderPartners(orderedIds: string[]): Promise<Partner[]> {
    const list = await this.getPartners(false);
    orderedIds.forEach((id, index) => {
      const p = list.find(item => item.id === id);
      if (p) {
        p.displayOrder = index + 1;
      }
    });

    list.sort((a, b) => a.displayOrder - b.displayOrder);
    safeSetLocalStorage(STORAGE_KEY_PARTNERS, JSON.stringify(list));
    this.partnersCache = list;

    if (db) {
      try {
        await Promise.all(list.map(p => setDoc(doc(db, 'partners', p.id), p)));
      } catch (e) {
        console.warn('Firestore reorder partners error:', e);
      }
    }

    return list;
  }
}
