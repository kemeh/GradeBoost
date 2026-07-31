import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, BookOpen, Layers, Edit3, Trash2, 
  Copy, Sparkles, Upload, Eye, CheckCircle2, ShieldCheck, ArrowLeft,
  FileText, Code, HelpCircle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import QuestionRenderer from '../components/QuestionRenderer';
import QuestionEditorModal from '../components/QuestionEditorModal';
import AIQuestionGeneratorModal from '../components/AIQuestionGeneratorModal';
import { 
  fetchQuestions, 
  deleteQuestion, 
  duplicateQuestion, 
  saveQuestion 
} from '../services/questionEngineService';
import { QuestionEngineItem } from '../types';
import toast from 'react-hot-toast';

export default function AdminQuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionEngineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPaper, setSelectedPaper] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedYear, setSelectedYear] = useState(0);

  // Modals & Previews
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionEngineItem | undefined>(undefined);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionEngineItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchQuestions({
      level: selectedLevel,
      subject: selectedSubject,
      paper: selectedPaper,
      type: selectedType,
      difficulty: selectedDifficulty,
      year: selectedYear,
      searchQuery
    });
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedLevel, selectedSubject, selectedPaper, selectedType, selectedDifficulty, selectedYear, searchQuery]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await deleteQuestion(id);
      toast.success('Question removed from Question Bank');
      loadData();
    }
  };

  const handleDuplicate = async (id: string) => {
    const dup = await duplicateQuestion(id);
    if (dup) {
      toast.success('Question duplicated');
      loadData();
    }
  };

  const handleSaveQuestion = async (qData: Partial<QuestionEngineItem>) => {
    await saveQuestion(qData);
    toast.success('Question saved successfully');
    setIsEditorOpen(false);
    setEditingQuestion(undefined);
    loadData();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto overflow-y-auto">
        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4" /> Cameroon GCE Assessment Engine
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Master Question Bank
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Manage Ordinary & Advanced Level questions across all subjects, types, and past exam years.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-600" /> AI Generator
            </button>
            <button
              onClick={() => navigate('/admin/bulk-import')}
              className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-600" /> Bulk Import
            </button>
            <button
              onClick={() => {
                setEditingQuestion(undefined);
                setIsEditorOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </header>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by keyword, topic, subject, or text..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
              >
                <option value="all">All Levels</option>
                <option value="Ordinary Level">Ordinary Level</option>
                <option value="Advanced Level">Advanced Level</option>
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="structured">Structured</option>
              <option value="essay">Essay</option>
              <option value="programming">Programming</option>
              <option value="true_false">True / False</option>
              <option value="matching">Matching</option>
              <option value="fill_in_blanks">Fill in Blanks</option>
            </select>
            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
            >
              <option value="all">All Papers</option>
              <option value="Paper 1">Paper 1</option>
              <option value="Paper 2">Paper 2</option>
              <option value="Paper 3">Paper 3</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
            >
              <option value={0}>All Exam Years</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <span className="ml-auto text-slate-400 font-bold">
              Showing {questions.length} questions
            </span>
          </div>
        </div>

        {/* Questions Grid / List */}
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-400 uppercase tracking-widest text-xs">
            Loading Question Bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No questions found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Try adjusting your filters or click below to create new questions.
            </p>
            <button
              onClick={() => {
                setEditingQuestion(undefined);
                setIsEditorOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {q.questionType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {q.level} • {q.subject} ({q.paper})
                    </span>
                    <span className="text-xs font-bold text-slate-400">• Year {q.examYear}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                    {q.questionText}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                    <span>Topic: {q.topic}</span>
                    <span>Marks: {q.marks}</span>
                    <span>Difficulty: {q.difficulty}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Preview Question"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsEditorOpen(true);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit Question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q.id)}
                    className="p-2 rounded-xl border border-slate-200 text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Duplicate Question"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question Editor Modal */}
        {isEditorOpen && (
          <QuestionEditorModal
            initialQuestion={editingQuestion}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveQuestion}
          />
        )}

        {/* AI Generator Modal */}
        {isAiModalOpen && (
          <AIQuestionGeneratorModal
            onClose={() => setIsAiModalOpen(false)}
            onGenerated={(newQs) => {
              toast.success(`Generated ${newQs.length} new questions!`);
              loadData();
            }}
          />
        )}

        {/* Full Preview Modal */}
        {previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Question Bank Live Preview</h3>
              <QuestionRenderer
                question={previewQuestion}
                showExplanation={true}
                showModelAnswer={true}
                isReadOnly={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
