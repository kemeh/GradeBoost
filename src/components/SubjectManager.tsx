import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { SubjectModel } from '../types';
import { Plus, Edit2, Trash2, Check, X, BookOpen } from 'lucide-react';
import { Button, Card, Badge, cn } from './ui';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    level: 'Ordinary level' | 'Advance level';
    isActive: boolean;
  }>({
    name: '',
    description: '',
    level: 'Ordinary level',
    isActive: true
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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'subjects', editingId), {
          name: formData.name.trim(),
          description: formData.description.trim(),
          level: formData.level,
          isActive: formData.isActive
        });
        toast.success('Subject updated successfully');
      } else {
        await addDoc(collection(db, 'subjects'), {
          name: formData.name.trim(),
          description: formData.description.trim(),
          level: formData.level,
          isActive: formData.isActive,
          createdAt: serverTimestamp()
        });
        toast.success('Subject added successfully');
      }
      
      setFormData({ name: '', description: '', level: 'Ordinary level', isActive: true });
      setIsAdding(false);
      setEditingId(null);
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
      description: subject.description || '',
      level: subject.level || 'Ordinary level',
      isActive: subject.isActive
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
    setFormData({ name: '', description: '', level: 'Ordinary level', isActive: true });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <Card className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Subjects</h2>
            <p className="text-sm text-slate-500">Add, edit, or remove subjects available in the platform.</p>
          </div>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Subject
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-4">
          <h3 className="font-bold text-slate-900">{editingId ? 'Edit Subject' : 'New Subject'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as 'Ordinary level' | 'Advance level' })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
              >
                <option value="Ordinary level">Ordinary level</option>
                <option value="Advance level">Advance level</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description (Optional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the subject"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all font-medium text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
            <Button type="button" onClick={handleSave} className="flex items-center gap-2">
              <Check size={16} /> Save Subject
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No subjects found. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-slate-900">{subject.name}</h4>
                  {subject.level && (
                    <Badge variant="info" className="text-[10px] uppercase tracking-widest">
                      {subject.level}
                    </Badge>
                  )}
                  <Badge variant={subject.isActive ? 'success' : 'secondary'} className="text-[10px] uppercase tracking-widest">
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {subject.description && (
                  <p className="text-sm text-slate-500">{subject.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(subject)} className="h-8 w-8 p-0">
                  <Edit2 size={14} className="text-slate-600" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(subject.id)} className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
