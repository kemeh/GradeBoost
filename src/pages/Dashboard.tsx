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
import { Button, Card, Badge, Progress, cn } from '../components/ui';
import { Grade, ExamResult } from '../types';
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

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      const path = 'results';
      try {
        const q = query(
          collection(db, path),
          where('userId', '==', user.uid),
          orderBy('completedAt', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const resultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
        setResults(resultsData.reverse()); // Chronological for trend
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col p-8 fixed h-full z-20">
        <div className="flex items-center gap-2 mb-12">
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
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight">GradeBoost 60</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">by Vertexon Technologies</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
            { icon: FileText, label: 'Practice Papers', path: '/practice' },
            { icon: Target, label: 'Diagnostic', path: '/diagnostic' },
            { icon: Trophy, label: 'Achievements', path: '#' },
            { icon: Settings, label: 'Profile Settings', path: '/profile' },
          ].map((item, i) => (
            <Link 
              key={i} 
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all",
                item.active 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              This platform is developed by Vertexon Technologies to help students improve and achieve academic excellence.
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-8 md:p-12">
        <header className="flex flex-col md:row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user.name}</h1>
            <p className="text-slate-500 font-medium">Your path to an A in {user.subject} is 72% complete.</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="primary" className="px-4 py-2">Target: Grade A</Badge>
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
              <Zap className="text-amber-500" size={20} />
            </div>
          </div>
        </header>

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
              {[
                { 
                  type: 'weakness', 
                  title: 'Paper 2 Gap', 
                  desc: 'Your structured answers are 15% below target. Focus on keyword accuracy.',
                  icon: AlertCircle,
                  color: 'text-red-600',
                  bg: 'bg-red-50'
                },
                { 
                  type: 'action', 
                  title: 'Recommended Focus', 
                  desc: 'Practice 3 structured questions from 2023 Paper 2 today.',
                  icon: Zap,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50'
                },
                { 
                  type: 'strength', 
                  title: 'MCQ Mastery', 
                  desc: 'You are hitting 85% in Paper 1. Keep maintaining this consistency.',
                  icon: CheckCircle2,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50'
                }
              ].map((insight, i) => (
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
