import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BarChart3, Brain, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button, Card } from '../components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Target size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">GradeBoost<span className="text-indigo-600">60</span></span>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/auth" className="text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-indigo-600 transition-colors hidden sm:block">Login</Link>
          <Link to="/auth">
            <Button size="md">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              <Sparkles size={12} /> The Future of A-Level Prep
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-slate-900">
              Track. Analyze. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Improve Your Grades.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Built specifically for Advanced Level Computer Science & ICT students. Master your syllabus with data-driven insights and smart predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Demo
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 pt-8 border-t border-slate-200">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/student${i}/100/100`} alt="Student" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-600">Trusted by <span className="text-indigo-600">500+</span> students across Cameroon</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10">
              <Card className="p-0 overflow-hidden border-slate-200/60 shadow-2xl">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Dashboard Preview</span>
                </div>
                <div className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Avg Score</p>
                      <p className="text-2xl font-black text-indigo-600">78%</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Predicted</p>
                      <p className="text-2xl font-black text-purple-600">A</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-full w-full" />
                    <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100" />
                      <div className="w-8 h-8 rounded-lg bg-slate-100" />
                    </div>
                    <div className="w-24 h-8 rounded-lg bg-indigo-600" />
                  </div>
                </div>
              </Card>
            </div>
            {/* Background Glows */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px]" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Everything you need to excel.</h2>
          <p className="text-slate-500 font-medium">Powerful tools designed to give you a competitive edge in your A-Level exams.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: BarChart3, 
              title: "Grade Tracking", 
              desc: "Log your scores for every paper and see your progress visualized with beautiful charts.",
              color: "indigo"
            },
            { 
              icon: Brain, 
              title: "Smart Insights", 
              desc: "Our logic engine analyzes your data to tell you exactly where you need to focus your study time.",
              color: "purple"
            },
            { 
              icon: Target, 
              title: "Exam Prediction", 
              desc: "Get accurate grade predictions based on your current performance and syllabus weightings.",
              color: "emerald"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:border-indigo-200 hover:shadow-medium group">
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Target size={18} />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-900">GradeBoost<span className="text-indigo-600">60</span></span>
            </div>
            
            <div className="flex gap-10">
              <Link to="/" className="text-slate-400 hover:text-indigo-600 text-[11px] font-black uppercase tracking-widest transition-colors">Home</Link>
              <Link to="/auth" className="text-slate-400 hover:text-indigo-600 text-[11px] font-black uppercase tracking-widest transition-colors">Login</Link>
              <a href="#" className="text-slate-400 hover:text-indigo-600 text-[11px] font-black uppercase tracking-widest transition-colors">About</a>
            </div>
            
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              © 2026 GradeBoost60. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
