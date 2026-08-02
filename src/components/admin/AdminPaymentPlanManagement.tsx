import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Copy, CheckCircle2, XCircle, Eye, EyeOff, 
  Sparkles, Star, Search, Filter, ArrowUpDown, ChevronUp, ChevronDown, 
  History, CreditCard, Shield, Clock, Layers, Save, RefreshCw, AlertTriangle, Check
} from 'lucide-react';
import { Button, Card, Badge, Modal, Input, cn } from '../ui';
import { SubscriptionPlan, PricingHistoryRecord } from '../../types';
import { 
  getSubscriptionPlans, saveSubscriptionPlan, deleteSubscriptionPlan, 
  duplicateSubscriptionPlan, setActivePlan, togglePlanStatus, 
  reorderPlans, getPricingHistory 
} from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminPaymentPlanManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  // State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [history, setHistory] = useState<PricingHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'hidden'>('all');
  const [billingFilter, setBillingFilter] = useState<string>('all');

  // Selection for Bulk Actions
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan>>({});
  const [reasonInput, setReasonInput] = useState('');

  // Delete Confirmation Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Feature Input Helpers for Modal
  const [newFeatureEn, setNewFeatureEn] = useState('');
  const [newFeatureFr, setNewFeatureFr] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPlans, fetchedHistory] = await Promise.all([
        getSubscriptionPlans(true),
        getPricingHistory()
      ]);
      setPlans(fetchedPlans);
      setHistory(fetchedHistory as PricingHistoryRecord[]);
    } catch (err) {
      console.error('Error loading plans:', err);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.nameFr && plan.nameFr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ? true : statusFilter === 'active' ? plan.isActive : !plan.isActive;
      
      const matchesVisibility = 
        visibilityFilter === 'all' ? true : visibilityFilter === 'public' ? plan.visibility !== 'hidden' : plan.visibility === 'hidden';

      const matchesBilling = 
        billingFilter === 'all' ? true : plan.billingCycle === billingFilter;

      return matchesSearch && matchesStatus && matchesVisibility && matchesBilling;
    });
  }, [plans, searchTerm, statusFilter, visibilityFilter, billingFilter]);

  // Bulk Selection Helpers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlanIds(filteredPlans.map((p) => p.id));
    } else {
      setSelectedPlanIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPlanIds((prev) => [...prev, id]);
    } else {
      setSelectedPlanIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Bulk Actions
  const handleBulkActivate = async (activate: boolean) => {
    if (selectedPlanIds.length === 0) return;
    try {
      for (const id of selectedPlanIds) {
        await togglePlanStatus(id, activate);
      }
      toast.success(`${selectedPlanIds.length} plans ${activate ? 'activated' : 'deactivated'}.`);
      setSelectedPlanIds([]);
      loadData();
    } catch (err) {
      toast.error('Bulk update failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlanIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedPlanIds.length} plans?`)) return;
    try {
      for (const id of selectedPlanIds) {
        await deleteSubscriptionPlan(id);
      }
      toast.success(`${selectedPlanIds.length} plans deleted.`);
      setSelectedPlanIds([]);
      loadData();
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  // Open Create Modal
  const handleCreateNewPlan = () => {
    setEditingPlan({
      id: '',
      name: '',
      nameFr: '',
      description: '',
      descriptionFr: '',
      price: 1000,
      currency: 'XAF',
      billingCycle: 'monthly',
      duration: '30 Days',
      maxDevices: 3,
      maxAttempts: 999,
      trialDays: 3,
      isActive: true,
      isRecommended: false,
      isDefault: false,
      badge: '',
      order: plans.length + 1,
      visibility: 'public',
      scheduledDate: '',
      features: [
        'Unlimited mock exams and past papers',
        '24/7 Edulpha AI tutor assistance',
        'Downloadable revision notes'
      ],
      featuresFr: [
        'Examens blancs et épreuves illimités',
        'Assistance tuteur IA Edulpha 24/7',
        'Notes de révision téléchargeables'
      ],
      allowsOfflineDownloads: true,
      allowsCertificates: true,
      allowsPrioritySupport: false
    });
    setReasonInput('');
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setReasonInput('');
    setIsEditModalOpen(true);
  };

  // Save Plan Form Handler
  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan.name || editingPlan.price === undefined) {
      toast.error('Plan name and price are required');
      return;
    }

    setSaving(true);
    try {
      const planToSave: SubscriptionPlan = {
        id: editingPlan.id || `plan_${Date.now()}`,
        name: editingPlan.name,
        nameFr: editingPlan.nameFr || '',
        description: editingPlan.description || '',
        descriptionFr: editingPlan.descriptionFr || '',
        price: Number(editingPlan.price),
        currency: editingPlan.currency || 'XAF',
        billingCycle: editingPlan.billingCycle || 'monthly',
        duration: editingPlan.duration || '30 Days',
        maxDevices: Number(editingPlan.maxDevices || 1),
        maxAttempts: Number(editingPlan.maxAttempts || 999),
        trialDays: Number(editingPlan.trialDays || 0),
        isActive: editingPlan.isActive ?? true,
        isRecommended: Boolean(editingPlan.isRecommended),
        isDefault: Boolean(editingPlan.isDefault),
        badge: editingPlan.badge || '',
        order: Number(editingPlan.order || 1),
        visibility: editingPlan.visibility || 'public',
        scheduledDate: editingPlan.scheduledDate || '',
        features: editingPlan.features || [],
        featuresFr: editingPlan.featuresFr || [],
        allowsOfflineDownloads: Boolean(editingPlan.allowsOfflineDownloads),
        allowsCertificates: Boolean(editingPlan.allowsCertificates),
        allowsPrioritySupport: Boolean(editingPlan.allowsPrioritySupport)
      };

      await saveSubscriptionPlan(
        planToSave, 
        user ? { name: user.name, email: user.email, uid: user.uid } : undefined,
        reasonInput
      );

      toast.success(`Plan "${planToSave.name}" saved successfully!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving plan:', err);
      toast.error('Failed to save payment plan');
    } finally {
      setSaving(false);
    }
  };

  // Duplicate Plan Action
  const handleDuplicate = async (plan: SubscriptionPlan) => {
    try {
      await duplicateSubscriptionPlan(plan);
      toast.success(`Plan duplicated: ${plan.name} (Copy)`);
      loadData();
    } catch (err) {
      toast.error('Failed to duplicate plan');
    }
  };

  // Set Active Plan Action
  const handleMakeActive = async (plan: SubscriptionPlan) => {
    try {
      await setActivePlan(
        plan.id, 
        user ? { name: user.name, email: user.email } : undefined,
        `Set "${plan.name}" as global default active plan`
      );
      toast.success(`"${plan.name}" is now the active/recommended plan across all pages!`);
      loadData();
    } catch (err) {
      toast.error('Failed to activate plan');
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteSubscriptionPlan(deleteTargetId);
      toast.success('Subscription plan deleted.');
      setDeleteTargetId(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  // Reordering controls
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredPlans.length) return;

    const newPlans = [...filteredPlans];
    const temp = newPlans[index];
    newPlans[index] = newPlans[targetIndex];
    newPlans[targetIndex] = temp;

    setPlans(newPlans);
    await reorderPlans(newPlans);
    toast.success('Plan display order updated');
  };

  // Feature Add / Remove Helpers for Form
  const addFeatureEn = () => {
    if (!newFeatureEn.trim()) return;
    setEditingPlan(prev => ({ ...prev, features: [...(prev.features || []), newFeatureEn.trim()] }));
    setNewFeatureEn('');
  };
  const removeFeatureEn = (idx: number) => {
    setEditingPlan(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== idx) }));
  };

  const addFeatureFr = () => {
    if (!newFeatureFr.trim()) return;
    setEditingPlan(prev => ({ ...prev, featuresFr: [...(prev.featuresFr || []), newFeatureFr.trim()] }));
    setNewFeatureFr('');
  };
  const removeFeatureFr = (idx: number) => {
    setEditingPlan(prev => ({ ...prev, featuresFr: (prev.featuresFr || []).filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center gap-2">
        <RefreshCw className="animate-spin" size={20} />
        Loading Payment Plan Management...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={26} />
            Payment Plan Management
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Create, edit, duplicate, activate, and track pricing changes across Edulpha's billing plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('plans')}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
                activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Layers size={14} />
              Plans ({plans.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
                activeTab === 'history' ? 'bg-white text-indigo-600 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <History size={14} />
              Price History ({history.length})
            </button>
          </div>

          <Button onClick={handleCreateNewPlan} className="rounded-xl px-5 py-2.5 font-bold shadow-md">
            <Plus size={18} className="mr-1.5" /> Create New Plan
          </Button>
        </div>
      </div>

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <Card className="p-4 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search plans by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="all">All Visibility</option>
                  <option value="public">Public</option>
                  <option value="hidden">Hidden</option>
                </select>

                <select
                  value={billingFilter}
                  onChange={(e) => setBillingFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="all">All Billing Types</option>
                  <option value="free">Free</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual / Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedPlanIds.length > 0 && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-4 animate-in fade-in">
                <span className="text-xs font-bold text-indigo-900">
                  {selectedPlanIds.length} plan(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkActivate(true)} className="bg-white text-xs font-bold">
                    Activate Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkActivate(false)} className="bg-white text-xs font-bold">
                    Deactivate Selected
                  </Button>
                  <Button size="sm" variant="danger" onClick={handleBulkDelete} className="text-xs font-bold">
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Plans Grid */}
          {filteredPlans.length === 0 ? (
            <Card className="p-12 text-center space-y-4 border border-dashed border-slate-300 rounded-3xl">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No payment plans found</h3>
              <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
                There are no subscription plans matching your filter criteria. Create a new plan or reset search filters.
              </p>
              <Button onClick={handleCreateNewPlan} size="sm" className="rounded-xl px-4">
                <Plus size={16} className="mr-1" /> Create Plan
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan, index) => {
                const isSelected = selectedPlanIds.includes(plan.id);
                return (
                  <Card 
                    key={plan.id}
                    className={cn(
                      'p-6 border rounded-3xl flex flex-col justify-between transition-all relative overflow-hidden group hover:shadow-lg',
                      plan.isRecommended ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/40 via-white to-white' : 'border-slate-200 bg-white'
                    )}
                  >
                    {/* Active Recommended Ribbon */}
                    {plan.isRecommended && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                        <Star size={12} className="fill-white" /> Active Plan
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Card Header & Checkbox */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(plan.id, e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded-xs border-slate-300 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-slate-900 tracking-tight">{plan.name}</h3>
                              {plan.badge && (
                                <Badge variant="secondary" className="text-[10px] font-bold bg-amber-100 text-amber-800 border-amber-200">
                                  {plan.badge}
                                </Badge>
                              )}
                            </div>
                            {plan.nameFr && (
                              <p className="text-xs text-slate-400 font-medium italic">{plan.nameFr}</p>
                            )}
                          </div>
                        </div>

                        {/* Order adjustment buttons */}
                        <div className="flex flex-col items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleMoveOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(index, 'down')}
                            disabled={index === filteredPlans.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Price Display */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">
                            {plan.price.toLocaleString()} {plan.currency}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            / {plan.billingCycle}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {plan.duration && (
                            <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock size={10} /> {plan.duration}
                            </span>
                          )}
                          {plan.maxDevices && (
                            <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {plan.maxDevices} Device(s)
                            </span>
                          )}
                          {plan.visibility === 'hidden' && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <EyeOff size={10} /> Hidden
                            </span>
                          )}
                          {!plan.isActive && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-medium line-clamp-2">
                        {plan.description}
                      </p>

                      {/* Feature Highlights */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Key Features ({plan.features?.length || 0})
                        </span>
                        <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {plan.features?.slice(0, 5).map((feat, fIdx) => (
                            <li key={fIdx} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      {!plan.isRecommended ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMakeActive(plan)}
                          className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl"
                        >
                          <Star size={13} className="mr-1" /> Set as Active
                        </Button>
                      ) : (
                        <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={14} /> Current Active Plan
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicate(plan)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Duplicate Plan"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Edit Plan"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(plan.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PRICE HISTORY TAB */}
      {activeTab === 'history' && (
        <Card className="p-6 border border-slate-200 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Pricing Modification Audit Trail</h3>
              <p className="text-xs text-slate-500 font-medium">
                Log of all price adjustments, active plan updates, and administrator actions.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              No price modifications recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[10px]">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Previous Price</th>
                    <th className="py-3 px-4">New Price</th>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(record.changedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{record.planName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{record.previousPrice} {record.currency}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {record.newPrice} {record.currency}
                      </td>
                      <td className="py-3 px-4">{record.changedBy} ({record.changedByEmail || 'Admin'})</td>
                      <td className="py-3 px-4 text-slate-500 italic">{record.reason || 'General update'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* CREATE / EDIT PLAN MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingPlan.id ? `Edit Plan: ${editingPlan.name}` : 'Create New Subscription Plan'}
        size="lg"
      >
        <form onSubmit={handleSavePlanSubmit} className="space-y-6 pt-2">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Basic Plan Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plan Name (English) *</label>
                <Input
                  required
                  placeholder="e.g., Premium Monthly"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plan Name (French)</label>
                <Input
                  placeholder="e.g., Pass Mensuel Premium"
                  value={editingPlan.nameFr || ''}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, nameFr: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of what students get..."
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description (French)</label>
                <textarea
                  rows={2}
                  placeholder="Résumé en français..."
                  value={editingPlan.descriptionFr || ''}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, descriptionFr: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Billing */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Pricing, Currency & Duration
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Price *</label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={editingPlan.price ?? 1000}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, price: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Currency</label>
                <select
                  value={editingPlan.currency || 'XAF'}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="XAF">FCFA (XAF)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Billing Cycle</label>
                <select
                  value={editingPlan.billingCycle || 'monthly'}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, billingCycle: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="free">Free</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual / Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Duration Label</label>
                <Input
                  placeholder="e.g. 30 Days"
                  value={editingPlan.duration || ''}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Max Allowed Devices</label>
                <Input
                  type="number"
                  min="1"
                  value={editingPlan.maxDevices ?? 3}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, maxDevices: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trial Days</label>
                <Input
                  type="number"
                  min="0"
                  value={editingPlan.trialDays ?? 0}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, trialDays: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Badge Tag</label>
                <Input
                  placeholder="Popular, VIP, Best Value"
                  value={editingPlan.badge || ''}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, badge: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Visibility</label>
                <select
                  value={editingPlan.visibility || 'public'}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, visibility: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="public">Publicly Visible</option>
                  <option value="hidden">Hidden / Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Included Features List */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Included Features (EN & FR)
            </h4>

            {/* English Features */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Features (English)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature in English..."
                  value={newFeatureEn}
                  onChange={(e) => setNewFeatureEn(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeatureEn(); } }}
                />
                <Button type="button" onClick={addFeatureEn} size="sm" className="rounded-xl shrink-0">
                  Add
                </Button>
              </div>
              <ul className="space-y-1">
                {editingPlan.features?.map((feat, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span>{feat}</span>
                    <button type="button" onClick={() => removeFeatureEn(idx)} className="text-slate-400 hover:text-rose-600">
                      <XCircle size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Configuration Flags & Reason */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Active Status & Audit Note
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingPlan.isActive)}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded-xs"
                />
                <span className="text-xs font-bold text-slate-800">Enable / Active Plan</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingPlan.isRecommended)}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, isRecommended: e.target.checked, isDefault: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded-xs"
                />
                <span className="text-xs font-bold text-indigo-900">Set as Active Recommended Plan</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Change / Admin Notes</label>
              <Input
                placeholder="e.g., Annual Back-to-School promo adjustment"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="rounded-xl font-bold px-6">
              <Save size={16} className="mr-1.5" /> Save Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Plan Deletion"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800">
            <AlertTriangle className="shrink-0 text-rose-600" size={24} />
            <p className="text-xs font-medium">
              Are you sure you want to permanently delete this subscription plan? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTargetId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="rounded-xl font-bold">
              Delete Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
