import React from 'react';
import { Layers, GraduationCap, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function CurriculumPage() {
  const subsystems = [
    {
      title: 'Anglophone Sub-system (GCE Board)',
      levels: ['Ordinary Level (Form 5)', 'Advanced Level (Lower & Upper Sixth)'],
      desc: 'Complete coverage of General Arts, General Sciences, Commercial, and Technical GCE papers with marking schemes.'
    },
    {
      title: 'Francophone Sub-system (MINESEC)',
      levels: ['Probatoire (Première)', 'Baccalauréat (Terminales A, C, D, TI, E)'],
      desc: 'Sujets officiels des examens d\'État avec corrigés détaillés et guides méthodologiques.'
    },
    {
      title: 'TVEE & Technical Commercial Board',
      levels: ['CAP & Intermediate Technical', 'Advanced Technical & Professional (BTP, ESTP)'],
      desc: 'Electrical engineering, motor mechanics, masonry, accounting, and technical graphics.'
    },
    {
      title: 'West African Regional Examinations',
      levels: ['WASSCE (Ghana, Nigeria, Sierra Leone, Gambia, Liberia)'],
      desc: 'Core Maths, Integrated Science, English, Financial Accounting, and Social Studies.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Educational Sub-systems & Syllabi | Edulpha" description="Detailed guide to GCE, Francophone MINESEC, TVEE, and WASSCE curricula integrated on Edulpha." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            SUB-SYSTEM INTEGRATION
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Educational Curricula</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Edulpha supports both Anglophone, Francophone, and TVEE technical examination systems.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {subsystems.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xs">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-xl font-bold">{s.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
              <div className="space-y-2 pt-2">
                {s.levels.map((lvl, lIdx) => (
                  <div key={lIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>{lvl}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link to="/auth?mode=register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl">
              Select Your Sub-system & Start
            </Button>
          </Link>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
