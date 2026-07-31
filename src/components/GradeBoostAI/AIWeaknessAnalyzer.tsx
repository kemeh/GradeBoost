import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  Target, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { AIRecommendation } from '../../types';
import { fetchAIRecommendations } from '../../services/aiService';

interface AIWeaknessAnalyzerProps {
  userId: string;
  defaultSubject?: string;
  onLaunchTask?: (type: string, title: string) => void;
}

export const AIWeaknessAnalyzer: React.FC<AIWeaknessAnalyzerProps> = ({ 
  userId, 
  defaultSubject = 'Computer Science',
  onLaunchTask 
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [userId, subject]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAIRecommendations(userId, subject);
      setWeaknesses(res.weaknesses || []);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error("Failed weakness analysis:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Weakness Detection & Recommendations</h2>
            <p className="text-xs text-indigo-200">
              Analyzes performance data, identifies weak syllabus topics & generates targeted study paths
            </p>
          </div>
        </div>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
        >
          <option value="Computer Science">Computer Science</option>
          <option value="ICT">ICT</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Economics">Economics</option>
        </select>
      </div>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">GradeBoost AI is analyzing performance metrics & weak points...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Topics Panel */}
            <div className="p-5 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle size={18} className="text-rose-600" />
                <span>Detected Weak Topics & Papers</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Based on past quiz scores and drill history, GradeBoost AI identified these priority revision focus areas:
              </p>

              <div className="space-y-2">
                {weaknesses.map((w, idx) => (
                  <div key={idx} className="p-3 bg-white border border-rose-200/70 rounded-xl text-xs text-slate-800 flex items-center justify-between shadow-2xs">
                    <span className="font-semibold text-rose-900">• {w}</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Needs Drill</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations Panel */}
            <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles size={18} className="text-indigo-600" />
                <span>AI Recommended Action Plan</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Personalized study actions to boost your score in upcoming GCE examinations:
              </p>

              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-3 bg-white border border-indigo-200 rounded-xl text-xs space-y-1 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer"
                    onClick={() => onLaunchTask && onLaunchTask(rec.type, rec.title)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rec.title}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
