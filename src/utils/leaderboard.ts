import { collection, query, where, getDocs, getDoc, writeBatch, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DrillSubmission, WeeklyLeaderboard, UserProfile } from '../types';
import { getWeekNumber, getCurrentWeekRange } from './dateUtils';

export async function calculateWeeklyLeaderboard() {
  try {
    const { start, end } = getCurrentWeekRange();
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    // 1. Fetch all submissions for the current week
    const submissionsQuery = query(
      collection(db, 'drill_submissions'),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end))
    );
    
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = submissionsSnapshot.docs.map(doc => doc.data() as DrillSubmission);

    if (submissions.length === 0) return [];

    // 2. Group by userId and sum scores
    const userScores: Record<string, number> = {};
    submissions.forEach(sub => {
      if (!userScores[sub.userId]) {
        userScores[sub.userId] = 0;
      }
      userScores[sub.userId] += sub.score || 0;
    });

    // 3. Fetch user names for these users
    const userIds = Object.keys(userScores);
    const userProfiles: Record<string, string> = {};
    
    // Firestore 'in' query limit is 10, so we might need to chunk or fetch individually
    // For simplicity in this app, we'll fetch individually or in chunks if needed
    // But since this is a small-scale app, we'll fetch what we can
    for (const userId of userIds) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          userProfiles[userId] = userData.name || userData.firstName || 'Student';
        }
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err);
      }
    }

    // 4. Sort and assign positions
    const sortedLeaderboard = Object.entries(userScores)
      .map(([userId, totalScore]) => ({
        userId,
        userName: userProfiles[userId] || 'Student',
        totalScore,
        weekNumber,
        year
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // 5. Save to Firestore
    const batch = writeBatch(db);
    
    // First, clear existing leaderboard for this week (optional, or just overwrite)
    // Actually, it's better to overwrite or use specific IDs
    
    sortedLeaderboard.forEach((entry, index) => {
      const position = index + 1;
      const leaderboardId = `${year}-W${weekNumber}-${entry.userId}`;
      const leaderboardRef = doc(db, 'weekly_leaderboard', leaderboardId);
      
      batch.set(leaderboardRef, {
        ...entry,
        position,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    return sortedLeaderboard;
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    throw error;
  }
}
