import React from 'react';
import { motion } from 'motion/react';
import { Shield, BookOpen, Award, GraduationCap, Globe, Users, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Button, Badge, Card } from '../components/ui';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO 
        title="About Edulpha | Empowering African Education"
        description="Learn about Edulpha's mission to bridge the educational resource gap across Cameroon, West Africa, and sub-Saharan Africa with AI tutor support and offline learning."
      />
      <Navbar />

      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black tracking-widest">
            OUR MISSION & VISION
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Democratizing High-Quality Exam Prep Across <span className="text-emerald-400">Africa</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Edulpha was engineered to solve the acute shortage of quality past question solutions, textbooks, and interactive practical labs for secondary and technical students in Cameroon and Sub-Saharan Africa.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Aligned with MINESEC, TVEE Board & West African Syllabi
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              From Ordinary and Advanced Level GCE Board exams to Francophone Probatoire, Baccalauréat (Series A, C, D, TI) and Technical Commercial TVEE specialties, Edulpha provides comprehensive coverage.
            </p>
            <div className="space-y-3">
              {[
                'Offline Mobile App support for regions with limited internet',
                'Step-by-step AI solution generator tuned for African marking schemes',
                'Virtual 3D laboratories for Physics, Chemistry, and Electrical Tech',
                'Multilingual interface supporting both English and French'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm font-medium">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link to="/auth?mode=register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                  <span>Start Learning Free</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-4">Key Impact Statistics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">100K+</span>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Active Candidates</p>
              </div>
              <div>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">50,000+</span>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Past Questions Solved</p>
              </div>
              <div>
                <span className="text-3xl font-black text-sky-600 dark:text-sky-400">94%</span>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">GCE Pass Rate Boost</p>
              </div>
              <div>
                <span className="text-3xl font-black text-amber-500">10+</span>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">African Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
