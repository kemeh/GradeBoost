import React, { useState } from 'react';
import { 
  ShieldCheck, Layers, Settings, Plus, ToggleLeft, ToggleRight, Edit, Trash2, Database 
} from 'lucide-react';
import { PracticalActivity } from '../../../types';
import { EQUIPMENT_CATALOG } from './equipmentCatalog';
import { Button, Card } from '../../ui';
import { toast } from 'react-hot-toast';

interface AdminLabManagerProps {
  practicals: PracticalActivity[];
  onSavePractical: (p: Partial<PracticalActivity>) => Promise<void>;
  lang: 'en' | 'fr';
}

export const AdminLabManager: React.FC<AdminLabManagerProps> = ({
  practicals,
  onSavePractical,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'simulations' | 'equipment'>('simulations');

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">3D Laboratory Administration Module</h3>
            <p className="text-xs text-slate-400">Manage 3D simulations, WebGL models, equipment catalog & GCE practical libraries</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulations' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Simulations ({practicals.length})
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'equipment' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Apparatus Catalog ({EQUIPMENT_CATALOG.length})
          </button>
        </div>
      </div>

      {activeTab === 'simulations' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practicals.map((p) => (
            <Card key={p.id} className="p-4 bg-slate-900 border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-sm line-clamp-1">{p.title}</h4>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Active 3D
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800">
                <span>{p.subject}</span>
                <button
                  onClick={() => toast.success(`Simulation configuration updated for ${p.title}`)}
                  className="text-indigo-400 hover:text-white font-bold"
                >
                  Configure
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EQUIPMENT_CATALOG.map((item) => (
            <div key={item.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <h5 className="font-bold text-white">{item.name}</h5>
                <span className="text-[10px] font-mono text-slate-400">{item.subject} • {item.category} • {item.modelType}</span>
              </div>
              <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">3D Ready</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
