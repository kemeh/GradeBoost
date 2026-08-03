import React, { useState, useEffect } from 'react';
import { 
  Compass, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, 
  Save, RefreshCw, Layers, Sparkles, CheckCircle2, Move, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { getNavConfig, saveNavConfig, DEFAULT_NAV_ITEMS } from '../../services/navigationService';
import { NavItem } from '../../types/navigation';
import { Button, Card, Badge, Input } from '../ui';

export default function AdminNavigationManagement() {
  const { language } = useLanguage();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getNavConfig();
      setItems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNavConfig(items);
      toast.success(language === 'fr' ? 'Navigation mise à jour avec succès !' : 'Navigation bar configuration saved successfully!');
    } catch (err) {
      toast.error(language === 'fr' ? 'Erreur lors de la sauvegarde.' : 'Failed to save navigation configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm(language === 'fr' ? 'Réinitialiser la navigation aux paramètres par défaut ?' : 'Reset navigation to system defaults?')) {
      setItems([...DEFAULT_NAV_ITEMS]);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Recalculate order numbers
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setItems(newItems);
  };

  const handleToggleVisibility = (index: number) => {
    const newItems = [...items];
    newItems[index].isVisible = !newItems[index].isVisible;
    setItems(newItems);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Delete this menu item?')) {
      const newItems = items.filter((_, idx) => idx !== index);
      newItems.forEach((item, idx) => {
        item.order = idx + 1;
      });
      setItems(newItems);
    }
  };

  const handleAddNew = () => {
    const newItem: NavItem = {
      id: `nav-custom-${Date.now()}`,
      labelEn: 'New Menu Item',
      labelFr: 'Nouvel Élément',
      href: '/lms',
      megaType: 'none',
      isVisible: true,
      order: items.length + 1,
      allowedRoles: ['public', 'student', 'teacher', 'admin']
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, key: keyof NavItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[key] = value;
    setItems(newItems);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-wider">
        Loading Navigation Builder...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Compass size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {language === 'fr' ? 'Gestionnaire de Navigation Edulpha' : 'Navigation Bar Builder & Extensibility'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'fr' 
                ? 'Gérez les liens, l\'ordre, la visibilité et les mega menus en temps réel.'
                : 'Configure menu items, mega menus, link targets, and role permissions without code changes.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefault}
            className="text-xs font-bold rounded-xl"
          >
            <RefreshCw size={14} className="mr-1.5" /> Reset Default
          </Button>

          <Button
            size="sm"
            onClick={handleAddNew}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            <Plus size={14} className="mr-1.5" /> Add Menu Item
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md"
          >
            <Save size={14} className="mr-1.5" /> {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Menu items list */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <Card key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-700 font-black text-[10px] uppercase">
                    {item.megaType || 'none'}
                  </Badge>

                  {!item.isVisible && (
                    <Badge className="bg-rose-50 text-rose-600 border-rose-200 font-black text-[10px] uppercase">
                      Hidden
                    </Badge>
                  )}
                </div>
              </div>

              {/* Order and visibility controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => handleToggleVisibility(idx)}
                  className={`p-2 rounded-xl transition-colors ${item.isVisible ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400'}`}
                  title="Toggle Visibility"
                >
                  {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  English Label
                </label>
                <Input
                  value={item.labelEn}
                  onChange={(e) => handleUpdateItem(idx, 'labelEn', e.target.value)}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  French Label
                </label>
                <Input
                  value={item.labelFr}
                  onChange={(e) => handleUpdateItem(idx, 'labelFr', e.target.value)}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Target Link (href)
                </label>
                <Input
                  value={item.href}
                  onChange={(e) => handleUpdateItem(idx, 'href', e.target.value)}
                  className="text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Menu Type
                </label>
                <select
                  value={item.megaType || 'none'}
                  onChange={(e) => handleUpdateItem(idx, 'megaType', e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="none">Standard Link</option>
                  <option value="curriculum">Curriculum Mega Menu</option>
                  <option value="subjects">Subjects Mega Menu</option>
                  <option value="custom">Dropdown Menu</option>
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
