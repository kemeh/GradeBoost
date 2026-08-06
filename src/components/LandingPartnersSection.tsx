import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Globe, ExternalLink, Star, ShieldCheck, 
  Sparkles, CheckCircle2, ChevronRight, X, Mail, Linkedin, Twitter, Tag
} from 'lucide-react';
import { Partner, PartnerCategory } from '../types/partner';
import { PartnerService } from '../services/partnerService';
import { useLanguage } from '../contexts/LanguageContext';

export const LandingPartnersSection: React.FC = () => {
  const { language } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [activePartnerModal, setActivePartnerModal] = useState<Partner | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const [pData, cData] = await Promise.all([
        PartnerService.getPartners(true), // active only
        PartnerService.getCategories()
      ]);
      setPartners(pData);
      setCategories(cData);
    } catch (err) {
      console.error('Error fetching landing partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = selectedCatId === 'all' 
    ? partners 
    : partners.filter(p => p.categoryId === selectedCatId);

  const featuredPartners = partners.filter(p => p.featured);

  return (
    <section id="partners" className="py-24 px-6 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-bold text-xs">
            <ShieldCheck size={16} />
            {language === 'fr' ? 'Partenaires Officiels & Alliances' : 'Official Partners & Alliances'}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {language === 'fr' ? 'Backed by Industry Leaders & Ministries' : 'Powered by Official Partnerships & Alliances'}
          </h2>
          <p className="text-slate-600 font-medium text-lg leading-relaxed">
            {language === 'fr' 
              ? 'Edulpha collabore avec les ministères de l\'éducation, les offices d\'examen du GCE, les géants des télécoms et les leaders technologiques pour offrir un apprentissage d\'excellence.'
              : 'Edulpha collaborates with education ministries, GCE examination boards, telecom leaders, and global AI infrastructure providers to guarantee official curriculum excellence.'}
          </p>
          <div className="pt-2 flex justify-center">
            <a href="/partners">
              <button className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition">
                {language === 'fr' ? 'En savoir plus sur nos partenariats' : 'Learn More About Institutional Partners'} →
              </button>
            </a>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              selectedCatId === 'all'
                ? 'bg-slate-900 text-white shadow-slate-900/20 scale-105'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {language === 'fr' ? 'Tous les Partenaires' : 'All Partners'} ({partners.length})
          </button>
          {categories.map((cat) => {
            const count = partners.filter(p => p.categoryId === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                  selectedCatId === cat.id
                    ? 'bg-indigo-600 text-white shadow-indigo-500/30 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {language === 'fr' ? cat.nameFr : cat.nameEn} ({count})
              </button>
            );
          })}
        </div>

        {/* Featured Partners Marquee Banner */}
        {featuredPartners.length > 0 && selectedCatId === 'all' && (
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Star size={14} fill="currentColor" /> {language === 'fr' ? 'Partenaires Principaux' : 'Featured Key Partners'}
              </span>
              <span className="text-[11px] font-bold text-slate-400">Verified Institutional Credentials</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredPartners.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActivePartnerModal(p)}
                  className="p-4 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                    <img src={p.logoUrl} alt={p.nameEn} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {language === 'fr' ? p.nameFr : p.nameEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partners Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Loading partner ecosystem...</div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 max-w-2xl mx-auto shadow-sm">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">
              {language === 'fr' ? 'Partenariats en Cours' : 'Building Institutional Partnerships'}
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {language === 'fr'
                ? 'Edulpha développe des partenariats avec des écoles, universités, centres de formation, ONG et organisations éducatives à travers le Cameroun et l\'Afrique. Nos partenaires seront présentés ici.'
                : 'Edulpha is building partnerships with schools, universities, training centres, NGOs, and educational organizations across Cameroon and Africa. Our partners will be showcased here.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPartners.map((partner) => {
              const category = categories.find(c => c.id === partner.categoryId);
              return (
                <motion.div
                  key={partner.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActivePartnerModal(partner)}
                  className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative"
                >
                  {partner.featured && (
                    <div className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {language === 'fr' ? 'Vedette' : 'Featured'}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
                        <img 
                          src={partner.logoUrl} 
                          alt={partner.nameEn} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {language === 'fr' ? (category?.nameFr || partner.partnershipType) : (category?.nameEn || partner.partnershipType)}
                        </span>
                        <h3 className="font-black text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors mt-1 line-clamp-1">
                          {language === 'fr' ? partner.nameFr : partner.nameEn}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                      {language === 'fr' ? partner.shortDescFr : partner.shortDescEn}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {language === 'fr' ? 'Partenariat Vérifié' : 'Verified Alliance'}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {language === 'fr' ? 'En savoir plus' : 'Learn More'} <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Student Ambassador Banner */}
        <div className="p-8 md:p-12 bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950 rounded-3xl border border-amber-500/30 shadow-2xl text-white flex flex-col lg:flex-row items-center justify-between gap-8 mt-12">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider border border-amber-300">
              <Sparkles size={14} className="fill-slate-950" /> {language === 'fr' ? 'Programme Ambassadeurs Élèves' : 'Edulpha Student Ambassador Program'}
            </div>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {language === 'fr' ? 'Guidez Votre École. Inspirez Vos Camarades.' : 'Lead Your School. Inspire Your Classmates.'}
            </h3>
            <p className="text-amber-100/90 text-sm font-medium leading-relaxed">
              {language === 'fr'
                ? 'Vous êtes élève au secondaire ? Devenez Ambassadeur Edulpha dans votre établissement, gagnez des récompenses et aidez vos camarades à réussir.'
                : 'Are you a secondary school student? Become an Edulpha Leader in your school, build leadership skills, earn rewards, and boost academic success.'}
            </p>
          </div>

          <a href="/student-ambassadors">
            <button className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition shrink-0 flex items-center gap-2">
              <span>{language === 'fr' ? 'Devenir Ambassadeur Élève' : 'Become a Student Ambassador'}</span>
              <ChevronRight size={16} />
            </button>
          </a>
        </div>

        {/* Alumni Leaders & Community Alliance Banner */}
        <div className="p-8 md:p-12 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-3xl border border-indigo-900/50 shadow-2xl text-white flex flex-col lg:flex-row items-center justify-between gap-8 mt-12">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
              <Star size={14} fill="currentColor" /> {language === 'fr' ? 'Réseau Alumni Leaders' : 'Edulpha Alumni Leaders Program'}
            </div>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'fr' ? 'Anciens Élèves & Mentors de Demain' : 'Empowering the Next Generation of African Scholars'}
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              {language === 'fr'
                ? 'Vous avez fait partie du parcours Edulpha ? Rejoignez nos leaders Alumni pour mentorer les élèves préparant le GCE, le TVEE et le Baccalauréat.'
                : 'Were you part of the Edulpha learning journey? Join our Alumni Network to mentor high school candidates across Cameroon and Africa.'}
            </p>
          </div>

          <a href="/alumni">
            <button className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition shrink-0 flex items-center gap-2">
              <span>{language === 'fr' ? 'Devenir un Alumni' : 'Become an Alumni'}</span>
              <ChevronRight size={16} />
            </button>
          </a>
        </div>
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        {activePartnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Cover Header */}
              <div className="relative h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 flex items-end">
                {activePartnerModal.coverImageUrl && (
                  <img 
                    src={activePartnerModal.coverImageUrl} 
                    alt={activePartnerModal.nameEn}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                )}
                <button
                  onClick={() => setActivePartnerModal(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full backdrop-blur-md"
                >
                  <X size={18} />
                </button>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white p-2 border border-slate-200 shadow-xl shrink-0 -mb-8 overflow-hidden">
                    <img 
                      src={activePartnerModal.logoUrl} 
                      alt={activePartnerModal.nameEn} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-white">
                    <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-md text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
                      {activePartnerModal.partnershipType} Partner
                    </span>
                    <h3 className="text-xl font-black mt-1">
                      {language === 'fr' ? activePartnerModal.nameFr : activePartnerModal.nameEn}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 pt-12 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                    {language === 'fr' ? 'À propos de ce partenariat' : 'About this Institutional Alliance'}
                  </h4>
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">
                    {language === 'fr' 
                      ? (activePartnerModal.fullDescFr || activePartnerModal.shortDescFr)
                      : (activePartnerModal.fullDescEn || activePartnerModal.shortDescEn)}
                  </p>
                </div>

                {activePartnerModal.socialLinks.website && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">Official Portal</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {activePartnerModal.socialLinks.website}
                      </div>
                    </div>
                    <a
                      href={activePartnerModal.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
                    >
                      Visit Site <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Status: <strong className="text-emerald-600 uppercase">Active</strong></span>
                  {activePartnerModal.startDate && (
                    <span>Partner Since: {activePartnerModal.startDate}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
