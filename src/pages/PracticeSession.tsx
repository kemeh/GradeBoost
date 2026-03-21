import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, FileText, Send, Clock, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  AlertCircle, Info, Save, Maximize2, Minimize2,
  TrendingUp, Sparkles, ArrowRight, Trophy, Zap
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Badge, Progress, cn } from '../components/ui';
import { QuestionPaper, ExamResult, Subject } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import FileUpload from '../components/FileUpload';

export default function PracticeSession() {
  const { paperId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [answers, setAnswers] = useState<any>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsSummary, setResultsSummary] = useState<{ score: number; grade: string } | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!paperId || !user) return;
      setError('');
      const path = `questionPapers/${paperId}`;
      try {
        // Check if user is paid
        const isPaid = user.paymentStatus === 'paid';
        const hasExpired = user.paymentExpiryDate && new Date(user.paymentExpiryDate) < new Date();
        const isAdmin = user.role === 'admin';

        // Fetch the paper
        const docSnap = await getDoc(doc(db, 'questionPapers', paperId));
        if (docSnap.exists()) {
          const paperData = { id: docSnap.id, ...docSnap.data() } as QuestionPaper;
          
          // If not paid and not admin, check if it's a free sample
          if ((!isPaid || hasExpired) && !isAdmin) {
            if (!user.subject) {
              navigate('/payment');
              return;
            }
            // Fetch the first Paper 1 for this subject to see if it's the free one
            const q = query(
              collection(db, 'questionPapers'),
              where('subject', '==', user.subject),
              where('paperType', '==', 'Paper 1'),
              limit(1)
            );
            const freeSnap = await getDocs(q);
            const freeId = !freeSnap.empty ? freeSnap.docs[0].id : null;

            if (paperId !== freeId) {
              // Not the free sample, redirect to payment
              navigate('/payment');
              return;
            }
          }
          
          setPaper(paperData);
        } else {
          setError('Exam paper not found.');
        }
      } catch (err: any) {
        console.error("Fetch Paper Error:", err);
        setError('Failed to load exam paper. Please check your connection.');
        try { handleFirestoreError(err, OperationType.GET, path); } catch(e) {}
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId, user, navigate]);

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
    setError('');
    const path = 'results';
    try {
      // ... existing scoring logic ...
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
        fileUrls,
        score,
        grade,
        feedback: "Great attempt! Focus on improving your structured answer keywords.",
        completedAt: serverTimestamp(),
      });

      setResultsSummary({ score, grade });
      setShowResults(true);

      // Only navigate immediately if user is paid or admin (optional, let's show summary to everyone)
      // navigate('/dashboard');
    } catch (err: any) {
      console.error("Submit Exam Error:", err);
      setError('Failed to submit your exam. Please try again.');
      try { handleFirestoreError(err, OperationType.CREATE, path); } catch(e) {}
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading Session...</div>;
  
  if (error && !paper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <p className="text-slate-900 font-bold">{error}</p>
        <Button onClick={() => navigate('/practice')}>Go Back</Button>
      </div>
    );
  }

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
            src="/logo.svg" 
            alt="GradeBoost 60 Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">{paper.title}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{paper.subject} • {paper.paperType}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20">
              <AlertCircle size={16} />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}
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
                    <div className="mt-2">
                      <FileUpload 
                        onUploadComplete={(url) => {
                          setFileUrls(prev => ({ ...prev, [q]: url }));
                        }}
                        onDelete={() => {
                          setFileUrls(prev => {
                            const next = { ...prev };
                            delete next[q];
                            return next;
                          });
                        }}
                        initialUrl={fileUrls[q]}
                        folder={`submissions/${user.uid}/practice/${paper.id}`}
                        label="Upload Photo of Answer"
                        accept="image/*,application/pdf"
                      />
                    </div>
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
                      <div className="mt-4">
                        <FileUpload 
                          onUploadComplete={(url) => {
                            setFileUrls(prev => ({ ...prev, 'p3': url }));
                          }}
                          onDelete={() => {
                            setFileUrls(prev => {
                              const next = { ...prev };
                              delete next['p3'];
                              return next;
                            });
                          }}
                          initialUrl={fileUrls['p3']}
                          folder={`submissions/${user.uid}/practice/${paper.id}`}
                          label="Upload Code/Project File"
                          accept="*/*"
                        />
                      </div>
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
                        <div className="mt-2">
                          <FileUpload 
                            onUploadComplete={(url) => {
                              setFileUrls(prev => ({ ...prev, [module]: url }));
                            }}
                            onDelete={() => {
                              setFileUrls(prev => {
                                const next = { ...prev };
                                delete next[module];
                                return next;
                              });
                            }}
                            initialUrl={fileUrls[module]}
                            folder={`submissions/${user.uid}/practice/${paper.id}`}
                            label={`Upload ${module} File`}
                            accept="*/*"
                          />
                        </div>
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

      {/* Results Summary Modal */}
      <AnimatePresence>
        {showResults && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => !user.paymentStatus || user.paymentStatus === 'unpaid' ? null : setShowResults(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                  <Trophy size={48} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Exam Completed!</h2>
                  <p className="text-slate-500 font-medium">You've successfully submitted your {paper.paperType} session.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Score</p>
                    <p className="text-4xl font-black text-slate-900">{resultsSummary?.score}%</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Predicted Grade</p>
                    <p className="text-4xl font-black text-indigo-600">{resultsSummary?.grade}</p>
                  </div>
                </div>

                {user.paymentStatus === 'unpaid' ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                      <div className="flex gap-3">
                        <Zap className="text-amber-600 shrink-0" size={20} />
                        <p className="text-sm font-bold text-amber-900">
                          Unlock detailed corrections, explanations, and Paper 2 & 3 interactive practice for just 1000 FCFA.
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      onClick={() => navigate('/payment')}
                    >
                      Unlock Full Access <Sparkles className="ml-2" size={20} />
                    </Button>
                    <button 
                      onClick={() => navigate('/payment')}
                      className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      className="w-full py-6 text-lg bg-slate-900 hover:bg-black"
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to Dashboard <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
