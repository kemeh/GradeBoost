import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Share2, Copy, Check, Download, Sparkles, Trophy, 
  Award, Zap, CheckCircle2, TrendingUp, BarChart2, 
  GraduationCap, BookOpen, Star, ShieldCheck, ExternalLink,
  MessageCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Badge, Card, cn } from './ui';
import toast from 'react-hot-toast';

export interface ShareItemData {
  type: 'progress' | 'exam_score' | 'badge';
  // Progress
  overallProgress?: number;
  completedLessons?: number;
  totalLessons?: number;
  streakDays?: number;
  predictedGrade?: string;
  accuracyRate?: number;
  xpEarned?: number;
  
  // Exam score
  examTitle?: string;
  examSubject?: string;
  scorePercentage?: number;
  totalMarks?: number;
  marksObtained?: number;
  rankText?: string;
  
  // Badge
  badgeId?: string;
  badgeTitle?: string;
  badgeDescription?: string;
  badgeIcon?: string;
  badgeTier?: 'gold' | 'silver' | 'bronze' | 'diamond';
}

export interface StudentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ShareItemData>;
}

// Available Badges for sharing
export const PRESET_BADGES = [
  {
    id: 'streak_master',
    title: '7-Day Streak Master',
    titleFr: 'Maître de la Série (7 Jours)',
    description: 'Studied 7 days in a row without missing a single lesson.',
    descriptionFr: 'Étudié 7 jours consécutifs sans manquer une seule leçon.',
    iconName: 'zap',
    tier: 'gold' as const,
    stat: '7 Days Streak',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'quiz_whiz',
    title: 'Quiz Whiz Champion',
    titleFr: 'Champion du Quiz Whiz',
    description: 'Achieved 100% score on 5 consecutive GCE topic drills.',
    descriptionFr: '100% de réussite sur 5 séries d\'exercices consécutives.',
    iconName: 'trophy',
    tier: 'diamond' as const,
    stat: '100% Accuracy',
    color: 'from-indigo-600 to-violet-600'
  },
  {
    id: 'gce_scholar',
    title: 'GCE Scholar Elite',
    titleFr: 'Élite Universitaire GCE',
    description: 'Completed 20 full GCE mock examination papers and practice drills.',
    descriptionFr: 'Complété 20 épreuves complètes d\'examens blancs du GCE.',
    iconName: 'graduation',
    tier: 'gold' as const,
    stat: '20 Mock Exams',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'practical_master',
    title: 'Virtual Lab Innovator',
    titleFr: 'Innovateur du Labo Virtuel',
    description: 'Passed all automated coding test cases in Virtual Practical Lab.',
    descriptionFr: 'Validé tous les tests de code automatisés dans le Labo Virtuel.',
    iconName: 'sparkles',
    tier: 'silver' as const,
    stat: 'Lab Certified',
    color: 'from-emerald-500 to-teal-600'
  }
];

export const StudentShareModal: React.FC<StudentShareModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  // Active Category Tab
  const [activeCategory, setActiveCategory] = useState<'progress' | 'exam_score' | 'badge'>(
    initialData?.type || 'progress'
  );

  // Editable / customizable states
  // Progress
  const [overallProgress, setOverallProgress] = useState(initialData?.overallProgress ?? 78);
  const [completedLessons, setCompletedLessons] = useState(initialData?.completedLessons ?? 18);
  const [totalLessons, setTotalLessons] = useState(initialData?.totalLessons ?? 24);
  const [streakDays, setStreakDays] = useState(initialData?.streakDays ?? 7);
  const [predictedGrade, setPredictedGrade] = useState(initialData?.predictedGrade ?? 'A');
  const [accuracyRate, setAccuracyRate] = useState(initialData?.accuracyRate ?? 82);

  // Exam Score
  const [examSubject, setExamSubject] = useState(initialData?.examSubject ?? 'Computer Science');
  const [examTitle, setExamTitle] = useState(initialData?.examTitle ?? 'GCE Advanced Level Mock Exam Paper 1');
  const [scorePercentage, setScorePercentage] = useState(initialData?.scorePercentage ?? 88);
  const [rankText, setRankText] = useState(initialData?.rankText ?? (isFr ? 'Top 5% National' : 'Top 5% Nationally'));

  // Badge
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(
    initialData?.badgeId || PRESET_BADGES[0].id
  );

  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // Sync when initialData changes
  useEffect(() => {
    if (initialData?.type) {
      setActiveCategory(initialData.type);
    }
    if (initialData?.overallProgress !== undefined) setOverallProgress(initialData.overallProgress);
    if (initialData?.completedLessons !== undefined) setCompletedLessons(initialData.completedLessons);
    if (initialData?.totalLessons !== undefined) setTotalLessons(initialData.totalLessons);
    if (initialData?.streakDays !== undefined) setStreakDays(initialData.streakDays);
    if (initialData?.predictedGrade) setPredictedGrade(initialData.predictedGrade);
    if (initialData?.accuracyRate !== undefined) setAccuracyRate(initialData.accuracyRate);
    if (initialData?.examSubject) setExamSubject(initialData.examSubject);
    if (initialData?.examTitle) setExamTitle(initialData.examTitle);
    if (initialData?.scorePercentage !== undefined) setScorePercentage(initialData.scorePercentage);
    if (initialData?.rankText) setRankText(initialData.rankText);
    if (initialData?.badgeId) setSelectedBadgeId(initialData.badgeId);
  }, [initialData]);

  if (!isOpen) return null;

  const currentBadge = PRESET_BADGES.find(b => b.id === selectedBadgeId) || PRESET_BADGES[0];

  const studentName = user?.name || user?.email?.split('@')[0] || (isFr ? 'Élève Edulpha' : 'Edulpha Scholar');
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://edulpha.com';
  const shareTargetUrl = `${appOrigin}/?ref=achievement`;

  // Dynamic share text generator
  const generateShareText = () => {
    if (activeCategory === 'progress') {
      if (isFr) {
        return `🎯 Je viens d'atteindre ${overallProgress}% de maîtrise sur Edulpha ! 📚 Série d'étude de ${streakDays} jours, Note prévue : ${predictedGrade}. Je me prépare pour le GCE avec des cours IA, examens blancs et labos virtuels. Rejoins-moi sur Edulpha ! 👉 ${shareTargetUrl}`;
      }
      return `🎯 I just reached ${overallProgress}% overall mastery on Edulpha! 📚 ${streakDays}-day study streak, Predicted Grade: ${predictedGrade}, ${completedLessons}/${totalLessons} modules completed. Preparing for GCE examinations with AI teachers, mock exams & virtual labs. Join me on Edulpha! 👉 ${shareTargetUrl}`;
    }

    if (activeCategory === 'exam_score') {
      if (isFr) {
        return `🎉 J'ai obtenu ${scorePercentage}% en ${examSubject} (${examTitle}) sur Edulpha ! (${rankText}). Préparation intensive aux examens du GCE avec tuteur IA et sujets officiels. Découvrez Edulpha ici : 👉 ${shareTargetUrl}`;
      }
      return `🎉 Scored ${scorePercentage}% in ${examSubject} (${examTitle}) on Edulpha! (${rankText}). Preparing for GCE with AI-powered revisions, past papers, and mock marking schemes. Check out Edulpha here: 👉 ${shareTargetUrl}`;
    }

    // Badge
    const badgeTitleText = isFr ? currentBadge.titleFr : currentBadge.title;
    const badgeDescText = isFr ? currentBadge.descriptionFr : currentBadge.description;
    if (isFr) {
      return `🏆 Je viens de débloquer le badge "${badgeTitleText}" sur Edulpha ! (${badgeDescText}). Améliorez vos compétences pour le GCE avec la plateforme d'apprentissage intelligente Edulpha : 👉 ${shareTargetUrl}`;
    }
    return `🏆 I just unlocked the '${badgeTitleText}' badge on Edulpha! (${badgeDescText}). Boosting my GCE preparation with AI-powered lessons & interactive drills on Edulpha: 👉 ${shareTargetUrl}`;
  };

  const shareText = generateShareText();

  // Social URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareTargetUrl)}&quote=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&hashtags=Edulpha,GCEPrep,CameroonEducation,AIEdTech`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareTargetUrl)}&text=${encodeURIComponent(shareText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareTargetUrl)}`;

  // Copy to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success(isFr ? 'Texte et lien copiés dans le presse-papiers !' : 'Share text & link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error(isFr ? 'Échec de la copie' : 'Failed to copy to clipboard');
    }
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isFr ? 'Mon Succès sur Edulpha' : 'My Academic Achievement on Edulpha',
          text: shareText,
          url: shareTargetUrl,
        });
        toast.success(isFr ? 'Partagé avec succès !' : 'Shared successfully!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  // Download high-resolution PNG image card for WhatsApp Status / Instagram
  const handleDownloadImageCard = async () => {
    setIsGeneratingImage(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = 675; // Standard 16:9 social share ratio
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 1. Background gradient (Midnight Indigo)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a'); // slate-900
      grad.addColorStop(0.5, '#1e1b4b'); // indigo-950
      grad.addColorStop(1, '#020617'); // slate-950
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative background glow
      const radialGrad = ctx.createRadialGradient(width - 200, 150, 10, width - 200, 150, 400);
      radialGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      radialGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Card inner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Corner accent lines
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // top-left
      ctx.moveTo(30, 80); ctx.lineTo(30, 30); ctx.lineTo(80, 30);
      // bottom-right
      ctx.moveTo(width - 80, height - 30); ctx.lineTo(width - 30, height - 30); ctx.lineTo(width - 30, height - 80);
      ctx.stroke();

      // 4. Header: Logo & Platform
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('EDULPHA AI DIGITAL SCHOOL • CAMEROON GCE PREP', 70, 85);

      // 5. Verification badge pill
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fillRect(width - 340, 60, 270, 36);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width - 340, 60, 270, 36);
      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('✓ VERIFIED ACHIEVEMENT', width - 315, 84);

      // 6. Student Info
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 22px sans-serif';
      ctx.fillText(isFr ? 'Certifié pour :' : 'Awarded to:', 70, 140);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(studentName, 70, 190);

      // 7. Category Specific Hero Section
      if (activeCategory === 'progress') {
        // Hero highlight
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 72px sans-serif';
        ctx.fillText(`${overallProgress}% MASTERY`, 70, 290);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'normal 26px sans-serif';
        ctx.fillText(
          isFr 
            ? `Progression GCE : ${completedLessons}/${totalLessons} modules validés • Série de ${streakDays} jours consécutifs`
            : `GCE Academic Progress: ${completedLessons}/${totalLessons} modules completed • ${streakDays}-day streak`,
          70, 340
        );

        // Stats grid boxes
        const boxes = [
          { label: isFr ? 'NOTE PRÉVUE' : 'PREDICTED GRADE', val: `Grade ${predictedGrade}`, col: '#34d399' },
          { label: isFr ? 'PRÉCISION MOYENNE' : 'AVERAGE ACCURACY', val: `${accuracyRate}%`, col: '#818cf8' },
          { label: isFr ? 'SÉRIE ACTIVE' : 'ACTIVE STREAK', val: `🔥 ${streakDays} Days`, col: '#fbbf24' }
        ];

        boxes.forEach((b, idx) => {
          const bx = 70 + idx * 350;
          const by = 400;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.fillRect(bx, by, 320, 110);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.strokeRect(bx, by, 320, 110);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(b.label, bx + 24, by + 40);

          ctx.fillStyle = b.col;
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText(b.val, bx + 24, by + 86);
        });

      } else if (activeCategory === 'exam_score') {
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 76px sans-serif';
        ctx.fillText(`${scorePercentage}% SCORE`, 70, 290);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`${examSubject} — ${examTitle}`, 70, 345);

        // Stats boxes
        const boxes = [
          { label: isFr ? 'CLASSEMENT' : 'COHORT RANK', val: rankText, col: '#fbbf24' },
          { label: isFr ? 'STATUS GCE' : 'EXAM READINESS', val: 'Distinction Ready', col: '#34d399' },
          { label: isFr ? 'MODULE' : 'EVALUATION', val: 'Official GCE Standard', col: '#818cf8' }
        ];

        boxes.forEach((b, idx) => {
          const bx = 70 + idx * 350;
          const by = 400;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.fillRect(bx, by, 320, 110);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.strokeRect(bx, by, 320, 110);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(b.label, bx + 24, by + 40);

          ctx.fillStyle = b.col;
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(b.val, bx + 24, by + 86);
        });

      } else {
        // Badge
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText(`🏆 ${isFr ? currentBadge.titleFr : currentBadge.title}`, 70, 290);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'normal 26px sans-serif';
        ctx.fillText(isFr ? currentBadge.descriptionFr : currentBadge.description, 70, 340);

        // Highlight box
        ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
        ctx.fillRect(70, 390, 700, 120);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.strokeRect(70, 390, 700, 120);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(isFr ? 'NIVEAU DU BADGE :' : 'BADGE TIER :', 100, 435);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`${currentBadge.tier.toUpperCase()} SCHOLAR • ${currentBadge.stat}`, 100, 480);
      }

      // 8. Footer URL & call to action
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Revise GCE Past Papers & AI Lessons at: edulpha.com', 70, 600);

      const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      ctx.fillText(`Date: ${todayStr}`, width - 260, 600);

      // Trigger download
      const imageURL = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.download = `Edulpha_${activeCategory}_${studentName.replace(/\s+/g, '_')}.png`;
      dlLink.href = imageURL;
      dlLink.click();
      toast.success(isFr ? 'Carte image téléchargée !' : 'Achievement image card downloaded!');
    } catch (err) {
      console.error('Image creation error:', err);
      toast.error(isFr ? 'Erreur lors de la génération' : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
              <Share2 size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                {isFr ? 'Partager vos Progrès & Badges' : 'Share Progress & Achievements'}
              </h2>
              <p className="text-xs text-indigo-200">
                {isFr 
                  ? 'Célébrez vos réussites sur WhatsApp, Facebook, X/Twitter et plus' 
                  : 'Celebrate your academic milestones on WhatsApp, Facebook, X & more'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Category Tabs: Progress vs Exam Score vs Badges */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveCategory('progress')}
              className={cn(
                "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeCategory === 'progress' 
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TrendingUp size={15} className="text-indigo-600" />
              <span className="truncate">{isFr ? 'Progrès' : 'Progress'}</span>
            </button>

            <button
              onClick={() => setActiveCategory('exam_score')}
              className={cn(
                "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeCategory === 'exam_score' 
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <BarChart2 size={15} className="text-emerald-600" />
              <span className="truncate">{isFr ? 'Notes Examens' : 'Exam Scores'}</span>
            </button>

            <button
              onClick={() => setActiveCategory('badge')}
              className={cn(
                "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeCategory === 'badge' 
                  ? "bg-white text-indigo-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Trophy size={15} className="text-amber-500" />
              <span className="truncate">{isFr ? 'Badges' : 'Badges'}</span>
            </button>
          </div>

          {/* Configuration Controls based on category */}
          {activeCategory === 'progress' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">{isFr ? 'Maîtrise' : 'Mastery'}</span>
                <span className="text-base font-black text-indigo-900">{overallProgress}%</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">{isFr ? 'Série Active' : 'Streak'}</span>
                <span className="text-base font-black text-amber-600">🔥 {streakDays} {isFr ? 'Jours' : 'Days'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">{isFr ? 'Modules' : 'Modules'}</span>
                <span className="text-base font-black text-slate-900">{completedLessons}/{totalLessons}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">{isFr ? 'Grade Estimé' : 'Grade'}</span>
                <span className="text-base font-black text-emerald-600">{predictedGrade} (GCE)</span>
              </div>
            </div>
          )}

          {activeCategory === 'exam_score' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isFr ? 'Matière :' : 'Subject:'}
                  </label>
                  <select 
                    value={examSubject} 
                    onChange={e => setExamSubject(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isFr ? 'Note Obtenue (%) :' : 'Exam Score (%):'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={scorePercentage}
                      onChange={e => setScorePercentage(Number(e.target.value))}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="text-sm font-black text-emerald-600 min-w-10">{scorePercentage}%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {isFr ? 'Titre de l\'Épreuve :' : 'Exam / Drill Title:'}
                </label>
                <input 
                  type="text" 
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeCategory === 'badge' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                {isFr ? 'Sélectionner un Badge à Partager :' : 'Choose Badge to Share:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_BADGES.map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all space-y-1 relative",
                      selectedBadgeId === badge.id 
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">
                        {badge.iconName === 'zap' ? '⚡' : badge.iconName === 'trophy' ? '🏆' : badge.iconName === 'graduation' ? '🎓' : '✨'}
                      </span>
                      {selectedBadgeId === badge.id && <CheckCircle2 size={16} className="text-indigo-600" />}
                    </div>
                    <p className="text-[11px] font-extrabold text-slate-900 leading-tight">
                      {isFr ? badge.titleFr : badge.title}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">
                      {badge.stat}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VISUAL PREVIEW CARD */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isFr ? 'Aperçu de la Carte de Partage :' : 'Live Achievement Card Preview:'}
              </span>
              <button 
                onClick={handleDownloadImageCard}
                disabled={isGeneratingImage}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>{isFr ? 'Génération...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>{isFr ? 'Télécharger l\'Image (PNG)' : 'Download Image Card (PNG)'}</span>
                  </>
                )}
              </button>
            </div>

            <div 
              ref={cardPreviewRef}
              className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Header branding */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                      E
                    </div>
                    <div>
                      <span className="text-xs font-black tracking-wider block text-white">EDULPHA</span>
                      <span className="text-[9px] text-indigo-300 font-medium tracking-tight">Cameroon GCE & Technical Prep</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> {isFr ? 'Vérifié' : 'Verified'}
                  </span>
                </div>

                {/* Student info */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{isFr ? 'Élève :' : 'Scholar:'}</span>
                  <h3 className="text-xl font-black text-white">{studentName}</h3>
                </div>

                {/* Dynamic Content */}
                {activeCategory === 'progress' && (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
                        {overallProgress}%
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wide">
                        {isFr ? 'Maîtrise Globale GCE' : 'Overall GCE Mastery'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-400 block">{isFr ? 'Série' : 'Streak'}</span>
                        <span className="text-xs font-bold text-amber-400">🔥 {streakDays} Days</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-400 block">{isFr ? 'Modules' : 'Lessons'}</span>
                        <span className="text-xs font-bold text-white">{completedLessons}/{totalLessons}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-400 block">{isFr ? 'Grade Est.' : 'Est. Grade'}</span>
                        <span className="text-xs font-bold text-emerald-400">{predictedGrade} (Distinction)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'exam_score' && (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                        {scorePercentage}%
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-white block">{examSubject}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{examTitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs">
                      <Badge variant="success" className="text-[10px]">
                        {rankText}
                      </Badge>
                      <span className="text-[10px] text-slate-400">• Official GCE Exam Evaluation Standard</span>
                    </div>
                  </div>
                )}

                {activeCategory === 'badge' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shrink-0">
                        {currentBadge.iconName === 'zap' ? '⚡' : currentBadge.iconName === 'trophy' ? '🏆' : currentBadge.iconName === 'graduation' ? '🎓' : '✨'}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 block">
                          {currentBadge.tier.toUpperCase()} ACHIEVEMENT
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          {isFr ? currentBadge.titleFr : currentBadge.title}
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          {isFr ? currentBadge.descriptionFr : currentBadge.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer watermark */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/10">
                  <span>edulpha.com</span>
                  <span>AI Socratic Digital School</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Share Actions */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              {isFr ? 'Partager Directement Sur :' : 'Share Directly To:'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X / Twitter</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Telegram</span>
              </a>
            </div>

            {/* Bottom Row Actions: Copy Text & Native Share */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={handleCopyText}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>{copied ? (isFr ? 'Texte et lien copiés !' : 'Copied to clipboard!') : (isFr ? 'Copier le Message et le Lien' : 'Copy Message & Link')}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-100"
              >
                <Share2 size={16} />
                <span>{isFr ? 'Plus d\'options' : 'More Options'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
