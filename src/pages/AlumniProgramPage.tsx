import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Users, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, 
  GraduationCap, Briefcase, Globe, Heart, Star, BookOpen, Send, 
  Search, Filter, ExternalLink, X, Image as ImageIcon, ChevronRight, Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { AlumniProfile, AlumniGalleryItem, AlumniStats, AlumniApplication } from '../types/alumni';
import { AlumniService } from '../services/alumniService';
import { Button, Card, Badge, cn } from '../components/ui';
import { toast } from 'react-hot-toast';

export default function AlumniProgramPage() {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState<AlumniStats>({
    totalMembers: 75,
    partnerUniversities: 18,
    studentsMentored: 1250,
    impactRate: '98.5%'
  });
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [gallery, setGallery] = useState<AlumniGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const [selectedGalleryCat, setSelectedGalleryCat] = useState<string>('all');

  // Lightbox Modal
  const [activeGalleryImage, setActiveGalleryImage] = useState<AlumniGalleryItem | null>(null);

  // Application Modal & Form
  const [showAppModal, setShowAppModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appForm, setAppForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    graduationYear: 2022,
    subSystem: 'General Education',
    school: '',
    currentRole: '',
    companyOrUniversity: '',
    specialization: '',
    motivation: '',
    linkedin: '',
    photoUrl: '',
    consentGranted: false
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [sData, pData, gData] = await Promise.all([
          AlumniService.getAlumniStats(),
          AlumniService.getPublicAlumniProfiles(),
          AlumniService.getAlumniGallery()
        ]);
        setStats(sData);
        setProfiles(pData);
        setGallery(gData);
      } catch (err) {
        console.error('Error fetching alumni page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.fullName || !appForm.email || !appForm.school || !appForm.currentRole || !appForm.motivation) {
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.');
      return;
    }

    if (!appForm.consentGranted) {
      toast.error(language === 'fr' ? 'Le consentement pour la publication est obligatoire.' : 'Consent to public profile display is required.');
      return;
    }

    setSubmitting(true);
    try {
      await AlumniService.submitApplication({
        fullName: appForm.fullName,
        email: appForm.email,
        phone: appForm.phone,
        graduationYear: appForm.graduationYear,
        subSystem: appForm.subSystem,
        school: appForm.school,
        currentRole: appForm.currentRole,
        companyOrUniversity: appForm.companyOrUniversity,
        specialization: appForm.specialization,
        motivation: appForm.motivation,
        linkedin: appForm.linkedin,
        photoUrl: appForm.photoUrl,
        consentGranted: appForm.consentGranted
      });

      toast.success(
        language === 'fr'
          ? 'Candidature soumise avec succès ! Notre équipe examinera votre profil sous peu.'
          : 'Application submitted successfully! Our committee will review your profile shortly.'
      );
      setShowAppModal(false);
      setAppForm({
        fullName: '',
        email: '',
        phone: '',
        graduationYear: new Date().getFullYear(),
        subSystem: 'General Education',
        school: '',
        currentRole: '',
        companyOrUniversity: '',
        specialization: '',
        motivation: '',
        linkedin: '',
        photoUrl: '',
        consentGranted: false
      });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(language === 'fr' ? 'Erreur lors de l\'envoi de la candidature.' : 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSub = selectedSubsystem === 'all' || p.subSystem === selectedSubsystem;
    return matchesSearch && matchesSub;
  });

  const filteredGallery = selectedGalleryCat === 'all'
    ? gallery
    : gallery.filter(g => g.category.toLowerCase() === selectedGalleryCat.toLowerCase());

  const featuredProfiles = profiles.filter(p => p.featured);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <SEO 
        title="Edulpha Alumni Program | Empowering Next-Gen Leaders Across Africa"
        description="Join the Edulpha Alumni Leaders Network. Mentoring Cameroonian and African students across General, Technical, TVEE, Commercial, and Baccalauréat curriculum pathways."
        keywords="Edulpha Alumni, Mentorship Cameroon, GCE Alumni, Baccalauréat Leadership, TVEE Leaders, STEM Cameroon"
      />

      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-28 px-6 overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 border-b border-indigo-900/30">
        {/* Ambient Lights */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 font-bold text-xs"
              >
                <Award size={16} className="text-amber-400" />
                <span>{language === 'fr' ? 'Réseau d\'Élite des Anciens Élèves' : 'Official Edulpha Alumni Network'}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight"
              >
                {language === 'fr' ? (
                  <>Devenez un Leader <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-300 to-emerald-400">Alumni Edulpha</span></>
                ) : (
                  <>Become an <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-300 to-emerald-400">Edulpha Alumni</span> Leader</>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                {language === 'fr' 
                  ? 'Vous avez fait partie de l\'aventure d\'apprentissage. Aidez maintenant la prochaine génération d\'élèves et d\'étudiants à réussir dans leurs examens et parcours professionnels.'
                  : 'You were part of the learning journey. Now help the next generation of students succeed across GCE, TVEE, Commercial, and Baccalauréat systems.'}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Button
                  onClick={() => setShowAppModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group"
                >
                  <span>{language === 'fr' ? 'Postuler au Réseau Alumni' : 'Apply to Join Alumni Network'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>

                <a href="#alumni-leaders">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white font-bold text-sm px-7 py-4 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Users size={18} className="text-emerald-400" />
                    <span>{language === 'fr' ? 'Explorer les Leaders' : 'Explore Alumni Leaders'}</span>
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Right Hero Graphic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative p-3 bg-gradient-to-b from-indigo-500/20 via-slate-900 to-slate-950 rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden">
                <div className="p-6 bg-slate-900 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <span className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                      <Star size={14} fill="currentColor" /> {language === 'fr' ? 'Alumni Vedettes' : 'Featured Alumni Leader'}
                    </span>
                    <Badge variant="success" className="text-[10px] uppercase">Verified Mentor</Badge>
                  </div>

                  {featuredProfiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={featuredProfiles[0].photoUrl}
                          alt={featuredProfiles[0].name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                        />
                        <div>
                          <h3 className="text-base font-black text-white">{featuredProfiles[0].name}</h3>
                          <p className="text-xs text-indigo-300 font-bold">{featuredProfiles[0].currentRole}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{featuredProfiles[0].companyOrUniversity}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic bg-slate-850 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        "{featuredProfiles[0].bio}"
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {featuredProfiles[0].badges.map((b, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-800">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Key Impact Counter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-900">
            {[
              { label: language === 'fr' ? 'Membres Alumni Vérifiés' : 'Verified Alumni Leaders', value: `${stats.totalMembers}+`, icon: Users, color: 'text-indigo-400' },
              { label: language === 'fr' ? 'Universités & Entreprises' : 'Partner Universities & Hubs', value: `${stats.partnerUniversities}+`, icon: Globe, color: 'text-emerald-400' },
              { label: language === 'fr' ? 'Élèves Mentorés / An' : 'Students Mentored Annually', value: `${stats.studentsMentored}+`, icon: GraduationCap, color: 'text-amber-400' },
              { label: language === 'fr' ? 'Taux de Satisfaction' : 'Mentorship Impact Rate', value: stats.impactRate, icon: Heart, color: 'text-rose-400' },
            ].map((st, i) => (
              <div key={i} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                <st.icon className={cn("w-6 h-6", st.color)} />
                <div className="text-3xl font-black text-white tracking-tight">{st.value}</div>
                <div className="text-xs font-medium text-slate-400">{st.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. WHAT IS THE ALUMNI PROGRAM? */}
      <section className="py-24 px-6 bg-slate-900/60 relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 font-bold text-xs">
              <Sparkles size={16} />
              <span>{language === 'fr' ? 'Mission & Vision' : 'Program Mission & Vision'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'fr' ? 'Qu\'est-ce que le Programme Alumni Edulpha ?' : 'What is the Edulpha Alumni Program?'}
            </h2>
            <p className="text-slate-400 font-medium text-base sm:text-lg leading-relaxed">
              {language === 'fr' 
                ? 'Le programme Alumni Edulpha rassemble les anciens étudiants et lauréats qui ont excellé dans les sous-systèmes d\'enseignement Général, Technique, Commercial et Baccalauréat au Cameroun et en Afrique.'
                : 'The Edulpha Alumni Program connects high-achieving graduates from General, Technical, TVEE, Commercial, and Baccalauréat subsystems with active students to provide mentorship, career orientation, and exam preparation excellence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black">
                01
              </div>
              <h3 className="text-xl font-black text-white">Mentorship & Guidance</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Connect one-on-one with high school candidates facing GCE O/A Levels, TVEE exams, or Baccalauréat, providing proven study techniques and emotional support.
              </p>
            </div>

            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black">
                02
              </div>
              <h3 className="text-xl font-black text-white">Career Pathways & STEM</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Guide students into top universities, technical institutes, software engineering hubs, medical faculties, and entrepreneurial ventures.
              </p>
            </div>

            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black">
                03
              </div>
              <h3 className="text-xl font-black text-white">Community & Giving Back</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Participate in book drives, rural school tablet distributions, interactive Q&A webinars, and regional educational summits across Africa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALUMNI BENEFITS */}
      <section className="py-24 px-6 relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>{language === 'fr' ? 'Avantages Exclusifs' : 'Exclusive Alumni Benefits'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'fr' ? 'Pourquoi rejoindre le réseau Alumni ?' : 'Why Join the Edulpha Alumni Network?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Networking & Career Growth',
                desc: 'Connect with senior engineers, medical doctors, finance executives, and researchers working across global tech hubs and universities.',
                icon: Briefcase,
                color: 'text-indigo-400'
              },
              {
                title: 'Mentorship Opportunities',
                desc: 'Give back directly to students from your alma mater, guiding them through tough exam sessions and university entrance applications.',
                icon: Heart,
                color: 'text-rose-400'
              },
              {
                title: 'Official Alumni Leader Badge',
                desc: 'Receive a verified digital credential and badge on your Edulpha profile and LinkedIn highlighting your mentorship contributions.',
                icon: ShieldCheck,
                color: 'text-emerald-400'
              },
              {
                title: 'Keynote & Panel Opportunities',
                desc: 'Speak at regional Edulpha summits, live webinars, and academic orientation panels for high school candidates.',
                icon: Users,
                color: 'text-amber-400'
              },
              {
                title: 'Early Access to AI & Tools',
                desc: 'Get exclusive access to pre-release Edulpha AI tools, teacher studio features, and digital exam creation engines.',
                icon: Sparkles,
                color: 'text-purple-400'
              },
              {
                title: 'Alumni Directory Visibility',
                desc: 'Feature on the public Edulpha Alumni Leaders directory, building your personal brand as an educational champion.',
                icon: Globe,
                color: 'text-sky-400'
              }
            ].map((ben, i) => (
              <div key={i} className="p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition group">
                <ben.icon className={cn("w-8 h-8", ben.color)} />
                <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">{ben.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{ben.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ALUMNI JOURNEY TIMELINE */}
      <section className="py-24 px-6 bg-slate-900/40 relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'fr' ? 'Le Parcours de l\'Alumni Edulpha' : 'The Edulpha Alumni Journey'}
            </h2>
            <p className="text-slate-400 font-medium text-base">From student learner to community mentor in four clear steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 'Step 1', title: 'Learn & Excel', desc: 'Prepare for GCE, TVEE, or Baccalauréat using Edulpha AI and past papers.' },
              { step: 'Step 2', title: 'Achieve Success', desc: 'Graduate with high scores and enter top university or industry pathways.' },
              { step: 'Step 3', title: 'Apply to Alumni', desc: 'Submit your profile and consent to mentor aspiring candidates.' },
              { step: 'Step 4', title: 'Inspire Next-Gen', desc: 'Mentor candidates, speak at summits, and shape educational excellence.' },
            ].map((st, i) => (
              <div key={i} className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 relative">
                <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 rounded-md text-[10px] font-black uppercase border border-indigo-800">
                  {st.step}
                </span>
                <h3 className="text-lg font-black text-white">{st.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OUR ALUMNI LEADERS DIRECTORY */}
      <section id="alumni-leaders" className="py-24 px-6 relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 font-bold text-xs">
              <Award size={16} />
              <span>{language === 'fr' ? 'Répertoire des Leaders' : 'Our Verified Alumni Leaders'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'fr' ? 'Découvrez nos Anciens Élèves' : 'Meet Our Alumni Leaders'}
            </h2>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher un alumni, école, spécialité...' : 'Search name, school, role...'}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold outline-none text-white focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedSubsystem('all')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition",
                  selectedSubsystem === 'all' ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                )}
              >
                All Subsystems
              </button>
              <button
                onClick={() => setSelectedSubsystem('General Education')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition",
                  selectedSubsystem === 'General Education' ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                )}
              >
                General Education
              </button>
              <button
                onClick={() => setSelectedSubsystem('Technical & TVEE')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition",
                  selectedSubsystem === 'Technical & TVEE' ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                )}
              >
                Technical & TVEE
              </button>
              <button
                onClick={() => setSelectedSubsystem('Commercial Education')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition",
                  selectedSubsystem === 'Commercial Education' ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                )}
              >
                Commercial
              </button>
            </div>
          </div>

          {/* Profiles Grid */}
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-3xl border border-dashed border-slate-800 space-y-3">
              <Users className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Profiles Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No alumni profiles matched your search criteria. Be the first from your school to join!
              </p>
              <Button onClick={() => setShowAppModal(true)} className="bg-indigo-600 font-bold text-xs mt-2">
                Apply to Join Alumni
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProfiles.map((prof) => (
                <div key={prof.id} className="p-7 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 hover:border-indigo-500/50 transition duration-300 relative group">
                  {prof.featured && (
                    <span className="absolute top-4 right-4 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Featured
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={prof.photoUrl}
                        alt={prof.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                          {prof.subSystem}
                        </span>
                        <h3 className="text-lg font-black text-white leading-snug mt-0.5">{prof.name}</h3>
                        <p className="text-xs text-indigo-300 font-bold">{prof.currentRole}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl space-y-1 text-xs">
                      <div className="text-slate-400 font-medium truncate">{prof.companyOrUniversity}</div>
                      <div className="text-slate-500 text-[11px] font-bold">{prof.school} • Class of '{prof.graduationYear}</div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                      "{prof.bio}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prof.badges.map((badge, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-950 text-indigo-300 text-[10px] font-bold rounded-md border border-slate-800">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified Alumni
                    </span>

                    {/* Show Social link ONLY if consent granted & provided */}
                    {prof.consentGranted && prof.socialLinks?.linkedin ? (
                      <a
                        href={prof.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-white font-bold flex items-center gap-1 transition"
                      >
                        LinkedIn Profile <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                        <Lock size={12} /> Protected Profile
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. ALUMNI GALLERY */}
      <section className="py-24 px-6 bg-slate-900/60 relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 font-bold text-xs">
              <ImageIcon size={16} />
              <span>{language === 'fr' ? 'Galerie de la Communauté' : 'Alumni Events & Impact Gallery'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'fr' ? 'Moments Forts & Sommets' : 'Alumni Moments & Summits'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveGalleryImage(item)}
                className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 cursor-pointer group hover:border-indigo-500/50 transition duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg border border-white/20">
                    {item.category}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-black text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. READY TO MAKE AN IMPACT CTA & APPLICATION BANNER */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto p-10 sm:p-14 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl border border-indigo-500/30 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
            <span className="px-3.5 py-1.5 bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-widest rounded-full border border-amber-400/30 inline-block">
              {language === 'fr' ? 'Rejoignez le Mouvement' : 'Join the Leadership Movement'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'fr' ? 'Prêt à inspirer la prochaine génération ?' : 'Ready to Make an Impact?'}
            </h2>
            <p className="text-indigo-200/90 font-medium text-base sm:text-lg leading-relaxed">
              Apply today to become an accredited Edulpha Alumni Leader. Help high school students conquer their GCE, TVEE, and Baccalauréat exams.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => setShowAppModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm px-9 py-4 rounded-2xl shadow-xl hover:from-amber-300 hover:to-amber-400 transition"
            >
              {language === 'fr' ? 'Soumettre ma Candidature' : 'Apply for Alumni Leadership'}
            </Button>
          </div>
        </div>
      </section>

      <DynamicFooter />

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeGalleryImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-800 overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setActiveGalleryImage(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full z-10"
              >
                <X size={20} />
              </button>

              <div className="h-96 w-full bg-slate-950 overflow-hidden">
                <img
                  src={activeGalleryImage.imageUrl}
                  alt={activeGalleryImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-8 space-y-3">
                <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 text-[10px] font-black uppercase rounded-md border border-indigo-800">
                  {activeGalleryImage.category} Event
                </span>
                <h3 className="text-xl font-black text-white">{activeGalleryImage.title}</h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">{activeGalleryImage.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLICATION MODAL */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-800 shadow-2xl my-8 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black">Edulpha Alumni Leader Application</h3>
                  <p className="text-xs text-slate-400 font-medium">Join our network of educational mentors across Africa.</p>
                </div>
                <button onClick={() => setShowAppModal(false)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={appForm.fullName}
                      onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                      placeholder="e.g. Vanessa Mbella"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      placeholder="vanessa@example.com"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      placeholder="+237 6..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Year of Graduation / Exam *</label>
                    <input
                      type="number"
                      required
                      value={appForm.graduationYear}
                      onChange={(e) => setAppForm({ ...appForm, graduationYear: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Educational Sub-System *</label>
                    <select
                      value={appForm.subSystem}
                      onChange={(e) => setAppForm({ ...appForm, subSystem: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="General Education">General Education (GCE O/A Level)</option>
                      <option value="Technical & TVEE">Technical & TVEE Specialties</option>
                      <option value="Commercial Education">Commercial Education</option>
                      <option value="Baccalauréat & French Sub-System">Baccalauréat & French Sub-System</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">High School / Institution Attended *</label>
                    <input
                      type="text"
                      required
                      value={appForm.school}
                      onChange={(e) => setAppForm({ ...appForm, school: e.target.value })}
                      placeholder="e.g. Lycée Joss or CCAST Bambili"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Current Professional Role / Student Status *</label>
                    <input
                      type="text"
                      required
                      value={appForm.currentRole}
                      onChange={(e) => setAppForm({ ...appForm, currentRole: e.target.value })}
                      placeholder="e.g. PhD Candidate / Software Engineer"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Company / University Name</label>
                    <input
                      type="text"
                      value={appForm.companyOrUniversity}
                      onChange={(e) => setAppForm({ ...appForm, companyOrUniversity: e.target.value })}
                      placeholder="e.g. Google / CMU Africa / CUSS Yaoundé"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Specialization / Field of Expertise</label>
                  <input
                    type="text"
                    value={appForm.specialization}
                    onChange={(e) => setAppForm({ ...appForm, specialization: e.target.value })}
                    placeholder="e.g. Civil Engineering, Computer Science, Cardiology, Finance"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Motivation & How You Would Like to Contribute *</label>
                  <textarea
                    rows={3}
                    required
                    value={appForm.motivation}
                    onChange={(e) => setAppForm({ ...appForm, motivation: e.target.value })}
                    placeholder="Share how you want to mentor high school students or support Edulpha..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={appForm.linkedin}
                      onChange={(e) => setAppForm({ ...appForm, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Profile Photo URL</label>
                    <input
                      type="url"
                      value={appForm.photoUrl}
                      onChange={(e) => setAppForm({ ...appForm, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* MANDATORY PRIVACY CONSENT CHECKBOX */}
                <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-900/50 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={appForm.consentGranted}
                      onChange={(e) => setAppForm({ ...appForm, consentGranted: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 shrink-0"
                    />
                    <span className="text-xs text-slate-200 font-medium leading-relaxed">
                      <strong>Public Display & Data Consent:</strong> I consent to having my profile information, high school details, current professional role, and photo displayed on the public Edulpha Alumni Directory upon committee approval.
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAppModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl shadow-lg"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
