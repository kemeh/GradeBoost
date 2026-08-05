import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, CheckCircle2, UserCheck, Award, Eye, FileText, Search, Sparkles 
} from 'lucide-react';
import { PracticalActivity, PracticalAttempt } from '../../../types';
import { Button, Card } from '../../ui';
import { toast } from 'react-hot-toast';

interface TeacherLabManagerProps {
  practicals: PracticalActivity[];
  userAttempts: PracticalAttempt[];
  onSavePractical: (p: Partial<PracticalActivity>) => Promise<void>;
  lang: 'en' | 'fr';
}

export const TeacherLabManager: React.FC<TeacherLabManagerProps> = ({
  practicals,
  userAttempts,
  onSavePractical,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Practical Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Chemistry');
  const [level, setLevel] = useState('Advanced Level');
  const [instructions, setInstructions] = useState('');

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSavePractical({
        title,
        subject: subject as any,
        level,
        description: `Teacher assigned ${subject} 3D practical experiment.`,
        durationMinutes: 45,
        difficulty: 'Intermediate',
        practicalType: 'science_simulation',
        instructions,
        status: 'published',
        totalMarks: 100
      });
      toast.success('3D Practical assignment created successfully!');
      setShowCreateModal(false);
      setTitle('');
      setInstructions('');
    } catch (err) {
      toast.error('Failed to save assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'assignments' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Lab Assignments ({practicals.length})
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'submissions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Submissions ({userAttempts.length})
          </button>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Create 3D Lab Assignment</span>
        </Button>
      </div>

      {activeTab === 'assignments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practicals.map((p) => (
            <Card key={p.id} className="p-5 bg-slate-900 border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-base">{p.title}</h4>
                  <span className="text-xs text-indigo-400 font-semibold">{p.subject} • {p.level}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Published
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>

              <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-800/80">
                <span>Duration: {p.durationMinutes} mins</span>
                <span>Total Marks: {p.totalMarks || 100}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {userAttempts.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center p-8">No student practical attempts submitted yet.</p>
          ) : (
            userAttempts.map((att) => (
              <div key={att.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-sm">{att.userName} ({att.userEmail})</h5>
                  <p className="text-xs text-slate-400">{att.practicalTitle} • Submitted: {new Date(att.submittedAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-emerald-400">{att.score} / {att.maxScore || 100}</span>
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold">Grade {att.grade}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateAssignment} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Create 3D Lab Assignment</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Assignment Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Volumetric Titration of Standard HCl"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Education Level</label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Instructions & Expected Setup</label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe required equipment and target measurements..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1 border-slate-700">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Save & Publish
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
