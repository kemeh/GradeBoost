import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  TrendingUp, Target, BookOpen, Sparkles, 
  ArrowRight, LogOut, LayoutDashboard, 
  FileText, Settings, Trophy, AlertCircle,
  Zap, ChevronRight, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, Progress, cn } from '../components/ui';
import { Grade, ExamResult, DailyDrill } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

const MOCK_TREND_DATA = [
  { day: 'Day 1', score: 45 },
  { day: 'Day 10', score: 52 },
  { day: 'Day 20', score: 58 },
  { day: 'Day 30', score: 65 },
  { day: 'Day 40', score: 72 },
  { day: 'Day 50', score: 78 },
  { day: 'Day 60', score: 85 },
];

const MOCK_PAPER_DATA = [
  { name: 'Paper 1', score: 82, color: '#6366f1' },
  { name: 'Paper 2', score: 64, color: '#a855f7' },
  { name: 'Paper 3', score: 75, color: '#0ea5e9' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDrill, setTodayDrill] = useState<DailyDrill | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(60);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch Results
        const resultsPath = 'results';
        const q = query(
          collection(db, resultsPath),
          where('userId', '==', user.uid),
          orderBy('completedAt', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const resultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
        setResults(resultsData.reverse());

        // Fetch Daily Drill
        const challengeStartDate = new Date('2024-03-01');
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - challengeStartDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentDay = Math.min(Math.max(diffDays, 1), 60);
        setDaysRemaining(60 - currentDay);

        const drillQ = query(
          collection(db, 'dailyDrills'), 
          where('dayNumber', '==', currentDay),
          where('subject', '==', user.subject)
        );
        const drillSnapshot = await getDocs(drillQ);
        if (!drillSnapshot.empty) {
          setTodayDrill({ id: drillSnapshot.docs[0].id, ...drillSnapshot.docs[0].data() } as DailyDrill);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const trendData = useMemo(() => {
    if (results.length === 0) return MOCK_TREND_DATA;
    return results.map((r, i) => ({
      day: `Test ${i + 1}`,
      score: r.score
    }));
  }, [results]);

  const paperData = useMemo(() => {
    if (results.length === 0) return MOCK_PAPER_DATA;
    
    const papers = ['Paper 1', 'Paper 2', 'Paper 3'];
    const colors = ['#6366f1', '#a855f7', '#0ea5e9'];
    
    return papers.map((name, i) => {
      const paperResults = results.filter(r => r.paperType === name);
      const avgScore = paperResults.length > 0 
        ? Math.round(paperResults.reduce((acc, curr) => acc + curr.score, 0) / paperResults.length)
        : 0;
      return { name, score: avgScore, color: colors[i] };
    });
  }, [results]);

  const readiness = useMemo(() => {
    if (results.length === 0) return 0;
    const avg = results.reduce((acc, curr) => acc + curr.score, 0) / results.length;
    return Math.round(avg);
  }, [results]);

  const predictedGrade = useMemo((): Grade => {
    if (readiness >= 80) return 'A';
    if (readiness >= 70) return 'B';
    if (readiness >= 60) return 'C';
    if (readiness >= 50) return 'D';
    return 'F';
  }, [readiness]);

  const insights = useMemo(() => {
    const paperScores = paperData.filter(p => p.score > 0);
    if (paperScores.length === 0) {
      return [
        { 
          type: 'action', 
          title: 'Get Started', 
          desc: 'Complete your first practice session to unlock smart insights.',
          icon: Zap,
          color: 'text-amber-600',
          bg: 'bg-amber-50'
        }
      ];
    }

    const sorted = [...paperScores].sort((a, b) => a.score - b.score);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    const list = [];

    if (weakest.score < 70) {
      list.push({
        type: 'weakness',
        title: `${weakest.name} Gap`,
        desc: `Your ${weakest.name} scores are averaging ${weakest.score}%. Focus on this area to reach an A.`,
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50'
      });
    }

    list.push({
      type: 'action',
      title: 'Recommended Focus',
      desc: `Practice 3 structured questions from ${weakest.name} today to improve your accuracy.`,
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    });

    if (strongest.score >= 80) {
      list.push({
        type: 'strength',
        title: `${strongest.name} Mastery`,
        desc: `You are hitting ${strongest.score}% in ${strongest.name}. Keep maintaining this consistency.`,
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
      });
    }

    return list;
  }, [paperData]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user.name}! Ready to improve to an A grade?</h1>
            <p className="text-slate-500 font-medium">You have full access to all practice materials, interactive quizzes, and performance insights.</p>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'student' && user.paymentExpiryDate && (
              <Badge variant="default" className="px-4 py-2 border-slate-200">
                Expires: {new Date(user.paymentExpiryDate).toLocaleDateString()}
              </Badge>
            )}
            <Badge variant="primary" className="px-4 py-2">Target: Grade A</Badge>
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
              <Zap className="text-amber-500" size={20} />
            </div>
          </div>
        </header>

        {/* Daily Drill Highlight */}
        <section className="mb-12">
          <Card className="p-8 bg-indigo-600 text-white overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Day {60 - daysRemaining} of 60
                  </div>
                  <Badge variant="secondary" className="bg-amber-400 text-amber-950 border-none">Daily Drill</Badge>
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">
                  {todayDrill ? `Today's Topic: ${todayDrill.topic}` : "Today's Drill is Loading..."}
                </h2>
                <p className="text-indigo-100 font-medium mb-6 max-w-xl">
                  {todayDrill 
                    ? `Master ${todayDrill.topic} with today's ${todayDrill.paperType} drill. Keep your streak alive!`
                    : "Get ready for your daily challenge. Consistency is key to achieving an A grade."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="secondary" 
                    className="bg-white text-indigo-600 hover:bg-indigo-50 font-black px-8 py-6 rounded-2xl"
                    onClick={() => navigate('/daily-drill')}
                  >
                    Start Drill Now
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                    <Trophy className="text-amber-400" size={20} />
                    <span className="text-sm font-bold">{daysRemaining} Days Left in Challenge</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                  <Zap size={80} className="text-white/20" />
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          </Card>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Predicted Grade', value: predictedGrade, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Current Score', value: `${readiness}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Exam Readiness', value: `${readiness}%`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Days Remaining', value: '42', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat, i) => (
            <Card key={i} className="p-8 space-y-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* PDFs & Resources Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">PDFs & Resources</h2>
            </div>
            <Link to="/papers" className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Syllabus Guide', type: 'PDF', size: '1.2 MB' },
              { title: 'Formula Sheet', type: 'PDF', size: '0.8 MB' },
              { title: 'Exam Tips', type: 'PDF', size: '2.1 MB' },
            ].map((resource, i) => (
              <Card key={i} className="p-6 hover:border-indigo-200 transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{resource.title}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.type} • {resource.size}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-all" size={20} />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Admin-Assigned Papers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned for You</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Mock Exam 2025', paper: 'Paper 1', due: 'In 2 days' },
              { title: 'Practical Session', paper: 'Paper 3', due: 'In 5 days' },
            ].map((assigned, i) => (
              <Card key={i} className="p-8 border-l-4 border-l-amber-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">{assigned.due}</Badge>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{assigned.title}</h3>
                    <p className="text-slate-500 font-medium">{assigned.paper} • {user.subject}</p>
                  </div>
                  <Button className="bg-slate-900 hover:bg-black text-white">Start Now</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Performance Trend */}
          <Card className="xl:col-span-2 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Performance Trend</h2>
              <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-xl px-4 py-2 outline-none">
                <option>Last 60 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 900, color: '#0f172a' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Smart Insights */}
          <Card className="p-8 space-y-8">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Smart Insights</h2>
            </div>

            <div className="space-y-6">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", insight.bg, insight.color)}>
                    <insight.icon size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900">{insight.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full group">
              View Focus Path <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Paper Comparison */}
          <Card className="p-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Paper Comparison</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paperData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={32}>
                    {paperData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Exam Readiness Meter */}
          <Card className="p-8 flex flex-col justify-center">
            <div className="text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-48 h-48">
                  <circle
                    className="text-slate-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="80"
                    cx="96"
                    cy="96"
                  />
                  <circle
                    className="text-indigo-600"
                    strokeWidth="12"
                    strokeDasharray={502}
                    strokeDashoffset={502 - (502 * readiness) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="80"
                    cx="96"
                    cy="96"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">{readiness}%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Almost there!</h3>
                <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                  You need to improve your Paper 2 score by 16% to reach your target Grade A.
                </p>
              </div>
              <Link to="/practice">
                <Button className="w-full">Start Practice Session</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
