import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Save, FileText, 
  ChevronRight, ChevronDown, Download,
  LayoutDashboard, AlertCircle, Loader2, Search
} from 'lucide-react';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { 
  collection, query, where, getDocs, 
  orderBy, limit 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Button, Card, Badge, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../components/ui';
import { ExamQuestion } from '../types';
import { toast } from 'react-hot-toast';
import { generateGCEPaper2PDF, GCEPaper2Data } from '../utils/pdfGenerator';

export default function AdminPaperGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<ExamQuestion[]>([]);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Computer Science');

  const [paperData, setPaperData] = useState<GCEPaper2Data>({
    title: 'Paper 2',
    timeAllowed: '3 Hours',
    subject: 'Computer Science',
    year: new Date().getFullYear(),
    questions: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, 'exam_questions'),
          where('paper', '==', 'Paper 2'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamQuestion)));
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, navigate]);

  const handleAddQuestionToPaper = (q: ExamQuestion) => {
    if (paperData.questions.length >= 8) {
      toast.error('A Paper 2 exam must have exactly 8 questions.');
      return;
    }

    const newQuestion = {
      id: paperData.questions.length + 1,
      text: q.questionText,
      subparts: q.subParts && q.subParts.length > 0 
        ? q.subParts.map(sp => ({ label: sp.label, text: sp.text, marks: sp.marks }))
        : [
            { label: '(a)', text: 'Explain the concept...', marks: 5 },
            { label: '(b)', text: 'Discuss the implications...', marks: 12 }
          ]
    };

    setPaperData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setIsQuestionSelectorOpen(false);
  };

  const handleRemoveQuestion = (id: number) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id).map((q, i) => ({ ...q, id: i + 1 }))
    }));
  };

  const handleAddSubpart = (qId: number) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          const nextLabel = q.subparts.length === 0 ? '(a)' : 
                            q.subparts.length === 1 ? '(b)' :
                            q.subparts.length === 2 ? '(c)' :
                            q.subparts.length === 3 ? '(i)' : '(ii)';
          return {
            ...q,
            subparts: [...q.subparts, { label: nextLabel, text: '', marks: 5 }]
          };
        }
        return q;
      })
    }));
  };

  const handleUpdateSubpart = (qId: number, sIdx: number, field: string, value: any) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          const newSubparts = [...q.subparts];
          newSubparts[sIdx] = { ...newSubparts[sIdx], [field]: value };
          return { ...q, subparts: newSubparts };
        }
        return q;
      })
    }));
  };

  const handleRemoveSubpart = (qId: number, sIdx: number) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            subparts: q.subparts.filter((_, i) => i !== sIdx)
          };
        }
        return q;
      })
    }));
  };

  const handleDownload = async () => {
    if (paperData.questions.length !== 8) {
      toast.error('The paper must contain exactly 8 questions.');
      return;
    }

    // Validate marks
    for (const q of paperData.questions) {
      const totalMarks = q.subparts.reduce((sum, s) => sum + s.marks, 0);
      if (totalMarks !== 17) {
        toast.error(`Question ${q.id} total marks is ${totalMarks}. Each question must carry exactly 17 marks.`);
        return;
      }
    }

    try {
      await generateGCEPaper2PDF(paperData);
      toast.success('Paper generated successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Go to Dashboard">
              <LayoutDashboard size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Paper 2 Generator</h1>
              <p className="text-slate-500 font-medium">Format and restructure examinations into Cameroon GCE AL format.</p>
            </div>
          </div>
          <Button 
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2"
          >
            <Download size={20} />
            Generate PDF
          </Button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Card className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Paper Configuration</h2>
                <Badge variant="secondary">{paperData.questions.length} / 8 Questions</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Paper Type</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={paperData.title}
                    onChange={e => setPaperData({ ...paperData, title: e.target.value })}
                    placeholder="e.g. Paper 2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Duration</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={paperData.timeAllowed}
                    onChange={e => setPaperData({ ...paperData, timeAllowed: e.target.value })}
                    placeholder="e.g. 3 Hours"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={paperData.subject}
                    onChange={e => setPaperData({ ...paperData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Year</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={paperData.year}
                    onChange={e => setPaperData({ ...paperData, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              {paperData.questions.map((q, qIdx) => (
                <Card key={q.id} className="p-4 sm:p-8 space-y-6 relative group">
                  <button 
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 pr-8 sm:pr-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-base sm:text-lg shrink-0">
                      {q.id}
                    </div>
                    <div className="flex-1">
                      <textarea 
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-sm"
                        value={q.text}
                        onChange={e => {
                          const newQs = [...paperData.questions];
                          newQs[qIdx].text = e.target.value;
                          setPaperData({ ...paperData, questions: newQs });
                        }}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="pl-0 sm:pl-14 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sub-parts</h3>
                      <button 
                        onClick={() => handleAddSubpart(q.id)}
                        className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Sub-part
                      </button>
                    </div>

                    {q.subparts.map((sub, sIdx) => (
                      <div key={sIdx} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-2xl group/sub">
                        <div className="flex items-center gap-2 sm:w-auto">
                          <input 
                            type="text"
                            className="w-12 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center outline-none"
                            value={sub.label}
                            onChange={e => handleUpdateSubpart(q.id, sIdx, 'label', e.target.value)}
                          />
                          <span className="sm:hidden text-xs font-bold text-slate-400">Label</span>
                        </div>
                        <div className="flex-1">
                          <textarea 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-600 resize-none"
                            value={sub.text}
                            onChange={e => handleUpdateSubpart(q.id, sIdx, 'text', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <div className="w-24">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number"
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center outline-none"
                                value={sub.marks}
                                onChange={e => handleUpdateSubpart(q.id, sIdx, 'marks', parseInt(e.target.value))}
                              />
                              <span className="text-[10px] font-black text-slate-400 uppercase">Marks</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveSubpart(q.id, sIdx)}
                            className="p-1 text-slate-300 hover:text-rose-600 sm:opacity-0 group-hover/sub:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                        q.subparts.reduce((sum, s) => sum + s.marks, 0) === 17 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-rose-50 text-rose-600"
                      )}>
                        Total Marks: {q.subparts.reduce((sum, s) => sum + s.marks, 0)} / 17
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {paperData.questions.length < 8 && (
                <button 
                  onClick={() => setIsQuestionSelectorOpen(true)}
                  className="w-full p-12 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex flex-col items-center gap-4 group"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <Plus size={32} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-sm">Add Question {paperData.questions.length + 1}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="p-8 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Paper Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Total Questions</span>
                  <span className="font-black text-slate-900">{paperData.questions.length} / 8</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Instructions Set</span>
                  <Badge variant="success">Yes</Badge>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Marks Allocation</span>
                  <span className={cn(
                    "font-black",
                    paperData.questions.every(q => q.subparts.reduce((sum, s) => sum + s.marks, 0) === 17)
                      ? "text-emerald-600"
                      : "text-rose-600"
                  )}>
                    {paperData.questions.filter(q => q.subparts.reduce((sum, s) => sum + s.marks, 0) === 17).length} / 8 Valid
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-xs font-black text-amber-900 uppercase tracking-widest">GCE Rules</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Ensure exactly 8 questions are added. Each question must carry 17 marks total across its sub-parts.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Question Selector Dialog */}
        <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Select Question</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search questions by text or topic..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questions
                  .filter(q => q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || q.topic.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(q => (
                    <button 
                      key={q.id}
                      onClick={() => handleAddQuestionToPaper(q)}
                      className="p-6 bg-white border border-slate-100 rounded-2xl text-left hover:border-indigo-600 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">{q.topic}</Badge>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={20} />
                      </div>
                      <div className="prose prose-slate prose-sm max-w-none line-clamp-2">
                        <div className="text-slate-700 font-medium">
                          <ReactMarkdown>
                            {q.questionText}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
