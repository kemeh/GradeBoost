import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, limit, increment, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { 
  ReferralRecord, ReferralMilestone, ReferralCampaign, 
  UserReferralStats, ReferralLeaderboardEntry, AdminReferralMetrics 
} from '../types/referral';
import { notificationService } from './notificationService';
import { saveAmbassadorProfile } from './ambassadorService';

const REFERRALS_COLLECTION = 'referrals';
const CAMPAIGNS_COLLECTION = 'referral_campaigns';
const MILESTONES_COLLECTION = 'referral_milestones';
const USER_STATS_COLLECTION = 'user_referral_stats';

// Standard Referral Milestones
export const DEFAULT_REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    id: 'm1_starter',
    name: 'Starter Referrer',
    nameFr: 'Parrain Débutant',
    requiredReferrals: 3,
    rewardType: 'points',
    rewardValue: 500,
    badgeIcon: 'Zap',
    unlockedMessage: 'You invited 3 active study buddies! +500 Bonus Points awarded.',
    unlockedMessageFr: 'Vous avez invité 3 camarades actifs ! +500 points bonus attribués.',
    tier: 'starter'
  },
  {
    id: 'm2_bronze',
    name: 'Bronze Ambassador',
    nameFr: 'Ambassadeur Bronze',
    requiredReferrals: 5,
    rewardType: 'badge',
    rewardValue: 'Bronze Referrer Badge + 1,000 Pts',
    badgeIcon: 'Award',
    unlockedMessage: 'Bronze Tier Achieved! Earned Bronze Referrer Badge & 1,000 Points.',
    unlockedMessageFr: 'Niveau Bronze Atteint ! Badge Parrain Bronze & 1 000 Points gagnés.',
    tier: 'bronze'
  },
  {
    id: 'm3_silver',
    name: 'Silver Growth Leader',
    nameFr: 'Leader Argent',
    requiredReferrals: 10,
    rewardType: 'badge',
    rewardValue: 'Silver Badge + 2,500 Pts',
    badgeIcon: 'Shield',
    unlockedMessage: 'Silver Tier Achieved! 10 active friends recruited. Earned 2,500 Points.',
    unlockedMessageFr: 'Niveau Argent Atteint ! 10 amis actifs recrutés. 2 500 Points gagnés.',
    tier: 'silver'
  },
  {
    id: 'm4_gold',
    name: 'Gold Champion',
    nameFr: 'Champion Or',
    requiredReferrals: 25,
    rewardType: 'badge',
    rewardValue: 'Gold Badge + 5,000 Pts',
    badgeIcon: 'Trophy',
    unlockedMessage: 'Gold Champion unlocked! You brought 25 students to Edulpha. +5,000 Points!',
    unlockedMessageFr: 'Champion Or débloqué ! Vous avez amené 25 étudiants sur Edulpha. +5 000 Points !',
    tier: 'gold'
  },
  {
    id: 'm5_ambassador',
    name: 'Official Student Ambassador',
    nameFr: 'Ambassadeur Étudiant Officiel',
    requiredReferrals: 50,
    rewardType: 'ambassador_unlock',
    rewardValue: 'Official Ambassador Verification + 10,000 Pts',
    badgeIcon: 'Sparkles',
    unlockedMessage: 'You unlocked Official Edulpha Student Ambassador Eligibility!',
    unlockedMessageFr: 'Vous avez débloqué l\'éligibilité au statut d\'Ambassadeur Officiel Edulpha !',
    tier: 'ambassador'
  },
  {
    id: 'm6_elite',
    name: 'National Elite Leader',
    nameFr: 'Leader National Élite',
    requiredReferrals: 100,
    rewardType: 'badge',
    rewardValue: 'Elite Gold Trophy + 25,000 Pts + Special Recognition',
    badgeIcon: 'Crown',
    unlockedMessage: '100 Qualified Students! You are a National Growth Legend on Edulpha.',
    unlockedMessageFr: '100 Étudiants Qualifiés ! Vous êtes une légende nationale de croissance sur Edulpha.',
    tier: 'elite'
  }
];

// Default 50K Student Growth Challenge Campaign
export const DEFAULT_CAMPAIGN_50K: ReferralCampaign = {
  id: '50k_challenge',
  title: '50,000 Student Growth Challenge',
  titleFr: 'Challenge de Croissance 50 000 Étudiants',
  targetStudents: 50000,
  currentStudents: 14250,
  status: 'active',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  description: 'Join Cameroon’s largest student peer network! Share your referral code with classmates and unlock study rewards.',
  descriptionFr: 'Rejoignez le plus grand réseau étudiant du Cameroun ! Partagez votre code avec vos camarades et débloquez des récompenses.',
  bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200'
};

/**
 * Generate a unique, clean referral code for a user (e.g. "EDU7K29X")
 */
export function generateReferralCode(uid: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = '';
  for (let i = 0; i < 5; i++) {
    const charIndex = Math.floor(Math.random() * chars.length);
    hash += chars[charIndex];
  }
  return `EDU-${hash}`;
}

/**
 * Ensure user has a referral code in Firestore and return it
 */
export async function getOrCreateReferralCode(user: UserProfile): Promise<string> {
  if (!user || !user.uid) return '';

  // 1. If profile already has referralCode
  if ((user as any).referralCode) {
    return (user as any).referralCode;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.referralCode) {
        return data.referralCode;
      }
    }

    // 2. Generate new code and persist to users/{uid}
    const newCode = generateReferralCode(user.uid);
    await updateDoc(userRef, {
      referralCode: newCode,
      updatedAt: new Date().toISOString()
    }).catch(async () => {
      await setDoc(userRef, { referralCode: newCode }, { merge: true });
    });

    // 3. Initialize user_referral_stats record
    const statsRef = doc(db, USER_STATS_COLLECTION, user.uid);
    await setDoc(statsRef, {
      userId: user.uid,
      referralCode: newCode,
      totalReferralsCount: 0,
      qualifiedReferralsCount: 0,
      totalReferralPoints: 0,
      referralMilestoneLevel: 'starter',
      unlockedMilestoneIds: [],
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(() => {});

    return newCode;
  } catch (err) {
    console.warn("Failed to generate/save referral code:", err);
    return `EDU-${user.uid.substring(0, 5).toUpperCase()}`;
  }
}

/**
 * Backfill referral codes for all existing users who lack one
 */
export async function backfillExistingUsersReferralCodes(): Promise<number> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    let updatedCount = 0;

    for (const docSnap of usersSnap.docs) {
      const uData = docSnap.data();
      if (!uData.referralCode) {
        const code = generateReferralCode(docSnap.id);
        await updateDoc(doc(db, 'users', docSnap.id), {
          referralCode: code
        }).catch(() => {});

        await setDoc(doc(db, USER_STATS_COLLECTION, docSnap.id), {
          userId: docSnap.id,
          referralCode: code,
          totalReferralsCount: uData.totalReferralsCount || 0,
          qualifiedReferralsCount: uData.qualifiedReferralsCount || 0,
          totalReferralPoints: uData.totalReferralPoints || 0,
          referralMilestoneLevel: 'starter',
          unlockedMilestoneIds: [],
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        updatedCount++;
      }
    }
    return updatedCount;
  } catch (err) {
    console.error("Backfill referral codes error:", err);
    return 0;
  }
}

/**
 * Record a referral when a new student registers using a referral code
 */
export async function trackReferralOnRegistration(
  referredUser: { uid: string; name?: string; email?: string; phone?: string },
  rawReferrerCode: string
): Promise<{ success: boolean; message: string; referrerName?: string }> {
  if (!rawReferrerCode || !referredUser?.uid) {
    return { success: false, message: 'Missing referral code or user ID' };
  }

  const cleanCode = rawReferrerCode.trim().toUpperCase();

  try {
    // 1. Find referrer by referralCode
    const q = query(collection(db, 'users'), where('referralCode', '==', cleanCode));
    const referrerSnap = await getDocs(q);

    if (referrerSnap.empty) {
      return { success: false, message: 'Invalid referral code' };
    }

    const referrerDoc = referrerSnap.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data();

    // 2. Anti-fraud check: Cannot refer self
    if (referrerId === referredUser.uid) {
      return { success: false, message: 'You cannot refer yourself' };
    }

    // 3. Check if referral record already exists for this referred user
    const existingQ = query(
      collection(db, REFERRALS_COLLECTION), 
      where('referredUserId', '==', referredUser.uid)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      return { success: false, message: 'Referral already recorded for this user' };
    }

    // 4. Save Referral Record
    const referralId = `ref_${Date.now()}_${referredUser.uid.slice(0, 6)}`;
    const referralDoc: ReferralRecord = {
      id: referralId,
      referrerId,
      referrerCode: cleanCode,
      referrerName: referrerData.name || 'Edulpha Student',
      referredUserId: referredUser.uid,
      referredUserName: referredUser.name || 'New Student',
      referredUserEmail: referredUser.email || '',
      referredUserPhone: referredUser.phone || '',
      status: 'registered',
      registeredAt: new Date().toISOString(),
      rewardPoints: 0
    };

    await setDoc(doc(db, REFERRALS_COLLECTION, referralId), referralDoc);

    // 5. Update referred user doc to record referrer
    await updateDoc(doc(db, 'users', referredUser.uid), {
      referredByCode: cleanCode,
      referredById: referrerId
    }).catch(() => {});

    // 6. Update referrer total referrals count
    await updateDoc(doc(db, 'users', referrerId), {
      totalReferralsCount: increment(1)
    }).catch(() => {});

    await updateDoc(doc(db, USER_STATS_COLLECTION, referrerId), {
      totalReferralsCount: increment(1)
    }).catch(async () => {
      await setDoc(doc(db, USER_STATS_COLLECTION, referrerId), {
        userId: referrerId,
        referralCode: cleanCode,
        totalReferralsCount: 1,
        qualifiedReferralsCount: 0,
        totalReferralPoints: 0,
        referralMilestoneLevel: 'starter'
      }, { merge: true });
    });

    // 7. Send in-app notification to referrer
    notificationService.sendNotification({
      userId: referrerId,
      type: 'general_announcement',
      category: 'platform_updates',
      title: '🎉 New Friend Joined Edulpha!',
      titleFr: '🎉 Un nouvel ami a rejoint Edulpha !',
      message: `${referredUser.name || 'A student'} registered using your referral code (${cleanCode})! Encourage them to take a quiz or daily drill to qualify your reward.`,
      messageFr: `${referredUser.name || 'Un étudiant'} s'est inscrit avec votre code de parrainage (${cleanCode}) ! Encouragez-le à faire un test pour qualifier votre récompense.`,
      priority: 'high',
      channel: 'in_app'
    });

    return { 
      success: true, 
      message: 'Referral recorded successfully', 
      referrerName: referrerData.name 
    };
  } catch (err: any) {
    console.error("Error tracking referral registration:", err);
    return { success: false, message: err.message || 'Failed to record referral' };
  }
}

/**
 * Triggered when a referred student performs a meaningful activity (Daily Drill, Practice, Diagnostic, Quiz).
 * Qualifies the referral and awards points/milestones to the referrer.
 */
export async function checkAndQualifyReferral(
  referredUserId: string, 
  activityName: string = 'Completed Exam Activity'
): Promise<boolean> {
  if (!referredUserId) return false;

  try {
    // 1. Query for pending ('registered') referral record for this referred user
    const q = query(
      collection(db, REFERRALS_COLLECTION),
      where('referredUserId', '==', referredUserId),
      where('status', '==', 'registered')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return false; // No pending referral found (or already qualified)
    }

    const refDoc = snap.docs[0];
    const referralData = refDoc.data() as ReferralRecord;
    const referrerId = referralData.referrerId;
    const rewardPointsAmount = 500; // Base reward points per qualified referral

    // 2. Mark referral as 'qualified'
    await updateDoc(doc(db, REFERRALS_COLLECTION, refDoc.id), {
      status: 'qualified',
      qualifiedAt: new Date().toISOString(),
      qualificationActivity: activityName,
      rewardPoints: rewardPointsAmount
    });

    // 3. Award points & increment qualified count for referrer
    const referrerUserRef = doc(db, 'users', referrerId);
    await updateDoc(referrerUserRef, {
      points: increment(rewardPointsAmount),
      qualifiedReferralsCount: increment(1),
      totalReferralPoints: increment(rewardPointsAmount)
    }).catch(() => {});

    // Update user_referral_stats
    const statsRef = doc(db, USER_STATS_COLLECTION, referrerId);
    await updateDoc(statsRef, {
      qualifiedReferralsCount: increment(1),
      totalReferralPoints: increment(rewardPointsAmount)
    }).catch(() => {});

    // 4. Fetch referrer's new qualified count
    const updatedReferrerSnap = await getDoc(referrerUserRef);
    const updatedReferrerData = updatedReferrerSnap.data() || {};
    const newQualifiedCount = (updatedReferrerData.qualifiedReferralsCount || 0);

    // 5. Evaluate Milestones
    await evaluateReferralMilestones(referrerId, newQualifiedCount, updatedReferrerData);

    // 6. Notify Referrer
    notificationService.sendNotification({
      userId: referrerId,
      type: 'general_announcement',
      category: 'academic',
      title: '🌟 Qualified Referral Bonus Unlocked! (+500 Pts)',
      titleFr: '🌟 Bonus de Parrainage Qualifié Débloqué ! (+500 Pts)',
      message: `Your referred friend ${referralData.referredUserName} completed "${activityName}". You earned +500 reward points!`,
      messageFr: `Votre ami parrainé ${referralData.referredUserName} a terminé "${activityName}". Vous avez gagné +500 points !`,
      priority: 'high',
      channel: 'in_app'
    });

    return true;
  } catch (err) {
    console.error("Error qualifying referral:", err);
    return false;
  }
}

/**
 * Check if referrer has reached any new milestone thresholds and grant rewards/badges
 */
export async function evaluateReferralMilestones(
  referrerId: string, 
  qualifiedCount: number, 
  referrerProfile: any
): Promise<void> {
  const milestones = DEFAULT_REFERRAL_MILESTONES;
  const userUnlocked: string[] = referrerProfile?.unlockedMilestoneIds || [];

  for (const m of milestones) {
    if (qualifiedCount >= m.requiredReferrals && !userUnlocked.includes(m.id)) {
      // 1. Mark milestone as unlocked
      userUnlocked.push(m.id);

      // 2. Grant rewards
      let pointsBonus = 0;
      if (m.rewardType === 'points' && typeof m.rewardValue === 'number') {
        pointsBonus = m.rewardValue;
      }

      const existingBadges: string[] = referrerProfile?.badges || [];
      if (!existingBadges.includes(m.id)) {
        existingBadges.push(m.id);
      }

      // Update user doc
      await updateDoc(doc(db, 'users', referrerId), {
        unlockedMilestoneIds: userUnlocked,
        badges: existingBadges,
        referralMilestoneLevel: m.tier,
        ...(pointsBonus > 0 ? { points: increment(pointsBonus) } : {})
      }).catch(() => {});

      // 3. Connect to Ambassador System if threshold reached (50 qualified referrals)
      if (m.tier === 'ambassador' || qualifiedCount >= 50) {
        try {
          await saveAmbassadorProfile({
            id: `amb-${referrerId}`,
            name: referrerProfile.name || 'Student Ambassador',
            photo: referrerProfile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            school: referrerProfile.school || 'Edulpha Academy',
            schoolLocation: referrerProfile.region || 'Cameroon',
            region: referrerProfile.region || 'National',
            classLevel: 'Upper Sixth',
            level: 'gold',
            bio: `Official Student Ambassador with ${qualifiedCount} active referrals.`,
            referralCode: referrerProfile.referralCode || `EDU-${referrerId.slice(0, 5)}`,
            recruitedCount: qualifiedCount,
            status: 'active',
            featured: true,
            subjects: referrerProfile.selectedSubjects || ['General Studies'],
            createdAt: new Date().toISOString()
          });
        } catch (ambErr) {
          console.warn("Auto-linking Ambassador profile error:", ambErr);
        }
      }

      // 4. Send Milestone Notification
      notificationService.sendNotification({
        userId: referrerId,
        type: 'general_announcement',
        category: 'platform_updates',
        title: `🏆 Milestone Unlocked: ${m.name}!`,
        titleFr: `🏆 Étape Débloquée : ${m.nameFr} !`,
        message: `${m.unlockedMessage} (${qualifiedCount} Active Friends)`,
        messageFr: `${m.unlockedMessageFr} (${qualifiedCount} Amis Actifs)`,
        priority: 'urgent',
        channel: 'in_app'
      });
    }
  }
}

/**
 * Get comprehensive referral data for a given user
 */
export async function getUserReferralData(userId: string): Promise<{
  referralCode: string;
  totalReferralsCount: number;
  qualifiedReferralsCount: number;
  totalReferralPoints: number;
  referralMilestoneLevel: string;
  referredFriends: ReferralRecord[];
  milestones: ReferralMilestone[];
}> {
  if (!userId) {
    return {
      referralCode: '',
      totalReferralsCount: 0,
      qualifiedReferralsCount: 0,
      totalReferralPoints: 0,
      referralMilestoneLevel: 'starter',
      referredFriends: [],
      milestones: DEFAULT_REFERRAL_MILESTONES
    };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    let userData = userSnap.exists() ? userSnap.data() : {};

    let code = userData.referralCode;
    if (!code) {
      code = await getOrCreateReferralCode({ uid: userId, ...userData } as any);
    }

    // Fetch list of referred friends
    const friendsQ = query(
      collection(db, REFERRALS_COLLECTION),
      where('referrerId', '==', userId),
      orderBy('registeredAt', 'desc'),
      limit(50)
    );

    let referredFriends: ReferralRecord[] = [];
    try {
      const friendsSnap = await getDocs(friendsQ);
      referredFriends = friendsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralRecord));
    } catch (e) {
      // Fallback query without orderBy if index is building
      const fallbackQ = query(
        collection(db, REFERRALS_COLLECTION),
        where('referrerId', '==', userId)
      );
      const friendsSnap = await getDocs(fallbackQ);
      referredFriends = friendsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralRecord));
    }

    const qualifiedCount = userData.qualifiedReferralsCount || referredFriends.filter(f => f.status === 'qualified').length;
    const totalCount = userData.totalReferralsCount || referredFriends.length;

    return {
      referralCode: code,
      totalReferralsCount: totalCount,
      qualifiedReferralsCount: qualifiedCount,
      totalReferralPoints: userData.totalReferralPoints || qualifiedCount * 500,
      referralMilestoneLevel: userData.referralMilestoneLevel || 'starter',
      referredFriends,
      milestones: DEFAULT_REFERRAL_MILESTONES
    };
  } catch (err) {
    console.error("getUserReferralData error:", err);
    return {
      referralCode: `EDU-${userId.slice(0, 5).toUpperCase()}`,
      totalReferralsCount: 0,
      qualifiedReferralsCount: 0,
      totalReferralPoints: 0,
      referralMilestoneLevel: 'starter',
      referredFriends: [],
      milestones: DEFAULT_REFERRAL_MILESTONES
    };
  }
}

/**
 * Get Referral Leaderboard entries sorted by qualified referrals
 */
export async function getReferralLeaderboard(limitCount: number = 20): Promise<ReferralLeaderboardEntry[]> {
  try {
    const usersQ = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      orderBy('qualifiedReferralsCount', 'desc'),
      limit(limitCount)
    );

    let usersSnap = await getDocs(usersQ);
    
    // Fallback if index not yet built
    if (usersSnap.empty) {
      const allUsersSnap = await getDocs(collection(db, 'users'));
      const sorted = allUsersSnap.docs
        .map(d => ({ uid: d.id, ...d.data() } as any))
        .filter(u => u.role === 'student')
        .sort((a, b) => (b.qualifiedReferralsCount || 0) - (a.qualifiedReferralsCount || 0))
        .slice(0, limitCount);

      return sorted.map((u, idx) => ({
        rank: idx + 1,
        userId: u.uid,
        userName: u.name || 'Student',
        userAvatar: u.photoURL || '',
        school: u.school || 'Edulpha Academy',
        region: u.region || 'Cameroon',
        qualifiedCount: u.qualifiedReferralsCount || 0,
        totalInvited: u.totalReferralsCount || 0,
        totalPoints: u.totalReferralPoints || (u.qualifiedReferralsCount || 0) * 500,
        milestoneLevel: u.referralMilestoneLevel || 'starter'
      }));
    }

    return usersSnap.docs.map((docSnap, idx) => {
      const u = docSnap.data();
      return {
        rank: idx + 1,
        userId: docSnap.id,
        userName: u.name || 'Student',
        userAvatar: u.photoURL || '',
        school: u.school || 'Edulpha Academy',
        region: u.region || 'Cameroon',
        qualifiedCount: u.qualifiedReferralsCount || 0,
        totalInvited: u.totalReferralsCount || 0,
        totalPoints: u.totalReferralPoints || (u.qualifiedReferralsCount || 0) * 500,
        milestoneLevel: u.referralMilestoneLevel || 'starter'
      };
    });
  } catch (err) {
    console.error("getReferralLeaderboard error:", err);
    return [];
  }
}

/**
 * Fetch active referral campaign (e.g. 50K Student Challenge)
 */
export async function getReferralCampaign(campaignId: string = '50k_challenge'): Promise<ReferralCampaign> {
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ReferralCampaign;
    }

    // Seed default campaign
    await setDoc(docRef, DEFAULT_CAMPAIGN_50K);
    return DEFAULT_CAMPAIGN_50K;
  } catch (err) {
    console.warn("getReferralCampaign error, returning default:", err);
    return DEFAULT_CAMPAIGN_50K;
  }
}

/**
 * Update campaign details in Firestore (Admin tool)
 */
export async function updateReferralCampaign(campaignData: Partial<ReferralCampaign> & { id: string }): Promise<boolean> {
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaignData.id);
    await setDoc(docRef, { ...campaignData, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error("updateReferralCampaign error:", err);
    return false;
  }
}

/**
 * Get global referral metrics for Admin Dashboard
 */
export async function getAdminReferralMetrics(): Promise<AdminReferralMetrics> {
  try {
    const referralsSnap = await getDocs(collection(db, REFERRALS_COLLECTION));
    const allRefs = referralsSnap.docs.map(d => d.data() as ReferralRecord);

    const totalReferrals = allRefs.length;
    const qualifiedReferrals = allRefs.filter(r => r.status === 'qualified').length;
    const pendingReferrals = allRefs.filter(r => r.status === 'registered').length;
    const conversionRate = totalReferrals > 0 ? Math.round((qualifiedReferrals / totalReferrals) * 100) : 0;
    const totalPointsRewarded = qualifiedReferrals * 500;

    // Calculate top referrer
    const referrerCounts: Record<string, { name: string; count: number }> = {};
    allRefs.forEach(r => {
      if (!referrerCounts[r.referrerId]) {
        referrerCounts[r.referrerId] = { name: r.referrerName || 'Student', count: 0 };
      }
      if (r.status === 'qualified') {
        referrerCounts[r.referrerId].count += 1;
      }
    });

    let topName = 'None';
    let topCount = 0;
    Object.values(referrerCounts).forEach(item => {
      if (item.count > topCount) {
        topCount = item.count;
        topName = item.name;
      }
    });

    const campaign = await getReferralCampaign('50k_challenge');
    const campaignTargetProgress = Math.min(100, Math.round((campaign.currentStudents / campaign.targetStudents) * 100));

    return {
      totalReferrals,
      qualifiedReferrals,
      pendingReferrals,
      conversionRate,
      totalPointsRewarded,
      topReferrerName: topName,
      topReferrerCount: topCount,
      campaignTargetProgress
    };
  } catch (err) {
    console.error("getAdminReferralMetrics error:", err);
    return {
      totalReferrals: 0,
      qualifiedReferrals: 0,
      pendingReferrals: 0,
      conversionRate: 0,
      totalPointsRewarded: 0,
      topReferrerName: 'N/A',
      topReferrerCount: 0,
      campaignTargetProgress: 28
    };
  }
}

