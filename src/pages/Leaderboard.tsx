import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, TrendingUp, Zap, Star } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { WeeklyLeaderboard } from '../types';
import { Card, Badge, cn } from '../components/ui';
import Sidebar from '../components/Sidebar';
import { getWeekNumber } from '../utils/dateUtils';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'all-time'>('weekly');

  useEffect(() => {
    const now = new Date();
    const week = getWeekNumber(now);
    const year = now.getFullYear();

    const q = timeframe === 'weekly' 
      ? query(
          collection(db, 'weekly_leaderboard'),
          where('weekNumber', '==', week),
          where('year', '==', year),
          where('subject', '==', user.subject),
          orderBy('totalScore', 'desc'),
          limit(50)
        )
      : query(
          collection(db, 'users'),
          where('subject', '==', user.subject),
          orderBy('points', 'desc'),
          limit(50)
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (timeframe === 'weekly') {
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
      } else {
        // Map users to leaderboard format
        const data = snapshot.docs.map((doc, index) => {
          const userData = doc.data();
          const rawName = userData.name || userData.firstName || 'Student';
          const name = rawName === 'Anonymous' ? 'Student' : rawName;
          
          return {
            id: doc.id,
            userId: doc.id,
            userName: name,
            photoURL: userData.photoURL,
            totalScore: userData.points || 0,
            weekNumber: 0,
            year: 0,
            position: index + 1,
            updatedAt: userData.createdAt
          } as WeeklyLeaderboard;
        });
        setLeaderboard(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [timeframe]);

  const userRank = leaderboard.findIndex(entry => entry.userId === user?.uid) + 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 pt-24 lg:pt-12 p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Trophy size={20} />
                <span className="text-sm font-black uppercase tracking-widest">Hall of Fame</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Arena <span className="text-indigo-600 italic">Legends</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-md">
                Compete with students across the country and climb the ranks to become a legend.
              </p>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setTimeframe('weekly')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  timeframe === 'weekly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Weekly
              </button>
              <button 
                onClick={() => setTimeframe('all-time')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  timeframe === 'all-time' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                All-Time
              </button>
            </div>
          </div>

          {/* Top 3 Podium */}
          {!loading && leaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12">
              {/* 2nd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="order-2 md:order-1"
              >
                <Card className="p-8 text-center bg-white border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-300" />
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 overflow-hidden">
                    {leaderboard[1].photoURL ? (
                      <img src={leaderboard[1].photoURL} alt={leaderboard[1].userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Medal size={32} />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{leaderboard[1].userName}</h3>
                  <p className="text-sm font-black text-indigo-600">{leaderboard[1].totalScore} PTS</p>
                  <div className="mt-4 inline-flex px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Rank #2
                  </div>
                </Card>
              </motion.div>

              {/* 1st Place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="order-1 md:order-2"
              >
                <Card className="p-10 text-center bg-indigo-600 text-white border-none relative overflow-hidden shadow-2xl shadow-indigo-200 scale-110 z-10">
                  <div className="absolute top-0 left-0 w-full h-2 bg-amber-400" />
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-400 overflow-hidden">
                    {leaderboard[0].photoURL ? (
                      <img src={leaderboard[0].photoURL} alt={leaderboard[0].userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Crown size={40} />
                    )}
                  </div>
                  <h3 className="text-2xl font-black mb-1">{leaderboard[0].userName}</h3>
                  <p className="text-lg font-black text-indigo-200">{leaderboard[0].totalScore} PTS</p>
                  <div className="mt-6 inline-flex px-4 py-1.5 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest">
                    The Champion
                  </div>
                  <Zap className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
                </Card>
              </motion.div>

              {/* 3rd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="order-3 md:order-3"
              >
                <Card className="p-8 text-center bg-white border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-600/30" />
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600/60 overflow-hidden">
                    {leaderboard[2].photoURL ? (
                      <img src={leaderboard[2].photoURL} alt={leaderboard[2].userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Medal size={32} />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{leaderboard[2].userName}</h3>
                  <p className="text-sm font-black text-indigo-600">{leaderboard[2].totalScore} PTS</p>
                  <div className="mt-4 inline-flex px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Rank #3
                  </div>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Leaderboard Table */}
          <Card className="overflow-hidden border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-8 py-6">
                          <div className="h-4 bg-slate-100 rounded-full w-full" />
                        </td>
                      </tr>
                    ))
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found for this period</p>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <tr 
                        key={entry.id} 
                        className={cn(
                          "group transition-colors",
                          entry.userId === user?.uid ? "bg-indigo-50/50" : "hover:bg-slate-50"
                        )}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                              index === 0 ? "bg-amber-400 text-white" :
                              index === 1 ? "bg-slate-300 text-white" :
                              index === 2 ? "bg-amber-600/40 text-white" :
                              "bg-slate-100 text-slate-400"
                            )}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            {entry.photoURL ? (
                              <img src={entry.photoURL} alt={entry.userName} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                                {entry.userName.charAt(0)}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900">{entry.userName}</span>
                              {entry.userId === user?.uid && (
                                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">You</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-sm font-black text-indigo-600">{entry.totalScore} PTS</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-1 text-emerald-500">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Stable</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* User Status Footer */}
          {user && !loading && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-[calc(50%+144px)] w-full max-w-2xl px-6 z-30">
              <Card className="p-6 bg-slate-900 text-white border-none shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Rank</span>
                    <span className="text-2xl font-black">#{userRank || 'N/A'}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Score</span>
                    <span className="text-2xl font-black text-indigo-400">{timeframe === 'weekly' ? (leaderboard.find(e => e.userId === user.uid)?.totalScore || 0) : (user.points || 0)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="text-amber-400" size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Keep pushing!</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
