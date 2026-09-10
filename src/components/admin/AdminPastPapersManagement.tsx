import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, BookOpen, Layers, Edit3, Trash2, 
  Copy, Sparkles, Upload, Eye, CheckCircle2, ShieldCheck, ArrowLeft,
  FileText, Code, HelpCircle, AlertCircle, Download, Calendar,
  Clock, Award, ExternalLink, RefreshCw, Archive, Check, X,
  FileCheck, ChevronRight, Hash, GraduationCap, School, EyeOff, LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, cn, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui';
import { QuestionPaper, SubjectModel } from '../../types';
import { 
  fetchQuestionPapersFast, 
  deleteQuestionPaperFast, 
  updateQuestionPaper, 
  publishQuestionPaper 
} from '../../services/questionPaperService';
import { DEFAULT_GCE_SUBJECTS } from '../../data/defaultSubjects';
import { db, auth } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import DynamicQuestionPaperUploadModal from './DynamicQuestionPaperUploadModal';
import FileUpload from '../FileUpload';
import toast from 'react-hot-toast';

interface AdminPastPapersManagementProps {
  embedded?: boolean;
}

export default function AdminPastPapersManagement({ embedded = false }: AdminPastPapersManagementProps) {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedPaperType, setSelectedPaperType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);
  const [editingPaper, setEditingPaper] = useState<QuestionPaper | null>(null);
  const [paperToDelete, setPaperToDelete] = useState<QuestionPaper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    title: '',
    subject: '',
    level: 'Ordinary level',
    year: new Date().getFullYear(),
    session: 'June Examination',
    paperType: 'Paper 1',
    description: '',
    instructions: '',
    durationMinutes: 120,
    totalMarks: 100,
    pdfUrl: '',
    fileName: '',
    fileSize: '',
    status: 'published' as 'published' | 'draft' | 'archived',
    requiresAnswerKey: false,
    correctAnswersRaw: ''
  });

  // Subjects for filters and forms
  const [availableSubjects, setAvailableSubjects] = useState<SubjectModel[]>([]);

  const loadPapers = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestionPapersFast(force);
      setPapers(data);
    } catch (err: any) {
      console.error('Error fetching question papers:', err);
      setError(err?.message || 'Failed to load question papers repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();

    // Load available subjects
    const fetchSubjects = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'subjects'), where('isActive', '==', true)));
        if (!snap.empty) {
          setAvailableSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SubjectModel[]);
        } else {
          setAvailableSubjects(DEFAULT_GCE_SUBJECTS.map((s, i) => ({ id: `default-${i}`, ...s })));
        }
      } catch (e) {
        setAvailableSubjects(DEFAULT_GCE_SUBJECTS.map((s, i) => ({ id: `default-${i}`, ...s })));
      }
    };
    fetchSubjects();
  }, []);

  // Filtered Papers
  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      const matchesSearch = 
        !searchQuery.trim() ||
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.paperCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.session || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = 
        selectedLevel === 'all' || 
        (p.level && p.level.toLowerCase().includes(selectedLevel.toLowerCase())) ||
        (selectedLevel === 'Ordinary level' && (p.curriculumName || '').toLowerCase().includes('ordinary')) ||
        (selectedLevel === 'Advance level' && (p.curriculumName || '').toLowerCase().includes('advance'));

      const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;
      const matchesYear = selectedYear === 'all' || String(p.year) === selectedYear;
      const matchesPaperType = selectedPaperType === 'all' || p.paperType === selectedPaperType;
      const matchesStatus = selectedStatus === 'all' || (p.status || 'published') === selectedStatus;

      return matchesSearch && matchesLevel && matchesSubject && matchesYear && matchesPaperType && matchesStatus;
    });
  }, [papers, searchQuery, selectedLevel, selectedSubject, selectedYear, selectedPaperType, selectedStatus]);

  // Distinct Years for Filter
  const distinctYears = useMemo(() => {
    const years = Array.from(new Set(papers.map(p => p.year).filter(Boolean)));
    years.sort((a, b) => b - a);
    return years.length > 0 ? years : [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  }, [papers]);

  // Distinct Paper Types
  const distinctPaperTypes = useMemo(() => {
    const types = Array.from(new Set(papers.map(p => p.paperType).filter(Boolean)));
    return types.length > 0 ? types : ['Paper 1', 'Paper 2', 'Paper 3'];
  }, [papers]);

  // Open Edit Modal
  const handleOpenEdit = (paper: QuestionPaper) => {
    setEditingPaper(paper);
    let answersRaw = '';
    if (paper.correctAnswers) {
      answersRaw = Object.entries(paper.correctAnswers)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([_, v]) => v)
        .join(', ');
    }

    setEditForm({
      title: paper.title || '',
      subject: paper.subject || '',
      level: paper.level || 'Ordinary level',
      year: paper.year || new Date().getFullYear(),
      session: paper.session || 'June Examination',
      paperType: paper.paperType || 'Paper 1',
      description: paper.description || '',
      instructions: paper.instructions || '',
      durationMinutes: paper.durationMinutes || 120,
      totalMarks: paper.totalMarks || 100,
      pdfUrl: paper.pdfUrl || '',
      fileName: paper.fileName || '',
      fileSize: paper.fileSize || '',
      status: (paper.status as any) || 'published',
      requiresAnswerKey: !!paper.requiresAnswerKey,
      correctAnswersRaw: answersRaw
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;
    if (!editForm.subject || !editForm.pdfUrl) {
      toast.error('Subject and PDF URL are required.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const correctAnswers: Record<string, string> = {};
      if (editForm.correctAnswersRaw.trim()) {
        const parts = editForm.correctAnswersRaw.split(',');
        parts.forEach((part, index) => {
          const val = part.trim().toUpperCase();
          if (val) {
            correctAnswers[(index + 1).toString()] = val;
          }
        });
      }

      const updatePayload: Partial<QuestionPaper> = {
        title: editForm.title.trim() || `${editForm.year} ${editForm.subject} - ${editForm.paperType}`,
        subject: editForm.subject,
        level: editForm.level,
        year: Number(editForm.year),
        session: editForm.session,
        paperType: editForm.paperType,
        description: editForm.description,
        instructions: editForm.instructions,
        durationMinutes: Number(editForm.durationMinutes),
        totalMarks: Number(editForm.totalMarks),
        pdfUrl: editForm.pdfUrl,
        fileName: editForm.fileName,
        fileSize: editForm.fileSize,
        status: editForm.status,
        requiresAnswerKey: editForm.requiresAnswerKey,
        ...(Object.keys(correctAnswers).length > 0 ? { correctAnswers } : {})
      };

      await updateQuestionPaper(editingPaper.id, updatePayload);
      toast.success('Question paper updated successfully!');
      setEditingPaper(null);
      loadPapers(true);
    } catch (err: any) {
      console.error('Error saving paper edit:', err);
      toast.error('Failed to update question paper.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Paper
  const handleConfirmDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuestionPaperFast(paperToDelete.id);
      toast.success('Question paper removed.');
      setPapers(prev => prev.filter(p => p.id !== paperToDelete.id));
      setPaperToDelete(null);
    } catch (err: any) {
      console.error('Error deleting paper:', err);
      toast.error('Failed to delete question paper.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe Download Handler
  const handleDownload = (paper: QuestionPaper) => {
    if (!paper.pdfUrl) {
      toast.error('No file link available for this paper.');
      return;
    }
    const safeTitle = (paper.title || `${paper.year}_${paper.subject}_${paper.paperType}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Create invisible anchor tag to initiate real download
    const a = document.createElement('a');
    a.href = paper.pdfUrl;
    a.download = `${safeTitle}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Starting download...');
  };

  return (
    <div className={cn("space-y-6 w-full min-w-0", embedded ? "" : "max-w-7xl mx-auto py-2")}>
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest mb-1.5">
            <ShieldCheck className="w-4 h-4" /> Examination Repository & Paper Bank
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Past Papers & Paper Bank
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Browse, preview, download, and manage official GCE, TVEE, HND, and mock examination papers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline"
            onClick={() => loadPapers(true)}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            title="Refresh repository"
          >
            <RefreshCw className={cn("w-4 h-4 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>

          <Button 
            variant="outline"
            onClick={() => navigate('/admin/paper-generator')}
            className="rounded-xl border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/70 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
            AI Paper Generator
          </Button>

          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-200"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Past Paper
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Papers</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{papers.length}</p>
          <span className="text-[11px] font-bold text-slate-400">Archived in Repository</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">GCE O & A Level</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <GraduationCap size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {papers.filter(p => !p.level?.toLowerCase().includes('hnd')).length}
          </p>
          <span className="text-[11px] font-bold text-slate-400">General & Technical</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HND & BTS</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <School size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {papers.filter(p => p.level?.toLowerCase().includes('hnd') || p.level?.toLowerCase().includes('bts')).length}
          </p>
          <span className="text-[11px] font-bold text-slate-400">Higher Education</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">With Answer Keys</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {papers.filter(p => p.correctAnswers && Object.keys(p.correctAnswers).length > 0).length}
          </p>
          <span className="text-[11px] font-bold text-slate-400">Auto-grading Ready</span>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, subject, session, syllabus code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            >
              <option value="all">All Levels & Sections</option>
              <option value="Ordinary level">GCE Ordinary Level</option>
              <option value="Advance level">GCE Advanced Level</option>
              <option value="TVEE">TVEE Technical</option>
              <option value="HND">HND / BTS</option>
              <option value="Commercial">Commercial Studies</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="w-full md:w-36">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            >
              <option value="all">All Years</option>
              {distinctYears.map(yr => (
                <option key={yr} value={String(yr)}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Paper Type */}
          <div className="w-full md:w-36">
            <select
              value={selectedPaperType}
              onChange={e => setSelectedPaperType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            >
              <option value="all">All Types</option>
              {distinctPaperTypes.map(pt => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
              title="Table view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
              title="Grid cards view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedLevel !== 'all' || selectedSubject !== 'all' || selectedYear !== 'all' || selectedPaperType !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                Search: "{searchQuery}"
                <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                Level: {selectedLevel}
                <X size={12} className="cursor-pointer hover:text-blue-900" onClick={() => setSelectedLevel('all')} />
              </span>
            )}
            {selectedSubject !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                Subject: {selectedSubject}
                <X size={12} className="cursor-pointer hover:text-purple-900" onClick={() => setSelectedSubject('all')} />
              </span>
            )}
            {selectedYear !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">
                Year: {selectedYear}
                <X size={12} className="cursor-pointer hover:text-amber-900" onClick={() => setSelectedYear('all')} />
              </span>
            )}
            {selectedPaperType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                Type: {selectedPaperType}
                <X size={12} className="cursor-pointer hover:text-emerald-900" onClick={() => setSelectedPaperType('all')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
                setSelectedSubject('all');
                setSelectedYear('all');
                setSelectedPaperType('all');
              }}
              className="text-xs font-bold text-red-500 hover:underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-700">Loading Past Papers & Question Paper Repository...</p>
            <p className="text-xs text-slate-400">Fetching verified documents and examination schemes...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-10 text-center bg-red-50/50 border border-red-200 rounded-2xl">
          <div className="flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-black text-red-900">Unable to Load Papers</h3>
            <p className="text-sm text-red-700 max-w-md">{error}</p>
            <Button onClick={() => loadPapers(true)} className="mt-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">
              Retry Connection
            </Button>
          </div>
        </Card>
      ) : filteredPapers.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Past Papers Found</h3>
            <p className="text-sm text-slate-500 font-medium">
              {papers.length === 0 
                ? "No past papers have been added yet to the Edulpha repository. Upload your first GCE or HND paper now."
                : "No examination papers match your active filter criteria. Try adjusting your filters or search term."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
              >
                <Plus size={16} className="mr-1.5" />
                Add Past Paper
              </Button>
              {papers.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel('all');
                    setSelectedSubject('all');
                    setSelectedYear('all');
                    setSelectedPaperType('all');
                  }}
                  className="rounded-xl border-slate-200"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Showing {filteredPapers.length} of {papers.length} Papers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title & Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level / Section</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year & Session</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paper Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">File & Keys</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {paper.title || `${paper.year} ${paper.subject} - ${paper.paperType}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                            {paper.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {paper.durationMinutes} mins
                              </span>
                            )}
                            {paper.totalMarks && (
                              <span className="flex items-center gap-1">
                                <Award size={12} /> {paper.totalMarks} marks
                              </span>
                            )}
                            {paper.paperCode && (
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                                {paper.paperCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                        {paper.subject}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-block px-2.5 py-1 rounded-lg text-xs font-bold",
                        paper.level?.toLowerCase().includes('advance') 
                          ? "bg-purple-50 text-purple-700"
                          : paper.level?.toLowerCase().includes('hnd')
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      )}>
                        {paper.level || 'Ordinary level'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-black text-slate-900">{paper.year}</span>
                        <p className="text-[11px] text-slate-400 font-medium">{paper.session || 'June Session'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="primary" className="font-bold">
                        {paper.paperType || 'Paper 1'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                          <FileText size={12} className="text-red-500" /> PDF Document
                        </span>
                        {paper.correctAnswers && Object.keys(paper.correctAnswers).length > 0 && (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 size={10} /> {Object.keys(paper.correctAnswers).length} Answers Key
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setPreviewPaper(paper)}
                          className="h-8 px-2.5 text-xs text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
                          title="Preview Paper"
                        >
                          <Eye size={14} className="mr-1" /> Preview
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(paper)}
                          className="h-8 px-2 text-xs text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
                          title="Download File"
                        >
                          <Download size={14} />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenEdit(paper)}
                          className="h-8 px-2 text-xs text-slate-600 hover:text-blue-600 hover:border-blue-200"
                          title="Edit Metadata"
                        >
                          <Edit3 size={14} />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setPaperToDelete(paper)}
                          className="h-8 px-2 text-xs text-slate-400 hover:text-red-600 hover:border-red-200"
                          title="Delete Paper"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={paper.level?.toLowerCase().includes('advance') ? 'primary' : 'default'} className="text-xs">
                    {paper.level || 'Ordinary level'}
                  </Badge>
                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {paper.year}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-slate-900 line-clamp-2">
                      {paper.title || `${paper.year} ${paper.subject} - ${paper.paperType}`}
                    </h4>
                    <p className="text-xs font-bold text-indigo-600 mt-0.5">{paper.subject}</p>
                  </div>
                </div>

                <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">Paper Type:</span>
                    <span className="font-bold text-slate-700">{paper.paperType || 'Paper 1'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">Session:</span>
                    <span className="font-bold text-slate-700">{paper.session || 'June Session'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">Duration & Marks:</span>
                    <span className="font-bold text-slate-700">
                      {paper.durationMinutes || 120} mins • {paper.totalMarks || 100} marks
                    </span>
                  </div>
                  {paper.correctAnswers && Object.keys(paper.correctAnswers).length > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-medium text-slate-400">Answer Key:</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 size={12} /> {Object.keys(paper.correctAnswers).length} Answers
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 mt-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewPaper(paper)}
                  className="flex-1 rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Eye size={14} className="mr-1" /> Preview
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleDownload(paper)}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3"
                  title="Download File"
                >
                  <Download size={14} />
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(paper)}
                  className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-3"
                  title="Edit Paper"
                >
                  <Edit3 size={14} />
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setPaperToDelete(paper)}
                  className="rounded-xl border-slate-200 text-red-500 hover:bg-red-50 text-xs px-3"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dynamic Add Past Paper Modal */}
      {isAddModalOpen && (
        <DynamicQuestionPaperUploadModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          initialSubjects={availableSubjects}
          onPaperSaved={(newPaper) => {
            setPapers(prev => [newPaper, ...prev]);
            setIsAddModalOpen(false);
            toast.success('Paper added to repository!');
          }}
        />
      )}

      {/* Edit Paper Modal */}
      {editingPaper && (
        <Dialog open={!!editingPaper} onOpenChange={() => setEditingPaper(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900">
                Edit Past Examination Paper
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Paper Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    required
                    value={editForm.subject}
                    onChange={e => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Academic Level</label>
                  <select
                    value={editForm.level}
                    onChange={e => setEditForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  >
                    <option value="Ordinary level">GCE Ordinary Level</option>
                    <option value="Advance level">GCE Advanced Level</option>
                    <option value="TVEE Intermediate">TVEE Intermediate</option>
                    <option value="TVEE Advanced">TVEE Advanced</option>
                    <option value="HND Level 1">HND Level 1</option>
                    <option value="HND Level 2">HND Level 2</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Academic Year</label>
                  <input
                    type="number"
                    required
                    min={1990}
                    max={2030}
                    value={editForm.year}
                    onChange={e => setEditForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Paper Type</label>
                  <select
                    value={editForm.paperType}
                    onChange={e => setEditForm(prev => ({ ...prev, paperType: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  >
                    <option value="Paper 1">Paper 1 (MCQ)</option>
                    <option value="Paper 2">Paper 2 (Theory / Structural)</option>
                    <option value="Paper 3">Paper 3 (Practical)</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Session</label>
                  <input
                    type="text"
                    value={editForm.session}
                    onChange={e => setEditForm(prev => ({ ...prev, session: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={editForm.durationMinutes}
                    onChange={e => setEditForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* PDF File Upload or URL */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Question Paper PDF File</label>
                {editForm.pdfUrl ? (
                  <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="text-indigo-600 shrink-0" size={18} />
                      <span className="text-xs font-bold text-indigo-900 truncate">
                        {editForm.fileName || 'Current Document File'}
                      </span>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditForm(prev => ({ ...prev, pdfUrl: '', fileName: '', fileSize: '' }))}
                      className="text-xs text-red-500 hover:text-red-700 h-7"
                    >
                      Replace File
                    </Button>
                  </div>
                ) : (
                  <FileUpload 
                    onUploadComplete={(url, name, size) => {
                      const formattedSize = typeof size === 'number' 
                        ? `${(size / (1024 * 1024)).toFixed(1)} MB` 
                        : (size || '1.2 MB');
                      setEditForm(prev => ({
                        ...prev,
                        pdfUrl: url,
                        fileName: name || 'Uploaded Paper.pdf',
                        fileSize: formattedSize
                      }));
                    }}
                    accept=".pdf,.docx,application/pdf"
                    maxSizeMB={50}
                  />
                )}
              </div>

              {/* Answer Keys Raw */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">
                  MCQ Correct Answer Keys (Comma separated, e.g. A, B, C, D, A)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, C, B, D, A, B, C, A"
                  value={editForm.correctAnswersRaw}
                  onChange={e => setEditForm(prev => ({ ...prev, correctAnswersRaw: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingPaper(null)}
                  className="rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSavingEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Paper Modal */}
      {previewPaper && (
        <Dialog open={!!previewPaper} onOpenChange={() => setPreviewPaper(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Badge variant="primary" className="mb-1 text-xs">
                    {previewPaper.level} • {previewPaper.paperType}
                  </Badge>
                  <DialogTitle className="text-xl font-black text-slate-900">
                    {previewPaper.title || `${previewPaper.year} ${previewPaper.subject}`}
                  </DialogTitle>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {previewPaper.session || 'June Session'} • {previewPaper.year} • {previewPaper.durationMinutes || 120} mins
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    onClick={() => handleDownload(previewPaper)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Download size={14} className="mr-1.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Instructions Banner */}
              {previewPaper.instructions && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <span className="font-black text-slate-900 block">Examination Instructions:</span>
                  <p className="leading-relaxed">{previewPaper.instructions}</p>
                </div>
              )}

              {/* PDF Viewer / Document Frame */}
              <div className="w-full h-[520px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center relative">
                {previewPaper.pdfUrl ? (
                  <iframe 
                    src={previewPaper.pdfUrl}
                    title={previewPaper.title}
                    className="w-full h-full rounded-2xl"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600">No PDF document attached to this paper.</p>
                  </div>
                )}
              </div>

              {/* Answer Keys Grid if Available */}
              {previewPaper.correctAnswers && Object.keys(previewPaper.correctAnswers).length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Answer Key Master Sheet
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {Object.keys(previewPaper.correctAnswers).length} Questions Indexed
                    </span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                    {Object.entries(previewPaper.correctAnswers)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([qNum, ans]) => (
                        <div key={qNum} className="text-center p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block">Q{qNum}</span>
                          <span className="text-xs font-black text-indigo-700">{ans}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {paperToDelete && (
        <Dialog open={!!paperToDelete} onOpenChange={() => setPaperToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                Confirm Paper Removal
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600 py-2">
              Are you sure you want to remove <strong className="text-slate-900">{paperToDelete.title || paperToDelete.subject}</strong>? This action removes the document from both the admin archive and student portals.
            </p>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPaperToDelete(null)}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Paper'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
