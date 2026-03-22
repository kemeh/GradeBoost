import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  TrendingUp, Target, BookOpen, Sparkles, 
  ArrowRight, LogOut, LayoutDashboard, 
  FileText, Settings, Trophy, AlertCircle,
  Zap, ChevronRight, CheckCircle2, Lock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { 
  Button, Card, Badge, Progress, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  RadioGroup, RadioGroupItem, Label
} from '../components/ui';
import { Grade, ExamResult, DailyDrill, SampleQuestion, DrillSubmission, LearningResource, Resource, Assignment, WeeklyLeaderboard } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { formatDate, getWeekNumber } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';
import { onSnapshot, doc } from 'firebase/firestore';

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

import { getCurrentDayNumber, getDaysRemaining } from '../utils/challenge';
import { getSystemSettings } from '../services/settingsService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [submissions, setSubmissions] = useState<DrillSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDrill, setTodayDrill] = useState<DailyDrill | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(60);
  const [sampleQuestions, setSampleQuestions] = useState<SampleQuestion[]>([]);
  const [selectedSample, setSelectedSample] = useState<SampleQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [firstName, setFirstName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboard[]>([]);
  const [userLeaderboard, setUserLeaderboard] = useState<WeeklyLeaderboard | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch User Profile for firstName
    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setFirstName(userData.firstName || userData.name?.split(' ')[0] || 'Student');
      }
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } catch (e) {
        console.error("Dashboard UserProfile Error:", e);
      }
    });

    // Fetch Results
    const resultsQuery = query(
      collection(db, 'results'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const resultsUnsub = onSnapshot(resultsQuery, (snapshot) => {
      const resultsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
      setResults(resultsData);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'results');
      } catch (e) {
        console.error("Dashboard Results Error:", e);
      }
    });

    // Fetch Drill Submissions
    const submissionsQuery = query(
      collection(db, 'drill_submissions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const submissionsUnsub = onSnapshot(submissionsQuery, (snapshot) => {
      const subsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrillSubmission));
      setSubmissions(subsData);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'drill_submissions');
      } catch (e) {
        console.error("Dashboard Submissions Error:", e);
      }
    });

    // Fetch Learning Resources
    const resourcesQuery = query(
      collection(db, 'learning_resources'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );
    const resourcesUnsub = onSnapshot(resourcesQuery, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningResource));
      setLearningResources(resourcesData);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'learning_resources');
      } catch (e) {
        console.error("Dashboard LearningResources Error:", e);
      }
    });

    // Fetch Resources (PDFs, etc.)
    const pdfResourcesQuery = query(
      collection(db, 'resources'),
      where('visible', '==', true),
      orderBy('createdAt', 'desc')
    );
    const pdfResourcesUnsub = onSnapshot(pdfResourcesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      setResources(data);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'resources');
      } catch (e) {
        console.error("Dashboard Resources Error:", e);
      }
    });

    // Fetch Assignments
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('active', '==', true),
      orderBy('dueDate', 'asc')
    );
    const assignmentsUnsub = onSnapshot(assignmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(data);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'assignments');
      } catch (e) {
        console.error("Dashboard Assignments Error:", e);
      }
    });

    // Fetch Daily Drill
    const fetchDrillData = async () => {
      const settings = await getSystemSettings();
      const startDate = settings?.challengeStartDate;
      
      const currentDay = getCurrentDayNumber(startDate);
      setDaysRemaining(getDaysRemaining(startDate));

      const drillQ = query(
        collection(db, 'daily_drills'), 
        where('day', '==', currentDay)
      );
      
      return getDocs(drillQ).then(drillSnapshot => {
        if (!drillSnapshot.empty) {
          const drillData = { id: drillSnapshot.docs[0].id, ...drillSnapshot.docs[0].data() } as DailyDrill;
          setTodayDrill(drillData);

          // Check if already submitted today
          const subQ = query(
            collection(db, 'drill_submissions'),
            where('userId', '==', user.uid),
            where('day', '==', currentDay)
          );
          return getDocs(subQ).then(subSnapshot => {
            if (!subSnapshot.empty) {
              setHasSubmittedToday(true);
            }
          }).catch(err => {
            console.error("Dashboard Submission Check Error:", err);
          });
        } else {
          console.log(`No drill found for day ${currentDay}`);
          setTodayDrill(null);
        }
      }).catch(err => {
        console.error("Dashboard Drill Fetch Error:", err);
        try {
          handleFirestoreError(err, OperationType.GET, 'daily_drills');
        } catch (e) {
          // Error already logged
        }
      });
    };

    const drillPromise = fetchDrillData();

    // Fetch Sample Questions if unpaid
    if (user.paymentStatus !== 'paid') {
      const samplesQ = query(
        collection(db, 'sampleQuestions'),
        where('subject', '==', user.subject),
        limit(10)
      );
      getDocs(samplesQ).then(samplesSnapshot => {
        setSampleQuestions(samplesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SampleQuestion)));
      });
    }

    // Fetch Weekly Leaderboard
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    const leaderboardQuery = query(
      collection(db, 'weekly_leaderboard'),
      where('weekNumber', '==', weekNumber),
      where('year', '==', year),
      orderBy('position', 'asc'),
      limit(5)
    );

    const leaderboardUnsub = onSnapshot(leaderboardQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyLeaderboard));
      setLeaderboard(data);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'weekly_leaderboard');
      } catch (e) {
        console.error("Dashboard Leaderboard Error:", e);
      }
    });

    // Fetch user's position
    const userLeaderboardId = `${year}-W${weekNumber}-${user.uid}`;
    const userLeaderboardUnsub = onSnapshot(doc(db, 'weekly_leaderboard', userLeaderboardId), (doc) => {
      if (doc.exists()) {
        setUserLeaderboard({ id: doc.id, ...doc.data() } as WeeklyLeaderboard);
      } else {
        setUserLeaderboard(null);
      }
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `weekly_leaderboard/${userLeaderboardId}`);
      } catch (e) {
        console.error("Dashboard UserLeaderboard Error:", e);
      }
    });

    // Wait for all non-snapshot fetches to complete
    Promise.all([drillPromise]).finally(() => {
      setLoading(false);
    });

    return () => {
      userUnsub();
      resultsUnsub();
      submissionsUnsub();
      resourcesUnsub();
      pdfResourcesUnsub();
      assignmentsUnsub();
      leaderboardUnsub();
      userLeaderboardUnsub();
    };
  }, [user]);

  const stats = useMemo(() => {
    const totalDrills = submissions.length;
    const totalScore = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = totalDrills > 0 ? Math.round(totalScore / totalDrills) : 0;

    // Calculate Strength & Weakness
    const topicScores: { [key: string]: { total: number, count: number } } = {};
    submissions.forEach(sub => {
      if (sub.topic) {
        if (!topicScores[sub.topic]) {
          topicScores[sub.topic] = { total: 0, count: 0 };
        }
        topicScores[sub.topic].total += sub.score || 0;
        topicScores[sub.topic].count += 1;
      }
    });

    const topicAverages = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      avg: data.total / data.count
    }));

    const sortedTopics = [...topicAverages].sort((a, b) => b.avg - a.avg);
    const strength = sortedTopics.length > 0 ? sortedTopics[0].topic : 'N/A';
    const weakness = sortedTopics.length > 0 ? sortedTopics[sortedTopics.length - 1].topic : 'N/A';

    return {
      totalDrills,
      avgScore,
      strength,
      weakness
    };
  }, [submissions]);

  const trendData = useMemo(() => {
    if (submissions.length === 0) return MOCK_TREND_DATA;
    // Show last 10 submissions trend
    return [...submissions].reverse().slice(-10).map((s, i) => ({
      day: `Drill ${i + 1}`,
      score: s.score
    }));
  }, [submissions]);

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
    if (submissions.length === 0) return 0;
    return stats.avgScore;
  }, [submissions, stats]);

  const predictedGrade = useMemo((): Grade => {
    if (readiness >= 80) return 'A';
    if (readiness >= 70) return 'B';
    if (readiness >= 60) return 'C';
    if (readiness >= 50) return 'D';
    return 'F';
  }, [readiness]);

  const handleCheckAnswer = () => {
    if (!selectedSample || !selectedAnswer) return;
    const correct = selectedAnswer === selectedSample.correctAnswer;
    setIsCorrect(correct);
    setShowAnswer(true);
    if (correct) {
      toast.success('Correct! Well done.');
    } else {
      toast.error('Not quite right. Check the reasoning below.');
    }
  };

  const handleCloseSample = () => {
    setSelectedSample(null);
    setSelectedAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
  };

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

  const calculateRemainingDays = (dueDate: any) => {
    if (!dueDate) return '';
    const now = new Date();
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    
    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'In 1 day';
    return `In ${diffDays} days`;
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {firstName}! Ready to improve to an A grade?</h1>
            <p className="text-slate-500 font-medium">
              {user.paymentStatus === 'paid' 
                ? "You have full access to all practice materials, interactive quizzes, and performance insights."
                : "Try our free sample questions or unlock the full course for complete access to all materials."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'student' && user.paymentExpiryDate && (
              <Badge variant="default" className="px-4 py-2 border-slate-200">
                Expires: {formatDate(user.paymentExpiryDate)}
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
                  {todayDrill ? `Today's Topic: ${todayDrill.topic}` : (loading ? "Today's Drill is Loading..." : "No Drill Scheduled for Today")}
                </h2>
                <p className="text-indigo-100 font-medium mb-6 max-w-xl">
                  {todayDrill 
                    ? `Master ${todayDrill.topic} with today's ${todayDrill.subject} drill. Keep your streak alive!`
                    : (loading ? "Get ready for your daily challenge. Consistency is key to achieving an A grade." : "Check back tomorrow for a new challenge or practice with sample questions below.")}
                </p>
                <div className="flex flex-wrap gap-4">
                  {user.paymentStatus === 'paid' || (todayDrill && (todayDrill.day === 1 || todayDrill.isFree)) ? (
                    <Button 
                      variant="secondary" 
                      className={cn(
                        "font-black px-8 py-6 rounded-2xl transition-all",
                        hasSubmittedToday 
                          ? "bg-emerald-400 text-emerald-950 cursor-default" 
                          : "bg-white text-indigo-600 hover:bg-indigo-50"
                      )}
                      onClick={() => !hasSubmittedToday && navigate('/daily-drill')}
                    >
                      {hasSubmittedToday ? (
                        <>
                          <CheckCircle2 className="mr-2" size={20} />
                          Completed Today
                        </>
                      ) : (
                        <>
                          Start Drill Now
                          <ArrowRight className="ml-2" size={20} />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      className="font-black px-8 py-6 rounded-2xl bg-indigo-500/50 text-indigo-200 cursor-not-allowed"
                      onClick={() => navigate('/payment')}
                    >
                      <Lock className="mr-2" size={20} />
                      Unlock to Start
                    </Button>
                  )}
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

        {/* Free Sample Questions for Unpaid Users */}
        {user.paymentStatus !== 'paid' && sampleQuestions.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Free Sample Questions</h2>
                <p className="text-slate-500 text-sm font-medium">Try these sample questions to see what's in the full course.</p>
              </div>
              <Link 
                to="/pricing" 
                className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Unlock Full Course <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleQuestions.map((sample, idx) => (
                <Card 
                  key={sample.id} 
                  className="p-6 hover:shadow-lg transition-all cursor-pointer border-slate-100 group"
                  onClick={() => setSelectedSample(sample)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="primary" className="text-[10px] font-black uppercase tracking-widest">
                      {sample.topic}
                    </Badge>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <BookOpen size={16} className="text-indigo-600 group-hover:text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                    {sample.questionText}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sample {idx + 1}</span>
                    <span className="text-indigo-600 font-bold text-xs flex items-center gap-1">
                      Try Now <ChevronRight size={14} />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Drills', value: stats.totalDrills, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Average Score', value: `${stats.avgScore}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Strength Area', value: stats.strength, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Weak Area', value: stats.weakness, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((stat, i) => (
            <Card key={i} className="p-8 space-y-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 tracking-tight truncate">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Weekly Leaderboard Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Weekly Leaderboard</h2>
                </div>
                <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100">
                  Week {getWeekNumber(new Date())}
                </Badge>
              </div>

              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        entry.userId === user.uid 
                          ? "bg-indigo-50 border-indigo-100 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                          entry.position === 1 ? "bg-amber-100 text-amber-600" :
                          entry.position === 2 ? "bg-slate-100 text-slate-400" :
                          entry.position === 3 ? "bg-orange-100 text-orange-600" :
                          "bg-slate-50 text-slate-400"
                        )}>
                          {entry.position}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {entry.userName}
                            {entry.userId === user.uid && <span className="ml-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">(You)</span>}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performer</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{entry.totalScore} pts</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No leaderboard data available for this week yet.</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 bg-slate-900 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black mb-2 tracking-tight">Your Standing</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Keep practicing to climb the ranks and reach the top spot!</p>
                
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Position</p>
                    <p className="text-4xl font-black text-white tracking-tighter">
                      {userLeaderboard ? `#${userLeaderboard.position}` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Points</p>
                    <p className="text-4xl font-black text-white tracking-tighter">
                      {userLeaderboard ? userLeaderboard.totalScore : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 rounded-2xl"
                  onClick={() => navigate('/daily-drill')}
                >
                  Earn More Points
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Assigned For You Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Target size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned For You</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="p-6 border-l-4 border-l-amber-500">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                        {assignment.subject}
                      </Badge>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg",
                        calculateRemainingDays(assignment.dueDate) === 'Overdue' 
                          ? "bg-rose-100 text-rose-600" 
                          : "bg-amber-100 text-amber-600"
                      )}>
                        {calculateRemainingDays(assignment.dueDate)}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">{assignment.paper}</p>
                    <div className="mt-auto">
                      <Button 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
                        onClick={() => window.open(assignment.link, '_blank')}
                      >
                        Start Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No assignments currently active.</p>
              </div>
            )}
          </div>
        </section>

        {/* PDFs & Resources Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">PDFs & Resources</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.length > 0 ? (
              resources.map((res) => (
                <Card 
                  key={res.id} 
                  className="p-6 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => window.open(res.fileUrl, '_blank')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{res.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.type}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.fileSize}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No resources available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recommended Learning Resources */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recommended Learning Resources</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningResources.length > 0 ? (
              learningResources.map((resource) => (
                <Card key={resource.id} className="p-6 hover:border-indigo-200 transition-all group">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                        {resource.topic}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{resource.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{resource.description}</p>
                    <div className="mt-auto">
                      <a 
                        href={resource.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        View Resource <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No learning resources available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
            </div>
          </div>
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((result) => (
                <Card key={result.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{result.paperType} - {result.subject}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Completed on {formatDate(result.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{result.score}%</p>
                    <Badge variant={result.score >= 70 ? "primary" : "secondary"}>
                      Grade {result.grade}
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No recent activity found.</p>
              </div>
            )}
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

      {/* Sample Question Modal */}
      <Dialog open={!!selectedSample} onOpenChange={(open) => !open && handleCloseSample()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {selectedSample?.topic} - Sample Question
            </DialogTitle>
            <DialogDescription className="font-medium">
              Test your knowledge with this free sample question.
            </DialogDescription>
          </DialogHeader>

          {selectedSample && (
            <div className="space-y-6 py-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-lg font-bold text-slate-900 leading-relaxed">
                  {selectedSample.questionText}
                </p>
              </div>

              <RadioGroup 
                value={selectedAnswer} 
                onValueChange={setSelectedAnswer}
                disabled={showAnswer}
                className="grid grid-cols-1 gap-3"
              >
                {Object.entries(selectedSample.options).map(([key, value]) => (
                  <div key={key}>
                    <RadioGroupItem
                      value={key}
                      id={`option-${key}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`option-${key}`}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50",
                        selectedAnswer === key ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100",
                        showAnswer && key === selectedSample.correctAnswer && "border-emerald-500 bg-emerald-50",
                        showAnswer && selectedAnswer === key && key !== selectedSample.correctAnswer && "border-rose-500 bg-rose-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
                          selectedAnswer === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {key}
                        </span>
                        <span className="font-bold text-slate-700">{value}</span>
                      </div>
                      {showAnswer && key === selectedSample.correctAnswer && (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      )}
                      {showAnswer && selectedAnswer === key && key !== selectedSample.correctAnswer && (
                        <AlertCircle className="text-rose-500" size={20} />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-2xl border",
                    isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="text-emerald-600" size={20} />
                    ) : (
                      <AlertCircle className="text-rose-600" size={20} />
                    )}
                    <span className={cn(
                      "font-black uppercase tracking-widest text-xs",
                      isCorrect ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                    </span>
                  </div>
                  <p className={cn(
                    "font-bold mb-4",
                    isCorrect ? "text-emerald-900" : "text-rose-900"
                  )}>
                    The correct answer is {selectedSample.correctAnswer}.
                  </p>
                  <div className="pt-4 border-t border-black/5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Reasoning</p>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {selectedSample.reasoning}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            {!showAnswer ? (
              <Button 
                onClick={handleCheckAnswer} 
                disabled={!selectedAnswer}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-6 rounded-2xl"
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                onClick={handleCloseSample}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-6 rounded-2xl"
              >
                Close Sample
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto border-slate-200 font-black px-8 py-6 rounded-2xl"
            >
              Unlock Full Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
