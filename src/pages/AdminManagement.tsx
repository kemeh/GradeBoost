import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  BookOpen, Save, X, AlertCircle, CheckCircle2,
  FileText, Calendar, Link as LinkIcon, Eye, EyeOff,
  Upload, Loader2, FileUp, RefreshCw
} from 'lucide-react';
import { db, storage } from '../firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, 
  doc, onSnapshot, query, orderBy, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { 
  Button, Card, Badge, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent, Progress
} from '../components/ui';
import { Resource, Assignment, Subject } from '../types';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export default function AdminManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resources');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Resources State
  const [resources, setResources] = useState<Resource[]>([]);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'PDF' as 'PDF' | 'Video' | 'Link',
    subject: 'Computer Science' as Subject,
    fileUrl: '',
    fileSize: '',
    visible: true
  });

  // Assignments State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    paper: 'Paper 1',
    subject: 'Computer Science' as Subject,
    dueDate: '',
    link: '',
    active: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const unsubResources = onSnapshot(
      query(collection(db, 'resources'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'resources');
        } catch (e) {
          console.error("AdminManagement Resources Error:", e);
        }
      }
    );

    const unsubAssignments = onSnapshot(
      query(collection(db, 'assignments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'assignments');
        } catch (e) {
          console.error("AdminManagement Assignments Error:", e);
        }
      }
    );

    setLoading(false);
    return () => {
      unsubResources();
      unsubAssignments();
    };
  }, [user, navigate]);

  // Resource Handlers
  const handleOpenResourceDialog = (resource: Resource | null = null) => {
    if (resource) {
      setEditingResource(resource);
      setResourceForm({
        title: resource.title,
        type: resource.type,
        subject: resource.subject,
        fileUrl: resource.fileUrl,
        fileSize: resource.fileSize,
        visible: resource.visible
      });
    } else {
      setEditingResource(null);
      setResourceForm({
        title: '',
        type: 'PDF',
        subject: 'Computer Science',
        fileUrl: '',
        fileSize: '',
        visible: true
      });
    }
    setIsResourceDialogOpen(true);
  };

  const handleSaveResource = async () => {
    if (!resourceForm.title || !resourceForm.fileUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingResource) {
        await updateDoc(doc(db, 'resources', editingResource.id), {
          ...resourceForm,
          updatedAt: serverTimestamp()
        });
        toast.success('Resource updated');
      } else {
        await addDoc(collection(db, 'resources'), {
          ...resourceForm,
          createdAt: serverTimestamp()
        });
        toast.success('Resource added');
      }
      setIsResourceDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingResource ? OperationType.UPDATE : OperationType.CREATE, 'resources');
      toast.error('Failed to save resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteDoc(doc(db, 'resources', id));
      toast.success('Resource deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `resources/${id}`);
      toast.error('Failed to delete');
    }
  };

  const handleToggleResourceVisibility = async (resource: Resource) => {
    try {
      await updateDoc(doc(db, 'resources', resource.id), {
        visible: !resource.visible
      });
      toast.success(`Resource ${!resource.visible ? 'visible' : 'hidden'}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `resources/${resource.id}`);
      toast.error('Update failed');
    }
  };

  // Assignment Handlers
  const handleOpenAssignmentDialog = (assignment: Assignment | null = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      const date = assignment.dueDate?.toDate ? assignment.dueDate.toDate() : new Date(assignment.dueDate);
      setAssignmentForm({
        title: assignment.title,
        paper: assignment.paper,
        subject: assignment.subject,
        dueDate: date.toISOString().split('T')[0],
        link: assignment.link,
        active: assignment.active
      });
    } else {
      setEditingAssignment(null);
      setAssignmentForm({
        title: '',
        paper: 'Paper 1',
        subject: 'Computer Science',
        dueDate: '',
        link: '',
        active: true
      });
    }
    setIsAssignmentDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.dueDate || !assignmentForm.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        ...assignmentForm,
        dueDate: Timestamp.fromDate(new Date(assignmentForm.dueDate))
      };

      if (editingAssignment) {
        await updateDoc(doc(db, 'assignments', editingAssignment.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
        toast.success('Assignment updated');
      } else {
        await addDoc(collection(db, 'assignments'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Assignment added');
      }
      setIsAssignmentDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingAssignment ? OperationType.UPDATE : OperationType.CREATE, 'assignments');
      toast.error('Failed to save assignment');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteDoc(doc(db, 'assignments', id));
      toast.success('Assignment deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assignments/${id}`);
      toast.error('Failed to delete');
    }
  };

  const handleToggleAssignmentActive = async (assignment: Assignment) => {
    try {
      await updateDoc(doc(db, 'assignments', assignment.id), {
        active: !assignment.active
      });
      toast.success(`Assignment ${!assignment.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignment.id}`);
      toast.error('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Management</h1>
            <p className="text-slate-500 font-medium">Manage student resources and assignments.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsBulkImportOpen(true)}
              className="font-black px-6 py-4 rounded-2xl flex items-center gap-2"
            >
              <FileUp size={20} />
              Bulk Import
            </Button>
            <Button 
              onClick={() => activeTab === 'resources' ? handleOpenResourceDialog() : handleOpenAssignmentDialog()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2"
            >
              <Plus size={20} />
              Add {activeTab === 'resources' ? 'Resource' : 'Assignment'}
            </Button>
          </div>
        </header>

        <Tabs defaultValue="resources" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <TabsTrigger value="resources" className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">Resources</TabsTrigger>
            <TabsTrigger value="assignments" className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resources.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-bold">No resources available yet.</p>
                </div>
              ) : (
                resources.map((res) => (
                  <Card key={res.id} className="p-6 flex flex-col group">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                        {res.subject}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleResourceVisibility(res)}
                          className={cn("p-2 rounded-lg transition-colors", res.visible ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100")}
                        >
                          {res.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => handleOpenResourceDialog(res)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{res.title}</h3>
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                      <Badge variant="secondary" className="text-[10px] font-bold">{res.type}</Badge>
                      <span className="text-[10px] font-bold text-slate-400">{res.fileSize}</span>
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-indigo-600">
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {assignments.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-bold">No assignments available yet.</p>
                </div>
              ) : (
                assignments.map((asgn) => (
                  <Card key={asgn.id} className="p-6 flex flex-col group">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                        {asgn.subject}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleAssignmentActive(asgn)}
                          className={cn("p-2 rounded-lg transition-colors", asgn.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100")}
                        >
                          {asgn.active ? <CheckCircle2 size={16} /> : <X size={16} />}
                        </button>
                        <button onClick={() => handleOpenAssignmentDialog(asgn)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteAssignment(asgn.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{asgn.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{asgn.paper}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">Due: {asgn.dueDate?.toDate ? asgn.dueDate.toDate().toLocaleDateString() : new Date(asgn.dueDate).toLocaleDateString()}</span>
                      </div>
                      <a href={asgn.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                        <LinkIcon size={16} />
                      </a>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Resource Dialog */}
        <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as any })}
                  >
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Link">Link</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={resourceForm.subject}
                    onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value as any })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">File / Link *</label>
                {resourceForm.type === 'PDF' ? (
                  <FileUpload
                    onUploadStart={() => setUploading(true)}
                    onUploadComplete={(url, name, size) => {
                      setResourceForm(prev => ({ ...prev, fileUrl: url, fileSize: size }));
                      setUploading(false);
                    }}
                    onUploadError={() => setUploading(false)}
                    onDelete={() => {
                      setResourceForm(prev => ({ ...prev, fileUrl: '', fileSize: '' }));
                    }}
                    initialUrl={resourceForm.fileUrl}
                    folder="resources"
                    label={resourceForm.fileUrl ? 'Change PDF' : 'Upload PDF'}
                  />
                ) : (
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="https://..."
                    value={resourceForm.fileUrl}
                    onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value })}
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveResource} className="bg-indigo-600 text-white" disabled={uploading}>
                <Save className="mr-2" size={20} />
                {editingResource ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Paper</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="e.g., Paper 1"
                    value={assignmentForm.paper}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, paper: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value as any })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Due Date *</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Assignment Link *</label>
                <input 
                  type="url" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="https://..."
                  value={assignmentForm.link}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, link: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAssignment} className="bg-indigo-600 text-white">
                <Save className="mr-2" size={20} />
                {editingAssignment ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Modal */}
        {isBulkImportOpen && (
          <BulkResourceImportModal 
            onClose={() => setIsBulkImportOpen(false)}
            onImported={() => setIsBulkImportOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

interface BulkResourceImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

function BulkResourceImportModal({ onClose, onImported }: BulkResourceImportModalProps) {
  const [files, setFiles] = useState<{ file: File, progress: number, status: 'idle' | 'uploading' | 'success' | 'error', url?: string, size?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Computer Science');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map(f => ({ file: f, progress: 0, status: 'idle' as const }));
      setFiles(prev => [...prev, ...newFiles]);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (index: number) => {
    const fileData = files[index];
    if (fileData.status === 'success') return;

    setFiles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'uploading', progress: 0 };
      return next;
    });

    return new Promise<void>((resolve, reject) => {
      const storageRef = ref(storage, `resources/${Date.now()}_${fileData.file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, fileData.file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFiles(prev => {
            const next = [...prev];
            next[index] = { ...next[index], progress };
            return next;
          });
        },
        (error) => {
          console.error(`Upload error for ${fileData.file.name}:`, error);
          setFiles(prev => {
            const next = [...prev];
            next[index] = { ...next[index], status: 'error' };
            return next;
          });
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            const size = (fileData.file.size / (1024 * 1024)).toFixed(2) + ' MB';
            
            await addDoc(collection(db, 'resources'), {
              title: fileData.file.name.replace(/\.[^/.]+$/, ""),
              type: 'PDF',
              subject: selectedSubject,
              fileUrl: url,
              fileSize: size,
              visible: true,
              createdAt: serverTimestamp()
            });

            setFiles(prev => {
              const next = [...prev];
              next[index] = { ...next[index], status: 'success', url, size, progress: 100 };
              return next;
            });
            resolve();
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'resources');
            reject(err);
          }
        }
      );
    });
  };

  const handleBulkUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setError('');

    try {
      const uploadPromises = files.map((_, i) => uploadFile(i));
      await Promise.all(uploadPromises);
      toast.success(`Successfully imported ${files.length} resources!`);
      onImported();
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      setError('Some files failed to upload. You can retry failed uploads.');
    } finally {
      setIsUploading(false);
    }
  };

  const retryFailed = async () => {
    setIsUploading(true);
    setError('');
    try {
      const retryPromises = files.map((f, i) => {
        if (f.status === 'error') return uploadFile(i);
        return Promise.resolve();
      });
      await Promise.all(retryPromises);
      if (files.every(f => f.status === 'success')) {
        toast.success(`All resources imported!`);
        onImported();
      }
    } catch (err) {
      setError('Some files still failed. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bulk Import Resources</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Subject</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="ICT">ICT</option>
            </select>
          </div>

          {!isUploading && files.length === 0 && (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center bg-slate-50/50">
              <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium mb-4">Select multiple PDF files to upload at once.</p>
              <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="hidden" 
                id="bulk-resource-files"
              />
              <label 
                htmlFor="bulk-resource-files"
                className="inline-flex items-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
              >
                Select Files
              </label>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {files.map((f, i) => (
                <div key={i} className={cn(
                  "flex flex-col p-4 rounded-2xl border transition-all",
                  f.status === 'error' ? "bg-rose-50 border-rose-100" : 
                  f.status === 'success' ? "bg-emerald-50 border-emerald-100" :
                  "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className={cn(
                        f.status === 'error' ? "text-rose-600" : 
                        f.status === 'success' ? "text-emerald-600" : 
                        "text-indigo-600"
                      )} size={18} />
                      <p className="text-sm font-bold text-slate-900 truncate">{f.file.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {f.status === 'error' && (
                        <button onClick={() => uploadFile(i)} className="p-1 text-rose-600 hover:bg-rose-100 rounded">
                          <RefreshCw size={14} />
                        </button>
                      )}
                      {f.status === 'success' && <CheckCircle2 className="text-emerald-600" size={16} />}
                      {!isUploading && f.status !== 'success' && (
                        <button onClick={() => removeFile(i)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {(f.status === 'uploading' || f.status === 'error' || f.status === 'success') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{f.status === 'error' ? 'Failed' : f.status === 'success' ? 'Complete' : 'Uploading'}</span>
                        <span>{Math.round(f.progress)}%</span>
                      </div>
                      <Progress value={f.progress} className={cn("h-1", f.status === 'error' && "bg-rose-200")} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
            {files.some(f => f.status === 'error') ? (
              <Button 
                onClick={retryFailed} 
                disabled={isUploading}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8"
              >
                {isUploading ? <Loader2 className="animate-spin mr-2" size={18} /> : <RefreshCw className="mr-2" size={18} />}
                Retry Failed
              </Button>
            ) : (
              <Button 
                onClick={handleBulkUpload} 
                disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}
                className="bg-indigo-600 text-white px-8"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Uploading...</span>
                  </div>
                ) : `Upload ${files.filter(f => f.status !== 'success').length} Files`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
