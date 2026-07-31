import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AcademicLevelModel, AcademicDepartment, SubjectModel, SyllabusTopic } from '../../types';
import { Card, Button, Badge, cn } from '../ui';
import { Layers, FolderKanban, BookOpen, ListTree, Plus, Trash2, Edit3, Save, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SubjectManager from '../SubjectManager';

export default function AdminAcademicHierarchy() {
  const [activeTab, setActiveTab] = useState<'levels' | 'departments' | 'subjects' | 'topics'>('levels');
  const [levels, setLevels] = useState<AcademicLevelModel[]>([]);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [loading, setLoading] = useState(true);


  // Level Modal / Form
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelForm, setLevelForm] = useState({
    name: '',
    code: '',
    description: '',
    passPercentage: 50,
    defaultPapersCount: 3,
  });

  // Department Form
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  // Topic Form
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: '',
    subject: 'Biology',
    level: 'Ordinary level',
    weightage: 15,
    estimatedHours: 4,
    description: '',
  });

  useEffect(() => {
    fetchAllHierarchy();
  }, []);

  const fetchAllHierarchy = async () => {
    setLoading(true);
    const defaultLvls: AcademicLevelModel[] = [
      { id: 'o-level', name: 'Ordinary level', code: 'O-Level', description: 'General Certificate of Education Ordinary Level (Form 1 - Form 5)', passPercentage: 50, defaultPapersCount: 2, isActive: true },
      { id: 'a-level', name: 'Advance level', code: 'A-Level', description: 'General Certificate of Education Advanced Level (Lower & Upper Sixth)', passPercentage: 50, defaultPapersCount: 3, isActive: true },
    ];
    const defaultDepts: AcademicDepartment[] = [
      { id: 'sciences', name: 'Sciences & STEM', code: 'SCI', description: 'Biology, Chemistry, Physics, Mathematics, Computer Science' },
      { id: 'arts', name: 'Arts & Humanities', code: 'ART', description: 'Literature, History, Geography, Philosophy, Religious Studies' },
      { id: 'commercial', name: 'Commercial & Economics', code: 'COM', description: 'Economics, Accounting, Commerce, Management' },
    ];

    try {
      // Levels
      try {
        const lvlSnap = await getDocs(collection(db, 'academic_levels'));
        if (lvlSnap.empty) {
          try {
            for (const l of defaultLvls) {
              await setDoc(doc(db, 'academic_levels', l.id), l);
            }
          } catch (e) {
            console.warn('Could not write default levels to db:', e);
          }
          setLevels(defaultLvls);
        } else {
          setLevels(lvlSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AcademicLevelModel[]);
        }
      } catch (e) {
        console.warn('Could not fetch academic_levels:', e);
        setLevels(defaultLvls);
      }

      // Departments
      try {
        const deptSnap = await getDocs(collection(db, 'academic_departments'));
        if (deptSnap.empty) {
          try {
            for (const d of defaultDepts) {
              await setDoc(doc(db, 'academic_departments', d.id), d);
            }
          } catch (e) {
            console.warn('Could not write default departments to db:', e);
          }
          setDepartments(defaultDepts);
        } else {
          setDepartments(deptSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AcademicDepartment[]);
        }
      } catch (e) {
        console.warn('Could not fetch academic_departments:', e);
        setDepartments(defaultDepts);
      }

      // Subjects
      try {
        const subSnap = await getDocs(collection(db, 'subjects'));
        setSubjects(subSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SubjectModel[]);
      } catch (e) {
        console.warn('Could not fetch subjects:', e);
      }

      // Topics
      try {
        const topSnap = await getDocs(collection(db, 'syllabus_topics'));
        setTopics(topSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SyllabusTopic[]);
      } catch (e) {
        console.warn('Could not fetch syllabus_topics:', e);
      }

    } catch (err) {
      console.error("Error fetching academic hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = levelForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newLevel: AcademicLevelModel = {
        id,
        name: levelForm.name,
        code: levelForm.code || levelForm.name.substring(0, 3).toUpperCase(),
        description: levelForm.description,
        passPercentage: Number(levelForm.passPercentage),
        defaultPapersCount: Number(levelForm.defaultPapersCount),
        isActive: true,
      };
      await setDoc(doc(db, 'academic_levels', id), newLevel);
      toast.success(`Academic level "${levelForm.name}" saved.`);
      setShowLevelModal(false);
      setLevelForm({ name: '', code: '', description: '', passPercentage: 50, defaultPapersCount: 3 });
      fetchAllHierarchy();
    } catch (err) {

      toast.error('Failed to save academic level');
    }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = deptForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newDept: AcademicDepartment = {
        id,
        name: deptForm.name,
        code: deptForm.code || deptForm.name.substring(0, 3).toUpperCase(),
        description: deptForm.description,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'academic_departments', id), newDept);
      toast.success(`Department "${deptForm.name}" saved.`);
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchAllHierarchy();
    } catch (err) {
      toast.error('Failed to save department');
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'syllabus_topics'), {
        title: topicForm.title,
        subject: topicForm.subject,
        level: topicForm.level,
        weightage: Number(topicForm.weightage),
        estimatedHours: Number(topicForm.estimatedHours),
        description: topicForm.description,
        createdAt: serverTimestamp(),
      });
      toast.success(`Syllabus topic "${topicForm.title}" created.`);
      setShowTopicModal(false);
      setTopicForm({ title: '', subject: 'Biology', level: 'Ordinary level', weightage: 15, estimatedHours: 4, description: '' });
      fetchAllHierarchy();
    } catch (err) {
      toast.error('Failed to save topic');
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this level?')) return;
    try {
      await deleteDoc(doc(db, 'academic_levels', id));
      toast.success('Level deleted');
      fetchAllHierarchy();
    } catch (err) {
      toast.error('Failed to delete level');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDoc(doc(db, 'academic_departments', id));
      toast.success('Department deleted');
      fetchAllHierarchy();
    } catch (err) {
      toast.error('Failed to delete department');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      await deleteDoc(doc(db, 'syllabus_topics', id));
      toast.success('Topic deleted');
      fetchAllHierarchy();
    } catch (err) {
      toast.error('Failed to delete topic');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Structure & Curriculum Hierarchy</h2>
          <p className="text-sm font-medium text-slate-500">
            Configure Levels, Departments, GCE Subjects, and Syllabus Topics across the entire platform.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('levels')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'levels' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Layers size={14} /> Levels ({levels.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'departments' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <FolderKanban size={14} /> Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'subjects' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <BookOpen size={14} /> Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'topics' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <ListTree size={14} /> Syllabus Topics ({topics.length})
        </button>
      </div>

      {/* Levels Tab */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowLevelModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Add Academic Level
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levels.map(lvl => (
              <Card key={lvl.id} className="p-6 space-y-4 border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="neutral" className="mb-2 font-mono text-[10px]">{lvl.code}</Badge>
                    <h3 className="text-lg font-black text-slate-900">{lvl.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{lvl.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteLevel(lvl.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Pass Benchmark</span>
                    <span className="text-indigo-600 font-black">{lvl.passPercentage}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Default Papers</span>
                    <span className="text-slate-800 font-black">{lvl.defaultPapersCount} Papers</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowDeptModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Add Department
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map(dept => (
              <Card key={dept.id} className="p-6 space-y-4 border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="neutral" className="mb-2 font-mono text-[10px]">{dept.code}</Badge>
                    <h3 className="text-base font-black text-slate-900">{dept.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{dept.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteDept(dept.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <Card className="p-6">
          <SubjectManager />
        </Card>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowTopicModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Add Syllabus Topic
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            {topics.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">No syllabus topics added yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <th className="p-4 pl-6">Topic Title</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Exam Weightage</th>
                    <th className="p-4">Est. Study Hours</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topics.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-bold text-slate-900 text-sm">{t.title}</td>
                      <td className="p-4 text-xs font-bold text-indigo-600">{t.subject}</td>
                      <td className="p-4 text-xs font-medium text-slate-500">{t.level}</td>
                      <td className="p-4 text-xs font-black text-emerald-600">{t.weightage || 15}%</td>
                      <td className="p-4 text-xs font-bold text-slate-700">{t.estimatedHours || 4} hrs</td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => handleDeleteTopic(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* Modal: Level */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Add Academic Level</h3>
              <button onClick={() => setShowLevelModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveLevel} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Level Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ordinary level" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={levelForm.name}
                  onChange={e => setLevelForm({...levelForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. O-Level" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={levelForm.code}
                  onChange={e => setLevelForm({...levelForm, code: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Pass Mark %</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={levelForm.passPercentage}
                    onChange={e => setLevelForm({...levelForm, passPercentage: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Paper Count</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={levelForm.defaultPapersCount}
                    onChange={e => setLevelForm({...levelForm, defaultPapersCount: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={levelForm.description}
                  onChange={e => setLevelForm({...levelForm, description: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Level</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Department */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Department Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sciences & STEM" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={deptForm.name}
                  onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. SCI" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={deptForm.code}
                  onChange={e => setDeptForm({...deptForm, code: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={deptForm.description}
                  onChange={e => setDeptForm({...deptForm, description: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Department</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Topic */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Add Syllabus Topic</h3>
              <button onClick={() => setShowTopicModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Topic Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Genetics & Inheritance" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={topicForm.title}
                  onChange={e => setTopicForm({...topicForm, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Subject</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={topicForm.subject}
                    onChange={e => setTopicForm({...topicForm, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Level</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={topicForm.level}
                    onChange={e => setTopicForm({...topicForm, level: e.target.value})}
                  >
                    <option value="Ordinary level">Ordinary level</option>
                    <option value="Advance level">Advance level</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Exam Weightage %</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={topicForm.weightage}
                    onChange={e => setTopicForm({...topicForm, weightage: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Est. Hours</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={topicForm.estimatedHours}
                    onChange={e => setTopicForm({...topicForm, estimatedHours: Number(e.target.value)})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Topic</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
