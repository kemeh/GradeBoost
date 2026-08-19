import React from 'react';
import { BookOpen, Calculator, Atom, FlaskConical, Dna, LineChart, Cpu, Building2, Wrench, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function SubjectsPage() {
  const categories = [
    {
      title: 'Sciences & Mathematics',
      subjects: ['Pure Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology', 'Geology', 'Computer Science']
    },
    {
      title: 'Commercial & Economics',
      subjects: ['Financial Accounting', 'Economics', 'Commerce', 'Cost & Management Accounting', 'Business Structure']
    },
    {
      title: 'Arts & Languages',
      subjects: ['English Language', 'French Literature', 'History', 'Geography', 'Philosophy', 'Religious Studies']
    },
    {
      title: 'TVEE & Technical Specialties',
      subjects: ['Electrical Technology', 'Building Construction', 'Motor Vehicle Technology', 'Woodwork & Cabinet Making', 'Mechanical Engineering']
    },
    {
      title: 'HND & BTS Professional Specialties',
      subjects: ['Software Engineering', 'Computer Engineering', 'Accountancy', 'Banking & Finance', 'Marketing', 'Business Management', 'Electrical Power Systems', 'Civil Engineering Technology']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Explore Subjects | Edulpha" description="Full directory of subjects covered across General, Technical, Commercial, TVEE, and HND/BTS professional sub-systems." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            UNIFIED CURRICULUM CATALOG
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Subject Directory</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Comprehensive past papers, AI step-by-step solutions, and revision notes across all major subsystems including GCE, TVEE, and HND/BTS.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* HND / BTS Professional Higher Education Cross-linking Callout */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-2.5 py-0.5 text-[10px] uppercase font-black">
              Professional Higher Education
            </Badge>
            <h3 className="text-lg font-black text-slate-900">
              Higher National Diploma (HND) & BTS Portal
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-2xl leading-relaxed">
              Are you pursuing a professional university degree? Access our unified HND / BTS Portal to view accredited Cameroon higher institutes, professional course syllabi, past exams, and virtual lab simulators for Software Engineering, Accountancy, and more.
            </p>
          </div>
          <Link to="/hnd-bts">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shadow-md">
              <span>View HND / BTS Portal</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-3">{cat.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.subjects.map((sub, sIdx) => (
                  <div key={sIdx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span>{sub}</span>
                    <span className="text-emerald-500 text-[10px] uppercase font-black">Active</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl font-black">Can't find a specific subject or paper?</h3>
          <p className="text-xs text-indigo-200 max-w-xl mx-auto">Our content team uploads new GCE and MINESEC papers weekly. Request custom paper uploads or solutions via support.</p>
          <Link to="/contact">
            <Button className="bg-white text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
              Request Subject Paper
            </Button>
          </Link>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
