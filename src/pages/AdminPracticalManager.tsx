import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, Eye, CheckCircle2, FlaskConical, Code2, 
  BookOpen, Clock, Award, Search, Filter, Layers, ArrowLeft, Save, 
  Users, BarChart2, Check, FileText
} from 'lucide-react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { 
  PracticalActivity, 
  PracticalType, 
  PracticalSubject, 
  PracticalDifficulty,
  CodingLabLanguage,
  CodingTestCase,
  PracticalAttempt
} from '../types';
import { 
  fetchAllPracticalsForAdmin, 
  savePracticalActivity, 
  deletePracticalActivity,
  fetchAllPracticalSubmissionsForAdmin
} from '../services/practicalService';
import { toast } from 'react-hot-toast';

export default function AdminPracticalManager() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'practicals' | 'submissions' | 'analytics'>('practicals');
  const [practicals, setPracticals] = useState<PracticalActivity[]>([]);
  const [submissions, setSubmissions] = useState<PracticalAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Modal / Form States
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<PracticalSubject>('Computer Science');
  const [level, setLevel] = useState('Advanced Level');
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [difficulty, setDifficulty] = useState<PracticalDifficulty>('Intermediate');
  const [practicalType, setPracticalType] = useState<PracticalType>('coding');
  const [instructions, setInstructions] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(20);

  // Coding Specific Form Fields
  const [codingLang, setCodingLang] = useState<CodingLabLanguage>('python');
  const [starterCode, setStarterCode] = useState('');
  const [testCases, setTestCases] = useState<CodingTestCase[]>([
    { id: 'tc1', input: '10\n20', expectedOutput: 'SUM: 30', description: 'Basic addition test' }
  ]);

  // Load Admin Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const pracs = await fetchAllPracticalsForAdmin();
    setPracticals(pracs);

    const subs = await fetchAllPracticalSubmissionsForAdmin();
    setSubmissions(subs);

    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSubject('Computer Science');
    setLevel('Advanced Level');
    setTopic('');
    setDurationMinutes(40);
    setDifficulty('Intermediate');
    setPracticalType('coding');
    setInstructions('### Task Objective\nWrite your instructions here...');
    setTotalMarks(20);
    setCodingLang('python');
    setStarterCode('# Write starter template here\n');
    setTestCases([{ id: 'tc1', input: '', expectedOutput: '', description: 'Default Test Case' }]);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (p: PracticalActivity) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setSubject(p.subject);
    setLevel(p.level);
    setTopic(p.topic);
    setDurationMinutes(p.durationMinutes);
    setDifficulty(p.difficulty);
    setPracticalType(p.practicalType);
    setInstructions(p.instructions);
    setTotalMarks(p.totalMarks || 20);
    setCodingLang(p.codingConfig?.language || 'python');
    setStarterCode(p.codingConfig?.starterCode || '');
    setTestCases(p.codingConfig?.testCases || []);
    setShowFormModal(true);
  };

  const handleSavePractical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !instructions) {
      toast.error('Please complete all required fields.');
      return;
    }

    const payload: Partial<PracticalActivity> = {
      id: editingId || undefined,
      title,
      description,
      subject,
      level,
      topic,
      durationMinutes,
      difficulty,
      practicalType,
      instructions,
      totalMarks,
      status: 'published',
      createdBy: user?.uid,
      createdByName: user?.displayName || user?.name || 'Admin',
      codingConfig: practicalType === 'coding' ? {
        language: codingLang,
        starterCode,
        testCases
      } : undefined,
      simulationConfig: practicalType === 'science_simulation' ? {
        simulationType: subject === 'Biology' ? 'biology_microscope' : subject === 'Physics' ? 'physics_ohms_law' : 'chemistry_titration'
      } : undefined
    };

    const id = await savePracticalActivity(payload);
    toast.success(editingId ? 'Practical activity updated!' : 'Practical activity created!');
    setShowFormModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this practical activity?')) {
      await deletePracticalActivity(id);
      toast.success('Practical activity deleted.');
      loadData();
    }
  };

  const addTestCase = () => {
    setTestCases(prev => [
      ...prev,
      { id: `tc_${Date.now()}`, input: '', expectedOutput: '', description: `Test Case ${prev.length + 1}` }
    ]);
  };

  const updateTestCase = (idx: number, field: keyof CodingTestCase, val: string) => {
    setTestCases(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const removeTestCase = (idx: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== idx));
  };

  const filteredPracticals = practicals.filter(p => {
    const matchesSubject = selectedSubject === 'All' || p.subject === selectedSubject;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <ModernDashboardLayout role="admin" activeTab="lab-all">
      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* Top Admin Header */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <FlaskConical className="w-4 h-4 text-blue-400" />
              <span>Admin & Teacher Practical Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Virtual Practical Lab Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, edit, manage automated coding test cases, simulation presets, and grade student lab reports.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Practical</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('practicals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'practicals' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Practicals Directory ({practicals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'submissions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Submissions ({submissions.length})</span>
          </button>
        </div>

        {/* 1. PRACTICALS DIRECTORY TAB */}
        {activeTab === 'practicals' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter practicals..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {['All', 'Computer Science', 'ICT', 'Physics', 'Chemistry', 'Biology'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedSubject === subj
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* List Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <th className="p-3">Title & Subject</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Level & Duration</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPracticals.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <p className="font-bold text-white text-sm">{p.title}</p>
                        <p className="text-[11px] text-slate-400">{p.subject} | {p.topic}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-mono">
                          {p.practicalType}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {p.level} ({p.durationMinutes} mins)
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {p.totalMarks || 20} Marks
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                            title="Edit Practical"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded text-xs"
                            title="Delete Practical"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Student Submitted Reports</h3>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Practical Activity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Score & Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {submissions.length > 0 ? (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <p className="font-bold text-white">{sub.userName || 'Student'}</p>
                          <p className="text-[11px] text-slate-400">{sub.userEmail}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">
                          {sub.practicalTitle}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono uppercase">
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">
                          {sub.score} / {sub.maxScore || 100} (Grade {sub.grade})
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        No submissions received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CREATE / EDIT PRACTICAL MODAL */}
        {showFormModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'Edit Practical Activity' : 'Create New Practical Activity'}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  Close [X]
                </button>
              </div>

              <form onSubmit={handleSavePractical} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Title:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Subject:</label>
                    <select
                      value={subject}
                      onChange={(e: any) => setSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="ICT">ICT</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Level:</label>
                    <input
                      type="text"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Practical Type:</label>
                    <select
                      value={practicalType}
                      onChange={(e: any) => setPracticalType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                    >
                      <option value="coding">Coding Laboratory</option>
                      <option value="science_simulation">Science Simulation</option>
                      <option value="step_by_step">Step-by-step Task</option>
                      <option value="practical_assignment">Practical Assignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Total Marks:</label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Topic / Syllabus Module:</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Data Structures, Chemical Titration..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Instructions (Markdown):</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  />
                </div>

                {/* Coding Configuration Section */}
                {practicalType === 'coding' && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                      Automated Coding Test Harness Configuration
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Primary Language:</label>
                        <select
                          value={codingLang}
                          onChange={(e: any) => setCodingLang(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                        >
                          <option value="python">Python</option>
                          <option value="c">C</option>
                          <option value="cpp">C++</option>
                          <option value="javascript">JavaScript</option>
                          <option value="html">HTML/CSS</option>
                          <option value="sql">SQL</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Starter Code Template:</label>
                      <textarea
                        value={starterCode}
                        onChange={(e) => setStarterCode(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono text-xs outline-none"
                      />
                    </div>

                    {/* Test Cases List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">Automated Test Cases ({testCases.length})</span>
                        <button
                          type="button"
                          onClick={addTestCase}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-bold"
                        >
                          + Add Test Case
                        </button>
                      </div>

                      {testCases.map((tc, idx) => (
                        <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={tc.description || ''}
                              onChange={(e) => updateTestCase(idx, 'description', e.target.value)}
                              placeholder="Test case description"
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => removeTestCase(idx)}
                              className="text-red-400 text-xs font-mono hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div>
                              <label className="text-slate-400 block">Input Stdin:</label>
                              <textarea
                                value={tc.input}
                                onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-emerald-400"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block">Expected Stdout Output:</label>
                              <textarea
                                value={tc.expectedOutput}
                                onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-amber-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider"
                  >
                    Save Practical Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
