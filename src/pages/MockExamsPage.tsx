import React from 'react';
import { Award, Clock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function MockExamsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Mock Examinations & Paper Generator | Edulpha" description="Simulate real GCE, Baccalauréat, and TVEE official exams with strict timing and instant score analytics." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            NATIONAL EXAM SIMULATION
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Mock Examinations</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Test your readiness under official GCE and MINESEC timing conditions with negative marking and diagnostic reports.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xs">
            <Award className="text-indigo-600 dark:text-indigo-400" size={32} />
            <h2 className="text-xl font-bold">Paper 1 Multiple Choice (MCQ)</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Timed 50-question Paper 1 simulations covering all subjects with immediate score breakdown and explanation for every option.</p>
            <Link to="/exams" className="inline-block">
              <Button className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Take MCQ Mock</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xs">
            <FileText className="text-emerald-600 dark:text-emerald-400" size={32} />
            <h2 className="text-xl font-bold">Paper 2 & 3 Structural Essay Mocks</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Download or write full structural problem sets with model marking keys provided by official national examiners.</p>
            <Link to="/practice" className="inline-block">
              <Button className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Practice Structural Papers</Button>
            </Link>
          </div>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
