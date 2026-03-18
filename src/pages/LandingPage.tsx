import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Trophy, Users, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden font-sans">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Logo className="scale-90 sm:scale-100" />
        <div className="flex items-center gap-8">
          <Link to="/auth" className="text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-slate-900 transition-colors hidden sm:block">Sign In</Link>
          <Link to="/auth" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-32 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <Sparkles size={12} /> Vertexon Technologies
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter text-slate-900">
            Master GCE <br />
            <span className="text-blue-600">Computer <br className="hidden sm:block" /> Science</span> <br />
            in 60 Days.
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
            A structured, daily challenge system designed specifically for the Cameroon GCE syllabus. Lessons, quizzes, and progress tracking all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Link to="/auth" className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 group active:scale-[0.98]">
              Start Challenge <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 text-sm font-black">500+ Students</p>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Joined across Cameroon</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
            <div className="bg-slate-50 rounded-[3rem] p-8 aspect-square relative overflow-hidden border border-slate-100 shadow-inner">
            <div className="absolute top-8 left-8 right-8 bottom-8 bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                  <Zap size={24} />
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Progress</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">Day 14/60</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full flex-1 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-full" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Next: Data Structures</span>
                  <span className="text-blue-600">Unlock in 2h</span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-100 rounded-full blur-[100px] opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-100 rounded-full blur-[120px] opacity-40" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-slate-50/50 py-32 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Everything you need to succeed.</h2>
            <p className="text-base text-slate-500 font-medium">Designed by top ICT educators in Cameroon to help you ace your A-Levels.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Community Driven", desc: "Join hundreds of students sharing tips and solving past GCE questions together.", color: "blue" },
              { icon: CheckCircle2, title: "Syllabus Focused", desc: "Every lesson is mapped directly to the Cameroon GCE A-Level Computer Science syllabus.", color: "emerald" },
              { icon: Trophy, title: "Challenge-Based + Mastery-Based Learning", desc: "Step by step, day by day — master each topic and track your success. Your journey from F to A starts here.", color: "amber" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all group">
                <div className={`w-16 h-16 bg-${f.color}-50 rounded-[1.5rem] flex items-center justify-center text-${f.color}-600 mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-blue-600 rounded-[3rem] p-10 md:p-20 text-center text-white overflow-hidden shadow-2xl shadow-blue-200"
          >
            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
              <Sparkles className="mx-auto text-blue-200 opacity-50" size={40} />
          <blockquote className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter leading-[0.95]">
            “Success isn’t about talent, it’s about showing up every day and doing the work. Start today, finish stronger.”
          </blockquote>
              <div className="pt-8 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-blue-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-200">Motivational Insight</span>
                <div className="h-px w-12 bg-blue-400" />
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-10">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-none">Ready to boost <br /> your grade?</h2>
              <Link to="/auth" className="inline-flex bg-white text-slate-900 px-10 py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-50 transition-all shadow-2xl active:scale-[0.98] group">
                Get Started Today <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <Logo className="scale-90" />
          <div className="flex gap-12">
            <a href="https://vertexontechhub.com" className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">About</a>
            <a href="https://vertexontechhub.com" className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">Contact</a>
            <a href="https://vertexontechhub.com" className="text-slate-400 hover:text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">Privacy Policy</a>
          </div>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Vertexon Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
