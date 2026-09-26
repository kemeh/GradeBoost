import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, BookOpen, Download, FileText, Sparkles, 
  CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, HelpCircle, 
  MessageSquare, Play, Award, ChevronRight, Layers, ArrowRight, Eye
} from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button, Card } from '../components/ui';
import { QuestionPaper, PastPaperItem, PastPaperQuestion } from '../types';
import { fetchQuestionPapersFast } from '../services/questionPaperService';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function StudentPastPapersPage() {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedPaperType, setSelectedPaperType] = useState<string>('all');

  // AI Solver Modal State
  const [solvingPaper, setSolvingPaper] = useState<QuestionPaper | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<PastPaperQuestion | null>(null);
  const [customQuestionPrompt, setCustomQuestionPrompt] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [sourceAttribution, setSourceAttribution] = useState<string>('');

  // Paper Viewer Modal State
  const [viewingPaper, setViewingPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestionPapersFast();
      setPapers(data.filter(p => p.status === 'published' || p.isPublished));
    } catch (err) {
      console.warn("Failed to load papers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Distinct Filter Arrays
  const distinctExams = ['Cameroon GCE', 'BEPC', 'Probatoire', 'Baccalauréat', 'HND/BTS'];
  const distinctLevels = ['Advanced Level', 'Ordinary Level', 'Terminale', 'Première', 'Troisième'];
  const distinctYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      const matchesSearch = 
        !searchQuery.trim() ||
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesExam = selectedExam === 'all' || p.examination === selectedExam;
      const matchesLevel = selectedLevel === 'all' || (p.level && p.level.toLowerCase().includes(selectedLevel.toLowerCase()));
      const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;
      const matchesYear = selectedYear === 'all' || String(p.year) === selectedYear;
      const matchesPaperType = selectedPaperType === 'all' || p.paperType === selectedPaperType || p.paperNumber === selectedPaperType;

      return matchesSearch && matchesExam && matchesLevel && matchesSubject && matchesYear && matchesPaperType;
    });
  }, [papers, searchQuery, selectedExam, selectedLevel, selectedSubject, selectedYear, selectedPaperType]);

  // Handle Ask AI Solver for specific paper or question
  const handleAskAISolve = async (paper: QuestionPaper) => {
    setSolvingPaper(paper);
    setAiSolution(null);
    setCustomQuestionPrompt(`Solve Question 1 from ${paper.title}`);
  };

  const handleExecuteSolve = async () => {
    if (!solvingPaper) return;
    setIsSolving(true);
    setAiSolution(null);

    try {
      const res = await fetch('/api/ai/solve-past-paper-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: solvingPaper.id,
          questionNumber: 'Q1',
          prompt: customQuestionPrompt || `Solve Question 1 from ${solvingPaper.title}`
        })
      });

      const data = await res.json();
      if (data.success && data.solution) {
        setAiSolution(data.solution);
        setSourceAttribution(data.sourceAttribution || `Source: ${solvingPaper.title}`);
      } else {
        toast.error('Failed to solve question');
      }
    } catch (e) {
      toast.error('AI Solver error');
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Past Examination Papers & AI Solver | Edulpha" description="Browse, search, and practice verified Cameroon GCE, BEPC, Baccalauréat, and HND past papers with step-by-step AI question solving." />
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black tracking-wider">
            VERIFIED NATIONAL EXAMINATION ARCHIVE
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Official Past Examination Papers</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Practice with verified Cameroon GCE, BEPC, and Baccalauréat papers. Ask Edulpha AI to solve and explain any question with step-by-step examiner logic.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, year or paper (e.g. '2024 Computer Science Paper 2')..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        {/* Filters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Examination</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Examinations</option>
              {distinctExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Levels</option>
              {distinctLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Years</option>
              {distinctYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Paper Type</label>
            <select
              value={selectedPaperType}
              onChange={(e) => setSelectedPaperType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Papers</option>
              <option value="Paper 1">Paper 1 (MCQ)</option>
              <option value="Paper 2">Paper 2 (Structural)</option>
              <option value="Paper 3">Paper 3 (Practical)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reset</label>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedExam('all');
                setSelectedLevel('all');
                setSelectedSubject('all');
                setSelectedYear('all');
                setSelectedPaperType('all');
              }}
              variant="outline"
              className="w-full text-xs font-bold py-2 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>

        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading Past Papers Repository...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <FileText size={40} className="text-slate-400 mx-auto" />
            <h3 className="text-base font-bold">No Past Papers Match Your Search Filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, examination board, or level filters above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <Card key={paper.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-lg transition space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] font-black uppercase">
                      {paper.year} • {paper.examination || 'Cameroon GCE'}
                    </Badge>
                    {paper.permissionStatus === 'Authorized' && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        ✓ Authorized Copy
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {paper.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {paper.description || `Official ${paper.subject} ${paper.paperType} examination paper.`}
                  </p>

                  {/* Source Attribution (STRICT RULE) */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <ShieldCheck size={13} className="text-indigo-500" />
                    <span>Source: {paper.sourceName || 'Cameroon GCE Vision'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => setViewingPaper(paper)}
                    variant="outline"
                    className="text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> View Paper
                  </Button>

                  <Button 
                    onClick={() => handleAskAISolve(paper)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} /> Ask AI
                  </Button>
                </div>

              </Card>
            ))}
          </div>
        )}

      </section>

      {/* View Paper Modal */}
      {viewingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <Card className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <Badge className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                  OFFICIAL EXAMINATION RESOURCE
                </Badge>
                <h2 className="text-lg font-black">{viewingPaper.title}</h2>
              </div>
              <button onClick={() => setViewingPaper(null)} className="p-2 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
                <span className="font-bold block text-slate-900 dark:text-white">Instructions & Exam Parameters</span>
                <p className="text-slate-600 dark:text-slate-300">{viewingPaper.instructions || 'Answer all questions according to instructions.'}</p>
                <div className="flex gap-4 font-bold text-indigo-600 dark:text-indigo-400 pt-2">
                  <span>Duration: {viewingPaper.durationMinutes || 120} Mins</span>
                  <span>Total Marks: {viewingPaper.totalMarks || 100} Marks</span>
                </div>
              </div>

              {/* Attribution */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-[11px] flex items-center justify-between">
                <span>Source Attribution: <strong>{viewingPaper.sourceName || 'Cameroon GCE Vision'}</strong></span>
                {viewingPaper.sourceUrl && (
                  <a href={viewingPaper.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold flex items-center gap-1">
                    Original Source <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* PDF Download option if authorized */}
              {viewingPaper.permissionStatus === 'Authorized' || viewingPaper.permissionStatus === 'Publicly Available' ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Download Paper Document</span>
                  <a 
                    href={viewingPaper.pdfUrl || viewingPaper.originalPdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <Download size={14} /> Download PDF
                  </a>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  * Download restricted in accordance with content copyright rules.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={() => setViewingPaper(null)} className="text-xs font-bold px-4 py-2 rounded-xl">
                Close Viewer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* AI Solver Modal */}
      {solvingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <Card className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sparkles size={22} />
                </div>
                <div>
                  <Badge className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    EDULPHA AI PAST PAPER SOLVER
                  </Badge>
                  <h2 className="text-base font-black">{solvingPaper.title}</h2>
                </div>
              </div>
              <button onClick={() => setSolvingPaper(null)} className="p-2 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Enter Question Number or Problem Prompt to Solve:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={customQuestionPrompt}
                    onChange={(e) => setCustomQuestionPrompt(e.target.value)}
                    placeholder="e.g. Solve Question 1 or Question 3(b) on Normalization"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold outline-none"
                  />
                  <Button 
                    onClick={handleExecuteSolve}
                    disabled={isSolving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2"
                  >
                    {isSolving ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    {isSolving ? 'Solving...' : 'Solve Question'}
                  </Button>
                </div>
              </div>

              {/* Solution Output */}
              {aiSolution && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Verified Examiner Solution
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{sourceAttribution}</span>
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 whitespace-pre-line font-mono">
                    {aiSolution}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={() => setSolvingPaper(null)} className="text-xs font-bold px-4 py-2 rounded-xl">
                Close AI Solver
              </Button>
            </div>
          </Card>
        </div>
      )}

      <DynamicFooter />
    </div>
  );
}
