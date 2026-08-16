import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Plus, Calendar as CalendarIcon, Edit3, Trash2, Eye, EyeOff, 
  CheckCircle2, Sparkles, BookOpen, FileText, Search, Filter, Save, X, ArrowLeft, ChevronRight, Layers, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { Challenge, ChallengeDay, ExamQuestion, SubjectModel } from '../types';
import { 
  fetchAllChallenges, createChallenge, updateChallenge, deleteChallenge, 
  fetchChallengeDays, saveChallengeDay, deleteChallengeDay 
} from '../services/challengeService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

export default function AdminChallenges() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeDays, setChallengeDays] = useState<ChallengeDay[]>([]);
  const [questionsBank, setQuestionsBank] = useState<ExamQuestion[]>([]);

  // Modals
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    image: '',
    level: 'Ordinary Level',
    subjects: ['Computer Science'],
    duration: 30,
    startDate: '',
    endDate: '',
    status: 'draft'
  });

  const [editingDay, setEditingDay] = useState<Partial<ChallengeDay>>({
    dayNumber: 1,
    title: '',
    description: '',
    lessonContent: '',
    revisionMaterial: '',
    questionIds: [],
    assignmentId: ''
  });

  const [activeTab, setActiveTab] = useState<'challenges' | 'calendar'>('challenges');
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(30);
  const [customDuration, setCustomDuration] = useState<number>(30);

  // Subject options
  const standardSubjects = [
    'Computer Science', 'Mathematics', 'Additional Mathematics', 'Physics', 'Chemistry', 
    'Biology', 'Integrated Science', 'Technical Drawing', 'English Language', 'English Literature',
    'French', 'French Literature', 'History', 'Geography', 'Religious Studies', 'Citizenship Education',
    'Economics', 'Commerce', 'Principles of Accounts', 'Food and Nutrition', 'Home Management', 'ICT'
  ];

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
      const data = await fetchAllChallenges();
      setChallenges(data);

      // Load sample question bank for assigning questions to days
      const qSnap = await getDocs(query(collection(db, 'exam_questions'), orderBy('createdAt', 'desc'), limit(100)));
      setQuestionsBank(qSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExamQuestion)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChallengeModal = (challenge?: Challenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      if ([7, 14, 30, 60, 90].includes(challenge.duration)) {
        setDurationPreset(challenge.duration);
      } else {
        setDurationPreset('custom');
        setCustomDuration(challenge.duration);
      }
    } else {
      setEditingChallenge({
        title: '',
        description: '',
        image: '',
        level: 'Ordinary Level',
        subjects: ['Computer Science'],
        duration: 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'draft'
      });
      setDurationPreset(30);
      setCustomDuration(30);
    }
    setShowChallengeModal(true);
  };

  const handleSaveChallenge = async () => {
    if (!editingChallenge.title || !editingChallenge.description) {
      toast.error("Please fill in required fields (Title and Description).");
      return;
    }

    const duration = durationPreset === 'custom' ? Number(customDuration) : Number(durationPreset);
    if (!duration || duration <= 0) {
      toast.error("Please specify a valid duration.");
      return;
    }

    try {
      const payload = {
        title: editingChallenge.title!,
        description: editingChallenge.description!,
        image: editingChallenge.image || '',
        level: editingChallenge.level || 'Ordinary Level',
        subjects: editingChallenge.subjects || ['Computer Science'],
        duration,
        startDate: editingChallenge.startDate || '',
        endDate: editingChallenge.endDate || '',
        status: editingChallenge.status || 'draft',
        createdBy: user?.uid || 'admin'
      };

      if (editingChallenge.id) {
        await updateChallenge(editingChallenge.id, payload);
        toast.success("Challenge updated successfully!");
      } else {
        await createChallenge(payload);
        toast.success("Challenge created successfully!");
      }

      setShowChallengeModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save challenge.");
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this challenge? This will also remove all its calendar days.")) return;
    try {
      await deleteChallenge(id);
      toast.success("Challenge deleted.");
      if (selectedChallenge?.id === id) {
        setSelectedChallenge(null);
        setActiveTab('challenges');
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete challenge.");
    }
  };

  const handleSelectChallengeForCalendar = async (ch: Challenge) => {
    setSelectedChallenge(ch);
    setActiveTab('calendar');
    setLoading(true);
    try {
      const days = await fetchChallengeDays(ch.id);
      setChallengeDays(days);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load days for challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDayModal = (dayNumber: number, existingDay?: ChallengeDay) => {
    if (!selectedChallenge) return;
    if (existingDay) {
      setEditingDay(existingDay);
    } else {
      setEditingDay({
        challengeId: selectedChallenge.id,
        dayNumber,
        title: `Day ${dayNumber}: Topic Title`,
        description: '',
        lessonContent: '',
        revisionMaterial: '',
        questionIds: [],
        assignmentId: ''
      });
    }
    setShowDayModal(true);
  };

  const handleSaveDay = async () => {
    if (!selectedChallenge || !editingDay.title) {
      toast.error("Please enter a Day title.");
      return;
    }

    try {
      await saveChallengeDay({
        ...editingDay,
        challengeId: selectedChallenge.id,
        dayNumber: editingDay.dayNumber || 1,
        title: editingDay.title
      });
      toast.success(`Day ${editingDay.dayNumber} saved!`);
      setShowDayModal(false);
      const days = await fetchChallengeDays(selectedChallenge.id);
      setChallengeDays(days);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save day.");
    }
  };

  const handleAutoGenerateDays = async () => {
    if (!selectedChallenge) return;
    if (!window.confirm(`Initialize ${selectedChallenge.duration} blank calendar days for "${selectedChallenge.title}"?`)) return;

    setLoading(true);
    try {
      for (let d = 1; d <= selectedChallenge.duration; d++) {
        await saveChallengeDay({
          challengeId: selectedChallenge.id,
          dayNumber: d,
          title: `Day ${d}: ${selectedChallenge.title} - Module ${d}`,
          description: `Key learning objectives for Day ${d}`,
          lessonContent: `### Day ${d} Core Concepts\n\nStudy guidelines and essential formulas for today's topic.`
        });
      }
      toast.success(`Generated ${selectedChallenge.duration} days successfully!`);
      const days = await fetchChallengeDays(selectedChallenge.id);
      setChallengeDays(days);
    } catch (err) {
      console.error(err);
      toast.error("Failed to auto-generate days.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubjectSelect = (sub: string) => {
    const current = editingChallenge.subjects || [];
    if (current.includes(sub)) {
      if (current.length === 1) {
        toast.error("A challenge must have at least one subject.");
        return;
      }
      setEditingChallenge({ ...editingChallenge, subjects: current.filter(s => s !== sub) });
    } else {
      setEditingChallenge({ ...editingChallenge, subjects: [...current, sub] });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/admin')}
                className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shrink-0"
                title="Back to Admin Dashboard"
              >
                <LayoutDashboard size={20} />
              </Button>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Trophy className="text-indigo-600" />
                Study Challenges & Calendar Builder
              </h1>
            </div>
            <p className="text-slate-500 font-medium mt-1">Create, manage, and design dynamic learning challenges for students.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => handleOpenChallengeModal()} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2"
            >
              <Plus size={18} />
              New Study Challenge
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-8">
          <button
            onClick={() => setActiveTab('challenges')}
            className={cn(
              "pb-4 font-black text-sm tracking-wide transition-all border-b-2 flex items-center gap-2",
              activeTab === 'challenges' 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Layers size={18} />
            All Challenges ({challenges.length})
          </button>

          {selectedChallenge && (
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                "pb-4 font-black text-sm tracking-wide transition-all border-b-2 flex items-center gap-2",
                activeTab === 'calendar' 
                  ? "border-indigo-600 text-indigo-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <CalendarIcon size={18} />
              Calendar Builder: {selectedChallenge.title} ({selectedChallenge.duration} Days)
            </button>
          )}
        </div>

        {/* TAB 1: CHALLENGES LIST */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-bold">Loading challenges...</div>
            ) : challenges.length === 0 ? (
              <Card className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Trophy size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">No Study Challenges Found</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Create your first custom challenge (7, 14, 30, 60, or 90 days) for students.</p>
                </div>
                <Button onClick={() => handleOpenChallengeModal()} className="bg-indigo-600 text-white">
                  Create First Challenge
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((ch) => (
                  <Card key={ch.id} className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold">
                          {ch.level}
                        </Badge>
                        <Badge 
                          className={cn(
                            "font-bold uppercase text-[10px] tracking-wider",
                            ch.status === 'published' ? "bg-emerald-100 text-emerald-800" :
                            ch.status === 'draft' ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-600"
                          )}
                        >
                          {ch.status}
                        </Badge>
                      </div>

                      {ch.image && (
                        <img 
                          src={ch.image} 
                          alt={ch.title} 
                          className="w-full h-36 object-cover rounded-2xl mb-4 border border-slate-100" 
                        />
                      )}

                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {ch.title}
                      </h3>
                      <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-4">
                        {ch.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {ch.subjects.map((sub, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-600">
                        <span className="text-indigo-600 font-black">{ch.duration}</span> Days Duration
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectChallengeForCalendar(ch)}
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                          title="Open Calendar Builder"
                        >
                          <CalendarIcon size={14} className="mr-1" />
                          Calendar
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenChallengeModal(ch)}
                          className="text-slate-500 hover:text-indigo-600"
                          title="Edit Challenge"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteChallenge(ch.id)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Delete Challenge"
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

        {/* TAB 2: CALENDAR BUILDER FOR SELECTED CHALLENGE */}
        {activeTab === 'calendar' && selectedChallenge && (
          <div className="space-y-6">
            <div className="p-6 bg-indigo-900 text-white rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-amber-400 text-amber-950 font-black">{selectedChallenge.level}</Badge>
                  <Badge className="bg-white/20 text-white">{selectedChallenge.duration} Days Program</Badge>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{selectedChallenge.title}</h2>
                <p className="text-indigo-200 text-sm font-medium mt-1 max-w-2xl">{selectedChallenge.description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAutoGenerateDays} 
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20"
                >
                  <Sparkles size={16} className="mr-2 text-amber-300" />
                  Auto-Initialize All {selectedChallenge.duration} Days
                </Button>
                <Button 
                  onClick={() => setActiveTab('challenges')} 
                  variant="secondary"
                  className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Challenges
                </Button>
              </div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: selectedChallenge.duration }).map((_, idx) => {
                const dayNum = idx + 1;
                const existingDay = challengeDays.find(d => d.dayNumber === dayNum);

                return (
                  <motion.div
                    key={dayNum}
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenDayModal(dayNum, existingDay)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer min-h-[120px]",
                      existingDay 
                        ? "bg-white border-indigo-200 hover:border-indigo-600 shadow-sm" 
                        : "bg-slate-50 border-dashed border-slate-200 hover:border-indigo-300 text-slate-400"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Day {dayNum}
                      </span>
                      {existingDay ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Plus size={16} className="text-slate-300" />
                      )}
                    </div>

                    <div className="my-2">
                      <h4 className="text-xs font-black text-slate-900 line-clamp-2">
                        {existingDay ? existingDay.title : "Not Configured"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                      {existingDay?.lessonContent && <BookOpen size={12} className="text-indigo-500" />}
                      {existingDay?.revisionMaterial && <FileText size={12} className="text-emerald-500" />}
                      {existingDay?.questionIds && existingDay.questionIds.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-black">
                          {existingDay.questionIds.length} Qs
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* CREATE / EDIT CHALLENGE MODAL */}
        <Dialog open={showChallengeModal} onOpenChange={setShowChallengeModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                {editingChallenge.id ? 'Edit Study Challenge' : 'Create New Study Challenge'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Set challenge title, level, target subjects, and custom duration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Challenge Title *</label>
                <input 
                  type="text"
                  value={editingChallenge.title || ''}
                  onChange={e => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                  placeholder="e.g., 30-Day Master O-Level Computer Science"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Description *</label>
                <textarea 
                  rows={3}
                  value={editingChallenge.description || ''}
                  onChange={e => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                  placeholder="Comprehensive learning roadmap for students..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Cover Image URL (Optional)</label>
                <input 
                  type="text"
                  value={editingChallenge.image || ''}
                  onChange={e => setEditingChallenge({ ...editingChallenge, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Level & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Education Level</label>
                  <select
                    value={editingChallenge.level || 'Ordinary Level'}
                    onChange={e => setEditingChallenge({ ...editingChallenge, level: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Ordinary Level">Ordinary Level (O-Level)</option>
                    <option value="Advanced Level">Advanced Level (A-Level)</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Publish Status</label>
                  <select
                    value={editingChallenge.status || 'draft'}
                    onChange={e => setEditingChallenge({ ...editingChallenge, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="draft">Draft (Hidden from students)</option>
                    <option value="published">Published (Visible to students)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Duration selection */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Duration (Days)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDurationPreset(d);
                        setEditingChallenge({ ...editingChallenge, duration: d });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        durationPreset === d 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {d} Days
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDurationPreset('custom')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      durationPreset === 'custom' 
                        ? "bg-indigo-600 text-white border-indigo-600" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    Custom Days
                  </button>
                </div>

                {durationPreset === 'custom' && (
                  <input 
                    type="number"
                    min={1}
                    max={365}
                    value={customDuration}
                    onChange={e => {
                      const val = Math.max(1, Number(e.target.value));
                      setCustomDuration(val);
                      setEditingChallenge({ ...editingChallenge, duration: val });
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    placeholder="Enter custom duration (e.g. 45)"
                  />
                )}
              </div>

              {/* Target Subjects Selection */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Target Subjects</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {standardSubjects.map((sub) => {
                    const isSelected = (editingChallenge.subjects || []).includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubjectSelect(sub)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          isSelected 
                            ? "bg-indigo-600 text-white border-indigo-600" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChallengeModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChallenge} className="bg-indigo-600 text-white font-bold">
                Save Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DAY EDITING MODAL */}
        <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                Configure Day {editingDay.dayNumber}: {editingDay.title || ''}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Add lesson topics, detailed reading content, revision material URLs, practice questions, or quiz IDs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Day Topic / Title *</label>
                <input 
                  type="text"
                  value={editingDay.title || ''}
                  onChange={e => setEditingDay({ ...editingDay, title: e.target.value })}
                  placeholder="e.g. Binary Arithmetic & Logic Gates"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Lesson Content (Markdown Supported)</label>
                <textarea 
                  rows={6}
                  value={editingDay.lessonContent || ''}
                  onChange={e => setEditingDay({ ...editingDay, lessonContent: e.target.value })}
                  placeholder="Enter detailed note summaries, formulas, or key definitions for today..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Revision Material (URL or Text)</label>
                <input 
                  type="text"
                  value={editingDay.revisionMaterial || ''}
                  onChange={e => setEditingDay({ ...editingDay, revisionMaterial: e.target.value })}
                  placeholder="https://drive.google.com/... or summary notes link"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Attach Question IDs */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Attach Practice Questions ({editingDay.questionIds?.length || 0} Selected)</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50">
                  {questionsBank.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 font-bold">No exam questions found in bank.</p>
                  ) : (
                    questionsBank.map((q) => {
                      const isAttached = (editingDay.questionIds || []).includes(q.id);
                      return (
                        <div 
                          key={q.id}
                          onClick={() => {
                            const current = editingDay.questionIds || [];
                            const updated = isAttached ? current.filter(id => id !== q.id) : [...current, q.id];
                            setEditingDay({ ...editingDay, questionIds: updated });
                          }}
                          className={cn(
                            "p-3 flex items-center justify-between cursor-pointer text-xs font-medium transition-colors",
                            isAttached ? "bg-indigo-50 text-indigo-900" : "hover:bg-white text-slate-700"
                          )}
                        >
                          <div className="flex-1 pr-4">
                            <span className="font-bold text-indigo-600 mr-2">[{q.subject} - {q.paper}]</span>
                            {q.questionText.slice(0, 90)}...
                          </div>
                          {isAttached && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDayModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDay} className="bg-indigo-600 text-white font-bold">
                Save Day Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
