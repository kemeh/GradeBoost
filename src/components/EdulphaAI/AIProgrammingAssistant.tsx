import React, { useState } from 'react';
import { 
  Code, 
  Sparkles, 
  Bug, 
  Terminal, 
  FileCode, 
  CheckCircle2, 
  Play, 
  Copy, 
  RotateCcw,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { analyzeCodeWithAI } from '../../services/aiService';

const SAMPLE_PROGRAMS: Record<string, string> = {
  'C': `#include <stdio.h>

int main() {
    int n = 10;
    int a = 0, b = 1, next;
    printf("Fibonacci Series: %d, %d, ", a, b);
    for (int i = 3; i <= n; ++i) {
        next = a + b;
        printf("%d, ", next);
        a = b;
        b = next;
    }
    return 0;
}`,
  'C++': `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
  'Python': `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
  'Java': `public class StackExample {
    private int maxSize;
    private int[] stackArray;
    private int top;

    public StackExample(int s) {
        maxSize = s;
        stackArray = new int[maxSize];
        top = -1;
    }

    public void push(int j) {
        stackArray[++top] = j;
    }
}`,
  'SQL': `SELECT 
    students.id, 
    students.name, 
    COUNT(exam_submissions.id) AS total_exams,
    AVG(exam_submissions.score) AS average_score
FROM students
JOIN exam_submissions ON students.id = exam_submissions.student_id
GROUP BY students.id, students.name
HAVING AVG(exam_submissions.score) >= 75;`
};

export const AIProgrammingAssistant: React.FC = () => {
  const [language, setLanguage] = useState('C++');
  const [code, setCode] = useState(SAMPLE_PROGRAMS['C++']);
  const [mode, setMode] = useState<'explain' | 'debug' | 'improve' | 'compiler'>('explain');
  const [compilerError, setCompilerError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await analyzeCodeWithAI(code, language, mode, compilerError);
      setAnalysisResult(res);
    } catch (err) {
      console.error("Code analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (SAMPLE_PROGRAMS[newLang]) {
      setCode(SAMPLE_PROGRAMS[newLang]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
            <Terminal size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Programming & Algorithm Assistant</h2>
            <p className="text-xs text-indigo-200">
              Code analysis, bug debugger & practical GCE Paper 3 code generator for C, C++, Python, Java, JS, HTML, SQL
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Code Editor & Settings */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language:</span>
              <select 
                value={language} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="HTML">HTML / CSS</option>
                <option value="SQL">SQL</option>
              </select>
            </div>

            {/* Analysis Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('explain')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${mode === 'explain' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'}`}
              >
                Explain
              </button>
              <button
                type="button"
                onClick={() => setMode('debug')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${mode === 'debug' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-600'}`}
              >
                Find Bugs
              </button>
              <button
                type="button"
                onClick={() => setMode('compiler')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${mode === 'compiler' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600'}`}
              >
                Compiler Error
              </button>
            </div>
          </div>

          {mode === 'compiler' && (
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1">Paste Compiler / Runtime Error Output</label>
              <input 
                type="text"
                value={compilerError}
                onChange={(e) => setCompilerError(e.target.value)}
                placeholder="e.g. fatal error: expected ';' before '}' token"
                className="w-full bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          )}

          {/* Code Area */}
          <div>
            <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
              <span className="flex items-center gap-1.5"><FileCode size={14} /> editor.{language.toLowerCase()}</span>
              <button 
                type="button"
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white flex items-center gap-1"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste or write your program code here..."
              className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-b-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !code.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Analyzing Code...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze & Explain Code</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: AI Analysis Output */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col h-[520px] overflow-hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Edulpha AI Code Insights</h3>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs leading-relaxed text-slate-800 pr-1">
            {analysisResult ? (
              <div className="prose prose-sm max-w-none whitespace-pre-line text-slate-800">
                {analysisResult}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Code size={40} className="text-slate-300" />
                <p className="font-semibold text-slate-600">Ready for Code Analysis</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Paste code in C, C++, Python, Java, JS, HTML, or SQL to get instant explanations, bug fixes, and GCE Paper 3 practical tips.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProgrammingAssistant;
