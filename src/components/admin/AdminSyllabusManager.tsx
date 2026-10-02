import React, { useState, useEffect, useMemo } from 'react';
import { 
  AcademicStream, 
  AcademicLevel, 
  SyllabusSubject, 
  SyllabusModule, 
  SyllabusTopicModel, 
  TopicPriority,
  PaperRelevance,
  TopicGapAnalysis
} from '../../types/academicSyllabus';
import { 
  fetchAcademicStreams, 
  saveAcademicStream, 
  deleteAcademicStream,
  fetchAcademicLevels, 
  saveAcademicLevel, 
  deleteAcademicLevel,
  fetchSyllabusSubjects, 
  saveSyllabusSubject, 
  deleteSyllabusSubject,
  fetchSyllabusModules, 
  saveSyllabusModule, 
  deleteSyllabusModule,
  fetchSyllabusTopics, 
  saveSyllabusTopic, 
  deleteSyllabusTopic,
  reorderSyllabusTopics,
  adminOverrideTopicPriority,
  parseBulkSyllabusDocument,
  commitImportedSyllabus,
  ExtractedSyllabusDraft
} from '../../services/academicSyllabusService';
import { generateAdminTopicGapAnalysis } from '../../services/academicPriorityEngine';
import { Card, Button, Badge } from '../ui';
import { 
  Layers, 
  BookOpen, 
  ListTree, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  FileText, 
  BarChart3, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Search,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSyllabusManager() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'topics' | 'import' | 'gap_analysis'>('hierarchy');

  // Hierarchy entities
  const [streams, setStreams] = useState<AcademicStream[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [subjects, setSubjects] = useState<SyllabusSubject[]>([]);
  const [modules, setModules] = useState<SyllabusModule[]>([]);
  const [topics, setTopics] = useState<SyllabusTopicModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Selections
  const [selectedStreamId, setSelectedStreamId] = useState<string>('general');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('advanced_level');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('gen_al_cs');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Modals & Forms
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [streamForm, setStreamForm] = useState({ name: '', code: '', description: '' });

  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelForm, setLevelForm] = useState({ name: '', code: '', description: '' });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ 
    name: '', 
    code: '', 
    description: '', 
    examinationType: 'GCE' as 'GCE' | 'TVEE' | 'BACC',
    availablePapers: ['Paper 1', 'Paper 2'] as PaperRelevance[]
  });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({ moduleNumber: 'Module 1', title: '', description: '' });

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<SyllabusTopicModel | null>(null);
  const [topicForm, setTopicForm] = useState({
    topicName: '',
    code: '',
    description: '',
    subtopicsText: '', // newline separated
    learningObjectivesText: '', // newline separated
    importantConceptsText: '', // comma separated
    paperRelevance: ['Paper 1', 'Paper 2'] as PaperRelevance[],
    priority: 'HIGH' as TopicPriority,
    priorityScore: 80,
    difficulty: 'Standard' as any,
    estimatedStudyTimeMinutes: 120,
    prerequisitesText: ''
  });

  // Bulk Import State
  const [importDraft, setImportDraft] = useState<ExtractedSyllabusDraft | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState('');

  // Priority Override Modal
  const [overrideTopic, setOverrideTopic] = useState<SyllabusTopicModel | null>(null);
  const [overrideForm, setOverrideForm] = useState({ priority: 'CRITICAL' as TopicPriority, score: 95, reason: '' });

  // Initial Data Fetch
  useEffect(() => {
    loadAllHierarchy();
  }, []);

  async function loadAllHierarchy() {
    setLoading(true);
    try {
      const [sList, lList, subList] = await Promise.all([
        fetchAcademicStreams(),
        fetchAcademicLevels(),
        fetchSyllabusSubjects()
      ]);
      setStreams(sList);
      setLevels(lList);
      setSubjects(subList);

      if (sList.length > 0 && !selectedStreamId) setSelectedStreamId(sList[0].id);
      if (lList.length > 0 && !selectedLevelId) setSelectedLevelId(lList[0].id);
      if (subList.length > 0 && !selectedSubjectId) setSelectedSubjectId(subList[0].id);
    } finally {
      setLoading(false);
    }
  }

  // Load modules & topics when subject changes
  useEffect(() => {
    async function loadSubjectData() {
      if (!selectedSubjectId) return;
      const [mList, tList] = await Promise.all([
        fetchSyllabusModules(selectedSubjectId),
        fetchSyllabusTopics(selectedSubjectId)
      ]);
      setModules(mList);
      setTopics(tList);
      if (mList.length > 0) setSelectedModuleId(mList[0].id);
      else setSelectedModuleId('');
    }
    loadSubjectData();
  }, [selectedSubjectId]);

  // Current Subject
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Filtered topics for current subject / module
  const displayedTopics = useMemo(() => {
    if (selectedModuleId) {
      return topics.filter(t => t.moduleId === selectedModuleId);
    }
    return topics;
  }, [topics, selectedModuleId]);

  // Topic Gap Analysis Data
  const gapAnalysisList = useMemo(() => {
    return generateAdminTopicGapAnalysis(topics);
  }, [topics]);

  // Handlers for Adding Streams
  const handleSaveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = streamForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newStream: AcademicStream = {
      id,
      name: streamForm.name,
      code: streamForm.code || streamForm.name.slice(0, 4).toUpperCase(),
      description: streamForm.description,
      isActive: true,
      order: streams.length + 1
    };
    await saveAcademicStream(newStream);
    toast.success(`Academic Stream "${streamForm.name}" created.`);
    setShowStreamModal(false);
    setStreamForm({ name: '', code: '', description: '' });
    loadAllHierarchy();
  };

  // Handlers for Adding Levels
  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = levelForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newLevel: AcademicLevel = {
      id,
      streamId: selectedStreamId,
      name: levelForm.name,
      code: levelForm.code || levelForm.name.slice(0, 5).toUpperCase(),
      description: levelForm.description,
      order: levels.length + 1,
      isActive: true
    };
    await saveAcademicLevel(newLevel);
    toast.success(`Level "${levelForm.name}" created.`);
    setShowLevelModal(false);
    setLevelForm({ name: '', code: '', description: '' });
    loadAllHierarchy();
  };

  // Handlers for Adding Subjects
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${selectedStreamId}_${selectedLevelId}_${subjectForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newSubject: SyllabusSubject = {
      id,
      name: subjectForm.name,
      code: subjectForm.code || subjectForm.name.slice(0, 3).toUpperCase(),
      streamId: selectedStreamId,
      levelId: selectedLevelId,
      language: 'en',
      description: subjectForm.description,
      examinationType: subjectForm.examinationType,
      availablePapers: subjectForm.availablePapers,
      isActive: true,
      order: subjects.length + 1
    };
    await saveSyllabusSubject(newSubject);
    toast.success(`Subject "${subjectForm.name}" saved.`);
    setShowSubjectModal(false);
    setSubjectForm({ name: '', code: '', description: '', examinationType: 'GCE', availablePapers: ['Paper 1', 'Paper 2'] });
    loadAllHierarchy();
  };

  // Handlers for Adding Modules
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${selectedSubjectId}_mod_${modules.length + 1}`;
    const newMod: SyllabusModule = {
      id,
      subjectId: selectedSubjectId,
      streamId: selectedStreamId,
      levelId: selectedLevelId,
      moduleNumber: moduleForm.moduleNumber,
      title: moduleForm.title,
      description: moduleForm.description,
      order: modules.length + 1
    };
    await saveSyllabusModule(newMod);
    toast.success(`Module "${moduleForm.title}" saved.`);
    setShowModuleModal(false);
    setModuleForm({ moduleNumber: `Module ${modules.length + 2}`, title: '', description: '' });
    const refreshed = await fetchSyllabusModules(selectedSubjectId);
    setModules(refreshed);
    setSelectedModuleId(id);
  };

  // Handlers for Saving Topic
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetModuleId = selectedModuleId || (modules[0]?.id);
    if (!targetModuleId) {
      toast.error('Please create or select a module first.');
      return;
    }

    const currentMod = modules.find(m => m.id === targetModuleId);
    const id = editingTopic?.id || `${targetModuleId}_top_${Date.now()}`;

    const subtopics = topicForm.subtopicsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((s, idx) => ({ id: `sub_${id}_${idx}`, name: s }));

    const learningObjectives = topicForm.learningObjectivesText
      .split('\n')
      .map(o => o.trim())
      .filter(Boolean);

    const importantConcepts = topicForm.importantConceptsText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const prerequisites = topicForm.prerequisitesText
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const newTopic: SyllabusTopicModel = {
      id,
      subjectId: selectedSubjectId,
      subjectName: currentSubject?.name || 'Subject',
      streamId: selectedStreamId,
      levelId: selectedLevelId,
      moduleId: targetModuleId,
      moduleTitle: currentMod?.title || 'Module',
      topicName: topicForm.topicName,
      code: topicForm.code || `T-${topics.length + 1}`,
      description: topicForm.description,
      subtopics,
      learningObjectives,
      importantConcepts,
      paperRelevance: topicForm.paperRelevance,
      priority: topicForm.priority,
      priorityScore: topicForm.priorityScore,
      prioritySource: 'ADMIN',
      priorityReason: 'Authoritative administrator configured topic.',
      priorityBreakdown: {
        curriculumWeight: 90,
        gceFrequency: 85,
        gceMarksWeight: 85,
        paperCoverage: 90,
        prerequisiteImportance: 80
      },
      difficulty: topicForm.difficulty,
      prerequisites,
      estimatedStudyTimeMinutes: Number(topicForm.estimatedStudyTimeMinutes),
      pastQuestionCount: editingTopic?.pastQuestionCount || 0,
      pastQuestionsList: editingTopic?.pastQuestionsList || [],
      questionCount: editingTopic?.questionCount || 0,
      order: editingTopic?.order || (topics.length + 1),
      status: 'active',
      isOfficialSyllabus: true,
      lastReviewed: new Date().toISOString()
    };

    await saveSyllabusTopic(newTopic);
    toast.success(`Topic "${topicForm.topicName}" saved.`);
    setShowTopicModal(false);
    setEditingTopic(null);
    setTopicForm({
      topicName: '',
      code: '',
      description: '',
      subtopicsText: '',
      learningObjectivesText: '',
      importantConceptsText: '',
      paperRelevance: ['Paper 1', 'Paper 2'],
      priority: 'HIGH',
      priorityScore: 80,
      difficulty: 'Standard',
      estimatedStudyTimeMinutes: 120,
      prerequisitesText: ''
    });

    const refreshedTopics = await fetchSyllabusTopics(selectedSubjectId);
    setTopics(refreshedTopics);
  };

  // Reorder topics handler
  const handleMoveTopic = async (topicId: string, direction: 'up' | 'down') => {
    const list = [...topics];
    const idx = list.findIndex(t => t.id === topicId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    } else {
      return;
    }

    setTopics(list);
    await reorderSyllabusTopics(list.map(t => t.id));
    toast.success('Topic order updated.');
  };

  // Priority override submit
  const handleApplyPriorityOverride = async () => {
    if (!overrideTopic) return;
    await adminOverrideTopicPriority(
      overrideTopic.id,
      overrideForm.priority,
      overrideForm.score,
      overrideForm.reason || 'Manual administrative recalibration'
    );
    toast.success(`Priority updated to ${overrideForm.priority} for "${overrideTopic.topicName}".`);
    setOverrideTopic(null);
    const refreshed = await fetchSyllabusTopics(selectedSubjectId);
    setTopics(refreshed);
  };

  // File Upload Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setImportStatusMessage('Parsing syllabus document with AI classification...');
    try {
      const text = await file.text();
      const draft = await parseBulkSyllabusDocument(text, file.name);
      setImportDraft(draft);
      toast.success('Syllabus draft extracted. Review before approving.');
    } catch (err: any) {
      toast.error('Failed to parse syllabus file: ' + err.message);
    } finally {
      setIsParsing(false);
      setImportStatusMessage('');
    }
  };

  // Commit Import
  const handleCommitImport = async (approveAsOfficial: boolean) => {
    if (!importDraft) return;
    try {
      const result = await commitImportedSyllabus(
        importDraft,
        selectedStreamId,
        selectedLevelId,
        selectedSubjectId,
        approveAsOfficial
      );
      toast.success(`Successfully imported ${result.importedTopicsCount} syllabus topics!`);
      setImportDraft(null);
      const [refreshedM, refreshedT] = await Promise.all([
        fetchSyllabusModules(selectedSubjectId),
        fetchSyllabusTopics(selectedSubjectId)
      ]);
      setModules(refreshedM);
      setTopics(refreshedT);
    } catch (err: any) {
      toast.error('Failed to commit syllabus: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Layers size={22} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Academic Curriculum & Syllabus Seeding Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Manage academic streams, class levels, subjects, modules, topics, learning objectives, and evidence-based topic priority.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'hierarchy' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Syllabus Tree
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'topics' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Topics & Priorities
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'import' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bulk Syllabus Import
          </button>
          <button
            onClick={() => setActiveTab('gap_analysis')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'gap_analysis' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Content Gap Analysis
          </button>
        </div>
      </div>

      {/* CASCADE SELECTORS BAR */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Stream Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                1. Stream
              </label>
              <button 
                onClick={() => setShowStreamModal(true)} 
                className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <select
              value={selectedStreamId}
              onChange={(e) => setSelectedStreamId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              {streams.map(str => (
                <option key={str.id} value={str.id}>{str.name} ({str.code})</option>
              ))}
            </select>
          </div>

          {/* Level Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                2. Level / Class
              </label>
              <button 
                onClick={() => setShowLevelModal(true)} 
                className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              {levels.map(lvl => (
                <option key={lvl.id} value={lvl.id}>{lvl.name} ({lvl.code})</option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                3. Subject
              </label>
              <button 
                onClick={() => setShowSubjectModal(true)} 
                className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.examinationType})</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* TAB 1: SYLLABUS TREE & MODULE BUILDER */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Modules / Units ({modules.length})
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowModuleModal(true)}
                className="text-xs bg-indigo-600 text-white font-bold py-1.5 px-3 flex items-center gap-1"
              >
                <Plus size={14} /> Add Module
              </Button>
            </div>

            <div className="space-y-2.5">
              {modules.length === 0 ? (
                <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No modules created for this subject yet. Click "+ Add Module" to begin.
                </div>
              ) : (
                modules.map((m, mIdx) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedModuleId === m.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {m.moduleNumber}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {m.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {topics.filter(t => t.moduleId === m.id).length} topics
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Topics for Selected Module */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Syllabus Topics in {modules.find(m => m.id === selectedModuleId)?.title || 'All Modules'}
                </h3>
                <p className="text-xs text-slate-500">
                  {displayedTopics.length} topics • Drag or use arrows to reorder
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingTopic(null);
                  setTopicForm({
                    topicName: '',
                    code: '',
                    description: '',
                    subtopicsText: '',
                    learningObjectivesText: '',
                    importantConceptsText: '',
                    paperRelevance: ['Paper 1', 'Paper 2'],
                    priority: 'HIGH',
                    priorityScore: 80,
                    difficulty: 'Standard',
                    estimatedStudyTimeMinutes: 120,
                    prerequisitesText: ''
                  });
                  setShowTopicModal(true);
                }}
                className="text-xs bg-indigo-600 text-white font-bold py-1.5 px-3 flex items-center gap-1"
              >
                <Plus size={14} /> Add Topic
              </Button>
            </div>

            <div className="space-y-3">
              {displayedTopics.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No topics in this module. Add a topic or choose another module.
                </div>
              ) : (
                displayedTopics.map((top, tIdx) => (
                  <Card
                    key={top.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center">
                            {tIdx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            top.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                            top.priority === 'HIGH' ? 'bg-amber-500 text-slate-900' :
                            top.priority === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                          }`}>
                            {top.priority} ({top.priorityScore}/100)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {top.code}
                          </span>
                          {top.prioritySource === 'ADMIN' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold">
                              ADMIN OVERRIDE
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {top.topicName}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                          {top.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Order arrows */}
                        <button
                          onClick={() => handleMoveTopic(top.id, 'up')}
                          disabled={tIdx === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Move Up"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          onClick={() => handleMoveTopic(top.id, 'down')}
                          disabled={tIdx === displayedTopics.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Move Down"
                        >
                          <ArrowDown size={15} />
                        </button>

                        {/* Priority Override Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOverrideTopic(top);
                            setOverrideForm({ priority: top.priority, score: top.priorityScore, reason: '' });
                          }}
                          className="text-[11px] font-bold px-2 py-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          Override Priority
                        </Button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingTopic(top);
                            setTopicForm({
                              topicName: top.topicName,
                              code: top.code || '',
                              description: top.description,
                              subtopicsText: top.subtopics.map(s => s.name).join('\n'),
                              learningObjectivesText: top.learningObjectives.join('\n'),
                              importantConceptsText: top.importantConcepts.join(', '),
                              paperRelevance: top.paperRelevance,
                              priority: top.priority,
                              priorityScore: top.priorityScore,
                              difficulty: top.difficulty,
                              estimatedStudyTimeMinutes: top.estimatedStudyTimeMinutes,
                              prerequisitesText: top.prerequisites.join(', ')
                            });
                            setShowTopicModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Topic"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={async () => {
                            if (confirm(`Delete topic "${top.topicName}"?`)) {
                              await deleteSyllabusTopic(top.id);
                              toast.success('Topic deleted');
                              const refreshed = await fetchSyllabusTopics(selectedSubjectId);
                              setTopics(refreshed);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Topic"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Subtopics pill list */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">
                        Subtopics ({top.subtopics.length}):
                      </span>
                      {top.subtopics.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOPICS & PRIORITY MATRIX */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Topic Importance & Evidence-Based Priority Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Formula: Curriculum Weight + Past GCE Question Frequency + GCE Marks Weight + Paper Coverage
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Topic Name</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">GCE Papers</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Past GCE Qs</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topics.map((top) => (
                  <tr key={top.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {top.topicName}
                    </td>
                    <td className="p-3 text-slate-500">
                      {top.moduleTitle}
                    </td>
                    <td className="p-3">
                      {top.paperRelevance.join(', ')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        top.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                        top.priority === 'HIGH' ? 'bg-amber-500 text-slate-900' :
                        top.priority === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        {top.priority}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-600">
                      {top.priorityScore}/100
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {top.prioritySource}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {top.pastQuestionCount} verified
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOverrideTopic(top);
                          setOverrideForm({ priority: top.priority, score: top.priorityScore, reason: '' });
                        }}
                        className="text-[10px] font-bold py-1 px-2 border-indigo-200 text-indigo-600"
                      >
                        Recalibrate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BULK SYLLABUS IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload size={18} className="text-indigo-600" />
                Upload Official Syllabus or Curriculum Document
              </h3>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Upload curriculum documents (PDF, DOCX, CSV, JSON). Edulpha AI will automatically parse and classify the stream, level, subject, modules, topics, subtopics, and learning objectives into structured entities.
              </p>
            </div>

            <div className="p-8 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 text-center space-y-3">
              <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
              <div className="space-y-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition">
                  <Upload size={15} /> Select Syllabus File
                  <input
                    type="file"
                    accept=".json,.csv,.txt,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400">Supported formats: JSON, CSV, TXT, DOCX, PDF</p>
              </div>
            </div>

            {isParsing && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
                <RotateCw className="w-5 h-5 animate-spin text-amber-600" />
                <span>{importStatusMessage}</span>
              </div>
            )}
          </Card>

          {/* DRAFT REVIEW BANNER */}
          {importDraft && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-400 rounded-3xl space-y-5 shadow-lg">
              <div className="p-4 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      AI-generated syllabus classification — Review required
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-400">
                      The AI extracted the syllabus structure below. As required by system guidelines, imported topics must be reviewed and approved by an administrator before becoming authoritative.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportDraft(null)}
                    className="text-xs text-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCommitImport(true)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Approve & Commit to Database
                  </Button>
                </div>
              </div>

              {/* Preview of Extracted Modules */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Extracted Curriculum for: {importDraft.subjectName} ({importDraft.levelName})
                </h4>
                <div className="space-y-3">
                  {importDraft.modules.map((mod, mIdx) => (
                    <div key={mIdx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {mod.moduleNumber}: {mod.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{mod.topics.length} topics</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.topics.map((t, tIdx) => (
                          <div key={tIdx} className="p-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.topicName}</span>
                            <span className="text-[10px] text-slate-500 block">{t.subtopics.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: CONTENT GAP ANALYSIS */}
      {activeTab === 'gap_analysis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                TOPIC CONTENT GAP ANALYSIS & ANALYTICS
              </h3>
              <p className="text-xs text-slate-500">
                Identify topics with insufficient question banks, missing past GCE references, or low student mastery.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Questions in Bank</th>
                  <th className="p-3">Past GCE Qs</th>
                  <th className="p-3">Revision Notes</th>
                  <th className="p-3">Content Gap Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gapAnalysisList.map((gap) => (
                  <tr key={gap.topicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {gap.topicName}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        gap.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                        gap.priority === 'HIGH' ? 'bg-amber-500 text-slate-900' :
                        gap.priority === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        {gap.priority}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={gap.questionCount < 10 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>
                        {gap.questionCount}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {gap.pastQuestionCount}
                    </td>
                    <td className="p-3">
                      {gap.hasRevisionNotes ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <Check size={13} /> Active
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold">Missing</span>
                      )}
                    </td>
                    <td className="p-3">
                      {gap.missingContentFlags.length === 0 ? (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ✓ Complete Coverage
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {gap.missingContentFlags.map((flag, fIdx) => (
                            <span key={fIdx} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md text-[9px] font-bold">
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STREAM MODAL */}
      {showStreamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-4">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">Add Academic Stream</h3>
            <form onSubmit={handleSaveStream} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stream Name</label>
                <input
                  required
                  type="text"
                  value={streamForm.name}
                  onChange={e => setStreamForm({ ...streamForm, name: e.target.value })}
                  placeholder="e.g. Higher Technical Education"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stream Code</label>
                <input
                  required
                  type="text"
                  value={streamForm.code}
                  onChange={e => setStreamForm({ ...streamForm, code: e.target.value })}
                  placeholder="e.g. HTE"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={streamForm.description}
                  onChange={e => setStreamForm({ ...streamForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowStreamModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Stream</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* LEVEL MODAL */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-4">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">Add Level / Class</h3>
            <form onSubmit={handleSaveLevel} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Level Name</label>
                <input
                  required
                  type="text"
                  value={levelForm.name}
                  onChange={e => setLevelForm({ ...levelForm, name: e.target.value })}
                  placeholder="e.g. Form 5 / BEPC"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Level Code</label>
                <input
                  required
                  type="text"
                  value={levelForm.code}
                  onChange={e => setLevelForm({ ...levelForm, code: e.target.value })}
                  placeholder="e.g. F5"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowLevelModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Level</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-4">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">Add Syllabus Subject</h3>
            <form onSubmit={handleSaveSubject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject Name</label>
                <input
                  required
                  type="text"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Chemistry"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Code</label>
                  <input
                    required
                    type="text"
                    value={subjectForm.code}
                    onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="e.g. 715"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Type</label>
                  <select
                    value={subjectForm.examinationType}
                    onChange={e => setSubjectForm({ ...subjectForm, examinationType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  >
                    <option value="GCE">GCE</option>
                    <option value="TVEE">TVEE</option>
                    <option value="BACC">BACC</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowSubjectModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Subject</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODULE MODAL */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-4">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">Add Module / Unit</h3>
            <form onSubmit={handleSaveModule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Module Number</label>
                <input
                  required
                  type="text"
                  value={moduleForm.moduleNumber}
                  onChange={e => setModuleForm({ ...moduleForm, moduleNumber: e.target.value })}
                  placeholder="e.g. Module 3"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Module Title</label>
                <input
                  required
                  type="text"
                  value={moduleForm.title}
                  onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Operating Systems & Device Drivers"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModuleModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Module</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-4 my-auto">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
              {editingTopic ? 'Edit Syllabus Topic' : 'Add New Syllabus Topic'}
            </h3>
            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Topic Name</label>
                <input
                  required
                  type="text"
                  value={topicForm.topicName}
                  onChange={e => setTopicForm({ ...topicForm, topicName: e.target.value })}
                  placeholder="e.g. Database Normalization"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={topicForm.priority}
                    onChange={e => {
                      const p = e.target.value as TopicPriority;
                      const score = p === 'CRITICAL' ? 95 : p === 'HIGH' ? 82 : p === 'MEDIUM' ? 65 : 40;
                      setTopicForm({ ...topicForm, priority: p, priorityScore: score });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (90-100)</option>
                    <option value="HIGH">HIGH (75-89)</option>
                    <option value="MEDIUM">MEDIUM (50-74)</option>
                    <option value="LOW">LOW (0-49)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={topicForm.priorityScore}
                    onChange={e => setTopicForm({ ...topicForm, priorityScore: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Est. Study (mins)</label>
                  <input
                    type="number"
                    value={topicForm.estimatedStudyTimeMinutes}
                    onChange={e => setTopicForm({ ...topicForm, estimatedStudyTimeMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={topicForm.description}
                  onChange={e => setTopicForm({ ...topicForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtopics (1 per line)</label>
                <textarea
                  value={topicForm.subtopicsText}
                  onChange={e => setTopicForm({ ...topicForm, subtopicsText: e.target.value })}
                  rows={3}
                  placeholder="First Normal Form (1NF)&#10;Second Normal Form (2NF)&#10;Third Normal Form (3NF)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Learning Objectives (1 per line)</label>
                <textarea
                  value={topicForm.learningObjectivesText}
                  onChange={e => setTopicForm({ ...topicForm, learningObjectivesText: e.target.value })}
                  rows={3}
                  placeholder="Define candidate keys&#10;Explain partial dependencies&#10;Eliminate repeating groups"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowTopicModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Topic</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* PRIORITY OVERRIDE MODAL */}
      {overrideTopic && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-4">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
              Override Topic Priority
            </h3>
            <p className="text-xs text-slate-500">
              Manually recalibrate the priority level for <strong>{overrideTopic.topicName}</strong>. This sets the source to <code>ADMIN</code>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                <select
                  value={overrideForm.priority}
                  onChange={e => {
                    const p = e.target.value as TopicPriority;
                    const s = p === 'CRITICAL' ? 95 : p === 'HIGH' ? 82 : p === 'MEDIUM' ? 65 : 40;
                    setOverrideForm({ ...overrideForm, priority: p, score: s });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                >
                  <option value="CRITICAL">CRITICAL (90-100)</option>
                  <option value="HIGH">HIGH (75-89)</option>
                  <option value="MEDIUM">MEDIUM (50-74)</option>
                  <option value="LOW">LOW (0-49)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numeric Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideForm.score}
                  onChange={e => setOverrideForm({ ...overrideForm, score: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Administrative Reason</label>
                <input
                  type="text"
                  value={overrideForm.reason}
                  onChange={e => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="e.g. MINESEC special focus or revised exam weighting"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setOverrideTopic(null)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleApplyPriorityOverride}>Apply Override</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
