import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  RotateCcw,
  Loader2,
  Copy
} from 'lucide-react';
import { AISummary, AIFlashcard } from '../../types';
import { generateAISummary } from '../../services/aiService';
import { AIFlashcardDeck } from './AIFlashcardDeck';

interface AILessonSummarizerProps {
  userId: string;
  defaultSubject?: string;
}

export const AILessonSummarizer: React.FC<AILessonSummarizerProps> = ({ 
  userId, 
  defaultSubject = 'Computer Science' 
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim() || isSummarizing) return;

    setIsSummarizing(true);
    try {
      const res = await generateAISummary(
        userId,
        textContent,
        subject,
        title || 'Lesson Summary'
      );
      setSummary(res);
    } catch (err) {
      console.error("Summarizer error:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl text-emerald-300">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Lesson & PDF Summarizer</h2>
            <p className="text-xs text-emerald-200">
              Summarize textbook notes into key points, revision summaries, and auto-generated flashcard decks
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!summary ? (
          <form onSubmit={handleSummarize} className="space-y-4 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Lesson / PDF Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating System Scheduling Algorithms"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Paste Lesson Notes / PDF Text</label>
              <textarea
                rows={10}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste text from PDF notes, lesson content, or revision handouts here..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed text-slate-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSummarizing || !textContent.trim()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isSummarizing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Summarizing Lesson & Generating Flashcards...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate AI Summary & Flashcards</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{summary.subject}</span>
                <h3 className="text-xl font-bold text-slate-900">{summary.title}</h3>
              </div>
              <button
                onClick={() => setSummary(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Summarize Another
              </button>
            </div>

            {/* Overview Box */}
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-emerald-600" /> Executive Short Summary
              </h4>
              <p className="text-xs text-emerald-950 leading-relaxed">{summary.shortSummary}</p>
            </div>

            {/* Revision Key Points */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" /> High-Yield GCE Revision Points
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summary.revisionPoints.map((pt, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-bold rounded-md flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" /> Detailed Breakdown
              </h4>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {summary.detailedSummary}
              </div>
            </div>

            {/* Flashcards Deck */}
            {summary.flashcards && summary.flashcards.length > 0 && (
              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Layers size={18} className="text-amber-500" /> Generated Study Flashcards ({summary.flashcards.length})
                </h4>
                <AIFlashcardDeck flashcards={summary.flashcards} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
