import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Target, TrendingUp, ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, cn } from '../components/ui';

export default function LandingPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (user || isAdmin)) {
      if (isAdmin) {
        navigate('/admin');
      } else if (user?.paymentStatus === 'paid') {
        navigate('/dashboard');
      } else if (user) {
        navigate('/payment');
      }
    }
  }, [user, loading, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
              alt="GradeBoost 60 Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">GradeBoost 60</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <Link to="/auth" className="text-sm font-bold text-slate-900">Login</Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="primary" className="mb-6">GCE A-Level Prep</Badge>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9]">
              From Uncertainty <br />
              <span className="text-indigo-600 italic">to an A Grade</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto font-medium"
          >
            Master Computer Science & ICT through real exam practice, 
            personalized diagnostics, and smart improvement insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto group">
                Start Improving <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Take Diagnostic Test
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-20"
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-2xl opacity-10" />
              <Card className="relative border-slate-200 shadow-2xl overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="Platform Dashboard" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Built for Performance</h2>
            <p className="text-slate-500 font-medium">Everything you need to move from a C to an A.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Real Exam Practice",
                desc: "Access a library of past GCE papers with our integrated PDF viewer and answer panel.",
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                icon: Sparkles,
                title: "Smart Insights",
                desc: "Our engine detects your weak topics and provides actionable feedback to improve.",
                color: "bg-purple-50 text-purple-600"
              },
              {
                icon: Target,
                title: "Grade Prediction",
                desc: "Track your exam readiness with real-time grade mapping and performance trends.",
                color: "bg-emerald-50 text-emerald-600"
              }
            ].map((feature, i) => (
              <Card key={i} className="p-10 space-y-6 hover:border-slate-300 transition-colors">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <Card className="max-w-7xl mx-auto bg-slate-900 p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent)]" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight relative z-10">
            Ready to secure your A grade?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium relative z-10">
            Join hundreds of students mastering Computer Science and ICT with GradeBoost 60.
          </p>
          <div className="relative z-10">
            <Link to="/auth">
              <Button size="lg" variant="secondary">Get Started Now</Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <img 
                src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
                alt="GradeBoost 60 Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={16} />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">GradeBoost 60</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Built by Vertexon Technologies</p>
          </div>
          <p className="text-slate-400 text-sm font-bold">© 2026 Vertexon Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <ShieldCheck className="text-slate-300" size={20} />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Secure Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
