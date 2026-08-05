import React from 'react';
import { 
  RotateCw, Trash2, ArrowUp, ArrowDown, Flame, Droplets, 
  Zap, ToggleLeft, ToggleRight, Play, Pause, Eye, RotateCcw,
  Sliders, ShieldAlert
} from 'lucide-react';
import { 
  AssembledItem, 
  ChemistryState, 
  PhysicsState, 
  BiologyState, 
  LabSubject 
} from './types';
import { EQUIPMENT_CATALOG } from './equipmentCatalog';
import { Button } from '../../ui';

interface InteractiveWorkbenchControlsProps {
  subject: LabSubject;
  assembledItems: AssembledItem[];
  selectedInstanceId: string | null;
  onRemoveInstance: (id: string) => void;
  onUpdatePosition: (id: string, pos: [number, number, number]) => void;
  onUpdateRotation: (id: string, rot: [number, number, number]) => void;
  chemistryState: ChemistryState;
  setChemistryState: React.Dispatch<React.SetStateAction<ChemistryState>>;
  physicsState: PhysicsState;
  setPhysicsState: React.Dispatch<React.SetStateAction<PhysicsState>>;
  biologyState: BiologyState;
  setBiologyState: React.Dispatch<React.SetStateAction<BiologyState>>;
  onOpenMicroscopeModal: () => void;
  lang: 'en' | 'fr';
}

export const InteractiveWorkbenchControls: React.FC<InteractiveWorkbenchControlsProps> = ({
  subject,
  assembledItems,
  selectedInstanceId,
  onRemoveInstance,
  onUpdatePosition,
  onUpdateRotation,
  chemistryState,
  setChemistryState,
  physicsState,
  setPhysicsState,
  biologyState,
  setBiologyState,
  onOpenMicroscopeModal,
  lang
}) => {
  const selectedItem = assembledItems.find((i) => i.instanceId === selectedInstanceId);
  const selectedDef = selectedItem ? EQUIPMENT_CATALOG.find((e) => e.id === selectedItem.equipmentId) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Top Header / Selected Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            {selectedDef 
              ? (lang === 'fr' && selectedDef.nameFr ? selectedDef.nameFr : selectedDef.name)
              : (lang === 'fr' ? 'Commandes de Paillasse 3D' : '3D Workbench Controls')}
          </h4>
        </div>

        {selectedItem && (
          <button
            onClick={() => onRemoveInstance(selectedItem.instanceId)}
            className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>{lang === 'fr' ? 'Retirer' : 'Remove'}</span>
          </button>
        )}
      </div>

      {/* Item Position / Rotation Adjusters */}
      {selectedItem ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">X Position</label>
              <input
                type="range"
                min={-1.8}
                max={1.8}
                step={0.05}
                value={selectedItem.position[0]}
                onChange={(e) => onUpdatePosition(selectedItem.instanceId, [parseFloat(e.target.value), selectedItem.position[1], selectedItem.position[2]])}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Z Position</label>
              <input
                type="range"
                min={-0.8}
                max={0.8}
                step={0.05}
                value={selectedItem.position[2]}
                onChange={(e) => onUpdatePosition(selectedItem.instanceId, [selectedItem.position[0], selectedItem.position[1], parseFloat(e.target.value)])}
                className="w-full accent-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateRotation(selectedItem.instanceId, [selectedItem.rotation[0], selectedItem.rotation[1] + Math.PI / 4, selectedItem.rotation[2]])}
              className="text-[11px] py-1 h-8 flex-1 border-slate-700"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1" />
              <span>{lang === 'fr' ? 'Pivoter +45°' : 'Rotate +45°'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          {lang === 'fr'
            ? 'Cliquez sur un matériel 3D dans le laboratoire pour le déplacer ou le configurer.'
            : 'Click any 3D apparatus in the laboratory canvas to adjust position or interact.'}
        </p>
      )}

      {/* SUBJECT-SPECIFIC ACTION CONTROLS */}
      {subject === 'Chemistry' && (
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block">
            {lang === 'fr' ? 'Actions Réactionnelles Chimie' : 'Chemistry Reaction Actions'}
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Titration Burette Tap Toggle */}
            <button
              onClick={() => setChemistryState((prev) => ({ ...prev, isTapOpen: !prev.isTapOpen }))}
              className={`p-2.5 rounded-xl border transition-all font-bold flex items-center justify-center gap-2 ${
                chemistryState.isTapOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Droplets className="w-4 h-4 text-amber-400" />
              <span>
                {chemistryState.isTapOpen
                  ? (lang === 'fr' ? 'Fermer Robinet' : 'Close Burette Tap')
                  : (lang === 'fr' ? 'Ouvrir Robinet (Goutte)' : 'Open Burette Tap')}
              </span>
            </button>

            {/* Indicator Select */}
            <select
              value={chemistryState.indicator}
              onChange={(e) => setChemistryState((prev) => ({ ...prev, indicator: e.target.value as any }))}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="none">No Indicator</option>
              <option value="phenolphthalein">Phenolphthalein</option>
              <option value="methyl_orange">Methyl Orange</option>
              <option value="universal">Universal Indicator</option>
            </select>

            {/* Bunsen Burner Flame Toggle */}
            <button
              onClick={() => setChemistryState((prev) => ({ ...prev, isBunsenLit: !prev.isBunsenLit }))}
              className={`p-2.5 rounded-xl border transition-all font-bold flex items-center justify-center gap-2 ${
                chemistryState.isBunsenLit
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>
                {chemistryState.isBunsenLit
                  ? (lang === 'fr' ? 'Éteindre Bec Bunsen' : 'Extinguish Bunsen')
                  : (lang === 'fr' ? 'Allumer Bec Bunsen' : 'Light Bunsen Burner')}
              </span>
            </button>

            {/* Refill Burette */}
            <button
              onClick={() => setChemistryState((prev) => ({ ...prev, buretteAddedVolume: 0, ph: 13.0 }))}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Remplir Burette' : 'Refill Burette'}</span>
            </button>
          </div>
        </div>
      )}

      {subject === 'Physics' && (
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 block">
            {lang === 'fr' ? 'Contrôles Électricité & Pendule' : 'Physics Circuit & Mechanics'}
          </span>

          <div className="space-y-2 text-xs">
            {/* Knife Switch Toggle */}
            <button
              onClick={() => setPhysicsState((prev) => ({ ...prev, isSwitchClosed: !prev.isSwitchClosed }))}
              className={`w-full p-2.5 rounded-xl border transition-all font-bold flex items-center justify-center gap-2 ${
                physicsState.isSwitchClosed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                {physicsState.isSwitchClosed
                  ? (lang === 'fr' ? 'Ouvrir Interrupteur' : 'Open Circuit Switch')
                  : (lang === 'fr' ? 'Fermer Interrupteur (Circuit ON)' : 'Close Circuit Switch (ON)')}
              </span>
            </button>

            {/* DC Voltage Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>DC Voltage Output</span>
                <span className="text-sky-400">{physicsState.voltageInput.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={physicsState.voltageInput}
                onChange={(e) => setPhysicsState((prev) => ({ ...prev, voltageInput: parseFloat(e.target.value) }))}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Pendulum Release Oscillations */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setPhysicsState((prev) => ({ ...prev, isPendulumSwinging: !prev.isPendulumSwinging }))}
                className="flex-1 p-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {physicsState.isPendulumSwinging ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{physicsState.isPendulumSwinging ? 'Pause Pendulum' : 'Release Pendulum'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {subject === 'Biology' && (
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block">
            {lang === 'fr' ? 'Commandes Microscope & Lame' : 'Microscope & Slide Controls'}
          </span>

          <button
            onClick={onOpenMicroscopeModal}
            className="w-full p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Ouvrir le Microscope 3D' : 'Open 3D Virtual Microscope View'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
