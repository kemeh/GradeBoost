import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Award, ShieldCheck, Users, Target, CheckCircle2, 
  ChevronRight, Star, GraduationCap, School, Trophy, Zap, 
  Gift, Heart, HelpCircle, Send, ArrowRight, X, Phone, Mail, 
  User, Calendar, MapPin, BookOpen, Layers, Check, Search, Filter, Image as ImageIcon, Volume2, Share2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getAmbassadorProfiles, 
  getAmbassadorGallery, 
  submitAmbassadorApplication 
} from '../services/ambassadorService';
import { 
  AmbassadorProfile, 
  AmbassadorGalleryItem, 
  AmbassadorClassLevel, 
  AmbassadorLevel 
} from '../types/ambassador';

export default function StudentAmbassadorPage() {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  // Data states
  const [profiles, setProfiles] = useState<AmbassadorProfile[]>([]);
  const [gallery, setGallery] = useState<AmbassadorGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Gallery Modal
  const [activeGalleryItem, setActiveGalleryItem] = useState<AmbassadorGalleryItem | null>(null);

  // Application Modal & Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formStep, setFormStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '',
    phone: '',
    whatsapp: '',
    email: '',
    location: '',
    schoolName: '',
    schoolLocation: '',
    region: 'South West Region',
    classLevel: 'Lower Sixth' as AmbassadorClassLevel,
    subjects: '' as string,
    motivationWhy: '',
    motivationIdeas: '',
    skills: [] as string[],
    weeklyHours: '3-5 hours' as '1-2 hours' | '3-5 hours' | 'More than 5 hours',
    agreedToTerms: false
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const profList = await getAmbassadorProfiles();
      const galList = await getAmbassadorGallery();
      setProfiles(profList);
      setGallery(galList);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      };
    });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      alert(isFr ? 'Veuillez accepter l\'engagement ambassadeur pour continuer.' : 'Please agree to the ambassador commitments to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectsArray = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);
      await submitAmbassadorApplication({
        fullName: formData.fullName,
        gender: formData.gender,
        dob: formData.dob,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        location: formData.location,
        schoolName: formData.schoolName,
        schoolLocation: formData.schoolLocation,
        region: formData.region,
        classLevel: formData.classLevel,
        subjects: subjectsArray.length > 0 ? subjectsArray : ['General Studies'],
        motivationWhy: formData.motivationWhy,
        motivationIdeas: formData.motivationIdeas,
        skills: formData.skills.length > 0 ? formData.skills : ['Leadership'],
        weeklyHours: formData.weeklyHours,
        agreedToTerms: formData.agreedToTerms
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Application failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesRegion = selectedRegion === 'all' || p.region === selectedRegion;
    const matchesLevel = selectedLevel === 'all' || p.level === selectedLevel;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.schoolLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesLevel && matchesSearch;
  });

  const availableRegions = Array.from(new Set(profiles.map(p => p.region)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Sparkles size={22} className="fill-slate-950" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">EDULPHA</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block -mt-1">
                Student Ambassador Program
              </span>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <a href="/" className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
              <span>{isFr ? '← Retour à l\'accueil' : '← Back to Home'}</span>
            </a>
            <button
              onClick={() => { setShowApplyModal(true); setFormStep(1); setSubmitSuccess(false); }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Sparkles size={14} className="fill-slate-950" />
              <span>{isFr ? 'Postuler Maintenant' : 'Apply Now'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-extrabold uppercase tracking-widest">
                <Trophy size={16} />
                <span>{isFr ? 'Programme Leader d\'Établissement' : 'School Leadership & Impact'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                {isFr ? (
                  <>
                    Devenez un <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Ambassadeur Élève</span> Edulpha
                  </>
                ) : (
                  <>
                    Become an <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Edulpha Student</span> Ambassador
                  </>
                )}
              </h1>

              <p className="text-lg sm:text-xl font-semibold text-amber-200/90 tracking-tight">
                "{isFr 
                  ? 'Guidez votre école. Inspirez vos camarades. Bâtissez l\'avenir de l\'apprentissage.' 
                  : 'Lead your school. Inspire your classmates. Build the future of learning.'}"
              </p>

              <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {isFr 
                  ? 'Rejoignez une communauté d\'élèves motivés qui aident leurs camarades à mieux se préparer aux examens du GCE, du TVEE et du Baccalauréat, développer des compétences numériques et débloquer de nouvelles opportunités.'
                  : 'Join a community of motivated students helping their classmates prepare better, learn digital skills, and discover new opportunities through Edulpha.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => { setShowApplyModal(true); setFormStep(1); setSubmitSuccess(false); }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="fill-slate-950" />
                  <span>{isFr ? 'Postuler Maintenant' : 'Apply Now'}</span>
                </button>

                <a
                  href="#leaders"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 font-bold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <Users size={16} className="text-amber-400" />
                  <span>{isFr ? 'Découvrir Nos Ambassadeurs' : 'Meet Our Student Leaders'}</span>
                </a>
              </div>

              {/* Quick Metrics */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">120+</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isFr ? 'Ambassadeurs Actifs' : 'Active Ambassadors'}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">45+</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isFr ? 'Lycées Partenaires' : 'Partner Schools'}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">4,800+</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isFr ? 'Élèves Accompagnés' : 'Students Impacted'}</div>
                </div>
              </div>

            </div>

            {/* Right Graphic / Image Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Card Image */}
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900 group">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                    alt="African High School Students Collaborating" 
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white">Peer-to-Peer Study Circles</div>
                        <div className="text-xs text-amber-300 font-semibold">GBHS Buea Town • GCE Revision Group</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Floating Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-6 -left-6 bg-slate-900 border border-amber-400/40 p-4 rounded-2xl shadow-xl hidden sm:flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-amber-400">{isFr ? 'Statut Gold Leader' : 'Gold Leader Status'}</div>
                    <div className="text-xs text-slate-300 font-bold">50+ {isFr ? 'Inscriptions Réussies' : 'Recruited Students'}</div>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT THE PROGRAM SECTION */}
      <section className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
              <School size={14} />
              <span>{isFr ? 'Présentation du Programme' : 'Program Overview'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFr ? 'Qu\'est-ce que le Programme Ambassadeur Élève ?' : 'What is the Edulpha Student Ambassador Program?'}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              {isFr
                ? 'Un programme d\'excellence qui donne le pouvoir aux élèves du secondaire de devenir des leaders de l\'apprentissage numérique dans leurs établissements scolaires.'
                : 'A flagship leadership initiative empowering secondary school students to become digital learning champions and academic mentors in their schools.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
                titleEn: 'Empower Student Leaders',
                titleFr: 'Responsabiliser les Élèves Leaders',
                descEn: 'Empowers secondary school students to step up, build confidence, and take charge of peer learning.',
                descFr: 'Permet aux élèves de développer leur leadership, leur confiance en soi et de guider leurs camarades.'
              },
              {
                icon: BookOpen,
                color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
                titleEn: 'Discover Edulpha',
                titleFr: 'Faire Découvrir Edulpha',
                descEn: 'Helps classmates access interactive practical labs, GCE/Baccalauréat past papers, and AI study tutors.',
                descFr: 'Aide les camarades à accéder aux travaux pratiques interactifs, aux épreuves corrigées et aux tuteurs IA.'
              },
              {
                icon: Zap,
                color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
                titleEn: 'Promote Study Habits',
                titleFr: 'Promouvoir de Bonnes Habitudes',
                descEn: 'Encourages structured revision schedules, collaborative study circles, and exam readiness.',
                descFr: 'Encourage des plannings de révision structurés, des groupes d\'étude et la préparation méthodique.'
              },
              {
                icon: ShieldCheck,
                color: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
                titleEn: 'Represent Your School',
                titleFr: 'Représenter Votre Établissement',
                descEn: 'Serves as the official liaison between Edulpha learning technology and your school community.',
                descFr: 'Sert de liaison officielle entre la technologie éducative Edulpha et la communauté scolaire.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-lg font-black text-white">
                  {isFr ? item.titleFr : item.titleEn}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {isFr ? item.descFr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT AMBASSADOR MISSION SECTION */}
      <section className="py-16 bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border-b border-slate-800/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest">
            <Target size={14} />
            <span>{isFr ? 'Notre Mission' : 'Our Mission'}</span>
          </div>

          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug max-w-4xl mx-auto">
            "{isFr
              ? 'Donner aux élèves les moyens de soutenir leurs camarades, de promouvoir l\'apprentissage numérique et de créer des communautés d\'apprentissage plus fortes dans les écoles au Cameroun et en Afrique.'
              : 'To empower students to support their classmates, promote digital learning, and create stronger learning communities in schools across Cameroon and Africa.'}"
          </blockquote>
        </div>
      </section>

      {/* RESPONSIBILITIES SECTION */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-400/20">
              <Layers size={14} />
              <span>{isFr ? 'Missions & Responsabilités' : 'Key Responsibilities'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFr ? 'Ce que Fait un Ambassadeur' : 'What You Will Do as an Ambassador'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isFr ? 'Trois piliers fondamentaux pour impacter positivement votre lycée' : 'Three key roles designed to transform how learning happens in your school'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center font-black">
                  <Users size={28} />
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Recrutement & Orientation' : 'Student Recruitment'}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {isFr 
                    ? 'Aidez vos camarades de classe à rejoindre Edulpha et à profiter des ressources de révision.' 
                    : 'Introduce Edulpha to classmates and help them register to boost their exam preparations.'}
                </p>
                <ul className="space-y-2.5 pt-2 text-xs font-bold text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Présenter Edulpha en classe' : 'Introduce Edulpha to classmates'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Encourager l\'inscription gratuite' : 'Encourage students to register'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Partager votre code de parrainage unique' : 'Share your ambassador referral code'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Guider les premiers pas sur la plateforme' : 'Help students start using the platform'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-400/10 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-black">
                  <School size={28} />
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Promotion dans l\'Établissement' : 'School Promotion'}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {isFr 
                    ? 'Faites rayonner l\'innovation éducative au sein de votre lycée.' 
                    : 'Create active awareness and organize academic events with your schoolmates.'}
                </p>
                <ul className="space-y-2.5 pt-2 text-xs font-bold text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                    <span>{isFr ? 'Créer de la visibilité pour Edulpha' : 'Create awareness about Edulpha'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                    <span>{isFr ? 'Partager les annonces d\'examens blancs' : 'Share learning opportunities'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                    <span>{isFr ? 'Soutenir les campagnes éducatives' : 'Support school campaigns'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                    <span>{isFr ? 'Aider à organiser des activités élèves' : 'Help organize student activities'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-black">
                  <Heart size={28} />
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Entraide & Communauté' : 'Student Community Support'}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {isFr 
                    ? 'Soyez le mentor et le soutien sur lequel vos camarades peuvent compter.' 
                    : 'Foster study groups and support new users in mastering difficult subjects.'}
                </p>
                <ul className="space-y-2.5 pt-2 text-xs font-bold text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{isFr ? 'Accueillir et guider les nouveaux utilisateurs' : 'Help new users get started'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{isFr ? 'Encourager les groupes de travail' : 'Encourage peer study groups'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{isFr ? 'Partager des ressources utiles' : 'Share useful learning resources'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{isFr ? 'Motiver les élèves en difficulté' : 'Motivate and encourage classmates'}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-400/20">
              <Gift size={14} />
              <span>{isFr ? 'Avantages du Programme' : 'Program Benefits'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFr ? 'Pourquoi Devenir Ambassadeur Élève ?' : 'Why You Should Join As an Ambassador'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isFr ? 'Développez des compétences précieuses pour votre avenir académique et professionnel' : 'Unlock leadership skills, exclusive educational perks, official credentials, and rewards'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                title: isFr ? 'Expérience de Leadership' : 'Leadership Experience',
                bullet1: isFr ? 'Compétences en communication' : 'Communication skills',
                bullet2: isFr ? 'Travail d\'équipe' : 'Teamwork & coordination',
                bullet3: isFr ? 'Capacité de prise de parole' : 'Leadership abilities'
              },
              {
                icon: Zap,
                title: isFr ? 'Avantages d\'Apprentissage' : 'Learning Advantages',
                bullet1: isFr ? 'Accès gratuit aux ressources' : 'Full access to learning resources',
                bullet2: isFr ? 'Accès anticipé aux fonctionnalités' : 'Early access to new features',
                bullet3: isFr ? 'Opportunités éducatives' : 'Special educational opportunities'
              },
              {
                icon: Award,
                title: isFr ? 'Reconnaissance Officielle' : 'Official Recognition',
                bullet1: isFr ? 'Certificat officiel Ambassadeur' : 'Official Edulpha Ambassador Certificate',
                bullet2: isFr ? 'Badge numérique vérifié' : 'Verified Digital Leader Badge',
                bullet3: isFr ? 'Lettre de recommandation' : 'Student Leader distinction'
              },
              {
                icon: Gift,
                title: isFr ? 'Récompenses & Gratifications' : 'Rewards & Incentives',
                bullet1: isFr ? 'Soutien forfaits internet / crédit' : 'Data & airtime support',
                bullet2: isFr ? 'Cadeaux et fournitures scolaires' : 'Merchandise & school packs',
                bullet3: isFr ? 'Prix d\'excellence selon l\'impact' : 'Special rewards for top performance'
              }
            ].map((benefit, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 hover:border-amber-400/40 transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center">
                  <benefit.icon size={22} />
                </div>
                <h3 className="text-xl font-black text-white">{benefit.title}</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-400 shrink-0" />
                    <span>{benefit.bullet1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-400 shrink-0" />
                    <span>{benefit.bullet2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-400 shrink-0" />
                    <span>{benefit.bullet3}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REWARD SYSTEM SECTION */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-400/20">
              <Trophy size={14} />
              <span>{isFr ? 'Système de Récompenses' : 'Ambassador Tier System'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFr ? 'Montez en Niveau selon Votre Impact' : 'Earn Rewards Based on Your Contribution'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isFr ? 'Chaque camarade inscrit avec votre code vous fait gravir les échelons' : 'Track your recruited students and unlock tier benefits as your impact grows'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Bronze */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-amber-800/40 hover:border-amber-700/60 transition space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/40 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-700/50">
                  Bronze Level
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Ambassadeur Bronze' : 'Bronze Student Ambassador'}
                </h3>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-200">
                  {isFr ? 'Condition: 10 élèves inscrits' : 'Requirement: 10 registered students'}
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                    <span>{isFr ? 'Certificat d\'Ambassadeur Bronze' : 'Official Ambassador Certificate'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                    <span>{isFr ? 'Badge numérique Bronze sur profil' : 'Bronze Student Leader Badge'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                    <span>{isFr ? 'Accès aux ressources de révision' : 'Full access to revision library'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Silver */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-600/50 hover:border-slate-400 transition space-y-6 flex flex-col justify-between relative shadow-2xl">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-300 text-slate-950 text-xs font-black uppercase tracking-wider">
                  Silver Level
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Ambassadeur Argent' : 'Silver Student Ambassador'}
                </h3>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200">
                  {isFr ? 'Condition: 25 élèves inscrits' : 'Requirement: 25 registered students'}
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-slate-300 shrink-0" />
                    <span>{isFr ? 'Tous les avantages Bronze' : 'All Bronze tier benefits'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-slate-300 shrink-0" />
                    <span>{isFr ? 'Soutien forfait internet / crédit d\'appel' : 'Monthly data & airtime support'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-slate-300 shrink-0" />
                    <span>{isFr ? 'Reconnaissance officielle dans le lycée' : 'Featured student recognition'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-slate-300 shrink-0" />
                    <span>{isFr ? 'Fournitures scolaires Edulpha' : 'Edulpha learning gift pack'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Gold */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/60 border-2 border-amber-400 shadow-2xl space-y-6 flex flex-col justify-between relative transform hover:-translate-y-1 transition">
              <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                TOP TIER
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                  Gold Level
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isFr ? 'Ambassadeur Or' : 'Gold Student Ambassador'}
                </h3>
                <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs font-bold text-amber-300">
                  {isFr ? 'Condition: 50+ élèves inscrits' : 'Requirement: 50+ registered students'}
                </div>
                <ul className="space-y-2.5 text-xs text-amber-100 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Prix spéciaux & récompensés d\'excellence' : 'Special prizes & academic awards'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Reconnaissance de leadership régionale' : 'Regional leadership distinction'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Opportunités prioritaires & Bourses' : 'Priority scholarship & event invites'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>{isFr ? 'Invitation aux ateliers de leadership Edulpha' : 'Invitation to VIP leadership summits'}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STUDENT LEADER SHOWCASE SECTION */}
      <section id="leaders" className="py-20 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-400/20">
              <Users size={14} />
              <span>{isFr ? 'Nos Leaders Élèves' : 'Our Student Leaders'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFr ? 'Rencontrez Nos Ambassadeurs Élèves' : 'Our Student Ambassadors'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isFr ? 'Des élèves passionnés qui guident leurs établissements à travers le Cameroun' : 'Discover motivated secondary school students inspiring excellence across Cameroon'}
            </p>
          </div>

          {/* Controls: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={isFr ? "Rechercher un nom, lycée..." : "Search ambassador or school..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="all">{isFr ? 'Toutes les Régions' : 'All Regions'}</option>
                {availableRegions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="all">{isFr ? 'Tous les Niveaux' : 'All Tiers'}</option>
                <option value="gold">Gold Ambassadors</option>
                <option value="silver">Silver Ambassadors</option>
                <option value="bronze">Bronze Ambassadors</option>
              </select>
            </div>
          </div>

          {/* Profile Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm font-bold animate-pulse">
              {isFr ? 'Chargement des profils ambassadeurs...' : 'Loading student leaders...'}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Users size={32} className="mx-auto text-slate-600" />
              <div className="text-white font-bold">{isFr ? 'Aucun ambassadeur trouvé' : 'No ambassadors found matching criteria'}</div>
              <p className="text-slate-400 text-xs">{isFr ? 'Essayez de modifier votre recherche ou vos filtres.' : 'Try adjusting your search terms or filters.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProfiles.map(prof => (
                <div 
                  key={prof.id} 
                  className="rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition overflow-hidden shadow-xl flex flex-col justify-between group"
                >
                  <div className="p-6 space-y-4">
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="relative">
                        <img 
                          src={prof.photo} 
                          alt={prof.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/40 group-hover:scale-105 transition"
                        />
                        <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-slate-900 border border-slate-800">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          prof.level === 'gold' 
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                            : prof.level === 'silver'
                            ? 'bg-slate-300/20 text-slate-200 border-slate-400/40'
                            : 'bg-amber-900/30 text-amber-400 border-amber-800/40'
                        }`}>
                          {prof.level} Ambassador
                        </span>
                        <div className="text-[11px] font-bold text-emerald-400 mt-1">
                          {prof.recruitedCount} {isFr ? 'élèves parrainés' : 'students recruited'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition">{prof.name}</h3>
                      <div className="text-xs font-semibold text-amber-200/90 flex items-center gap-1.5 mt-0.5">
                        <School size={13} className="shrink-0" />
                        <span>{prof.school}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin size={12} className="shrink-0" />
                        <span>{prof.schoolLocation} • {prof.region}</span>
                      </div>
                    </div>

                    <div className="inline-block px-2.5 py-1 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 border border-slate-800">
                      🎓 {prof.classLevel}
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      "{prof.bio}"
                    </p>

                    {/* Subjects Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {prof.subjects.map((sub, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] font-semibold text-slate-400 border border-slate-800">
                          {sub}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Referral Code Footer */}
                  <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">{isFr ? 'Code Parrainage:' : 'Referral Code:'}</span>
                    <span className="font-mono font-black text-amber-400">{prof.referralCode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-400/20">
              <ImageIcon size={14} />
              <span>{isFr ? 'Galerie d\'Activités' : 'Student Ambassador Gallery'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {isFr ? 'L\'Impact des Ambassadeurs en Images' : 'Ambassador Events & School Activities'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isFr ? 'Aperçu des séances d\'étude, présentations et ateliers organisés dans nos lycées' : 'A glimpse into real study marathons, school orientations, and student leadership events'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gallery.map(item => (
              <div 
                key={item.id}
                onClick={() => setActiveGalleryItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer hover:border-amber-400/50 transition shadow-xl"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition" />
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <div className="inline-block px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    {item.category.replace('_', ' ')}
                  </div>
                  <h3 className="text-xs font-black text-white line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] text-slate-300 font-medium">{item.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION CALL TO ACTION SECTION */}
      <section className="py-20 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black mx-auto shadow-2xl shadow-amber-500/30">
            <Sparkles size={32} className="fill-slate-950" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isFr ? 'Prêt à Devenir un Leader dans Votre Établissement ?' : 'Ready to Become a Leader in Your School?'}
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            {isFr 
              ? 'Rejoignez Edulpha et aidez vos camarades de classe à accéder à de meilleures opportunités d\'apprentissage et de révision.' 
              : 'Join Edulpha and help your classmates access better learning opportunities, past-paper solutions, and interactive practical labs.'}
          </p>

          <div>
            <button
              onClick={() => { setShowApplyModal(true); setFormStep(1); setSubmitSuccess(false); }}
              className="px-10 py-5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/30 transition transform hover:-translate-y-1 inline-flex items-center gap-3"
            >
              <Sparkles size={18} className="fill-slate-950" />
              <span>{isFr ? 'Remplir le Formulaire de Candidature' : 'Apply Now'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeGalleryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
              <button 
                onClick={() => setActiveGalleryItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X size={20} />
              </button>

              <img 
                src={activeGalleryItem.imageUrl} 
                alt={activeGalleryItem.title} 
                className="w-full h-80 object-cover rounded-2xl"
              />

              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  {activeGalleryItem.category}
                </span>
                <h3 className="text-xl font-black text-white">{activeGalleryItem.title}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{activeGalleryItem.description}</p>
                <div className="flex items-center justify-between pt-2 text-[11px] font-bold text-slate-400 border-t border-slate-800">
                  <span>{activeGalleryItem.school}</span>
                  <span>{activeGalleryItem.date}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MULTI-STEP APPLICATION FORM MODAL */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
            <div className="relative max-w-2xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
              
              <button 
                onClick={() => setShowApplyModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>

              {!submitSuccess ? (
                <div className="space-y-6">
                  
                  {/* Modal Header */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                      <Sparkles size={14} /> {isFr ? 'Candidature Ambassadeur Élève' : 'Student Ambassador Application'}
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      {isFr ? 'Rejoignez le Programme Leader' : 'Apply to Become a Student Ambassador'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {isFr ? 'Étape' : 'Step'} {formStep} {isFr ? 'sur' : 'of'} 4
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{ width: `${(formStep / 4) * 100}%` }}
                    />
                  </div>

                  <form onSubmit={handleSubmitApplication} className="space-y-6">
                    
                    {/* STEP 1: PERSONAL INFORMATION */}
                    {formStep === 1 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                          1. {isFr ? 'Informations Personnelles' : 'Personal Information'}
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isFr ? 'Nom et Prénom *' : 'Full Name *'}
                          </label>
                          <input 
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. John Doe / Brenda Nchang"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Genre *' : 'Gender *'}
                            </label>
                            <select
                              value={formData.gender}
                              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            >
                              <option value="male">{isFr ? 'Masculin' : 'Male'}</option>
                              <option value="female">{isFr ? 'Féminin' : 'Female'}</option>
                              <option value="other">{isFr ? 'Autre' : 'Other'}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Date de Naissance *' : 'Date of Birth *'}
                            </label>
                            <input 
                              type="date"
                              required
                              value={formData.dob}
                              onChange={e => setFormData({ ...formData, dob: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Numéro de Téléphone *' : 'Phone Number *'}
                            </label>
                            <input 
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+237 670 00 00 00"
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Numéro WhatsApp *' : 'WhatsApp Number *'}
                            </label>
                            <input 
                              type="tel"
                              required
                              value={formData.whatsapp}
                              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                              placeholder="+237 670 00 00 00"
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Email (Optionnel)' : 'Email (Optional)'}
                            </label>
                            <input 
                              type="email"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                              placeholder="student@example.com"
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Ville / Localité *' : 'Location / City *'}
                            </label>
                            <input 
                              type="text"
                              required
                              value={formData.location}
                              onChange={e => setFormData({ ...formData, location: e.target.value })}
                              placeholder="e.g. Buea, Yaoundé, Bamenda, Douala"
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                      </div>
                    )}

                    {/* STEP 2: SCHOOL INFORMATION */}
                    {formStep === 2 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                          2. {isFr ? 'Informations Scolaires' : 'School Information'}
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isFr ? 'Nom de l\'Établissement / Lycée *' : 'School Name *'}
                          </label>
                          <input 
                            type="text"
                            required
                            value={formData.schoolName}
                            onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                            placeholder="e.g. GBHS Buea Town / Lycée Général Leclerc"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Région *' : 'Region *'}
                            </label>
                            <select
                              value={formData.region}
                              onChange={e => setFormData({ ...formData, region: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                            >
                              <option value="Centre Region">Centre Region</option>
                              <option value="Littoral Region">Littoral Region</option>
                              <option value="South West Region">South West Region</option>
                              <option value="North West Region">North West Region</option>
                              <option value="West Region">West Region</option>
                              <option value="North Region">North Region</option>
                              <option value="Far North Region">Far North Region</option>
                              <option value="Adamawa Region">Adamawa Region</option>
                              <option value="South Region">South Region</option>
                              <option value="East Region">East Region</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                              {isFr ? 'Classe Actuelle *' : 'Class Level *'}
                            </label>
                            <select
                              value={formData.classLevel}
                              onChange={e => setFormData({ ...formData, classLevel: e.target.value as AmbassadorClassLevel })}
                              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
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
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isFr ? 'Matières Étudiées (séparées par des virgules) *' : 'Subjects Studied (separated by commas) *'}
                          </label>
                          <input 
                            type="text"
                            required
                            value={formData.subjects}
                            onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                            placeholder="e.g. Physics, Pure Maths, Chemistry, Further Maths"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                      </div>
                    )}

                    {/* STEP 3: MOTIVATION */}
                    {formStep === 3 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                          3. {isFr ? 'Motivation & Idées' : 'Motivation & Ideas'}
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isFr ? 'Pourquoi voulez-vous devenir un Ambassadeur Élève Edulpha ? *' : 'Why do you want to become an Edulpha Student Ambassador? *'}
                          </label>
                          <textarea 
                            required
                            rows={3}
                            value={formData.motivationWhy}
                            onChange={e => setFormData({ ...formData, motivationWhy: e.target.value })}
                            placeholder={isFr ? "Expliquez ce qui vous motive..." : "Explain what drives your passion to represent Edulpha..."}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isFr ? 'Quelles idées avez-vous pour aider les élèves de votre école ? *' : 'What ideas do you have for helping students in your school? *'}
                          </label>
                          <textarea 
                            required
                            rows={3}
                            value={formData.motivationIdeas}
                            onChange={e => setFormData({ ...formData, motivationIdeas: e.target.value })}
                            placeholder={isFr ? "Ex. Organiser des révisions le week-end, partager le code lors des rassemblements..." : "e.g. Organizing weekend GCE revision circles, sharing during morning assembly..."}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                      </div>
                    )}

                    {/* STEP 4: SKILLS & COMMITMENT */}
                    {formStep === 4 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                          4. {isFr ? 'Compétences & Engagement' : 'Skills & Commitment'}
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-2">
                            {isFr ? 'Sélectionnez vos compétences principales:' : 'Select your key skills:'}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              'Leadership', 
                              'Communication', 
                              'Social media', 
                              'Teaching others', 
                              'Content creation', 
                              'Technology'
                            ].map(skill => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleSkillToggle(skill)}
                                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                                  formData.skills.includes(skill)
                                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <span>{skill}</span>
                                {formData.skills.includes(skill) && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isFr ? 'Combien d\'heures par semaine pouvez-vous consacrer ? *' : 'How many hours can you dedicate weekly? *'}
                          </label>
                          <select
                            value={formData.weeklyHours}
                            onChange={e => setFormData({ ...formData, weeklyHours: e.target.value as any })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                          >
                            <option value="1-2 hours">1-2 {isFr ? 'heures / semaine' : 'hours / week'}</option>
                            <option value="3-5 hours">3-5 {isFr ? 'heures / semaine' : 'hours / week'}</option>
                            <option value="More than 5 hours">{isFr ? 'Plus de 5 heures / semaine' : 'More than 5 hours / week'}</option>
                          </select>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              required
                              checked={formData.agreedToTerms}
                              onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                              className="mt-1 rounded accent-amber-400"
                            />
                            <span className="text-xs text-slate-300 font-semibold leading-relaxed">
                              {isFr 
                                ? 'Je m\'engage à représenter Edulpha avec intégrité, à soutenir mes camarades de classe et à participer activement aux initiatives éducatives.' 
                                : 'I commit to representing Edulpha positively, supporting my classmates in learning, and actively participating in school ambassador activities.'}
                            </span>
                          </label>
                        </div>

                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      {formStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setFormStep(prev => prev - 1)}
                          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                        >
                          {isFr ? 'Précédent' : 'Back'}
                        </button>
                      ) : <div />}

                      {formStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (formStep === 1 && (!formData.fullName || !formData.phone)) {
                              alert(isFr ? 'Veuillez remplir votre nom et téléphone' : 'Please fill full name and phone number');
                              return;
                            }
                            if (formStep === 2 && !formData.schoolName) {
                              alert(isFr ? 'Veuillez indiquer le nom de votre établissement' : 'Please fill school name');
                              return;
                            }
                            if (formStep === 3 && (!formData.motivationWhy || !formData.motivationIdeas)) {
                              alert(isFr ? 'Veuillez répondre aux questions de motivation' : 'Please answer motivation questions');
                              return;
                            }
                            setFormStep(prev => prev + 1);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
                        >
                          <span>{isFr ? 'Suivant' : 'Next'}</span>
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <span>{isFr ? 'Envoi en cours...' : 'Submitting...'}</span>
                          ) : (
                            <>
                              <Send size={14} />
                              <span>{isFr ? 'Soumettre ma Candidature' : 'Submit Application'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </form>
                </div>
              ) : (
                /* SUCCESS CONFIRMATION MODAL STATE */
                <div className="py-8 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/40">
                    <CheckCircle2 size={44} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      {isFr ? 'Candidature Transmise avec Succès !' : 'Application Submitted Successfully!'}
                    </h3>
                    <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                      {isFr
                        ? 'Merci d\'avoir postulé au Programme Ambassadeur Élève Edulpha. Notre équipe examinera votre profil sous 48 heures.'
                        : 'Thank you for applying to become an Edulpha Student Ambassador. Our school review team will evaluate your profile within 48 hours.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 max-w-md mx-auto text-xs">
                    <div className="font-bold text-amber-400">{isFr ? 'Prochaines Étapes:' : 'What Happens Next:'}</div>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• {isFr ? 'Validation de votre dossier scolaire' : 'Review of your school application details'}</li>
                      <li>• {isFr ? 'Attribution de votre code parrainage unique' : 'Generation of your ambassador referral code'}</li>
                      <li>• {isFr ? 'Prise de contact via WhatsApp' : 'Welcome message via WhatsApp from our regional coordinator'}</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition"
                  >
                    {isFr ? 'Fermer' : 'Close'}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-950 text-slate-400 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 text-white font-black">
            <Sparkles size={16} className="text-amber-400" />
            <span>EDULPHA STUDENT AMBASSADOR PROGRAM</span>
          </div>
          <p>© 2026 Edulpha Learning Systems. Empowering Next-Generation Leaders Across Africa.</p>
        </div>
      </footer>

    </div>
  );
}
