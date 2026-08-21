import React, { useState, useEffect } from 'react';
import { 
  Copy, Share2, MessageCircle, Send, Facebook, Check, 
  Users, Award, Trophy, Shield, Zap, Sparkles, Crown, 
  TrendingUp, ArrowRight, RefreshCw, Star, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getUserReferralData, 
  getReferralCampaign, 
  getReferralLeaderboard 
} from '../services/referralService';
import { 
  ReferralRecord, 
  ReferralMilestone, 
  ReferralCampaign, 
  ReferralLeaderboardEntry 
} from '../types/referral';
import { Button, Card, Badge, cn } from './ui';
import toast from 'react-hot-toast';

interface ReferralCenterProps {
  compact?: boolean;
}

export const ReferralCenter: React.FC<ReferralCenterProps> = ({ compact = false }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({
    totalCount: 0,
    qualifiedCount: 0,
    totalPoints: 0,
    milestoneLevel: 'starter'
  });
  const [friends, setFriends] = useState<ReferralRecord[]>([]);
  const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
  const [campaign, setCampaign] = useState<ReferralCampaign | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'friends' | 'leaderboard'>('overview');

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth?ref=${referralCode}` 
    : `https://edulpha.com/auth?ref=${referralCode}`;

  const shareText = language === 'fr'
    ? `Rejoins-moi sur Edulpha ! Utilise mon code de parrainage ${referralCode} pour accéder aux sujets d'examens GCE/HND et tuteur IA.`
    : `Join me on Edulpha! Use my referral code ${referralCode} to access GCE/HND past papers & AI study tutor.`;

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);

    try {
      const data = await getUserReferralData(user.uid);
      setReferralCode(data.referralCode);
      setStats({
        totalCount: data.totalReferralsCount,
        qualifiedCount: data.qualifiedReferralsCount,
        totalPoints: data.totalReferralPoints,
        milestoneLevel: data.referralMilestoneLevel
      });
      setFriends(data.referredFriends);
      setMilestones(data.milestones);

      const [campData, lbData] = await Promise.all([
        getReferralCampaign('50k_challenge'),
        getReferralLeaderboard(10)
      ]);
      setCampaign(campData);
      setLeaderboard(lbData);
    } catch (err) {
      console.error("Error loading referral center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success(language === 'fr' ? 'Code de parrainage copié !' : 'Referral code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success(language === 'fr' ? 'Lien de parrainage copié !' : 'Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Edulpha Learning Platform',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  // Calculate progress to next milestone
  const currentQualified = stats.qualifiedCount;
  const nextMilestone = milestones.find(m => m.requiredReferrals > currentQualified) || milestones[milestones.length - 1];
  const prevRequired = milestones.filter(m => m.requiredReferrals <= currentQualified).pop()?.requiredReferrals || 0;
  const progressPercent = Math.min(
    100,
    Math.round(((currentQualified - prevRequired) / Math.max(1, nextMilestone.requiredReferrals - prevRequired)) * 100)
  );

  if (compact) {
    return (
      <Card className="p-5 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                {language === 'fr' ? 'Inviter des Amis & Gagner' : 'Invite Friends & Earn'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'fr' ? '+500 Points par ami qualifié' : '+500 Points per qualified friend'}
              </p>
            </div>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold text-xs">
            {stats.qualifiedCount} {language === 'fr' ? 'Qualifiés' : 'Qualified'}
          </Badge>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
              {language === 'fr' ? 'Votre Code' : 'Your Code'}
            </span>
            <span className="font-mono font-extrabold text-base text-indigo-400 tracking-wider">
              {referralCode || 'EDU-XXXX'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Button
              size="sm"
              onClick={handleCopyCode}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareWhatsApp}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs px-2.5 py-1.5 rounded-lg"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Main Share Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/20 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Programme de Parrainage Edulpha' : 'Edulpha Student Referral System'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {language === 'fr' 
                ? 'Invitez des camarades, boostez votre réseau & gagnez des récompenses'
                : 'Invite Classmates, Grow Your Network & Unlock Rewards'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {language === 'fr'
                ? 'Partagez votre code unique. Chaque ami inscrit qui valide une épreuve ou un exercice vous rapporte +500 Points et vous rapproche du statut d\'Ambassadeur Officiel !'
                : 'Share your unique code. Every friend who registers and completes an exam activity earns you +500 Reward Points and moves you closer to Official Ambassador status!'}
            </p>

            {/* Live Campaign Bar */}
            {campaign && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 max-w-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-300 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>{campaign.title}</span>
                  </span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {campaign.currentStudents.toLocaleString()} / {campaign.targetStudents.toLocaleString()} {language === 'fr' ? 'Étudiants' : 'Students'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (campaign.currentStudents / campaign.targetStudents) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Referral Card Column */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                {language === 'fr' ? 'Votre Code de Parrainage' : 'Your Referral Code'}
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xl sm:text-2xl font-black text-indigo-400 tracking-wider flex items-center justify-between">
                  <span>{referralCode || 'EDU-XXXX'}</span>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] uppercase">
                    Active
                  </Badge>
                </div>
                <Button
                  onClick={handleCopyCode}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-3 rounded-xl h-auto flex items-center space-x-1.5 shrink-0"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xs sm:text-sm">{copiedCode ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                {language === 'fr' ? 'Votre Lien Direct' : 'Your Direct Share Link'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none truncate"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs px-3 py-2 rounded-xl shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-2">
                {language === 'fr' ? 'Partager via :' : 'Share via:'}
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-all"
                  title="Telegram"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShareFacebook}
                  className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-all"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{language === 'fr' ? 'Amis Invités' : 'Friends Invited'}</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalCount}
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'fr' ? 'Comptes créés avec votre code' : 'Registered with your code'}
          </p>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{language === 'fr' ? 'Parrainages Qualifiés' : 'Qualified Referrals'}</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.qualifiedCount}
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'fr' ? 'Ont complété un examen/drill' : 'Completed an exam or drill'}
          </p>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{language === 'fr' ? 'Points Gagnés' : 'Points Earned'}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {stats.totalPoints.toLocaleString()} <span className="text-xs font-bold text-slate-400">Pts</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'fr' ? 'Cumul des bonus de parrainage' : 'Total referral reward bonus'}
          </p>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{language === 'fr' ? 'Niveau Actuel' : 'Current Tier'}</span>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white capitalize flex items-center space-x-1.5">
            <span>{stats.milestoneLevel}</span>
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 text-[10px]">
              Tier
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400">
            {nextMilestone ? `${nextMilestone.requiredReferrals - currentQualified} ${language === 'fr' ? 'de plus pour' : 'more for'} ${nextMilestone.name}` : 'Max Tier'}
          </p>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5",
            activeTab === 'overview'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Aperçu & Prochaine Étape' : 'Overview & Next Milestone'}</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5",
            activeTab === 'milestones'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Niveaux & Badges' : 'Milestones & Badges'}</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5",
            activeTab === 'friends'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Mes Amis Parrainés' : 'My Referred Friends'} ({friends.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5",
            activeTab === 'leaderboard'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Classement Parrains' : 'Top Referrers Leaderboard'}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Next Milestone Card */}
          <Card className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {language === 'fr' ? 'Prochaine Étape à Débloquer' : 'Next Milestone Goal'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {nextMilestone?.name}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.qualifiedCount} / {nextMilestone?.requiredReferrals} {language === 'fr' ? 'Amis Qualifiés' : 'Qualified Friends'}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                🎁 {language === 'fr' ? 'Récompense de ce niveau :' : 'Milestone Reward:'}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'fr' ? nextMilestone?.unlockedMessageFr : nextMilestone?.unlockedMessage}
              </p>
            </div>
          </Card>

          {/* Qualification Rules Box */}
          <Card className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
              <Info className="w-5 h-5 text-indigo-500" />
              <h4>{language === 'fr' ? 'Comment valider un parrainage ?' : 'How Referrals Get Qualified'}</h4>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>
                  {language === 'fr'
                    ? 'Partagez votre lien ou votre code lors de la création de compte.'
                    : 'Share your link or code during account registration.'}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>
                  {language === 'fr'
                    ? 'Votre ami s\'inscrit et complète ses informations de classe/matière.'
                    : 'Your friend signs up and sets up their subject/class preferences.'}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>
                  {language === 'fr'
                    ? 'Dès qu\'il effectue un Exercice Quotidien (Daily Drill), un Test de Diagnostic ou une Session d\'Entraînement, le parrainage devient Qualifié !'
                    : 'Once they complete a Daily Drill, Diagnostic Test, or Practice Session, the referral automatically qualifies!'}
                </span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => {
            const isUnlocked = stats.qualifiedCount >= m.requiredReferrals;
            return (
              <Card 
                key={m.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all space-y-3",
                  isUnlocked 
                    ? "bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 border-emerald-500/30 dark:bg-slate-900" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                      isUnlocked ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {m.tier === 'elite' ? '👑' : m.tier === 'ambassador' ? '🌟' : '🏆'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {language === 'fr' ? m.nameFr : m.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {m.requiredReferrals} {language === 'fr' ? 'amis qualifiés requis' : 'qualified friends required'}
                      </span>
                    </div>
                  </div>

                  <Badge className={cn(
                    "text-[10px] font-bold uppercase",
                    isUnlocked 
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}>
                    {isUnlocked ? (language === 'fr' ? 'Débloqué' : 'Unlocked') : (language === 'fr' ? 'Verrouillé' : 'Locked')}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'fr' ? m.unlockedMessageFr : m.unlockedMessage}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{language === 'fr' ? 'Récompense' : 'Reward'}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{m.rewardValue}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'friends' && (
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {language === 'fr' ? 'Liste de Vos Filleuls' : 'Referred Friends List'}
            </h3>
            <Badge variant="neutral" className="text-xs">
              {friends.length} {language === 'fr' ? 'Inscrits' : 'Total'}
            </Badge>
          </div>

          {friends.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {language === 'fr' ? 'Aucun ami parrainé pour le moment.' : 'No referred friends yet.'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'fr'
                  ? 'Partagez votre code avec vos camarades de classe pour figurer au classement et gagner des points !'
                  : 'Share your code with classmates to get on the leaderboard and earn reward points!'}
              </p>
              <Button onClick={handleCopyLink} size="sm" className="bg-indigo-600 text-white rounded-xl">
                {language === 'fr' ? 'Copier le Lien de Parrainage' : 'Copy Referral Link'}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-3">{language === 'fr' ? 'Nom' : 'Name'}</th>
                    <th className="py-3 px-3">{language === 'fr' ? 'Date d\'Inscription' : 'Joined Date'}</th>
                    <th className="py-3 px-3">{language === 'fr' ? 'Statut' : 'Status'}</th>
                    <th className="py-3 px-3">{language === 'fr' ? 'Activité de Qualification' : 'Qualification Activity'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {friends.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {f.referredUserName || 'Student'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {new Date(f.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        {f.status === 'qualified' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                            {language === 'fr' ? 'Qualifié (+500 Pts)' : 'Qualified (+500 Pts)'}
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-slate-500 text-[10px]">
                            {language === 'fr' ? 'En Attente' : 'Registered (Pending)'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {f.qualificationActivity || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'leaderboard' && (
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {language === 'fr' ? 'Meilleurs Parrains du Cameroun' : 'Top Referrers in Cameroon'}
              </h3>
            </div>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
              National Leaderboard
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-3 w-12">#</th>
                  <th className="py-3 px-3">{language === 'fr' ? 'Étudiant' : 'Student'}</th>
                  <th className="py-3 px-3">{language === 'fr' ? 'Établissement' : 'School'}</th>
                  <th className="py-3 px-3">{language === 'fr' ? 'Amis Qualifiés' : 'Qualified Friends'}</th>
                  <th className="py-3 px-3">{language === 'fr' ? 'Points Total' : 'Total Points'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaderboard.map((lb) => (
                  <tr key={lb.userId} className={cn(
                    "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors",
                    lb.userId === user?.uid && "bg-indigo-50/50 dark:bg-indigo-950/30"
                  )}>
                    <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                      {lb.rank === 1 ? '🥇' : lb.rank === 2 ? '🥈' : lb.rank === 3 ? '🥉' : lb.rank}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{lb.userName}</span>
                      {lb.userId === user?.uid && (
                        <Badge className="bg-indigo-600 text-white text-[9px] px-1.5 py-0">You</Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {lb.school}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {lb.qualifiedCount}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {lb.totalPoints.toLocaleString()} Pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
