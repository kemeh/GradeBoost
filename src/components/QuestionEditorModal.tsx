import React, { useState } from 'react';
import { 
  X, Save, Plus, Trash2, Code, FileText, CheckCircle2, 
  HelpCircle, Layers, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { 
  QuestionEngineItem, 
  QuestionType, 
  QuestionDifficulty, 
  AcademicLevel, 
  ExamSessionType,
  QuestionOption,
  MarkingSchemeSubPart
} from '../types';

interface QuestionEditorModalProps {
  initialQuestion?: Partial<QuestionEngineItem>;
  onClose: () => void;
  onSave: (question: Partial<QuestionEngineItem>) => void;
}

export default function QuestionEditorModal({
  initialQuestion,
  onClose,
  onSave
}: QuestionEditorModalProps) {
  const [formData, setFormData] = useState<Partial<QuestionEngineItem>>({
    title: initialQuestion?.title || '',
    questionNumber: initialQuestion?.questionNumber || 1,
    questionText: initialQuestion?.questionText || '',
    questionType: initialQuestion?.questionType || 'mcq',
    difficulty: initialQuestion?.difficulty || 'Medium',
    marks: initialQuestion?.marks || 1,
    estimatedTimeMinutes: initialQuestion?.estimatedTimeMinutes || 2,
    level: initialQuestion?.level || 'Ordinary Level',
    department: initialQuestion?.department || 'Science',
    subject: initialQuestion?.subject || 'Computer Science',
    paper: initialQuestion?.paper || 'Paper 1',
    topic: initialQuestion?.topic || 'General',
    subtopic: initialQuestion?.subtopic || 'General',
    examYear: initialQuestion?.examYear || new Date().getFullYear(),
    session: initialQuestion?.session || 'June',
    instructions: initialQuestion?.instructions || '',
    hints: initialQuestion?.hints || [],
    explanation: initialQuestion?.explanation || '',
    reference: initialQuestion?.reference || '',
    status: initialQuestion?.status || 'published',
    options: initialQuestion?.options || [
      { id: 'opt-a', label: 'A', text: '', isCorrect: true },
      { id: 'opt-b', label: 'B', text: '', isCorrect: false },
      { id: 'opt-c', label: 'C', text: '', isCorrect: false },
      { id: 'opt-d', label: 'D', text: '', isCorrect: false }
    ],
    markingScheme: initialQuestion?.markingScheme || {
      totalMarks: 5,
      modelAnswer: '',
      marksAllocation: [{ label: '(a)', description: 'Correct answer', points: 5 }]
    },
    programmingData: initialQuestion?.programmingData || {
      language: 'python',
      starterCode: 'def solution():\n    pass',
      solutionCode: 'def solution():\n    return True',
      sampleTests: [{ input: '', output: '', description: 'Test 1' }]
    },
    trueFalseAnswer: initialQuestion?.trueFalseAnswer ?? true,
    matchingPairs: initialQuestion?.matchingPairs || [
      { id: 'm-1', left: 'Term 1', right: 'Definition 1' },
      { id: 'm-2', left: 'Term 2', right: 'Definition 2' }
    ],
    blanks: initialQuestion?.blanks || [
      { index: 1, acceptedAnswers: ['answer'], caseSensitive: false }
    ]
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'type_settings' | 'explanations'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.questionText) return;
    onSave(formData);
  };

  const addMcqOption = () => {
    const opts = formData.options || [];
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLabel = labels[opts.length] || `Opt${opts.length + 1}`;
    setFormData({
      ...formData,
      options: [...opts, { id: `opt-${Date.now()}`, label: nextLabel, text: '', isCorrect: false }]
    });
  };

  const removeMcqOption = (id: string) => {
    const opts = (formData.options || []).filter(o => o.id !== id);
    setFormData({ ...formData, options: opts });
  };

  const updateMcqOption = (id: string, updates: Partial<QuestionOption>) => {
    const opts = (formData.options || []).map(o => {
      if (o.id === id) {
        return { ...o, ...updates };
      }
      if (updates.isCorrect && formData.questionType === 'mcq') {
        return { ...o, isCorrect: false }; // ensure single choice for standard MCQ
      }
      return o;
    });
    setFormData({ ...formData, options: opts });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {initialQuestion?.id ? 'Edit Question Bank Item' : 'Create New Question'}
            </h2>
            <p className="text-xs text-slate-400">Configure curriculum parameters, types, answers & marking guide.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Core Details & Classification
          </button>
          <button
            onClick={() => setActiveTab('type_settings')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'type_settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {formData.questionType?.toUpperCase()} Config & Answers
          </button>
          <button
            onClick={() => setActiveTab('explanations')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'explanations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Explanations & Marking Scheme
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Question Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. CPU Architecture Components"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Question Type</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value as QuestionType })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 font-medium bg-white"
                  >
                    <option value="mcq">Multiple Choice Question (MCQ)</option>
                    <option value="structured">Structured Question</option>
                    <option value="essay">Essay Question</option>
                    <option value="programming">Programming Question</option>
                    <option value="practical">Practical Question</option>
                    <option value="fill_in_blanks">Fill in the Blanks</option>
                    <option value="true_false">True or False</option>
                    <option value="matching">Matching Pairs</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
              </div>

              {/* Hierarchy Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as AcademicLevel })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  >
                    <option value="Ordinary Level">Ordinary Level</option>
                    <option value="Advanced Level">Advanced Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Science, Arts..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Computer Science, Math..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paper</label>
                  <input
                    type="text"
                    value={formData.paper}
                    onChange={(e) => setFormData({ ...formData, paper: e.target.value })}
                    placeholder="Paper 1, Paper 2..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Computer Architecture"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtopic</label>
                  <input
                    type="text"
                    value={formData.subtopic}
                    onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
                    placeholder="Central Processing Unit"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Marks & Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exam Year</label>
                  <input
                    type="number"
                    value={formData.examYear}
                    onChange={(e) => setFormData({ ...formData, examYear: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session</label>
                  <select
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value as ExamSessionType })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  >
                    <option value="June">June</option>
                    <option value="November">November</option>
                    <option value="Mock">Mock</option>
                    <option value="Special">Special</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Question Body Text (Supports Markdown & LaTeX)</label>
                <textarea
                  required
                  rows={5}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Which unit of the CPU is responsible for arithmetic..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'type_settings' && (
            <div className="space-y-4">
              {/* MCQ Options */}
              {formData.questionType === 'mcq' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase">Answer Options</h3>
                    <button
                      type="button"
                      onClick={addMcqOption}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </div>

                  {(formData.options || []).map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        name="correct_opt"
                        checked={opt.isCorrect}
                        onChange={() => updateMcqOption(opt.id, { isCorrect: true })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-xs text-slate-700 w-6">{opt.label}</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateMcqOption(opt.id, { text: e.target.value })}
                        placeholder={`Option ${opt.label} text...`}
                        className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeMcqOption(opt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* True False */}
              {formData.questionType === 'true_false' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Correct Answer</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                      <input
                        type="radio"
                        name="tf_ans"
                        checked={formData.trueFalseAnswer === true}
                        onChange={() => setFormData({ ...formData, trueFalseAnswer: true })}
                      /> TRUE
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                      <input
                        type="radio"
                        name="tf_ans"
                        checked={formData.trueFalseAnswer === false}
                        onChange={() => setFormData({ ...formData, trueFalseAnswer: false })}
                      /> FALSE
                    </label>
                  </div>
                </div>
              )}

              {/* Programming Data */}
              {formData.questionType === 'programming' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Programming Language</label>
                    <input
                      type="text"
                      value={formData.programmingData?.language}
                      onChange={(e) => setFormData({
                        ...formData,
                        programmingData: { ...formData.programmingData!, language: e.target.value }
                      })}
                      placeholder="python, java, cpp..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starter Code</label>
                    <textarea
                      rows={5}
                      value={formData.programmingData?.starterCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        programmingData: { ...formData.programmingData!, starterCode: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'explanations' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Explanation & Rationale</label>
                <textarea
                  rows={4}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is right and common pitfalls..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Model Answer / Marking Scheme Description</label>
                <textarea
                  rows={4}
                  value={formData.markingScheme?.modelAnswer}
                  onChange={(e) => setFormData({
                    ...formData,
                    markingScheme: {
                      ...formData.markingScheme!,
                      modelAnswer: e.target.value
                    }
                  })}
                  placeholder="Official Cameroon GCE model answer..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
