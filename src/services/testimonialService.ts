import { Testimonial } from '../types/testimonial';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const STORAGE_KEY_TESTIMONIALS = 'edulpha_testimonials_v1';

export class TestimonialService {
  private static cache: Testimonial[] | null = null;

  static async getTestimonials(activeOnly: boolean = false): Promise<Testimonial[]> {
    let list: Testimonial[] = [];

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'testimonials'));
        if (!snap.empty) {
          const items: Testimonial[] = [];
          snap.forEach(d => items.push(d.data() as Testimonial));
          items.sort((a, b) => a.displayOrder - b.displayOrder);
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
      }
    }

    this.cache = list;

    if (activeOnly) {
      return list.filter(t => t.displayStatus === 'active').sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return list.sort((a, b) => a.displayOrder - b.displayOrder);
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

  static async toggleStatus(id: string): Promise<Testimonial | null> {
    const list = await this.getTestimonials(false);
    const item = list.find(t => t.id === id);
    if (!item) return null;

    item.displayStatus = item.displayStatus === 'active' ? 'inactive' : 'active';
    return await this.saveTestimonial(item);
  }
}
