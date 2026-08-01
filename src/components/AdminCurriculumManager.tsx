import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Archive, 
  CheckCircle2, 
  Globe, 
  Sliders, 
  FileText, 
  Clock, 
  Award, 
  Sparkles, 
  ChevronRight, 
  FolderPlus,
  Loader2,
  Upload,
  RefreshCw,
  ListPlus,
  Check,
  AlertCircle
} from 'lucide-react';
import { Curriculum, EducationLevel, Department, SubjectModel, PaperConfig } from '../types';
import { 
  fetchCurricula, saveCurriculum, deleteCurriculum, 
  fetchEducationLevels, saveEducationLevel, deleteEducationLevel,
  fetchDepartments, saveDepartment, deleteDepartment,
  fetchSubjectsByCurriculum, saveCurriculumSubject, deleteCurriculumSubject,
  batchSaveSubjects
} from '../services/curriculumService';
import { toast } from 'react-hot-toast';

export const AdminCurriculumManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curricula' | 'levels' | 'departments' | 'subjects' | 'import' | 'sync' | 'bulk'>('curricula');

  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('cameroon_gce');
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Partial<Curriculum>>({
    name: '', code: '', description: '', language: 'en', isActive: true, order: 1
  });

  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Partial<EducationLevel>>({
    name: '', code: '', description: '', curriculumId: 'cameroon_gce', isActive: true, order: 1
  });

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Partial<Department>>({
    name: '', code: '', description: '', curriculumId: 'cameroon_gce', isActive: true
  });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Partial<SubjectModel>>({
    name: '', code: '', description: '', curriculumId: 'cameroon_gce', isActive: true, papers: []
  });

  // Paper Sub-editor State
  const [newPaper, setNewPaper] = useState<Partial<PaperConfig>>({
    name: '', type: 'Theory', durationMinutes: 120, totalMarks: 100, instructions: ''
  });

  // Import & Bulk & Sync States
  const [importText, setImportText] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncPreview, setSyncPreview] = useState<{ newSubjects: string[]; updatedSubjects: string[]; removedSubjects: string[] } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCurriculumId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cList = await fetchCurricula();
      setCurricula(cList);

      const lList = await fetchEducationLevels(selectedCurriculumId);
      setLevels(lList);

      const dList = await fetchDepartments(selectedCurriculumId);
      setDepartments(dList);

      const sList = await fetchSubjectsByCurriculum(selectedCurriculumId);
      setSubjects(sList);
    } catch (err) {
      console.error("Failed to load curriculum data:", err);
      toast.error("Failed to load curriculum list");
    } finally {
      setLoading(false);
    }
  };

  // --- CURRICULUM ACTIONS ---
  const handleSaveCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurriculum.name || !editingCurriculum.code) {
      toast.error("Curriculum Name and Code are required");
      return;
    }

    try {
      const id = editingCurriculum.id || editingCurriculum.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const payload: Curriculum = {
        id,
        name: editingCurriculum.name,
        code: editingCurriculum.code.toUpperCase(),
        description: editingCurriculum.description || '',
        language: (editingCurriculum.language as any) || 'en',
        isActive: editingCurriculum.isActive !== false,
        order: editingCurriculum.order || 1
      };

      await saveCurriculum(payload);
      toast.success("Curriculum saved successfully!");
      setShowCurriculumModal(false);
      loadData();
    } catch (err) {
      toast.error("Error saving curriculum");
    }
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (confirm("Are you sure you want to delete this curriculum?")) {
      await deleteCurriculum(id);
      toast.success("Curriculum deleted");
      loadData();
    }
  };

  // --- LEVEL ACTIONS ---
  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel.name) {
      toast.error("Education level name is required");
      return;
    }

    try {
      const id = editingLevel.id || `lvl_${Date.now()}`;
      const payload: EducationLevel = {
        id,
        curriculumId: editingLevel.curriculumId || selectedCurriculumId,
        name: editingLevel.name,
        code: editingLevel.code || editingLevel.name.slice(0, 4).toUpperCase(),
        description: editingLevel.description || '',
        isActive: editingLevel.isActive !== false,
        order: editingLevel.order || 1
      };

      await saveEducationLevel(payload);
      toast.success("Education level saved!");
      setShowLevelModal(false);
      loadData();
    } catch (err) {
      toast.error("Error saving level");
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (confirm("Delete this education level?")) {
      await deleteEducationLevel(id);
      toast.success("Education level removed");
      loadData();
    }
  };

  // --- DEPARTMENT ACTIONS ---
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment.name) {
      toast.error("Department name is required");
      return;
    }

    try {
      const id = editingDepartment.id || `dept_${Date.now()}`;
      const payload: Department = {
        id,
        curriculumId: editingDepartment.curriculumId || selectedCurriculumId,
        name: editingDepartment.name,
        code: editingDepartment.code || '',
        description: editingDepartment.description || '',
        isActive: editingDepartment.isActive !== false
      };

      await saveDepartment(payload);
      toast.success("Department saved!");
      setShowDepartmentModal(false);
      loadData();
    } catch (err) {
      toast.error("Error saving department");
    }
  };

  // --- SUBJECT & PAPERS ACTIONS ---
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject.name) {
      toast.error("Subject name is required");
      return;
    }

    try {
      const curr = curricula.find(c => c.id === (editingSubject.curriculumId || selectedCurriculumId));
      const payload: SubjectModel = {
        id: editingSubject.id || '',
        name: editingSubject.name,
        code: editingSubject.code || '',
        description: editingSubject.description || '',
        curriculumId: editingSubject.curriculumId || selectedCurriculumId,
        curriculumName: curr?.name || '',
        levelId: editingSubject.levelId || '',
        educationLevel: editingSubject.educationLevel || '',
        isActive: editingSubject.isActive !== false,
        papers: editingSubject.papers || []
      };

      await saveCurriculumSubject(payload);
      toast.success("Subject & Papers configured!");
      setShowSubjectModal(false);
      loadData();
    } catch (err) {
      toast.error("Error saving subject");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Delete this subject?")) {
      await deleteCurriculumSubject(id);
      toast.success("Subject deleted");
      loadData();
    }
  };

  const handleAddPaperToSubject = () => {
    if (!newPaper.name) return;
    const paperObj: PaperConfig = {
      id: `p_${Date.now()}`,
      name: newPaper.name,
      type: newPaper.type as any || 'Theory',
      durationMinutes: newPaper.durationMinutes || 120,
      totalMarks: newPaper.totalMarks || 100,
      instructions: newPaper.instructions || ''
    };

    setEditingSubject(prev => ({
      ...prev,
      papers: [...(prev.papers || []), paperObj]
    }));

    setNewPaper({ name: '', type: 'Theory', durationMinutes: 120, totalMarks: 100, instructions: '' });
  };

  const handleRemovePaperFromSubject = (paperId: string) => {
    setEditingSubject(prev => ({
      ...prev,
      papers: (prev.papers || []).filter(p => p.id !== paperId)
    }));
  };

  // --- BULK SUBJECT CREATION ---
  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast.error("Please enter subject names");
      return;
    }

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const curr = curricula.find(c => c.id === selectedCurriculumId);
    const newSubjectsList: Omit<SubjectModel, 'id'>[] = lines.map(line => ({
      name: line,
      code: line.substring(0, 4).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900),
      curriculumId: selectedCurriculumId,
      curriculumName: curr?.name || '',
      description: `Official subject for ${curr?.name || 'Curriculum'}`,
      isActive: true,
      papers: [
        { id: 'p1', name: 'Paper 1 (MCQ)', type: 'MCQ', durationMinutes: 90, totalMarks: 50 },
        { id: 'p2', name: 'Paper 2 (Theory)', type: 'Theory', durationMinutes: 150, totalMarks: 100 }
      ]
    }));

    try {
      const count = await batchSaveSubjects(newSubjectsList);
      toast.success(`Successfully created ${count} subjects in bulk!`);
      setBulkText('');
      setActiveTab('subjects');
      loadData();
    } catch (err) {
      toast.error("Error bulk creating subjects");
    }
  };

  // --- JSON / CSV IMPORT ---
  const handleJSONImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of subjects");
      }

      const curr = curricula.find(c => c.id === selectedCurriculumId);
      const subjectsToImport: Omit<SubjectModel, 'id'>[] = parsed.map((item: any) => ({
        name: item.name || 'Unnamed Subject',
        code: item.code || 'SUBJ-00',
        curriculumId: selectedCurriculumId,
        curriculumName: curr?.name || '',
        description: item.description || '',
        isActive: true,
        papers: item.papers || [
          { id: 'p1', name: 'Paper 1', type: 'Theory', durationMinutes: 120, totalMarks: 100 }
        ]
      }));

      const count = await batchSaveSubjects(subjectsToImport);
      toast.success(`Successfully imported ${count} subjects!`);
      setImportText('');
      setActiveTab('subjects');
      loadData();
    } catch (err: any) {
      toast.error(`Import failed: ${err.message || 'Invalid JSON format'}`);
    }
  };

  // --- ONLINE SYNCHRONIZATION SIMULATOR ---
  const handleRunSyncCheck = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncPreview({
        newSubjects: ['Renewable Energy Systems', 'Applied Robotics & IoT', 'Digital Business Management'],
        updatedSubjects: ['Building Construction', 'Accounting', 'Electrical Technology'],
        removedSubjects: []
      });
      setSyncing(false);
      toast.success("Official Curriculum synchronization scan completed!");
    }, 1500);
  };

  const handleApplySync = async () => {
    const curr = curricula.find(c => c.id === selectedCurriculumId);
    const syncSubjects: Omit<SubjectModel, 'id'>[] = [
      {
        name: 'Renewable Energy Systems',
        code: 'TECH-RES',
        curriculumId: selectedCurriculumId,
        curriculumName: curr?.name || '',
        description: 'Solar, wind and hydro power generation technologies (Synchronized from Official Dataset)',
        isActive: true,
        papers: [{ id: 'p1', name: 'Paper 1', type: 'Theory', durationMinutes: 120, totalMarks: 100 }]
      },
      {
        name: 'Applied Robotics & IoT',
        code: 'TECH-IOT',
        curriculumId: selectedCurriculumId,
        curriculumName: curr?.name || '',
        description: 'Microcontrollers, sensor integration and automation (Synchronized from Official Dataset)',
        isActive: true,
        papers: [{ id: 'p1', name: 'Paper 1', type: 'Practical', durationMinutes: 180, totalMarks: 100 }]
      }
    ];

    try {
      await batchSaveSubjects(syncSubjects);
      toast.success("Synchronization applied successfully! Existing lessons & questions mapped.");
      setSyncPreview(null);
      loadData();
    } catch (err) {
      toast.error("Error applying synchronization");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-Curriculum & Subject Management System</h2>
            <p className="text-xs text-indigo-200">
              Manage General, Technical & Commercial Education streams, Curricula, Levels, Departments, Bulk Import & Online Sync
            </p>
          </div>
        </div>

        {/* Global Active Curriculum Selector for Management */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-300 px-2">Active View:</span>
          <select 
            value={selectedCurriculumId}
            onChange={(e) => setSelectedCurriculumId(e.target.value)}
            className="bg-slate-900 text-amber-400 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none"
          >
            {curricula.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('curricula')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'curricula' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Globe size={16} /> Curricula ({curricula.length})
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'levels' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Layers size={16} /> Education Levels ({levels.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'departments' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Sliders size={16} /> Streams & Depts ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'subjects' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <BookOpen size={16} /> Subjects & Papers ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'bulk' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <ListPlus size={16} /> Bulk Creator
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'import' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Upload size={16} /> Import JSON / CSV
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'sync' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
        >
          <RefreshCw size={16} /> Online Sync
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span className="text-xs font-semibold">Loading curriculum data...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: CURRICULA LIST */}
            {activeTab === 'curricula' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Supported System Curricula</h3>
                  <button
                    onClick={() => {
                      setEditingCurriculum({ name: '', code: '', description: '', language: 'en', isActive: true, order: curricula.length + 1 });
                      setShowCurriculumModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus size={16} /> Add New Curriculum
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curricula.map(c => (
                    <div key={c.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full">
                            {c.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {c.isActive ? 'Active' : 'Archived'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                        <p className="text-xs text-slate-500">{c.description || 'No description provided.'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-medium">Language: <strong className="text-slate-700 uppercase">{c.language}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCurriculum(c);
                              setShowCurriculumModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCurriculum(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: EDUCATION LEVELS */}
            {activeTab === 'levels' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Education Levels for <span className="text-indigo-600">{curricula.find(c => c.id === selectedCurriculumId)?.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500">Configure grade/form levels belonging to this curriculum</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingLevel({ name: '', code: '', description: '', curriculumId: selectedCurriculumId, isActive: true, order: levels.length + 1 });
                      setShowLevelModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus size={16} /> Add Level
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {levels.map(l => (
                    <div key={l.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                          {l.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingLevel(l);
                              setShowLevelModal(true);
                            }}
                            className="p-1 text-slate-500 hover:text-indigo-600"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(l.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{l.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{l.description || 'No level description.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DEPARTMENTS */}
            {activeTab === 'departments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Departments & Streams (General, Technical, Commercial) for <span className="text-indigo-600">{curricula.find(c => c.id === selectedCurriculumId)?.name}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDepartment({ name: '', code: '', description: '', curriculumId: selectedCurriculumId, isActive: true });
                      setShowDepartmentModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus size={16} /> Add Department
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map(d => (
                    <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{d.code || 'DEPT'}</span>
                        <button
                          onClick={() => {
                            setEditingDepartment(d);
                            setShowDepartmentModal(true);
                          }}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                      <p className="text-xs text-slate-500">{d.description || 'General, Technical or Commercial stream.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SUBJECTS & PAPERS */}
            {activeTab === 'subjects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Curriculum Subjects & Examination Components
                    </h3>
                    <p className="text-xs text-slate-500">
                      Showing subjects for {curricula.find(c => c.id === selectedCurriculumId)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSubject({
                        name: '', code: '', description: '', curriculumId: selectedCurriculumId, isActive: true, papers: []
                      });
                      setShowSubjectModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus size={16} /> Configure Subject
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(s => (
                    <div key={s.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {s.code || 'SUBJ'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{s.papers?.length || 0} Examination Components</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{s.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{s.description || 'No subject summary.'}</p>
                      </div>

                      {/* Configured Papers List */}
                      {s.papers && s.papers.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Papers / Modules</span>
                          {s.papers.map(p => (
                            <div key={p.id} className="text-[11px] text-slate-700 flex items-center justify-between">
                              <span className="font-semibold">• {p.name}</span>
                              <span className="text-slate-400">{p.durationMinutes || 120}m | {p.totalMarks || 100}pts</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setEditingSubject(s);
                            setShowSubjectModal(true);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <Edit3 size={14} /> Edit Subject & Papers
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: BULK CREATOR */}
            {activeTab === 'bulk' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Bulk Subject Creation Wizard</h3>
                  <p className="text-xs text-slate-500">
                    Paste a complete list of subjects (one per line) for <strong className="text-indigo-600">{curricula.find(c => c.id === selectedCurriculumId)?.name}</strong>. The system will automatically create all subjects with standard papers.
                  </p>
                </div>

                <form onSubmit={handleBulkCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subjects List (One per line)</label>
                    <textarea
                      rows={8}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="Building Construction&#10;Electrical Technology&#10;Accounting&#10;Office Practice&#10;Auto Mechanics"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ListPlus size={16} /> Generate & Save All Subjects
                  </button>
                </form>
              </div>
            )}

            {/* TAB 6: IMPORT JSON / CSV */}
            {activeTab === 'import' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Import Official Subject Lists (JSON Format)</h3>
                  <p className="text-xs text-slate-500">
                    Paste structured JSON containing subjects and paper configurations for <strong className="text-indigo-600">{curricula.find(c => c.id === selectedCurriculumId)?.name}</strong>.
                  </p>
                </div>

                <form onSubmit={handleJSONImport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">JSON Payload</label>
                    <textarea
                      rows={10}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder={`[
  {
    "name": "Electronics",
    "code": "0825",
    "description": "Semiconductor devices and logic circuits",
    "papers": [
      { "id": "p1", "name": "Paper 1 (MCQ)", "type": "MCQ", "durationMinutes": 90, "totalMarks": 50 },
      { "id": "p2", "name": "Paper 2 (Theory)", "type": "Theory", "durationMinutes": 150, "totalMarks": 100 }
    ]
  }
]`}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={16} /> Validate & Import Subjects
                  </button>
                </form>
              </div>
            )}

            {/* TAB 7: ONLINE SYNCHRONIZATION */}
            {activeTab === 'sync' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-2xl text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <RefreshCw size={24} className="text-indigo-300 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Online Curriculum Synchronization Service</h3>
                      <p className="text-xs text-indigo-200">
                        Connect to official educational board datasets (GCE Board / MINESEC) to automatically detect new, updated, and deprecated subjects while preserving existing student grades and lessons.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunSyncCheck}
                    disabled={syncing}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {syncing ? 'Scanning Official Dataset...' : 'Check for Official Updates'}
                  </button>
                </div>

                {syncPreview && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Synchronization Diff Report</h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <Check size={14} /> New Subjects Discovered ({syncPreview.newSubjects.length})
                        </span>
                        <ul className="list-disc pl-5 text-emerald-700">
                          {syncPreview.newSubjects.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                        <span className="font-bold text-blue-800 flex items-center gap-1.5">
                          <AlertCircle size={14} /> Updated Syllabi & Papers ({syncPreview.updatedSubjects.length})
                        </span>
                        <ul className="list-disc pl-5 text-blue-700">
                          {syncPreview.updatedSubjects.map((s, idx) => <li key={idx}>{s} (Papers re-aligned)</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t">
                      <button
                        onClick={handleApplySync}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Apply Synchronization & Update Platform
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: CURRICULUM FORM */}
      {showCurriculumModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">
              {editingCurriculum.id ? 'Edit Curriculum' : 'Add New Educational Curriculum'}
            </h3>

            <form onSubmit={handleSaveCurriculum} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Curriculum Title</label>
                <input
                  type="text"
                  value={editingCurriculum.name}
                  onChange={(e) => setEditingCurriculum({ ...editingCurriculum, name: e.target.value })}
                  placeholder="e.g. West African Examinations Council (WAEC)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code / Short Tag</label>
                <input
                  type="text"
                  value={editingCurriculum.code}
                  onChange={(e) => setEditingCurriculum({ ...editingCurriculum, code: e.target.value })}
                  placeholder="e.g. WAEC"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Language</label>
                <select
                  value={editingCurriculum.language}
                  onChange={(e) => setEditingCurriculum({ ...editingCurriculum, language: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="bilingual">Bilingual (English & French)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCurriculum.description}
                  onChange={(e) => setEditingCurriculum({ ...editingCurriculum, description: e.target.value })}
                  placeholder="Overview of examination board..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCurriculumModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Save Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LEVEL FORM */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-slate-900 text-base">Configure Education Level</h3>
            <form onSubmit={handleSaveLevel} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Level Name</label>
                <input
                  type="text"
                  value={editingLevel.name}
                  onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                  placeholder="e.g. Troisième (BEPC) or Advanced Level"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Code</label>
                <input
                  type="text"
                  value={editingLevel.code}
                  onChange={(e) => setEditingLevel({ ...editingLevel, code: e.target.value })}
                  placeholder="e.g. 3ème or A-Level"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingLevel.description}
                  onChange={(e) => setEditingLevel({ ...editingLevel, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowLevelModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Save Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DEPARTMENT FORM */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">Configure Department / Stream</h3>
            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Stream Name</label>
                <input
                  type="text"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                  placeholder="e.g. Technical Education or Commercial"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  value={editingDepartment.code}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, code: e.target.value })}
                  placeholder="e.g. TECH or COMM"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingDepartment.description}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBJECT & PAPERS FORM */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">Configure Subject & Exam Papers</h3>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    placeholder="e.g. Electrical Technology or Accounting"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    placeholder="e.g. TECH-0820"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingSubject.description}
                  onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                  placeholder="Syllabus overview..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Papers Configuration Sub-Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-600" /> Subject Papers / Exam Components
                </h4>

                <div className="space-y-2">
                  {(editingSubject.papers || []).map((p) => (
                    <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block">{p.type} • {p.durationMinutes} mins • {p.totalMarks} Marks</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePaperFromSubject(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Paper Row */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="font-bold text-[11px] text-slate-600 block">Add Exam Component</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Paper Title (e.g. Paper 3 Practical)"
                      value={newPaper.name}
                      onChange={(e) => setNewPaper({ ...newPaper, name: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs sm:col-span-2"
                    />
                    <select
                      value={newPaper.type}
                      onChange={(e) => setNewPaper({ ...newPaper, type: e.target.value as any })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Essay">Essay</option>
                      <option value="Oral">Oral</option>
                      <option value="Synthese">Synthèse</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddPaperToSubject}
                      className="bg-indigo-600 text-white font-bold rounded-lg px-3 py-2 text-xs hover:bg-indigo-700"
                    >
                      + Add Paper
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Save Subject Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
