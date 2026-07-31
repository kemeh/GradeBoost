import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { SubjectModel, PaperConfig } from '../types';
import { Plus, Edit2, Trash2, Check, X, BookOpen, Layers, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { Button, Card, Badge, cn } from './ui';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { seedDefaultGceSubjects } from '../data/defaultSubjects';

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'All' | 'Ordinary level' | 'Advance level'>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    level: 'Ordinary level' | 'Advance level';
    category: 'Science & Technology' | 'Arts & Humanities' | 'Business & Commercial' | 'Home Economics' | 'Science' | 'Arts';
    isActive: boolean;
    papers: PaperConfig[];
  }>({
    name: '',
    code: '',
    description: '',
    level: 'Ordinary level',
    category: 'Science & Technology',
    isActive: true,
    papers: [
      { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90 },
      { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120 }
    ]
  });

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubjectModel[];

      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      const added = await seedDefaultGceSubjects(db);
      if (added > 0) {
        toast.success(`Seeded ${added} official Cameroon GCE subjects!`);
      } else {
        toast.success('All official Cameroon GCE subjects are already present.');
      }
      fetchSubjects();
    } catch (error) {
      console.error('Error seeding GCE subjects:', error);
      toast.error('Failed to seed subjects.');
    } finally {
      setSeeding(false);
    }
  };

  const handleAddPaper = () => {
    const nextIndex = formData.papers.length + 1;
    const newPaper: PaperConfig = {
      id: `paper${nextIndex}`,
      name: `Paper ${nextIndex}`,
      type: 'Theory',
      totalMarks: 100,
      durationMinutes: 120
    };
    setFormData(prev => ({ ...prev, papers: [...prev.papers, newPaper] }));
  };

  const handleRemovePaper = (index: number) => {
    if (formData.papers.length <= 1) {
      toast.error('A subject must have at least one paper.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      papers: prev.papers.filter((_, idx) => idx !== index)
    }));
  };

  const handlePaperChange = (index: number, field: keyof PaperConfig, value: any) => {
    setFormData(prev => {
      const updated = [...prev.papers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, papers: updated };
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (formData.papers.length === 0) {
      toast.error('At least one paper must be defined for this subject.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        level: formData.level,
        category: formData.category,
        isActive: formData.isActive,
        papers: formData.papers
      };

      if (editingId) {
        await updateDoc(doc(db, 'subjects', editingId), payload);
        toast.success('Subject updated successfully');
      } else {
        await addDoc(collection(db, 'subjects'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success('Subject added successfully');
      }
      
      cancelEdit();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject');
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'subjects');
    }
  };

  const handleEdit = (subject: SubjectModel) => {
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      level: (subject.level as 'Ordinary level' | 'Advance level') || 'Ordinary level',
      category: (subject.category as any) || (subject.level === 'Advance level' ? 'Science' : 'Science & Technology'),
      isActive: subject.isActive !== false,
      papers: subject.papers && subject.papers.length > 0 ? subject.papers : [
        { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90 },
        { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120 }
      ]
    });
    setEditingId(subject.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await deleteDoc(doc(db, 'subjects', id));
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
      handleFirestoreError(error, OperationType.DELETE, `subjects/${id}`);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      level: 'Ordinary level',
      category: 'Science & Technology',
      isActive: true,
      papers: [
        { id: 'paper1', name: 'Paper 1 (MCQ)', type: 'MCQ', totalMarks: 50, durationMinutes: 90 },
        { id: 'paper2', name: 'Paper 2 (Theory)', type: 'Theory', totalMarks: 100, durationMinutes: 120 }
      ]
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const filteredSubjects = subjects.filter(sub => {
    if (selectedLevelFilter !== 'All' && sub.level !== selectedLevelFilter) return false;
    if (selectedCategoryFilter !== 'All' && sub.category !== selectedCategoryFilter) return false;
    return true;
  });

  return (
    <Card className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dynamic Subject & Paper Manager</h2>
            <p className="text-sm text-slate-500">Configure subjects and their GCE Board syllabus paper structures dynamically.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <Sparkles size={16} className={cn(seeding && "animate-spin")} />
            {seeding ? 'Seeding...' : 'Seed Default GCE Syllabus'}
          </Button>

          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
              <Plus size={16} /> Add Custom Subject
            </Button>
          )}
        </div>
      </div>

      {/* Form Area */}
      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Subject & Papers' : 'New Custom Subject'}</h3>
            <Badge variant="secondary">{formData.papers.length} Papers Configured</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject Code (Optional)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. 0595 or 0795"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  level: e.target.value as 'Ordinary level' | 'Advance level',
                  category: e.target.value === 'Advance level' ? 'Science' : 'Science & Technology'
                })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 font-medium text-sm"
              >
                <option value="Ordinary level">Ordinary level (O-Level)</option>
                <option value="Advance level">Advance level (A-Level)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 font-medium text-sm"
              >
                {formData.level === 'Ordinary level' ? (
                  <>
                    <option value="Science & Technology">Science & Technology</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Business & Commercial">Business & Commercial</option>
                    <option value="Home Economics">Home Economics</option>
                  </>
                ) : (
                  <>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 font-medium text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Syllabus overview or description"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 font-medium text-sm"
              />
            </div>
          </div>

          {/* Paper Structure Configurator */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers size={16} className="text-indigo-600" /> Paper Structure Definition
                </h4>
                <p className="text-xs text-slate-500">Define the exact papers available for this subject (e.g. Paper 1, Paper 2, Paper 3).</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddPaper} className="flex items-center gap-1 text-xs">
                <Plus size={14} /> Add Paper
              </Button>
            </div>

            <div className="space-y-3">
              {formData.papers.map((paper, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Paper ID</label>
                    <input
                      type="text"
                      value={paper.id}
                      onChange={(e) => handlePaperChange(idx, 'id', e.target.value)}
                      placeholder="e.g. paper1"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Paper Title</label>
                    <input
                      type="text"
                      value={paper.name}
                      onChange={(e) => handlePaperChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Paper 1 (MCQ)"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Type</label>
                    <select
                      value={paper.type}
                      onChange={(e) => handlePaperChange(idx, 'type', e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Structured">Structured</option>
                      <option value="Essay">Essay</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Total Marks</label>
                    <input
                      type="number"
                      value={paper.totalMarks || 100}
                      onChange={(e) => handlePaperChange(idx, 'totalMarks', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      value={paper.durationMinutes || 90}
                      onChange={(e) => handlePaperChange(idx, 'durationMinutes', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePaper(idx)}
                    className="mt-4 md:mt-0 p-2 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
            <Button type="button" onClick={handleSave} className="flex items-center gap-2">
              <Check size={16} /> Save Subject & Papers
            </Button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {(['All', 'Ordinary level', 'Advance level'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevelFilter(lvl)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedLevelFilter === lvl
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {lvl === 'All' ? 'All Levels' : lvl === 'Ordinary level' ? 'O-Level' : 'A-Level'}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </div>
      </div>

      {/* List Area */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading subjects database...</div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
          <p className="text-slate-500 font-medium">No subjects found matching the filter.</p>
          <Button variant="outline" size="sm" onClick={handleSeedDefaults}>Seed Default GCE Subjects</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm">
                    {subject.code || subject.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-lg">{subject.name}</h4>
                      {subject.level && (
                        <Badge variant={subject.level === 'Advance level' ? 'primary' : 'info'} className="text-[10px] uppercase tracking-widest">
                          {subject.level === 'Advance level' ? 'A-Level' : 'O-Level'}
                        </Badge>
                      )}
                      {subject.category && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
                          {subject.category}
                        </Badge>
                      )}
                      <Badge variant={subject.isActive !== false ? 'success' : 'secondary'} className="text-[10px] uppercase tracking-widest">
                        {subject.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {subject.description && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{subject.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(subject)} className="h-9 px-3 flex items-center gap-1.5 text-xs">
                    <Edit2 size={14} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(subject.id)} className="h-9 w-9 p-0 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Display Papers Badge Row */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Papers:</span>
                {subject.papers && subject.papers.length > 0 ? (
                  subject.papers.map((p, pIdx) => (
                    <div key={pIdx} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 shrink-0">
                      <FileText size={12} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-700">{p.name}</span>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase">{p.type}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">Standard Paper 1 & Paper 2</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
