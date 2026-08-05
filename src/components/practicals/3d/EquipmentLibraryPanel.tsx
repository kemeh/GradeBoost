import React, { useState } from 'react';
import { 
  Search, Plus, Sparkles, AlertTriangle, ShieldCheck, 
  FlaskConical, Gauge, Search as SearchIcon, Layers, Info
} from 'lucide-react';
import { EQUIPMENT_CATALOG } from './equipmentCatalog';
import { EquipmentCategory, EquipmentItem, LabSubject } from './types';
import { Button } from '../../ui';

interface EquipmentLibraryPanelProps {
  subject: LabSubject;
  onAddEquipment: (item: EquipmentItem) => void;
  lang: 'en' | 'fr';
}

export const EquipmentLibraryPanel: React.FC<EquipmentLibraryPanelProps> = ({
  subject,
  onAddEquipment,
  lang
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<LabSubject>(subject);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEquipment = EQUIPMENT_CATALOG.filter((item) => {
    const matchesSubject = selectedSubjectFilter === item.subject;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const nameStr = lang === 'fr' && item.nameFr ? item.nameFr : item.name;
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: lang === 'fr' ? 'Tous' : 'All' },
    { id: 'glassware', label: lang === 'fr' ? 'Verrerie' : 'Glassware' },
    { id: 'reagents', label: lang === 'fr' ? 'Réactifs' : 'Reagents' },
    { id: 'measuring', label: lang === 'fr' ? 'Mesures' : 'Measuring' },
    { id: 'heating', label: lang === 'fr' ? 'Chauffage' : 'Heating' },
    { id: 'support', label: lang === 'fr' ? 'Supports' : 'Supports' },
    { id: 'electrical', label: lang === 'fr' ? 'Électricité' : 'Electrical' },
    { id: 'optical', label: lang === 'fr' ? 'Optique' : 'Optical' },
    { id: 'mechanics', label: lang === 'fr' ? 'Mécanique' : 'Mechanics' },
    { id: 'biological', label: lang === 'fr' ? 'Biologie' : 'Biological' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {lang === 'fr' ? 'Bibliothèque d\'Appareils 3D' : 'Apparatus Library'}
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {filteredEquipment.length} {lang === 'fr' ? 'Éléments' : 'Items'}
        </span>
      </div>

      {/* Subject Filter Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl mb-3 text-xs font-bold">
        {(['Chemistry', 'Physics', 'Biology'] as LabSubject[]).map((subj) => (
          <button
            key={subj}
            onClick={() => setSelectedSubjectFilter(subj)}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              selectedSubjectFilter === subj
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'fr' ? 'Rechercher un matériel...' : 'Search apparatus...'}
          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-slate-700">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-700 text-white'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredEquipment.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-medium">
            {lang === 'fr' ? 'Aucun matériel trouvé' : 'No equipment found'}
          </div>
        ) : (
          filteredEquipment.map((item) => {
            const name = lang === 'fr' && item.nameFr ? item.nameFr : item.name;
            const desc = lang === 'fr' && item.descriptionFr ? item.descriptionFr : item.description;
            const warning = lang === 'fr' && item.safetyWarningFr ? item.safetyWarningFr : item.safetyWarning;

            return (
              <div
                key={item.id}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all group flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {name}
                    </h4>
                    <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddEquipment(item)}
                    className="p-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-lg transition-all shrink-0 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Ajouter' : 'Add'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {desc}
                </p>

                {warning && (
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                    <AlertTriangle className="w-3 h-3 shrink-0 text-amber-400" />
                    <span className="truncate">{warning}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
