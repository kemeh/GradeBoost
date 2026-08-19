import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, GraduationCap, BookOpen, Layers, Search, RefreshCw, 
  CheckCircle2, Award, ArrowRight, ExternalLink, SlidersHorizontal, 
  Sparkles, FileText, Check, HelpCircle, AlertCircle, Database, LayoutDashboard, Plus, PlayCircle
} from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button, Card } from '../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  getInstitutions, 
  getProgrammes, 
  getProgrammesByInstitution, 
  submitInstitutionRequest, 
  runInstitutionSync,
  saveInstitution,
  saveProgramme,
  Institution, 
  Programme 
} from '../services/institutionService';
import toast from 'react-hot-toast';

export default function HndBtsPortalPage() {
  const { language, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Core State
  const [selectedQual, setSelectedQual] = useState<'HND' | 'BTS'>('HND');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [allProgrammes, setAllProgrammes] = useState<Programme[]>([]);
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
  const [instSearch, setInstSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'institutions' | 'programmes' | 'materials' | 'practicals'>('overview');

  // Modal / Admin States
  const [isNominalModalOpen, setIsNominalModalOpen] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [nominalForm, setNominalForm] = useState({ name: '', city: 'Yaoundé', region: 'Center', programme: '' });
  const [adminInstForm, setAdminInstForm] = useState({ name: '', acronym: '', city: '', region: 'Center', website: '', hnd_available: true, bts_available: true });

  useEffect(() => {
    async function loadData() {
      try {
        const insts = await getInstitutions();
        const progs = await getProgrammes();
        setInstitutions(insts.filter(i => i.is_active !== false));
        setAllProgrammes(progs.filter(p => p.is_active !== false));
      } catch (err) {
        console.error('Failed to load portal databases:', err);
      }
    }
    loadData();
  }, []);

  // Sync registries handler
  const handleInternetSync = async () => {
    setIsSyncing(true);
    try {
      const log = await runInstitutionSync();
      toast.success(
        language === 'fr' 
          ? `Mise à jour réussie : ${log.records_added} ajoutés, ${log.records_updated} modifiés.`
          : `Sync completed: ${log.records_added} added, ${log.records_updated} updated.`
      );
      const insts = await getInstitutions();
      const progs = await getProgrammes();
      setInstitutions(insts.filter(i => i.is_active !== false));
      setAllProgrammes(progs.filter(p => p.is_active !== false));
    } catch (err) {
      toast.error('Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Nominate suggestion handler
  const handleNominate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalForm.name || !nominalForm.city) {
      toast.error('All fields marked * are required.');
      return;
    }
    try {
      await submitInstitutionRequest({
        name: nominalForm.name,
        city: nominalForm.city,
        region: nominalForm.region,
        qualification: selectedQual,
        programme: nominalForm.programme,
        userEmail: user?.email || 'portal-visitor@edulpha.edu.cm'
      });
      toast.success(
        language === 'fr'
          ? 'Suggestion envoyée ! Nous allons vérifier cette institution.'
          : 'Thank you! Custom institution proposal has been logged.'
      );
      setIsNominalModalOpen(false);
      setNominalForm({ name: '', city: 'Yaoundé', region: 'Center', programme: '' });
    } catch (err) {
      toast.error('Failed to submit suggestion.');
    }
  };

  // Admin add custom institution
  const handleAdminAddInst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInstForm.name || !adminInstForm.city) {
      toast.error('Name and City are required.');
      return;
    }
    try {
      await saveInstitution({
        name: adminInstForm.name,
        official_name: adminInstForm.name,
        acronym: adminInstForm.acronym || adminInstForm.name.split(' ').map(w => w[0]).join('').toUpperCase(),
        city: adminInstForm.city,
        region: adminInstForm.region,
        country: 'Cameroon',
        website: adminInstForm.website,
        hnd_available: adminInstForm.hnd_available,
        bts_available: adminInstForm.bts_available,
        verification_status: 'verified',
        is_active: true
      });
      toast.success('New institution verified and added successfully!');
      setIsAdminFormOpen(false);
      // Reload lists
      const insts = await getInstitutions();
      setInstitutions(insts.filter(i => i.is_active !== false));
    } catch (err) {
      toast.error('Failed to save institution.');
    }
  };

  // Filter institutions offering selected qualification
  const filteredInstitutions = institutions.filter(inst => {
    const matchesQual = selectedQual === 'HND' ? inst.hnd_available : inst.bts_available;
    const matchesSearch = inst.name.toLowerCase().includes(instSearch.toLowerCase()) || 
                          inst.city.toLowerCase().includes(instSearch.toLowerCase()) ||
                          (inst.acronym && inst.acronym.toLowerCase().includes(instSearch.toLowerCase()));
    return matchesQual && matchesSearch;
  });

  // Filter programmes for the selected qualification
  const filteredProgrammes = allProgrammes.filter(prog => {
    const matchesQual = prog.qualification_type === selectedQual || prog.qualification_type === 'BOTH';
    const matchesInst = selectedInst ? prog.institution_id === selectedInst.id : true;
    return matchesQual && matchesInst;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO 
        title="Unified HND & BTS Higher Education Portal | Edulpha" 
        description="Access official Cameroon HND & BTS modules, certified practical sessions, past questions, and accredited university directory." 
      />
      <Navbar />

      {/* Hero Portal Header */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-800/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-center md:text-left max-w-3xl">
            <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 px-3 py-1 text-xs uppercase font-black">
              {language === 'fr' ? 'PORTAIL UNIFIÉ DE L\'ENSEIGNEMENT SUPÉRIEUR' : 'UNIFIED PROFESSIONAL HIGHER-EDUCATION PORTAL'}
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white">
              HND / BTS <span className="text-indigo-400">Professional Lab</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {language === 'fr' 
                ? 'Une passerelle centralisée pour les candidats au HND (Higher National Diploma) et BTS (Brevet de Technicien Supérieur) du Cameroun. Explorez les institutions agréées, les épreuves officielles, et les simulations de labos pratiques.' 
                : 'A consolidated gateway for Cameroon Higher National Diploma (HND) and Brevet de Technicien Supérieur (BTS) learners. Explore accredited campuses, official syllabi, past exams, and virtual practical simulators.'}
            </p>
            
            {/* Qualification terms description for French context */}
            {language === 'fr' && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 max-w-md text-left text-[11px] text-slate-300 space-y-1">
                <p className="font-extrabold text-slate-200">Terminologie des certifications professionnelles :</p>
                <p>• <strong className="text-indigo-300">HND</strong> — Higher National Diploma (Sous-système anglophone)</p>
                <p>• <strong className="text-indigo-300">BTS</strong> — Brevet de Technicien Supérieur (Sous-système francophone)</p>
              </div>
            )}
          </div>

          {/* Quick Registration Onboarding Widget */}
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col gap-4 text-slate-800 dark:text-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Fast-Track Setup</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {language === 'fr' ? 'Prêt à vous inscrire ?' : 'Ready to Onboard?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                {language === 'fr' 
                  ? 'Configurez votre niveau, spécialité et établissement pour débloquer votre tableau de bord.' 
                  : 'Configure your target level, specialty, and institution to unlock personalized resources.'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/auth?mode=register&category=hnd')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all"
            >
              <Sparkles size={14} /> {language === 'fr' ? 'S\'enregistrer en HND / BTS' : 'Register for HND / BTS'} <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/subjects')}
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen size={14} className="text-indigo-600" /> {language === 'fr' ? 'Voir tous les cours GCE / Généraux' : 'View General & GCE Courses'}
            </button>
          </div>
        </div>
      </section>

      {/* Qualification Selector Header Bar */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Toggle Switches */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedQual('HND');
                setSelectedInst(null);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                selectedQual === 'HND' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={14} /> HND — Higher National Diploma
            </button>
            <button
              onClick={() => {
                setSelectedQual('BTS');
                setSelectedInst(null);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                selectedQual === 'BTS' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Award size={14} /> BTS — Brevet de Technicien Supérieur
            </button>
          </div>

          {/* Quick sync & suggestion options */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsNominalModalOpen(true)}
              className="text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <Plus size={14} className="mr-1.5 text-indigo-600" /> {language === 'fr' ? 'Suggérer un Établissement' : 'Suggest Institution'}
            </Button>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAdminFormOpen(true)}
                  className="text-xs font-bold rounded-xl border-indigo-200 text-indigo-600"
                >
                  <Plus size={14} className="mr-1.5" /> Add IPES
                </Button>
                <Button
                  size="sm"
                  disabled={isSyncing}
                  onClick={handleInternetSync}
                  className="text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <RefreshCw size={14} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Internet
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Institution Directories & Advanced Filters */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-600" /> {selectedQual} Directories
              </h3>
              {selectedInst && (
                <button 
                  onClick={() => setSelectedInst(null)} 
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-600"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Institution Filter Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher un campus...' : 'Search campus directories...'}
                value={instSearch}
                onChange={e => setInstSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* Render Scrollable Institutions */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredInstitutions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No institutions found for "{selectedQual}" matching filter.
                </div>
              ) : (
                filteredInstitutions.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInst(selectedInst?.id === inst.id ? null : inst)}
                    className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex flex-col gap-1 ${
                      selectedInst?.id === inst.id 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400' 
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold truncate max-w-[150px]">{inst.name}</span>
                      {inst.acronym && <Badge className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase shrink-0">{inst.acronym}</Badge>}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{inst.city}, {inst.region} Region</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Portal Modules Canvas */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Sub-Tabs for Information */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto pb-px">
            {(['overview', 'institutions', 'programmes', 'materials', 'practicals'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-xs font-black uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-all ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'institutions' && `${selectedQual} Campuses`}
                {tab === 'programmes' && `${selectedQual} Specialties`}
                {tab === 'materials' && 'Resources & Past Papers'}
                {tab === 'practicals' && 'Simulators & Labs'}
              </button>
            ))}
          </div>

          {/* Active Tab View Rendering */}
          <div className="space-y-6">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-200/50 p-6 rounded-3xl space-y-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    {selectedQual} Academic Scope & Structure
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    The {selectedQual} is a highly professional qualification designed to equip Cameroonian students with hands-on vocational skills and theoretical foundations for immediate integration in private and state sectors.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Duration</span>
                      <p className="text-sm font-black text-slate-800 dark:text-white">2 Academic Years</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Focus</span>
                      <p className="text-sm font-black text-slate-800 dark:text-white">Practical & Theory</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Supervising Body</span>
                      <p className="text-sm font-black text-slate-800 dark:text-white">MINESUP Cameroon</p>
                    </div>
                  </div>
                </div>

                {/* Sub-portal Modules Grid */}
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2">Portal Modules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Institutions', desc: 'Accredited list of public and private higher institutions.', icon: Building2, action: () => setActiveTab('institutions') },
                    { title: 'Programmes & Specialties', desc: 'Detailed directories of courses, credits and paths.', icon: Layers, action: () => setActiveTab('programmes') },
                    { title: 'Learning Materials', desc: 'High-quality study notes, course plans, and definitions.', icon: BookOpen, action: () => setActiveTab('materials') },
                    { title: 'Past Questions', desc: 'National Exam question banks with expert solutions.', icon: FileText, action: () => setActiveTab('materials') },
                    { title: 'Practical Sessions', desc: 'Interactive lab simulations, code compilers, and guides.', icon: PlayCircle, action: () => setActiveTab('practicals') },
                    { title: 'Assignments & Projects', desc: 'Term projects, group assignments and guidelines.', icon: Award, action: () => setActiveTab('materials') }
                  ].map((mod, idx) => (
                    <Card key={idx} className="p-5 border border-slate-200/60 hover:border-indigo-400 transition-colors bg-white hover:shadow-md flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                          <mod.icon size={18} />
                        </div>
                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">{mod.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-normal">{mod.desc}</p>
                      </div>
                      <button 
                        onClick={mod.action}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 mt-4 transition-colors group"
                      >
                        Explore Module <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Institutions Tab */}
            {activeTab === 'institutions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Accredited Cameroon Higher Institutions offering {selectedQual}
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">{filteredInstitutions.length} Institutions Registered</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredInstitutions.map(inst => (
                    <div key={inst.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase">
                            {inst.institution_type}
                          </Badge>
                          {inst.website && (
                            <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <h5 className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug">{inst.name}</h5>
                        <p className="text-[10px] text-slate-500 font-bold">{inst.city} — {inst.region} Region</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedInst(inst);
                            setActiveTab('programmes');
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                        >
                          View Specialties <ArrowRight size={12} />
                        </button>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black">VERIFIED CAMPUS</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Programmes Tab */}
            {activeTab === 'programmes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Specialties & Curricula for {selectedQual}
                    </h4>
                    {selectedInst && (
                      <p className="text-[11px] text-indigo-600 font-bold">
                        Filtered by campus: {selectedInst.name}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {filteredProgrammes.length} Specialties
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredProgrammes.length === 0 ? (
                    <div className="bg-slate-100 p-8 rounded-2xl text-center text-slate-400 text-xs">
                      No custom specialties mapped for this campus. Showing general curriculum options instead.
                    </div>
                  ) : (
                    filteredProgrammes.map(prog => (
                      <div key={prog.id} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">{prog.programme_name}</h5>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{prog.specialization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase">
                            {prog.qualification_type} Qualification
                          </Badge>
                          <button 
                            onClick={() => toast.success('Subscribing to course content notification...')}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                            title="Syllabus coverage"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Materials & Past Papers Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="bg-blue-600 text-white p-6 rounded-3xl space-y-2 shadow-lg">
                  <h4 className="text-base font-black">National Past Questions Archive</h4>
                  <p className="text-xs text-slate-100 max-w-xl font-medium">
                    Access verified National Exam papers from 2018 to 2025, curated by Cameroonian senior inspectors and academics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Software Engineering Past Papers', year: '2019 - 2024', papers: 14, qual: 'HND' },
                    { title: 'Génie Logiciel Épreuves Écrites', year: '2020 - 2024', papers: 12, qual: 'BTS' },
                    { title: 'Accountancy & Corporate Reporting', year: '2018 - 2024', papers: 18, qual: 'HND' },
                    { title: 'Comptabilité et Gestion des Entreprises', year: '2021 - 2024', papers: 10, qual: 'BTS' },
                  ].filter(p => p.qual === selectedQual).map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <h5 className="text-xs font-extrabold text-slate-800">{item.title}</h5>
                        <p className="text-[10px] text-slate-400 font-bold">Years: {item.year} • {item.papers} PDFs available</p>
                      </div>
                      <Link to="/practice">
                        <Button size="sm" className="bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-[10px] font-black rounded-xl">
                          PRACTICE NOW
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulators & Labs Tab */}
            {activeTab === 'practicals' && (
              <div className="space-y-4">
                <div className="bg-emerald-600 text-white p-6 rounded-3xl space-y-2 shadow-lg">
                  <h4 className="text-base font-black">Cameroon Professional Virtual Labs</h4>
                  <p className="text-xs text-slate-100 max-w-xl font-medium">
                    Bridge the practical-theory divide. Access customized compilers, sandbox networks, and accounting simulators built specifically for the MINESUP syllabus.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 border border-slate-200/80 hover:border-emerald-500 bg-white shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase">ACCOUNTING LAB</Badge>
                      <h5 className="text-xs font-extrabold text-slate-800">Double-Entry Ledger Sandbox</h5>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Simulate OHADA accounting frameworks, balance sheets, and journal entry structures. Save your progress to the cloud securely.
                      </p>
                    </div>
                    <Link to="/accounting-lab" className="mt-4">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl w-full">
                        LAUNCH LAB
                      </Button>
                    </Link>
                  </Card>

                  <Card className="p-5 border border-slate-200/80 hover:border-emerald-500 bg-white shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase">SOFTWARE LAB</Badge>
                      <h5 className="text-xs font-extrabold text-slate-800">C & Java Program Sandbox</h5>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Simulate HND Software Engineering practical questions with instant runtime checks and diagnostic error tips.
                      </p>
                    </div>
                    <Link to="/practicals" className="mt-4">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl w-full">
                        LAUNCH LAB
                      </Button>
                    </Link>
                  </Card>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Suggest Custom Higher Institution Modal */}
      {isNominalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-1">
              Suggest Custom {selectedQual} Institution
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-300 mb-4 leading-relaxed font-medium">
              We update our accredited Cameroonian higher education registry continuously. Suggest your IPES or institute, and our admins will verify it.
            </p>
            
            <form onSubmit={handleNominate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Proposed Institution Name *</label>
                <input
                  type="text"
                  required
                  value={nominalForm.name}
                  onChange={e => setNominalForm({ ...nominalForm, name: e.target.value })}
                  placeholder="e.g. Higher Institute of Commerce & Technology"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">City *</label>
                  <input
                    type="text"
                    required
                    value={nominalForm.city}
                    onChange={e => setNominalForm({ ...nominalForm, city: e.target.value })}
                    placeholder="e.g. Douala"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Region *</label>
                  <select
                    value={nominalForm.region}
                    onChange={e => setNominalForm({ ...nominalForm, region: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="Center">Center</option>
                    <option value="Littoral">Littoral</option>
                    <option value="North West">North West</option>
                    <option value="South West">South West</option>
                    <option value="West">West</option>
                    <option value="Adamaoua">Adamaoua</option>
                    <option value="East">East</option>
                    <option value="Far North">Far North</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Accredited Specialty</label>
                <input
                  type="text"
                  value={nominalForm.programme}
                  onChange={e => setNominalForm({ ...nominalForm, programme: e.target.value })}
                  placeholder="e.g. Banking and Finance"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNominalModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Institution Overlay Modal */}
      {isAdminFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Database size={16} className="text-indigo-600" /> Verify & Add New IPES Campus
            </h4>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Direct administrative database insertion. Documents will instantly publish to student registries.
            </p>
            
            <form onSubmit={handleAdminAddInst} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Official Institution Name *</label>
                <input
                  type="text"
                  required
                  value={adminInstForm.name}
                  onChange={e => setAdminInstForm({ ...adminInstForm, name: e.target.value })}
                  placeholder="e.g. Higher Institute of Business Technology"
                  className="w-full px-3 py-2 border border-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Acronym</label>
                  <input
                    type="text"
                    value={adminInstForm.acronym}
                    onChange={e => setAdminInstForm({ ...adminInstForm, acronym: e.target.value })}
                    placeholder="e.g. HIBT"
                    className="w-full px-3 py-2 border border-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">City *</label>
                  <input
                    type="text"
                    required
                    value={adminInstForm.city}
                    onChange={e => setAdminInstForm({ ...adminInstForm, city: e.target.value })}
                    placeholder="e.g. Douala"
                    className="w-full px-3 py-2 border border-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={adminInstForm.hnd_available}
                    onChange={e => setAdminInstForm({ ...adminInstForm, hnd_available: e.target.checked })}
                  />
                  HND Offered
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={adminInstForm.bts_available}
                    onChange={e => setAdminInstForm({ ...adminInstForm, bts_available: e.target.checked })}
                  />
                  BTS Offered
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdminFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-750 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Save IPES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DynamicFooter />
    </div>
  );
}
