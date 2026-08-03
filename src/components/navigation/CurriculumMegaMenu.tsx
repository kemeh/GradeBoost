import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Wrench, Building2, Compass, ArrowRight,
  Sparkles, CheckCircle2, Shield
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../ui';

interface CurriculumMegaMenuProps {
  onClose?: () => void;
}

export default function CurriculumMegaMenu({ onClose }: CurriculumMegaMenuProps) {
  const { language } = useLanguage();

  const handleLinkClick = (href: string) => {
    if (onClose) onClose();
    if (href.startsWith('#')) {
      const el = document.getElementById(href.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const CURRICULA = [
    {
      id: 'anglo',
      titleEn: 'English Curriculum (GCE)',
      titleFr: 'Système Anglophone (GCE)',
      icon: GraduationCap,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      levels: [
        { nameEn: 'Ordinary Level (O-Level)', nameFr: 'Ordinary Level (O-Level)', descEn: 'Forms 1-5 official papers & step-by-step AI solutions', descFr: 'Épreuves officielles et solutions IA détaillées', badge: 'Forms 1-5', href: '/lms?curriculum=english&level=olevel' },
        { nameEn: 'Advanced Level (A-Level)', nameFr: 'Advanced Level (A-Level)', descEn: 'Lower & Upper Sixth past papers, mark schemes & revision', descFr: 'Anciennes épreuves et schémas de correction', badge: 'Sixth Form', href: '/lms?curriculum=english&level=alevel' }
      ]
    },
    {
      id: 'franco',
      titleEn: 'French Curriculum (MINESEC)',
      titleFr: 'Système Francophone (MINESEC)',
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      levels: [
        { nameEn: 'BEPC (Troisième)', nameFr: 'BEPC (Troisième)', descEn: 'Premier cycle exam preparation and practice quizzes', descFr: 'Préparation à l\'examen du BEPC et quiz', badge: 'BEPC', href: '/lms?curriculum=french&level=bepc' },
        { nameEn: 'Seconde & Première', nameFr: 'Seconde & Première', descEn: 'Literary & Science series (A, C, D, TI)', descFr: 'Séries Littéraires et Scientifiques (A, C, D, TI)', badge: 'Probatoire', href: '/lms?curriculum=french&level=premiere' },
        { nameEn: 'Terminale (Baccalauréat)', nameFr: 'Terminale (Baccalauréat)', descEn: 'Official Baccalauréat national exam revision', descFr: 'Révision nationale de l\'examen du Baccalauréat', badge: 'Bac', href: '/lms?curriculum=french&level=terminale' }
      ]
    },
    {
      id: 'technical',
      titleEn: 'Technical & TVEE Education',
      titleFr: 'Enseignement Technique & TVEE',
      icon: Wrench,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      levels: [
        { nameEn: 'TVEE Intermediate (CAP / Craft)', nameFr: 'TVEE Intermédiaire (CAP / Métiers)', descEn: 'Electrical, Mechanical, Building & Construction', descFr: 'Électricité, Mécanique, Bâtiment et Construction', badge: 'CAP / Inter', href: '/lms?subsystem=technical&level=intermediate' },
        { nameEn: 'TVEE Advanced (BTP / Industriel)', nameFr: 'TVEE Avancé (BTP / Industriel)', descEn: 'Advanced Technical Baccalaureate & Engineering basics', descFr: 'Baccalauréat Technique et bases de l\'ingénierie', badge: 'Adv Tech', href: '/lms?subsystem=technical&level=advanced' }
      ]
    },
    {
      id: 'commercial',
      titleEn: 'Commercial & Business Studies',
      titleFr: 'Enseignement Commercial & Gestion',
      icon: Building2,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      levels: [
        { nameEn: 'ACC & Secretarial Studies (CG/ACC)', nameFr: 'ACC & Secrétariat (CG/ACC)', descEn: 'Financial Accounting, Commerce, Office Automation', descFr: 'Comptabilité Financière, Commerce et Bureautique', badge: 'ACC', href: '/lms?subsystem=commercial&level=acc' },
        { nameEn: 'High School Business & Marketing', nameFr: 'Commerce & Marketing Avancé', descEn: 'Economics, Business Management & Tax Law', descFr: 'Économie, Gestion des Entreprises et Droit', badge: 'Commercial', href: '/lms?subsystem=commercial&level=advanced' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Header Bar inside Mega Menu */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {language === 'fr' ? 'Programmes & Sous-systèmes Éducatifs' : 'Educational Pathways & Curricula'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'fr' 
                ? 'Naviguez entre le sous-système Anglophone, Francophone, Technique et Commercial.' 
                : 'Explore Anglophone GCE, Francophone MINESEC, TVEE Technical, and Commercial systems.'}
            </p>
          </div>
        </div>

        <Link
          to="/lms"
          onClick={() => handleLinkClick('/lms')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs transition-colors"
        >
          <span>{language === 'fr' ? 'Voir tous les cours' : 'View All Pathways'}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid of Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CURRICULA.map((group) => {
          const IconComponent = group.icon;
          return (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${group.color}`}>
                  <IconComponent size={16} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {language === 'fr' ? group.titleFr : group.titleEn}
                </h4>
              </div>

              <div className="space-y-2">
                {group.levels.map((lvl, idx) => (
                  <Link
                    key={idx}
                    to={lvl.href}
                    onClick={() => handleLinkClick(lvl.href)}
                    className="block p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all group/item"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900 group-hover/item:text-indigo-600 transition-colors">
                        {language === 'fr' ? lvl.nameFr : lvl.nameEn}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-black text-[9px] uppercase shrink-0">
                        {lvl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {language === 'fr' ? lvl.descFr : lvl.descEn}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer banner in Mega Menu */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 -mx-6 -mb-6 p-4 px-8 rounded-b-3xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Sparkles size={14} className="text-amber-500" />
          <span>
            {language === 'fr' 
              ? 'Toutes les épreuves contiennent des solutions générées par l\'IA Edulpha 24/7' 
              : 'All past papers feature step-by-step Edulpha AI solutions'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" /> MINESEC Official
          </span>
          <span className="flex items-center gap-1">
            <Shield size={12} className="text-indigo-500" /> GCE Board Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
