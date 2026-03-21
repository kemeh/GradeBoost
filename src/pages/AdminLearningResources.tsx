import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  BookOpen, Save, X, AlertCircle, CheckCircle2
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, 
  doc, onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Button, Card, Badge, cn,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../components/ui';
import { LearningResource } from '../types';
import { toast } from 'react-hot-toast';

export default function AdminLearningResources() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    link: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const q = query(collection(db, 'learning_resources'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LearningResource));
      setResources(resourcesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleOpenDialog = (resource: LearningResource | null = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description,
        topic: resource.topic,
        link: resource.link
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        topic: '',
        link: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.topic || !formData.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingResource) {
        await updateDoc(doc(db, 'learning_resources', editingResource.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success('Resource updated successfully');
      } else {
        await addDoc(collection(db, 'learning_resources'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success('Resource added successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await deleteDoc(doc(db, 'learning_resources', id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Resources</h1>
            <p className="text-slate-500 font-medium">Add and manage learning resources for students.</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Resource
          </Button>
        </header>

        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search resources by title or topic..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 flex flex-col group">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                  {resource.topic}
                </Badge>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenDialog(resource)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">{resource.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100">
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Test Link <ExternalLink size={14} />
                </a>
              </div>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-bold">No resources found matching your search.</p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  placeholder="e.g., Introduction to Python"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Topic *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="e.g., Programming"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Resource Link *</label>
                <input 
                  type="url" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="https://example.com/resource"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-indigo-600 outline-none min-h-[100px]"
                  placeholder="Briefly describe the resource..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="font-black"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black"
              >
                <Save className="mr-2" size={20} />
                {editingResource ? 'Update Resource' : 'Save Resource'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
