import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Coffee, 
  Award, 
  Plus, 
  ChevronRight,
  Loader2,
  ListTodo
} from 'lucide-react';
import { AIStudyPlan } from '../../types';
import { generateAIStudyPlan, fetchUserStudyPlans } from '../../services/aiService';

interface AIStudyPlannerProps {
  userId: string;
  defaultSubject?: string;
}

export const AIStudyPlanner: React.FC<AIStudyPlannerProps> = ({ 
  userId, 
  defaultSubject = 'Computer Science' 
}) => {
  const [plans, setPlans] = useState<AIStudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<AIStudyPlan | null>(null);
  const [subject, setSubject] = useState(defaultSubject);
  const [paper, setPaper] = useState('Paper 1 & Paper 2');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [userId]);

  const loadPlans = async () => {
    const list = await fetchUserStudyPlans(userId);
    setPlans(list);
    if (list.length > 0) {
      setActivePlan(list[0]);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newPlan = await generateAIStudyPlan(
        userId,
        subject,
        paper,
        durationDays
      );
      setPlans(prev => [newPlan, ...prev]);
      setActivePlan(newPlan);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskCompletion = (taskDay: number) => {
    if (!activePlan) return;
    const updatedTasks = activePlan.dailyTasks.map(t => 
      t.day === taskDay ? { ...t, completed: !t.completed } : t
    );
    setActivePlan({ ...activePlan, dailyTasks: updatedTasks });
  };

  const calculateProgress = () => {
    if (!activePlan || activePlan.dailyTasks.length === 0) return 0;
    const done = activePlan.dailyTasks.filter(t => t.completed).length;
    return Math.round((done / activePlan.dailyTasks.length) * 100);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-800 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl text-amber-400">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Smart Revision Planner</h2>
            <p className="text-xs text-indigo-200">
              Generate personalized 7, 14, or 30-day GCE exam study plans with daily tasks & break days
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator Form & Saved Plans */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Create New AI Plan
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="ICT">ICT</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Paper Target</label>
                <input 
                  type="text"
                  value={paper}
                  onChange={(e) => setPaper(e.target.value)}
                  placeholder="e.g. Paper 1 & Paper 2"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
                <select 
                  value={durationDays} 
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value={7}>7 Days Sprint (Exam Week)</option>
                  <option value={14}>14 Days Master Plan (2 Weeks)</option>
                  <option value={30}>30 Days Intensive (1 Month)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Building Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Revision Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Saved Plans List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Saved Revision Plans</h4>
            {plans.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl border border-slate-200">No active revision plans yet.</p>
            ) : (
              plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePlan(p)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${p.id === activePlan?.id ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <div>
                    <span className="block font-medium">{p.subject} ({p.durationDays} Days)</span>
                    <span className="text-[10px] text-slate-400">Created: {p.startDate}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Plan Daily Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {activePlan ? (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{activePlan.subject} Study Plan</h3>
                  <p className="text-xs text-indigo-200">{activePlan.durationDays} Days • Target: {activePlan.paper || 'All Papers'}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{calculateProgress()}%</div>
                  <span className="text-[10px] text-slate-400">Completion Score</span>
                </div>
              </div>

              {/* Daily Tasks Timeline */}
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {activePlan.dailyTasks.map((task) => {
                  const isBreak = task.taskType === 'break';
                  return (
                    <div 
                      key={task.day} 
                      onClick={() => toggleTaskCompletion(task.day)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${task.completed ? 'bg-emerald-50/60 border-emerald-200 text-slate-700' : isBreak ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                    >
                      <button className="mt-0.5 text-slate-400 hover:text-emerald-600">
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isBreak ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {task.dayName} • {task.topic}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {task.estMinutes} mins
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
              <ListTodo size={40} className="text-slate-300" />
              <h4 className="font-bold text-slate-700">No Active Revision Plan</h4>
              <p className="text-xs text-slate-400 max-w-sm">Use the form on the left to generate an AI study schedule tailored to your exam target.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
