import { Testimonial } from '../types/testimonial';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY_TESTIMONIALS = 'edulpha_testimonials_v2';

const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    authorName: 'Ngu Benedict',
    roleEn: 'A-Level Student (Grade Boosted: 11/25 to 24/25)',
    roleFr: 'Élève en Terminale (Note boostée: 11/25 à 24/25)',
    schoolOrOrg: 'GBHS Bamenda',
    subsystem: 'General',
    level: 'Advanced Level',
    country: 'Cameroon',
    region: 'North West',
    subject: 'Physics & Pure Maths',
    quoteEn: 'Edulpha AI explained complex electromagnetic wave equations step-by-step in plain Cameroonian English. I went from failing Physics mocks to scoring 5 A1s in my GCE A-Levels!',
    quoteFr: 'L\'IA Edulpha m\'a expliqué les équations d\'ondes électromagnétiques complexes étape par étape. Je suis passé d\'un échec aux examens blancs à 5 A1 au GCE A-Level !',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    approvalStatus: 'approved',
    isFeatured: true,
    displayStatus: 'active',
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    authorName: 'Marie-Claire Mbida',
    roleEn: 'Baccalauréat C Top Candidate',
    roleFr: 'Majore au Baccalauréat C',
    schoolOrOrg: 'Lycée Général Leclerc, Yaoundé',
    subsystem: 'General',
    level: 'Baccalauréat',
    country: 'Cameroon',
    region: 'Centre',
    subject: 'Mathématiques & Chimie',
    quoteEn: 'The virtual laboratory simulations allowed me to practice titrations and organic synthesis anytime on my phone without needing a physical lab!',
    quoteFr: 'Les simulations de laboratoire virtuel m\'ont permis de m\'entraîner aux dosages et synthèses organiques sur mon téléphone sans laboratoire physique !',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    approvalStatus: 'approved',
    isFeatured: true,
    displayStatus: 'active',
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-3',
    authorName: 'Tchinda Joseph',
    roleEn: 'TVEE Electrical Technology Specialist',
    roleFr: 'Spécialiste Électrotechnique TVEE',
    schoolOrOrg: 'GTHS Buea',
    subsystem: 'TVEE',
    level: 'Advanced Level',
    country: 'Cameroon',
    region: 'South West',
    subject: 'Electrical Machines & Power Systems',
    quoteEn: 'Finally a platform that covers Technical and TVEE sub-systems! The schema generators and three-phase motor diagrams were exact replicas of official GCE Board practical papers.',
    quoteFr: 'Enfin une plateforme qui couvre les sous-systèmes techniques et TVEE ! Les schémas de moteurs triphasés étaient identiques aux épreuves du GCE Board.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    approvalStatus: 'approved',
    isFeatured: true,
    displayStatus: 'active',
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-4',
    authorName: 'Kwame Mensah',
    roleEn: 'WASSCE High Scorer',
    roleFr: 'Lauréat du WASSCE',
    schoolOrOrg: 'Achimota School, Accra',
    subsystem: 'General',
    level: 'Ordinary Level',
    country: 'Ghana',
    region: 'Greater Accra',
    subject: 'Core Mathematics & Chemistry',
    quoteEn: 'The offline practice mode meant I could revise past papers on the bus without using mobile data. Highly recommended for all West African students!',
    quoteFr: 'Le mode hors ligne m\'a permis de réviser les anciennes épreuves dans le bus sans consommer de données mobiles. Recommandé à tous les élèves !',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    approvalStatus: 'approved',
    isFeatured: false,
    displayStatus: 'active',
    displayOrder: 4,
    createdAt: new Date().toISOString()
  }
];

export class TestimonialService {
  private static cache: Testimonial[] | null = null;

  static async getTestimonials(approvedOnly: boolean = true): Promise<Testimonial[]> {
    let list: Testimonial[] = [];

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'testimonials'));
        if (!snap.empty) {
          const items: Testimonial[] = [];
          snap.forEach(d => items.push(d.data() as Testimonial));
          list = items;
        }
      }
    } catch (e) {
      console.warn('Firestore testimonials read error, using local fallback:', e);
    }

    if (list.length === 0) {
      const localStr = localStorage.getItem(STORAGE_KEY_TESTIMONIALS);
      if (localStr) {
        try {
          list = JSON.parse(localStr);
        } catch (err) {
          console.error('Error parsing local testimonials:', err);
        }
      } else {
        list = SEED_TESTIMONIALS;
        try {
          localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(list));
        } catch (e) {}
      }
    }

    this.cache = list;

    if (approvedOnly) {
      return list
        .filter(t => t.approvalStatus === 'approved' || (!t.approvalStatus && t.displayStatus === 'active'))
        .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  static async submitStudentTestimonial(input: Omit<Testimonial, 'id' | 'createdAt' | 'approvalStatus' | 'displayOrder'>): Promise<Testimonial> {
    const list = await this.getTestimonials(false);
    const newTestimonial: Testimonial = {
      ...input,
      id: 't-' + Date.now(),
      approvalStatus: 'pending',
      displayStatus: 'inactive',
      displayOrder: list.length + 1,
      createdAt: new Date().toISOString()
    };

    list.unshift(newTestimonial);
    try {
      localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(list));
    } catch (e) {}

    this.cache = list;

    if (db) {
      try {
        await setDoc(doc(db, 'testimonials', newTestimonial.id), newTestimonial);
      } catch (e) {
        console.warn('Firestore submit testimonial error:', e);
      }
    }

    return newTestimonial;
  }

  static async updateApprovalStatus(id: string, approvalStatus: 'approved' | 'pending' | 'rejected', isFeatured?: boolean): Promise<Testimonial | null> {
    const list = await this.getTestimonials(false);
    const item = list.find(t => t.id === id);
    if (!item) return null;

    item.approvalStatus = approvalStatus;
    item.displayStatus = approvalStatus === 'approved' ? 'active' : 'inactive';
    if (isFeatured !== undefined) item.isFeatured = isFeatured;

    return await this.saveTestimonial(item);
  }

  static async saveTestimonial(testimonial: Testimonial): Promise<Testimonial> {
    const list = await this.getTestimonials(false);
    const idx = list.findIndex(t => t.id === testimonial.id);

    if (idx >= 0) {
      list[idx] = testimonial;
    } else {
      list.push(testimonial);
    }

    list.sort((a, b) => a.displayOrder - b.displayOrder);
    try {
      localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(list));
    } catch (e) {}

    this.cache = list;

    if (db) {
      try {
        await setDoc(doc(db, 'testimonials', testimonial.id), testimonial);
      } catch (e) {
        console.warn('Firestore save testimonial error:', e);
      }
    }

    return testimonial;
  }

  static async deleteTestimonial(id: string): Promise<void> {
    const list = await this.getTestimonials(false);
    const updated = list.filter(t => t.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(updated));
    } catch (e) {}

    this.cache = updated;

    if (db) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
      } catch (e) {
        console.warn('Firestore delete testimonial error:', e);
      }
    }
  }
}

