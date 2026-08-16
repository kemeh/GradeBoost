import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Award, Trophy, Users, ShieldCheck, CheckCircle2, 
  ChevronRight, ArrowRight, Star, GraduationCap, School, 
  Send, X, Copy, Check, Share2, ExternalLink, RefreshCw, 
  Clock, AlertCircle, Heart, Zap, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  submitAmbassadorApplication, 
  getUserAmbassadorApplication, 
  getUserAmbassadorProfile 
} from '../../services/ambassadorService';
import { AlumniService } from '../../services/alumniService';
import { AmbassadorApplication, AmbassadorProfile, AmbassadorClassLevel } from '../../types/ambassador';
import { AlumniApplication, AlumniProfile } from '../../types/alumni';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

interface Props {
  userProfile?: {
    name?: string;
    email?: string;
    school?: string;
    region?: string;
    level?: string;
    subject?: string;
  };
}

export default function AlumniAmbassadorSection({ userProfile }: Props) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [activeTab, setActiveTab] = useState<'ambassador' | 'alumni'>('ambassador');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Ambassador State
  const [ambassadorApp, setAmbassadorApp] = useState<AmbassadorApplication | null>(null);
  const [ambassadorProfile, setAmbassadorProfile] = useState<AmbassadorProfile | null>(null);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorStep, setAmbassadorStep] = useState(1);
  const [submittingAmbassador, setSubmittingAmbassador] = useState(false);

  // Ambassador Form State
  const [ambForm, setAmbForm] = useState({
    fullName: user?.name || userProfile?.name || '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '',
    phone: '',
    whatsapp: '',
    email: user?.email || userProfile?.email || '',
    location: userProfile?.region || 'Douala',
    schoolName: userProfile?.school || '',
    schoolLocation: userProfile?.region || '',
    region: userProfile?.region || 'South West Region',
    classLevel: (userProfile?.level?.includes('Advance') || userProfile?.level?.includes('Terminale') ? 'Lower Sixth' : 'Form 5') as AmbassadorClassLevel,
    subjects: userProfile?.subject || 'Mathematics, Physics',
    motivationWhy: '',
    motivationIdeas: '',
    skills: ['Leadership', 'Communication'] as string[],
    weeklyHours: '3-5 hours' as '1-2 hours' | '3-5 hours' | 'More than 5 hours',
    agreedToTerms: false
  });

  // Alumni State
  const [alumniApp, setAlumniApp] = useState<AlumniApplication | null>(null);
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [submittingAlumni, setSubmittingAlumni] = useState(false);

  // Alumni Form State
  const [alumniForm, setAlumniForm] = useState({
    fullName: user?.name || userProfile?.name || '',
    email: user?.email || userProfile?.email || '',
    phone: '',
    graduationYear: 2023,
    subSystem: 'General Education',
    school: userProfile?.school || '',
    currentRole: '',
    companyOrUniversity: '',
    specialization: '',
    motivation: '',
    linkedin: '',
    photoUrl: user?.photoURL || '',
    consentGranted: false
  });

  const loadData = async () => {
    if (!user?.email && !user?.name) return;
    setLoading(true);
    try {
      const [ambApp, ambProf, alApp, alProf] = await Promise.all([
        getUserAmbassadorApplication(user.email || undefined, user.name || undefined),
        getUserAmbassadorProfile(user.email || undefined, user.name || undefined),
        user.email ? AlumniService.getUserAlumniApplication(user.email) : Promise.resolve(null),
        user.email ? AlumniService.getUserAlumniProfile(user.email) : Promise.resolve(null)
      ]);
      setAmbassadorApp(ambApp);
      setAmbassadorProfile(ambProf);
      setAlumniApp(alApp);
      setAlumniProfile(alProf);
    } catch (err) {
      console.error('Error loading ambassador/alumni status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Keep forms in sync with props
  useEffect(() => {
    if (user || userProfile) {
      setAmbForm(prev => ({
        ...prev,
        fullName: prev.fullName || user?.name || userProfile?.name || '',
        email: prev.email || user?.email || userProfile?.email || '',
        schoolName: prev.schoolName || userProfile?.school || '',
        schoolLocation: prev.schoolLocation || userProfile?.region || '',
        region: prev.region || userProfile?.region || 'South West Region'
      }));

      setAlumniForm(prev => ({
        ...prev,
        fullName: prev.fullName || user?.name || userProfile?.name || '',
        email: prev.email || user?.email || userProfile?.email || '',
        school: prev.school || userProfile?.school || ''
      }));
    }
  }, [user, userProfile]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(isFr ? 'Code copié dans le presse-papiers !' : 'Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAmbassadorSkillToggle = (skill: string) => {
    setAmbForm(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      };
    });
  };

  const handleAmbassadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambForm.agreedToTerms) {
      toast.error(isFr ? 'Veuillez accepter l\'engagement pour continuer.' : 'Please agree to terms to submit.');
      return;
    }

    setSubmittingAmbassador(true);
    try {
      const subjectsArray = ambForm.subjects.split(',').map(s => s.trim()).filter(Boolean);
      await submitAmbassadorApplication({
        fullName: ambForm.fullName,
        gender: ambForm.gender,
        dob: ambForm.dob || '2008-01-01',
        phone: ambForm.phone,
        whatsapp: ambForm.whatsapp || ambForm.phone,
        email: ambForm.email,
        location: ambForm.location,
        schoolName: ambForm.schoolName,
        schoolLocation: ambForm.schoolLocation || ambForm.location,
        region: ambForm.region,
        classLevel: ambForm.classLevel,
        subjects: subjectsArray.length > 0 ? subjectsArray : ['General Studies'],
        motivationWhy: ambForm.motivationWhy,
        motivationIdeas: ambForm.motivationIdeas,
        skills: ambForm.skills,
        weeklyHours: ambForm.weeklyHours,
        agreedToTerms: ambForm.agreedToTerms
      });

      toast.success(
        isFr 
          ? 'Candidature Ambassadeur envoyée avec succès !' 
          : 'Ambassador application submitted successfully!'
      );
      setShowAmbassadorModal(false);
      await loadData();
    } catch (err) {
      console.error('Error submitting ambassador application:', err);
      toast.error(isFr ? 'Erreur lors de l\'envoi.' : 'Failed to submit application.');
    } finally {
      setSubmittingAmbassador(false);
    }
  };

  const handleAlumniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniForm.fullName || !alumniForm.email || !alumniForm.school || !alumniForm.currentRole || !alumniForm.motivation) {
      toast.error(isFr ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill all required fields.');
      return;
    }

    if (!alumniForm.consentGranted) {
      toast.error(isFr ? 'Le consentement pour le profil public est requis.' : 'Consent to public profile display is required.');
      return;
    }

    setSubmittingAlumni(true);
    try {
      await AlumniService.submitApplication({
        fullName: alumniForm.fullName,
        email: alumniForm.email,
        phone: alumniForm.phone,
        graduationYear: alumniForm.graduationYear,
        subSystem: alumniForm.subSystem,
        school: alumniForm.school,
        currentRole: alumniForm.currentRole,
        companyOrUniversity: alumniForm.companyOrUniversity,
        specialization: alumniForm.specialization,
        motivation: alumniForm.motivation,
        linkedin: alumniForm.linkedin,
        photoUrl: alumniForm.photoUrl,
        consentGranted: alumniForm.consentGranted
      });

      toast.success(
        isFr 
          ? 'Candidature Alumni envoyée avec succès !' 
          : 'Alumni application submitted successfully!'
      );
      setShowAlumniModal(false);
      await loadData();
    } catch (err) {
      console.error('Error submitting alumni application:', err);
      toast.error(isFr ? 'Erreur lors de l\'envoi.' : 'Failed to submit application.');
    } finally {
      setSubmittingAlumni(false);
    }
  };

  return (
    <Card className="p-8 lg:p-12 overflow-hidden border-slate-200">
      <div className="space-y-8">
        
        {/* SECTION HEADER & TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <Trophy size={20} className="text-amber-500" />
              <span className="text-sm font-black uppercase tracking-widest">
                {isFr ? 'Programmes d\'Excellence & Leadership' : 'Leadership & Ambassador Programs'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isFr ? 'Représentez Edulpha & Rejoignez l\'Élite' : 'Represent Edulpha & Join the Leaders Network'}
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              {isFr
                ? 'Participez activement à l\'essor éducatif en devenant Ambassadeur de votre lycée ou Mentor Alumni accrédité.'
                : 'Empower classmates and build your leadership profile as a Student Ambassador or Alumni Mentor.'}
            </p>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit shrink-0">
            <button
              onClick={() => setActiveTab('ambassador')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeTab === 'ambassador'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Sparkles size={14} className={activeTab === 'ambassador' ? 'text-amber-500 fill-amber-500' : ''} />
              <span>{isFr ? 'Ambassadeur Élève' : 'Student Ambassador'}</span>
            </button>
            <button
              onClick={() => setActiveTab('alumni')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activeTab === 'alumni'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <GraduationCap size={14} className={activeTab === 'alumni' ? 'text-indigo-600' : ''} />
              <span>{isFr ? 'Réseau Alumni' : 'Alumni Network'}</span>
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-slate-400" size={24} />
          </div>
        ) : (
          <div>
            {/* ======================================================== */}
            {/* TAB 1: STUDENT AMBASSADOR PROGRAM */}
            {/* ======================================================== */}
            {activeTab === 'ambassador' && (
              <div className="space-y-6">
                
                {/* 1A. ACTIVE AMBASSADOR STATUS */}
                {ambassadorProfile ? (
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-200/80 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-400/20">
                          <Trophy size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-900">{ambassadorProfile.name}</span>
                            <Badge variant="success" className="bg-emerald-500 text-white font-black text-[10px] uppercase">
                              Active Ambassador
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            {ambassadorProfile.school} • {ambassadorProfile.region}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
                          Tier: {ambassadorProfile.level.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* REFERRAL CODE & STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      
                      {/* Code Card */}
                      <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          {isFr ? 'Votre Code Parrainage' : 'Your Referral Code'}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base font-black text-slate-900 font-mono tracking-wider">
                            {ambassadorProfile.referralCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(ambassadorProfile.referralCode)}
                            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition flex items-center gap-1 text-xs font-bold"
                            title="Copy code"
                          >
                            {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Recruited Count Card */}
                      <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          {isFr ? 'Élèves Parrainés' : 'Students Recruited'}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {ambassadorProfile.recruitedCount || 0}
                          </span>
                          <span className="text-xs font-bold text-amber-700">students active</span>
                        </div>
                      </div>

                      {/* Share Action Card */}
                      <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          {isFr ? 'Partager avec mes camarades' : 'Invite Schoolmates'}
                        </span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Join me on Edulpha, Cameroon's premier study and exam preparation platform! Use my ambassador code ${ambassadorProfile.referralCode} when registering to unlock benefits: https://edulpha.com`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <Share2 size={14} />
                          <span>{isFr ? 'Partager sur WhatsApp' : 'Share on WhatsApp'}</span>
                        </a>
                      </div>

                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-bold text-amber-900">
                      <span>{ambassadorProfile.bio}</span>
                      <a href="/ambassador" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                        <span>{isFr ? 'Voir le programme' : 'View Ambassador Page'}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : ambassadorApp ? (
                  /* 1B. PENDING / UNDER REVIEW APPLICATION */
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
                          <Clock size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white">
                              {isFr ? 'Candidature Ambassadeur Transmise' : 'Ambassador Application Received'}
                            </h3>
                            <Badge variant={ambassadorApp.status === 'pending' ? 'warning' : 'default'} className="uppercase text-[10px] font-black">
                              {ambassadorApp.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            {isFr ? 'Soumise le ' : 'Submitted on '} 
                            {new Date(ambassadorApp.submittedAt).toLocaleDateString()} • {ambassadorApp.schoolName}
                          </p>
                        </div>
                      </div>

                      <a 
                        href="/ambassador" 
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 shrink-0"
                      >
                        <span>{isFr ? 'Explorer le programme' : 'Explore Program'}</span>
                        <ChevronRight size={14} />
                      </a>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-amber-400 flex items-center gap-2">
                        <ShieldCheck size={14} />
                        <span>{isFr ? 'Prochaine étape :' : 'Next Steps in Evaluation:'}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {isFr
                          ? 'Notre coordinateur régional examine vos informations scolaires. Une fois approuvé, votre code parrainage apparaîtra directement ici.'
                          : 'Our school outreach team is reviewing your application. Once approved, your personalized referral code and ambassador tier will be activated right here.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 1C. NOT YET APPLIED -> INVITATION & CTA */
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50/50 border border-amber-200/80 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
                          <Sparkles size={12} className="fill-amber-600 text-amber-600" />
                          <span>{isFr ? 'Opportunité pour Élèves' : 'Student Leadership Role'}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {isFr ? 'Devenez le Représentant Edulpha de votre Lycée' : 'Become an Official Edulpha Student Ambassador'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                          {isFr
                            ? 'Partagez des conseils de révision, gagnez des accès gratuits et des commissions, et développez vos compétences en leadership.'
                            : 'Help classmates master GCE & Baccalauréat past questions, earn rewards, and receive official leadership certification for your CV.'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>{isFr ? 'Accès Premium Offert' : 'Free Premium Access'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>{isFr ? 'Certificat de Leadership' : 'Leadership Certificate'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>{isFr ? 'Code Parrainage Exclusif' : 'Referral Rewards'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 shrink-0">
                        <Button
                          onClick={() => { setShowAmbassadorModal(true); setAmbassadorStep(1); }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20"
                        >
                          <Sparkles size={16} className="mr-2 fill-slate-950" />
                          <span>{isFr ? 'Postuler Maintenant' : 'Apply as Ambassador'}</span>
                        </Button>
                        <a
                          href="/ambassador"
                          className="text-xs font-bold text-center text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1"
                        >
                          <span>{isFr ? 'Découvrir tous les avantages' : 'Learn More Details'}</span>
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: ALUMNI NETWORK */}
            {/* ======================================================== */}
            {activeTab === 'alumni' && (
              <div className="space-y-6">
                
                {/* 2A. ACTIVE ALUMNI PROFILE */}
                {alumniProfile ? (
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30 overflow-hidden">
                          {alumniProfile.photoUrl ? (
                            <img src={alumniProfile.photoUrl} alt={alumniProfile.name} className="w-full h-full object-cover" />
                          ) : (
                            <GraduationCap size={28} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">{alumniProfile.name}</span>
                            <Badge variant="success" className="bg-indigo-500 text-white font-black text-[10px] uppercase">
                              Accredited Alumni Leader
                            </Badge>
                          </div>
                          <p className="text-xs text-indigo-200 font-medium">
                            {alumniProfile.currentRole} • {alumniProfile.companyOrUniversity}
                          </p>
                        </div>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black uppercase tracking-wider">
                        Class of {alumniProfile.graduationYear}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-900/50 space-y-2">
                      <div className="text-xs font-bold text-indigo-300">
                        {alumniProfile.specialization} ({alumniProfile.subSystem})
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        "{alumniProfile.bio}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-bold text-indigo-300">
                      <span>{alumniProfile.school}</span>
                      <a href="/alumni" className="inline-flex items-center gap-1 text-white hover:underline">
                        <span>{isFr ? 'Voir l\'annuaire Alumni' : 'View Public Alumni Directory'}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : alumniApp ? (
                  /* 2B. PENDING ALUMNI APPLICATION */
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                          <Clock size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white">
                              {isFr ? 'Candidature Alumni en Cours d\'Examen' : 'Alumni Leadership Application Under Review'}
                            </h3>
                            <Badge variant="warning" className="uppercase text-[10px] font-black">
                              {alumniApp.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            {alumniApp.currentRole} • {alumniApp.school} (Class of {alumniApp.graduationYear})
                          </p>
                        </div>
                      </div>

                      <a 
                        href="/alumni" 
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 shrink-0"
                      >
                        <span>{isFr ? 'Voir le Réseau' : 'View Network'}</span>
                        <ChevronRight size={14} />
                      </a>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-indigo-300 flex items-center gap-2">
                        <ShieldCheck size={14} />
                        <span>{isFr ? 'Comité d\'Admission :' : 'Committee Evaluation:'}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {isFr
                          ? 'Votre profil de mentor est en cours de validation. Une fois validé, vous recevrez un accès pour animer des sessions de mentorat et figurer dans l\'annuaire public.'
                          : 'Our educational committee is reviewing your background. Upon approval, you will be invited to lead student masterclasses and appear in our official directory.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 2C. NOT YET APPLIED -> INVITATION & CTA */
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 border border-indigo-200/80 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-black uppercase tracking-wider">
                          <GraduationCap size={14} className="text-indigo-600" />
                          <span>{isFr ? 'Réseau des Anciens & Leaders' : 'Mentorship & Alumni Network'}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {isFr ? 'Inspirez les Lycéens de Demain' : 'Mentor High School Students Across Africa'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                          {isFr
                            ? 'Vous avez réussi vos examens ou vos études supérieures ? Devenez Mentor Alumni accrédité et guidez les futurs bacheliers et lauréats GCE.'
                            : 'Have you graduated or built professional expertise? Join our accredited Alumni Network to guide students in STEM, Technical & Francophone specialties.'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                            <span>{isFr ? 'Webinaires & Masterclasses' : 'Webinars & Summits'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                            <span>{isFr ? 'Profil Public Vérifié' : 'Verified Directory'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                            <span>{isFr ? 'Impact Éducatif Réel' : 'Direct Student Impact'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 shrink-0">
                        <Button
                          onClick={() => setShowAlumniModal(true)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20"
                        >
                          <GraduationCap size={16} className="mr-2" />
                          <span>{isFr ? 'Rejoindre les Alumni' : 'Apply for Alumni Leadership'}</span>
                        </Button>
                        <a
                          href="/alumni"
                          className="text-xs font-bold text-center text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1"
                        >
                          <span>{isFr ? 'Découvrir le réseau Alumni' : 'Explore Alumni Program'}</span>
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: STUDENT AMBASSADOR APPLICATION FORM */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showAmbassadorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl my-8 text-white relative"
            >
              <button
                onClick={() => setShowAmbassadorModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles size={14} /> {isFr ? 'Candidature Ambassadeur Élève' : 'Student Ambassador Application'}
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Postulez pour votre Lycée' : 'Represent Edulpha at Your School'}
                </h3>
                <p className="text-slate-400 text-xs">
                  {isFr ? 'Étape' : 'Step'} {ambassadorStep} {isFr ? 'sur' : 'of'} 3
                </p>
              </div>

              {/* Progress */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${(ambassadorStep / 3) * 100}%` }}
                />
              </div>

              <form onSubmit={handleAmbassadorSubmit} className="space-y-4 text-xs font-medium">
                
                {/* STEP 1: PERSONAL & SCHOOL DETAILS */}
                {ambassadorStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Nom Complet *' : 'Full Name *'}</label>
                        <input
                          type="text"
                          required
                          value={ambForm.fullName}
                          onChange={(e) => setAmbForm({ ...ambForm, fullName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Email *' : 'Email Address *'}</label>
                        <input
                          type="email"
                          required
                          value={ambForm.email}
                          onChange={(e) => setAmbForm({ ...ambForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Numéro de Téléphone / WhatsApp *' : 'Phone / WhatsApp *'}</label>
                        <input
                          type="tel"
                          required
                          value={ambForm.phone}
                          onChange={(e) => setAmbForm({ ...ambForm, phone: e.target.value, whatsapp: e.target.value })}
                          placeholder="+237 6..."
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Ville / Localité *' : 'City / Town *'}</label>
                        <input
                          type="text"
                          required
                          value={ambForm.location}
                          onChange={(e) => setAmbForm({ ...ambForm, location: e.target.value })}
                          placeholder="e.g. Buea, Bamenda, Douala"
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Établissement / Lycée *' : 'School Name *'}</label>
                        <input
                          type="text"
                          required
                          value={ambForm.schoolName}
                          onChange={(e) => setAmbForm({ ...ambForm, schoolName: e.target.value })}
                          placeholder="e.g. GBHS Bamenda / Lycée Joss"
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Région *' : 'Region *'}</label>
                        <select
                          value={ambForm.region}
                          onChange={(e) => setAmbForm({ ...ambForm, region: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        >
                          <option value="South West Region">South West Region</option>
                          <option value="North West Region">North West Region</option>
                          <option value="Centre Region">Centre Region</option>
                          <option value="Littoral Region">Littoral Region</option>
                          <option value="West Region">West Region</option>
                          <option value="North Region">North Region</option>
                          <option value="Far North Region">Far North Region</option>
                          <option value="Adamawa Region">Adamawa Region</option>
                          <option value="South Region">South Region</option>
                          <option value="East Region">East Region</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Classe *' : 'Class Level *'}</label>
                        <select
                          value={ambForm.classLevel}
                          onChange={(e) => setAmbForm({ ...ambForm, classLevel: e.target.value as any })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        >
                          <option value="Form 1">Form 1 / 6ème</option>
                          <option value="Form 2">Form 2 / 5ème</option>
                          <option value="Form 3">Form 3 / 4ème</option>
                          <option value="Form 4">Form 4 / 3ème</option>
                          <option value="Form 5">Form 5 / Seconde</option>
                          <option value="Lower Sixth">Lower Sixth / Première</option>
                          <option value="Upper Sixth">Upper Sixth / Terminale</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">{isFr ? 'Matières Principales *' : 'Key Subjects *'}</label>
                        <input
                          type="text"
                          required
                          value={ambForm.subjects}
                          onChange={(e) => setAmbForm({ ...ambForm, subjects: e.target.value })}
                          placeholder="e.g. Maths, Physics, Chemistry"
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: MOTIVATION & IDEAS */}
                {ambassadorStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">
                        {isFr ? 'Pourquoi souhaitez-vous devenir Ambassadeur Edulpha ? *' : 'Why do you want to become an Edulpha Ambassador? *'}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={ambForm.motivationWhy}
                        onChange={(e) => setAmbForm({ ...ambForm, motivationWhy: e.target.value })}
                        placeholder={isFr ? "Expliquez ce qui vous motive à représenter Edulpha..." : "Explain what drives your passion to represent Edulpha..."}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">
                        {isFr ? 'Quelles idées avez-vous pour promouvoir l\'excellence dans votre école ? *' : 'What ideas do you have for promoting study circles in your school? *'}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={ambForm.motivationIdeas}
                        onChange={(e) => setAmbForm({ ...ambForm, motivationIdeas: e.target.value })}
                        placeholder={isFr ? "Ex. Séances d'études le weekend, distribution du code lors des rassemblements..." : "e.g. Weekend revision groups, morning assembly sharing..."}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: SKILLS & COMMITMENT */}
                {ambassadorStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-bold text-slate-300">
                        {isFr ? 'Vos compétences clés :' : 'Select your key skills:'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Leadership', 'Communication', 'Social media', 'Teaching others', 'Content creation', 'Technology'].map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleAmbassadorSkillToggle(skill)}
                            className={cn(
                              "p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between",
                              ambForm.skills.includes(skill)
                                ? "bg-amber-400 text-slate-950 border-amber-300"
                                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                            )}
                          >
                            <span>{skill}</span>
                            {ambForm.skills.includes(skill) && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={ambForm.agreedToTerms}
                          onChange={(e) => setAmbForm({ ...ambForm, agreedToTerms: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 shrink-0"
                        />
                        <span className="text-xs text-slate-200 font-medium leading-relaxed">
                          {isFr
                            ? 'Je m\'engage à représenter Edulpha avec intégrité, à soutenir mes camarades de classe et à participer activement aux initiatives éducatives.'
                            : 'I commit to representing Edulpha positively, supporting my schoolmates in learning, and participating actively in ambassador initiatives.'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  {ambassadorStep > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setAmbassadorStep(prev => prev - 1)}>
                      {isFr ? 'Précédent' : 'Back'}
                    </Button>
                  ) : <div />}

                  {ambassadorStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (ambassadorStep === 1 && (!ambForm.fullName || !ambForm.phone || !ambForm.schoolName)) {
                          toast.error(isFr ? 'Veuillez remplir les informations requises' : 'Please fill required information');
                          return;
                        }
                        if (ambassadorStep === 2 && (!ambForm.motivationWhy || !ambForm.motivationIdeas)) {
                          toast.error(isFr ? 'Veuillez répondre aux questions de motivation' : 'Please answer motivation questions');
                          return;
                        }
                        setAmbassadorStep(prev => prev + 1);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-2.5 rounded-xl"
                    >
                      <span>{isFr ? 'Suivant' : 'Next'}</span>
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submittingAmbassador}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-3 rounded-xl shadow-lg"
                    >
                      {submittingAmbassador 
                        ? (isFr ? 'Envoi en cours...' : 'Submitting...') 
                        : (isFr ? 'Soumettre ma Candidature' : 'Submit Application')}
                    </Button>
                  )}
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: ALUMNI LEADERSHIP APPLICATION FORM */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showAlumniModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-indigo-500/30 shadow-2xl my-8 text-white relative"
            >
              <button
                onClick={() => setShowAlumniModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider mb-2">
                  <GraduationCap size={14} /> {isFr ? 'Candidature Leader Alumni' : 'Alumni Leadership Application'}
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Rejoignez le Réseau des Mentors' : 'Join the Alumni Mentorship Network'}
                </h3>
                <p className="text-slate-400 text-xs">
                  {isFr ? 'Partagez votre expérience avec la nouvelle génération.' : 'Guide high school students across Cameroon and Africa.'}
                </p>
              </div>

              <form onSubmit={handleAlumniSubmit} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Nom Complet *' : 'Full Name *'}</label>
                    <input
                      type="text"
                      required
                      value={alumniForm.fullName}
                      onChange={(e) => setAlumniForm({ ...alumniForm, fullName: e.target.value })}
                      placeholder="e.g. Vanessa Mbella"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Email *' : 'Email Address *'}</label>
                    <input
                      type="email"
                      required
                      value={alumniForm.email}
                      onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })}
                      placeholder="vanessa@example.com"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Téléphone / WhatsApp' : 'Phone / WhatsApp'}</label>
                    <input
                      type="tel"
                      value={alumniForm.phone}
                      onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })}
                      placeholder="+237 6..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Année d\'Obtention / Examen *' : 'Year of Graduation / Exam *'}</label>
                    <input
                      type="number"
                      required
                      value={alumniForm.graduationYear}
                      onChange={(e) => setAlumniForm({ ...alumniForm, graduationYear: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Sous-système Éducatif *' : 'Curriculum System *'}</label>
                    <select
                      value={alumniForm.subSystem}
                      onChange={(e) => setAlumniForm({ ...alumniForm, subSystem: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="General Education">General Education (GCE O/A Level)</option>
                      <option value="Technical & TVEE">Technical & TVEE Specialties</option>
                      <option value="Commercial Education">Commercial Education</option>
                      <option value="Baccalauréat & French Sub-System">Baccalauréat & French Sub-System</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Lycée / Établissement Fréquenté *' : 'High School Attended *'}</label>
                    <input
                      type="text"
                      required
                      value={alumniForm.school}
                      onChange={(e) => setAlumniForm({ ...alumniForm, school: e.target.value })}
                      placeholder="e.g. CCAST Bambili / Lycée Général Leclerc"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Rôle Actuel / Statut Étudiant *' : 'Current Professional Role *'}</label>
                    <input
                      type="text"
                      required
                      value={alumniForm.currentRole}
                      onChange={(e) => setAlumniForm({ ...alumniForm, currentRole: e.target.value })}
                      placeholder="e.g. Software Engineer / Medical Student"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">{isFr ? 'Entreprise / Université' : 'Company / University'}</label>
                    <input
                      type="text"
                      value={alumniForm.companyOrUniversity}
                      onChange={(e) => setAlumniForm({ ...alumniForm, companyOrUniversity: e.target.value })}
                      placeholder="e.g. Google / CMU Africa / CUSS"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{isFr ? 'Domaine d\'Expertise / Spécialisation' : 'Specialization / Field'}</label>
                  <input
                    type="text"
                    value={alumniForm.specialization}
                    onChange={(e) => setAlumniForm({ ...alumniForm, specialization: e.target.value })}
                    placeholder="e.g. Artificial Intelligence, Cardiology, Civil Engineering"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{isFr ? 'Motivation & Contribution Souhaitée *' : 'Motivation & Mentorship Goals *'}</label>
                  <textarea
                    rows={3}
                    required
                    value={alumniForm.motivation}
                    onChange={(e) => setAlumniForm({ ...alumniForm, motivation: e.target.value })}
                    placeholder="Share how you want to mentor high school students or support Edulpha..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-900/50 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={alumniForm.consentGranted}
                      onChange={(e) => setAlumniForm({ ...alumniForm, consentGranted: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 shrink-0"
                    />
                    <span className="text-xs text-slate-200 font-medium leading-relaxed">
                      <strong>{isFr ? 'Consentement pour le profil public :' : 'Public Display Consent:'}</strong> {isFr ? 'J\'accepte que mes informations académiques et professionnelles soient publiées sur l\'annuaire des Alumni Edulpha après validation.' : 'I consent to having my profile information displayed on the public Edulpha Alumni Directory upon committee approval.'}
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAlumniModal(false)}>
                    {isFr ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingAlumni}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl shadow-lg"
                  >
                    {submittingAlumni 
                      ? (isFr ? 'Envoi...' : 'Submitting...') 
                      : (isFr ? 'Soumettre ma Candidature' : 'Submit Application')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </Card>
  );
}
