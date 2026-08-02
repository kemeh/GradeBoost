import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, ShieldCheck, Cpu, Smartphone, BookOpen, Award, CheckCircle2, 
  MapPin, Users, Heart, ArrowRight, Zap, Layers, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AfricaFocusSection: React.FC = () => {
  const navigate = useNavigate();

  const milestones = [
    {
      title: 'Cameroon MINESEC Aligned',
      desc: '100% official past papers & mock exams for GCE Board O/A Levels and Francophone BEPC, Probatoire, and Baccalauréat.',
      badge: 'Official Standards',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'TVEE & Technical First',
      desc: 'Pioneering digital education for Technical, Vocational, Commercial, and Industrial specialties across Cameroon.',
      badge: 'Vocational Mastery',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Offline Connectivity Engine',
      desc: 'Download study packages once and practice anywhere without active mobile data or Wi-Fi connectivity.',
      badge: 'Zero Data Revision',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      title: 'Pan-African Expansion',
      desc: 'Building Africa’s next-generation educational infrastructure starting in Cameroon and reaching West & Central Africa.',
      badge: 'Pan-African Vision',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  return (
    <section id="africa-focus" className="py-24 px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Globe size={14} />
              Cameroon & Pan-African Mission
            </div>

            <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Built for Cameroon. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Designed for Africa.
              </span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
              Edulpha is purpose-built to eliminate educational disparities in Cameroon and across Africa. By bridging the Anglophone GCE system and Francophone Sub-system with technical, commercial, and TVEE qualifications, we provide every student with equal access to world-class learning.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="block text-2xl font-black text-emerald-400">2 Sub-systems</span>
                <span className="text-xs font-bold text-slate-400">English & French</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="block text-2xl font-black text-amber-400">10 Regions</span>
                <span className="text-xs font-bold text-slate-400">Cameroon Coverage</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="block text-2xl font-black text-indigo-400">100% Offline</span>
                <span className="text-xs font-bold text-slate-400">Android Capability</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-400/20 hover:scale-105 transition-all"
              >
                <span>Join Africa's Premier Learning Hub</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Visual Feature Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 space-y-4">
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-emerald-500/40 transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Cameroon Nationwide Reach</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Douala, Yaoundé, Bamenda, Buea, Garoua, Bafoussam & all 10 regions.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-amber-500/40 transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Empowering 50,000+ Students</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Secondary, TVEE, and university candidates excelling in national exams.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Low-Bandwidth Mobile Engineering</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Optimized for low-RAM Android phones and offline study without data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {milestones.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-all"
            >
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.color}`}>
                {item.badge}
              </span>
              <h3 className="text-lg font-black text-white pt-1">{item.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
