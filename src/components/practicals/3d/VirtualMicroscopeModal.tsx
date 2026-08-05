import React from 'react';
import { 
  X, Search, RotateCcw, Sparkles, Sliders, Eye, Droplets, ShieldCheck 
} from 'lucide-react';
import { BiologyState } from './types';
import { Button } from '../../ui';

interface VirtualMicroscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  biologyState: BiologyState;
  setBiologyState: React.Dispatch<React.SetStateAction<BiologyState>>;
  lang: 'en' | 'fr';
}

export const VirtualMicroscopeModal: React.FC<VirtualMicroscopeModalProps> = ({
  isOpen,
  onClose,
  biologyState,
  setBiologyState,
  lang
}) => {
  if (!isOpen) return null;

  // Calculate image blur amount based on coarse focus (ideal focus is at 50)
  const focusDistance = Math.abs(biologyState.coarseFocus - 50);
  const blurPx = Math.min(12, focusDistance * 0.24);

  // Stain color filter overlay
  let stainFilter = 'none';
  if (biologyState.stainApplied === 'iodine') {
    stainFilter = 'sepia(0.8) hue-rotate(340deg) saturate(2.5)'; // Dark amber / brownish orange
  } else if (biologyState.stainApplied === 'methylene_blue') {
    stainFilter = 'hue-rotate(180deg) saturate(2.2)'; // Intense blue
  }

  // Specimen SVGs / High-definition cellular illustrations
  const renderSpecimenImage = () => {
    const power = biologyState.objectivePower;

    switch (biologyState.selectedSpecimen) {
      case 'onion_epidermis':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <rect width="400" height="400" fill="#fef08a" opacity="0.3" />
            {/* Cell Walls Grid */}
            <g stroke="#854d0e" strokeWidth={power >= 40 ? "4" : "2"} fill="none">
              <path d="M 50,0 L 50,400 M 150,0 L 150,400 M 250,0 L 250,400 M 350,0 L 350,400" />
              <path d="M 0,80 L 400,80 M 0,180 L 400,180 M 0,280 L 400,280 M 0,380 L 400,380" />
            </g>
            {/* Cell Nuclei */}
            <g fill={biologyState.stainApplied !== 'none' ? '#b45309' : '#d97706'} opacity="0.85">
              <circle cx="100" cy="40" r={power >= 40 ? "14" : "8"} />
              <circle cx="200" cy="130" r={power >= 40 ? "14" : "8"} />
              <circle cx="300" cy="230" r={power >= 40 ? "14" : "8"} />
              <circle cx="100" cy="330" r={power >= 40 ? "14" : "8"} />
            </g>
          </svg>
        );
      case 'leaf_stomata':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <rect width="400" height="400" fill="#bbf7d0" opacity="0.4" />
            {/* Guard Cells & Stomatal Pore */}
            <g stroke="#166534" strokeWidth="3" fill="#4ade80">
              {/* Stoma 1 */}
              <ellipse cx="150" cy="150" rx="35" ry="55" />
              <ellipse cx="210" cy="150" rx="35" ry="55" />
              <ellipse cx="180" cy="150" rx="6" ry="30" fill="#052e16" />

              {/* Stoma 2 */}
              <ellipse cx="280" cy="280" rx="30" ry="48" />
              <ellipse cx="330" cy="280" rx="30" ry="48" />
              <ellipse cx="305" cy="280" rx="5" ry="25" fill="#052e16" />
            </g>
          </svg>
        );
      case 'human_blood':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <rect width="400" height="400" fill="#fee2e2" />
            {/* Red Blood Cells (Erythrocytes) */}
            <g fill="#f87171" opacity="0.85">
              <circle cx="80" cy="80" r="22" />
              <circle cx="160" cy="60" r="24" />
              <circle cx="240" cy="110" r="20" />
              <circle cx="100" cy="180" r="23" />
              <circle cx="310" cy="200" r="25" />
              <circle cx="180" cy="280" r="22" />
            </g>
            {/* White Blood Cell (Leukocyte) with lobed nucleus */}
            <g fill="#c084fc" stroke="#6b21a8" strokeWidth="2">
              <circle cx="220" cy="190" r="32" fill="#e9d5ff" />
              <path d="M 210,180 Q 220,170 230,185 Q 235,200 215,205 Z" fill="#6b21a8" />
            </g>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <rect width="400" height="400" fill="#cbd5e1" />
            <circle cx="200" cy="200" r="80" fill="#94a3b8" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col md:flex-row gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Eyepiece Viewport */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <h3 className="text-base font-black text-white flex items-center justify-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>Microscope Eyepiece Viewport</span>
            </h3>
            <p className="text-xs text-slate-400">
              Total Magnification: <span className="text-emerald-400 font-bold">{biologyState.objectivePower * 10}x</span>
            </p>
          </div>

          {/* Circular Black Eyepiece Frame */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-slate-950 shadow-inner overflow-hidden relative bg-black flex items-center justify-center">
            {/* Pointer Pin */}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-rose-500/80 -translate-y-full origin-bottom z-10 pointer-events-none" />

            {/* Specimen Slide Image with Focus & Stain Filters */}
            <div
              className="w-full h-full transition-all duration-300"
              style={{
                filter: `blur(${blurPx}px) ${stainFilter}`,
                transform: `scale(${1 + (biologyState.objectivePower / 100) * 0.8})`
              }}
            >
              {renderSpecimenImage()}
            </div>

            {/* In-Focus Indicator */}
            {focusDistance <= 4 && (
              <div className="absolute bottom-4 px-3 py-1 bg-emerald-500/80 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce z-20">
                In Sharp Focus ✓
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="w-full md:w-80 space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Microscope Turret & Focus</span>
          </h4>

          {/* Specimen Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Select Mounted Specimen</label>
            <select
              value={biologyState.selectedSpecimen}
              onChange={(e) => setBiologyState((prev) => ({ ...prev, selectedSpecimen: e.target.value as any }))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="onion_epidermis">Onion Epidermis Cell Wall & Nucleus</option>
              <option value="leaf_stomata">Plant Leaf Stomata & Guard Cells</option>
              <option value="human_blood">Human Blood Smear (RBC & WBC)</option>
            </select>
          </div>

          {/* Objective Lens Turret */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Objective Lens Power</label>
            <div className="grid grid-cols-4 gap-1.5">
              {([4, 10, 40, 100] as const).map((pow) => (
                <button
                  key={pow}
                  onClick={() => setBiologyState((prev) => ({ ...prev, objectivePower: pow }))}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    biologyState.objectivePower === pow
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pow}x
                </button>
              ))}
            </div>
          </div>

          {/* Coarse Focus Knob */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-300">
              <span>Coarse Focus Knob</span>
              <span className="text-emerald-400">{biologyState.coarseFocus}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={biologyState.coarseFocus}
              onChange={(e) => setBiologyState((prev) => ({ ...prev, coarseFocus: parseInt(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Chemical Stain Applicator */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span>Biological Stain Dropper</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                onClick={() => setBiologyState((prev) => ({ ...prev, stainApplied: 'none' }))}
                className={`py-2 rounded-xl border transition-all ${
                  biologyState.stainApplied === 'none'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Unstained
              </button>
              <button
                onClick={() => setBiologyState((prev) => ({ ...prev, stainApplied: 'iodine' }))}
                className={`py-2 rounded-xl border transition-all ${
                  biologyState.stainApplied === 'iodine'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-950 text-amber-400 border-slate-800'
                }`}
              >
                Iodine Solution
              </button>
              <button
                onClick={() => setBiologyState((prev) => ({ ...prev, stainApplied: 'methylene_blue' }))}
                className={`py-2 rounded-xl border transition-all ${
                  biologyState.stainApplied === 'methylene_blue'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-blue-400 border-slate-800'
                }`}
              >
                Methylene Blue
              </button>
            </div>
          </div>

          <Button onClick={onClose} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
            {lang === 'fr' ? 'Fermer le Viseur' : 'Done & Return to Lab'}
          </Button>
        </div>
      </div>
    </div>
  );
};
