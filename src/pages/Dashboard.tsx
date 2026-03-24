import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  TrendingUp, Target, BookOpen, 
  ArrowRight, LogOut, 
  FileText, Settings, Trophy, AlertCircle,
  Zap, ChevronRight, CheckCircle2, Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs, limit, onSnapshot, doc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import { 
  Button, Card, Badge, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  RadioGroup, RadioGroupItem, Label, Skeleton
} from '../components/ui';
import { DailyDrill, SampleQuestion, WeeklyLeaderboard } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { getWeekNumber } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';
import { updateStreak } from '../services/gamificationService';

import { getCurrentDayNumber, getDaysRemaining } from '../utils/challenge';
import { getSystemSettings } from '../services/settingsService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drillLoading, setDrillLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [todayDrill, setTodayDrill] = useState<DailyDrill | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(60);
  const [sampleQuestions, setSampleQuestions] = useState<SampleQuestion[]>([]);
  const [selectedSample, setSelectedSample] = useState<SampleQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboard[]>([]);
  const [userLeaderboard, setUserLeaderboard] = useState<WeeklyLeaderboard | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userStreak, setUserStreak] = useState(0);

  useEffect(() => {
    if (user) {
      updateStreak(user.uid).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Fetch User Profile for firstName
    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setFirstName(userData.firstName || userData.name?.split(' ')[0] || 'Student');
        setUserPoints(userData.points || 0);
        setUserStreak(userData.streak || 0);
      }
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } catch (e) {
        console.error("Dashboard UserProfile Error:", e);
      }
    });

    // Fetch Daily Drill
    const fetchDrillData = async () => {
      setDrillLoading(true);
      try {
        const settings = await getSystemSettings();
        const startDate = settings?.challengeStartDate;
        
        const currentDay = getCurrentDayNumber(startDate);
        setDaysRemaining(getDaysRemaining(startDate));

        const drillQ = query(
          collection(db, 'daily_drills'), 
          where('day', '==', currentDay),
          where('subject', '==', user.subject || ''),
          limit(1)
        );
        
        const drillSnapshot = await getDocs(drillQ);
        if (!drillSnapshot.empty) {
          const drillData = { id: drillSnapshot.docs[0].id, ...drillSnapshot.docs[0].data() } as DailyDrill;
          setTodayDrill(drillData);

          // Check if already submitted today
          const subQ = query(
            collection(db, 'drill_submissions'),
            where('userId', '==', user.uid),
            where('day', '==', currentDay),
            limit(1)
          );
          const subSnapshot = await getDocs(subQ);
          if (!subSnapshot.empty) {
            setHasSubmittedToday(true);
          }
        } else {
          setTodayDrill(null);
        }
      } catch (err) {
        console.error("Dashboard Drill Fetch Error:", err);
      } finally {
        setDrillLoading(false);
      }
    };

    fetchDrillData();

    // Fetch Weekly Leaderboard
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    setLeaderboardLoading(true);
    const leaderboardQuery = query(
      collection(db, 'weekly_leaderboard'),
      where('weekNumber', '==', weekNumber),
      where('year', '==', year),
      where('subject', '==', user.subject || ''),
      orderBy('position', 'asc'),
      limit(5)
    );

    const leaderboardUnsub = onSnapshot(leaderboardQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        const name = d.userName || 'Student';
        return { 
          id: doc.id, 
          ...d, 
          userName: name === 'Anonymous' ? 'Student' : name 
        } as WeeklyLeaderboard;
      });
      setLeaderboard(data);
      setLeaderboardLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'weekly_leaderboard');
      } catch (e) {
        console.error("Dashboard Leaderboard Error:", e);
      } finally {
        setLeaderboardLoading(false);
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

    // Fetch Sample Questions if unpaid
    if (user.paymentStatus !== 'paid') {
      const samplesQ = query(
        collection(db, 'sampleQuestions'),
        where('subject', '==', user.subject || ''),
        limit(3)
      );
      getDocs(samplesQ).then(samplesSnapshot => {
        setSampleQuestions(samplesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SampleQuestion)));
      }).catch(err => console.error("Sample Questions Error:", err));
    }

    setLoading(false);

    return () => {
      userUnsub();
      leaderboardUnsub();
      userLeaderboardUnsub();
    };
  }, [user]);

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

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        {user.paymentStatus === 'pending' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-black text-amber-900">Payment Pending Verification</h3>
              <p className="text-xs text-amber-700 font-medium mt-1">Your payment is currently being reviewed by our team. You will get full access once approved.</p>
            </div>
          </div>
        )}
        {user.paymentStatus === 'rejected' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-black text-red-900">Payment Rejected</h3>
              <p className="text-xs text-red-700 font-medium mt-1">We could not verify your recent payment submission. Please check your details and try again.</p>
            </div>
            <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100" onClick={() => navigate('/payment')}>
              Submit New Payment
            </Button>
          </div>
        )}
        <header className="flex flex-col md:row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {firstName ? `Welcome, ${firstName}!` : <Skeleton className="h-10 w-64" />}
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              {user.paymentStatus === 'paid' 
                ? "You have full access to all practice materials, interactive quizzes, and performance insights."
                : "Try our free sample questions or unlock the full course for complete access to all materials."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="primary" className="px-4 py-2">Target: Grade A</Badge>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
              <Zap className="text-amber-500" size={16} />
              <span className="text-sm font-black text-amber-700">{userStreak} Day Streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <Trophy className="text-indigo-600" size={16} />
              <span className="text-sm font-black text-indigo-700">{userPoints} Points</span>
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
                  {drillLoading ? <Skeleton className="h-9 w-48 bg-white/20" /> : (todayDrill ? `Today's Topic: ${todayDrill.topic}` : "No Drill Scheduled for Today")}
                </h2>
                <p className="text-indigo-100 font-medium mb-6 max-w-xl">
                  {drillLoading ? <Skeleton className="h-4 w-full bg-white/20" /> : (todayDrill 
                    ? `Master ${todayDrill.topic} with today's ${todayDrill.subject} drill. Keep your streak alive!`
                    : "Check back tomorrow for a new challenge or practice with sample questions below.")}
                </p>
                <div className="flex flex-wrap gap-4">
                  {drillLoading ? <Skeleton className="h-14 w-40 bg-white/20" /> : (user.paymentStatus === 'paid' || (todayDrill && (todayDrill.day === 1 || todayDrill.isFree)) ? (
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
                  ))}
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

        {/* Duel Battle Highlight */}
        <section className="mb-12">
          <Card className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Duel Battle</h2>
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">Challenge Other Students!</h3>
              <p className="text-slate-400 font-medium mb-8 max-w-lg">
                Test your knowledge in real-time against other students. Earn points, climb the leaderboard, and prove you're the best in {user.subject}.
              </p>
              <Button 
                onClick={() => navigate('/duel')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-6 rounded-2xl"
              >
                Find an Opponent
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 p-8 opacity-10">
              <Trophy size={160} />
            </div>
          </Card>
        </section>

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
                {leaderboardLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : (
                  leaderboard.length > 0 ? (
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
                  )
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
                      {leaderboardLoading ? <Skeleton className="h-10 w-16 bg-white/20" /> : (userLeaderboard ? `#${userLeaderboard.position}` : 'N/A')}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Points</p>
                    <p className="text-4xl font-black text-white tracking-tighter">
                      {leaderboardLoading ? <Skeleton className="h-10 w-16 bg-white/20" /> : (userLeaderboard ? userLeaderboard.totalScore : '0')}
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

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Assignments', path: '/dashboard', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Practice Papers', path: '/practice', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Diagnostic', path: '/diagnostic', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Profile Settings', path: '/profile', icon: Settings, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((item, i) => (
            <Card 
              key={i} 
              className="p-8 space-y-4 cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate(item.path)}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", item.bg, item.color)}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quick Access</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{item.label}</p>
              </div>
            </Card>
          ))}
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
