export type ReferralStatus = 'registered' | 'qualified' | 'rejected';

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerCode: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail?: string;
  referredUserPhone?: string;
  status: ReferralStatus;
  qualificationActivity?: string | null;
  registeredAt: string;
  qualifiedAt?: string | null;
  rewardPoints: number;
  ipHash?: string;
}

export type MilestoneRewardType = 'points' | 'badge' | 'ambassador_unlock' | 'cash_voucher';

export interface ReferralMilestone {
  id: string;
  name: string;
  nameFr: string;
  requiredReferrals: number;
  rewardType: MilestoneRewardType;
  rewardValue: number | string;
  badgeIcon: string;
  unlockedMessage: string;
  unlockedMessageFr: string;
  tier: 'starter' | 'bronze' | 'silver' | 'gold' | 'ambassador' | 'elite';
}

export interface ReferralCampaign {
  id: string;
  title: string;
  titleFr: string;
  targetStudents: number;
  currentStudents: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  description: string;
  descriptionFr: string;
  bannerUrl?: string;
}

export interface UserReferralStats {
  userId: string;
  referralCode: string;
  referredByCode?: string | null;
  referredById?: string | null;
  totalReferralsCount: number;
  qualifiedReferralsCount: number;
  totalReferralPoints: number;
  referralMilestoneLevel: 'starter' | 'bronze' | 'silver' | 'gold' | 'ambassador' | 'elite';
  unlockedMilestoneIds: string[];
}

export interface ReferralLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  school?: string;
  region?: string;
  qualifiedCount: number;
  totalInvited: number;
  totalPoints: number;
  milestoneLevel: string;
}

export interface AdminReferralMetrics {
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  conversionRate: number; // percentage
  totalPointsRewarded: number;
  topReferrerName: string;
  topReferrerCount: number;
  campaignTargetProgress: number; // percentage
}
