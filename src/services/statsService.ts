import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface PlatformStats {
  studentsCount: number;
  subjectsCount: number;
  questionsCount: number;
  partnersCount: number;
  downloadsCount: number;
  examsCount: number;
}

export class StatsService {
  private static cachedStats: PlatformStats | null = null;

  static async getRealPlatformStats(): Promise<PlatformStats> {
    if (this.cachedStats) return this.cachedStats;

    let stats: PlatformStats = {
      studentsCount: 0,
      subjectsCount: 0,
      questionsCount: 0,
      partnersCount: 0,
      downloadsCount: 0,
      examsCount: 0,
    };

    try {
      if (db) {
        const [usersSnap, subjectsSnap, questionsSnap, partnersSnap, docsSnap] = await Promise.all([
          getDocs(collection(db, 'users')).catch(() => null),
          getDocs(collection(db, 'subjects')).catch(() => null),
          getDocs(collection(db, 'questions')).catch(() => null),
          getDocs(query(collection(db, 'partners'), where('displayStatus', '==', 'active'))).catch(() => null),
          getDocs(collection(db, 'documents')).catch(() => null),
        ]);

        if (usersSnap) {
          stats.studentsCount = usersSnap.docs.filter(d => {
            const data = d.data();
            return !data.role || data.role === 'student';
          }).length;
        }

        if (subjectsSnap) {
          stats.subjectsCount = subjectsSnap.size;
        }

        if (questionsSnap) {
          stats.questionsCount = questionsSnap.size;
        }

        if (partnersSnap) {
          stats.partnersCount = partnersSnap.size;
        }

        if (docsSnap) {
          stats.downloadsCount = docsSnap.size;
        }
      }
    } catch (err) {
      console.warn('Error fetching Firestore dynamic platform stats:', err);
    }

    // Check localStorage fallbacks if Firestore is empty or unpopulated
    if (stats.subjectsCount === 0) {
      try {
        const localSub = localStorage.getItem('edulpha_subjects_v1');
        if (localSub) {
          const parsed = JSON.parse(localSub);
          if (Array.isArray(parsed)) stats.subjectsCount = parsed.length;
        }
      } catch (e) {}
    }

    if (stats.partnersCount === 0) {
      try {
        const localPart = localStorage.getItem('edulpha_partners_data_v1');
        if (localPart) {
          const parsed = JSON.parse(localPart);
          if (Array.isArray(parsed)) {
            stats.partnersCount = parsed.filter((p: any) => p.displayStatus === 'active').length;
          }
        }
      } catch (e) {}
    }

    this.cachedStats = stats;
    return stats;
  }
}
