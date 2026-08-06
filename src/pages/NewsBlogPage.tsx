import React from 'react';
import { FileText, Calendar, ArrowRight, Bell } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';

export default function NewsBlogPage() {
  const articles = [
    {
      title: 'Official MINESEC & GCE Board Examination Timetables Released',
      category: 'Exam Announcements',
      date: 'August 2026',
      summary: 'Review the official dates for GCE O/A Levels, Probatoire, and Baccalauréat written and practical sessions.'
    },
    {
      title: 'Top 5 Revision Strategies for TVEE Electrical & Mechanical Specialities',
      category: 'Study Tips',
      date: 'July 2026',
      summary: 'Mastering circuit diagrams, motor star-delta connections, and practical calculations under exam pressure.'
    },
    {
      title: 'How Edulpha AI Solves Complex Pure Maths Equations Step-by-Step',
      category: 'Platform Updates',
      date: 'July 2026',
      summary: 'A deep dive into Edulpha AI step-by-step math solver tuned specifically for GCE Board marking keys.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="News, Blog & MINESEC Updates | Edulpha" description="Official examination timetables, revision tips, and platform updates for students across Cameroon and West Africa." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            EDULPHA JOURNAL & UPDATES
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">News & Articles</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Stay updated with official national exam guidelines, study guides, and educational insights.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
                  {art.category}
                </span>
                <h3 className="font-bold text-base">{art.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{art.summary}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar size={12} /> {art.date}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">Read <ArrowRight size={12} /></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
