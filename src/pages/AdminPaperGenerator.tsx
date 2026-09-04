import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Trash2, Save, FileText, 
  ChevronRight, ChevronDown, Download,
  LayoutDashboard, AlertCircle, Loader2, Search,
  Eye, Copy, CheckCircle, Clock, BookOpen,
  ArrowUp, ArrowDown, Code, Check, Sparkles,
  ExternalLink, RotateCcw, AlertTriangle, ShieldCheck, School
} from 'lucide-react';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { 
  collection, query, where, getDocs, 
  orderBy, limit 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Sidebar from '../components/Sidebar';
import { 
  Button, Card, Badge, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../components/ui';
import { ExamQuestion } from '../types';
import { 
  GeneratedPaperData, 
  PaperQuestion, 
  PaperSubpart, 
  PaperStatus, 
  PaperValidationResult 
} from '../types/paperGenerator';
import { validatePaper, getSubpartLabel } from '../utils/paperValidation';
import { generateGCEPaper2PDF } from '../utils/pdfGenerator';
import { generateGCEPaper2Docx, downloadGCEPaper2Docx } from '../utils/docxGenerator';
import { 
  savePaperDraft, 
  saveAsFinalPaper, 
  fetchPaperById 
} from '../services/questionPaperService';
import { PaperPreviewModal } from '../components/admin/PaperPreviewModal';
import { PaperLibraryModal } from '../components/admin/PaperLibraryModal';
import { 
  PaperGenerationProgressModal, 
  ProgressStage 
} from '../components/admin/PaperGenerationProgressModal';
import { ExaminationLetterheadSettingsModal } from '../components/admin/ExaminationLetterheadSettingsModal';
import { toast } from 'react-hot-toast';

const DEFAULT_SUBJECTS = [
  'Computer Science',
  'Information and Communication Technology (ICT)',
  'Pure Mathematics with Mechanics',
  'Pure Mathematics with Statistics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'History',
  'Geography',
  'Philosophy',
  'Literature in English'
];

const DEFAULT_INSTRUCTIONS = [
  'Answer ALL questions or as specified in your syllabus examination instructions.',
  'All questions carry equal marks unless otherwise indicated.',
  'Write your answers clearly and orderly in the spaces provided or standard answer booklet.',
  'Credit will be given for clear diagrams, concise reasoning, and neat presentation.',
  'Mathematical and non-programmable calculators may be used where appropriate.'
];

export default function AdminPaperGenerator() {
  const { user } = useAuth();
  const { appName, logoUrl } = useSettings();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [bankQuestions, setBankQuestions] = useState<ExamQuestion[]>([]);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTargetQuestionIndex, setActiveTargetQuestionIndex] = useState<number | null>(null);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressStage, setProgressStage] = useState<ProgressStage>('validating');
  const [progressError, setProgressError] = useState<string>('');
  const [lastExportedFilename, setLastExportedFilename] = useState<string>('');
  const [exportType, setExportType] = useState<'pdf' | 'docx' | 'both'>('pdf');

  // Saving / Autosave state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Highlighted question for validation jump
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);

  // Instructions management
  const [showInstructionsEditor, setShowInstructionsEditor] = useState(false);
  const [newInstructionText, setNewInstructionText] = useState('');

  // Main Paper State
  const [paperData, setPaperData] = useState<GeneratedPaperData>({
    id: '',
    title: 'Paper 2',
    paperType: 'Paper 2',
    subject: 'Computer Science',
    level: 'Advanced Level',
    curriculumId: 'cameroon_gce',
    curriculumName: 'Cameroon GCE',
    year: new Date().getFullYear(),
    timeAllowed: '3 Hours',
    durationMinutes: 180,
    instructions: [...DEFAULT_INSTRUCTIONS],
    targetQuestionsCount: 8,
    targetMarksPerQuestion: 17,
    targetTotalMarks: 100,
    totalCalculatedMarks: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: []
  });

  const currentUserId = user?.uid || (user as any)?.id || 'admin_user';

  // Calculate dynamic validation result on every state change
  const validationResult: PaperValidationResult = validatePaper(paperData);

  // Load question bank and check for paperId query param
  useEffect(() => {
    // Only teachers and admins allowed
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      navigate('/dashboard');
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch Question Bank
        try {
          const q = query(
            collection(db, 'exam_questions'),
            where('paper', '==', 'Paper 2'),
            orderBy('createdAt', 'desc'),
            limit(100)
          );
          const snapshot = await getDocs(q);
          setBankQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamQuestion)));
        } catch (err) {
          console.warn('Could not fetch question bank, will rely on manual question creator:', err);
        }

        // 2. Check if a paperId or draftId is specified in URL query params
        const urlPaperId = searchParams.get('paperId') || searchParams.get('draftId');
        if (urlPaperId) {
          const loaded = await fetchPaperById(urlPaperId);
          if (loaded) {
            setPaperData(loaded);
            setLastSavedTime(loaded.lastSavedAt || loaded.updatedAt || null);
            toast.success(`Loaded "${loaded.title || loaded.subject}"`);
            setLoading(false);
            return;
          }
        }

        // 3. Fallback: check localStorage for last paper draft
        try {
          const lastDraftId = localStorage.getItem('edulpha_last_paper_draft_id');
          if (lastDraftId) {
            const cached = localStorage.getItem(`edulpha_paper_draft_${lastDraftId}`);
            if (cached) {
              const parsed = JSON.parse(cached) as GeneratedPaperData;
              if (parsed && parsed.questions && parsed.questions.length > 0) {
                setPaperData(parsed);
                setLastSavedTime(parsed.lastSavedAt || null);
                setLoading(false);
                return;
              }
            }
          }
        } catch (_) {}

        // 4. Default: Start with 1 starter question if empty
        setPaperData(prev => ({
          ...prev,
          questions: [
            {
              id: 1,
              title: 'Question 1',
              text: 'Explain the fundamental difference between dynamic data structures and static data structures.',
              codeSnippet: '',
              subparts: [
                {
                  id: 'sub_1_1',
                  label: '(a)',
                  text: 'Define a linked list and state two advantages it has over a static array.',
                  marks: 5,
                  codeSnippet: ''
                },
                {
                  id: 'sub_1_2',
                  label: '(b)',
                  text: 'Write an algorithm (in pseudocode or standard programming language) to insert a new node at the beginning of a singly linked list.',
                  marks: 12,
                  codeSnippet: '// Example node structure:\nclass Node {\n  data: int\n  next: Node\n}'
                }
              ]
            }
          ]
        }));
      } catch (err) {
        console.error('Error during generator initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, navigate, searchParams]);

  // Debounced Autosave (1.5s after any edit)
  const triggerAutosave = useCallback(
    (updatedPaper: GeneratedPaperData) => {
      setHasUnsavedChanges(true);
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = setTimeout(async () => {
        if (!user) return;
        try {
          const savedDraft = await savePaperDraft(updatedPaper, currentUserId, {
            name: user.name,
            email: user.email
          });
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedTime(timeString);
          setHasUnsavedChanges(false);
          // Sync paper ID if it was newly created
          if (!updatedPaper.id && savedDraft.id) {
            setPaperData(prev => ({ ...prev, id: savedDraft.id }));
          }
        } catch (e) {
          console.warn('Autosave background sync note:', e);
        }
      }, 1500);
    },
    [user]
  );

  // Helper to update paper data and schedule autosave
  const updatePaper = (updater: (prev: GeneratedPaperData) => GeneratedPaperData) => {
    setPaperData(prev => {
      const next = updater(prev);
      // Automatically recalculate total marks
      const totalMarks = (next.questions || []).reduce(
        (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
        0
      );
      const withTotals: GeneratedPaperData = {
        ...next,
        totalCalculatedMarks: totalMarks,
        updatedAt: new Date().toISOString()
      };
      triggerAutosave(withTotals);
      return withTotals;
    });
  };

  // Jump to specific question
  const scrollToQuestion = (qId: number) => {
    const el = document.getElementById(`question-card-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedQuestionId(qId);
      setTimeout(() => setHighlightedQuestionId(null), 3000);
    }
  };

  // Manual Add Custom Blank Question
  const handleAddBlankQuestion = () => {
    if (paperData.questions.length >= 12) {
      toast.error('Maximum questions limit reached for Paper 2.');
      return;
    }

    const nextId = paperData.questions.length + 1;
    const newQuestion: PaperQuestion = {
      id: nextId,
      title: `Question ${nextId}`,
      text: '',
      codeSnippet: '',
      subparts: [
        {
          id: `sub_${nextId}_1`,
          label: '(a)',
          text: '',
          marks: 5,
          codeSnippet: ''
        },
        {
          id: `sub_${nextId}_2`,
          label: '(b)',
          text: '',
          marks: 12,
          codeSnippet: ''
        }
      ]
    };

    updatePaper(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setTimeout(() => scrollToQuestion(nextId), 150);
  };

  // Add Question from Question Bank
  const handleAddBankQuestion = (q: ExamQuestion) => {
    const nextId = activeTargetQuestionIndex !== null
      ? activeTargetQuestionIndex + 1
      : paperData.questions.length + 1;

    const newQuestion: PaperQuestion = {
      id: nextId,
      title: `Question ${nextId}`,
      text: q.questionText || '',
      codeSnippet: '',
      subparts: (q.subParts && q.subParts.length > 0)
        ? q.subParts.map((sp, sIdx) => ({
            id: `sub_${nextId}_${sIdx + 1}`,
            label: sp.label || getSubpartLabel(sIdx),
            text: sp.text || '',
            marks: Number(sp.marks) || 5,
            codeSnippet: ''
          }))
        : [
            {
              id: `sub_${nextId}_1`,
              label: '(a)',
              text: 'Explain the fundamental concepts outlined above.',
              marks: 5,
              codeSnippet: ''
            },
            {
              id: `sub_${nextId}_2`,
              label: '(b)',
              text: 'Analyze the trade-offs and provide practical implementation details.',
              marks: 12,
              codeSnippet: ''
            }
          ]
    };

    updatePaper(prev => {
      const qs = [...prev.questions];
      if (activeTargetQuestionIndex !== null && activeTargetQuestionIndex < qs.length) {
        qs[activeTargetQuestionIndex] = newQuestion;
      } else {
        qs.push(newQuestion);
      }
      return {
        ...prev,
        questions: qs.map((item, idx) => ({ ...item, id: idx + 1 }))
      };
    });

    setIsQuestionSelectorOpen(false);
    setActiveTargetQuestionIndex(null);
    toast.success(`Question added to Paper 2`);
  };

  // Duplicate Question
  const handleDuplicateQuestion = (qId: number) => {
    const target = paperData.questions.find(q => q.id === qId);
    if (!target) return;

    const dup: PaperQuestion = {
      ...target,
      id: paperData.questions.length + 1,
      title: `Question ${paperData.questions.length + 1} (Copy)`,
      subparts: target.subparts.map((s, idx) => ({
        ...s,
        id: `sub_${paperData.questions.length + 1}_${idx + 1}`
      }))
    };

    updatePaper(prev => ({
      ...prev,
      questions: [...prev.questions, dup].map((q, i) => ({ ...q, id: i + 1 }))
    }));
    toast.success(`Duplicated Question ${qId}`);
  };

  // Reorder Questions
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === paperData.questions.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    updatePaper(prev => {
      const qs = [...prev.questions];
      const temp = qs[index];
      qs[index] = qs[newIndex];
      qs[newIndex] = temp;
      return {
        ...prev,
        questions: qs.map((q, i) => ({ ...q, id: i + 1 }))
      };
    });
  };

  // Remove Question
  const handleRemoveQuestion = (id: number) => {
    if (paperData.questions.length <= 1) {
      toast.error('The paper must have at least one question.');
      return;
    }
    updatePaper(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id).map((q, i) => ({ ...q, id: i + 1 }))
    }));
    toast.success(`Removed question`);
  };

  // Subparts manipulation
  const handleAddSubpart = (qId: number) => {
    updatePaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          const nextIndex = q.subparts.length;
          const nextLabel = getSubpartLabel(nextIndex);
          const newSub: PaperSubpart = {
            id: `sub_${qId}_${nextIndex + 1}`,
            label: nextLabel,
            text: '',
            marks: 4,
            codeSnippet: ''
          };
          return {
            ...q,
            subparts: [...q.subparts, newSub]
          };
        }
        return q;
      })
    }));
  };

  const handleUpdateSubpart = (qId: number, sIdx: number, field: keyof PaperSubpart, value: any) => {
    updatePaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          const newSubs = [...q.subparts];
          newSubs[sIdx] = { ...newSubs[sIdx], [field]: value };
          return { ...q, subparts: newSubs };
        }
        return q;
      })
    }));
  };

  const handleRemoveSubpart = (qId: number, sIdx: number) => {
    updatePaper(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          if (q.subparts.length <= 1) {
            toast.error('Each question must have at least one sub-part.');
            return q;
          }
          return {
            ...q,
            subparts: q.subparts.filter((_, i) => i !== sIdx)
          };
        }
        return q;
      })
    }));
  };

  // Instructions management
  const handleAddInstruction = () => {
    if (!newInstructionText.trim()) return;
    updatePaper(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), newInstructionText.trim()]
    }));
    setNewInstructionText('');
    toast.success('Added candidate instruction');
  };

  const handleRemoveInstruction = (index: number) => {
    updatePaper(prev => ({
      ...prev,
      instructions: (prev.instructions || []).filter((_, i) => i !== index)
    }));
  };

  // Actions: Manual Save Draft
  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('You must be signed in.');
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading('Saving draft...');
    try {
      const saved = await savePaperDraft(paperData, currentUserId, {
        name: user.name,
        email: user.email
      });
      setPaperData(saved);
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeString);
      setHasUnsavedChanges(false);
      toast.success('Draft saved successfully to library!', { id: toastId });
    } catch (err) {
      console.error('Save draft error:', err);
      toast.error('Failed to save draft.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Actions: Save as Final Paper
  const handleSaveAsPaper = async (status: 'ready' | 'published' = 'ready') => {
    if (!user) {
      toast.error('You must be signed in.');
      return;
    }

    if (!validationResult.isValid) {
      toast.error('Please resolve all validation errors before saving as final paper.');
      if (validationResult.errors[0]?.questionId) {
        scrollToQuestion(validationResult.errors[0].questionId);
      }
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(status === 'published' ? 'Publishing examination paper...' : 'Saving examination paper...');
    try {
      const saved = await saveAsFinalPaper(paperData, currentUserId, {
        name: user.name,
        email: user.email
      }, status);
      setPaperData(saved);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setHasUnsavedChanges(false);
      toast.success(
        status === 'published'
          ? 'Examination paper published successfully!'
          : 'Examination paper saved as READY in Paper Library!',
        { id: toastId }
      );
    } catch (err) {
      console.error('Save paper error:', err);
      toast.error('Failed to save examination paper.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Actions: Generate PDF with progress
  const handleGeneratePDF = async () => {
    if (!validationResult.isValid) {
      toast.error('Paper has validation errors. Please review the validation checklist below.');
      if (validationResult.errors[0]?.questionId) {
        scrollToQuestion(validationResult.errors[0].questionId);
      }
      return;
    }

    setExportType('pdf');
    setIsProgressOpen(true);
    setProgressStage('validating');
    setProgressError('');

    try {
      // Step 1: Validating
      await new Promise(r => setTimeout(r, 400));
      setProgressStage('calculating');

      // Step 2: Calculating
      await new Promise(r => setTimeout(r, 450));
      setProgressStage('formatting');

      // Step 3: Formatting
      await new Promise(r => setTimeout(r, 500));
      setProgressStage('creating_pages');

      // Step 4: Generating PDF
      await new Promise(r => setTimeout(r, 500));
      setProgressStage('finalizing');

      const { filename } = await generateGCEPaper2PDF(paperData, { 
        appName, 
        logoUrl, 
        branding: paperData.brandingSnapshot 
      });
      setLastExportedFilename(filename);

      // Auto save as ready if was draft
      if (user && paperData.status === 'draft') {
        saveAsFinalPaper(paperData, currentUserId, { name: user.name, email: user.email }, 'ready').catch(() => {});
      }

      setProgressStage('completed');
      toast.success('PDF document compiled & downloaded!');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setProgressStage('error');
      setProgressError(err?.message || 'Failed to generate PDF document.');
    }
  };

  // Actions: Export Word (.docx) with progress
  const handleExportWord = async () => {
    if (!validationResult.isValid) {
      toast.error('Paper has validation errors. Please review the validation checklist below.');
      if (validationResult.errors[0]?.questionId) {
        scrollToQuestion(validationResult.errors[0].questionId);
      }
      return;
    }

    setExportType('docx');
    setIsProgressOpen(true);
    setProgressStage('validating');
    setProgressError('');

    try {
      await new Promise(r => setTimeout(r, 400));
      setProgressStage('calculating');

      await new Promise(r => setTimeout(r, 450));
      setProgressStage('formatting');

      await new Promise(r => setTimeout(r, 500));
      setProgressStage('creating_pages');

      await new Promise(r => setTimeout(r, 500));
      setProgressStage('finalizing');

      const filename = await downloadGCEPaper2Docx(paperData, { 
        appName, 
        logoUrl, 
        branding: paperData.brandingSnapshot 
      });
      setLastExportedFilename(filename);

      if (user && paperData.status === 'draft') {
        saveAsFinalPaper(paperData, currentUserId, { name: user.name, email: user.email }, 'ready').catch(() => {});
      }

      setProgressStage('completed');
      toast.success('Microsoft Word (.docx) compiled & downloaded!');
    } catch (err: any) {
      console.error('Word export error:', err);
      setProgressStage('error');
      setProgressError(err?.message || 'Failed to generate Word document.');
    }
  };

  // Reset editor to a new paper
  const handleNewPaper = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Start a fresh examination paper?')) {
        return;
      }
    }
    setSearchParams({});
    setPaperData({
      id: '',
      title: 'Paper 2',
      paperType: 'Paper 2',
      subject: 'Computer Science',
      level: 'Advanced Level',
      curriculumId: 'cameroon_gce',
      curriculumName: 'Cameroon GCE',
      year: new Date().getFullYear(),
      timeAllowed: '3 Hours',
      durationMinutes: 180,
      instructions: [...DEFAULT_INSTRUCTIONS],
      targetQuestionsCount: 8,
      targetMarksPerQuestion: 17,
      targetTotalMarks: 100,
      totalCalculatedMarks: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 1,
          title: 'Question 1',
          text: '',
          codeSnippet: '',
          subparts: [
            { id: 'sub_1_1', label: '(a)', text: '', marks: 5, codeSnippet: '' },
            { id: 'sub_1_2', label: '(b)', text: '', marks: 12, codeSnippet: '' }
          ]
        }
      ]
    });
    setLastSavedTime(null);
    setHasUnsavedChanges(false);
    toast.success('New examination paper initialized.');
  };

  // Determine current active workflow step
  const getWorkflowStep = () => {
    if (paperData.status === 'published') return 6;
    if (paperData.status === 'ready') return 5;
    if (isPreviewOpen) return 4;
    if (validationResult.isValid) return 3;
    if (paperData.questions.length >= 8) return 3;
    if (paperData.questions.length > 0) return 2;
    return 1;
  };
  const activeStep = getWorkflowStep();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Cameroon GCE Paper 2 Studio...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-36">
        
        {/* Top Header & Navigation */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200" 
              title="Go to Dashboard"
            >
              <LayoutDashboard size={20} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Paper 2 Generator
                </h1>
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider border",
                  paperData.status === 'published' ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                  paperData.status === 'ready' ? "bg-indigo-100 text-indigo-800 border-indigo-300" :
                  "bg-amber-100 text-amber-800 border-amber-300"
                )}>
                  {paperData.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Design, finalize, validate, save, and export professional Cameroon GCE Advanced Level examinations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            {/* Last saved indicator */}
            {lastSavedTime && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Last saved: {lastSavedTime}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <BookOpen size={15} />
              Paper Library
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBrandingModalOpen(true)}
              className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200"
              title="Configure School Letterhead and Watermark"
            >
              <School size={15} className="text-indigo-600" />
              School Branding
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNewPaper}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <Plus size={15} />
              New Paper
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <Save size={15} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-none"
            >
              <Eye size={15} />
              Preview Paper
            </Button>
          </div>
        </header>

        {/* Visual Workflow Steps Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {[
              { num: 1, label: 'Configure Paper' },
              { num: 2, label: 'Add Questions' },
              { num: 3, label: 'Validate' },
              { num: 4, label: 'Preview' },
              { num: 5, label: 'Save as Paper' },
              { num: 6, label: 'Export / Publish' }
            ].map((step, idx) => {
              const isPast = activeStep > step.num;
              const isCurrent = activeStep === step.num;

              return (
                <div key={step.num} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0",
                        isPast ? "bg-emerald-500 text-white" :
                        isCurrent ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100" :
                        "bg-slate-100 text-slate-400 border border-slate-200"
                      )}
                    >
                      {isPast ? <Check size={14} strokeWidth={3} /> : step.num}
                    </div>
                    <span className={cn(
                      "text-xs whitespace-nowrap",
                      isCurrent ? "font-bold text-blue-900" :
                      isPast ? "font-semibold text-slate-700" :
                      "text-slate-400"
                    )}>
                      {step.label}
                    </span>
                  </div>

                  {idx < 5 && (
                    <div className={cn(
                      "h-0.5 flex-1 mx-1.5 transition-colors",
                      isPast ? "bg-emerald-500" : "bg-slate-200"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Left Editor & Right Sticky Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Configuration, Questions, Instructions */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Paper Configuration Card */}
            <Card className="p-6 sm:p-7 space-y-5 bg-white border-slate-200 shadow-sm rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Paper Configuration</h2>
                  <p className="text-xs text-slate-500">Standard parameters for Cameroon GCE examination papers.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={paperData.questions.length === 8 ? 'success' : 'secondary'} className="font-bold">
                    {paperData.questions.length} / 8 Questions
                  </Badge>
                  <Badge variant="warning" className="font-bold bg-amber-50 text-amber-800 border-amber-200">
                    {paperData.totalCalculatedMarks} Total Marks
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-xs">
                
                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500">Subject</label>
                  <div className="flex gap-2">
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                      value={paperData.subject}
                      onChange={e => updatePaper(p => ({ ...p, subject: e.target.value }))}
                    >
                      {DEFAULT_SUBJECTS.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Paper Type */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500">Paper Type</label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                    value={paperData.paperType}
                    onChange={e => updatePaper(p => ({ ...p, paperType: e.target.value, title: e.target.value }))}
                    placeholder="e.g. Paper 2"
                  />
                </div>

                {/* Level */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500">Academic Level</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                    value={paperData.level}
                    onChange={e => updatePaper(p => ({ ...p, level: e.target.value }))}
                  >
                    <option value="Advanced Level">Advanced Level (A-Level)</option>
                    <option value="Ordinary Level">Ordinary Level (O-Level)</option>
                    <option value="HND">Higher National Diploma (HND)</option>
                  </select>
                </div>

                {/* Examination Year */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500">Examination Year</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                    value={paperData.year}
                    onChange={e => updatePaper(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500">Duration Allowed</label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                    value={paperData.timeAllowed}
                    onChange={e => updatePaper(p => ({ ...p, timeAllowed: e.target.value }))}
                    placeholder="e.g. 3 Hours"
                  />
                </div>

                {/* Target Marks per Question */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500">Standard Marks / Question</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                    value={paperData.targetMarksPerQuestion || 17}
                    onChange={e => updatePaper(p => ({ ...p, targetMarksPerQuestion: parseInt(e.target.value) || 17 }))}
                  />
                </div>
              </div>

              {/* Collapsible Candidate Instructions */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowInstructionsEditor(!showInstructionsEditor)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>{showInstructionsEditor ? 'Hide' : 'Configure'} Candidate Instructions ({paperData.instructions?.length || 0})</span>
                    <ChevronDown size={14} className={cn("transition-transform", showInstructionsEditor && "rotate-180")} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePaper(p => ({ ...p, instructions: [...DEFAULT_INSTRUCTIONS] }))}
                    className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                  >
                    Reset to GCE Defaults
                  </button>
                </div>

                {showInstructionsEditor && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-2">
                      {(paperData.instructions || []).map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                          <span className="font-bold text-slate-500 w-5">{idx + 1}.</span>
                          <input
                            type="text"
                            value={inst}
                            onChange={e => {
                              const newInst = [...(paperData.instructions || [])];
                              newInst[idx] = e.target.value;
                              updatePaper(p => ({ ...p, instructions: newInst }));
                            }}
                            className="flex-1 outline-none text-slate-800 bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInstruction(idx)}
                            className="text-slate-300 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add new instruction..."
                        value={newInstructionText}
                        onChange={e => setNewInstructionText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddInstruction()}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddInstruction}
                        className="text-xs font-bold"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Questions List */}
            <div className="space-y-6">
              {paperData.questions.map((q, qIdx) => {
                const qTotalMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
                const isHighlighted = highlightedQuestionId === q.id;

                return (
                  <Card 
                    key={q.id || qIdx} 
                    id={`question-card-${q.id}`}
                    className={cn(
                      "p-5 sm:p-7 space-y-5 relative bg-white border transition-all rounded-2xl shadow-sm",
                      isHighlighted 
                        ? "ring-4 ring-amber-400 border-amber-500 shadow-md bg-amber-50/20" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {/* Top Question Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                          {q.id}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Question {q.id}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            {q.subparts.length} sub-part{q.subparts.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {/* Question card actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(qIdx, 'up')}
                          disabled={qIdx === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition"
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(qIdx, 'down')}
                          disabled={qIdx === paperData.questions.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition"
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="Duplicate Question"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Main Question Prompt / Context
                        </label>
                        <span className="text-[11px] text-slate-400">Markdown supported</span>
                      </div>
                      <textarea 
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-y text-xs sm:text-sm leading-relaxed"
                        value={q.text}
                        placeholder="State the problem context or introductory question text..."
                        onChange={e => {
                          const val = e.target.value;
                          updatePaper(prev => ({
                            ...prev,
                            questions: prev.questions.map(item => item.id === q.id ? { ...item, text: val } : item)
                          }));
                        }}
                        rows={2}
                      />
                    </div>

                    {/* Optional Main Code Snippet */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Code size={13} />
                          <span>Code Snippet / Algorithm (Optional)</span>
                        </label>
                      </div>
                      <textarea
                        className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                        value={q.codeSnippet || ''}
                        placeholder="// Enter pseudocode, Python, Java, or C snippet here..."
                        onChange={e => {
                          const val = e.target.value;
                          updatePaper(prev => ({
                            ...prev,
                            questions: prev.questions.map(item => item.id === q.id ? { ...item, codeSnippet: val } : item)
                          }));
                        }}
                        rows={2}
                      />
                    </div>

                    {/* Subparts Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Sub-Questions & Marks Breakdown
                        </h4>
                        <button 
                          type="button"
                          onClick={() => handleAddSubpart(q.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg transition"
                        >
                          <Plus size={13} /> Add Sub-part
                        </button>
                      </div>

                      {q.subparts.map((sub, sIdx) => (
                        <div 
                          key={sub.id || sIdx} 
                          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-2 group/sub"
                        >
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
                            {/* Subpart Label */}
                            <div className="w-14 shrink-0">
                              <input 
                                type="text"
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-500 shadow-sm"
                                value={sub.label}
                                onChange={e => handleUpdateSubpart(q.id, sIdx, 'label', e.target.value)}
                              />
                            </div>

                            {/* Subpart Text */}
                            <div className="flex-1">
                              <textarea 
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-blue-500 resize-none shadow-sm leading-relaxed"
                                value={sub.text}
                                placeholder="Enter sub-question text..."
                                onChange={e => handleUpdateSubpart(q.id, sIdx, 'text', e.target.value)}
                                rows={2}
                              />
                            </div>

                            {/* Subpart Marks */}
                            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
                              <div className="w-24">
                                <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-200 rounded-lg shadow-sm">
                                  <input 
                                    type="number"
                                    min="1"
                                    className="w-12 text-xs font-bold text-center outline-none"
                                    value={sub.marks}
                                    onChange={e => handleUpdateSubpart(q.id, sIdx, 'marks', parseInt(e.target.value) || 0)}
                                  />
                                  <span className="text-[10px] font-bold text-slate-400">mks</span>
                                </div>
                              </div>

                              <button 
                                type="button"
                                onClick={() => handleRemoveSubpart(q.id, sIdx)}
                                className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                title="Remove sub-part"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Subpart Code snippet (collapsible / toggle) */}
                          {sub.codeSnippet !== undefined && (
                            <input
                              type="text"
                              value={sub.codeSnippet || ''}
                              onChange={e => handleUpdateSubpart(q.id, sIdx, 'codeSnippet', e.target.value)}
                              placeholder="Optional sub-part code/formula..."
                              className="w-full px-3 py-1 bg-white font-mono text-[11px] text-slate-700 border border-slate-200 rounded-md outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      ))}

                      {/* Question Total Marks Footer */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-400 italic">
                          Standard AL target: {paperData.targetMarksPerQuestion || 17} marks
                        </span>
                        <div className={cn(
                          "px-3 py-1 rounded-xl text-xs font-bold border",
                          qTotalMarks === (paperData.targetMarksPerQuestion || 17)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        )}>
                          Question {q.id} Total: {qTotalMarks} Marks
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Add Question Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button 
                  type="button"
                  onClick={handleAddBlankQuestion}
                  className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 rounded-2xl text-slate-600 hover:text-blue-700 transition flex flex-col items-center justify-center gap-2 group shadow-sm"
                >
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-blue-700 transition">
                    <Plus size={22} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Add Blank Question ({paperData.questions.length + 1})
                  </span>
                  <span className="text-[11px] text-slate-400">Write question and sub-parts manually</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setActiveTargetQuestionIndex(null);
                    setIsQuestionSelectorOpen(true);
                  }}
                  className="p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 rounded-2xl text-slate-600 hover:text-indigo-700 transition flex flex-col items-center justify-center gap-2 group shadow-sm"
                >
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-indigo-700 transition">
                    <Search size={22} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Select from Question Bank
                  </span>
                  <span className="text-[11px] text-slate-400">Search past GCE questions & algorithms</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Sticky Summary & Validation Panel */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24 bg-white border-slate-200 shadow-sm rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Paper Summary</h2>
                <span className="text-xs font-semibold text-slate-500">Live Calculation</span>
              </div>

              {/* Stat rows */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Questions Count</span>
                  <span className={cn(
                    "font-bold",
                    paperData.questions.length === 8 ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {paperData.questions.length} / 8 Questions
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Total Sub-questions</span>
                  <span className="font-bold text-slate-900">
                    {validationResult.totalSubparts} sub-parts
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Calculated Marks</span>
                  <span className="font-black text-blue-700 text-sm">
                    {paperData.totalCalculatedMarks} Marks
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Duration</span>
                  <span className="font-bold text-slate-900">{paperData.timeAllowed}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Subject</span>
                  <span className="font-bold text-slate-900 truncate max-w-[160px]">{paperData.subject}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Paper Type & Year</span>
                  <span className="font-bold text-slate-900">{paperData.paperType} • {paperData.year}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Validation Status</span>
                  {validationResult.isValid ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={14} /> Ready for Export
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={14} /> {validationResult.errors.length} Issue{validationResult.errors.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>

              {/* Validation Checklist / Errors Panel */}
              {!validationResult.isValid ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-900">
                    <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                    <p className="font-bold text-xs uppercase tracking-wider">
                      Paper Cannot Be Generated Yet
                    </p>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Click any issue below to jump directly to the affected question:
                  </p>
                  <ul className="space-y-1.5 pt-1">
                    {validationResult.errors.map(err => (
                      <li key={err.id}>
                        <button
                          type="button"
                          onClick={() => err.questionId && scrollToQuestion(err.questionId)}
                          className="text-left text-xs text-rose-800 hover:text-rose-950 hover:underline flex items-start gap-1.5 w-full"
                        >
                          <span className="text-rose-500 font-bold">•</span>
                          <span className="leading-snug">{err.message}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <p className="font-bold text-xs">All Validation Checks Passed</p>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Paper conforms with Cameroon GCE rules. Ready for PDF and Microsoft Word (.docx) export.
                  </p>
                </div>
              )}

              {/* Quick Jump to Question */}
              <div className="pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Jump to Question
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {paperData.questions.map(q => {
                    const qMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => scrollToQuestion(q.id)}
                        className={cn(
                          "py-1.5 px-2 text-xs font-bold rounded-lg border transition",
                          qMarks === 17 
                            ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" 
                            : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                        )}
                      >
                        Q{q.id} ({qMarks})
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* FINAL ACTION BAR (Sticky at bottom as required)                          */}
        {/* ========================================================================= */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:p-4 lg:pl-76">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Left Summary Info */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={cn(
                "px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border",
                validationResult.isValid 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              )}>
                {validationResult.isValid ? 'PAPER READY' : 'PAPER DRAFT'}
              </span>
              <span className="font-bold text-slate-800">
                {paperData.questions.length} Questions
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-blue-700">
                Total Marks: {paperData.totalCalculatedMarks}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                {paperData.subject} • {paperData.paperType} ({paperData.year})
              </span>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="text-xs font-bold"
              >
                <Save size={14} className="mr-1.5" />
                Save Draft
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="text-xs font-bold"
              >
                <Eye size={14} className="mr-1.5" />
                Preview Paper
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveAsPaper('ready')}
                disabled={isSaving}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border-slate-300"
              >
                <CheckCircle size={14} className="mr-1.5 text-emerald-600" />
                Save as Paper
              </Button>

              {/* Primary PDF & Word Export Buttons */}
              <Button
                size="sm"
                onClick={handleGeneratePDF}
                className="text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                <Download size={14} className="mr-1.5" />
                Generate PDF
              </Button>

              <Button
                size="sm"
                onClick={handleExportWord}
                className="text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <FileText size={14} className="mr-1.5" />
                Export Word
              </Button>

            </div>

          </div>
        </div>

        {/* Paper Preview Modal */}
        <PaperPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          paper={paperData}
          onSave={handleSaveDraft}
          onGeneratePDF={handleGeneratePDF}
          onExportWord={handleExportWord}
          onOpenBrandingSettings={() => setIsBrandingModalOpen(true)}
          isSaving={isSaving}
        />

        {/* School Letterhead and Watermark Settings Modal */}
        <ExaminationLetterheadSettingsModal
          isOpen={isBrandingModalOpen}
          onClose={() => setIsBrandingModalOpen(false)}
          userId={currentUserId}
        />

        {/* Paper Library Modal */}
        <PaperLibraryModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onOpenPaper={(selected) => {
            setPaperData(selected);
            setLastSavedTime(selected.lastSavedAt || selected.updatedAt || null);
            setIsLibraryOpen(false);
            toast.success(`Loaded "${selected.title || selected.subject}" into editor`);
          }}
          onNewPaper={() => {
            setIsLibraryOpen(false);
            handleNewPaper();
          }}
          onPreviewPaper={(selected) => {
            setPaperData(selected);
            setIsLibraryOpen(false);
            setIsPreviewOpen(true);
          }}
          userId={currentUserId}
          userProfile={{ name: user?.name, email: user?.email }}
        />

        {/* Generation Progress Modal */}
        <PaperGenerationProgressModal
          isOpen={isProgressOpen}
          onClose={() => setIsProgressOpen(false)}
          currentStage={progressStage}
          exportType={exportType}
          errorMessage={progressError}
          filename={lastExportedFilename}
          onDownloadPDF={handleGeneratePDF}
          onDownloadWord={handleExportWord}
          onPreview={() => {
            setIsProgressOpen(false);
            setIsPreviewOpen(true);
          }}
        />

        {/* Question Selector Dialog from Bank */}
        <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Select from Question Bank
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search questions by text or topic..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {bankQuestions
                  .filter(q => 
                    (q.questionText || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (q.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(q => (
                    <button 
                      key={q.id}
                      type="button"
                      onClick={() => handleAddBankQuestion(q)}
                      className="p-4 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-500 hover:shadow-sm transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{q.topic || 'General'}</Badge>
                        <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition" size={18} />
                      </div>
                      <div className="text-xs text-slate-700 line-clamp-3">
                        <ReactMarkdown>
                          {q.questionText}
                        </ReactMarkdown>
                      </div>
                    </button>
                  ))}

                {bankQuestions.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No questions found in bank matching filter. You can add custom questions directly.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQuestionSelectorOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
