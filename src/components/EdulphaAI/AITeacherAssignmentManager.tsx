import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  UserCheck, 
  AlertCircle, 
  ShieldCheck, 
  BookOpen, 
  Sliders, 
  Clock, 
  Save, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { AITeacherAssignment, ProgressionSheet } from '../../types';
import { 
  fetchAITeacherAssignments, 
  saveAITeacherAssignment, 
  fetchProgressionSheets 
} from '../../services/aiTeacherService';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

interface AITeacherAssignmentManagerProps {
  currentUserId: string;
}

export const AITeacherAssignmentManager: React.FC<AITeacherAssignmentManagerProps> = ({
  currentUserId
}) => {
  const [assignments, setAssignments] = useState<AITeacherAssignment[]>([]);
  const [coverageMap, setCoverageMap] = useState<Record<string, { hasHumanTeacher: boolean; teachers: string[] }>>({});
  const [progressionSheets, setProgressionSheets] = useState<ProgressionSheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  useEffect(() => {
    loadData();
  }, [selectedSubject, selectedLevel]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignData, sheetsData] = await Promise.all([
        fetchAITeacherAssignments(selectedSubject, selectedLevel),
        fetchProgressionSheets()
      ]);

      setAssignments(assignData.assignments);
      setCoverageMap(assignData.humanTeacherCoverage);
      setProgressionSheets(sheetsData);
    } catch (err) {
      console.error('Error loading AI teacher assignments:', err);
      toast.error('Failed to load teacher coverage data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignmentField = (
    subject: string, 
    classLevel: string, 
    field: keyof AITeacherAssignment, 
    value: any
  ) => {
    setAssignments(prev => prev.map(a => {
      if (a.subject === subject && a.classLevel === classLevel) {
        return { ...a, [field]: value };
      }
      return a;
    }));
  };

  const handleSaveAssignment = async (assignment: AITeacherAssignment) => {
    const key = `${assignment.subject}_${assignment.classLevel}`;
    setIsSaving(prev => ({ ...prev, [key]: true }));

    try {
      await saveAITeacherAssignment({
        ...assignment,
        updatedBy: currentUserId
      });
      toast.success(`AI Teacher settings saved for ${assignment.subject} (${assignment.classLevel})!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save assignment');
    } finally {
      setIsSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (selectedSubject !== 'All' && a.subject !== selectedSubject) return false;
    if (selectedLevel !== 'All' && a.classLevel !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0 w-full">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md shrink-0">
            <Users size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">AI Teacher Coverage & Assignment</h2>
              <Badge variant="indigo" className="text-[10px]">Academic Staffing Matrix</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign AI teachers to classes, activate autonomous AI-Only fallback for subjects with no human teacher, and control curriculum pacing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="ICT">ICT</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
          </select>

          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Levels</option>
            <option value="Ordinary Level">Ordinary Level</option>
            <option value="Advanced Level">Advanced Level</option>
          </select>
        </div>
      </div>

      {/* Human Teacher Override Guarantee Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl text-white border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-white">Human Teacher Override Priority Guaranteed</h4>
            <p className="text-[11px] text-indigo-200">
              When a human teacher is assigned, they retain complete authority over topic pacing, week advancement, and instructional overrides.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-[10px] font-bold shrink-0">
          MINESEC / GCE Compliant
        </span>
      </div>

      {/* Assignments Matrix */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading staffing matrix...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <p className="text-sm font-bold">No subject assignments found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(assign => {
            const key = `${assign.subject}_${assign.classLevel}`;
            const coverage = coverageMap[assign.subject];
            const hasHuman = coverage?.hasHumanTeacher || !!assign.assignedHumanTeacherId;
            const saving = isSaving[key];

            // Filter approved progression sheets for this subject
            const eligibleSheets = progressionSheets.filter(
              s => s.subject === assign.subject && (s.classLevel === assign.classLevel || s.approvalStatus === 'APPROVED')
            );

            return (
              <Card key={key} className="p-5 md:p-6 space-y-5 border-slate-200 hover:border-slate-300 transition-all">
                {/* Top Row: Subject Info & Coverage Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{assign.subject}</h3>
                      <Badge variant="indigo">{assign.classLevel}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">Academic Year 2025/2026</span>
                  </div>

                  {/* Coverage Status Badge */}
                  <div>
                    {hasHuman ? (
                      <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <UserCheck size={16} className="text-emerald-600" />
                        <span>Human Teacher: {coverage?.teachers?.join(', ') || 'Assigned'}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Sparkles size={16} className="text-amber-600 animate-pulse" />
                        <span>No Human Teacher Found — AI-Only Active Fallback</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Teaching Mode</label>
                    <select
                      value={assign.mode}
                      onChange={e => handleUpdateAssignmentField(assign.subject, assign.classLevel, 'mode', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="AI_ONLY">AI-Only Teacher (Autonomous)</option>
                      <option value="AI_HUMAN_COMBINED">AI + Human Combined</option>
                      <option value="AI_ASSISTANT">AI Assistant (Student-Led)</option>
                    </select>
                  </div>

                  {/* Progression Sheet Selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Progression Sheet</label>
                    <select
                      value={assign.progressionSheetId || ''}
                      onChange={e => handleUpdateAssignmentField(assign.subject, assign.classLevel, 'progressionSheetId', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="">Curriculum Fallback (No Sheet)</option>
                      {eligibleSheets.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.approvalStatus})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Target Week */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Class Pacing (Current Week)</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={assign.currentWeek || 1}
                        onChange={e => handleUpdateAssignmentField(assign.subject, assign.classLevel, 'currentWeek', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Teaching Style */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Pedagogical Style</label>
                    <select
                      value={assign.pedagogicalStyle || 'Socratic'}
                      onChange={e => handleUpdateAssignmentField(assign.subject, assign.classLevel, 'pedagogicalStyle', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="Socratic">Socratic (Question & Guide)</option>
                      <option value="Direct">Direct Instruction (Lecture)</option>
                      <option value="Interactive">Interactive & Practice First</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Row: Practical Lab toggle and Save Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={assign.virtualLabEnabled ?? true}
                        onChange={e => handleUpdateAssignmentField(assign.subject, assign.classLevel, 'virtualLabEnabled', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Enable Virtual Practical Labs</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={assign.autonomousProgression ?? true}
                        onChange={e => handleUpdateAssignmentField(assign.subject, assign.classLevel, 'autonomousProgression', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Auto-Advance to Next Week Upon Mastery</span>
                    </label>
                  </div>

                  <Button
                    onClick={() => handleSaveAssignment(assign)}
                    disabled={saving}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl gap-1.5 shrink-0"
                  >
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
