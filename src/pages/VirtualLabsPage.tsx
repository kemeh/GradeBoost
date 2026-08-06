import React from 'react';
import { FlaskConical, Atom, Wrench, Sparkles, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function VirtualLabsPage() {
  const labs = [
    {
      title: 'Physics & Optics Simulator',
      desc: 'Ray optics, convex/concave lens refraction, pendulum harmonic motion, circuit resistance & Ohm law.',
      icon: <Atom size={28} className="text-sky-500" />
    },
    {
      title: 'Chemistry & Titration Lab',
      desc: 'Acid-base volumetric analysis, flame tests for cations, organic synthesis reaction mechanisms.',
      icon: <FlaskConical size={28} className="text-emerald-500" />
    },
    {
      title: 'TVEE Electrical & Circuits Simulator',
      desc: 'Three-phase motor wiring, star-delta starters, oscilloscope waveform tracing, AC circuit phasor diagrams.',
      icon: <Wrench size={28} className="text-amber-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Virtual Laboratories & Practical Labs | Edulpha" description="Interactive 3D virtual science and engineering practical labs for GCE, TVEE, and Baccalauréat students." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs uppercase font-black">
            INTERACTIVE PRACTICALS
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">3D Virtual Laboratories</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Practice science and technical practical experiments on your phone or PC without physical laboratory constraints.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {labs.map((lab, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">{lab.icon}</div>
              <h2 className="text-lg font-bold">{lab.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{lab.desc}</p>
              <Link to="/practicals" className="inline-block pt-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1">
                  <span>Launch Simulator</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
