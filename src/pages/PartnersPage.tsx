import React from 'react';
import { Building2, Globe, GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Institutional Partners & Schools | Edulpha" description="Partner with Edulpha to equip your secondary or technical school with AI learning tools and past paper banks." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            SCHOOL & INSTITUTIONAL ALLIANCES
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Partner With Edulpha</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            We partner with secondary schools, TVEE colleges, education ministries, and non-profits across Africa.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <Building2 className="text-indigo-600" size={32} />
            <h3 className="font-bold text-lg">School Group Licenses</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Provide every student in your school with full access to Edulpha AI and past paper banks at volume discount rates.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <GraduationCap className="text-emerald-600" size={32} />
            <h3 className="font-bold text-lg">Teacher LMS Portal</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Empower your teaching staff to generate custom exams, track student progress analytics, and assign homework automatically.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <Globe className="text-sky-600" size={32} />
            <h3 className="font-bold text-lg">NGO & Ministry Initiatives</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Collaborate with us to deploy offline mobile learning hubs in rural or underserved communities.</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-black">Become an Institutional Partner</h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">Contact our school partnerships team to discuss custom integration and group onboarding.</p>
          <Link to="/contact">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-3 rounded-xl">
              Contact Partnerships Desk
            </Button>
          </Link>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
