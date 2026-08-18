import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, addDoc, serverTimestamp, doc, setDoc, getDocs, query, where 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { SubjectModel, PaperConfig, QuestionPaper, Subject, PaperType } from '../../types';
import { DEFAULT_GCE_SUBJECTS, getPapersForSubjectName } from '../../data/defaultSubjects';
import { Button, Card, Badge, cn } from '../ui';
import FileUpload from '../FileUpload';
import { 
  X, Upload, FileText, CheckCircle2, AlertCircle, 
  Sparkles, Calendar, BookOpen, Layers, Check, HelpCircle,
  Hash, Clock, Award, ShieldCheck, ChevronDown, ListChecks,
  Eye, RefreshCw, FileCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface DynamicQuestionPaperUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperSaved?: (paper: QuestionPaper) => void;
  initialSubjects?: SubjectModel[];
}

const COMMON_SESSIONS = [
  'June Examination',
  'May/June Main Session',
  'November/December Session',
  'National Mock Examination',
  'Regional Mock Examination',
  'First Term Examination',
  'Second Term Examination',
  'Mock Exam (Bilingual)',
  'Special Session'
];

export default function DynamicQuestionPaperUploadModal({
  isOpen,
  onClose,
  onPaperSaved,
  initialSubjects = []
}: DynamicQuestionPaperUploadModalProps) {
  const { user, isAdmin } = useAuth();

  // Dynamic Subjects state
  const [subjectsList, setSubjectsList] = useState<SubjectModel[]>(initialSubjects);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);

  // Filter / Category
  const [selectedCurriculumFilter, setSelectedCurriculumFilter] = useState<string>('all');
  const [subjectSearch, setSubjectSearch] = useState<string>('');

  // Selected State
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('');
  const [selectedPaperType, setSelectedPaperType] = useState<string>('');
  const [isCustomPaperType, setIsCustomPaperType] = useState<boolean>(false);
  const [customPaperTypeName, setCustomPaperTypeName] = useState<string>('');

  // Form State
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [session, setSession] = useState<string>('June Examination');
  const [title, setTitle] = useState<string>('');
  const [isAutoTitle, setIsAutoTitle] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [instructions, setInstructions] = useState<string>('');

  // Answer Keys & MCQ
  const [requiresAnswerKey, setRequiresAnswerKey] = useState<boolean>(false);
  const [answerKeyMode, setAnswerKeyMode] = useState<'grid' | 'raw'>('grid');
  const [numQuestions, setNumQuestions] = useState<number>(50);
  const [answersGrid, setAnswersGrid] = useState<Record<string, string>>({});
  const [rawAnswersInput, setRawAnswersInput] = useState<string>('');

  // File Uploads
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<string>('');
  const [markingSchemeUrl, setMarkingSchemeUrl] = useState<string>('');
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState<boolean>(false);

  // Submitting
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fetch subjects if not passed or empty
  useEffect(() => {
    if (initialSubjects && initialSubjects.length > 0) {
      setSubjectsList(initialSubjects);
      if (!selectedSubjectName) {
        setSelectedSubjectName(initialSubjects[0].name);
      }
      return;
    }

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const q = query(collection(db, 'subjects'), where('isActive', '==', true));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SubjectModel[];
          setSubjectsList(loaded);
          if (loaded.length > 0) {
            setSelectedSubjectName(loaded[0].name);
          }
        } else {
          // Fallback to DEFAULT_GCE_SUBJECTS
          const defaultModels: SubjectModel[] = DEFAULT_GCE_SUBJECTS.map((s, idx) => ({
            id: `default-${idx}`,
            ...s
          }));
          setSubjectsList(defaultModels);
          if (defaultModels.length > 0) {
            setSelectedSubjectName(defaultModels[0].name);
          }
        }
      } catch (err) {
        console.warn('Error loading subjects from Firestore, using default catalogue:', err);
        const defaultModels: SubjectModel[] = DEFAULT_GCE_SUBJECTS.map((s, idx) => ({
          id: `default-${idx}`,
          ...s
        }));
        setSubjectsList(defaultModels);
        if (defaultModels.length > 0) {
          setSelectedSubjectName(defaultModels[0].name);
        }
      } finally {
        setLoadingSubjects(false);
      }
    };

    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen, initialSubjects]);

  // Current Subject Object
  const currentSubjectObj = useMemo(() => {
    return subjectsList.find(s => s.name.toLowerCase().trim() === selectedSubjectName.toLowerCase().trim()) || null;
  }, [subjectsList, selectedSubjectName]);

  // Dynamic available paper types for currently selected subject
  const availablePapers: PaperConfig[] = useMemo(() => {
    if (!selectedSubjectName) return [];
    return getPapersForSubjectName(selectedSubjectName, currentSubjectObj?.level, subjectsList);
  }, [selectedSubjectName, currentSubjectObj, subjectsList]);

  // Auto-select first paper type whenever subject changes
  useEffect(() => {
    if (availablePapers.length > 0) {
      const firstPaper = availablePapers[0];
      setSelectedPaperType(firstPaper.name);
      setIsCustomPaperType(false);
      
      // Auto-set duration and marks if provided in config
      if (firstPaper.durationMinutes) setDurationMinutes(firstPaper.durationMinutes);
      if (firstPaper.totalMarks) setTotalMarks(firstPaper.totalMarks);

      // Auto-determine MCQ / Answer key requirement
      const isMcq = firstPaper.type === 'MCQ' || firstPaper.name.toLowerCase().includes('paper 1') || firstPaper.name.toLowerCase().includes('mcq');
      setRequiresAnswerKey(isMcq);
      if (isMcq && firstPaper.totalMarks) {
        setNumQuestions(firstPaper.totalMarks <= 100 ? firstPaper.totalMarks : 50);
      }
    } else {
      setSelectedPaperType('Paper 1');
      setIsCustomPaperType(false);
    }
  }, [selectedSubjectName, availablePapers]);

  // Handle Paper Type Change
  const handlePaperTypeChange = (pName: string) => {
    if (pName === '__CUSTOM__') {
      setIsCustomPaperType(true);
      setSelectedPaperType(customPaperTypeName || 'Custom Paper');
      return;
    }

    setIsCustomPaperType(false);
    setSelectedPaperType(pName);

    const match = availablePapers.find(p => p.name === pName);
    if (match) {
      if (match.durationMinutes) setDurationMinutes(match.durationMinutes);
      if (match.totalMarks) setTotalMarks(match.totalMarks);
      const isMcq = match.type === 'MCQ' || match.name.toLowerCase().includes('paper 1') || match.name.toLowerCase().includes('mcq');
      setRequiresAnswerKey(isMcq);
    } else {
      const isMcq = pName.toLowerCase().includes('paper 1') || pName.toLowerCase().includes('mcq');
      setRequiresAnswerKey(isMcq);
    }
  };

  // Generate Year options dynamically: From (currentYear + 2) down to 1995
  const dynamicYears = useMemo(() => {
    const years: number[] = [];
    const maxYear = currentYear + 2; // e.g. 2028
    const minYear = 1995;
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Auto-generate Title whenever subject, paperType, year, or session changes
  useEffect(() => {
    if (!isAutoTitle) return;

    const paperLabel = isCustomPaperType ? (customPaperTypeName || 'Exam Paper') : selectedPaperType;
    const levelLabel = currentSubjectObj?.level ? `(${currentSubjectObj.level})` : '';
    const codeLabel = currentSubjectObj?.code ? `[${currentSubjectObj.code}]` : '';
    
    // Clean formatted title
    const generated = `${year} ${selectedSubjectName} ${levelLabel} - ${paperLabel} (${session})`.replace(/\s+/g, ' ').trim();
    setTitle(generated);
  }, [selectedSubjectName, selectedPaperType, isCustomPaperType, customPaperTypeName, year, session, currentSubjectObj, isAutoTitle]);

  // Parse raw answer string into grid (e.g. "1:A, 2:B, 3:C" or "A B C D...")
  const handleRawAnswersChange = (raw: string) => {
    setRawAnswersInput(raw);
    const newGrid: Record<string, string> = {};

    if (raw.includes(':') || raw.includes('=')) {
      // Key:Value format (e.g. 1:A, 2:B, 3:C)
      const parts = raw.split(/[,;\n]/);
      parts.forEach(p => {
        const [k, v] = p.split(/[:=]/);
        if (k && v) {
          const qNum = k.trim();
          const ans = v.trim().toUpperCase();
          if (qNum && ['A', 'B', 'C', 'D', 'E', 'TRUE', 'FALSE'].includes(ans)) {
            newGrid[qNum] = ans;
          }
        }
      });
    } else {
      // Space or comma separated (e.g. "A B C D A B C")
      const tokens = raw.replace(/[^A-Za-z]/g, ' ').trim().split(/\s+/);
      tokens.forEach((t, i) => {
        const ans = t.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(ans)) {
          newGrid[(i + 1).toString()] = ans;
        }
      });
    }

    setAnswersGrid(newGrid);
  };

  // Sync grid to raw string representation
  const syncGridToRaw = (grid: Record<string, string>) => {
    const sortedKeys = Object.keys(grid).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const formatted = sortedKeys.map(k => `${k}:${grid[k.toString()]}`).join(', ');
    setRawAnswersInput(formatted);
  };

  // Set single question answer in grid
  const setQuestionAnswer = (qNum: number, answer: string) => {
    const updated = { ...answersGrid, [qNum.toString()]: answer };
    setAnswersGrid(updated);
    syncGridToRaw(updated);
  };

  // Clear all answers
  const handleClearAnswers = () => {
    setAnswersGrid({});
    setRawAnswersInput('');
  };

  // Filtered Subject List for dropdown
  const filteredSubjects = useMemo(() => {
    return subjectsList.filter(s => {
      const matchesSearch = !subjectSearch || 
        s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(subjectSearch.toLowerCase()));
      
      const matchesCurriculum = selectedCurriculumFilter === 'all' ||
        (selectedCurriculumFilter === 'olevel' && s.level?.toLowerCase().includes('ordinary')) ||
        (selectedCurriculumFilter === 'alevel' && s.level?.toLowerCase().includes('advance')) ||
        (selectedCurriculumFilter === 'commercial' && (s.category?.toLowerCase().includes('commercial') || s.level?.toLowerCase().includes('intermediate'))) ||
        (selectedCurriculumFilter === 'francophone' && (s.curriculumId === 'cameroon_francophone' || s.level?.toLowerCase().includes('bac') || s.level?.toLowerCase().includes('troisieme')));
      
      return matchesSearch && matchesCurriculum;
    });
  }, [subjectsList, subjectSearch, selectedCurriculumFilter]);

  // Form submission & persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to upload question papers.');
      toast.error('Authentication required.');
      return;
    }

    if (!isAdmin) {
      setErrorMsg('Administrator privileges required.');
      toast.error('Admin permissions required.');
      return;
    }

    if (!selectedSubjectName) {
      setErrorMsg('Please select a subject.');
      toast.error('Subject is required.');
      return;
    }

    const effectivePaperType = isCustomPaperType ? customPaperTypeName.trim() : selectedPaperType;
    if (!effectivePaperType) {
      setErrorMsg('Please specify a paper type.');
      toast.error('Paper type is required.');
      return;
    }

    if (!pdfUrl) {
      setErrorMsg('Please upload the question paper PDF file.');
      toast.error('PDF file is required.');
      return;
    }

    setSubmitting(true);

    try {
      // Build clean structured correctAnswers record
      const finalCorrectAnswers: Record<string, string> = {};
      if (requiresAnswerKey) {
        Object.entries(answersGrid).forEach(([k, v]) => {
          if (k && v) {
            finalCorrectAnswers[k] = v.toUpperCase();
          }
        });
      }

      const paperData: Omit<QuestionPaper, 'id'> = {
        title: title.trim() || `${year} ${selectedSubjectName} - ${effectivePaperType}`,
        year: Number(year),
        subject: selectedSubjectName,
        paperType: effectivePaperType,
        description: description.trim() || `${selectedSubjectName} past examination paper for ${year} (${session}).`,
        pdfUrl: pdfUrl,
        createdAt: new Date().toISOString(),
        uploadedBy: user.uid,
        curriculumId: currentSubjectObj?.curriculumId || 'cameroon_gce',
        curriculumName: currentSubjectObj?.curriculumName || (currentSubjectObj?.level === 'Advance level' ? 'GCE Advanced Level' : 'GCE Ordinary Level'),
        level: currentSubjectObj?.level || 'Ordinary level',
        session: session,
        totalMarks: Number(totalMarks) || 100,
        durationMinutes: Number(durationMinutes) || 120,
        instructions: instructions.trim(),
        paperCode: currentSubjectObj?.code || '',
        fileSize: pdfFileSize,
        fileName: pdfFileName,
        requiresAnswerKey: requiresAnswerKey,
        ...(requiresAnswerKey && Object.keys(finalCorrectAnswers).length > 0 ? { correctAnswers: finalCorrectAnswers } : {}),
        ...(includeMarkingScheme && markingSchemeUrl ? { markingSchemeUrl } : {})
      };

      // 1. Primary write to Firestore `questionPapers`
      const docRef = await addDoc(collection(db, 'questionPapers'), {
        ...paperData,
        serverTimestamp: serverTimestamp()
      });

      // 2. Synchronize to `question_papers` collection for legacy/subsystem interoperability
      try {
        await setDoc(doc(db, 'question_papers', docRef.id), {
          ...paperData,
          id: docRef.id,
          serverTimestamp: serverTimestamp()
        });
      } catch (syncErr) {
        console.warn('Sync to question_papers collection bypassed:', syncErr);
      }

      const createdPaper: QuestionPaper = {
        id: docRef.id,
        ...paperData
      };

      toast.success('Question paper successfully published to Edulpha repository!');
      if (onPaperSaved) {
        onPaperSaved(createdPaper);
      }

      // Reset modal state
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Failed to publish question paper:', err);
      const msg = err.message || 'An error occurred while saving paper.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setIsAutoTitle(true);
    setPdfUrl('');
    setPdfFileName('');
    setPdfFileSize('');
    setMarkingSchemeUrl('');
    setIncludeMarkingScheme(false);
    setAnswersGrid({});
    setRawAnswersInput('');
    setDescription('');
    setInstructions('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !submitting && onClose()}
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] z-10"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Upload Question Paper</h2>
                <Badge variant="primary" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 text-[10px] uppercase tracking-wider">
                  Dynamic Engine
                </Badge>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Data-driven examination publisher with automated curriculum mapping.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-shake">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="dynamic-paper-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Academic & Subject Hierarchy */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
                  <h3 className="text-sm font-black uppercase tracking-wider">Subject & Curriculum Mapping</h3>
                </div>
                {currentSubjectObj && (
                  <Badge variant="default" className="text-[10px] bg-white border border-slate-200">
                    {currentSubjectObj.level || 'Ordinary level'} • {currentSubjectObj.category || 'General'}
                  </Badge>
                )}
              </div>

              {/* Curriculum Quick Filter */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: 'all', label: 'All Curricula' },
                  { id: 'olevel', label: 'GCE O-Level' },
                  { id: 'alevel', label: 'GCE A-Level' },
                  { id: 'commercial', label: 'Commercial / TVEE' },
                  { id: 'francophone', label: 'Francophone (Bac/BEPC)' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCurriculumFilter(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      selectedCurriculumFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subject Selector & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Subject Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubjectName}
                      onChange={e => setSelectedSubjectName(e.target.value)}
                      disabled={loadingSubjects || submitting}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {filteredSubjects.map(s => (
                        <option key={s.id || s.name} value={s.name}>
                          {s.name} {s.code ? `(${s.code})` : ''} - {s.level || 'Standard'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Filter by Subject / Code
                  </label>
                  <input
                    type="text"
                    placeholder="Search subject..."
                    value={subjectSearch}
                    onChange={e => setSubjectSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Dynamic Paper Type & Examination Year */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                  <h3 className="text-sm font-black uppercase tracking-wider">Paper Type, Session & Year</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {availablePapers.length} paper formats detected for {selectedSubjectName}
                </span>
              </div>

              {/* Dynamic Paper Selection Buttons / Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Select Paper Format <span className="text-rose-500">*</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availablePapers.map((p) => {
                    const isSelected = !isCustomPaperType && selectedPaperType === p.name;
                    return (
                      <button
                        key={p.id || p.name}
                        type="button"
                        onClick={() => handlePaperTypeChange(p.name)}
                        className={cn(
                          "p-3 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[64px]",
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200"
                            : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-black truncate">{p.name}</span>
                          {isSelected && <Check size={14} className="shrink-0" />}
                        </div>
                        <span className={cn("text-[10px] font-medium truncate", isSelected ? "text-indigo-100" : "text-slate-400")}>
                          {p.type || 'Standard'} • {p.durationMinutes ? `${p.durationMinutes}m` : '120m'}
                        </span>
                      </button>
                    );
                  })}

                  {/* Custom Paper Button */}
                  <button
                    type="button"
                    onClick={() => handlePaperTypeChange('__CUSTOM__')}
                    className={cn(
                      "p-3 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[64px]",
                      isCustomPaperType
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200"
                        : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">+ Custom Paper</span>
                      {isCustomPaperType && <Check size={14} className="shrink-0" />}
                    </div>
                    <span className={cn("text-[10px] font-medium", isCustomPaperType ? "text-indigo-100" : "text-slate-400")}>
                      Custom Exam Format
                    </span>
                  </button>
                </div>

                {isCustomPaperType && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                  >
                    <input
                      type="text"
                      placeholder="Enter custom paper name (e.g. Paper 4 - Case Study & Oral)"
                      value={customPaperTypeName}
                      onChange={e => {
                        setCustomPaperTypeName(e.target.value);
                        setSelectedPaperType(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Year & Session Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                {/* Year Selection with dynamic generator */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Examination Year <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={e => setYear(parseInt(e.target.value))}
                      disabled={submitting}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none appearance-none cursor-pointer"
                    >
                      {dynamicYears.map(y => (
                        <option key={y} value={y}>
                          {y} {y === currentYear ? '(Current Year)' : ''}
                        </option>
                      ))}
                    </select>
                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Session Picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Examination Session
                  </label>
                  <div className="relative">
                    <select
                      value={session}
                      onChange={e => setSession(e.target.value)}
                      disabled={submitting}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none appearance-none cursor-pointer"
                    >
                      {COMMON_SESSIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Marks & Duration */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Total Marks / Duration
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Marks"
                      value={totalMarks}
                      onChange={e => setTotalMarks(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 text-center"
                      title="Total Marks"
                    />
                    <input
                      type="number"
                      placeholder="Mins"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 text-center"
                      title="Duration in Minutes"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Generated Title & Paper Details */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">3</span>
                  <h3 className="text-sm font-black uppercase tracking-wider">Title & Metadata</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoTitle(!isAutoTitle)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1"
                >
                  <RefreshCw size={10} />
                  {isAutoTitle ? 'Auto-Generate (Active)' : 'Custom Title Mode'}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Paper Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    setIsAutoTitle(false);
                  }}
                  placeholder="e.g. 2024 Computer Science (0595) - Paper 1 (MCQ)"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Candidate Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Answer all questions. Use 2B pencil for the optical answer sheet."
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Short Description / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Standard examination covering syllabus sections 1 to 5."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Conditional Answer Key (MCQ / Objective) */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">4</span>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">Answer Key & Solution Grid</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Enables automated grading and student self-assessment.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={requiresAnswerKey}
                      onChange={e => setRequiresAnswerKey(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Include Answer Key</span>
                  </label>
                </div>
              </div>

              {requiresAnswerKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2 border-t border-slate-200/60"
                >
                  {/* Mode & Helpers Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAnswerKeyMode('grid')}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
                          answerKeyMode === 'grid' ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                        )}
                      >
                        Interactive Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswerKeyMode('raw')}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
                          answerKeyMode === 'raw' ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                        )}
                      >
                        Text / Bulk String
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {Object.keys(answersGrid).length} Answers Set
                      </span>
                      {Object.keys(answersGrid).length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAnswers}
                          className="text-slate-400 hover:text-rose-600 text-[11px] font-bold underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid View */}
                  {answerKeyMode === 'grid' ? (
                    <div className="space-y-3">
                      <div className="max-h-60 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {Array.from({ length: numQuestions }, (_, i) => i + 1).map((qNum) => {
                          const currentVal = answersGrid[qNum.toString()] || '';
                          return (
                            <div key={qNum} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[11px] font-black text-slate-500 pl-1 w-6">{qNum}.</span>
                              <div className="flex items-center gap-1">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setQuestionAnswer(qNum, currentVal === opt ? '' : opt)}
                                    className={cn(
                                      "w-6 h-6 rounded text-[10px] font-black transition-all flex items-center justify-center",
                                      currentVal === opt
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Showing 1 to {numQuestions} questions</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNumQuestions(prev => Math.min(100, prev + 10))}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-[10px]"
                          >
                            +10 Questions
                          </button>
                          <button
                            type="button"
                            onClick={() => setNumQuestions(prev => Math.max(10, prev - 10))}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-[10px]"
                          >
                            -10 Questions
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Raw String Input */
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={rawAnswersInput}
                        onChange={e => handleRawAnswersChange(e.target.value)}
                        placeholder="e.g. 1:A, 2:B, 3:C, 4:D, 5:A... or paste: A B C D A B C"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 outline-none focus:border-indigo-600"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">
                        Supports key-value pairs (1:A, 2:B) or plain space/comma separated letters.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Step 5: Question Paper PDF & Marking Scheme Upload */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">5</span>
                  <h3 className="text-sm font-black uppercase tracking-wider">Document Upload</h3>
                </div>
              </div>

              {/* Main Question Paper Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Question Paper Document (PDF) <span className="text-rose-500">*</span>
                </label>
                <FileUpload
                  folder="question_papers"
                  accept="application/pdf,.pdf"
                  maxSizeMB={50}
                  initialUrl={pdfUrl}
                  label="Upload Question Paper PDF"
                  description="High-resolution examination question paper document"
                  onUploadComplete={(url, name, size) => {
                    setPdfUrl(url);
                    setPdfFileName(name);
                    setPdfFileSize(size);
                  }}
                  onDelete={() => {
                    setPdfUrl('');
                    setPdfFileName('');
                    setPdfFileSize('');
                  }}
                  adminOnly={true}
                />
              </div>

              {/* Optional Marking Scheme / Solution Upload */}
              <div className="pt-3 border-t border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeMarkingScheme}
                      onChange={e => setIncludeMarkingScheme(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Attach Official Marking Scheme / Solution PDF</span>
                  </label>
                </div>

                {includeMarkingScheme && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-1"
                  >
                    <FileUpload
                      folder="marking_schemes"
                      accept="application/pdf,.pdf"
                      maxSizeMB={50}
                      initialUrl={markingSchemeUrl}
                      label="Upload Marking Scheme (PDF)"
                      description="Official examiner marking guide and solution breakdown"
                      onUploadComplete={(url) => setMarkingSchemeUrl(url)}
                      onDelete={() => setMarkingSchemeUrl('')}
                      compact={true}
                      adminOnly={true}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Live Paper Preview Card */}
            {pdfUrl && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">{title}</span>
                      <Badge variant="success" className="text-[9px] py-0">Ready</Badge>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      {selectedSubjectName} • {isCustomPaperType ? customPaperTypeName : selectedPaperType} • {year} • {totalMarks} Marks • {durationMinutes} mins
                    </p>
                  </div>
                </div>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Eye size={14} /> Preview
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl px-5 py-2.5 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !pdfUrl || !selectedSubjectName}
                className="rounded-xl px-6 py-2.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Publishing Paper...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Publish Question Paper</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
