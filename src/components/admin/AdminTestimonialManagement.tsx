import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Plus, Edit2, Trash2, Eye, EyeOff, Search, Sparkles, X, Check, Upload, MessageSquare
} from 'lucide-react';
import { Testimonial } from '../../types/testimonial';
import { TestimonialService } from '../../services/testimonialService';
import { toast } from 'react-hot-toast';

export const AdminTestimonialManagement: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await TestimonialService.getTestimonials(false);
      setTestimonials(data);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItem({
      id: 't-' + Date.now(),
      authorName: '',
      roleEn: 'Student',
      roleFr: 'Élève',
      schoolOrOrg: '',
      quoteEn: '',
      quoteFr: '',
      rating: 5,
      avatarUrl: '',
      displayStatus: 'active',
      displayOrder: testimonials.length + 1,
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem?.authorName || !editingItem?.quoteEn) {
      toast.error('Author name and English quote are required');
      return;
    }

    try {
      const item: Testimonial = {
        id: editingItem.id || 't-' + Date.now(),
        authorName: editingItem.authorName,
        roleEn: editingItem.roleEn || 'Student',
        roleFr: editingItem.roleFr || editingItem.roleEn || 'Élève',
        schoolOrOrg: editingItem.schoolOrOrg || '',
        quoteEn: editingItem.quoteEn,
        quoteFr: editingItem.quoteFr || editingItem.quoteEn,
        rating: editingItem.rating || 5,
        avatarUrl: editingItem.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        approvalStatus: editingItem.approvalStatus || 'approved',
        displayStatus: (editingItem.displayStatus as 'active' | 'inactive') || 'active',
        displayOrder: editingItem.displayOrder || 1,
        createdAt: editingItem.createdAt || new Date().toISOString()
      };

      await TestimonialService.saveTestimonial(item);
      toast.success('Testimonial saved!');
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (e) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete testimonial by "${name}"?`)) {
      try {
        await TestimonialService.deleteTestimonial(id);
        toast.success('Testimonial removed');
        loadData();
      } catch (e) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const item = testimonials.find(t => t.id === id);
      if (item) {
        const newStatus = item.approvalStatus === 'approved' ? 'pending' : 'approved';
        await TestimonialService.updateApprovalStatus(id, newStatus);
        toast.success('Visibility toggled');
        loadData();
      }
    } catch (e) {
      toast.error('Failed to toggle status');
    }
  };

  const filtered = testimonials.filter(t => 
    t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.quoteEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.quoteFr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-400/30 flex items-center gap-1.5 w-fit mb-2">
            <Sparkles size={14} /> Student & Educator Testimonials CMS
          </span>
          <h2 className="text-2xl font-black">Testimonials Management</h2>
          <p className="text-xs text-slate-300 font-medium">Manage verified student, teacher, and parent reviews displayed on the landing page.</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading testimonials...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900">No Testimonials Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No testimonials published yet. Real student reviews and success stories from Cameroon and Africa will appear here once added.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
          >
            Create First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      item.displayStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.displayStatus}
                  </button>
                </div>

                <p className="text-xs text-slate-600 italic font-medium">"{item.quoteEn}"</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={item.avatarUrl} alt={item.authorName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{item.authorName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{item.schoolOrOrg || item.roleEn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.authorName)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-black text-slate-900 text-lg">Testimonial Details</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author Name *</label>
                  <input
                    type="text"
                    value={editingItem.authorName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, authorName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. Jean-Paul Etoo"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">School or Organization</label>
                  <input
                    type="text"
                    value={editingItem.schoolOrOrg || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, schoolOrOrg: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. GBHS Douala"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quote (English) *</label>
                  <textarea
                    rows={3}
                    value={editingItem.quoteEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, quoteEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quote (French)</label>
                  <textarea
                    rows={3}
                    value={editingItem.quoteFr || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, quoteFr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rating (1 to 5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editingItem.rating || 5}
                      onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) || 5 })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      value={editingItem.avatarUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, avatarUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700">Save Testimonial</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
