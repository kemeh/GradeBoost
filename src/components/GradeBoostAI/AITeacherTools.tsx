import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Award, 
  Copy, 
  Check, 
  Loader2,
  ListTodo
} from 'lucide-react';
import { analyzeCodeWithAI } from '../../services/aiService';

export const AITeacherTools: React.FC = () => {
  const [toolType, setToolType] = useState<'lesson_plan' | 'assignment' | 'quiz' | 'marking_guide' | 'practical'>('lesson_plan');
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Databases & SQL');
  const [educationLevel, setEducationLevel] = useState('Ordinary Level');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedOutput(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `As a senior GCE Teacher & Curriculum Developer, generate a full ${toolType.replace('_', ' ')} for:
Subject: ${subject}
Topic: ${topic}
Education Level: ${educationLevel}

Structure with clear sections, GCE marking scheme standards, learning objectives, and student evaluation exercises.`,
          subject,
          topic,
          educationLevel
        })
      });

      const data = await res.json();
      setGeneratedOutput(data.reply || 'Content generated.');
    } catch (err) {
      console.error("Teacher AI tool error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedOutput) {
      navigator.clipboard.writeText(generatedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-800 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl text-amber-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">GradeBoost AI Teacher Studio</h2>
            <p className="text-xs text-indigo-200">
              Instantly generate GCE lesson plans, assignments, marking guides, quizzes & practical lab exercises
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="space-y-4">
          <form onSubmit={handleGenerateContent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Content Generator Tool</label>
              <select 
                value={toolType} 
                onChange={(e) => setToolType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="lesson_plan">Lesson Plan Generator</option>
                <option value="assignment">Homework & Assignment Generator</option>
                <option value="quiz">Class Quiz & Exam Generator</option>
                <option value="marking_guide">GCE Marking Scheme Guide</option>
                <option value="practical">Paper 3 Practical Lab Exercise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="ICT">ICT</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Economics">Economics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Topic</label>
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Relational Databases & SQL Queries"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Education Level</label>
              <select 
                value={educationLevel} 
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Ordinary Level">Ordinary Level (O-Level)</option>
                <option value="Advanced Level">Advanced Level (A-Level)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating Teacher Resource...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Resource</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Generated Resource Output
            </h3>
            {generatedOutput && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Resource'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs leading-relaxed text-slate-800 pr-1">
            {generatedOutput ? (
              <div className="prose prose-sm max-w-none whitespace-pre-line text-slate-800">
                {generatedOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <BookOpen size={40} className="text-slate-300" />
                <p className="font-semibold text-slate-600">Select a tool & generate</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Generate instant GCE curriculum resources for your classes with one click.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
