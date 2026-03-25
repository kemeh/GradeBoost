import React, { useEffect, useState } from "react";
import { fetchDailyDrill } from "../services/dailyDrillService";

function DailyDrill() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrill() {
      console.log("Loading Daily Drill for Computer Science, Paper 1");
      const data = await fetchDailyDrill("Computer Science", "Paper 1");
      console.log("Daily Drill Data in component:", data);
      setQuestions(data);
      setLoading(false);
    }

    loadDrill();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600">No Drill Found</h2>
        <p className="text-gray-600 mt-2">Please check if questions exist for Computer Science - Paper 1 in Firestore.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-indigo-900 border-b pb-4">Daily Drill</h2>
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
              <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg">
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
  );
}

export default DailyDrill;
