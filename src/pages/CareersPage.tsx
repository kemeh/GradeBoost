import React from 'react';
import { Briefcase, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';

export default function CareersPage() {
  const positions = [
    { title: 'GCE Advanced Level Physics Subject Lead', location: 'Remote / Douala', type: 'Full-time' },
    { title: 'Francophone Baccalauréat C & D Math Expert', location: 'Remote / Yaoundé', type: 'Full-time' },
    { title: 'Senior React & Mobile App Developer', location: 'Remote', type: 'Full-time' },
    { title: 'Student Ambassador Network Coordinator', location: 'Regional (Cameroon & Nigeria)', type: 'Part-time' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Careers at Edulpha | Join Our Mission" description="Join the team building Africa's premier AI educational platform." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            JOIN OUR TEAM
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Build the Future of African Education</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            We are hiring subject experts, software engineers, and community managers passionate about student success.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Open Positions</h2>
        <div className="space-y-4">
          {positions.map((p, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm">{p.title}</h3>
                <p className="text-xs text-slate-500">{p.location} • {p.type}</p>
              </div>
              <a href="mailto:careers@edulpha.com" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">
                Apply Now
              </a>
            </div>
          ))}
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
