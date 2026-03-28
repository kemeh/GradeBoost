import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { fetchDailyDrill } from "../services/dailyDrillService";
import Sidebar from "../components/Sidebar";
import { Button, Badge } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

function DailyDrill() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrill() {
      if (!user?.subject) return;
      console.log(`Loading Daily Drill for ${user.subject}, Paper 1`);
      const data = await fetchDailyDrill(user.subject, "Paper 1");
      console.log("Daily Drill Data in component:", data);
      setQuestions(data);
      setLoading(false);
    }

    loadDrill();
  }, [user?.subject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 lg:ml-72 pt-24 lg:pt-12 p-6 lg:p-12">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Sparkles size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">No Drill Found</h2>
              <p className="text-slate-500 font-medium max-w-md">
                We couldn't find a daily drill for <span className="text-indigo-600 font-bold">{user?.subject}</span> today. 
                Please check back later or try a different subject.
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="px-8">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-72 pt-24 lg:pt-12 p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shrink-0"
                title="Go to Dashboard"
              >
                <LayoutDashboard size={20} />
              </Button>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Daily Drill</h1>
                <p className="text-slate-500 font-medium">Test your knowledge with today's questions.</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 px-4 py-2 w-fit">
              <Sparkles size={14} className="mr-2 fill-indigo-600" />
              {user?.subject}
            </Badge>
          </div>

          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-start gap-4">
                  <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg shrink-0">
                    Q{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg text-slate-800 font-medium mb-4">{q.questionText}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.optionA && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                          <span className="font-bold text-indigo-600">A:</span>
                          <span className="text-slate-700">{q.optionA}</span>
                        </div>
                      )}
                      {q.optionB && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                          <span className="font-bold text-indigo-600">B:</span>
                          <span className="text-slate-700">{q.optionB}</span>
                        </div>
                      )}
                      {q.optionC && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                          <span className="font-bold text-indigo-600">C:</span>
                          <span className="text-slate-700">{q.optionC}</span>
                        </div>
                      )}
                      {q.optionD && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                          <span className="font-bold text-indigo-600">D:</span>
                          <span className="text-slate-700">{q.optionD}</span>
                        </div>
                      )}
                      {q.options && !q.optionA && Object.entries(q.options).map(([key, value]) => (
                        <div key={key} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                          <span className="font-bold text-indigo-600">{key}:</span>
                          <span className="text-slate-700">{value as string}</span>
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm italic">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DailyDrill;
