import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { Clock, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Upload, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { downloadExamPDF } from '../utils/pdfGenerator';

export default function ExamSession() {
  const { examId } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      const examRef = doc(db, 'mockExams', examId!);
      const examSnap = await getDoc(examRef);
      
      let examData: any = null;
      if (examSnap.exists()) {
        examData = { id: examSnap.id, ...examSnap.data() };
      } else if (examId === 'gce-2025-paper-1') {
        // Mock data for demonstration
        examData = {
          id: 'gce-2025-paper-1',
          title: 'GCE 2025 Mock - Paper 1',
          duration: 90,
          questions: [
            {
              question: "Which of the following is a primary storage device?",
              options: ["Hard Disk", "RAM", "CD-ROM", "Flash Drive"],
              correctAnswer: 1,
              explanation: "RAM (Random Access Memory) is considered primary storage because it is directly accessible by the CPU."
            },
            {
              question: "What does CPU stand for?",
              options: ["Central Processing Unit", "Computer Personal Unit", "Central Peripheral Unit", "Control Processing Unit"],
              correctAnswer: 0,
              explanation: "CPU stands for Central Processing Unit, the 'brain' of the computer."
            },
            {
              question: "Which data structure uses LIFO (Last-In-First-Out)?",
              options: ["Queue", "Linked List", "Stack", "Tree"],
              correctAnswer: 2,
              explanation: "A Stack follows the LIFO principle, where the last element added is the first one to be removed."
            },
            {
              question: "What is the binary representation of the decimal number 10?",
              options: ["1010", "1100", "1001", "1111"],
              correctAnswer: 0,
              explanation: "10 in decimal is 1010 in binary (8 + 2)."
            },
            {
              question: "Which protocol is used for sending emails?",
              options: ["HTTP", "FTP", "SMTP", "POP3"],
              correctAnswer: 2,
              explanation: "SMTP (Simple Mail Transfer Protocol) is used for sending emails, while POP3/IMAP are used for receiving."
            }
          ]
        };
      }

      if (examData) {
        setExam(examData);
        setAnswers(new Array(examData.questions.length).fill(-1));
        setTimeLeft(examData.duration * 60);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    if (timeLeft <= 0 || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleFinish = async () => {
    if (isFinished) return;
    
    if (exam.type === 'STRUCTURED') {
      if (!uploadFile) {
        alert('Please upload your answer sheet before finishing.');
        return;
      }
      
      setIsSubmitting(true);
      try {
        // In a real app, we'd upload to Firebase Storage. 
        // Here we'll simulate a URL.
        const simulatedFileUrl = `https://firebasestorage.googleapis.com/v0/b/mock-url/o/${uploadFile.name}`;
        
        await addDoc(collection(db, 'examSubmissions'), {
          examId: exam.id,
          examTitle: exam.title,
          studentId: auth.currentUser?.uid,
          studentName: user?.displayName || 'Anonymous Student',
          fileUrl: simulatedFileUrl,
          status: 'PENDING',
          submittedAt: new Date().toISOString()
        });

        setIsFinished(true);
        setResult({ type: 'STRUCTURED_PENDING' });
      } catch (err) {
        console.error(err);
        alert('Error submitting exam');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsFinished(true);
    let score = 0;
    exam.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / exam.questions.length) * 100);
    const resultData = {
      score,
      total: exam.questions.length,
      percentage,
      timeTaken: (exam.duration * 60) - timeLeft,
      passed: percentage >= 50
    };
    setResult(resultData);

    if (auth.currentUser && user) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          examHistory: arrayUnion({
            examId: exam.id,
            examTitle: exam.title,
            score: percentage,
            completedAt: new Date().toISOString()
          })
        });
        await refreshUser();
      } catch (err) {
        console.error("Error updating exam history:", err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold animate-pulse">Preparing Exam Environment...</p>
    </div>
  );

  if (!exam) return (
    <div className="max-w-2xl mx-auto text-center py-32">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Exam Not Found</h2>
      <Link to="/exams" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold inline-flex">Back to Exam Center</Link>
    </div>
  );

  if (isFinished && result) {
    if (result.type === 'STRUCTURED_PENDING') {
      return (
        <div className="max-w-4xl mx-auto py-12 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center space-y-12"
          >
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto rounded-[2rem] bg-blue-100 text-blue-600 flex items-center justify-center">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Submission Received!</h2>
              <p className="text-slate-500 font-medium text-base">
                Your answers for <span className="text-slate-900 font-bold">{exam.title}</span> have been submitted for manual grading.
              </p>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 inline-block">
                <p className="text-blue-700 font-bold text-sm">You will be notified once your teacher has graded your work.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-12">
              <button
                onClick={() => navigate('/exams')}
                className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl"
              >
                Back to Exam Center
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center space-y-12"
        >
          <div className="space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {result.passed ? <Trophy size={40} /> : <AlertCircle size={40} />}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
              {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-slate-500 font-medium text-base">
              You've completed the <span className="text-slate-900 font-bold">{exam.title}</span> simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{result.percentage}%</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correct</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{result.score}/{result.total}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Taken</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</p>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-slate-50">
            <h3 className="text-xl font-black text-slate-900 text-left">Detailed Review</h3>
            <div className="space-y-6 text-left">
              {exam.questions.map((q: any, idx: number) => (
                <div key={idx} className={`p-6 rounded-3xl border ${answers[idx] === q.correctAnswer ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${answers[idx] === q.correctAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {answers[idx] === q.correctAnswer ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    </div>
                    <div className="space-y-3">
                      <p className="font-bold text-slate-900">{q.question}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Your Answer: <span className="font-bold text-slate-900">{answers[idx] === -1 ? 'No Answer' : q.options[answers[idx]]}</span></p>
                        <p className="text-xs text-slate-500">Correct Answer: <span className="font-bold text-emerald-600">{q.options[q.correctAnswer]}</span></p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-12">
            <button
              onClick={() => navigate('/exams')}
              className="flex-1 bg-slate-100 text-slate-900 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Back to Exams
            </button>
            <button
              onClick={() => {
                setIsFinished(false);
                setResult(null);
                setCurrentQuestionIdx(0);
                setAnswers(new Array(exam.questions.length).fill(-1));
                setTimeLeft(exam.duration * 60);
              }}
              className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
            >
              <RefreshCw size={20} /> Retake Simulation
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Exam Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/exams')} className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{exam.title}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {exam.type === 'STRUCTURED' ? 'Structured Paper' : `Question ${currentQuestionIdx + 1} of ${exam.questions.length}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadExamPDF(exam)}
              className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="Download Questions as PDF"
            >
              <Download size={20} />
            </button>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-colors ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              <Clock size={20} />
              <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Exam Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-6">
        <div className="space-y-12">
          {exam.type === 'STRUCTURED' ? (
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 space-y-8">
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Exam Tasks</h3>
                  <p className="text-slate-500 font-medium text-sm">Please review the following tasks and prepare your answers in a single document (PDF or Image).</p>
                </div>
                
                <div className="space-y-4">
                  {exam.questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                          {idx + 1}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">Task {idx + 1}</h4>
                        {q.marks && (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                            {q.marks} Marks
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed text-sm">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Upload Your Answers</h3>
                  <p className="text-slate-500 font-medium text-xs">Upload your completed answer sheet (PDF, JPG, or PNG).</p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    id="answer-upload"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="answer-upload"
                    className={`flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-[1.5rem] cursor-pointer transition-all ${
                      uploadFile ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {uploadFile ? (
                      <>
                        <CheckCircle2 className="text-emerald-500 mb-3" size={40} />
                        <p className="text-emerald-700 font-black text-sm">{uploadFile.name}</p>
                        <p className="text-emerald-500 text-[10px] font-bold mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="text-slate-300 mb-3" size={40} />
                        <p className="text-slate-900 font-black text-sm">Click to select file</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-1">Maximum file size: 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                <button
                  onClick={handleFinish}
                  disabled={!uploadFile || isSubmitting}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>Submit for Grading <CheckCircle2 size={20} /></>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIdx + 1) / exam.questions.length) * 100}%` }}
                />
              </div>

              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                    {currentQuestion.question}
                  </h3>
                  {currentQuestion.marks && (
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex-shrink-0">
                      {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`group p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        answers[currentQuestionIdx] === i
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100'
                          : 'bg-slate-50 border-slate-50 hover:border-blue-200 hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${
                        answers[currentQuestionIdx] === i ? 'bg-white/20 text-white' : 'bg-white text-slate-400 border border-slate-100 group-hover:text-blue-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-base">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <div className="flex gap-4">
                  {currentQuestionIdx === exam.questions.length - 1 ? (
                    <button
                      onClick={handleFinish}
                      className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
                    >
                      Finish Exam <CheckCircle2 size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => Math.min(exam.questions.length - 1, prev + 1))}
                      className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-base hover:bg-black transition-all shadow-xl flex items-center gap-2 group"
                    >
                      Next Question <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
