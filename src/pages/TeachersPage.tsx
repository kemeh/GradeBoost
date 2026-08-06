import React from 'react';
import { GraduationCap, FileCode, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function TeachersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Teacher & Educator Portal | Edulpha" description="Tools for teachers to generate past paper exams, manage student classes, and track learning analytics." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            EDUCATOR STUDIO
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Empowering Teachers across Africa</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Save hours on lesson planning and test creation with Edulpha's automated paper generator and class analytics.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <FileCode className="text-indigo-600" size={32} />
            <h2 className="text-xl font-bold">Automated Exam Generator</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Select year ranges, topics, and difficulty levels to produce printable PDF question papers with answer schemes in seconds.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <Users className="text-emerald-600" size={32} />
            <h2 className="text-xl font-bold">Class Analytics & LMS Studio</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Monitor class attendance, diagnostic practice scores, and topic weakness trends across all your students.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link to="/auth?mode=register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl">
              Register as Teacher
            </Button>
          </Link>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
