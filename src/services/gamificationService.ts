import { doc, getDoc, updateDoc, increment, serverTimestamp, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_drill', title: 'First Step', description: 'Complete your first daily drill', icon: '🎯', criteria: 'drills_completed >= 1', points: 50 },
  { id: 'streak_3', title: 'Consistent Learner', description: 'Maintain a 3-day streak', icon: '🔥', criteria: 'streak >= 3', points: 100 },
  { id: 'streak_7', title: 'Study Warrior', description: 'Maintain a 7-day streak', icon: '⚔️', criteria: 'streak >= 7', points: 250 },
  { id: 'duel_winner', title: 'Arena Champion', description: 'Win your first duel', icon: '🏆', criteria: 'duels_won >= 1', points: 150 },
  { id: 'perfect_score', title: 'Perfect Score', description: 'Get 100% on a paper', icon: '💯', criteria: 'perfect_scores >= 1', points: 500 },
];

export async function updatePoints(userId: string, points: number, reason: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    points: increment(points)
  });

  await addDoc(collection(db, 'points_history'), {
    userId,
    points,
    reason,
    timestamp: serverTimestamp()
  });
}

export async function updateStreak(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return;

  const userData = userDoc.data() as UserProfile;
  const now = new Date();
  const lastActive = userData.lastActiveDate?.toDate() || new Date(0);
  
  // Calculate difference in days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  
  const diffTime = today.getTime() - lastActiveDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    await updateDoc(userRef, {
      streak: increment(1),
      lastActiveDate: serverTimestamp()
    });
  } else if (diffDays > 1) {
    // Streak broken
    await updateDoc(userRef, {
      streak: 1,
      lastActiveDate: serverTimestamp()
    });
  } else if (diffDays === 0) {
    // Already active today, do nothing or just update timestamp
    await updateDoc(userRef, {
      lastActiveDate: serverTimestamp()
    });
  } else {
    // First time or something else
    await updateDoc(userRef, {
      streak: 1,
      lastActiveDate: serverTimestamp()
    });
  }
}

export async function checkAchievements(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return;

  const userData = userDoc.data() as UserProfile;
  const currentBadges = userData.badges || [];
  const newBadges: string[] = [];

  // 1. Check drills
  const drillsQuery = query(collection(db, 'drill_submissions'), where('userId', '==', userId));
  const drillsSnapshot = await getDocs(drillsQuery);
  const drillsCount = drillsSnapshot.size;

  if (drillsCount >= 1 && !currentBadges.includes('first_drill')) {
    newBadges.push('first_drill');
  }

  // 2. Check streak
  if (userData.streak >= 3 && !currentBadges.includes('streak_3')) {
    newBadges.push('streak_3');
  }
  if (userData.streak >= 7 && !currentBadges.includes('streak_7')) {
    newBadges.push('streak_7');
  }

  // 3. Check duels
  const duelsQuery = query(collection(db, 'duels'), where('winnerId', '==', userId));
  const duelsSnapshot = await getDocs(duelsQuery);
  if (duelsSnapshot.size >= 1 && !currentBadges.includes('duel_winner')) {
    newBadges.push('duel_winner');
  }

  if (newBadges.length > 0) {
    const updatedBadges = [...currentBadges, ...newBadges];
    await updateDoc(userRef, {
      badges: updatedBadges
    });

    // Award points for each new badge
    for (const badgeId of newBadges) {
      const achievement = ACHIEVEMENTS.find(a => a.id === badgeId);
      if (achievement?.points) {
        await updatePoints(userId, achievement.points, `Achievement: ${achievement.title}`);
      }
    }
  }

  return newBadges;
}
