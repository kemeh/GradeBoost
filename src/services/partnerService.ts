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

export const DEFAULT_PARTNERS: Partner[] = [];

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
