import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">GradeBoost 60</h1>
        <p className="text-slate-500 font-medium">
          Your 60-day journey to GCE success starts here.
        </p>
        <div className="pt-4">
          <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
