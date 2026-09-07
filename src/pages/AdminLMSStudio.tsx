import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Edit3, Trash2, Copy, Eye, EyeOff, Calendar, 
  Layers, FolderTree, FileText, Video, FileCheck, Code, Sparkles, 
  Search, Filter, Save, X, ArrowLeft, CheckCircle2, AlertCircle, 
  HelpCircle, Link as LinkIcon, Download, Clock, ShieldCheck, 
  Award, PlayCircle, Music, FileCode, Check, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { Button, Card, Badge, cn, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { 
  LMSLesson, LMSLessonFormat, LMSLessonStatus, LMSDifficulty, 
  LMSAttachment, LMSQuiz, LMSQuizQuestion, LMSHierarchyItem 
} from '../types';
import { 
  fetchAllLessons, createLesson, updateLesson, deleteLesson, duplicateLesson, 
  fetchHierarchyItems, saveHierarchyItem, deleteHierarchyItem, 
  DEFAULT_EDUCATION_LEVELS, DEFAULT_DEPARTMENTS 
} from '../services/lmsService';
import { toast } from 'react-hot-toast';

export default function AdminLMSStudio() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [hierarchyItems, setHierarchyItems] = useState<LMSHierarchyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'lessons' | 'builder' | 'hierarchy'
  const [activeTab, setActiveTab] = useState<'lessons' | 'builder' | 'hierarchy'>('lessons');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('All');

  // Lesson Builder state
  const [editingLesson, setEditingLesson] = useState<Partial<LMSLesson>>({
    title: '',
    subtitle: '',
    description: '',
    educationLevel: 'Ordinary Level',
    department: 'Science & Tech',
    subject: 'Computer Science',
    paper: 'Paper 1',
    topic: 'Computer Hardware',
    subtopic: 'Input Devices',
    format: 'text',
    objectives: ['Define primary hardware components', 'Differentiate between input and output devices'],
    estimatedMinutes: 20,
    difficulty: 'Beginner',
    teacher: 'Mr. Nkwain Divine',
    thumbnail: '',
    coverImage: '',
    lessonContent: `## Introduction to Input Devices\n\nAn **input device** is any hardware device that sends data to a computer, allowing you to interact with and control it.\n\n### Key Concepts\n- **Manual Input Devices**: Keyboards, mice, touchscreens\n- **Direct Input Devices**: Barcode scanners, RFID readers, OMR readers\n\n\`\`\`python\n# Python pseudocode representation of input scanning\ndef scan_barcode(barcode_data):\n    print("Processing item:", barcode_data)\n\`\`\`\n\n### Summary\nDirect data entry reduces human error during data entry processes.`,
    videoUrl: '',
    pdfUrl: '',
    audioUrl: '',
    externalUrl: '',
    references: ['GCE Computer Science Syllabus Guide', 'Cambridge IGCSE Computer Science 0478'],
    attachments: [
      { id: 'att-1', name: 'Input_Devices_Summary_Notes.pdf', type: 'pdf', url: 'https://example.com/notes.pdf', size: '1.4 MB' },
      { id: 'att-2', name: 'Hardware_Lab_Practical.zip', type: 'zip', url: 'https://example.com/lab.zip', size: '3.2 MB' }
    ],
    quizzes: [
      {
        id: 'qz-1',
        title: 'Input Devices Quick Drill',
        isTimed: true,
        durationMinutes: 5,
        instantFeedback: true,
        questions: [
          {
            id: 'qq-1',
            type: 'mcq',
            question: 'Which of the following is considered a direct data input device?',
            options: ['Standard Keyboard', 'Barcode Reader', 'Trackball Mouse', 'Graphic Tablet'],
            correctAnswer: 'Barcode Reader',
            explanation: 'Barcode readers scan data directly into the system without manual keypresses.'
          },
          {
            id: 'qq-2',
            type: 'true_false',
            question: 'OMR (Optical Mark Recognition) is commonly used to mark multiple choice answer sheets.',
            correctAnswer: true,
            explanation: 'OMR detects marks made in specific positions on a paper form.'
          }
        ]
      }
    ],
    status: 'published',
    scheduledAt: '',
    orderIndex: 1
  });

  // Modal for Objective / Attachment / Quiz Question editing
  const [showObjectiveInput, setShowObjectiveInput] = useState(false);
  const [newObjective, setNewObjective] = useState('');

  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [newAttachment, setNewAttachment] = useState<Partial<LMSAttachment>>({
    name: '',
    type: 'pdf',
    url: '',
    size: '1.0 MB'
  });

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<LMSQuizQuestion>>({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  // Hierarchy Builder Modal
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<Partial<LMSHierarchyItem>>({
    type: 'subject',
    name: '',
    code: '',
    description: '',
    order: 1
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lData, hData] = await Promise.all([
        fetchAllLessons(),
        fetchHierarchyItems()
      ]);
      setLessons(lData);
      setHierarchyItems(hData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load LMS content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewLesson = () => {
    setEditingLesson({
      title: '',
      subtitle: '',
      description: '',
      educationLevel: 'Ordinary Level',
      department: 'Science & Tech',
      subject: 'Computer Science',
      paper: 'Paper 1',
      topic: 'New Topic',
      subtopic: '',
      format: 'text',
      objectives: ['Master core topic definitions'],
      estimatedMinutes: 15,
      difficulty: 'Beginner',
      teacher: user?.displayName || 'Admin Instructor',
      thumbnail: '',
      coverImage: '',
      lessonContent: `## Lesson Topic Overview\n\nAdd your lesson content here. Supports Markdown formatting, headers, lists, code blocks, and math formulas.`,
      videoUrl: '',
      pdfUrl: '',
      audioUrl: '',
      externalUrl: '',
      references: [],
      attachments: [],
      quizzes: [],
      status: 'draft',
      scheduledAt: '',
      orderIndex: (lessons.length + 1)
    });
    setActiveTab('builder');
  };

  const handleEditLesson = (lesson: LMSLesson) => {
    setEditingLesson(lesson);
    setActiveTab('builder');
  };

  const handleSaveLesson = async () => {
    if (!editingLesson.title || !editingLesson.subject || !editingLesson.topic) {
      toast.error("Please fill in required fields (Title, Subject, Topic).");
      return;
    }

    try {
      const payload: Omit<LMSLesson, 'id'> = {
        title: editingLesson.title!,
        subtitle: editingLesson.subtitle || '',
        description: editingLesson.description || '',
        educationLevel: editingLesson.educationLevel || 'Ordinary Level',
        department: editingLesson.department || 'Science & Tech',
        subject: editingLesson.subject!,
        paper: editingLesson.paper || 'Paper 1',
        topic: editingLesson.topic!,
        subtopic: editingLesson.subtopic || '',
        format: editingLesson.format || 'text',
        objectives: editingLesson.objectives || [],
        estimatedMinutes: editingLesson.estimatedMinutes || 15,
        difficulty: editingLesson.difficulty || 'Beginner',
        teacher: editingLesson.teacher || 'Admin',
        thumbnail: editingLesson.thumbnail || '',
        coverImage: editingLesson.coverImage || '',
        lessonContent: editingLesson.lessonContent || '',
        videoUrl: editingLesson.videoUrl || '',
        pdfUrl: editingLesson.pdfUrl || '',
        audioUrl: editingLesson.audioUrl || '',
        externalUrl: editingLesson.externalUrl || '',
        references: editingLesson.references || [],
        attachments: editingLesson.attachments || [],
        quizzes: editingLesson.quizzes || [],
        status: editingLesson.status || 'draft',
        scheduledAt: editingLesson.scheduledAt || '',
        orderIndex: editingLesson.orderIndex || 1,
        createdBy: user?.uid || 'admin'
      };

      if (editingLesson.id) {
        await updateLesson(editingLesson.id, payload);
        toast.success("Lesson updated successfully!");
      } else {
        await createLesson(payload);
        toast.success("Lesson published to LMS!");
      }

      loadData();
      setActiveTab('lessons');
    } catch (err) {
      console.error(err);
      toast.error("Failed to save lesson.");
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson(id);
      toast.success("Lesson deleted.");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete lesson.");
    }
  };

  const handleDuplicateLesson = async (lesson: LMSLesson) => {
    try {
      await duplicateLesson(lesson);
      toast.success("Lesson duplicated as draft.");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate lesson.");
    }
  };

  const handleToggleStatus = async (lesson: LMSLesson) => {
    const nextStatus: LMSLessonStatus = lesson.status === 'published' ? 'draft' : 'published';
    try {
      await updateLesson(lesson.id, { status: nextStatus });
      toast.success(`Lesson set to ${nextStatus}.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  // Helper for adding objectives
  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setEditingLesson(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), newObjective.trim()]
    }));
    setNewObjective('');
    setShowObjectiveInput(false);
  };

  const handleRemoveObjective = (index: number) => {
    setEditingLesson(prev => ({
      ...prev,
      objectives: (prev.objectives || []).filter((_, i) => i !== index)
    }));
  };

  // Helper for adding attachment
  const handleAddAttachment = () => {
    if (!newAttachment.name || !newAttachment.url) {
      toast.error("Please enter attachment name and URL.");
      return;
    }
    const item: LMSAttachment = {
      id: `att-${Date.now()}`,
      name: newAttachment.name!,
      type: newAttachment.type || 'pdf',
      url: newAttachment.url!,
      size: newAttachment.size || '1.0 MB'
    };
    setEditingLesson(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), item]
    }));
    setShowAttachmentModal(false);
    setNewAttachment({ name: '', type: 'pdf', url: '', size: '1.0 MB' });
  };

  const handleRemoveAttachment = (id: string) => {
    setEditingLesson(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== id)
    }));
  };

  // Helper for adding quiz questions
  const handleAddQuizQuestion = () => {
    if (!editingQuestion.question) {
      toast.error("Please enter a question.");
      return;
    }

    const newQ: LMSQuizQuestion = {
      id: `qq-${Date.now()}`,
      type: editingQuestion.type || 'mcq',
      question: editingQuestion.question!,
      options: editingQuestion.type === 'mcq' ? (editingQuestion.options || []).filter(o => o.trim() !== '') : undefined,
      correctAnswer: editingQuestion.correctAnswer ?? (editingQuestion.type === 'mcq' ? editingQuestion.options?.[0] : true),
      explanation: editingQuestion.explanation || ''
    };

    setEditingLesson(prev => {
      const existingQuizzes = prev.quizzes || [];
      if (existingQuizzes.length === 0) {
        return {
          ...prev,
          quizzes: [{
            id: 'qz-main',
            title: `${prev.title || 'Lesson'} Quiz`,
            isTimed: false,
            instantFeedback: true,
            questions: [newQ]
          }]
        };
      } else {
        const updated = [...existingQuizzes];
        updated[0] = {
          ...updated[0],
          questions: [...updated[0].questions, newQ]
        };
        return { ...prev, quizzes: updated };
      }
    });

    setShowQuizModal(false);
    setEditingQuestion({ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
  };

  const handleRemoveQuizQuestion = (qId: string) => {
    setEditingLesson(prev => {
      if (!prev.quizzes || prev.quizzes.length === 0) return prev;
      const updated = [...prev.quizzes];
      updated[0] = {
        ...updated[0],
        questions: updated[0].questions.filter(q => q.id !== qId)
      };
      return { ...prev, quizzes: updated };
    });
  };

  // Hierarchy Item Actions
  const handleSaveHierarchy = async () => {
    if (!editingHierarchy.name) {
      toast.error("Hierarchy item name is required.");
      return;
    }
    try {
      await saveHierarchyItem({
        type: editingHierarchy.type || 'subject',
        name: editingHierarchy.name!,
        code: editingHierarchy.code || '',
        description: editingHierarchy.description || '',
        order: editingHierarchy.order || 1
      });
      toast.success("Hierarchy node saved.");
      setShowHierarchyModal(false);
      const hData = await fetchHierarchyItems();
      setHierarchyItems(hData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save hierarchy item.");
    }
  };

  const handleDeleteHierarchy = async (id: string) => {
    if (!window.confirm("Delete this hierarchy category?")) return;
    try {
      await deleteHierarchyItem(id);
      toast.success("Category deleted.");
      const hData = await fetchHierarchyItems();
      setHierarchyItems(hData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    const matchesSearch = searchQuery === '' || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.teacher && l.teacher.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevelFilter === 'All' || l.educationLevel === selectedLevelFilter;
    const matchesSubject = selectedSubjectFilter === 'All' || l.subject === selectedSubjectFilter;
    const matchesStatus = selectedStatusFilter === 'All' || l.status === selectedStatusFilter;
    const matchesFormat = selectedFormatFilter === 'All' || l.format === selectedFormatFilter;

    return matchesSearch && matchesLevel && matchesSubject && matchesStatus && matchesFormat;
  });

  // Unique subjects & levels from lessons
  const availableLevels = Array.from(new Set(['Ordinary Level', 'Advanced Level', ...lessons.map(l => l.educationLevel)]));
  const availableSubjects = Array.from(new Set(['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', ...lessons.map(l => l.subject)]));

  return (
    <ModernDashboardLayout role="admin" activeTab="lms">
      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/admin')}
              className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 shrink-0"
              title="Back to Admin Dashboard"
            >
              <LayoutDashboard size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <BookOpen className="text-indigo-600" />
                Edulpha LMS Studio
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                Complete digital school content manager: Education Levels → Departments → Subjects → Papers → Topics → Subtopics → Lessons → Activities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCreateNewLesson} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Create New Lesson
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-8">
          <button
            onClick={() => setActiveTab('lessons')}
            className={cn(
              "pb-4 font-black text-sm tracking-wide transition-all border-b-2 flex items-center gap-2",
              activeTab === 'lessons' 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Layers size={18} />
            All Lessons ({lessons.length})
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={cn(
              "pb-4 font-black text-sm tracking-wide transition-all border-b-2 flex items-center gap-2",
              activeTab === 'builder' 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Edit3 size={18} />
            {editingLesson.id ? `Edit Lesson: ${editingLesson.title}` : 'Lesson Builder & Editor'}
          </button>

          <button
            onClick={() => setActiveTab('hierarchy')}
            className={cn(
              "pb-4 font-black text-sm tracking-wide transition-all border-b-2 flex items-center gap-2",
              activeTab === 'hierarchy' 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <FolderTree size={18} />
            Hierarchy & Taxonomy
          </button>
        </div>

        {/* TAB 1: ALL LESSONS LIST */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                  <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search lessons by title, topic, subject, or teacher..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <select
                    value={selectedLevelFilter}
                    onChange={e => setSelectedLevelFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Education Levels</option>
                    {availableLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedSubjectFilter}
                    onChange={e => setSelectedSubjectFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Subjects</option>
                    {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedStatusFilter}
                    onChange={e => setSelectedStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Lessons Grid */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-bold">Loading LMS repository...</div>
            ) : filteredLessons.length === 0 ? (
              <Card className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">No Lessons Found</h3>
                  <p className="text-slate-500 text-sm mt-1">Create your first lesson or try adjusting your search filters.</p>
                </div>
                <Button onClick={handleCreateNewLesson} className="bg-indigo-600 text-white font-bold">
                  Build First Lesson
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <Card key={lesson.id} className="p-6 bg-white border border-slate-200 rounded-3xl hover:shadow-lg transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-bold border-none text-[10px]">
                          {lesson.educationLevel}
                        </Badge>
                        <Badge className={cn(
                          "font-bold uppercase text-[9px] tracking-wider border-none",
                          lesson.status === 'published' ? "bg-emerald-100 text-emerald-800" :
                          lesson.status === 'draft' ? "bg-amber-100 text-amber-800" :
                          lesson.status === 'scheduled' ? "bg-blue-100 text-blue-800" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {lesson.status}
                        </Badge>
                      </div>

                      {/* Cover Thumbnail */}
                      {lesson.coverImage ? (
                        <img src={lesson.coverImage} alt={lesson.title} className="w-full h-32 object-cover rounded-2xl mb-4 border border-slate-100" />
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl mb-4 p-4 flex flex-col justify-between text-white">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{lesson.subject} • {lesson.paper}</span>
                          <span className="text-xs font-bold line-clamp-1">{lesson.topic}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase">
                          {lesson.format}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {lesson.estimatedMinutes} Mins
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-4">
                        {lesson.description || lesson.lessonContent?.slice(0, 100)}
                      </p>

                      <div className="text-[11px] font-medium text-slate-400 mb-4">
                        Teacher: <strong className="text-slate-700">{lesson.teacher || 'Staff'}</strong>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(lesson)}
                        className={cn(
                          "text-xs font-bold rounded-xl",
                          lesson.status === 'published' ? "text-amber-700 border-amber-200 hover:bg-amber-50" : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        )}
                      >
                        {lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicateLesson(lesson)}
                          title="Duplicate Lesson"
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLesson(lesson)}
                          title="Edit Lesson"
                          className="text-slate-500 hover:text-indigo-600"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          title="Delete Lesson"
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LESSON BUILDER / EDITOR */}
        {activeTab === 'builder' && (
          <div className="space-y-8">
            <Card className="p-8 bg-white border border-slate-200 rounded-3xl space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingLesson.id ? 'Edit Lesson' : 'Create New Educational Lesson'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Configure lesson details, media streams, markdown content, attached resources, and interactive quizzes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setActiveTab('lessons')}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLesson} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl">
                    <Save size={18} className="mr-2" />
                    Save & Publish Lesson
                  </Button>
                </div>
              </div>

              {/* Section 1: Classification & Metadata */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                  <FolderTree size={16} />
                  1. Taxonomy & Classification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Education Level *</label>
                    <select
                      value={editingLesson.educationLevel || 'Ordinary Level'}
                      onChange={e => setEditingLesson({ ...editingLesson, educationLevel: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="Ordinary Level">Ordinary Level</option>
                      <option value="Advanced Level">Advanced Level</option>
                      <option value="TVET & Technical">TVET & Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Department</label>
                    <select
                      value={editingLesson.department || 'Science & Tech'}
                      onChange={e => setEditingLesson({ ...editingLesson, department: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {DEFAULT_DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Subject *</label>
                    <input 
                      type="text"
                      value={editingLesson.subject || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, subject: e.target.value })}
                      placeholder="Computer Science"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Paper</label>
                    <input 
                      type="text"
                      value={editingLesson.paper || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, paper: e.target.value })}
                      placeholder="Paper 1"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Topic *</label>
                    <input 
                      type="text"
                      value={editingLesson.topic || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, topic: e.target.value })}
                      placeholder="Computer Hardware"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Subtopic</label>
                    <input 
                      type="text"
                      value={editingLesson.subtopic || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, subtopic: e.target.value })}
                      placeholder="Input Devices"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Lesson Core Attributes */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                  <FileText size={16} />
                  2. Lesson Metadata & Format
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Lesson Title *</label>
                    <input 
                      type="text"
                      value={editingLesson.title || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })}
                      placeholder="e.g. Master Input Devices & Data Entry"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Lesson Format</label>
                    <select
                      value={editingLesson.format || 'text'}
                      onChange={e => setEditingLesson({ ...editingLesson, format: e.target.value as LMSLessonFormat })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="text">Text Notes</option>
                      <option value="rich_text">Rich Text / Markdown</option>
                      <option value="video">Video Lesson</option>
                      <option value="pdf">PDF Reading</option>
                      <option value="practical">Practical / Lab</option>
                      <option value="programming">Programming Project</option>
                      <option value="interactive">Interactive Quiz / Game</option>
                      <option value="live_class">Live Class Stream</option>
                      <option value="recorded_class">Recorded Lecture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Difficulty & Duration</label>
                    <div className="flex gap-2">
                      <select
                        value={editingLesson.difficulty || 'Beginner'}
                        onChange={e => setEditingLesson({ ...editingLesson, difficulty: e.target.value as LMSDifficulty })}
                        className="w-1/2 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>

                      <input 
                        type="number"
                        min={1}
                        value={editingLesson.estimatedMinutes || 20}
                        onChange={e => setEditingLesson({ ...editingLesson, estimatedMinutes: Number(e.target.value) })}
                        placeholder="Mins"
                        className="w-1/2 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Instructor / Teacher</label>
                    <input 
                      type="text"
                      value={editingLesson.teacher || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, teacher: e.target.value })}
                      placeholder="e.g. Mr. Nkwain Divine"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Cover Image URL</label>
                    <input 
                      type="text"
                      value={editingLesson.coverImage || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Publishing Status</label>
                    <select
                      value={editingLesson.status || 'draft'}
                      onChange={e => setEditingLesson({ ...editingLesson, status: e.target.value as LMSLessonStatus })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Live for Students)</option>
                      <option value="scheduled">Scheduled Release</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Learning Objectives</label>
                    <button 
                      type="button" 
                      onClick={() => setShowObjectiveInput(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Objective
                    </button>
                  </div>

                  {showObjectiveInput && (
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newObjective}
                        onChange={e => setNewObjective(e.target.value)}
                        placeholder="e.g., Identify hardware components"
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                      <Button size="sm" onClick={handleAddObjective} className="bg-indigo-600 text-white font-bold">Add</Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(editingLesson.objectives || []).map((obj, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-900 rounded-xl text-xs font-bold flex items-center gap-2">
                        <span>• {obj}</span>
                        <X size={14} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => handleRemoveObjective(i)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Media URLs & Streams */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                  <Video size={16} />
                  3. Media Links & File Streams
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Video Stream URL</label>
                    <input 
                      type="text"
                      value={editingLesson.videoUrl || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                      placeholder="YouTube / Vimeo / MP4 Link"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">PDF Document URL</label>
                    <input 
                      type="text"
                      value={editingLesson.pdfUrl || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, pdfUrl: e.target.value })}
                      placeholder="https://.../handout.pdf"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Audio Lesson URL</label>
                    <input 
                      type="text"
                      value={editingLesson.audioUrl || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, audioUrl: e.target.value })}
                      placeholder="Podcast / Audio Stream URL"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">External Practical Link</label>
                    <input 
                      type="text"
                      value={editingLesson.externalUrl || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, externalUrl: e.target.value })}
                      placeholder="https://replit.com/..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Main Lesson Content (Markdown Editor) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                  <Code size={16} />
                  4. Lesson Content Editor (Markdown & Rich Content)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Markdown Editor Source</label>
                    <textarea 
                      rows={14}
                      value={editingLesson.lessonContent || ''}
                      onChange={e => setEditingLesson({ ...editingLesson, lessonContent: e.target.value })}
                      placeholder="Write markdown content..."
                      className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Live Student View Preview</label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 min-h-[300px] max-h-[350px] overflow-y-auto prose prose-slate text-xs max-w-none">
                      <ReactMarkdown>{editingLesson.lessonContent || '*No content written yet.*'}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Downloadable Attachments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                    <Download size={16} />
                    5. Downloadable Resource Attachments (PDF, Word, PPT, ZIP, Code)
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => setShowAttachmentModal(true)} className="border-indigo-200 text-indigo-600 font-bold text-xs">
                    <Plus size={14} className="mr-1" /> Add Attachment
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(editingLesson.attachments || []).map((att) => (
                    <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <FileText size={16} className="text-indigo-600 shrink-0" />
                        <span className="truncate">{att.name} ({att.type.toUpperCase()})</span>
                      </div>
                      <X size={16} className="cursor-pointer text-slate-400 hover:text-rose-600 shrink-0" onClick={() => handleRemoveAttachment(att.id)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Embedded Quiz & Activity Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                    <Sparkles size={16} />
                    6. Interactive Practice Quiz Questions
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => setShowQuizModal(true)} className="border-indigo-200 text-indigo-600 font-bold text-xs">
                    <Plus size={14} className="mr-1" /> Add Quiz Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingLesson.quizzes?.[0]?.questions?.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                            Q{idx + 1} • {q.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">{q.question}</p>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 italic mt-1">Explanation: {q.explanation}</p>
                        )}
                      </div>

                      <Button size="sm" variant="ghost" onClick={() => handleRemoveQuizQuestion(q.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: HIERARCHY MANAGER */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Education Taxonomy & Hierarchy Manager</h2>
                <p className="text-xs text-slate-500 font-medium">Dynamically configure levels, departments, subjects, papers, topics, and subtopics.</p>
              </div>

              <Button onClick={() => setShowHierarchyModal(true)} className="bg-indigo-600 text-white font-bold text-xs">
                <Plus size={16} className="mr-1" /> Add Hierarchy Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['level', 'department', 'subject', 'paper', 'topic', 'subtopic'].map((type) => {
                const items = hierarchyItems.filter(h => h.type === type);

                return (
                  <Card key={type} className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        {type}s ({items.length})
                      </h3>
                      <Badge className="bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">{type}</Badge>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold italic py-4">No dynamic {type} entries. (Default system options active).</p>
                    ) : (
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800">
                            <span>{item.name} {item.code && `(${item.code})`}</span>
                            <Trash2 size={14} className="cursor-pointer text-slate-400 hover:text-rose-600" onClick={() => handleDeleteHierarchy(item.id)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ATTACHMENT MODAL */}
        <Dialog open={showAttachmentModal} onOpenChange={setShowAttachmentModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Add File Attachment</DialogTitle>
              <DialogDescription className="text-xs">Attach downloadable learning materials (PDF, Word, PPT, Code, ZIP).</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">File Name</label>
                <input 
                  type="text"
                  value={newAttachment.name || ''}
                  onChange={e => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  placeholder="e.g. Chapter1_Hardware_Notes.pdf"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">File Type</label>
                <select
                  value={newAttachment.type || 'pdf'}
                  onChange={e => setNewAttachment({ ...newAttachment, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="word">Word Document</option>
                  <option value="ppt">PowerPoint Presentation</option>
                  <option value="zip">ZIP Archive</option>
                  <option value="code">Source Code / Project</option>
                  <option value="image">Image Asset</option>
                  <option value="video">Video File</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Download URL</label>
                <input 
                  type="text"
                  value={newAttachment.url || ''}
                  onChange={e => setNewAttachment({ ...newAttachment, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAttachmentModal(false)}>Cancel</Button>
              <Button onClick={handleAddAttachment} className="bg-indigo-600 text-white font-bold">Add Attachment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QUIZ QUESTION MODAL */}
        <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Add Practice Question</DialogTitle>
              <DialogDescription className="text-xs">Create MCQs, True/False, or Essay questions with instant feedback explanations.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Question Type</label>
                <select
                  value={editingQuestion.type || 'mcq'}
                  onChange={e => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="true_false">True / False</option>
                  <option value="essay">Short Answer / Essay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Question Prompt</label>
                <textarea 
                  rows={2}
                  value={editingQuestion.question || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  placeholder="e.g. What is the main function of an input device?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              {editingQuestion.type === 'mcq' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500">MCQ Options</label>
                  {(editingQuestion.options || ['', '', '', '']).map((opt, idx) => (
                    <input 
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={e => {
                        const opts = [...(editingQuestion.options || ['', '', '', ''])];
                        opts[idx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: opts, correctAnswer: opts[0] });
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Explanation Feedback</label>
                <input 
                  type="text"
                  value={editingQuestion.explanation || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Instant feedback displayed when answered..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuizModal(false)}>Cancel</Button>
              <Button onClick={handleAddQuizQuestion} className="bg-indigo-600 text-white font-bold">Add Question</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* HIERARCHY MODAL */}
        <Dialog open={showHierarchyModal} onOpenChange={setShowHierarchyModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Add Hierarchy Category</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category Type</label>
                <select
                  value={editingHierarchy.type || 'subject'}
                  onChange={e => setEditingHierarchy({ ...editingHierarchy, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="level">Education Level</option>
                  <option value="department">Department</option>
                  <option value="subject">Subject</option>
                  <option value="paper">Paper</option>
                  <option value="topic">Topic</option>
                  <option value="subtopic">Subtopic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                <input 
                  type="text"
                  value={editingHierarchy.name || ''}
                  onChange={e => setEditingHierarchy({ ...editingHierarchy, name: e.target.value })}
                  placeholder="e.g. Computer Hardware"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHierarchyModal(false)}>Cancel</Button>
              <Button onClick={handleSaveHierarchy} className="bg-indigo-600 text-white font-bold">Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModernDashboardLayout>
  );
}
