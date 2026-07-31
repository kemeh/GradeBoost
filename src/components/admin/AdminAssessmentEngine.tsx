import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { ExamQuestion } from '../../types';
import { Card, Button, Badge, cn } from '../ui';
import { Sparkles, FileText, CheckCircle2, Plus, Trash2, Edit3, X, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function AdminAssessmentEngine() {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [mockExams, setMockExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'exams'>('questions');

  // Quick Question Form
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [qForm, setQForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    marks: 1,
  });

  useEffect(() => {
    fetchAssessmentsData();
  }, []);

  const fetchAssessmentsData = async () => {
    setLoading(true);
    try {
      const qSnap = await getDocs(query(collection(db, 'question_bank'), orderBy('createdAt', 'desc')));
      setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ExamQuestion[]);

      const examSnap = await getDocs(collection(db, 'mock_exams'));
      setMockExams(examSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching assessments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'question_bank'), {
        questionText: qForm.questionText,
        optionA: qForm.optionA,
        optionB: qForm.optionB,
        optionC: qForm.optionC,
        optionD: qForm.optionD,
        options: {
          A: qForm.optionA,
          B: qForm.optionB,
          C: qForm.optionC,
          D: qForm.optionD,
        },
        correctAnswer: qForm.correctAnswer,
        explanation: qForm.explanation,
        subject: qForm.subject,
        topic: qForm.topic,
        paper: 'Paper 1',
        difficulty: qForm.difficulty,
        marks: Number(qForm.marks),
        year: new Date().getFullYear(),
        isDailyDrill: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Question added to Master Question Bank!');
      setShowQuestionModal(false);
      setQForm({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficulty: 'Medium',
        marks: 1,
      });
      fetchAssessmentsData();
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'question_bank', id));
      toast.success('Question deleted');
      fetchAssessmentsData();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assessment Engine & Question Bank</h2>
          <p className="text-sm font-medium text-slate-500">
            Manage Master MCQ & Essay Question Bank, AI Exam Builder, and Mock Examinations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/questions">
            <Button variant="outline" className="rounded-2xl">
              <Sparkles size={16} className="mr-2" /> Open Full Question Studio
            </Button>
          </Link>
          <Link to="/admin/exam-builder">
            <Button className="rounded-2xl">
              <FileText size={16} className="mr-2" /> Launch Exam Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('questions')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'questions' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Sparkles size={14} /> Master Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'exams' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <FileText size={14} /> Mock Exams ({mockExams.length})
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowQuestionModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Quick Add Question
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">No questions in master bank yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                      <th className="p-4 pl-6">Question Text</th>
                      <th className="p-4">Subject & Topic</th>
                      <th className="p-4">Difficulty</th>
                      <th className="p-4">Correct Key</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/50">
                        <td className="p-4 pl-6 font-bold text-slate-900 text-sm max-w-md line-clamp-2">{q.questionText}</td>
                        <td className="p-4 text-xs font-bold text-indigo-600">
                          {q.subject}
                          <span className="block text-[10px] text-slate-400 font-medium">{q.topic || 'General'}</span>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={q.difficulty === 'Hard' ? 'danger' : q.difficulty === 'Medium' ? 'warning' : 'success'}
                            className="rounded-xl"
                          >
                            {q.difficulty}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono font-black text-indigo-600 text-sm">{q.correctAnswer}</td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Mock Exams Tab */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockExams.length === 0 ? (
            <div className="col-span-3 p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
              No custom mock exams compiled yet. Use the Exam Builder to synthesize full test papers.
            </div>
          ) : (
            mockExams.map(ex => (
              <Card key={ex.id} className="p-6 space-y-4 border-slate-100">
                <Badge variant="indigo" className="text-[10px]">{ex.subject}</Badge>
                <h3 className="text-base font-black text-slate-900">{ex.title}</h3>
                <div className="text-xs font-bold text-slate-500 space-y-1">
                  <p>Duration: {ex.durationMinutes || 90} mins</p>
                  <p>Pass Benchmark: {ex.passMark || 50}%</p>
                  <p>Question Count: {ex.questionIds?.length || 50}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Quick Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Add Question to Master Bank</h3>
              <button onClick={() => setShowQuestionModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Question Statement</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={qForm.questionText}
                  onChange={e => setQForm({...qForm, questionText: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Option A</label>
                  <input type="text" required className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.optionA} onChange={e => setQForm({...qForm, optionA: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Option B</label>
                  <input type="text" required className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.optionB} onChange={e => setQForm({...qForm, optionB: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Option C</label>
                  <input type="text" required className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.optionC} onChange={e => setQForm({...qForm, optionC: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Option D</label>
                  <input type="text" required className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.optionD} onChange={e => setQForm({...qForm, optionD: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Correct Key</label>
                  <select className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.correctAnswer} onChange={e => setQForm({...qForm, correctAnswer: e.target.value})}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Subject</label>
                  <input type="text" required className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.subject} onChange={e => setQForm({...qForm, subject: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Difficulty</label>
                  <select className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-bold mt-1" value={qForm.difficulty} onChange={e => setQForm({...qForm, difficulty: e.target.value as any})}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Detailed Explanation / Answer Rationale</label>
                <textarea rows={2} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none" value={qForm.explanation} onChange={e => setQForm({...qForm, explanation: e.target.value})} />
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Question</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
