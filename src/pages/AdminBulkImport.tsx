import React, { useState } from 'react';
import { 
  Upload, FileText, Sparkles, CheckCircle, ArrowLeft, 
  Download, FileSpreadsheet, Loader2, Save, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { bulkImportQuestions, parseRawTextToQuestions } from '../services/questionEngineService';
import { QuestionEngineItem, AcademicLevel } from '../types';
import toast from 'react-hot-toast';

export default function AdminBulkImport() {
  const navigate = useNavigate();
  const [importMode, setImportMode] = useState<'text_ai' | 'json' | 'csv'>('text_ai');
  const [rawText, setRawText] = useState('');
  const [level, setLevel] = useState<AcademicLevel>('Ordinary Level');
  const [subject, setSubject] = useState('Computer Science');

  const [extractedQuestions, setExtractedQuestions] = useState<Partial<QuestionEngineItem>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTextExtract = () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseRawTextToQuestions(rawText, level, subject);
      setExtractedQuestions(parsed);
      setIsProcessing(false);
      toast.success(`Extracted ${parsed.length} questions from text!`);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setExtractedQuestions(parsed);
            toast.success(`Loaded ${parsed.length} questions from JSON`);
          }
        } catch {
          toast.error('Invalid JSON file format');
        }
      } else {
        // Raw text / CSV text parser
        const parsed = parseRawTextToQuestions(content, level, subject);
        setExtractedQuestions(parsed);
        toast.success(`Loaded ${parsed.length} questions`);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveAll = async () => {
    if (extractedQuestions.length === 0) return;
    setIsProcessing(true);
    await bulkImportQuestions(extractedQuestions);
    setIsProcessing(false);
    toast.success(`Successfully imported ${extractedQuestions.length} questions!`);
    navigate('/admin/questions');
  };

  const downloadSampleTemplate = () => {
    const sample = [
      {
        title: "Sample MCQ Question 1",
        questionNumber: 1,
        questionText: "What is the primary function of RAM?",
        questionType: "mcq",
        level: "Ordinary Level",
        subject: "Computer Science",
        paper: "Paper 1",
        topic: "Memory Systems",
        difficulty: "Easy",
        marks: 1,
        options: [
          { id: "opt-1", label: "A", text: "Volatile temporary storage", isCorrect: true },
          { id: "opt-2", label: "B", text: "Permanent optical disk storage", isCorrect: false }
        ]
      }
    ];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "question_import_sample.json");
    dlAnchorElem.click();
  };

  return (
    <ModernDashboardLayout role="admin" activeTab="questions">
      <div className="space-y-6 max-w-6xl mx-auto w-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/admin/questions')}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bulk Question Import Studio
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Extract questions from raw PDF/Word exam paper text, JSON, CSV, or Excel formats.
            </p>
          </div>
        </div>

        {/* Input Selector Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setImportMode('text_ai')}
              className={`py-3 px-6 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                importMode === 'text_ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" /> AI Text / Exam Paper Parser
            </button>
            <button
              onClick={() => setImportMode('json')}
              className={`py-3 px-6 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                importMode === 'json' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" /> JSON / File Upload
            </button>
          </div>

          {importMode === 'text_ai' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Academic Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="Ordinary Level">Ordinary Level</option>
                    <option value="Advanced Level">Advanced Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Paste Exam Paper Text (Raw questions, MCQs, or Past Papers)
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste question paper content here: e.g.&#10;Q1. Which component of the CPU carries out arithmetic operations?&#10;A. Control Unit&#10;B. ALU&#10;C. Memory Buffer&#10;D. Program Counter"
                  className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed"
                />
              </div>

              <button
                onClick={handleTextExtract}
                disabled={isProcessing || !rawText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Extract Questions with AI Engine
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Upload Question Bank File (.json, .txt, .csv)</h4>
                <p className="text-xs text-slate-500 mt-1">Select structured JSON or text export file from your local disk.</p>
              </div>
              <input
                type="file"
                accept=".json,.txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-import-input"
              />
              <div className="flex items-center justify-center gap-3 pt-2">
                <label
                  htmlFor="file-import-input"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-indigo-700 shadow-xs"
                >
                  Choose File
                </label>
                <button
                  onClick={downloadSampleTemplate}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Sample JSON Template
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Extracted Questions Preview Table */}
        {extractedQuestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Extracted Questions Preview ({extractedQuestions.length})
                </h3>
                <p className="text-xs text-slate-500">Review generated questions before committing to database.</p>
              </div>
              <button
                onClick={handleSaveAll}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All {extractedQuestions.length} Questions
              </button>
            </div>

            <div className="space-y-3">
              {extractedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase">
                      Q{idx + 1} • {q.questionType} • {q.subject} ({q.level})
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">{q.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{q.questionText}</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = [...extractedQuestions];
                      updated.splice(idx, 1);
                      setExtractedQuestions(updated);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
