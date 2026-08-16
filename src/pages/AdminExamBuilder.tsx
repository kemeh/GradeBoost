import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ShieldCheck, Clock, CheckCircle, 
  Settings, Trash2, Edit3, Sparkles, Layers, BookOpen, Save 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { fetchExams, fetchQuestions, saveExam, deleteExam, generateAutoExamQuestions } from '../services/questionEngineService';
import { EngineExam, QuestionEngineItem, AcademicLevel, ExamQuestionRef } from '../types';
import toast from 'react-hot-toast';

export default function AdminExamBuilder() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<EngineExam[]>([]);
  const [questions, setQuestions] = useState<QuestionEngineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<EngineExam>>({
    title: '',
    description: '',
    academicLevel: 'Ordinary Level',
    subject: 'Computer Science',
    paper: 'Paper 1',
    examType: 'mock',
    durationMinutes: 90,
    passingScorePercent: 60,
    questionOrder: 'random',
    shuffleOptions: true,
    negativeMarking: false,
    negativeMarksPerWrong: 0.25,
    retakesAllowed: true,
    showAnswers: 'after_submission',
    showExplanations: true,
    showResultsImmediately: true,
    allowCalculator: true,
    questions: [],
    status: 'published'
  });

  const [autoRuleCount, setAutoRuleCount] = useState({ easy: 10, medium: 10, hard: 5 });

  const loadData = async () => {
    setLoading(true);
    const [eList, qList] = await Promise.all([fetchExams(), fetchQuestions()]);
    setExams(eList);
    setQuestions(qList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam.title || !editingExam.subject) return;

    await saveExam(editingExam);
    toast.success('Examination created / updated!');
    setIsFormOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      await deleteExam(id);
      toast.success('Exam removed');
      loadData();
    }
  };

  const toggleQuestionInExam = (qId: string) => {
    const current = editingExam.questions || [];
    const exists = current.find(q => q.questionId === qId);
    if (exists) {
      setEditingExam({ ...editingExam, questions: current.filter(q => q.questionId !== qId) });
    } else {
      const qObj = questions.find(q => q.id === qId);
      const newRef: ExamQuestionRef = {
        questionId: qId,
        order: current.length + 1,
        marks: qObj?.marks || 1
      };
      setEditingExam({ ...editingExam, questions: [...current, newRef] });
    }
  };

  const handleAutoGenerateQuestions = async () => {
    const autoRefs = await generateAutoExamQuestions({
      subject: editingExam.subject || 'Computer Science',
      paper: editingExam.paper || 'Paper 1',
      totalQuestions: autoRuleCount.easy + autoRuleCount.medium + autoRuleCount.hard,
      easyCount: autoRuleCount.easy,
      mediumCount: autoRuleCount.medium,
      hardCount: autoRuleCount.hard
    });

    setEditingExam({ ...editingExam, questions: autoRefs });
    toast.success(`Auto-selected ${autoRefs.length} questions based on rules!`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4" /> Cameroon GCE Examination Engine
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Mock Exam Builder & Assessment Studio
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Build Paper 1, Paper 2, and Paper 3 custom examinations with rule-based auto selection and exam settings.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingExam({
                title: 'New GCE Mock Exam',
                description: 'Full syllabus assessment',
                academicLevel: 'Ordinary Level',
                subject: 'Computer Science',
                paper: 'Paper 1',
                examType: 'mock',
                durationMinutes: 90,
                passingScorePercent: 60,
                questionOrder: 'random',
                shuffleOptions: true,
                negativeMarking: false,
                retakesAllowed: true,
                showAnswers: 'after_submission',
                showExplanations: true,
                showResultsImmediately: true,
                allowCalculator: true,
                questions: [],
                status: 'published'
              });
              setIsFormOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Exam
          </button>
        </header>

        {/* Existing Exams Table */}
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading Examinations...
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No mock exams created yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">Create customized examinations for your students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {exam.academicLevel}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {exam.description || `${exam.subject} - ${exam.paper}`}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                    <span>{exam.questions.length} Questions</span>
                    <span>Pass: {exam.passingScorePercent}%</span>
                    <span>Calc: {exam.allowCalculator ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingExam(exam);
                      setIsFormOpen(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Configure Exam
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Exam Form Drawer / Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
                <h2 className="text-lg font-bold">Configure Examination</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exam Title</label>
                    <input
                      type="text"
                      required
                      value={editingExam.title}
                      onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={editingExam.subject}
                      onChange={(e) => setEditingExam({ ...editingExam, subject: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Exam Settings Grid */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Exam Parameters & Security Settings</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        value={editingExam.durationMinutes}
                        onChange={(e) => setEditingExam({ ...editingExam, durationMinutes: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Passing Score (%)</label>
                      <input
                        type="number"
                        value={editingExam.passingScorePercent}
                        onChange={(e) => setEditingExam({ ...editingExam, passingScorePercent: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Randomize Questions</label>
                      <select
                        value={editingExam.questionOrder}
                        onChange={(e) => setEditingExam({ ...editingExam, questionOrder: e.target.value as any })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                      >
                        <option value="random">Randomize</option>
                        <option value="fixed">Fixed Order</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Calculator Allowed</label>
                      <select
                        value={editingExam.allowCalculator ? 'yes' : 'no'}
                        onChange={(e) => setEditingExam({ ...editingExam, allowCalculator: e.target.value === 'yes' })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                      >
                        <option value="yes">Yes (Scientific Calculator)</option>
                        <option value="no">No Calculator</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto Question Selection Rules */}
                <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" /> Auto Question Selection Rule Generator
                    </h3>
                    <button
                      type="button"
                      onClick={handleAutoGenerateQuestions}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs"
                    >
                      Run Auto Selection
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-800 mb-1">Easy Count</label>
                      <input
                        type="number"
                        value={autoRuleCount.easy}
                        onChange={(e) => setAutoRuleCount({ ...autoRuleCount, easy: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-purple-200 text-xs font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-800 mb-1">Medium Count</label>
                      <input
                        type="number"
                        value={autoRuleCount.medium}
                        onChange={(e) => setAutoRuleCount({ ...autoRuleCount, medium: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-purple-200 text-xs font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-800 mb-1">Hard Count</label>
                      <input
                        type="number"
                        value={autoRuleCount.hard}
                        onChange={(e) => setAutoRuleCount({ ...autoRuleCount, hard: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-purple-200 text-xs font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Manual Question Selector */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">
                    Selected Questions ({editingExam.questions?.length || 0})
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 p-3 rounded-xl">
                    {questions.map((q) => {
                      const isSelected = editingExam.questions?.some(ref => ref.questionId === q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionInExam(q.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isSelected ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="text-slate-500 uppercase font-mono mr-2">[{q.difficulty}]</span>
                            <span>{q.title} ({q.subject})</span>
                          </div>
                          <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 text-indigo-600" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Examination
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
