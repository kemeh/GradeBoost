import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import axios from 'axios';

export interface PlatformStats {
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  totalUsers: number;
  subjectsCount: number;
  questionsCount: number;
  partnersCount: number;
  downloadsCount: number;
  examsCount: number;
  updatedAt?: string;
}

const STATS_LOCAL_CACHE_KEY = 'edulpha_platform_stats_cache';
const STATS_CACHE_TTL_MS = 30 * 1000; // 30 seconds

export class StatsService {
  private static cachedStats: PlatformStats | null = null;
  private static lastFetchTime: number = 0;

  /**
   * Fetches real, aggregated platform statistics.
   * Priority:
   * 1. Backend REST API (/api/statistics/public)
   * 2. Firestore public configuration (system_settings/platform_stats)
   * 3. Local persisted cache
   */
  static async getRealPlatformStats(forceRefresh: boolean = false): Promise<PlatformStats> {
    const now = Date.now();
    if (!forceRefresh && this.cachedStats && (now - this.lastFetchTime < STATS_CACHE_TTL_MS)) {
      return this.cachedStats;
    }

    let stats: PlatformStats = {
      studentsCount: 0,
      teachersCount: 0,
      adminsCount: 0,
      totalUsers: 0,
      subjectsCount: 0,
      questionsCount: 0,
      partnersCount: 0,
      downloadsCount: 0,
      examsCount: 0,
      updatedAt: new Date().toISOString()
    };

    // 1. Try Backend REST API
    try {
      const response = await axios.get('/api/statistics/public', { timeout: 3500 });
      if (response.data && response.data.success) {
        const d = response.data;
        stats = {
          studentsCount: Number(d.students || 0),
          teachersCount: Number(d.teachers || 0),
          adminsCount: Number(d.admins || 0),
          totalUsers: Number(d.totalUsers || (Number(d.students || 0) + Number(d.teachers || 0) + Number(d.admins || 0))),
          subjectsCount: Number(d.subjects || 0),
          questionsCount: Number(d.questions || 0),
          partnersCount: Number(d.partners || 0),
          downloadsCount: Number(d.downloads || 0),
          examsCount: Number(d.exams || 0),
          updatedAt: d.updatedAt || new Date().toISOString()
        };

        this.cachedStats = stats;
        this.lastFetchTime = now;
        this.persistLocalCache(stats);
        return stats;
      }
    } catch (apiErr) {
      console.warn('[StatsService] Backend public API call skipped or timed out, checking Firestore fallback:', apiErr);
    }

    // 2. Fallback to Firestore system_settings/platform_stats
    try {
      if (db) {
        const statsDocRef = doc(db, 'system_settings', 'platform_stats');
        const snap = await getDoc(statsDocRef);
        if (snap.exists()) {
          const d = snap.data();
          stats = {
            studentsCount: Number(d.studentsCount ?? d.students ?? 0),
            teachersCount: Number(d.teachersCount ?? d.teachers ?? 0),
            adminsCount: Number(d.adminsCount ?? d.admins ?? 0),
            totalUsers: Number(d.totalUsers ?? (Number(d.studentsCount ?? d.students ?? 0) + Number(d.teachersCount ?? d.teachers ?? 0))),
            subjectsCount: Number(d.subjectsCount ?? d.subjects ?? 0),
            questionsCount: Number(d.questionsCount ?? d.questions ?? 0),
            partnersCount: Number(d.partnersCount ?? d.partners ?? 0),
            downloadsCount: Number(d.downloadsCount ?? d.downloads ?? 0),
            examsCount: Number(d.examsCount ?? d.exams ?? 0),
            updatedAt: d.updatedAt ? new Date(d.updatedAt.toDate ? d.updatedAt.toDate() : d.updatedAt).toISOString() : new Date().toISOString()
          };

          this.cachedStats = stats;
          this.lastFetchTime = now;
          this.persistLocalCache(stats);
          return stats;
        }
      }
    } catch (firestoreErr) {
      console.warn('[StatsService] Firestore public stats fallback failed:', firestoreErr);
    }

    // 3. Fallback to LocalStorage cache if available
    const cached = this.readLocalCache();
    if (cached) {
      this.cachedStats = cached;
      return cached;
    }

    this.cachedStats = stats;
    return stats;
  }

  /**
   * Recalculates exact counts directly from Firestore collections and synchronizes everywhere.
   * Typically invoked by administrators or during user account lifecycle events.
   */
  static async recalculateAndSyncPlatformStats(): Promise<PlatformStats> {
    let studentsCount = 0;
    let teachersCount = 0;
    let adminsCount = 0;
    let totalUsers = 0;
    let subjectsCount = 0;
    let questionsCount = 0;
    let partnersCount = 0;
    let downloadsCount = 0;
    let examsCount = 0;

    try {
      if (db) {
        // Query Collections safely
        const [usersSnap, subjectsSnap, questionsSnap, examQuestionsSnap, partnersSnap, docsSnap, examsSnap] = await Promise.all([
          getDocs(collection(db, 'users')).catch(() => null),
          getDocs(collection(db, 'subjects')).catch(() => null),
          getDocs(collection(db, 'questions')).catch(() => null),
          getDocs(collection(db, 'exam_questions')).catch(() => null),
          getDocs(query(collection(db, 'partners'), where('displayStatus', '==', 'active'))).catch(() => null),
          getDocs(collection(db, 'documents')).catch(() => null),
          getDocs(collection(db, 'question_papers')).catch(() => null)
        ]);

        if (usersSnap && !usersSnap.empty) {
          usersSnap.docs.forEach(docSnap => {
            const u = docSnap.data();
            // Skip deleted or explicitly soft-deleted users
            if (u.status === 'deleted' || u.deleted === true) return;

            const role = (u.role || 'student').toLowerCase();
            if (role === 'teacher') {
              teachersCount++;
            } else if (role === 'admin' || role === 'super_admin') {
              adminsCount++;
            } else {
              studentsCount++;
            }
          });
          totalUsers = studentsCount + teachersCount + adminsCount;
        }

        if (subjectsSnap) subjectsCount = subjectsSnap.size;
        
        const qCount1 = questionsSnap ? questionsSnap.size : 0;
        const qCount2 = examQuestionsSnap ? examQuestionsSnap.size : 0;
        questionsCount = Math.max(qCount1, qCount2, qCount1 + qCount2);

        if (partnersSnap) partnersCount = partnersSnap.size;
        if (docsSnap) downloadsCount = docsSnap.size;
        if (examsSnap) examsCount = examsSnap.size;
      }
    } catch (err) {
      console.warn('[StatsService] Error during collection aggregation:', err);
    }

    const calculatedStats: PlatformStats = {
      studentsCount,
      teachersCount,
      adminsCount,
      totalUsers,
      subjectsCount,
      questionsCount,
      partnersCount,
      downloadsCount,
      examsCount,
      updatedAt: new Date().toISOString()
    };

    // 1. Persist to Firestore system_settings/platform_stats
    try {
      if (db) {
        const statsDocRef = doc(db, 'system_settings', 'platform_stats');
        await setDoc(statsDocRef, {
          ...calculatedStats,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('[StatsService] Could not write platform_stats to Firestore:', e);
    }

    // 2. Synchronize with server cache
    try {
      await axios.post('/api/statistics/sync', calculatedStats, { timeout: 3000 });
    } catch (e) {
      console.warn('[StatsService] Server sync endpoint warning:', e);
    }

    // 3. Update memory & local storage
    this.cachedStats = calculatedStats;
    this.lastFetchTime = Date.now();
    this.persistLocalCache(calculatedStats);

    return calculatedStats;
  }

  /**
   * Records a new user registration to update live platform statistics immediately.
   */
  static async recordRegistration(role: 'student' | 'teacher' | 'admin' = 'student'): Promise<void> {
    try {
      // Optimistically update memory cache
      if (this.cachedStats) {
        if (role === 'teacher') {
          this.cachedStats.teachersCount = (this.cachedStats.teachersCount || 0) + 1;
        } else if (role === 'admin') {
          this.cachedStats.adminsCount = (this.cachedStats.adminsCount || 0) + 1;
        } else {
          this.cachedStats.studentsCount = (this.cachedStats.studentsCount || 0) + 1;
        }
        this.cachedStats.totalUsers = (this.cachedStats.studentsCount || 0) + (this.cachedStats.teachersCount || 0) + (this.cachedStats.adminsCount || 0);
        this.persistLocalCache(this.cachedStats);
      }

      // Notify Backend Server
      await axios.post('/api/statistics/record-registration', { role }, { timeout: 3000 }).catch(() => null);

      // Update Firestore system_settings/platform_stats if possible
      if (db) {
        const statsDocRef = doc(db, 'system_settings', 'platform_stats');
        const snap = await getDoc(statsDocRef).catch(() => null);
        if (snap && snap.exists()) {
          const d = snap.data();
          const currentCount = Number(role === 'teacher' ? (d.teachersCount ?? 0) : (d.studentsCount ?? 0));
          await setDoc(statsDocRef, {
            ...(role === 'teacher' ? { teachersCount: currentCount + 1 } : { studentsCount: currentCount + 1 }),
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(() => null);
        }
      }
    } catch (err) {
      console.warn('[StatsService] Failed to record registration event:', err);
    }
  }

  /**
   * Records a user deletion event to update statistics immediately.
   */
  static async recordDeletion(role: 'student' | 'teacher' | 'admin' = 'student'): Promise<void> {
    try {
      if (this.cachedStats) {
        if (role === 'teacher') {
          this.cachedStats.teachersCount = Math.max(0, (this.cachedStats.teachersCount || 0) - 1);
        } else if (role === 'admin') {
          this.cachedStats.adminsCount = Math.max(0, (this.cachedStats.adminsCount || 0) - 1);
        } else {
          this.cachedStats.studentsCount = Math.max(0, (this.cachedStats.studentsCount || 0) - 1);
        }
        this.cachedStats.totalUsers = Math.max(0, (this.cachedStats.studentsCount || 0) + (this.cachedStats.teachersCount || 0) + (this.cachedStats.adminsCount || 0));
        this.persistLocalCache(this.cachedStats);
      }

      // Notify backend server
      await axios.post('/api/statistics/record-deletion', { role }, { timeout: 3000 }).catch(() => null);
    } catch (err) {
      console.warn('[StatsService] Failed to record deletion event:', err);
    }
  }

  private static persistLocalCache(stats: PlatformStats) {
    try {
      localStorage.setItem(STATS_LOCAL_CACHE_KEY, JSON.stringify({
        stats,
        savedAt: Date.now()
      }));
    } catch (e) {}
  }

  private static readLocalCache(): PlatformStats | null {
    try {
      const raw = localStorage.getItem(STATS_LOCAL_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.stats) {
          return parsed.stats;
        }
      }
    } catch (e) {}
    return null;
  }
}
