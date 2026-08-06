import React from 'react';
import { Award, Star, GraduationCap, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function SuccessStoriesPage() {
  const stories = [
    {
      name: 'Ngu Benedict',
      exam: 'GCE A-Level 2025',
      achievement: '5 A1 Grades (Pure Maths, Further Maths, Physics, Chemistry, ICT)',
      school: 'GBHS Bamenda',
      story: 'Before Edulpha, Benedict struggled with Mechanics and Electricity past papers. Using the Edulpha AI step-by-step solver and virtual labs, he moved from a C grade average to top 1% in Cameroon.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Marie-Claire Mbida',
      exam: 'Baccalauréat C 2025',
      achievement: 'Major du Centre Region (18.4/20 Average)',
      school: 'Lycée Général Leclerc, Yaoundé',
      story: 'Marie-Claire practiced over 150 past Bac C examination papers on Edulpha. The offline mobile app allowed her to revise even during power outages.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Tchinda Joseph',
      exam: 'TVEE Technical A-Level',
      achievement: 'First Rank in Electrical Technology Specialty',
      school: 'GTHS Buea',
      story: 'Joseph used Edulpha\'s 3D electrical motor simulators and circuit diagram schematics to master practical exams.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Success Stories & Student Hall of Fame | Edulpha" description="Read inspiring success stories from top-scoring candidates in GCE A-Levels, Baccalauréat, and TVEE." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs uppercase font-black">
            HALL OF FAME & INSPIRATION
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Student Success Stories</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Discover how Edulpha candidates transformed their academic performance and unlocked university scholarships.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="space-y-8">
          {stories.map((st, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-xs">
              <img src={st.image} alt={st.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0 border-2 border-indigo-500/20" />
              <div className="space-y-3 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                    {st.exam}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">• {st.school}</span>
                </div>
                <h2 className="text-xl font-bold">{st.name}</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{st.achievement}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{st.story}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link to="/testimonials">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl">
              View All Testimonials & Reviews
            </Button>
          </Link>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
