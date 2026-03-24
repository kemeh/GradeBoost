import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Zap, Target } from 'lucide-react';
import { Badge } from './ui';

export default function WelcomeDashboard() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="p-8 animate-pulse bg-white rounded-2xl border border-slate-100 mb-12">
        <div className="h-8 w-64 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-slate-200 rounded mb-6"></div>
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const firstName = user.firstName || user.name?.split(' ')[0] || 'Student';
  // In our UserProfile, subject is a single string. 
  // We'll wrap it in an array to match the requested UI structure.
  const subjects = user.subject ? [user.subject] : [];

  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 mb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome, {firstName}! 👋
          </h1>
          <p className="text-slate-500 font-medium mb-6 max-w-2xl leading-relaxed">
            {user.paymentStatus === 'paid' 
              ? "You have full access to all practice materials, interactive quizzes, and performance insights. Get learning, explore new concepts, and crush those goals! 🚀"
              : "Try our free sample questions or unlock the full course for complete access to all materials. Get learning, explore new concepts, and crush those goals! 🚀"}
          </p>
          
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Today’s subjects:</h3>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {subjects.map((subject, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    {subject}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">
                No subjects assigned yet. Check your profile to set your target subject!
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end">
          <Badge variant="primary" className="px-4 py-2 text-sm font-black">
            <Target size={16} className="mr-2" />
            Target: Grade {user.targetGrade || 'A'}
          </Badge>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
            <Zap className="text-amber-500" size={16} />
            <span className="text-sm font-black text-amber-700">{user.streak || 0} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
            <Trophy className="text-indigo-600" size={16} />
            <span className="text-sm font-black text-indigo-700">{user.points || 0} Points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
