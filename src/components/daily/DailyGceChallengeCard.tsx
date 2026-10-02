import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Flame, CheckCircle2, Clock, 
  ArrowRight, BookOpen, AlertCircle, RefreshCw, Trophy, Target
} from 'lucide-react';
import { Button, Badge, cn } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchTodayGceQuestions, TodayGceResponse } from '../../services/dailyGceService';

export default function DailyGceChallengeCard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [data, setData] = useState<TodayGceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Student's level: default to user.academicLevel, user.level, or 'Advanced Level'
  const userLevel = (user?.academicLevel?.toLowerCase().includes('ordinary') || user?.level?.toLowerCase().includes('ordinary'))
    ? 'Ordinary Level'
    : 'Advanced Level';

  useEffect(() => {
    let isMounted = true;
    async function loadToday() {
      setLoading(true);
      try {
        const res = await fetchTodayGceQuestions({
          studentId: user?.uid,
          level: userLevel,
          enrolledSubjects: user?.subject ? [user.subject] : undefined,
          language: language === 'fr' ? 'fr' : 'en'
        });
        if (isMounted) {
          setData(res);
        }
      } catch (e) {
        console.error('Error loading daily challenge card:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadToday();
    return () => { isMounted = false; };
  }, [user?.uid, userLevel, user?.subject, language]);

  const streakCount = data?.streak?.currentStreak || 0;
  const questions = data?.questions || [];
  const completedCount = data?.completedCount || 0;
  const totalCount = questions.length || 5;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
      {/* Decorative Background Accent */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-3 py-1 text-xs font-black uppercase flex items-center gap-1.5 shadow-sm">
              <Flame size={14} className="fill-amber-400 text-amber-400 animate-pulse" />
              <span>{streakCount}-Day GCE Streak</span>
            </Badge>

            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 px-3 py-1 text-xs font-bold uppercase flex items-center gap-1.5">
              <Target size={13} className="text-indigo-400" />
              <span>Cameroon GCE {userLevel}</span>
            </Badge>

            {data?.isDayCompleted && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-1 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Today's Challenge Completed</span>
              </Badge>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Daily GCE Challenge</span>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
              Curriculum-standard exam questions generated daily from verified past papers and GCE syllabus specifications.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <BookOpen size={14} className="text-indigo-400" />
              <span>{totalCount} Questions Today</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Clock size={14} className="text-purple-400" />
              <span>~25 Min Practice</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Trophy size={14} className="text-amber-400" />
              <span>{completedCount} / {totalCount} Completed ({progressPercent}%)</span>
            </div>
          </div>

          {/* Subject Pills */}
          {questions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Papers:</span>
              {questions.slice(0, 5).map((q) => (
                <span 
                  key={q.questionId}
                  className={cn(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition",
                    q.isAnswered 
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-800/80 text-slate-200 border-slate-700/80"
                  )}
                >
                  {q.isAnswered && <CheckCircle2 size={11} className="text-emerald-400" />}
                  <span>{q.subject} ({q.paper})</span>
                </span>
              ))}
              {questions.length > 5 && (
                <span className="text-[11px] text-slate-400 font-bold">+{questions.length - 5} more</span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 justify-center">
          <Button
            onClick={() => navigate('/daily-challenge')}
            className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 transition active:scale-95 border border-indigo-400/30"
          >
            <span>{data?.isDayCompleted ? 'Review Daily Challenge' : 'Start Daily Challenge'}</span>
            <ArrowRight size={16} />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/daily-challenge?tab=history')}
              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 text-xs font-bold py-2.5 rounded-xl"
            >
              Review Mistakes
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/mock-exams')}
              className="flex-1 bg-white/5 hover:bg-white/10 text-indigo-300 border-indigo-500/20 text-xs font-bold py-2.5 rounded-xl"
            >
              Mock Exams
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
