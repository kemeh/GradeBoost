import React from 'react';
import { Cpu, BookOpen, Award, Layers, Smartphone, Sparkles, Shield, Wrench, Clock, FileCode, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Cpu className="text-indigo-500" size={24} />,
      title: 'Edulpha AI Step-by-Step Solver',
      desc: 'Instant explanation of tough questions in Physics, Pure Maths, Chemistry, Economics and TVEE specialties with African marking scheme accuracy.'
    },
    {
      icon: <BookOpen className="text-emerald-500" size={24} />,
      title: 'Official Past Question Bank',
      desc: 'Access thousands of verified past papers from GCE Board, MINESEC Probatoire/Baccalauréat and WASSCE with detailed corrections.'
    },
    {
      icon: <Award className="text-sky-500" size={24} />,
      title: 'Timed Exam Simulation',
      desc: 'Practice under real exam conditions with strict countdown timers, negative marking options, and detailed performance scorecards.'
    },
    {
      icon: <Wrench className="text-purple-500" size={24} />,
      title: '3D Virtual Laboratories',
      desc: 'Conduct physics optics, organic chemistry reactions, and TVEE electrical circuit experiments directly on your smartphone.'
    },
    {
      icon: <Smartphone className="text-amber-500" size={24} />,
      title: 'Offline Sync & Mobile APK',
      desc: 'Study past questions, offline notes, and diagnostic tests without burning cellular data.'
    },
    {
      icon: <FileCode className="text-rose-500" size={24} />,
      title: 'Automated Exam Paper Generator',
      desc: 'Teachers and students can build custom diagnostic mock exams filtered by year, topic difficulty, and sub-system.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Platform Features | Edulpha" description="Explore Edulpha's full feature set including AI tutor, past paper bank, virtual labs, and offline practice." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            POWERFUL LEARNING TOOLS
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Built for Academic Superiority</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to master your syllabus and score top grades in official national examinations.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit">{f.icon}</div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/auth?mode=register">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
