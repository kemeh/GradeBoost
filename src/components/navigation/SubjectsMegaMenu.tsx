import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, Atom, FlaskConical, Dna, FileText, LineChart, 
  Cpu, Wrench, Globe, BookOpen, ArrowRight, Layers
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SubjectsMegaMenuProps {
  onClose?: () => void;
}

export default function SubjectsMegaMenu({ onClose }: SubjectsMegaMenuProps) {
  const { language } = useLanguage();

  const handleLinkClick = (href: string) => {
    if (onClose) onClose();
    if (href.startsWith('#')) {
      const el = document.getElementById(href.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const SUBJECT_CATEGORIES = [
    {
      id: 'science',
      titleEn: 'Science & STEM',
      titleFr: 'Sciences & STEM',
      icon: Atom,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      subjects: [
        { nameEn: 'Mathematics (Pure & Applied)', nameFr: 'Mathématiques (Pures & Appliquées)', icon: Calculator, href: '/practice?subject=Mathematics' },
        { nameEn: 'Physics', nameFr: 'Physique', icon: Atom, href: '/practice?subject=Physics' },
        { nameEn: 'Chemistry', nameFr: 'Chimie', icon: FlaskConical, href: '/practice?subject=Chemistry' },
        { nameEn: 'Biology & Human Anatomy', nameFr: 'Biologie & Anatomie Humaine', icon: Dna, href: '/practice?subject=Biology' }
      ]
    },
    {
      id: 'tech',
      titleEn: 'Computer Science & ICT',
      titleFr: 'Informatique & TIC',
      icon: Cpu,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      subjects: [
        { nameEn: 'Computer Science & Python', nameFr: 'Informatique & Python', icon: Cpu, href: '/practice?subject=ComputerScience' },
        { nameEn: 'ICT & Information Systems', nameFr: 'TIC & Systèmes d\'Information', icon: Cpu, href: '/practice?subject=ICT' },
        { nameEn: 'Algorithms & Database Design', nameFr: 'Algorithmique & Bases de Données', icon: Cpu, href: '/practice?subject=Algorithms' }
      ]
    },
    {
      id: 'technical',
      titleEn: 'Technical Specialties',
      titleFr: 'Spécialités Techniques',
      icon: Wrench,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      subjects: [
        { nameEn: 'Electrical Technology & AC Circuits', nameFr: 'Électrotechnique & Circuits', icon: Wrench, href: '/practice?subject=Electrical' },
        { nameEn: 'Mechanical Engineering & Design', nameFr: 'Génie Mécanique & Dessin', icon: Wrench, href: '/practice?subject=Mechanical' },
        { nameEn: 'Building Construction & Civil', nameFr: 'Bâtiment & Génie Civil', icon: Wrench, href: '/practice?subject=Building' }
      ]
    },
    {
      id: 'commercial',
      titleEn: 'Business & Commercial',
      titleFr: 'Commerce & Gestion',
      icon: LineChart,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      subjects: [
        { nameEn: 'Financial Accounting & Ledgers', nameFr: 'Comptabilité Financière', icon: LineChart, href: '/practice?subject=Accounting' },
        { nameEn: 'Economics & Commercial Policy', nameFr: 'Économie & Commerce', icon: LineChart, href: '/practice?subject=Economics' },
        { nameEn: 'Commerce & Business Management', nameFr: 'Commerce & Gestion des Entreprises', icon: LineChart, href: '/practice?subject=Commerce' }
      ]
    },
    {
      id: 'languages',
      titleEn: 'Languages & Literature',
      titleFr: 'Langues & Littérature',
      icon: Globe,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      subjects: [
        { nameEn: 'English Language & Essay', nameFr: 'Langue Anglaise & Rédaction', icon: Globe, href: '/practice?subject=English' },
        { nameEn: 'French Literature & Dissertation', nameFr: 'Littérature Française', icon: BookOpen, href: '/practice?subject=French' },
        { nameEn: 'English Literature', nameFr: 'Littérature Anglaise', icon: BookOpen, href: '/practice?subject=EnglishLit' }
      ]
    },
    {
      id: 'arts',
      titleEn: 'Social Sciences & Arts',
      titleFr: 'Sciences Humaines & Arts',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      subjects: [
        { nameEn: 'History & Civics', nameFr: 'Histoire & Éducation Civique', icon: FileText, href: '/practice?subject=History' },
        { nameEn: 'Geography & Geology', nameFr: 'Géographie & Géologie', icon: FileText, href: '/practice?subject=Geography' },
        { nameEn: 'Philosophy & Logic', nameFr: 'Philosophie & Logique', icon: FileText, href: '/practice?subject=Philosophy' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {language === 'fr' ? 'Parcourir les Matières & Spécialités' : 'Browse Subjects & Specialties'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'fr'
                ? 'Accédez directement aux épreuves et tuteurs IA organisés par domaine.'
                : 'Direct access to past papers and AI tutoring organized by academic department.'}
            </p>
          </div>
        </div>

        <a
          href="#subjects"
          onClick={() => handleLinkClick('#subjects')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors"
        >
          <span>{language === 'fr' ? 'Voir toutes les épreuves' : 'View Full Catalog'}</span>
          <ArrowRight size={14} />
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECT_CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <div key={cat.id} className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cat.color}`}>
                  <CatIcon size={14} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {language === 'fr' ? cat.titleFr : cat.titleEn}
                </h4>
              </div>

              <div className="space-y-1">
                {cat.subjects.map((sub, idx) => {
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={idx}
                      to={sub.href}
                      onClick={() => handleLinkClick(sub.href)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-white text-xs font-bold text-slate-700 hover:text-indigo-600 border border-transparent hover:border-slate-200/80 transition-all shadow-2xs hover:shadow-xs group/sub"
                    >
                      <SubIcon size={14} className="text-slate-400 group-hover/sub:text-indigo-600 transition-colors shrink-0" />
                      <span className="truncate">{language === 'fr' ? sub.nameFr : sub.nameEn}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
