import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Plus, Edit2, Trash2, Globe, Eye, EyeOff, Star, 
  ArrowUp, ArrowDown, ExternalLink, Image, Upload, Search, 
  Filter, Check, X, Tag, Sparkles, Layers, ShieldCheck, Mail, Phone,
  Linkedin, Twitter, Facebook, Youtube, Instagram, RefreshCw, FolderPlus
} from 'lucide-react';
import { Partner, PartnerCategory, PartnershipType, DisplayStatus } from '../../types/partner';
import { PartnerService, DEFAULT_CATEGORIES } from '../../services/partnerService';
import { toast } from 'react-hot-toast';

export const AdminPartnerManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'partners' | 'categories'>('partners');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'fr'>('en');

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [editingCat, setEditingCat] = useState<Partial<PartnerCategory> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, cData] = await Promise.all([
        PartnerService.getPartners(false),
        PartnerService.getCategories()
      ]);
      setPartners(pData);
      setCategories(cData);
    } catch (err) {
      console.error('Error loading partners data:', err);
      toast.error('Failed to load partner records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const nextOrder = partners.length > 0 ? Math.max(...partners.map(p => p.displayOrder)) + 1 : 1;
    setEditingPartner({
      id: 'p-' + Date.now(),
      nameEn: '',
      nameFr: '',
      logoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=300&q=80',
      coverImageUrl: '',
      shortDescEn: '',
      shortDescFr: '',
      fullDescEn: '',
      fullDescFr: '',
      categoryId: categories[0]?.id || 'cat-gov',
      partnershipType: 'Educational',
      startDate: new Date().toISOString().split('T')[0],
      displayStatus: 'active',
      featured: true,
      displayOrder: nextOrder,
      socialLinks: {}
    });
    setActiveLangTab('en');
    setIsEditModalOpen(true);
  };

  const handleEditPartner = (p: Partner) => {
    setEditingPartner({ ...p, socialLinks: { ...p.socialLinks } });
    setActiveLangTab('en');
    setIsEditModalOpen(true);
  };

  const handleSavePartner = async () => {
    if (!editingPartner?.nameEn || !editingPartner?.shortDescEn) {
      toast.error('Please fill in the partner name and short description (English).');
      return;
    }

    try {
      const fullPartner: Partner = {
        id: editingPartner.id || 'p-' + Date.now(),
        nameEn: editingPartner.nameEn || '',
        nameFr: editingPartner.nameFr || editingPartner.nameEn || '',
        logoUrl: editingPartner.logoUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=300&q=80',
        coverImageUrl: editingPartner.coverImageUrl || '',
        shortDescEn: editingPartner.shortDescEn || '',
        shortDescFr: editingPartner.shortDescFr || editingPartner.shortDescEn || '',
        fullDescEn: editingPartner.fullDescEn || '',
        fullDescFr: editingPartner.fullDescFr || editingPartner.fullDescEn || '',
        categoryId: editingPartner.categoryId || categories[0]?.id || 'cat-edu',
        partnershipType: (editingPartner.partnershipType as PartnershipType) || 'Educational',
        startDate: editingPartner.startDate || new Date().toISOString().split('T')[0],
        endDate: editingPartner.endDate || '',
        displayStatus: (editingPartner.displayStatus as DisplayStatus) || 'active',
        featured: !!editingPartner.featured,
        displayOrder: editingPartner.displayOrder || 1,
        contactEmail: editingPartner.contactEmail || '',
        contactPhone: editingPartner.contactPhone || '',
        socialLinks: editingPartner.socialLinks || {},
        createdAt: editingPartner.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await PartnerService.savePartner(fullPartner);
      toast.success(`Partner "${fullPartner.nameEn}" saved successfully!`);
      setIsEditModalOpen(false);
      setEditingPartner(null);
      loadData();
    } catch (e) {
      console.error('Save partner error:', e);
      toast.error('Failed to save partner');
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete partner "${name}"?`)) {
      try {
        await PartnerService.deletePartner(id);
        toast.success(`Partner "${name}" removed`);
        loadData();
      } catch (e) {
        toast.error('Failed to delete partner');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await PartnerService.togglePartnerStatus(id);
      toast.success('Partner visibility updated');
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await PartnerService.togglePartnerFeatured(id);
      toast.success('Partner featured status updated');
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newPartners = [...filteredPartners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPartners.length) return;

    const tempOrder = newPartners[index].displayOrder;
    newPartners[index].displayOrder = newPartners[targetIdx].displayOrder;
    newPartners[targetIdx].displayOrder = tempOrder;

    const orderedIds = partners.map(p => {
      const match = newPartners.find(np => np.id === p.id);
      return match ? match.id : p.id;
    });

    try {
      await PartnerService.reorderPartners(orderedIds);
      toast.success('Display order saved');
      loadData();
    } catch (e) {
      toast.error('Failed to reorder');
    }
  };

  // Image File Upload Helper
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverImageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPartner(prev => prev ? { ...prev, [field]: reader.result as string } : null);
        toast.success('Image loaded for preview!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Category CRUD
  const handleSaveCategory = async () => {
    if (!editingCat?.nameEn || !editingCat?.slug) {
      toast.error('Please enter category name (English) and slug');
      return;
    }
    try {
      const cat: PartnerCategory = {
        id: editingCat.id || 'cat-' + Date.now(),
        nameEn: editingCat.nameEn,
        nameFr: editingCat.nameFr || editingCat.nameEn,
        slug: editingCat.slug.toLowerCase().replace(/\s+/g, '-'),
        description: editingCat.description || '',
        displayOrder: editingCat.displayOrder || categories.length + 1,
        icon: editingCat.icon || 'Building2'
      };
      await PartnerService.saveCategory(cat);
      toast.success(`Category "${cat.nameEn}" saved!`);
      setIsCatModalOpen(false);
      setEditingCat(null);
      loadData();
    } catch (e) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      try {
        await PartnerService.deleteCategory(id);
        toast.success(`Category "${name}" deleted`);
        loadData();
      } catch (e) {
        toast.error('Failed to delete category');
      }
    }
  };

  // Filtered partners
  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.shortDescEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.displayStatus === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const activeCount = partners.filter(p => p.displayStatus === 'active').length;
  const featuredCount = partners.filter(p => p.featured).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-400/30 flex items-center gap-1.5">
              <Sparkles size={14} /> Database-Driven Partner CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Partners & Institutional Alliances Studio
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl font-medium">
            Manage official government ministries, GCE exam boards, corporate sponsors, and EdTech technology alliances dynamically for the landing page.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveSubTab('partners')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeSubTab === 'partners'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Building2 size={16} /> Partners ({partners.length})
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeSubTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Tag size={16} /> Categories ({categories.length})
          </button>

          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Plus size={18} /> Add New Partner
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Partners</div>
          <div className="text-3xl font-black text-slate-900">{partners.length}</div>
          <div className="text-[11px] font-medium text-slate-500">Stored in Database</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active on Homepage</div>
          <div className="text-3xl font-black text-emerald-600">{activeCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Visible to Users</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Partners</div>
          <div className="text-3xl font-black text-amber-500">{featuredCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Highlighted on Top</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Categories</div>
          <div className="text-3xl font-black text-indigo-600">{categories.length}</div>
          <div className="text-[11px] font-medium text-slate-500">Classification Groups</div>
        </div>
      </div>

      {/* Main Content View */}
      {activeSubTab === 'partners' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partner name or description..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Filter size={14} /> Category:
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories ({partners.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                title="Reload from Database"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Partners Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Loading partner records...</div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-slate-900 font-bold">No partners found</div>
              <p className="text-xs text-slate-500">Try adjusting your search filter or add a new partner.</p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                Create Partner Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner, index) => {
                const category = categories.find(c => c.id === partner.categoryId);
                return (
                  <div
                    key={partner.id}
                    className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                      partner.displayStatus === 'active' 
                        ? 'border-slate-200' 
                        : 'border-slate-200 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div>
                      {/* Banner / Header Image */}
                      <div className="relative h-28 bg-gradient-to-r from-slate-900 to-indigo-950 overflow-hidden">
                        {partner.coverImageUrl ? (
                          <img 
                            src={partner.coverImageUrl} 
                            alt={partner.nameEn} 
                            className="w-full h-full object-cover opacity-60"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10 font-black text-4xl">
                            {partner.nameEn.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/10">
                            #{partner.displayOrder} Order
                          </span>
                          {partner.featured && (
                            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                              <Star size={12} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          <button
                            onClick={() => handleMoveOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(index, 'down')}
                            disabled={index === filteredPartners.length - 1}
                            className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-md p-1.5 shrink-0 -mt-10 relative z-10 overflow-hidden flex items-center justify-center">
                            <img 
                              src={partner.logoUrl} 
                              alt={partner.nameEn}
                              className="w-full h-full object-contain rounded-xl"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=300&q=80';
                              }}
                            />
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                              {category?.nameEn || partner.partnershipType}
                            </span>
                            <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-1 mt-0.5">
                              {partner.nameEn}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400 italic">
                              {partner.nameFr}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                          {partner.shortDescEn}
                        </p>

                        {partner.socialLinks.website && (
                          <a
                            href={partner.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            <Globe size={13} /> {partner.socialLinks.website.replace(/^https?:\/\//, '')}
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(partner.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                            partner.displayStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {partner.displayStatus === 'active' ? <Eye size={13} /> : <EyeOff size={13} />}
                          {partner.displayStatus === 'active' ? 'Active' : 'Inactive'}
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(partner.id)}
                          className={`p-1.5 rounded-xl transition ${
                            partner.featured 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                              : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star size={14} fill={partner.featured ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPartner(partner)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id, partner.nameEn)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                          title="Delete Partner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categories Sub-tab */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900">Partner Categories</h3>
              <p className="text-xs text-slate-500 font-medium">Dynamically group partners into educational, government, tech, and corporate categories.</p>
            </div>
            <button
              onClick={() => {
                setEditingCat({
                  id: 'cat-' + Date.now(),
                  nameEn: '',
                  nameFr: '',
                  slug: '',
                  description: '',
                  displayOrder: categories.length + 1,
                  icon: 'Building2'
                });
                setIsCatModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition flex items-center gap-1.5"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const count = partners.filter(p => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl uppercase tracking-wider">
                      {cat.slug}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{count} Partners</span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-base">{cat.nameEn}</h4>
                    <p className="text-xs text-slate-400 italic">{cat.nameFr}</p>
                    {cat.description && (
                      <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{cat.description}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Order: #{cat.displayOrder}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCat({ ...cat });
                          setIsCatModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.nameEn)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Partner Add/Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-20">
                <div className="space-y-1">
                  <h3 className="text-xl font-black">
                    {editingPartner.id?.startsWith('p-') ? 'Add New Platform Partner' : 'Edit Partner Details'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Configure official details, bilingual translations, media URLs, and homepage display settings.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Language Switcher Bar */}
              <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Language Content:</span>
                  <button
                    type="button"
                    onClick={() => setActiveLangTab('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeLangTab === 'en' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700'
                    }`}
                  >
                    🇬🇧 English (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLangTab('fr')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeLangTab === 'fr' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700'
                    }`}
                  >
                    🇫🇷 Français (French)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-600" /> Database Validated
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">1. Core Information</h4>

                  {activeLangTab === 'en' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Partner Name (English) *</label>
                        <input
                          type="text"
                          value={editingPartner.nameEn || ''}
                          onChange={(e) => setEditingPartner({ ...editingPartner, nameEn: e.target.value })}
                          placeholder="e.g. Ministry of Secondary Education (MINESEC)"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (English) *</label>
                        <input
                          type="text"
                          value={editingPartner.shortDescEn || ''}
                          onChange={(e) => setEditingPartner({ ...editingPartner, shortDescEn: e.target.value })}
                          placeholder="Brief 1-sentence overview displayed on partner cards..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Description (English)</label>
                        <textarea
                          rows={3}
                          value={editingPartner.fullDescEn || ''}
                          onChange={(e) => setEditingPartner({ ...editingPartner, fullDescEn: e.target.value })}
                          placeholder="Comprehensive details about the alliance, curriculum alignment, or sponsorship..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Partenaire (Français)</label>
                        <input
                          type="text"
                          value={editingPartner.nameFr || ''}
                          onChange={(e) => setEditingPartner({ ...editingPartner, nameFr: e.target.value })}
                          placeholder="ex. Ministère de l'Enseignement Secondaire (MINESEC)"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Résumé Court (Français)</label>
                        <input
                          type="text"
                          value={editingPartner.shortDescFr || ''}
                          onChange={(e) => setEditingPartner({ ...editingPartner, shortDescFr: e.target.value })}
                          placeholder="Bref aperçu affiché sur les cartes partenaires..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description Complète (Français)</label>
                        <textarea
                          rows={3}
                          value={editingPartner.fullDescFr || ''}
                          onChange={(e) => setEditingPartner({ ...editingPartner, fullDescFr: e.target.value })}
                          placeholder="Détails complets sur l'alliance ou le partenariat..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Categorization & Type */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">2. Category & Partnership Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Partner Category</label>
                      <select
                        value={editingPartner.categoryId || categories[0]?.id}
                        onChange={(e) => setEditingPartner({ ...editingPartner, categoryId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.nameEn} ({c.nameFr})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Partnership Type</label>
                      <select
                        value={editingPartner.partnershipType || 'Educational'}
                        onChange={(e) => setEditingPartner({ ...editingPartner, partnershipType: e.target.value as PartnershipType })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="Educational">Educational</option>
                        <option value="Technology">Technology</option>
                        <option value="Government">Government</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Training">Training</option>
                        <option value="Sponsorship">Sponsorship</option>
                        <option value="Community">Community</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Media & Upload */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">3. Logo & Media Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-700">Partner Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                          <img 
                            src={editingPartner.logoUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=300&q=80'} 
                            alt="Logo preview" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <input
                            type="text"
                            value={editingPartner.logoUrl || ''}
                            onChange={(e) => setEditingPartner({ ...editingPartner, logoUrl: e.target.value })}
                            placeholder="Logo Image URL..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer transition">
                            <Upload size={14} /> Choose File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, 'logoUrl')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-700">Cover Banner Image (Optional)</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-300 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                          {editingPartner.coverImageUrl ? (
                            <img src={editingPartner.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="text-slate-500" size={24} />
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <input
                            type="text"
                            value={editingPartner.coverImageUrl || ''}
                            onChange={(e) => setEditingPartner({ ...editingPartner, coverImageUrl: e.target.value })}
                            placeholder="Cover Image URL..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer transition">
                            <Upload size={14} /> Upload Banner
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, 'coverImageUrl')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display & Position Controls */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">4. Display Controls & Visibility</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Display Status</label>
                      <select
                        value={editingPartner.displayStatus || 'active'}
                        onChange={(e) => setEditingPartner({ ...editingPartner, displayStatus: e.target.value as DisplayStatus })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                        <option value="pending">Pending Approval</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Display Order #</label>
                      <input
                        type="number"
                        min={1}
                        value={editingPartner.displayOrder || 1}
                        onChange={(e) => setEditingPartner({ ...editingPartner, displayOrder: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingPartner.featured}
                          onChange={(e) => setEditingPartner({ ...editingPartner, featured: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Star size={14} className="text-amber-500 fill-amber-500" /> Featured Partner
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Contact & Social Links */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">5. Website & Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Globe size={13} /> Official Website URL
                      </label>
                      <input
                        type="url"
                        value={editingPartner.socialLinks?.website || ''}
                        onChange={(e) => setEditingPartner({
                          ...editingPartner,
                          socialLinks: { ...editingPartner.socialLinks, website: e.target.value }
                        })}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Linkedin size={13} /> LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={editingPartner.socialLinks?.linkedin || ''}
                        onChange={(e) => setEditingPartner({
                          ...editingPartner,
                          socialLinks: { ...editingPartner.socialLinks, linkedin: e.target.value }
                        })}
                        placeholder="https://linkedin.com/company/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-20">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePartner}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Check size={16} /> Save Partner to Database
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {isCatModalOpen && editingCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">
                  {editingCat.id?.startsWith('cat-') ? 'New Category' : 'Edit Category'}
                </h3>
                <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name (English) *</label>
                  <input
                    type="text"
                    value={editingCat.nameEn || ''}
                    onChange={(e) => setEditingCat({ ...editingCat, nameEn: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name (French)</label>
                  <input
                    type="text"
                    value={editingCat.nameFr || ''}
                    onChange={(e) => setEditingCat({ ...editingCat, nameFr: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slug (Identifier) *</label>
                  <input
                    type="text"
                    value={editingCat.slug || ''}
                    onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                    placeholder="e.g. educational"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingCat.description || ''}
                    onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
                >
                  Save Category
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
