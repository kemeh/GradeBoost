import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  BookOpen, Save, X, AlertCircle, CheckCircle2,
  FileText, Calendar, Link as LinkIcon, Eye, EyeOff,
  Upload, Loader2, FileUp
} from 'lucide-react';
import { db, storage } from '../firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, 
  doc, onSnapshot, query, orderBy, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Button, Card, Badge, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent
} from '../components/ui';
import { Resource, Assignment, Subject } from '../types';
import { toast } from 'react-hot-toast';

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
      }
    );

    const unsubAssignments = onSnapshot(
      query(collection(db, 'assignments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
          setUploading(false);
        }, 
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
          setResourceForm(prev => ({ ...prev, fileUrl: url, fileSize: size }));
          setUploadProgress(0);
          setUploading(false);
          toast.success('File uploaded successfully');
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploading(false);
    }
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
      toast.error('Failed to save resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteDoc(doc(db, 'resources', id));
      toast.success('Resource deleted');
    } catch (error) {
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
      toast.error('Failed to save assignment');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteDoc(doc(db, 'assignments', id));
      toast.success('Assignment deleted');
    } catch (error) {
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
              {resources.map((res) => (
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {assignments.map((asgn) => (
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
              ))}
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
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed border-2 py-8 flex flex-col gap-2"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {uploadProgress < 100 ? `Uploading ${Math.round(uploadProgress)}%` : 'Finalizing...'}
                            </span>
                            <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload />
                            <span className="text-xs font-bold uppercase tracking-widest">
                              {resourceForm.fileUrl ? 'Change PDF' : 'Upload PDF'}
                            </span>
                          </>
                        )}
                      </Button>
                      <input 
                        id="file-upload" 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </div>
                    {resourceForm.fileUrl && (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 size={14} /> File Ready ({resourceForm.fileSize})
                      </p>
                    )}
                  </div>
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
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Computer Science');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        return new Promise<void>((resolve, reject) => {
          const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            },
            (error) => {
              console.error(`Upload error for ${file.name}:`, error);
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
              
              await addDoc(collection(db, 'resources'), {
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                type: 'PDF',
                subject: selectedSubject,
                fileUrl: url,
                fileSize: size,
                visible: true,
                createdAt: serverTimestamp()
              });
              resolve();
            }
          );
        });
      });

      await Promise.all(uploadPromises);
      toast.success(`Successfully imported ${files.length} resources!`);
      onImported();
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      setError('Failed to upload some files. Please try again.');
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

          {files.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="text-indigo-600 flex-shrink-0" size={18} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{f.name}</p>
                      {uploadProgress[f.name] !== undefined && (
                        <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-300" 
                            style={{ width: `${uploadProgress[f.name]}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {!isUploading && (
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-rose-600">
                      <X size={16} />
                    </button>
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
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleBulkUpload} 
              disabled={files.length === 0 || isUploading}
              className="bg-indigo-600 text-white px-8"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Uploading...</span>
                </div>
              ) : `Upload ${files.length} Files`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
