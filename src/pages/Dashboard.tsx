import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowRight, 
  BookOpen, 
  BrainCircuit, 
  CreditCard, 
  Flame, 
  TrendingUp, 
  Target, 
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Button, Card, Badge, Progress } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    if (!user?.examHistory || user.examHistory.length === 0) {
      return {
        avgScore: 0,
        predictedGrade: 'N/A',
        readiness: 0,
        trend: 0,
        history: []
      };
    }

    const history = user.examHistory.map((e: any) => ({
      date: new Date(e.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: e.score,
      title: e.examTitle
    }));

    const avgScore = Math.round(user.examHistory.reduce((acc: number, curr: any) => acc + curr.score, 0) / user.examHistory.length);
    
    // Simple grade prediction logic
    let grade = 'F';
    if (avgScore >= 80) grade = 'A';
    else if (avgScore >= 70) grade = 'B';
    else if (avgScore >= 60) grade = 'C';
    else if (avgScore >= 50) grade = 'D';
    else if (avgScore >= 40) grade = 'E';

    // Readiness based on progress and avg score
    const progressWeight = (user.currentDay / 60) * 40; // 40% weight to progress
    const scoreWeight = (avgScore / 100) * 60; // 60% weight to avg score
    const readiness = Math.round(progressWeight + scoreWeight);

    // Trend (last vs second to last)
    let trend = 0;
    if (user.examHistory.length >= 2) {
      const last = user.examHistory[user.examHistory.length - 1].score;
      const prev = user.examHistory[user.examHistory.length - 2].score;
      trend = last - prev;
    }

    return { avgScore, predictedGrade: grade, readiness, trend, history };
  }, [user]);

  const currentStreak = useMemo(() => {
    if (!user || !user.lastCompletedAt) return 0;
    const lastDate = new Date(user.lastCompletedAt);
    const today = new Date();
    const lastDateMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (todayMidnight - lastDateMidnight > oneDay) return 0;
    return user.streak || 0;
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNextLesson();
    }
  }, [user]);

  const fetchNextLesson = async () => {
    try {
      const lessonsRef = collection(db, 'lessons');
      const q = query(lessonsRef, where('day', '==', user?.currentDay || 0), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setNextLesson(querySnapshot.docs[0].data());
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!user?.isPaid) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-8"
        >
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto rotate-3 shadow-lg shadow-indigo-100">
            <CreditCard size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Unlock Your Potential</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
              Join hundreds of students mastering Computer Science. Get full access to the 60-day challenge, smart insights, and grade predictions.
            </p>
          </div>
          <Link to="/payment" className="block">
            <Button size="lg" className="w-full sm:w-auto px-12 py-6 text-lg">
              Unlock Full Access <ArrowRight size={24} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-indigo-600 font-bold">{user.name.split(' ')[0]}</span>. Here's your progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
            <p className="text-xl font-black text-slate-900">#42</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Trophy size={24} />
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Avg Score", value: `${stats.avgScore}%`, icon: Target, color: "indigo", trend: stats.trend },
          { label: "Predicted Grade", value: stats.predictedGrade, icon: TrendingUp, color: "purple" },
          { label: "Daily Streak", value: `${currentStreak} Days`, icon: Flame, color: "orange" },
          { label: "Course Progress", value: `${Math.round((user.currentDay / 60) * 100)}%`, icon: BookOpen, color: "emerald" }
        ].map((stat, i) => (
          <Card key={i} className="p-6 hover:shadow-medium transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              {stat.trend !== undefined && (
                <Badge variant={stat.trend >= 0 ? "success" : "danger"} className="text-[10px]">
                  {stat.trend >= 0 ? "+" : ""}{stat.trend}%
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Column: Charts & Progress */}
        <div className="lg:col-span-8 space-y-10">
          {/* Performance Chart */}
          <Card className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance Trend</h3>
                <p className="text-sm text-slate-500 font-medium">Your score history over time</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">Last 7 Days</Badge>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {stats.history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.history}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <AlertCircle size={48} className="opacity-20" />
                  <p className="font-bold">No exam data yet. Take a quiz to see your trend!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Current Lesson & Roadmap */}
          <div className="grid md:grid-cols-2 gap-10">
            <Card className="p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 space-y-6">
                <Badge variant="info" className="text-[10px]">Day {user.currentDay} Challenge</Badge>
                {nextLesson ? (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{nextLesson.title}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2">{nextLesson.content}</p>
                    <Link to={`/lessons/${user.currentDay}`} className="block pt-2">
                      <Button className="w-full group">
                        Resume Learning <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ready for Day {user.currentDay}?</h3>
                    <p className="text-slate-500 text-sm font-medium">Your next lesson is waiting. Stay consistent to reach your goal.</p>
                    <Button className="w-full" disabled={loading}>
                      {loading ? "Loading..." : "Start Lesson"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Exam Readiness</h3>
                <Badge variant={stats.readiness > 70 ? "success" : stats.readiness > 40 ? "warning" : "danger"}>
                  {stats.readiness}%
                </Badge>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Syllabus Coverage</span>
                    <span>{Math.round((user.currentDay / 60) * 100)}%</span>
                  </div>
                  <Progress value={(user.currentDay / 60) * 100} color="primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Concept Mastery</span>
                    <span>{stats.avgScore}%</span>
                  </div>
                  <Progress value={stats.avgScore} color="primary" />
                </div>
                <div className="pt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Smart Insight</p>
                  <p className="text-xs text-slate-600 font-medium italic">
                    {stats.readiness > 70 
                      ? "You're on track for an A! Keep maintaining this consistency." 
                      : stats.readiness > 40 
                      ? "Good progress. Focus on improving your quiz scores to boost your grade." 
                      : "Start completing more daily lessons to increase your syllabus coverage."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Subject Breakdown & Recent Activity */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="p-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Subject Breakdown</h3>
            <div className="space-y-6">
              {[
                { name: "Programming", score: 85, color: "#4f46e5" },
                { name: "Data Structures", score: 72, color: "#7c3aed" },
                { name: "Networking", score: 64, color: "#2563eb" },
                { name: "Databases", score: 91, color: "#0891b2" }
              ].map((subject, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{subject.name}</span>
                    <span className="text-xs font-black text-slate-400">{subject.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${subject.score}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8 text-xs font-black uppercase tracking-widest">
              View Detailed Report
            </Button>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Recent Activity</h3>
            <div className="space-y-6">
              {user.examHistory && user.examHistory.length > 0 ? (
                user.examHistory.slice(-4).reverse().map((exam: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${exam.score >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{exam.examTitle}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {new Date(exam.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{exam.score}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto">
                    <Clock size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
