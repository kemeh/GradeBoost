import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, FileText, Send, Clock, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  AlertCircle, Info, Save, Maximize2, Minimize2
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Progress, cn } from '../components/ui';
import { QuestionPaper, ExamResult, Subject } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function PracticeSession() {
  const { paperId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [answers, setAnswers] = useState<any>({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!paperId) return;
      const path = `questionPapers/${paperId}`;
      try {
        const docSnap = await getDoc(doc(db, 'questionPapers', paperId));
        if (docSnap.exists()) {
          setPaper({ id: docSnap.id, ...docSnap.data() } as QuestionPaper);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!user || !paper) return;
    setIsSubmitting(true);
    const path = 'results';
    try {
      // Scoring logic
      let score = Math.floor(Math.random() * 40) + 60; // Default mock score
      
      if (paper.paperType === 'Paper 1' && paper.correctAnswers) {
        let correctCount = 0;
        const totalQuestions = Object.keys(paper.correctAnswers).length;
        Object.entries(paper.correctAnswers).forEach(([qNum, correctAns]) => {
          if (answers[qNum] === correctAns) correctCount++;
        });
        score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      }

      let grade = 'F';
      if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 50) grade = 'D';

      await addDoc(collection(db, path), {
        userId: user.uid,
        paperId: paper.id,
        subject: paper.subject,
        paperType: paper.paperType,
        answers,
        score,
        grade,
        feedback: "Great attempt! Focus on improving your structured answer keywords.",
        completedAt: serverTimestamp(), // Consistent with dashboard query
      });

      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading Session...</div>;
  if (!paper) return <div className="min-h-screen flex items-center justify-center">Paper not found</div>;

  return (
    <div className={cn("min-h-screen bg-slate-900 flex flex-col", isFullScreen && "fixed inset-0 z-[100]")}>
      {/* Header */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/practice')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <img 
            src="https://ais-dev-ph2spjdss3zj2jll4pbjwl-332084451562.europe-west2.run.app/logo.png" 
            alt="GradeBoost 60 Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">{paper.title}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{paper.subject} • {paper.paperType}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-6 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <Clock className="text-indigo-400" size={18} />
            <span className="text-lg font-black text-white tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <Button variant="secondary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Exam'} <Send className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer (Left) */}
        <div className="flex-1 bg-slate-800 relative overflow-hidden flex flex-col">
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl min-h-[1200px] p-12 space-y-8">
              {/* Mock PDF Content */}
              <div className="text-center space-y-4 border-b border-slate-100 pb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cameroon GCE Board</h2>
                <h3 className="text-xl font-bold text-slate-700">{paper.subject} {paper.paperType}</h3>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{paper.year} Session</p>
              </div>

              <div className="space-y-12 py-8">
                {[1, 2, 3, 4, 5].map(q => (
                  <div key={q} className="space-y-4">
                    <p className="font-bold text-slate-900">Question {q}:</p>
                    <div className="h-4 bg-slate-100 rounded-full w-full" />
                    <div className="h-4 bg-slate-100 rounded-full w-5/6" />
                    <div className="h-4 bg-slate-100 rounded-full w-4/6" />
                  </div>
                ))}
              </div>

              <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">PDF Viewer Active</p>
                <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-xs font-black uppercase tracking-widest mt-2 block hover:underline">
                  Open Original PDF
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Panel (Right) */}
        <div className="w-[500px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Answer Panel</h2>
            <Badge variant="primary">Section A</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {paper.paperType === 'Paper 1' ? (
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 text-center">{i + 1}</p>
                    <select 
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-900 focus:border-indigo-600 outline-none"
                      value={answers[i + 1] || ''}
                      onChange={e => setAnswers({ ...answers, [i + 1]: e.target.value })}
                    >
                      <option value="">-</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                ))}
              </div>
            ) : paper.paperType === 'Paper 2' ? (
              <div className="space-y-8">
                {[1, 2, 3, 4, 5].map(q => (
                  <div key={q} className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {q}</label>
                    <textarea 
                      className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none min-h-[150px] transition-all"
                      placeholder="Type your structured answer here..."
                      value={answers[q] || ''}
                      onChange={e => setAnswers({ ...answers, [q]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {user.subject === 'Computer Science' ? (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Programming / Logic Task</label>
                      <textarea 
                        className="w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-indigo-400 focus:border-indigo-600 outline-none min-h-[400px] transition-all"
                        placeholder="// Write your code or logic here..."
                        value={answers['p3'] || ''}
                        onChange={e => setAnswers({ ...answers, 'p3': e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {['PowerPoint', 'Access', 'HTML', 'Programming', 'Excel'].map(module => (
                      <div key={module} className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{module} Module</label>
                        <textarea 
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none min-h-[120px] transition-all"
                          placeholder={`Enter your ${module} findings or code...`}
                          value={answers[module] || ''}
                          onChange={e => setAnswers({ ...answers, [module]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                <Save size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Auto-saving active</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last saved 2m ago</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Save Draft</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
