import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, Wrench, Briefcase, Sparkles, FileText, Wrench as ToolIcon,
  LineChart, Calendar, Smartphone, WifiOff, Award, Trophy, ArrowRight,
  CheckCircle2, Heart, Zap, Users
} from 'lucide-react';
import { Badge, Button, Card } from './ui';

export function WhyStudentsLoveEdulpha() {
  const points = [
    {
      icon: BookOpen,
      title: 'Covers General & Technical Education',
      desc: 'Unified platform engineered specifically for both English GCE (Grammar) and Technical/Vocational sub-systems.',
      badge: 'Dual Sub-systems',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      icon: Briefcase,
      title: 'Commercial & Vocational Learning',
      desc: 'Dedicated modules for future accountants, managers, technicians, computer engineers, and entrepreneurs.',
      badge: 'Career Ready',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Study Assistant',
      desc: 'Instant 24/7 Edulpha AI tutor explaining step-by-step solutions for mathematics, physics, accounting, and technical formulas.',
      badge: 'Edulpha AI Assistant',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      icon: FileText,
      title: 'Exam Question Library',
      desc: 'Past examination papers with verified MINESEC & Cameroon GCE Board solution guides and paper breakdowns.',
      badge: 'Official Past Papers',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: ToolIcon,
      title: 'Practical Learning Resources',
      desc: 'Circuit schematics, workshop safety rules, technical drawing exercises, and commercial ledger calculations.',
      badge: 'Hands-on Practice',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      icon: LineChart,
      title: 'Progress Tracking & Analytics',
      desc: 'Real-time mastery dashboard pinpointing exact weak topics, revision progress, and predicted examination grades.',
      badge: 'Smart Metrics',
      color: 'bg-teal-50 text-teal-600 border-teal-200'
    },
    {
      icon: Calendar,
      title: 'Personalized Study Plans',
      desc: 'Custom study schedules generated around your target exam date, ensuring complete coverage before exam day.',
      badge: 'Tailored Schedule',
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      icon: Smartphone,
      title: 'Mobile Learning Anywhere',
      desc: 'Seamless study experience optimized across smartphones, tablets, and desktop computers with responsive layouts.',
      badge: 'Multi-Device',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    {
      icon: WifiOff,
      title: '100% Offline Support',
      desc: 'Dedicated Android APK allowing students to study notes, practice questions, and timed mocks with zero internet data.',
      badge: 'Offline APK',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      icon: Award,
      title: 'Mock Examinations & Timers',
      desc: 'Simulate official examination conditions with timed paper 1 & paper 2 drills and automated score summaries.',
      badge: 'Exam Conditions',
      color: 'bg-violet-50 text-violet-600 border-violet-200'
    },
    {
      icon: Trophy,
      title: 'Leaderboards & Achievements',
      desc: 'Stay motivated with daily study streaks, peer battle duels, school rankings, and unlockable achievement badges.',
      badge: 'Gamified Revision',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <section id="why-edulpha" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="primary" className="bg-rose-50 text-rose-700 border-rose-200">
            <Heart size={14} className="inline mr-1 text-rose-500 fill-rose-500" /> Student & Educator Choice
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Why Students Love <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edulpha</span>
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg leading-relaxed">
            From General Grammar students to Technical and Commercial specialists, Edulpha is built to simplify exam prep, boost pass rates, and foster academic confidence.
          </p>
        </div>

        {/* 11 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((pt, idx) => {
            const IconComp = pt.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (idx % 3) * 0.1 }}
              >
                <Card className="p-8 h-full bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${pt.color} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComp size={26} />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {pt.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {pt.title}
                    </h3>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600 gap-1 opacity-90 group-hover:opacity-100">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Included in All Plans</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center justify-center lg:justify-start gap-1">
              <Zap size={16} className="text-amber-500 fill-amber-500" /> Complete Exam Preparedness Guaranteed
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ready to Master Your General, Technical, or Commercial Exams?
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Join students across Cameroon passing their GCE Ordinary & Advanced levels, TVEE Intermediate/Advanced exams, and Baccalauréat with Edulpha.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link to="/auth">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                <span>Start Free Revision</span>
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
