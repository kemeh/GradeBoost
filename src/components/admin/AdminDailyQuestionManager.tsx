import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  Trash2, Edit3, Eye, ShieldCheck, Sparkles, Sliders, 
  BookOpen, Plus, Save, X, Filter, Check, Award
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../ui';
import { 
  fetchDailyGceAdminConfig, 
  saveDailyGceAdminConfig, 
  fetchDailyQuestionsAdminList, 
  updateDailyQuestionStatus 
} from '../../services/dailyGceService';
import { GCE_SUBJECT_STRUCTURES } from '../../server/dailyGceEngine';
import { DailyGceAdminConfig, DailyGceQuestion } from '../../types';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function AdminDailyQuestionManager() {
  const [config, setConfig] = useState<DailyGceAdminConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // Questions Review List
  const [questions, setQuestions] = useState<DailyGceQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Selected Question Modal
  const [selectedQuestion, setSelectedQuestion] = useState<DailyGceQuestion | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<DailyGceQuestion | null>(null);

  const allSubjects = Object.keys(GCE_SUBJECT_STRUCTURES);

  useEffect(() => {
    loadConfig();
    loadQuestions();
  }, [filterDate, filterSubject, filterLevel, filterStatus]);

  async function loadConfig() {
    setLoadingConfig(true);
    try {
      const cfg = await fetchDailyGceAdminConfig();
      setConfig(cfg);
    } catch (e) {
      console.error('Error fetching admin config:', e);
    } finally {
      setLoadingConfig(false);
    }
  }

  async function loadQuestions() {
    setLoadingQuestions(true);
    try {
      const res = await fetchDailyQuestionsAdminList({
        date: filterDate || undefined,
        subject: filterSubject || undefined,
        level: filterLevel || undefined,
        status: filterStatus || undefined
      });
      setQuestions(res.questions || []);
    } catch (e) {
      console.error('Error fetching daily questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  }

  const handleSaveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    try {
      await saveDailyGceAdminConfig(config);
      toast.success('Daily GCE Question Engine configuration saved successfully!');
    } catch (e) {
      toast.error('Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUpdateStatus = async (questionId: string, status: string) => {
    try {
      await updateDailyQuestionStatus(questionId, status);
      toast.success(`Question marked as ${status}`);
      loadQuestions();
      if (selectedQuestion?.questionId === questionId) {
        setSelectedQuestion(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const toggleSubjectActive = (subj: string) => {
    if (!config) return;
    const current = config.activeSubjects || [];
    const updated = current.includes(subj)
      ? current.filter(s => s !== subj)
      : [...current, subj];
    setConfig({ ...config, activeSubjects: updated });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] uppercase font-black">
            ADMINISTRATIVE CONTROL PANEL
          </Badge>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Daily GCE Question Engine Manager
          </h2>
          <p className="text-xs text-slate-300">
            Configure paper rotation, participating subjects, source priorities, and review generated daily examination questions.
          </p>
        </div>

        <Button
          onClick={loadQuestions}
          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loadingQuestions ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Configuration Settings Panel */}
      {config && (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Engine Automation & Rotation Rules
              </h3>
            </div>

            <Button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{savingConfig ? 'Saving...' : 'Save Configuration'}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Global Engine Toggle */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Question Engine</span>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                When enabled, the platform automatically generates or selects daily questions at 00:00 UTC.
              </p>
            </div>

            {/* Auto Publish */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Auto-Publish Questions</span>
                <input
                  type="checkbox"
                  checked={config.autoPublish}
                  onChange={(e) => setConfig({ ...config, autoPublish: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                If disabled, questions remain in 'pending_review' until an administrator approves them.
              </p>
            </div>

            {/* Default Difficulty */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Default Difficulty</span>
              <select
                value={config.defaultDifficulty || 'GCE Standard'}
                onChange={(e) => setConfig({ ...config, defaultDifficulty: e.target.value as any })}
                className="w-full p-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
              >
                <option value="GCE Foundation">GCE Foundation</option>
                <option value="GCE Standard">GCE Standard</option>
                <option value="GCE Challenge">GCE Challenge</option>
              </select>
            </div>
          </div>

          {/* Active Participating Subjects */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Active Participating Subjects ({config.activeSubjects?.length || 0} selected):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {allSubjects.map((subj) => {
                const isSelected = config.activeSubjects?.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubjectActive(subj)}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-950 dark:text-indigo-200"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                    )}
                  >
                    <span>{subj}</span>
                    {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Question Review & Moderation Table */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Daily Questions Registry & Verification ({questions.length})
            </h3>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-1.5 text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg outline-none"
            />

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="p-1.5 text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg outline-none"
            >
              <option value="">All Levels</option>
              <option value="Ordinary Level">Ordinary Level</option>
              <option value="Advanced Level">Advanced Level</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-1.5 text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg outline-none"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending_review">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Subject / Paper</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Source Attribution</th>
                <th className="py-3 px-3">Marks</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {questions.map((q) => (
                <tr key={q.questionId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-mono text-slate-500">{q.date}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {q.subject} <span className="text-slate-500">({q.paper})</span>
                  </td>
                  <td className="py-3 px-3">{q.level}</td>
                  <td className="py-3 px-3">
                    <Badge className={cn(
                      "text-[10px] font-bold",
                      q.sourceType === 'PAST_GCE' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      q.sourceType === 'AI_GENERATED_GCE_STYLE' ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                      "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    )}>
                      {q.sourceType}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-bold">{q.marks} mks</td>
                  <td className="py-3 px-3">
                    <Badge className={cn(
                      "text-[10px] font-bold",
                      q.status === 'published' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      q.status === 'rejected' ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" :
                      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    )}>
                      {q.status || 'published'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedQuestion(q)}
                        className="p-1.5 h-8 text-[11px] rounded-lg"
                        title="View Question Details"
                      >
                        <Eye size={13} />
                      </Button>

                      {q.status !== 'published' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(q.questionId, 'published')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 px-2.5 rounded-lg"
                        >
                          Approve
                        </Button>
                      )}

                      {q.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(q.questionId, 'rejected')}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] h-8 px-2.5 rounded-lg"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No daily questions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Question Details Preview Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {selectedQuestion.subject} — {selectedQuestion.paper}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedQuestion.level} • {selectedQuestion.date} • {selectedQuestion.marks} Marks
                </span>
              </div>
              <button 
                onClick={() => setSelectedQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Question Prompt:</span>
                <div className="prose dark:prose-invert max-w-none text-xs">
                  <ReactMarkdown>{selectedQuestion.questionText}</ReactMarkdown>
                </div>
              </div>

              {selectedQuestion.subparts && selectedQuestion.subparts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Subparts:</span>
                  {selectedQuestion.subparts.map(sp => (
                    <div key={sp.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <strong>{sp.label}</strong> {sp.text} <Badge className="text-[9px] ml-2">[{sp.marks} mks]</Badge>
                    </div>
                  ))}
                </div>
              )}

              {selectedQuestion.modelAnswer && (
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                    Model Solution & Marking Guide:
                  </span>
                  <p className="text-emerald-900 dark:text-emerald-200 font-medium">
                    {selectedQuestion.modelAnswer.expectedAnswer}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button 
                variant="outline"
                onClick={() => setSelectedQuestion(null)}
                className="text-xs font-bold rounded-xl"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
